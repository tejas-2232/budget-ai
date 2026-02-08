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

export function ImportWizard({ title, className }: ImportWizardProps) {
  const state = useBudgetState((s) => s);
  const [csvText, setCsvText] = React.useState("");
  const [filename, setFilename] = React.useState<string>("import.csv");
  const [preview, setPreview] = React.useState<ReturnType<typeof previewCsvImport> | null>(null);
  const [mapping, setMapping] = React.useState<CsvMapping>({});
  const [result, setResult] = React.useState<ImportCommitResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isBusy, setIsBusy] = React.useState(false);

  const loadPreview = React.useCallback((text: string) => {
    try {
      const p = previewCsvImport(text);
      setPreview(p);
      setMapping(p.suggestedMapping ?? {});
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to parse CSV");
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
      if (!res.ok) throw new Error("Failed to load sample CSV");
      const text = await res.text();
      setFilename("sample-transactions.csv");
      setCsvText(text);
      loadPreview(text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load sample CSV");
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
          <div className="text-xs text-muted-foreground mb-2">Upload</div>
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
          <div className="text-xs text-muted-foreground mt-2">
            Or paste CSV below.
          </div>
        </div>

        <div className="rounded-lg border border-muted bg-container p-3">
          <div className="text-xs text-muted-foreground mb-2">CSV text</div>
          <textarea
            value={csvText}
            onChange={(e) => {
              setCsvText(e.target.value);
            }}
            onBlur={() => {
              if (csvText.trim()) loadPreview(csvText);
            }}
            placeholder="date,account,amount,currency,description,merchant,category,tags,notes"
            className="w-full h-28 rounded-md border border-border bg-background p-2 text-xs font-mono"
          />
        </div>
      </div>

      {error && <div className="mt-3 text-sm text-destructive">{error}</div>}

      {preview && (
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="rounded-lg border border-muted bg-container p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Mapping</div>
              <div className="text-xs text-muted-foreground">
                Rows: {preview.rowCount}
              </div>
            </div>

            <div className="mt-3 space-y-2">
              {FIELD_LABELS.map((f) => (
                <div key={String(f.key)} className="flex items-center gap-2">
                  <div className="w-28 text-xs text-muted-foreground">
                    {f.label}
                    {f.required ? <span className="text-destructive">*</span> : null}
                  </div>
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

            <button
              disabled={!canCommit}
              onClick={async () => {
                try {
                  setIsBusy(true);
                  setResult(null);
                  setError(null);
                  const res = commitCsvImport({ csvText, mapping, filename });
                  setResult(res);
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Import failed");
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
          </div>

          <div className="rounded-lg border border-muted bg-container p-3">
            <div className="text-sm font-medium">Preview</div>
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

            {result && (
              <div className="mt-3 text-xs">
                <div className="font-medium">Imported</div>
                <div className="text-muted-foreground mt-1">
                  {result.successRows}/{result.totalRows} rows • {result.failedRows} failed
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

