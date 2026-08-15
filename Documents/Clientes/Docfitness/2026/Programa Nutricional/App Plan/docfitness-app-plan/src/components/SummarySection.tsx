import React, { useState, useEffect, useMemo } from 'react';
import SectionTitle from './ui/SectionTitle.tsx';
import AvancesCards from './AvancesCards.tsx';
import MacroBars from './MacroBars.tsx';
import MetricCard from './ui/MetricCard.tsx';
import ValueWithPlaceholder from './ui/ValueWithPlaceholder.tsx';
import { useAppContext } from '../context/AppContext.tsx';
import { getTotalKcalFromMeals, getTotalMacrosFromMeals } from '../utils/nutritionHelpers.ts';
import { runAllSafetyChecks } from '../utils/safetyRules.ts';
import { isConsultaVencida } from '../utils/evolutionHelpers.ts';
import { toInputDate, fromInputDate, getFechaActual } from '../utils/summaryHelpers.ts';
import { useSummaryLists } from '../hooks/useSummaryLists.tsx';

export default function SummarySection({ printable = false }) {
  const { data, setters, devMode, setActivePatient, showToast } = useAppContext();
  const d = data || {};

  const person = d.person || {};
  const stats = d.stats || {};
  const nutrition = d.nutrition || {};
  const training = d.training || {};
  const meals = d.meals || [];

  const { retroItems, setRetroItems, diagItems, setDiagItems, objItems, setObjItems, renderList, RETRO_PLACEHOLDER, DIAG_PLACEHOLDER, OBJ_PLACEHOLDER } = useSummaryLists({
    feedback: d.feedback,
    diagnosis: d.diagnosis,
    objectives: d.objectives,
    onFeedbackChange: (obj) => setters.setFeedback(obj),
    onDiagnosisChange: (obj) => setters.setDiagnosis(obj),
    onObjectivesChange: (obj) => setters.setObjectives(obj),
  });

  const safety = useMemo(() => runAllSafetyChecks(data), [data]);

  const handleFechaConsultaChange = (e) => {
    const value = fromInputDate(e.target.value);
    setters.setFechaConsulta(value);
  };

  const handleProximaConsultaChange = (e) => {
    const value = fromInputDate(e.target.value);
    setters.setProximaConsulta(value);
  };

  const fechaConsulta = d.fechaConsulta || '';
  const proximaConsulta = d.proximaConsulta || '';
  const proximaConsultaVencida = isConsultaVencida(fechaConsulta);
  const fechaActual = getFechaActual(fechaConsulta);

  const [showDatePicker, setShowDatePicker] = useState(false);

  const effectiveKcal = Number(nutrition.kcal) || getTotalKcalFromMeals(meals) || 0;
  const totalMacros = getTotalMacrosFromMeals(meals);
  const effectiveProte = Number(nutrition.prot) || totalMacros.p || 0;
  const effectiveCarbs = Number(nutrition.carbs) || totalMacros.c || 0;
  const effectiveGrasas = Number(nutrition.grasas) || totalMacros.g || 0;

  const protePct = Math.round((effectiveProte * 4 / (effectiveProte * 4 + effectiveCarbs * 4 + effectiveGrasas * 9 || 1)) * 100) || 0;
  const carbsPct = Math.round((effectiveCarbs * 4 / (effectiveProte * 4 + effectiveCarbs * 4 + effectiveGrasas * 9 || 1)) * 100) || 0;
  const grasasPct = Math.round((effectiveGrasas * 9 / (effectiveProte * 4 + effectiveCarbs * 4 + effectiveGrasas * 9 || 1)) * 100) || 0;

  return (
    <div className={printable ? "w-full bg-white text-[var(--color-navy)] font-[Inter] p-4" : "w-full bg-transparent text-[var(--color-navy)] font-[Inter] p-4"}>
      {!printable && safety.alerts.length > 0 && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-red-600 font-bold text-sm">Alertas de seguridad</span>
            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{safety.alerts.length}</span>
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {safety.alerts.slice(0, 5).map((alert, i) => (
              <div key={i} className={`text-xs flex items-start gap-2 ${alert.level === 'critical' ? 'text-red-800' : alert.level === 'high' ? 'text-orange-800' : 'text-yellow-800'}`}>
                <span className="mt-0.5 font-bold">[{alert.level.toUpperCase()}]</span>
                <span>{alert.message}</span>
              </div>
            ))}
            {safety.alerts.length > 5 && (
              <p className="text-xs text-red-600">...y {safety.alerts.length - 5} alertas más. Revisá el perfil para ver todas.</p>
            )}
          </div>
        </div>
      )}

      <div>
        <div>
          <p className="typo-label font-bold tracking-widest uppercase text-[10px] mb-1">Fecha de consulta</p>
          {!printable ? (
            <input
              type="date"
              value={toInputDate(fechaConsulta)}
              onChange={handleFechaConsultaChange}
              className="text-xl font-extrabold text-[var(--color-navy)] leading-tight bg-transparent border-b border-transparent focus:border-[var(--color-primary)] outline-none"
            />
          ) : (
            <h1 className="text-3xl font-extrabold text-[var(--color-navy)] leading-tight">{fechaActual}</h1>
          )}
          {!printable && <p className="premium-subtitle mt-1">Resumen general del plan.</p>}
          <div className="mt-3">
            <span className="inline-block bg-[var(--color-primary)] text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
              Próxima actualización
            </span>
            {!printable ? (
              <div className="mt-2">
                {showDatePicker ? (
                  <input
                    type="date"
                    value={toInputDate(proximaConsulta)}
                    onChange={(e) => {
                      handleProximaConsultaChange(e);
                      setShowDatePicker(false);
                    }}
                    onBlur={() => setShowDatePicker(false)}
                    className="text-base font-semibold text-[var(--color-primary)] bg-transparent border-b border-transparent focus:border-[var(--color-primary)] outline-none"
                    autoFocus
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(true)}
                    className="text-base text-[var(--color-primary)] font-semibold underline underline-offset-4 decoration-2 decoration-[var(--color-primary)]/30 hover:decoration-[var(--color-primary)] transition-colors"
                  >
                    {proximaConsulta || '—'}
                  </button>
                )}
              </div>
            ) : (
              <p className="text-base text-[var(--color-primary)] font-semibold mt-2">{proximaConsulta || '—'}</p>
            )}
          </div>
          {!printable && proximaConsultaVencida && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-xs font-bold text-red-700 uppercase tracking-wider">Consulta vencida</p>
              <p className="text-sm text-red-600 mt-1">La próxima actualización programada ya pasó. Actualizá la fecha de consulta o programá una nueva.</p>
            </div>
          )}
        </div>
      </div>

      <div className={printable ? "mt-3" : "mt-6"}>
        <SectionTitle>Perfil</SectionTitle>
        <div className={printable ? "grid grid-cols-4 gap-2" : "grid grid-cols-4 gap-2"}>
          {[
            ["Nombre", person.nombre, "Nombre completo"],
            ["Edad", person.edad, "25"],
            ["Contacto", person.celular, "55XXXXXXXXX"],
            ["País/Región", person.pais, "México"],
            ["Act. Física 1", person.act1, "Act. Física 1"],
            ["Act. Física 2", person.act2, "Act. Física 2"],
            ["Alergias", person.alergias, "Ninguna"],
            ["Condición Méd.", person.condicionMedica, "Ninguna"],
          ].map(([label, value, refVal])=>(
              <MetricCard
                key={label}
                label={label}
                value={<ValueWithPlaceholder value={value} placeholder={refVal} />}
                color="var(--color-navy)"
                className={!value ? 'opacity-60' : ''}
              />
          )          )}
        </div>
      </div>

      <div className={printable ? "mt-6" : "mt-8"}>
        <AvancesCards data={data} printable={printable} />
      </div>
      <div className={printable ? "mt-3" : "mt-4"}>
        <MacroBars stats={stats} printable={printable} />
      </div>

      <div className={printable ? "mt-4" : "mt-6"}>
        <SectionTitle>Tratamiento Nutricional</SectionTitle>
        <div className={printable ? "grid grid-cols-5 gap-2" : "grid grid-cols-5 gap-2"}>
          <MetricCard
            label="Estrategia"
            value={<ValueWithPlaceholder value={nutrition.estrategia} placeholder="Mantenimiento" />}
            color="var(--color-green)"
            className="!bg-[var(--color-green)] text-white"
            valueClassName={printable ? "text-sm" : "text-lg"}
            forceWhiteText
          >
            {!printable && <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden"><div className="h-full bg-white w-[70%]" /></div>}
          </MetricCard>
          <MetricCard
            label="KCAL"
            value={effectiveKcal || '—'}
            helper="Meta Diaria"
            color="var(--color-navy)"
          />
          <div className={`col-span-3 flex ${printable ? '' : ''}`}>
            {[
               ["Proteína (g)", effectiveProte, protePct, "140", "28%"],
               ["Carbohidratos (g)", effectiveCarbs, carbsPct, "220", "45%"],
               ["Grasas (g)", effectiveGrasas, grasasPct, "55", "27%"],
             ].map(([l,k,pk,rv,rp], idx, arr)=>(
              <div key={l} className={`nutrition-metric-card flex-1 text-center ${printable ? 'p-3' : 'p-4'} ${idx < arr.length - 1 ? 'border-r border-[var(--color-border)]' : ''}`}>
                <span className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">{l}</span>
                <p className={`nutrition-metric-card__value ${printable ? 'text-sm' : 'text-xl'} mt-2 ${idx === 0 ? 'nutrition-metric-card__value--protein' : idx === 1 ? 'nutrition-metric-card__value--carbs' : idx === 2 ? 'nutrition-metric-card__value--fat' : ''}`}>{k || '—'}</p>
                <p className={`nutrition-metric-card__value ${printable ? 'text-sm' : 'text-xl'} mt-1 ${idx === 0 ? 'nutrition-metric-card__value--protein' : idx === 1 ? 'nutrition-metric-card__value--carbs' : idx === 2 ? 'nutrition-metric-card__value--fat' : ''}`}>{pk}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={printable ? "mt-4" : "mt-6"}>
        <SectionTitle>Tratamiento de Entrenamiento</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <MetricCard
            label="Estrategia"
            value={
              <input
                type="text"
                value={training.estrategia || ''}
                onChange={(e) => {
                  if (setters.setTraining) {
                    setters.setTraining(prev => ({ ...prev, estrategia: e.target.value }));
                  }
                }}
                placeholder="Split muscular 4 días"
                className="mt-2 w-full bg-transparent outline-none text-white text-sm font-bold leading-tight"
              />
            }
            color="var(--color-navy)"
            className="!bg-[var(--color-navy)] text-white"
            forceWhiteText
          />
          <MetricCard
            label="Días/semana"
            value={(() => {
              const calendar = d.calendar || [];
              const days = calendar.filter((day) => {
                const act = (day.actividad || '').toLowerCase();
                return act && act !== 'descanso';
              });
              return days.length || '—';
            })()}
            color="var(--color-navy)"
          />
          <MetricCard
            label="Cardio"
            value={(() => {
              const calendar = d.calendar || [];
              const days = calendar.filter((day) => {
                const act = (day.actividad || '').toLowerCase();
                return act && act !== 'descanso';
              });
              const cardioDays = days.filter((day) => (day.actividad || '').toLowerCase().includes('cardio'));
              return cardioDays.length || '—';
            })()}
            color="var(--color-green)"
          />
          <MetricCard
            label="Volumen"
            value={(() => {
              const routines = d.routines || [];
              const vol = (routines || []).reduce((sum, r) => {
                const ejercicios = Array.isArray(r.ejercicios) ? r.ejercicios : [];
                return sum + ejercicios.reduce((s, ej) => s + (parseInt(ej.semana1 || ej.sets || '0') || 0), 0);
              }, 0);
              return vol || '—';
            })()}
            color="var(--color-accent)"
          />
        </div>
      </div>

      <div className={printable ? "mt-4" : "mt-6"}>
        <SectionTitle>Retroalimentación</SectionTitle>
        {renderList(retroItems, setRetroItems, RETRO_PLACEHOLDER)}
      </div>
      <div className={printable ? "mt-4" : "mt-6"}>
        <SectionTitle>Diagnóstico</SectionTitle>
        {renderList(diagItems, setDiagItems, DIAG_PLACEHOLDER)}
      </div>
      <div className={printable ? "mt-4" : "mt-6"}>
        <SectionTitle>Objetivos y plan a seguir</SectionTitle>
        {renderList(objItems, setObjItems, OBJ_PLACEHOLDER)}
      </div>

      {!printable && (() => {
        const kcalDeclaradas = Number(effectiveKcal) || 0;
        const kcalCalculadas = (effectiveProte || 0) * 4 + (effectiveCarbs || 0) * 4 + (effectiveGrasas || 0) * 9;
        const diff = kcalDeclaradas ? Math.abs(kcalCalculadas - kcalDeclaradas) / kcalDeclaradas : 0;
        const hayIncoherencia = kcalDeclaradas > 0 && diff > 0.05;
        return hayIncoherencia ? (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-xs font-bold text-red-700 uppercase tracking-wider">Incoherencia nutricional</p>
            <p className="text-sm text-red-600 mt-1">
              Las kcal declaradas ({kcalDeclaradas}) no coinciden con los macros ingresados ({Math.round(kcalCalculadas)} kcal).
              Diferencia: {Math.round(diff * 100)}%.
            </p>
          </div>
        ) : null;
      })()}
    </div>
  );
}