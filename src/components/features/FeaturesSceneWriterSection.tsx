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
 * - Explains how reorganizing scenes keeps the draft manuscript aligned with story structure.
 * - Shows that chapters and scenes can continue to grow while the writer is drafting.
 * - Presents the Scene Writer feature demonstration using the shared VideoFrame component.
 *
 * Notes:
 * - The top row uses a video-left + copy-right composition to vary the Features-page rhythm.
 * - The second row contains six detailed Scene Writer callouts in two columns.
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

const SCENE_WRITER_VIDEO =
  "/assets/videos/features/features_SceneWriter.mp4";

const sceneWriterCallouts = [
  {
    title: "Write inside the story workspace",
    description:
      "Draft the scene in Spinalith instead of sending the actual writing to a separate tool while the rest of the story stays behind.",
    Icon: FilePenLine,
  },
  {
    title: "Open the scene you already planned",
    description:
      "Move from your chapter structure into the scene itself and start drafting with the surrounding story still close at hand.",
    Icon: Rows3,
  },
  {
    title: "Reorganize without losing sync",
    description:
      "Change the scene order or move a scene to another chapter, and Spinalith keeps the draft manuscript aligned with the updated story structure.",
    Icon: Link2,
  },
  {
    title: "Follow the story when it changes",
    description:
      "Create a new scene or pull an unassigned scene into the chapter when the draft takes you somewhere you did not plan.",
    Icon: ListPlus,
  },
  {
    title: "Keep building while you write",
    description:
      "Add the next chapter from Scene Writer and keep moving when the story grows beyond the structure you started with.",
    Icon: BookOpenText,
  },
  {
    title: "Move through the draft scene by scene",
    description:
      "Use the chapter and scene list beside the editor to move through the manuscript without losing where each piece belongs.",
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
              src={SCENE_WRITER_VIDEO}
              ariaLabel="Spinalith Scene Writer feature demonstration"
              ariaDescription="Demonstration: Scene Writer is open with the chapter and scene list visible beside the editor. A scene is selected and writing is added directly in the scene draft, showing that prose can be written inside the same connected story workspace."
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
              Planning and drafting do not have to happen in separate tools. Whether
              you mapped the scene weeks ago or discovered it five minutes ago, open
              it where it belongs and write inside the same story you are already
              building. Scene Writer keeps the draft connected to the chapters and
              structure around it as the story changes.
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
