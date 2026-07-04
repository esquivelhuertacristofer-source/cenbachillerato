/**
 * Datos del Laboratorio — Relaciones de poder e interseccionalidad
 * (CS-II-P04, Ciencias Sociales II).
 *
 * Contenido VERBATIM de CS-II·P04 ("Poder, desigualdad y sus estructuras en la
 * sociedad" / "Clase, género, etnia y edad como categorías de análisis"). Las
 * definiciones, los ejemplos y las afirmaciones se toman literalmente de las
 * actividades A1 (lectura), A2 (quiz de opción múltiple), A4 (V/F) y A5
 * (glosario interactivo). Los ejemplos a clasificar son casos que las propias
 * actividades describen explícitamente como discriminación por clase, género,
 * etnia o edad.
 */

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 1 — ¿Clase, género, etnia o edad? (clasifica por categoría de análisis)
 * ───────────────────────────────────────────────────────────────────────── */
export type Categoria = "clase" | "genero" | "etnia" | "edad";

export const CATEGORIA_INFO: Record<
  Categoria,
  { titulo: string; subtitulo: string; icono: string }
> = {
  clase: {
    titulo: "Clase social",
    subtitulo: "Desigualdad según el nivel socioeconómico. El clasismo es la discriminación o prejuicio basado en la clase social de una persona.",
    icono: "fa-coins",
  },
  genero: {
    titulo: "Género",
    subtitulo: "Desigualdad según el género. El patriarcado es una estructura donde los hombres tienen mayor poder y privilegios sistémicos.",
    icono: "fa-venus-mars",
  },
  etnia: {
    titulo: "Etnia",
    subtitulo: "Desigualdad según el origen étnico. En México afecta de forma estructural a las poblaciones indígenas.",
    icono: "fa-people-group",
  },
  edad: {
    titulo: "Edad",
    subtitulo: "Desigualdad según la edad de la persona: discriminación que se ejerce por razones de edad.",
    icono: "fa-hourglass-half",
  },
};

