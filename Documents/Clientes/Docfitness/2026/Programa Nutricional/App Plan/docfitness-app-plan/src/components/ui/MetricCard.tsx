import React from 'react';
import ProgressBar from './ProgressBar.tsx';

export interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  helper?: string;
  color?: string;
  className?: string;
  valueClassName?: string;
  progress?: { value: number; color?: string; max?: number };
  pill?: React.ReactNode;
}

export default function MetricCard({ label, value, helper, color = 'var(--color-navy)', className = '', valueClassName = '', progress, forceWhiteText = false, pill }: MetricCardProps) {
  const textColor = forceWhiteText ? 'text-white' : '';
  const labelColor = forceWhiteText ? 'text-white/70' : 'text-[var(--color-text-muted)]';
  const helperColor = forceWhiteText ? 'text-white/70' : 'text-[var(--color-text-muted)]';

  return (
    <div className={`rounded-2xl border border-[var(--color-border)] bg-white p-4 flex flex-col justify-between relative ${className}`}>
      {pill ? <div className="absolute top-3 right-3">{pill}</div> : null}
      <div>
        <span className={`text-[10px] font-bold tracking-widest uppercase block mb-1 ${labelColor}`}>{label}</span>
        <span className={`text-xl font-extrabold leading-none block mt-1 ${textColor} ${valueClassName}`} style={{ color: forceWhiteText ? undefined : color }}>{value}</span>
        {helper ? <div className={`text-[10px] mt-1 ${helperColor}`}>{helper}</div> : null}
      </div>
      {progress ? (
        <div className="mt-3">
          <ProgressBar value={progress.value} max={progress.max ?? 100} color={progress.color ?? 'var(--color-navy)'} />
        </div>
      ) : null}
    </div>
  );
}
