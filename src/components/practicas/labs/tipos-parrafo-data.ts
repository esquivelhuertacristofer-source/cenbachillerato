/**
 * Datos del laboratorio "Taller de párrafos" (LC-I-P04-A2).
 *
 * Módulo de datos PURO (sin three, sin React): contenido alineado VERBATIM a la
 * lectura A1 «Los párrafos y su función en el texto» (LC-I·P04), el quiz A2
 * «¿Qué tipo de párrafo es este?» y el glosario A6, de Lengua y Comunicación I.
 *
 * Los tipos de párrafo por función (introductorio, de desarrollo, de conclusión),
 * los conectores por relación (adición, contraste, causa-consecuencia) y el quiz
 * se toman literalmente del texto de las actividades. Los párrafos-ejemplo son
 * material didáctico elaborado para clasificar/ordenar (como la propia lectura,
 * "Material elaborado para CEN Bachillerato").
 */

/* ── Modo «Clasifica los párrafos» (por función) ───────────────────────── */
// Verbatim A1: "El párrafo introductorio presenta el tema del texto y anuncia lo
// que se desarrollará. El párrafo de desarrollo amplía, explica o argumenta una
// idea. El párrafo de conclusión cierra el texto retomando las ideas principales."
export type Funcion = "introductorio" | "desarrollo" | "conclusion";

export const FUNCION_INFO: Record<Funcion, { label: string; descripcion: string; icono: string; color: string }> = {
  introductorio: { label: "Introductorio", descripcion: "Presenta el tema y anuncia lo que se desarrollará.", icono: "fa-door-open", color: "#5BA8FF" },
  desarrollo: { label: "De desarrollo", descripcion: "Amplía, explica o argumenta una idea.", icono: "fa-arrows-left-right-to-line", color: "#34D399" },
  conclusion: { label: "De conclusión", descripcion: "Cierra el texto retomando las ideas principales.", icono: "fa-flag-checkered", color: "#C792EA" },
};

export interface Parrafo {
  id: string;
  texto: string;
  funcion: Funcion;
  pista: string; // marca lingüística que delata su función
}

export const PARRAFOS: Parrafo[] = [
  {
    id: "p1",
    texto: "En este texto hablaremos sobre los beneficios de leer todos los días. Veremos cómo la lectura mejora el vocabulario, la concentración y la imaginación.",
    funcion: "introductorio",
    pista: "«hablaremos…», «veremos…»: anuncia lo que viene.",
  },
  {
    id: "p2",
    texto: "El reciclaje es un tema que preocupa a muchas comunidades. A continuación explicaremos qué es, cómo se hace y por qué importa.",
    funcion: "introductorio",
    pista: "«a continuación explicaremos…»: presenta el tema.",
  },
  {
    id: "p3",
    texto: "Leer amplía el vocabulario porque nos expone a palabras nuevas en contexto. Además, al encontrar términos desconocidos, deducimos su significado y los incorporamos a nuestra forma de hablar.",
    funcion: "desarrollo",
    pista: "«porque…», «además…»: explica y amplía una idea.",
  },
  {
    id: "p4",
    texto: "Separar los residuos es sencillo: los orgánicos van en un recipiente y los inorgánicos en otro. También conviene enjuagar los envases para evitar malos olores.",
    funcion: "desarrollo",
    pista: "Detalla y amplía cómo se hace algo.",
  },
  {
    id: "p5",
    texto: "En conclusión, leer a diario transforma poco a poco nuestra manera de pensar. Por lo tanto, vale la pena reservar unos minutos cada día para hacerlo.",
    funcion: "conclusion",
    pista: "«en conclusión…», «por lo tanto…»: cierra el texto.",
  },
  {
    id: "p6",
    texto: "En resumen, el reciclaje beneficia al ambiente y a la comunidad. Si todos participamos, el impacto será mucho mayor.",
    funcion: "conclusion",
    pista: "«en resumen…»: retoma las ideas principales.",
  },
];

/* ── Modo «Clasifica los conectores» ───────────────────────────────────── */
// Verbatim A1: "Algunos conectores indican adición (además, también, igualmente),
// otros indican contraste (sin embargo, aunque, no obstante), y otros indican
// causa o consecuencia (porque, por lo tanto, en consecuencia)."
export type Relacion = "adicion" | "contraste" | "causa";

export const RELACION_INFO: Record<Relacion, { label: string; descripcion: string; icono: string; color: string }> = {
  adicion: { label: "Adición", descripcion: "Suman información.", icono: "fa-plus", color: "#34D399" },
  contraste: { label: "Contraste", descripcion: "Oponen ideas.", icono: "fa-arrows-turn-to-dots", color: "#F2A33C" },
  causa: { label: "Causa-consecuencia", descripcion: "Relacionan causa y efecto.", icono: "fa-arrow-right-long", color: "#5BA8FF" },
};

