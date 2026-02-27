import { useAnalysisStore } from '../../stores/analysisStore.js';
import { useSnapshots } from '../../hooks/useSnapshots.js';
import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatMoney } from '../../utils/formatting.js';

export default function PerformanceChart() {
  const backtestData = useAnalysisStore(s => s.backtestData);
  const { snapshots } = useSnapshots();
  const [view, setView] = useState(snapshots.length >= 2 ? 'tracked' : 'backtest');

  const hasBacktest = backtestData?.dates?.length > 0;
  const hasTracked = snapshots.length >= 2;

  // Build chart data based on selected view
  let chartData = [];
  let title = '';

  if (view === 'tracked' && hasTracked) {
    chartData = snapshots.map(s => ({
      date: s.date,
      portfolio: s.portfolioValue,
      spy: s.spyValue,
    }));
    title = `Your Tracked Performance — ${snapshots.length} days`;
  } else if (hasBacktest) {
    chartData = backtestData.dates.map((date, i) => ({
      date,
      portfolio: backtestData.portfolioValues[i],
      spy: backtestData.spyValues[i],
    }));
    title = 'Portfolio vs S&P 500 — 1 Year Backtest';
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-6">
        <h3 className="text-xs font-medium text-[var(--color-text-dim)] uppercase tracking-wider mb-4">
          Performance vs SPY
        </h3>
        <div className="flex items-center justify-center h-48 text-[var(--color-text-dim)] text-sm">
          <div className="text-center">
            <p>Daily snapshots are being recorded automatically.</p>
            <p className="mt-1 text-[10px]">
              {snapshots.length === 0
                ? 'First snapshot will be taken once prices load.'
                : `${snapshots.length} snapshot recorded — chart shows after 2+ days.`}
            </p>
            {!hasBacktest && (
              <p className="mt-2 text-[10px]">
                Or load historical data from the Analysis tab for a 1-year backtest.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const skipInterval = Math.max(1, Math.floor(chartData.length / 12));

  return (
    <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-medium text-[var(--color-text-dim)] uppercase tracking-wider">
          {title}
        </h3>
        {/* View toggle — only show if both views are available */}
        {hasTracked && hasBacktest && (
          <div className="flex gap-1">
            <button
              onClick={() => setView('tracked')}
              className={`text-[10px] px-2 py-1 rounded transition-colors ${
                view === 'tracked'
                  ? 'bg-[var(--color-amber-500)] text-black font-bold'
                  : 'bg-[var(--color-surface-3)] text-[var(--color-text-dim)] border border-[var(--color-border)]'
              }`}
            >
              My Tracking
            </button>
            <button
              onClick={() => setView('backtest')}
              className={`text-[10px] px-2 py-1 rounded transition-colors ${
                view === 'backtest'
                  ? 'bg-[var(--color-amber-500)] text-black font-bold'
                  : 'bg-[var(--color-surface-3)] text-[var(--color-text-dim)] border border-[var(--color-border)]'
              }`}
            >
              1Y Backtest
            </button>
          </div>
        )}
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="gradPortfolio" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradSpy" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#64748b" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#64748b', fontSize: 10 }}
            interval={skipInterval}
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
            formatter={(val) => [formatMoney(val)]}
            labelFormatter={l => l}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}
          />
          <Area
            type="monotone"
            dataKey="portfolio"
            stroke="#f59e0b"
            fill="url(#gradPortfolio)"
            strokeWidth={2}
            name="Portfolio"
            dot={view === 'tracked' && chartData.length < 60}
          />
          <Area
            type="monotone"
            dataKey="spy"
            stroke="#64748b"
            fill="url(#gradSpy)"
            strokeWidth={1.5}
            name="SPY"
            dot={false}
            strokeDasharray="4 2"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
