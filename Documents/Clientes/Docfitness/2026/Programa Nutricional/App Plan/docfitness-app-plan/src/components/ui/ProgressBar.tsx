import React from 'react';

export interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  trackClassName?: string;
  fillClassName?: string;
  className?: string;
}

export default function ProgressBar({ value, max = 100, color = 'var(--color-navy)', trackClassName = '', fillClassName = '', className = '' }: ProgressBarProps) {
  const safeValue = Math.max(0, Math.min(value, max));
  const pct = Math.round((safeValue / max) * 100);

  return (
    <div className={`h-1.5 w-full bg-[var(--color-border)] rounded-full overflow-hidden ${className} ${trackClassName}`}>
      <div className={`h-full rounded-full ${fillClassName}`} style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}