export interface Conector {
  id: string;
  texto: string;
  relacion: Relacion;
}

export const CONECTORES: Conector[] = [
  { id: "c-ademas", texto: "además", relacion: "adicion" },
  { id: "c-tambien", texto: "también", relacion: "adicion" },
  { id: "c-igualmente", texto: "igualmente", relacion: "adicion" },
  { id: "c-sinembargo", texto: "sin embargo", relacion: "contraste" },
  { id: "c-aunque", texto: "aunque", relacion: "contraste" },
  { id: "c-noobstante", texto: "no obstante", relacion: "contraste" },
  { id: "c-porque", texto: "porque", relacion: "causa" },
  { id: "c-porlotanto", texto: "por lo tanto", relacion: "causa" },
  { id: "c-enconsecuencia", texto: "en consecuencia", relacion: "causa" },
];

/* ── Modo «Arma el texto» (ordenar párrafos) ───────────────────────────── */
// Un texto coherente sigue el orden introductorio → desarrollo → conclusión.
export interface Texto {
  id: string;
  titulo: string;
  /** Párrafos en su ORDEN correcto (intro → desarrollo → conclusión). */
  parrafos: { id: string; texto: string; funcion: Funcion }[];
}

export const TEXTOS: Texto[] = [
  {
    id: "t-lectura",
    titulo: "Leer todos los días",
    parrafos: [
      { id: "tl1", texto: "Leer a diario es un hábito al alcance de cualquiera. En este texto veremos por qué conviene y cómo empezar.", funcion: "introductorio" },
      { id: "tl2", texto: "La lectura amplía el vocabulario y mejora la concentración, porque exige seguir un hilo de ideas. Además, despierta la imaginación.", funcion: "desarrollo" },
      { id: "tl3", texto: "En conclusión, dedicar unos minutos diarios a leer fortalece el pensamiento. Por lo tanto, vale la pena convertirlo en costumbre.", funcion: "conclusion" },
    ],
  },
  {
    id: "t-agua",
    titulo: "Cuidar el agua",
    parrafos: [
      { id: "ta1", texto: "El agua es un recurso indispensable y limitado. A continuación explicaremos por qué cuidarla es tarea de todos.", funcion: "introductorio" },
      { id: "ta2", texto: "Cerrar la llave al lavarnos los dientes ahorra litros cada día. También ayuda reparar fugas y reutilizar el agua de lluvia.", funcion: "desarrollo" },
      { id: "ta3", texto: "En resumen, pequeños cambios diarios suman un gran ahorro. Si todos participamos, el impacto será mucho mayor.", funcion: "conclusion" },
    ],
  },
];

/* ── Cuestionario (verbatim del quiz A2) ───────────────────────────────── */
export interface QuizItem {
  pregunta: string;
  opciones: string[];
  correcta: number;
  retro: string;
}

export const QUIZ: QuizItem[] = [
  {
    pregunta: "¿Qué es la oración temática de un párrafo?",
    opciones: ["La oración más larga del párrafo", "La que expresa la idea principal", "La primera oración siempre", "La oración con más adjetivos"],
    correcta: 1,
    retro: "La oración temática expresa la idea principal; puede estar al inicio, al final o en medio.",
  },
  {
    pregunta: "¿Qué tipo de párrafo presenta el tema del texto?",
    opciones: ["Párrafo de desarrollo", "Párrafo de conclusión", "Párrafo introductorio", "Párrafo descriptivo"],
    correcta: 2,
    retro: "El párrafo introductorio presenta el tema y anticipa lo que se desarrollará.",
  },
  {
    pregunta: "¿Qué conector indica contraste?",
    opciones: ["Además", "Por lo tanto", "Sin embargo", "También"],
    correcta: 2,
    retro: "«Sin embargo» es un conector de contraste que introduce una idea opuesta a la anterior.",
  },
  {
    pregunta: "¿Cuál es la función del párrafo de conclusión?",
    opciones: ["Presentar el tema", "Ampliar las ideas principales", "Cerrar el texto retomando las ideas centrales", "Agregar información nueva"],
    correcta: 2,
    retro: "El párrafo de conclusión cierra el texto sintetizando las ideas más importantes.",
  },
  {
    pregunta: "El conector «por lo tanto» indica:",
    opciones: ["Adición de ideas", "Contraste", "Consecuencia", "Tiempo"],
    correcta: 2,
    retro: "«Por lo tanto» indica que lo que sigue es una consecuencia de lo anterior.",
  },
];

/** Dato verbatim del callout de A1. */
export const DATO_PARRAFOS =
  "El español de México incorpora más de 10,000 voces de origen náhuatl que usamos a diario: chocolate, tomate, aguacate, chile, copal, petate, chicle, guajolote. Estas palabras cruzaron el Atlántico y hoy forman parte del español global y de decenas de otros idiomas.";
