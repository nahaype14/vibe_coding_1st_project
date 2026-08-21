import type { CurrencyCode, Transaction } from "../types";
import { convertAmount } from "../utils/exchangeRates";
import { formatDate, formatMoney } from "../utils/format";

interface Props {
  transactions: Transaction[];
  currency: CurrencyCode;
  rates: Partial<Record<CurrencyCode, number>> | null;
  onDelete: (id: string) => void;
}

export function TransactionList({ transactions, currency, rates, onDelete }: Props) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700">
        Записей пока нет. Добавьте первую операцию выше.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <ul className="divide-y divide-slate-100 dark:divide-slate-800">
        {transactions.map((t) => {
          const displayAmount = convertAmount(t.amount, t.currency, currency, rates);
          const wasConverted = t.currency !== currency;
          return (
            <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block h-2 w-2 shrink-0 rounded-full ${
                      t.type === "income" ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                  />
                  <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{t.category}</p>
                </div>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {formatDate(t.date)}
                  {t.note ? ` · ${t.note}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-3 sm:flex-row sm:items-center">
                <div className="text-right">
                  <span
                    className={`text-sm font-semibold ${
                      t.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {formatMoney(displayAmount, currency)}
                  </span>
                  {wasConverted && (
                    <p className="text-xs text-slate-400">введено: {formatMoney(t.amount, t.currency)}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(t.id)}
                  aria-label="Удалить запись"
                  className="rounded-lg px-2 py-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"
                >
                  ✕
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
