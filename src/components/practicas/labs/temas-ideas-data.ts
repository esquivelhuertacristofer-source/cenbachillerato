/**
 * Datos del laboratorio «Tema, idea central y sus hilos» — temas-ideas-narrativa
 * Progresión LC-II-P05 (Lengua y Comunicación II):
 * «Distingue los temas y las ideas centrales y secundarias en las narrativas populares».
 *
 * Qué es VERBATIM de la base de datos:
 *   · LECTURA_A1, DATO_A1, COMPRENSION_A1 → LC-II-P05-A1 (lectura)
 *   · QUIZ                                → LC-II-P05-A2 (quiz verdadero/falso)
 *   · PISTAS_A3                           → LC-II-P05-A3 (reflexión escrita)
 *   · HECHOS                              → LC-II-P05-A4 (quiz verdadero/falso)
 *   · GLOSARIO (los cuatro primeros)      → LC-II-P05-A5 (glosario interactivo)
 *   · CRITERIOS_A7                        → LC-II-P05-A7 (autoevaluación)
 *
 * Qué es material propio: los RELATOS y las FICHAS de relato. Son textos
 * ILUSTRATIVOS escritos para esta práctica, no transcripciones. Están
 * construidos a la manera de la narrativa popular mexicana (leyenda de camino,
 * cuento de familia, relato de la partida) y se declaran como tales en el pie
 * del laboratorio. No se atribuyen a ninguna comunidad, autor ni versión real:
 * la tradición popular se trata como lo que es —un modo serio de pensar el
 * mundo—, no como decorado.
 *
 * Sin three ni React: datos puros.
 */

/* ═══════════════════════════════════════════════════════════════════════════
 * Los tres relatos que se leen y se trabajan
 * ═══════════════════════════════════════════════════════════════════════════ */

export interface Relato {
  id: string;
  titulo: string;
  /** Forma de la narrativa popular: leyenda, cuento, relato. */
  forma: string;
  /** Cómo se presenta el texto (siempre declarado como ilustrativo). */
  procedencia: string;
  parrafos: string[];
  /** Lo que pasa, en una línea. Sirve para la retroalimentación. */
  asunto: string;
  /** De qué trata, en pocas palabras. */
  tema: string;
}

export const RELATOS: Relato[] = [
  {
    id: "olla",
    titulo: "La olla de la barranca",
    forma: "Leyenda de camino",
    procedencia: "Texto ilustrativo escrito para esta práctica",
    parrafos: [
      "Don Aurelio arriaba mulas por el camino de la barranca. Una tarde, al apartar una piedra para que pasara el animal, encontró una olla de barro llena de monedas viejas.",
      "Se llevó un puño esa noche y prometió no volver. Volvió a la semana, y luego cada semana, y cada vez cargaba más de lo que podía subir.",
      "Cuentan en el pueblo que la última vez bajó con dos mulas y no subió con ninguna. Todavía hoy, cuando alguien junta más de lo que necesita, dicen que «ya le está midiendo la olla».",
    ],
    asunto: "un arriero encuentra monedas y vuelve por ellas hasta que no regresa",
    tema: "la codicia que no se sacia",
  },
  {
    id: "silla",
    titulo: "La silla de doña Chole",
    forma: "Cuento de familia",
    procedencia: "Texto ilustrativo escrito para esta práctica",
    parrafos: [
      "Cuando murió don Genaro, su mujer dejó la silla del comedor en su lugar y no dejó que nadie se sentara ahí.",
      "Al principio le ponía su plato. Después sólo el vaso. Después nada, pero la silla seguía vacía y todos daban la vuelta para no rozarla.",
      "Pasaron tres años. Una tarde llegó el nieto más chico, se trepó a la silla sin preguntar y doña Chole, por primera vez, se rió.",
    ],
    asunto: "una viuda guarda el lugar de su marido en la mesa y años después su nieto lo ocupa",
    tema: "el duelo y el modo en que la ausencia se va acomodando",
  },
  {
    id: "rio",
    titulo: "El que cruzó el río dos veces",
    forma: "Relato de la partida",
    procedencia: "Texto ilustrativo escrito para esta práctica",
    parrafos: [
      "A Rosalío lo despidieron en la estación un martes. Del otro lado trabajó dieciocho años y mandó dinero cada quincena.",
      "En las cartas escribía siempre la misma frase: «allá el pan no sabe igual». En las fotos que mandaba salía atrás de alguien más, como si no acabara de llegar del todo.",
      "Cuando volvió, el pueblo lo recibió con música y cohetes. Rosalío saludó a todos, se sentó en la banca de la plaza y dijo que ahora le faltaba el otro lado.",
    ],
    asunto: "un hombre trabaja dieciocho años lejos y al volver dice que le falta el lugar del que volvió",
    tema: "irse y no terminar de llegar",
  },
];

