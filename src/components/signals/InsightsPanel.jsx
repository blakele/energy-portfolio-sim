import { useSignalsStore } from '../../stores/signalsStore.js';
import { usePortfolioStore } from '../../stores/portfolioStore.js';
import { usePriceStore } from '../../stores/priceStore.js';
import { useFundamentalsStore } from '../../stores/fundamentalsStore.js';
import { STOCKS, getStockBySymbol } from '../../config/portfolio.js';
import { signalColor } from '../../utils/colors.js';

const PRIORITY = { high: '#ef4444', medium: '#f59e0b', low: '#3b82f6', positive: '#22c55e' };

function Insight({ icon, title, body, priority = 'medium', action }) {
  return (
    <div className="flex gap-3 p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)]">
      <div className="text-base mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[11px] font-bold">{title}</span>
          <span
            className="text-[8px] uppercase font-bold px-1.5 py-0.5 rounded"
            style={{ color: PRIORITY[priority], backgroundColor: PRIORITY[priority] + '18' }}
          >
            {priority}
          </span>
        </div>
        <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed">{body}</p>
        {action && (
          <p className="text-[10px] font-medium mt-1" style={{ color: PRIORITY[priority] }}>
            {action}
          </p>
        )}
      </div>
    </div>
  );
}

function generateInsights(signals, technicals, rebalanceData, slTpAlerts, concentrationWarnings, portfolioHealth, quotes, allocations, fundamentals, stopLossConfig) {
  const insights = [];

  // --- STOP-LOSS / TAKE-PROFIT ALERTS (highest priority) ---
  for (const alert of slTpAlerts) {
    const stock = getStockBySymbol(alert.symbol);
    if (alert.type === 'stop-loss') {
      insights.push({
        icon: '\u{1F6A8}',
        title: `${alert.symbol} hit your stop-loss`,
        body: `${stock.name} is at ${alert.currentReturn}% return, past your -${Math.abs(alert.threshold)}% stop-loss. This was set to protect against further downside.`,
        priority: 'high',
        action: `Consider selling ${alert.symbol} to limit losses, or re-evaluate if your thesis still holds.`,
        sort: 0,
      });
    } else {
      insights.push({
        icon: '\u{1F389}',
        title: `${alert.symbol} hit your take-profit`,
        body: `${stock.name} is at +${alert.currentReturn}% return, past your +${alert.threshold}% take-profit target.`,
        priority: 'positive',
        action: `Consider taking partial profits on ${alert.symbol} — selling some shares locks in gains while keeping upside exposure.`,
        sort: 1,
      });
    }
  }

  // --- OVERSOLD OPPORTUNITIES (RSI < 30) ---
  const oversold = STOCKS.filter(s => technicals[s.symbol]?.rsi?.current < 30);
  for (const stock of oversold) {
    const rsi = technicals[stock.symbol].rsi.current;
    const sig = signals[stock.symbol];
    const pe = fundamentals[stock.symbol]?.pe;
    const peNote = pe != null && pe > 0 && pe < 25 ? ' and a reasonable valuation' : '';
    insights.push({
      icon: '\u{1F4C9}',
      title: `${stock.symbol} is oversold (RSI ${rsi.toFixed(0)})`,
      body: `${stock.name} has been heavily sold off recently${peNote}. RSI below 30 often signals a potential bounce. Composite score: ${sig?.score ?? '--'}.`,
      priority: stock.tier <= 2 ? 'medium' : 'low',
      action: stock.tier === 1
        ? `This is a Tier 1 (highest conviction) pick — consider adding to your position if you believe the thesis is intact.`
        : `Research what caused the selloff before buying the dip.`,
      sort: 2,
    });
  }

  // --- OVERBOUGHT WARNINGS (RSI > 70) ---
  const overbought = STOCKS.filter(s => technicals[s.symbol]?.rsi?.current > 70);
  for (const stock of overbought) {
    const rsi = technicals[stock.symbol].rsi.current;
    insights.push({
      icon: '\u{1F4C8}',
      title: `${stock.symbol} is overbought (RSI ${rsi.toFixed(0)})`,
      body: `${stock.name} has rallied hard recently. RSI above 70 means it may be due for a pullback or consolidation.`,
      priority: stock.tier === 3 ? 'medium' : 'low',
      action: stock.tier === 3
        ? `Speculative position — consider trimming if you have large gains. Don't let a winner turn into a loser.`
        : `No rush to sell conviction picks, but avoid adding at these levels. Wait for a pullback.`,
      sort: 3,
    });
  }

  // --- DEATH CROSS ---
  const deathCrosses = STOCKS.filter(s => technicals[s.symbol]?.ma?.cross === 'death');
  for (const stock of deathCrosses) {
    insights.push({
      icon: '\u{2620}\u{FE0F}',
      title: `${stock.symbol} — Death Cross detected`,
      body: `${stock.name}'s 50-day moving average just crossed below its 200-day MA. This is a bearish trend signal that often precedes further downside.`,
      priority: 'high',
      action: `Review your thesis on ${stock.symbol}. If fundamentals haven't changed, this may be noise. If the sector is weakening, consider reducing exposure.`,
      sort: 2,
    });
  }

  // --- GOLDEN CROSS ---
  const goldenCrosses = STOCKS.filter(s => technicals[s.symbol]?.ma?.cross === 'golden');
  for (const stock of goldenCrosses) {
    insights.push({
      icon: '\u{2728}',
      title: `${stock.symbol} — Golden Cross detected`,
      body: `${stock.name}'s 50-day MA just crossed above its 200-day MA. This is a bullish trend confirmation signal.`,
      priority: 'positive',
      action: `Trend is turning bullish. If ${stock.symbol} is underweight in your portfolio, this could be a good time to add.`,
      sort: 3,
    });
  }

  // --- REBALANCE DRIFT ---
  const bigDrifts = rebalanceData.filter(d => Math.abs(d.drift) > 5);
  if (bigDrifts.length > 0) {
    const trimStocks = bigDrifts.filter(d => d.action === 'TRIM');
    const addStocks = bigDrifts.filter(d => d.action === 'ADD');
    let body = `${bigDrifts.length} position${bigDrifts.length > 1 ? 's have' : ' has'} drifted more than 5% from target allocation.`;
    if (trimStocks.length > 0) body += ` Overweight: ${trimStocks.map(d => `${d.symbol} (+${d.drift}%)`).join(', ')}.`;
    if (addStocks.length > 0) body += ` Underweight: ${addStocks.map(d => `${d.symbol} (${d.drift}%)`).join(', ')}.`;
    insights.push({
      icon: '\u{2696}\u{FE0F}',
      title: 'Portfolio needs rebalancing',
      body,
      priority: 'medium',
      action: `Rebalancing means selling some of the overweight winners and buying the underweight positions to get back to your planned allocation. See the Rebalance Drift panel below for exact amounts.`,
      sort: 4,
    });
  }

  // --- CONCENTRATION RISK ---
  const activeWarnings = concentrationWarnings.filter(w => w.warning);
  for (const group of activeWarnings) {
    insights.push({
      icon: '\u{1F517}',
      title: `Correlated group: ${group.stocks.join(', ')}`,
      body: `These stocks move together (avg correlation ${group.avgCorrelation.toFixed(2)}) and combine for ${group.combinedAllocation}% of your portfolio. If one drops, they all likely drop.`,
      priority: 'medium',
      action: `Consider whether you need all of these positions, or if reducing one would improve diversification without sacrificing your thesis.`,
      sort: 5,
    });
  }

  // --- NO STOP-LOSSES SET ---
  const stocksWithoutSL = STOCKS.filter(s =>
    (allocations[s.symbol] || 0) > 0 && !stopLossConfig[s.symbol]
  );
  if (stocksWithoutSL.length > 0 && stocksWithoutSL.length <= STOCKS.length) {
    const tier3NoSL = stocksWithoutSL.filter(s => s.tier === 3);
    if (tier3NoSL.length > 0) {
      insights.push({
        icon: '\u{1F6E1}\u{FE0F}',
        title: `No stop-loss on speculative positions`,
        body: `${tier3NoSL.map(s => s.symbol).join(', ')} ${tier3NoSL.length > 1 ? 'are' : 'is'} Tier 3 (speculative) with no stop-loss set. These carry higher risk.`,
        priority: 'low',
        action: `Set a stop-loss of 15-25% for speculative positions to limit downside. Scroll down to the Stop-Loss section to configure.`,
        sort: 6,
      });
    }
  }

  // --- PORTFOLIO HEALTH SUMMARY ---
  if (portfolioHealth != null) {
    const buyCount = Object.values(signals).filter(s => s.signal === 'BUY').length;
    const sellCount = Object.values(signals).filter(s => s.signal === 'SELL').length;
    const holdCount = Object.values(signals).filter(s => s.signal === 'HOLD').length;

    if (portfolioHealth >= 65) {
      insights.push({
        icon: '\u{2705}',
        title: 'Portfolio outlook is bullish',
        body: `Health score of ${portfolioHealth}/100 with ${buyCount} BUY, ${holdCount} HOLD, and ${sellCount} SELL signal${sellCount !== 1 ? 's' : ''}. Most of your positions are in uptrends with favorable technicals.`,
        priority: 'positive',
        action: `Stay the course. This is a good time to hold and let your winners run. Avoid over-trading.`,
        sort: 7,
      });
    } else if (portfolioHealth < 40) {
      insights.push({
        icon: '\u{26A0}\u{FE0F}',
        title: 'Portfolio outlook is bearish',
        body: `Health score of ${portfolioHealth}/100 with ${sellCount} SELL signal${sellCount !== 1 ? 's' : ''} and only ${buyCount} BUY. Multiple positions are in downtrends or overbought.`,
        priority: 'high',
        action: `Review each SELL-rated position. Consider tightening stop-losses and avoiding new buys until technicals improve.`,
        sort: 4,
      });
    }
  }

  // --- STRONG BUY OPPORTUNITIES (BUY signal + low P/E + Tier 1-2) ---
  const strongBuys = STOCKS.filter(s => {
    const sig = signals[s.symbol];
    const pe = fundamentals[s.symbol]?.pe;
    return sig?.signal === 'BUY' && sig?.score >= 30 && pe != null && pe > 0 && pe < 25 && s.tier <= 2;
  });
  for (const stock of strongBuys) {
    const sig = signals[stock.symbol];
    const pe = fundamentals[stock.symbol].pe;
    insights.push({
      icon: '\u{1F4AA}',
      title: `Strong buy case: ${stock.symbol}`,
      body: `${stock.name} has a BUY signal (score ${sig.score}), reasonable P/E of ${pe.toFixed(1)}, and is Tier ${stock.tier} conviction. Technicals and fundamentals are aligned.`,
      priority: 'positive',
      action: `If you have cash to deploy, ${stock.symbol} is one of the strongest candidates based on your signal criteria.`,
      sort: 3,
    });
  }

  // --- NO INSIGHTS ---
  if (insights.length === 0) {
    insights.push({
      icon: '\u{1F44D}',
      title: 'All clear — no action needed',
      body: 'No extreme signals, drift, or alerts detected. Your portfolio is operating within normal parameters.',
      priority: 'positive',
      action: 'Check back in a few days or after significant market moves.',
      sort: 10,
    });
  }

  return insights.sort((a, b) => a.sort - b.sort);
}

