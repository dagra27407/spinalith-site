// src/components/features/FeaturesNarrativeDNASection.tsx

/**
 * File: src/components/features/FeaturesNarrativeDNASection.tsx
 *
 * Purpose:
 * Narrative DNA section for the Spinalith Features page.
 *
 * Responsibilities:
 * - Explains Narrative DNA through the everyday problem of keeping track of story details.
 * - Preserves the original reversed Features-page layout with video on the left and copy on the right.
 * - Adds a second 1x2 row beneath the original layout for six detailed feature callouts.
 * - Keeps three callouts stacked in the left column and three stacked in the right column.
 * - Shows how story information can be stored, connected, updated, noted, searched, and expanded over time.
 *
 * Notes:
 * - The first row intentionally reuses the original shared reversed layout from featuresPage.css.
 * - The second row mirrors the Visual Planning section's two-column callout layout.
 * - Divider lines are removed for this section so spacing separates the callouts.
 * - Responsive layouts collapse the second row into one column.
 * - Shared feature typography and reversed layout styling lives in:
 *   src/styles/page/features/featuresPage.css.
 * - Narrative DNA callout-row styling lives in:
 *   src/styles/page/features/featuresNarrativeDNA.css.
 * - Shared video framing lives in:
 *   src/components/site/VideoFrame.tsx.
 */

import {
  FileText,
  Link2,
  Network,
  Search,
  Sparkles,
  Tags,
} from "lucide-react";

import { VideoFrame } from "../site/VideoFrame";

const FEATURE_PLACEHOLDER_VIDEO =
  "/assets/videos/features/features_NarativeDNA.mp4";

const narrativeDNACallouts = [
  {
    title: "Give every detail a home",
    description:
      "Keep characters, locations, relationships, lore, items, worldbuilding, and other story details somewhere intentional instead of scattered across notes.",
    Icon: Tags,
  },
  {
    title: "Connect the people, places, and ideas",
    description:
      "Link story elements together so the people, places, relationships, chapters, scenes, and other details that matter can stay tied to each other.",
    Icon: Network,
  },
  {
    title: "Update it once",
    description:
      "Change a story detail in one place and the same underlying information stays current wherever that story element is referenced.",
    Icon: Link2,
  },
  {
    title: "Capture notes where they belong",
    description:
      "Make a quick note for the story as a whole, or tie it to one or more specific story elements so you can find the idea again in the right context later.",
    Icon: FileText,
  },
  {
    title: "Find what you need fast",
    description:
      "Search and move through related story information instead of trying to remember which notebook, document, or random file has the detail you need.",
    Icon: Search,
  },
  {
    title: "Build it as the story grows",
    description:
      "You do not have to know everything up front. Add characters, relationships, world details, notes, and other information as you discover them.",
    Icon: Sparkles,
  },
];

function NarrativeDNACallout({
  title,
  description,
  Icon,
}: (typeof narrativeDNACallouts)[number]) {
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

export function FeaturesNarrativeDNASection() {
  const leftCallouts = narrativeDNACallouts.slice(0, 3);
  const rightCallouts = narrativeDNACallouts.slice(3);

  return (
    <section className="features-detail-section features-detail-section--reverse features-narrative-dna">
      <div className="site-container features-detail-section__inner">
        <div className="features-detail-section__copy">
          <span className="features-detail-section__kicker">
            Narrative DNA
          </span>

          <h2 className="features-detail-section__title">
            Every story detail has a home.
          </h2>

          <p className="features-detail-section__lede">
            How do you keep track of story details as you write? A notebook?
            Index cards? Your head? Ever tried to remember a character's eye
            color at 2 a.m.? Had a random idea for a location you wanted to use
            later, then couldn't remember where you wrote it down?
          </p>
        </div>

        <div className="features-detail-section__media">
          <VideoFrame
            src={FEATURE_PLACEHOLDER_VIDEO}
            ariaLabel="Spinalith Narrative DNA feature demonstration"
            ariaDescription="Demonstration: A character is opened in Narrative DNA and a visible character detail is changed. Another part of the story is then opened where that same character is referenced, and the updated detail appears there automatically. The demonstration returns to the character profile and shows a linked relationship or location, illustrating that characters and other story elements are connected rather than stored as isolated records."
            variant="productGlow"
          />
        </div>
      </div>

      <div className="site-container">
        <div
          className="features-narrative-dna__feature-row"
          aria-label="Narrative DNA features"
        >
          <div className="features-narrative-dna__callout-column">
            {leftCallouts.map((callout) => (
              <NarrativeDNACallout key={callout.title} {...callout} />
            ))}
          </div>

          <div className="features-narrative-dna__callout-column">
            {rightCallouts.map((callout) => (
              <NarrativeDNACallout key={callout.title} {...callout} />
            ))}
          </div>
        </div>

        <p className="features-detail-section__takeaway features-narrative-dna__takeaway">
          Edit once. See it everywhere.
        </p>
      </div>
    </section>
  );
}
