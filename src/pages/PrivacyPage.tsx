// src/pages/PrivacyPage.tsx

/**
 * File: src/pages/PrivacyPage.tsx
 *
 * Purpose:
 * Public Privacy Policy for Spinalith.com and the Spinalith application.
 *
 * Responsibilities:
 * - Explain what information Spinalith collects and why.
 * - Identify the service providers involved in operating the product.
 * - Explain how users can request access, correction, or deletion.
 * - Describe contact-form, account, billing, and technical data handling.
 *
 * Notes:
 * - Shared legal-page styling lives in src/styles/page/legal/legalPage.css.
 * - This policy should be reviewed whenever data collection, analytics,
 *   advertising, payment, authentication, or AI functionality changes.
 */

import "../styles/page/legal/legalPage.css";

import { COMMON_LINKS } from "@/routes/CommonLinks";

export function PrivacyPage() {
  return (
    <main className="legal-page">
      <section className="legal-page__hero">
        <div className="site-container-narrow">
          <span className="eyebrow">Privacy</span>

          <h1>Privacy Policy</h1>

          <p className="section-lede">
            This policy explains what information Spinalith collects, why we
            collect it, and how that information is used when you visit our
            website or use the Spinalith application.
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
              <h2>1. Information we collect</h2>

              <p>
                The information we collect depends on how you use Spinalith.
              </p>

              <h3>Account information</h3>

              <p>
                When you create an account, we may collect information such as
                your name, email address, authentication information, account
                preferences, and other information necessary to provide and
                secure your account.
              </p>

              <h3>Story and project content</h3>

              <p>
                When you use Spinalith, you may create or store story-related
                content including characters, scenes, chapters, timelines,
                locations, lore, notes, images, relationships, planning data,
                and other project information.
              </p>

              <p>
                This content remains associated with your account so that we
                can provide the Spinalith service to you.
              </p>

              <h3>Contact information</h3>

              <p>
                If you use our contact form, we collect the name, email
                address, subject, and message that you submit. We may also
                collect limited technical information such as your browser or
                device user-agent for security, troubleshooting, and abuse
                prevention.
              </p>

              <h3>Billing information</h3>

              <p>
                Paid memberships are processed through Stripe. Spinalith does
                not store your full payment-card number. Stripe may collect and
                process payment, billing, transaction, device, and fraud-
                prevention information as necessary to provide payment
                services.
              </p>

              <h3>Technical information</h3>

              <p>
                Our hosting, security, authentication, and infrastructure
                providers may automatically process technical information such
                as IP addresses, browser type, device information, request
                metadata, timestamps, and security signals when you use the
                website or application.
              </p>
            </section>

            <section>
              <h2>2. How we use information</h2>

              <p>We use information collected through Spinalith to:</p>

              <ul>
                <li>Provide, operate, and maintain the Spinalith service.</li>
                <li>Create and secure user accounts.</li>
                <li>Store and display your story and project information.</li>
                <li>Process memberships, payments, and billing.</li>
                <li>Respond to questions, support requests, and feedback.</li>
                <li>Prevent spam, fraud, abuse, and unauthorized access.</li>
                <li>Diagnose technical problems and improve reliability.</li>
                <li>Comply with applicable legal obligations.</li>
              </ul>
            </section>

            <section>
              <h2>3. Service providers</h2>

              <p>
                We use third-party service providers to operate parts of
                Spinalith. These providers may process information as necessary
                to provide their services to us.
              </p>

              <ul>
                <li>
                  <strong>Supabase</strong> — database, authentication, storage,
                  and backend infrastructure.
                </li>
                <li>
                  <strong>Stripe</strong> — membership billing and payment
                  processing.
                </li>
                <li>
                  <strong>Vercel</strong> — website hosting and delivery.
                </li>
                <li>
                  <strong>Cloudflare Turnstile</strong> — bot and abuse
                  prevention on public forms.
                </li>
              </ul>

              <p>
                These providers have their own privacy practices and may process
                technical or personal information according to their respective
                policies.
              </p>
            </section>

            <section>
              <h2>4. Payment information</h2>

              <p>
                Payments are handled by Stripe. Payment-card information
                entered during checkout is provided directly to Stripe rather
                than stored in the Spinalith application.
              </p>

              <p>
                Stripe may process information including your name, email,
                billing information, payment information, transaction details,
                device information, and fraud-prevention signals.
              </p>
            </section>

            <section>
              <h2>5. Cookies and local storage</h2>

              <p>
                Spinalith and its service providers may use cookies, browser
                storage, or similar technologies when necessary to provide
                authentication, maintain sessions, remember settings, protect
                the service, and operate website or application functionality.
              </p>

              <p>
                If we introduce advertising, behavioral tracking, or additional
                analytics technologies that materially change how information
                is collected or used, this Privacy Policy will be updated.
              </p>
            </section>

            <section>
              <h2>6. How we share information</h2>

              <p>
                We do not sell your personal information or your story content.
              </p>

              <p>
                We may share information with service providers when necessary
                to operate Spinalith, process payments, provide infrastructure,
                prevent abuse, or comply with law.
              </p>

              <p>
                We may also disclose information when reasonably necessary to
                protect the rights, safety, security, or property of Spinalith,
                our users, or others, or when required by valid legal process.
              </p>
            </section>

            <section>
              <h2>7. Your story content</h2>

              <p>
                You retain ownership of the original story content and project
                material that you create or upload to Spinalith.
              </p>

              <p>
                We process and store that content only as necessary to provide,
                maintain, secure, and improve the functionality of the service,
                subject to these Terms and this Privacy Policy.
              </p>
            </section>

            <section>
              <h2>8. Data retention</h2>

              <p>
                We retain information for as long as reasonably necessary to
                provide the service, maintain your account, meet legal or
                financial obligations, resolve disputes, prevent abuse, and
                enforce our agreements.
              </p>

              <p>
                Some information may remain temporarily in backups or system
                logs after deletion as part of normal technical operations.
              </p>
            </section>

            <section>
              <h2>9. Your choices and requests</h2>

              <p>
                Depending on your location, you may have legal rights regarding
                personal information. Regardless of location, you may contact us
                to request that we review a reasonable request to access,
                correct, or delete personal information associated with you.
              </p>

              <p>
                We may need to verify your identity before completing a request,
                and we may retain information when required by law or necessary
                for legitimate security, billing, fraud-prevention, or record-
                keeping purposes.
              </p>

              <a
                className="legal-page__inline-link"
                href={COMMON_LINKS.site.contact}
              >
                Contact Spinalith
              </a>
            </section>

            <section>
              <h2>10. Security</h2>

              <p>
                We use reasonable administrative, technical, and organizational
                measures intended to protect information against unauthorized
                access, disclosure, alteration, or destruction.
              </p>

              <p>
                No online system can guarantee absolute security, and we cannot
                guarantee that information will never be accessed or disclosed
                improperly.
              </p>
            </section>

            <section>
              <h2>11. Children&apos;s privacy</h2>

              <p>
                Spinalith is not intended for children under 13, and we do not
                knowingly collect personal information from children under 13.
                If we learn that such information has been collected, we will
                take reasonable steps to delete it.
              </p>
            </section>

            <section>
              <h2>12. Changes to this policy</h2>

              <p>
                We may update this Privacy Policy as Spinalith changes. When we
                make material changes, we will update the date shown at the top
                of this page and may provide additional notice where
                appropriate.
              </p>
            </section>

            <section>
              <h2>13. Contact</h2>

              <p>
                Questions or requests regarding this Privacy Policy can be sent
                through the Spinalith contact form.
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