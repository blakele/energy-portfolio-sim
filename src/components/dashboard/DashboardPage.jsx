import PortfolioSummary from './PortfolioSummary.jsx';
import StockGrid from './StockGrid.jsx';
import PerformanceChart from './PerformanceChart.jsx';
import { useFundamentalsStore } from '../../stores/fundamentalsStore.js';
import { usePriceStore } from '../../stores/priceStore.js';
import { useSignalsStore } from '../../stores/signalsStore.js';

export default function DashboardPage() {
  // Signals state
  const rebalanceData = useSignalsStore(s => s.rebalanceData);
  const slTpAlerts = useSignalsStore(s => s.slTpAlerts);
  const concentrationWarnings = useSignalsStore(s => s.concentrationWarnings);

  const driftAlerts = rebalanceData.filter(d => Math.abs(d.drift) > 5);
  const activeConcentrationWarnings = concentrationWarnings.filter(w => w.warning);

  // Fundamentals error state
  const fundErrors = useFundamentalsStore(s => s.errors);
  const fundMetrics = useFundamentalsStore(s => s.metrics);
  const fundLoading = useFundamentalsStore(s => s.loading);

  const fundErrorList = Object.entries(fundErrors);
  const hasFundMetrics = Object.keys(fundMetrics).length > 0;
  const showFundError = fundErrorList.length > 0 && !hasFundMetrics && !fundLoading;

  // Quote error state
  const quoteErrors = usePriceStore(s => s.errors);
  const quotes = usePriceStore(s => s.quotes);
  const quoteLoading = usePriceStore(s => s.loading);

  const quoteErrorList = Object.entries(quoteErrors);
  const hasQuotes = Object.keys(quotes).length > 0;
  const showQuoteError = quoteErrorList.length > 0 && !hasQuotes && !quoteLoading;

  return (
    <div className="space-y-6">
      {showQuoteError && (
        <div className="bg-[#ef444410] border border-[#ef444440] rounded-lg px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[#ef4444] text-sm">&#9888;</span>
            <span className="text-xs font-medium text-[#ef4444]">Quotes Unavailable</span>
          </div>
          <p className="text-[10px] text-[var(--color-text-dim)]">
            Could not load stock prices from Finnhub.{' '}
            {quoteErrorList[0]?.[1]?.includes('Rate limited') ? (
              <span>Rate limited by Finnhub (60 calls/min) — wait 60 seconds and click Refresh.</span>
            ) : quoteErrorList[0]?.[1]?.includes('No API key') ? (
              <span>No API key found. Click the gear icon to enter your Finnhub key.</span>
            ) : (
              <span>Error: {quoteErrorList[0]?.[1]}. Try clicking Refresh.</span>
            )}
          </p>
        </div>
      )}
      {showFundError && (
        <div className="bg-[#ef444410] border border-[#ef444440] rounded-lg px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[#ef4444] text-sm">&#9888;</span>
            <span className="text-xs font-medium text-[#ef4444]">Fundamentals Unavailable</span>
          </div>
          <p className="text-[10px] text-[var(--color-text-dim)]">
            Could not load P/E, dividend, and market cap data.{' '}
            {fundErrorList[0]?.[1]?.includes('403') ? (
              <span>Access denied — try the Refresh button.</span>
            ) : fundErrorList[0]?.[1]?.includes('429') || fundErrorList[0]?.[1]?.includes('Rate limited') ? (
              <span>Rate limited — wait a moment and click Refresh.</span>
            ) : (
              <span>Error: {fundErrorList[0]?.[1]}. Try the Refresh button.</span>
            )}
          </p>
        </div>
      )}
      {/* Stop-loss / take-profit alerts */}
      {slTpAlerts.length > 0 && (
        <div className="bg-[#ef444410] border border-[#ef444440] rounded-lg px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[#ef4444] text-sm">&#9888;</span>
            <span className="text-xs font-medium text-[#ef4444]">
              {slTpAlerts.length} Stop-Loss/Take-Profit Alert{slTpAlerts.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-1">
            {slTpAlerts.map(a => (
              <p key={a.symbol} className="text-[10px] text-[var(--color-text-dim)]">
                <span className="font-bold text-[var(--color-text)]">{a.symbol}</span>
                {' '}{a.type === 'stop-loss' ? 'hit stop-loss' : 'hit take-profit'} at{' '}
                <span style={{ color: a.currentReturn >= 0 ? '#22c55e' : '#ef4444' }}>
                  {a.currentReturn >= 0 ? '+' : ''}{a.currentReturn}%
                </span>
                {' '}(threshold: {a.threshold >= 0 ? '+' : ''}{a.threshold}%)
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Rebalance drift alerts */}
      {driftAlerts.length > 0 && (
        <div className="bg-[#f59e0b10] border border-[#f59e0b40] rounded-lg px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[#f59e0b] text-sm">&#9878;</span>
            <span className="text-xs font-medium text-[#f59e0b]">
              Rebalance Needed — {driftAlerts.length} position{driftAlerts.length !== 1 ? 's' : ''} drifted &gt;5%
            </span>
          </div>
          <p className="text-[10px] text-[var(--color-text-dim)]">
            {driftAlerts.map(d => `${d.symbol} (${d.drift > 0 ? '+' : ''}${d.drift}%)`).join(', ')}
            {' '}— See Signals tab for details.
          </p>
        </div>
      )}

      {/* Concentration warnings */}
      {activeConcentrationWarnings.length > 0 && (
        <div className="bg-[#8b5cf610] border border-[#8b5cf640] rounded-lg px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[#8b5cf6] text-sm">&#9888;</span>
            <span className="text-xs font-medium text-[#8b5cf6]">
              Correlation Concentration Risk
            </span>
          </div>
          <div className="space-y-1">
            {activeConcentrationWarnings.map((w, i) => (
              <p key={i} className="text-[10px] text-[var(--color-text-dim)]">
                {w.stocks.join(', ')} — avg correlation {w.avgCorrelation.toFixed(2)}, combined allocation {w.combinedAllocation}%
              </p>
            ))}
          </div>
        </div>
      )}

      <PortfolioSummary />
      <PerformanceChart />
      <StockGrid />
    </div>
  );
}