export const EJEMPLOS: { id: string; texto: string; categoria: Categoria }[] = [
  { id: "ej-clase", texto: "El clasismo: discriminación o prejuicio basado en la clase social o nivel socioeconómico de una persona", categoria: "clase" },
  { id: "ej-clase2", texto: "El 22% de la población en pobreza frente al 1.7% de clase alta (CONEVAL 2022)", categoria: "clase" },
  { id: "ej-genero", texto: "El patriarcado: estructura donde los hombres tienen mayor poder y privilegios sistémicos", categoria: "genero" },
  { id: "ej-genero2", texto: "La brecha salarial por género", categoria: "genero" },
  { id: "ej-etnia", texto: "Las poblaciones indígenas con menor acceso a salud y educación de calidad", categoria: "etnia" },
  { id: "ej-etnia2", texto: "La menor cobertura de servicios de salud y educación en comunidades indígenas", categoria: "etnia" },
  { id: "ej-edad", texto: "La discriminación por razones de edad", categoria: "edad" },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 2 — Empareja concepto y definición (conceptos clave de A1/A2, verbatim)
 * ───────────────────────────────────────────────────────────────────────── */
export const CONCEPTOS: { id: string; concepto: string; definicion: string; ejemplo: string }[] = [
  {
    id: "co-poder",
    concepto: "Poder (Weber)",
    definicion: "La probabilidad de imponer la propia voluntad dentro de una relación social, incluso contra la resistencia de otros.",
    ejemplo: "El poder no es solo la capacidad de ordenar, sino también la de ser obedecido.",
  },
  {
    id: "co-interseccionalidad",
    concepto: "Interseccionalidad",
    definicion: "La forma en que múltiples categorías (género, clase, etnia) se combinan y crean experiencias únicas de desigualdad.",
    ejemplo: "Concepto desarrollado por la jurista Kimberlé Crenshaw: la posición social no la determina una sola característica.",
  },
  {
    id: "co-clasismo",
    concepto: "Clasismo",
    definicion: "La discriminación o prejuicio basado en la clase social o nivel socioeconómico de una persona.",
    ejemplo: "Tratar de forma desigual a alguien por su situación económica.",
  },
  {
    id: "co-patriarcado",
    concepto: "Patriarcado",
    definicion: "Un sistema de organización social donde los hombres tienen mayor poder y privilegios sistémicos sobre las mujeres.",
    ejemplo: "Se manifiesta, por ejemplo, en la brecha salarial por género.",
  },
  {
    id: "co-capcultural",
    concepto: "Capital cultural (Bourdieu)",
    definicion: "El conjunto de conocimientos, habilidades, títulos educativos y disposiciones que facilitan el acceso a posiciones sociales privilegiadas.",
    ejemplo: "Se hereda y acumula de manera desigual, perpetuando la desigualdad de generación en generación.",
  },
  {
    id: "co-capsocial",
    concepto: "Capital social (Bourdieu)",
    definicion: "Las redes de relaciones y contactos que permiten acceder a recursos e información.",
    ejemplo: "Quienes nacen en familias con más redes de contacto tienen ventajas acumulativas.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 3 — Empareja término y definición (glosario A5, verbatim)
 * ───────────────────────────────────────────────────────────────────────── */
export const PARES: { id: string; termino: string; definicion: string; ejemplo: string }[] = [
  {
    id: "gl-poder",
    termino: "Relaciones de poder",
    definicion: "Vínculos en los que unas personas o grupos influyen, deciden o controlan sobre otros dentro de la sociedad.",
    ejemplo: "La autoridad de un gobierno o la jerarquía en un centro de trabajo.",
  },
  {
    id: "gl-hegemonia",
    termino: "Hegemonía",
    definicion: "Dominio o liderazgo de un grupo que se sostiene mediante consensos, no solo por la fuerza.",
    ejemplo: "Ideas que se vuelven «de sentido común» y benefician a un grupo.",
  },
  {
    id: "gl-interseccionalidad",
    termino: "Interseccionalidad",
    definicion: "Enfoque que estudia cómo se cruzan distintas desigualdades (clase, género, raza, origen étnico, orientación sexual, edad) en una persona.",
    ejemplo: "Una mujer indígena de bajos ingresos enfrenta varias desigualdades a la vez.",
  },
  {
    id: "gl-modos",
    termino: "Modos de producción",
    definicion: "Maneras en que una sociedad organiza la producción de bienes y las relaciones de trabajo.",
    ejemplo: "Incluye también los trabajos del hogar y de cuidados que sostienen la economía.",
  },
  {
    id: "gl-degradacion",
    termino: "Degradación ambiental",
    definicion: "Deterioro de la naturaleza causado por la actividad humana y ciertos modelos de desarrollo.",
    ejemplo: "Contaminación de ríos o deforestación por la sobreexplotación.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * Cuestionario de comprensión (V/F de A4, verbatim).
 * Renderizado como opción doble Verdadero / Falso.
 * ───────────────────────────────────────────────────────────────────────── */
export const QUIZ: {
  pregunta: string;
  opciones: [string, string];
  correcta: 0 | 1;
  retro: string;
}[] = [
  {
    pregunta: "Las relaciones de poder atraviesan instituciones y prácticas sociales, donde las personas cumplen distintos roles.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto: el poder se ejerce en familias, escuelas, trabajo y gobierno.",
  },
  {
    pregunta: "La interseccionalidad analiza cómo se combinan desigualdades por clase, género, raza, origen étnico, orientación sexual y edad.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto: varias formas de desigualdad pueden cruzarse en una misma persona.",
  },
  {
    pregunta: "Los trabajos del hogar y de cuidados no tienen relación con los modos de producción ni con los modelos de desarrollo.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "Sí se relacionan: sostienen la fuerza de trabajo y el funcionamiento de la economía.",
  },
  {
    pregunta: "El modelo de desarrollo puede provocar degradación ambiental y afectar la relación entre sociedad y naturaleza.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto: ciertos modos de producción degradan el ambiente.",
  },
];

/** Dato verbatim de la lectura A1 (coeficiente de Gini de México). */
export const DATO_PODER =
  "En México, el coeficiente de Gini —medida de desigualdad donde 0 es perfecta igualdad y 1 es desigualdad absoluta— fue de 0.41 en 2022 según CONEVAL, lo que ubica a México entre los países de mayor desigualdad económica en América Latina.";
