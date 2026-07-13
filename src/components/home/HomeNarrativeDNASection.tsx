// src/components/home/HomeNarrativeDNASection.tsx

/**
 * File: src/components/home/HomeNarrativeDNASection.tsx
 *
 * Purpose:
 * Homepage section introducing Narrative DNA as the connected home
 * for the people, places, relationships, notes, and worldbuilding
 * details that support a story.
 *
 * Responsibilities:
 * - Explain Narrative DNA in clear, writer-first language.
 * - Present common detail-management frustrations through SiteQuoteCard.
 * - Use the optional SiteQuoteCard eyebrow treatment for section context.
 * - Reinforce that Narrative DNA details connect to the wider story plan.
 * - Showcase the DNAV character grid with the shared ScreenshotFrame.
 * - Present three compact product benefits beneath the screenshot.
 *
 * Notes:
 * - The section replaces the former HomeWorkflowsSection.
 * - Section-level styling lives in
 *   src/styles/page/home/homeNarrativeDNA.css.
 * - Background artwork lives at
 *   public/assets/images/home/narrative-dna-nebula-backdrop.png.
 * - Screenshot artwork lives at
 *   public/assets/screenshots/home/dnav-characters-grid.png.
 */

import type { LucideIcon } from "lucide-react";
import {
  Link2,
  Network,
  RefreshCw,
  Search,
} from "lucide-react";

import { ScreenshotFrame } from "@/components/site/ScreenshotFrame";
import SiteBenefitItem from "@/components/site/SiteBenefitItem";
import SiteQuoteCard from "@/components/site/SiteQuoteCard";

import "../../styles/page/home/homeNarrativeDNA.css";

type NarrativeDNAQuote = {
  quote: string;
  body: string;
};

type NarrativeDNABenefit = {
  title: string;
  body: string;
  Icon: LucideIcon;
  accentColor: string;
};

const narrativeDNAQuotes: NarrativeDNAQuote[] = [
  {
    quote: "I know I wrote that down somewhere.",
    body: "Give every important story detail a clear home.",
  },
  {
    quote: "I’m spending more time searching than writing.",
    body:
      "Find what you already decided without digging through notebooks, files, and old drafts.",
  },
];

const narrativeDNABenefits: NarrativeDNABenefit[] = [
  {
    title: "Find it fast",
    body: "Keep important story details easy to find.",
    Icon: Search,
    accentColor: "var(--color-brand-soft)",
  },
  {
    title: "Change it once",
    body: "Update a detail in one place.",
    Icon: RefreshCw,
    accentColor: "var(--color-accent-interactive)",
  },
  {
    title: "Keep it connected",
    body: "Link details to the parts of the story they affect.",
    Icon: Link2,
    accentColor: "var(--color-brand-soft)",
  },
];

export function HomeNarrativeDNASection() {
  return (
    <section
      className="home-narrative-dna"
      aria-labelledby="home-narrative-dna-title"
    >
      <div className="site-container-display home-narrative-dna__inner">
        <div className="home-narrative-dna__copy">
          <header className="home-narrative-dna__header">
            <p className="home-narrative-dna__kicker">Narrative DNA</p>

            <h2
              id="home-narrative-dna-title"
              className="home-narrative-dna__title"
            >
              <span className="home-narrative-dna__title-line">
                Your story is built from details.
              </span>

              <span className="home-narrative-dna__title-line home-narrative-dna__title-accent">
                Narrative DNA keeps them together.
              </span>
            </h2>

            <p className="home-narrative-dna__lede">
              Your characters, relationships, locations, worldbuilding, conflicts,
              and the details your story depends on are the DNA of your story.
              Narrative DNA gives each one a place to live, so you are not relying
              on scattered notes or memory to keep everything straight.
            </p>
          </header>

          <div
            className="home-narrative-dna__quotes"
            aria-label="How Narrative DNA helps writers"
          >
            {narrativeDNAQuotes.map(({ quote, body }) => (
              <SiteQuoteCard
                key={quote}
                eyebrow="How Narrative DNA helps"
                quote={quote}
                body={body}
                accentColor="var(--color-brand-soft)"
                density="default"
                accentPosition="bottom-left"
                heightMode="equal"
                className="home-narrative-dna__quote-card"
              />
            ))}
          </div>

          <div className="home-narrative-dna__connection">
            <div
              className="home-narrative-dna__connection-icon"
              aria-hidden="true"
            >
              <Network />
            </div>

            <p className="home-narrative-dna__connection-copy">
              Those details do not stop at their profile pages. Connect them to
              the chapters, scenes, beats, arcs, and timelines where they
              matter.
            </p>
          </div>

          <p className="home-narrative-dna__closing">
            The details stay part of the plan.
          </p>
        </div>

        <div className="home-narrative-dna__visual">
          <div className="home-narrative-dna__frame-shell">
            <ScreenshotFrame
              src="/assets/screenshots/home/dnav-characters-grid.png"
              alt="Spinalith Narrative DNA showing a character grid inside the story development workspace."
              variant="primaryColorHalo"
              className="home-narrative-dna__frame"
            />
          </div>

          <div
            className="home-narrative-dna__benefits"
            aria-label="Narrative DNA benefits"
          >
            {narrativeDNABenefits.map(
              ({ title, body, Icon, accentColor }) => (
                <SiteBenefitItem
                  key={title}
                  title={title}
                  body={body}
                  Icon={Icon}
                  accentColor={accentColor}
                  variant="stack"
                  tone="plain"
                  align="center"
                  size="sm"
                  iconShape="circle"
                  className="home-narrative-dna__benefit"
                />
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeNarrativeDNASection;