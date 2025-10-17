import React, { useState } from "react";


export default function WaitlistForm() {
const [email, setEmail] = useState("");
const [status, setStatus] = useState<"idle"|"loading"|"ok"|"err">("idle");


async function submit(e: React.FormEvent) {
e.preventDefault();
if (!email) return;
setStatus("loading");
try {
const base = import.meta.env.VITE_FUNCTIONS_URL ?? "";
const res = await fetch(`${base}/waitlist`, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ email }),
});
if (!res.ok) throw new Error("bad status");
setStatus("ok");
setEmail("");
} catch (err) {
setStatus("err");
}
}


return (
<form onSubmit={submit} className="mt-6 flex items-stretch gap-3">
<input
type="email"
required
placeholder="you@domain.com"
value={email}
onChange={(e) => setEmail(e.target.value)}
className="h-11 w-full rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-[color-mix(in_oklab,hsl(var(--primary))_60%,transparent)]"
/>
<button
type="submit"
disabled={status === "loading"}
className="h-11 rounded-xl border px-4 text-sm"
>
{status === "loading" ? "Joining…" : status === "ok" ? "Joined" : "Join"}
</button>
</form>
);
}