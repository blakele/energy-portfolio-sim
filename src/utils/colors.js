export const TIER_COLORS = { 1: '#f59e0b', 2: '#3b82f6', 3: '#8b5cf6' };

export const CHART_COLORS = [
  '#f59e0b', '#3b82f6', '#8b5cf6', '#22c55e', '#ef4444',
  '#06b6d4', '#ec4899', '#f97316', '#14b8a6', '#a855f7', '#eab308',
];

export function tierColor(tier) {
  return TIER_COLORS[tier] || '#94a3b8';
}

export function tierBg(tier) {
  return `${tierColor(tier)}18`;
}

const SIGNAL_COLORS = { BUY: '#22c55e', HOLD: '#f59e0b', SELL: '#ef4444' };

export function signalColor(signal) {
  return SIGNAL_COLORS[signal] || '#94a3b8';
}

export function signalBg(signal) {
  return `${signalColor(signal)}18`;
}

export function rsiColor(rsi) {
  if (rsi == null) return '#94a3b8';
  if (rsi < 30) return '#22c55e';
  if (rsi <= 70) return '#f59e0b';
  return '#ef4444';
}

export function healthColor(score) {
  if (score == null) return '#94a3b8';
  if (score >= 65) return '#22c55e';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
}
