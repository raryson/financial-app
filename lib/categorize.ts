import getDb from "./db";

type Rule = { keyword: string; category: string };

export function loadRules(): Rule[] {
  const db = getDb();
  return db.prepare("SELECT keyword, category FROM category_rules").all() as Rule[];
}

export function categorizeTransaction(description: string, rules?: Rule[]): string {
  const resolvedRules = rules ?? loadRules();
  const lower = description.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  for (const rule of resolvedRules) {
    const keyword = rule.keyword.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (lower.includes(keyword)) {
      return rule.category;
    }
  }

  return "Outros";
}

export function parseNubankCSV(csvText: string): Array<{
  date: string;
  description: string;
  amount: number;
  category: string;
}> {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return [];

  // Parse header to find column indices dynamically
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

  // Must have at least date and amount
  if (dateIdx === -1 || amountIdx === -1) return [];

  const transactions: Array<{
    date: string;
    description: string;
    amount: number;
    category: string;
  }> = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = parseCSVLine(line).map((c) => c.trim().replace(/"/g, ""));

    const rawDate = cols[dateIdx] ?? "";
    const rawAmount = cols[amountIdx] ?? "0";
    const description = titleIdx !== -1 ? (cols[titleIdx] ?? "") : "";
    let category = categoryIdx !== -1 ? (cols[categoryIdx] ?? "") : "";

    const date = normalizeDate(rawDate);
    if (!date) continue;

    const amount = parseFloat(rawAmount.replace(",", "."));
    if (isNaN(amount)) continue;

    if (!description) continue;

    // Auto-categorize if no category column or value is empty/dash
    if (!category || category === "-") {
      category = categorizeTransaction(description);
    }

    transactions.push({ date, description, amount, category });
  }

  return transactions;
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
  // Handle DD/MM/YYYY
  const dmyMatch = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dmyMatch) return `${dmyMatch[3]}-${dmyMatch[2]}-${dmyMatch[1]}`;

  // Handle YYYY-MM-DD (already correct)
  const ymdMatch = raw.match(/^\d{4}-\d{2}-\d{2}$/);
  if (ymdMatch) return raw;

  // Handle DD-MM-YYYY
  const dmyDashMatch = raw.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dmyDashMatch) return `${dmyDashMatch[3]}-${dmyDashMatch[2]}-${dmyDashMatch[1]}`;

  return "";
}
