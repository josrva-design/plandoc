# REGLAS DOCFITNESS - Fuente de verdad

> Actualizado: 03 agosto 2026.

## REGLA DE ORO #1 - FLUJO DOCFITNESS

### 1. Fuente real = editor

El nutriólogo llena el editor (`AppContext.jsx` + `useAppData.js`). Esa es la **única** fuente real.

```
Editor (setters) -> AppContext (data) -> VistaPaciente -> usePatientData(data) -> PatientPDF (render)
```

### 2. Dev Mock = solo testeo visual

`src/mocks/mockPacienteCompleto.ts` (Juan Méndez) **no** es fuente real. Es SOLO para testear diseño cuando el editor está vacío, activado con el toggle Dev Mode (`localStorage: docfitness-dev-mode`).

PROHIBIDO:
- Usar mock como fallback en producción
- Importar mock en `PatientPDF.tsx`

### 3. Puente de testeo (solo Vista Paciente)

El puente vive SOLO en `VistaPaciente.jsx`.

```js
const { devMode } = useAppContext()
const patientData = usePatientData(devMode ? mockPacienteCompleto : data)
```

- **ON (dev)**: banner `MODO TESTEO VISUAL`
- **OFF (prod)**: siempre datos reales.

### 4. PatientPDF = entregable paciente

`src/client/PatientPDF.tsx` es el entregable para el paciente (PDF 9:16).

- Recibe `plan` por props (via `usePatientData`)
- Fallbacks vacíos `|| []` permitidos
- No importa mock ni sample data

### 5. Testeo y entrega

- Fase de testeo: sin DB.
- Entrega al paciente: **PDF 9:16** (`PatientPDF.tsx`) y **HTML estático** (`ExportPlan.js`) para WhatsApp.

---

## STACK REAL

- Vite 6.4.3 + React 18 + JSX (Babel/plugin-react en `vite.config.js`)
- Tailwind CSS v4 + lucide-react
- @react-pdf/renderer (generación de PDFs)
- TypeScript: `src/core/types.ts`, `usePatientData.tsx`, `PatientPDF.tsx`
- Sin router: navegación por `activeTab` state en `App.jsx` → `EditorUI.jsx`
- Estado global: `AppContext.jsx` (React Context) expone `data`, `setters`, `devMode`, `toggleDevMode`
- PWA: `vite-plugin-pwa`

## ESTRUCTURA REAL

```
src/
├── App.jsx                    # Entry + AppProvider wrapper
├── main.jsx                   # Entry point
├── pages/VistaPaciente.jsx    # Tab Vista Paciente (PDF preview + download)
├── components/
│   ├── EditorUI.jsx           # Sidebar azul + main content
│   ├── SummarySection.jsx     # Dashboard
│   ├── ProfileSection.jsx, CalendarSection.jsx, RoutineSection.jsx,
│   ├── NutritionSection.jsx, EvolutionSection.jsx, SupplementSection.jsx,
│   ├── DataSection.jsx, PreviewTab.jsx
│   └── [ui components]
├── client/PatientPDF.tsx      # Entregable PDF 9:16 (paciente)
├── context/AppContext.jsx     # React Context (data, setters, devMode, toggleDevMode)
├── core/types.ts              # Interfaces TypeScript
├── data/
│   ├── foodDatabase.js        # Catálogo alimentos
│   └── sampleData.js          # Fixtures iniciales (vacío, SOLO DEV)
├── hooks/
│   ├── useAppData.js          # Estado principal (useState por campo)
│   ├── useNutritionData.js
│   ├── useRoutineData.js
│   ├── useEvolutionData.js
│   └── usePatientData.tsx     # Transforma editor data → PatientPDF shape
├── mocks/mockPacienteCompleto.ts # Juan Méndez, plan completo (SOLO DEV)
├── services/ExportPlan.js     # HTML estático final (WhatsApp)
└── assets/
```

---

## 2 VISTAS

1. **Dashboard nutriólogo**: `EditorUI.jsx` con sidebar azul + tabs que editan `data` via `setters` (AppContext)
2. **Vista paciente**: tab interna del dashboard (`activeTab='vista_paciente'`) con iPhone mockup + `PatientPDF`. Sidebar azul **sí** visible.

## LAYOUT

