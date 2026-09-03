/**
 * «Completa el texto» — figuras-retoricas
 *
 * VERBATIM de LC-III-P05-A6 (Completa el texto — Figuras retóricas), progresión LC-III-P05.
 * El párrafo, las pistas, las respuestas y las alternativas aceptadas son las
 * de esa actividad; aquí sólo se parte el texto por sus huecos. Generado por
 * scripts/generar-huecos-labs.ts — no editar a mano.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const FIGURAS_RETORICAS_HUECOS: TextoHuecosData = {
  ancla: "LC-III-P05-A6 · Completa el texto — Figuras retóricas",
  instrucciones: "Completa los huecos con la figura retórica correcta: metáfora, hipérbole, prosopopeya, ironía.",
  partes: [
    "Decir 'te lo repetí un millón de veces' es una ",
    " porque exagera el número de repeticiones. Atribuirle sentimientos al océano ('el mar llora') es una ",
    ". Cuando alguien dice '¡qué inteligente!' refiriéndose a alguien que cometió un error grave, usa la ",
    ". Llamar 'perla' a una persona por su valor y brillo es una ",
    ".",
  ],
  huecos: [
    { respuesta: "hipérbole", alternativas: [], pista: "Exageración extrema de una cualidad o cantidad." },
    { respuesta: "prosopopeya", alternativas: ["personificación"], pista: "Atribuir acciones o sentimientos humanos a algo que no es humano." },
    { respuesta: "ironía", alternativas: [], pista: "Decir lo contrario de lo que se piensa con intención crítica." },
    { respuesta: "metáfora", alternativas: [], pista: "Identificar implícitamente a una persona con otra cosa por semejanza, sin usar 'como'." },
  ],
};
