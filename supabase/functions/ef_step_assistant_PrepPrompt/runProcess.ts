// supabase/functions/ef_step_assistant_PrepPrompt.ts/runProcess.ts
/** Last Modified 07/10/2025
 * 🔹 Prompt Loader Script for WF Assistants
 *
 * @description
 * Dynamically assembles a complete assistant prompt based on the assistant's table name
 * and any modular flags defined on the Narrative Project record.
 * 
 * @inputs (via Airtable Automation):
 * - recordID (string) → The triggering record
 * - tableName (string) → The name of the assistant's WF table (e.g. "WF_AssistantAutomationControl")
 * 
 * @outputs:
 * - Updates the triggering record with the final assembled prompt
 */
 
 /* Modification History
 * - 06/06/2025 - Rebuilt script for use in singular control table workflow with normalized json replacing airtable specific calls
 * - 07/10/2025 - Re-factored code for use in Edge Function environment vs airtable
 */
export async function runProcess(ctx: EFContext) {
  const { supabase, user, token, request_id, wf_table } = ctx;
  console.log(`runProcess received request_id: ${request_id} || wf_table: ${wf_table}`);

  /*******************************************************************************
 * 🔧 Variable Declaration
 * Expects as a paramater
 * -request_id of the wf_assistant_automation_control record
 * -wf_table (as of this design that is the only table expected to be passed but left open for future design)
 *******************************************************************************/


    // ✅ Output configuration
    const dataFlowConfig = {
        outputTable: wf_table,    // Table where JSON will be written
        outputField: "gpt_prompt"           // Field to write JSON to
    };
    let tableOutput = dataFlowConfig.outputTable;

    // tableList defines all tables that need to be loaded and normalized for use in script
    const tableList = {
        ScriptMappingWarehouseData:	    { tableName: "wf_script_mapping_warehouse", filterByNarrative: false },
        PromptWarehouseData:			{ tableName: "wf_assistant_prompt_warehouse", filterByNarrative: false },
        NarrativeProjectData:			{ tableName: "narrative_projects", filterByNarrative: true }, // assume loaded by recordID
    };

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
    let wf_record = wf_result.returned_record;
    ctx.wf_record = wf_record;
    await logActivity(ctx, "PrepPrompt:Started", JSON.stringify({ status: "Starting PrepPrompt" }));
    let narrativeProjectID = wf_record.narrative_project_id;

    // Using tableList create a json instance of each table in globalThis
    await loadAllSupabaseTables(request_id, narrativeProjectID, tableList)

    let promptRecord = globalThis.PromptWarehouseData.find(
  r => r.assistant_name === wf_record.wf_assistant_name
);

const assistantName = wf_record.wf_assistant_name;
if (!promptRecord) {
  throw new Error(`❌ No matching prompt record for assistant "${assistantName}".`);
}

/*******************************************************************************
 * 🔁 Primary Workflow
 *******************************************************************************/
// ✅ Get the base prompt
let basePrompt = promptRecord.primary_prompt;
if (!basePrompt) throw new Error("❌ No PrimaryPrompt defined in warehouse.");

// 📦 Assemble module add-ons
let moduleSnippets = [];

const narrativeProjectRecord = globalThis.NarrativeProjectData?.[0]; // Grab the only expected project

//add prompts for any modules tagged in project
const modTags: string[] = narrativeProjectRecord?.mod_tags ?? [];
for (const tag of modTags) {
  const snippet = promptRecord[tag];
  if (typeof snippet === "string" && snippet.trim().length > 0) {
    moduleSnippets.push(snippet);
  } else {
    // optional logging
    console.warn(`[PrepPrompt] No matching snippet for tag "${tag}"`);
  }
}

// ✨ If no modules active, use fallback
if (moduleSnippets.length === 0) {
  const fallback = promptRecord["no_modules_included"];
  if (typeof fallback === "string" && fallback.trim()) {
    moduleSnippets.push(fallback);
  } else {
    throw new Error("No mods present and no 'no_modules_included' fallback defined in Prompt Warehouse.");
  }
}

// 🧠 Final prompt assembly
let finalPrompt = [basePrompt, ...moduleSnippets].join("\n\n---\n\n");


try{
// Supabase update call (put prompt in table)
  const { error } = await supabase
    .from(dataFlowConfig.outputTable)
    .update({ [dataFlowConfig.outputField]: finalPrompt })
    .eq("id", request_id); // Make sure "id" is your PK

  console.log("✅ Final Prompt Assembled and Saved");
}
catch{
    if (error) throw new Error(`Failed to update ${tableName}: ${error.message}`);
}

// Update Status
await updateTextField({
      supabase,
      user,
      table_id: request_id,
      tableName: tableOutput,
      fieldName: "status",
      udatedValue: "Run GPT Assistant",
    });

// Call WF Router to kick off next ef process
let efName = "ef_router_wf_assistant_automation_control";
    let payload = {
      "request_id": request_id,
    }
    let router = callEdgeFunction(efName, payload, token);
    console.log(router);

/*******************************************************************************
 * 🛠️ Function Definitions
 *******************************************************************************/



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

async function loadAllSupabaseTables(request_id, narrativeProjectID, tableList) {
	

	
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
        query = query.eq("id", request_id);
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

}; //End of runProcess

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
 * @function logActivity
 * @async
 * @param {EFContext} ctx
 *   Execution context containing `supabase`, `wf_record`, and `ef_log_id`.
 * @param {string} status
 *   Short event/status label to record (e.g., "PollRunStatus").
 * @param {any} [details]
 *   Optional details payload passed through as-is. If your DB column is TEXT,
 *   pass a string or pre-`JSON.stringify` this value before calling.
 * @param {string} [tableName="wf_assistant_activity_log"]
 *   Target table name for the insert.
 * @returns {Promise<void>}
 *
 * @example
 * await logActivity(ctx, "PollRunStatus", { attempt: 3, elapsedMs: 22179 });
 *
 * @notes
 * - On insert error or exception, this util logs a warning via `console.warn`
 *   and resolves; it never throws.
 */
export async function logActivity(
  ctx: EFContext,
  status: string,
  details?: any,
  tableName = "wf_assistant_activity_log"
): Promise<void> {
  try {
    const { error } = await ctx.supabase
      .from(tableName)
      .insert([
        {
          wf_control_id: ctx.wf_record?.id,
          ef_log_id: ctx.ef_log_id,
          event: status,
          details,
          assistant_name: ctx.wf_record?.wf_assistant_name,
        },
      ]);

    if (error) {
      console.warn("activity log insert error:", error);
    }
  } catch (e) {
    console.warn("activity log insert threw:", e);
  }
} // END OF logActivity
