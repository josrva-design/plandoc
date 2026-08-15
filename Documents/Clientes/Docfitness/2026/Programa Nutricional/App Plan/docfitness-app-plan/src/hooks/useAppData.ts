import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { AppData } from '../core/types.ts';
import {
  initialPerson,
  initialStats,
  initialNutrition,
  initialTraining,
  initialCalendar,
  initialWarmupUpper,
  initialWarmupLower,
  initialRoutines,
  initialMeals,
  initialSupplements,
  initialSupplementsStrategy,
  initialFeedback,
  initialDiagnosis,
  initialObjectives,
  initialHabits,
  initialEvolution,
  initialFechaConsulta,
} from '../data/sampleData';
import { getProximaConsulta } from '../utils/summaryHelpers.ts';

const computeState = (initialData: Partial<AppData> | null = null): AppData => {
  const _p = initialData?.person ?? initialPerson;
  const _stats = initialData?.stats ?? initialStats;
  const _nutrition = initialData?.nutrition ?? initialNutrition;
  const _training = initialData?.training ?? initialTraining;
  const _calendar = initialData?.calendar ?? initialCalendar;
  const _warmupUpper = initialData?.warmupUpper ?? initialWarmupUpper;
  const _warmupLower = initialData?.warmupLower ?? initialWarmupLower;
  const _routines = initialData?.routines ?? initialRoutines;
  const _meals = initialData?.meals ?? initialMeals;
  const _supplements = initialData?.supplements ?? initialSupplements;
  const _supplementsStrategy = initialData?.supplementsStrategy ?? initialSupplementsStrategy;
  const _feedback = initialData?.feedback ?? initialFeedback;
  const _diagnosis = initialData?.diagnosis ?? initialDiagnosis;
  const _objectives = initialData?.objectives ?? initialObjectives;
  const _habits = initialData?.habits ?? initialHabits;
  const _evolution = initialData?.evolution ?? initialEvolution;
  const _fechaConsulta = initialData?.fechaConsulta ?? initialFechaConsulta;
  const _proximaConsulta = initialData?.proximaConsulta ?? getProximaConsulta(_fechaConsulta) ?? '';
  const _profileHistory = initialData?.profileHistory ?? [];

  const normalizeRoutine = (item: any, dayKey: string | null) => ({
    ...item,
    id: item.id || dayKey || null,
    nombre: item.nombre || item.label || '',
    titulo: item.titulo || item.label || item.nombre || '',
    ejercicios: item.ejercicios?.map((e: any) => ({ ...e })) ?? [],
  });

  const normalizedRoutines = (() => {
    if (!_routines) return [];
    if (Array.isArray(_routines)) {
      return _routines.map((r: any) => normalizeRoutine(r, null));
    }
    if (typeof _routines === 'object') {
      return Object.entries(_routines).map(([dayKey, r]: [string, any]) => normalizeRoutine(r, dayKey));
    }
    return [];
  })();

  const normalizeWarmup = (raw: any) => {
    const source = raw || {};
    return {
      general: [...(source.general ?? [])],
      movilidad: [...(source.movilidad ?? source.movilidad_old ?? [])],
      especifico: [...(source.especifico ?? source.específico ?? source.especifico_old ?? [])],
    };
  };

  const normalizedWarmupUpper = normalizeWarmup(_warmupUpper);
  const normalizedWarmupLower = normalizeWarmup(_warmupLower);

  return {
    person: { ..._p },
    stats: { ..._stats },
    nutrition: { ..._nutrition },
    training: { ..._training },
    calendar: _calendar?.map((d: any) => ({ ...d })) ?? [],
    warmupUpper: normalizedWarmupUpper,
    warmupLower: normalizedWarmupLower,
    routines: normalizedRoutines,
    activeRoutineId: initialData?.activeRoutineId ?? (normalizedRoutines.length ? normalizedRoutines[0].id : null),
    meals: _meals ? [..._meals] : [],
    supplements: _supplements?.map((s: any) => ({ ...s })) ?? [],
    supplementsStrategy: _supplementsStrategy,
    feedback: { ..._feedback },
    diagnosis: { ..._diagnosis },
    objectives: { ..._objectives },
    habits: { ..._habits },
    evolution: { ..._evolution },
    fechaConsulta: _fechaConsulta,
    proximaConsulta: _proximaConsulta,
    profileHistory: [..._profileHistory],
  };
};

