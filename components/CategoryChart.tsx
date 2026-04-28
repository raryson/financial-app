"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#8b5cf6", "#a78bfa", "#c4b5fd",
  "#06b6d4", "#67e8f9", "#22d3ee",
  "#f59e0b", "#fcd34d", "#f97316",
  "#10b981", "#34d399", "#6ee7b7",
  "#ef4444", "#f87171", "#fca5a5",
];

interface DataItem {
  category: string;
  total: number;
  count: number;
}

interface Props {
  data: DataItem[];
}

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export default function CategoryChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Nenhum dado disponível
      </div>
    );
  }

  const total = data.reduce((s, d) => s + d.total, 0);

  return (
    <div className="space-y-4 py-2">
      <ResponsiveContainer width="100%" height={320}>
        <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <Pie
            data={data}
            dataKey="total"
            nameKey="category"
            cx="50%"
            cy="45%"
            outerRadius={100}
            innerRadius={50}
            paddingAngle={2}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [formatBRL(Number(value)), "Total"]}
            contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
          />
          <Legend
            formatter={(value) => <span className="text-sm text-gray-700">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Category breakdown list */}
      <div className="space-y-2 mt-4">
        {data.map((item, i) => {
          const pct = total > 0 ? (item.total / total) * 100 : 0;
          return (
            <div key={item.category} className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="text-sm font-medium text-gray-700 truncate">{item.category}</span>
                  <span className="text-sm text-gray-500 ml-2 shrink-0">{formatBRL(item.total)}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: COLORS[i % COLORS.length],
                    }}
                  />
                </div>
              </div>
              <span className="text-xs text-gray-400 shrink-0 w-10 text-right">
                {pct.toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
