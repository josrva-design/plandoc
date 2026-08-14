import { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import useAppData, { type Setters } from '../hooks/useAppData.ts';
import { useAutoSave } from '../hooks/useAutoSave.ts';
import { usePatientsDB } from '../hooks/usePatientsDB.ts';
import mockPacienteCompleto from '../mocks/mockPacienteCompleto';
import { useAutoBackup } from '../hooks/useAutoBackup.ts';
import { getBackups, restoreBackup as restoreBackupService, clearOldBackups } from '../utils/backupService.ts';
import { safeStringify } from '../hooks/useAutoSave.ts';

const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV;

const STORAGE_KEY = 'docfitness-dev-mode';
const AUTOSAVE_KEY = 'docfitness-autosave';

const AppContext = createContext<{
  data: AppData;
  setters: Setters;
  devMode: boolean;
  toggleDevMode: () => void;
  isDev: boolean;
  toast: string;
  showToast: (msg: string) => void;
  lastSaved: Date | null;
  patients: PatientRecord[];
  activePatientId: string | null;
  dbLoading: boolean;
  dbReady: boolean;
  createPatient: (nombre: string) => Promise<string>;
  setActivePatient: (id: string | null) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;
  handleImportJSON: (file: File) => Promise<{ success: boolean; data?: any; error?: string }>;
  refreshList: () => Promise<void>;
  setActiveTab?: (tab: string) => void;
} | null>(null);

export function AppProvider({ children, initialTab = 'dashboard' }: { children: React.ReactNode; initialTab?: string }) {
  const [devMode, setDevMode] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'true';
  });

  const [activeTab, setActiveTab] = useState(initialTab);

  const {
    patients,
    activePatientId,
    loading: dbLoading,
    createPatient,
    setActivePatient,
    deletePatient,
    importJSON,
    refreshList,
  } = usePatientsDB();

  const initialData = devMode ? mockPacienteCompleto : null;
  const { data, setters } = useAppData(initialData);

  const dataRef = useRef(data);
  dataRef.current = data;

  const [toast, setToast] = useState('');
  const [lastSaved, setLastSaved] = useState(null);
  const [dbReady, setDbReady] = useState(false);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 1800);
  }, []);

  const handleAutoSave = useCallback(() => {
    setLastSaved(new Date());
  }, []);

  useAutoSave(
    data,
    () => AUTOSAVE_KEY,
    handleAutoSave
  );

  useAutoBackup(data, 5 * 60 * 1000);

  useEffect(() => {
    if (devMode || dbLoading || activePatientId || !dbReady) return;
    try {
      const autosaveRaw = localStorage.getItem(AUTOSAVE_KEY);
      if (!autosaveRaw) return;
      const parsed = JSON.parse(autosaveRaw);
      if (parsed?.data && Object.keys(parsed.data).length > 0) {
        setters.resetState(parsed.data);
        showToast('Datos recuperados del autoguardado');
      }
    } catch (e) {
      console.warn('Failed to restore autosave:', e);
    }
  }, [devMode, dbLoading, activePatientId, dbReady, setters, showToast]);

  const toggleDevMode = useCallback(async () => {
    const next = !devMode;

    if (next && dataRef.current) {
      try {
        localStorage.setItem(AUTOSAVE_KEY, safeStringify({
          version: '1.0',
          fechaGuardado: new Date().toISOString(),
          data: dataRef.current,
        }));
      } catch (e) {
        console.warn('Failed to backup before mode switch:', e);
      }
    }

    localStorage.setItem(STORAGE_KEY, String(next));
    setDevMode(next);
    if (!next) {
      await setActivePatient(null);
    }
    setters.resetState(next ? mockPacienteCompleto : null);
  }, [devMode, setters, showToast, setActivePatient]);

  const handleImportJSON = useCallback(async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const result = await importJSON(e.target?.result as string);
        if (result.success && result.data) {
          setters.resetState(result.data);
          showToast('Plan cargado correctamente');
          await refreshList();
        } else {
          showToast(result.error || 'Error al importar');
        }
      } catch {
        showToast('Error al leer archivo');
      }
    };
    reader.readAsText(file);
  }, [importJSON, showToast, refreshList, setters]);

  const createManualBackup = useCallback(async () => {
    try {
      await clearOldBackups(20);
      const id = await createBackup(data);
      showToast('Backup creado correctamente');
      return id;
    } catch (e) {
      showToast('Error al crear backup');
      return null;
    }
  }, [data, showToast]);

  const restoreBackup = useCallback(async (id: string) => {
    try {
      const backupData = await restoreBackupService(id);
      if (backupData) {
        setters.resetState(backupData);
        showToast('Backup restaurado correctamente');
        return true;
      }
      showToast('Backup no encontrado');
      return false;
    } catch (e) {
      showToast('Error al restaurar backup');
      return false;
    }
  }, [setters, showToast]);

  const listBackups = useCallback(async () => {
    try {
      return await getBackups();
    } catch {
      return [];
    }
  }, []);

  const contextValue = useMemo(() => ({
    data,
    setters,
    devMode,
    toggleDevMode,
    isDev,
    toast,
    showToast,
    lastSaved,
    patients,
    activePatientId,
    dbLoading,
    dbReady,
    createPatient,
    setActivePatient,
    deletePatient,
    handleImportJSON,
    refreshList,
    activeTab,
    setActiveTab,
    createManualBackup,
    restoreBackup,
    listBackups,
  }), [data, setters, devMode, toggleDevMode, isDev, toast, showToast, lastSaved, patients, activePatientId, dbLoading, dbReady, createPatient, setActivePatient, deletePatient, handleImportJSON, refreshList, activeTab, createManualBackup, restoreBackup, listBackups]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext debe usarse dentro de <AppProvider>');
  }
  return ctx;
}

export default AppContext;
