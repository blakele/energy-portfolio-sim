import { useAnalysisStore } from '../../stores/analysisStore.js';
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { formatMoney } from '../../utils/formatting.js';
import Tip from '../shared/Tip.jsx';

export default function BacktestChart() {
  const bt = useAnalysisStore(s => s.backtestData);
  const dd = useAnalysisStore(s => s.drawdownSeries);

  if (!bt?.dates?.length) return null;

  const hasDividends = bt.portfolioTotalValues?.length > 0 &&
    bt.portfolioTotalValues.some((v, i) => v !== bt.portfolioValues[i]);

  const chartData = bt.dates.map((date, i) => ({
    date,
    portfolio: bt.portfolioValues[i],
    ...(hasDividends ? { portfolioTotal: bt.portfolioTotalValues[i] } : {}),
    spy: bt.spyValues[i],
  }));

  const ddData = dd?.map((d, i) => ({
    date: bt.dates[i] || '',
    drawdown: d.drawdown,
  })) || [];

  const skip = Math.max(1, Math.floor(chartData.length / 12));

  return (
    <div className="space-y-4">
      {/* Main backtest chart */}
      <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-6">
        <div className="flex items-baseline justify-between mb-4">
          <h3 className="text-xs font-medium text-[var(--color-text-dim)] uppercase tracking-wider">
            Historical <Tip>Backtest</Tip> — Portfolio vs <Tip>SPY</Tip>
          </h3>
          {bt.totalDividends > 0 && (
            <span className="text-[10px] text-[#22c55e]">
              +{formatMoney(bt.totalDividends)} dividends
            </span>
          )}
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="gradBtPort" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradBtTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#64748b', fontSize: 10 }}
              interval={skip}
              tickFormatter={d => d.slice(5)}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 10 }}
              tickFormatter={v => `$${(v / 1000).toFixed(0)}K`}
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#161b22',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 8,
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
              }}
              formatter={val => [formatMoney(val)]}
            />
            <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'var(--font-mono)' }} />
            <Area
              type="monotone" dataKey="portfolio" stroke="#f59e0b"
              fill="url(#gradBtPort)" strokeWidth={2} name="Portfolio (Price)" dot={false}
            />
            {hasDividends && (
              <Area
                type="monotone" dataKey="portfolioTotal" stroke="#22c55e"
                fill="url(#gradBtTotal)" strokeWidth={1.5} name="Portfolio (w/ Dividends)" dot={false}
                strokeDasharray="6 3"
              />
            )}
            <Area
              type="monotone" dataKey="spy" stroke="#64748b"
              fill="none" strokeWidth={1.5} name="SPY" dot={false}
              strokeDasharray="4 2"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Drawdown chart */}
      {ddData.length > 0 && (
        <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-6">
          <h3 className="text-xs font-medium text-[var(--color-text-dim)] uppercase tracking-wider mb-4">
            Portfolio <Tip term="Max Drawdown">Drawdown</Tip>
          </h3>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={ddData}>
              <defs>
                <linearGradient id="gradDD" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#64748b', fontSize: 10 }}
                interval={skip}
                tickFormatter={d => d.slice(5)}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickFormatter={v => `${v.toFixed(0)}%`}
                domain={['auto', 0]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#161b22',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 8,
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                }}
                formatter={val => [`${val.toFixed(2)}%`]}
              />
              <Area
                type="monotone" dataKey="drawdown" stroke="#ef4444"
                fill="url(#gradDD)" strokeWidth={1.5} dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
