/**
 * Datos para el laboratorio "Diagrama de cuerpo libre: las leyes de Newton"
 * (CNEYT-V-P01-A2, simulacion "Simulación de fuerzas: diagrama de cuerpo libre
 * interactivo"; UAC CNEYT-V "La energía en procesos de vida diaria"; progresión 1).
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabNewton.tsx) y la escena 3D (NewtonScene.tsx).
 *
 * Idea pedagógica (MCCEMS 2025 — CNEYT-V P1, verbatim A2):
 *  Un DIAGRAMA DE CUERPO LIBRE aísla un objeto y dibuja TODAS las fuerzas que
 *  actúan sobre él (peso, normal, fricción, tensión). Sumadas vectorialmente dan
 *  la fuerza neta ΣF; la 2ª ley de Newton relaciona esa fuerza con el movimiento:
 *    · Si ΣF = 0  → el cuerpo está en EQUILIBRIO (a = 0): reposo o velocidad
 *      constante (1ª ley, inercia).
 *    · Si ΣF ≠ 0  → el cuerpo ACELERA según a = ΣF / m (2ª ley).
 *
 * Tres escenarios verbatim del A2 (caja en plano horizontal, caja en plano
 * inclinado a 30°, sistema con polea). Variables a explorar: masa, ángulo del
 * plano, coeficiente de fricción estática y cinética, tensión en cuerdas.
 *
 * Toda la física es EXACTA (cálculo cerrado). Convenciones:
 *  · g = 9.81 m/s² (coherente con los demás labs de física del proyecto).
 *  · Peso  W = m·g.  Normal en plano horizontal  N = m·g.
 *  · Fricción: estática hasta f_s,máx = μ_s·N; al deslizar, cinética f_k = μ_k·N
 *    (siempre opuesta al movimiento).
 *  · Plano inclinado: N = m·g·cosθ, componente del peso a favor = m·g·senθ.
 *  · Polea (m₁ sobre mesa unida por cuerda a m₂ colgante): la cuerda transmite
 *    la misma tensión T; el sistema arranca si m₂·g supera la fricción estática
 *    máxima sobre m₁.
 */

export type Modo = "horizontal" | "inclinado" | "polea";

/* ── Constantes ───────────────────────────────────────────────────────────── */
export const G = 9.81; // m/s²

/* ── Rangos explorables (sliders) ─────────────────────────────────────────── */
export const M_MIN = 0.5;
export const M_MAX = 10;
export const F_MIN = 0;
export const F_MAX = 40;
export const TH_MIN = 5;   // grados
export const TH_MAX = 45;  // grados
export const MU_MIN = 0;
export const MU_MAX = 1;

/* ── Valores iniciales (verbatim: el inclinado a 30°) ─────────────────────── */
export const M_DEF = 2;     // kg
export const F_DEF = 10;    // N (fuerza aplicada horizontal)
export const TH_DEF = 30;   // grados
export const M1_DEF = 3;    // kg (sobre la mesa)
export const M2_DEF = 2;    // kg (colgante)
export const MUS_DEF = 0.3; // coef. estático
export const MUK_DEF = 0.2; // coef. cinético

/* ── Resultado de un diagrama de cuerpo libre ─────────────────────────────── */
export interface DCL {
  W: number;        // peso m·g (N)
  N: number;        // normal (N)
  fric: number;     // fricción (N), magnitud
  fsMax: number;    // fricción estática máxima μ_s·N (N)
  aplicada: number; // fuerza "motriz" del escenario (N): F aplicada / m·g·senθ / m₂·g
  T?: number;       // tensión en la cuerda (N), solo polea
  Wpar?: number;    // componente del peso a favor del plano, m·g·senθ (N) — inclinado
  Wperp?: number;   // componente del peso normal al plano, m·g·cosθ (N) — inclinado
  neto: number;     // fuerza neta a lo largo del movimiento (N)
  a: number;        // aceleración (m/s²)
  mueve: boolean;   // ¿el sistema está en movimiento (o a punto)?
}

