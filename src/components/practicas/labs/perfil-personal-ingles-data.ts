/**
 * Datos del laboratorio «About me — dar y pedir información personal».
 * Progresión IN-I-P04 (Inglés I, 1.er semestre).
 *
 * Módulo de datos PURO: sin React, sin three. Aquí viven el contenido verbatim
 * de la progresión (lectura A1, huecos A2, consigna A3, quiz A4, hechos A5 y
 * glosario A6) y el material escrito para este laboratorio (las fichas de los
 * dos personajes, las rondas de preguntas y las transformaciones con «to be»).
 *
 * Idioma: todo lo que el alumno LEE como instrucción, pista o explicación va en
 * español de México; todo lo que el alumno COMPRENDE o PRODUCE va en inglés
 * estadounidense estándar.
 *
 * Datos personales: el alumno NUNCA escribe los suyos. Se trabaja sobre dos
 * personajes ficticios —Mateo Herrera Solís y Sofía Ramírez Torres— y sobre la
 * Ana García que la propia actividad A2 trae verbatim. Los teléfonos, correos y
 * domicilios son inventados.
 */

import type { ParTermino } from "./_mecanica-termino";
import type { QuizEvaluable } from "./_reto-quiz";

/* ═══════════════════════════════════════════════════════════════════════════
 * Personajes ficticios
 * ═══════════════════════════════════════════════════════════════════════════ */

export interface Personaje {
  id: "mateo" | "sofia";
  nombre: string;
  /** Nombre y primer apellido: como se presenta en una oración. */
  nombreCorto: string;
  /** Pronombre de sujeto en tercera persona. */
  pronombre: "He" | "She";
  /** Adjetivo posesivo de tercera persona. */
  posesivo: "His" | "Her";
  firstName: string;
  lastName: string;
  age: string;
  nationality: string;
  country: string;
  occupation: string;
  phone: string;
  email: string;
  address: string;
  ciudad: string;
}

export const MATEO: Personaje = {
  id: "mateo",
  nombre: "Mateo Herrera Solís",
  nombreCorto: "Mateo Herrera",
  pronombre: "He",
  posesivo: "His",
  firstName: "Mateo",
  lastName: "Herrera Solís",
  age: "16",
  nationality: "Mexican",
  country: "Mexico",
  occupation: "Student",
  phone: "951-118-4027",
  email: "mateo.herrera@correo.mx",
  address: "Calle Morelos 82",
  ciudad: "Oaxaca",
};

export const SOFIA: Personaje = {
  id: "sofia",
  nombre: "Sofía Ramírez Torres",
  nombreCorto: "Sofía Ramírez",
  pronombre: "She",
  posesivo: "Her",
  firstName: "Sofía",
  lastName: "Ramírez Torres",
  age: "17",
  nationality: "Mexican",
  country: "Mexico",
  occupation: "Student",
  phone: "951-204-9316",
  email: "sofia.ramirez@correo.mx",
  address: "Avenida Juárez 130",
  ciudad: "Oaxaca",
};

export const PERSONAJES: Personaje[] = [SOFIA, MATEO];

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 1 — «Llena el formulario»
 *
 * El error que este modo persigue no es no saber el dato, es ponerlo en el
 * campo equivocado: el apellido en «First name», el país en «Nationality», la
 * ciudad en «Address». Por eso cada campo declara, dato por dato, qué se
 * confunde con qué y por qué no es lo mismo.
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Un dato suelto de la ficha: la tarjeta que el alumno arrastra o toca. */
export interface DatoFicha {
  id: string;
  /** Valor tal como se escribiría en el formulario (en inglés cuando aplica). */
  valor: string;
  /** Qué es este dato, en español, para la explicación del error. */
  quees: string;
}

export interface CampoFormulario {
  id: string;
  /** Etiqueta del formulario, en inglés (es lo que el alumno debe reconocer). */
  label: string;
  /** Aclaración corta en español bajo la etiqueta. */
  ayuda: string;
  icono: string;
  /** Id del dato que le corresponde. */
  correcto: string;
  /** Explicación al acertar (en español, con el ejemplo en inglés). */
  porque: string;
  /** Explicación específica para los datos que típicamente se confunden aquí. */
  errores: Record<string, string>;
}

