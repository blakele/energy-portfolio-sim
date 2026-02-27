/**
 * Yahoo Finance chart API client.
 * Uses Vite dev proxy at /api/yahoo to bypass CORS.
 * No API key required.
 */

/**
 * Fetch 1 year of daily OHLCV candles for a symbol.
 * Returns array of { date, open, high, low, close, volume } matching
 * the same format as our Finnhub candle client.
 */
export async function fetchYahooCandles(symbol) {
  const url = `/api/yahoo/v8/finance/chart/${encodeURIComponent(symbol)}?range=1y&interval=1d&includePrePost=false`;

  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`[Yahoo] ${symbol}: HTTP ${res.status}`);
    throw new Error(`Yahoo fetch failed: ${res.status}`);
  }

  const json = await res.json();

  // Check for API-level errors
  if (json.chart?.error) {
    const errMsg = json.chart.error.description || json.chart.error.code || 'Unknown error';
    console.warn(`[Yahoo] ${symbol}: API error — ${errMsg}`);
    throw new Error(`Yahoo API error for ${symbol}: ${errMsg}`);
  }

  const result = json.chart?.result?.[0];
  if (!result) {
    console.warn(`[Yahoo] ${symbol}: No result in response`);
    return [];
  }

  const timestamps = result.timestamp;
  const quote = result.indicators?.quote?.[0];

  if (!timestamps || !quote || !quote.close) {
    console.warn(`[Yahoo] ${symbol}: Missing timestamp or quote data`);
    return [];
  }

  // Build array of candle objects, filtering out null/undefined values
  const candles = [];
  for (let i = 0; i < timestamps.length; i++) {
    const close = quote.close[i];
    // Skip days with null close price (market holidays, etc.)
    if (close == null) continue;

    candles.push({
      date: timestamps[i],
      open: quote.open[i] ?? close,
      high: quote.high[i] ?? close,
      low: quote.low[i] ?? close,
      close,
      volume: quote.volume[i] ?? 0,
    });
  }

  console.log(`[Yahoo] ${symbol}: ${candles.length} days loaded`);
  return candles;
}
