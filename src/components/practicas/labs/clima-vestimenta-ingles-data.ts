/**
 * Datos y modelo del laboratorio "People, clothes and weather: la plaza de la
 * colonia" (IN-I-P06, progresión 6 de Inglés I: «Describe personas, vestimenta
 * y clima en contextos cotidianos, respetando la diversidad»).
 *
 * Anclas VERBATIM (IN-I-P06):
 *   - A1 lectura «People, clothes and weather — Describir en inglés»: marco
 *     teórico y panel «Lectura A1» con sus preguntas de comprensión.
 *   - A4 quiz de opción múltiple: reto evaluable.
 *   - A2 fill_blanks «What does she look like?»: «Completa el texto».
 *   - A5 verdadero/falso: hechos. A6 glosario. A3 escritura: pistas del modo
 *     «Who is it?» (Tu turno).
 * Inspiración (IN-II-P04): la infografía A1 (orden del adjetivo, have/has,
 * Present Continuous para la ropa de ahora, weather frente a climate, evitar
 * estereotipos) y sus cuatro oraciones modelo de clima en México, que dan pie a
 * los pronósticos del modo «Dress for the weather».
 *
 * Lo que NO es verbatim: las seis personas de la parada y su colonia son
 * FICTICIAS; las temperaturas de los pronósticos son valores típicos
 * ILUSTRATIVOS de cada ciudad y temporada, no mediciones de un día real; los
 * rangos hot / warm / cool / cold son una convención del laboratorio (el
 * inglés no fija grados exactos). Todas las oraciones en inglés están en inglés
 * estadounidense estándar.
 *
 * Datos puros (sin three ni React).
 */

import type { QuizEvaluable } from "./_reto-quiz";
import type { TextoHuecosData } from "./_mecanica-huecos";

/* ── Modos ────────────────────────────────────────────────────────────── */

export type Modo = "clima" | "vestir" | "quien";
export const MODOS: Modo[] = ["clima", "vestir", "quien"];

export const MODOS_DEF: Record<Modo, { etq: string; subtitulo: string; icono: string; color: string }> = {
  clima: { etq: "What's the weather like?", subtitulo: "Cambia el cielo de la plaza y repórtalo en inglés", icono: "fa-cloud-sun-rain", color: "#38bdf8" },
  vestir: { etq: "Dress for the weather", subtitulo: "Lee el pronóstico y viste a la persona", icono: "fa-shirt", color: "#fbbf24" },
  quien: { etq: "Who is it?", subtitulo: "Encuentra a la persona y descríbela sin juzgar", icono: "fa-people-group", color: "#f472b6" },
};

