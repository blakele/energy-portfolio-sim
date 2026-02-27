/**
 * Fundamental metrics client via Vite server middleware.
 * The server runs yahoo-finance2 (handles crumb/cookie auth internally).
 * Browser just calls /api/yahoo-fundamentals?symbol=X and gets clean JSON.
 *
 * History:
 *  - v1: Finnhub /stock/metric → 401 on free tier
 *  - v2: Yahoo quoteSummary direct → 401 (needs crumb auth)
 *  - v3: yahoo-finance2 via server middleware → handles auth automatically
 */

/**
 * Fetch fundamental metrics for a stock.
 * Returns normalized object with common valuation fields.
 */
export async function fetchMetrics(symbol) {
  const url = `/api/yahoo-fundamentals?symbol=${encodeURIComponent(symbol)}`;
  console.log(`[Fundamentals] Fetching metrics for ${symbol}...`);

  const res = await fetch(url);

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = body.error || `Metrics fetch failed: ${res.status}`;
    console.warn(`[Fundamentals] ${symbol}: ${msg}`);
    throw new Error(msg);
  }

  const data = await res.json();

  // yahoo-finance2 returns already-parsed data (plain numbers, not {raw, fmt} wrappers)
  const sd = data.summaryDetail || {};
  const ks = data.defaultKeyStatistics || {};
  const fd = data.financialData || {};

  // Compute free cash flow per share if we have both values
  const fcf = fd.freeCashflow ?? null;
  const shares = ks.sharesOutstanding ?? null;
  const fcfPerShare = (fcf != null && shares != null && shares > 0) ? fcf / shares : null;

  const metrics = {
    pe: sd.trailingPE ?? null,
    eps: ks.trailingEps ?? null,
    // yahoo-finance2 returns dividend yield as decimal (0.0123 = 1.23%), convert to %
    dividendYield: sd.dividendYield != null ? sd.dividendYield * 100 : null,
    dividendPerShare: sd.dividendRate ?? null,
    // Market cap in actual dollars, convert to millions (StockCard displays as formatCompact(val * 1e6))
    marketCap: sd.marketCap != null ? sd.marketCap / 1e6 : null,
    freeCashFlowPerShare: fcfPerShare != null ? Math.round(fcfPerShare * 100) / 100 : null,
    high52w: sd.fiftyTwoWeekHigh ?? null,
    low52w: sd.fiftyTwoWeekLow ?? null,
    beta: sd.beta ?? null,
  };

  const hasData = Object.values(metrics).some(v => v != null);
  console.log(
    `[Fundamentals] ${symbol}: ${hasData ? 'OK' : 'empty'}` +
    ` — PE=${metrics.pe}, DivY=${metrics.dividendYield != null ? metrics.dividendYield.toFixed(2) + '%' : 'null'}` +
    `, MCap=${metrics.marketCap != null ? (metrics.marketCap / 1000).toFixed(1) + 'B' : 'null'}`
  );
  return metrics;
}
