import { usePortfolioStore } from '../../stores/portfolioStore.js';
import { BEAR_SCENARIOS, RISK_PROFILES, computeBearScore } from '../../config/riskProfiles.js';
import { tierColor, tierBg } from '../../utils/colors.js';

function riskColor(score) {
  if (score >= 60) return '#ef4444';
  if (score >= 35) return '#f59e0b';
  return '#22c55e';
}

function riskLabel(score) {
  if (score >= 60) return 'HIGH';
  if (score >= 35) return 'MODERATE';
  return 'LOW';
}

function severityDot(severity) {
  if (severity === 0) return null;
  const colors = { 1: '#3b82f6', 2: '#f59e0b', 3: '#ef4444' };
  return (
    <span
      className="inline-block w-2 h-2 rounded-full"
      style={{ backgroundColor: colors[severity] || '#94a3b8' }}
      title={`Severity: ${severity}/3`}
    />
  );
}

function StockRiskRow({ stock }) {
  const profile = RISK_PROFILES[stock.symbol];
  if (!profile) return null;

  const score = computeBearScore(stock.symbol);
  const color = riskColor(score);
  const activeScenarios = Object.entries(profile.scenarios)
    .filter(([, severity]) => severity >= 2)
    .map(([key]) => BEAR_SCENARIOS[key]?.label)
    .filter(Boolean);

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)]">
      {/* Symbol + tier */}
      <div className="w-16 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold">{stock.symbol}</span>
          <span
            className="text-[8px] font-bold px-1 py-0.5 rounded"
            style={{ color: tierColor(stock.tier), backgroundColor: tierBg(stock.tier) }}
          >
            T{stock.tier}
          </span>
        </div>
      </div>

      {/* Risk score bar */}
      <div className="flex-1 relative h-5 min-w-0">
        <div className="absolute inset-0 bg-[rgba(255,255,255,0.04)] rounded" />
        <div
          className="absolute top-0 h-full rounded transition-all"
          style={{
            width: `${score}%`,
            backgroundColor: color + '30',
            borderRight: `2px solid ${color}`,
          }}
        />
        <span className="absolute inset-0 flex items-center px-2 text-[9px] font-mono text-[var(--color-text-muted)]">
          {score}/100
        </span>
      </div>

      {/* Risk label */}
      <span
        className="w-20 text-center text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0"
        style={{ color, backgroundColor: color + '18' }}
      >
        {riskLabel(score)}
      </span>

      {/* Top scenarios */}
      <div className="w-36 shrink-0 hidden lg:flex items-center gap-1 flex-wrap">
        {activeScenarios.length > 0 ? activeScenarios.map((label, i) => (
          <span
            key={i}
            className="text-[8px] px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.06)] text-[var(--color-text-muted)]"
          >
            {label}
          </span>
        )) : (
          <span className="text-[8px] text-[var(--color-text-dim)]">Low exposure</span>
        )}
      </div>
    </div>
  );
}

export default function BearCasePanel() {
  const stocks = usePortfolioStore(s => s.stocks);
  const allocations = usePortfolioStore(s => s.allocations);

  // Only show stocks with allocation and a risk profile
  const activeStocks = stocks
    .filter(s => (allocations[s.symbol] || 0) > 0 && RISK_PROFILES[s.symbol])
    .map(s => ({ ...s, score: computeBearScore(s.symbol) }))
    .sort((a, b) => b.score - a.score);

  if (activeStocks.length === 0) return null;

  // Compute weighted portfolio risk
  const totalAlloc = activeStocks.reduce((sum, s) => sum + (allocations[s.symbol] || 0), 0);
  const portfolioRisk = totalAlloc > 0
    ? Math.round(activeStocks.reduce((sum, s) => sum + s.score * (allocations[s.symbol] || 0), 0) / totalAlloc)
    : 0;
  const portfolioColor = riskColor(portfolioRisk);

  // Scenario exposure summary
  const scenarioExposure = Object.entries(BEAR_SCENARIOS).map(([key, scenario]) => {
    const exposed = activeStocks.filter(s => {
      const profile = RISK_PROFILES[s.symbol];
      return profile?.scenarios[key] >= 2;
    });
    return { key, ...scenario, exposedCount: exposed.length, exposedSymbols: exposed.map(s => s.symbol) };
  }).filter(s => s.exposedCount > 0).sort((a, b) => (b.probability * b.exposedCount) - (a.probability * a.exposedCount));

  return (
    <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--color-border)]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
              Bear Case Risk Assessment
            </h3>
            <p className="text-[10px] text-[var(--color-text-dim)] mt-0.5">
              Per-stock vulnerability to 7 bear scenarios from stress-test research. Higher = more exposed.
            </p>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-[var(--color-text-dim)]">Portfolio Risk</div>
            <div className="text-sm font-bold" style={{ color: portfolioColor }}>
              {portfolioRisk}/100
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {activeStocks.map(stock => (
          <StockRiskRow key={stock.symbol} stock={stock} />
        ))}
      </div>

      {/* Scenario exposure summary */}
      {scenarioExposure.length > 0 && (
        <div className="px-4 pb-4">
          <div className="text-[10px] text-[var(--color-text-dim)] mb-2 font-medium">Active Threat Scenarios</div>
          <div className="space-y-1.5">
            {scenarioExposure.map(s => (
              <div key={s.key} className="flex items-start gap-2">
                <span
                  className="text-[8px] font-bold px-1.5 py-0.5 rounded shrink-0 mt-0.5"
                  style={{
                    color: s.probability >= 0.5 ? '#ef4444' : s.probability >= 0.25 ? '#f59e0b' : '#3b82f6',
                    backgroundColor: (s.probability >= 0.5 ? '#ef4444' : s.probability >= 0.25 ? '#f59e0b' : '#3b82f6') + '18',
                  }}
                >
                  {Math.round(s.probability * 100)}%
                </span>
                <div className="min-w-0">
                  <div className="text-[10px] font-medium text-[var(--color-text-muted)]">
                    {s.label}
                    <span className="font-normal text-[var(--color-text-dim)]"> — {s.exposedSymbols.join(', ')}</span>
                  </div>
                  <div className="text-[9px] text-[var(--color-text-dim)]">{s.short}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-4 pb-3">
        <p className="text-[8px] text-[var(--color-text-dim)] italic">
          Based on BEAR_CASE_STRESS_TEST.md research. Probability estimates are subjective assessments, not predictions.
        </p>
      </div>
    </div>
  );
}
