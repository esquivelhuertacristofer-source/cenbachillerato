/**
 * Datos del laboratorio «Have you ever…? — compartir experiencias recientes».
 * Progresión IN-III-P02 (Inglés III, semestre 3). Ancla evaluable: IN-III-P02-A4.
 *
 * Módulo de datos puro: sin React, sin three.js.
 *
 * QUÉ ES VERBATIM DE LA BASE
 *  · LECTURA_A1 y CALLOUT_A1 …… IN-III-P02-A1 (lectura), palabra por palabra.
 *  · PREGUNTAS_A1 ……………………… IN-III-P02-A1, preguntas de comprensión y su guía.
 *  · HUECOS_A2 ………………………… IN-III-P02-A2 (fill_blanks): texto, pistas,
 *    respuestas y alternativas aceptadas.
 *  · QUIZ_A4 …………………………… IN-III-P02-A4 (quiz verdadero/falso), enunciados y
 *    retroalimentación; el mínimo de aprobación (70) también es el de la BD.
 *  · GLOSARIO_A5 ……………………… IN-III-P02-A5 (glosario interactivo).
 *  · TAREA_A3 ………………………… IN-III-P02-A3 (reflexión escrita): consigna y criterios.
 *  · DEL_VIDEO_A9 …………………… IN-III-P02-A9 (video con preguntas).
 *
 * QUÉ ES MATERIAL NUEVO ESCRITO PARA ESTA PRÁCTICA
 *  · Las cuatro CHARLAS, los diez ítems de MARCADORES y las seis EXPERIENCIAS.
 *    Son inglés estadounidense estándar y usan exactamente el vocabulario, las
 *    estructuras y los ejemplos de la lectura A1 (chapulines, cenote, Yucatán,
 *    las mariposas monarca, «for three years», «since 2021», «since primary
 *    school»). Sofía y Bruno son personajes ficticios.
 *
 * EL ÁNGULO (y por qué NO repite a `present-perfect-ingles`, que ya existe)
 * Aquel laboratorio (IN-V-P02) trabaja la conjugación en abstracto: clasifica
 * oraciones sueltas por tiempo verbal y empareja estructuras con su definición.
 * Aquí lo manipulable es la CONVERSACIÓN. La pregunta abre en present perfect
 * («Have you ever tried chapulines?»), la respuesta corta la contesta con su
 * mismo auxiliar («Yes, I have.») y en cuanto alguien pregunta cuándo, dónde o
 * con quién, el inglés SALTA al past simple («I tried them last year»). Ese
 * salto es el corazón de la progresión y es donde todo el mundo se atora.
 */

import type { TextoHuecosData } from "./_mecanica-huecos";
import type { QuizEvaluable } from "./_reto-quiz";

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 1 · «Arma la charla» — la conversación, turno por turno
 * ═══════════════════════════════════════════════════════════════════════════
 * Cuatro intercambios entre dos estudiantes. En cada turno hay tres líneas
 * posibles y sólo una encaja. Los distractores no son inglés absurdo: son los
 * errores reales del tema (contestar «Yes, I did» a un «Have you…?», meter una
 * fecha en el present perfect, seguir en present perfect cuando la pregunta ya
 * fijó un momento) y, en algunos casos, inglés perfectamente correcto que
 * comunica OTRA COSA. La retroalimentación lo dice así, en español.
 */

export type Hablante = "a" | "b";

/** Qué hace el turno dentro de la conversación. */
export type FocoTurno = "abre" | "responde" | "salto" | "detalle" | "marcador" | "duracion";

export interface FocoInfo {
  titulo: string;
  explica: string;
  /** Cómo se dibuja la línea de vida mientras ese turno está en pantalla. */
  linea: "banda" | "pin" | "desde";
}

export const FOCO_INFO: Record<FocoTurno, FocoInfo> = {
  abre: {
    titulo: "Abre con la experiencia",
    explica: "Present perfect: pregunta por toda la vida hasta hoy, sin fijar ningún momento.",
    linea: "banda",
  },
  responde: {
    titulo: "Contesta en corto",
    explica: "La respuesta corta repite el auxiliar de la pregunta: Have you…? → Yes, I have.",
    linea: "banda",
  },
  salto: {
    titulo: "El salto al pasado",
    explica: "Cuando el seguimiento pregunta cuándo, dónde o con quién, el inglés cambia a past simple.",
    linea: "pin",
  },
  detalle: {
    titulo: "Da el detalle con fecha",
    explica: "Con un momento dicho en la frase, el verbo va en past simple.",
    linea: "pin",
  },
  marcador: {
    titulo: "Coloca el marcador",
    explica: "ever, never, already, yet, just y always tienen cada uno su posición y su sentido.",
    linea: "banda",
  },
  duracion: {
    titulo: "Dice desde cuándo",
    explica: "for + duración, since + punto de inicio: algo que empezó antes y sigue hoy.",
    linea: "desde",
  },
};

export interface OpcionTurno {
  texto: string;
  correcta: boolean;
  /** Qué comunica esa línea, o por qué no encaja. En español. */
  comunica: string;
}

export interface TurnoCharla {
  id: string;
  quien: Hablante;
  foco: FocoTurno;
  /** Lo que quiere lograr quien habla, en español. */
  intencion: string;
  opciones: OpcionTurno[];
  /** Traducción libre de la línea correcta. */
  es: string;
  /** La regla, que se revela al acertar. */
  regla: string;
}

export interface Charla {
  id: string;
  titulo: string;
  contexto: string;
  /** Nombres de los dos hablantes (a la izquierda y a la derecha de la escena). */
  a: string;
  b: string;
  turnos: TurnoCharla[];
}