- `EditorUI.jsx` = sidebar azul (izquierda) + main content (derecha)
- Mobile: sidebar colapsable con overlay + hamburger
- Tab activa renderiza su componente en el área principal

---

## REGLA DE ORO #2 - DISEÑO VISUAL (NO NEGOCIABLE)

`PatientPDF.tsx` es el PRODUCTO. Es lo que ve el paciente y justifica el valor del nutriólogo. El diseño gráfico es más importante que la funcionalidad.

PROHIBIDO:
- Diseño genérico de dashboard / tablas / cards blancas con sombra
- Mucho texto junto sin jerarquía
- Colores de Tailwind por defecto (`blue-500`, etc)
- Parecer app de admin o plantilla

OBLIGATORIO EN PATIENT PDF:
- Look premium, editorial, tipo Apple Health / Whoop / app de lujo
- Mucho espacio en blanco, respiración visual
- Tipografía grande, bold, jerarquía clara
- Secciones resumidas y visuales
- Iconografía minimalista, no emojis
- Colores con intención: fondo claro, acentos en negro / color principal
- Mobile first 100%. PDF 9:16 optimizado para celular

Regla: Si parece hecho por un programador, está mal. Debe parecer hecho por un diseñador gráfico premium.

---

## REGLAS DE IMPLEMENTACIÓN

1. JSX/JS para componentes, TS/TSX solo para `src/core/types.ts`, `usePatientData.tsx`, `PatientPDF.tsx`
2. No tocar `src/core/types.ts` ni `src/mocks/mockPacienteCompleto.ts` sin permiso
3. Cambio visual = tocar SOLO archivo indicado
4. Vista paciente SOLO en sidebar, nunca dentro de `SummarySection.jsx`
5. Tailwind solo, no nuevas librerías
6. `activeTab` keys deben coincidir: sidebar `setActiveTab('vista_paciente')` → `{activeTab === 'vista_paciente' && <VistaPaciente />}`
7. Antes de borrar, verificar que no rompas render de `EditorUI.jsx`
8. RESPETAR FLUJO DOCFITNESS: Editor → VistaPaciente → PatientPDF. Nunca invertir.
9. AGENTS.md es la fuente de arquitectura. REGLAS.md complementa.

## ESTADO ACTUAL

- Dashboard funciona, no tocar
- `VistaPaciente.jsx` existe y se renderiza en `EditorUI.jsx`
- Ruta `/vista-paciente` no existe, es tab interna
- Dev mock (`mockPacienteCompleto.ts`) sirve solo para testeo visual en DEV
- `PatientPDF.tsx` genera PDF 9:16 para entrega al paciente
- `ExportPlan.js` genera HTML estático para WhatsApp
- Build pasa limpio

---

## REGLAS HTML OFFLINE WHATSAPP (`ExportPlan.js`)

El HTML que genera `ExportPlan.js` se abre dentro de WhatsApp como documento offline.  
Solo se permite lo que WhatsApp renderiza sin fallos.

### PERMITIDO

- Interactividad: `<select>`, `<details><summary>`, `<input type="checkbox">`, `<a href="#...">`
- Contenido: `<table>`, `<ul><li>`, texto con formato inline, cards con fondo y border-radius
- Media: 1-2 imágenes en base64 muy comprimidas. Prohibido imágenes externas sin comprimir.
- Separadores: `<hr>`
- Links externos que abren navegador: `<a href="https://...">`, `<a href="tel:...">`, `<a href="https://wa.me/...">`

### PROHIBIDO

- Tabs decorativas sin funcionalidad (reemplazar por `<details><summary>`)
- `<iframe>`
- `<script>` con lógica compleja. Solo JS inline mínimo para interacción básica.
- CSS moderno que falle en WebView de WhatsApp: Grid complejo, Flex avanzado, `backdrop-filter`, `position: sticky`, `@font-face` externo, animaciones CSS
- Imágenes externas no comprimidas. Solo base64 optimizado o SVG inline simple.
- Event listeners complejos. Usar `onchange` nativo de `<select>` si es necesario.

### Regla general

Si un elemento se ve bien en el inspector de WhatsApp Web pero falla en la app, eliminarlo.  
Priorizar `<details><summary>` como reemplazo de tabs y acordeones.
