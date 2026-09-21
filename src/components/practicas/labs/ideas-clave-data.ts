/**
 * Datos del laboratorio «Ideas clave: qué subrayar y por qué».
 *
 * Progresión LC-I-P05 (Lengua y Comunicación I, primer semestre):
 * «Identifica información de un texto que lee para resaltar los elementos
 * significativos».
 *
 * Qué es VERBATIM de la base de datos:
 *  · LECTURA_A1  → LC-I-P05-A1 (lectura de activación), íntegra.
 *  · DATO_IDEAS  → el recuadro de LC-I-P05-A1.
 *  · QUIZ        → LC-I-P05-A2 (quiz_multiple_opcion), 5 reactivos.
 *  · PISTAS_A3   → las pistas de LC-I-P05-A3 (reflexión escrita).
 *  · HECHOS      → LC-I-P05-A5 (quiz_verdadero_falso), 4 enunciados.
 *  · GLOSARIO    → LC-I-P05-A6 (glosario_interactivo), 5 términos.
 *  (los huecos de LC-I-P05-A4 viven en `ideas-clave-huecos.ts`)
 *
 * Qué es material propio de la práctica: los TEXTOS que el alumno subraya y
 * los RESUMENES que diagnostica. Se escribieron para este laboratorio porque
 * la progresión no trae textos largos sobre los que marcar. Los datos que
 * contienen son reales y verificables; las fuentes van en NOTA_PIE.
 *
 * Sin three ni React: datos puros.
 */

/* ═══════════════════════════════════════════════════════════════════════
 * 1. El texto que se subraya
 * ═══════════════════════════════════════════════════════════════════════ */

/** Qué papel juega una oración dentro de su párrafo. */
export type Rol = "principal" | "apoyo" | "relleno";

export interface Frase {
  id: string;
  texto: string;
  rol: Rol;
  /** Por qué esa oración es lo que es. Se le muestra al alumno siempre. */
  porque: string;
}

export interface ParrafoTexto {
  id: string;
  frases: Frase[];
}

export interface TemaCandidato {
  id: string;
  texto: string;
  correcto: boolean;
  porque: string;
}

export interface TextoLectura {
  id: string;
  /** Paratexto: el título anticipa el contenido. */
  titulo: string;
  /** Paratexto: el subtítulo lo precisa. */
  subtitulo: string;
  fuente: string;
  parrafos: ParrafoTexto[];
  /** Candidatos a «tema del texto» para el esquema (uno solo es correcto). */
  temas: TemaCandidato[];
}

export const ROL_INFO: Record<Rol, { label: string; corto: string; color: string; icono: string; descripcion: string }> = {
  principal: {
    label: "Idea principal",
    corto: "Principal",
    color: "#34D399",
    icono: "fa-highlighter",
    descripcion: "La oración temática: dice de qué trata el párrafo entero.",
  },
  apoyo: {
    label: "Detalle de apoyo",
    corto: "Apoyo",
    color: "#FFC75A",
    icono: "fa-pen-nib",
    descripcion: "Ejemplo, dato o explicación que respalda la idea principal.",
  },
  relleno: {
    label: "Relleno",
    corto: "Relleno",
    color: "#8FA3BF",
    icono: "fa-ban",
    descripcion: "Comentario suelto u opinión personal: no se subraya.",
  },
};