export const CHARLAS: Charla[] = [
  {
    id: "comida",
    titulo: "Food",
    contexto:
      "Sofía y Bruno hacen la encuesta que pide la lectura A1: tres preguntas con «Have you ever…?» sobre comida, viajes y cultura. Empiezan por la comida.",
    a: "Sofía",
    b: "Bruno",
    turnos: [
      {
        id: "co-1",
        quien: "a",
        foco: "abre",
        intencion: "Preguntarle a Bruno si alguna vez, en toda su vida, ha probado chapulines.",
        opciones: [
          {
            texto: "Have you ever tried chapulines?",
            correcta: true,
            comunica: "Pregunta por toda su vida hasta hoy, sin fijar ningún momento. Es justo lo que quieres saber.",
          },
          {
            texto: "Do you ever try chapulines?",
            correcta: false,
            comunica: "Esto pregunta por una costumbre («¿sueles probarlos?»), no por una experiencia. El auxiliar del present perfect es have/has, no do.",
          },
          {
            texto: "Have you ever tried chapulines yesterday?",
            correcta: false,
            comunica: "«Yesterday» fija un momento, y con un momento fijo ya no caben ni «ever» ni el present perfect: sería «Did you try chapulines yesterday?».",
          },
        ],
        es: "¿Alguna vez has probado chapulines?",
        regla: "Have + sujeto + ever + participio. La pregunta de experiencia abre sin decir cuándo.",
      },
      {
        id: "co-2",
        quien: "b",
        foco: "responde",
        intencion: "Contestar que sí, en corto, antes de dar cualquier detalle.",
        opciones: [
          { texto: "Yes, I have.", correcta: true, comunica: "La respuesta corta repite el auxiliar de la pregunta: Have you…? → Yes, I have." },
          { texto: "Yes, I did.", correcta: false, comunica: "«Did» contesta a una pregunta en past simple («Did you try…?»). Aquí te preguntaron con «have»." },
          { texto: "Yes, I do.", correcta: false, comunica: "«Do» contesta a una pregunta de rutina («Do you try…?»), no a una de experiencia." },
        ],
        es: "Sí, sí los he probado.",
        regla: "Yes, I have. / No, I haven't. La respuesta corta nunca repite el verbo principal.",
      },
      {
        id: "co-3",
        quien: "a",
        foco: "salto",
        intencion: "Ahora sí, preguntar CUÁNDO fue.",
        opciones: [
          { texto: "When did you try them?", correcta: true, comunica: "Al preguntar cuándo ya estás fijando un momento: la pregunta salta al past simple." },
          {
            texto: "When have you tried them?",
            correcta: false,
            comunica: "El present perfect no admite «when»: no se puede preguntar por el momento de algo que, por definición, deja el momento sin decir.",
          },
          { texto: "When do you try them?", correcta: false, comunica: "Eso pregunta por una rutina: «¿cuándo sueles probarlos?»." },
        ],
        es: "¿Cuándo los probaste?",
        regla: "Aquí está el salto: la pregunta abre en present perfect y el seguimiento (when / where / who with) cambia a past simple.",
      },
      {
        id: "co-4",
        quien: "b",
        foco: "detalle",
        intencion: "Contar cuándo y dónde fue.",
        opciones: [
          { texto: "I tried them last year at a fair in Oaxaca.", correcta: true, comunica: "Con «last year» en la frase, el verbo va en past simple: tried." },
          {
            texto: "I have tried them last year at a fair in Oaxaca.",
            correcta: false,
            comunica: "«Last year» y el present perfect no pueden ir juntos. Es el error más común de toda la progresión.",
          },
          { texto: "I try them last year at a fair in Oaxaca.", correcta: false, comunica: "El presente simple no puede llevar una fecha pasada." },
        ],
        es: "Los probé el año pasado en una feria en Oaxaca.",
        regla: "Cuando la fecha se dice, el verbo va en past simple: «tried», no «have tried».",
      },
      {
        id: "co-5",
        quien: "a",
        foco: "salto",
        intencion: "Preguntar con quién fue.",
        opciones: [
          { texto: "Who did you go with?", correcta: true, comunica: "El seguimiento «con quién» también va en past simple, y «with» se queda al final." },
          { texto: "Who have you gone with?", correcta: false, comunica: "Sigues en present perfect, pero ya están hablando de aquella vez concreta: toca past simple." },
          { texto: "Who you went with?", correcta: false, comunica: "Falta el auxiliar: en las preguntas de past simple se usa «did» + verbo en forma base." },
        ],
        es: "¿Con quién fuiste?",
        regla: "Who did you go with? — el seguimiento pregunta por aquella vez, así que es past simple.",
      },
      {
        id: "co-6",
        quien: "b",
        foco: "detalle",
        intencion: "Decir con quién fue.",
        opciones: [
          { texto: "I went with my cousins.", correcta: true, comunica: "go → went. Past simple irregular." },
          { texto: "I have gone with my cousins.", correcta: false, comunica: "Otra vez el present perfect donde ya se habla de un momento concreto." },
          { texto: "I goed with my cousins.", correcta: false, comunica: "«Go» es irregular: su pasado es «went», no «goed»." },
        ],
        es: "Fui con mis primos.",
        regla: "El intercambio completo: pregunta de experiencia → respuesta corta → seguimiento → detalle en past simple.",
      },
    ],
  },
  {
    id: "viaje",
    titulo: "Travel",
    contexto: "Segunda pregunta de la encuesta: los viajes. Ahora pregunta Bruno, y Sofía nunca ha ido a la península de Yucatán.",
    a: "Sofía",
    b: "Bruno",
    turnos: [
      {
        id: "vi-1",
        quien: "b",
        foco: "abre",
        intencion: "Preguntar si Sofía ha visitado un cenote alguna vez.",
        opciones: [
          { texto: "Have you ever visited a cenote?", correcta: true, comunica: "have + participio. «Visited» es el participio de «visit» (regular, con -ed)." },
          { texto: "Have you ever visit a cenote?", correcta: false, comunica: "Después de «have» va el PARTICIPIO, no el verbo base: visited." },
          { texto: "Are you ever visited a cenote?", correcta: false, comunica: "El auxiliar del present perfect es have/has, nunca «be»." },
        ],
        es: "¿Alguna vez has visitado un cenote?",
        regla: "have/has + past participle. En los verbos regulares el participio es el mismo -ed del pasado.",
      },
      {
        id: "vi-2",
        quien: "a",
        foco: "responde",
        intencion: "Contestar que no, en corto.",
        opciones: [
          { texto: "No, I haven't.", correcta: true, comunica: "Negativa corta: haven't = have not, el mismo auxiliar de la pregunta." },
          { texto: "No, I didn't.", correcta: false, comunica: "«Didn't» contesta a una pregunta en past simple." },
          { texto: "No, I don't.", correcta: false, comunica: "«Don't» contesta a una pregunta de rutina." },
        ],
        es: "No, no he ido.",
        regla: "No, I haven't. Igual que en afirmativo, la respuesta corta se queda en el auxiliar.",
      },
      {
        id: "vi-3",
        quien: "a",
        foco: "marcador",
        intencion: "Explicar que nunca ha ido a esa parte del país.",
        opciones: [
          { texto: "I have never been to Yucatán.", correcta: true, comunica: "«Never» ya niega, así que el auxiliar se queda en afirmativo: have, no haven't." },
          { texto: "I haven't never been to Yucatán.", correcta: false, comunica: "Doble negación: el inglés estándar no niega dos veces. O «I haven't been» o «I have never been»." },
          { texto: "I didn't never go to Yucatán.", correcta: false, comunica: "Doble negación y, además, past simple para una experiencia sin fecha." },
        ],
        es: "Nunca he ido a Yucatán.",
        regla: "I have never + participio. Nunca «haven't never».",
      },
      {
        id: "vi-4",
        quien: "a",
        foco: "abre",
        intencion: "Devolverle la pregunta a Bruno.",
        opciones: [
          { texto: "Have you been there?", correcta: true, comunica: "be → been. «Have you been to…?» es la forma normal de preguntar si alguien ha estado en un lugar." },
          {
            texto: "Have you gone there?",
            correcta: false,
            comunica: "Es inglés correcto, pero «has gone» sugiere que la persona se fue y todavía no vuelve. Para la experiencia se usa «has been».",
          },
          { texto: "Have you went there?", correcta: false, comunica: "«Went» es el pasado, no el participio: el participio de «go» es «gone» (o «been»)." },
        ],
        es: "¿Tú sí has ido?",
        regla: "been = fue y ya volvió; gone = se fue y sigue allá. Para experiencias, siempre «been».",
      },
      {
        id: "vi-5",
        quien: "b",
        foco: "detalle",
        intencion: "Contestar que sí y, enseguida, dar la fecha.",
        opciones: [
          { texto: "Yes, I have. I went there in 2023 with my family.", correcta: true, comunica: "Respuesta corta en present perfect y, enseguida, el detalle con fecha en past simple." },
          { texto: "Yes, I have. I have gone there in 2023 with my family.", correcta: false, comunica: "«In 2023» es una fecha: el detalle pide past simple." },
          { texto: "Yes, I did. I have been there in 2023 with my family.", correcta: false, comunica: "Los dos tiempos están cambiados de lugar: el auxiliar de la respuesta y el del detalle." },
        ],
        es: "Sí. Fui en 2023 con mi familia.",
        regla: "«Yes, I have. I went there in 2023.» Esta frase resume toda la progresión en dos renglones.",
      },
      {
        id: "vi-6",
        quien: "a",
        foco: "salto",
        intencion: "Preguntar cómo estuvo aquel viaje.",
        opciones: [
          { texto: "How was it?", correcta: true, comunica: "Preguntas por aquella vez concreta, que ya tiene fecha: past simple del verbo «be»." },
          { texto: "How has it been?", correcta: false, comunica: "Eso pregunta cómo le ha ido últimamente, no cómo estuvo aquel viaje." },
          { texto: "How is it?", correcta: false, comunica: "Eso pregunta cómo es el lugar hoy, no cómo estuvo el viaje." },
        ],
        es: "¿Cómo estuvo?",
        regla: "En cuanto la conversación se instala en un momento concreto, todo lo que siga va en past simple.",
      },
    ],
  },
  {
    id: "proyecto",
    titulo: "The project",
    contexto: "Faltan dos días para entregar el proyecto de inglés. Aquí entran los marcadores que la actividad A6 pone a prueba: already, yet y just.",
    a: "Sofía",
    b: "Bruno",
    turnos: [
      {
        id: "pr-1",
        quien: "a",
        foco: "marcador",
        intencion: "Preguntar si Bruno YA terminó el proyecto.",
        opciones: [
          { texto: "Have you finished the English project yet?", correcta: true, comunica: "«Yet» va al final y sólo en preguntas y negativas: pregunta, sin más, si ya está." },
          {
            texto: "Have you already finished the English project?",
            correcta: false,
            comunica: "Es inglés correcto, pero «already» en pregunta suena a sorpresa («¿ya? ¿tan rápido?»). Para preguntar neutro se usa «yet», al final.",
          },
          { texto: "Have you finished yet the English project?", correcta: false, comunica: "«Yet» no se mete entre el verbo y su objeto: va al final de la oración." },
        ],
        es: "¿Ya terminaste el proyecto de inglés?",
        regla: "yet = todavía / ya. Sólo en preguntas y negativas, y al final de la frase.",
      },
      {
        id: "pr-2",
        quien: "b",
        foco: "marcador",
        intencion: "Contestar que todavía no.",
        opciones: [
          { texto: "No, I haven't finished it yet.", correcta: true, comunica: "Negativa + «yet» al final: la fórmula exacta de «todavía no»." },
          { texto: "No, I haven't finished it already.", correcta: false, comunica: "«Already» no va en negativas; para «todavía no» el inglés usa «yet»." },
          { texto: "No, I don't finish it yet.", correcta: false, comunica: "«Yet» pide present perfect, no presente simple." },
        ],
        es: "No, todavía no lo termino.",
        regla: "haven't + participio + … + yet. Es la frase de A6: «She hasn't called me yet».",
      },
      {
        id: "pr-3",
        quien: "b",
        foco: "marcador",
        intencion: "Decir lo que sí lleva hecho.",
        opciones: [
          { texto: "I have already written the introduction.", correcta: true, comunica: "«Already» va entre el auxiliar y el participio, y sólo en afirmativas." },
          { texto: "I have written already the introduction.", correcta: false, comunica: "«Already» no se mete entre el participio y su objeto." },
          { texto: "I have yet written the introduction.", correcta: false, comunica: "«Yet» no va en afirmativas ni en medio de la frase." },
        ],
        es: "Ya escribí la introducción.",
        regla: "already = ya, en afirmativas y en medio: have + already + participio.",
      },
      {
        id: "pr-4",
        quien: "a",
        foco: "marcador",
        intencion: "Decir que ella apenas empezó el suyo.",
        opciones: [
          { texto: "I have just started mine.", correcta: true, comunica: "«Just» = hace un momento, y va entre el auxiliar y el participio." },
          { texto: "I have started just mine.", correcta: false, comunica: "Ahí «just» significa «solamente»: cambia por completo el sentido de la frase." },
          { texto: "I just have started mine.", correcta: false, comunica: "El orden normal es have + just + participio." },
        ],
        es: "Yo apenas empecé el mío.",
        regla: "just = acabar de. have + just + participio, igual que already.",
      },
      {
        id: "pr-5",
        quien: "a",
        foco: "salto",
        intencion: "Preguntar dónde encontró Bruno la información.",
        opciones: [
          { texto: "Where did you find the information?", correcta: true, comunica: "El seguimiento pregunta por un dato de aquel momento: did + verbo en forma base." },
          { texto: "Where have you found the information?", correcta: false, comunica: "Ya no hablas de la experiencia en general, sino de aquella búsqueda concreta: past simple." },
          { texto: "Where did you found the information?", correcta: false, comunica: "Después de «did», el verbo va en forma base: «find», no «found». El pasado ya lo lleva el auxiliar." },
        ],
        es: "¿Dónde encontraste la información?",
        regla: "did + forma base. Un solo verbo lleva la marca de pasado, y es el auxiliar.",
      },
      {
        id: "pr-6",
        quien: "b",
        foco: "detalle",
        intencion: "Contestar dónde y cuándo.",
        opciones: [
          { texto: "I found it in the school library last Tuesday.", correcta: true, comunica: "find → found. Con «last Tuesday» en la frase, past simple." },
          { texto: "I have found it in the school library last Tuesday.", correcta: false, comunica: "Fecha y present perfect no conviven." },
          { texto: "I find it in the school library last Tuesday.", correcta: false, comunica: "Presente simple con una fecha pasada: imposible." },
        ],
        es: "La encontré en la biblioteca de la escuela el martes pasado.",
        regla: "Toda la charla vuelve al mismo sitio: si la frase dice cuándo, el verbo va en past simple.",
      },
    ],
  },
  {
    id: "desde",
    titulo: "How long?",
    contexto: "Sofía es nueva en la escuela. Bruno le pregunta desde cuándo estudia inglés: aquí mandan «for» y «since», los dos de la lectura A1.",
    a: "Sofía",
    b: "Bruno",
    turnos: [
      {
        id: "de-1",
        quien: "b",
        foco: "duracion",
        intencion: "Preguntar cuánto tiempo lleva estudiando inglés (y sigue estudiándolo).",
        opciones: [
          { texto: "How long have you studied English?", correcta: true, comunica: "«How long» + present perfect pregunta por algo que empezó antes y sigue hoy." },
          {
            texto: "How long did you study English?",
            correcta: false,
            comunica: "Es inglés correcto, pero significa que ya dejó de estudiarlo. Sofía sigue en la clase.",
          },
          { texto: "How long do you study English?", correcta: false, comunica: "Eso pregunta cuánto tiempo le dedica al día: es una rutina." },
        ],
        es: "¿Cuánto llevas estudiando inglés?",
        regla: "How long + have/has + participio: lo que empezó en el pasado y sigue en pie.",
      },
      {
        id: "de-2",
        quien: "a",
        foco: "duracion",
        intencion: "Decir cuánto tiempo lleva: tres años.",
        opciones: [
          { texto: "I have studied English for three years.", correcta: true, comunica: "for + duración: three years, two months, a long time." },
          { texto: "I have studied English since three years.", correcta: false, comunica: "«Since» pide un punto de inicio (2021, last May, primary school), no una duración." },
          { texto: "I have studied English during three years.", correcta: false, comunica: "«During» acompaña a un periodo con nombre (during the summer), no a una cantidad de tiempo." },
        ],
        es: "Llevo tres años estudiando inglés.",
        regla: "Verbatim de A1: «I have studied English for five years» — for + duración.",
      },
      {
        id: "de-3",
        quien: "a",
        foco: "duracion",
        intencion: "Decir desde cuándo vive en Guadalajara.",
        opciones: [
          { texto: "And I have lived in Guadalajara since 2021.", correcta: true, comunica: "since + punto de inicio: el año en que empezó." },
          { texto: "And I have lived in Guadalajara for 2021.", correcta: false, comunica: "«For» pide una duración; 2021 es un punto en el tiempo, no una cantidad." },
          { texto: "And I live in Guadalajara since 2021.", correcta: false, comunica: "Con «since» el verbo va en present perfect, no en presente simple." },
        ],
        es: "Y vivo en Guadalajara desde 2021.",
        regla: "Verbatim de A1: «I have studied English since 2021» — since + punto de inicio.",
      },
      {
        id: "de-4",
        quien: "b",
        foco: "salto",
        intencion: "Preguntar por qué se mudó su familia.",
        opciones: [
          { texto: "Why did you move here?", correcta: true, comunica: "La mudanza pasó en un momento concreto del pasado: past simple." },
          {
            texto: "Why have you moved here?",
            correcta: false,
            comunica: "Se usa cuando la mudanza es tan reciente que todavía es noticia. Si preguntas por aquel momento y sus razones, lo natural es «Why did you move here?».",
          },
          { texto: "Why do you move here?", correcta: false, comunica: "Presente simple: eso preguntaría por una costumbre de mudarse." },
        ],
        es: "¿Por qué te mudaste para acá?",
        regla: "Otra vez el salto: la charla venía en present perfect y el «por qué» de aquel momento la manda al past simple.",
      },
      {
        id: "de-5",
        quien: "a",
        foco: "detalle",
        intencion: "Contar cuándo y por qué se mudaron.",
        opciones: [
          { texto: "My family moved here when my mother got a new job.", correcta: true, comunica: "«When…» fija el momento, y las dos partes de la frase van en past simple." },
          { texto: "My family has moved here when my mother got a new job.", correcta: false, comunica: "El present perfect no admite un «when» que fije el momento." },
          { texto: "My family has moved here when my mother has got a new job.", correcta: false, comunica: "Ni una ni otra: cuando se cuenta una secuencia fechada, las dos van en past simple." },
        ],
        es: "Mi familia se mudó cuando mi mamá consiguió un trabajo nuevo.",
        regla: "En una narración con «when», todos los verbos de la secuencia van en past simple.",
      },
      {
        id: "de-6",
        quien: "b",
        foco: "marcador",
        intencion: "Decir que él, en cambio, siempre ha vivido aquí.",
        opciones: [
          { texto: "I have always lived in this neighborhood.", correcta: true, comunica: "«Always» va en medio: have + always + participio, igual que already y just." },
          { texto: "I have lived always in this neighborhood.", correcta: false, comunica: "«Always» no va después del participio." },
          { texto: "I always have lived in this neighborhood.", correcta: false, comunica: "El orden normal en inglés estándar es have + always + participio." },
        ],
        es: "Yo siempre he vivido en esta colonia.",
        regla: "always, already y just comparten sitio: entre el auxiliar y el participio.",
      },
    ],
  },
];

