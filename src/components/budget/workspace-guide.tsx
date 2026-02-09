"use client";

import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Circle,
  Sparkles,
  ArrowRight,
  Eye,
  FolderUp,
  Tags,
  WalletCards,
} from "lucide-react";
import * as React from "react";

export type WorkspaceGuideStats = {
  txInMonth: number;
  uncategorizedInMonth: number;
  budgetsInMonth: number;
};

export type WorkspaceGuideProps = {
  month: string;
  stats: WorkspaceGuideStats;
  showAdvanced: boolean;
  setShowAdvanced: (next: boolean) => void;
  onJump: (id: string) => void;
  className?: string;
};

const LS_KEY = "budget-analyzer:workspace-guide:dismissed:v1";

function useDismissed() {
  const [dismissed, setDismissed] = React.useState(false);
  React.useEffect(() => {
    try {
      setDismissed(localStorage.getItem(LS_KEY) === "1");
    } catch {
      // ignore
    }
  }, []);
  const dismiss = React.useCallback(() => {
    setDismissed(true);
    try {
      localStorage.setItem(LS_KEY, "1");
    } catch {
      // ignore
    }
  }, []);
  return { dismissed, dismiss };
}

function Step({
  done,
  title,
  body,
  icon,
  onClick,
  cta = "Go",
  tone,
}: {
  done: boolean;
  title: string;
  body: string;
  icon: React.ReactNode;
  onClick: () => void;
  cta?: string;
  tone: "green" | "cyan" | "amber" | "purple";
}) {
  const toneVars: Record<
    "green" | "cyan" | "amber" | "purple",
    React.CSSProperties
  > = {
    green: {
      ["--rh-a" as any]: "oklch(0.78 0.16 150 / 0.55)",
      ["--rh-b" as any]: "oklch(0.78 0.14 195 / 0.45)",
      ["--rh-c" as any]: "oklch(0.86 0.12 60 / 0.35)",
    },
    cyan: {
      ["--rh-a" as any]: "oklch(0.78 0.14 195 / 0.55)",
      ["--rh-b" as any]: "oklch(0.68 0.12 230 / 0.42)",
      ["--rh-c" as any]: "oklch(0.86 0.12 60 / 0.28)",
    },
    amber: {
      ["--rh-a" as any]: "oklch(0.86 0.12 60 / 0.55)",
      ["--rh-b" as any]: "oklch(0.78 0.16 150 / 0.35)",
      ["--rh-c" as any]: "oklch(0.72 0.12 300 / 0.28)",
    },
    purple: {
      ["--rh-a" as any]: "oklch(0.72 0.12 300 / 0.50)",
      ["--rh-b" as any]: "oklch(0.78 0.14 195 / 0.35)",
      ["--rh-c" as any]: "oklch(0.86 0.12 60 / 0.28)",
    },
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-background/60 backdrop-blur p-3",
        "rh-step",
        "flex items-start gap-3",
      )}
      style={toneVars[tone]}
    >
      <div className="mt-0.5 shrink-0">
        <div className="w-9 h-9 rounded-xl border border-border bg-background/70 flex items-center justify-center rh-chip">
          <span className="text-foreground">{icon}</span>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {done ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <Circle className="w-4 h-4 text-muted-foreground" />
          )}
          <div className="font-medium truncate">{title}</div>
          <span className={cn("ml-auto text-[11px] px-2 py-0.5 rounded-full rh-chip text-muted-foreground")}>
            {done ? "Done" : "Next"}
          </span>
        </div>
        <div className="mt-1 text-sm text-muted-foreground leading-relaxed">
          {body}
        </div>
      </div>
      <button
        type="button"
        onClick={onClick}
        className="shrink-0 rounded-md border border-border bg-background/80 backdrop-blur px-3 py-2 text-sm hover:bg-muted rh-chip"
      >
        <span className="inline-flex items-center gap-1.5">
          {cta} <ArrowRight className="w-4 h-4" />
        </span>
      </button>
    </div>
  );
}

export function WorkspaceGuide({
  month,
  stats,
  showAdvanced,
  setShowAdvanced,
  onJump,
  className,
}: WorkspaceGuideProps) {
  const { dismissed, dismiss } = useDismissed();

  const hasData = stats.txInMonth > 0;
  const categorizedEnough = hasData && stats.uncategorizedInMonth === 0;
  const hasBudgets = stats.budgetsInMonth > 0;

  const defaultOpen = !dismissed && (!hasData || !categorizedEnough || !hasBudgets);

  return (
    <details
      open={defaultOpen}
      className={cn("gradient-border rounded-xl p-[1px]", className)}
    >
      <div className="rounded-xl rh-panel p-4">
        <summary className="cursor-pointer select-none">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm text-muted-foreground">Quickstart</div>
              <div className="text-lg font-semibold tracking-tight inline-flex items-center gap-2">
                What to do next <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Month: <span className="font-medium">{month}</span> • {stats.txInMonth} tx •{" "}
                {stats.uncategorizedInMonth} uncategorized
              </div>
            </div>

            {!dismissed && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  dismiss();
                }}
                className="px-3 py-2 rounded-md text-sm border border-border bg-background hover:bg-muted"
                title="Hide this guide"
              >
                Got it
              </button>
            )}
          </div>
        </summary>

        <div className="mt-4 grid grid-cols-1 gap-3">
          <Step
            done={hasData}
            title="1) Import a CSV"
            body="Use “Load big sample” to try it instantly, or upload your own CSV."
            icon={<FolderUp className="w-4 h-4" />}
            onClick={() => onJump("import")}
            cta="Open import"
            tone="green"
          />
          <Step
            done={categorizedEnough}
            title="2) Categorize uncategorized"
            body="Start with the uncategorized list. One category per transaction is enough."
            icon={<Tags className="w-4 h-4" />}
            onClick={() => onJump("categorize")}
            cta="Categorize"
            tone="cyan"
          />
          <Step
            done={hasBudgets}
            title="3) Set envelope budgets"
            body="Edit numbers in the envelope board. Press Enter to save each row."
            icon={<WalletCards className="w-4 h-4" />}
            onClick={() => onJump("envelopes")}
            cta="Open envelopes"
            tone="amber"
          />
          <Step
            done={showAdvanced}
            title="4) Review insights"
            body="Turn on graphs and trends once you’ve imported and categorized."
            icon={<Eye className="w-4 h-4" />}
            onClick={() => {
              if (!showAdvanced) setShowAdvanced(true);
              onJump("insights");
            }}
            cta={showAdvanced ? "View" : "Enable"}
            tone="purple"
          />
        </div>
      </div>
    </details>
  );
}

