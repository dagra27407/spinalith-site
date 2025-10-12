// supabase/functions/ef_step_assistant_PrepJSON.ts/runProcess.ts
//Last Modified 07/10/2025
/**
 * 🔹 Airtable Automation Script - [Script Name]
 * 
 * @description
 * This script pulls data from Airtable based on a linked narrativeProjectID and generates structured JSON.
 * The result is written to a specified field in the triggering record.
 *
 * @inputs
 * - Triggered by a record in `WF_Scene_ConceptCreation`.
 *
 * @outputs
 * - JSON object written to the `GPT_Response` field.
 *
 * @dependencies
 * - Expects linked Narrative Project via `narrativeProjectID`.
 * - Requires mapping definitions in `fieldMapLibrary`.
 */

/* Modification Hisotory
 * - 06/06/2025 - Implemented json normalization data set schema to decouple from airtable setup
 * - 07/10/2025 - Re-factored code to work within Edge Function environment
 */

//GLOBAL VARIABLES
//Set headers for calls to this function
const corsHeaders = {
"Access-Control-Allow-Origin": "*",
"Access-Control-Allow-Methods": "POST, GET, OPTIONS",
"Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const jsonHeaders = {
...corsHeaders,
"Content-Type": "application/json"
};

let efStartTime = Date.now();

/**
 * 🧠 runProcess
 *
 * Executes a unified assistant preparation pipeline based on the provided mode.
 * Dynamically loads, filters, and transforms data based on a structured field map,
 * compiles output JSON, and performs a final result-handling step based on the selected mode.
 *
 * Supported Modes:
 * - `"pipeline"`: Standard assistant workflow controlled by `wf_assistant_automation_control`
 *                record and linked `script_mapping_json_payload`. Final result is pushed to DB
 *                and routed to next step.
 * 
 * Planned/Expandable Modes:
 * - `"test"`: For standalone output return (skips DB write and routing)
 * - `"export"`: For future raw JSON export features
 *
 * @async
 * @function
 * @param {object} supabase - Supabase client instance used for DB operations
 * @param {object} user - User context/session object for permission-aware actions
 * @param {object} body - Request body containing runtime parameters, including:
 *    @param {string} body.mode - The execution mode to run under (e.g., "pipeline", "test", "export")
 *    @param {string} body.request_id - The ID of the wf_assistant_automation_control record
 * @param {string} token - Auth token used for downstream edge function calls (e.g., router)
 * @param {Date} startTime - Timestamp captured at function entry to calculate EF run duration
 * 
 * @returns {Promise<Response>} A standardized HTTP Response object containing:
 * - `success` (boolean): Whether the run completed successfully
 * - `message` (string): Summary of outcome or error
 * - `data` (object): The generated JSON payload (if applicable for mode)
 * - `status` (number): HTTP status code
 * - `headers` (object): Standardized JSON headers
 *
 * @throws Errors are handled and returned using `buildEFResponse`; this function does not throw directly
 */

