// supabase/functions/ef_LLM_OneShot.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

	//Set headers
		const corsHeaders = {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "POST, GET, OPTIONS",
		"Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
	  };

	  const jsonHeaders = {
		...corsHeaders,
		"Content-Type": "application/json"
	  };
    
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
        //Pull variables out of EF Call Body
        const body = await req.json();
        let {
          narrative_project_id,
          request_key,
          call_logic_key,
          request_purpose,
          provider,
          request_method,
          request_url,
          content_type,
          request_model,
          temperature,
          request_prompt,
        } = body || {};
      
        if (!request_key) {
          return new Response(JSON.stringify({ error: "Missing request_key" }), {
            status: 400,
            headers: jsonHeaders,
          });
        }


/*****************************************************************************************************************
  // ** MAIN LOGIC FOR THIS EF NEEDS TO GO HERE ********************************************************************
****************************************************************************************************************/
    const oneShot = await executeLLMCall({
          supabase,
          user,
          request_key,
          narrative_project_id,
          run_type: "initial",
          call_logic_key,
          request_purpose,
          provider,
          request_method,
          request_url,
          content_type,
          request_model,
          temperature,
          request_prompt,
        });
        return oneShot;
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
  }: {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: any;
  logMeta?: {
    narrative_project_id?: string;
    request_key: string;
    call_logic_key: string;
    request_purpose: string;
    provider: string;
    execution_mode: "one-shot" | "multi-phase";
    run_type: string;
    model: string;
  };
  supabase: any;
  user: any;
  }): Promise<{ status: number; data: any; error?: string }> {
  try {
      const startTime = Date.now(); //Used for calculating duration
      const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      });
      const duration_ms = Date.now() - startTime;

      const data = await response.json();
      try{
        await logLLMRequest(supabase, user, {
                        narrative_project_id: logMeta.narrative_project_id,
                        request_key: logMeta.request_key,
                        call_logic_key: logMeta.call_logic_key,
                        request_purpose: logMeta.request_purpose,
                        provider: logMeta.provider,
                        execution_mode: logMeta.execution_mode,
                        run_type: logMeta.run_type,
                        model: logMeta.model,
                        request_payload: body,
                        response_raw: data,
                        status_code: response.status,
                        duration_ms,
                      });
        } catch (logErr) {
          console.warn("LLM Logging Failed:", logErr);
        }
      return { status: response.status, data };
  } catch (err: any) {
      try{
        await logLLMRequest(supabase, user, {
                        narrative_project_id: logMeta.narrative_project_id,
                        request_key: logMeta.request_key,
                        call_logic_key: logMeta.call_logic_key,
                        request_purpose: logMeta.request_purpose,
                        provider,
                        execution_mode: logMeta.execution_mode,
                        run_type: logMeta.run_type,
                        model: logMeta.model,
                        request_payload: body,
                        status_code: response.status,
                        duration_ms,
                        error: err.message,
                      });
        } catch (logErr) {
          console.warn("LLM Logging Failed:", logErr);
        }
      return { status: 500, data: null, error: err.message || "Unknown error" };
  }
  } //END OF runHttpRequest


/** 
 * getDefaults
 * Fetches default HTTP request configuration from the http_request_mapping_warehouse table
 * based on the provided request_key. Used to supply fallback values for LLM-related HTTP calls.
 *
 * @async
 * @function getDefaults
 * @param {string} request_key - The unique identifier used to locate the appropriate HTTP config entry.
 * @returns {Promise<Object|Response>} - Returns the default configuration object if found,
 *                                       or a Response object with an error message and status 404 if not.
 *
 * @example
 * const defaults = await getDefaults("OF_WittyGreeting");
 * if (defaults instanceof Response) {
 *   // Handle the error response
 * } else {
 *   // Use defaults.model, defaults.default_temperature, etc.
 * }
 */
async function getDefaults(supabase: any, user: any, request_key: string) {
  // Pull http_warehouse entry
  const { data: record, error } = await supabase
    .from("http_request_mapping_warehouse")
    .select("*")
    .eq("request_key", request_key)
    .single();

  // Confirm .select worked
  if (error || !record) {
    console.error("Failed to fetch record:", error);
    return new Response(
      JSON.stringify({ error: `HTTP_Warehouse record not found: ${request_key}` }),
      {
        status: 404,
        headers: jsonHeaders,
      }
    );
  }

  return record;
} //END OF getDefaults



/**
 * getPrompt
 * Fetches a stored prompt template from the `util_prompt_warehouse` table by request key.
 * 
 * This function:
 * 1. Queries Supabase for a record where `util_name` matches the provided `request_key`.
 * 2. Validates that the record was found and returns it.
 * 3. If not found or an error occurs, returns a 404 Response object with an error message.
 * 
 * @async
 * @function getPrompt
 * @param {any} supabase - An initialized Supabase client instance used to perform the query.
 * @param {any} user - The user object (not currently used, but passed for future security or RLS context).
 * @param {string} request_key - The identifier for the prompt in `util_prompt_warehouse.util_name`.
 * 
 * @returns {Promise<object|Response>} - Returns the matched prompt record if found, or a `Response` object with status 404 if not.
 * 
 * @example
 * const promptRecord = await getPrompt(supabase, user, "util_MyPromptKey");
 * if ('prompt' in promptRecord) {
 *   console.log("Fetched Prompt:", promptRecord.prompt);
 * }
 */
