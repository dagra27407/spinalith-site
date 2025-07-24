// supabase/functions/ef_step_ChekLoopBatch.ts
// Last updated 07/21/2025
/**
 * Check Loop Batch
 * ----------------------------------------------------------
 * @description
 * This script handles post http calls within the GPT Assistant Workflow Pipeline
 * Once an assistant response is recieved and placed in wf_assistant_automation_control
 * the status is set to "Check Loop Batch"  the router triggers this EF which which will build a concatenated 
 * string of all batch responses separated by a elimiter over multiple batches
 * then once the final batch is identified it parses the concatenated field containing split GPT JSON responses
 * separated by a delimiter (e.g., ***SplitPoint***), then it merges the parts into one
 * coherent JSON object, and stores the final result in a designated output field.
 *
 * @workflow
 * 1. Triggered by each Check Loop Batch iteration
 * 2. Adds batches to concatenated_json as needed
 * 3. Identifies final batch received
 * 4. Splits concatenated JSON segments by delimiter.
 * 5. Parses and merges each valid JSON part.
 * 6. Writes the final merged JSON into a target field.
 *
 * @inputs (provided in ef call body)
 * - request_id: The triggering record ID
 *
 * @tables
 * - wf_assistant_automation_control (or similar)
 */
 /* Modification history
  * 06/17/2025 - Updated to do pre-parse cleaning for specified text fields in response.  i.e. fields like prose that assistant could have characters whcih break json structure.
  * 06/17/2025 - Updated to add WF_ChapterKeyMomentsExtractionAssistant to switch logic
  * 06/19/2025 - Updated WF_Scene_ConceptCreation switch logic for modified assistant output json structure
  * 07/21/2025 - Ported from airtable automation to ef_step_ChekLoopBatch
  */

//Handle Imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    
/**
 * Supabase Edge Function handler for the MultiPhase Assistant Runner pipeline.
 *
 * Handles all incoming HTTP requests related to the assistant orchestration system. 
 * This function:
 * - Manages CORS preflight checks
 * - Authenticates the user via Supabase Auth
 * - Parses the request body for `request_id`
 * - Initializes the multi-phase assistant run (CreateThread, InitialMessage, RunThread)
 * - Returns assistant run metadata and status
 *
 * Only supports POST requests. All others return a 405.
 *
 * @method OPTIONS - CORS preflight check
 * @method POST - Triggers the multi-phase assistant execution using the provided request ID
 *
 * @returns {Response} A JSON-formatted HTTP response with either an error or the run results.
 */

serve(async (req) => {
  const efStartTime = Date.now(); //Used for calculating duration
  
  // ───────────────────────────────────────────────────────────────
  // ✅ 1. Handle preflight CORS request (OPTIONS request from browser)
  // This allows the browser to verify it can send POST/GET/Authorization headers
  // ───────────────────────────────────────────────────────────────
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // ───────────────────────────────────────────────────────────────
  // ✅ 2. Create Supabase client with Authorization token from request
  // This lets us authenticate the user making the request via bearer token
  // ───────────────────────────────────────────────────────────────
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: {
            Authorization: req.headers.get("Authorization") ?? "",
          },
        },
      }
    );
    const EDGE_FUNCTIONS_URL = Deno.env.get("EDGE_FUNCTIONS_URL");


  // ───────────────────────────────────────────────────────────────
  // ✅ 3. Attempt to get authenticated user
  // If token is invalid or missing, this will fail
  // ───────────────────────────────────────────────────────────────
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

  // ───────────────────────────────────────────────────────────────
  // 🚫 4. Unauthorized? Immediately exit with 401
  // Protects secured functionality from being used without a session
  // ───────────────────────────────────────────────────────────────
    if (error || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: jsonHeaders,
      });
    }

  // ───────────────────────────────────────────────────────────────
  // ✅ 5. YOUR FUNCTIONALITY GOES HERE
  // This is where you can read input, write to DB, run logic, etc.
  // Access the user safely via `user.id`, `user.email`, etc.
  // ───────────────────────────────────────────────────────────────
    // If EF call was a POST
    if (req.method === "POST") {
      //Try used to encapsolate MAIN LOGIC secttion
      try {
        //Pull the users auth token for use in next EF call
        const token = req.headers.get("Authorization")?.replace("Bearer ", ""); 
        if (!token) {
          return new Response(JSON.stringify({ error: "Missing token" }), {
          status: 400,
          headers: jsonHeaders,
          });
        }

        // ** HANDLE SETTING HTTP CALL VALUES **
        //Pull variables out of EF Call Body and validate available
        const body = await req.json();
        let {
          request_id,
        } = body || {};
      
        if (!request_id) {
          return new Response(JSON.stringify({ error: "ef_assistant_MultiPhaseRunner_http: Missing request_id" }), {
            status: 400,
            headers: jsonHeaders,
          });
        }
        



/*****************************************************************************************************************
  // ** MAIN LOGIC FOR THIS EF NEEDS TO GO HERE ********************************************************************
****************************************************************************************************************/

    //Run Main Proccess flow
    const mainProcess = await mainWorkflow({supabase, user, request_id});

    //Final Completion Return
    return new Response(
                        JSON.stringify({
                        outcome: "Complete",
                        message: "Outbound Message",
                        EF_RunTime: formatMsToTime(Date.now()-efStartTime),
                        }),
                        {
                        status: 200,
                        headers: jsonHeaders,
                        }
                    );



/*****************************************************************************************************************
// ** END OF MAIN LOGIC FOR THIS EF NEEDS TO GO HERE ********************************************************************
****************************************************************************************************************/

//END of Try that MAIN LOGIC is wrapped inside
    } catch (err) {
    console.error("POST Error:", err);
    return new Response(
      JSON.stringify({
        error: err.message || "Invalid request body or internal error.",
      }),
      { status: 400, headers: jsonHeaders }
    );
  }
  



      

  // ─────────────────────────────────────────────
      // ✅ Step 7: Fallback for unsupported methods
      // ─────────────────────────────────────────────
      return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
        status: 405,
        headers: jsonHeaders,
      });
    }
}); //END OF serve


