import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { parseNubankCSV } from "@/lib/categorize";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const text = await file.text();
    const transactions = parseNubankCSV(text);

    if (transactions.length === 0) {
      return NextResponse.json({ error: "No valid transactions found in file" }, { status: 400 });
    }

    const db = getDb();
    const insert = db.prepare(`
      INSERT INTO transactions (date, description, amount, category, account, source)
      VALUES (@date, @description, @amount, @category, @account, @source)
    `);

    const insertMany = db.transaction(
      (rows: Array<{ date: string; description: string; amount: number; category: string }>) => {
        let count = 0;
        for (const row of rows) {
          insert.run({
            date: row.date,
            description: row.description,
            amount: row.amount,
            category: row.category,
            account: "credit",
            source: file.name,
          });
          count++;
        }
        return count;
      }
    );

    const count = insertMany(transactions);
    return NextResponse.json({ imported: count, total: transactions.length });
  } catch (err) {
    console.error("Import error:", err);
    return NextResponse.json({ error: "Failed to import file" }, { status: 500 });
  }
}
