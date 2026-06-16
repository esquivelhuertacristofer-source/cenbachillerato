/**
 * Datos y matemática pura del laboratorio "El dogma central de la biología
 * molecular" (CNEYT-VI-P04). SIN imports de three / @react-three (límite del
 * Worker de Cloudflare). Toda la biología (texto, glosario, código genético) es
 * VERBATIM del MCCEMS 2025 (lectura A1, glosario A5, quizzes A4/A2) o referencia
 * estándar (la tabla de codones es el código genético universal).
 */

import type { QuizEvaluable } from "./_reto-quiz";

export type Pt = [number, number, number];
export type Base = "A" | "T" | "G" | "C" | "U";
export type Modo = "replicacion" | "transcripcion" | "traduccion";

export interface ModoDef {
  id: Modo;
  etq: string;
  subtitulo: string;
  icono: string;
  color: string;
  fuente: "A1" | "A5" | "A4";
}
export const MODOS_DEF: Record<Modo, ModoDef> = {
  replicacion: {
    id: "replicacion",
    etq: "Replicación",
    subtitulo: "ADN → ADN (copia idéntica)",
    icono: "fa-clone",
    color: "#38bdf8",
    fuente: "A1",
  },
  transcripcion: {
    id: "transcripcion",
    etq: "Transcripción",
    subtitulo: "ADN → ARN mensajero",
    icono: "fa-pen-nib",
    color: "#a855f7",
    fuente: "A1",
  },
  traduccion: {
    id: "traduccion",
    etq: "Traducción",
    subtitulo: "ARNm → proteína",
    icono: "fa-cubes-stacked",
    color: "#34d399",
    fuente: "A1",
  },
};
export const MODOS: Modo[] = ["replicacion", "transcripcion", "traduccion"];

/* ── Colores de las bases nitrogenadas ───────────────────────────────── */
export const BASE_COLOR: Record<Base, string> = {
  A: "#34d399", // adenina  — verde
  T: "#f87171", // timina   — rojo
  U: "#fb923c", // uracilo  — naranja (reemplaza a T en el ARN)
  G: "#fbbf24", // guanina  — ámbar
  C: "#38bdf8", // citosina — azul
};
export const BASE_NOMBRE: Record<Base, string> = {
  A: "Adenina",
  T: "Timina",
  U: "Uracilo",
  G: "Guanina",
  C: "Citosina",
};
/** Puentes de hidrógeno entre el par: A-T = 2, G-C = 3 (verbatim A4). */
export const PUENTES: Record<string, number> = { AT: 2, TA: 2, GC: 3, CG: 3, AU: 2, UA: 2 };

/** Base complementaria en el ADN (A↔T, G↔C). */
export function complementoADN(b: Base): Base {
  switch (b) {
    case "A": return "T";
    case "T": return "A";
    case "G": return "C";
    case "C": return "G";
    default: return "A";
  }
}
/** Base del ARNm complementaria a la hebra molde de ADN (A→U, T→A, G→C, C→G). */
export function complementoARN(b: Base): Base {
  switch (b) {
    case "A": return "U";
    case "T": return "A";
    case "G": return "C";
    case "C": return "G";
    default: return "U";
  }
}

