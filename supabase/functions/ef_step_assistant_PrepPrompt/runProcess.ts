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
export async function runProcess(supabase: any, user: any, request_id: string, narrativeProjectID: string, sourceTable: string, token: string) {
  console.log(`runProcess received request_id: ${request_id} || sourceTable: ${sourceTable}`);

  /*******************************************************************************
 * 🔧 Variable Declaration
 * Expects as a paramater
 * -request_id of the wf_assistant_automation_control record
 * -sourceTable (as of this design that is the only table expected to be passed but left open for future design)
 *******************************************************************************/


    // ✅ Output configuration
    const dataFlowConfig = {
        outputTable: sourceTable,    // Table where JSON will be written
        outputField: "gpt_prompt"           // Field to write JSON to
    };
    let tableOutput = dataFlowConfig.outputTable;

    // tableList defines all tables that need to be loaded and normalized for use in script
    const tableList = {
        WF_SourceData:				    { tableName: sourceTable, filterByNarrative: false },
        ScriptMappingWarehouseData:	    { tableName: "wf_script_mapping_warehouse", filterByNarrative: false },
        PromptWarehouseData:			{ tableName: "wf_assistant_prompt_warehouse", filterByNarrative: false },
        NarrativeProjectData:			{ tableName: "narrative_projects", filterByNarrative: true }, // assume loaded by recordID
    };

    // Using tableList create a json instance of each table in globalThis
    await loadAllSupabaseTables(request_id, narrativeProjectID, tableList)

    let promptRecord = globalThis.PromptWarehouseData.find(
  r => r.assistant_name === globalThis.WF_SourceData?.[0]?.wf_assistant_name
);

const assistantName = globalThis.WF_SourceData?.[0]?.wf_assistant_name;
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

for (let fieldName of Object.keys(promptRecord)) {
  // ✅ Check for fields like "mod_ability_system_plug_in"
  if (fieldName.startsWith("mod_") && promptRecord[fieldName]) {

    // 🔁 Convert "_plug_in" to "_trigger" to find the enabling flag in the narrative project
    let triggerFieldName = fieldName.replace("_plug_in", "_trigger");

    // ✅ Only include the snippet if the corresponding trigger is active in the narrative project
    if (narrativeProjectRecord?.[triggerFieldName] === true) {
        moduleSnippets.push(promptRecord[fieldName]);
        }

  }
}

// ✨ If no modules active, use fallback
if (moduleSnippets.length === 0) {
    let fallback = promptRecord["NoModulesIncluded"];
    if (fallback) moduleSnippets.push(fallback);
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