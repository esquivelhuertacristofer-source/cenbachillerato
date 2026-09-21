/**
 * Datos de la Ficha Teórica del laboratorio "Archivo de fuentes históricas"
 * (CH-III-P02, progresión 2 de Conciencia Histórica III).
 *
 * Contenido VERBATIM:
 *   - Marco teórico: textos de las actividades de la progresión (glosario A5 y
 *     quiz A2) y de CH-III-P03-A1 (lectura) y CH-III-P04-A1 (infografía). La
 *     progresión 2 no tiene lectura: su A1 es un video.
 *   - Glosario: glosario interactivo A5 (6 términos).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO, LECTURA, FUENTE, PROGRESION } from "./archivo-fuentes-data";

export const ARCHIVO_FUENTES_FICHA: FichaTeoricaData = {
  ancla: "CH-III · P02 — Examina de manera crítica las evidencias y evalúa su validez",

  marcoTeorico: [`Progresión 2: «${PROGRESION}»`, ...LECTURA.map((p) => `${p.texto} (${p.fuente})`)],

  objetivos: [
    "Establecer la procedencia de un documento: autor, fecha y lugar, destinatario y cercanía al hecho, con base en lo que el propio documento muestra.",
    "Reconocer la intencionalidad de una fuente y cómo condiciona lo que dice.",
    "Corroborar una afirmación con fuentes independientes y de tipos distintos, y suspender el juicio cuando la evidencia no alcanza.",
    "Detectar un anacronismo que delata una fuente falsa o mal fechada.",
    "Usar con ética una imagen histórica: contexto, fecha, crédito y sin recortes engañosos.",
    "Construir una interpretación argumentada con evidencias de peso y reconocer sus matices.",
  ],

  materiales: [
    { nombre: "Mesa de archivo con lámpara y lupa", detalle: "Para examinar membrete, fecha, destinatario, cuerpo, firma y reverso.", icono: "fa-magnifying-glass" },
    { nombre: "Expediente de siete fuentes", detalle: "Carta, diario, boletín, telegrama, fotografía, testimonio oral y una carta falsa (ilustrativos).", icono: "fa-folder-open" },
    { nombre: "Tablero de corcho con hilos", detalle: "Verde si la fuente corrobora la afirmación; rojo si la contradice.", icono: "fa-diagram-project" },
    { nombre: "Publicación viral y foto original", detalle: "Una imagen de 1938 recortada y mal fechada en una red social (ficticia).", icono: "fa-mobile-screen" },
    { nombre: "Balanza de la evidencia", detalle: "Cada fuente pesa según su confiabilidad para la pregunta.", icono: "fa-scale-balanced" },
  ],

  conceptos: [
    { termino: "Procedencia", definicion: "Quién produjo la fuente, cuándo, dónde y desde qué posición; incluye su cercanía al hecho y cómo llegó al archivo." },
    { termino: "Intencionalidad", definicion: "Para quién y para qué se hizo la fuente: informar en privado, celebrar, denunciar, convencer. Condiciona qué dice y qué calla." },
    { termino: "Contexto", definicion: "Las circunstancias de la época en que se produjo la fuente; permiten entenderla y detectar lo que es imposible para su fecha." },
    { termino: "Anacronismo en una fuente", definicion: "Un objeto, palabra o institución que no existía en la fecha que dice el documento; indica falsificación o una fecha equivocada." },
    { termino: "Confiabilidad relativa a la pregunta", definicion: "Una fuente no es confiable o inútil en abstracto: puede ser excelente para una pregunta y débil para otra." },
    { termino: "Uso ético de la información", definicion: "Citar las fuentes, dar contexto, distinguir hechos de interpretaciones, no alterar evidencias ni atribuir a las personas lo que no hicieron." },
  ],

  glosario: GLOSARIO.map((g) => ({ termino: g.termino, definicion: g.definicion })),

  aplicaciones: [
    "Verificar una foto histórica que circula en redes antes de compartirla: buscar su fecha, su lugar y el archivo que la conserva.",
    "Consultar periódicos de la época en la Hemeroteca Nacional Digital de México para contrastar cómo se contó un hecho.",
    "Leer un comunicado de una empresa o de un gobierno preguntando para quién y para qué se escribió.",
    "Al hacer una investigación escolar, citar cada fuente y señalar cuándo la evidencia no alcanza para concluir.",
  ],

  fuente: `${FUENTE} El caso (expropiación petrolera de 1938) es histórico; los documentos del expediente son ilustrativos.`,
};
