// src/components/site/ScreenshotFrame_3X.tsx

/**
 * File: src/components/site/ScreenshotFrame_3X.tsx
 *
 * Purpose:
 * Composes three ScreenshotFrame instances into a configurable overlapping
 * product-screenshot presentation.
 *
 * Responsibilities:
 * - Displays three independently positioned screenshot frames.
 * - Supports back, middle, and front depth levels.
 * - Allows each frame to move horizontally and vertically.
 * - Allows each frame to tilt in 3D using the Y axis.
 * - Allows optional flat rotation and scale adjustments.
 * - Reuses the existing ScreenshotFrame variants and browser chrome.
 *
 * Positioning:
 * - x and y are pixel offsets from each slot's default location.
 * - tilt is a rotateY value in degrees.
 * - rotate is a flat rotateZ value in degrees.
 * - scale defaults according to depth but may be overridden.
 *
 * Notes:
 * - Array/render order does not determine visual depth.
 * - The depth prop controls z-index and default scale.
 * - Mobile layouts collapse into a simple stacked presentation.
 */

import type { CSSProperties } from "react";

import {
  ScreenshotFrame,
  type ScreenshotFrameVariant,
} from "@/components/site/ScreenshotFrame";

export type ScreenshotFrame3XDepth = "back" | "middle" | "front";

export type ScreenshotFrame3XItem = {
  src: string;
  alt: string;

  /**
   * Controls the frame's visual stacking level.
   *
   * back   = z-index 1
   * middle = z-index 2
   * front  = z-index 3
   */
  depth?: ScreenshotFrame3XDepth;

  /**
   * Horizontal offset from the slot's default position, in pixels.
   *
   * Negative values move left.
   * Positive values move right.
   */
  x?: number;

  /**
   * Vertical offset from the vertical center, in pixels.
   *
   * Negative values raise the frame.
   * Positive values lower the frame.
   */
  y?: number;

 /**
   * Frame width as a percentage of the composition canvas.
   */
  width?: number;

  /**
   * 3D inward/outward tilt using rotateY, in degrees.
   */
  tilt?: number;

  /**
   * Optional flat clockwise/counterclockwise rotation, in degrees.
   *
   * Negative values rotate counterclockwise.
   * Positive values rotate clockwise.
   */
  rotate?: number;

  /**
   * Optional scale override.
   *
   * Examples:
   * 0.9 = 90%
   * 1 = 100%
   * 1.05 = 105%
   */
  scale?: number;

  variant?: ScreenshotFrameVariant;
  caption?: string;
  showCaption?: boolean;
  className?: string;
  imageClassName?: string;
};

type ScreenshotFrame3XProps = {
  left: ScreenshotFrame3XItem;
  center: ScreenshotFrame3XItem;
  right: ScreenshotFrame3XItem;
  className?: string;
  eager?: boolean;
};

type ScreenshotFrame3XSlot = "left" | "center" | "right";

const defaultVariantMap: Record<
  ScreenshotFrame3XSlot,
  ScreenshotFrameVariant
> = {
  left: "primaryColorEdge",
  center: "browserGlow",
  right: "primaryColorEdge",
};

const defaultDepthMap: Record<
  ScreenshotFrame3XSlot,
  ScreenshotFrame3XDepth
> = {
  left: "back",
  center: "front",
  right: "middle",
};

const defaultScaleMap: Record<ScreenshotFrame3XDepth, number> = {
  back: 0.9,
  middle: 0.95,
  front: 1,
};

function buildItemStyle(
  item: ScreenshotFrame3XItem,
  depth: ScreenshotFrame3XDepth
): CSSProperties {
  return {
    "--screenshot-frame-3x-x": `${item.x ?? 0}%`,
    "--screenshot-frame-3x-y": `${item.y ?? 0}%`,
    "--screenshot-frame-3x-width": `${item.width ?? 64}%`,
    "--screenshot-frame-3x-tilt": `${item.tilt ?? 0}deg`,
    "--screenshot-frame-3x-rotate": `${item.rotate ?? 0}deg`,
    "--screenshot-frame-3x-scale": `${
      item.scale ?? defaultScaleMap[depth]
    }`,
  } as CSSProperties;
}

function buildItemClassName(
  slot: ScreenshotFrame3XSlot,
  item: ScreenshotFrame3XItem,
  depth: ScreenshotFrame3XDepth
) {
  return [
    "screenshot-frame-3x__item",
    `screenshot-frame-3x__item--${slot}`,
    `screenshot-frame-3x__item--depth-${depth}`,
    item.className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

function renderScreenshot(
  slot: ScreenshotFrame3XSlot,
  item: ScreenshotFrame3XItem,
  eager: boolean
) {
  const depth = item.depth ?? defaultDepthMap[slot];

  return (
    <div
      className={buildItemClassName(slot, item, depth)}
      style={buildItemStyle(item, depth)}
    >
      <ScreenshotFrame
        src={item.src}
        alt={item.alt}
        variant={item.variant ?? defaultVariantMap[slot]}
        caption={item.caption}
        showCaption={item.showCaption}
        imageClassName={item.imageClassName}
        eager={eager}
      />
    </div>
  );
}

export function ScreenshotFrame_3X({
  left,
  center,
  right,
  className,
  eager = false,
}: ScreenshotFrame3XProps) {
  const rootClassName = [
    "screenshot-frame-3x",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClassName}>
      {renderScreenshot("left", left, eager)}
      {renderScreenshot("center", center, eager)}
      {renderScreenshot("right", right, eager)}
    </div>
  );
}