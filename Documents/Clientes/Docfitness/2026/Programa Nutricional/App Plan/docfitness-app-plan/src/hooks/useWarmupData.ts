import { useMemo, useCallback } from 'react';
import { exerciseDatabase } from '../data/exerciseDatabase.ts';
import { getCombinedSections } from '../utils/routineHelpers.ts';
import type { WarmupBlock, EditorExerciseDisplay } from '../core/types.ts';

export interface UseWarmupDataReturn {
  warmupUpper: WarmupBlock;
  warmupLower: WarmupBlock;
  warmupGeneralSections: EditorExerciseDisplay[];
  warmupUpperSections: EditorExerciseDisplay[];
  warmupLowerSections: EditorExerciseDisplay[];
  addGeneral: () => void;
  addUpper: () => void;
  addLower: (grupo?: string) => void;
  update: (uid: string, field: string, val: any) => void;
  remove: (uid: string) => void;
  reorder: (fromUid: string, toUid: string) => void;
}

function toDisplay(items: any[], source: string, warmupCategory: string): EditorExerciseDisplay[] {
  return items.map((b) => ({
    ...b,
    serie: b.serie || b.tipo || 'Simple',
    descanso: b.descanso || b.pausa || '',
    source,
    warmupCategory,
  }));
}

function getWarmupFromDB() {
  const warmupExercises = exerciseDatabase.filter((e) => e.categoria === 'calentamiento');
  const upper = { general: [], movilidad: [], especifico: [] };
  const lower = { general: [], movilidad: [], especifico: [] };

  warmupExercises.forEach((ex) => {
    const base = {
      uid: ex.id,
      id: ex.id,
      tipo: 'Simple',
      grupo: ex.grupo || 'general',
      video: '_',
      ejercicio: ex.nombre,
      sets: '2',
      reps: '15-20',
      pausa: '30 seg',
      notas: ex.nota || '',
    };

    if (ex.grupo === 'general') {
      upper.general.push(base);
      lower.general.push(base);
    } else if (ex.grupo === 'movilidad') {
      upper.movilidad.push(base);
      lower.movilidad.push(base);
    } else if (ex.grupo === 'especifico') {
      upper.especifico.push(base);
      lower.especifico.push(base);
    }
  });

  return { upper, lower };
}