export const TEXTOS: TextoLectura[] = [
  {
    id: "maiz",
    titulo: "El maíz que nos hizo",
    subtitulo: "Nueve mil años entre el teocintle y la tortilla",
    fuente: "Texto de la práctica, con datos de la CONABIO.",
    parrafos: [
      {
        id: "maiz-p1",
        frases: [
          {
            id: "maiz-p1-f1",
            texto: "El maíz es la planta que más ha marcado la historia y la comida de México.",
            rol: "principal",
            porque:
              "Es la oración temática: anuncia de qué trata todo el párrafo y las demás oraciones la sostienen. Si sólo pudieras subrayar una línea, sería ésta.",
          },
          {
            id: "maiz-p1-f2",
            texto: "Se domesticó en Mesoamérica hace unos nueve mil años a partir de un pasto silvestre llamado teocintle.",
            rol: "apoyo",
            porque:
              "Detalle de apoyo: un dato concreto que respalda la afirmación central. Dice desde cuándo y desde dónde, pero no sustituye a la idea principal.",
          },
          {
            id: "maiz-p1-f3",
            texto: "A mí las tortillas me gustan más cuando están recién hechas.",
            rol: "relleno",
            porque:
              "Relleno: es un gusto personal de quien escribe. No informa nada sobre el maíz, así que no se subraya ni entra en el resumen.",
          },
        ],
      },
      {
        id: "maiz-p2",
        frases: [
          {
            id: "maiz-p2-f1",
            texto: "En el país sobreviven decenas de razas de maíz nativo, cada una adaptada a su región.",
            rol: "principal",
            porque:
              "Oración temática del párrafo: la diversidad del maíz. Todo lo que sigue son ejemplos y cifras de esa diversidad.",
          },
          {
            id: "maiz-p2-f2",
            texto: "La CONABIO tiene registradas 64 razas nativas: el cónico azul del altiplano, el tuxpeño del trópico, el bolita de Oaxaca.",
            rol: "apoyo",
            porque:
              "Detalle de apoyo: una cifra y tres ejemplos que demuestran la idea principal. Sin esta oración el párrafo seguiría entendiéndose; sin la principal, no.",
          },
          {
            id: "maiz-p2-f3",
            texto: "El color azul también se usa mucho en la ropa y en las banderas.",
            rol: "relleno",
            porque:
              "Relleno: se va por otro tema. Que una palabra del párrafo reaparezca («azul») no convierte a la oración en información útil.",
          },
        ],
      },
      {
        id: "maiz-p3",
        frases: [
          {
            id: "maiz-p3-f1",
            texto: "La nixtamalización es el proceso que convierte al maíz en un alimento mucho más completo.",
            rol: "principal",
            porque: "Es la idea principal: nombra el proceso del que habla el resto del párrafo y afirma qué logra.",
          },
          {
            id: "maiz-p3-f2",
            texto: "Al cocer el grano con cal se libera la niacina y aumenta el calcio que el cuerpo puede aprovechar.",
            rol: "apoyo",
            porque:
              "Detalle de apoyo: explica cómo ocurre lo que la idea principal afirma. Responde al «¿cómo?», no al «¿de qué trata?».",
          },
          {
            id: "maiz-p3-f3",
            texto: "Hoy existen muchísimas marcas de harina en el supermercado.",
            rol: "relleno",
            porque: "Relleno: un comentario suelto que no explica ni apoya la idea principal del párrafo.",
          },
        ],
      },
    ],
    temas: [
      {
        id: "maiz-t1",
        texto: "El maíz en México: su origen, su diversidad y la nixtamalización.",
        correcto: true,
        porque: "Cubre los tres párrafos sin quedarse en ninguno: eso es el tema del texto completo.",
      },
      {
        id: "maiz-t2",
        texto: "La historia de la alimentación en el mundo.",
        correcto: false,
        porque: "Demasiado amplio: promete mucho más de lo que el texto realmente dice.",
      },
      {
        id: "maiz-t3",
        texto: "Las 64 razas de maíz nativo registradas por la CONABIO.",
        correcto: false,
        porque: "Demasiado estrecho: es sólo el segundo párrafo, no el texto entero.",
      },
    ],
  },
  {
    id: "metro",
    titulo: "El Metro que mueve a la ciudad",
    subtitulo: "Una red de 1969 que se lee con dibujos",
    fuente: "Texto de la práctica, con datos del STC Metro.",
    parrafos: [
      {
        id: "metro-p1",
        frases: [
          {
            id: "metro-p1-f1",
            texto: "El Metro de la Ciudad de México es el medio de transporte que más gente mueve en el país.",
            rol: "principal",
            porque: "Oración temática: afirma lo central del párrafo. La cifra que viene después existe para probar esto.",
          },
          {
            id: "metro-p1-f2",
            texto: "Antes de 2020 transportaba alrededor de cuatro millones de personas cada día laborable.",
            rol: "apoyo",
            porque: "Detalle de apoyo: la cifra que demuestra la afirmación. Un dato apoya; no encabeza.",
          },
          {
            id: "metro-p1-f3",
            texto: "Mi tía prefiere el trolebús porque casi siempre va sentada.",
            rol: "relleno",
            porque: "Relleno: una anécdota personal. No aporta información sobre el Metro y descoloca al lector.",
          },
        ],
      },
      {
        id: "metro-p2",
        frases: [
          {
            id: "metro-p2-f1",
            texto: "La red no nació completa: se construyó por etapas a lo largo de más de medio siglo.",
            rol: "principal",
            porque: "Idea principal: el párrafo trata del crecimiento por etapas. Las fechas y los números lo ilustran.",
          },
          {
            id: "metro-p2-f2",
            texto: "La Línea 1 abrió en 1969 y hoy el sistema suma 12 líneas y 195 estaciones.",
            rol: "apoyo",
            porque: "Detalle de apoyo: fechas y cantidades que concretan la idea principal.",
          },
          {
            id: "metro-p2-f3",
            texto: "Los números redondos siempre se recuerdan con más facilidad.",
            rol: "relleno",
            porque: "Relleno: una reflexión general de quien escribe que no dice nada del Metro.",
          },
        ],
      },
      {
        id: "metro-p3",
        frases: [
          {
            id: "metro-p3-f1",
            texto: "Cada estación tiene un ícono para que cualquiera se oriente, sepa leer o no.",
            rol: "principal",
            porque: "Idea principal del párrafo: el para qué de los íconos. Lo demás son ejemplos de ese sistema.",
          },
          {
            id: "metro-p3-f2",
            texto: "El diseñador Lance Wyman los dibujó a partir de referencias del lugar: un chapulín para Chapultepec, la Catedral para Zócalo.",
            rol: "apoyo",
            porque: "Detalle de apoyo: dos ejemplos concretos que muestran cómo se cumple la idea principal.",
          },
          {
            id: "metro-p3-f3",
            texto: "Los colores de las líneas se ven muy bien en el mapa impreso.",
            rol: "relleno",
            porque: "Relleno: una apreciación estética. No explica para qué sirven los íconos.",
          },
        ],
      },
    ],
    temas: [
      {
        id: "metro-t1",
        texto: "El Metro de la Ciudad de México: cuánta gente mueve, cómo creció y cómo se señaliza.",
        correcto: true,
        porque: "Recoge la idea principal de cada uno de los tres párrafos.",
      },
      {
        id: "metro-t2",
        texto: "El transporte público en América Latina.",
        correcto: false,
        porque: "Demasiado amplio: el texto habla de un solo sistema, en una sola ciudad.",
      },
      {
        id: "metro-t3",
        texto: "Los pictogramas que diseñó Lance Wyman.",
        correcto: false,
        porque: "Demasiado estrecho: es el detalle de apoyo del tercer párrafo, no el tema del texto.",
      },
    ],
  },
  {
    id: "alerta",
    titulo: "Sesenta segundos de aviso",
    subtitulo: "Cómo funciona la alerta sísmica mexicana",
    fuente: "Texto de la práctica, con datos del CIRES y del Servicio Sismológico Nacional.",
    parrafos: [
      {
        id: "alerta-p1",
        frases: [
          {
            id: "alerta-p1-f1",
            texto: "México es uno de los países con mayor actividad sísmica del mundo.",
            rol: "principal",
            porque: "Oración temática: la afirmación que el párrafo entero se dedica a sostener.",
          },
          {
            id: "alerta-p1-f2",
            texto: "Su territorio se asienta sobre cinco placas tectónicas: la Norteamericana, la del Pacífico, la de Cocos, la de Rivera y la del Caribe.",
            rol: "apoyo",
            porque: "Detalle de apoyo: la explicación geológica que justifica la idea principal.",
          },
          {
            id: "alerta-p1-f3",
            texto: "El mapamundi es uno de los carteles más comunes en los salones de clase.",
            rol: "relleno",
            porque: "Relleno: cambia de tema por completo. Subrayarlo llenaría el resumen de ruido.",
          },
        ],
      },
      {
        id: "alerta-p2",
        frases: [
          {
            id: "alerta-p2-f1",
            texto: "La alerta sísmica funciona porque las ondas de un sismo no viajan todas a la misma velocidad.",
            rol: "principal",
            porque: "Idea principal: enuncia el principio físico del que trata el párrafo.",
          },
          {
            id: "alerta-p2-f2",
            texto: "Los sensores detectan la onda P, más rápida y menos destructiva, y mandan el aviso por radio antes de que llegue la onda S.",
            rol: "apoyo",
            porque: "Detalle de apoyo: describe el mecanismo concreto que hace posible lo que afirma la idea principal.",
          },
          {
            id: "alerta-p2-f3",
            texto: "La P y la S son de las letras más usadas del alfabeto.",
            rol: "relleno",
            porque: "Relleno: juega con las palabras del párrafo sin aportar información sobre el tema.",
          },
        ],
      },
      {
        id: "alerta-p3",
        frases: [
          {
            id: "alerta-p3-f1",
            texto: "El aviso anticipado sólo sirve si la gente sabe qué hacer con él.",
            rol: "principal",
            porque: "Idea principal: introduce la condición de la que habla el párrafo. Es la tesis con la que cierra el texto.",
          },
          {
            id: "alerta-p3-f2",
            texto: "En la Ciudad de México la alerta puede adelantarse hasta unos sesenta segundos a un sismo de la costa de Guerrero: tiempo suficiente para llegar a una zona segura si ya se practicó.",
            rol: "apoyo",
            porque: "Detalle de apoyo: pone la cifra y el ejemplo que dan sentido a la condición enunciada.",
          },
          {
            id: "alerta-p3-f3",
            texto: "Ese día muchos compañeros se quedaron platicando en el patio.",
            rol: "relleno",
            porque: "Relleno: una anécdota sin datos. Parece relacionada, pero no dice nada que el lector pueda usar.",
          },
        ],
      },
    ],
    temas: [
      {
        id: "alerta-t1",
        texto: "La alerta sísmica en México: por qué hace falta, cómo funciona y para qué sirve.",
        correcto: true,
        porque: "Abarca los tres párrafos: el riesgo, el mecanismo y la condición de utilidad.",
      },
      {
        id: "alerta-t2",
        texto: "Los desastres naturales del planeta.",
        correcto: false,
        porque: "Demasiado amplio: el texto trata de un solo fenómeno y de un solo país.",
      },
      {
        id: "alerta-t3",
        texto: "La diferencia entre la onda P y la onda S.",
        correcto: false,
        porque: "Demasiado estrecho: es el detalle de apoyo del segundo párrafo.",
      },
    ],
  },
];

