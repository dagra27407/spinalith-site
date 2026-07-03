// src/layouts/MarketingLayout.tsx

/**
 * File: src/layouts/MarketingLayout.tsx
 *
 * Purpose:
 * Shared public-site layout shell for Spinalith.com.
 *
 * Responsibilities:
 * - Wraps public website pages with the shared header and footer.
 * - Provides the main site shell and main content region.
 * - Keeps route pages focused on page content instead of global chrome.
 *
 * Notes:
 * - This layout is for the public marketing/content site, not the Spinalith app workspace.
 * - Page routing is handled by src/routes/PublicRouter.tsx.
 * - Shared navigation/footer components live in src/components/marketing/.
 */

import { Outlet } from "react-router-dom";

import { SiteFooter } from "../components/site/SiteFooter";
import { SiteHeader } from "../components/site/SiteHeader";

export function MarketingLayout() {
  return (
    <div className="site-shell">
      <SiteHeader />

      <main className="site-main">
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  );
}