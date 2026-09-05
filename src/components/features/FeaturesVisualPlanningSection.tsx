// src/components/features/FeaturesVisualPlanningSection.tsx

/**
 * File: src/components/features/FeaturesVisualPlanningSection.tsx
 *
 * Purpose:
 * Visual Planning section for the Spinalith Features page.
 *
 * Responsibilities:
 * - Introduces visual planning as a living digital corkboard for the story.
 * - Shows how writers can lay out, move, compare, and inspect story structure visually.
 * - Supports both planning ahead and organizing a story that is already being discovered in the draft.
 * - Explains the five most important visual-planning behaviors in plain language.
 * - Presents the Visual Planning demonstration using the shared VideoFrame component.
 *
 * Notes:
 * - This section uses two stacked 1x2 desktop rows.
 * - The first row preserves the original copy + video composition.
 * - The second row places three feature callouts in the left column and two in the right.
 * - The takeaway sits below the second row.
 * - Responsive layouts collapse both rows into one stacked column.
 * - Chapter-specific mechanics belong in the Chapter Planner section.
 * - The video should demonstrate one simple visual-planning interaction rather than act as a tutorial.
 * - Shared feature typography and callout styling lives in:
 *   src/styles/page/features/featuresPage.css.
 * - Visual Planning layout styling lives in:
 *   src/styles/page/features/featuresVisualPlanning.css.
 * - Shared video framing lives in:
 *   src/components/site/VideoFrame.tsx.
 */

import {
  Eye,
  GitBranch,
  Link2,
  Move,
  ScanSearch,
} from "lucide-react";

import { VideoFrame } from "../site/VideoFrame";

const FEATURE_PLACEHOLDER_VIDEO =
  "/assets/videos/features/features_Visual_Planning.mp4";

const visualPlanningCallouts = [
  {
    title: "See the whole story",
    description:
      "Lay out beats, arcs, and timelines so you can see how the major pieces fit together at a glance.",
    Icon: Eye,
  },
  {
    title: "Move the pieces",
    description:
      "Does the villain reveal work better in Chapter 16? " +
      "Should Chapter 6 really sit between 9 and 10? " +
      "Does that beat belong in John’s arc instead of Paul’s? " +
      "Drag story elements around and see what works, while the key details stay connected.",
    Icon: Move,
  },
  {
    title: "Spot gaps and pacing",
    description:
      "See where the story feels too thin, too crowded, or out of balance at a glance.",
    Icon: ScanSearch,
  },
  {
    title: "Follow arcs and timelines",
    description:
      "See how arcs and timelines unfold across the story side by side. " +
      "Is there too big a gap in the B Story? " +
      "Did one timeline get too much focus across Chapters 5 through 10?",
    Icon: GitBranch,
  },
  {
    title: "Keep it connected",
    description:
      "Rearrange story elements without having to reconnect them. " +
      "Drag a beat to a new arc and it automatically links to that arc. " +
      "Move a chapter to a new position and the chapter numbers update automatically.",
    Icon: Link2,
  },
];

function VisualPlanningCallout({
  title,
  description,
  Icon,
}: (typeof visualPlanningCallouts)[number]) {
  return (
    <div className="features-detail-section__callout">
      <div className="features-detail-section__callout-icon">
        <Icon aria-hidden="true" />
      </div>

      <div className="features-detail-section__callout-copy">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export function FeaturesVisualPlanningSection() {
  const leftCallouts = visualPlanningCallouts.slice(0, 3);
  const rightCallouts = visualPlanningCallouts.slice(3);

  return (
    <section className="features-detail-section features-visual-planning">
      <div className="site-container features-visual-planning__inner">
        <div className="features-visual-planning__top-row">
          <div className="features-visual-planning__intro">
            <span className="features-detail-section__kicker">
              Visual Planning
            </span>

            <h2 className="features-detail-section__title">
              See your story as a whole.
            </h2>

            <p className="features-detail-section__lede">
              Think of it like an old-school corkboard, but alive. Use it to plan
              ahead or make sense of what you've already written. Try different
              ways for the story to unfold, and everything stays connected.
            </p>
          </div>

          <div className="features-visual-planning__media">
            <VideoFrame
              src={FEATURE_PLACEHOLDER_VIDEO}
              ariaLabel="Spinalith visual planning feature demonstration"
              ariaDescription="Demonstration: The story opens in a visual planning view with chapters, beats, arcs, and other story elements arranged across the project. A story element is dragged to a new position. The view then switches to the Timeline Planner, where a second timeline is revealed and the story is shown at a wider scale. The demonstration shows how story structure can be rearranged visually and viewed across multiple timelines without rebuilding the plan."
              variant="productGlow"
            />
          </div>
        </div>

        <div
          className="features-visual-planning__feature-row"
          aria-label="Visual planning features"
        >
          <div className="features-visual-planning__callout-column">
            {leftCallouts.map((callout) => (
              <VisualPlanningCallout
                key={callout.title}
                {...callout}
              />
            ))}
          </div>

          <div className="features-visual-planning__callout-column">
            {rightCallouts.map((callout) => (
              <VisualPlanningCallout
                key={callout.title}
                {...callout}
              />
            ))}
          </div>
        </div>

        <p className="features-detail-section__takeaway features-visual-planning__takeaway">
          Your whole story stays visible as it grows.
        </p>
      </div>
    </section>
  );
}

