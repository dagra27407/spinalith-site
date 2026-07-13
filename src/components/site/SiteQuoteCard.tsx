// src/components/site/SiteQuoteCard.tsx

/**
 * File: src/components/site/SiteQuoteCard.tsx
 *
 * Purpose:
 * Reusable quote-style statement card for Spinalith.com marketing sections.
 *
 * Responsibilities:
 * - Render a prominent first-person statement with supporting explanatory copy.
 * - Provide a decorative quotation mark without requiring a caller-provided icon.
 * - Optionally render a short eyebrow label beside the quotation mark.
 * - Accept a caller-provided accent color through semantic design tokens.
 * - Support controlled density, accent-line placement, and height behavior.
 * - Stay visually distinct from SiteFeatureCard and SiteBenefitItem.
 *
 * Notes:
 * - This component does not own parent grid or responsive layout behavior.
 * - Parent sections decide how many cards appear per row at each breakpoint.
 * - The quotation mark is decorative and intentionally hidden from assistive technology.
 * - The eyebrow prop is optional. Omitting it preserves the original card structure
 *   and visual treatment used by the homepage Problem section.
 * - Use SiteFeatureCard for product/workflow features.
 * - Use SiteBenefitItem for quieter icon-and-copy proof points.
 * - Use SiteQuoteCard for first-person pain points, observations, or editorial statements.
 * - Defaults preserve the intended Problem-section treatment:
 *   default density, bottom-left accent line, and equal-height behavior.
 */

import type { CSSProperties, ReactNode } from "react";

import "../../styles/components/siteQuoteCard.css";

type SiteQuoteCardDensity = "compact" | "default" | "roomy";

type SiteQuoteCardAccentPosition =
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"
  | "none";

type SiteQuoteCardHeightMode = "auto" | "equal";

type SiteQuoteCardProps = {
  quote: string;
  eyebrow?: string;
  body?: string;
  children?: ReactNode;
  accentColor?: string;
  density?: SiteQuoteCardDensity;
  accentPosition?: SiteQuoteCardAccentPosition;
  heightMode?: SiteQuoteCardHeightMode;
  className?: string;
};

function QuoteMark() {
  return (
    <div className="site-quote-card__mark" aria-hidden="true">
      <svg viewBox="0 0 48 36" focusable="false">
        <path d="M5.5 19.2C5.5 10.6 10.1 5 18.4 2.4l2.2 4.2c-4.7 1.8-7.4 4.8-7.9 9h7.1V33H5.5V19.2Z" />
        <path d="M27.4 19.2C27.4 10.6 32 5 40.3 2.4l2.2 4.2c-4.7 1.8-7.4 4.8-7.9 9h7.1V33H27.4V19.2Z" />
      </svg>
    </div>
  );
}

export function SiteQuoteCard({
  quote,
  eyebrow,
  body,
  children,
  accentColor = "var(--color-brand-soft)",
  density = "default",
  accentPosition = "bottom-left",
  heightMode = "equal",
  className,
}: SiteQuoteCardProps) {
  const classes = [
    "site-quote-card",
    `site-quote-card--density-${density}`,
    `site-quote-card--accent-${accentPosition}`,
    `site-quote-card--height-${heightMode}`,
    eyebrow ? "site-quote-card--has-eyebrow" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article
      className={classes}
      style={{ "--site-quote-accent": accentColor } as CSSProperties}
    >
      {eyebrow ? (
        <div className="site-quote-card__header">
          <QuoteMark />

          <p className="site-quote-card__eyebrow">{eyebrow}</p>
        </div>
      ) : (
        <QuoteMark />
      )}

      <div className="site-quote-card__content">
        <h3 className="site-quote-card__quote">
          <span aria-hidden="true">“</span>
          {quote}
          <span aria-hidden="true">”</span>
        </h3>

        {body ? <p className="site-quote-card__body">{body}</p> : children}
      </div>

      {accentPosition !== "none" ? (
        <span className="site-quote-card__accent-line" aria-hidden="true" />
      ) : null}
    </article>
  );
}

export default SiteQuoteCard;