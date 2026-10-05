/**
 * Lógica pura del «Ensayo de exposición» (LC-III-P07). Sin React.
 *
 * El alumno planea una exposición para un público FICTICIO (28 estudiantes del
 * «Bachillerato Cumbres del Sur», plantel inventado): apertura, estructura,
 * apoyos, postura, ritmo, volumen y duración. De ese plan sale una curva de
 * atención sobre la línea del tiempo (todas las cifras son «simulación»).
 *
 * Modelo (determinista):
 *   A(apertura) = base de la apertura
 *   A(i) = 62 + 0,4 · (A(i-1) − 62) + efectos(i) − fatiga(t_i)
 * - La atención tiene memoria: un buen inicio ayuda al siguiente momento.
 * - efectos(i): estructura, apoyos, postura y voz según el momento.
 * - fatiga(t) = 2,4 puntos por cada minuto que pase de los 9.
 */

export type Apertura = "pregunta" | "chiste" | "disculpa" | "lee";
export type Estructura = "clasica" | "cronologica" | "lista";
export type Apoyos = "visuales" | "parrafos" | "ninguno";
export type Postura = "frente" | "lee" | "camina";

export interface Plan {
  apertura: Apertura;
  estructura: Estructura;
  apoyos: Apoyos;
  postura: Postura;
  /** Palabras por minuto. */
  ritmo: number;
  /** 0–100. */
  volumen: number;
  /** Minutos de la exposición. */
  duracion: number;
}

/** Un primer borrador mediocre: el alumno lo mejora. */
export const PLAN_INICIAL: Plan = {
  apertura: "disculpa",
  estructura: "cronologica",
  apoyos: "parrafos",
  postura: "frente",
  ritmo: 150,
  volumen: 50,
  duracion: 14,
};

export const TEMA = "¿Captar el agua de lluvia o drenarla? (tema inventado para el ensayo)";
export const PUBLICO = "28 estudiantes de 3.er semestre del plantel ficticio «Cumbres del Sur»";

interface Opcion<T extends string> {
  id: T;
  texto: string;
  icono: string;
}

export const APERTURAS: Opcion<Apertura>[] = [
  { id: "pregunta", icono: "fa-circle-question", texto: "Una pregunta con un dato de la colonia: «¿Sabían que en la última lluvia se fueron 40 mil litros por la calle?» (simulación)" },
  { id: "chiste", icono: "fa-face-laugh", texto: "Un chiste que no tiene relación con el tema" },
  { id: "disculpa", icono: "fa-face-sad-sweat", texto: "Disculparte: «No me dio tiempo de prepararme bien»" },
  { id: "lee", icono: "fa-file-lines", texto: "Leer el título y el índice de tu tarjeta" },
];

export const ESTRUCTURAS: Opcion<Estructura>[] = [
  { id: "clasica", icono: "fa-sitemap", texto: "Introducción con tesis, tres argumentos con evidencia y una conclusión que retoma la tesis" },
  { id: "cronologica", icono: "fa-clock-rotate-left", texto: "Contar todo en orden cronológico, sin una tesis clara" },
  { id: "lista", icono: "fa-list-ul", texto: "Seis argumentos seguidos y terminar con «eso es todo»" },
];

export const APOYOS: Opcion<Apoyos>[] = [
  { id: "visuales", icono: "fa-chart-pie", texto: "Cinco diapositivas, cada una con una imagen y una cifra" },
  { id: "parrafos", icono: "fa-align-justify", texto: "Diapositivas con párrafos completos que irás leyendo" },
  { id: "ninguno", icono: "fa-ban", texto: "Sin apoyos visuales" },
];

export const POSTURAS: Opcion<Postura>[] = [
  { id: "frente", icono: "fa-person", texto: "De frente al grupo, con contacto visual y manos libres" },
  { id: "lee", icono: "fa-file-lines", texto: "Mirando la hoja o la pantalla mientras lees" },
  { id: "camina", icono: "fa-person-walking", texto: "Caminando sin parar por el salón" },
];

export const IDS_MOMENTO = ["apertura", "intro", "arg1", "arg2", "arg3", "cierre", "preguntas"] as const;
export type IdMomento = (typeof IDS_MOMENTO)[number];

