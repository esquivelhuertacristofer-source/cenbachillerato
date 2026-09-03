/**
 * «Completa el texto» — hardware-software
 *
 * VERBATIM de CD-I-P01-A6 (Completa: componentes e historia), progresión CD-I-P01.
 * El párrafo, las pistas, las respuestas y las alternativas aceptadas son las
 * de esa actividad; aquí sólo se parte el texto por sus huecos. Generado por
 * scripts/generar-huecos-labs.ts — no editar a mano.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const HARDWARE_SOFTWARE_HUECOS: TextoHuecosData = {
  ancla: "CD-I-P01-A6 · Completa: componentes e historia",
  instrucciones: "Completa con la palabra correcta.",
  partes: [
    "Las partes físicas de un dispositivo se llaman ",
    "; los programas e instrucciones son el ",
    ". El ",
    " libre permite usar, estudiar y compartir los programas. La licencia que protege esas libertades se conoce como ",
    ".",
  ],
  huecos: [
    { respuesta: "hardware", alternativas: [], pista: "Lo físico." },
    { respuesta: "software", alternativas: [], pista: "Lo lógico, los programas." },
    { respuesta: "software", alternativas: [], pista: "Repite el término de la parte lógica." },
    { respuesta: "GPL", alternativas: ["General Public License"], pista: "General Public License." },
  ],
};
