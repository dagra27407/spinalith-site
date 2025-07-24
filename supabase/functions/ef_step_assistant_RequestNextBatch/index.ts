// supabase/functions/ef_step_assistant_RequestNextBatch.ts


/*************************************
 * GLOBAL VARIABLES
 * ***********************************/

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

const efStartTime = Date.now(); //Used for calculating duration
const ef_log_id = crypto.randomUUID(); // used to connect all http runs within this EF in logging tables
    
/**
 * Supabase Edge Function handler for the MultiPhase Assistant Runner pipeline.
 *
 * Handles all incoming HTTP requests related to the assistant orchestration system. 
 * This function:
 * - Manages CORS preflight checks
 * - Authenticates the user via Supabase Auth
 * - Parses the request body for `request_id`
 * - Initializes the multi-phase assistant run (RequestNextBatch, RunThread)
 * - Returns assistant run metadata and status
 *
 *
 * @method OPTIONS - CORS preflight check
 * @method POST - Triggers the multi-phase assistant execution using the provided request ID
 *
 * @returns {Response} A JSON-formatted HTTP response with either an error or the run results.
 */

serve(async (req) => {
  
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


  const { response: requestNextBatchResponse, updatedIDs: requestNextBatchUpdatedIDs} = await requestNextBatch({
    supabase,
    user,
    request_id,
    wf_record,
    ef_log_id,
  });

  // All internal handlers return a Response — just return it as-is
  if (!(initializeAssistantResponse instanceof Response)) {
    throw new Error("Expected a Response object from requestNextBatch.");
  }

  if (initializeAssistantResponse.status !== 200) {
    return initializeAssistantResponse;
  }

  // Assume initializeAssistant returned status: 200 at this point
  const initAssistantResponse = await initializeAssistantResponse.json();


  const { response: pollAssistantResponse, updatedIDs: pollAssistantUpdatedIDs} = await pollAssistant({
    supabase,
    user,
    wf_record,
    multiPhaseIDs: requestNextBatchUpdatedIDs,
    //multiPhaseIDs: multiPhaseIDs,
    efStartTime,
    timeoutLimitMs: 130000, // default 60s = 60000
    pollIntervalMs: 2000,  // default 2s = 2000
    maxAttempts: 20,
    ef_log_id,
  });


    const { response: retrieveAssistantResponse, updatedIDs: retrieveAssistantUpdatedIDs} = await retrieveAssistant({
    supabase,
    user,
    wf_record,
    ef_log_id,
    multiPhaseIDs: pollAssistantUpdatedIDs,
    //multiPhaseIDs: multiPhaseIDs,
    });

    const assistantResponse = await retrieveAssistantResponse.json();
    const messages = assistantResponse?.data?.data?.data || [];

    const assistantMessage = messages.find((msg) => msg.role === "assistant");

    const assistantText = assistantMessage?.content?.[0]?.text?.value || null;

    // Place the response received into iteration_json for Check Loop Batch to process
    if(assistantText){
      const { error: assistantTextError } = await supabase
        .from("wf_assistant_automation_control")
        .update({ 
          iteration_json: assistantText,
          status: "Check Loop Batch"
        })
        .eq("id", wf_record.id);

    if (assistantTextError) {
      console.error("❌ Failed to save assistantText to wf_assistant_automation_control:", assistantTextError);
    } else {
      console.log("✅ Saved assistantText to wf_assistant_automation_control:", assistantText);
    }
    }

  
    return new Response(
                      JSON.stringify({
                        outcome: "Complete",
                        message: "assistantText stored in DB",
                        assistantText: assistantText,
                        fullResponse: assistantResponse,
                        updatedIDs: retrieveAssistantUpdatedIDs,
                      }),
                      {
                        status: 200,
                        headers: jsonHeaders,
                      }
                    );


} //END OF mainWorkflow



/**
 * Executes the initializing of a multi-phase assistant run pipeline for a given request ID.
 *
 * This function orchestrates three sequential GPT assistant operations:
 * 1. `CreateThread` – Initializes a new assistant thread.
 * 2. `InitialMessage` – Posts the initial message with prompt + context.
 * 3. `RunThread` – Executes the assistant's full thread run and polls status.
 *
 * It fetches the assistant control record from `wf_assistant_automation_control`,
 * performs each HTTP call via `handlePhaseCall()`, updates internal ID tracking,
 * and optionally stores the generated `thread_id` back into the control record.
 *
 * @param {Object} params
 * @param {any} params.supabase - The Supabase client instance (with auth headers).
 * @param {any} params.user - The authenticated Supabase user object.
 * @param {string} params.request_id - The ID of the assistant automation control record.
 * @param {string} params.ef_log_id - The ID used to track all http calls within this EF.
 *
 * @returns {Promise<{
 *   response: Response | object;
 *   updatedIDs: {
 *     thread_id: string;
 *     message_id: string;
 *     run_id: string;
 *   };
 * }>} - Either an early error response or the final run response and IDs.
 */
async function requestNextBatch({
  supabase,
  user,
  request_id,
  wf_record,
  ef_log_id,
}: {
  supabase: any;
  user: any;
  request_id: string;
  wf_record: any;
  ef_log_id: string;
}) {

  //Declare variables to store ids between http calls
  let multiPhaseIDs = {
    thread_id: wf_record.thread_id,
    message_id: "Not Set Yet",
    run_id: "Not Set Yet",
  };

  
  /*********************************************************************
   ** Step 2: Handle InitialMessage HTTP Call **************************
   *********************************************************************/
 const { response: messageResponse, updatedIDs: messageUpdatedIDs } = await handlePhaseCall({
  supabase,
  user,
  wf_record,
  phase: "RequestNextBatch", //Should match run_type of http record you want to use
  multiPhaseIDs,
  ef_log_id,
  });

  //Set id values based on returned ids
  multiPhaseIDs.thread_id = messageUpdatedIDs.thread_id;
  multiPhaseIDs.message_id = messageUpdatedIDs.message_id;
  multiPhaseIDs.run_id = messageUpdatedIDs.run_id;

  /*********************************************************************
   ** Step 3: Handle runThread HTTP Call **************************
   *********************************************************************/
 const { response: runThreadResponse, updatedIDs: runThreadUpdatedIDs } = await handlePhaseCall({
  supabase,
  user,
  wf_record,
  phase: "RunThread", //Should match run_type of http record you want to use
  multiPhaseIDs,
  ef_log_id,
  });

  //Set id values based on returned ids
  multiPhaseIDs.thread_id = runThreadUpdatedIDs.thread_id;
  multiPhaseIDs.message_id = runThreadUpdatedIDs.message_id;
  multiPhaseIDs.run_id = runThreadUpdatedIDs.run_id;

   //Store thread_id in the wf_assistant_automation_control record
if (multiPhaseIDs.run_id && wf_record?.id) {
  const { error: runIDUpdateError } = await supabase
    .from("wf_assistant_automation_control")
    .update({ run_id: multiPhaseIDs.run_id })
    .eq("id", wf_record.id);

  if (runIDUpdateError) {
    console.error("❌ Failed to save run_id to wf_assistant_automation_control:", runIDUpdateError);
  } else {
    console.log("✅ Saved run_id to wf_assistant_automation_control:", multiPhaseIDs.run_id);
  }
}

  return { response: runThreadResponse, updatedIDs: runThreadUpdatedIDs};

} //END OF intializeAssistant

/**
 * Polls an Assistant run until completion or timeout.
 * Uses the same modular constructLLMCall() logic as other assistant calls.
 */
async function pollAssistant({
  supabase,
  user,
  wf_record,
  multiPhaseIDs,
  efStartTime,
  timeoutLimitMs = 60000, // default 60s
  pollIntervalMs = 2000,  // default 2s
  maxAttempts = 20,
  ef_log_id,
}: {
  supabase: any;
  user: any;
  wf_record: any;
  multiPhaseIDs: {
    thread_id: string;
    run_id: string;
    message_id: string;
  };
  efStartTime: number;
  timeoutLimitMs?: number;
  pollIntervalMs?: number;
  maxAttempts?: number;
  ef_log_id: string;
}): Promise<{
  response: Response;
  updatedIDs: {
    thread_id: string;
    run_id: string;
    message_id: string;
  };
}>
{
const pollStartTime = Date.now();
let elapsedMs = Date.now() - efStartTime;
let attemptCount = 0; //Start at 0
let runStatusResponse; //container to carry outside of loop scope
let runStatusUpdatedIDs; //container to carry outside of loop scope
let currentAttempt; //container for outside of loop scope

//Loop until time limit hit or max attempts hit
while (elapsedMs < timeoutLimitMs && attemptCount < maxAttempts) {
  // call poll http at begining of each loop
  const {response: pollRunStatusResponse, updatedIDs: pollRunStatusUpdatedIDs } = await handlePhaseCall({
  supabase,
  user,
  wf_record,
  phase: "PollRunStatus", //Should match run_type of http record you want to use
  multiPhaseIDs,
  ef_log_id,
  });

  
  const parsed = await pollRunStatusResponse.json();
  const runStatus = parsed?.data?.status;

  // If there is no status this is likely an error response, pass it on
  if(!runStatus){
      return {
        response: new Response(
                    JSON.stringify({
                      status: "failed",
                      message: `Poll Completed: status not present`,
                      data: parsed,
                    }),
                    {
                      status: 200,
                      headers: jsonHeaders,
                    }
                  ),
        updatedIDs: pollRunStatusUpdatedIDs, 
                };
  };

  // if the status contains a value that indicates its finished return response
  if (["completed", "failed", "cancelled", "expired", "requires_action"].includes(runStatus)) {
    return{ 
      response: new Response(
                  JSON.stringify({
                    status: runStatus,
                    message: `Poll Completed: ${runStatus}`,
                    data: parsed,
                  }),
                  {
                    status: 200,
                    headers: jsonHeaders,
                  }
                ),
      updatedIDs: pollRunStatusUpdatedIDs,
    };
  }


  // Response did not indicate we were finished
  // (Pause before next poll) - Wait before next poll iteration 
  await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));

  // Update loop itteration variables
  attemptCount += 1; //increment by 1
  currentAttempt = attemptCount;
  console.log(`poll batch: ${ef_log_id} || atempt: ${attemptCount} || EF Time Elapsed: ${Date.now() - efStartTime}`);
  runStatusResponse = parsed;
  runStatusUpdatedIDs = pollRunStatusUpdatedIDs;
  elapsedMs = Date.now() - efStartTime;
} // End of while (elapsedMs < timeoutLimitMs or maxAttempts reached)

