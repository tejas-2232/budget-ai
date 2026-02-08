"use client";

import { cn } from "@/lib/utils";
import { LaptopMinimal, Moon, Sun } from "lucide-react";
import * as React from "react";

const STORAGE_KEY = "budget-analyzer.theme";

/**
 * We intentionally do NOT apply a full dark theme across the app.
 * Instead we offer a subtle "night hint" mode that darkens backgrounds and
 * increases contrast in a few places while keeping the UI calm and readable.
 */
type HintMode = "system" | "calm" | "night";

function applyHintTheme(mode: HintMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("theme-night", mode === "night");
}

function readStoredMode(): HintMode {
  if (typeof window === "undefined") return "system";
  const v = window.localStorage.getItem(STORAGE_KEY);
  if (v === "system" || v === "calm" || v === "night") return v;
  return "system";
}

function writeStoredMode(mode: HintMode) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, mode);
}

export function ThemeToggle({ className }: { className?: string }) {
  const [mode, setMode] = React.useState<HintMode>("system");

  React.useEffect(() => {
    const stored = readStoredMode();
    setMode(stored);
    applyHintTheme(stored);
  }, []);

  const nextMode: HintMode =
    mode === "system" ? "night" : mode === "night" ? "calm" : "system";

  const Icon =
    mode === "system" ? LaptopMinimal : mode === "night" ? Moon : Sun;

  return (
    <button
      type="button"
      onClick={() => {
        setMode(nextMode);
        writeStoredMode(nextMode);
        applyHintTheme(nextMode);
      }}
      className={cn(
        "w-10 h-10 rounded-lg border border-border bg-background text-foreground",
        "transition-colors hover:bg-muted",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      aria-label={`Theme: ${mode}. Click to switch.`}
      title={`Theme: ${mode}`}
    >
      <Icon className="w-4 h-4 mx-auto" />
    </button>
  );
}

