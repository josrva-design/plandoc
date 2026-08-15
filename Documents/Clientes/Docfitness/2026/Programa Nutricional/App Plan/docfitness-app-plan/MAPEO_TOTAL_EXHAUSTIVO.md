# MAPEO TOTAL Y EXHAUSTIVO - UI/UX Editor + ClientPage

## 1. PILLS / CHIPS

### 1.1 Pills de selección de día (ClientPage)
- **Ubicación:** ClientPage.tsx líneas 362-377
- **Tipo:** Selector single-select de 7 opciones
- **Opciones:** LUN, MAR, MIÉ, JUE, VIE, SÁB, DOM
- **Especificación:**
  - Contenedor: `bg-white rounded-full p-1 flex justify-between border border-black/5`
  - Botón: `relative w-[44px] h-[44px] rounded-full flex flex-col items-center justify-center`
  - Transición: `transition-all duration-200 active:scale-95`
- **Estados:**
  - **Default:** `bg-transparent !text-[var(--color-navy)] hover:bg-black/5`
  - **Selected:** `bg-[var(--color-primary)] !text-white`
- **Indicador "hoy":** `w-1.5 h-1.5 rounded-full mt-0.5`
  - Si activo: `bg-white`
  - Si inactivo: `bg-[var(--color-green)]`
- **Comportamiento:** Click cambia `selectedDayKey`, recarga contenido de entrenamiento, nutrición y suplementos

### 1.2 Pills de tabs HOY/AVANCES/GUÍA (ClientPage)
- **Ubicación:** ClientPage.tsx líneas 348-359
- **Tipo:** Tabs single-select
- **Opciones:** HOY, AVANCES, GUÍA
- **Especificación:**
  - Contenedor: `p-1 rounded-full flex gap-1 bg-white border border-black/5`
  - Botón: `flex-1 py-3 rounded-full cp-secondary font-bold tracking-wide`
  - Transición: `transition-all duration-200 active:scale-[0.96]`
- **Estados:**
  - **Default:** `bg-transparent text-[var(--color-navy)] hover:bg-black/5`
  - **Selected:** `bg-[var(--color-primary)] text-white`
- **Comportamiento:** Click cambia `tab` state, muestra/hoculta secciones

### 1.3 Pills de horario de comida (ClientPage)
- **Ubicación:** ClientPage.tsx línea 489
- **Tipo:** Badge informativo
- **Especificación:**
  - `font-bold px-2.5 py-1 rounded-full bg-[var(--color-green)] flex items-center gap-1.5`
  - Icono: `<Clock className="w-3 h-3 text-white"/>`
  - Texto: `cp-caption font-black text-white`
- **Contenido:** `{meal.hour || meal.tiempo || ''}`
- **Comportamiento:** No interactivo, solo display

### 1.4 Pills de estrategia nutricional/entrenamiento (ClientPage)
- **Ubicación:** ClientPage.tsx líneas 645-663
- **Tipo:** Pills informativas
- **Especificación:**
  - `cp-caption font-bold px-3 py-1.5 rounded-full`
- **Variantes:**
  - **Estrategia:** `bg-[var(--color-primary)] !text-white capitalize`
  - **Macros/Stats:** `bg-[var(--color-navy)] !text-white`
- **Contenido nutrición:** `{tNutri.estrategia}`, `{tNutri.kcal} kcal`, `{tNutri.proteina}P`, `{tNutri.carbs}C`, `{tNutri.grasas}G`
- **Contenido entrenamiento:** `{tEntre.estrategia}`, `{tEntre.dias} días`, `{tEntre.cardio}`, `{tEntre.pasos} pasos`

### 1.5 Pills de horario de suplementos (ClientPage)
- **Ubicación:** ClientPage.tsx línea 552
- **Tipo:** Badge con icono
- **Especificación:**
  - `font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5`
- **Variantes por horario:**
  | Horario | bg | text |
  |---|---|---|
  | MAÑANA | `bg-[var(--color-primary)]/10` | `text-[var(--color-primary)]` |
  | TARDE | `bg-[var(--color-orange)]/10` | `text-[var(--color-orange)]` |
  | NOCHE | `bg-[var(--color-navy)]/10` | `text-[var(--color-navy)]` |
  | POST ENTRENO | `bg-[var(--color-green)]/10` | `text-[var(--color-green)]` |
  | Default | `bg-[var(--color-bg-subtle)]` | `text-[var(--color-text-secondary)]` |
