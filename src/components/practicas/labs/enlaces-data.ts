/**
 * Datos químicos para el laboratorio de Enlaces químicos (CNEYT-I-P10).
 *
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabEnlacesQuimicos.tsx) y la escena 3D (EnlacesQuimicosScene.tsx) sin
 * arrastrar three.js al bundle del shell.
 *
 * Las moléculas tienen geometría 3D real (aproximada a escala) y el tipo de
 * enlace se decide por la diferencia de electronegatividad (ΔEN) de Pauling,
 * tal como se enseña en el MCCEMS: compartir electrones (covalente) o
 * transferirlos (iónico) para alcanzar estabilidad (regla del octeto).
 */

export type ElementoQuim = "H" | "C" | "N" | "O" | "Cl" | "Na";

export interface DatoElemento {
  nombre: string;
  color: string; // color tipo CPK
  radio: number; // radio de la esfera en la escena
  en: number; // electronegatividad de Pauling
}

/** Tabla de elementos usados por las moléculas del laboratorio. */
export const ELEMS: Record<ElementoQuim, DatoElemento> = {
  H: { nombre: "Hidrógeno", color: "#E8EEF5", radio: 0.3, en: 2.2 },
  C: { nombre: "Carbono", color: "#4A4A55", radio: 0.42, en: 2.55 },
  N: { nombre: "Nitrógeno", color: "#3B6BFF", radio: 0.4, en: 3.04 },
  O: { nombre: "Oxígeno", color: "#FF4D4D", radio: 0.4, en: 3.44 },
  Cl: { nombre: "Cloro", color: "#52D07A", radio: 0.5, en: 3.16 },
  Na: { nombre: "Sodio", color: "#AB6BFF", radio: 0.55, en: 0.93 },
};

export interface AtomoMol {
  el: ElementoQuim;
  pos: [number, number, number];
}
export interface EnlaceMol {
  a: number; // índice de átomo
  b: number;
  orden: 1 | 2 | 3;
}

export type Categoria = "no-polar" | "polar" | "ionico";

export interface Molecula {
  key: string;
  formula: string; // con subíndices unicode
  nombre: string;
  categoria: Categoria;
  geometria: string;
  descripcion: string;
  atoms: AtomoMol[];
  bonds: EnlaceMol[];
  ionico: boolean;
  /** Par de átomos representativo para mostrar la ΔEN del enlace. */
  par: [ElementoQuim, ElementoQuim];
}

/** Color por categoría de enlace (coherente UI + escena). */
export const CAT_COLOR: Record<Categoria, string> = {
  "no-polar": "#34D399",
  polar: "#FBBF24",
  ionico: "#F472B6",
};
export const CAT_LABEL: Record<Categoria, string> = {
  "no-polar": "Covalente no polar",
  polar: "Covalente polar",
  ionico: "Iónico",
};

/**
 * Clasifica un enlace por su diferencia de electronegatividad (Pauling).
 *   ΔEN < 0.4   → covalente no polar (comparten por igual)
 *   0.4 – 1.7   → covalente polar (comparten desigual)
 *   ΔEN ≥ 1.7   → iónico (transferencia de electrones)
 */
export function categoriaPorEN(delta: number): Categoria {
  if (delta >= 1.7) return "ionico";
  if (delta >= 0.4) return "polar";
  return "no-polar";
}

export function deltaEN([a, b]: [ElementoQuim, ElementoQuim]): number {
  return Math.abs(ELEMS[a].en - ELEMS[b].en);
}

