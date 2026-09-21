/**
 * Datos de la Ficha Teórica del laboratorio "Políticas de conservación y
 * restauración de ecosistemas en México" (CNEYT-III, progresión 11; códigos
 * CNEYT-III-P07).
 *
 * Contenido VERBATIM de las actividades ancla:
 *   - Marco teórico: lectura A1 «Políticas de conservación en México: ANP,
 *     LGEEPA y convenios» (5 párrafos).
 *   - Glosario: glosario interactivo A5 (6 términos).
 * Los conceptos centrales y las aplicaciones complementan la lectura con datos
 * verificables (CONANP 2025, CONAFOR 2024, estudios de sucesión y casos).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO, LECTURA_A1, FUENTE } from "./restauracion-ecosistemas-data";

export const RESTAURACION_ECOSISTEMAS_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-III · P07 · A1 — Políticas de conservación en México: ANP, LGEEPA y convenios",

  marcoTeorico: LECTURA_A1,

  objetivos: [
    "Distinguir conservación (mantener lo que está en buen estado) de restauración (asistir la recuperación de lo degradado).",
    "Describir los principales instrumentos de política ambiental de México: ANP, PSA, ADVC, UMA, corredores biológicos, vedas y restauración pasiva y activa.",
    "Elegir el instrumento adecuado según la amenaza, el dueño de la tierra y el presupuesto disponible.",
    "Explicar cómo avanza la sucesión ecológica en un potrero y por qué la distancia al bosque decide entre regeneración natural y plantación.",
    "Analizar con datos reales qué funcionó y qué no en la vaquita marina, Cabo Pulmo y la mariposa monarca.",
    "Argumentar por qué las leyes, por sí solas, no bastan para conservar la biodiversidad.",
  ],

  materiales: [
    { nombre: "Maqueta de una cuenca", detalle: "Ocho zonas ilustrativas con dueños, amenazas y un presupuesto de 100 unidades.", icono: "fa-map-location-dot" },
    { nombre: "Ocho instrumentos de política", detalle: "ANP, PSA, ADVC, UMA, corredor, veda, restauración pasiva y activa.", icono: "fa-scale-balanced" },
    { nombre: "Parcela cercada", detalle: "Un potrero que se restaura frente al bosque maduro, de 50 a 3,000 m de distancia.", icono: "fa-seedling" },
    { nombre: "Columnas de recuperación", detalle: "Suelo, riqueza, biomasa y composición frente al bosque maduro.", icono: "fa-chart-column" },
    { nombre: "Series de datos de tres casos", detalle: "Censos de vaquita, biomasa de peces en Cabo Pulmo y hectáreas de colonias de monarca.", icono: "fa-magnifying-glass-chart" },
  ],

  conceptos: [
    {
      termino: "Conservación y restauración",
      definicion: "Conservar es evitar que un ecosistema en buen estado se degrade; restaurar es ayudar a recuperar uno que ya se dañó. La Meta 2 del Marco Kunming-Montreal pide que al menos 30 % de los ecosistemas degradados estén en restauración efectiva para 2030.",
    },
    {
      termino: "Áreas Naturales Protegidas hoy",
      definicion: "Según la CONANP (2025), México tiene 232 ANP federales con más de 99 millones de hectáreas: 23.1 millones terrestres (11.76 % de la superficie terrestre) y 74.9 millones marinas (23.78 %).",
    },
    {
      termino: "Pago por Servicios Ambientales (PSA)",
      definicion: "Programa de la CONAFOR que paga a dueños de bosques por conservarlos. Entre 2020 y 2024 tuvo 1,963 apoyos vigentes sobre 1.6 millones de hectáreas, 95 % de ellos a ejidos y comunidades, pagados en cinco anualidades.",
    },
    {
      termino: "Adicionalidad",
      definicion: "Un instrumento es adicional cuando evita una pérdida que sí habría ocurrido. Pagar por conservar un bosque sin amenaza conserva poco extra; pagar en la frontera agropecuaria evita mucha deforestación.",
    },
    {
      termino: "ADVC y UMA",
      definicion: "La ADVC es un área que su dueño destina voluntariamente a conservar y que la CONANP certifica. La UMA es un predio registrado ante la SEMARNAT con plan de manejo para aprovechar fauna o flora silvestre con tasas autorizadas.",
    },
    {
      termino: "Sucesión secundaria",
      definicion: "Cambio ordenado de la vegetación tras un disturbio: pastizal, matorral de pioneras, acahual y bosque. En selvas neotropicales que se regeneran solas, el suelo recupera 90 % en menos de 10 años, la riqueza de especies 80 % en 20 años, la biomasa 90 % en unos 66 años y la composición apenas 34 % en 20 años.",
    },
    {
      termino: "Restauración pasiva y activa",
      definicion: "Cerca de bosque maduro basta quitar el ganado y el fuego: en selvas tropicales la regeneración natural logra en promedio más biodiversidad y estructura que la plantación (Crouzeilles et al., 2017). Lejos de la fuente de semillas o con el suelo muy degradado, hay que plantar o crear islas de árboles (nucleación).",
    },
    {
      termino: "Parque de papel",
      definicion: "Área protegida decretada que no se cumple. La vaquita marina pasó de unas 567 en 1997 a no más de 19 en 2018 pese a veda, reserva y refugio, porque las redes ilegales siguieron.",
    },
  ],

  glosario: GLOSARIO.map((g) => ({ termino: g.termino, definicion: g.definicion })),

  aplicaciones: [
    "Cabo Pulmo (B.C.S.): con una zona de no pesca que la comunidad respetó, la biomasa de peces pasó de 0.75 a 4.24 t/ha entre 1999 y 2009 (+463 %).",
    "Reserva de la Biosfera Mariposa Monarca: la tala ilegal en la zona núcleo bajó de 13.94 ha (2020-21) a 2.51 ha (2023-24), pero las colonias dependen también de lo que ocurre en Estados Unidos y Canadá.",
    "Ejidos y comunidades de Oaxaca, Campeche y Guerrero concentran buena parte de las ADVC certificadas por la CONANP.",
    "Acahuales de la Selva Lacandona y otras regiones tropicales de México muestran cómo un potrero abandonado vuelve a ser selva si hay bosque cerca.",
  ],

  fuente: `${FUENTE} Datos complementarios: CONANP (2025); CONAFOR, Informe de autoevaluación 2024; Poorter et al. (2016, 2021); Rozendaal et al. (2019); Crouzeilles et al. (2017); NOAA Fisheries y CIRVA; Aburto-Oropeza et al. (2011); WWF México y CONANP.`,
};
