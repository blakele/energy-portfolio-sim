/**
 * Technical indicator computations — pure functions, no React.
 */

/**
 * Compute RSI using Wilder smoothing.
 * @param {Array} candles - [{ close }]
 * @param {number} period - lookback (default 14)
 * @returns {{ series: number[], current: number }}
 */
export function computeRSI(candles, period = 14) {
  if (!candles || candles.length < period + 1) return { series: [], current: null };

  const closes = candles.map(c => c.close);
  const deltas = [];
  for (let i = 1; i < closes.length; i++) {
    deltas.push(closes[i] - closes[i - 1]);
  }

  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 0; i < period; i++) {
    if (deltas[i] > 0) avgGain += deltas[i];
    else avgLoss += Math.abs(deltas[i]);
  }
  avgGain /= period;
  avgLoss /= period;

  const series = [];
  // First RSI value
  const rs0 = avgLoss === 0 ? 100 : avgGain / avgLoss;
  series.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + rs0));

  // Wilder smoothing for remaining
  for (let i = period; i < deltas.length; i++) {
    const gain = deltas[i] > 0 ? deltas[i] : 0;
    const loss = deltas[i] < 0 ? Math.abs(deltas[i]) : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    series.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + rs));
  }

  return { series, current: series[series.length - 1] };
}

/**
 * Simple Moving Average.
 * @param {Array} candles - [{ close }]
 * @param {number} period
 * @returns {number[]}
 */
export function computeSMA(candles, period) {
  if (!candles || candles.length < period) return [];
  const closes = candles.map(c => c.close);
  const sma = [];
  let sum = 0;
  for (let i = 0; i < closes.length; i++) {
    sum += closes[i];
    if (i >= period) sum -= closes[i - period];
    if (i >= period - 1) sma.push(sum / period);
  }
  return sma;
}

/**
 * 50/200-day SMA with golden/death cross detection.
 * @param {Array} candles
 * @returns {{ sma50: number[], sma200: number[], currentSma50: number|null, currentSma200: number|null, cross: 'golden'|'death'|null, aboveSma50: boolean, aboveSma200: boolean }}
 */
export function computeMovingAverages(candles) {
  const sma50 = computeSMA(candles, 50);
  const sma200 = computeSMA(candles, 200);

  const currentSma50 = sma50.length > 0 ? sma50[sma50.length - 1] : null;
  const currentSma200 = sma200.length > 0 ? sma200[sma200.length - 1] : null;
  const currentPrice = candles?.length > 0 ? candles[candles.length - 1].close : null;

  let cross = null;
  if (sma50.length >= 2 && sma200.length >= 2) {
    // Align: sma200 starts later so we compare last 2 values of each
    const prev50 = sma50[sma50.length - 2];
    const curr50 = sma50[sma50.length - 1];
    // sma200 is shorter; the last sma200 value corresponds to the last sma50 value
    const prev200 = sma200[sma200.length - 2];
    const curr200 = sma200[sma200.length - 1];

    if (prev50 <= prev200 && curr50 > curr200) cross = 'golden';
    else if (prev50 >= prev200 && curr50 < curr200) cross = 'death';
  }

  return {
    sma50,
    sma200,
    currentSma50,
    currentSma200,
    cross,
    aboveSma50: currentPrice != null && currentSma50 != null && currentPrice > currentSma50,
    aboveSma200: currentPrice != null && currentSma200 != null && currentPrice > currentSma200,
  };
}

/**
 * Per-stock drawdown from rolling peak.
 * @param {Array} candles - [{ close }]
 * @returns {{ series: number[], current: number, max: number }}
 */
export function computeStockDrawdown(candles) {
  if (!candles || candles.length === 0) return { series: [], current: 0, max: 0 };

  let peak = candles[0].close;
  let maxDD = 0;
  const series = candles.map(c => {
    if (c.close > peak) peak = c.close;
    const dd = (peak - c.close) / peak;
    if (dd > maxDD) maxDD = dd;
    return -dd * 100;
  });

  return {
    series,
    current: series[series.length - 1],
    max: -maxDD * 100,
  };
}

/**
 * Detect volume spikes (days with volume > threshold * lookback avg).
 * @param {Array} candles - [{ volume }]
 * @param {number} lookback
 * @param {number} threshold
 * @returns {{ spikes: boolean[], latestSpike: boolean, avgVolume: number }}
 */
export function detectVolumeSpikes(candles, lookback = 20, threshold = 2.0) {
  if (!candles || candles.length < lookback + 1) {
    return { spikes: [], latestSpike: false, avgVolume: 0 };
  }

  const spikes = new Array(candles.length).fill(false);
  let rollingSum = 0;

  for (let i = 0; i < lookback; i++) {
    rollingSum += candles[i].volume || 0;
  }

  for (let i = lookback; i < candles.length; i++) {
    const avg = rollingSum / lookback;
    const vol = candles[i].volume || 0;
    if (avg > 0 && vol > avg * threshold) {
      spikes[i] = true;
    }
    rollingSum += vol - (candles[i - lookback].volume || 0);
  }

  const lastAvg = rollingSum / lookback;

  return {
    spikes,
    latestSpike: spikes[spikes.length - 1],
    avgVolume: lastAvg,
  };
}

/**
 * Run all technical indicators for a single stock's candles.
 */
export function computeAllTechnicals(candles) {
  if (!candles || candles.length < 15) return null;

  const rsi = computeRSI(candles);
  const ma = computeMovingAverages(candles);
  const drawdown = computeStockDrawdown(candles);
  const volume = detectVolumeSpikes(candles);

  return { rsi, ma, drawdown, volume, candles };
}
