// src/pages/TermsPage.tsx

/**
 * File: src/pages/TermsPage.tsx
 *
 * Purpose:
 * Public Terms of Service governing use of Spinalith.com and the
 * Spinalith application.
 *
 * Responsibilities:
 * - Establish the basic agreement governing use of Spinalith.
 * - Explain account, membership, billing, and acceptable-use expectations.
 * - Protect user ownership of original story content.
 * - Define reasonable service, warranty, and liability limitations.
 *
 * Notes:
 * - Shared legal-page styling lives in src/styles/page/legal/legalPage.css.
 * - Review these terms whenever pricing, memberships, trials, refunds,
 *   AI functionality, or product ownership rules materially change.
 */

import "../styles/page/legal/legalPage.css";

import { COMMON_LINKS } from "@/routes/CommonLinks";

export function TermsPage() {
  return (
    <main className="legal-page">
      <section className="legal-page__hero">
        <div className="site-container-narrow">
          <span className="eyebrow">Terms</span>

          <h1>Terms of Service</h1>

          <p className="section-lede">
            These Terms govern your access to and use of Spinalith.com and the
            Spinalith story-planning application.
          </p>

          <p className="legal-page__updated">
            Last updated: September 7, 2026
          </p>
        </div>
      </section>

      <section className="legal-page__content">
        <div className="site-container-narrow">
          <div className="legal-page__document">
            <section>
              <h2>1. Agreement to these Terms</h2>

              <p>
                By creating an account, purchasing a membership, or otherwise
                using Spinalith, you agree to these Terms of Service and our
                Privacy Policy.
              </p>

              <p>
                If you do not agree to these Terms, do not use the service.
              </p>
            </section>

            <section>
              <h2>2. The Spinalith service</h2>

              <p>
                Spinalith provides tools for story planning, organization,
                worldbuilding, narrative structure, project management, and
                related writing workflows.
              </p>

              <p>
                Features may change, improve, be replaced, or be discontinued
                as the product develops. We do not guarantee that every feature
                or interface will remain unchanged.
              </p>
            </section>

            <section>
              <h2>3. Accounts</h2>

              <p>
                You are responsible for maintaining the confidentiality and
                security of your account credentials and for activity that
                occurs through your account.
              </p>

              <p>
                You agree to provide accurate information when creating or
                maintaining your account and to notify us if you believe your
                account has been accessed without authorization.
              </p>
            </section>

            <section>
              <h2>4. Memberships and free trials</h2>

              <p>
                Certain Spinalith features require a paid membership. Where
                offered, a free trial provides temporary access to eligible
                paid features for the period stated when you begin the trial.
              </p>

              <p>
                Unless canceled before the end of the trial, a membership may
                convert to a paid recurring subscription at the price and
                billing frequency selected or presented during signup.
              </p>

              <p>
                Recurring memberships continue until canceled. You may cancel
                your membership through the available account or billing tools.
                Cancellation stops future renewals but does not normally erase
                your account or project data.
              </p>
            </section>

            <section>
              <h2>5. Pricing and billing</h2>

              <p>
                Prices, billing intervals, promotional offers, founder pricing,
                and trial terms are displayed before purchase and may change for
                future purchases or memberships.
              </p>

              <p>
                If you receive a founder or promotional rate that is described
                as remaining in effect while your membership stays active, that
                rate may be lost if the qualifying membership is canceled,
                expires, or otherwise becomes inactive.
              </p>

              <p>
                Payments are processed by Stripe. By purchasing a membership,
                you also agree to any terms imposed by Stripe that apply to its
                payment-processing services.
              </p>

              <p>
                Fees are non-refundable except where required by law or where
                Spinalith expressly states otherwise.
              </p>
            </section>

            <section>
              <h2>6. Your content belongs to you</h2>

              <p>
                You retain ownership of the original stories, characters,
                scenes, chapters, worldbuilding, notes, images, and other
                content you create or upload to Spinalith.
              </p>

              <p>
                You grant Spinalith only the limited rights reasonably necessary
                to host, store, process, reproduce, display, transmit, back up,
                and otherwise handle your content for the purpose of operating
                and providing the service to you.
              </p>

              <p>
                This limited permission does not transfer ownership of your
                story or creative work to Spinalith.
              </p>
            </section>

            <section>
              <h2>7. Your responsibility for uploaded content</h2>

              <p>
                You are responsible for content you create, upload, or store
                through Spinalith and for ensuring that you have the rights
                necessary to use that content.
              </p>

              <p>
                Do not use Spinalith to upload or distribute content that
                unlawfully infringes another person&apos;s intellectual property,
                privacy, or other legal rights.
              </p>
            </section>

            <section>
              <h2>8. Acceptable use</h2>

              <p>You may not use Spinalith to:</p>

              <ul>
                <li>
                  Attempt to gain unauthorized access to accounts, systems, or
                  data.
                </li>
                <li>
                  Interfere with or intentionally disrupt the operation or
                  security of the service.
                </li>
                <li>
                  Introduce malware, harmful code, automated attacks, or abusive
                  traffic.
                </li>
                <li>
                  Circumvent reasonable access, security, membership, or usage
                  restrictions.
                </li>
                <li>
                  Use the service for unlawful activity or in violation of
                  another person&apos;s legal rights.
                </li>
              </ul>
            </section>

            <section>
              <h2>9. Spinalith intellectual property</h2>

              <p>
                Spinalith, including its software, interface, visual design,
                branding, documentation, and other original product materials,
                is owned by Spinalith or its licensors and is protected by
                applicable intellectual-property laws.
              </p>

              <p>
                These Terms do not grant you ownership of the Spinalith
                application or permission to copy, resell, reverse engineer, or
                commercially exploit the service except as permitted by law.
              </p>
            </section>

            <section>
              <h2>10. Feedback</h2>

              <p>
                If you voluntarily provide suggestions, ideas, bug reports, or
                other feedback about Spinalith, you allow us to use that
                feedback to improve or develop the service without an
                obligation to compensate you.
              </p>

              <p>
                This section does not give Spinalith ownership of your stories
                or creative project content.
              </p>
            </section>

            <section>
              <h2>11. Availability and changes</h2>

              <p>
                We work to keep Spinalith available and reliable, but we do not
                guarantee uninterrupted or error-free operation.
              </p>

              <p>
                The service may occasionally be unavailable because of
                maintenance, upgrades, infrastructure failures, security events,
                or circumstances outside our reasonable control.
              </p>
            </section>

            <section>
              <h2>12. Suspension and termination</h2>

              <p>
                We may suspend or terminate access when reasonably necessary to
                protect the service, other users, or third parties; respond to
                legal requirements; address nonpayment; or enforce these Terms.
              </p>

              <p>
                You may stop using Spinalith at any time and may cancel an
                active membership through the available billing tools.
              </p>
            </section>

            <section>
              <h2>13. Disclaimers</h2>

              <p>
                Spinalith is provided on an &quot;as is&quot; and
                &quot;as available&quot; basis to the fullest extent permitted
                by law.
              </p>

              <p>
                We do not guarantee that use of Spinalith will produce any
                particular creative, publishing, commercial, financial, or
                professional result.
              </p>
            </section>

            <section>
              <h2>14. Limitation of liability</h2>

              <p>
                To the fullest extent permitted by applicable law, Spinalith
                will not be liable for indirect, incidental, special,
                consequential, exemplary, or punitive damages arising from or
                related to your use of the service.
              </p>

              <p>
                To the fullest extent permitted by applicable law, Spinalith&apos;s
                total liability for claims arising from or relating to the
                service will not exceed the amount you paid to Spinalith during
                the twelve months immediately preceding the event giving rise
                to the claim.
              </p>

              <p>
                Some jurisdictions do not allow certain limitations of
                liability, so portions of this section may not apply to you.
              </p>
            </section>

            <section>
              <h2>15. Governing law</h2>

              <p>
                These Terms are governed by the laws of the State of North
                Carolina, United States, without regard to conflict-of-law
                principles, except where applicable law requires otherwise.
              </p>
            </section>

            <section>
              <h2>16. Changes to these Terms</h2>

              <p>
                We may update these Terms as the service changes. When material
                changes are made, we will update the date at the top of this
                page and may provide additional notice where appropriate.
              </p>

              <p>
                Continuing to use Spinalith after updated Terms become effective
                constitutes acceptance of the revised Terms where permitted by
                law.
              </p>
            </section>

            <section>
              <h2>17. Contact</h2>

              <p>
                Questions regarding these Terms can be submitted through the
                Spinalith contact page.
              </p>

              <a
                className="site-button site-button-secondary"
                href={COMMON_LINKS.site.contact}
              >
                Contact Spinalith
              </a>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}