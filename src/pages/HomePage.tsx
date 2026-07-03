// src/pages/HomePage.tsx

/**
 * File: src/pages/HomePage.tsx
 *
 * Purpose:
 * Page-level orchestrator for the Spinalith.com homepage.
 *
 * Responsibilities:
 * - Composes homepage sections in launch order.
 * - Keeps page flow readable without embedding section implementation details.
 * - Provides the main public landing page for Spinalith.com.
 *
 * Notes:
 * - Homepage section content should live in src/components/home/.
 * - Homepage section styling should live in src/styles/page/home/.
 * - Shared site components should live in src/components/site/.
 */

import { HomeHeroSection } from "../components/home/HomeHeroSection";
import { HomeProblemSection } from "../components/home/HomeProblemSection";

export function HomePage() {
  return (
    <>
      <HomeHeroSection />
      <HomeProblemSection />
    </>
  );
}