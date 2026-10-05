/**
 * Simulador del modo «Aplica la encuesta» (LC-I-P02).
 *
 * Una escuela FICTICIA («Prepa Valle Claro») tiene una verdad que el alumno no
 * puede ver a simple vista: qué porcentaje lee por gusto y qué tipo de texto
 * lee. Su encuesta la estima con una muestra y una pregunta. Cada decisión
 * (dónde pregunta, cómo pregunta, a cuántas personas) mueve las barras.
 *
 * Todas las cifras son inventadas: es una SIMULACIÓN, no datos reales.
 * Determinista: la misma configuración y la misma «vuelta» dan lo mismo.
 */

import type { TipoTexto } from "./encuesta-lectora-data";

export type Muestra = "sorteo" | "biblioteca" | "patio";
export type Pregunta = "abierta" | "cerrada" | "inducida" | "ambigua";

export const MUESTRAS: { id: Muestra; etiqueta: string; icono: string; foto: string; detalle: string }[] = [
  { id: "sorteo", etiqueta: "Sorteo en toda la escuela", icono: "fa-shuffle", foto: "muestra-sorteo", detalle: "Todos tienen la misma oportunidad de salir." },
  { id: "biblioteca", etiqueta: "Quien está en la biblioteca", icono: "fa-book", foto: "muestra-biblioteca", detalle: "Es lo más cómodo: están ahí sentados." },
  { id: "patio", etiqueta: "Quien está en el patio", icono: "fa-futbol", foto: "muestra-patio", detalle: "Hay mucha gente y es hora de receso." },
];

export const PREGUNTAS: { id: Pregunta; etiqueta: string; texto: string; icono: string }[] = [
  { id: "abierta", etiqueta: "Abierta", texto: "¿Qué cosas lees en un día normal y por qué?", icono: "fa-comment-dots" },
  { id: "cerrada", etiqueta: "Sí o no", texto: "¿Lees?", icono: "fa-circle-question" },
  { id: "inducida", etiqueta: "Inducida", texto: "¿Verdad que leer es mucho mejor que estar en redes?", icono: "fa-hand-point-right" },
  { id: "ambigua", etiqueta: "Ambigua", texto: "¿Lees mucho?", icono: "fa-question" },
];

/** Lo que de verdad pasa en la escuela ficticia (porcentajes). */
export const VERDAD = {
  gusto: 46,
  tipo: { informativo: 36, narrativo: 24, digital: 40 } as Record<TipoTexto, number>,
};

/** Cómo es cada grupo del que se saca la muestra. */
const MARCO: Record<Muestra, { tipo: Record<TipoTexto, number>; gusto: Record<Pregunta, number> }> = {
  sorteo: {
    tipo: { informativo: 36, narrativo: 24, digital: 40 },
    gusto: { abierta: 46, cerrada: 30, inducida: 74, ambigua: 48 },
  },
  biblioteca: {
    tipo: { informativo: 28, narrativo: 58, digital: 14 },
    gusto: { abierta: 78, cerrada: 70, inducida: 94, ambigua: 64 },
  },
  patio: {
    tipo: { informativo: 22, narrativo: 8, digital: 70 },
    gusto: { abierta: 28, cerrada: 14, inducida: 66, ambigua: 39 },
  },
};

export interface Corrida {
  id: number;
  muestra: Muestra;
  pregunta: Pregunta;
  n: number;
  /** % que dice leer por gusto, según la encuesta. */
  gusto: number;
  /** % por tipo de texto; null si la pregunta no lo mide. */
  tipo: Record<TipoTexto, number> | null;
  /** Distancia media, en puntos porcentuales, entre tu encuesta y la escuela. */
  sesgo: number;
  veredicto: "confiable" | "sesgada" | "enganosa";
}

