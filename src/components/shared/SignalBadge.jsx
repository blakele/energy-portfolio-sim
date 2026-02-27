import { signalColor, signalBg } from '../../utils/colors.js';

export default function SignalBadge({ signal, size = 'sm' }) {
  if (!signal) return null;
  const textSize = size === 'lg' ? 'text-xs' : 'text-[10px]';
  const padding = size === 'lg' ? 'px-2 py-1' : 'px-1.5 py-0.5';

  return (
    <span
      className={`${textSize} font-bold ${padding} rounded`}
      style={{ color: signalColor(signal), backgroundColor: signalBg(signal) }}
    >
      {signal}
    </span>
  );
}
