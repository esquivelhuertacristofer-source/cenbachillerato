/**
 * Datos y modelo del laboratorio «Describing people, clothes and weather»
 * (IN-II-P04, progresión 4 de Inglés II).
 *
 * QUÉ ÁNGULO TOMA ESTE LABORATORIO (y por qué no repite al de IN-I-P06).
 * Ya existe `clima-vestimenta-ingles-3d` («la plaza de la colonia», IN-I-P06),
 * que trabaja el VOCABULARIO: reportar el clima, vestir a alguien y describir a
 * la gente de la parada. Aquí el objeto de estudio es otro: las tres reglas de
 * la gramática inglesa que el español NO tiene y que por eso cuestan.
 *
 *   1. El ORDEN DEL ADJETIVO. En español el adjetivo va detrás y su orden es
 *      casi libre; en inglés va delante y en un orden fijo (opinión → tamaño →
 *      edad → color → material → sustantivo). «a red big jacket» no es que esté
 *      mal traducido: a un hablante de inglés le suena imposible.
 *   2. BE frente a HAVE. El español usa «ser» y «tener» con el mismo reparto,
 *      pero el alumno cruza los dos («She is have long hair», «She have brown
 *      eyes»), que es el error clásico que la propia progresión señala en A4.
 *   3. WEARING frente a WEARS. Lo que alguien trae puesto AHORA (present
 *      continuous) frente a lo que usa normalmente (present simple).
 *
 * Anclas VERBATIM (IN-II-P04):
 *   - A1 infografía «Describing People, Clothes and Weather»: marco teórico,
 *     puntos clave, contexto mexicano, preguntas de reflexión y fuente.
 *   - A2 fill_blanks «Appearance and Weather»: el modo «Completa el texto»
 *     (ver `describir-personas-clima-huecos.ts`).
 *   - A3 reflexión escrita «Describing Someone I Know»: panel «Tu turno».
 *   - A4 verdadero/falso: el reto evaluable (`QUIZ`).
 *   - A5 glosario interactivo: el glosario de la ficha.
 *   - A6 fill_blanks «Describing a friend»: inspira el ítem 7 de «Now or
 *      usually?» (citado en el propio ítem).
 *   - A8 video con preguntas: panel «Del video».
 *
 * LO QUE NO ES VERBATIM y hay que leer como ILUSTRATIVO:
 *   - Las seis frases del modo «Adjective order» y las seis del detector de
 *     frases imposibles las escribí para esta práctica; la REGLA que enseñan
 *     (el orden fijo del adjetivo) es la de cualquier gramática descriptiva del
 *     inglés y la enuncia la propia infografía A1 («adjectives go BEFORE the
 *     noun»).
 *   - Las cuatro personas de los pronósticos (Paola, Bruno, Renata, Iker) son
 *     FICTICIAS y sus descripciones son neutras a propósito (estatura, pelo,
 *     lentes, ropa): describir sin juzgar el cuerpo es un criterio explícito de
 *     A3 y de A1.
 *   - Las temperaturas de los pronósticos son valores TÍPICOS ilustrativos de
 *     cada lugar y temporada, no mediciones de un día concreto. Los lugares sí
 *     son reales y su clima es el que se describe: en Creel (Sierra Tarahumara,
 *     Chihuahua) nieva en invierno; La Ventosa, en el Istmo de Tehuantepec
 *     (Oaxaca), es de las zonas más ventosas de México y por eso concentra
 *     parques eólicos; Mérida es calurosa todo el año; Xalapa es lluviosa y
 *     templada.
 *
 * Todas las oraciones en inglés están en inglés estadounidense estándar.
 * Datos puros: sin three, sin React.
 */

import type { QuizEvaluable } from "./_reto-quiz";

export const FUENTE =
  "SEP — Programa Nacional de Inglés (PRONI) 2022–2025; SECTUR — Informe Estadístico de Turismo Internacional 2023; UNAM CELE — Materiales para la enseñanza del inglés en bachillerato 2023";

export const ANCLA = "IN-II-P04-A1 · Describing People, Clothes and Weather";

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 1 · Adjective order — el orden que el español no tiene
 * ═══════════════════════════════════════════════════════════════════════════ */

export type CatAdj = "opinion" | "tamano" | "edad" | "color" | "material";

/** El orden fijo del inglés, de izquierda a derecha, antes del sustantivo. */
export const ORDEN_ADJ: CatAdj[] = ["opinion", "tamano", "edad", "color", "material"];

