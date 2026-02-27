import { STOCKS, TIERS } from '../../config/portfolio.js';
import { tierColor } from '../../utils/colors.js';
import StockCard from './StockCard.jsx';

export default function StockGrid() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map(tier => {
        const tierStocks = STOCKS.filter(s => s.tier === tier);
        return (
          <div key={tier}>
            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: tierColor(tier) }}
              />
              <span className="text-xs font-medium" style={{ color: tierColor(tier) }}>
                Tier {tier} — {TIERS[tier].label}
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
