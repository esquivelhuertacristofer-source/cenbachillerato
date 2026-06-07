/**
 * Datos y química PURA del laboratorio "Equilibrio químico y reacciones
 * reversibles" (CNEYT-IV·O3 — UAC "El poder de la química").
 *
 * Propósito formativo O3 (verbatim): "Comprende el concepto de equilibrio
 * químico y la dinámica de las reacciones reversibles e irreversibles, para
 * identificarlas en fenómenos naturales cotidianos o de interés."
 * Contenidos formativos C3 (verbatim): "Reacciones reversibles e irreversibles ·
 * Constante y ecuación de equilibrio químico · Identificación de reacciones
 * reversibles e irreversibles en la naturaleza."
 *
 * Este módulo es DATOS PUROS: cálculo del cociente de reacción Q, la constante
 * de equilibrio Kc y la predicción de Le Châtelier. NO importa three / R3F
 * (regla del Worker de Cloudflare ≤ 3 MiB gzip). Toda la química es exacta para
 * los valores tabulados; la escena 3D es esquemática (no a escala).
 */

export type Modo = "reversible" | "constante" | "lechatelier" | "comparar";
export const MODOS: Modo[] = ["reversible", "constante", "lechatelier", "comparar"];

interface ModoDef {
  etq: string;
  subtitulo: string;
  icono: string;
  color: string;
}

export const MODOS_DEF: Record<Modo, ModoDef> = {
  reversible: {
    etq: "Equilibrio dinámico",
    subtitulo: "las velocidades se igualan",
    icono: "fa-arrows-rotate",
    color: "#fb923c",
  },
  constante: {
    etq: "Constante Kc",
    subtitulo: "Q se acerca a K",
    icono: "fa-scale-balanced",
    color: "#38bdf8",
  },
  lechatelier: {
    etq: "Le Châtelier",
    subtitulo: "el sistema responde",
    icono: "fa-weight-hanging",
    color: "#a78bfa",
  },
  comparar: {
    etq: "Comparar",
    subtitulo: "reversible vs irreversible",
    icono: "fa-table-list",
    color: "#34d399",
  },
};

/* ── Fases de animación por modo ─────────────────────────────────────────── */
export const FASES: Record<Exclude<Modo, "comparar">, string[]> = {
  reversible: [
    "Inicio: solo reactivo",
    "Reacción directa rápida",
    "Aparece la inversa",
    "Las velocidades se acercan",
    "Equilibrio dinámico",
  ],
  constante: [
    "Mezcla inicial (Q = 0)",
    "Avanza la reacción",
    "Se forma producto",
    "Q se acerca a Kc",
    "Equilibrio: Q = Kc",
  ],
  lechatelier: [
    "Equilibrio establecido",
    "Aplicamos la presión",
    "El sistema se desplaza",
    "Nuevo equilibrio",
  ],
};

export function numFases(modo: Modo): number {
  if (modo === "comparar") return 1;
  return FASES[modo].length;
}

export interface Escena {
  modo: Modo;
  nombre: string;
  desc: string;
  medio: string;
  frac: number; // 0 → 1 a lo largo de las fases
}

