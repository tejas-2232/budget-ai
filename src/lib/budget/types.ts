export type UUID = string;

export type Currency = {
  currency_id: UUID;
  code: string; // e.g. "USD"
  name?: string;
  symbol?: string;
};

export type Account = {
  account_id: UUID;
  name: string;
  type: string; // e.g. "checking" | "credit_card" | ...
  currency_id: UUID;
  initial_balance: number;
  description?: string;
  is_active: boolean;
};

export type Merchant = {
  merchant_id: UUID;
  name: string;
  description?: string;
};

export type Category = {
  category_id: UUID;
  name: string;
  parent_category_id?: UUID;
  type: string; // "expense" | "income" | "transfer" | etc
  description?: string;
};

export type Transaction = {
  transaction_id: UUID;
  account_id: UUID;
  transaction_date: string; // YYYY-MM-DD
  amount: number; // negative = expense, positive = income
  currency_id: UUID;
  description?: string;
  merchant_id?: UUID;
  type: string; // "expense" | "income" | "transfer" | "adjustment"
  notes?: string;

  /**
   * Local-only import key to dedupe re-imports.
   * Example: sha-like key derived from (date, account, amount, description, merchant)
   */
  import_key?: string;
};

export type TransactionSplit = {
  split_id: UUID;
  transaction_id: UUID;
  category_id: UUID;
  amount: number; // for v1 we store same sign as transaction amount
  notes?: string;
};

export type Tag = {
  tag_id: UUID;
  name: string;
};

export type TransactionTag = {
  transaction_id: UUID;
  tag_id: UUID;
};

/**
 * Envelope budgets are modeled as monthly rows (per category, per month).
 * `start_date` should be the first day of the month (YYYY-MM-01).
 */
export type BudgetRow = {
  budget_id: UUID;
  category_id: UUID;
  name: string;
  budgeted_amount: number; // positive
  currency_id: UUID;
  start_date: string; // YYYY-MM-01
  end_date?: string;
  is_recurring: false;
};

export type ImportJobStatus = "preview" | "running" | "completed" | "failed";

export type ImportJob = {
  import_job_id: UUID;
  upload_filename: string;
  status: ImportJobStatus;
  started_at?: string; // ISO string
  finished_at?: string; // ISO string
  total_rows?: number;
  processed_rows: number;
  failed_rows: number;
  success_rows: number;
  error_summary?: string;
};

export type ImportJobMapping = {
  import_job_mapping_id: UUID;
  import_job_id: UUID;
  csv_column_name: string;
  target_field_name: string;
  mapping_type: "column" | "fixed";
  fixed_value?: string;
};

export type ImportJobError = {
  import_job_error_id: UUID;
  import_job_id: UUID;
  row_number: number;
  error_message: string;
  raw_data?: string;
};

export type BudgetSettings = {
  defaultCurrencyCode: string; // e.g. "USD"
  defaultAccountType: string; // e.g. "checking"
};

export type BudgetState = {
  version: 1;
  settings: BudgetSettings;
  currencies: Record<UUID, Currency>;
  accounts: Record<UUID, Account>;
  merchants: Record<UUID, Merchant>;
  categories: Record<UUID, Category>;
  transactions: Record<UUID, Transaction>;
  splits: Record<UUID, TransactionSplit>;
  tags: Record<UUID, Tag>;
  transactionTags: Record<string, TransactionTag>; // key: `${transactionId}:${tagId}`
  budgets: Record<UUID, BudgetRow>;
  importJobs: Record<UUID, ImportJob>;
  importJobMappings: Record<UUID, ImportJobMapping>;
  importJobErrors: Record<UUID, ImportJobError>;

  // Local-only indexes
  importKeys: Record<string, UUID>; // import_key -> transaction_id
};

