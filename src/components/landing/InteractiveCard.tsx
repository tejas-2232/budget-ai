"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

type InteractiveCardDivProps = React.HTMLAttributes<HTMLDivElement> & {
  as?: "div";
  href?: never;
};

type InteractiveCardAnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  as: "a";
  href: string;
};

type InteractiveCardProps = (InteractiveCardDivProps | InteractiveCardAnchorProps) & {
  className?: string;
};

function prefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

export function InteractiveCard({
  className,
  as = "div",
  href,
  ...props
}: InteractiveCardProps) {
  const ref = React.useRef<HTMLElement | null>(null);
  const [isMotionOk, setIsMotionOk] = React.useState(false);

  React.useEffect(() => {
    setIsMotionOk(!prefersReducedMotion());
  }, []);

  const onMove = React.useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (!isMotionOk) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / Math.max(1, r.width);
    const py = (e.clientY - r.top) / Math.max(1, r.height);
    const dx = (px - 0.5) * 4; // px
    const dy = (py - 0.5) * 4;
    el.style.setProperty("--tilt-x", `${dx.toFixed(2)}px`);
    el.style.setProperty("--tilt-y", `${dy.toFixed(2)}px`);
  }, [isMotionOk]);

  const onLeave = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tilt-x", "0px");
    el.style.setProperty("--tilt-y", "0px");
  }, []);

  const sharedClassName = cn(
    "relative rounded-xl border border-border bg-card",
    "shadow-sm shadow-black/5",
    "transition-[transform,box-shadow,border-color] duration-200",
    "hover:shadow-md hover:shadow-black/10 hover:border-border/80",
    "[transform:translate3d(var(--tilt-x,0px),var(--tilt-y,0px),0)]",
    className,
  );

  const handleMove = (e: React.PointerEvent<HTMLElement>) => {
    onMove(e);
    // Fan out to consumer handlers (typed differently for div vs anchor)
    if (as === "a") {
      (props as InteractiveCardAnchorProps).onPointerMove?.(
        e as unknown as React.PointerEvent<HTMLAnchorElement>,
      );
    } else {
      (props as InteractiveCardDivProps).onPointerMove?.(
        e as unknown as React.PointerEvent<HTMLDivElement>,
      );
    }
  };

  const handleLeave = (e: React.PointerEvent<HTMLElement>) => {
    onLeave();
    if (as === "a") {
      (props as InteractiveCardAnchorProps).onPointerLeave?.(
        e as unknown as React.PointerEvent<HTMLAnchorElement>,
      );
    } else {
      (props as InteractiveCardDivProps).onPointerLeave?.(
        e as unknown as React.PointerEvent<HTMLDivElement>,
      );
    }
  };

  if (as === "a") {
    const anchorProps = props as InteractiveCardAnchorProps;
    return (
      <a
        {...anchorProps}
        href={href}
        ref={(node) => {
          ref.current = node;
        }}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        className={sharedClassName}
      />
    );
  }

  const divProps = props as InteractiveCardDivProps;
  return (
    <div
      {...divProps}
      ref={(node) => {
        ref.current = node;
      }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={sharedClassName}
    />
  );
}