const ETIQUETA: Record<IdMomento, string> = {
  apertura: "Apertura",
  intro: "Introducción",
  arg1: "Argumento 1",
  arg2: "Argumento 2",
  arg3: "Argumento 3",
  cierre: "Conclusión",
  preguntas: "Preguntas",
};

/** Posición de cada momento dentro de la exposición (0 = inicio, 1 = fin). */
const FRACCION: Record<IdMomento, number> = { apertura: 0, intro: 0.1, arg1: 0.3, arg2: 0.5, arg3: 0.7, cierre: 0.88, preguntas: 1 };

export interface Causa {
  texto: string;
  delta: number;
}

export interface Momento {
  id: IdMomento;
  etiqueta: string;
  /** Minuto en que ocurre. */
  t: number;
  atencion: number;
  causas: Causa[];
  /** Lo que hace el público. */
  reaccion: string;
  /** La causa que más pesó, dicha en una frase. */
  razon: string;
}

export interface Ensayo {
  momentos: Momento[];
  promedio: number;
  minimo: number;
  /** Atención promedio ≥ 70 y ningún momento bajo 55. */
  exito: boolean;
  peor: Momento;
}

const BASE_APERTURA: Record<Apertura, { base: number; razon: string }> = {
  pregunta: { base: 80, razon: "La pregunta con un dato local engancha: el público quiere la respuesta." },
  chiste: { base: 66, razon: "El chiste hace reír, pero no presenta el tema." },
  disculpa: { base: 42, razon: "Disculparte antes de empezar te resta autoridad." },
  lee: { base: 38, razon: "Leer el índice no despierta interés: es lo que ya está en la hoja." },
};

const clamp = (n: number, lo = 5, hi = 98) => Math.max(lo, Math.min(hi, Math.round(n)));

/** Penalización de ritmo: la zona cómoda va de 105 a 145 palabras por minuto. */
export function penaRitmo(r: number): number {
  if (r < 105) return -Math.round((105 - r) * 0.45);
  if (r > 145) return -Math.round((r - 145) * 0.45);
  return 0;
}

/** Penalización de volumen: la zona cómoda va de 55 a 80. */
export function penaVolumen(v: number): number {
  if (v < 55) return -Math.round((55 - v) * 0.5);
  if (v > 80) return -Math.round((v - 80) * 0.5);
  return 0;
}

export function fatiga(minuto: number): number {
  return Math.max(0, minuto - 9) * 2.4;
}

function causasDe(id: IdMomento, p: Plan): Causa[] {
  const c: Causa[] = [];
  const add = (texto: string, delta: number) => {
    if (delta !== 0) c.push({ texto, delta });
  };
  const pr = penaRitmo(p.ritmo);
  const pv = penaVolumen(p.volumen);
  const voz = () => {
    if (pr <= -3) add(p.ritmo < 105 ? "Hablas tan despacio que se distraen." : "Hablas tan rápido que no alcanzan a procesar.", pr);
    if (pv <= -3) add(p.volumen < 55 ? "Los de las filas de atrás no te escuchan." : "Hablas tan fuerte que cansa.", pv);
  };
  const cuerpo = () => {
    if (p.postura === "frente") add("El contacto visual los mantiene contigo.", 3);
    if (p.postura === "lee") add("Miras la hoja y no al grupo: sienten que lees para ti.", -8);
    if (p.postura === "camina") add("Caminar sin parar distrae la vista.", -5);
  };

  if (id === "apertura") {
    if (pv <= -3) add("Desde el inicio no se te oye bien.", Math.round(pv / 2));
    return c;
  }
  if (id === "intro") {
    if (p.apertura === "chiste") add("El chiste no conecta con el tema: se pierde el hilo.", -10);
    if (p.estructura === "clasica") add("La tesis dice a dónde vas.", 6);
    if (p.estructura === "cronologica") add("Sin tesis nadie sabe a dónde va esto.", -8);
    if (p.estructura === "lista") add("Sin tesis, la lista de argumentos empieza sin rumbo.", -4);
    cuerpo();
    voz();
  }
  if (id === "arg1" || id === "arg2" || id === "arg3") {
    if (p.apoyos === "visuales") add("La imagen con una cifra complementa lo que dices.", 6);
    if (p.apoyos === "parrafos") add("Leen la diapositiva y dejan de escucharte.", -12);
    if (p.apoyos === "ninguno") add("Sin apoyos, los datos se olvidan pronto.", -5);
    if (p.estructura === "cronologica") add("Sin tesis, los datos no se conectan entre sí.", -3);
    if (p.estructura === "lista" && id === "arg2") add("Van demasiados argumentos sin pausa.", -4);
    if (p.estructura === "lista" && id === "arg3") add("Demasiados argumentos seguidos: se cansan.", -10);
    if (p.duracion < 6 && id !== "arg1") add("En tan poco tiempo no alcanzas a sustentar con evidencia.", -10);
    cuerpo();
    voz();
  }
  if (id === "cierre") {
    if (p.estructura === "clasica") add("Retomas la tesis y cierras con un llamado a la reflexión.", 10);
    if (p.estructura === "cronologica") add("Termina sin una conclusión que amarre lo dicho.", -4);
    if (p.estructura === "lista") add("Terminar con «eso es todo» deja la exposición sin cierre.", -18);
    cuerpo();
    voz();
  }
  if (id === "preguntas") {
    if (p.duracion <= 11) add("Sobró tiempo para que el público preguntara.", 8);
    if (p.duracion >= 14) add("Se acabó el tiempo: suena el timbre y no hay preguntas.", -10);
  }
  return c;
}

