"use client";

import { cn } from "@/lib/utils";
import { useBudgetState } from "@/lib/budget/store";
import { getCurrentMonthYyyyMm, monthToRange } from "@/services/budget/queries";
import { replaceTransactionSplits, getOrCreateCategoryByName } from "@/services/budget/model";
import { z } from "zod";
import * as React from "react";

export const transactionsTableSchema = z.object({
  month: z
    .string()
    .optional()
    .describe('Target month in "YYYY-MM" format (defaults to current month)'),
  onlyUncategorized: z
    .boolean()
    .optional()
    .describe("If true, only show uncategorized transactions"),
  limit: z.number().optional().describe("Max rows to show (default 200)"),
  title: z.string().optional().describe("Optional heading"),
});

export type TransactionsTableProps = z.infer<typeof transactionsTableSchema> & {
  className?: string;
};

function formatMoney(n: number) {
  const abs = Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 2 });
  return n < 0 ? `-${abs}` : abs;
}

export function TransactionsTable({
  month,
  onlyUncategorized,
  limit,
  title,
  className,
}: TransactionsTableProps) {
  const state = useBudgetState((s) => s);
  const [selectedMonth, setSelectedMonth] = React.useState(
    month ?? getCurrentMonthYyyyMm(),
  );
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    if (month) setSelectedMonth(month);
  }, [month]);

  const { start, endExclusive } = monthToRange(selectedMonth);

  const splitsByTx = React.useMemo(() => {
    const m = new Map<string, string>(); // txId -> categoryId (single-split v1)
    Object.values(state.splits).forEach((s) => {
      if (!m.has(s.transaction_id)) m.set(s.transaction_id, s.category_id);
    });
    return m;
  }, [state.splits]);

  const categories = React.useMemo(() => {
    return Object.values(state.categories)
      .filter((c) => c.type === "expense" || c.type === "income")
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [state.categories]);

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const accountsById = state.accounts;
    const merchantsById = state.merchants;

    return Object.values(state.transactions)
      .filter((tx) => tx.transaction_date >= start && tx.transaction_date < endExclusive)
      .filter((tx) => {
        if (!onlyUncategorized) return true;
        return !splitsByTx.has(tx.transaction_id);
      })
      .filter((tx) => {
        if (!q) return true;
        const account = accountsById[tx.account_id]?.name ?? "";
        const merchant = tx.merchant_id ? merchantsById[tx.merchant_id]?.name ?? "" : "";
        const desc = tx.description ?? "";
        return [account, merchant, desc].some((s) => s.toLowerCase().includes(q));
      })
      .sort((a, b) => (a.transaction_date < b.transaction_date ? 1 : -1))
      .slice(0, limit ?? 200)
      .map((tx) => {
        const account = accountsById[tx.account_id]?.name ?? "Unknown";
        const merchant = tx.merchant_id ? merchantsById[tx.merchant_id]?.name ?? "" : "";
        const categoryId = splitsByTx.get(tx.transaction_id) ?? "";
        const categoryName = categoryId ? state.categories[categoryId]?.name ?? "" : "";
        const currency = state.currencies[tx.currency_id]?.code ?? state.settings.defaultCurrencyCode;
        return {
          tx,
          account,
          merchant,
          categoryId,
          categoryName,
          currency,
        };
      });
  }, [
    state.transactions,
    state.accounts,
    state.merchants,
    state.categories,
    state.currencies,
    start,
    endExclusive,
    onlyUncategorized,
    splitsByTx,
    query,
    limit,
    state.settings.defaultCurrencyCode,
  ]);

  return (
    <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="text-sm text-muted-foreground">{title ?? "Transactions"}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {onlyUncategorized ? "Uncategorized only" : "All"} • {rows.length} shown
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!month && (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-md border border-border bg-background px-2 py-1 text-sm"
              aria-label="Select month"
            />
          )}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search merchant/account/description"
            className="w-64 max-w-full rounded-md border border-border bg-background px-2 py-1 text-sm"
            aria-label="Search"
          />
        </div>
      </div>

      <div className="mt-4 overflow-auto">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-3">Date</th>
              <th className="text-left py-2 pr-3">Account</th>
              <th className="text-left py-2 pr-3">Merchant</th>
              <th className="text-left py-2 pr-3">Description</th>
              <th className="text-left py-2 pr-3">Category</th>
              <th className="text-right py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.tx.transaction_id} className="border-b border-muted">
                <td className="py-2 pr-3 whitespace-nowrap">{r.tx.transaction_date}</td>
                <td className="py-2 pr-3 whitespace-nowrap">{r.account}</td>
                <td className="py-2 pr-3 whitespace-nowrap">{r.merchant}</td>
                <td className="py-2 pr-3 max-w-[340px] truncate">{r.tx.description ?? ""}</td>
                <td className="py-2 pr-3">
                  <select
                    className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm"
                    value={r.categoryName}
                    onChange={(e) => {
                      const name = e.target.value;
                      if (!name) return;
                      const cat = getOrCreateCategoryByName({
                        name,
                        type: r.tx.amount < 0 ? "expense" : "income",
                      });
                      replaceTransactionSplits({
                        transaction_id: r.tx.transaction_id,
                        splits: [{ category_id: cat.category_id, amount: r.tx.amount }],
                      });
                    }}
                  >
                    <option value="">{r.categoryName ? r.categoryName : "Uncategorized"}</option>
                    {categories.map((c) => (
                      <option key={c.category_id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className={cn("py-2 text-right whitespace-nowrap", r.tx.amount < 0 ? "text-foreground" : "text-emerald-600")}>
                  {formatMoney(r.tx.amount)} {r.currency}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-muted-foreground">
                  No transactions found for this month.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

