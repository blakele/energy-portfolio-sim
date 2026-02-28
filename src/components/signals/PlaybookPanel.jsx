import { usePortfolioStore } from '../../stores/portfolioStore.js';
import { usePriceStore } from '../../stores/priceStore.js';
import { useSignalsStore } from '../../stores/signalsStore.js';
import { TARGET_ALLOCATIONS, EXIT_RULES } from '../../config/playbook.js';
import { tierColor, tierBg } from '../../utils/colors.js';
import { formatPrice, formatPct } from '../../utils/formatting.js';

function statusColor(status) {
  if (status === 'BUY_ZONE') return '#22c55e';
  if (status === 'STRONG_BUY') return '#10b981';
  if (status === 'TRIM') return '#f59e0b';
  if (status === 'TAKE_PROFIT') return '#f59e0b';
  if (status === 'STOP_HIT') return '#ef4444';
  if (status === 'FLOOR_HIT') return '#ef4444';
  if (status === 'OVERVALUED') return '#ef4444';
  return '#94a3b8';
}

function statusLabel(status) {
  if (status === 'BUY_ZONE') return 'BUY ZONE';
  if (status === 'STRONG_BUY') return 'STRONG BUY';
  if (status === 'TRIM') return 'OVERWEIGHT';
  if (status === 'TAKE_PROFIT') return 'TAKE PROFIT';
  if (status === 'STOP_HIT') return 'STOP HIT';
  if (status === 'FLOOR_HIT') return 'FLOOR HIT';
  if (status === 'OVERVALUED') return 'P/E CEILING';
  return 'HOLD';
}

function evaluateStock(symbol, stock, quote, allocation, effectiveTarget, adjustments) {
  const rules = EXIT_RULES[symbol];
  if (!rules || !quote) return { status: 'HOLD', alerts: [], action: rules?.action || null };

  const price = quote.price;
  const alerts = [];
  let status = 'HOLD';

  // Effective allocation adjustments drive status (floor, ceiling, trailing, etc.)
  const hasAdjustments = adjustments?.length > 0;
  if (hasAdjustments) {
    for (const adj of adjustments) {
      const r = adj.reason.toLowerCase();
      if (r.includes('hard floor')) {
        status = 'FLOOR_HIT';
      } else if (r.includes('trailing stop') && status === 'HOLD') {
        status = 'STOP_HIT';
      } else if (r.includes('ceiling') && status === 'HOLD') {
        status = 'OVERVALUED';
      } else if (r.includes('take-profit') && status === 'HOLD') {
        status = 'TAKE_PROFIT';
      }
    }
  }

  // Check buy zones (not covered by effective allocations)
  const buyZone = rules.buyZone;
  if (buyZone?.strongBuy && price <= buyZone.strongBuy) {
    alerts.push({ level: 'bullish', text: `In STRONG BUY zone (below ${formatPrice(buyZone.strongBuy)})` });
    if (status === 'HOLD') status = 'STRONG_BUY';
  } else if (buyZone?.below && price <= buyZone.below) {
    alerts.push({ level: 'bullish', text: `In buy zone (below ${formatPrice(buyZone.below)})` });
    if (status === 'HOLD') status = 'BUY_ZONE';
  }

  // Check allocation drift vs effective target
  const target = effectiveTarget != null ? effectiveTarget : (allocation || 0);
  if (allocation > target + 5) {
    alerts.push({ level: 'info', text: `${(allocation - target).toFixed(1)}% overweight vs. ${target.toFixed(1)}% effective target — consider trimming` });
    if (status === 'HOLD') status = 'TRIM';
  } else if (allocation < target - 5) {
    alerts.push({ level: 'info', text: `${(target - allocation).toFixed(1)}% underweight vs. ${target.toFixed(1)}% effective target` });
  }

  return { status, alerts, action: rules.action };
}

