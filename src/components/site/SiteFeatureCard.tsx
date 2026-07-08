// src/components/site/SiteFeatureCard.tsx

/**
 * File: src/components/site/SiteFeatureCard.tsx
 *
 * Purpose:
 * Reusable visual feature card for Spinalith.com marketing sections.
 *
 * Responsibilities:
 * - Render a branded feature/workflow card with a Lucide icon tile.
 * - Accept a caller-provided accent color for borders, glow, icon, and optional accent text.
 * - Support wide horizontal cards and compact vertical cards through a variant prop.
 * - Support explicit accent rail placement through accentPosition.
 * - Support optional tablet-only accent rail placement through tabletAccentPosition.
 * - Keep card copy/content flexible enough for homepage workflows and future site sections.
 *
 * Notes:
 * - This component does not decide responsive layout by itself.
 * - Parent sections can switch variants or override layout behavior at breakpoints.
 * - The optional accentLabel is useful for a small colored supporting line, but should be used sparingly.
 * - Default accent uses semantic tokens, not hardcoded palette hex values.
 */

import type { CSSProperties, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import "../../styles/components/siteFeatureCard.css";

type SiteFeatureCardVariant = "wide" | "compact";
type SiteFeatureCardAccentPosition = "right" | "left" | "top" | "bottom";

type SiteFeatureCardProps = {
  title: string;
  body?: string;
  children?: ReactNode;
  Icon: LucideIcon;
  accentColor?: string;
  accentLabel?: string;
  variant?: SiteFeatureCardVariant;
  accentPosition?: SiteFeatureCardAccentPosition;
  tabletAccentPosition?: SiteFeatureCardAccentPosition;
  className?: string;
};

export function SiteFeatureCard({
  title,
  body,
  children,
  Icon,
  accentColor = "var(--color-brand-soft)",
  accentLabel,
  variant = "wide",
  accentPosition,
  tabletAccentPosition,
  className,
}: SiteFeatureCardProps) {
  const resolvedAccentPosition =
    accentPosition ?? (variant === "compact" ? "bottom" : "right");

  const classes = [
    "site-feature-card",
    `site-feature-card--${variant}`,
    `site-feature-card--accent-${resolvedAccentPosition}`,
    tabletAccentPosition
      ? `site-feature-card--tablet-accent-${tabletAccentPosition}`
      : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article
      className={classes}
      style={{ "--site-feature-accent": accentColor } as CSSProperties}
    >
      <div className="site-feature-card__icon" aria-hidden="true">
        <Icon />
      </div>

      <div className="site-feature-card__content">
        <h3 className="site-feature-card__title">{title}</h3>

        {accentLabel ? (
          <p className="site-feature-card__accent-label">{accentLabel}</p>
        ) : null}

        {body ? <p className="site-feature-card__body">{body}</p> : children}
      </div>
    </article>
  );
}

export default SiteFeatureCard;