export default function InsightsPanel() {
  const signals = useSignalsStore(s => s.signals);
  const technicals = useSignalsStore(s => s.technicals);
  const rebalanceData = useSignalsStore(s => s.rebalanceData);
  const slTpAlerts = useSignalsStore(s => s.slTpAlerts);
  const concentrationWarnings = useSignalsStore(s => s.concentrationWarnings);
  const portfolioHealth = useSignalsStore(s => s.portfolioHealth);
  const computed = useSignalsStore(s => s.computed);
  const quotes = usePriceStore(s => s.quotes);
  const allocations = usePortfolioStore(s => s.allocations);
  const stopLossConfig = usePortfolioStore(s => s.stopLossConfig);
  const fundamentals = useFundamentalsStore(s => s.metrics);

  const hasQuotes = Object.keys(quotes).length > 0;

  // Generate insights from signals data (if computed) or just quote-based insights
  const insights = computed
    ? generateInsights(signals, technicals, rebalanceData, slTpAlerts, concentrationWarnings, portfolioHealth, quotes, allocations, fundamentals, stopLossConfig)
    : [];

  // Always show quote-based SL/TP alerts even without full signals
  const quotesOnlyInsights = !computed && hasQuotes && slTpAlerts.length > 0
    ? slTpAlerts.map(alert => {
        const stock = getStockBySymbol(alert.symbol);
        return {
          icon: alert.type === 'stop-loss' ? '\u{1F6A8}' : '\u{1F389}',
          title: `${alert.symbol} hit your ${alert.type === 'stop-loss' ? 'stop-loss' : 'take-profit'}`,
          body: `${stock.name} at ${alert.currentReturn}% return.`,
          priority: alert.type === 'stop-loss' ? 'high' : 'positive',
          action: alert.type === 'stop-loss'
            ? `Consider selling to limit losses.`
            : `Consider taking partial profits.`,
        };
      })
    : [];

  const allInsights = insights.length > 0 ? insights : quotesOnlyInsights;

  if (allInsights.length === 0) return null;

  return (
    <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--color-border)]">
        <h3 className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
          Insights & Suggestions
        </h3>
        <p className="text-[10px] text-[var(--color-text-dim)] mt-0.5">
          Data-driven tips based on your current signals, allocations, and thresholds. Not financial advice.
        </p>
      </div>
      <div className="p-4 space-y-2">
        {allInsights.map((insight, i) => (
          <Insight key={i} {...insight} />
        ))}
      </div>
    </div>
  );
}
