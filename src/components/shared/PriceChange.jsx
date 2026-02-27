import { formatPct, pctColor } from '../../utils/formatting.js';

export default function PriceChange({ value, className = '' }) {
  return (
    <span className={className} style={{ color: pctColor(value) }}>
      {formatPct(value)}
    </span>
  );
}
