/**
 * Evaluador de expresiones para la calculadora científica de los ejercicios.
 *
 * Parser de descenso recursivo SIN `eval` (seguro): tokeniza y evalúa una
 * expresión aritmética con funciones científicas. Módulo puro y testeable.
 *
 * Soporta:
 *   · operadores  + - * /  (y los símbolos × ÷), potencia ^ (asociativa der.)
 *   · unario - / +, factorial postfijo !  (enteros 0..170)
 *   · paréntesis, decimales con . , porcentaje sufijo  50%  → 0.5
 *   · constantes  pi (π) y e
 *   · funciones   sqrt(√) cbrt abs ln log log2 exp
 *                 sin cos tan asin acos atan  (respetan el modo grados/radianes)
 *
 * `evaluar()` nunca lanza: devuelve { ok, value } | { ok:false, error }.
 */

export type ModoAngulo = "deg" | "rad";

export interface EvalOk {
  ok: true;
  value: number;
}
export interface EvalErr {
  ok: false;
  error: string;
}
export type EvalResultado = EvalOk | EvalErr;

type Tok =
  | { t: "num"; v: number }
  | { t: "op"; v: string }
  | { t: "lp" }
  | { t: "rp" }
  | { t: "id"; v: string }
  | { t: "bang" }
  | { t: "pct" };

const FUNCS = new Set([
  "sqrt", "cbrt", "abs", "ln", "log", "log2", "exp",
  "sin", "cos", "tan", "asin", "acos", "atan",
]);

function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) throw new Error("El factorial necesita un entero ≥ 0");
  if (n > 170) throw new Error("El factorial es demasiado grande");
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

/** Normaliza símbolos visuales a los que entiende el tokenizador. */
function normalizar(src: string): string {
  return src
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/−/g, "-") // signo menos unicode
    .replace(/√/g, "sqrt")
    .replace(/π/g, "pi")
    .replace(/,/g, "."); // coma decimal → punto
}

function tokenizar(src: string): Tok[] {
  const s = normalizar(src);
  const toks: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i]!;
    if (c === " " || c === "\t" || c === "\n") {
      i++;
      continue;
    }
    if ((c >= "0" && c <= "9") || c === ".") {
      let j = i;
      let dots = 0;
      while (j < s.length) {
        const d = s[j]!;
        if (d >= "0" && d <= "9") j++;
        else if (d === ".") {
          dots++;
          if (dots > 1) throw new Error("Número con dos puntos decimales");
          j++;
        } else break;
      }
      const num = Number(s.slice(i, j));
      if (!Number.isFinite(num)) throw new Error("Número inválido");
      toks.push({ t: "num", v: num });
      i = j;
      continue;
    }
    if ((c >= "a" && c <= "z") || (c >= "A" && c <= "Z")) {
      let j = i;
      while (j < s.length) {
        const d = s[j]!;
        if ((d >= "a" && d <= "z") || (d >= "A" && d <= "Z") || (d >= "0" && d <= "9")) j++;
        else break;
      }
      toks.push({ t: "id", v: s.slice(i, j).toLowerCase() });
      i = j;
      continue;
    }
    if (c === "+" || c === "-" || c === "*" || c === "/" || c === "^") {
      toks.push({ t: "op", v: c });
      i++;
      continue;
    }
    if (c === "(") {
      toks.push({ t: "lp" });
      i++;
      continue;
    }
    if (c === ")") {
      toks.push({ t: "rp" });
      i++;
      continue;
    }
    if (c === "!") {
      toks.push({ t: "bang" });
      i++;
      continue;
    }
    if (c === "%") {
      toks.push({ t: "pct" });
      i++;
      continue;
    }
    throw new Error(`Carácter no permitido: "${c}"`);
  }
  return toks;
}

/** Parser de descenso recursivo sobre el arreglo de tokens. */
class Parser {
  private pos = 0;
  constructor(private readonly toks: Tok[], private readonly modo: ModoAngulo) {}

  private peek(): Tok | undefined {
    return this.toks[this.pos];
  }
  private next(): Tok | undefined {
    return this.toks[this.pos++];
  }

  parse(): number {
    const v = this.expr();
    if (this.pos !== this.toks.length) throw new Error("Expresión incompleta o mal formada");
    return v;
  }

  // expr := term (('+'|'-') term)*
  private expr(): number {
    let v = this.term();
    for (;;) {
      const tk = this.peek();
      if (tk && tk.t === "op" && (tk.v === "+" || tk.v === "-")) {
        this.next();
        const r = this.term();
        v = tk.v === "+" ? v + r : v - r;
      } else break;
    }
    return v;
  }

  // term := unary (('*'|'/') unary)*
  private term(): number {
    let v = this.unary();
    for (;;) {
      const tk = this.peek();
      if (tk && tk.t === "op" && (tk.v === "*" || tk.v === "/")) {
        this.next();
        const r = this.unary();
        if (tk.v === "/") {
          if (r === 0) throw new Error("División entre cero");
          v = v / r;
        } else v = v * r;
      } else break;
    }
    return v;
  }

