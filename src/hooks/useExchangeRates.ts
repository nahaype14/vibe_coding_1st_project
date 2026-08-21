import { useCallback, useEffect, useState } from "react";
import { FALLBACK_RATES, fetchExchangeRates, type RatesSnapshot } from "../utils/exchangeRates";
import { useLocalStorage } from "./useLocalStorage";

const STALE_AFTER_MS = 12 * 60 * 60 * 1000; // 12 hours

export type RatesStatus = "idle" | "loading" | "error";

export function useExchangeRates() {
  const [snapshot, setSnapshot] = useLocalStorage<RatesSnapshot | null>("expense-tracker:rates", null);
  const [status, setStatus] = useState<RatesStatus>("idle");

  const refresh = useCallback(() => {
    setStatus("loading");
    fetchExchangeRates()
      .then((next) => {
        setSnapshot(next);
        setStatus("idle");
      })
      .catch(() => setStatus("error"));
  }, [setSnapshot]);

  useEffect(() => {
    if (!snapshot || Date.now() - snapshot.fetchedAt > STALE_AFTER_MS) {
      refresh();
    }
    // Only ever auto-refresh once, right after mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    // Conversion always has something to work with: the live snapshot when we
    // have one, otherwise the built-in fallback table (never null/1:1-only).
    rates: snapshot?.rates ?? FALLBACK_RATES,
    isLive: snapshot !== null,
    fetchedAt: snapshot?.fetchedAt ?? null,
    status,
    refresh,
  };
}
