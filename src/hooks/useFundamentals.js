import { useEffect, useCallback, useRef } from 'react';
import { useFundamentalsStore } from '../stores/fundamentalsStore.js';
import { usePortfolioStore } from '../stores/portfolioStore.js';
import { fetchAllMetrics } from '../services/priceService.js';

export function useFundamentals() {
  const loading = useFundamentalsStore(s => s.loading);
  const hasFetchedRef = useRef(false);

  const refresh = useCallback(async () => {
    const { stocks, benchmark } = usePortfolioStore.getState();
    const allSymbols = [...stocks.map(s => s.symbol), benchmark.symbol];

    console.log('[useFundamentals] Starting fundamentals fetch via Yahoo Finance...');
    const { setLoading, clearErrors, setMetrics, setError } = useFundamentalsStore.getState();
    setLoading(true);
    clearErrors();

    try {
      const { results, errors } = await fetchAllMetrics(allSymbols);
      const successCount = Object.keys(results).length;
      const errorCount = Object.keys(errors).length;
      console.log(`[useFundamentals] Done: ${successCount} succeeded, ${errorCount} failed`);
      if (errorCount > 0) console.warn('[useFundamentals] Errors:', errors);
      setMetrics(results);
      Object.entries(errors).forEach(([sym, msg]) => setError(sym, msg));
    } catch (err) {
      console.error('[useFundamentals] Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      refresh();
    }
  }, [refresh]);

  return { refresh, loading };
}