export async function runProcess(supabase: any, user: any, body: any, token: string, startTime: Date) {
  console.log("jsonHeaders available?", jsonHeaders);
  efStartTime = startTime;

  // extract passed body parameters
  const { mode, request_id, bodyfieldMapLibrary, bodyNarrativeProjectID } = body; //Get passed values from body
  
  console.log(`runProcess received request_id: ${request_id}`);
  console.log(`runProcess received request_id: ${body}`);

  /*******************************************************************************
 * Variable Declaration and obtain primary data sources
 * Expects as a paramater
 * -request_id of the wf_assistant_automation_control record
 *******************************************************************************/

// ** Get wf_record and needed data **
let wf_table = "wf_assistant_automation_control";
// ✅ Output configuration
const dataFlowConfig = {
    outputTable: wf_table,    // Table where JSON will be written
    outputField: "gpt_json"           // Field to write JSON to
};
let tableOutput = dataFlowConfig.outputTable;

let narrativeProjectID;
let fieldMapLibrary;
switch (mode) {
  case "pipeline":
    const assistantPipelineData = await pullDataForAssistantPipelineMode(supabase, user, request_id, wf_table);

    narrativeProjectID = assistantPipelineData.narrativeProjectID;
    fieldMapLibrary = assistantPipelineData.fieldMapLibrary;
    break;

  case "manual":
    narrativeProjectID = bodyNarrativeProjectID;
    fieldMapLibrary = bodyfieldMapLibrary;
    break;

  default:
    return buildEFResponse({
      success: false,
      message: `Mode '${mode}' not supported`,
      status: 400,
      headers: jsonHeaders
    });
}




// ** Load Base Tables ** Using baseTableMap create a json instance of each table listed as a globalThis
await loadAllBaseTables(supabase, user, fieldMapLibrary.baseTableMap, narrativeProjectID);


// ** Determine Episode Key ** whether we're using "episodes" or "chapters" in the narrativeHeader JSON output
determineEpisodeKey(fieldMapLibrary);


// ** Define sort by options ** 
const sortRegistry = {
  byArcID: (a, b) => (a.arcID ?? 0) - (b.arcID ?? 0),
  byBeatID: (a, b) => (a.beatID ?? 0) - (b.beatID ?? 0),
  byChapterNumber: (a, b) => (a.chapterNumber ?? 0) - (b.chapterNumber ?? 0),
  byCharacterName: (a, b) => (a.characterName ?? "").localeCompare(b.characterName ?? ""),
  byCD_ID: (a, b) => (a.CD_ID ?? "").localeCompare(b.CD_ID ?? ""),
  byItemName: (a, b) => (a.itemName ?? "").localeCompare(b.itemName ?? ""),
  byAbilityID: (a, b) => (a.abilityID ?? 0) - (b.abilityID ?? 0),
  byMomentOrder: (a, b) => (a.momentOrder ?? 0) - (b.momentOrder ?? 0),
  byID: (a, b) => (a.ID ?? 0) - (b.ID ?? 0),
  bySceneNumber: (a, b) => (a.sceneNumber ?? 0) - (b.sceneNumber ?? 0)
};


// Build all filtered recordsets defined in fieldMapLibrary.filterMap
if (fieldMapLibrary.filterMap) {
  buildFilteredRecordsFromMap(fieldMapLibrary.filterMap);
}

/*******************************************************************************
 * 🔁 Primary Workflow
 *******************************************************************************/

// Compile final jsonOutput segments included in fieldMapLibrary.jsonOutputMap
//    jsonOutput is dynamically created inserting the segments listed in the mapping
let jsonOutput = {};


// make sure tags are available
globalThis.mod_tags = Array.isArray(globalThis?.NarrativeProjectData?.[0]?.mod_tags)
  ? globalThis.NarrativeProjectData[0].mod_tags
  : [];

//Loop through fieldMapLibrary.jsonOutputMap and create all sections outlined
for (const sectionKey of Object.keys(fieldMapLibrary.jsonOutputMap)) {
  const control = fieldMapLibrary.jsonOutputMap[sectionKey];

  //If section flagged as conditional check if mod_tag is present on project(skip section if tag not present)
  if (control?.conditional === true) {
    const tags = globalThis.mod_tags as string[];
    const needed = control.conditionValue; // string or string[]

    const include =
      typeof needed === "string"
        ? tags.includes(needed)
        : Array.isArray(needed)
          ? needed.some(t => tags.includes(t)) // any-of
          : false; // require a conditionValue when conditional=true

    if (!include) continue;  //Skip to next item in loop if section condition not met
  }

  //Add section to output JSON
  const builtSection = buildOutputSection(sectionKey, fieldMapLibrary);
  if (builtSection !== null) jsonOutput[sectionKey] = builtSection;
}


//console.log("batchingData: ", fieldMapLibrary.batchingMap);
// Create batchData information
let batchData = { success: true, data: "exclude" }; // Safe default
console.log("batchData1: ", batchData);
if (fieldMapLibrary.batchingMap){
   batchData = generateBatchDataFromMap(fieldMapLibrary.batchingMap);
   console.log("batchData2: ", batchData);
};


     //Handle Error response if batchData failed
  if(!batchData.success){
    return buildEFResponse({
      success: batchData.success,
      message: batchData.error,
      data: {},
      status: 400,
      headers: jsonHeaders
      })} 
      console.log("batchData3: ", batchData);
      if(batchData.data !== "exclude") {
        // Insert batch data into payload
        jsonOutput["batchData"] = batchData.data; 
      }

// Convert to JSON string and log it
let jsonString = JSON.stringify(jsonOutput, null, 2);
console.log(` jsonOutput=  ${jsonString}.`);


switch (mode) {
  case "pipeline":
    return await handlePipelineOutput({
      supabase,
      user,
      request_id,
      jsonString,
      jsonOutput,
      outputTable: tableOutput,        // from dataFlowConfig
      outputField: dataFlowConfig.outputField,
      token,
      headers: jsonHeaders             // or omit if you want default
    });
  break;

  case "manual":
    return buildEFResponse({
      success: true,
      message: "Completed Successfully",
      data: jsonOutput,
      status: 200,
      headers: jsonHeaders,
    });
  break;

  default:
    return buildEFResponse({
      success: false,
      message: `Mode '${mode}' not supported`,
      status: 400,
      headers: jsonHeaders
    });
}



} //End of runProcess

/*******************************************************************************
 * 🛠️ UTIL Function Definitions
 *******************************************************************************/

/**
 * generateBatchDataFromMap
 * 🔧 Generates a `batchData` object for use in assistant payloads.
 * 
 * Supports three batching modes:
 * - "noBatching": returns `{ success: true, data: "exclude" }` to signal no batching
 * - "dataDriven": builds batchData based on the length of a globalThis dataset
 * - "outputControlled": uses only per-batch size, letting the assistant manage output
 *
 * @param {Object} batchingMap - A map of assistantName => batching configuration object.
 * @param {string} [batchingMap.mode] - "dataDriven" | "outputControlled" | "noBatching"
 * @param {string} [batchingMap.source] - Name of the globalThis variable to measure (if using dataDriven)
 * @param {string} [batchingMap.totalKey] - Key name for total item count (e.g., "totalChapters")
 * @param {string} [batchingMap.perBatchKey] - Key name for batch size (e.g., "chaptersPerBatch")
 * @param {number} [batchingMap.perBatchDefault] - Default number of items per batch
 *
 * @returns {Object} A standard result object:
 * - On success: `{ success: true, data: object | string }`
 * - On error:   `{ success: false, error: string }`
 *
 * Example success return:
 * {
 *   success: true,
 *   data: {
 *     totalChapters: 27,
 *     chaptersPerBatch: 5,
 *     expectedBatches: 6
 *   }
 * }
 *
 * Example noBatching return:
 * {
 *   success: true,
 *   data: "exclude"
 * }
 *
 * Example failure return:
 * {
 *   success: false,
 *   error: "globalThis[ChaptersData] is not an array or doesn't exist"
 * }
 */
