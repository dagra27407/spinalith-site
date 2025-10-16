import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";


const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: cors });

  try {
    const { email, source } = await req.json().catch(() => ({}));
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email" }), { status: 400, headers: cors });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Sanitize IP for inet type (take first IP only)
    const raw = req.headers.get("x-forwarded-for") ?? "";
    const ipCandidate = raw.split(",")[0]?.trim() || null;
    const ip = ipCandidate && /^[\d.:a-fA-F]+$/.test(ipCandidate) ? ipCandidate : null;

    const ua = req.headers.get("user-agent");

    const { error } = await supabase
      .from("waitlist")
      .insert({ email, source, ip, user_agent: ua });

    if (error) {
      console.error("DB insert error:", error.message);
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: cors });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: cors });
  } catch (e) {
    console.error("Fn error:", e);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500, headers: cors });
  }
});