export function escenaPara(modo: Modo, idx: number): Escena {
  if (modo === "comparar") {
    return {
      modo,
      nombre: "Reversible vs irreversible",
      desc: "Una reacción reversible llega al equilibrio (⇌); una irreversible se agota (→).",
      medio: "Tres sistemas lado a lado",
      frac: 1,
    };
  }
  const fases = FASES[modo];
  const n = fases.length;
  const i = Math.min(Math.max(0, idx), n - 1);
  const frac = n > 1 ? i / (n - 1) : 1;
  const nombre = fases[i] ?? "";

  const descs: Record<Exclude<Modo, "comparar">, string[]> = {
    reversible: [
      "El recipiente solo tiene N₂O₄ incoloro: la velocidad inversa es cero.",
      "El N₂O₄ se rompe en NO₂ pardo; la velocidad directa es máxima.",
      "Ya hay NO₂ suficiente para que vuelva a unirse: empieza la reacción inversa.",
      "La directa baja y la inversa sube; las concentraciones cambian cada vez menos.",
      "Las dos velocidades son iguales: las concentraciones se mantienen constantes (no cero).",
    ],
    constante: [
      "Solo hay N₂ y H₂: no hay NH₃, así que Q = 0 (muy lejos de Kc).",
      "Las moléculas chocan y empieza a formarse amoniaco; Q crece desde cero.",
      "Se acumula NH₃ y se consumen N₂ e H₂; el cociente Q sube.",
      "Q se aproxima al valor de la constante Kc del sistema.",
      "Q = Kc: el sistema está en equilibrio; las concentraciones ya no cambian.",
    ],
    lechatelier: [
      "El sistema 2 NO₂ ⇌ N₂O₄ está en equilibrio dentro del pistón.",
      "Comprimimos: subimos la presión reduciendo el volumen del gas.",
      "Para contrarrestar, el equilibrio se desplaza hacia el lado de MENOS moles de gas.",
      "Se forma más N₂O₄ (1 mol) a costa del NO₂ (2 mol): nuevo equilibrio.",
    ],
  };
  const medios: Record<Exclude<Modo, "comparar">, string> = {
    reversible: "N₂O₄ ⇌ 2 NO₂ (recipiente cerrado)",
    constante: "N₂ + 3 H₂ ⇌ 2 NH₃ (proceso Haber)",
    lechatelier: "2 NO₂ ⇌ N₂O₄ (pistón)",
  };

  return {
    modo,
    nombre,
    desc: descs[modo][i] ?? "",
    medio: medios[modo],
    frac,
  };
}

/* ── Catálogo de reacciones (Kc reales tabulados) ─────────────────────────── */
export interface Especie {
  formula: string;
  coef: number;
}

export interface Reaccion {
  id: string;
  nombre: string;
  ecuacion: string;
  reactivos: Especie[];
  productos: Especie[];
  kc: number; // constante de equilibrio (adimensional en este uso didáctico)
  temperatura: string;
  deltaH: number; // kJ/mol de la reacción DIRECTA (+ endotérmica, − exotérmica)
  molesGasIzq: number; // moles de gas del lado reactivos (0 = en disolución)
  molesGasDer: number; // moles de gas del lado productos
  enDisolucion: boolean;
  contexto: string;
}

export const REACCIONES: Reaccion[] = [
  {
    id: "n2o4",
    nombre: "Tetróxido ⇌ dióxido de nitrógeno",
    ecuacion: "N₂O₄ ⇌ 2 NO₂",
    reactivos: [{ formula: "N₂O₄", coef: 1 }],
    productos: [{ formula: "NO₂", coef: 2 }],
    kc: 4.6e-3,
    temperatura: "25 °C",
    deltaH: 57.2,
    molesGasIzq: 1,
    molesGasDer: 2,
    enDisolucion: false,
    contexto: "El NO₂ pardo es el color del esmog fotoquímico; calentarlo lo intensifica (es endotérmico).",
  },
  {
    id: "hi",
    nombre: "Síntesis de yoduro de hidrógeno",
    ecuacion: "H₂ + I₂ ⇌ 2 HI",
    reactivos: [
      { formula: "H₂", coef: 1 },
      { formula: "I₂", coef: 1 },
    ],
    productos: [{ formula: "HI", coef: 2 }],
    kc: 50.5,
    temperatura: "448 °C",
    deltaH: -9.5,
    molesGasIzq: 2,
    molesGasDer: 2,
    enDisolucion: false,
    contexto: "El número de moles de gas es igual en ambos lados, así que la presión no desplaza este equilibrio.",
  },
  {
    id: "haber",
    nombre: "Proceso Haber-Bosch (amoniaco)",
    ecuacion: "N₂ + 3 H₂ ⇌ 2 NH₃",
    reactivos: [
      { formula: "N₂", coef: 1 },
      { formula: "H₂", coef: 3 },
    ],
    productos: [{ formula: "NH₃", coef: 2 }],
    kc: 6.0e-2,
    temperatura: "500 °C",
    deltaH: -92.2,
    molesGasIzq: 4,
    molesGasDer: 2,
    enDisolucion: false,
    contexto: "Base de los fertilizantes nitrogenados: alta presión favorece el NH₃ (menos moles de gas).",
  },
  {
    id: "acetico",
    nombre: "Ionización del ácido acético (vinagre)",
    ecuacion: "CH₃COOH ⇌ CH₃COO⁻ + H⁺",
    reactivos: [{ formula: "CH₃COOH", coef: 1 }],
    productos: [
      { formula: "CH₃COO⁻", coef: 1 },
      { formula: "H⁺", coef: 1 },
    ],
    kc: 1.8e-5,
    temperatura: "25 °C",
    enDisolucion: true,
    deltaH: 0.5,
    molesGasIzq: 0,
    molesGasDer: 0,
    contexto: "En disolución acuosa: la Ka tan pequeña dice que el vinagre se ioniza muy poco (ácido débil).",
  },
];