/**
 * mainWorkflow
 * Main Workflow Executor for GPT Batch Merging
 *
 * @description
 *  - Need to enter a full description of mainProcess once complete!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 *
 * This function is designed for use within Supabase Edge Functions and expects
 * records from the `wf_assistant_automation_control` table.
 *
 * @param {Object} options - Workflow context
 * @param {any} options.supabase - Supabase client instance
 * @param {any} options.user - Authenticated user object
 * @param {string} options.request_id - ID of the workflow control record
 *
 * @returns {Promise<void|Response>} - Returns nothing on success,
 * or a Response object if a failure occurs during retry management or data fetching.
 */
async function mainWorkflow({
  supabase,
  user,
  request_id,
}: {
  supabase: any;
  user: any;
  request_id: string;
}) {

    /*******************************************************************************
     * Variable Declaration
     *******************************************************************************/
    const wf_table = "wf_assistant_automation_control";
    const scriptMapping_table = "wf_script_mapping_warehouse";
    const outputField = "final_json";

    // Get wf_record
    const wf_result = await fetchSingleRecord({
    supabase,
    user,
    tableName: wf_table,
    keyField: "id",
    request_key: request_id
    });

    // Validate and extract wf_record
    if (!('returned_record' in wf_result)) {
    return wf_result; // error Response object, pass it up
    }
    const wf_record = wf_result.returned_record;

    // Extract values from wf_record
    const narrativeProjectID = wf_record.narrative_project_id;
    const assistantName = wf_record.wf_assistant_name;

    // Get scriptMapping_record
    const scriptMapping_result = await fetchSingleRecord({
    supabase,
    user,
    tableName: scriptMapping_table,
    keyField: "wf_assistant_name",
    request_key: assistantName
    });

    // Validate and extract scriptMapping_record returned
    if (!('returned_record' in scriptMapping_result)) {
    return scriptMapping_result; // error Response object, pass it up
    }
    const scriptMapping_record = scriptMapping_result.returned_record;

    // Parse final_json
    let finalJson = await parseJson(wf_record.final_json);
    console.log(`[${request_id}] finalJson keys:`, Object.keys(finalJson));

    // Parse scriptMapping
    const scriptMapping = await parseJson(scriptMapping_record.script_mapping_result_parsing);

    // Primary loop that runs through each row and field of final_json and processes it to proper table
    await processFinalJson(supabase, user, request_id, finalJson, scriptMapping, narrativeProjectID)

    await updateTextField({
      supabase,
      user,
      table_id: request_id,
      tableName: wf_table,
      fieldName: "status",
      udatedValue: "Complete",
    });

    console.log("✅ JSON Parsed Successfully.");

} //END OF mainWorkflow



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
      return new Response(
        JSON.stringify({ error: `${tableName}: Record not found using ${keyField} = ${request_key}` }),
        { status: 404, headers: jsonHeaders }
      );
    }

    return { returned_record: data };
  } catch (error: any) {
    console.error(`${tableName}: Unexpected error during fetchSingleRecord:`, error);
    return new Response(
      JSON.stringify({ error: `${tableName}: Unexpected error: ${error.message}` }),
      { status: 500, headers: jsonHeaders }
    );
  }
} // END OF fetchSingleRecord



