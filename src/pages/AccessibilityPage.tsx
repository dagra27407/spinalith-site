// src/pages/AccessibilityPage.tsx

/**
 * File: src/pages/AccessibilityPage.tsx
 *
 * Purpose:
 * Public accessibility statement for the Spinalith marketing website.
 *
 * Responsibilities:
 * - Explain Spinalith's commitment to accessible web experiences.
 * - Describe the accessibility practices currently implemented on spinalith.com.
 * - Clarify the scope of this statement.
 * - Provide a clear way for visitors to report accessibility problems.
 *
 * Scope:
 * - This statement applies to the public marketing website at spinalith.com.
 * - The product application at app.spinalith.com contains more complex
 *   interactive features and is evaluated separately.
 *
 * Notes:
 * - This page intentionally avoids claiming formal WCAG certification.
 * - Spinalith is working toward WCAG 2.2 Level AA as a practical accessibility target.
 * - Shared styling comes from src/styles/page/legal/legalPage.css.
 */

import "../styles/page/legal/legalPage.css";

import { COMMON_LINKS } from "@/routes/CommonLinks";

export function AccessibilityPage() {
  return (
    <div className="legal-page">
      <section className="legal-page__hero">
        <div className="site-container-narrow">
          <span className="eyebrow">Accessibility</span>

          <h1>Accessibility Statement</h1>

          <p className="section-lede">
            Spinalith is committed to making its public website usable by as
            many people as reasonably possible, including people who use
            assistive technologies or alternative ways of navigating the web.
          </p>

          <p className="legal-page__updated">
            Last reviewed: September 7, 2026
          </p>
        </div>
      </section>

      <section className="legal-page__content">
        <div className="site-container-narrow">
          <div className="legal-page__document">
            <section>
              <h2>Our accessibility goal</h2>

              <p>
                We are working to make spinalith.com accessible in accordance
                with the Web Content Accessibility Guidelines (WCAG) 2.2 Level
                AA where reasonably applicable to the public website.
              </p>

              <p>
                Accessibility is an ongoing effort, and we expect to continue
                reviewing and improving the website as content, features, and
                technology change.
              </p>
            </section>

            <section>
              <h2>What we have implemented</h2>

              <p>
                As part of our current accessibility work on spinalith.com, we
                have reviewed and improved areas including:
              </p>

              <ul>
                <li>
                  Keyboard navigation and visible keyboard focus indicators.
                </li>
                <li>
                  A skip-to-content link for bypassing repeated navigation.
                </li>
                <li>
                  Semantic page structure, headings, navigation landmarks, and
                  form controls.
                </li>
                <li>
                  Alternative text and accessible descriptions for meaningful
                  product screenshots and visual demonstrations.
                </li>
                <li>
                  Accessible form labels, validation states, and status
                  messages.
                </li>
                <li>
                  Reduced-motion preferences for visitors who request less
                  movement.
                </li>
                <li>
                  Pause and play controls for automatically looping product
                  demonstration videos.
                </li>
                <li>
                  Responsive behavior and usability at increased browser zoom
                  levels.
                </li>
                <li>
                  General color contrast and readability across the public
                  website.
                </li>
              </ul>
            </section>

            <section>
            <h2>Scope of this statement</h2>

            <p>
                This accessibility statement applies to the public marketing website
                available at spinalith.com.
            </p>

            <p>
                The Spinalith application at app.spinalith.com contains more complex
                interactive functionality, including visual planning tools, grids,
                dialogs, and drag-and-drop interactions. Accessibility for those product
                experiences is being evaluated separately as part of our ongoing
                accessibility work.
            </p>
            </section>

            <section>
              <h2>Third-party services</h2>

              <p>
                Parts of the Spinalith website may rely on third-party services
                or embedded functionality that we do not fully control.
              </p>

              <p>
                Examples may include payment processing, security verification,
                hosting infrastructure, or other services necessary to operate
                the website.
              </p>

              <p>
                We aim to select reputable providers and to integrate those
                services in a way that does not create unnecessary accessibility
                barriers.
              </p>
            </section>

            <section>
              <h2>Known limitations</h2>

              <p>
                We are not currently aware of a major accessibility barrier on
                the public spinalith.com website that prevents basic navigation
                or access to its primary content.
              </p>

              <p>
                However, automated testing and internal review cannot identify
                every possible accessibility issue. Different assistive
                technologies, devices, browsers, and user needs may reveal
                problems that we have not encountered.
              </p>
            </section>

            <section>
              <h2>Report an accessibility problem</h2>

              <p>
                If you encounter an accessibility problem on spinalith.com, we
                want to know about it.
              </p>

              <p>
                When contacting us, it is helpful to include the page where the
                problem occurred, what you were trying to do, and the browser,
                device, or assistive technology you were using if you are
                comfortable providing that information.
              </p>

              <a
                className="site-button site-button-secondary"
                href={COMMON_LINKS.site.contact}
              >
                Contact Spinalith
              </a>
            </section>

            <section>
              <h2>Ongoing review</h2>

              <p>
                Accessibility is part of our ongoing website maintenance rather
                than a one-time project. As Spinalith grows, we plan to continue
                reviewing public pages, interactive controls, media, and new
                functionality for accessibility concerns.
              </p>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}