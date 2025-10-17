import React from "react";
import "./styles/tokens.css";
import "./styles/index.css";
import WaitlistForm from "./components/WaitlistForm";

function Track({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className="container-app">{children}</div>
    </div>
  );
}

export default function App() {
  return (
    <div>
      {/* Header (sticky, aligned to track) */}
      <header className="site-header">
        <Track>
          <div className="site-header__inner">
            <div style={{ fontWeight: 700 }}>Spinalith</div>
            <nav className="text-sm" aria-label="Primary">
              <a href="#join" className="hover:underline">Early Access</a>
            </nav>
          </div>
        </Track>
      </header>

      {/* HERO — plain band, copy-forward */}
<section className="section band-dark">
  <Track>
    <div className="prose-narrow measure-narrow-xl center-xl mx-auto">
      <h1 style={{ fontSize: "2.75rem", fontWeight: 800, lineHeight: 1.1 }}>
        Build smarter stories
      </h1>
      <p className="mt-3" style={{ fontSize: 18 }}>
        The creative toolkit for story-driven minds.<br />
        Let your AI writers room collaborate with you, not for you.
      </p>
      <div className="mt-4">
        <WaitlistForm />
        <p className="mt-2 fineprint" style={{ fontSize: 12 }}>
          Be part of the first generation of writers building with structure, storycraft, and AI synergy.
        </p>
      </div>
    </div>
  </Track>
</section>



      {/* BIG IDEA — flowing copy (no box) */}
<section className="section band-primary-tint section--tight">
  <Track>
    <div className="card card--pad card--raised">
      <div className="prose-narrow measure-narrow-xl center-xl mx-auto">
          <div className="prose-narrow measure-narrow-xl center-xl mx-auto">
            <h2 style={{ fontSize: "1.875rem", fontWeight: 700 }}>Write with structure. Create with freedom.</h2>
            <p className="mt-4" style={{ color: "var(--text-700)" }}>
              Spinalith turns your storytelling process into a living workspace. Map arcs, beats, and characters.
              Explore tone, rhythm, and theme.
            </p>
            <p className="mt-4" style={{ color: "var(--text-700)" }}>
              Collaborate with AI assistants that think like a writers room. Each one is trained to understand story, not just words.
            </p>
            <p className="mt-4" style={{ color: "var(--text-500)", fontSize: 14 }}>
              Your ideas deserve more than prompts. They deserve collaboration.
            </p>
          </div>
                </div>
    </div>
        </Track>
      </section>

{/* PILLARS — the only place we use cards/boxes */}
<section id="pillars" className="section band-primary-tint">
  <Track>
    {/* Center the header and CTA block; keep cards as-is */}
    <div className="prose-medium measure-medium-xl center-xl mx-auto" style={{ textAlign: "center" }}>
      <h2 style={{ fontSize: "1.875rem", fontWeight: 700 }}>Why writers choose Spinalith</h2>

      <div
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          marginTop: 16,
          textAlign: "left",            // <-- keep cards readable & left-aligned
        }}
      >
        <article className="panel" style={{ padding: 16 }}>
          <h3 style={{ fontWeight: 600, fontSize: 16 }}>Creative Intelligence</h3>
          <p style={{ marginTop: 8, color: "var(--text-700)", fontSize: 14 }}>
            A writers room of specialized AI collaborators—story architect, editor, prose stylist—tuned to your process.
          </p>
        </article>
        <article className="panel" style={{ padding: 16 }}>
          <h3 style={{ fontWeight: 600, fontSize: 16 }}>Connected Story System</h3>
          <p style={{ marginTop: 8, color: "var(--text-700)", fontSize: 14 }}>
            Keep arcs, beats, and chapters in sync. Your structure evolves with you, preserving continuity.
          </p>
        </article>
        <article className="panel" style={{ padding: 16 }}>
          <h3 style={{ fontWeight: 600, fontSize: 16 }}>Writer-Centric Design</h3>
          <p style={{ marginTop: 8, color: "var(--text-700)", fontSize: 14 }}>
            You decide what the AI touches. We help refine, not replace, your craft.
          </p>
        </article>
      </div>

      {/* Center the CTA button + note */}
      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <a href="#join" className="btn btn-primary">Join Early Access</a>
        <p style={{ marginTop: 8, fontSize: 12, color: "var(--text-500)" }}>
          Free to join. Early creators help shape the future of Spinalith.
        </p>
      </div>
    </div>
  </Track>
