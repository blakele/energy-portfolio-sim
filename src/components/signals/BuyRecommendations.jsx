import { useState, useMemo } from 'react';
import { usePortfolioStore } from '../../stores/portfolioStore.js';
import { usePriceStore } from '../../stores/priceStore.js';
import { useSignalsStore } from '../../stores/signalsStore.js';
import { useFundamentalsStore } from '../../stores/fundamentalsStore.js';
import { computeBuyRecommendations } from '../../analysis/buyRecommendations.js';
import { formatMoney, formatPrice } from '../../utils/formatting.js';
import { tierColor, tierBg } from '../../utils/colors.js';

export default function BuyRecommendations() {
  const [cashInput, setCashInput] = useState('5,000');

  const stocks = usePortfolioStore(s => s.stocks);
  const allocations = usePortfolioStore(s => s.allocations);
  const investmentAmount = usePortfolioStore(s => s.investmentAmount);
  const quotes = usePriceStore(s => s.quotes);
  const signals = useSignalsStore(s => s.signals);
  const computed = useSignalsStore(s => s.computed);
  const effectiveAllocations = useSignalsStore(s => s.effectiveAllocations);
  const fundamentals = useFundamentalsStore(s => s.metrics);

  const cashAmount = parseFloat(cashInput.replace(/[^0-9.]/g, '')) || 0;

  // Use effective allocations when available, fall back to user allocations
  const activeEffective = Object.keys(effectiveAllocations).length > 0
    ? effectiveAllocations
    : allocations;

  const recommendations = useMemo(
    () => computeBuyRecommendations(
      cashAmount, stocks, quotes, allocations, activeEffective, investmentAmount,
      computed ? signals : null, fundamentals
    ),
    [cashAmount, stocks, quotes, allocations, activeEffective, investmentAmount, signals, computed, fundamentals]
  );

  const hasQuotes = Object.keys(quotes).length > 0;
  if (!hasQuotes) return null;

  const maxPriority = Math.max(...recommendations.map(r => r.priority), 1);
  const totalAllocated = recommendations.reduce((sum, r) => sum + r.dollarAmount, 0);

  function handleCashChange(e) {
    const raw = e.target.value.replace(/[^0-9.]/g, '');
    if (raw === '' || raw === '.') { setCashInput(raw); return; }
    const num = parseFloat(raw);
    if (!isNaN(num)) setCashInput(num.toLocaleString('en-US'));
  }

  return (
    <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--color-border)]">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
              Buy Recommendations
            </h3>
            <p className="text-[10px] text-[var(--color-text-dim)] mt-0.5">
              {computed
                ? 'Only stocks with BUY signals. Ranked by allocation drift, tier conviction, and valuation. Stronger signals get more weight.'
                : 'Prioritized by allocation drift, tier conviction, and valuation. Load history to filter by BUY signals only.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--color-text-dim)]">Cash to deploy:</span>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-[var(--color-text-dim)]">$</span>
              <input
                type="text"
                value={cashInput}
                onChange={handleCashChange}
                className="w-28 pl-5 pr-2 py-1 text-[11px] font-mono text-right bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded focus:outline-none focus:border-[#f59e0b]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {recommendations.length === 0 ? (
          <p className="text-[10px] text-[var(--color-text-dim)] text-center py-4">
            {cashAmount <= 0
              ? 'Enter a cash amount to see recommendations.'
              : 'No buy recommendations — all positions may be at target or have SELL signals.'}
          </p>
        ) : (
          <>
            <div className="space-y-2">
              {recommendations.map(rec => (
                <div
                  key={rec.symbol}
                  className="flex items-center gap-3 p-2 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)]"
                >
                  {/* Symbol + tier badge */}
                  <div className="w-16 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold">{rec.symbol}</span>
                      <span
                        className="text-[8px] font-bold px-1 py-0.5 rounded"
                        style={{ color: tierColor(rec.tier), backgroundColor: tierBg(rec.tier) }}
                      >
                        T{rec.tier}
                      </span>
                    </div>
                  </div>

                  {/* Priority bar */}
                  <div className="flex-1 relative h-5 min-w-0">
                    <div className="absolute inset-0 bg-[rgba(255,255,255,0.04)] rounded" />
                    <div
                      className="absolute top-0 h-full rounded transition-all"
                      style={{
                        width: `${(rec.priority / maxPriority) * 100}%`,
                        backgroundColor: '#f59e0b30',
                        borderRight: '2px solid #f59e0b',
                      }}
                    />
                    <span className="absolute inset-0 flex items-center px-2 text-[9px] font-mono text-[var(--color-text-muted)]">
                      {rec.priority}pts
                    </span>
                  </div>

                  {/* Dollar amount + shares */}
                  <div className="w-28 text-right shrink-0">
                    <div className="text-[11px] font-bold text-[#22c55e]">{formatMoney(rec.dollarAmount)}</div>
                    <div className="text-[9px] text-[var(--color-text-dim)]">
                      {rec.shares} share{rec.shares !== 1 ? 's' : ''} @ {formatPrice(rec.price)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Reason tags */}
            <div className="mt-3 space-y-1">
              {recommendations.map(rec => (
                <div key={rec.symbol} className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] font-bold text-[var(--color-text-muted)] w-10">{rec.symbol}</span>
                  {rec.reasons.map((reason, i) => (
                    <span
                      key={i}
                      className="text-[8px] px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.06)] text-[var(--color-text-muted)]"
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex items-center justify-between flex-wrap gap-2">
              <span className="text-[10px] text-[var(--color-text-dim)]">
                {recommendations.length} position{recommendations.length !== 1 ? 's' : ''} &mdash; {formatMoney(totalAllocated)} of {formatMoney(cashAmount)} allocated
              </span>
              <span className="text-[8px] text-[var(--color-text-dim)] italic">
                Not financial advice &mdash; based on your signal criteria and target allocations
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
