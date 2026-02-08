"use client";

import * as React from "react";

type PointerSpotlightProps = {
  /** CSS selector for the element to paint spotlight on */
  targetRef: React.RefObject<HTMLElement | null>;
  disabled?: boolean;
};

function prefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

export function PointerSpotlight({ targetRef, disabled }: PointerSpotlightProps) {
  React.useEffect(() => {
    const el = targetRef.current;
    if (!el) return;
    if (disabled) return;
    if (prefersReducedMotion()) return;

    let raf = 0;
    let lastX = 0.5;
    let lastY = 0.25;

    const setVars = (x: number, y: number) => {
      el.style.setProperty("--spot-x", `${Math.round(x)}px`);
      el.style.setProperty("--spot-y", `${Math.round(y)}px`);
    };

    // Initialize to a calm default
    const rect = el.getBoundingClientRect();
    setVars(rect.width * lastX, rect.height * lastY);

    const onMove = (ev: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = ev.clientX - r.left;
      const y = ev.clientY - r.top;
      lastX = x / Math.max(1, r.width);
      lastY = y / Math.max(1, r.height);

      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setVars(x, y));
    };

    const onLeave = () => {
      const r = el.getBoundingClientRect();
      const x = r.width * 0.5;
      const y = r.height * 0.25;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setVars(x, y));
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [targetRef, disabled]);

  return null;
}