// If we reached this point, polling timed out or exceded count
return{
    response: new Response(
              JSON.stringify({
                status: "stopped",
                pollResult: currentAttempt < maxAttempts ? "TimedOut" : "MaxAttemptsReached",
                message: "Polling Stopped",
                data: runStatusResponse,
              }),
              {
                status: 200,
                headers: jsonHeaders,
              }
            ),
    updatedIDs: runStatusUpdatedIDs,
  }

} // END OF pollAssistant



async function retrieveAssistant({
  supabase,
  user,
  wf_record,
  ef_log_id,
  multiPhaseIDs,
}: {
  supabase: any;
  user: any;
  wf_record: any;
  ef_log_id: string;
  multiPhaseIDs: {
    thread_id: string;
    message_id: string;
    run_id: string;
  };
}) {

    const {response: getResponseResponse, updatedIDs: getResponseUpdatedIDs } = await handlePhaseCall({
    supabase,
    user,
    wf_record,
    phase: "GetResponse", //Should match run_type of http record you want to use
    multiPhaseIDs,
    ef_log_id,
    });

    const parsed = await getResponseResponse.json();

    return{ 
      response: new Response(
                  JSON.stringify({
                    status: "complete",
                    message: `Response Retrieved`,
                    data: parsed,
                  }),
                  {
                    status: 200,
                    headers: jsonHeaders,
                  }
                ),
      updatedIDs: getResponseUpdatedIDs,
    };

} // END OF retrieveAssistant

