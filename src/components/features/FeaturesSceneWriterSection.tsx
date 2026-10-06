// src/components/features/FeaturesSceneWriterSection.tsx

/**
 * File: src/components/features/FeaturesSceneWriterSection.tsx
 *
 * Purpose:
 * Scene Writer section for the Spinalith Features page.
 *
 * Responsibilities:
 * - Explains how Scene Writer brings drafting into the same connected workspace as story planning.
 * - Shows that writers can move through chapters and scenes while drafting.
 * - Explains that scene drafts remain attached when the story structure changes.
 * - Shows that chapters and scenes can continue to grow while the writer is drafting.
 * - Presents a temporary feature video using the shared VideoFrame component.
 *
 * Notes:
 * - The top row uses a video-left + copy-right composition to vary the Features-page rhythm.
 * - The second row contains six detailed Scene Writer callouts in two columns.
 * - The placeholder video should be replaced with a dedicated Scene Writer demonstration later.
 * - Shared feature typography and callout base styles live in:
 *   src/styles/page/features/featuresPage.css.
 * - Scene Writer layout styling lives in:
 *   src/styles/page/features/featuresSceneWriter.css.
 * - Shared video framing lives in:
 *   src/components/site/VideoFrame.tsx.
 */

import {
  BookOpenText,
  FilePenLine,
  Link2,
  ListPlus,
  RefreshCcw,
  Rows3,
} from "lucide-react";

import { VideoFrame } from "../site/VideoFrame";

const FEATURE_PLACEHOLDER_VIDEO =
  "/assets/videos/features/spinalith-feature-placeholder-8s.MP4";

const sceneWriterCallouts = [
  {
    title: "Write inside the story workspace",
    description:
      "Draft the scene in Spinalith instead of sending the actual writing to a separate tool while the rest of the story stays behind.",
    Icon: FilePenLine,
  },
  {
    title: "Move through the story scene by scene",
    description:
      "Use the chapter and scene list beside the editor to move through the draft without losing where each piece belongs.",
    Icon: Rows3,
  },
  {
    title: "Keep the draft with the scene",
    description:
      "Reorder a scene in Chapter Planner or Timeline Planner and its writing stays attached to that scene instead of becoming another piece to reorganize.",
    Icon: Link2,
  },
  {
    title: "Add scenes while you are writing",
    description:
      "Create a new scene or pull an unassigned scene into the chapter without leaving Scene Writer when the draft takes the story somewhere new.",
    Icon: ListPlus,
  },
  {
    title: "Keep building the chapter",
    description:
      "Add the next chapter from the writing workspace and keep moving when the story grows beyond what you originally planned.",
    Icon: BookOpenText,
  },
  {
    title: "Let changes stay synchronized",
    description:
      "As chapters and scenes move elsewhere in Spinalith, Scene Writer follows the same connected structure so the draft reflects the story's current order.",
    Icon: RefreshCcw,
  },
];

function SceneWriterCallout({
  title,
  description,
  Icon,
}: (typeof sceneWriterCallouts)[number]) {
  return (
    <div className="features-detail-section__callout">
      <div className="features-detail-section__callout-icon">
        <Icon aria-hidden="true" />
      </div>

      <div className="features-detail-section__callout-copy">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export function FeaturesSceneWriterSection() {
  const leftCallouts = sceneWriterCallouts.slice(0, 3);
  const rightCallouts = sceneWriterCallouts.slice(3);

  return (
    <section className="features-detail-section features-scene-writer">
      <div className="site-container features-scene-writer__inner">
        <div className="features-scene-writer__top-row">
          <div className="features-scene-writer__media">
            <VideoFrame
              src={FEATURE_PLACEHOLDER_VIDEO}
              ariaLabel="Spinalith Scene Writer feature demonstration placeholder"
              ariaDescription="Placeholder video for the Scene Writer feature demonstration. The final demonstration will show a writer moving between chapters and scenes, drafting a scene, and keeping that draft connected as the story structure changes."
              variant="productGlow"
            />
          </div>

          <div className="features-scene-writer__intro">
            <span className="features-detail-section__kicker">
              Scene Writer
            </span>

            <h2 className="features-detail-section__title">
              Write where the story lives.
            </h2>

            <p className="features-detail-section__lede">
              Planning and drafting do not have to happen in separate tools. Open a
              scene, write it where it belongs, and keep the draft connected to the
              chapters and structure around it. Whether you planned the scene ahead
              of time or discovered it while writing, Scene Writer gives it a place
              inside the same story you are already building.
            </p>
          </div>
        </div>

        <div
          className="features-scene-writer__feature-row"
          aria-label="Scene Writer features"
        >
          <div className="features-scene-writer__callout-column">
            {leftCallouts.map((callout) => (
              <SceneWriterCallout
                key={callout.title}
                {...callout}
              />
            ))}
          </div>

          <div className="features-scene-writer__callout-column">
            {rightCallouts.map((callout) => (
              <SceneWriterCallout
                key={callout.title}
                {...callout}
              />
            ))}
          </div>
        </div>

        <p className="features-detail-section__takeaway features-scene-writer__takeaway">
          Discover it or plan it. The draft stays connected to the story.
        </p>
      </div>
    </section>
  );
}

export default FeaturesSceneWriterSection;
