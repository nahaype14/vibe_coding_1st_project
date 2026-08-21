import { useId, useState } from "react";
import type { Transaction, TransactionType } from "../types";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "../types";
import { todayISO } from "../utils/format";

interface Props {
  onAdd: (t: Omit<Transaction, "id">) => void;
}

export function TransactionForm({ onAdd }: Props) {
  const formId = useId();
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const categories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  function handleTypeChange(next: TransactionType) {
    setType(next);
    setCategory(next === "expense" ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = Number(amount.replace(",", "."));
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Введите сумму больше нуля");
      return;
    }
    if (!date) {
      setError("Укажите дату");
      return;
    }
    onAdd({ type, amount: parsed, category, date, note: note.trim() || undefined });
    setAmount("");
    setNote("");
    setError("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => handleTypeChange("expense")}
          className={`flex-1 rounded-xl py-2 text-sm font-medium transition-colors ${
            type === "expense"
              ? "bg-rose-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          Расход
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange("income")}
          className={`flex-1 rounded-xl py-2 text-sm font-medium transition-colors ${
            type === "income"
              ? "bg-emerald-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          Доход
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 sm:col-span-1">
          <label htmlFor={`${formId}-amount`} className="mb-1 block text-xs font-medium text-slate-500">
            Сумма
          </label>
          <input
            id={`${formId}-amount`}
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label htmlFor={`${formId}-date`} className="mb-1 block text-xs font-medium text-slate-500">
            Дата
          </label>
          <input
            id={`${formId}-date`}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>

        <div className="col-span-2">
          <label htmlFor={`${formId}-category`} className="mb-1 block text-xs font-medium text-slate-500">
            Категория
          </label>
          <select
            id={`${formId}-category`}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2">
          <label htmlFor={`${formId}-note`} className="mb-1 block text-xs font-medium text-slate-500">
            Комментарий (необязательно)
          </label>
          <input
            id={`${formId}-note`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Например: продукты на неделю"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

      <button
        type="submit"
        className="mt-4 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
      >
        Добавить {type === "expense" ? "расход" : "доход"}
      </button>
    </form>
  );
}
