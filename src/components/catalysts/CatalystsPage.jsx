import { getUpcomingCatalysts, getDaysUntil } from '../../config/catalysts.js';
import { getStockBySymbol } from '../../config/portfolio.js';
import { tierColor } from '../../utils/colors.js';
import { formatShortDate } from '../../utils/dateUtils.js';
import TierBadge from '../shared/TierBadge.jsx';

export default function CatalystsPage() {
  const catalysts = getUpcomingCatalysts();

  return (
    <div className="space-y-4">
      <div className="text-xs text-[var(--color-text-dim)] uppercase tracking-wider">
        Upcoming Catalysts & Earnings
      </div>

      {catalysts.length === 0 ? (
        <div className="text-sm text-[var(--color-text-dim)] text-center py-12">
          No upcoming catalysts scheduled
        </div>
      ) : (
        <div className="space-y-2">
          {catalysts.map((c, i) => {
            const stock = getStockBySymbol(c.symbol);
            const days = getDaysUntil(c.date);
            const isSoon = days <= 7;
            const isPast = days < 0;

            return (
              <div
                key={i}
                className={`bg-[var(--color-surface-2)] border rounded-lg p-4 flex items-center gap-4 transition-colors ${
                  isSoon && !isPast
                    ? 'border-[var(--color-border-amber)]'
                    : 'border-[var(--color-border)]'
                }`}
              >
                {/* Date badge */}
                <div className="text-center min-w-[50px]">
                  <div className="text-[10px] text-[var(--color-text-dim)] uppercase">
                    {new Date(c.date).toLocaleDateString('en-US', { month: 'short' })}
                  </div>
                  <div className="text-xl font-bold text-[var(--color-text)]">
                    {new Date(c.date).getDate()}
                  </div>
                </div>

                {/* Event info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold" style={{ color: stock ? tierColor(stock.tier) : undefined }}>
                      {c.symbol}
                    </span>
                    {stock && <TierBadge tier={stock.tier} />}
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                        c.type === 'earnings'
                          ? 'bg-[rgba(59,130,246,0.15)] text-[#60a5fa]'
                          : 'bg-[rgba(139,92,246,0.15)] text-[#a78bfa]'
                      }`}
                    >
                      {c.type.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)]">{c.event}</div>
                </div>

                {/* Days until */}
                <div className="text-right min-w-[80px]">
                  {isPast ? (
                    <span className="text-xs text-[var(--color-text-dim)]">Passed</span>
                  ) : (
                    <>
                      <div
                        className="text-lg font-bold"
                        style={{ color: isSoon ? '#f59e0b' : 'var(--color-text-muted)' }}
                      >
                        {days}d
                      </div>
                      <div className="text-[10px] text-[var(--color-text-dim)]">
                        {isSoon ? 'This week' : 'days away'}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
