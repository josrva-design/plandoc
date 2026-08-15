import React from 'react';

export interface NutritionPlanHeaderProps {
  estrategia?: string;
  onEstrategiaChange?: (value: string) => void;
  totalKcal?: number | string;
  totalMacros?: { p?: number | string; c?: number | string; g?: number | string };
  macroPercentages?: { p?: number | string; c?: number | string; g?: number | string };
}

export default function NutritionPlanHeader({ estrategia, onEstrategiaChange, totalKcal, totalMacros, macroPercentages }: NutritionPlanHeaderProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
      <div className="nutrition-strategy-card">
        <p className="typo-card-label-white">Estrategia</p>
        {onEstrategiaChange ? (
          <input
            type="text"
            value={estrategia || ''}
            onChange={(e) => onEstrategiaChange(e.target.value)}
            placeholder="Mantenimiento"
            className="mt-1 w-full bg-transparent outline-none text-white text-sm font-bold"
          />
        ) : (
          <p className="mt-1 text-sm font-bold text-white">{estrategia || '—'}</p>
        )}
        <p className="typo-muted-sm opacity-80 mt-2">Plan nutricional</p>
      </div>
      <div className="nutrition-metric-card text-center">
        <span className="nutrition-metric-card__label">KCAL</span>
        <p className="nutrition-metric-card__value nutrition-metric-card__value--kcal mt-1 w-full text-center">{totalKcal || '—'}</p>
        <p className="typo-muted-sm opacity-60 mt-1">Total comidas</p>
      </div>
      <div className="nutrition-metric-card text-center">
        <span className="nutrition-metric-card__label">Proteína (g)</span>
        <p className="nutrition-metric-card__value nutrition-metric-card__value--protein mt-1 w-full text-center">{totalMacros?.p || '—'}</p>
        <p className="typo-muted-sm opacity-60 mt-1">{macroPercentages?.p ?? '—'}%</p>
      </div>
      <div className="nutrition-metric-card text-center">
        <span className="nutrition-metric-card__label">Carbohidratos (g)</span>
        <p className="nutrition-metric-card__value nutrition-metric-card__value--carbs mt-1 w-full text-center">{totalMacros?.c || '—'}</p>
        <p className="typo-muted-sm opacity-60 mt-1">{macroPercentages?.c ?? '—'}%</p>
      </div>
      <div className="nutrition-metric-card text-center">
        <span className="nutrition-metric-card__label">Grasas (g)</span>
        <p className="nutrition-metric-card__value nutrition-metric-card__value--fat mt-1 w-full text-center">{totalMacros?.g || '—'}</p>
        <p className="typo-muted-sm opacity-60 mt-1">{macroPercentages?.g ?? '—'}%</p>
      </div>
    </div>
  );
}
