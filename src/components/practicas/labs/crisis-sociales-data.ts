/**
 * Datos del Laboratorio — Causas y actores de las crisis sociales en México
 * (CS-III-P01, Ciencias Sociales III).
 *
 * Contenido VERBATIM de CS-III·P01 ("Causas y actores de las crisis sociales en
 * México"). Los elementos a clasificar (causas estructurales, actores y
 * consecuencias) se toman de la lectura A1 sobre la pandemia de COVID-19; los
 * roles de cada actor también de A1; el glosario de A5 (verbatim) y el
 * cuestionario V/F de A4 (verbatim).
 */

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 1 — ¿Causa, actor o consecuencia? (clasifica los elementos de la crisis)
 *
 * La lectura A1 cierra con el principio de ciencias sociales de que «las crisis
 * nunca son solo naturales o accidentales»: distingue las CAUSAS ESTRUCTURALES
 * (estructuras previas), los ACTORES SOCIALES (con intereses distintos) y las
 * CONSECUENCIAS (cómo se vivió la crisis de forma diferenciada).
 * ───────────────────────────────────────────────────────────────────────── */
export type Categoria = "causa" | "actor" | "consecuencia";

export const CATEGORIA_INFO: Record<
  Categoria,
  { titulo: string; subtitulo: string; icono: string }
> = {
  causa: {
    titulo: "Causa estructural",
    subtitulo: "Condición de fondo previa (desigualdad, falta de servicios universales, informalidad laboral) que determina la vulnerabilidad ante la crisis.",
    icono: "fa-layer-group",
  },
  actor: {
    titulo: "Actor social",
    subtitulo: "Individuo, grupo, organización o institución con intereses, recursos y capacidad de acción frente a la crisis.",
    icono: "fa-users",
  },
  consecuencia: {
    titulo: "Consecuencia",
    subtitulo: "Efecto diferenciado de la crisis: determina quién sobrevive, quién pierde más y quién tiene voz para exigir respuestas.",
    icono: "fa-chart-line",
  },
};

