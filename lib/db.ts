import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "finances.db");

function getDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  initSchema(db);
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL DEFAULT 'Outros',
      account TEXT NOT NULL DEFAULT 'credit',
      source TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);

    CREATE TABLE IF NOT EXISTS category_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      keyword TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL
    );
  `);

  // Always upsert rules so new keywords are added on app updates
  seedCategoryRules(db);
}

function seedCategoryRules(db: Database.Database) {
  const rules = [
    // Food & Dining
    ["ifood", "Alimentação"],
    ["uber eats", "Alimentação"],
    ["rappi", "Alimentação"],
    ["restaurante", "Alimentação"],
    ["lanchonete", "Alimentação"],
    ["padaria", "Alimentação"],
    ["pizza", "Alimentação"],
    ["burger", "Alimentação"],
    ["mcdonalds", "Alimentação"],
    ["subway", "Alimentação"],
    ["starbucks", "Alimentação"],
    ["cafe", "Alimentação"],
    ["sushi", "Alimentação"],
    ["churrascaria", "Alimentação"],
    ["bar ", "Alimentação"],
    ["bar*", "Alimentação"],
    ["salao exte", "Alimentação"],
    ["pastel", "Alimentação"],
    ["coxinha", "Alimentação"],
    ["esfirra", "Alimentação"],
    ["temaki", "Alimentação"],
    ["tapioca", "Alimentação"],
    ["acai", "Alimentação"],
    ["sorveteria", "Alimentação"],
    ["confeitaria", "Alimentação"],
    ["panetteria", "Alimentação"],
    ["food", "Alimentação"],
    ["bistrô", "Alimentação"],
    ["bistro", "Alimentação"],
    ["grill", "Alimentação"],
    ["snack", "Alimentação"],
    // Supermarkets
    ["mercado", "Supermercado"],
    ["supermercado", "Supermercado"],
    ["super ", "Supermercado"],
    ["carrefour", "Supermercado"],
    ["pao de acucar", "Supermercado"],
    ["extra ", "Supermercado"],
    ["hortifruti", "Supermercado"],
    ["atacadao", "Supermercado"],
    ["assai", "Supermercado"],
    ["prezunic", "Supermercado"],
    ["mundial", "Supermercado"],
    ["rissul", "Supermercado"],
    ["bistek", "Supermercado"],
    ["condor", "Supermercado"],
    ["festval", "Supermercado"],
    ["angeloni", "Supermercado"],
    ["gimenes", "Supermercado"],
    // Transport
    ["uber", "Transporte"],
    ["99 ", "Transporte"],
    ["99app", "Transporte"],
    ["taxi", "Transporte"],
    ["combustivel", "Transporte"],
    ["posto ", "Transporte"],
    ["shell", "Transporte"],
    ["petrobras", "Transporte"],
    ["ipiranga", "Transporte"],
    ["estacionamento", "Transporte"],
    // Health
    ["farmacia", "Saúde"],
    ["farmacias", "Saúde"],
    ["drogaria", "Saúde"],
    ["droga", "Saúde"],
    ["ultrafarma", "Saúde"],
    ["hospital", "Saúde"],
    ["clinica", "Saúde"],
    ["medico", "Saúde"],
    ["laboratorio", "Saúde"],
    ["drogasil", "Saúde"],
    ["sao joao", "Saúde"],
    ["pacheco", "Saúde"],
    ["nissei", "Saúde"],
    // Entertainment
    ["netflix", "Entretenimento"],
    ["spotify", "Entretenimento"],
    ["youtube", "Entretenimento"],
    ["amazon prime", "Entretenimento"],
    ["amazonprime", "Entretenimento"],
    ["disney", "Entretenimento"],
    ["hbo", "Entretenimento"],
    ["globoplay", "Entretenimento"],
    ["cinema", "Entretenimento"],
    ["steam", "Entretenimento"],
    ["xbox", "Entretenimento"],
    ["playstation", "Entretenimento"],
    ["twitch", "Entretenimento"],
    ["deezer", "Entretenimento"],
    ["apple music", "Entretenimento"],
    ["crunchyroll", "Entretenimento"],
    // Shopping
    ["amazon", "Compras"],
    ["mercado livre", "Compras"],
    ["shopee", "Compras"],
    ["americanas", "Compras"],
    ["magazine luiza", "Compras"],
    ["magalu", "Compras"],
    ["aliexpress", "Compras"],
    ["shein", "Compras"],
    // Services / Bills
    ["claro", "Serviços"],
    ["vivo", "Serviços"],
    ["tim ", "Serviços"],
    ["oi ", "Serviços"],
    ["net ", "Serviços"],
    ["conta de luz", "Serviços"],
    ["celpe", "Serviços"],
    ["copel", "Serviços"],
    ["cemig", "Serviços"],
    ["enel", "Serviços"],
    ["agua", "Serviços"],
    ["cedae", "Serviços"],
    ["sabesp", "Serviços"],
    ["sigapay", "Serviços"],
    ["contabilizei", "Serviços"],
    ["google one", "Serviços"],
    ["icloud", "Serviços"],
    ["dropbox", "Serviços"],
    ["aluguel", "Serviços"],
    ["condominio", "Serviços"],
    // Education
    ["escola", "Educação"],
    ["faculdade", "Educação"],
    ["universidade", "Educação"],
    ["curso", "Educação"],
    ["udemy", "Educação"],
    ["coursera", "Educação"],
    ["livro", "Educação"],
    // Travel
    ["hotel", "Viagem"],
    ["pousada", "Viagem"],
    ["airbnb", "Viagem"],
    ["booking", "Viagem"],
    ["latam", "Viagem"],
    ["gol ", "Viagem"],
    ["azul ", "Viagem"],
    ["aeroporto", "Viagem"],
    // Pets
    ["agropet", "Pets"],
    ["pet ", "Pets"],
    ["petshop", "Pets"],
    ["pet shop", "Pets"],
    ["veterina", "Pets"],
    ["veterinari", "Pets"],
    ["racao", "Pets"],
    ["cobasi", "Pets"],
    ["petz", "Pets"],
    // Móveis / Casa
    ["italinea", "Móveis"],
    ["tok stok", "Móveis"],
    ["etna ", "Móveis"],
    ["mobly", "Móveis"],
    ["leroy merlin", "Móveis"],
    ["telhanorte", "Móveis"],
    ["dicico", "Móveis"],
    ["casa show", "Móveis"],
    ["camicado", "Móveis"],
    // Tecnologia
    ["apple", "Tecnologia"],
    ["claudeai", "Tecnologia"],
    ["claude.ai", "Tecnologia"],
    ["anthropic", "Tecnologia"],
    ["openai", "Tecnologia"],
    ["chatgpt", "Tecnologia"],
    ["github", "Tecnologia"],
    ["aws ", "Tecnologia"],
    ["google cloud", "Tecnologia"],
    ["vercel", "Tecnologia"],
    ["digitalocean", "Tecnologia"],
    ["notion", "Tecnologia"],
    ["figma", "Tecnologia"],
    ["linear", "Tecnologia"],
    // Transporte (additions)
    ["nutag", "Transporte"],
    ["sem parar", "Transporte"],
    ["veloe", "Transporte"],
    ["conectcar", "Transporte"],
    ["estapar", "Transporte"],
    ["indigo park", "Transporte"],
    // Supermercado (additions)
    ["scotalimentos", "Supermercado"],
    // Alimentação (additions)
    ["stanzad", "Alimentação"],
  ];

  const stmt = db.prepare("INSERT OR IGNORE INTO category_rules (keyword, category) VALUES (?, ?)");
  const insertMany = db.transaction((rows: string[][]) => {
    for (const row of rows) {
      stmt.run(row[0], row[1]);
    }
  });
  insertMany(rules);
}

export default getDb;