export const CAT_INFO: Record<CatAdj, { titulo: string; en: string; color: string; icono: string; ejemplo: string }> = {
  opinion: { titulo: "Opinión", en: "opinion", color: "#F472B6", icono: "fa-heart", ejemplo: "nice, beautiful, comfortable" },
  tamano: { titulo: "Tamaño", en: "size", color: "#38BDF8", icono: "fa-up-right-and-down-left-from-center", ejemplo: "big, small, long, short" },
  edad: { titulo: "Edad", en: "age", color: "#A78BFA", icono: "fa-hourglass-half", ejemplo: "new, old" },
  color: { titulo: "Color", en: "color", color: "#FBBF24", icono: "fa-palette", ejemplo: "red, white, brown, blue" },
  material: { titulo: "Material", en: "material", color: "#34D399", icono: "fa-layer-group", ejemplo: "leather, cotton, wool" },
};

export interface AdjetivoFicha {
  palabra: string;
  cat: CatAdj;
  es: string;
}

export interface FraseOrden {
  id: string;
  /** "a", "an" o "" cuando el sustantivo va en plural. */
  articulo: string;
  sustantivo: string;
  sustantivoEs: string;
  /** En el orden CORRECTO del inglés. */
  adjetivos: AdjetivoFicha[];
  /** La traducción natural al español (donde el orden es otro). */
  es: string;
  /** La versión que a un hablante de inglés le suena imposible. */
  malSuena: string;
  porque: string;
}

export const FRASES: FraseOrden[] = [
  {
    id: "jacket",
    articulo: "a",
    sustantivo: "jacket",
    sustantivoEs: "chamarra",
    adjetivos: [
      { palabra: "big", cat: "tamano", es: "grande" },
      { palabra: "red", cat: "color", es: "roja" },
    ],
    es: "una chamarra roja grande",
    malSuena: "a red big jacket",
    porque: "El tamaño va siempre antes que el color: big red, nunca red big.",
  },
  {
    id: "dress",
    articulo: "a",
    sustantivo: "dress",
    sustantivoEs: "vestido",
    adjetivos: [
      { palabra: "beautiful", cat: "opinion", es: "bonito" },
      { palabra: "long", cat: "tamano", es: "largo" },
      { palabra: "white", cat: "color", es: "blanco" },
    ],
    es: "un vestido blanco largo y bonito",
    malSuena: "a white long beautiful dress",
    porque: "La opinión abre la fila y el color la cierra: beautiful → long → white.",
  },
  {
    id: "backpack",
    articulo: "an",
    sustantivo: "backpack",
    sustantivoEs: "mochila",
    adjetivos: [
      { palabra: "old", cat: "edad", es: "vieja" },
      { palabra: "brown", cat: "color", es: "café" },
      { palabra: "leather", cat: "material", es: "de piel" },
    ],
    es: "una mochila de piel café vieja",
    malSuena: "a leather brown old backpack",
    porque: "El material se pega al sustantivo: es lo último antes de backpack.",
  },
  {
    id: "tshirt",
    articulo: "a",
    sustantivo: "T-shirt",
    sustantivoEs: "playera",
    adjetivos: [
      { palabra: "comfortable", cat: "opinion", es: "cómoda" },
      { palabra: "new", cat: "edad", es: "nueva" },
      { palabra: "cotton", cat: "material", es: "de algodón" },
    ],
    es: "una playera de algodón nueva y cómoda",
    malSuena: "a cotton new comfortable T-shirt",
    porque: "Lo que opinas va primero; de qué está hecha, al final.",
  },
  {
    id: "sneakers",
    articulo: "",
    sustantivo: "sneakers",
    sustantivoEs: "tenis",
    adjetivos: [
      { palabra: "new", cat: "edad", es: "nuevos" },
      { palabra: "white", cat: "color", es: "blancos" },
    ],
    es: "tenis blancos nuevos",
    malSuena: "white new sneakers",
    porque: "La edad va antes que el color: new white, nunca white new.",
  },
  {
    id: "umbrella",
    articulo: "a",
    sustantivo: "umbrella",
    sustantivoEs: "paraguas",
    adjetivos: [
      { palabra: "small", cat: "tamano", es: "pequeño" },
      { palabra: "yellow", cat: "color", es: "amarillo" },
    ],
    es: "un paraguas amarillo pequeño",
    malSuena: "a yellow small umbrella",
    porque: "Otra vez: tamaño antes que color. Small yellow umbrella.",
  },
];

/** Cuántos adjetivos hay que colocar en total en el modo 1. */
export const TOTAL_ADJETIVOS = FRASES.reduce((n, f) => n + f.adjetivos.length, 0);

export interface FraseJuicio {
  id: string;
  frase: string;
  /** true = un hablante de inglés la diría así. */
  posible: boolean;
  porque: string;
}

