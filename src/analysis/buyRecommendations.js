/**
 * Compute prioritized buy recommendations given available cash.
 *
 * Uses effective allocations (market-adjusted targets) for drift logic.
 * If actual% >= effectiveTarget% → exclude (at or above target).
 * If actual% < effectiveTarget% → underweight, score by gap.
 *
 * Scores each eligible stock on up to 3 equally-weighted factors:
 *   - Allocation drift (33%): underweight vs effective target scores higher
 *   - Tier priority (33%): Tier 1 = 100, Tier 2 = 66, Tier 3 = 33
 *   - Valuation (33%): lower P/E scores higher
 *
 * When signals are computed, only stocks with a BUY signal (score > 20) are included.
 * The signal score is used as a bonus multiplier, not an equal-weight factor —
 * stronger BUY signals get proportionally more cash.
 */

export function computeBuyRecommendations(cashAmount, stocks, quotes, actualAllocations, effectiveAllocations, investmentAmount, signals, fundamentals) {
  if (!cashAmount || cashAmount <= 0 || !stocks?.length) return [];

  const hasSignals = signals && Object.keys(signals).length > 0;

  // Filter to stocks with effective allocation > 0 and valid quotes.
  // When signals are computed, ONLY include BUY signals (score > 20).
  const candidates = stocks.filter(stock => {
    const effectiveTarget = effectiveAllocations[stock.symbol];
    const quote = quotes[stock.symbol];
    if (!effectiveTarget || effectiveTarget <= 0 || !quote?.price) return false;
    if (hasSignals) {
      const sig = signals[stock.symbol];
      if (!sig || sig.score <= 20) return false; // Only BUY signals pass
    }
    return true;
  });

  if (candidates.length === 0) return [];

  // Compute current portfolio values using actual allocations (what was actually invested)
  let totalCurrentValue = 0;
  const currentValues = {};
  for (const stock of stocks) {
    const baseAlloc = (actualAllocations[stock.symbol] || 0) / 100;
    const quote = quotes[stock.symbol];
    if (!quote?.price || baseAlloc === 0) continue;
    const invested = investmentAmount * baseAlloc;
    const shares = stock.entryPrice > 0 ? invested / stock.entryPrice : 0;
    const currentVal = shares * quote.price;
    currentValues[stock.symbol] = currentVal;
    totalCurrentValue += currentVal;
  }

  // Score each candidate
  const scored = candidates.map(stock => {
    const price = quotes[stock.symbol].price;
    const reasons = [];

    // --- Signal bonus (multiplier for stronger BUY signals) ---
    let signalBonus = 1.0;
    if (hasSignals) {
      const sig = signals[stock.symbol];
      if (sig) {
        signalBonus = 1.0 + ((sig.score - 20) / 80) * 0.5;
        reasons.push(`BUY signal (score ${sig.score})`);
      }
    }

    // --- Allocation drift score (0-100) vs effective target ---
    let driftScore = 50;
    if (totalCurrentValue > 0) {
      const effectiveTarget = effectiveAllocations[stock.symbol] || 0;
      const actualPct = ((currentValues[stock.symbol] || 0) / totalCurrentValue) * 100;

      // At or above effective target → don't recommend buying more
      if (actualPct >= effectiveTarget) {
        return null;
      }

      const underweight = effectiveTarget - actualPct;
      driftScore = Math.min(100, underweight * 10);
      reasons.push(`Underweight by ${underweight.toFixed(1)}%`);
    } else {
      return null;
    }

    // --- Tier priority score ---
    let tierScore = 33;
    if (stock.tier === 1) { tierScore = 100; reasons.push('Tier 1 conviction'); }
    else if (stock.tier === 2) { tierScore = 66; reasons.push('Tier 2 conviction'); }
    else if (stock.tier === 3) { tierScore = 33; reasons.push('Tier 3 speculative'); }

    // --- Valuation score (P/E based) ---
    let valScore = 50;
    const pe = fundamentals?.[stock.symbol]?.pe;
    if (pe != null && pe > 0) {
      if (pe < 15) { valScore = 100; reasons.push(`Low P/E (${pe.toFixed(1)})`); }
      else if (pe <= 25) { valScore = 60; reasons.push(`Fair P/E (${pe.toFixed(1)})`); }
      else if (pe <= 40) { valScore = 30; reasons.push(`High P/E (${pe.toFixed(1)})`); }
      else { valScore = 0; reasons.push(`Very high P/E (${pe.toFixed(1)})`); }
    }

    // --- Composite priority ---
    const basePriority = driftScore * 0.33 + tierScore * 0.33 + valScore * 0.33;
    const priority = basePriority * signalBonus;

    return { symbol: stock.symbol, priority, price, reasons, tier: stock.tier };
  }).filter(Boolean);

  // Normalize priorities to allocate cash proportionally
  const totalPriority = scored.reduce((sum, s) => sum + s.priority, 0);
  if (totalPriority === 0) return [];

  return scored
    .sort((a, b) => b.priority - a.priority)
    .map(s => {
      const dollarAmount = (s.priority / totalPriority) * cashAmount;
      const shares = Math.floor(dollarAmount / s.price);
      return {
        symbol: s.symbol,
        priority: Math.round(s.priority),
        dollarAmount: Math.round(dollarAmount * 100) / 100,
        shares,
        price: s.price,
        reasons: s.reasons,
        tier: s.tier,
      };
    })
    .filter(s => s.dollarAmount >= 1);
}
