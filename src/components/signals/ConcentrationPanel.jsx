import { useSignalsStore } from '../../stores/signalsStore.js';
import { usePortfolioStore } from '../../stores/portfolioStore.js';
import { tierColor, tierBg } from '../../utils/colors.js';
import { formatMoney } from '../../utils/formatting.js';
import Tip from '../shared/Tip.jsx';

function generateGroupAction(group, stocks, allocations, signals, investmentAmount, computed) {
  const groupStocks = group.stocks.map(sym => {
    const stock = stocks.find(s => s.symbol === sym);
    const alloc = allocations[sym] || 0;
    const sig = computed && signals[sym] ? signals[sym] : null;
    return { symbol: sym, tier: stock?.tier ?? 2, alloc, signal: sig?.signal, score: sig?.score ?? 0 };
  });

  // Sort by trim priority: highest tier number first (T3 > T2 > T1),
  // then worst signal first (SELL > HOLD > BUY), then largest allocation first
  const signalRank = { SELL: 0, HOLD: 1, BUY: 2 };
  const trimCandidates = [...groupStocks].sort((a, b) => {
    const tierDiff = b.tier - a.tier; // prefer trimming higher tier number (lower conviction)
    if (tierDiff !== 0) return tierDiff;
    const sigDiff = (signalRank[a.signal] ?? 1) - (signalRank[b.signal] ?? 1); // prefer trimming SELL
    if (sigDiff !== 0) return sigDiff;
    return b.alloc - a.alloc; // prefer trimming larger position
  });

  if (!group.warning) {
    return {
      level: 'ok',
      text: 'Combined allocation is within safe range. No action needed.',
      trimTarget: null,
    };
  }

  const excessPct = Math.round((group.combinedAllocation - 30) * 10) / 10;
  const excessDollars = Math.round(investmentAmount * (excessPct / 100));
  const topTrim = trimCandidates[0];

  const reasons = [];
  if (topTrim.tier === 3) reasons.push('Tier 3 (speculative)');
  else if (topTrim.tier === 2) reasons.push('Tier 2');
  if (topTrim.signal === 'SELL') reasons.push('SELL signal');
  else if (topTrim.signal === 'HOLD' && computed) reasons.push('HOLD signal');
  if (topTrim.alloc >= Math.max(...groupStocks.map(s => s.alloc))) reasons.push('largest position');

  const reasonStr = reasons.length > 0 ? ` (${reasons.join(', ')})` : '';

  let text;
  if (trimCandidates.length === 2) {
    text = `Trim ${topTrim.symbol}${reasonStr} by ~${excessPct}% (${formatMoney(excessDollars)}) to bring the group below 30%.`;
  } else {
    const altTrim = trimCandidates[1];
    text = `Trim ${topTrim.symbol}${reasonStr} by ~${excessPct}% (${formatMoney(excessDollars)}), or spread the reduction across ${topTrim.symbol} and ${altTrim.symbol}.`;
  }

  return { level: 'action', text, trimTarget: topTrim.symbol };
}

export default function ConcentrationPanel() {
  const concentrationWarnings = useSignalsStore(s => s.concentrationWarnings);
  const signals = useSignalsStore(s => s.signals);
  const computed = useSignalsStore(s => s.computed);
  const stocks = usePortfolioStore(s => s.stocks);
  const allocations = usePortfolioStore(s => s.allocations);
  const investmentAmount = usePortfolioStore(s => s.investmentAmount);

  if (concentrationWarnings.length === 0) return null;

  return (
    <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--color-border)]">
        <h3 className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
          <Tip>Correlation Concentration</Tip>
        </h3>
        <p className="text-[10px] text-[var(--color-text-dim)] mt-0.5">
          Groups of stocks that move together (correlation &gt;0.7). Combined allocation &gt;30% means a single downturn could hit multiple positions hard.
        </p>
      </div>
      <div className="p-4 space-y-3">
        {concentrationWarnings.map((group, i) => {
          const action = generateGroupAction(group, stocks, allocations, signals, investmentAmount, computed);
          return (
            <div
              key={i}
              className="p-3 rounded-lg"
              style={{
                backgroundColor: group.warning ? '#ef444410' : 'rgba(255,255,255,0.02)',
                border: group.warning ? '1px solid #ef444430' : '1px solid transparent',
              }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap gap-1 mb-1">
                    {group.stocks.map(sym => {
                      const stock = stocks.find(s => s.symbol === sym);
                      const tier = stock?.tier;
                      return (
                        <span
                          key={sym}
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1"
                          style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                        >
                          {sym}
                          <span
                            className="text-[7px] font-bold px-0.5 rounded"
                            style={{ color: tierColor(tier), backgroundColor: tierBg(tier) }}
                          >
                            T{tier}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                  <div className="text-[10px] text-[var(--color-text-dim)]">
                    Avg correlation: <span className="font-mono">{group.avgCorrelation.toFixed(2)}</span>
                    <span className="text-[var(--color-text-dim)] ml-2">
                      — these stocks tend to rise and fall together
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div
                    className="text-sm font-bold"
                    style={{ color: group.warning ? '#ef4444' : '#22c55e' }}
                  >
                    {group.combinedAllocation}%
                  </div>
                  <div className="text-[9px] text-[var(--color-text-dim)]">combined</div>
                  {group.warning && (
                    <div className="text-[9px] text-[#ef4444] font-medium mt-0.5">
                      Concentrated
                    </div>
                  )}
                </div>
              </div>

              {/* Action recommendation */}
              <div
                className="mt-2 text-[9px] px-2 py-1.5 rounded"
                style={{
                  color: action.level === 'action' ? '#f59e0b' : '#22c55e',
                  backgroundColor: action.level === 'action' ? '#f59e0b10' : '#22c55e10',
                }}
              >
                <span className="font-bold uppercase mr-1">
                  {action.level === 'action' ? 'Action:' : 'Status:'}
                </span>
                {action.text}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
