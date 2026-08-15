# AGENTS.md — DocFitness App Plan

## Architecture Overview

### Arquitectura de la App

```
┌──────────────────────────────────────────────────────────┐
│  sampleData.js  ←  initial* constants for editor state    │
│  mockPacienteCompleto.ts ← full dev patient (fallback)   │
│  exerciseList / mealTimes / foodDatabase.js ← reference  │
└──────────┬───────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────┐
│  useAppData.js (React hook)                               │
│  • useState para cada campo (person, warmupUpper, etc)    │
│  • computeState(initialData) — helper para clonar         │
│  • resetState(newData) — reinicia todo el estado          │
└──────────┬───────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────┐
│  AppContext.jsx (React Context)                            │
│  • devMode (localStorage: docfitness-dev-mode)            │
│  • toggleDevMode() — resetState(mockOrEmpty)              │
│  • isDev (import.meta.env.DEV)                            │
│  • Expondrá: data, setters, devMode, toggleDevMode        │
└──────────┬───────────────────────────────────────────────┘
           │
     ┌─────┴───────────────────────────────────┐
     ▼                                         ▼
┌──────────┐                        ┌──────────────────┐
│ Editor   │                        │ VistaPaciente     │
│ tabs     │                        │ tab               │
│ - Warmup │                        │ - reads data from │
│ - Routine│                        │   useAppContext() │
│ - Nutrition│                       │ - usePatientData  │
│ - etc   │                        │   transforms data │
│          │                        │ - ExportPlan.js   │
│          │                        │   generates HTML  │
│          │                        │   offline (9:16)  │
│          │                        │ - PatientPDF.tsx  │
│          │                        │   renders PDF     │
│          │                        │ - Botón:          │
│          │                        │   Descargar PDF   │
└──────────┘                        └───────────────────┘
```

### Toggle Dev Mode

**ON (dev)**: App starts with `mockPacienteCompleto` → editor shows complete plan → changes reflect live in VistaPaciente → persiste en `localStorage`

**OFF**: App starts con constants vacías de `sampleData.js` → nutriólogo llena datos reales → VistaPaciente refleja cambios → persiste en `localStorage`

El toggle SOLO controla el estado inicial y permite resetear. La sincronización editor↔paciente es siempre en vivo a través de React Context.

### Data Flow

1. `sampleData.js` / `mockPacienteCompleto.ts` → `useAppData.js` → `AppContext.jsx` → Editor components
2. **Regla general**: Editor → Dashboard → HTML
   - `evolution` (tabla Evolución) → `useEffect` en `useAppData.ts` → `stats`
   - `stats` → `MacroBars.tsx` (dashboard)
   - `stats` → `usePatientData.tsx` → `ExportPlan.ts` (HTML)
3. **Excepciones** (Dashboard → HTML, NO vienen del editor):
   - `feedback` (Retroalimentación)
   - `diagnosis` (Diagnóstico)
   - `objectives` (Objetivos y plan a seguir)
   - Estos campos se editan directamente en el dashboard (`SummarySection.tsx`) y fluyen solo al HTML.
4. `VistaPaciente.jsx` reads same `data` → `usePatientData.tsx` → `ExportPlan.js` → HTML offline for WhatsApp
5. `VistaPaciente.jsx` also renders `PatientPDF.tsx` for PDF export
6. Changes in editor reflect IMMEDIATELY in patient view (shared React state)

### Sincronización Evolution → Stats

- `useAppData.ts` expone un `useEffect` que escucha cambios en `evolution`.
- Cuando se modifica la tabla de adherencia en Evolución, el efecto toma la última consulta activa y copia automáticamente a `stats`:
  - `adherencia`
  - `nutricion`
  - `entreno`
  - `cardio`
  - `descanso`
- Esto garantiza que el dashboard y el HTML sean un resumen automático del editor.

### Offline HTML Export

`ExportPlan.js` generates a standalone 9:16 HTML document optimized for WhatsApp offline viewing:
- Reads transformed `ClientPlan` from `usePatientData.tsx`
- Uses only basic HTML/CSS (no external JS dependencies)
- Includes: Hero, Avances, Calentamiento, Tratamiento deportivo, Nutrición, Suplementación, Guía, Footer
- Meals and supplements are global per plan; only training is split by day
