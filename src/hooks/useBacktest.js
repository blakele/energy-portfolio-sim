import { useEffect, useCallback, useState, useRef } from 'react';
import { usePriceStore } from '../stores/priceStore.js';
import { usePortfolioStore } from '../stores/portfolioStore.js';
import { useAnalysisStore } from '../stores/analysisStore.js';
import { fetchAllHistory, clearAllHistoryCache } from '../services/priceService.js';
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

  const status = useAnalysisStore(s => s.status);
  const error = useAnalysisStore(s => s.error);

  const [progress, setProgress] = useState(null);

  const loadingRef = useRef(false);

  const fetchHistory = useCallback(async () => {
    if (!hasApiKey() || loadingRef.current) return;
    loadingRef.current = true;

    const { stocks, benchmark } = usePortfolioStore.getState();
    const allSymbols = [...stocks.map(s => s.symbol), benchmark.symbol];

    const analysisStore = useAnalysisStore.getState();
    analysisStore.setStatus('loading');
    analysisStore.setError(null);
    setProgress({ loaded: 0, total: allSymbols.length, currentSymbol: '' });

    const { setHistoryLoading, setAllHistory } = usePriceStore.getState();
    setHistoryLoading(true);

    try {
      const { results, successCount, failCount, succeeded, failed, errors } =
        await fetchAllHistory(allSymbols, (loaded, total, sym, ok) => {
          setProgress({ loaded, total, currentSymbol: sym });
        });

      setAllHistory(results);

      const hasBenchmark = (results[benchmark.symbol]?.length || 0) > 0;
      const stocksWithData = stocks.filter(s => (results[s.symbol]?.length || 0) > 0).length;

      if (hasBenchmark && stocksWithData >= Math.min(3, stocks.length)) {
        analysisStore.setStatus('success');
      } else {
        analysisStore.setStatus('error');
        analysisStore.setError({
          message: !hasBenchmark
            ? `Could not load ${benchmark.symbol} benchmark data. Check your Finnhub API key supports historical candles.`
            : `Only ${stocksWithData} of ${stocks.length} stocks returned data (need at least ${Math.min(3, stocks.length)}).`,
          successCount,
          failCount,
          succeeded,
          failed,
          errors,
        });
      }
    } catch (err) {
      console.error('History fetch failed:', err);
      const { stocks: s, benchmark: b } = usePortfolioStore.getState();
      const syms = [...s.map(x => x.symbol), b.symbol];
      analysisStore.setStatus('error');
      analysisStore.setError({
        message: err.message || 'Failed to fetch historical data',
        successCount: 0,
        failCount: syms.length,
        succeeded: [],
        failed: [...syms],
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

    const { stocks, benchmark } = usePortfolioStore.getState();

    const stockHistory = {};
    let hasData = false;
    for (const s of stocks) {
      if (history[s.symbol]?.length > 0) {
        stockHistory[s.symbol] = history[s.symbol];
        hasData = true;
      }
    }
    if (!hasData || !history[benchmark.symbol]?.length) return;

    const store = useAnalysisStore.getState();
    store.setLoading(true);

    try {
      const fundamentals = useFundamentalsStore.getState().metrics;
      const bt = runBacktest(stockHistory, history[benchmark.symbol], allocations, investmentAmount, fundamentals, stocks, benchmark);
      store.setBacktestData(bt);

      const rm = computeRiskMetrics(bt.portfolioReturns, bt.spyReturns);
      store.setRiskMetrics(rm);

      const dd = computeDrawdownSeries(bt.portfolioValues);
      store.setDrawdownSeries(dd);

      const corr = computeCorrelation(stockHistory, stocks);
      store.setCorrelationMatrix(corr);

      const sa = computeSectorAttribution(stockHistory, allocations, investmentAmount, stocks);
      store.setSectorData(sa);
    } catch (err) {
      console.error('Analysis computation failed:', err);
    } finally {
      store.setLoading(false);
    }
  }, [status, history, allocations, investmentAmount]);

  return { fetchHistory, retry, status, error, progress };
}
