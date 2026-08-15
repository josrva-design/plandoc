import React from 'react';
import InBodyBar from './InBodyBar.tsx';

export interface InBodyAnalysisProps {
  cells: Record<string, Record<string, number | ''>>;
  lastC: string;
  avanceGlobal: (key: string) => number | null;
  firstC: string;
  inBodyConfig?: import('../core/types').InBodyConfig;
}

export default function InBodyAnalysis({ cells, lastC, avanceGlobal, firstC, inBodyConfig }: InBodyAnalysisProps) {
  const peso = cells[lastC]?.peso ?? 0;
  const muscular = cells[lastC]?.muscular ?? 0;
  const grasaPct = cells[lastC]?.grasa_pct ?? 0;
  const avPeso = avanceGlobal('peso');

  let objetivo = 'Registra C2 para ver proyección.';
  if (avPeso !== null) {
    if (avPeso < 0) objetivo = `Vas -${Math.abs(avPeso).toFixed(1)}kg desde ${firstC}. Enfócate en mantener músculo alto.`;
    else objetivo = 'Peso en aumento, revisa adherencia a nutrición.';
  }

  const defaultConfig = {
    peso: { min: 40, max: 120, idealMin: 60, idealMax: 90 },
    muscular: { min: 20, max: 60, idealMin: 30, idealMax: 50 },
    grasaPct: { min: 5, max: 40, idealMin: 12, idealMax: 22 },
  };

  const config = { ...defaultConfig, ...inBodyConfig };

  return (
    <div className="rounded-[20px] border border-[var(--color-border)] bg-white p-5 space-y-5">
      <div className="premium-section-title">
        <h3 className="text-[12px] font-bold tracking-widest text-[var(--color-text-primary)]">ANÁLISIS INBODY</h3>
      </div>
      <InBodyBar label="Peso" value={peso} {...config.peso} />
      <InBodyBar label="Masa Muscular" value={muscular} {...config.muscular} />
      <InBodyBar label="Grasa Corporal %" value={grasaPct} {...config.grasaPct} />
      <div className="rounded-xl bg-[var(--color-navy)] p-3 text-white">
        <p className="text-[11px] font-bold tracking-wide">OBJETIVO</p>
        <p className="mt-1 text-[12px] leading-snug text-zinc-300">{objetivo}</p>
      </div>
    </div>
  );
}
