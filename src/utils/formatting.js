export function formatMoney(n) {
  return '$' + Math.round(n).toLocaleString('en-US');
}

export function formatPrice(n) {
  if (n == null) return '--';
  return '$' + n.toFixed(2);
}

export function formatPct(n) {
  if (n == null) return '--';
  return (n >= 0 ? '+' : '') + n.toFixed(2) + '%';
}

export function formatCompact(n) {
  if (Math.abs(n) >= 1e9) return '$' + (n / 1e9).toFixed(1) + 'B';
  if (Math.abs(n) >= 1e6) return '$' + (n / 1e6).toFixed(1) + 'M';
  if (Math.abs(n) >= 1e3) return '$' + (n / 1e3).toFixed(1) + 'K';
  return '$' + n.toFixed(0);
}

export function pctColor(n) {
  if (n == null) return '#94a3b8';
  return n >= 0 ? '#22c55e' : '#ef4444';
}

export function formatCommaInput(str) {
  const num = parseFloat(str.replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return str;
  return num.toLocaleString('en-US');
}
