// src/components/marketing/SiteHeader.tsx

/**
 * File: src/components/marketing/SiteHeader.tsx
 *
 * Purpose:
 * Shared public website header/navigation for Spinalith.com.
 *
 * Responsibilities:
 * - Displays the Spinalith brand mark/name.
 * - Provides public-site navigation links.
 * - Provides primary calls to action for the marketing site.
 *
 * Notes:
 * - This is public website navigation, not Spinalith app navigation.
 * - Keep nav labels focused on launch-site pages and visitor needs.
 * - Legal/static pages may remain in /public until migrated into React routes.
 */

import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Features", to: "/features" },
  { label: "Pricing", to: "/pricing" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-container site-header__inner">
        <NavLink to="/" className="site-logo" aria-label="Spinalith home">
          <span className="site-logo-mark" aria-hidden="true">
            S
          </span>
          <span>Spinalith</span>
        </NavLink>

        <nav className="site-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to}>
            {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="site-header__actions">
          <a
            className="site-button site-button-secondary site-button-sm"
            href="https://app.spinalith.com"
          >
            Sign In
          </a>

          <a
            className="site-button site-button-primary site-button-sm"
            href="https://app.spinalith.com"
          >
            Start Your Membership
          </a>
        </div>
      </div>
    </header>
  );
}