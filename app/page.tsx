"use client";

import { useEffect, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CreditCard, TrendingUp, TrendingDown, ShoppingBag, Upload, AlertTriangle, Trash2,
} from "lucide-react";
import dynamic from "next/dynamic";
import ImportModal from "@/components/ImportModal";
import TransactionList from "@/components/TransactionList";
import { db } from "@/lib/db.client";
import { categorizeTransaction } from "@/lib/categorize";

const CategoryChart = dynamic(() => import("@/components/CategoryChart"), { ssr: false });
const MonthlyChart = dynamic(() => import("@/components/MonthlyChart"), { ssr: false });

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export default function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "transactions">("dashboard");
  const [recategorizing, setRecategorizing] = useState(false);


  // Load all transactions reactively
  const allTransactions = useLiveQuery(() => db.transactions.toArray(), []) ?? [];

  // Available months (sorted descending)
  const months = useMemo(() => {
    const set = new Set(allTransactions.map((t) => t.date.substring(0, 7)));
    return [...set].sort().reverse();
  }, [allTransactions]);

  // Auto-select latest month when data first loads
  useEffect(() => {
    if (months.length && !selectedMonth) setSelectedMonth(months[0]);
  }, [months, selectedMonth]);

  // Transactions filtered by selected month
  const monthTransactions = useMemo(() =>
    selectedMonth
      ? allTransactions.filter((t) => t.date.startsWith(selectedMonth))
      : allTransactions,
    [allTransactions, selectedMonth]
  );

  // Stats derived from filtered transactions
  const stats = useMemo(() => {
    const expenses = monthTransactions.filter((t) => t.amount > 0);
    const total = expenses.reduce((s, t) => s + t.amount, 0);

    // By category
    const catMap = new Map<string, { total: number; count: number }>();
    for (const tx of expenses) {
      const prev = catMap.get(tx.category) ?? { total: 0, count: 0 };
      catMap.set(tx.category, { total: prev.total + tx.amount, count: prev.count + 1 });
    }
    const byCategory = [...catMap.entries()]
      .map(([category, v]) => ({ category, ...v }))
      .sort((a, b) => b.total - a.total);

    // Top merchants
    const merchantMap = new Map<string, { total: number; count: number }>();
    for (const tx of expenses) {
      const prev = merchantMap.get(tx.description) ?? { total: 0, count: 0 };
      merchantMap.set(tx.description, { total: prev.total + tx.amount, count: prev.count + 1 });
    }
    const topMerchants = [...merchantMap.entries()]
      .map(([description, v]) => ({ description, ...v }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // Monthly totals (last 6 months, always from all transactions)
    const allExpenses = allTransactions.filter((t) => t.amount > 0);
    const monthMap = new Map<string, { total: number; count: number }>();
    for (const tx of allExpenses) {
      const m = tx.date.substring(0, 7);
      const prev = monthMap.get(m) ?? { total: 0, count: 0 };
      monthMap.set(m, { total: prev.total + tx.amount, count: prev.count + 1 });
    }
    const monthlyTotals = [...monthMap.entries()]
      .map(([month, v]) => ({ month, ...v }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6);

    return { total, byCategory, topMerchants, monthlyTotals };
  }, [monthTransactions, allTransactions]);

  // Month-over-month trend
  const prevMonthTotal = useMemo(() => {
    if (!selectedMonth || months.length < 2) return 0;
    const idx = months.indexOf(selectedMonth);
    const prevMonth = months[idx + 1];
    if (!prevMonth) return 0;
    return allTransactions
      .filter((t) => t.date.startsWith(prevMonth) && t.amount > 0)
      .reduce((s, t) => s + t.amount, 0);
  }, [allTransactions, selectedMonth, months]);

  const trend = prevMonthTotal > 0 ? ((stats.total - prevMonthTotal) / prevMonthTotal) * 100 : null;
  const topCategory = stats.byCategory[0];
  const totalTransactions = stats.byCategory.reduce((s, c) => s + c.count, 0);

  const usageLevel =
    stats.total > 5000 ? "high" : stats.total > 2000 ? "medium" : "low";
  const usageMessages = {
    low: "Gastos controlados este mês",
    medium: "Gastos moderados — fique de olho",
    high: "Gastos altos este mês — vale revisar as categorias",
  };
  const usageColors = {
    low: "bg-green-50 border-green-200 text-green-800",
    medium: "bg-yellow-50 border-yellow-200 text-yellow-800",
    high: "bg-red-50 border-red-200 text-red-800",
  };
  const usageIcons = {
    low: <TrendingDown size={16} className="text-green-600" />,
    medium: <AlertTriangle size={16} className="text-yellow-600" />,
    high: <TrendingUp size={16} className="text-red-600" />,
  };

  async function handleClearAll() {
    if (!confirm("Apagar todas as transações? Esta ação não pode ser desfeita.")) return;
    await db.transactions.clear();
    setSelectedMonth("");
  }

  async function handleRecategorize() {
    setRecategorizing(true);
    const rules = await db.categoryRules.toArray();
    const all = await db.transactions.toArray();
    await db.transactions.bulkPut(
      all.map((tx) => ({ ...tx, category: categorizeTransaction(tx.description, rules) }))
    );
    setRecategorizing(false);
  }

  const hasData = months.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <CreditCard size={16} className="text-white" />
            </div>
            <h1 className="font-bold text-gray-900 text-lg">FinanceApp</h1>
          </div>

          <div className="flex items-center gap-3">
            {hasData && (
              <select
                value={selectedMonth}
                onChange={(e) => { setSelectedMonth(e.target.value); setCategoryFilter(""); }}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 text-gray-700"
              >
                <option value="">Todos os meses</option>
                {months.map((m) => (
                  <option key={m} value={m}>
                    {format(parseISO(`${m}-01`), "MMMM yyyy", { locale: ptBR })}
                  </option>
                ))}
              </select>
            )}
            {hasData && (
              <>
                <button
                  onClick={handleRecategorize}
                  disabled={recategorizing}
                  className="text-sm border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {recategorizing ? "Recategorizando..." : "Recategorizar"}
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-2 border border-red-200 text-red-500 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
                  Limpar dados
                </button>
              </>
            )}
            <button
              onClick={() => setShowImport(true)}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              <Upload size={14} />
              Importar extrato
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 flex gap-1">
          {(["dashboard", "transactions"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-purple-600 text-purple-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "dashboard" ? "Dashboard" : "Transações"}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === "dashboard" ? (
          <div className="space-y-6">
            {!hasData ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CreditCard size={28} className="text-purple-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Nenhum dado ainda</h2>
                <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                  Importe seu extrato do Nubank para visualizar seus gastos no dashboard
                </p>
                <button
                  onClick={() => setShowImport(true)}
                  className="inline-flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-purple-700 transition-colors"
                >
                  <Upload size={16} />
                  Importar extrato
                </button>
              </div>
            ) : (
              <>
                {stats.total > 0 && (
                  <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium ${usageColors[usageLevel]}`}>
                    {usageIcons[usageLevel]}
                    {usageMessages[usageLevel]}
                  </div>
                )}

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    label="Total gasto"
                    value={formatBRL(stats.total)}
                    sub={selectedMonth ? format(parseISO(`${selectedMonth}-01`), "MMMM yyyy", { locale: ptBR }) : "Todos os meses"}
                    color="purple"
                    icon={<CreditCard size={18} />}
                  />
                  <StatCard
                    label="Transações"
                    value={String(totalTransactions)}
                    sub="lançamentos"
                    color="blue"
                    icon={<ShoppingBag size={18} />}
                  />
                  <StatCard
                    label="Maior categoria"
                    value={topCategory?.category ?? "—"}
                    sub={topCategory ? formatBRL(topCategory.total) : ""}
                    color="orange"
                    icon={<TrendingUp size={18} />}
                  />
                  <StatCard
                    label="Variação mensal"
                    value={trend !== null ? `${trend > 0 ? "+" : ""}${trend.toFixed(0)}%` : "—"}
                    sub="vs. mês anterior"
                    color={trend === null ? "gray" : trend > 0 ? "red" : "green"}
                    icon={trend && trend > 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                  />
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="font-semibold text-gray-800 mb-4">Gastos por categoria</h2>
                    <CategoryChart data={stats.byCategory} />
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="font-semibold text-gray-800 mb-4">Evolução mensal</h2>
                    <MonthlyChart data={stats.monthlyTotals} currentMonth={selectedMonth} />
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="font-semibold text-gray-800 mb-4">Por categoria</h2>
                    <div className="space-y-1">
                      {stats.byCategory.map((cat) => (
                        <button
                          key={cat.category}
                          onClick={() => { setCategoryFilter(cat.category); setActiveTab("transactions"); }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-purple-50 text-left transition-colors group"
                        >
                          <span className="text-sm text-gray-700 group-hover:text-purple-700">{cat.category}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-400">{cat.count} itens</span>
                            <span className="text-sm font-semibold text-gray-800">{formatBRL(cat.total)}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="font-semibold text-gray-800 mb-4">Maiores gastos</h2>
                    <div className="space-y-1">
                      {stats.topMerchants.map((m, i) => (
                        <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-xs text-gray-400 w-5 shrink-0">{i + 1}.</span>
                            <span className="text-sm text-gray-700 truncate">{m.description}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-800 ml-2 shrink-0">{formatBRL(m.total)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">Transações</h2>
              {categoryFilter && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-purple-700 bg-purple-100 px-3 py-1 rounded-full">{categoryFilter}</span>
                  <button onClick={() => setCategoryFilter("")} className="text-xs text-gray-400 hover:text-gray-600">
                    limpar
                  </button>
                </div>
              )}
            </div>
            <TransactionList month={selectedMonth} categoryFilter={categoryFilter} />
          </div>
        )}
      </main>

      {showImport && (
        <ImportModal onClose={() => setShowImport(false)} onSuccess={() => setShowImport(false)} />
      )}
    </div>
  );
}

function StatCard({ label, value, sub, color, icon }: {
  label: string; value: string; sub: string; color: string; icon: React.ReactNode;
}) {
  const colorMap: Record<string, string> = {
    purple: "bg-purple-50 text-purple-600",
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    red: "bg-red-50 text-red-600",
    green: "bg-green-50 text-green-600",
    gray: "bg-gray-100 text-gray-500",
  };
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${colorMap[color] ?? colorMap.gray}`}>
        {icon}
      </div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}
