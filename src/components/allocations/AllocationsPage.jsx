import { useState, useCallback } from 'react';
import { usePortfolioStore } from '../../stores/portfolioStore.js';
import { usePriceStore } from '../../stores/priceStore.js';
import { usePortfolio } from '../../hooks/usePortfolio.js';
import { TIERS } from '../../config/portfolio.js';
import { computeDynamicPresets } from '../../config/presets.js';
import { tierColor } from '../../utils/colors.js';
import { formatMoney } from '../../utils/formatting.js';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import ManageStocks from './ManageStocks.jsx';

export default function AllocationsPage() {
  const {
    allocations, investmentAmount, selectedPreset, shares,
    setAllocation, applyPreset, normalize, setInvestmentAmount,
    setShares, applyShareAllocations,
  } = usePortfolioStore();
  const quotes = usePriceStore(s => s.quotes);
  const { stocks } = usePortfolio();
  const [inputMode, setInputMode] = useState('pct'); // 'pct' | 'shares'

  const getPrice = useCallback((symbol) => {
    const stock = stocks.find(s => s.symbol === symbol);
    return quotes[symbol]?.price || stock?.entryPrice || 0;
  }, [quotes, stocks]);

  const handleShareChange = useCallback((symbol, count) => {
    setShares(symbol, count);
    // Build prices map and recompute allocations
    const prices = {};
    for (const s of stocks) prices[s.symbol] = getPrice(s.symbol);
    // Need to use the updated shares — setShares is async, so apply with override
    const currentShares = { ...usePortfolioStore.getState().shares, [symbol]: Math.max(0, count) };
    let totalValue = 0;
    const values = {};
    for (const s of stocks) {
      const c = currentShares[s.symbol] || 0;
      const p = prices[s.symbol];
      const val = c * p;
      values[s.symbol] = val;
      totalValue += val;
    }
    if (totalValue > 0) {
      const allocs = {};
      for (const s of stocks) {
        allocs[s.symbol] = Math.round(((values[s.symbol] || 0) / totalValue) * 1000) / 10;
      }
      const sum = Object.values(allocs).reduce((a, b) => a + b, 0);
      const diff = 100 - sum;
      if (diff !== 0) {
        const maxKey = Object.entries(allocs).sort((a, b) => b[1] - a[1])[0]?.[0];
        if (maxKey) allocs[maxKey] = Math.round((allocs[maxKey] + diff) * 10) / 10;
      }
      usePortfolioStore.setState({
        shares: currentShares,
        allocations: allocs,
        investmentAmount: Math.round(totalValue),
        selectedPreset: null,
      });
    }
  }, [stocks, getPrice, setShares]);

  const presets = computeDynamicPresets(stocks);
  const totalAlloc = Object.values(allocations).reduce((a, b) => a + b, 0);

  const pieData = stocks
    .filter(s => allocations[s.symbol] > 0)
    .map(s => ({
      name: s.symbol,
      value: allocations[s.symbol],
      color: tierColor(s.tier),
    }));

  const tiersInUse = [...new Set(stocks.map(s => s.tier))].sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      {/* Manage Stocks */}
      <ManageStocks />

      {/* Investment Amount */}
      <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-6">
        <label className="text-xs text-[var(--color-text-dim)] uppercase tracking-wider block mb-2">
          Investment Amount
        </label>
        <div className="flex items-center gap-2">
          <span className="text-[var(--color-text-muted)]">$</span>
          <input
            type="number"
            value={investmentAmount}
            onChange={e => setInvestmentAmount(Math.max(0, Number(e.target.value)))}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded px-3 py-2 text-lg font-bold w-48 focus:outline-none focus:border-[var(--color-amber-500)]"
          />
        </div>
      </div>

      {/* Presets */}
      <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-6">
        <div className="text-xs text-[var(--color-text-dim)] uppercase tracking-wider mb-3">
          Holdings Presets
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.keys(presets).map(name => (
            <button
              key={name}
              onClick={() => applyPreset(name)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors border ${
                selectedPreset === name
                  ? 'bg-[var(--color-amber-500)] text-black border-[var(--color-amber-500)]'
                  : 'bg-[var(--color-surface-3)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-[var(--color-amber-500)]'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {stocks.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-text-dim)]">
          <p className="text-sm">Add stocks above to configure allocations</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sliders */}
          <div className="lg:col-span-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-xs text-[var(--color-text-dim)] uppercase tracking-wider">
                  Current Holdings
                </div>
                <div className="flex bg-[var(--color-surface)] border border-[var(--color-border)] rounded overflow-hidden">
                  <button
                    onClick={() => setInputMode('pct')}
                    className={`px-2.5 py-1 text-[10px] font-medium transition-colors ${
                      inputMode === 'pct'
                        ? 'bg-[var(--color-amber-500)] text-black'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                    }`}
                  >
                    By %
                  </button>
                  <button
                    onClick={() => setInputMode('shares')}
                    className={`px-2.5 py-1 text-[10px] font-medium transition-colors ${
                      inputMode === 'shares'
                        ? 'bg-[var(--color-amber-500)] text-black'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                    }`}
                  >
                    By Shares
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="text-xs font-bold"
                  style={{ color: Math.abs(totalAlloc - 100) < 0.5 ? '#22c55e' : '#ef4444' }}
                >
                  Total: {totalAlloc.toFixed(1)}%
                </span>
                {inputMode === 'pct' && (
                  <button
                    onClick={normalize}
                    className="text-[10px] bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded px-2 py-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                  >
                    Normalize to 100%
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {tiersInUse.map(tier => (
                <div key={tier}>
                  <div className="text-[10px] font-medium mb-2" style={{ color: tierColor(tier) }}>
                    Tier {tier} — {TIERS[tier]?.label || `Tier ${tier}`}
                  </div>
                  {stocks.filter(s => s.tier === tier).map(stock => (
                    <div key={stock.symbol} className="flex items-center gap-3 mb-2">
                      <span className="w-10 text-xs font-bold">{stock.symbol}</span>
                      {inputMode === 'pct' ? (
                        <>
                          <input
                            type="range"
                            min="0"
                            max="40"
                            step="0.5"
                            value={allocations[stock.symbol] || 0}
                            onChange={e => setAllocation(stock.symbol, parseFloat(e.target.value))}
                            className="flex-1"
                            style={{ accentColor: tierColor(stock.tier) }}
                          />
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.5"
                            value={allocations[stock.symbol] || 0}
                            onChange={e => setAllocation(stock.symbol, parseFloat(e.target.value) || 0)}
                            className="w-16 text-right text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded px-2 py-1 focus:outline-none focus:border-[var(--color-amber-500)]"
                          />
                          <span className="text-[10px] text-[var(--color-text-dim)] w-4">%</span>
                        </>
                      ) : (
                        <>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={shares[stock.symbol] || ''}
                            placeholder="0"
                            onChange={e => handleShareChange(stock.symbol, parseFloat(e.target.value) || 0)}
                            className="w-20 text-right text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded px-2 py-1 focus:outline-none focus:border-[var(--color-amber-500)]"
                          />
                          <span className="text-[10px] text-[var(--color-text-dim)] w-10">shares</span>
                          <span className="text-[10px] text-[var(--color-text-muted)] w-16 text-right">
                            {formatMoney((shares[stock.symbol] || 0) * getPrice(stock.symbol))}
                          </span>
                          <span className="text-[10px] text-[var(--color-text-dim)] w-12 text-right">
                            {(allocations[stock.symbol] || 0).toFixed(1)}%
                          </span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-6">
            <div className="text-xs text-[var(--color-text-dim)] uppercase tracking-wider mb-4">
              Holdings Breakdown
            </div>
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} opacity={0.8} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#161b22',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 8,
                        fontSize: 11,
                        fontFamily: 'var(--font-mono)',
                      }}
                      formatter={(val) => [`${val}%`]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1 mt-2">
                  {pieData.map(d => (
                    <div key={d.name} className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                        <span>{d.name}</span>
                      </div>
                      <span className="text-[var(--color-text-muted)]">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-[var(--color-text-dim)] text-xs">
                Set holdings to see breakdown
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
