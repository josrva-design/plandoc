# Patrones - DocFitness Design System

## Dónde viven los estilos

| Archivo | Rol |
|---|---|
| `docfitness-tokens.css` | Variables CSS `:root` (colores, tipografía, radios, bordes). |
| `src/styles/components.css` | Premium Design System: tablas, cards, botones, badges, inputs premium, clases legacy migradas (`.btn-delete`, `.metric-card`, `.table-wrapper`, `.table-row`, `.table-cell`, `.pill`, `.label`, `.label-white`, `.divider`). |
| `src/styles/typography.css` | Tipografía paciente, PDF, escala tipográfica Escala A (`.cp-hero`, `.cp-subtitle`, `.pdf-page`, etc.). |
| `src/styles/editor.css` | Layout del editor, sidebar, glossary, responsive del editor. |

## Tablas (Warmup / Rutinas)

- **Contenedor:** `maxWidth: '1200px'`, `mx-auto`, `overflowX: 'auto'`
- **Tabla:** `width: '100%'`, `borderCollapse: 'collapse'`
- **Header:** clase `table-header`, padding `3px 6px`
- **Celdas:** padding `3px 6px`, `borderBottom: '1px solid var(--gray)'`
- **Separadores entre filas:** `<tr>` con `colSpan={N}` y `borderBottom: '1px solid var(--gray)'` (sin padding)
- **Icono video:** `18x14px`, `fontSize: '8px'`, `var(--blue)` / `var(--white)`
- **Botón eliminar:** `color: 'var(--red)'`

## Forms

- **Selects:** clase `typo-input w-full border-b border-transparent focus:border-[var(--blue)] outline-none bg-transparent input-placeholder`
- **Inputs de tabla:** `w-full bg-transparent outline-none`, padding `2px 0`, `border: 'none'`
- **Inputs de formulario:** `w-full bg-[var(--light)] rounded-xl px-4 py-3 typo-value-lg mt-1 focus:outline-none`

## Botones

- **Primario:** `bg-[var(--blue)] text-white`
- **Secundario:** `bg-[var(--gray)] text-[var(--deep)]`
- **Peligro:** `bg-red-50 text-red-600` o `color: 'var(--red)'`
- **Pill:** `rounded-full`

## Iconos

- **Video:** `18x14px`, `fontSize: '8px'`, `var(--blue)` / `var(--white)`
- **Eliminar:** `✕`, `color: 'var(--red)'`

## Espaciado

- **Padding de celdas:** `3px 6px`
- **Margen entre bloques:** `6px` / `8px`
- **Gap entre botones:** `8px` / `12px`

## Alineación

- Toda tabla va contenida en `mx-auto` con `maxWidth: '1200px'`.
- En pantallas chicas, usar `overflowX: 'auto'` para evitar desbordes.

## Exportación (HTML WhatsApp)

- **Generado por**: `src/services/ExportPlan.ts` → `generateDashboardFitnessHTML()`
- **Acción**: `ExportSection.tsx` → botones "Vista previa" y "Generar archivo para WhatsApp"
- **Formato**: HTML offline mobile-ready, optimizado para WhatsApp
- **Legacy (eliminado)**: `src/client/PatientPDF.tsx`, `src/client/PatientPDF.styles.ts` e interfaz `WarmupPhasePDF` fueron eliminados en la limpieza de 2026-08-10. Backups en `.backups/legacy/`.

## Hoja de resumen

### Estructura

- **Encabezado:** fecha actual (izquierda) + próxima actualización (derecha).
- **Secciones:** Perfil, Avances, Retroalimentación, Diagnóstico, Objetivos y plan a seguir, Tratamiento Nutricional, Tratamiento de Entrenamiento.
- **Layout:** grid responsive con tarjetas redondeadas.
- **Navegación:** el resumen va al final del orden de tabs, como resultado del programa completo.

### Tipografía

