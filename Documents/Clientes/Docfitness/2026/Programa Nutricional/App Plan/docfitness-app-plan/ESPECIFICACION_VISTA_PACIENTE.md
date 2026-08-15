# Especificación Vista Paciente

Datos que se muestran en la vista paciente (`PatientPDF.tsx`) y su origen en el editor.

---

## HOY

### Header
|x|Origen en editor|
|---|---|
|`person.nombre`|ProfileSection → Nombre|
|`dayRoutine.actividad` / `dayRoutine.tipo`|CalendarSection + RoutineSection|
|`plan.proximaConsulta`|DataSection → Fecha de consulta|

### Selector días
|Días LUN-DOM|DataSection → Fecha de consulta (hoy automático)|

### Calentamientos
|Desplegable LOWER / UPPER|CalendarSection → modo calentamiento|
|Fases GENERAL / MOVILIDAD / ESPECÍFICO|CalendarSection → calentamientos|
|Ejercicios por fase|CalendarSection → ejercicios de calentamiento|

### Entrenamiento del día
|`dayRoutine.actividad`|CalendarSection → actividad del día|
|`dayRoutine.ejercicios[].ejercicio`|RoutineSection → ejercicios|
|`dayRoutine.ejercicios[].secuencia`|RoutineSection → secuencia|
|`dayRoutine.ejercicios[].tecnica`|RoutineSection → técnica|
|`dayRoutine.ejercicios[].sets`|RoutineSection → series|
|`dayRoutine.ejercicios[].reps`|RoutineSection → reps|
|`dayRoutine.ejercicios[].descanso`|RoutineSection → descanso|
|`dayRoutine.ejercicios[].rir`|RoutineSection → RIR|
|`dayRoutine.duracion`|CalendarSection / RoutineSection|

### Nutrición del día
|`meal.time` (DESAYUNO, COMIDA, etc.)|NutritionSection → tiempo|
|`meal.hour`|NutritionSection → hora|
|`meal.kcal`|NutritionSection → kcal totales|
|`meal.macros.proteinas / carbos / grasas`|NutritionSection → macros por comida|
|`meal.foods[].name`|NutritionSection → alimento|
|`meal.foods[].grams`|NutritionSection → gramos|
|`meal.foods[].unit`|NutritionSection → unidad|

### Suplementación del día
|`supplement.nombre`|SupplementSection → nombre|
|`supplement.dosis`|SupplementSection → dosis|
|`supplement.horario`|SupplementSection → horario|

---

## AVANCES

### Peso
|`avances.peso.label`|Hardcodeado: `(KG) PESO`|
|`avances.peso.anterior`|ProfileSection → Peso inicial (`person.pesoIni`)|
|`avances.peso.actual`|EvolutionSection → última consulta registrada (`evolution.cells[ultima].peso`)|
|`avances.peso.delta`|Calculado: actual - anterior|

### Medidas (Abdomen, Grasa KG, Grasa %, Pliegue)
|`label`|Hardcodeado: `(CM) ABDOMEN`, `(KG) GRASA CORPORAL`, `(%) GRASA CORPORAL`|
|`anterior`|EvolutionSection → primera consulta (`evolution.cells[primera]`)|
|`actual`|EvolutionSection → última consulta (`evolution.cells[ultima]`)|
|`delta`|Calculado: actual - anterior|

### Estadísticas
|`estadisticas.adherencia`|EvolutionSection → adherencia última consulta|
|`estadisticas.nutricion`|EvolutionSection → nutrición última consulta|
|`estadisticas.entrenamiento`|EvolutionSection → entreno última consulta|
|`estadisticas.cardio`|EvolutionSection → cardio última consulta|
|`estadisticas.descanso`|ProfileSection → Horas de descanso (`person.dormir` - `person.despertar`? No, viene de `stats.descanso` en sampleData, pero en el editor no hay input directo para descanso en horas)|

### Tratamiento Nutricional (pills)
|`tratamientoNutricional.estrategia`|ProfileSection → Nutrición → Tipo de plan preferido? No, viene de `nutrition.estrategia`|
|`tratamientoNutricional.kcal`|ProfileSection → Nutrición → No hay input directo para `nutrition.kcal` en el editor actual|
|`tratamientoNutricional.proteina`|ProfileSection → Nutrición → No hay input para `nutrition.prot`|
|`tratamientoNutricional.carbos`|ProfileSection → Nutrición → No hay input para `nutrition.carbs`|
|`tratamientoNutricional.grasas`|ProfileSection → Nutrición → No hay input para `nutrition.grasas`|

### Tratamiento Entrenamiento (pills)
|`tratamientoEntrenamiento.estrategia`|ProfileSection → No hay input para `training.estrategia`|
|`tratamientoEntrenamiento.dias`|ProfileSection → No hay input para `training.dias`|
|`tratamientoEntrenamiento.cardio`|ProfileSection → No hay input para `training.cardio`|
|`tratamientoEntrenamiento.pasos`|ProfileSection → Actividad Física → Pasos (`person.pasos`)|

### Clínico (Retroalimentación, Diagnóstico, Objetivos)
|`clinico.retroalimentacion`|ProfileSection → No hay inputs directos para `feedback.r1/r2/r3` en ProfileSection|
|`clinico.diagnostico`|ProfileSection → No hay inputs directos para `diagnosis.d1/d2/d3`|
|`clinico.objetivos`|ProfileSection → No hay inputs directos para `objectives.o1/o2/o3`|

---

## SEMANA

### Por cada día (LUN-DOM)
|`d.full`|Hardcodeado (LUNES, MARTES, etc.)|
|`isToday`|Automático según fecha actual|
|`m.length` (comidas)|Cantidad de comidas cargadas para el día|
|`r.tipo`|CalendarSection → tipo de actividad|
|`r.duracion`|CalendarSection / RoutineSection|
|`s.length` (suplementos)|Cantidad de suplementos|
|Comidas, Ejercicios, Suplementos|Mismo origen que en HOY|

