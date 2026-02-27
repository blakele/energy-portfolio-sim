import { useState } from 'react';
import { setApiKey } from '../../services/finnhub.js';

export default function ApiKeyPrompt({ onComplete }) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = key.trim();
    if (!trimmed) {
      setError('Please enter your API key');
      return;
    }
    setApiKey(trimmed);
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#161b22] border border-[var(--color-border)] rounded-xl p-8 max-w-md w-full">
        <div className="text-2xl font-bold text-[var(--color-amber-500)] mb-2">
          Portfolio Simulator
        </div>
        <p className="text-sm text-[var(--color-text-muted)] mb-6">
          Enter your free Finnhub API key to fetch live stock prices.
          Get one at{' '}
          <a
            href="https://finnhub.io/register"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-amber-400)] underline"
          >
            finnhub.io/register
          </a>
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={key}
            onChange={(e) => { setKey(e.target.value); setError(''); }}
            placeholder="Enter Finnhub API key..."
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-sm text-[var(--color-text)] placeholder-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-amber-500)] mb-3"
            autoFocus
          />
          {error && <p className="text-[var(--color-loss)] text-xs mb-3">{error}</p>}
          <button
            type="submit"
            className="w-full bg-[var(--color-amber-500)] hover:bg-[var(--color-amber-600)] text-black font-bold py-3 rounded-lg text-sm transition-colors"
          >
            Connect
          </button>
        </form>
        <p className="text-[10px] text-[var(--color-text-dim)] mt-4 text-center">
          Key is stored locally in your browser. Never sent anywhere except Finnhub.
        </p>
      </div>
    </div>
  );
}
