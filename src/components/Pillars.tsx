export default function Pillars() {
  const items = [
    {
      t: "Use a writers room of specialized AI assistants",
      b: "Each assistant thinks like a member of your team. Story architect, editor, prose stylist. All tuned to your process.",
    },
    {
      t: "Keep every arc, beat, and chapter in sync",
      b: "Your structure evolves with you. Continuity stays intact across the whole story.",
    },
    {
      t: "You decide what the AI touches",
      b: "Every creative decision stays in your hands. Spinalith refines your craft, it does not replace it.",
    },
  ];
  return (
    <section id="pillars" className="py-20 sm:py-24 bg-zinc-50">
      <div className="mx-auto w-full max-w-6xl px-6">
        <h2 className="text-2xl sm:text-3xl font-semibold">Why writers choose Spinalith</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <div key={it.t} className="rounded-2xl border p-6">
              <div className="text-lg font-medium">{it.t}</div>
              <p className="mt-2 text-sm text-gray-600 leading-6">{it.b}</p>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <a href="#waitlist" className="inline-flex items-center rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
            Join Early Access
          </a>
          <p className="mt-2 text-xs text-gray-500">Free to join. Early creators help shape the future of Spinalith.</p>
        </div>
      </div>
    </section>
  );
}