/** Cuántos turnos tiene la charla completa (los 24). */
export const TOTAL_TURNOS = CHARLAS.reduce((n, c) => n + c.turnos.length, 0);

/** Los turnos donde la conversación salta al past simple. */
export const TURNOS_SALTO = CHARLAS.flatMap((c) => c.turnos.filter((t) => t.foco === "salto")).map((t) => t.id);

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 2 · «¿Cuál va y dónde?» — los marcadores del present perfect
 * ═══════════════════════════════════════════════════════════════════════════
 * Cada ítem trae una frase partida en trozos, dos fichas candidatas y una o
 * varias ranuras. El alumno elige la ficha Y su lugar, y la escena arma la
 * oración que le queda para que vea con qué se queda antes de que se le diga si
 * está bien. Las explicaciones distinguen tres cosas distintas, porque no son
 * lo mismo: lo IMPOSIBLE («I have eaten never huitlacoche»), lo que existe pero
 * significa otra cosa («Have you ever finished…?») y lo que se oye pero no es
 * la posición neutra («…your homework already»).
 */

export interface ItemMarcador {
  id: string;
  /** Trozos de la frase. Hay una ranura DESPUÉS de cada trozo. */
  partes: string[];
  /** Lo que cierra la frase: el signo o el complemento final. */
  cierre: string;
  /** Las dos fichas entre las que hay que decidir. */
  fichas: string[];
  fichaCorrecta: string;
  ranuraCorrecta: number;
  /** Ranuras que se pueden pulsar. Si falta, son todas. */
  ranurasActivas?: number[];
  es: string;
  regla: string;
  /** Por qué NO la otra ficha. Clave = la ficha equivocada. */
  porFicha: Record<string, string>;
  /** Con la ficha correcta, por qué no esa ranura. Clave = índice de ranura. */
  porRanura: Record<string, string>;
}

