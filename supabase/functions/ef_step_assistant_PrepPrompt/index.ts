// supabase/functions/function_template.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { runProcess } from "./runProcess.ts";

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
		const body = await req.json(); //Extract body of HTTP call
        const { narrativeProjectID, record_id } = body; //Get passed values from body
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
let sourceTable = "wf_assistant_automation_control"
await runProcess(supabase, user, record_id, narrativeProjectID, sourceTable);

/*****************************************************************************************************************
// ** END OF MAIN LOGIC FOR THIS EF NEEDS TO GO HERE ********************************************************************
****************************************************************************************************************/

/*
        // ** Call next Edge Function in automation order passing token provided to this one for user auth *******
        (async () => {
          try {
            const res = await fetch(`${EDGE_FUNCTIONS_URL}/run_assistant_job`, { //Next EF name being called
              method: "POST",
              headers: { 
                'Authorization': `Bearer ${token}`, //Needs to pass token along to new EF for user authentication
                "Content-Type": "application/json" },
              body: JSON.stringify({ record_id: newRecord.id }), // body should include any data you need to pass along to the next EF
            });
            if (!res.ok) {
              const errText = await res.text();
              console.error("run_assistant_job failed:", errText, newRecord.id);
            }
            if (res.ok) {
            }
          } catch (err) {
            console.error("run_assistant_job error:", err, newRecord.id);
          }
          
        })();
*/
        // ** Send response from requestor *******
        return new Response(JSON.stringify({
        success: true,
        message: `PrepPrompt Complete for: ${record_id}`,
        }), {
        status: 200,
        headers: jsonHeaders,
        });
    } catch (err) {
      // ─────────────────────────────────────────────
      // ✅ Step 6: Catch bad POST body or internal error
      // ─────────────────────────────────────────────
      console.error("POST Error:", err);
      return new Response(
        JSON.stringify({ error: "Invalid request body or server error." }),
        { status: 400, headers:jsonHeaders }
      );
        }
      }

      // ─────────────────────────────────────────────
      // ✅ Step 7: Fallback for unsupported methods
      // ─────────────────────────────────────────────
      return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
        status: 405,
        headers: jsonHeaders,
      });
    });

