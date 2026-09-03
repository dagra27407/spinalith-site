// src/components/features/FeaturesChapterPlannerSection.tsx

/**
 * File: src/components/features/FeaturesChapterPlannerSection.tsx
 *
 * Purpose:
 * Chapter Planner section for the Spinalith Features page.
 *
 * Responsibilities:
 * - Explains how Spinalith keeps multiple chapter-planning views synchronized.
 * - Highlights the core Chapter Planner views and supporting tools.
 * - Reinforces that writers can work in the view that best fits how they think.
 * - Presents the Chapter Planner demonstration using the shared VideoFrame component.
 *
 * Notes:
 * - This section reuses the shared Features page copy + media layout.
 * - This section uses the standard desktop orientation with copy on the left
 *   and media on the right.
 * - Shared video framing lives in src/components/site/VideoFrame.tsx.
 * - Shared Features page layout styling lives in:
 *   src/styles/page/features/featuresPage.css.
 */

import {
  Columns3,
  FileDown,
  FileText,
  ListTree,
  NotebookPen,
  Rows3,
} from "lucide-react";

import { VideoFrame } from "../site/VideoFrame";

const FEATURE_PLACEHOLDER_VIDEO =
  "/assets/videos/features/spinalith-feature-placeholder-8s.MP4";

const chapterPlannerFeatures = [
  {
    label: "Board view",
    Icon: Columns3,
  },
  {
    label: "Outline view",
    Icon: ListTree,
  },
  {
    label: "Timeline view",
    Icon: Rows3,
  },
  {
    label: "Print preview",
    Icon: FileText,
  },
  {
    label: "Planning notes",
    Icon: NotebookPen,
  },
  {
    label: "PDF export",
    Icon: FileDown,
  },
];

export function FeaturesChapterPlannerSection() {
  return (
    <section className="features-detail-section">
      <div className="site-container features-detail-section__inner">
        <div className="features-detail-section__copy">
          <span className="features-detail-section__kicker">
            Chapter Planner
          </span>

          <h2 className="features-detail-section__title">
            Build chapters your way.
          </h2>

          <p className="features-detail-section__lede">
            Organize chapters visually, in an outline, or on a timeline. 
            Every view stays in sync, so you can work the way that feels natural.
          </p>

          <div
            className="features-detail-section__feature-list"
            aria-label="Chapter Planner features"
          >
            {chapterPlannerFeatures.map(({ label, Icon }) => (
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
            Different views. Same underlying story.
          </p>
        </div>

        <div className="features-detail-section__media">
          <VideoFrame
            src={FEATURE_PLACEHOLDER_VIDEO}
            ariaLabel="Spinalith Chapter Planner feature demonstration"
            variant="productGlow"
          />
        </div>
      </div>
    </section>
  );
}