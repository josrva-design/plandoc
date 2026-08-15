import React, { useRef, useState, useEffect } from 'react';
import { downloadDashboardFitness, generateDashboardFitnessHTML } from '../services/ExportPlan.ts';
import { useAppContext } from '../context/AppContext.tsx';
import usePatientData from '../hooks/usePatientData.tsx';
import { runAllSafetyChecks } from '../utils/safetyRules.ts';

export default function ExportSection() {
  const { data, setters, showToast, createManualBackup, restoreBackup, listBackups, devMode, activePatientId } = useAppContext();
  const patientData = usePatientData(data);
    console.log('[ExportSection DEBUG] data.calendar:', JSON.stringify(data?.calendar, null, 2));
  console.log('[ExportSection DEBUG] data.routines:', JSON.stringify(data?.routines, null, 2));
  console.log('[ExportSection DEBUG] data.meals:', JSON.stringify(data?.meals, null, 2));
  console.log('[ExportSection DEBUG] patientData.routines:', JSON.stringify(patientData?.routines, null, 2));
  console.log('[ExportSection DEBUG] patientData.calendar:', JSON.stringify(patientData?.calendar, null, 2));
  const person = data.person || {};
  const fechaConsulta = data.fechaConsulta || '';
  const patientId = person.id || '';
  const showBackupSection = devMode || Boolean(activePatientId);

  const [backups, setBackups] = useState([]);
  const [loadingBackups, setLoadingBackups] = useState(false);

  const loadBackups = async () => {
    setLoadingBackups(true);
    try {
      const list = await listBackups();
      setBackups(list);
    } catch {
      showToast('Error al cargar backups');
    }
    setLoadingBackups(false);
  };

  const handleCreateBackup = async () => {
    await createManualBackup();
    loadBackups();
  };

  const handleRestoreBackup = async (id: string) => {
    if (window.confirm('¿Restaurar este backup? Se reemplazará el estado actual.')) {
      await restoreBackup(id);
      loadBackups();
    }
  };

  const getInitials = (name) => {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    const first = parts[0] ? parts[0][0].toUpperCase() : '';
    const last = parts.length > 1 ? parts[parts.length - 1][0].toUpperCase() : '';
    return first + last;
  };

  const formatDate = (raw) => {
    if (!raw) return '';
    const digits = raw.replace(/\D/g, '');
    if (digits.length === 8) {
      const y = digits.substring(0, 4);
      const m = digits.substring(4, 6);
      const d2 = digits.substring(6, 8);
      return `${y}${m}${d2}`;
    }
    if (digits.length === 6) {
      const y = digits.substring(0, 2);
      const m = digits.substring(2, 4);
      const d2 = digits.substring(4, 6);
      return `20${y}${m}${d2}`;
    }
    return digits;
  };

  const computedId = patientId || (() => {
    const initials = getInitials(person.nombre || '');
    const datePart = formatDate(person.fechaNacimiento || '');
    return initials && datePart ? `DOC-${initials}${datePart}` : '';
  })();

  const [fileName, setFileName] = useState(() => {
    const idPart = computedId ? computedId.replace(/[^a-zA-Z0-9-_]/g, '') : '';
    return idPart || 'paciente';
  });
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const idPart = computedId ? computedId.replace(/[^a-zA-Z0-9-_]/g, '') : '';
    if (idPart) {
      setFileName(idPart);
    }
  }, [computedId]);

  const handleSave = () => {
    try {
      const payload = {
        version: '1.0',
        fechaGuardado: new Date().toISOString(),
        data,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const finalName = `${fileName || 'paciente'}.json`;
      a.href = url;
      a.download = finalName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Archivo JSON guardado');
    } catch (err) {
      showToast('Error al guardar');
    }
  };

  const handleLoad = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!parsed.data || !parsed.version) {
          showToast('Archivo JSON inválido');
          setIsLoading(false);
          return;
        }
        const restored = parsed.data || {};
        Object.entries(restored).forEach(([key, value]) => {
          const setter = setters[`set${key.charAt(0).toUpperCase() + key.slice(1)}`];
          if (setter && typeof value === 'object' && value !== null) {
            if (key === 'meals' && !Array.isArray(value)) {
              const mealsArray = Object.entries(value).flatMap(([dayKey, dayMeals]) =>
                (dayMeals || []).map((meal) => ({ ...meal, dayKey }))
              );
              setter(mealsArray);
              return;
            }
            if (Array.isArray(value)) {
              setter(value.map((v) => (typeof v === 'object' && v !== null ? { ...v } : v)));
            } else {
              setter({ ...value });
            }
          }
        });
        showToast('Plan cargado correctamente');
      } catch (err) {
        showToast('Error al cargar el archivo');
      }
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.onerror = () => {
      showToast('Error al leer el archivo');
      setIsLoading(false);
    };
    reader.readAsText(file);
  };

  const handleWhatsApp = () => {
    const safety = runAllSafetyChecks(data);
    console.log('[ExportSection] safety:', safety);
    console.log('[ExportSection] patientData keys:', Object.keys(patientData || {}));
    console.log('[ExportSection] patientData.calendar:', JSON.stringify(patientData?.calendar, null, 2));
    console.log('[ExportSection] patientData.routines:', JSON.stringify(patientData?.routines, null, 2));
    if (safety.hasBlockers) {
      showToast(`⚠️ ${safety.summary.critical + safety.summary.high} alertas detectadas. Revisá el perfil antes de exportar.`);
      return;
    }
    const ok = downloadDashboardFitness(patientData, fileName);
    console.log('[ExportSection] downloadDashboardFitness result:', ok);
    showToast(ok ? 'Archivo HTML generado' : 'Error al generar archivo');
  };

  const handlePreview = () => {
    const html = generateDashboardFitnessHTML(patientData);
    const win = window.open('', '_blank');
    if (!win) {
      showToast('No se pudo abrir la vista previa');
      return;
    }
    win.document.write(html);
    win.document.close();
  };

  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const safety = runAllSafetyChecks(data);

  const criticalAlerts = safety.alerts.filter(a => a.level === 'critical' || a.level === 'high');

  return (
    <div className="w-full bg-transparent text-[var(--color-navy)] p-6 font-[Inter]">
      <div className="mb-8">
        <h2 className="premium-page-title text-[22px]">Datos</h2>
        <p className="premium-subtitle">Guardá y cargá el plan en formato JSON, y generá el archivo HTML para enviar por WhatsApp.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-[var(--color-bg-subtle)] border border-[var(--color-border)] rounded-2xl p-6">
          <h3 className="typo-value-lg text-[var(--color-navy)] mb-4">Guardar / Cargar</h3>
          <div className="space-y-4">
            <div>
              <label className="typo-label block mb-2">Fecha de consulta</label>
              <input
                type="date"
                value={fechaConsulta}
                onChange={(e) => setters.setFechaConsulta(e.target.value)}
                className="w-full bg-transparent outline-none typo-input border-b border-transparent focus:border-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="typo-label block mb-2">Nombre del archivo</label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="paciente"
                className="w-full bg-transparent outline-none typo-input border-b border-transparent focus:border-[var(--color-primary)] input-placeholder"
              />
              <p className="typo-muted-sm mt-1">
                Generado automáticamente desde el ID del paciente.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={handleSave} className="premium-btn-pill premium-btn-pill--primary">
                Guardar JSON
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="premium-btn-pill premium-btn-pill--ghost" disabled={isLoading}>
                {isLoading ? 'Cargando...' : 'Cargar JSON'}
              </button>
              <input ref={fileInputRef} type="file" accept="application/json" onChange={handleLoad} className="hidden" />
            </div>
            <p className="typo-muted-sm">El JSON guarda todo el estado editable del plan.</p>
          </div>
        </div>

        {showBackupSection && (
          <div className="bg-[var(--color-bg-subtle)] border border-[var(--color-border)] rounded-2xl p-6">
            <h3 className="typo-value-lg text-[var(--color-navy)] mb-4">Backup automático</h3>
            <p className="typo-muted-sm mb-4">Se guarda automáticamente cada 5 minutos en el navegador.</p>
            <div className="flex flex-wrap gap-3 mb-4">
              <button onClick={handleCreateBackup} className="premium-btn-pill premium-btn-pill--primary">
                Crear backup ahora
              </button>
              <button onClick={loadBackups} className="premium-btn-pill premium-btn-pill--ghost" disabled={loadingBackups}>
                {loadingBackups ? 'Cargando...' : 'Ver backups'}
              </button>
            </div>
            {backups.length > 0 && (
              <div className="max-h-60 overflow-y-auto border border-[var(--color-border)] rounded-xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--color-bg-base)]">
                    <tr>
                      <th className="px-3 py-2 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Fecha</th>
                      <th className="px-3 py-2 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {backups.slice(0, 10).map((backup) => (
                      <tr key={backup.id}>
                        <td className="px-3 py-2 text-[var(--color-text-primary)]">
                          {new Date(backup.fecha).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button onClick={() => handleRestoreBackup(backup.id)} className="text-xs text-[var(--color-primary)] font-semibold hover:underline">
                            Restaurar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <div className="bg-[var(--color-bg-subtle)] border border-[var(--color-border)] rounded-2xl p-6">
          <h3 className="typo-value-lg text-[var(--color-navy)] mb-4">Exportar HTML</h3>
          <div className="space-y-4">
            {criticalAlerts.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="typo-label text-red-800 mb-2">Alertas de seguridad ({criticalAlerts.length})</p>
                <ul className="space-y-1">
                  {criticalAlerts.map((alert, i) => (
                    <li key={i} className="text-xs text-red-700 flex items-start gap-2">
                      <span className="mt-0.5">•</span>
                      <span>{alert.message}</span>
                    </li>
                  ))}
                </ul>
                <p className="typo-muted-sm mt-3">Resolvé estas alertas en el perfil antes de exportar.</p>
              </div>
            )}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={disclaimerAccepted}
                onChange={e => setDisclaimerAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              />
              <span className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                Confirmo que este plan fue revisado por un profesional de la salud y que el paciente fue informado de que este documento no reemplaza el consejo médico, nutricional o de entrenamiento profesional. El paciente ha sido orientado a consultar a su médico antes de iniciar cualquier cambio en su dieta o rutina de ejercicios.
              </span>
            </label>
            <div className="flex flex-wrap gap-3">
              <button onClick={handlePreview} className="premium-btn-pill premium-btn-pill--ghost">
                Vista previa
              </button>
              <button
                onClick={handleWhatsApp}
                disabled={!disclaimerAccepted}
                className="premium-btn-pill premium-btn-pill--primary disabled:opacity-30 btn-whatsapp"
              >
                Generar archivo para WhatsApp
              </button>
            </div>
            <p className="typo-muted-sm">Genera un archivo HTML offline mobile-ready para enviar por WhatsApp. Las secciones vacías se omiten automáticamente.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
