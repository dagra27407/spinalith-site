// supabase/functions/ef_test_httpCall.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
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
    // Example insert with hardcoded title and authenticated user
    if (req.method === "POST") {
      try {
          const token = req.headers.get("Authorization")?.replace("Bearer ", ""); //Pull the users auth token for use in next EF call
      if (!token) {
        return new Response(JSON.stringify({ error: "Missing token" }), {
        status: 400,
        headers: jsonHeaders,
        });
      }

/*****************************************************************************************************************
  // ** MAIN LOGIC FOR THIS EF NEEDS TO GO HERE ********************************************************************
****************************************************************************************************************/
      try{
          const apiKey = Deno.env.get("OPENAI_API_KEY");
          const method = "POST";
          const url = "https://api.openai.com/v1/chat/completions"; // Make sure to fix the URL

          const headers = {
          "Content-Type": "application/json",  // Required for JSON payload
          Authorization: `Bearer ${apiKey}`, // If needed
          };

          const body = {
              model: "gpt-3.5-turbo", // or "whatever model you want"
              messages: [
              { role: "system", content: "You are a witty comedian." },
              { role: "user", content: "Tell me a short joke." },
              ],
              temperature: 0.8,
          };

          const response = await runHttpRequest({
          method,
          url,
          headers,
          body,
          });

          console.log("🤖 Joke Response:", response);

          return new Response(
                  JSON.stringify({
                  success: true,
                  message: "Joke retrieved!",
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
    } catch (err) {
    console.error("POST Error:", err);
    return new Response(
      JSON.stringify({
        error: err.message || "Invalid request body or internal error.",
      }),
      { status: 400, headers: jsonHeaders }
    );
  }
  }
/*****************************************************************************************************************
// ** END OF MAIN LOGIC FOR THIS EF NEEDS TO GO HERE ********************************************************************
****************************************************************************************************************/


      

  // ─────────────────────────────────────────────
      // ✅ Step 7: Fallback for unsupported methods
      // ─────────────────────────────────────────────
      return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
        status: 405,
        headers: jsonHeaders,
      });
});

    //Basic function to make http call strictly using paramater data
     async function runHttpRequest({
        method = "POST",
        url,
        headers = {},
        body = null,
        }: {
        method: string;
        url: string;
        headers?: Record<string, string>;
        body?: any;
        }): Promise<{ status: number; data: any; error?: string }> {
        try {
            const response = await fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
            });

            const data = await response.json();
            return { status: response.status, data };
        } catch (err: any) {
            return { status: 500, data: null, error: err.message || "Unknown error" };
        }
        }