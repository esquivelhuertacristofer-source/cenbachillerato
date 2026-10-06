/**
 * «Complete the text» — preferencias-elecciones-ingles
 *
 * VERBATIM de IN-IV-P02-A6 (Fill in the blanks — Comparing personal choices),
 * progresión IN-IV-P02. El diálogo, las pistas, las respuestas y las
 * alternativas aceptadas son las de esa actividad; aquí sólo se parte el texto
 * por sus huecos.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const PREFERENCIAS_ELECCIONES_INGLES_HUECOS: TextoHuecosData = {
  ancla: "IN-IV-P02-A6 · Fill in the blanks — Comparing personal choices",
  instrucciones: "Completa los huecos con la expresión o estructura de preferencia correcta.",
  partes: [
    "— What do you ",
    ", hiking or swimming? — Personally, I ",
    " hiking to swimming because it's more relaxing. — That sounds great, but I'd ",
    " swim since the weather is so hot. — Fair enough! In my ",
    ", both are great ways to stay active.",
  ],
  huecos: [
    { respuesta: "prefer", alternativas: ["like"], pista: "Pregunta estándar: What do you ___, X or Y?" },
    { respuesta: "prefer", alternativas: [], pista: "I ___ X to Y — estructura de preferencia formal." },
    { respuesta: "rather", alternativas: ["prefer to"], pista: "I'd ___ + verbo base (sin 'to')." },
    { respuesta: "opinion", alternativas: ["view"], pista: "Expresión para introducir lo que piensas: In my ___ (sustantivo)." },
  ],
};