export const DATOS_FICHA: DatoFicha[] = [
  { id: "d-first", valor: "Mateo", quees: "el nombre de pila" },
  { id: "d-last", valor: "Herrera Solís", quees: "los apellidos" },
  { id: "d-age", valor: "16", quees: "la edad" },
  { id: "d-nat", valor: "Mexican", quees: "la nacionalidad (adjetivo)" },
  { id: "d-country", valor: "Mexico", quees: "el país (sustantivo)" },
  { id: "d-occ", valor: "Student", quees: "la ocupación" },
  { id: "d-phone", valor: "951-118-4027", quees: "el número de teléfono" },
  { id: "d-email", valor: "mateo.herrera@correo.mx", quees: "el correo electrónico" },
];

export const CAMPOS_FORMULARIO: CampoFormulario[] = [
  {
    id: "f-first",
    label: "First name",
    ayuda: "Nombre de pila",
    icono: "fa-user",
    correcto: "d-first",
    porque:
      "«First name» (también «Given name») es el nombre de pila, el que va primero: First name: Mateo.",
    errores: {
      "d-last":
        "«Herrera Solís» son los APELLIDOS. En un formulario en inglés van en «Last name» o «Surname», no en «First name». En inglés el orden es al revés que en español: primero el nombre, después el apellido.",
      "d-occ":
        "«Student» no es un nombre, es la ocupación: va en «Occupation». El nombre de pila de esta persona es Mateo.",
      "d-nat":
        "«Mexican» es la nacionalidad, no un nombre. Va en «Nationality».",
    },
  },
  {
    id: "f-last",
    label: "Last name",
    ayuda: "Apellido (también «Surname»)",
    icono: "fa-id-card",
    correcto: "d-last",
    porque:
      "«Last name» y «Surname» significan lo mismo: apellido. Last name: Herrera Solís. En inglés se llama «last» porque va al final del nombre completo: Mateo Herrera Solís.",
    errores: {
      "d-first":
        "«Mateo» es el nombre de pila: va en «First name». «Last name» pide el apellido, que aquí es Herrera Solís.",
      "d-country":
        "«Mexico» es el país, no un apellido. Va en «Country».",
    },
  },
  {
    id: "f-age",
    label: "Age",
    ayuda: "Edad",
    icono: "fa-cake-candles",
    correcto: "d-age",
    porque:
      "«Age» es la edad, y en la oración se dice con el verbo to be: I am 16 years old. Nunca «I have 16 years».",
    errores: {
      "d-phone":
        "951-118-4027 es el número de TELÉFONO: va en «Phone number». Que los dos sean números no los hace el mismo dato.",
    },
  },
  {
    id: "f-nat",
    label: "Nationality",
    ayuda: "Nacionalidad (adjetivo, con mayúscula)",
    icono: "fa-flag",
    correcto: "d-nat",
    porque:
      "La nacionalidad en inglés es un ADJETIVO y siempre lleva mayúscula: Mexican, Canadian, French. Se dice «I'm Mexican».",
    errores: {
      "d-country":
        "«Mexico» es el país (sustantivo), no la nacionalidad. La nacionalidad es el adjetivo que se forma de él: Mexico → Mexican. Se dice «I'm from Mexico» pero «I'm Mexican».",
    },
  },
  {
    id: "f-country",
    label: "Country",
    ayuda: "País",
    icono: "fa-earth-americas",
    correcto: "d-country",
    porque:
      "«Country» es el país: Mexico. El nombre del país también lleva mayúscula en inglés, igual que la nacionalidad.",
    errores: {
      "d-nat":
        "«Mexican» es la nacionalidad, no el nombre del país. El país se escribe Mexico. Regla rápida: detrás de «I'm from» va el país (I'm from Mexico); detrás de «I'm» a secas va la nacionalidad (I'm Mexican).",
    },
  },
  {
    id: "f-occ",
    label: "Occupation",
    ayuda: "Ocupación: a qué te dedicas",
    icono: "fa-briefcase",
    correcto: "d-occ",
    porque:
      "«Occupation» es a qué te dedicas. Se pregunta «What do you do?» y se responde «I'm a student» (con el artículo «a»).",
    errores: {
      "d-nat":
        "«Mexican» es la nacionalidad, no la ocupación. Aquí va lo que la persona hace: Student.",
    },
  },
  {
    id: "f-phone",
    label: "Phone number",
    ayuda: "Número de teléfono",
    icono: "fa-phone",
    correcto: "d-phone",
    porque:
      "«Phone number» es el teléfono. En inglés se dice dígito por dígito: 951-118-4027 → «nine five one, one one eight, four zero two seven».",
    errores: {
      "d-email":
        "Eso es un correo electrónico: lleva @ y va en «Email address». El teléfono es 951-118-4027.",
      "d-age":
        "«16» es la edad, y va en «Age». Un teléfono tiene diez dígitos en México.",
    },
  },
  {
    id: "f-email",
    label: "Email address",
    ayuda: "Correo electrónico",
    icono: "fa-envelope",
    correcto: "d-email",
    porque:
      "«Email address» es el correo. La @ se lee «at» y el punto se lee «dot»: mateo.herrera at correo dot mx.",
    errores: {
      "d-phone":
        "Eso es el teléfono, y va en «Phone number». Un correo siempre lleva @.",
    },
  },
];

