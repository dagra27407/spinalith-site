// src/components/features/FeaturesHeroSection.tsx

/**
 * File: src/components/features/FeaturesHeroSection.tsx
 *
 * Purpose:
 * Hero section for the Spinalith Features page.
 *
 * Responsibilities:
 * - Introduces the Features page and its core connected-workspace promise.
 * - Provides the primary membership CTA.
 * - Presents the overview feature video using the shared VideoFrame component.
 * - Gives visitors a quick understanding of what the rest of the page will demonstrate.
 *
 * Notes:
 * - This is a product-focused hero, not a second homepage hero.
 * - The product video should remain the primary visual evidence in this section.
 * - The placeholder video can be replaced later without changing this component layout.
 * - Features-specific layout styling lives in:
 *   src/styles/page/features/featuresHero.css.
 * - Shared video framing lives in:
 *   src/components/site/VideoFrame.tsx.
 * - Shared button, container, typography, and design-token styles remain global.
 */

import { COMMON_LINKS } from "../../routes/CommonLinks";
import { VideoFrame } from "../site/VideoFrame";

const FEATURE_PLACEHOLDER_VIDEO =
  "/assets/videos/features/spinalith-feature-placeholder-8s.MP4";

export function FeaturesHeroSection() {
  return (
    <section className="features-hero">
      <div className="site-container features-hero__inner">
        <div className="features-hero__copy">
          <span className="features-hero__kicker">Features</span>

          <h1 className="features-hero__title">
            <span>Everything you need</span>
            <span>to plan your story.</span>
            <strong>One connected workspace.</strong>
          </h1>

          <p className="features-hero__lede">
            Spinalith brings your story structure, chapters, characters, worldbuilding, 
            and timelines into one connected workspace, whether you plan ahead or organize as you go.
          </p>

          <div className="features-hero__actions">
            <a
              className="site-button site-button-primary features-hero__button"
              href={COMMON_LINKS.app.startMembership}
            >
              Start Your Membership
            </a>
          </div>
        </div>

        <div className="features-hero__media">
          <VideoFrame
            src={FEATURE_PLACEHOLDER_VIDEO}
            ariaLabel="Spinalith connected workspace feature overview"
            caption="Changes carry across your story workspace."
            showCaption
            variant="productGlow"
          />
        </div>
      </div>
    </section>
  );
}