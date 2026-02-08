/**
 * @file tambo.ts
 * @description Central configuration file for Tambo components and tools
 *
 * This file serves as the central place to register your Tambo components and tools.
 * It exports arrays that will be used by the TamboProvider.
 *
 * Read more about Tambo at https://tambo.co/docs
 */

import { Graph, graphSchema } from "@/components/tambo/graph";
import { DataCard, dataCardSchema } from "@/components/ui/card-data";
import { BudgetKpis, budgetKpisSchema } from "@/components/budget/budget-kpis";
import {
  EnvelopeBoard,
  envelopeBoardSchema,
} from "@/components/budget/envelope-board";
import {
  ImportWizard,
  importWizardSchema,
} from "@/components/budget/import-wizard";
import {
  TransactionsTable,
  transactionsTableSchema,
} from "@/components/budget/transactions-table";
import {
  categorizeTransaction,
  getEnvelopeSummary,
  getSpendingByCategory,
  getSpendingTrend,
  getUncategorizedTransactions,
  importCsvCommit,
  importCsvPreview,
  setEnvelopeBudget,
} from "@/services/budget/tools";
import type { TamboComponent } from "@tambo-ai/react";
import { TamboTool } from "@tambo-ai/react";
import { z } from "zod";

/**
 * tools
 *
 * This array contains all the Tambo tools that are registered for use within the application.
 * Each tool is defined with its name, description, and expected props. The tools
 * can be controlled by AI to dynamically fetch data based on user interactions.
 */

export const tools: TamboTool[] = [
  {
    name: "importCsvPreview",
    description: "Preview a transaction CSV (headers, sample rows, mapping suggestions).",
    tool: importCsvPreview,
    inputSchema: z.object({
      csvText: z.string().describe("Raw CSV text including header row"),
    }),
    outputSchema: z.object({
      headers: z.array(z.string()),
      sampleRows: z.array(z.record(z.string(), z.string())),
      suggestedMapping: z
        .object({
          date: z.string().optional(),
          account: z.string().optional(),
          amount: z.string().optional(),
          currency: z.string().optional(),
          description: z.string().optional(),
          merchant: z.string().optional(),
          category: z.string().optional(),
          tags: z.string().optional(),
          notes: z.string().optional(),
        })
        .optional(),
      rowCount: z.number(),
    }),
  },
  {
    name: "importCsvCommit",
    description:
      "Import a transaction CSV into local storage (creates accounts, merchants, categories, splits, tags).",
    tool: importCsvCommit,
    inputSchema: z.object({
      csvText: z.string().describe("Raw CSV text including header row"),
      filename: z.string().optional(),
      mapping: z.object({
        date: z.string(),
        account: z.string(),
        amount: z.string(),
        currency: z.string().optional(),
        description: z.string().optional(),
        merchant: z.string().optional(),
        category: z.string().optional(),
        tags: z.string().optional(),
        notes: z.string().optional(),
      }),
    }),
    outputSchema: z.object({
      importJobId: z.string(),
      totalRows: z.number(),
      successRows: z.number(),
      failedRows: z.number(),
      created: z.object({
        accounts: z.number(),
        merchants: z.number(),
        categories: z.number(),
        transactions: z.number(),
        tags: z.number(),
      }),
      errors: z.array(z.object({ rowNumber: z.number(), message: z.string() })),
    }),
  },
  {
    name: "getEnvelopeSummary",
    description:
      "Get envelope (category) budgeted/spent/remaining summary for a month.",
    tool: getEnvelopeSummary,
    inputSchema: z.object({
      month: z.string().optional().describe('Month in "YYYY-MM" format'),
    }),
    outputSchema: z.object({
      month: z.string(),
      uncategorizedCount: z.number(),
      items: z.array(
        z.object({
          categoryId: z.string(),
          categoryName: z.string(),
          budgeted: z.number(),
          spent: z.number(),
          remaining: z.number(),
        }),
      ),
    }),
  },
  {
    name: "setEnvelopeBudget",
    description: "Set an envelope budget for a month (creates a monthly budget row).",
    tool: setEnvelopeBudget,
    inputSchema: z.object({
      month: z.string().describe('Month in "YYYY-MM" format'),
      categoryName: z.string().describe("Envelope/category name"),
      amount: z.number().describe("Budgeted amount (positive)"),
    }),
    outputSchema: z.object({
      ok: z.boolean(),
      month: z.string(),
      categoryId: z.string(),
    }),
  },
  {
    name: "getUncategorizedTransactions",
    description: "List uncategorized transactions for a month.",
    tool: getUncategorizedTransactions,
    inputSchema: z.object({
      month: z.string().optional().describe('Month in "YYYY-MM" format'),
      limit: z.number().optional(),
    }),
    outputSchema: z.object({
      month: z.string(),
      transactions: z.array(
        z.object({
          transactionId: z.string(),
          date: z.string(),
          account: z.string(),
          merchant: z.string(),
          description: z.string(),
          amount: z.number(),
          currencyCode: z.string(),
          notes: z.string(),
        }),
      ),
    }),
  },
  {
    name: "categorizeTransaction",
    description: "Assign a category to a transaction (creates/replaces a single split).",
    tool: categorizeTransaction,
    inputSchema: z.object({
      transactionId: z.string(),
      categoryName: z.string(),
    }),
    outputSchema: z.object({
      ok: z.boolean(),
      transactionId: z.string(),
      categoryId: z.string(),
    }),
  },
  {
    name: "getSpendingByCategory",
    description: "Compute spending totals by category for a month (expense splits only).",
    tool: getSpendingByCategory,
    inputSchema: z.object({
      month: z.string().optional(),
      topN: z.number().optional(),
    }),
    outputSchema: z.object({
      month: z.string(),
      rows: z.array(
        z.object({
          categoryId: z.string(),
          categoryName: z.string(),
          total: z.number(),
        }),
      ),
    }),
  },
  {
    name: "getSpendingTrend",
    description: "Compute daily income/expense trend for a month.",
    tool: getSpendingTrend,
    inputSchema: z.object({
      month: z.string().optional(),
    }),
    outputSchema: z.object({
      month: z.string(),
      rows: z.array(
        z.object({
          day: z.string(),
          income: z.number(),
          expense: z.number(),
        }),
      ),
    }),
  },
  // Add more tools here
];

