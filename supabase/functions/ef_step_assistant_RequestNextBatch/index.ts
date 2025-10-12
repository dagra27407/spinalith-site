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

export type EFContext = {
  supabase: any;
  user?: any;
  token?: string;

  // stable identifiers
  wf_table: string;
  http_Request_Key: string;
  logTable: string;
  ef_log_id: string;
  assistant_key: string;
  request_key: string;
  narrative_project_id?: string;
  request_id?: string;
  // defaults that can be overridden
  run_type?: string;
  request_purpose?: string;
  model?: string;
  provider: string;

  // IDs set/updated during calls
  ids: {
    thread_id?: string;
    message_id?: string;
    run_id?: string;
  };

  /** Per-request timing anchor used for elapsedMs calculations */
  efStartTime: number;

  /** Polling configuration */
  polling: {
    timeoutLimitMs: number;
    pollIntervalMs: number;
    maxAttempts: number;
  };

  wf_record?: any;
  assistant_id?: string;

  //From httpWarehouse_record pull
  httpWarehouse: {
    run_type: string;
    call_logic_key: string;
    request_purpose: string;
    provider: string;
    request_method: string;
    request_url: string;
    content_type: string;
    model: string;
    temperature: string;
  }

  // dynamic/mutable fields during EF execution
  dynamic: {
    attempt_count: number;
    backoff_ms: number;
    next_poll_at?: string;
    consecutive_transient_errors: number;
    provider_unstable: boolean;
    status_code?: number;
    duration_ms?: number;
    url?: string;
    method?: string;
    error?: string;
    last_run_status?: string;
  };
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

  // ⬇️ Early ctx; some values are not available yet, so set to null/undefined.
  const efStartTime = Date.now(); //Used for calculating duration
  const ef_log_id = crypto.randomUUID(); // used to connect all http runs within this EF in logging tables
  const ctx: EFContext = {
    supabase: null as any,            // will be set after creating the client
    user: null as any,                // will be set after auth lookup
    token: null as any,

    wf_table: "wf_assistant_automation_control",
    http_Request_Key: "WF_OpenAI_Assistant_HTTP",
    logTable: "llm_request_tracking",
    ef_log_id,
    assistant_key: "WF_RequestNextBatch",
    request_key: "RequestNextBatchEF",
    narrative_project_id: undefined,  // will be set after parsing body
    request_id: undefined,
    run_type: "RequestNextBatch",
    request_purpose: "CreateMessage",
    model: "gpt-5",
    provider: "openai",

    ids: {
      thread_id: "undefined",
      message_id: "undefined",
      run_id: "undefined",
    },

    efStartTime,

    polling: {
      timeoutLimitMs: 60000,   // 60s default (calculated from efStartTime)
      pollIntervalMs: 2000,    // 2s default (Wait between poll attempts)
      maxAttempts: 20,
    },
    wf_record: undefined,
    assistant_id: undefined,

    httpWarehouse: {
      run_type: undefined,
      call_logic_key: undefined,
      request_purpose: undefined,
      provider: undefined,
      request_method: undefined,
      request_url: undefined,
      content_type: undefined,
      model: undefined,
      temperature: undefined,
    },

    dynamic: {
      attempt_count: 0,
      backoff_ms: 1000,
      next_poll_at: undefined,
      consecutive_transient_errors: 0,
      provider_unstable: false,
      status_code: undefined,
      duration_ms: undefined,
      url: undefined,
      method: undefined,
      error: undefined,
      last_run_status: undefined,
    },
  };

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
    // hydrate ctx from request + auth
    ctx.supabase   = supabase;
    ctx.user       = user;
    ctx.token      = token;
    ctx.request_id = request_id;
        
    //Run Main Proccess flow
    const mainProcess = await mainWorkflow(ctx);

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
async function mainWorkflow(ctx: EFContext) {
  // Fetch control row
  const wf_result = await fetchSingleRecord({
    tableName: ctx.wf_table,
    keyField: "id",
    request_key: ctx.request_id!,
    ctx,
  });

  if (!(wf_result.success)) {
    console.error(`fetchSingleRecord for Request_Id: ${ctx.request_id} not found in ${ctx.wf_table} failed!`);
    //Error would be logged inside fetchSingleRecord
    return { success: false, reason: "WFRecordFetchFail"}; // early error Response
  }

  const wf_record = wf_result.returned_record;
  ctx.wf_record = wf_record;


  await setStatus(ctx, "RequestNextBatch:Started"); //Non-Router trigger Status


  // Step 1: initialize assistant
  const RequestNextBatchResponse = await RequestNextBatch(ctx);

  if (!RequestNextBatchResponse.success) {
    console.log("RequestNextBatchResponse.success !== true");

    await setStatus(ctx, "PotentialRestart"); //Router trigger Status

    return RequestNextBatchResponse;
  }

console.log("!!! RequestNextBatchAssistantUpdatedIDs: ", {
  ctx_thread_id: ctx?.ids?.thread_id,
  ctx_run_id: ctx?.ids?.run_id,
  ctx_message_id: ctx?.ids?.message_id,
});

  // Step 2: poll
  const pollAssistantResponse = await pollAssistant(ctx);

  //polling timed out or hit max attempts
  if(!pollAssistantResponse.success){
    await setStatus(ctx, "PollingNeeded");  //Router trigger Status
  }

  const runStatus = String(pollAssistantResponse?.data?.runStatus || "").toLowerCase();
  if(pollAssistantResponse.success){
    switch(runStatus){
      //Updates database depending on polling results then falls through to next logic points
      //to allow for calling of router.
      case "failed":
        // indicates something with the run errored on openai side or a hicup happened durring run
        // pipeline will request assistant to re send the last response treating it as if the assistant
        // did recieve the last message but either did not send a response or the response had errors
        await setStatus(ctx, "Re-Send Last Response");
        await logActivity(ctx, "PollingResults: failed", JSON.stringify({ef_log_id: ctx.ef_log_id}));
      break;
      case "cancelled":
        // indicates openai recieved an http request to cancel the run. we don't currently allow for this so
        // it is treated as a hard stop and restart the process with a fresh thread
        await setStatus(ctx, "PotentialRestart");
        await logActivity(ctx, "PollingResults: cancelled", JSON.stringify({ef_log_id: ctx.ef_log_id}));
        break;
      case "expired":
        // indicates the time limit with openai on the run_id was reached(aprox. 10min).  standard response
        // is to assume a hicup happened durring run pipeline will request assistant to re send the last 
        // response treating it as if the assistant did recieve the last message but either did not send a 
        // response or the response had errors
        await setStatus(ctx, "Re-Send Last Response");
        await logActivity(ctx, "PollingResults: expired", JSON.stringify({ef_log_id: ctx.ef_log_id}));
        break;
      case "requires_action":
        // indicates the assistant has tools/funcitons turned on and needs user response to continue.
        // this is not currently built into our process and is treated as a hard stop and needs to be
        // addressed in the assistants configurations inside of openai playground
        await setStatus(ctx, "Halt:PollingResults:requires_action");
        await logActivity(ctx, "PollingResults: requires_action", JSON.stringify({ef_log_id: ctx.ef_log_id}));
      break;
      case "completed":
        // this is a true success and needs to move forward to retrieveAssistant
        await logActivity(ctx, "PollingResults: completed", JSON.stringify({ef_log_id: ctx.ef_log_id}));
        // Since Polling Completed we can retrieve the response
        const retrieveAssistantResponse = await retrieveAssistant(ctx);

        if(!retrieveAssistantResponse.success){
          console.error("retrieveAssistant failed:", retrieveAssistantResponse.reason);
          await logActivity(ctx, "retrieveAssistant failed at mainWorkflow", JSON.stringify({ef_log_id: ctx.ef_log_id}));
          await setStatus(ctx, "RetrieveNeeded");  //Router trigger Status
          break; //early break on switch if retrieval failed.
        }
        const assistantResponse = retrieveAssistantResponse.data;
        const messages = assistantResponse?.data || [];
        const assistantMessage = messages.find((msg: any) => msg.role === "assistant");
        const assistantText = assistantMessage?.content?.[0]?.text?.value || null;

        if (assistantText && ctx.wf_record?.id) {
          const { error: assistantTextError } = await ctx.supabase
            .from(ctx.wf_table)
            .update({
              iteration_json: assistantText,
            })
            .eq("id", ctx.wf_record.id);

          if (assistantTextError) {
            console.error("❌ Failed to save assistantText:", assistantTextError);
          } else {
            console.log("✅ Saved assistantText");
          }
          await setStatus(ctx, "Check Loop Batch");
        }
      break;
      default:
        // indicates the polling response had a runStatus we have not accounted for possibly a new status code
        await setStatus(ctx, "Halt:PollingResults:UnknownRunStatus");
        await logActivity(ctx, "PollingResults: UnknownRunStatus", JSON.stringify({ef_log_id: ctx.ef_log_id, runStatus}));
    }
  }



  // Router EF (ensure you set ctx.token in serve)
  try {
    await callEdgeFunction(
      "ef_router_wf_assistant_automation_control",
      { request_id: ctx.request_id },
      ctx.token
    );
  } catch (e: any) {
    await logEFError(ctx, {
      efName: "ef_step_assistant_RequestNextBatch",
      functionName: "mainWorkflow",
      error_message: e?.message || String(e),
      relevant_data: { ef_log_id: ctx.ef_log_id, stage: "router_call" },
    });
    await logActivity(
      ctx,
      "Router:InvokeFailed",
      JSON.stringify({ ef_log_id: ctx.ef_log_id })
    );
    // Don't throw; state is already durable.
  }

  return { success: true };

}//END OF mainWorkflow



/**
 * Orchestrates the assistant bootstrap sequence (RequestNextBatchResponse → RunThread),
 * persists generated IDs, updates workflow status milestones, and returns a minimal result.
 *
 * Flow
 * 1) **RequestNextBatch**
 *    - `handlePhaseCall({ phase: "RequestNextBatchResponse", ctx })`
 *    - On failure: returns `{ success: false, reason: "RequestNextBatchResponseFail" }`
 *    - On success: `setStatus(ctx, "InitialMessage:Posted", ...)`
 *
 * 3) **RunThread**
 *    - `handlePhaseCall({ phase: "RunThread", ctx })`
 *    - On failure: returns `{ success: false, reason: "RunThreadResponseFail" }`
 *    - On success: persists `ctx.ids.run_id` to `ctx.wf_table` and `setStatus(ctx, "Run:Started", ...)`
 *    - Final return: bubbles the minimal result from RunThread (i.e., `{ success: true, data }`)
 *
 * Side effects
 * - Updates DB rows in `ctx.wf_table` (thread_id / run_id) via Supabase.
 * - Emits status transitions via `setStatus` (best-effort).
 * - On DB persist errors, logs via `logEFError` (best-effort) and continues.
 *
 * @async
 * @function RequestNextBatchResponse
 * @param {EFContext} ctx
 *   Execution context containing:
 *   - `supabase`, `wf_table`, `wf_record` (with `id`, `wf_assistant_name`),
 *   - `ef_log_id`, `http_Request_Key`,
 *   - `ids` (mutated during phases: `thread_id`, `message_id`, `run_id`),
 *   - other fields consumed by lower layers (`handlePhaseCall`, `setStatus`).
 *
 * @returns {Promise<
 *   | { success: true; data: any }
 *   | { success: false; reason: "CreateThreadFail" | "InitialMessageFail" | "RunThreadResponseFail" }
 * >}
 *   - Early exits with `{ success:false, reason }` when a phase fails.
 *   - On success, returns the result from the **RunThread** phase unchanged.
 *
 * @example
 * const r = await RequestNextBatchResponse(ctx);
 * if (!r.success) {
 *   // r.reason ∈ { "CreateThreadFail", "InitialMessageFail", "RunThreadResponseFail" }
 *   // handle / retry / surface to caller
 * } else {
 *   // Use r.data (parsed JSON from the RunThread call)
 * }
 *
 * @notes
 * - This function does not throw; callers should branch on `result.success`.
 * - Persist failures for `thread_id` / `run_id` are logged via `logEFError` and do not abort the flow.
 */
async function RequestNextBatch(ctx: EFContext) {

  /************ Step 1: RequestNextBatch ************/
  const RequestNextBatchResponse =
    await handlePhaseCall({
      phase: "RequestNextBatch",
      ctx,
    });

  if(!RequestNextBatchResponse.success){
    return{ success: false, reason: "RequestNextBatchResponseFail"};
  }

  await setStatus(ctx, "RequestNextBatchResponse:Posted", `message_id: ${ ctx.ids.message_id }`);


  /************ Step 2: RunThread ************/
  const runThreadResponse =
    await handlePhaseCall({
      phase: "RunThread",
      ctx,
    });

  if(!runThreadResponse.success){
    return{ success: false, reason: "RunThreadResponseFail"};
  }

  // persist run_id
  if (ctx.ids.run_id && ctx.wf_record?.id) {
    const { error: runIDUpdateError } = await ctx.supabase
      .from(ctx.wf_table)
      .update({ run_id: ctx.ids.run_id })
      .eq("id", ctx.wf_record.id);
    if (runIDUpdateError) {
      console.error("save run_id error:", runIDUpdateError);
      let args = {
        efName: "ef_step_assistant_RequestNextBatch",
        functionName: "RequestNextBatch",
        error_message: JSON.stringify(runIDUpdateError),
        relevant_data: { ef_log_id: ctx.ef_log_id},
      }
      await logEFError(ctx, args);
    }
  }

  await setStatus(ctx, "Run:Started", `run_id: ${ctx.ids.run_id}`);

  // return exactly what callers expect today
  return runThreadResponse;
} //END OF intializeAssistant

/**
 * Polls the assistant run status until it reaches a terminal state or limits are exceeded.
 *
 * Behavior
 * - Repeatedly calls `handlePhaseCall({ phase: "PollRunStatus", ctx })`.
 * - Reads `parsed.data.status` from the minimal result and, when it changes, updates the workflow
 *   status via `setStatus(ctx, "RunStatus:<status>")`.
 * - Returns early with `{ success: true }` when status is one of:
 *   `"completed" | "failed" | "cancelled" | "expired" | "requires_action"`.
 * - Returns `{ success: false, reason: "UnknownError" }` if no status is present in a poll response.
 * - Continues polling (sleeping `ctx.polling.pollIntervalMs` between attempts) until either:
 *   - attempts reach `ctx.polling.maxAttempts` → `{ success: false, reason: "MaxAttempts" }`, or
 *   - elapsed time since `ctx.efStartTime` exceeds `ctx.polling.timeoutLimitMs` → `{ success: false, reason: "TimedOut" }`.
 *
 * Side effects
 * - Calls `setStatus` when `status` changes (best-effort).
 * - Updates `ctx.dynamic.last_run_status` to de-duplicate status writes.
 *
 * @async
 * @function pollAssistant
 * @param {EFContext} ctx
 *   Execution context with:
 *   - `efStartTime: number` (ms since epoch when EF started),
 *   - `polling: { timeoutLimitMs: number; maxAttempts: number; pollIntervalMs: number }`,
 *   - `ids.run_id?: string` (for status notes),
 *   - `dynamic.last_run_status?: string` (will be updated),
 *   - other fields consumed by `handlePhaseCall`/`setStatus`.
 *
 * @returns {Promise<
 *   | { success: true }
 *   | { success: false; reason: "UnknownError" | "MaxAttempts" | "TimedOut" }
 * >}
 *
 * @example
 * const r = await pollAssistant(ctx);
 * if (!r.success) {
 *   // Branch on r.reason: "UnknownError" | "MaxAttempts" | "TimedOut"
 *   // Decide whether to retry, reschedule polling, or surface an error.
 * } else {
 *   // Terminal state reached (e.g., completed/failed/cancelled/expired/requires_action).
 * }
 *
 * @notes
 * - This function never throws; callers should branch on `result.success`.
 * - Assumes `handlePhaseCall("PollRunStatus")` returns a minimal result with a payload that
 *   includes `data.status` when the provider responds successfully.
 */
async function pollAssistant(ctx: EFContext)
{
let elapsedMs = Date.now() - ctx.efStartTime;
let attemptCount = 0; //Start at 0
let runStatusResponse; //container to carry outside of loop scope
let currentAttempt; //container for outside of loop scope
let reason = "Not set yet"; //used to return reason of early return


//Loop until time limit hit or max attempts hit
while (elapsedMs < ctx.polling.timeoutLimitMs && attemptCount < ctx.polling.maxAttempts) {
  
  // call poll http at begining of each loop
  const pollRunStatusResponse = await handlePhaseCall({
  phase: "PollRunStatus", //Should match run_type of http record you want to use
  ctx,
  });
  
  const parsed = pollRunStatusResponse;
  const runStatus = parsed?.data?.status;
  
  // only write when we actually have a status (and when it changed)
if (runStatus && ctx.dynamic.last_run_status !== runStatus) {
  await setStatus(ctx, `RunStatus:${runStatus}` as WorkflowStatus, `run_id: ${ctx.ids.run_id}`);
  ctx.dynamic.last_run_status = runStatus; // optional de-dupe
}

  // If there is no status this is likely an error response, pass it on
  if(!runStatus){
      return { success: false, reason: "UnknownError" };
  };


  // if the status contains a value that indicates its finished return response
  if (["completed", "failed", "cancelled", "expired", "requires_action"].includes(runStatus)) {
    return{ success: true, data: {runStatus: runStatus} };
  }


  // Response did not indicate we were finished
  // (Pause before next poll) - Wait before next poll iteration 
  await new Promise((resolve) => setTimeout(resolve, ctx.polling.pollIntervalMs));

  // Update loop itteration variables
  attemptCount += 1; //increment by 1
  currentAttempt = attemptCount;
  console.log(`poll batch: ${ctx.ef_log_id} || atempt: ${attemptCount} || EF Time Elapsed: ${Date.now() - ctx.efStartTime}`);
  runStatusResponse = parsed;
  elapsedMs = Date.now() - ctx.efStartTime;
} // End of while (elapsedMs < timeoutLimitMs or maxAttempts reached)

// If we reached this point, polling timed out or exceded count
if(currentAttempt === ctx.polling.maxAttempts){
  reason = "MaxAttempts";
}
else {
  reason = "TimedOut";
}
return{ success: false, reason};

} // END OF pollAssistant



/**
 * Retrieves the assistant's latest messages by executing the `"GetResponse"` phase.
 *
 * Delegates all lookup/config work to `handlePhaseCall({ phase: "GetResponse", ctx })`
 * and returns its minimal result unchanged.
 *
 * @async
 * @function retrieveAssistant
 * @param {EFContext} ctx
 *   Execution context used by `handlePhaseCall` to resolve HTTP mapping and perform the request.
 *
 * @returns {Promise<{ success: true, data: any } | { success: false }>}
 *   - `{ success: true, data }` when the provider call and JSON parse succeed
 *     (e.g., Assistants API list: `{ object: "list", data: [...], has_more: false }`).
 *   - `{ success: false }` if mapping lookup or the network call fails (details are logged downstream).
 *
 * @example
 * const r = await retrieveAssistant(ctx);
 * if (!r.success) {
 *   // handle failure or retry; details are in logs
 * } else {
 *   const messages = Array.isArray(r.data?.data) ? r.data.data : [];
 *   // ...inspect messages for the assistant reply
 * }
 *
 * @notes
 * - This function is a thin wrapper and never throws; branch on `result.success`.
 * - Logging and `ctx.ids` updates, if any, are handled by lower layers.
 */
async function retrieveAssistant(ctx: EFContext) {
  // Use ctx for actual values passed to handlePhaseCall
  const getResponseResponse = await handlePhaseCall({
      phase: "GetResponse",
      ctx,
    });

  return getResponseResponse;
} // END OF retrieveAssistant


/**
 * Resolves HTTP call configuration for a given assistant phase, updates `ctx`, and
 * delegates the network request to `constructLLMCall`, returning a minimal result.
 *
 * Behavior
 * - Looks up the HTTP mapping for this phase in `http_request_mapping_warehouse`
 *   using `ctx.http_Request_Key`, `call_logic_key = "RunGPTAssistant"`, and `run_type = phase`.
 *   On failure (no row or DB error), logs via `logEFError` and returns `{ success: false }`.
 * - Loads the assistant script mapping from `wf_script_mapping_warehouse` using
 *   `ctx.wf_record.wf_assistant_name`. On failure, logs via `logEFError` and returns `{ success: false }`.
 * - Hydrates `ctx.httpWarehouse` fields from the mapping (run_type, call_logic_key, request_purpose,
 *   provider, request_method, request_url, content_type, model, temperature).
 * - Sets `ctx.assistant_id` from the script mapping (used by certain phases like RunThread).
 * - Calls `constructLLMCall(ctx)` which performs the HTTP request and returns
 *   `{ success: true, data }` or `{ success: false }`. That result is returned unmodified.
 *
 * Side effects
 * - Mutates `ctx.httpWarehouse` and `ctx.assistant_id`.
 * - Emits best-effort error logs via `logEFError` on lookup failures; does not throw.
 *
 * @async
 * @function handlePhaseCall
 * @param {Object} params
 * @param {string} params.phase
 *   Phase/run_type to execute (e.g., "CreateThread", "InitialMessage", "RunThread", "PollRunStatus", "GetResponse").
 * @param {EFContext} params.ctx
 *   Execution context containing `supabase`, `http_Request_Key`, `wf_record.wf_assistant_name`,
 *   and a mutable `httpWarehouse` object to be populated.
 *
 * @returns {Promise<{ success: true, data: any } | { success: false }>}
 *   - `{ success: false }` if either mapping lookup fails or an unexpected error occurs.
 *   - The exact result from `constructLLMCall(ctx)` otherwise (minimal contract).
 *
 * @example
 * const r = await handlePhaseCall({ phase: "InitialMessage", ctx });
 * if (!r.success) {
 *   await setStatus(ctx, "Error", "InitialMessage failed");
 *   // handle failure or retry
 * } else {
 *   // r.data is the parsed JSON payload from the LLM provider
 * }
 *
 * @notes
 * - This function never throws; callers should branch on `result.success`.
 * - `call_logic_key` is fixed to "RunGPTAssistant" in the mapping lookup.
 * - Ensure `ctx.http_Request_Key` and `ctx.wf_record.wf_assistant_name` are set before calling.
 */
async function handlePhaseCall({
  phase,
  ctx,
}: {
  phase: string;
  ctx: EFContext;
}){

  //Get the default http values for phase/run_type
  let httpWarehouse_record;
  try {
    const { data, error } = await ctx.supabase
      .from("http_request_mapping_warehouse")
      .select("*")
      .eq("request_key", ctx.http_Request_Key)
      .eq("call_logic_key", "RunGPTAssistant")
      .eq("run_type", phase)
      .single();

    if (error || !data) {
      console.error(`handlePhaseCall/${phase}: Failed to fetch http_request_mapping_warehouse record:`, error);
            const relevant = {
              ef_log_id: ctx.ef_log_id,
              wf_table: ctx.wf_table,
              wf_record_id: ctx.wf_record?.id,
              assistant: ctx.wf_record?.wf_assistant_name ?? ctx.assistant_key,
              ids: { ...ctx.ids }, // thread_id, run_id, message_id
              http: {
                url: ctx.httpWarehouse?.request_url,
                method: ctx.httpWarehouse?.request_method,
                run_type: ctx.httpWarehouse?.run_type,
                provider: ctx.httpWarehouse?.provider,
                model: ctx.httpWarehouse?.model,
              },
              http_Request_Key: ctx.http_Request_Key,
            };
            await logEFError(ctx, {
              efName: "ef_step_assistant_RequestNextBatch",
              functionName: "handlePhaseCall",
              error_message: `handlePhaseCall/${phase}: Failed to fetch http_request_mapping_warehouse record: ${error}`,
              relevant_data: relevant,            // small, JSON-safe object
            });
      return { success: false, reason: "Error retrieving http_mapping_warehouse record" };
    }

    httpWarehouse_record = data;
      ctx.httpWarehouse.run_type = httpWarehouse_record.run_type;
      ctx.httpWarehouse.call_logic_key = httpWarehouse_record.call_logic_key;
      ctx.httpWarehouse.request_purpose = httpWarehouse_record.request_purpose;
      ctx.httpWarehouse.provider = httpWarehouse_record.provider;
      ctx.httpWarehouse.request_method = httpWarehouse_record.request_method;
      ctx.httpWarehouse.request_url = httpWarehouse_record.request_url;
      ctx.httpWarehouse.content_type = httpWarehouse_record.content_type;
      ctx.httpWarehouse.model = httpWarehouse_record.model;
      ctx.httpWarehouse.temperature = httpWarehouse_record.temperature;

  } catch (error) {
    console.error(`handlePhaseCall/${phase}/http_request_mapping_warehouse: Unexpected error:`, error);
            const relevant = {
              ef_log_id: ctx.ef_log_id,
              wf_table: ctx.wf_table,
              wf_record_id: ctx.wf_record?.id,
              assistant: ctx.wf_record?.wf_assistant_name ?? ctx.assistant_key,
              ids: { ...ctx.ids }, // thread_id, run_id, message_id
              http: {
                url: ctx.httpWarehouse?.request_url,
                method: ctx.httpWarehouse?.request_method,
                run_type: ctx.httpWarehouse?.run_type,
                provider: ctx.httpWarehouse?.provider,
                model: ctx.httpWarehouse?.model,
              },
              http_Request_Key: ctx.http_Request_Key,
            };
            await logEFError(ctx, {
              efName: "ef_step_assistant_RequestNextBatch",
              functionName: "handlePhaseCall",
              error_message: `handlePhaseCall/${phase}/http_request_mapping_warehouse: Unexpected error: ${error}`,
              relevant_data: relevant,            // small, JSON-safe object
            });
    return { success: false, reason: "Error retrieving http_mapping_warehouse record" };
  }

  // Get the assistant_id which is only used in CreateThread phase
  let scriptMapping_record;
  try {
    const { data, error } = await ctx.supabase
      .from("wf_script_mapping_warehouse")
      .select("*")
      .eq("wf_assistant_name", ctx.wf_record.wf_assistant_name)
      .single();

    if (error || !data) {
      console.error(`handlePhaseCall/${phase}/http_request_mapping_warehouse: Failed to fetch wf_script_mapping_warehouse record:`, error);
        const relevant = {
          ef_log_id: ctx.ef_log_id,
          wf_table: ctx.wf_table,
          wf_record_id: ctx.wf_record?.id,
          assistant: ctx.wf_record?.wf_assistant_name ?? ctx.assistant_key,
          ids: { ...ctx.ids }, // thread_id, run_id, message_id
          http: {
            url: ctx.httpWarehouse?.request_url,
            method: ctx.httpWarehouse?.request_method,
            run_type: ctx.httpWarehouse?.run_type,
            provider: ctx.httpWarehouse?.provider,
            model: ctx.httpWarehouse?.model,
          },
          http_Request_Key: ctx.http_Request_Key,
        };
        await logEFError(ctx, {
          efName: "ef_step_assistant_RequestNextBatch",
          functionName: "handlePhaseCall",
          error_message: `handlePhaseCall/${phase}/http_request_mapping_warehouse: Failed to fetch wf_script_mapping_warehouse record: ${error}`,
          relevant_data: relevant,            // small, JSON-safe object
        });
      return { success: false, reason: "Error retrieving wf_script_mapping_warehouse record" };
    }

    scriptMapping_record = data;

  } catch (error) {
    console.error(`handlePhaseCall/${phase}/wf_script_mapping_warehouse: Unexpected error:`, error);
      const relevant = {
        ef_log_id: ctx.ef_log_id,
        wf_table: ctx.wf_table,
        wf_record_id: ctx.wf_record?.id,
        assistant: ctx.wf_record?.wf_assistant_name ?? ctx.assistant_key,
        ids: { ...ctx.ids }, // thread_id, run_id, message_id
        http: {
          url: ctx.httpWarehouse?.request_url,
          method: ctx.httpWarehouse?.request_method,
          run_type: ctx.httpWarehouse?.run_type,
          provider: ctx.httpWarehouse?.provider,
          model: ctx.httpWarehouse?.model,
        },
        http_Request_Key: ctx.http_Request_Key,
      };
      await logEFError(ctx, {
        efName: "ef_step_assistant_RequestNextBatch",
        functionName: "handlePhaseCall",
        error_message: `handlePhaseCall/${phase}/wf_script_mapping_warehouse: Unexpected error: ${error}`,
        relevant_data: relevant,            // small, JSON-safe object
      });
    return { success: false, reason: "Error retrieving http_mapping_warehouse record" };
  }

  //Update ctx with assistant_id
  ctx.assistant_id = scriptMapping_record.assistant_id;

  // Execute the CreateTread http call
  const llmCallResponse = await constructLLMCall(ctx);


return llmCallResponse;
} // END OF handlePhaseCall



/**
 * Constructs an LLM HTTP call from `ctx.httpWarehouse` (headers, URL templating, body by run_type),
 * delegates the network request to `runHttpRequest`, and returns a minimal result.
 *
 * Behavior
 * - Validates required context:
 *   - `ctx.assistant_id` must exist for relevant run types (e.g., RunThread).
 *   - `ctx.http_Request_Key` must be set.
 *   If either is missing, the function logs via `logEFError` and returns `{ success: false }`.
 * - Builds provider-specific headers (Authorization, beta flags, OpenRouter/Google keys, etc.).
 * - Performs URL templating:
 *   - Replaces `{{thread_id}}` and/or `{{run_id}}` in `ctx.httpWarehouse.request_url` when required by run_type.
 * - Builds the request body per run_type:
 *   - `InitialMessage`: sets `role="user"` and composes `content` from `ctx.wf_record.gpt_prompt`/`gpt_json`.
 *   - `RunThread`: includes `model`, `assistant_id`, and optional `temperature`.
 *   - Other run types: minimal/empty body unless specified.
 * - Calls `runHttpRequest({ headers, body, ctx })` which performs the fetch, parses JSON, logs the attempt,
 *   updates `ctx.ids` when applicable, and returns `{ success, data? }`.
 * - Catches unexpected exceptions, logs via `logEFError`, and returns `{ success: false }`.
 *
 * Side effects
 * - Mutates `ctx.httpWarehouse.request_url` in-place when performing `{{thread_id}}`/`{{run_id}}` substitutions.
 * - Emits error logs via `logEFError` on validation/exception paths (best-effort; never throws here).
 * - Network logging and ID updates are handled inside `runHttpRequest`.
 *
 * @async
 * @function constructLLMCall
 * @param {EFContext} ctx
 *   Execution context containing: `httpWarehouse` (provider, run_type, request_url/method, model, content_type, temperature),
 *   `wf_record` (prompt/json), `ids` (thread/run/message), `assistant_id`, `http_Request_Key`, and Supabase client used by loggers.
 *
 * @returns {Promise<{ success: true, data: any } | { success: false }>}
 *   - `{ success: true, data }` when the underlying HTTP call and JSON parse succeed (payload already parsed).
 *   - `{ success: false }` on validation failure or unexpected exception (details are recorded via logging).
 *
 * @example
 * const r = await constructLLMCall(ctx);
 * if (!r.success) {
 *   // handle failure (error details are in logs / ctx), e.g., setStatus(ctx, "Error")
 * } else {
 *   // use r.data (already JSON; large `instructions` removed downstream)
 * }
 *
 * @notes
 * - This function never throws; callers should branch on `result.success`.
 * - Ensure sensitive values are redacted upstream; headers/body are constructed from `ctx`.
 * - Provider selection is based on `(ctx.httpWarehouse.provider || "").toUpperCase()`.
 */
async function constructLLMCall(ctx: EFContext) {

// Validate assistant_id is present
const rt = (ctx.httpWarehouse.run_type || "").toLowerCase();
const needsAssistantId = rt === "runthread";
if (needsAssistantId && !ctx.assistant_id) {
  console.error(
    `❌ constructLLMCall: missing assistant_id for assistant "${ctx.wf_record.wf_assistant_name}". ` +
    `Check wf_script_mapping_warehouse.assistant_id. ` +
    `context: thread_id=${ctx?.ids?.thread_id ?? "—"}, http_request_key=${ctx.http_Request_Key}, url=${ctx.httpWarehouse.request_url}`
  );

      const relevant = {
        ef_log_id: ctx.ef_log_id,
        wf_table: ctx.wf_table,
        wf_record_id: ctx.wf_record?.id,
        assistant: ctx.wf_record?.wf_assistant_name ?? ctx.assistant_key,
        ids: { ...ctx.ids }, // thread_id, run_id, message_id
        http: {
          url: ctx.httpWarehouse?.request_url,
          method: ctx.httpWarehouse?.request_method,
          run_type: ctx.httpWarehouse?.run_type,
          provider: ctx.httpWarehouse?.provider,
          model: ctx.httpWarehouse?.model,
        },
        http_Request_Key: ctx.http_Request_Key,
      };
      await logEFError(ctx, {
      efName: "ef_step_assistant_RequestNextBatch",
      functionName: "constructLLMCall",
      error_message:  `missing assistant_id for assistant "${ctx.wf_record.wf_assistant_name}". ` +
    `Check wf_script_mapping_warehouse.assistant_id. ` +
    `context: thread_id=${ctx?.ids?.thread_id ?? "—"}, http_request_key=${ctx.http_Request_Key}, url=${ctx.httpWarehouse.request_url}`,
      relevant_data: relevant,            // small, JSON-safe object
    });
  return { success: false, reason: "constructLLMCall missing assistant_id" };
}

//Validate request_key is present
if(!ctx.http_Request_Key){
    const relevant = {
      ef_log_id: ctx.ef_log_id,
      wf_table: ctx.wf_table,
      wf_record_id: ctx.wf_record?.id,
      assistant: ctx.wf_record?.wf_assistant_name ?? ctx.assistant_key,
      ids: { ...ctx.ids }, // thread_id, run_id, message_id
      http: {
        url: ctx.httpWarehouse?.request_url,
        method: ctx.httpWarehouse?.request_method,
        run_type: ctx.httpWarehouse?.run_type,
        provider: ctx.httpWarehouse?.provider,
        model: ctx.httpWarehouse?.model,
      },
      http_Request_Key: ctx.http_Request_Key,
    };
    await logEFError(ctx, {
    efName: "ef_step_assistant_RequestNextBatch",
    functionName: "constructLLMCall",
    error_message: "http_request_key must be supplied to constructLLMCall!",
    relevant_data: relevant,            // small, JSON-safe object
  });
return { success: false, reason: "constructLLMCall did not have http_Request_Key" };
}

try{
    //Setup HTTP from provided values
    const apiKeyEnvKey = ctx.httpWarehouse.provider ? `${ctx.httpWarehouse.provider.toUpperCase()}_API_KEY` : null;
    const apiKey = apiKeyEnvKey ? Deno.env.get(apiKeyEnvKey) : null;

    //Handle headers based on provider specificaitons
    let headers = {
    "Content-Type": ctx.httpWarehouse.content_type || "application/json", //All providers need application/json
    };
    //Handle speacialty LLM headers
    switch ((ctx.httpWarehouse.provider || "").toUpperCase()) {
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
  if (ctx.httpWarehouse.run_type?.toLowerCase() === "createthread") {
    //none currently used in body
  }
  
  if (ctx.httpWarehouse.run_type?.toLowerCase() === "initialmessage") { 
    //Update URL Template
    ctx.httpWarehouse.request_url = ctx.httpWarehouse.request_url.replace("{{thread_id}}", ctx?.ids?.thread_id);
    //These parameters are not accepted in CreateTread Assistant API Calls
    http_body.role = "user";
    http_body.content = `${ctx.wf_record.gpt_prompt} ${ctx.wf_record.gpt_json}`.trim();
  }

  if (ctx.httpWarehouse.run_type?.toLowerCase() === "pollrunstatus") { 
    //Update URL Template
    ctx.httpWarehouse.request_url = ctx.httpWarehouse.request_url.replace("{{thread_id}}", ctx?.ids?.thread_id);
    ctx.httpWarehouse.request_url = ctx.httpWarehouse.request_url.replace("{{run_id}}", ctx?.ids?.run_id);
  }

  if (ctx.httpWarehouse.run_type?.toLowerCase() === "runthread") { 
    //Update URL Template
    ctx.httpWarehouse.request_url = ctx.httpWarehouse.request_url.replace("{{thread_id}}", ctx?.ids?.thread_id);
    http_body.model = ctx.httpWarehouse.model;
    http_body.assistant_id = ctx.assistant_id;
    //Only include if its provided and not null otherwise let the LLM use its internal default for temperature
    if (ctx.httpWarehouse.temperature !== undefined) {
      http_body.temperature = ctx.httpWarehouse.temperature;
      }
  }

  if (ctx.httpWarehouse.run_type?.toLowerCase() === "getresponse") { 
    //Update URL Template
    ctx.httpWarehouse.request_url = ctx.httpWarehouse.request_url.replace("{{thread_id}}", ctx?.ids?.thread_id);
  }

if (ctx.httpWarehouse.run_type?.toLowerCase() === "requestnextbatch") {
  const prompt_result = await fetchSingleRecord({
    tableName: "wf_assistant_prompt_warehouse",
    keyField: "assistant_name",
    request_key: ctx.wf_record?.wf_assistant_name ?? ctx.assistant_key,
    ctx,
  });
  if (!prompt_result?.success) {
    await logEFError(ctx, {
      efName: "ef_step_assistant_RequestNextBatch",
      functionName: "constructLLMCall",
      error_message: "Missing next_batch_prompt mapping",
      relevant_data: { assistant: ctx.wf_record?.wf_assistant_name },
    });
    return { success: false, reason: "MissingNextBatchPrompt" };
  }
  const prompt_record = prompt_result.returned_record;

  ctx.httpWarehouse.request_url =
    ctx.httpWarehouse.request_url.replace("{{thread_id}}", ctx.ids.thread_id || "");

  http_body.role = "user";
  http_body.content = prompt_record.next_batch_prompt;
}


  //Function call to send reqeust to LLM
  const rr = await runHttpRequest({
    headers,
    body: http_body,
    ctx,
  });

  //SUCCESS PATH
  //Passes the response on with either {success: true, data} or {success: false}
  return rr;
}
catch (err) {
  console.error("POST Error:", err);

  const relevant = {
    ef_log_id: ctx.ef_log_id,
    wf_table: ctx.wf_table,
    wf_record_id: ctx.wf_record?.id,
    assistant: ctx.wf_record?.wf_assistant_name ?? ctx.assistant_key,
    ids: { ...ctx.ids }, // thread_id, run_id, message_id
    http: {
      url: ctx.httpWarehouse?.request_url,
      method: ctx.httpWarehouse?.request_method,
      run_type: ctx.httpWarehouse?.run_type,
      provider: ctx.httpWarehouse?.provider,
      model: ctx.httpWarehouse?.model,
    },
    http_Request_Key: ctx.http_Request_Key,
  };

  await logEFError(ctx, {
    efName: "ef_step_assistant_RequestNextBatch",
    functionName: "constructLLMCall",
    error_message: err,                 // your helper normalizes this
    relevant_data: relevant,            // small, JSON-safe object
  });

  return { success: false, reason: `constructLLMCall error: ${err}` };
}
} //END OF constructLLMCall



/**
 * Executes a single HTTP request using metadata from `ctx.httpWarehouse`, logs the attempt,
 * and returns a minimal success flag plus the parsed response payload.
 *
 * Behavior:
 * - Builds fetch options from `ctx.httpWarehouse.request_method`, provided `headers`, and optional `body`.
 * - Performs `fetch(ctx.httpWarehouse.request_url, …)`, measures duration, and parses `response.json()`.
 * - Strips a top-level `instructions` field from the parsed payload (to avoid bloating upstream).
 * - Chooses the logging table:
 *     - `"llm_polling_request_tracking"` when `run_type === "pollrunstatus"` **and** the payload status is one of
 *       `queued|in_progress|cancelling`; otherwise `"llm_request_tracking"`.
 * - Writes a best-effort telemetry row via `logLLMRequest` (never throws). If the payload contains a
 *   top-level `error`, it is treated as a **soft error** for logging purposes (status_code coerced to 500),
 *   but this function still returns `success: true` so callers can decide how to handle it.
 * - Updates contextual IDs on success:
 *     - `ctx.ids.thread_id` when `data.object === "thread"`
 *     - `ctx.ids.message_id` when `data.object === "thread.message"`
 *     - `ctx.ids.run_id` when `data.object === "thread.run"`
 *
 * Failure handling:
 * - Network/timeout/parse exceptions are caught; the error is logged best-effort via `logLLMRequest`,
 *   and the function resolves with `{ success: false }`.
 *
 * @async
 * @function runHttpRequest
 *
 * @param {Object} params
 * @param {Record<string,string>} [params.headers={}]
 *   Optional HTTP headers to include in the request.
 * @param {any} [params.body=null]
 *   Optional request body. If provided and method is not GET, it is JSON.stringified.
 * @param {EFContext} params.ctx
 *   Execution context that supplies `httpWarehouse` (request URL/method, run_type), `ids`, and the Supabase client
 *   used by `logLLMRequest`.
 *
 * @returns {Promise<{success: true, data: any} | {success: false}>}
 *   - `{ success: true, data }` when the request and JSON parse succeed (even if the payload contains a soft `error`).
 *   - `{ success: false }` when the request/parse throws; details are captured in logs rather than the return.
 *
 * @example
 * const res = await runHttpRequest({ headers, body, ctx });
 * if (!res.success) {
 *   // handle transport/parse failure (already logged)
 *   return;
 * }
 * // handle successful HTTP/parse; inspect res.data and optionally check res.data.error for soft errors
 *
 * @notes
 * - This util is intentionally minimal: control flow uses `{ success }`; rich diagnostics live in your logs.
 * - Ensure any sensitive fields in `body` or headers are redacted upstream before calling.
 */
async function runHttpRequest({          
  headers = {},     // From logic in constructLLMCall
  body = null,      // From logic in constructLLMCall
  ctx,
  }: {
  headers?: Record<string, string>;
  body?: any;
  ctx: EFContext;
  }): Promise<{ success: true; data: any } | { success: false; reason: string }> {


//Scoped variables
let data;
let logTable: string = "llm_request_tracking"; 
  try {
      
      //Set baseline fetch options used in GET and POST
      const fetchOptions = {
        method: ctx.httpWarehouse.request_method,
        headers
      };
      //Add body to anything but GET
      if (ctx.httpWarehouse.request_method !== "GET" && body) {
        fetchOptions.body = JSON.stringify(body);
      } 

  

      //Make the fetch call with constructed sections
      const httpStartTime = Date.now(); //Used for calculating duration
      const response = await fetch(ctx.httpWarehouse.request_url, fetchOptions);
      const duration_ms = Date.now() - httpStartTime; //How long did this single http call take in milliseconds
      
      //log raw response to compare 
      //console.log(`Raw response for run_type(${logMeta.run_type}): `, response);

      //turn response into json and remove the giant instructions element before passing back up the function chain
      //instructions are the system instructions stored in the assistant Ui for that specific assistant
      data = await response.json();
      if ("instructions" in data) {
        const { instructions, ...tempData } = data;
        data = tempData;
      }
      //console.log(`🗝️ Keys in response for run_type: ${logMeta.run_type}`, Object.keys(data));

      //Determine if primary logging table or polling logging table should be used
      const runType = ctx?.httpWarehouse?.run_type ?? null;
      const status  = data?.status ?? null;
      const isPollingRun   = (runType || "").toLowerCase() === "pollrunstatus";
      const isActiveStatus = ["queued","in_progress","cancelling"].includes((data.status || "").toLowerCase());

      //console.log("logTable inputs:", { runType, status, isPollingRun, isActiveStatus, dataKeys: data ? Object.keys(data) : null });
      logTable = (isPollingRun && isActiveStatus)
        ? "llm_polling_request_tracking"
        : "llm_request_tracking";


  try {
        const isSoftError = !!data?.error; //Identify if field error is included in response even if it registers as a successful returned call(soft error)

        // ---- Update ids based on response object type ----
        if (data?.object === "thread" && data?.id) {
          ctx.ids.thread_id = data.id;
        }

        if (data?.object === "thread.message" && data?.id) {
          ctx.ids.message_id = data.id;
        }

        if (data?.object === "thread.run" && data?.id) {
          ctx.ids.run_id = data.id;
        }

        await logLLMRequest(
          {
            logTable,
            status_code: response.status === 200 && isSoftError ? 500 : response.status,
            duration_ms,
            request_payload: body,
            response_raw: data,
            error: isSoftError ? data.error : undefined, // optional
          },
          ctx
        );

      } catch (logErr) {
        console.warn("LLM Logging Failed in runHttpRequest:", logErr);
      }

      return { success: true, data };

  } catch (err: any) {
      try{
          await logLLMRequest(
            {
              logTable,
              status_code: 500,
              duration_ms: 0,
              request_payload: body,
              response_raw: undefined,
              error: err?.message || String(err),
            },
            ctx
          );
        } catch (logErr) {
          console.warn("LLM Logging Failed:", logErr);
          console.error("logLLMRequest error:", {
            message: logErr?.message,
            code: logErr?.code,
            details: logErr?.details,
            hint: logErr?.hint,
                });
          return { success: false, reason: `runHttpRequest error: ${err}` };
        }
    return { success: false, reason: `runHttpRequest error: ${err}` };
  }
  } //END OF runHttpRequest



 /**
 * Inserts a single request/response telemetry row into a tracking table (best-effort; never throws).
 *
 * Builds a payload from `ctx` (workflow IDs, HTTP metadata) plus the provided arguments and writes it to
 * the specified `logTable`. On insert failure, this function records the failure via `logEFError`, emits a
 * console error, and returns `{ success: false }` without interrupting the caller’s flow.
 *
 * @async
 * @function logLLMRequest
 *
 * @param {Object} args
 * @param {string} args.logTable
 *   Target table name to insert into (e.g., "llm_request_tracking" or "llm_polling_request_tracking").
 * @param {number} args.status_code
 *   HTTP status code (or 0 for client-side/network errors).
 * @param {number} args.duration_ms
 *   Total request duration in milliseconds.
 * @param {any} args.request_payload
 *   Request body/metadata you want logged (ensure secrets are redacted upstream).
 * @param {any} [args.response_raw]
 *   Raw response snapshot to log (string or object). Keep reasonably sized.
 * @param {string} [args.error]
 *   Optional client-side error text (e.g., timeout/network exception message).
 *
 * @param {EFContext} ctx
 *   Execution context supplying Supabase client and run metadata. Fields read include:
 *   - `ctx.supabase` (required)
 *   - `ctx.wf_record?.narrative_project_id`, `ctx.narrative_project_id`
 *   - `ctx.http_Request_Key`, `ctx.httpWarehouse?.{call_logic_key,request_purpose,provider,run_type,model,request_url,request_method}`
 *   - `ctx.ef_log_id`, `ctx.assistant_key`/`ctx.wf_record?.wf_assistant_name`
 *   - `ctx.ids?.{thread_id,run_id,message_id}`
 *
 * @returns {Promise<{success: true} | {success: false}>}
 *   Resolves with `{ success: true }` on successful insert.
 *   On insert failure, logs via `logEFError`, writes a console error, and resolves `{ success: false }`.
 *
 * @example
 * // Standard request log
 * await logLLMRequest(
 *   {
 *     logTable: "llm_request_tracking",
 *     status_code: 200,
 *     duration_ms: 512,
 *     request_payload: { url, method, headers, body },
 *     response_raw: { status: 200, bodyPreview },
 *   },
 *   ctx
 * );
 *
 * @example
 * // Polling log with an error captured
 * await logLLMRequest(
 *   {
 *     logTable: "llm_polling_request_tracking",
 *     status_code: 0,
 *     duration_ms: 60000,
 *     request_payload: { url, method, body },
 *     response_raw: { error: "AbortError: The operation was aborted" },
 *     error: "AbortError: timeout",
 *   },
 *   ctx
 * );
 *
 * @notes
 * - This util is **non-blocking**: failures to write the tracking row do not throw.
 * - Ensure any sensitive values in `request_payload` / `response_raw` are redacted before calling.
 */
async function logLLMRequest(
  {
    logTable,
    status_code,
    duration_ms,
    request_payload,
    response_raw,
    error,
  }: {
    logTable: string;
    status_code: number;
    duration_ms: number;
    request_payload: any;
    response_raw?: any;
    error?: string;
  },
  ctx: EFContext
) {
  // Build the row from ctx + dynamic args
  const logData = {
    narrative_project_id: ctx.wf_record?.narrative_project_id ?? ctx.narrative_project_id,
    request_key:          ctx.http_Request_Key,
    call_logic_key:       ctx.httpWarehouse?.call_logic_key,
    request_purpose:      ctx.httpWarehouse?.request_purpose,
    provider:             ctx.httpWarehouse?.provider,
    run_type:             ctx.httpWarehouse?.run_type,
    model:                ctx.httpWarehouse?.model,
    request_payload,
    response_raw,
    status_code,
    duration_ms,
    url:                  ctx.httpWarehouse?.request_url,
    method:               ctx.httpWarehouse?.request_method,
    error,
    ef_log_id:            ctx.ef_log_id,
    assistant_key:        ctx.assistant_key ?? ctx.wf_record?.wf_assistant_name,
    thread_id:            ctx.ids?.thread_id,
    run_id:               ctx.ids?.run_id,
    message_id:           ctx.ids?.message_id,
  };

    // Helper to keep huge fields readable
      const preview = (val: unknown, max = 600) => {
        try {
          const s = typeof val === "string" ? val : JSON.stringify(val);
          return s.length > max ? `${s.slice(0, max)}… [len=${s.length}]` : s;
        } catch (e:any) {
          return `[unserializable: ${e?.message}]`;
        }
      };

      const resp = await ctx.supabase.from(logTable).insert([logData]);
      const debugResp = { ...resp }; // shallow clone
      const { data, error: insert_error } = resp;

      if (insert_error) {
        const errorMsg =
        typeof insert_error === "string"
          ? insert_error
          : insert_error.message || JSON.stringify(insert_error);

        await logEFError(ctx, {
          efName: "ef_step_assistant_RequestNextBatch",
          functionName: "logLLMRequest",
          error_message: errorMsg,
          relevant_data: { response: debugResp, code: insert_error.code, table: logTable, keys: Object.keys(logData) }
        });
        console.error("❌ logLLMRequest insert failed", {
          table: logTable,
          error: errorMsg,
          code: insert_error.code,
          details: insert_error.details,
          hint: insert_error.hint,
        });
        return { success: false };
      }

    return {success: true};

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
  tableName,
  keyField,
  request_key,
  ctx,
}: {
  tableName: string;
  keyField: string;
  request_key: string;
  ctx: EFContext;
}) {
  try {
    const { data, error } = await ctx.supabase
      .from(tableName)
      .select("*")
      .eq(keyField, request_key)
      .single();

    if (error || !data) {
      console.error(`${tableName}: Failed to fetch record with ${keyField}=${request_key}`, error);
      let args = {
        efName: "ef_step_assistant_RequestNextBatch",
        functionName: "fetchSingleRecord",
        error_message: JSON.stringify(error),
        relevant_data: { 
          ef_log_id: ctx.ef_log_id,
          tableName: tableName,
          keyField: keyField,
          request_key: request_key
        },
      }
      await logEFError(ctx, args);
      return{ success: false };
    }

    return { success: true, returned_record: data };
  } catch (error: any) {
    console.error(`${tableName}: Unexpected error during fetchSingleRecord:`, error);
    let args = {
      efName: "ef_step_assistant_RequestNextBatch",
      functionName: "fetchSingleRecord",
      error_message: JSON.stringify(error),
      relevant_data: { 
        ef_log_id: ctx.ef_log_id,
        tableName: tableName,
        keyField: keyField,
        request_key: request_key
      },
    }
    await logEFError(ctx, args);
    return{ success: false };
  }
} // END OF fetchSingleRecord



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
 * Updates the workflow record's `status` and emits a best-effort activity log entry.
 * 
 * - Persists the new status to `ctx.wf_table` for the current `ctx.wf_record.id`.
 * - On DB update failure, returns `{ success: false, error }` and **does not** throw.
 * - On success, triggers `logActivity(ctx, status, details)` (non-blocking / best-effort)
 *   and returns `{ success: true }`.
 *
 * @async
 * @function setStatus
 *
 * @param {EFContext} ctx
 *   Execution context containing:
 *   - `supabase` (client, required)
 *   - `wf_table` (table name to update, required)
 *   - `wf_record.id` (row id to update, required)
 * @param {WorkflowStatus} status
 *   New workflow status to persist. One of:
 *   "InitialMessage:Started" | "Thread:Created" | "InitialMessage:Posted" |
 *   "Run:Started" | "RunStatus:queued" | "RunStatus:in_progress" | "RunStatus:cancelling" |
 *   "RunStatus:completed" | "RunStatus:failed" | "RunStatus:expired" | "RunStatus:requires_action" |
 *   "NextStepReady" | "Error"
 * @param {string} [details]
 *   Optional human-readable note; forwarded to `logActivity` for traceability.
 *
 * @returns {Promise<{success: true} | {success: false, error: any}>}
 *   - `{ success: true }` when the status row was updated successfully (activity log is best-effort).
 *   - `{ success: false, error }` when the DB update failed.
 *
 * @example
 * // Mark run as started and log a note
 * const r = await setStatus(ctx, "Run:Started", "Kickoff request posted");
 * if (!r.success) {
 *   // handle update failure (e.g., retry or escalate)
 *   console.error("Failed to set status:", r.error);
 * }
 *
 * @notes
 * - `logActivity` is called fire-and-forget; its own failure will not affect this function’s return value.
 * - Ensure `ctx.wf_table` and `ctx.wf_record.id` are set before calling.
 */
type WorkflowStatus =
  | "RequestNextBatch:Started"
  | "RequestNextBatch:Posted"
  | "RequestNextBatchResponse:Posted" // if you keep it
  | "InitialMessage:Started"
  | "Thread:Created"
  | "InitialMessage:Posted"
  | "Run:Started"
  | "RunStatus:queued"
  | "RunStatus:in_progress"
  | "RunStatus:cancelling"
  | "RunStatus:cancelled"
  | "RunStatus:completed"
  | "RunStatus:failed"
  | "RunStatus:expired"
  | "RunStatus:requires_action"
  | "NextStepReady"
  | "Error"
  | "PotentialRestart"
  | "PollingNeeded"
  | "Check Loop Batch"
  | "RetrieveNeeded"
  | "Halt:PollingResults:requires_action"
  | "Halt:PollingResults:UnknownRunStatus";


async function setStatus(
  ctx: EFContext,
  status: WorkflowStatus,
  details?: string,
) {
  // 1) Update control row
  const { error: updateErr } = await ctx.supabase
    .from(ctx.wf_table)
    .update({
      status,
    })
    .eq("id", ctx.wf_record.id);

  if (updateErr) {
    console.error("setStatus update error:", updateErr);
    return { success: false, error: updateErr };
  }

  // 2) Best-effort activity log
  logActivity(ctx, status, details);

  return { success: true };
} //END OF setStatus



/**
 * logEFError
 * Logs an error entry into the `ef_error_log` table for traceability across EF runs.
 *
 * @async
 * @function logEFError
 * @param {EFContext} ctx - The execution context containing `ef_log_id` and Supabase client.
 * @param {Object} args - The error logging parameters.
 * @param {string} args.efName - The name of the EF where the error occurred (e.g., "ef_step_assistant_InitialMessage").
 * @param {string} args.functionName - The function within the EF that triggered the error (e.g., "logLLMRequest").
 * @param {string} args.error_message - A short, human-readable error message.
 * @param {any} [args.relevant_data] - Optional relevant data for debugging. Will be stringified and truncated.
 *
 * @returns {Promise<void>} This function does not throw; it logs errors best-effort and falls back to console error if DB insertion fails.
 *
 * @example
 * await logEFError(ctx, {
 *   efName: "ef_step_assistant_RequestNextBatch",
 *   functionName: "logLLMRequest",
 *   error_message: insertError.message,
 *   relevant_data: { table: logTable, keys: Object.keys(logData) }
 * });
 */
type LogEFErrorArgs = {
  efName: string;
  functionName: string;
  error_message: string;
  relevant_data?: any; // you choose what to include at call-site
};

export async function logEFError(ctx: EFContext, args: LogEFErrorArgs) {
  logActivity(ctx, "Error_Captured", args);
  try {
    // Optional: redact obvious secrets
    const redact = (obj: any) => {
      const bad = ["apikey", "authorization", "token", "password", "secret"];
      try {
        const clone = JSON.parse(JSON.stringify(obj));
        const scrub = (o: any) => {
          if (!o || typeof o !== "object") return;
          for (const k of Object.keys(o)) {
            if (bad.includes(k.toLowerCase())) o[k] = "[REDACTED]";
            else scrub(o[k]);
          }
        };
        scrub(clone);
        return clone;
      } catch {
        return obj;
      }
    };

    // Clamp the text size to keep rows small (tweak limit as you prefer)
    const clampText = (s: string, limit = 10000) =>
      s.length <= limit ? s : `${s.slice(0, limit)}… [truncated len=${s.length}]`;

    const relevant_text =
      args.relevant_data === undefined
        ? null
        : clampText(
            (() => {
              try {
                return typeof args.relevant_data === "string"
                  ? args.relevant_data
                  : JSON.stringify(redact(args.relevant_data));
              } catch {
                return "[unserializable relevant_data]";
              }
            })()
          );

    const row = {
      ef_log_id: ctx.ef_log_id as string,
      ef_name: args.efName,
      function_name: args.functionName,
      error_message: args.error_message,
      relevant_data: relevant_text,
    };

    const { error } = await ctx.supabase.from("ef_error_log").insert(row);
    if (error) console.error("ef_error_log insert failed:", error.message);
  } catch (e: any) {
    console.error("logEFError crashed:", e?.message);
  }
} // END OF logEFError




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
