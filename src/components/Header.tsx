import type { CurrencyCode } from "../types";
import { CURRENCIES } from "../types";

interface Props {
  currency: CurrencyCode;
  onCurrencyChange: (c: CurrencyCode) => void;
  onExport: () => void;
  hasData: boolean;
}

export function Header({ currency, onCurrencyChange, onExport, hasData }: Props) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">💰 Учёт доходов и расходов</h1>
        <p className="text-sm text-slate-500">Ваши финансы под контролем — данные хранятся только в этом браузере</p>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
          className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
          aria-label="Валюта"
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onExport}
          disabled={!hasData}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Экспорт CSV
        </button>
      </div>
    </header>
  );
}
