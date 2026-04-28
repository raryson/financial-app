"use client";

import { useState, useEffect, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pencil, Trash2 } from "lucide-react";

interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  category: string;
}

interface Props {
  month?: string;
  categoryFilter?: string;
  onRefresh?: () => void;
}

const CATEGORIES = [
  "Alimentação", "Supermercado", "Transporte", "Saúde",
  "Entretenimento", "Compras", "Serviços", "Educação", "Viagem",
  "Pets", "Tecnologia", "Móveis", "Outros",
];

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

const CATEGORY_COLORS: Record<string, string> = {
  "Alimentação": "bg-orange-100 text-orange-700",
  "Supermercado": "bg-green-100 text-green-700",
  "Transporte": "bg-blue-100 text-blue-700",
  "Saúde": "bg-red-100 text-red-700",
  "Entretenimento": "bg-pink-100 text-pink-700",
  "Compras": "bg-yellow-100 text-yellow-700",
  "Serviços": "bg-indigo-100 text-indigo-700",
  "Educação": "bg-teal-100 text-teal-700",
  "Viagem": "bg-cyan-100 text-cyan-700",
  "Pets": "bg-lime-100 text-lime-700",
  "Tecnologia": "bg-violet-100 text-violet-700",
  "Móveis": "bg-amber-100 text-amber-700",
  "Outros": "bg-gray-100 text-gray-600",
};

export default function TransactionList({ month, categoryFilter, onRefresh }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editCategory, setEditCategory] = useState("");

  const fetchTransactions = useCallback(async () => {
    const params = new URLSearchParams();
    if (month) params.set("month", month);
    if (categoryFilter) params.set("category", categoryFilter);

    const res = await fetch(`/api/transactions?${params}`);
    const data = await res.json();
    setTransactions(data.transactions ?? []);
  }, [month, categoryFilter]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  async function handleDelete(id: number) {
    if (!confirm("Remover esta transação?")) return;
    await fetch(`/api/transactions?id=${id}`, { method: "DELETE" });
    fetchTransactions();
    onRefresh?.();
  }

  async function handleSaveCategory(id: number) {
    await fetch("/api/transactions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, category: editCategory }),
    });
    setEditingId(null);
    fetchTransactions();
    onRefresh?.();
  }

  if (!transactions.length) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-sm">Nenhuma transação encontrada</p>
        <p className="text-xs mt-1">Importe um extrato para começar</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <p className="text-xs text-gray-400 px-3 pb-2">{transactions.length} transações</p>

      {transactions.map((tx) => (
        <div
          key={tx.id}
          className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 group transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-800 truncate">{tx.description}</span>
              {editingId === tx.id ? (
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="text-xs border border-purple-300 rounded-md px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-purple-400"
                  onBlur={() => handleSaveCategory(tx.id)}
                  autoFocus
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              ) : (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium cursor-pointer ${
                    CATEGORY_COLORS[tx.category] ?? "bg-gray-100 text-gray-600"
                  }`}
                  onClick={() => {
                    setEditingId(tx.id);
                    setEditCategory(tx.category);
                  }}
                >
                  {tx.category}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {format(parseISO(tx.date), "d 'de' MMMM", { locale: ptBR })}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-sm font-semibold ${tx.amount > 0 ? "text-red-600" : "text-green-600"}`}>
              {tx.amount > 0 ? "-" : "+"}{formatBRL(Math.abs(tx.amount))}
            </span>
            <div className="hidden group-hover:flex items-center gap-1">
              <button
                onClick={() => {
                  setEditingId(tx.id);
                  setEditCategory(tx.category);
                }}
                className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => handleDelete(tx.id)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
