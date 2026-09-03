// src/pages/FeaturesPage.tsx

/**
 * File: src/pages/FeaturesPage.tsx
 *
 * Purpose:
 * Composes the public Spinalith Features page from independent feature sections.
 *
 * Responsibilities:
 * - Defines the order of sections on the Features page.
 * - Keeps page assembly simple and easy to scan.
 * - Lets individual sections be moved, removed, or redesigned independently.
 *
 * Notes:
 * - Section-specific markup belongs in src/components/features/.
 * - Section-specific styling belongs in src/styles/page/features/.
 * - Keep this file intentionally simple. Its main job is section order.
 * - Add new feature sections here only after their component is created and tested.
 */

import { FeaturesHeroSection } from "../components/features/FeaturesHeroSection";
import { FeaturesVisualPlanningSection } from "../components/features/FeaturesVisualPlanningSection";
import { FeaturesNarrativeDNASection } from "../components/features/FeaturesNarrativeDNASection";
import { FeaturesChapterPlannerSection } from "../components/features/FeaturesChapterPlannerSection";
import { FeaturesTemplatesSection } from "../components/features/FeaturesTemplatesSection";
import { FeaturesExportSection } from "../components/features/FeaturesExportSection";
import { FeaturesConnectedWorkflowSection } from "../components/features/FeaturesConnectedWorkflowSection";

export function FeaturesPage() {
  return (
    <>
      <FeaturesHeroSection />
      <FeaturesVisualPlanningSection />
      <FeaturesNarrativeDNASection />
      <FeaturesChapterPlannerSection />
      <FeaturesTemplatesSection />
      <FeaturesExportSection />
      <FeaturesConnectedWorkflowSection />
    </>
  );
}