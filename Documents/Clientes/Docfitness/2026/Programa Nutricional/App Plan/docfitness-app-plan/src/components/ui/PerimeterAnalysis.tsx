import React from 'react';

export interface PerimeterAnalysisProps {
  cells: Record<string, Record<string, number | ''>>;
  firstC: string;
  lastC: string;
}

export default function PerimeterAnalysis({ cells, firstC, lastC }: PerimeterAnalysisProps) {
  const keys = ['cint_abd','cadera','pect_esp'];
  return (
    <div className="rounded-[20px] border border-[var(--color-border)] bg-white p-5">
      <div className="premium-section-title">
        <h3 className="text-[12px] font-bold tracking-widest text-[var(--color-text-primary)]">PERÍMETROS • C1 VS ACTUAL</h3>
      </div>
      <div className="mt-4 space-y-3">
        {keys.map(k => {
          const f = cells[firstC]?.[k];
          const l = cells[lastC]?.[k];
          if (typeof f !== 'number' || typeof l !== 'number') return null;
          const max = Math.max(f, l) * 1.1;
          return (
            <div key={k} className="space-y-1">
              <div className="flex justify-between text-[11px] font-medium text-[var(--color-text-primary)]"><span>{k.toUpperCase()}</span><span>{f} → {l} cm</span></div>
              <div className="flex gap-2">
                <div className="h-2 flex-1 rounded-full bg-[var(--color-border)] overflow-hidden"><div className="h-full bg-zinc-300" style={{ width: `${(f / max) * 100}%` }} /></div>
                <div className="h-2 flex-1 rounded-full bg-[var(--color-border)] overflow-hidden"><div className="h-full bg-[var(--color-primary)]" style={{ width: `${(l / max) * 100}%` }} /></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
