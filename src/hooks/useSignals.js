import { useEffect, useCallback, useRef } from 'react';
import { usePriceStore } from '../stores/priceStore.js';
import { usePortfolioStore } from '../stores/portfolioStore.js';
import { useAnalysisStore } from '../stores/analysisStore.js';
import { useFundamentalsStore } from '../stores/fundamentalsStore.js';
import { useSignalsStore } from '../stores/signalsStore.js';
import { computeAllTechnicals } from '../analysis/technicals.js';
import { computeAllSignals, computePortfolioHealth } from '../analysis/signals.js';
import { computeRebalanceDrifts, checkStopLossTakeProfit, computeCorrelationConcentration } from '../analysis/rebalance.js';

export function useSignals() {
  const history = usePriceStore(s => s.history);
  const quotes = usePriceStore(s => s.quotes);
  const allocations = usePortfolioStore(s => s.allocations);
  const investmentAmount = usePortfolioStore(s => s.investmentAmount);
  const stopLossConfig = usePortfolioStore(s => s.stopLossConfig);
  const correlationMatrix = useAnalysisStore(s => s.correlationMatrix);
  const fundamentals = useFundamentalsStore(s => s.metrics);
  const computed = useSignalsStore(s => s.computed);

  const computingRef = useRef(false);

  // Compute technicals + signals when history is available
  useEffect(() => {
    const { stocks } = usePortfolioStore.getState();
    const hasHistory = stocks.some(s => history[s.symbol]?.length > 50);
    if (!hasHistory) return;
    if (computingRef.current) return;
    computingRef.current = true;

    const store = useSignalsStore.getState();
    store.setLoading(true);

    try {
      const allTechnicals = {};
      for (const stock of stocks) {
        const candles = history[stock.symbol];
        if (candles?.length > 14) {
          allTechnicals[stock.symbol] = computeAllTechnicals(candles);
        }
      }

      store.setTechnicals(allTechnicals);

      const signals = computeAllSignals(allTechnicals, fundamentals);
      store.setSignals(signals);

      const health = computePortfolioHealth(signals, allocations);
      store.setPortfolioHealth(health);

      store.setComputed(true);
    } catch (err) {
      console.error('[useSignals] Technicals computation failed:', err);
    } finally {
      store.setLoading(false);
      computingRef.current = false;
    }
  }, [history, fundamentals, allocations]);

  // Recompute rebalance drifts when quotes change
  useEffect(() => {
    const hasQuotes = Object.keys(quotes).length > 0;
    if (!hasQuotes) return;

    const { stocks } = usePortfolioStore.getState();
    const store = useSignalsStore.getState();

    try {
      const drifts = computeRebalanceDrifts(allocations, quotes, stocks, investmentAmount);
      store.setRebalanceData(drifts);

      const alerts = checkStopLossTakeProfit(quotes, stocks, stopLossConfig);
      store.setSlTpAlerts(alerts);
    } catch (err) {
      console.error('[useSignals] Rebalance computation failed:', err);
    }
  }, [quotes, allocations, investmentAmount, stopLossConfig]);

  // Concentration warnings when correlation matrix is available
  useEffect(() => {
    if (!correlationMatrix) return;

    const store = useSignalsStore.getState();
    try {
      const warnings = computeCorrelationConcentration(correlationMatrix, allocations);
      store.setConcentrationWarnings(warnings);
    } catch (err) {
      console.error('[useSignals] Concentration computation failed:', err);
    }
  }, [correlationMatrix, allocations]);

  const computeSignals = useCallback(() => {
    computingRef.current = false;
    useSignalsStore.getState().setComputed(false);
  }, []);

  return { computeSignals };
}
