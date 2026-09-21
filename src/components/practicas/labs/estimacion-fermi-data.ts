/**
 * Datos y modelo del laboratorio "Estimación y órdenes de magnitud"
 * (PM-I, progresión 10; códigos de actividad PM-I-P07-A1 … A9).
 * Propósito: «Estima, aproxima y verifica la razonabilidad de resultados en
 * cálculos numéricos.»
 *
 * Anclas (VERBATIM):
 *   - A1 lectura «Estimar: el arte de calcular sin exactitud»: marco teórico,
 *     preguntas de comprensión y recuadro del INEGI.
 *   - A2 ejercicio_matematico «¿Es razonable este resultado?»: reto numérico y
 *     cuatro de los casos del modo «¿Es razonable?».
 *   - A3 reflexión escrita: panel «Para reflexionar».
 *   - A4 quiz de opción múltiple: reto evaluable. A5 verdadero/falso: hechos.
 *   - A6 completa el texto. A9 reto contrarreloj: inspira la tarjeta de
 *     estrellas (15 s por reactivo).
 *
 * Datos reales verificados (con fuente en cada objeto): población de la CDMX
 * (INEGI, Censo 2020), agua que entra a la red de la CDMX y fugas (SACMEX),
 * peso de mil granos de maíz, fracción de empaque aleatorio de esferas
 * (Scott y Kilgour, 1969), altura de la Torre Latinoamericana, superficie de la
 * CDMX (INEGI). Los casos nuevos del modo «¿Es razonable?» son situaciones
 * didácticas con cuentas exactas; los precios que aparecen son ilustrativos.
 *
 * Datos puros (sin three ni React).
 */

import type { QuizEvaluable } from "./_reto-quiz";
import type { TextoHuecosData } from "./_mecanica-huecos";
import type { RetoNumericoData } from "./_reto-numerico";

/* ── Modos ────────────────────────────────────────────────────────────── */

export type Modo = "fermi" | "redondeo" | "razonable";
export const MODOS: Modo[] = ["fermi", "redondeo", "razonable"];

export const MODOS_DEF: Record<Modo, { etq: string; subtitulo: string; icono: string; color: string }> = {
  fermi: { etq: "Problemas de Fermi", subtitulo: "Descompón, estima y compara con el dato real", icono: "fa-cubes-stacked", color: "#38bdf8" },
  redondeo: { etq: "Redondear y truncar", subtitulo: "Valles, cifras y números redondos", icono: "fa-arrows-down-to-line", color: "#a78bfa" },
  razonable: { etq: "¿Es razonable?", subtitulo: "Caza el resultado absurdo", icono: "fa-magnifying-glass-chart", color: "#fbbf24" },
};

/* ── Utilidades numéricas ─────────────────────────────────────────────── */

