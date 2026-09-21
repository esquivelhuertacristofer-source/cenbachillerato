/**
 * Ficha teórica — instrucciones-ingles (IN-III-P06, Inglés III).
 *
 * El marco teórico es VERBATIM de la lectura IN-III-P06-A1 «How to Give
 * Instructions in English» y de su recuadro; el glosario es verbatim de
 * IN-III-P06-A5. Los conceptos centrales son los del laboratorio: los cuatro
 * de la lectura más los tres que el laboratorio añade (instrucción precisa,
 * instrucción ambigua y pregunta indirecta), porque el propósito de la
 * progresión pide también PEDIR instrucciones.
 */
import type { FichaTeoricaData } from "./_ficha";
import { LECTURA_A1, RECUADRO_A1, GLOSARIO_A5, TAREA_A5 } from "./instrucciones-ingles-data";

export const INSTRUCCIONES_INGLES_FICHA: FichaTeoricaData = {
  ancla: "IN-III-P06-A1 · How to Give Instructions in English",
  marcoTeorico: [
    ...LECTURA_A1,
    `DID YOU KNOW? ${RECUADRO_A1}`,
    "ASKING FOR INSTRUCTIONS — LA PREGUNTA INDIRECTA (ampliación del laboratorio):",
    "Para pedir que te orienten con cortesía se usa una fórmula de apertura y, después de ella, el orden de una oración normal (sujeto + verbo), NO el de la pregunta directa:\n• Where is the library? → Could you tell me where the library is?\n• How can I get to the bus station? → Do you know how I can get to the bus station?\n• Where does the bus stop? → Could you tell me where the bus stops? (sin «does», y el verbo recupera su «-s»)\n• How do I turn on the projector? → Could you tell me how to turn on the projector?\n• Is there a pharmacy near here? → Do you know if there is a pharmacy near here? (las preguntas de sí/no se introducen con «if» o «whether»)",
    "PRECISA O AMBIGUA: una instrucción no es correcta porque se entienda, sino porque no admite otra lectura. Antes de darla, comprueba que contesta a: How much? (cuánto), Which one? (cuál), Where exactly? (dónde), How long? (cuánto tiempo), In what order? (en qué orden) y With what? (con qué). «Add some salt» se entiende; «Add half a teaspoon of salt» se puede obedecer.",
  ],
  objetivos: [
    "Da instrucciones que solo admitan una lectura en el modo «Da la instrucción».",
    "Distingue la instrucción precisa de la ambigua y di qué dato le falta.",
    "Repara dos procedimientos en los que los conectores están en orden y los pasos no.",
    "Arma seis preguntas indirectas para pedir que te orienten.",
    "Completa el texto de la receta (A2) y aprueba el quiz de imperativos y conectores (A3).",
  ],
  materiales: [
    { nombre: "Pantalla de la plataforma escolar", detalle: "Diez elementos que obedecen tu instrucción al pie de la letra.", icono: "fa-laptop" },
    { nombre: "Fichas de inglés", detalle: "Verbo, objeto y detalle para armar la instrucción.", icono: "fa-shapes" },
    { nombre: "Dos procedimientos desordenados", detalle: "Agua de jamaica y la entrega de una tarea.", icono: "fa-list-ol" },
    { nombre: "Botón «Escuchar»", detalle: "Pronunciación en inglés estadounidense.", icono: "fa-volume-high" },
  ],
  conceptos: [
    { termino: "Imperative", definicion: "Verbo base sin sujeto para dar una instrucción: Open the document. Click on the menu. El «you» se sobreentiende." },
    { termino: "Negative imperative", definicion: "Don't / Do not / Never + verbo base, para prohibir o advertir: Never share your password." },
    { termino: "Sequence connectors", definicion: "First, Then, Next, After that, Finally: colocan cada paso en su lugar dentro de la secuencia." },
    { termino: "Precise instruction", definicion: "La que señala una sola cosa: dice cuánto, cuál, dónde, cuánto tiempo y con qué. Se puede obedecer sin preguntar." },
    { termino: "Ambiguous instruction", definicion: "La que se entiende pero admite otra lectura («Press the button» con tres botones en pantalla). Quien obedece elige por ti." },
    { termino: "Indirect question", definicion: "Pregunta cortés para pedir que te orienten: Could you tell me where the library is? Después de la apertura, el orden es sujeto + verbo." },
    { termino: "Make sure to", definicion: "Fórmula para subrayar un paso crítico: Make sure to stir the mixture slowly so it does not burn." },
  ],
  glosario: GLOSARIO_A5.map((g) => ({ termino: g.termino, definicion: `${g.definicion} Ej.: ${g.ejemplo}` })),
  aplicaciones: [
    RECUADRO_A1,
    `Tarea final del glosario (A5): ${TAREA_A5}`,
    "Escribir instrucciones en inglés es la tarea real de quien redacta manuales, recetas, guías de usuario o protocolos de laboratorio. En todos esos oficios la imprecisión se paga igual que aquí: quien lee hace otra cosa.",
  ],
  fuente: "CEN Bachillerato — UAC Inglés III",
};
