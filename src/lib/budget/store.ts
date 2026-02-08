"use client";

import type { BudgetState, UUID } from "@/lib/budget/types";

const STORAGE_KEY = "budget-analyzer.state.v1";

function nowIso() {
  return new Date().toISOString();
}

function safeRandomUUID(): UUID {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Fallback: non-crypto unique-ish id (fine for local-only)
  return `id_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export function createId(): UUID {
  return safeRandomUUID();
}

export function getDefaultState(): BudgetState {
  return {
    version: 1,
    settings: {
      defaultCurrencyCode: "USD",
      defaultAccountType: "checking",
    },
    currencies: {},
    accounts: {},
    merchants: {},
    categories: {},
    transactions: {},
    splits: {},
    tags: {},
    transactionTags: {},
    budgets: {},
    importJobs: {},
    importJobMappings: {},
    importJobErrors: {},
    importKeys: {},
  };
}

let cachedState: BudgetState | null = null;
const listeners = new Set<(state: BudgetState) => void>();

function readFromStorage(): BudgetState {
  if (typeof window === "undefined") return getDefaultState();

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return getDefaultState();
  try {
    const parsed = JSON.parse(raw) as BudgetState;
    if (!parsed || parsed.version !== 1) return getDefaultState();
    return parsed;
  } catch {
    return getDefaultState();
  }
}

function writeToStorage(state: BudgetState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function emit(state: BudgetState) {
  listeners.forEach((fn) => fn(state));
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("budget-analyzer:state", { detail: state }),
    );
  }
}

export function getBudgetState(): BudgetState {
  if (cachedState) return cachedState;
  cachedState = readFromStorage();
  return cachedState;
}

export function setBudgetState(next: BudgetState) {
  cachedState = next;
  writeToStorage(next);
  emit(next);
}

export function updateBudgetState(
  updater: (prev: BudgetState) => BudgetState,
): BudgetState {
  const prev = getBudgetState();
  const next = updater(prev);
  setBudgetState(next);
  return next;
}

export function subscribeBudgetState(fn: (state: BudgetState) => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * React hook: subscribe to budget state with a selector.
 */
export function useBudgetState<Selected>(
  selector: (state: BudgetState) => Selected,
): Selected {
  const React = require("react") as typeof import("react");
  const [selected, setSelected] = React.useState(() => selector(getBudgetState()));

  React.useEffect(() => {
    return subscribeBudgetState((state) => setSelected(selector(state)));
  }, [selector]);

  return selected;
}

export function resetBudgetState() {
  const next = getDefaultState();
  next.settings = { ...next.settings };
  setBudgetState(next);
}

export function setDefaultCurrencyCode(code: string) {
  updateBudgetState((prev) => ({
    ...prev,
    settings: { ...prev.settings, defaultCurrencyCode: code.toUpperCase() },
  }));
}

export function setDefaultAccountType(type: string) {
  updateBudgetState((prev) => ({
    ...prev,
    settings: { ...prev.settings, defaultAccountType: type },
  }));
}

export const budgetClock = {
  nowIso,
};

