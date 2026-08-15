import { useState, useEffect, useRef, useCallback } from 'react';
import usePatientData from '../hooks/usePatientData.tsx';
import { useAppContext } from '../context/AppContext.tsx';
import { generateDashboardFitnessHTML } from '../services/ExportPlan.ts';

export default function VistaPaciente() {
  const { data, devMode } = useAppContext();
  const patientData = usePatientData(data);
  const iframeRef = useRef(null);
  const [iframeHeight, setIframeHeight] = useState('100%');
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const html = generateDashboardFitnessHTML(patientData);

  const adjustIframeHeight = useCallback(() => {
    if (iframeRef.current) {
      try {
        const doc = iframeRef.current.contentDocument;
        if (doc) {
          const height = Math.max(doc.documentElement.scrollHeight, doc.body.scrollHeight);
          setIframeHeight(height + 'px');
        }
      } catch (e) {
        setIframeHeight('auto');
      }
    }
  }, []);

  const handleIframeLoad = () => {
    adjustIframeHeight();
    setIframeLoaded(true);
  };

  useEffect(() => {
    if (!iframeLoaded || !iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;

    let ro = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => adjustIframeHeight());
      if (doc.documentElement) ro.observe(doc.documentElement);
      if (doc.body) ro.observe(doc.body);
    }

    const handleDocClick = () => {
      setTimeout(adjustIframeHeight, 50);
      setTimeout(adjustIframeHeight, 300);
    };
    doc.addEventListener('click', handleDocClick);

    return () => {
      if (ro) ro.disconnect();
      if (doc) doc.removeEventListener('click', handleDocClick);
    };
  }, [iframeLoaded, adjustIframeHeight]);

  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data && e.data.type === 'RESIZE_IFRAME') {
        setIframeHeight(e.data.height + 'px');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="w-full min-h-screen bg-transparent flex flex-col items-center">
      {devMode && (
        <div className="w-full max-w-[430px] px-6 mb-4">
          <div className="bg-amber-100 border border-amber-300 text-amber-800 text-[11px] font-bold px-4 py-2 rounded-full text-center">
            MODO TESTEO VISUAL — Datos de ejemplo
          </div>
        </div>
      )}

      {/* PHONE FRAME - NO TOCAR MEDIDAS EXTERNAS */}
      <div className="relative w-[390px] h-[852px] bg-black rounded-[60px] p-[12px] shadow-[0_40px_100px_rgba(13,38,64,0.25),0_0_0_1px_rgba(0,0,0,0.8)]">
        <div className="absolute -left-[3px] top-[110px] w-[4px] h-[28px] bg-[#2a2a2a] rounded-l-[4px]" />
        <div className="absolute -left-[3px] top-[150px] w-[4px] h-[58px] bg-[#2a2a2a] rounded-l-[4px]" />
        <div className="absolute -left-[3px] top-[216px] w-[4px] h-[58px] bg-[#2a2a2a] rounded-l-[4px]" />
        <div className="absolute -right-[3px] top-[170px] w-[4px] h-[88px] bg-[#2a2a2a] rounded-r-[4px]" />

        <div className="w-full h-full bg-white rounded-[48px] overflow-hidden relative flex flex-col">
          {/* NOTCH - flotante, sin barra negra */}
          <div className="absolute top-0 left-0 right-0 h-[44px] flex justify-center z-50 pointer-events-none bg-white rounded-t-[48px]">
            <div className="w-[100px] h-[28px] bg-black rounded-full mt-[10px] flex items-center justify-end pr-3">
              <div className="w-3 h-3 rounded-full bg-[#1a1a3a] ring-1 ring-white/10" />
            </div>
          </div>

           {/* CONTENIDO SCROLLEABLE */}
           <div className="flex-1 w-full bg-[var(--color-bg-elevated)] overflow-y-auto overflow-x-hidden" style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
             {/* Spacer para que el contenido NO quede debajo del notch */}
             <div className="h-[52px] shrink-0 bg-[var(--color-bg-elevated)]" />

            <div className="w-full flex justify-center">
              <iframe
                ref={iframeRef}
                srcDoc={html}
                title="Vista HTML"
                scrolling="no"
                onLoad={handleIframeLoad}
                style={{
                  width: '100%',
                  maxWidth: '366px',
                  height: iframeHeight,
                  border: 'none',
                  display: 'block',
                  background: '#F6F6F6',
                  overflow: 'hidden'
                }}
              />
            </div>

            {/* Espacio final para que no choque con el home indicator */}
            <div className="h-[34px] shrink-0 bg-[#F6F6F6]" />
          </div>

          {/* HOME INDICATOR */}
          <div className="absolute bottom-0 left-0 right-0 h-[34px] flex justify-center items-center shrink-0 bg-white/80 backdrop-blur-sm z-20 pointer-events-none rounded-b-[48px]">
            <div className="w-[134px] h-[5px] bg-black rounded-full" />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-[10px] opacity-30 text-center max-w-[300px]">
          Vista previa HTML — Diseño app-like offline para WhatsApp
        </p>
      </div>

      <p className="text-[10px] mt-4 opacity-30 text-center max-w-[300px]">
        Formato principal: HTML offline para WhatsApp.
      </p>
    </div>
  );
}