/**
 * components
 *
 * This array contains all the Tambo components that are registered for use within the application.
 * Each component is defined with its name, description, and expected props. The components
 * can be controlled by AI to dynamically render UI elements based on user interactions.
 */
export const components: TamboComponent[] = [
  {
    name: "Graph",
    description:
      "A component that renders various types of charts (bar, line, pie) using Recharts. Supports customizable data visualization with labels, datasets, and styling options.",
    component: Graph,
    propsSchema: graphSchema,
  },
  {
    name: "DataCard",
    description:
      "A component that displays options as clickable cards with links and summaries with the ability to select multiple items.",
    component: DataCard,
    propsSchema: dataCardSchema,
  },
  {
    name: "BudgetKpis",
    description:
      "A KPI header for the selected month showing income, expense, net, and uncategorized count.",
    component: BudgetKpis,
    propsSchema: budgetKpisSchema,
  },
  {
    name: "EnvelopeBoard",
    description:
      "An envelope budgeting board: budgeted/spent/remaining per expense category for a month.",
    component: EnvelopeBoard,
    propsSchema: envelopeBoardSchema,
  },
  {
    name: "TransactionsTable",
    description:
      "A transaction table with month filter, search, and category assignment.",
    component: TransactionsTable,
    propsSchema: transactionsTableSchema,
  },
  {
    name: "ImportWizard",
    description:
      "A CSV import wizard for transactions, including mapping and preview.",
    component: ImportWizard,
    propsSchema: importWizardSchema,
  },
  // Add more components here
];