- **Icono:** `<Clock className="w-3 h-3 !text-[var(--color-navy)]"/>`
- **Texto:** `cp-caption font-black` con color del badge

### 1.6 Pills de categoría de comida (ClientPage)
- **Ubicación:** ClientPage.tsx línea 142
- **Tipo:** Badge de categoría
- **Especificación:**
  - `cp-caption font-black uppercase tracking-[0.08em] mb-1.5 px-2 py-0.5 rounded-full inline-block`
- **Variantes:**
  | Categoría | bg | text |
  |---|---|---|
  | PROTEÍNA | `bg-[var(--color-navy)]` | `text-white` |
  | CARBOHIDRATO | `bg-[var(--color-blue)]` | `text-white` |
  | GRASA | `bg-[var(--color-orange)]` | `text-white` |
  | OTROS | `bg-[var(--gray-medium)]` | `text-white` |

### 1.7 Pills de tipo de bloque en editor (RoutineSection.jsx)
- **Ubicación:** RoutineSection.jsx línea 7
- **Tipo:** Select/display de tipo
- **Opciones:** Normal, Biserie, Triserie, Circuito
- **Especificación en celda:**
  - `premium-cell-select text-[10px] w-full` (cuando edita)
  - `warmup-tipo-text` (cuando display)
- **Comportamiento:** Click edita tipo, blur guarda

### 1.8 Pills de grupo de ejercicios (RoutineSection.jsx)
- **Ubicación:** RoutineSection.jsx línea 12
- **Tipo:** Tabs de grupo
- **Opciones:** Aprox, Entreno
- **Especificación:**
  - Labels: `APROXIMACIÓN` (primary), `ENTRENAMIENTO` (green)
  - Colores: `var(--color-primary)`, `var(--color-green)`
- **Comportamiento:** Cambia `activeGroup`, filtra ejercicios

---

## 2. BADGES / ETIQUETAS

### 2.1 Badge "Plan activo" (ClientPage)
- **Ubicación:** ClientPage.tsx línea 336
- **Tipo:** Badge de estado
- **Especificación:**
  - `inline-flex items-center px-3 py-1 rounded-full bg-black/5 border border-black/10`
  - Texto: `cp-caption font-black tracking-[0.12em] uppercase text-black/60`
- **Contenido:** "Plan activo"

### 2.2 Badge de técnica de ejercicio (ClientPage)
- **Ubicación:** ClientPage.tsx línea 259
- **Tipo:** Badge de técnica
- **Especificación:**
  - `cp-caption font-black px-2.5 py-1 rounded-full bg-[var(--color-navy)]/5 tracking-wide whitespace-nowrap`
- **Colores por técnica (getTecnicaColor):**
  | Técnica | Color |
  |---|---|
  | DROPSET | `text-[var(--color-orange)]` |
  | TOP SET | `text-[var(--color-primary)]` |
  | BACK-OFF | `text-[var(--color-green)]` |
  | REST-PAUSE | `text-[var(--color-danger)]` |
  | AL FALLO / FALLO | `text-[var(--color-danger)]` |
  | MYO-REPS | `text-[var(--color-navy)]` |
  | BISERIE / TRISERIE | `text-[var(--color-orange)]` |
  | CIRCUITO | `text-[var(--color-green)]` |
  | Default | `text-[var(--color-navy)]` |

### 2.3 Badge de delta de medidas (ClientPage)
- **Ubicación:** ClientPage.tsx línea 604
- **Tipo:** Badge de cambio
- **Especificación:**
  - `cp-caption font-bold px-2 py-1 rounded-full bg-[var(--color-green)] !text-white`
- **Contenido:** `{m.delta < 0 ? '↓' : '↑'} {Math.abs(roundDelta(m.delta ?? 0))}`
- **Comportamiento:** Muestra dirección y magnitud del cambio

### 2.4 Badge de código de ejercicio (ClientPage)
- **Ubicación:** ClientPage.tsx línea 245
- **Tipo:** Badge circular de código
- **Especificación:**
  - `w-6 h-6 flex items-center justify-center cp-caption font-black rounded-full shrink-0 z-10 min-w-[24px]`
- **Variantes:**
  - **Default:** `bg-[var(--color-navy)] text-white` → muestra `{exCode}`
  - **Opción:** `bg-[var(--color-primary)]/10 text-[var(--color-primary)]` → muestra `○`