/**
 * Handles the execution of a phase in the assistant workflow pipeline.
 * 
 * This function fetches the appropriate HTTP and script mapping records from Supabase,
 * then constructs and executes an LLM call using those parameters. It supports
 * multiple phase types (e.g., CreateThread, InitialMessage, RunThread).
 *
 * @async
 * @function handlePhaseCall
 * @param {Object} params - The parameters for executing the phase.
 * @param {any} params.supabase - Supabase client instance.
 * @param {any} params.user - The authenticated user object.
 * @param {string} params.request_id - The ID of the wf_assistant_automation_control record.
 * @param {any} params.wf_record - The fetched wf_assistant_automation_control record.
 * @param {string} params.phase - The current phase/run_type being executed (e.g., "CreateThread").
 * @param {Object} params.multiPhaseIDs - Object holding current thread, message, and run IDs.
 * @param {string} params.multiPhaseIDs.thread_id - Current thread ID or "Not Set Yet".
 * @param {string} params.multiPhaseIDs.message_id - Current message ID or "Not Set Yet".
 * @param {string} params.multiPhaseIDs.run_id - Current run ID or "Not Set Yet".
 * @param {string} params.ef_log_id - The ID used to track all http calls within this EF.
 * 
 * @returns {Promise<{ response: Response, updatedIDs: { thread_id: string, message_id: string, run_id: string } }>} 
 * Returns an HTTP response object (success or error) and an updated set of multiPhaseIDs.
 */