- **Título principal:** `.h1` (Inter Tight, 42px, peso 800) con la fecha actual.
- **Subtítulo:** `.sub` (12px, tracking 2px, uppercase, opacidad reducida).
- **Secciones:** `.typo-label` (10px, peso 700, tracking 0.1em, uppercase) para reducir jerarquía visual.
- **Etiquetas de tarjeta (claras):** `.typo-label` (10px, peso 700, tracking 0.1em, uppercase, gris).
- **Etiquetas de tarjeta (oscuras):** `.typo-card-label-white` (10px, peso 700, tracking 0.1em, blanco).
- **Valores grandes:** `.typo-value-xl` (24px, peso 800) / `.typo-value-lg` (18px, peso 800) / `.typo-value-md` (13px, peso 800).
- **Textos secundarios:** `.typo-muted-sm` (11px).

### Tarjetas

- **Fondo claro:** `bg-[#F6F6F7] border border-[#E8E8E8] rounded-2xl`.
- **Fondo oscuro:** `bg-[#0D2640] text-white rounded-2xl`.
- **Fondo verde:** `bg-[#2E9E70] text-white rounded-2xl`.
- **Fondo azul:** `bg-[#0066CC] text-white rounded-2xl`.
- **Padding:** `p-4` o `px-6 py-5`.
- **Gap entre tarjetas:** `gap-2.5`.

### Barras

- **Barra de progreso:** `h-1.5 w-full bg-[#E8E8E8] rounded-full overflow-hidden` con inner `bg-[#0D2640]`.
- **Macro bar:** `h-1 w-12 mx-auto bg-[#0066CC]/10 rounded-full overflow-hidden` con inner `bg-[#0066CC]`.

### Avances

- **Grid:** 5 columnas.
- **Contenido por tarjeta:** comparativa `Anterior - Actual` en una misma línea.
- **Pill verde:** en esquina superior derecha con flecha `↑`/`↓` y valor de avance.
- **Placeholders generales:** Peso `70`, Abdomen `85cm`, (Kg) Grasa `18`, (%) Grasa `20%`, Pliegue `12`, Avance Peso `+1`, Avance Abdomen `-2cm`, Avance Grasa `-1`, Avance % Grasa `-1`, Avance Pliegue `-1`.
- **Adherencia:** tarjeta verde `Adherencia a plan` + 4 tarjetas blancas (Nutrición, Entrenamiento, Cardio, Descanso).

### Tratamiento Nutricional

- **Layout:** grid de 5 columnas alineado verticalmente con Avances.
- **Tarjetas:**
  1. Estrategia (verde)
  2. Kcal (clara)
  3. Proteína (g) + % (clara)
  4. Carbohidratos (g) + % (clara)
  5. Grasas (g) + % (clara)
- **Macros pegados:** Proteína, Carbohidratos y Grasas se presentan en un solo bloque continuo con borde y redondeado general, separadas solo por una línea vertical tenue (`border-r border-[#E8E8E8]`).

### Inputs inline (Retroalimentación / Diagnóstico / Objetivos)

- Listas numeradas con viñeta automática (`1.`, `2.`, `3.`, ...).
- **Enter:** agrega nuevo input vacío y hace focus automáticamente.
- **Backspace en input vacío:** elimina el input y hace focus al anterior.
- **Placeholder:** solo texto de referencia, sin número (ej: `Describe tu evaluación inicial`).

### Colores específicos

- Azul principal: `#0066CC`
- Azul oscuro: `#0D2640`
- Verde: `#2E9E70`
- Gris fondo: `#F6F6F7`
- Gris borde: `#E8E8E8`
- Verde pill avance: `#2E9E70`

## Hoja de perfil

