import Dexie, { type Table } from "dexie";

export interface Transaction {
  id?: number;
  date: string;
  description: string;
  amount: number;
  category: string;
  source?: string;
}

export interface CategoryRule {
  keyword: string; // primary key
  category: string;
}

class FinanceDB extends Dexie {
  transactions!: Table<Transaction>;
  categoryRules!: Table<CategoryRule>;

  constructor() {
    super("financeDB");
    this.version(1).stores({
      transactions: "++id, date, category",
      categoryRules: "&keyword",
    });
  }
}

export const db = new FinanceDB();

// Default rules — bulkPut so new keywords are added on app updates
// without losing any user-added rules
const DEFAULT_RULES: CategoryRule[] = [
  // Alimentação
  { keyword: "ifood", category: "Alimentação" },
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
  { keyword: "cafe", category: "Alimentação" },
  { keyword: "sushi", category: "Alimentação" },
  { keyword: "churrascaria", category: "Alimentação" },
  { keyword: "bar ", category: "Alimentação" },
  { keyword: "salao exte", category: "Alimentação" },
  { keyword: "pastel", category: "Alimentação" },
  { keyword: "coxinha", category: "Alimentação" },
  { keyword: "esfirra", category: "Alimentação" },
  { keyword: "temaki", category: "Alimentação" },
  { keyword: "tapioca", category: "Alimentação" },
  { keyword: "acai", category: "Alimentação" },
  { keyword: "sorveteria", category: "Alimentação" },
  { keyword: "confeitaria", category: "Alimentação" },
  { keyword: "food", category: "Alimentação" },
  { keyword: "bistro", category: "Alimentação" },
  { keyword: "grill", category: "Alimentação" },
  { keyword: "stanzad", category: "Alimentação" },
  // Supermercado
  { keyword: "mercado", category: "Supermercado" },
  { keyword: "supermercado", category: "Supermercado" },
  { keyword: "super ", category: "Supermercado" },
  { keyword: "carrefour", category: "Supermercado" },
  { keyword: "pao de acucar", category: "Supermercado" },
  { keyword: "hortifruti", category: "Supermercado" },
  { keyword: "atacadao", category: "Supermercado" },
  { keyword: "assai", category: "Supermercado" },
  { keyword: "rissul", category: "Supermercado" },
  { keyword: "bistek", category: "Supermercado" },
  { keyword: "condor", category: "Supermercado" },
  { keyword: "angeloni", category: "Supermercado" },
  { keyword: "scotalimentos", category: "Supermercado" },
  // Transporte
  { keyword: "uber", category: "Transporte" },
  { keyword: "99app", category: "Transporte" },
  { keyword: "taxi", category: "Transporte" },
  { keyword: "posto ", category: "Transporte" },
  { keyword: "shell", category: "Transporte" },
  { keyword: "ipiranga", category: "Transporte" },
  { keyword: "estacionamento", category: "Transporte" },
  { keyword: "nutag", category: "Transporte" },
  { keyword: "sem parar", category: "Transporte" },
  { keyword: "veloe", category: "Transporte" },
  { keyword: "conectcar", category: "Transporte" },
  { keyword: "estapar", category: "Transporte" },
  // Saúde
  { keyword: "farmacia", category: "Saúde" },
  { keyword: "farmacias", category: "Saúde" },
  { keyword: "drogaria", category: "Saúde" },
  { keyword: "droga", category: "Saúde" },
  { keyword: "ultrafarma", category: "Saúde" },
  { keyword: "hospital", category: "Saúde" },
  { keyword: "clinica", category: "Saúde" },
  { keyword: "drogasil", category: "Saúde" },
  { keyword: "sao joao", category: "Saúde" },
  { keyword: "nissei", category: "Saúde" },
  // Entretenimento
  { keyword: "netflix", category: "Entretenimento" },
  { keyword: "spotify", category: "Entretenimento" },
  { keyword: "youtube", category: "Entretenimento" },
  { keyword: "amazonprime", category: "Entretenimento" },
  { keyword: "disney", category: "Entretenimento" },
  { keyword: "hbo", category: "Entretenimento" },
  { keyword: "globoplay", category: "Entretenimento" },
  { keyword: "cinema", category: "Entretenimento" },
  { keyword: "steam", category: "Entretenimento" },
  { keyword: "twitch", category: "Entretenimento" },
  { keyword: "deezer", category: "Entretenimento" },
  { keyword: "crunchyroll", category: "Entretenimento" },
  // Compras
  { keyword: "amazon", category: "Compras" },
  { keyword: "mercado livre", category: "Compras" },
  { keyword: "shopee", category: "Compras" },
  { keyword: "americanas", category: "Compras" },
  { keyword: "magalu", category: "Compras" },
  { keyword: "aliexpress", category: "Compras" },
  { keyword: "shein", category: "Compras" },
  // Serviços
  { keyword: "claro", category: "Serviços" },
  { keyword: "vivo", category: "Serviços" },
  { keyword: "enel", category: "Serviços" },
  { keyword: "sabesp", category: "Serviços" },
  { keyword: "copel", category: "Serviços" },
  { keyword: "sigapay", category: "Serviços" },
  { keyword: "contabilizei", category: "Serviços" },
  { keyword: "icloud", category: "Serviços" },
  { keyword: "aluguel", category: "Serviços" },
  { keyword: "condominio", category: "Serviços" },
  // Educação
  { keyword: "escola", category: "Educação" },
  { keyword: "faculdade", category: "Educação" },
  { keyword: "udemy", category: "Educação" },
  { keyword: "coursera", category: "Educação" },
  // Viagem
  { keyword: "hotel", category: "Viagem" },
  { keyword: "airbnb", category: "Viagem" },
  { keyword: "booking", category: "Viagem" },
  { keyword: "latam", category: "Viagem" },
  { keyword: "aeroporto", category: "Viagem" },
  // Pets
  { keyword: "agropet", category: "Pets" },
  { keyword: "petshop", category: "Pets" },
  { keyword: "pet shop", category: "Pets" },
  { keyword: "veterina", category: "Pets" },
  { keyword: "cobasi", category: "Pets" },
  { keyword: "petz", category: "Pets" },
  // Tecnologia
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
  // Móveis
  { keyword: "italinea", category: "Móveis" },
  { keyword: "tok stok", category: "Móveis" },
  { keyword: "mobly", category: "Móveis" },
  { keyword: "leroy merlin", category: "Móveis" },
  { keyword: "camicado", category: "Móveis" },
];

export async function seedRules() {
  await db.categoryRules.bulkPut(DEFAULT_RULES);
}
