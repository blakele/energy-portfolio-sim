import { create } from 'zustand';

export const useSignalsStore = create((set) => ({
  technicals: {},            // { symbol: { rsi, ma, drawdown, volume } }
  signals: {},               // { symbol: { score, signal, components } }
  portfolioHealth: null,     // number 0-100
  rebalanceData: [],         // [{ symbol, targetPct, actualPct, drift, action, shares }]
  slTpAlerts: [],            // [{ symbol, type, threshold, currentReturn }]
  concentrationWarnings: [], // [{ stocks, avgCorrelation, combinedAllocation, warning }]
  loading: false,
  computed: false,

  setTechnicals: (data) => set({ technicals: data }),
  setSignals: (data) => set({ signals: data }),
  setPortfolioHealth: (val) => set({ portfolioHealth: val }),
  setRebalanceData: (data) => set({ rebalanceData: data }),
  setSlTpAlerts: (data) => set({ slTpAlerts: data }),
  setConcentrationWarnings: (data) => set({ concentrationWarnings: data }),
  setLoading: (val) => set({ loading: val }),
  setComputed: (val) => set({ computed: val }),

  clearSignals: () =>
    set({
      technicals: {},
      signals: {},
      portfolioHealth: null,
      rebalanceData: [],
      slTpAlerts: [],
      concentrationWarnings: [],
      computed: false,
    }),
}));
