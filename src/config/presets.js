/**
 * Dynamic preset computation based on current portfolio stocks.
 * Replaces hardcoded presets to work with any set of stocks.
 */

/**
 * Compute allocation presets dynamically from the current stock list.
 * @param {Array} stocks - Array of { symbol, tier, ... }
 * @returns {Object} { presetName: { [symbol]: percentage } }
 */
export function computeDynamicPresets(stocks) {
  if (!stocks || stocks.length === 0) return {};

  const presets = {};

  // Equal Weight — 100/N per stock
  const equalPct = Math.round((100 / stocks.length) * 10) / 10;
  const equalWeight = {};
  stocks.forEach((s, i) => {
    equalWeight[s.symbol] = i === 0
      ? Math.round((100 - equalPct * (stocks.length - 1)) * 10) / 10
      : equalPct;
  });
  presets['Equal Weight'] = equalWeight;

  // Tier Weighted — T1 gets 3x, T2 gets 2x, T3 gets 1x (normalized to 100%)
  const tierMultiplier = { 1: 3, 2: 2, 3: 1 };
  const totalWeight = stocks.reduce((sum, s) => sum + (tierMultiplier[s.tier] || 1), 0);
  const tierWeighted = {};
  stocks.forEach(s => {
    tierWeighted[s.symbol] = Math.round(((tierMultiplier[s.tier] || 1) / totalWeight) * 100 * 10) / 10;
  });
  // Fix rounding
  const tierTotal = Object.values(tierWeighted).reduce((a, b) => a + b, 0);
  const tierDiff = Math.round((100 - tierTotal) * 10) / 10;
  if (tierDiff !== 0 && stocks.length > 0) {
    const maxSym = Object.entries(tierWeighted).sort((a, b) => b[1] - a[1])[0][0];
    tierWeighted[maxSym] = Math.round((tierWeighted[maxSym] + tierDiff) * 10) / 10;
  }
  presets['Tier Weighted'] = tierWeighted;

  // Conviction Focus — only T1+T2 stocks, equal among them, T3 zeroed
  const convictionStocks = stocks.filter(s => s.tier <= 2);
  const convictionFocus = {};
  if (convictionStocks.length > 0) {
    const convPct = Math.round((100 / convictionStocks.length) * 10) / 10;
    stocks.forEach(s => {
      convictionFocus[s.symbol] = s.tier <= 2 ? convPct : 0;
    });
    // Fix rounding for conviction stocks
    const convTotal = Object.values(convictionFocus).reduce((a, b) => a + b, 0);
    const convDiff = Math.round((100 - convTotal) * 10) / 10;
    if (convDiff !== 0) {
      const firstConv = convictionStocks[0].symbol;
      convictionFocus[firstConv] = Math.round((convictionFocus[firstConv] + convDiff) * 10) / 10;
    }
  } else {
    // If no T1/T2 stocks, same as equal weight
    stocks.forEach(s => {
      convictionFocus[s.symbol] = equalWeight[s.symbol];
    });
  }
  presets['Conviction Focus'] = convictionFocus;

  return presets;
}

export const DEFAULT_PRESET = 'Equal Weight';