export function reaccionPorId(id: string): Reaccion {
  return REACCIONES.find((r) => r.id === id) ?? (REACCIONES[0] as Reaccion);
}

/* ── Química PURA ─────────────────────────────────────────────────────────── */

/**
 * Cociente de reacción Q = ∏[productos]^coef / ∏[reactivos]^coef.
 * `conc` mapea fórmula → concentración molar. Si un reactivo es 0, Q = ∞.
 */
export function cocienteQ(r: Reaccion, conc: Record<string, number>): number {
  let num = 1;
  for (const p of r.productos) num *= Math.pow(Math.max(0, conc[p.formula] ?? 0), p.coef);
  let den = 1;
  for (const a of r.reactivos) den *= Math.pow(Math.max(0, conc[a.formula] ?? 0), a.coef);
  if (den <= 0) return num <= 0 ? 0 : Infinity;
  return num / den;
}

export type Sentido = "directa" | "inversa" | "equilibrio";

export interface EvalEquilibrio {
  q: number;
  kc: number;
  sentido: Sentido;
  texto: string;
}

/**
 * Compara Q con Kc para decidir el sentido del avance.
 *  Q < Kc → se forma producto (directa →).
 *  Q > Kc → se forma reactivo (inversa ←).
 *  Q ≈ Kc → en equilibrio.
 * La tolerancia es relativa (2 %) para evitar falsos "no equilibrio".
 */
export function evaluarEquilibrio(r: Reaccion, conc: Record<string, number>): EvalEquilibrio {
  const q = cocienteQ(r, conc);
  const kc = r.kc;
  const rel = kc > 0 ? Math.abs(q - kc) / kc : Math.abs(q - kc);
  let sentido: Sentido;
  let texto: string;
  if (!isFinite(q)) {
    sentido = "directa";
    texto = "No hay productos (Q ≈ 0): la reacción avanza hacia la derecha hasta que Q = Kc.";
  } else if (rel <= 0.02) {
    sentido = "equilibrio";
    texto = "Q ≈ Kc: el sistema ya está en equilibrio; las concentraciones no cambian.";
  } else if (q < kc) {
    sentido = "directa";
    texto = "Q < Kc: sobran reactivos, así que la reacción se desplaza hacia la derecha (forma productos).";
  } else {
    sentido = "inversa";
    texto = "Q > Kc: sobran productos, así que la reacción se desplaza hacia la izquierda (regenera reactivos).";
  }
  return { q, kc, sentido, texto };
}

export type Perturbacion =
  | "agregar-reactivo"
  | "agregar-producto"
  | "subir-presion"
  | "subir-temperatura";

