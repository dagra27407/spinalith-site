// supabase/functions/contact/index.ts

/**
 * File: supabase/functions/contact/index.ts
 *
 * Purpose:
 * Trusted server-side handler for public Spinalith contact form submissions.
 *
 * Responsibilities:
 * - Accept contact form submissions from Spinalith.com.
 * - Validate required fields and basic payload limits.
 * - Verify Cloudflare Turnstile before accepting the submission.
 * - Insert validated messages into public.contact_messages.
 * - Keep direct anonymous writes to the contact_messages table disabled.
 *
 * Notes:
 * - TURNSTILE_SECRET must be stored in Supabase Edge Function secrets.
 * - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by Supabase.
 * - The public Turnstile site key belongs in the frontend, not here.
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = new Set([
  "https://spinalith.com",
  "https://www.spinalith.com",
]);

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

const CONTACT_SOURCE = "website_contact";
const TURNSTILE_ACTION = "contact";

const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 254;
const MAX_SUBJECT_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 10000;

type ContactRequestBody = {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
  turnstileToken?: unknown;
};

type TurnstileVerifyResponse = {
  success?: boolean;
  hostname?: string;
  action?: string;
  ["error-codes"]?: string[];
};

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  corsHeaders: Record<string, string>,
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function getCorsHeaders(origin: string | null) {
  const allowedOrigin =
    origin && ALLOWED_ORIGINS.has(origin)
      ? origin
      : "https://spinalith.com";

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(email: string) {
  return /^\S+@\S+\.\S+$/.test(email);
}

function getClientIp(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for") ?? "";
  const firstForwardedIp = forwardedFor.split(",")[0]?.trim();

  if (firstForwardedIp) return firstForwardedIp;

  return req.headers.get("cf-connecting-ip")?.trim() || null;
}

async function verifyTurnstile({
  token,
  secret,
  remoteIp,
}: {
  token: string;
  secret: string;
  remoteIp: string | null;
}) {
  const formData = new FormData();

  formData.append("secret", secret);
  formData.append("response", token);

  if (remoteIp) {
    formData.append("remoteip", remoteIp);
  }

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Turnstile verification request failed: ${response.status}`);
  }

  return (await response.json()) as TurnstileVerifyResponse;
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const cors = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  if (req.method !== "POST") {
    return jsonResponse(
      { error: "Method not allowed" },
      405,
      cors,
    );
  }

  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return jsonResponse(
      { error: "Origin not allowed" },
      403,
      cors,
    );
  }

  try {
    const body = (await req.json().catch(() => ({}))) as ContactRequestBody;

    const name = normalizeString(body.name);
    const email = normalizeString(body.email).toLowerCase();
    const subject = normalizeString(body.subject);
    const message = normalizeString(body.message);
    const turnstileToken = normalizeString(body.turnstileToken);

    if (!name) {
      return jsonResponse(
        { error: "Name is required" },
        400,
        cors,
      );
    }

    if (!email || !isValidEmail(email)) {
      return jsonResponse(
        { error: "A valid email address is required" },
        400,
        cors,
      );
    }

    if (!message) {
      return jsonResponse(
        { error: "Message is required" },
        400,
        cors,
      );
    }

    if (!turnstileToken) {
      return jsonResponse(
        { error: "Verification is required" },
        400,
        cors,
      );
    }

    if (name.length > MAX_NAME_LENGTH) {
      return jsonResponse(
        { error: "Name is too long" },
        400,
        cors,
      );
    }

    if (email.length > MAX_EMAIL_LENGTH) {
      return jsonResponse(
        { error: "Email address is too long" },
        400,
        cors,
      );
    }

    if (subject.length > MAX_SUBJECT_LENGTH) {
      return jsonResponse(
        { error: "Subject is too long" },
        400,
        cors,
      );
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return jsonResponse(
        { error: "Message is too long" },
        400,
        cors,
      );
    }

    const turnstileSecret = Deno.env.get("TURNSTILE_SECRET");

    if (!turnstileSecret) {
      console.error("Missing TURNSTILE_SECRET");

      return jsonResponse(
        { error: "Server configuration error" },
        500,
        cors,
      );
    }

    const clientIp = getClientIp(req);

    const turnstileResult = await verifyTurnstile({
      token: turnstileToken,
      secret: turnstileSecret,
      remoteIp: clientIp,
    });

    if (!turnstileResult.success) {
      console.warn(
        "Turnstile verification failed:",
        turnstileResult["error-codes"] ?? [],
      );

      return jsonResponse(
        { error: "Verification failed. Please try again." },
        400,
        cors,
      );
    }

    if (
      turnstileResult.hostname &&
      turnstileResult.hostname !== "spinalith.com" &&
      turnstileResult.hostname !== "www.spinalith.com"
    ) {
      console.warn(
        "Unexpected Turnstile hostname:",
        turnstileResult.hostname,
      );

      return jsonResponse(
        { error: "Verification failed. Please try again." },
        400,
        cors,
      );
    }

    if (
      turnstileResult.action &&
      turnstileResult.action !== TURNSTILE_ACTION
    ) {
      console.warn(
        "Unexpected Turnstile action:",
        turnstileResult.action,
      );

      return jsonResponse(
        { error: "Verification failed. Please try again." },
        400,
        cors,
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("Missing Supabase environment variables");

      return jsonResponse(
        { error: "Server configuration error" },
        500,
        cors,
      );
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
    );

    const userAgent = req.headers.get("user-agent");

    const { error: insertError } = await supabase
      .from("contact_messages")
      .insert({
        name,
        email,
        subject: subject || null,
        message,
        status: "new",
        source: CONTACT_SOURCE,
        ip_hash: null,
        user_agent: userAgent,
      });

    if (insertError) {
      console.error(
        "Contact message insert error:",
        insertError.message,
      );

      return jsonResponse(
        { error: "Unable to submit your message right now" },
        500,
        cors,
      );
    }

    return jsonResponse(
      { ok: true },
      200,
      cors,
    );
  } catch (error) {
    console.error("Contact function error:", error);

    return jsonResponse(
      { error: "Server error" },
      500,
      cors,
    );
  }
});