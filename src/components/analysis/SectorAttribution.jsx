import { useAnalysisStore } from '../../stores/analysisStore.js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TIER_COLORS } from '../../utils/colors.js';

export default function SectorAttribution() {
  const sectorData = useAnalysisStore(s => s.sectorData);

  if (!sectorData) {
    return (
      <div className="text-sm text-[var(--color-text-dim)] text-center py-8">
        Run a backtest to see sector attribution
      </div>
    );
  }

  const { sectors, tiers } = sectorData;

  return (
    <div className="space-y-4">
      {/* Sector contribution chart */}
      <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-6">
        <h3 className="text-xs font-medium text-[var(--color-text-dim)] uppercase tracking-wider mb-4">
          Return Contribution by Sector
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={sectors} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              type="number"
              tick={{ fill: '#64748b', fontSize: 10 }}
              tickFormatter={v => `${v.toFixed(1)}%`}
            />
            <YAxis
              type="category"
              dataKey="sector"
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              width={80}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#161b22',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 8,
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
              }}
              formatter={val => [`${val.toFixed(2)}%`, 'Contribution']}
            />
            <Bar dataKey="contribution" radius={[0, 4, 4, 0]}>
              {sectors.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.contribution >= 0 ? '#22c55e' : '#ef4444'}
                  opacity={0.7}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tier breakdown */}
      <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-6">
        <h3 className="text-xs font-medium text-[var(--color-text-dim)] uppercase tracking-wider mb-4">
          Return Contribution by Tier
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {tiers.map(t => (
            <div
              key={t.tier}
              className="border border-[var(--color-border)] rounded-lg p-4"
              style={{ borderColor: `${TIER_COLORS[t.tier]}30` }}
            >
              <div className="text-[10px] font-medium mb-1" style={{ color: TIER_COLORS[t.tier] }}>
                Tier {t.tier} — {t.label}
              </div>
              <div
                className="text-lg font-bold"
                style={{ color: t.return >= 0 ? '#22c55e' : '#ef4444' }}
              >
                {t.return >= 0 ? '+' : ''}{t.return.toFixed(2)}%
              </div>
              <div className="text-[10px] text-[var(--color-text-dim)]">
                {t.allocation.toFixed(0)}% allocated
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
