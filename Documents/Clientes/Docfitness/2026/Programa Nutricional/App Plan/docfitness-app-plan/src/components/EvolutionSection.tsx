import EvolutionTable from './EvolutionTable.tsx';
import Sparkline from './ui/Sparkline.tsx';
import LineChart from './ui/LineChart.tsx';
import InBodyBar from './ui/InBodyBar.tsx';
import useEvolutionData, { UseEvolutionDataReturn } from '../hooks/useEvolutionData.ts';
import { SECTIONS, ADHERENCIA_SECTION } from './EvolutionConstants.ts';
import { useAppContext } from '../context/AppContext.tsx';
import { isConsultaVencida } from '../utils/evolutionHelpers';
import EvolutionSummaryCards from './ui/EvolutionSummaryCards.tsx';
import InBodyAnalysis from './ui/InBodyAnalysis.tsx';
import PerimeterAnalysis from './ui/PerimeterAnalysis.tsx';

interface EvolutionCard {
  label: string;
  key: string;
  unit: string;
  color: string;
  goal: 'up' | 'down';
}

export default function EvolutionSection() {
  const { data, setters, showToast } = useAppContext();
  const { evolution } = data;
  const setData = setters.setEvolution;
  const proximaVencida = isConsultaVencida(data?.fechaConsulta);

  const {
    dates, cells, consultas, setCell, setDates, addConsulta, removeConsulta, handleKeyDown, getSeries, numericSeries, lastC, firstC, activeConsultas,
    getAvanceConsecutivo, avanceGlobal, handleClear,
  }: UseEvolutionDataReturn = useEvolutionData(evolution, setData, showToast);

  const summaryCards: EvolutionCard[] = [
    { label: 'PESO', key: 'peso', unit: 'kg', color: 'var(--color-primary)', goal: 'down' },
    { label: 'GRASA CORPORAL', key: 'grasa_pct', unit: '%', color: 'var(--color-accent)', goal: 'down' },
    { label: 'MASA MUSCULAR', key: 'muscular', unit: 'kg', color: 'var(--color-green)', goal: 'up' },
    { label: 'GRASA VISCERAL', key: 'visceral', unit: '', color: 'var(--color-danger)', goal: 'down' },
  ];

  return (
    <div className="w-full bg-transparent font-sans antialiased">
      <div className="mx-auto max-w-[1280px] p-4 md:p-6 space-y-5">
        <div className="mb-5">
          <div className="premium-page-title">EVOLUCIÓN</div>
          <div className="premium-subtitle">Composición corporal, perímetros, pliegues</div>
        </div>

        {activeConsultas.length >= 2 && (
          <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-secondary)]">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" /> {activeConsultas.length} consultas registradas
          </div>
        )}

        {proximaVencida && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-xs font-bold text-red-700 uppercase tracking-wider">Consulta vencida</p>
            <p className="text-sm text-red-600 mt-1">La próxima actualización programada ya pasó. Actualizá la fecha de consulta o programá una nueva.</p>
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <div className="premium-section-title">
            <h3 className="text-[12px] font-bold tracking-widest text-[var(--color-text-primary)]">CONSULTAS</h3>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={addConsulta} className="premium-btn-pill premium-btn-pill--primary text-[11px] py-1.5 px-3">
              + Consulta
            </button>
          </div>
        </div>

        <EvolutionTable
          title="MEDIDAS"
          sections={SECTIONS}
          consultas={consultas}
          dates={dates}
          cells={cells}
          setCell={setCell}
          setDates={setDates}
          removeConsulta={removeConsulta}
          handleKeyDown={handleKeyDown}
          getAvanceConsecutivo={getAvanceConsecutivo}
        />

        <EvolutionTable
          title="ADHERENCIA"
          sections={[ADHERENCIA_SECTION]}
          consultas={consultas}
          dates={dates}
          cells={cells}
          setCell={setCell}
          setDates={setDates}
          removeConsulta={removeConsulta}
          handleKeyDown={handleKeyDown}
          getAvanceConsecutivo={getAvanceConsecutivo}
        />

        {activeConsultas.length >= 2 && (
            <>
              <EvolutionSummaryCards
                cards={summaryCards}
                numericSeries={numericSeries}
                avanceGlobal={avanceGlobal}
                firstC={firstC}
              />

              <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
                  <div className="rounded-[20px] border border-[var(--color-border)] bg-white p-5">
                    <div className="premium-section-title">
                      <h3 className="text-[12px] font-bold tracking-widest text-[var(--color-text-primary)]">COMPOSICIÓN • PESO / GRASA / MÚSCULO</h3>
                    </div>
                    <div className="mt-4">
                    <LineChart series={[
                      { name: 'Peso', color: 'var(--color-primary)', data: getSeries('peso') },
                     { name: 'Grasa KG', color: 'var(--color-accent)', data: getSeries('grasa_kg') },
                     { name: 'Músculo KG', color: 'var(--color-green)', data: getSeries('muscular') },
                    ]} consultas={activeConsultas} />
                  </div>
                </div>

                <InBodyAnalysis
                  cells={cells}
                  lastC={lastC}
                  avanceGlobal={avanceGlobal}
                  firstC={firstC}
                  inBodyConfig={evolution?.inBodyConfig}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <PerimeterAnalysis cells={cells} firstC={firstC} lastC={lastC} />
                <div className="rounded-[20px] border border-[var(--color-border)] bg-white p-5">
                  <div className="premium-section-title">
                    <h3 className="text-[12px] font-bold tracking-widest text-[var(--color-text-primary)]">PLIEGUES • EVOLUCIÓN</h3>
                  </div>
                  <div className="mt-4">
                     <LineChart series={[{ name: 'Sumatoria', color: 'var(--color-navy)', data: getSeries('sum_pliegues') }]} consultas={activeConsultas} />
                  </div>
                </div>
              </div>
            </>
        )}
      </div>
    </div>
  );
}
