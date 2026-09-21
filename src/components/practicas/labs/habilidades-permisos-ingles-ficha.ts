/**
 * Datos de la Ficha Teórica del laboratorio "Can you…? May I…? El centro
 * comunitario" (IN-II-P03, progresión 3 de Inglés II).
 *
 * Contenido VERBATIM de las actividades ancla:
 *   - Marco teórico: lectura A1 «Can and Can't: Abilities and Permissions».
 *   - Glosario: glosario interactivo A5 (6 términos).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO, LECTURA_A1, FUENTE, TITULO_A1, NAHUATL_DATO } from "./habilidades-permisos-ingles-data";

export const HABILIDADES_PERMISOS_INGLES_FICHA: FichaTeoricaData = {
  ancla: `IN-II · P03 · A1 — ${TITULO_A1}`,

  // Los ejemplos van en renglones propios (la ficha no respeta saltos de línea).
  marcoTeorico: LECTURA_A1.flatMap((p) => p.split("\n")),

  objetivos: [
    "Distinguir los dos usos de can: habilidad (I can swim) y permiso (Can I use your phone?).",
    "Preguntar por habilidades con Can + sujeto + verbo base y contestar con respuestas cortas (Yes, I can. / No, I can't.).",
    "Escribir oraciones en 3.ª persona sin -s ni to después de can (She can cook).",
    "Pedir permiso con Can I…? o May I…? y ajustar la cortesía a la persona: adulto o amigo.",
    "Entender una respuesta de permiso (Sure, go ahead / Sorry, you can't…) y lo que te proponen hacer.",
    "Leer letreros en inglés (No food allowed, Visitors can use the Wi-Fi) y expresar la regla con can o can't.",
  ],

  materiales: [
    { nombre: "Centro Comunitario Los Fresnos (3D)", detalle: "Biblioteca, laboratorio de cómputo, salón de música, cocina, cancha de básquetbol y alberca, cada uno con su letrero en inglés.", icono: "fa-building" },
    { nombre: "Seis candidatos para los clubes", detalle: "Jóvenes con distintas habilidades que responden tus preguntas y lo intentan frente a ti.", icono: "fa-people-group" },
    { nombre: "Carteles de tres clubes", detalle: "Cada club pide personas que puedan hacer algo (swim, cook, speak Nahuatl…).", icono: "fa-clipboard-list" },
    { nombre: "Fichas de palabras", detalle: "May, Can, I, verbos y complementos para armar peticiones de permiso.", icono: "fa-puzzle-piece" },
    { nombre: "Medidor de cortesía", detalle: "Muestra si tu petición suena formal, cortés o neutral.", icono: "fa-gauge" },
    { nombre: "Reloj de la alberca", detalle: "Para decidir si a esa hora la alberca está abierta (4:00–6:00 p.m.).", icono: "fa-clock" },
  ],

  conceptos: [
    {
      termino: "Can para habilidad",
      definicion: "Lo que sabemos hacer: I can swim. She can play the guitar. La negativa expresa que no se sabe: They can't cook.",
    },
    {
      termino: "Can para permiso",
      definicion: "Lo que está permitido: Can I use your phone? You can leave class early today. You can't park here.",
    },
    {
      termino: "Can no cambia",
      definicion: "Es igual con todos los sujetos (I can, she can, they can) y va seguido del verbo en forma base: she can sing, nunca «she cans sing», «she can sings» ni «she can to sing».",
    },
    {
      termino: "Preguntas y respuestas cortas",
      definicion: "Can + sujeto + verbo base: Can you cook? — Yes, I can. / No, I can't. No se usa do: nunca «Do you can…?».",
    },
    {
      termino: "Negativa",
      definicion: "can't = cannot. «Can not», separado, se entiende, pero es mucho menos común.",
    },
    {
      termino: "Cortesía al pedir permiso",
      definicion: "Can I…? es cortés y es lo natural entre amigos. Con please (Can I…, please?) suena más amable, y May I…? es la forma más formal, ideal con un maestro, una bibliotecaria o una entrenadora.",
    },
    {
      termino: "Responder a un permiso",
      definicion: "Para darlo: Sure, go ahead. / Yes, you can. / Here you go. Para negarlo con amabilidad: Sorry, you can't… y, si se puede, una alternativa: You can eat in the kitchen.",
    },
    {
      termino: "Letreros",
      definicion: "No + sustantivo o -ing prohíbe: No food allowed, No bikes, No running (= you can't…). Un letrero con can da permiso: Visitors can use the Wi-Fi.",
    },
    {
      termino: "Play, speak y el artículo the",
      definicion: "Con deportes no se usa the (play basketball); con instrumentos, normalmente sí (play the guitar); con idiomas, no (speak English, speak Nahuatl).",
    },
  ],

  glosario: GLOSARIO.map((g) => ({ termino: g.termino, definicion: `${g.definicion} Ejemplo: ${g.ejemplo}` })),

  aplicaciones: [
    "Presentarte en un club, un equipo o una entrevista de trabajo diciendo lo que sabes hacer: I can speak Spanish and English.",
    "Pedir permiso con cortesía en la escuela o en un viaje: May I use the bathroom, please?",
    "Entender letreros y reglas en lugares públicos, museos o aeropuertos: No food or drinks.",
    NAHUATL_DATO,
  ],

  fuente: FUENTE,
};