/** Texto genérico cuando el error no está declarado campo por campo. */
export function errorGenerico(campo: CampoFormulario, dato: DatoFicha): string {
  return `«${dato.valor}» es ${dato.quees}. El campo «${campo.label}» pide otra cosa: ${campo.ayuda.toLowerCase()}.`;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 2 — «Pregunta y respuesta»
 *
 * Cada opción incorrecta es la respuesta correcta de OTRA pregunta. Así el
 * error no se contesta con «incorrecto», sino con «eso contesta a esta otra
 * pregunta; para la que te hice se dice así».
 * ═══════════════════════════════════════════════════════════════════════════ */

export interface OpcionRespuesta {
  texto: string;
  /** Pregunta que esta respuesta SÍ contesta (para explicar el error). */
  contesta: string;
}

export interface RondaPregunta {
  id: string;
  pregunta: string;
  /** Traducción de la pregunta, en español. */
  traduccion: string;
  opciones: OpcionRespuesta[];
  /** Índice de la respuesta correcta. */
  correcta: number;
  /** Por qué esa es la respuesta (en español). */
  porque: string;
}

export const RONDAS_PREGUNTA: RondaPregunta[] = [
  {
    id: "q-name",
    pregunta: "What's your name?",
    traduccion: "¿Cómo te llamas?",
    opciones: [
      { texto: "My name is Mateo.", contesta: "What's your name?" },
      { texto: "I'm 16 years old.", contesta: "How old are you?" },
      { texto: "I'm from Oaxaca.", contesta: "Where are you from?" },
      { texto: "It's mateo.herrera@correo.mx.", contesta: "What's your email address?" },
    ],
    correcta: 0,
    porque:
      "«What's your name?» pide el nombre. Se responde «My name is…» o simplemente «I'm Mateo».",
  },
  {
    id: "q-age",
    pregunta: "How old are you?",
    traduccion: "¿Cuántos años tienes?",
    opciones: [
      { texto: "I'm Mexican.", contesta: "What's your nationality?" },
      { texto: "I'm 16 years old.", contesta: "How old are you?" },
      { texto: "My name is Mateo.", contesta: "What's your name?" },
      { texto: "I'm a student.", contesta: "What do you do?" },
    ],
    correcta: 1,
    porque:
      "La edad se da con el verbo to be, no con «have»: «I'm 16 years old». Literalmente es «soy 16 años viejo», y aun así es lo correcto en inglés.",
  },
  {
    id: "q-from",
    pregunta: "Where are you from?",
    traduccion: "¿De dónde eres?",
    opciones: [
      { texto: "I'm Mexican.", contesta: "What's your nationality?" },
      { texto: "My address is Calle Morelos 82.", contesta: "What's your address?" },
      { texto: "I'm from Oaxaca, Mexico.", contesta: "Where are you from?" },
      { texto: "I'm 16 years old.", contesta: "How old are you?" },
    ],
    correcta: 2,
    porque:
      "«Where are you from?» pregunta por el origen: ciudad o país. Se responde «I'm from…» y detrás va un LUGAR, no un adjetivo.",
  },
  {
    id: "q-nat",
    pregunta: "What's your nationality?",
    traduccion: "¿Cuál es tu nacionalidad?",
    opciones: [
      { texto: "I'm from Mexico.", contesta: "Where are you from?" },
      { texto: "I'm a student.", contesta: "What do you do?" },
      { texto: "I'm Mexican.", contesta: "What's your nationality?" },
      { texto: "My name is Mateo.", contesta: "What's your name?" },
    ],
    correcta: 2,
    porque:
      "Las dos primeras hablan de México, pero solo una da la NACIONALIDAD: «I'm Mexican» (adjetivo, con mayúscula). «I'm from Mexico» dice de dónde viene, que es otra pregunta.",
  },
  {
    id: "q-job",
    pregunta: "What do you do?",
    traduccion: "¿A qué te dedicas?",
    opciones: [
      { texto: "I'm a student.", contesta: "What do you do?" },
      { texto: "I'm Mexican.", contesta: "What's your nationality?" },
      { texto: "I'm 16 years old.", contesta: "How old are you?" },
      { texto: "I'm from Oaxaca.", contesta: "Where are you from?" },
    ],
    correcta: 0,
    porque:
      "«What do you do?» pregunta por la ocupación. Se responde con el artículo: «I'm a student», «I'm a teacher».",
  },
  {
    id: "q-phone",
    pregunta: "What's your phone number?",
    traduccion: "¿Cuál es tu número de teléfono?",
    opciones: [
      { texto: "It's mateo.herrera@correo.mx.", contesta: "What's your email address?" },
      { texto: "My address is Calle Morelos 82.", contesta: "What's your address?" },
      { texto: "It's 951-118-4027.", contesta: "What's your phone number?" },
      { texto: "I'm 16 years old.", contesta: "How old are you?" },
    ],
    correcta: 2,
    porque:
      "El teléfono se da con «It's…» y se dice dígito por dígito: «nine five one, one one eight, four zero two seven».",
  },
  {
    id: "q-email",
    pregunta: "What's your email address?",
    traduccion: "¿Cuál es tu correo electrónico?",
    opciones: [
      { texto: "It's 951-118-4027.", contesta: "What's your phone number?" },
      { texto: "It's mateo.herrera@correo.mx.", contesta: "What's your email address?" },
      { texto: "I'm from Oaxaca.", contesta: "Where are you from?" },
      { texto: "I'm a student.", contesta: "What do you do?" },
    ],
    correcta: 1,
    porque:
      "El correo también se da con «It's…». La @ se lee «at» y el punto «dot».",
  },
  {
    id: "q-address",
    pregunta: "What's your address?",
    traduccion: "¿Cuál es tu dirección?",
    opciones: [
      { texto: "I'm from Oaxaca, Mexico.", contesta: "Where are you from?" },
      { texto: "It's 951-118-4027.", contesta: "What's your phone number?" },
      { texto: "My address is Calle Morelos 82.", contesta: "What's your address?" },
      { texto: "I'm Mexican.", contesta: "What's your nationality?" },
    ],
    correcta: 2,
    porque:
      "Cuidado con la primera: decir de dónde ERES no es decir dónde VIVES. «Address» pide la calle y el número del domicilio.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 3 — «To be en su sitio»
 *
 * No es clasificar sujetos en tres cubetas: es transformar UNA misma idea. El
 * alumno recibe una consigna («ahora niégalo», «ahora pregúntaselo a ella») y
 * arma la oración pieza por pieza. Al cambiar el sujeto cambia el verbo; al
 * cambiar la forma cambia el ORDEN.
 * ═══════════════════════════════════════════════════════════════════════════ */

export type FormaOracion = "afirmativa" | "negativa" | "interrogativa";

export interface RondaToBe {
  id: string;
  /** Consigna en español: qué hay que decir ahora. */
  consigna: string;
  /** La oración de partida, para que se vea qué cambia. */
  partida: string;
  forma: FormaOracion;
  /** Sujeto de la oración resultante (para la explicación). */
  sujeto: string;
  /** Las piezas EN SU ORDEN correcto. */
  solucion: string[];
  /** Banco de piezas que se le ofrece (incluye distractores). */
  banco: string[];
  /** Traducción de la oración correcta. */
  traduccion: string;
  /** Regla que enseña esta ronda. */
  regla: string;
}

export const RONDAS_TOBE: RondaToBe[] = [
  {
    id: "tb-1",
    consigna: "Mateo habla de sí mismo. Di en inglés: «Soy estudiante.»",
    partida: "—",
    forma: "afirmativa",
    sujeto: "I",
    solucion: ["I", "am", "a", "student"],
    banco: ["is", "a", "student", "I", "are", "am", "not"],
    traduccion: "Soy estudiante.",
    regla: "Con «I» el verbo to be es siempre «am». En inglés la ocupación lleva artículo: a student.",
  },
  {
    id: "tb-2",
    consigna: "Ahora niégalo: «No soy maestro.»",
    partida: "I am a student.",
    forma: "negativa",
    sujeto: "I",
    solucion: ["I", "am", "not", "a", "teacher"],
    banco: ["not", "teacher", "am", "a", "I", "don't", "is"],
    traduccion: "No soy maestro.",
    regla: "La negación del verbo to be se hace con «not» DESPUÉS del verbo: I am not. No se usa «don't» con to be.",
  },
  {
    id: "tb-3",
    consigna: "Ahora habla de Sofía: «Ella tiene diecisiete años.»",
    partida: "I am seventeen years old.",
    forma: "afirmativa",
    sujeto: "She",
    solucion: ["She", "is", "seventeen", "years", "old"],
    banco: ["years", "She", "are", "old", "is", "seventeen", "has"],
    traduccion: "Ella tiene diecisiete años.",
    regla: "Al cambiar el sujeto cambia el verbo: I am → She is. Y la edad va con to be, nunca con «has»: «She is seventeen years old».",
  },
  {
    id: "tb-4",
    consigna: "Ahora pregúntale a ella directamente: «¿Tienes diecisiete años?»",
    partida: "She is seventeen years old.",
    forma: "interrogativa",
    sujeto: "you",
    solucion: ["Are", "you", "seventeen", "years", "old"],
    banco: ["you", "old", "Are", "years", "Do", "seventeen", "Is"],
    traduccion: "¿Tienes diecisiete años?",
    regla: "En la pregunta con to be el verbo se pone ANTES del sujeto: You are… → Are you…? Y con «you» el verbo es «are».",
  },
  {
    id: "tb-5",
    consigna: "Habla de los dos juntos: «Ellos son de Oaxaca.»",
    partida: "She is from Oaxaca.",
    forma: "afirmativa",
    sujeto: "They",
    solucion: ["They", "are", "from", "Oaxaca"],
    banco: ["from", "is", "They", "Oaxaca", "are", "am", "of"],
    traduccion: "Ellos son de Oaxaca.",
    regla: "Con «they» (y con we, you) el verbo es «are». El origen se dice con «from», no con «of».",
  },
  {
    id: "tb-6",
    consigna: "Y ahora pregúntalo: «¿Son de Oaxaca?»",
    partida: "They are from Oaxaca.",
    forma: "interrogativa",
    sujeto: "they",
    solucion: ["Are", "they", "from", "Oaxaca"],
    banco: ["they", "Are", "Oaxaca", "from", "Do", "are", "Is"],
    traduccion: "¿Son de Oaxaca?",
    regla: "Misma regla que antes: el verbo to be salta al principio. They are… → Are they…? Fíjate en que «Are» va con mayúscula porque empieza la oración.",
  },
];

const VERBOS_TOBE = ["am", "is", "are"];
const SUJETOS_TOBE = ["I", "You", "you", "He", "he", "She", "she", "We", "we", "They", "they"];

/**
 * Por qué esa pieza no va aquí. Se explica la REGLA en español y se da el
 * ejemplo correcto en inglés: decir «incorrecto» no enseña nada.
 */
export function explicaTobe(ronda: RondaToBe, pieza: string, pos: number): string {
  const esperada = ronda.solucion[pos] ?? "";
  const correcta = `${ronda.solucion.join(" ")}${ronda.forma === "interrogativa" ? "?" : "."}`;

  if (pieza === "Do" || pieza === "Does" || pieza === "don't") {
    return "Con el verbo to be no se usan do, does ni don't. La pregunta se hace moviendo am/is/are al principio, y la negación se hace con «not» detrás del verbo.";
  }
  if (pieza === "has" || pieza === "have") {
    return "La edad en inglés no se dice con have: se dice con to be. «She is seventeen years old», no «She has seventeen years».";
  }
  if (pieza === "of") {
    return "El origen se dice con «from», no con «of»: I'm from Oaxaca.";
  }
  // En las preguntas el verbo va con mayúscula («Are they…?»), así que se
  // compara en minúsculas: si no, «Is» se colaría hasta el mensaje genérico y
  // el alumno no se enteraría de que el error fue de concordancia.
  if (VERBOS_TOBE.includes(pieza.toLowerCase()) && VERBOS_TOBE.includes(esperada.toLowerCase())) {
    return `Con «${ronda.sujeto}» el verbo to be es «${esperada}», no «${pieza}». La regla completa: am solo con I; is con he, she e it; are con you, we y they.`;
  }
  if (pieza === "not" && esperada !== "not") {
    return "«not» va justo DESPUÉS del verbo to be, no en esta posición: I am not, she is not.";
  }
  if (ronda.forma === "interrogativa" && pos === 0 && SUJETOS_TOBE.includes(pieza)) {
    return `En una pregunta con to be el verbo va ANTES del sujeto. Aquí la oración empieza por «${esperada}»: ${correcta}`;
  }
  if (pos === 0) {
    return `Esta oración no empieza por «${pieza}». Empieza por «${esperada}».`;
  }
  return `Todavía no va «${pieza}». Después de «${ronda.solucion.slice(0, pos).join(" ")}» toca «${esperada}».`;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 4 — «Preséntalo a alguien más» (tercera persona)
 *
 * El salto de «I am…» a «She is… / His name is…» es donde se cae todo el mundo:
 * el alumno sabe el dato, sabe la palabra, y aun así escribe «He name is».
 * Cada oración tiene dos huecos: el que cambia de PERSONA y el que cambia de
 * VERBO o de POSESIVO.
 * ═══════════════════════════════════════════════════════════════════════════ */

export type RanuraTipo = "pronombre" | "posesivo" | "verbo";

/**
 * Las oraciones son PLANTILLAS: `{firstName}`, `{nombreCorto}`, `{age}` y
 * `{email}` se sustituyen con los datos del personaje elegido. Así, al cambiar
 * de personaje, cambia la ficha entera y el alumno tiene que volver a decidir
 * he/his o she/her sobre datos distintos —que es justo lo que se practica.
 */
export interface OracionTercera {
  id: string;
  /** Lo que la persona dice de sí misma, en primera persona (plantilla). */
  primera: string;
  /** Partes del texto; entre ellas van las ranuras (N+1 partes para N ranuras). */
  partes: string[];
  /** Qué hay que poner en cada hueco. */
  ranuras: RanuraTipo[];
  /** Traducción al español (plantilla; `{el}` = «él»/«ella»). */
  traduccion: string;
}

export const ORACIONES_TERCERA: OracionTercera[] = [
  {
    id: "t-1",
    primera: "I am {firstName}.",
    partes: ["", " ", " {firstName}."],
    ranuras: ["pronombre", "verbo"],
    traduccion: "{El} es {firstName}.",
  },
  {
    id: "t-2",
    primera: "My name is {nombreCorto}.",
    partes: ["", " name ", " {nombreCorto}."],
    ranuras: ["posesivo", "verbo"],
    traduccion: "Su nombre (de {el}) es {nombreCorto}.",
  },
  {
    id: "t-3",
    primera: "I am {age} years old.",
    partes: ["", " ", " {age} years old."],
    ranuras: ["pronombre", "verbo"],
    traduccion: "{El} tiene {age} años.",
  },
  {
    id: "t-4",
    primera: "My email address is {email}.",
    partes: ["", " email address ", " {email}."],
    ranuras: ["posesivo", "verbo"],
    traduccion: "Su correo (de {el}) es {email}.",
  },
  {
    id: "t-5",
    primera: "I am not from Puebla.",
    partes: ["", " ", " not from Puebla."],
    ranuras: ["pronombre", "verbo"],
    traduccion: "{El} no es de Puebla.",
  },
];

/** Sustituye los datos del personaje en una plantilla de este modo. */
export function rellena(plantilla: string, p: Personaje): string {
  const el = p.pronombre === "He" ? "él" : "ella";
  return plantilla
    .replace(/\{firstName\}/g, p.firstName)
    .replace(/\{nombreCorto\}/g, p.nombreCorto)
    .replace(/\{age\}/g, p.age)
    .replace(/\{email\}/g, p.email)
    .replace(/\{El\}/g, el.charAt(0).toUpperCase() + el.slice(1))
    .replace(/\{el\}/g, el);
}

/** Opciones que se ofrecen en cada tipo de ranura (el orden es el que se ve). */
export const OPCIONES_RANURA: Record<RanuraTipo, string[]> = {
  pronombre: ["He", "She", "His", "Her"],
  posesivo: ["He", "She", "His", "Her"],
  verbo: ["am", "is", "are"],
};

/**
 * La palabra correcta de cada ranura, según el personaje.
 * Todas las oraciones de este modo son afirmativas o negativas en 3.ª persona
 * del singular, así que el verbo siempre es «is».
 */
export function palabraCorrecta(tipo: RanuraTipo, p: Personaje): string {
  if (tipo === "pronombre") return p.pronombre;
  if (tipo === "posesivo") return p.posesivo;
  return "is";
}

/** «He» → «él», «Her» → «de ella»: el significado en español de cada palabra. */
const GLOSA: Record<string, string> = {
  He: "él",
  She: "ella",
  His: "su (de él)",
  Her: "su (de ella)",
};

/** Por qué esa palabra y no la que eligió el alumno. */
export function explicaTercera(tipo: RanuraTipo, elegida: string, p: Personaje): string {
  const buena = palabraCorrecta(tipo, p);
  const suyo = p.pronombre === "He" ? "él" : "ella";

  if (tipo === "verbo") {
    if (elegida === "am")
      return `«am» solo se usa con «I». Al hablar de ${p.firstName} el sujeto es «${p.pronombre}», y con he, she e it el verbo es «is».`;
    return `«are» va con you, we y they. «${p.pronombre}» es tercera persona del singular, así que el verbo es «is».`;
  }

  if (tipo === "pronombre") {
    if (elegida === "His" || elegida === "Her")
      return `«${elegida}» es un posesivo: significa «${GLOSA[elegida]}» y siempre va delante de un sustantivo. Aquí hace falta el SUJETO de la oración: «${buena}».`;
    return `«${elegida}» significa «${GLOSA[elegida]}». ${p.nombre} es ${suyo}, así que aquí va «${buena}».`;
  }

  if (elegida === "He" || elegida === "She")
    return `«${elegida}» significa «${GLOSA[elegida]}» y es un pronombre de SUJETO. Para decir «su nombre» hace falta el posesivo: «${buena} name». El error clásico es escribir «He name is…», que en inglés no existe.`;
  return `«${elegida}» significa «${GLOSA[elegida]}». Estamos hablando de ${p.nombre}, así que se dice «${buena}».`;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 5 — «Escribe el término» (glosario A6 + campos de formulario de A1)
 *
 * Aquí el término que se escribe es VOCABULARIO en inglés (la etiqueta del
 * campo), no una estructura gramatical: la definición va en español y el
 * ejemplo en inglés. Los paréntesis declaran los sinónimos que también valen.
 * ═══════════════════════════════════════════════════════════════════════════ */

export const GLOSARIO: ParTermino[] = [
  {
    id: "g-first",
    termino: "First name (Given name)",
    definicion: "Nombre de pila: el que va primero en un formulario en inglés.",
    ejemplo: "First name: Ana. Last name: García.",
  },
  {
    id: "g-last",
    termino: "Last name (Surname)",
    definicion: "Apellido. En muchos formularios aparece con dos nombres distintos que significan lo mismo.",
    ejemplo: "Last name: Herrera Solís.",
  },
  {
    id: "g-age",
    termino: "Age",
    definicion: "Edad. En la oración se dice con el verbo to be, no con «have».",
    ejemplo: "Age: 16. — I'm 16 years old.",
  },
  {
    id: "g-nat",
    termino: "Nationality",
    definicion: "Nacionalidad. En inglés es un adjetivo y siempre se escribe con mayúscula.",
    ejemplo: "My nationality is Mexican.",
  },
  {
    id: "g-addr",
    termino: "Address",
    definicion: "Dirección o domicilio: calle y número.",
    ejemplo: "My address is Calle Hidalgo 45.",
  },
  {
    id: "g-mail",
    termino: "Email address (Email)",
    definicion: "Correo electrónico. La @ se lee «at» y el punto se lee «dot».",
    ejemplo: "My email is ana@correo.com.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * Contenido verbatim de la progresión
 * ═══════════════════════════════════════════════════════════════════════════ */

/** IN-I-P04-A5 · True or False — About me (verbatim). */
export const HECHOS: { enunciado: string; respuesta: boolean; retro: string }[] = [
  {
    enunciado: "En inglés las nacionalidades se escriben con mayúscula.",
    respuesta: true,
    retro: "Correcto: Mexican, Canadian, French.",
  },
  {
    enunciado: "La edad se expresa con 'have' (I have 17 years).",
    respuesta: false,
    retro: "Se usa 'to be': 'I am 17 years old'.",
  },
  {
    enunciado: "'Surname' es sinónimo de 'Last name'.",
    respuesta: true,
    retro: "Ambos significan apellido.",
  },
  {
    enunciado: "Los números de teléfono se dicen dígito por dígito en inglés.",
    respuesta: true,
    retro: "Correcto: 'five five, one two...'.",
  },
];

/** IN-I-P04-A1 · preguntas de comprensión (verbatim). */
export const COMPRENSION_A1: { pregunta: string; guia: string }[] = [
  { pregunta: "¿Cómo preguntas la edad de alguien en inglés?", guia: "How old are you?" },
  {
    pregunta: "¿Por qué 'Mexican' se escribe con mayúscula en inglés?",
    guia: "Porque en inglés las nacionalidades y gentilicios siempre llevan mayúscula.",
  },
  { pregunta: "¿Qué significa 'Last name' en un formulario?", guia: "Apellido." },
];

/** IN-I-P04-A3 · consigna de la reflexión escrita (verbatim). */
export const CONSIGNA_A3 = {
  prompt:
    "Imagina que llenas una solicitud de inscripción a un curso de verano en inglés. Escribe los datos que pedirían (nombre, apellido, edad, nacionalidad, dirección, teléfono, correo). Usa el formato de formulario. Luego reflexiona en español: ¿en qué situaciones reales de tu vida podrías necesitar dar información personal en inglés?",
  pistas: [
    "First name: / Last name: / Age: / Nationality: / Address: / Phone: / Email:",
    "¿Has visto formularios en inglés en aplicaciones, redes sociales o videojuegos?",
    "¿Qué datos son públicos y cuáles deberías proteger?",
  ],
};

/** IN-I-P04-A6 · actividad final del glosario (verbatim). */
export const ACTIVIDAD_FINAL_A6 = "Llena una mini-ficha personal en inglés con 5 datos.";

/** IN-I-P04-A4 · Personal information — Quiz (verbatim). */
export const RETO_QUIZ: QuizEvaluable = {
  titulo: "Personal information — Quiz",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "¿Cómo preguntas la edad de alguien?",
      opciones: ["How old are you?", "What's your age old?", "How many years you?", "When are you?"],
      respuestaCorrecta: 0,
      retroalimentacion: "'How old are you?' = ¿cuántos años tienes?",
    },
    {
      enunciado: "En un formulario, 'Last name' significa:",
      opciones: ["nombre", "apellido", "edad", "dirección"],
      respuestaCorrecta: 1,
      retroalimentacion: "'Last name / Surname' = apellido.",
    },
    {
      enunciado: "¿Cuál es correcto?",
      opciones: ["I have 17 years.", "I am 17 years old.", "I am 17 years.", "My age 17."],
      respuestaCorrecta: 1,
      retroalimentacion: "La edad se da con 'to be': 'I am 17 years old'.",
    },
    {
      enunciado: "'I'm Mexican.' La palabra 'Mexican' se escribe:",
      opciones: ["con minúscula", "con mayúscula", "en plural", "con guion"],
      respuestaCorrecta: 1,
      retroalimentacion: "En inglés las nacionalidades llevan mayúscula: Mexican, American.",
    },
    {
      enunciado: "¿Cómo preguntas de dónde es alguien?",
      opciones: ["Where you from?", "Where are you from?", "From where you?", "What are you from?"],
      respuestaCorrecta: 1,
      retroalimentacion: "'Where are you from?'",
    },
  ],
};
