// src/components/home/HomeHeroSection.tsx

/**
 * File: src/components/home/HomeHeroSection.tsx
 *
 * Purpose:
 * Launch homepage hero section for Spinalith.com.
 *
 * Responsibilities:
 * - Introduces Spinalith’s core launch positioning.
 * - Presents the primary homepage call to action.
 * - Frames the Timeline Planner screenshot as the first major product proof.
 * - Uses intentional markup structure so layout behavior is controlled by clear section classes.
 *
 * Notes:
 * - This section follows the Sprint 5.3 homepage blueprint and selected mockup direction.
 * - The hero visual should use a real TPV screenshot saved in public/assets/screenshots/home/.
 * - Avoid AI-first positioning; Spinalith launches as a story development workspace.
 */

import { ScreenshotFrame_3X } from "@/components/site/ScreenshotFrame_3X";

import { COMMON_LINKS } from "@/routes/CommonLinks";

export function HomeHeroSection() {
  return (
    <section className="home-hero site-section" aria-labelledby="home-hero-title">
      <div className="site-container home-hero__inner">
        <div className="home-hero__copy">
          <div className="home-hero__copy-main">
            <p className="home-hero__eyebrow">
              Story planning software for writers
            </p>

            <h1 id="home-hero-title" className="home-hero__title">
              <span>Helping WRITERS</span>
              <span>Organize and PLAN</span>
              <span>
                <strong>THEIR STORIES</strong>
              </span>
            </h1>

            <p className="home-hero__lede">
              Writers rarely run out of ideas. They get stuck when the story becomes
               too complicated to keep clear, connected, and moving forward.
            </p>
            <p className="home-hero__solution">
              <strong>That’s where Spinalith comes in.</strong>
            </p>
          </div>

          <div className="home-hero__action-area">
            <div className="home-hero__actions" aria-label="Hero actions">
              <a
                className="site-button site-button-primary home-hero__button"
                href={COMMON_LINKS.app.signup}
              >
                Start Building Your Story
              </a>

              <a
                className="site-button site-button-secondary home-hero__button"
                href="#how-it-works"
              >
                See How It Works
              </a>
            </div>
          </div>
        </div>

<div className="home-hero__visual">
<ScreenshotFrame_3X
  eager
  className="home-hero__visual-frame"
left={{
  src: "/assets/screenshots/home/cpv-chapter-outline2.png",
  alt: "Chapter Planner outline view",
  depth: "back",
  x: 3,
  y: 5,
  width: 110,
  tilt: 0,
  scale: 1,
  variant: "originalHero",
}}
center={{
  src: "/assets/screenshots/home/hero-tpv.png",
  alt: "Timeline Planner view",
  depth: "front",
  x: 10,
  y: 35,
  width: 85,
  tilt: -15,
  scale: 1,
  variant: "originalHero",
}}
right={{
  src: "/assets/screenshots/home/dnav-characters-grid.png",
  alt: "Narrative DNA character planning view",
  depth: "middle",
  x: 35,
  y: -40,
  width: 70,
  tilt: -15,
  scale: 1,
  variant: "originalHero",
}}
/>
</div>
      </div>
    </section>
  );
}