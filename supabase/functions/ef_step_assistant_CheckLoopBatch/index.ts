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
    
   /*********************************************************************
   ** Step 1: Get wf_assistant_automation_control record ***************
   *********************************************************************/

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
 * Handles batch-based GPT assistant responses by:
 * - Validating and parsing JSON returned in chunks
 * - Retrying on invalid responses (up to maxRetries)
 * - Concatenating intermediate chunks into a unified field
 * - Merging all chunks when the final segment is received
 * - Writing the final JSON to an output field
 * - Updating status fields to drive workflow state transitions
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
        const sourceField = "iteration_json";
        const concatField = "concatenated_json"
        const outputField = "final_json";
        const splitMarker = "***SplitPoint***";

        // Get wf_record
        let { wf_record, response: wf_record_response  } = await fetchWFAssistantRecord({supabase, user, request_id});

        if (wf_record_response) {
            return new Response(
            JSON.stringify({
                success: true,
                message: "Failed to get wf_record",
                request_id: request_id,
                response: wf_record_response,
                }),
                {
                status: 500,
                headers: jsonHeaders,
                }
            );
        }

        let assistantName = wf_record.wf_assistant_name;

        // Get and process json
        let extractedJson  = await extractJsonBlock(wf_record[sourceField]);
        console.log(`extractedJson: ${extractedJson}`);
        let rawJson = extractedJson; // store original for comparison
        console.log(`rawJson after extractedJson: ${rawJson}`);

        rawJson = await sanitizeJsonBeforeParse(rawJson, assistantName);

        if (rawJson !== extractedJson) {
        console.warn(`🛠 Assistant sanitization applied for: ${assistantName}`);
        }


        try{
            // Step 1: Check for undefined or invalid retryCount values
            const maxRetries = 3;
            const rawRetryCount = wf_record.retry_count;
            let retryCount;
            if (typeof rawRetryCount === "number" && !isNaN(rawRetryCount)) {
            retryCount = rawRetryCount;
            } else {
            // If field is missing or corrupted, assume worst: STOP
            retryCount = Infinity;
            }

            const isValid = await validateRawJson(rawJson);
            if (!isValid){//If not valid JSON
                if (retryCount >= maxRetries) {
                    // Stop retrying: set to fallback or alert
                        const { data, error } = await supabase
                        .from(wf_table)
                        .update({ status: "Max Retry Attempts Reached" })
                        .eq("id", request_id);

                        if (error) {
                        console.error(`❌ Failed to update status field:`, error.message);
                        } else {
                        console.log(`✅ Status updated to "Max Retry Attempts Reached" for record ${request_id}`);
                        }

                    return; //exit function
                } 
                else {
                    // Retry: increment count and reprocess
                    const { data, error } = await supabase
                        .from(wf_table)
                        .update({ retry_count: retryCount + 1 })
                        .eq("id", request_id);

                        if (error) {
                        console.error(`❌ Failed to update retry_count field:`, error.message);
                        } else {
                        console.log(`✅ retry_count updated to "${retryCount + 1}" for record ${request_id}`);
                        }

                    await triggerNextBatch({supabase, user, request_id, tableName: wf_table, statusField: "status", statusValue: "Re-Send Last Response"});
                    return;
                    }
            }
        } catch(error){
            if (error) {
                    console.error(`❌ Failed to update status field:`, error.message);
                    return new Response(
                        JSON.stringify({
                        success: false,
                        message: `Failed to update to Re-Send Last Response: ${error.message}`,
                        details: {
                            request_id,
                            status: "Max Retry Attempts Reached",
                        },
                        }),
                        {
                        status: 500,
                        headers: jsonHeaders,
                        }
                    );
                    }
        }

        // ✅ Parse JSON
        let parsedJson = parseBatchJsonResponse(rawJson);

        // ✅ If is not last chunk - else is last chunk
        let keepBatching = await shouldContinueBatching(supabase, user, parsedJson, assistantName)
        if (keepBatching) {
            // Trigger next view (e.g., set status to "Awaiting Next Batch")
            console.log("isFinalChunk = False. Need another batch");
            
            // ✅ Add current batch to concatenatedJSON for storage
            await appendBatchToConcatenatedFieldFromRecord(
            supabase,
            user,
            request_id,
            wf_record,
            rawJson,
            wf_table,
            concatField,       // "iteration_json"
            splitMarker        // "***SplitPoint***"
            );
            
            // Flag table to enter view to get next batch
            await triggerNextBatch({supabase, user, request_id, tableName: wf_table, statusField: "status", statusValue: "Awaiting Next Batch"});

        } else {
            // Move to recombine phase
            console.log("isFinalChunk = True. No more batches needed");
            
            // ✅ Add current batch to concatenatedJSON for storage
            await appendBatchToConcatenatedFieldFromRecord(
            supabase,
            user,
            request_id,
            wf_record,
            rawJson,
            wf_table,
            concatField,       // "iteration_json"
            splitMarker        // "***SplitPoint***"
            );


            //Get an updated copy of wf_record now that concatenated_json has been updated with the most recent run.
            const { wf_record: updated_wf_record, response: updated_wf_record_response  } = await fetchWFAssistantRecord({supabase, user, request_id});
            if (updated_wf_record_response) {
                return new Response(
                JSON.stringify({
                    success: true,
                    message: "Failed to get wf_record after concatenated_json was updated",
                    request_id: request_id,
                    response: wf_record_response,
                    }),
                    {
                    status: 500,
                    headers: jsonHeaders,
                    }
                );
            }
            wf_record = updated_wf_record;

            // ✅ Merge chunks and save final output
            const fullText = wf_record[concatField];
            // 🔁 Get assistant name for routing
            const mergedJson = await splitAndMergeJsonChunks(fullText, splitMarker, assistantName);

            // ✅ Save to output field
                 const { data, error } = await supabase
                        .from(wf_table)
                        .update({ [outputField]: JSON.stringify(mergedJson, null, 2) })
                        .eq("id", request_id);

                        if (error) {
                        console.error(`❌ Failed to update status field:`, error.message);
                        } else {
                        console.log(`✅ Merged Data updated to "${outputField}" for record ${request_id}`);
                        }
            
            // Flag status Parse Response
            await triggerNextBatch({supabase, user, request_id, tableName: wf_table, statusField: "status", statusValue: "Parse Response"});
        }



        console.log("✅ Final GPT JSON merged and saved.");

} //END OF mainWorkflow



