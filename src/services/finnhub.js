const BASE = 'https://finnhub.io/api/v1';

function getToken() {
  return localStorage.getItem('finnhub_api_key') || '';
}

export async function fetchQuote(symbol) {
  const token = getToken();
  if (!token) throw new Error('No API key configured');
  console.log(`[Finnhub] Fetching quote for ${symbol}...`);
  const res = await fetch(`${BASE}/quote?symbol=${symbol}&token=${token}`);
  if (!res.ok) {
    console.warn(`[Finnhub] ${symbol}: HTTP ${res.status}`);
    if (res.status === 429) throw new Error('Rate limited — wait a moment');
    throw new Error(`Quote fetch failed: ${res.status}`);
  }
  const data = await res.json();
  // data: { c: current, d: change, dp: change%, h: high, l: low, o: open, pc: prev close, t: timestamp }
  if (!data.c || data.c === 0) throw new Error(`No price data for ${symbol}`);
  console.log(`[Finnhub] ${symbol}: $${data.c}`);
  return {
    price: data.c,
    change: data.d,
    changePercent: data.dp,
    high: data.h,
    low: data.l,
    open: data.o,
    prevClose: data.pc,
    timestamp: data.t,
  };
}

export async function fetchCandles(symbol, from, to, resolution = 'D') {
  const token = getToken();
  if (!token) throw new Error('No API key configured');
  const res = await fetch(
    `${BASE}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${token}`
  );
  if (!res.ok) {
    console.warn(`[Finnhub] Candle ${symbol}: HTTP ${res.status}`);
    throw new Error(`Candle fetch failed: ${res.status}`);
  }
  const data = await res.json();
  if (data.s !== 'ok' || !data.c) {
    console.warn(`[Finnhub] Candle ${symbol}: status="${data.s}"`, data);
    return [];
  }
  console.log(`[Finnhub] Candle ${symbol}: ${data.c.length} days loaded`);
  // Convert arrays to array of objects
  return data.t.map((t, i) => ({
    date: t,
    open: data.o[i],
    high: data.h[i],
    low: data.l[i],
    close: data.c[i],
    volume: data.v[i],
  }));
}

export function hasApiKey() {
  return !!localStorage.getItem('finnhub_api_key');
}

export function setApiKey(key) {
  localStorage.setItem('finnhub_api_key', key.trim());
}

export function getApiKey() {
  return localStorage.getItem('finnhub_api_key') || '';
}
