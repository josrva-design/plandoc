import React from 'react';

export interface TrainingPlanHeaderProps {
  estrategia?: string;
  onEstrategiaChange?: (value: string) => void;
  dias?: number | string;
  cardio?: number | string;
  volumen?: number | string;
}

export default function TrainingPlanHeader({ estrategia, onEstrategiaChange, dias, cardio, volumen }: TrainingPlanHeaderProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
      <div className="nutrition-strategy-card">
        <span className="typo-card-label-white">Estrategia</span>
        {onEstrategiaChange ? (
          <input
            type="text"
            value={estrategia || ''}
            onChange={(e) => onEstrategiaChange(e.target.value)}
            placeholder="Split muscular 4 días"
            className="mt-1 w-full bg-transparent outline-none text-white text-sm font-bold"
          />
        ) : (
          <p className="mt-1 text-sm font-bold text-white">{estrategia || '—'}</p>
        )}
      </div>
      <div className="nutrition-metric-card text-center">
        <span className="nutrition-metric-card__label">Días/semana</span>
        <p className="nutrition-metric-card__value">{dias || '—'}</p>
        <p className="text-[10px] text-gray-400 mt-1">Meta semanal</p>
      </div>
      <div className="nutrition-metric-card text-center">
        <span className="nutrition-metric-card__label">Cardio</span>
        <p className="nutrition-metric-card__value">{cardio || '—'}</p>
        <p className="text-[10px] text-gray-400 mt-1">Sesiones/semana</p>
      </div>
      <div className="nutrition-metric-card text-center">
        <span className="nutrition-metric-card__label">Volumen</span>
        <p className="nutrition-metric-card__value">{volumen || '—'}</p>
        <p className="text-[10px] text-gray-400 mt-1">Series totales</p>
      </div>
    </div>
  );
}
