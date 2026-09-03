/**
 * «Completa el texto» — licencias-software
 *
 * VERBATIM de CD-I-P02-A6 (Completa: licencias y acceso), progresión CD-I-P02.
 * El párrafo, las pistas, las respuestas y las alternativas aceptadas son las
 * de esa actividad; aquí sólo se parte el texto por sus huecos. Generado por
 * scripts/generar-huecos-labs.ts — no editar a mano.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const LICENCIAS_SOFTWARE_HUECOS: TextoHuecosData = {
  ancla: "CD-I-P02-A6 · Completa: licencias y acceso",
  instrucciones: "Completa con la palabra correcta.",
  partes: [
    "Una licencia ",
    " restringe copiar y modificar el programa, mientras que una licencia libre lo permite. Para acceder a internet usamos un ",
    ". El software base que administra el dispositivo es el ",
    ". El almacenamiento se mide en unidades como el ",
    ".",
  ],
  huecos: [
    { respuesta: "privativa", alternativas: ["propietaria"], pista: "De pago, restringe libertades." },
    { respuesta: "navegador", alternativas: [], pista: "Firefox, Chrome..." },
    { respuesta: "sistema operativo", alternativas: [], pista: "Windows, Android, Linux." },
    { respuesta: "gigabyte", alternativas: ["GB","byte","megabyte"], pista: "GB." },
  ],
};
