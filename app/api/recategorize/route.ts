import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import { loadRules, categorizeTransaction } from "@/lib/categorize";

export async function POST() {
  const db = getDb();
  const rules = loadRules();

  const transactions = db
    .prepare("SELECT id, description FROM transactions")
    .all() as { id: number; description: string }[];

  const update = db.prepare("UPDATE transactions SET category = ? WHERE id = ?");

  db.transaction(() => {
    for (const tx of transactions) {
      update.run(categorizeTransaction(tx.description, rules), tx.id);
    }
  })();

  return NextResponse.json({ updated: transactions.length });
}
