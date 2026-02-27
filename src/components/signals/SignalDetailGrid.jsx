import { usePortfolio } from '../../hooks/usePortfolio.js';
import { useSignalsStore } from '../../stores/signalsStore.js';
import SignalDetailCard from './SignalDetailCard.jsx';

export default function SignalDetailGrid() {
  const { stocks } = usePortfolio();
  const signals = useSignalsStore(s => s.signals);

  const symbols = stocks
    .filter(s => signals[s.symbol])
    .map(s => s.symbol);

  if (symbols.length === 0) return null;

  return (
    <div>
      <h3 className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
        Stock Signal Details
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {symbols.map(sym => (
          <SignalDetailCard key={sym} symbol={sym} />
        ))}
      </div>
    </div>
  );
}
