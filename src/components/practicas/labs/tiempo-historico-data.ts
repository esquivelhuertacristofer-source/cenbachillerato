/**
 * Datos del Laboratorio — Tipos de tiempo histórico: el tiempo que medimos y el
 * tiempo que sentimos (CH-I-P02, Conciencia Histórica I).
 *
 * Contenido VERBATIM de CH-I·P02 ("El tiempo que medimos y el tiempo que
 * sentimos: tipos de tiempo histórico"). Las definiciones del glosario y sus
 * ejemplos se toman literalmente de la actividad A5 (glosario interactivo); las
 * afirmaciones del cuestionario, de la A4 (V/F); los hitos de la línea del
 * tiempo, de la descripción accesible de la A1 (infografía). Los ejemplos a
 * clasificar por duración son los casos que la propia A5 clasifica de forma
 * explícita para «Duración histórica (Braudel)», ampliados con los puntos clave
 * de la A1.
 */

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 1 — ¿Larga, mediana o corta duración? (clasifica por la duración de
 * Braudel — las únicas categorías de duración que define la fuente, A5)
 * ───────────────────────────────────────────────────────────────────────── */
export type Duracion = "larga" | "mediana" | "corta";

export const DURACION_INFO: Record<
  Duracion,
  { titulo: string; subtitulo: string; icono: string }
> = {
  larga: {
    titulo: "Larga duración",
    subtitulo: "Estructuras lentas: marcos casi inmóviles que cambian a lo largo de siglos (geografía, clima, mentalidades).",
    icono: "fa-mountain",
  },
  mediana: {
    titulo: "Mediana duración",
    subtitulo: "Coyunturas: procesos que se despliegan a lo largo de años o décadas (ciclos económicos, sociales).",
    icono: "fa-wave-square",
  },
  corta: {
    titulo: "Tiempo corto",
    subtitulo: "Eventos concretos: acontecimientos puntuales que ocurren en días, horas o instantes.",
    icono: "fa-bolt",
  },
};

