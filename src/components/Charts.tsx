import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CurrencyCode, Transaction } from "../types";
import { formatMoney } from "../utils/format";

interface Props {
  transactions: Transaction[];
  currency: CurrencyCode;
}

const PIE_COLORS = ["#6366f1", "#f43f5e", "#f59e0b", "#10b981", "#0ea5e9", "#a855f7", "#eab308", "#ec4899", "#14b8a6"];

export function Charts({ transactions, currency }: Props) {
  const expenseByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of transactions) {
      if (t.type !== "expense") continue;
      map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const monthly = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();
    for (const t of transactions) {
      const key = t.date.slice(0, 7); // YYYY-MM
      const entry = map.get(key) ?? { income: 0, expense: 0 };
      if (t.type === "income") entry.income += t.amount;
      else entry.expense += t.amount;
      map.set(key, entry);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, v]) => ({ month, ...v }));
  }, [transactions]);

  if (transactions.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Расходы по категориям</h3>
        {expenseByCategory.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500">Нет расходов для отображения</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={expenseByCategory} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {expenseByCategory.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatMoney(Number(v), currency)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Доходы и расходы по месяцам</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => formatMoney(Number(v), currency)} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="income" name="Доход" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="Расход" fill="#f43f5e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
