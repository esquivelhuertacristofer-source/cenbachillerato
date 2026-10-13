/**
 * El viaje del paquete A TODAS LAS ESCALAS (modelo puro, sin three ni React).
 *
 * Un envío se cuenta en cuatro escalas, y la cámara las recorre en orden:
 *   capas  — en tu celular los datos se envuelven: TCP, IP y la trama de la red.
 *   ruta   — el archivo, partido en paquetes numerados, cruza los routers; no
 *            todos toman el mismo camino y llegan en desorden.
 *   globo  — el mismo viaje sobre la Tierra de noche: fibra terrestre y cables
 *            submarinos reales (trazos aproximados).
 *   centro — el paquete entra a un servidor de un centro de datos y ahí se
 *            reensambla en orden.
 *
 * Lo que sale de aquí lo usan el panel (fases, saltos, latencia) y la escena
 * (tiempos, rutas alternas, reparto de paquetes), para que ambos digan lo mismo.
 */

import {
  type DestinoId,
  type EnlaceId,
  type NodoId,
  type Ruta,
  ENLACES,
  T_DNS,
  largoEnlaceKm,
  latenciaMs,
} from "./paquete-internet-data";

/* ── Escalas ──────────────────────────────────────────────────────────── */

export type EscalaId = "capas" | "ruta" | "globo" | "centro";
export const ESCALAS: EscalaId[] = ["capas", "ruta", "globo", "centro"];
export const ESCALAS_DEF: Record<EscalaId, { etq: string; corta: string; icono: string; pregunta: string }> = {
  capas: { etq: "Capas", corta: "Capas", icono: "fa-layer-group", pregunta: "¿Qué lleva cada paquete?" },
  ruta: { etq: "Ruta", corta: "Ruta", icono: "fa-diagram-project", pregunta: "¿Por dónde viajan los paquetes?" },
  globo: { etq: "Globo", corta: "Globo", icono: "fa-earth-americas", pregunta: "¿Qué cables cruza?" },
  centro: { etq: "Centro de datos", corta: "Servidor", icono: "fa-server", pregunta: "¿A dónde llega?" },
};

/* ── Línea de tiempo de un envío (segundos) ───────────────────────────── */

export const T_CAPAS = 2.4;
export const T_RUTA = 4.6;
export const T_GLOBO = 3.8;
export const T_GLOBO_CORTO = 2.6;
export const T_CENTRO = 3.0;

export type EtapaId = "capas" | "dns" | "ruta" | "globo" | "centro";
export interface Etapa {
  id: EtapaId;
  escala: EscalaId;
  ini: number;
  dur: number;
}
export interface PlanEnvio {
  etapas: Etapa[];
  total: number;
}

/** Etapas de un envío: se envuelve, (se pregunta al DNS), cruza la red, el globo y entra al servidor. */
export function planEnvio(conDns: boolean, destino: DestinoId): PlanEnvio {
  const lista: [EtapaId, EscalaId, number][] = [["capas", "capas", T_CAPAS]];
  if (conDns) lista.push(["dns", "ruta", T_DNS]);
  lista.push(["ruta", "ruta", T_RUTA]);
  lista.push(["globo", "globo", destino === "qro" ? T_GLOBO_CORTO : T_GLOBO]);
  lista.push(["centro", "centro", T_CENTRO]);
  let t = 0;
  const etapas = lista.map(([id, escala, dur]) => {
    const e = { id, escala, ini: t, dur };
    t += dur;
    return e;
  });
  return { etapas, total: t };
}

export function etapaDe(plan: PlanEnvio, id: EtapaId): Etapa | undefined {
  return plan.etapas.find((e) => e.id === id);
}

/** Avance 0–1 de una etapa en el instante t (0 antes, 1 después; 0 si la etapa no existe). */
export function avanceEtapa(plan: PlanEnvio, id: EtapaId, t: number): number {
  const e = etapaDe(plan, id);
  if (!e) return 0;
  return Math.min(1, Math.max(0, (t - e.ini) / e.dur));
}

