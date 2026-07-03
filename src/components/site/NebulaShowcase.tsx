// src/components/site/NebulaShowcase.tsx

/**
 * File: src/components/site/NebulaShowcase.tsx
 *
 * Purpose:
 * Reusable token-driven atmospheric wrapper for premium product visuals.
 *
 * Responsibilities:
 * - Creates a tunable brand/aura/nebula field around child content.
 * - Supports comet-like trails from a configurable origin point.
 * - Uses deterministic star/dust particles so the visual is stable between renders.
 * - Exposes numeric tuning props for intensity, haze reach, star reach, spread,
 *   particle density, particle brightness, and accent-color mixing.
 *
 * Notes:
 * - This component does not render the product frame itself.
 * - Use it around ScreenshotFrame, product panels, future workflow visuals, or CTA art.
 * - Colors are driven by semantic site tokens in CSS, not hardcoded purple values.
 * - CSS lives in src/styles/components/nebulaShowcase.css.
 *
 * Tuning guidance:
 * - origin: x/y percent point where the effect begins; x 0 = left, 100 = right, y 0 = top, 100 = bottom
 * - angle: direction the trail travels in degrees; 0 = right, 90 = down, -90 = up, 180 = left
 * - intensity: 0 = invisible, 50 = normal, 100 = dramatic
 * - reach: legacy/shared fallback reach; used when hazeReach or starReach is not provided
 * - hazeReach: 0 = tight glow/cloud, 100 = long haze/plume trail
 * - starReach: 0 = tight particle cluster, 100 = long star/dust trail
 * - spread: 0 = narrow comet, 100 = wide nebula cloud
 * - starDensity: 0 = no particles, 100 = full dust field
 * - starBrightness: 0 = hidden particles, 100 = bright particles
 * - accentMix: 0 = brand-only, 100 = strong interaction/accent-color mix
 */

import type { CSSProperties, ReactNode } from "react";

type NebulaPoint = {
  x: number;
  y: number;
};

type NebulaShowcaseProps = {
  children: ReactNode;
  origin?: NebulaPoint;
  angle?: number;

  /**
   * Shared fallback reach.
   * Use hazeReach and starReach for finer control.
   */
  reach?: number;

  /**
   * Controls the length/scale of the haze, plume, bloom, and streak field.
   */
  hazeReach?: number;

  /**
   * Controls the length/scale of the visible star/dust particle field.
   */
  starReach?: number;

  intensity?: number;
  spread?: number;
  starDensity?: number;
  starBrightness?: number;
  accentMix?: number;
  className?: string;
};

type NebulaStar = {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  blur: number;
  stretch: number;
  delay: number;
};

type NebulaStyle = CSSProperties & {
  "--nebula-origin-x": string;
  "--nebula-origin-y": string;
  "--nebula-angle": string;
  "--nebula-intensity": number;
  "--nebula-haze-width": string;
  "--nebula-haze-height": string;
  "--nebula-star-width": string;
  "--nebula-star-height": string;
  "--nebula-spread-scale": number;
  "--nebula-bloom-width": string;
  "--nebula-bloom-height": string;
  "--nebula-accent-strength": string;
};

type StarStyle = CSSProperties & {
  "--star-x": string;
  "--star-y": string;
  "--star-size": string;
  "--star-opacity": number;
  "--star-blur": string;
  "--star-stretch": number;
  "--star-delay": string;
};

const MAX_STARS = 90;

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function seededUnit(index: number, salt: number) {
  const value = Math.sin(index * 97.13 + salt * 37.71) * 10000;
  return value - Math.floor(value);
}

