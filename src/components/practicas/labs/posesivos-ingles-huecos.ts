/**
 * «Completa el texto» — posesivos-ingles
 *
 * VERBATIM de IN-I-P08-A2 (Whose is it?), progresión IN-I-P08.
 * El párrafo, las pistas, las respuestas y las alternativas aceptadas son las
 * de esa actividad; aquí sólo se parte el texto por sus huecos. Generado por
 * scripts/generar-huecos-labs.ts — no editar a mano.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const POSESIVOS_INGLES_HUECOS: TextoHuecosData = {
  ancla: "IN-I-P08-A2 · Whose is it?",
  instrucciones: "Completa las oraciones con el pronombre posesivo o genitivo correcto: my / her / his / their / whose / mine / 's / our",
  partes: [
    "This is ",
    " book — it belongs to me. That is Ana",
    "  pencil. It is ",
    ". Carlos left ",
    " backpack in class. The students forgot ",
    " homework. ",
    " notebook is this? ",
    " teacher is very funny. This pen is not yours, it is ",
    ".",
  ],
  huecos: [
    { respuesta: "my", alternativas: [], pista: "___ book = mi libro" },
    { respuesta: "'s", alternativas: [], pista: "Ana___ pencil (genitivo)" },
    { respuesta: "hers", alternativas: [], pista: "It is ___ = Es de ella (posesivo solo)" },
    { respuesta: "his", alternativas: [], pista: "Carlos left ___ backpack = su (de él)" },
    { respuesta: "their", alternativas: [], pista: "The students forgot ___ homework" },
    { respuesta: "Whose", alternativas: ["whose"], pista: "___ notebook is this? = ¿De quién...?" },
    { respuesta: "Our", alternativas: ["our"], pista: "___ teacher = nuestro/a maestro/a" },
    { respuesta: "mine", alternativas: [], pista: "it is ___ = es mío/mía" },
  ],
};
