/**
 * Static bear case risk profiles per stock.
 * Derived from BEAR_CASE_STRESS_TEST.md research.
 * Each stock maps to the bear scenarios it's exposed to and at what severity.
 *
 * Severity: 0 = not exposed, 1 = low, 2 = moderate, 3 = high
 * Probability is at the scenario level (from research doc).
 */

export const BEAR_SCENARIOS = {
  aiEfficiency: {
    label: 'AI Efficiency',
    short: 'AI compute efficiency gains reduce datacenter power demand',
    probability: 0.40,
  },
  demandOverestimation: {
    label: 'Demand Overestimation',
    short: 'Datacenter power forecasts prove too optimistic (Goldman vs IEA: 10x spread)',
    probability: 0.30,
  },
  ppaRisk: {
    label: 'PPA Renegotiation',
    short: 'Tech companies renegotiate or exit long-term power contracts',
    probability: 0.20,
  },
  gasCollapse: {
    label: 'Gas Price Collapse',
    short: 'Henry Hub returns to $1.50-2.00 (happened in 2024)',
    probability: 0.25,
  },
  nuclearRegulatory: {
    label: 'Nuclear Regulatory',
    short: 'NRC tightens SMR licensing or FERC reverses co-location rules',
    probability: 0.30,
  },
  interestRates: {
    label: 'Rate Shock',
    short: 'Interest rates rise 100-200bps, crushing leveraged names',
    probability: 0.20,
  },
  tariffs: {
    label: 'Tariff Escalation',
    short: 'Steel +25%, copper +50%, solar +175% — already in effect',
    probability: 0.65,
  },
};

/**
 * Per-stock exposure to each bear scenario (0-3 severity).
 * Also includes a valuation flag and key vulnerability note.
 */
export const RISK_PROFILES = {
  CEG: {
    scenarios: {
      aiEfficiency: 2,
      demandOverestimation: 3,
      ppaRisk: 3,
      gasCollapse: 1,
      nuclearRegulatory: 2,
      interestRates: 1,
      tariffs: 0,
    },
    valuationFlag: 'P/E ~30x (65% above utility sector avg)',
    keyVulnerability: 'Post-Calpine debt triples to ~$20B; 20yr PPAs priced for perfection',
  },
  VST: {
    scenarios: {
      aiEfficiency: 2,
      demandOverestimation: 3,
      ppaRisk: 2,
      gasCollapse: 1,
      nuclearRegulatory: 1,
      interestRates: 1,
      tariffs: 0,
    },
    valuationFlag: 'P/E ~55-61x (184% above utility sector avg)',
    keyVulnerability: '3.36x D/E; ERCOT concentration (~60%); highest multiple compression risk',
  },
  KMI: {
    scenarios: {
      aiEfficiency: 0,
      demandOverestimation: 1,
      ppaRisk: 0,
      gasCollapse: 2,
      nuclearRegulatory: 0,
      interestRates: 1,
      tariffs: 1,
    },
    valuationFlag: null,
    keyVulnerability: 'Pipeline throughput declines if gas producers shut in',
  },
  LNG: {
    scenarios: {
      aiEfficiency: 0,
      demandOverestimation: 0,
      ppaRisk: 0,
      gasCollapse: 1,
      nuclearRegulatory: 0,
      interestRates: 1,
      tariffs: 0,
    },
    valuationFlag: null,
    keyVulnerability: 'Gulf Coast hurricane exposure; global LNG supply glut risk',
  },
  GEV: {
    scenarios: {
      aiEfficiency: 2,
      demandOverestimation: 2,
      ppaRisk: 0,
      gasCollapse: 0,
      nuclearRegulatory: 0,
      interestRates: 0,
      tariffs: 2,
    },
    valuationFlag: null,
    keyVulnerability: 'Wind segment losses (~$600M); tariff impact $300-400M',
  },
  CCJ: {
    scenarios: {
      aiEfficiency: 1,
      demandOverestimation: 1,
      ppaRisk: 0,
      gasCollapse: 0,
      nuclearRegulatory: 2,
      interestRates: 0,
      tariffs: 0,
    },
    valuationFlag: 'FCF yield only 1.4% (premium valuation)',
    keyVulnerability: 'Uranium demand growth depends on new reactor construction timelines',
  },
  NEE: {
    scenarios: {
      aiEfficiency: 1,
      demandOverestimation: 1,
      ppaRisk: 0,
      gasCollapse: 0,
      nuclearRegulatory: 0,
      interestRates: 3,
      tariffs: 3,
    },
    valuationFlag: 'Cash-flow-to-debt 14.6% (below Moody\'s 17% downgrade threshold)',
    keyVulnerability: '$93B debt; IRA tax credit rollback risk; Florida hurricane exposure',
  },
  EQT: {
    scenarios: {
      aiEfficiency: 0,
      demandOverestimation: 0,
      ppaRisk: 0,
      gasCollapse: 3,
      nuclearRegulatory: 0,
      interestRates: 1,
      tariffs: 0,
    },
    valuationFlag: null,
    keyVulnerability: '<10% of 2026 production hedged — maximum commodity price exposure',
  },
  ETN: {
    scenarios: {
      aiEfficiency: 1,
      demandOverestimation: 2,
      ppaRisk: 0,
      gasCollapse: 0,
      nuclearRegulatory: 0,
      interestRates: 0,
      tariffs: 2,
    },
    valuationFlag: null,
    keyVulnerability: 'Tariff exposure on steel/copper inputs; Mobility spin-off execution',
  },
  BEP: {
    scenarios: {
      aiEfficiency: 0,
      demandOverestimation: 0,
      ppaRisk: 0,
      gasCollapse: 0,
      nuclearRegulatory: 0,
      interestRates: 3,
      tariffs: 2,
    },
    valuationFlag: '7.58x D/E ratio (though 90% non-recourse project debt)',
    keyVulnerability: '$39.5B total debt; resource variability (water, wind, solar)',
  },
  OKLO: {
    scenarios: {
      aiEfficiency: 2,
      demandOverestimation: 2,
      ppaRisk: 2,
      gasCollapse: 0,
      nuclearRegulatory: 3,
      interestRates: 0,
      tariffs: 0,
    },
    valuationFlag: '$0 revenue, ~$7-10B+ market cap',
    keyVulnerability: 'Pre-revenue; NRC licensing denied once; NuScale precedent (cost 2x, cancelled)',
  },
};

/**
 * Compute a 0-100 bear case risk score for a stock.
 * Higher = more risk. Combines scenario severity * probability.
 */
export function computeBearScore(symbol) {
  const profile = RISK_PROFILES[symbol];
  if (!profile) return null;

  let weightedRisk = 0;
  let maxPossible = 0;

  for (const [key, severity] of Object.entries(profile.scenarios)) {
    const scenario = BEAR_SCENARIOS[key];
    if (!scenario) continue;
    weightedRisk += severity * scenario.probability;
    maxPossible += 3 * scenario.probability;
  }

  if (maxPossible === 0) return 0;
  return Math.round((weightedRisk / maxPossible) * 100);
}
