import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import ProfileSection from './ProfileSection.tsx';
import SummarySection from './SummarySection.tsx';
import TrainingEditor from './TrainingEditor.tsx';
import NutritionSection from './NutritionSection.tsx';
import EvolutionSection from './EvolutionSection.tsx';
import SupplementSection from './SupplementSection.tsx';
import ExportSection from './ExportSection.tsx';
import VistaPaciente from '../pages/VistaPaciente.tsx';
import ErrorBoundary from './ErrorBoundary.tsx';
import { useAppContext } from '../context/AppContext.tsx';
import { useSecretDevMode } from '../hooks/useSecretDevMode.ts';
import PatientModal from './PatientModal.tsx';

import devLogo from '../assets/dev-logo.svg';

const TABS = [
  { key: 'dashboard', label: 'Dashboard', group: '1' },
  { key: 'perfil', label: 'Perfil', group: '2' },
  { key: 'evolucion', label: 'Evolución', group: '2' },
  { key: 'nutricion', label: 'Nutrición', group: '3' },
  { key: 'entrenamiento', label: 'Entrenamiento', group: '3' },
  { key: 'suplementos', label: 'Suplementos', group: '3' },
  { key: 'configuracion', label: 'Configuración', group: '4' },
  { key: 'vista_paciente', label: 'Vista paciente', group: '4' },
];

export default function EditorUI({ onLogout }: { onLogout?: () => void }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [patientModalOpen, setPatientModalOpen] = useState(false);
  const { data, setters, devMode, toggleDevMode, isDev, showToast, activePatientId, dbLoading, dbReady, activeTab, setActiveTab, setActivePatient } = useAppContext();
  const logoRef = useRef<HTMLButtonElement>(null);

  const secretDevModeOptions = useMemo(() => ({
    clickTarget: logoRef,
    clickCount: 5,
    clickWindowMs: 500,
    keyCombo: { ctrl: true, alt: true, shift: true, key: 'd' },
  }), []);

  useSecretDevMode(toggleDevMode, undefined, secretDevModeOptions);

  const person = data?.person || {};
  const isEmptyPatient = !person.nombre && !person.pesoIni && !person.estatura;

  useEffect(() => {
    if (devMode) {
      setPatientModalOpen(false);
    }
  }, [devMode]);

  useEffect(() => {
    if (activePatientId && !dbLoading && dbReady && isEmptyPatient && activeTab !== 'perfil') {
      setActiveTab('perfil');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePatientId, dbLoading, dbReady, isEmptyPatient, setActiveTab]);

  const renderContent = () => {
    if (devMode) {
      return (
        <>
          {activeTab === 'dashboard' && <SummarySection />}
          {activeTab === 'perfil' && <ProfileSection />}
          {activeTab === 'evolucion' && <EvolutionSection />}
          {activeTab === 'nutricion' && <NutritionSection />}
          {activeTab === 'entrenamiento' && <TrainingEditor />}
          {activeTab === 'suplementos' && <SupplementSection />}
          {activeTab === 'configuracion' && <ExportSection />}
          {activeTab === 'vista_paciente' && <VistaPaciente />}
        </>
      );
    }

    const effectiveTab = (!activePatientId && !dbLoading) ? 'dashboard' : activeTab;

    return (
      <>
        {effectiveTab === 'dashboard' && <SummarySection />}
        {effectiveTab === 'perfil' && <ProfileSection />}
        {effectiveTab === 'evolucion' && <EvolutionSection />}
        {effectiveTab === 'nutricion' && <NutritionSection />}
        {effectiveTab === 'entrenamiento' && <TrainingEditor />}
        {effectiveTab === 'suplementos' && <SupplementSection />}
        {effectiveTab === 'configuracion' && <ExportSection />}
        {effectiveTab === 'vista_paciente' && <VistaPaciente />}
      </>
    );
  };

  const showPatientModal = !devMode && (patientModalOpen || activeTab === 'paciente' || (!activePatientId && !dbLoading));

  const showSidebar = true;

  const editorMainClass = showSidebar
    ? 'editor-main'
    : 'editor-main editor-main--no-sidebar';

  return (
      <div className={`editor-layout font-[Inter] typo-input ${sidebarOpen ? 'editor-sidebar-open' : ''}`}>
      {showSidebar ? (
        <>
      <aside className="editor-sidebar">
        <div className="sidebar-logo">
          <button
            ref={logoRef}
            className="w-full flex items-center justify-center"
            aria-label="DocFitness"
          >
            <img src="/doc-logo.svg" alt="DocFitness" className="h-8 w-auto" />
          </button>
        </div>
        <nav className="sidebar-nav">
          {['1', '2', '3', '4'].map((group) => (
            <React.Fragment key={group}>
              {group !== '1' && <div className="sidebar-divider" />}
              {TABS.filter(t => t.group === group).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setSidebarOpen(false);
                  }}
                  className={`sidebar-btn ${activeTab === tab.key ? 'sidebar-btn--active' : ''}`}
                >
                  <span className="sidebar-btn-label">{tab.label}</span>
                </button>
              ))}
            </React.Fragment>
          ))}

          <div className="sidebar-divider sidebar-divider--strong" />

          <div className="sidebar-actions">
            <button
              onClick={() => {
                if (!devMode) {
                  setPatientModalOpen(true);
                }
                setSidebarOpen(false);
              }}
              className="sidebar-btn sidebar-btn--primary"
            >
              Paciente
            </button>
            {onLogout && (
              <button
                onClick={() => {
                  if (window.confirm('¿Cerrar sesión?')) {
                    onLogout();
                  }
                }}
                className="sidebar-btn sidebar-btn--danger"
              >
                Cerrar sesión
              </button>
            )}
          </div>
        </nav>

        <div className="sidebar-dev-footer">
          <span className="sidebar-dev-kicker">Desarrollado por</span>
          <a href="https://www.instagram.com/jossrva/" target="_blank" rel="noopener noreferrer"><img src={devLogo} alt="Soncultroia" className="sidebar-dev-logo" /></a>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle navigation"
      >
        <span className={`sidebar-toggle-line ${sidebarOpen ? 'active' : ''}`} />
        <span className={`sidebar-toggle-line ${sidebarOpen ? 'active' : ''}`} />
        <span className={`sidebar-toggle-line ${sidebarOpen ? 'active' : ''}`} />
      </button>

      <div className={editorMainClass}>
        <main className="editor-content">
          <ErrorBoundary>
            {renderContent()}
          </ErrorBoundary>
        </main>
      </div>
      {showPatientModal && (
        <PatientModal open={true} onClose={() => { setPatientModalOpen(false); setActiveTab('dashboard'); }} />
      )}
    </>
      ) : (
        <div className={editorMainClass}>
          <main className="editorContent">
            <ErrorBoundary>
              {renderContent()}
            </ErrorBoundary>
          </main>
        </div>
      )}
    </div>
  );
}