async function handlePhaseCall({
  supabase,
  user,
  wf_record,
  phase,
  multiPhaseIDs,
  ef_log_id,
}: {
  supabase: any;
  user: any;
  wf_record: any;
  phase: string;
  ef_log_id: string;
  multiPhaseIDs: {
    thread_id: string;
    message_id: string;
    run_id: string;
  }
}){

  //Get the default http values for phase/run_type
  let httpWarehouse_record;
  try {
    const { data, error } = await supabase
      .from("http_request_mapping_warehouse")
      .select("*")
      .eq("request_key", wf_record.wf_assistant_name)
      .eq("call_logic_key", "RunGPTAssistant")
      .eq("run_type", phase)
      .single();

    if (error || !data) {
      console.error(`handlePhaseCall/${phase}: Failed to fetch http_request_mapping_warehouse record:`, error);
      return {response: new Response(
        JSON.stringify({ error: `handlePhaseCall/${phase}: Failed to fetch mapping for: ${wf_record.wf_assistant_name}` }),
        {
          status: 404,
          headers: jsonHeaders,
        }
      ),
      updatedIDs: multiPhaseIDs};
    }

    httpWarehouse_record = data;

  } catch (error) {
    console.error(`handlePhaseCall/${phase}/http_request_mapping_warehouse: Unexpected error:`, error);
    return {response: new Response(
      JSON.stringify({ error: `handlePhaseCall/${phase}/http_request_mapping_warehouse: Unexpected error: ${error.message}` }),
      {
        status: 500,
        headers: jsonHeaders,
      }
    ),
    updatedIDs: multiPhaseIDs};
  }

  // Get the assistatnt id which is only used in CreateThread phase
  let scriptMapping_record;
  try {
    const { data, error } = await supabase
      .from("wf_script_mapping_warehouse")
      .select("*")
      .eq("wf_assistant_name", wf_record.wf_assistant_name)
      .single();

    if (error || !data) {
      console.error(`handlePhaseCall/${phase}/http_request_mapping_warehouse: Failed to fetch wf_script_mapping_warehouse record:`, error);
      return {response: new Response(
        JSON.stringify({ error: `handlePhaseCall/${phase}/http_request_mapping_warehouse: Failed to fetch mapping for: ${wf_record.wf_assistant_name}` }),
        {
          status: 404,
          headers: jsonHeaders,
        }
      ),
      updatedIDs: multiPhaseIDs};
    }

    scriptMapping_record = data;

  } catch (error) {
    console.error(`handlePhaseCall/${phase}/wf_script_mapping_warehouse: Unexpected error:`, error);
    return {response: new Response(
      JSON.stringify({ error: `handlePhaseCall/${phase}/wf_script_mapping_warehouse: Unexpected error: ${error.message}` }),
      {
        status: 500,
        headers: jsonHeaders,
      }
    ),
    updatedIDs: multiPhaseIDs};
  }


  // Execute the CreateTread http call
  const {response, updatedIDs} = await constructLLMCall({
          supabase,
          user,
          request_key: wf_record.wf_assistant_name,
          narrative_project_id: wf_record.narrative_project_id,
          run_type: httpWarehouse_record.run_type,
          call_logic_key: httpWarehouse_record.call_logic_key,
          request_purpose: httpWarehouse_record.request_purpose,
          provider: httpWarehouse_record.provider,
          request_method: httpWarehouse_record.request_method,
          request_url: httpWarehouse_record.request_url,
          content_type: httpWarehouse_record.content_type,
          request_model: httpWarehouse_record.model,
          temperature: httpWarehouse_record.temperature,
          request_prompt: `${wf_record.gpt_prompt} ${wf_record.gpt_json}`.trim(),
          assistant_id: scriptMapping_record.assistant_id,
          multiPhaseIDs,
          ef_log_id,
        });
        
        //Set id values based on returned ids
        multiPhaseIDs.thread_id = updatedIDs.thread_id;
        multiPhaseIDs.message_id = updatedIDs.message_id;
        multiPhaseIDs.run_id = updatedIDs.run_id;


return {response, updatedIDs};
} // END OF handlePhaseCall



