// src/components/features/FeaturesNarrativeDNASection.tsx

/**
 * File: src/components/features/FeaturesNarrativeDNASection.tsx
 *
 * Purpose:
 * Narrative DNA section for the Spinalith Features page.
 *
 * Responsibilities:
 * - Explains how story details stay organized and connected across Spinalith.
 * - Highlights the core Narrative DNA entity types and discovery tools.
 * - Reinforces that changes made in one place remain connected across the story workspace.
 * - Presents the Narrative DNA demonstration using the shared VideoFrame component.
 *
 * Notes:
 * - This section reuses the shared Features page copy + media layout.
 * - The reversed modifier places media on the left and copy on the right on desktop.
 * - Shared video framing lives in src/components/site/VideoFrame.tsx.
 * - Shared Features page layout styling lives in:
 *   src/styles/page/features/featuresPage.css.
 */

import {
  Image,
  MapPin,
  Network,
  Search,
  ScrollText,
  Users,
} from "lucide-react";

import { VideoFrame } from "../site/VideoFrame";

const FEATURE_PLACEHOLDER_VIDEO =
  "/assets/videos/features/spinalith-feature-placeholder-8s.MP4";

const narrativeDNAFeatures = [
  {
    label: "Characters",
    Icon: Users,
  },
  {
    label: "Relationships",
    Icon: Network,
  },
  {
    label: "Locations",
    Icon: MapPin,
  },
  {
    label: "Lore",
    Icon: ScrollText,
  },
  {
    label: "Images",
    Icon: Image,
  },
  {
    label: "Search",
    Icon: Search,
  },
];

export function FeaturesNarrativeDNASection() {
  return (
    <section className="features-detail-section features-detail-section--reverse">
      <div className="site-container features-detail-section__inner">
        <div className="features-detail-section__copy">
          <span className="features-detail-section__kicker">
            Narrative DNA
          </span>

          <h2 className="features-detail-section__title">
            Every story detail has a home.
          </h2>

          <p className="features-detail-section__lede">
            Change a character, location, relationship, or piece of lore once, 
            and that information stays connected wherever it appears across your story.
          </p>

          <div
            className="features-detail-section__feature-list"
            aria-label="Narrative DNA features"
          >
            {narrativeDNAFeatures.map(({ label, Icon }) => (
              <div
                className="features-detail-section__feature-chip"
                key={label}
              >
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </div>
            ))}
          </div>

          <p className="features-detail-section__takeaway">
            Edit once. See it everywhere.
          </p>
        </div>

        <div className="features-detail-section__media">
          <VideoFrame
            src={FEATURE_PLACEHOLDER_VIDEO}
            ariaLabel="Spinalith Narrative DNA feature demonstration"
            variant="productGlow"
          />
        </div>
      </div>
    </section>
  );
}