function StockPlaybookRow({ stock }) {
  const quote = usePriceStore(s => s.quotes[stock.symbol]);
  const allocation = usePortfolioStore(s => s.allocations[stock.symbol] || 0);
  const effectiveTarget = useSignalsStore(s => s.effectiveAllocations[stock.symbol]);
  const adjustments = useSignalsStore(s => s.allocationAdjustments[stock.symbol]);
  const rules = EXIT_RULES[stock.symbol];
  const target = TARGET_ALLOCATIONS[stock.symbol] || 0;

  if (!rules) return null;

  const { status, alerts, action } = evaluateStock(stock.symbol, stock, quote, allocation, effectiveTarget, adjustments);
  const color = statusColor(status);
  const price = quote?.price;
  const gainFromEntry = price ? ((price - stock.entryPrice) / stock.entryPrice) * 100 : null;

  const hasEffective = effectiveTarget != null;
  const isReduced = hasEffective && effectiveTarget < target;
  const displayEffective = hasEffective ? Math.round(effectiveTarget * 100) / 100 : target;
  // For bar coloring, compare against effective target (what you should hold now)
  const colorTarget = hasEffective ? effectiveTarget : target;

  return (
    <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold">{stock.symbol}</span>
          <span
            className="text-[8px] font-bold px-1 py-0.5 rounded"
            style={{ color: tierColor(stock.tier), backgroundColor: tierBg(stock.tier) }}
          >
            T{stock.tier}
          </span>
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded"
            style={{ color, backgroundColor: color + '18' }}
          >
            {statusLabel(status)}
          </span>
          {isReduced && (
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-[#f59e0b18] text-[#f59e0b]">
              Eff. {displayEffective}%
            </span>
          )}
        </div>
        <div className="text-right text-[10px]">
          <span className="text-[var(--color-text-muted)]">
            {price ? formatPrice(price) : '--'}
          </span>
          {gainFromEntry != null && (
            <span
              className="ml-2"
              style={{ color: gainFromEntry >= 0 ? '#22c55e' : '#ef4444' }}
            >
              {formatPct(gainFromEntry)} from entry
            </span>
          )}
        </div>
      </div>

      {/* Allocation bar: base target (dashed) + effective target (solid) + actual */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 relative h-4">
          <div className="absolute inset-0 bg-[rgba(255,255,255,0.04)] rounded" />
          {/* Base target marker (dashed) */}
          <div
            className="absolute top-0 h-full border-r-2 border-dashed"
            style={{ left: `${Math.min(target, 100)}%`, borderColor: '#94a3b8' }}
            title={`Base target: ${target}%`}
          />
          {/* Effective target marker (solid amber, only when reduced) */}
          {isReduced && (
            <div
              className="absolute top-0 h-full border-r-2"
              style={{ left: `${Math.min(displayEffective, 100)}%`, borderColor: '#f59e0b' }}
              title={`Effective target: ${displayEffective}%`}
            />
          )}
          {/* Actual allocation */}
          <div
            className="absolute top-0 h-full rounded transition-all"
            style={{
              width: `${Math.min(allocation, 100)}%`,
              backgroundColor: (allocation > colorTarget + 5 ? '#f59e0b' : allocation < colorTarget - 5 ? '#3b82f6' : '#22c55e') + '40',
            }}
          />
          <span className="absolute inset-0 flex items-center px-2 text-[9px] font-mono text-[var(--color-text-muted)]">
            {allocation}% / {target}% target{isReduced ? ` (eff. ${displayEffective}%)` : ''}
          </span>
        </div>
      </div>

      {/* Effective allocation adjustment reasons */}
      {isReduced && adjustments?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1.5">
          {adjustments.map((adj, i) => (
            <span
              key={i}
              className="text-[8px] px-1.5 py-0.5 rounded bg-[#f59e0b12] text-[#f59e0b]"
            >
              {adj.reason}
            </span>
          ))}
        </div>
      )}

      {/* Buy zone / floor indicators */}
      <div className="flex flex-wrap gap-2 text-[9px] mb-1.5">
        {rules.buyZone?.below && (
          <span className="px-1.5 py-0.5 rounded bg-[rgba(34,197,94,0.1)] text-[#22c55e]">
            Buy &lt;{formatPrice(rules.buyZone.below)}
          </span>
        )}
        {rules.buyZone?.strongBuy && (
          <span className="px-1.5 py-0.5 rounded bg-[rgba(16,185,129,0.1)] text-[#10b981]">
            Strong &lt;{formatPrice(rules.buyZone.strongBuy)}
          </span>
        )}
        {rules.hardFloor && (
          <span className="px-1.5 py-0.5 rounded bg-[rgba(239,68,68,0.1)] text-[#ef4444]">
            Floor {formatPrice(rules.hardFloor)}
          </span>
        )}
        {rules.valuationCeiling && (
          <span className="px-1.5 py-0.5 rounded bg-[rgba(245,158,11,0.1)] text-[#f59e0b]">
            P/E cap {rules.valuationCeiling}x
          </span>
        )}
        {rules.trailingStopPct && (
          <span className="px-1.5 py-0.5 rounded bg-[rgba(239,68,68,0.08)] text-[var(--color-text-dim)]">
            Trail -{rules.trailingStopPct}%
          </span>
        )}
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-1 mt-1.5">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className="text-[9px] px-2 py-1 rounded"
              style={{
                color: alert.level === 'critical' ? '#ef4444' :
                  alert.level === 'warning' ? '#f59e0b' :
                  alert.level === 'bullish' ? '#22c55e' : 'var(--color-text-muted)',
                backgroundColor: alert.level === 'critical' ? '#ef444412' :
                  alert.level === 'warning' ? '#f59e0b12' :
                  alert.level === 'bullish' ? '#22c55e12' : 'rgba(255,255,255,0.03)',
              }}
            >
              {alert.text}
            </div>
          ))}
        </div>
      )}

      {/* Action note */}
      {action && (
        <div className="text-[9px] text-[var(--color-text-dim)] mt-1.5 italic">
          {action}
        </div>
      )}
    </div>
  );
}

