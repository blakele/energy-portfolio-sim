import { LineChart, Line, XAxis, YAxis, ReferenceLine, ResponsiveContainer, Tooltip } from 'recharts';
import { useSignalsStore } from '../../stores/signalsStore.js';
import { usePortfolio } from '../../hooks/usePortfolio.js';
import { rsiColor, signalColor, signalBg } from '../../utils/colors.js';
import SignalBadge from '../shared/SignalBadge.jsx';
import Tip from '../shared/Tip.jsx';

function RSIMiniChart({ rsiSeries }) {
  if (!rsiSeries || rsiSeries.length === 0) return null;

  const data = rsiSeries.slice(-60).map((val, i) => ({ i, rsi: Math.round(val * 10) / 10 }));

  return (
    <div className="h-20 mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <YAxis domain={[0, 100]} hide />
          <XAxis hide />
          <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="2 2" strokeOpacity={0.5} />
          <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="2 2" strokeOpacity={0.5} />
          <Tooltip
            contentStyle={{
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              borderRadius: '4px',
              fontSize: '10px',
            }}
            formatter={(val) => [val, 'RSI']}
            labelFormatter={() => ''}
          />
          <Line
            type="monotone"
            dataKey="rsi"
            stroke="#f59e0b"
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function ScoreBar({ label, score, weight }) {
  const width = Math.abs(score);
  const color = score > 0 ? '#22c55e' : score < 0 ? '#ef4444' : '#94a3b8';
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 text-[9px] text-[var(--color-text-dim)]">{label} ({weight}%)</span>
      <div className="flex-1 relative h-2 bg-[rgba(255,255,255,0.04)] rounded">
        <div
          className="absolute top-0 h-full rounded transition-all"
          style={{
            left: score >= 0 ? '50%' : `${50 - width / 2}%`,
            width: `${width / 2}%`,
            backgroundColor: color,
          }}
        />
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[var(--color-border)]" />
      </div>
      <span className="w-8 text-right text-[9px] font-mono" style={{ color }}>
        {score > 0 ? '+' : ''}{Math.round(score)}
      </span>
    </div>
  );
}

export default function SignalDetailCard({ symbol }) {
  const sig = useSignalsStore(s => s.signals[symbol]);
  const tech = useSignalsStore(s => s.technicals[symbol]);
  const { getStockBySymbol } = usePortfolio();
  const stock = getStockBySymbol(symbol);

  if (!sig || !tech || !stock) return null;

  return (
    <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">{stock.icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">{symbol}</span>
              <SignalBadge signal={sig.signal} />
            </div>
            <div className="text-[10px] text-[var(--color-text-dim)]">{stock.name}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold" style={{
            color: signalColor(sig.signal),
          }}>
            {sig.score > 0 ? '+' : ''}{sig.score}
          </div>
          <div className="text-[9px] text-[var(--color-text-dim)]">composite score</div>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="space-y-1 mb-3">
        <ScoreBar label="RSI" score={sig.components.rsi} weight={25} />
        <ScoreBar label="MA" score={sig.components.ma} weight={25} />
        <ScoreBar label="Drawdown" score={sig.components.drawdown} weight={20} />
        <ScoreBar label="Valuation" score={sig.components.valuation} weight={15} />
        <ScoreBar label="Volume" score={sig.components.volume} weight={15} />
      </div>

      {/* Indicator summary */}
      <div className="grid grid-cols-3 gap-2 text-[10px] mb-2">
        <div>
          <div className="text-[var(--color-text-dim)]"><Tip>RSI(14)</Tip></div>
          <div style={{ color: rsiColor(tech.rsi?.current) }}>
            {tech.rsi?.current?.toFixed(1) ?? '--'}
          </div>
        </div>
        <div>
          <div className="text-[var(--color-text-dim)]"><Tip>Drawdown</Tip></div>
          <div style={{ color: tech.drawdown?.current < -10 ? '#ef4444' : '#94a3b8' }}>
            {tech.drawdown?.current?.toFixed(1) ?? '--'}%
          </div>
        </div>
        <div>
          <div className="text-[var(--color-text-dim)]"><Tip>Vol Spike</Tip></div>
          <div style={{ color: tech.volume?.latestSpike ? '#f59e0b' : '#94a3b8' }}>
            {tech.volume?.latestSpike ? 'Yes' : 'No'}
          </div>
        </div>
      </div>

      {/* MA status */}
      <div className="flex gap-2 text-[10px] mb-2">
        <span className="px-1.5 py-0.5 rounded" style={{
          backgroundColor: tech.ma?.aboveSma50 ? '#22c55e18' : '#ef444418',
          color: tech.ma?.aboveSma50 ? '#22c55e' : '#ef4444',
        }}>
          {tech.ma?.aboveSma50 ? 'Above' : 'Below'} 50d
        </span>
        {tech.ma?.currentSma200 != null && (
          <span className="px-1.5 py-0.5 rounded" style={{
            backgroundColor: tech.ma?.aboveSma200 ? '#22c55e18' : '#ef444418',
            color: tech.ma?.aboveSma200 ? '#22c55e' : '#ef4444',
          }}>
            {tech.ma?.aboveSma200 ? 'Above' : 'Below'} 200d
          </span>
        )}
        {tech.ma?.cross && (
          <span className="px-1.5 py-0.5 rounded font-bold" style={{
            backgroundColor: tech.ma.cross === 'golden' ? '#22c55e18' : '#ef444418',
            color: tech.ma.cross === 'golden' ? '#22c55e' : '#ef4444',
          }}>
            {tech.ma.cross === 'golden' ? 'Golden Cross' : 'Death Cross'}
          </span>
        )}
      </div>

      {/* RSI mini chart */}
      <div className="text-[9px] text-[var(--color-text-dim)] uppercase tracking-wider">RSI(14) — Last 60 Days</div>
      <RSIMiniChart rsiSeries={tech.rsi?.series} />
    </div>
  );
}
