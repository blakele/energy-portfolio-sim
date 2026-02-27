import { useSignalsStore } from '../../stores/signalsStore.js';
import Tip from '../shared/Tip.jsx';

export default function ConcentrationPanel() {
  const concentrationWarnings = useSignalsStore(s => s.concentrationWarnings);

  if (concentrationWarnings.length === 0) return null;

  return (
    <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--color-border)]">
        <h3 className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
          <Tip>Correlation Concentration</Tip>
        </h3>
        <p className="text-[10px] text-[var(--color-text-dim)] mt-0.5">
          Groups of stocks with correlation &gt;0.7 — combined allocation &gt;30% triggers a warning.
        </p>
      </div>
      <div className="p-4 space-y-3">
        {concentrationWarnings.map((group, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-3 rounded-lg"
            style={{
              backgroundColor: group.warning ? '#ef444410' : 'rgba(255,255,255,0.02)',
              border: group.warning ? '1px solid #ef444430' : '1px solid transparent',
            }}
          >
            <div className="flex-1">
              <div className="flex flex-wrap gap-1 mb-1">
                {group.stocks.map(sym => (
                  <span
                    key={sym}
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.06)]"
                  >
                    {sym}
                  </span>
                ))}
              </div>
              <div className="text-[10px] text-[var(--color-text-dim)]">
                Avg correlation: <span className="font-mono">{group.avgCorrelation.toFixed(2)}</span>
              </div>
            </div>
            <div className="text-right">
              <div
                className="text-sm font-bold"
                style={{ color: group.warning ? '#ef4444' : '#22c55e' }}
              >
                {group.combinedAllocation}%
              </div>
              <div className="text-[9px] text-[var(--color-text-dim)]">combined</div>
              {group.warning && (
                <div className="text-[9px] text-[#ef4444] font-medium mt-0.5">
                  Concentrated
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
