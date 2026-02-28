/**
 * Investment playbook rules — target allocations, buy zones, exit triggers.
 * Derived from INVESTMENT_PLAYBOOK.md research.
 */

export const TARGET_ALLOCATIONS = {
  CEG: 12,
  VST: 13,
  KMI: 15,
  LNG: 14,
  GEV: 10,
  CCJ: 9,
  NEE: 7,
  EQT: 4,
  ETN: 5,
  BEP: 3,
  OKLO: 3,
  // 5% cash reserve implicit
};

/**
 * Per-stock exit triggers. Each stock has:
 *   hardFloor: price below which to sell 100% (absolute loss limit)
 *   trailingStopPct: % decline from 52-week high to trigger sell-half
 *   valuationCeiling: PE above which to trim to half position (null if N/A)
 *   thesisBreaks: human-readable conditions that invalidate the position
 *   buyZone: { below: price level that's attractive, strongBuy: aggressive add level }
 *   action: any immediate action recommended
 */
export const EXIT_RULES = {
  CEG: {
    hardFloor: 207,
    trailingStopPct: 25,
    valuationCeiling: 40,
    buyZone: { below: 300, strongBuy: 270 },
    thesisBreaks: [
      'FERC reverses co-location + PPA counterparty cancels',
      'Post-Calpine leverage exceeds 4.0x D/E',
    ],
    action: null,
  },
  VST: {
    hardFloor: 105,
    trailingStopPct: 30,
    valuationCeiling: 70,
    buyZone: { below: 165, strongBuy: 145 },
    thesisBreaks: [
      'ERCOT reform eliminates pricing power OR D/E > 4.5x',
      'Meta PPA renegotiated at materially lower rates',
    ],
    action: 'Wait for Q4 earnings before adding',
  },
  KMI: {
    hardFloor: 20,
    trailingStopPct: 20,
    valuationCeiling: 28,
    buyZone: { below: 31, strongBuy: 28 },
    thesisBreaks: [
      'Dividend cut',
      'Credit downgrade below BBB-',
    ],
    action: 'Best risk-adjusted add — overweight if below target',
  },
  LNG: {
    hardFloor: 161,
    trailingStopPct: 20,
    valuationCeiling: null,
    buyZone: { below: 220, strongBuy: 200 },
    thesisBreaks: [
      'Hurricane destroys terminal (months-long outage)',
      'Global LNG supply glut crashes margins below $5/MMBtu',
      'Credit downgrade below BBB',
    ],
    action: 'Wait for earnings this week before adding',
  },
  GEV: {
    hardFloor: null, // managed by trailing stop + take-profit
    trailingStopPct: 25,
    valuationCeiling: null,
    buyZone: { below: 750, strongBuy: 650 },
    takeProfit: [
      { price: 950, trimPct: 25 },
      { price: 1100, trimPct: 25 },
    ],
    thesisBreaks: [
      'Backlog cancellations exceed $10B in any quarter',
      'Wind losses persist past 2027 and grow',
    ],
    action: 'Do NOT add. Hold. Trim at $950.',
  },
  CCJ: {
    hardFloor: null, // managed by trailing stop
    trailingStopPct: 25,
    valuationCeiling: null,
    buyZone: { below: 100, strongBuy: 85 },
    thesisBreaks: [
      'Uranium spot below $60/lb for 3+ months',
      'NRC broadly blocks new reactor construction',
    ],
    action: 'Sell shares to recover cost basis (free-ride rest)',
  },
  NEE: {
    hardFloor: 53,
    trailingStopPct: 20,
    valuationCeiling: 30,
    buyZone: { below: 80, strongBuy: 70 },
    thesisBreaks: [
      "Moody's downgrade (CFO/debt at 14.6% vs 17% threshold)",
      'IRA tax credits repealed or materially reduced',
      'NextEra Partners distribution cut',
    ],
    action: 'Hold. Only add if Fed signals rate cuts.',
  },
  EQT: {
    hardFloor: 39,
    trailingStopPct: 25,
    valuationCeiling: null,
    buyZone: { below: 50, strongBuy: 42 },
    thesisBreaks: [
      'Henry Hub below $2.00/MMBtu for 6+ months',
    ],
    action: 'Hold small. Do not add unless gas > $3.50.',
  },
  ETN: {
    hardFloor: 259,
    trailingStopPct: 20,
    valuationCeiling: 40,
    buyZone: { below: 340, strongBuy: 300 },
    thesisBreaks: [
      'Datacenter orders decline 2 consecutive quarters',
      'Mobility spin-off cancelled or materially delayed',
    ],
    action: null,
  },
  BEP: {
    hardFloor: 21,
    trailingStopPct: 20,
    valuationCeiling: null,
    buyZone: { below: 26, strongBuy: 22 },
    thesisBreaks: [
      'Distribution cut',
      'Fed reverses course and hikes rates',
    ],
    action: 'Near 52-week high. Do not add. Hold for income.',
  },
  OKLO: {
    hardFloor: 17.5,
    trailingStopPct: null, // too volatile for trailing stop
    valuationCeiling: null,
    maxPositionPct: 3,
    buyZone: { below: null, strongBuy: null }, // never add
    thesisBreaks: [
      'NRC denies license application again',
      'DOE pilot misses July 4, 2026 criticality target',
      'Cash burn exceeds $100M/year',
    ],
    action: 'Sell shares to recover cost basis NOW. Never add more.',
  },
};

export const PORTFOLIO_CIRCUIT_BREAKERS = [
  { drawdownPct: 15, action: 'Raise cash to 20% by trimming largest positions' },
  { drawdownPct: 25, action: 'Raise cash to 35%, sell all Tier 3 positions' },
];

/** Priority order for deploying cash during dips, by scenario cause */
export const DIP_BUY_PRIORITY = {
  aiEfficiency: ['KMI', 'LNG', 'EQT', 'CCJ', 'ETN'],
  rateShock: ['EQT', 'KMI', 'LNG', 'CCJ', 'GEV'],
  tariffs: ['CCJ', 'LNG', 'KMI', 'CEG', 'VST'],
  broadPanic: ['GEV', 'CCJ', 'LNG', 'KMI', 'VST'],
};
