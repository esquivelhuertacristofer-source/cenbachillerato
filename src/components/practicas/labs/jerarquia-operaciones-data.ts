/**
 * Datos y modelo del laboratorio 3D «Jerarquía de operaciones» (PM-I,
 * progresión 7; actividades PM-I-P10-A1 … A9).
 *
 * Todo es puro (sin three ni React): el shell y la escena lo importan.
 *
 * El modelo es ARITMÉTICA EXACTA: cada número es un racional n/d reducido, así
 * que 1/2 + 3/2 da exactamente 2 y 0.5 × 9 da exactamente 9/2 (se muestra
 * 4.5). Las expresiones se leen con un analizador por precedencias configurable
 * — la jerarquía de la lectura A1 es una configuración; la calculadora básica
 * (ejecución inmediata), la hoja de cálculo (el signo antes que la potencia) o
 * la multiplicación implícita prioritaria son otras. Cada lectura produce su
 * propio árbol de operaciones, y eso es lo que el laboratorio pone en 3D.
 */

import type { QuizEvaluable } from "./_reto-quiz";
import type { RetoNumericoData } from "./_reto-numerico";

/* ════════════════════════════════════════════════════════════════════════
 * 1. RACIONALES EXACTOS
 * ════════════════════════════════════════════════════════════════════════ */

export interface Q {
  n: number;
  d: number;
}

function mcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

export function q(n: number, d = 1): Q {
  if (d === 0) throw new Error("denominador cero");
  const s = d < 0 ? -1 : 1;
  const g = mcd(n, d);
  const nn = (s * n) / g;
  return { n: nn === 0 ? 0 : nn, d: Math.abs(d) / g };
}

export const sumaQ = (a: Q, b: Q) => q(a.n * b.d + b.n * a.d, a.d * b.d);
export const restaQ = (a: Q, b: Q) => q(a.n * b.d - b.n * a.d, a.d * b.d);
export const multQ = (a: Q, b: Q) => q(a.n * b.n, a.d * b.d);
export const divQ = (a: Q, b: Q): Q | null => (b.n === 0 ? null : q(a.n * b.d, a.d * b.n));
export function potQ(a: Q, e: number): Q {
  let r = q(1);
  for (let i = 0; i < e; i++) r = multQ(r, a);
  return r;
}
function raizEntera(x: number): number | null {
  if (x < 0) return null;
  const r = Math.round(Math.sqrt(x));
  return r * r === x ? r : null;
}
/** Raíz cuadrada exacta; null si no es un racional (o si es negativa). */
export function raizQ(a: Q): Q | null {
  const n = raizEntera(a.n);
  const d = raizEntera(a.d);
  return n === null || d === null ? null : q(n, d);
}
export const igualQ = (a: Q, b: Q) => a.n === b.n && a.d === b.d;
export const aNumero = (a: Q) => a.n / a.d;
export const claveQ = (a: Q) => `${a.n}/${a.d}`;

const MENOS = "−";

/** ¿El racional tiene expansión decimal finita? Devuelve cuántas cifras, o null. */
function cifrasDecimales(d: number): number | null {
  for (let k = 0; k <= 6; k++) if (Math.pow(10, k) % d === 0) return k;
  return null;
}

/** Texto de un racional: decimal si `dec` y es finito; si no, fracción. */
export function fmtQ(v: Q, dec = false): string {
  const signo = v.n < 0 ? MENOS : "";
  const abs = Math.abs(v.n);
  if (v.d === 1) return `${signo}${abs}`;
  const k = cifrasDecimales(v.d);
  if (dec && k !== null) {
    const entero = (abs * Math.pow(10, k)) / v.d;
    const s = String(entero).padStart(k + 1, "0");
    return `${signo}${s.slice(0, s.length - k)}.${s.slice(s.length - k)}`;
  }
  return `${signo}${abs}/${v.d}`;
}