/**
 * Fetches a single assistant automation control record from the Supabase table `wf_assistant_automation_control`
 * using the provided `request_id`. This is the initial data lookup used to drive downstream assistant logic.
 *
 * If the record is found, it returns `{ wf_record }`.  
 * If the record is not found or an error occurs, it returns a formatted `Response` with an appropriate status code.
 *
 * @param {Object} params
 * @param {any} params.supabase - The Supabase client instance.
 * @param {any} params.user - The authenticated Supabase user (unused, but included for consistency).
 * @param {string} params.request_id - The ID of the `wf_assistant_automation_control` record to retrieve.
 * @returns {Promise<
 *   | { wf_record: any }
 *   | Response
 * >} - Returns the found record, or a Response object indicating an error.
 */
async function fetchWFAssistantRecord({
  supabase,
  user,
  request_id,
}: {
  supabase: any;
  user: any;
  request_id: string;
}) {

let wf_record;
  try {
    const { data, error } = await supabase
      .from("wf_assistant_automation_control") // fixed spelling of "assistant"
      .select("*")
      .eq("id", request_id)
      .single();

    if (error || !data) {
      console.error("fetchWFAssistantRecord: Failed to fetch wf_assistant_automation_control record:", error);
      return new Response(
        JSON.stringify({ error: `fetchWFAssistantRecord: Failed to fetch wf_assistant_automation_control record: ${request_id}` }),
        {
          status: 404,
          headers: jsonHeaders,
        }
      );
    }

     return { wf_record: data}; // on success

  } catch (error) {
    console.error("fetchWFAssistantRecord: Unexpected error while fetching wf_assistant_automation_control:", error);
    return new Response(
      JSON.stringify({ error: `fetchWFAssistantRecord: Unexpected error: ${error.message}` }),
      {
        status: 500,
        headers: jsonHeaders,
      }
    );
  }

} //END OF fetchWFAssistantRecord



/**
 * extractJsonBlock
 * Clean GPT Response and Extract First Valid JSON Block
 *
 * @param {string} raw - Raw GPT response (may contain commentary)
 * @returns {string|null} - Clean JSON string (just the object), or null if not found
 */
