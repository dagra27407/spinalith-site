import { useState } from "react";

export function WaitlistForm({ source = "site-hero" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle"|"sending"|"ok"|"err">("idle");

const url = import.meta.env.VITE_FUNCTIONS_URL;

async function onSubmit(e: React.FormEvent) {
  e.preventDefault();
  setState("sending");
  try {
    const res = await fetch(`${url}/waitlist`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, source }),
    });
    setState(res.ok ? "ok" : "err");
  } catch {
    setState("err");
  }
}


  return (
    <form onSubmit={onSubmit} className="flex gap-2 w-full max-w-md">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@domain.com"
        className="w-full border rounded px-3 py-2"
        aria-label="Email address"
      />
      <button
        className="rounded px-4 py-2 border"
        disabled={state === "sending"}
      >
        {state === "sending" ? "Joining…" : "Join"}
      </button>
      {state === "ok" && <p className="text-sm ml-2">Got it — thanks!</p>}
    </form>
  );
}
