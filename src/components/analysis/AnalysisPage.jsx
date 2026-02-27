import { useBacktest } from '../../hooks/useBacktest.js';
import RiskMetricsPanel from './RiskMetricsPanel.jsx';
import BacktestChart from './BacktestChart.jsx';
import CorrelationMatrix from './CorrelationMatrix.jsx';
import SectorAttribution from './SectorAttribution.jsx';
import LoadingSpinner from '../shared/LoadingSpinner.jsx';
import { useAnalysisStore } from '../../stores/analysisStore.js';

export default function AnalysisPage() {
  const { fetchHistory, retry, status, error, progress } = useBacktest();
  const analysisLoading = useAnalysisStore(s => s.loading);

  return (
    <div className="space-y-6">

      {/* IDLE — show the load button */}
      {status === 'idle' && (
        <div className="bg-[var(--color-surface-2)] border border-[var(--color-border-amber)] rounded-lg p-6 text-center">
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            Load 1 year of historical price data to run backtests and compute risk metrics.
          </p>
          <button
            onClick={fetchHistory}
            className="bg-[var(--color-amber-500)] hover:bg-[var(--color-amber-600)] text-black font-bold px-6 py-2.5 rounded-lg text-sm transition-colors cursor-pointer"
          >
            Load Historical Data & Run Analysis
          </button>
        </div>
      )}

      {/* LOADING — show progress */}
      {status === 'loading' && (
        <div className="bg-[var(--color-surface-2)] border border-[var(--color-border-amber)] rounded-lg p-6 text-center">
          <LoadingSpinner text="Fetching historical data..." />
          {progress && (
            <div className="mt-3">
              <div className="text-sm text-[var(--color-text-muted)]">
                Loaded {progress.loaded} / {progress.total} symbols
                {progress.currentSymbol && (
                  <span className="text-[var(--color-amber-500)] ml-2">{progress.currentSymbol}</span>
                )}
              </div>
              <div className="w-64 mx-auto mt-2 h-1.5 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--color-amber-500)] rounded-full transition-all duration-300"
                  style={{ width: `${(progress.loaded / progress.total) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-[var(--color-text-dim)] mt-2">
                This may take ~20 seconds (rate-limited to avoid Finnhub throttling)
              </p>
            </div>
          )}
        </div>
      )}

      {/* ERROR — show what went wrong + retry */}
      {status === 'error' && error && (
        <div className="bg-[var(--color-surface-2)] border border-[#ef444440] rounded-lg p-6">
          <div className="text-center mb-4">
            <div className="text-sm text-[var(--color-loss)] font-bold mb-2">
              Historical data fetch failed
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">{error.message}</p>
          </div>

          {/* Per-symbol breakdown */}
          {(error.succeeded?.length > 0 || error.failed?.length > 0) && (
            <div className="grid grid-cols-2 gap-4 mb-4 text-[10px]">
              {error.succeeded?.length > 0 && (
                <div>
                  <div className="text-[var(--color-gain)] font-medium mb-1">
                    Succeeded ({error.succeeded.length})
                  </div>
                  <div className="text-[var(--color-text-dim)]">
                    {error.succeeded.join(', ')}
                  </div>
                </div>
              )}
              {error.failed?.length > 0 && (
                <div>
                  <div className="text-[var(--color-loss)] font-medium mb-1">
                    Failed ({error.failed.length})
                  </div>
                  <div className="text-[var(--color-text-dim)]">
                    {error.failed.join(', ')}
                  </div>
                  {error.errors && Object.keys(error.errors).length > 0 && (
                    <div className="mt-1 text-[var(--color-text-dim)]">
                      {Object.entries(error.errors).slice(0, 3).map(([sym, msg]) => (
                        <div key={sym}>{sym}: {msg}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="text-center space-y-2">
            <button
              onClick={retry}
              className="bg-[var(--color-amber-500)] hover:bg-[var(--color-amber-600)] text-black font-bold px-6 py-2.5 rounded-lg text-sm transition-colors cursor-pointer"
            >
              Clear Cache & Retry
            </button>
            <p className="text-[10px] text-[var(--color-text-dim)]">
              Finnhub free tier may limit historical candle data. Check your API key at{' '}
              <a href="https://finnhub.io/dashboard" target="_blank" rel="noopener noreferrer" className="text-[var(--color-amber-400)] underline">
                finnhub.io/dashboard
              </a>
              {' '}and open your browser console (F12) for detailed logs.
            </p>
          </div>
        </div>
      )}

      {/* Spinner while analysis computes */}
      {analysisLoading && <LoadingSpinner text="Computing analysis..." />}

      {/* SUCCESS — show analysis results */}
      {status === 'success' && !analysisLoading && (
        <>
          <RiskMetricsPanel />
          <BacktestChart />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CorrelationMatrix />
            <SectorAttribution />
          </div>
        </>
      )}
    </div>
  );
}