function generateBatchDataFromMap(batchingMap) {

  // Destructure values from batchingMap with fallback defaults
  const {
    mode,      // Default mode is data-driven
    source,                   // Dataset name in globalThis (e.g., "ChaptersData")
    totalKey,                 // Name of the key used in the output for total items (e.g., "totalChapters")
    perBatchKey,              // Name of the key used for per-batch size (e.g., "chaptersPerBatch")
    perBatchDefault           // Default batch size if nothing overrides
  } = batchingMap;

  // Use the default perBatch size; you can enhance this to check for overrides
  const perBatch = perBatchDefault;
  // N) BATCHING MODE: Automattically returns null
  if (mode === "noBatching"){
    return{success: true, data: "exclude"};
  };

  // DATA-DRIVEN MODE: Compute based on array length of provided source
  if (mode === "dataDriven") {
    const dataArray = globalThis[source];
    if (!Array.isArray(dataArray)) {
      console.warn(`globalThis[${source}] is not an array or doesn't exist`);
      //Error
      return {success: false, error: `globalThis[${source}] is not an array or doesn't exist` };
    }

    const total = dataArray.length;

    return {
      success: true,
      data: {
        [totalKey]: total,
        [perBatchKey]: perBatch,
        expectedBatches: Math.ceil(total / perBatch)
      }
    };
  };

  // OUTPUT-CONTROLLED MODE: Only include per-batch value, assistant will count output
  if (mode === "outputControlled") {
    return {
      success: true,
      data: {[perBatchKey]: perBatch}
    };
  };

  // Fail-safe: Unrecognized mode
  console.warn(`Unrecognized batching mode: ${mode}`);
  return { success: false, error: `Unrecognized batching mode: ${mode}`};
} // END OF generateBatchDataFromMap



/**
 * updateTextField
 * Updates a single text field (e.g., status) on a record in the given Supabase table.
 *
 * @param {Object} input
 * @param {string} input.tableName - Supabase table name.
 * @param {string} input.table_id - UUID of the record to update.
 * @param {string} input.fieldName - Column name to update.
 * @param {string} input.udatedValue - New value to set.
 * @returns {Object} - { success: true } or { success: false, error: string }
 */
async function updateTextField({
  supabase,
  user,
  table_id,
  tableName,
  fieldName,
  udatedValue
}: {
  supabase: any;
  user: any;
  table_id: string;
  tableName: string;
  fieldName: string;
  udatedValue: string;
}): Promise<{ success: boolean; error?: string }> {

  const { data, error } = await supabase
    .from(tableName)
    .update({ [fieldName]: udatedValue })
    .eq("id", table_id);

  if (error) {
    console.error("❌ Failed to update field:", {
      message: error?.message,
      full: JSON.stringify(error),
    });
    return {
      success: false,
      error: `Failed to update ${fieldName} on ${tableName}: ${error.message}`
    };
  }

  console.log(`✅ Updated ${fieldName} of ${tableName} to "${udatedValue}" for ID ${table_id}`);
  return { success: true };
}




/**
 * callEdgeFunction – Utility to call a Supabase Edge Function via POST
 *
 * @param {string} efName - The name of the Edge Function to call (without full URL).
 * @param {Object} payload - The JSON object to send as the body of the POST request.
 * @param {HeadersInit} [headers={}] - Optional headers for the request. Defaults to JSON content type.
 * @returns {Promise<any>} - The parsed JSON response from the Edge Function, or error object if failed.
 */
export async function callEdgeFunction(
  efName: string,
  payload: Record<string, any>,
  token
): Promise<any> {
  try {
    // Construct the full URL using the project-wide EDGE_FUNCTIONS_URL (set in secrets .env)
    const url = `${Deno.env.get("EDGE_FUNCTIONS_URL")}/${efName}`;

  // Build Headers
  let headers: HeadersInit = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };


    // Make the POST request to the Edge Function with payload and headers
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });

    // If request is successful (status code 200–299), parse and return the response
    if (response.ok) {
      return await response.json();
    }

    // If not successful, capture status and error text
    const errorText = await response.text();
    console.error(`Edge Function POST failed [${response.status}]:`, errorText);
    return {
      success: false,
      error: `Edge Function POST failed: ${errorText}`,
      status: response.status
    };

  } catch (err: any) {
    // If fetch throws due to network issues or other reasons
    console.error("Edge Function POST error:", err.message || err);
    return {
      success: false,
      error: err.message || "Unknown error"
    };
  }
} //END OF callEdgeFunction



