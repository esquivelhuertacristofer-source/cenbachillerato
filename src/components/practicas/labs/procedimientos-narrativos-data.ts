/**
 * Datos — Laboratorio «Procedimientos narrativos» (LC-II-P07).
 *
 * Este laboratorio trabaja LA MAQUINARIA con la que está hecho un relato: no de
 * qué trata ni cómo se corrige, sino cómo está armado. Cuatro piezas de esa
 * maquinaria, que son las cuatro mecánicas del laboratorio:
 *
 *   1. ORDEN — la historia (el orden en que pasaron los hechos) frente al
 *      discurso (el orden en que se cuentan). De la diferencia entre los dos
 *      salen la analepsis y la prolepsis.
 *   2. VOZ — quién cuenta: primera persona, testigo, omnisciente. La misma
 *      escena en tres voces, y qué información gana o pierde cada una.
 *   3. RITMO — resumen, escena, elipsis y pausa descriptiva: cuánto tiempo de
 *      historia ocupa cuánto texto.
 *   4. DIÁLOGO — estilo directo, indirecto e indirecto libre, y la conversión
 *      de uno a otro pieza por pieza (conector, deíctico, pronombre, verbo).
 *
 * QUÉ ES VERBATIM Y QUÉ NO
 *  · VERBATIM de la base de datos: `LECTURA_A1` (LC-II-P07-A1), `QUIZ`
 *    (LC-II-P07-A2, con sus cinco reactivos y sus retroalimentaciones),
 *    `HECHOS` (LC-II-P07-A4), las definiciones y ejemplos de los cuatro
 *    primeros `PARES` (LC-II-P07-A5) y `DATO_DEM` (el callout «¿Sabías?» de
 *    A1). El texto con huecos vive en `procedimientos-narrativos-huecos.ts`
 *    (LC-II-P07-A6, verbatim).
 *  · ILUSTRATIVO: los tres relatos de taller («La bicicleta de Mariela», «La
 *    libreta de Rubén» y «El apagón en la tienda») están escritos para esta
 *    práctica, con personajes ficticios. No son fragmentos de ninguna obra y
 *    así se declara en la nota al pie.
 *  · TERMINOLOGÍA: analepsis, prolepsis, elipsis, pausa, escena y resumen son
 *    los nombres estándar de la narratología (Gérard Genette, «Figures III»,
 *    1972). Las dos obras que se citan en la ficha —«Cien años de soledad»
 *    (Gabriel García Márquez, 1967) y «Pedro Páramo» (Juan Rulfo, 1955)— se
 *    citan por su primera línea, que es la referencia exacta.
 *
 * Sin React ni three: datos puros.
 */

import type { QuizEvaluable } from "./_reto-quiz";
import type { ParTermino } from "./_mecanica-termino";

/* ═══════════════════════════════════════════════════════════════════════════
 * 1 · ORDEN DEL RELATO — historia contra discurso
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Qué hace un párrafo con el tiempo de la historia. */
export type Marca = "sigue" | "analepsis" | "prolepsis";

export const MARCA_INFO: Record<Marca, { titulo: string; corto: string; icono: string; color: string; pista: string }> = {
  sigue: {
    titulo: "Sigue la línea",
    corto: "Sigue",
    icono: "fa-arrow-right-long",
    color: "#5BC8FF",
    pista: "El relato avanza por la línea principal: lo que se cuenta va después de lo último que se contó de esa línea.",
  },
  analepsis: {
    titulo: "Analepsis",
    corto: "Analepsis",
    icono: "fa-rotate-left",
    color: "#FFC75A",
    pista: "El relato retrocede: cuenta algo que pasó ANTES del punto al que ya había llegado. También se le dice retrospección o flashback.",
  },
  prolepsis: {
    titulo: "Prolepsis",
    corto: "Prolepsis",
    icono: "fa-forward",
    color: "#C08BFF",
    pista: "El relato se adelanta: anticipa algo que pasará DESPUÉS y luego vuelve. También se le dice anticipación o flash-forward.",
  },
};

export interface ParrafoDiscurso {
  id: string;
  /** El párrafo tal como aparece en el texto. */
  texto: string;
  /** Lugar que ocupa este hecho en la HISTORIA (1 = el primero que pasó). */
  historia: number;
  /** Qué hace con el tiempo. */
  marca: Marca;
  /** Qué hecho es, dicho en seco (se revela al colocarlo bien). */
  hecho: string;
  /** Por qué lleva esa marca. */
  porque: string;
}

export interface RelatoDoble {
  id: string;
  titulo: string;
  /** Advertencia de que el relato es de taller. */
  ficha: string;
  parrafos: ParrafoDiscurso[];
}