  // unary := ('-'|'+') unary | power
  private unary(): number {
    const tk = this.peek();
    if (tk && tk.t === "op" && (tk.v === "-" || tk.v === "+")) {
      this.next();
      const v = this.unary();
      return tk.v === "-" ? -v : v;
    }
    return this.power();
  }

  // power := postfix ('^' unary)?   (^ asociativa a la derecha)
  private power(): number {
    const base = this.postfix();
    const tk = this.peek();
    if (tk && tk.t === "op" && tk.v === "^") {
      this.next();
      const exp = this.unary();
      const r = Math.pow(base, exp);
      if (!Number.isFinite(r)) throw new Error("Resultado fuera de rango");
      return r;
    }
    return base;
  }

  // postfix := primary ('!' | '%')*
  private postfix(): number {
    let v = this.primary();
    for (;;) {
      const tk = this.peek();
      if (tk && tk.t === "bang") {
        this.next();
        v = factorial(v);
      } else if (tk && tk.t === "pct") {
        this.next();
        v = v / 100;
      } else break;
    }
    return v;
  }

  private primary(): number {
    const tk = this.next();
    if (!tk) throw new Error("Falta un valor");
    if (tk.t === "num") return tk.v;
    if (tk.t === "lp") {
      const v = this.expr();
      const close = this.next();
      if (!close || close.t !== "rp") throw new Error("Falta un paréntesis de cierre");
      return v;
    }
    if (tk.t === "id") {
      if (tk.v === "pi") return Math.PI;
      if (tk.v === "e") return Math.E;
      if (FUNCS.has(tk.v)) {
        const lp = this.next();
        if (!lp || lp.t !== "lp") throw new Error(`Usa ${tk.v}(…) con paréntesis`);
        const arg = this.expr();
        const rp = this.next();
        if (!rp || rp.t !== "rp") throw new Error("Falta un paréntesis de cierre");
        return this.aplicarFuncion(tk.v, arg);
      }
      throw new Error(`No reconozco "${tk.v}"`);
    }
    throw new Error("Expresión mal formada");
  }

  private aplicarFuncion(nombre: string, x: number): number {
    const toRad = (a: number) => (this.modo === "deg" ? (a * Math.PI) / 180 : a);
    const fromRad = (a: number) => (this.modo === "deg" ? (a * 180) / Math.PI : a);
    let r: number;
    switch (nombre) {
      case "sqrt":
        if (x < 0) throw new Error("Raíz de un número negativo");
        r = Math.sqrt(x);
        break;
      case "cbrt":
        r = Math.cbrt(x);
        break;
      case "abs":
        r = Math.abs(x);
        break;
      case "ln":
        if (x <= 0) throw new Error("ln necesita un número positivo");
        r = Math.log(x);
        break;
      case "log":
        if (x <= 0) throw new Error("log necesita un número positivo");
        r = Math.log10(x);
        break;
      case "log2":
        if (x <= 0) throw new Error("log₂ necesita un número positivo");
        r = Math.log2(x);
        break;
      case "exp":
        r = Math.exp(x);
        break;
      case "sin":
        r = Math.sin(toRad(x));
        break;
      case "cos":
        r = Math.cos(toRad(x));
        break;
      case "tan":
        r = Math.tan(toRad(x));
        break;
      case "asin":
        if (x < -1 || x > 1) throw new Error("asin necesita un valor entre −1 y 1");
        r = fromRad(Math.asin(x));
        break;
      case "acos":
        if (x < -1 || x > 1) throw new Error("acos necesita un valor entre −1 y 1");
        r = fromRad(Math.acos(x));
        break;
      case "atan":
        r = fromRad(Math.atan(x));
        break;
      default:
        throw new Error(`Función desconocida: ${nombre}`);
    }
    if (!Number.isFinite(r)) throw new Error("Resultado fuera de rango");
    return r;
  }
}

/** Evalúa una expresión. Nunca lanza: devuelve un resultado discriminado. */
export function evaluar(src: string, modo: ModoAngulo = "deg"): EvalResultado {
  const limpio = src.trim();
  if (!limpio) return { ok: false, error: "Vacío" };
  try {
    const toks = tokenizar(limpio);
    if (toks.length === 0) return { ok: false, error: "Vacío" };
    const value = new Parser(toks, modo).parse();
    if (!Number.isFinite(value)) return { ok: false, error: "Resultado fuera de rango" };
    return { ok: true, value };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error" };
  }
}

/** Formatea un resultado numérico para mostrarlo en el visor. */
export function formatearResultado(n: number): string {
  if (!Number.isFinite(n)) return "Error";
  if (n === 0) return "0";
  const abs = Math.abs(n);
  // Notación científica para magnitudes extremas.
  if (abs >= 1e12 || abs < 1e-9) {
    return n.toExponential(6).replace(/\.?0+e/, "e");
  }
  // Redondeo a 10 cifras significativas para matar el ruido de coma flotante.
  const redondeado = Number(n.toPrecision(10));
  return String(redondeado);
}
