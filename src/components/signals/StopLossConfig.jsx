import { useState } from 'react';
import { usePortfolio } from '../../hooks/usePortfolio.js';
import { usePortfolioStore } from '../../stores/portfolioStore.js';
import { useSignalsStore } from '../../stores/signalsStore.js';
import { usePriceStore } from '../../stores/priceStore.js';
import { formatPct, pctColor } from '../../utils/formatting.js';
import Tip from '../shared/Tip.jsx';

function StopLossRow({ stock }) {
  const config = usePortfolioStore(s => s.stopLossConfig[stock.symbol]);
  const setStopLoss = usePortfolioStore(s => s.setStopLoss);
  const removeStopLoss = usePortfolioStore(s => s.removeStopLoss);
  const quote = usePriceStore(s => s.quotes[stock.symbol]);
  const slTpAlerts = useSignalsStore(s => s.slTpAlerts);

  const [editing, setEditing] = useState(false);
  const [sl, setSl] = useState(config?.stopLossPct ?? '');
  const [tp, setTp] = useState(config?.takeProfitPct ?? '');

  const currentReturn = quote
    ? ((quote.price - stock.entryPrice) / stock.entryPrice) * 100
    : null;

  const alert = slTpAlerts.find(a => a.symbol === stock.symbol);

  const handleSave = () => {
    const slVal = sl === '' ? null : parseFloat(sl);
    const tpVal = tp === '' ? null : parseFloat(tp);
    if (slVal == null && tpVal == null) {
      removeStopLoss(stock.symbol);
    } else {
      setStopLoss(stock.symbol, slVal, tpVal);
    }
    setEditing(false);
  };

  const handleRemove = () => {
    removeStopLoss(stock.symbol);
    setSl('');
    setTp('');
    setEditing(false);
  };

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg"
      style={{
        backgroundColor: alert ? '#ef444410' : 'rgba(255,255,255,0.02)',
        border: alert ? '1px solid #ef444430' : '1px solid transparent',
      }}
    >
      <div className="w-12">
        <span className="text-[11px] font-bold">{stock.symbol}</span>
      </div>
      <div className="w-20 text-[10px]">
        <span style={{ color: pctColor(currentReturn) }}>
          {currentReturn != null ? formatPct(currentReturn) : '--'}
        </span>
      </div>

      {editing ? (
        <div className="flex-1 flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-[var(--color-text-dim)]"><Tip>SL</Tip>%</span>
            <input
              type="number"
              value={sl}
              onChange={e => setSl(e.target.value)}
              placeholder="15"
              className="w-14 px-1.5 py-1 text-[10px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-center"
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-[var(--color-text-dim)]"><Tip>TP</Tip>%</span>
            <input
              type="number"
              value={tp}
              onChange={e => setTp(e.target.value)}
              placeholder="50"
              className="w-14 px-1.5 py-1 text-[10px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-center"
            />
          </div>
          <button onClick={handleSave} className="text-[10px] px-2 py-1 rounded bg-[#22c55e20] text-[#22c55e] hover:bg-[#22c55e30]">
            Save
          </button>
          <button onClick={() => setEditing(false)} className="text-[10px] px-2 py-1 rounded text-[var(--color-text-dim)] hover:text-[var(--color-text)]">
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex-1 flex items-center gap-3">
          {config ? (
            <>
              <span className="text-[10px]">
                <span className="text-[var(--color-text-dim)]"><Tip>SL</Tip>:</span>{' '}
                <span className="text-[#ef4444] font-mono">-{Math.abs(config.stopLossPct ?? 0)}%</span>
              </span>
              <span className="text-[10px]">
                <span className="text-[var(--color-text-dim)]"><Tip>TP</Tip>:</span>{' '}
                <span className="text-[#22c55e] font-mono">+{config.takeProfitPct ?? 0}%</span>
              </span>
              {alert && (
                <span className="text-[10px] font-bold text-[#ef4444] animate-pulse">
                  {alert.type === 'stop-loss' ? 'STOP-LOSS TRIGGERED' : 'TAKE-PROFIT TRIGGERED'}
                </span>
              )}
            </>
          ) : (
            <span className="text-[10px] text-[var(--color-text-dim)]">Not configured</span>
          )}
        </div>
      )}

      <div className="flex gap-1">
        {!editing && (
          <button
            onClick={() => { setSl(config?.stopLossPct ?? ''); setTp(config?.takeProfitPct ?? ''); setEditing(true); }}
            className="text-[10px] px-2 py-1 rounded text-[var(--color-text-dim)] hover:text-[var(--color-text)] hover:bg-[rgba(255,255,255,0.06)]"
          >
            {config ? 'Edit' : 'Set'}
          </button>
        )}
        {config && !editing && (
          <button
            onClick={handleRemove}
            className="text-[10px] px-2 py-1 rounded text-[#ef4444] hover:bg-[#ef444420]"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

export default function StopLossConfig() {
  const { stocks } = usePortfolio();

  return (
    <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--color-border)]">
        <h3 className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
          <Tip>Stop-Loss</Tip> / <Tip>Take-Profit</Tip>
        </h3>
        <p className="text-[10px] text-[var(--color-text-dim)] mt-0.5">
          Configure per-stock thresholds based on return from entry price. Alerts shown when breached.
        </p>
      </div>
      <div className="p-4 space-y-1">
        <div className="flex items-center gap-3 px-3 py-1 text-[9px] text-[var(--color-text-dim)] uppercase">
          <span className="w-12">Stock</span>
          <span className="w-20">Return</span>
          <span className="flex-1">Thresholds</span>
          <span>Actions</span>
        </div>
        {stocks.map(stock => (
          <StopLossRow key={stock.symbol} stock={stock} />
        ))}
      </div>
    </div>
  );
}
