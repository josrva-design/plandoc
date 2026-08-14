import { useState, useCallback, useEffect } from 'react';
import { db, type PatientRecord } from '../db/schema';
import useAppData from '../hooks/useAppData.ts';
import type { AppData } from '../core/types.ts';

const STORAGE_KEY = 'docfitness-dev-mode';
const ACTIVE_PATIENT_KEY = 'docfitness-active-patient';

export function usePatientsDB() {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [activePatientId, setActivePatientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPatients = useCallback(async () => {
    try {
      const list = await db.patients.orderBy('updatedAt').reverse().toArray();
      setPatients(list);
    } catch (e) {
      console.warn('Failed to load patients:', e);
    }
  }, []);

  const loadActivePatientId = useCallback(async () => {
    try {
      const saved = localStorage.getItem(ACTIVE_PATIENT_KEY);
      if (saved) setActivePatientId(saved);
    } catch (e) {
      console.warn('Failed to load active patient:', e);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await loadPatients();
      await loadActivePatientId();
      if (mounted) setLoading(false);
    })();
    return () => { mounted = false; };
  }, [loadPatients, loadActivePatientId]);

  const refreshList = useCallback(async () => {
    await loadPatients();
  }, [loadPatients]);

  const createPatient = useCallback(async (nombre: string): Promise<PatientRecord> => {
    const id = `patient-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const now = Date.now();
    const record: PatientRecord = {
      id,
      nombre: nombre || 'Paciente sin nombre',
      createdAt: now,
      updatedAt: now,
    };
    await db.patients.add(record);
    await loadPatients();
    setActivePatientId(id);
    localStorage.setItem(ACTIVE_PATIENT_KEY, id);
    return record;
  }, [loadPatients]);

  const saveCurrentPatient = useCallback(async (id: string, nombre?: string) => {
    const now = Date.now();
    await db.patients.update(id, {
      nombre: nombre || 'Paciente sin nombre',
      updatedAt: now,
    });
    await loadPatients();
  }, [loadPatients]);

  const deletePatient = useCallback(async (id: string) => {
    await db.patients.delete(id);
    if (activePatientId === id) {
      setActivePatientId(null);
      localStorage.removeItem(ACTIVE_PATIENT_KEY);
    }
    await loadPatients();
  }, [activePatientId, loadPatients]);

  const setActivePatient = useCallback(async (id: string | null) => {
    setActivePatientId(id);
    if (id) {
      localStorage.setItem(ACTIVE_PATIENT_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_PATIENT_KEY);
    }
  }, []);

  const importJSON = useCallback(async (jsonString: string): Promise<{ success: boolean; patient?: PatientRecord; error?: string }> => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.data && !parsed.person) {
        return { success: false, error: 'Archivo JSON inválido: falta data o person' };
      }
      const appData = parsed.data || parsed;
      const nombre = appData.person?.nombre || 'Paciente importado';
      const record = await createPatient(nombre);
      return { success: true, patient: record, data: appData };
    } catch (e) {
      return { success: false, error: 'Error al parsear JSON' };
    }
  }, [createPatient]);

  const exportPatient = useCallback(async (): Promise<string | null> => {
    return null;
  }, []);

  return {
    patients,
    activePatientId,
    loading,
    refreshList,
    createPatient,
    saveCurrentPatient,
    deletePatient,
    setActivePatient,
    importJSON,
    exportPatient,
  };
}
