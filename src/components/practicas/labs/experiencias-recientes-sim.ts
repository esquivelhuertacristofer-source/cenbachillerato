/**
 * Modelo del SIMULADOR «La entrevista del club» (lab experiencias-recientes-ingles).
 *
 * Todo es FICTICIO: la maestra Rivas, el club «Viajeros del Sur» y el perfil
 * del alumno (cinco hechos de simulación) existen solo para practicar cómo se
 * cuenta una experiencia: present perfect para la experiencia sin fecha, past
 * simple en cuanto aparece el cuándo, for / since para lo que sigue hoy.
 *
 * El alumno responde la entrevista con una línea de tiempo de su vida delante
 * (de los 0 a los 16 años; el «ahora» es el borde derecho). La oración que
 * elige decide qué ANOTA el club en esa línea:
 *  · bien armada y fiel al perfil → marca correcta (franja, alfiler o «desde»);
 *  · mal armada («Yes, I did», una fecha dentro del present perfect, «since
 *    three years») → la maestra no puede ubicarla y anota un «?»;
 *  · bien armada pero contraria al perfil → el club anota algo FALSO: la marca
 *    queda en otro lugar y en rojo.
 * El modelo es determinista.
 */

export type ClaseRespuesta = "ok" | "gramatica" | "datos";

/** Lo que el club dibuja en el carril de una experiencia. */
export type TipoMarca = "pin" | "banda" | "desde" | "nunca" | "duda";

export interface MarcaSim {
  tipo: TipoMarca;
  /** 0 = nacimiento, 1 = hoy (16 años). Solo pin y desde. */
  pos: number;
}

export interface RespuestaSim {
  texto: string;
  clase: ClaseRespuesta;
  marca: MarcaSim;
  /** Lo que contesta la maestra, en inglés. */
  maestra: string;
  /** Por qué pasó eso, en español. */
  porque: string;
}

export interface PreguntaSim {
  id: string;
  /** Rótulo corto del carril. */
  carril: string;
  /** Clave de la imagen en /media/labs-sim/experiencias-recientes-ingles/ */
  foto: string;
  icono: string;
  /** El hecho del perfil que el alumno debe respetar (español). */
  hecho: string;
  /** Lo que pregunta la maestra, en inglés. */
  pregunta: string;
  respuestas: RespuestaSim[];
}

/** Edades del eje de la línea de tiempo. */
export const EDAD_MAX = 16;