export const PERTURBACIONES: { id: Perturbacion; etq: string; icono: string }[] = [
  { id: "agregar-reactivo", etq: "Agregar reactivo", icono: "fa-flask-vial" },
  { id: "agregar-producto", etq: "Agregar producto", icono: "fa-vial" },
  { id: "subir-presion", etq: "Subir la presión", icono: "fa-compress" },
  { id: "subir-temperatura", etq: "Subir la temperatura", icono: "fa-temperature-high" },
];

export interface PrediccionLC {
  sentido: "directa" | "inversa" | "sin-cambio";
  flecha: "→" | "←" | "=";
  texto: string;
}

/**
 * Predicción de Le Châtelier: ante una perturbación, el sistema se opone.
 *  - Agregar reactivo → derecha; agregar producto → izquierda.
 *  - Subir presión → hacia el lado de MENOS moles de gas (sin efecto si son iguales o en disolución).
 *  - Subir temperatura → hacia donde se ABSORBE calor: endotérmica directa (ΔH>0) → derecha;
 *    exotérmica directa (ΔH<0) → izquierda.
 */
export function prediceLeChatelier(r: Reaccion, p: Perturbacion): PrediccionLC {
  switch (p) {
    case "agregar-reactivo":
      return { sentido: "directa", flecha: "→", texto: "Al añadir reactivo, el equilibrio se desplaza a la derecha para consumirlo." };
    case "agregar-producto":
      return { sentido: "inversa", flecha: "←", texto: "Al añadir producto, el equilibrio se desplaza a la izquierda para consumirlo." };
    case "subir-presion": {
      if (r.enDisolucion || r.molesGasIzq === r.molesGasDer) {
        return { sentido: "sin-cambio", flecha: "=", texto: "Hay los mismos moles de gas en ambos lados (o es en disolución): la presión no desplaza el equilibrio." };
      }
      if (r.molesGasDer < r.molesGasIzq) {
        return { sentido: "directa", flecha: "→", texto: `Más presión favorece el lado con menos moles de gas: la derecha (${r.molesGasDer} vs ${r.molesGasIzq}).` };
      }
      return { sentido: "inversa", flecha: "←", texto: `Más presión favorece el lado con menos moles de gas: la izquierda (${r.molesGasIzq} vs ${r.molesGasDer}).` };
    }
    case "subir-temperatura":
      if (r.deltaH > 0) {
        return { sentido: "directa", flecha: "→", texto: "La reacción directa es endotérmica (absorbe calor): más temperatura la favorece (derecha)." };
      }
      return { sentido: "inversa", flecha: "←", texto: "La reacción directa es exotérmica (libera calor): más temperatura favorece la inversa (izquierda)." };
  }
}

/* ── Formato numérico (es-MX) ─────────────────────────────────────────────── */
export function fmtNum(n: number, dec = 2): string {
  if (!isFinite(n)) return "∞";
  const abs = Math.abs(n);
  if (abs !== 0 && (abs >= 1e5 || abs < 1e-2)) {
    return n.toExponential(2).replace("e", " × 10^").replace("+", "");
  }
  return n.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: dec });
}

export function fmtEntero(n: number): string {
  return Math.round(n).toLocaleString("es-MX");
}

/* ── Tabla comparativa reversible vs irreversible ─────────────────────────── */
export interface FilaComparacion {
  rasgo: string;
  reversible: string;
  irreversible: string;
}

export const COMPARACION: FilaComparacion[] = [
  { rasgo: "Flecha", reversible: "Doble (⇌)", irreversible: "Sencilla (→)" },
  { rasgo: "Avance", reversible: "Llega a un equilibrio", irreversible: "Se agota un reactivo" },
  { rasgo: "Al final", reversible: "Coexisten reactivos y productos", irreversible: "Casi solo productos" },
  { rasgo: "Velocidades", reversible: "v directa = v inversa", irreversible: "v inversa ≈ 0" },
  { rasgo: "Constante", reversible: "Kc finita y medible", irreversible: "Kc enorme (→ ∞)" },
  { rasgo: "Ejemplo", reversible: "N₂ + 3 H₂ ⇌ 2 NH₃", irreversible: "Combustión: CH₄ + 2 O₂ → CO₂ + 2 H₂O" },
  { rasgo: "En la naturaleza", reversible: "CO₂ ⇌ ácido carbónico en sangre", irreversible: "Oxidación (herrumbre) del hierro" },
];

