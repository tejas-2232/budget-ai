"use client";

import { cn } from "@/lib/utils";
import { useBudgetState } from "@/lib/budget/store";
import { getCurrentMonthYyyyMm, monthToRange } from "@/services/budget/queries";
import { z } from "zod";

export const budgetKpisSchema = z.object({
  month: z
    .string()
    .optional()
    .describe('Target month in "YYYY-MM" format (defaults to current month)'),
  title: z.string().optional().describe("Optional heading"),
});

export type BudgetKpisProps = z.infer<typeof budgetKpisSchema> & {
  className?: string;
};

function formatMoney(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function BudgetKpis({ month, title, className }: BudgetKpisProps) {
  const state = useBudgetState((s) => s);
  const m = month ?? getCurrentMonthYyyyMm();
  const { start, endExclusive } = monthToRange(m);

  let income = 0;
  let expense = 0;
  const splitTxIds = new Set(Object.values(state.splits).map((s) => s.transaction_id));
  let uncategorized = 0;

  Object.values(state.transactions).forEach((tx) => {
    if (tx.transaction_date < start || tx.transaction_date >= endExclusive) return;
    if (tx.amount > 0) income += tx.amount;
    if (tx.amount < 0) expense += Math.abs(tx.amount);
    if (!splitTxIds.has(tx.transaction_id)) uncategorized += 1;
  });

  const net = income - expense;
  const currency =
    Object.values(state.currencies).find(
      (c) => c.code === state.settings.defaultCurrencyCode,
    )?.code ?? state.settings.defaultCurrencyCode;

  return (
    <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm text-muted-foreground">{title ?? "This month"}</div>
          <div className="text-xl font-semibold tracking-tight">
            {m} <span className="text-sm font-normal text-muted-foreground">({currency})</span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {Object.keys(state.transactions).length} tx total
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        <div className="rounded-lg bg-container p-3 border border-muted">
          <div className="text-xs text-muted-foreground">Income</div>
          <div className="text-lg font-semibold">{formatMoney(income)}</div>
        </div>
        <div className="rounded-lg bg-container p-3 border border-muted">
          <div className="text-xs text-muted-foreground">Expense</div>
          <div className="text-lg font-semibold">{formatMoney(expense)}</div>
        </div>
        <div className="rounded-lg bg-container p-3 border border-muted">
          <div className="text-xs text-muted-foreground">Net</div>
          <div className={cn("text-lg font-semibold", net < 0 && "text-destructive")}>
            {formatMoney(net)}
          </div>
        </div>
        <div className="rounded-lg bg-container p-3 border border-muted">
          <div className="text-xs text-muted-foreground">Uncategorized</div>
          <div className="text-lg font-semibold">{uncategorized}</div>
        </div>
      </div>
    </div>
  );
}