/**
 * Fetches a single record from a Supabase table using a unique key field.
 *
 * Designed to be reusable across any table where a record can be uniquely identified
 * by a single key (e.g. id, request_key, assistant_name, etc).
 *
 * @param {Object} params
 * @param {any} params.supabase - The Supabase client instance.
 * @param {any} params.user - The authenticated Supabase user (unused here but reserved for future RLS logic).
 * @param {string} params.tableName - The name of the table to query.
 * @param {string} params.keyField - The unique key field to filter by (e.g., 'id' or 'assistant_name').
 * @param {string} params.request_key - The value to match in the keyField.
 * @returns {Promise<{ returned_record: any } | Response>} The matched record, or a Response object if not found or error occurs.
 */
async function fetchSingleRecord({
  supabase,
  user,
  tableName,
  keyField,
  request_key,
}: {
  supabase: any;
  user: any;
  tableName: string;
  keyField: string;
  request_key: string;
}) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .eq(keyField, request_key)
      .single();

    if (error || !data) {
      console.error(`${tableName}: Failed to fetch record with ${keyField}=${request_key}`, error);
      return {
        success: false,
        error: `${tableName}: Record not found using ${keyField} = ${request_key}`,
        status: 404
      };
    }

    return {
      success: true,
      data
    };

  } catch (error: any) {
    console.error(`${tableName}: Unexpected error during fetchSingleRecord:`, error);
    return {
      success: false,
      error: `${tableName}: Unexpected error: ${error.message}`,
      status: 500
    };
  }
} // END OF fetchSingleRecord



/**
 * determineEpisodeKey
 * Determines whether to use "chapterCount" or "episodeCount" in the final JSON output,
 * based on the NarrativeProjectData and assistant field mapping.
 * If needed, it dynamically adds the correct field to the narrativeHeader sectionMap.
 *
 * @param {Object} fieldMapLibrary - The assistant’s parsed field mapping (mutated if override applies)
 */
function determineEpisodeKey(fieldMapLibrary) {
  const narrativeData = globalThis?.NarrativeProjectData?.[0] ?? {};

  // ✅ Decide between chapter or episode
  const mode = narrativeData?.EpisodeOrChapter?.name;
  const episodeKey = mode === "Chapter" ? "chapterCount" : "episodeCount";
  globalThis.episodeKey = episodeKey;

  // ✅ Determine if hard limit is enabled
  let includeEpisodeKey = narrativeData?.["Hard Chapter Limit"] === true;

  // ✅ OR check if assistant mapping includes soft-limit trigger
  const hasSoftLimitFlag =
    fieldMapLibrary?.sectionMaps?.narrativeHeader?.hard_chapter_limit?.field;
  if (hasSoftLimitFlag) includeEpisodeKey = true;

  globalThis.includeEpisodeKey = includeEpisodeKey;

  // 🧬 Inject episodeKey into mapping if needed
  if (includeEpisodeKey) {
    const headerMap = fieldMapLibrary.sectionMaps?.narrativeHeader;

    if (headerMap) {
      // Remove soft-limit marker if present
      delete headerMap.hard_chapter_limit;

      // Add actual episode/chapter field
      headerMap[episodeKey] = {
        field: "episode_chapter_count",
        fieldType: "text"
      };
    }
  }
} //END OF determineEpisodeKey


/**
 * loadAllBaseTables
 * 📥 Loads all mapped base tables from Supabase into globalThis using baseTableMap.
 *
 * Each entry in baseTableMap defines:
 * - `table_name`: the Supabase table to load
 * - `filter_by`: an array of field names to apply a shared `defaultFilter` to
 *
 * If `filter_by` is empty or omitted, no filtering is applied.
 * Results are stored in globalThis under the alias key (from baseTableMap).
 *
 * @async
 * @function
 * @param {any} supabase - Supabase client instance
 * @param {any} user - Authenticated user (optional, for logging/debugging)
 * @param {Object} baseTableMap - Keyed by alias, values with table_name and optional filter_by array
 * @param {string} defaultFilter - The default value to filter by for all applicable filter fields
 * @returns {Promise<void>}
 */
