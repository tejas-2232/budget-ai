"use client";

import {
  MessageInput,
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

export default function InteractablesPage() {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

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
            isChatOpen ? "w-80" : "w-0"
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
              <BudgetKpis title="This month at a glance" />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ImportWizard title="Import transactions" />
                <div className="rounded-xl border border-border bg-card p-4">
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <EnvelopeBoard title="Envelopes" />
                <TransactionsTable title="Uncategorized transactions" onlyUncategorized />
              </div>

              <details className="rounded-xl border border-border bg-card p-4">
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
                  <TransactionsTable title="All transactions" />
                </div>
              </details>

              {showAdvanced && (
                <details open className="rounded-xl border border-border bg-card p-4">
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
                    <InsightsPanel />
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
