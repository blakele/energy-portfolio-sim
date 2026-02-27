const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'allocations', label: 'Allocations' },
  { id: 'analysis', label: 'Analysis' },
  { id: 'signals', label: 'Signals' },
  { id: 'catalysts', label: 'Catalysts' },
  { id: 'glossary', label: 'Glossary' },
];

export default function TabNav({ active, onChange }) {
  return (
    <nav className="border-b border-[var(--color-border)] px-6 flex gap-1">
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-3 text-xs font-medium transition-colors relative ${
            active === tab.id
              ? 'text-[var(--color-amber-500)]'
              : 'text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)]'
          }`}
        >
          {tab.label}
          {active === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--color-amber-500)]" />
          )}
        </button>
      ))}
    </nav>
  );
}
