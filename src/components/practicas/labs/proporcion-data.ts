/**
 * Datos para el laboratorio de Razón y proporción (PM-I-P05).
 *
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabProporcion.tsx) y la escena 3D (ProporcionScene.tsx) sin arrastrar
 * three.js al bundle del shell.
 *
 * Idea pedagógica: una RAZÓN compara dos cantidades (a : b). Una PROPORCIÓN
 * afirma que dos razones son iguales y deja ver QUÉ permanece constante:
 *   · Proporcionalidad DIRECTA  →  y = k · x.  Si x sube, y sube.
 *     Lo constante es la RAZÓN  y / x = k  (la gráfica es una recta por el origen).
 *   · Proporcionalidad INVERSA  →  y = k / x.  Si x sube, y baja.
 *     Lo constante es el PRODUCTO  x · y = k  (la gráfica es una hipérbola).
 * Verlo en vivo desmonta el error típico de "si una sube, la otra siempre sube".
 */

export type Tipo = "directa" | "inversa";

export interface Escenario {
  key: string;
  tipo: Tipo;
  titulo: string;
  icono: string; // Font Awesome 6
  contexto: string; // de dónde sale la constante k
  porque: string; // por qué es directa / inversa
  // Cantidad que el alumno controla (eje X)
  xNombre: string;
  xUnidad: string;
  xMin: number;
  xMax: number;
  xStep: number;
  xDefault: number;
  // Cantidad que responde (eje Y)
  yNombre: string;
  yUnidad: string;
  // Constante de proporcionalidad
  k: number; // directa: y = k·x ; inversa: y = k/x  (= x·y)
  kNombre: string; // nombre legible de la constante
}

export const ESCENARIOS: Escenario[] = [
  // ── Proporcionalidad DIRECTA (y = k·x) ──────────────────────────────
  {
    key: "tortillas",
    tipo: "directa",
    titulo: "Tortillas en la tortillería",
    icono: "fa-bowl-food",
    contexto: "En la tortillería cobran $23 por kilo.",
    porque: "Cada kilo extra suma el mismo costo: el precio por kilo no cambia.",
    xNombre: "Kilos",
    xUnidad: "kg",
    xMin: 1,
    xMax: 10,
    xStep: 1,
    xDefault: 3,
    yNombre: "Costo",
    yUnidad: "$",
    k: 23,
    kNombre: "Precio por kilo",
  },
  {
    key: "gasolina",
    tipo: "directa",
    titulo: "Cargar gasolina",
    icono: "fa-gas-pump",
    contexto: "La gasolina Magna cuesta $24 por litro.",
    porque: "Más litros cuestan más, siempre al mismo precio por litro.",
    xNombre: "Litros",
    xUnidad: "L",
    xMin: 5,
    xMax: 50,
    xStep: 5,
    xDefault: 20,
    yNombre: "Costo",
    yUnidad: "$",
    k: 24,
    kNombre: "Precio por litro",
  },
  {
    key: "mapa",
    tipo: "directa",
    titulo: "Mapa a escala",
    icono: "fa-map-location-dot",
    contexto: "El mapa está a escala 1:500 000: cada cm equivale a 5 km reales.",
    porque: "Al doble de centímetros en el mapa, el doble de kilómetros reales.",
    xNombre: "En el mapa",
    xUnidad: "cm",
    xMin: 1,
    xMax: 12,
    xStep: 1,
    xDefault: 4,
    yNombre: "Distancia real",
    yUnidad: "km",
    k: 5,
    kNombre: "Kilómetros por cm",
  },
  // ── Proporcionalidad INVERSA (y = k/x) ──────────────────────────────
  {
    key: "albaniles",
    tipo: "inversa",
    titulo: "Albañiles y días de obra",
    icono: "fa-helmet-safety",
    contexto: "La obra equivale a 60 días-trabajador de esfuerzo.",
    porque: "Más albañiles terminan en menos días: el trabajo total es el mismo.",
    xNombre: "Albañiles",
    xUnidad: "",
    xMin: 1,
    xMax: 12,
    xStep: 1,
    xDefault: 4,
    yNombre: "Días de obra",
    yUnidad: "días",
    k: 60,
    kNombre: "Trabajo total (días-trabajador)",
  },
  {
    key: "viaje",
    tipo: "inversa",
    titulo: "Velocidad y tiempo de viaje",
    icono: "fa-gauge-high",
    contexto: "El viaje mide 240 km fijos.",
    porque: "A mayor velocidad, menos tiempo: la distancia no cambia.",
    xNombre: "Velocidad",
    xUnidad: "km/h",
    xMin: 20,
    xMax: 120,
    xStep: 10,
    xDefault: 60,
    yNombre: "Tiempo",
    yUnidad: "h",
    k: 240,
    kNombre: "Distancia (km)",
  },
  {
    key: "dulces",
    tipo: "inversa",
    titulo: "Repartir dulces en partes iguales",
    icono: "fa-gift",
    contexto: "Hay 120 dulces para repartir en partes iguales.",
    porque: "Mientras más niños, menos dulces a cada uno: el total se reparte igual.",
    xNombre: "Niños",
    xUnidad: "",
    xMin: 1,
    xMax: 12,
    xStep: 1,
    xDefault: 4,
    yNombre: "Dulces c/u",
    yUnidad: "",
    k: 120,
    kNombre: "Total de dulces",
  },
];

/** Cantidad que responde (eje Y) para un valor de x. */
export const valorY = (e: Escenario, x: number) =>
  e.tipo === "directa" ? e.k * x : e.k / x;

/**
 * Cantidad que PERMANECE CONSTANTE (el corazón de la proporción):
 *   · directa →  razón  y / x  = k
 *   · inversa →  producto x · y = k
 * En ambos casos devuelve exactamente k.
 */
export const invariante = (e: Escenario, x: number) => {
  const y = valorY(e, x);
  return e.tipo === "directa" ? y / x : x * y;
};

/** Máximo valor de y en todo el rango (para normalizar la gráfica 3D). */
export const yMaxGlobal = (e: Escenario) =>
  e.tipo === "directa" ? e.k * e.xMax : e.k / e.xMin;
