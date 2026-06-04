/**
 * Índice de UACs con planteamiento académico disponible (orden curricular).
 *
 * NOTA: el contenido pedagógico (progresiones) NO se carga desde aquí. Vive en
 * Supabase (tabla planteamiento_progresiones) y se lee vía la Server Action
 * `getPlanteamientoPorUAC` (src/lib/actions/planteamiento.ts). Esto evita que
 * los JSON se empaqueten en el bundle del Worker de Cloudflare.
 *
 * Los archivos JSON fuente viven en scripts/seed-planteamiento/data/ y solo se
 * usan para (re)sembrar la base de datos.
 */

export const PLANTEAMIENTO_CODES: readonly string[] = [
  'LC-I',    'PM-I',    'IN-I',    'CD-I',    'CS-I',    'PFH-I',   'CNEYT-I',
  'LC-II',   'PM-II',   'IN-II',   'CD-II',   'CS-II',   'PFH-II',  'CNEYT-II',
  'LC-III',  'PM-III',  'IN-III',  'PFH-III', 'CNEYT-III',
  'PM-IV',   'IN-IV',   'CH-I',    'CS-III',  'CNEYT-IV',
  'PM-V',    'IN-V',    'CH-II',   'CNEYT-V',
  'PM-VI',   'CD-III',  'CH-III',  'CNEYT-VI',
];
