# Design System - DocFitness Plan Nutricional

## Arquitectura de capas

```
src/
├── data/
│   └── foodDatabase.js          # Datos de alimentos (solo datos)
├── hooks/
│   ├── useAlimento.js            # Lógica reutilizable de alimentos
│   ├── useAppData.ts             # Estado global de la app + setters
│   ├── useNutritionData.ts       # Lógica de nutrición (comidas, menús, alimentos)
│   ├── useEvolutionData.ts       # Lógica de evolución/consultas
│   ├── useSupplementData.ts      # Lógica de suplementos
│   ├── useRoutineData.ts         # Lógica de rutinas/días de entrenamiento
│   └── useWarmupData.ts          # Lógica de calentamiento (upper/lower/general)
├── components/
│   ├── ui/                       # Componentes base reutilizables
│   │   ├── IconX.jsx
│   │   └── index.js
│   ├── NutritionSection.jsx      # Componente de página
│   ├── RoutineSection.jsx        # Componente de página
│   ├── WarmupSection.jsx         # Componente de página
│   ├── EditableTable.jsx         # Tabla genérica estandarizada
│   ├── ExportSection.tsx         # Gestión de exportación/importación JSON + HTML WhatsApp
│   └── ...
├── styles/
│   ├── typography.css            # Tipografía, PDF, escala tipográfica paciente
│   ├── components.css            # Premium Design System (tablas, cards, botones, badges)
│   └── editor.css                # Layout del editor, sidebar, glossary, responsive editor
└── index.css                     # Entry point: importa tokens, tailwind + styles/
```

## API estandarizada de `EditableTable`

```tsx
<EditableTable
  columns={columns}
  rows={rows}
  getRowId={(row) => row.id ?? uid}
  groupBy={groupKey}                       // opcional
  groupConfig={groupConfig}                // opcional
  activeGroup={activeGroup}                // opcional
  onGroupChange={(groupKey) => {}}         // opcional
  onAddRow={() => {}}                      // opcional
  onUpdateRow={(uid, field, value) => {}}
  onRemoveRow={(uid) => {}}
  onReorder={(fromUid, toUid) => {}}       // opcional
  emptyText="Sin datos"
  addButtonLabel="+ Agregar"               // opcional
  showGroupPills={false}                   // opcional
  dragBetweenGroups={false}
  groupAddRow={{ [groupId]: () => {} }}    // opcional
  groupRemoveRow={{ [groupId]: () => {} }} // opcional
  onGroupLabelChange={(groupId, label) => {}} // opcional
/>
```

### Uso actual por componente

| Componente | groupBy | groupConfig | groupAddRow | groupRemoveRow | addButtonLabel | activeGroup | onReorder |
|---|---|---|---|---|---|---|---|
| Nutrition | sí | sí | sí | sí | no | no | no |
| Warmup | sí | sí | no | no | sí | sí | sí |
| Routine | no | no | no | no | sí | no | sí |

## Patrones replicables consolidados

### 1. Tabla plana con badges por dominio
- **Nutrición**: badge de grupo macronutriente (`PROT`, `CARB`, `GRASA`, `LÁCTEO`) en columna ALIMENTO
- **Calentamiento**: badge de fase (`GENERAL`, `MOVILIDAD`, `ESPECÍFICO`) en columna FASE
- Ambos usan el mismo estilo: `border-radius: 999px`, `font-size: 9px`, `font-weight: 700`

### 2. Columnas con placeholders de referencia
- **Nutrición**: `"100"` (gramos), `"1"` (cantidad), `"Alimento"`, `"0"` (macros)
- **Rutinas**: `"E1"` (clave), `"Ejercicio"`, `"4"` (sets), `"8-10"` (reps), `"0"` (peso), `"90s"` (descanso), `"Notas"`
- **Calentamiento**: `"1"` (sets), `"30"` (descanso), `"Notas"`, `"Elige un movimiento"` (ejercicio)

### 3. Cálculo de totales en headers por sección
- **Nutrición**: `getMealTotalKcal()` suma kcal por comida
- **Rutinas**: `getDayTotalVolume()` calcula `sets × reps × peso` por día
- **Calentamiento**: totales por fase (`totalExercises`, `totalSets`) mostrados en el header

