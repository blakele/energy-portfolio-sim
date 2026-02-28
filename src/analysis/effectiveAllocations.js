/**
 * Compute market-adjusted "effective" target allocations.
 *
 * Takes user base allocations and current market data, returns adjusted
 * targets where market conditions can only REDUCE a target (never increase
 * beyond the base). Freed-up allocation becomes suggested cash reserve.
 *
 * When multiple conditions apply, the LOWEST resulting target wins
 * (most conservative). Reductions are NOT compounded — each condition
 * independently computes a target from the base, and we take the min.
 */

import { EXIT_RULES, TARGET_ALLOCATIONS } from '../config/playbook.js';

export function computeEffectiveAllocations(stocks, quotes, fundamentals, technicals, signals) {
  const result = {};
  const adjustments = {};
  let totalEffective = 0;

  for (const stock of stocks) {
    const symbol = stock.symbol;
    const basePct = TARGET_ALLOCATIONS[symbol] || 0;
    if (basePct <= 0) continue;

    const quote = quotes[symbol];
    const price = quote?.price;
    const rules = EXIT_RULES[symbol];
    const candidates = []; // each entry is { target, reason }

    // --- Rules-based reductions (only when EXIT_RULES exist) ---
    if (rules && price != null) {
      // Hard floor breach → target = 0%
      if (rules.hardFloor && price <= rules.hardFloor) {
        candidates.push({
          target: 0,
          reason: `Below hard floor $${rules.hardFloor}`,
        });
      }

      // Trailing stop hit → target = 50% of base
      if (rules.trailingStopPct && technicals) {
        const tech = technicals[symbol];
        const high52w = tech?.high52w;
        if (high52w && high52w > 0) {
          const drawdownPct = ((high52w - price) / high52w) * 100;
          if (drawdownPct >= rules.trailingStopPct) {
            candidates.push({
              target: basePct * 0.5,
              reason: `Trailing stop hit (${drawdownPct.toFixed(1)}% from 52w high)`,
            });
          }
        }
      }

      // P/E ceiling breach → target = 50% of base
      if (rules.valuationCeiling) {
        const pe = fundamentals?.[symbol]?.pe;
        if (pe != null && pe > rules.valuationCeiling) {
          candidates.push({
            target: basePct * 0.5,
            reason: `P/E ${pe.toFixed(1)} exceeds ${rules.valuationCeiling}x ceiling`,
          });
        }
      }

      // Take-profit hit → reduce by trimPct%
      if (rules.takeProfit) {
        for (const tp of rules.takeProfit) {
          if (price >= tp.price) {
            candidates.push({
              target: basePct * (1 - tp.trimPct / 100),
              reason: `Above take-profit $${tp.price} (trim ${tp.trimPct}%)`,
            });
          }
        }
      }

      // Max position cap (e.g., OKLO = 3%)
      if (rules.maxPositionPct != null && basePct > rules.maxPositionPct) {
        candidates.push({
          target: rules.maxPositionPct,
          reason: `Hard cap at ${rules.maxPositionPct}%`,
        });
      }
    }

    // --- Signal-based reductions (apply to all stocks) ---
    if (signals) {
      const sig = signals[symbol];
      if (sig) {
        if (sig.score < -50) {
          candidates.push({
            target: basePct * 0.5,
            reason: `Strong SELL signal (score ${sig.score})`,
          });
        } else if (sig.score < -20) {
          candidates.push({
            target: basePct * 0.75,
            reason: `Moderate SELL signal (score ${sig.score})`,
          });
        }
      }
    }

    // --- Resolve: take the lowest (most conservative) target ---
    let effectivePct = basePct;
    const stockAdjustments = [];

    if (candidates.length > 0) {
      // Find the minimum target across all conditions
      let minTarget = basePct;
      for (const c of candidates) {
        if (c.target < minTarget) {
          minTarget = c.target;
        }
      }
      effectivePct = Math.round(minTarget * 100) / 100; // round to 2 decimals

      // Record all active adjustments for transparency
      for (const c of candidates) {
        stockAdjustments.push({
          reason: c.reason,
          basePct,
          effectivePct: Math.round(c.target * 100) / 100,
        });
      }
    }

    result[symbol] = effectivePct;
    if (stockAdjustments.length > 0) {
      adjustments[symbol] = stockAdjustments;
    }
    totalEffective += effectivePct;
  }

  // Suggested cash = sum of research targets - sum of effective allocations
  const totalBase = Object.values(TARGET_ALLOCATIONS).reduce((sum, v) => sum + (v || 0), 0);
  const suggestedCashPct = Math.round((totalBase - totalEffective) * 100) / 100;

  return {
    allocations: result,
    adjustments,
    suggestedCashPct: Math.max(0, suggestedCashPct),
  };
}