/** Todas las oraciones del laboratorio, aplanadas. */
export const TODAS_LAS_FRASES: Frase[] = TEXTOS.flatMap((t) => t.parrafos.flatMap((p) => p.frases));

/* ═══════════════════════════════════════════════════════════════════════
 * 2. Diagnóstico del resumen
 * ═══════════════════════════════════════════════════════════════════════ */

export type Veredicto = "bueno" | "copia" | "detalle" | "agrega";

export const VEREDICTO_INFO: Record<Veredicto, { label: string; color: string; icono: string; descripcion: string }> = {
  bueno: {
    label: "Buen resumen",
    color: "#34D399",
    icono: "fa-circle-check",
    descripcion: "Reescribe las ideas principales con palabras propias.",
  },
  copia: {
    label: "Es copia literal",
    color: "#7FB2FF",
    icono: "fa-clone",
    descripcion: "Pega oraciones del texto sin reescribirlas.",
  },
  detalle: {
    label: "Se quedó en un detalle",
    color: "#FFC75A",
    icono: "fa-magnifying-glass",
    descripcion: "Toma una idea secundaria y deja fuera la principal.",
  },
  agrega: {
    label: "Dice lo que el texto no dice",
    color: "#FF8A3C",
    icono: "fa-triangle-exclamation",
    descripcion: "Añade opiniones o datos que no están en el texto.",
  },
};

