/**
 * Daily portfolio snapshot system.
 * Records portfolio value, SPY value, and per-stock data once per day.
 * Stored in localStorage — ~500 bytes per day, supports years of tracking.
 */

const STORAGE_KEY = 'esim_snapshots';

export function loadSnapshots() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSnapshots(snapshots) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots));
  } catch { /* localStorage full */ }
}

export function getToday() {
  return new Date().toISOString().split('T')[0];
}

export function hasSnapshotForToday() {
  const snapshots = loadSnapshots();
  const today = getToday();
  return snapshots.some(s => s.date === today);
}

/**
 * Take a snapshot of the current portfolio state.
 * @param {Object} params
 * @param {Object} params.quotes - { symbol: { price, change, changePercent } }
 * @param {Object} params.allocations - { symbol: number (%) }
 * @param {number} params.investmentAmount
 * @param {Array} params.stocks - stock config array
 * @param {Object} params.benchmark - { symbol, entryPrice }
 */
export function takeSnapshot({ quotes, allocations, investmentAmount, stocks, benchmark }) {
  const today = getToday();
  const snapshots = loadSnapshots();

  // Don't duplicate — one snapshot per day
  if (snapshots.some(s => s.date === today)) return null;

  // Need at least some quotes to make a useful snapshot
  const quoteCount = Object.keys(quotes).length;
  if (quoteCount < 3) return null;

  let portfolioValue = 0;
  let totalAllocUsed = 0;
  const stockData = {};

  for (const stock of stocks) {
    const alloc = (allocations[stock.symbol] || 0) / 100;
    const quote = quotes[stock.symbol];
    if (!quote || alloc === 0) continue;

    const invested = investmentAmount * alloc;
    const shares = invested / stock.entryPrice;
    const value = shares * quote.price;

    stockData[stock.symbol] = {
      price: quote.price,
      allocation: allocations[stock.symbol],
      value: Math.round(value * 100) / 100,
      returnPct: Math.round(((quote.price - stock.entryPrice) / stock.entryPrice) * 10000) / 100,
    };

    portfolioValue += value;
    totalAllocUsed += alloc;
  }

  // Scale up if some stocks missing
  if (totalAllocUsed > 0 && totalAllocUsed < 0.99) {
    portfolioValue = portfolioValue / totalAllocUsed;
  }

  // SPY value
  const spyQuote = quotes[benchmark.symbol];
  const spyValue = spyQuote
    ? investmentAmount * (spyQuote.price / benchmark.entryPrice)
    : null;

  const snapshot = {
    date: today,
    timestamp: Date.now(),
    portfolioValue: Math.round(portfolioValue * 100) / 100,
    spyValue: spyValue ? Math.round(spyValue * 100) / 100 : null,
    investmentAmount,
    stocks: stockData,
  };

  snapshots.push(snapshot);

  // Keep max 3 years of daily data (~1100 entries)
  const trimmed = snapshots.slice(-1100);
  saveSnapshots(trimmed);

  return snapshot;
}

export function getSnapshotCount() {
  return loadSnapshots().length;
}

export function getFirstSnapshotDate() {
  const snapshots = loadSnapshots();
  return snapshots.length > 0 ? snapshots[0].date : null;
}

export function clearSnapshots() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Export snapshots as downloadable JSON.
 */
export function exportSnapshots() {
  const snapshots = loadSnapshots();
  const blob = new Blob([JSON.stringify(snapshots, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `portfolio-snapshots-${getToday()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
