import { useEffect, useRef, useCallback } from 'react';

export function safeStringify(value: any): string {
  const seen = new WeakSet();
  return JSON.stringify(value, (_key, val) => {
    if (typeof val === 'object' && val !== null) {
      if (seen.has(val)) return '[Circular]';
      seen.add(val);
    }
    return val;
  });
}

export function useAutoSave(data, getSaveKey, onSave) {
  const timeoutRef = useRef(null);
  const lastSavedRef = useRef('');
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  useEffect(() => {
    try {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      const saveKey = getSaveKey();
      let dataStr: string;
      try {
        dataStr = safeStringify(data);
      } catch (e) {
        console.warn('AutoSave: failed to serialize data', e);
        return;
      }

      if (dataStr === lastSavedRef.current) return;

      timeoutRef.current = setTimeout(() => {
        try {
          const payload = {
            version: '1.0',
            fechaGuardado: new Date().toISOString(),
            data,
          };
          localStorage.setItem(saveKey, safeStringify(payload));
          lastSavedRef.current = dataStr;
          if (onSaveRef.current) onSaveRef.current();
        } catch (e) {
          console.warn('AutoSave failed:', e);
        }
      }, 2000);

      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    } catch (e) {
      console.warn('AutoSave effect error:', e);
    }
  }, [data, getSaveKey]);

  const forceSave = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    try {
      const saveKey = getSaveKey();
      const payload = {
        version: '1.0',
        fechaGuardado: new Date().toISOString(),
        data,
      };
      localStorage.setItem(saveKey, safeStringify(payload));
      lastSavedRef.current = safeStringify(data);
      if (onSaveRef.current) onSaveRef.current();
    } catch (e) {
      console.warn('Force save failed:', e);
    }
  }, [data, getSaveKey]);

  return { forceSave };
}
