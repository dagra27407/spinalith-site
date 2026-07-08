// src/components/home/HomeMembershipSection.tsx

/**
 * File: src/components/home/HomeMembershipSection.tsx
 *
 * Purpose:
 * Homepage membership / pricing / final CTA section.
 *
 * Responsibilities:
 * - Present founder pricing clearly.
 * - Show monthly and annual pricing without implying plan selection on the marketing page.
 * - Highlight the founder discount and annual savings.
 * - Provide a single CTA to the app account creation flow.
 * - Close the homepage before the footer with a clear membership offer.
 *
 * Notes:
 * - Plan selection happens inside the app after account creation.
 * - Pricing cards are informational, not interactive/selectable controls.
 * - Background image asset lives at public/assets/images/home/membership-nebula-backdrop.png.
 */

import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BadgeCheck,
  Calendar,
  CalendarCheck,
  ShieldCheck,
  Sparkles,
  Tag,
} from "lucide-react";

import "../../styles/page/home/homeMembership.css";

import { COMMON_LINKS } from "@/routes/CommonLinks";

type MembershipPriceCard = {
  title: string;
  eyebrow: string;
  price: string;
  cadence: string;
  regularPrice: string;
  savingsLine: string;
  badge?: string;
  Icon: LucideIcon;
};

const membershipPlans: MembershipPriceCard[] = [
  {
    title: "Monthly",
    eyebrow: "Founder monthly",
    price: "$7.99",
    cadence: "/mo",
    regularPrice: "$9.99/mo",
    savingsLine: "20% founder savings",
    Icon: Calendar,
  },
  {
    title: "Annual",
    eyebrow: "Founder annual",
    price: "$69.99",
    cadence: "/year",
    regularPrice: "$99.99/year",
    savingsLine: "Save $30/year • 30% total savings",
    badge: "Best value",
    Icon: CalendarCheck,
  },
];

export function HomeMembershipSection() {
  return (
    <section className="home-membership" aria-labelledby="home-membership-title">
      <div className="site-container">
        <div className="home-membership__header">
          <p className="home-membership__kicker">Membership</p>

          <h2 id="home-membership-title" className="home-membership__title">
            <span>One membership.</span>
            <span className="home-membership__title-accent">
              Full workspace.
            </span>
          </h2>

          <p className="home-membership__lede">
            Start with every planning view, template, demo, and
            story-development tool included.
          </p>

          <p className="home-membership__discount-pill">
            <Sparkles aria-hidden="true" />
            <span>
              <strong>Founder pricing:</strong> save 20% monthly or 30% annually.
            </span>
          </p>
        </div>

        <div className="home-membership__panel">
          <div className="home-membership__cards" aria-label="Founder pricing">
            {membershipPlans.map(
              ({
                title,
                eyebrow,
                price,
                cadence,
                regularPrice,
                savingsLine,
                badge,
                Icon,
              }) => (
                <article
                  key={title}
                  className={[
                    "home-membership__price-card",
                    badge ? "home-membership__price-card--featured" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {badge ? (
                    <span className="home-membership__plan-badge">
                      <Sparkles aria-hidden="true" />
                      {badge}
                    </span>
                  ) : null}

                  <div className="home-membership__plan-topline">
                    <span className="home-membership__plan-icon" aria-hidden="true">
                      <Icon />
                    </span>

                    <div>
                      <p className="home-membership__plan-eyebrow">{eyebrow}</p>
                      <h3 className="home-membership__plan-title">{title}</h3>
                    </div>
                  </div>

                  <div className="home-membership__price-row">
                    <span className="home-membership__price">{price}</span>
                    <span className="home-membership__cadence">{cadence}</span>
                  </div>

                  <p className="home-membership__regular-price">
                    regular <s>{regularPrice}</s>
                  </p>

                  <div className="home-membership__plan-rule" />

                  <p className="home-membership__savings-line">
                    <BadgeCheck aria-hidden="true" />
                    <span>{savingsLine}</span>
                  </p>
                </article>
              ),
            )}
          </div>

          <a
            className="home-membership__cta"
            href={COMMON_LINKS.app.startMembership}
          >
            <span>Start Your Membership</span>
            <ArrowRight aria-hidden="true" />
          </a>

          <div className="home-membership__trust-row" aria-label="Membership details">
            <span>
              <ShieldCheck aria-hidden="true" />
              Full access
            </span>
            <span>
              <Tag aria-hidden="true" />
              Founder pricing
            </span>
            <span>
              <BadgeCheck aria-hidden="true" />
              Simple membership
            </span>
          </div>
        </div>

        <p className="home-membership__closing-line">
          Simple pricing. Full access. Built for long-form story development.
        </p>
      </div>
    </section>
  );
}

export default HomeMembershipSection;