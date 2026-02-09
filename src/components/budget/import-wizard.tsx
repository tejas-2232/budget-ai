"use client";

import { cn } from "@/lib/utils";
import {
  previewCsvImport,
  commitCsvImport,
  type CsvMapping,
  type ImportCommitResult,
} from "@/services/budget/import";
import { useBudgetState } from "@/lib/budget/store";
import { z } from "zod";
import * as React from "react";

export const importWizardSchema = z.object({
  title: z.string().optional().describe("Optional heading"),
});

export type ImportWizardProps = z.infer<typeof importWizardSchema> & {
  className?: string;
  onImported?: (result: ImportCommitResult) => void;
};

const FIELD_LABELS: Array<{ key: keyof CsvMapping; label: string; required?: boolean }> = [
  { key: "date", label: "date", required: true },
  { key: "account", label: "account", required: true },
  { key: "amount", label: "amount", required: true },
  { key: "currency", label: "currency" },
  { key: "description", label: "description" },
  { key: "merchant", label: "merchant" },
  { key: "category", label: "category" },
  { key: "tags", label: "tags" },
  { key: "notes", label: "notes" },
];

export function ImportWizard({ title, className, onImported }: ImportWizardProps) {
  const state = useBudgetState((s) => s);
  const [csvText, setCsvText] = React.useState("");
  const [filename, setFilename] = React.useState<string>("import.csv");
  const [preview, setPreview] = React.useState<ReturnType<typeof previewCsvImport> | null>(null);
  const [mapping, setMapping] = React.useState<CsvMapping>({});
  const [result, setResult] = React.useState<ImportCommitResult | null>(null);
  const [error, setError] = React.useState<
    | string
    | null
    | {
        title: string;
        body: string;
        details?: string;
      }
  >(null);
  const [isBusy, setIsBusy] = React.useState(false);
  const [showPaste, setShowPaste] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(false);

  const loadPreview = React.useCallback((text: string) => {
    try {
      const p = previewCsvImport(text);
      setPreview(p);
      setMapping(p.suggestedMapping ?? {});
      setError(null);
    } catch (e) {
      setError({
        title: "We couldn’t read that CSV yet.",
        body: "Check that it includes a header row and uses commas to separate columns.",
        details: e instanceof Error ? e.message : undefined,
      });
      setPreview(null);
    }
  }, []);

  const onFile = async (file: File | null) => {
    if (!file) return;
    setFilename(file.name);
    const text = await file.text();
    setCsvText(text);
    loadPreview(text);
  };

  const loadSample = async () => {
    try {
      setIsBusy(true);
      setError(null);
      const res = await fetch("/sample-transactions.csv");
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} while loading sample CSV`);
      }
      const text = await res.text();
      setFilename("sample-transactions.csv");
      setCsvText(text);
      loadPreview(text);
    } catch (e) {
      setError({
        title: "We couldn’t load the sample file.",
        body: "Refresh the page and try again.",
        details: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setIsBusy(false);
    }
  };

  const loadBigSample = async () => {
    try {
      setIsBusy(true);
      setError(null);
      const path = "/sample-transactions-big-2025H2-2026-01.csv";
      const res = await fetch(path);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} while loading big sample CSV`);
      }
      const text = await res.text();
      setFilename(path.slice(1));
      setCsvText(text);
      loadPreview(text);
      setShowPreview(true);
    } catch (e) {
      setError({
        title: "We couldn’t load the big sample file.",
        body: "Refresh the page and try again.",
        details: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setIsBusy(false);
    }
  };

  const canCommit =
    !!preview &&
    !!mapping.date &&
    !!mapping.account &&
    !!mapping.amount &&
    !isBusy;

  return (
    <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-muted-foreground">{title ?? "Import CSV"}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Default currency: <span className="font-medium">{state.settings.defaultCurrencyCode}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-lg border border-muted bg-container p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">Step 1: Choose a CSV</div>
            <button
              type="button"
              onClick={() => setShowPaste((v) => !v)}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
            >
              {showPaste ? "Hide paste" : "Paste instead"}
            </button>
          </div>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm"
          />
          <button
            type="button"
            onClick={loadSample}
            disabled={isBusy}
            className={cn(
              "mt-3 w-full rounded-md px-3 py-2 text-sm border border-border bg-background hover:bg-muted",
              isBusy && "opacity-50 cursor-not-allowed",
            )}
          >
            Load sample CSV
          </button>
          <button
            type="button"
            onClick={loadBigSample}
            disabled={isBusy}
            className={cn(
              "mt-2 w-full rounded-md px-3 py-2 text-sm border border-border bg-background hover:bg-muted",
              isBusy && "opacity-50 cursor-not-allowed",
            )}
          >
            Load big sample (Jul 2025 → Jan 2026)
          </button>
          <div className="text-xs text-muted-foreground mt-2 leading-relaxed">
            We’ll ask you to confirm the required columns before importing.
          </div>
        </div>

        <div className="rounded-lg border border-muted bg-container p-3">
          <div className="text-xs text-muted-foreground mb-2">Step 2: Preview</div>
          <div className="text-sm text-muted-foreground leading-relaxed">
            {preview
              ? `Found ${preview.rowCount} rows in “${filename}”.`
              : "Load a CSV to preview headers and mapping."}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isBusy || !csvText.trim()}
              onClick={() => loadPreview(csvText)}
              className={cn(
                "px-3 py-2 rounded-md text-sm border border-border bg-background hover:bg-muted",
                (!csvText.trim() || isBusy) && "opacity-50 cursor-not-allowed",
              )}
            >
              Preview CSV
            </button>
            {preview && (
              <button
                type="button"
                onClick={() => setShowPreview((v) => !v)}
                className="px-3 py-2 rounded-md text-sm border border-border bg-background hover:bg-muted"
              >
                {showPreview ? "Hide sample rows" : "Show sample rows"}
              </button>
            )}
          </div>

          {showPaste && (
            <div className="mt-3">
              <div className="text-xs text-muted-foreground mb-2">Paste CSV</div>
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="date,account,amount,currency,description,merchant,category,tags,notes"
                className="w-full h-28 rounded-md border border-border bg-background p-2 text-xs font-mono"
              />
            </div>
          )}
        </div>
      </div>

      {typeof error === "string" && (
        <div className="mt-3 text-sm text-destructive">{error}</div>
      )}
      {error && typeof error === "object" && (
        <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <div className="text-sm font-medium text-destructive">{error.title}</div>
          <div className="text-sm text-muted-foreground mt-1">{error.body}</div>
          {error.details && (
            <details className="mt-2">
              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                Show details
              </summary>
              <pre className="mt-2 text-xs text-muted-foreground overflow-auto max-h-40 whitespace-pre-wrap">
                {error.details}
              </pre>
            </details>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            <a
              href="/sample-transactions.csv"
              download
              className="px-3 py-1.5 rounded-md text-xs border border-border bg-background hover:bg-muted"
            >
              Download sample CSV
            </a>
          </div>
        </div>
      )}

      {preview && (
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="rounded-lg border border-muted bg-container p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium">Step 3: Map columns</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Required: date, account, amount
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMapping(preview.suggestedMapping ?? {})}
                className="px-3 py-1.5 rounded-md text-xs border border-border bg-background hover:bg-muted"
              >
                Auto-detect
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {FIELD_LABELS.filter((f) => f.required).map((f) => (
                <div key={String(f.key)} className="flex items-center gap-2">
                  <div className="w-28 text-xs text-muted-foreground">
                    {f.label}
                    <span className="text-destructive">*</span>
                  </div>
                  <select
                    className="flex-1 rounded-md border border-border bg-background px-2 py-1 text-sm"
                    value={(mapping[f.key] ?? "") as string}
                    onChange={(e) =>
                      setMapping((m) => ({ ...m, [f.key]: e.target.value || undefined }))
                    }
                  >
                    <option value="">Select a column</option>
                    {preview.headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <details className="mt-4">
              <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                Add more columns (optional)
              </summary>
              <div className="mt-3 space-y-2">
                {FIELD_LABELS.filter((f) => !f.required).map((f) => (
                  <div key={String(f.key)} className="flex items-center gap-2">
                    <div className="w-28 text-xs text-muted-foreground">{f.label}</div>
                    <select
                      className="flex-1 rounded-md border border-border bg-background px-2 py-1 text-sm"
                      value={(mapping[f.key] ?? "") as string}
                      onChange={(e) =>
                        setMapping((m) => ({ ...m, [f.key]: e.target.value || undefined }))
                      }
                    >
                      <option value="">(none)</option>
                      {preview.headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-muted-foreground leading-relaxed">
                Tip: If your CSV includes a <span className="font-medium">category</span>, we’ll save it as a single split equal to the full amount.
              </div>
            </details>

            <button
              disabled={!canCommit}
              onClick={async () => {
                setIsBusy(true);
                setResult(null);
                setError(null);
                try {
                  const res = commitCsvImport({ csvText, mapping, filename });
                  setResult(res);
                  onImported?.(res);
                  if (res.failedRows > 0) {
                    setError({
                      title: "Some rows need attention.",
                      body: "We imported what we could. Fix the failed rows and re-import (duplicates are ignored).",
                      details: res.errors
                        .slice(0, 8)
                        .map((x) => `Row ${x.rowNumber}: ${x.message}`)
                        .join("\n"),
                    });
                  }
                } catch (e) {
                  setError({
                    title: "Import didn’t finish.",
                    body: "Try again. If it keeps happening, start with the sample CSV to confirm the format.",
                    details: e instanceof Error ? e.message : undefined,
                  });
                } finally {
                  setIsBusy(false);
                }
              }}
              className={cn(
                "mt-4 w-full rounded-md px-4 py-2 text-sm font-medium",
                canCommit
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-muted-foreground cursor-not-allowed",
              )}
            >
              {isBusy ? "Importing..." : "Import"}
            </button>

            {result && (
              <div className="mt-3 text-xs text-muted-foreground">
                Imported {result.successRows}/{result.totalRows} rows • {result.failedRows} failed
              </div>
            )}
          </div>

          {showPreview && (
            <div className="rounded-lg border border-muted bg-container p-3">
              <div className="text-sm font-medium">Sample rows</div>
              <div className="mt-2 overflow-auto max-h-64">
                <table className="min-w-full text-xs">
                  <thead className="text-muted-foreground">
                    <tr>
                      {preview.headers.slice(0, 6).map((h) => (
                        <th key={h} className="text-left py-1 pr-2 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.sampleRows.slice(0, 6).map((r, idx) => (
                      <tr key={idx} className="border-t border-muted">
                        {preview.headers.slice(0, 6).map((h) => (
                          <td key={h} className="py-1 pr-2 whitespace-nowrap">
                            {r[h]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                Showing the first few columns for quick validation.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

