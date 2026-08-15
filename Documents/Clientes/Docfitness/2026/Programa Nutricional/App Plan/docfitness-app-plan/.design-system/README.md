# Design System - DocFitness

## Flujo de trabajo

1. Todo cambio visual pasa primero por este sistema.
2. Si falta un token, agregarlo en `tokens.md` y en `docfitness-tokens.css`.
3. Si falta un patrón, agregarlo en `patterns.md`.
4. Si se necesita una nueva jerarquía de color, documentarla en `color-guide.md`.
5. Implementar usando solo tokens y patrones documentados.
6. Correr `npm run build` y verificar.

## Reglas de oro

- **Prohibido usar colores hex duros en componentes.** Usar variables CSS (`var(--blue)`, `var(--deep)`, etc.).
- **No duplicar estilos.** Reusar clases de `src/index.css` o `docfitness-tokens.css` antes de escribir estilos inline.
- **Todo es una misma app.** Calendario, Warmup, Rutinas, Nutrición, Perfil y Resumen comparten tokens, espaciados y tipografía.
- **Si agregás un diseño nuevo, actualizá este sistema primero.**
- **Arquitectura de roles.** La app es para uso exclusivo del nutriólogo. El paciente solo recibe un exportable en HTML para WhatsApp. Nunca implementar vistas o lógica de edición para el paciente dentro de la app.
- **Flujo de exportación activo**: HTML offline mobile-ready generado por `src/services/ExportPlan.ts`. No usar PDF.

## Checklist pre-merge

- [ ] No hay colores hex en el componente.
- [ ] Usa `var(--token)` para colores, bordes, radios.
- [ ] Usa clases de `src/index.css` o `docfitness-tokens.css`.
- [ ] Si se crearon tokens nuevos, están documentados en `tokens.md`.
- [ ] Si se creó un patrón nuevo, está documentado en `patterns.md`.
- [ ] `npm run build` pasa sin errores.

## Dónde viven las reglas

| Archivo | Rol |
|---|---|
| `docfitness-tokens.css` | Variables globales del design system (`:root`). |
| `src/index.css` | Entry point: importa tailwindcss, docfitness-tokens.css y src/styles/. |
| `src/styles/typography.css` | Tipografía paciente, PDF, escala tipográfica Escala A. |
| `src/styles/components.css` | Premium Design System: tablas, cards, botones, badges, inputs premium, clases legacy activas migradas. |
| `src/styles/editor.css` | Layout del editor, sidebar, glossary, responsive del editor. |
| `tokens.md` | Catálogo de tokens aprobados y su uso principal. |
| `patterns.md` | Composición de tablas, forms, botones, iconos. |
| `color-guide.md` | Jerarquías de color y reglas de uso de los tokens de diseño. |
| `README.md` | Flujo de trabajo, reglas de oro y checklist. |

## Limpieza realizada (2026-08-10)

- **Eliminado `src/styles/base.css`**: archivo huérfano que duplicaba `src/index.css`. No tenía importaciones entrantes.
- **Limpieza de `docfitness-tokens.css`**: eliminadas 54 clases no usadas (código muerto auditado con grep en `src/components/`, `src/pages/` y `src/styles/`). El archivo pasó de 749 a 367 líneas.
- **Actualizado `DESIGN_SYSTEM.md`**: refleja la nueva arquitectura con `src/styles/` y corrige rutas de modificación de estilos.
- **Migración de clases semánticas**: movidas 10 reglas CSS desde `docfitness-tokens.css` a `src/styles/components.css` (`.btn-delete`, `.divider`, `.label`, `.label-white`, `.metric-card` + variantes, `.pill`, `.table-wrapper`, `.table-row`, `.table-cell`). Ahora `components.css` es la fuente de verdad de componentes, `docfitness-tokens.css` solo mantiene variables `:root` y utilidades.
- **Creado `src/hooks/useWarmupData.ts`**: lógica de calentamiento extraída de `TrainingEditor.tsx` a hook dedicado. `TrainingEditor.tsx` ahora usa `useWarmupData` en lugar de la lógica inline.
- **Renombrado `src/components/DataSection.tsx` → `src/components/ExportSection.tsx`**: el componente ahora se llama `ExportSection`, reflejando su función principal de gestión de exportación/importación de planes y generación de HTML para WhatsApp.
- **Marcado código PDF como legacy**: `src/client/PatientPDF.tsx`, `src/client/PatientPDF.styles.ts` y la interfaz `WarmupPhasePDF` en `src/core/types.ts` estaban marcados como legacy. El flujo activo es HTML para WhatsApp (`src/services/ExportPlan.ts`).
- **Eliminado código PDF legacy**: removidos `src/client/PatientPDF.tsx`, `src/client/PatientPDF.styles.ts` e interfaz `WarmupPhasePDF` de `src/core/types.ts`. Backups en `.backups/legacy/`.
- **Agregadas validaciones en `useAppData.ts`**: saneamiento automático de valores negativos en `stats` (campos numéricos), `nutrition` (`kcal`, `prot`, `carbs`, `grasas`), `training` (`dias`, `cardio`, `pasos`) y `routines` (`sets`, `semana2/3/4`, `peso`). Previene datos corruptos en el exportado sin bloquear el flujo de edición.
