import { usePortfolioStore } from '../../stores/portfolioStore.js';
import { formatMoney } from '../../utils/formatting.js';

export default function QuickStartCard({ onNavigate }) {
  const stocks = usePortfolioStore(s => s.stocks);
  const investmentAmount = usePortfolioStore(s => s.investmentAmount);
  const selectedPreset = usePortfolioStore(s => s.selectedPreset);
  const quickStartDismissed = usePortfolioStore(s => s.quickStartDismissed);
  const dismissQuickStart = usePortfolioStore(s => s.dismissQuickStart);

  if (quickStartDismissed) return null;

  return (
    <div className="bg-[#f59e0b10] border border-[#f59e0b40] rounded-lg px-4 py-3 relative">
      <button
        onClick={dismissQuickStart}
        className="absolute top-2 right-3 text-[var(--color-text-dim)] hover:text-[var(--color-text)] text-sm transition-colors"
        title="Dismiss"
      >
        &times;
      </button>

      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm">&#127881;</span>
        <span className="text-xs font-bold text-[var(--color-amber-500)]">Welcome to your portfolio!</span>
      </div>

      <p className="text-[10px] text-[var(--color-text-muted)] mb-3">
        {formatMoney(investmentAmount)} across {stocks.length} stocks
        {selectedPreset ? `, ${selectedPreset} preset` : ''}. Here are your next steps:
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onNavigate('analysis')}
          className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-amber-500)] hover:border-[var(--color-amber-500)] transition-colors"
        >
          Load History
        </button>
        <button
          onClick={() => onNavigate('signals')}
          className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-amber-500)] hover:border-[var(--color-amber-500)] transition-colors"
        >
          View Signals
        </button>
        <button
          onClick={() => onNavigate('allocations')}
          className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-amber-500)] hover:border-[var(--color-amber-500)] transition-colors"
        >
          Adjust Allocations
        </button>
      </div>
    </div>
  );
}