/* ── Contenido didáctico ──────────────────────────────────────────────────── */
export const PROBLEMA =
  "Una reacción reversible (⇌) avanza en los dos sentidos a la vez. Al principio solo ocurre la reacción directa; al acumularse productos, empieza la inversa. Cuando ambas velocidades se igualan se alcanza el EQUILIBRIO DINÁMICO: las concentraciones dejan de cambiar (aunque las moléculas siguen reaccionando). La constante Kc = [productos]^coef / [reactivos]^coef resume ese punto; el cociente Q se calcula igual con las concentraciones del momento y, al compararlo con Kc, dice hacia dónde se moverá el sistema. Manipula los modos para ver el equilibrio formarse, calcular Q vs Kc y aplicar el principio de Le Châtelier.";

export const INSTRUCCIONES: Record<Modo, string[]> = {
  reversible: [
    "Observa el recipiente: arranca con solo N₂O₄ incoloro y la velocidad inversa en cero.",
    "Avanza las fases con ▶ o la barra y mira cómo aparece el NO₂ pardo.",
    "Fíjate en las dos flechas de velocidad: la directa baja y la inversa sube.",
    "En la última fase, las velocidades se igualan: es el equilibrio dinámico (¡no es que se detenga!).",
  ],
  constante: [
    "Parte de N₂ + H₂ sin amoniaco: el cociente Q vale 0.",
    "Avanza las fases y observa cómo se forma NH₃ y Q sube en el medidor.",
    "Compara la barra de Q con la línea fija de Kc.",
    "El equilibrio se alcanza cuando Q = Kc; usa la calculadora A2 para verlo con números.",
  ],
  lechatelier: [
    "Empieza en equilibrio dentro del pistón (2 NO₂ ⇌ N₂O₄).",
    "Avanza para comprimir el gas: la presión sube.",
    "Observa el desplazamiento hacia el lado con menos moles de gas.",
    "En la calculadora, prueba otras perturbaciones (calor, concentración) y predice el sentido.",
  ],
  comparar: [
    "Revisa la tabla: una reacción reversible deja reactivos y productos; una irreversible los agota.",
    "Relaciona cada rasgo (flecha, Kc, velocidades) con lo que viste en los otros modos.",
    "Identifica ejemplos reversibles e irreversibles en la naturaleza.",
  ],
};

export const PREGUNTAS: Record<Modo, string[]> = {
  reversible: [
    "Si en el equilibrio las moléculas siguen reaccionando, ¿por qué las concentraciones ya no cambian?",
    "¿Por qué al inicio la velocidad inversa es exactamente cero?",
    "¿Qué significaría que la velocidad directa siga siendo mayor que la inversa?",
  ],
  constante: [
    "¿Qué le pasa a Q a medida que se forma producto, y hasta qué valor puede llegar?",
    "Si Kc es muy grande, ¿el equilibrio favorece reactivos o productos?",
    "Dos sistemas con la misma Kc pero distintas concentraciones, ¿están ambos en equilibrio?",
  ],
  lechatelier: [
    "¿Por qué comprimir el gas desplaza el equilibrio hacia menos moles de gas?",
    "Si la reacción directa es exotérmica, ¿calentar produce más o menos producto?",
    "¿Por qué un catalizador NO desplaza el equilibrio?",
  ],
  comparar: [
    "¿Cómo distingues en una ecuación si la reacción es reversible o irreversible?",
    "¿Por qué la combustión se considera irreversible en la práctica?",
    "Da un ejemplo de equilibrio reversible dentro de tu propio cuerpo.",
  ],
};

