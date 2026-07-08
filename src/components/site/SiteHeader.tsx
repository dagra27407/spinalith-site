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

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom";

import { COMMON_LINKS } from "@/routes/CommonLinks";

const navItems = [
  { label: "Home", to: COMMON_LINKS.site.home, end: true },
  { label: "Features", to: COMMON_LINKS.site.features },
  { label: "Pricing", to: COMMON_LINKS.site.pricing },
  { label: "About", to: COMMON_LINKS.site.about },
  { label: "Contact", to: COMMON_LINKS.site.contact },
];

export function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="site-header">
      <div className="site-container site-header__inner">
        <NavLink
          to={COMMON_LINKS.site.home}
          className="site-logo"
          aria-label="Spinalith home"
          onClick={closeMobileMenu}
        >
          <span className="site-logo-mark" aria-hidden="true">
            S
          </span>
          <span>Spinalith</span>
        </NavLink>

        <nav className="site-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="site-header__actions">
          <a
            className="site-button site-button-secondary site-button-sm"
            href={COMMON_LINKS.app.login}
          >
            Sign In
          </a>

          <a
            className="site-button site-button-primary site-button-sm"
            href={COMMON_LINKS.app.startMembership}
          >
            Start Your Membership
          </a>

          <button
            type="button"
            className="site-mobile-menu-button"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="site-mobile-menu"
            onClick={() => setIsMobileMenuOpen((current) => !current)}
          >
            {isMobileMenuOpen ? (
              <X size={18} aria-hidden="true" />
            ) : (
              <Menu size={18} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <nav
          id="site-mobile-menu"
          className="site-mobile-menu"
          aria-label="Mobile navigation"
        >
          <div className="site-container site-mobile-menu__inner">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={closeMobileMenu}
              >
                {item.label}
              </NavLink>
            ))}

            <a
              className="site-mobile-menu__signin"
              href={COMMON_LINKS.app.login}
              onClick={closeMobileMenu}
            >
              Sign In
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}