async function getPrompt(supabase: any, user: any, request_key: string) {
  // Pull http_warehouse entry
  const { data: record, error } = await supabase
    .from("util_prompt_warehouse")
    .select("*")
    .eq("util_name", request_key)
    .single();

  // Confirm .select worked
  if (error || !record) {
    console.error("Failed to fetch record:", error);
    return new Response(
      JSON.stringify({ error: `Prompt_Warehouse record not found: ${request_key}` }),
      {
        status: 404,
        headers: jsonHeaders,
      }
    );
  }
  console.log(`Sending back:  ${record.prompt}`)
  return record;
} //END OF getPrompt

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
 * @param {"one-shot" | "multi-phase"} logData.execution_mode - Whether this was a one-shot or assistant-based execution.
 * @param {string} logData.run_type - The runtime category (e.g., "initial", "batch", "retry").
 * @param {string} logData.model - The name of the model used (e.g., "gpt-4-1106-preview").
 * @param {any} logData.request_payload - The full body of the HTTP request sent to the LLM.
 * @param {any} [logData.response_raw] - The full raw response from the LLM (optional if the call failed).
 * @param {number} logData.status_code - The HTTP status code from the LLM call.
 * @param {number} logData.duration_ms - How long the request took to complete, in milliseconds.
 * @param {string} [logData.error] - Optional error message if the request failed.
 * 
 * @returns {Promise<void>} - Resolves once the log entry is written to Supabase.
 */
async function logLLMRequest(supabase: any, user: any, logData: {
  narrative_project_id?: string;
  request_key: string;
  call_logic_key: string;
  request_purpose: string;
  execution_mode: "one-shot" | "multi-phase";
  run_type: string;
  model: string;
  request_payload: any;
  response_raw?: any;
  status_code: number;
  duration_ms: number;
  error?: string;
}) {
  await supabase.from("llm_request_tracking").insert([logData]);
} //END OF logLLMRequest


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
 * @function executeLLMCall
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
 *
 * @returns {Promise<Response>} A formatted HTTP Response object containing the LLM output or error message.
 */
async function executeLLMCall({
  supabase,
  user,
  request_key,
  narrative_project_id = null,
  run_type = "initial",
  call_logic_key = null,
  request_purpose = null,
  provider = null,
  request_method = null,
  request_url = null,
  content_type = null,
  request_model = null,
  temperature = null,
  request_prompt = null,
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
}) {
//Validate request_key is present
if(!request_key){
return new Response(JSON.stringify({ error: "request_key must be supplied to ef_LLM_OneShot!" }), {
  status: 400,
  headers: jsonHeaders,
  });
} else { //received request_key go get defaults
  //Get HTTP Defaults
  const httpDefaults = await getDefaults(supabase, user, request_key);
  if (httpDefaults instanceof Response) {
    // Error occurred — Supabase record missing or fetch failed
    // Handle the error — you might want to return this to the user or log it
    return httpDefaults
  } else {
    // Success — we now have a config object we can use
    // Use defaults.default_model, defaults.default_url, etc. if value not provided in body of EF call
    provider = provider || httpDefaults.provider;
    request_method = request_method || httpDefaults.request_method;
    content_type = content_type || httpDefaults.content_type;
    request_url = request_url || httpDefaults.request_url;
    request_model = request_model || httpDefaults.model;
    temperature = temperature ?? httpDefaults.default_temperature ?? null;
    call_logic_key = call_logic_key || httpDefaults.call_logic_key;
    request_purpose = request_purpose || httpDefaults.request_purpose;
    narrative_project_id = narrative_project_id ?? null;
  }
  //get Prompt Defaults
  const promptDefaults = await getPrompt(supabase, user, request_key);
  if (promptDefaults instanceof Response) {
    // Error occurred — Supabase record missing or fetch failed
    // Handle the error — you might want to return this to the user or log it
    return promptDefaults
  } else {
    // Success — we now have a config object we can use
    // Use defaults.default_model, defaults.default_url, etc. if value not provided in body of EF call
    request_prompt = request_prompt || promptDefaults.prompt;
  }
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
      default: //All other LLMs
        headers["Authorization"] = `Bearer ${apiKey}`;
        break;
    }
  

  const http_body = {
      model: request_model,
      messages: [
      { role: "user", content: request_prompt },
      ],
      ...(temperature !== undefined && { temperature }), //Only include if its provided and not null otherwise let the LLM use its internal default
  };

  //Function call to send reqeust to LLM
  const response = await runHttpRequest({
    method: request_method,
    url: request_url,
    headers,
    body: http_body,
    logMeta: {
      narrative_project_id,
      request_key,
      call_logic_key,
      request_purpose,
      provider,
      execution_mode: "one-shot",
      run_type: "Initial",
      model: request_model,
    },
    supabase,
    user,
  });

  console.log("HTTP LLM Response:", response);

  return new Response(
          JSON.stringify({
          success: true,
          message: "Response retrieved!",
          response,
          }),
          {
          status: 200,
          headers: jsonHeaders,
          }
      );
}
catch (err) {
  console.error("POST Error:", err);
  return new Response(
      JSON.stringify({
      error: err.message || "Invalid request body or internal error.",
      }),
      { status: 400, headers: jsonHeaders }
  );
}
}