/**
 * Executes a one-shot call to a specified LLM provider using dynamic configuration.
 *
 * This function pulls default HTTP and prompt configurations from Supabase based on the `request_key`,
 * merges them with any override values provided in the call, constructs the appropriate request body,
 * and sends the request to the appropriate LLM endpoint (e.g., OpenAI, GoogleAI, OpenRouter).
 *
 * The function logs metadata, handles conditional headers based on provider, and supports graceful
 * failure and response formatting.
 *
 * @async
 * @function constructLLMCall
 * @param {Object} options - Configuration options for the call.
 * @param {any} options.supabase - Supabase client for DB access.
 * @param {any} options.user - Authenticated user context.
 * @param {string} options.request_key - Unique identifier to locate prompt and HTTP config in Supabase.
 * @param {string} [options.narrative_project_id=null] - Optional project ID used for tracking/logging.
 * @param {string} [options.run_type="initial"] - Descriptor for execution type (e.g., "initial", "retry").
 * @param {string} [options.call_logic_key=null] - Optional override for logic handler routing.
 * @param {string} [options.request_purpose=null] - Optional override for the request's purpose (e.g., "InitialMessage").
 * @param {string} [options.provider=null] - LLM provider name (e.g., "OpenAI", "GoogleAI").
 * @param {string} [options.request_method=null] - HTTP method (e.g., "POST").
 * @param {string} [options.request_url=null] - Target URL for the LLM request.
 * @param {string} [options.content_type=null] - Content-Type for the request header.
 * @param {string} [options.request_model=null] - Model to be used (e.g., "gpt-4-turbo").
 * @param {string} [options.temperature=null] - Optional temperature for model creativity.
 * @param {string} [options.request_prompt=null] - Direct override of the prompt to send to the LLM.
 * @param {string} params.ef_log_id - The ID used to track all http calls within this EF.
 *
 * @returns {Promise<Response>} A formatted HTTP Response object containing the LLM output or error message.
 */
