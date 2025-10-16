
import { Section, Container, H1, H2, Lead, TextWrap } from "./components/layout";
import BandSection from "./components/BandSection";
import Pillars from "./components/Pillars";
import { WaitlistForm } from "./components/WaitlistForm";

export default function App() {
  return (
    <div className="page-bands page-bands--light">
    <div className="min-h-screen bg-white text-gray-900">
      
      <header className="py-4">
        <Container>
          <div className="flex items-center justify-between">
            <div className="text-xl font-semibold tracking-tight">Spinalith</div>
            <nav className="text-sm">
              <a href="#pillars" className="hover:underline mr-4">Why Spinalith</a>
              <a href="#vision" className="hover:underline mr-4">Sneak Peek</a>
              <a href="#waitlist" className="hover:underline">Join</a>
            </nav>
          </div>
        </Container>
      </header>

      {/* HERO uses hero-bg we defined in global.css */}
<Section className="hero-bg">
  <Container>
    <TextWrap>
      <H1>Build smarter stories</H1>
      <Lead>
        The creative toolkit for story-driven minds.
        <br />
        An AI writers room to collaborate with you, not think for you.
      </Lead>

      <div className="mt-8 flex flex-wrap items-center gap-3" id="waitlist">
        <WaitlistForm source="hero" />
        <span className="text-xs text-gray-500">
          Be part of the first generation of writers using AI synergy to tell cohesive stories!
        </span>
      </div>
    </TextWrap>
  </Container>
</Section>

      {/* Big Idea */}
<Section>
  <Container>
    <TextWrap>
      <H2>Write with structure. Create with freedom.</H2>
      <p className="mt-4 text-gray-700">
        Spinalith turns your storytelling process into a living workspace.
        Map arcs, beats, and characters. Explore tone, rhythm, and theme.
        Collaborate with AI assistants that think like a writers room. Each one is trained to understand story, not just words.
      </p>
      <p className="mt-4 text-sm text-gray-500">
        Your ideas deserve more than prompts. They deserve collaboration.
      </p>
    </TextWrap>
  </Container>
</Section>

      <Pillars />

<Section id="vision">
  <Container>
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="mx-auto max-w-3xl">
        <H2>A creative workspace built like a writers room</H2>
        <p className="mt-4 text-gray-700 leading-7">
          Step into an environment built for professional storytelling...
        </p>
      </div>
      <div className="rounded-2xl border aspect-video bg-white grid place-items-center">
        <div className="text-sm text-gray-500">
          The Writers Room View. Plan, connect, and create inside one evolving story system.
        </div>
      </div>
    </div>
  </Container>
</Section>


<Section className="bg-black text-white">
  <Container>
    <TextWrap>
      <H2>Built for writers who think in arcs</H2>
      <div className="mt-4 text-gray-300 space-y-4">
        <p>Spinalith isn’t about shortcuts. It is about structure that thinks with you.</p>
        <p>Every story has rhythm, tension, and transformation. Our creative AI understands those principles and works alongside them, not around them.</p>
        <p>You decide how deep the collaboration goes. From high-level story design to full prose creation. You stay the showrunner. Spinalith is your creative staff.</p>
        <p className="italic text-gray-400">For writers who build worlds, craft arcs, and shape meaning, not just words.</p>
      </div>
    </TextWrap>
  </Container>
</Section>

<Section>
  <Container>
    <TextWrap>
      <H2>Join the writers room early</H2>
      <p className="mt-3 text-gray-700">
        Spinalith is opening its doors to a small group of early creators...
      </p>
      <div className="mt-6">
        <WaitlistForm source="final-cta" />
        <p className="mt-2 text-xs text-gray-500">Free early access. No credit card required. You always own your stories.</p>
      </div>
    </TextWrap>
  </Container>
</Section>


    </div>
    </div>
  );
}
