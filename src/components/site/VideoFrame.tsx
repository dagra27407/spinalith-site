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
 * - Provides accessible video names and longer descriptive text for screen readers.
 * - Provides an unobtrusive hover/focus action layer for video controls.
 * - Respects the user's reduced-motion preference.
 *
 * Accessibility behavior:
 * - Normal users retain the intended autoplaying, muted, looping product demos.
 * - Users with prefers-reduced-motion: reduce start with the video paused.
 * - A keyboard-accessible Pause / Play control appears when the frame is
 *   hovered or receives keyboard focus.
 * - The control uses a real <button> and provides a changing accessible label.
 *
 * Future extension:
 * - The video-frame__actions layer is intentionally reusable.
 * - Future controls such as enlarge/fullscreen, replay, captions, or transcript
 *   actions can be added alongside the existing Pause / Play control without
 *   changing the basic VideoFrame API or page layouts.
 *
 * Notes:
 * - Video files should generally live in public/assets/videos/.
 * - Pass public asset paths like /assets/videos/features/example.mp4.
 * - Keep section-specific placement and sizing outside this component.
 * - Keep section-specific accessibility descriptions in the section that owns
 *   the video.
 * - CSS lives in src/styles/components/videoFrame.css.
 * - Shared colors and visual behavior should use semantic design tokens.
 */

import {
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import {
  Pause,
  Play,
} from "lucide-react";

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

/**
 * VideoFrame
 *
 * Renders a reusable Spinalith product/demo video frame.
 *
 * The component deliberately manages autoplay in JavaScript instead of placing
 * the autoPlay attribute directly on the <video>. This allows us to inspect the
 * user's reduced-motion preference before beginning playback.
 *
 * Users who have not requested reduced motion receive the existing marketing
 * experience: muted videos begin playing automatically when autoPlay is true.
 *
 * Users who have requested reduced motion see the video's resting/first frame
 * until they explicitly choose Play.
 */
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
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isPaused, setIsPaused] = useState(true);

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

  /**
   * Initial autoplay / reduced-motion behavior.
   *
   * - If reduced motion is requested, leave the video paused.
   * - Otherwise, honor the component's autoPlay prop.
   * - If the user's OS/browser preference changes to reduced motion while the
   *   page is open, pause the video automatically.
   */
  useEffect(() => {
    const video = videoRef.current;

    if (!video || typeof window === "undefined") {
      return;
    }

    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const applyMotionPreference = () => {
      if (motionPreference.matches) {
        video.pause();
        setIsPaused(true);
        return;
      }

      if (autoPlay) {
        void video.play().catch(() => {
          /**
           * Browsers may reject autoplay under their own media policies.
           * In that case, the video simply remains paused and the Play control
           * remains available.
           */
          setIsPaused(true);
        });
      }
    };

    applyMotionPreference();

    motionPreference.addEventListener(
      "change",
      applyMotionPreference,
    );

    return () => {
      motionPreference.removeEventListener(
        "change",
        applyMotionPreference,
      );
    };
  }, [autoPlay, src]);

  /**
   * togglePlayback
   *
   * Allows mouse, touch, keyboard, and assistive-technology users to manually
   * pause or resume the looping product demonstration.
   */
  async function togglePlayback() {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (video.paused) {
      try {
        await video.play();
      } catch {
        setIsPaused(true);
      }

      return;
    }

    video.pause();
  }

  return (
    <figure className={frameClasses}>
      <div className="video-frame__shell">
        <video
          ref={videoRef}
          className={videoClasses}
          loop={loop}
          muted={muted}
          playsInline={playsInline}
          preload={preload}
          aria-label={ariaLabel}
          aria-describedby={
            shouldShowDescription ? descriptionId : undefined
          }
          onPlay={() => setIsPaused(false)}
          onPause={() => setIsPaused(true)}
        >
          <source src={src} type="video/mp4" />
        </video>

        <div
          className="video-frame__actions"
          aria-label="Video controls"
        >
          <button
            type="button"
            className="video-frame__action-button"
            onClick={togglePlayback}
            aria-label={isPaused ? "Play video" : "Pause video"}
            title={isPaused ? "Play video" : "Pause video"}
          >
            {isPaused ? (
              <Play size={16} aria-hidden="true" />
            ) : (
              <Pause size={16} aria-hidden="true" />
            )}
          </button>
        </div>
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