import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month"); // YYYY-MM
  const category = searchParams.get("category");

  const db = getDb();

  let where = "WHERE 1=1";
  const params: (string | number)[] = [];

  if (month) {
    where += " AND date LIKE ?";
    params.push(`${month}%`);
  }
  if (category) {
    where += " AND category = ?";
    params.push(category);
  }

  const rows = db
    .prepare(`SELECT * FROM transactions ${where} ORDER BY date DESC`)
    .all(params);

  return NextResponse.json({ transactions: rows });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const all = searchParams.get("all");

  const db = getDb();

  if (all === "true") {
    db.prepare("DELETE FROM transactions").run();
    return NextResponse.json({ success: true });
  }

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  db.prepare("DELETE FROM transactions WHERE id = ?").run(id);
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, category } = body;

  if (!id || !category) {
    return NextResponse.json({ error: "Missing id or category" }, { status: 400 });
  }

  const db = getDb();
  db.prepare("UPDATE transactions SET category = ? WHERE id = ?").run(category, id);
  return NextResponse.json({ success: true });
}