---

## GUÍA

|Contenido|DataSection → Configuración → Guía / Glosario|
|Secciones|`guideContent.js` (hardcodeado) o editor de guía|
|Glosario|`guideContent.js` (hardcodeado) o editor de glosario|

---

## Inputs faltantes en el editor

Los siguientes datos se muestran en la vista paciente pero **no tienen inputs editables** en el editor actual:

1. **Tratamiento Nutricional**
   - `nutrition.estrategia`
   - `nutrition.kcal`
   - `nutrition.prot` (proteína)
   - `nutrition.carbs` (carbohidratos)
   - `nutrition.grasas`

2. **Tratamiento Entrenamiento**
   - `training.estrategia`
   - `training.dias`
   - `training.cardio`
   - `training.pasos` (este sí está en ProfileSection como `person.pasos`)

3. **Clínico**
   - `feedback.r1`, `r2`, `r3`
   - `diagnosis.d1`, `d2`, `d3`
   - `objectives.o1`, `o2`, `o3`

4. **Estadísticas**
   - `stats.descanso` (horas de descanso)

---

## Estructura de datos de la vista paciente

```js
{
  person: {
    nombre: string,
    objetivo: string,
    pasos: string,
    // ...más campos de person
  },
  proximaConsulta: string | null,
  meals: {
    [dayKey]: [
      {
        time: string,
        hour: string,
        kcal: number,
        macros: { proteinas: number, carbos: number, grasas: number },
        foods: [
          { name: string, grams: string, unit: string, kcal: number }
        ]
      }
    ]
  },
  routines: {
    [dayKey]: {
      tipo: 'lower' | 'upper' | 'rest' | 'full',
      actividad: string,
      duracion: string,
      ejercicios: [
        {
          ejercicio: string,
          secuencia: string,
          tecnica: string,
          sets: string,
          reps: string,
          descanso: string,
          rir: string,
          nota: string
        }
      ]
    }
  },
  supplements: {
    [dayKey]: [
      { nombre: string, dosis: string, hora: string }
    ]
  },
  calentamientos: {
    lower: [
      {
        fase: 'GENERAL' | 'MOVILIDAD' | 'ESPECÍFICO',
        opciones: [{ ejercicio: string, detalle: string, tipo: string, grupo: string }],
        individuales: [{ ejercicio: string, detalle: string, tipo: string, grupo: string }]
      }
    ],
    upper: [/* mismo formato */]
  },
  stats: {
    adherencia: number,
    nutricion: number,
    entreno: number,
    cardio: number,
    descanso: string
  },
  avances: {
    peso: { label: string, anterior: string, actual: string, delta: number },
    abdomen: { label: string, anterior: string, actual: string, delta: number },
    grasaKg: { label: string, anterior: string, actual: string, delta: number },
    grasaPct: { label: string, anterior: string, actual: string, delta: number },
    pliegue: { label: string, anterior: string, actual: string, delta: number }
  },
  estadisticas: {
    adherencia: number,
    nutricion: number,
    entrenamiento: number,
    cardio: number,
    descanso: string
  },
  tratamientoNutricional: {
    estrategia: string,
    kcal: string,
    proteina: string,
    carbos: string,
    grasas: string
  },
  tratamientoEntrenamiento: {
    estrategia: string,
    dias: string,
    cardio: string,
    pasos: string
  },
  clinico: {
    retroalimentacion: string[],
    diagnostico: string[],
    objetivos: string[]
  },
  guia: [],
  glosario: [],
  fechaConsulta: string
}
```

---

## Mapeo editor → vista paciente (`usePatientData.js`)

|Campo vista paciente|Origen en editor (`editorData`)|
|---|---|
|`person.nombre`|`person.nombre`|
|`person.pasos`|`person.pasos`|
|`tratamientoNutricional.estrategia`|`nutrition.estrategia`|
|`tratamientoNutricional.kcal`|`nutrition.kcal`|
|`tratamientoNutricional.proteina`|`parseMacro(nutrition.prot)`|
|`tratamientoNutricional.carbos`|`parseMacro(nutrition.carbs)`|
|`tratamientoNutricional.grasas`|`parseMacro(nutrition.grasas)`|
|`tratamientoEntrenamiento.estrategia`|`training.estrategia`|
|`tratamientoEntrenamiento.dias`|`training.dias`|
|`tratamientoEntrenamiento.cardio`|`training.cardio`|
|`tratamientoEntrenamiento.pasos`|`person.pasos`|
|`clinico.retroalimentacion`|`[feedback.r1, feedback.r2, feedback.r3].filter(Boolean)`|
|`clinico.diagnostico`|`[diagnosis.d1, diagnosis.d2, diagnosis.d3].filter(Boolean)`|
|`clinico.objetivos`|`[objectives.o1, objectives.o2, objectives.o3].filter(Boolean)`|
|`avances.peso.anterior`|`person.pesoIni`|
|`avances.peso.actual`|`evolution.cells[ultima consulta].peso`|
|`estadisticas.adherencia`|`stats.adherencia`|
|`estadisticas.nutricion`|`stats.nutricion`|
|`estadisticas.entrenamiento`|`stats.entreno`|
|`estadisticas.cardio`|`stats.cardio`|
|`estadisticas.descanso`|`stats.descanso`|
|`proximaConsulta`|`fechaConsulta` (fecha + 28 días)|
|`meals`|`meals` (directo)|
|`routines`|`calendar` + `routines`|
|`supplements`|`supplements` (directo)|
|`calentamientos`|`warmupUpper` + `warmupLower`|