/* ── Escenario 1: caja en plano HORIZONTAL con fuerza aplicada ────────────── */
export function dclHorizontal(m: number, F: number, muS: number, muK: number): DCL {
  const W = m * G;
  const N = m * G;
  const fsMax = muS * N;
  const mueve = F > fsMax + 1e-9;
  const fric = mueve ? muK * N : F;       // estática iguala a la aplicada hasta f_s,máx
  const neto = mueve ? F - muK * N : 0;
  const a = neto / m;
  return { W, N, fric, fsMax, aplicada: F, neto, a, mueve };
}

/* ── Escenario 2: caja en plano INCLINADO ─────────────────────────────────── */
export function dclInclinado(m: number, thetaDeg: number, muS: number, muK: number): DCL {
  const th = (thetaDeg * Math.PI) / 180;
  const W = m * G;
  const Wpar = m * G * Math.sin(th);   // a favor del plano (bajada)
  const Wperp = m * G * Math.cos(th);  // perpendicular al plano
  const N = Wperp;
  const fsMax = muS * N;
  const mueve = Wpar > fsMax + 1e-9;
  const fric = mueve ? muK * N : Wpar;  // estática iguala a Wpar hasta f_s,máx
  const neto = mueve ? Wpar - muK * N : 0;
  const a = neto / m;                   // = g(senθ − μ_k cosθ)
  return { W, N, fric, fsMax, aplicada: Wpar, Wpar, Wperp, neto, a, mueve };
}

/* ── Escenario 3: sistema con POLEA (m₁ sobre mesa, m₂ colgante) ──────────── */
export function dclPolea(m1: number, m2: number, muS: number, muK: number): DCL {
  const W = m1 * G;          // peso del bloque sobre la mesa
  const N = m1 * G;          // normal sobre la mesa
  const fsMax = muS * N;
  const motriz = m2 * G;     // tira del sistema
  const mueve = motriz > fsMax + 1e-9;
  let a: number, T: number, fric: number, neto: number;
  if (mueve) {
    a = (m2 * G - muK * m1 * G) / (m1 + m2); // sistema acelera
    T = m1 * (a + muK * G);                   // = m2·(g − a)
    fric = muK * N;
    neto = m2 * G - muK * m1 * G;             // fuerza neta del sistema
  } else {
    a = 0;
    T = m2 * G;     // la cuerda sostiene a m₂ en equilibrio
    fric = m2 * G;  // la fricción estática equilibra la tensión (≤ f_s,máx)
    neto = 0;
  }
  return { W, N, fric, fsMax, aplicada: motriz, T, neto, a, mueve };
}

/** Resuelve el DCL del modo activo con los parámetros actuales. */
export function resolver(
  modo: Modo,
  p: { m: number; F: number; theta: number; m1: number; m2: number; muS: number; muK: number },
): DCL {
  if (modo === "horizontal") return dclHorizontal(p.m, p.F, p.muS, p.muK);
  if (modo === "inclinado") return dclInclinado(p.m, p.theta, p.muS, p.muK);
  return dclPolea(p.m1, p.m2, p.muS, p.muK);
}

/* ── Metadatos de cada escenario (para selector y textos) ─────────────────── */
export interface EscenarioInfo {
  modo: Modo;
  etiqueta: string;
  icono: string;
  titulo: string;
  modelo: string[];   // ecuaciones clave (verbatim-alineadas)
}

export const ESCENARIOS: EscenarioInfo[] = [
  {
    modo: "horizontal",
    etiqueta: "Plano horizontal",
    icono: "fa-square",
    titulo: "Caja en plano horizontal",
    modelo: [
      "W = m·g     N = m·g",
      "f_s,máx = μ_s·N   (no se mueve hasta superarla)",
      "Si F > f_s,máx → f_k = μ_k·N",
      "ΣF = F − f_k     a = ΣF / m",
    ],
  },
  {
    modo: "inclinado",
    etiqueta: "Plano inclinado",
    icono: "fa-mountain",
    titulo: "Caja en plano inclinado",
    modelo: [
      "N = m·g·cosθ",
      "Peso a favor del plano = m·g·senθ",
      "f_s,máx = μ_s·N    f_k = μ_k·N",
      "a = g(senθ − μ_k·cosθ)",
    ],
  },
  {
    modo: "polea",
    etiqueta: "Sistema con polea",
    icono: "fa-link",
    titulo: "Bloque sobre mesa + masa colgante",
    modelo: [
      "m₂ colgante:  m₂·g − T = m₂·a",
      "m₁ en la mesa:  T − f_k = m₁·a",
      "a = (m₂·g − μ_k·m₁·g) / (m₁ + m₂)",
      "T = m₁·(a + μ_k·g) = m₂·(g − a)",
    ],
  },
];

