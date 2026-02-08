"use client";

import * as React from "react";

export function useActiveSection(sectionIds: string[]) {
  const [activeId, setActiveId] = React.useState(sectionIds[0] ?? "home");

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the most visible intersecting entry
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));
        if (visible[0]?.target?.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        root: null,
        // Trigger slightly before the middle so nav feels responsive
        rootMargin: "-30% 0px -60% 0px",
        threshold: [0.05, 0.15, 0.3, 0.5, 0.75],
      },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sectionIds]);

  return activeId;
}

