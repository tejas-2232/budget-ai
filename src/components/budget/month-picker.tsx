"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";

export type MonthPickerProps = {
  value: string;
  months: string[]; // ascending: ["2025-07", ..., "2026-01"]
  onChange: (next: string) => void;
  label?: string;
  className?: string;
  dense?: boolean;
};

export function MonthPicker({
  value,
  months,
  onChange,
  label = "Month",
  className,
  dense,
}: MonthPickerProps) {
  const idx = months.indexOf(value);
  const hasPrev = idx > 0;
  const hasNext = idx >= 0 && idx < months.length - 1;

  const padding = dense ? "px-2 py-1" : "px-2.5 py-1.5";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-xs text-muted-foreground">{label}</span>

      <div className="gradient-border rounded-lg p-[1px]">
        <div className={cn("rounded-lg bg-background/80 backdrop-blur flex items-center gap-1.5", padding)}>
          <button
            type="button"
            onClick={() => {
              if (!hasPrev) return;
              onChange(months[idx - 1]!);
            }}
            disabled={!hasPrev}
            className={cn(
              "rounded-md border border-border bg-background/70 hover:bg-muted transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              dense ? "p-1" : "p-1.5",
            )}
            aria-label="Previous month"
            title="Previous month"
          >
            <ChevronLeft className={dense ? "w-3.5 h-3.5" : "w-4 h-4"} />
          </button>

          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              "min-w-[124px] rounded-md border border-border bg-background/70 hover:bg-muted transition-colors",
              "text-sm",
              dense ? "px-2 py-1" : "px-2.5 py-1.5",
            )}
            aria-label="Select month"
          >
            {months.length === 0 ? (
              <option value={value}>{value}</option>
            ) : (
              [...months].reverse().map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))
            )}
          </select>

          <button
            type="button"
            onClick={() => {
              if (!hasNext) return;
              onChange(months[idx + 1]!);
            }}
            disabled={!hasNext}
            className={cn(
              "rounded-md border border-border bg-background/70 hover:bg-muted transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              dense ? "p-1" : "p-1.5",
            )}
            aria-label="Next month"
            title="Next month"
          >
            <ChevronRight className={dense ? "w-3.5 h-3.5" : "w-4 h-4"} />
          </button>
        </div>
      </div>
    </div>
  );
}

