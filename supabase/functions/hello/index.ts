// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// supabase/functions/hello/index.ts
import { serve } from "https://deno.land/std/http/server.ts";

serve((_req) => new Response("Hello from Supabase Edge Functions!", {
  headers: { "Content-Type": "text/plain" },
}));