/* ── Código genético estándar (referencia universal) ─────────────────── */
export interface AminoDef {
  abr: string; // abreviatura de 3 letras
  letra: string; // código de 1 letra
  nombre: string;
  color: string;
}
const STOP: AminoDef = { abr: "Stop", letra: "*", nombre: "Codón de parada", color: "#64748b" };
// Agrupación codón→aminoácido. Construye CODON_TABLE de forma compacta y exacta.
const GRUPOS: { aa: AminoDef; codones: string[] }[] = [
  { aa: { abr: "Met", letra: "M", nombre: "Metionina (inicio)", color: "#34d399" }, codones: ["AUG"] },
  { aa: { abr: "Phe", letra: "F", nombre: "Fenilalanina", color: "#f59e0b" }, codones: ["UUU", "UUC"] },
  { aa: { abr: "Leu", letra: "L", nombre: "Leucina", color: "#f59e0b" }, codones: ["UUA", "UUG", "CUU", "CUC", "CUA", "CUG"] },
  { aa: { abr: "Ile", letra: "I", nombre: "Isoleucina", color: "#f59e0b" }, codones: ["AUU", "AUC", "AUA"] },
  { aa: { abr: "Val", letra: "V", nombre: "Valina", color: "#f59e0b" }, codones: ["GUU", "GUC", "GUA", "GUG"] },
  { aa: { abr: "Ser", letra: "S", nombre: "Serina", color: "#38bdf8" }, codones: ["UCU", "UCC", "UCA", "UCG", "AGU", "AGC"] },
  { aa: { abr: "Pro", letra: "P", nombre: "Prolina", color: "#38bdf8" }, codones: ["CCU", "CCC", "CCA", "CCG"] },
  { aa: { abr: "Thr", letra: "T", nombre: "Treonina", color: "#38bdf8" }, codones: ["ACU", "ACC", "ACA", "ACG"] },
  { aa: { abr: "Ala", letra: "A", nombre: "Alanina", color: "#38bdf8" }, codones: ["GCU", "GCC", "GCA", "GCG"] },
  { aa: { abr: "Tyr", letra: "Y", nombre: "Tirosina", color: "#a855f7" }, codones: ["UAU", "UAC"] },
  { aa: { abr: "His", letra: "H", nombre: "Histidina", color: "#60a5fa" }, codones: ["CAU", "CAC"] },
  { aa: { abr: "Gln", letra: "Q", nombre: "Glutamina", color: "#60a5fa" }, codones: ["CAA", "CAG"] },
  { aa: { abr: "Asn", letra: "N", nombre: "Asparagina", color: "#60a5fa" }, codones: ["AAU", "AAC"] },
  { aa: { abr: "Lys", letra: "K", nombre: "Lisina", color: "#f472b6" }, codones: ["AAA", "AAG"] },
  { aa: { abr: "Asp", letra: "D", nombre: "Ácido aspártico", color: "#fb7185" }, codones: ["GAU", "GAC"] },
  { aa: { abr: "Glu", letra: "E", nombre: "Ácido glutámico", color: "#fb7185" }, codones: ["GAA", "GAG"] },
  { aa: { abr: "Cys", letra: "C", nombre: "Cisteína", color: "#facc15" }, codones: ["UGU", "UGC"] },
  { aa: { abr: "Trp", letra: "W", nombre: "Triptófano", color: "#facc15" }, codones: ["UGG"] },
  { aa: { abr: "Arg", letra: "R", nombre: "Arginina", color: "#f472b6" }, codones: ["CGU", "CGC", "CGA", "CGG", "AGA", "AGG"] },
  { aa: { abr: "Gly", letra: "G", nombre: "Glicina", color: "#a3e635" }, codones: ["GGU", "GGC", "GGA", "GGG"] },
  { aa: STOP, codones: ["UAA", "UAG", "UGA"] },
];
export const CODON_TABLE: Record<string, AminoDef> = (() => {
  const t: Record<string, AminoDef> = {};
  for (const g of GRUPOS) for (const c of g.codones) t[c] = g.aa;
  return t;
})();
export const CODON_INICIO = "AUG";
export const CODONES_PARO = ["UAA", "UAG", "UGA"];
export function aminoDeCodon(codon: string): AminoDef {
  return CODON_TABLE[codon] ?? STOP;
}

