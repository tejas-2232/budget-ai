export type ParsedCsv = {
  headers: string[];
  rows: string[][];
};

/**
 * Minimal CSV parser supporting:
 * - commas
 * - quoted fields with escaped quotes ("")
 * - CRLF / LF newlines
 */
export function parseCsv(text: string): ParsedCsv {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  const pushField = () => {
    row.push(field);
    field = "";
  };
  const pushRow = () => {
    // Skip completely empty trailing row
    if (row.length === 1 && row[0] === "" && rows.length > 0) {
      row = [];
      return;
    }
    rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const c = text[i];

    if (inQuotes) {
      if (c === '"') {
        const next = text[i + 1];
        if (next === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }

    if (c === '"') {
      inQuotes = true;
      continue;
    }

    if (c === ",") {
      pushField();
      continue;
    }

    if (c === "\n") {
      pushField();
      pushRow();
      continue;
    }

    if (c === "\r") {
      // handle CRLF
      const next = text[i + 1];
      if (next === "\n") {
        i += 1;
      }
      pushField();
      pushRow();
      continue;
    }

    field += c;
  }

  // flush last field/row
  pushField();
  pushRow();

  const headers = rows[0]?.map((h) => h.trim()) ?? [];
  const dataRows = rows.slice(1);

  return { headers, rows: dataRows };
}

export function normalizeHeaderName(h: string) {
  return h.trim().toLowerCase().replace(/\s+/g, "");
}