export function escenario(modo: Modo): EscenarioInfo {
  return ESCENARIOS.find((e) => e.modo === modo) ?? ESCENARIOS[0]!;
}

/* ── Método del DCL paso a paso (verbatim-alineado a las instrucciones) ───── */
export interface PasoReto { etiqueta: string; texto: string; }

export const PASOS: PasoReto[] = [
  { etiqueta: "1", texto: "Aísla el objeto del sistema (caja en plano horizontal, en plano inclinado a 30° o bloque del sistema con polea) y dibújalo solo." },
  { etiqueta: "2", texto: "Identifica y dibuja TODAS las fuerzas sobre él: peso (siempre hacia abajo), normal (perpendicular a la superficie), fricción (opuesta al movimiento) y tensión (a lo largo de la cuerda)." },
  { etiqueta: "3", texto: "Elige ejes y descompón. En el plano inclinado conviene un eje paralelo y otro perpendicular a la rampa: ahí N = m·g·cosθ y la parte del peso que empuja hacia abajo es m·g·senθ." },
  { etiqueta: "4", texto: "Suma vectorialmente para obtener la fuerza neta ΣF. Si ΣF = 0 el cuerpo está en equilibrio (a = 0); si ΣF ≠ 0 aplica la 2ª ley: a = ΣF / m." },
  { etiqueta: "5", texto: "Verifica con los valores de la simulación y experimenta cambiando la masa, el ángulo o el coeficiente de fricción." },
];

/* ── Preguntas de reflexión (verbatim del A2) ─────────────────────────────── */
export const REFLEXION: string[] = [
  "¿Qué sucede con la aceleración cuando aumenta la masa pero la fuerza neta es igual?",
  "¿Por qué la fricción cinética siempre se opone al movimiento?",
  "¿Cómo cambia la normal en un plano inclinado comparada con el plano horizontal?",
];

/* ── Ideas clave (verbatim-alineadas A2 / A1) ─────────────────────────────── */
export const IDEAS: string[] = [
  "El diagrama de cuerpo libre aísla un objeto y muestra solo las fuerzas que actúan SOBRE él; sumadas dan la fuerza neta ΣF.",
  "1ª ley (inercia): si ΣF = 0 el cuerpo sigue en reposo o a velocidad constante. 2ª ley: si ΣF ≠ 0 acelera con a = ΣF / m.",
  "Con la misma fuerza neta, más masa ⇒ menos aceleración (a = ΣF/m): la masa mide la inercia, la resistencia a cambiar de movimiento.",
  "La fricción cinética f_k = μ_k·N siempre se opone al movimiento; la estática puede crecer hasta f_s,máx = μ_s·N antes de que el cuerpo arranque.",
  "En un plano inclinado la normal NO es el peso: N = m·g·cosθ < m·g, porque la superficie solo sostiene la parte perpendicular del peso.",
  "En la polea la cuerda transmite la misma tensión T a ambos cuerpos (3ª ley, acción–reacción); el sistema entero comparte una sola aceleración.",
];

/* ── Datos rápidos (tarjetas) ─────────────────────────────────────────────── */
export const DATOS: { valor: string; texto: string; icono: string }[] = [
  { valor: "ΣF = m·a", texto: "2ª ley de Newton: la fuerza neta produce aceleración", icono: "fa-arrow-right-long" },
  { valor: "ΣF = 0 → a = 0", texto: "1ª ley: equilibrio, reposo o velocidad constante", icono: "fa-scale-balanced" },
  { valor: "N = m·g·cosθ", texto: "la normal en el plano inclinado, no el peso completo", icono: "fa-mountain" },
  { valor: "f_k = μ_k·N", texto: "fricción cinética, siempre opuesta al movimiento", icono: "fa-shoe-prints" },
];

/* ── Formato (es-MX) ──────────────────────────────────────────────────────── */
const ES = (n: number, dec: number) =>
  n.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: 0 }).replace("-", "−");

export const fmt0 = (n: number): string => ES(n, 0);
export const fmt1 = (n: number): string => ES(n, 1);
export const fmt2 = (n: number): string => ES(n, 2);
