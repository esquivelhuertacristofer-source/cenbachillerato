/**
 * Ficha teórica — preferencias-elecciones-ingles
 *
 * Contenido VERBATIM de la progresión IN-IV-P02 (Inglés IV).
 * El marco teórico sale de IN-IV-P02-A1 (lectura); los conceptos, del glosario
 * IN-IV-P02-A5; el glosario corto, de las definiciones que da la propia lectura.
 */
import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO, LECTURA_PARRAFOS, LECTURA_SABIAS } from "./preferencias-elecciones-ingles-data";

export const PREFERENCIAS_ELECCIONES_INGLES_FICHA: FichaTeoricaData = {
  ancla: "IN-IV-P02-A1 · Better, Best, or Different? Comparatives and Superlatives",
  marcoTeorico: LECTURA_PARRAFOS,
  objetivos: [
    "Expresa tu preferencia con «prefer X to Y» o «I'd rather + verbo base».",
    "Justifica cada preferencia con «because», «since» o «as» y una razón concreta y verdadera.",
    "Discrepa con respeto: reconoce la otra idea antes de dar la tuya («That sounds good, but...»).",
    "Aprueba el cuestionario de comprensión de la ficha.",
  ],
  materiales: [],
  conceptos: GLOSARIO.map((g) => ({ termino: g.termino, definicion: `${g.definicion} Ej.: «${g.ejemplo}»` })),
  glosario: [
    { termino: "Comparative", definicion: "Comparative adjectives are used to compare two things." },
    { termino: "Superlative", definicion: "Superlative adjectives are used to compare one thing with all others in a group." },
    { termino: "Irregular adjectives", definicion: "Some adjectives are irregular and must be memorized. 'Good' becomes 'better' in the comparative and 'the best' in the superlative." },
    { termino: "Double comparative", definicion: "Saying 'more faster' or 'more bigger'. Since 'faster' already is the comparative of 'fast', adding 'more' creates a redundant double comparison." },
    { termino: "Double superlative", definicion: "Saying 'the most best'. Since 'best' is already the superlative of 'good', 'the most' is unnecessary." },
  ],
  aplicaciones: [LECTURA_SABIAS],
  fuente: "CEN Bachillerato — UAC Inglés IV",
};
