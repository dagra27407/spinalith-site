// src/components/home/HomeSolutionSection.tsx

/**
 * File: src/components/home/HomeSolutionSection.tsx
 *
 * Purpose:
 * Homepage solution/product proof section for Spinalith.com.
 *
 * Responsibilities:
 * - Turns the problem section into the first clear product answer.
 * - Shows Spinalith as a visual workspace for seeing story structure as a whole.
 * - Reuses the Timeline Planner screenshot as product proof.
 * - Introduces three core benefits before the later workflow sections.
 *
 * Notes:
 * - This section intentionally stays open, not boxed inside a large panel.
 * - Visual atmosphere should come from the section background and screenshot frame.
 * - Advanced nebula/trail effects are intentionally not handled here.
 * - Icons use Lucide to stay aligned with the rest of the Spinalith codebase.
 * - Screenshot file lives at public/assets/screenshots/home/hero-tpv.png.
 */

import { Eye, PanelsTopLeft, Route } from "lucide-react";

import { ScreenshotFrame } from "../site/ScreenshotFrame";

import { NebulaShowcase } from "../site/NebulaShowcase";

const solutionPoints = [
  {
    title: "Structure before drafting",
    body: "Plan the shape of your story before prose locks you in.",
    Icon: PanelsTopLeft,
  },
  {
    title: "Reader journey in view",
    body: "Track how arcs, beats, and chapters build across the story.",
    Icon: Route,
  },
  {
    title: "Big-picture clarity",
    body: "Zoom out when details start competing for attention.",
    Icon: Eye,
  },
];

export function HomeSolutionSection() {
  return (
    <section
      id="how-it-works"
      className="home-solution site-section"
      aria-labelledby="home-solution-title"
    >
      <div className="site-container-wide home-solution__inner">
        <header className="home-solution__header">
          <p className="home-solution__kicker">Solution</p>

          <h2 id="home-solution-title" className="home-solution__title">
            See your story as a whole.
          </h2>

          <p className="home-solution__lede">
            Spinalith gives your story a visual workspace where chapters, arcs,
            beats, and timelines come together, You can shape the reader
            journey before the draft begins.
          </p>
        </header>

        <div className="home-solution__showcase">
<NebulaShowcase
  origin={{ x: 88, y: 76 }}
  angle={-35}
  intensity={90}
  hazeReach={1}
  starReach={1}
  spread={10}
  starDensity={10}
  starBrightness={22}
  accentMix={2}
>
<NebulaShowcase
  origin={{ x: 91, y: 93 }}
  angle={-35}
  intensity={90}
  hazeReach={6}
  starReach={8}
  spread={15}
  starDensity={50}
  starBrightness={26}
  accentMix={2}
>
            <ScreenshotFrame
            src="/assets/screenshots/home/hero-tpv.png"
            alt="Spinalith Timeline Planner showing chapters, arcs, beats, and story structure in a visual planning workspace."
            variant="primaryColorHalo"
            className="home-solution__frame"
            />
        </NebulaShowcase>
        </NebulaShowcase>
        </div>

        <div
          className="home-solution__benefits"
          aria-label="Spinalith solution benefits"
        >
          {solutionPoints.map(({ title, body, Icon }) => (
            <article className="home-solution-benefit" key={title}>
              <div className="home-solution-benefit__icon" aria-hidden="true">
                <Icon size={27} strokeWidth={1.85} />
              </div>

              <div className="home-solution-benefit__copy">
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}