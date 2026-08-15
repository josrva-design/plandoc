import { useState, useMemo, useCallback } from 'react';
import SectionTitle from './ui/SectionTitle.tsx';
import EditableTable from './EditableTable.tsx';
import CalendarSection from './CalendarSection.tsx';
import useRoutineData, { UseRoutineDataReturn } from '../hooks/useRoutineData.ts';
import useWarmupData from '../hooks/useWarmupData.ts';
import { useAppContext } from '../context/AppContext.jsx';
import { exerciseDatabase } from '../data/exerciseDatabase.ts';
import { recalcularBloques } from '../utils/routineHelpers.ts';
import type { EditorRoutineExercise, EditorExerciseDisplay, WarmupRow } from '../core/types.ts';
import TrainingPlanHeader from './ui/TrainingPlanHeader.tsx';

const EXERCISE_NAMES = exerciseDatabase.map((e) => e.nombre);

const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const TIPOS = ['Simple', 'Biserie', 'Triserie', 'Circuito'];
const REPS_OPTIONS = ['4-6', '6-8', '8-10', '10-12', '12-15', '15-20', '20+'];
const TECNICA_OPTIONS = ['', 'Drop Set', 'Rest-Pause', 'Isométrico', 'Cluster', 'Blood Flow Restriction', 'Negativas', 'Parcial', 'Full Range'];
const RS_OPTIONS = ['', 'RIR 1', 'RIR 2', 'RIR 3', 'RIR 4', 'RPE 6', 'RPE 7', 'RPE 8', 'RPE 9', 'RPE 10', 'AMRAP'];
const DESCANSOS_OPTIONS = [
  { value: '30', label: '30 seg' },
  { value: '60', label: '1 min' },
  { value: '120', label: '2 min' },
  { value: '180', label: '3 min' },
  { value: '240', label: '4 min' },
  { value: '300', label: '5 min' },
];

const BLOCK_COLORS: Record<string, string> = {
  Simple: 'var(--color-navy)',
  Biserie: 'var(--color-navy)',
  Triserie: 'var(--color-navy)',
  Circuito: 'var(--color-navy)',
};

function getBlockColor(tipo: string): string {
  return BLOCK_COLORS[tipo] || 'var(--color-primary)';
}

const CATEGORIES = {
  Aprox: { label: 'APROXIMACIÓN', color: 'var(--color-primary)' },
  Entreno: { label: 'ENTRENAMIENTO', color: 'var(--color-green)' },
};

const GROUP_CONFIG = {
  general: { label: 'GENERAL', color: 'var(--color-primary)', className: 'warmup-phase--general' },
  movilidad: { label: 'MOVILIDAD', color: 'var(--color-primary-300)', className: 'warmup-phase--movilidad' },
  especifico: { label: 'ESPECIFICO', color: 'var(--color-primary-200)', className: 'warmup-phase--especifico' },
};

function upperToBlocks(upper: any): WarmupRow[] {
  if (!upper) return [];
  const blocks: WarmupRow[] = [];
  Object.entries(GROUP_CONFIG).forEach(([key, config]) => {
    const exercises = upper[key];
    if (!Array.isArray(exercises)) return;
    exercises.forEach((ej: any) => {
      blocks.push({ ...ej, grupo: key, groupLabel: config.label, color: config.color } as WarmupRow);
    });
  });
  return blocks;
}

function blocksToUpper(bloques: WarmupRow[]): any {
  const upper = { general: [], movilidad: [], especifico: [] };
  bloques.forEach((b) => {
    const grupo = b.grupo || 'general';
    if (upper[grupo]) {
      upper[grupo].push(b);
    }
  });
  return upper;
}

