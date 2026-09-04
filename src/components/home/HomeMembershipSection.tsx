// src/components/home/HomeMembershipSection.tsx

/**
 * File: src/components/home/HomeMembershipSection.tsx
 *
 * Purpose:
 * Homepage membership / pricing / final CTA section.
 *
 * Responsibilities:
 * - Invite qualified homepage visitors to try Spinalith with their own story.
 * - Present founder monthly and annual pricing clearly without implying plan selection on the marketing page.
 * - Make the 14-day full-access trial the immediate next step while keeping post-trial pricing visible.
 * - Explain the founder-rate lock-in benefit without making discounting the main sales message.
 * - Provide a single CTA to the app account creation flow.
 * - Close the homepage before the footer with a low-friction trial offer.
 *
 * Notes:
 * - Plan selection happens inside the app after account creation.
 * - Pricing cards are informational, not interactive/selectable controls.
 * - The CTA begins the account creation flow, not Stripe Checkout directly.
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
    savingsLine: "14-day free trial, then $7.99/mo",
    Icon: Calendar,
  },
  {
    title: "Annual",
    eyebrow: "Founder annual",
    price: "$69.99",
    cadence: "/year",
    regularPrice: "$99.99/year",
    savingsLine: "14-day free trial, then $69.99/year",
    badge: "Best value",
    Icon: CalendarCheck,
  },
];

export function HomeMembershipSection() {
  return (
    <section className="home-membership" aria-labelledby="home-membership-title">
      <div className="site-container">
        <div className="home-membership__header">
          <p className="home-membership__kicker">Try Spinalith with your story</p>

          <h2 id="home-membership-title" className="home-membership__title">
            <span>See what changes when</span>
            <span className="home-membership__title-accent">
              your whole story is connected.
            </span>
          </h2>

          <p className="home-membership__lede">
            Use the full Spinalith workspace with your own project for 14 days and
            see if it gives you a better way to keep everything straight.
          </p>

          <p className="home-membership__discount-pill">
            <Sparkles aria-hidden="true" />
            <span>
              <strong>Founder pricing:</strong> Lock in your selected rate while
              your membership stays active.
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
            <span>Start My 14-Day Trial</span>
            <ArrowRight aria-hidden="true" />
          </a>

          <p className="home-membership__trial-note">
            Full access for 14 days. Cancel anytime.
          </p>

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
              Cancel anytime
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeMembershipSection;
