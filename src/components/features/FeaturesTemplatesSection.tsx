// src/components/features/FeaturesTemplatesSection.tsx

/**
 * File: src/components/features/FeaturesTemplatesSection.tsx
 *
 * Purpose:
 * Templates section for the Spinalith Features page.
 *
 * Responsibilities:
 * - Explains how templates reduce blank-project setup friction.
 * - Shows that Spinalith templates create a usable framework inside the actual workspace.
 * - Highlights five practical ways templates help writers start faster without locking them into a method.
 * - Preserves the standard Features-page orientation with copy on the left and video on the right.
 *
 * Notes:
 * - This section intentionally differs from the homepage Momentum section.
 * - The homepage helps visitors choose how they want to start.
 * - This section explains what happens after a template is chosen.
 * - The first row keeps the original copy-left + video-right composition.
 * - The second row contains five detailed template callouts in two columns.
 * - Divider lines are removed so spacing separates the callouts.
 * - Responsive layouts collapse both rows into one stacked column.
 * - Shared feature typography and callout base styles live in:
 *   src/styles/page/features/featuresPage.css.
 * - Templates-specific layout styling lives in:
 *   src/styles/page/features/featuresTemplates.css.
 * - Shared video framing lives in:
 *   src/components/site/VideoFrame.tsx.
 */

import {
  BookOpenCheck,
  Boxes,
  Gauge,
  GraduationCap,
  PencilRuler,
} from "lucide-react";

import { VideoFrame } from "../site/VideoFrame";

const FEATURE_PLACEHOLDER_VIDEO =
  "/assets/videos/features/spinalith-feature-placeholder-8s.MP4";

const templateCallouts = [
  {
    title: "Start faster",
    description:
      "Choose a structure and begin with the major pieces already in place instead of building the project from scratch.",
    Icon: Gauge,
  },
  {
    title: "Use a framework you already know",
    description:
      "Start with structures like Three Act, Heroic Journey, Beat Sheet, Mystery, or Romance without manually recreating them.",
    Icon: BookOpenCheck,
  },
  {
    title: "See the structure inside the workspace",
    description:
      "Acts, chapters, beats, and timelines are created where you will actually use them, not as a separate reference document.",
    Icon: Boxes,
  },
  {
    title: "Change anything",
    description:
      "Rename, move, remove, add, or rebuild pieces as the story changes. The template is a starting point, not a rulebook.",
    Icon: PencilRuler,
  },
  {
    title: "Learn by example",
    description:
      "Use sample projects to see how Spinalith is set up and how a finished story framework can look before building your own.",
    Icon: GraduationCap,
  },
];

function TemplateCallout({
  title,
  description,
  Icon,
}: (typeof templateCallouts)[number]) {
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

export function FeaturesTemplatesSection() {
  const leftCallouts = templateCallouts.slice(0, 3);
  const rightCallouts = templateCallouts.slice(3);

  return (
    <section className="features-detail-section features-templates">
      <div className="site-container features-templates__inner">
        <div className="features-templates__top-row">
          <div className="features-templates__intro">
            <span className="features-detail-section__kicker">
              Templates
            </span>

            <h2 className="features-detail-section__title">
              Start with a framework already in place.
            </h2>

            <p className="features-detail-section__lede">
              Starting from a blank project can be intimidating, even when you know
              the kind of story you want to tell. Choose a familiar structure and
              Spinalith can build the starting framework for you. Use it as-is,
              change what does not fit, or strip it down as the story becomes your own.
            </p>
          </div>

          <div className="features-templates__media">
            <VideoFrame
              src={FEATURE_PLACEHOLDER_VIDEO}
              ariaLabel="Spinalith template feature demonstration"
              variant="productGlow"
            />

          </div>
        </div>

        <div
          className="features-templates__feature-row"
          aria-label="Template features"
        >
          <div className="features-templates__callout-column">
            {leftCallouts.map((callout) => (
              <TemplateCallout
                key={callout.title}
                {...callout}
              />
            ))}
          </div>

          <div className="features-templates__callout-column">
            {rightCallouts.map((callout) => (
              <TemplateCallout
                key={callout.title}
                {...callout}
              />
            ))}
          </div>
        </div>

        <p className="features-detail-section__takeaway features-templates__takeaway">
          A starting point, not a set of rules.
        </p>
      </div>
    </section>
  );
}

export default FeaturesTemplatesSection;
