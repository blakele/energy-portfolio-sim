/**
 * Composite signal scoring — combines technicals + fundamentals into BUY/HOLD/SELL.
 */

/**
 * Score RSI: oversold = bullish, overbought = bearish.
 * Returns -100 to +100.
 */
function scoreRSI(rsi) {
  if (rsi == null) return 0;
  if (rsi < 30) return 60 + (30 - rsi) * (40 / 30);   // 60–100
  if (rsi < 40) return (40 - rsi) * 6;                  // 0–60
  if (rsi <= 60) return 0;                               // neutral
  if (rsi <= 70) return -(rsi - 60) * 6;                // 0 to -60
  return -60 - (rsi - 70) * (40 / 30);                  // -60 to -100
}

/**
 * Score moving averages: above both = bullish, below both = bearish, golden/death cross bonus.
 */
function scoreMA(ma) {
  if (!ma) return 0;
  let score = 0;
  if (ma.aboveSma50) score += 25;
  else score -= 25;
  if (ma.aboveSma200) score += 25;
  else score -= 25;
  if (ma.cross === 'golden') score += 50;
  else if (ma.cross === 'death') score -= 50;
  return Math.max(-100, Math.min(100, score));
}

/**
 * Score drawdown: deeper drawdown = more bullish (contrarian).
 */
function scoreDrawdown(dd) {
  if (dd == null) return 0;
  const pct = Math.abs(dd); // dd is negative
  if (pct < 5) return 0;
  if (pct < 10) return 20;
  if (pct < 20) return 40;
  if (pct < 30) return 60;
  return 80;
}

/**
 * Score valuation: low P/E = bullish, high P/E = bearish.
 */
function scoreValuation(pe) {
  if (pe == null || pe < 0) return 0;
  if (pe < 10) return 80;
  if (pe < 15) return 50;
  if (pe < 20) return 20;
  if (pe <= 30) return 0;
  if (pe <= 40) return -30;
  return -60;
}

/**
 * Score volume: spike = momentum signal (direction depends on price action).
 */
function scoreVolume(volume, rsi) {
  if (!volume) return 0;
  if (!volume.latestSpike) return 0;
  // Volume spike + oversold = bullish, volume spike + overbought = bearish
  if (rsi != null && rsi < 40) return 50;
  if (rsi != null && rsi > 60) return -50;
  return 0; // neutral if RSI is mid-range
}

/**
 * Compute composite signal for a single stock.
 * Weights: RSI(25%) + MA(25%) + Drawdown(20%) + Valuation(15%) + Volume(15%)
 *
 * @param {object} technicals - from computeAllTechnicals
 * @param {object} fundamentals - { pe, dividendYield, ... }
 * @returns {{ score: number, signal: 'BUY'|'HOLD'|'SELL', components: object }}
 */
export function computeCompositeSignal(technicals, fundamentals) {
  if (!technicals) return { score: 0, signal: 'HOLD', components: {} };

  const rsiScore = scoreRSI(technicals.rsi?.current);
  const maScore = scoreMA(technicals.ma);
  const ddScore = scoreDrawdown(technicals.drawdown?.current);
  const valScore = scoreValuation(fundamentals?.pe);
  const volScore = scoreVolume(technicals.volume, technicals.rsi?.current);

  const score = Math.round(
    rsiScore * 0.25 +
    maScore * 0.25 +
    ddScore * 0.20 +
    valScore * 0.15 +
    volScore * 0.15
  );

  const clampedScore = Math.max(-100, Math.min(100, score));

  let signal = 'HOLD';
  if (clampedScore > 20) signal = 'BUY';
  else if (clampedScore < -20) signal = 'SELL';

  return {
    score: clampedScore,
    signal,
    components: {
      rsi: rsiScore,
      ma: maScore,
      drawdown: ddScore,
      valuation: valScore,
      volume: volScore,
    },
  };
}

/**
 * Compute signals for all stocks.
 * @param {object} allTechnicals - { symbol: technicals }
 * @param {object} fundamentals - { symbol: { pe, ... } }
 * @returns {object} - { symbol: { score, signal, components } }
 */
export function computeAllSignals(allTechnicals, fundamentals) {
  const signals = {};
  for (const [symbol, tech] of Object.entries(allTechnicals)) {
    signals[symbol] = computeCompositeSignal(tech, fundamentals?.[symbol]);
  }
  return signals;
}

/**
 * Allocation-weighted portfolio health score (0–100).
 * @param {object} signals - { symbol: { score } }
 * @param {object} allocations - { symbol: pct }
 * @returns {number}
 */
export function computePortfolioHealth(signals, allocations) {
  let weightedScore = 0;
  let totalWeight = 0;

  for (const [symbol, sig] of Object.entries(signals)) {
    const weight = allocations[symbol] || 0;
    if (weight > 0) {
      // Normalize score from [-100, 100] to [0, 100]
      const normalized = (sig.score + 100) / 2;
      weightedScore += normalized * weight;
      totalWeight += weight;
    }
  }

  return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 50;
}
