import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "../types";

export interface FilterState {
  type: "all" | "income" | "expense";
  category: string;
  search: string;
  from: string;
  to: string;
}

interface Props {
  filters: FilterState;
  onChange: (f: FilterState) => void;
}

const ALL_CATEGORIES = Array.from(new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]));

export function Filters({ filters, onChange }: Props) {
  function set<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <select
        value={filters.type}
        onChange={(e) => set("type", e.target.value as FilterState["type"])}
        className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
      >
        <option value="all">Все типы</option>
        <option value="income">Доходы</option>
        <option value="expense">Расходы</option>
      </select>

      <select
        value={filters.category}
        onChange={(e) => set("category", e.target.value)}
        className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
      >
        <option value="all">Все категории</option>
        {ALL_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={filters.from}
        onChange={(e) => set("from", e.target.value)}
        className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
        aria-label="С даты"
      />
      <input
        type="date"
        value={filters.to}
        onChange={(e) => set("to", e.target.value)}
        className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
        aria-label="По дату"
      />

      <input
        type="search"
        placeholder="Поиск по комментарию..."
        value={filters.search}
        onChange={(e) => set("search", e.target.value)}
        className="min-w-[10rem] flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
      />

      {(filters.type !== "all" || filters.category !== "all" || filters.search || filters.from || filters.to) && (
        <button
          type="button"
          onClick={() => onChange({ type: "all", category: "all", search: "", from: "", to: "" })}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          Сбросить
        </button>
      )}
    </div>
  );
}
