export type CategoryRule = { keyword: string; category: string };

// Plain constant — no database, no async, no timing issues.
// First match wins, so more specific keywords must come before generic ones.
export const CATEGORY_RULES: CategoryRule[] = [
  // ── Alimentação ──────────────────────────────────────────────────
  { keyword: "ifood", category: "Alimentação" },
  { keyword: "ifd*ifood", category: "Alimentação" },
  { keyword: "uber eats", category: "Alimentação" },
  { keyword: "rappi", category: "Alimentação" },
  { keyword: "restaurante", category: "Alimentação" },
  { keyword: "lanchonete", category: "Alimentação" },
  { keyword: "padaria", category: "Alimentação" },
  { keyword: "pizza", category: "Alimentação" },
  { keyword: "burger", category: "Alimentação" },
  { keyword: "mcdonalds", category: "Alimentação" },
  { keyword: "subway", category: "Alimentação" },
  { keyword: "starbucks", category: "Alimentação" },
  { keyword: "sushi", category: "Alimentação" },
  { keyword: "churrascaria", category: "Alimentação" },
  { keyword: "churrasca", category: "Alimentação" },
  { keyword: "churrasco", category: "Alimentação" },
  { keyword: "salao exte", category: "Alimentação" },
  { keyword: "pastel", category: "Alimentação" },
  { keyword: "coxinha", category: "Alimentação" },
  { keyword: "esfirra", category: "Alimentação" },
  { keyword: "temaki", category: "Alimentação" },
  { keyword: "tapioca", category: "Alimentação" },
  { keyword: "acai", category: "Alimentação" },
  { keyword: "sorveteria", category: "Alimentação" },
  { keyword: "confeitaria", category: "Alimentação" },
  { keyword: "bistro", category: "Alimentação" },
  { keyword: "grill", category: "Alimentação" },
  { keyword: "stanzad", category: "Alimentação" },
  { keyword: "coco bambu", category: "Alimentação" },
  { keyword: "el estanciero", category: "Alimentação" },
  { keyword: "estanciero", category: "Alimentação" },
  { keyword: "la mafia", category: "Alimentação" },
  { keyword: "tumelero", category: "Alimentação" },
  { keyword: "spazio verde", category: "Alimentação" },
  { keyword: "aliment", category: "Alimentação" },
  { keyword: "birra", category: "Alimentação" },
  { keyword: "substrato dom cafe", category: "Alimentação" },
  { keyword: "cafe", category: "Alimentação" },
  { keyword: "doces", category: "Alimentação" },
  { keyword: "maquine", category: "Alimentação" },
  { keyword: "bar ", category: "Alimentação" },
  { keyword: "food", category: "Alimentação" },

  // ── Supermercado ──────────────────────────────────────────────────
  { keyword: "mini mercado", category: "Supermercado" },
  { keyword: "mercado livre", category: "Compras" },  // must be before "mercado"
  { keyword: "mercado", category: "Supermercado" },
  { keyword: "supermercado", category: "Supermercado" },
  { keyword: "super ", category: "Supermercado" },
  { keyword: "hiper", category: "Supermercado" },
  { keyword: "mart ", category: "Supermercado" },
  { keyword: "cestto", category: "Supermercado" },
  { keyword: "cesto", category: "Supermercado" },
  { keyword: "feira ", category: "Supermercado" },
  { keyword: "mercearia", category: "Supermercado" },
  { keyword: "armazem", category: "Supermercado" },
  { keyword: "vendinha", category: "Supermercado" },
  { keyword: "carrefour", category: "Supermercado" },
  { keyword: "pao de acucar", category: "Supermercado" },
  { keyword: "extra ", category: "Supermercado" },
  { keyword: "hortifruti", category: "Supermercado" },
  { keyword: "atacadao", category: "Supermercado" },
  { keyword: "assai", category: "Supermercado" },
  { keyword: "prezunic", category: "Supermercado" },
  { keyword: "mundial", category: "Supermercado" },
  { keyword: "rissul", category: "Supermercado" },
  { keyword: "bistek", category: "Supermercado" },
  { keyword: "condor", category: "Supermercado" },
  { keyword: "angeloni", category: "Supermercado" },
  { keyword: "festval", category: "Supermercado" },
  { keyword: "gimenes", category: "Supermercado" },
  { keyword: "scottalimentos", category: "Supermercado" },
  { keyword: "scotalimentos", category: "Supermercado" },
  { keyword: "zaffari", category: "Supermercado" },
  { keyword: "walmart", category: "Supermercado" },
  { keyword: "sams club", category: "Supermercado" },
  { keyword: "makro", category: "Supermercado" },

  // ── Transporte ────────────────────────────────────────────────────
  { keyword: "nutag", category: "Transporte" },
  { keyword: "allpark", category: "Transporte" },
  { keyword: "uber", category: "Transporte" },
  { keyword: "99app", category: "Transporte" },
  { keyword: "99 ", category: "Transporte" },
  { keyword: "taxi", category: "Transporte" },
  { keyword: "combustivel", category: "Transporte" },
  { keyword: "posto ", category: "Transporte" },
  { keyword: "shell", category: "Transporte" },
  { keyword: "petrobras", category: "Transporte" },
  { keyword: "ipiranga", category: "Transporte" },
  { keyword: "estacionamento", category: "Transporte" },
  { keyword: "autopark", category: "Transporte" },
  { keyword: "indigo park", category: "Transporte" },
  { keyword: "sem parar", category: "Transporte" },
  { keyword: "veloe", category: "Transporte" },
  { keyword: "conectcar", category: "Transporte" },
  { keyword: "estapar", category: "Transporte" },

  // ── Saúde ─────────────────────────────────────────────────────────
  { keyword: "farmacia", category: "Saúde" },
  { keyword: "farmacias", category: "Saúde" },
  { keyword: "drogaria", category: "Saúde" },
  { keyword: "droga", category: "Saúde" },
  { keyword: "ultrafarma", category: "Saúde" },
  { keyword: "hospital", category: "Saúde" },
  { keyword: "clinica", category: "Saúde" },
  { keyword: "medico", category: "Saúde" },
  { keyword: "laboratorio", category: "Saúde" },
  { keyword: "drogasil", category: "Saúde" },
  { keyword: "pacheco", category: "Saúde" },
  { keyword: "sao joao", category: "Saúde" },
  { keyword: "nissei", category: "Saúde" },
  { keyword: "jiujit", category: "Saúde" },
  { keyword: "academia", category: "Saúde" },
  { keyword: "fitness", category: "Saúde" },
  { keyword: "vindi", category: "Saúde" },

  // ── Entretenimento ────────────────────────────────────────────────
  { keyword: "netflix", category: "Entretenimento" },
  { keyword: "spotify", category: "Entretenimento" },
  { keyword: "youtube", category: "Entretenimento" },
  { keyword: "amazonprime", category: "Entretenimento" },
  { keyword: "disney", category: "Entretenimento" },
  { keyword: "hbo", category: "Entretenimento" },
  { keyword: "globoplay", category: "Entretenimento" },
  { keyword: "globo*globo", category: "Entretenimento" },
  { keyword: "cinema", category: "Entretenimento" },
  { keyword: "steam", category: "Entretenimento" },
  { keyword: "twitch", category: "Entretenimento" },
  { keyword: "deezer", category: "Entretenimento" },
  { keyword: "crunchyroll", category: "Entretenimento" },
  { keyword: "sonyplaystatn", category: "Entretenimento" },
  { keyword: "playstation", category: "Entretenimento" },
  { keyword: "battle net", category: "Entretenimento" },
  { keyword: "battlenet", category: "Entretenimento" },
  { keyword: "xbox", category: "Entretenimento" },
  { keyword: "komapeeventos", category: "Entretenimento" },
  { keyword: "komapee", category: "Entretenimento" },
  { keyword: "eventos", category: "Entretenimento" },
  { keyword: "ingresso", category: "Entretenimento" },

  // ── Compras ───────────────────────────────────────────────────────
  { keyword: "amazon", category: "Compras" },
  { keyword: "shopee", category: "Compras" },
  { keyword: "americanas", category: "Compras" },
  { keyword: "magazine luiza", category: "Compras" },
  { keyword: "magalu", category: "Compras" },
  { keyword: "aliexpress", category: "Compras" },
  { keyword: "shein", category: "Compras" },
  { keyword: "zara", category: "Compras" },
  { keyword: "renner", category: "Compras" },
  { keyword: "riachuelo", category: "Compras" },
  { keyword: "eletro", category: "Compras" },
  { keyword: "distribuidora", category: "Compras" },
  { keyword: "outsidefloripa", category: "Compras" },
  { keyword: "jim.com", category: "Compras" },

  // ── Serviços ──────────────────────────────────────────────────────
  { keyword: "claro", category: "Serviços" },
  { keyword: "vivo", category: "Serviços" },
  { keyword: "enel", category: "Serviços" },
  { keyword: "sabesp", category: "Serviços" },
  { keyword: "copel", category: "Serviços" },
  { keyword: "sigapay", category: "Serviços" },
  { keyword: "contabilizei", category: "Serviços" },
  { keyword: "google one", category: "Serviços" },
  { keyword: "icloud", category: "Serviços" },
  { keyword: "aluguel", category: "Serviços" },
  { keyword: "condominio", category: "Serviços" },

  // ── Educação ──────────────────────────────────────────────────────
  { keyword: "escola", category: "Educação" },
  { keyword: "faculdade", category: "Educação" },
  { keyword: "universidade", category: "Educação" },
  { keyword: "curso", category: "Educação" },
  { keyword: "udemy", category: "Educação" },
  { keyword: "coursera", category: "Educação" },
  { keyword: "livro", category: "Educação" },

  // ── Viagem ────────────────────────────────────────────────────────
  { keyword: "hotel", category: "Viagem" },
  { keyword: "pousada", category: "Viagem" },
  { keyword: "airbnb", category: "Viagem" },
  { keyword: "booking", category: "Viagem" },
  { keyword: "latam", category: "Viagem" },
  { keyword: "gol ", category: "Viagem" },
  { keyword: "azul ", category: "Viagem" },
  { keyword: "aeroporto", category: "Viagem" },

  // ── Pets ──────────────────────────────────────────────────────────
  { keyword: "agropet", category: "Pets" },
  { keyword: "petshop", category: "Pets" },
  { keyword: "pet shop", category: "Pets" },
  { keyword: "pet ", category: "Pets" },
  { keyword: "veterina", category: "Pets" },
  { keyword: "racao", category: "Pets" },
  { keyword: "cobasi", category: "Pets" },
  { keyword: "petz", category: "Pets" },

  // ── Tecnologia ────────────────────────────────────────────────────
  { keyword: "apple", category: "Tecnologia" },
  { keyword: "claudeai", category: "Tecnologia" },
  { keyword: "claude.ai", category: "Tecnologia" },
  { keyword: "anthropic", category: "Tecnologia" },
  { keyword: "openai", category: "Tecnologia" },
  { keyword: "github", category: "Tecnologia" },
  { keyword: "vercel", category: "Tecnologia" },
  { keyword: "digitalocean", category: "Tecnologia" },
  { keyword: "notion", category: "Tecnologia" },
  { keyword: "figma", category: "Tecnologia" },
  { keyword: "gsm distribuidora", category: "Tecnologia" },

  // ── Móveis ────────────────────────────────────────────────────────
  { keyword: "italinea", category: "Móveis" },
  { keyword: "tok stok", category: "Móveis" },
  { keyword: "mobly", category: "Móveis" },
  { keyword: "leroy merlin", category: "Móveis" },
  { keyword: "camicado", category: "Móveis" },
  { keyword: "schossler", category: "Móveis" },
  { keyword: "luzes da aldeia", category: "Móveis" },
];

function normalize(str: string) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function categorizeTransaction(description: string): string {
  const lower = normalize(description);
  for (const rule of CATEGORY_RULES) {
    if (lower.includes(normalize(rule.keyword))) {
      return rule.category;
    }
  }
  return "Outros";
}

export function parseNubankCSV(
  csvText: string
): Array<{ date: string; description: string; amount: number; category: string }> {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return [];

  const headerCols = parseCSVLine(lines[0]).map((h) =>
    normalize(h.trim().replace(/"/g, ""))
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
      category = categorizeTransaction(description);
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
