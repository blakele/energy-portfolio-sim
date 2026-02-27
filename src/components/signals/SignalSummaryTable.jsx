import { usePortfolio } from '../../hooks/usePortfolio.js';
import { useSignalsStore } from '../../stores/signalsStore.js';
import { rsiColor } from '../../utils/colors.js';
import SignalBadge from '../shared/SignalBadge.jsx';
import Tip from '../shared/Tip.jsx';

export default function SignalSummaryTable() {
  const { stocks } = usePortfolio();
  const signals = useSignalsStore(s => s.signals);
  const technicals = useSignalsStore(s => s.technicals);

  const rows = stocks.filter(s => signals[s.symbol]).map(stock => {
    const sig = signals[stock.symbol];
    const tech = technicals[stock.symbol];
    return { stock, sig, tech };
  });

  if (rows.length === 0) return null;

  return (
    <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--color-border)]">
        <h3 className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
          Signal Summary
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-[var(--color-text-dim)]">
              <th className="text-left px-4 py-2 font-medium">Stock</th>
              <th className="text-center px-3 py-2 font-medium"><Tip>Signal</Tip></th>
              <th className="text-right px-3 py-2 font-medium"><Tip>Score</Tip></th>
              <th className="text-right px-3 py-2 font-medium"><Tip>RSI(14)</Tip></th>
              <th className="text-center px-3 py-2 font-medium"><Tip>50d MA</Tip></th>
              <th className="text-center px-3 py-2 font-medium"><Tip>200d MA</Tip></th>
              <th className="text-center px-3 py-2 font-medium"><Tip>Cross</Tip></th>
              <th className="text-right px-3 py-2 font-medium"><Tip>Drawdown</Tip></th>
              <th className="text-center px-4 py-2 font-medium"><Tip>Vol Spike</Tip></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ stock, sig, tech }) => (
              <tr key={stock.symbol} className="border-b border-[var(--color-border)] hover:bg-[rgba(255,255,255,0.02)]">
                <td className="px-4 py-2">
                  <span className="font-bold">{stock.symbol}</span>
                  <span className="text-[var(--color-text-dim)] ml-1">{stock.sector}</span>
                </td>
                <td className="text-center px-3 py-2">
                  <SignalBadge signal={sig.signal} />
                </td>
                <td className="text-right px-3 py-2 font-mono" style={{
                  color: sig.score > 20 ? '#22c55e' : sig.score < -20 ? '#ef4444' : '#f59e0b'
                }}>
                  {sig.score}
                </td>
                <td className="text-right px-3 py-2 font-mono" style={{ color: rsiColor(tech?.rsi?.current) }}>
                  {tech?.rsi?.current != null ? tech.rsi.current.toFixed(1) : '--'}
                </td>
                <td className="text-center px-3 py-2">
                  <span style={{ color: tech?.ma?.aboveSma50 ? '#22c55e' : '#ef4444' }}>
                    {tech?.ma?.aboveSma50 ? 'Above' : 'Below'}
                  </span>
                </td>
                <td className="text-center px-3 py-2">
                  <span style={{ color: tech?.ma?.aboveSma200 ? '#22c55e' : '#ef4444' }}>
                    {tech?.ma?.currentSma200 != null ? (tech.ma.aboveSma200 ? 'Above' : 'Below') : '--'}
                  </span>
                </td>
                <td className="text-center px-3 py-2">
                  {tech?.ma?.cross === 'golden' && (
                    <span className="text-[#22c55e] font-bold">Golden</span>
                  )}
                  {tech?.ma?.cross === 'death' && (
                    <span className="text-[#ef4444] font-bold">Death</span>
                  )}
                  {!tech?.ma?.cross && <span className="text-[var(--color-text-dim)]">--</span>}
                </td>
                <td className="text-right px-3 py-2 font-mono" style={{
                  color: tech?.drawdown?.current < -10 ? '#ef4444' : tech?.drawdown?.current < -5 ? '#f59e0b' : '#94a3b8'
                }}>
                  {tech?.drawdown?.current != null ? tech.drawdown.current.toFixed(1) + '%' : '--'}
                </td>
                <td className="text-center px-4 py-2">
                  {tech?.volume?.latestSpike
                    ? <span className="text-[#f59e0b] font-bold">Yes</span>
                    : <span className="text-[var(--color-text-dim)]">No</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
