"use client";

import { Graph } from "@/components/tambo/graph";
import { useBudgetState } from "@/lib/budget/store";
import { cn } from "@/lib/utils";
import {
  getCurrentMonthYyyyMm,
  spendingByCategory,
  spendingTrend,
} from "@/services/budget/queries";
import * as React from "react";
import { z } from "zod";

export const insightsPanelSchema = z.object({
  month: z
    .string()
    .optional()
    .describe('Target month in "YYYY-MM" format (defaults to current month)'),
  title: z.string().optional().describe("Optional heading"),
});

export type InsightsPanelProps = z.infer<typeof insightsPanelSchema> & {
  className?: string;
};

export function InsightsPanel({ month, title, className }: InsightsPanelProps) {
  const state = useBudgetState((s) => s);
  const [selectedMonth, setSelectedMonth] = React.useState(
    month ?? getCurrentMonthYyyyMm(),
  );

  React.useEffect(() => {
    if (month) setSelectedMonth(month);
  }, [month]);

  const hasData = Object.keys(state.transactions).length > 0;

  // These queries read from the local store; the component will re-render on store updates
  // because `useBudgetState((s) => s)` subscribes to changes.
  const cat = spendingByCategory({ month: selectedMonth, topN: 10 });
  const trend = spendingTrend({ month: selectedMonth });

  const pieLabels = cat.rows.map((r) => r.categoryName);
  const pieValues = cat.rows.map((r) => Math.round(r.total * 100) / 100);

  const lineLabels = trend.rows.map((r) => r.day.slice(8)); // DD for compactness
  const lineIncome = trend.rows.map((r) => Math.round(r.income * 100) / 100);
  const lineExpense = trend.rows.map((r) => Math.round(r.expense * 100) / 100);

  return (
    <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="text-sm text-muted-foreground">
            {title ?? "Advanced insights"}
          </div>
          <div className="text-xl font-semibold tracking-tight">
            {selectedMonth}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Month</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-md border border-border bg-background px-2 py-1 text-sm"
            aria-label="Select month"
          />
        </div>
      </div>

      {!hasData ? (
        <div className="mt-4 text-sm text-muted-foreground">
          Import a CSV to unlock insights.
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Graph
            title="Spending by category (top 10)"
            variant="solid"
            size="default"
            data={{
              type: "pie",
              labels: pieLabels.length ? pieLabels : ["No data"],
              datasets: [
                {
                  label: "Spend",
                  data: pieValues.length ? pieValues : [0],
                },
              ],
            }}
          />
          <Graph
            title="Daily income vs expense"
            variant="solid"
            size="default"
            data={{
              type: "line",
              labels: lineLabels.length ? lineLabels : ["—"],
              datasets: [
                { label: "Income", data: lineIncome.length ? lineIncome : [0] },
                { label: "Expense", data: lineExpense.length ? lineExpense : [0] },
              ],
            }}
          />
        </div>
      )}
    </div>
  );
}

