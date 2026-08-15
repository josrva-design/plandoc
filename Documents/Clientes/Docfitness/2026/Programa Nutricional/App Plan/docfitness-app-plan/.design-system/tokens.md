# Tokens - DocFitness Design System

## Colores

| Token | Valor | Uso principal |
|---|---|---|
| `--blue` | `#0066CC` | Primario, botones, iconos video, selects activos |
| `--deep` | `#0D2640` | Títulos, cabeceras, texto principal |
| `--green` | `#2E9E70` | Checkmarks, estados positivos |
| `--gray` | `#E8E8E8` | Fondos, bordes, divisores |
| `--light` | `#F8F9FA` | Fondos sutiles, campos |
| `--white` | `#FFFFFF` | Fondo general, textos sobre color |
| `--hover` | `#FAFBFD` | Hover de tablas/cards |
| `--red` | `#EF4444` | Eliminar, errores |
| `--amber` | `#F59E0B` | Triserie, bloque ESPECÍFICO |
| `--purple` | `#8B5CF6` | Superserie |
| `--gray-medium` | `#6b7280` | Normal, textos secundarios |

## Tipografía

| Token | Valor | Uso |
|---|---|---|
| `--font-title` | `'Inter Tight', sans-serif` | Títulos, pills, etiquetas |
| `--font-body` | `'Inter', sans-serif` | Cuerpo, inputs, tablas |

### Clases de tipografía

| Clase | Uso |
|---|---|
| `.h1` | Título principal de hoja (Inter Tight, 42px, peso 800) |
| `.sub` | Subtítulo de hoja (12px, tracking 2px, uppercase, opacidad reducida) |
| `.typo-section` | Títulos de sección en hoja de resumen (12px, peso 800, tracking 0.05em, uppercase) |
| `.typo-label` | Etiquetas de tarjeta / títulos de fila / títulos de sección en hoja de perfil (10px, peso 700, tracking 0.1em, uppercase, color `#0D2640`) |
| `.typo-card-label-white` | Etiquetas de tarjeta oscura (10px, peso 700, tracking 0.1em, blanco) |
| `.typo-value-xl` | Valores destacados (24px, peso 800) |
| `.typo-value-lg` | Valores grandes (18px, peso 800) |
| `.typo-value-md` | Valores medianos (13px, peso 800) |
| `.typo-muted-sm` | Textos secundarios (11px) |
| `.typo-btn` | Botones y pills de sección (11px, peso 700, tracking 0.1em, uppercase) |
| `.typo-input` | Inputs y selects (15px) |
| `.typo-subtitle` | Subtítulo de cabecera (14px, peso 500) |

## ID de paciente

- **Formato:** `DOC-{iniciales nombre}{YYYYMMDD}`
- **Cálculo:** se genera automáticamente desde `nombre` + `fnac` del perfil clínico.
- **Comportamiento:** no es input directo. Si falta nombre o fecha, queda vacío o con placeholder.
- **Ejemplo:** `Juan Pérez` + `07/06/1986` → `DOC-JP19860706`

## EditableSelect

- Usar en campos donde el usuario pueda necesitar una opción personalizada.
- Estructura: `<select>` con opciones predefinidas + `Otro`.
- Al elegir `Otro`, se convierte en `<input>` inline con `autoFocus`.
- Si el input se vacía y pierde foco, vuelve al select.
- Placeholder en `opacity-30` mientras no haya valor.

## Tipos de datos recomendados

| Campo | Tipo nativo |
|---|---|
| Fecha de nacimiento | `date` |
| Horas (despertar/dormir/horario) | `time` |
| Teléfono | `tel` |
| Email | `email` |
| Métricas numéricas | `text` (permiten sufijos como %, cm, kg) |
| Textos libres | `text` |

## Divisor de sección

| Token | Valor | Uso |
|---|---|
| `.divider` | `border-top: 1px solid var(--gray)` | Línea horizontal tenue. Definida en `src/styles/components.css`. |

## Cards y métricas

| Clase | Uso |
|---|---|
| `.metric-card` | Card base de métricas (blanca, borde, padding 20px). Definida en `src/styles/components.css`. |
| `.metric-card.accent-deep` | Variante oscura (`#0D2640`). |
| `.metric-card.accent-blue` | Variante azul (`#0066CC`). |
| `.metric-card.accent-green` | Variante verde (`#2E9E70`). |

## Tablas

| Clase | Uso |
|---|---|
| `.table-wrapper` | Contenedor de tabla con borde y border-radius. Definida en `src/styles/components.css`. |
| `.table-row` | Fila de tabla con hover. |
| `.table-cell` | Celda de tabla con padding 6px 10px. |

## Botones

| Clase | Uso |
|---|---|
| `.btn-delete` | Botón de eliminar genérico (sin fondo, color rojo). Definida en `src/styles/components.css`. |
| `.pill` | Pill base azul (`#0066CC`). Definida en `src/styles/components.css`. |

## Tipografía

| Clase | Uso |
|---|---|
| `.label` | Etiqueta pequeña (10px, uppercase, color `#0D2640`, opacidad 0.6). Definida en `src/styles/components.css`. |
| `.label-white` | Etiqueta blanca para fondos oscuros. Definida en `src/styles/components.css`. |

## Calentamiento / Warmup

| Token | Uso |
|---|---|
| `.warmup-title` | Título de bloque de calentamiento. |
| `.warmup-table-header` | Encabezado de tabla de ejercicios. |
| `.warmup-serie-select` | Selector de tipo de serie en tabla de calentamiento. |
| `.warmup-video-btn` | Botón de video en tabla de calentamiento. |
| `.warmup-tipo-text` | Texto de tipo de serie en calentamiento. |

## Radios y bordes

| Token | Uso |
|---|---|
| `.warmup-title` | Título de bloque de calentamiento (fondo `#0D2640`, texto blanco, pill) |
| `.warmup-table-header` | Encabezado de tabla de ejercicios (fondo `#0D2640`, texto blanco) |
| `.warmup-serie-select` | Selector de tipo de serie en tabla de calentamiento |
| `.warmup-video-btn` | Botón de video en tabla de calentamiento |
| `.btn-delete` | Botón de eliminar genérico (sin fondo, color rojo) |

## Radios y bordes

| Token | Valor | Uso |
|---|---|---|
| `--radius-card` | `20px` | Cards |
| `--radius-pill` | `9999px` | Pills, botones redondeados |
| `--border` | `1px solid var(--gray)` | Bordes estándar |

## Proporción

- 60% `--blue`
- 25% `--deep`
- 10% `--green`
- 5% `--gray`

## Cómo agregar un token nuevo

1. Definir la variable en `:root` de `docfitness-tokens.css`.
2. Documentarla en este archivo con su uso principal.
3. Usarla en componentes.

## Flujo de exportación

- **Activo**: HTML offline para WhatsApp (`src/services/ExportPlan.ts`)
- **Legacy (eliminado)**: PDF con `@react-pdf/renderer` (`src/client/PatientPDF.tsx`, `src/client/PatientPDF.styles.ts`, `WarmupPhasePDF`). Eliminados en la limpieza de 2026-08-10. Backups en `.backups/legacy/`.