async function loadAllBaseTables(supabase, user, baseTableMap, defaultFilter) {
  for (const [alias, config] of Object.entries(baseTableMap)) {
    try {
      let query = supabase.from(config.table_name).select("*");

      // Apply default filter to each field listed in filter_by[]
      if (Array.isArray(config.filter_by) && config.filter_by.length > 0) {
        for (const field of config.filter_by) {
          query = query.eq(field, defaultFilter);
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      globalThis[alias] = data;
    } catch (err) {
      console.error(`❌ Failed to load ${alias}: ${err.message}`);
      globalThis[alias] = [];
    }
  }
} // END OF loadAllBaseTables




/**
 * buildFilteredRecordsFromMap
 * Filters normalized globalThis datasets using rules defined in a filterMap object.
 * Each filterMap entry defines:
 *  - source: the normalized dataset key in globalThis
 *  - target: the name to assign the filtered subset to
 *  - filterBy.field: the field to evaluate
 *  - filterBy.matchTo: a direct value, array, or pointer to another dataset/field
 * 
 * @param {Object} filterMap - A keyed object defining how to filter one or more datasets.
 */
function buildFilteredRecordsFromMap(filterMap) {
  for (const [filterKey, filter] of Object.entries(filterMap)) {
    const sourceArray = globalThis[filter.source] ?? [];

    // 🔍 Determine the list of values to match against
    let matchValues = [];
    let matchTo = filter.filterBy?.matchTo;

    // for mappings pointing to {{fucusRecordID}} use the value pulled from sourceRecordData
    if (matchTo === "{{focusRecordID}}") {
      matchTo = globalThis.focusRecordID;
    }


    if (Array.isArray(matchTo)) {
      // ✅ Direct list of values
      matchValues = matchTo;
      //console.log(`🔎 [${filterKey}] Using array matchTo:`, matchValues);

    } else if (
      typeof matchTo === "object" &&
      matchTo !== null &&
      matchTo.source &&
      matchTo.field
    ) {
      // ✅ Pull values from another dataset (dynamic match)
      const sourceRecords = globalThis[matchTo.source] ?? [];
      matchValues = sourceRecords
        .map(rec => rec[matchTo.field])
        .flat()
        .map(val => typeof val === "object" && val !== null ? val.name : val)
        .filter(Boolean);
      //console.log(`🔎 [${filterKey}] Using dynamic matchTo:`, matchValues);


    } else if (typeof matchTo === "string" || typeof matchTo === "number") {
      // ✅ Single static value
      matchValues = [matchTo];
      //console.log(`🔎 [${filterKey}] Using single matchTo:`, matchValues);

    } else {
      console.warn(`⚠️ Unsupported matchTo format for filter "${filterKey}"`);
      return;
    }

    // 🔄 Normalize all match values once for consistent comparison
    const matchValueSet = new Set(matchValues.map(v => String(v)));

    // 🔍 Perform the actual filtering
    const filteredRecords = sourceArray.filter(record => {
      const fieldValue = record[filter.filterBy.field];

      if (Array.isArray(fieldValue)) {
        // Handle arrays like linked records
        const normalizedValues = fieldValue
          .map(val => (typeof val === "object" ? String(val?.name) : String(val)))
          .filter(Boolean);
        return normalizedValues.some(val => matchValueSet.has(val));

      } else {
        // Handle singular field values
        const value = typeof fieldValue === "object" && fieldValue !== null
          ? String(fieldValue?.name)
          : String(fieldValue);
        return matchValueSet.has(value);
      }
    });

    // 💾 Store the filtered set
    globalThis[filter.target] = filteredRecords;
    //console.log(`✅ [${filterKey}] Filtered ${filteredRecords.length} records from "${filter.source}" → "${filter.target}"`);
  }
} //End of buildFilteredRecordsFromMap



/** buildOutputSection
 * Builds a mapped output section based on whitelist control settings.
 * @param {string} sectionKey - The key within jsonOutputMap
 * @param {object} fieldMapLibrary - The full fieldMapLibrary object.
 * @returns {object|array|null} - The mapped data or null if not found.
 */
function buildOutputSection(sectionKey, fieldMapLibrary) {
  const section = fieldMapLibrary.jsonOutputMap[sectionKey];

  if (!section || !globalThis[section.source]) return null;

  const source = globalThis[section.source];
  let mapped = [];
console.log("Mapping section:", section.sectionMapKey);
console.log("Resolved fieldMap:", fieldMapLibrary.sectionMaps[section.sectionMapKey]);

    mapped = source.map(record =>
      mapFields(record, fieldMapLibrary.sectionMaps[section.sectionMapKey], fieldMapLibrary)
    );

  //If sort directive present in jsonOutputMap and in sortRegistry, sort output
    if (section.sortKey) {
      if (sortRegistry?.[section.sortKey]) {
          mapped.sort(sortRegistry[section.sortKey]);
      } else {
          console.warn(`⚠️ Sort key "${section.sortKey}" not found in sortRegistry.`);
      }
    }


  // Auto-unwrap if only one item and allow optional override via section.unwrapSingle
  if (mapped.length === 1 && section.unwrapSingle === true) {
    return mapped[0]; // Return the single object instead of an array
  }
    return mapped;

} //END OF buildOutputSection



/**
 * mapFields
 * Transforms a single "record" into a plain JSON object using a field "mapping".
 * Supports:
 *  - text/default copy-through
 *  - jsonParsed (parse JSON string to object/array)
 *  - nestedMapping (embed related child records based on a join)
 *
 * @param {Object} record - One parent row (e.g., from Supabase) to transform.
 * @param {Object} mapping - Section map describing how to build each JSON field:
 *   {
 *     jsonFieldAlias: { field: "source_column", fieldType: "text" | "jsonParsed" | "nestedMapping" }
 *   }
 * @param {Object} fieldMapLibrary - Lookup library required for nestedMapping:
 *   {
 *     ...sectionMaps,                  // e.g., storyArcs, arcBeats, ...
 *     nestedMappingKey: {
 *       [alias: string]: {
 *         recordSource: string,        // globalThis[recordSource] holds the child array
 *         fieldMappingKey: string,     // which section map to use for each child row
 *         linkFieldInParent: string,   // parent column to join on (scalar or array)
 *         childIDField?: string,       // child column that should equal the parent value (default "ID")
 *         sortKey?: string,            // optional sortRegistry key to order children
 *         caseInsensitive?: boolean    // optional: compare keys case-insensitively
 *       }
 *     }
 *   }
 * @returns {Object} - JSON-ready object with mapped fields.
 */
function mapFields(record, mapping, fieldMapLibrary) {
  // ✅ Output accumulator for this row
  const data = {};

  // Walk each requested JSON field
  Object.keys(mapping).forEach((jsonField) => {
    const config = mapping[jsonField] || {};
    const tableField = config.field;
    const fieldType = config.fieldType || "text";
    const fieldValue = record?.[tableField];

    switch (fieldType) {
      case "jsonParsed": {
        // Try to parse JSON text; on failure, just pass through the raw string
        try {
          data[jsonField] = typeof fieldValue === "string" ? JSON.parse(fieldValue) : fieldValue;
        } catch (err) {
          console.warn(`⚠️ JSON parse failed for '${tableField}' →`, err);
          data[jsonField] = fieldValue;
        }
        break;
      }

      case "nestedMapping": {
        // 🔹 Lookup the nested-mapping configuration for this alias (jsonField)
        const nestedConfig = fieldMapLibrary?.nestedMappingKey?.[jsonField];

        if (!nestedConfig) {
          console.warn(`⚠️ No nestedMappingKey config found for field "${jsonField}"`);
          data[jsonField] = [];
          break;
        }

        const {
          recordSource,       // e.g., "ArcBeatsData"  (globalThis[recordSource] should be an array)
          fieldMappingKey,    // e.g., "arcBeats"      (sectionMaps[alias])
          linkFieldInParent,  // e.g., "story_arc_id"  (column on parent)
          childIDField = "ID",// e.g., "story_arc"     (column on child)
          sortKey,            // optional sort
          caseInsensitive,    // optional: defaults to false
        } = nestedConfig;

        // 🧠 Resolve child dataset & mapping
        const childRecords = globalThis?.[recordSource];

        // Support both shapes:
        //  - builder shape: fieldMapLibrary.sectionMaps.arcBeats
        //  - flattened    : fieldMapLibrary.arcBeats
        const childMapping =
          fieldMapLibrary?.sectionMaps?.[fieldMappingKey] ??
          fieldMapLibrary?.[fieldMappingKey];

        if (!Array.isArray(childRecords)) {
          console.warn(`⚠️ recordSource "${recordSource}" is not an array or not loaded`);
          data[jsonField] = [];
          break;
        }
        if (!childMapping || typeof childMapping !== "object") {
          console.warn(
            `⚠️ fieldMappingKey "${fieldMappingKey}" not found under sectionMaps (or top level).`
          );
          data[jsonField] = [];
          break;
        }


        // 1) Read parent link(s) and normalize to an array
        const raw = record?.[linkFieldInParent];
        let parentVals;
        if (Array.isArray(raw)) {
          parentVals = raw;
        } else if (raw == null) {
          parentVals = [];
        } else if (typeof raw === "string") {
          const t = raw.trim();
          // Support legacy JSON-in-a-string or comma lists; otherwise treat as scalar
          if ((t.startsWith("[") && t.endsWith("]")) || (t.startsWith("{") && t.endsWith("}"))) {
            try {
              const parsed = JSON.parse(t);
              parentVals = Array.isArray(parsed) ? parsed : [parsed];
            } catch {
              parentVals = [t];
            }
          } else if (t.includes(",")) {
            parentVals = t.split(",").map((s) => s.trim()).filter(Boolean);
          } else {
            parentVals = [t];
          }
        } else {
          // number/object/etc → single entry array
          parentVals = [raw];
        }

        // 2) Normalize a value/object to a comparable string key
        //    Prefer childIDField, then "id", then "name"; else first primitive property
        const toKey = (v) => {
          if (v == null) return null;
          const prim = (x) =>
            x != null && (typeof x === "string" || typeof x === "number" || typeof x === "bigint");

          if (prim(v)) return String(v).trim();

          if (typeof v === "object") {
            if (childIDField in v && prim(v[childIDField])) return String(v[childIDField]).trim();
            if ("id" in v && prim(v.id)) return String(v.id).trim();
            if ("name" in v && prim(v.name)) return String(v.name).trim();
            for (const [, val] of Object.entries(v)) {
              if (prim(val)) return String(val).trim();
            }
          }
          return null;
        };

        // 3) Build parent key set (optionally case-insensitive)
        const normalizeCase = (s) =>
          caseInsensitive ? String(s).toLowerCase() : String(s);

        const parentKeySet = new Set(
          parentVals
            .map(toKey)
            .filter(Boolean)
            .map(normalizeCase)
        );

        // 4) Semi-join: keep children whose childIDField matches any parent key
        const relatedRecords = childRecords.filter((child) => {
          const rawChildKey = child?.[childIDField];
          if (rawChildKey == null) return false;
          const key = normalizeCase(String(rawChildKey).trim());
          return parentKeySet.has(key);
        });

        // 5) Recursively map children (pass fieldMapLibrary along)
        const nestedResults = relatedRecords.map((child) =>
          mapFields(child, childMapping, fieldMapLibrary)
        );

        // 6) Optional sort via sortRegistry (support global or local)
        if (sortKey) {
          const reg = globalThis?.sortRegistry || (typeof sortRegistry !== "undefined" ? sortRegistry : null);
          const sorter = reg?.[sortKey];
          if (typeof sorter === "function") {
            nestedResults.sort(sorter);
          } else {
            console.warn(`⚠️ Sort key "${sortKey}" not found in sortRegistry.`);
          }
        }

        // 7) Attach nested array to output
        data[jsonField] = nestedResults;
        break;
      }

      default: {
        // Simple copy-through; treat undefined/null as null for stability
        data[jsonField] = fieldValue ?? null;
        break;
      }
    }
  });

  return data;
} // END mapFields




/**
 * storeChunkedJSON
 * ✂️ Splits and stores long JSON string into multiple fields if necessary.
 *
 * @param {any} supabase - Supabase client
 * @param {any} user - authenticated user credentials
 * @param {string} tableName - Supabase table name to update
 * @param {string} recordId - UUID of the record to update
 * @param {string} baseFieldName - Base field name (e.g., "gpt_json")
 * @param {string} jsonString - Full JSON string to store
 * @param {number} maxLength - Character limit per field (default ~95k)
 */
async function storeChunkedJSON(supabase, user, tableName, recordId, baseFieldName, jsonString, maxLength = 95000) {
  const chunks = [];
  for (let i = 0; i < jsonString.length; i += maxLength) {
    chunks.push(jsonString.slice(i, i + maxLength));
  }

  // Build the payload for each chunked field
  const updatePayload = {};
  chunks.forEach((chunk, index) => {
    const suffix = index === 0 ? "" : `_${index + 1}`;
    updatePayload[`${baseFieldName}${suffix}`] = chunk;
  });

  // Supabase update call
  const { error } = await supabase
    .from(tableName)
    .update(updatePayload)
    .eq("id", recordId); // Make sure "id" is your PK

  if (error) throw new Error(`Failed to update ${tableName}: ${error.message}`);
} // END OF storeChunkedJSON



/**
 * 🔄 pullDataForAssistantPipelineMode
 * 
 * Retrieves the core data required for running an assistant pipeline using a workflow control record.
 * This includes:
 *  - The parsed JSON field map used to guide output structure and filtering logic
 *  - The `narrativeProjectID` that drives base table filtering
 * 
 * Primarily used in "assistant pipeline mode" when executing EF runs via the centralized control system.
 * Assumes presence of a valid `request_id` that maps to a `wf_assistant_automation_control` record.
 * 
 * @async
 * @function
 * @param {object} supabase - Supabase client instance used for DB operations
 * @param {object} user - User context or session, passed to permission-aware utility functions
 * @param {string} request_id - The ID of the workflow record in the automation control table
 * @param {string} wf_table - The name of the workflow control table (typically "wf_assistant_automation_control")
 * 
 * @returns {Promise<{ fieldMapLibrary: object, narrativeProjectID: string }>} 
 * An object containing:
 *  - `fieldMapLibrary`: parsed JSON defining table maps and output rules
 *  - `narrativeProjectID`: the controlling project ID used to filter base data tables
 * 
 * @throws Will return an error object if the workflow record or mapping record cannot be found,
 *         or if the mapping JSON is invalid or missing.
 */
async function pullDataForAssistantPipelineMode(supabase, user, request_id, wf_table){


// Get wf_record
const wf_result = await fetchSingleRecord({
  supabase,
  user,
  tableName: wf_table,
  keyField: "id",
  request_key: request_id
});
// Validate and extract wf_record
if (!(wf_result.success)) {
  return wf_result; // error Response object, pass it up
}
const wf_record = wf_result.data;




// Pull the focusRecordID for use when filter record mapping utilizes it.
// accepts single values like 362 or comma separated like 362, 328
const rawFocusID = wf_record.focusRecordID;


// ** Get Script Mapping data **
let scriptMapping_Table = "wf_script_mapping_warehouse";
const scriptMapping_result = await fetchSingleRecord({
  supabase,
  user,
  tableName: scriptMapping_Table,
  keyField: "wf_assistant_name",
  request_key: wf_record.wf_assistant_name
});
// Updated check
if (!scriptMapping_result.success) {
  return scriptMapping_result; // Already in standardized error format
}
const assistantMappingRecord = scriptMapping_result.data;



// ** pull and verify fieldMapLibrary from scriptMapping_result
if (!assistantMappingRecord) throw new Error(`❌ No matching wf_assistant_name record for ${assistantName}`);
// Get the mapping field(s)
let rawAssistantFieldMapping = assistantMappingRecord?.script_mapping_json_payload ?? null;
console.log(`rawAssistantFieldMapping: ${rawAssistantFieldMapping}`);
// Ensure `ScriptMapping_JSONPayload` contains data
if (!rawAssistantFieldMapping) throw new Error("❌ No ScriptMapping_JSONPayload defined in warehouse.");
// Turn raw JSON into parsed JSON
let fieldMapLibrary;
try {
    fieldMapLibrary = JSON.parse(rawAssistantFieldMapping);
    //console.log(`Successfully parsed JSON from ${rawAssistantFieldMapping}.`);
} catch (error) {
    console.error(`Invalid JSON format in ${rawAssistantFieldMapping}: ${error.message}`);
    return;
}

//Get narrativeProjectID
let narrativeProjectID = wf_record.narrative_project_id;

return{
  fieldMapLibrary,
  narrativeProjectID,
}
}



/**
 * 🛠️ buildEFResponse
 * Centralized HTTP response builder for Edge Functions
 *
 * @param {boolean} success - Whether the operation succeeded
 * @param {string} message - Human-readable message
 * @param {object} [data={}] - Optional data payload to include
 * @param {number} [status=200] - HTTP status code
 * @param {object} [headers=jsonHeaders] - Optional headers to return
 * @returns {Response} - Formatted HTTP Response object
 */
export function buildEFResponse({
  success,
  message,
  data = {},
  status = 200,
  headers = jsonHeaders,
}: {
  success: boolean;
  message: string;
  data?: any;
  status?: number;
  headers?: HeadersInit;
}): Response {
  return new Response(JSON.stringify({
    success,
    message,
    ...(data !== undefined ? { data } : {}),
    EF_RunTime: formatMsToTime(Date.now()-efStartTime),
  }), {
    status,
    headers
  });
}

/**
 * formatMsToTime
 * Converts a duration in milliseconds to a formatted time string: "HH:MM:SS.mmm"
 *
 * @param {number} ms - Duration in milliseconds.
 * @returns {string} A formatted string representing the time duration.
 *
 * @example
 * formatMsToTime(6342); // "00:00:06.342"
 * formatMsToTime(3723001); // "01:02:03.001"
 */
function formatMsToTime(ms) {
  // Calculate hours from total milliseconds
  const hours = Math.floor(ms / 3600000);

  // Calculate remaining minutes
  const minutes = Math.floor((ms % 3600000) / 60000);

  // Calculate remaining seconds
  const seconds = Math.floor((ms % 60000) / 1000);

  // Get remaining milliseconds
  const milliseconds = ms % 1000;

  // Format each component to ensure fixed width (e.g., "02" for minutes)
  return (
    String(hours).padStart(2, '0') + ':' +
    String(minutes).padStart(2, '0') + ':' +
    String(seconds).padStart(2, '0') + '.' +
    String(milliseconds).padStart(3, '0')
  );
} // END OF formatMsToTime



/**
 * 📦 handlePipelineOutput
 * 
 * Responsible for finalizing the assistant pipeline output in centralized automation mode.
 * This includes:
 *   - Storing large JSON into chunked fields
 *   - Updating status field on the control record
 *   - Triggering the router Edge Function to start the next EF in the pipeline
 *   - Returning a standardized response to the caller
 * 
 * @async
 * @function
 * @param {object} params - All required values for pipeline continuation
 * @param {any} params.supabase - Supabase client instance
 * @param {any} params.user - Authenticated user session object
 * @param {string} params.request_id - ID of the control record in wf_assistant_automation_control
 * @param {string} params.jsonString - Full JSON stringified output
 * @param {object} params.jsonOutput - Parsed JSON object (same data as jsonString)
 * @param {string} params.outputTable - Table name to write JSON and update status
 * @param {string} params.outputField - Field name to store JSON (e.g., "gpt_json")
 * @param {string} params.token - Supabase user auth token
 * @param {object} [params.headers] - Optional custom response headers (e.g., jsonHeaders)
 * 
 * @returns {Promise<Response>} - Standardized EF response object (buildEFResponse format)
 */
export async function handlePipelineOutput({
  supabase,
  user,
  request_id,
  jsonString,
  jsonOutput,
  outputTable,
  outputField,
  token,
  headers = { "Content-Type": "application/json" },
}) {
  // ✅ Store chunked JSON
  try {
    await storeChunkedJSON(
      supabase,
      user,
      outputTable,
      request_id,
      outputField,
      jsonString
    );
    console.log("✅ JSON output successfully stored.");
  } catch (err) {
    console.error("❌ Failed to store chunked JSON:", err.message);
    return buildEFResponse({
      success: false,
      message: "Failed to store JSON",
      data: {},
      status: 500,
      headers,
    });
  }

  // ✅ Update status field on the control record
  const updateResult = await updateTextField({
    supabase,
    user,
    table_id: request_id,
    tableName: outputTable,
    fieldName: "status",
    udatedValue: "Prep Prompt",
  });

  if (!updateResult.success) {
    return buildEFResponse({
      success: false,
      message: updateResult.error ?? "Unknown failure updating status",
      data: {},
      status: 400,
      headers,
    });
  }

  // ✅ Trigger the router to continue pipeline
  const efName = "ef_router_wf_assistant_automation_control";
  const payload = { request_id };
  const router = await callEdgeFunction(efName, payload, token);
  console.log("📨 Router response:", router);

  // ✅ Final response to caller
  return buildEFResponse({
    success: true,
    message: "Completed Successfully",
    data: jsonOutput,
    status: 200,
    headers,
  });
} // ENd of handlePipelineOutput