</section>


{/* VISION — A3 revised: centered three-up with silver band (not blue) */}
<section id="vision" className="section band-silver">
  <Track>
    {/* Heading + subtext: fully centered and constrained */}
    <div className="prose-narrow measure-narrow-xl center-block">
      <h2 style={{ fontSize: "1.875rem", fontWeight: 700 }}>
        A creative workspace built like a writers room
      </h2>
      <p className="mt-4" style={{ color: "var(--text-700)" }}>
        Plan clearly, keep continuity, and carry context into prose.
      </p>
    </div>

    {/* Three centered items */}
    <div
      className="prose-medium measure-medium-xl center-block"
      style={{
        display: "grid",
        gap: 24,
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        marginTop: 28,
        textAlign: "center",
        justifyItems: "center",   // extra insurance
      }}
    >
{[
  ["Structured Planning", "Arcs, beats, and characters stay aligned as your outline evolves.", "/assets/vision/structured-planning.svg"],
  ["Continuity Awareness", "Track callbacks, tone, and rhythm across chapters—without spreadsheets.", "/assets/vision/continuity-awareness.svg"],
  ["Context to Prose", "Shift to drafting with the right context carried forward automatically.", "/assets/vision/context-to-prose.svg"],
].map(([title, body, icon]) => (
  <div key={title} style={{ maxWidth: 360, textAlign: "center" }}>
    <img
      src={icon as string}
      alt={title as string}
      style={{ height: 80, width: 80, margin: "0 auto 10px", display: "block" }}
    />
    <p style={{ fontWeight: 600, marginBottom: 6 }}>{title}</p>
    <p style={{ color: "var(--text-700)" }}>{body}</p>
  </div>
))}

    </div>
  </Track>
</section>



      {/* PHILOSOPHY — dark editorial band (readable, no boxes) */}
      <section className="section band-dark">
        <Track>
          <div className="prose-narrow measure-narrow-xl center-xl mx-auto">
            <h2 style={{ fontSize: "1.875rem", fontWeight: 700 }}>Built for writers who think in arcs</h2>
            <div className="mt-4" style={{ color: "rgba(255,255,255,.82)" }}>
              <p>Spinalith is not about shortcuts. It is about structure that thinks with you.</p>
              <p className="mt-4">Every story has rhythm, tension, and transformation. Our creative AI understands those principles and works alongside them, not around them.</p>
              <p className="mt-4">You decide how deep the collaboration goes—from high-level story design to full prose creation. You stay the showrunner. Spinalith is your creative staff.</p>
              <p className="mt-4" style={{ opacity: .8, fontStyle: "italic" }}>
                For writers who build worlds, craft arcs, and shape meaning, not just words.
              </p>
            </div>
          </div>
        </Track>
      </section>

      {/* FINAL CTA — flowing, with one supportive panel */}
<section id="join" className="section">
  <Track>
    <div className="prose-narrow measure-narrow-xl center-xl mx-auto">
      <h2 style={{ fontSize: "1.875rem", fontWeight: 700, textAlign: "center" }}>
        Join the writers room early
      </h2>

      <p className="mt-3" style={{ color: "var(--text-700)" }}>
        Spinalith is opening its doors to a small group of early creators. Get first access to our story development tools,
        help shape the roadmap, and see your feedback become part of the platform.
      </p>

      {/* Center the form + subtext inside the card */}
      <div className="panel" style={{ padding: 16, marginTop: 16 }}>
        <div className="center-stack">
          <WaitlistForm />
          <p className="mt-2" style={{ fontSize: 12, color: "var(--text-500)" }}>
            Free early access. No credit card required. You always own your stories.
          </p>
        </div>
      </div>
    </div>
  </Track>
</section>


      {/* Footer with your real static files */}
      <footer style={{ borderTop: "1px solid var(--border-200)" }}>
        <Track>
          <div style={{ padding: "24px 0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <p style={{ color: "var(--text-700)", fontSize: 14 }}>© {new Date().getFullYear()} Spinalith</p>
            <nav style={{ display: "flex", gap: 16, fontSize: 14 }}>
              <a href="/privacy.html">Privacy</a>
              <a href="/terms.html">Terms</a>
              <a href="#contact">Contact</a>
            </nav>
          </div>
        </Track>
      </footer>
    </div>
  );
}
