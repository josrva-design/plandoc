import React, { useCallback } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import Input from './ui/Input.tsx';
import Select from './ui/Select.tsx';
import EditableSelect from './ui/EditableSelect.tsx';

export default function PerfilClinico() {
  const { data, setters } = useAppContext();
  const { person } = data;
  const { setPerson } = setters;
  const d = person || {};

  const update = useCallback((key, val) => {
    if (setPerson) {
      setPerson(prev => {
        const oldValue = prev[key];
        if (oldValue === val) return prev;
        const entry = {
          field: key,
          oldValue: String(oldValue || ''),
          newValue: String(val || ''),
          timestamp: new Date().toISOString(),
        };
        if (setters.setProfileHistory) {
          setters.setProfileHistory((prevHistory) => [...prevHistory, entry]);
        }
        return { ...prev, [key]: val };
      });
    }
  }, [setPerson, setters]);

  return (
    <div className="w-full bg-transparent text-[var(--color-text-primary)] p-4 md:p-6 font-body">
      <h1 className="premium-page-title">PERFIL CLÍNICO</h1>
      <p className="premium-subtitle">Datos del paciente, antecedentes y hábitos</p>

      {/* ==================== DATOS BÁSICOS ==================== */}
      <div className="mt-8 md:mt-10">
        <h2 className="typo-label">Datos básicos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-4">
          <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-2xl p-4">
            <p className="typo-label">Nombre</p>
            <p className="typo-value-md mt-1"><Input value={d.nombre} onChange={e => update('nombre', e.target.value)} placeholder="Nombre completo" /></p>
          </div>
          <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-2xl p-4">
            <p className="typo-label">Sexo</p>
            <p className="typo-value-md mt-1">
              <EditableSelect value={d.sexo} onChange={val => update('sexo', val)} options={['Hombre', 'Mujer', 'Prefiero no decir', 'Otro']} placeholder="Sexo" />
            </p>
          </div>
          <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-2xl p-4">
            <p className="typo-label">F. Nacimiento</p>
            <p className="typo-value-md mt-1"><Input value={d.fechaNacimiento} onChange={e => update('fechaNacimiento', e.target.value)} placeholder="dd/mm/aaaa" type="date" /></p>
          </div>
          <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-2xl p-4">
            <p className="typo-label">País/Región</p>
            <p className="typo-value-md mt-1">
              <EditableSelect value={d.pais} onChange={val => update('pais', val)} options={['México', 'Estados Unidos', 'España', 'Colombia', 'Argentina', 'Chile', 'Perú', 'Ecuador', 'Venezuela']} placeholder="País" />
            </p>
          </div>
          <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-2xl p-4">
            <p className="typo-label">Estado</p>
            <p className="typo-value-md mt-1"><Input value={d.estado} onChange={e => update('estado', e.target.value)} placeholder="Ciudad, Estado" /></p>
          </div>
          <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-2xl p-4">
            <p className="typo-label">Cel/WhatsApp</p>
            <p className="typo-value-md mt-1"><Input value={d.celular} onChange={e => update('celular', e.target.value)} placeholder="55XXXXXXXXX" type="tel" /></p>
          </div>
          <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-2xl p-4">
            <p className="typo-label">Email</p>
            <p className="typo-value-md mt-1"><Input value={d.email} onChange={e => update('email', e.target.value)} placeholder="correo@ejemplo.com" type="email" /></p>
          </div>
          <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-2xl p-4">
            <p className="typo-label">Instagram</p>
            <p className="typo-value-md mt-1"><Input value={d.instagram} onChange={e => update('instagram', e.target.value)} placeholder="@usuario" /></p>
          </div>
        </div>
        <div className="mt-3 flex flex-col sm:flex-row gap-2.5">
          <div className="bg-[var(--color-bg-subtle)] rounded-full px-4 py-2 typo-label uppercase opacity-60 shrink-0">Ocupación</div>
          <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-full px-5 py-2 typo-value-md flex-1">
            <EditableSelect value={d.ocupacion} onChange={val => update('ocupacion', val)} options={['Director', 'Gerente', 'Empleado', 'Estudiante', 'Retirado', 'Independiente']} placeholder="Ocupación" />
          </div>
        </div>
      </div>

      {/* ==================== MÉTRICAS ==================== */}
      <div className="mt-8 md:mt-10">
        <h2 className="typo-label">Métricas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 mt-4">
          {[
            ["(Años) Edad", "edad", "25"],
             ["(Kg) Peso", "pesoIni", "70"],
            ["Estatura", "estatura", "170cm"],
            ["IMC", "imc", "22.3"],
            ["% Grasa", "grasa", "20%"],
            ["% Músculo", "musculo", "20%"],
            ["Cintura", "cintura", "80"],
            ["Cadera", "cadera", "80"],
          ].map(([l,k,r])=>(
            <div key={l} className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-2xl p-4 text-center">
              <p className="typo-label">{l}</p>
              <p className="typo-value-lg mt-1"><Input value={d[k]} onChange={e => update(k, e.target.value)} placeholder={r} /></p>
            </div>
          ))}
        </div>
      </div>

      {/* ==================== HISTORIAL MÉDICO ==================== */}
      <div className="mt-8 md:mt-10">
        <h2 className="typo-label">Historial médico</h2>
        <div className="border border-[var(--color-border)] rounded-2xl overflow-hidden mt-4">
          {[
            ["Antecedentes Patológicos Personales", "app", ['Ninguno', 'Diabetes', 'Hipertensión', 'Asma', 'Cardiopatía', 'Cáncer', 'Enfermedad renal', 'Otro']],
            ["Antecedentes Familiares", "af", ['Ninguno', 'Diabetes', 'Hipertensión', 'Cáncer', 'Cardiopatía', 'Enfermedad mental', 'Otro']],
            ["Medicación Actual", "med", ['Ninguna', 'Antihipertensivos', 'Antidiabéticos', 'Analgésicos', 'Antidepresivos', 'Antihistamínicos', 'Otro']],
            ["Alergias", "alergias", ['Ninguna', 'Alimentos', 'Medicamentos', 'Polen', 'Polvo', 'Animales', 'Latex', 'Otro']],
            ["Cirugías (incluyendo estéticas)", "cirugias", ['Ninguna', 'Apendicectomía', 'Cesárea', 'Ortopedia', 'Laparoscópica', 'Estética', 'Otro']],
            ["Intolerancias", "intolerancias", ['Ninguna', 'Lactosa', 'Gluten', 'Fructosa', 'Sacarosa', 'Histamina', 'Otro']],
            ["Lesiones o Discapacidades Actuales", "lesiones", ['Ninguna', 'Esguince', 'Fractura', 'Tendinitis', 'Hernia discal', 'Artritis', 'Otro']],
            ["Laboratorios Recientes", "labs", ['Ninguno', 'Sangre', 'Orina', 'Heces', 'Imagen (rayos X)', 'Resonancia', 'Otro']],
          ].map(([label,key,opts],i)=>(
            <div key={label} className={`grid grid-cols-1 md:grid-cols-[1fr_1fr_2fr] gap-2 md:gap-4 px-4 py-3 md:py-3.5 ${i%2===0? 'bg-[var(--color-bg-elevated)]' : 'bg-[var(--color-bg-base)]'} border-b last:border-0 border-[var(--color-border)]`}>
              <p className="typo-label">{label}</p>
              <p className="typo-value-md"><Select value={d[key]} onChange={val => update(key, val)} options={opts} placeholder="No especificado" /></p>
              <p className="typo-muted-sm"><Input value={d[key+'Obs']} onChange={e => update(key+'Obs', e.target.value)} placeholder="Observaciones..." /></p>
            </div>
          ))}
        </div>
      </div>

      {/* ==================== HÁBITOS ==================== */}
      <div className="mt-8 md:mt-10">
        <h2 className="typo-label">Hábitos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 mt-4">
          {[
            ["Tabaquismo", "tabaco"],
            ["Alcohol", "alcohol"],
            ["Café", "cafe"],
            ["Bebidas Azucaradas", "azucar"],
            ["Drogas/Med", "drogas"],
            ["Anabólicos / EAAs", "ana"],
            ["Pre-Entreno", "pre"],
            ["Energéticas", "energ"],
          ].map(([l,k])=>(
            <div key={l} className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-2xl p-4 text-center">
              <p className="typo-label">{l}</p>
              <p className="typo-value-md mt-1"><EditableSelect value={d[k]} onChange={val => update(k, val)} options={['NO', 'DIARIO', 'SEMANAL', 'OCASIONAL']} placeholder="NO" /></p>
            </div>
          ))}
        </div>
      </div>

      {/* ==================== PREFERENCIAS NUTRICIONALES ==================== */}
      <div className="mt-8 md:mt-10">
        <h2 className="typo-label">Preferencias nutricionales</h2>
        <div className="border border-[var(--color-border)] rounded-2xl overflow-hidden mt-4">
          {[
            ["Plan previo nutrición/entreno", "planPrevio", "¿Tuvo plan previo?", ['SÍ', 'NO', 'VARIABLE'], "Describe tu experiencia..."],
            ["Resultados obtenidos", "resultadosPrevios", "Resultados", ['Excelentes', 'Buenos', 'Regulares', 'Malos', 'Sin resultados'], "Describe los resultados..."],
            ["Qué no te gustó", "queNoTeGusta", "Motivo", ['Sabor', 'Precio', 'Tiempo', 'Complejidad', 'Otro'], "Describe qué no te gustó..."],
            ["Tipo de plan preferido", "tipoPlan", "Tipo de plan", ['Omnívoro', 'Vegetariano', 'Vegano', 'Paleo', 'Keto', 'Mediterráneo', 'Otro'], "Describe tu preferencia..."],
            ["Característica más importante", "caracteristica", "Característica", ['Sabor', 'Precio', 'Salud', 'Conveniencia', 'Otro'], "Describe la característica..."],
            ["Interés en suplementos", "interesSup", "¿Interés?", ['SÍ', 'NO'], "Describe tu interés..."],
            ["Suplementación actual", "supActual", "Suplementación", ['SÍ', 'NO', 'VARIABLE'], "Describe tu suplementación..."],
          ].map(([l,k,v,opts,obsPh],i)=>(
            <div key={l} className={`grid grid-cols-1 md:grid-cols-[1fr_1fr_2fr] gap-2 md:gap-4 px-4 py-3 md:py-3.5 ${i%2===0? 'bg-[var(--color-bg-elevated)]' : 'bg-[var(--color-bg-base)]'} border-b last:border-0 border-[var(--color-border)]`}>
              <p className="typo-label uppercase">{l}</p>
              <p className="typo-value-md"><Select value={d[k]} onChange={val => update(k, val)} options={opts} placeholder={v} /></p>
              <p className="typo-muted-sm"><Input value={d[k+'Obs']} onChange={e => update(k+'Obs', e.target.value)} placeholder={obsPh} /></p>
            </div>
          ))}
        </div>
      </div>

      {/* ==================== ACTIVIDAD FÍSICA ==================== */}
      <div className="mt-8 md:mt-10">
        <h2 className="typo-label">Actividad física</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 mt-4">
          {[
            ["Despertar", "despertar", "9:00 AM"],
            ["Dormir", "dormir", "9:00 AM"],
            ["Actividad 1", "act1", "Correr", true],
            ["Actividad 2", "act2", "Gimnasio", true],
            ["Horario", "horario", "13:00"],
            ["Sesiones", "sesiones", "3"],
            ["Duración", "duracion", "60 min"],
            ["Pasos", "pasos", "8000"],
          ].map(([l,k,r,isAct])=>(
            <div key={l} className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-2xl p-4 text-center">
              <p className="typo-label">{l}</p>
              <p className="typo-value-md mt-1">
                {isAct ? (
                  <EditableSelect value={d[k]} onChange={val => update(k, val)} options={['Correr', 'Caminar', 'Ciclismo', 'Natación', 'Gimnasio', 'Yoga', 'Crossfit']} placeholder={r||"Tipo"} />
                ) : (
                  <Input value={d[k]} onChange={e => update(k, e.target.value)} placeholder={r} type={l==='Despertar' || l==='Dormir' || l==='Horario' ? 'time' : 'text'} />
                )}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-3 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-full px-4 py-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <span className="typo-label uppercase shrink-0">Nivel</span>
          <Select value={d.nivel} onChange={val => update('nivel', val)} options={['Sedentario - poco o ningún ejercicio', 'Ligero - ejercicio 1-3 días/semana', 'Moderado - ejercicio 3-5 días/semana', 'Activo - ejercicio 6-7 días/semana', 'Muy activo - trabajo físico + ejercicio diario']} placeholder="Selecciona tu nivel" />
        </div>
      </div>

      {/* ==================== OBJETIVO ==================== */}
      <div className="mt-8 md:mt-10">
        <h2 className="typo-label">Objetivo</h2>
        <p className="typo-muted-sm mb-4">Definí el objetivo principal y el específico del paciente.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-4">
          <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-2xl p-4">
            <p className="typo-label">Objetivo principal</p>
            <p className="typo-value-md mt-1">
              <Select value={d.objetivo} onChange={val => update('objetivo', val)} options={['Mejorar mi salud', 'Prevención enfermedades', 'Salud mental', 'Estilo vida', 'Longevidad/Antiedad', 'Estética corporal', 'Incremento de fuerza', 'Alto Rendimiento', 'Competitivo']} placeholder="Selecciona objetivo" />
            </p>
          </div>
          <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-2xl p-4 sm:col-span-2">
            <p className="typo-label">Objetivo específico</p>
            <p className="typo-value-md mt-1">
              <Input value={d.objetivoEspecifico || ''} onChange={e => update('objetivoEspecifico', e.target.value)} placeholder="Ej: Bajar 5kg en 3 meses, ganar masa muscular, mantener..." />
            </p>
          </div>
        </div>
      </div>

      {/* ==================== RECURSOS ==================== */}
      <div className="mt-8 md:mt-10">
        <h2 className="typo-label">Recursos</h2>
        <p className="typo-muted-sm mb-4">Información clave para adaptar el plan a la realidad del paciente.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-4">
          <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-2xl p-4">
            <p className="typo-label">Presupuesto alimenticio</p>
            <p className="typo-value-md mt-1">
              <Select value={d.presupuesto} onChange={val => update('presupuesto', val)} options={['Bajo (~$200-400/semana)', 'Medio (~$500-800/semana)', 'Alto (~$900-1500/semana)', 'Sin límite']} placeholder="Selecciona rango" />
            </p>
          </div>
          <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-2xl p-4">
            <p className="typo-label">Equipo disponible</p>
            <p className="typo-value-md mt-1">
              <Select value={d.equipo} onChange={val => update('equipo', val)} options={['Gimnasio completo', 'Casa (bandas/mancuernas)', 'Parque', 'Ninguno', 'Mixto']} placeholder="Selecciona equipo" />
            </p>
          </div>
          <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-2xl p-4">
            <p className="typo-label">Calidad de sueño</p>
            <p className="typo-value-md mt-1">
              <Select value={d.calidadSueño} onChange={val => update('calidadSueño', val)} options={['7-8h sin interrupciones', '7-8h con interrupciones', '5-6h fragmented', '<5h', 'Variable']} placeholder="Selecciona" />
            </p>
          </div>
        </div>
      </div>

      {data?.profileHistory?.length > 0 && (
        <div className="mt-8 md:mt-10">
          <h2 className="typo-label">Historial de cambios</h2>
          <p className="typo-muted-sm mb-4">Registro automático de modificaciones en el perfil.</p>
          <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
            <div className="max-h-60 overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--color-bg-subtle)]">
                  <tr>
                    <th className="px-4 py-2 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Campo</th>
                    <th className="px-4 py-2 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Anterior</th>
                    <th className="px-4 py-2 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Nuevo</th>
                    <th className="px-4 py-2 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {[...data.profileHistory].reverse().slice(0, 20).map((entry, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 font-medium text-[var(--color-text-primary)]">{entry.field}</td>
                      <td className="px-4 py-2 text-[var(--color-text-secondary)]">{entry.oldValue}</td>
                      <td className="px-4 py-2 text-[var(--color-text-primary)]">{entry.newValue}</td>
                      <td className="px-4 py-2 text-[var(--color-text-secondary)]">
                        {new Date(entry.timestamp).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}