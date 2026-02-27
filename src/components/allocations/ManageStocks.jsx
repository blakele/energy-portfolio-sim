import { useState } from 'react';
import { usePortfolioStore } from '../../stores/portfolioStore.js';
import { usePortfolio } from '../../hooks/usePortfolio.js';
import { tierColor } from '../../utils/colors.js';
import StockSearchInput from '../setup/StockSearchInput.jsx';

const SECTOR_OPTIONS = [
  'Technology', 'Energy', 'Nuclear', 'Renewables', 'Utilities', 'Oil & Gas',
  'Nat Gas', 'LNG', 'Midstream', 'Uranium', 'Equipment', 'Electrical',
  'SMR', 'Healthcare', 'Financial', 'Industrial', 'Materials', 'Consumer',
  'Real Estate', 'Telecom', 'Other',
];

export default function ManageStocks() {
  const { stocks } = usePortfolio();
  const addStock = usePortfolioStore(s => s.addStock);
  const removeStock = usePortfolioStore(s => s.removeStock);
  const updateStock = usePortfolioStore(s => s.updateStock);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-[rgba(255,255,255,0.02)] transition-colors"
      >
        <div className="text-xs text-[var(--color-text-dim)] uppercase tracking-wider">
          Manage Stocks ({stocks.length})
        </div>
        <span className="text-[var(--color-text-dim)] text-sm">
          {expanded ? '\u25B2' : '\u25BC'}
        </span>
      </button>

      {expanded && (
        <div className="px-6 pb-6 space-y-4">
          {/* Add stock */}
          <StockSearchInput
            onAdd={addStock}
            existingSymbols={stocks.map(s => s.symbol)}
          />

          {/* Stock list */}
          {stocks.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-[var(--color-text-dim)]">
                    <th className="text-left px-3 py-2 font-medium">Symbol</th>
                    <th className="text-left px-3 py-2 font-medium">Name</th>
                    <th className="text-left px-3 py-2 font-medium">Sector</th>
                    <th className="text-center px-3 py-2 font-medium">Tier</th>
                    <th className="text-right px-3 py-2 font-medium">Entry $</th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map(stock => (
                    <tr key={stock.symbol} className="border-b border-[var(--color-border)] hover:bg-[rgba(255,255,255,0.02)]">
                      <td className="px-3 py-2">
                        <span className="font-bold" style={{ color: tierColor(stock.tier) }}>
                          {stock.symbol}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-[var(--color-text-muted)] max-w-[160px] truncate">
                        {stock.name}
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={stock.sector}
                          onChange={e => updateStock(stock.symbol, { sector: e.target.value })}
                          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded px-1 py-0.5 text-[10px] text-[var(--color-text-muted)]"
                        >
                          {SECTOR_OPTIONS.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                          {!SECTOR_OPTIONS.includes(stock.sector) && (
                            <option value={stock.sector}>{stock.sector}</option>
                          )}
                        </select>
                      </td>
                      <td className="text-center px-3 py-2">
                        <select
                          value={stock.tier}
                          onChange={e => updateStock(stock.symbol, { tier: parseInt(e.target.value) })}
                          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded px-1 py-0.5 text-[10px] font-bold"
                          style={{ color: tierColor(stock.tier) }}
                        >
                          <option value={1}>1</option>
                          <option value={2}>2</option>
                          <option value={3}>3</option>
                        </select>
                      </td>
                      <td className="text-right px-3 py-2">
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={stock.entryPrice}
                          onChange={e => updateStock(stock.symbol, { entryPrice: Math.max(0.01, parseFloat(e.target.value) || 0.01) })}
                          className="w-16 text-right bg-[var(--color-surface)] border border-[var(--color-border)] rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:border-[var(--color-amber-500)]"
                        />
                      </td>
                      <td className="text-center px-2 py-2">
                        <button
                          onClick={() => removeStock(stock.symbol)}
                          className="text-[var(--color-text-dim)] hover:text-[#ef4444] transition-colors"
                          title="Remove stock"
                        >
                          &times;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
