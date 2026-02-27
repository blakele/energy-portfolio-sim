export const CATALYSTS = [
  { symbol: 'CEG', date: '2026-02-24', event: 'Q4 Earnings', type: 'earnings' },
  { symbol: 'VST', date: '2026-02-26', event: 'Q4 Earnings', type: 'earnings' },
  { symbol: 'LNG', date: '2026-02-27', event: 'Q4 Earnings', type: 'earnings' },
  { symbol: 'CCJ', date: '2026-02-28', event: 'Q4 Earnings', type: 'earnings' },
  { symbol: 'VST', date: '2026-03-01', event: 'Meta deal finalization', type: 'catalyst' },
  { symbol: 'GEV', date: '2026-03-10', event: 'Backlog update at investor day', type: 'catalyst' },
  { symbol: 'CEG', date: '2026-03-15', event: 'Calpine integration update', type: 'catalyst' },
  { symbol: 'OKLO', date: '2026-03-15', event: 'DOE Reactor Pilot milestone', type: 'catalyst' },
  { symbol: 'KMI', date: '2026-04-16', event: 'Q1 Earnings', type: 'earnings' },
  { symbol: 'NEE', date: '2026-04-22', event: 'Q1 Earnings', type: 'earnings' },
  { symbol: 'GEV', date: '2026-04-23', event: 'Q1 Earnings', type: 'earnings' },
  { symbol: 'EQT', date: '2026-04-23', event: 'Q1 Earnings', type: 'earnings' },
  { symbol: 'ETN', date: '2026-04-29', event: 'Q1 Earnings', type: 'earnings' },
  { symbol: 'BEP', date: '2026-05-01', event: 'Q1 Earnings', type: 'earnings' },
  { symbol: 'LNG', date: '2026-05-01', event: 'Corpus Christi Stage 3 update', type: 'catalyst' },
  { symbol: 'KMI', date: '2026-06-01', event: 'LNG feedstock expansion update', type: 'catalyst' },
  { symbol: 'CCJ', date: '2026-06-15', event: 'GLE enrichment JV update', type: 'catalyst' },
  { symbol: 'NEE', date: '2026-07-04', event: 'Tax credit phaseout deadline', type: 'catalyst' },
  { symbol: 'OKLO', date: '2026-07-04', event: '3 reactor target deadline', type: 'catalyst' },
];

export function getUpcomingCatalysts(fromDate = new Date()) {
  return CATALYSTS
    .filter(c => new Date(c.date) >= fromDate)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

export function getDaysUntil(dateStr) {
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
