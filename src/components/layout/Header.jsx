import { useMarketStatus } from '../../hooks/useMarketStatus.js';
import { usePriceStore } from '../../stores/priceStore.js';

export default function Header({ onRefresh, loading, onSettingsClick }) {
  const marketOpen = useMarketStatus();
  const lastRefresh = usePriceStore(s => s.lastRefresh);

  return (
    <header className="border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-xl">&#9889;</span>
        <div>
          <h1 className="text-lg font-bold text-[var(--color-amber-500)]">
            Portfolio Simulator
          </h1>
          <p className="text-[10px] text-[var(--color-text-dim)]">
            Personal Investment Research Tool
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: marketOpen ? '#22c55e' : '#ef4444' }}
          />
          <span className="text-[11px] text-[var(--color-text-muted)]">
            {marketOpen ? 'Market Open' : 'Market Closed'}
          </span>
        </div>

        {lastRefresh && (
          <span className="text-[10px] text-[var(--color-text-dim)]">
            Updated {lastRefresh.toLocaleTimeString()}
          </span>
        )}

        <button
          onClick={onRefresh}
          disabled={loading}
          className="text-[11px] bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded px-3 py-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-amber-500)] transition-colors disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>

        <button
          onClick={onSettingsClick}
          className="text-[var(--color-text-dim)] hover:text-[var(--color-text)] transition-colors text-sm"
          title="Settings"
        >
          &#9881;
        </button>
      </div>
    </header>
  );
}
