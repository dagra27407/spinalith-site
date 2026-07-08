// src/components/home/HomeMomentumSection.tsx

/**
 * File: src/components/home/HomeMomentumSection.tsx
 *
 * Purpose:
 * Homepage section that shows how writers can start with momentum.
 *
 * Responsibilities:
 * - Present structure templates, genre templates, demo projects, and blank-start as approachable entry points.
 * - Use SiteBenefitItem for quiet proof/support points.
 * - Use SiteGalleryCard for image-led template/demo cards.
 * - Keep the section visually open instead of boxed inside a large bordered container.
 *
 * Notes:
 * - This section follows Three Core Workflows in the homepage flow.
 * - CTA currently points to membership because there is no dedicated templates/demos page for launch.
 * - Image assets live directly under public/assets/images/home/.
 */

import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BookOpenText,
  ChessRook,
  ClipboardList,
  FileText,
  Heart,
  Map,
  PencilLine,
  ScrollText,
  Sparkles,
  UserRoundSearch,
} from "lucide-react";

import SiteBenefitItem from "../site/SiteBenefitItem";
import SiteGalleryCard from "../site/SiteGalleryCard";

import "../../styles/page/home/homeMomentum.css";

import { COMMON_LINKS } from "@/routes/CommonLinks";

type MomentumBenefit = {
  title: string;
  body: string;
  Icon: LucideIcon;
};

type MomentumGalleryItem = {
  pillText: string;
  title: string;
  summary: string;
  Icon: LucideIcon;
  metaText: string;
  imageSrc?: string;
  imageAlt?: string;
  mediaMode?: "image" | "blank";
  accentColor: string;
};

const benefits: MomentumBenefit[] = [
  {
    title: "Proven structures",
    body: "Start with familiar story frameworks used by writers for generations.",
    Icon: ChessRook,
  },
  {
    title: "Explore real projects",
    body: "Open completed demo stories to see Spinalith in action.",
    Icon: BookOpenText,
  },
  {
    title: "Yours from the start",
    body: "Every template and demo is fully editable. You stay in control of your story.",
    Icon: PencilLine,
  },
];

const galleryItems: MomentumGalleryItem[] = [
  {
    pillText: "Structure",
    title: "Three Act Structure",
    summary: "The classic setup, confrontation, and resolution framework.",
    imageSrc: "/assets/images/home/three-act-structure-dinner.png",
    imageAlt:
      "A tense dinner conversation with a central character caught between opposing voices.",
    Icon: ClipboardList,
    metaText: "3 Acts • 8 Chapters",
    accentColor: "var(--color-brand-soft)",
  },
  {
    pillText: "Structure",
    title: "Heroic Journey",
    summary: "A universal adventure structure for epic character arcs.",
    imageSrc: "/assets/images/home/heroic-journey-threshold.png",
    imageAlt:
      "A lone traveler standing before an ancient archway that opens into a misty unknown world.",
    Icon: Map,
    metaText: "12 Stages • 17 Chapters",
    accentColor: "var(--color-brand-soft)",
  },
  {
    pillText: "Structure",
    title: "Story Beat Sheet",
    summary: "A beat-by-beat roadmap to keep your story on track.",
    imageSrc: "/assets/images/home/story-beat-sheet-modern-desk.png",
    imageAlt:
      "A modern writing desk with a notebook, blank beat cards, and creative planning tools.",
    Icon: ScrollText,
    metaText: "15 Beats • 15 Chapters",
    accentColor: "var(--color-brand-soft)",
  },
  {
    pillText: "Structure",
    title: "Mystery Structure",
    summary: "Build suspense, clues, and revelations that connect.",
    imageSrc: "/assets/images/home/mystery-structure-blue-noir-street.png",
    imageAlt:
      "A noir detective silhouette walking through a rain-soaked blue city street at night.",
    Icon: UserRoundSearch,
    metaText: "4 Acts • 12 Chapters",
    accentColor: "var(--color-brand-soft)",
  },
  {
    pillText: "Genre",
    title: "Romance Structure",
    summary: "Relationship arcs, turning points, and emotional payoff.",
    imageSrc: "/assets/images/home/romance-structure-bookstore.png",
    imageAlt:
      "Two people sharing a warm moment while exchanging a book in a cozy bookstore.",
    Icon: Heart,
    metaText: "4 Acts • 10 Chapters",
    accentColor: "var(--color-brand-soft)",
  },
  {
    pillText: "Demo Project",
    title: "Jack and the Beanstalk",
    summary: "A complete demo project with characters, scenes, and world details.",
    imageSrc: "/assets/images/home/jack-and-the-beanstalk-paper-cut.png",
    imageAlt:
      "A paper-cut storybook scene of a boy climbing a giant beanstalk toward a castle in the clouds.",
    Icon: BookOpenText,
    metaText: "8 Chapters • 6 Characters",
    accentColor: "var(--color-accent-interactive)",
  },
  {
    pillText: "Demo Project",
    title: "Dead Links",
    summary:
      "A full mystery demo about secrets, a hidden ledger, and a town with two faces.",
    imageSrc: "/assets/images/home/dead-links-town-network.png",
    imageAlt:
      "An investigation wall showing small-town locations connected by glowing digital lines.",
    Icon: BookOpenText,
    metaText: "10 Chapters • 8 Characters",
    accentColor: "var(--color-accent-interactive)",
  },
  {
    pillText: "Blank",
    title: "Start from Scratch",
    summary:
      "Create a blank workspace and build your story your way from the ground up.",
    Icon: FileText,
    metaText: "Blank Workspace",
    mediaMode: "blank",
    accentColor: "var(--color-text-soft)",
  },
];

