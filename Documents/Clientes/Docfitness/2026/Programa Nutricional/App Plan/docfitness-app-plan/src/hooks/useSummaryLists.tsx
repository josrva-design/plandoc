import { useState, useEffect, useCallback } from 'react';
import { safeStringify } from '../hooks/useAutoSave.ts';

interface UseSummaryListsOptions {
  feedback?: { r1?: string; r2?: string; r3?: string };
  diagnosis?: { d1?: string; d2?: string; d3?: string };
  objectives?: { o1?: string; o2?: string; o3?: string };
  onFeedbackChange?: (feedback: { r1: string; r2: string; r3: string }) => void;
  onDiagnosisChange?: (diagnosis: { d1: string; d2: string; d3: string }) => void;
  onObjectivesChange?: (objectives: { o1: string; o2: string; o3: string }) => void;
}

export function useSummaryLists({ feedback, diagnosis, objectives, onFeedbackChange, onDiagnosisChange, onObjectivesChange }: UseSummaryListsOptions) {
  const RETRO_PLACEHOLDER = 'Describe la retroalimentación';
  const DIAG_PLACEHOLDER = 'Describe el diagnóstico';
  const OBJ_PLACEHOLDER = 'Describe los objetivos y plan a seguir';

  const [retroItems, setRetroItems] = useState(() => {
    const items = [feedback?.r1, feedback?.r2, feedback?.r3].filter(Boolean);
    return items;
  });

  const [diagItems, setDiagItems] = useState(() => {
    const items = [diagnosis?.d1, diagnosis?.d2, diagnosis?.d3].filter(Boolean);
    return items;
  });

  const [objItems, setObjItems] = useState(() => {
    const items = [objectives?.o1, objectives?.o2, objectives?.o3].filter(Boolean);
    return items;
  });

  useEffect(() => {
    const current = retroItems.filter(Boolean);
    const next = current.length ? current : ['', '', ''];
    const obj = { r1: next[0] || '', r2: next[1] || '', r3: next[2] || '' };
    if (onFeedbackChange && safeStringify(obj) !== safeStringify(feedback || {})) {
      onFeedbackChange(obj);
    }
  }, [retroItems, feedback, onFeedbackChange]);

  useEffect(() => {
    const current = diagItems.filter(Boolean);
    const next = current.length ? current : ['', '', ''];
    const obj = { d1: next[0] || '', d2: next[1] || '', d3: next[2] || '' };
    if (onDiagnosisChange && safeStringify(obj) !== safeStringify(diagnosis || {})) {
      onDiagnosisChange(obj);
    }
  }, [diagItems, diagnosis, onDiagnosisChange]);

  useEffect(() => {
    const current = objItems.filter(Boolean);
    const next = current.length ? current : ['', '', ''];
    const obj = { o1: next[0] || '', o2: next[1] || '', o3: next[2] || '' };
    if (onObjectivesChange && safeStringify(obj) !== safeStringify(objectives || {})) {
      onObjectivesChange(obj);
    }
  }, [objItems, objectives, onObjectivesChange]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, idx: number, items: string[], setItems: React.Dispatch<React.SetStateAction<string[]>>) => {
    const next = [...items];
    next[idx] = e.target.value;
    setItems(next);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>, items: string[], setItems: React.Dispatch<React.SetStateAction<string[]>>, idx: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const next = [...items];
      next.splice(idx + 1, 0, '');
      setItems(next);
      setTimeout(() => {
        const list = e.target.closest('.space-y-1');
        if (!list) return;
        const inputs = Array.from(list.querySelectorAll('input'));
        if (inputs[idx + 1]) {
          (inputs[idx + 1] as HTMLInputElement).focus();
        }
      }, 0);
    } else if (e.key === 'Backspace') {
      if (e.target.value === '' || e.target.value === undefined) {
        e.preventDefault();
        if (items.length <= 1) return;
        const next = items.filter((_, i) => i !== idx);
        setItems(next);
        setTimeout(() => {
          const list = e.target.closest('.space-y-1');
          if (!list) return;
          const inputs = Array.from(list.querySelectorAll('input'));
          const focusIdx = Math.max(0, idx - 1);
          if (inputs[focusIdx]) {
            (inputs[focusIdx] as HTMLInputElement).focus();
          }
        }, 0);
      }
    }
  }, []);

  const renderList = useCallback((items: string[], setItems: React.Dispatch<React.SetStateAction<string[]>>, placeholder: string) => {
    if (!Array.isArray(items)) return null;
    const list = items.length ? items : [''];
    return (
      <div className="space-y-1">
        {list.map((val, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <span className="typo-label mt-0.5 w-5 text-right">{idx + 1}.</span>
            <input
              type="text"
              value={val}
              onChange={(e) => handleChange(e, idx, list, setItems)}
              onKeyDown={(e) => handleKeyDown(e, list, setItems, idx)}
              placeholder={!val ? placeholder : ''}
              className="flex-1 w-full bg-transparent outline-none typo-input border-b border-transparent focus:border-[var(--color-primary)] input-placeholder list-input"
            />
          </div>
        ))}
      </div>
    );
  }, [handleChange, handleKeyDown]);

  return {
    retroItems,
    setRetroItems,
    diagItems,
    setDiagItems,
    objItems,
    setObjItems,
    renderList,
    RETRO_PLACEHOLDER,
    DIAG_PLACEHOLDER,
    OBJ_PLACEHOLDER,
  };
}
