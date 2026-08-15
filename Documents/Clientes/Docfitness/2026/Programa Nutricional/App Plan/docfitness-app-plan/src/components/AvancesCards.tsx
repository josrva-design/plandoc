import React from 'react';
import SectionTitle from './ui/SectionTitle.tsx';
import MetricCard from './ui/MetricCard.tsx';
import { buildMetricas, avanceGlobal, valorActual, valorAnterior } from '../utils/evolutionMetrics.ts';

export default function AvancesCards({ data, printable }) {
  const d = data || {};
  const consultas = d.evolution?.consultas || [];
  const cells = d.evolution?.cells || {};
  const METRICAS = buildMetricas(consultas, cells);

  return (
    <>
      <SectionTitle>Avances</SectionTitle>
      
        <div className={printable ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2" : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2"}>
          {METRICAS.map((m) => {
            const actualVal = valorActual(consultas, cells, m.key) || m.actualPh;
            const avanceVal = avanceGlobal(consultas, cells, m.key);
            const anteriorVal = valorAnterior(consultas, cells, m.key);
            const hasAvance = avanceVal !== null;
            const displayAvance = hasAvance ? (avanceVal > 0 ? `+${avanceVal}` : `${avanceVal}`) : m.avancePh;
            const actualNum = parseFloat(String(actualVal).replace(/[^\d.-]/g, '')) || 0;
            const avanceNum = parseFloat(String(displayAvance).replace(/[^\d.-]/g, '')) || 0;
            const anteriorNum = anteriorVal !== null ? parseFloat(String(anteriorVal).replace(/[^\d.-]/g, '')) : null;
            const anteriorDisplay = anteriorNum !== null ? (m.suffix ? `${anteriorNum}${m.suffix}` : anteriorNum.toString()) : '-';
            const valueOpacity = hasAvance ? '' : 'opacity-30';
            const pillOpacity = hasAvance ? '' : 'opacity-30';

            return (
              <MetricCard
                key={m.label}
                label={m.label}
                value={
                  <div className="flex items-end justify-center gap-2 mt-2">
                    <div className="text-center">
                      <p className={`text-lg font-extrabold leading-none ${m.primary || m.dark ? 'text-white/90' : 'text-[var(--color-navy)]'} ${valueOpacity}`}>{anteriorDisplay}</p>
                      <p className={`text-[9px] mt-1 font-bold uppercase tracking-wider ${m.primary || m.dark ? 'text-white/60' : 'text-[var(--color-text-muted)]'}`}>Anterior</p>
                    </div>
                    <span className={`text-xs font-bold pb-0.5 ${m.primary || m.dark ? 'text-white/40' : 'text-[var(--color-text-muted)]'}`}>-</span>
                    <div className="text-center">
                      <p className={`text-lg font-extrabold leading-none ${m.primary || m.dark ? 'text-white' : 'text-[var(--color-navy)]'} ${valueOpacity}`}>{actualVal}</p>
                      <p className={`text-[9px] mt-1 font-bold uppercase tracking-wider ${m.primary || m.dark ? 'text-white/60' : 'text-[var(--color-text-muted)]'}`}>Actual</p>
                    </div>
                  </div>
                }
                color={m.primary ? 'var(--color-primary)' : m.dark ? 'var(--color-navy)' : 'var(--color-navy)'}
                className={`relative ${m.primary ? '!bg-[var(--color-primary)] text-white border-transparent' : m.dark ? '!bg-[var(--color-navy)] text-white border-transparent' : ''}`}
                valueClassName={m.primary || m.dark ? 'text-white' : ''}
                forceWhiteText={m.primary || m.dark}
              >
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full ${pillOpacity} ${m.primary || m.dark ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'}`}>
                    {avanceNum > 0 ? '↑' : avanceNum < 0 ? '↓' : ''} {displayAvance}
                  </span>
                </div>
              </MetricCard>
            );
          })}
        </div>
    </>
  );
}
