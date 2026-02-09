"use client";

import { cn } from "@/lib/utils";
import { useBudgetState } from "@/lib/budget/store";
import {
  getCurrentMonthYyyyMm,
  listEnvelopeSummaryFromState,
} from "@/services/budget/queries";
import { setMonthlyBudget } from "@/services/budget/model";
import { z } from "zod";
import * as React from "react";

export const envelopeBoardSchema = z.object({
  month: z
    .string()
    .optional()
    .describe('Target month in "YYYY-MM" format (defaults to current month)'),
  title: z.string().optional().describe("Optional heading"),
});

export type EnvelopeBoardProps = z.infer<typeof envelopeBoardSchema> & {
  className?: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function formatMoney(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function EnvelopeBoard({ month, title, className }: EnvelopeBoardProps) {
  const state = useBudgetState((s) => s);
  const [selectedMonth, setSelectedMonth] = React.useState(
    month ?? getCurrentMonthYyyyMm(),
  );

  React.useEffect(() => {
    if (month) setSelectedMonth(month);
  }, [month]);

  const summary = React.useMemo(() => {
    return listEnvelopeSummaryFromState(state, { month: selectedMonth });
  }, [state, selectedMonth]);

  const currencyId =
    Object.values(state.currencies).find(
      (c) => c.code === state.settings.defaultCurrencyCode,
    )?.currency_id ?? Object.keys(state.currencies)[0];

  return (
    <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="text-sm text-muted-foreground">{title ?? "Envelopes"}</div>
          <div className="text-xl font-semibold tracking-tight">{selectedMonth}</div>
        </div>
        {!month && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">Month</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-md border border-border bg-background px-2 py-1 text-sm"
            />
          </div>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {summary.items.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No categories yet. Import a CSV, or create budgets by asking the assistant.
          </div>
        ) : (
          summary.items.map((item) => {
            const pct =
              item.budgeted > 0 ? clamp(item.spent / item.budgeted, 0, 2) : 0;
            const over = item.remaining < 0;

            return (
              <div
                key={item.categoryId}
                className="rounded-lg border border-muted bg-container p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{item.categoryName}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Budgeted {formatMoney(item.budgeted)} • Spent{" "}
                      {formatMoney(item.spent)} •{" "}
                      <span className={cn(over && "text-destructive font-medium")}>
                        Remaining {formatMoney(item.remaining)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min={0}
                      defaultValue={item.budgeted || ""}
                      placeholder="Budget"
                      className="w-28 rounded-md border border-border bg-background px-2 py-1 text-sm"
                      onKeyDown={(e) => {
                        if (e.key !== "Enter") return;
                        const v = Number((e.target as HTMLInputElement).value);
                        if (!Number.isFinite(v)) return;
                        if (!currencyId) return;
                        setMonthlyBudget({
                          category_id: item.categoryId,
                          month: selectedMonth,
                          budgeted_amount: Math.max(0, v),
                          currency_id: currencyId,
                        });
                      }}
                      title="Press Enter to save"
                    />
                  </div>
                </div>

                <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      over ? "bg-destructive" : "bg-primary",
                    )}
                    style={{ width: `${Math.min(100, pct * 100)}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

