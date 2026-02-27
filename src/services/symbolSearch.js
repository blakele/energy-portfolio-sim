import { fetchQuote } from './finnhub.js';

const BASE = 'https://finnhub.io/api/v1';

function getToken() {
  return localStorage.getItem('finnhub_api_key') || '';
}

/**
 * Search for symbols via Finnhub /search endpoint.
 * Returns array of { symbol, description }.
 */
export async function searchSymbol(query) {
  const token = getToken();
  if (!token) throw new Error('No API key configured');
  if (!query || query.length < 1) return [];

  const res = await fetch(`${BASE}/search?q=${encodeURIComponent(query)}&token=${token}`);
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  const data = await res.json();

  // Filter to common stock types on US exchanges
  return (data.result || [])
    .filter(r => r.type === 'Common Stock' || r.type === 'ETP')
    .slice(0, 8)
    .map(r => ({
      symbol: r.symbol,
      description: r.description,
    }));
}

/**
 * Validate a symbol by fetching its quote. Returns the quote if valid, null if not.
 */
export async function validateSymbol(symbol) {
  try {
    const quote = await fetchQuote(symbol);
    return quote;
  } catch {
    return null;
  }
}
