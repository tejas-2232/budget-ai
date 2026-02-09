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
}: {
  done: boolean;
  title: string;
  body: string;
  icon: React.ReactNode;
  onClick: () => void;
  cta?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-muted bg-container p-3",
        "flex items-start gap-3",
      )}
    >
      <div className="mt-0.5 shrink-0">
        <div className="w-9 h-9 rounded-lg border border-border bg-background/70 flex items-center justify-center">
          {icon}
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
        </div>
        <div className="mt-1 text-sm text-muted-foreground leading-relaxed">
          {body}
        </div>
      </div>
      <button
        type="button"
        onClick={onClick}
        className="shrink-0 rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-muted"
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
      <div className="rounded-xl bg-card/90 p-4">
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
          />
          <Step
            done={categorizedEnough}
            title="2) Categorize uncategorized"
            body="Start with the uncategorized list. One category per transaction is enough."
            icon={<Tags className="w-4 h-4" />}
            onClick={() => onJump("categorize")}
            cta="Categorize"
          />
          <Step
            done={hasBudgets}
            title="3) Set envelope budgets"
            body="Edit numbers in the envelope board. Press Enter to save each row."
            icon={<WalletCards className="w-4 h-4" />}
            onClick={() => onJump("envelopes")}
            cta="Open envelopes"
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
          />
        </div>
      </div>
    </details>
  );
}

