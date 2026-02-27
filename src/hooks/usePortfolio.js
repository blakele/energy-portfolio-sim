import { usePortfolioStore } from '../stores/portfolioStore.js';

/**
 * Convenience hook exposing portfolio stocks, benchmark, and derived data from the store.
 */
export function usePortfolio() {
  const stocks = usePortfolioStore(s => s.stocks);
  const benchmark = usePortfolioStore(s => s.benchmark);
  const setupComplete = usePortfolioStore(s => s.setupComplete);

  const allSymbols = [...stocks.map(s => s.symbol), benchmark.symbol];
  const sectors = [...new Set(stocks.map(s => s.sector))];

  const getStockBySymbol = (symbol) => stocks.find(s => s.symbol === symbol);
  const getStocksByTier = (tier) => stocks.filter(s => s.tier === tier);
  const getStocksBySector = (sector) => stocks.filter(s => s.sector === sector);

  return {
    stocks,
    benchmark,
    setupComplete,
    allSymbols,
    sectors,
    getStockBySymbol,
    getStocksByTier,
    getStocksBySector,
  };
}