export interface Setters {
  setPerson: (value: any) => void;
  setPrx: (value: any) => void;
  setStats: (value: any) => void;
  editarStats: (campo: string, valor: any) => void;
  setNutrition: (value: any) => void;
  setTraining: (value: any) => void;
  setCalendar: (value: any) => void;
  setWarmupUpper: (value: any) => void;
  setWarmupLower: (value: any) => void;
  setRoutines: (value: any) => void;
  setActiveRoutineId: (value: any) => void;
  setMeals: (value: any) => void;
  setSupplements: (value: any) => void;
  setSupplementsStrategy: (value: any) => void;
  setFeedback: (value: any) => void;
  setDiagnosis: (value: any) => void;
  setObjectives: (value: any) => void;
  setHabits: (value: any) => void;
  setEvolution: (value: any) => void;
  setFechaConsulta: (value: any) => void;
  setProximaConsulta: (value: any) => void;
  setProfileHistory: (value: any) => void;
  resetState: (newInitialData: Partial<AppData> | null) => void;
}

export default function useAppData(initialData: Partial<AppData> | null = null) {
  const [person, setPerson] = useState(() => computeState(initialData).person);
  const [stats, setStats] = useState(() => computeState(initialData).stats);
  const [nutrition, _setNutrition] = useState(() => computeState(initialData).nutrition);
  const [training, _setTraining] = useState(() => computeState(initialData).training);
  const [calendar, setCalendar] = useState(() => computeState(initialData).calendar);
  const [warmupUpper, setWarmupUpper] = useState(() => computeState(initialData).warmupUpper);
  const [warmupLower, setWarmupLower] = useState(() => computeState(initialData).warmupLower);
  const [routines, _setRoutines] = useState(() => computeState(initialData).routines);
  const [activeRoutineId, setActiveRoutineId] = useState(() => computeState(initialData).activeRoutineId);
  const [meals, setMeals] = useState(() => computeState(initialData).meals);
  const [supplements, setSupplements] = useState(() => computeState(initialData).supplements);
  const [supplementsStrategy, setSupplementsStrategy] = useState(() => computeState(initialData).supplementsStrategy);
  const [feedback, setFeedback] = useState(() => computeState(initialData).feedback);
  const [diagnosis, setDiagnosis] = useState(() => computeState(initialData).diagnosis);
  const [objectives, setObjectives] = useState(() => computeState(initialData).objectives);
  const [habits, setHabits] = useState(() => computeState(initialData).habits);
  const [evolution, setEvolution] = useState(() => computeState(initialData).evolution);
  const [fechaConsulta, setFechaConsulta] = useState(() => computeState(initialData).fechaConsulta);
  const [proximaConsulta, setProximaConsulta] = useState(() => computeState(initialData).proximaConsulta);
  const [profileHistory, setProfileHistory] = useState(() => computeState(initialData).profileHistory || []);

  useEffect(() => {
    if (!evolution || !evolution.cells || !evolution.consultas || !evolution.consultas.length) return;
    const lastConsulta = evolution.consultas[evolution.consultas.length - 1];
    const cell = evolution.cells[lastConsulta];
    if (!cell) return;
    const nextStats: any = {};
    const adherenceKeys = ['adherencia', 'nutricion', 'entreno', 'cardio', 'descanso'];
    let changed = false;
    adherenceKeys.forEach((key) => {
      const raw = cell[key];
      if (typeof raw === 'number' && Number.isFinite(raw)) {
        nextStats[key] = raw;
        changed = true;
      }
    });
    if (changed) {
      const components = [nextStats.nutricion, nextStats.entreno, nextStats.cardio, nextStats.descanso].filter((v) => typeof v === 'number' && Number.isFinite(v));
      const promedio = components.length ? Math.round(components.reduce((s, v) => s + v, 0) / components.length) : undefined;
      setStats((prev: any) => ({
        ...prev,
        ...nextStats,
        ...(promedio !== undefined ? { adherencia: promedio } : {}),
      }));
    }
  }, [evolution, setStats]);

  const sanitizeNonNegative = (value: any): any => {
    if (typeof value === 'number') return value < 0 ? 0 : value;
    if (typeof value === 'string') {
      const num = parseFloat(value);
      if (!isNaN(num) && num < 0) return '0';
    }
    return value;
  };

  const setNutrition = useCallback((value: any) => {
    if (typeof value === 'object' && value !== null) {
      const sanitized = { ...value };
      const numericFields = ['kcal', 'prot', 'carbs', 'grasas'];
      numericFields.forEach((field) => {
        if (field in sanitized) {
          sanitized[field] = sanitizeNonNegative(sanitized[field]);
        }
      });
      _setNutrition(sanitized);
    } else {
      _setNutrition(value);
    }
  }, [_setNutrition]);

  const setTraining = useCallback((value: any) => {
    if (typeof value === 'object' && value !== null) {
      const sanitized = { ...value };
      const numericFields = ['dias', 'cardio', 'pasos'];
      numericFields.forEach((field) => {
        if (field in sanitized) {
          sanitized[field] = sanitizeNonNegative(sanitized[field]);
        }
      });
      _setTraining(sanitized);
    } else {
      _setTraining(value);
    }
  }, [_setTraining]);

  const setRoutines = useCallback((value: any) => {
    if (Array.isArray(value)) {
      const sanitized = value.map((routine: any) => {
        if (!routine || typeof routine !== 'object') return routine;
        const sanitizedRoutine = { ...routine, ejercicios: [...(routine.ejercicios || [])] };
        sanitizedRoutine.ejercicios = sanitizedRoutine.ejercicios.map((ej: any) => {
          if (!ej || typeof ej !== 'object') return ej;
          const sanitizedEj = { ...ej };
          const numericFields = ['sets', 'semana2', 'semana3', 'semana4', 'peso'];
          numericFields.forEach((field) => {
            if (field in sanitizedEj) {
              sanitizedEj[field] = sanitizeNonNegative(sanitizedEj[field]);
            }
          });
          return sanitizedEj;
        });
        return sanitizedRoutine;
      });
      _setRoutines(sanitized);
    } else {
      _setRoutines(value);
    }
  }, [_setRoutines]);

  const resetState = useCallback((newInitialData: Partial<AppData> | null = null) => {
    const next = computeState(newInitialData);
    setPerson(next.person);
    setStats(next.stats);
    setNutrition(next.nutrition);
    setTraining(next.training);
    setCalendar(next.calendar);
    setWarmupUpper(next.warmupUpper);
    setWarmupLower(next.warmupLower);
    setRoutines(next.routines);
    setActiveRoutineId(next.activeRoutineId);
    setMeals(next.meals);
    setSupplements(next.supplements);
    setSupplementsStrategy(next.supplementsStrategy);
    setFeedback(next.feedback);
    setDiagnosis(next.diagnosis);
    setObjectives(next.objectives);
    setHabits(next.habits);
    setEvolution(next.evolution);
    setFechaConsulta(next.fechaConsulta);
    setProximaConsulta(next.proximaConsulta);
    setProfileHistory(next.profileHistory);
  }, []);

  const editarStats = useCallback((campo: string, valor: any) => {
    const numericFields = ['peso', 'abdomen', 'grasaKg', 'grasaPorc', 'pliegue', 'avPeso', 'avAbd', 'avGrasaKg', 'avGrasaPorc', 'avPliegue', 'adherencia', 'nutricion', 'entreno', 'cardio', 'descanso'];
    if (numericFields.includes(campo)) {
      const num = parseFloat(valor);
      if (!isNaN(num) && num < 0) return;
    }
    setStats((prev: any) => ({ ...prev, [campo]: valor }));
  }, []);

  const data: AppData = {
    person,
    stats,
    nutrition,
    training,
    calendar,
    warmupUpper,
    warmupLower,
    routines,
    activeRoutineId,
    meals,
    supplements,
    supplementsStrategy,
    feedback,
    diagnosis,
    objectives,
    habits,
    evolution,
    fechaConsulta,
    proximaConsulta,
    profileHistory,
  };

  const setters = useMemo<Setters>(() => ({
    setPerson,
    setStats,
    editarStats,
    setNutrition,
    setTraining,
    setCalendar,
    setWarmupUpper,
    setWarmupLower,
    setRoutines,
    setActiveRoutineId,
    setMeals,
    setSupplements,
    setSupplementsStrategy,
    setFeedback,
    setDiagnosis,
    setObjectives,
    setHabits,
    setEvolution,
      setFechaConsulta,
    setProximaConsulta,
    setProfileHistory,
    resetState,
  }), []);

  const resultRef = useRef({ data, setters });
  resultRef.current = { data, setters };

  return resultRef.current;
}
