// src/pages/PrivacyPage.tsx

/**
 * File: src/pages/PrivacyPage.tsx
 *
 * Purpose:
 * Public website Privacy page for Spinalith.com.
 *
 * Responsibilities:
 * - Keeps the /privacy route inside the React website system.
 * - Provides a styled placeholder for the privacy policy content.
 * - Gives us a migration target for the existing public/privacy.html content.
 *
 * Notes:
 * - This is a structural migration page, not a legal rewrite.
 * - Final legal wording should be copied from the existing privacy.html file
 *   or reviewed intentionally before launch.
 * - The old static /privacy.html file may remain temporarily for legacy links.
 */

import { COMMON_LINKS } from "@/routes/CommonLinks";

export function PrivacyPage() {
  return (
    <section className="site-section">
      <div className="site-container-narrow">
        <span className="eyebrow">Privacy</span>

        <h1>Privacy Policy</h1>

        <p className="section-lede">
          This page is part of the new Spinalith.com React page system. The
          final privacy policy content should be migrated from the existing
          static privacy page or reviewed before launch.
        </p>

        <div className="site-card site-card-pad stack-lg" style={{ marginTop: "2rem" }}>
          <section>
            <h2>Privacy policy content pending migration</h2>

            <p>
              The previous website used a static privacy page at{" "}
              <code>/privacy.html</code>. During the website rebuild, this page
              becomes the routed React destination for the public privacy policy.
            </p>

            <p>
              Before launch, replace this placeholder with the approved privacy
              policy text. Avoid changing legal wording casually during styling
              or layout work.
            </p>
          </section>

          <section>
            <h3>Temporary legacy link</h3>

            <p className="text-muted">
              Until the final policy is migrated, the old static privacy page may
              still be available here:
            </p>

            <a className="site-button site-button-secondary" href={COMMON_LINKS.site.privacy}>
              View legacy privacy page
            </a>
          </section>
        </div>
      </div>
    </section>
  );
}