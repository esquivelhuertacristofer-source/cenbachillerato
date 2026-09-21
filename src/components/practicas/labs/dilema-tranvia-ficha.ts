/**
 * Datos de la Ficha Teórica del laboratorio "Dilemas éticos" (PFH-II-P02,
 * progresión 2 de Pensamiento Filosófico y Humanidades II).
 *
 * Contenido VERBATIM de las actividades ancla:
 *   - Marco teórico: lectura A1 «Fundamentos éticos de la acción humana» (5 párrafos).
 *   - Glosario: glosario interactivo A5 (5 términos).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO, LECTURA_A1, FUENTE } from "./dilema-tranvia-data";

export const DILEMA_TRANVIA_FICHA: FichaTeoricaData = {
  ancla: "PFH-II · P02 · A1 — Fundamentos éticos de la acción humana",

  marcoTeorico: LECTURA_A1,

  objetivos: [
    "Distinguir las cuatro corrientes éticas de la lectura: deontología kantiana, utilitarismo, ética de la virtud y ética del cuidado.",
    "Explicar cómo razonaría cada corriente ante el dilema del tranvía y sus variantes.",
    "Reconocer la diferencia entre prever un daño y usar a alguien como medio (doctrina del doble efecto).",
    "Justificar una decisión con una razón coherente y revisar la propia consistencia entre casos parecidos.",
    "Identificar afectados y distinguir hechos de valores en dilemas de la vida cotidiana.",
    "Construir argumentos con premisa, razón y conclusión, y detectar falacias como el ad hominem, la pendiente resbaladiza y el falso dilema.",
  ],

  materiales: [
    { nombre: "Vías, tranvía y palanca", detalle: "Cuatro variantes: la palanca, el puente, el lazo y el trasplante.", icono: "fa-train-tram" },
    { nombre: "Tabla de teorías", detalle: "Cómo razonarían el utilitarismo, la deontología, el doble efecto, la virtud y el cuidado.", icono: "fa-table-columns" },
    { nombre: "Cuatro dilemas cotidianos", detalle: "Un examen, un proyector roto, un auto autónomo y una pipa de agua.", icono: "fa-people-arrows" },
    { nombre: "Fichas de argumento", detalle: "Hechos, principios, falacias y conclusiones para armar premisa, razón y conclusión.", icono: "fa-puzzle-piece" },
    { nombre: "Balanza del debate", detalle: "Las intervenciones del debate A3 pesan si están bien fundadas; las falacias no pesan.", icono: "fa-scale-balanced" },
  ],

  conceptos: [
    {
      termino: "Experimento mental",
      definicion: "Un caso imaginado que aísla una variable moral. El tranvía cambia un solo detalle entre variantes (desviar, empujar, usar un lazo) para ver qué cambia en nuestro juicio.",
    },
    {
      termino: "Prever frente a usar",
      definicion: "En la palanca, la muerte del trabajador lateral se prevé pero no se necesita; en el puente, el cuerpo de la persona es el medio para detener el tranvía.",
    },
    {
      termino: "Doctrina del doble efecto",
      definicion: "Permite un acto con un efecto malo si el acto no es malo en sí, el mal no se busca, no es el medio para el bien y hay una razón proporcionada. Philippa Foot la discutió en 1967 con el caso del tranvía.",
    },
    {
      termino: "Utilitarismo de actos y de reglas",
      definicion: "El de actos juzga cada acción por sus consecuencias; el de reglas pregunta qué pasaría si todos siguieran esa regla (por ejemplo, si los médicos sacrificaran pacientes sanos).",
    },
    {
      termino: "Hechos y valores",
      definicion: "Un hecho describe lo que es y se puede comprobar; un valor dice lo que debería ser y se argumenta. Un buen argumento moral necesita los dos.",
    },
    {
      termino: "Falacia",
      definicion: "Un razonamiento que parece convincente pero no aporta razones: ataca a la persona (ad hominem), exagera consecuencias (pendiente resbaladiza), reduce las opciones (falso dilema) o apela a la mayoría (ad populum).",
    },
  ],

  glosario: GLOSARIO.map((g) => ({ termino: g.termino, definicion: g.definicion })),

  aplicaciones: [
    "Los comités de ética de los hospitales discuten a quién asignar recursos escasos, como órganos o camas de terapia intensiva.",
    "Quienes programan autos autónomos deben decidir de antemano cómo reaccionará el vehículo en una emergencia (experimento Moral Machine, Nature, 2018).",
    "Una asamblea comunitaria que reparte agua escasa elige entre criterios de igualdad y de necesidad.",
    "En un debate escolar o en redes sociales, detectar falacias ayuda a responder argumentos y no personas.",
  ],

  fuente: FUENTE,
};
