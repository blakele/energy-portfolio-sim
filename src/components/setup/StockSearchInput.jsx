import { useState, useRef, useCallback } from 'react';
import { searchSymbol, validateSymbol } from '../../services/symbolSearch.js';

export default function StockSearchInput({ onAdd, existingSymbols = [] }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState('');
  const debounceRef = useRef(null);

  const doSearch = useCallback(async (q) => {
    if (q.length < 1) {
      setResults([]);
      return;
    }
    setSearching(true);
    setError('');
    try {
      const res = await searchSymbol(q);
      setResults(res.filter(r => !existingSymbols.includes(r.symbol)));
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, [existingSymbols]);

  const handleInput = (value) => {
    setQuery(value);
    setError('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value.trim().toUpperCase()), 300);
  };

  const handleSelect = async (result) => {
    setValidating(true);
    setError('');
    try {
      const quote = await validateSymbol(result.symbol);
      if (!quote) {
        setError(`Could not get a price for ${result.symbol}`);
        setValidating(false);
        return;
      }
      onAdd({
        symbol: result.symbol,
        name: result.description,
        entryPrice: quote.price,
        sector: 'Other',
        tier: 2,
        icon: '',
      });
      setQuery('');
      setResults([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setValidating(false);
    }
  };

  const handleDirectAdd = async () => {
    const symbol = query.trim().toUpperCase();
    if (!symbol) return;
    if (existingSymbols.includes(symbol)) {
      setError(`${symbol} is already in your portfolio`);
      return;
    }
    setValidating(true);
    setError('');
    try {
      const quote = await validateSymbol(symbol);
      if (!quote) {
        setError(`Could not get a price for ${symbol}. Check the symbol.`);
        setValidating(false);
        return;
      }
      // Try to get name from search results
      const nameResult = results.find(r => r.symbol === symbol);
      onAdd({
        symbol,
        name: nameResult?.description || symbol,
        entryPrice: quote.price,
        sector: 'Other',
        tier: 2,
        icon: '',
      });
      setQuery('');
      setResults([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setValidating(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleDirectAdd();
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={e => handleInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a ticker symbol (e.g. AAPL, MSFT)..."
          className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-sm text-[var(--color-text)] placeholder-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-amber-500)]"
          disabled={validating}
        />
        <button
          onClick={handleDirectAdd}
          disabled={!query.trim() || validating}
          className="px-4 py-2.5 rounded-lg text-sm font-medium bg-[var(--color-amber-500)] text-black hover:bg-[var(--color-amber-600)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {validating ? 'Adding...' : 'Add'}
        </button>
      </div>

      {error && (
        <p className="text-[var(--color-loss)] text-xs mt-1.5">{error}</p>
      )}

      {/* Search results dropdown */}
      {results.length > 0 && !validating && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg overflow-hidden shadow-lg max-h-60 overflow-y-auto">
          {results.map(r => (
            <button
              key={r.symbol}
              onClick={() => handleSelect(r)}
              className="w-full text-left px-4 py-2.5 hover:bg-[rgba(255,255,255,0.06)] transition-colors flex items-center justify-between"
            >
              <div>
                <span className="text-sm font-bold text-[var(--color-amber-500)]">{r.symbol}</span>
                <span className="text-xs text-[var(--color-text-muted)] ml-2">{r.description}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {searching && (
        <p className="text-[10px] text-[var(--color-text-dim)] mt-1">Searching...</p>
      )}
    </div>
  );
}
