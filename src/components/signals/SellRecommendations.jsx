import { useMemo } from 'react';
import { usePortfolioStore } from '../../stores/portfolioStore.js';
import { usePriceStore } from '../../stores/priceStore.js';
import { useSignalsStore } from '../../stores/signalsStore.js';
import { computeSellRecommendations } from '../../analysis/sellRecommendations.js';
import { formatMoney, formatPrice } from '../../utils/formatting.js';
import { tierColor, tierBg } from '../../utils/colors.js';

const URGENCY_COLORS = {
  critical: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
};

function UrgencyBadge({ urgency, count }) {
  const color = URGENCY_COLORS[urgency];
  return (
    <span
      className="text-[9px] font-bold px-2 py-0.5 rounded"
      style={{ color, backgroundColor: color + '18' }}
    >
      {count} {urgency.toUpperCase()}
    </span>
  );
}

export default function SellRecommendations() {
  const stocks = usePortfolioStore(s => s.stocks);
  const allocations = usePortfolioStore(s => s.allocations);
  const investmentAmount = usePortfolioStore(s => s.investmentAmount);
  const quotes = usePriceStore(s => s.quotes);
  const effectiveAllocations = useSignalsStore(s => s.effectiveAllocations);
  const allocationAdjustments = useSignalsStore(s => s.allocationAdjustments);

  const recommendations = useMemo(
    () => computeSellRecommendations(
      stocks, quotes, allocations, investmentAmount,
      effectiveAllocations, allocationAdjustments
    ),
    [stocks, quotes, allocations, investmentAmount, effectiveAllocations, allocationAdjustments]
  );

  const hasQuotes = Object.keys(quotes).length > 0;
  if (!hasQuotes) return null;

  const criticalCount = recommendations.filter(r => r.urgency === 'critical').length;
  const warningCount = recommendations.filter(r => r.urgency === 'warning').length;
  const infoCount = recommendations.filter(r => r.urgency === 'info').length;
  const totalToSell = recommendations.reduce((sum, r) => sum + r.dollarAmount, 0);

  return (
    <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--color-border)]">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
              Sell Recommendations
            </h3>
            <p className="text-[10px] text-[var(--color-text-dim)] mt-0.5">
              Based on effective allocations — market conditions that reduce your target trigger sell recommendations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && <UrgencyBadge urgency="critical" count={criticalCount} />}
            {warningCount > 0 && <UrgencyBadge urgency="warning" count={warningCount} />}
            {infoCount > 0 && <UrgencyBadge urgency="info" count={infoCount} />}
          </div>
        </div>
      </div>

      <div className="p-4">
        {recommendations.length === 0 ? (
          <p className="text-[10px] text-[var(--color-text-dim)] text-center py-4">
            No sell triggers detected — all positions are within acceptable ranges.
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

                  {/* Urgency + action */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0"
                        style={{
                          color: URGENCY_COLORS[rec.urgency],
                          backgroundColor: URGENCY_COLORS[rec.urgency] + '18',
                        }}
                      >
                        {rec.urgency.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-muted)] truncate">
                        {rec.suggestedAction}
                      </span>
                    </div>
                  </div>

                  {/* Dollar amount + shares */}
                  <div className="w-28 text-right shrink-0">
                    <div className="text-[11px] font-bold text-[#ef4444]">-{formatMoney(rec.dollarAmount)}</div>
                    <div className="text-[9px] text-[var(--color-text-dim)]">
                      {rec.shares} share{rec.shares !== 1 ? 's' : ''} @ {formatPrice(rec.price)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Trigger reason tags */}
            <div className="mt-3 space-y-1">
              {recommendations.map(rec => (
                <div key={rec.symbol} className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] font-bold text-[var(--color-text-muted)] w-10">{rec.symbol}</span>
                  {rec.triggers.map((trigger, i) => (
                    <span
                      key={i}
                      className="text-[8px] px-1.5 py-0.5 rounded"
                      style={{
                        color: URGENCY_COLORS[trigger.urgency],
                        backgroundColor: URGENCY_COLORS[trigger.urgency] + '10',
                      }}
                    >
                      {trigger.reason}
                    </span>
                  ))}
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex items-center justify-between flex-wrap gap-2">
              <span className="text-[10px] text-[var(--color-text-dim)]">
                {recommendations.length} position{recommendations.length !== 1 ? 's' : ''} &mdash; {formatMoney(totalToSell)} to sell
              </span>
              <span className="text-[8px] text-[var(--color-text-dim)] italic">
                Not financial advice &mdash; based on your exit rules and signal criteria
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
