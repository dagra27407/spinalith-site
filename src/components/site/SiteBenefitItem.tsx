// src/components/site/SiteBenefitItem.tsx

/**
 * File: src/components/site/SiteBenefitItem.tsx
 *
 * Purpose:
 * Reusable transparent benefit/proof item for Spinalith.com marketing sections.
 *
 * Responsibilities:
 * - Render a branded icon badge with a title and supporting copy.
 * - Support row and stacked layouts through a variant prop.
 * - Support plain and soft tones without becoming a full feature card.
 * - Accept caller-provided accent color through semantic tokens.
 * - Support left, center, and right alignment for flexible section composition.
 * - Support small, medium, and large sizing without section-specific overrides.
 * - Support rounded-square and circular icon badge shapes.
 *
 * Notes:
 * - This component does not own parent grid/layout behavior.
 * - Use SiteFeatureCard for strong bordered product/workflow cards.
 * - Use SiteBenefitItem for quieter proof points, benefit rows, and compact section explanations.
 * - Default accent uses semantic tokens, not hardcoded palette hex values.
 * - Defaults preserve the original behavior: md size, rounded icon, row layout, plain tone, left alignment.
 */

import type { CSSProperties, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import "../../styles/components/siteBenefitItem.css";

type SiteBenefitItemVariant = "row" | "stack";
type SiteBenefitItemTone = "plain" | "soft";
type SiteBenefitItemAlign = "left" | "center" | "right";
type SiteBenefitItemSize = "sm" | "md" | "lg";
type SiteBenefitItemIconShape = "rounded" | "circle";

type SiteBenefitItemProps = {
  title: string;
  body?: string;
  children?: ReactNode;
  Icon: LucideIcon;
  accentColor?: string;
  variant?: SiteBenefitItemVariant;
  tone?: SiteBenefitItemTone;
  align?: SiteBenefitItemAlign;
  size?: SiteBenefitItemSize;
  iconShape?: SiteBenefitItemIconShape;
  className?: string;
};

export function SiteBenefitItem({
  title,
  body,
  children,
  Icon,
  accentColor = "var(--color-brand-soft)",
  variant = "row",
  tone = "plain",
  align = "left",
  size = "md",
  iconShape = "rounded",
  className,
}: SiteBenefitItemProps) {
  const classes = [
    "site-benefit-item",
    `site-benefit-item--${variant}`,
    `site-benefit-item--${tone}`,
    `site-benefit-item--align-${align}`,
    `site-benefit-item--size-${size}`,
    `site-benefit-item--icon-${iconShape}`,
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article
      className={classes}
      style={{ "--site-benefit-accent": accentColor } as CSSProperties}
    >
      <div className="site-benefit-item__icon" aria-hidden="true">
        <Icon />
      </div>

      <div className="site-benefit-item__content">
        <h3 className="site-benefit-item__title">{title}</h3>

        {body ? <p className="site-benefit-item__body">{body}</p> : children}
      </div>
    </article>
  );
}

export default SiteBenefitItem;