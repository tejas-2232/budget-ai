"use client";

import {
  MessageInput,
  MessageInputFileButton,
  MessageInputMcpConfigButton,
  MessageInputMcpPromptButton,
  MessageInputMcpResourceButton,
  MessageInputSubmitButton,
  MessageInputTextarea,
  MessageInputToolbar,
} from "@/components/tambo/message-input";
import { ScrollableMessageContainer } from "@/components/tambo/scrollable-message-container";
import {
  ThreadContent,
  ThreadContentMessages,
} from "@/components/tambo/thread-content";
import { components, tools } from "@/lib/tambo";
import { TamboProvider } from "@tambo-ai/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { ImportWizard } from "@/components/budget/import-wizard";
import { BudgetKpis } from "@/components/budget/budget-kpis";
import { EnvelopeBoard } from "@/components/budget/envelope-board";
import { TransactionsTable } from "@/components/budget/transactions-table";
import { InsightsPanel } from "@/components/budget/insights-panel";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ThemeToggle } from "@/components/landing/ThemeToggle";
import { useBudgetState } from "@/lib/budget/store";
import {
  getCurrentMonthYyyyMm,
  listAvailableMonthsFromState,
} from "@/services/budget/queries";
import { MonthPicker } from "@/components/budget/month-picker";
import * as React from "react";

export default function InteractablesPage() {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const state = useBudgetState((s) => s);
  const months = React.useMemo(() => listAvailableMonthsFromState(state), [state]);

  const [workspaceMonth, setWorkspaceMonth] = React.useState(() => getCurrentMonthYyyyMm());

  React.useEffect(() => {
    if (months.length === 0) return;
    // If current selection isn't in data (common for sample CSV), jump to latest month with data.
    if (!months.includes(workspaceMonth)) {
      setWorkspaceMonth(months[months.length - 1]!);
    }
  }, [months, workspaceMonth]);

  return (
    <TamboProvider
      apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
      components={components}
      tools={tools}
      tamboUrl={process.env.NEXT_PUBLIC_TAMBO_URL}
    >
      <div className={cn("flex h-screen workspace-bg")}>
        {/* Chat Sidebar */}
        <div
          className={`${
            isChatOpen ? "w-[380px] md:w-[420px] lg:w-[460px]" : "w-0"
          } border-r border-border bg-card transition-all duration-300 flex flex-col relative`}
        >
          {isChatOpen && (
            <>
              <div className="p-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">
                  Assistant
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Ask to import, categorize, or explain your budget.
                </p>
              </div>

              <ScrollableMessageContainer className="flex-1 p-4">
                <ThreadContent variant="default">
                  <ThreadContentMessages />
                </ThreadContent>
              </ScrollableMessageContainer>

              <div className="p-4 border-t border-border">
                <MessageInput variant="bordered">
                  <MessageInputTextarea placeholder="Ask about your budget…" />
                  <MessageInputToolbar>
                    <MessageInputFileButton />
                    <MessageInputMcpPromptButton />
                    <MessageInputMcpResourceButton />
                    <MessageInputMcpConfigButton />
                    <MessageInputSubmitButton />
                  </MessageInputToolbar>
                </MessageInput>
              </div>
            </>
          )}

          {/* Toggle Button */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="absolute -right-10 top-1/2 -translate-y-1/2 bg-card border border-border rounded-r-lg p-2 hover:bg-muted"
            aria-label={isChatOpen ? "Collapse assistant" : "Expand assistant"}
          >
            {isChatOpen ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* Workspace top bar */}
          <div className="sticky top-0 z-40 backdrop-blur bg-background/70 border-b border-border">
            <div className="max-w-6xl mx-auto px-6 md:px-8 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <div className="text-sm text-muted-foreground">Workspace</div>
                <div className="text-lg font-semibold tracking-tight">
                  Budget overview
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/"
                  className="px-3 py-2 rounded-md text-sm border border-border bg-background hover:bg-muted"
                >
                  Home
                </Link>
                <Link
                  href="/chat"
                  className="px-3 py-2 rounded-md text-sm border border-border bg-background hover:bg-muted"
                >
                  Chat-only
                </Link>
                <MonthPicker
                  value={workspaceMonth}
                  months={months.length ? months : [workspaceMonth]}
                  onChange={setWorkspaceMonth}
                  className="ml-1"
                  dense
                />
                <ThemeToggle />
                <button
                  type="button"
                  onClick={() => setShowAdvanced((v) => !v)}
                  className="px-3 py-2 rounded-md text-sm border border-border bg-background hover:bg-muted"
                >
                  {showAdvanced ? "Hide advanced" : "Show advanced"}
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="max-w-6xl mx-auto space-y-4">
              <div className="gradient-border rounded-xl p-[1px]">
                <BudgetKpis
                  title="This month at a glance"
                  month={workspaceMonth}
                  className="border-0 rounded-xl bg-card/90"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="gradient-border rounded-xl p-[1px]">
                  <ImportWizard
                    title="Import transactions"
                    className="border-0 rounded-xl bg-card/90"
                  />
                </div>
                <div className="gradient-border rounded-xl p-[1px]">
                  <div className="rounded-xl bg-card/90 p-4">
                  <div className="text-sm text-muted-foreground">Next step</div>
                  <div className="text-xl font-semibold tracking-tight">
                    Categorize → budget
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-prose">
                    Start by categorizing uncategorized transactions. Then set envelope budgets for the month.
                    Keep it simple: one category per transaction.
                  </p>
                  <div className="mt-4 text-xs text-muted-foreground">
                    Tip: Use the assistant to batch-categorize merchants (e.g. “Categorize all Amazon as Shopping”).
                  </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="gradient-border rounded-xl p-[1px]">
                  <EnvelopeBoard
                    title="Envelopes"
                    month={workspaceMonth}
                    className="border-0 rounded-xl bg-card/90"
                  />
                </div>
                <div className="gradient-border rounded-xl p-[1px]">
                  <TransactionsTable
                    title="Uncategorized transactions"
                    month={workspaceMonth}
                    onlyUncategorized
                    className="border-0 rounded-xl bg-card/90"
                  />
                </div>
              </div>

              <details className="gradient-border rounded-xl p-[1px]">
                <div className="rounded-xl bg-card/90 p-4">
                <summary className="cursor-pointer select-none">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Progressive disclosure
                      </div>
                      <div className="text-lg font-semibold tracking-tight">
                        All transactions
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Expand when you need it
                    </span>
                  </div>
                </summary>
                <div className="mt-4">
                  <div className="gradient-border rounded-xl p-[1px]">
                    <TransactionsTable
                      title="All transactions"
                      month={workspaceMonth}
                      className="border-0 rounded-xl bg-card/90"
                    />
                  </div>
                </div>
                </div>
              </details>

              {showAdvanced && (
                <details open className="gradient-border rounded-xl p-[1px]">
                  <div className="rounded-xl bg-card/90 p-4">
                  <summary className="cursor-pointer select-none">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Progressive disclosure
                        </div>
                        <div className="text-lg font-semibold tracking-tight">
                          Advanced insights
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Graphs + trends
                      </span>
                    </div>
                  </summary>
                  <div className="mt-4">
                    <div className="gradient-border rounded-xl p-[1px]">
                      <InsightsPanel
                        month={workspaceMonth}
                        className="border-0 rounded-xl bg-card/90"
                      />
                    </div>
                  </div>
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      </div>
    </TamboProvider>
  );
}
