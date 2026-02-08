"use client";

import { cn } from "@/lib/utils";
import {
  Database,
  FileSpreadsheet,
  Lock,
  Sparkles,
  Target,
  WandSparkles,
} from "lucide-react";
import * as React from "react";

type Badge = {
  id: string;
  label: string;
  detail: string;
  Icon: React.ComponentType<{ className?: string }>;
  className: string;
  floatDelayClass: string;
};

const BADGES: Badge[] = [
  {
    id: "local",
    label: "Local-first",
    detail: "Saved in your browser. No account required.",
    Icon: Lock,
    className: "top-8 right-6",
    floatDelayClass: "[animation-delay:-0.5s]",
  },
  {
    id: "csv",
    label: "CSV import",
    detail: "Preview columns before anything is saved.",
    Icon: FileSpreadsheet,
    className: "top-36 right-12",
    floatDelayClass: "[animation-delay:-2s]",
  },
  {
    id: "envelopes",
    label: "Envelopes",
    detail: "Monthly budgets per category for clarity.",
    Icon: Target,
    className: "bottom-10 right-8",
    floatDelayClass: "[animation-delay:-1.2s]",
  },
  {
    id: "assistant",
    label: "Assistant",
    detail: "Ask to categorize, summarize, or build charts.",
    Icon: WandSparkles,
    className: "bottom-28 right-20",
    floatDelayClass: "[animation-delay:-3s]",
  },
];

export function FloatingIcons({
  className,
}: {
  className?: string;
}) {
  const [openId, setOpenId] = React.useState<string | null>(null);

  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none hidden lg:block",
        className,
      )}
      aria-hidden="true"
    >
      {BADGES.map((b) => (
        <div
          key={b.id}
          className={cn(
            "absolute",
            b.className,
            "pointer-events-auto",
          )}
        >
          <button
            type="button"
            onClick={() => setOpenId((v) => (v === b.id ? null : b.id))}
            className={cn(
              "float-soft",
              b.floatDelayClass,
              "group inline-flex items-center gap-2",
              "rounded-full px-3 py-2",
              "gradient-border shadow-sm shadow-black/10",
              "bg-card/80 backdrop-blur",
              "text-sm font-medium",
              "hover:shadow-md hover:shadow-black/15",
              "transition-[box-shadow,transform] duration-200",
              openId === b.id && "ring-2 ring-primary/40",
            )}
            aria-label={b.label}
          >
            <b.Icon className="w-4 h-4 text-primary" />
            <span className="text-foreground">{b.label}</span>
            <Sparkles className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <div
            className={cn(
              "mt-2 max-w-[260px]",
              "rounded-xl border border-border bg-card/90 backdrop-blur px-3 py-2",
              "text-xs text-muted-foreground leading-relaxed shadow-sm shadow-black/10",
              "transition-all duration-200",
              openId === b.id
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-1 pointer-events-none",
            )}
          >
            {b.detail}
          </div>
        </div>
      ))}

      {/* One subtle decorative icon */}
      <div className="absolute top-24 right-48 opacity-70 float-soft [animation-delay:-1.6s]">
        <div className="w-12 h-12 rounded-2xl border border-border bg-card/70 backdrop-blur flex items-center justify-center shadow-sm shadow-black/10">
          <Database className="w-5 h-5 text-primary" />
        </div>
      </div>
    </div>
  );
}

