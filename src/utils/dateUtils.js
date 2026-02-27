export function toUnix(date) {
  return Math.floor(new Date(date).getTime() / 1000);
}

export function fromUnix(ts) {
  return new Date(ts * 1000);
}

export function isMarketOpen() {
  const now = new Date();
  const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const day = et.getDay();
  const hour = et.getHours();
  const min = et.getMinutes();
  const timeNum = hour * 100 + min;
  // Mon-Fri, 9:30 AM - 4:00 PM ET
  return day >= 1 && day <= 5 && timeNum >= 930 && timeNum < 1600;
}

export function formatShortDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function oneYearAgo() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return d;
}
