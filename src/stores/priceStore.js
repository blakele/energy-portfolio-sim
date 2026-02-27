import { create } from 'zustand';

export const usePriceStore = create((set, get) => ({
  quotes: {},       // { symbol: { price, change, changePercent, ... } }
  history: {},      // { symbol: [{ date, open, high, low, close, volume }] }
  loading: false,
  historyLoading: false,
  lastRefresh: null,
  errors: {},

  setQuote: (symbol, data) =>
    set(state => ({
      quotes: { ...state.quotes, [symbol]: data },
    })),

  setQuotes: (quotesMap) =>
    set(state => ({
      quotes: { ...state.quotes, ...quotesMap },
      lastRefresh: new Date(),
    })),

  setHistory: (symbol, data) =>
    set(state => ({
      history: { ...state.history, [symbol]: data },
    })),

  setAllHistory: (historyMap) =>
    set(state => ({
      history: { ...state.history, ...historyMap },
    })),

  setLoading: (val) => set({ loading: val }),
  setHistoryLoading: (val) => set({ historyLoading: val }),

  setError: (symbol, msg) =>
    set(state => ({
      errors: { ...state.errors, [symbol]: msg },
    })),

  clearErrors: () => set({ errors: {} }),

  getPrice: (symbol) => get().quotes[symbol]?.price ?? null,

  getReturn: (symbol, entryPrice) => {
    const price = get().quotes[symbol]?.price;
    if (!price || !entryPrice) return null;
    return ((price - entryPrice) / entryPrice) * 100;
  },
}));
