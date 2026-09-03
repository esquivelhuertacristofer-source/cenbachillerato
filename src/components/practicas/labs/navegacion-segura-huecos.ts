/**
 * «Completa el texto» — navegacion-segura
 *
 * VERBATIM de CD-I-P06-A6 (Completa: seguridad y normatividad), progresión CD-I-P06.
 * El párrafo, las pistas, las respuestas y las alternativas aceptadas son las
 * de esa actividad; aquí sólo se parte el texto por sus huecos. Generado por
 * scripts/generar-huecos-labs.ts — no editar a mano.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const NAVEGACION_SEGURA_HUECOS: TextoHuecosData = {
  ancla: "CD-I-P06-A6 · Completa: seguridad y normatividad",
  instrucciones: "Completa con la palabra correcta.",
  partes: [
    "El ",
    " es un engaño que suplanta a una entidad de confianza para robar tus datos. La información falsa que se difunde es ",
    ". Para protegerte conviene usar contraseñas ",
    " y cuidar la ",
    " de tus datos personales.",
  ],
  huecos: [
    { respuesta: "phishing", alternativas: [], pista: "Suplantación para robar datos." },
    { respuesta: "desinformación", alternativas: ["desinformacion"], pista: "Noticias falsas." },
    { respuesta: "robustas", alternativas: ["seguras","fuertes"], pista: "Difíciles de adivinar." },
    { respuesta: "protección", alternativas: ["proteccion","privacidad"], pista: "Resguardo de la información." },
  ],
};
