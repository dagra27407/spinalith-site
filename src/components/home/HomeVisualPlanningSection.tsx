// src/components/home/HomeVisualPlanningSection.tsx

/**
 * File: src/components/home/HomeVisualPlanningSection.tsx
 *
 * Purpose:
 * Homepage visual story-planning section for Spinalith.com.
 *
 * Responsibilities:
 * - Introduce visual planning as the first part of the homepage
 *   "How Spinalith Works" sequence.
 * - Explain how writers can see structural problems before drafting.
 * - Present Timeline Planner and Chapter Planner screenshots as one
 *   overlapping two-frame product composition.
 * - Use SiteBenefitItem for the section's supporting planning benefits.
 * - Close with a concise visual-planning proof statement.
 *
 * Notes:
 * - ScreenshotFrame_3X accepts optional slots, allowing this section to
 *   render a two-image composition without changing the three-image hero.
 * - The Chapter Planner screenshot currently uses the existing outline-view
 *   asset and can be replaced with a board-view screenshot later.
 * - Section-level styling lives in
 *   src/styles/page/home/homeVisualPlanning.css.
 * - Background artwork lives at
 *   public/assets/images/home/visual-planner-nebula-backdrop.png.
 */

import type { LucideIcon } from "lucide-react";
import {
  ArrowUpDown,
  Clock3,
  GitBranch,
  BookOpenText,
  Sparkles,
} from "lucide-react";

import { ScreenshotFrame_3X } from "@/components/site/ScreenshotFrame_3X";
import SiteBenefitItem from "@/components/site/SiteBenefitItem";

import "../../styles/page/home/homeVisualPlanning.css";

type VisualPlanningBenefit = {
  title: string;
  body: string;
  Icon: LucideIcon;
  accentColor: string;
};

const visualPlanningBenefits: VisualPlanningBenefit[] = [
  {
    title: "Track arcs and beats",
    body:
      "See where character growth, plot turns, and important moments happen—and where something disappears for too long.",
    Icon: GitBranch,
    accentColor: "var(--color-brand-soft)",
  },
  {
    title: "Compare multiple timelines",
    body:
      "Follow events that happen at the same time, in different places, or across separate story threads without losing the big picture.",
    Icon: Clock3,
    accentColor: "var(--color-accent-interactive)",
  },
  {
    title: "See chapter flow before drafting",
    body:
      "Lay chapters out in order so slow stretches, missing turns, and crowded sections are easier to spot.",
    Icon: BookOpenText,
    accentColor: "var(--color-brand-soft)",
  },
  {
    title: "Move it and make it better",
    body:
      "Drag scenes, beats, and chapters into a stronger order without rebuilding the whole plan from scratch.",
    Icon: ArrowUpDown,
    accentColor: "var(--color-accent-interactive)",
  },
];

export function HomeVisualPlanningSection() {
  return (
    <section
      id="how-it-works"
      className="home-visual-planning"
      aria-labelledby="home-visual-planning-title"
    >
      <div className="site-container-wide home-visual-planning__inner">
        <div className="home-visual-planning__content">
          <header className="home-visual-planning__header">
            <p className="home-visual-planning__kicker">
              Visual Story Planning
            </p>

            <h2
              id="home-visual-planning-title"
              className="home-visual-planning__title"
            >
              <span className="home-visual-planning__title-line">
                See what your
              </span>

              <span className="home-visual-planning__title-line">
                notes can’t{" "}
                <strong className="home-visual-planning__title-accent">
                  show you.
                </strong>
              </span>
            </h2>

            <p className="home-visual-planning__lede">
              Lay out the pieces, spot what is wrong, and move them until the
              story works.
            </p>

            <p className="home-visual-planning__body-copy">
              See where each arc turns, how events line up across timelines,
              and whether your chapters are carrying the story forward. When
              something feels wrong, you can move the pieces and try a better
              version before rewriting the draft.
            </p>
          </header>

          <div
            className="home-visual-planning__benefits"
            aria-label="Visual story-planning benefits"
          >
            {visualPlanningBenefits.map(
              ({ title, body, Icon, accentColor }) => (
                <SiteBenefitItem
                  key={title}
                  title={title}
                  body={body}
                  Icon={Icon}
                  accentColor={accentColor}
                  variant="row"
                  tone="plain"
                  align="left"
                  size="md"
                  iconShape="rounded"
                  className="home-visual-planning__benefit"
                />
              ),
            )}
          </div>

          <p className="home-visual-planning__support-line">
            <Sparkles aria-hidden="true" />
            <span>Plan with confidence. Write with focus.</span>
          </p>
        </div>

        <div className="home-visual-planning__visual">


          <div className="home-visual-planning__frame-stage">
            <ScreenshotFrame_3X
              eager
              className="home-visual-planning__frame-composition"
              left={{
                src: "/assets/screenshots/home/hero-tpv.png",
                alt:
                  "Spinalith Timeline Planner showing arcs, beats, and chapters arranged across a visual story plan.",
                depth: "front",
                x: 5,
                y: 45,
                width: 100,
                tilt: -10,
                rotate: 0,
                scale: 1,
                variant: "originalHeroFlat",
              }}
              right={{
                src: "/assets/screenshots/home/cpv-chapter-board.png",
                alt:
                  "Spinalith Chapter Planner showing chapters arranged into a clear structural sequence.",
                depth: "middle",
                x: 10,
                y: -40,
                width: 100,
                tilt: -10,
                rotate: 0,
                scale: 1,
                variant: "originalHeroFlat",
              }}
            />
          </div>

<p className="home-visual-planning__proof-line">
  <Sparkles aria-hidden="true" />
  <span>
    <strong>Spot</strong> sagging middles, missing beats, and plot holes{" "}
    <strong>early.</strong>
  </span>
  <Sparkles aria-hidden="true" />
</p>
        </div>
      </div>
    </section>
  );
}

export default HomeVisualPlanningSection;