export function relatoPorId(id: string): Relato {
  return RELATOS.find((r) => r.id === id) ?? RELATOS[0]!;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 1 — «¿Qué pasa? ¿De qué trata?»
 * ═══════════════════════════════════════════════════════════════════════════ */

export type Cubeta = "asunto" | "tema";

export const CUBETA_INFO: Record<Cubeta, { label: string; corto: string; descripcion: string; color: string; icono: string }> = {
  asunto: {
    label: "Lo que pasa (asunto)",
    corto: "Asunto",
    descripcion: "Los hechos que se cuentan: quién hace qué y cómo termina.",
    color: "#7DD3FC",
    icono: "fa-film",
  },
  tema: {
    label: "De qué trata (tema)",
    corto: "Tema",
    descripcion: "Aquello sobre lo que la historia hace pensar. Casi nunca está escrito.",
    color: "#C4B5FD",
    icono: "fa-lightbulb",
  },
};

export interface TarjetaAT {
  id: string;
  relatoId: string;
  texto: string;
  cubeta: Cubeta;
  porque: string;
}

export const TARJETAS: TarjetaAT[] = [
  /* La olla de la barranca */
  {
    id: "olla-a1",
    relatoId: "olla",
    texto: "Un arriero encuentra una olla con monedas debajo de una piedra.",
    cubeta: "asunto",
    porque: "Es un hecho del relato: se puede ver, tiene lugar y momento. Eso es el asunto.",
  },
  {
    id: "olla-a2",
    relatoId: "olla",
    texto: "Baja por más cada semana hasta que un día ya no vuelve a subir.",
    cubeta: "asunto",
    porque: "Sigue siendo lo que pasa, ahora hasta el final. Contar el final no es decir de qué trata.",
  },
  {
    id: "olla-t1",
    relatoId: "olla",
    texto: "La codicia que no se sacia.",
    cubeta: "tema",
    porque: "En ninguna línea del relato aparece la palabra «codicia»: la deduces de que siempre vuelve por más. Un tema puede ser implícito.",
  },
  {
    id: "olla-t2",
    relatoId: "olla",
    texto: "El límite entre lo que se necesita y lo que se quiere.",
    cubeta: "tema",
    porque: "Es otro modo de nombrar de qué trata. Un mismo relato admite más de una formulación del tema, siempre que el texto la sostenga.",
  },

  /* La silla de doña Chole */
  {
    id: "silla-a1",
    relatoId: "silla",
    texto: "Una viuda deja vacía la silla de su marido en el comedor.",
    cubeta: "asunto",
    porque: "Es la acción con la que arranca la historia: un hecho, no una idea.",
  },
  {
    id: "silla-a2",
    relatoId: "silla",
    texto: "Tres años después, su nieto se trepa a esa silla y ella se ríe.",
    cubeta: "asunto",
    porque: "Es el desenlace. Cuenta lo que ocurre, aunque el lector sienta que significa algo más.",
  },
  {
    id: "silla-t1",
    relatoId: "silla",
    texto: "El duelo.",
    cubeta: "tema",
    porque: "Cabe en dos palabras y no se menciona nunca en el relato: es el asunto general del que trata, es decir, el tema.",
  },
  {
    id: "silla-t2",
    relatoId: "silla",
    texto: "El modo en que una familia hace lugar a la ausencia.",
    cubeta: "tema",
    porque: "Nombra de qué trata con más precisión que «el duelo», y sigue sin contar ningún hecho.",
  },

  /* El que cruzó el río dos veces */
  {
    id: "rio-a1",
    relatoId: "rio",
    texto: "Un hombre trabaja dieciocho años del otro lado y manda dinero cada quincena.",
    cubeta: "asunto",
    porque: "Son hechos con cifras y fechas. El asunto se puede resumir; el tema se infiere.",
  },
  {
    id: "rio-a2",
    relatoId: "rio",
    texto: "Vuelve al pueblo, lo reciben con música y él dice que le falta el otro lado.",
    cubeta: "asunto",
    porque: "Es la escena final. Que una escena sea significativa no la convierte en el tema.",
  },
  {
    id: "rio-t1",
    relatoId: "rio",
    texto: "La frontera.",
    cubeta: "tema",
    porque: "Es el asunto general del que trata, dicho en una palabra. El relato nunca la nombra: tú la deduces.",
  },
  {
    id: "rio-t2",
    relatoId: "rio",
    texto: "Lo que se queda del otro lado cuando uno se va.",
    cubeta: "tema",
    porque: "Formula el tema de forma más completa: dice sobre qué hace pensar el relato entero, no lo que ocurre en él.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 2 — «El tema que el texto sí sostiene» (+ los hilos que lo sostienen)
 * ═══════════════════════════════════════════════════════════════════════════ */

export interface TemaCandidato {
  id: string;
  texto: string;
  correcto: boolean;
  porque: string;
}

export interface HiloOpcion {
  id: string;
  texto: string;
  /** true si es una idea secundaria que sostiene el tema correcto. */
  sostiene: boolean;
  /** Qué clase de hilo es (motivo que vuelve, objeto, lo que dice alguien). */
  clase: string;
  porque: string;
}

export interface CasoTema {
  relatoId: string;
  candidatos: TemaCandidato[];
  hilos: HiloOpcion[];
}

export const CASOS_TEMA: CasoTema[] = [
  {
    relatoId: "olla",
    candidatos: [
      {
        id: "olla-c1",
        texto: "El peligro de los caminos de montaña",
        correcto: false,
        porque: "El relato no dice que el camino fuera peligroso: don Aurelio baja y sube sin problema una y otra vez. Lo que crece no es el riesgo del camino, es lo que él carga.",
      },
      {
        id: "olla-c2",
        texto: "La codicia que no se sacia",
        correcto: true,
        porque: "El texto lo sostiene línea por línea: promete no volver y vuelve; vuelve cada semana; cada vez carga más de lo que puede subir. Nunca escribe «codicia»: la deduces.",
      },
      {
        id: "olla-c3",
        texto: "La pobreza en el campo mexicano",
        correcto: false,
        porque: "El relato no dice que don Aurelio fuera pobre ni habla de las condiciones del campo. Un tema tiene que estar sostenido por lo que el texto sí dice, no por lo que suponemos.",
      },
    ],
    hilos: [
      {
        id: "olla-h1",
        texto: "«Se llevó un puño esa noche y prometió no volver. Volvió a la semana, y luego cada semana.»",
        sostiene: true,
        clase: "Motivo que se repite",
        porque: "La vuelta es el motivo que se repite. Que rompa su propia promesa, y que la rompa una y otra vez, es lo que sostiene la idea de un deseo que no se llena.",
      },
      {
        id: "olla-h2",
        texto: "«Cada vez cargaba más de lo que podía subir.»",
        sostiene: true,
        clase: "La desproporción",
        porque: "Aquí está la idea secundaria más clara: lo que carga ya no guarda relación con lo que puede. Sin esta línea el tema se quedaría sin apoyo.",
      },
      {
        id: "olla-h3",
        texto: "«Don Aurelio arriaba mulas por el camino de la barranca.»",
        sostiene: false,
        clase: "Dato de situación",
        porque: "Nos dice el oficio y el lugar. Sitúa la historia, pero si cambiara el oficio el tema seguiría siendo el mismo: no lo sostiene.",
      },
      {
        id: "olla-h4",
        texto: "«Una olla de barro llena de monedas viejas.»",
        sostiene: false,
        clase: "Objeto que dispara la trama",
        porque: "Es lo que echa a andar la historia, pero por sí solo no dice nada del tema: hace falta la repetición para que signifique algo.",
      },
      {
        id: "olla-h5",
        texto: "«Cuentan en el pueblo que la última vez bajó con dos mulas.»",
        sostiene: false,
        clase: "Quién cuenta",
        porque: "Indica que el relato es de transmisión oral: interesa para saber qué clase de texto es, no para saber de qué trata.",
      },
    ],
  },
  {
    relatoId: "silla",
    candidatos: [
      {
        id: "silla-c1",
        texto: "El respeto a los abuelos",
        correcto: false,
        porque: "Nadie en el relato habla de respeto ni de obediencia. La silla vacía no es un homenaje: es una ausencia que la familia rodea sin nombrar.",
      },
      {
        id: "silla-c2",
        texto: "La muerte de don Genaro",
        correcto: false,
        porque: "Eso es lo que pasa —y sólo en la primera línea—. El tema no es el suceso, es aquello sobre lo que el suceso hace pensar.",
      },
      {
        id: "silla-c3",
        texto: "El duelo y el modo en que la ausencia se va acomodando",
        correcto: true,
        porque: "El texto lo sostiene con el gesto que se gasta (plato, vaso, nada), la silla que sigue vacía y la risa del final. La palabra «duelo» no aparece nunca.",
      },
    ],
    hilos: [
      {
        id: "silla-h1",
        texto: "«Al principio le ponía su plato. Después sólo el vaso. Después nada.»",
        sostiene: true,
        clase: "Motivo que se repite y cambia",
        porque: "El mismo gesto se repite tres veces y cada vez es menos. Ese desgaste es la idea secundaria que sostiene el tema: el duelo cambia con el tiempo.",
      },
      {
        id: "silla-h2",
        texto: "«La silla seguía vacía y todos daban la vuelta para no rozarla.»",
        sostiene: true,
        clase: "El objeto que vuelve",
        porque: "La silla es el objeto que reaparece en los tres párrafos y mide la ausencia. Alrededor de ella se organiza todo lo que la familia hace.",
      },
      {
        id: "silla-h3",
        texto: "«Cuando murió don Genaro…»",
        sostiene: false,
        clase: "El suceso que abre",
        porque: "Es el hecho con el que arranca la historia: puro asunto. Un hilo del tema no cuenta el suceso, muestra cómo el relato lo trabaja.",
      },
      {
        id: "silla-h4",
        texto: "«Pasaron tres años.»",
        sostiene: false,
        clase: "Dato de tiempo",
        porque: "Marca cuánto tardó, no de qué trata. Si dijera cinco años el tema no cambiaría.",
      },
      {
        id: "silla-h5",
        texto: "«El nieto era el más chico de la familia.»",
        sostiene: false,
        clase: "Detalle del personaje",
        porque: "Un rasgo del personaje que se podría quitar sin que el relato pierda su sentido principal: es una idea secundaria que no sostiene este tema.",
      },
    ],
  },
  {
    relatoId: "rio",
    candidatos: [
      {
        id: "rio-c1",
        texto: "El trabajo duro y el ahorro",
        correcto: false,
        porque: "El relato menciona el trabajo y el dinero en una sola línea y no dice nada sobre ellos. Para ser el tema, el texto tendría que sostenerlo a lo largo del relato.",
      },
      {
        id: "rio-c2",
        texto: "La fiesta del pueblo",
        correcto: false,
        porque: "La música y los cohetes son un detalle de una sola escena. Un detalle, por vistoso que sea, no alcanza para ser el tema de todo el relato.",
      },
      {
        id: "rio-c3",
        texto: "Irse y no terminar de llegar",
        correcto: true,
        porque: "Lo sostienen la frase que repite en las cartas, las fotos en las que siempre está detrás de alguien y la última línea, donde la falta cambia de lugar pero no se acaba.",
      },
    ],
    hilos: [
      {
        id: "rio-h1",
        texto: "«En las cartas escribía siempre la misma frase: allá el pan no sabe igual.»",
        sostiene: true,
        clase: "La frase que vuelve",
        porque: "Es la misma frase, carta tras carta, durante dieciocho años. Lo que se extraña cabe en algo mínimo y cotidiano: ahí se apoya el tema.",
      },
      {
        id: "rio-h2",
        texto: "«Dijo que ahora le faltaba el otro lado.»",
        sostiene: true,
        clase: "Lo que dice el personaje",
        porque: "Es lo único que Rosalío dice en voz alta en todo el relato, y da vuelta a la idea: volvió, pero la falta se mudó de sitio.",
      },
      {
        id: "rio-h3",
        texto: "«Lo despidieron en la estación un martes.»",
        sostiene: false,
        clase: "Dato de situación",
        porque: "El día y el lugar sitúan la escena. Si hubiera sido jueves, el relato diría exactamente lo mismo.",
      },
      {
        id: "rio-h4",
        texto: "«Trabajó dieciocho años y mandó dinero cada quincena.»",
        sostiene: false,
        clase: "Resumen de lo que pasó",
        porque: "Es asunto: cuenta el suceso. Una idea secundaria del tema no resume la trama, sostiene la idea que el relato defiende.",
      },
      {
        id: "rio-h5",
        texto: "«El pueblo lo recibió con música y cohetes.»",
        sostiene: false,
        clase: "Detalle de ambiente",
        porque: "Da color a la escena del regreso. Enriquece el texto, pero podría quitarse sin destruir su sentido principal.",
      },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 3 — «Ni tan ancho ni tan angosto»: la medida del tema
 * ═══════════════════════════════════════════════════════════════════════════ */

export type Medida = "amplio" | "justo" | "estrecho";

export const MEDIDA_INFO: Record<Medida, { label: string; corto: string; descripcion: string; color: string; icono: string }> = {
  amplio: {
    label: "Demasiado amplio",
    corto: "Amplio",
    descripcion: "Le queda grande: con él cabrían cientos de relatos distintos.",
    color: "#FF8A3C",
    icono: "fa-maximize",
  },
  justo: {
    label: "A la medida",
    corto: "A la medida",
    descripcion: "Abarca el relato completo y lo distingue de los demás.",
    color: "#34D399",
    icono: "fa-bullseye",
  },
  estrecho: {
    label: "Demasiado estrecho",
    corto: "Estrecho",
    descripcion: "Le queda chico: sólo cubre un detalle o una escena.",
    color: "#7DD3FC",
    icono: "fa-minimize",
  },
};

export const MEDIDAS: Medida[] = ["amplio", "justo", "estrecho"];

export interface FormulacionTema {
  id: string;
  texto: string;
  medida: Medida;
  porque: string;
}

export interface CasoMedida {
  relatoId: string;
  formulaciones: FormulacionTema[];
}

export const CASOS_MEDIDA: CasoMedida[] = [
  {
    relatoId: "olla",
    formulaciones: [
      {
        id: "olla-m1",
        texto: "La vida",
        medida: "amplio",
        porque: "Cabe cualquier relato que se haya contado nunca. Un tema que sirve para todo no sirve para ninguno.",
      },
      {
        id: "olla-m2",
        texto: "La codicia que no se sacia",
        medida: "justo",
        porque: "Abarca los tres párrafos y distingue a este relato de otros: cada vuelta a la barranca lo sostiene.",
      },
      {
        id: "olla-m3",
        texto: "Las monedas viejas dentro de una olla de barro",
        medida: "estrecho",
        porque: "Es un objeto del relato, no lo que el relato dice. Si en vez de monedas fuera maíz, el tema seguiría siendo el mismo.",
      },
    ],
  },
  {
    relatoId: "silla",
    formulaciones: [
      {
        id: "silla-m1",
        texto: "Los sentimientos",
        medida: "amplio",
        porque: "Prácticamente toda narrativa trata de algún sentimiento. No dice nada de este relato en particular.",
      },
      {
        id: "silla-m2",
        texto: "El duelo y el modo en que la ausencia se va acomodando",
        medida: "justo",
        porque: "Cubre desde la primera línea hasta la risa final, y sólo encaja en relatos que trabajen esa idea.",
      },
      {
        id: "silla-m3",
        texto: "La silla del comedor de doña Chole",
        medida: "estrecho",
        porque: "Nombra el objeto, no la idea. La silla es el hilo que sostiene el tema, pero el tema es lo que ella significa.",
      },
    ],
  },
  {
    relatoId: "rio",
    formulaciones: [
      {
        id: "rio-m1",
        texto: "México",
        medida: "amplio",
        porque: "Un país entero no es un tema: es un marco. No dice qué idea trabaja este relato.",
      },
      {
        id: "rio-m2",
        texto: "Irse lejos a trabajar y volver con la falta cambiada de lugar",
        medida: "justo",
        porque: "Recoge el viaje de ida, los dieciocho años y la frase del final: el relato entero, y nada más que él.",
      },
      {
        id: "rio-m3",
        texto: "La frase que Rosalío repetía en sus cartas",
        medida: "estrecho",
        porque: "Es una idea secundaria —importante, pero secundaria—. Cubre dos renglones de los tres párrafos.",
      },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 4 — «Dos relatos, un mismo tema»
 * ═══════════════════════════════════════════════════════════════════════════ */

export interface FichaRelato {
  id: string;
  titulo: string;
  forma: string;
  asunto: string;
  /** Identificador de la pareja: dos fichas con el mismo valor comparten tema. */
  parejaId: string;
}

export const FICHAS_RELATO: FichaRelato[] = [
  {
    id: "f-olla",
    titulo: "La olla de la barranca",
    forma: "Leyenda de camino",
    asunto: "Un arriero encuentra monedas bajo una piedra y vuelve cada semana por más.",
    parejaId: "p-codicia",
  },
  {
    id: "f-red",
    titulo: "El pescador y la red nueva",
    forma: "Cuento de puerto",
    asunto: "Un pescador cambia su red por otra más grande, y luego por otra, hasta que ya no le cabe en la lancha.",
    parejaId: "p-codicia",
  },
  {
    id: "f-silla",
    titulo: "La silla de doña Chole",
    forma: "Cuento de familia",
    asunto: "Una viuda guarda el lugar de su marido en la mesa durante tres años.",
    parejaId: "p-duelo",
  },
  {
    id: "f-trompeta",
    titulo: "El corrido de la trompeta muda",
    forma: "Corrido",
    asunto: "La banda del pueblo sigue dejando un hueco en la fila donde iba el trompetista que murió.",
    parejaId: "p-duelo",
  },
  {
    id: "f-rio",
    titulo: "El que cruzó el río dos veces",
    forma: "Relato de la partida",
    asunto: "Un hombre trabaja dieciocho años del otro lado y al volver dice que le falta el otro lado.",
    parejaId: "p-partida",
  },
  {
    id: "f-domingo",
    titulo: "La llamada del domingo",
    forma: "Relato de la partida",
    asunto: "Una muchacha se va a estudiar a la capital y cada domingo llama para preguntar cómo está el perro.",
    parejaId: "p-partida",
  },
];

export interface OpcionTemaPareja {
  id: string;
  texto: string;
  correcto: boolean;
  porque: string;
}

export interface ParejaTema {
  id: string;
  /** Por qué estos dos relatos comparten tema aunque no se parezcan en nada. */
  contraste: string;
  opciones: OpcionTemaPareja[];
}

export const PAREJAS: ParejaTema[] = [
  {
    id: "p-codicia",
    contraste:
      "Una pasa en un camino de montaña y la otra en un puerto; una habla de monedas y la otra de redes. Lo que comparten no es el escenario ni los objetos: es la idea de que querer más no tiene fondo.",
    opciones: [
      {
        id: "p-codicia-o1",
        texto: "El dinero",
        correcto: false,
        porque: "Demasiado amplio: cabrían cientos de relatos que no tienen nada que ver con éstos. Además, en el del pescador no hay dinero de por medio.",
      },
      {
        id: "p-codicia-o2",
        texto: "La codicia que no se sacia",
        correcto: true,
        porque: "Es lo único que los dos relatos sostienen: en ambos alguien vuelve por más aunque ya tenía suficiente, y en ambos termina perdiendo lo que traía.",
      },
      {
        id: "p-codicia-o3",
        texto: "Alguien encuentra algo y quiere más",
        correcto: false,
        porque: "Eso es lo que pasa en los dos: el asunto. El tema es lo que los dos dicen sobre querer más, no la trama que comparten.",
      },
    ],
  },
  {
    id: "p-duelo",
    contraste:
      "Una ocurre en una mesa y la otra en una fila de músicos; una la cuenta una familia y la otra la canta un pueblo entero. El lugar vacío es distinto, la idea es la misma.",
    opciones: [
      {
        id: "p-duelo-o1",
        texto: "Alguien guarda el sitio de un muerto",
        correcto: false,
        porque: "Es el asunto, y está bien observado. Pero el tema es aquello sobre lo que ese gesto hace pensar, no el gesto mismo.",
      },
      {
        id: "p-duelo-o2",
        texto: "La tristeza",
        correcto: false,
        porque: "Demasiado amplio: casi cualquier relato triste encajaría. Un tema útil distingue a estos dos de los demás.",
      },
      {
        id: "p-duelo-o3",
        texto: "El duelo: la ausencia que se queda en un lugar",
        correcto: true,
        porque: "Los dos relatos trabajan la misma idea con un hueco físico —la silla, el lugar en la fila— que la comunidad decide no ocupar.",
      },
    ],
  },
  {
    id: "p-partida",
    contraste:
      "Uno cruza una frontera y la otra sólo viaja a la capital; él vuelve después de dieciocho años y ella llama cada domingo. La distancia es muy distinta; lo que se deja atrás funciona igual.",
    opciones: [
      {
        id: "p-partida-o1",
        texto: "Irse y no terminar de llegar",
        correcto: true,
        porque: "En los dos hay alguien partido en dos lugares: él extraña el pan de allá cuando está aquí; ella pregunta por el perro de acá cuando está allá.",
      },
      {
        id: "p-partida-o2",
        texto: "Los viajes",
        correcto: false,
        porque: "Demasiado amplio: un viaje es cualquier desplazamiento. Estos relatos no tratan de viajar, tratan de lo que queda pendiente al irse.",
      },
      {
        id: "p-partida-o3",
        texto: "Alguien se va lejos y extraña su casa",
        correcto: false,
        porque: "Es el asunto de ambos, resumido. Y además se queda corto: en los dos casos la falta no se resuelve al volver ni al llamar.",
      },
    ],
  },
];

export function parejaPorId(id: string): ParejaTema {
  return PAREJAS.find((p) => p.id === id) ?? PAREJAS[0]!;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Glosario manipulable (modo «Escribe el término»)
 * Los cuatro primeros son VERBATIM de LC-II-P05-A5; los dos últimos son los
 * términos que este laboratorio hace manipular y que la progresión no define.
 * ═══════════════════════════════════════════════════════════════════════════ */

export const GLOSARIO: { id: string; termino: string; definicion: string; ejemplo: string }[] = [
  {
    id: "g-tema",
    termino: "Tema",
    definicion: "Asunto general del que trata un texto, expresable en pocas palabras.",
    ejemplo: "El valor, la amistad, la muerte.",
  },
  {
    id: "g-principal",
    termino: "Idea principal",
    definicion: "Afirmación más importante que el texto hace sobre el tema.",
    ejemplo: "La amistad verdadera resiste las dificultades.",
  },
  {
    id: "g-secundaria",
    termino: "Idea secundaria",
    definicion: "Idea que apoya, explica o ejemplifica la idea principal.",
    ejemplo: "Un ejemplo concreto de dos amigos que se ayudan.",
  },
  {
    id: "g-comparacion",
    termino: "Comparación de temas",
    definicion: "Analizar cómo distintas narrativas tratan un mismo tema.",
    ejemplo: "Comparar el tema del miedo en dos leyendas.",
  },
  {
    id: "g-asunto",
    termino: "Asunto",
    definicion: "Lo que pasa en la historia: los hechos que se cuentan, en el orden en que se cuentan.",
    ejemplo: "Un arriero encuentra monedas y vuelve cada semana por más.",
  },
  {
    id: "g-motivo",
    termino: "Motivo recurrente",
    definicion: "Detalle, objeto o frase que vuelve a aparecer en el relato y sostiene el tema.",
    ejemplo: "La silla vacía que reaparece en los tres párrafos del cuento.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * Contenido VERBATIM de la base de datos
 * ═══════════════════════════════════════════════════════════════════════════ */

/** LC-II-P05-A1 — lectura «El tema y las ideas en la narrativa popular». */
export const LECTURA_A1: string[] = [
  "Todo texto narrativo trata sobre algo: ese “algo” es el tema. El tema es la idea central que el autor quiere explorar o comunicar a través de su historia. Puede ser explícito (mencionado directamente) o implícito (deducible del desarrollo de la historia). Ejemplos de temas comunes en narrativas populares: la lucha entre el bien y el mal, la importancia de la comunidad, el peligro de la ambición desmedida, la fuerza del amor.",
  "Al mismo tiempo, dentro de un texto hay ideas centrales (las más importantes, sin las cuales el texto perdería su sentido principal) e ideas secundarias (que enriquecen, contextualizan o apoyan las ideas centrales, pero que podrían eliminarse sin destruir el sentido del texto).",
  "Saber distinguir el tema de las ideas centrales y secundarias es fundamental para comprender profundamente cualquier texto narrativo. Esta habilidad también te ayudará a organizar tus propios textos: al definir con claridad el tema de lo que quieres escribir, podrás seleccionar qué información es central y qué es secundaria.",
];

/** Recuadro «importante» de LC-II-P05-A1, verbatim. */
export const DATO_A1 =
  "El español de México incorpora más de 10,000 voces de origen náhuatl que usamos a diario: chocolate, tomate, aguacate, chile, copal, petate, chicle, guajolote. Estas palabras cruzaron el Atlántico y hoy forman parte del español global y de decenas de otros idiomas.";

/** Preguntas de comprensión de LC-II-P05-A1, verbatim. */
export const COMPRENSION_A1: { pregunta: string; respuesta: string }[] = [
  {
    pregunta: "¿Qué es el tema de un texto narrativo?",
    respuesta: "La idea central que el autor quiere explorar, puede ser explícita o implícita.",
  },
  {
    pregunta: "¿Cuál es la diferencia entre ideas centrales e ideas secundarias?",
    respuesta: "Las centrales son indispensables para el sentido del texto; las secundarias enriquecen pero no son esenciales.",
  },
  {
    pregunta: "¿Por qué es útil identificar el tema al escribir?",
    respuesta: "Porque permite seleccionar qué información es central y organizar el texto con claridad.",
  },
];

/** Pistas de la reflexión LC-II-P05-A3, verbatim. */
export const PISTAS_A3: string[] = [
  "El tema se expresa en una frase corta: 'esta historia trata sobre...'",
  "Las ideas centrales son aquellas sin las cuales la historia pierde sentido.",
  "Piensa en qué miedos, valores o creencias comunica la historia a su comunidad.",
];

/** Consigna de la reflexión LC-II-P05-A3, verbatim. */
export const CONSIGNA_A3 =
  "Elige una narrativa popular que conozcas (una leyenda, un mito, un cuento tradicional o una historia que te contaron). Escribe: (a) el tema central de esa narrativa, (b) dos ideas centrales y dos ideas secundarias, y (c) tu interpretación: ¿qué mensaje o valor comunica esa narrativa a la comunidad que la cuenta?";

/** LC-II-P05-A4 — verdadero/falso, verbatim. */
export const HECHOS: { enunciado: string; respuesta: boolean; retro: string }[] = [
  {
    enunciado: "El tema es el asunto general del que trata un texto.",
    respuesta: true,
    retro: "Correcto: el tema se puede resumir en pocas palabras (ej. la amistad).",
  },
  {
    enunciado: "La idea principal y el tema son exactamente lo mismo.",
    respuesta: false,
    retro: "El tema es el asunto; la idea principal es lo que el texto afirma sobre ese asunto.",
  },
  {
    enunciado: "Las ideas secundarias amplían, explican o ejemplifican la idea principal.",
    respuesta: true,
    retro: "Correcto: sirven de apoyo a la idea central.",
  },
  {
    enunciado: "Un mismo tema puede tratarse de maneras distintas en varias narrativas.",
    respuesta: true,
    retro: "Correcto: por eso es útil comparar cómo lo abordan distintos relatos.",
  },
];

/** Criterios de la autoevaluación LC-II-P05-A7, verbatim. */
export const CRITERIOS_A7: string[] = [
  "Diferencio el tema de la idea principal de un texto.",
  "Identifico las ideas secundarias y su función.",
  "Comparo cómo un mismo tema aparece en distintas narrativas.",
];

/**
 * Reto evaluable — LC-II-P05-A2 (quiz verdadero/falso), verbatim.
 * Cada reactivo V/F se presenta con opciones ["Verdadero", "Falso"]; el
 * enunciado, la respuesta y la retroalimentación son los de la actividad, y el
 * puntaje mínimo (70) también.
 */
export const QUIZ = {
  titulo: "¿Verdadero o falso? Temas y jerarquía narrativa",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "El tema de un texto narrativo siempre está escrito de forma explícita en el texto.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 1,
      retroalimentacion: "El tema puede ser implícito: el lector lo deduce del desarrollo de la historia.",
    },
    {
      enunciado: "Las ideas centrales son indispensables para el sentido principal del texto.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correcto. Sin las ideas centrales, el texto perdería su sentido principal.",
    },
    {
      enunciado: "Las ideas secundarias son irrelevantes y pueden eliminarse sin afectar el texto.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 1,
      retroalimentacion: "Las ideas secundarias enriquecen y contextualizan, aunque el texto mantiene sentido sin ellas.",
    },
    {
      enunciado: "Identificar el tema ayuda al escritor a seleccionar qué información incluir en su texto.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correcto. Tener claro el tema permite decidir qué es central y qué es secundario.",
    },
    {
      enunciado: "Un texto narrativo puede tener varios temas secundarios además del tema principal.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correcto. Los temas secundarios desarrollan aspectos relacionados con el tema central.",
    },
    {
      enunciado: "El tema y la trama son lo mismo en un texto narrativo.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 1,
      retroalimentacion: "El tema es la idea que explora el texto; la trama es la secuencia de eventos que lo conforman.",
    },
  ],
};

export const NOTA_PIE =
  "Contenido verbatim de la progresión LC-II-P05 (Lengua y Comunicación II): la lectura y el recuadro son de A1, el reto evaluable de A2, las pistas de A3, los hechos de A4, el glosario de A5 (los términos «Asunto» y «Motivo recurrente» se añadieron para esta práctica) y el texto con huecos de A6. Los tres relatos que se leen y las seis fichas que se emparejan (tres de ellas resumen esos mismos relatos) son textos ILUSTRATIVOS escritos para este laboratorio a la manera de la narrativa popular mexicana: no son transcripciones ni versiones de ninguna leyenda, corrido o cuento tradicional real, ni se atribuyen a ninguna comunidad.";
