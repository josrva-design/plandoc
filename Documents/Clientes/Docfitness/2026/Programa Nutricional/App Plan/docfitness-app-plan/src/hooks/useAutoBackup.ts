import { useEffect, useRef, useCallback } from 'react';
import { createBackup, clearOldBackups } from '../utils/backupService';

export function useAutoBackup(data: any, intervalMs: number = 5 * 60 * 1000) {
  const lastBackupRef = useRef<string | null>(null);

  const doBackup = useCallback(async () => {
    try {
      await createBackup(data);
      lastBackupRef.current = new Date().toISOString();
      clearOldBackups(20);
    } catch (e) {
      console.warn('AutoBackup failed:', e);
    }
  }, [data]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        const payload = {
          version: '1.0',
          fechaGuardado: new Date().toISOString(),
          data,
        };
        localStorage.setItem('docfitness-emergency-backup', JSON.stringify(payload));
      } catch {
        // silencioso
      }
    };

    const interval = setInterval(() => {
      doBackup();
    }, intervalMs);

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [data, doBackup, intervalMs]);

  return {
    lastBackup: lastBackupRef.current,
    doBackup,
  };
}