async function constructLLMCall({
  supabase,
  user,
  request_key,
  narrative_project_id = null,
  run_type = null,
  call_logic_key = null,
  request_purpose = null,
  provider = null,
  request_method = null,
  request_url = null,
  content_type = null,
  request_model = null,
  temperature = null,
  request_prompt = null,
  assistant_id,
  ef_log_id,
  multiPhaseIDs,
}: {
  supabase: any;
  user: any;
  request_key: string;
  narrative_project_id?: string;
  run_type?: string;
  call_logic_key?: string;
  request_purpose?: string;
  provider?: string;
  request_method?: string;
  request_url?: string;
  content_type?: string;
  request_model?: string;
  temperature?: string;
  request_prompt?: string;
  assistant_id?: string;
  ef_log_id: string;
  multiPhaseIDs: {
    thread_id: string;
    message_id: string;
    run_id: string;
  };
}) {

// Validate assistant_id is present if CreateThread
if (!assistant_id && run_type.toLowerCase() === "initialmessage") {
  return new Response(
    JSON.stringify({ error: "assistant_id must be supplied to constructLLMCall for CreateThread!" }),
    {
      status: 400,
      headers: jsonHeaders,
    }
  );
}

//Validate request_key is present
if(!request_key){
return new Response(JSON.stringify({ error: "request_key must be supplied to ef_LLM_OneShot!" }), {
  status: 400,
  headers: jsonHeaders,
  });
}

try{
    //Setup HTTP from provided values
    const apiKeyEnvKey = provider ? `${provider.toUpperCase()}_API_KEY` : null;
    const apiKey = apiKeyEnvKey ? Deno.env.get(apiKeyEnvKey) : null;

    //Handle headers based on provider specificaitons
    let headers = {
    "Content-Type": content_type || "application/json", //All providers need application/json
    };
    //Handle speacialty LLM headers
    switch(provider.toUpperCase()){
      case "GOOGLEAI":
        headers["x-goog-api-key"] = apiKey;
        break;
      case "OPENROUTER":
        headers["Authorization"] = `Bearer ${apiKey}`;
        headers["HTTP-Referer"] = Deno.env.get("OPENROUTER_HTTP_REFERER") || "";
        break;
      case "OPENAI":
        headers["Authorization"] = `Bearer ${apiKey}`;
        headers["OpenAI-Beta"] = "assistants=v2"
        break;
      default: //All other LLMs
        headers["Authorization"] = `Bearer ${apiKey}`;
        break;
    }
  
  //Build body of http call
  const http_body = {
    
  };

  //add body values needed if run_type is CreateThread
  if (run_type?.toLowerCase() === "createthread") {
    //none currently used in body
  }
  
  if (run_type?.toLowerCase() === "initialmessage") { 
    //Update URL Template
    request_url = request_url.replace("{{thread_id}}", multiPhaseIDs.thread_id);
    //These parameters are not accepted in CreateTread Assistant API Calls
    http_body.role = "user";
    http_body.content = request_prompt;
  }

  if (run_type?.toLowerCase() === "pollrunstatus") { 
    //Update URL Template
    request_url = request_url.replace("{{thread_id}}", multiPhaseIDs.thread_id);
    request_url = request_url.replace("{{run_id}}", multiPhaseIDs.run_id);
  }

  if (run_type?.toLowerCase() === "runthread") { 
    //Update URL Template
    request_url = request_url.replace("{{thread_id}}", multiPhaseIDs.thread_id);
    http_body.model = request_model;
    http_body.assistant_id = assistant_id;
    //Only include if its provided and not null otherwise let the LLM use its internal default for temperature
    if (temperature !== undefined) {
      http_body.temperature = temperature;
      }
  }

  if (run_type?.toLowerCase() === "getresponse") { 
    //Update URL Template
    request_url = request_url.replace("{{thread_id}}", multiPhaseIDs.thread_id);
  }

  //Function call to send reqeust to LLM
  const {status, data, updatedIDs } = await runHttpRequest({
    method: request_method,
    url: request_url,
    headers,
    body: http_body,
    ef_log_id,
    logMeta: {
      narrative_project_id,
      request_key,
      call_logic_key,
      request_purpose,
      provider,
      run_type,
      model: request_model,
    },
    multiPhaseIDs,
    supabase,
    user,
  });

  //Set id values based on returned ids
        multiPhaseIDs.thread_id = updatedIDs.thread_id;
        multiPhaseIDs.message_id = updatedIDs.message_id;
        multiPhaseIDs.run_id = updatedIDs.run_id;

  
  return {response: new Response(
          JSON.stringify({
          success: true,
          status: status,
          message: `Response retrieved: ${run_type}`,
          data,
          multiPhaseIDs,
          }),
          {
          status: 200,
          headers: jsonHeaders,
          }
      ),
       updatedIDs: multiPhaseIDs}
}
catch (err) {
  console.error("POST Error:", err);
  return {response: new Response(
      JSON.stringify({
      error: err.message || "Invalid request body or internal error.",
      }),
      { status: 400, headers: jsonHeaders }
  ),
  updatedIDs: multiPhaseIDs}
}
} //END OF constructLLMCall

