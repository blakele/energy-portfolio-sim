import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Vite plugin that serves Yahoo Finance fundamental metrics via a server middleware.
 * Uses yahoo-finance2 library which handles crumb/cookie auth internally.
 * The browser calls /api/yahoo-fundamentals?symbol=CEG and gets clean JSON back.
 */
function yahooFundamentalsPlugin() {
  let yf = null;

  return {
    name: 'yahoo-fundamentals',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/yahoo-fundamentals')) {
          return next();
        }

        // Lazy-load yahoo-finance2 on first request (v3 requires instantiation)
        if (!yf) {
          try {
            const mod = await import('yahoo-finance2');
            const YahooFinance = mod.default;
            yf = new YahooFinance();
          } catch (err) {
            console.error('[Yahoo Fundamentals] Failed to load yahoo-finance2:', err.message);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Failed to load yahoo-finance2: ' + err.message }));
            return;
          }
        }

        const url = new URL(req.url, 'http://localhost');
        const symbol = url.searchParams.get('symbol');

        if (!symbol) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Missing symbol parameter' }));
          return;
        }

        try {
          const result = await yf.quoteSummary(symbol, {
            modules: ['summaryDetail', 'defaultKeyStatistics', 'financialData'],
          });

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(result));
        } catch (err) {
          console.error(`[Yahoo Fundamentals] ${symbol}:`, err.message);
          res.statusCode = 502;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), yahooFundamentalsPlugin()],
  server: {
    proxy: {
      '/api/yahoo': {
        target: 'https://query1.finance.yahoo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/yahoo/, ''),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://finance.yahoo.com/',
          'Origin': 'https://finance.yahoo.com',
        },
      },
    },
  },
});
