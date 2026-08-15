import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ejToDisplay, displayToEj, getCombinedSections, recalcularBloques } from '../utils/routineHelpers.ts';
import { exerciseDatabase } from '../data/exerciseDatabase.ts';
import type { EditorRoutineExercise, EditorExerciseDisplay, WarmupRow, CalendarDay } from '../core/types.ts';

const syncBlockMetadata = (exercises: EditorRoutineExercise[]): EditorRoutineExercise[] => {
  const display = exercises.map((ej) => ejToDisplay(ej));
  const recalculated = recalcularBloques(display);
  return recalculated.map((d) => displayToEj(d));
};

export interface UseRoutineDataData {
  routines: EditorRoutineExercise[];
  activeRoutineId: string | null;
  calendar: CalendarDay[];
}

export interface UseRoutineDataSetters {
  setRoutines: (value: EditorRoutineExercise[]) => void;
  setActiveRoutineId: (value: string | null) => void;
  setCalendar: (value: CalendarDay[]) => void;
}

export interface UseRoutineDataReturn {
  active: EditorRoutineExercise | undefined;
  ejerciciosMemo: EditorExerciseDisplay[];
  sections: EditorExerciseDisplay[];
  addDay: () => void;
  duplicateActive: () => void;
  deleteActive: () => void;
  addFila: () => void;
  addFilaBlank: () => void;
  update: (uid: string, field: string, val: any) => void;
  remove: (uid: string) => void;
  reorder: (fromUid: string, toUid: string) => void;
  getDayTotalVolume: (routine: EditorRoutineExercise[] | undefined) => string;
  getDayLabel: (diaKey: string) => string;
  handleDayClick: (diaKey: string) => void;
  handleDayBlur: (diaKey: string, value: string, originalLabel: string) => void;
  getTrainingStats: () => { dias: number; cardio: number; volumen: number };
}

