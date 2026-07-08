// src/components/home/HomeProcessSection.tsx

/**
 * File: src/components/home/HomeProcessSection.tsx
 *
 * Purpose:
 * Homepage section that reinforces writer control and Spinalith's support role.
 *
 * Responsibilities:
 * - Present the "Built to Support Your Process" positioning section.
 * - Reinforce that the writer owns the story and vision.
 * - Use SiteBenefitItem for five compact benefit/proof callouts.
 * - Use an atmospheric writing-room image as a section backdrop.
 * - Bridge Start With Momentum into the later membership/CTA area.
 *
 * Notes:
 * - This section should feel calmer than the template/demo gallery before it.
 * - SiteBenefitItem owns benefit item visuals, sizing, icon shape, and copy sizing.
 * - This section CSS should not override SiteBenefitItem internals.
 * - Background image asset lives at public/assets/images/home/writer-control-starry-desk.png.
 */

import type { LucideIcon } from "lucide-react";
import {
  Eye,
  LayoutGrid,
  PencilLine,
  SlidersHorizontal,
  Sparkles,
  UserRound,
} from "lucide-react";

import SiteBenefitItem from "../site/SiteBenefitItem";

import "../../styles/page/home/homeProcess.css";

type ProcessBenefit = {
  title: string;
  body: string;
  Icon: LucideIcon;
  accentColor: string;
};

const processBenefits: ProcessBenefit[] = [
  {
    title: "You create",
    body: "Your ideas, choices, characters, and meaning stay yours.",
    Icon: PencilLine,
    accentColor: "var(--color-brand-soft)",
  },
  {
    title: "We organize",
    body: "Structure, notes, arcs, timelines, and connections stay in one place.",
    Icon: LayoutGrid,
    accentColor: "var(--color-accent-interactive)",
  },
  {
    title: "You decide",
    body: "Change anything. Your story evolves with you.",
    Icon: SlidersHorizontal,
    accentColor: "var(--color-brand-soft)",
  },
  {
    title: "See the whole picture",
    body: "Track moving parts before the draft becomes hard to untangle.",
    Icon: Eye,
    accentColor: "var(--color-brand-soft)",
  },
  {
    title: "Keep your voice",
    body: "Spinalith supports your process without replacing your creativity.",
    Icon: UserRound,
    accentColor: "var(--color-accent-interactive)",
  },
];

export function HomeProcessSection() {
  return (
    <section className="home-process" aria-labelledby="home-process-title">
      <div className="site-container-wide">
        <div className="home-process__body">
          <div className="home-process__content">
            <p className="home-process__kicker">Built to Support Your Process</p>

            <h2 id="home-process-title" className="home-process__title">
              <span>Your story.</span>
              <span className="home-process__title-accent">Your vision.</span>
            </h2>

            <p className="home-process__lede">
              Spinalith is a workspace for writers who want clarity without
              giving up control. We provide the tools. You shape the story.
            </p>
          </div>

          <div
            className="home-process__benefits"
            aria-label="How Spinalith supports the writing process"
          >
            {processBenefits.map(({ title, body, Icon, accentColor }) => (
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
                className="home-process__benefit"
              />
            ))}
          </div>

          <p className="home-process__proof-line">
            <Sparkles aria-hidden="true" />
            <span>Built for writers now. Evolving with writers always.</span>
          </p>
        </div>
      </div>
    </section>
  );
}

export default HomeProcessSection;