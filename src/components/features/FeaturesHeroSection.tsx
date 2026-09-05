// src/components/features/FeaturesHeroSection.tsx

/**
 * File: src/components/features/FeaturesHeroSection.tsx
 *
 * Purpose:
 * Hero section for the Spinalith Features page.
 *
 * Responsibilities:
 * - Introduces the Features page as a workspace that supports different writing styles.
 * - Frames the page around how Spinalith fits into a writer's workflow.
 * - Provides the primary 14-day free-trial CTA.
 * - Presents the overview feature video using the shared VideoFrame component.
 * - Shows that the same story can be viewed and worked with across multiple Spinalith workspaces.
 *
 * Notes:
 * - This is a product-focused hero, not a second homepage hero.
 * - The product video should remain the primary visual evidence in this section.
 * - The hero video is intended to move quickly across multiple workspaces using the same story.
 * - The video caption should describe the specific behavior being demonstrated rather than repeat the headline.
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
            <span>A workspace for</span>
            <strong>any writing style.</strong>
          </h1>

          <p className="features-hero__lede">
            Spinalith adapts to how you work. Plan every beat or discover the story as you go,
            and keep your chapters, timelines, characters, and story details connected as the
            story evolves. Whether you are rearranging events to see how the story plays out or
            tracking the small details that matter, Spinalith fits into your workflow instead of
            forcing you into one.
          </p>

          <div className="features-hero__actions">
            <a
              className="site-button site-button-primary features-hero__button"
              href={COMMON_LINKS.app.startMembership}
            >
              Start My 14-Day Trial
            </a>
          </div>

          <p className="features-hero__trial-note">
            Full access for 14 days. Cancel anytime.
          </p>
        </div>

        <div className="features-hero__media">
          <VideoFrame
            src={FEATURE_PLACEHOLDER_VIDEO}
            ariaLabel="Spinalith connected workspace feature overview"
            ariaDescription="Demonstration: The Timeline Planner opens with the story structure visible. A beat is moved to a new position. A linked character is then opened in Narrative DNA and a visible character detail is changed. Returning to the planning workspace shows the updated connected information. The Chapter Planner then opens with the same story represented there, showing that these are different ways of working with the same connected story."
            caption="Same story. Different ways to see it."
            showCaption
            variant="productGlow"
          />
        </div>
      </div>
    </section>
  );
}
