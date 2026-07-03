// src/pages/TermsPage.tsx

/**
 * File: src/pages/TermsPage.tsx
 *
 * Purpose:
 * Public website Terms page for Spinalith.com.
 *
 * Responsibilities:
 * - Keeps the /terms route inside the React website system.
 * - Provides a styled placeholder for terms/legal content.
 * - Gives us a migration target for the existing public/terms.html content.
 *
 * Notes:
 * - This is a structural migration page, not a legal rewrite.
 * - Final legal wording should be copied from the existing terms.html file
 *   or reviewed intentionally before launch.
 * - The old static /terms.html file may remain temporarily for legacy links.
 */

export function TermsPage() {
  return (
    <section className="site-section">
      <div className="site-container-narrow">
        <span className="eyebrow">Terms</span>

        <h1>Terms of Service</h1>

        <p className="section-lede">
          This page is part of the new Spinalith.com React page system. The
          final terms content should be migrated from the existing static terms
          page or reviewed before launch.
        </p>

        <div className="site-card site-card-pad stack-lg" style={{ marginTop: "2rem" }}>
          <section>
            <h2>Terms content pending migration</h2>

            <p>
              The previous website used a static terms page at{" "}
              <code>/terms.html</code>. During the website rebuild, this page
              becomes the routed React destination for the public terms of
              service.
            </p>

            <p>
              Before launch, replace this placeholder with the approved terms of
              service text. Avoid changing legal wording casually during styling
              or layout work.
            </p>
          </section>

          <section>
            <h3>Temporary legacy link</h3>

            <p className="text-muted">
              Until the final terms are migrated, the old static terms page may
              still be available here:
            </p>

            <a className="site-button site-button-secondary" href="/terms.html">
              View legacy terms page
            </a>
          </section>
        </div>
      </div>
    </section>
  );
}