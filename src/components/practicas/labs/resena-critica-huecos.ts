/**
 * «Completa el texto» — resena-critica
 *
 * VERBATIM de LC-III-P06-A2 (Completa la estructura de una reseña crítica), progresión LC-III-P06.
 * El párrafo, las pistas, las respuestas y las alternativas aceptadas son las
 * de esa actividad; aquí sólo se parte el texto por sus huecos. Generado por
 * scripts/generar-huecos-labs.ts — no editar a mano.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const RESENA_CRITICA_HUECOS: TextoHuecosData = {
  ancla: "LC-III-P06-A2 · Completa la estructura de una reseña crítica",
  instrucciones: "Lee el texto con atención y completa cada espacio en blanco (___)  con la palabra o frase más adecuada. Puedes releer el texto cuantas veces necesites.",
  partes: [
    "La reseña crítica combina ",
    ", análisis y ",
    " fundamentado sobre una obra. La ",
    " presenta la obra reseñada y su contexto. El ",
    " incluye la síntesis del contenido y el análisis de elementos formales. La conclusión ofrece la ",
    " final y una recomendación al lector potencial.",
  ],
  huecos: [
    { respuesta: "descripción", alternativas: ["síntesis","presentación","descripcion"], pista: "Primer componente: presentar qué hay en la obra" },
    { respuesta: "juicio", alternativas: ["valoración","opinión argumentada","evaluación"], pista: "Componente que evalúa con argumentos" },
    { respuesta: "introducción", alternativas: ["introduccion","apertura","inicio"], pista: "Primera sección estructural de la reseña" },
    { respuesta: "desarrollo", alternativas: ["cuerpo","cuerpo del texto"], pista: "Sección central donde se analiza la obra" },
    { respuesta: "valoración", alternativas: ["evaluación","juicio","opinion","opinión"], pista: "Lo que expresa el reseñador al final sobre la obra" },
  ],
};