### 4. Estados de fila por bloque
- Clases CSS: `premium-table-row--first`, `premium-table-row--last`
- **Nutrición**: primer/último alimento por menú
- **Calentamiento**: primer/último ejercicio por bloque de serie dentro de la tabla plana

### 5. Detección automática de equivalencias
- Campo `grupo` en `foodDatabase.js`
- Función `detectarEquivalencias(menu)` en `useAlimento.js`
- Badge visual `EQUIV` en headers de menú con tooltip

### 6. Botón eliminar unificado
- Componente `ui/IconX.jsx` con SVG
- Clase `.premium-btn-delete` en `index.css`
- Usado en: filas de tabla, headers de grupo/menú

### 7. Botones de acción unificados
- Clases CSS en `index.css`: `.menu-group-add-btn--primary`, `--ghost`, `--danger`
- Uso:
  - `--primary`: botones de agregar fila/alimento/menú
  - `--ghost`: botones secundarios de agregar
  - `--danger`: botones de eliminar (X)
- Regla: todos los botones de agregar deben usar `menu-group-add-btn--primary`
- Ejemplos:
  - Nutrición: `+ Alimento`, `+ Menú`
  - Calentamiento: `+ agregar ejercicio`
  - Rutinas: `+ Agregar ${label}`

### 7. API estandarizada de `EditableTable`
- Props comunes: `columns`, `rows`, `getRowId`, `onUpdateRow`, `onRemoveRow`, `emptyText`
- Props opcionales por dominio: `groupBy`, `groupConfig`, `groupAddRow`, `groupRemoveRow`, `onReorder`, `addButtonLabel`

## Reglas para no romper la app

1. **Agregar alimentos** → modificar solo `src/data/foodDatabase.js`
2. **Cambiar estilos** → modificar el archivo correspondiente en `src/styles/` (no `index.css`)
3. **Cambiar cálculo de macros** → modificar solo `src/hooks/useAlimento.js`
4. **Agregar columnas** → agregar objetos en el array `columns` dentro del componente de página
5. **Cambiar diseño de botones/tokens** → modificar solo las clases CSS en `src/styles/components.css`
6. **Agregar nuevas secciones** → crear nuevo componente en `src/components/`, no modificar los existentes

## Flujo de exportación actual

- **Formato activo**: HTML offline mobile-ready para WhatsApp
- **Generado por**: `src/services/ExportPlan.ts` → `generateDashboardFitnessHTML()`
- **Acción**: `ExportSection.tsx` → botones "Vista previa" y "Generar archivo para WhatsApp"
- **Legacy (eliminado)**: `src/client/PatientPDF.tsx`, `src/client/PatientPDF.styles.ts` e interfaz `WarmupPhasePDF` fueron eliminados en la limpieza de 2026-08-10. Backups en `.backups/legacy/`.

## Checklist antes de modificar

- [ ] ¿El cambio es solo visual? → modificar el archivo en `src/styles/`
- [ ] ¿El cambio es lógica de negocio? → modificar el hook correspondiente
- [ ] ¿El cambio es estructura de datos? → modificar el archivo en `data/`
- [ ] ¿El cambio es específico de una sección? → modificar solo ese componente
- [ ] ¿El cambio es reutilizable? → crear nuevo componente en `ui/` o hook en `hooks/`

## Backups automáticos

Antes de cambios mayores, ejecutar:
```bash
cp src/components/NutritionSection.jsx src/components/NutritionSection.jsx.bak.$(date +%Y%m%d)
cp src/components/EditableTable.jsx src/components/EditableTable.jsx.bak.$(date +%Y%m%d)
cp src/index.css src/index.css.bak.$(date +%Y%m%d)
```

## Backups existentes

- `src/components/NutritionSection.jsx.bak.unified`
- `src/components/NutritionSection.jsx.bak.hook`
- `src/components/NutritionSection.jsx.bak.equivalencias`
- `src/components/EditableTable.jsx.bak.unified`
- `src/components/EditableTable.jsx.bak.hook`
- `src/components/RoutineSection.jsx.bak.routine`
- `src/components/WarmupSection.jsx.bak.warmup`
- `src/components/WarmupSection.jsx.bak.blocks`
- `src/data/foodDatabase.js.bak.equivalencias`
- `src/hooks/useAlimento.js.bak.equivalencias`
- `src/index.css.bak.unified`
- `src/index.css.bak.hook`

## Estado actual de secciones

