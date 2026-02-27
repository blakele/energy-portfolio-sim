import { useAnalysisStore } from '../../stores/analysisStore.js';
import Tip from '../shared/Tip.jsx';

function corrColor(val) {
  if (val >= 0.7) return 'rgba(239, 68, 68, 0.6)';
  if (val >= 0.4) return 'rgba(239, 68, 68, 0.3)';
  if (val >= 0.1) return 'rgba(239, 68, 68, 0.1)';
  if (val >= -0.1) return 'rgba(255, 255, 255, 0.03)';
  if (val >= -0.4) return 'rgba(59, 130, 246, 0.15)';
  return 'rgba(59, 130, 246, 0.35)';
}

export default function CorrelationMatrix() {
  const corr = useAnalysisStore(s => s.correlationMatrix);

  if (!corr) {
    return (
      <div className="text-sm text-[var(--color-text-dim)] text-center py-8">
        Run a backtest to see correlation matrix
      </div>
    );
  }

  const { symbols, matrix } = corr;

  return (
    <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-6">
      <h3 className="text-xs font-medium text-[var(--color-text-dim)] uppercase tracking-wider mb-4">
        <Tip>Correlation Matrix</Tip>
      </h3>
      <p className="text-[10px] text-[var(--color-text-dim)] mb-4">
        Red = high correlation (move together) &bull; Blue = low/negative (diversified)
      </p>
      <div className="overflow-x-auto">
        <table className="text-[10px]">
          <thead>
            <tr>
              <th className="p-1" />
              {symbols.map(s => (
                <th key={s} className="p-1 text-[var(--color-text-muted)] font-medium">
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {symbols.map((row, i) => (
              <tr key={row}>
                <td className="p-1 text-[var(--color-text-muted)] font-medium pr-2">
                  {row}
                </td>
                {matrix[i].map((val, j) => (
                  <td
                    key={j}
                    className="p-1 text-center min-w-[36px]"
                    style={{
                      backgroundColor: i === j ? 'rgba(255,255,255,0.06)' : corrColor(val),
                      color: i === j ? 'var(--color-text-dim)' : 'var(--color-text)',
                    }}
                  >
                    {i === j ? '1' : val.toFixed(2)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