export default function useRoutineData(
  data: UseRoutineDataData,
  setters: UseRoutineDataSetters,
  showToast: (msg: string) => void,
  activeGroup: string
): UseRoutineDataReturn {
  const { routines, activeRoutineId, calendar } = data;
  const { setRoutines, setActiveRoutineId, setCalendar } = setters;

  const active = activeRoutineId ? routines.find((r) => r.id === activeRoutineId) : undefined;

  const ejerciciosMemo = useMemo(() => (active?.ejercicios || []).map((ej) => ejToDisplay(ej)), [active?.ejercicios]);

  const sections = useMemo(() => recalcularBloques(ejerciciosMemo), [ejerciciosMemo]);

  const autofillRef = useRef(false);
  useEffect(() => {
    if (autofillRef.current) return;
    const needsAutofill = (routines || []).some((r) =>
      (r.ejercicios || []).some((ej) => !ej.musculo || !ej.movimiento)
    );
    if (!needsAutofill) return;
    autofillRef.current = true;
    const nextRoutines = routines.map((r) => ({
      ...r,
      ejercicios: (r.ejercicios || []).map((ej) => {
        if (ej.musculo && ej.movimiento) return ej;
        const match = exerciseDatabase.find((ex) => ex.nombre.toLowerCase() === (ej.ejercicio || '').toLowerCase());
        if (!match) return ej;
        return {
          ...ej,
          musculo: ej.musculo || match.musculo || '',
          movimiento: ej.movimiento || match.movimiento || '',
          notas: ej.notas || match.nota || '',
        };
      }),
    }));
    setRoutines(nextRoutines);
  }, [routines, setRoutines]);

  const addDay = useCallback(() => {
    const newId = 'routine-' + Date.now();
    const nombre = 'NUEVO';
    setRoutines((prev) => [...prev, { id: newId, nombre, titulo: 'Nuevo día', ejercicios: [] }]);
    setActiveRoutineId(newId);
    setCalendar((prev) => {
      const idx = prev.findIndex((d) => (d.actividad || '').toLowerCase() === 'descanso');
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], actividad: nombre, routineId: newId };
        return next;
      }
      return prev;
    });
    showToast('Día agregado');
  }, [setRoutines, setActiveRoutineId, setCalendar, showToast]);

  const duplicateActive = useCallback(() => {
    if (!active) return;
    const newId = 'routine-' + Date.now();
    const copy = {
      ...active,
      id: newId,
      nombre: active.nombre + ' COPY',
      ejercicios: (active.ejercicios || []).map((ej) => ({ ...ej })),
    };
    setRoutines((prev) => [...prev, copy]);
    setCalendar((prev) => {
      const next = [...prev];
      const emptyIdx = next.findIndex((d) => !d.actividad || (d.actividad || '').toLowerCase() === 'descanso');
      if (emptyIdx >= 0) {
        next[emptyIdx] = { ...next[emptyIdx], actividad: copy.nombre, routineId: newId };
        showToast('Rutina duplicada en día libre');
      } else {
        const currentIdx = next.findIndex((d) => d.routineId === active.id);
        if (currentIdx >= 0) {
          next[currentIdx] = { ...next[currentIdx], actividad: copy.nombre, routineId: newId };
          showToast('Rutina duplicada');
        } else {
          showToast('No hay días libres para duplicar');
        }
      }
      return next;
    });
  }, [active, setRoutines, setCalendar, showToast]);

  const deleteActive = useCallback(() => {
    setRoutines((prev) => {
      if (prev.length <= 1) {
        showToast('Mínimo 1 día');
        return prev;
      }
      const next = prev.filter((r) => r.id !== activeRoutineId);
      setActiveRoutineId(next[0].id);
      setCalendar((prevCal) => prevCal.map((d) => d.routineId === activeRoutineId ? { ...d, actividad: '', routineId: null } : d));
      showToast('Eliminado');
      return next;
    });
  }, [activeRoutineId, setRoutines, setActiveRoutineId, setCalendar, showToast]);

  const update = useCallback((uid: string, field: string, val: any) => {
    setRoutines((prev) =>
      prev.map((r) => {
        if (r.id !== activeRoutineId) return r;
        const next = (r.ejercicios || []).map((ej) => ejToDisplay(ej)).map((b) => (b.uid === uid ? { ...b, [field]: val } : b));
        const base = next.find((b) => b.uid === uid && b.esBase);
        if (base && ['peso', 'ejercicio', 'tipo'].includes(field)) {
          next.forEach((b) => {
            if (b.aproxBase === uid) {
              if (field === 'peso') b.peso = ((parseFloat(val) || 0) * b.aproxPorcentaje / 100).toFixed(1);
              else b[field] = val;
            }
          });
        }

        if (field === 'ejercicio') {
          const match = String(val).match(/\((\d+)%\)/);
          next.forEach((b) => {
            if (b.uid === uid) {
              if (match) {
                b.categoria = 'Aprox';
                b.aproxPorcentaje = parseInt(match[1], 10);
                b.porcentaje = parseInt(match[1], 10);
                b.serie = 'Aprox';
                b.tecnica = (b.tecnica || '').replace(/\s*\(\d+%\)\s*/,'').trim();
              } else if (b.categoria === 'Aprox' && !b.aproxBase) {
                b.categoria = 'Entreno';
                b.aproxPorcentaje = null;
                b.porcentaje = null;
                b.serie = 'Simple';
                b.tecnica = (b.tecnica || '').replace(/\s*\(\d+%\)\s*/,'').trim();
              }
            }
          });
        }

        if (field === 'blockSerie' || field === 'serie' || field === 'ejercicio') {
          return { ...r, ejercicios: syncBlockMetadata(next.map(displayToEj)) };
        }
        return { ...r, ejercicios: next.map(displayToEj) };
      })
    );
  }, [activeRoutineId, setRoutines]);

  const remove = useCallback((uid: string) => {
    setRoutines((prev) =>
      prev.map((r) => {
        if (r.id !== activeRoutineId) return r;
        const currentBloques = (r.ejercicios || []).map((ej) => ejToDisplay(ej));
        const isBase = currentBloques.find((b) => b.uid === uid)?.esBase;
        const filtered = isBase ? currentBloques.filter((b) => b.uid !== uid && b.aproxBase !== uid) : currentBloques.filter((b) => b.uid !== uid);
        return { ...r, ejercicios: syncBlockMetadata(filtered.map(displayToEj)) };
      })
    );
  }, [activeRoutineId, setRoutines]);

  const reorder = useCallback((fromUid: string, toUid: string) => {
    setRoutines((prev) =>
      prev.map((r) => {
        if (r.id !== activeRoutineId) return r;
        const currentBloques = (r.ejercicios || []).map((ej) => ejToDisplay(ej));
        const fromIdx = currentBloques.findIndex((b) => b.uid === fromUid);
        const toIdx = currentBloques.findIndex((b) => b.uid === toUid);
        if (fromIdx === -1 || toIdx === -1) return r;
        const next = [...currentBloques];
        const [moved] = next.splice(fromIdx, 1);
        next.splice(toIdx, 0, moved);
        return { ...r, ejercicios: syncBlockMetadata(next.map(displayToEj)) };
      })
    );
  }, [activeRoutineId, setRoutines]);

  const addFila = useCallback(() => {
    setRoutines((prev) =>
      prev.map((r) => {
        if (r.id !== activeRoutineId) return r;
        const currentBloques = (r.ejercicios || []).map((ej) => ejToDisplay(ej));
        const tieneBase = currentBloques.some((b) => b.esBase);
        let nextBloques;
        if (activeGroup === 'Aprox' && !tieneBase) {
          const baseUid = 'ex-' + crypto.randomUUID();
          const baseEj = { ...ejToDisplay(null), categoria: 'Entreno', esBase: true, uid: baseUid, serie: 'Simple' };
          const aprox1 = { ...ejToDisplay(null), categoria: 'Aprox', aproxBase: baseUid, aproxPorcentaje: 50, uid: 'ex-' + crypto.randomUUID(), serie: 'Aprox' };
          const aprox2 = { ...ejToDisplay(null), categoria: 'Aprox', aproxBase: baseUid, aproxPorcentaje: 75, uid: 'ex-' + crypto.randomUUID(), serie: 'Aprox' };
          const aprox3 = { ...ejToDisplay(null), categoria: 'Aprox', aproxBase: baseUid, aproxPorcentaje: 85, uid: 'ex-' + crypto.randomUUID(), serie: 'Aprox' };
          nextBloques = [aprox1, aprox2, aprox3, baseEj, ...currentBloques];
        } else {
          nextBloques = [...currentBloques, { ...ejToDisplay(null), categoria: activeGroup, serie: activeGroup === 'Aprox' ? 'Aprox' : 'Simple' }];
        }
        return { ...r, ejercicios: syncBlockMetadata(nextBloques.map(displayToEj)) };
      })
    );
    showToast('Ejercicio agregado');
  }, [activeRoutineId, setRoutines, activeGroup, showToast]);

  const addFilaBlank = useCallback(() => {
    setRoutines((prev) =>
      prev.map((r) => {
        if (r.id !== activeRoutineId) return r;
        const nextBloques = [...(r.ejercicios || []).map((ej) => ejToDisplay(ej)), { ...ejToDisplay(null), categoria: activeGroup, serie: activeGroup === 'Aprox' ? 'Aprox' : 'Simple' }];
        return { ...r, ejercicios: syncBlockMetadata(nextBloques.map(displayToEj)) };
      })
    );
    showToast('Ejercicio agregado');
  }, [activeRoutineId, setRoutines, activeGroup, showToast]);

  const getDayTotalVolume = useCallback((routine: EditorRoutineExercise[] | undefined) => {
    if (!routine || !routine.length) return '0 kg';
    const total = routine.reduce((sum: number, ex: EditorRoutineExercise) => {
      const s1 = parseInt(ex.semana1 || ex.sets || '0') || 0;
      const s2 = parseInt(ex.semana2 || '0') || 0;
      const s3 = parseInt(ex.semana3 || '0') || 0;
      const s4 = parseInt(ex.semana4 || '0') || 0;
      const reps = parseInt(ex.reps) || 0;
      const peso = parseFloat(ex.peso) || 0;
      return sum + (s1 + s2 + s3 + s4) * reps * peso;
    }, 0);
    return total > 0 ? `${total} kg` : '0 kg';
  }, []);

  const getDayLabel = useCallback((diaKey: string) => {
    const day = calendar.find((d) => d.dia === diaKey);
    return day?.actividad || 'Descanso';
  }, [calendar]);

  const handleDayClick = useCallback((diaKey: string) => {
    const day = calendar.find((d) => d.dia === diaKey);
    if (day?.actividad && day.actividad.toLowerCase() !== 'descanso') {
      const rutina = routines.find((r) => r.nombre === day.actividad);
      if (rutina) {
        setActiveRoutineId(rutina.id);
      } else {
        const newRoutine = {
          id: 'routine-' + Date.now(),
          nombre: day.actividad,
          titulo: day.actividad,
          ejercicios: []
        };
        setRoutines((prev) => [...prev, newRoutine]);
        setActiveRoutineId(newRoutine.id);
      }
    }
  }, [calendar, routines, setActiveRoutineId, setRoutines]);

  const handleDayBlur = useCallback((diaKey: string, value: string, originalLabel: string) => {
    const day = calendar.find((d) => d.dia === diaKey);
    const current = day?.actividad || '';
    const trimmed = (value || '').trim();

    if (!trimmed || trimmed.toLowerCase() === 'descanso') {
      if (current) {
        setCalendar((prev) => prev.map((d) => d.dia === diaKey ? { ...d, actividad: '', routineId: null } : d));
      }
      return;
    }

    if (trimmed === current) return;

    const dayData = calendar.find((d) => d.dia === diaKey);
    const existingRoutine = routines.find((r) => r.nombre === trimmed);

    if (existingRoutine) {
      setCalendar((prev) => prev.map((d) => d.dia === diaKey ? { ...d, actividad: trimmed, routineId: existingRoutine.id } : d));
      setActiveRoutineId(existingRoutine.id);
    } else if (dayData?.routineId) {
      setRoutines((prev) => prev.map((r) => r.id === dayData.routineId ? { ...r, nombre: trimmed, titulo: trimmed } : r));
      setCalendar((prev) => prev.map((d) => d.dia === diaKey ? { ...d, actividad: trimmed } : d));
    } else {
      const newId = 'routine-' + Date.now();
      setRoutines((prev) => [...prev, { id: newId, nombre: trimmed, titulo: trimmed, ejercicios: [] }]);
      setCalendar((prev) => prev.map((d) => d.dia === diaKey ? { ...d, actividad: trimmed, routineId: newId } : d));
      setActiveRoutineId(newId);
    }
  }, [calendar, routines, setCalendar, setRoutines, setActiveRoutineId, showToast]);

  const getTrainingStats = useCallback(() => {
    const days = (calendar || []).filter((d: CalendarDay) => {
      const act = (d.actividad || '').toLowerCase();
      return act && act !== 'descanso';
    });
    const cardioDays = days.filter((d: CalendarDay) => (d.actividad || '').toLowerCase().includes('cardio'));
    const volumen = (routines || []).reduce((sum: number, r: EditorRoutineExercise[]) => {
      return sum + (r.ejercicios || []).reduce((s: number, ej: EditorRoutineExercise) => {
        const s1 = parseInt(ej.semana1 || ej.sets || '0') || 0;
        const s2 = parseInt(ej.semana2 || '0') || 0;
        const s3 = parseInt(ej.semana3 || '0') || 0;
        const s4 = parseInt(ej.semana4 || '0') || 0;
        return s + s1 + s2 + s3 + s4;
      }, 0);
    }, 0);
    return {
      dias: days.length,
      cardio: cardioDays.length,
      volumen,
    };
  }, [calendar, routines]);

  return {
    active,
    ejerciciosMemo,
    sections,
    addDay,
    duplicateActive,
    deleteActive,
    addFila,
    addFilaBlank,
    update,
    remove,
    reorder,
    getDayTotalVolume,
    getDayLabel,
    handleDayClick,
    handleDayBlur,
    getTrainingStats,
  };
}