export default function TrainingEditor() {
  const { data, setters, showToast } = useAppContext();
  const { calendar = [], routines = [], warmupUpper, warmupLower, training = {} } = data;
  const { setCalendar, setRoutines, setActiveRoutineId, setWarmupUpper, setWarmupLower } = setters;

  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'rutina' | 'calentamiento'>('rutina');
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [activeGroup, setActiveGroup] = useState<string>('Aprox');

  const selectedDay = calendar[selectedDayIdx] || {};
  const selectedDayKey = DAY_KEYS[selectedDayIdx] || 'monday';

  const updateDay = useCallback((i: number, patch: any) => {
    const next = [...calendar];
    next[i] = { ...next[i], ...patch };
    setCalendar(next);
  }, [calendar, setCalendar]);

  const handleActividadChange = (i: number, value: string) => {
    updateDay(i, { actividad: value });
  };

  const handleActividadBlur = (i: number, value: string) => {
    const trimmed = (value || '').trim();

    if (!trimmed || trimmed.toLowerCase() === 'descanso') {
      updateDay(i, { actividad: trimmed || '', routineId: null });
      if (i === selectedDayIdx) setActiveRoutineId(null);
      return;
    }

    const existingRoutine = routines.find((r) => r.nombre === trimmed);
    if (existingRoutine) {
      updateDay(i, { actividad: trimmed, routineId: existingRoutine.id });
      if (i === selectedDayIdx) setActiveRoutineId(existingRoutine.id);
      return;
    }

    const currentRoutineId = calendar[i]?.routineId;
    if (currentRoutineId) {
      const routine = routines.find((r) => r.id === currentRoutineId);
      if (routine) {
        setRoutines((prev) =>
          prev.map((r) => (r.id === currentRoutineId ? { ...r, nombre: trimmed, titulo: trimmed } : r))
        );
        updateDay(i, { actividad: trimmed });
        if (i === selectedDayIdx) setActiveRoutineId(currentRoutineId);
        return;
      }
    }

    const newRoutine = {
      id: 'routine-' + Date.now(),
      nombre: trimmed,
      titulo: trimmed,
      ejercicios: [],
    };
    setRoutines((prev) => [...prev, newRoutine]);
    updateDay(i, { actividad: trimmed, routineId: newRoutine.id });
    if (i === selectedDayIdx) setActiveRoutineId(newRoutine.id);
  };

  const handleCalendarDayClick = (i: number) => {
    const row = calendar[i] || {};
    const actividad = (row.actividad || '').trim();

    if (!actividad || actividad.toLowerCase() === 'descanso') {
      setActiveRoutineId(null);
      return;
    }

    if (row.routineId) {
      setActiveRoutineId(row.routineId);
      return;
    }

    const existing = routines.find((r) => r.nombre === actividad);
    if (existing) {
      setActiveRoutineId(existing.id);
      updateDay(i, { routineId: existing.id });
      return;
    }

    const newId = 'routine-' + Date.now();
    const newRoutine = { id: newId, nombre: actividad, titulo: actividad, ejercicios: [] };
    setRoutines((prev) => [...prev, newRoutine]);
    updateDay(i, { routineId: newId });
    setActiveRoutineId(newId);
  };

  const routineData = useRoutineData(
    { ...data, activeRoutineId: data.activeRoutineId },
    setters,
    showToast,
    activeGroup
  );

  const { active: activeRoutine, sections, addFila, addFilaBlank, update, remove, reorder, getDayLabel, duplicateActive } = routineData as UseRoutineDataReturn;

  const warmupData = useWarmupData(warmupUpper, warmupLower, setWarmupUpper, setWarmupLower, showToast);
  const {
    warmupGeneralSections,
    warmupUpperSections,
    warmupLowerSections,
    addGeneral,
    addUpper,
    addLower,
    update: updateWarmup,
    remove: removeWarmup,
    reorder: reorderWarmup,
  } = warmupData;

  // Warmup UI state
  const [warmupDragUid, setWarmupDragUid] = useState<string | null>(null);
  const [warmupDropUid, setWarmupDropUid] = useState<string | null>(null);
  const [warmupActiveGroup, setWarmupActiveGroup] = useState<string>('general');
  const [editingTipoUidWarmup, setEditingTipoUidWarmup] = useState<string | null>(null);
  const [tipoHoverUidWarmup, setTipoHoverUidWarmup] = useState<string | null>(null);

  const routineColumns = [
    {
      key: 'serie',
      label: 'Serie',
      width: '10%',
      minWidth: '56px',
      maxWidth: '72px',
      align: 'center',
      render: (value: any, row: any, onChange: any, uid: string, idx: number) => {
        const seq = row.blockLetter ? `${row.blockLetter}${row.blockPosition || idx + 1}` : '—';
        const tipo = row.blockSerie || row.serie || (row.aproxBase ? 'Aprox' : 'Simple');
        return (
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
            <span
              className="block-badge"
              style={{ background: 'var(--color-navy)', fontSize: 9, padding: '1px 6px' }}
              title="Secuencia"
            >
              {seq}
            </span>
            <select
              value={tipo}
              onChange={(e) => {
                onChange('blockSerie', e.target.value);
                onChange('serie', e.target.value);
              }}
              className="premium-table-select"
              style={{ fontSize: 10, padding: '1px 4px', width: 'auto', minWidth: 'auto' }}
            >
              {TIPOS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        );
      },
    },
    {
      key: 'ejercicio',
      label: 'EJERCICIO',
      width: '28%',
      minWidth: '120px',
      render: (value: any, row: any, onChange: any) => {
        let displayValue = value;
        if (row.aproxBase) {
          const baseEj = (activeRoutine?.ejercicios || []).map((ej: any) => routineData.ejerciciosMemo.find((b: any) => b.uid === ej.aproxBase)).find(Boolean);
          if (baseEj) {
            displayValue = baseEj.ejercicio;
          }
        }
        
        return (
          <>
            <input
              value={displayValue || ''}
              onChange={(e) => {
                if (!row.aproxBase) {
                  const text = e.target.value;
                  onChange('ejercicio', text);
                  const match = exerciseDatabase.find((ex) => ex.nombre.toLowerCase() === text.toLowerCase());
                  if (match) {
                    onChange('musculo', match.musculo);
                    onChange('movimiento', match.movimiento);
                    onChange('notas', match.nota);
                  }
                }
              }}
              className="premium-cell-input w-full"
              list="exercise-list"
              placeholder="Elige un movimiento"
              readOnly={!!row.aproxBase}
            />
            {row.aproxPorcentaje && <span className="typo-muted-sm whitespace-nowrap">({row.aproxPorcentaje}%)</span>}
            <datalist id="exercise-list">
              {EXERCISE_NAMES.map((name, idx) => (
                <option key={`${name}-${idx}`} value={name} />
              ))}
            </datalist>
          </>
        );
      },
    },
    {
      key: 'semana1',
      label: 'Sem 1',
      width: '6%',
      minWidth: '48px',
      align: 'center',
      render: (value: any, row: any, onChange: any) => {
        return (
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={value || ''}
            onChange={(e) => {
              onChange('semana1', e.target.value);
            }}
            className="premium-table-input text-center"
            placeholder="1-5"
          />
        );
      },
    },
    {
      key: 'semana2',
      label: 'Sem 2',
      width: '6%',
      minWidth: '48px',
      align: 'center',
      render: (value: any, row: any, onChange: any) => (
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value || ''}
          onChange={(e) => onChange('semana2', e.target.value)}
          className="premium-table-input text-center"
          placeholder="1-5"
        />
      ),
    },
    {
      key: 'semana3',
      label: 'Sem 3',
      width: '6%',
      minWidth: '48px',
      align: 'center',
      render: (value: any, row: any, onChange: any) => (
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value || ''}
          onChange={(e) => onChange('semana3', e.target.value)}
          className="premium-table-input text-center"
          placeholder="1-5"
        />
      ),
    },
    {
      key: 'semana4',
      label: 'Sem 4',
      width: '6%',
      minWidth: '48px',
      align: 'center',
      render: (value: any, row: any, onChange: any) => (
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value || ''}
          onChange={(e) => onChange('semana4', e.target.value)}
          className="premium-table-input text-center"
          placeholder="1-5"
        />
      ),
    },
    {
      key: 'musculo',
      label: 'MÚSCULO',
      width: '10%',
      minWidth: '70px',
      maxWidth: '100px',
      render: (value: any, row: any, onChange: any) => (
        <input
          value={value || ''}
          onChange={(e) => onChange('musculo', e.target.value)}
          className="premium-table-input"
          placeholder="Ej: Hombro"
        />
      ),
    },
    {
      key: 'movimiento',
      label: 'MOVIMIENTO',
      width: '12%',
      minWidth: '90px',
      render: (value: any, row: any, onChange: any) => (
        <input
          value={value || ''}
          onChange={(e) => onChange('movimiento', e.target.value)}
          className="premium-table-input"
          placeholder="Ej: Flexión"
        />
      ),
    },
    {
      key: 'reps',
      label: 'REPS',
      width: '9%',
      minWidth: '60px',
      maxWidth: '70px',
      align: 'center',
      render: (value: any, row: any, onChange: any) => (
        <select
          value={value || ''}
          onChange={(e) => onChange('reps', e.target.value)}
          className={"premium-table-select w-full text-center" + (!value ? " is-placeholder" : "")}
        >
          <option value="" disabled>Rango</option>
          {REPS_OPTIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      ),
    },
    {
      key: 'tecnica',
      label: 'TÉCNICA',
      width: '10%',
      minWidth: '70px',
      maxWidth: '100px',
      render: (value: any, row: any, onChange: any) => (
        <select
          value={value || ''}
          onChange={(e) => onChange('tecnica', e.target.value)}
          className={"premium-table-select w-full" + (!value ? " is-placeholder" : "")}
        >
          <option value="" disabled>Técnica</option>
          {TECNICA_OPTIONS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      ),
    },
    {
      key: 'rir',
      label: 'RIR',
      width: '9%',
      minWidth: '70px',
      maxWidth: '90px',
      align: 'center',
      render: (value: any, row: any, onChange: any) => (
        <select
          value={value || ''}
          onChange={(e) => onChange('rir', e.target.value)}
          className={"premium-table-select w-full text-center" + (!value ? " is-placeholder" : "")}
        >
          <option value="" disabled>RIR</option>
          {RS_OPTIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      ),
    },
    {
      key: 'descanso',
      label: 'DESCANSO',
      width: '8%',
      minWidth: '64px',
      maxWidth: '75px',
      align: 'center',
      render: (value: any, row: any, onChange: any) => (
        <select
          value={value || ''}
          onChange={(e) => onChange('descanso', e.target.value)}
          className={"premium-table-select w-full text-center" + (!value ? " is-placeholder" : "")}
        >
          <option value="" disabled>Descanso</option>
          {DESCANSOS_OPTIONS.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>
      ),
    },
    {
      key: 'notas',
      label: 'NOTAS',
      width: '12%',
      minWidth: '80px',
      render: (value: any, row: any, onChange: any) => (
        <input
          value={value || ''}
          onChange={(e) => onChange('notas', e.target.value)}
          className="premium-table-input"
          placeholder="Observaciones"
        />
      ),
    },
  ];

  const warmupColumns = [
    {
      key: 'serie',
      label: '#',
      width: '8%',
      minWidth: '48px',
      align: 'center',
      render: (value: any, row: any, onChange: any, uid: string, idx: number) => (
        <span className="block-badge" style={{ background: 'var(--color-navy)' }}>
          {idx + 1}
        </span>
      ),
    },
    {
      key: 'ejercicio',
      label: 'EJERCICIO',
      width: '40%',
      minWidth: '140px',
      render: (value: any, row: any, onChange: any) => (
        <input
          value={value || ''}
          onChange={(e) => onChange('ejercicio', e.target.value)}
          className="premium-table-input"
          placeholder="Ej: Rodillo lumbar"
        />
      ),
    },
    {
      key: 'sets',
      label: 'SETS',
      width: '8%',
      minWidth: '48px',
      align: 'center',
      render: (value: any, row: any, onChange: any) => (
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value || ''}
          onChange={(e) => onChange('sets', e.target.value)}
          className="premium-table-input text-center"
          placeholder="2"
        />
      ),
    },
    {
      key: 'reps',
      label: 'REPS',
      width: '10%',
      minWidth: '60px',
      align: 'center',
      render: (value: any, row: any, onChange: any) => (
        <input
          value={value || ''}
          onChange={(e) => onChange('reps', e.target.value)}
          className="premium-table-input text-center"
          placeholder="10-15"
        />
      ),
    },
    {
      key: 'pausa',
      label: 'PAUSA',
      width: '10%',
      minWidth: '64px',
      align: 'center',
      render: (value: any, row: any, onChange: any) => (
        <input
          value={value || ''}
          onChange={(e) => onChange('pausa', e.target.value)}
          className="premium-table-input text-center"
          placeholder="30 seg"
        />
      ),
    },
    {
      key: 'notas',
      label: 'NOTAS',
      width: '32%',
      minWidth: '100px',
      render: (value: any, row: any, onChange: any) => (
        <input
          value={value || ''}
          onChange={(e) => onChange('notas', e.target.value)}
          className="premium-table-input"
          placeholder="Observaciones"
        />
      ),
    },
  ];

  const stats = useMemo(() => {
    const days = (calendar || []).filter((d: any) => {
      const act = (d.actividad || '').toLowerCase();
      return act && act !== 'descanso';
    });
    const cardioDays = days.filter((d: any) => (d.actividad || '').toLowerCase().includes('cardio'));
    const volumen = (routines || []).reduce((sum: number, r: any) => {
      return sum + (r.ejercicios || []).reduce((s: number, ej: any) => {
        const s1 = parseInt(ej.semana1 || ej.sets || '0') || 0;
        const s2 = parseInt(ej.semana2 || '0') || 0;
        const s3 = parseInt(ej.semana3 || '0') || 0;
        const s4 = parseInt(ej.semana4 || '0') || 0;
        const reps = parseInt(ej.reps) || 0;
        const peso = parseFloat(ej.peso) || 0;
        return s + s1 + s2 + s3 + s4;
      }, 0);
    }, 0);
    return {
      dias: days.length,
      cardio: cardioDays.length,
      volumen,
    };
  }, [calendar, routines]);

  const blockGroups = useMemo(() => {
    const groups: Record<string, any> = {};
    sections.forEach((s: any) => {
      const letter = s.blockLetter || 'A';
      if (!groups[letter]) {
        groups[letter] = {
          label: s.blockSerie || 'BLOQUE',
          color: getBlockColor(s.serie || s.blockSerie),
          className: 'routine-group-header',
          hasAprox: false,
          hasSimple: false,
        };
      }
      if (s.isAprox) groups[letter].hasAprox = true;
      else groups[letter].hasSimple = true;
    });

    Object.keys(groups).forEach((letter) => {
      const g = groups[letter];
      if (g.hasAprox && g.hasSimple) {
        g.label = `${letter} APROX / SIMPLE`;
      } else if (g.hasAprox) {
        g.label = `${letter} APROX`;
      } else {
        g.label = `${letter} ${g.label}`;
      }
    });

    return groups;
  }, [sections]);

  return (
    <div className="space-y-4">
      <div>
        <div className="premium-page-title">TRATAMIENTO DEPORTIVO</div>
        <div className="premium-subtitle">Configuración de días, ejercicios y progresión por rutina.</div>
      </div>

      <TrainingPlanHeader
        estrategia={training.estrategia}
        onEstrategiaChange={(value) => {
          if (setters.setTraining) {
            setters.setTraining(prev => ({ ...prev, estrategia: value }));
          }
        }}
        dias={stats.dias}
        cardio={stats.cardio}
        volumen={stats.volumen}
      />

      <CalendarSection
        calendar={calendar}
        routines={routines}
        selectedDayIdx={selectedDayIdx}
        editingDay={editingDay}
        onSelectDay={setSelectedDayIdx}
        onSetEditingDay={setEditingDay}
        onActividadBlur={handleActividadBlur}
        onCalendarDayClick={handleCalendarDayClick}
      />

      <div className="flex justify-center gap-2 mb-4">
        <button
          onClick={() => setActiveTab('rutina')}
          className={`premium-btn-pill ${activeTab === 'rutina' ? 'premium-btn-pill--primary' : 'premium-btn-pill--ghost'}`}
        >
          Rutina
        </button>
        <button
          onClick={() => setActiveTab('calentamiento')}
          className={`premium-btn-pill ${activeTab === 'calentamiento' ? 'premium-btn-pill--primary' : 'premium-btn-pill--ghost'}`}
        >
          Calentamiento
        </button>
      </div>

      {activeTab === 'rutina' && (
        <div>
          {activeRoutine ? (
            <>
              <div className="bg-white border border-[var(--color-border)] rounded-2xl p-4">
                <EditableTable
                  variant="training"
                  columns={routineColumns}
                  rows={sections}
                  getRowId={(r) => r.uid}
                  onUpdateRow={update}
                  onRemoveRow={remove}
                  onReorder={reorder}
                  onAddRow={addFila}
                  emptyText="Sin ejercicios"
                  addButtonLabel="+ Ejercicio"
                  dragBetweenGroups={false}
                  groupBy="blockLetter"
                  groupConfig={blockGroups}
                />
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={duplicateActive}
                    className="premium-btn-pill premium-btn-pill--ghost"
                  >
                    Duplicar rutina
                  </button>
                  <button
                    type="button"
                    onClick={addFilaBlank}
                    className="premium-btn-pill premium-btn-pill--ghost"
                  >
                    + Ejercicio desde 0
                  </button>
                </div>

              </div>
            </>
          ) : (
            <div className="text-center py-8 typo-muted-sm">
              Selecciona un día con actividad para ver la rutina
            </div>
          )}
        </div>
      )}

      {activeTab === 'calentamiento' && (
        <div>
          <div className="mb-4">
            <SectionTitle>CALENTAMIENTO GENERAL</SectionTitle>
            <div className="bg-white border border-[var(--color-border)] rounded-2xl p-4">
              <EditableTable
                variant="training"
                columns={warmupColumns}
                rows={warmupGeneralSections}
                getRowId={(r) => r.uid}
                onAddRow={addGeneral}
                onUpdateRow={(uid, field, val) => updateWarmup(uid, field, val)}
                onRemoveRow={(uid) => removeWarmup(uid)}
                onReorder={(from, to) => reorderWarmup(from, to)}
                emptyText="Sin ejercicios"
                addButtonLabel="+ agregar ejercicio"
                dragBetweenGroups={false}
              />
            </div>
          </div>
          <div className="mb-4">
            <SectionTitle>CALENTAMIENTO TREN SUPERIOR</SectionTitle>
            <div className="bg-white border border-[var(--color-border)] rounded-2xl p-4">
              <EditableTable
                variant="training"
                columns={warmupColumns}
                rows={warmupUpperSections}
                getRowId={(r) => r.uid}
                onAddRow={addUpper}
                onUpdateRow={(uid, field, val) => updateWarmup(uid, field, val)}
                onRemoveRow={(uid) => removeWarmup(uid)}
                onReorder={(from, to) => reorderWarmup(from, to)}
                emptyText="Sin ejercicios"
                addButtonLabel="+ agregar ejercicio"
                dragBetweenGroups={false}
              />
            </div>
          </div>
          <div className="mb-4">
            <SectionTitle>CALENTAMIENTO TREN INFERIOR</SectionTitle>
            <div className="flex gap-2 mb-2">
              <button onClick={() => addLower('movilidad')} className="premium-btn-pill premium-btn-pill--ghost text-xs">+ Movilidad</button>
              <button onClick={() => addLower('especifico')} className="premium-btn-pill premium-btn-pill--ghost text-xs">+ Específico</button>
            </div>
            <div className="bg-white border border-[var(--color-border)] rounded-2xl p-4">
              <EditableTable
                variant="training"
                columns={warmupColumns}
                rows={warmupLowerSections}
                getRowId={(r) => r.uid}
                onAddRow={null}
                onUpdateRow={(uid, field, val) => updateWarmup(uid, field, val)}
                onRemoveRow={(uid) => removeWarmup(uid)}
                onReorder={(from, to) => reorderWarmup(from, to)}
                emptyText="Sin ejercicios"
                addButtonLabel=""
                dragBetweenGroups={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
