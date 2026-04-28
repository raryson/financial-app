import Dexie, { type Table } from "dexie";

export interface Transaction {
  id?: number;
  date: string;
  description: string;
  amount: number;
  category: string;
  source?: string;
}

class FinanceDB extends Dexie {
  transactions!: Table<Transaction>;

  constructor() {
    super("financeDB");
    this.version(1).stores({
      transactions: "++id, date, category",
      categoryRules: "&keyword",
    });
    this.version(2).stores({
      transactions: "++id, date, category",
      categoryRules: "&keyword",
    });
    // v3: drop categoryRules — rules are now a plain constant in categorize.ts
    this.version(3).stores({
      transactions: "++id, date, category",
      categoryRules: null,
    });
  }
}

export const db = new FinanceDB();
