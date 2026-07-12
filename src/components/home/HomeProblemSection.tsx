// src/components/home/HomeProblemSection.tsx

/**
 * File: src/components/home/HomeProblemSection.tsx
 *
 * Purpose:
 * Homepage problem band for Spinalith.com.
 *
 * Responsibilities:
 * - Name the core planning problem writers experience as stories grow.
 * - Use an atmospheric writing-desk image to create a distinct visual section.
 * - Present recognizable first-person writer pain points.
 * - Use SiteQuoteCard for the reusable quote-card visual treatment.
 * - Bridge the problem into Spinalith's connected planning solution.
 *
 * Notes:
 * - Full desktop uses a side-by-side image and content composition.
 * - Tablet places the image above the content while preserving the 2-by-2 card grid.
 * - Mobile changes the quote-card grid to one contained column.
 * - Product screenshots should remain in later solution and workflow sections.
 * - Supporting image lives in public/assets/images/home/.
 * - SiteQuoteCard owns quote-card internals and visual styling.
 * - Section layout styling lives in src/styles/page/home/homeProblem.css.
 */

import SiteQuoteCard from "../site/SiteQuoteCard";

import "../../styles/page/home/homeProblem.css";

type ProblemQuote = {
  quote: string;
  body: string;
};

const problemQuotes: ProblemQuote[] = [
  {
    quote: "I know I wrote that down somewhere.",
    body:
      "Important details end up spread across files, notebooks, and memory.",
  },
  {
    quote: "I changed one thing, and now the rest doesn’t line up.",
    body:
      "Move one scene or change one character choice, and later parts of the story can stop lining up.",
  },
  {
    quote: "I know something is wrong with the story, but I can’t see it.",
    body:
      "Plot holes, dropped threads, and weak arcs hide when you only see one piece at a time.",
  },
  {
    quote: "I’m spending more time searching than writing.",
    body:
      "Planning turns into checking old notes instead of moving the story forward.",
  },
];

export function HomeProblemSection() {
  return (
    <section className="home-problem" aria-labelledby="home-problem-title">
      <div className="home-problem__band">
        <div className="site-container-display home-problem__band-inner">
          <div className="home-problem__media" aria-hidden="true">
            <img
              src="/assets/images/home/writing-clutter-desk.png"
              alt=""
              loading="lazy"
              decoding="async"
            />
          </div>

          <div className="home-problem__content">
            <div className="home-problem__content-inner">
              <header className="home-problem__header">
                <p className="home-problem__kicker">
                  Where Writers Get Stuck
                </p>

                <h2 id="home-problem-title" className="home-problem__title">
                  <span className="home-problem__title-line">
                    The story is in your head.
                  </span>

                  <span className="home-problem__title-line">
                    Keeping it all straight is{" "}
                    <strong className="home-problem__title-accent">
                      the hard part.
                    </strong>
                  </span>
                </h2>

                <p className="home-problem__lede">
                  When a story lives across notes, drafts, and memory, even good
                  ideas can start to feel harder to hold together.
                </p>
              </header>

              <div
                className="home-problem__cards"
                aria-label="Common story-planning frustrations"
              >
                {problemQuotes.map(({ quote, body }) => (
                  <SiteQuoteCard
                    key={quote}
                    quote={quote}
                    body={body}
                    accentColor="var(--color-brand-soft)"
                    density="default"
                    accentPosition="bottom-left"
                    heightMode="equal"
                    className="home-problem__card"
                  />
                ))}
              </div>

              <p className="home-problem__bridge">
                The story is still there. You just need a better way to hold it
                together.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeProblemSection;