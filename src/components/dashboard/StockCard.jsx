import { usePriceStore } from '../../stores/priceStore.js';
import { usePortfolioStore } from '../../stores/portfolioStore.js';
import { useFundamentalsStore } from '../../stores/fundamentalsStore.js';
import { useSignalsStore } from '../../stores/signalsStore.js';
import { formatPrice, formatPct, formatMoney, formatCompact, pctColor } from '../../utils/formatting.js';
import { rsiColor } from '../../utils/colors.js';
import { computeBearScore } from '../../config/riskProfiles.js';
import TierBadge from '../shared/TierBadge.jsx';
import SignalBadge from '../shared/SignalBadge.jsx';
import Tip from '../shared/Tip.jsx';

function peColor(pe) {
  if (pe == null || pe < 0) return '#94a3b8';
  if (pe < 20) return '#22c55e';
  if (pe <= 40) return '#f59e0b';
  return '#ef4444';
}

function peLabel(pe) {
  if (pe == null) return '--';
  if (pe < 0) return 'Neg';
  return pe.toFixed(1);
}

export default function StockCard({ stock }) {
  const quote = usePriceStore(s => s.quotes[stock.symbol]);
  const allocation = usePortfolioStore(s => s.allocations[stock.symbol] || 0);
  const investmentAmount = usePortfolioStore(s => s.investmentAmount);
  const metrics = useFundamentalsStore(s => s.metrics[stock.symbol]);
  const signal = useSignalsStore(s => s.signals[stock.symbol]);
  const technicals = useSignalsStore(s => s.technicals[stock.symbol]);

  const bearScore = computeBearScore(stock.symbol);

  const invested = investmentAmount * (allocation / 100);
  const shares = invested / stock.entryPrice;
  const currentVal = quote ? shares * quote.price : invested;
  const returnPct = quote ? ((quote.price - stock.entryPrice) / stock.entryPrice) * 100 : null;

  return (
    <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-4 hover:border-[var(--color-border-amber)] transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">{stock.icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">{stock.symbol}</span>
              <TierBadge tier={stock.tier} />
              {signal && <SignalBadge signal={signal.signal} />}
              {metrics?.pe != null && metrics.pe > 40 && (
                <span className="text-[9px] px-1 py-0.5 rounded bg-[#ef444420] text-[#ef4444]" title={`P/E: ${metrics.pe.toFixed(1)}`}>
                  !!
                </span>
              )}
              {bearScore != null && (
                <span
                  className="text-[8px] font-bold px-1 py-0.5 rounded"
                  style={{
                    color: bearScore >= 60 ? '#ef4444' : bearScore >= 35 ? '#f59e0b' : '#22c55e',
                    backgroundColor: (bearScore >= 60 ? '#ef4444' : bearScore >= 35 ? '#f59e0b' : '#22c55e') + '18',
                  }}
                  title={`Bear case risk: ${bearScore}/100`}
                >
                  R:{bearScore}
                </span>
              )}
            </div>
            <div className="text-[10px] text-[var(--color-text-dim)]">{stock.name}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold">
            {quote ? formatPrice(quote.price) : '--'}
          </div>
          {quote && (
            <div className="text-[11px]" style={{ color: pctColor(quote.changePercent) }}>
              {formatPct(quote.changePercent)}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-[10px]">
        <div>
          <div className="text-[var(--color-text-dim)]"><Tip>Entry</Tip></div>
          <div>{formatPrice(stock.entryPrice)}</div>
        </div>
        <div>
          <div className="text-[var(--color-text-dim)]"><Tip>Return</Tip></div>
          <div style={{ color: pctColor(returnPct) }}>
            {returnPct != null ? formatPct(returnPct) : '--'}
          </div>
        </div>
        <div>
          <div className="text-[var(--color-text-dim)]"><Tip>Value</Tip></div>
          <div>{formatMoney(currentVal)}</div>
        </div>
      </div>

      {/* Fundamentals row */}
      <div className="grid grid-cols-3 gap-2 text-[10px] mt-2">
        <div>
          <div className="text-[var(--color-text-dim)]"><Tip>P/E</Tip></div>
          <div style={{ color: peColor(metrics?.pe) }}>
            {peLabel(metrics?.pe)}
          </div>
        </div>
        <div>
          <div className="text-[var(--color-text-dim)]"><Tip>Div Yield</Tip></div>
          <div style={{ color: metrics?.dividendYield > 0 ? '#22c55e' : '#94a3b8' }}>
            {metrics?.dividendYield != null ? metrics.dividendYield.toFixed(2) + '%' : '--'}
          </div>
        </div>
        <div>
          <div className="text-[var(--color-text-dim)]"><Tip>Mkt Cap</Tip></div>
          <div>
            {metrics?.marketCap != null ? formatCompact(metrics.marketCap * 1e6) : '--'}
          </div>
        </div>
      </div>

      {/* Signal indicators row */}
      {technicals && (
        <div className="grid grid-cols-3 gap-2 text-[10px] mt-2">
          <div>
            <div className="text-[var(--color-text-dim)]"><Tip>RSI(14)</Tip></div>
            <div style={{ color: rsiColor(technicals.rsi?.current) }}>
              {technicals.rsi?.current != null ? technicals.rsi.current.toFixed(1) : '--'}
            </div>
          </div>
          <div>
            <div className="text-[var(--color-text-dim)]"><Tip>MA Status</Tip></div>
            <div style={{ color: technicals.ma?.aboveSma50 ? '#22c55e' : '#ef4444' }}>
              {technicals.ma?.aboveSma50 ? 'Above' : 'Below'} 50d
            </div>
          </div>
          <div>
            <div className="text-[var(--color-text-dim)]"><Tip>Score</Tip></div>
            <div style={{ color: signal?.score > 20 ? '#22c55e' : signal?.score < -20 ? '#ef4444' : '#f59e0b' }}>
              {signal?.score != null ? signal.score : '--'}
            </div>
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 h-1 bg-[rgba(255,255,255,0.04)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(allocation, 100)}%`,
              backgroundColor: `var(--color-tier${stock.tier})`,
            }}
          />
        </div>
        <span className="text-[10px] text-[var(--color-text-muted)] w-8 text-right">
          {allocation}%
        </span>
      </div>
    </div>
  );
}
