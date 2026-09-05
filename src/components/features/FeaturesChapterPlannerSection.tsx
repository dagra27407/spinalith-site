// src/components/features/FeaturesChapterPlannerSection.tsx

/**
 * File: src/components/features/FeaturesChapterPlannerSection.tsx
 *
 * Purpose:
 * Chapter Planner section for the Spinalith Features page.
 *
 * Responsibilities:
 * - Explains how Chapter Planner supports both discovery writers and plotters.
 * - Preserves the standard Features-page layout with copy on the left and video on the right.
 * - Adds a second 1x2 row beneath the original layout with one workflow column for discovery writers
 *   and one workflow column for writers who prefer to plan ahead.
 * - Shows how Chapter Planner helps writers diagnose chapter flow, preserve important discoveries,
 *   plan structure before drafting, and keep chapter data synchronized.
 *
 * Notes:
 * - The first row mirrors the Visual Planning section orientation:
 *   copy on the left and media on the right.
 * - The second row intentionally leads with discovery writing on the left to make that workflow
 *   feel equally supported by a product that naturally appeals to plotters.
 * - Each workflow column has a compact header followed by six detailed callouts.
 * - Divider lines are removed so spacing separates the callouts.
 * - Responsive layouts collapse both rows into one stacked column.
 * - Export-specific messaging belongs in the dedicated Export section.
 * - Shared feature typography and callout base styles live in:
 *   src/styles/page/features/featuresPage.css.
 * - Chapter Planner layout styling lives in:
 *   src/styles/page/features/featuresChapterPlanner.css.
 * - Shared video framing lives in:
 *   src/components/site/VideoFrame.tsx.
 */

import {
  ArrowLeftRight,
  BookOpenCheck,
  Columns3,
  GitPullRequest,
  Link2,
  ListTree,
  NotebookTabs,
  RefreshCcw,
  SearchCheck,
  Sparkles,
  Waypoints,
  Workflow,
} from "lucide-react";

import { VideoFrame } from "../site/VideoFrame";

const FEATURE_PLACEHOLDER_VIDEO =
  "/assets/videos/features/spinalith-feature-placeholder-8s.MP4";

const discoveryCallouts = [
  {
    title: "Capture what changed",
    description:
      "Save the reveal, clue, character shift, new subplot, or other important thing the draft just created.",
    Icon: Sparkles,
  },
  {
    title: "Map the chapters that matter",
    description:
      "You do not need to rebuild every chapter. Break down the ones that create consequences or need more attention.",
    Icon: NotebookTabs,
  },
  {
    title: "Figure out what feels off",
    description:
      "If a chapter drags, feels crowded, or the flow just is not working, lay out the important pieces and see where the problem is.",
    Icon: SearchCheck,
  },
  {
    title: "Test a different arrangement",
    description:
      "Move scenes, beats, or key moments around and see if the chapter works better another way.",
    Icon: ArrowLeftRight,
  },
  {
    title: "Remember what the story now owes you",
    description:
      "Keep setups, promises, clues, and character changes visible so they do not disappear into the draft.",
    Icon: Waypoints,
  },
  {
    title: "Keep discoveries connected",
    description:
      "Tie those important chapter elements back to the characters, arcs, timelines, notes, and other story details they affect.",
    Icon: Link2,
  },
];

const planningCallouts = [
  {
    title: "Build the chapter before you draft",
    description:
      "Lay out the beats, scenes, key moments, and other story elements you want the chapter to carry.",
    Icon: BookOpenCheck,
  },
  {
    title: "See what each chapter is doing",
    description:
      "Make sure every chapter has a clear job, carries the right amount of story, and flows naturally into what comes before and after it.",
    Icon: Workflow,
  },
  {
    title: "Rearrange chapters visually",
    description:
      "Move chapters around and test a different order without rebuilding your plan.",
    Icon: Columns3,
  },
  {
    title: "Move story elements between chapters",
    description:
      "Shift a beat or scene when it works better earlier, later, or somewhere else.",
    Icon: GitPullRequest,
  },
  {
    title: "Switch views as you work",
    description:
      "Move between board, outline, timeline, and print-style views without recreating the same chapter plan.",
    Icon: ListTree,
  },
  {
    title: "Keep everything synchronized",
    description:
      "Reorder or edit once and let the same chapter data stay updated across the different views.",
    Icon: RefreshCcw,
  },
];

type ChapterPlannerCalloutData =
  | (typeof discoveryCallouts)[number]
  | (typeof planningCallouts)[number];

function ChapterPlannerCallout({
  title,
  description,
  Icon,
}: ChapterPlannerCalloutData) {
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

export function FeaturesChapterPlannerSection() {
  return (
    <section className="features-detail-section features-chapter-planner">
      <div className="site-container features-chapter-planner__inner">
        <div className="features-chapter-planner__top-row">
          <div className="features-chapter-planner__intro">
            <span className="features-detail-section__kicker">
              Chapter Planner
            </span>

            <h2 className="features-detail-section__title">
              Build chapters your way.
            </h2>

            <p className="features-detail-section__lede">
              Some writers map out every chapter before they draft. Others discover
              the chapter on the page and only stop to map it when something matters
              enough to remember or something feels off. Chapter Planner supports both.
            </p>
          </div>

          <div className="features-chapter-planner__media">
            <VideoFrame
              src={FEATURE_PLACEHOLDER_VIDEO}
              ariaLabel="Spinalith Chapter Planner feature demonstration"
              variant="productGlow"
            />
          </div>
        </div>

        <div
          className="features-chapter-planner__feature-row"
          aria-label="Chapter Planner workflows"
        >
          <div className="features-chapter-planner__workflow-column">
            <div className="features-chapter-planner__workflow-heading">
              <span>If you discover as you write</span>
              <p>
                Use Chapter Planner when the draft creates something you need to
                remember or when a chapter needs help.
              </p>
            </div>

            <div className="features-chapter-planner__callout-column">
              {discoveryCallouts.map((callout) => (
                <ChapterPlannerCallout
                  key={callout.title}
                  {...callout}
                />
              ))}
            </div>
          </div>

          <div className="features-chapter-planner__workflow-column">
            <div className="features-chapter-planner__workflow-heading">
              <span>If you plan ahead</span>
              <p>
                Build the chapter before drafting, then adjust the pieces until the
                structure, pacing, and flow feel right.
              </p>
            </div>

            <div className="features-chapter-planner__callout-column">
              {planningCallouts.map((callout) => (
                <ChapterPlannerCallout
                  key={callout.title}
                  {...callout}
                />
              ))}
            </div>
          </div>
        </div>

        <p className="features-detail-section__takeaway features-chapter-planner__takeaway">
          Different approaches. Same connected story.
        </p>
      </div>
    </section>
  );
}
