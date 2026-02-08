import type { BudgetState, Transaction } from "@/lib/budget/types";
import { budgetClock, createId, getBudgetState, updateBudgetState } from "@/lib/budget/store";
import { parseCsv, normalizeHeaderName } from "@/services/budget/csv";
import {
  getOrCreateAccountByName,
  getOrCreateCategoryByName,
  getOrCreateCurrencyByCode,
  getOrCreateMerchantByName,
  getOrCreateTagByName,
  replaceTransactionSplits,
} from "@/services/budget/model";

export type CsvMapping = Partial<Record<
  | "date"
  | "account"
  | "amount"
  | "currency"
  | "description"
  | "merchant"
  | "category"
  | "tags"
  | "notes",
  string
>>;

export type ImportPreview = {
  headers: string[];
  sampleRows: Record<string, string>[];
  suggestedMapping: CsvMapping;
  rowCount: number;
};

export type ImportCommitResult = {
  importJobId: string;
  totalRows: number;
  successRows: number;
  failedRows: number;
  created: {
    accounts: number;
    merchants: number;
    categories: number;
    transactions: number;
    tags: number;
  };
  errors: Array<{ rowNumber: number; message: string }>;
};

function looksLikeDateHeader(h: string) {
  const n = normalizeHeaderName(h);
  return ["date", "transactiondate", "posteddate"].includes(n);
}
function looksLikeAccountHeader(h: string) {
  const n = normalizeHeaderName(h);
  return ["account", "accountname"].includes(n);
}
function looksLikeAmountHeader(h: string) {
  const n = normalizeHeaderName(h);
  return ["amount", "amt", "value"].includes(n);
}
function looksLikeCurrencyHeader(h: string) {
  const n = normalizeHeaderName(h);
  return ["currency", "ccy"].includes(n);
}
function looksLikeMerchantHeader(h: string) {
  const n = normalizeHeaderName(h);
  return ["merchant", "payee"].includes(n);
}
function looksLikeCategoryHeader(h: string) {
  const n = normalizeHeaderName(h);
  return ["category", "envelope"].includes(n);
}
function looksLikeTagsHeader(h: string) {
  const n = normalizeHeaderName(h);
  return ["tags", "tag"].includes(n);
}
function looksLikeNotesHeader(h: string) {
  const n = normalizeHeaderName(h);
  return ["notes", "note", "memo"].includes(n);
}
function looksLikeDescriptionHeader(h: string) {
  const n = normalizeHeaderName(h);
  return ["description", "desc", "narrative"].includes(n);
}

export function previewCsvImport(csvText: string): ImportPreview {
  const parsed = parseCsv(csvText);
  const headers = parsed.headers;
  const rows = parsed.rows;

  const suggestedMapping: CsvMapping = {};
  headers.forEach((h) => {
    if (!suggestedMapping.date && looksLikeDateHeader(h)) suggestedMapping.date = h;
    if (!suggestedMapping.account && looksLikeAccountHeader(h)) suggestedMapping.account = h;
    if (!suggestedMapping.amount && looksLikeAmountHeader(h)) suggestedMapping.amount = h;
    if (!suggestedMapping.currency && looksLikeCurrencyHeader(h)) suggestedMapping.currency = h;
    if (!suggestedMapping.description && looksLikeDescriptionHeader(h)) suggestedMapping.description = h;
    if (!suggestedMapping.merchant && looksLikeMerchantHeader(h)) suggestedMapping.merchant = h;
    if (!suggestedMapping.category && looksLikeCategoryHeader(h)) suggestedMapping.category = h;
    if (!suggestedMapping.tags && looksLikeTagsHeader(h)) suggestedMapping.tags = h;
    if (!suggestedMapping.notes && looksLikeNotesHeader(h)) suggestedMapping.notes = h;
  });

  const sample = rows.slice(0, 10).map((r) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = (r[i] ?? "").trim();
    });
    return obj;
  });

  return {
    headers,
    sampleRows: sample,
    suggestedMapping,
    rowCount: rows.length,
  };
}

