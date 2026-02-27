/**
 * Plain-English tooltip definitions for investing terms and metrics.
 * Used by the <Tip> component to show hover explanations and the Glossary page.
 */
export const TOOLTIPS = {
  // Portfolio metrics
  'Portfolio Value': 'The current total market value of all your holdings based on live prices and your allocation percentages.',
  'Total Return': 'The overall percentage gain or loss on your portfolio since your entry prices. Positive = you\'re up, negative = you\'re down.',
  'Daily P&L': 'Profit & Loss — how much your portfolio gained or lost today in dollar terms. Green = gained, red = lost.',
  'Alpha vs SPY': 'How much you beat (or trailed) the market. If SPY returned 10% and you returned 15%, your alpha is +5%. Positive = outperforming, negative = the market is beating you.',
  'Wtd Avg P/E': 'Weighted Average Price-to-Earnings — the average P/E across your holdings, weighted by allocation. Lower generally means your portfolio is cheaper valued. Above 30 = expensive, below 20 = reasonable.',
  'Annual Dividends': 'The estimated total cash you\'d receive in a year from dividend payments, based on current rates and your share counts. This is passive income — you get paid just for holding.',
  'Portfolio Yield': 'The weighted average dividend yield across your holdings — the percentage of your investment returned as cash dividends each year. A 3% yield on $100K = $3,000/year.',
  'Valuation Alert': 'Counts how many of your holdings have a P/E ratio above 40, which may indicate stretched (expensive) valuations. These stocks need strong growth to justify their price.',
  'Signal Health': 'A composite score from 0–100 summarizing the overall technical outlook. Based on RSI, moving averages, drawdowns, valuations, and volume. Above 65 = bullish, below 40 = bearish, between = mixed.',

  // Stock card metrics
  'P/E': 'Price-to-Earnings ratio — how much you pay per $1 of a company\'s annual profit. P/E of 20 = $20 per $1 of earnings. Lower = cheaper, higher = investors expect big growth. Negative = company is losing money.',
  'Div Yield': 'Dividend Yield — the annual cash payment as a percentage of the stock price. A 3% yield on a $100 stock = $3/year per share in passive income.',
  'Mkt Cap': 'Market Capitalization — the total value of a company (share price x number of shares). Large cap (>$10B) = stable. Mid cap ($2-10B) = growth potential. Small cap (<$2B) = higher risk/reward.',
  'Entry': 'The price you bought (or plan to buy) the stock at. Your return is calculated from this price.',
  'Return': 'The percentage gain or loss from your entry price to the current price. +20% means every $100 invested is now worth $120.',
  'Value': 'The current dollar value of your position, based on your allocation and current market price.',

  // Technical indicators
  'RSI(14)': 'Relative Strength Index (14-day) — a momentum score from 0 to 100. Below 30 = "oversold" (beaten down, might bounce). Above 70 = "overbought" (rallied hard, might pull back). 30–70 = normal.',
  'MA Status': 'Moving Average Status — whether the price is above or below its 50-day average. Above = stock is in a short-term uptrend (bullish). Below = short-term downtrend (bearish).',
  '50d MA': '50-Day Moving Average — the average closing price over 50 trading days, showing the short-term trend. Price above = uptrend, below = downtrend.',
  '200d MA': '200-Day Moving Average — the average closing price over 200 trading days, showing the long-term trend. Price above = long-term uptrend, below = long-term downtrend.',
  'Cross': 'Moving average crossover signals. "Golden Cross" = 50-day average crosses above 200-day (bullish, trend turning up). "Death Cross" = crosses below (bearish, trend turning down).',
  'Drawdown': 'The percentage drop from a stock\'s recent peak. If it hit $100 then fell to $75, that\'s a -25% drawdown. Deeper drawdowns may signal distress or a buying opportunity.',
  'Vol Spike': 'Volume Spike — today\'s trading volume is more than 2x the 20-day average. Unusual volume often signals big news, institutional buying/selling, or an important price move coming.',
  'Score': 'Composite signal score from -100 to +100 combining RSI, moving averages, drawdown, valuation, and volume. Above +20 = BUY, below -20 = SELL, between = HOLD.',

  // Risk metrics
  'Sharpe Ratio': 'Return per unit of risk. Answers: "Am I being compensated for the volatility?" Above 1.0 = good, above 2.0 = great, below 0 = losing money for the risk you\'re taking.',
  'Sortino Ratio': 'Like Sharpe, but only counts downside volatility (losses). Upside volatility (big gains) isn\'t bad, so Sortino ignores it. Higher = better risk-adjusted returns.',
  'Max Drawdown': 'The worst peak-to-trough drop during the backtest. If your portfolio hit $120K then fell to $90K, that\'s a -25% max drawdown. Shows the worst-case loss you\'d have experienced.',
  'Volatility': 'How much your portfolio\'s value swings up and down, measured as annualized standard deviation. Higher volatility = bigger swings = more risk (and potential reward).',
  'Beta': 'How much your portfolio swings vs the market. Beta 1.0 = moves with S&P 500. Beta 1.5 = when market moves 10%, you move 15% (both up and down). Higher beta = more risk and reward.',
  "Alpha (Jensen's)": 'The excess return above what\'s expected given your risk level (beta). Positive alpha = your stock picks are adding value beyond just taking on market risk.',
  'Trading Days': 'The number of market trading days in the backtest period. Markets are open ~252 days per year (weekdays minus holidays).',

  // Signals tab
  'Signal': 'The recommendation for this stock: BUY (score > +20), HOLD (-20 to +20), or SELL (< -20). Based on combining technical indicators and fundamentals. A starting point for research, not a trading command.',
  'Rebalance Drift': 'How far each position has drifted from your target allocation. Over time, winners grow and losers shrink, so your actual percentages drift from your plan. Drift >5% suggests rebalancing — selling some winners and buying losers to get back on target.',
  'Correlation Concentration': 'Groups of stocks that move together (correlation > 0.7). If all your correlated stocks total >30% of the portfolio, a bad day in that group hits hard. Diversification means owning stocks that don\'t all drop at once.',
  'Portfolio Signal Health': 'A weighted average of all stock signal scores, normalized to 0–100. Higher = more bullish (uptrend) signals across your portfolio. Lower = more bearish (downtrend) signals.',
  'Stop-Loss': 'A line in the sand you set ahead of time: "If this stock drops X% from my entry, I sell to prevent bigger losses." It\'s risk management — you decide the max you\'re willing to lose before emotions kick in.',
  'Take-Profit': 'The opposite of stop-loss: "If this stock is up X%, I sell some to lock in gains." Prevents the regret of watching a big winner give back all its profits.',
  'SL': 'Stop-Loss — the max percentage loss you\'ll accept. Example: SL of 15% means you sell if the stock drops 15% from your entry price.',
  'TP': 'Take-Profit — your target gain percentage. Example: TP of 50% means you consider selling when you\'re up 50% from entry.',

  // Rebalance actions
  'ADD': 'This position is underweight — it\'s a smaller slice of your portfolio than planned. Consider buying more shares to get back to your target allocation.',
  'TRIM': 'This position is overweight — it\'s grown into a bigger slice than planned (usually because it went up). Consider selling some to get back to target.',
  'HOLD': 'This position is close to its target allocation (within 5%). No rebalancing action needed right now.',

  // Other
  'Backtest': 'A "what if" simulation — replays real historical prices to show how your portfolio would have performed. Useful for testing your strategy, but past performance doesn\'t guarantee future results.',
  'Correlation Matrix': 'A grid showing how closely each pair of stocks moves together. Red = high correlation (they rise and fall together). Blue = low/negative (diversified — when one drops, the other might not). Values from -1 to +1.',
  'SPY': 'The SPDR S&P 500 ETF — a fund tracking the 500 largest US companies. It\'s the benchmark: if you can\'t beat SPY, you might be better off just buying an index fund.',
};

