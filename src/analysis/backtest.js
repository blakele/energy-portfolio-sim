import { STOCKS, BENCHMARK } from '../config/portfolio.js';
import { fromUnix } from '../utils/dateUtils.js';

/**
 * Run a historical backtest: replay daily prices with given allocations.
 * Returns portfolio value series and SPY series for comparison.
 * If metricsMap is provided, also computes dividend-adjusted total return series.
 */
export function runBacktest(stockHistory, spyHistory, allocations, investmentAmount, metricsMap = {}) {
  // Build a map of date -> { symbol: close } for aligned dates
  const dateMap = new Map();

  // Index SPY by date first
  const spyByDate = new Map();
  for (const candle of spyHistory) {
    const dateKey = candle.date; // unix timestamp
    spyByDate.set(dateKey, candle.close);
  }

  // Collect all dates where SPY has data
  const spyDates = new Set(spyByDate.keys());

  // For each stock, index by date
  const stockByDate = {};
  for (const s of STOCKS) {
    stockByDate[s.symbol] = new Map();
    const hist = stockHistory[s.symbol] || [];
    for (const candle of hist) {
      stockByDate[s.symbol].set(candle.date, candle.close);
    }
  }

  // Find dates where SPY and at least some stocks have data
  const allDates = [...spyDates].sort((a, b) => a - b);

  if (allDates.length < 2) {
    return { dates: [], portfolioValues: [], portfolioTotalValues: [], spyValues: [], portfolioReturns: [], spyReturns: [], totalDividends: 0 };
  }

  // Get first day's prices as base for normalization
  const firstDate = allDates[0];
  const basePrices = {};
  for (const s of STOCKS) {
    basePrices[s.symbol] = stockByDate[s.symbol].get(firstDate) || s.entryPrice;
  }
  const spyBasePrice = spyByDate.get(firstDate) || BENCHMARK.entryPrice;

  const dates = [];
  const portfolioValues = [];
  const portfolioTotalValues = [];
  const spyValues = [];
  let cumulativeDividends = 0;

  for (const date of allDates) {
    let portfolioValue = 0;
    let totalAllocUsed = 0;
    let dailyDividendAccrual = 0;

    for (const s of STOCKS) {
      const alloc = (allocations[s.symbol] || 0) / 100;
      const price = stockByDate[s.symbol].get(date);
      if (price != null && basePrices[s.symbol]) {
        // Shares bought at base price with allocated capital
        const invested = investmentAmount * alloc;
        const shares = invested / basePrices[s.symbol];
        portfolioValue += shares * price;
        totalAllocUsed += alloc;

        // Dividend accrual (spread annual dividend across 252 trading days)
        const dps = metricsMap[s.symbol]?.dividendPerShare;
        if (dps && dps > 0) {
          dailyDividendAccrual += shares * (dps / 252);
        }
      }
    }

    // Only include dates where we have enough stock data
    if (totalAllocUsed < 0.5) continue;

    // Scale portfolio value up if some stocks don't have data for this date
    if (totalAllocUsed < 0.99) {
      portfolioValue = portfolioValue / totalAllocUsed;
      dailyDividendAccrual = dailyDividendAccrual / totalAllocUsed;
    }

    cumulativeDividends += dailyDividendAccrual;

    const spyPrice = spyByDate.get(date);
    const spyVal = (investmentAmount / spyBasePrice) * spyPrice;

    const d = fromUnix(date);
    dates.push(d.toISOString().split('T')[0]);
    portfolioValues.push(Math.round(portfolioValue * 100) / 100);
    portfolioTotalValues.push(Math.round((portfolioValue + cumulativeDividends) * 100) / 100);
    spyValues.push(Math.round(spyVal * 100) / 100);
  }

  // Compute daily returns (price-only)
  const portfolioReturns = [];
  const spyReturns = [];
  for (let i = 1; i < portfolioValues.length; i++) {
    portfolioReturns.push((portfolioValues[i] - portfolioValues[i - 1]) / portfolioValues[i - 1]);
    spyReturns.push((spyValues[i] - spyValues[i - 1]) / spyValues[i - 1]);
  }

  return {
    dates,
    portfolioValues,
    portfolioTotalValues,
    spyValues,
    portfolioReturns,
    spyReturns,
    totalDividends: Math.round(cumulativeDividends * 100) / 100,
  };
}
