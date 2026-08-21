import type { CurrencyCode } from "../types";
import { CURRENCIES } from "../types";
import type { RatesStatus } from "../hooks/useExchangeRates";

interface Props {
  currency: CurrencyCode;
  onCurrencyChange: (c: CurrencyCode) => void;
  onExport: () => void;
  hasData: boolean;
  ratesStatus: RatesStatus;
  ratesFetchedAt: number | null;
  onRefreshRates: () => void;
}

function formatFetchedAt(ts: number): string {
  return new Date(ts).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function Header({
  currency,
  onCurrencyChange,
  onExport,
  hasData,
  ratesStatus,
  ratesFetchedAt,
  onRefreshRates,
}: Props) {
  return (
    <header className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
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
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500">
        {ratesStatus === "loading" && <span>Обновление курса валют…</span>}
        {ratesStatus === "error" && <span className="text-rose-600 dark:text-rose-400">Не удалось получить курс валют</span>}
        {ratesStatus === "idle" && ratesFetchedAt && <span>Курс обновлён: {formatFetchedAt(ratesFetchedAt)}</span>}
        {ratesStatus === "idle" && !ratesFetchedAt && <span>Курс валют ещё не загружен</span>}
        <button
          type="button"
          onClick={onRefreshRates}
          disabled={ratesStatus === "loading"}
          className="font-medium text-indigo-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50 dark:text-indigo-400"
        >
          Обновить курс
        </button>
      </div>
    </header>
  );
}
