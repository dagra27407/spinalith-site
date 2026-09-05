// src/components/site/VideoFrame.tsx

/**
 * File: src/components/site/VideoFrame.tsx
 *
 * Purpose:
 * Shared branded video display component for Spinalith.com marketing sections.
 *
 * Responsibilities:
 * - Displays public marketing videos in a consistent branded frame.
 * - Supports multiple frame variants for flexible product presentation.
 * - Keeps video shell styling, caption behavior, and media settings reusable.
 * - Provides sensible autoplay, loop, muted, and inline-playback defaults.
 * - Supports accessible video names and longer descriptive text for screen readers.
 *
 * Notes:
 * - Video files should generally live in public/assets/videos/.
 * - Pass public asset paths like /assets/videos/features/example.mp4.
 * - Keep section-specific placement and sizing outside this component.
 * - Keep section-specific accessibility descriptions in the section that owns the video.
 * - CSS lives in src/styles/components/videoFrame.css.
 * - Shared colors and visual behavior should use semantic design tokens.
 */

import { useId } from "react";

type VideoFrameVariant =
  | "productGlow"
  | "productClean"
  | "minimal";

type VideoFrameProps = {
  src: string;
  ariaLabel: string;
  ariaDescription?: string;
  caption?: string;
  showCaption?: boolean;
  variant?: VideoFrameVariant;
  className?: string;
  videoClassName?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  preload?: "none" | "metadata" | "auto";
};

const variantClassMap: Record<VideoFrameVariant, string> = {
  productGlow: "video-frame--product-glow",
  productClean: "video-frame--product-clean",
  minimal: "video-frame--minimal",
};

export function VideoFrame({
  src,
  ariaLabel,
  ariaDescription,
  caption,
  showCaption = false,
  variant = "productGlow",
  className,
  videoClassName,
  autoPlay = true,
  loop = true,
  muted = true,
  playsInline = true,
  preload = "metadata",
}: VideoFrameProps) {
  const descriptionId = useId();

  const frameClasses = [
    "video-frame",
    variantClassMap[variant],
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const videoClasses = [
    "video-frame__video",
    videoClassName ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const shouldShowCaption = showCaption && Boolean(caption);
  const shouldShowDescription = Boolean(ariaDescription);

  return (
    <figure className={frameClasses}>
      <div className="video-frame__shell">
        <video
          className={videoClasses}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline={playsInline}
          preload={preload}
          aria-label={ariaLabel}
          aria-describedby={
            shouldShowDescription ? descriptionId : undefined
          }
        >
          <source src={src} type="video/mp4" />
        </video>
      </div>

      {shouldShowDescription ? (
        <p
          id={descriptionId}
          className="sr-only"
        >
          {ariaDescription}
        </p>
      ) : null}

      {shouldShowCaption ? (
        <figcaption className="video-frame__caption">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

export default VideoFrame;