export const ITEMS_DURACION: { id: string; texto: string; duracion: Duracion }[] = [
  { id: "du-clima", texto: "El clima y la geografía de una región", duracion: "larga" },
  { id: "du-crisis", texto: "Una crisis económica", duracion: "mediana" },
  { id: "du-batalla", texto: "Una batalla", duracion: "corta" },
  { id: "du-estructura", texto: "Las estructuras lentas que apenas cambian", duracion: "larga" },
  { id: "du-coyuntura", texto: "Las coyunturas que duran años o décadas", duracion: "mediana" },
  { id: "du-evento", texto: "Un evento histórico concreto", duracion: "corta" },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 2 — La línea del tiempo cronológico (ordena de lo más antiguo a lo más
 * reciente los hitos de la historia mexicana que la infografía A1 ubica en su
 * línea del tiempo del siglo XV al XXI). Verbatim de la descripción accesible.
 * ───────────────────────────────────────────────────────────────────────── */
export const HITOS: { id: string; orden: number; anio: string; texto: string; etapa: string }[] = [
  { id: "hi-tenochtitlan", orden: 0, anio: "1521", texto: "Caída de México-Tenochtitlan", etapa: "Siglo XVI" },
  { id: "hi-independencia", orden: 1, anio: "1821", texto: "Independencia", etapa: "Siglo XIX" },
  { id: "hi-revolucion", orden: 2, anio: "1910", texto: "Revolución", etapa: "Siglo XX" },
  { id: "hi-constitucion", orden: 3, anio: "1917", texto: "Constitución", etapa: "Siglo XX" },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 3 — Empareja tipo de tiempo y definición (glosario A5, verbatim)
 * ───────────────────────────────────────────────────────────────────────── */
export const PARES: { id: string; termino: string; definicion: string; ejemplo: string }[] = [
  {
    id: "gl-cronologico",
    termino: "Tiempo cronológico",
    definicion: "Medición lineal y cuantitativa del tiempo mediante unidades convencionales (segundos, años, siglos). Es la base de la datación histórica y el calendario.",
    ejemplo: "La Revolución Francesa duró cronológicamente de 1789 a 1799: diez años que se pueden medir y subdividir con precisión.",
  },
  {
    id: "gl-ciclico",
    termino: "Tiempo cíclico",
    definicion: "Concepción del tiempo como una sucesión de ciclos o fases que se repiten regularmente, vinculada a fenómenos naturales (estaciones, cosechas, ciclos lunares) y cosmológicos.",
    ejemplo: "El calendario agrícola mesoamericano organizaba las actividades humanas según los ciclos de la lluvia, la siembra y la cosecha, concibiendo el tiempo como circular.",
  },
  {
    id: "gl-subjetivo",
    termino: "Tiempo subjetivo",
    definicion: "Percepción personal y emocional del tiempo, que varía según la experiencia del individuo o la comunidad. No coincide necesariamente con el tiempo cronológico.",
    ejemplo: "Una hora de espera en una sala de urgencias se siente más larga que una hora de juego; esta diferencia perceptual es el tiempo subjetivo.",
  },
  {
    id: "gl-calendario",
    termino: "Calendario",
    definicion: "Sistema de organización del tiempo que divide el año en meses, semanas y días, basado en ciclos astronómicos (solar, lunar o lunisolar). Cada cultura ha desarrollado el suyo.",
    ejemplo: "El calendario gregoriano, usado mundialmente, se basa en el año solar de 365.25 días; el calendario maya Haab también usaba 365 días pero integrado en un sistema ritual.",
  },
  {
    id: "gl-braudel",
    termino: "Duración histórica (Braudel)",
    definicion: "Concepto del historiador Fernand Braudel que distingue tres tiempos históricos: la larga duración (estructuras lentas), la mediana duración (coyunturas) y el tiempo corto (eventos concretos).",
    ejemplo: "El clima y la geografía son de larga duración; una crisis económica es de mediana duración; una batalla es de tiempo corto.",
  },
  {
    id: "gl-anacronismo",
    termino: "Anacronismo",
    definicion: "Error histórico que consiste en atribuir a una época ideas, objetos, valores o prácticas propios de otra época, generalmente trasladando el presente al pasado.",
    ejemplo: "Imaginar que los aztecas usaban teléfonos celulares o que los griegos antiguos pensaban como ciudadanos democráticos modernos son ejemplos de anacronismo.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * Cuestionario de comprensión (V/F de A4, verbatim).
 * Renderizado como opción doble Verdadero / Falso.
 * ───────────────────────────────────────────────────────────────────────── */
export const QUIZ: {
  pregunta: string;
  opciones: [string, string];
  correcta: 0 | 1;
  retro: string;
}[] = [
  {
    pregunta: "El tiempo cronológico mide el paso del tiempo de forma lineal y cuantitativa, usando unidades como segundos, años, décadas o siglos.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto. El tiempo cronológico es el tiempo del reloj y el calendario: lineal, mensurable y universal. Es el que usan la historia y las ciencias para fechar y ordenar eventos.",
  },
  {
    pregunta: "Todas las culturas del mundo han medido el tiempo de la misma manera y con los mismos calendarios a lo largo de la historia.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "Falso. Las culturas han desarrollado calendarios muy diversos: el gregoriano, el maya (Haab y Tzolkin), el islámico, el chino, el hebreo, entre otros. Cada uno responde a concepciones cosmológicas y sociales propias.",
  },
  {
    pregunta: "El tiempo cíclico concibe la historia como una sucesión de etapas que se repiten, como estaciones o ciclos agrícolas, a diferencia del tiempo lineal que avanza sin repetición.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto. Muchas culturas antiguas (mayas, mesopotámicas, hinduistas) concibieron el tiempo como ciclos que se repiten eternamente. El tiempo lineal, en cambio, es propio de las concepciones judeocristianas y modernas.",
  },
  {
    pregunta: "El tiempo subjetivo es idéntico al tiempo cronológico porque ambos se miden en horas y minutos.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "Falso. El tiempo subjetivo es la percepción personal y emocional del tiempo: una hora puede sentirse larga o corta según la experiencia vivida. Es cualitativamente distinto del tiempo cronológico, que es objetivo y mensurable.",
  },
  {
    pregunta: "El calendario maya integra dos ciclos entrelazados —el Haab (365 días) y el Tzolkin (260 días)— que se combinan para formar la Rueda Calendárica (ciclo de 52 años).",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto. El sistema calendárico maya es sofisticado: el Haab es el año solar, el Tzolkin es el año ritual, y la Cuenta Larga mide grandes períodos históricos. Juntos forman la Rueda Calendárica que se repite cada 52 años.",
  },
];

/** Dato verbatim de la A1 (contexto mexicano de la infografía). */
export const DATO_TIEMPO =
  "México es uno de los países con mayor diversidad de concepciones del tiempo en el mundo: los 68 pueblos indígenas reconocidos constitucionalmente tienen sus propios calendarios, ciclos festivos y formas de organizar la memoria colectiva. El INAH y el CIESAS han documentado que no son «supervivencias del pasado», sino sistemas vivos que coexisten con el calendario gregoriano.";