- **Layout general:** grid de 4 columnas con cards `bg-[#F6F6F7] border border-[#E8E8E8] rounded-2xl p-4`.
- **Títulos de sección:** `.typo-label` (10px, peso 700, tracking 0.1em, uppercase, color `#0D2640`).
- **Títulos de fila / etiquetas de tabla:** `.typo-label` con `text-[#0D2640]`.
- **Valores:** `.typo-value-md` o `.typo-value-lg` según importancia.
- **ID:** valor generado automáticamente como `DOC-{iniciales nombre}{YYYYMMDD}` desde `nombre` + `fnac`. No es input directo. Si falta nombre o fecha, queda vacío.
- **Datos:** inputs inline para Nombre, F. Nacimiento (`type="date"`), Estado, Cel/WhatsApp (`type="tel"`), Email (`type="email"`), Instagram. Dropdowns editables para Sexo, País/Región y Ocupación.
- **Métricas:** inputs inline numéricos con placeholders de referencia (`25`, `70`, `170cm`, etc.).
- **Historial Médico:** tabla con filas alternas. Columna **Estado** usa `Select` con opciones específicas por concepto. Columna de observaciones usa input directo con placeholder `Observaciones...`.
- **Hábitos:** grid 4 columnas con `EditableSelect` (NO/DIARIO/SEMANAL/OCASIONAL + Otro editable).
- **Nutrición:** tabla con dropdowns específicos por pregunta + observaciones input.
- **Actividad Física:** grid 4 columnas. Despertar/Dormir/Horario usan `type="time"`. Actividad 1/2 usan `EditableSelect` con actividades + Otro. Sesiones/Duración/Pasos son inputs inline con placeholders numéricos.
- **Nivel de actividad física:** dropdown con opciones: `Sedentario`, `Ligero`, `Moderado`, `Activo`, `Muy activo`.

### Calentamiento

- Se muestra dentro de la misma pestaña **Calendario**, debajo del grid semanal.
- Título superior: `<SectionTitle>CALENTAMIENTO SUPERIOR</SectionTitle>`
- Título inferior: `<SectionTitle>CALENTAMIENTO INFERIOR</SectionTitle>`
- Cada bloque (GENERAL / MOVILIDAD / ESPECÍFICO) usa `.warmup-title` como pill oscuro.
- Tabla responsive con grid de columnas fijas.
- Selector de tipo de serie con color semántico por tipo.
- Botones de acción con `.btn`, `.btn--ghost`, `.btn-delete`.
- **GENERAL:** selección única del nutriólogo mediante dropdown con opciones predefinidas. No se permite agregar/quitar filas en este bloque.
- **MOVILIDAD / ESPECÍFICO:** el nutriólogo arma la secuencia libremente: agrega/quita ejercicios, define tipo de serie, sets, reps, descanso y notas. El nombre del ejercicio se selecciona desde un dropdown que se completa desde el Google Sheet externo; al seleccionarlo, se actualizan automáticamente el video y las notas correspondientes.

## EditableSelect (dropdown con opción "Otro")

- Muestra un `<select>` con opciones predefinidas + `Otro`.
- Al seleccionar `Otro`, se reemplaza por un `<input>` inline con `autoFocus`.
- Si el usuario deja el input vacío y pierde foco (`onBlur`), vuelve al select.
- Si escribe un valor personalizado, se sincroniza como dato real.
- Placeholder en tenue (`opacity-30`) mientras no haya selección.

### Tipos de datos recomendados por campo

- **Fecha:** `type="date"`
- **Hora:** `type="time"`
- **Teléfono:** `type="tel"`
- **Email:** `type="email"`
- **Métricas numéricas:** `type="text"` (permiten sufijos como %, cm, kg)
- **Textos libres:** `type="text"`

## Opacidad de placeholders / valores pendientes

- Las **tarjetas, etiquetas, fondos y bordes** deben mantener opacidad normal.
- Solo el **valor** (texto de referencia o placeholder) debe mostrarse atenuado (`opacity-20` / `opacity-30`) cuando aún no existe un dato real proveniente de otras hojas.
- Una vez capturado el dato real, el valor pasa a opacidad completa.
- En tarjetas de avance, la pill de diferencia también debe atenuarse cuando el avance no tiene dato real.
- En dropdowns, aplicar `opacity-30` mientras no haya selección; al elegir una opción, pasa a opacidad completa.

## Responsive

- Usar breakpoints existentes en `src/index.css` (`max-width: 900px`, `max-width: 600px`).
- No agregar media queries en componentes sin antes definirlas en `src/index.css`.
