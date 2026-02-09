"use client";

export type LocalCsvUpload = {
  key: string;
  filename: string;
  text: string;
  createdAt: string;
  sizeChars: number;
};

const PREFIX = "budget-analyzer:csv-upload:";

function createKey() {
  const id =
    (typeof crypto !== "undefined" && "randomUUID" in crypto && crypto.randomUUID()) ||
    `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${PREFIX}${id}`;
}

export function saveLocalCsvUpload(args: {
  filename: string;
  text: string;
}): Omit<LocalCsvUpload, "text"> {
  // LocalStorage is typically ~5MB; be conservative.
  if (args.text.length > 4_500_000) {
    throw new Error(
      `CSV is too large to store locally (${args.text.length} chars). Try a smaller file.`,
    );
  }

  const key = createKey();
  const createdAt = new Date().toISOString();
  const payload: LocalCsvUpload = {
    key,
    filename: args.filename,
    text: args.text,
    createdAt,
    sizeChars: args.text.length,
  };

  localStorage.setItem(key, JSON.stringify(payload));
  return { key, filename: args.filename, createdAt, sizeChars: args.text.length };
}

export function getLocalCsvUpload(key: string): LocalCsvUpload {
  const raw = localStorage.getItem(key);
  if (!raw) {
    throw new Error(
      "CSV upload not found. Please re-attach the file (uploads are stored only in this browser).",
    );
  }
  const parsed = JSON.parse(raw) as LocalCsvUpload;
  if (!parsed?.text || !parsed?.filename) {
    throw new Error("CSV upload is corrupted. Please re-attach the file.");
  }
  return parsed;
}

export function deleteLocalCsvUpload(key: string) {
  localStorage.removeItem(key);
}

