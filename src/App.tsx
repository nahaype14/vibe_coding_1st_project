import { useMemo, useState } from "react";
import { Charts } from "./components/Charts";
import { Filters, type FilterState } from "./components/Filters";
import { Header } from "./components/Header";
import { SummaryCards } from "./components/SummaryCards";
import { TransactionForm } from "./components/TransactionForm";
import { TransactionList } from "./components/TransactionList";
import { useLocalStorage } from "./hooks/useLocalStorage";
import type { CurrencyCode, Transaction } from "./types";

const EMPTY_FILTERS: FilterState = { type: "all", category: "all", search: "", from: "", to: "" };

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function App() {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>("expense-tracker:transactions", []);
  const [currency, setCurrency] = useLocalStorage<CurrencyCode>("expense-tracker:currency", "RUB");
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);

  function addTransaction(t: Omit<Transaction, "id">) {
    setTransactions((prev) => [{ ...t, id: uid() }, ...prev]);
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

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of filtered) {
      if (t.type === "income") income += t.amount;
      else expense += t.amount;
    }
    return { income, expense };
  }, [filtered]);

  function exportCsv() {
    const header = "Дата,Тип,Категория,Сумма,Комментарий";
    const rows = filtered.map((t) =>
      [t.date, t.type === "income" ? "Доход" : "Расход", t.category, t.amount, t.note ?? ""]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto flex max-w-4xl flex-col gap-5 px-4 py-6">
        <Header currency={currency} onCurrencyChange={setCurrency} onExport={exportCsv} hasData={filtered.length > 0} />

        <SummaryCards income={totals.income} expense={totals.expense} currency={currency} />

        <TransactionForm onAdd={addTransaction} />

        <Charts transactions={filtered} currency={currency} />

        <Filters filters={filters} onChange={setFilters} />

        <TransactionList transactions={filtered} currency={currency} onDelete={deleteTransaction} />

        <footer className="pb-6 pt-2 text-center text-xs text-slate-400">
          Все данные хранятся локально в вашем браузере и никуда не отправляются.
        </footer>
      </div>
    </div>
  );
}

export default App;