function createStars(): NebulaStar[] {
  return Array.from({ length: MAX_STARS }, (_, index) => {
    const rawX = seededUnit(index + 1, 1);
    const rawY = seededUnit(index + 1, 2);
    const rawSize = seededUnit(index + 1, 3);
    const rawOpacity = seededUnit(index + 1, 4);
    const rawBlur = seededUnit(index + 1, 5);
    const rawStretch = seededUnit(index + 1, 6);
    const rawDelay = seededUnit(index + 1, 7);

    /*
      Bias x toward the origin side so the dust feels emitted from the product
      edge instead of evenly sprayed across a rectangle.
    */
    const x = Math.pow(rawX, 1.55) * 100;

    /*
      Keep most particles inside the central plume, with some natural drift.
    */
    const y = 12 + rawY * 76;

    return {
      id: index,
      x,
      y,
      size: 1 + rawSize * 2.25,
      opacity: 0.28 + rawOpacity * 0.72,
      blur: rawBlur > 0.72 ? 0.45 : 0,
      stretch: rawStretch > 0.78 ? 2.4 + rawStretch * 2.4 : 1,
      delay: rawDelay * 8,
    };
  });
}

const STAR_FIELD = createStars();

export function NebulaShowcase({
  children,
  origin = { x: 86, y: 55 },
  angle = -8,
  intensity = 60,
  reach = 55,
  hazeReach,
  starReach,
  spread = 42,
  starDensity = 34,
  starBrightness = 52,
  accentMix = 8,
  className,
}: NebulaShowcaseProps) {
  const safeIntensity = clamp(intensity);
  const safeReach = clamp(reach);
  const safeHazeReach = clamp(hazeReach ?? safeReach);
  const safeStarReach = clamp(starReach ?? safeReach);
  const safeSpread = clamp(spread);
  const safeStarDensity = clamp(starDensity);
  const safeStarBrightness = clamp(starBrightness);
  const safeAccentMix = clamp(accentMix);

  const intensityUnit = safeIntensity / 100;
  const spreadUnit = safeSpread / 100;

  const visibleStarCount = Math.round((safeStarDensity / 100) * MAX_STARS);
  const visibleStars = STAR_FIELD.slice(0, visibleStarCount);

  const nebulaStyle: NebulaStyle = {
    "--nebula-origin-x": `${clamp(origin.x)}%`,
    "--nebula-origin-y": `${clamp(origin.y)}%`,
    "--nebula-angle": `${angle}deg`,
    "--nebula-intensity": intensityUnit,

    /*
      Haze and stars are intentionally separate.
      The haze can stay close while particles travel farther, or vice versa.
    */
    "--nebula-haze-width": `${18 + safeHazeReach * 0.44}rem`,
    "--nebula-haze-height": `${9 + safeSpread * 0.26}rem`,
    "--nebula-star-width": `${14 + safeStarReach * 0.48}rem`,
    "--nebula-star-height": `${8 + safeSpread * 0.24}rem`,

    "--nebula-spread-scale": 0.78 + spreadUnit * 0.56,
    "--nebula-bloom-width": `${18 + safeHazeReach * 0.32}rem`,
    "--nebula-bloom-height": `${4.5 + safeSpread * 0.07}rem`,
    "--nebula-accent-strength": `${safeAccentMix}%`,
  };

  const classes = ["nebula-showcase", className ?? ""].filter(Boolean).join(" ");

  return (
    <div className={classes} style={nebulaStyle}>
      <span className="nebula-showcase__bloom" aria-hidden="true" />

      <span className="nebula-showcase__haze-field" aria-hidden="true">
        <span className="nebula-showcase__plume" />
        <span className="nebula-showcase__streaks" />
      </span>

      <span className="nebula-showcase__star-field" aria-hidden="true">
        <span className="nebula-showcase__stars">
          {visibleStars.map((star) => {
            const starOpacity =
              star.opacity * intensityUnit * (safeStarBrightness / 100);

            const starStyle: StarStyle = {
              "--star-x": `${star.x}%`,
              "--star-y": `${star.y}%`,
              "--star-size": `${star.size}px`,
              "--star-opacity": starOpacity,
              "--star-blur": `${star.blur}px`,
              "--star-stretch": star.stretch,
              "--star-delay": `${star.delay}s`,
            };

            return (
              <span
                className="nebula-showcase__star"
                key={star.id}
                style={starStyle}
              />
            );
          })}
        </span>
      </span>

      <div className="nebula-showcase__content">{children}</div>
    </div>
  );
}