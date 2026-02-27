import { fromUnix } from '../utils/dateUtils.js';

/**
 * Run a historical backtest: replay daily prices with given allocations.
 * Returns portfolio value series and SPY series for comparison.
 * If metricsMap is provided, also computes dividend-adjusted total return series.
 *
 * @param {Object} stockHistory - { symbol: candle[] }
 * @param {Array} spyHistory - candle[]
 * @param {Object} allocations - { symbol: pct }
 * @param {number} investmentAmount
 * @param {Object} metricsMap - { symbol: { dividendPerShare } }
 * @param {Array} stocks - portfolio stock definitions
 * @param {Object} benchmark - { symbol, entryPrice }
 */
export function runBacktest(stockHistory, spyHistory, allocations, investmentAmount, metricsMap = {}, stocks = [], benchmark = { entryPrice: 600 }) {
  const dateMap = new Map();

  const spyByDate = new Map();
  for (const candle of spyHistory) {
    const dateKey = candle.date;
    spyByDate.set(dateKey, candle.close);
  }

  const spyDates = new Set(spyByDate.keys());

  const stockByDate = {};
  for (const s of stocks) {
    stockByDate[s.symbol] = new Map();
    const hist = stockHistory[s.symbol] || [];
    for (const candle of hist) {
      stockByDate[s.symbol].set(candle.date, candle.close);
    }
  }

  const allDates = [...spyDates].sort((a, b) => a - b);

  if (allDates.length < 2) {
    return { dates: [], portfolioValues: [], portfolioTotalValues: [], spyValues: [], portfolioReturns: [], spyReturns: [], totalDividends: 0 };
  }

  const firstDate = allDates[0];
  const basePrices = {};
  for (const s of stocks) {
    basePrices[s.symbol] = stockByDate[s.symbol].get(firstDate) || s.entryPrice;
  }
  const spyBasePrice = spyByDate.get(firstDate) || benchmark.entryPrice;

  const dates = [];
  const portfolioValues = [];
  const portfolioTotalValues = [];
  const spyValues = [];
  let cumulativeDividends = 0;

  for (const date of allDates) {
    let portfolioValue = 0;
    let totalAllocUsed = 0;
    let dailyDividendAccrual = 0;

    for (const s of stocks) {
      const alloc = (allocations[s.symbol] || 0) / 100;
      const price = stockByDate[s.symbol].get(date);
      if (price != null && basePrices[s.symbol]) {
        const invested = investmentAmount * alloc;
        const shares = invested / basePrices[s.symbol];
        portfolioValue += shares * price;
        totalAllocUsed += alloc;

        const dps = metricsMap[s.symbol]?.dividendPerShare;
        if (dps && dps > 0) {
          dailyDividendAccrual += shares * (dps / 252);
        }
      }
    }

    if (totalAllocUsed < 0.5) continue;

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
