import type { UACPlanRecord, ProgresionPlan } from '@/lib/schemas/planteamiento.schema';

export const PLANTEAMIENTO_CODES: readonly string[] = [
  'LC-I',    'PM-I',    'IN-I',    'CD-I',    'CS-I',    'PFH-I',   'CNEYT-I',
  'LC-II',   'PM-II',   'IN-II',   'CD-II',   'CS-II',   'PFH-II',  'CNEYT-II',
  'LC-III',  'PM-III',  'IN-III',  'PFH-III', 'CNEYT-III',
  'PM-IV',   'IN-IV',   'CH-I',    'CS-III',  'CNEYT-IV',
  'PM-V',    'IN-V',    'CH-II',   'CNEYT-V',
  'PM-VI',   'CD-III',  'CH-III',  'CNEYT-VI',
];

type JsonMod = { default: Record<string, unknown> };

const LOADERS: Record<string, () => Promise<JsonMod>> = {
  'LC-I':     () => import('./lc-i.json'),
  'PM-I':     () => import('./pm-i.json'),
  'IN-I':     () => import('./in-i.json'),
  'CD-I':     () => import('./cd-i.json'),
  'CS-I':     () => import('./cs-i.json'),
  'PFH-I':    () => import('./pfh-i.json'),
  'CNEYT-I':  () => import('./cneyt-i.json'),
  'LC-II':    () => import('./lc-ii.json'),
  'PM-II':    () => import('./pm-ii.json'),
  'IN-II':    () => import('./in-ii.json'),
  'CD-II':    () => import('./cd-ii.json'),
  'CS-II':    () => import('./cs-ii.json'),
  'PFH-II':   () => import('./pfh-ii.json'),
  'CNEYT-II': () => import('./cneyt-ii.json'),
  'LC-III':    () => import('./lc-iii.json'),
  'PM-III':    () => import('./pm-iii.json'),
  'IN-III':    () => import('./in-iii.json'),
  'PFH-III':   () => import('./pfh-iii.json'),
  'CNEYT-III': () => import('./cneyt-iii.json'),
  'PM-IV':    () => import('./pm-iv.json'),
  'IN-IV':    () => import('./in-iv.json'),
  'CH-I':     () => import('./ch-i.json'),
  'CS-III':   () => import('./cs-iii.json'),
  'CNEYT-IV': () => import('./cneyt-iv.json'),
  'PM-V':     () => import('./pm-v.json'),
  'IN-V':     () => import('./in-v.json'),
  'CH-II':    () => import('./ch-ii.json'),
  'CNEYT-V':  () => import('./cneyt-v.json'),
  'PM-VI':    () => import('./pm-vi.json'),
  'CD-III':   () => import('./cd-iii.json'),
  'CH-III':   () => import('./ch-iii.json'),
  'CNEYT-VI': () => import('./cneyt-vi.json'),
};

function sortRecord(record: UACPlanRecord): ProgresionPlan[] {
  return Object.values(record).sort((a, b) => {
    const numA = parseInt(a.code.split('-P')[1] ?? '0', 10);
    const numB = parseInt(b.code.split('-P')[1] ?? '0', 10);
    return numA - numB;
  });
}

export async function loadUACProgresiones(uacCodigo: string): Promise<ProgresionPlan[]> {
  const loader = LOADERS[uacCodigo];
  if (!loader) return [];
  const mod = await loader();
  return sortRecord(mod.default as UACPlanRecord);
}