function parseAmount(raw: string): number | null {
  const s = raw.trim();
  if (!s) return null;
  // Remove currency symbols and spaces, keep digits, - , .
  const cleaned = s.replace(/[^\d\-.,]/g, "");
  // Handle thousands separators: if both , and . exist, assume , is thousands
  const normalized =
    cleaned.includes(",") && cleaned.includes(".")
      ? cleaned.replace(/,/g, "")
      : cleaned.replace(/,/g, ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

function parseDateToYmd(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;

  // ISO-like
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
  if (iso) return iso;

  // MM/DD/YYYY or DD/MM/YYYY (ambiguous) — we assume MM/DD/YYYY if first part <= 12
  const m = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/.exec(s);
  if (m) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    const year = Number(m[3]);
    const month = a >= 1 && a <= 12 ? a : b;
    const day = a >= 1 && a <= 12 ? b : a;
    const mm = String(month).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  }

  const dt = new Date(s);
  if (!Number.isNaN(dt.getTime())) {
    const year = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  }

  return null;
}

function buildImportKey(tx: {
  date: string;
  account: string;
  amount: number;
  description?: string;
  merchant?: string;
}): string {
  const base = [
    tx.date,
    tx.account.toLowerCase(),
    tx.amount.toFixed(4),
    (tx.description ?? "").toLowerCase(),
    (tx.merchant ?? "").toLowerCase(),
  ].join("|");
  // Cheap hash
  let h = 0;
  for (let i = 0; i < base.length; i++) {
    h = (h * 31 + base.charCodeAt(i)) >>> 0;
  }
  return `imp_${h.toString(16)}`;
}

function getField(row: Record<string, string>, mapping: CsvMapping, key: keyof CsvMapping) {
  const header = mapping[key];
  if (!header) return "";
  return (row[header] ?? "").trim();
}

export function commitCsvImport(args: {
  csvText: string;
  mapping: CsvMapping;
  filename?: string;
  defaultCurrencyCode?: string;
}): ImportCommitResult {
  const preview = previewCsvImport(args.csvText);
  const headers = preview.headers;
  const parsed = parseCsv(args.csvText);

  const stateBefore = getBudgetState();
  const beforeCounts = {
    accounts: Object.keys(stateBefore.accounts).length,
    merchants: Object.keys(stateBefore.merchants).length,
    categories: Object.keys(stateBefore.categories).length,
    transactions: Object.keys(stateBefore.transactions).length,
    tags: Object.keys(stateBefore.tags).length,
  };

  const importJobId = createId();
  const started = budgetClock.nowIso();
  updateBudgetState((prev) => ({
    ...prev,
    importJobs: {
      ...prev.importJobs,
      [importJobId]: {
        import_job_id: importJobId,
        upload_filename: args.filename ?? "import.csv",
        status: "running",
        started_at: started,
        processed_rows: 0,
        failed_rows: 0,
        success_rows: 0,
        total_rows: parsed.rows.length,
      },
    },
  }));

  const errors: Array<{ rowNumber: number; message: string }> = [];
  let success = 0;
  let failed = 0;

  const defaultCurrency =
    args.defaultCurrencyCode ??
    getBudgetState().settings.defaultCurrencyCode ??
    "USD";

  // Validate minimal required mapping
  const required: (keyof CsvMapping)[] = ["date", "account", "amount"];
  for (const r of required) {
    if (!args.mapping[r]) {
      return {
        importJobId,
        totalRows: parsed.rows.length,
        successRows: 0,
        failedRows: parsed.rows.length,
        created: { accounts: 0, merchants: 0, categories: 0, transactions: 0, tags: 0 },
        errors: [{ rowNumber: 0, message: `Missing required mapping for: ${String(r)}` }],
      };
    }
  }

  // Iterate row objects (header -> value)
  parsed.rows.forEach((r, idx) => {
    const rowNumber = idx + 2; // header is row 1
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = (r[i] ?? "").trim();
    });

    try {
      const dateRaw = getField(obj, args.mapping, "date");
      const accountRaw = getField(obj, args.mapping, "account");
      const amountRaw = getField(obj, args.mapping, "amount");

      const date = parseDateToYmd(dateRaw);
      if (!date) throw new Error(`Invalid date: "${dateRaw}"`);
      if (!accountRaw) throw new Error("Missing account");
      const amount = parseAmount(amountRaw);
      if (amount === null) throw new Error(`Invalid amount: "${amountRaw}"`);

      const currencyRaw = getField(obj, args.mapping, "currency");
      const currencyCode = (currencyRaw || defaultCurrency).toUpperCase();
      const currency = getOrCreateCurrencyByCode(currencyCode);

      const account = getOrCreateAccountByName({
        name: accountRaw,
        currency_id: currency.currency_id,
      });

      const merchantRaw = getField(obj, args.mapping, "merchant");
      const merchant = merchantRaw ? getOrCreateMerchantByName(merchantRaw) : undefined;

      const description = getField(obj, args.mapping, "description") || undefined;
      const notes = getField(obj, args.mapping, "notes") || undefined;

      const type =
        amount < 0 ? "expense" : amount > 0 ? "income" : "adjustment";

      const import_key = buildImportKey({
        date,
        account: account.name,
        amount,
        description,
        merchant: merchant?.name,
      });

      // Dedupe: if already imported, count as success but don't create duplicates
      const existingId = getBudgetState().importKeys[import_key];
      if (existingId && getBudgetState().transactions[existingId]) {
        success += 1;
        return;
      }

      const tx: Transaction = {
        transaction_id: createId(),
        account_id: account.account_id,
        transaction_date: date,
        amount,
        currency_id: currency.currency_id,
        description,
        merchant_id: merchant?.merchant_id,
        type,
        notes,
        import_key,
      };

      updateBudgetState((prev: BudgetState) => ({
        ...prev,
        importKeys: { ...prev.importKeys, [import_key]: tx.transaction_id },
        transactions: { ...prev.transactions, [tx.transaction_id]: tx },
      }));

      const categoryRaw = getField(obj, args.mapping, "category");
      if (categoryRaw) {
        const category = getOrCreateCategoryByName({
          name: categoryRaw,
          type: amount < 0 ? "expense" : "income",
        });
        replaceTransactionSplits({
          transaction_id: tx.transaction_id,
          splits: [{ category_id: category.category_id, amount }],
        });
      }

      const tagsRaw = getField(obj, args.mapping, "tags");
      if (tagsRaw) {
        const tagNames = tagsRaw
          .split(/[|,]/g)
          .map((t) => t.trim())
          .filter(Boolean);
        tagNames.forEach((t) => {
          const tag = getOrCreateTagByName(t);
          updateBudgetState((prev) => ({
            ...prev,
            transactionTags: {
              ...prev.transactionTags,
              [`${tx.transaction_id}:${tag.tag_id}`]: {
                transaction_id: tx.transaction_id,
                tag_id: tag.tag_id,
              },
            },
          }));
        });
      }

      success += 1;
    } catch (e) {
      failed += 1;
      const msg = e instanceof Error ? e.message : "Unknown error";
      errors.push({ rowNumber, message: msg });
      const errId = createId();
      updateBudgetState((prev) => ({
        ...prev,
        importJobErrors: {
          ...prev.importJobErrors,
          [errId]: {
            import_job_error_id: errId,
            import_job_id: importJobId,
            row_number: rowNumber,
            error_message: msg,
            raw_data: JSON.stringify(parsed.rows[idx]),
          },
        },
      }));
    }
  });

  const finished = nowIso();
  updateBudgetState((prev) => ({
    ...prev,
    importJobs: {
      ...prev.importJobs,
      [importJobId]: {
        ...prev.importJobs[importJobId]!,
        status: errors.length ? "completed" : "completed",
        finished_at: finished,
        processed_rows: parsed.rows.length,
        failed_rows: failed,
        success_rows: success,
        error_summary: errors.length ? `${errors.length} rows failed` : undefined,
      },
    },
  }));

  const stateAfter = getBudgetState();
  const afterCounts = {
    accounts: Object.keys(stateAfter.accounts).length,
    merchants: Object.keys(stateAfter.merchants).length,
    categories: Object.keys(stateAfter.categories).length,
    transactions: Object.keys(stateAfter.transactions).length,
    tags: Object.keys(stateAfter.tags).length,
  };

  return {
    importJobId,
    totalRows: parsed.rows.length,
    successRows: success,
    failedRows: failed,
    created: {
      accounts: Math.max(0, afterCounts.accounts - beforeCounts.accounts),
      merchants: Math.max(0, afterCounts.merchants - beforeCounts.merchants),
      categories: Math.max(0, afterCounts.categories - beforeCounts.categories),
      transactions: Math.max(0, afterCounts.transactions - beforeCounts.transactions),
      tags: Math.max(0, afterCounts.tags - beforeCounts.tags),
    },
    errors,
  };
}

function nowIso() {
  return new Date().toISOString();
}

