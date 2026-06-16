/**
 * Datos del laboratorio 3D "El origen de la vida: hipótesis científicas"
 * (CNEYT-VI-P01). Módulo PURO: no importa three ni @react-three (debe poder
 * entrar en el bundle sin inflar el Worker de Cloudflare).
 *
 * Todo el contenido textual marcado «verbatim» proviene de las actividades de
 * la progresión P01: la lectura A1 (definiciones de las hipótesis, preguntas de
 * comprensión, callout de México), el glosario A5 (términos y ejemplos) y los
 * quizzes A2/A4 (hechos de «¿sabías que?»). No se inventan datos.
 */

import type { QuizEvaluable } from "./_reto-quiz";

export type Pt = [number, number, number];

/** Los tres modos del laboratorio. */
export type Modo = "miller" | "ambientes" | "mundoarn";

/** Ambientes candidatos (submodo dentro de "ambientes"). */
export type Ambiente = "caldo" | "hidrotermal" | "panspermia";

export interface ModoDef {
  id: Modo;
  etq: string;
  subtitulo: string;
  icono: string; // FontAwesome (fa-solid)
  color: string; // hex
  fuente: string;
}

export const MODOS_DEF: Record<Modo, ModoDef> = {
  miller: {
    id: "miller",
    etq: "Miller-Urey",
    subtitulo: "Síntesis abiótica (1953)",
    icono: "fa-flask-vial",
    color: "#38bdf8",
    fuente: "A1",
  },
  ambientes: {
    id: "ambientes",
    etq: "Ambientes",
    subtitulo: "¿Dónde surgió la vida?",
    icono: "fa-earth-americas",
    color: "#34d399",
    fuente: "A1",
  },
  mundoarn: {
    id: "mundoarn",
    etq: "Mundo ARN",
    subtitulo: "La primera molécula",
    icono: "fa-dna",
    color: "#a855f7",
    fuente: "A1",
  },
};

export const MODOS: Modo[] = ["miller", "ambientes", "mundoarn"];

/* ── Hipótesis sobre el origen de la vida (verbatim de la lectura A1) ───── */
export interface Hipotesis {
  id: string;
  nombre: string;
  anio: string;
  icono: string;
  color: string;
  descripcion: string; // verbatim de la lectura A1
  evidencia: string; // verbatim / referenciada de A1, A2, A4 o A5
}

export const HIPOTESIS: Hipotesis[] = [
  {
    id: "oparin",
    nombre: "Caldo primordial (Oparin-Haldane)",
    anio: "1920s",
    icono: "fa-water",
    color: "#fbbf24",
    descripcion:
      "La hipótesis del caldo primordial de Oparin y Haldane (1920s) sugiere que la atmósfera primitiva (CH4, NH3, H2O, H2) y la energía de rayos y volcanes permitieron la síntesis de moléculas orgánicas en los océanos.",
    evidencia:
      "La Tierra primitiva (hace ~4000 millones de años) tenía una atmósfera anóxica (sin O₂); la energía de relámpagos, luz UV y calor volcánico impulsó la síntesis abiótica que se acumuló en una «sopa primordial».",
  },
  {
    id: "miller",
    nombre: "Experimento de Miller-Urey",
    anio: "1953",
    icono: "fa-flask-vial",
    color: "#38bdf8",
    descripcion:
      "En 1953, Stanley Miller y Harold Urey simularon estas condiciones en laboratorio y obtuvieron aminoácidos, validando experimentalmente que los bloques de la vida pueden formarse abioticamente.",
    evidencia:
      "Simularon la atmósfera primitiva (CH₄, NH₃, H₂, H₂O) y aplicaron descargas eléctricas; tras una semana obtuvieron más de 20 aminoácidos distintos (glicina, alanina, ácido aspártico…) sin ninguna célula presente.",
  },
  {
    id: "hidrotermal",
    nombre: "Ventiladeros hidrotermales",
    anio: "actual",
    icono: "fa-fire",
    color: "#fb7185",
    descripcion:
      "La hipótesis de los ventiladeros hidrotermales propone que las chimeneas submarinas, ricas en minerales y con gradientes de temperatura y pH, fueron el ambiente donde surgieron las primeras biomoléculas y membranas.",
    evidencia:
      "Es hoy muy respaldada porque no requiere una atmósfera reductora: los gradientes de temperatura, pH y minerales pueden impulsar reacciones prebióticas en el fondo oceánico.",
  },
  {
    id: "mundoarn",
    nombre: "Mundo ARN",
    anio: "actual",
    icono: "fa-dna",
    color: "#a855f7",
    descripcion:
      "La hipótesis del Mundo ARN plantea que el ARN fue la primera molécula de la vida, capaz tanto de almacenar información genética como de catalizar reacciones (ribozimas). Esto resuelve el dilema del huevo y la gallina entre ADN y proteínas.",
    evidencia:
      "Las ribozimas (ARN catalítico, descubiertas por Cech y Altman) son evidencia de esa capacidad dual. El ARN ribosomal cataliza la formación de enlaces peptídicos en la traducción.",
  },
  {
    id: "panspermia",
    nombre: "Panspermia",
    anio: "actual",
    icono: "fa-meteor",
    color: "#818cf8",
    descripcion:
      "Finalmente, la panspermia sugiere que moléculas orgánicas o incluso microorganismos llegaron a la Tierra desde el espacio, en meteoritos. El meteorito de Murchison (1969) contenía aminoácidos extraterrestres.",
    evidencia:
      "El meteorito de Murchison (caído en Australia en 1969) contenía más de 70 aminoácidos distintos de origen extraterrestre. Traslada el problema pero no lo elimina: ¿cómo surgió la vida en ese origen externo?",
  },
];

