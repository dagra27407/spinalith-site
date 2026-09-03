// src/components/features/FeaturesExportSection.tsx

/**
 * File: src/components/features/FeaturesExportSection.tsx
 *
 * Purpose:
 * Export section for the Spinalith Features page.
 *
 * Responsibilities:
 * - Explains how writers can take their story data outside Spinalith.
 * - Highlights PDF, Excel, and CSV export options.
 * - Reinforces that a writer's work is portable and not locked inside the application.
 * - Provides a compact visual break before the final Connected Workflow section.
 *
 * Notes:
 * - This section intentionally uses a tighter horizontal composition.
 * - PDF messaging includes the print-ready use case.
 * - Excel and CSV are grouped together as structured-data export options.
 * - Shared feature cards live in src/components/site/SiteFeatureCard.tsx.
 * - Section-specific styling lives in:
 *   src/styles/page/features/featuresExport.css.
 */

import {
  FileDown,
  ShieldCheck,
  Table2,
} from "lucide-react";

import SiteFeatureCard from "../site/SiteFeatureCard";

const exportFeatures = [
  {
    title: "PDF export",
    body: "Create a clean, print-ready copy of your story for review, reference, or keeping beside you while you write.",
    Icon: FileDown,
  },
  {
    title: "Excel & CSV export",
    body: "Take your structured story data into spreadsheets or other tools whenever you want.",
    Icon: Table2,
  },
  {
    title: "Your work stays yours",
    body: "Keep independent copies of your story data so it is never locked inside Spinalith.",
    Icon: ShieldCheck,
  },
];

export function FeaturesExportSection() {
  return (
    <section
      className="features-export"
      aria-labelledby="features-export-title"
    >
      <div className="site-container features-export__inner">
        <div className="features-export__copy">
          <span className="features-export__kicker">
            Export
          </span>

          <h2
            id="features-export-title"
            className="features-export__title"
          >
            Take your story with you.
          </h2>

          <p className="features-export__lede">
            Export your story data to PDF, Excel, or CSV whenever you want.
            Print it, work with it in a spreadsheet, move it into another tool,
            or keep your own copy. Your work is yours, and it does not have to
            stay locked inside Spinalith.
          </p>

          <p className="features-export__takeaway">
            Your story belongs to you, not the software.
          </p>
        </div>

        <div
          className="features-export__cards"
          aria-label="Export options"
        >
          {exportFeatures.map(({ title, body, Icon }) => (
            <SiteFeatureCard
              key={title}
              title={title}
              body={body}
              Icon={Icon}
              variant="compact"
              className="features-export__card"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesExportSection;