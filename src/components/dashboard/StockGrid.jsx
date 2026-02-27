import { TIERS } from '../../config/portfolio.js';
import { usePortfolio } from '../../hooks/usePortfolio.js';
import { tierColor } from '../../utils/colors.js';
import StockCard from './StockCard.jsx';

export default function StockGrid() {
  const { stocks } = usePortfolio();

  if (stocks.length === 0) {
    return (
      <div className="text-center py-16 text-[var(--color-text-dim)]">
        <div className="text-3xl mb-3">&#128200;</div>
        <p className="text-sm">Add stocks to get started</p>
        <p className="text-xs mt-1">Go to the Allocations tab to manage your portfolio</p>
      </div>
    );
  }

  const tiersInUse = [...new Set(stocks.map(s => s.tier))].sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      {tiersInUse.map(tier => {
        const tierStocks = stocks.filter(s => s.tier === tier);
        return (
          <div key={tier}>
            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: tierColor(tier) }}
              />
              <span className="text-xs font-medium" style={{ color: tierColor(tier) }}>
                Tier {tier} — {TIERS[tier]?.label || `Tier ${tier}`}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {tierStocks.map(stock => (
                <StockCard key={stock.symbol} stock={stock} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