function semilla(a: number, b: number, c: number): () => number {
  let s = (a * 2654435761 + b * 40503 + c * 9973) >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Ruido aproximadamente normal (suma de uniformes), media 0, desviación ~1. */
function ruido(r: () => number): number {
  return (r() + r() + r() + r() - 2) * 1.73;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function etiquetaVeredicto(v: Corrida["veredicto"]): string {
  return v === "confiable" ? "Encuesta confiable" : v === "sesgada" ? "Encuesta con sesgo" : "Encuesta engañosa";
}

/** Aplica la encuesta a la escuela simulada. `vuelta` cambia a quiénes les toca. */
export function aplicarEncuesta(muestra: Muestra, pregunta: Pregunta, n: number, vuelta: number, id: number): Corrida {
  const r = semilla(vuelta + 1, n, muestra.length * 31 + pregunta.length * 7 + id);
  const marco = MARCO[muestra];
  const factor = pregunta === "ambigua" ? 2.4 : 1;

  const pg = marco.gusto[pregunta];
  const se = (p: number) => Math.sqrt((p / 100) * (1 - p / 100) / n) * 100 * factor;
  const gusto = Math.round(clamp(pg + ruido(r) * se(pg), 0, 100));

  let tipo: Corrida["tipo"] = null;
  if (pregunta !== "cerrada") {
    const base: Record<TipoTexto, number> = { ...marco.tipo };
    if (pregunta === "inducida") {
      // Quien quiere quedar bien dice que lee lo «serio» y esconde lo digital.
      base.narrativo += 14;
      base.digital -= 14;
    }
    const crudo: Record<TipoTexto, number> = {
      informativo: Math.max(1, base.informativo + ruido(r) * se(base.informativo)),
      narrativo: Math.max(1, base.narrativo + ruido(r) * se(base.narrativo)),
      digital: Math.max(1, base.digital + ruido(r) * se(base.digital)),
    };
    const suma = crudo.informativo + crudo.narrativo + crudo.digital;
    tipo = {
      informativo: Math.round((crudo.informativo / suma) * 100),
      narrativo: Math.round((crudo.narrativo / suma) * 100),
      digital: Math.round((crudo.digital / suma) * 100),
    };
  }

  const errGusto = Math.abs(gusto - VERDAD.gusto);
  const errTipo = tipo
    ? (Math.abs(tipo.informativo - VERDAD.tipo.informativo) + Math.abs(tipo.narrativo - VERDAD.tipo.narrativo) + Math.abs(tipo.digital - VERDAD.tipo.digital)) / 3
    : 20; // una pregunta de sí o no no dice qué se lee
  const sesgo = Math.round(((errGusto + errTipo) / 2) * 10) / 10;
  const veredicto: Corrida["veredicto"] = sesgo <= 6 ? "confiable" : sesgo <= 14 ? "sesgada" : "enganosa";
  return { id, muestra, pregunta, n, gusto, tipo, sesgo, veredicto };
}

/** Explicación breve de POR QUÉ salió así. */
export function explicaCorrida(c: Corrida): string[] {
  const out: string[] = [];
  if (c.muestra === "biblioteca") out.push("La biblioteca solo reúne a quien ya lee: la muestra no se parece a toda la escuela, y eso infla el gusto por leer y el texto narrativo.");
  else if (c.muestra === "patio") out.push("En el patio abunda quien está con el celular: la muestra se inclina a lo digital y subestima a quien lee libros.");
  else out.push("Con un sorteo, cualquiera pudo salir: la muestra se parece a la escuela y el error que queda es azar.");

  if (c.pregunta === "cerrada") out.push("«¿Lees?» se contesta pensando en libros, así que se cuentan menos lectores y no dice qué se lee: la gráfica de tipos queda vacía.");
  else if (c.pregunta === "inducida") out.push("La pregunta inducida trae la respuesta «correcta» dentro: la gente contesta lo que queda bien, y sube el gusto por leer y lo narrativo.");
  else if (c.pregunta === "ambigua") out.push("«Mucho» significa cosas distintas para cada quien: las respuestas bailan de una aplicación a otra.");
  else out.push("La pregunta abierta deja contar etiquetas, mensajes y avisos, y no sugiere qué contestar.");

  if (c.n < 40) out.push(`Con solo ${c.n} personas, el azar pesa mucho: si repites la encuesta, las barras cambian.`);
  else if (c.n >= 100) out.push(`Con ${c.n} personas el azar pesa poco: repetir la encuesta apenas mueve las barras.`);
  return out;
}
