"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

/**
 * Optional background media for the landing hero.
 *
 * To enable:
 * - Add `public/hero-bg.webm` (recommended) or `public/hero-bg.mp4`
 * - Or add `public/hero-bg.gif`
 *
 * If files are missing, this component auto-hides and falls back to gradients.
 */
export function HeroMedia({ className }: { className?: string }) {
  const [showVideo, setShowVideo] = React.useState(true);
  const [showGif, setShowGif] = React.useState(true);

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none",
        className,
      )}
      aria-hidden="true"
    >
      {/* Video layer (best performance). Auto hides on error. */}
      {showVideo && (
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-30 dark:opacity-25 hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onError={() => setShowVideo(false)}
        >
          <source src="/hero-bg.webm" type="video/webm" />
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>
      )}

      {/* GIF fallback layer (heavier). Only shows if video failed. */}
      {!showVideo && showGif && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/hero-bg.gif"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20 dark:opacity-15 hero-video"
          onError={() => setShowGif(false)}
        />
      )}

      {/* Overlay to keep text readable */}
      <div className="absolute inset-0 hero-media-overlay" />
    </div>
  );
}

