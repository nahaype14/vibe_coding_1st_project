import type { CurrencyCode } from "../types";
import { formatMoney } from "../utils/format";

interface Props {
  income: number;
  expense: number;
  currency: CurrencyCode;
}

export function SummaryCards({ income, expense, currency }: Props) {
  const balance = income - expense;

  const cards = [
    { label: "Доходы", value: income, color: "text-emerald-600 dark:text-emerald-400" },
    { label: "Расходы", value: expense, color: "text-rose-600 dark:text-rose-400" },
    {
      label: "Баланс",
      value: balance,
      color: balance >= 0 ? "text-indigo-600 dark:text-indigo-400" : "text-rose-600 dark:text-rose-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{c.label}</p>
          <p className={`mt-1 text-2xl font-semibold ${c.color}`}>{formatMoney(c.value, currency)}</p>
        </div>
      ))}
    </div>
  );
}