/* ── Secuencias de trabajo (cadena codificante 5'→3' del ADN) ─────────── */
export interface SecuenciaDef {
  id: string;
  etq: string;
  icono: string;
  /** Cadena codificante (sentido) del ADN, 5'→3'. El ARNm tiene la misma
   *  secuencia con U en vez de T; la hebra molde es su complementaria. */
  codificante: string;
  nota: string;
}
export const SECUENCIAS: SecuenciaDef[] = [
  {
    id: "glosario",
    etq: "Ejemplo del glosario",
    icono: "fa-book",
    codificante: "ATGCCC",
    nota: "Verbatim A5: molde 3'-TACGGG-5' → ARNm 5'-AUGCCC-3' (Met-Pro).",
  },
  {
    id: "inicio-paro",
    etq: "Inicio y paro",
    icono: "fa-flag-checkered",
    codificante: "ATGTTTTAA",
    nota: "AUG (inicio, Met) · UUU (Phe) · UAA (paro). Muestra el marco de lectura completo.",
  },
  {
    id: "peptido",
    etq: "Péptido corto",
    icono: "fa-link",
    codificante: "ATGGCAAAGGGTTGTTAA",
    nota: "Met-Ala-Lis-Gli-Cis-paro: cinco aminoácidos antes del codón de parada.",
  },
];
export function secuenciaPorId(id: string): SecuenciaDef {
  return SECUENCIAS.find((s) => s.id === id) ?? SECUENCIAS[0]!;
}

/** Limpia/valida una secuencia escrita por el usuario (solo A,T,G,C). */
export function limpiarADN(s: string): string {
  return s.toUpperCase().replace(/[^ATGC]/g, "").slice(0, 30);
}
/**
 * Hebra molde a partir de la codificante: su complemento base a base (A↔T, G↔C).
 * NO se invierte el orden: la molde se muestra alineada DEBAJO de la codificante
 * (que va 5'→3'), de modo que cada base queda bajo su pareja y la molde se lee
 * 3'→5'. P. ej. codificante 5'-ATGCCC-3' → molde 3'-TACGGG-5' (verbatim del A5).
 */
export function hebraMolde(codificante: string): string {
  return codificante
    .split("")
    .map((b) => complementoADN(b as Base))
    .join("");
}
/** ARNm a partir de la cadena codificante (T→U). */
export function transcribir(codificante: string): string {
  return codificante.replace(/T/g, "U");
}

export interface CodonInfo {
  codon: string;
  amino: AminoDef;
  inicio: boolean;
  paro: boolean;
  i: number; // índice del codón en el péptido
}
/** Traduce un ARNm desde el primer AUG hasta el primer codón de parado. */
export function traducir(arnm: string): CodonInfo[] {
  const out: CodonInfo[] = [];
  const start = arnm.indexOf(CODON_INICIO);
  if (start < 0) return out;
  let i = 0;
  for (let p = start; p + 3 <= arnm.length; p += 3) {
    const codon = arnm.slice(p, p + 3);
    const amino = aminoDeCodon(codon);
    const paro = CODONES_PARO.includes(codon);
    out.push({ codon, amino, inicio: p === start, paro, i: i++ });
    if (paro) break;
  }
  return out;
}

/* ── Geometría de la doble hélice (math pura; el scene crea los Vector3) ── */
export const HELICE_RADIO = 1.35;
export const HELICE_PASO = 0.62; // separación vertical entre pares de bases
export const HELICE_VUELTA = 10; // pares de bases por vuelta completa
/** Ángulo (rad) y altura de cada par de bases del par i (centrado en 0). */
export function paresHelice(n: number): { ang: number; y: number }[] {
  const out: { ang: number; y: number }[] = [];
  const y0 = -((n - 1) * HELICE_PASO) / 2;
  for (let i = 0; i < n; i++) {
    out.push({ ang: (i / HELICE_VUELTA) * Math.PI * 2, y: y0 + i * HELICE_PASO });
  }
  return out;
}

