// src/components/home/HomeConnectedSection.tsx

/**
 * File: src/components/home/HomeConnectedSection.tsx
 *
 * Purpose:
 * Homepage "Everything Connected" section.
 *
 * Responsibilities:
 * - Introduces Spinalith as a connected story workspace.
 * - Pairs a strong headline with the connected-map SVG illustration.
 * - Lets the map carry the section visually without a supporting screenshot.
 * - Preserves a distinct rhythm from the surrounding homepage sections.
 *
 * Notes:
 * - The connection map artwork lives in homeComponents/HomeConnectedMap.tsx.
 * - The section places and scales the map, but does not style map internals.
 * - Section-level layout styles live in src/styles/page/home/homeConnected.css.
 */

import { HomeConnectedMap } from "./homeComponents/HomeConnectedMap";

export function HomeConnectedSection() {
  return (
    <section
      className="home-connected section-padding"
      aria-labelledby="home-connected-title"
    >
      <div className="site-container-wide home-connected__inner">
        <div className="home-connected__copy">
          <p className="section-kicker">Everything connected</p>

          <h2 className="home-connected__title" id="home-connected-title">
            <span>Your story lives here.</span>
            <span className="home-connected__title-accent">All of it.</span>
          </h2>
        </div>

        <div className="home-connected__map-shell" aria-hidden="true">
          <div className="home-connected__map-halo home-connected__drop-halo">
            <HomeConnectedMap />
          </div>
        </div>
      </div>
    </section>
  );
}