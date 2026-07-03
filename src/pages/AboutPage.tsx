// src/pages/AboutPage.tsx

/**
 * File: src/pages/AboutPage.tsx
 *
 * Purpose:
 * Placeholder route page for the future Spinalith.com About page.
 *
 * Responsibilities:
 * - Keeps the /about route compilable during the website rebuild.
 * - Provides a temporary surface for future company/founder/story positioning.
 *
 * Notes:
 * - Final copy should explain why Spinalith exists and who it is built for.
 */

export function AboutPage() {
  return (
    <section className="site-section">
      <div className="site-container-narrow">
        <span className="eyebrow">About Spinalith</span>

        <h1>About page placeholder</h1>

        <p className="section-lede">
          This route is wired. The final page will explain the product mission:
          helping writers organize, understand, and develop complex stories
          before drafting.
        </p>
      </div>
    </section>
  );
}