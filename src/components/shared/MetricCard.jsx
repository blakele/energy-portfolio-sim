import { TOOLTIPS } from '../../utils/tooltips.js';

export default function MetricCard({ label, value, sub, color }) {
  const tooltip = TOOLTIPS[label];
  return (
    <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-4">
      <div
        className={`text-[11px] text-[var(--color-text-dim)] uppercase tracking-wider mb-1${tooltip ? ' cursor-help border-b border-dotted border-[var(--color-text-dim)] inline-block' : ''}`}
        title={tooltip || undefined}
      >
        {label}
      </div>
      <div className="text-xl font-bold" style={color ? { color } : undefined}>
        {value}
      </div>
      {sub && <div className="text-[11px] text-[var(--color-text-muted)] mt-1">{sub}</div>}
    </div>
  );
}