export const IDEAS: string[] = [
  "El equilibrio químico es dinámico: las reacciones directa e inversa siguen ocurriendo, pero a la misma velocidad.",
  "En el equilibrio las concentraciones son constantes, pero NO necesariamente iguales entre reactivos y productos.",
  "Kc = [productos]^coef / [reactivos]^coef; su valor depende solo de la temperatura.",
  "El cociente Q se calcula igual que Kc pero con las concentraciones del momento: comparándolos sabes hacia dónde se mueve la reacción.",
  "Kc grande ⇒ el equilibrio favorece productos; Kc pequeña ⇒ favorece reactivos.",
  "Le Châtelier: si perturbas un sistema en equilibrio, este se desplaza para contrarrestar el cambio.",
  "Subir la presión desplaza hacia el lado con menos moles de gas; subir la temperatura, hacia el lado endotérmico.",
  "Un catalizador acelera por igual ambas reacciones: alcanza el equilibrio antes, pero no lo desplaza.",
];

export const GLOSARIO: { termino: string; definicion: string; ejemplo: string }[] = [
  { termino: "Reacción reversible", definicion: "La que ocurre en ambos sentidos y puede alcanzar un equilibrio; se escribe con doble flecha ⇌.", ejemplo: "N₂O₄ ⇌ 2 NO₂." },
  { termino: "Reacción irreversible", definicion: "La que avanza prácticamente solo en un sentido hasta agotar un reactivo; se escribe con →.", ejemplo: "La combustión del metano: CH₄ + 2 O₂ → CO₂ + 2 H₂O." },
  { termino: "Equilibrio químico", definicion: "Estado en que las velocidades directa e inversa son iguales y las concentraciones permanecen constantes.", ejemplo: "Una botella de refresco cerrada: CO₂(g) ⇌ CO₂(ac)." },
  { termino: "Equilibrio dinámico", definicion: "El equilibrio no es reposo: las moléculas siguen reaccionando en ambos sentidos al mismo ritmo.", ejemplo: "En el equilibrio, por cada N₂O₄ que se rompe, otro se forma." },
  { termino: "Constante de equilibrio (Kc)", definicion: "Cociente [productos]^coef / [reactivos]^coef en el equilibrio; depende solo de la temperatura.", ejemplo: "Para H₂ + I₂ ⇌ 2 HI, Kc = 50.5 a 448 °C." },
  { termino: "Cociente de reacción (Q)", definicion: "Mismo cociente que Kc pero con las concentraciones de cualquier instante; predice el sentido del avance.", ejemplo: "Si Q < Kc, la reacción avanza hacia los productos." },
  { termino: "Principio de Le Châtelier", definicion: "Si se altera un sistema en equilibrio, este se desplaza en el sentido que contrarresta la alteración.", ejemplo: "Más presión sobre N₂ + 3 H₂ ⇌ 2 NH₃ favorece el amoniaco." },
  { termino: "Velocidad de reacción", definicion: "Rapidez con que cambian las concentraciones; en el equilibrio la directa y la inversa coinciden.", ejemplo: "Al inicio la directa es máxima y la inversa nula." },
  { termino: "Endotérmica / exotérmica", definicion: "La que absorbe (ΔH>0) o libera (ΔH<0) calor; determina el efecto de la temperatura sobre el equilibrio.", ejemplo: "N₂O₄ ⇌ 2 NO₂ es endotérmica: calentar produce más NO₂ pardo." },
  { termino: "Catalizador", definicion: "Sustancia que acelera ambas reacciones por igual; acerca el equilibrio sin desplazarlo ni cambiar Kc.", ejemplo: "El hierro cataliza el proceso Haber-Bosch." },
];

