/**
 * Datos — "Clasificador 3D de tipos de reacciones químicas" (CNEYT-IV-P02-A1,
 * infografía "Tipos de reacciones químicas: de la síntesis a la combustión";
 * UAC CNEYT-IV "Reacciones químicas", progresión 2: "Clasifica los tipos de
 * reacciones químicas y predice sus productos").
 *
 * Idea pedagógica (MCCEMS 2025 — CNEYT-IV P2): las reacciones se CLASIFICAN por
 * cómo se reorganizan los átomos. Cada reacción se muestra como un modelo de
 * bolas y barras donde los MISMOS átomos (esferas CPK) viajan de su posición en
 * los reactivos a su posición en los productos: los enlaces viejos se rompen y se
 * forman enlaces nuevos, pero NINGÚN átomo aparece ni desaparece (ley de
 * conservación de la masa, Lavoisier 1789). Los cinco tipos (patrones verbatim
 * de la infografía A1 y el glosario A5):
 *   · Síntesis (combinación):      A + B → AB
 *   · Descomposición:              AB → A + B
 *   · Desplazamiento simple:       A + BC → AC + B
 *   · Doble desplazamiento:        AB + CD → AD + CB
 *   · Combustión:                  combustible + O₂ → CO₂ + H₂O + energía
 *
 * Todas las ecuaciones son EXACTAS y están balanceadas; provienen literalmente
 * del contenido de la progresión (A1, A2, A4, A5). Las geometrías ball-and-stick
 * son representaciones DIDÁCTICAS (no distancias de enlace reales); la fórmula,
 * el balanceo y el conteo de átomos por elemento sí son los valores reales.
 *
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabReaccionesTipos.tsx) y la escena 3D (ReaccionesTiposScene.tsx). Las
 * posiciones son deterministas (nada de Math.random()/Date.now()).
 */

/* ── Elementos (colores tipo CPK) ─────────────────────────────────────────── */
export type Elem = "H" | "O" | "C" | "Na" | "Cl" | "Fe" | "Cu" | "S";

export interface ElemInfo {
  nombre: string;
  color: string;
  radio: number;
}

export const ELEMS: Record<Elem, ElemInfo> = {
  H:  { nombre: "Hidrógeno", color: "#E8EEF5", radio: 0.22 },
  O:  { nombre: "Oxígeno",   color: "#FF4D4D", radio: 0.34 },
  C:  { nombre: "Carbono",   color: "#4A4A55", radio: 0.36 },
  Na: { nombre: "Sodio",     color: "#A974E8", radio: 0.46 },
  Cl: { nombre: "Cloro",     color: "#43D17A", radio: 0.42 },
  Fe: { nombre: "Hierro",    color: "#D98A4A", radio: 0.48 },
  Cu: { nombre: "Cobre",     color: "#C77B3B", radio: 0.46 },
  S:  { nombre: "Azufre",    color: "#E6C84F", radio: 0.42 },
};

export type V = [number, number, number];

/** Átomo con su posición en los reactivos (`from`) y en los productos (`to`). */
export interface RAtom {
  el: Elem;
  from: V;
  to: V;
}
/** Enlace entre dos átomos (por índice); `orden` 1 simple, 2 doble. */
export interface RBond {
  a: number;
  b: number;
  orden: 1 | 2;
}

/* ── Los cinco tipos de reacción ──────────────────────────────────────────── */
export type TipoId = "sintesis" | "descomposicion" | "desplazamiento" | "doble" | "combustion";

export interface TipoInfo {
  id: TipoId;
  label: string;
  patron: string;
  color: string;
  icono: string;
  definicion: string;
}

