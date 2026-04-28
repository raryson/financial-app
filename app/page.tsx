"use client";

import { useState, useEffect, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CreditCard,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Upload,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import dynamic from "next/dynamic";
import ImportModal from "@/components/ImportModal";
import TransactionList from "@/components/TransactionList";

// Recharts requires client-side rendering
const CategoryChart = dynamic(() => import("@/components/CategoryChart"), { ssr: false });
const MonthlyChart = dynamic(() => import("@/components/MonthlyChart"), { ssr: false });

interface Stats {
  total: number;
  byCategory: { category: string; total: number; count: number }[];
  monthlyTotals: { month: string; total: number; count: number }[];
  topMerchants: { description: string; total: number; count: number }[];
  recent: unknown[];
  months: string[];
}

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [showImport, setShowImport] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "transactions">("dashboard");
  const [recategorizing, setRecategorizing] = useState(false);

  const fetchStats = useCallback(async () => {
    const params = new URLSearchParams();
    if (selectedMonth) params.set("month", selectedMonth);
    const res = await fetch(`/api/stats?${params}`);
    const data = await res.json();
    setStats(data);
  }, [selectedMonth]);

  async function handleClearAll() {
    if (!confirm("Apagar todas as transações? Esta ação não pode ser desfeita.")) return;
    await fetch("/api/transactions?all=true", { method: "DELETE" });
    setSelectedMonth("");
    setStats(null);
    fetchStats();
  }

  async function handleRecategorize() {
    setRecategorizing(true);
    await fetch("/api/recategorize", { method: "POST" });
    await fetchStats();
    setRecategorizing(false);
  }

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Set current month as default when months load
  useEffect(() => {
    if (stats?.months?.length && !selectedMonth) {
      setSelectedMonth(stats.months[0]);
    }
  }, [stats?.months, selectedMonth]);

  const prevMonth = stats?.monthlyTotals;
  const prevTotal = prevMonth && prevMonth.length >= 2
    ? prevMonth[prevMonth.length - 2]?.total ?? 0
    : 0;
  const trend = stats && prevTotal > 0
    ? ((stats.total - prevTotal) / prevTotal) * 100
    : null;

  const topCategory = stats?.byCategory[0];
  const totalTransactions = stats?.byCategory.reduce((s, c) => s + c.count, 0) ?? 0;

  // Credit card usage level
  let usageLevel: "low" | "medium" | "high" = "low";
  let usageMessage = "";
  if (stats?.total) {
    if (stats.total > 5000) {
      usageLevel = "high";
      usageMessage = "Gastos altos este mês — vale revisar as categorias";
    } else if (stats.total > 2000) {
      usageLevel = "medium";
      usageMessage = "Gastos moderados — fique de olho";
    } else {
      usageLevel = "low";
      usageMessage = "Gastos controlados este mês";
    }
  }

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
            {/* Month selector */}
            {stats?.months?.length ? (
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setCategoryFilter("");
                }}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 text-gray-700"
              >
                <option value="">Todos os meses</option>
                {stats.months.map((m) => (
                  <option key={m} value={m}>
                    {format(parseISO(`${m}-01`), "MMMM yyyy", { locale: ptBR })}
                  </option>
                ))}
              </select>
            ) : null}

            {stats?.months?.length ? (
              <>
                <button
                  onClick={handleRecategorize}
                  disabled={recategorizing}
                  className="flex items-center gap-2 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            ) : null}
            <button
              onClick={() => setShowImport(true)}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              <Upload size={14} />
              Importar extrato
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-4 flex gap-1 pb-0">
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
            {/* No data state */}
            {!stats?.months?.length && (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CreditCard size={28} className="text-purple-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  Nenhum dado ainda
                </h2>
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
            )}

            {stats?.months?.length ? (
              <>
                {/* Usage alert */}
                {stats.total > 0 && (
                  <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium ${usageColors[usageLevel]}`}>
                    {usageIcons[usageLevel]}
                    {usageMessage}
                  </div>
                )}

                {/* KPI cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    label="Total gasto"
                    value={formatBRL(stats.total)}
                    sub={selectedMonth
                      ? format(parseISO(`${selectedMonth}-01`), "MMMM yyyy", { locale: ptBR })
                      : "Todos os meses"}
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

                {/* Charts row */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Category pie */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="font-semibold text-gray-800 mb-4">Gastos por categoria</h2>
                    <CategoryChart data={stats.byCategory} />
                  </div>

                  {/* Monthly bar */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="font-semibold text-gray-800 mb-4">Evolução mensal</h2>
                    <MonthlyChart
                      data={stats.monthlyTotals}
                      currentMonth={selectedMonth}
                    />
                  </div>
                </div>

                {/* Category filter + top merchants */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Category breakdown */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="font-semibold text-gray-800 mb-4">Por categoria</h2>
                    <div className="space-y-2">
                      {stats.byCategory.map((cat) => (
                        <button
                          key={cat.category}
                          onClick={() => {
                            setCategoryFilter(categoryFilter === cat.category ? "" : cat.category);
                            setActiveTab("transactions");
                          }}
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

                  {/* Top merchants */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="font-semibold text-gray-800 mb-4">Maiores gastos</h2>
                    <div className="space-y-2">
                      {stats.topMerchants.map((m, i) => (
                        <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-xs text-gray-400 w-5 shrink-0">{i + 1}.</span>
                            <span className="text-sm text-gray-700 truncate">{m.description}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-800 ml-2 shrink-0">
                            {formatBRL(m.total)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        ) : (
          /* Transactions tab */
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">Transações</h2>
              {categoryFilter && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                    {categoryFilter}
                  </span>
                  <button
                    onClick={() => setCategoryFilter("")}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    limpar
                  </button>
                </div>
              )}
            </div>
            <TransactionList
              month={selectedMonth}
              categoryFilter={categoryFilter}
              onRefresh={fetchStats}
            />
          </div>
        )}
      </main>

      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onSuccess={() => {
            fetchStats();
            setShowImport(false);
          }}
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  color,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
  icon: React.ReactNode;
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
