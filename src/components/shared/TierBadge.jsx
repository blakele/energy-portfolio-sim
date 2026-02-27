import { tierColor, tierBg } from '../../utils/colors.js';
import { TIERS } from '../../config/portfolio.js';

export default function TierBadge({ tier }) {
  const color = tierColor(tier);
  return (
    <span
      className="text-[10px] font-bold px-1.5 py-0.5 rounded"
      style={{ color, backgroundColor: tierBg(tier) }}
    >
      T{tier}
    </span>
  );
}