export const TIPOS: TipoInfo[] = [
  {
    id: "sintesis",
    label: "Síntesis",
    patron: "A + B → AB",
    color: "#60A5FA",
    icono: "fa-object-group",
    definicion: "Combinación: dos o más sustancias se unen para formar un único producto nuevo. Ejemplo industrial: la síntesis de amoniaco (NH₃) base de los fertilizantes.",
  },
  {
    id: "descomposicion",
    label: "Descomposición",
    patron: "AB → A + B",
    color: "#F87171",
    icono: "fa-object-ungroup",
    definicion: "Una sola sustancia se divide en dos o más componentes más simples. Es el proceso inverso de la síntesis. Ejemplo: la electrólisis del agua para producir hidrógeno verde.",
  },
  {
    id: "desplazamiento",
    label: "Desplazamiento simple",
    patron: "A + BC → AC + B",
    color: "#34D399",
    icono: "fa-right-left",
    definicion: "Un elemento reemplaza (desplaza) a otro dentro de un compuesto. El elemento más reactivo gana el lugar. Ejemplo: el hierro desplaza al cobre en la metalurgia de Cananea, Sonora.",
  },
  {
    id: "doble",
    label: "Doble desplazamiento",
    patron: "AB + CD → AD + CB",
    color: "#FB923C",
    icono: "fa-shuffle",
    definicion: "Los iones de dos compuestos intercambian lugares (metátesis). Puede formar un precipitado o, como aquí, una sal y agua (neutralización ácido-base).",
  },
  {
    id: "combustion",
    label: "Combustión",
    patron: "combustible + O₂ → CO₂ + H₂O",
    color: "#C084FC",
    icono: "fa-fire",
    definicion: "Un combustible reacciona con oxígeno liberando energía (calor y luz). La combustión completa de un hidrocarburo produce CO₂ y H₂O. Mueve las termoeléctricas de la CFE.",
  },
];

export function tipoInfo(id: TipoId): TipoInfo {
  return TIPOS.find((t) => t.id === id) ?? TIPOS[0]!;
}

/* ── Reacciones (ecuaciones verbatim, balanceadas) ────────────────────────── */
export interface Reaccion {
  id: string;
  tipo: TipoId;
  ecuacion: string;        // ecuación química verbatim balanceada
  reactivos: string;       // lado izquierdo, p. ej. "2 H₂ + O₂"
  productos: string;       // lado derecho, p. ej. "2 H₂O"
  nombre: string;
  contexto: string;        // dato verbatim (cotidiano / industria mexicana)
  atoms: RAtom[];
  rbonds: RBond[];         // enlaces en los reactivos
  pbonds: RBond[];         // enlaces en los productos
}