/* ── Saltos y latencia (simulación) ───────────────────────────────────── */

/** Saltos: enlaces que cruza el paquete entre tu celular y el servidor. */
export function saltosDe(ruta: Ruta): number {
  return Math.max(0, ruta.nodos.length - 1);
}

/**
 * Retardo extra de cada router (cola y procesamiento). ILUSTRATIVO, de orden de
 * magnitud: en una red poco cargada es de décimas de milisegundo a unos pocos.
 */
export const MS_POR_SALTO = 0.5;

/** Latencia de ida estimada: propagación en la fibra + un retardo fijo por salto (aprox.). */
export function latenciaEstimadaMs(ruta: Ruta): number {
  return latenciaMs(ruta.km) + saltosDe(ruta) * MS_POR_SALTO;
}

/* ── Varias rutas a la vez ────────────────────────────────────────────── */

/**
 * Caminos posibles de la casa al destino (sin repetir nodos y sin los enlaces
 * cortados), del más corto al más largo. Se quedan los que no pasan de 1.8 veces
 * el más corto, hasta `max`.
 */
export function rutasAlternas(destino: NodoId, cortados: EnlaceId[], max = 3): Ruta[] {
  const res: Ruta[] = [];
  const vivos = ENLACES.filter((e) => !cortados.includes(e.id));
  const dfs = (n: NodoId, nodos: NodoId[], enlaces: EnlaceId[], km: number) => {
    if (n === destino) {
      res.push({ nodos: [...nodos], enlaces: [...enlaces], km });
      return;
    }
    for (const e of vivos) {
      const v = e.a === n ? e.b : e.b === n ? e.a : null;
      if (!v || nodos.includes(v)) continue;
      nodos.push(v);
      enlaces.push(e.id);
      dfs(v, nodos, enlaces, km + largoEnlaceKm(e));
      nodos.pop();
      enlaces.pop();
    }
  };
  dfs("casa", ["casa"], [], 0);
  res.sort((a, b) => a.km - b.km);
  if (res.length === 0) return [];
  const mejor = res[0]!.km;
  return res.filter((r) => r.km <= mejor * 1.8).slice(0, max);
}

/**
 * A qué camino va cada paquete. La mayoría toma el más corto; el 2 y el 6 se
 * van por el segundo y el 4 por el tercero, para que se note que llegan en
 * desorden y que el destino los vuelve a acomodar por su número.
 */
export function repartoPaquetes(n: number, nRutas: number): number[] {
  const patron = [0, 1, 0, 2, 0, 1, 0, 0];
  return Array.from({ length: n }, (_, i) => Math.min(patron[i % patron.length]!, Math.max(0, nRutas - 1)));
}

/** Paquetes que se dibujan en la escena de la ruta (el resto se cuenta, no se dibuja). */
export const PAQUETES_DIBUJADOS = 8;

/* ── Capas (encapsulación) ────────────────────────────────────────────── */

export type CapaId = "datos" | "tcp" | "ip" | "enlace";
export type TramoId = "wifi" | "ethernet";

/**
 * Encabezados mínimos: TCP 20 B e IP (v4) 20 B. Trama Ethernet: 14 B de
 * encabezado + 4 B de verificación (FCS) = 18 B. Trama wifi (802.11): ≈ 24–30 B
 * de encabezado + 8 B de LLC/SNAP + 4 B de FCS ≈ 38 B (aproximado: depende de las
 * opciones de la red).
 */
export const BYTES_CAPA: Record<Exclude<CapaId, "datos">, number> = { tcp: 20, ip: 20, enlace: 18 };
export const BYTES_TRAMA: Record<TramoId, number> = { ethernet: 18, wifi: 38 };

