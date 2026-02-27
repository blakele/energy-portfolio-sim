const QUOTE_TTL = 5 * 60 * 1000; // 5 minutes
const HISTORY_TTL = 24 * 60 * 60 * 1000; // 24 hours (historical data rarely changes)

function makeKey(prefix, symbol) {
  return `esim_${prefix}_${symbol}`;
}

export function getCachedQuote(symbol) {
  try {
    const raw = localStorage.getItem(makeKey('quote', symbol));
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > QUOTE_TTL) return null;
    return data;
  } catch {
    return null;
  }
}

export function setCachedQuote(symbol, data) {
  try {
    localStorage.setItem(makeKey('quote', symbol), JSON.stringify({ data, ts: Date.now() }));
  } catch { /* localStorage full — ignore */ }
}

export function getCachedHistory(symbol) {
  try {
    const raw = localStorage.getItem(makeKey('history', symbol));
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > HISTORY_TTL) return null;
    return data;
  } catch {
    return null;
  }
}

export function setCachedHistory(symbol, data) {
  try {
    localStorage.setItem(makeKey('history', symbol), JSON.stringify({ data, ts: Date.now() }));
  } catch { /* localStorage full — ignore */ }
}

const METRICS_TTL = 24 * 60 * 60 * 1000; // 24 hours

export function getCachedMetrics(symbol) {
  try {
    const raw = localStorage.getItem(makeKey('metrics', symbol));
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > METRICS_TTL) return null;
    return data;
  } catch {
    return null;
  }
}

export function setCachedMetrics(symbol, data) {
  try {
    localStorage.setItem(makeKey('metrics', symbol), JSON.stringify({ data, ts: Date.now() }));
  } catch { /* localStorage full — ignore */ }
}

export function clearMetricsCache() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('esim_metrics_')) keys.push(key);
  }
  keys.forEach(k => localStorage.removeItem(k));
}

export function clearHistoryCache() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('esim_history_')) keys.push(key);
  }
  keys.forEach(k => localStorage.removeItem(k));
}

export function clearCache() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('esim_')) keys.push(key);
  }
  keys.forEach(k => localStorage.removeItem(k));
}
