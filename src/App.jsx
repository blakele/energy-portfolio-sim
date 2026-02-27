import { useState, useCallback } from 'react';
import { hasApiKey } from './services/finnhub.js';
import { usePrices } from './hooks/usePrices.js';
import { useFundamentals } from './hooks/useFundamentals.js';
import { useSnapshots } from './hooks/useSnapshots.js';
import { useSignals } from './hooks/useSignals.js';
import Header from './components/layout/Header.jsx';
import TabNav from './components/layout/TabNav.jsx';
import ApiKeyPrompt from './components/layout/ApiKeyPrompt.jsx';
import DashboardPage from './components/dashboard/DashboardPage.jsx';
import AllocationsPage from './components/allocations/AllocationsPage.jsx';
import AnalysisPage from './components/analysis/AnalysisPage.jsx';
import SignalsPage from './components/signals/SignalsPage.jsx';
import CatalystsPage from './components/catalysts/CatalystsPage.jsx';
import GlossaryPage from './components/glossary/GlossaryPage.jsx';

export default function App() {
  const [hasKey, setHasKey] = useState(hasApiKey());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const { refresh: refreshPrices, loading: pricesLoading } = usePrices();
  const { refresh: refreshFundamentals, loading: fundamentalsLoading } = useFundamentals();
  const { snapshotCount, firstDate, hasTodaySnapshot, exportSnapshots } = useSnapshots();
  useSignals();

  const loading = pricesLoading || fundamentalsLoading;

  const handleRefresh = useCallback(() => {
    refreshPrices();
    refreshFundamentals();
  }, [refreshPrices, refreshFundamentals]);

  const handleKeySet = useCallback(() => {
    setHasKey(true);
    setShowSettings(false);
    refreshPrices();
    refreshFundamentals();
  }, [refreshPrices, refreshFundamentals]);

  if (!hasKey || showSettings) {
    return <ApiKeyPrompt onComplete={handleKeySet} />;
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex flex-col">
      <Header
        onRefresh={handleRefresh}
        loading={loading}
        onSettingsClick={() => setShowSettings(true)}
      />
      <TabNav active={activeTab} onChange={setActiveTab} />
      <main className="flex-1 p-6 max-w-[1400px] w-full mx-auto">
        {activeTab === 'dashboard' && <DashboardPage />}
        {activeTab === 'allocations' && <AllocationsPage />}
        {activeTab === 'analysis' && <AnalysisPage />}
        {activeTab === 'signals' && <SignalsPage />}
        {activeTab === 'catalysts' && <CatalystsPage />}
        {activeTab === 'glossary' && <GlossaryPage />}
      </main>
      <footer className="border-t border-[var(--color-border)] px-6 py-3 flex items-center justify-between">
        <span className="text-[10px] text-[var(--color-text-dim)]">
          Energy &times; AI Portfolio Simulator &bull; Data from Finnhub &bull; Not financial advice
        </span>
        <div className="flex items-center gap-3 text-[10px] text-[var(--color-text-dim)]">
          <span>
            {snapshotCount > 0
              ? `${snapshotCount} day${snapshotCount !== 1 ? 's' : ''} tracked${firstDate ? ` since ${firstDate}` : ''}`
              : 'Tracking starts today'}
            {hasTodaySnapshot && ' \u2713'}
          </span>
          {snapshotCount > 0 && (
            <button
              onClick={exportSnapshots}
              className="text-[var(--color-amber-500)] hover:underline"
            >
              Export
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
