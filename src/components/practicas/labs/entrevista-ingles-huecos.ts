/**
 * «Complete the text» — entrevista-ingles
 *
 * VERBATIM del `fill_blanks` IN-V-P07-A6 «Fill in the Blanks — Participating
 * in an Oral Presentation». El párrafo, las pistas, las respuestas y las
 * alternativas aceptadas son las de la actividad; aquí sólo se parte el texto
 * por sus huecos («___»).
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

const TEXTO_A6 =
  "Good morning. ___ I am going to present my research on the impact of technology in healthcare. ___ on to the first point: technology has improved diagnostic accuracy significantly. As I ___ earlier, early diagnosis saves lives. ___ conclusion, investing in medical technology is essential for a healthier future.";

export const ENTREVISTA_INGLES_HUECOS: TextoHuecosData = {
  ancla: "IN-V-P07-A6 · Fill in the Blanks — Participating in an Oral Presentation",
  instrucciones: "Complete the presentation script with the correct word or phrase.",
  partes: TEXTO_A6.split("___"),
  huecos: [
    { respuesta: "Today", alternativas: [], pista: "'Good morning. ___ I am going to present...' — which time word introduces what you are doing now or at this moment?" },
    { respuesta: "Moving", alternativas: ["Turning"], pista: "'___ on to the first point...' — this is a transition phrase. What verb starts it?" },
    { respuesta: "mentioned", alternativas: ["said"], pista: "'As I ___ earlier, early diagnosis saves lives.' — what past tense verb refers back to something already said?" },
    { respuesta: "In", alternativas: [], pista: "'___ conclusion, investing in medical technology is essential...' — which preposition completes this closing phrase?" },
  ],
};
