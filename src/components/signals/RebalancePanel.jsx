import { useSignalsStore } from '../../stores/signalsStore.js';
import { formatMoney } from '../../utils/formatting.js';
import Tip from '../shared/Tip.jsx';
import { TOOLTIPS } from '../../utils/tooltips.js';

function driftColor(drift) {
  const abs = Math.abs(drift);
  if (abs > 10) return '#ef4444';
  if (abs > 5) return '#f59e0b';
  return '#22c55e';
}

function actionColor(action) {
  if (action === 'ADD') return '#22c55e';
  if (action === 'TRIM') return '#ef4444';
  return '#94a3b8';
}

export default function RebalancePanel() {
  const rebalanceData = useSignalsStore(s => s.rebalanceData);

  if (rebalanceData.length === 0) return null;

  const maxDrift = Math.max(...rebalanceData.map(d => Math.abs(d.drift)), 1);

  return (
    <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--color-border)]">
        <h3 className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
          <Tip>Rebalance Drift</Tip>
        </h3>
        <p className="text-[10px] text-[var(--color-text-dim)] mt-0.5">
          Actual vs effective target — positions drifting &gt;5% are flagged.
        </p>
      </div>
      <div className="p-4 space-y-2">
        {rebalanceData.map(d => (
          <div key={d.symbol} className="flex items-center gap-3">
            <span className="w-10 text-[11px] font-bold">{d.symbol}</span>
            <div className="flex-1 relative h-5">
              {/* Background bar */}
              <div className="absolute inset-0 bg-[rgba(255,255,255,0.04)] rounded" />
              {/* Drift bar */}
              <div
                className="absolute top-0 h-full rounded transition-all"
                style={{
                  left: d.drift >= 0 ? '50%' : `${50 - (Math.abs(d.drift) / maxDrift) * 50}%`,
                  width: `${(Math.abs(d.drift) / maxDrift) * 50}%`,
                  backgroundColor: driftColor(d.drift) + '40',
                  borderLeft: d.drift < 0 ? `2px solid ${driftColor(d.drift)}` : 'none',
                  borderRight: d.drift >= 0 ? `2px solid ${driftColor(d.drift)}` : 'none',
                }}
              />
              {/* Center line */}
              <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[var(--color-border)]" />
            </div>
            <span className="w-12 text-right text-[10px] font-mono" style={{ color: driftColor(d.drift) }}>
              {d.drift > 0 ? '+' : ''}{d.drift}%
            </span>
            <span className="w-10 text-center text-[10px] font-bold cursor-help" style={{ color: actionColor(d.action) }} title={TOOLTIPS[d.action]}>
              {d.action}
            </span>
            {d.action !== 'HOLD' && (
              <span className="text-[9px] text-[var(--color-text-dim)] w-16 text-right">
                {formatMoney(d.dollarAmount)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