function reaccionDe(a: number): string {
  if (a >= 75) return "Se inclinan hacia adelante y toman notas.";
  if (a >= 55) return "Escuchan, aunque algunos miran el reloj.";
  if (a >= 35) return "Varios revisan el celular.";
  return "Se oyen cuchicheos y bostezos.";
}

export function ensayar(p: Plan): Ensayo {
  const momentos: Momento[] = [];
  let prev = BASE_APERTURA[p.apertura].base;
  for (const id of IDS_MOMENTO) {
    const t = Math.round(FRACCION[id] * p.duracion * 10) / 10;
    const causas = causasDe(id, p);
    let atencion: number;
    if (id === "apertura") {
      atencion = clamp(prev + causas.reduce((s, x) => s + x.delta, 0));
    } else {
      const suma = causas.reduce((s, x) => s + x.delta, 0);
      atencion = clamp(62 + 0.4 * (prev - 62) + suma - fatiga(t));
      const f = Math.round(fatiga(t));
      if (f >= 3) causas.push({ texto: `Llevas ${Math.round(t)} minutos: la fatiga del público pesa.`, delta: -f });
    }
    prev = atencion;
    const principal = id === "apertura" ? BASE_APERTURA[p.apertura].razon : razonPrincipal(causas);
    momentos.push({ id, etiqueta: ETIQUETA[id], t, atencion, causas, reaccion: reaccionDe(atencion), razon: principal });
  }
  const promedio = Math.round(momentos.reduce((s, m) => s + m.atencion, 0) / momentos.length);
  const peor = momentos.reduce((a, b) => (b.atencion < a.atencion ? b : a));
  const minimo = peor.atencion;
  return { momentos, promedio, minimo, exito: promedio >= 70 && minimo >= 55, peor };
}

function razonPrincipal(causas: Causa[]): string {
  if (causas.length === 0) return "Sin cambios: el público sigue como venía.";
  const mayor = causas.reduce((a, b) => (Math.abs(b.delta) > Math.abs(a.delta) ? b : a));
  return mayor.texto;
}

/** Firma del plan: sirve para saber si dos ensayos son versiones distintas. */
export function firma(p: Plan): string {
  return [p.apertura, p.estructura, p.apoyos, p.postura, p.ritmo, p.volumen, p.duracion].join("|");
}

/** Consejo tras dar la exposición: qué cambiar primero. */
export function consejo(e: Ensayo): string {
  if (e.exito) return "El grupo te siguió de principio a fin: planeación, apoyos y voz trabajaron juntos.";
  return `El peor momento fue «${e.peor.etiqueta}» (${e.peor.atencion}). ${e.peor.razon} Cambia eso primero y vuelve a ensayar.`;
}
