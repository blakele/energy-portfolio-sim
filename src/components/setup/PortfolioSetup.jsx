import { useState } from 'react';
import { usePortfolioStore } from '../../stores/portfolioStore.js';
import { DEFAULT_STOCKS, DEFAULT_BENCHMARK, TIERS } from '../../config/portfolio.js';
import { computeDynamicPresets } from '../../config/presets.js';
import { tierColor, tierBg } from '../../utils/colors.js';
import { formatMoney } from '../../utils/formatting.js';
import StockSearchInput from './StockSearchInput.jsx';

const SECTOR_OPTIONS = [
  'Technology', 'Energy', 'Nuclear', 'Renewables', 'Utilities', 'Oil & Gas',
  'Nat Gas', 'LNG', 'Midstream', 'Uranium', 'Equipment', 'Electrical',
  'SMR', 'Healthcare', 'Financial', 'Industrial', 'Materials', 'Consumer',
  'Real Estate', 'Telecom', 'Other',
];

const QUICK_AMOUNTS = [10000, 25000, 50000, 100000];
const PRESET_NAMES = ['Equal Weight', 'Tier Weighted', 'Conviction Focus'];

function ProgressIndicator({ step }) {
  const steps = ['Build Portfolio', 'Set Investment', "You're Ready"];
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((label, i) => {
        const num = i + 1;
        const isActive = num === step;
        const isDone = num < step;
        return (
          <div key={num} className="flex items-center gap-2">
            {i > 0 && (
              <div
                className="w-8 h-px"
                style={{ backgroundColor: isDone ? 'var(--color-amber-500)' : 'var(--color-border)' }}
              />
            )}
            <div className="flex items-center gap-1.5">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors"
                style={{
                  backgroundColor: isActive || isDone ? 'var(--color-amber-500)' : 'transparent',
                  color: isActive || isDone ? '#000' : 'var(--color-text-dim)',
                  border: isActive || isDone ? 'none' : '1px solid var(--color-border)',
                }}
              >
                {isDone ? '\u2713' : num}
              </div>
              <span
                className="text-[10px] hidden sm:inline"
                style={{ color: isActive ? 'var(--color-amber-500)' : 'var(--color-text-dim)' }}
              >
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function PortfolioSetup() {
  const stocks = usePortfolioStore(s => s.stocks);
  const benchmark = usePortfolioStore(s => s.benchmark);
  const investmentAmount = usePortfolioStore(s => s.investmentAmount);
  const selectedPreset = usePortfolioStore(s => s.selectedPreset);
  const allocations = usePortfolioStore(s => s.allocations);
  const addStock = usePortfolioStore(s => s.addStock);
  const removeStock = usePortfolioStore(s => s.removeStock);
  const updateStock = usePortfolioStore(s => s.updateStock);
  const setBenchmark = usePortfolioStore(s => s.setBenchmark);
  const setInvestmentAmount = usePortfolioStore(s => s.setInvestmentAmount);
  const applyPreset = usePortfolioStore(s => s.applyPreset);
  const completeSetup = usePortfolioStore(s => s.completeSetup);

  const [step, setStep] = useState(1);
  const [benchmarkSymbol, setBenchmarkSymbol] = useState(benchmark.symbol);
  const [benchmarkEntry, setBenchmarkEntry] = useState(benchmark.entryPrice);
  const [editingStock, setEditingStock] = useState(null);
  const [customAmount, setCustomAmount] = useState('');

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

  const handleNext = () => {
    if (step === 1) {
      setBenchmark({
        symbol: benchmarkSymbol.toUpperCase() || 'SPY',
        name: benchmark.name,
        entryPrice: benchmarkEntry || 600,
      });
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleBack = () => {
    setStep(s => Math.max(1, s - 1));
  };

  const handleFinish = () => {
    completeSetup();
  };

  const handleEditField = (symbol, field, value) => {
    updateStock(symbol, { [field]: value });
  };

  const handleAmountSelect = (amount) => {
    setInvestmentAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmount = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(raw);
    const num = parseInt(raw);
    if (!isNaN(num) && num > 0) {
      setInvestmentAmount(num);
    }
  };

  // Compute preset previews
  const presets = computeDynamicPresets(stocks);

  // Summary data for step 3
  const tier1Count = stocks.filter(s => s.tier === 1).length;
  const tier2Count = stocks.filter(s => s.tier === 2).length;
  const tier3Count = stocks.filter(s => s.tier === 3).length;
  const topAllocations = Object.entries(allocations)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .filter(([, pct]) => pct > 0);

  return (
    <div className="fixed inset-0 bg-[var(--color-surface)] overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[var(--color-amber-500)] mb-2">
            Portfolio Simulator
          </h1>
        </div>

        <ProgressIndicator step={step} />

        {/* ===== STEP 1: Build Your Portfolio ===== */}
        {step === 1 && (
          <>
            <p className="text-sm text-[var(--color-text-muted)] text-center mb-8">
              Add stocks, set your entry prices, and configure tiers.
            </p>

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
                                onBlur={() => setEditingStock(null)}
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
                onClick={handleNext}
                disabled={stocks.length === 0}
                className="px-6 py-3 rounded-lg font-bold text-sm bg-[var(--color-amber-500)] text-black hover:bg-[var(--color-amber-600)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next &rarr;
              </button>
            </div>
          </>
        )}

        {/* ===== STEP 2: Set Your Investment ===== */}
        {step === 2 && (
          <>
            <p className="text-sm text-[var(--color-text-muted)] text-center mb-8">
              How much are you investing, and how should it be split across your {stocks.length} stocks?
            </p>

            {/* Investment Amount */}
            <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-6 mb-6">
              <div className="text-xs text-[var(--color-text-dim)] uppercase tracking-wider mb-4">
                Investment Amount
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {QUICK_AMOUNTS.map(amt => (
                  <button
                    key={amt}
                    onClick={() => handleAmountSelect(amt)}
                    className="px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                    style={{
                      backgroundColor: investmentAmount === amt && !customAmount
                        ? 'var(--color-amber-500)' : 'var(--color-surface)',
                      color: investmentAmount === amt && !customAmount
                        ? '#000' : 'var(--color-text-muted)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    {formatMoney(amt)}
                  </button>
                ))}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-dim)]">$</span>
                  <input
                    type="text"
                    value={customAmount}
                    onChange={handleCustomAmount}
                    placeholder="Custom"
                    className="w-32 pl-7 pr-3 py-2 rounded-lg text-sm font-bold bg-[var(--color-surface)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-amber-500)]"
                  />
                </div>
              </div>
              <div className="text-center text-lg font-bold text-[var(--color-amber-500)]">
                {formatMoney(investmentAmount)}
              </div>
            </div>

            {/* Allocation Preset */}
            <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-6 mb-6">
              <div className="text-xs text-[var(--color-text-dim)] uppercase tracking-wider mb-4">
                Allocation Strategy
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                {PRESET_NAMES.map(name => {
                  const isActive = selectedPreset === name;
                  const desc = name === 'Equal Weight'
                    ? 'Same % to every stock'
                    : name === 'Tier Weighted'
                      ? 'More to high-conviction tiers'
                      : 'Only Tier 1 & 2 stocks';
                  return (
                    <button
                      key={name}
                      onClick={() => applyPreset(name)}
                      className="p-3 rounded-lg text-left transition-colors border"
                      style={{
                        backgroundColor: isActive ? 'var(--color-amber-500)' + '18' : 'var(--color-surface)',
                        borderColor: isActive ? 'var(--color-amber-500)' : 'var(--color-border)',
                      }}
                    >
                      <div className="text-[11px] font-bold" style={{ color: isActive ? 'var(--color-amber-500)' : 'var(--color-text)' }}>
                        {name}
                      </div>
                      <div className="text-[9px] text-[var(--color-text-dim)] mt-0.5">{desc}</div>
                    </button>
                  );
                })}
              </div>

              {/* Preview top allocations by tier */}
              {selectedPreset && presets[selectedPreset] && (
                <div className="border-t border-[var(--color-border)] pt-3">
                  <div className="text-[10px] text-[var(--color-text-dim)] mb-2">Preview:</div>
                  <div className="space-y-1">
                    {Object.entries(presets[selectedPreset])
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 6)
                      .map(([symbol, pct]) => {
                        const stock = stocks.find(s => s.symbol === symbol);
                        return (
                          <div key={symbol} className="flex items-center justify-between text-[10px]">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold" style={{ color: tierColor(stock?.tier) }}>{symbol}</span>
                              <span
                                className="text-[8px] font-bold px-1 py-0.5 rounded"
                                style={{ color: tierColor(stock?.tier), backgroundColor: tierBg(stock?.tier) }}
                              >
                                T{stock?.tier}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[var(--color-text-muted)]">{pct}%</span>
                              <span className="text-[var(--color-text-dim)]">{formatMoney(investmentAmount * pct / 100)}</span>
                            </div>
                          </div>
                        );
                      })}
                    {Object.keys(presets[selectedPreset]).length > 6 && (
                      <div className="text-[9px] text-[var(--color-text-dim)]">
                        +{Object.keys(presets[selectedPreset]).length - 6} more...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                className="px-6 py-3 rounded-lg font-bold text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--color-text-dim)] transition-colors"
              >
                &larr; Back
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-3 rounded-lg font-bold text-sm bg-[var(--color-amber-500)] text-black hover:bg-[var(--color-amber-600)] transition-colors"
              >
                Next &rarr;
              </button>
            </div>
          </>
        )}

        {/* ===== STEP 3: You're Ready ===== */}
        {step === 3 && (
          <>
            <p className="text-sm text-[var(--color-text-muted)] text-center mb-8">
              Here's your portfolio summary. You can always adjust later.
            </p>

            {/* Summary Card */}
            <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-6 mb-6">
              <div className="text-xs text-[var(--color-text-dim)] uppercase tracking-wider mb-4">
                Portfolio Summary
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-[var(--color-amber-500)]">{stocks.length}</div>
                  <div className="text-[10px] text-[var(--color-text-dim)]">Stocks</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-[var(--color-amber-500)]">{formatMoney(investmentAmount)}</div>
                  <div className="text-[10px] text-[var(--color-text-dim)]">Invested</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-[var(--color-text)]">{selectedPreset || 'Custom'}</div>
                  <div className="text-[10px] text-[var(--color-text-dim)]">Preset</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-sm font-bold">
                    {tier1Count > 0 && <span style={{ color: tierColor(1) }}>{tier1Count} T1</span>}
                    {tier2Count > 0 && <span style={{ color: tierColor(2) }}>{tier2Count} T2</span>}
                    {tier3Count > 0 && <span style={{ color: tierColor(3) }}>{tier3Count} T3</span>}
                  </div>
                  <div className="text-[10px] text-[var(--color-text-dim)]">By Tier</div>
                </div>
              </div>

              {/* Top 5 allocations */}
              {topAllocations.length > 0 && (
                <div className="border-t border-[var(--color-border)] pt-3">
                  <div className="text-[10px] text-[var(--color-text-dim)] mb-2">Top Allocations:</div>
                  <div className="space-y-1">
                    {topAllocations.map(([symbol, pct]) => {
                      const stock = stocks.find(s => s.symbol === symbol);
                      return (
                        <div key={symbol} className="flex items-center justify-between text-[10px]">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold" style={{ color: tierColor(stock?.tier) }}>{symbol}</span>
                            <span className="text-[var(--color-text-dim)]">{stock?.name}</span>
                          </div>
                          <span className="font-bold text-[var(--color-text-muted)]">
                            {pct}% ({formatMoney(investmentAmount * pct / 100)})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* What's Next */}
            <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-6 mb-6">
              <div className="text-xs text-[var(--color-text-dim)] uppercase tracking-wider mb-3">
                What's Next
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-base">&#128200;</span>
                  <div>
                    <div className="text-[11px] font-bold">Dashboard</div>
                    <div className="text-[10px] text-[var(--color-text-dim)]">See live performance, price changes, and portfolio alerts</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-base">&#128225;</span>
                  <div>
                    <div className="text-[11px] font-bold">Signals Tab</div>
                    <div className="text-[10px] text-[var(--color-text-dim)]">Get buy/sell recommendations based on technicals and your playbook rules</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-base">&#128202;</span>
                  <div>
                    <div className="text-[11px] font-bold">Analysis Tab</div>
                    <div className="text-[10px] text-[var(--color-text-dim)]">Load historical data to unlock full signal analysis, backtesting, and risk metrics</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-base">&#9878;&#65039;</span>
                  <div>
                    <div className="text-[11px] font-bold">Allocations Tab</div>
                    <div className="text-[10px] text-[var(--color-text-dim)]">Fine-tune individual stock weights anytime</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                className="px-6 py-3 rounded-lg font-bold text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--color-text-dim)] transition-colors"
              >
                &larr; Back
              </button>
              <button
                onClick={handleFinish}
                className="px-6 py-3 rounded-lg font-bold text-sm bg-[var(--color-amber-500)] text-black hover:bg-[var(--color-amber-600)] transition-colors"
              >
                Start Investing &rarr;
              </button>
            </div>
          </>
        )}

        <p className="text-[10px] text-[var(--color-text-dim)] text-center mt-8">
          Your portfolio is stored locally in your browser. You can add or remove stocks anytime from the Allocations tab.
        </p>
      </div>
    </div>
  );
}
