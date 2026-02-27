/**
 * Rebalance drift, stop-loss/take-profit, and correlation concentration.
 */

import { STOCKS } from '../config/portfolio.js';

/**
 * Compute actual vs target allocation drift.
 * @param {object} allocations - { symbol: targetPct }
 * @param {object} quotes - { symbol: { price } }
 * @param {Array} stocks - STOCKS array
 * @param {number} investmentAmount
 * @returns {Array<{ symbol, targetPct, actualPct, drift, action, shares }>}
 */
export function computeRebalanceDrifts(allocations, quotes, stocks, investmentAmount) {
  const drifts = [];
  let totalCurrentValue = 0;

  // First pass: compute current values
  const values = {};
  for (const stock of stocks) {
    const alloc = (allocations[stock.symbol] || 0) / 100;
    const quote = quotes[stock.symbol];
    if (!quote || alloc === 0) continue;
    const invested = investmentAmount * alloc;
    const shares = invested / stock.entryPrice;
    const currentVal = shares * quote.price;
    values[stock.symbol] = { currentVal, shares, price: quote.price };
    totalCurrentValue += currentVal;
  }

  if (totalCurrentValue === 0) return [];

  // Second pass: compute drift
  for (const stock of stocks) {
    const targetPct = allocations[stock.symbol] || 0;
    const val = values[stock.symbol];
    if (!val) {
      if (targetPct > 0) {
        drifts.push({
          symbol: stock.symbol,
          targetPct,
          actualPct: 0,
          drift: -targetPct,
          action: 'BUY',
          shares: 0,
          dollarAmount: 0,
        });
      }
      continue;
    }

    const actualPct = (val.currentVal / totalCurrentValue) * 100;
    const drift = actualPct - targetPct;

    let action = 'HOLD';
    if (drift > 5) action = 'TRIM';
    else if (drift < -5) action = 'ADD';

    const dollarDiff = (drift / 100) * totalCurrentValue;
    const shareDiff = val.price > 0 ? Math.abs(dollarDiff) / val.price : 0;

    drifts.push({
      symbol: stock.symbol,
      targetPct,
      actualPct: Math.round(actualPct * 100) / 100,
      drift: Math.round(drift * 100) / 100,
      action,
      shares: Math.round(shareDiff * 10) / 10,
      dollarAmount: Math.round(Math.abs(dollarDiff)),
    });
  }

  return drifts.sort((a, b) => Math.abs(b.drift) - Math.abs(a.drift));
}

/**
 * Check stop-loss and take-profit thresholds.
 * @param {object} quotes - { symbol: { price } }
 * @param {Array} stocks - STOCKS array
 * @param {object} stopLossConfig - { symbol: { stopLossPct, takeProfitPct } }
 * @returns {Array<{ symbol, type: 'stop-loss'|'take-profit', threshold, currentReturn }>}
 */
export function checkStopLossTakeProfit(quotes, stocks, stopLossConfig) {
  if (!stopLossConfig) return [];
  const alerts = [];

  for (const stock of stocks) {
    const config = stopLossConfig[stock.symbol];
    if (!config) continue;
    const quote = quotes[stock.symbol];
    if (!quote) continue;

    const currentReturn = ((quote.price - stock.entryPrice) / stock.entryPrice) * 100;

    if (config.stopLossPct != null && currentReturn <= -Math.abs(config.stopLossPct)) {
      alerts.push({
        symbol: stock.symbol,
        type: 'stop-loss',
        threshold: -Math.abs(config.stopLossPct),
        currentReturn: Math.round(currentReturn * 100) / 100,
      });
    }

    if (config.takeProfitPct != null && currentReturn >= config.takeProfitPct) {
      alerts.push({
        symbol: stock.symbol,
        type: 'take-profit',
        threshold: config.takeProfitPct,
        currentReturn: Math.round(currentReturn * 100) / 100,
      });
    }
  }

  return alerts;
}

/**
 * Find groups of highly correlated stocks and warn if combined allocation is too high.
 * Uses union-find to group stocks with correlation > threshold.
 *
 * @param {{ symbols: string[], matrix: number[][] }} correlationData
 * @param {object} allocations - { symbol: pct }
 * @param {number} threshold - correlation threshold (default 0.7)
 * @returns {Array<{ stocks: string[], avgCorrelation: number, combinedAllocation: number, warning: boolean }>}
 */
export function computeCorrelationConcentration(correlationData, allocations, threshold = 0.7) {
  if (!correlationData?.symbols?.length || !correlationData?.matrix?.length) return [];

  const { symbols, matrix } = correlationData;
  const n = symbols.length;

  // Union-Find
  const parent = symbols.map((_, i) => i);
  const rank = new Array(n).fill(0);

  function find(x) {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }

  function union(x, y) {
    const px = find(x), py = find(y);
    if (px === py) return;
    if (rank[px] < rank[py]) parent[px] = py;
    else if (rank[px] > rank[py]) parent[py] = px;
    else { parent[py] = px; rank[px]++; }
  }

  // Group stocks with correlation above threshold
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (matrix[i][j] >= threshold) {
        union(i, j);
      }
    }
  }

  // Collect groups
  const groups = {};
  for (let i = 0; i < n; i++) {
    const root = find(i);
    if (!groups[root]) groups[root] = [];
    groups[root].push(i);
  }

  // Build results (only groups with > 1 stock)
  const results = [];
  for (const indices of Object.values(groups)) {
    if (indices.length < 2) continue;

    const groupSymbols = indices.map(i => symbols[i]);

    // Average pairwise correlation within group
    let corrSum = 0;
    let corrCount = 0;
    for (let i = 0; i < indices.length; i++) {
      for (let j = i + 1; j < indices.length; j++) {
        corrSum += matrix[indices[i]][indices[j]];
        corrCount++;
      }
    }
    const avgCorrelation = corrCount > 0 ? Math.round((corrSum / corrCount) * 100) / 100 : 0;

    const combinedAllocation = groupSymbols.reduce(
      (sum, sym) => sum + (allocations[sym] || 0), 0
    );

    results.push({
      stocks: groupSymbols,
      avgCorrelation,
      combinedAllocation: Math.round(combinedAllocation * 10) / 10,
      warning: combinedAllocation > 30,
    });
  }

  return results.sort((a, b) => b.combinedAllocation - a.combinedAllocation);
}
