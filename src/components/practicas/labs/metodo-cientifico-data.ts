/**
 * Datos y modelo del laboratorio "Método científico: el experimento
 * controlado y la medición" (CNEYT-I-P06, progresión 9 de Ciencias
 * Naturales, Experimentales y Tecnología I).
 *
 * Anclas:
 *   - A1 lectura «El método científico: cómo conocemos la naturaleza»: marco
 *     teórico verbatim.
 *   - A2 quiz «Pasos del método científico» y A6 ejercicio «Medición:
 *     conversión de unidades»: retos evaluables (verbatim).
 *   - A4 quiz verdadero/falso: hechos. A5 glosario: 6 términos. La hipótesis
 *     de las plantas y la luz es la del quiz A2 y del glosario A5.
 *
 * El crecimiento de las plantas es un MODELO ILUSTRATIVO: no reproduce datos
 * de una especie concreta; solo respeta que más luz y un riego adecuado dan
 * más crecimiento, con variación natural entre plantas.
 *
 * Datos puros (sin three ni React).
 */

import type { QuizEvaluable } from "./_reto-quiz";
import type { RetoNumericoData } from "./_reto-numerico";

/* ── Modos ────────────────────────────────────────────────────────────── */

export type Modo = "experimento" | "replicas" | "medicion";
export const MODOS: Modo[] = ["experimento", "replicas", "medicion"];

