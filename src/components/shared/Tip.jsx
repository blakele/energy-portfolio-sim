import { TOOLTIPS } from '../../utils/tooltips.js';

/**
 * Wraps children with a native tooltip (title attribute).
 * Usage: <Tip term="Sharpe Ratio">Sharpe Ratio</Tip>
 * If no `term` prop, uses children text as lookup key.
 */
export default function Tip({ term, children }) {
  const key = term || (typeof children === 'string' ? children : null);
  const tooltip = key ? TOOLTIPS[key] : null;

  if (!tooltip) return children;

  return (
    <span
      title={tooltip}
      className="cursor-help border-b border-dotted border-[var(--color-text-dim)]"
    >
      {children}
    </span>
  );
}
