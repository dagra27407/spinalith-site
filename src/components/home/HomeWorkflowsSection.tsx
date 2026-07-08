// src/components/home/HomeWorkflowsSection.tsx

/**
 * File: src/components/home/HomeWorkflowsSection.tsx
 * Purpose: Homepage section that introduces the three core Spinalith workflows.
 * Responsibilities:
 * - Render the Three Core Workflows section headline and bridge copy.
 * - Present Narrative DNA, Timeline Planner, and Chapter Planner as benefit-first cards.
 * - Use the shared SiteFeatureCard component for the workflow card visual system.
 * - Showcase the DNAV character grid screenshot using the shared ScreenshotFrame.
 * - Use NebulaShowcase for the atmospheric product visual treatment.
 * Notes:
 * - Uses the approved section header copy:
 *   "One story. Everything in sync."
 * - Uses lucide-react icons: Dna, Network, BookOpenCheck.
 * - Screenshot file lives at public/assets/screenshots/home/dnav-characters-grid.png.
 */

import type { LucideIcon } from "lucide-react";
import { BookOpenCheck, Dna, Network } from "lucide-react";

import { NebulaShowcase } from "../site/NebulaShowcase";
import { ScreenshotFrame } from "../site/ScreenshotFrame";
import { SiteFeatureCard } from "../site/SiteFeatureCard";

import "../../styles/page/home/homeWorkflows.css";

type WorkflowCard = {
  title: string;
  body: string;
  Icon: LucideIcon;
  accentColor: string;
};

const workflowCards: WorkflowCard[] = [
  {
    title: "Narrative DNA",
    body: "Build the people, places, systems, notes, and story details that shape your project.",
    Icon: Dna,
    accentColor: "var(--color-brand-soft)",
  },
  {
    title: "Timeline Planner",
    body: "Track arcs, beats, and story movement across the reader journey.",
    Icon: Network,
    accentColor: "var(--color-accent-interactive)",
  },
  {
    title: "Chapter Planner",
    body: "Shape chapters, key moments, and structure into a clear path before drafting.",
    Icon: BookOpenCheck,
    accentColor: "var(--color-brand-faint)",
  },
];

export function HomeWorkflowsSection() {
  return (
    <section className="home-workflows" aria-labelledby="home-workflows-title">
      <div className="site-container-wide">
        <header className="home-workflows__intro">
          <p className="home-workflows__kicker">Three Core Workflows</p>

          <h2 id="home-workflows-title" className="home-workflows__title">
            <span className="home-workflows__title-line">One story.</span>
            <span className="home-workflows__title-line home-workflows__title-line--accent">
              Everything in sync.
            </span>
          </h2>

          <p className="home-workflows__lede">
            Every part of your story affects the rest. Spinalith keeps it all
            connected, so you can shape the journey with clarity and purpose.
          </p>
        </header>

        <div className="home-workflows__body">
          <div className="home-workflows__cards">
            {workflowCards.map(({ title, body, Icon, accentColor }) => (
              <SiteFeatureCard
                key={title}
                title={title}
                body={body}
                Icon={Icon}
                accentColor={accentColor}
                accentPosition="right"
                tabletAccentPosition="bottom"
                variant="wide"
                className="home-workflows__card"
              />
            ))}
          </div>

          <div className="home-workflows__showcase">
            <NebulaShowcase
              origin={{ x: 88, y: 64 }}
              angle={-28}
              intensity={78}
              hazeReach={18}
              starReach={30}
              spread={28}
              starDensity={34}
              starBrightness={24}
              accentMix={6}
            >
              <ScreenshotFrame
                src="/assets/screenshots/home/dnav-characters-grid.png"
                alt="Spinalith Narrative DNA showing a character grid inside the story development workspace."
                variant="primaryColorHalo"
                className="home-workflows__frame"
              />
            </NebulaShowcase>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeWorkflowsSection;