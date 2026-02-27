const TRADING_DAYS = 252;
const RISK_FREE_RATE = 0.045; // 4.5% annualized

function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stddev(arr) {
  const m = mean(arr);
  const variance = arr.reduce((sum, x) => sum + (x - m) ** 2, 0) / (arr.length - 1);
  return Math.sqrt(variance);
}

function covariance(a, b) {
  const ma = mean(a);
  const mb = mean(b);
  const n = Math.min(a.length, b.length);
  let sum = 0;
  for (let i = 0; i < n; i++) sum += (a[i] - ma) * (b[i] - mb);
  return sum / (n - 1);
}

/**
 * Compute risk metrics from daily return arrays.
 */
export function computeRiskMetrics(portfolioReturns, spyReturns) {
  if (!portfolioReturns?.length || !spyReturns?.length) return null;

  const n = Math.min(portfolioReturns.length, spyReturns.length);
  const pr = portfolioReturns.slice(0, n);
  const sr = spyReturns.slice(0, n);

  const dailyRf = RISK_FREE_RATE / TRADING_DAYS;

  // Annualized return
  const totalReturn = pr.reduce((acc, r) => acc * (1 + r), 1) - 1;
  const annualizedReturn = (1 + totalReturn) ** (TRADING_DAYS / n) - 1;

  const spyTotalReturn = sr.reduce((acc, r) => acc * (1 + r), 1) - 1;
  const spyAnnualizedReturn = (1 + spyTotalReturn) ** (TRADING_DAYS / n) - 1;

  // Volatility
  const vol = stddev(pr) * Math.sqrt(TRADING_DAYS);

  // Sharpe ratio
  const sharpe = (annualizedReturn - RISK_FREE_RATE) / vol;

  // Sortino (downside deviation only)
  const downsideReturns = pr.filter(r => r < dailyRf).map(r => r - dailyRf);
  const downsideDev = downsideReturns.length > 0
    ? Math.sqrt(downsideReturns.reduce((sum, r) => sum + r * r, 0) / downsideReturns.length) * Math.sqrt(TRADING_DAYS)
    : 0.001;
  const sortino = (annualizedReturn - RISK_FREE_RATE) / downsideDev;

  // Beta
  const cov = covariance(pr, sr);
  const spyVar = sr.reduce((sum, r) => sum + (r - mean(sr)) ** 2, 0) / (sr.length - 1);
  const beta = cov / spyVar;

  // Jensen's Alpha
  const alpha = annualizedReturn - (RISK_FREE_RATE + beta * (spyAnnualizedReturn - RISK_FREE_RATE));

  // Max Drawdown
  let peak = 1;
  let maxDD = 0;
  let cumulative = 1;
  for (const r of pr) {
    cumulative *= (1 + r);
    if (cumulative > peak) peak = cumulative;
    const dd = (peak - cumulative) / peak;
    if (dd > maxDD) maxDD = dd;
  }

  return {
    totalReturn: totalReturn * 100,
    annualizedReturn: annualizedReturn * 100,
    spyTotalReturn: spyTotalReturn * 100,
    volatility: vol * 100,
    sharpe,
    sortino,
    beta,
    alpha: alpha * 100,
    maxDrawdown: maxDD * 100,
    tradingDays: n,
  };
}

/**
 * Compute a drawdown time series from portfolio values.
 */
export function computeDrawdownSeries(portfolioValues) {
  if (!portfolioValues?.length) return [];

  let peak = portfolioValues[0];
  return portfolioValues.map((val, i) => {
    if (val > peak) peak = val;
    return {
      index: i,
      drawdown: -((peak - val) / peak) * 100,
    };
  });
}
