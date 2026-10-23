/**
 * Laboratorios destacados — selección curada de prácticas por semestre
 * con acceso directo desde la pestaña "Destacados" de /hub/recursos/laboratorios,
 * SIN importar el semestre del alumno.
 *
 * ⚠️ TEMPORAL — solo para la presentación. Para revertir, basta con:
 *   1. quitar la pestaña "Destacados" en laboratorios/page.tsx (bloque DestacadosView),
 *   2. borrar este archivo.
 * No se modifican los labs de cada semestre: esto es puramente aditivo.
 *
 * `ruta` = deep-link verificado contra la BD (scripts/_verify-destacados.ts).
 * `videoId` = YouTube del video demostrativo de cada lab.
 * `semestre` = agrupación de presentación indicada por el usuario.
 */

export interface LabDestacado {
  /** Número de la práctica en la presentación . */
  n: number;
  /** practica_slug — clave del registro de laboratorios. */
  slug: string;
  /** Código de la UAC donde vive (para el color de área). */
  uacCodigo: string;
  /** Semestre de agrupación en la presentación. */
  semestre: number;
  /** YouTube ID del video demostrativo del lab. Sin él, la tarjeta usa `imagen`. */
  videoId?: string;
  /** Captura del lab (en /public) para las tarjetas sin video: lleva directo a la práctica. */
  imagen?: string;
  /** Deep-link a la práctica (verificado en BD). */
  ruta: string;
}

/** Video de presentación de cada semestre (YouTube ID). */
export const SEMESTRE_VIDEOS: Record<number, string> = {
  1: "f6xbnUSB3kg",
  2: "7AdtSLlJPVI",
  3: "tuz8GQa39N0",
  4: "BFv_cSEYIBE",
  5: "uae0vhy0xMw",
  6: "6Llgjipl4z4",
};

// Criterio (2026-10-23): primero los labs de nivel «élite» (célula, ADN, gravitación,
// electromagnetismo, óptica, cónicas, subsistemas, fotosíntesis, paquete de internet,
// atlas del cuerpo y Sistema Solar), con captura real como portada. Donde un semestre
// no tiene ninguno, se conservan los de la selección original, con su video.
export const LABS_DESTACADOS: LabDestacado[] = [
  // ── Semestre 1 ──
  { n: 1, slug: "viaje-paquete-internet-3d", uacCodigo: "CD-I", semestre: 1, imagen: "/media/destacados/viaje-paquete-internet-3d.webp", ruta: "/hub/laboratorios/viaje-paquete-internet-3d" },
  { n: 2, slug: "estados-materia", uacCodigo: "CNEYT-I", semestre: 1, videoId: "O-F8XMFR1-Y", ruta: "/hub/uac/CNEYT-I/progresion/7/actividad/1/practica" },
  { n: 3, slug: "densidad", uacCodigo: "CNEYT-I", semestre: 1, videoId: "SFin2bFRd8g", ruta: "/hub/uac/CNEYT-I/progresion/3/actividad/6/practica" },
  // ── Semestre 2 ──
  { n: 4, slug: "gas-ideal-piston", uacCodigo: "CNEYT-II", semestre: 2, videoId: "zmaafUFCxsM", ruta: "/hub/uac/CNEYT-II/progresion/6/actividad/1/practica" },
  { n: 5, slug: "propagacion-calor", uacCodigo: "CNEYT-II", semestre: 2, videoId: "4Lc6uiKJXA8", ruta: "/hub/uac/CNEYT-II/progresion/4/actividad/2/practica" },
  // ── Semestre 3 ──
  { n: 6, slug: "subsistemas-terrestres", uacCodigo: "CNEYT-III", semestre: 3, imagen: "/media/destacados/subsistemas-terrestres.webp", ruta: "/hub/laboratorios/subsistemas-terrestres" },
  { n: 7, slug: "fotosintesis", uacCodigo: "CNEYT-III", semestre: 3, imagen: "/media/destacados/fotosintesis.webp", ruta: "/hub/laboratorios/fotosintesis" },
  { n: 8, slug: "ciclo-carbono", uacCodigo: "CNEYT-III", semestre: 3, videoId: "TASdCa8e6pc", ruta: "/hub/uac/CNEYT-III/progresion/10/actividad/1/practica" },
  // ── Semestre 4 ──
  { n: 9, slug: "conicas-lugares-geometricos", uacCodigo: "PM-IV", semestre: 4, imagen: "/media/destacados/conicas-lugares-geometricos.webp", ruta: "/hub/laboratorios/conicas-lugares-geometricos" },
  { n: 10, slug: "redox-combustion", uacCodigo: "CNEYT-IV", semestre: 4, videoId: "eXTvLeD1CHY", ruta: "/hub/uac/CNEYT-IV/progresion/5/actividad/2/practica" },
  { n: 11, slug: "equilibrio-quimico", uacCodigo: "CNEYT-IV", semestre: 4, videoId: "VV7jwV3WGdk", ruta: "/hub/uac/CNEYT-IV/progresion/3/actividad/2/practica" },
  // ── Semestre 5 ──
  { n: 12, slug: "gravitacion-universal", uacCodigo: "CNEYT-V", semestre: 5, imagen: "/media/destacados/gravitacion-universal.webp", ruta: "/hub/laboratorios/gravitacion-universal" },
  { n: 13, slug: "electromagnetismo-ohm-faraday", uacCodigo: "CNEYT-V", semestre: 5, imagen: "/media/destacados/electromagnetismo-ohm-faraday.webp", ruta: "/hub/laboratorios/electromagnetismo-ohm-faraday" },
  { n: 14, slug: "optica-lentes-espejos", uacCodigo: "CNEYT-V", semestre: 5, imagen: "/media/destacados/optica-lentes-espejos.webp", ruta: "/hub/laboratorios/optica-lentes-espejos" },
  { n: 15, slug: "sistema-solar-3d", uacCodigo: "CNEYT-V", semestre: 5, imagen: "/media/destacados/sistema-solar-3d.webp", ruta: "/hub/laboratorios/sistema-solar-3d" },
  // ── Semestre 6 ──
  { n: 16, slug: "celula-organelos-3d", uacCodigo: "CNEYT-VI", semestre: 6, imagen: "/media/destacados/celula-organelos-3d.webp", ruta: "/hub/laboratorios/celula-organelos-3d" },
  { n: 17, slug: "adn-dogma-central-3d", uacCodigo: "CNEYT-VI", semestre: 6, imagen: "/media/destacados/adn-dogma-central-3d.webp", ruta: "/hub/laboratorios/adn-dogma-central-3d" },
  { n: 18, slug: "atlas-cuerpo-humano-3d", uacCodigo: "CNEYT-VI", semestre: 6, imagen: "/media/destacados/atlas-cuerpo-humano-3d.webp", ruta: "/hub/laboratorios/atlas-cuerpo-humano-3d" },
];
