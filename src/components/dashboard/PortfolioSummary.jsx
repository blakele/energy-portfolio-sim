import { usePriceStore } from '../../stores/priceStore.js';
import { usePortfolioStore } from '../../stores/portfolioStore.js';
import { useFundamentalsStore } from '../../stores/fundamentalsStore.js';
import { useSignalsStore } from '../../stores/signalsStore.js';
import { usePortfolio } from '../../hooks/usePortfolio.js';
import { formatMoney, formatPct, pctColor } from '../../utils/formatting.js';
import { healthColor } from '../../utils/colors.js';
import MetricCard from '../shared/MetricCard.jsx';

export default function PortfolioSummary() {
  const quotes = usePriceStore(s => s.quotes);
  const { allocations, investmentAmount } = usePortfolioStore();
  const allMetrics = useFundamentalsStore(s => s.metrics);
  const portfolioHealth = useSignalsStore(s => s.portfolioHealth);
  const { stocks, benchmark } = usePortfolio();

  let totalValue = 0;
  let totalDailyPL = 0;
  let totalAllocUsed = 0;
  let weightedPE = 0;
  let peWeightTotal = 0;
  let annualDividendIncome = 0;
  let weightedDivYield = 0;
  let divYieldWeightTotal = 0;
  let stretchedCount = 0;

  for (const stock of stocks) {
    const alloc = (allocations[stock.symbol] || 0) / 100;
    const quote = quotes[stock.symbol];
    if (!quote || alloc === 0) continue;

    const invested = investmentAmount * alloc;
    const shares = invested / stock.entryPrice;
    const currentVal = shares * quote.price;
    const dailyChange = shares * (quote.change || 0);

    totalValue += currentVal;
    totalDailyPL += dailyChange;
    totalAllocUsed += alloc;

    const m = allMetrics[stock.symbol];
    if (m?.pe != null && m.pe > 0) {
      weightedPE += m.pe * alloc;
      peWeightTotal += alloc;
    }
    if (m?.dividendPerShare != null && m.dividendPerShare > 0) {
      annualDividendIncome += shares * m.dividendPerShare;
    }
    if (m?.dividendYield != null && m.dividendYield > 0) {
      weightedDivYield += m.dividendYield * alloc;
      divYieldWeightTotal += alloc;
    }
    if (m?.pe != null && m.pe > 40) {
      stretchedCount++;
    }
  }

  const avgPE = peWeightTotal > 0 ? weightedPE / peWeightTotal : null;
  const portfolioYield = divYieldWeightTotal > 0 ? weightedDivYield / divYieldWeightTotal : null;

  if (totalAllocUsed > 0 && totalAllocUsed < 0.99) {
    totalValue = totalValue / totalAllocUsed;
    totalDailyPL = totalDailyPL / totalAllocUsed;
  }

  const totalReturn = totalAllocUsed > 0
    ? ((totalValue - investmentAmount) / investmentAmount) * 100
    : null;

  const spyQuote = quotes[benchmark.symbol];
  const spyReturn = spyQuote
    ? ((spyQuote.price - benchmark.entryPrice) / benchmark.entryPrice) * 100
    : null;

  const alpha = (totalReturn != null && spyReturn != null)
    ? totalReturn - spyReturn
    : null;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Portfolio Value"
          value={totalAllocUsed > 0 ? formatMoney(totalValue) : '--'}
          sub={`Invested: ${formatMoney(investmentAmount)}`}
        />
        <MetricCard
          label="Total Return"
          value={totalReturn != null ? formatPct(totalReturn) : '--'}
          color={pctColor(totalReturn)}
          sub={`${benchmark.symbol}: ${spyReturn != null ? formatPct(spyReturn) : '--'}`}
        />
        <MetricCard
          label="Daily P&L"
          value={totalDailyPL !== 0 ? (totalDailyPL > 0 ? '+' : '') + formatMoney(totalDailyPL) : '--'}
          color={pctColor(totalDailyPL)}
        />
        <MetricCard
          label={`Alpha vs ${benchmark.symbol}`}
          value={alpha != null ? formatPct(alpha) : '--'}
          color={pctColor(alpha)}
          sub={`Excess return over ${benchmark.name}`}
        />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Wtd Avg P/E"
          value={avgPE != null ? avgPE.toFixed(1) : '--'}
          color={avgPE == null ? undefined : avgPE < 20 ? '#22c55e' : avgPE <= 40 ? '#f59e0b' : '#ef4444'}
          sub="Portfolio weighted"
        />
        <MetricCard
          label="Annual Dividends"
          value={annualDividendIncome > 0 ? formatMoney(annualDividendIncome) : '--'}
          color={annualDividendIncome > 0 ? '#22c55e' : undefined}
          sub={annualDividendIncome > 0 ? `${((annualDividendIncome / investmentAmount) * 100).toFixed(2)}% yield on cost` : 'No dividend data'}
        />
        <MetricCard
          label="Portfolio Yield"
          value={portfolioYield != null ? portfolioYield.toFixed(2) + '%' : '--'}
          color={portfolioYield > 0 ? '#22c55e' : undefined}
          sub="Weighted dividend yield"
        />
        <MetricCard
          label="Valuation Alert"
          value={stretchedCount > 0 ? `${stretchedCount} stretched` : 'All clear'}
          color={stretchedCount > 0 ? '#ef4444' : '#22c55e'}
          sub="Holdings with P/E > 40"
        />
        <MetricCard
          label="Signal Health"
          value={portfolioHealth != null ? portfolioHealth : '--'}
          color={healthColor(portfolioHealth)}
          sub={portfolioHealth != null
            ? portfolioHealth >= 65 ? 'Bullish signals' : portfolioHealth >= 40 ? 'Mixed signals' : 'Bearish signals'
            : 'Load history to compute'}
        />
      </div>
    </div>
  );
}