- **Comportamiento:** Identificador visual del ejercicio en lista

### 2.5 Badge "Armar menú" (ClientPage)
- **Ubicación:** ClientPage.tsx línea 495
- **Tipo:** Badge de estado de comida
- **Especificación:**
  - `cp-caption font-black px-2 py-0.5 rounded-full bg-[var(--color-primary)] !text-white`
- **Contenido:** "Armar menú"
- **Condición:** Solo si `meal.menuType === 'armar'`

### 2.6 Badge de horario en editor (CalendarSection.jsx)
- **Ubicación:** CalendarSection.jsx línea 123
- **Tipo:** Pill de día
- **Especificación:**
  - `premium-btn-pill premium-btn-pill--primary`
  - Secundario: `typo-muted-xs` para número
- **Contenido:** `{day.label}` + número secuencial

### 2.7 Badges de fase en editor (WarmupSection.jsx)
- **Ubicación:** WarmupSection.jsx línea 7
- **Tipo:** Badge de fase
- **Especificación:**
  - Labels: GENERAL, MOVILIDAD, ESPECIFICO
  - Colores: `var(--color-primary)`, `var(--color-primary-300)`, `var(--color-primary-200)`
- **Comportamiento:** Agrupa ejercicios por fase

---

## 3. SECUENCIAS Y SUPERSETS

### 3.1 Lógica de agrupación (WarmupSection.jsx)
- **Función:** `groupSeries(items)` línea 93
- **Límites por tipo:**
  | Tipo | Límite |
  |---|---|
  | Normal | 99 |
  | Biserie | 2 |
  | Triserie | 3 |
  | Circuito | 5 |

### 3.2 Asignación de letras (WarmupSection.jsx)
- **Función:** `getCombinedSections(bloques)` línea 119
- **Lógica:** `String.fromCharCode(65 + idx)` → A, B, C, D...
- **Orden:** GENERAL → MOVILIDAD → ESPECÍFICO
- **Bloque:** Agrupa ejercicios del mismo tipo hasta el límite

### 3.3 Marca de opción (WarmupSection.jsx)
- **Ubicación:** línea 134
- **Lógica:** `grupo === 'general' && generalIndex < 3`
- **Marcas:** Opción 1, Opción 2, Opción 3
- **Comportamiento:** Primeros 3 ejercicios de GENERAL son "opciones"

### 3.4 Representación visual en ClientPage
- **BISERIE/TRISERIE:**
  - Título: `BLOQUE {letra} • {tipo}` con color orange
  - Línea vertical: `absolute left-[10px] top-0 bottom-0 w-0.5 bg-black/10 -z-10`
  - Indent: `pl-[14px]`
  - Indicación limpia: `formatIndicacionDisplay()` elimina texto de reps/series
- **ELIGE 1 OPCIÓN:**
  - Badge código: `○` en circle primary/10
  - Prefijo nombre: "Opción {n}: "
  - Prefijo prescripción: "{codigo} · "
- **SERIE SIMPLE:**
  - Sin línea vertical
  - Sin indent adicional
  - Badge código: circle navy con código

### 3.5 Separadores entre bloques (ClientPage)
- **Ubicación:** línea 220
- **Especificación:** `bIdx > 0 ? 'mt-6 pt-6 border-t border-black/5' : ''`
- **Comportamiento:** Separador visual entre bloques consecutivos

---

## 4. NOTAS ACLARATORIAS Y HELPERS

### 4.1 Placeholders de inputs (ProfileSection.jsx)
- **Ejemplos:** "Nombre completo", "Sexo", "Edad", "1.75", "74.2", "Nivel", "Objetivo", "Actividad principal", "30-40", "117-136", "6000"
- **Especificación:** `opacity-20` cuando no hay valor, `input-placeholder` class

### 4.2 Hints de campos (CalendarSection.jsx)
- **Ubicación:** CalendarSection.jsx línea 60
- **Campos con hint:**
  | Campo | Hint |
  |---|---|
  | actividad | Texto libre |
  | cardio | Minutos |
  | fc | BPM |
  | pasos | Cantidad |
- **Especificación:** `typo-label` con `fontWeight: 400`