export function mulberry32(semilla: number) {
  let t = semilla >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function baraja<T>(xs: readonly T[], rnd: () => number): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function estrellasPorErrores(errores: number): number {
  return errores === 0 ? 3 : errores <= 2 ? 2 : 1;
}

/** °C → °F (F = C · 9/5 + 32), redondeado al entero. */
export function aFahrenheit(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

export function signo(c: number): string {
  return c < 0 ? `−${Math.abs(c)}` : String(c);
}

/**
 * Minúsculas, apóstrofos rectos, contracciones expandidas y compuestos
 * unidos, para poder buscar palabras sin importar cómo las teclee el alumno.
 */
export function tokens(texto: string): string[] {
  const s = ` ${texto.normalize("NFD").replace(/\p{Mn}/gu, "").toLowerCase()} `
    .replace(/[’‘`´]/g, "'")
    .replace(/[.!?;]+/g, " _ ")
    .replace(/\bit's\b/g, "it is")
    .replace(/\bits\b/g, "it is")
    .replace(/\bshe's\b/g, "she is")
    .replace(/\bhe's\b/g, "he is")
    .replace(/\bthey're\b/g, "they are")
    .replace(/\bisn't\b/g, "is not")
    .replace(/\bt[\s-]?shirt(s?)\b/g, "tshirt$1")
    .replace(/\bheavy[\s-]set\b/g, "heavyset")
    .replace(/\bmedium[\s-]height\b/g, "mediumheight")
    .replace(/\brain\s?coat\b/g, "raincoat")
    .replace(/\bsun\s?glasses\b/g, "sunglasses")
    .replace(/\bwheel\s?chair\b/g, "wheelchair")
    .replace(/\bgrey\b/g, "gray")
    .replace(/\bblond\b/g, "blonde");
  // "_" marca el fin de una oración: evita leer "hair. Long…" como "hair long".
  return s.split(/[^a-z_]+/).filter(Boolean);
}

/* ════════════════════════════════════════════════════════════════════════
 * 1. WHAT'S THE WEATHER LIKE?
 * ════════════════════════════════════════════════════════════════════════ */

export type Condicion = "sunny" | "cloudy" | "rainy" | "windy" | "foggy" | "snowing";
export const CONDICIONES: Condicion[] = ["sunny", "cloudy", "rainy", "windy", "foggy", "snowing"];

export const CONDICION_DEF: Record<
  Condicion,
  {
    /** Cómo se dice (A1): "It is sunny." */
    frase: string;
    /** Palabras que la nombran. */
    palabras: string[];
    es: string;
    icono: string;
    /** Otras palabras de cielo que también son ciertas con este clima. */
    tambien: Condicion[];
    pista: string;
  }
> = {
  sunny: { frase: "It is sunny", palabras: ["sunny"], es: "soleado", icono: "fa-sun", tambien: [], pista: "Hay sol y el cielo está despejado." },
  cloudy: { frase: "It is cloudy", palabras: ["cloudy", "overcast"], es: "nublado", icono: "fa-cloud", tambien: [], pista: "Las nubes tapan el sol, pero no cae nada." },
  rainy: { frase: "It is raining", palabras: ["rainy", "raining"], es: "lluvioso / está lloviendo", icono: "fa-cloud-showers-heavy", tambien: ["cloudy"], pista: "Cae agua del cielo y hay charcos." },
  windy: { frase: "It is windy", palabras: ["windy"], es: "ventoso / hace viento", icono: "fa-wind", tambien: ["cloudy", "sunny"], pista: "Los árboles y el papel picado se mueven con fuerza." },
  foggy: { frase: "It is foggy", palabras: ["foggy", "misty"], es: "con niebla", icono: "fa-smog", tambien: [], pista: "Una neblina blanca no deja ver lejos." },
  snowing: { frase: "It is snowing", palabras: ["snowing", "snowy"], es: "está nevando", icono: "fa-snowflake", tambien: ["cloudy"], pista: "Caen copos blancos y el suelo se cubre." },
};

export type PalabraTemp = "cold" | "cool" | "warm" | "hot";
export const TEMP_DEF: Record<PalabraTemp, { es: string; rango: string; col: string }> = {
  cold: { es: "frío", rango: "10 °C o menos", col: "#7dd3fc" },
  cool: { es: "fresco", rango: "11 a 19 °C", col: "#a5f3fc" },
  warm: { es: "templado / cálido", rango: "20 a 29 °C", col: "#fcd34d" },
  hot: { es: "caluroso", rango: "30 °C o más", col: "#fb923c" },
};

/** Convención del laboratorio para elegir el adjetivo según los grados. */
export function palabraTemp(c: number): PalabraTemp {
  if (c <= 10) return "cold";
  if (c <= 19) return "cool";
  if (c <= 29) return "warm";
  return "hot";
}

export const T_MIN = -5;
export const T_MAX = 40;
/** La nieve solo cae con el aire cerca o por debajo de 0 °C. */
export const T_MAX_NIEVE = 2;

/** Oración modelo que describe la plaza: "It is raining and it is warm. It is 24 °C." */
export function fraseClima(cond: Condicion, c: number): string {
  const d = CONDICION_DEF[cond];
  return `${d.frase} and it is ${palabraTemp(c)}. It is ${signo(c)} °C.`;
}

export interface Reporte {
  condicion: Condicion;
  tempC: number;
}

/**
 * Reporte al azar para el reto del reportero. Las temperaturas se sortean
 * lejos de las fronteras entre adjetivos (nada de 19 o 20 °C), para que la
 * respuesta no dependa de un grado.
 */
export function nuevoReporte(rnd: () => number, previo?: Reporte): Reporte {
  const franjas: Record<PalabraTemp, [number, number]> = { cold: [0, 7], cool: [14, 17], warm: [22, 27], hot: [32, 38] };
  for (let intento = 0; intento < 20; intento++) {
    const condicion = CONDICIONES[Math.floor(rnd() * CONDICIONES.length)]!;
    const opciones: PalabraTemp[] = condicion === "snowing" ? ["cold"] : condicion === "foggy" ? ["cold", "cool"] : ["cold", "cool", "warm", "hot"];
    const pt = opciones[Math.floor(rnd() * opciones.length)]!;
    const [a, b] = franjas[pt];
    const tempC = condicion === "snowing" ? -Math.floor(rnd() * 4) : a + Math.floor(rnd() * (b - a + 1));
    if (!previo || previo.condicion !== condicion) return { condicion, tempC };
  }
  return { condicion: "sunny", tempC: 25 };
}

export interface Aviso {
  tipo: "error" | "consejo";
  texto: string;
}

export interface ResultadoClima {
  ok: boolean;
  avisos: Aviso[];
  condicionesDichas: Condicion[];
  tempDicha: PalabraTemp | null;
}

const ESPANOL = ["soleado", "nublado", "lluvioso", "lluvia", "llueve", "frio", "calor", "caliente", "ventoso", "viento", "niebla", "nevando", "nieve", "hace", "esta", "templado", "fresco"];
const SUSTANTIVOS: Record<string, string> = { rain: "rainy o raining", sun: "sunny", cloud: "cloudy", clouds: "cloudy", wind: "windy", fog: "foggy", snow: "snowing", heat: "hot" };

/** Revisa la oración que escribe el alumno para el clima de la plaza. */
export function revisarClima(texto: string, rep: Reporte): ResultadoClima {
  const tk = tokens(texto).filter((t) => t !== "_");
  const avisos: Aviso[] = [];
  const res = (ok: boolean): ResultadoClima => ({ ok, avisos, condicionesDichas: dichas, tempDicha });
  const dichas: Condicion[] = [];
  let tempDicha: PalabraTemp | null = null;
  if (tk.length === 0) return { ok: false, avisos: [{ tipo: "error", texto: "Escribe una oración en inglés, por ejemplo: It is sunny and hot." }], condicionesDichas: [], tempDicha: null };

  if (tk.some((t) => ESPANOL.includes(t))) avisos.push({ tipo: "error", texto: "Hay palabras en español. Escribe la oración en inglés: It is … and it is …" });

  // "It is not sunny" no afirma que haya sol.
  for (const c of CONDICIONES) if (tk.some((t, i) => CONDICION_DEF[c].palabras.includes(t) && tk[i - 1] !== "not")) dichas.push(c);
  const temps: PalabraTemp[] = [];
  tk.forEach((t, i) => {
    if (tk[i - 1] === "not") return;
    if (t === "cold" || t === "freezing") temps.push("cold");
    if (t === "cool") temps.push("cool");
    if (t === "warm") temps.push("warm");
    if (t === "hot") temps.push("hot");
  });
  tempDicha = temps[0] ?? null;

  // Sustantivo en lugar de adjetivo: "It is rain".
  tk.forEach((t, i) => {
    const sust = SUSTANTIVOS[t];
    if (sust && tk[i - 1] === "is") avisos.push({ tipo: "error", texto: `«is ${t}» no funciona: ${t} es sustantivo. Para describir el clima usa el adjetivo: It is ${sust.split(" o ")[0]}${t === "rain" ? " (o It is raining)" : t === "snow" ? " (it is snowing)" : ""}.` });
  });

  // Estructura: sujeto "it" (o "the weather") + is.
  const palabraClima = tk.findIndex((t) => CONDICIONES.some((c) => CONDICION_DEF[c].palabras.includes(t)) || ["cold", "cool", "warm", "hot", "freezing"].includes(t));
  if (palabraClima >= 0) {
    const tieneIt = tk.includes("it") || tk.includes("weather");
    const tieneIs = tk.includes("is");
    if (!tieneIt && tieneIs) avisos.push({ tipo: "error", texto: "Falta el sujeto. En inglés el clima siempre lleva «it»: It is sunny (no «Is sunny»)." });
    else if (!tieneIt) avisos.push({ tipo: "error", texto: "Escribe una oración completa, no solo el adjetivo: It is cloudy and cool." });
    else if (!tieneIs && !tk.includes("was")) avisos.push({ tipo: "error", texto: "Falta el verbo to be: It is sunny (no «It sunny»)." });
  }

  if (avisos.some((a) => a.tipo === "error")) return res(false);

  const verdad = [rep.condicion, ...CONDICION_DEF[rep.condicion].tambien];
  const falsas = dichas.filter((c) => !verdad.includes(c));
  falsas.forEach((c) => avisos.push({ tipo: "error", texto: `${CONDICION_DEF[c].palabras[0]} = ${CONDICION_DEF[c].es}, pero no es lo que muestra la plaza. Mira el cielo otra vez.` }));
  if (!dichas.includes(rep.condicion)) {
    if (dichas.length > 0 && falsas.length === 0) avisos.push({ tipo: "error", texto: `Lo que dijiste es cierto, pero falta lo principal del cielo. Pista: ${CONDICION_DEF[rep.condicion].pista}` });
    else if (dichas.length === 0) avisos.push({ tipo: "error", texto: `Falta decir cómo está el cielo (sunny, cloudy, rainy, windy, foggy o snowing). Pista: ${CONDICION_DEF[rep.condicion].pista}` });
  }
  const correcta = palabraTemp(rep.tempC);
  if (temps.length === 0) avisos.push({ tipo: "error", texto: `Falta la temperatura: el termómetro marca ${signo(rep.tempC)} °C. ¿Es cold, cool, warm o hot?` });
  else if (temps.some((t) => t !== correcta)) {
    const mal = temps.find((t) => t !== correcta)!;
    avisos.push({ tipo: "error", texto: `Hay ${signo(rep.tempC)} °C: con esa temperatura no se dice ${mal} (${TEMP_DEF[mal].es}). Revisa la escala: ${TEMP_DEF[correcta].rango} es ${correcta}.` });
  }
  if (tk.includes("freezing") && rep.tempC > 2) avisos.push({ tipo: "error", texto: "freezing = helado, bajo cero; aquí no hace tanto frío." });

  const ok = !avisos.some((a) => a.tipo === "error");
  if (ok && rep.condicion === "rainy" && tk.includes("rainy")) avisos.push({ tipo: "consejo", texto: "Correcto. También puedes decir «It is raining»: el Present Continuous describe lo que pasa en este momento." });
  if (ok && /\bits\b/i.test(texto)) avisos.push({ tipo: "consejo", texto: "Ojo con el apóstrofo: «it's» = it is; «its» sin apóstrofo es un posesivo." });
  return res(ok);
}

/* ════════════════════════════════════════════════════════════════════════
 * Personas (ficticias) y prendas
 * ════════════════════════════════════════════════════════════════════════ */

export type PrendaId =
  | "tshirt"
  | "sweater"
  | "jacket"
  | "coat"
  | "raincoat"
  | "shorts"
  | "jeans"
  | "pants"
  | "skirt"
  | "sandals"
  | "sneakers"
  | "boots"
  | "umbrella"
  | "scarf"
  | "cap"
  | "sunglasses"
  | "gloves";

export type Ranura = "top" | "bottom" | "shoes" | "extra";

export const PRENDA_DEF: Record<PrendaId, { en: string; es: string; ranura: Ranura; plural: boolean; /** Se "lleva puesta" (wear); el paraguas se carga (carry). */ seViste: boolean; icono: string; col: string }> = {
  tshirt: { en: "T-shirt", es: "playera", ranura: "top", plural: false, seViste: true, icono: "fa-shirt", col: "#f8fafc" },
  sweater: { en: "sweater", es: "suéter", ranura: "top", plural: false, seViste: true, icono: "fa-vest", col: "#8b5cf6" },
  jacket: { en: "jacket", es: "chamarra", ranura: "top", plural: false, seViste: true, icono: "fa-vest-patches", col: "#2563eb" },
  coat: { en: "coat", es: "abrigo", ranura: "top", plural: false, seViste: true, icono: "fa-user-tie", col: "#78350f" },
  raincoat: { en: "raincoat", es: "impermeable", ranura: "top", plural: false, seViste: true, icono: "fa-person-shelter", col: "#facc15" },
  shorts: { en: "shorts", es: "shorts", ranura: "bottom", plural: true, seViste: true, icono: "fa-person-swimming", col: "#0ea5e9" },
  jeans: { en: "jeans", es: "pantalón de mezclilla", ranura: "bottom", plural: true, seViste: true, icono: "fa-person-walking", col: "#1d4ed8" },
  pants: { en: "pants", es: "pantalón", ranura: "bottom", plural: true, seViste: true, icono: "fa-person-walking", col: "#374151" },
  skirt: { en: "skirt", es: "falda", ranura: "bottom", plural: false, seViste: true, icono: "fa-person-dress", col: "#6b7280" },
  sandals: { en: "sandals", es: "sandalias", ranura: "shoes", plural: true, seViste: true, icono: "fa-shoe-prints", col: "#a16207" },
  sneakers: { en: "sneakers", es: "tenis", ranura: "shoes", plural: true, seViste: true, icono: "fa-shoe-prints", col: "#f1f5f9" },
  boots: { en: "boots", es: "botas", ranura: "shoes", plural: true, seViste: true, icono: "fa-socks", col: "#111827" },
  umbrella: { en: "umbrella", es: "paraguas", ranura: "extra", plural: false, seViste: false, icono: "fa-umbrella", col: "#e11d48" },
  scarf: { en: "scarf", es: "bufanda", ranura: "extra", plural: false, seViste: true, icono: "fa-scroll", col: "#dc2626" },
  cap: { en: "cap", es: "gorra", ranura: "extra", plural: false, seViste: true, icono: "fa-hat-cowboy-side", col: "#16a34a" },
  sunglasses: { en: "sunglasses", es: "lentes de sol", ranura: "extra", plural: true, seViste: true, icono: "fa-glasses", col: "#111827" },
  gloves: { en: "gloves", es: "guantes", ranura: "extra", plural: true, seViste: true, icono: "fa-mitten", col: "#7c3aed" },
};

export type ColorRopa = "yellow" | "blue" | "green" | "red" | "purple" | "gray" | "black" | "white" | "brown" | "orange" | "pink";
export const COLOR_HEX: Record<ColorRopa, string> = {
  yellow: "#facc15",
  blue: "#2563eb",
  green: "#16a34a",
  red: "#dc2626",
  purple: "#7c3aed",
  gray: "#6b7280",
  black: "#1f2937",
  white: "#f1f5f9",
  brown: "#78350f",
  orange: "#ea580c",
  pink: "#ec4899",
};
export const COLORES_ES: Record<ColorRopa, string> = { yellow: "amarillo", blue: "azul", green: "verde", red: "rojo", purple: "morado", gray: "gris", black: "negro", white: "blanco", brown: "café", orange: "naranja", pink: "rosa" };

export interface Pieza {
  id: PrendaId;
  color: ColorRopa;
}

export type Altura = "tall" | "medium" | "short";
export type Complexion = "slim" | "heavyset";
export type Largo = "long" | "short";
export type TipoPelo = "straight" | "curly" | "wavy";
export type ColorPelo = "black" | "brown" | "blonde" | "gray";

export interface Persona {
  id: string;
  nombre: string;
  pron: "she" | "he";
  /** null: la persona está sentada en su silla de ruedas y su estatura no se ve. */
  altura: Altura | null;
  complexion: Complexion;
  largo: Largo;
  tipo: TipoPelo;
  colorPelo: ColorPelo;
  piel: string;
  lentes: boolean;
  barba: boolean;
  silla: boolean;
  ropa: Pieza[];
}

export const ALTURA_ES: Record<Altura, string> = { tall: "alta", medium: "de estatura mediana", short: "baja" };
export const PELO_HEX: Record<ColorPelo, string> = { black: "#17110d", brown: "#5b3a1e", blonde: "#d8b25a", gray: "#b9bcc2" };

/** Las seis personas de la parada (ficticias). */
export const PERSONAS: Persona[] = [
  {
    id: "carmen",
    nombre: "Carmen",
    pron: "she",
    altura: "tall",
    complexion: "slim",
    largo: "long",
    tipo: "curly",
    colorPelo: "black",
    piel: "#a86b45",
    lentes: false,
    barba: false,
    silla: false,
    ropa: [
      { id: "raincoat", color: "yellow" },
      { id: "jeans", color: "blue" },
      { id: "boots", color: "black" },
    ],
  },
  {
    id: "guadalupe",
    nombre: "Guadalupe",
    pron: "she",
    altura: "short",
    complexion: "heavyset",
    largo: "short",
    tipo: "curly",
    colorPelo: "gray",
    piel: "#d6a47c",
    lentes: true,
    barba: false,
    silla: false,
    ropa: [
      { id: "sweater", color: "purple" },
      { id: "skirt", color: "gray" },
      { id: "sneakers", color: "black" },
    ],
  },
  {
    id: "diego",
    nombre: "Diego",
    pron: "he",
    altura: null,
    complexion: "slim",
    largo: "short",
    tipo: "straight",
    colorPelo: "black",
    piel: "#6b4128",
    lentes: false,
    barba: true,
    silla: true,
    ropa: [
      { id: "jacket", color: "green" },
      { id: "pants", color: "black" },
      { id: "sneakers", color: "white" },
    ],
  },
  {
    id: "sofia",
    nombre: "Sofía",
    pron: "she",
    altura: "medium",
    complexion: "slim",
    largo: "short",
    tipo: "wavy",
    colorPelo: "brown",
    piel: "#eac3a0",
    lentes: false,
    barba: false,
    silla: false,
    ropa: [
      { id: "sweater", color: "yellow" },
      { id: "jeans", color: "blue" },
      { id: "sneakers", color: "white" },
    ],
  },
  {
    id: "mateo",
    nombre: "Mateo",
    pron: "he",
    altura: "medium",
    complexion: "heavyset",
    largo: "short",
    tipo: "straight",
    colorPelo: "brown",
    piel: "#c68a5c",
    lentes: true,
    barba: false,
    silla: false,
    ropa: [
      { id: "cap", color: "red" },
      { id: "jacket", color: "red" },
      { id: "pants", color: "gray" },
      { id: "sneakers", color: "black" },
    ],
  },
  {
    id: "ernesto",
    nombre: "Ernesto",
    pron: "he",
    altura: "tall",
    complexion: "slim",
    largo: "short",
    tipo: "wavy",
    colorPelo: "gray",
    piel: "#8d5a3b",
    lentes: false,
    barba: true,
    silla: false,
    ropa: [
      { id: "coat", color: "blue" },
      { id: "scarf", color: "green" },
      { id: "pants", color: "black" },
      { id: "boots", color: "brown" },
    ],
  },
];

export function persona(id: string): Persona {
  return PERSONAS.find((p) => p.id === id) ?? PERSONAS[0]!;
}

/** "long curly black hair" */
export function peloEn(p: Persona): string {
  return `${p.largo} ${p.tipo} ${p.colorPelo} hair`;
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. DRESS FOR THE WEATHER
 * ════════════════════════════════════════════════════════════════════════ */

export interface Pronostico {
  id: string;
  lugar: string;
  cuando: string;
  /** Pronóstico en inglés que el alumno lee. */
  texto: string;
  condicion: Condicion;
  tempC: number;
  /** Adjetivos válidos para cerrar la oración «because it is …». */
  adjetivos: string[];
  /** Adjetivo distractor en la oración con fichas. */
  distractor: string;
  personaId: string;
  categoria: "frio" | "lluvia" | "calor";
}

export const PRONOSTICOS: Pronostico[] = [
  { id: "toluca", lugar: "Toluca, Estado de México", cuando: "una mañana de enero", texto: "Good morning, Toluca! It is cold and foggy this morning. It is 3 °C.", condicion: "foggy", tempC: 3, adjetivos: ["cold", "foggy"], distractor: "sunny", personaId: "guadalupe", categoria: "frio" },
  { id: "tuxtla", lugar: "Tuxtla Gutiérrez, Chiapas", cuando: "una tarde de junio", texto: "It is rainy in Chiapas today. It is raining all afternoon, but it is warm: 24 °C.", condicion: "rainy", tempC: 24, adjetivos: ["rainy", "raining"], distractor: "snowing", personaId: "diego", categoria: "lluvia" },
  { id: "hermosillo", lugar: "Hermosillo, Sonora", cuando: "un mediodía de julio", texto: "It is very hot and sunny in Hermosillo today. It is 40 °C.", condicion: "sunny", tempC: 40, adjetivos: ["hot", "sunny"], distractor: "cold", personaId: "carmen", categoria: "calor" },
  { id: "cdmx", lugar: "Ciudad de México", cuando: "una tarde de agosto", texto: "It is cloudy in Mexico City and it is raining. It is cool: 17 °C.", condicion: "rainy", tempC: 17, adjetivos: ["rainy", "raining", "cool"], distractor: "hot", personaId: "mateo", categoria: "lluvia" },
  { id: "cancun", lugar: "Cancún, Quintana Roo", cuando: "una mañana de mayo", texto: "It is sunny in Cancún today. It is hot: 31 °C.", condicion: "sunny", tempC: 31, adjetivos: ["hot", "sunny"], distractor: "foggy", personaId: "ernesto", categoria: "calor" },
  { id: "chihuahua", lugar: "Chihuahua, Chihuahua", cuando: "una noche de enero con nevada", texto: "It is snowing in Chihuahua tonight! It is very cold: −3 °C.", condicion: "snowing", tempC: -3, adjetivos: ["cold", "snowing"], distractor: "warm", personaId: "sofia", categoria: "frio" },
];

export const OPCIONES_RANURA: Record<Exclude<Ranura, "extra">, PrendaId[]> & { extra: PrendaId[] } = {
  top: ["tshirt", "sweater", "jacket", "coat", "raincoat"],
  bottom: ["shorts", "jeans"],
  shoes: ["sandals", "sneakers", "boots"],
  extra: ["umbrella", "scarf", "cap", "sunglasses", "gloves"],
};

export interface Atuendo {
  top: PrendaId | null;
  bottom: PrendaId | null;
  shoes: PrendaId | null;
  extras: PrendaId[];
}

export const ATUENDO_VACIO: Atuendo = { top: null, bottom: null, shoes: null, extras: [] };

export type Estado = "bien" | "neutral" | "mal";
export type Problema = "frio" | "calor" | "mojado" | null;

export interface JuicioPrenda {
  id: PrendaId;
  estado: Estado;
  razon: string;
  problema: Problema;
}

export interface ResultadoAtuendo {
  ok: boolean;
  completo: boolean;
  prendas: JuicioPrenda[];
  faltan: { texto: string; problema: Problema }[];
  /** El problema principal, para que la escena lo muestre. */
  problema: Problema;
}

type Termico = "frio" | "fresco" | "templado" | "calor";
export function termico(c: number): Termico {
  if (c <= 10) return "frio";
  if (c <= 19) return "fresco";
  if (c <= 29) return "templado";
  return "calor";
}

function juzgar(id: PrendaId, f: Pronostico): Omit<JuicioPrenda, "id"> {
  const t = termico(f.tempC);
  const lluvia = f.condicion === "rainy" || f.condicion === "snowing";
  const sol = f.condicion === "sunny";
  const g = `${signo(f.tempC)} °C`;
  const B = (razon: string): Omit<JuicioPrenda, "id"> => ({ estado: "bien", razon, problema: null });
  const N = (razon: string): Omit<JuicioPrenda, "id"> => ({ estado: "neutral", razon, problema: null });
  const M = (razon: string, problema: Problema): Omit<JuicioPrenda, "id"> => ({ estado: "mal", razon, problema });
  switch (id) {
    case "tshirt":
      if (t === "frio") return M(`A ${g} una playera sola no abriga: hace falta un suéter, una chamarra o un abrigo.`, "frio");
      if (t === "fresco") return N(`A ${g} una playera puede quedarse corta; una chamarra abriga más.`);
      return B(`A ${g} una playera es fresca y cómoda.`);
    case "sweater":
      if (t === "calor") return M(`A ${g} un suéter da demasiado calor.`, "calor");
      if (t === "templado") return N(`A ${g} un suéter puede sobrar.`);
      return B(`Un suéter abriga a ${g}.`);
    case "jacket":
      if (t === "calor") return M(`A ${g} una chamarra da demasiado calor.`, "calor");
      if (t === "templado") return N(`A ${g} una chamarra ligera puede servir, pero no es necesaria.`);
      return B(`Una chamarra abriga a ${g}.`);
    case "coat":
      if (t === "calor" || t === "templado") return M(`Un abrigo es para el frío; a ${g} sobra y hace sudar.`, "calor");
      if (t === "fresco") return N(`A ${g} un abrigo quizá es demasiado; una chamarra basta.`);
      return B(`Un abrigo largo es lo más caliente para ${g}.`);
    case "raincoat":
      if (lluvia) return B("El impermeable no deja pasar el agua.");
      if (t === "frio") return M(`Un impermeable no abriga: a ${g} hace falta ropa gruesa.`, "frio");
      if (t === "calor") return M(`El impermeable no transpira: con ${g} y sin lluvia da mucho calor.`, "calor");
      return N("No está lloviendo: el impermeable no hace falta.");
    case "shorts":
      if (t === "frio") return M(`Con shorts, las piernas se enfrían a ${g}.`, "frio");
      if (t === "fresco") return N(`A ${g} los shorts pueden dar frío.`);
      return B(`A ${g} los shorts son frescos.`);
    case "jeans":
      if (t === "calor") return N(`A ${g} la mezclilla es calurosa; unos shorts son más frescos.`);
      return B(`Los jeans sirven para ${g}.`);
    case "sandals":
      if (f.condicion === "snowing") return M("Con sandalias en la nieve, los pies se mojan y se congelan.", "frio");
      if (lluvia) return M("Con sandalias y lluvia, los pies se mojan.", "mojado");
      if (t === "frio") return M(`A ${g} las sandalias dejan los pies fríos.`, "frio");
      if (t === "fresco") return N(`A ${g} las sandalias pueden dar frío.`);
      return B("Las sandalias son frescas con calor.");
    case "sneakers":
      if (lluvia) return N("Los tenis se mojan con la lluvia; unas botas protegen mejor.");
      return B("Los tenis sirven casi con cualquier clima.");
    case "boots":
      if (lluvia) return B("Las botas mantienen los pies secos.");
      if (t === "frio") return B(`Las botas abrigan los pies a ${g}.`);
      if (t === "calor") return M(`A ${g} las botas hacen sudar los pies.`, "calor");
      return N("Las botas no hacen falta con este clima.");
    case "umbrella":
      if (f.condicion === "rainy") return B("El paraguas te protege de la lluvia.");
      if (f.condicion === "snowing") return N("Un paraguas detiene algo de nieve, pero lo importante es abrigarse.");
      if (sol && t === "calor") return N("Un paraguas puede dar sombra, pero no es lo principal.");
      return N("No llueve: el paraguas no hace falta.");
    case "scarf":
      if (t === "calor" || t === "templado") return M(`A ${g} la bufanda da calor.`, "calor");
      if (t === "fresco") return N(`A ${g} la bufanda es opcional.`);
      return B("La bufanda protege el cuello del frío.");
    case "gloves":
      if (t === "calor" || t === "templado") return M(`A ${g} los guantes sobran.`, "calor");
      if (t === "fresco") return N("Los guantes son opcionales con este clima.");
      return B("Los guantes protegen las manos del frío.");
    case "cap":
      if (sol) return B("La gorra da sombra a la cara con este sol.");
      return N("Sin sol fuerte, la gorra es opcional.");
    case "sunglasses":
      if (sol) return B("Los lentes de sol protegen los ojos de la luz intensa.");
      return N("Sin sol, los lentes de sol no hacen falta.");
    default:
      return N("");
  }
}

export function evaluarAtuendo(a: Atuendo, f: Pronostico): ResultadoAtuendo {
  const elegidas = [a.top, a.bottom, a.shoes, ...a.extras].filter((x): x is PrendaId => x !== null);
  const prendas = elegidas.map((id) => ({ id, ...juzgar(id, f) }));
  const faltan: ResultadoAtuendo["faltan"] = [];
  const t = termico(f.tempC);
  const completo = a.top !== null && a.bottom !== null && a.shoes !== null;
  if (!completo) faltan.push({ texto: "Elige una prenda de arriba, una de abajo y calzado.", problema: null });
  if (t === "frio" && a.top !== null && !["sweater", "jacket", "coat"].includes(a.top)) faltan.push({ texto: `Con ${signo(f.tempC)} °C hace falta abrigo arriba: sweater, jacket o coat.`, problema: "frio" });
  if (f.condicion === "rainy" && !a.extras.includes("umbrella") && a.top !== "raincoat") faltan.push({ texto: "Está lloviendo: hace falta un paraguas (umbrella) o un impermeable (raincoat).", problema: "mojado" });
  if (f.condicion === "sunny" && t === "calor" && !a.extras.includes("cap") && !a.extras.includes("sunglasses")) faltan.push({ texto: "Con sol intenso hace falta protegerse: una gorra (cap) o lentes de sol (sunglasses).", problema: "calor" });
  const mal = prendas.filter((p) => p.estado === "mal");
  const problema: Problema = mal[0]?.problema ?? faltan.find((x) => x.problema)?.problema ?? null;
  return { ok: completo && faltan.length === 0 && mal.length === 0, completo, prendas, faltan, problema };
}

/* ── Oración con fichas: "She is wearing a coat and boots because it is cold." ── */

export interface Ficha {
  k: string;
  w: string;
}

function frasePrenda(id: PrendaId): string[] {
  const d = PRENDA_DEF[id];
  return d.plural ? [d.en] : ["a", d.en];
}

/** La segunda prenda de la oración: un complemento que se viste, o el calzado. */
export function segundaPrenda(a: Atuendo): PrendaId | null {
  const extra = a.extras.find((x) => PRENDA_DEF[x].seViste && x !== "sunglasses") ?? a.extras.find((x) => PRENDA_DEF[x].seViste);
  return extra ?? a.shoes;
}

export function oracionObjetivo(a: Atuendo, f: Pronostico): string[][] {
  const p = persona(f.personaId);
  const pron = p.pron === "she" ? "She" : "He";
  const uno = a.top;
  const dos = segundaPrenda(a);
  if (!uno || !dos) return [];
  const variantes: string[][] = [];
  for (const [x, y] of [
    [uno, dos],
    [dos, uno],
  ] as const) {
    for (const adj of f.adjetivos) variantes.push([pron, "is", "wearing", ...frasePrenda(x), "and", ...frasePrenda(y), "because", "it", "is", adj]);
  }
  return variantes;
}

export function fichasOracion(a: Atuendo, f: Pronostico): Ficha[] {
  const v = oracionObjetivo(a, f)[0];
  if (!v) return [];
  const extra = ["has", "wear", "an", f.distractor];
  if (!v.includes("a")) extra.push("a");
  const palabras = [...v, ...extra];
  const rnd = mulberry32(palabras.join(" ").length * 31 + f.id.length * 7 + (a.extras.length + 1) * 13);
  return baraja(
    palabras.map((w, i) => ({ k: `${i}-${w}`, w })),
    rnd,
  );
}

export function revisarOracion(palabras: string[], a: Atuendo, f: Pronostico): Aviso[] {
  const variantes = oracionObjetivo(a, f);
  const s = palabras.join(" ");
  if (variantes.some((v) => v.join(" ") === s)) return [];
  const av: Aviso[] = [];
  if (palabras.includes("has")) av.push({ tipo: "error", texto: "«has» describe rasgos (She has curly hair). Para la ropa que lleva ahora se usa el Present Continuous: is wearing." });
  if (palabras.includes("wear")) av.push({ tipo: "error", texto: "Con she/he en Present Continuous el verbo lleva -ing: is wearing (no «is wear» ni «she wear»)." });
  if (palabras.includes("an")) av.push({ tipo: "error", texto: "«an» va antes de un sonido vocal (an umbrella). Ninguna de estas prendas empieza con vocal: usa «a»." });
  const dos = segundaPrenda(a);
  const plurales = [a.top, dos].filter((x): x is PrendaId => !!x && PRENDA_DEF[x].plural);
  plurales.forEach((id) => {
    const i = palabras.indexOf(PRENDA_DEF[id].en);
    if (i > 0 && palabras[i - 1] === "a") av.push({ tipo: "error", texto: `«${PRENDA_DEF[id].en}» es plural: va sin «a» (She is wearing ${PRENDA_DEF[id].en}).` });
  });
  if (palabras.includes(f.distractor)) av.push({ tipo: "error", texto: `El pronóstico no dice «${f.distractor}». Vuelve a leerlo: ${f.texto}` });
  [a.top, dos].forEach((id) => {
    if (!id || PRENDA_DEF[id].plural) return;
    const i = palabras.indexOf(PRENDA_DEF[id].en);
    if (i > 0 && palabras[i - 1] !== "a" && palabras[i - 1] !== "an") av.push({ tipo: "error", texto: `«${PRENDA_DEF[id].en}» es singular: lleva «a» delante (a ${PRENDA_DEF[id].en}).` });
  });
  if (!palabras.includes("because")) av.push({ tipo: "error", texto: "Falta «because» (porque) para dar la razón." });
  if (palabras.length > 0 && palabras[0] !== "She" && palabras[0] !== "He") av.push({ tipo: "error", texto: "La oración empieza con el sujeto: She / He." });
  if (av.length === 0) av.push({ tipo: "error", texto: "Revisa el orden: sujeto + is wearing + prendas + because it is + clima." });
  return av;
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. WHO IS IT?
 * ════════════════════════════════════════════════════════════════════════ */

export type Rasgo =
  | { k: "altura"; v: Altura }
  | { k: "complexion"; v: Complexion }
  | { k: "largo"; v: Largo }
  | { k: "tipo"; v: TipoPelo }
  | { k: "colorPelo"; v: ColorPelo | "dark" }
  | { k: "lentes" }
  | { k: "barba" }
  | { k: "silla" }
  | { k: "ojos"; v: string }
  | { k: "prenda"; v: PrendaId | "shirt" | "hat" | "shoes" | "dress"; color: ColorRopa | null };

const ALTURAS: Record<string, Altura> = { tall: "tall", mediumheight: "medium", short: "short" };
const TIPOS: TipoPelo[] = ["straight", "curly", "wavy"];
const COLORES_PELO: Record<string, ColorPelo | "dark"> = { black: "black", brown: "brown", blonde: "blonde", gray: "gray", dark: "dark" };
const COLORES_ROPA: ColorRopa[] = ["yellow", "blue", "green", "red", "purple", "gray", "black", "white", "brown", "orange", "pink"];
const PRENDAS_TXT: Record<string, Extract<Rasgo, { k: "prenda" }>["v"]> = {
  tshirt: "tshirt",
  shirt: "shirt",
  sweater: "sweater",
  jacket: "jacket",
  coat: "coat",
  raincoat: "raincoat",
  shorts: "shorts",
  jeans: "jeans",
  pants: "pants",
  trousers: "pants",
  skirt: "skirt",
  dress: "dress",
  sandals: "sandals",
  sneakers: "sneakers",
  boots: "boots",
  shoes: "shoes",
  umbrella: "umbrella",
  scarf: "scarf",
  cap: "cap",
  hat: "hat",
  sunglasses: "sunglasses",
  gloves: "gloves",
};
const PLURALES = ["shorts", "jeans", "pants", "trousers", "sandals", "sneakers", "boots", "shoes", "sunglasses", "gloves", "glasses"];
const ADJ_PELO = ["long", "short", "straight", "curly", "wavy", "black", "brown", "blonde", "gray", "dark", "light"];

/** Palabras que juzgan en vez de describir, con la alternativa respetuosa. */
export const JUICIOS: { palabras: string[]; grave: boolean; texto: string }[] = [
  { palabras: ["fat", "chubby"], grave: true, texto: "«fat» suena a juicio sobre el cuerpo. Para describir la complexión usa un término neutro: heavy-set." },
  { palabras: ["skinny"], grave: true, texto: "«skinny» puede sonar despectivo. Usa slim." },
  { palabras: ["ugly", "weird", "strange", "funny", "horrible", "ridiculous", "messy", "dirty", "cheap", "boring", "bad", "awful"], grave: true, texto: "Esa palabra es una opinión negativa, no algo que se observa. Describe lo que ves: estatura, cabello, ropa." },
  { palabras: ["crippled", "handicapped", "invalid", "bound", "confined"], grave: true, texto: "Ese lenguaje presenta la discapacidad como encierro o defecto. Lo respetuoso y preciso es: he uses a wheelchair." },
  { palabras: ["pretty", "beautiful", "handsome", "cute", "nice", "lovely"], grave: false, texto: "Es una opinión (aunque sea positiva). En una descripción objetiva basta con lo que se ve; si la usas, que no reemplace los rasgos." },
  { palabras: ["old"], grave: false, texto: "«old» puede sonar brusco al hablar de una persona. Es más amable decir «older»." },
];

export interface Analisis {
  rasgos: Rasgo[];
  gramatica: Aviso[];
  juicios: { texto: string; grave: boolean }[];
  pronombres: ("she" | "he" | "they")[];
}


export function analizarDescripcion(texto: string): Analisis {
  const tk = tokens(texto);
  const rasgos: Rasgo[] = [];
  const gramatica: Aviso[] = [];
  const addG = (t: string) => {
    if (!gramatica.some((g) => g.texto === t)) gramatica.push({ tipo: "error", texto: t });
  };
  const juicios: Analisis["juicios"] = [];
  const pronombres: Analisis["pronombres"] = [];
  const sujetos = ["she", "he", ...PERSONAS.map((p) => tokens(p.nombre)[0]!)];
  tk.forEach((t) => {
    if ((t === "she" || t === "he" || t === "they") && !pronombres.includes(t)) pronombres.push(t);
    if (t === "her" && !pronombres.includes("she")) pronombres.push("she");
    if (t === "his" && !pronombres.includes("he")) pronombres.push("he");
  });

  // Cabello: adjetivos antes de "hair" o después de "hair is".
  const enPelo = new Set<number>();
  tk.forEach((t, i) => {
    if (t !== "hair") return;
    const adjs: string[] = [];
    let j = i - 1;
    while (j >= 0 && (ADJ_PELO.includes(tk[j]!) || tk[j] === "and")) {
      if (tk[j] !== "and") adjs.push(tk[j]!);
      enPelo.add(j);
      j--;
    }
    let k = i + 1;
    if (tk[k] === "is") {
      k++;
      while (k < tk.length && (ADJ_PELO.includes(tk[k]!) || tk[k] === "and" || tk[k] === "very")) {
        if (ADJ_PELO.includes(tk[k]!)) adjs.push(tk[k]!);
        enPelo.add(k);
        k++;
      }
    } else if (k < tk.length && ADJ_PELO.includes(tk[k]!) && tk[k + 1] !== "hair") {
      addG("En inglés el adjetivo va ANTES del sustantivo: curly hair (no «hair curly»).");
      while (k < tk.length && (ADJ_PELO.includes(tk[k]!) || tk[k] === "and")) {
        if (ADJ_PELO.includes(tk[k]!)) adjs.push(tk[k]!);
        enPelo.add(k);
        k++;
      }
    }
    adjs.forEach((a) => {
      if (a === "long" || a === "short") rasgos.push({ k: "largo", v: a });
      else if ((TIPOS as string[]).includes(a)) rasgos.push({ k: "tipo", v: a as TipoPelo });
      else if (COLORES_PELO[a]) rasgos.push({ k: "colorPelo", v: COLORES_PELO[a]! });
    });
    // "She is long hair": el cabello se "tiene".
    const antes = tk[j];
    if (antes === "is" || antes === "are") addG("El cabello se «tiene»: She has long hair (no «She is long hair»).");
  });

  tk.forEach((t, i) => {
    if (enPelo.has(i)) return;
    const sig = tk[i + 1];
    if (ALTURAS[t]) rasgos.push({ k: "altura", v: ALTURAS[t]! });
    if (t === "slim" || t === "thin") rasgos.push({ k: "complexion", v: "slim" });
    if (t === "heavyset") rasgos.push({ k: "complexion", v: "heavyset" });
    if (t === "glasses") rasgos.push({ k: "lentes" });
    if (t === "beard") rasgos.push({ k: "barba" });
    if (t === "wheelchair") rasgos.push({ k: "silla" });
    if (t === "eyes" && i > 0) rasgos.push({ k: "ojos", v: tk[i - 1]! });
    const prenda = PRENDAS_TXT[t];
    if (prenda) {
      let color: ColorRopa | null = null;
      for (let j = i - 1; j >= Math.max(0, i - 3); j--) {
        const c = tk[j]!;
        if ((COLORES_ROPA as string[]).includes(c)) {
          color = c as ColorRopa;
          break;
        }
        if (!["a", "an", "light", "dark", "and", "long", "big", "small", "new"].includes(c)) break;
      }
      rasgos.push({ k: "prenda", v: prenda, color });
      // Plurales sin artículo.
      const prev = tk[i - 1];
      const prev2 = tk[i - 2];
      const art = prev === "a" || prev === "an" ? prev : (COLORES_ROPA as string[]).includes(prev ?? "") && (prev2 === "a" || prev2 === "an") ? prev2 : null;
      if (PLURALES.includes(t) && art) addG(`«${t}» es plural en inglés: va sin «a» (She is wearing ${t}).`);
      if (t === "umbrella" && (tk[i - 2] === "wearing" || tk[i - 3] === "wearing")) addG("Un paraguas no se «wear»: se carga. Di «She is carrying an umbrella» o «She has an umbrella».");
    }
    // Gramática de sujeto + verbo.
    if (sujetos.includes(t)) {
      if (sig === "have") addG("Con she / he el verbo have cambia a has: She has curly hair.");
      if (sig === "are") addG("Con she / he se usa is, no are: He is tall.");
      if (sig === "wearing") addG("Falta el verbo to be: She is wearing (no «She wearing»).");
      if (sig === "wear") addG("Con she / he: «She is wearing» (ahora) o «She wears» (costumbre), no «She wear».");
      if (sig === "tall" || sig === "slim" || sig === "heavyset") addG(`Falta el verbo to be: ${t === "she" ? "She" : t === "he" ? "He" : "…"} is ${sig}.`);
    }
    if (t === "they" && sig === "has") addG("Con they se usa have: They have short hair.");
    if (t === "they" && sig === "is") addG("Con they se usa are: They are wearing…");
    if (t === "is" && (sig === "have" || sig === "has")) addG("No se juntan «is» y «has»: She has long hair (no «She is have long hair»).");
    if (t === "has" && (sig === "tall" || sig === "slim" || sig === "heavyset" || sig === "thin")) addG(`La estatura y la complexión se describen con to be: She is ${sig} (no «has ${sig}»).`);
    if (t === "has" && sig === "wearing") addG("Para la ropa: «is wearing», no «has wearing».");
    // a / an según el sonido de la palabra siguiente.
    if ((t === "a" || t === "an") && sig && sig !== "_") {
      const vocal = /^[aeiou]/.test(sig) && !/^(uni|use|usu)/.test(sig);
      if (t === "a" && vocal) addG(`Antes de sonido vocal se usa «an»: an ${sig} (no «a ${sig}»).`);
      if (t === "an" && !vocal) addG(`«an» solo va antes de un sonido vocal (an umbrella, an orange T-shirt): a ${sig}.`);
    }
  });

  // Juicios de valor.
  JUICIOS.forEach((j) => {
    const hay = tk.some((t, i) => {
      if (!j.palabras.includes(t)) return false;
      if (t === "bound") return tk.includes("wheelchair");
      if (t === "old") return tk[i - 1] !== "years" && tk[i - 1] !== "year";
      return true;
    });
    if (hay) juicios.push({ texto: j.texto, grave: j.grave });
  });

  return { rasgos, gramatica, juicios, pronombres };
}

function tienePrenda(p: Persona, v: Extract<Rasgo, { k: "prenda" }>["v"]): Pieza | null {
  const equivalentes: PrendaId[] =
    v === "shirt" ? ["tshirt"] : v === "hat" ? ["cap"] : v === "shoes" ? ["sneakers", "boots", "sandals"] : v === "pants" ? ["pants", "jeans"] : v === "dress" ? [] : [v];
  return p.ropa.find((r) => equivalentes.includes(r.id)) ?? null;
}

export interface Contraste {
  estado: "bien" | "mal" | "nose";
  texto: string;
}

/** Compara un rasgo con una persona: ¿es cierto, falso o no se puede ver? */
export function contrastar(r: Rasgo, p: Persona): Contraste {
  const n = p.nombre;
  switch (r.k) {
    case "altura":
      if (p.silla) return { estado: "nose", texto: `${n} está sentado en su silla de ruedas: su estatura no se aprecia.` };
      return r.v === p.altura ? { estado: "bien", texto: r.v === "medium" ? "medium height" : r.v } : { estado: "mal", texto: `${n} no es ${r.v === "medium" ? "medium height" : r.v}: es ${p.altura === "medium" ? "medium height" : p.altura} (${ALTURA_ES[p.altura!]}).` };
    case "complexion":
      return r.v === p.complexion ? { estado: "bien", texto: r.v === "heavyset" ? "heavy-set" : "slim" } : { estado: "mal", texto: `${n} es ${p.complexion === "heavyset" ? "heavy-set" : "slim"}, no ${r.v === "heavyset" ? "heavy-set" : "slim"}.` };
    case "largo":
      return r.v === p.largo ? { estado: "bien", texto: `${r.v} hair` } : { estado: "mal", texto: `${n} tiene el cabello ${p.largo === "long" ? "largo (long)" : "corto (short)"}, no ${r.v}.` };
    case "tipo":
      return r.v === p.tipo ? { estado: "bien", texto: `${r.v} hair` } : { estado: "mal", texto: `El cabello de ${n} es ${p.tipo} (${p.tipo === "curly" ? "rizado" : p.tipo === "wavy" ? "ondulado" : "lacio"}), no ${r.v}.` };
    case "colorPelo":
      if (r.v === "dark") return p.colorPelo === "black" || p.colorPelo === "brown" ? { estado: "bien", texto: "dark hair" } : { estado: "mal", texto: `El cabello de ${n} es ${p.colorPelo}, no oscuro.` };
      return r.v === p.colorPelo ? { estado: "bien", texto: `${r.v} hair` } : { estado: "mal", texto: `El cabello de ${n} es ${p.colorPelo}, no ${r.v}.` };
    case "lentes":
      return p.lentes ? { estado: "bien", texto: "glasses" } : { estado: "mal", texto: `${n} no usa lentes (glasses).` };
    case "barba":
      return p.barba ? { estado: "bien", texto: "a beard" } : { estado: "mal", texto: `${n} no tiene barba (beard).` };
    case "silla":
      return p.silla ? { estado: "bien", texto: "uses a wheelchair" } : { estado: "mal", texto: `${n} no usa silla de ruedas.` };
    case "ojos":
      return { estado: "nose", texto: "El color de ojos no se distingue desde la parada; no cuenta ni a favor ni en contra." };
    case "prenda": {
      const nombre = r.v === "shirt" ? "shirt" : r.v === "hat" ? "hat" : r.v === "shoes" ? "shoes" : r.v === "dress" ? "dress" : PRENDA_DEF[r.v].en;
      const pieza = tienePrenda(p, r.v);
      if (!pieza) return { estado: "mal", texto: `${n} no lleva ${nombre}. Lleva ${ropaEn(p)}.` };
      if (r.color && r.color !== pieza.color) return { estado: "mal", texto: `${n} sí lleva ${nombre}, pero es ${pieza.color} (${COLORES_ES[pieza.color]}), no ${r.color}.` };
      return { estado: "bien", texto: `${r.color ? `${r.color} ` : ""}${nombre}` };
    }
  }
}

export function ropaEn(p: Persona): string {
  const partes = p.ropa.map((r) => `${PRENDA_DEF[r.id].plural ? "" : "a "}${r.color} ${PRENDA_DEF[r.id].en}`);
  return partes.length > 1 ? `${partes.slice(0, -1).join(", ")} and ${partes[partes.length - 1]}` : (partes[0] ?? "");
}

export interface ResultadoDescripcion {
  ok: boolean;
  bien: string[];
  mal: string[];
  nose: string[];
  gramatica: Aviso[];
  juicios: { texto: string; grave: boolean }[];
  faltan: string[];
}

export function evaluarDescripcion(texto: string, p: Persona): ResultadoDescripcion {
  const a = analizarDescripcion(texto);
  const bien: string[] = [];
  const mal: string[] = [];
  const nose: string[] = [];
  a.rasgos.forEach((r) => {
    const c = contrastar(r, p);
    const lista = c.estado === "bien" ? bien : c.estado === "mal" ? mal : nose;
    if (!lista.includes(c.texto)) lista.push(c.texto);
  });
  const gramatica = [...a.gramatica];
  const otro = p.pron === "she" ? "he" : "she";
  if (a.pronombres.includes(otro) && !a.pronombres.includes(p.pron)) gramatica.push({ tipo: "error", texto: `${p.nombre} usa el pronombre «${p.pron}». Escribe ${p.pron === "she" ? "She is… / She has…" : "He is… / He has…"}` });
  const faltan: string[] = [];
  const hayPelo = a.rasgos.some((r) => r.k === "largo" || r.k === "tipo" || r.k === "colorPelo");
  const hayRopa = a.rasgos.some((r) => r.k === "prenda");
  if (!hayPelo) faltan.push("Describe su cabello: She/He has [largo] [tipo] [color] hair.");
  if (!hayRopa) faltan.push("Describe su ropa: She/He is wearing a [color] [prenda].");
  if (bien.length < 3) faltan.push(`Menciona al menos tres rasgos correctos (llevas ${bien.length}).`);
  if (hayRopa && !tokens(texto).includes("wearing") && !tokens(texto).includes("wears")) faltan.push("Para la ropa usa «is wearing» (Present Continuous: lo que lleva puesto ahora).");
  const ok = mal.length === 0 && gramatica.length === 0 && !a.juicios.some((j) => j.grave) && faltan.length === 0;
  return { ok, bien, mal, nose, gramatica, juicios: a.juicios, faltan };
}

/** Rondas de «Who is it?»: cada descripción solo encaja con una persona. */
export const RONDAS_QUIEN: { personaId: string; texto: string }[] = [
  { personaId: "carmen", texto: "She is tall and slim. She has long curly black hair. She is wearing a yellow raincoat." },
  { personaId: "guadalupe", texto: "She is short and has short curly gray hair. She is wearing glasses and a purple sweater." },
  { personaId: "diego", texto: "He has short straight black hair and a beard. He is wearing a green jacket and white sneakers." },
  { personaId: "sofia", texto: "She has short wavy brown hair. She is wearing a yellow sweater and blue jeans." },
  { personaId: "mateo", texto: "He is wearing a red cap and glasses. He has short straight brown hair." },
  { personaId: "ernesto", texto: "He is tall and has short wavy gray hair and a beard. He is wearing a blue coat and a green scarf." },
];

/** Por qué una persona NO encaja con la descripción de la ronda. */
export function porQueNo(textoRonda: string, p: Persona): string[] {
  return analizarDescripcion(textoRonda)
    .rasgos.map((r) => contrastar(r, p))
    .filter((c) => c.estado === "mal")
    .map((c) => c.texto);
}

/* ── Tarjeta de estrellas: ¿describe o juzga? ─────────────────────────── */

export interface Enunciado {
  texto: string;
  describe: boolean;
  porque: string;
}

export const ENUNCIADOS: Enunciado[] = [
  { texto: "She has long curly hair.", describe: true, porque: "Dice algo que cualquiera puede ver: largo y rizado." },
  { texto: "He is wearing a green jacket.", describe: true, porque: "Nombra la prenda y su color, sin opinar." },
  { texto: "She uses a wheelchair.", describe: true, porque: "Es la forma respetuosa y precisa de mencionar la silla de ruedas." },
  { texto: "He is tall and slim.", describe: true, porque: "Estatura y complexión con palabras neutras de la lectura A1." },
  { texto: "She has gray hair and glasses.", describe: true, porque: "Color de cabello y lentes: rasgos observables." },
  { texto: "He is heavy-set and has a beard.", describe: true, porque: "heavy-set es el término neutro para la complexión robusta." },
  { texto: "Her raincoat is yellow.", describe: true, porque: "El color de una prenda es un dato, no una opinión." },
  { texto: "Her dress is ugly.", describe: false, porque: "«ugly» es una opinión negativa: no describe, juzga." },
  { texto: "He looks weird.", describe: false, porque: "«weird» (raro) califica a la persona en vez de describirla." },
  { texto: "She is too fat for those jeans.", describe: false, porque: "Juzga el cuerpo. Lo neutro sería «She is heavy-set and she is wearing jeans»." },
  { texto: "He is confined to a wheelchair.", describe: false, porque: "Presenta la silla como encierro. Se dice «He uses a wheelchair»." },
  { texto: "His clothes are cheap.", describe: false, porque: "Opina sobre el valor de su ropa: no se puede ver y no aporta a la descripción." },
  { texto: "She is old and boring.", describe: false, porque: "«boring» es un juicio y «old» suena brusco; «She is an older woman» describe con respeto." },
  { texto: "His hair is a mess.", describe: false, porque: "Juzga su arreglo. Describe el tipo de cabello: «He has short wavy hair»." },
];

export function rondaEnunciados(rnd: () => number): number[] {
  const si = baraja(
    ENUNCIADOS.map((e, i) => (e.describe ? i : -1)).filter((i) => i >= 0),
    rnd,
  ).slice(0, 3);
  const no = baraja(
    ENUNCIADOS.map((e, i) => (!e.describe ? i : -1)).filter((i) => i >= 0),
    rnd,
  ).slice(0, 3);
  return baraja([...si, ...no], rnd);
}

/* ════════════════════════════════════════════════════════════════════════
 * Contenido VERBATIM de la plataforma
 * ════════════════════════════════════════════════════════════════════════ */

export const FUENTE =
  "Material elaborado para CEN Bachillerato — IN-I-P06 «People, clothes and weather» (A1 lectura, A2 texto con huecos, A3 escritura, A4 quiz, A5 verdadero o falso, A6 glosario) e IN-II-P04-A1 «Describing People, Clothes and Weather» (infografía).";

export const TITULO_A1 = "People, clothes and weather — Describir en inglés";

/** Lectura IN-I-P06-A1 (verbatim), en párrafos. */
export const LECTURA_A1: string[] = [
  "Describir personas en inglés involucra hablar de características físicas y de vestimenta con respeto hacia la diversidad. Para la apariencia física:",
  "• Altura: tall (alto), short (bajo), medium height (estatura mediana)\n• Complexión: slim/thin (delgado), heavy-set (robusto)\n• Cabello: long/short hair (cabello largo/corto), straight/curly/wavy hair (liso/rizado/ondulado), blonde/brown/black/gray hair (rubio/castaño/negro/gris)\n• Ojos: blue/green/brown/black eyes",
  'Para la vestimenta, el verbo es "to wear" (usar/llevar puesto): "She is wearing a red dress and black shoes." (Ella lleva un vestido rojo y zapatos negros.)',
  'Para describir el clima, usamos "It is..." + adjetivo: It is sunny (soleado), cloudy (nublado), rainy (lluvioso), windy (ventoso), cold (frío), hot (caliente), warm (templado), foggy (con niebla). También: "It is raining / It is snowing" (Está lloviendo / nevando).',
  "Recuerda que al describir personas debemos hacerlo con respeto. El inglés tiene vocabulario neutro y respetuoso para referirse a diferentes apariencias: usamos términos descriptivos sin connotaciones negativas.",
];

/** Preguntas de comprensión de la lectura A1 (verbatim). */
export const PREGUNTAS_A1: { pregunta: string; guia: string }[] = [
  { pregunta: "¿Qué verbo se usa para decir qué ropa lleva alguien?", guia: "To wear: 'She is wearing a red dress'." },
  { pregunta: "¿Cómo describes el clima lluvioso en inglés?", guia: "It is rainy. / It is raining." },
  { pregunta: "¿Cómo dices 'cabello rubio ondulado' en inglés?", guia: "Wavy blonde hair." },
];

/** Hechos: verdadero o falso IN-I-P06-A5 (verbatim). */
export const HECHOS: { enunciado: string; respuesta: boolean; retro: string }[] = [
  { enunciado: "'to wear' se usa para la ropa que lleva una persona.", respuesta: true, retro: "Correcto: 'He is wearing jeans'." },
  { enunciado: "'It is snowing' describe un clima caluroso.", respuesta: false, retro: "'Snowing' = nevando (frío)." },
  { enunciado: "'Straight hair' significa cabello lacio.", respuesta: true, retro: "Correcto: straight = lacio." },
  { enunciado: "Describir a las personas con respeto es importante en cualquier idioma.", respuesta: true, retro: "Sí: usa vocabulario neutro y respetuoso." },
];

/** Glosario IN-I-P06-A6 (verbatim). */
export const GLOSARIO: { termino: string; definicion: string; ejemplo: string }[] = [
  { termino: "tall / short", definicion: "Estatura: alto / bajo.", ejemplo: "He is tall." },
  { termino: "curly / straight / wavy", definicion: "Tipo de cabello: rizado / lacio / ondulado.", ejemplo: "She has curly hair." },
  { termino: "to wear", definicion: "Llevar puesta una prenda.", ejemplo: "I am wearing a blue shirt." },
  { termino: "sunny / cloudy / rainy", definicion: "Clima: soleado / nublado / lluvioso.", ejemplo: "Today it is cloudy." },
  { termino: "It is raining / snowing", definicion: "Está lloviendo / nevando (acción en curso).", ejemplo: "Look! It is raining." },
  { termino: "to have (has)", definicion: "Tener; describe rasgos físicos.", ejemplo: "She has green eyes." },
];
export const ACTIVIDAD_A6 = "Describe a una persona (apariencia + ropa) y el clima de hoy en inglés.";

/** Escritura IN-I-P06-A3 (verbatim): pistas del modo «Who is it?». */
export const PISTAS_A3: string[] = [
  "She/He is tall/short/medium height and slim/heavy-set",
  "She/He has [tipo] [color] hair and [color] eyes",
  "She/He is wearing a [color] [prenda]",
  "Today the weather is [adjetivo] in [ciudad]",
];
export const REFLEXION_A3 = "Reflexiona en español: ¿cómo describes a las personas de forma respetuosa en cualquier idioma?";

/** Infografía IN-II-P04-A1 (verbatim, extractos). */
export const IDEAS_IN2: string[] = [
  "Grammar — Present Continuous para estado actual: She IS wearing a red dress (Está usando un vestido rojo), versus Simple Present para hábitos: She wears blue jeans to school. El marcador 'right now / at the moment' (ahora mismo) activa el Present Continuous.",
  "A word that describes a noun (quality, size, color, appearance). In English, adjectives go BEFORE the noun: 'a tall woman,' not 'a woman tall.' (Palabra que describe a un sustantivo. En inglés el adjetivo va ANTES del sustantivo.)",
  "Verb used to describe possession or physical characteristics. 'I/You/We/They have' — 'He/She/It has.' For descriptions: 'She has long dark hair.' NOT 'She is have long hair.'",
  "Atmospheric conditions in a place at a specific time (sunny, rainy, cold). Different from 'climate' (climate = patrón climático de largo plazo). México tiene muchos microclimas por su topografía diversa.",
  "Sensibilidad cultural en las descripciones: evitar estereotipos al describir la apariencia física es tanto una habilidad lingüística como ética. Las recomendaciones de la UNESCO sobre lenguaje no discriminatorio se aplican al inglés como lengua extranjera.",
];
/** Oraciones modelo de la infografía IN-II-P04-A1 (verbatim). */
export const MODELO_IN2 = ["It is very hot in Sonora in summer", "It is rainy in Chiapas in June", "It is cold in Toluca in winter", "It is sunny in Cancún today"];

export const PROBLEMA =
  "En la parada de la colonia seis personas esperan el camión, y el clima cambia a lo largo del día. ¿Puedes decir en inglés cómo está el cielo, vestir a alguien para el pronóstico de su ciudad y describir a una persona de modo que otra la encuentre, sin juzgar su apariencia?";

export const INSTRUCCIONES: string[] = [
  "What's the weather like?: cambia el cielo de la plaza para ver y escuchar cada oración; luego, en el reto del reportero, escribe tú el clima que marca la escena.",
  "Dress for the weather: lee el pronóstico en inglés, elige la ropa y revisa el atuendo. La persona sale a la calle y verás si pasa frío, calor o se moja, y por qué.",
  "Con el atuendo correcto, arma con fichas la oración «… is wearing … because it is …».",
  "Who is it?: lee la descripción, toca a la persona en la escena o en los botones, y después escribe tú la descripción de alguien, sin juicios de valor.",
  "Abajo: clasifica oraciones en «describe» o «juzga», aprueba el quiz A4 y completa el texto A2.",
];

export const IDEAS: string[] = [
  "El clima se describe con «It is» + adjetivo: It is sunny, cloudy, rainy, windy, foggy. Lo que pasa ahora mismo va en Present Continuous: It is raining, It is snowing.",
  "rain, sun, snow y wind son sustantivos: no se dice «It is rain» sino «It is rainy» o «It is raining».",
  "Los rasgos se «tienen» (She has curly hair); la estatura y la complexión se «son» (He is tall and slim); la ropa se «lleva puesta» (She is wearing a raincoat).",
  "El adjetivo va antes del sustantivo y los plurales como jeans, boots o glasses van sin «a».",
  "Un paraguas no se «wear»: se carga (She is carrying an umbrella).",
  "Describir no es juzgar: estatura, cabello y ropa se ven; «ugly», «weird» o «fat» son opiniones. Lo respetuoso es «heavy-set», «older» y «uses a wheelchair».",
  "En Estados Unidos la temperatura se da en grados Fahrenheit: °F = °C × 9/5 + 32; 0 °C son 32 °F y 30 °C son 86 °F.",
];

export const QUIZ_A4: QuizEvaluable = {
  titulo: "People, clothes & weather — Quiz",
  puntajeMinimo: 70,
  reactivos: [
    { enunciado: "¿Qué verbo usas para la ropa que lleva alguien?", opciones: ["to have", "to wear", "to be", "to do"], respuestaCorrecta: 1, retroalimentacion: "'to wear' = llevar puesto: 'She is wearing a dress'." },
    { enunciado: "¿Cómo describes el clima lluvioso?", opciones: ["It is sunny.", "It is windy.", "It is rainy.", "It is hot."], respuestaCorrecta: 2, retroalimentacion: "'rainy' / 'It is raining' = lluvioso." },
    { enunciado: "'Curly hair' significa:", opciones: ["cabello lacio", "cabello rizado", "cabello corto", "cabello largo"], respuestaCorrecta: 1, retroalimentacion: "'Curly' = rizado." },
    { enunciado: "¿Cuál describe la estatura?", opciones: ["tall", "blonde", "rainy", "wearing"], respuestaCorrecta: 0, retroalimentacion: "'Tall' (alto) describe estatura." },
    { enunciado: "'She has blue eyes.' El verbo 'has' indica:", opciones: ["posesión/característica", "acción futura", "ubicación", "gusto"], respuestaCorrecta: 0, retroalimentacion: "'has' (tener) describe una característica física." },
  ],
};

export const HUECOS_A2: TextoHuecosData = {
  ancla: "IN-I-P06-A2 · What does she look like?",
  instrucciones: "Completa la descripción con las palabras correctas: wearing / tall / curly / sunny / has / black / cloudy / short",
  partes: ["My friend Pablo is ", " and slim. He ", " short ", " hair and brown eyes. Today he is ", " a ", " jacket and jeans. Outside, the weather is ", ". It is warm but a little ", ". My sister is ", " with long straight hair."],
  huecos: [
    { respuesta: "tall", alternativas: [], pista: "Alto/a" },
    { respuesta: "has", alternativas: [], pista: "He ___ hair (tener)" },
    { respuesta: "curly", alternativas: ["black"], pista: "Cabello rizado (o negro, según contexto)" },
    { respuesta: "wearing", alternativas: [], pista: "He is ___ (llevar puesto)" },
    { respuesta: "black", alternativas: ["blue", "dark"], pista: "Color de la chamarra" },
    { respuesta: "sunny", alternativas: [], pista: "El clima es ___ (soleado)" },
    { respuesta: "cloudy", alternativas: [], pista: "Pero un poco ___ (nublado)" },
    { respuesta: "short", alternativas: [], pista: "Mi hermana es ___ (baja)" },
  ],
};
