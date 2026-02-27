import { useState } from 'react';
import { GLOSSARY } from '../../utils/tooltips.js';

const CATEGORIES = ['All', 'General', 'Fundamentals', 'Technical', 'Risk', 'Strategy'];

export default function GlossaryPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = GLOSSARY.filter(entry => {
    const matchesCategory = activeCategory === 'All' || entry.category === activeCategory;
    const matchesSearch = search === '' ||
      entry.term.toLowerCase().includes(search.toLowerCase()) ||
      entry.short.toLowerCase().includes(search.toLowerCase()) ||
      entry.detail.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-6">
        <h2 className="text-lg font-bold mb-1">Investing Glossary</h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          Plain-English explanations of every metric and term used in this app.
          Hover over any <span className="border-b border-dotted border-[var(--color-text-dim)] cursor-help" title="This is what a tooltip looks like!">dotted-underlined label</span> in the app for a quick definition.
        </p>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search terms..."
          className="flex-1 px-3 py-2 text-sm bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg focus:border-[var(--color-amber-500)] outline-none"
        />
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition-colors cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[var(--color-amber-500)] text-black'
                  : 'bg-[var(--color-surface-2)] text-[var(--color-text-dim)] hover:text-[var(--color-text)] border border-[var(--color-border)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="text-[10px] text-[var(--color-text-dim)]">
        {filtered.length} term{filtered.length !== 1 ? 's' : ''}
        {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
        {search ? ` matching "${search}"` : ''}
      </div>

      {/* Glossary entries */}
      <div className="space-y-3">
        {filtered.map(entry => (
          <div
            key={entry.term}
            className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-4 hover:border-[var(--color-border-amber)] transition-colors"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="text-sm font-bold">{entry.term}</h3>
              <span className="text-[9px] uppercase font-medium px-2 py-0.5 rounded bg-[rgba(255,255,255,0.06)] text-[var(--color-text-dim)] whitespace-nowrap">
                {entry.category}
              </span>
            </div>
            <p className="text-xs text-[var(--color-amber-400)] mb-2">{entry.short}</p>
            <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">{entry.detail}</p>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-sm text-[var(--color-text-dim)]">
          No terms match your search. Try a different keyword.
        </div>
      )}
    </div>
  );
}