export function hipotesisPorId(id: string): Hipotesis {
  return HIPOTESIS.find((h) => h.id === id) ?? HIPOTESIS[0]!;
}

/* ── Gases de la atmósfera primitiva (Miller-Urey) ─────────────────────── */
export interface Gas {
  formula: string;
  nombre: string;
  color: string;
}

export const GASES_PRIMITIVOS: Gas[] = [
  { formula: "CH₄", nombre: "Metano", color: "#94a3b8" },
  { formula: "NH₃", nombre: "Amoniaco", color: "#a78bfa" },
  { formula: "H₂", nombre: "Hidrógeno", color: "#7dd3fc" },
  { formula: "H₂O", nombre: "Vapor de agua", color: "#38bdf8" },
];

/* ── Productos orgánicos obtenidos (verbatim del glosario A5) ───────────── */
export interface Producto {
  nombre: string;
  abr: string;
  color: string;
}

/** Aminoácidos citados textualmente en el glosario A5 + genérico. */
export const PRODUCTOS_MILLER: Producto[] = [
  { nombre: "Glicina", abr: "Gly", color: "#34d399" },
  { nombre: "Alanina", abr: "Ala", color: "#fbbf24" },
  { nombre: "Ácido aspártico", abr: "Asp", color: "#fb7185" },
  { nombre: "Otros aminoácidos", abr: "+20", color: "#a855f7" },
];

/* ── Etapas del aparato de Miller-Urey (el ciclo) ──────────────────────── */
export interface EtapaMiller {
  n: number;
  titulo: string;
  detalle: string;
  icono: string;
}

export const ETAPAS_MILLER: EtapaMiller[] = [
  { n: 1, titulo: "Océano en ebullición", detalle: "El matraz inferior calienta el «océano» y libera vapor de agua que asciende.", icono: "fa-fire-flame-simple" },
  { n: 2, titulo: "Atmósfera primitiva", detalle: "El vapor se mezcla con los gases reductores CH₄, NH₃ e H₂ en el matraz superior.", icono: "fa-wind" },
  { n: 3, titulo: "Descarga eléctrica", detalle: "Dos electrodos producen chispas que simulan los rayos: la energía rompe y recombina las moléculas.", icono: "fa-bolt" },
  { n: 4, titulo: "Condensación", detalle: "El condensador enfría los gases; el vapor se vuelve líquido y arrastra las moléculas formadas.", icono: "fa-droplet" },
  { n: 5, titulo: "Trampa de moléculas", detalle: "Las gotas con aminoácidos se acumulan en la trampa, donde Miller los detectó tras una semana.", icono: "fa-vial-circle-check" },
];