/**
 * updateTextField
 * Trigger Next Batch Phase by updating status, this is picked up when ef_router_wf_assistant_automation_control is called
 *
 * @param {string} tableName - Supabase table name (e.g., "wf_assistant_automation_control").
 * @param {string} table_id - UUID of the record to update.
 * @param {string} fieldName - The column name used for status.
 * @param {string} udatedValue - The new value to set (e.g., "Awaiting Next Chunk").
 */
async function updateTextField({
    supabase,
    user,
    table_id,
    tableName,
    fieldName,
    udatedValue}:
    {
    supabase: any;
    user: any;
    table_id: string;
    tableName: string;
    fieldName: string;
    udatedValue: string;
    }) {
    
    const { data, error } = await supabase
        .from(tableName)
        .update({ [fieldName]: udatedValue })
        .eq("id", table_id);

    if (error) {
    console.error("❌ Failed to trigger next batch:", {
        message: error?.message,
        full: JSON.stringify(error),
        });
    throw error;
    }

    console.log(`Updated ${fieldName} of ${tableName} to ${udatedValue} for id ${table_id}`);
} // END OF triggerNextBatch



/**
 * 🔹 Parse GPT JSON Batch Response
 *
 * @description
 * Safely parses a JSON string from provided string.
 * Returns the parsed object or `null` if parsing fails.
 *
 * @param {string} rawJson - Raw JSON string from the GPT response field.
 * @returns {Object|null} - Parsed JSON object or `null` if parsing failed.
 */
async function parseJson(rawJson) {
    if (!rawJson || typeof rawJson !== "string") {
        console.warn("⚠️ No GPT response string provided.");
        return null;
    }

    try {
        const parsed = JSON.parse(rawJson);
        console.log("✅ GPT batch JSON successfully parsed.");
        return parsed;
    } catch (error) {
        console.error(`❌ Failed to parse GPT response: ${error.message}`);
        return null;
    }
} // END OF parseJson


/**
 * applyFlatteningToMappedSections
 * Flatten nested arrays into flat records with inherited parent fields
 * i.e. turns a json with a nested array into an array where the top level gets repeated
 * and spread across each entry.
 * Feed it:
 *   chapterPlan: [
    {
      chapterNumber: "001",
      chapterTitle: "The Beginning",
      scenes: [
        { sceneNumber: 1, concept: "Intro" },
        { sceneNumber: 2, concept: "Conflict starts" }
      ]
    },

    It Returns:
      chapterPlan: [
    {
      chapterNumber: "001",
      chapterTitle: "The Beginning",
      sceneNumber: 1,
      concept: "Intro"
    },
    {
      chapterNumber: "001",
      chapterTitle: "The Beginning",
      sceneNumber: 2,
      concept: "Conflict starts"
    },
 * @param {Object} parsedData – Full parsed JSON (e.g., FinalJSON object)
 * @param {Object} flattenMap – fieldMappings.flatten, in the form { "mapKey.nestedKey": true }
 * @returns {Object} – New object with the same keys but flattened arrays in place of nested ones
 */
function applyFlatteningToMappedSections(parsedData, flattenMap) {
	let result = { ...parsedData }; // Clone to avoid mutation

	for (let fullKey in flattenMap) {
		let [mapKey, nestedKey] = fullKey.split(".");
		let originalArray = parsedData[mapKey];

		if (!Array.isArray(originalArray)) continue;

		let flattenedArray = [];

		for (let parent of originalArray) {
			let nestedItems = parent[nestedKey];
			if (!Array.isArray(nestedItems)) continue;

			for (let child of nestedItems) {
				// Inherit all non-nested fields from parent (except the nested array)
				let inheritedParent = { ...parent };
				delete inheritedParent[nestedKey];

				let flattened = {
					...inheritedParent,
					...child
				};
				flattenedArray.push(flattened);
			}
		}

		// Replace original parent-level array with flattened children
		result[mapKey] = flattenedArray;
	}

	return result;
} // END OF applyFlatteningToMappedSections



/**
 * processFinalJson
 * Processes assistant-generated finalJson data using a provided scriptMapping configuration.
 * Handles insert/update logic and maps fields to Supabase-compatible objects.
 *
 * @param {Object} finalJson - The full assistant JSON output.
 * @param {Object} scriptMapping - Config object defining how and where to process data.
 * @param {string} request_id - ID used to track/log the current assistant run.
 * @param {string} narrativeProjectID - The ID to include in each record if includeNarrativeProjectID is true.
 */