export const ELEMENTOS: { id: string; texto: string; categoria: Categoria }[] = [
  // Causas estructurales (verbatim de la escala nacional en A1)
  { id: "el-c1", texto: "Aproximadamente el 55% de la fuerza laboral en la informalidad, sin seguro médico ni prestaciones de desempleo", categoria: "causa" },
  { id: "el-c2", texto: "Un sistema de salud público fragmentado (IMSS, ISSSTE e INSABI)", categoria: "causa" },
  { id: "el-c3", texto: "Altos niveles de enfermedades crónicas comórbidas como diabetes e hipertensión en sectores populares", categoria: "causa" },
  // Actores sociales (verbatim de A1)
  { id: "el-a1", texto: "El Estado mexicano: gobierno federal, gobiernos estatales y secretarías de salud", categoria: "actor" },
  { id: "el-a2", texto: "La sociedad civil: organizaciones comunitarias, colectivos feministas y redes de apoyo mutuo", categoria: "actor" },
  { id: "el-a3", texto: "Los organismos internacionales (OPS, OMS, UNICEF)", categoria: "actor" },
  // Consecuencias (verbatim de las escalas nacional y local en A1)
  { id: "el-x1", texto: "Una de las tasas de exceso de mortalidad más altas del mundo durante 2020-2021", categoria: "consecuencia" },
  { id: "el-x2", texto: "El hacinamiento en colonias populares impidió el confinamiento", categoria: "consecuencia" },
  { id: "el-x3", texto: "Las mujeres soportaron mayor carga de cuidados, más violencia intrafamiliar y pérdida de empleo más pronunciada", categoria: "consecuencia" },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 2 — Empareja actor social y su papel en la crisis (A1, verbatim)
 * ───────────────────────────────────────────────────────────────────────── */
export const ACTORES: { id: string; actor: string; rol: string; ejemplo: string }[] = [
  {
    id: "ac-estado",
    actor: "El Estado mexicano",
    rol: "Diseñó medidas de contención y apoyos económicos parciales.",
    ejemplo: "Programas de Bienestar y Sembrando Vida, que continuaron operando durante la pandemia.",
  },
  {
    id: "ac-civil",
    actor: "La sociedad civil",
    rol: "Llenó vacíos donde el Estado llegaba tarde o no llegaba.",
    ejemplo: "Organizaciones comunitarias, colectivos feministas y redes de apoyo mutuo.",
  },
  {
    id: "ac-empresarial",
    actor: "El sector empresarial",
    rol: "Negoció condiciones para la reapertura económica.",
    ejemplo: "Acuerdos sobre los términos y tiempos de la reactivación de la actividad productiva.",
  },
  {
    id: "ac-organismos",
    actor: "Los organismos internacionales",
    rol: "Orientaron la política sanitaria y el acceso a vacunas.",
    ejemplo: "La OPS, la OMS y UNICEF coordinaron respuestas y guías sanitarias.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 3 — Empareja término y definición (glosario A5, verbatim)
 * ───────────────────────────────────────────────────────────────────────── */
export const PARES: { id: string; termino: string; definicion: string; ejemplo: string }[] = [
  {
    id: "gl-crisis",
    termino: "Crisis social",
    definicion: "Situación de ruptura o tensión grave en los vínculos, instituciones o condiciones de vida de una sociedad, que afecta la cohesión y el bienestar colectivo.",
    ejemplo: "La crisis sanitaria del COVID-19 expuso y profundizó desigualdades preexistentes en el acceso a la salud en México y el mundo.",
  },
  {
    id: "gl-causa",
    termino: "Causa estructural",
    definicion: "Factor de fondo, profundo y duradero —económico, político, cultural o histórico— que origina o agrava una crisis, más allá de sus detonantes inmediatos.",
    ejemplo: "La falta de acceso a agua potable en comunidades rurales no es un accidente: responde a causas estructurales como el modelo de distribución de recursos y la exclusión histórica.",
  },
  {
    id: "gl-escala",
    termino: "Escala de análisis",
    definicion: "Nivel territorial o social desde el que se observa un fenómeno: local, regional, nacional o global. El mismo problema puede verse diferente según la escala elegida.",
    ejemplo: "La deforestación en una comunidad (escala local) es también parte de la crisis climática global (escala planetaria).",
  },
  {
    id: "gl-actor",
    termino: "Actor social",
    definicion: "Individuo, grupo, organización o institución que tiene intereses, recursos y capacidad de acción frente a una situación social determinada.",
    ejemplo: "En una crisis de violencia, los actores incluyen al gobierno, las víctimas, las organizaciones de derechos humanos, los medios de comunicación y los grupos armados.",
  },
  {
    id: "gl-violencia",
    termino: "Violencia estructural",
    definicion: "Forma de violencia invisible inscrita en las estructuras económicas, políticas y sociales que produce sufrimiento sin necesidad de un agresor directo identificable.",
    ejemplo: "Un adolescente que abandona la escuela por necesidad económica es víctima de violencia estructural: el sistema genera esa exclusión de forma silenciosa.",
  },
  {
    id: "gl-multiescalar",
    termino: "Perspectiva multiescalar",
    definicion: "Enfoque analítico que conecta distintos niveles de la realidad social —desde lo cotidiano hasta lo global— para comprender un fenómeno de manera integral.",
    ejemplo: "Analizar el desempleo juvenil requiere mirar políticas macroeconómicas globales, políticas nacionales de empleo y la situación laboral concreta de jóvenes en una ciudad específica.",
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
    pregunta: "Las crisis sociales siempre tienen una sola causa y se pueden explicar desde una única escala de análisis (local, nacional o global).",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "Falso. Las crisis son multicausales y multiescalares: una pandemia, por ejemplo, combina factores biológicos, económicos, políticos y culturales que operan simultáneamente a escala local, nacional y global.",
  },
  {
    pregunta: "La desigualdad económica estructural puede aumentar la vulnerabilidad de ciertos grupos sociales ante crisis sanitarias o ambientales.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto. Las condiciones de pobreza, falta de acceso a servicios de salud y vivienda precaria amplifican el impacto de una crisis sanitaria o ambiental en los sectores más marginados.",
  },
  {
    pregunta: "Los actores involucrados en una crisis social se limitan exclusivamente a los gobiernos y organismos internacionales.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "Falso. Los actores de una crisis son múltiples: Estado, organizaciones civiles, empresas, comunidades afectadas, medios de comunicación y organismos internacionales, entre otros. Cada uno tiene intereses y capacidades distintas.",
  },
  {
    pregunta: "El análisis de una crisis ambiental desde múltiples escalas implica considerar tanto decisiones locales (uso del suelo, consumo) como acuerdos internacionales (COP, Acuerdo de París).",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto. La perspectiva multiescalar reconoce que los problemas ambientales como el cambio climático se producen y se abordan de manera interconectada en distintos niveles territoriales y de gobierno.",
  },
  {
    pregunta: "La violencia estructural es aquella que emerge únicamente de conflictos armados entre grupos y no tiene relación con las condiciones económicas o políticas de una sociedad.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "Falso. Johan Galtung define la violencia estructural como la violencia «silenciosa» inscrita en las instituciones y estructuras sociales —pobreza, discriminación, exclusión— que impide a las personas desarrollar su potencial.",
  },
];

/** Dato verbatim de la lectura A1 (principio de las ciencias sociales). */
export const DATO_CRISIS =
  "Las crisis nunca son solo naturales o accidentales: son el resultado de estructuras previas —desigualdad, falta de servicios públicos universales, informalidad laboral— que determinan quién sobrevive, quién pierde más y quién tiene voz para exigir respuestas.";