/* ── Ambientes candidatos (modo 2) ─────────────────────────────────────── */
export interface AmbienteDef {
  id: Ambiente;
  etq: string;
  icono: string;
  color: string;
  hipotesisId: string;
  resumen: string;
}

export const AMBIENTES_DEF: Record<Ambiente, AmbienteDef> = {
  caldo: {
    id: "caldo",
    etq: "Caldo primordial",
    icono: "fa-water",
    color: "#fbbf24",
    hipotesisId: "oparin",
    resumen: "Charcas y océanos primitivos bajo relámpagos y vulcanismo, donde se acumularon moléculas orgánicas.",
  },
  hidrotermal: {
    id: "hidrotermal",
    etq: "Ventiladeros hidrotermales",
    icono: "fa-fire",
    color: "#fb7185",
    hipotesisId: "hidrotermal",
    resumen: "Chimeneas submarinas con minerales y gradientes de temperatura y pH; no requieren atmósfera reductora.",
  },
  panspermia: {
    id: "panspermia",
    etq: "Panspermia (Murchison)",
    icono: "fa-meteor",
    color: "#818cf8",
    hipotesisId: "panspermia",
    resumen: "Meteoritos y cometas que trajeron moléculas orgánicas desde el espacio; el meteorito de Murchison portaba aminoácidos.",
  },
};

export const AMBIENTES: Ambiente[] = ["caldo", "hidrotermal", "panspermia"];

export function ambientePorId(id: string): AmbienteDef {
  return AMBIENTES_DEF[(id as Ambiente)] ?? AMBIENTES_DEF.caldo;
}

/* ── Texto de la lectura A1 (verbatim) ─────────────────────────────────── */
export const PROBLEMA =
  "Las hipótesis abióticas sobre el origen de la vida proponen que moléculas orgánicas complejas surgieron de compuestos inorgánicos en condiciones primitivas de la Tierra. Este laboratorio recorre las principales hipótesis y reconstruye el experimento que las puso a prueba.";

export const DEFINICION_ABIOTICA =
  "Hipótesis abiótica: la materia viva surgió de compuestos inorgánicos mediante reacciones químicas, sin progenitores. La generación espontánea (vida de la materia inerte sin más) fue refutada por Pasteur en 1859; la abiogénesis moderna explica el origen de los precursores químicos, no la aparición instantánea de seres vivos.";

/** Preguntas de comprensión (verbatim A1). */
export const PREGUNTAS: string[] = [
  "¿Qué demostró el experimento Miller-Urey (1953)?",
  "¿Por qué la hipótesis del Mundo ARN resuelve el dilema ADN-proteína?",
];

/** Callout de México (verbatim A1 — callout «sabias»). */
export const CONTEXTO =
  "México es uno de los 17 países megadiversos del planeta según la CONABIO (Comisión Nacional para el Conocimiento y Uso de la Biodiversidad). Alberga el 10% de las especies conocidas en la Tierra, con más de 200,000 especies registradas en su territorio: el mayor número en el mundo en relación a su extensión.";

export const FUENTE =
  "Material elaborado para CEN Bachillerato — CNEYT-VI. Ref: Campbell, Biología (12a ed.); Miller & Urey, Science 1953.";

/* ── Glosario (verbatim A5) ────────────────────────────────────────────── */
export interface TerminoGlosario {
  termino: string;
  definicion: string;
  ejemplo: string;
}