async function processFinalJson(supabase, user, request_id, finalJson, scriptMapping, narrativeProjectID) {
  const {
    destinationTable,
    segmentToParse,
    operationType,
    includeNarrativeProjectID,
    idFieldName,
    fieldMappings
  } = scriptMapping;

  const records = finalJson[segmentToParse];

  if (!Array.isArray(records)) {
    console.error(`[${request_id}] ❌ Expected an array in finalJson["${segmentToParse}"], but got:`, records);
    return;
  }

  for (const record of records) {
    // Convert field names using the fieldMappings
    const mappedFields = mapJsonToTableFields(record, fieldMappings);

    // Add narrative_project_id if needed
    if (includeNarrativeProjectID && narrativeProjectID) {
      mappedFields.narrative_project_id = narrativeProjectID;
    }

    // Log context info for traceability
    console.log(`[${request_id}] 📄 Processing record:`, mappedFields);

    if (operationType === "update") {
      const recordId = record[idFieldName];

      if (!recordId) {
        console.warn(`[${request_id}] ⚠️ No value found for idField "${idFieldName}" in record:`, record);
        continue;
      }

      delete mappedFields[idFieldName]; // Ensure ID isn't part of updated fields

      await updateRecord(supabse, user, request_id, destinationTable, recordId, mappedFields);
    } else {
      await insertRecord(supabase, user, request_id, destinationTable, mappedFields);
    }
  }

  console.log(`[${request_id}] ✅ Completed processing ${records.length} records for table: ${destinationTable}`);
} // END OF processFinalJson



/**
 * mapJsonToTableFields
 * Maps a single JSON record to the structure expected by a Supabase table
 * using a provided field mapping object.
 *
 * @param {Object} record - The raw JSON object from assistant output.
 * @param {Object} fieldMappings - A key-value map where keys are JSON fields and values are table field names.
 * @returns {Object} A new object with keys matching the Supabase table schema.
 *
 * @example
 * const record = { arcName: "Redemption", arcLevel: "global" };
 * const fieldMappings = { arcName: "arc_name", arcLevel: "arc_level" };
 * const result = mapJsonToTableFields(record, fieldMappings);
 * // result: { arc_name: "Redemption", arc_level: "global" }
 */
function mapJsonToTableFields(record, fieldMappings) {
  const mapped = {};

  // Loop through each field in the provided fieldMappings
  for (const [jsonField, tableField] of Object.entries(fieldMappings)) {
    // See if the field is included in the JSON record provided
    if (record.hasOwnProperty(jsonField)) {
      // If it was included this field for insert/update with proper field name and value
      mapped[tableField] = record[jsonField];
    }
  }

  return mapped;
} // END OF mapJsonToTableFields



/**
 * insertRecord
 * Inserts a single record into the specified Supabase table.
 *
 * @param {string} tableName - The Supabase table to insert into.
 * @param {Object} recordData - The mapped field/value object to insert.
 * @param {string} request_id - Optional ID used for logging/debugging.
 * @returns {Promise<void>}
 */
async function insertRecord(supabase, user, request_id, tableName, recordData) {
  const { data, error } = await supabase
    .from(tableName)
    .insert([recordData]); // wrap in array for single insert

  if (error) {
    console.error(`[${request_id}] ❌ Insert failed in ${tableName}:`, error);
  } else {
    console.log(`[${request_id}] ✅ Inserted record into ${tableName}:`, data);
  }
} // END OF insertRecord



/**
 * updateRecord
 * Updates a single record in the specified Supabase table by ID.
 *
 * @param {string} tableName - The Supabase table to update.
 * @param {string} recordId - The value of the ID field to match (e.g., 'abc-123').
 * @param {Object} updateData - The field/value object of updates (must not include ID).
 * @param {string} request_id - Optional ID used for logging/debugging.
 * @returns {Promise<void>}
 */
async function updateRecord(supabase, user, request_id, tableName, recordId, updateData) {
  const { data, error } = await supabase
    .from(tableName)
    .update(updateData)
    .eq("id", recordId); // assumes primary key is named 'id'

  if (error) {
    console.error(`[${request_id}] ❌ Update failed in ${tableName} for ID ${recordId}:`, error);
  } else {
    console.log(`[${request_id}] ✅ Updated record in ${tableName} (ID: ${recordId}):`, data);
  }
} // END OF updateRecord

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
} //END OF formatMsToTime