export function HomeMomentumSection() {
  return (
    <section className="home-momentum" aria-labelledby="home-momentum-title">
      <div className="site-container-wide">
        <div className="home-momentum__body">
          <div className="home-momentum__intro">
            <p className="home-momentum__kicker">Start with Momentum</p>

            <h2 id="home-momentum-title" className="home-momentum__title">
              Start with a structure, a demo, or a{" "}
              <span className="home-momentum__title-accent">blank slate.</span>
            </h2>

            <p className="home-momentum__lede">
              Choose a trusted story shape, explore a finished demo project, or
              begin from scratch. Spinalith gives you a starting point without
              taking control away from you.
            </p>

            <div className="home-momentum__benefits" aria-label="Starting options">
              {benefits.map(({ title, body, Icon }) => (
                <SiteBenefitItem
                  key={title}
                  title={title}
                  body={body}
                  Icon={Icon}
                  accentColor="var(--color-brand-soft)"
                  variant="row"
                  tone="plain"
                  size="md"
                  iconShape="rounded"
                  className="home-momentum__benefit"
                />
              ))}
            </div>

            <a className="home-momentum__cta" href={COMMON_LINKS.app.signup}>
              <span>Start Building Your Story</span>
              <ArrowRight aria-hidden="true" />
            </a>
          </div>

          <div className="home-momentum__gallery-wrap">
            <div className="home-momentum__gallery">
              {galleryItems.map((item, index) => {
                const shouldPrioritizeImage =
                  index < 4 && item.mediaMode !== "blank";

                return (
<SiteGalleryCard
  key={item.title}
  pillText={item.pillText}
  title={item.title}
  summary={item.summary}
  Icon={item.Icon}
  metaText={item.metaText}
  imageSrc={item.imageSrc}
  imageAlt={item.imageAlt}
  mediaMode={item.mediaMode}
  accentColor={item.accentColor}
  aspect="portrait"
  density="compact"
  mediaSize="lg"
  heightMode="equal"
  imageLoading={shouldPrioritizeImage ? "eager" : "lazy"}
  imageFetchPriority={shouldPrioritizeImage ? "high" : "auto"}
  className="home-momentum__gallery-card"
/>
                );
              })}
            </div>

            <p className="home-momentum__note">
              <Sparkles aria-hidden="true" />
              <span>
                All templates and demos are fully customizable. Change, remove,
                or rebuild anything.
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeMomentumSection;