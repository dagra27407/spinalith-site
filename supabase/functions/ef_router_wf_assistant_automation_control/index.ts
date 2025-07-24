// supabase/functions/ef_router_wf_assistant_automation_control.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
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
      console.log(`run_assistant_job POST hast started`)
        const { record_id } = await req.json();
        console.log (`Started POST: run_assistant_job record_id: ${record_id}`)

        if (!record_id) {
            return new Response(JSON.stringify({ error: "Missing record_id" }), {
            status: 400,
            headers: jsonHeaders
            });
        }

        const { data: record, error } = await supabase
            .from("wf_assistant_automation_control")
            .select("*")
            .eq("id", record_id)
            .single();

        if (error || !record) {
            console.error("Failed to fetch record:", error);
            return new Response(JSON.stringify({ error: "Record not found" }), {
            status: 404,
            headers: jsonHeaders
            });
        }

        const status = record.status;
        console.log(`Running logic for status: ${status}`);

        switch (status) {
            case "Prep JSON":
                console.log(`→ Would call: ef_step_PrepJSON | record_id: ${record_id}`);
                break;

            case "Prep Prompt":
                console.log(`→ Would call: ef_step_PrepPrompt | record_id: ${record_id}`);
                break;

            case "Run GPT Assistant":
                console.log(`→ Would call: ef_assistant_MultiPhaseRunner_http | record_id: ${record_id}`);
                break;

            case "Check Loop Batch":
                console.log(`→ Would call: run_assistant | record_id: ${record_id}`);
                break;

            case "Polling":
                console.log(`→ Would call: check_for_completion | record_id: ${record_id}`);
                break;

            case "Re-Send Last Response":
                console.log(`→ Would call: retry_last_batch | record_id: ${record_id}`);
                break;

            case "Parse Response":
                console.log(`→ Would call: parse_response | record_id: ${record_id}`);
                break;

            case "Final Validation":
                console.log(`→ Would call: validate_response | record_id: ${record_id}`);
                break;

            case "Complete":
                console.log(`✅ Workflow is complete. No further action. | record_id: ${record_id}`);
                break;

            default:
                console.log(`⚠️ Unrecognized status: ${status} | record_id: ${record_id}`);
            }


        return new Response(JSON.stringify({ success: true }), {
            headers: jsonHeaders,
        });
    }

    // ─────────────────────────────────────────────
    // ✅ Step 6: Fallback for unsupported methods
    // ─────────────────────────────────────────────
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
        status: 405,
        headers: jsonHeaders,
    });
});