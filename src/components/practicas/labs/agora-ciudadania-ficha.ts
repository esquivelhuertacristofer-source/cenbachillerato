/**
 * Datos de la Ficha Teórica del laboratorio "Ágora: ciudadanía y democracia"
 * (CS-I-P02, progresión 2 de Ciencias Sociales I).
 *
 * Contenido VERBATIM de las actividades ancla:
 *   - Marco teórico: lectura A1 «¿Qué significa ser ciudadano/a hoy?» (4 párrafos).
 *   - Glosario: glosario interactivo A6 (6 términos).
 * Los conceptos centrales y las aplicaciones son redacción del laboratorio con
 * hechos verificados (ver agora-ciudadania-data.ts).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO, LECTURA_A1, FUENTE } from "./agora-ciudadania-data";

export const AGORA_CIUDADANIA_FICHA: FichaTeoricaData = {
  ancla: "CS-I · P02 · A1 — ¿Qué significa ser ciudadano/a hoy?",

  marcoTeorico: LECTURA_A1,

  objetivos: [
    "Explicar cómo se ha ampliado la ciudadanía desde la Atenas clásica hasta la paridad de género en México.",
    "Distinguir las reformas que cambiaron QUIÉN vota, CÓMO se vota y QUIÉN puede ser votada.",
    "Diferenciar ciudadanía formal y ciudadanía sustantiva con casos concretos.",
    "Reconocer que las condiciones de una convocatoria y el procedimiento de decisión determinan quién participa y quién queda fuera.",
    "Comparar mayoría simple, mayoría calificada, consenso y consulta a afectados sin buscar una respuesta única.",
    "Estructurar una intervención de debate con argumento, dato, reconocimiento del contrario, réplica y propuesta, distinguiendo hechos, valores y falacias.",
  ],

  materiales: [
    { nombre: "Ágora con línea del tiempo", detalle: "Ocho épocas, de Atenas (siglo V a. C.) a la paridad (2014–2019).", icono: "fa-landmark-dome" },
    { nombre: "Multitud ilustrativa de 40 personas", detalle: "Su composición por grupos es aproximada, no censal.", icono: "fa-people-group" },
    { nombre: "Tribuna de 10 lugares", detalle: "Quién puede ser votado: proporción aproximada de mujeres.", icono: "fa-chair" },
    { nombre: "Colonia con tres problemas", detalle: "Terreno baldío, horario del tianguis y alumbrado (casos ilustrativos).", icono: "fa-house-chimney" },
    { nombre: "Podio de debate y fichas", detalle: "Argumentos guía verbatim del debate A2.", icono: "fa-microphone-lines" },
  ],

  conceptos: [
    { termino: "Ciudadanía formal y sustantiva", definicion: "Tener el derecho reconocido por la ley, y poder ejercerlo de verdad. Una convocatoria en un horario imposible deja el derecho formal intacto, pero anula el sustantivo." },
    { termino: "Artículo 34 constitucional (vigente)", definicion: "«Son ciudadanos de la República los varones y mujeres que, teniendo la calidad de mexicanos, reúnan, además, los siguientes requisitos: I. Haber cumplido 18 años, y II. Tener un modo honesto de vivir.»" },
    { termino: "Voto directo e indirecto", definicion: "En el indirecto, los ciudadanos eligen electores que a su vez eligen a los representantes (Cádiz 1812, 1857). La Constitución de 1917 estableció la elección directa." },
    { termino: "Ampliación del sufragio en México", definicion: "Mujeres: voto municipal en 1947 y federal con la reforma publicada el 17 de octubre de 1953 (primer voto federal el 3 de julio de 1955). Jóvenes: 18 años sin importar el estado civil, reforma de 1969. Mexicanos en el extranjero: reforma de 2005, primer voto en 2006." },
    { termino: "Paridad de género", definicion: "Reforma de 2014: mitad de las candidaturas legislativas para cada género. Reforma de 2019, «paridad en todo»: en los tres poderes y órdenes de gobierno." },
    { termino: "Democracia procedimental y sustantiva", definicion: "La procedimental garantiza el voto; la sustantiva busca que todos los grupos participen en igualdad real de condiciones (lectura A1 de la progresión 4)." },
    { termino: "Mayoría, umbral, consenso y consulta", definicion: "Procedimientos para decidir: la mayoría es rápida pero puede ignorar a una minoría muy afectada; el umbral exige sumar más apoyo; el consenso busca que nadie quede con su peor opción; la consulta escucha primero a los afectados." },
    { termino: "Hecho, valor y falacia", definicion: "Un hecho se comprueba; un valor juzga lo que es justo o debería ser; una falacia parece argumento, pero su razonamiento falla (autoridad sin evidencia, generalización apresurada, ad hominem, falso dilema)." },
  ],

  glosario: GLOSARIO.map((g) => ({ termino: g.termino, definicion: g.definicion })),

  aplicaciones: [
    "Revisar si una asamblea escolar o vecinal se convoca en horario, lugar y lengua que permitan participar a todos.",
    "Ejercer el derecho de petición o sumarse a un colectivo antes de tener credencial para votar.",
    "Tramitar la credencial para votar al cumplir 18 años y, si vives fuera del país, registrarte para votar desde el extranjero.",
    "Detectar falacias en discusiones públicas y en redes sociales antes de compartir un argumento.",
  ],

  fuente: FUENTE,
};
