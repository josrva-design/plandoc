import React from 'react';
import SectionTitle from './ui/SectionTitle.tsx';
import MetricCard from './ui/MetricCard.tsx';

const P = ({ v, ph }) => v ? v : <span className="opacity-20">{ph}</span>;

const fmtPct = (raw, fallback = '0%') => {
  const n = typeof raw === 'number' ? raw : parseFloat(raw);
  if (!Number.isFinite(n)) return fallback;
  return `${n}%`;
};

export default function MacroBars({ stats, printable }) {
  return (
    <>
      <SectionTitle>Adherencia al plan</SectionTitle>
      <div className={printable ? "grid grid-cols-5 gap-2 mt-2" : "grid grid-cols-5 gap-2 mt-2"}>
        <MetricCard
          label="Adherencia al plan"
          value={<P v={stats.adherencia ? `${stats.adherencia}%` : ''} ph="85%" />}
          color="var(--color-green)"
          className="!bg-[var(--color-green)] text-white"
          valueClassName={printable ? "text-base" : "text-2xl"}
          progress={{ value: Number(stats.adherencia) || 0, color: 'var(--color-white)' }}
          forceWhiteText
        />
        {[
          ["Nutrición", stats.nutricion],
          ["Entrenamiento", stats.entreno],
          ["Cardio", stats.cardio],
          ["Descanso", stats.descanso],
        ].map(([l,k])=>(
          <div key={l} className="flex flex-col justify-between">
            <MetricCard
              label={l}
              value={fmtPct(k)}
              color="var(--color-navy)"
              valueClassName={printable ? "text-sm" : "text-xl"}
              progress={{ value: Number(k) || 0, color: 'var(--color-green)' }}
            />
          </div>
        ))}
      </div>
    </>
  );
}
