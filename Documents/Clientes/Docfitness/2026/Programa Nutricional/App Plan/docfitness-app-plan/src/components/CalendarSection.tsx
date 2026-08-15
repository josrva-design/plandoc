import { useCallback } from 'react';
import SectionTitle from './ui/SectionTitle.tsx';

const DAY_ORDER = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];

interface CalendarSectionProps {
  calendar: any[];
  routines: any[];
  selectedDayIdx: number;
  editingDay: number | null;
  onSelectDay: (i: number) => void;
  onSetEditingDay: (i: number | null) => void;
  onActividadBlur: (i: number, value: string) => void;
  onCalendarDayClick: (i: number) => void;
}

export default function CalendarSection({
  calendar,
  routines,
  selectedDayIdx,
  editingDay,
  onSelectDay,
  onSetEditingDay,
  onActividadBlur,
  onCalendarDayClick,
}: CalendarSectionProps) {
  const handleCardClick = useCallback((i: number) => {
    if (editingDay !== i) {
      onCalendarDayClick(i);
      onSelectDay(i);
    }
  }, [editingDay, onCalendarDayClick, onSelectDay]);

  const handleDoubleClick = useCallback((i: number) => {
    onSetEditingDay(i);
  }, [onSetEditingDay]);

  const handleBlur = useCallback((i: number, e: React.FocusEvent<HTMLInputElement>) => {
    onActividadBlur(i, e.target.value);
    onSetEditingDay(null);
  }, [onActividadBlur, onSetEditingDay]);

  const handleKeyDown = useCallback((i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onActividadBlur(i, e.currentTarget.value);
      onSetEditingDay(null);
    }
  }, [onActividadBlur, onSetEditingDay]);

  return (
    <>
      <SectionTitle>CALENDARIO SEMANAL</SectionTitle>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5 mb-4">
        {DAY_ORDER.map((diaKey, i) => {
          const row = calendar[i] || {};
          const actividad = row.actividad || '';
          const isSelected = selectedDayIdx === i;
          const isRest = !actividad || actividad.toLowerCase() === 'descanso';
          const isEditing = editingDay === i;

          return (
            <div
              key={diaKey}
              className={`premium-card cursor-pointer transition-all flex flex-col ${isSelected ? 'ring-2 ring-[var(--color-primary)]' : ''}`}
              onClick={() => handleCardClick(i)}
            >
              <div className="flex justify-center items-center mb-2">
                <span className={`premium-btn-pill ${isSelected ? 'premium-btn-pill--primary' : 'premium-btn-pill--ghost'}`}>
                  {diaKey}
                </span>
              </div>
              
              <div className="flex-1 flex flex-col justify-center">
                {isEditing ? (
                  <input
                    autoFocus
                    defaultValue={isRest ? '' : actividad}
                    onBlur={(e) => handleBlur(i, e)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="typo-value-lg bg-transparent border-b border-transparent focus:border-[var(--color-primary)] outline-none w-full input-placeholder text-center"
                    placeholder={diaKey}
                  />
                ) : (
                  <div
                    className="text-sm text-center min-h-[40px] flex items-center justify-center"
                    onDoubleClick={() => handleDoubleClick(i)}
                  >
                    {actividad || <span className="opacity-20">{diaKey}</span>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
