/**
 * Simulador «Da la exposición» (LC-I-P08). Todo es SIMULACIÓN: el público es
 * ficticio y las cifras son un modelo didáctico, no mediciones.
 * La atención se calcula en 7 momentos de una exposición de 3 minutos.
 */

export type Apertura = "pregunta" | "dato" | "saludo";
export type Mirada = "grupo" | "papel" | "pared";
export type ApoyoSim = "esquema" | "parrafos" | "ninguno";
export type CierreSim = "sintesis" | "gracias" | "corte";

export interface EleccionSim {
  apertura: Apertura;
  /** Palabras por minuto. */
  ritmo: number;
  mirada: Mirada;
  apoyo: ApoyoSim;
  cierre: CierreSim;
}

/** Punto de partida a propósito flojo: el alumno lo mejora. */
export const ELECCION_INICIAL: EleccionSim = {
  apertura: "saludo",
  ritmo: 190,
  mirada: "papel",
  apoyo: "parrafos",
  cierre: "gracias",
};

/** Segundos de la exposición en que se mide la atención. */
export const MOMENTOS = [0, 30, 60, 90, 120, 150, 180];

export interface OpcionSim<T extends string> {
  id: T;
  label: string;
  icono: string;
  /** Consecuencia explicada (por qué). */
  nota: string;
}

export const OPC_APERTURA: OpcionSim<Apertura>[] = [
  { id: "pregunta", label: "Una pregunta al grupo", icono: "fa-circle-question", nota: "Una pregunta hace que el público piense su propia respuesta: entra a la exposición desde el primer segundo." },
  { id: "dato", label: "Un dato que sorprende", icono: "fa-bolt", nota: "Un dato inesperado despierta curiosidad, aunque pide más cuidado que la pregunta para ligarlo con tu tema." },
  { id: "saludo", label: "«Hola, voy a hablar de…»", icono: "fa-hand", nota: "Anunciar el tema sin darle al público una razón para escuchar lo deja con poca atención desde el inicio." },
];

export const OPC_MIRADA: OpcionSim<Mirada>[] = [
  { id: "grupo", label: "Mirar al grupo", icono: "fa-eye", nota: "Mirar a quienes te escuchan los hace sentir parte de la exposición y recupera a los que se distraen." },
  { id: "papel", label: "Leer del papel", icono: "fa-file-lines", nota: "Con la vista en la hoja se pierde el contacto: el público siente que le leen y no que le hablan." },
  { id: "pared", label: "Mirar a la pared", icono: "fa-wall-brick", nota: "Sin dirigir la mirada a nadie, la exposición parece un monólogo para el muro y la atención se cae rápido." },
];

export const OPC_APOYO: OpcionSim<ApoyoSim>[] = [
  { id: "esquema", label: "Esquema con imágenes", icono: "fa-diagram-project", nota: "Un esquema resume la secuencia y deja que el público te escuche mientras ve la idea." },
  { id: "parrafos", label: "Diapositiva con párrafos", icono: "fa-align-left", nota: "Si el público lee el texto de la pantalla, deja de oírte: compites contigo mismo." },
  { id: "ninguno", label: "Sin apoyo visual", icono: "fa-ban", nota: "Sin nada que ver, las ideas complejas se sostienen solo con la voz y cuesta más seguirlas." },
];

export const OPC_CIERRE: OpcionSim<CierreSim>[] = [
  { id: "sintesis", label: "Resumir y cerrar con una idea", icono: "fa-flag-checkered", nota: "Una síntesis final deja una idea que el público se lleva y recuerda." },
  { id: "gracias", label: "Solo decir «gracias»", icono: "fa-face-smile", nota: "Agradecer es cortés, pero sin recordar lo importante el cierre no fija nada." },
  { id: "corte", label: "Cortar porque se acabó el tiempo", icono: "fa-scissors", nota: "Un final abrupto deja ideas a medias: el público siente que faltó la conclusión." },
];

const clamp = (x: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, x));

/** Qué tan lejos del ritmo cómodo (120–150 ppm) está el ritmo elegido. */
export function distanciaRitmo(ritmo: number): number {
  if (ritmo < 120) return clamp((120 - ritmo) / 50, 0, 1.4);
  if (ritmo > 150) return clamp((ritmo - 150) / 50, 0, 1.4);
  return 0;
}

