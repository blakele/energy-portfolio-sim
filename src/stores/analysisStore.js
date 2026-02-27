import { create } from 'zustand';

export const useAnalysisStore = create((set) => ({
  backtestData: null,     // { dates, portfolioValues, spyValues }
  riskMetrics: null,      // { sharpe, sortino, maxDrawdown, volatility, beta, alpha }
  correlationMatrix: null, // { symbols, matrix: number[][] }
  sectorData: null,       // [{ sector, return, contribution }]
  drawdownSeries: null,   // [{ date, drawdown }]
  loading: false,
  status: 'idle',         // 'idle' | 'loading' | 'error' | 'success'
  error: null,

  setBacktestData: (data) => set({ backtestData: data }),
  setRiskMetrics: (data) => set({ riskMetrics: data }),
  setCorrelationMatrix: (data) => set({ correlationMatrix: data }),
  setSectorData: (data) => set({ sectorData: data }),
  setDrawdownSeries: (data) => set({ drawdownSeries: data }),
  setLoading: (val) => set({ loading: val }),
  setStatus: (val) => set({ status: val }),
  setError: (val) => set({ error: val }),

  clearAnalysis: () =>
    set({
      backtestData: null,
      riskMetrics: null,
      correlationMatrix: null,
      sectorData: null,
      drawdownSeries: null,
      status: 'idle',
      error: null,
    }),
}));
