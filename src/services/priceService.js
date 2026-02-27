import { fetchQuote } from './finnhub.js';
import { fetchYahooCandles } from './yahoo.js';
import { fetchMetrics } from './fundamentals.js';
import { getCachedQuote, setCachedQuote, getCachedHistory, setCachedHistory, getCachedMetrics, setCachedMetrics, clearHistoryCache } from './cache.js';

const DELAY_MS = 300; // gap between API calls to avoid Yahoo rate limiting

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

export async function fetchAllQuotes(symbols, onProgress) {
  const results = {};
  const errors = {};

  for (let i = 0; i < symbols.length; i++) {
    const sym = symbols[i];

    // Check cache first
    const cached = getCachedQuote(sym);
    if (cached) {
      results[sym] = cached;
      onProgress?.(sym, cached, null);
      continue;
    }

    try {
      const quote = await fetchQuote(sym);
      results[sym] = quote;
      setCachedQuote(sym, quote);
      onProgress?.(sym, quote, null);
    } catch (err) {
      errors[sym] = err.message;
      onProgress?.(sym, null, err.message);
    }

    // Delay between API calls
    if (i < symbols.length - 1) await delay(DELAY_MS);
  }

  return { results, errors };
}

export async function fetchHistoryForSymbol(symbol) {
  // Check cache first
  const cached = getCachedHistory(symbol);
  if (cached && cached.length > 0) return cached;

  const candles = await fetchYahooCandles(symbol);
  if (candles.length > 0) {
    setCachedHistory(symbol, candles);
  }
  return candles;
}

/**
 * Fetch historical candles for all symbols.
 * Returns { results, successCount, failCount, errors, succeeded, failed }
 */
export async function fetchAllHistory(symbols, onProgress) {
  const results = {};
  const errors = {};
  const succeeded = [];
  const failed = [];

  for (let i = 0; i < symbols.length; i++) {
    const sym = symbols[i];
    try {
      const data = await fetchHistoryForSymbol(sym);
      results[sym] = data;
      if (data.length > 0) {
        succeeded.push(sym);
      } else {
        failed.push(sym);
        errors[sym] = 'No data returned';
      }
      onProgress?.(i + 1, symbols.length, sym, data.length > 0);
    } catch (err) {
      results[sym] = [];
      failed.push(sym);
      errors[sym] = err.message;
      onProgress?.(i + 1, symbols.length, sym, false);
    }
    if (i < symbols.length - 1) await delay(DELAY_MS);
  }

  return {
    results,
    errors,
    succeeded,
    failed,
    successCount: succeeded.length,
    failCount: failed.length,
  };
}

/**
 * Fetch fundamental metrics for all symbols.
 * Returns { results, errors } where results maps symbol → metrics object.
 */
export async function fetchAllMetrics(symbols, onProgress) {
  const results = {};
  const errors = {};

  for (let i = 0; i < symbols.length; i++) {
    const sym = symbols[i];

    const cached = getCachedMetrics(sym);
    if (cached) {
      results[sym] = cached;
      onProgress?.(sym, cached, null);
      continue;
    }

    try {
      const metrics = await fetchMetrics(sym);
      // Only cache if at least one field has data
      const hasData = Object.values(metrics).some(v => v != null);
      if (hasData) {
        results[sym] = metrics;
        setCachedMetrics(sym, metrics);
      }
      onProgress?.(sym, hasData ? metrics : null, hasData ? null : 'No data returned');
    } catch (err) {
      errors[sym] = err.message;
      onProgress?.(sym, null, err.message);
    }

    if (i < symbols.length - 1) await delay(DELAY_MS);
  }

  return { results, errors };
}

/**
 * Clear all cached history so a retry fetches fresh data.
 */
export function clearAllHistoryCache() {
  clearHistoryCache();
}
