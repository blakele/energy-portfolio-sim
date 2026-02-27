function dailyReturns(candles) {
  const returns = [];
  for (let i = 1; i < candles.length; i++) {
    returns.push((candles[i].close - candles[i - 1].close) / candles[i - 1].close);
  }
  return returns;
}

function pearson(a, b) {
  const n = Math.min(a.length, b.length);
  if (n < 5) return 0;

  let sumA = 0, sumB = 0, sumA2 = 0, sumB2 = 0, sumAB = 0;
  for (let i = 0; i < n; i++) {
    sumA += a[i];
    sumB += b[i];
    sumA2 += a[i] * a[i];
    sumB2 += b[i] * b[i];
    sumAB += a[i] * b[i];
  }

  const num = n * sumAB - sumA * sumB;
  const den = Math.sqrt((n * sumA2 - sumA * sumA) * (n * sumB2 - sumB * sumB));
  return den === 0 ? 0 : num / den;
}

/**
 * Compute pairwise correlation matrix from historical candle data.
 * @param {Object} stockHistory - { symbol: candle[] }
 * @param {Array} stocks - portfolio stock definitions
 */
export function computeCorrelation(stockHistory, stocks = []) {
  const symbols = stocks.map(s => s.symbol).filter(sym => stockHistory[sym]?.length > 10);
  const returns = {};

  for (const sym of symbols) {
    returns[sym] = dailyReturns(stockHistory[sym]);
  }

  const matrix = [];
  for (let i = 0; i < symbols.length; i++) {
    const row = [];
    for (let j = 0; j < symbols.length; j++) {
      if (i === j) {
        row.push(1);
      } else {
        row.push(Math.round(pearson(returns[symbols[i]], returns[symbols[j]]) * 100) / 100);
      }
    }
    matrix.push(row);
  }

  return { symbols, matrix };
}
