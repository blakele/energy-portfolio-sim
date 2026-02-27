import { useAnalysisStore } from '../../stores/analysisStore.js';
import MetricCard from '../shared/MetricCard.jsx';
import { pctColor } from '../../utils/formatting.js';

export default function RiskMetricsPanel() {
  const rm = useAnalysisStore(s => s.riskMetrics);

  if (!rm) {
    return (
      <div className="text-sm text-[var(--color-text-dim)] text-center py-8">
        Run a backtest to see risk metrics
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <MetricCard
        label="Sharpe Ratio"
        value={rm.sharpe.toFixed(2)}
        color={rm.sharpe >= 1 ? '#22c55e' : rm.sharpe >= 0 ? '#f59e0b' : '#ef4444'}
        sub={rm.sharpe >= 1 ? 'Good risk-adjusted' : rm.sharpe >= 0 ? 'Moderate' : 'Negative'}
      />
      <MetricCard
        label="Sortino Ratio"
        value={rm.sortino.toFixed(2)}
        color={rm.sortino >= 1.5 ? '#22c55e' : rm.sortino >= 0 ? '#f59e0b' : '#ef4444'}
        sub="Downside-adjusted"
      />
      <MetricCard
        label="Max Drawdown"
        value={`-${rm.maxDrawdown.toFixed(1)}%`}
        color="#ef4444"
        sub="Worst peak-to-trough"
      />
      <MetricCard
        label="Volatility"
        value={`${rm.volatility.toFixed(1)}%`}
        sub="Annualized std dev"
      />
      <MetricCard
        label="Beta"
        value={rm.beta.toFixed(2)}
        sub={rm.beta > 1 ? 'More volatile than SPY' : 'Less volatile than SPY'}
      />
      <MetricCard
        label="Alpha (Jensen's)"
        value={`${rm.alpha >= 0 ? '+' : ''}${rm.alpha.toFixed(2)}%`}
        color={pctColor(rm.alpha)}
        sub="Excess risk-adjusted return"
      />
      <MetricCard
        label="Total Return"
        value={`${rm.totalReturn >= 0 ? '+' : ''}${rm.totalReturn.toFixed(2)}%`}
        color={pctColor(rm.totalReturn)}
        sub={`SPY: ${rm.spyTotalReturn >= 0 ? '+' : ''}${rm.spyTotalReturn.toFixed(2)}%`}
      />
      <MetricCard
        label="Trading Days"
        value={rm.tradingDays}
        sub="In backtest period"
      />
    </div>
  );
}
