import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month"); // YYYY-MM

  const db = getDb();

  const dateClause = month ? `AND date LIKE '${month}%'` : "";

  // Total spending (charges: amount > 0)
  const totalResult = db
    .prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE amount > 0 ${dateClause}`)
    .get() as { total: number };

  // Spending by category
  const byCategory = db
    .prepare(
      `SELECT category, SUM(amount) as total, COUNT(*) as count
       FROM transactions
       WHERE amount > 0 ${dateClause}
       GROUP BY category
       ORDER BY total DESC`
    )
    .all() as { category: string; total: number; count: number }[];

  // Monthly totals (last 6 months)
  const monthlyTotals = db
    .prepare(
      `SELECT strftime('%Y-%m', date) as month, SUM(amount) as total, COUNT(*) as count
       FROM transactions
       WHERE amount > 0
       GROUP BY month
       ORDER BY month DESC
       LIMIT 6`
    )
    .all() as { month: string; total: number; count: number }[];

  // Top merchants
  const topMerchants = db
    .prepare(
      `SELECT description, SUM(amount) as total, COUNT(*) as count
       FROM transactions
       WHERE amount > 0 ${dateClause}
       GROUP BY description
       ORDER BY total DESC
       LIMIT 10`
    )
    .all() as { description: string; total: number; count: number }[];

  // Available months
  const months = db
    .prepare(
      `SELECT DISTINCT strftime('%Y-%m', date) as month
       FROM transactions
       ORDER BY month DESC`
    )
    .all() as { month: string }[];

  return NextResponse.json({
    total: totalResult.total,
    byCategory,
    monthlyTotals: monthlyTotals.reverse(),
    topMerchants,
    months: months.map((m) => m.month),
  });
}
