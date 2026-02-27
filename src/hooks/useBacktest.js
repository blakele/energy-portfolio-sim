import { useEffect, useCallback, useState, useRef } from 'react';
import { usePriceStore } from '../stores/priceStore.js';
import { usePortfolioStore } from '../stores/portfolioStore.js';
import { useAnalysisStore } from '../stores/analysisStore.js';
import { fetchAllHistory, clearAllHistoryCache } from '../services/priceService.js';
import { STOCKS, BENCHMARK, ALL_SYMBOLS } from '../config/portfolio.js';
import { runBacktest } from '../analysis/backtest.js';
import { computeRiskMetrics, computeDrawdownSeries } from '../analysis/riskMetrics.js';
import { computeCorrelation } from '../analysis/correlation.js';
import { computeSectorAttribution } from '../analysis/sectorAttribution.js';
import { hasApiKey } from '../services/finnhub.js';
import { useFundamentalsStore } from '../stores/fundamentalsStore.js';

export function useBacktest() {
  const history = usePriceStore(s => s.history);
  const allocations = usePortfolioStore(s => s.allocations);
  const investmentAmount = usePortfolioStore(s => s.investmentAmount);

  // Status and error live in the store so they persist across tab switches
  const status = useAnalysisStore(s => s.status);
  const error = useAnalysisStore(s => s.error);

  // Progress is ephemeral (only relevant during active fetch)
  const [progress, setProgress] = useState(null);

  const loadingRef = useRef(false);

  const fetchHistory = useCallback(async () => {
    if (!hasApiKey() || loadingRef.current) return;
    loadingRef.current = true;

    const analysisStore = useAnalysisStore.getState();
    analysisStore.setStatus('loading');
    analysisStore.setError(null);
    setProgress({ loaded: 0, total: ALL_SYMBOLS.length, currentSymbol: '' });

    const { setHistoryLoading, setAllHistory } = usePriceStore.getState();
    setHistoryLoading(true);

    try {
      const { results, successCount, failCount, succeeded, failed, errors } =
        await fetchAllHistory(ALL_SYMBOLS, (loaded, total, sym, ok) => {
          setProgress({ loaded, total, currentSymbol: sym });
        });

      setAllHistory(results);

      // Need SPY + at least 3 stocks with data for a meaningful backtest
      const hasSpy = (results[BENCHMARK.symbol]?.length || 0) > 0;
      const stocksWithData = STOCKS.filter(s => (results[s.symbol]?.length || 0) > 0).length;

      if (hasSpy && stocksWithData >= 3) {
        analysisStore.setStatus('success');
      } else {
        analysisStore.setStatus('error');
        analysisStore.setError({
          message: !hasSpy
            ? 'Could not load SPY benchmark data. Check your Finnhub API key supports historical candles.'
            : `Only ${stocksWithData} of ${STOCKS.length} stocks returned data (need at least 3).`,
          successCount,
          failCount,
          succeeded,
          failed,
          errors,
        });
      }
    } catch (err) {
      console.error('History fetch failed:', err);
      analysisStore.setStatus('error');
      analysisStore.setError({
        message: err.message || 'Failed to fetch historical data',
        successCount: 0,
        failCount: ALL_SYMBOLS.length,
        succeeded: [],
        failed: [...ALL_SYMBOLS],
        errors: {},
      });
    } finally {
      setHistoryLoading(false);
      loadingRef.current = false;
      setProgress(null);
    }
  }, []);

  const retry = useCallback(() => {
    clearAllHistoryCache();
    const analysisStore = useAnalysisStore.getState();
    analysisStore.setStatus('idle');
    analysisStore.setError(null);
  }, []);

  // Run analysis when status is success and data changes
  useEffect(() => {
    if (status !== 'success') return;

    const stockHistory = {};
    let hasData = false;
    for (const s of STOCKS) {
      if (history[s.symbol]?.length > 0) {
        stockHistory[s.symbol] = history[s.symbol];
        hasData = true;
      }
    }
    if (!hasData || !history[BENCHMARK.symbol]?.length) return;

    const store = useAnalysisStore.getState();
    store.setLoading(true);

    try {
      const fundamentals = useFundamentalsStore.getState().metrics;
      const bt = runBacktest(stockHistory, history[BENCHMARK.symbol], allocations, investmentAmount, fundamentals);
      store.setBacktestData(bt);

      const rm = computeRiskMetrics(bt.portfolioReturns, bt.spyReturns);
      store.setRiskMetrics(rm);

      const dd = computeDrawdownSeries(bt.portfolioValues);
      store.setDrawdownSeries(dd);

      const corr = computeCorrelation(stockHistory);
      store.setCorrelationMatrix(corr);

      const sa = computeSectorAttribution(stockHistory, allocations, investmentAmount);
      store.setSectorData(sa);
    } catch (err) {
      console.error('Analysis computation failed:', err);
    } finally {
      store.setLoading(false);
    }
  }, [status, history, allocations, investmentAmount]);

  return { fetchHistory, retry, status, error, progress };
}
