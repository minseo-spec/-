interface ProgressBarProps {
  value: number;
  className?: string;
}

export function ProgressBar({ value, className = '' }: ProgressBarProps) {
  const safeValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className={`h-3 overflow-hidden rounded-full bg-line ${className}`}>
      <div className="h-full rounded-full bg-[rgb(var(--theme-mid))] transition-all" style={{ width: `${safeValue}%` }} />
    </div>
  );
}
