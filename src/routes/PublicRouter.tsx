// src/routes/PublicRouter.tsx

/**
 * File: src/routes/PublicRouter.tsx
 *
 * Purpose:
 * Defines the public-facing route map for Spinalith.com.
 *
 * Responsibilities:
 * - Owns top-level website routes.
 * - Wraps public pages in the shared marketing layout.
 * - Keeps route definitions centralized and easy to scan.
 *
 * Notes:
 * - This is the public website router, not the Spinalith app router.
 * - Legal pages may still live as static files in /public until migrated.
 */

import { BrowserRouter, Route, Routes } from "react-router-dom";

import { MarketingLayout } from "../layouts/MarketingLayout";
import { AboutPage } from "../pages/AboutPage";
import { ContactPage } from "../pages/ContactPage";
import { FeaturesPage } from "../pages/FeaturesPage";
import { HomePage } from "../pages/HomePage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { PricingPage } from "../pages/PricingPage";
import { PrivacyPage } from "../pages/PrivacyPage";
import { TermsPage } from "../pages/TermsPage";

export function PublicRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MarketingLayout />}>
          <Route index element={<HomePage />} />
          <Route path="features" element={<FeaturesPage />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}