/**
 * runHttpRequest
 * Executes a basic HTTP request using the provided method, URL, headers, and optional body.
 * 
 * This function:
 * - Sends a JSON-based HTTP request using `fetch()`
 * - Stringifies the body if provided
 * - Returns the status code, response data, and any error encountered during the request
 * 
 * @async
 * @function runHttpRequest
 * @param {Object} params - Parameters for configuring the HTTP request
 * @param {string} params.method - HTTP method (e.g., "POST", "GET")
 * @param {string} params.url - The full request URL
 * @param {Record<string, string>} [params.headers={}] - An object representing HTTP headers
 * @param {any} [params.body=null] - The request body (will be stringified if present)
 * @param {string} params.ef_log_id - The ID used to track all http calls within this EF.
 * 
 * @returns {Promise<{ status: number; data: any; error?: string }>} 
 * An object containing:
 *  - `status`: HTTP status code (e.g., 200, 500)
 *  - `data`: Parsed JSON response from the server, or `null` if request fails
 *  - `error`: Optional error message if an exception occurs
 * 
 * @example
 * const result = await runHttpRequest({
 *   method: "POST",
 *   url: "https://api.example.com/endpoint",
 *   headers: { "Content-Type": "application/json" },
 *   body: { key: "value" }
 * });
 * 
 * if (result.status === 200) {
 *   console.log("Response:", result.data);
 * } else {
 *   console.error("Request failed:", result.error);
 * }
 */
