"use client";

import { cn } from "@/lib/utils";
import { ArrowRight, BadgeIndianRupee, PieChart, Wallet } from "lucide-react";
import * as React from "react";

type Mode = "budgeted" | "spent" | "remaining";

function formatMoney(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export function HeroWidget({ className }: { className?: string }) {
  const [mode, setMode] = React.useState<Mode>("remaining");

  const cards = [
    { label: "Groceries", budgeted: 6000, spent: 3200 },
    { label: "Rent", budgeted: 22000, spent: 22000 },
    { label: "Eating Out", budgeted: 3000, spent: 2100 },
  ];

  const valueFor = (c: (typeof cards)[number]) => {
    const remaining = Math.max(0, c.budgeted - c.spent);
    if (mode === "budgeted") return c.budgeted;
    if (mode === "spent") return c.spent;
    return remaining;
  };

  const icon =
    mode === "budgeted" ? Wallet : mode === "spent" ? PieChart : BadgeIndianRupee;
  const Icon = icon;

  const modeLabel =
    mode === "budgeted" ? "Budgeted" : mode === "spent" ? "Spent" : "Remaining";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border",
        "bg-card shadow-sm shadow-black/10",
        className,
      )}
    >
      {/* subtle sheen */}
      <div className="pointer-events-none absolute inset-0 opacity-70 hero-sheen" />

      <div className="relative p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-muted-foreground">Interactive preview</div>
            <div className="text-lg font-semibold tracking-tight mt-0.5">
              Envelope clarity
            </div>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Click to switch views. This is what the workspace feels like—calm,
              verifiable, and actionable.
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl border border-border bg-background/70 flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {(["remaining", "spent", "budgeted"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs border transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                m === mode
                  ? "bg-primary text-primary-foreground border-transparent"
                  : "border-border bg-background hover:bg-muted",
              )}
            >
              {m === "budgeted" ? "Budgeted" : m === "spent" ? "Spent" : "Remaining"}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {cards.map((c) => {
            const v = valueFor(c);
            const pct = c.budgeted > 0 ? Math.min(1, c.spent / c.budgeted) : 0;
            return (
              <div key={c.label} className="rounded-xl border border-muted bg-container p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium">{c.label}</div>
                  <div className="text-sm font-semibold tabular-nums">
                    {modeLabel}: {formatMoney(v)}
                  </div>
                </div>
                <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary/80"
                    style={{ width: `${Math.round(pct * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <a
          href="/interactables"
          className={cn(
            "mt-5 inline-flex items-center gap-2 text-sm font-medium",
            "text-foreground hover:underline underline-offset-4",
          )}
        >
          Open the real workspace <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

