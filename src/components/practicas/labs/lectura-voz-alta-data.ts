/**
 * Datos del laboratorio «Leer en voz alta» — LC-I-P07 (Lengua y Comunicación I).
 *
 * Progresión: «Practica la lectura en voz alta de algunos textos para luego
 * emitir opiniones al respecto.»
 *
 * Qué es VERBATIM de la base de datos:
 *  · `MARCO` y `DATO_PAZ` y `PREGUNTAS_A1` → lectura LC-I-P07-A1.
 *  · `QUIZ` → quiz evaluable LC-I-P07-A2 (enunciados, opciones, correctas,
 *    retroalimentación y puntaje mínimo).
 *  · `PISTAS_A3` y `CRITERIOS_A3` → reflexión escrita LC-I-P07-A3.
 *  · `HECHOS` → verdadero/falso LC-I-P07-A4.
 *  · `PARES` → glosario interactivo LC-I-P07-A5 (término, definición, ejemplo).
 *  · `DEBATE_A7` → debate estructurado LC-I-P07-A7.
 *  · (el texto con huecos de A6 vive en `lectura-voz-alta-huecos.ts`.)
 *
 * Qué es MODELO escrito para esta práctica (y se dice en la nota al pie):
 *  · Los tres textos de «Marca la partitura» (`TEXTOS`), sus puntos de
 *    decisión y sus explicaciones. La progresión pide «textos de su elección»
 *    y no trae ninguno, así que se escribieron aquí: son ILUSTRATIVOS.
 *  · Los cuatro fragmentos de «Ajusta el ritmo» (`FRAGMENTOS`) y sus
 *    intervalos de velocidad y de pausa: son ORIENTATIVOS, no una norma.
 *  · Las seis lecturas ajenas de «Juzga la lectura» (`LECTURAS`): los nombres
 *    son ficticios a propósito, para no atribuir a nadie real una lectura.
 *
 * Los hechos externos que se citan sí son reales y comprobables: la primera
 * línea del Metro de la Ciudad de México se inauguró el 4 de septiembre de
 * 1969, y Octavio Paz recibió el Premio Nobel de Literatura en 1990.
 *
 * Reglas de prosodia del español que usa el laboratorio (son descripción
 * estándar, no invención): las preguntas totales —las que se responden con sí
 * o no— terminan con entonación ascendente; las preguntas parciales, las que
 * empiezan con «qué», «cuántas», «cómo», terminan descendiendo.
 *
 * Sin React ni three: datos puros.
 */

import type { QuizEvaluable } from "./_reto-quiz";
import type { ParTermino } from "./_mecanica-termino";

export const FUENTE = "Material elaborado para CEN Bachillerato";
export const ANCLA = "LC-I-P07-A2 · Lectura en voz alta: elementos y técnica";

/* ═══════════════════════════════════════════════════════════════════════════
 * Lectura A1 — verbatim
 * ═══════════════════════════════════════════════════════════════════════════ */
export const MARCO: string[] = [
  "La lectura en voz alta es mucho más que pronunciar palabras. Es una práctica que requiere preparación, técnica y presencia. Cuando leemos en voz alta para otros, nos convertimos en intermediarios entre el texto y el público: nuestra voz, nuestro ritmo y nuestras pausas dan vida a las palabras escritas.",
  "Los elementos técnicos de la lectura en voz alta incluyen la dicción (pronunciación clara de cada sílaba), la entonación (variaciones de tono que expresan preguntas, exclamaciones, afirmaciones), el ritmo (velocidad adecuada, ni demasiado rápida ni demasiado lenta) y las pausas (que permiten al oyente procesar lo que escuchó).",
  "Leer en voz alta también desarrolla nuestra capacidad de escucha activa. Cuando somos oyentes, nos entrenamos para seguir el hilo de un texto, para detectar inconsistencias y para emitir opiniones fundamentadas. Emitir una opinión sobre una lectura no es simplemente decir si nos gustó o no: es explicar por qué, con argumentos basados en el texto.",
];

/** Recuadro «¿sabías que?» de A1, verbatim. */
export const DATO_PAZ =
  "Octavio Paz, Premio Nobel de Literatura 1990, analizó la identidad mexicana en El laberinto de la soledad (1950). Sus reflexiones sobre la máscara, la fiesta y la muerte como rasgos culturales siguen siendo referencia en los estudios de comunicación y humanidades.";

