/**
 * Datos de la Ficha Teórica del laboratorio "Places to visit: Rincón del
 * Colibrí" (IN-III-P03, progresión 3 de Inglés III).
 *
 * La progresión NO tiene lectura: el marco teórico se arma con las
 * definiciones y ejemplos VERBATIM de los glosarios A1 y A5 y con la
 * retroalimentación verbatim del verdadero/falso A3 y A4. Los conceptos
 * centrales son explicaciones del laboratorio (en español, con ejemplos en
 * inglés estadounidense estándar).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO_A1, GLOSARIO_A5, FUENTE, TITULO_A1, TITULO_A5 } from "./lugares-recomendaciones-ingles-data";

const g1 = (t: string) => GLOSARIO_A1.find((x) => x.termino === t)!;
const g5 = (t: string) => GLOSARIO_A5.find((x) => x.termino === t)!;
const par = (x: { termino: string; definicion: string; ejemplo: string }) => `«${x.termino}»: ${x.definicion} Example: ${x.ejemplo}`;

export const LUGARES_RECOMENDACIONES_INGLES_FICHA: FichaTeoricaData = {
  ancla: `IN-III · P03 · A1 «${TITULO_A1}» y A5 «${TITULO_A5}» (esta progresión no tiene lectura: el marco se arma con sus glosarios)`,

  marcoTeorico: [
    `Qué hay en un lugar (A5). ${par(g5("There is / There are"))}`,
    `${par(g1("there is"))} ${par(g1("there are"))}`,
    "A3: 'There are a pharmacy on the corner' — False. 'Pharmacy' is singular, so the correct form is 'There IS a pharmacy on the corner.' 'There are' is used with plural nouns. / 'There is many students in the classroom' — False. 'Students' is plural, so we use 'there ARE'. Correct: 'There are many students in the classroom.'",
    `Qué se puede hacer ahí. ${par(g1("can (posibilidad)"))} ${par(g5("can (possibility)"))}`,
    `Dónde está cada cosa (A1). ${par(g1("next to"))} ${par(g1("in front of"))} ${par(g1("behind"))}`,
    `${par(g1("between"))} A3: 'Between' is used with exactly two reference points. For more than two, we use 'among'. Example: The statue is between the fountain and the gate.`,
    `${par(g1("opposite"))} ${par(g1("above / below"))} ${par(g1("on the corner of"))}`,
    `Recomendar (A5). ${par(g5("you should / you can"))} A4: 'You should visit the cathedral' es una recomendación básica en inglés — Correcto: should + verbo base para dar recomendaciones.`,
    `${par(g5("places of interest"))}`,
  ],

  objetivos: [
    "Decir qué hay en un lugar con there is (singular), there are (plural) e it has.",
    "Contar bien lo que se describe: a / an = uno; two, three, six…; many = muchos.",
    "Decir qué se puede hacer en un lugar con you can + verbo base, y advertir una regla con you can't.",
    "Ubicar cosas con preposiciones de lugar: next to, in front of, behind, between, above, below, opposite.",
    "Leer una guía turística en inglés y encontrar la información que necesita un visitante.",
    "Recomendar un lugar con you should, I recommend, don't miss o it's a good place to, y dar una razón cierta.",
    "Adaptar la recomendación a los intereses y a las necesidades de cada persona.",
  ],

  materiales: [
    { nombre: "Siete maquetas", detalle: "Plaza principal, mercado de artesanías, museo comunitario, cascada, zona arqueológica, playa y mirador de un pueblo costero ficticio, con piezas que se pueden contar.", icono: "fa-cubes" },
    { nombre: "Fichas de oración", detalle: "Inicios (There is, There are, It has, You can, You can't), sustantivos, actividades y ubicaciones para armar la descripción.", icono: "fa-puzzle-piece" },
    { nombre: "Guía turística en inglés", detalle: "Cinco oraciones por lugar: qué hay, qué se puede hacer, precios, accesos y avisos.", icono: "fa-book-atlas" },
    { nombre: "Siete visitantes y seis turistas", detalle: "Personas con intereses y necesidades distintas (silla de ruedas, niños pequeños, poco dinero, rodilla lastimada…).", icono: "fa-people-group" },
  ],

  conceptos: [
    {
      termino: "There is / there are / it has",
      definicion:
        "There is + singular (There is a fountain in the square) · There are + plural (There are six benches around the kiosk). El verbo concuerda con lo que viene DESPUÉS. Con it has no cambia: It has a kiosk / It has four trees. Contracción: there's = there is (no hay contracción común para there are).",
    },
    {
      termino: "Contar lo que describes",
      definicion: "a / an = uno (a bench = una banca). Si hay varios, di cuántos: There are six benches. Many = muchos; some = algunos. «There is a bench» no describe bien una plaza con seis bancas.",
    },
    {
      termino: "Can para posibilidad y can't para reglas",
      definicion: "You can + verbo base = es posible hacerlo ahí: You can swim in the natural pool. You can't + verbo base avisa lo que no se permite: You can't climb the pyramid. Después de can nunca va to ni -ing: can swim, no can to swim ni can swimming.",
    },
    {
      termino: "Preposiciones de lugar",
      definicion:
        "next to = al lado · in front of = delante de, junto al frente (There is a ramp in front of the entrance) · behind = detrás · between A and B = entre dos cosas · above / below = encima / debajo (The pool is below the waterfall) · opposite (o across from) = del otro lado de una calle o espacio, frente a frente (The museum is opposite the market). Ojo: in front of NO significa «del otro lado»; eso es opposite.",
    },
    {
      termino: "Pisos en inglés de EE. UU.",
      definicion: "first floor = planta baja; second floor = primer piso. En inglés británico, ground floor = planta baja y first floor = primer piso.",
    },
    {
      termino: "Recomendar",
      definicion:
        "You should + verbo base (You should visit the beach) · I recommend + lugar o verbo con -ing (I recommend the market / I recommend visiting the market) · Don't miss + lugar (Don't miss the viewpoint!) · It's a good place to + verbo (It's a good place to swim). Errores comunes: should to visit, I recommend you to visit.",
    },
    {
      termino: "Una razón que sirva",
      definicion:
        "Une la recomendación con su razón: because + oración (because you can swim there), o una segunda oración con you can / there is. La razón debe ser cierta y responder a lo que busca la persona: a quien no puede subir escaleras no le recomiendas un mirador con 300 escalones.",
    },
  ],

  glosario: [...GLOSARIO_A1, ...GLOSARIO_A5].map((g) => ({ termino: g.termino, definicion: `${g.definicion} Ejemplo: ${g.ejemplo}` })),

  aplicaciones: [
    "Orientar a un turista que visita tu comunidad: qué hay, qué puede hacer y qué le conviene.",
    "Escribir la reseña de un lugar en una app de mapas o de viajes.",
    "Preparar la ficha en inglés de un sitio de interés de tu municipio para un proyecto escolar.",
    "Pedir y entender recomendaciones cuando viajes o leas una guía en inglés.",
  ],

  fuente: FUENTE,
};