/* ── Enzimas / maquinaria (verbatim A1 + A5) ─────────────────────────── */
export interface EnzimaDef {
  nombre: string;
  icono: string;
  modos: Modo[];
  funcion: string;
}
export const ENZIMAS: EnzimaDef[] = [
  { nombre: "Helicasa", icono: "fa-scissors", modos: ["replicacion"], funcion: "Separa las dos hebras de la doble hélice «como si abriera un cierre»." },
  { nombre: "ADN polimerasa", icono: "fa-pen-fancy", modos: ["replicacion"], funcion: "Lee cada hebra molde y sintetiza una hebra nueva complementaria (5'→3')." },
  { nombre: "Ligasa", icono: "fa-link", modos: ["replicacion"], funcion: "Une los fragmentos del ADN recién sintetizado." },
  { nombre: "ARN polimerasa", icono: "fa-pen-nib", modos: ["transcripcion"], funcion: "Lee la hebra molde del ADN y sintetiza el ARN mensajero complementario." },
  { nombre: "Ribosoma", icono: "fa-cubes-stacked", modos: ["traduccion"], funcion: "Lee el ARNm codón a codón y cataliza la formación del enlace peptídico." },
  { nombre: "ARN de transferencia (ARNt)", icono: "fa-truck-ramp-box", modos: ["traduccion"], funcion: "Adaptador: reconoce el codón con su anticodón y transporta el aminoácido al ribosoma." },
];
export function enzimasDe(m: Modo): EnzimaDef[] {
  return ENZIMAS.filter((e) => e.modos.includes(m));
}

/* ── Texto verbatim ──────────────────────────────────────────────────── */
export const PROBLEMA =
  "Visualiza el dogma central de la biología molecular en 3D: la información genética fluye en una sola dirección, del ADN al ARN a la proteína. Escribe tu propia secuencia de ADN o usa un ejemplo y observa cómo se replica, se transcribe a ARN mensajero y se traduce, codón a codón, en una proteína.";

export const DEFINICION_DOGMA =
  "Flujo de información genética propuesto por Francis Crick (1958): ADN → ARN → Proteína. La replicación reproduce el ADN; la transcripción produce ARN; la traducción produce proteínas. Los retrovirus (VIH) añaden transcripción inversa: ARN → ADN.";

export const CALLOUT_VIRUS =
  "El descubrimiento de los virus ARN, como el VIH y el SARS-CoV-2, demostró que el dogma central tiene excepciones. Estos virus usan una enzima llamada transcriptasa inversa para copiar su ARN en ADN, lo que invierte temporalmente la dirección del flujo de información. Esta excepción no niega el dogma central, pero lo amplía.";

export const INSTRUCCIONES: string[] = [
  "Elige un proceso: replicación, transcripción o traducción.",
  "Usa una secuencia de ejemplo o escribe la tuya (solo A, T, G, C).",
  "Pulsa reproducir o avanza paso a paso para ver el proceso base a base.",
  "En la replicación, comprueba el apareamiento A-T (2 puentes H) y G-C (3 puentes H).",
  "En la transcripción, observa que la timina (T) se reemplaza por uracilo (U) en el ARN.",
  "En la traducción, sigue los codones desde AUG (inicio) hasta el codón de parada.",
];

export const PREGUNTAS: string[] = [
  "¿Cuáles son los tres procesos del dogma central de la biología molecular y en qué orden ocurren?",
  "¿Qué es un codón y cuál es la función del ARNt en la traducción?",
  "¿Qué es el splicing y por qué es necesario en células eucariontes?",
];

export const IDEAS: string[] = [
  "La información genética fluye en una dirección: ADN → ARN → proteína (dogma central de Crick, 1958).",
  "La doble hélice del ADN tiene dos cadenas antiparalelas: una corre 5'→3' y la otra 3'→5'.",
  "Las bases se aparean por complementariedad: A con T (2 puentes de hidrógeno) y G con C (3 puentes).",
  "La replicación es semiconservativa: cada molécula hija conserva una cadena parental (Meselson-Stahl, 1958).",
  "En la transcripción la timina (T) del ADN se sustituye por uracilo (U) en el ARN.",
  "El código genético es de tripletes: 64 codones codifican 20 aminoácidos (es degenerado) más 3 codones de parada.",
  "El codón AUG (metionina) es el inicio universal; UAA, UAG y UGA son señales de parada.",
  "El genoma humano contiene unos 20,000 genes que codifican proteínas en ~3,000 millones de pares de bases.",
];

