import type {
  Account,
  BudgetRow,
  Category,
  Currency,
  Merchant,
  Tag,
  Transaction,
  TransactionSplit,
  UUID,
} from "@/lib/budget/types";
import { createId, getBudgetState, updateBudgetState } from "@/lib/budget/store";

function normalizeName(name: string) {
  return name.trim();
}

export function getOrCreateCurrencyByCode(codeRaw: string): Currency {
  const code = codeRaw.trim().toUpperCase();
  const state = getBudgetState();
  const existing = Object.values(state.currencies).find((c) => c.code === code);
  if (existing) return existing;

  const currency: Currency = {
    currency_id: createId(),
    code,
  };
  updateBudgetState((prev) => ({
    ...prev,
    currencies: { ...prev.currencies, [currency.currency_id]: currency },
  }));
  return currency;
}

export function getOrCreateAccountByName(args: {
  name: string;
  currency_id: UUID;
  type?: string;
}): Account {
  const name = normalizeName(args.name);
  const state = getBudgetState();
  const existing = Object.values(state.accounts).find(
    (a) => a.name.toLowerCase() === name.toLowerCase(),
  );
  if (existing) return existing;

  const account: Account = {
    account_id: createId(),
    name,
    type: args.type ?? state.settings.defaultAccountType ?? "checking",
    currency_id: args.currency_id,
    initial_balance: 0,
    is_active: true,
  };
  updateBudgetState((prev) => ({
    ...prev,
    accounts: { ...prev.accounts, [account.account_id]: account },
  }));
  return account;
}

export function getOrCreateMerchantByName(nameRaw: string): Merchant {
  const name = normalizeName(nameRaw);
  const state = getBudgetState();
  const existing = Object.values(state.merchants).find(
    (m) => m.name.toLowerCase() === name.toLowerCase(),
  );
  if (existing) return existing;

  const merchant: Merchant = { merchant_id: createId(), name };
  updateBudgetState((prev) => ({
    ...prev,
    merchants: { ...prev.merchants, [merchant.merchant_id]: merchant },
  }));
  return merchant;
}

export function getOrCreateCategoryByName(args: {
  name: string;
  type?: string;
  parent_category_id?: UUID;
}): Category {
  const name = normalizeName(args.name);
  const state = getBudgetState();
  const existing = Object.values(state.categories).find(
    (c) => c.name.toLowerCase() === name.toLowerCase(),
  );
  if (existing) return existing;

  const category: Category = {
    category_id: createId(),
    name,
    type: args.type ?? "expense",
    parent_category_id: args.parent_category_id,
  };
  updateBudgetState((prev) => ({
    ...prev,
    categories: { ...prev.categories, [category.category_id]: category },
  }));
  return category;
}

export function getOrCreateTagByName(nameRaw: string): Tag {
  const name = normalizeName(nameRaw);
  const state = getBudgetState();
  const existing = Object.values(state.tags).find(
    (t) => t.name.toLowerCase() === name.toLowerCase(),
  );
  if (existing) return existing;

  const tag: Tag = { tag_id: createId(), name };
  updateBudgetState((prev) => ({
    ...prev,
    tags: { ...prev.tags, [tag.tag_id]: tag },
  }));
  return tag;
}

export function upsertTransaction(tx: Transaction): Transaction {
  // Dedupe by import_key if present
  if (tx.import_key) {
    const state = getBudgetState();
    const existingId = state.importKeys[tx.import_key];
    if (existingId && state.transactions[existingId]) {
      return state.transactions[existingId]!;
    }
  }

  updateBudgetState((prev) => {
    const nextTxId = tx.transaction_id || createId();
    const stored: Transaction = { ...tx, transaction_id: nextTxId };
    const nextImportKeys = { ...prev.importKeys };
    if (stored.import_key) nextImportKeys[stored.import_key] = nextTxId;
    return {
      ...prev,
      importKeys: nextImportKeys,
      transactions: { ...prev.transactions, [nextTxId]: stored },
    };
  });

  const state = getBudgetState();
  return state.transactions[tx.transaction_id] ?? tx;
}

export function replaceTransactionSplits(args: {
  transaction_id: UUID;
  splits: Array<Pick<TransactionSplit, "category_id" | "amount" | "notes">>;
}) {
  updateBudgetState((prev) => {
    const existingSplitIds = Object.values(prev.splits)
      .filter((s) => s.transaction_id === args.transaction_id)
      .map((s) => s.split_id);

    const nextSplits = { ...prev.splits };
    existingSplitIds.forEach((id) => {
      delete nextSplits[id];
    });

    args.splits.forEach((s) => {
      const split: TransactionSplit = {
        split_id: createId(),
        transaction_id: args.transaction_id,
        category_id: s.category_id,
        amount: s.amount,
        notes: s.notes,
      };
      nextSplits[split.split_id] = split;
    });

    return { ...prev, splits: nextSplits };
  });
}

export function setMonthlyBudget(args: {
  category_id: UUID;
  month: string; // YYYY-MM
  budgeted_amount: number;
  currency_id: UUID;
}) {
  const start_date = `${args.month}-01`;
  updateBudgetState((prev) => {
    const existing = Object.values(prev.budgets).find(
      (b) => b.category_id === args.category_id && b.start_date === start_date,
    );
    const budget_id = existing?.budget_id ?? createId();
    const name =
      prev.categories[args.category_id]?.name ??
      existing?.name ??
      "Envelope Budget";
    const row: BudgetRow = {
      budget_id,
      category_id: args.category_id,
      name,
      budgeted_amount: args.budgeted_amount,
      currency_id: args.currency_id,
      start_date,
      is_recurring: false,
    };
    return {
      ...prev,
      budgets: { ...prev.budgets, [budget_id]: row },
    };
  });
}

