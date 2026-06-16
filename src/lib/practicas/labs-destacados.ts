/**
 * Laboratorios destacados — selección curada de 18 prácticas (3 por semestre)
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
  /** Número de la práctica en la presentación (1–18). */
  n: number;
  /** practica_slug — clave del registro de laboratorios. */
  slug: string;
  /** Código de la UAC donde vive (para el color de área). */
  uacCodigo: string;
  /** Semestre de agrupación en la presentación. */
  semestre: number;
  /** YouTube ID del video demostrativo del lab. */
  videoId: string;
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

export const LABS_DESTACADOS: LabDestacado[] = [
  // ── Semestre 1 ──
  { n: 1, slug: "estados-materia", uacCodigo: "CNEYT-I", semestre: 1, videoId: "O-F8XMFR1-Y", ruta: "/hub/uac/CNEYT-I/progresion/7/actividad/1/practica" },
  { n: 2, slug: "modelos-atomicos", uacCodigo: "CNEYT-I", semestre: 1, videoId: "HBFyiVZ4RLk", ruta: "/hub/uac/CNEYT-I/progresion/5/actividad/1/practica" },
  { n: 3, slug: "densidad", uacCodigo: "CNEYT-I", semestre: 1, videoId: "SFin2bFRd8g", ruta: "/hub/uac/CNEYT-I/progresion/3/actividad/6/practica" },
  // ── Semestre 2 ──
  { n: 4, slug: "gas-ideal-piston", uacCodigo: "CNEYT-II", semestre: 2, videoId: "zmaafUFCxsM", ruta: "/hub/uac/CNEYT-II/progresion/6/actividad/1/practica" },
  { n: 5, slug: "propagacion-calor", uacCodigo: "CNEYT-II", semestre: 2, videoId: "4Lc6uiKJXA8", ruta: "/hub/uac/CNEYT-II/progresion/4/actividad/2/practica" },
  { n: 6, slug: "sistemas-ecuaciones-2x2", uacCodigo: "PM-III", semestre: 2, videoId: "nW4JLaq_ARM", ruta: "/hub/uac/PM-III/progresion/3/actividad/2/practica" },
  // ── Semestre 3 ──
  { n: 7, slug: "teorema-pitagoras", uacCodigo: "PM-III", semestre: 3, videoId: "c28THsr_cfg", ruta: "/hub/uac/PM-III/progresion/7/actividad/2/practica" },
  { n: 8, slug: "ciclo-carbono", uacCodigo: "CNEYT-III", semestre: 3, videoId: "TASdCa8e6pc", ruta: "/hub/uac/CNEYT-III/progresion/10/actividad/1/practica" },
  { n: 9, slug: "ecuacion-recta", uacCodigo: "PM-III", semestre: 3, videoId: "QEblTmtjgnE", ruta: "/hub/uac/PM-III/progresion/2/actividad/2/practica" },
  // ── Semestre 4 ──
  { n: 10, slug: "redox-combustion", uacCodigo: "CNEYT-IV", semestre: 4, videoId: "eXTvLeD1CHY", ruta: "/hub/uac/CNEYT-IV/progresion/5/actividad/2/practica" },
  { n: 11, slug: "equilibrio-quimico", uacCodigo: "CNEYT-IV", semestre: 4, videoId: "VV7jwV3WGdk", ruta: "/hub/uac/CNEYT-IV/progresion/3/actividad/2/practica" },
  { n: 12, slug: "circulo-unitario", uacCodigo: "PM-IV", semestre: 4, videoId: "OO7UW5ZIPdI", ruta: "/hub/uac/PM-IV/progresion/6/actividad/2/practica" },
  // ── Semestre 5 ──
  { n: 13, slug: "teorema-fundamental-calculo", uacCodigo: "PM-V", semestre: 5, videoId: "a16TcZJMabk", ruta: "/hub/uac/PM-V/progresion/8/actividad/2/practica" },
  { n: 14, slug: "mrua-acelerar-frenar", uacCodigo: "CNEYT-V", semestre: 5, videoId: "TIocE0moulw", ruta: "/hub/uac/CNEYT-V/progresion/1/actividad/2/practica" },
  { n: 15, slug: "fluidos", uacCodigo: "CNEYT-V", semestre: 5, videoId: "_8yQn6BVLtE", ruta: "/hub/uac/CNEYT-V/progresion/6/actividad/2/practica" },
  // ── Semestre 6 ──
  { n: 16, slug: "distribucion-normal", uacCodigo: "PM-VI", semestre: 6, videoId: "Rakx05e7MAA", ruta: "/hub/uac/PM-VI/progresion/8/actividad/2/practica" },
  { n: 17, slug: "division-celular", uacCodigo: "CNEYT-VI", semestre: 6, videoId: "v-aB7XyQihY", ruta: "/hub/uac/CNEYT-VI/progresion/5/actividad/2/practica" },
  { n: 18, slug: "adn-dogma-central-3d", uacCodigo: "CNEYT-VI", semestre: 6, videoId: "ZrrQA1uUohM", ruta: "/hub/uac/CNEYT-VI/progresion/4/actividad/1/practica" },
];