### 4.3 Instrucciones de comida (ClientPage)
- **Ubicación:** ClientPage.tsx línea 502
- **Texto:** "Elige 1 de cada grupo"
- **Especificación:** `cp-caption font-black uppercase tracking-[0.08em] text-[var(--color-text-muted)] mb-2`
- **Condición:** Solo en modo "armar"

### 4.4 Notas de avances (ClientPage)
- **Ejemplos:** "Anterior → Actual", "Ant • Act"
- **Especificación:** `cp-caption font-bold tracking-widest uppercase mt-2`
- **Estilos:** `opacity-30` o `opacity-50` para texto secundario

### 4.5 Empty states (ClientPage)
- **Entrenamiento:** "Día de descanso o sin ejercicios cargados"
  - `cp-body !text-black/30 py-4 text-center`
- **Entrenamiento sin ejercicios:** "Sin entrenamiento principal"
  - `cp-body !text-black/30 py-2 text-center`
- **Suplementos:** "Sin suplementos este día"
  - `cp-secondary !text-black/30`

### 4.6 Tooltips / Info icons
- **Glosario:** Icono `<Info className="w-4 h-4 text-[var(--color-text-muted)]"/>`
- **Badge grupo comida:** `title={equivalentes.length > 0 ? \`Equivalentes: ${equivalentes.join(', ')}\` : grupoLabel}`

### 4.7 Disclaimers
- **[FALTA]** No se encontraron disclaimers explícitos en el código visible

---

## 5. AGRUPACIÓN DE SERIES / ESTRUCTURA DE ENTRENAMIENTO

### 5.1 Tipos de agrupación (WarmupSection.jsx / RoutineSection.jsx)
| Tipo | Límite | Visual |
|---|---|---|
| Normal | 99 | Sin indent, sin línea |
| Biserie | 2 | Línea vertical, indent |
| Triserie | 3 | Línea vertical, indent |
| Circuito | 5 | [FALTA: confirmar visual] |

### 5.2 Estructura de bloques en editor (RoutineSection.jsx)
- **Columnas de tabla:**
  | Columna | Key | Ancho |
  |---|---|---|
  | TIPO | tipo | 8% (min 38px, max 45px) |
  | Serie | serie | 6% (min 40px, max 45px) |
  | FASE | fase | 8% (min 55px, max 70px) |
  | VID | video | 6% (min 40px) |
  | EJERCICIO | ejercicio | flex-1 |
  | [FALTA: más columnas] | - | - |

### 5.3 Bloque label en editor (RoutineSection.jsx)
- **Ubicación:** línea 78
- **Especificación:** `warmup-block-label`
- **Contenido:** `{row.blockSerie} {row.blockLetter}`
- **Condición:** Solo si `row.isFirstInBlock`

### 5.4 Serie label en editor (RoutineSection.jsx)
- **Ubicación:** línea 102
- **Especificación:** `warmup-serie`
- **Contenido:** `{row.blockLetter}{row.blockPosition}`
- **Ejemplo:** A1, A2, B1, B2...

### 5.5 Cabecera de grupo en editor (RoutineSection.jsx)
- **Grupos:** Aprox, Entreno
- **Especificación:**
  - Labels: `APROXIMACIÓN` (primary), `ENTRENAMIENTO` (green)
  - Colores: `var(--color-primary)`, `var(--color-green)`

### 5.6 Contador de series
- **[FALTA]** No se encontró contador explícito de series en el código visible

---

## 6. GRUPOS Y CATEGORÍAS

### 6.1 Grupos de ejercicios (RoutineSection.jsx)
- **Grupos:** Aprox, Entreno
- **Comportamiento:** Tabs que filtran la tabla de ejercicios
- **Especificación:**
  - Labels: `APROXIMACIÓN`, `ENTRENAMIENTO`
  - Colores: primary, green

### 6.2 Fases de calentamiento (WarmupSection.jsx)
- **Fases:** GENERAL, MOVILIDAD, ESPECÍFICO
- **Configuración:**
  | Fase | Label | Color |
  |---|---|---|
  | general | GENERAL | `var(--color-primary)` |
  | movilidad | MOVILIDAD | `var(--color-primary-300)` |
  | especifico | ESPECIFICO | `var(--color-primary-200)` |

