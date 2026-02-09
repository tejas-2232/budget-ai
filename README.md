# Budget Analyzer (Tambo-powered)

Budget Analyzer is an AI-assisted, local-first envelope budgeting app. Import a bank transaction CSV, map columns with a guided preview, and get an interactive dashboard (KPIs, envelopes, transactions) that you can also manage through a built-in Tambo chat assistant.

## What it does

- **CSV import**: Upload or paste a transactions CSV, preview headers + sample rows, then map fields and import.
- **Budget dashboard**:
  - **KPIs** for a month: income, expense, net, uncategorized count.
  - **Envelope board**: budgeted vs spent vs remaining per category, with quick budget edits.
  - **Transactions table**: search + month filter + quick categorization.
- **AI assistant (Tambo)**: Ask questions like “show top spending categories” or “categorize these transactions” and have the assistant take structured actions via tools.
- **Guided workflow**:
  - Landing page has an interactive “How to use this app” stepper.
  - Workspace has a “Quickstart” panel that scrolls/highlights the next section.

## How we used Tambo

We use Tambo for both **generative UI** and **tool calling**:

- **Provider + chat**: The app is wrapped in `TamboProvider` and uses `MessageThreadFull` for the chat UI (`src/app/chat/page.tsx` and `src/app/interactables/page.tsx`).
- **Generative components**: We register real React components with **Zod schemas** so the assistant can safely render UI in responses (`src/lib/tambo.ts`):
  - `BudgetKpis`, `EnvelopeBoard`, `TransactionsTable`, `ImportWizard` (and `Graph` for charts).
- **Tools (actions + queries)**: We register typed tools (with Zod input/output schemas) so the assistant can operate on your budget data (`src/services/budget/tools.ts`), including:
  - CSV preview + commit import
  - CSV preview + commit import **from a local upload key** (for large CSV attachments)
  - Envelope summary + setting monthly envelope budgets
  - Listing uncategorized transactions + categorizing a transaction
  - Spending by category + spending trends

## Routes / pages

- `/`: Landing page (design + onboarding workflow)
- `/interactables`: Budget workspace (dashboard + assistant sidebar)
- `/chat`: Chat-only page (full thread UI)

## Data + privacy

This project is **local-first**: your imported transactions and budgeting state are stored in **browser localStorage** (see `src/lib/budget/store.ts`). No database is required to run the app.

## Getting started

### Prerequisites

- Node.js + npm (recommended: Node 18+)
- A Tambo API key from the dashboard at `https://tambo.co/dashboard`

### Setup

1. Install dependencies

```bash
npm install
```

2. Create `.env.local`

Copy `example.env.local` to `.env.local` and set your key:

```env
NEXT_PUBLIC_TAMBO_API_KEY=your-api-key-here
```

Optional (only if running a custom Tambo server):

```env
NEXT_PUBLIC_TAMBO_URL=http://localhost:3001
```

3. Run the app

```bash
npm run dev
```

Open `http://localhost:3000`.

## How to use

1. Go to the **Workspace** at `/interactables`.
2. In **Quickstart → Import a CSV**, choose one:
   - **Load sample CSV** (small) or **Load big sample** (Jul 2025 → Jan 2026)
   - Upload your own `.csv`
3. Click **Preview CSV**, confirm/adjust mapping (required: `date`, `account`, `amount`), then click **Import**.
4. After import, the workspace will jump you to **Uncategorized transactions**.
5. Categorize uncategorized rows (or ask the assistant to batch-categorize).
6. Set envelope budgets in **Envelopes** (edit the number and press Enter).
7. Enable **Advanced insights** to see charts (spending by category + daily trend).

### Sample data

- Small sample: `public/sample-transactions.csv`
- Big sample: `public/sample-transactions-big-2025H2-2026-01.csv`

### CSV attach note (Tambo message length limit)

Tambo chat messages are limited to ~10,000 characters. If you attach a large CSV via the chat sidebar:

- The CSV is saved **locally in your browser** and you’ll see a **Local key**
- Use the tools:
  - `importCsvPreviewFromLocal({ key })`
  - `importCsvCommitFromLocal({ key, mapping })`

This avoids “message too long” while keeping data local-first.

### Example assistant prompts

Try these in the workspace assistant:

   - “List uncategorized transactions for this month and categorize coffee as Dining.”
   - “Set a $300 budget for Groceries for 2026-02.”
   - “Show spending by category for this month.”
   - “Show a daily spending trend for this month.”

## Repo structure (key files)

- `src/lib/tambo.ts`: registers Tambo components + tools (schemas included)
- `src/services/budget/tools.ts`: tool implementations used by the assistant
- `src/components/budget/*`: KPI header, envelope board, CSV import wizard, transaction table
- `src/components/budget/workspace-guide.tsx`: workspace quickstart + scroll/highlight navigation
- `src/components/landing/WorkflowGuide.tsx`: landing page workflow stepper
- `src/lib/budget/store.ts`: local storage budget state + subscriptions
- `budgetschema.sql`: reference schema (useful for understanding entities/relationships)

## Deployment notes (Netlify)

- If you deploy on Netlify, ensure deep links like `/interactables#envelopes` work by enabling SPA-style fallback to `index.html` (typical Netlify Next.js setups already handle this).
- `/` stays a landing page, while `/interactables` is the main workspace.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run lint:fix
npm run init   # runs: npx tambo init
```

## Notes

- Keep `.env.local` private and **do not commit** it to source control.
- For Tambo docs, see `https://docs.tambo.co`.
