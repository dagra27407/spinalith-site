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

import { Link } from "react-router-dom";

import { ScreenshotFrame } from "../site/ScreenshotFrame";

import { COMMON_LINKS } from "@/routes/CommonLinks";

const heroBenefits = [
  "See the big picture",
  "Keep everything connected",
  "Shape the reader journey",
];

export function HomeHeroSection() {
  return (
    <section className="home-hero site-section" aria-labelledby="home-hero-title">
      <div className="site-container home-hero__inner">
        <div className="home-hero__copy">
          <div className="home-hero__copy-main">
            <p className="home-hero__eyebrow">
              Story development workspace for writers
            </p>

            <h1 id="home-hero-title" className="home-hero__title">
              <span>Shape your story</span>
              <span>as it</span>
              <span>
                <strong>grows.</strong>
              </span>
            </h1>

            <p className="home-hero__lede">
              Spinalith helps writers organize, visualize, and manage every
              layer of their story.  Everything from structure and chapters to characters,
              worldbuilding, arcs, and the reader journey.
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

              <Link
                className="site-button site-button-secondary home-hero__button"
                to={COMMON_LINKS.site.features}
              >
                Explore Features
              </Link>
            </div>

            <ul
              className="home-hero__benefits"
              aria-label="Spinalith workspace benefits"
            >
              {heroBenefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="home-hero__visual" aria-label="Spinalith product preview">
          <div className="home-hero__visual-inner">
            <ScreenshotFrame
              variant="primaryColorHalo"
              eager
              src="/assets/screenshots/home/hero-tpv.png"
              alt="Spinalith Timeline Planner showing story arcs arranged across chapters."
            />
          </div>
        </div>
      </div>
    </section>
  );
}