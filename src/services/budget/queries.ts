import type { UUID } from "@/lib/budget/types";
import { getBudgetState } from "@/lib/budget/store";

export function getCurrentMonthYyyyMm(now = new Date()): string {
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`;
}

export function monthToRange(month: string): { start: string; endExclusive: string } {
  const [y, m] = month.split("-").map(Number);
  const start = `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-01`;
  const next = new Date(Date.UTC(y, m, 1));
  const endExclusive = `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}-01`;
  return { start, endExclusive };
}

function listMonthsBetweenInclusive(minMonth: string, maxMonth: string): string[] {
  const [minY, minM] = minMonth.split("-").map(Number);
  const [maxY, maxM] = maxMonth.split("-").map(Number);
  if (!minY || !minM || !maxY || !maxM) return [];

  const months: string[] = [];
  let y = minY;
  let m = minM;
  while (y < maxY || (y === maxY && m <= maxM)) {
    months.push(`${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}`);
    m += 1;
    if (m === 13) {
      m = 1;
      y += 1;
    }
  }
  return months;
}

export function listAvailableMonthsFromState(
  state: ReturnType<typeof getBudgetState>,
): string[] {
  const months = Object.values(state.transactions)
    .map((tx) => tx.transaction_date.slice(0, 7))
    .filter((m) => /^\d{4}-\d{2}$/.test(m));

  if (months.length === 0) return [];

  // YYYY-MM is lexicographically sortable
  const minMonth = months.reduce((a, b) => (a < b ? a : b));
  const maxMonth = months.reduce((a, b) => (a > b ? a : b));

  return listMonthsBetweenInclusive(minMonth, maxMonth);
}

export function listAvailableMonths(): string[] {
  return listAvailableMonthsFromState(getBudgetState());
}

export function listEnvelopeSummary(args: { month: string }) {
  return listEnvelopeSummaryFromState(getBudgetState(), args);
}

export function listEnvelopeSummaryFromState(
  state: ReturnType<typeof getBudgetState>,
  args: { month: string },
) {
  const { start, endExclusive } = monthToRange(args.month);

  const categorySpend: Record<UUID, number> = {};

  // Aggregate spend by category from splits
  Object.values(state.splits).forEach((s) => {
    const tx = state.transactions[s.transaction_id];
    if (!tx) return;
    if (tx.transaction_date < start || tx.transaction_date >= endExclusive) return;
    // Envelope spend is positive for expenses
    const spent = s.amount < 0 ? Math.abs(s.amount) : 0;
    categorySpend[s.category_id] = (categorySpend[s.category_id] ?? 0) + spent;
  });

  // Budgeted amounts by category for the month
  const startDate = `${args.month}-01`;
  const budgetedByCategory: Record<UUID, number> = {};
  Object.values(state.budgets).forEach((b) => {
    if (b.start_date !== startDate) return;
    budgetedByCategory[b.category_id] = (budgetedByCategory[b.category_id] ?? 0) + b.budgeted_amount;
  });

  const items = Object.values(state.categories)
    .filter((c) => c.type === "expense")
    .map((c) => {
      const budgeted = budgetedByCategory[c.category_id] ?? 0;
      const spent = categorySpend[c.category_id] ?? 0;
      const remaining = budgeted - spent;
      return {
        categoryId: c.category_id,
        categoryName: c.name,
        budgeted,
        spent,
        remaining,
      };
    })
    .sort((a, b) => b.spent - a.spent);

  const uncategorizedCount = Object.values(state.transactions).filter((tx) => {
    const hasSplit = Object.values(state.splits).some((s) => s.transaction_id === tx.transaction_id);
    return !hasSplit;
  }).length;

  return { month: args.month, items, uncategorizedCount };
}

export function listUncategorizedTransactions(args: { month?: string; limit?: number }) {
  const state = getBudgetState();
  const month = args.month ?? getCurrentMonthYyyyMm();
  const { start, endExclusive } = monthToRange(month);

  const hasSplit = new Set(Object.values(state.splits).map((s) => s.transaction_id));
  const merchantsById = state.merchants;
  const accountsById = state.accounts;

  const txs = Object.values(state.transactions)
    .filter((tx) => {
      if (tx.transaction_date < start || tx.transaction_date >= endExclusive) return false;
      return !hasSplit.has(tx.transaction_id);
    })
    .sort((a, b) => (a.transaction_date < b.transaction_date ? 1 : -1))
    .slice(0, args.limit ?? 50)
    .map((tx) => ({
      transactionId: tx.transaction_id,
      date: tx.transaction_date,
      account: accountsById[tx.account_id]?.name ?? "Unknown",
      merchant: tx.merchant_id ? merchantsById[tx.merchant_id]?.name ?? "" : "",
      description: tx.description ?? "",
      amount: tx.amount,
      currencyCode: state.currencies[tx.currency_id]?.code ?? "",
      notes: tx.notes ?? "",
    }));

  return { month, transactions: txs };
}

export function spendingByCategory(args: { month?: string; topN?: number }) {
  const state = getBudgetState();
  const month = args.month ?? getCurrentMonthYyyyMm();
  const { start, endExclusive } = monthToRange(month);

  const totals: Record<UUID, number> = {};
  Object.values(state.splits).forEach((s) => {
    const tx = state.transactions[s.transaction_id];
    if (!tx) return;
    if (tx.transaction_date < start || tx.transaction_date >= endExclusive) return;
    if (s.amount >= 0) return;
    totals[s.category_id] = (totals[s.category_id] ?? 0) + Math.abs(s.amount);
  });

  const rows = Object.entries(totals)
    .map(([categoryId, total]) => ({
      categoryId,
      categoryName: state.categories[categoryId]?.name ?? "Unknown",
      total,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, args.topN ?? 12);

  return { month, rows };
}

export function spendingTrend(args: { month?: string }) {
  const state = getBudgetState();
  const month = args.month ?? getCurrentMonthYyyyMm();
  const { start, endExclusive } = monthToRange(month);

  // Daily trend inside the month
  const byDay: Record<string, { income: number; expense: number }> = {};
  Object.values(state.transactions).forEach((tx) => {
    if (tx.transaction_date < start || tx.transaction_date >= endExclusive) return;
    const day = tx.transaction_date;
    if (!byDay[day]) byDay[day] = { income: 0, expense: 0 };
    if (tx.amount < 0) byDay[day]!.expense += Math.abs(tx.amount);
    if (tx.amount > 0) byDay[day]!.income += tx.amount;
  });

  const rows = Object.entries(byDay)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([day, v]) => ({ day, income: v.income, expense: v.expense }));

  return { month, rows };
}