/* ── Catálogo de moléculas (geometría real aproximada a escala) ───────── */
export const MOLECULAS: Molecula[] = [
  {
    key: "H2",
    formula: "H₂",
    nombre: "Hidrógeno",
    categoria: "no-polar",
    geometria: "Diatómica (lineal)",
    descripcion: "Dos átomos iguales comparten un par de electrones por igual: enlace covalente no polar.",
    atoms: [
      { el: "H", pos: [-0.65, 0, 0] },
      { el: "H", pos: [0.65, 0, 0] },
    ],
    bonds: [{ a: 0, b: 1, orden: 1 }],
    ionico: false,
    par: ["H", "H"],
  },
  {
    key: "O2",
    formula: "O₂",
    nombre: "Oxígeno",
    categoria: "no-polar",
    geometria: "Diatómica (lineal)",
    descripcion: "Dos oxígenos comparten dos pares de electrones: enlace doble covalente no polar.",
    atoms: [
      { el: "O", pos: [-0.72, 0, 0] },
      { el: "O", pos: [0.72, 0, 0] },
    ],
    bonds: [{ a: 0, b: 1, orden: 2 }],
    ionico: false,
    par: ["O", "O"],
  },
  {
    key: "N2",
    formula: "N₂",
    nombre: "Nitrógeno",
    categoria: "no-polar",
    geometria: "Diatómica (lineal)",
    descripcion: "Triple enlace: comparten tres pares de electrones. Muy estable, por eso el N₂ es poco reactivo.",
    atoms: [
      { el: "N", pos: [-0.68, 0, 0] },
      { el: "N", pos: [0.68, 0, 0] },
    ],
    bonds: [{ a: 0, b: 1, orden: 3 }],
    ionico: false,
    par: ["N", "N"],
  },
  {
    key: "CH4",
    formula: "CH₄",
    nombre: "Metano",
    categoria: "no-polar",
    geometria: "Tetraédrica",
    descripcion: "El carbono comparte un electrón con cada hidrógeno. ΔEN pequeña: enlaces casi no polares.",
    atoms: [
      { el: "C", pos: [0, 0, 0] },
      { el: "H", pos: [0.72, 0.72, 0.72] },
      { el: "H", pos: [0.72, -0.72, -0.72] },
      { el: "H", pos: [-0.72, 0.72, -0.72] },
      { el: "H", pos: [-0.72, -0.72, 0.72] },
    ],
    bonds: [
      { a: 0, b: 1, orden: 1 },
      { a: 0, b: 2, orden: 1 },
      { a: 0, b: 3, orden: 1 },
      { a: 0, b: 4, orden: 1 },
    ],
    ionico: false,
    par: ["C", "H"],
  },
  {
    key: "HCl",
    formula: "HCl",
    nombre: "Cloruro de hidrógeno",
    categoria: "polar",
    geometria: "Diatómica (lineal)",
    descripcion: "El cloro atrae más los electrones que el hidrógeno: enlace covalente polar (un lado más negativo).",
    atoms: [
      { el: "H", pos: [-0.85, 0, 0] },
      { el: "Cl", pos: [0.75, 0, 0] },
    ],
    bonds: [{ a: 0, b: 1, orden: 1 }],
    ionico: false,
    par: ["H", "Cl"],
  },
  {
    key: "H2O",
    formula: "H₂O",
    nombre: "Agua",
    categoria: "polar",
    geometria: "Angular (104.5°)",
    descripcion: "El oxígeno jala los electrones de ambos hidrógenos. Molécula angular y muy polar: por eso el agua disuelve tanto.",
    atoms: [
      { el: "O", pos: [0, 0.3, 0] },
      { el: "H", pos: [-1.03, -0.5, 0] },
      { el: "H", pos: [1.03, -0.5, 0] },
    ],
    bonds: [
      { a: 0, b: 1, orden: 1 },
      { a: 0, b: 2, orden: 1 },
    ],
    ionico: false,
    par: ["O", "H"],
  },
  {
    key: "NH3",
    formula: "NH₃",
    nombre: "Amoniaco",
    categoria: "polar",
    geometria: "Piramidal",
    descripcion: "El nitrógeno comparte un electrón con cada hidrógeno y conserva un par libre: forma piramidal polar.",
    atoms: [
      { el: "N", pos: [0, 0.35, 0] },
      { el: "H", pos: [1.0, -0.3, 0] },
      { el: "H", pos: [-0.5, -0.3, 0.87] },
      { el: "H", pos: [-0.5, -0.3, -0.87] },
    ],
    bonds: [
      { a: 0, b: 1, orden: 1 },
      { a: 0, b: 2, orden: 1 },
      { a: 0, b: 3, orden: 1 },
    ],
    ionico: false,
    par: ["N", "H"],
  },
  {
    key: "CO2",
    formula: "CO₂",
    nombre: "Dióxido de carbono",
    categoria: "polar",
    geometria: "Lineal",
    descripcion: "Dos enlaces dobles C=O polares. La molécula es lineal, así que los efectos se compensan, pero los enlaces sí son polares.",
    atoms: [
      { el: "C", pos: [0, 0, 0] },
      { el: "O", pos: [-1.35, 0, 0] },
      { el: "O", pos: [1.35, 0, 0] },
    ],
    bonds: [
      { a: 0, b: 1, orden: 2 },
      { a: 0, b: 2, orden: 2 },
    ],
    ionico: false,
    par: ["C", "O"],
  },
  {
    key: "NaCl",
    formula: "NaCl",
    nombre: "Cloruro de sodio (sal)",
    categoria: "ionico",
    geometria: "Par iónico",
    descripcion: "La ΔEN es tan grande que el sodio CEDE su electrón al cloro: se forman iones Na⁺ y Cl⁻ que se atraen. Enlace iónico.",
    atoms: [
      { el: "Na", pos: [-1.0, 0, 0] },
      { el: "Cl", pos: [1.0, 0, 0] },
    ],
    bonds: [],
    ionico: true,
    par: ["Na", "Cl"],
  },
];
