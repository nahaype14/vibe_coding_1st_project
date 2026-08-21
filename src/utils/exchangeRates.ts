import type { CurrencyCode } from "../types";

const RATES_URL = "https://open.er-api.com/v6/latest/USD";
const FETCH_TIMEOUT_MS = 8000;

export interface RatesSnapshot {
  base: "USD";
  rates: Partial<Record<CurrencyCode, number>>;
  fetchedAt: number;
}

export async function fetchExchangeRates(): Promise<RatesSnapshot> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(RATES_URL, { signal: controller.signal });
    if (!res.ok) throw new Error(`Не удалось получить курс валют (HTTP ${res.status})`);
    const data = (await res.json()) as { result?: string; rates?: Record<string, number> };
    if (data.result !== "success" || !data.rates) throw new Error("Некорректный ответ сервиса курсов валют");
    return { base: "USD", rates: data.rates, fetchedAt: Date.now() };
  } finally {
    clearTimeout(timeout);
  }
}

/** Converts an amount between currencies using USD-based rates; falls back to the original amount if a rate is missing. */
export function convertAmount(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  rates: Partial<Record<CurrencyCode, number>> | null,
): number {
  if (from === to) return amount;
  const fromRate = rates?.[from];
  const toRate = rates?.[to];
  if (!fromRate || !toRate) return amount;
  const usd = amount / fromRate;
  return usd * toRate;
}

export function canConvert(
  from: CurrencyCode,
  to: CurrencyCode,
  rates: Partial<Record<CurrencyCode, number>> | null,
): boolean {
  return from === to || Boolean(rates?.[from] && rates?.[to]);
}