export interface ResumenCandidato {
  id: string;
  textoId: string;
  /** Título del texto al que pretende resumir. */
  deTexto: string;
  texto: string;
  veredicto: Veredicto;
  porque: string;
}

export const RESUMENES: ResumenCandidato[] = [
  {
    id: "r1",
    textoId: "maiz",
    deTexto: "El maíz que nos hizo",
    texto: "El maíz mexicano viene del teocintle, se conserva en decenas de razas distintas y se nixtamaliza para alimentar mejor.",
    veredicto: "bueno",
    porque: "Junta las ideas principales de los tres párrafos y las dice con otras palabras: origen, diversidad y nixtamalización.",
  },
  {
    id: "r2",
    textoId: "maiz",
    deTexto: "El maíz que nos hizo",
    texto:
      "«El maíz es la planta que más ha marcado la historia y la comida de México.» «La nixtamalización es el proceso que convierte al maíz en un alimento mucho más completo.»",
    veredicto: "copia",
    porque: "Son dos oraciones tomadas tal cual del texto. Resumir exige reescribir con palabras propias, no pegar fragmentos.",
  },
  {
    id: "r3",
    textoId: "maiz",
    deTexto: "El maíz que nos hizo",
    texto: "La CONABIO tiene registradas 64 razas de maíz nativo.",
    veredicto: "detalle",
    porque: "Es el detalle de apoyo del segundo párrafo. Deja fuera el origen y la nixtamalización, que también son ideas principales.",
  },
  {
    id: "r4",
    textoId: "metro",
    deTexto: "El Metro que mueve a la ciudad",
    texto:
      "El Metro capitalino es el transporte que más gente mueve en México; creció por etapas desde 1969 y usa íconos para que cualquiera pueda orientarse.",
    veredicto: "bueno",
    porque: "Recoge las tres ideas principales, en orden y con palabras distintas a las del texto.",
  },
  {
    id: "r5",
    textoId: "metro",
    deTexto: "El Metro que mueve a la ciudad",
    texto: "El Metro es el mejor transporte del país y debería construirse uno igual en todas las ciudades.",
    veredicto: "agrega",
    porque: "El texto nunca lo califica de «mejor» ni propone construir más: son opiniones de quien resume, no información del texto.",
  },
  {
    id: "r6",
    textoId: "metro",
    deTexto: "El Metro que mueve a la ciudad",
    texto: "La Línea 1 del Metro abrió en 1969.",
    veredicto: "detalle",
    porque: "Es un dato de apoyo. Un resumen del texto completo no puede reducirse a una fecha suelta.",
  },
  {
    id: "r7",
    textoId: "alerta",
    deTexto: "Sesenta segundos de aviso",
    texto:
      "Como México tiembla mucho, se creó una alerta que aprovecha la onda más rápida para avisar hasta un minuto antes; sirve si la gente ya sabe qué hacer.",
    veredicto: "bueno",
    porque: "Sintetiza riesgo, mecanismo y condición: las tres ideas principales, en una sola oración propia.",
  },
  {
    id: "r8",
    textoId: "alerta",
    deTexto: "Sesenta segundos de aviso",
    texto:
      "«México es uno de los países con mayor actividad sísmica del mundo.» «La alerta sísmica funciona porque las ondas de un sismo no viajan todas a la misma velocidad.»",
    veredicto: "copia",
    porque: "Dos oraciones copiadas literalmente. Aunque sean las correctas, transcribir no demuestra que se comprendió.",
  },
  {
    id: "r9",
    textoId: "alerta",
    deTexto: "Sesenta segundos de aviso",
    texto: "La alerta sísmica evita los daños de los sismos, así que ya no hace falta hacer simulacros.",
    veredicto: "agrega",
    porque: "El texto dice justo lo contrario: el aviso sólo sirve si la gente sabe qué hacer. El resumen inventa una conclusión.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════
 * 3. Contenido VERBATIM de la progresión LC-I-P05
 * ═══════════════════════════════════════════════════════════════════════ */

/** LC-I-P05-A1 · lectura de activación, íntegra. */
export const LECTURA_A1: string[] = [
  "Leer un texto implica mucho más que entender las palabras que lo componen. Implica identificar cuáles son las ideas más importantes, cuáles son los detalles de apoyo y cuáles son los ejemplos o datos secundarios. Esta habilidad —conocida como selección de información relevante— es fundamental para el estudio, para la investigación y para la vida cotidiana.",
  "Algunas estrategias útiles para identificar la información más relevante son: subrayar las palabras o frases clave, hacer anotaciones al margen, identificar la oración temática de cada párrafo y formularse preguntas sobre el texto (¿Quién? ¿Qué? ¿Cómo? ¿Por qué? ¿Para qué?).",
  "Una vez identificada la información relevante, podemos elaborar resúmenes, esquemas o mapas conceptuales que nos ayuden a organizar y retener lo aprendido. El resumen no es copiar fragmentos del texto original: es reescribir las ideas principales con nuestras propias palabras, demostrando que realmente comprendimos el contenido.",
];

/** LC-I-P05-A1 · recuadro, verbatim. */
export const DATO_IDEAS =
  "Elena Poniatowska es una de las periodistas y escritoras mexicanas más influyentes del siglo XX. Su libro La noche de Tlatelolco (1971) documenta la masacre estudiantil del 2 de octubre de 1968 a través de testimonios orales — un hito del periodismo narrativo en lengua española.";

/** LC-I-P05-A3 · pistas de la reflexión escrita, verbatim. */
export const PISTAS_A3: string[] = [
  "Busca la oración que engloba el resto del párrafo",
  "Los detalles de apoyo suelen ser ejemplos, datos o explicaciones",
  "Para resumir: ¿qué diría alguien que no leyó el párrafo pero necesita saber lo esencial?",
];

/** LC-I-P05-A5 · quiz_verdadero_falso, verbatim. */
export interface HechoVF {
  enunciado: string;
  respuesta: boolean;
  retroalimentacion: string;
}
export const HECHOS: HechoVF[] = [
  {
    enunciado: "Resumir es copiar fragmentos literales del texto original.",
    respuesta: false,
    retroalimentacion: "Falso: resumir es reescribir las ideas principales con palabras propias.",
  },
  {
    enunciado: "El título y los subtítulos son elementos paratextuales que ayudan a anticipar el contenido.",
    respuesta: true,
    retroalimentacion: "Correcto: los paratextos orientan la lectura antes y durante el texto.",
  },
  {
    enunciado: "Las ideas secundarias son menos útiles, así que conviene ignorarlas siempre.",
    respuesta: false,
    retroalimentacion: "Falso: las ideas secundarias apoyan y aclaran la idea principal; no se ignoran, se jerarquizan.",
  },
  {
    enunciado: "Subrayar palabras clave es una estrategia de lectura activa.",
    respuesta: true,
    retroalimentacion: "Correcto: subrayar ayuda a identificar y recordar lo esencial.",
  },
];

/** LC-I-P05-A6 · glosario_interactivo, verbatim. */
export interface TerminoGlosario {
  termino: string;
  definicion: string;
  ejemplo: string;
}
export const GLOSARIO: TerminoGlosario[] = [
  {
    termino: "Idea principal",
    definicion: "La información más importante de un párrafo o texto.",
    ejemplo: "En un párrafo sobre el reciclaje, la idea de que reduce la basura.",
  },
  {
    termino: "Idea secundaria",
    definicion: "Información que apoya, ejemplifica o amplía la idea principal.",
    ejemplo: "Un dato que muestra cuánta basura se evita al reciclar.",
  },
  {
    termino: "Elemento paratextual",
    definicion: "Recurso que rodea al texto y ayuda a anticiparlo: título, subtítulos, imágenes, índice.",
    ejemplo: "El título de un capítulo que anuncia su tema.",
  },
  {
    termino: "Resumen",
    definicion: "Versión breve que reescribe las ideas principales con palabras propias.",
    ejemplo: "Contar en tres líneas lo esencial de una noticia.",
  },
  {
    termino: "Subrayado",
    definicion: "Estrategia de marcar las palabras o frases clave durante la lectura.",
    ejemplo: "Resaltar la oración temática de cada párrafo.",
  },
];

/** LC-I-P05-A2 · quiz_multiple_opcion, verbatim (5 reactivos, mínimo 70 %). */
export const QUIZ = {
  titulo: "¿Qué es lo más importante en este texto?",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "¿Qué es subrayar en un texto?",
      opciones: [
        "Decorar el texto con colores",
        "Marcar las ideas más importantes para identificarlas",
        "Copiar todo el texto en otro cuaderno",
        "Leer el texto varias veces sin marcar nada",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "Subrayar es una estrategia de lectura activa para identificar las ideas clave.",
    },
    {
      enunciado: "¿Cuál de estas preguntas ayuda a identificar la idea central de un párrafo?",
      opciones: ["¿Cuántas palabras tiene?", "¿De qué trata principalmente este párrafo?", "¿Tiene conectores?", "¿Cuántos adjetivos usa?"],
      respuestaCorrecta: 1,
      retroalimentacion: "Preguntarnos de qué trata el párrafo nos dirige hacia su idea central.",
    },
    {
      enunciado: "Un resumen correcto:",
      opciones: [
        "Copia fragmentos literales del texto",
        "Reescribe las ideas principales con palabras propias",
        "Resume solo la introducción del texto",
        "Incluye todas las ideas del texto sin selección",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "Resumir implica reescribir lo esencial con nuestras propias palabras, demostrando comprensión.",
    },
    {
      enunciado: "¿Cuál de los siguientes es un 'detalle de apoyo' en un texto?",
      opciones: ["La idea principal del párrafo", "Un ejemplo que ilustra la idea central", "La oración temática", "El título del texto"],
      respuestaCorrecta: 1,
      retroalimentacion: "Los detalles de apoyo son ejemplos, datos o explicaciones que respaldan la idea principal.",
    },
    {
      enunciado: "¿Para qué sirve un mapa conceptual después de leer?",
      opciones: [
        "Para memorizar sin entender",
        "Para organizar y retener las ideas aprendidas visualmente",
        "Para sustituir la lectura completa",
        "Para decorar el cuaderno",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "Los mapas conceptuales ayudan a organizar visualmente las relaciones entre ideas.",
    },
  ],
};

/** Nota al pie del laboratorio: qué es verbatim y qué es material propio. */
export const NOTA_PIE =
  "Verbatim de LC-I-P05: la lectura y su recuadro (A1), el reto evaluable (A2), las pistas de la reflexión (A3), el texto con huecos (A4), los hechos de verdadero o falso (A5) y el glosario (A6). Los tres textos que se subrayan y los nueve resúmenes que se diagnostican se escribieron para esta práctica; sus datos son verificables: 64 razas de maíz nativo (CONABIO), Línea 1 del Metro en 1969 y 12 líneas con 195 estaciones (STC Metro), cinco placas tectónicas bajo el territorio nacional y hasta unos 60 segundos de anticipación de la alerta sísmica en la Ciudad de México (CIRES y Servicio Sismológico Nacional, UNAM).";