export const MODOS_DEF: Record<Modo, { etq: string; subtitulo: string; icono: string; color: string }> = {
  experimento: { etq: "Experimento controlado", subtitulo: "Hipótesis, variables y conclusión", icono: "fa-seedling", color: "#4ade80" },
  replicas: { etq: "Réplicas y análisis", subtitulo: "Cinco plantas por grupo", icono: "fa-chart-column", color: "#38bdf8" },
  medicion: { etq: "Medición", subtitulo: "Instrumento, incertidumbre y unidades", icono: "fa-ruler", color: "#fbbf24" },
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

/** Normal estándar por Box-Muller. */
function normal(rnd: () => number): number {
  const u = Math.max(1e-9, rnd());
  const v = rnd();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function num(x: number, dec = 0): string {
  const s = Math.abs(x).toFixed(dec);
  const [ent, frac] = s.split(".");
  const conMiles = ent!.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${x < 0 ? "−" : ""}${conMiles}${frac ? `.${frac}` : ""}`;
}

/* ════════════════════════════════════════════════════════════════════════
 * 1. EXPERIMENTO CONTROLADO
 * ════════════════════════════════════════════════════════════════════════ */

export const GRUPOS = ["A", "B", "C"] as const;
export type Grupo = (typeof GRUPOS)[number];
export const COLOR_GRUPO: Record<Grupo, string> = { A: "#f472b6", B: "#fbbf24", C: "#38bdf8" };

export const DIAS = 21;
export const LUZ_MAX = 16;
export const AGUA_BASE = 200;

export interface Hipotesis {
  id: string;
  texto: string;
  falsable: boolean;
  porque: string;
  fuente: string;
}

export const HIPOTESIS: Hipotesis[] = [
  { id: "luz", texto: "Las plantas crecen más rápido con más luz solar.", falsable: true, porque: "Predice algo medible: con más horas de luz, más centímetros en el mismo tiempo. Los datos pueden contradecirla.", fuente: "Quiz A2" },
  { id: "vital", texto: "Las plantas crecen gracias a una energía vital invisible que no puede medirse.", falsable: false, porque: "Si esa energía no puede medirse, ningún resultado podría refutarla: no es científica.", fuente: "Ejemplo del laboratorio" },
  { id: "quiza", texto: "Con más luz, las plantas quizá crezcan más o quizá no.", falsable: false, porque: "Acepta cualquier resultado, así que ningún dato podría refutarla.", fuente: "Ejemplo del laboratorio" },
];

export interface Diseno {
  /** Horas de luz al día de cada grupo (variable independiente). */
  luz: Record<Grupo, number>;
  /** Mililitros de agua al día de cada grupo (variable de control). */
  agua: Record<Grupo, number>;
  /** Temperatura en °C de cada grupo (variable de control). */
  temperatura: Record<Grupo, number>;
}

export const DISENO_INICIAL: Diseno = {
  luz: { A: 4, B: 8, C: 12 },
  agua: { A: AGUA_BASE, B: AGUA_BASE, C: AGUA_BASE },
  temperatura: { A: 22, B: 22, C: 22 },
};

/** Factor de luz: sin luz casi no hay crecimiento; se satura hacia las 14 h. */
export function factorLuz(h: number): number {
  return 0.08 + 0.92 * (1 - Math.exp(-h / 6));
}

/** Factor de riego: óptimo cerca de 250 ml; poca o demasiada agua frenan. */
export function factorAgua(ml: number): number {
  return Math.max(0.15, 1 - ((ml - 250) / 260) ** 2);
}

/** Factor de temperatura: óptimo en 24 °C. */
export function factorTemperatura(c: number): number {
  return Math.max(0.2, 1 - ((c - 24) / 14) ** 2);
}

/** Crecimiento esperado en cm por día, sin variación entre plantas. */
export function ritmo(luz: number, agua: number, temp: number): number {
  return 0.62 * factorLuz(luz) * factorAgua(agua) * factorTemperatura(temp);
}

export const ALTURA_INICIAL = 2.0;

/** Altura (cm) de una planta en el día d; `vigor` (≈1) es su variación natural. */
export function altura(luz: number, agua: number, temp: number, dia: number, vigor = 1): number {
  return ALTURA_INICIAL + ritmo(luz, agua, temp) * vigor * dia;
}

export type Control = "ok" | "sinVariar" | "roto";

/** ¿El diseño pone a prueba la luz y deja fijo todo lo demás? */
export function revisarDiseno(d: Diseno): { control: Control; detalle: string } {
  const luces = GRUPOS.map((g) => d.luz[g]);
  const aguas = GRUPOS.map((g) => d.agua[g]);
  const temps = GRUPOS.map((g) => d.temperatura[g]);
  const iguales = (xs: number[]) => xs.every((x) => x === xs[0]);
  if (!iguales(aguas) || !iguales(temps)) {
    const cual = !iguales(aguas) && !iguales(temps) ? "el agua y la temperatura" : !iguales(aguas) ? "el agua" : "la temperatura";
    return { control: "roto", detalle: `Además de la luz cambió ${cual}: si una planta crece más, no sabrás cuál de las dos variables fue.` };
  }
  if (iguales(luces)) return { control: "sinVariar", detalle: "Los tres grupos reciben la misma luz: la variable independiente no cambia, así que no se pone a prueba la hipótesis." };
  return { control: "ok", detalle: "Solo cambia la luz; el agua y la temperatura son iguales para todos. Cualquier diferencia se puede atribuir a la luz." };
}

export type Conclusion = "apoya" | "refuta" | "noConcluyente";

export const CONCLUSIONES: { id: Conclusion; texto: string }[] = [
  { id: "apoya", texto: "Los datos apoyan la hipótesis" },
  { id: "refuta", texto: "Los datos refutan la hipótesis" },
  { id: "noConcluyente", texto: "El experimento no permite concluir" },
];

/**
 * La conclusión correcta para un diseño y sus alturas finales. Con controles
 * intactos, la hipótesis se apoya si el grupo con más luz supera al de menos
 * luz por más de la variación entre plantas (0.8 cm).
 */
export function conclusionCorrecta(d: Diseno, finales: Record<Grupo, number>): Conclusion {
  const { control } = revisarDiseno(d);
  if (control !== "ok") return "noConcluyente";
  const orden = [...GRUPOS].sort((a, b) => d.luz[a] - d.luz[b]);
  const menos = orden[0]!;
  const mas = orden[orden.length - 1]!;
  const dif = finales[mas] - finales[menos];
  if (dif > 0.8) return "apoya";
  if (dif < -0.8) return "refuta";
  return "noConcluyente";
}

/** Vigor de cada planta: variación natural de ±8 % (desviación estándar). */
export function vigores(k: number, rnd: () => number = Math.random): number[] {
  return Array.from({ length: k }, () => Math.max(0.7, 1 + 0.08 * normal(rnd)));
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. RÉPLICAS
 * ════════════════════════════════════════════════════════════════════════ */

export const REPLICAS = 5;
export const NIVELES_LUZ = [0, 4, 8, 12, 16];

export function media(xs: number[]): number {
  return xs.reduce((s, x) => s + x, 0) / xs.length;
}

export function desviacion(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = media(xs);
  return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1));
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. MEDICIÓN
 * ════════════════════════════════════════════════════════════════════════ */

export type Instrumento = "cinta" | "regla" | "vernier";

export const INSTRUMENTOS: Record<Instrumento, { etq: string; resolucionMm: number; icono: string; detalle: string }> = {
  cinta: { etq: "Cinta con marcas cada cm", resolucionMm: 10, icono: "fa-tape", detalle: "Solo tiene marcas de centímetro." },
  regla: { etq: "Regla escolar", resolucionMm: 1, icono: "fa-ruler", detalle: "Una regla mide ±1 mm (glosario A5)." },
  vernier: { etq: "Calibrador vernier", resolucionMm: 0.1, icono: "fa-ruler-combined", detalle: "Su escala auxiliar lee décimas de milímetro." },
};

export const OBJETOS = [
  { id: "hoja", etq: "Hoja de la planta", mm: 123.4, fuente: "12.3 cm del glosario A5" },
  { id: "tallo", etq: "Tallo de la planta C", mm: 86.7, fuente: "Ejemplo del laboratorio" },
  { id: "semilla", etq: "Semilla de frijol", mm: 14.6, fuente: "Ejemplo del laboratorio" },
];

/** La lectura que da cada instrumento: el valor redondeado a su resolución. */
export function lectura(mm: number, inst: Instrumento): number {
  const r = INSTRUMENTOS[inst].resolucionMm;
  return Math.round(mm / r) * r;
}

/** Decimales con que se reporta una lectura en cm según la resolución del instrumento. */
export function decimalesCm(inst: Instrumento): number {
  return { cinta: 0, regla: 1, vernier: 2 }[inst];
}

/** Cuenta las cifras significativas de un número escrito (sin notación científica). */
export function cifrasSignificativas(txt: string): number {
  const limpio = txt.replace(/[−-]/, "").replace(",", ".").trim();
  if (!/^\d*\.?\d+$|^\d+\.$/.test(limpio)) return 0;
  const [ent = "", frac = ""] = limpio.split(".");
  const digitos = (ent + frac).replace(/^0+/, "");
  if (limpio.includes(".")) return digitos.length;
  return ent.replace(/^0+/, "").replace(/0+$/, "").length || (ent.length ? 1 : 0);
}

export type ResultadoLectura = "ok" | "sobran" | "faltan" | "valor" | "vacio";

/**
 * Evalúa una lectura escrita en cm: debe llevar exactamente los decimales que
 * permite el instrumento y coincidir con su lectura (tolerando medio paso).
 */
export function evaluarLectura(txt: string, mm: number, inst: Instrumento): ResultadoLectura {
  const limpio = txt.replace(",", ".").replace(/\s|cm/g, "");
  if (!/^\d+(\.\d+)?$/.test(limpio)) return "vacio";
  const dec = limpio.includes(".") ? limpio.split(".")[1]!.length : 0;
  const pedido = decimalesCm(inst);
  const valor = Number(limpio);
  const esperado = lectura(mm, inst) / 10;
  if (dec > pedido) return Math.abs(valor - mm / 10) < 0.5 ? "sobran" : "valor";
  if (dec < pedido) return Math.abs(valor - Number(esperado.toFixed(dec))) < 1e-9 ? "faltan" : "valor";
  return Math.abs(valor - esperado) <= INSTRUMENTOS[inst].resolucionMm / 20 + 1e-9 ? "ok" : "valor";
}

/* ════════════════════════════════════════════════════════════════════════
 * Estrellas: ¿qué variable es?
 * ════════════════════════════════════════════════════════════════════════ */

export type TipoVariable = "independiente" | "dependiente" | "control";

export interface CasoVariables {
  experimento: string;
  variables: { texto: string; tipo: TipoVariable }[];
}

export const CASOS_VARIABLES: CasoVariables[] = [
  {
    experimento: "¿Las plantas crecen más con música? Tres grupos de plantas escuchan 0, 1 y 3 horas de música al día.",
    variables: [
      { texto: "Horas de música al día", tipo: "independiente" },
      { texto: "Altura de las plantas", tipo: "dependiente" },
      { texto: "Cantidad de agua de riego", tipo: "control" },
    ],
  },
  {
    experimento: "¿El pan se endurece más rápido en la cocina o en el refrigerador? Se guardan rebanadas iguales en los dos lugares.",
    variables: [
      { texto: "Lugar donde se guarda el pan", tipo: "independiente" },
      { texto: "Dureza del pan después de 2 días", tipo: "dependiente" },
      { texto: "Tipo y grosor de la rebanada", tipo: "control" },
    ],
  },
  {
    experimento: "¿Una pelota rebota más alto si se infla más? Se deja caer desde 1 m con distintas presiones de aire.",
    variables: [
      { texto: "Presión de aire de la pelota", tipo: "independiente" },
      { texto: "Altura del rebote", tipo: "dependiente" },
      { texto: "Altura desde la que se suelta", tipo: "control" },
    ],
  },
  {
    experimento: "¿El azúcar se disuelve más rápido en agua caliente? Se agrega una cucharada a vasos de agua a 10, 40 y 70 °C.",
    variables: [
      { texto: "Temperatura del agua", tipo: "independiente" },
      { texto: "Tiempo que tarda en disolverse", tipo: "dependiente" },
      { texto: "Cantidad de agua y de azúcar", tipo: "control" },
    ],
  },
];

export function estrellasPorErrores(errores: number): number {
  return errores === 0 ? 3 : errores <= 2 ? 2 : 1;
}

/* ════════════════════════════════════════════════════════════════════════
 * Contenido VERBATIM
 * ════════════════════════════════════════════════════════════════════════ */

export const TITULO_A1 = "El método científico: cómo conocemos la naturaleza";

/** Lectura A1 — los tres párrafos, verbatim. */
export const LECTURA_A1: string[] = [
  "El método científico es el conjunto de procedimientos sistemáticos que los científicos usan para investigar fenómenos naturales y construir conocimiento confiable. No es un algoritmo rígido que siempre se sigue en el mismo orden, pero sí tiene componentes reconocibles.",
  "Generalmente incluye: (1) Observación: notar un fenómeno de forma sistemática y precisa. (2) Pregunta o problema: formular una pregunta clara y específica sobre ese fenómeno. (3) Hipótesis: plantear una explicación provisional que pueda ponerse a prueba. Una buena hipótesis es falsificable: puede ser refutada por los datos. (4) Experimentación: diseñar y realizar experimentos controlados que pongan a prueba la hipótesis. Incluye variables independientes (las que se manipulan), dependientes (las que se miden) y de control (las que se mantienen constantes). (5) Análisis de datos: interpretar los resultados usando estadística y gráficas. (6) Conclusión: aceptar, rechazar o modificar la hipótesis en función de los datos. (7) Comunicación: publicar los resultados para que otros científicos puedan replicarlos y criticarlos.",
  "El método científico incluye mecanismos de autocorrección: la replicación (otros deben poder repetir el experimento y obtener los mismos resultados) y la revisión por pares (los resultados son evaluados por otros expertos antes de publicarse). Esto es lo que hace al conocimiento científico confiable, aunque siempre provisional.",
];

export const SABIAS_A1 =
  "México es megadiverso en biota marina: alberga el 14% de todas las especies marinas conocidas en el planeta. El Mar de Cortés —llamado 'el acuario del mundo' por Jacques Cousteau— concentra más de 900 especies de peces, 32 de cetáceos y millones de aves marinas migratorias.";

/** Los siete componentes del método según la lectura A1. */
export const PASOS: { etq: string; texto: string }[] = [
  { etq: "Observación", texto: "notar un fenómeno de forma sistemática y precisa." },
  { etq: "Pregunta o problema", texto: "formular una pregunta clara y específica sobre ese fenómeno." },
  { etq: "Hipótesis", texto: "plantear una explicación provisional que pueda ponerse a prueba." },
  { etq: "Experimentación", texto: "diseñar y realizar experimentos controlados que pongan a prueba la hipótesis." },
  { etq: "Análisis de datos", texto: "interpretar los resultados usando estadística y gráficas." },
  { etq: "Conclusión", texto: "aceptar, rechazar o modificar la hipótesis en función de los datos." },
  { etq: "Comunicación", texto: "publicar los resultados para que otros científicos puedan replicarlos y criticarlos." },
];

export const OBSERVACION = "Una investigadora observa que las plantas crecen más cerca de la ventana.";
export const PREGUNTA_EXP = "¿La cantidad de luz que recibe una planta cambia cuánto crece?";

/** Preguntas de comprensión de la lectura A1 — verbatim. */
export const PREGUNTAS: string[] = [
  "¿Qué es una hipótesis falsificable?",
  "¿Cuál es la diferencia entre variable independiente y dependiente?",
  "¿Por qué la replicación es importante en el método científico?",
];

/** Hechos del quiz verdadero/falso A4 — verbatim (los falsos, con su corrección). */
export const HECHOS: string[] = [
  "La variable independiente es la que el investigador manipula. La dependiente es la que se mide como resultado.",
  "Toda medición tiene incertidumbre asociada al instrumento y al método.",
  "El metro, el kilogramo y el segundo son unidades del Sistema Internacional: son unidades base del SI.",
  "Las variables de control se mantienen constantes para no interferir.",
];

export interface GlosarioItem {
  termino: string;
  definicion: string;
  ejemplo: string;
}

/** Glosario A5 — los 6 términos verbatim. */
export const GLOSARIO: GlosarioItem[] = [
  { termino: "Hipótesis", definicion: "Explicación provisional y falsable que se pone a prueba.", ejemplo: "'La planta crece más con más luz'." },
  { termino: "Variable independiente", definicion: "La que se manipula a propósito en el experimento.", ejemplo: "La cantidad de luz que recibe la planta." },
  { termino: "Variable dependiente", definicion: "La que se mide como resultado.", ejemplo: "La altura que alcanza la planta." },
  { termino: "Sistema Internacional (SI)", definicion: "Conjunto estándar de unidades de medida (m, kg, s, K…).", ejemplo: "Medir la masa en kilogramos." },
  { termino: "Incertidumbre", definicion: "Margen de error inevitable de toda medición.", ejemplo: "Una regla mide ±1 mm." },
  { termino: "Cifras significativas", definicion: "Dígitos de una medida que aportan información confiable.", ejemplo: "12.3 cm tiene tres cifras significativas." },
];

export const FUENTE = "Material elaborado para CEN Bachillerato — CNEYT-I, progresión 9 (método científico y medición).";

export const PROBLEMA =
  "El método científico es el conjunto de procedimientos sistemáticos que los científicos usan para investigar fenómenos naturales y construir conocimiento confiable.";

export const INSTRUCCIONES: string[] = [
  "Parte de la observación: las plantas crecen más cerca de la ventana. Elige una hipótesis que pueda ponerse a prueba.",
  "Da a cada grupo de plantas distintas horas de luz: esa es tu variable independiente.",
  "Deja iguales el agua y la temperatura: son tus variables de control. Prueba también qué pasa si cambias una.",
  "Riega durante 21 días y observa crecer las plantas: su altura es la variable dependiente.",
  "Elige la conclusión que permiten tus datos.",
  "En «Réplicas y análisis», compara una sola planta por grupo con cinco: la variación natural se ve y el promedio es más confiable.",
  "En «Medición», mide la hoja con tres instrumentos y reporta la lectura con sus cifras significativas.",
  "Gana estrellas identificando las variables de otros experimentos y cierra con los dos retos evaluables.",
];

export const IDEAS: string[] = [
  "Una hipótesis científica debe poder refutarse con datos.",
  "En un experimento controlado solo cambia la variable independiente; todo lo demás se mantiene igual.",
  "Si cambian dos cosas a la vez, el resultado no dice cuál de las dos fue la causa.",
  "Las plantas, como toda medición, varían: repetir con varias muestras permite distinguir un efecto real del azar.",
  "El instrumento decide la incertidumbre y cuántas cifras significativas puedes reportar.",
  "Dentro del SI se convierte multiplicando o dividiendo por potencias de 10.",
];

/* ── Retos evaluables: quiz A2 y ejercicio A6, verbatim ───────────────── */

export const QUIZ_A2: QuizEvaluable = {
  titulo: "Pasos del método científico",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "¿Cuál es la primera etapa del método científico?",
      opciones: ["Plantear una hipótesis", "Realizar el experimento", "Observar un fenómeno de forma sistemática", "Publicar los resultados"],
      respuestaCorrecta: 2,
      retroalimentacion: "La observación sistemática de un fenómeno es el punto de partida del método científico.",
    },
    {
      enunciado: "¿Qué es una variable de control en un experimento?",
      opciones: ["La variable que se manipula intencionalmente", "La variable que se mide como resultado", "Las variables que se mantienen constantes para no interferir con los resultados", "La variable más importante del experimento"],
      respuestaCorrecta: 2,
      retroalimentacion: "Las variables de control se mantienen constantes para asegurar que solo la variable independiente causa cambios en la dependiente.",
    },
    {
      enunciado: "¿Por qué es importante que otros científicos puedan replicar un experimento?",
      opciones: ["Para que todos aprendan la técnica", "Para verificar los resultados y detectar errores o fraudes", "Para que el experimento sea más famoso", "Para ahorrar tiempo de investigación"],
      respuestaCorrecta: 1,
      retroalimentacion: "La replicabilidad es un mecanismo de autocorrección de la ciencia: si nadie puede reproducir los resultados, hay un problema.",
    },
    {
      enunciado: "Una investigadora observa que las plantas crecen más cerca de la ventana. Formula: 'Las plantas crecen más rápido con más luz solar'. ¿Qué es esto?",
      opciones: ["Una conclusión", "Una observación", "Una hipótesis", "Un dato experimental"],
      respuestaCorrecta: 2,
      retroalimentacion: "Es una hipótesis: una explicación provisional que puede ponerse a prueba experimentalmente.",
    },
    {
      enunciado: "Si los datos de un experimento refutan la hipótesis original, ¿qué debe hacer el científico?",
      opciones: ["Ignorar los datos que no coinciden con la hipótesis", "Rechazar o modificar la hipótesis y diseñar nuevas investigaciones", "Publicar igualmente la hipótesis como si fuera correcta", "Repetir el experimento hasta obtener los resultados esperados"],
      respuestaCorrecta: 1,
      retroalimentacion: "En ciencia, cuando los datos refutan una hipótesis, la hipótesis se rechaza o modifica: los datos tienen prioridad sobre las teorías previas.",
    },
  ],
};

export const RETO_A6: RetoNumericoData = {
  titulo: "Medición: conversión de unidades",
  contexto: "1 m = 100 cm = 1000 mm. Las conversiones dentro del SI se hacen multiplicando o dividiendo por potencias de 10.",
  problema: "En un experimento mediste la longitud de una mesa: 1.75 m. Exprésala en centímetros (cm) y en milímetros (mm).",
  campos: [
    { etiqueta: "Longitud en centímetros", objetivo: 175, tolerancia: 0, unidad: "cm" },
    { etiqueta: "Longitud en milímetros", objetivo: 1750, tolerancia: 0, unidad: "mm" },
  ],
  pasosGuia: ["Para pasar de m a cm, multiplica por 100.", "Para pasar de m a mm, multiplica por 1000.", "1.75 × 100 = 175 cm; 1.75 × 1000 = 1750 mm."],
  respuestaFinal: "175 cm y 1750 mm",
};