/**
 * Extended glossary entries — full definitions for the Glossary page.
 * Each entry has a term, short definition, and detailed explanation.
 */
export const GLOSSARY = [
  {
    term: 'Bullish',
    short: 'Expecting prices to go up.',
    detail: 'Bullish means optimistic about a stock or the market — like a bull charging upward. When the app says "Portfolio outlook is bullish," most of your stocks are showing upward momentum. A "bull market" is a sustained period of rising prices (generally +20% from recent lows).',
    category: 'General',
  },
  {
    term: 'Bearish',
    short: 'Expecting prices to go down.',
    detail: 'Bearish means pessimistic — like a bear swiping downward. When signals are bearish, most stocks are in downtrends. A "bear market" is a sustained decline of 20% or more from recent highs. Bear markets are normal and temporary, but can be painful if you\'re not prepared.',
    category: 'General',
  },
  {
    term: 'P/E Ratio',
    short: 'Price-to-Earnings — how much you pay per $1 of profit.',
    detail: 'If a stock trades at $100 and earns $5 per share, its P/E is 20. You\'re paying $20 for every $1 of annual earnings. Lower P/E generally means cheaper valuation. Higher P/E means investors expect strong future growth to justify the premium. Average S&P 500 P/E is historically around 15-20. A P/E above 40 is considered "stretched." A negative P/E means the company is currently losing money.',
    category: 'Fundamentals',
  },
  {
    term: 'RSI (Relative Strength Index)',
    short: 'A momentum score from 0–100 showing if a stock is overbought or oversold.',
    detail: 'RSI measures the speed and size of recent price changes over 14 days. Below 30 = "oversold" — the stock has been heavily sold and may be due for a bounce. Above 70 = "overbought" — it\'s rallied hard and may pull back. Between 30-70 = normal trading range. RSI is a starting point, not a guarantee — stocks can stay overbought/oversold for extended periods during strong trends.',
    category: 'Technical',
  },
  {
    term: 'Moving Average (MA)',
    short: 'The average closing price over a period, smoothing out daily noise.',
    detail: 'A 50-day MA takes the last 50 closing prices and averages them. It shows the short-term trend direction. The 200-day MA shows the long-term trend. When the price is above both averages, the stock is in an uptrend. When below both, it\'s in a downtrend. Moving averages act as support/resistance levels — stocks often bounce off them.',
    category: 'Technical',
  },
  {
    term: 'Golden Cross',
    short: 'Bullish signal — the 50-day MA crosses above the 200-day MA.',
    detail: 'A golden cross means the short-term trend has turned positive enough to overtake the long-term average. It\'s considered a bullish confirmation that a new uptrend may be beginning. However, it\'s a lagging indicator — by the time it triggers, the stock has usually already moved up significantly.',
    category: 'Technical',
  },
  {
    term: 'Death Cross',
    short: 'Bearish signal — the 50-day MA crosses below the 200-day MA.',
    detail: 'The opposite of a golden cross. It means the short-term trend has deteriorated below the long-term average, suggesting a potential extended downtrend. Not every death cross leads to a crash — sometimes it\'s a false signal during a consolidation. Always check fundamentals before panic-selling.',
    category: 'Technical',
  },
  {
    term: 'Alpha',
    short: 'How much you beat (or trailed) the market.',
    detail: 'If the S&P 500 returned 10% and your portfolio returned 15%, your alpha is +5%. Positive alpha means your stock picks are adding value beyond what you\'d get from just buying an index fund. Negative alpha means you\'d have been better off in SPY. Generating consistent positive alpha is very difficult — most professional fund managers fail to beat the market over long periods.',
    category: 'Risk',
  },
  {
    term: 'Beta',
    short: 'How much your portfolio swings compared to the market.',
    detail: 'Beta of 1.0 = your portfolio moves exactly with the S&P 500. Beta of 1.5 = when the market goes up 10%, you go up 15% (but you also drop 15% when it falls 10%). Beta of 0.5 = half the market\'s movement. Energy stocks often have betas above 1.0, meaning more volatility. Higher beta = more risk and more potential reward.',
    category: 'Risk',
  },
  {
    term: 'Sharpe Ratio',
    short: 'Return per unit of risk — are you being compensated for the volatility?',
    detail: 'The Sharpe ratio divides your excess return (above the risk-free rate, like Treasury bills) by your volatility. A Sharpe of 1.0 means you earned 1% of return for every 1% of risk. Above 1.0 = good. Above 2.0 = very good. Below 0 = you\'re losing money relative to just holding Treasury bills. It helps compare strategies: a 20% return with a Sharpe of 0.5 is worse risk-adjusted than a 12% return with a Sharpe of 1.5.',
    category: 'Risk',
  },
  {
    term: 'Sortino Ratio',
    short: 'Like Sharpe, but only penalizes downside volatility.',
    detail: 'The Sharpe ratio treats all volatility as bad, but upside volatility (big gains) isn\'t actually a problem. The Sortino ratio only counts downside moves as risk. This makes it more useful for portfolios with asymmetric returns. A high Sortino means you\'re getting good returns without much downside pain.',
    category: 'Risk',
  },
  {
    term: 'Drawdown',
    short: 'The drop from a peak to a trough.',
    detail: 'If your portfolio hit $120,000 then fell to $90,000, that\'s a -25% drawdown. Max drawdown is the worst peak-to-trough decline during the entire backtest period. It shows the most pain you would have felt. A -10% drawdown is normal. -20% is a bear market. -30%+ is severe. Drawdown matters because a -50% loss requires a +100% gain to recover.',
    category: 'Risk',
  },
  {
    term: 'Volatility',
    short: 'How much prices swing up and down.',
    detail: 'Measured as the annualized standard deviation of daily returns. Higher volatility means bigger daily swings — both up and down. A volatility of 20% means your portfolio could reasonably move 20% in either direction over a year. Energy stocks tend to be more volatile than the overall market. Volatility isn\'t always bad — it creates buying opportunities.',
    category: 'Risk',
  },
  {
    term: 'Dividend Yield',
    short: 'The annual cash payment as a percentage of the stock price.',
    detail: 'A 3% yield on a $100 stock means $3 per share per year in cash dividends. You get paid just for holding the stock. Dividend income can be reinvested to compound returns, or taken as passive income. High-yield stocks (above 4%) are often mature, stable companies. Very high yields (above 8%) can be a warning sign that the price dropped due to problems.',
    category: 'Fundamentals',
  },
  {
    term: 'Market Cap',
    short: 'The total market value of a company.',
    detail: 'Calculated as share price times number of shares outstanding. Large cap (>$10B) = established, stable companies like Constellation Energy. Mid cap ($2-10B) = companies with growth potential. Small cap (<$2B) = higher risk but potentially higher returns. Market cap helps you understand the size and stability of what you own.',
    category: 'Fundamentals',
  },
  {
    term: 'Stop-Loss',
    short: 'An automatic sell threshold to limit losses.',
    detail: 'You set a stop-loss percentage ahead of time — for example, 15%. If the stock drops 15% from your entry price, the alert fires to remind you to sell. The point is risk management: decide the maximum you\'re willing to lose before emotions (hope, denial) kick in. For speculative Tier 3 stocks, a tighter stop-loss (10-15%) makes sense. For high-conviction Tier 1 picks, a wider stop (20-25%) gives room for normal volatility.',
    category: 'Strategy',
  },
  {
    term: 'Take-Profit',
    short: 'A target gain at which you lock in some profits.',
    detail: 'The opposite of stop-loss. If a stock is up 50% from your entry, a take-profit alert reminds you to consider selling some shares. You don\'t have to sell everything — selling half locks in gains while keeping upside exposure. This prevents the common regret of watching a big winner give back all its profits.',
    category: 'Strategy',
  },
  {
    term: 'Rebalancing',
    short: 'Adjusting positions back to your target allocation.',
    detail: 'Over time, winners grow and losers shrink, so your actual percentages drift from your plan. Rebalancing means selling some of the overweight winners and buying the underweight positions to get back to target. It enforces discipline — forces you to sell high and buy low. Most investors rebalance quarterly or when drift exceeds 5%.',
    category: 'Strategy',
  },
  {
    term: 'Correlation',
    short: 'How closely two stocks move together (-1 to +1).',
    detail: 'Correlation of +1.0 = perfect lockstep (when one goes up, the other always does too). Correlation of 0 = no relationship. Correlation of -1.0 = they move opposite. If all your stocks are highly correlated (above 0.7), a bad day hits everything at once — that\'s concentration risk. Good diversification means owning stocks with lower correlations so they don\'t all drop at the same time.',
    category: 'Risk',
  },
  {
    term: 'Backtest',
    short: 'A simulation replaying historical prices.',
    detail: 'A backtest takes real past price data and simulates how your portfolio would have performed with your current allocations. It\'s useful for testing your strategy and understanding risk, but past performance does not guarantee future results. Markets change, and a strategy that worked last year might not work next year.',
    category: 'General',
  },
  {
    term: 'SPY',
    short: 'The S&P 500 ETF — a fund tracking the 500 largest US companies.',
    detail: 'SPY is the most popular ETF in the world. It\'s used as the benchmark to compare your portfolio against. If you can\'t consistently beat SPY, you might be better off just buying the index fund. Many professional fund managers fail to beat SPY over 10+ year periods. Your portfolio uses SPY as the comparison to see if your energy/AI thesis adds value.',
    category: 'General',
  },
  {
    term: 'Volume Spike',
    short: 'Unusually high trading volume — often signals a big move.',
    detail: 'When a stock trades at more than 2x its average daily volume, something is happening — earnings news, analyst upgrades/downgrades, institutional buying, or sector catalysts. Volume confirms price moves: a rally on high volume is more trustworthy than one on low volume. A spike combined with a low RSI can signal a buying opportunity.',
    category: 'Technical',
  },
  {
    term: 'Tier System',
    short: 'How this portfolio organizes conviction levels.',
    detail: 'Tier 1 (Highest Conviction) = your strongest picks, largest allocations. These are the stocks you believe in most. Tier 2 (Strong Conviction) = solid picks with meaningful allocation. Tier 3 (Speculative) = smaller positions in riskier bets with high potential upside. The tier system helps with position sizing — you should have more money in your best ideas and less in speculative ones.',
    category: 'Strategy',
  },
];