export const TRAMOS: { id: TramoId; etq: string; icono: string; detalle: string }[] = [
  { id: "wifi", etq: "Wi‑Fi (celular → módem)", icono: "fa-wifi", detalle: "Trama 802.11 por el aire, ≈ 38 B (aprox.)" },
  { id: "ethernet", etq: "Ethernet (fibra y routers)", icono: "fa-ethernet", detalle: "Trama Ethernet, 14 B + 4 B de verificación" },
];

export const CAPAS_DEF: { id: CapaId; etq: string; color: string; que: string }[] = [
  { id: "datos", etq: "Datos", color: "#fbbf24", que: "Un pedazo de tu archivo, tal cual." },
  { id: "tcp", etq: "TCP", color: "#60a5fa", que: "Número de orden y puerto: permite reensamblar y pedir de nuevo lo que se pierda." },
  { id: "ip", etq: "IP", color: "#a78bfa", que: "Dirección de origen y de destino: con ella cada router decide a dónde mandarlo." },
  { id: "enlace", etq: "Trama", color: "#34d399", que: "La envoltura del tramo físico (wifi o Ethernet); se cambia en cada salto." },
];

/** Bytes que ocupa un paquete en el cable con `nivel` capas puestas (0 = solo datos). */
export function bytesEnCable(datos: number, nivel: number, tramo: TramoId): number {
  let b = datos;
  if (nivel >= 1) b += BYTES_CAPA.tcp;
  if (nivel >= 2) b += BYTES_CAPA.ip;
  if (nivel >= 3) b += BYTES_TRAMA[tramo];
  return b;
}

/** Primeros bytes reales de cada tipo de archivo (su «firma»), para la cara del bloque de datos. */
export const FIRMA_ARCHIVO: Record<string, string> = {
  texto: "48 6F 6C 61 20 3A 29 0A",
  pdf: "25 50 44 46 2D 31 2E 37",
  foto: "FF D8 FF E0 00 10 4A 46",
  video: "00 00 00 18 66 74 79 70",
};

/* ── Cables y estaciones sobre el globo ───────────────────────────────── */

export type LonLat = [number, number];

export interface CableGlobo {
  id: string;
  etq: string;
  tipo: "submarino" | "terrestre";
  /** Puntos [longitud, latitud]; entre puntos se sigue el círculo máximo. */
  puntos: LonLat[];
}

/**
 * Cables submarinos (trazos APROXIMADOS, plausibles). MAREA (Virginia Beach –
 * Sopelana, Bilbao, 2017) es el que usa el modelo. Hacia México llegan cables
 * a Cancún (desde Florida) y a Tijuana/Rosarito (desde California); de EE. UU.
 * salen otros hacia Europa, Sudamérica y Asia.
 */
