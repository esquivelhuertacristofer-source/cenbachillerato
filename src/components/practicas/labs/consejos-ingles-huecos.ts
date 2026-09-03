/**
 * «Completa el texto» — consejos-ingles
 *
 * VERBATIM de IN-IV-P04-A6 (Fill in the blanks — Giving empathetic advice), progresión IN-IV-P04.
 * El párrafo, las pistas, las respuestas y las alternativas aceptadas son las
 * de esa actividad; aquí sólo se parte el texto por sus huecos. Generado por
 * scripts/generar-huecos-labs.ts — no editar a mano.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const CONSEJOS_INGLES_HUECOS: TextoHuecosData = {
  ancla: "IN-IV-P04-A6 · Fill in the blanks — Giving empathetic advice",
  instrucciones: "Completa los huecos con la estructura de consejo o empatía más adecuada según el contexto.",
  partes: [
    "— I'm really stressed about my exams. What do you think I ",
    " do? — That ",
    " be tough. You should make a study plan. Have you ",
    " about studying with a group? — If I ",
    " you, I'd also try to sleep at least 8 hours.",
  ],
  huecos: [
    { respuesta: "should", alternativas: [], pista: "Pedir consejo: What do you think I ___ do?" },
    { respuesta: "must", alternativas: [], pista: "Expresión de empatía: That ___ be tough (debe ser difícil)." },
    { respuesta: "thought", alternativas: [], pista: "Have you ___ about + verb-ing? (pensado en...)" },
    { respuesta: "were", alternativas: [], pista: "If I ___ you, I would... (condicional II: were, no was)." },
  ],
};
