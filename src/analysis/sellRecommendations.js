/**
 * Compute prioritized sell recommendations using effective allocations.
 *
 * For each stock: if effectiveTarget < actualPct → sell recommendation.
 * Dollar amount = exact gap between actual position value and effective target value.
 * Triggers come from the allocationAdjustments map (explains why target was reduced).
 *
 * Urgency derived from adjustment reasons:
 *   - floor/trailing stop = critical
 *   - P/E ceiling/strong SELL signal = warning
 *   - moderate SELL/take-profit/hard cap = info
 */

export function computeSellRecommendations(stocks, quotes, allocations, investmentAmount, effectiveAllocations, allocationAdjustments) {
  if (!stocks?.length) return [];

  const hasEffective = effectiveAllocations && Object.keys(effectiveAllocations).length > 0;
  if (!hasEffective) return [];

  // Compute current portfolio values (matches rebalance.js formula)
  let totalCurrentValue = 0;
  const currentValues = {};
  const sharesBySymbol = {};
  for (const stock of stocks) {
    const alloc = (allocations[stock.symbol] || 0) / 100;
    const quote = quotes[stock.symbol];
    if (!quote?.price || alloc === 0) continue;
    const invested = investmentAmount * alloc;
    const shares = stock.entryPrice > 0 ? invested / stock.entryPrice : 0;
    const currentVal = shares * quote.price;
    currentValues[stock.symbol] = currentVal;
    sharesBySymbol[stock.symbol] = shares;
    totalCurrentValue += currentVal;
  }

  if (totalCurrentValue === 0) return [];

  const recommendations = [];

  for (const stock of stocks) {
    const symbol = stock.symbol;
    const quote = quotes[symbol];
    if (!quote?.price) continue;

    const price = quote.price;
    const basePct = allocations[symbol] || 0;
    const effectiveTarget = effectiveAllocations[symbol];
    if (effectiveTarget == null) continue;

    const actualPct = ((currentValues[symbol] || 0) / totalCurrentValue) * 100;

    // Only recommend selling if actual exceeds effective target
    if (actualPct <= effectiveTarget) continue;

    // Also only if effective target was actually reduced from base (otherwise it's just normal drift)
    const stockAdjustments = allocationAdjustments?.[symbol];
    if (!stockAdjustments || stockAdjustments.length === 0) continue;

    // Build triggers from adjustment reasons
    const triggers = stockAdjustments.map(adj => {
      const urgency = classifyUrgency(adj.reason);
      return {
        type: classifyType(adj.reason),
        urgency,
        reason: adj.reason,
      };
    });

    // Determine highest urgency
    const urgencyOrder = { critical: 0, warning: 1, info: 2 };
    const highestUrgency = triggers.reduce(
      (best, t) => (urgencyOrder[t.urgency] < urgencyOrder[best] ? t.urgency : best),
      'info'
    );

    // Compute sell amounts: gap between actual and effective target
    const positionValue = currentValues[symbol] || 0;
    const shares = sharesBySymbol[symbol] || 0;

    let sellPct;
    if (effectiveTarget <= 0) {
      sellPct = 100;
    } else {
      // What % of the position to sell to bring actual down to effective target
      const targetValue = (effectiveTarget / 100) * totalCurrentValue;
      const excessValue = positionValue - targetValue;
      sellPct = positionValue > 0 ? Math.min(100, Math.round((excessValue / positionValue) * 100)) : 0;
    }

    const dollarAmount = Math.round((sellPct / 100) * positionValue);
    const sellShares = Math.floor((sellPct / 100) * shares);

    // Build suggested action text
    let suggestedAction;
    if (sellPct >= 100) {
      suggestedAction = 'Sell entire position';
    } else if (sellPct >= 50) {
      suggestedAction = 'Sell half position';
    } else if (sellPct >= 25) {
      suggestedAction = `Trim ${sellPct}% of position`;
    } else {
      suggestedAction = 'Trim excess weight';
    }

    recommendations.push({
      symbol,
      urgency: highestUrgency,
      triggers,
      suggestedAction,
      sellPct,
      dollarAmount,
      shares: sellShares,
      price,
      tier: stock.tier,
      effectiveTarget: Math.round(effectiveTarget * 100) / 100,
      basePct,
    });
  }

  // Sort: critical first, then warning, then info; within same urgency by dollarAmount desc
  const urgencySort = { critical: 0, warning: 1, info: 2 };
  return recommendations.sort((a, b) => {
    const urgDiff = urgencySort[a.urgency] - urgencySort[b.urgency];
    if (urgDiff !== 0) return urgDiff;
    return b.dollarAmount - a.dollarAmount;
  });
}

function classifyUrgency(reason) {
  const r = reason.toLowerCase();
  if (r.includes('hard floor') || r.includes('trailing stop')) return 'critical';
  if (r.includes('ceiling') || r.includes('strong sell')) return 'warning';
  return 'info';
}

function classifyType(reason) {
  const r = reason.toLowerCase();
  if (r.includes('hard floor')) return 'floor';
  if (r.includes('trailing stop')) return 'trailing';
  if (r.includes('ceiling')) return 'valuation';
  if (r.includes('take-profit')) return 'takeProfit';
  if (r.includes('sell signal')) return 'signal';
  if (r.includes('hard cap')) return 'cap';
  return 'other';
}