/** Atención del público (0–1) en cada uno de los 7 momentos. */
export function curvaAtencion(e: EleccionSim): number[] {
  const ini = { pregunta: 0.88, dato: 0.82, saludo: 0.55 }[e.apertura];
  const ritmo = distanciaRitmo(e.ritmo);
  const caida =
    0.03 +
    0.07 * ritmo +
    { grupo: 0, papel: 0.04, pared: 0.08 }[e.mirada] +
    { esquema: 0, parrafos: 0.05, ninguno: 0.015 }[e.apoyo];
  const recupera = { grupo: 0.015, papel: 0, pared: 0 }[e.mirada] + { esquema: 0.01, parrafos: 0, ninguno: 0 }[e.apoyo];
  const out: number[] = [clamp(ini, 0.05, 1)];
  for (let i = 1; i < MOMENTOS.length; i++) {
    out.push(clamp(out[i - 1]! - caida + recupera, 0.05, 1));
  }
  const ultimo = MOMENTOS.length - 1;
  out[ultimo] = clamp(out[ultimo]! + { sintesis: 0.12, gracias: 0, corte: -0.12 }[e.cierre], 0.05, 1);
  return out;
}

/** Qué porcentaje de la exposición recordará el público (modelo didáctico). */
export function recuerdo(e: EleccionSim): number {
  const c = curvaAtencion(e);
  const media = c.reduce((a, b) => a + b, 0) / c.length;
  const claridad = e.ritmo > 170 ? 0.65 : e.ritmo < 100 ? 0.85 : 1;
  const apoyo = e.apoyo === "esquema" ? 0.08 : e.apoyo === "parrafos" ? -0.04 : 0;
  return Math.round(clamp(media * claridad + apoyo) * 100);
}

export interface PersonaSim {
  id: string;
  nombre: string;
  /** Atención mínima para seguir atento (ficticia). */
  umbral: number;
}

export const PUBLICO: PersonaSim[] = [
  { id: "nayeli", nombre: "Nayeli", umbral: 0.15 },
  { id: "joaquin", nombre: "Joaquín", umbral: 0.55 },
  { id: "dulce", nombre: "Dulce", umbral: 0.3 },
  { id: "memo", nombre: "Memo", umbral: 0.8 },
  { id: "ximena", nombre: "Ximena", umbral: 0.4 },
  { id: "rafa", nombre: "Rafa", umbral: 0.7 },
  { id: "citlali", nombre: "Citlali", umbral: 0.25 },
  { id: "beto", nombre: "Beto", umbral: 0.85 },
  { id: "frida", nombre: "Frida", umbral: 0.45 },
  { id: "ivan", nombre: "Iván", umbral: 0.65 },
  { id: "lupita", nombre: "Lupita", umbral: 0.2 },
  { id: "omar", nombre: "Omar", umbral: 0.75 },
];

export type EstadoPersona = "atento" | "distraido" | "dormido";

export function estadoPersona(atencion: number, p: PersonaSim): EstadoPersona {
  if (atencion >= p.umbral) return "atento";
  if (atencion >= p.umbral - 0.25) return "distraido";
  return "dormido";
}

/** Frase corta de una persona del público (ficticia) según la atención. */
export function reaccion(e: EleccionSim, atencion: number): string {
  if (e.ritmo > 170 && atencion < 0.6) return "Nayeli: «Habla tan rápido que no alcanzo a anotar».";
  if (e.ritmo < 100 && atencion < 0.6) return "Joaquín: «Va tan lento que ya me distraje».";
  if (e.apoyo === "parrafos" && atencion < 0.6) return "Dulce: «Estoy leyendo la pantalla y ya no lo escucho».";
  if (e.mirada !== "grupo" && atencion < 0.6) return "Memo: «Ni nos mira; parece que habla solo».";
  if (atencion >= 0.8) return "Ximena: «Me quedé pensando en la pregunta, quiero saber más».";
  if (atencion >= 0.6) return "Rafa: «Voy siguiendo la idea, pero se puede mejorar».";
  return "Citlali: «Ya no sé de qué trata esto».";
}
