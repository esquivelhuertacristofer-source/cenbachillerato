/**
 * Aggregador estático de planteamiento académico MCCEMS.
 * Importa todos los JSON de progresiones por UAC y los exporta
 * como `planteamientoData` (PlanteamientoDatabase).
 *
 * Los JSON contienen stubs con _TODO hasta que se genere el contenido real.
 * Uso: import { planteamientoData, getPlanUAC, getPlanProgresion } from '@/data/planteamiento/hub';
 */

import type { PlanteamientoDatabase, UACPlanRecord, ProgresionPlan } from '@/lib/schemas/planteamiento.schema';

// ── Semestre 1 ─────────────────────────────────────────────────────────────
import lcI    from './lc-i.json';
import pmI    from './pm-i.json';
import inI    from './in-i.json';
import cdI    from './cd-i.json';
import csI    from './cs-i.json';
import pfhI   from './pfh-i.json';
import cneytI from './cneyt-i.json';

// ── Semestre 2 ─────────────────────────────────────────────────────────────
import lcII    from './lc-ii.json';
import pmII    from './pm-ii.json';
import inII    from './in-ii.json';
import cdII    from './cd-ii.json';
import csII    from './cs-ii.json';
import pfhII   from './pfh-ii.json';
import cneytII from './cneyt-ii.json';

// ── Semestre 3 ─────────────────────────────────────────────────────────────
import lcIII    from './lc-iii.json';
import pmIII    from './pm-iii.json';
import inIII    from './in-iii.json';
import pfhIII   from './pfh-iii.json';
import cneytIII from './cneyt-iii.json';

// ── Semestre 4 ─────────────────────────────────────────────────────────────
import pmIV    from './pm-iv.json';
import inIV    from './in-iv.json';
import chI     from './ch-i.json';
import csIII   from './cs-iii.json';
import cneytIV from './cneyt-iv.json';

// ── Semestre 5 ─────────────────────────────────────────────────────────────
import pmV    from './pm-v.json';
import inV    from './in-v.json';
import chII   from './ch-ii.json';
import cneytV from './cneyt-v.json';

// ── Semestre 6 ─────────────────────────────────────────────────────────────
import pmVI    from './pm-vi.json';
import cdIII   from './cd-iii.json';
import chIII   from './ch-iii.json';
import cneytVI from './cneyt-vi.json';

// ── Mapa central por código UAC ────────────────────────────────────────────

export const planteamientoData: PlanteamientoDatabase = {
  // Semestre 1
  'LC-I':     lcI    as UACPlanRecord,
  'PM-I':     pmI    as UACPlanRecord,
  'IN-I':     inI    as UACPlanRecord,
  'CD-I':     cdI    as UACPlanRecord,
  'CS-I':     csI    as UACPlanRecord,
  'PFH-I':    pfhI   as UACPlanRecord,
  'CNEYT-I':  cneytI as UACPlanRecord,

  // Semestre 2
  'LC-II':    lcII    as UACPlanRecord,
  'PM-II':    pmII    as UACPlanRecord,
  'IN-II':    inII    as UACPlanRecord,
  'CD-II':    cdII    as UACPlanRecord,
  'CS-II':    csII    as UACPlanRecord,
  'PFH-II':   pfhII   as UACPlanRecord,
  'CNEYT-II': cneytII as UACPlanRecord,

  // Semestre 3
  'LC-III':    lcIII    as UACPlanRecord,
  'PM-III':    pmIII    as UACPlanRecord,
  'IN-III':    inIII    as UACPlanRecord,
  'PFH-III':   pfhIII   as UACPlanRecord,
  'CNEYT-III': cneytIII as UACPlanRecord,

  // Semestre 4
  'PM-IV':    pmIV    as UACPlanRecord,
  'IN-IV':    inIV    as UACPlanRecord,
  'CH-I':     chI     as UACPlanRecord,
  'CS-III':   csIII   as UACPlanRecord,
  'CNEYT-IV': cneytIV as UACPlanRecord,

  // Semestre 5
  'PM-V':    pmV    as UACPlanRecord,
  'IN-V':    inV    as UACPlanRecord,
  'CH-II':   chII   as UACPlanRecord,
  'CNEYT-V': cneytV as UACPlanRecord,

  // Semestre 6
  'PM-VI':    pmVI    as UACPlanRecord,
  'CD-III':   cdIII   as UACPlanRecord,
  'CH-III':   chIII   as UACPlanRecord,
  'CNEYT-VI': cneytVI as UACPlanRecord,
};

// ── Helpers de acceso ──────────────────────────────────────────────────────

/** Devuelve todas las progresiones de un UAC como array ordenado. */
export function getPlanUAC(uacCodigo: string): ProgresionPlan[] {
  const record = planteamientoData[uacCodigo];
  if (!record) return [];
  return Object.values(record).sort((a, b) => {
    const numA = parseInt(a.code.split('-P')[1] ?? '0', 10);
    const numB = parseInt(b.code.split('-P')[1] ?? '0', 10);
    return numA - numB;
  });
}

/** Devuelve una progresión específica por su código completo (e.g., "PM-I-P01"). */
export function getPlanProgresion(code: string): ProgresionPlan | undefined {
  for (const record of Object.values(planteamientoData)) {
    if (record[code]) return record[code] as ProgresionPlan;
  }
  return undefined;
}

/** Devuelve todos los UAC codes disponibles en el planteamiento. */
export const uacCodesDisponibles = Object.keys(planteamientoData);