export interface GlosarioItem {
  termino: string;
  definicion: string;
  ejemplo: string;
}
export const GLOSARIO: GlosarioItem[] = [
  {
    termino: "Estructura de la doble hélice del ADN",
    definicion:
      "El ADN es un polímero de desoxirribonucleótidos formado por dos cadenas antiparalelas enrolladas en hélice. Las bases nitrogenadas (A, T, G, C) se complementan: A-T (2 H) y G-C (3 H). El esqueleto exterior es de fosfato-desoxirribosa.",
    ejemplo: "Si una cadena tiene la secuencia 5'-AATGCC-3', la cadena complementaria antiparalela es 3'-TTACGG-5'.",
  },
  {
    termino: "Replicación del ADN (semiconservativa)",
    definicion:
      "Proceso por el cual el ADN se duplica antes de la división celular. La ADN helicasa separa las cadenas; la ADN polimerasa III sintetiza la nueva cadena en dirección 5'→3' usando cada cadena como molde. Resultado: dos moléculas hijas idénticas, cada una con una cadena parental.",
    ejemplo: "La replicación ocurre en múltiples orígenes simultáneamente en eucariotas (horquillas de replicación) para copiar los ~3000 millones de pares de bases del genoma humano.",
  },
  {
    termino: "Transcripción",
    definicion:
      "Síntesis de ARNm a partir del ADN. La ARN polimerasa se une al promotor, separa el ADN y sintetiza el ARNm complementario en dirección 5'→3'. En eucariotas ocurre en el núcleo; el ARNm se procesa (capuchón 5', cola poli-A, eliminación de intrones) antes de salir al citoplasma.",
    ejemplo: "Si el molde de ADN es 3'-TACGGG-5', el ARNm transcrito será 5'-AUGCCC-3'.",
  },
  {
    termino: "Código genético y codones",
    definicion:
      "Lenguaje de tripletes de bases del ARNm que codifican aminoácidos. 64 codones posibles (4³) codifican 20 aminoácidos más 3 codones de parada. Es universal (mismo en casi todos los seres vivos), degenerado (varios codones por aminoácido) y sin solapamiento.",
    ejemplo: "AUG = metionina (inicio). UUU y UUC = fenilalanina. UAA, UAG, UGA = codones de parada (no codifican aminoácido).",
  },
  {
    termino: "Traducción",
    definicion:
      "Síntesis de proteínas en el ribosoma usando el ARNm como molde. Los ARNt (con anticodón complementario al codón) llevan aminoácidos específicos. El ribosoma cataliza la formación de enlaces peptídicos. Termina al encontrar un codón de parada.",
    ejemplo: "En la síntesis de insulina, el ARNm del gen de insulina es traducido en el RE rugoso: el ribosoma lee codón a codón y une aminoácidos formando la cadena polipeptídica.",
  },
  {
    termino: "Dogma central de la biología molecular",
    definicion:
      "Flujo de información genética propuesto por Francis Crick (1958): ADN → ARN → Proteína. La replicación reproduce el ADN; la transcripción produce ARN; la traducción produce proteínas. Los retrovirus (VIH) añaden transcripción inversa: ARN → ADN.",
    ejemplo: "El dogma central explica cómo un gen (secuencia de ADN) dirige la síntesis de una proteína específica con función biológica determinada.",
  },
];

export const CONTEXTO =
  "El INMEGEN (Instituto Nacional de Medicina Genómica) en México investiga las variantes genéticas específicas de la población mexicana para desarrollar medicamentos y diagnósticos más precisos, aplicando directamente el conocimiento del dogma central.";

