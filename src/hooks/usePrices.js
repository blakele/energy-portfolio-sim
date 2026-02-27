import { useEffect, useCallback, useRef } from 'react';
import { usePriceStore } from '../stores/priceStore.js';
import { usePortfolioStore } from '../stores/portfolioStore.js';
import { fetchAllQuotes } from '../services/priceService.js';
import { hasApiKey } from '../services/finnhub.js';
import { isMarketOpen } from '../utils/dateUtils.js';

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function usePrices() {
  const loading = usePriceStore(s => s.loading);
  const intervalRef = useRef(null);

  const refresh = useCallback(async () => {
    if (!hasApiKey()) {
      console.warn('[usePrices] No API key — skipping fetch');
      return;
    }

    const { stocks, benchmark } = usePortfolioStore.getState();
    const allSymbols = [...stocks.map(s => s.symbol), benchmark.symbol];

    console.log('[usePrices] Starting price fetch...');
    const { setLoading, clearErrors, setQuotes, setError } = usePriceStore.getState();
    setLoading(true);
    clearErrors();

    try {
      const { results, errors } = await fetchAllQuotes(allSymbols);
      const successCount = Object.keys(results).length;
      const errorCount = Object.keys(errors).length;
      console.log(`[usePrices] Done: ${successCount} succeeded, ${errorCount} failed`);
      if (errorCount > 0) console.warn('[usePrices] Errors:', errors);
      setQuotes(results);
      Object.entries(errors).forEach(([sym, msg]) => setError(sym, msg));
    } catch (err) {
      console.error('[usePrices] Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    intervalRef.current = setInterval(() => {
      if (isMarketOpen()) refresh();
    }, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refresh]);

  return { refresh, loading };
}