export const JUICIOS: FraseJuicio[] = [
  { id: "j1", frase: "a big red jacket", posible: true, porque: "Tamaño (big) antes que color (red). Así se dice." },
  { id: "j2", frase: "a red big jacket", posible: false, porque: "Imposible: el color se adelantó al tamaño. Debe ser «a big red jacket»." },
  { id: "j3", frase: "an old leather brown backpack", posible: false, porque: "Imposible: el material (leather) se adelantó al color (brown). Debe ser «an old brown leather backpack»." },
  { id: "j4", frase: "a beautiful long white dress", posible: true, porque: "Opinión → tamaño → color. El orden completo, tal cual." },
  { id: "j5", frase: "white new sneakers", posible: false, porque: "Imposible: el color se adelantó a la edad. Debe ser «new white sneakers»." },
  { id: "j6", frase: "a comfortable new cotton T-shirt", posible: true, porque: "Opinión → edad → material. Correcta." },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 2 · Be or have? — el cruce que la progresión señala en A4
 * ═══════════════════════════════════════════════════════════════════════════ */

export type FormaVerbo = "is" | "are" | "has" | "have";

export const FORMAS: FormaVerbo[] = ["is", "are", "has", "have"];

/** A qué verbo pertenece cada forma. */
export const VERBO_DE: Record<FormaVerbo, "be" | "have"> = { is: "be", are: "be", has: "have", have: "have" };

export interface ItemBeHave {
  id: string;
  sujeto: string;
  /** Lo que sigue al hueco, con punto final. */
  resto: string;
  correcta: FormaVerbo;
  /** Qué clase de palabra sigue: decide el verbo. */
  sigue: "adjetivo" | "sustantivo";
  /** La palabra o frase que decide, para resaltarla en la explicación. */
  clave: string;
  /** Plural del sujeto: decide entre is/are y has/have. */
  plural: boolean;
  es: string;
}

export const BE_HAVE: ItemBeHave[] = [
  { id: "bh1", sujeto: "She", resto: "tall.", correcta: "is", sigue: "adjetivo", clave: "tall", plural: false, es: "Ella es alta." },
  { id: "bh2", sujeto: "She", resto: "long dark hair.", correcta: "has", sigue: "sustantivo", clave: "long dark hair", plural: false, es: "Ella tiene el cabello largo y oscuro." },
  { id: "bh3", sujeto: "He", resto: "brown eyes.", correcta: "has", sigue: "sustantivo", clave: "brown eyes", plural: false, es: "Él tiene los ojos cafés." },
  { id: "bh4", sujeto: "He", resto: "young.", correcta: "is", sigue: "adjetivo", clave: "young", plural: false, es: "Él es joven." },
  { id: "bh5", sujeto: "Ana and Luis", resto: "tall.", correcta: "are", sigue: "adjetivo", clave: "tall", plural: true, es: "Ana y Luis son altos." },
  { id: "bh6", sujeto: "My cousins", resto: "curly hair.", correcta: "have", sigue: "sustantivo", clave: "curly hair", plural: true, es: "Mis primos tienen el cabello rizado." },
  { id: "bh7", sujeto: "I", resto: "glasses.", correcta: "have", sigue: "sustantivo", clave: "glasses", plural: true, es: "Yo uso lentes." },
  { id: "bh8", sujeto: "The teacher", resto: "short gray hair.", correcta: "has", sigue: "sustantivo", clave: "short gray hair", plural: false, es: "El maestro tiene el cabello corto y canoso." },
];

/**
 * Por qué esa forma no va. Se calcula del propio ítem, así que cada error
 * recibe la regla que rompió y no un «incorrecto» a secas.
 */
export function explicaBeHave(item: ItemBeHave, elegida: FormaVerbo): string {
  const correcto = `${item.sujeto} ${item.correcta} ${item.resto}`;
  if (VERBO_DE[elegida] === VERBO_DE[item.correcta]) {
    // Verbo bien, concordancia mal.
    return item.plural
      ? `El verbo es el correcto, pero «${item.sujeto}» es plural: con plural se usa «${item.correcta}», no «${elegida}». → ${correcto}`
      : `El verbo es el correcto, pero «${item.sujeto}» es singular (he/she/it): se usa «${item.correcta}», no «${elegida}». → ${correcto}`;
  }
  if (item.sigue === "adjetivo") {
    return `«${elegida}» pide un sustantivo (has glasses, have brown eyes). Después del hueco viene «${item.clave}», que es un ADJETIVO, y los adjetivos van con be. → ${correcto}`;
  }
  return `«${elegida}» pide un adjetivo (is tall, are young). Después del hueco viene «${item.clave}», que es un SUSTANTIVO, y lo que se tiene va con have/has. → ${correcto}`;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 3 · Dress for the weather — vestir y JUSTIFICAR en inglés
 * ═══════════════════════════════════════════════════════════════════════════ */

export type Condicion = "raining" | "snowing" | "hot" | "windy";

/** Dónde se dibuja la prenda sobre la figura. */
export type Slot = "cabeza" | "ojos" | "cuello" | "torso" | "piernas" | "pies" | "mano" | "manos";

export type Nivel = "bien" | "neutral" | "absurdo";

export interface Prenda {
  id: string;
  en: string;
  es: string;
  slot: Slot;
  icono: string;
  color: string;
}

export const PRENDAS: Prenda[] = [
  { id: "raincoat", en: "a raincoat", es: "un impermeable", slot: "torso", icono: "fa-vest", color: "#FBBF24" },
  { id: "umbrella", en: "an umbrella", es: "un paraguas", slot: "mano", icono: "fa-umbrella", color: "#38BDF8" },
  { id: "boots", en: "boots", es: "botas", slot: "pies", icono: "fa-shoe-prints", color: "#8B5E3C" },
  { id: "coat", en: "a warm coat", es: "un abrigo", slot: "torso", icono: "fa-vest", color: "#6366F1" },
  { id: "scarf", en: "a scarf", es: "una bufanda", slot: "cuello", icono: "fa-ribbon", color: "#F472B6" },
  { id: "gloves", en: "gloves", es: "guantes", slot: "manos", icono: "fa-mitten", color: "#A78BFA" },
  { id: "tshirt", en: "a T-shirt", es: "una playera", slot: "torso", icono: "fa-shirt", color: "#34D399" },
  { id: "shorts", en: "shorts", es: "shorts", slot: "piernas", icono: "fa-shirt", color: "#22D3EE" },
  { id: "sandals", en: "sandals", es: "sandalias", slot: "pies", icono: "fa-shoe-prints", color: "#FB923C" },
  { id: "cap", en: "a cap", es: "una gorra", slot: "cabeza", icono: "fa-hat-cowboy", color: "#EF4444" },
  { id: "sunglasses", en: "sunglasses", es: "lentes de sol", slot: "ojos", icono: "fa-glasses", color: "#94A3B8" },
  { id: "windbreaker", en: "a windbreaker", es: "una chamarra rompevientos", slot: "torso", icono: "fa-vest", color: "#0EA5E9" },
  { id: "jeans", en: "jeans", es: "pantalón de mezclilla", slot: "piernas", icono: "fa-shirt", color: "#3B82F6" },
  { id: "sneakers", en: "sneakers", es: "tenis", slot: "pies", icono: "fa-shoe-prints", color: "#E5E7EB" },
];

export const PRENDA_POR_ID: Record<string, Prenda> = Object.fromEntries(PRENDAS.map((p) => [p.id, p]));

/** Qué prendas funcionan con cada clima y cuáles son absurdas, con su razón. */
const VEREDICTOS: Record<Condicion, { bien: string[]; absurdo: Record<string, string> }> = {
  raining: {
    bien: ["raincoat", "umbrella", "boots", "jeans"],
    absurdo: {
      sandals: "Con lluvia las sandalias dejan los pies mojados y fríos. It's raining: you need boots.",
      sunglasses: "No hay sol: bajo la lluvia los lentes de sol no sirven de nada.",
      shorts: "Con lluvia y 16 °C los shorts dejan las piernas mojadas y frías.",
    },
  },
  snowing: {
    bien: ["coat", "scarf", "gloves", "boots", "jeans"],
    absurdo: {
      sandals: "A −4 °C las sandalias son peligrosas: los pies se congelan. It's snowing: you need boots.",
      shorts: "A −4 °C los shorts dejan las piernas al aire. It's very cold.",
      tshirt: "Una playera sola no abriga a −4 °C: hace falta un abrigo encima.",
    },
  },
  hot: {
    bien: ["tshirt", "shorts", "sandals", "cap", "sunglasses"],
    absurdo: {
      coat: "A 35 °C un abrigo da un golpe de calor. It's hot: you don't need a coat.",
      scarf: "Una bufanda a 35 °C da más calor todavía.",
      gloves: "Guantes con 35 °C y sol: no.",
      boots: "Botas cerradas a 35 °C: los pies se acaloran. Mejor sandals.",
    },
  },
  windy: {
    bien: ["windbreaker", "jeans", "sneakers", "sunglasses"],
    absurdo: {
      umbrella: "Con viento fuerte el paraguas se voltea y se rompe. It's windy: use a windbreaker.",
      cap: "Con viento fuerte la gorra sale volando.",
      sandals: "Con viento y polvo las sandalias dejan los pies descubiertos.",
    },
  },
};

export function nivelDe(prendaId: string, cond: Condicion): Nivel {
  const v = VEREDICTOS[cond];
  if (v.bien.includes(prendaId)) return "bien";
  return v.absurdo[prendaId] !== undefined ? "absurdo" : "neutral";
}

export function razonAbsurda(prendaId: string, cond: Condicion): string {
  return VEREDICTOS[cond].absurdo[prendaId] ?? "";
}

/** Cuántas prendas acertadas hace falta elegir por pronóstico. */
export const PRENDAS_POR_ATUENDO = 3;

export interface OpcionOracion {
  texto: string;
  correcta: boolean;
  /** Por qué esta opción no va (vacío en la correcta). */
  porque: string;
}

export interface Pronostico {
  id: string;
  persona: string;
  pronombre: "She" | "He";
  lugar: string;
  cuando: string;
  condicion: Condicion;
  /** El parte del clima, en inglés. */
  texto: string;
  es: string;
  tempC: number;
  icono: string;
  /** Cómo se describe a la persona, con respeto y sin juzgar. */
  persona_desc: string;
  /** Rasgos neutros que la figura dibuja, para que el texto y el dibujo digan lo mismo. */
  estatura: "alta" | "media" | "baja";
  pelo: "largo" | "corto";
  lentes: boolean;
  oraciones: OpcionOracion[];
}

export const PRONOSTICOS: Pronostico[] = [
  {
    id: "xalapa",
    persona: "Paola",
    pronombre: "She",
    lugar: "Xalapa, Veracruz",
    cuando: "una mañana de julio",
    condicion: "raining",
    texto: "Good morning, Xalapa! It's raining and it's cool. It's 16 °C.",
    es: "Buenos días, Xalapa. Está lloviendo y hace fresco: 16 °C.",
    tempC: 16,
    icono: "fa-cloud-showers-heavy",
    persona_desc: "Paola is tall and she has long dark hair.",
    estatura: "alta",
    pelo: "largo",
    lentes: false,
    oraciones: [
      { texto: "She is wear a raincoat because it's raining.", correcta: false, porque: "Después de «is» el verbo va en -ing: is wearing, no is wear." },
      { texto: "She is wearing a raincoat because it's raining.", correcta: true, porque: "" },
      { texto: "She is wearing a raincoat because it's sunny.", correcta: false, porque: "La gramática está bien, pero la razón no: el pronóstico dice «it's raining», no «it's sunny»." },
    ],
  },
  {
    id: "creel",
    persona: "Bruno",
    pronombre: "He",
    lugar: "Creel, Chihuahua",
    cuando: "una noche de enero",
    condicion: "snowing",
    texto: "It's snowing in Creel tonight. It's very cold: −4 °C.",
    es: "Está nevando en Creel esta noche. Hace mucho frío: −4 °C.",
    tempC: -4,
    icono: "fa-snowflake",
    persona_desc: "Bruno is short and he wears glasses.",
    estatura: "baja",
    pelo: "corto",
    lentes: true,
    oraciones: [
      { texto: "He wearing gloves and a scarf because it's snowing.", correcta: false, porque: "Falta el verbo be: el present continuous es be + verbo-ing → He IS wearing." },
      { texto: "He is wearing gloves and a scarf because it's hot.", correcta: false, porque: "La razón contradice el pronóstico: a −4 °C no es «hot», es «very cold»." },
      { texto: "He is wearing gloves and a scarf because it's snowing.", correcta: true, porque: "" },
    ],
  },
  {
    id: "merida",
    persona: "Renata",
    pronombre: "She",
    lugar: "Mérida, Yucatán",
    cuando: "un mediodía de mayo",
    condicion: "hot",
    texto: "It's hot and sunny in Mérida today. It's 35 °C.",
    es: "Hace calor y hay sol en Mérida hoy: 35 °C.",
    tempC: 35,
    icono: "fa-sun",
    persona_desc: "Renata is young and she has short curly hair.",
    estatura: "media",
    pelo: "corto",
    lentes: false,
    oraciones: [
      { texto: "She has wearing a cap and sunglasses because it's hot and sunny.", correcta: false, porque: "El present continuous se forma con be, no con have: she IS wearing." },
      { texto: "She is wearing a cap and sunglasses because it's snowing.", correcta: false, porque: "La razón no corresponde: en Mérida el parte dice «hot and sunny»." },
      { texto: "She is wearing a cap and sunglasses because it's hot and sunny.", correcta: true, porque: "" },
    ],
  },
  {
    id: "laventosa",
    persona: "Iker",
    pronombre: "He",
    lugar: "La Ventosa, Oaxaca",
    cuando: "una tarde de febrero",
    condicion: "windy",
    texto: "It's very windy in La Ventosa this afternoon. It's 28 °C.",
    es: "Hace mucho viento en La Ventosa esta tarde: 28 °C.",
    tempC: 28,
    icono: "fa-wind",
    persona_desc: "Iker is tall and he has short black hair.",
    estatura: "alta",
    pelo: "corto",
    lentes: false,
    oraciones: [
      { texto: "He is wears a windbreaker because it's windy.", correcta: false, porque: "No se juntan dos verbos conjugados: o «He wears» (hábito) o «He is wearing» (ahora)." },
      { texto: "He is wearing a windbreaker because it's windy.", correcta: true, porque: "" },
      { texto: "He is wearing a windbreaker because it's raining.", correcta: false, porque: "La razón no corresponde: el parte dice «very windy», no que esté lloviendo." },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 4 · Now or usually? — wearing frente a wears (se escribe)
 * ═══════════════════════════════════════════════════════════════════════════ */

export interface ItemAhora {
  id: string;
  antes: string;
  despues: string;
  /** El verbo en infinitivo, que se muestra como pista entre paréntesis. */
  verbo: string;
  /** La expresión que decide el tiempo verbal. */
  marcador: string;
  tipo: "continuous" | "simple";
  respuesta: string;
  alternativas: string[];
  /** Formas del OTRO tiempo: si el alumno escribe una, se le explica el cruce. */
  contrario: string[];
  es: string;
  /** De dónde sale el ítem, si no es propio. */
  nota?: string;
}

export const AHORA: ItemAhora[] = [
  {
    id: "ah1",
    antes: "Look! Paola ",
    despues: " a yellow raincoat right now.",
    verbo: "wear",
    marcador: "right now",
    tipo: "continuous",
    respuesta: "is wearing",
    alternativas: ["s wearing"],
    contrario: ["wears", "wear"],
    es: "¡Mira! Paola trae puesto un impermeable amarillo ahora mismo.",
  },
  {
    id: "ah2",
    antes: "Paola ",
    despues: " a school uniform every day.",
    verbo: "wear",
    marcador: "every day",
    tipo: "simple",
    respuesta: "wears",
    alternativas: [],
    contrario: ["is wearing", "s wearing", "are wearing", "am wearing"],
    es: "Paola usa uniforme escolar todos los días.",
  },
  {
    id: "ah3",
    antes: "It's cold today, so I ",
    despues: " my jacket at the moment.",
    verbo: "wear",
    marcador: "at the moment",
    tipo: "continuous",
    respuesta: "am wearing",
    alternativas: ["m wearing"],
    contrario: ["wear", "wears", "is wearing"],
    es: "Hoy hace frío, así que en este momento traigo puesta mi chamarra.",
  },
  {
    id: "ah4",
    antes: "My brother usually ",
    despues: " sneakers to school.",
    verbo: "wear",
    marcador: "usually",
    tipo: "simple",
    respuesta: "wears",
    alternativas: [],
    contrario: ["is wearing", "s wearing", "wear"],
    es: "Mi hermano normalmente usa tenis para ir a la escuela.",
  },
  {
    id: "ah5",
    antes: "Look at the photo: the children ",
    despues: " blue jackets.",
    verbo: "wear",
    marcador: "Look at the photo",
    tipo: "continuous",
    respuesta: "are wearing",
    alternativas: ["re wearing"],
    contrario: ["wear", "wears", "is wearing"],
    es: "Mira la foto: los niños traen puestas chamarras azules.",
  },
  {
    id: "ah6",
    antes: "In Oaxaca, many people ",
    despues: " traditional clothes for the Guelaguetza every July.",
    verbo: "wear",
    marcador: "every July",
    tipo: "simple",
    respuesta: "wear",
    alternativas: [],
    contrario: ["are wearing", "is wearing", "wears"],
    es: "En Oaxaca, mucha gente usa ropa tradicional para la Guelaguetza cada julio.",
  },
  {
    id: "ah7",
    antes: "This is my friend Mia. She ",
    despues: " a blue jacket today because it is cold outside.",
    verbo: "wear",
    marcador: "today",
    tipo: "continuous",
    respuesta: "is wearing",
    alternativas: ["s wearing"],
    contrario: ["wears", "wear"],
    es: "Esta es mi amiga Mia. Hoy trae puesta una chamarra azul porque hace frío afuera.",
    nota: "Adaptado de la actividad A6 de esta progresión, «Fill in the blanks — Describing a friend».",
  },
  {
    id: "ah8",
    antes: "Diego ",
    despues: " glasses every day.",
    verbo: "wear",
    marcador: "every day",
    tipo: "simple",
    respuesta: "wears",
    alternativas: [],
    contrario: ["is wearing", "s wearing", "has"],
    es: "Diego usa lentes todos los días.",
  },
];

export const MARCADORES_INFO = {
  continuous: {
    titulo: "Ahora · Present continuous",
    forma: "am / is / are + verbo-ing",
    marcas: ["right now", "at the moment", "today", "Look!"],
    ejemplo: "She is wearing a raincoat right now.",
    color: "#38BDF8",
    icono: "fa-bolt",
  },
  simple: {
    titulo: "Normalmente · Present simple",
    forma: "wear / wears (he, she, it llevan -s)",
    marcas: ["every day", "usually", "always", "on Sundays"],
    ejemplo: "She wears a uniform every day.",
    color: "#FBBF24",
    icono: "fa-repeat",
  },
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
 * Reto evaluable — A4 VERBATIM (verdadero/falso, mínimo 70 %)
 * ═══════════════════════════════════════════════════════════════════════════ */

export const QUIZ: QuizEvaluable = {
  titulo: "True or False — People, clothes & weather",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "El present continuous se usa para describir lo que alguien lleva puesto ahora ('She is wearing a coat').",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correcto: is/are + verbo-ing para acciones en curso.",
    },
    {
      enunciado: "'His', 'her' y 'their' son adjetivos posesivos.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Sí: his (de él), her (de ella), their (de ellos).",
    },
    {
      enunciado: "Con 'he' y 'she' se usa 'have' ('She have brown eyes').",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 1,
      retroalimentacion: "No: con he/she se usa 'has': 'She has brown eyes'.",
    },
    {
      enunciado: "'It is sunny' describe el clima soleado.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correcto: sunny = soleado.",
    },
    {
      enunciado: "'Winter', 'spring', 'summer' y 'autumn/fall' son las estaciones del año.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Sí: invierno, primavera, verano y otoño.",
    },
  ],
};

/* ═══════════════════════════════════════════════════════════════════════════
 * Paneles VERBATIM de la progresión
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Marco teórico: contexto mexicano de A1, verbatim. */
export const MARCO: string[] = [
  "El inglés es la segunda lengua más estudiada en México, pero solo el 5–6% de los mexicanos se comunica con fluidez en inglés (EF EPI 2023). Sin embargo, la demanda de trabajadores bilingües crece aceleradamente por el nearshoring tecnológico y la industria turística. En ciudades fronterizas como Tijuana y Ciudad Juárez, el español y el inglés coexisten tan íntimamente que ha emergido un dialecto de contacto con vocabulario, gramática y pronunciación propios.",
  "Describir personas, ropa y clima en inglés no es solo un ejercicio académico: es una habilidad real para el sector turístico. Los aproximadamente 32 millones de turistas internacionales que visitaron México en 2023 interactuaron con guías, artesanos, restauranteros y hoteleros cuya capacidad de describir en inglés impactó directamente en la experiencia del visitante y en los ingresos del sector.",
  "Physical appearance vocabulary: tall/short (alto/bajo), young/old (joven/mayor), long/short hair (cabello largo/corto). Grammar: use 'have/has' for descriptions → She has dark hair and brown eyes.",
  "Grammar — Present Continuous para estado actual: She IS wearing a red dress (Está usando un vestido rojo), versus Simple Present para hábitos: She wears blue jeans to school. El marcador 'right now / at the moment' (ahora mismo) activa el Present Continuous.",
  "Sensibilidad cultural en las descripciones: evitar estereotipos al describir la apariencia física es tanto una habilidad lingüística como ética. Las recomendaciones de la UNESCO sobre lenguaje no discriminatorio se aplican al inglés como lengua extranjera.",
];

/** Puntos clave de A1 que el laboratorio pone a trabajar, verbatim. */
export const PUNTOS_CLAVE: string[] = [
  "Clothing vocabulary at A2: jacket (chamarra), dress (vestido), jeans (mezclilla), sneakers (tenis/zapatos deportivos), scarf (bufanda), boots (botas). México produce anualmente más de 600 millones de prendas en los estados de Puebla, Tlaxcala y Aguascalientes, gran parte exportada a EE.UU. con la etiqueta 'Made in Mexico'.",
  "Weather vocabulary: sunny (soleado), cloudy (nublado), rainy (lluvioso), windy (ventoso), hot (caluroso), cold (frío), warm (cálido). México tiene extrema variación climática: Hermosillo, Sonora alcanza hasta 48–50 °C en verano ('It is extremely hot today'); Toluca, Estado de México, a 2,700 m de altitud, registra 'very cold and cloudy' la mayor parte del invierno.",
  "Turismo en México: el país recibió aproximadamente 32 millones de turistas internacionales en 2023 (SECTUR). Personal de hoteles, guías de turistas y artesanos en Cancún, Oaxaca, Chichén Itzá y Puerto Vallarta usan inglés descriptivo a diario: 'The pyramids are very tall and ancient. The weather in the Yucatán Peninsula is hot and humid.'",
];

/** La regla del adjetivo, tal como la enuncia el glosario de A1. */
export const REGLA_ADJETIVO_A1 =
  "A word that describes a noun (quality, size, color, appearance). In English, adjectives go BEFORE the noun: 'a tall woman,' not 'a woman tall.' (Palabra que describe a un sustantivo. En inglés el adjetivo va ANTES del sustantivo.)";

/** Preguntas de reflexión de A1, verbatim. */
export const REFLEXION_A1: string[] = [
  "In Mexico, English proficiency is higher in northern border states (Baja California, Sonora, Chihuahua) than in southern states. ¿Por qué crees que existe esa diferencia regional? What economic, historical and geographic factors explain it?",
  "El 'spanglish fronterizo' mezcla español e inglés de formas que ninguno de los dos idiomas 'oficiales' reconoce. ¿Es esto una 'corrupción' de los idiomas o una forma legítima de creatividad lingüística? ¿Qué dice la lingüística moderna sobre las lenguas de contacto?",
  "Mexico received about 32 million international tourists in 2023. ¿Qué frases de descripción en inglés necesitaría alguien que trabaja en turismo en tu estado? Make a list of 10 key English phrases for your regional context.",
];

/** Tu turno: la reflexión escrita A3, verbatim. */
export const TU_TURNO_A3 = {
  prompt:
    "Describe a real person you know (friend, family member, or teacher). Write about: (a) their physical appearance (at least 3 features), (b) what they are wearing TODAY (present continuous), and (c) what the weather is like today where you are. Write in English.",
  pistas: [
    "Appearance: He/She has [hair color and length] hair. He/She is [tall/short].",
    "Clothing today: He/She is wearing [clothes].",
    "Weather: Today it is [sunny/cloudy/cold...].",
  ],
  criterios: [
    "Describes physical appearance with 3+ features",
    "Uses present continuous for current clothing",
    "Describes the weather correctly",
    "Text is clear and respectful (avoids stereotypes)",
  ],
  minimo: 60,
  maximo: 180,
};

/** Preguntas del video A8, verbatim. */
export const VIDEO_A8 = {
  titulo: "Describir personas, vestimenta y clima en inglés",
  preguntas: [
    { pregunta: "¿Cómo describirías en inglés la ropa que llevas puesta hoy?", respuesta: "Pregunta abierta: responde con «I am wearing…»." },
    { pregunta: "¿Cuál de las siguientes palabras en inglés describe el clima?", respuesta: "Rainy. «Jacket» es una prenda y «tall» describe a una persona." },
    { pregunta: "Describir a las personas en inglés debe hacerse respetando la diversidad y sin juzgar.", respuesta: "Verdadero. Es un criterio explícito de la progresión." },
  ],
};

/** El glosario A5, verbatim, para el panel de consulta. */
export const GLOSARIO_A5: { termino: string; definicion: string; ejemplo: string }[] = [
  { termino: "to have / has", definicion: "Tener; describe rasgos físicos (he/she usa 'has').", ejemplo: "She has long hair." },
  { termino: "his / her / their", definicion: "Adjetivos posesivos (de él / de ella / de ellos).", ejemplo: "Her dress is red." },
  { termino: "is wearing", definicion: "Present continuous para la ropa que lleva alguien.", ejemplo: "He is wearing a jacket." },
  { termino: "T-shirt / jeans / jacket", definicion: "Prendas de vestir: playera / jeans / chamarra.", ejemplo: "I like your jacket." },
  { termino: "sunny / cloudy / rainy / windy", definicion: "Adjetivos de clima: soleado / nublado / lluvioso / ventoso.", ejemplo: "Today it is windy." },
  { termino: "seasons", definicion: "Estaciones: spring, summer, autumn/fall, winter.", ejemplo: "In summer it is hot." },
];

/** Dato de contexto para el pie de la columna lateral (A1, verbatim). */
export const DATO_BILINGUE =
  "PRONI y el bachillerato: el Programa Nacional de Inglés de la SEP (PRONI) tiene como meta que los egresados del NEM bachillerato alcancen nivel A2–B1 para 2025. Los trabajadores bilingües en turismo, call centers y nearshoring ganan entre 30 y 60% más que los monolingües, según el índice de talento digital de AMITI 2024.";