export const RELATOS: RelatoDoble[] = [
  {
    id: "bicicleta",
    titulo: "La bicicleta de Mariela",
    ficha: "Relato de taller, escrito para esta práctica. Cinco párrafos: el orden en que se cuentan no es el orden en que pasaron.",
    parrafos: [
      {
        id: "bi-1",
        texto: "El martes, a las siete de la mañana, Mariela despertó con un mensaje de un número que no conocía.",
        historia: 2,
        marca: "sigue",
        hecho: "Llega el mensaje del número desconocido (martes, 7 a. m.).",
        porque: "Es el arranque del relato y el primer hecho de la línea principal: todavía no hay nada de lo que retroceder ni a lo que adelantarse.",
      },
      {
        id: "bi-2",
        texto: "Lo abrió sin pensarlo: era Beto. Estaba de vuelta y la esperaba en la plaza a las seis.",
        historia: 3,
        marca: "sigue",
        hecho: "Lee el mensaje: es Beto y la cita a las seis (martes, 7 a. m.).",
        porque: "El relato avanza unos segundos por la misma línea: lee el mensaje que acaba de llegar.",
      },
      {
        id: "bi-3",
        texto: "Esa noche seguirían hablando en la misma banca hasta que se fuera la luz de la plaza; pero a las siete de la mañana Mariela todavía no lo sabía.",
        historia: 5,
        marca: "prolepsis",
        hecho: "Se quedan hablando en la banca hasta que anochece (martes, noche).",
        porque: "Se adelanta al final: cuenta la noche del martes cuando el relato apenas va en la mañana, y él mismo lo avisa («todavía no lo sabía»). Eso es una prolepsis.",
      },
      {
        id: "bi-4",
        texto: "Hacía tres años que no lo veía: le había prestado su bicicleta para que llegara a tiempo a la secundaria y Beto se había mudado de ciudad sin devolverla.",
        historia: 1,
        marca: "analepsis",
        hecho: "Le presta la bicicleta y Beto se muda sin devolverla (tres años antes).",
        porque: "Retrocede tres años para explicar qué hay entre los dos. Los verbos lo delatan: «había prestado», «se había mudado». Eso es una analepsis.",
      },
      {
        id: "bi-5",
        texto: "A las seis en punto, la bicicleta estaba recargada en una banca de la plaza, recién pintada de verde.",
        historia: 4,
        marca: "sigue",
        hecho: "Encuentra la bicicleta recién pintada en la plaza (martes, 6 p. m.).",
        porque: "Vuelve a la línea principal y la continúa: del mensaje de la mañana a la cita de las seis. No retrocede ni se adelanta respecto de esa línea.",
      },
    ],
  },
  {
    id: "libreta",
    titulo: "La libreta de Rubén",
    ficha: "Segundo relato de taller. Mismo trabajo, otro armado: aquí la prolepsis va antes que la analepsis.",
    parrafos: [
      {
        id: "li-1",
        texto: "A las cinco de la mañana de aquel enero, Rubén repasaba en la mesa de la cocina con una libreta llena de letra apretada.",
        historia: 2,
        marca: "sigue",
        hecho: "Repasa de madrugada con la libreta (enero, 5 a. m.).",
        porque: "Primer hecho de la línea principal: el relato arranca aquí y todavía no ha ido a ninguna otra parte del tiempo.",
      },
      {
        id: "li-2",
        texto: "En marzo encontraría su número en la lista de admitidos, pegada con cinta en la reja de la escuela; pero para eso faltaban dos meses.",
        historia: 4,
        marca: "prolepsis",
        hecho: "Encuentra su número en la lista de admitidos (marzo).",
        porque: "Salta dos meses hacia adelante y lo dice con todas sus letras («para eso faltaban dos meses»). Adelantar un hecho futuro es una prolepsis.",
      },
      {
        id: "li-3",
        texto: "Un año antes había reprobado el examen de admisión y había jurado no volver a presentarse; su tía Carmen le regaló entonces esa libreta, para que la llenara de dudas.",
        historia: 1,
        marca: "analepsis",
        hecho: "Reprueba, jura no volver y su tía le regala la libreta (un año antes).",
        porque: "Retrocede un año para contar de dónde salió la libreta. «Había reprobado», «había jurado»: el relato se va al pasado. Es una analepsis.",
      },
      {
        id: "li-4",
        texto: "Pero volvamos a enero: a las nueve, Rubén entregó el examen quince minutos antes de que acabara el tiempo.",
        historia: 3,
        marca: "sigue",
        hecho: "Entrega el examen antes de tiempo (enero, 9 a. m.).",
        porque: "El relato regresa a la línea principal y la continúa donde la había dejado, a las cinco de la mañana. El «volvamos a enero» es la costura.",
      },
      {
        id: "li-5",
        texto: "Esa misma noche le mandó a su tía una foto de la lista, sin escribir nada más.",
        historia: 5,
        marca: "sigue",
        hecho: "Le manda a su tía la foto de la lista (marzo, esa noche).",
        porque: "Cierra la línea principal: viene después de la lista de marzo, que el relato ya había adelantado. Sigue la línea, aunque el lector ya supiera el resultado.",
      },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * 2 · QUIÉN CUENTA — la misma escena en tres voces
 * ═══════════════════════════════════════════════════════════════════════════ */

export type Voz = "primera" | "testigo" | "omnisciente";

export const VOZ_INFO: Record<Voz, { titulo: string; subtitulo: string; icono: string; color: string; gana: string; pierde: string }> = {
  primera: {
    titulo: "Primera persona",
    subtitulo: "Narra Irene, la dueña de la tienda: «yo»",
    icono: "fa-user",
    color: "#5BC8FF",
    gana: "Gana lo de adentro: lo que siente, lo que teme, lo que decide sin decirlo. El lector queda pegado a ella.",
    pierde: "Pierde todo lo que ocurre fuera de su vista y de su cabeza: lo que pasa a sus espaldas, lo que piensan los demás, lo que sucede en la calle.",
  },
  testigo: {
    titulo: "Narrador testigo",
    subtitulo: "Narra Chuy, el cliente que esperaba en la fila",
    icono: "fa-eye",
    color: "#FFC75A",
    gana: "Gana la mirada de fuera: ve a Irene entera, quieta detrás del mostrador, y cuenta lo que él mismo hace y piensa.",
    pierde: "Pierde el interior de Irene: solo puede suponerlo. «Qué estaría pensando, no lo sé» es la frase del testigo.",
  },
  omnisciente: {
    titulo: "Narrador omnisciente",
    subtitulo: "Narra una voz que no está en la escena y lo sabe todo",
    icono: "fa-globe",
    color: "#C08BFF",
    gana: "Gana todo: las dos cabezas, la causa del apagón tres calles arriba y lo que pasa en la casa de enfrente.",
    pierde: "Pierde la sorpresa y la cercanía: si la voz lo sabe todo, el lector no descubre nada junto a nadie.",
  },
};

/** La MISMA escena, contada tres veces. Fragmentos ilustrativos. */
export const ESCENA_VOCES: Record<Voz, string> = {
  primera:
    "Estaba contando los billetes del día cuando todo se apagó de golpe. Sentí el frío del mostrador bajo las manos y me quedé quieta, con el miedo atorado en la garganta; esa tarde había pensado cerrar temprano, y ya ni eso. En el radio seguía sonando «La barca de oro», como si nada. Me di la vuelta y busqué a tientas las velas en el segundo cajón. No sé qué habrá hecho el señor que esperaba en la fila: a mis espaldas no se oía nada.",
  testigo:
    "Yo estaba en la fila con mi refresco cuando se fue la luz. Doña Irene se quedó tiesa detrás del mostrador, con las manos abiertas sobre los billetes; no dijo una palabra. Del radio seguía saliendo «La barca de oro». Por un segundo pensé que era un buen momento para irme sin pagar, y enseguida me dio vergüenza haberlo pensado; cuando ella se dio la vuelta a buscar las velas, saqué el celular y le alumbré el pasillo. Qué estaría pensando, eso no lo sé.",
  omnisciente:
    "A las siete y cuarto se quemó un transformador tres calles arriba y la tienda de Irene se quedó a oscuras. Irene, que esa tarde había pensado cerrar temprano, sintió el miedo atorado en la garganta y no se movió. Chuy, el cliente de la fila, pensó que era un buen momento para irse sin pagar, se avergonzó enseguida y terminó alumbrando el pasillo con el celular. En el radio seguía «La barca de oro». Enfrente, la señora Lupe encendía una veladora.",
};

/** Quién puede entregar un dato de la escena. */
export type Quien = "irene" | "chuy" | "omni" | "todas";

export const QUIEN_INFO: Record<Quien, { titulo: string; icono: string; color: string }> = {
  irene: { titulo: "Irene y el omnisciente", icono: "fa-user", color: "#5BC8FF" },
  chuy: { titulo: "Chuy y el omnisciente", icono: "fa-eye", color: "#FFC75A" },
  omni: { titulo: "Solo el omnisciente", icono: "fa-globe", color: "#C08BFF" },
  todas: { titulo: "Las tres voces", icono: "fa-users", color: "#34D399" },
};

export interface Informacion {
  id: string;
  texto: string;
  quien: Quien;
  porque: string;
}

export const INFORMACIONES: Informacion[] = [
  {
    id: "in-1",
    texto: "El miedo atorado en la garganta de Irene.",
    quien: "irene",
    porque: "Lo que se siente por dentro solo lo cuenta quien lo siente o una voz que entra en las cabezas. Chuy, desde la fila, apenas ve que ella no se mueve.",
  },
  {
    id: "in-2",
    texto: "Que alguien alumbró el pasillo con el celular mientras Irene buscaba las velas de espaldas.",
    quien: "chuy",
    porque: "Irene estaba de espaldas y a oscuras; su versión dice «no sé qué habrá hecho». Lo que queda fuera del campo del narrador no puede contarse.",
  },
  {
    id: "in-3",
    texto: "Que tres calles arriba se había quemado un transformador.",
    quien: "omni",
    porque: "Ninguno de los dos salió de la tienda. La causa del apagón solo la puede dar una voz que no está atada a un cuerpo ni a un lugar.",
  },
  {
    id: "in-4",
    texto: "Que en el radio seguía sonando «La barca de oro».",
    quien: "todas",
    porque: "Es un hecho público de la escena: cualquiera que estuviera ahí lo oyó. Los datos públicos no distinguen voces.",
  },
  {
    id: "in-5",
    texto: "Que Chuy pensó en irse sin pagar y enseguida se avergonzó.",
    quien: "chuy",
    porque: "Cuidado con el testigo: también dice «yo». Su interior sí lo cuenta; lo que no puede es meterse en la cabeza de Irene.",
  },
  {
    id: "in-6",
    texto: "Que Irene había pensado cerrar temprano esa tarde.",
    quien: "irene",
    porque: "Es una decisión que Irene no dijo en voz alta. Desde la fila no se ve una intención: se ve una tienda abierta.",
  },
  {
    id: "in-7",
    texto: "Que enfrente, la señora Lupe encendía una veladora.",
    quien: "omni",
    porque: "Pasa en otro lugar, al mismo tiempo. Solo una voz que puede estar en dos sitios a la vez cuenta lo que ocurre fuera de la escena.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * 3 · RITMO — cuánto tiempo de historia ocupa cuánto texto
 * ═══════════════════════════════════════════════════════════════════════════ */

export type Ritmo = "resumen" | "escena" | "elipsis" | "pausa";

export const RITMO_INFO: Record<Ritmo, { titulo: string; formula: string; subtitulo: string; icono: string; color: string }> = {
  resumen: {
    titulo: "Resumen",
    formula: "mucha historia, poco texto",
    subtitulo: "Meses o años despachados en una o dos líneas.",
    icono: "fa-compress",
    color: "#5BC8FF",
  },
  escena: {
    titulo: "Escena",
    formula: "el texto dura lo que dura el hecho",
    subtitulo: "Diálogo y acción minuto a minuto: el reloj del relato va al paso del de la historia.",
    icono: "fa-masks-theater",
    color: "#34D399",
  },
  elipsis: {
    titulo: "Elipsis",
    formula: "historia sin texto",
    subtitulo: "Un tramo de tiempo que el relato se salta y no cuenta.",
    icono: "fa-scissors",
    color: "#FFC75A",
  },
  pausa: {
    titulo: "Pausa descriptiva",
    formula: "texto sin historia",
    subtitulo: "El tiempo se detiene y el texto sigue: descripción pura.",
    icono: "fa-pause",
    color: "#C08BFF",
  },
};

export interface FragmentoRitmo {
  id: string;
  texto: string;
  ritmo: Ritmo;
  /** Cuánto tiempo de la historia cubre. */
  tiempoHistoria: string;
  /** Cuánto texto ocupa. */
  tiempoRelato: string;
  porque: string;
}

export const FRAGMENTOS_RITMO: FragmentoRitmo[] = [
  {
    id: "fr-1",
    texto: "Pasaron cuatro meses de lluvias, de exámenes y de tardes iguales.",
    ritmo: "resumen",
    tiempoHistoria: "cuatro meses",
    tiempoRelato: "una línea",
    porque: "Cuatro meses caben en una línea: el relato los comprime. Eso es un resumen, y sirve para llegar rápido a lo que sí importa.",
  },
  {
    id: "fr-2",
    texto: "—¿Ya comiste? —preguntó ella. —No. —Siéntate, entonces.",
    ritmo: "escena",
    tiempoHistoria: "unos segundos",
    tiempoRelato: "unos segundos de lectura",
    porque: "Leer el diálogo tarda casi lo mismo que tardó en decirse. Cuando los dos relojes van juntos, hay escena.",
  },
  {
    id: "fr-3",
    texto: "Tres años después, la tienda de la esquina tenía otro nombre.",
    ritmo: "elipsis",
    tiempoHistoria: "tres años que no se cuentan",
    tiempoRelato: "nada",
    porque: "De esos tres años no se cuenta ni un hecho: el relato salta por encima. La elipsis no comprime, omite.",
  },
  {
    id: "fr-4",
    texto: "El mostrador era de madera oscura, con una veta que lo cruzaba de lado a lado como un río seco; encima, un frasco de vidrio con pastillas de menta y una báscula de platillos con el fiel torcido.",
    ritmo: "pausa",
    tiempoHistoria: "cero: nada avanza",
    tiempoRelato: "tres líneas",
    porque: "Nadie hace nada y nada cambia: solo se mira. El texto se alarga mientras la historia se queda quieta. Es una pausa descriptiva.",
  },
  {
    id: "fr-5",
    texto: "Durante el resto del semestre no volvieron a hablarse.",
    ritmo: "resumen",
    tiempoHistoria: "varios meses",
    tiempoRelato: "una línea",
    porque: "El relato sí cuenta qué pasó en esos meses —nada, y ese nada importa—, pero lo despacha en una línea. Es resumen, no elipsis.",
  },
  {
    id: "fr-6",
    texto: "Irene metió la llave, la giró dos veces y empujó la puerta con el hombro.",
    ritmo: "escena",
    tiempoHistoria: "unos segundos",
    tiempoRelato: "unos segundos de lectura",
    porque: "Tres acciones seguidas, en el orden en que ocurrieron y sin saltos. El relato va al paso de la historia: escena.",
  },
  {
    id: "fr-7",
    texto: "De lo que ocurrió esa noche el relato no dice una palabra: la línea siguiente ya es de la mañana.",
    ritmo: "elipsis",
    tiempoHistoria: "una noche entera, en blanco",
    tiempoRelato: "nada",
    porque: "El hueco es el procedimiento: el lector sabe que pasó algo precisamente porque no se lo cuentan. Elipsis.",
  },
  {
    id: "fr-8",
    texto: "Desde la ventana se veía el cerro, y más abajo los techos de lámina, y entre los techos el tinaco azul que nunca terminaba de llenarse.",
    ritmo: "pausa",
    tiempoHistoria: "cero: nada avanza",
    tiempoRelato: "dos líneas",
    porque: "Es una mirada, no un suceso: nada empieza ni termina. El tiempo de la historia está detenido. Pausa descriptiva.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * 4 · DIÁLOGO Y DISCURSO — directo, indirecto, indirecto libre
 * ═══════════════════════════════════════════════════════════════════════════ */

export type Estilo = "directo" | "indirecto" | "libre";

export const ESTILO_INFO: Record<Estilo, { titulo: string; icono: string; color: string; marca: string; ejemplo: string }> = {
  directo: {
    titulo: "Estilo directo",
    icono: "fa-comment",
    color: "#34D399",
    marca: "Raya de diálogo y las palabras exactas del personaje. El narrador se aparta.",
    ejemplo: "—Mañana te traigo el dinero —dijo Beto.",
  },
  indirecto: {
    titulo: "Estilo indirecto",
    icono: "fa-comment-dots",
    color: "#5BC8FF",
    marca: "El narrador lo refiere y lo subordina con «que» o «si». Cambian el verbo, los pronombres y los deícticos.",
    ejemplo: "Beto dijo que al día siguiente le traería el dinero.",
  },
  libre: {
    titulo: "Estilo indirecto libre",
    icono: "fa-comments",
    color: "#C08BFF",
    marca: "Se borra el «dijo que», pero se quedan la tercera persona y el tiempo del narrador: la voz del personaje suena dentro de la del narrador.",
    ejemplo: "No iba a poder. Aquella libreta no servía de nada.",
  },
};

export interface OpcionSlot {
  /** Lo que dice el botón. */
  texto: string;
  /** Lo que se pega en la oración (por defecto, `texto`). */
  pega?: string;
  ok: boolean;
  porque: string;
}

export interface SlotConversion {
  id: string;
  etiqueta: string;
  opciones: OpcionSlot[];
}

export interface Conversion {
  id: string;
  titulo: string;
  de: Estilo;
  a: Estilo;
  original: string;
  /** Trozos fijos del molde: N+1 para N huecos. */
  partes: string[];
  slots: SlotConversion[];
  nota: string;
}

export const CONVERSIONES: Conversion[] = [
  {
    id: "cv-1",
    titulo: "Una promesa",
    de: "directo",
    a: "indirecto",
    original: "—Mañana te traigo el dinero —dijo Beto.",
    partes: ["Beto dijo ", " ", " ", " ", " el dinero."],
    nota: "Al pasar a indirecto se mueven cuatro cosas a la vez: el conector, el deíctico de tiempo, el pronombre y el verbo. Si una se queda sin mover, la oración cojea.",
    slots: [
      {
        id: "s1",
        etiqueta: "Conector",
        opciones: [
          { texto: "que", ok: true, porque: "El estilo indirecto subordina lo dicho con «que»." },
          { texto: "si", ok: false, porque: "«Si» subordina preguntas de sí o no («preguntó si venía»), y aquí no hay pregunta: hay una promesa." },
          { texto: "porque", ok: false, porque: "«Porque» introduce una causa, no lo que alguien dijo." },
        ],
      },
      {
        id: "s2",
        etiqueta: "Deíctico de tiempo",
        opciones: [
          { texto: "mañana", ok: false, porque: "«Mañana» depende de cuándo se habla. Si el narrador cuenta esto meses después, «mañana» ya no señala el mismo día." },
          { texto: "al día siguiente", ok: true, porque: "Los deícticos se recalculan: lo que para Beto era «mañana», para el narrador es «al día siguiente»." },
          { texto: "ayer", ok: false, porque: "Beto prometió algo futuro; «ayer» lo manda al pasado y cambia el sentido." },
        ],
      },
      {
        id: "s3",
        etiqueta: "Pronombre",
        opciones: [
          { texto: "te", ok: false, porque: "«Te» apuntaba al interlocutor dentro del diálogo. El narrador ya no le habla a nadie: tiene que nombrarlo en tercera persona." },
          { texto: "le", ok: true, porque: "El «te» del diálogo pasa a «le»: el narrador se refiere a la persona, no le habla." },
          { texto: "me", ok: false, porque: "«Me» pondría al narrador como destinatario, y el dinero no era para él." },
        ],
      },
      {
        id: "s4",
        etiqueta: "Verbo",
        opciones: [
          { texto: "traigo", ok: false, porque: "El presente del diálogo no sobrevive: el verbo introductor («dijo») está en pasado y arrastra al resto." },
          { texto: "traería", ok: true, porque: "Con el introductor en pasado, el presente del diálogo se vuelve condicional: «traigo» → «traería»." },
          { texto: "traiga", ok: false, porque: "El subjuntivo convertiría la promesa en deseo o en orden." },
        ],
      },
    ],
  },
  {
    id: "cv-2",
    titulo: "Una pregunta",
    de: "directo",
    a: "indirecto",
    original: "—¿Ya comiste? —me preguntó Irene.",
    partes: ["Irene me preguntó ", " ", "", ""],
    nota: "Las preguntas pierden los signos de interrogación al pasar a indirecto: ya no se preguntan, se refieren.",
    slots: [
      {
        id: "s1",
        etiqueta: "Conector",
        opciones: [
          { texto: "si", ok: true, porque: "Las preguntas de sí o no se subordinan con «si»." },
          { texto: "que", ok: false, porque: "«Que» sirve para afirmaciones. Con una pregunta cerrada suena mal: «preguntó que ya había comido»." },
          { texto: "cuándo", ok: false, porque: "«Cuándo» serviría para otra pregunta («¿cuándo comiste?»), no para esta." },
        ],
      },
      {
        id: "s2",
        etiqueta: "Verbo",
        opciones: [
          { texto: "ya comiste", ok: false, porque: "Sigue siendo la forma del diálogo, en segunda persona y en pretérito. El narrador no le habla a nadie." },
          { texto: "ya había comido", ok: true, porque: "El pretérito del diálogo retrocede a antecopretérito: cuando ella preguntó, el comer ya era anterior." },
          { texto: "ya comería", ok: false, porque: "El condicional manda la comida al futuro; la pregunta era por algo ya ocurrido." },
        ],
      },
      {
        id: "s3",
        etiqueta: "Cierre",
        opciones: [
          { texto: ".", ok: true, porque: "En indirecto la pregunta ya no se formula: se cuenta. Se van los signos de interrogación y queda un punto." },
          { texto: "?", pega: "?", ok: false, porque: "El signo de cierre dejaría la oración a medias entre las dos formas: el narrador no está preguntando." },
          { texto: "…", ok: false, porque: "Los puntos suspensivos sugieren una frase interrumpida, y aquí la frase está completa." },
        ],
      },
    ],
  },
  {
    id: "cv-3",
    titulo: "Una cita en la plaza",
    de: "directo",
    a: "indirecto",
    original: "—Aquí te espero hasta las seis —dijo Mariela.",
    partes: ["Mariela dijo ", " ", " ", " hasta las seis."],
    nota: "Los deícticos de lugar se recalculan igual que los de tiempo: el «aquí» del personaje no es el «aquí» del narrador.",
    slots: [
      {
        id: "s1",
        etiqueta: "Conector",
        opciones: [
          { texto: "que", ok: true, porque: "Otra afirmación referida, otro «que»." },
          { texto: "si", ok: false, porque: "No hay pregunta: Mariela afirma que va a esperar." },
          { texto: "cómo", ok: false, porque: "«Cómo» abriría una pregunta por el modo, que nadie hizo." },
        ],
      },
      {
        id: "s2",
        etiqueta: "Verbo",
        opciones: [
          { texto: "espero", ok: false, porque: "El presente y la primera persona son del diálogo. Quien cuenta ahora es el narrador." },
          { texto: "esperaría", ok: true, porque: "Presente del diálogo + introductor en pasado = condicional: «espero» → «esperaría»." },
          { texto: "esperaba", ok: false, porque: "El copretérito diría que ya estaba esperando; Mariela anunciaba que esperaría." },
        ],
      },
      {
        id: "s3",
        etiqueta: "Deíctico de lugar",
        opciones: [
          { texto: "aquí", ok: false, porque: "«Aquí» es el lugar donde está quien habla. El narrador no está en la plaza con ella." },
          { texto: "allí", ok: true, porque: "El «aquí» del personaje se convierte en «allí» para quien cuenta desde fuera." },
          { texto: "acá", ok: false, porque: "«Acá» también señala el lugar del que habla: el mismo problema que «aquí»." },
        ],
      },
    ],
  },
  {
    id: "cv-4",
    titulo: "Lo que Rubén se decía",
    de: "indirecto",
    a: "libre",
    original: "Rubén pensó que no iba a poder, que aquella libreta no servía de nada.",
    partes: ["", "", " ", ""],
    nota: "El indirecto libre quita el andamio («pensó que») y deja la voz del personaje sonando dentro de la del narrador: conserva la tercera persona y el tiempo pasado, pero se lee como si lo pensara él en ese instante.",
    slots: [
      {
        id: "s1",
        etiqueta: "Verbo introductor",
        opciones: [
          { texto: "Rubén pensó que", ok: false, porque: "Con el introductor puesto sigue siendo estilo indirecto: el narrador nos avisa de que eso es un pensamiento." },
          { texto: "(nada: se borra)", pega: "", ok: true, porque: "El indirecto libre se define por lo que quita: desaparecen el verbo introductor y el «que»." },
          { texto: "Rubén se dijo:", ok: false, porque: "Los dos puntos y la cita abren estilo directo, que es el camino contrario." },
        ],
      },
      {
        id: "s2",
        etiqueta: "Primera oración",
        opciones: [
          { texto: "No voy a poder.", ok: false, porque: "«Voy» es primera persona y presente: eso sería estilo directo sin comillas, no indirecto libre." },
          { texto: "No iba a poder.", ok: true, porque: "Tercera persona y tiempo pasado, los del narrador; el pensamiento suena igual, pero sin que nadie lo presente." },
          { texto: "Que no iba a poder.", ok: false, porque: "El «que» es justo el andamio que el indirecto libre suprime." },
        ],
      },
      {
        id: "s3",
        etiqueta: "Segunda oración",
        opciones: [
          { texto: "Esta libreta no sirve de nada.", ok: false, porque: "«Esta» y «sirve» vuelven al aquí y ahora del personaje: otra vez estilo directo." },
          { texto: "Aquella libreta no servía de nada.", ok: true, porque: "«Aquella» y «servía» mantienen la distancia del narrador; la rabia sigue siendo de Rubén." },
          { texto: "¿Aquella libreta servía de algo?", ok: false, porque: "Convertirlo en pregunta cambia lo que el personaje pensaba: no dudaba, estaba seguro." },
        ],
      },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * Contenido verbatim de la progresión
 * ═══════════════════════════════════════════════════════════════════════════ */

/** VERBATIM — LC-II-P07-A1, lectura «Análisis colaborativo: leer y mejorar entre varios». */
export const LECTURA_A1: string[] = [
  "Leer en compañía transforma la experiencia del texto. Cuando analizamos un texto de manera colaborativa, cada persona aporta una perspectiva diferente: lo que una persona pasó por alto, otra lo nota; lo que a una le parece confuso, a otra le resulta claro. El resultado es una comprensión más rica y profunda que la que cualquiera lograría leyendo solo.",
  "El análisis colaborativo de textos tiene varios pasos: (1) lectura individual inicial, (2) identificación personal de elementos narrativos (trama, personajes, tema, tono), (3) puesta en común y discusión de interpretaciones, (4) retroalimentación constructiva entre pares, (5) revisión y mejora colectiva del texto analizado.",
  "Durante el proceso, es importante mantener una actitud de respeto y apertura: el objetivo no es “ganar” la discusión sino aprender del texto y de los demás. La retroalimentación constructiva señala con claridad tanto los aciertos como los aspectos a mejorar, y siempre se enfoca en el texto, no en la persona que lo escribió.",
];

/** VERBATIM — callout «¿Sabías?» de LC-II-P07-A1. */
export const DATO_DEM =
  "El Instituto de Investigaciones Filológicas de la UNAM publica el Diccionario del Español de México (DEM), que registra las particularidades léxicas, semánticas y pragmáticas del español hablado en México — una herramienta imprescindible para investigadores y docentes de Lengua.";

/** VERBATIM — LC-II-P07-A4, quiz de verdadero o falso. */
export const HECHOS: { enunciado: string; respuesta: boolean; retroalimentacion: string }[] = [
  {
    enunciado: "Intercambiar experiencias y dialogar entre pares enriquece el análisis de un texto.",
    respuesta: true,
    retroalimentacion: "Correcto: distintas miradas aportan más ideas.",
  },
  {
    enunciado: "La retroalimentación entre compañeros sirve para corregir y mejorar lo escrito.",
    respuesta: true,
    retroalimentacion: "Correcto: ayuda a detectar aciertos y áreas de mejora.",
  },
  {
    enunciado: "En un trabajo colaborativo solo importa la opinión de una persona.",
    respuesta: false,
    retroalimentacion: "Colaborar implica escuchar y valorar las aportaciones de todas las personas.",
  },
  {
    enunciado: "Construir un texto narrativo en equipo requiere acordar ideas y respetar turnos.",
    respuesta: true,
    retroalimentacion: "Correcto: la colaboración necesita acuerdos y respeto.",
  },
];

/**
 * Glosario que se escribe.
 *
 * Los cuatro primeros son VERBATIM de LC-II-P07-A5 (término, definición y
 * ejemplo). Los dos últimos se redactan a partir de las retroalimentaciones
 * VERBATIM del quiz LC-II-P07-A2 («El final abierto deja la resolución a la
 * interpretación del lector») y del trabajo del propio laboratorio, para que el
 * glosario cubra también los procedimientos, que es el tema de la progresión.
 */
export const PARES: ParTermino[] = [
  {
    id: "pn-1",
    termino: "Procedimiento narrativo",
    definicion: "Recurso o estrategia que se usa para construir una narración.",
    ejemplo: "El uso del suspenso, el narrador en primera persona, los saltos en el tiempo.",
  },
  {
    id: "pn-2",
    termino: "Texto colaborativo",
    definicion: "Texto creado entre varias personas que aportan y acuerdan ideas.",
    ejemplo: "Un cuento escrito por todo el equipo.",
  },
  {
    id: "pn-3",
    termino: "Diálogo entre pares",
    definicion: "Conversación entre compañeros para compartir ideas y puntos de vista.",
    ejemplo: "Comentar en equipo qué les pareció un cuento.",
  },
  {
    id: "pn-4",
    termino: "Retroalimentación",
    definicion: "Comentarios que señalan aciertos y aspectos a mejorar de un trabajo.",
    ejemplo: "Decir a un compañero qué parte de su texto quedó clara y cuál no.",
  },
  {
    id: "pn-5",
    termino: "Final abierto",
    definicion: "Desenlace que no resuelve el conflicto de forma explícita y deja la resolución a la interpretación del lector.",
    ejemplo: "El relato termina con la puerta abriéndose y nunca dice quién estaba del otro lado.",
  },
  {
    id: "pn-6",
    termino: "Narrador testigo",
    definicion: "Narrador que cuenta desde fuera lo que vio: sabe lo que ocurrió delante de él, pero no lo que pensaron los demás.",
    ejemplo: "«Doña Irene se quedó tiesa detrás del mostrador. Qué estaría pensando, eso no lo sé.»",
  },
];

/** VERBATIM — LC-II-P07-A2, quiz de opción múltiple (actividad ancla). */
export const QUIZ: QuizEvaluable = {
  titulo: "Procedimientos narrativos: identificando técnicas",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "¿Qué es la analepsis (o flashback) en un texto narrativo?",
      opciones: [
        "Un salto hacia el futuro",
        "Un retroceso hacia el pasado dentro de la narración",
        "Un cambio de personaje narrador",
        "Una descripción detallada del escenario",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "La analepsis interrumpe el orden cronológico para narrar eventos pasados.",
    },
    {
      enunciado: "¿Qué efecto produce el uso del presente narrativo en una historia que ocurrió en el pasado?",
      opciones: ["Confusión temporal", "Mayor inmediatez y tensión", "Distanciamiento del lector", "Nada especial"],
      respuestaCorrecta: 1,
      retroalimentacion: "El presente narrativo acerca al lector a la acción, creando sensación de inmediatez.",
    },
    {
      enunciado: "La focalización interna en un texto narrativo significa que:",
      opciones: [
        "El narrador sabe todo sobre todos los personajes",
        "El narrador percibe la historia desde la perspectiva limitada de un personaje",
        "El texto tiene muchos personajes",
        "La historia se cuenta en tercera persona",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "La focalización interna limita la información al punto de vista de un personaje específico.",
    },
    {
      enunciado: "¿Qué es el suspenso narrativo?",
      opciones: [
        "Un error gramatical común en narrativas populares",
        "La técnica de mantener al lector en incertidumbre sobre lo que ocurrirá",
        "Una figura retórica de comparación",
        "El final de la historia",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "El suspenso mantiene la expectativa del lector sobre el desenlace, generando tensión.",
    },
    {
      enunciado: "Un texto que termina de forma abierta (sin resolver el conflicto explícitamente) usa:",
      opciones: ["Un desenlace cerrado", "Un desenlace abierto o final abierto", "Un epílogo", "Una analepsis"],
      respuestaCorrecta: 1,
      retroalimentacion: "El final abierto deja la resolución a la interpretación del lector.",
    },
  ],
};

export const NOTA_PIE =
  "Verbatim de la progresión LC-II-P07: la lectura A1 y su callout, el reto evaluable (A2, con sus retroalimentaciones), los hechos de verdadero o falso (A4), los cuatro primeros términos del glosario (A5) y el texto con huecos (A6). ILUSTRATIVO: los relatos «La bicicleta de Mariela», «La libreta de Rubén» y «El apagón en la tienda» están escritos para esta práctica con personajes ficticios; no son fragmentos de ninguna obra publicada. Los nombres de los procedimientos (analepsis, prolepsis, elipsis, pausa, escena, resumen, estilos directo, indirecto e indirecto libre) son la terminología estándar de la narratología (Gérard Genette, «Figures III», 1972). Las dos obras citadas en la ficha se citan por su primera línea: Gabriel García Márquez, «Cien años de soledad» (1967) y Juan Rulfo, «Pedro Páramo» (1955).";
