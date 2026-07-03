// src/components/site/ScreenshotFrame.tsx

/**
 * File: src/components/site/ScreenshotFrame.tsx
 *
 * Purpose:
 * Shared screenshot/product-image display component for Spinalith.com.
 *
 * Responsibilities:
 * - Displays public website screenshots in a consistent branded frame.
 * - Supports multiple frame variants for fast visual testing.
 * - Keeps browser/window styling out of raw screenshot image files.
 * - Allows captions to be enabled only where they help the layout.
 *
 * Notes:
 * - Screenshot files should generally live in public/assets/screenshots/.
 * - Pass public asset paths like /assets/screenshots/home/hero-tpv.png.
 * - Do not bake browser chrome, shadows, glow, or perspective into the image itself.
 */

export type ScreenshotFrameVariant =
  | "browserGlow"
  | "browserClean"
  | "browserAngle"
  | "originalHero"
  | "glassCard"
  | "appWindow"
  | "minimal"
  | "flat"
  | "primaryColorEdge"
  | "primaryColorHalo"
  | "primaryColorTilt";

type ScreenshotFrameProps = {
  src: string;
  alt: string;
  variant?: ScreenshotFrameVariant;
  caption?: string;
  showCaption?: boolean;
  className?: string;
  imageClassName?: string;
  eager?: boolean;
};

const variantClassMap: Record<ScreenshotFrameVariant, string> = {
  browserGlow: "screenshot-frame--browser-glow",
  browserClean: "screenshot-frame--browser-clean",
  browserAngle: "screenshot-frame--browser-angle",
  glassCard: "screenshot-frame--glass-card",
  appWindow: "screenshot-frame--app-window",
  minimal: "screenshot-frame--minimal",
  flat: "screenshot-frame--flat",
  originalHero: "screenshot-frame--original-hero",
  primaryColorEdge: "screenshot-frame--primary-color-edge",
  primaryColorHalo: "screenshot-frame--primary-color-halo",
  primaryColorTilt: "screenshot-frame--primary-color-tilt",
};

export function ScreenshotFrame({
  src,
  alt,
  variant = "browserGlow",
  caption,
  showCaption = false,
  className,
  imageClassName,
  eager = false,
}: ScreenshotFrameProps) {
  const frameClasses = [
    "screenshot-frame",
    variantClassMap[variant],
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const imageClasses = ["screenshot-frame__image", imageClassName ?? ""]
    .filter(Boolean)
    .join(" ");

  const shouldShowCaption = showCaption && Boolean(caption);

  return (
    <figure className={frameClasses}>
      <div className="screenshot-frame__chrome" aria-hidden="true">
        <span className="screenshot-frame__dot screenshot-frame__dot--red" />
        <span className="screenshot-frame__dot screenshot-frame__dot--yellow" />
        <span className="screenshot-frame__dot screenshot-frame__dot--green" />
      </div>

      <div className="screenshot-frame__media">
        <img
          className={imageClasses}
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
        />
      </div>

      {shouldShowCaption ? (
        <figcaption className="screenshot-frame__caption">{caption}</figcaption>
      ) : null}
    </figure>
  );
}