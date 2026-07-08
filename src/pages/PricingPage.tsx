// src/pages/PricingPage.tsx

/**
 * File: src/pages/PricingPage.tsx
 *
 * Purpose:
 * Public pricing page for Spinalith.com.
 *
 * Responsibilities:
 * - Reuse the shared membership/pricing section from the homepage.
 * - Keep pricing content centralized so homepage and pricing route stay consistent.
 *
 * Notes:
 * - Plan selection happens inside the app after account creation.
 */

import HomeMembershipSection from "../components/home/HomeMembershipSection";

export function PricingPage() {
  return <HomeMembershipSection />;
}

export default PricingPage;