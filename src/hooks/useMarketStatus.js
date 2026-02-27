import { useState, useEffect } from 'react';
import { isMarketOpen } from '../utils/dateUtils.js';

export function useMarketStatus() {
  const [open, setOpen] = useState(isMarketOpen());

  useEffect(() => {
    const id = setInterval(() => setOpen(isMarketOpen()), 60000);
    return () => clearInterval(id);
  }, []);

  return open;
}