export function mulberry32(semilla: number) {
  let t = semilla >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Número con separador de miles (espacio) y decimales fijos. */
export function num(x: number, dec = 0): string {
  const s = Math.abs(x).toFixed(dec);
  const [ent, frac] = s.split(".");
  const conMiles = ent!.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${x < 0 ? "−" : ""}${conMiles}${frac ? `.${frac}` : ""}`;
}

const SUP: Record<string, string> = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
export function sup(n: number): string {
  return String(n)
    .split("")
    .map((c) => SUP[c] ?? c)
    .join("");
}

/** Exponente de la notación científica: x = a × 10ⁿ con 1 ≤ a < 10. */
export function exponente(x: number): number {
  if (x === 0) return 0;
  const n = Math.floor(Math.log10(Math.abs(x)) + 1e-12);
  return n;
}

/** Notación científica con `cs` cifras significativas: «4.3 × 10⁷». */
export function cient(x: number, cs = 2): string {
  if (x === 0) return "0";
  let n = exponente(x);
  let a = Number((x / Math.pow(10, n)).toFixed(cs - 1));
  if (Math.abs(a) >= 10) {
    a /= 10;
    n += 1;
  }
  return `${a.toFixed(cs - 1)} × 10${sup(n)}`;
}

/** Cantidad legible: con miles si es «normal», en notación científica si es enorme o diminuta. */
export function cantidad(x: number): string {
  const ax = Math.abs(x);
  if (ax === 0) return "0";
  if (ax >= 1e6 || ax < 0.01) return cient(x, 2);
  if (ax >= 100) return num(x, 0);
  if (ax >= 10) return num(x, 1).replace(/\.0$/, "");
  return num(x, 2).replace(/\.?0+$/, "");
}

/** Evita la basura binaria (2.35/0.1 = 23.4999…) redondeando a 12 decimales. */
function limpio(x: number): number {
  return Number(x.toFixed(12));
}

export function estrellasPorErrores(errores: number): number {
  return errores === 0 ? 3 : errores <= 2 ? 2 : 1;
}

/* ════════════════════════════════════════════════════════════════════════
 * 1. PROBLEMAS DE FERMI
 * ════════════════════════════════════════════════════════════════════════ */

export type Duda = "seguro" | "dudoso" | "niIdea";
export const DUDAS: { id: Duda; etq: string; k: number }[] = [
  { id: "seguro", etq: "Seguro · ±25 %", k: 1.25 },
  { id: "dudoso", etq: "Dudoso · ×÷2", k: 2 },
  { id: "niIdea", etq: "Ni idea · ×÷5", k: 5 },
];
export function kDuda(d: Duda): number {
  return DUDAS.find((x) => x.id === d)!.k;
}

export interface FactorFermi {
  id: string;
  etq: string;
  unidad: string;
  min: number;
  max: number;
  /** Paso del deslizador (en escala lineal) o número de pasos (en escala logarítmica). */
  paso: number;
  log?: boolean;
  inicial: number;
  /** Valor de referencia real o medido. */
  referencia: number;
  refTexto: string;
  pista: string;
  /** Dato que da el problema: no se estima. */
  fijo?: boolean;
  dec: number;
}

export type VisualFermi = "salon" | "costal" | "agua";

export interface ProblemaFermi {
  id: VisualFermi;
  titulo: string;
  pregunta: string;
  icono: string;
  factores: FactorFermi[];
  /** Fórmula que se muestra: combinación de los factores. */
  formula: string;
  unidad: string;
  /** Valor real (medido) o de referencia (calculado con datos medidos). */
  real: number;
  tipoReal: "medido" | "referencia";
  realTexto: string;
  /** Rango real conocido, si lo hay. */
  realRango?: [number, number];
  fuente: string;
  /** Qué suele explicar la diferencia entre una estimación y el dato. */
  leccion: string;
}

/** Canica estándar: 16 mm de diámetro. Fracción de empaque aleatorio compacto ≈ 0.64 (Scott y Kilgour, 1969). */
export const D_CANICA_CM = 1.6;
export const EMPAQUE_ALEATORIO = 0.64;
export const SALON_REF = { largo: 8, ancho: 6, alto: 3 };

export function canicasEnSalon(largo: number, ancho: number, alto: number, dCm: number, fraccion: number): number {
  const volSalonCm3 = largo * ancho * alto * 1e6;
  const volCanica = (Math.PI / 6) * dCm ** 3;
  return (volSalonCm3 * fraccion) / volCanica;
}

/** Peso de mil granos de maíz: 250–400 g según variedad y condiciones (centro ≈ 330 g). */
export const MASA_GRANO_G = 0.33;
export const COSTAL_KG = 50;
export function granosEnCostal(kg: number, masaGranoG: number): number {
  return (kg * 1000) / masaGranoG;
}

/** Agua que entra a la red de la CDMX: 32 000 L/s (SACMEX). */
export const LITROS_POR_SEGUNDO_CDMX = 32000;
export const AGUA_CDMX_L_DIA = LITROS_POR_SEGUNDO_CDMX * 86400;
export const HABITANTES_CDMX = 9209944;
export const CONSUMO_L_HAB = 177;
export const FUGAS_CDMX = 0.37;
export function aguaCdmx(millones: number, litrosPersona: number, multFugas: number): number {
  return millones * 1e6 * litrosPersona * multFugas;
}
export const TORRE_LATINO_M = 182;

export const PROBLEMAS: ProblemaFermi[] = [
  {
    id: "salon",
    titulo: "Canicas en un salón",
    pregunta: "¿Cuántas canicas caben en tu salón de clases, del piso al techo?",
    icono: "fa-circle-dot",
    formula: "canicas = (largo × ancho × alto) × fracción ocupada ÷ volumen de una canica",
    factores: [
      { id: "largo", etq: "Largo del salón", unidad: "m", min: 4, max: 16, paso: 0.5, inicial: 6, referencia: SALON_REF.largo, refTexto: "8 m", pista: "¿Cuántos pasos largos (≈ 1 m) mide de pared a pared?", dec: 1 },
      { id: "ancho", etq: "Ancho del salón", unidad: "m", min: 3, max: 12, paso: 0.5, inicial: 5, referencia: SALON_REF.ancho, refTexto: "6 m", pista: "¿Cuántas filas de bancas caben de lado a lado?", dec: 1 },
      { id: "alto", etq: "Altura al techo", unidad: "m", min: 2, max: 5, paso: 0.1, inicial: 2.5, referencia: SALON_REF.alto, refTexto: "3 m", pista: "Una puerta mide unos 2 m: ¿cuánto sobra hasta el techo?", dec: 1 },
      { id: "diametro", etq: "Diámetro de una canica", unidad: "cm", min: 0.5, max: 4, paso: 0.1, inicial: 2.5, referencia: D_CANICA_CM, refTexto: "1.6 cm (canica estándar)", pista: "Compárala con el ancho de tu dedo índice.", dec: 1 },
      { id: "fraccion", etq: "Fracción del espacio que ocupan", unidad: "", min: 0.3, max: 0.9, paso: 0.01, inicial: 0.5, referencia: EMPAQUE_ALEATORIO, refTexto: "0.64 (medida en laboratorio)", pista: "Entre esferas siempre quedan huecos: nunca llenan el 100 %.", dec: 2 },
    ],
    unidad: "canicas",
    real: canicasEnSalon(SALON_REF.largo, SALON_REF.ancho, SALON_REF.alto, D_CANICA_CM, EMPAQUE_ALEATORIO),
    tipoReal: "referencia",
    realTexto: "salón de referencia de 8 × 6 × 3 m, canica estándar de 16 mm y empaque aleatorio de 0.64",
    fuente: "Fracción de empaque aleatorio compacto de esferas ≈ 0.64: G. D. Scott y D. M. Kilgour (1969), J. Phys. D 2, 863. Medidas del salón: referencia típica, no norma.",
    leccion: "El factor que más pesa es el diámetro: está elevado al cubo. Si estimas 3 cm en vez de 1.6 cm, caben (3 ÷ 1.6)³ ≈ 6.6 veces menos canicas.",
  },
  {
    id: "costal",
    titulo: "Granos de maíz en un costal",
    pregunta: "¿Cuántos granos de maíz hay en un costal de 50 kg?",
    icono: "fa-wheat-awn",
    formula: "granos = masa del costal (en gramos) ÷ masa de un grano",
    factores: [
      { id: "costal", etq: "Masa del costal", unidad: "kg", min: 50, max: 50, paso: 1, inicial: COSTAL_KG, referencia: COSTAL_KG, refTexto: "50 kg (dato del problema)", pista: "Es el dato que da el problema.", fijo: true, dec: 0 },
      { id: "grano", etq: "Masa de un grano", unidad: "g", min: 0.01, max: 5, paso: 60, log: true, inicial: 1.5, referencia: MASA_GRANO_G, refTexto: "≈ 0.33 g (mil granos pesan 250–400 g)", pista: "Un clip pesa cerca de 1 g. ¿Un grano de maíz pesa más o menos que un clip?", dec: 2 },
    ],
    unidad: "granos",
    real: granosEnCostal(COSTAL_KG, MASA_GRANO_G),
    realRango: [granosEnCostal(COSTAL_KG, 0.4), granosEnCostal(COSTAL_KG, 0.25)],
    tipoReal: "medido",
    realTexto: "peso de mil granos de maíz de 250 a 400 g según la variedad y la cosecha (125 000 a 200 000 granos)",
    fuente: "Peso de mil granos de maíz: 250–400 g (fichas agronómicas de rendimiento de maíz; INIFAP y protocolos de estimación de rinde).",
    leccion: "Con un solo factor desconocido, todo el error viene de la masa de un grano. Pesar 100 granos en una báscula de cocina bastaría para afinarla.",
  },
  {
    id: "agua",
    titulo: "Agua de la Ciudad de México",
    pregunta: "¿Cuántos litros de agua potable entran cada día a la red de la Ciudad de México?",
    icono: "fa-droplet",
    formula: "litros al día = habitantes × litros por persona × factor de fugas",
    factores: [
      { id: "habitantes", etq: "Habitantes de la CDMX", unidad: "millones", min: 1, max: 30, paso: 0.1, inicial: 5, referencia: HABITANTES_CDMX / 1e6, refTexto: "9.2 millones (INEGI, Censo 2020)", pista: "No confundas la ciudad con toda la zona metropolitana del Valle de México.", dec: 1 },
      { id: "litros", etq: "Litros que usa una persona al día", unidad: "L", min: 10, max: 1000, paso: 80, log: true, inicial: 60, referencia: CONSUMO_L_HAB, refTexto: "177 L (consumo promedio, SACMEX)", pista: "Una regadera gasta unos 10 L por minuto; suma baño, excusado, cocina y lavado.", dec: 0 },
      { id: "fugas", etq: "Factor por fugas en la red", unidad: "×", min: 1, max: 3, paso: 0.05, inicial: 1, referencia: 1 / (1 - FUGAS_CDMX), refTexto: "× 1.59 (se pierde el 37 %, SACMEX)", pista: "Parte del agua se pierde en tuberías rotas antes de llegar a las casas. Si no lo sabes, deja 1.", dec: 2 },
    ],
    unidad: "L/día",
    real: AGUA_CDMX_L_DIA,
    tipoReal: "medido",
    realTexto: "32 000 litros por segundo × 86 400 s que tiene un día",
    fuente: "SACMEX: a la red de la CDMX entran unos 32 000 L/s y se pierde cerca del 37 % en fugas; consumo promedio de 177 L por habitante. INEGI, Censo 2020: 9 209 944 habitantes. En la sequía de 2024 el caudal bajó a unos 26 000 L/s.",
    leccion: "Quien estima solo lo que usa en casa suele quedar abajo: se olvida de las fugas (37 %), de comercios y oficinas. Aun así, casi siempre acierta el orden de magnitud: 10⁹ litros.",
  },
];

/** Valor de un deslizador logarítmico: índice 0…paso → min…max. */
export function valorLog(f: FactorFermi, idx: number): number {
  const t = idx / f.paso;
  return f.min * Math.pow(f.max / f.min, t);
}
export function indiceLog(f: FactorFermi, v: number): number {
  return Math.round((Math.log(v / f.min) / Math.log(f.max / f.min)) * f.paso);
}

export function calcularFermi(p: ProblemaFermi, v: number[]): number {
  if (p.id === "salon") return canicasEnSalon(v[0]!, v[1]!, v[2]!, v[3]!, v[4]!);
  if (p.id === "costal") return granosEnCostal(v[0]!, v[1]!);
  return aguaCdmx(v[0]!, v[1]!, v[2]!);
}

/**
 * Rango pesimista de la estimación: cada factor dudoso puede valer entre
 * valor ÷ k y valor × k (dentro de los límites del deslizador). Se evalúan
 * todas las combinaciones de extremos y se toma el mínimo y el máximo.
 */
export function rangoFermi(p: ProblemaFermi, v: number[], dudas: Duda[]): [number, number] {
  const n = p.factores.length;
  let lo = Infinity;
  let hi = -Infinity;
  for (let mask = 0; mask < 1 << n; mask++) {
    const vals = p.factores.map((f, i) => {
      if (f.fijo) return v[i]!;
      const k = kDuda(dudas[i] ?? "dudoso");
      const x = mask & (1 << i) ? v[i]! * k : v[i]! / k;
      return Math.min(f.max, Math.max(f.min, x));
    });
    const r = calcularFermi(p, vals);
    lo = Math.min(lo, r);
    hi = Math.max(hi, r);
  }
  return [lo, hi];
}

/** Error en órdenes de magnitud: log₁₀(estimación ÷ real). */
export function errorOrdenes(est: number, real: number): number {
  return Math.log10(est / real);
}

export function veredictoFermi(e: number): { etq: string; color: string; explica: string } {
  const a = Math.abs(e);
  const dir = e > 0 ? "arriba" : "abajo";
  const veces = Math.pow(10, a);
  if (a < Math.log10(2)) return { etq: "Excelente", color: "#34d399", explica: `Quedaste a menos del doble del valor real (${veces.toFixed(2)} veces por ${dir}).` };
  if (a < 1) return { etq: "Mismo orden de magnitud", color: "#34d399", explica: `Quedaste ${veces.toFixed(1)} veces por ${dir}: menos de un factor de 10. Para un problema de Fermi, es un éxito.` };
  if (a < 2) return { etq: "Un orden de magnitud de diferencia", color: "#fbbf24", explica: `Quedaste unas ${Math.round(veces)} veces por ${dir}. Revisa el factor en el que dudaste más.` };
  return { etq: "Muy lejos", color: "#f87171", explica: `Quedaste unas ${cient(veces, 1)} veces por ${dir}: más de dos órdenes de magnitud. Algún factor está muy mal o falta uno.` };
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. REDONDEAR Y TRUNCAR
 * ════════════════════════════════════════════════════════════════════════ */

export type Metodo = "redondear" | "truncar";

export interface NumeroEjercicio {
  id: string;
  valor: number;
  /** Decimales con que se escribe el número. */
  dec: number;
  /** Unidad de redondeo (100, 10, 1, 0.1…). */
  paso: number;
  lugar: string;
  /** De dónde sale el ejemplo o qué enseña. */
  nota: string;
}

export const NUMEROS: NumeroEjercicio[] = [
  { id: "n47", valor: 47, dec: 0, paso: 10, lugar: "a la decena", nota: "Ejemplo del quiz A4." },
  { id: "n68", valor: 6.8, dec: 1, paso: 1, lugar: "a la unidad", nota: "Ejemplo del verdadero o falso A5." },
  { id: "n198", valor: 198, dec: 0, paso: 100, lugar: "a la centena", nota: "Del quiz A4: 198 + 203 ≈ 200 + 200." },
  { id: "n25", valor: 2.5, dec: 1, paso: 1, lugar: "a la unidad", nota: "Justo a la mitad: la regla escolar es que con 5 o más se sube." },
  { id: "npi", valor: 3.14159, dec: 5, paso: 0.01, lugar: "a centésimas", nota: "El número π con dos decimales." },
  { id: "n1996", valor: 19.96, dec: 2, paso: 0.1, lugar: "a décimas", nota: "Al subir, el 9 se vuelve 10 y «se lleva» uno: 20.0." },
  { id: "ncdmx", valor: 9209944, dec: 0, paso: 100000, lugar: "a 2 cifras significativas", nota: "Habitantes de la CDMX (INEGI, 2020)." },
  { id: "nmm", valor: 0.004576, dec: 6, paso: 0.0001, lugar: "a 2 cifras significativas", nota: "Los ceros de la izquierda no son cifras significativas." },
  { id: "nneg", valor: -3.7, dec: 1, paso: 1, lugar: "a la unidad", nota: "Negativo: truncar acerca al cero, redondear no siempre." },
];

export function decimalesDe(paso: number): number {
  return paso >= 1 ? 0 : Math.round(-Math.log10(paso));
}

export function redondear(x: number, paso: number): number {
  const s = Math.sign(x) || 1;
  return limpio(s * Math.floor(limpio(Math.abs(x) / paso) + 0.5) * paso);
}

export function truncar(x: number, paso: number): number {
  const s = Math.sign(x) || 1;
  return limpio(s * Math.floor(limpio(Math.abs(x) / paso)) * paso);
}

/** Los dos múltiplos del paso entre los que cae el número (abajo, arriba). */
export function vecinos(x: number, paso: number): [number, number] {
  const q = limpio(x / paso);
  const abajo = limpio(Math.floor(q) * paso);
  const arriba = Number.isInteger(q) ? abajo : limpio(abajo + paso);
  return [abajo, arriba];
}

export function resultadoMetodo(e: NumeroEjercicio, m: Metodo): number {
  return m === "redondear" ? redondear(e.valor, e.paso) : truncar(e.valor, e.paso);
}

export function explicaMetodo(e: NumeroEjercicio, m: Metodo): string {
  const [a, b] = vecinos(e.valor, e.paso);
  const d = decimalesDe(e.paso);
  const r = resultadoMetodo(e, m);
  const fmt = (x: number) => num(x, d);
  if (m === "truncar") return `Truncar es cortar las cifras que sobran sin mirar lo que viene: ${num(e.valor, e.dec)} → ${fmt(r)}. Siempre se acerca al cero.`;
  const da = limpio(Math.abs(e.valor - a));
  const db = limpio(Math.abs(b - e.valor));
  if (da === db) return `${num(e.valor, e.dec)} está justo a la mitad entre ${fmt(a)} y ${fmt(b)}: con 5 se sube, así que queda ${fmt(r)}.`;
  const cerca = da < db ? a : b;
  return `${num(e.valor, e.dec)} está a ${num(Math.min(da, db), e.dec)} de ${fmt(cerca)} y a ${num(Math.max(da, db), e.dec)} de ${fmt(cerca === a ? b : a)}: rueda al valle más cercano, ${fmt(r)}.`;
}

/* ── Estimar operaciones con números redondos (modelo de área) ────────── */

export interface OperacionEstimar {
  id: string;
  etq: string;
  a: number;
  b: number;
  etqA: string;
  etqB: string;
  opcionesA: number[];
  opcionesB: number[];
  decA: number;
  decB: number;
  fuente: string;
}

export const OPERACIONES: OperacionEstimar[] = [
  { id: "estadio", etq: "23 × 480", a: 23, b: 480, etqA: "secciones", etqB: "asientos por sección", opcionesA: [23, 20, 25], opcionesB: [480, 500, 400], decA: 0, decB: 0, fuente: "Estadio del ejercicio A2 a)" },
  { id: "cuadrado", etq: "49 × 51", a: 49, b: 51, etqA: "primer factor", etqB: "segundo factor", opcionesA: [49, 50], opcionesB: [51, 50], decA: 0, decB: 0, fuente: "Quiz A4" },
  { id: "tienda", etq: "347 × $29.90", a: 347, b: 29.9, etqA: "productos", etqB: "precio ($)", opcionesA: [347, 350, 300], opcionesB: [29.9, 30], decA: 0, decB: 2, fuente: "Tienda del ejercicio A2 b)" },
];

export function errorRelativo(estimado: number, exacto: number): number {
  return Math.abs(estimado - exacto) / Math.abs(exacto);
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. ¿ES RAZONABLE?
 * ════════════════════════════════════════════════════════════════════════ */

export type TipoError = "ninguno" | "coma" | "unidades" | "operacion";
export const TIPOS_ERROR: { id: Exclude<TipoError, "ninguno">; etq: string; icono: string; explica: string }[] = [
  { id: "coma", etq: "Punto decimal o cero de más", icono: "fa-circle-dot", explica: "El resultado sale 10, 100 o 1000 veces mayor o menor: se corrió el punto decimal o se agregó un cero." },
  { id: "unidades", etq: "Unidades confundidas", icono: "fa-ruler-combined", explica: "El número está bien calculado, pero con la unidad equivocada (g por kg, m² por km²)." },
  { id: "operacion", etq: "Operación equivocada", icono: "fa-shuffle", explica: "Se multiplicó en vez de dividir o se dividió al revés." },
];

export type ObjetoId = "bus" | "seccion" | "fajo" | "billete" | "rollo" | "capsula" | "vaso" | "bolsa" | "moneda" | "barra" | "loseta";

export interface CasoRazonable {
  id: string;
  etq: string;
  icono: string;
  enunciado: string;
  /** Resultado que se afirma, expresado en la unidad de la cuenta exacta. */
  dado: number;
  dadoTexto: string;
  exacto: number;
  unidad: string;
  error: TipoError;
  guia: string;
  explica: string;
  fuente: string;
  objeto: ObjetoId;
  /** Cuántas unidades representa cada objeto en 3D. */
  porObjeto: number;
  etqObjeto: string;
  decimales: number;
}

export const CASOS: CasoRazonable[] = [
  {
    id: "autobuses",
    etq: "Autobuses",
    icono: "fa-bus",
    enunciado: "Hay que llevar a 480 personas en autobuses de 40 asientos. La hoja de cálculo dice que se necesitan 1,200 autobuses.",
    dado: 1200,
    dadoTexto: "1,200 autobuses",
    exacto: 12,
    unidad: "autobuses",
    error: "coma",
    guia: "480 ÷ 40 = 48 ÷ 4 = 12.",
    explica: "1,200 es 100 veces 12: alguien dividió entre 0.4 en lugar de 40. Si cada autobús lleva 40 personas, 1,200 autobuses llevarían 48,000.",
    fuente: "Lectura A1",
    objeto: "bus",
    porObjeto: 1,
    etqObjeto: "1 autobús",
    decimales: 0,
  },
  {
    id: "estadio",
    etq: "Estadio",
    icono: "fa-people-group",
    enunciado: "Un estadio tiene 23 secciones de aproximadamente 480 asientos cada una. Se dice que caben 11,520 personas.",
    dado: 11520,
    dadoTexto: "11,520 personas",
    exacto: 23 * 480,
    unidad: "personas",
    error: "ninguno",
    guia: "a) Estima: 23 × 500 ≈ 11,500. ¿Coincide con 11,520?",
    explica: "La estimación con números redondos (11,500) está muy cerca de 11,520. Como las secciones tienen «aproximadamente» 480 asientos, el resultado es razonable.",
    fuente: "Ejercicio A2 a)",
    objeto: "seccion",
    porObjeto: 480,
    etqObjeto: "1 sección de 480 asientos",
    decimales: 0,
  },
  {
    id: "tienda",
    etq: "Tienda",
    icono: "fa-cash-register",
    enunciado: "Una tienda vendió 347 productos a $29.90 cada uno. La cajera dice que el total es $103,776.30.",
    dado: 103776.3,
    dadoTexto: "$103,776.30",
    exacto: 347 * 29.9,
    unidad: "pesos",
    error: "coma",
    guia: "b) Estima: 350 × 30 = 10,500. ¿Coincide con 103,776?",
    explica: "La estimación da unos $10,500 y la cajera dice más de $100,000: diez veces más. Se corrió el punto decimal (o se tecleó una cifra de más).",
    fuente: "Ejercicio A2 b)",
    objeto: "fajo",
    porObjeto: 1000,
    etqObjeto: "1 fajo de $1,000",
    decimales: 2,
  },
  {
    id: "reparto",
    etq: "Reparto",
    icono: "fa-hand-holding-dollar",
    enunciado: "Si divides $1,800 entre 36 personas, cada una debería recibir $500.",
    dado: 500,
    dadoTexto: "$500 por persona",
    exacto: 1800 / 36,
    unidad: "pesos",
    error: "coma",
    guia: "c) Estima: 1,800 ÷ 36 = 50. ¿Coincide con 500?",
    explica: "Con $500 por persona, 36 personas recibirían $18,000, no $1,800. Hay un cero de más: son $50.",
    fuente: "Ejercicio A2 c)",
    objeto: "billete",
    porObjeto: 50,
    etqObjeto: "1 billete de $50",
    decimales: 0,
  },
  {
    id: "tela",
    etq: "Tela",
    icono: "fa-scissors",
    enunciado: "Necesitas 8 metros de tela para 4 trajes. Se afirma que para 7 trajes necesitarás 14 metros.",
    dado: 14,
    dadoTexto: "14 m de tela",
    exacto: 14,
    unidad: "m",
    error: "ninguno",
    guia: "d) Estima: si 4 trajes necesitan 8 m, cada traje necesita 2 m. 7 × 2 = 14. ¿Coincide?",
    explica: "Cada traje usa 2 m; 7 trajes usan 14 m. Coincide exactamente: es razonable.",
    fuente: "Ejercicio A2 d)",
    objeto: "rollo",
    porObjeto: 1,
    etqObjeto: "1 m de tela",
    decimales: 0,
  },
  {
    id: "dosis",
    etq: "Dosis",
    icono: "fa-prescription-bottle-medical",
    enunciado: "Una niña de 18 kg debe tomar 15 mg de medicamento por cada kilogramo de peso. En la indicación alguien anotó 2,700 mg por toma.",
    dado: 2700,
    dadoTexto: "2,700 mg por toma",
    exacto: 18 * 15,
    unidad: "mg",
    error: "coma",
    guia: "18 × 15 ≈ 20 × 15 = 300 mg.",
    explica: "La cuenta correcta es 270 mg; 2,700 mg es diez veces la dosis. En medicina un error de coma es peligroso: por eso se estima siempre antes de administrar (y la dosis la indica un médico).",
    fuente: "Situación didáctica del laboratorio",
    objeto: "capsula",
    porObjeto: 100,
    etqObjeto: "100 mg",
    decimales: 0,
  },
  {
    id: "garrafon",
    etq: "Garrafón",
    icono: "fa-bottle-water",
    enunciado: "Un garrafón de 20 L alcanza para servir 80 vasos de 250 mL.",
    dado: 80,
    dadoTexto: "80 vasos",
    exacto: 20000 / 250,
    unidad: "vasos",
    error: "ninguno",
    guia: "20 L = 20,000 mL; 20,000 ÷ 250 = 80 (4 vasos por litro × 20).",
    explica: "Parece raro porque mezcla litros y mililitros, pero 4 vasos de 250 mL hacen 1 L y 20 L dan 80 vasos: es razonable.",
    fuente: "Situación didáctica del laboratorio",
    objeto: "vaso",
    porObjeto: 1,
    etqObjeto: "1 vaso",
    decimales: 0,
  },
  {
    id: "receta",
    etq: "Receta",
    icono: "fa-cake-candles",
    enunciado: "Un pastel para 8 personas lleva 250 g de harina. Para 24 personas, la aplicación calculó 750 kg de harina.",
    dado: 750000,
    dadoTexto: "750 kg de harina",
    exacto: 3 * 250,
    unidad: "g",
    error: "unidades",
    guia: "24 personas son 3 veces 8: 3 × 250 g = 750 g = 0.75 kg.",
    explica: "La cuenta 3 × 250 = 750 está bien, pero son gramos, no kilogramos: 750 kg serían 3,000 bolsas de 250 g. Con la unidad correcta son 750 g.",
    fuente: "Situación didáctica del laboratorio",
    objeto: "bolsa",
    porObjeto: 250,
    etqObjeto: "1 bolsa de 250 g",
    decimales: 0,
  },
  {
    id: "terreno",
    etq: "Terreno",
    icono: "fa-vector-square",
    enunciado: "Un terreno rectangular mide 20 m por 30 m. En el plano escribieron que su área es de 600 km².",
    dado: 600e6,
    dadoTexto: "600 km²",
    exacto: 20 * 30,
    unidad: "m²",
    error: "unidades",
    guia: "20 × 30 = 600, y metros por metros dan metros cuadrados: 600 m².",
    explica: "600 km² son 600 millones de m²: el 40 % de toda la Ciudad de México (unos 1,495 km², INEGI). El número está bien; la unidad no.",
    fuente: "Situación didáctica; superficie de la CDMX: INEGI",
    objeto: "loseta",
    porObjeto: 10,
    etqObjeto: "10 m²",
    decimales: 0,
  },
  {
    id: "naranjas",
    etq: "Naranjas",
    icono: "fa-lemon",
    enunciado: "Compraste 3 kg de naranja por $45. La calculadora dice que el precio por kilo es $0.07.",
    dado: 3 / 45,
    dadoTexto: "$0.07 por kilo",
    exacto: 45 / 3,
    unidad: "pesos por kg",
    error: "operacion",
    guia: "Precio por kilo = pesos ÷ kilos = 45 ÷ 3 = 15.",
    explica: "Alguien dividió al revés: 3 ÷ 45 ≈ 0.07. Un kilo de naranja no cuesta siete centavos; el precio razonable es $15 por kilo (precio ilustrativo).",
    fuente: "Situación didáctica (como el precio de $0.002 de la lectura A1)",
    objeto: "moneda",
    porObjeto: 1,
    etqObjeto: "$1",
    decimales: 2,
  },
  {
    id: "velocidad",
    etq: "Velocidad",
    icono: "fa-gauge-high",
    enunciado: "Un autobús recorre 450 km en 5 horas. Se afirma que su velocidad media fue de 2,250 km/h.",
    dado: 450 * 5,
    dadoTexto: "2,250 km/h",
    exacto: 450 / 5,
    unidad: "km/h",
    error: "operacion",
    guia: "Velocidad = distancia ÷ tiempo = 450 ÷ 5 = 90 km/h.",
    explica: "Se multiplicó en vez de dividir. 2,250 km/h es más del doble de la velocidad de crucero de un avión comercial (unos 850 km/h); un autobús va a unos 90 km/h.",
    fuente: "Situación didáctica del laboratorio",
    objeto: "barra",
    porObjeto: 10,
    etqObjeto: "10 km/h",
    decimales: 0,
  },
];

export function esRazonable(c: CasoRazonable): boolean {
  return c.error === "ninguno";
}

/** Una estimación del alumno se considera buena si difiere menos de 25 % de la cuenta exacta. */
export function estimacionBuena(est: number, exacto: number): boolean {
  return errorRelativo(est, exacto) <= 0.25;
}

/* ════════════════════════════════════════════════════════════════════════
 * Estrellas: ¿qué orden de magnitud? (contrarreloj, como el reto A9)
 * ════════════════════════════════════════════════════════════════════════ */

export const SEGUNDOS_POR_REACTIVO = 15;

export interface CantidadOrden {
  texto: string;
  valor: number;
  explica: string;
}

export const CANTIDADES: CantidadOrden[] = [
  { texto: "Segundos que tiene un día", valor: 86400, explica: "24 × 60 × 60 = 86 400 ≈ 8.6 × 10⁴." },
  { texto: "Habitantes de México (INEGI, Censo 2020)", valor: 126014024, explica: "126 014 024 ≈ 1.3 × 10⁸." },
  { texto: "Habitantes de la Ciudad de México (INEGI, 2020)", valor: HABITANTES_CDMX, explica: "9 209 944 ≈ 9.2 × 10⁶." },
  { texto: "Litros de agua en una alberca olímpica (50 × 25 × 2 m)", valor: 2500000, explica: "2 500 m³ × 1 000 L = 2.5 × 10⁶ L." },
  { texto: "Latidos de un corazón en un día, a 70 por minuto", valor: 70 * 60 * 24, explica: "70 × 1 440 minutos = 100 800 ≈ 1.0 × 10⁵." },
  { texto: "Kilómetros de la Tierra a la Luna (distancia media)", valor: 384400, explica: "384 400 km ≈ 3.8 × 10⁵." },
  { texto: "Granos de maíz en 1 kg (grano de 0.33 g)", valor: 1000 / MASA_GRANO_G, explica: "1 000 g ÷ 0.33 g ≈ 3 000 = 3.0 × 10³." },
  { texto: "Centímetros de altura de la Torre Latinoamericana con antena (182 m)", valor: TORRE_LATINO_M * 100, explica: "182 m × 100 = 18 200 cm ≈ 1.8 × 10⁴." },
  { texto: "Litros de agua que entran a la red de la CDMX en un día (SACMEX)", valor: AGUA_CDMX_L_DIA, explica: "32 000 L/s × 86 400 s ≈ 2.8 × 10⁹." },
  { texto: "Metros de diámetro de un glóbulo rojo (unos 7.5 µm)", valor: 7.5e-6, explica: "7.5 µm = 7.5 × 10⁻⁶ m." },
  { texto: "Minutos que tiene una semana", valor: 7 * 24 * 60, explica: "7 × 24 × 60 = 10 080 ≈ 1.0 × 10⁴." },
  { texto: "Kilómetros de la Tierra al Sol (distancia media)", valor: 1.496e8, explica: "149 600 000 km ≈ 1.5 × 10⁸." },
];

export interface ReactivoOrden {
  idx: number;
  opciones: number[];
}

/** Ronda de `n` reactivos; cada uno con 4 exponentes posibles, uno correcto. */
export function rondaOrdenes(rnd: () => number, n = 6): ReactivoOrden[] {
  const idxs = CANTIDADES.map((_, i) => i);
  for (let i = idxs.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [idxs[i], idxs[j]] = [idxs[j]!, idxs[i]!];
  }
  return idxs.slice(0, n).map((idx) => {
    const e = exponente(CANTIDADES[idx]!.valor);
    const desfase = Math.floor(rnd() * 4);
    const salto = Math.abs(e) > 5 ? 2 : 1;
    return { idx, opciones: [0, 1, 2, 3].map((k) => e + (k - desfase) * salto) };
  });
}

/* ════════════════════════════════════════════════════════════════════════
 * Contenido VERBATIM
 * ════════════════════════════════════════════════════════════════════════ */

export const TITULO_A1 = "Estimar: el arte de calcular sin exactitud";

/** Lectura A1 — cuatro párrafos, verbatim. */
export const LECTURA_A1: string[] = [
  "Estimar es calcular un valor aproximado sin necesidad de calcularlo con exactitud. No es adivinar al azar: es usar el razonamiento matemático para obtener una aproximación razonable en poco tiempo. La estimación es tan importante como el cálculo exacto, y a veces más útil.",
  "Algunas estrategias de estimación incluyen el redondeo (aproximar a decenas, centenas o múltiplos convenientes), la comparación con referencias conocidas (¿cuántas veces cabe este objeto en aquel?) y el uso de porcentajes aproximados (el 10% de algo es fácil de calcular mentalmente).",
  "Verificar la razonabilidad de un resultado es igualmente fundamental: antes de aceptar una respuesta, debemos preguntarnos si tiene sentido. Si calculamos cuántos autobuses se necesitan para llevar a 480 personas en autobuses de 40 asientos, la respuesta debe ser 12 (un número entero y razonable); si obtenemos 1,200, algo está mal. Si calculamos el precio por kilo y nos da $0.002, probablemente cometimos un error.",
  "La estimación también permite detectar errores en calculadoras o computadoras. Una máquina que da un resultado sin sentido no siempre avisa: depende del operador reconocer que algo falla.",
];

/** Recuadro de la lectura A1 — verbatim. */
export const RECUADRO_A1 =
  "El INEGI publica datos estadísticos abiertos en datos.gob.mx que permiten aplicar el Pensamiento Matemático a fenómenos reales: distribución del ingreso, crecimiento demográfico, mortalidad por enfermedades y tendencias educativas.";

/** Preguntas de comprensión de la lectura A1 — verbatim. */
export const PREGUNTAS: string[] = [
  "¿Cuál es la diferencia entre estimar y adivinar?",
  "Menciona dos estrategias de estimación.",
  "Si necesitas llevar 480 personas en autobuses de 40 asientos, ¿cuántos autobuses necesitas?",
];

/** Hechos: verdadero/falso A5, cada enunciado con su retroalimentación (verbatim). */
export const HECHOS: string[] = [
  "Verdadero: «Estimar es calcular rápidamente un valor aproximado». Correcto: se usa para tener una idea cercana del resultado.",
  "Verdadero: «La estimación sirve para detectar errores grandes en un cálculo». Correcto: si el resultado se aleja mucho de la estimación, algo falló.",
  "Falso: «Redondear 6.8 a la unidad más cercana da 6». 6.8 se redondea a 7 porque el decimal es ≥ 0.5.",
  "Falso: «Una estimación debe ser siempre exactamente igual al resultado real». Una estimación es aproximada, no exacta.",
];

/** Reflexión escrita A3 — verbatim. */
export const REFLEXION_A3 = {
  titulo: "¿Cuándo estimar es suficiente y cuándo necesito exactitud?",
  prompt:
    "Describe una situación de tu vida donde hayas tenido que estimar (calcular aproximadamente) sin papel ni calculadora. ¿Cómo lo hiciste? ¿Fue suficientemente preciso? Además, plantea una situación donde NO es suficiente estimar y se requiere exactitud. ¿Por qué en ese caso la estimación no basta?",
  pistas: [
    "¿Alguna vez calculaste mentalmente si te alcanzaba el dinero en una tienda?",
    "¿Has estimado el tiempo que tarda un trayecto?",
    "¿En qué situaciones el error de estimación podría tener consecuencias graves?",
  ],
};

/** Glosario del laboratorio (no hay glosario en la progresión: definiciones propias). */
export const GLOSARIO: { termino: string; definicion: string }[] = [
  { termino: "Estimación", definicion: "Valor aproximado que se obtiene razonando, sin hacer la cuenta exacta." },
  { termino: "Redondeo", definicion: "Sustituir un número por el múltiplo más cercano de la unidad elegida (decena, unidad, décima…); con 5 o más se sube." },
  { termino: "Truncamiento", definicion: "Cortar las cifras que sobran sin fijarse en las siguientes; el resultado siempre queda más cerca del cero." },
  { termino: "Cifras significativas", definicion: "Las cifras de un número que aportan información, contadas desde la primera distinta de cero." },
  { termino: "Orden de magnitud", definicion: "La potencia de 10 de un número escrito en notación científica: 9 209 944 ≈ 9.2 × 10⁶ es del orden de 10⁶." },
  { termino: "Problema de Fermi", definicion: "Pregunta que parece imposible de calcular y se resuelve descomponiéndola en factores que sí se pueden estimar." },
  { termino: "Razonabilidad", definicion: "Que un resultado tenga sentido al compararlo con una estimación o con la realidad." },
];

export const FUENTE =
  "CEN Bachillerato — Pensamiento Matemático I, progresión 10 (PM-I-P07): lectura A1 (Material elaborado para CEN Bachillerato), ejercicio A2, reflexión A3, quiz A4, verdadero/falso A5, completa el texto A6 y reto contrarreloj A9.";

export const PROBLEMA =
  "Una calculadora nunca te avisa cuando te equivocas de tecla. ¿Cómo saber si un resultado tiene sentido? En este laboratorio estimas cantidades enormes descomponiéndolas en factores, redondeas y truncas números viendo a dónde ruedan, y cazas resultados absurdos en facturas, recetas y dosis.";

export const INSTRUCCIONES: string[] = [
  "En Problemas de Fermi, elige una pregunta, estima cada factor con su deslizador y marca qué tan seguro estás. Cuando tengas tu estimación, revela el dato real.",
  "En Redondear y truncar, predice a qué valor llega el número y suelta la canica. Después estima productos eligiendo números redondos.",
  "En ¿Es razonable?, haz una estimación mental, dictamina si el resultado tiene sentido y, si no, di qué error se cometió.",
  "Juega «¿Qué orden de magnitud?» contra el reloj para ganar estrellas y resuelve el ejercicio A2, el quiz A4 y el texto A6.",
];

export const IDEAS: string[] = [
  "Estimar no es adivinar: es razonar con números redondos y referencias conocidas.",
  "Un problema enorme se vuelve manejable al descomponerlo en factores que sí puedes estimar.",
  "En un problema de Fermi, acertar el orden de magnitud (menos de un factor de 10) ya es un éxito.",
  "Redondear busca el múltiplo más cercano; truncar corta y siempre se acerca al cero.",
  "Redondear un factor hacia arriba y otro hacia abajo hace que los errores se compensen.",
  "Antes de aceptar un resultado, compáralo con tu estimación: los errores de coma, de unidades y de operación saltan a la vista.",
];

/** Quiz A4 «Estimación y razonabilidad — Quiz» — verbatim. */
export const QUIZ_A4: QuizEvaluable = {
  titulo: "Estimación y razonabilidad — Quiz",
  puntajeMinimo: 70,
  reactivos: [
    { enunciado: "Estimar 198 + 203 redondeando a centenas da aproximadamente:", opciones: ["300", "400", "500", "350"], respuestaCorrecta: 1, retroalimentacion: "≈ 200 + 200 = 400." },
    { enunciado: "Redondear 47 a la decena más cercana da:", opciones: ["40", "45", "50", "47"], respuestaCorrecta: 2, retroalimentacion: "47 está más cerca de 50 que de 40." },
    { enunciado: "Estimar antes de calcular sirve sobre todo para:", opciones: ["Obtener el resultado exacto", "Verificar si un resultado es razonable", "Evitar usar números", "Complicar el cálculo"], respuestaCorrecta: 1, retroalimentacion: "La estimación ayuda a detectar errores grandes." },
    { enunciado: "Si calculo 49 × 51 y obtengo 250, mi resultado es:", opciones: ["Razonable", "No razonable (debería ser ≈ 2500)", "Exacto", "Imposible de verificar"], respuestaCorrecta: 1, retroalimentacion: "49 × 51 ≈ 50 × 50 = 2500; 250 está muy lejos." },
  ],
};

/** Actividad A6 «Completa: estimación y redondeo» — verbatim. */
export const HUECOS_A6: TextoHuecosData = {
  ancla: "PM-I-P07-A6 · Completa: estimación y redondeo",
  instrucciones: "Completa con la palabra o número correcto.",
  partes: [
    "",
    " es calcular un valor aproximado de forma rápida. Sirve para verificar si un resultado es ",
    ". Al redondear 6.8 a la unidad obtenemos ",
    ". Al estimar 49 × 51 esperamos un resultado cercano a ",
    ".",
  ],
  huecos: [
    { respuesta: "estimar", alternativas: ["estimación", "estimacion"], pista: "Calcular un valor aproximado." },
    { respuesta: "razonable", alternativas: [], pista: "Que tiene sentido." },
    { respuesta: "7", alternativas: [], pista: "6.8 redondeado." },
    { respuesta: "2500", alternativas: [], pista: "≈ 50 × 50." },
  ],
};

/**
 * Ejercicio A2 «¿Es razonable este resultado?» — problema, pasos y respuesta
 * VERBATIM. Las casillas piden las estimaciones de los pasos guía (el
 * ejercicio es de desarrollo; los dictámenes se practican en el modo
 * «¿Es razonable?»). Se acepta la estimación redonda o la cuenta exacta.
 */
export const RETO_A2: RetoNumericoData = {
  titulo: "¿Es razonable este resultado?",
  contexto: "Verificación de razonabilidad de resultados usando estimación mental y sentido numérico.",
  problema:
    "a) Un estadio tiene 23 secciones de aproximadamente 480 asientos cada una. Se dice que caben 11,520 personas. ¿Es razonable?\n" +
    "b) Una tienda vendió 347 productos a $29.90 cada uno. La cajera dice que el total es $103,776.30. ¿Es razonable?\n" +
    "c) Si divides $1,800 entre 36 personas, cada una debería recibir $500. ¿Es razonable?\n" +
    "d) Necesitas 8 metros de tela para 4 trajes. Se afirma que para 7 trajes necesitarás 14 metros. ¿Es razonable?",
  campos: [
    { etiqueta: "a) Tu estimación de personas en el estadio", objetivo: 11300, tolerancia: 300, unidad: "personas", placeholder: "≈ ?" },
    { etiqueta: "b) Tu estimación del total de la tienda", objetivo: 10450, tolerancia: 200, unidad: "$", placeholder: "≈ ?" },
    { etiqueta: "c) Lo que recibe cada persona", objetivo: 50, tolerancia: 0, unidad: "$", placeholder: "?" },
    { etiqueta: "d) Metros de tela para 7 trajes", objetivo: 14, tolerancia: 0, unidad: "m", placeholder: "?" },
  ],
  pasosGuia: [
    "a) Estima: 23 × 500 ≈ 11,500. ¿Coincide con 11,520?",
    "b) Estima: 350 × 30 = 10,500. ¿Coincide con 103,776?",
    "c) Estima: 1,800 ÷ 36 = 50. ¿Coincide con 500?",
    "d) Estima: si 4 trajes necesitan 8 m, cada traje necesita 2 m. 7 × 2 = 14. ¿Coincide?",
  ],
  respuestaFinal: "a) Razonable (23 × 480 = 11,040 ≈ 11,520 con variación). b) NO razonable (350 × 30 ≈ 10,500, no 103,776). c) NO razonable (1,800 ÷ 36 = 50, no 500). d) Razonable (7 × 2 = 14 m).",
};
