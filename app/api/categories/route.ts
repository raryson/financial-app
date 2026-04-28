import { NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function GET() {
  const db = getDb();
  const categories = db
    .prepare("SELECT DISTINCT category FROM transactions ORDER BY category")
    .all() as { category: string }[];

  const allCategories = [
    "Alimentação",
    "Supermercado",
    "Transporte",
    "Saúde",
    "Entretenimento",
    "Compras",
    "Serviços",
    "Educação",
    "Viagem",
    "Pets",
    "Tecnologia",
    "Móveis",
    "Outros",
  ];

  const used = categories.map((c) => c.category);
  const merged = [...new Set([...used, ...allCategories])].sort();

  return NextResponse.json({ categories: merged });
}
