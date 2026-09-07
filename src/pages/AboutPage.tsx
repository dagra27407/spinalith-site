// src/pages/AboutPage.tsx

/**
 * File: src/pages/AboutPage.tsx
 *
 * Purpose:
 * Public Spinalith About page explaining the product philosophy,
 * the problem Spinalith exists to solve, and the principles behind
 * the connected story-planning workspace.
 *
 * Responsibilities:
 * - Explain why Spinalith exists without repeating the Homepage or Features page.
 * - Communicate the core belief that stories are connected systems of information.
 * - Reinforce writer control, context, and flexible planning.
 * - Provide a simple next step for visitors who want to explore the product.
 *
 * Notes:
 * - This page is intentionally compact and editorial rather than feature-heavy.
 * - Shared site layout, typography, buttons, and color tokens come from the
 *   global site styles.
 * - Page-specific styling lives in src/styles/page/about/aboutPage.css.
 */

import { ArrowRight, Link2, Search, Waypoints } from "lucide-react";

import "../styles/page/about/aboutPage.css";

import { COMMON_LINKS } from "@/routes/CommonLinks";

const beliefs = [
  {
    title: "Context matters as much as information.",
    description:
      "Knowing a detail is useful. Knowing where it matters in the story is better.",
    Icon: Link2,
  },
  {
    title: "See the whole. Inspect the parts.",
    description:
      "Move between the big picture and the character, scene, relationship, or detail that needs your attention.",
    Icon: Search,
  },
  {
    title: "Structure should serve the story.",
    description:
      "Frameworks, timelines, boards, and plans are tools—not rules. Use what helps and change what does not.",
    Icon: Waypoints,
  },
];

export function AboutPage() {
  return (
    <main className="about-page">
      <section
        className="about-hero"
        aria-labelledby="about-hero-title"
      >
        <div className="site-container-narrow">
          <span className="eyebrow">About Spinalith</span>

          <h1 id="about-hero-title" className="about-hero__title">
            A story is more than
            <span className="about-hero__title-accent">
              {" "}
              a stack of notes.
            </span>
          </h1>

          <p className="about-hero__lede">
            A character belongs to scenes. A scene moves an arc. An event sits
            in a timeline. A location carries history. Change one thing, and
            something somewhere else may need to change with it.
          </p>

          <p className="about-hero__statement">
            Your story is connected.
            <span>Your planning should be too.</span>
          </p>
        </div>
      </section>

      <section
        className="about-story site-section-divider"
        aria-labelledby="about-story-title"
      >
        <div className="site-container-narrow about-story__layout">
          <div>
            <p className="section-kicker">Why Spinalith exists</p>

            <h2 id="about-story-title" className="about-story__title">
              The hard part is not finding somewhere to put the information.
            </h2>
          </div>

          <div className="about-story__copy">
            <p>
              Writers already have plenty of places to keep notes. The harder
              problem is keeping those notes useful once the story becomes
              complicated.
            </p>

            <p>
              Characters end up in one document. Timelines live somewhere
              else. Lore, locations, scenes, ideas, and revisions collect
              across notebooks, spreadsheets, apps, and memory. Eventually,
              understanding the story means searching through several places
              and trying to remember how everything fits together.
            </p>

            <p>
              Spinalith was built to bring those pieces into one connected
              workspace, so you can see both the details and the story they
              belong to.
            </p>

            <p className="about-story__belief">
              The way you organize a story should reflect the way the story
              actually works.
            </p>
          </div>
        </div>
      </section>

      <section
        className="about-beliefs site-section-divider"
        aria-labelledby="about-beliefs-title"
      >
        <div className="site-container">
          <div className="about-beliefs__header">
            <p className="section-kicker">What we believe</p>

            <h2 id="about-beliefs-title">
              Planning should make the story clearer.
            </h2>
          </div>

          <div className="about-beliefs__grid">
            {beliefs.map(({ title, description, Icon }) => (
              <article key={title} className="about-beliefs__card">
                <span className="about-beliefs__icon" aria-hidden="true">
                  <Icon />
                </span>

                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="about-cta site-section-divider"
        aria-labelledby="about-cta-title"
      >
        <div className="site-container-narrow">
          <div className="about-cta__panel">
            <p className="section-kicker">See it in practice</p>

            <h2 id="about-cta-title">
              Build the story as one connected whole.
            </h2>

            <p>
              See how Spinalith brings characters, structure, worldbuilding,
              timelines, chapters, and notes into one workspace.
            </p>

            <div className="about-cta__actions">
              <a
                className="site-button site-button-primary site-button-lg"
                href={COMMON_LINKS.site.features}
              >
                Explore Spinalith
                <ArrowRight aria-hidden="true" />
              </a>

              <a
                className="site-button site-button-secondary site-button-lg"
                href={COMMON_LINKS.app.startMembership}
              >
                Start My 14-Day Trial
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}