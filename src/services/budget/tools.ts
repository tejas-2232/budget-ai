import { getBudgetState } from "@/lib/budget/store";
import type { UUID } from "@/lib/budget/types";
import { commitCsvImport, previewCsvImport, type CsvMapping } from "@/services/budget/import";
import { getOrCreateCategoryByName, replaceTransactionSplits } from "@/services/budget/model";
import {
  listEnvelopeSummary,
  listUncategorizedTransactions,
  spendingByCategory,
  spendingTrend,
} from "@/services/budget/queries";

export async function importCsvPreview(args: { csvText: string }) {
  return previewCsvImport(args.csvText);
}

export async function importCsvCommit(args: {
  csvText: string;
  mapping: CsvMapping;
  filename?: string;
}) {
  return commitCsvImport({
    csvText: args.csvText,
    mapping: args.mapping,
    filename: args.filename,
    defaultCurrencyCode: getBudgetState().settings.defaultCurrencyCode,
  });
}

export async function getEnvelopeSummary(args: { month?: string }) {
  const month = args.month ?? new Date().toISOString().slice(0, 7);
  return listEnvelopeSummary({ month });
}

export async function setEnvelopeBudget(args: {
  month: string; // YYYY-MM
  categoryName: string;
  amount: number;
}) {
  const state = getBudgetState();
  const currencyId =
    Object.values(state.currencies).find(
      (c) => c.code === state.settings.defaultCurrencyCode,
    )?.currency_id ??
    Object.keys(state.currencies)[0] ??
    null;
  if (!currencyId) {
    // Create a currency lazily via import path; simplest is to accept missing and no-op
    throw new Error("No currencies exist yet. Import a CSV first (or set a default currency).");
  }

  const category = getOrCreateCategoryByName({
    name: args.categoryName,
    type: "expense",
  });

  // Use model setter
  const { setMonthlyBudget } = await import("@/services/budget/model");
  setMonthlyBudget({
    category_id: category.category_id,
    month: args.month,
    budgeted_amount: Math.max(0, args.amount),
    currency_id: currencyId,
  });

  return { ok: true, month: args.month, categoryId: category.category_id };
}

export async function getUncategorizedTransactions(args: {
  month?: string;
  limit?: number;
}) {
  return listUncategorizedTransactions(args);
}

export async function categorizeTransaction(args: {
  transactionId: UUID;
  categoryName: string;
}) {
  const state = getBudgetState();
  const tx = state.transactions[args.transactionId];
  if (!tx) throw new Error("Transaction not found");

  const category = getOrCreateCategoryByName({
    name: args.categoryName,
    type: tx.amount < 0 ? "expense" : "income",
  });

  replaceTransactionSplits({
    transaction_id: tx.transaction_id,
    splits: [{ category_id: category.category_id, amount: tx.amount }],
  });

  return { ok: true, transactionId: tx.transaction_id, categoryId: category.category_id };
}

export async function getSpendingByCategory(args: { month?: string; topN?: number }) {
  return spendingByCategory(args);
}

export async function getSpendingTrend(args: { month?: string }) {
  return spendingTrend(args);
}

export type { CsvMapping };