### 6.3 Categorías de alimentos (ClientPage)
- **Categorías:** PROTEÍNA, CARBOHIDRATO, GRASA, OTROS
- **Lógica de inferencia (inferCategoria):**
  - PROTEÍNA: `proteinas > 0 && proteinas >= carbos && proteinas >= grasas`
  - CARBOHIDRATO: `carbos > 0 && carbos > proteinas && carbos >= grasas`
  - GRASA: `grasas > 0 && grasas > proteinas && grasas > carbos`
  - OTROS: fallback
- **Colores:**
  | Categoría | bg | text |
  |---|---|---|
  | PROTEÍNA | `bg-[var(--color-navy)]` | `text-white` |
  | CARBOHIDRATO | `bg-[var(--color-blue)]` | `text-white` |
  | GRASA | `bg-[var(--color-orange)]` | `text-white` |
  | OTROS | `bg-[var(--gray-medium)]` | `text-white` |

### 6.4 Grupos de glosario (ClientPage)
- **Ubicación:** ClientPage.tsx línea 900
- **Agrupación:** Por `term.cat` o 'General' por defecto
- **Especificación:**
  - `border border-[var(--color-border)] rounded-xl overflow-hidden`
  - Header: `w-full px-3 py-2 flex items-center justify-between bg-[var(--color-bg-subtle)]`

---

## 7. EQUIVALENCIAS / SUSTITUCIONES

### 7.1 Food group badge con tooltip (NutritionSection.jsx)
- **Ubicación:** NutritionSection.jsx línea 141
- **Especificación:**
  - `input-badge-group` contenedor
  - Badge: `food-group-badge` o `food-group-badge--help`
  - `title={equivalentes.length > 0 ? \`Equivalentes: ${equivalentes.join(', ')}\` : grupoLabel}`
- **Comportamiento:** Hover muestra tooltip con equivalentes
- **Datos:** `foodDatabase.filter((f) => f.grupo === grupo && f.nombre !== value)`

### 7.2 Swaps en guía (ClientPage)
- **Ubicación:** ClientPage.tsx línea 810
- **Estructura:**
  - `space-y-1.5`
  - Item: `flex gap-2 cp-secondary`
  - Label: `font-bold text-[var(--color-text-primary)] min-w-[70px]`
  - Value: `text-[var(--color-text-secondary)]`
- **Ejemplo:** "Arroz → Quinoa"

### 7.3 Dont list en guía (ClientPage)
- **Ubicación:** ClientPage.tsx línea 805
- **Estructura:**
  - `space-y-1.5`
  - Item: `flex gap-2 cp-secondary text-[var(--color-text-muted)]`
  - Icono: `<X size={12} className="shrink-0 mt-0.5 text-[var(--color-danger)]"/>`
  - Texto: `{d}`

---

## 8. HORARIOS Y LÓGICA DE COMIDAS

### 8.1 Pills de horario (ver sección 1.5)

### 8.2 Inputs de hora (NutritionSection.jsx)
- **Campos:** `hour`, `tiempo`
- **Especificación:** Parte de la tabla de comidas
- **Valores:** "07:00", "12:00", etc.

### 8.3 Orden cronológico (ClientPage)
- **Ubicación:** ClientPage.tsx línea 313
- **Lógica:** `useMemo` ordena por `hour` o `tiempo`
- **Algoritmo:** `(ha[0]*60 + ha[1]) - (hb[0]*60 + hb[1])`

### 8.4 Tiempos de comida predefinidos (NutritionSection.jsx)
- **Ubicación:** línea 9
- **Opciones:** DESAYUNO, COMIDA, CENA, SNACK, PRE, POST, AYUNAS, ANTES DORMIR

### 8.5 Drag & drop
- **[FALTA]** No se encontró implementación de drag & drop en el código visible

---

## 9. MAPEO DE DISEÑO COMBINADO: Editor + ClientPage → PDF

### 9.1 Origen de cada elemento del PDF

