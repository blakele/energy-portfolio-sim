export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center py-12 text-[var(--color-text-muted)]">
      <div className="animate-spin w-5 h-5 border-2 border-[var(--color-amber-500)] border-t-transparent rounded-full mr-3" />
      <span className="text-sm">{text}</span>
    </div>
  );
}
