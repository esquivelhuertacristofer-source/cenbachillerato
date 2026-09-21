/**
 * Datos y matemática del laboratorio "Estadística: variables, población y
 * muestra" (PM-VI-P01, progresión 1 de Pensamiento Matemático VI).
 *
 * Anclas:
 *   - A1 lectura «Estadística: la ciencia de los datos al servicio de la toma
 *     de decisiones»: marco teórico verbatim y las variables del clasificador.
 *   - A2 quiz de opción múltiple: reto evaluable (6 reactivos verbatim).
 *   - A4 quiz verdadero/falso: hechos y el ejemplo de 200 de 1 500
 *     estudiantes. A5 glosario: 6 términos y los ejemplos de descriptiva e
 *     inferencial.
 *
 * Datos puros (sin three ni React): seguro de importar desde el shell y
 * desde scripts de verificación.
 */

import type { QuizEvaluable } from "./_reto-quiz";

/* ── Modos ────────────────────────────────────────────────────────────── */

export type Modo = "variables" | "poblacion" | "inferencia";
export const MODOS: Modo[] = ["variables", "poblacion", "inferencia"];

export const MODOS_DEF: Record<Modo, { etq: string; subtitulo: string; icono: string; color: string }> = {
  variables: { etq: "Tipos de variables", subtitulo: "Nominal, ordinal, discreta o continua", icono: "fa-shapes", color: "#c084fc" },
  poblacion: { etq: "Población y muestra", subtitulo: "Censo contra encuesta", icono: "fa-people-group", color: "#22d3ee" },
  inferencia: { etq: "Descriptiva o inferencial", subtitulo: "Resumir la muestra o hablar de todos", icono: "fa-chart-simple", color: "#fbbf24" },
};

