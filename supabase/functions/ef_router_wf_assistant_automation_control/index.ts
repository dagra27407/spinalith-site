// supabase/functions/ef_router_wf_assistant_automation_control.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/*************************************
 * GLOBAL VARIABLES
 * ***********************************/

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


export type EFContext = {
  supabase: any;
  user: any;
  token: string;
  request_id: string;
  wf_table: string;           // usually "wf_assistant_automation_control"
  ef_log_id: string;          // shared run id for logs
  efStartTime: Date;        // Date.now() at EF start
  wf_record?: any;            // set after fetchSingleRecord
  ids?: {                     // optional: used by other EFs
    thread_id?: string;
    run_id?: string;
    message_id?: string;
  };
};
serve(async (req) => {

  const ctx: EFContext = {
  supabase: undefined,
  user: undefined,
  token: undefined,
  request_id: undefined,
  wf_table: "wf_assistant_automation_control",
  ef_log_id,  // from your top-level const
  efStartTime // from your top-level const
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
    // Example insert with hardcoded title and authenticated user
    if (req.method === "POST") {

      //Pull the users auth token for use in next EF call
      const token = req.headers.get("Authorization")?.replace("Bearer ", ""); 
      if (!token) {
        return new Response(JSON.stringify({ error: "Missing token" }), {
        status: 400,
        headers: jsonHeaders,
        });
      }

      console.log(`run_assistant_job POST hast started`)
      const { request_id } = await req.json();
      console.log (`Started POST: run_assistant_job request_id: ${request_id}`)

      if (!request_id) {
          return new Response(JSON.stringify({ error: "Call to ef_router_wf_assistant_automation_control was missing request_id" }), {
          status: 400,
          headers: jsonHeaders
          });
      }

      ctx.token = token;
      ctx.request_id = request_id;
      ctx.supabase = supabase;
      ctx.user = user;
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
    }

    // ─────────────────────────────────────────────
    // ✅ Step 6: Fallback for unsupported methods
    // ─────────────────────────────────────────────
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
        status: 405,
        headers: jsonHeaders,
    });
});



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
 * @param {any} ctx.supabase - Supabase client instance
 * @param {any} ctx.user - Authenticated user object
 * @param {string} ctx.request_id - ID of the workflow control record
 *
 * @returns {Promise<void|Response>} - Returns nothing on success,
 * or a Response object if a failure occurs during retry management or data fetching.
 */
async function mainWorkflow(ctx: EFContext) {
  

/*******************************************************************************
   * Variable Declaration
   *******************************************************************************/
//destruct from ctx    
const { supabase, user, token, request_id, wf_table } = ctx;
    
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

    ctx.wf_record = wf_record;
    const testing = wf_record.testing_router_block;
    const status = wf_record.status;
    console.log(`Running logic for status: ${status}`);

    //Declare variables needed for calling next function
    let efName;
    let payload;
    let router;

    if(!testing){ // flag in table to prevent calling next EF in router process.  Used when testing isolated events
      switch (status) {
        case "Prep JSON":
            console.log(`→ CALLED FUNCTION: ef_step_PrepJSON | request_id: ${request_id}`);
            efName = "ef_step_assistant_PrepJSON";
                    payload = {
                      "request_id": request_id,
                      "mode": "pipeline",
                    }
                    router = await callEdgeFunction(efName, payload, token);
                    console.log(router);
            break;

        case "Prep Prompt":
            console.log(`→ CALLED FUNCTION: ef_step_PrepPrompt | request_id: ${request_id}`);
            efName = "ef_step_assistant_PrepPrompt";
                    payload = {
                      "request_id": request_id,
                    }
                    router = await callEdgeFunction(efName, payload, token);
                    console.log(router);
            break;

        case "Run GPT Assistant":
            console.log(`→ CALLED FUNCTION: ef_step_assistant_InitialMessage | request_id: ${request_id}`);
            efName = "ef_step_assistant_InitialMessage";
                    payload = {
                      "request_id": request_id,
                    }
                    router = await callEdgeFunction(efName, payload, token);
                    console.log(router);
            break;

        case "Check Loop Batch":
            console.log(`→ CALLED FUNCTION: ef_step_assistant_CheckLoopBatch | request_id: ${request_id}`);
            efName = "ef_step_assistant_CheckLoopBatch";
                    payload = {
                      "request_id": request_id,
                    }
                    router = await callEdgeFunction(efName, payload, token);
                    console.log(router);
            break;

        case "Request Next Batch":
            console.log(`→ CALLED FUNCTION: ef_step_assistant_RequestNextBatch | request_id: ${request_id}`);
            efName = "ef_step_assistant_RequestNextBatch";
                    payload = {
                      "request_id": request_id,
                    }
                    router = await callEdgeFunction(efName, payload, token);
                    console.log(router);
            break;

        case "Re-Send Last Response":
            console.log(`→ CALLED FUNCTION: retry_last_batch | request_id: ${request_id}`);
            efName = "ef_step_assistant_ReSendLastResponse";
                    payload = {
                      "request_id": request_id,
                    }
                    router = await callEdgeFunction(efName, payload, token);
                    console.log(router);
            break;

        case "Parse Response":
            console.log(`→ CALLED FUNCTION: ef_step_assistant_Parser | request_id: ${request_id}`);
            efName = "ef_step_assistant_Parser";
                    payload = {
                      "request_id": request_id,
                    }
                    router = await callEdgeFunction(efName, payload, token);
                    console.log(router);
            break;

        case "PollingNeeded":
          // Happens when initial call to poll for assistant response results in identifying pipeline
          // needs to continue polling for assistant completing and response ready to retrieve.
          console.log(`→ CALLED FUNCTION: ef_step_assistant_PollRunStatus | request_id: ${request_id}`);
            efName = "ef_step_assistant_PollRunStatus";
                    payload = {
                      "request_id": request_id,
                    }
                    router = await callEdgeFunction(efName, payload, token);
                    console.log(router);
            break;
            
        default:
            console.log(`⚠️ Unrecognized status: ${status} | request_id: ${request_id}`);
        }
      
    //Log router event in activityLog
    await logActivity(ctx, "Router:CalledEF", JSON.stringify({ status: ctx.wf_record.status }));

    return new Response(JSON.stringify({ success: true }), {
        headers: jsonHeaders,
    });
    }
    else{
      await logActivity(ctx, "Router:No EF Called", JSON.stringify({ status: "Testing = True" }));
    }; // END OF testing skip wrapper
  
    return new Response(
                      JSON.stringify({
                        outcome: "Complete",
                        message: "wf_record created",
                      }),
                      {
                        status: 200,
                        headers: jsonHeaders,
                      }
                    );


} //END OF mainWorkflow



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