async function runHttpRequest({
  method = "POST",
  url,
  headers = {},
  body = null,
  logMeta,
  supabase,
  user,
  ef_log_id,
  multiPhaseIDs,
  }: {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: any;
  ef_log_id: string;
  logMeta?: {
    narrative_project_id?: string;
    request_key: string;
    call_logic_key: string;
    request_purpose: string;
    provider: string;
    run_type: string;
    model: string;
  };
  multiPhaseIDs:{
    thread_id: string;
    message_id: string;
    run_id: string;
  };
  supabase: any;
  user: any;
  }): Promise<{ status: number; data: any; error?: string }> {

//Scoped variables
let data;
let logTable;
  try {
      
      //Set baseline fetch options used in GET and POST
      const fetchOptions = {
        method,
        headers
      };
      //Add body to anything but GET
      if (method !== "GET" && body) {
        fetchOptions.body = JSON.stringify(body);
      } 

      //Make the fetch call with constructed sections
      const httpStartTime = Date.now(); //Used for calculating duration
      const response = await fetch(url, fetchOptions);
      const duration_ms = Date.now() - httpStartTime; //How long did this single http call take in milliseconds
      
      //log raw response to compare 
      //console.log(`Raw response for run_type(${logMeta.run_type}): `, response);

      //turn response into json and remove the giant instructions element before passing back up the function chain
      data = await response.json();
      if ("instructions" in data) {
        const { instructions, ...tempData } = data;
        data = tempData;
      }
      //console.log(`🗝️ Keys in response for run_type: ${logMeta.run_type}`, Object.keys(data));

      //Determine if primary logging table or polling logging table should be used
      if(logMeta.run_type === "PollRunStatus" && ["queued", "in_progress", "cancelling"].includes(data.status)){
        logTable = "llm_polling_request_tracking";
      } else {
        logTable = "llm_request_tracking";
      }

  try {
        const isSoftError = !!data?.error; //Identify if field error is included in response even if it registers as a successful returned call(soft error)

        // ---- Update multiPhaseIDs based on response object type ----
        if (data?.object === "thread" && data?.id) {
          multiPhaseIDs.thread_id = data.id;
        }

        if (data?.object === "thread.message" && data?.id) {
          multiPhaseIDs.message_id = data.id;
        }

        if (data?.object === "thread.run" && data?.id) {
          multiPhaseIDs.run_id = data.id;
        }

        await logLLMRequest(supabase, user, logTable, {
          narrative_project_id: logMeta.narrative_project_id,
          request_key: logMeta.request_key,
          call_logic_key: logMeta.call_logic_key,
          request_purpose: logMeta.request_purpose,
          provider: logMeta.provider,
          run_type: logMeta.run_type,
          model: logMeta.model,
          request_payload: body,
          response_raw: data,
          error: isSoftError ? data.error : null,
          status_code: response.status === 200 && isSoftError ? 500 : response.status, //If soft error w/out 200 status use the provided status otherwise default to 500
          duration_ms,
          thread_id: multiPhaseIDs.thread_id,
          run_id: multiPhaseIDs.run_id,
          message_id: multiPhaseIDs.message_id,
          url: url,
          method: method,
          ef_log_id,
        });
      } catch (logErr) {
        console.warn("LLM Logging Failed:", logErr);
      }

      return { status: response.status, data, updatedIDs: multiPhaseIDs };

  } catch (err: any) {
      try{
        await logLLMRequest(supabase, user, logTable, {
                        narrative_project_id: logMeta.narrative_project_id,
                        request_key: logMeta.request_key,
                        call_logic_key: logMeta.call_logic_key,
                        request_purpose: logMeta.request_purpose,
                        provider: logMeta.provider,
                        run_type: logMeta.run_type,
                        model: logMeta.model,
                        request_payload: body,
                        status_code: 500,
                        duration_ms: 0,
                        error: err?.message,
                        thread_id: multiPhaseIDs.thread_id,
                        run_id: multiPhaseIDs.run_id,
                        message_id: multiPhaseIDs.message_id,
                        url: url,
                        method: method,
                        ef_log_id,
                      });
        } catch (logErr) {
          console.warn("LLM Logging Failed:", logErr);
        }
      return { status: 500, data: null, error: err.message || "Unknown error", updatedIDs: multiPhaseIDs };
  }
  } //END OF runHttpRequest



  /**
 * logLLMRequest
 * Logs the details of an LLM request and its outcome to the `llm_request_tracking` table in Supabase.
 * 
 * This function is designed to be called from within the `runHttpRequest()` utility or similar wrappers,
 * capturing both successful and failed LLM calls in a consistent structure. All fields are expected
 * to align with the Supabase `llm_request_tracking` schema.
 * 
 * @param {any} supabase - The initialized Supabase client instance.
 * @param {any} user - The current user object (can be used for RLS or future auditing, not currently used).
 * @param {Object} logData - Object containing all relevant metadata about the LLM request.
 * @param {string} [logData.narrative_project_id] - Optional foreign key to the related narrative project.
 * @param {string} logData.request_key - Identifier for the assistant or utility invoking the LLM.
 * @param {string} logData.call_logic_key - Logic phase or internal stage (e.g., "RunGPTAssistant").
 * @param {string} logData.request_purpose - Description of what the call was meant to achieve (e.g., "InitialMessage", "OneShotSceneGen").
 * @param {string} logData.run_type - The runtime category (e.g., "initial", "batch", "retry").
 * @param {string} logData.model - The name of the model used (e.g., "gpt-4-1106-preview").
 * @param {any} logData.request_payload - The full body of the HTTP request sent to the LLM.
 * @param {any} [logData.response_raw] - The full raw response from the LLM (optional if the call failed).
 * @param {number} logData.status_code - The HTTP status code from the LLM call.
 * @param {number} logData.duration_ms - How long the request took to complete, in milliseconds.
 * @param {string} [logData.error] - Optional error message if the request failed.
 * @param {string} params.ef_log_id - The ID used to track all http calls within this EF.
 * @param {string} params.logTable - The table the log should be entered into.
 * 
 * @returns {Promise<void>} - Resolves once the log entry is written to Supabase.
 */
async function logLLMRequest(supabase: any, user: any, logTable: string, logData: {
  narrative_project_id?: string;
  request_key: string;
  call_logic_key: string;
  request_purpose: string;
  run_type: string;
  model: string;
  request_payload: any;
  response_raw?: any;
  status_code: number;
  duration_ms: number;
  url: string;
  method: string;
  error?: string;
  ef_log_id: string;
}) {

    const { error } = await supabase.from(logTable).insert([logData]);

    if(error){
      console.log("logLLMRequest error: ", error);
    }

} //END OF logLLMRequest







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