export default function useWarmupData(
  warmupUpper: WarmupBlock,
  warmupLower: WarmupBlock,
  setWarmupUpper: (value: WarmupBlock) => void,
  setWarmupLower: (value: WarmupBlock) => void,
  showToast: (msg: string) => void
): UseWarmupDataReturn {
  const buildGeneralSections = useCallback((upper: WarmupBlock, lower: WarmupBlock) => {
    const upperGeneral = toDisplay((upper.general || []), 'upper', 'general');
    const lowerGeneral = toDisplay((lower.general || []), 'lower', 'general');
    return getCombinedSections([...upperGeneral, ...lowerGeneral]);
  }, []);

  const buildUpperSections = useCallback((upper: WarmupBlock) => {
    const items = toDisplay((upper.movilidad || []), 'upper', 'movilidad').concat(toDisplay((upper.especifico || []), 'upper', 'especifico'));
    if (!items.length) {
      const db = getWarmupFromDB();
      const dbMov = toDisplay(db.upper.movilidad || [], 'upper', 'movilidad');
      const dbEsp = toDisplay(db.upper.especifico || [], 'upper', 'especifico');
      return getCombinedSections([...dbMov, ...dbEsp]);
    }
    return getCombinedSections(items);
  }, []);

  const buildLowerSections = useCallback((lower: WarmupBlock) => {
    const items = toDisplay((lower.movilidad || []), 'lower', 'movilidad').concat(toDisplay((lower.especifico || []), 'lower', 'especifico'));
    if (!items.length) {
      const db = getWarmupFromDB();
      const dbMov = toDisplay(db.lower.movilidad || [], 'lower', 'movilidad');
      const dbEsp = toDisplay(db.lower.especifico || [], 'lower', 'especifico');
      return getCombinedSections([...dbMov, ...dbEsp]);
    }
    return getCombinedSections(items);
  }, []);

  const warmupGeneralSections = useMemo(() => buildGeneralSections(warmupUpper, warmupLower), [warmupUpper, warmupLower, buildGeneralSections]);
  const warmupUpperSections = useMemo(() => buildUpperSections(warmupUpper), [warmupUpper, buildUpperSections]);
  const warmupLowerSections = useMemo(() => buildLowerSections(warmupLower), [warmupLower, buildLowerSections]);

  const addGeneral = useCallback(() => {
    const newItem = { uid: Math.random().toString(36).slice(2), serie: 'Simple', ejercicio: '', sets: '', reps: '', descanso: '', notas: '', grupo: 'general', groupLabel: 'GENERAL', color: 'var(--color-primary)' };
    setWarmupUpper((prev) => ({ ...prev, general: [...(prev.general || []), { ...newItem, tipo: newItem.serie, pausa: newItem.descanso }] }));
    setWarmupLower((prev) => ({ ...prev, general: [...(prev.general || []), { ...newItem, tipo: newItem.serie, pausa: newItem.descanso }] }));
    showToast('Ejercicio general agregado');
  }, [setWarmupUpper, setWarmupLower, showToast]);

  const addUpper = useCallback(() => {
    const newItem = { uid: Math.random().toString(36).slice(2), serie: 'Simple', ejercicio: '', sets: '', reps: '', descanso: '', notas: '', grupo: 'movilidad', groupLabel: 'MOVILIDAD', color: 'var(--color-primary-100)' };
    setWarmupUpper((prev) => ({
      ...prev,
      movilidad: [...(prev.movilidad || []), { ...newItem, tipo: newItem.serie, pausa: newItem.descanso }],
    }));
    showToast('Ejercicio upper agregado');
  }, [setWarmupUpper, showToast]);

  const addLower = useCallback((grupo: string = 'movilidad') => {
    const newItem = { uid: Math.random().toString(36).slice(2), serie: 'Simple', ejercicio: '', sets: '', reps: '', descanso: '', notas: '', grupo, groupLabel: grupo === 'especifico' ? 'ESPECIFICO' : 'MOVILIDAD', color: 'var(--color-primary-100)' };
    if (grupo === 'especifico') {
      setWarmupLower((prev) => ({
        ...prev,
        especifico: [...(prev.especifico || []), { ...newItem, tipo: newItem.serie, pausa: newItem.descanso }],
      }));
    } else {
      setWarmupLower((prev) => ({
        ...prev,
        movilidad: [...(prev.movilidad || []), { ...newItem, tipo: newItem.serie, pausa: newItem.descanso }],
      }));
    }
    showToast('Ejercicio lower agregado');
  }, [setWarmupLower, showToast]);

  const update = useCallback((uid: string, field: string, val: any) => {
    const mapField = (f: string) => {
      if (f === 'serie') return 'tipo';
      if (f === 'descanso') return 'pausa';
      return f;
    };
    const apply = (prev: WarmupBlock): WarmupBlock => {
      const nextGeneral = (prev.general || []).map((b) => (b.uid === uid ? { ...b, [mapField(field)]: val } : b));
      const nextMovilidad = (prev.movilidad || []).map((b) => (b.uid === uid ? { ...b, [mapField(field)]: val } : b));
      const nextEspecifico = (prev.especifico || []).map((b) => (b.uid === uid ? { ...b, [mapField(field)]: val } : b));
      return { ...prev, general: nextGeneral, movilidad: nextMovilidad, especifico: nextEspecifico };
    };

    const inUpper = [...(warmupUpper.general || []), ...(warmupUpper.movilidad || []), ...(warmupUpper.especifico || [])].some((b) => b.uid === uid);
    const inLower = [...(warmupLower.general || []), ...(warmupLower.movilidad || []), ...(warmupLower.especifico || [])].some((b) => b.uid === uid);

    if (inUpper) setWarmupUpper(apply);
    if (inLower) setWarmupLower(apply);
  }, [warmupUpper, warmupLower, setWarmupUpper, setWarmupLower]);

  const remove = useCallback((uid: string) => {
    const apply = (prev: WarmupBlock): WarmupBlock => {
      const nextGeneral = (prev.general || []).filter((b) => b.uid !== uid);
      const nextMovilidad = (prev.movilidad || []).filter((b) => b.uid !== uid);
      const nextEspecifico = (prev.especifico || []).filter((b) => b.uid !== uid);
      return { ...prev, general: nextGeneral, movilidad: nextMovilidad, especifico: nextEspecifico };
    };
    const inUpper = [...(warmupUpper.general || []), ...(warmupUpper.movilidad || []), ...(warmupUpper.especifico || [])].some((b) => b.uid === uid);
    const inLower = [...(warmupLower.general || []), ...(warmupLower.movilidad || []), ...(warmupLower.especifico || [])].some((b) => b.uid === uid);
    if (inUpper) setWarmupUpper(apply);
    if (inLower) setWarmupLower(apply);
    showToast('Ejercicio eliminado');
  }, [warmupUpper, warmupLower, setWarmupUpper, setWarmupLower, showToast]);

  const reorder = useCallback((fromUid: string, toUid: string) => {
    const apply = (prev: WarmupBlock): WarmupBlock => {
      const nextGeneral = [...(prev.general || [])];
      const nextMovilidad = [...(prev.movilidad || [])];
      const nextEspecifico = [...(prev.especifico || [])];
      
      const fromIdxG = nextGeneral.findIndex((b) => b.uid === fromUid);
      const fromIdxM = nextMovilidad.findIndex((b) => b.uid === fromUid);
      const fromIdxE = nextEspecifico.findIndex((b) => b.uid === fromUid);
      const toIdxG = nextGeneral.findIndex((b) => b.uid === toUid);
      const toIdxM = nextMovilidad.findIndex((b) => b.uid === toUid);
      const toIdxE = nextEspecifico.findIndex((b) => b.uid === toUid);
      
      if (fromIdxG >= 0 && toIdxG >= 0) {
        const [moved] = nextGeneral.splice(fromIdxG, 1);
        nextGeneral.splice(toIdxG, 0, moved);
      } else if (fromIdxM >= 0 && toIdxM >= 0) {
        const [moved] = nextMovilidad.splice(fromIdxM, 1);
        nextMovilidad.splice(toIdxM, 0, moved);
      } else if (fromIdxE >= 0 && toIdxE >= 0) {
        const [moved] = nextEspecifico.splice(fromIdxE, 1);
        nextEspecifico.splice(toIdxE, 0, moved);
      }
      
      return { ...prev, general: nextGeneral, movilidad: nextMovilidad, especifico: nextEspecifico };
    };

    const inUpper = [...(warmupUpper.general || []), ...(warmupUpper.movilidad || []), ...(warmupUpper.especifico || [])].some((b) => b.uid === fromUid);
    const inLower = [...(warmupLower.general || []), ...(warmupLower.movilidad || []), ...(warmupLower.especifico || [])].some((b) => b.uid === fromUid);
    if (inUpper) setWarmupUpper(apply);
    if (inLower) setWarmupLower(apply);
  }, [warmupUpper, warmupLower, setWarmupUpper, setWarmupLower]);

  return {
    warmupUpper,
    warmupLower,
    warmupGeneralSections,
    warmupUpperSections,
    warmupLowerSections,
    addGeneral,
    addUpper,
    addLower,
    update,
    remove,
    reorder,
  };
}
