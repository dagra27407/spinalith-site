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
 * - Requires mapping definitions in `fieldMappings`.
 */

/* Modification Hisotory
 * - 06/06/2025 - Implemented json normalization data set schema to decouple from airtable setup
 * - 07/10/2025 - Re-factored code to work within Edge Function environment
 */
export async function runProcess(supabase: any, user: any, record_id: string, narrativeProjectID: string, sourceTable: string) {
  console.log(`runProcess received record_id: ${record_id} || narrativeProjectID: ${narrativeProjectID} || sourceTable: ${sourceTable}`);

  /*******************************************************************************
 * 🔧 Variable Declaration
 * Expects as a paramater
 * -record_id of the wf_assistant_automation_control record
 * -narrativeProjectID stored in that record
 * -sourceTable (as of this design that is the only table expected to be passed but left open for future design)
 *******************************************************************************/
// ✅ Output configuration
const dataFlowConfig = {
    outputTable: sourceTable,    // Table where JSON will be written
    outputField: "gpt_json"           // Field to write JSON to
};
let tableOutput = dataFlowConfig.outputTable;

// tableList defines all tables that need to be loaded and normalized for use in script
const tableList = {
  WF_SourceData:               { tableName: sourceTable, filterByNarrative: false },
  ScriptMappingWarehouseData:  { tableName: "wf_script_mapping_warehouse", filterByNarrative: false },
  NarrativeProjectData:        { tableName: "narrative_projects", filterByNarrative: true }, // assume loaded by recordID
  StoryArcsData:               { tableName: "story_arcs", filterByNarrative: true },
  ArcBeatsData:                { tableName: "story_arc_beats", filterByNarrative: true },
  ChaptersData:                { tableName: "chapters", filterByNarrative: true },
  ChapterKeyMomentsData:       { tableName: "chapter_key_moments", filterByNarrative: true },
  ScenesData:                  { tableName: "scenes", filterByNarrative: true },
  CharactersData:              { tableName: "characters", filterByNarrative: true },
  CharacterDetailsData:        { tableName: "character_details", filterByNarrative: true },
  ItemsData:                   { tableName: "items", filterByNarrative: true },
  AbilitySystemData:           { tableName: "mod_ability_system", filterByNarrative: true },
  AbilitiesData:               { tableName: "abilities", filterByNarrative: true }
};
// Using tableList create a json instance of each table in globalThis
await loadAllSupabaseTables(record_id, narrativeProjectID, tableList)

// Pull the focusRecordID for use when filter record mapping utilizes it.
// accepts single values like 362 or comma separated like 362, 328
const rawFocusID = globalThis.WF_SourceData?.[0]?.focusRecordID;

if (typeof rawFocusID === "string" && rawFocusID.includes(",")) {
  globalThis.focusRecordID = rawFocusID.split(",").map(id => id.trim());
} else {
  globalThis.focusRecordID = rawFocusID;
}

// ✅ Get Assistant Mapping Record
let assistantName = globalThis.WF_SourceData?.[0]?.wf_assistant_name ?? null;
let assistantMappingRecord = globalThis.ScriptMappingWarehouseData.find(c => c.wf_assistant_name === assistantName) ?? null;
console.log(`assistantMappingRecord: ${assistantMappingRecord}`);
if (!assistantMappingRecord) throw new Error(`❌ No matching wf_assistant_name record for ${assistantName}`);
// ✅ Get the mapping field(s)
let rawAssistantFieldMapping = assistantMappingRecord?.script_mapping_json_payload ?? null;
console.log(`rawAssistantFieldMapping: ${rawAssistantFieldMapping}`);
// 🚨 Ensure `ScriptMapping_JSONPayload` contains data
if (!rawAssistantFieldMapping) throw new Error("❌ No ScriptMapping_JSONPayload defined in warehouse.");
// ✅ Turn raw JSON into parsed JSON
let parsedAssistantFieldMapping;
try {
    parsedAssistantFieldMapping = JSON.parse(rawAssistantFieldMapping);
    //console.log(`✅ Successfully parsed JSON from ${rawAssistantFieldMapping}.`);
} catch (error) {
    console.error(`❌ Invalid JSON format in ${rawAssistantFieldMapping}: ${error.message}`);
    return;
}


// ✅ Determine whether we're using "episodes" or "chapters" in the narrativeHeader JSON output
determineEpisodeKey(parsedAssistantFieldMapping);


// ✅ Module Add-On Triggers ** Used in conditional output object inclusion logic **
let mod_AbilitySystem = globalThis?.NarrativeProjectData?.[0]?.mod_AbilitySystem_Trigger;

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

// ✅ Global Field Mappings
const fieldMappings = parsedAssistantFieldMapping;

// ✅ Build all filtered recordsets defined in fieldMappings.filterMap
if (fieldMappings.filterMap) {
  buildFilteredRecordsFromMap(fieldMappings.filterMap);
}

/*******************************************************************************
 * 🔁 Primary Workflow
 *******************************************************************************/
// ✅ Create batchData information
// !!!! THIS NEEDS TO BE MODULARIZED SOMEHOW TO NOT JUST BE BASED ON CHAPTERS !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
let totalChapters = globalThis.ChaptersData.length;
let chaptersPerBatch = 5;
let expectedBatches = Math.ceil(totalChapters / chaptersPerBatch);
let batchData = {
    totalChapters: totalChapters,
    chaptersPerBatch: chaptersPerBatch,
    expectedBatches: expectedBatches
};

// ✅ Compile final jsonOutput segments included in fieldMappings.jsonOutputMap
//      jsonOutput is dynamically created inserting the segments listed in the mapping
let jsonOutput = {};

for (let sectionKey of Object.keys(fieldMappings.jsonOutputMap)) {
  const control = fieldMappings.jsonOutputMap[sectionKey];

  // ✅ Conditional check happens here if inclusion is conditional and conditions boolean variable is false section is skipped
  if (control.conditional && globalThis[control.conditionVariable] !== true) continue;

  const builtSection = buildOutputSection(sectionKey, fieldMappings);

  if (builtSection !== null) {
    jsonOutput[sectionKey] = builtSection;
  }
}

// ✅ Convert to JSON string and log it
let jsonString = JSON.stringify(jsonOutput, null, 2);
console.log(`✅ jsonOutput=  ${jsonString}.`);


try {
  await storeChunkedJSON(tableOutput, record_id, dataFlowConfig.outputField, jsonString);
  console.log("✅ JSON output saved.");
} catch (err) {
  console.error("❌ Failed to store chunked JSON:", err.message);
  return new Response(
    JSON.stringify({ error: "Failed to store JSON", details: err.message }),
    { status: 500, headers: jsonHeaders }
  );
}


console.log("✅ JSON output saved.");

/*******************************************************************************
 * 🛠️ Function Definitions
 *******************************************************************************/


/**
 * determineEpisodeKey
 * Determines whether to use "chapterCount" or "episodeCount" in the final JSON output,
 * based on the NarrativeProjectData and assistant field mapping.
 * If needed, it dynamically adds the correct field to the narrativeHeader sectionMap.
 *
 * @param {Object} parsedAssistantFieldMapping - The assistant’s parsed field mapping (mutated if override applies)
 */
function determineEpisodeKey(parsedAssistantFieldMapping) {
  const narrativeData = globalThis?.NarrativeProjectData?.[0] ?? {};

  // ✅ Decide between chapter or episode
  const mode = narrativeData?.EpisodeOrChapter?.name;
  const episodeKey = mode === "Chapter" ? "chapterCount" : "episodeCount";
  globalThis.episodeKey = episodeKey;

  // ✅ Determine if hard limit is enabled
  let includeEpisodeKey = narrativeData?.["Hard Chapter Limit"] === true;

  // ✅ OR check if assistant mapping includes soft-limit trigger
  const hasSoftLimitFlag =
    parsedAssistantFieldMapping?.sectionMaps?.narrativeHeader?.suggestedChapterMinimum?.field;
  if (hasSoftLimitFlag) includeEpisodeKey = true;

  globalThis.includeEpisodeKey = includeEpisodeKey;

  // 🧬 Inject episodeKey into mapping if needed
  if (includeEpisodeKey) {
    const headerMap = parsedAssistantFieldMapping.sectionMaps?.narrativeHeader;

    if (headerMap) {
      // Remove soft-limit marker if present
      delete headerMap.suggestedChapterMinimum;

      // Add actual episode/chapter field
      headerMap[episodeKey] = {
        field: "episode_chapter_count",
        fieldType: "text"
      };
    }
  }
} //END OF determineEpisodeKey


/**
 * storeChunkedJSON
 * ✂️ Splits and stores long JSON string into multiple fields if necessary.
 *
 * @param {string} tableName - Supabase table name to update
 * @param {string} recordId - UUID of the record to update
 * @param {string} baseFieldName - Base field name (e.g., "gpt_json")
 * @param {string} jsonString - Full JSON string to store
 * @param {number} maxLength - Character limit per field (default ~95k)
 */
async function storeChunkedJSON(tableName, recordId, baseFieldName, jsonString, maxLength = 95000) {
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

/** mapAirtableFields
 * Dynamically maps Airtable record fields to a plain JSON object using a mapping config.
 * Handles arrays, single selects, and basic field types.
 *
 * @param {Record} record - Airtable record to transform.
 * @param {Object} mapping - Field mapping outlining the fields to include and how to treat them.
 * @returns {Object} - JSON-ready object with mapped data.
 */
function mapAirtableFields(record, mapping) {
    // ✅ Initialize object with Airtable record ID
    let data = { recordID: record.id };
    // ✅ Loop through each field defined in the mapping
    Object.keys(mapping).forEach(jsonField => {

        let config = mapping[jsonField];
        let airtableField = config.field;
        let fieldType = config.fieldType || "text";
        let fieldValue = record[airtableField];
       /****************************************** 
        // 🧠 Check for mappedLinkedRecord resolution
        if (fieldType === "mappedLinkedRecord" && fieldMappings.mappedLinkedRecord?.[jsonField]) {
            let { lookupMapKey } = fieldMappings.mappedLinkedRecord[jsonField];
            let mapToUse = lookupMaps?.[lookupMapKey];

            if (!mapToUse) {
                console.warn(`⚠️ Missing lookupMap for ${jsonField}`);
                return;
            }

            fieldValue = resolveMappedLinkedRecordValues(fieldValue, mapToUse);
            fieldType = "linkedRecord"; // ✅ Normalize type for downstream switch
        }
*/

        switch (fieldType) {
            case "jsonParsed":
                try {
                    data[jsonField] = JSON.parse(fieldValue);
                } catch (err) {
                    console.warn(`⚠️ JSON parse failed for '${airtableField}' →`, err);
                    data[jsonField] = fieldValue;
                }
                break;

            case "multiSelect":
                data[jsonField] = Array.isArray(fieldValue)
                    ? fieldValue.map(item => (typeof item === "object" && item.name ? item.name : item))
                    : [];
                break;

            case "linkedRecord":
                data[jsonField] = Array.isArray(fieldValue)
                    ? fieldValue.map(link => (typeof link === "object" ? link.name : link))
                    : [];
                break;
				
            case "singleSelect":
                data[jsonField] = fieldValue.name || "Unknown";
                break;
				
              
            case "nestedMapping":
              // 🔹 This section is for nested data (e.g. embedding all beats inside their parent arc).
              // You must define this nested relationship in fieldMappings.nestedMappingKey.
              // 🔍 Get the nested mapping config for this field (e.g. "arcBeats")
              const nestedConfig = fieldMappings.nestedMappingKey?.[jsonField];

              // ⚠️ Fail-safe: if no config exists, log a warning and return an empty array
              if (!nestedConfig) {
                console.warn(`⚠️ No nestedMappingKey config found for field "${jsonField}"`);
                data[jsonField] = [];
                break;
              }

              // 🧷 Destructure the required values from the nested config
              const {
                recordSource,         // e.g. "ArcBeatsData" — the global array of child records
                fieldMappingKey,      // e.g. "arcBeats" — the field mapping section to use on each child
                linkFieldInParent,    // e.g. "Arc Beats" — the field in the parent holding linked children
                childIDField = "ID",  // e.g. "id" — the unique ID field on child objects
                sortKey               // optional: used to sort child objects
              } = nestedConfig;

              // 🧠 Load the child records from globalThis (assumes they're already loaded)
              const childRecords = globalThis[recordSource];

              // 📦 Load the field mapping for each child record
              const childMapping = fieldMappings[fieldMappingKey];

              // ⚠️ If the source isn't an array, something's wrong — abort cleanly
              if (!Array.isArray(childRecords)) {
                console.warn(`⚠️ recordSource "${recordSource}" is not an array`);
                data[jsonField] = [];
                break;
              }

              // 🔗 Pull the linked record field from the parent (could be array of {id,name} or just strings)
              // This gets us the list of ID's stored in the parent field
              const childLinks = record[linkFieldInParent] ?? [];

              // 🔁 Normalize the link format to extract the semantic child IDs (skip nulls)
              // 👉 We're explicitly using `.name` here because that's our semantic ID, like "BeatID"
              const childIDs = childLinks.map(link => {
                if (typeof link === "string"|| typeof link === "number") return String(link); // fallback in case links are plain strings or numbers
                if (typeof link === "object" && link.name) return link.name; // extract semantic ID
                return null;
              }).filter(Boolean); // remove nulls or invalids

              // 🔍 Match child records by comparing the child's semantic ID field (e.g., BeatID) to the parent links
              const relatedRecords = childRecords.filter(child =>
                childIDs.includes(String(child[childIDField]))
              );

              // 🔄 Recursively map each matching child record using its mapping config
              const nestedResults = relatedRecords.map(child =>
                mapAirtableFields(child, childMapping)
              );


              // 🧹 If a sortKey is defined, apply it using the sortRegistry
              if (sortKey) {
                if (sortRegistry?.[sortKey]) {
                  nestedResults.sort(sortRegistry[sortKey]);
                } else {
                  console.warn(`⚠️ Sort key "${sortKey}" not found in sortRegistry.`);
                }
              }

              // ✅ Final result: attach the fully mapped nested array into the parent field
              data[jsonField] = nestedResults;
              break;




            default:
                data[jsonField] = fieldValue || null;
        }
    });

    return data;
} //END OF mapAirtableFields

/** buildOutputSection
 * Builds a mapped output section based on whitelist control settings.
 * @param {string} sectionKey - The key within jsonOutputMap
 * @param {object} fieldMappings - The full fieldMappings object.
 * @returns {object|array|null} - The mapped data or null if not found.
 */
function buildOutputSection(sectionKey, fieldMappings) {
  const section = fieldMappings.jsonOutputMap[sectionKey];

  if (!section || !globalThis[section.source]) return null;

  const source = globalThis[section.source];
  let mapped = [];
  // If the source is an array, map each record
  if (section.type === "array") {
    mapped = source.map(record =>
      mapAirtableFields(record, fieldMappings.sectionMaps[section.fieldMappings])
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
  }

  // If the source is a single object
  if (section.type === "object") {
    return mapAirtableFields(source, fieldMappings[section.fieldMappings]);
  }

  return null;
} //END OF buildOutputSection

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


/**
 * loadAllSupabaseTables
 * 📥 Loads all relevant tables from Supabase into globalThis using a standard key map.
 *
 * This function reads from a `tableList` configuration object where each entry defines:
 * - `tableName`: the name of the Supabase table to load
 * - `filterByNarrative`: whether to filter by the current `narrativeProjectID`
 *
 * It performs the appropriate `.select()` and `.eq()` queries using the Supabase client,
 * and stores the result into `globalThis[key]` using the key defined in `tableList`.
 * This mimics the behavior of the previous Airtable normalization system but is native to Supabase.
 *
 * @async
 * @function
 * @param {string} narrativeProjectID - The narrative project ID to use when filtering tables that require it.
 * @param {Object} tableList - A keyed object where each key maps to a table config:
 * @param {string} tableList[].tableName - The Supabase table name to load.
 * @param {boolean} tableList[].filterByNarrative - Whether to apply filtering by `narrative_project_id`.
 * @returns {Promise<void>}
 *
 * @example
 * const tableList = {
 *   Characters: { tableName: "character_details", filterByNarrative: true },
 *   Items: { tableName: "items", filterByNarrative: true },
 *   WF_SourceData: { tableName: "wf_assistant_automation_control", filterByNarrative: false }
 * };
 * await loadAllSupabaseTables("abc123-narrative-id", tableList);
 */

async function loadAllSupabaseTables(sourceRecordID, narrativeProjectID, tableList) {
	

	
  for (const [key, config] of Object.entries(tableList)) {
    try {
      let query = supabase.from(config.tableName).select("*");

      if (config.filterByNarrative && config.tableName != "narrative_projects") {
        query = query.eq("narrative_project_id", narrativeProjectID);
      }
      if (config.tableName === "narrative_projects") {
        query = query.eq("id", narrativeProjectID);
      }
      if (key === "WF_SourceData") {
        query = query.eq("id", sourceRecordID);
      }

      const { data, error } = await query;

      if (error) throw error;
      globalThis[key] = data;
    } catch (err) {
      console.error(`❌ Failed to load ${key}: ${err.message}`);
      globalThis[key] = [];
    }
  }
} //END OF loadAllSupabaseTables

} //End of runProcess