/** Preguntas de comprensión de A1, verbatim. */
export const PREGUNTAS_A1: { pregunta: string; respuesta: string }[] = [
  { pregunta: "¿Qué elementos técnicos de la lectura en voz alta se mencionan?", respuesta: "Dicción, entonación, ritmo y pausas." },
  {
    pregunta: "¿Qué significa emitir una opinión fundamentada sobre una lectura?",
    respuesta: "Explicar el porqué con argumentos basados en el texto, no solo decir si gustó o no.",
  },
  {
    pregunta: "¿Qué capacidad desarrolla ser oyente de una lectura en voz alta?",
    respuesta: "La escucha activa: seguir el hilo del texto, detectar inconsistencias y opinar con argumentos.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 1 · «Marca la partitura»
 *
 * El alumno elige un marcador y lo coloca sobre la palabra que lo pide. Los
 * textos son ilustrativos; lo que NO es ilustrativo es la razón: cada punto se
 * justifica con la puntuación o con el sentido de la frase.
 * ═══════════════════════════════════════════════════════════════════════════ */
export type Marca = "pausaBreve" | "pausaLarga" | "enfasis" | "entonacion";

export const MARCAS: Marca[] = ["pausaBreve", "pausaLarga", "enfasis", "entonacion"];

export const MARCA_INFO: Record<
  Marca,
  { titulo: string; simbolo: string; icono: string; color: string; descripcion: string; errorGenerico: string }
> = {
  pausaBreve: {
    titulo: "Pausa breve",
    simbolo: "|",
    icono: "fa-pause",
    color: "#5BC8FF",
    descripcion: "Un silencio corto. Va donde la coma separa dos partes de la misma idea.",
    errorGenerico: "Aquí la frase no se corta: si te detienes, partes una idea por la mitad. La pausa breve vive en las comas.",
  },
  pausaLarga: {
    titulo: "Pausa larga",
    simbolo: "‖",
    icono: "fa-stop",
    color: "#A78BFA",
    descripcion: "Un silencio de respiración. Va en el punto y en los dos puntos, donde una idea termina o se anuncia otra.",
    errorGenerico: "Una pausa larga aquí deja al oyente esperando algo que no llega. Búscala donde la idea de verdad cierra: en el punto o en los dos puntos.",
  },
  enfasis: {
    titulo: "Énfasis",
    simbolo: "●",
    icono: "fa-bolt",
    color: "#FFC75A",
    descripcion: "Más fuerza y un poco más de tiempo sobre una palabra. Va en la que carga el sentido.",
    errorGenerico: "Si enfatizas todo, no enfatizas nada. Busca la palabra que trae la información nueva o la que sostiene la imagen.",
  },
  entonacion: {
    titulo: "Cambio de entonación",
    simbolo: "↗",
    icono: "fa-arrow-trend-up",
    color: "#34D399",
    descripcion: "La voz sube o baja. Va donde el texto pregunta, exclama o cierra.",
    errorGenerico: "El tono cambia donde el texto cambia de intención: en los signos de interrogación y de exclamación. En medio de una afirmación, no.",
  },
};

export interface PuntoTexto {
  id: string;
  /** Índice del token que recibe la marca (las pausas se dibujan detrás de él). */
  token: number;
  marca: Marca;
  /** Solo para `entonacion`: hacia dónde va la voz. */
  direccion?: "sube" | "baja";
  razon: string;
}

export interface TextoPartitura {
  id: string;
  titulo: string;
  genero: string;
  intencion: string;
  icono: string;
  tokens: string[];
  puntos: PuntoTexto[];
}

export const TEXTOS: TextoPartitura[] = [
  {
    id: "noticia",
    titulo: "El Metro cumple años",
    genero: "Nota informativa",
    intencion: "Leerla para informar: el oyente tiene que quedarse con los datos, no con tu emoción.",
    icono: "fa-newspaper",
    tokens: [
      "El", "Metro", "de", "la", "Ciudad", "de", "México", "abrió", "su", "primera", "línea", "en", "1969.",
      "Desde", "entonces", "mueve", "a", "millones", "de", "personas", "cada", "día,", "y", "por", "eso",
      "aparece", "en", "casi", "cualquier", "conversación", "sobre", "la", "ciudad.",
      "¿Cuántas", "líneas", "crees", "que", "tiene", "hoy?",
    ],
    puntos: [
      {
        id: "n1",
        token: 9,
        marca: "enfasis",
        razon: "«Primera» es la palabra que carga el dato: si la dices igual que las demás, el oyente no se entera de qué se estrenó ese año.",
      },
      {
        id: "n2",
        token: 12,
        marca: "pausaLarga",
        razon: "El punto cierra la primera idea, la del año. Una pausa larga le da al oyente el tiempo de fijar la fecha antes de que llegue lo siguiente.",
      },
      {
        id: "n3",
        token: 17,
        marca: "enfasis",
        razon: "La cifra es lo nuevo de la oración. El énfasis la hace oír aunque el oyente venga distraído.",
      },
      {
        id: "n4",
        token: 21,
        marca: "pausaBreve",
        razon: "La coma separa el dato del movimiento diario de la consecuencia que viene después. Basta un silencio corto: la idea todavía no termina.",
      },
      {
        id: "n5",
        token: 32,
        marca: "pausaLarga",
        razon: "Segundo punto: aquí termina lo que tenías que contar. Respira antes de dirigirte al público, o la pregunta se pegará al dato anterior.",
      },
      {
        id: "n6",
        token: 33,
        marca: "entonacion",
        direccion: "sube",
        razon: "Al abrir la pregunta la voz sube. Si entras plano, el oyente tarda media frase en darse cuenta de que le estás preguntando algo.",
      },
      {
        id: "n7",
        token: 38,
        marca: "entonacion",
        direccion: "baja",
        razon: "Ojo: las preguntas que empiezan con «cuántas», «qué» o «cómo» BAJAN el tono al final. Solo suben al final las que se responden con sí o no.",
      },
    ],
  },
  {
    id: "poema",
    titulo: "Aguacero en la azotea",
    genero: "Texto literario",
    intencion: "Leerlo para que el oyente vea la escena: aquí el silencio vale tanto como la palabra.",
    icono: "fa-feather-pointed",
    tokens: [
      "La", "lluvia", "llegó", "de", "golpe,", "sin", "avisar.",
      "Tapó", "los", "techos,", "las", "bardas,", "el", "ruido", "de", "los", "coches.",
      "¡Qué", "silencio", "tan", "raro", "deja", "el", "agua", "cuando", "cae!",
      "Después,", "nada:", "solo", "el", "goteo", "de", "la", "azotea.",
    ],
    puntos: [
      {
        id: "p1",
        token: 4,
        marca: "pausaBreve",
        razon: "La coma aísla «de golpe». Sin ese silencio corto la frase se vuelve una sola cuerda y el golpe se pierde.",
      },
      {
        id: "p2",
        token: 6,
        marca: "pausaLarga",
        razon: "Punto: la primera imagen está completa. Espera un instante antes de empezar la enumeración.",
      },
      {
        id: "p3",
        token: 9,
        marca: "pausaBreve",
        razon: "Primera coma de la enumeración. Cada elemento necesita su silencio o los tres se oyen como uno solo.",
      },
      {
        id: "p4",
        token: 11,
        marca: "pausaBreve",
        razon: "Segunda coma de la enumeración: el mismo silencio breve, para que techos, bardas y ruido se oigan como tres cosas distintas.",
      },
      {
        id: "p5",
        token: 16,
        marca: "pausaLarga",
        razon: "Punto: la enumeración cerró. Si sigues de largo, la exclamación que viene pierde el efecto de llegar después del silencio.",
      },
      {
        id: "p6",
        token: 17,
        marca: "entonacion",
        direccion: "sube",
        razon: "La exclamación abre con la voz arriba. Es lo único que distingue el asombro de un dato dicho de pasada.",
      },
      {
        id: "p7",
        token: 18,
        marca: "enfasis",
        razon: "«Silencio» sostiene toda la imagen. Dilo un poco más fuerte y un poco más lento: la palabra tiene que sonar a lo que nombra.",
      },
      {
        id: "p8",
        token: 25,
        marca: "entonacion",
        direccion: "baja",
        razon: "La exclamación se abre arriba y se cierra abajo: el tono cae en la última palabra. Si la dejas arriba, suena a que la frase no terminó.",
      },
      {
        id: "p9",
        token: 26,
        marca: "pausaBreve",
        razon: "«Después» va seguido de coma porque ordena el tiempo. Un silencio corto marca que lo que sigue ocurre más tarde.",
      },
      {
        id: "p10",
        token: 27,
        marca: "pausaLarga",
        razon: "Los dos puntos anuncian: abren el espacio de lo que falta por decir. Una pausa más larga que la coma hace que el oyente espere.",
      },
    ],
  },
  {
    id: "relato",
    titulo: "Una sola palabra",
    genero: "Relato con diálogo",
    intencion: "Leerlo para narrar: hay dos personas hablando y tu voz tiene que distinguirlas.",
    icono: "fa-comments",
    tokens: [
      "Mi", "abuela", "preguntó", "desde", "la", "cocina:", "¿ya", "terminaste?",
      "Le", "dije", "que", "todavía", "no,", "sin", "levantar", "la", "vista", "del", "cuaderno.",
      "Ella", "se", "asomó,", "leyó", "por", "encima", "de", "mi", "hombro", "y", "me", "dijo",
      "una", "sola", "palabra:", "léelo.",
    ],
    puntos: [
      {
        id: "r1",
        token: 5,
        marca: "pausaLarga",
        razon: "Los dos puntos anuncian lo que la abuela dijo. La pausa avisa al oyente de que ahora habla otra persona.",
      },
      {
        id: "r2",
        token: 6,
        marca: "entonacion",
        direccion: "sube",
        razon: "El signo de apertura avisa: desde la primera palabra la voz se levanta, para que quien escucha sepa que viene una pregunta y no una orden.",
      },
      {
        id: "r3",
        token: 7,
        marca: "entonacion",
        direccion: "sube",
        razon: "Es una pregunta que se responde con sí o no, así que la voz sube hasta el final. Si la bajas, suena a reproche en vez de a pregunta.",
      },
      {
        id: "r4",
        token: 12,
        marca: "pausaBreve",
        razon: "La coma separa la respuesta del gesto que la acompaña. Silencio corto: la oración sigue.",
      },
      {
        id: "r5",
        token: 18,
        marca: "pausaLarga",
        razon: "Punto y final de la escena. Aquí se respira antes de cambiar de imagen.",
      },
      {
        id: "r6",
        token: 21,
        marca: "pausaBreve",
        razon: "Coma entre tres acciones seguidas. Sin ella se atropellan y el oyente no alcanza a ver a la abuela asomarse.",
      },
      {
        id: "r7",
        token: 33,
        marca: "pausaLarga",
        razon: "Otra vez los dos puntos, y esta vez lo que sigue es una sola palabra: la pausa larga es la que la vuelve importante.",
      },
      {
        id: "r8",
        token: 34,
        marca: "enfasis",
        razon: "La orden es el remate del relato. Dila más despacio y con más fuerza que todo lo anterior: es lo que el oyente se va a llevar.",
      },
    ],
  },
];

export const PUNTOS_TOTALES = TEXTOS.reduce((n, t) => n + t.puntos.length, 0);

/** El texto tal cual, para el apoyo de voz. */
export function lecturaDe(t: TextoPartitura): string {
  return t.tokens.join(" ");
}

/** El mismo texto sin puntuación: así suena leído «de corrido». */
export function lecturaCorridaDe(t: TextoPartitura): string {
  return t.tokens.join(" ").replace(/[.,:;¿?¡!]/g, "");
}

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 2 · «Ajusta el ritmo»
 *
 * Los intervalos son ORIENTATIVOS. La referencia de la que parten: una lectura
 * en voz alta para público suele moverse alrededor de 120–150 palabras por
 * minuto, más lenta que la conversación. A partir de ahí, cada tipo de texto
 * empuja hacia arriba o hacia abajo por una razón que el alumno puede discutir.
 * ═══════════════════════════════════════════════════════════════════════════ */
export interface FragmentoRitmo {
  id: string;
  titulo: string;
  genero: string;
  icono: string;
  texto: string;
  /** Para qué se lee: es la pista honesta del ejercicio. */
  proposito: string;
  ppmMin: number;
  ppmMax: number;
  pausaMin: number;
  pausaMax: number;
  /** Punto de partida de los controles: nunca dentro del intervalo correcto,
   *  para que el fragmento no se resuelva solo sin tocar nada. */
  ppmInicial: number;
  pausaInicial: number;
  /** Cuántas pausas fuertes tiene el fragmento (para estimar la duración). */
  pausas: number;
  razon: string;
}

export const FRAGMENTOS: FragmentoRitmo[] = [
  {
    id: "radio",
    titulo: "Boletín de radio",
    genero: "Nota informativa",
    icono: "fa-tower-broadcast",
    texto:
      "La Secretaría de Salud informó que la campaña de vacunación continuará el sábado en los doce centros de salud del municipio, de nueve de la mañana a dos de la tarde.",
    proposito: "Lo escucha alguien que está manejando o desayunando. Tiene que entenderlo a la primera y sin esfuerzo.",
    ppmMin: 145,
    ppmMax: 170,
    pausaMin: 0.3,
    pausaMax: 0.6,
    ppmInicial: 105,
    pausaInicial: 1.2,
    pausas: 2,
    razon:
      "La noticia busca claridad, no emoción. Un ritmo ágil sostiene la atención de quien escucha mientras hace otra cosa, y las pausas solo tienen que separar los datos: si las estiras, el boletín se vuelve solemne y suena raro.",
  },
  {
    id: "poema",
    titulo: "Tres versos",
    genero: "Texto literario",
    icono: "fa-feather-pointed",
    texto: "El patio se quedó sin nadie. La higuera guarda la sombra de la tarde. Alguien apaga la luz de la cocina.",
    proposito: "Lo escucha alguien que quiere ver la escena. Cada imagen necesita tiempo para formarse en su cabeza.",
    ppmMin: 90,
    ppmMax: 115,
    pausaMin: 1.1,
    pausaMax: 1.8,
    ppmInicial: 160,
    pausaInicial: 0.4,
    pausas: 3,
    razon:
      "El texto literario vive de las imágenes, y una imagen no se ve si la siguiente ya está encima. Se lee despacio y las pausas son largas, incluso donde no hay coma: el silencio es parte del poema.",
  },
  {
    id: "instructivo",
    titulo: "Paso de laboratorio",
    genero: "Instructivo",
    icono: "fa-flask",
    texto: "Vierte el líquido en el vaso de precipitados. Espera a que deje de burbujear. Anota la temperatura antes de continuar.",
    proposito: "Quien escucha está haciendo lo que le dices, con las manos ocupadas.",
    ppmMin: 115,
    ppmMax: 140,
    pausaMin: 0.7,
    pausaMax: 1.0,
    ppmInicial: 180,
    pausaInicial: 0.3,
    pausas: 2,
    razon:
      "Una instrucción se ejecuta mientras se oye. El ritmo moderado deja entender cada paso y la pausa amplia entre paso y paso le da al oyente el tiempo de hacerlo antes de que llegue el siguiente.",
  },
  {
    id: "aviso",
    titulo: "Aviso de protección civil",
    genero: "Aviso al público",
    icono: "fa-triangle-exclamation",
    texto: "Mantén la calma. Salir por la puerta más cercana. No usar el elevador. Reunirse en el patio central.",
    proposito: "Lo escucha mucha gente a la vez, en un momento de nervios. No hay segunda oportunidad.",
    ppmMin: 125,
    ppmMax: 150,
    pausaMin: 0.4,
    pausaMax: 0.7,
    ppmInicial: 95,
    pausaInicial: 1.6,
    pausas: 3,
    razon:
      "Un aviso de emergencia no se grita ni se arrastra: ritmo firme y pausas cortas. Demasiado rápido y nadie retiene la instrucción; demasiado lento y la voz transmite duda justo cuando hace falta lo contrario.",
  },
];

/** Palabras por minuto que equivalen a la velocidad normal del sintetizador. */
export const PPM_BASE = 150;
export const PPM_MIN = 80;
export const PPM_MAX = 220;
export const PAUSA_MIN = 0.2;
export const PAUSA_MAX = 2;

export function palabrasDe(texto: string): number {
  return texto.trim().split(/\s+/).filter(Boolean).length;
}

/** Duración estimada del fragmento: palabras a esa velocidad + los silencios. */
export function duracionEstimada(f: FragmentoRitmo, ppm: number, pausa: number): number {
  return (palabrasDe(f.texto) / ppm) * 60 + f.pausas * pausa;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 3 · «Juzga la lectura»
 *
 * Seis lecturas ajenas, descritas por escrito. El alumno diagnostica qué
 * elemento falló y después elige la opinión que sí está fundamentada. Los
 * nombres son ficticios.
 * ═══════════════════════════════════════════════════════════════════════════ */
export type Elemento = "diccion" | "entonacion" | "ritmo" | "pausa" | "enfasis" | "ninguno";

export const ELEMENTOS: Elemento[] = ["diccion", "entonacion", "ritmo", "pausa", "enfasis", "ninguno"];

export const ELEMENTO_INFO: Record<Elemento, { titulo: string; icono: string; color: string; pista: string }> = {
  diccion: { titulo: "Dicción", icono: "fa-comment-dots", color: "#5BC8FF", pista: "¿Se entendió cada sílaba?" },
  entonacion: { titulo: "Entonación", icono: "fa-arrow-trend-up", color: "#34D399", pista: "¿El tono dijo lo que el texto quería decir?" },
  ritmo: { titulo: "Ritmo", icono: "fa-gauge-high", color: "#FF8A3C", pista: "¿La velocidad fue la adecuada?" },
  pausa: { titulo: "Pausa", icono: "fa-pause", color: "#A78BFA", pista: "¿Hubo silencios donde el texto los pedía?" },
  enfasis: { titulo: "Énfasis", icono: "fa-bolt", color: "#FFC75A", pista: "¿La fuerza cayó en la palabra correcta?" },
  ninguno: { titulo: "Sin fallo", icono: "fa-circle-check", color: "#34D399", pista: "Puede que la lectura esté bien hecha." },
};

export interface OpcionOpinion {
  txt: string;
  ok: boolean;
  porQue: string;
}

export interface LecturaAjena {
  id: string;
  lector: string;
  contexto: string;
  descripcion: string;
  elemento: Elemento;
  porQue: string;
  opciones: OpcionOpinion[];
}

export const LECTURAS: LecturaAjena[] = [
  {
    id: "l1",
    lector: "Mariana",
    contexto: "Leyó la nota informativa del Metro ante el grupo.",
    descripcion:
      "Pronunció con claridad todas las palabras, pero no se detuvo ni en los puntos ni en las comas: leyó los cuatro renglones de un tirón y terminó en la mitad del tiempo que los demás.",
    elemento: "pausa",
    porQue:
      "La dicción fue buena y la velocidad, aunque alta, no fue el problema de fondo: lo que faltó fueron los silencios. Sin pausas el oyente no alcanza a separar un dato del siguiente, que es justo la función que la lectura les da.",
    opciones: [
      {
        txt: "Se le entendió cada palabra, pero al no detenerse en los puntos, los tres datos de la nota llegaron pegados y no pude quedarme con ninguno.",
        ok: true,
        porQue: "Reconoce un acierto, nombra el elemento que falló y explica la consecuencia para quien escucha. Eso es una opinión fundamentada.",
      },
      {
        txt: "No me gustó nada: leyó muy mal.",
        ok: false,
        porQue: "Es un juicio sin criterio. No dice qué falló ni por qué, así que Mariana no puede hacer nada con esa opinión.",
      },
      {
        txt: "Leyó rápido porque el texto le parecía aburrido.",
        ok: false,
        porQue: "Atribuye una intención que no se puede comprobar. La opinión fundamentada habla de lo que se escuchó, no de lo que el otro supuestamente sentía.",
      },
    ],
  },
  {
    id: "l2",
    lector: "Diego",
    contexto: "Leyó en voz alta la oración «El Metro abrió su primera línea en 1969».",
    descripcion: "Cargó la voz en la palabra «línea» y pasó de largo por «primera» y por la fecha, que dijo casi entre dientes.",
    elemento: "enfasis",
    porQue:
      "El ritmo, las pausas y la dicción estuvieron bien. Lo que se movió de lugar fue la fuerza: el énfasis cayó en una palabra que el oyente ya esperaba y dejó en la sombra el dato nuevo, que era el año.",
    opciones: [
      {
        txt: "Estuvo bien, aunque yo lo habría leído diferente.",
        ok: false,
        porQue: "No dice en qué sería diferente ni por qué. Una opinión que no da razones no ayuda a mejorar la lectura.",
      },
      {
        txt: "Leyó con buen ritmo, pero puso la fuerza en «línea», que no aporta información nueva; por eso la fecha, que es el dato de la nota, pasó desapercibida.",
        ok: true,
        porQue: "Separa lo que funcionó de lo que no, nombra la palabra concreta y explica el efecto. Se puede corregir con esa opinión en la mano.",
      },
      {
        txt: "Se equivocó de palabra al leer.",
        ok: false,
        porQue: "Describe mal lo que pasó: Diego no leyó una palabra por otra, la acentuó con la voz. Una opinión fundamentada primero describe bien el hecho.",
      },
    ],
  },
  {
    id: "l3",
    lector: "Paola",
    contexto: "Leyó el diálogo del relato ante el grupo.",
    descripcion: "En «¿Ya terminaste?» bajó la voz hasta el final, sin subirla. Varios compañeros entendieron que la abuela estaba regañando, no preguntando.",
    elemento: "entonacion",
    porQue:
      "Es una pregunta que se responde con sí o no, y en español esas preguntas suben el tono al final. Al bajarlo, la misma frase escrita cambió de sentido para el oyente: dejó de ser pregunta.",
    opciones: [
      {
        txt: "Leyó con mucho sentimiento, se notó que le gustó el texto.",
        ok: false,
        porQue: "Elogia sin criterio y esquiva lo que sí se puede observar: el efecto que la entonación tuvo en el sentido de la frase.",
      },
      {
        txt: "El problema es que el texto está mal escrito.",
        ok: false,
        porQue: "Traslada la responsabilidad al texto, que está correctamente puntuado. La opinión sobre una lectura juzga la lectura, no inventa un defecto en el original.",
      },      {
        txt: "Se le entendió todo, pero al bajar el tono al final de la pregunta la frase sonó a reproche: la entonación cambió el sentido de lo que estaba escrito.",
        ok: true,
        porQue: "Nombra el elemento, describe el cambio exacto y explica la consecuencia sobre el significado. Es una opinión con criterio.",
      },

    ],
  },
  {
    id: "l4",
    lector: "Iván",
    contexto: "Leyó el instructivo del laboratorio para que el equipo lo siguiera.",
    descripcion:
      "El ritmo y las pausas fueron los adecuados, pero se comió las sílabas finales: «to'os», «pa'», «na'a». Desde la tercera fila no se entendía qué había que verter.",
    elemento: "diccion",
    porQue:
      "El problema no fue la velocidad ni los silencios, sino la articulación. La dicción es la pronunciación clara de cada sílaba, y sin ella ninguno de los demás elementos alcanza a salvar la lectura.",
    opciones: [
      {
        txt: "Las pausas entre pasos estuvieron bien puestas, pero se comió las sílabas finales y desde el fondo no se entendía el nombre del material: en un instructivo eso vuelve inservible la lectura.",
        ok: true,
        porQue: "Reconoce el acierto, nombra el elemento y liga la consecuencia al tipo de texto. Es exactamente lo que pide una opinión fundamentada.",
      },
      {
        txt: "Habla así siempre, es su forma de ser.",
        ok: false,
        porQue: "Juzga a la persona y no la lectura. La opinión se emite sobre lo que se hizo en esa lectura, que es lo que se puede cambiar practicando.",
      },
      {
        txt: "Le faltó entonación.",
        ok: false,
        porQue: "Nombra un elemento que aquí no falló. Una opinión fundamentada identifica bien el elemento antes de opinar sobre él.",
      },
    ],
  },
  {
    id: "l5",
    lector: "Renata",
    contexto: "Leyó el cuento de suspenso en la hora de tutoría.",
    descripcion:
      "Pronunció perfecto y respetó cada signo, pero entre palabra y palabra dejaba un respiro. A la mitad del segundo párrafo media clase estaba viendo el celular.",
    elemento: "ritmo",
    porQue:
      "Las pausas estaban donde el texto las pedía y la dicción fue clara: lo que falló fue la velocidad. El ritmo también se pierde por lento, no solo por rápido, y un suspenso que no avanza deja de ser suspenso.",
    opciones: [
      {
        txt: "El cuento estaba aburrido, por eso nadie puso atención.",
        ok: false,
        porQue: "Cambia el objeto de la opinión: se pedía opinar sobre la lectura, no sobre el gusto por el texto. Y la causa observable fue la velocidad.",
      },
      {
        txt: "La dicción fue impecable y respetó la puntuación, pero leyó tan despacio que la tensión del cuento se deshizo: el ritmo, además de claro, tiene que sostener la historia.",
        ok: true,
        porQue: "Distingue los elementos que funcionaron del que no, y explica por qué el ritmo importa en ese tipo de texto concreto.",
      },
      {
        txt: "Leyó despacio, que es lo correcto en la lectura en voz alta.",
        ok: false,
        porQue: "Convierte en regla algo que depende del texto. «Ritmo adecuado» no significa siempre lento: significa ni demasiado rápido ni demasiado lento para lo que se lee.",
      },
    ],
  },
  {
    id: "l6",
    lector: "Tere",
    contexto: "Leyó la nota informativa del Metro después de haberla preparado en casa.",
    descripcion:
      "Se detuvo en los puntos, hizo pausas cortas en las comas, subió el tono al abrir la pregunta y lo bajó al cerrarla, y cargó la voz en la cifra. Se le entendió desde el fondo del salón.",
    elemento: "ninguno",
    porQue:
      "No hay un elemento que reparar: dicción, ritmo, pausas, entonación y énfasis hicieron lo que el texto pedía. Emitir una opinión también incluye reconocer lo que salió bien, y decir con qué criterio lo estás juzgando.",
    opciones: [
      {
        txt: "Leyó bien, me gustó mucho.",
        ok: false,
        porQue: "Es el mismo «me gustó» sin argumentos que la lectura A1 descarta: no dice qué hizo bien ni cómo lo sabes.",
      },
      {
        txt: "Se nota que lo ensayó muchísimas veces, casi se lo sabía de memoria.",
        ok: false,
        porQue: "Supone algo que no se escuchó. Opina sobre el ensayo imaginado, no sobre la lectura que sí ocurrió.",
      },      {
        txt: "Puso las pausas en los puntos, subió el tono al abrir la pregunta y lo bajó al cerrarla, y enfatizó la cifra: por eso me quedé con los tres datos de la nota sin tener que releerla.",
        ok: true,
        porQue: "Elogiar también se fundamenta: nombra los elementos concretos y explica el efecto que tuvieron en ti como oyente.",
      },

    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * Glosario A5 — verbatim (término, definición y ejemplo)
 * ═══════════════════════════════════════════════════════════════════════════ */
export const PARES: ParTermino[] = [
  {
    id: "diccion",
    termino: "Dicción",
    definicion: "Pronunciación clara y correcta de los sonidos y sílabas.",
    ejemplo: 'Pronunciar bien cada palabra sin "comerse" letras.',
  },
  {
    id: "entonacion",
    termino: "Entonación",
    definicion: "Variación del tono de la voz para expresar preguntas, exclamaciones o afirmaciones.",
    ejemplo: "Subir el tono al final de una pregunta.",
  },
  {
    id: "ritmo",
    termino: "Ritmo",
    definicion: "Velocidad adecuada de la lectura, ni demasiado rápida ni demasiado lenta.",
    ejemplo: "Leer más despacio una parte importante.",
  },
  {
    id: "pausa",
    termino: "Pausa",
    definicion: "Silencio breve que permite al oyente procesar lo escuchado.",
    ejemplo: "Detenerse un instante después de un punto.",
  },
  {
    id: "paralinguistico",
    termino: "Elemento paralingüístico",
    definicion: "Recurso de la voz que acompaña a las palabras: tono, volumen, ritmo, pausas, énfasis.",
    ejemplo: "Bajar el volumen para crear suspenso.",
  },
];

/** Cierre de A5, verbatim. */
export const ACTIVIDAD_FINAL_A5 = "Lee una oración en voz alta cambiando la entonación y nota cómo cambia su significado.";

/* ═══════════════════════════════════════════════════════════════════════════
 * Reto evaluable — quiz A2 verbatim
 * ═══════════════════════════════════════════════════════════════════════════ */
export const QUIZ: QuizEvaluable = {
  titulo: "Lectura en voz alta: elementos y técnica",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "¿Qué elemento de la lectura en voz alta se refiere a la pronunciación clara de cada sílaba?",
      opciones: ["Entonación", "Ritmo", "Dicción", "Pausa"],
      respuestaCorrecta: 2,
      retroalimentacion: "La dicción es la pronunciación clara y correcta de los sonidos y sílabas.",
    },
    {
      enunciado: "¿Cuál es la función de las pausas en la lectura en voz alta?",
      opciones: ["Descansar al lector", "Permitir al oyente procesar lo que escuchó", "Indicar el final del texto", "Mostrar que el lector no recuerda el texto"],
      respuestaCorrecta: 1,
      retroalimentacion: "Las pausas dan tiempo al oyente para asimilar lo que acaba de escuchar.",
    },
    {
      enunciado: "Emitir una opinión fundamentada sobre una lectura implica:",
      opciones: ["Decir si te gustó o no sin más", "Dar argumentos basados en el texto", "Memorizar fragmentos", "Repetir lo que dijo el docente"],
      respuestaCorrecta: 1,
      retroalimentacion: "Una opinión fundamentada requiere argumentos específicos extraídos del texto leído.",
    },
    {
      enunciado: "¿Qué actitud caracteriza a un buen oyente de lectura en voz alta?",
      opciones: ["Distraerse en otras cosas", "Seguir el hilo del texto y detectar inconsistencias", "Solo escuchar sin pensar", "Leer otro texto al mismo tiempo"],
      respuestaCorrecta: 1,
      retroalimentacion: "La escucha activa implica seguir el hilo y estar atento a posibles inconsistencias o ideas interesantes.",
    },
    {
      enunciado: "La entonación en la lectura en voz alta sirve para:",
      opciones: ["Leer más rápido", "Expresar preguntas, exclamaciones y afirmaciones con variación de tono", "Pronunciar sílabas claramente", "Hacer pausas en los puntos"],
      respuestaCorrecta: 1,
      retroalimentacion: "La entonación varía el tono según el tipo de oración, dando expresividad a la lectura.",
    },
  ],
};

/* ═══════════════════════════════════════════════════════════════════════════
 * Hechos (A4) y debate (A7) — verbatim
 * ═══════════════════════════════════════════════════════════════════════════ */
export const HECHOS: { enunciado: string; verdadero: boolean; retro: string }[] = [
  { enunciado: "La dicción es la pronunciación clara de cada sílaba.", verdadero: true, retro: "Correcto: la dicción se refiere a pronunciar con claridad." },
  {
    enunciado: "Las pausas en la lectura en voz alta solo sirven para que descanse quien lee.",
    verdadero: false,
    retro: "Falso: las pausas permiten al oyente procesar lo que escuchó.",
  },
  {
    enunciado: "La entonación expresa preguntas, exclamaciones y afirmaciones con variaciones de tono.",
    verdadero: true,
    retro: "Correcto: la entonación da expresividad según el tipo de oración.",
  },
  {
    enunciado: "Emitir una opinión fundamentada es solo decir si el texto te gustó.",
    verdadero: false,
    retro: "Falso: una opinión fundamentada explica el porqué con argumentos basados en el texto.",
  },
  { enunciado: "Ser oyente atento desarrolla la escucha activa.", verdadero: true, retro: "Correcto: escuchar con atención permite seguir el hilo y detectar inconsistencias." },
];

export const DEBATE_A7 = {
  tema: "¿Se comprende mejor un texto leyéndolo en voz alta o leyéndolo en silencio?",
  reglas: ["Da al menos dos argumentos para tu postura.", "Reconoce en qué casos la otra forma de leer es mejor."],
  posturas: [
    {
      postura: "Se comprende mejor en voz alta, porque escuchamos y nos concentramos más.",
      argumentos: ["La entonación nos ayuda a captar el sentido.", "Al pronunciar, fijamos más la atención en cada palabra."],
    },
    {
      postura: "Se comprende mejor en silencio, porque vamos a nuestro ritmo y sin distracciones.",
      argumentos: ["Podemos releer las partes difíciles sin interrumpir a nadie.", "Avanzamos más rápido en los textos sencillos."],
    },
  ],
};

/* ═══════════════════════════════════════════════════════════════════════════
 * Reflexión A3 — pistas y criterios, verbatim
 * ═══════════════════════════════════════════════════════════════════════════ */
export const PISTAS_A3: string[] = [
  "¿Es un texto que pide emoción, información o argumentación? ¿Cómo cambia eso tu voz?",
  "¿Hay signos de puntuación que te indiquen dónde hacer pausas?",
  "¿Cambió tu comprensión del texto al escucharlo en voz alta?",
];

export const CRITERIOS_A3: string[] = [
  "Describe con detalle cómo modula la voz para ese texto",
  "Identifica partes difíciles con una razón concreta",
  "Emite una opinión fundamentada sobre el texto",
  "Usa vocabulario técnico de la lectura en voz alta",
];
