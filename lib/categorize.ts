import type { CategoryRule } from "./db.client";

function normalize(str: string) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function categorizeTransaction(description: string, rules: CategoryRule[]): string {
  const lower = normalize(description);
  for (const rule of rules) {
    if (lower.includes(normalize(rule.keyword))) {
      return rule.category;
    }
  }
  return "Outros";
}

export function parseNubankCSV(
  csvText: string,
  rules: CategoryRule[]
): Array<{ date: string; description: string; amount: number; category: string }> {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return [];

  const headerCols = parseCSVLine(lines[0]).map((h) =>
    h.trim().replace(/"/g, "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  );

  const idx = (names: string[]) => {
    for (const name of names) {
      const i = headerCols.indexOf(name);
      if (i !== -1) return i;
    }
    return -1;
  };

  const dateIdx = idx(["date", "data"]);
  const titleIdx = idx(["title", "titulo", "descricao", "description"]);
  const amountIdx = idx(["amount", "valor"]);
  const categoryIdx = idx(["category", "categoria"]);

  if (dateIdx === -1 || amountIdx === -1) return [];

  const results: Array<{ date: string; description: string; amount: number; category: string }> = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = parseCSVLine(line).map((c) => c.trim().replace(/"/g, ""));

    const rawDate = cols[dateIdx] ?? "";
    const rawAmount = cols[amountIdx] ?? "0";
    const description = titleIdx !== -1 ? (cols[titleIdx] ?? "") : "";
    let category = categoryIdx !== -1 ? (cols[categoryIdx] ?? "") : "";

    const date = normalizeDate(rawDate);
    if (!date || !description) continue;

    const amount = parseFloat(rawAmount.replace(",", "."));
    if (isNaN(amount)) continue;

    if (!category || category === "-") {
      category = categorizeTransaction(description, rules);
    }

    results.push({ date, description, amount, category });
  }

  return results;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function normalizeDate(raw: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const dmy = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  const dmyDash = raw.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dmyDash) return `${dmyDash[3]}-${dmyDash[2]}-${dmyDash[1]}`;
  return "";
}