export const PREGUNTAS: PreguntaSim[] = [
  {
    id: "chapulines",
    carril: "Chapulines",
    foto: "mercado-oaxaca",
    icono: "fa-bug",
    hecho: "Sí los has probado: fue en Oaxaca, cuando tenías 12 años.",
    pregunta: "Have you ever tried chapulines?",
    respuestas: [
      {
        texto: "Yes, I did. I tried them when I was twelve.",
        clase: "gramatica",
        marca: { tipo: "duda", pos: 0.5 },
        maestra: "Hmm, «Yes, I did»? I asked «Have you ever…». Let me write a question mark.",
        porque: "La pregunta abre en present perfect, así que la respuesta corta también: «Yes, I have». Contestar «did» mezcla los dos tiempos.",
      },
      {
        texto: "No, I haven't. I've never tried them.",
        clase: "datos",
        marca: { tipo: "banda", pos: 0 },
        maestra: "Oh, never? OK, I'll write that you've never tried them.",
        porque: "Bien armada, pero tu perfil dice que SÍ los probaste. La maestra anotó lo que dijiste, no lo que pasó.",
      },
      {
        texto: "Yes, I have. I tried them when I was twelve.",
        clase: "ok",
        marca: { tipo: "pin", pos: 12 / 16 },
        maestra: "Great! At twelve, noted. Which trip was that?",
        porque: "«Yes, I have» contesta la experiencia (present perfect); en cuanto das el cuándo («when I was twelve») el verbo salta a past simple: tried.",
      },
      {
        texto: "Yes, I have tried them when I was twelve.",
        clase: "gramatica",
        marca: { tipo: "duda", pos: 0.5 },
        maestra: "Sorry, «have tried… when I was twelve»? I can't place that.",
        porque: "Con una fecha o un «cuándo» ya no va present perfect: «I tried them when I was twelve».",
      },
    ],
  },
  {
    id: "cenote",
    carril: "Cenote",
    foto: "selva-cenote",
    icono: "fa-water",
    hecho: "Nunca has estado en un cenote.",
    pregunta: "Have you ever been to a cenote?",
    respuestas: [
      {
        texto: "No, I haven't. I've never been to a cenote.",
        clase: "ok",
        marca: { tipo: "nunca", pos: 0 },
        maestra: "Never? Then this summer is your chance.",
        porque: "Respuesta corta con el mismo auxiliar (haven't) y never entre el auxiliar y el participio: I've never been.",
      },
      {
        texto: "Yes, I have. I've been to a cenote.",
        clase: "datos",
        marca: { tipo: "banda", pos: 0 },
        maestra: "Wonderful, an experienced swimmer! I'll write it down.",
        porque: "Gramática perfecta, pero tu perfil dice que nunca has ido. El club anotó una experiencia que no existe.",
      },
      {
        texto: "No, I haven't. I have never went to a cenote.",
        clase: "gramatica",
        marca: { tipo: "duda", pos: 0.5 },
        maestra: "«Have never went»? I'm not sure what you mean.",
        porque: "Después de have va el participio: gone/been, no «went». I've never been.",
      },
      {
        texto: "No, I didn't. I never been to a cenote.",
        clase: "gramatica",
        marca: { tipo: "duda", pos: 0.5 },
        maestra: "«I never been»? Could you say it again?",
        porque: "Falta el auxiliar: «I've never been». Y la respuesta corta a «Have you ever…» es «No, I haven't».",
      },
    ],
  },
  {
    id: "monarcas",
    carril: "Monarcas",
    foto: "bosque-monarcas",
    icono: "fa-leaf",
    hecho: "Viste las mariposas monarca en Michoacán hace dos años.",
    pregunta: "When did you see the monarch butterflies?",
    respuestas: [
      {
        texto: "I have seen them two years ago in Michoacán.",
        clase: "gramatica",
        marca: { tipo: "duda", pos: 0.5 },
        maestra: "«Have seen… two years ago»? Hmm, I'll mark a question mark.",
        porque: "«two years ago» es una fecha: obliga a past simple. «I saw them two years ago».",
      },
      {
        texto: "I saw them last week in Michoacán.",
        clase: "datos",
        marca: { tipo: "pin", pos: 0.985 },
        maestra: "Last week? How lucky, I'll put the pin right next to today.",
        porque: "Past simple correcto, pero tu perfil dice «hace dos años». El alfiler quedó pegado al presente.",
      },
      {
        texto: "I seen them two years ago in Michoacán.",
        clase: "gramatica",
        marca: { tipo: "duda", pos: 0.5 },
        maestra: "I'm sorry, «I seen»? I didn't get it.",
        porque: "«seen» necesita have (I have seen) y, con fecha, ni siquiera: en past simple se dice saw.",
      },
      {
        texto: "I saw them two years ago in Michoacán.",
        clase: "ok",
        marca: { tipo: "pin", pos: 14 / 16 },
        maestra: "Perfect, two years ago. Was it cold up there?",
        porque: "La pregunta ya trae «When» y la respuesta trae «ago»: pasado terminado, past simple: saw.",
      },
    ],
  },
  {
    id: "ingles",
    carril: "Inglés",
    foto: "aula-ingles",
    icono: "fa-book-open",
    hecho: "Estudias inglés desde la primaria (a los 6 años): llevas 10 años.",
    pregunta: "How long have you studied English?",
    respuestas: [
      {
        texto: "I study English since primary school.",
        clase: "gramatica",
        marca: { tipo: "duda", pos: 0.5 },
        maestra: "«I study since»? I can't tell if you still study.",
        porque: "Lo que empezó antes y sigue hoy va en present perfect con since/for: «I have studied English since primary school».",
      },
      {
        texto: "I have studied English since last year.",
        clase: "datos",
        marca: { tipo: "desde", pos: 15 / 16 },
        maestra: "Since last year? So you're a beginner. I'll note it.",
        porque: "Bien armada, pero tu perfil dice desde la primaria. El club anotó que empezaste apenas el año pasado.",
      },
      {
        texto: "I have studied English since ten years.",
        clase: "gramatica",
        marca: { tipo: "duda", pos: 0.5 },
        maestra: "«Since ten years»? Hmm, could you rephrase that?",
        porque: "since pide un punto de inicio (since 2016); una duración se dice con for: for ten years.",
      },
      {
        texto: "I have studied English for ten years.",
        clase: "ok",
        marca: { tipo: "desde", pos: 6 / 16 },
        maestra: "Ten years! Since primary school, then. Impressive.",
        porque: "for + duración (ten years) con present perfect: empezó hace diez años y sigue hoy. «since primary school» también era válida.",
      },
    ],
  },
  {
    id: "puebla",
    carril: "Puebla",
    foto: "calle-puebla",
    icono: "fa-house",
    hecho: "Vives en Puebla desde hace tres años.",
    pregunta: "How long have you lived in Puebla?",
    respuestas: [
      {
        texto: "I have lived in Puebla since three years.",
        clase: "gramatica",
        marca: { tipo: "duda", pos: 0.5 },
        maestra: "«Since three years»? Sorry, I can't place that.",
        porque: "«three years» es una duración: va con for. «since» pide un momento (since 2023).",
      },
      {
        texto: "I live in Puebla for three years.",
        clase: "gramatica",
        marca: { tipo: "duda", pos: 0.5 },
        maestra: "«I live for three years»? Do you mean you're leaving?",
        porque: "for + duración con un hecho que sigue hoy pide present perfect: «I have lived in Puebla for three years».",
      },
      {
        texto: "I have lived in Puebla since I was five.",
        clase: "datos",
        marca: { tipo: "desde", pos: 5 / 16 },
        maestra: "Since you were five? A real poblano, then!",
        porque: "Gramática perfecta, pero tu perfil dice tres años, no once. El club te anotó como si hubieras llegado a los cinco.",
      },
      {
        texto: "I have lived in Puebla for three years.",
        clase: "ok",
        marca: { tipo: "desde", pos: 13 / 16 },
        maestra: "Three years, great. And do you like it?",
        porque: "for + tres años, present perfect: empezó hace tres años y sigue hoy. La franja arranca a los 13 y llega hasta el ahora.",
      },
    ],
  },
];

export interface ResumenSim {
  hechas: number;
  entendidas: number;
  exactas: number;
}

export function resumen(elegidas: Record<string, number | undefined>): ResumenSim {
  let hechas = 0;
  let entendidas = 0;
  let exactas = 0;
  for (const p of PREGUNTAS) {
    const i = elegidas[p.id];
    if (i === undefined) continue;
    const r = p.respuestas[i];
    if (!r) continue;
    hechas++;
    if (r.clase !== "gramatica") entendidas++;
    if (r.clase === "ok") exactas++;
  }
  return { hechas, entendidas, exactas };
}

/** 1★ por terminar la entrevista; 2★ con 4 respuestas exactas; 3★ con las 5. */
export function estrellasEntrevista(r: ResumenSim): number {
  if (r.hechas < PREGUNTAS.length) return 0;
  if (r.exactas >= PREGUNTAS.length) return 3;
  return r.exactas >= PREGUNTAS.length - 1 ? 2 : 1;
}
