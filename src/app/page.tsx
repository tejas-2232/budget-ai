import { ApiKeyCheck } from "@/components/ApiKeyCheck";
import Image from "next/image";

const KeyFilesSection = () => (
  <div className="bg-card px-8 py-6 rounded-xl border border-border">
    <h2 className="text-xl font-semibold mb-4">Where things live</h2>
    <ul className="space-y-4 text-muted-foreground text-sm">
      <li className="flex items-start gap-2">
        <span>📄</span>
        <span>
          <code className="font-medium">src/app/interactables/page.tsx</code> -
          Budget workspace (import + envelopes + transactions)
        </span>
      </li>
      <li className="flex items-start gap-2">
        <span>📄</span>
        <span>
          <code className="font-medium font-mono">src/app/chat/page.tsx</code> -
          Chat-only view
        </span>
      </li>
      <li className="flex items-start gap-2">
        <span>📄</span>
        <span>
          <code className="font-medium font-mono">
            src/components/tambo/message-thread-full.tsx
          </code>{" "}
          - Chat UI shell (thread + history + suggestions)
        </span>
      </li>
      <li className="flex items-start gap-2">
        <span>📄</span>
        <span>
          <code className="font-medium font-mono">
            src/lib/tambo.ts
          </code>{" "}
          - Tambo component + tool registration
        </span>
      </li>
      <li className="flex items-start gap-2">
        <span className="text-blue-500">📄</span>
        <span>
          <code className="font-medium font-mono">src/lib/budget/*</code> -
          LocalStorage-backed budget store + types
        </span>
      </li>
      <li className="flex items-start gap-2">
        <span className="text-blue-500">📄</span>
        <span>
          <code className="font-medium font-mono">src/services/budget/*</code> -
          CSV import + budget queries + tool implementations
        </span>
      </li>
    </ul>
    <div className="flex gap-4 flex-wrap mt-4">
      <a
        href="/sample-transactions.csv"
        className="px-4 py-2 rounded-md font-medium transition-colors text-sm mt-2 border border-border hover:bg-muted"
        download
      >
        Download sample CSV
      </a>
      <a
        href="https://docs.tambo.co"
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 rounded-md font-medium transition-colors text-sm mt-2 border border-border hover:bg-muted"
      >
        Tambo docs
      </a>
    </div>
  </div>
);

export default function Home() {
  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center font-[family-name:var(--font-geist-sans)] bg-background">
      <main className="max-w-3xl w-full space-y-8">
        <div className="flex flex-col items-center">
          <a href="https://tambo.co" target="_blank" rel="noopener noreferrer">
            <Image
              src="/Octo-Icon.svg"
              alt="Tambo"
              width={80}
              height={80}
              className="mb-4"
            />
          </a>
          <h1 className="text-4xl text-center">Budget Analyzer</h1>
          <p className="text-muted-foreground text-center mt-2 max-w-xl">
            Import a CSV, assign categories, set envelope budgets, and explore
            insights—powered by Tambo.
          </p>
        </div>

        <div className="w-full space-y-8">
          <div className="bg-card px-8 py-6 rounded-xl border border-border">
            <h2 className="text-xl font-semibold mb-2">Get started</h2>
            <p className="text-sm text-muted-foreground">
              Add your Tambo key, then open the workspace.
            </p>
            <ApiKeyCheck>
              <div className="flex gap-4 flex-wrap">
                <a
                  href="/interactables"
                  className="px-6 py-3 rounded-md font-medium shadow-sm transition-colors text-lg mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Open Budget Workspace →
                </a>
                <a
                  href="/chat"
                  className="px-6 py-3 rounded-md font-medium shadow-sm transition-colors text-lg mt-4 border border-border hover:bg-muted"
                >
                  Open Chat →
                </a>
              </div>
            </ApiKeyCheck>
            <div className="mt-4 text-sm text-muted-foreground">
              Tip: In the workspace, click <span className="font-medium">Load sample CSV</span>{" "}
              to try it instantly.
            </div>
          </div>

          <KeyFilesSection />
        </div>
      </main>
    </div>
  );
}
