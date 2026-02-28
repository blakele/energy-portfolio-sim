import { useSignalsStore } from '../../stores/signalsStore.js';
import PortfolioHealthBar from './PortfolioHealthBar.jsx';
import InsightsPanel from './InsightsPanel.jsx';
import BuyRecommendations from './BuyRecommendations.jsx';
import SellRecommendations from './SellRecommendations.jsx';
import SignalSummaryTable from './SignalSummaryTable.jsx';
import RebalancePanel from './RebalancePanel.jsx';
import ConcentrationPanel from './ConcentrationPanel.jsx';
import BearCasePanel from './BearCasePanel.jsx';
import PlaybookPanel from './PlaybookPanel.jsx';
import StopLossConfig from './StopLossConfig.jsx';
import SignalDetailGrid from './SignalDetailGrid.jsx';

export default function SignalsPage() {
  const computed = useSignalsStore(s => s.computed);
  const loading = useSignalsStore(s => s.loading);
  const portfolioHealth = useSignalsStore(s => s.portfolioHealth);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-sm text-[var(--color-text-muted)] animate-pulse">
            Computing signals...
          </div>
        </div>
      </div>
    );
  }

  if (!computed) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-center max-w-md">
            <div className="text-4xl mb-4">&#128225;</div>
            <h2 className="text-lg font-bold mb-2">Signal Analysis</h2>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">
              Technical signals require historical price data. Go to the{' '}
              <span className="text-[var(--color-amber-500)] font-medium">Analysis</span>{' '}
              tab and click <span className="font-medium">"Load Historical Data"</span> to compute RSI, moving averages, and composite signals.
            </p>
            <p className="text-[10px] text-[var(--color-text-dim)]">
              Rebalance drift and stop-loss alerts work with live quotes (no history needed) and are shown on the Dashboard.
            </p>
          </div>
        </div>
        <BuyRecommendations />
        <SellRecommendations />
        <PlaybookPanel />
        <BearCasePanel />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PortfolioHealthBar score={portfolioHealth} />
      <InsightsPanel />
      <BuyRecommendations />
      <SellRecommendations />
      <SignalSummaryTable />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RebalancePanel />
        <ConcentrationPanel />
      </div>
      <PlaybookPanel />
      <BearCasePanel />
      <StopLossConfig />
      <SignalDetailGrid />
    </div>
  );
}
