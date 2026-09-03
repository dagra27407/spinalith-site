// src/components/features/FeaturesVisualPlanningSection.tsx

/**
 * File: src/components/features/FeaturesVisualPlanningSection.tsx
 *
 * Purpose:
 * Visual Planning section for the Spinalith Features page.
 *
 * Responsibilities:
 * - Explains how Spinalith helps writers see story structure as a whole.
 * - Supports both planning ahead and organizing story information as it develops.
 * - Highlights the core visual-planning capabilities in a compact feature list.
 * - Presents the Visual Planning demonstration using the shared VideoFrame component.
 *
 * Notes:
 * - This section establishes the reusable copy + media pattern used by later
 *   feature sections.
 * - Keep the copy inclusive of both plotters and pantsers.
 * - Shared video framing lives in src/components/site/VideoFrame.tsx.
 * - Shared Features page layout styling lives in:
 *   src/styles/page/features/featuresPage.css.
 */

import {
  BookOpen,
  Filter,
  GitBranch,
  Layers3,
  Move,
  Printer,
} from "lucide-react";

import { VideoFrame } from "../site/VideoFrame";

const FEATURE_PLACEHOLDER_VIDEO =
  "/assets/videos/features/spinalith-feature-placeholder-8s.MP4";

const visualPlanningFeatures = [
  {
    label: "Drag & drop",
    Icon: Move,
  },
  {
    label: "Multiple timelines",
    Icon: Layers3,
  },
  {
    label: "Acts & arcs",
    Icon: GitBranch,
  },
  {
    label: "Chapter planning",
    Icon: BookOpen,
  },
  {
    label: "Filters",
    Icon: Filter,
  },
  {
    label: "Print views",
    Icon: Printer,
  },
];

export function FeaturesVisualPlanningSection() {
  return (
    <section className="features-detail-section">
      <div className="site-container features-detail-section__inner">
        <div className="features-detail-section__copy">
          <span className="features-detail-section__kicker">
            Visual Planning
          </span>

          <h2 className="features-detail-section__title">
            See your story as a whole.
          </h2>

          <p className="features-detail-section__lede">
            Plan ahead or organize as you go. Arrange scenes, compare timelines,
            track story threads, and see how the pieces fit together.
          </p>

          <div
            className="features-detail-section__feature-list"
            aria-label="Visual planning features"
          >
            {visualPlanningFeatures.map(({ label, Icon }) => (
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
            Your whole story stays visible as it grows.
          </p>
        </div>

        <div className="features-detail-section__media">
          <VideoFrame
            src={FEATURE_PLACEHOLDER_VIDEO}
            ariaLabel="Spinalith visual planning feature demonstration"
            variant="productGlow"
          />
        </div>
      </div>
    </section>
  );
}