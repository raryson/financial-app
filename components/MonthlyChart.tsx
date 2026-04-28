"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DataItem {
  month: string;
  total: number;
  count: number;
}

interface Props {
  data: DataItem[];
  currentMonth?: string;
}

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export default function MonthlyChart({ data, currentMonth }: Props) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Nenhum dado disponível
      </div>
    );
  }

  const avg = data.reduce((s, d) => s + d.total, 0) / data.length;

  const chartData = data.map((d) => ({
    ...d,
    label: format(parseISO(`${d.month}-01`), "MMM yy", { locale: ptBR }),
    isCurrent: d.month === currentMonth,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: "#9ca3af" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          axisLine={false}
          tickLine={false}
          width={50}
        />
        <Tooltip
          formatter={(value) => [formatBRL(Number(value)), "Total gasto"]}
          labelStyle={{ fontWeight: 600, color: "#374151" }}
          contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
        />
        <ReferenceLine
          y={avg}
          stroke="#a78bfa"
          strokeDasharray="4 4"
          label={{ value: "Média", position: "insideTopRight", fontSize: 11, fill: "#8b5cf6" }}
        />
        <Bar
          dataKey="total"
          radius={[6, 6, 0, 0]}
          fill="#8b5cf6"
          label={false}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