async function extractJsonBlock(raw: string){
    if (typeof raw !== "string") return null;

    const firstCurly = raw.indexOf("{");
    const lastCurly = raw.lastIndexOf("}");

    if (firstCurly === -1 || lastCurly === -1 || firstCurly >= lastCurly) {
        console.warn("❌ No JSON block detected in GPT response.");
        return null;
    }

    const potentialJson = raw.slice(firstCurly, lastCurly + 1);

    try {
        console.log(`extractJsonBlock - potentialJson: ${potentialJson}`);
        JSON.parse(potentialJson); // Test parse
        return potentialJson;
    } catch (err) {
        console.error("❌ extractJsonBlock failed to parse cleaned block:", err.message);
        return null;
    }
} // END OF extractJsonBlock



/**
 * sanitizeJsonBeforeParse
 * Assistant-Specific JSON Pre-Sanitizer
 *
 * @description
 * Applies assistant-specific sanitation rules to raw JSON strings before parsing.
 * This prevents known failure modes such as unescaped prose fields, rogue quotes,
 * or unnormalized newlines. Sanitization is applied only to known high-risk fields
 * based on the assistant's expected output schema.
 *
 * @param {string} rawJson - The raw JSON string extracted from assistant response.
 * @param {string} assistantName - The assistant identifier (e.g., "WF_Scene_ProseWriter").
 * @returns {string} - The cleaned JSON string, ready for parsing.
 *
 * @example
 * const safeJson = sanitizeJsonBeforeParse(rawJson, "WF_ChapterNarrativeFlowBuilder");
 */
async function sanitizeJsonBeforeParse(rawJson: string, assistantName: string){
    switch (assistantName) {
        case "WF_Scene_ProseWriter":
            return sanitizeFieldsInJsonString(rawJson, ["prose"]);

        case "WF_ChapterNarrativeFlowBuilder":
            return sanitizeFieldsInJsonString(rawJson, ["chapterDraft"]);

        case "WF_SceneConceptExpansion":
            return sanitizeFieldsInJsonString(rawJson, ["sceneText"]);

        // 🔜 Add more assistant-specific sanitizers as needed

        default:
            return rawJson;
    }
} //END OF sanitizeJsonBeforeParse



/**
 * sanitizeFieldsInJsonString
 * Sanitize Fields in Raw JSON String
 *
 * @description
 * Scans a raw JSON string and escapes problematic characters inside specified field values.
 * This is used to prevent malformed assistant output (e.g., unescaped quotes or newlines in prose)
 * from breaking JSON.parse(). Only the specified fields are sanitized via regex targeting.
 *
 * @param {string} rawJson - The raw JSON string from the assistant response.
 * @param {string[]} fieldNames - An array of field names whose string contents should be sanitized (e.g., ["prose", "chapterDraft"]).
 * @returns {string} - A modified JSON string with specified fields safely escaped.
 *
 * @example
 * const safeJson = sanitizeFieldsInJsonString(rawJson, ["prose", "chapterDraft"]);
 */