export const REACCIONES: Reaccion[] = [
  /* 1 ── SÍNTESIS: 2 H₂ + O₂ → 2 H₂O ─────────────────────────────────────── */
  {
    id: "sint-agua",
    tipo: "sintesis",
    ecuacion: "2 H₂ + O₂ → 2 H₂O",
    reactivos: "2 H₂ + O₂",
    productos: "2 H₂O",
    nombre: "Formación de agua",
    contexto: "Dos moléculas de hidrógeno se combinan con una de oxígeno para formar agua. Es el ejemplo clásico de síntesis y la reacción inversa de la electrólisis del agua.",
    atoms: [
      { el: "O", from: [-0.55, 0, 0.3], to: [-1.5, -0.2, 0] },   // O0
      { el: "O", from: [ 0.55, 0, 0.3], to: [ 1.5, -0.2, 0] },   // O1
      { el: "H", from: [-2.6,  0.45, 0], to: [-2.2, 0.45, 0] },  // H0 → O0
      { el: "H", from: [-2.6, -0.45, 0], to: [-0.8, 0.45, 0] },  // H1 → O0
      { el: "H", from: [ 2.6,  0.45, 0], to: [ 0.8, 0.45, 0] },  // H2 → O1
      { el: "H", from: [ 2.6, -0.45, 0], to: [ 2.2, 0.45, 0] },  // H3 → O1
    ],
    rbonds: [{ a: 0, b: 1, orden: 2 }, { a: 2, b: 3, orden: 1 }, { a: 4, b: 5, orden: 1 }],
    pbonds: [{ a: 0, b: 2, orden: 1 }, { a: 0, b: 3, orden: 1 }, { a: 1, b: 4, orden: 1 }, { a: 1, b: 5, orden: 1 }],
  },

  /* 2 ── SÍNTESIS: 2 Na + Cl₂ → 2 NaCl ───────────────────────────────────── */
  {
    id: "sint-sal",
    tipo: "sintesis",
    ecuacion: "2 Na + Cl₂ → 2 NaCl",
    reactivos: "2 Na + Cl₂",
    productos: "2 NaCl",
    nombre: "Formación de sal común",
    contexto: "El sodio metálico reacciona con el cloro gaseoso para formar cloruro de sodio (NaCl), la sal de mesa. Cada Na cede un electrón a un Cl: enlace iónico.",
    atoms: [
      { el: "Cl", from: [-0.6, 0, 0.2], to: [-0.85, 0, 0] },   // Cl0
      { el: "Cl", from: [ 0.6, 0, 0.2], to: [ 0.85, 0, 0] },   // Cl1
      { el: "Na", from: [-2.7, 0, 0],   to: [-1.75, 0, 0] },   // Na0 → Cl0
      { el: "Na", from: [ 2.7, 0, 0],   to: [ 1.75, 0, 0] },   // Na1 → Cl1
    ],
    rbonds: [{ a: 0, b: 1, orden: 1 }],
    pbonds: [{ a: 0, b: 2, orden: 1 }, { a: 1, b: 3, orden: 1 }],
  },

  /* 3 ── DESCOMPOSICIÓN: 2 H₂O → 2 H₂ + O₂ ───────────────────────────────── */
  {
    id: "desc-agua",
    tipo: "descomposicion",
    ecuacion: "2 H₂O → 2 H₂ + O₂",
    reactivos: "2 H₂O",
    productos: "2 H₂ + O₂",
    nombre: "Electrólisis del agua",
    contexto: "Una corriente eléctrica separa el agua en hidrógeno y oxígeno. La CFE pilotea plantas de hidrógeno verde en Sonora y Baja California para almacenar energía renovable.",
    atoms: [
      { el: "O", from: [-1.5, -0.2, 0], to: [-0.55, 0, 0.3] },   // O0
      { el: "O", from: [ 1.5, -0.2, 0], to: [ 0.55, 0, 0.3] },   // O1
      { el: "H", from: [-2.2, 0.45, 0], to: [-2.6,  0.45, 0] },  // H0
      { el: "H", from: [-0.8, 0.45, 0], to: [-2.6, -0.45, 0] },  // H1
      { el: "H", from: [ 0.8, 0.45, 0], to: [ 2.6,  0.45, 0] },  // H2
      { el: "H", from: [ 2.2, 0.45, 0], to: [ 2.6, -0.45, 0] },  // H3
    ],
    rbonds: [{ a: 0, b: 2, orden: 1 }, { a: 0, b: 3, orden: 1 }, { a: 1, b: 4, orden: 1 }, { a: 1, b: 5, orden: 1 }],
    pbonds: [{ a: 0, b: 1, orden: 2 }, { a: 2, b: 3, orden: 1 }, { a: 4, b: 5, orden: 1 }],
  },

  /* 4 ── DESPLAZAMIENTO SIMPLE: Fe + CuSO₄ → FeSO₄ + Cu ──────────────────── */
  {
    id: "desp-cobre",
    tipo: "desplazamiento",
    ecuacion: "Fe + CuSO₄ → FeSO₄ + Cu",
    reactivos: "Fe + CuSO₄",
    productos: "FeSO₄ + Cu",
    nombre: "El hierro desplaza al cobre",
    contexto: "El hierro, más reactivo, desplaza al cobre del sulfato de cobre: así se recupera cobre de los relaves mineros en Cananea, Sonora. El grupo sulfato (SO₄) queda intacto.",
    atoms: [
      { el: "Fe", from: [-2.9, 0, 0],   to: [-0.5, 0, 0] },     // Fe (libre → enlazado)
      { el: "Cu", from: [-0.5, 0, 0],   to: [ 3.4, 0, 0] },     // Cu (enlazado → libre)
      { el: "S",  from: [ 1.2, 0, 0],   to: [ 1.2, 0, 0] },     // S (estático)
      { el: "O",  from: [ 1.2, 1.0, 0], to: [ 1.2, 1.0, 0] },   // O0
      { el: "O",  from: [ 1.2, -1.0, 0],to: [ 1.2, -1.0, 0] },  // O1
      { el: "O",  from: [ 2.2, 0, 0],   to: [ 2.2, 0, 0] },     // O2
      { el: "O",  from: [ 0.4, 0, 0.5], to: [ 0.4, 0, 0.5] },   // O3 (enlaza al metal)
    ],
    rbonds: [{ a: 1, b: 6, orden: 1 }, { a: 2, b: 3, orden: 1 }, { a: 2, b: 4, orden: 1 }, { a: 2, b: 5, orden: 1 }, { a: 2, b: 6, orden: 1 }],
    pbonds: [{ a: 0, b: 6, orden: 1 }, { a: 2, b: 3, orden: 1 }, { a: 2, b: 4, orden: 1 }, { a: 2, b: 5, orden: 1 }, { a: 2, b: 6, orden: 1 }],
  },

  /* 5 ── DOBLE DESPLAZAMIENTO: HCl + NaOH → NaCl + H₂O ───────────────────── */
  {
    id: "doble-neutral",
    tipo: "doble",
    ecuacion: "HCl + NaOH → NaCl + H₂O",
    reactivos: "HCl + NaOH",
    productos: "NaCl + H₂O",
    nombre: "Neutralización ácido-base",
    contexto: "Un ácido (HCl) y una base (NaOH) intercambian sus iones: se forman sal (NaCl, sal de mesa) y agua. Es la reacción de los antiácidos que neutralizan el ácido del estómago.",
    atoms: [
      { el: "H",  from: [-2.6, 0, 0],    to: [ 0.85, 0.45, 0] }, // H0 (de HCl → agua)
      { el: "Cl", from: [-1.6, 0, 0],    to: [-1.3, 0, 0] },     // Cl
      { el: "Na", from: [ 1.2, 0, 0],    to: [-2.2, 0, 0] },     // Na (→ Cl)
      { el: "O",  from: [ 2.1, 0, 0],    to: [ 1.5, -0.1, 0] },  // O
      { el: "H",  from: [ 2.7, 0.55, 0], to: [ 2.15, 0.45, 0] }, // H1 (de OH, queda en agua)
    ],
    rbonds: [{ a: 0, b: 1, orden: 1 }, { a: 2, b: 3, orden: 1 }, { a: 3, b: 4, orden: 1 }],
    pbonds: [{ a: 2, b: 1, orden: 1 }, { a: 3, b: 0, orden: 1 }, { a: 3, b: 4, orden: 1 }],
  },

  /* 6 ── COMBUSTIÓN: CH₄ + 2 O₂ → CO₂ + 2 H₂O ───────────────────────────── */
  {
    id: "comb-metano",
    tipo: "combustion",
    ecuacion: "CH₄ + 2 O₂ → CO₂ + 2 H₂O",
    reactivos: "CH₄ + 2 O₂",
    productos: "CO₂ + 2 H₂O",
    nombre: "Combustión del gas natural",
    contexto: "El metano (gas natural) arde con oxígeno y produce dióxido de carbono y agua, liberando energía. Es la base de las estufas y de buena parte de la electricidad en México.",
    atoms: [
      { el: "C", from: [-1.9, 0, 0],    to: [ 0, 0, 0] },        // C
      { el: "H", from: [-1.9, 0.95, 0], to: [-2.9, 1.1, 0] },    // H0 → agua izq
      { el: "H", from: [-1.9, -0.95, 0],to: [-1.7, 1.1, 0] },    // H1 → agua izq
      { el: "H", from: [-2.7, 0, 0.4],  to: [ 1.7, 1.1, 0] },    // H2 → agua der
      { el: "H", from: [-1.1, 0, 0.4],  to: [ 2.9, 1.1, 0] },    // H3 → agua der
      { el: "O", from: [ 1.0, 0.7, 0],  to: [-0.95, 0, 0] },     // O0 → CO₂
      { el: "O", from: [ 1.9, 0.7, 0],  to: [ 0.95, 0, 0] },     // O1 → CO₂
      { el: "O", from: [ 1.0, -0.7, 0], to: [-2.3, 0.6, 0] },    // O2 → agua izq
      { el: "O", from: [ 1.9, -0.7, 0], to: [ 2.3, 0.6, 0] },    // O3 → agua der
    ],
    rbonds: [
      { a: 0, b: 1, orden: 1 }, { a: 0, b: 2, orden: 1 }, { a: 0, b: 3, orden: 1 }, { a: 0, b: 4, orden: 1 },
      { a: 5, b: 6, orden: 2 }, { a: 7, b: 8, orden: 2 },
    ],
    pbonds: [
      { a: 0, b: 5, orden: 2 }, { a: 0, b: 6, orden: 2 },
      { a: 7, b: 1, orden: 1 }, { a: 7, b: 2, orden: 1 },
      { a: 8, b: 3, orden: 1 }, { a: 8, b: 4, orden: 1 },
    ],
  },
];

