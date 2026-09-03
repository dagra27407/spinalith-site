// src/components/features/FeaturesConnectedWorkflowSection.tsx

/**
 * File: src/components/features/FeaturesConnectedWorkflowSection.tsx
 *
 * Purpose:
 * Final connected-workflow section for the Spinalith Features page.
 *
 * Responsibilities:
 * - Brings the major Spinalith feature areas together into one clear promise.
 * - Reinforces that story information stays connected across the workspace.
 * - Highlights reduced duplicate work and a single source of truth.
 * - Provides the final membership CTA for the Features page.
 *
 * Notes:
 * - This section acts as the payoff for the feature sections above it.
 * - It should feel more atmospheric and conclusive than the compact Export section.
 * - Shared buttons, containers, typography, and design tokens remain global.
 * - Section-specific styling lives in:
 *   src/styles/page/features/featuresConnectedWorkflow.css.
 */

import {
  Link2,
  RefreshCw,
  Route,
  Waypoints,
} from "lucide-react";

import { COMMON_LINKS } from "../../routes/CommonLinks";

const workflowFeatures = [
  {
    label: "Changes carry across views",
    Icon: RefreshCw,
  },
  {
    label: "Story details stay connected",
    Icon: Link2,
  },
  {
    label: "One source of truth",
    Icon: Waypoints,
  },
  {
    label: "Less duplicate work",
    Icon: Route,
  },
];

export function FeaturesConnectedWorkflowSection() {
  return (
    <section
      className="features-connected-workflow"
      aria-labelledby="features-connected-workflow-title"
    >
      <div className="site-container features-connected-workflow__inner">
        <div className="features-connected-workflow__content">
          <span className="features-connected-workflow__kicker">
            Connected Workflow
          </span>

          <h2
            id="features-connected-workflow-title"
            className="features-connected-workflow__title"
          >
            One story.
            <span> One connected workspace.</span>
          </h2>

          <p className="features-connected-workflow__lede">
            Plan your structure, build your world, organize chapters, and keep
            everything connected as the story changes. Spinalith is designed so
            you do not have to rebuild the same information in different places.
          </p>

          <div
            className="features-connected-workflow__feature-list"
            aria-label="Connected workflow benefits"
          >
            {workflowFeatures.map(({ label, Icon }) => (
              <div
                className="features-connected-workflow__feature"
                key={label}
              >
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </div>
            ))}
          </div>

          <p className="features-connected-workflow__takeaway">
            Change it once. Keep the whole story aligned.
          </p>

          <div className="features-connected-workflow__actions">
            <a
              className="site-button site-button-primary features-connected-workflow__button"
              href={COMMON_LINKS.app.startMembership}
            >
              Start Your Membership
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeaturesConnectedWorkflowSection;