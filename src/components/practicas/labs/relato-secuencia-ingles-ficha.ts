/**
 * Ficha Teórica del laboratorio "Telling a story" (IN-III-P07, Inglés III:
 * relata eventos cotidianos y su secuencia).
 *
 * Marco teórico: lectura A1 «Telling a Story in the Past», VERBATIM (línea por
 * línea). Glosario: glosario interactivo A5, VERBATIM. Los conceptos centrales
 * resumen la lectura A1, la actividad A10 y las lecturas de Inglés IV
 * (IN-IV-P01 e IN-IV-P07) sobre past continuous con while/when.
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO, LECTURA_A1_LINEAS, FUENTE } from "./relato-secuencia-ingles-data";

export const RELATO_SECUENCIA_INGLES_FICHA: FichaTeoricaData = {
  ancla: "IN-III · P07 · A1 — Telling a Story in the Past",

  marcoTeorico: LECTURA_A1_LINEAS,

  objetivos: [
    "Ordenar los eventos de una anécdota cotidiana guiándote por los conectores y por la lógica causa → efecto.",
    "Usar el past simple de verbos regulares e irregulares frecuentes para narrar (woke, ran, saw, took, got).",
    "Elegir el conector que expresa la relación correcta: secuencia (first, then, after that, later), sorpresa (suddenly), causa (because), consecuencia (so) y cierre (finally, in the end).",
    "Relacionar dos acciones simultáneas con while + past continuous y con when + past simple.",
    "Escribir un relato breve con verbos en pasado y al menos cuatro conectores en un orden lógico.",
  ],

  materiales: [
    { nombre: "Teatrino de viñetas", detalle: "Seis escenas en 3D de la historia del camión perdido (A10) y cinco de la visita a la abuela (A1).", icono: "fa-film" },
    { nombre: "Línea del tiempo 3D", detalle: "Fichas de eventos que muestran secuencia, sorpresa, causa, consecuencia y acciones simultáneas.", icono: "fa-timeline" },
    { nombre: "Anécdota del perro suelto", detalle: "Cinco viñetas sin texto para escribir tu propia versión en inglés.", icono: "fa-dog" },
    { nombre: "Narración en voz alta", detalle: "Botón «Escuchar» con la voz en inglés del navegador (si está disponible).", icono: "fa-volume-high" },
  ],

  conceptos: [
    { termino: "Past simple para narrar", definicion: "Los eventos completos de una historia pasada van en past simple: regulares con -ed (walked, started) e irregulares con forma propia (went, saw, took, got)." },
    { termino: "Conectores de secuencia", definicion: "First abre la historia; then, after that y later la hacen avanzar; finally e in the end la cierran. Suddenly introduce un evento inesperado." },
    { termino: "Causa y consecuencia", definicion: "because introduce la causa: «I woke up late because my alarm didn't ring». so introduce la consecuencia: «My alarm didn't ring, so I woke up late». El hecho es el mismo; cambia qué parte presenta cada conector." },
    { termino: "Acciones simultáneas", definicion: "while + past continuous (was/were + -ing) presenta una acción en progreso; when + past simple, el evento breve que la interrumpe: «I was walking to school when it started to rain»." },
    { termino: "Orden de la oración y orden del tiempo", definicion: "No siempre coinciden: en «I watched a movie after I had dinner» se menciona primero la película, pero la cena ocurrió antes. El past perfect (had left) también marca algo anterior a otro pasado." },
    { termino: "Coherencia temporal", definicion: "Un relato es coherente cuando cada evento aparece después de lo que lo provoca: no puedes caminar a la escuela porque se fue el camión antes de llegar a la parada." },
  ],

  glosario: GLOSARIO.map((g) => ({ termino: g.termino, definicion: `${g.definicion} Ejemplo: ${g.ejemplo}` })),

  aplicaciones: [
    "Contar en inglés lo que hiciste el fin de semana, en clase o en una conversación con amigos.",
    "Escribir un correo o mensaje que explique por qué llegaste tarde o qué pasó en un viaje.",
    "Entender series, canciones y videos que narran anécdotas con then, suddenly, while y when.",
    "Preparar la reflexión escrita A3: un relato de 100 palabras con 6 verbos irregulares y 4 conectores.",
  ],

  fuente: FUENTE,
};
