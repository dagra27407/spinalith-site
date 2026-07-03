// src/components/home/HomeProblemSection.tsx

/**
 * File: src/components/home/HomeProblemSection.tsx
 *
 * Purpose:
 * Homepage problem band for Spinalith.com.
 *
 * Responsibilities:
 * - Names the core planning problem writers experience as stories grow.
 * - Uses an atmospheric writing-desk image to create visual section identity.
 * - Presents three recognizable pain points before introducing Spinalith as the connected solution.
 * - Creates a full-width visual break between the hero and the next contained product section.
 *
 * Notes:
 * - This section is intentionally a compact full-width band, not a second hero.
 * - Product screenshots should appear in later solution/product sections.
 * - Supporting visual image lives in public/assets/images/home/.
 * - Styling lives in src/styles/page/home/homeProblem.css.
 */

const problemCards = [
  {
    number: "01",
    title: "Details drift apart",
    iconLabel: "Scattered notes icon",
    icon: (
      <svg
        aria-hidden="true"
        viewBox="0 0 32 32"
        className="home-problem-card__icon-svg"
      >
        <path d="M9 7.5h11.5L25 12v14.5H9z" />
        <path d="M20.5 7.5V12H25" />
        <path d="M7 11.5H5.5v15h14V25" />
        <path d="M13 16h8" />
        <path d="M13 20h8" />
      </svg>
    ),
    body:
      "Characters, locations, arcs, and worldbuilding end up scattered across notes, drafts, and memory.",
  },
  {
    number: "02",
    title: "The shape gets harder to see",
    iconLabel: "Story structure icon",
    icon: (
      <svg
        aria-hidden="true"
        viewBox="0 0 32 32"
        className="home-problem-card__icon-svg"
      >
        <path d="M16 5.5v6" />
        <path d="M16 18.5v3" />
        <path d="M9 24.5v-4.5h14v4.5" />
        <rect x="12.5" y="11.5" width="7" height="7" rx="1.5" />
        <rect x="4.5" y="24.5" width="7" height="5" rx="1.3" />
        <rect x="20.5" y="24.5" width="7" height="5" rx="1.3" />
      </svg>
    ),
    body:
      "Chapters multiply. Threads overlap. The reader journey gets harder to hold in your head.",
  },
  {
    number: "03",
    title: "Momentum turns into searching",
    iconLabel: "Momentum slowdown icon",
    icon: (
      <svg
        aria-hidden="true"
        viewBox="0 0 32 32"
        className="home-problem-card__icon-svg"
      >
        <path d="M16 5.5a10.5 10.5 0 1 1-9.1 5.25" />
        <path d="M16 10v7l4.5 3" />
        <path d="M5.5 7.5h5v5" />
        <path d="M4 18h2" />
        <path d="M7 24.5l1.4-1.4" />
        <path d="M24.5 24.5l-1.4-1.4" />
      </svg>
    ),
    body:
      "Planning starts to feel like finding, checking, second-guessing, and rebuilding what you already knew.",
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
              <div className="home-problem__header">
                <p className="home-problem__kicker">
                  Writing gets complicated
                </p>

                <h2 id="home-problem-title" className="home-problem__title">
                  Stories outgrow scattered notes.
                </h2>

                <p className="home-problem__lede">
                    A story rarely grows in a straight line. Chapters multiply, characters change
                    , relationships evolve, and the details spread across notes, documents, and memory.
                </p>
              </div>

              <div
                className="home-problem__cards"
                aria-label="Common story planning problems"
              >
                {problemCards.map((card) => (
                  <article className="home-problem-card" key={card.number}>
                    <div className="home-problem-card__header">
                      <span className="home-problem-card__number">
                        {card.number}
                      </span>

                      <span
                        className="home-problem-card__icon"
                        aria-label={card.iconLabel}
                      >
                        {card.icon}
                      </span>
                    </div>

                    <div className="home-problem-card__copy">
                      <h3>{card.title}</h3>
                      <p>{card.body}</p>
                    </div>
                  </article>
                ))}
              </div>

              <p className="home-problem__bridge">
                <span>The story is good. There is just too much in the way to see it.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}