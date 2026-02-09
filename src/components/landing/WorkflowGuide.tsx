"use client";

import { cn } from "@/lib/utils";
import { ArrowRight, FolderUp, Tags, WalletCards, LineChart } from "lucide-react";
import * as React from "react";

const STEPS = [
  {
    id: "import",
    title: "Import a CSV",
    icon: FolderUp,
    body: "Load the big sample (recommended) or upload your own CSV. Confirm the required column mapping before saving anything.",
    cta: { label: "Open workspace → Import", href: "/interactables#import" },
  },
  {
    id: "categorize",
    title: "Categorize transactions",
    icon: Tags,
    body: "Start with the uncategorized list. One category per transaction is enough. Use the assistant for batch rules (e.g. Amazon → Shopping).",
    cta: { label: "Go to Uncategorized", href: "/interactables#categorize" },
  },
  {
    id: "envelopes",
    title: "Set envelope budgets",
    icon: WalletCards,
    body: "Edit the envelope board for the month. Press Enter to save each budget line. Budgeted / spent / remaining updates instantly.",
    cta: { label: "Go to Envelopes", href: "/interactables#envelopes" },
  },
  {
    id: "insights",
    title: "Review insights",
    icon: LineChart,
    body: "Turn on Advanced insights to see category spend + daily trends. This makes sense once you’ve imported + categorized.",
    cta: { label: "Go to Insights", href: "/interactables#insights" },
  },
] as const;

export function WorkflowGuide({ className }: { className?: string }) {
  const [active, setActive] = React.useState<(typeof STEPS)[number]["id"]>("import");
  const current = STEPS.find((s) => s.id === active) ?? STEPS[0];

  return (
    <div className={cn("gradient-border rounded-2xl p-[1px]", className)}>
      <div className="rounded-2xl bg-card/80 p-5 md:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm text-muted-foreground">How to use this app</div>
            <div className="text-2xl font-semibold tracking-tight">
              Import → categorize → set envelopes → review
            </div>
            <div className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-2xl">
              This is a local-first workflow. If you ever feel lost in the workspace,
              come back to this checklist: it maps 1:1 to the sections you’ll see.
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5 space-y-2">
            {STEPS.map((s) => {
              const Icon = s.icon;
              const isActive = s.id === active;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActive(s.id)}
                  className={cn(
                    "w-full text-left rounded-xl border transition-colors p-4",
                    isActive
                      ? "border-border bg-background/70"
                      : "border-muted bg-container hover:bg-muted/40",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg border border-border bg-background/70 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold">{s.title}</div>
                      <div className="mt-1 text-sm text-muted-foreground leading-relaxed">
                        {s.body}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-xl border border-border bg-background/60 backdrop-blur p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl border border-border bg-background/70 flex items-center justify-center">
                  <current.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Right now</div>
                  <div className="text-xl font-semibold tracking-tight">
                    {current.title}
                  </div>
                </div>
              </div>
              <div className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {current.body}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <a
                  href={current.cta.href}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium",
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                  )}
                >
                  <span className="inline-flex items-center gap-2">
                    {current.cta.label} <ArrowRight className="w-4 h-4" />
                  </span>
                </a>
                <a
                  href="/interactables"
                  className="px-4 py-2 rounded-md text-sm font-medium border border-border hover:bg-muted"
                >
                  Open workspace
                </a>
              </div>

              <div className="mt-4 text-xs text-muted-foreground">
                Tip: after import, the workspace will jump you to “Uncategorized transactions”.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