export const REACCION_DEF = "sint-agua";

export function reaccion(id: string): Reaccion {
  return REACCIONES.find((r) => r.id === id) ?? REACCIONES[0]!;
}
export function reaccionesDe(tipo: TipoId): Reaccion[] {
  return REACCIONES.filter((r) => r.tipo === tipo);
}

/* ── Conteo de átomos por elemento (idéntico en reactivos y productos) ────── */
export interface ConteoElem { el: Elem; n: number; }

/** Cuenta los átomos por elemento. Como son los MISMOS átomos antes y después,
 *  el conteo prueba la conservación de la masa (igual a ambos lados). */
export function conteo(r: Reaccion): ConteoElem[] {
  const m = new Map<Elem, number>();
  for (const a of r.atoms) m.set(a.el, (m.get(a.el) ?? 0) + 1);
  return [...m.entries()].map(([el, n]) => ({ el, n }));
}
export function totalAtomos(r: Reaccion): number {
  return r.atoms.length;
}

/* ── Fase de la animación a partir del progreso (0 → 1) ───────────────────── */
export type Fase = "reactivos" | "reaccion" | "productos";
export function faseDe(progreso: number): Fase {
  if (progreso <= 0.06) return "reactivos";
  if (progreso >= 0.94) return "productos";
  return "reaccion";
}

