import { useState } from 'react';
import { usePortfolioStore } from '../../stores/portfolioStore.js';
import { DEFAULT_STOCKS, DEFAULT_BENCHMARK, TIERS } from '../../config/portfolio.js';
import { tierColor } from '../../utils/colors.js';
import StockSearchInput from './StockSearchInput.jsx';

const SECTOR_OPTIONS = [
  'Technology', 'Energy', 'Nuclear', 'Renewables', 'Utilities', 'Oil & Gas',
  'Nat Gas', 'LNG', 'Midstream', 'Uranium', 'Equipment', 'Electrical',
  'SMR', 'Healthcare', 'Financial', 'Industrial', 'Materials', 'Consumer',
  'Real Estate', 'Telecom', 'Other',
];

export default function PortfolioSetup() {
  const stocks = usePortfolioStore(s => s.stocks);
  const benchmark = usePortfolioStore(s => s.benchmark);
  const addStock = usePortfolioStore(s => s.addStock);
  const removeStock = usePortfolioStore(s => s.removeStock);
  const updateStock = usePortfolioStore(s => s.updateStock);
  const setBenchmark = usePortfolioStore(s => s.setBenchmark);
  const completeSetup = usePortfolioStore(s => s.completeSetup);

  const [benchmarkSymbol, setBenchmarkSymbol] = useState(benchmark.symbol);
  const [benchmarkEntry, setBenchmarkEntry] = useState(benchmark.entryPrice);
  const [editingStock, setEditingStock] = useState(null);

  const handleAddStock = (stockDef) => {
    addStock(stockDef);
  };

  const handleLoadTemplate = () => {
    for (const stock of DEFAULT_STOCKS) {
      addStock(stock);
    }
    setBenchmark({ ...DEFAULT_BENCHMARK });
    setBenchmarkSymbol(DEFAULT_BENCHMARK.symbol);
    setBenchmarkEntry(DEFAULT_BENCHMARK.entryPrice);
  };

  const handleContinue = () => {
    setBenchmark({
      symbol: benchmarkSymbol.toUpperCase() || 'SPY',
      name: benchmark.name,
      entryPrice: benchmarkEntry || 600,
    });
    completeSetup();
  };

  const handleEditField = (symbol, field, value) => {
    updateStock(symbol, { [field]: value });
  };

  return (
    <div className="fixed inset-0 bg-[var(--color-surface)] overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-[var(--color-amber-500)] mb-2">
            Portfolio Simulator
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Build your portfolio to get started. Add stocks, set your entry prices, and configure tiers.
          </p>
        </div>

        {/* Add Stock */}
        <div className="mb-8">
          <div className="text-xs text-[var(--color-text-dim)] uppercase tracking-wider mb-3">
            Add Stocks
          </div>
          <StockSearchInput
            onAdd={handleAddStock}
            existingSymbols={stocks.map(s => s.symbol)}
          />
        </div>

        {/* Stock Table */}
        {stocks.length > 0 && (
          <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg overflow-hidden mb-8">
            <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
              <span className="text-xs text-[var(--color-text-dim)] uppercase tracking-wider">
                Your Stocks ({stocks.length})
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-[var(--color-text-dim)]">
                    <th className="text-left px-4 py-2 font-medium">Symbol</th>
                    <th className="text-left px-3 py-2 font-medium">Name</th>
                    <th className="text-left px-3 py-2 font-medium">Sector</th>
                    <th className="text-center px-3 py-2 font-medium">Tier</th>
                    <th className="text-right px-3 py-2 font-medium">Entry Price</th>
                    <th className="text-center px-3 py-2 font-medium w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map(stock => (
                    <tr key={stock.symbol} className="border-b border-[var(--color-border)] hover:bg-[rgba(255,255,255,0.02)]">
                      <td className="px-4 py-2">
                        <span className="font-bold" style={{ color: tierColor(stock.tier) }}>
                          {stock.symbol}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-[var(--color-text-muted)]">
                        {editingStock === stock.symbol ? (
                          <input
                            type="text"
                            value={stock.name}
                            onChange={e => handleEditField(stock.symbol, 'name', e.target.value)}
                            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded px-2 py-0.5 text-[11px]"
                          />
                        ) : (
                          <span onClick={() => setEditingStock(stock.symbol)} className="cursor-pointer hover:text-[var(--color-text)]">
                            {stock.name}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={stock.sector}
                          onChange={e => handleEditField(stock.symbol, 'sector', e.target.value)}
                          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded px-1.5 py-0.5 text-[11px] text-[var(--color-text-muted)]"
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
                          onChange={e => handleEditField(stock.symbol, 'tier', parseInt(e.target.value))}
                          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded px-1.5 py-0.5 text-[11px] font-bold"
                          style={{ color: tierColor(stock.tier) }}
                        >
                          <option value={1}>1</option>
                          <option value={2}>2</option>
                          <option value={3}>3</option>
                        </select>
                      </td>
                      <td className="text-right px-3 py-2">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-[var(--color-text-dim)]">$</span>
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={stock.entryPrice}
                            onChange={e => handleEditField(stock.symbol, 'entryPrice', Math.max(0.01, parseFloat(e.target.value) || 0.01))}
                            className="w-20 text-right bg-[var(--color-surface)] border border-[var(--color-border)] rounded px-2 py-0.5 text-[11px] focus:outline-none focus:border-[var(--color-amber-500)]"
                          />
                        </div>
                      </td>
                      <td className="text-center px-3 py-2">
                        <button
                          onClick={() => removeStock(stock.symbol)}
                          className="text-[var(--color-text-dim)] hover:text-[#ef4444] transition-colors text-sm"
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
          </div>
        )}

        {/* Benchmark */}
        <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-6 mb-8">
          <div className="text-xs text-[var(--color-text-dim)] uppercase tracking-wider mb-3">
            Benchmark
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-[var(--color-text-muted)]">Symbol:</label>
              <input
                type="text"
                value={benchmarkSymbol}
                onChange={e => setBenchmarkSymbol(e.target.value.toUpperCase())}
                className="w-20 bg-[var(--color-surface)] border border-[var(--color-border)] rounded px-2 py-1.5 text-sm font-bold focus:outline-none focus:border-[var(--color-amber-500)]"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-[var(--color-text-muted)]">Entry Price:</label>
              <div className="flex items-center gap-1">
                <span className="text-[var(--color-text-dim)]">$</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={benchmarkEntry}
                  onChange={e => setBenchmarkEntry(parseFloat(e.target.value) || 0)}
                  className="w-24 bg-[var(--color-surface)] border border-[var(--color-border)] rounded px-2 py-1.5 text-sm focus:outline-none focus:border-[var(--color-amber-500)]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleLoadTemplate}
            className="text-xs text-[var(--color-amber-400)] hover:text-[var(--color-amber-500)] hover:underline transition-colors"
          >
            Load Energy Portfolio Template (11 stocks)
          </button>

          <button
            onClick={handleContinue}
            disabled={stocks.length === 0}
            className="px-6 py-3 rounded-lg font-bold text-sm bg-[var(--color-amber-500)] text-black hover:bg-[var(--color-amber-600)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Continue to Dashboard &rarr;
          </button>
        </div>

        <p className="text-[10px] text-[var(--color-text-dim)] text-center mt-8">
          Your portfolio is stored locally in your browser. You can add or remove stocks anytime from the Allocations tab.
        </p>
      </div>
    </div>
  );
}