export const CONTEXTO =
  "En México el equilibrio químico está por todas partes. El proceso Haber-Bosch (N₂ + 3 H₂ ⇌ 2 NH₃) sostiene la producción de fertilizantes nitrogenados del campo mexicano. El NO₂ pardo del equilibrio N₂O₄ ⇌ 2 NO₂ es parte del esmog del Valle de México que monitorea el SIMAT. En tu sangre, el equilibrio CO₂ + H₂O ⇌ H₂CO₃ ⇌ HCO₃⁻ + H⁺ regula el pH (sistema amortiguador del bicarbonato). Y el equilibrio CO₂(g) ⇌ CO₂(ac) explica por qué un refresco pierde su gas al abrirlo.";

export const FUENTE =
  "MCCEMS · Ciencias Naturales, Experimentales y Tecnología IV — 'El poder de la química'. Propósito formativo O3 y contenidos C3 (reacciones reversibles e irreversibles; constante y ecuación de equilibrio). Valores de Kc y ΔH de tablas estándar de química general.";

export interface EjemploResuelto {
  enunciado: string;
  datos: string[];
  solucion: string;
  resultado: string;
}

export const EJEMPLO: EjemploResuelto = {
  enunciado:
    "En un recipiente cerrado a 448 °C se estudia el equilibrio H₂ + I₂ ⇌ 2 HI, cuya constante es Kc = 50.5. En cierto instante se miden [H₂] = 0.20 M, [I₂] = 0.20 M y [HI] = 0.50 M. ¿Está el sistema en equilibrio? Si no, ¿hacia dónde se desplaza?",
  datos: ["Kc = 50.5", "[H₂] = 0.20 M", "[I₂] = 0.20 M", "[HI] = 0.50 M"],
  solucion:
    "Calculamos el cociente Q con las concentraciones del momento: Q = [HI]² / ([H₂]·[I₂]) = (0.50)² / (0.20 × 0.20) = 0.25 / 0.04 = 6.25. Comparamos con la constante: Q = 6.25 es MENOR que Kc = 50.5.",
  resultado:
    "Q (6.25) < Kc (50.5) ⇒ el sistema NO está en equilibrio: se desplaza hacia la derecha (forma más HI) hasta que Q llegue a 50.5.",
};

export interface DatoClave {
  valor: string;
  texto: string;
  icono: string;
}

export const DATOS: DatoClave[] = [
  { valor: "Q vs Kc", texto: "La comparación que predice el sentido: < avanza, > retrocede, = equilibrio.", icono: "fa-scale-balanced" },
  { valor: "⇌", texto: "La doble flecha marca que una reacción es reversible.", icono: "fa-arrows-left-right" },
  { valor: "Kc = 50.5", texto: "Constante de H₂ + I₂ ⇌ 2 HI a 448 °C (favorece HI).", icono: "fa-equals" },
  { valor: "ΔH = −92 kJ", texto: "El proceso Haber es exotérmico: el frío favorece el NH₃.", icono: "fa-temperature-low" },
  { valor: "4 → 2 mol", texto: "Haber pasa de 4 a 2 moles de gas: la presión favorece el producto.", icono: "fa-compress" },
  { valor: "Ka = 1.8·10⁻⁵", texto: "El vinagre se ioniza muy poco: ácido débil en equilibrio.", icono: "fa-flask" },
];

export const HECHOS: string[] = [
  "El proceso Haber-Bosch, premio Nobel 1918, alimenta a casi la mitad de la humanidad vía fertilizantes; trabaja a ~200 atm y ~450 °C de compromiso entre velocidad y equilibrio.",
  "El equilibrio N₂O₄ ⇌ 2 NO₂ es tan visible que se usa en clase: un tubo se vuelve pardo al calentarlo y se aclara al enfriarlo.",
  "Tu respiración depende del equilibrio del bicarbonato: por eso hiperventilar o contener el aire altera el pH de la sangre.",
  "Una reacción 'irreversible' en realidad tiene una Kc gigantesca: el equilibrio existe, pero está tan corrido a productos que no se nota.",
  "Le Châtelier formuló su principio en 1884; hoy guía el diseño industrial para maximizar el rendimiento de productos.",
];
