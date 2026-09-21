/**
 * Datos de la Ficha Teórica del laboratorio "Daily routines: el día de Ana"
 * (IN-II-P01, progresión 1 de Inglés II).
 *
 * Contenido VERBATIM de las actividades ancla:
 *   - Marco teórico: lectura A1 «Daily Routines Around the World».
 *   - Glosario: glosario interactivo A5 (6 términos).
 *   - Escala y posición de los adverbios de frecuencia: lectura IN-III-P04-A1.
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO, LECTURA_A1, FUENTE, TITULO_A1 } from "./rutina-diaria-ingles-data";

export const RUTINA_DIARIA_INGLES_FICHA: FichaTeoricaData = {
  ancla: `IN-II · P01 · A1 — ${TITULO_A1}`,

  marcoTeorico: LECTURA_A1,

  objetivos: [
    "Ordenar las acciones de un día típico y describirlas en Present Simple.",
    "Usar la -s de la 3.ª persona (she wakes up) y sus reglas de ortografía (watches, goes, does, has).",
    "Distinguir cuándo el verbo NO lleva -s: con I / you / we / they.",
    "Preguntar la hora de una rutina con What time do / does…? y responder con at + hora.",
    "Leer y decir la hora en inglés con past, to, a quarter, half y o'clock.",
    "Contar qué tan seguido ocurre algo y elegir el adverbio de frecuencia adecuado.",
    "Colocar el adverbio de frecuencia antes del verbo principal y después de be.",
  ],

  materiales: [
    { nombre: "Maqueta del barrio de Ana", detalle: "Casa en corte, parada del camión y escuela, con un sol que recorre el cielo de las 6:00 a las 22:00.", icono: "fa-house-chimney" },
    { nombre: "Línea de tiempo del día", detalle: "Nueve casillas donde colocas las acciones de la rutina en orden.", icono: "fa-timeline" },
    { nombre: "Reloj de manecillas", detalle: "Con la mitad «past» y la mitad «to» marcadas; se pone arrastrando la manecilla o con los botones.", icono: "fa-clock" },
    { nombre: "Calendario semanal", detalle: "Siete hábitos de Ana marcados de lunes a domingo y una escala de frecuencia de 0 % a 100 %.", icono: "fa-calendar-week" },
    { nombre: "Fichas de palabras", detalle: "Sujeto, verbo, complemento y seis adverbios para armar oraciones.", icono: "fa-puzzle-piece" },
  ],

  conceptos: [
    {
      termino: "Present Simple para rutinas",
      definicion: "Se usa para lo que hacemos habitualmente: I wake up at 6:30. She takes the bus to school. Lo que pasa en este momento va en Present Continuous: I am studying right now.",
    },
    {
      termino: "La -s de la 3.ª persona",
      definicion: "Con he / she / it el verbo agrega -s (wakes, eats). Los verbos en -ch, -sh, -ss, -x y -o agregan -es (watches, finishes, goes, does); consonante + y cambia a -ies (studies); have es irregular: has.",
    },
    {
      termino: "Preguntas con do / does",
      definicion: "What time does she get up? — does con he / she / it y do con I / you / we / they. El verbo principal vuelve a su forma base: does she get up (no «gets»).",
    },
    {
      termino: "Decir la hora",
      definicion: "o'clock = en punto; a quarter past = y cuarto; half past = y media; a quarter to = cuarto para. Hasta la media se usa past con la hora actual; después, to con la hora siguiente: 7:45 = a quarter to eight. También se dice en forma digital: seven forty-five.",
    },
    {
      termino: "Partes del día",
      definicion: "in the morning (mañana), in the afternoon (después del mediodía), in the evening (al anochecer) y at night (noche). Con horas se usa at: at 7:15, at half past six.",
    },
    {
      termino: "Escala de frecuencia (IN-III-P04-A1)",
      definicion: "always (siempre) — 100% · usually/normally (normalmente) — 80% · often/frequently (frecuentemente) — 70% · sometimes (a veces) — 50% · rarely/seldom (rara vez) — 20% · never (nunca) — 0%",
    },
    {
      termino: "Posición del adverbio (IN-III-P04-A1)",
      definicion: "Position: frequency adverbs go BEFORE the main verb but AFTER 'be': She always drinks tea in the morning. (before main verb) · He is usually late for class. (after 'be')",
    },
  ],

  glosario: GLOSARIO.map((g) => ({ termino: g.termino, definicion: `${g.definicion} Ejemplo: ${g.ejemplo}` })),

  aplicaciones: [
    "Contarle a un compañero de intercambio cómo es un día de escuela en México.",
    "Llenar un formulario o escribir un correo en inglés sobre tus horarios.",
    "Preguntar y entender horarios: What time does the bus leave? It leaves at a quarter past seven.",
    "Hablar de tus hábitos de salud y estudio: I usually sleep eight hours. I never skip breakfast.",
  ],

  fuente: FUENTE,
};
