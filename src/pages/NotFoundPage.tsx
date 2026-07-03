// src/pages/NotFoundPage.tsx

/**
 * File: src/pages/NotFoundPage.tsx
 *
 * Purpose:
 * Public website fallback page for unknown Spinalith.com routes.
 *
 * Responsibilities:
 * - Catches unmatched public routes.
 * - Gives visitors a clear path back to the homepage.
 *
 * Notes:
 * - This is a lightweight marketing-site 404, not an app error boundary.
 */

import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="site-section">
      <div className="site-container-narrow text-center">
        <span className="eyebrow">Page not found</span>

        <h1>This page does not exist.</h1>

        <p className="section-lede">
          The page you are looking for may have moved, or it may not be part of
          the public Spinalith.com site yet.
        </p>

        <div className="cluster cluster-center" style={{ marginTop: "2rem" }}>
          <Link className="site-button site-button-primary" to="/">
            Back to Home
          </Link>

          <Link className="site-button site-button-secondary" to="/features">
            View Features
          </Link>
        </div>
      </div>
    </section>
  );
}