import { useEffect, useMemo, useState } from "react";
import { Charts } from "./components/Charts";
import { Filters, type FilterState } from "./components/Filters";
import { Header } from "./components/Header";
import { SummaryCards } from "./components/SummaryCards";
import { Tabs } from "./components/Tabs";
import { TransactionForm } from "./components/TransactionForm";
import { TransactionList } from "./components/TransactionList";
import { useExchangeRates } from "./hooks/useExchangeRates";
import { useLocalStorage } from "./hooks/useLocalStorage";
import type { CurrencyCode, Transaction } from "./types";
import { convertAmount } from "./utils/exchangeRates";

const EMPTY_FILTERS: FilterState = { type: "all", category: "all", search: "", from: "", to: "" };

const TABS = [
  { id: "overview", label: "Обзор", icon: "📊" },
  { id: "add", label: "Добавить", icon: "➕" },
  { id: "transactions", label: "Операции", icon: "📋" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function computeTotals(
  list: Transaction[],
  displayCurrency: CurrencyCode,
  rates: Partial<Record<CurrencyCode, number>> | null,
) {
  let income = 0;
  let expense = 0;
  for (const t of list) {
    const amount = convertAmount(t.amount, t.currency, displayCurrency, rates);
    if (t.type === "income") income += amount;
    else expense += amount;
  }
  return { income, expense };
}

function toDisplayCurrency(
  list: Transaction[],
  displayCurrency: CurrencyCode,
  rates: Partial<Record<CurrencyCode, number>> | null,
): Transaction[] {
  return list.map((t) => ({
    ...t,
    amount: convertAmount(t.amount, t.currency, displayCurrency, rates),
    currency: displayCurrency,
  }));
}

function App() {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>("expense-tracker:transactions", []);
  const [currency, setCurrency] = useLocalStorage<CurrencyCode>("expense-tracker:currency", "RUB");
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [tab, setTab] = useState<TabId>("overview");
  const {
    rates,
    isLive: ratesAreLive,
    status: ratesStatus,
    fetchedAt: ratesFetchedAt,
    refresh: refreshRates,
  } = useExchangeRates();

  // Transactions saved before per-transaction currency tracking was added have no `currency` —
  // assume they were entered in the app's original default currency (RUB).
  useEffect(() => {
    setTransactions((prev) =>
      prev.some((t) => !t.currency) ? prev.map((t) => (t.currency ? t : { ...t, currency: "RUB" })) : prev,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addTransaction(t: Omit<Transaction, "id">) {
    setTransactions((prev) => [{ ...t, id: uid() }, ...prev]);
    setTab("transactions");
  }

  function deleteTransaction(id: string) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => filters.type === "all" || t.type === filters.type)
      .filter((t) => filters.category === "all" || t.category === filters.category)
      .filter((t) => !filters.from || t.date >= filters.from)
      .filter((t) => !filters.to || t.date <= filters.to)
      .filter((t) => !filters.search || t.note?.toLowerCase().includes(filters.search.toLowerCase()))
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [transactions, filters]);

  const overallTotals = useMemo(
    () => computeTotals(transactions, currency, rates),
    [transactions, currency, rates],
  );
  const filteredTotals = useMemo(() => computeTotals(filtered, currency, rates), [filtered, currency, rates]);

  const overviewChartData = useMemo(
    () => toDisplayCurrency(transactions, currency, rates),
    [transactions, currency, rates],
  );

  async function exportCsv() {
    const header = "Дата,Тип,Категория,Сумма,Валюта,Комментарий";
    const rows = filtered.map((t) =>
      [t.date, t.type === "income" ? "Доход" : "Расход", t.category, t.amount, t.currency, t.note ?? ""]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const csv = [header, ...rows].join("\n");
    const filename = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;

    let claudeDownloads: ClaudeDownloads | null = null;
    try {
      claudeDownloads = (await window.claude?.use("downloads")) ?? null;
    } catch {
      claudeDownloads = null;
    }
    if (claudeDownloads) {
      try {
        await claudeDownloads.save({ filename, data: "﻿" + csv });
        return;
      } catch {
        // fall through to the direct browser download below
      }
    }

    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto flex max-w-4xl flex-col gap-5 px-4 py-6">
        <Header
          currency={currency}
          onCurrencyChange={setCurrency}
          onExport={exportCsv}
          hasData={filtered.length > 0}
          ratesStatus={ratesStatus}
          ratesAreLive={ratesAreLive}
          ratesFetchedAt={ratesFetchedAt}
          onRefreshRates={refreshRates}
        />

        <Tabs tabs={[...TABS]} active={tab} onChange={(id) => setTab(id as TabId)} />

        {tab === "overview" && (
          <>
            <SummaryCards income={overallTotals.income} expense={overallTotals.expense} currency={currency} />
            <Charts transactions={overviewChartData} currency={currency} />
            {transactions.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700">
                Записей пока нет. Перейдите во вкладку «Добавить», чтобы внести первую операцию.
              </div>
            )}
          </>
        )}

        {tab === "add" && <TransactionForm currency={currency} onAdd={addTransaction} />}

        {tab === "transactions" && (
          <>
            <SummaryCards income={filteredTotals.income} expense={filteredTotals.expense} currency={currency} />
            <Filters filters={filters} onChange={setFilters} />
            <TransactionList transactions={filtered} currency={currency} rates={rates} onDelete={deleteTransaction} />
          </>
        )}

        <footer className="pb-6 pt-2 text-center text-xs text-slate-400">
          Все данные хранятся локально в вашем браузере и никуда не отправляются.
        </footer>
      </div>
    </div>
  );
}

export default App;
