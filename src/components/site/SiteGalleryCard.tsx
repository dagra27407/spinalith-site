// src/components/site/SiteGalleryCard.tsx

/**
 * File: src/components/site/SiteGalleryCard.tsx
 *
 * Purpose:
 * Reusable image-led gallery card for Spinalith.com marketing sections.
 *
 * Responsibilities:
 * - Render a category pill, optional media image or blank-state visual, title, summary, and metadata row.
 * - Support template, demo, genre, blank-start, and other gallery-style cards.
 * - Accept caller-provided icon, label text, image path, and accent color.
 * - Support controlled visual variants through props without becoming section-specific.
 * - Stay visually distinct from SiteFeatureCard and SiteBenefitItem.
 *
 * Notes:
 * - This component does not own parent grid/layout behavior.
 * - Parent sections should decide how many cards appear per row at each breakpoint.
 * - Use SiteFeatureCard for strong bordered feature/workflow cards.
 * - Use SiteBenefitItem for quieter icon + text proof points.
 * - Use SiteGalleryCard for image-led template/demo/catalog cards.
 * - Default accent uses semantic tokens, not hardcoded palette hex values.
 * - Defaults preserve original behavior: portrait aspect, default density, md media, equal height.
 */

import type { CSSProperties, ImgHTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Plus } from "lucide-react";

import "../../styles/components/siteGalleryCard.css";

type SiteGalleryCardMediaMode = "image" | "blank";
type SiteGalleryCardAspect = "portrait" | "wide" | "square";
type SiteGalleryCardDensity = "compact" | "default" | "roomy";
type SiteGalleryCardMediaSize = "sm" | "md" | "lg";
type SiteGalleryCardHeightMode = "auto" | "equal";

type SiteGalleryCardProps = {
  pillText: string;
  title: string;
  summary?: string;
  children?: ReactNode;
  Icon: LucideIcon;
  metaText: string;
  imageSrc?: string;
  imageAlt?: string;
  accentColor?: string;
  mediaMode?: SiteGalleryCardMediaMode;
  aspect?: SiteGalleryCardAspect;
  density?: SiteGalleryCardDensity;
  mediaSize?: SiteGalleryCardMediaSize;
  heightMode?: SiteGalleryCardHeightMode;
  imageLoading?: ImgHTMLAttributes<HTMLImageElement>["loading"];
  imageFetchPriority?: ImgHTMLAttributes<HTMLImageElement>["fetchPriority"];
  className?: string;
};

export function SiteGalleryCard({
  pillText,
  title,
  summary,
  children,
  Icon,
  metaText,
  imageSrc,
  imageAlt = "",
  accentColor = "var(--color-brand-soft)",
  mediaMode = imageSrc ? "image" : "blank",
  aspect = "portrait",
  density = "default",
  mediaSize = "md",
  heightMode = "equal",
  imageLoading = "lazy",
  imageFetchPriority,
  className,
}: SiteGalleryCardProps) {
  const hasImage = mediaMode === "image" && Boolean(imageSrc);

  const classes = [
    "site-gallery-card",
    `site-gallery-card--${mediaMode}`,
    `site-gallery-card--${aspect}`,
    `site-gallery-card--density-${density}`,
    `site-gallery-card--media-${mediaSize}`,
    `site-gallery-card--height-${heightMode}`,
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article
      className={classes}
      style={{ "--site-gallery-accent": accentColor } as CSSProperties}
    >
      <div className="site-gallery-card__media">
        <span className="site-gallery-card__pill">{pillText}</span>

        {hasImage ? (
          <img
            className="site-gallery-card__image"
            src={imageSrc}
            alt={imageAlt}
            loading={imageLoading}
            fetchPriority={imageFetchPriority}
          />
        ) : (
          <div className="site-gallery-card__blank-visual" aria-hidden="true">
            <span className="site-gallery-card__blank-ring">
              <Plus />
            </span>
          </div>
        )}
      </div>

      <div className="site-gallery-card__content">
        <h3 className="site-gallery-card__title">{title}</h3>

        {summary ? (
          <p className="site-gallery-card__summary">{summary}</p>
        ) : (
          children
        )}
      </div>

      <div className="site-gallery-card__meta">
        <Icon aria-hidden="true" />
        <span>{metaText}</span>
      </div>
    </article>
  );
}

export default SiteGalleryCard;