export const CABLES_GLOBO: CableGlobo[] = [
  { id: "marea", etq: "MAREA", tipo: "submarino", puntos: [[-75.98, 36.85], [-60, 39.5], [-35, 42.5], [-15, 44.2], [-2.99, 43.39]] },
  { id: "va-francia", etq: "Virginia – Francia", tipo: "submarino", puntos: [[-75.98, 36.85], [-55, 41], [-25, 46], [-1.95, 46.72]] },
  { id: "ny-reino-unido", etq: "Nueva York – Reino Unido", tipo: "submarino", puntos: [[-72.9, 40.8], [-50, 45.5], [-25, 50], [-4.54, 50.83]] },
  { id: "cancun-florida", etq: "Cancún – Florida", tipo: "submarino", puntos: [[-86.85, 21.16], [-86.2, 22.7], [-84.4, 24.1], [-81.6, 24.35], [-80.2, 25.3], [-80.12, 26.01]] },
  { id: "tijuana-california", etq: "Tijuana – California", tipo: "submarino", puntos: [[-117.06, 32.34], [-117.7, 32.8], [-118.6, 33.5], [-118.4, 33.86]] },
  { id: "california-japon", etq: "California – Japón", tipo: "submarino", puntos: [[-120.6, 35.12], [-140, 33], [-158, 24], [-180, 28], [160, 33], [139.95, 34.95]] },
  { id: "oregon-japon", etq: "Oregón – Japón", tipo: "submarino", puntos: [[-123.9, 45.2], [-150, 47], [-180, 45], [160, 40], [140.3, 35.6]] },
  { id: "florida-brasil", etq: "Florida – Brasil", tipo: "submarino", puntos: [[-80.08, 26.35], [-72, 23], [-60, 15], [-45, 3], [-38.54, -3.72]] },
  { id: "brasil-portugal", etq: "Brasil – Portugal", tipo: "submarino", puntos: [[-38.54, -3.72], [-30, 8], [-20, 22], [-12, 33], [-8.87, 37.95]] },
  { id: "cdmx-cancun", etq: "Fibra CDMX – Cancún", tipo: "terrestre", puntos: [[-99.13, 19.43], [-96.1, 19.2], [-92.6, 18.6], [-89.6, 20.97], [-86.85, 21.16]] },
  { id: "gdl-tijuana", etq: "Fibra Guadalajara – Tijuana", tipo: "terrestre", puntos: [[-103.35, 20.66], [-105.4, 23.2], [-109.9, 27.5], [-114.5, 31.3], [-117.06, 32.34]] },
];

export const ESTACIONES_GLOBO: { id: string; etq: string; lonlat: LonLat }[] = [
  { id: "cancun", etq: "Cancún", lonlat: [-86.85, 21.16] },
  { id: "tijuana", etq: "Tijuana", lonlat: [-117.06, 32.34] },
];

/* ── Tiempos de cada paquete en la escala «ruta» ──────────────────────── */

export const GAP_PAQUETES = 0.22;
/** Espera en las colas de los routers (s de animación), distinta para cada paquete: ILUSTRATIVA. */
const COLAS = [0, 0.42, 0.04, 0.3, 0.02, 0.5, 0.12, 0];

export interface TiempoPaquete {
  /** Índice de la ruta (de `rutasAlternas`) que toma. */
  ruta: number;
  /** Segundos desde el inicio de la etapa en que sale. */
  sale: number;
  /** Segundos que tarda en llegar (camino + colas). */
  dura: number;
}

/**
 * Cuándo sale y cuánto tarda cada paquete dibujado. El tiempo de camino es
 * proporcional a los km de su ruta; las colas de los routers añaden un poco.
 * Se reserva el último segundo de la etapa para reensamblar.
 */
export function tiemposPaquetes(rutas: Ruta[], n: number, dur: number): TiempoPaquete[] {
  if (rutas.length === 0 || n <= 0) return [];
  const rep = repartoPaquetes(n, rutas.length);
  const kmMax = Math.max(...rutas.map((r) => r.km));
  const viaje = Math.max(0.8, dur - 1.1 - (n - 1) * GAP_PAQUETES);
  return rep.map((r, i) => {
    const camino = viaje * 0.78 * (rutas[r]!.km / kmMax);
    const cola = n > 1 ? viaje * 0.22 * (COLAS[i % COLAS.length]! / 0.5) : 0;
    return { ruta: r, sale: i * GAP_PAQUETES, dura: camino + cola };
  });
}

/** Orden (por número, desde 1) en que llegan los paquetes dibujados. */
export function ordenLlegada(tiempos: TiempoPaquete[]): number[] {
  return tiempos
    .map((t, i) => ({ i, llega: t.sale + t.dura }))
    .sort((a, b) => a.llega - b.llega)
    .map((x) => x.i + 1);
}

/** ¿Llegan en un orden distinto del de salida? (entonces hay que reensamblar). */
export function llegaEnDesorden(tiempos: TiempoPaquete[]): boolean {
  return ordenLlegada(tiempos).some((n, k) => n !== k + 1);
}
