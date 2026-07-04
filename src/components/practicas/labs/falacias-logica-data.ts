/**
 * Datos del Laboratorio — Lógica: del silogismo a las falacias
 * (PFH-III-P01, Pensamiento Filosófico III).
 *
 * Contenido VERBATIM de PFH-III·P01 ("Glosario lógico: del silogismo a las
 * falacias"). Las definiciones, los ejemplos de falacia y las afirmaciones del
 * cuestionario se toman literalmente de las actividades A1 (glosario de
 * falacias), A2 (quiz de opción múltiple), A4 (V/F) y A5 (glosario de lógica).
 *
 * Fidelidad (ver fidelityNotes del informe):
 *  - MODO 1: cada FALACIA (nombre + definición) es VERBATIM del glosario A1.
 *    Cada EJEMPLO a clasificar es VERBATIM: proviene del campo "ejemplo" del
 *    glosario A1 o de las "opciones" del quiz A2 que las propias actividades
 *    clasifican explícitamente bajo esa falacia. NO se inventó ningún ejemplo.
 *  - MODO 2: los argumentos a clasificar como «válido» o «inválido» son
 *    VERBATIM de A1 (ejemplos de "Argumento válido", "Deducción", "Silogismo",
 *    y de las falacias, que A1 define como argumentos que «parecen válidos sin
 *    serlo»). La etiqueta válido/inválido se deriva directamente de la propia
 *    definición verbatim de cada término en A1.
 *  - MODO 3: glosario A5 (6 términos), definiciones y ejemplos VERBATIM.
 *  - QUIZ: V/F VERBATIM de A4 (5 ítems).
 */

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 1 — ¿Qué falacia comete? (clasifica el argumento por su falacia)
 * Falacias y definiciones VERBATIM del glosario A1.
 * ───────────────────────────────────────────────────────────────────────── */
export type Falacia =
  | "ad-hominem"
  | "hombre-paja"
  | "pendiente"
  | "autoridad"
  | "dicotomia";

export const FALACIA_INFO: Record<
  Falacia,
  { titulo: string; subtitulo: string; icono: string }
> = {
  "ad-hominem": {
    titulo: "Ad hominem",
    subtitulo:
      "Falacia que consiste en atacar a la persona que presenta el argumento en lugar de refutar el argumento mismo. Descalifica al emisor en vez de evaluar las razones.",
    icono: "fa-user-xmark",
  },
  "hombre-paja": {
    titulo: "Hombre de paja",
    subtitulo:
      "Falacia que consiste en distorsionar o exagerar la postura del oponente para atacar más fácilmente esa versión deformada, en lugar de enfrentar el argumento real.",
    icono: "fa-person-rays",
  },
  pendiente: {
    titulo: "Pendiente resbaladiza",
    subtitulo:
      "Falacia que sostiene que una acción o política llevará inevitablemente a consecuencias extremas negativas, sin justificar por qué cada paso de la cadena ocurrirá.",
    icono: "fa-arrow-trend-down",
  },
  autoridad: {
    titulo: "Apelación a la autoridad",
    subtitulo:
      "Falacia que usa el prestigio o la autoridad de una persona para validar un argumento, en lugar de ofrecer evidencia o razones. Es especialmente problemática cuando la autoridad citada no es experta en el tema.",
    icono: "fa-crown",
  },
  dicotomia: {
    titulo: "Falsa dicotomía",
    subtitulo:
      "Falacia que presenta solo dos opciones como si fueran las únicas posibles, ocultando otras alternativas intermedias o distintas.",
    icono: "fa-code-branch",
  },
};

/**
 * Ejemplos de argumento a clasificar. TODOS VERBATIM:
 *  - origen "A1": campo "ejemplo" del término correspondiente en el glosario A1.
 *  - origen "A2": una de las "opciones" del quiz A2, clasificada por la propia
 *    actividad bajo esa falacia (enunciado/retroalimentación de A2).
 */
