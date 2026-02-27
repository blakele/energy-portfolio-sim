import { healthColor } from '../../utils/colors.js';
import Tip from '../shared/Tip.jsx';

export default function PortfolioHealthBar({ score }) {
  if (score == null) return null;

  const color = healthColor(score);
  const label = score >= 65 ? 'Bullish' : score >= 40 ? 'Mixed' : 'Bearish';

  return (
    <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[var(--color-text-dim)] uppercase tracking-wider">
          <Tip>Portfolio Signal Health</Tip>
        </span>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold" style={{ color }}>{score}</span>
          <span className="text-xs font-medium" style={{ color }}>{label}</span>
        </div>
      </div>

      {/* Health bar */}
      <div className="relative h-3 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
        {/* Gradient background zones */}
        <div className="absolute inset-0 flex">
          <div className="flex-1 bg-[#ef444420]" />
          <div className="flex-1 bg-[#f59e0b20]" />
          <div className="flex-1 bg-[#22c55e20]" />
        </div>
        {/* Filled bar */}
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>

      <div className="flex justify-between mt-1 text-[9px] text-[var(--color-text-dim)]">
        <span>0 — Bearish</span>
        <span>50 — Neutral</span>
        <span>100 — Bullish</span>
      </div>
    </div>
  );
}