export const GLOSARIO: TerminoGlosario[] = [
  {
    termino: "Generación espontánea (refutada)",
    definicion:
      "Teoría antigua que afirmaba que los seres vivos podían surgir directamente de materia inerte sin progenitores. Refutada definitivamente por Louis Pasteur en 1859 con sus matraces de cuello de cisne.",
    ejemplo: "La creencia de que los ratones surgían de la paja húmeda fue desacreditada por Redi (1668) y confirmada experimentalmente por Pasteur.",
  },
  {
    termino: "Hipótesis de Oparin-Haldane (sopa primordial)",
    definicion:
      "Propone que en la Tierra primitiva (hace ~4000 millones de años), la atmósfera sin oxígeno libre y con H₂, CH₄, NH₃ y H₂O permitió la síntesis abiótica de moléculas orgánicas que se acumularon en los océanos formando una «sopa primordial».",
    ejemplo: "Aminoácidos, azúcares y bases nitrogenadas pudieron formarse a partir de moléculas simples impulsadas por la energía de relámpagos, luz UV y calor volcánico.",
  },
  {
    termino: "Experimento de Miller-Urey (1953)",
    definicion:
      "Stanley Miller y Harold Urey simularon la atmósfera primitiva (CH₄, NH₃, H₂, H₂O) y aplicaron descargas eléctricas. Tras una semana obtuvieron más de 20 aminoácidos distintos, confirmando la síntesis abiótica de moléculas orgánicas.",
    ejemplo: "El experimento produjo glicina, alanina, ácido aspártico y otros aminoácidos sin ninguna célula presente, solo reacciones químicas.",
  },
  {
    termino: "Coacervados y protocélulas",
    definicion:
      "Los coacervados son agregados esféricos de polímeros en solución acuosa que pueden concentrar moléculas y llevar a cabo reacciones sencillas. Representan un modelo de protocélula: estructura precelular que precedió a las células verdaderas.",
    ejemplo: "Los liposomas (vesículas de fosfolípidos en agua) también son modelos de protocélulas ya que forman espontáneamente dobles membranas lipídicas.",
  },
  {
    termino: "Hipótesis del mundo de ARN",
    definicion:
      "Postula que en el origen de la vida el ARN actuó tanto como molécula de almacenamiento de información (como el ADN hoy) y como catalizador (como las proteínas). Las ribozimas (ARN catalítico) son evidencia de esa capacidad dual.",
    ejemplo: "El ARN ribosomal (ARNr) es catalíticamente activo: el ribosoma usa ARNr para catalizar la formación de enlaces peptídicos en la traducción.",
  },
  {
    termino: "Panspermia",
    definicion:
      "Hipótesis que propone que la vida o sus precursores orgánicos llegaron a la Tierra desde el espacio exterior a través de meteoritos, cometas o polvo cósmico. No explica el origen último de la vida, solo su llegada.",
    ejemplo: "En el meteorito Murchison (caído en Australia en 1969) se encontraron más de 70 aminoácidos distintos de origen extraterrestre, incluyendo varios presentes en los seres vivos.",
  },
];

/* ── «¿Sabías que?» (verbatim de los quizzes A2/A4) ────────────────────── */
export const HECHOS: string[] = [
  "Pasteur demostró con sus matraces de cuello de cisne que los microorganismos provenían del aire, no surgían espontáneamente: estableció el principio de biogénesis.",
  "El meteorito de Murchison (1969) contenía más de 70 aminoácidos distintos de origen extraterrestre, varios presentes en los seres vivos.",
  "Las ribozimas (ARN catalítico) fueron descubiertas por Thomas Cech y Sidney Altman; sustentan la hipótesis del mundo de ARN.",
  "Los coacervados son agregados coloidales de macromoléculas: modelos sencillos de protocélula, no células con metabolismo completo.",
];

/* ── Datos clave (cifras verbatim / referenciadas) ─────────────────────── */
export interface Dato {
  valor: string;
  texto: string;
  icono: string;
}

export const DATOS: Dato[] = [
  { valor: "~4000 Ma", texto: "Antigüedad de la Tierra primitiva con atmósfera sin O₂ libre (Oparin-Haldane).", icono: "fa-hourglass-half" },
  { valor: "1 semana", texto: "Tiempo tras el cual Miller obtuvo más de 20 aminoácidos distintos (1953).", icono: "fa-stopwatch" },
  { valor: "70+ aa", texto: "Aminoácidos extraterrestres hallados en el meteorito de Murchison (1969).", icono: "fa-meteor" },
  { valor: "1859", texto: "Pasteur refuta la generación espontánea y establece la biogénesis.", icono: "fa-vial-circle-check" },
];

/* ── Instrucciones de uso ──────────────────────────────────────────────── */
export const INSTRUCCIONES: string[] = [
  "Elige un modo: el aparato de Miller-Urey, los ambientes candidatos o el mundo de ARN.",
  "En Miller-Urey, usa play/pausa y el control de «días» para ver cómo se acumulan los aminoácidos.",
  "En Ambientes, cambia entre el caldo primordial, los ventiladeros hidrotermales y la panspermia.",
  "Activa o desactiva la chispa eléctrica para comprobar que sin energía no hay síntesis.",
  "Consulta el glosario, las hipótesis y los datos para fundamentar tu reflexión (A3).",
];

