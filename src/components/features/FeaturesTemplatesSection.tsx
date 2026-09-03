// src/components/features/FeaturesTemplatesSection.tsx

/**
 * File: src/components/features/FeaturesTemplatesSection.tsx
 *
 * Purpose:
 * Templates section for the Spinalith Features page.
 *
 * Responsibilities:
 * - Explains what a Spinalith template actually provides inside a project.
 * - Shows that templates create a usable starting framework rather than a rigid structure.
 * - Highlights the major story-planning pieces that can be created from a template.
 * - Presents the template demonstration using the shared VideoFrame component.
 *
 * Notes:
 * - This section is intentionally different from the homepage Momentum section.
 * - The homepage helps visitors choose how they want to start.
 * - This section explains what happens after a template is chosen.
 * - Shared video framing lives in src/components/site/VideoFrame.tsx.
 * - Shared Features page layout styling lives in:
 *   src/styles/page/features/featuresPage.css.
 * - Templates-specific supporting styles live in:
 *   src/styles/page/features/featuresTemplates.css.
 */

import {
  BookOpen,
  Layers3,
  ListChecks,
  PencilRuler,
} from "lucide-react";

import { VideoFrame } from "../site/VideoFrame";

const FEATURE_PLACEHOLDER_VIDEO =
  "/assets/videos/features/spinalith-feature-placeholder-8s.MP4";

const templateFeatures = [
  {
    label: "Story beats included",
    Icon: ListChecks,
  },
  {
    label: "Acts and chapters ready",
    Icon: BookOpen,
  },
  {
    label: "Timelines set up",
    Icon: Layers3,
  },
  {
    label: "Change anything",
    Icon: PencilRuler,
  },
];

const templateExamples = [
  "Three Act",
  "Heroic Journey",
  "Beat Sheet",
  "Mystery",
  "Romance",
];

export function FeaturesTemplatesSection() {
  return (
    <section className="features-detail-section features-templates">
      <div className="site-container features-detail-section__inner">
        <div className="features-detail-section__copy">
          <span className="features-detail-section__kicker">
            Templates
          </span>

          <h2 className="features-detail-section__title">
            Start with a framework already in place.
          </h2>

          <p className="features-detail-section__lede">
            Choose a story structure and Spinalith can set up the acts, chapters, beats,
            and timelines for you. Then move, rename, remove, or rebuild anything as the
            story takes shape.
          </p>

          <div
            className="features-detail-section__feature-list"
            aria-label="Template features"
          >
            {templateFeatures.map(({ label, Icon }) => (
              <div
                className="features-detail-section__feature-chip"
                key={label}
              >
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </div>
            ))}
          </div>

          <p className="features-detail-section__takeaway">
            A starting point, not a set of rules.
          </p>
        </div>

        <div className="features-detail-section__media features-templates__media">
          <VideoFrame
            src={FEATURE_PLACEHOLDER_VIDEO}
            ariaLabel="Spinalith template feature demonstration"
            variant="productGlow"
          />

          <div
            className="features-templates__examples"
            aria-label="Available template examples"
          >
            {templateExamples.map((template) => (
              <span
                className="features-templates__example"
                key={template}
              >
                {template}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeaturesTemplatesSection;