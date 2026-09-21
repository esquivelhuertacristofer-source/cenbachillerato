/**
 * Ficha Teórica del laboratorio "Difusión digital: el alcance de una
 * publicación" (CD-III-P02, progresión 2 de Cultura Digital III).
 *
 * La progresión no tiene lectura A1 en la base de datos. Por eso el marco
 * teórico abre con dos textos VERBATIM de la plataforma (el propósito con los
 * contenidos de la progresión y el planteamiento de la simulación A2) y sigue
 * con párrafos ELABORADOS para el laboratorio, cada uno con su fuente.
 * El glosario es el A5, verbatim.
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO, PROPOSITO, CONTENIDOS_PROGRESION, SIMULACION_A2, FUENTE } from "./alcance-publicacion-data";

export const ALCANCE_PUBLICACION_FICHA: FichaTeoricaData = {
  ancla: "CD-III · P02 — Propósito y contenidos de la progresión y simulación A2 (verbatim); los demás párrafos se elaboraron para el laboratorio con fuentes citadas",

  marcoTeorico: [
    `Propósito de la progresión: «${PROPOSITO}» ${CONTENIDOS_PROGRESION}`,
    `Simulación A2: «${SIMULACION_A2.descripcion}»`,
    "Difundir no es solo publicar. Las plataformas miden tres cosas distintas: el alcance (cuántas personas o cuentas DISTINTAS vieron el contenido al menos una vez), las impresiones (cuántas veces se mostró en pantalla, contando repeticiones, por eso nunca son menos que el alcance) y la interacción (reacciones, comentarios, compartidos, guardados). La tasa de interacción por alcance es interacciones ÷ alcance × 100. Ninguna de las tres mide el impacto: el cambio real que buscaba la comunicación, como más alumnas inscritas en un taller o menos criaderos de mosco en la colonia.",
    "Un modelo clásico para estudiar cómo se difunde algo en una red es la cascada independiente (Kempe, Kleinberg y Tardos, 2003): cada persona que comparte le da a cada contacto una sola oportunidad de verlo y, con cierta probabilidad, de volver a compartirlo. Si en promedio cada persona que comparte logra que menos de una persona más comparta, la cascada se apaga pronto; por eso casi ninguna publicación se vuelve viral. Pesan mucho la cuenta de origen (cuántos contactos tiene y en qué grupos), el formato y la hora en que la audiencia está conectada.",
    "El canal adecuado depende del contexto. Según la ENDUTIH 2024 del INEGI, 83.1 % de la población de 6 años o más en México usa internet, pero la proporción es de 86.9 % en zonas urbanas y de 68.5 % en rurales; 97.2 % de quienes usan internet se conectan desde un celular. Una campaña solo digital deja fuera a buena parte de una localidad rural, donde la radio comunitaria o un cartel pueden llegar mejor.",
    "La accesibilidad cambia a quién llega un mensaje. El Censo 2020 del INEGI contó 6 179 890 personas con discapacidad (4.9 % de la población). Un video sin subtítulos revisados excluye a las personas sordas; una imagen sin texto alternativo es un hueco para quien usa lector de pantalla; la radio no llega a quien no oye. Las Pautas de Accesibilidad para el Contenido Web (WCAG 2.2, criterio 1.4.3) piden un contraste mínimo de 4.5:1 para texto normal y 3:1 para texto grande.",
    "La desinformación corre con ventaja. Vosoughi, Roy y Aral (Science, 2018) analizaron unas 126 000 historias difundidas en Twitter entre 2006 y 2017: las falsas tuvieron 70 % más probabilidad de ser retuiteadas y la verdad tardó unas seis veces más en llegar a 1 500 personas. Para frenarla sirven hacer una pausa y verificar antes de reenviar, desmentir pronto desde una fuente confiable y los frenos de diseño: en abril de 2020 WhatsApp limitó los mensajes «reenviados muchas veces» a un solo chat y reportó 70 % menos reenvíos de ese tipo de mensajes.",
  ],

  objetivos: [
    "Distinguir alcance, impresiones, interacción e impacto, y calcular la tasa de interacción de una publicación.",
    "Explicar por qué la cuenta de origen, el formato y el horario cambian el alcance de una publicación.",
    "Elegir la audiencia y máximo dos canales adecuados para una campaña según su contexto (simulación A2).",
    "Aplicar criterios de accesibilidad (texto alternativo, subtítulos, contraste, lenguaje claro) y reconocer a quién incluyen.",
    "Proponer indicadores de impacto medibles en lugar de métricas de vanidad.",
    "Explicar por qué la desinformación se difunde más rápido y qué acciones la frenan.",
  ],

  materiales: [
    { nombre: "Red de 150 cuentas", detalle: "Seis grupos de una comunidad escolar y tres cuentas institucionales (modelo ilustrativo).", icono: "fa-share-nodes" },
    { nombre: "Tres cuentas de origen", detalle: "Tu cuenta (11 contactos), la página de la escuela y una creadora local.", icono: "fa-user" },
    { nombre: "Seis canales", detalle: "WhatsApp, Facebook, TikTok, radio comunitaria, cartel y sitio web.", icono: "fa-tower-broadcast" },
    { nombre: "Cuatro criterios de accesibilidad", detalle: "Texto alternativo, subtítulos revisados, contraste 4.5:1 y lenguaje claro.", icono: "fa-universal-access" },
    { nombre: "Un rumor y su desmentido", detalle: "Una cadena falsa sobre el dengue y la información del centro de salud.", icono: "fa-shield-halved" },
  ],

  conceptos: [
    { termino: "Alcance", definicion: "Personas o cuentas distintas que vieron el contenido al menos una vez." },
    { termino: "Impresiones", definicion: "Veces que el contenido se mostró, contando repeticiones. Impresiones ÷ alcance = frecuencia promedio." },
    { termino: "Interacción y tasa de interacción", definicion: "Acciones sobre el contenido (reaccionar, comentar, compartir). Tasa por alcance = interacciones ÷ alcance × 100." },
    { termino: "Indicador de impacto", definicion: "Mide el cambio que buscaba la campaña fuera de la pantalla; los «me gusta» y las vistas no lo miden." },
    { termino: "Cascada de difusión", definicion: "Cadena de exposiciones y compartidos; crece si cada persona que comparte provoca en promedio más de un compartido nuevo." },
    { termino: "Nodo influyente", definicion: "Cuenta con muchos contactos en varios grupos: publicar desde ella multiplica el alcance inicial." },
    { termino: "Audiencia objetivo", definicion: "Las personas que pueden realizar el cambio buscado; define qué canal y qué formato conviene." },
    { termino: "Fricción contra la desinformación", definicion: "Pausas, avisos y límites de reenvío que bajan la probabilidad de compartir sin verificar." },
  ],

  glosario: GLOSARIO.map((g) => ({ termino: g.termino, definicion: g.definicion })),

  aplicaciones: [
    "Anunciar la jornada de vacunación del centro de salud por radio comunitaria y grupos de WhatsApp de la colonia.",
    "Publicar el video de un taller escolar con subtítulos revisados y describir las imágenes en el texto.",
    "Medir una campaña por las inscripciones o la asistencia, no por los «me gusta».",
    "Antes de reenviar una cadena, preguntar quién lo dice, desde cuándo y dónde más se publica.",
  ],

  fuente: FUENTE,
};
