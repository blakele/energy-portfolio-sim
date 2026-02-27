import { useEffect, useState } from 'react';
import { usePriceStore } from '../stores/priceStore.js';
import { usePortfolioStore } from '../stores/portfolioStore.js';
import {
  takeSnapshot,
  loadSnapshots,
  hasSnapshotForToday,
  getSnapshotCount,
  getFirstSnapshotDate,
  exportSnapshots,
  clearSnapshots,
} from '../services/snapshots.js';

export function useSnapshots() {
  const quotes = usePriceStore(s => s.quotes);
  const allocations = usePortfolioStore(s => s.allocations);
  const investmentAmount = usePortfolioStore(s => s.investmentAmount);
  const [snapshots, setSnapshots] = useState(loadSnapshots);
  const [snapshotTaken, setSnapshotTaken] = useState(hasSnapshotForToday);

  // Auto-snapshot once per day when quotes are available
  useEffect(() => {
    if (snapshotTaken) return;
    if (Object.keys(quotes).length < 3) return;

    const { stocks, benchmark } = usePortfolioStore.getState();

    const result = takeSnapshot({
      quotes,
      allocations,
      investmentAmount,
      stocks,
      benchmark,
    });

    if (result) {
      setSnapshots(loadSnapshots());
      setSnapshotTaken(true);
    }
  }, [quotes, allocations, investmentAmount, snapshotTaken]);

  return {
    snapshots,
    snapshotCount: snapshots.length,
    firstDate: snapshots.length > 0 ? snapshots[0].date : null,
    hasTodaySnapshot: snapshotTaken,
    exportSnapshots,
    clearSnapshots: () => {
      clearSnapshots();
      setSnapshots([]);
      setSnapshotTaken(false);
    },
  };
}
