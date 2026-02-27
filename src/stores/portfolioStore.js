import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STOCKS } from '../config/portfolio.js';
import { PRESETS, DEFAULT_PRESET } from '../config/presets.js';

const defaultAllocations = PRESETS[DEFAULT_PRESET];

export const usePortfolioStore = create(
  persist(
    (set, get) => ({
      investmentAmount: 100000,
      allocations: { ...defaultAllocations },
      selectedPreset: DEFAULT_PRESET,
      stopLossConfig: {},

      setAllocation: (symbol, pct) =>
        set(state => ({
          allocations: { ...state.allocations, [symbol]: Math.max(0, Math.min(100, pct)) },
          selectedPreset: null,
        })),

      applyPreset: (name) =>
        set({
          allocations: { ...PRESETS[name] },
          selectedPreset: name,
        }),

      setInvestmentAmount: (amount) => set({ investmentAmount: amount }),

      normalize: () =>
        set(state => {
          const total = Object.values(state.allocations).reduce((a, b) => a + b, 0);
          if (total === 0) return state;
          const factor = 100 / total;
          const normalized = {};
          Object.entries(state.allocations).forEach(([k, v]) => {
            normalized[k] = Math.round(v * factor * 10) / 10;
          });
          // Fix rounding to sum to exactly 100
          const diff = 100 - Object.values(normalized).reduce((a, b) => a + b, 0);
          const maxKey = Object.entries(normalized).sort((a, b) => b[1] - a[1])[0][0];
          normalized[maxKey] = Math.round((normalized[maxKey] + diff) * 10) / 10;
          return { allocations: normalized };
        }),

      getTotalAllocation: () =>
        Object.values(get().allocations).reduce((a, b) => a + b, 0),

      getInvestedAmount: (symbol) => {
        const { investmentAmount, allocations } = get();
        return investmentAmount * ((allocations[symbol] || 0) / 100);
      },

      setStopLoss: (symbol, stopLossPct, takeProfitPct) =>
        set(state => ({
          stopLossConfig: {
            ...state.stopLossConfig,
            [symbol]: { stopLossPct, takeProfitPct },
          },
        })),

      removeStopLoss: (symbol) =>
        set(state => {
          const { [symbol]: _, ...rest } = state.stopLossConfig;
          return { stopLossConfig: rest };
        }),
    }),
    { name: 'energy-sim-portfolio' }
  )
);
