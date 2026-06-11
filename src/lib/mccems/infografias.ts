/**
 * Manifiesto de infografías de estudio.
 *
 * Fuente: archivos reales en `public/biblioteca/infografias/NN.webp`.
 * SOLO se listan las infografías cuyo archivo EXISTE en disco (regla anti-fake:
 * nada de entradas a imágenes inexistentes). El índice editorial documenta más
 * temas planeados; aquí solo van las que ya se pueden mostrar.
 *
 * Para añadir una nueva: convierte la imagen a webp ligero
 * (`public/biblioteca/infografias/NN.webp`) y agrega su entrada aquí.
 *
 * Títulos verbatim de `public/biblioteca/infografias/_INDICE.txt`.
 */

export interface Infografia {
  /** Número de archivo (NN.webp). */
  num: number;
  /** Ruta pública de la imagen. */
  archivo: string;
  /** Código de UAC a la que pertenece (p. ej. "CNEYT-III"). */
  uac: string;
  /** Semestre (1–6) para filtrar por el del estudiante. */
  semestre: number;
  /** Título descriptivo del tema. */
  titulo: string;
}

/** Deriva el código RSC del área a partir del código de UAC ("CNEYT-III" → "RSC-CNEYT"). */
export function rscDeUac(uac: string): string {
  const partes = uac.split("-");
  return "RSC-" + partes.slice(0, -1).join("-");
}

function f(num: number): string {
  return `/biblioteca/infografias/${String(num).padStart(2, "0")}.webp`;
}

export const INFOGRAFIAS: Infografia[] = [
  { num: 1,  archivo: f(1),  uac: "CNEYT-I",   semestre: 1, titulo: "La Tabla Periódica: el mapa del universo de la materia" },
  { num: 2,  archivo: f(2),  uac: "CNEYT-I",   semestre: 1, titulo: "El Método Científico: el arte de preguntar al universo" },
  { num: 3,  archivo: f(3),  uac: "CNEYT-I",   semestre: 1, titulo: "La materia y sus estados: todo lo que nos rodea" },
  { num: 4,  archivo: f(4),  uac: "CNEYT-II",  semestre: 2, titulo: "Transformaciones energéticas: cadenas de conversión" },
  { num: 5,  archivo: f(5),  uac: "CNEYT-II",  semestre: 2, titulo: "Fuentes renovables en México: solar, eólica y geotérmica" },
  { num: 6,  archivo: f(6),  uac: "CNEYT-III", semestre: 3, titulo: "El sistema terrestre: atmósfera, hidrosfera, litosfera y biosfera" },
  { num: 7,  archivo: f(7),  uac: "CNEYT-III", semestre: 3, titulo: "El ciclo del agua: de la lluvia a los mares" },
  { num: 8,  archivo: f(8),  uac: "CNEYT-III", semestre: 3, titulo: "México: país megadiverso" },
  { num: 9,  archivo: f(9),  uac: "CNEYT-IV",  semestre: 4, titulo: "pH, la escala de acidez e indicadores ácido-base" },
  { num: 10, archivo: f(10), uac: "CNEYT-IV",  semestre: 4, titulo: "Tipos de reacciones químicas" },
  { num: 11, archivo: f(11), uac: "CNEYT-V",   semestre: 5, titulo: "Energía nuclear en México: Laguna Verde y el ININ" },
  { num: 12, archivo: f(12), uac: "CNEYT-V",   semestre: 5, titulo: "SASMEX y ondas sísmicas: cómo los sensores salvan vidas" },
  { num: 13, archivo: f(13), uac: "CNEYT-VI",  semestre: 6, titulo: "Genómica y diversidad genética del pueblo mexicano: el INMEGEN" },
  { num: 14, archivo: f(14), uac: "PM-I",      semestre: 1, titulo: "Proporcionalidad directa e inversa" },
  { num: 15, archivo: f(15), uac: "PM-II",     semestre: 2, titulo: "El lenguaje algebraico" },
  { num: 16, archivo: f(16), uac: "PM-III",    semestre: 3, titulo: "La fórmula general (ecuación cuadrática)" },
  { num: 17, archivo: f(17), uac: "PM-III",    semestre: 3, titulo: "Pirámides, conos y esferas: volúmenes y áreas" },
  { num: 18, archivo: f(18), uac: "PM-IV",     semestre: 4, titulo: "Razones trigonométricas en el triángulo rectángulo" },
  { num: 19, archivo: f(19), uac: "PM-IV",     semestre: 4, titulo: "El círculo unitario" },
  { num: 20, archivo: f(20), uac: "PM-V",      semestre: 5, titulo: "Reglas de derivación (potencia, suma y constante)" },
  { num: 21, archivo: f(21), uac: "PM-VI",     semestre: 6, titulo: "Visualizaciones engañosas en estadística" },
  { num: 22, archivo: f(22), uac: "PM-VI",     semestre: 6, titulo: "Media, mediana y moda" },
  { num: 23, archivo: f(23), uac: "LC-I",      semestre: 1, titulo: "Tipos de texto: narrativo, descriptivo, expositivo, argumentativo" },
  { num: 24, archivo: f(24), uac: "LC-I",      semestre: 1, titulo: "El acento ortográfico: reglas de acentuación" },
  { num: 25, archivo: f(25), uac: "LC-II",     semestre: 2, titulo: "Estructura del relato" },
  { num: 26, archivo: f(26), uac: "LC-III",    semestre: 3, titulo: "Los géneros literarios" },
  { num: 27, archivo: f(27), uac: "LC-III",    semestre: 3, titulo: "Metáfora, hipérbole e ironía" },
  { num: 28, archivo: f(28), uac: "IN-I",      semestre: 1, titulo: "The Verb 'To Be'" },
  { num: 29, archivo: f(29), uac: "IN-II",     semestre: 2, titulo: "Adverbios de frecuencia" },
  { num: 30, archivo: f(30), uac: "IN-III",    semestre: 3, titulo: "Past Simple vs Present Perfect" },
  { num: 31, archivo: f(31), uac: "IN-IV",     semestre: 4, titulo: "Be going to vs Will" },
];

/** Infografías disponibles para un semestre, en orden de archivo. */
export function getInfografiasSemestre(semestre: number): Infografia[] {
  return INFOGRAFIAS.filter((i) => i.semestre === semestre).sort((a, b) => a.num - b.num);
}
