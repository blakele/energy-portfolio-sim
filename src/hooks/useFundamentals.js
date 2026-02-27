import { useEffect, useCallback, useRef } from 'react';
import { useFundamentalsStore } from '../stores/fundamentalsStore.js';
import { fetchAllMetrics } from '../services/priceService.js';
import { ALL_SYMBOLS } from '../config/portfolio.js';

export function useFundamentals() {
  const loading = useFundamentalsStore(s => s.loading);
  const hasFetchedRef = useRef(false);

  const refresh = useCallback(async () => {
    console.log('[useFundamentals] Starting fundamentals fetch via Yahoo Finance...');
    const { setLoading, clearErrors, setMetrics, setError } = useFundamentalsStore.getState();
    setLoading(true);
    clearErrors();

    try {
      const { results, errors } = await fetchAllMetrics(ALL_SYMBOLS);
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

  // Fetch once on mount (metrics cached 24h, no need for interval)
  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      refresh();
    }
  }, [refresh]);

  return { refresh, loading };
}
