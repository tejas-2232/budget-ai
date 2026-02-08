CREATE TABLE Users (
  user_id UUID NOT NULL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  country_id UUID,
  timezone_id UUID,
  default_currency_id UUID,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP,
  FOREIGN KEY (country_id) REFERENCES Countries(country_id),
  FOREIGN KEY (timezone_id) REFERENCES Timezones(timezone_id),
  FOREIGN KEY (default_currency_id) REFERENCES Currencies(currency_id)
);

CREATE TABLE Countries (
  country_id UUID NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  iso_code VARCHAR(2) NOT NULL UNIQUE,
  currency_id UUID,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP,
  FOREIGN KEY (currency_id) REFERENCES Currencies(currency_id)
);

CREATE TABLE Currencies (
  currency_id UUID NOT NULL PRIMARY KEY,
  code VARCHAR(3) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  symbol VARCHAR(10),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE TABLE Timezones (
  timezone_id UUID NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  utc_offset VARCHAR(10),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE TABLE Accounts (
  account_id UUID NOT NULL PRIMARY KEY,
  user_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  currency_id UUID NOT NULL,
  initial_balance DECIMAL(18, 4) NOT NULL DEFAULT 0.00,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id),
  FOREIGN KEY (currency_id) REFERENCES Currencies(currency_id)
);

CREATE TABLE Merchants (
  merchant_id UUID NOT NULL PRIMARY KEY,
  user_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE Categories (
  category_id UUID NOT NULL PRIMARY KEY,
  user_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  parent_category_id UUID,
  type VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id),
  FOREIGN KEY (parent_category_id) REFERENCES Categories(category_id)
);

CREATE TABLE Transactions (
  transaction_id UUID NOT NULL PRIMARY KEY,
  user_id UUID NOT NULL,
  account_id UUID NOT NULL,
  transaction_date DATE NOT NULL,
  amount DECIMAL(18, 4) NOT NULL,
  currency_id UUID NOT NULL,
  description TEXT,
  merchant_id UUID,
  type VARCHAR(50) NOT NULL,
  is_recurring_instance BOOLEAN NOT NULL DEFAULT FALSE,
  recurring_transaction_id UUID,
  related_transaction_id UUID,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id),
  FOREIGN KEY (account_id) REFERENCES Accounts(account_id),
  FOREIGN KEY (currency_id) REFERENCES Currencies(currency_id),
  FOREIGN KEY (merchant_id) REFERENCES Merchants(merchant_id),
  FOREIGN KEY (recurring_transaction_id) REFERENCES RecurringTransactions(recurring_transaction_id),
  FOREIGN KEY (related_transaction_id) REFERENCES Transactions(transaction_id)
);

CREATE TABLE TransactionSplits (
  split_id UUID NOT NULL PRIMARY KEY,
  transaction_id UUID NOT NULL,
  category_id UUID NOT NULL,
  amount DECIMAL(18, 4) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP,
  FOREIGN KEY (transaction_id) REFERENCES Transactions(transaction_id),
  FOREIGN KEY (category_id) REFERENCES Categories(category_id)
);

CREATE TABLE Budgets (
  budget_id UUID NOT NULL PRIMARY KEY,
  user_id UUID NOT NULL,
  category_id UUID,
  name VARCHAR(255) NOT NULL,
  budgeted_amount DECIMAL(18, 4) NOT NULL,
  currency_id UUID NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
  recurring_period VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id),
  FOREIGN KEY (category_id) REFERENCES Categories(category_id),
  FOREIGN KEY (currency_id) REFERENCES Currencies(currency_id)
);

CREATE TABLE RecurringTransactions (
  recurring_transaction_id UUID NOT NULL PRIMARY KEY,
  user_id UUID NOT NULL,
  account_id UUID NOT NULL,
  description TEXT,
  merchant_id UUID,
  amount DECIMAL(18, 4) NOT NULL,
  currency_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  frequency VARCHAR(50) NOT NULL,
  next_occurrence_date DATE NOT NULL,
  occurrence_limit INTEGER,
  occurrences_generated INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id),
  FOREIGN KEY (account_id) REFERENCES Accounts(account_id),
  FOREIGN KEY (merchant_id) REFERENCES Merchants(merchant_id),
  FOREIGN KEY (currency_id) REFERENCES Currencies(currency_id)
);

CREATE TABLE RecurringTransactionSplits (
  recurring_split_id UUID NOT NULL PRIMARY KEY,
  recurring_transaction_id UUID NOT NULL,
  category_id UUID NOT NULL,
  amount DECIMAL(18, 4) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP,
  FOREIGN KEY (recurring_transaction_id) REFERENCES RecurringTransactions(recurring_transaction_id),
  FOREIGN KEY (category_id) REFERENCES Categories(category_id)
);

CREATE TABLE Attachments (
  attachment_id UUID NOT NULL PRIMARY KEY,
  user_id UUID NOT NULL,
  transaction_id UUID NOT NULL,
  filename VARCHAR(255) NOT NULL,
  file_type VARCHAR(50),
  file_path VARCHAR(512) NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id),
  FOREIGN KEY (transaction_id) REFERENCES Transactions(transaction_id)
);

CREATE TABLE Tags (
  tag_id UUID NOT NULL PRIMARY KEY,
  user_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE TransactionTags (
  transaction_id UUID NOT NULL PRIMARY KEY,
  tag_id UUID NOT NULL PRIMARY KEY,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transaction_id) REFERENCES Transactions(transaction_id),
  FOREIGN KEY (tag_id) REFERENCES Tags(tag_id)
);

CREATE TABLE ImportJobs (
  import_job_id UUID NOT NULL PRIMARY KEY,
  user_id UUID NOT NULL,
  upload_filename VARCHAR(255) NOT NULL,
  original_file_path VARCHAR(512),
  status VARCHAR(50) NOT NULL,
  started_at TIMESTAMP,
  finished_at TIMESTAMP,
  total_rows INTEGER,
  processed_rows INTEGER NOT NULL DEFAULT 0,
  failed_rows INTEGER NOT NULL DEFAULT 0,
  success_rows INTEGER NOT NULL DEFAULT 0,
  error_summary TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE ImportJobMappings (
  import_job_mapping_id UUID NOT NULL PRIMARY KEY,
  import_job_id UUID NOT NULL,
  csv_column_name VARCHAR(255) NOT NULL,
  target_field_name VARCHAR(255) NOT NULL,
  mapping_type VARCHAR(50) NOT NULL,
  fixed_value VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (import_job_id) REFERENCES ImportJobs(import_job_id)
);

CREATE TABLE ImportJobErrors (
  import_job_error_id UUID NOT NULL PRIMARY KEY,
  import_job_id UUID NOT NULL,
  row_number INTEGER NOT NULL,
  error_message TEXT NOT NULL,
  raw_data TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (import_job_id) REFERENCES ImportJobs(import_job_id)
);

CREATE TABLE ExchangeRates (
  exchange_rate_id UUID NOT NULL PRIMARY KEY,
  base_currency_id UUID NOT NULL,
  target_currency_id UUID NOT NULL,
  rate_date DATE NOT NULL,
  rate DECIMAL(18, 6) NOT NULL,
  source VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (base_currency_id) REFERENCES Currencies(currency_id),
  FOREIGN KEY (target_currency_id) REFERENCES Currencies(currency_id)
);