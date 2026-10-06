// src/components/home/HomeSceneWriterSection.tsx

/**
 * File: src/components/home/HomeSceneWriterSection.tsx
 *
 * Purpose:
 * Homepage section introducing Scene Writer as the place where a planned scene
 * becomes an actual draft without leaving the connected Spinalith workspace.
 *
 * Responsibilities:
 * - Show the Scene Writer workspace using the shared ScreenshotFrame component.
 * - Explain the scene-first drafting workflow in plain language.
 * - Reinforce that scene drafts stay attached to their scenes as the story is reorganized.
 * - Present compact supporting benefits using the shared SiteBenefitItem component.
 *
 * Notes:
 * - ScreenshotFrame owns product-frame presentation.
 * - SiteBenefitItem owns benefit-item presentation.
 * - This section owns only its composition, atmosphere, spacing, and responsive layout.
 * - Section-level styling lives in src/styles/page/home/homeSceneWriter.css.
 */

import type { LucideIcon } from "lucide-react";
import {
  BookOpenText,
  Link2,
  ListPlus,
  Sparkles,
} from "lucide-react";

import { ScreenshotFrame } from "@/components/site/ScreenshotFrame";
import SiteBenefitItem from "@/components/site/SiteBenefitItem";

import "../../styles/page/home/homeSceneWriter.css";

type SceneWriterBenefit = {
  title: string;
  body: string;
  Icon: LucideIcon;
  accentColor: string;
};

const sceneWriterBenefits: SceneWriterBenefit[] = [
  {
    title: "Write scene by scene",
    body:
      "Move through the story one scene at a time with the chapter and scene structure beside your draft.",
    Icon: BookOpenText,
    accentColor: "var(--color-brand-soft)",
  },
  {
    title: "Keep the draft with the scene",
    body:
      "Reorder the story and the writing stays attached to the scene it belongs to.",
    Icon: Link2,
    accentColor: "var(--color-accent-interactive)",
  },
  {
    title: "Keep building while you write",
    body:
      "Add or assign scenes and create the next chapter without leaving the writing workspace.",
    Icon: ListPlus,
    accentColor: "var(--color-brand-soft)",
  },
];

export function HomeSceneWriterSection() {
  return (
    <section
      className="home-scene-writer"
      aria-labelledby="home-scene-writer-title"
    >
      <div className="site-container-wide home-scene-writer__inner">
        <div className="home-scene-writer__visual">
          <div className="home-scene-writer__frame-shell">
            <ScreenshotFrame
              src="/assets/screenshots/home/scene-writer.png"
              alt="Spinalith Scene Writer showing chapter and scene navigation beside a scene draft editor."
              variant="originalHeroFlat"
              className="home-scene-writer__frame"
            />
          </div>

          <p className="home-scene-writer__proof-line">
            <Sparkles aria-hidden="true" />
            <span>
              Plan the story. Write the scene. <strong>Keep them connected.</strong>
            </span>
          </p>
        </div>

        <div className="home-scene-writer__content">
          <header className="home-scene-writer__header">
            <p className="home-scene-writer__kicker">Scene Writer</p>

            <h2
              id="home-scene-writer-title"
              className="home-scene-writer__title"
            >
              <span>Plan the scene.</span>
              <span className="home-scene-writer__title-accent">
                Then write it.
              </span>
            </h2>

            <p className="home-scene-writer__lede">
              Your story plan does not have to live in one place while the actual
              writing lives somewhere else. Open a scene, draft it where it belongs,
              and keep the writing tied to the same story structure you are already
              building.
            </p>
          </header>

          <div
            className="home-scene-writer__benefits"
            aria-label="Scene Writer benefits"
          >
            {sceneWriterBenefits.map(
              ({ title, body, Icon, accentColor }) => (
                <SiteBenefitItem
                  key={title}
                  title={title}
                  body={body}
                  Icon={Icon}
                  accentColor={accentColor}
                  variant="row"
                  tone="plain"
                  align="left"
                  size="md"
                  iconShape="rounded"
                  className="home-scene-writer__benefit"
                />
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeSceneWriterSection;
