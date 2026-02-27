export const STOCKS = [
  { symbol: 'CEG', name: 'Constellation Energy', sector: 'Nuclear', tier: 1, entryPrice: 295, icon: '\u269b\ufe0f' },
  { symbol: 'VST', name: 'Vistra Corp', sector: 'Nuclear/Gas', tier: 1, entryPrice: 162, icon: '\u269b\ufe0f' },
  { symbol: 'KMI', name: 'Kinder Morgan', sector: 'Midstream', tier: 1, entryPrice: 27, icon: '\ud83d\udd17' },
  { symbol: 'LNG', name: 'Cheniere Energy', sector: 'LNG', tier: 1, entryPrice: 215, icon: '\ud83d\udea2' },
  { symbol: 'GEV', name: 'GE Vernova', sector: 'Equipment', tier: 2, entryPrice: 430, icon: '\u2699\ufe0f' },
  { symbol: 'CCJ', name: 'Cameco', sector: 'Uranium', tier: 2, entryPrice: 70, icon: '\u2622\ufe0f' },
  { symbol: 'NEE', name: 'NextEra Energy', sector: 'Renewables', tier: 2, entryPrice: 76, icon: '\ud83c\udf3f' },
  { symbol: 'EQT', name: 'EQT Corp', sector: 'Nat Gas', tier: 3, entryPrice: 52, icon: '\ud83d\udd25' },
  { symbol: 'ETN', name: 'Eaton Corp', sector: 'Electrical', tier: 3, entryPrice: 345, icon: '\u26a1' },
  { symbol: 'BEP', name: 'Brookfield Renewable', sector: 'Renewables', tier: 3, entryPrice: 28, icon: '\ud83c\udf3f' },
  { symbol: 'OKLO', name: 'Oklo Inc', sector: 'SMR', tier: 3, entryPrice: 35, icon: '\ud83d\udd2c' },
];

export const BENCHMARK = { symbol: 'SPY', name: 'S&P 500 ETF', entryPrice: 600 };

export const ALL_SYMBOLS = [...STOCKS.map(s => s.symbol), BENCHMARK.symbol];

export const TIERS = {
  1: { label: 'Highest Conviction', color: 'tier1' },
  2: { label: 'Strong Conviction', color: 'tier2' },
  3: { label: 'Speculative', color: 'tier3' },
};

export const TIER_COLORS = { 1: '#f59e0b', 2: '#3b82f6', 3: '#8b5cf6' };

export const SECTORS = [...new Set(STOCKS.map(s => s.sector))];

export function getStockBySymbol(symbol) {
  return STOCKS.find(s => s.symbol === symbol);
}

export function getStocksByTier(tier) {
  return STOCKS.filter(s => s.tier === tier);
}

export function getStocksBySector(sector) {
  return STOCKS.filter(s => s.sector === sector);
}
