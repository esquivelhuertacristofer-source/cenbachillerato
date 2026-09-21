/**
 * Datos del Laboratorio — Tu historia de vida como relato (LC-II-P01).
 *
 * Qué es verbatim de la base de datos (progresión LC-II-P01, Lengua y
 * Comunicación II):
 *   · LECTURA_A1 — la lectura «Narrativas de vida: contar para construirse»
 *     (LC-II-P01-A1), íntegra.
 *   · DATO_HISTORIA — el recuadro «¿Sabías?» de esa misma lectura (INALI).
 *   · PARES — los cinco términos del glosario interactivo LC-II-P01-A5, con
 *     su definición y su ejemplo tal cual.
 *   · QUIZ — las cuatro afirmaciones y sus retroalimentaciones de
 *     LC-II-P01-A4 (verdadero/falso), presentadas como reto evaluable.
 *   · CUADERNO — la consigna y las pistas de LC-II-P01-A3 (reflexión escrita).
 *
 * Qué escribí para el laboratorio (y por qué): las dos anécdotas y los doce
 * fragmentos son FICCIÓN. Ximena Robledo y Renata Ceballos no existen; sus
 * historias están escritas para practicar el oficio de narrar sobre material
 * AJENO. El tema de la progresión toca la vida privada del alumno, y un
 * laboratorio no puede pedir ni calificar confidencias: lo que aquí se evalúa
 * es ordenar hechos, separar el suceso del significado, elegir desde dónde se
 * cuenta y localizar el giro y la huella. Lo propio, si el alumno quiere
 * escribirlo, vive en un cuaderno opcional que no se guarda ni se califica.
 *
 * Ningún relato se atribuye a una persona real.
 */

import type { QuizEvaluable } from "./_reto-quiz";

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 1 — «Ordena la anécdota» (línea del tiempo + giro y huella)
 * ───────────────────────────────────────────────────────────────────────── */
export type Momento = "inicial" | "detonante" | "desarrollo" | "giro" | "desenlace" | "huella";

export const MOMENTO_INFO: Record<Momento, { titulo: string; descripcion: string; icono: string }> = {
  inicial: {
    titulo: "Situación inicial",
    descripcion: "Dónde, cuándo y quién. El mundo antes de que pase nada.",
    icono: "fa-map-pin",
  },
  detonante: {
    titulo: "Detonante",
    descripcion: "El hecho que rompe la rutina y echa a andar el relato.",
    icono: "fa-bolt",
  },
  desarrollo: {
    titulo: "Desarrollo",
    descripcion: "Lo que se hace (o no se hace) mientras el problema crece.",
    icono: "fa-arrow-trend-up",
  },
  giro: {
    titulo: "Giro",
    descripcion: "El momento en que la historia toma otra dirección.",
    icono: "fa-shuffle",
  },
  desenlace: {
    titulo: "Desenlace",
    descripcion: "Cómo terminaron los hechos, con o sin final feliz.",
    icono: "fa-flag-checkered",
  },
  huella: {
    titulo: "Huella",
    descripcion: "El significado: qué cambió en quien lo vivió.",
    icono: "fa-heart-pulse",
  },
};

export interface TarjetaMomento {
  id: string;
  texto: string;
  momento: Momento;
}

export interface Anecdota {
  id: string;
  titulo: string;
  ficha: string;
  /** Los seis momentos EN ORDEN cronológico. */
  tarjetas: TarjetaMomento[];
}

