export const initialPerson = null;
export const initialStats = {};
export const initialNutrition = {};
export const initialTraining = {};
export const initialCalendar = [];

export const initialWarmupUpper = {
  general: [
    { id: 'ex-200', tipo: "Simple", grupo: "1", video: "_", ejercicio: "Caminadora", sets: "1", reps: "5 MIN", pausa: "x", notas: "Mantén un ritmo constante y moderado" },
    { id: 'ex-201', tipo: "Simple", grupo: "1", video: "_", ejercicio: "Elíptica", sets: "1", reps: "5 MIN", pausa: "x", notas: "Mantén un ritmo constante y moderado" },
    { id: 'ex-202', tipo: "Simple", grupo: "1", video: "_", ejercicio: "Bicicleta", sets: "1", reps: "5 MIN", pausa: "x", notas: "Mantén un ritmo constante y moderado" }
  ],
  movilidad: [
    { id: 'ex-210', tipo: "Biserie", grupo: "2", video: "_", ejercicio: "Movimiento cuatro puntos hombro", sets: "2", reps: "15-20", pausa: "30 seg", notas: "Movimientos controlados" },
    { id: 'ex-211', tipo: "Biserie", grupo: "2", video: "_", ejercicio: "Rotación externa hombro liga / polea", sets: "2", reps: "15-20", pausa: "30 seg", notas: "Movimientos controlados" },
    { id: 'ex-212', tipo: "Biserie", grupo: "3", video: "_", ejercicio: "Extensión de brazo hombro liga / polea", sets: "2", reps: "15-20", pausa: "30 seg", notas: "Movimientos controlados" },
    { id: 'ex-213', tipo: "Biserie", grupo: "3", video: "_", ejercicio: "Extensión de tríceps liga / polea", sets: "2", reps: "15-20", pausa: "30 seg", notas: "Peso ligero-moderado" }
  ],
  específico: [
    { id: 'ex-214', tipo: "Circuito", grupo: "4", video: "_", ejercicio: "Elevaciones laterales con mancuernas liga / polea", sets: "2", reps: "15-20", pausa: "30 seg", notas: "Movimientos controlados" },
    { id: 'ex-215', tipo: "Circuito", grupo: "4", video: "_", ejercicio: "Pull down liga / polea", sets: "2", reps: "15-20", pausa: "30 seg", notas: "Activar dorsales" },
    { id: 'ex-216', tipo: "Circuito", grupo: "4", video: "_", ejercicio: "Pull over liga / polea", sets: "2", reps: "15-20", pausa: "30 seg", notas: "Movimientos controlados" },
    { id: 'ex-217', tipo: "Circuito", grupo: "4", video: "_", ejercicio: "Curl de bíceps liga / mancuernas", sets: "2", reps: "15-20", pausa: "30 seg", notas: "No te columpees" }
  ]
};

export const initialWarmupLower = {
  general: [
    { id: 'ex-200', tipo: "Biserie", grupo: "5", video: "_", ejercicio: "Caminadora", sets: "1", reps: "5 MIN", pausa: "x", notas: "Mantén un ritmo constante y moderado" },
    { id: 'ex-201', tipo: "Simple", grupo: "5", video: "_", ejercicio: "Elíptica", sets: "1", reps: "5 MIN", pausa: "x", notas: "Mantén un ritmo constante y moderado" },
    { id: 'ex-202', tipo: "Simple", grupo: "5", video: "_", ejercicio: "Bicicleta", sets: "1", reps: "5 MIN", pausa: "x", notas: "Mantén un ritmo constante y moderado" }
  ],
  movilidad: [
    { id: 'ex-203', tipo: "Biserie", grupo: "6", video: "_", ejercicio: "Extensión y flexión (rodilla)", sets: "2", reps: "15-20", pausa: "30 seg", notas: "Movimientos controlados" },
    { id: 'ex-204', tipo: "Biserie", grupo: "6", video: "_", ejercicio: "Abducción y aducción (cadera)", sets: "2", reps: "15-20", pausa: "30 seg", notas: "Movimientos controlados" }
  ],
  específico: [
    { id: 'ex-205', tipo: "Circuito", grupo: "7", video: "_", ejercicio: "Plancha frontal", sets: "2", reps: "15-20", pausa: "30 seg", notas: "Espalda baja recta" },
    { id: 'ex-206', tipo: "Circuito", grupo: "7", video: "_", ejercicio: "Abs crunch acostado", sets: "2", reps: "15-20", pausa: "30 seg", notas: "Exhala al contraer" },
    { id: 'ex-207', tipo: "Circuito", grupo: "7", video: "_", ejercicio: "Aductor", sets: "2", reps: "15-20", pausa: "30 seg", notas: "Movimientos controlados" },
    { id: 'ex-208', tipo: "Circuito", grupo: "7", video: "_", ejercicio: "Extensión de cuádriceps", sets: "2", reps: "15-20", pausa: "30 seg", notas: "Movimientos controlados" },
    { id: 'ex-209', tipo: "Circuito", grupo: "7", video: "_", ejercicio: "Curl isquios / femoral acostado", sets: "2", reps: "15-20", pausa: "30 seg", notas: "Movimientos controlados" }
  ]
};

export const initialRoutines = [];
export const initialEvolution = {
  dates: [],
  cells: {},
  consultas: [],
  inBodyConfig: {
    peso: { min: 40, max: 120, idealMin: 60, idealMax: 90 },
    muscular: { min: 20, max: 60, idealMin: 30, idealMax: 50 },
    grasaPct: { min: 5, max: 40, idealMin: 12, idealMax: 22 },
  }
};
export const initialFechaConsulta = new Date().toISOString().split('T')[0];
export const initialMeals = [];
export const initialSupplements = [];
export const initialSupplementsStrategy = '';
export const initialFeedback = {};
export const initialDiagnosis = {};
export const initialObjectives = {};
export const initialHabits = {};
export const initialClass = '{"titulo":"","descripcion":"","notas":""}';
export const initialGuideline = '{"titulo":"","descripcion":"","notas":""}';