export const FUENTE =
  "CEN Bachillerato — UAC Ciencias Naturales, Experimentales y Tecnología VI. Ref: dogma central (Crick, 1958); modelo de doble hélice (Watson-Crick-Franklin, 1953); replicación semiconservativa (Meselson-Stahl, 1958).";

export interface DatoCard {
  valor: string;
  texto: string;
  icono: string;
}
export const DATOS: DatoCard[] = [
  { valor: "~20,000", texto: "genes que codifican proteínas en el genoma humano.", icono: "fa-dna" },
  { valor: "~3,000 M", texto: "pares de bases tiene el genoma humano completo.", icono: "fa-ruler" },
  { valor: "64 codones", texto: "codifican 20 aminoácidos (código degenerado) + 3 de parada.", icono: "fa-table-cells" },
  { valor: "1953 · 1958", texto: "doble hélice (Watson-Crick-Franklin) y dogma central (Crick).", icono: "fa-calendar" },
];

/** Hechos verbatim de los quizzes A2/A4 para tarjetas de «¿sabías que?». */
export const HECHOS: string[] = [
  "En la doble hélice, A se empareja con T por 2 puentes de hidrógeno y G con C por 3 (Watson y Crick, 1953, con los datos de rayos X de Rosalind Franklin).",
  "Las dos cadenas son antiparalelas: una corre 5'→3' y la otra 3'→5'.",
  "La replicación es semiconservativa: cada hija conserva una cadena parental (Meselson-Stahl, 1958).",
  "El ARNr forma parte del ribosoma y cataliza la formación del enlace peptídico.",
];

/* ── Reto evaluable (parte B) ─────────────────────────────────────────────
 * VERBATIM del quiz A2 «Verdadero o Falso: ADN, ARN y proteínas»
 * (tipo quiz_verdadero_falso, puntaje mínimo de aprobación 70).
 * Cada reactivo V/F se mapea a opciones ["Verdadero","Falso"]:
 *   respuestaCorrecta = respuesta ? 0 (Verdadero) : 1 (Falso).
 */
export const QUIZ_A2: QuizEvaluable = {
  titulo: "Verdadero o Falso: ADN, ARN y proteínas",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "El ADN se replica de forma semiconservativa: cada cadena original sirve de molde para una nueva cadena.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "La afirmación es Verdadero. Si tu respuesta fue distinta, revisa el concepto clave mencionado en el enunciado dentro del texto de la progresión para confirmar el razonamiento correcto.",
    },
    {
      enunciado: "La transcripción produce una molécula de ADN a partir de una de ARN.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 1,
      retroalimentacion: "La afirmación es Falso. Si tu respuesta fue distinta, revisa el concepto clave mencionado en el enunciado dentro del texto de la progresión para confirmar el razonamiento correcto.",
    },
    {
      enunciado: "El ARN mensajero (ARNm) lleva la información genética del núcleo al ribosoma para la traducción.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "La afirmación es Verdadero. Si tu respuesta fue distinta, revisa el concepto clave mencionado en el enunciado dentro del texto de la progresión para confirmar el razonamiento correcto.",
    },
    {
      enunciado: "El codón AUG codifica metionina y es el codón de inicio de la traducción.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "La afirmación es Verdadero. Si tu respuesta fue distinta, revisa el concepto clave mencionado en el enunciado dentro del texto de la progresión para confirmar el razonamiento correcto.",
    },
    {
      enunciado: "Una mutación puntual silenciosa siempre cambia el aminoácido de la proteína resultante.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 1,
      retroalimentacion: "La afirmación es Falso. Si tu respuesta fue distinta, revisa el concepto clave mencionado en el enunciado dentro del texto de la progresión para confirmar el razonamiento correcto.",
    },
    {
      enunciado: "El ARN ribosómico (ARNr) forma parte de la estructura del ribosoma y cataliza la formación del enlace peptídico.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "La afirmación es Verdadero. Si tu respuesta fue distinta, revisa el concepto clave mencionado en el enunciado dentro del texto de la progresión para confirmar el razonamiento correcto.",
    },
  ],
};