export const MARCADORES: ItemMarcador[] = [
  {
    id: "mk-ever",
    partes: ["Have you", "been", "to a cenote"],
    cierre: "?",
    fichas: ["ever", "never"],
    fichaCorrecta: "ever",
    ranuraCorrecta: 0,
    es: "¿Alguna vez has estado en un cenote?",
    regla: "ever va entre el sujeto y el participio: Have you ever been…?",
    porFicha: { never: "«Never» niega, y esto es una pregunta. La pregunta de experiencia se hace con «ever»." },
    porRanura: {
      "1": "«Have you been ever to a cenote?» no se dice: «ever» no se mete entre el participio y su complemento.",
      "2": "«Have you been to a cenote ever?» se oye en habla muy informal, pero la posición que hay que aprender es justo antes del participio.",
    },
  },
  {
    id: "mk-never",
    partes: ["I have", "eaten", "huitlacoche"],
    cierre: ".",
    fichas: ["never", "yet"],
    fichaCorrecta: "never",
    ranuraCorrecta: 0,
    es: "Nunca he comido huitlacoche.",
    regla: "I have never + participio. El auxiliar se queda afirmativo porque «never» ya niega.",
    porFicha: { yet: "«Yet» sólo va en preguntas y negativas, y al final. Esta frase es afirmativa." },
    porRanura: {
      "1": "«I have eaten never huitlacoche» no existe: «never» no se pone después del participio.",
      "2": "«I have eaten huitlacoche never» tampoco: el sitio de «never» es antes del participio.",
    },
  },
  {
    id: "mk-already",
    partes: ["She has", "finished", "her homework"],
    cierre: ".",
    fichas: ["already", "yet"],
    fichaCorrecta: "already",
    ranuraCorrecta: 0,
    es: "Ella ya terminó su tarea.",
    regla: "already = ya, en afirmativas y en medio: has + already + participio.",
    porFicha: { yet: "«Yet» no va en afirmativas. Para decir «ya» en afirmativo, el inglés usa «already»." },
    porRanura: {
      "1": "«She has finished already her homework» separa el verbo de su objeto: no se dice así.",
      "2": "«She has finished her homework already» sí se oye, con tono de sorpresa. La posición neutra —la que conviene aprender— es entre «has» y el participio.",
    },
  },
  {
    id: "mk-yet-neg",
    partes: ["She hasn't", "called", "me"],
    cierre: ".",
    fichas: ["yet", "already"],
    fichaCorrecta: "yet",
    ranuraCorrecta: 2,
    es: "Todavía no me ha llamado.",
    regla: "yet cierra la frase: hasn't called me yet. Es la oración de la actividad A6.",
    porFicha: { already: "«Already» no se usa en negativas: para «todavía no» el inglés usa «yet»." },
    porRanura: {
      "0": "«She hasn't yet called me» existe en inglés escrito muy formal, pero lo normal —y lo que pide A6— es «yet» al final.",
      "1": "«She hasn't called yet me» no se dice: «yet» no se mete entre el verbo y su objeto.",
    },
  },
  {
    id: "mk-yet-q",
    partes: ["Have you", "finished", "the project"],
    cierre: "?",
    fichas: ["yet", "ever"],
    fichaCorrecta: "yet",
    ranuraCorrecta: 2,
    es: "¿Ya terminaste el proyecto?",
    regla: "En preguntas, «yet» también va al final: Have you finished the project yet?",
    porFicha: {
      ever: "«Have you ever finished the project?» es inglés correcto, pero pregunta si alguna vez en tu vida lo has terminado. Aquí quieres saber si YA está: eso es «yet».",
    },
    porRanura: {
      "0": "«Have you yet finished…?» suena a inglés de hace dos siglos; hoy «yet» va al final.",
      "1": "«Have you finished yet the project?» no se dice: «yet» no separa el verbo de su objeto.",
    },
  },
  {
    id: "mk-just",
    partes: ["The bus has", "arrived", "at the terminal"],
    cierre: ".",
    fichas: ["just", "yet"],
    fichaCorrecta: "just",
    ranuraCorrecta: 0,
    es: "El camión acaba de llegar a la terminal.",
    regla: "just = hace un momento, entre el auxiliar y el participio.",
    porFicha: { yet: "«Yet» no va en afirmativas." },
    porRanura: {
      "1": "«The bus has arrived just at the terminal» cambia el sentido: ahí «just» significa «justo en la terminal», no «acaba de».",
      "2": "«…at the terminal just» no significa nada en inglés.",
    },
  },
  {
    id: "mk-for-gdl",
    partes: ["I have lived in Guadalajara"],
    cierre: "three years.",
    fichas: ["for", "since"],
    fichaCorrecta: "for",
    ranuraCorrecta: 0,
    ranurasActivas: [0],
    es: "Llevo tres años viviendo en Guadalajara.",
    regla: "for + duración. Verbatim de A1: «I have lived in Guadalajara for three years».",
    porFicha: { since: "«Since» pide un punto de inicio (2021, last May, primary school). «Three years» es una duración." },
    porRanura: {},
  },
  {
    id: "mk-since-2021",
    partes: ["I have studied English"],
    cierre: "2021.",
    fichas: ["since", "for"],
    fichaCorrecta: "since",
    ranuraCorrecta: 0,
    ranurasActivas: [0],
    es: "Estudio inglés desde 2021.",
    regla: "since + punto de inicio. Verbatim de A1: «I have studied English since 2021».",
    porFicha: { for: "«For» pide una duración (three years). 2021 no es una cantidad de tiempo: es el punto donde empezó." },
    porRanura: {},
  },
  {
    id: "mk-since-primaria",
    partes: ["We have been classmates"],
    cierre: "primary school.",
    fichas: ["since", "for"],
    fichaCorrecta: "since",
    ranuraCorrecta: 0,
    ranurasActivas: [0],
    es: "Somos compañeros desde la primaria.",
    regla: "Verbatim de A1: «We have been classmates since primary school». Un punto de inicio no tiene que ser una fecha.",
    porFicha: { for: "«For» necesitaría una cantidad («for six years»). «Primary school» es el momento en que empezó." },
    porRanura: {},
  },
  {
    id: "mk-for-canada",
    partes: ["Her brother has lived in Canada"],
    cierre: "two years.",
    fichas: ["for", "since"],
    fichaCorrecta: "for",
    ranuraCorrecta: 0,
    ranurasActivas: [0],
    es: "Su hermano lleva dos años viviendo en Canadá.",
    regla: "Es la frase de la actividad A2: «Her brother has lived in Canada for two years».",
    porFicha: { since: "Con «since» habría que decir desde cuándo: «since 2024». «Two years» es cuánto lleva." },
    porRanura: {},
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 3 · «¿Le pones fecha?» — la misma vivencia, contada de dos maneras
 * ═══════════════════════════════════════════════════════════════════════════
 * La prueba dura de la progresión: «I have visited Oaxaca» frente a «I visited
 * Oaxaca in 2024». No se clasifica nada; se PRODUCE. El alumno pega o despega
 * la marca de tiempo y tiene que elegir la frase que le queda en cada caso. Al
 * armar las dos, ve el par completo y qué cambió exactamente.
 */

export interface OpcionFrase {
  texto: string;
  correcta: boolean;
  nota: string;
}

export interface EstadoExperiencia {
  consigna: string;
  opciones: OpcionFrase[];
  regla: string;
}

export interface Experiencia {
  id: string;
  /** El hecho, en español, sin tiempo verbal. */
  hecho: string;
  /** La marca de tiempo que se pega o se despega. */
  fecha: string;
  /** Dónde cae la fecha en la línea de vida (0 = hace mucho, 1 = hoy). */
  posLinea: number;
  sinFecha: EstadoExperiencia;
  conFecha: EstadoExperiencia;
}

export const EXPERIENCIAS: Experiencia[] = [
  {
    id: "ex-oaxaca",
    hecho: "Conocer Oaxaca",
    fecha: "in 2024",
    posLinea: 0.82,
    sinFecha: {
      consigna: "Quieres decir que conoces Oaxaca. No importa cuándo fue.",
      opciones: [
        { texto: "I have visited Oaxaca.", correcta: true, nota: "Experiencia sin fecha: have + participio. Lo que importa es que la viviste, no cuándo." },
        {
          texto: "I visited Oaxaca.",
          correcta: false,
          nota: "Es inglés correcto, pero cuenta un hecho de un momento que quien te oye ya tiene en mente. Para presentar la experiencia sin decir cuándo, el inglés usa el present perfect.",
        },
        { texto: "I have visited Oaxaca in 2024.", correcta: false, nota: "Imposible: el present perfect no admite una fecha." },
      ],
      regla: "Sin fecha en la frase → present perfect.",
    },
    conFecha: {
      consigna: "Ahora sí dices cuándo: in 2024.",
      opciones: [
        { texto: "I visited Oaxaca in 2024.", correcta: true, nota: "La fecha obliga al past simple: visited." },
        { texto: "I have visited Oaxaca in 2024.", correcta: false, nota: "El error más común de la progresión: fecha + present perfect no existe." },
        { texto: "I have visited Oaxaca.", correcta: false, nota: "Es correcta, pero se calla justo la fecha que querías decir." },
      ],
      regla: "Con fecha en la frase → past simple.",
    },
  },
  {
    id: "ex-chapulines",
    hecho: "Probar chapulines",
    fecha: "last Saturday",
    posLinea: 0.95,
    sinFecha: {
      consigna: "Quieres decir que ya los probaste alguna vez.",
      opciones: [
        { texto: "I have eaten chapulines.", correcta: true, nota: "eat → eaten. Participio irregular, y ninguna fecha a la vista." },
        { texto: "I have ate chapulines.", correcta: false, nota: "«Ate» es el pasado; el participio de «eat» es «eaten»." },
        { texto: "I have eaten chapulines last Saturday.", correcta: false, nota: "Con «last Saturday» dentro ya no cabe el present perfect." },
      ],
      regla: "eat → ate → eaten. El participio es la tercera forma, no el pasado.",
    },
    conFecha: {
      consigna: "Ahora dices el día: last Saturday.",
      opciones: [
        { texto: "I ate chapulines last Saturday.", correcta: true, nota: "Past simple irregular: ate." },
        { texto: "I have eaten chapulines last Saturday.", correcta: false, nota: "Fecha y present perfect siguen sin poder ir juntos." },
        { texto: "I eaten chapulines last Saturday.", correcta: false, nota: "El participio solo, sin auxiliar, no es un tiempo verbal." },
      ],
      regla: "«Last + día» es una fecha tan concreta como un año.",
    },
  },
  {
    id: "ex-monarcas",
    hecho: "Ver las mariposas monarca",
    fecha: "when I was twelve",
    posLinea: 0.45,
    sinFecha: {
      consigna: "Quieres decir que ya las viste, sin decir cuándo.",
      opciones: [
        { texto: "I have seen the monarch butterflies.", correcta: true, nota: "see → seen. La lectura A1 usa este mismo ejemplo con Michoacán." },
        { texto: "I have saw the monarch butterflies.", correcta: false, nota: "«Saw» es el pasado; el participio de «see» es «seen»." },
        { texto: "I see the monarch butterflies.", correcta: false, nota: "Presente simple: eso sería una costumbre, no una experiencia." },
      ],
      regla: "see → saw → seen.",
    },
    conFecha: {
      consigna: "Ahora dices cuándo fue: when I was twelve.",
      opciones: [
        { texto: "I saw the monarch butterflies when I was twelve.", correcta: true, nota: "«When I was twelve» fija el momento: past simple en las dos partes." },
        { texto: "I have seen the monarch butterflies when I was twelve.", correcta: false, nota: "El present perfect no admite un «when» que fije el momento." },
        { texto: "I saw the monarch butterflies when I have been twelve.", correcta: false, nota: "Las dos partes de la frase van en past simple: «when I was»." },
      ],
      regla: "«When I was…» es una fecha disfrazada de oración.",
    },
  },
  {
    id: "ex-chiapas",
    hecho: "Que ella viaje a Chiapas",
    fecha: "two summers ago",
    posLinea: 0.6,
    sinFecha: {
      consigna: "Hablas de ella: quieres decir que conoce Chiapas.",
      opciones: [
        { texto: "She has traveled to Chiapas.", correcta: true, nota: "Con she/he/it el auxiliar es «has», no «have»." },
        { texto: "She have traveled to Chiapas.", correcta: false, nota: "Con she/he/it siempre «has». Es el punto que la actividad A4 pone a prueba." },
        { texto: "She has travel to Chiapas.", correcta: false, nota: "Después de «has» va el participio: traveled." },
      ],
      regla: "I/you/we/they → have. He/she/it → has.",
    },
    conFecha: {
      consigna: "Ahora dices cuándo: two summers ago.",
      opciones: [
        { texto: "She traveled to Chiapas two summers ago.", correcta: true, nota: "«Ago» siempre pide past simple: mide la distancia desde un momento cerrado." },
        { texto: "She has traveled to Chiapas two summers ago.", correcta: false, nota: "«Ago» y el present perfect nunca van juntos." },
        { texto: "She has traveled to Chiapas.", correcta: false, nota: "Correcta, pero deja fuera el «two summers ago» que querías decir." },
      ],
      regla: "«… ago» es de las señales más claras de past simple.",
    },
  },
  {
    id: "ex-poema",
    hecho: "Que él escriba un poema en inglés",
    fecha: "last month",
    posLinea: 0.9,
    sinFecha: {
      consigna: "Hablas de él: quieres decir que ya lo hizo alguna vez.",
      opciones: [
        { texto: "He has written a poem in English.", correcta: true, nota: "write → written. Es el participio que pregunta el video A9." },
        { texto: "He has wrote a poem in English.", correcta: false, nota: "«Wrote» es el pasado; el participio es «written»." },
        { texto: "He has writed a poem in English.", correcta: false, nota: "«Write» es irregular: no lleva -ed en ninguna de sus formas." },
      ],
      regla: "write → wrote → written.",
    },
    conFecha: {
      consigna: "Ahora dices cuándo: last month.",
      opciones: [
        { texto: "He wrote a poem in English last month.", correcta: true, nota: "Past simple irregular: wrote." },
        { texto: "He has written a poem in English last month.", correcta: false, nota: "Otra vez la fecha peleada con el present perfect." },
        { texto: "He written a poem in English last month.", correcta: false, nota: "El participio necesita su auxiliar; solo no forma ningún tiempo." },
      ],
      regla: "El participio va con have/has; el pasado va solo.",
    },
  },
  {
    id: "ex-foto",
    hecho: "Que tomemos una foto del Popocatépetl",
    fecha: "in July",
    posLinea: 0.75,
    sinFecha: {
      consigna: "Hablas de ustedes: quieren decir que ya tienen esa foto.",
      opciones: [
        { texto: "We have taken a photo of the Popocatépetl volcano.", correcta: true, nota: "take → taken. Con «we» el auxiliar es «have»." },
        { texto: "We has taken a photo of the Popocatépetl volcano.", correcta: false, nota: "«Has» es sólo para he/she/it." },
        { texto: "We have took a photo of the Popocatépetl volcano.", correcta: false, nota: "«Took» es el pasado; el participio es «taken»." },
      ],
      regla: "take → took → taken.",
    },
    conFecha: {
      consigna: "Ahora dicen cuándo: in July.",
      opciones: [
        { texto: "We took a photo of the Popocatépetl volcano in July.", correcta: true, nota: "Con el mes dicho, past simple: took." },
        { texto: "We have took a photo of the Popocatépetl volcano in July.", correcta: false, nota: "Dos errores a la vez: fecha con present perfect y pasado donde va el participio." },
        { texto: "We have taken a photo of the Popocatépetl volcano in July.", correcta: false, nota: "Bien formada, pero un mes es un momento concreto: pide past simple." },
      ],
      regla: "Un mes, un año o un día: cualquiera de los tres manda la frase al past simple.",
    },
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 4 · «Completa el texto» — VERBATIM de IN-III-P02-A2
 * ═══════════════════════════════════════════════════════════════════════════
 * El párrafo, las pistas, las respuestas y las alternativas son las de la
 * actividad. La actividad declara `distingue_mayusculas: false`, y
 * `CompletaTexto` normaliza mayúsculas, acentos y apóstrofos, así que «has» y
 * «Has» valen igual y «haven't seen» entra escrito con o sin apóstrofo.
 */
export const HUECOS_A2: TextoHuecosData = {
  ancla: "IN-III-P02-A2 · Present Perfect: Fill in the Gaps",
  instrucciones: "Complete the sentences using the present perfect (have/has + past participle). The base verb is given in parentheses.",
  partes: [
    "Maria ",
    " never ",
    " (visit) another country, but she ",
    " (travel) to many states in Mexico. Her brother ",
    " (live) in Canada for two years. They ",
    " (not see) each other since last Christmas. Maria ",
    " (read) many books about English-speaking cultures. She ",
    " (study) English for three years now and she ",
    " (make) great progress.",
  ],
  huecos: [
    { respuesta: "has", alternativas: [], pista: "Use 'has' for she/he/it" },
    { respuesta: "visited", alternativas: [], pista: "Past participle of 'visit'" },
    { respuesta: "has travelled", alternativas: ["has traveled"], pista: "has + past participle of travel" },
    { respuesta: "has lived", alternativas: [], pista: "has + past participle of live" },
    { respuesta: "haven't seen", alternativas: ["have not seen"], pista: "Negative: haven't + past participle of see" },
    { respuesta: "has read", alternativas: [], pista: "has + past participle of read (irregular: read→read)" },
    { respuesta: "has studied", alternativas: [], pista: "has + past participle of study" },
    { respuesta: "has made", alternativas: [], pista: "has + past participle of make (irregular)" },
  ],
};

/* ═══════════════════════════════════════════════════════════════════════════
 * Reto evaluable — VERBATIM de IN-III-P02-A4 (quiz verdadero/falso)
 * ═══════════════════════════════════════════════════════════════════════════
 * Los cinco enunciados y su retroalimentación son los de la actividad; el
 * verdadero/falso se presenta como dos opciones para poder reutilizar la
 * tarjeta evaluable compartida. El mínimo (70 %) también es el de la BD.
 */
export const QUIZ_A4: QuizEvaluable = {
  titulo: "Reto evaluable — True or False: Present Perfect (A4)",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "El presente perfecto se forma con have/has + participio pasado.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correcto: I have visited / She has eaten.",
    },
    {
      enunciado: "Con 'he' y 'she' se usa 'have' ('She have visited Paris').",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 1,
      retroalimentacion: "No: con he/she/it se usa 'has': 'She has visited Paris'.",
    },
    {
      enunciado: "'Ever' y 'never' se usan con el presente perfecto para hablar de experiencias.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Sí: Have you ever tried sushi? / I have never been to Europe.",
    },
    {
      enunciado: "'Already' y 'yet' son marcadores del presente perfecto.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correcto: I have already eaten. / I haven't finished yet.",
    },
    {
      enunciado: "El presente perfecto describe una acción completada en el pasado en un tiempo específico.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 1,
      retroalimentacion: "No: cuando el tiempo es específico (yesterday, last year) usamos pasado simple, no perfecto.",
    },
  ],
};

/* ═══════════════════════════════════════════════════════════════════════════
 * Paneles verbatim
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Lectura A1, párrafo por párrafo, palabra por palabra. */
export const LECTURA_A1: string[] = [
  "The present perfect tense in English is one of the most useful and, at first, one of the most confusing. Once you understand what it does, you will use it constantly. Its main function is to talk about life experiences without saying when exactly they happened.",
  "The structure of the present perfect is: subject + have/has + past participle. With I, you, we, and they: I have visited Mexico City. We have eaten tamales. With he, she, and it: She has traveled to Oaxaca. He has never tried mole negro.",
  "To form the past participle, regular verbs add -ed (visit → visited, travel → traveled, live → lived). Irregular verbs must be memorized because they change in unpredictable ways: go → gone, eat → eaten, see → seen, be → been, have → had, do → done, write → written, speak → spoken, take → taken, give → given.",
  "The word 'ever' is used in questions to ask about any point in a person's life up to now: Have you ever visited a cenote? Have you ever tried chapulines (grasshoppers)? Have you ever seen a volcano up close? The answer is: Yes, I have. or No, I have not. (or No, I never have.)",
  "The word 'never' is used in negative statements to emphasize that an experience has never happened at any point in life: I have never eaten huitlacoche. She has never been to Chiapas. We have never seen the monarch butterflies in Michoacan.",
  "We use 'for' and 'since' with the present perfect to describe situations that started in the past and continue now. 'For' is followed by a duration: I have lived in Guadalajara for three years. 'Since' is followed by a starting point: I have studied English since 2021. We have been classmates since primary school.",
  "It is important to contrast the present perfect with the simple past. Use the present perfect for experiences with no specific time given: I have eaten tacos at a taqueria. Use the simple past when you mention a specific time: I ate tacos last Friday at the taqueria on the corner of Insurgentes. The same experience can be talked about with both tenses, but for different communicative purposes.",
  "Practice: conduct a class survey. Ask five classmates three questions with Have you ever...? related to Mexican food, travel, and cultural experiences. Record their answers and report back using the present perfect.",
];

/** Nota al margen de A1 (callout «info»), verbatim. */
export const CALLOUT_A1 =
  "In British English, the present perfect is used much more than in American English. Americans often use the simple past where British speakers use the present perfect: American: Did you eat already? British: Have you eaten already? Both are correct; the difference is regional. In academic and formal English worldwide, the present perfect remains the standard for talking about experiences.";

/** Preguntas de comprensión de A1, con su respuesta guía. Verbatim. */
export const PREGUNTAS_A1: { pregunta: string; respuesta: string }[] = [
  {
    pregunta: "What is the difference between the present perfect and the simple past? When do you use each?",
    respuesta:
      "Present perfect: experiences without a specific time (I have visited Oaxaca). Simple past: completed actions at a specific time (I visited Oaxaca last summer). The present perfect focuses on the experience; the simple past focuses on the time.",
  },
  {
    pregunta: 'How do you use "for" and "since" with the present perfect? Give an example of each.',
    respuesta: '"For" + duration: I have studied English for five years. "Since" + starting point: I have studied English since I was twelve.',
  },
  {
    pregunta: "Give the past participle of these five irregular verbs: go, eat, see, take, write.",
    respuesta: "Go → gone. Eat → eaten. See → seen. Take → taken. Write → written.",
  },
];

/** Glosario A5, verbatim (término, definición y ejemplo). */
export const GLOSARIO_A5: { termino: string; definicion: string; ejemplo: string }[] = [
  {
    termino: "have / has + past participle",
    definicion: "Estructura del presente perfecto (experiencias, logros recientes).",
    ejemplo: "I have visited Teotihuacan twice.",
  },
  { termino: "past participle", definicion: "3ª forma del verbo: visited, eaten, seen, been, done.", ejemplo: "Have you seen this movie?" },
  { termino: "ever / never", definicion: "Alguna vez / nunca — marcadores de experiencia.", ejemplo: "Have you ever tried Thai food? — I have never tried it." },
  { termino: "already / yet", definicion: "Ya (afirmativo) / todavía no (negativo/pregunta).", ejemplo: "I have already done my homework. / She hasn't called yet." },
  { termino: "with whom / with my family", definicion: "Con quién — para describir experiencias compartidas.", ejemplo: "I have travelled to Oaxaca with my family." },
  { termino: "Have you...? / I have...", definicion: "Estructura de pregunta y respuesta en presente perfecto.", ejemplo: "Have you ever cooked a big meal? — Yes, I have!" },
];

/** La tarea escrita de A3, verbatim: consigna, pistas y criterios. */
export const TAREA_A3 = {
  prompt:
    "Write about THREE experiences you have had in your life (or experiences you have never had but would like to have). Use present perfect (have/has + past participle) for each one. For the experiences you HAVE had, add ONE sentence in past simple explaining when or where it happened.",
  pistas: [
    "Start with: 'I have [verb-ed/irregular]...' or 'I have never [verb-ed/irregular]...'",
    "For experiences you have had, add detail: 'I visited Oaxaca two years ago.' or 'I ate sushi for the first time last year.'",
    "Use 'ever' in questions (have you ever...?) and 'never' for things you haven't done.",
    "Contrast present perfect and past simple: 'I have eaten tacos al pastor. The last time I ate them was at a market in Mexico City.'",
  ],
  criterios: [
    "Uses present perfect correctly (have/has + past participle) for all three experiences",
    "At least one sentence in past simple with a specific time or place",
    "Clear contrast between present perfect and past simple where applicable",
    "Text is understandable and at least 80 words",
  ],
};

/** Las dos preguntas cerradas del video A9, verbatim. */
export const DEL_VIDEO_A9: { pregunta: string; respuesta: string }[] = [
  { pregunta: "¿Cuál es el participio pasado del verbo 'write'?", respuesta: "written (no «wrote», que es el pasado, ni «writed», que no existe)." },
  {
    pregunta: "Si mencionas el momento exacto en que ocurrió algo, en inglés se usa el pasado simple y no el presente perfecto.",
    respuesta: "Verdadero. Es la regla que este laboratorio pone a prueba en cada modo.",
  },
];

/** La frase que resume la progresión entera. */
export const FRASE_CLAVE = "Yes, I have. I went there in 2023 with my family.";
