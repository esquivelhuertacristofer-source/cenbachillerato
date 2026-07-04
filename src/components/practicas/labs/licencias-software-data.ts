/**
 * Datos del laboratorio "Licencias digitales — ¿libre o privativo?" (CD-I-P02-A2).
 *
 * Módulo de datos PURO (sin three, sin React): contenido alineado VERBATIM a la
 * lectura A1 «¿De quién es el software que uso?» (CD-I·P02), el quiz A2, el
 * glosario A5 y la lectura A1 «Las cuatro libertades del software libre»
 * (CD-I·P09, que profundiza el mismo concepto de software libre de P02-A1).
 */

/* ── Modo 1 «¿Libre o privativo?» (clasificar software) ─────────────────── */
// Verbatim A1: propietario → Windows, Microsoft Office, Adobe Photoshop;
//              libre → Linux, LibreOffice, Firefox.
export type TipoLic = "privativo" | "libre";

export const TIPO_INFO: Record<TipoLic, { label: string; descripcion: string; icono: string; color: string }> = {
  privativo: {
    label: "Software privativo",
    descripcion: "Código fuente secreto; no se puede modificar ni redistribuir libremente.",
    icono: "fa-lock",
    color: "#FF8A5B",
  },
  libre: {
    label: "Software libre",
    descripcion: "Permite usar, estudiar, modificar y redistribuir.",
    icono: "fa-lock-open",
    color: "#34D399",
  },
};

export interface Programa {
  id: string;
  texto: string;
  tipo: TipoLic;
}

export const PROGRAMAS: Programa[] = [
  { id: "p-win", texto: "Windows", tipo: "privativo" },
  { id: "p-office", texto: "Microsoft Office", tipo: "privativo" },
  { id: "p-photoshop", texto: "Adobe Photoshop", tipo: "privativo" },
  { id: "p-linux", texto: "GNU/Linux", tipo: "libre" },
  { id: "p-libreoffice", texto: "LibreOffice", tipo: "libre" },
  { id: "p-firefox", texto: "Firefox", tipo: "libre" },
];

/* ── Modo 2 «Creative Commons» (emparejar licencia con su permiso) ──────── */
// Verbatim A1: CC BY (crédito), CC BY-SA (crédito + compartir igual),
// CC BY-NC (no comercial), CC BY-NC-ND (la más restrictiva).
export interface LicenciaCC {
  id: string;
  sigla: string;
  permiso: string;
  restrictiva?: boolean;
}

export const LICENCIAS_CC: LicenciaCC[] = [
  { id: "cc-by", sigla: "CC BY", permiso: "Puedes usar el contenido siempre que des crédito al autor." },
  { id: "cc-by-sa", sigla: "CC BY-SA", permiso: "Puedes usar si das crédito y compartes igual (con la misma licencia)." },
  { id: "cc-by-nc", sigla: "CC BY-NC", permiso: "Solo para uso no comercial, dando crédito al autor." },
  {
    id: "cc-by-nc-nd",
    sigla: "CC BY-NC-ND",
    permiso: "Solo puedes descargar y compartir tal cual: sin modificar ni usar comercialmente (la más restrictiva).",
    restrictiva: true,
  },
];

/* ── Modo 3 «Las cuatro libertades» (ordenar 0 → 3) ────────────────────── */
// Verbatim P09-A1: (0) usar; (1) estudiar/adaptar (código fuente); (2) distribuir
// copias; (3) mejorar y publicar mejoras. (P02-A1 ya enuncia: «usar, estudiar,
// modificar y redistribuir».)
export interface Libertad {
  numero: number;
  texto: string;
}

export const LIBERTADES: Libertad[] = [
  { numero: 0, texto: "Usar el programa para cualquier propósito." },
  { numero: 1, texto: "Estudiar cómo funciona y adaptarlo (requiere el código fuente)." },
  { numero: 2, texto: "Distribuir copias para ayudar a otras personas." },
  { numero: 3, texto: "Mejorar el programa y publicar las mejoras para que toda la comunidad se beneficie." },
];

/* ── Cuestionario (verbatim del quiz A2) ───────────────────────────────── */
export interface QuizItem {
  pregunta: string;
  opciones: string[];
  correcta: number;
  retro: string;
}

export const QUIZ: QuizItem[] = [
  {
    pregunta: "¿Cuál es la característica principal del software propietario?",
    opciones: [
      "Se puede modificar libremente",
      "Su código fuente es secreto y no puede redistribuirse sin autorización",
      "Es siempre gratuito",
      "Solo funciona en Linux",
    ],
    correcta: 1,
    retro: "El software propietario tiene código fuente cerrado y uso limitado por licencia de la empresa.",
  },
  {
    pregunta: "Una imagen con licencia CC BY-NC puede usarse:",
    opciones: [
      "Solo si pagas una tarifa",
      "Para uso no comercial dando crédito al autor",
      "Para cualquier propósito sin restricciones",
      "Solo en México",
    ],
    correcta: 1,
    retro: "CC BY-NC = Attribution NonCommercial: se permite usar con crédito pero no con fines comerciales.",
  },
  {
    pregunta: "¿Cuál de estas licencias es la más restrictiva?",
    opciones: ["CC BY (Solo atribución)", "Software libre GPL", "CC BY-NC-ND", "Dominio público"],
    correcta: 2,
    retro: "CC BY-NC-ND: solo puedes descargar y compartir sin modificar ni usar comercialmente.",
  },
  {
    pregunta: "¿Qué significa que un programa es 'de código abierto'?",
    opciones: [
      "Que es gratuito siempre",
      "Que puedes ver, modificar y distribuir su código fuente",
      "Que solo funciona en internet",
      "Que no tiene derechos de autor",
    ],
    correcta: 1,
    retro: "Código abierto (open source) significa que el código fuente es accesible para estudiar, modificar y redistribuir.",
  },
  {
    pregunta: "Descargaste una imagen de internet para usarla en tu exposición escolar. ¿Qué debes verificar primero?",
    opciones: [
      "Que sea de buena calidad",
      "Su tipo de licencia y si permite uso educativo",
      "Que sea de colores llamativos",
      "Que pese menos de 1 MB",
    ],
    correcta: 1,
    retro: "Antes de usar cualquier contenido digital, verifica su licencia para saber si está permitido ese uso.",
  },
];

/** Dato verbatim de A1 (software libre ≠ gratis). */
export const DATO_LICENCIAS =
  "«Software libre» NO significa «gratis»: se refiere a la libertad de usar, estudiar, modificar y redistribuir el programa. Muchas veces además es gratuito, aunque no siempre. (En inglés «free» es ambiguo: free as in freedom, no free as in beer.)";