async function sanitizeFieldsInJsonString(rawJson: string, fieldNames: string[] = []){
    if (!rawJson || typeof rawJson !== "string") return rawJson;

    for (const fieldName of fieldNames) {
        const regex = new RegExp(`"${fieldName}"\\s*:\\s*"([\\s\\S]*?)"`, "g");

        rawJson = rawJson.replace(regex, (match, innerText) => {
            const cleaned = innerText
                .replace(/\\/g, "\\\\")        // escape backslashes
                .replace(/"/g, '\\"')          // escape double quotes
                .replace(/\r?\n/g, "\\n");     // escape newlines

            return `"${fieldName}": "${cleaned}"`;
        });
    }

    return rawJson;
} // END OF sanitizeFieldsInJsonString



/**
 * validateRawJson
 * Validate JSON Format Before Processing
 *
 * Attempts to parse a raw JSON string to confirm it is valid.
 * Logs a warning on failure. No database mutation occurs — caller must handle error response.
 *
 * @param rawJson - Raw JSON string to be validated
 * @returns `true` if valid JSON, otherwise `false`
 */
async function validateRawJson(rawJson: string): boolean {
  if (!rawJson || typeof rawJson !== "string") {
    console.warn("⚠️ No JSON string provided for validation.");
    console.error(`rawJson ${rawJson}`);
    return false;
  }

  try {
    JSON.parse(rawJson); // We only validate here, not parse for use
    return true;
  } catch (error) {
    console.error(`❌ Malformed JSON detected: ${(error as Error).message}`);
    return false;
  }
} // END OF validateRawJson



/**
 * splitAndMergeJsonChunks
 * Combine Split JSON Segments into Final Unified JSON
 *
 * @param {string} concatenatedString - Full string from Airtable with ***SplitPoint*** delimiters.
 * @param {string} delimiter - The delimiter separating GPT JSON chunks.
 * @returns {Object} - Combined final JSON.
 */
async function splitAndMergeJsonChunks(concatenatedString, delimiter, assistantName) {
    const parts = concatenatedString.split(delimiter).map(p => p.trim()).filter(Boolean);
    let mergedJson;

    switch (assistantName) {
        case "WF_StoryArcCraftingAssistant":
            mergedJson = {
                storyArcs: [],
                isFinalChunk: true
            };

            for (const part of parts) {
                try {
                            const obj = JSON.parse(part);
                            if (Array.isArray(obj.storyArcs)) {
                                mergedJson.storyArcs.push(...obj.storyArcs);
                            }
                } catch (err) {
                    console.error("❌ Failed to parse segment:", err.message);
                }
            }
            break;

        case "WF_ChapterCraftingAssistant":
            mergedJson = {
                chapterPlan: [], //List any array objects that need simple merge like this i.e. (Strategy 1)
                observations: {}, //List any objects that need merging with special grouping like this (Strategy 2)
                unadaptedBeats: [],
                isFinalChunk: true
            };

            for (const part of parts) {
                try {
                    const obj = JSON.parse(part);
                    // Strategy 1: Flat array merge
                    if (Array.isArray(obj.chapterPlan)) {
                        mergedJson.chapterPlan.push(...obj.chapterPlan);
                    }
                    // Strategy 2: Grouped map merge (by chapterRange)
                    // includes the object in each json(parts) that has the value you will group each entry of the array by
                    if (Array.isArray(obj.observations)) {
                        mergedJson.observations[obj.chapterRange || `UnknownRange`] = obj.observations;
                    }
                    // Strategy 1: Flat array merge
                    if (Array.isArray(obj.unadaptedBeats)) {
                        mergedJson.unadaptedBeats.push(...obj.unadaptedBeats);
                    }
                } catch (err) {
                    console.error("❌ Failed to parse segment:", err.message);
                }
            }
            break;

        case "WF_Scene_ConceptCreation":
            mergedJson = {
                sceneConcepts: [],
                observations: {},
                isFinalChunk: true
            };

            for (const part of parts) {
                try {
                            const obj = JSON.parse(part);
                            if (Array.isArray(obj.sceneConcepts)) {
                                mergedJson.sceneConcepts.push(...obj.sceneConcepts);
                            }
                            if (Array.isArray(obj.observations)) {
                                mergedJson.observations[obj.chapterRange || `UnknownRange`] = obj.observations;
                            }
                } catch (err) {
                    console.error("❌ Failed to parse segment:", err.message);
                }
            }
            break;
            
        case "WF_CharacterAssignmentSceneReview":
            mergedJson = {
                characterAssignments: [],
                newCharacterRoles: [],
                observations: {},
                isFinalChunk: true
            };

            for (const part of parts) {
                try {
                            const obj = JSON.parse(part);
                            if (Array.isArray(obj.characterAssignments)) {
                                mergedJson.characterAssignments.push(...obj.characterAssignments);
                            }
                            if (Array.isArray(obj.observations)) {
                                mergedJson.observations[obj.chapterRange || `UnknownRange`] = obj.observations;
                            }
                            if (Array.isArray(obj.newCharacterRoles)) {
                                mergedJson.newCharacterRoles.push(...obj.newCharacterRoles);
                            }
                } catch (err) {
                    console.error("❌ Failed to parse segment:", err.message);
                }
            }
            break;

        case "WF_ChapterNarrativeFlowBuilder":
            mergedJson = {
                chapterDrafts: [],
                isFinalChunk: true
            };

            for (const part of parts) {
                try {
                            const obj = JSON.parse(part);
                            if (Array.isArray(obj.chapterDrafts)) {
                                mergedJson.chapterDrafts.push(...obj.chapterDrafts);
                            }
                } catch (err) {
                    console.error("❌ Failed to parse segment:", err.message);
                }
            }
            break;
        case "WF_ChapterKeyMomentsExtractionAssistant":
            mergedJson = {
                chapterKeyMoments: [],
                isFinalChunk: true
            };

            for (const part of parts) {
                try {
                            const obj = JSON.parse(part);
                            if (Array.isArray(obj.chapterKeyMoments)) {
                                mergedJson.chapterKeyMoments.push(...obj.chapterKeyMoments);
                            }
                } catch (err) {
                    console.error("❌ Failed to parse segment:", err.message);
                }
            }
            break;

        // 🔜 Add more assistant routes as needed
        default:
            throw new Error(`❌ Unrecognized assistant: ${assistantName}`);
    }

    console.log("📦 Final merged JSON structure ready.");
    return mergedJson;
} // END OF splitAndMergeJsonChunks



/**
 * triggerNextBatch
 * Trigger Next Batch Phase by updating status, this is picked up when ef_router_wf_assistant_automation_control is called
 *
 * @param {string} tableName - Supabase table name (e.g., "wf_assistant_automation_control").
 * @param {string} request_id - UUID of the record to update.
 * @param {string} statusField - The column name used for status.
 * @param {string} statusValue - The new value to set (e.g., "Awaiting Next Chunk").
 */
async function triggerNextBatch({
    supabase,
    user,
    request_id,
    tableName,
    statusField,
    statusValue}:
    {
    supabase: any;
    user: any;
    requst_id: string;
    tableName: string;
    statusField: string;
    statusValue: string;
    }) {
    console.log(`Triggering next batch: Setting ${statusField} of ${tableName} to ${statusValue} for id ${request_id}`);

    const { data, error } = await supabase
        .from(tableName)
        .update({ [statusField]: statusValue })
        .eq("id", request_id);

    if (error) {
    console.error("❌ Failed to trigger next batch:", {
        message: error?.message,
        full: JSON.stringify(error),
        });
    throw error;
    }


    console.log("✅ Supabase record updated to trigger next assistant batch.");
} // END OF triggerNextBatch



/**
 * 🔹 Parse GPT JSON Batch Response
 *
 * @description
 * Safely parses a JSON string from a GPT response field.
 * Returns the parsed object or `null` if parsing fails.
 *
 * @param {string} rawJson - Raw JSON string from the GPT response field.
 * @returns {Object|null} - Parsed JSON object or `null` if parsing failed.
 */
function parseBatchJsonResponse(rawJson) {
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
}



/**
 * shouldContinueBatching
 * Check If More Chunks Are Expected (Based on batch_style)
 *
 * @description
 * Checks whether additional assistant calls are needed based on isFinalChunk
 * and the assistant's batch_style configuration in the prompt warehouse.
 *
 * @param {Object} parsedJson - Parsed JSON from GPT.
 * @param {string} assistantName - Name of the assistant for warehouse lookup.
 * @returns {Promise<boolean>} - True if more chunks expected, false if final or error.
 */
async function shouldContinueBatching(supabase: any, user: any, parsedJson: any, assistantName: string): Promise<boolean> {
    if (!parsedJson || typeof parsedJson !== "object") return false;

    try {
        const { data: promptRecord, error } = await supabase
            .from("wf_assistant_prompt_warehouse")
            .select("batch_style")
            .eq("assistant_name", assistantName)
            .single();

        if (error || !promptRecord) {
            console.error(`❌ Failed to fetch batch_style for assistant '${assistantName}':`, error);
            return false;
        }

        const { batch_style } = promptRecord;

        if (batch_style && parsedJson.isFinalChunk === false) {
            console.log("🔁 More chunks expected.");
            return true;
        }
        console.log("✅ Final chunk received.");
        return false;

    } catch (err) {
        console.error("❌ Unexpected error in shouldContinueBatching:", err);
        return false;
    }
} // END OF shouldContinueBatching




/**
 * appendBatchToConcatenatedFieldFromRecord
 * ➕ Append New GPT Response to Concatenated Field (using pre-fetched wf_record)
 *
 * @param {Object} wf_record - The pre-fetched record object from Supabase.
 * @param {string} newJson - New GPT response JSON string.
 * @param {Function} supabase - Supabase client instance.
 * @param {string} tableName - Table name (e.g., "wf_assistant_automation_control").
 * @param {string} concatField - Field name to update (e.g., "concatenated_json").
 * @param {string} delimiter - Delimiter string between chunks.
 */
async function appendBatchToConcatenatedFieldFromRecord(supabase, user, request_id, wf_record, newJson, tableName, concatField, delimiter) {
    const currentValue = wf_record[concatField] || "";

    const updatedValue = currentValue
        ? `${currentValue}${delimiter}\n${newJson}`
        : newJson;

    const { error: updateError } = await supabase
        .from(tableName)
        .update({ [concatField]: updatedValue })
        .eq("id", request_id);

    if (updateError) {
        console.error(`❌ Failed to append batch: ${updateError.message}`);
        throw updateError;
    }

    console.log("New GPT batch appended using pre-fetched record.");
} // END OF appendBatchToConcatenatedFieldFromRecord



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