export default function PlaybookPanel() {
  const stocks = usePortfolioStore(s => s.stocks);
  const allocations = usePortfolioStore(s => s.allocations);
  const suggestedCashPct = useSignalsStore(s => s.suggestedCashPct);

  const activeStocks = stocks.filter(s => EXIT_RULES[s.symbol]);

  if (activeStocks.length === 0) return null;

  // Count alerts across all stocks
  const allQuotes = usePriceStore(s => s.quotes);
  const allEffective = useSignalsStore(s => s.effectiveAllocations);
  const allAdjustments = useSignalsStore(s => s.allocationAdjustments);
  let criticalCount = 0;
  let actionCount = 0;
  for (const stock of activeStocks) {
    const { status, alerts } = evaluateStock(
      stock.symbol, stock, allQuotes[stock.symbol],
      allocations[stock.symbol] || 0,
      allEffective[stock.symbol],
      allAdjustments[stock.symbol]
    );
    if (status === 'FLOOR_HIT' || status === 'STOP_HIT') criticalCount++;
    if (alerts.length > 0 || allAdjustments[stock.symbol]?.length > 0) actionCount++;
  }

  return (
    <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--color-border)]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
              Investment Playbook
            </h3>
            <p className="text-[10px] text-[var(--color-text-dim)] mt-0.5">
              Target allocations, buy zones, and position alerts. Dashed line = base target. Solid amber line = effective target (market-adjusted).
            </p>
          </div>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#ef444418] text-[#ef4444]">
                {criticalCount} CRITICAL
              </span>
            )}
            {actionCount > 0 && (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#f59e0b18] text-[#f59e0b]">
                {actionCount} alerts
              </span>
            )}
            {suggestedCashPct > 0 && (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#3b82f618] text-[#3b82f6]">
                +{suggestedCashPct.toFixed(1)}% cash
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {activeStocks.map(stock => (
          <StockPlaybookRow key={stock.symbol} stock={stock} />
        ))}
      </div>

      <div className="px-4 pb-3 space-y-2">
        <div className="border-t border-[var(--color-border)] pt-2">
          <div className="text-[9px] text-[var(--color-text-dim)] font-bold uppercase tracking-wider mb-1.5">Term Definitions</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
            <div className="text-[9px]">
              <span className="font-bold text-[#22c55e]">Buy Zone</span>
              <span className="text-[var(--color-text-dim)]"> — Price below which the stock is attractive to add to your position.</span>
            </div>
            <div className="text-[9px]">
              <span className="font-bold text-[#10b981]">Strong Buy</span>
              <span className="text-[var(--color-text-dim)]"> — Price below which the stock is aggressively undervalued. Strongest conviction to add.</span>
            </div>
            <div className="text-[9px]">
              <span className="font-bold text-[#ef4444]">Floor</span>
              <span className="text-[var(--color-text-dim)]"> — Hard price floor. If the stock drops to or below this, sell 100% to prevent catastrophic loss.</span>
            </div>
            <div className="text-[9px]">
              <span className="font-bold text-[#f59e0b]">P/E Cap</span>
              <span className="text-[var(--color-text-dim)]"> — Price-to-earnings ceiling. If P/E exceeds this, the stock is overvalued — trim to half position.</span>
            </div>
            <div className="text-[9px]">
              <span className="font-bold text-[var(--color-text-muted)]">Trail</span>
              <span className="text-[var(--color-text-dim)]"> — Trailing stop %. If the stock drops this far from its 52-week high, sell half to protect gains.</span>
            </div>
            <div className="text-[9px]">
              <span className="font-bold text-[#f59e0b]">Take Profit</span>
              <span className="text-[var(--color-text-dim)]"> — Price target where you trim a set % to lock in gains while keeping upside exposure.</span>
            </div>
          </div>
        </div>
        <p className="text-[8px] text-[var(--color-text-dim)] italic">
          Based on INVESTMENT_PLAYBOOK.md rules. Exit triggers are guidelines, not automatic — review context before acting.
        </p>
      </div>
    </div>
  );
}
