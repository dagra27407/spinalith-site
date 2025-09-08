// supabase/functions/ef_step_assistant_CreateWFRecord.ts


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
          wf_assistant_name,
          narrative_project_id,
          status,
        } = body || {};
        
        // Make sure wf_assistant_name was included in request
        if (!wf_assistant_name) {
          return new Response(JSON.stringify({ error: "ef_step_assistant_CreateWFRecord: Missing wf_assistant_name" }), {
            status: 400,
            headers: jsonHeaders,
          });
        }
        
        // Make sure narrative_project_id was included in request
        if (!narrative_project_id) {
          return new Response(JSON.stringify({ error: "ef_step_assistant_CreateWFRecord: Missing narrative_project_id" }), {
            status: 400,
            headers: jsonHeaders,
          });
        }

        // Make sure wf_assistant_name was included in request
        if (!status) {
          return new Response(JSON.stringify({ error: "ef_step_assistant_CreateWFRecord: Missing status" }), {
            status: 400,
            headers: jsonHeaders,
          });
        }
        



/*****************************************************************************************************************
  // ** MAIN LOGIC FOR THIS EF NEEDS TO GO HERE ********************************************************************
****************************************************************************************************************/
    //Run Main Proccess flow
    const mainProcess = await mainWorkflow({supabase, user, wf_assistant_name, narrative_project_id, status, token});

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
 *
 * @returns {Promise<void|Response>} - Returns nothing on success,
 * or a Response object if a failure occurs during retry management or data fetching.
 */
async function mainWorkflow({
  supabase,
  user,
  wf_assistant_name,
  narrative_project_id,
  status,
  token,
}: {
  supabase: any;
  user: any;
  wf_assistant_name: string;
  narrative_project_id: string;
  status: string;
  token: string;
}) {

/*******************************************************************************
   * Variable Declaration
   *******************************************************************************/
    const wf_table = "wf_assistant_automation_control";

    // Create record in wf_assistant_automation_control with parameters sent in body
    const { data: new_wf_Record, error: insertError } = await supabase
    .from(wf_table)
    .insert({
        narrative_project_id: narrative_project_id,
        wf_assistant_name: wf_assistant_name,
        status: status,
    })
    .select()
    .single(); // Optional: return the inserted row

    if (insertError) {
        console.error("Insert Error:", insertError);
    return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        },
    });
    }

    let efName = "ef_router_wf_assistant_automation_control";
    let payload = {
      "request_id": new_wf_Record.id,
    }
    let router = callEdgeFunction(efName, payload, token);
    console.log(router);

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