/* ── Texto didáctico (verbatim-alineado con A1/A5) ────────────────────────── */
export const IDEAS: string[] = [
  "Una reacción química reorganiza los átomos: se rompen enlaces y se forman otros nuevos, pero ningún átomo se crea ni se destruye (ley de conservación de la masa, Lavoisier).",
  "Síntesis o combinación (A + B → AB): dos o más sustancias se unen en un solo producto. Ej.: 2 Mg + O₂ → 2 MgO.",
  "Descomposición (AB → A + B): una sustancia se divide en otras más simples. Es la reacción inversa de la síntesis. Ej.: 2 H₂O₂ → 2 H₂O + O₂.",
  "Desplazamiento simple (A + BC → AC + B): un elemento reemplaza a otro en un compuesto, según la serie de reactividad. Ej.: Zn + H₂SO₄ → ZnSO₄ + H₂.",
  "Doble desplazamiento (AB + CD → AD + CB): los iones de dos compuestos intercambian lugares. Puede formar un precipitado: AgNO₃ + NaCl → AgCl↓ + NaNO₃.",
  "Combustión: un combustible reacciona con oxígeno y libera energía. La combustión completa de hidrocarburos da CO₂ y H₂O; la incompleta produce CO tóxico.",
  "Para PREDECIR los productos, primero identifica el TIPO de reacción: el patrón te dice cómo se reorganizan los átomos.",
];

export interface Dato { valor: string; texto: string; icono: string; }
export const DATOS: Dato[] = [
  { valor: "5 tipos", texto: "síntesis, descomposición, desplazamiento, doble desplazamiento y combustión", icono: "fa-shapes" },
  { valor: "masa constante", texto: "la masa de los reactivos = la masa de los productos (Lavoisier)", icono: "fa-scale-balanced" },
  { valor: "se reorganizan", texto: "los átomos se reacomodan; los enlaces se rompen y se forman", icono: "fa-atom" },
  { valor: "se predicen", texto: "el tipo de reacción permite anticipar los productos", icono: "fa-wand-magic-sparkles" },
];

/** Reto verbatim (A5 actividad_final): clasificar y predecir productos. */
export const RETO: { intro: string; items: string[] } = {
  intro: "Clasifica las siguientes reacciones según su tipo y predice los productos:",
  items: [
    "a)  Ca + Cl₂ → ?",
    "b)  CaCO₃ → ?",
    "c)  C₂H₅OH + O₂ → ?",
    "d)  Pb(NO₃)₂ + 2 KI → ?",
  ],
};