| Elemento PDF | Fuente Editor | Fuente ClientPage | Decisión |
|---|---|---|---|
| Header + saludo | ProfileSection.jsx | ClientPage.tsx 334-345 | ClientPage |
| Badge "Próxima actualización" | SummarySection.jsx | ClientPage.tsx 344 | ClientPage |
| Logo en cada hoja | - | - | Nuevo (requerimiento PDF) |
| Avances cards navy/green | SummarySection.jsx + AvancesCards.jsx | ClientPage.tsx 581-665 | ClientPage |
| Grid de medidas | SummarySection.jsx | ClientPage.tsx 594-615 | ClientPage |
| Mini stats | SummarySection.jsx | ClientPage.tsx 627-640 | ClientPage |
| Pills de estrategia | NutritionSection.jsx + RoutineSection.jsx | ClientPage.tsx 643-665 | ClientPage |
| Calentamiento general | WarmupSection.jsx | ClientPage.tsx 380-430 | Editor → PDF |
| Entrenamiento por día | RoutineSection.jsx | ClientPage.tsx 434-470 | Editor → PDF |
| Nutrición tabla general | NutritionSection.jsx | ClientPage.tsx 473-527 | Editor → PDF |
| Suplementación tabla | SupplementSection.jsx | ClientPage.tsx 529-569 | Editor → PDF |
| Guía FAQ/Split/Grid/Columns | GuideSection.jsx | ClientPage.tsx 689-889 | data/guideContent.js |
| Glosario | GlossarySection.jsx | ClientPage.tsx 891-969 | data/guideContent.js |
| Links contacto | - | ClientPage.tsx 973-994 | Hardcodeado DocFitness |

### 9.2 Decisiones de diseño PDF

| Elemento | Decisión | Justificación |
|---|---|---|
| Avances | Mantener cards ClientPage | Diseño pulido con colores, deltas, barras |
| Entrenamiento | Tabla | Mejor legibilidad en 1080px vertical |
| Calentamiento | Tabla, una sola vez | No repetir por día |
| Nutrición | Tabla general sin días | Plan semanal unificado |
| Suplementación | Tabla general | Mismo rationale |
| Guía | Cards planas | PDF estático, no expand/collapse |
| Tipografía | Helvetica | PDF-safe |
| Logo | Cada hoja | Requerimiento documento impreso |

### 9.3 Estructura final de páginas PDF

```
Página 1: Header + Avances + Estrategias + Clínico
Página 2: Calentamiento General (Lower + Upper)
Página 3: Entrenamiento LUN
Página 4: Entrenamiento MAR
Página 5: Entrenamiento MIÉ
Página 6: Entrenamiento JUE
Página 7: Entrenamiento VIE
Página 8: Entrenamiento SÁB
Página 9: Entrenamiento DOM
Página 10: Nutrición (tabla general)
Página 11: Suplementación (tabla general)
Página 12: Guía
Página 13: Glosario
Página 14: Contacto/Links
```

### 9.4 Especificaciones técnicas PDF

| Parámetro | Valor |
|---|---|
| Tamaño de página | 1080 x 1920 px (9:16 vertical) |
| Padding | 48px |
| Fondo | `#F6F6F6` |
| Color primario texto | `#0D2640` (navy) |
| Fuente base | Helvetica |
| Cards | `bg-white rounded-24 p-24 border border-black/5` |
| Separador | `border-black/5` o `#E5E7EB` |

---

## 10. COMPONENTES FALTANTES POR ANALIZAR

| Componente | Estado | Prioridad |
|---|---|---|
| EvolutionSection.jsx | [FALTA] | Media |
| SupplementSection.jsx | [FALTA] | Media |
| DataSection.jsx | [FALTA] | Baja |
| GuideSection.jsx | [FALTA] | Media |
| GlossarySection.jsx | [FALTA] | Media |
| AvancesCards.jsx | [FALTA] | Alta |
| MacroBars.jsx | [FALTA] | Media |
| EditableTable.jsx | [FALTA] | Alta |
| PageHeader.jsx | [FALTA] | Baja |
| PatientOffline.jsx | [FALTA] | Baja |
| PreviewTab.jsx | [FALTA] | Baja |
| LineChart.jsx | [FALTA] | Baja |
| Sparkline.jsx | [FALTA] | Baja |
| InBodyBar.jsx | [FALTA] | Baja |
| SectionTitle.jsx | [FALTA] | Baja |
| IconX.jsx | [FALTA] | Baja |

---

## 11. RESUMEN DE ELEMENTOS DOCUMENTADOS

| Categoría | Cantidad |
|---|---|
| Pills/Chips | 8 tipos |
| Badges/Etiquetas | 7 tipos |
| Secuencias/Supersets | 4 tipos |
| Notas aclaratorias | 5 tipos |
| Grupos/Categorías | 4 sistemas |
| Equivalencias/Sustituciones | 3 tipos |
| Horarios/Comidas | 5 elementos |
| Componentes analizados | 8 completos + 15 pendientes |
