/**
 * «Completa el texto» — deteccion-fake-news
 *
 * VERBATIM de CD-II-P03-A6 (Completa: investigación digital), progresión CD-II-P03.
 * El párrafo, las pistas, las respuestas y las alternativas aceptadas son las
 * de esa actividad; aquí sólo se parte el texto por sus huecos. Generado por
 * scripts/generar-huecos-labs.ts — no editar a mano.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const DETECCION_FAKE_NEWS_HUECOS: TextoHuecosData = {
  ancla: "CD-II-P03-A6 · Completa: investigación digital",
  instrucciones: "Completa con la palabra correcta.",
  partes: [
    "La ",
    " estudia las prácticas de las personas en entornos digitales. Para recoger opiniones de un grupo pequeño se usa el grupo ",
    ". El proceso de investigación implica buscar, recopilar, extraer, organizar y ",
    " la información. Las licencias ",
    " permiten usar y compartir el material, como en LibreOffice.",
  ],
  huecos: [
    { respuesta: "ciberetnografía", alternativas: ["ciberetnografia"], pista: "Etnografía en lo digital." },
    { respuesta: "focal", alternativas: [], pista: "Grupo ___." },
    { respuesta: "difundir", alternativas: ["compartir"], pista: "Dar a conocer." },
    { respuesta: "permisivas", alternativas: ["libres"], pista: "Permiten usar y compartir." },
  ],
};
