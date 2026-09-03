/**
 * «Completa el texto» — falacias-logica
 *
 * VERBATIM de PFH-III-P01-A6 (Completa los huecos — Razonamiento lógico), progresión PFH-III-P01.
 * El párrafo, las pistas, las respuestas y las alternativas aceptadas son las
 * de esa actividad; aquí sólo se parte el texto por sus huecos. Generado por
 * scripts/generar-huecos-labs.ts — no editar a mano.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const FALACIAS_LOGICA_HUECOS: TextoHuecosData = {
  ancla: "PFH-III-P01-A6 · Completa los huecos — Razonamiento lógico",
  instrucciones: "Lee el párrafo y escribe en cada hueco el concepto lógico que corresponde. Usa los términos del glosario de la progresión.",
  partes: [
    "Cuando Aristóteles construyó su ",
    " categórico, combinó una premisa mayor con una menor para derivar una conclusión necesaria. Este método de razonamiento se llama ",
    ". En cambio, cuando un científico observa muchos casos particulares para llegar a una ley general, utiliza el razonamiento ",
    ". Si alguien refuta a su oponente atacando su carácter en lugar de su argumento, comete una falacia ",
    ".",
  ],
  huecos: [
    { respuesta: "silogismo", alternativas: [], pista: "Forma de argumento aristotélico de tres partes: premisa mayor, premisa menor y conclusión." },
    { respuesta: "deducción", alternativas: ["razonamiento deductivo"], pista: "Tipo de razonamiento que parte de lo general hacia lo particular con necesidad lógica." },
    { respuesta: "inductivo", alternativas: ["inducción"], pista: "Razonamiento que generaliza a partir de casos observados; sus conclusiones son probables." },
    { respuesta: "ad hominem", alternativas: [], pista: "Locución latina que significa 'contra la persona'; es una falacia informal muy común." },
  ],
};