export function mulberry32(semilla: number) {
  let t = semilla >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function barajar<T>(xs: T[], rnd: () => number): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function num(x: number, dec = 0): string {
  const s = Math.abs(x).toFixed(dec);
  const [ent, frac] = s.split(".");
  const conMiles = ent!.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${x < 0 ? "−" : ""}${conMiles}${frac ? `.${frac}` : ""}`;
}

/* ════════════════════════════════════════════════════════════════════════
 * 1. TIPOS DE VARIABLES
 * ════════════════════════════════════════════════════════════════════════ */

export type TipoVar = "nominal" | "ordinal" | "discreta" | "continua";
export const TIPOS: TipoVar[] = ["nominal", "ordinal", "discreta", "continua"];

export const TIPOS_DEF: Record<TipoVar, { etq: string; rama: "Cualitativa" | "Cuantitativa"; color: string; pregunta: string }> = {
  nominal: { etq: "Nominal", rama: "Cualitativa", color: "#f472b6", pregunta: "Categorías sin orden natural" },
  ordinal: { etq: "Ordinal", rama: "Cualitativa", color: "#c084fc", pregunta: "Categorías con orden definido" },
  discreta: { etq: "Discreta", rama: "Cuantitativa", color: "#38bdf8", pregunta: "Se cuenta en valores enteros" },
  continua: { etq: "Continua", rama: "Cuantitativa", color: "#34d399", pregunta: "Cualquier valor de un intervalo" },
};

export interface VariableDef {
  id: string;
  nombre: string;
  ejemplos: string;
  tipo: TipoVar;
  fuente: string;
  /** Por qué es de ese tipo (se muestra al acertar o al fallar dos veces). */
  porque: string;
}

export const VARIABLES: VariableDef[] = [
  { id: "ojos", nombre: "Color de ojos", ejemplos: "café · negro · verde", tipo: "nominal", fuente: "Lectura A1", porque: "Son categorías y ningún color va antes que otro." },
  { id: "municipio", nombre: "Municipio de nacimiento", ejemplos: "Oaxaca de Juárez · Mérida · León", tipo: "nominal", fuente: "Lectura A1", porque: "Son nombres de lugares, sin un orden natural." },
  { id: "partido", nombre: "Partido político", ejemplos: "partido A · partido B · partido C", tipo: "nominal", fuente: "Lectura A1", porque: "Son categorías sin orden." },
  { id: "sangre", nombre: "Tipo de sangre", ejemplos: "O+ · A− · B+ · AB+", tipo: "nominal", fuente: "Glosario A5", porque: "Aunque lleva letras y signos, es una categoría y ninguna es «mayor»." },
  { id: "civil", nombre: "Estado civil", ejemplos: "soltero · casado · unión libre", tipo: "nominal", fuente: "Glosario A5", porque: "Son categorías sin orden natural." },
  { id: "educativo", nombre: "Nivel educativo", ejemplos: "primaria · secundaria · bachillerato · licenciatura", tipo: "ordinal", fuente: "Lectura A1", porque: "Son categorías con un orden definido." },
  { id: "satisfaccion", nombre: "Grado de satisfacción", ejemplos: "muy insatisfecho … neutral … muy satisfecho", tipo: "ordinal", fuente: "Lectura A1", porque: "Las respuestas son categorías que van de menos a más." },
  { id: "satisfaccion15", nombre: "Nivel de satisfacción (1-5)", ejemplos: "1 · 2 · 3 · 4 · 5", tipo: "ordinal", fuente: "Glosario A5", porque: "El número solo marca el lugar en una escala de categorías: un 4 no es «el doble de satisfecho» que un 2." },
  { id: "pobreza", nombre: "Nivel de pobreza", ejemplos: "no pobre · moderada · extrema", tipo: "ordinal", fuente: "Lectura A1", porque: "Son categorías ordenadas de menor a mayor carencia." },
  { id: "hijos", nombre: "Número de hijos", ejemplos: "0 · 1 · 2 · 3", tipo: "discreta", fuente: "Lectura A1", porque: "Se cuenta en enteros: no hay 1.5 hijos." },
  { id: "reprobadas", nombre: "Número de materias reprobadas", ejemplos: "0 · 1 · 2", tipo: "discreta", fuente: "Lectura A1", porque: "Se cuenta en valores enteros." },
  { id: "hermanos", nombre: "Número de hermanos", ejemplos: "0 · 1 · 2 · 4", tipo: "discreta", fuente: "Glosario A5", porque: "Se cuenta en valores enteros." },
  { id: "cuartos", nombre: "Número de cuartos en la vivienda", ejemplos: "1 · 2 · 3 · 5", tipo: "discreta", fuente: "Lectura A1", porque: "Se cuenta en enteros, como en la ENIGH." },
  { id: "estatura", nombre: "Estatura", ejemplos: "1.62 m · 1.705 m · 1.584 m", tipo: "continua", fuente: "Lectura A1", porque: "Se mide y puede tomar cualquier valor dentro de un intervalo." },
  { id: "temperatura", nombre: "Temperatura", ejemplos: "18.4 °C · 22.07 °C · 31 °C", tipo: "continua", fuente: "Lectura A1", porque: "Se mide: entre dos temperaturas siempre cabe otra." },
  { id: "tiempo", nombre: "Tiempo", ejemplos: "12.8 s · 3 min 41.2 s", tipo: "continua", fuente: "Lectura A1", porque: "Se mide con tanta precisión como permita el instrumento." },
  { id: "ingreso", nombre: "Ingreso mensual en pesos", ejemplos: "8,750.50 · 12,300 · 15,410.25", tipo: "continua", fuente: "Quiz A2", porque: "Puede tomar cualquier valor real positivo, como 8,750.50 pesos." },
  { id: "peso", nombre: "Peso en kg", ejemplos: "54.3 · 61.08 · 70.5", tipo: "continua", fuente: "Glosario A5", porque: "Se mide y admite cualquier valor dentro de un intervalo." },
];

export const POR_RONDA = 8;

/** Una ronda de 8 variables con al menos una de cada tipo, en orden aleatorio. */
export function rondaVariables(rnd: () => number = Math.random): VariableDef[] {
  const una = TIPOS.map((t) => barajar(VARIABLES.filter((v) => v.tipo === t), rnd)[0]!);
  const resto = barajar(
    VARIABLES.filter((v) => !una.includes(v)),
    rnd,
  ).slice(0, POR_RONDA - una.length);
  return barajar([...una, ...resto], rnd);
}

/** Ronda inicial fija (sin azar en el primer render). */
export const RONDA_INICIAL: VariableDef[] = rondaVariables(mulberry32(101));

export function estrellasPorErrores(errores: number): number {
  return errores === 0 ? 3 : errores <= 2 ? 2 : 1;
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. POBLACIÓN Y MUESTRA
 * ════════════════════════════════════════════════════════════════════════ */

export const N_POBLACION = 1500;
export const CATEGORIAS = ["0", "1", "2", "3", "4 o más"];
export const COLORES_CAT = ["#f472b6", "#fbbf24", "#34d399", "#38bdf8", "#a78bfa"];

/** Estudiantes por número de hermanos: 0, 1, 2, 3, 4 y 5. Ilustrativo. */
const REPARTO: [number, number][] = [
  [0, 270],
  [1, 510],
  [2, 405],
  [3, 195],
  [4, 90],
  [5, 30],
];

/** Hermanos de cada estudiante, en el orden en que están sentados. */
export const HERMANOS: number[] = barajar(
  REPARTO.flatMap(([h, k]) => Array.from({ length: k }, () => h)),
  mulberry32(2024),
);

export const categoriaDe = (h: number) => Math.min(4, h);

export const TAMANOS = [20, 50, 200, 500];

export function muestraAleatoria(n: number, rnd: () => number = Math.random): number[] {
  // Fisher-Yates parcial.
  const idx = Array.from({ length: N_POBLACION }, (_, i) => i);
  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(rnd() * (N_POBLACION - i));
    [idx[i], idx[j]] = [idx[j]!, idx[i]!];
  }
  return idx.slice(0, n);
}

export interface Resumen {
  n: number;
  conteos: number[];
  relativas: number[];
  media: number;
}

export function resumir(indices: number[]): Resumen {
  const conteos = [0, 0, 0, 0, 0];
  let suma = 0;
  for (const i of indices) {
    const h = HERMANOS[i]!;
    conteos[categoriaDe(h)] = conteos[categoriaDe(h)]! + 1;
    suma += h;
  }
  const n = indices.length;
  return { n, conteos, relativas: conteos.map((c) => (n ? c / n : 0)), media: n ? suma / n : 0 };
}

export const TODOS = Array.from({ length: N_POBLACION }, (_, i) => i);
export const PARAMETRO = resumir(TODOS);

/** Margen de error al 95 % de una proporción, con corrección por población finita. */
export function margen95(p: number, n: number, N = N_POBLACION): number {
  if (n <= 0) return 0;
  return 1.96 * Math.sqrt((p * (1 - p)) / n) * Math.sqrt((N - n) / (N - 1));
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. DESCRIPTIVA O INFERENCIAL
 * ════════════════════════════════════════════════════════════════════════ */

export type Rama = "descriptiva" | "inferencial";

export interface Afirmacion {
  texto: string;
  rama: Rama;
  fuente: string;
  porque: string;
}

export const AFIRMACIONES: Afirmacion[] = [
  { texto: "Calcular el promedio de calificaciones de 30 estudiantes de un grupo y presentarlo en un histograma.", rama: "descriptiva", fuente: "Glosario A5", porque: "Resume los datos del grupo sin hablar de nadie más." },
  { texto: "Encuestar a 400 ciudadanos de una ciudad de 1 000 000 habitantes para estimar el porcentaje que apoya una política pública.", rama: "inferencial", fuente: "Glosario A5", porque: "Usa 400 personas para concluir algo de un millón." },
  { texto: "Un médico mide la presión arterial de 50 pacientes y concluye que el medicamento X reduce la presión en todos los adultos mayores.", rama: "inferencial", fuente: "Quiz A4", porque: "Generaliza de 50 pacientes a todos los adultos mayores." },
  { texto: "Una tienda usa sus ventas para identificar sus productos más vendidos.", rama: "descriptiva", fuente: "Glosario A5", porque: "Ordena y resume sus propios datos de venta." },
  { texto: "Un hospital decide qué tratamiento adoptar con base en ensayos clínicos.", rama: "inferencial", fuente: "Glosario A5", porque: "Los ensayos estudian a unos pacientes para decidir sobre los futuros." },
  { texto: "Una encuesta aplicada a 1,200 personas informa sobre las preferencias de millones de mexicanos.", rama: "inferencial", fuente: "Lectura A1", porque: "Pasa de una muestra de 1,200 a millones de personas." },
  { texto: "En un grupo de 20 alumnos, 8 obtienen 8 en una prueba: la frecuencia relativa es 8/20 = 40 %.", rama: "descriptiva", fuente: "Glosario A5", porque: "Solo cuenta lo que pasó en esos 20 alumnos." },
  { texto: "Calcular la media de un conjunto de datos ya conocidos.", rama: "descriptiva", fuente: "Quiz A4", porque: "Calcular la media de datos conocidos es estadística descriptiva." },
];

/* ════════════════════════════════════════════════════════════════════════
 * Contenido VERBATIM
 * ════════════════════════════════════════════════════════════════════════ */

export const TITULO_A1 = "Estadística: la ciencia de los datos al servicio de la toma de decisiones";

/** Lectura A1 — los seis párrafos, verbatim. */
export const LECTURA_A1: string[] = [
  "La estadística nació de necesidades concretas de los estados modernos: contar a la población, medir la mortalidad, distribuir recursos. John Graunt, en 1662, publicó sus Observaciones Naturales y Políticas sobre las Listas de Mortalidad de Londres, considerado el primer análisis estadístico sistemático de la historia: a partir de los registros de muertes de la ciudad, identificó patrones de mortalidad según causas y estaciones del año. Florence Nightingale, en 1858, usó gráficas innovadoras de causas de muerte durante la guerra de Crimea para convencer al Parlamento británico de que las condiciones sanitarias, y no las batallas, eran la principal causa de muerte entre los soldados. Hoy, la estadística es la base de la medicina basada en evidencia, la economía, la educación y las políticas públicas.",
  "La estadística se divide en dos grandes ramas. La estadística descriptiva se ocupa de resumir, organizar y presentar datos de un conjunto observado: calcula promedios, elabora tablas, construye gráficas. No va más allá de los datos que tiene en mano. La estadística inferencial, en cambio, usa los resultados de una muestra para sacar conclusiones sobre una población más grande. Por ejemplo, una encuesta aplicada a 1,200 personas puede darnos información estadísticamente válida sobre las preferencias de millones de mexicanos, siempre que la muestra sea representativa.",
  "Para trabajar con estadística es fundamental comprender los tipos de variables. Las variables cualitativas describen categorías o atributos: pueden ser nominales (sin orden natural, como color de ojos, municipio de nacimiento o partido político) u ordinales (con orden definido, como nivel educativo: primaria, secundaria, bachillerato, licenciatura; o grado de satisfacción: muy insatisfecho, insatisfecho, neutral, satisfecho, muy satisfecho). Las variables cuantitativas expresan cantidades numéricas: pueden ser discretas (se cuentan en valores enteros, como número de hijos, número de materias reprobadas) o continuas (pueden tomar cualquier valor real dentro de un intervalo, como estatura, temperatura, tiempo).",
  "En México existen fuentes de datos estadísticos de gran relevancia pública. El INEGI (Instituto Nacional de Estadística y Geografía) realiza el Censo de Población y Vivienda cada diez años y levanta la Encuesta Nacional de Ingresos y Gastos de los Hogares (ENIGH) periódicamente para medir condiciones de vida. El CONEVAL (Consejo Nacional de Evaluación de la Política de Desarrollo Social) mide la pobreza multidimensional en México usando datos del INEGI. El CONAPO (Consejo Nacional de Población) elabora proyecciones demográficas. La Secretaría de Salud, el IMSS y el ISSSTE generan datos sobre salud pública, mortalidad y enfermedades.",
  "Una distinción conceptual clave es la diferencia entre población y muestra. La población es el conjunto completo de todos los elementos de interés para el estudio: todos los mexicanos, todas las escuelas del país, todas las empresas de un sector. El Censo del INEGI intenta medir a toda la población cada diez años. Una muestra es un subconjunto de la población, seleccionado de forma representativa para inferir características del total. Las encuestas nacionales como la ENIGH trabajan con muestras de miles de hogares para estimar condiciones de millones.",
  "Finalmente, la ética en el manejo de datos es un tema urgente. La privacidad de los datos personales debe protegerse: los microdatos del INEGI están anonimizados para impedir identificar a personas concretas. Los sesgos de representación son otro problema serio: los grupos más marginalizados (comunidades indígenas en zonas de difícil acceso, personas en situación de calle, migrantes irregulares) frecuentemente quedan subcontados en los datos oficiales, lo que sesga las políticas diseñadas a partir de esos datos.",
];

export const SABIAS_A1 =
  "Luis Miramontes fue un químico mexicano que sintetizó la noretisterona en 1951, el componente activo de la primera píldora anticonceptiva. Su trabajo transformó la medicina y la sociedad global, y es un ejemplo de cómo la matemática y la ciencia mexicanas han cambiado el mundo.";

/** Preguntas de comprensión de la lectura A1 — verbatim. */
export const PREGUNTAS: string[] = [
  "¿Cuál es la diferencia fundamental entre la estadística descriptiva y la estadística inferencial?",
  "¿Qué tipos de variables existen y cómo se clasifican? Da un ejemplo mexicano de cada tipo.",
  "¿Qué diferencia hay entre población y muestra, y por qué el INEGI usa ambas estrategias?",
  "¿Por qué la ética en el manejo de datos estadísticos es relevante para la toma de decisiones en México?",
];

/** Hechos del quiz verdadero/falso A4 — verbatim (los falsos, con su corrección). */
export const HECHOS: string[] = [
  "La estadística descriptiva resume y organiza datos de una muestra o población sin extraer conclusiones más allá de esos datos.",
  "Calcular la media de datos conocidos es estadística descriptiva. La estadística inferencial usa muestras para hacer generalizaciones (inferencias) sobre una población.",
  "Un censo es un ejemplo de recopilación de datos de toda la población, mientras que una encuesta a 200 estudiantes de una escuela de 1500 es una muestra.",
  "Generalizar de 50 pacientes a 'todos los adultos mayores' es estadística inferencial: se extrapola más allá de los datos observados.",
  "Una variable cuantitativa continua, como la estatura en centímetros, puede tomar cualquier valor dentro de un intervalo, a diferencia de una variable cualitativa como el género.",
];

export interface GlosarioItem {
  termino: string;
  definicion: string;
  ejemplo: string;
}

/** Glosario A5 — los 6 términos verbatim. */
export const GLOSARIO: GlosarioItem[] = [
  {
    termino: "Estadística descriptiva",
    definicion: "Rama de la estadística que organiza, resume y presenta datos mediante tablas, gráficas y medidas numéricas (medias, medianas, desviaciones) sin generalizaciones más allá del conjunto de datos estudiado.",
    ejemplo: "Calcular el promedio de calificaciones de 30 estudiantes de un grupo y presentarlo en un histograma es estadística descriptiva.",
  },
  {
    termino: "Estadística inferencial",
    definicion: "Rama que usa datos de una muestra para hacer generalizaciones (inferencias) sobre una población más amplia, con un nivel de confianza o margen de error asociado.",
    ejemplo: "Encuestar a 400 ciudadanos de una ciudad de 1 000 000 habitantes para estimar el porcentaje que apoya una política pública.",
  },
  {
    termino: "Población y muestra",
    definicion: "La población es el conjunto completo de individuos u objetos de interés. La muestra es un subconjunto representativo extraído de la población para su estudio.",
    ejemplo: "Población: todos los alumnos de bachillerato de México. Muestra: 500 alumnos seleccionados al azar de 50 planteles.",
  },
  {
    termino: "Variable estadística",
    definicion: "Característica que puede tomar distintos valores en los individuos de una muestra. Se clasifica en cualitativa (categorías) o cuantitativa (números), y esta última en discreta o continua.",
    ejemplo: "Variables cualitativas: color de ojos, estado civil. Variables cuantitativas discretas: número de hijos. Continuas: estatura, temperatura.",
  },
  {
    termino: "Dato y frecuencia",
    definicion: "Un dato es la observación individual de una variable. La frecuencia es el número de veces que aparece ese valor (frecuencia absoluta) o su proporción respecto al total (frecuencia relativa).",
    ejemplo: "En un grupo de 20 alumnos, si 8 obtienen 8 en una prueba: frecuencia absoluta = 8; frecuencia relativa = 8/20 = 0.40 = 40%.",
  },
  {
    termino: "Toma de decisiones basada en datos",
    definicion: "Proceso que utiliza análisis estadístico —descriptivo e inferencial— para respaldar decisiones en salud, política, economía, ciencia y vida cotidiana, reduciendo la subjetividad.",
    ejemplo: "Un hospital usa estadística inferencial para decidir qué tratamiento adoptar con base en ensayos clínicos; una tienda usa estadística descriptiva para identificar sus productos más vendidos.",
  },
];

export const ACTIVIDAD_A5 =
  "Clasifica las siguientes variables en cualitativa nominal, cualitativa ordinal, cuantitativa discreta o cuantitativa continua: (a) tipo de sangre, (b) nivel de satisfacción (1-5), (c) número de hermanos, (d) peso en kg. Luego escribe un ejemplo de pregunta de estadística descriptiva y uno de estadística inferencial usando esas variables.";

export const FUENTE = "Material CEN Bachillerato — PM-VI. Ref.: INEGI, CONEVAL, CONAPO. Nightingale, 1858; Graunt, 1662.";

export const PROBLEMA =
  "La estadística se divide en dos grandes ramas. Para trabajar con estadística es fundamental comprender los tipos de variables. Una distinción conceptual clave es la diferencia entre población y muestra.";

export const INSTRUCCIONES: string[] = [
  "En «Tipos de variables», lee la tarjeta que baja por la máquina y envíala al contenedor de su tipo.",
  "Pregúntate primero si la variable da categorías o cantidades; después, si tiene orden o si se cuenta o se mide.",
  "Clasifica las 8 variables de la ronda: tus errores deciden las estrellas.",
  "En «Población y muestra», haz el censo de los 1 500 estudiantes y anota el parámetro.",
  "Toma varias encuestas de 200 estudiantes: cada muestra da un estadístico un poco distinto.",
  "Prueba muestras de 20 y de 500 y compara qué tanto se alejan del parámetro.",
  "En «Descriptiva o inferencial», revisa la tabla de frecuencias de tu muestra y los intervalos que estiman a toda la escuela.",
  "Revela la población y decide si cada afirmación es descriptiva o inferencial.",
  "Cierra con el quiz evaluable A2.",
];

export const IDEAS: string[] = [
  "Primero la pregunta grande: ¿la variable da categorías o cantidades?",
  "Un número no convierte una variable en cuantitativa: una escala de satisfacción del 1 al 5 sigue siendo ordinal.",
  "Lo que se cuenta es discreto; lo que se mide es continuo.",
  "El parámetro describe a la población; el estadístico, a la muestra. Cambia de muestra en muestra.",
  "Mientras más grande la muestra, más cerca suele quedar el estadístico del parámetro.",
  "Resumir los datos que tienes es descriptiva; concluir algo sobre quienes no observaste es inferencial.",
];

/* ── Reto evaluable: quiz A2, verbatim ────────────────────────────────── */

export const QUIZ_A2: QuizEvaluable = {
  titulo: "¿Cuánto sabes sobre estadística descriptiva e inferencial, tipos de variables y fuentes de datos?",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "¿Cuál es la diferencia principal entre la estadística descriptiva y la estadística inferencial?",
      opciones: [
        "La descriptiva usa graficas y la inferencial solo usa numeros",
        "La descriptiva resume y organiza los datos observados sin ir mas alla; la inferencial usa una muestra para sacar conclusiones sobre una poblacion mas grande",
        "La descriptiva es para datos cualitativos y la inferencial para datos cuantitativos",
        "Son identicas; solo tienen nombres distintos segun el contexto en que se usan",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "La estadistica descriptiva describe lo que hay en los datos sin extrapolacion: calcula medias, construye tablas y graficas del conjunto observado. La inferencial va mas alla: usa una muestra representativa para estimar parametros de la poblacion completa con un margen de error controlado. Por ejemplo, la ENIGH del INEGI usa una muestra de hogares para estimar las condiciones de vida de todos los hogares mexicanos.",
    },
    {
      enunciado: "¿Cuál de las siguientes variables es cuantitativa continua?",
      opciones: ["Numero de hijos en el hogar", "Nivel educativo (primaria, secundaria, bachillerato)", "Ingreso mensual en pesos del jefe de hogar", "Municipio de residencia del encuestado"],
      respuestaCorrecta: 2,
      retroalimentacion:
        "El ingreso mensual en pesos puede tomar cualquier valor real positivo (por ejemplo, 8,750.50 pesos), por lo que es cuantitativa continua. El numero de hijos es cuantitativa discreta (solo enteros). El nivel educativo es cualitativa ordinal (tiene orden pero no es numerica). El municipio de residencia es cualitativa nominal (sin orden natural).",
    },
    {
      enunciado: "¿Qué mide el CONEVAL en México y qué tipo de datos usa del INEGI?",
      opciones: [
        "La inflacion mensual usando precios de la canasta basica",
        "La pobreza multidimensional, usando datos de la ENIGH del INEGI sobre ingresos y acceso a servicios",
        "El desempleo trimestral mediante la ENOE",
        "Las proyecciones de poblacion futura por estado y municipio",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "El CONEVAL (Consejo Nacional de Evaluacion de la Politica de Desarrollo Social) mide la pobreza multidimensional en Mexico: considera tanto el ingreso como el acceso a derechos sociales (educacion, salud, seguridad social, alimentacion, vivienda). Para ello usa principalmente los datos de la ENIGH (Encuesta Nacional de Ingresos y Gastos de los Hogares) que levanta el INEGI cada dos anos.",
    },
    {
      enunciado: "En una encuesta del INEGI, ¿cuál es la diferencia entre la 'población' del estudio y la 'muestra'?",
      opciones: [
        "La poblacion son los encuestadores y la muestra son las preguntas del cuestionario",
        "La poblacion es el conjunto completo de todos los elementos de interes (todos los hogares mexicanos); la muestra es el subconjunto seleccionado para ser encuestado",
        "La poblacion es la muestra mas grande y la muestra es la poblacion mas pequeña; son lo mismo con diferente nombre",
        "La poblacion solo aplica al Censo y la muestra solo a encuestas urbanas",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "La poblacion es el universo completo de estudio: todos los hogares, todas las personas, o todas las empresas sobre las que se quiere obtener informacion. La muestra es el subconjunto representativo que realmente se encuesta. La ENIGH encuesta decenas de miles de hogares (muestra) para estimar condiciones de vida de los mas de 35 millones de hogares mexicanos (poblacion).",
    },
    {
      enunciado: "¿Por qué los grupos marginalizados frecuentemente quedan subcontados en las estadísticas oficiales del INEGI?",
      opciones: [
        "Porque el INEGI les hace cuestionarios mas cortos para ahorrar tiempo",
        "Porque comunidades en zonas de dificil acceso, personas en situacion de calle y migrantes irregulares son mas dificiles de alcanzar con los metodos de levantamiento estandar, generando sesgos de representacion",
        "Porque esas personas no tienen derecho a participar en las encuestas nacionales",
        "Porque el INEGI deliberadamente los excluye para mejorar las estadisticas de pobreza",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "El sesgo de representacion en datos oficiales ocurre por razones practicas y metodologicas: comunidades indigenas en zonas rurales de dificil acceso, personas sin domicilio fijo, trabajadores informales sin direccion registrada y migrantes en situacion irregular son grupos que los metodos de levantamiento estandar (basados en marcos muestrales de viviendas) dificultan alcanzar. Esto genera estadisticas que subestiman sus condiciones de vida y necesidades.",
    },
    {
      enunciado: "Florence Nightingale es considerada pionera de la estadística aplicada porque:",
      opciones: [
        "Invento la formula para calcular la media aritmetica en 1858",
        "Uso graficas innovadoras de causas de muerte durante la guerra de Crimea para convencer al Parlamento britanico de que las condiciones sanitarias, no las batallas, eran la principal causa de muerte entre soldados",
        "Fundo el primer departamento de estadistica oficial de Gran Bretana en el siglo XIX",
        "Publico las primeras tablas de mortalidad de Londres en 1662",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "Nightingale uso visualizacion de datos (sus famosos diagramas de area polar o 'diagramas de rosa') para mostrar que la mayoria de las muertes de soldados britanicos en Crimea se debian a enfermedades infecciosas prevenibles con mejores condiciones sanitarias, no a heridas de batalla. Este uso estrategico de estadisticas graficas para influir en politicas publicas la convierte en una de las fundadoras de la estadistica aplicada. Las tablas de mortalidad de 1662 son obra de John Graunt.",
    },
  ],
};
