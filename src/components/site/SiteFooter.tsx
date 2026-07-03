// src/components/marketing/SiteFooter.tsx

/**
 * File: src/components/marketing/SiteFooter.tsx
 *
 * Purpose:
 * Shared public website footer for Spinalith.com.
 *
 * Responsibilities:
 * - Provides brand positioning at the bottom of public pages.
 * - Provides core public-site navigation links.
 * - Links to legal/static pages that currently live in /public.
 *
 * Notes:
 * - This footer is for the public marketing/content site.
 * - Privacy and Terms currently resolve as static public files.
 * - If legal pages are later migrated to React routes, update those links here.
 */

import { Link } from "react-router-dom";

const currentYear = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="site-section site-section-tight site-section-divider">
      <div className="site-container">
        <div className="site-card site-card-pad">
          <div className="grid grid-3">
            <div className="stack">
              <Link to="/" className="site-logo" aria-label="Spinalith home">
                <span className="site-logo-mark" aria-hidden="true">
                  S
                </span>
                <span>Spinalith</span>
              </Link>

              <p className="text-muted">
                A story development workspace for writers building the story
                before they write the draft.
              </p>
            </div>

            <div className="stack">
              <h3>Product</h3>
              <Link to="/features">Features</Link>
              <Link to="/pricing">Pricing</Link>
              <a href="https://app.spinalith.com">Sign In</a>
            </div>

            <div className="stack">
              <h3>Company</h3>
              <Link to="/about">About</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/privacy">Privacy</Link>
              <Link to="/terms">Terms</Link>
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