export const ANECDOTAS: Anecdota[] = [
  {
    id: "camion",
    titulo: "El camión de las seis",
    ficha: "Relato de Ximena Robledo, 16 años, Tepatitlán de Morelos, Jalisco (personaje ficticio).",
    tarjetas: [
      {
        id: "cam-1",
        momento: "inicial",
        texto: "Durante tres meses ensayé un discurso sobre el agua en el patio de mi casa. El concurso estatal era en Guadalajara, un sábado a las diez de la mañana.",
      },
      {
        id: "cam-2",
        momento: "detonante",
        texto: "Ese sábado el despertador no sonó. Salí corriendo a la central y el camión de las seis ya se había ido.",
      },
      {
        id: "cam-3",
        momento: "desarrollo",
        texto: "Me senté en una banca de la central con la hoja del discurso doblada en la mano. Estuve a punto de regresarme a la casa.",
      },
      {
        id: "cam-4",
        momento: "giro",
        texto: "Una señora que vendía tejuino me preguntó qué decía mi hoja. Se la leí completa, ahí, sin micrófono y sin jurado.",
      },
      {
        id: "cam-5",
        momento: "desenlace",
        texto: "Llegué a Guadalajara en el camión de las ocho, media hora tarde. No me dejaron competir.",
      },
      {
        id: "cam-6",
        momento: "huella",
        texto: "Desde entonces sé que lo que preparo con cuidado me sirve aunque nadie lo califique. Un ensayo también cuenta como función.",
      },
    ],
  },
  {
    id: "apagon",
    titulo: "El apagón de la fonda",
    ficha: "Relato de Renata Ceballos, 16 años, Ciudad Valles, San Luis Potosí (personaje ficticio).",
    tarjetas: [
      {
        id: "apa-1",
        momento: "inicial",
        texto: "En agosto mi tía nos dejó a mi hermano y a mí a cargo de la fonda mientras ella iba a una cita médica.",
      },
      {
        id: "apa-2",
        momento: "detonante",
        texto: "A las dos de la tarde se fue la luz en toda la cuadra y el comedor se llenó de gente con calor y con hambre.",
      },
      {
        id: "apa-3",
        momento: "desarrollo",
        texto: "Mi hermano quería cerrar. Yo pedí en voz alta que me ayudaran a sacar las mesas a la banqueta, bajo el árbol.",
      },
      {
        id: "apa-4",
        momento: "giro",
        texto: "Un cliente se paró a cargar sillas. Luego se paró otro. En diez minutos éramos seis acomodando mesas en la calle.",
      },
      {
        id: "apa-5",
        momento: "desenlace",
        texto: "La luz volvió a las cinco. Ese día vendimos más que un domingo y no rompimos un solo plato.",
      },
      {
        id: "apa-6",
        momento: "huella",
        texto: "Entendí que pedir ayuda en voz alta no es lo mismo que rendirse. Ahora, cuando algo se descompone, lo primero que hago es mirar quién está cerca.",
      },
    ],
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 2 — «¿Suceso, detalle o huella?»
 *
 * Las tres capas corresponden a tres términos del glosario A5: el suceso es
 * NARRACIÓN (hechos en el tiempo), el detalle es DESCRIPCIÓN (cómo son las
 * personas, lugares u objetos) y la huella es la IDEA PRIORITARIA del relato
 * de vida (lo que sostiene el mensaje).
 * ───────────────────────────────────────────────────────────────────────── */
export type Capa = "suceso" | "detalle" | "huella";

export const CAPA_INFO: Record<Capa, { titulo: string; subtitulo: string; prueba: string; icono: string; color: string }> = {
  suceso: {
    titulo: "Suceso",
    subtitulo: "Narración: un hecho que ocurre en el tiempo.",
    prueba: "Prueba: ¿se podría filmar? ¿Pasa algo entre un antes y un después?",
    icono: "fa-clapperboard",
    color: "#5BC8FF",
  },
  detalle: {
    titulo: "Detalle descriptivo",
    subtitulo: "Descripción: cómo son las personas, lugares u objetos.",
    prueba: "Prueba: ¿se puede dibujar u oler? No avanza la historia, la hace visible.",
    icono: "fa-eye",
    color: "#C08BFF",
  },
  huella: {
    titulo: "Huella",
    subtitulo: "Idea prioritaria: el significado que quien narra le da a lo vivido.",
    prueba: "Prueba: ¿habla de un cambio en cómo piensa, siente o actúa quien narra?",
    icono: "fa-heart-pulse",
    color: "#FFC75A",
  },
};

export interface Fragmento {
  id: string;
  texto: string;
  capa: Capa;
  porque: string;
}

export const FRAGMENTOS: Fragmento[] = [
  {
    id: "fr-s1",
    capa: "suceso",
    texto: "Salí corriendo a la central y el camión de las seis ya se había ido.",
    porque: "Hay un antes y un después: la acción ocurre en el tiempo. Eso es narración.",
  },
  {
    id: "fr-s2",
    capa: "suceso",
    texto: "Llegué media hora tarde y no me dejaron competir.",
    porque: "Dos hechos encadenados; se podrían filmar tal cual. Es narración.",
  },
  {
    id: "fr-s3",
    capa: "suceso",
    texto: "A las dos de la tarde se fue la luz en toda la cuadra.",
    porque: "Un acontecimiento con hora y lugar: avanza la historia.",
  },
  {
    id: "fr-s4",
    capa: "suceso",
    texto: "Sacamos las mesas a la banqueta y servimos lo que ya estaba cocido.",
    porque: "Acciones en secuencia. No dicen cómo era nada ni qué significó: cuentan qué pasó.",
  },
  {
    id: "fr-d1",
    capa: "detalle",
    texto: "La hoja del discurso estaba doblada en cuatro y con el borde húmedo.",
    porque: "Dice cómo era un objeto. No pasa nada: es descripción.",
  },
  {
    id: "fr-d2",
    capa: "detalle",
    texto: "La central olía a diésel y a pan recién salido del horno.",
    porque: "Un detalle sensorial del lugar. Hace vivir la escena, pero no la mueve.",
  },
  {
    id: "fr-d3",
    capa: "detalle",
    texto: "El comedor tenía dos ventiladores de techo, quietos y polvosos.",
    porque: "Describe el espacio. La palabra «quietos» ayuda al calor, pero sigue siendo descripción.",
  },
  {
    id: "fr-d4",
    capa: "detalle",
    texto: "El árbol de la banqueta daba una sombra ancha, de hojas amarillas.",
    porque: "Cómo es el lugar donde ocurrirán los hechos: descripción pura.",
  },
  {
    id: "fr-h1",
    capa: "huella",
    texto: "Desde entonces sé que lo que preparo con cuidado me sirve aunque nadie lo califique.",
    porque: "No cuenta un hecho: dice qué cambió en quien narra. Es la idea prioritaria del relato.",
  },
  {
    id: "fr-h2",
    capa: "huella",
    texto: "Aprendí que un ensayo también cuenta como función.",
    porque: "Es una conclusión sobre lo vivido, no un suceso. Huella.",
  },
  {
    id: "fr-h3",
    capa: "huella",
    texto: "Ahora, cuando algo se descompone, lo primero que hago es mirar quién está cerca.",
    porque: "Habla del presente de quien narra y de un cambio en cómo actúa: huella.",
  },
  {
    id: "fr-h4",
    capa: "huella",
    texto: "Entendí que pedir ayuda en voz alta no es lo mismo que rendirse.",
    porque: "El verbo «entendí» delata el significado, no el suceso. Huella.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 3 — «¿Desde dónde se cuenta?»
 *
 * El mismo momento (el giro de «El camión de las seis») escrito en las ocho
 * combinaciones posibles de tres decisiones: quién narra, en qué tiempo verbal
 * y desde qué distancia. El alumno mueve los tres controles y lee el efecto.
 * ───────────────────────────────────────────────────────────────────────── */
export type Persona = "primera" | "tercera";
export type TiempoVerbal = "pasado" | "presente";
export type Distancia = "entonces" | "ahora";

export const PERSONA_INFO: Record<Persona, { titulo: string; pista: string }> = {
  primera: { titulo: "Primera persona (yo)", pista: "Quien vivió los hechos los cuenta: «me preguntó», «se la leí»." },
  tercera: { titulo: "Tercera persona (ella)", pista: "Alguien cuenta desde fuera lo que le pasó a otra: «le preguntó a Ximena»." },
};

export const TIEMPO_INFO: Record<TiempoVerbal, { titulo: string; pista: string }> = {
  pasado: { titulo: "Pretérito (pasó)", pista: "El tiempo natural del recuerdo: «preguntó», «leí». Da orden y distancia." },
  presente: { titulo: "Presente (pasa)", pista: "Presente histórico: «pregunta», «leo». Acerca la escena y crea tensión." },
};

export const DISTANCIA_INFO: Record<Distancia, { titulo: string; pista: string }> = {
  entonces: { titulo: "El yo de entonces", pista: "Solo sabe lo que sabía en ese momento. No adelanta el final." },
  ahora: { titulo: "El yo de ahora", pista: "Ya entendió lo que pasó y lo comenta. Explica, pero quita sorpresa." },
};

export interface VersionVoz {
  texto: string;
  efecto: string;
}

/** Clave: `${persona}-${tiempo}-${distancia}`. */
export const VERSIONES: Record<string, VersionVoz> = {
  "primera-pasado-entonces": {
    texto:
      "Una señora que vendía tejuino me preguntó qué decía mi hoja. Se la leí completa, con la voz temblando, sin saber si aquello servía de algo.",
    efecto: "La versión más común del relato de vida: yo cuento lo que me pasó, ya ocurrió, y todavía no sé cómo termina. El lector descubre al mismo ritmo que yo.",
  },
  "primera-pasado-ahora": {
    texto:
      "Una señora que vendía tejuino me preguntó qué decía mi hoja. Se la leí completa; hoy sé que ese fue el único público que necesitaba.",
    efecto: "Misma voz y mismo tiempo, pero el yo de ahora interrumpe para interpretar. Gana claridad y pierde suspenso: la huella se dice en lugar de mostrarse.",
  },
  "primera-presente-entonces": {
    texto:
      "Una señora que vende tejuino me pregunta qué dice mi hoja. Se la leo completa, con la voz temblando, sin saber si esto sirve de algo.",
    efecto: "El presente histórico pone al lector dentro de la banca de la central. Es la combinación con más tensión, y la más difícil de sostener muchas páginas.",
  },
  "primera-presente-ahora": {
    texto:
      "Una señora que vende tejuino me pregunta qué dice mi hoja. Se la leo completa y, mientras la leo, entiendo que este es el único público que necesito.",
    efecto: "El significado se cuela dentro de la escena en curso. Suena a revelación en vivo: potente, pero poco creíble si se abusa de él.",
  },
  "tercera-pasado-entonces": {
    texto:
      "Una señora que vendía tejuino le preguntó a Ximena qué decía su hoja. Ximena se la leyó completa, con la voz temblando, sin saber si aquello servía de algo.",
    efecto: "La cámara sale del cuerpo de Ximena. Se ve mejor la escena completa y se siente menos por dentro: el lector observa en vez de acompañar.",
  },
  "tercera-pasado-ahora": {
    texto:
      "Una señora que vendía tejuino le preguntó a Ximena qué decía su hoja. Ximena se la leyó completa: ese fue, aunque entonces no lo supiera, el único público que necesitaba.",
    efecto: "Un narrador externo que sabe más que el personaje. Da autoridad y aire de crónica, pero pone la huella en boca de alguien que no la vivió.",
  },
  "tercera-presente-entonces": {
    texto:
      "Una señora que vende tejuino le pregunta a Ximena qué dice su hoja. Ximena se la lee completa, con la voz temblando, sin saber si esto sirve de algo.",
    efecto: "Presente en tercera persona: así se escriben las acotaciones de teatro y muchos guiones. Inmediato y frío a la vez.",
  },
  "tercera-presente-ahora": {
    texto:
      "Una señora que vende tejuino le pregunta a Ximena qué dice su hoja. Ximena se la lee completa, y el relato ya sabe lo que ella todavía no: ese es el único público que necesita.",
    efecto: "La voz que cuenta se adelanta al personaje en plena escena. Es la combinación más artificiosa: úsala solo si quieres que se note la mano de quien narra.",
  },
};

export function claveVoz(p: Persona, t: TiempoVerbal, d: Distancia): string {
  return `${p}-${t}-${d}`;
}

export interface Encargo {
  id: string;
  pedido: string;
  persona: Persona;
  tiempo: TiempoVerbal;
  distancia: Distancia;
  porque: string;
}

export const ENCARGOS: Encargo[] = [
  {
    id: "enc-1",
    pedido: "«Para la revista escolar quiero que se lea como un diario escrito esa misma noche: lo cuentas tú, ya pasó, y todavía no sabes cómo termina.»",
    persona: "primera",
    tiempo: "pasado",
    distancia: "entonces",
    porque: "«Lo cuentas tú» pide primera persona; «ya pasó» pide pretérito; «todavía no sabes cómo termina» es el yo de entonces.",
  },
  {
    id: "enc-2",
    pedido: "«Ahora quiero la versión de quien ya lo entendió: sigue siendo tu voz y sigue en pasado, pero déjame ver qué aprendiste.»",
    persona: "primera",
    tiempo: "pasado",
    distancia: "ahora",
    porque: "«Tu voz» mantiene la primera persona y «sigue en pasado» el pretérito; «qué aprendiste» abre la puerta al yo de ahora.",
  },
  {
    id: "enc-3",
    pedido: "«Pásalo a crónica: que alguien de fuera cuente lo que le ocurrió a Ximena, ya pasado, sin adelantar el final.»",
    persona: "tercera",
    tiempo: "pasado",
    distancia: "entonces",
    porque: "«Alguien de fuera» es tercera persona; «ya pasado», pretérito; «sin adelantar el final», el yo de entonces.",
  },
  {
    id: "enc-4",
    pedido: "«Para el pódcast quiero tensión: que parezca que está ocurriendo mientras se escucha, en tu voz, sin el comentario de hoy.»",
    persona: "primera",
    tiempo: "presente",
    distancia: "entonces",
    porque: "«Mientras se escucha» pide presente histórico; «en tu voz», primera persona; «sin el comentario de hoy», el yo de entonces.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * Glosario — VERBATIM de LC-II-P01-A5 (glosario interactivo)
 * ───────────────────────────────────────────────────────────────────────── */
export const PARES: { id: string; termino: string; definicion: string; ejemplo: string }[] = [
  {
    id: "gl-narracion",
    termino: "Narración",
    definicion: "Relato de hechos o situaciones que suceden a lo largo del tiempo, con un orden.",
    ejemplo: "Contar cómo fue tu primer día en el bachillerato.",
  },
  {
    id: "gl-descripcion",
    termino: "Descripción",
    definicion: "Explicación de cómo son las personas, lugares, objetos o emociones.",
    ejemplo: "Describir la casa donde creciste.",
  },
  {
    id: "gl-prioritaria",
    termino: "Idea prioritaria",
    definicion: "Idea principal de un texto, la más importante que sostiene el mensaje.",
    ejemplo: "En un relato de viaje, el destino y su importancia.",
  },
  {
    id: "gl-secundaria",
    termino: "Idea secundaria",
    definicion: "Idea que complementa o apoya a la idea principal con detalles.",
    ejemplo: "Los pequeños sucesos que ocurrieron durante el viaje.",
  },
  {
    id: "gl-ficcion",
    termino: "Ficción y realidad",
    definicion: "La ficción es lo inventado o imaginado; la realidad es lo que ocurrió de verdad.",
    ejemplo: "Un recuerdo real al que añades un final imaginado.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * Reto evaluable — VERBATIM de LC-II-P01-A4 (verdadero/falso)
 * ───────────────────────────────────────────────────────────────────────── */

export const QUIZ: QuizEvaluable = {
  titulo: "Mi historia de vida — Verdadero o falso",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "Narrar es contar hechos o situaciones que ocurren a lo largo del tiempo.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correcto: la narración relata acontecimientos en una secuencia.",
    },
    {
      enunciado: "Describir consiste en decir cómo son las personas, lugares u objetos.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correcto: la descripción detalla características y cualidades.",
    },
    {
      enunciado: "En un texto todas las ideas tienen exactamente la misma importancia.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 1,
      retroalimentacion: "Hay ideas prioritarias (principales) e ideas secundarias que las apoyan.",
    },
    {
      enunciado: "Un relato de tu historia de vida puede mezclar elementos de realidad y de ficción.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correcto: al narrar tu vida puedes recrear o imaginar partes, distinguiendo lo real de lo ficticio.",
    },
  ],
};

/* ─────────────────────────────────────────────────────────────────────────
 * Paneles de lectura — VERBATIM de LC-II-P01-A1 y LC-II-P01-A3
 * ───────────────────────────────────────────────────────────────────────── */
export const LECTURA_A1: string[] = [
  "Las narrativas de vida son textos en los que una persona cuenta episodios de su propia historia: un momento decisivo, una pérdida importante, un aprendizaje profundo, una primera vez. Al narrar, no solo recordamos: construimos significado sobre lo que nos ha pasado y lo compartimos con otros.",
  "Escribir sobre la propia vida requiere valentía y reflexión. No se trata de contar todo lo que ocurrió, sino de seleccionar aquellas situaciones que dejaron una huella —un cambio en cómo pensamos, sentimos o actuamos— y darles forma con palabras.",
  "En muchas culturas, contar la historia propia es un acto comunitario. Las personas mayores transmiten su sabiduría a través de relatos; las familias construyen su identidad compartiendo anécdotas; los escritores influyen en sus lectores al mostrar cómo sus experiencias los transformaron. En LC-II, narrarás situaciones de tu historia de vida para explorar cómo el lenguaje nos ayuda a entendernos y a comunicar nuestra experiencia a los demás.",
];

export const DATO_HISTORIA =
  "México reconoce 68 lenguas nacionales además del español, según el catálogo del INALI (Instituto Nacional de Lenguas Indígenas). Cada una tiene variantes dialectales propias: el náhuatl, por ejemplo, tiene más de 30 variantes distribuidas desde Guerrero hasta Veracruz.";

/** Consigna de LC-II-P01-A3, verbatim. El cuaderno del laboratorio es opcional. */
export const CUADERNO = {
  prompt:
    "Elige un momento de tu vida que haya dejado una huella importante en ti —una experiencia que cambió cómo piensas, sientes o actúas. Narra ese momento con detalle: ¿cuándo y dónde ocurrió?, ¿quiénes estuvieron presentes?, ¿qué pasó exactamente?, ¿cómo te sentiste?, ¿qué aprendiste o cómo cambiaste a partir de esa experiencia?",
  pistas: [
    "Puedes escribir en primera persona: 'Yo estaba...', 'Recuerdo que...'",
    "Incluye detalles sensoriales: sonidos, colores, sensaciones físicas.",
    "Explica concretamente en qué cambió tu manera de ver las cosas.",
  ],
} as const;

export const NOTA_PIE =
  "Verbatim de LC-II-P01 (Lengua y Comunicación II): la lectura y el recuadro del INALI (A1), el texto con huecos (A2), la consigna del cuaderno (A3), las afirmaciones del reto evaluable (A4) y el glosario (A5). Las dos anécdotas, los doce fragmentos, las ocho versiones de voz y los cuatro encargos son FICCIÓN escrita para este laboratorio: Ximena Robledo y Renata Ceballos son personajes inventados y ningún relato corresponde a una persona real. El laboratorio evalúa el oficio de narrar —ordenar, distinguir suceso y significado, elegir la voz—, nunca lo que al alumno le haya ocurrido.";