/** Valor aproximado para la recta y los textos («≈ 0.33»). */
export function aproxQ(v: Q, dec = 2): string {
  const x = aNumero(v);
  const s = Math.abs(x).toFixed(dec).replace(/\.?0+$/, "");
  return `${x < 0 ? MENOS : ""}${s}`;
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. TOKENS, ÁRBOL Y LECTURAS
 * ════════════════════════════════════════════════════════════════════════ */

export type OpBin = "+" | "−" | "×" | "÷";
export type Abre = "(" | "[" | "{";
export type Cierra = ")" | "]" | "}";

export type Tok =
  | { t: "num"; v: Q; dec: boolean }
  | { t: "op"; op: OpBin; implicita?: boolean }
  | { t: "abre"; b: Abre }
  | { t: "cierra"; b: Cierra }
  | { t: "pot"; e: number }
  | { t: "raiz" }
  | { t: "neg" };

export type Nodo =
  | { id: string; k: "num"; v: Q; dec: boolean }
  | { id: string; k: "bin"; op: OpBin; a: Nodo; b: Nodo; implicita?: boolean }
  | { id: string; k: "pot"; base: Nodo; e: number }
  | { id: string; k: "raiz"; arg: Nodo }
  | { id: string; k: "neg"; arg: Nodo }
  | { id: string; k: "grp"; hijo: Nodo; b: Abre };

const PAR: Record<Abre, Cierra> = { "(": ")", "[": "]", "{": "}" };
const SUP: Record<string, number> = { "²": 2, "³": 3 };

/** Convierte un texto como «8 + 3 × (10 − 6)² ÷ 4» en tokens. */
export function tokenizar(s: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  const previoEsOperando = () => {
    const p = out[out.length - 1];
    return !!p && (p.t === "num" || p.t === "cierra" || p.t === "pot");
  };
  while (i < s.length) {
    const c = s[i]!;
    if (c === " ") {
      i++;
      continue;
    }
    // Número negativo escrito entre paréntesis: «(−3)» es un solo número.
    const neg = /^\((?:−|-)(\d+(?:\.\d+)?(?:\/\d+)?)\)/.exec(s.slice(i));
    if (neg) {
      if (previoEsOperando()) out.push({ t: "op", op: "×", implicita: true });
      const tk = leerNumero(neg[1]!);
      out.push({ t: "num", v: q(-tk.v.n, tk.v.d), dec: tk.dec });
      i += neg[0].length;
      continue;
    }
    const m = /^\d+(?:\.\d+)?(?:\/\d+)?/.exec(s.slice(i));
    if (m) {
      if (previoEsOperando()) out.push({ t: "op", op: "×", implicita: true });
      out.push(leerNumero(m[0]));
      i += m[0].length;
      continue;
    }
    if (c === "(" || c === "[" || c === "{") {
      if (previoEsOperando()) out.push({ t: "op", op: "×", implicita: true });
      out.push({ t: "abre", b: c });
    } else if (c === ")" || c === "]" || c === "}") out.push({ t: "cierra", b: c });
    else if (c in SUP) out.push({ t: "pot", e: SUP[c]! });
    else if (c === "√") {
      if (previoEsOperando()) out.push({ t: "op", op: "×", implicita: true });
      out.push({ t: "raiz" });
    } else if (c === "+" || c === "×" || c === "÷") out.push({ t: "op", op: c });
    else if (c === "−" || c === "-") out.push(previoEsOperando() ? { t: "op", op: "−" } : { t: "neg" });
    else throw new Error(`carácter inesperado «${c}» en «${s}»`);
    i++;
  }
  return out;
}

function leerNumero(txt: string): { t: "num"; v: Q; dec: boolean } {
  if (txt.includes("/")) {
    const [a, b] = txt.split("/");
    return { t: "num", v: q(Number(a), Number(b)), dec: false };
  }
  if (txt.includes(".")) {
    const [ent, fr] = txt.split(".");
    const den = Math.pow(10, fr!.length);
    return { t: "num", v: q(Number(ent) * den + Number(fr), den), dec: true };
  }
  return { t: "num", v: q(Number(txt)), dec: false };
}

/** Cómo «lee» una expresión una persona o una máquina. */
export interface Lectura {
  id: string;
  /** Precedencia de cada operación binaria (mayor = se hace antes). */
  prec: Record<OpBin | "imp", number>;
  /** El signo menos se pega al número antes que la potencia (hojas de cálculo). */
  negFuerte: boolean;
}

export const JERARQUIA: Lectura = { id: "jerarquia", prec: { "+": 1, "−": 1, "×": 2, "÷": 2, imp: 2 }, negFuerte: false };
export const INMEDIATA: Lectura = { id: "inmediata", prec: { "+": 1, "−": 1, "×": 1, "÷": 1, imp: 1 }, negFuerte: false };
export const HOJA_CALCULO: Lectura = { id: "hoja", prec: { "+": 1, "−": 1, "×": 2, "÷": 2, imp: 2 }, negFuerte: true };
export const IMPLICITA_PRIMERO: Lectura = { id: "implicita", prec: { "+": 1, "−": 1, "×": 2, "÷": 2, imp: 3 }, negFuerte: false };
export const SUMA_PRIMERO: Lectura = { id: "sumaPrimero", prec: { "+": 1.5, "−": 1, "×": 2, "÷": 2, imp: 2 }, negFuerte: false };

/** Analiza tokens con una lectura. `pref` hace únicos los id de los nodos. */
export function analizar(toks: Tok[], lectura: Lectura = JERARQUIA, pref = "n"): Nodo {
  let i = 0;
  let cont = 0;
  const nid = () => `${pref}${cont++}`;
  const ver = () => toks[i];
  const precDe = (t: Tok) => (t.t === "op" ? lectura.prec[t.implicita ? "imp" : t.op] : -1);

  const expr = (minPrec: number): Nodo => {
    let izq = unario();
    for (;;) {
      const t = ver();
      if (!t || t.t !== "op") break;
      const p = precDe(t);
      if (p < minPrec) break;
      i++;
      const der = expr(p + 0.01);
      izq = { id: nid(), k: "bin", op: t.op, a: izq, b: der, implicita: t.implicita };
    }
    return izq;
  };
  const unario = (): Nodo => {
    const t = ver();
    if (t?.t === "neg" && !lectura.negFuerte) {
      i++;
      return { id: nid(), k: "neg", arg: unario() };
    }
    return postfijo();
  };
  const postfijo = (): Nodo => {
    let base = primario();
    for (;;) {
      const t = ver();
      if (t?.t !== "pot") break;
      i++;
      base = { id: nid(), k: "pot", base, e: t.e };
    }
    return base;
  };
  const primario = (): Nodo => {
    const t = ver();
    if (!t) throw new Error("expresión incompleta");
    i++;
    if (t.t === "num") return { id: nid(), k: "num", v: t.v, dec: t.dec };
    if (t.t === "abre") {
      const dentro = expr(0);
      const c = ver();
      if (c?.t !== "cierra" || c.b !== PAR[t.b]) throw new Error("agrupación sin cerrar");
      i++;
      return { id: nid(), k: "grp", hijo: dentro, b: t.b };
    }
    if (t.t === "raiz") return { id: nid(), k: "raiz", arg: primario() };
    if (t.t === "neg") return { id: nid(), k: "neg", arg: primario() };
    throw new Error("se esperaba un número");
  };
  const raiz = expr(0);
  if (i !== toks.length) throw new Error("sobran símbolos");
  return raiz;
}

export const leer = (s: string, lectura: Lectura = JERARQUIA, pref = "n") => analizar(tokenizar(s), lectura, pref);

/* ── Evaluación ────────────────────────────────────────────────────────── */

export function evaluar(n: Nodo): Q | null {
  switch (n.k) {
    case "num":
      return n.v;
    case "grp":
      return evaluar(n.hijo);
    case "neg": {
      const a = evaluar(n.arg);
      return a && q(-a.n, a.d);
    }
    case "raiz": {
      const a = evaluar(n.arg);
      return a && raizQ(a);
    }
    case "pot": {
      const a = evaluar(n.base);
      return a && potQ(a, n.e);
    }
    case "bin": {
      const a = evaluar(n.a);
      const b = evaluar(n.b);
      if (!a || !b) return null;
      if (n.op === "+") return sumaQ(a, b);
      if (n.op === "−") return restaQ(a, b);
      if (n.op === "×") return multQ(a, b);
      return divQ(a, b);
    }
  }
}

const tieneDecimal = (n: Nodo): boolean =>
  n.k === "num" ? n.dec : n.k === "bin" ? tieneDecimal(n.a) || tieneDecimal(n.b) : n.k === "pot" ? tieneDecimal(n.base) : n.k === "grp" ? tieneDecimal(n.hijo) : tieneDecimal(n.arg);

export const valorTexto = (n: Nodo): string => {
  const v = evaluar(n);
  return v ? fmtQ(v, tieneDecimal(n)) : "sin valor";
};

/* ── Serialización (tokens de pantalla) ───────────────────────────────── */

export interface TokV {
  tok: Tok;
  /** Nodo al que pertenece el token (el número, la operación o la agrupación). */
  nodo: string;
}

export function serializar(n: Nodo): TokV[] {
  const out: TokV[] = [];
  const va = (x: Nodo) => {
    switch (x.k) {
      case "num":
        out.push({ tok: { t: "num", v: x.v, dec: x.dec }, nodo: x.id });
        break;
      case "bin":
        va(x.a);
        out.push({ tok: { t: "op", op: x.op, implicita: x.implicita }, nodo: x.id });
        va(x.b);
        break;
      case "pot":
        va(x.base);
        out.push({ tok: { t: "pot", e: x.e }, nodo: x.id });
        break;
      case "raiz":
        out.push({ tok: { t: "raiz" }, nodo: x.id });
        va(x.arg);
        break;
      case "neg":
        out.push({ tok: { t: "neg" }, nodo: x.id });
        va(x.arg);
        break;
      case "grp":
        out.push({ tok: { t: "abre", b: x.b }, nodo: x.id });
        va(x.hijo);
        out.push({ tok: { t: "cierra", b: PAR[x.b] }, nodo: x.id });
        break;
    }
  };
  va(n);
  return out;
}

/** Tramo [inicio, fin) de tokens de cada nodo. */
export function tramos(n: Nodo): Map<string, [number, number]> {
  const m = new Map<string, [number, number]>();
  let i = 0;
  const va = (x: Nodo) => {
    const ini = i;
    switch (x.k) {
      case "num":
        i++;
        break;
      case "bin":
        va(x.a);
        i++;
        va(x.b);
        break;
      case "pot":
        va(x.base);
        i++;
        break;
      case "raiz":
      case "neg":
        i++;
        va(x.arg);
        break;
      case "grp":
        i++;
        va(x.hijo);
        i++;
        break;
    }
    m.set(x.id, [ini, i]);
  };
  va(n);
  return m;
}

/** Texto de un token tal como se muestra. `primero`: si abre la expresión. */
export function textoTok(t: Tok, primero = false, siguiente?: Tok): string {
  switch (t.t) {
    case "num": {
      const s = fmtQ(t.v, t.dec);
      const conPar = t.v.n < 0 && (!primero || siguiente?.t === "pot");
      return conPar ? `(${s})` : s;
    }
    case "op":
      return t.implicita ? "" : t.op;
    case "abre":
      return t.b;
    case "cierra":
      return t.b;
    case "pot":
      return t.e === 2 ? "²" : "³";
    case "raiz":
      return "√";
    case "neg":
      return MENOS;
  }
}

export function textoToks(ts: Tok[]): string {
  let s = "";
  ts.forEach((t, i) => {
    const txt = textoTok(t, i === 0, ts[i + 1]);
    const prev = ts[i - 1];
    const pegado = !prev || t.t === "cierra" || t.t === "pot" || prev.t === "abre" || prev.t === "raiz" || prev.t === "neg" || (t.t === "op" && t.implicita) || (prev.t === "op" && prev.implicita);
    s += (pegado ? "" : " ") + txt;
  });
  return s;
}

export const textoNodo = (n: Nodo) => textoToks(serializar(n).map((x) => x.tok));

/* ════════════════════════════════════════════════════════════════════════
 * 3. PASO A PASO
 * ════════════════════════════════════════════════════════════════════════ */

export type Categoria = "agrupacion" | "potencia" | "multiplicacion" | "suma" | "signo";

export const CATEGORIA_DEF: Record<Categoria, { etq: string; color: string; rango: number; icono: string }> = {
  agrupacion: { etq: "Agrupación ( ) [ ] { }", color: "#38bdf8", rango: 0, icono: "fa-brackets-curly" },
  potencia: { etq: "Potencias y raíces", color: "#c084fc", rango: 1, icono: "fa-superscript" },
  signo: { etq: "Signo", color: "#f9a8d4", rango: 1, icono: "fa-minus" },
  multiplicacion: { etq: "Multiplicación y división", color: "#fbbf24", rango: 2, icono: "fa-xmark" },
  suma: { etq: "Suma y resta", color: "#fb7185", rango: 3, icono: "fa-plus" },
};

export function categoriaDe(n: Nodo): Categoria {
  if (n.k === "pot" || n.k === "raiz") return "potencia";
  if (n.k === "neg") return "signo";
  if (n.k === "grp") return "agrupacion";
  if (n.k === "bin") return n.op === "×" || n.op === "÷" ? "multiplicacion" : "suma";
  return "suma";
}

export const NOMBRE_OP: Record<OpBin, string> = { "+": "suma", "−": "resta", "×": "multiplicación", "÷": "división" };

const esNum = (n: Nodo) => n.k === "num";

export function buscar(n: Nodo, id: string): Nodo | null {
  if (n.id === id) return n;
  const hijos = hijosDe(n);
  for (const h of hijos) {
    const r = buscar(h, id);
    if (r) return r;
  }
  return null;
}

export function hijosDe(n: Nodo): Nodo[] {
  if (n.k === "bin") return [n.a, n.b];
  if (n.k === "pot") return [n.base];
  if (n.k === "raiz" || n.k === "neg") return [n.arg];
  if (n.k === "grp") return [n.hijo];
  return [];
}

/** ¿Se puede hacer ya esta operación? (todos sus operandos son números) */
export function listo(n: Nodo): boolean {
  if (n.k === "bin") return esNum(n.a) && esNum(n.b);
  if (n.k === "pot" || n.k === "raiz" || n.k === "neg") return esNum(hijosDe(n)[0]!);
  return false;
}

/** Profundidad de agrupación de cada nodo (cuántas agrupaciones lo contienen). */
function profundidades(n: Nodo, d = 0, m = new Map<string, number>()) {
  m.set(n.id, d);
  hijosDe(n).forEach((h) => profundidades(h, d + (n.k === "grp" ? 1 : 0), m));
  return m;
}

/** Operaciones que ya se pueden hacer. */
export function listos(n: Nodo): string[] {
  const out: string[] = [];
  const va = (x: Nodo) => {
    if (listo(x)) out.push(x.id);
    hijosDe(x).forEach(va);
  };
  va(n);
  return out;
}

/** La operación que toca por convención: agrupación más interna, luego nivel, luego la de más a la izquierda. */
export function siguiente(n: Nodo): string | null {
  const ids = listos(n);
  if (!ids.length) return null;
  const prof = profundidades(n);
  const tr = tramos(n);
  return [...ids].sort((x, y) => {
    const dx = prof.get(x)!;
    const dy = prof.get(y)!;
    if (dx !== dy) return dy - dx;
    const rx = CATEGORIA_DEF[categoriaDe(buscar(n, x)!)].rango;
    const ry = CATEGORIA_DEF[categoriaDe(buscar(n, y)!)].rango;
    if (rx !== ry) return rx - ry;
    return tr.get(x)![0] - tr.get(y)![0];
  })[0]!;
}

/** Quita las agrupaciones que ya solo contienen un número. */
function normalizar(n: Nodo): Nodo {
  switch (n.k) {
    case "num":
      return n;
    case "grp": {
      const h = normalizar(n.hijo);
      return h.k === "num" ? h : { ...n, hijo: h };
    }
    case "bin":
      return { ...n, a: normalizar(n.a), b: normalizar(n.b) };
    case "pot":
      return { ...n, base: normalizar(n.base) };
    case "raiz":
    case "neg":
      return { ...n, arg: normalizar(n.arg) };
  }
}

function reemplazar(n: Nodo, id: string, nuevo: Nodo): Nodo {
  if (n.id === id) return nuevo;
  switch (n.k) {
    case "num":
      return n;
    case "grp":
      return { ...n, hijo: reemplazar(n.hijo, id, nuevo) };
    case "bin":
      return { ...n, a: reemplazar(n.a, id, nuevo), b: reemplazar(n.b, id, nuevo) };
    case "pot":
      return { ...n, base: reemplazar(n.base, id, nuevo) };
    case "raiz":
    case "neg":
      return { ...n, arg: reemplazar(n.arg, id, nuevo) };
  }
}

export interface PasoHecho {
  /** Árbol antes del paso. */
  antes: Nodo;
  /** Árbol después del paso. */
  despues: Nodo;
  id: string;
  categoria: Categoria;
  /** Tramo de tokens de `antes` que se consume (incluye paréntesis que desaparecen). */
  tramo: [number, number];
  /** Índice del token resultado en `despues`. */
  indiceResultado: number;
  /** «3 × 4 = 12» */
  texto: string;
  /** Por qué va este paso. */
  porque: string;
  /** Hay agrupación alrededor (dentro de paréntesis). */
  dentro: boolean;
}

/** Aplica la operación `id` (debe estar lista). */
export function aplicar(arbol: Nodo, id: string): PasoHecho | null {
  const nodo = buscar(arbol, id);
  if (!nodo || !listo(nodo)) return null;
  const v = evaluar(nodo);
  if (!v) return null;
  const hoja: Nodo = { id, k: "num", v, dec: tieneDecimal(nodo) };
  const despues = normalizar(reemplazar(arbol, id, hoja));
  const trA = tramos(arbol);
  let [ini, fin] = trA.get(id)!;
  // Si el resultado deja una agrupación con un solo número, sus signos también se van.
  const padres = cadenaPadres(arbol, id);
  let dentro = false;
  for (let k = padres.length - 1; k >= 0; k--) {
    const p = padres[k]!;
    if (p.k === "grp") {
      dentro = true;
      const [pi, pf] = trA.get(p.id)!;
      if (pf - pi === fin - ini + 2) {
        ini = pi;
        fin = pf;
        continue;
      }
    }
    break;
  }
  if (!dentro) dentro = padres.some((p) => p.k === "grp");
  const indiceResultado = tramos(despues).get(id)![0];
  const cat = categoriaDe(nodo);
  return {
    antes: arbol,
    despues,
    id,
    categoria: cat,
    tramo: [ini, fin],
    indiceResultado,
    texto: `${textoNodo(nodo)} = ${fmtQ(v, tieneDecimal(nodo))}`,
    porque: porQueVa(arbol, nodo, dentro),
    dentro,
  };
}

function cadenaPadres(arbol: Nodo, id: string): Nodo[] {
  const camino: Nodo[] = [];
  const va = (x: Nodo): boolean => {
    if (x.id === id) return true;
    for (const h of hijosDe(x)) {
      if (va(h)) {
        camino.push(x);
        return true;
      }
    }
    return false;
  };
  va(arbol);
  return camino.reverse();
}

function porQueVa(arbol: Nodo, nodo: Nodo, dentro: boolean): string {
  const cat = categoriaDe(nodo);
  const pre = dentro ? "Está dentro de una agrupación, que se resuelve primero" : "";
  const otras = listos(arbol).filter((x) => x !== nodo.id);
  let base: string;
  if (cat === "potencia") base = "Potencias y raíces van antes que multiplicar, dividir, sumar o restar";
  else if (cat === "signo") base = "El signo menos se aplica al resultado de la potencia";
  else if (cat === "multiplicacion") base = "Multiplicación y división van antes que suma y resta, y entre ellas de izquierda a derecha";
  else base = "Suma y resta van al final, de izquierda a derecha";
  const indep = otras.length > 0 ? ". Había otra operación lista a la vez: son independientes y el orden entre ellas no cambia el resultado" : "";
  return `${pre ? `${pre}. ` : ""}${base}${indep}.`;
}

export interface Rechazo {
  razon: string;
  /** La operación que toca, como texto. */
  toca: string | null;
  /** Lo que resultaría si se hiciera esa operación primero. */
  erronea: { expresion: string; valor: string; coincide: boolean; nota?: string } | null;
}

/** Explica por qué NO se puede hacer todavía la operación `id`. */
export function porQueNo(arbol: Nodo, id: string): Rechazo | null {
  const nodo = buscar(arbol, id);
  if (!nodo || listo(nodo)) return null;
  const sig = siguiente(arbol);
  const toca = sig ? textoNodo(buscar(arbol, sig)!) : null;
  const correcto = evaluar(arbol);

  if (nodo.k === "pot" || nodo.k === "raiz") {
    const arg = hijosDe(nodo)[0]!;
    const que = nodo.k === "pot" ? "la potencia" : "la raíz";
    const razon = `${nodo.k === "pot" ? "La potencia" : "La raíz"} se aplica al resultado completo de «${textoNodo(arg)}», así que primero hay que resolver lo de adentro.`;
    // Error clásico: repartir la potencia o la raíz entre los términos de una suma o resta.
    let erronea: Rechazo["erronea"] = null;
    const dentro = arg.k === "grp" ? arg.hijo : arg;
    if (dentro.k === "bin" && (dentro.op === "+" || dentro.op === "−") && esNum(dentro.a) && esNum(dentro.b)) {
      const f = (x: Nodo): Nodo => (nodo.k === "pot" ? { id: "x", k: "pot", base: x, e: nodo.e } : { id: "x", k: "raiz", arg: x });
      const repartido: Nodo = { id: "r", k: "bin", op: dentro.op, a: f(dentro.a), b: f(dentro.b) };
      const vr = evaluar(repartido);
      const vb = evaluar(nodo);
      if (vr && vb)
        erronea = {
          expresion: textoNodo(repartido),
          valor: fmtQ(vr, tieneDecimal(repartido)),
          coincide: igualQ(vr, vb),
          nota: `Repartir ${que} es un error: ${textoNodo(nodo)} = ${fmtQ(vb, tieneDecimal(nodo))}.`,
        };
    }
    return { razon, toca, erronea };
  }

  if (nodo.k !== "bin") return { razon: "Primero resuelve lo que está dentro.", toca, erronea: null };

  const bloqueo = [nodo.a, nodo.b].find((h) => !esNum(h))!;
  const nom = NOMBRE_OP[nodo.op];
  let razon: string;
  if (bloqueo.k === "grp") razon = `Antes de la ${nom} hay que resolver lo que está dentro de la agrupación «${textoNodo(bloqueo)}».`;
  else if (bloqueo.k === "pot" || bloqueo.k === "raiz") razon = `Las potencias y raíces van antes que la ${nom}: primero «${textoNodo(bloqueo)}».`;
  else if (bloqueo.k === "neg") razon = `Primero el signo de «${textoNodo(bloqueo)}».`;
  else if (bloqueo.k === "bin") {
    const rb = CATEGORIA_DEF[categoriaDe(bloqueo)].rango;
    const rn = CATEGORIA_DEF[categoriaDe(nodo)].rango;
    razon =
      rb < rn
        ? `La ${NOMBRE_OP[bloqueo.op]} va antes que la ${nom}: primero «${textoNodo(bloqueo)}».`
        : `La ${nom} y la ${NOMBRE_OP[bloqueo.op]} son del mismo nivel: se resuelven de izquierda a derecha, así que primero «${textoNodo(bloqueo)}».`;
  } else razon = "Todavía no se puede.";

  const erronea = lecturaErronea(arbol, nodo, correcto);
  return { razon, toca, erronea };
}

/**
 * Qué pasa si alguien hace la operación `nodo` con los números que tiene
 * pegados a cada lado, ignorando la jerarquía (y los paréntesis que estorben):
 * se agrupan esos dos números y se evalúa lo que queda con la jerarquía normal.
 */
function lecturaErronea(arbol: Nodo, nodo: Extract<Nodo, { k: "bin" }>, correcto: Q | null): Rechazo["erronea"] {
  const tv = serializar(arbol);
  const tr = tramos(arbol);
  const quitar = new Set<number>();
  // Solo se «ignoran» los paréntesis que están pegados a la operación; los que
  // quedan más lejos siguen agrupando.
  let izq: Nodo = nodo.a;
  let lejos = false;
  for (;;) {
    if (izq.k === "bin") {
      izq = izq.b;
      lejos = true;
    } else if (izq.k === "grp" && !lejos) {
      const [a, b] = tr.get(izq.id)!;
      quitar.add(a);
      quitar.add(b - 1);
      izq = izq.hijo;
    } else break;
  }
  let der: Nodo = nodo.b;
  lejos = false;
  for (;;) {
    if (der.k === "bin") {
      der = der.a;
      lejos = true;
    } else if (der.k === "pot") der = der.base;
    else if (der.k === "grp" && !lejos) {
      const [a, b] = tr.get(der.id)!;
      quitar.add(a);
      quitar.add(b - 1);
      der = der.hijo;
    } else break;
  }
  const ini = tr.get(izq.id)![0];
  const fin = tr.get(der.id)![1];
  const toks: Tok[] = [];
  tv.forEach((x, i) => {
    if (i === ini) toks.push({ t: "abre", b: "(" });
    if (!quitar.has(i)) toks.push(x.tok);
    if (i === fin - 1) toks.push({ t: "cierra", b: ")" });
  });
  try {
    const mal = analizar(toks, JERARQUIA, "e");
    const v = evaluar(mal);
    if (!v) return null;
    return { expresion: textoToks(toks), valor: fmtQ(v, tieneDecimal(mal)), coincide: !!correcto && igualQ(v, correcto) };
  } catch {
    return null;
  }
}

/** Resuelve completo con el orden convencional; devuelve los pasos. */
export function resolverTodo(arbol: Nodo): PasoHecho[] {
  const pasos: PasoHecho[] = [];
  let a = arbol;
  for (let k = 0; k < 40; k++) {
    const s = siguiente(a);
    if (!s) break;
    const p = aplicar(a, s);
    if (!p) break;
    pasos.push(p);
    a = p.despues;
  }
  return pasos;
}

/** Reconstruye el estado tras una lista de operaciones elegidas. */
export function reproducir(arbol: Nodo, ids: string[]): PasoHecho[] {
  const pasos: PasoHecho[] = [];
  let a = arbol;
  for (const id of ids) {
    const p = aplicar(a, id);
    if (!p) break;
    pasos.push(p);
    a = p.despues;
  }
  return pasos;
}

/** Tokens que se pueden elegir (operaciones) con su nodo. */
export function operacionesDe(arbol: Nodo): { indice: number; id: string; texto: string }[] {
  const tv = serializar(arbol);
  return tv
    .map((x, i) => ({ x, i }))
    .filter(({ x }) => x.tok.t === "op" || x.tok.t === "pot" || x.tok.t === "raiz")
    .map(({ x, i }) => ({ indice: i, id: x.nodo, texto: x.tok.t === "op" && x.tok.implicita ? "×" : textoTok(x.tok) }));
}

/* ════════════════════════════════════════════════════════════════════════
 * 4. MODOS
 * ════════════════════════════════════════════════════════════════════════ */

export type Modo = "pasos" | "razon" | "constructor";
export const MODOS: Modo[] = ["pasos", "razon", "constructor"];
export const MODOS_DEF: Record<Modo, { etq: string; subtitulo: string; icono: string; color: string }> = {
  pasos: { etq: "Torre de pasos", subtitulo: "Elige qué operación va primero", icono: "fa-layer-group", color: "#22d3ee" },
  razon: { etq: "¿Quién tiene razón?", subtitulo: "Máquinas que leen distinto", icono: "fa-calculator", color: "#fb923c" },
  constructor: { etq: "Constructor", subtitulo: "Paréntesis que mueven el resultado", icono: "fa-diagram-project", color: "#a3e635" },
};

/* ── Modo 1: expresiones ──────────────────────────────────────────────── */

export interface Expresion {
  id: string;
  texto: string;
  etq: string;
  /** De qué actividad sale o qué practica. */
  origen: string;
  /** Usa signos, fracciones, decimales o raíces. */
  reales: boolean;
}

export const EXPRESIONES: Expresion[] = [
  { id: "e1", texto: "2 + 3 × 4", etq: "2 + 3 × 4", origen: "Lectura A1 y ejercicio A2", reales: false },
  { id: "e2", texto: "(5 + 3) × 2", etq: "(5 + 3) × 2", origen: "Lectura A1 y quiz A4", reales: false },
  { id: "e3", texto: "10 − 2²", etq: "10 − 2²", origen: "Quiz A4", reales: false },
  { id: "e4", texto: "12 ÷ (1 + 2) + 5 × 2", etq: "12 ÷ (1 + 2) + 5 × 2", origen: "Ejercicio A6", reales: false },
  { id: "a9", texto: "8 + 3 × (10 − 6)² ÷ 4", etq: "8 + 3 × (10 − 6)² ÷ 4", origen: "Ordena los pasos A9", reales: false },
  { id: "e6", texto: "(−2)³ + 18 ÷ 3 × 2", etq: "(−2)³ + 18 ÷ 3 × 2", origen: "Signos y mismo nivel", reales: true },
  { id: "e7", texto: "√(9 + 16) − 0.5 × 3²", etq: "√(9 + 16) − 0.5 × 3²", origen: "Raíces y decimales", reales: true },
  { id: "e8", texto: "1.5 × [4 − (1/2 + 3/2)] ÷ (−3)", etq: "1.5 × [4 − (1/2 + 3/2)] ÷ (−3)", origen: "Corchetes, fracciones y signos", reales: true },
];

/* ── Modo 2: ¿quién tiene razón? ──────────────────────────────────────── */

export type Aparato = "basica" | "cientifica" | "hoja" | "cuaderno";

export interface Maquina {
  etq: string;
  aparato: Aparato;
  lectura: Lectura;
  /** Cómo lo escribe o teclea (si difiere de la expresión del caso). */
  escrito?: string;
  /** Lo que se ve en su pantalla, si se teclea distinto (p. ej. «=-3^2»). */
  pantalla?: string;
  explica: string;
}

export interface OpcionReescritura {
  texto: string;
}

export interface Caso {
  id: string;
  etq: string;
  situacion: string;
  expresion: string;
  izq: Maquina;
  der: Maquina;
  pregunta: string;
  /** Respuesta correcta a la pregunta (texto exacto de un valor). */
  respuesta: string;
  leccion: string;
  intencion: string;
  opciones: string[];
  /** Índice de la opción que cumple la intención en ambas máquinas. */
  correcta: number;
  /** Valor que se busca con la reescritura. */
  meta: string;
  fuente: string;
}

export const CASOS: Caso[] = [
  {
    id: "basica",
    etq: "Calculadora básica",
    situacion: "Tecleas 2 + 3 × 4 en dos calculadoras. La básica hace cada operación en cuanto oprimes la siguiente tecla; la científica espera y aplica la jerarquía.",
    expresion: "2 + 3 × 4",
    izq: { etq: "Calculadora básica", aparato: "basica", lectura: INMEDIATA, explica: "Ejecución inmediata: al oprimir × ya sumó 2 + 3 = 5, y luego hace 5 × 4." },
    der: { etq: "Calculadora científica", aparato: "cientifica", lectura: JERARQUIA, explica: "Aplica la jerarquía: primero 3 × 4 = 12 y después 2 + 12." },
    pregunta: "Según la jerarquía de operaciones, ¿cuánto vale 2 + 3 × 4?",
    respuesta: "14",
    leccion: "Vale 14. La calculadora básica no está «descompuesta»: sigue otra regla (hace cada operación en el orden en que la tecleas). Por eso hay que saber cómo lee tu herramienta.",
    intencion: "Quieres que la calculadora básica también dé 14. ¿Qué tecleas?",
    opciones: ["3 × 4 + 2", "2 + 4 × 3", "(2 + 3) × 4"],
    correcta: 0,
    meta: "14",
    fuente: "La mayoría de las calculadoras de cuatro operaciones usan ejecución inmediata; las científicas aplican la jerarquía.",
  },
  {
    id: "hoja",
    etq: "−3² en la hoja de cálculo",
    situacion: "En el cuaderno, −3² significa «el opuesto de 3²». En una hoja de cálculo como Excel, la fórmula =-3^2 aplica primero el signo y después la potencia.",
    expresion: "−3²",
    izq: { etq: "Matemáticas (cuaderno)", aparato: "cuaderno", lectura: JERARQUIA, explica: "La potencia va antes que el signo: −(3²) = −(9) = −9." },
    der: { etq: "Hoja de cálculo", aparato: "hoja", lectura: HOJA_CALCULO, pantalla: "=-3^2", explica: "La hoja de cálculo pega el signo al 3: (−3)² = 9." },
    pregunta: "En matemáticas, ¿cuánto vale −3²?",
    respuesta: "−9",
    leccion: "Vale −9: el exponente afecta solo al 3. Si quieres elevar −3, escribe (−3)² = 9. Excel documenta que la negación va antes que la potencia; lenguajes como Python dan −9.",
    intencion: "Quieres que las dos den −9 (el opuesto del cuadrado de 3). ¿Cómo lo escribes?",
    opciones: ["(−3)²", "−3²", "−(3²)"],
    correcta: 2,
    meta: "−9",
    fuente: "Microsoft, «Operadores de cálculo y prioridad en Excel»: la negación (−1) tiene prioridad sobre el exponente (^).",
  },
  {
    id: "viral",
    etq: "6 ÷ 2(1 + 2)",
    situacion: "En 2019 esta expresión se volvió viral: unas personas (y unas calculadoras) dicen 9 y otras dicen 1. La diferencia es cómo tratan la multiplicación que no lleva signo, «2(1 + 2)».",
    expresion: "6 ÷ 2(1 + 2)",
    izq: { etq: "Lectura A: mismo nivel", aparato: "cientifica", lectura: JERARQUIA, explica: "La multiplicación sin signo es una multiplicación más: 6 ÷ 2 = 3 y 3 × 3 = 9." },
    der: { etq: "Lectura B: la pegada va primero", aparato: "basica", lectura: IMPLICITA_PRIMERO, explica: "Toma 2(1 + 2) como un bloque: 6 ÷ 6 = 1." },
    pregunta: "Con la regla de la lectura A1 (× y ÷ del mismo nivel, de izquierda a derecha), ¿cuánto vale?",
    respuesta: "9",
    leccion: "Con esa regla vale 9, pero la escritura es ambigua: hay calculadoras y textos que dan prioridad a la multiplicación implícita. La solución no es pelear, es escribir los paréntesis que faltan.",
    intencion: "Querías dividir 6 entre el doble de (1 + 2). Escríbelo para que nadie lo lea distinto.",
    opciones: ["6 ÷ 2 × (1 + 2)", "6 ÷ [2 × (1 + 2)]", "(6 ÷ 2)(1 + 2)"],
    correcta: 1,
    meta: "1",
    fuente: "Debate público de 2019 (lo explicó S. Strogatz en The New York Times); las calculadoras difieren según su regla para la multiplicación implícita.",
  },
  {
    id: "pizza",
    etq: "La cuenta de la pizza",
    situacion: "Cinco amigos compran una pizza de $240 y refrescos por $60 y lo reparten en partes iguales. Ana escribe 240 + 60 ÷ 5 en su calculadora científica; Beto escribe (240 + 60) ÷ 5.",
    expresion: "240 + 60 ÷ 5",
    izq: { etq: "Ana", aparato: "cientifica", lectura: JERARQUIA, explica: "Sin paréntesis solo divide los $60: 240 + 12 = 252." },
    der: { etq: "Beto", aparato: "cientifica", lectura: JERARQUIA, escrito: "(240 + 60) ÷ 5", explica: "Los paréntesis juntan el total antes de repartir: 300 ÷ 5 = 60." },
    pregunta: "¿Cuánto debe pagar cada amigo?",
    respuesta: "60",
    leccion: "Cada quien paga $60. Ana no se equivocó al teclear: escribió otra operación. Lo que se quiere repartir es el total, y eso lo dicen los paréntesis.",
    intencion: "Ana quiere corregir su cálculo SIN usar paréntesis. ¿Qué escribe?",
    opciones: ["240 ÷ 5 + 60", "240 ÷ 5 + 60 ÷ 5", "240 + 60 ÷ 5"],
    correcta: 1,
    meta: "60",
    fuente: "Caso ilustrativo con precios redondos.",
  },
  {
    id: "resta",
    etq: "10 − 4 + 2",
    situacion: "Luis resuelve de izquierda a derecha. Mariana cree que las sumas van antes que las restas y hace primero 4 + 2.",
    expresion: "10 − 4 + 2",
    izq: { etq: "Luis: izquierda a derecha", aparato: "cuaderno", lectura: JERARQUIA, explica: "Suma y resta son del mismo nivel: 10 − 4 = 6 y 6 + 2 = 8." },
    der: { etq: "Mariana: suma primero", aparato: "cuaderno", lectura: SUMA_PRIMERO, explica: "Agrupa 4 + 2 sin que haya paréntesis: 10 − 6 = 4." },
    pregunta: "¿Cuánto vale 10 − 4 + 2?",
    respuesta: "8",
    leccion: "Vale 8. La suma no tiene prioridad sobre la resta: van juntas, de izquierda a derecha. Restar un número es sumar su opuesto (lectura A1), y así el orden de las sumas ya no importa.",
    intencion: "Escríbelo como una suma de opuestos, para que las dos formas de leer den lo mismo.",
    opciones: ["10 − (4 + 2)", "10 + 4 − 2", "10 + (−4) + 2"],
    correcta: 2,
    meta: "8",
    fuente: "Lectura A1: «restar un número es lo mismo que sumar su opuesto: 7 − 5 = 7 + (−5)».",
  },
];

export const escritoDe = (c: Caso, lado: "izq" | "der") => (lado === "izq" ? c.izq.escrito : c.der.escrito) ?? c.expresion;

/* ── Modo 3: constructor ──────────────────────────────────────────────── */

export const OPS: OpBin[] = ["+", "−", "×", "÷"];

/** Siete maneras de agrupar cuatro números a b c d. [inicio, fin] inclusivos. */
export const AGRUPACIONES: { id: string; etq: string; grupos: [number, number][] }[] = [
  { id: "g0", etq: "▢ ▢ ▢ ▢", grupos: [] },
  { id: "g1", etq: "(▢ ▢) ▢ ▢", grupos: [[0, 1]] },
  { id: "g2", etq: "▢ (▢ ▢) ▢", grupos: [[1, 2]] },
  { id: "g3", etq: "▢ ▢ (▢ ▢)", grupos: [[2, 3]] },
  { id: "g4", etq: "(▢ ▢ ▢) ▢", grupos: [[0, 2]] },
  { id: "g5", etq: "▢ (▢ ▢ ▢)", grupos: [[1, 3]] },
  { id: "g6", etq: "(▢ ▢)(▢ ▢)", grupos: [[0, 1], [2, 3]] },
];

export interface RetoConstructor {
  id: string;
  numeros: string[];
  meta: string;
  pista: string;
  /** Rango de la recta numérica. */
  rango: [number, number];
  paso: number;
  /** Una solución (se verifica con script). */
  solucion: { ops: OpBin[]; grupo: string };
}

export const RETOS_CONSTRUCTOR: RetoConstructor[] = [
  { id: "r1", numeros: ["2", "3", "4", "5"], meta: "45", pista: "Sin paréntesis lo más grande que sale es 2 + 3 × 4 × 5 = 62… pero 45 pide juntar sumas antes de multiplicar.", rango: [-10, 50], paso: 5, solucion: { ops: ["+", "×", "+"], grupo: "g6" } },
  { id: "r2", numeros: ["8", "4", "2", "6"], meta: "32", pista: "Una resta agrupada por una suma agrupada.", rango: [-10, 40], paso: 5, solucion: { ops: ["−", "×", "+"], grupo: "g6" } },
  { id: "r3", numeros: ["(−3)", "5", "2", "4"], meta: "12", pista: "Primero haz que −3 y 5 den un número positivo.", rango: [-20, 30], paso: 5, solucion: { ops: ["+", "×", "+"], grupo: "g6" } },
  { id: "r4", numeros: ["1/2", "3/2", "4", "2"], meta: "16", pista: "Junta las dos fracciones: 1/2 + 3/2 es un número entero.", rango: [-10, 20], paso: 2, solucion: { ops: ["+", "×", "×"], grupo: "g1" } },
  { id: "r5", numeros: ["0.5", "6", "2", "3"], meta: "32.5", pista: "Un decimal sumado, agrupado, por otra suma agrupada.", rango: [-10, 40], paso: 5, solucion: { ops: ["+", "×", "+"], grupo: "g6" } },
];

/** Construye la expresión del constructor como texto. */
export function textoConstructor(numeros: string[], ops: OpBin[], grupo: string): string {
  const g = AGRUPACIONES.find((x) => x.id === grupo)!.grupos;
  let s = "";
  numeros.forEach((nume, i) => {
    g.forEach(([a]) => {
      if (a === i) s += "(";
    });
    s += nume;
    g.forEach(([, b]) => {
      if (b === i) s += ")";
    });
    if (i < ops.length) s += ` ${ops[i]} `;
  });
  return s;
}

export function valorConstructor(numeros: string[], ops: OpBin[], grupo: string): Q | null {
  return evaluar(leer(textoConstructor(numeros, ops, grupo), JERARQUIA, "c"));
}

/** Texto a Q (para metas escritas como «−16» o «1.5»). */
export function qDeTexto(s: string): Q {
  const t = tokenizar(s.replace("−", "-"));
  return evaluar(analizar(t))!;
}

/* ════════════════════════════════════════════════════════════════════════
 * 5. ESTRELLAS: ¿QUÉ VA PRIMERO?
 * ════════════════════════════════════════════════════════════════════════ */

export const BANCO_PRIMERO: string[] = [
  "7 + 8 ÷ 2",
  "(9 − 4) × 3",
  "20 − 3 × 2²",
  "18 ÷ 3 × 2",
  "15 − 6 + 1",
  "4 × (2 + 5)²",
  "2 + √(20 − 4)",
  "(−3)² − 4",
  "1/2 + 1/4 × 2",
  "12 − [3 + (8 ÷ 2)]",
  "0.2 × 5³",
  "36 ÷ (2 + 4) × 3",
];

export const N_RONDA = 6;

export function mulberry32(semilla: number) {
  let t = semilla >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function rondaPrimero(rand: () => number): number[] {
  const idx = BANCO_PRIMERO.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [idx[i], idx[j]] = [idx[j]!, idx[i]!];
  }
  return idx.slice(0, N_RONDA);
}

export function estrellasPorErrores(errores: number): number {
  return errores === 0 ? 3 : errores <= 2 ? 2 : 1;
}

/* ════════════════════════════════════════════════════════════════════════
 * 6. CONTENIDO VERBATIM (PM-I-P10)
 * ════════════════════════════════════════════════════════════════════════ */

export const FUENTE = "MCCEMS 2025 — Pensamiento Matemático I, propósito 7";
export const PROPOSITO = "Aplica los elementos de la aritmética para resolver cálculos combinados con números reales.";

export const TITULO_A1 = "El orden importa: jerarquía de operaciones";

/** Lectura A1, verbatim (un solo párrafo, partido en sus oraciones). */
export const LECTURA_A1: string[] = [
  "Cuando una expresión tiene varias operaciones, no se resuelven de izquierda a derecha sin más: hay un ORDEN o jerarquía que todos respetamos para obtener el mismo resultado. El orden es: (1) lo que está dentro de los símbolos de agrupación —paréntesis ( ), corchetes [ ] y llaves { }—; (2) las potencias y raíces; (3) las multiplicaciones y divisiones, de izquierda a derecha; y (4) por último, las sumas y restas, de izquierda a derecha.",
  "Por ejemplo, en 2 + 3 × 4 primero se multiplica (3 × 4 = 12) y luego se suma (2 + 12 = 14); NO da 20. Los símbolos de agrupación permiten cambiar ese orden: (5 + 3) × 2 = 8 × 2 = 16.",
  "Además, conviene recordar que restar un número es lo mismo que sumar su opuesto: 7 − 5 = 7 + (−5). Respetar la jerarquía evita errores y hace que una misma expresión signifique lo mismo para todas las personas.",
];

export const PREGUNTAS_A1: { pregunta: string; guia: string }[] = [
  { pregunta: "¿Cuál es el orden correcto de la jerarquía de operaciones?", guia: "Agrupación, potencias/raíces, multiplicación/división, suma/resta." },
  { pregunta: "¿Por qué 2 + 3 × 4 no da 20?", guia: "Porque primero se multiplica (3×4=12) y luego se suma: 14." },
];

export const RETO_A2: RetoNumericoData = {
  titulo: "Resuelve respetando la jerarquía (A2)",
  contexto: "Orden: agrupación → potencias/raíces → multiplicación/división → suma/resta.",
  problema: "Calcula: 2 + 3 × 4",
  campos: [{ etiqueta: "Resultado de 2 + 3 × 4", objetivo: 14, tolerancia: 0, placeholder: "?" }],
  pasosGuia: ["Primero la multiplicación: 3 × 4 = 12.", "Luego la suma: 2 + 12 = 14."],
  respuestaFinal: "14",
};

export const RETO_A6: RetoNumericoData = {
  titulo: "Cálculo combinado con agrupación (A6)",
  contexto: "Orden: primero el paréntesis, luego división y multiplicación (de izquierda a derecha), y al final la suma.",
  problema: "Calcula: 12 ÷ (1 + 2) + 5 × 2",
  campos: [{ etiqueta: "Resultado de 12 ÷ (1 + 2) + 5 × 2", objetivo: 14, tolerancia: 0, placeholder: "?" }],
  pasosGuia: ["Paréntesis: 1 + 2 = 3.", "División: 12 ÷ 3 = 4.", "Multiplicación: 5 × 2 = 10.", "Suma final: 4 + 10 = 14."],
  respuestaFinal: "14",
};

export const QUIZ_A4: QuizEvaluable = {
  titulo: "Operaciones combinadas — Quiz (A4)",
  puntajeMinimo: 70,
  reactivos: [
    { enunciado: "En 2 + 3 × 4, ¿qué operación se hace primero?", opciones: ["La suma", "La multiplicación", "Da igual el orden", "Ninguna"], respuestaCorrecta: 1, retroalimentacion: "Primero la multiplicación: 3×4=12, luego 2+12=14." },
    { enunciado: "El resultado de (5 + 3) × 2 es:", opciones: ["11", "13", "16", "10"], respuestaCorrecta: 2, retroalimentacion: "Primero el paréntesis: 5+3=8; luego 8×2=16." },
    { enunciado: "El resultado de 10 − 2² es:", opciones: ["6", "64", "16", "8"], respuestaCorrecta: 0, retroalimentacion: "Primero la potencia: 2²=4; luego 10−4=6." },
    {
      enunciado: "El orden correcto de la jerarquía es:",
      opciones: ["Suma, resta, multiplicación, paréntesis", "Paréntesis, potencias/raíces, multiplicación/división, suma/resta", "Multiplicación, paréntesis, suma, potencias", "De izquierda a derecha siempre"],
      respuestaCorrecta: 1,
      retroalimentacion: "Ese es el orden correcto de la jerarquía.",
    },
  ],
};

/** Quiz de verdadero o falso A5 (y la pregunta V/F del video A8), verbatim. */
export const HECHOS: { enunciado: string; respuesta: boolean; retro: string; origen: string }[] = [
  { enunciado: "En una operación combinada, la multiplicación se hace antes que la suma.", respuesta: true, retro: "Correcto: la multiplicación tiene mayor jerarquía que la suma.", origen: "A5" },
  { enunciado: "Los paréntesis indican qué operación hacer primero.", respuesta: true, retro: "Correcto: lo agrupado se resuelve primero.", origen: "A5" },
  { enunciado: "La expresión 2 + 3 × 4 es igual a 20.", respuesta: false, retro: "Es igual a 14: primero 3×4=12, luego +2.", origen: "A5" },
  { enunciado: "Restar un número es lo mismo que sumar su opuesto.", respuesta: true, retro: "Correcto: 7 − 5 = 7 + (−5).", origen: "A5" },
  { enunciado: "Los números reales excluyen a los números irracionales.", respuesta: false, retro: "Falso: los reales incluyen a los racionales y a los irracionales.", origen: "Video A8" },
];

/** Ordenar secuencia A9, verbatim. */
export const INSTRUCCIONES_A9 = "Resuelve 8 + 3 × (10 − 6)² ÷ 4. Acomoda los pasos en el orden en que hay que hacerlos. Cambiar el orden cambia el resultado: ése es justamente el punto.";
export const PASOS_A9: { marca: string; texto: string; explicacion: string }[] = [
  { marca: "1º", texto: "Resolver lo que está dentro del paréntesis: (10 − 6) = 4", explicacion: "Los agrupamientos van primero, siempre." },
  { marca: "2º", texto: "Aplicar la potencia: 4² = 16", explicacion: "Potencias y raíces van después de los agrupamientos y antes de multiplicar." },
  { marca: "3º", texto: "Multiplicar: 3 × 16 = 48", explicacion: "Multiplicación y división van juntas, de izquierda a derecha; aquí la multiplicación está a la izquierda." },
  { marca: "4º", texto: "Dividir: 48 ÷ 4 = 12", explicacion: "La división es del mismo nivel que la multiplicación y va después porque está a su derecha." },
  { marca: "5º", texto: "Sumar: 8 + 12 = 20", explicacion: "La suma y la resta son lo último. El resultado es 20." },
];
/** Orden revuelto inicial de la tarjeta A9 (fijo, para que no dependa de Math.random en render). */
export const ORDEN_INICIAL_A9 = [2, 4, 0, 3, 1];

export const REFLEXION_A3 =
  "La jerarquía de operaciones es un acuerdo para que todos obtengamos el mismo resultado. Escribe un texto breve (120-250 palabras): (1) Explica con tus palabras cuál es el orden de la jerarquía. (2) Da un ejemplo donde, si no se respeta el orden, se obtiene un resultado equivocado. (3) ¿Por qué crees que es importante que todas las personas usen las mismas reglas al calcular (por ejemplo, en una calculadora, en una computadora o en una factura)?";
export const AUTOEVAL_A7 = "¿Te ha pasado obtener un resultado distinto al de una calculadora por no respetar el orden?";

export const PROBLEMA =
  "Una misma fila de números y signos puede dar 14 o 20, 9 o 1, −9 o 9. No es que las matemáticas cambien: cambia el orden en que se hacen las operaciones. La jerarquía es el acuerdo que hace que una expresión signifique lo mismo para todas las personas… y para todas las máquinas que la lean bien.";

export const INSTRUCCIONES: string[] = [
  "Torre de pasos: toca la operación que va primero (en la tira o en la escena). Cada acierto baja un renglón; si eliges mal, verás el resultado equivocado y por qué.",
  "¿Quién tiene razón?: predice el valor, mira cómo lee cada máquina (su árbol) y reescribe la expresión para que ya no haya dudas.",
  "Constructor: elige signos y paréntesis para llegar a la meta; cada resultado distinto queda clavado en la recta numérica.",
  "Abajo: gana estrellas en «¿Qué va primero?», ordena los pasos del A9, resuelve el quiz A4 y los ejercicios A2 y A6.",
];

export const IDEAS: string[] = [
  "Orden: agrupación → potencias y raíces → multiplicación y división → suma y resta.",
  "Las operaciones del mismo nivel se hacen de izquierda a derecha: 18 ÷ 3 × 2 = 12, no 3.",
  "Una expresión es un árbol: cada operación espera a que sus dos lados ya sean números.",
  "−3² = −9 pero (−3)² = 9: el exponente solo afecta a lo que tiene pegado.",
  "(10 − 6)² = 16, no 10² − 6² = 64; √(9 + 16) = 5, no √9 + √16 = 7.",
  "Si una expresión puede leerse de dos formas, sobran dudas y faltan paréntesis.",
];

export const GLOSARIO_LAB: { termino: string; definicion: string }[] = [
  { termino: "Jerarquía de operaciones", definicion: "Acuerdo sobre el orden en que se resuelven las operaciones de una expresión: agrupación, potencias y raíces, multiplicación y división, suma y resta." },
  { termino: "Símbolos de agrupación", definicion: "Paréntesis ( ), corchetes [ ] y llaves { }: lo que encierran se resuelve primero." },
  { termino: "Potencia", definicion: "Multiplicación repetida de una base: 4² = 4 × 4 = 16. El exponente afecta solo a lo que tiene inmediatamente a su izquierda." },
  { termino: "Raíz cuadrada", definicion: "Número que, multiplicado por sí mismo, da el radicando: √25 = 5 porque 5 × 5 = 25." },
  { termino: "Opuesto", definicion: "Número a la misma distancia del cero, del otro lado: el opuesto de 5 es −5. Restar es sumar el opuesto." },
  { termino: "Número racional", definicion: "Número que puede escribirse como fracción de enteros: 1/2, −3, 0.5 = 1/2." },
  { termino: "Número real", definicion: "Todos los racionales y los irracionales (como √2 o π) juntos: los puntos de la recta numérica." },
  { termino: "Ejecución inmediata", definicion: "Forma de operar de muchas calculadoras básicas: hacen cada operación en el orden en que se teclea, sin jerarquía." },
];
