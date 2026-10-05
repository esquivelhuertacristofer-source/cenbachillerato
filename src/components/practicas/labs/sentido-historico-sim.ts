/**
 * Lógica pura del simulador «Museo del pueblo» (CH-II-P03, sentido histórico).
 *
 * El alumno ayuda a armar la línea del tiempo del museo comunitario de «San
 * Telmo», un pueblo FICTICIO (simulación). Cada situación del presente es una
 * de las seis de `RAICES` (verbatim de A1/A4) y cada proceso del pasado es su
 * raíz. Aquí vive solo la lógica: qué pasa al colgar una situación de un
 * proceso, cuánto «comprende» el pueblo su presente y cómo se dibuja el hilo.
 */
import { RAICES } from "./sentido-historico-data";

/** Un proceso del pasado sobre la línea. `pos` va de 0 (lo más antiguo) a 1 (hoy). */
export interface NodoLinea {
  /** Mismo id que la fila de `RAICES` a la que explica. */
  id: string;
  pos: number;
  epoca: string;
}

/** Orden cronológico aproximado: de lo más antiguo a lo más reciente. */
export const LINEA: NodoLinea[] = [
  { id: "ra-lenguas", pos: 0.08, epoca: "Antes de 1492" },
  { id: "ra-12oct", pos: 0.22, epoca: "1492" },
  { id: "ra-castas", pos: 0.35, epoca: "1519-1521" },
  { id: "ra-norte-sur", pos: 0.52, epoca: "Época colonial" },
  { id: "ra-constitucion", pos: 0.69, epoca: "Siglo XIX y Revolución" },
  { id: "ra-tierra", pos: 0.85, epoca: "Tras la Revolución" },
];

/** Posición «Hoy», al final de la línea. */
export const POS_HOY = 1;

export type Conexiones = Record<string, boolean>;

export interface Retro {
  ok: boolean;
  texto: string;
}

/**
 * Qué responde el museo cuando el alumno cuelga la situación `presenteId` del
 * proceso `raizId`. La explicación sale de los datos verbatim: si falla, se
 * dice qué situación sí explica ese proceso.
 */
export function evaluarConexion(presenteId: string, raizId: string): Retro {
  const presente = RAICES.find((r) => r.id === presenteId);
  const raiz = RAICES.find((r) => r.id === raizId);
  if (!presente || !raiz) return { ok: false, texto: "Elige una situación y un proceso." };
  if (presenteId === raizId) {
    return { ok: true, texto: `Se enciende el hilo. ${presente.ejemplo}` };
  }
  return {
    ok: false,
    texto: `El hilo no se enciende: «${raiz.raiz}» explica «${raiz.presente}» (${raiz.ejemplo}) y no esta situación. Busca otro proceso para «${presente.presente}».`,
  };
}

export interface Comprension {
  /** 0–100. */
  pct: number;
  nivel: string;
}

/** Cuánto entiende el pueblo su presente según cuántas situaciones tienen raíz. */
export function comprension(conectadas: number, total: number): Comprension {
  const pct = total > 0 ? Math.round((100 * conectadas) / total) : 0;
  let nivel = "Solo se ve el hoy";
  if (conectadas >= total && total > 0) nivel = "El presente tiene sentido histórico";
  else if (pct >= 50) nivel = "El presente tiene raíces";
  else if (conectadas > 0) nivel = "Empiezan a verse los procesos";
  return { pct, nivel };
}

/**
 * Hilo de larga duración: arco SVG desde el proceso hasta «Hoy». Cuanto más
 * antiguo el proceso, más alto el arco (más duración acumulada).
 */
export function arcoHilo(pos: number, ancho: number, yEje: number): string {
  const x1 = 40 + pos * (ancho - 80);
  const x2 = 40 + POS_HOY * (ancho - 80);
  const alto = 18 + (POS_HOY - pos) * 70;
  const xm = (x1 + x2) / 2;
  return `M ${x1.toFixed(1)} ${yEje} Q ${xm.toFixed(1)} ${(yEje - alto * 2).toFixed(1)} ${x2.toFixed(1)} ${yEje}`;
}
