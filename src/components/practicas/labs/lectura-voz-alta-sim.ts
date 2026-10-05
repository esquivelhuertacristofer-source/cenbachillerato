/**
 * Simulador de la oyente (LC-I-P07). Todo es SIMULACIÓN: la oyente es ficticia
 * y la comprensión es un modelo didáctico que usa los intervalos orientativos
 * de cada fragmento; no mide a ninguna persona real.
 */

import { PPM_MIN, PAUSA_MAX, type FragmentoRitmo } from "./lectura-voz-alta-data";

export interface ResultadoOyente {
  /** 0–100: cuánto sigue la oyente de lo que escucha. */
  total: number;
  /** 0–1 por velocidad y por pausas. */
  veloc: number;
  pausa: number;
  /** Lo que la oyente dice, según qué falla más. */
  frase: string;
  estado: "sigue" | "regular" | "perdida";
}

const clamp = (x: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, x));

export function oyente(f: FragmentoRitmo, ppm: number, pausa: number): ResultadoOyente {
  const dv = ppm < f.ppmMin ? (f.ppmMin - ppm) / 45 : ppm > f.ppmMax ? (ppm - f.ppmMax) / 45 : 0;
  const dp = pausa < f.pausaMin ? (f.pausaMin - pausa) / 0.8 : pausa > f.pausaMax ? (pausa - f.pausaMax) / 0.8 : 0;
  const veloc = 1 - clamp(dv);
  const sp = 1 - clamp(dp);
  const total = Math.round(100 * (0.6 * veloc + 0.4 * sp));
  let frase = "Mariana: «Lo sigo bien, entiendo todo lo que dice».";
  if (dv >= dp && dv > 0) {
    frase = ppm > f.ppmMax ? "Mariana: «Va muy rápido, se me pierden las palabras»." : "Mariana: «Va tan lento que me distraigo».";
  } else if (dp > 0) {
    frase = pausa < f.pausaMin ? "Mariana: «No alcanzo a pensar entre una frase y otra»." : "Mariana: «Se queda callado tanto rato que pierdo el hilo».";
  }
  return { total, veloc, pausa: sp, frase, estado: total >= 85 ? "sigue" : total >= 55 ? "regular" : "perdida" };
}

export interface BarraOnda {
  /** Inicio y fin en segundos. */
  t0: number;
  t1: number;
  /** Altura relativa 0–1. */
  h: number;
}
export interface PausaOnda {
  t0: number;
  t1: number;
}

/** Dónde caen las palabras y los silencios al leer el fragmento a ese ritmo. */
export function ondaDe(f: FragmentoRitmo, ppm: number, pausa: number): { barras: BarraOnda[]; pausas: PausaOnda[]; duracion: number } {
  const palabras = f.texto.trim().split(/\s+/);
  const dw = 60 / ppm;
  const barras: BarraOnda[] = [];
  const pausas: PausaOnda[] = [];
  let t = 0;
  for (const w of palabras) {
    barras.push({ t0: t, t1: t + dw * 0.85, h: 0.35 + ((w.length * 7) % 10) / 16 });
    t += dw;
    const fin = /[.!?:;]["»”)]*$/.test(w);
    const coma = /,["»”)]*$/.test(w);
    if (fin || coma) {
      const d = fin ? pausa : pausa * 0.4;
      pausas.push({ t0: t, t1: t + d });
      t += d;
    }
  }
  return { barras, pausas, duracion: t };
}

/** Duración más larga posible (la escala fija del dibujo): lento y con pausas largas. */
export function duracionMaxima(f: FragmentoRitmo): number {
  return ondaDe(f, PPM_MIN, PAUSA_MAX).duracion;
}