### Completado
- [x] Design System base (`index.css`)
- [x] Documentación de arquitectura
- [x] Componentes base (`ui/IconX.jsx`)
- [x] Hook de lógica nutricional (`hooks/useAlimento.js`) con:
  - Cálculo de macros y recálculo por gramos/cantidad
  - Detección de equivalencias por grupo
  - Helpers de color y etiqueta por macronutriente
  - Función `detectarEquivalencias(menu)` para badge visual
- [x] API estandarizada de `EditableTable`
- [x] Limpieza de archivos sin uso
- [x] Botones de eliminar unificados con SVG
- [x] Títulos unificados: Tratamiento Nutricional / Tratamiento Deportivo
- [x] Navegación responsive
- [x] Equivalencias visuales en tabla nutrición (badge EQUIV + tooltip)
- [x] Nombres de menú editables
- [x] Placeholders en tablas de nutrición y rutinas
- [x] Cálculo de volumen total en rutinas
- [x] Placeholders en calentamiento (sets, descanso, notas)
- [x] Tabla plana en calentamiento con badges de fase
- [x] Bloques de serie como indicadores visuales en calentamiento
- [x] Opciones numeradas en calentamiento (1/2/3)
- [x] Estados first/last por bloque en calentamiento

### Pendiente / Ajustes generales
- [ ] Revisar estilos generales de todas las secciones para unificar con `premium-table-input`
- [ ] Ajustar headers de sección y espaciados globales
- [ ] Verificar contraste y legibilidad en mobile
- [ ] Unificar estados vacíos y mensajes sin datos
- [ ] Asegurar que todos los botones usen clases del design system

### Hojas/secciones faltantes
- [ ] Calendario / Calendario + Calentamiento: revisar layout en mobile
- [ ] Resumen: validar que todos los indicadores usen tokens de color
- [ ] Perfil: unificar inputs con `premium-table-input`
- [ ] Exportar: validar estilos de botones y cards
- [ ] FAQ: agregar contenido faltante y estilos consistentes
- [ ] Placeholder en columna REPS de calentamiento
- [ ] Tooltip unificado para badges de fase/bloque
- [ ] Hook reutilizable para rutinas (`useRutina`) y calentamiento (`useWarmup`)
- [x] Replicar tabla plana con badges en `RoutineSection`

## Reglas para no romper la app

1. **Agregar alimentos** → modificar solo `src/data/foodDatabase.js`
2. **Cambiar estilos** → modificar el archivo correspondiente en `src/styles/` (no `index.css`)
3. **Cambiar cálculo de macros** → modificar solo `src/hooks/useAlimento.js`
4. **Agregar columnas** → agregar objetos en el array `columns` dentro del componente de página
5. **Cambiar diseño de botones/tokens** → modificar solo las clases CSS en `src/styles/components.css`
6. **Agregar nuevas secciones** → crear nuevo componente en `src/components/`, no modificar los existentes

## Flujo de exportación actual

- **Formato activo**: HTML offline mobile-ready para WhatsApp
- **Generado por**: `src/services/ExportPlan.ts` → `generateDashboardFitnessHTML()`
- **Acción**: `ExportSection.tsx` → botones "Vista previa" y "Generar archivo para WhatsApp"
- **Legacy (eliminado)**: `src/client/PatientPDF.tsx`, `src/client/PatientPDF.styles.ts` e interfaz `WarmupPhasePDF` fueron eliminados en la limpieza de 2026-08-10. Backups en `.backups/legacy/`.

## Checklist antes de modificar

- [ ] ¿El cambio es solo visual? → modificar el archivo en `src/styles/`
- [ ] ¿El cambio es lógica de negocio? → modificar el hook correspondiente
- [ ] ¿El cambio es estructura de datos? → modificar el archivo en `data/`
- [ ] ¿El cambio es específico de una sección? → modificar solo ese componente
- [ ] ¿El cambio es reutilizable? → crear nuevo componente en `ui/` o hook en `hooks/`

## Backups automáticos

Antes de cambios mayores, ejecutar:
```bash
cp src/components/NutritionSection.jsx src/components/NutritionSection.jsx.bak.$(date +%Y%m%d)
cp src/components/EditableTable.jsx src/components/EditableTable.jsx.bak.$(date +%Y%m%d)
cp src/index.css src/index.css.bak.$(date +%Y%m%d)
```
