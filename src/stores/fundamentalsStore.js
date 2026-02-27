import { create } from 'zustand';

export const useFundamentalsStore = create((set) => ({
  metrics: {},
  loading: false,
  errors: {},

  setMetrics: (metricsMap) =>
    set(state => ({
      metrics: { ...state.metrics, ...metricsMap },
    })),

  setLoading: (val) => set({ loading: val }),

  setError: (symbol, msg) =>
    set(state => ({
      errors: { ...state.errors, [symbol]: msg },
    })),

  clearErrors: () => set({ errors: {} }),
}));
