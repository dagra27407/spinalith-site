// src/components/site/SiteFooter.tsx

/**
 * File: src/components/site/SiteFooter.tsx
 *
 * Purpose:
 * Shared public website footer for Spinalith.com.
 *
 * Responsibilities:
 * - Provides brand positioning at the bottom of public pages.
 * - Provides core public-site navigation links.
 * - Links to legal pages and app destinations.
 *
 * Notes:
 * - This footer is for the public marketing/content site.
 * - Public-site routing is handled by Vike.
 * - Internal public-site links use standard anchors.
 */

import { COMMON_LINKS } from "@/routes/CommonLinks";

const currentYear = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="site-section site-section-tight site-section-divider">
      <div className="site-container">
        <div className="site-card site-card-pad">
          <div className="grid grid-3">
            <div className="stack">
              <a href="/" className="site-logo" aria-label="Spinalith home">
                <span className="site-logo-mark" aria-hidden="true">
                  S
                </span>
                <span>Spinalith</span>
              </a>

              <p className="text-muted">
                A story development workspace for writers planning ahead or
                organizing the story as it grows.
              </p>
            </div>

            <div className="stack">
              <h3>Product</h3>
              <a href={COMMON_LINKS.site.features}>Features</a>
              <a href={COMMON_LINKS.site.pricing}>Pricing</a>
              <a href={COMMON_LINKS.app.login}>Sign In</a>
            </div>

            <div className="stack">
              <h3>Company</h3>
              <a href={COMMON_LINKS.site.about}>About</a>
              <a href={COMMON_LINKS.site.contact}>Contact</a>
              <a href={COMMON_LINKS.site.privacy}>Privacy</a>
              <a href={COMMON_LINKS.site.terms}>Terms</a>
            </div>
          </div>

          <div
            className="cluster"
            style={{
              justifyContent: "space-between",
              marginTop: "2rem",
              paddingTop: "1.25rem",
              borderTop: "1px solid var(--color-border-soft)",
            }}
          >
            <p className="text-soft" style={{ marginBottom: 0 }}>
              © {currentYear} Spinalith. All rights reserved.
            </p>

            <p className="text-soft" style={{ marginBottom: 0 }}>
              Built for writers planning stories, worlds, and reader journeys.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}