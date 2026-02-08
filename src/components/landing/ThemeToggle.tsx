"use client";

import { cn } from "@/lib/utils";
import { LaptopMinimal, Moon, Sun } from "lucide-react";
import * as React from "react";

type ThemeMode = "system" | "light" | "dark";

const STORAGE_KEY = "budget-analyzer.theme";

function getSystemPref(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches
    ? "dark"
    : "light";
}

function applyTheme(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const resolved = mode === "system" ? getSystemPref() : mode;
  root.classList.toggle("dark", resolved === "dark");
}

function readStoredMode(): ThemeMode {
  if (typeof window === "undefined") return "system";
  const v = window.localStorage.getItem(STORAGE_KEY);
  if (v === "light" || v === "dark" || v === "system") return v;
  return "system";
}

function writeStoredMode(mode: ThemeMode) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, mode);
}

export function ThemeToggle({ className }: { className?: string }) {
  const [mode, setMode] = React.useState<ThemeMode>("system");

  React.useEffect(() => {
    const stored = readStoredMode();
    setMode(stored);
    applyTheme(stored);

    // Keep in sync when system changes and user is in system mode.
    const mql = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mql) return;
    const onChange = () => {
      const current = readStoredMode();
      if (current === "system") applyTheme("system");
    };
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, []);

  const nextMode: ThemeMode =
    mode === "system" ? "dark" : mode === "dark" ? "light" : "system";

  const Icon =
    mode === "system" ? LaptopMinimal : mode === "dark" ? Moon : Sun;

  return (
    <button
      type="button"
      onClick={() => {
        setMode(nextMode);
        writeStoredMode(nextMode);
        applyTheme(nextMode);
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