/* ── Ideas clave ───────────────────────────────────────────────────────── */
export const IDEAS: string[] = [
  "Las hipótesis abióticas explican cómo se formaron las moléculas orgánicas, no cómo apareció «de golpe» un ser vivo.",
  "Oparin-Haldane propuso la síntesis abiótica en una atmósfera reductora; Miller-Urey la puso a prueba en el laboratorio.",
  "Miller obtuvo aminoácidos, no proteínas ni seres vivos: demostró que los precursores se forman abioticamente.",
  "Los ventiladeros hidrotermales son atractivos porque no necesitan una atmósfera reductora.",
  "El mundo de ARN resuelve el dilema ADN-proteína: el ARN almacena información y cataliza (ribozimas).",
  "La panspermia explica la llegada de moléculas orgánicas, pero traslada el problema del origen último.",
  "La generación espontánea fue refutada por Pasteur; la abiogénesis científica es distinta.",
  "Ninguna hipótesis es aún una teoría completamente probada: el origen de la vida sigue investigándose.",
];

/* ── Reto evaluable: quiz VERBATIM de la actividad A2 ───────────────────── */
// VERBATIM de CNEYT-VI-P01-A2 (quiz_multiple_opcion). Índices ya 0-based.
export const QUIZ_A2: QuizEvaluable = {
  titulo: "Quiz: Origen de la vida",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "¿Qué moléculas orgánicas obtuvo Miller en su experimento de 1953 al simular la atmósfera primitiva?",
      opciones: [
        "Ácidos grasos y glucosa",
        "Aminoácidos y otras moléculas orgánicas",
        "Nucleótidos y ATP",
        "Cloroplastos y mitocondrias",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "Miller obtuvo aminoácidos y otras moléculas orgánicas, demostrando que los bloques de la vida pueden formarse abioticamente. Este resultado respaldó la hipótesis de Oparin y Haldane.",
    },
    {
      enunciado: "¿Cuál hipótesis propone que el ARN fue la primera molécula capaz de almacenar información y catalizar reacciones?",
      opciones: [
        "Panspermia",
        "Mundo ARN",
        "Caldo primordial",
        "Ventiladeros hidrotermales",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "La hipótesis del Mundo ARN resuelve el dilema 'ADN vs. proteína' porque el ARN puede hacer ambas funciones. Las ribozimas son ARN catalíticos que respaldan esta hipótesis.",
    },
    {
      enunciado: "¿Qué evidencia respalda la hipótesis de la panspermia?",
      opciones: [
        "La síntesis de ADN en laboratorio",
        "El meteorito de Murchison contenía aminoácidos extraterrestres",
        "La existencia de ribozimas",
        "Los ventiladeros hidrotermales oceánicos",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "El meteorito de Murchison (1969) contenía más de 70 aminoácidos distintos de origen extraterrestre. Esto muestra que las moléculas orgánicas pueden formarse en el espacio.",
    },
    {
      enunciado: "¿Por qué se descartó la hipótesis de la generación espontánea en el siglo XIX?",
      opciones: [
        "Porque Oparin la refutó matemáticamente",
        "Porque los experimentos de Pasteur demostraron que la vida solo surge de vida preexistente",
        "Porque Miller demostró lo contrario",
        "Porque la panspermia la sustituyó",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "Pasteur demostró con sus matraces de cuello de cisne que los microorganismos provenían del aire, no surgían espontáneamente. Esto estableció el principio de biogénesis.",
    },
    {
      enunciado: "Los ventiladeros hidrotermales son atractivos como cuna de la vida porque:",
      opciones: [
        "Tienen mucho oxígeno libre",
        "Proveen gradientes de energía y minerales sin necesitar atmósfera reductora",
        "Están cerca de la superficie oceánica",
        "Emiten radiación ultravioleta",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "Los ventiladeros ofrecen gradientes de temperatura, pH y concentración de minerales que pueden impulsar reacciones prebióticas sin requerir la atmósfera reductora que se discute si existió en la Tierra primitiva.",
    },
  ],
};