export const EJEMPLOS: { id: string; texto: string; falacia: Falacia }[] = [
  {
    id: "ej-adh-1",
    texto:
      "«No le hagas caso a sus propuestas ecológicas porque es hipócrita y llega en coche»: la validez del argumento ecológico no depende de la conducta personal del emisor.",
    falacia: "ad-hominem",
  },
  {
    id: "ej-adh-2",
    texto:
      "«No vale la pena escuchar sus propuestas ambientales porque ni él separa su basura.»",
    falacia: "ad-hominem",
  },
  {
    id: "ej-paja-1",
    texto:
      "Si alguien propone más regulación financiera y su oponente responde «quiere destruir el capitalismo y el libre mercado», ataca una postura más extrema que la que realmente se defendió.",
    falacia: "hombre-paja",
  },
  {
    id: "ej-pend-1",
    texto:
      "«Si legalizamos el cannabis, en diez años todas las drogas serán legales y la sociedad colapsará»: supone una cadena de eventos inevitables que no se argumenta.",
    falacia: "pendiente",
  },
  {
    id: "ej-pend-2",
    texto:
      "«Si permites que los estudiantes usen celular, pronto querrán hacer lo que quieran.»",
    falacia: "pendiente",
  },
  {
    id: "ej-aut-1",
    texto:
      "Usar la opinión de un futbolista famoso para defender una dieta específica: apela a su autoridad como celebridad, no a evidencia nutricional.",
    falacia: "autoridad",
  },
  {
    id: "ej-dic-1",
    texto:
      "«O estás con nosotros o estás contra nosotros»: ignora la posibilidad de estar en desacuerdo en algunos puntos y de acuerdo en otros.",
    falacia: "dicotomia",
  },
  {
    id: "ej-dic-2",
    texto:
      "Un analista político dice: «O apoyan esta reforma o quieren que el país siga en el caos.»",
    falacia: "dicotomia",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 2 — ¿Argumento válido o falacia? (clasifica por su validez lógica)
 * Argumentos VERBATIM de A1; la etiqueta válido/inválido se deriva de la
 * propia definición verbatim del término del que procede cada ejemplo.
 * ───────────────────────────────────────────────────────────────────────── */
export type Validez = "valido" | "invalido";

export const VALIDEZ_INFO: Record<
  Validez,
  { titulo: string; subtitulo: string; icono: string }
> = {
  valido: {
    titulo: "Argumento válido",
    subtitulo:
      "La estructura lógica garantiza que si las premisas son verdaderas, la conclusión también lo es: deducción y silogismo.",
    icono: "fa-circle-check",
  },
  invalido: {
    titulo: "Falacia (parece válido sin serlo)",
    subtitulo:
      "Argumento que parece válido o convincente sin serlo realmente: usa recursos retóricos engañosos o una cadena no justificada.",
    icono: "fa-triangle-exclamation",
  },
};

export const ARGUMENTOS: { id: string; texto: string; validez: Validez }[] = [
  {
    id: "ar-v1",
    texto:
      "P1: Todos los humanos son mortales. P2: Sócrates es humano. Conclusión: Sócrates es mortal.",
    validez: "valido",
  },
  {
    id: "ar-v2",
    texto:
      "Todos los mamíferos tienen sangre caliente; la ballena es un mamífero; luego la ballena tiene sangre caliente.",
    validez: "valido",
  },
  {
    id: "ar-v3",
    texto:
      "Si todos los cuerpos graves caen, y esta piedra es un cuerpo grave, entonces cae.",
    validez: "valido",
  },
  {
    id: "ar-i1",
    texto:
      "«Si permites el matrimonio igualitario, después querrán casarse con animales»: supone consecuencias extremas sin justificación.",
    validez: "invalido",
  },
  {
    id: "ar-i2",
    texto:
      "«O estás con nosotros o estás contra nosotros»: presenta solo dos opciones como si fueran las únicas posibles.",
    validez: "invalido",
  },
  {
    id: "ar-i3",
    texto:
      "Usar el prestigio de una celebridad para validar una afirmación, en lugar de ofrecer evidencia o razones.",
    validez: "invalido",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 3 — Empareja término y definición (glosario A5, verbatim)
 * ───────────────────────────────────────────────────────────────────────── */
export const PARES: { id: string; termino: string; definicion: string; ejemplo: string }[] = [
  {
    id: "gl-proposicion",
    termino: "Proposición",
    definicion:
      "Enunciado declarativo que puede ser verdadero o falso. Es la unidad mínima del razonamiento lógico.",
    ejemplo: "«La Tierra orbita alrededor del Sol» es una proposición verdadera.",
  },
  {
    id: "gl-silogismo",
    termino: "Silogismo",
    definicion:
      "Forma de razonamiento deductivo compuesta por una premisa mayor, una premisa menor y una conclusión que se sigue necesariamente.",
    ejemplo: "Todo mamífero respira → el delfín es mamífero → el delfín respira.",
  },
  {
    id: "gl-deduccion",
    termino: "Deducción",
    definicion:
      "Razonamiento que parte de principios o premisas generales para obtener una conclusión particular necesaria.",
    ejemplo: "Si todos los cuerpos graves caen, y esta piedra es un cuerpo grave, entonces cae.",
  },
  {
    id: "gl-induccion",
    termino: "Inducción",
    definicion:
      "Razonamiento que a partir de casos particulares observados infiere una generalización probable.",
    ejemplo: "He observado que el sol sale cada mañana; por inducción concluyo que saldrá mañana también.",
  },
  {
    id: "gl-falacia",
    termino: "Falacia",
    definicion:
      "Argumento que parece válido pero contiene un error lógico o una trampa retórica. Puede ser formal (estructural) o informal (contextual).",
    ejemplo: "Falacia de pendiente resbaladiza: «Si permites eso, pronto todo estará permitido».",
  },
  {
    id: "gl-tabla",
    termino: "Tabla de verdad",
    definicion:
      "Herramienta que lista todos los valores posibles de proposiciones simples y calcula el valor de verdad de proposiciones compuestas (∧, ∨, →, ↔).",
    ejemplo: "P=V, Q=F → P ∧ Q = F; P ∨ Q = V.",
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
    pregunta:
      "Un argumento deductivo válido garantiza que si las premisas son verdaderas, la conclusión también lo será.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro:
      "Correcto. La deducción preserva la verdad: la conclusión se sigue necesariamente de las premisas. Ej.: todos los humanos son mortales; Sócrates es humano; luego, Sócrates es mortal.",
  },
  {
    pregunta:
      "El razonamiento inductivo permite derivar conclusiones universales con certeza absoluta a partir de casos particulares.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro:
      "Falso. La inducción ofrece conclusiones probables, no ciertas: por más cisnes blancos que observemos, no podemos garantizar que no exista un cisne negro.",
  },
  {
    pregunta:
      "Una falacia ad hominem ataca la persona que presenta el argumento en lugar de refutar el argumento mismo.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro:
      "Correcto. La falacia ad hominem descalifica al interlocutor («tú mientes porque eres interesado») sin analizar la validez lógica de lo que afirma.",
  },
  {
    pregunta:
      "En una tabla de verdad, la conjunción (P ∧ Q) es verdadera solo cuando ambas proposiciones son verdaderas.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro:
      "Correcto. La conjunción lógica exige que P y Q sean ambas verdaderas; basta con que una sea falsa para que P ∧ Q resulte falsa.",
  },
  {
    pregunta:
      "Un silogismo categórico se compone de dos premisas y una conclusión, siendo la premisa mayor la que contiene el término medio.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro:
      "Falso. El término medio aparece en AMBAS premisas pero no en la conclusión. La premisa mayor contiene el predicado de la conclusión; la menor contiene el sujeto.",
  },
];

/** Dato verbatim del glosario A1 (definición de «Falacia»). */
export const DATO_FALACIAS =
  "Una falacia es un error en el razonamiento que hace que un argumento parezca válido o convincente sin serlo realmente. Puede ser formal (violar las reglas lógicas) o informal (usar recursos retóricos engañosos).";
