/**
 * «Completa el texto» — present-perfect-ingles
 *
 * VERBATIM de IN-V-P02-A2 (Fill in the blanks: present perfect and personal experiences), progresión IN-V-P02.
 * El párrafo, las pistas, las respuestas y las alternativas aceptadas son las
 * de esa actividad; aquí sólo se parte el texto por sus huecos. Generado por
 * scripts/generar-huecos-labs.ts — no editar a mano.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const PRESENT_PERFECT_INGLES_HUECOS: TextoHuecosData = {
  ancla: "IN-V-P02-A2 · Fill in the blanks: present perfect and personal experiences",
  instrucciones: "Complete the paragraph with the correct verb form. Use the present perfect (have/has + past participle) or past simple as appropriate.",
  partes: [
    "I ",
    " always been passionate about science. When I was in secondary school, I ",
    " my first chemistry experiment, and it was amazing. Since then, I ",
    " taken many science classes and I enjoy every one of them. Last year, I ",
    " in a science fair at my school and won second place. I have also ",
    " some online courses about programming. This semester, I am going to ",
    " a science project for the school community.",
  ],
  huecos: [
    { respuesta: "have", alternativas: ["'ve"], pista: "Present perfect: have/has + past participle. 'I ___ always been...' — usa la forma correcta de 'have' para 'I'" },
    { respuesta: "did", alternativas: ["completed","performed","carried out"], pista: "Past simple — evento específico en el pasado ('When I was...')" },
    { respuesta: "have", alternativas: ["'ve"], pista: "'Since then' → present perfect. 'I ___ taken' — ¿cuál es el auxiliar?" },
    { respuesta: "participated", alternativas: ["took part"], pista: "'Last year' → pasado simple. 'I ___ in a science fair'" },
    { respuesta: "taken", alternativas: ["completed","done"], pista: "'I have also ___' → participo pasado de 'take'" },
    { respuesta: "develop", alternativas: ["create","produce","make"], pista: "'Going to ___' → verbo base (infinitivo sin 'to')" },
  ],
};
