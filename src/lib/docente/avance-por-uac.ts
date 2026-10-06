/**
 * «Avance por asignatura» de Reportes Académicos.
 *
 * Antes la gráfica tomaba SIEMPRE el semestre del primer grupo del docente y
 * dividía entre TODOS sus alumnos. Un maestro con grupos de 2.º y de 4.º veía
 * las UAC de un solo semestre, y con el porcentaje hundido por alumnos que ni
 * siquiera cursan esas UAC. Ahora:
 *  - el semestre lo elige el docente (entre los que da);
 *  - la cohorte son solo los alumnos de SUS grupos de ese semestre;
 *  - cada actividad cuenta una vez por alumno (repetir no infla el avance).
 *
 * pct = actividades completadas (alumno × actividad, sin repetir)
 *       ÷ (actividades publicadas de la UAC × alumnos de la cohorte)
 */

export interface GrupoSemestre { id: string; semestre: number }
export interface Membresia { id_alumno: string; id_grupo: string }
export interface UacFila { id: string; codigo: string; nombre: string; semestre: number }
export interface ProgresionFila { id: string; uac_id: string }
export interface ActividadFila { id: string; progresion_id: string | null }
export interface IntentoFila { user_id: string; actividad_id: string | null }

export interface AvanceUac { uacId: string; codigo: string; nombre: string; pct: number }

/** Semestres en los que el docente tiene grupo, de menor a mayor. */
export function semestresDelDocente(grupos: readonly GrupoSemestre[]): number[] {
  return [...new Set(grupos.map((g) => g.semestre))].sort((a, b) => a - b);
}

/** Alumnos inscritos en los grupos del docente de ese semestre. */
export function cohorteDeSemestre(
  grupos: readonly GrupoSemestre[],
  membresias: readonly Membresia[],
  semestre: number,
): Set<string> {
  const delSemestre = new Set(grupos.filter((g) => g.semestre === semestre).map((g) => g.id));
  return new Set(membresias.filter((m) => delSemestre.has(m.id_grupo)).map((m) => m.id_alumno));
}

export function avancePorUac(datos: {
  semestre: number;
  cohorte: ReadonlySet<string>;
  uacs: readonly UacFila[];
  progresiones: readonly ProgresionFila[];
  actividades: readonly ActividadFila[];
  intentos: readonly IntentoFila[];
}): AvanceUac[] {
  const uacs = datos.uacs.filter((u) => u.semestre === datos.semestre);
  const uacDeProg = new Map(datos.progresiones.map((p) => [p.id, p.uac_id]));
  const uacDeAct = new Map<string, string>();
  const totalPorUac = new Map<string, number>();
  for (const a of datos.actividades) {
    const uacId = a.progresion_id ? uacDeProg.get(a.progresion_id) : undefined;
    if (!uacId) continue;
    uacDeAct.set(a.id, uacId);
    totalPorUac.set(uacId, (totalPorUac.get(uacId) ?? 0) + 1);
  }

  const vistos = new Set<string>();
  const hechasPorUac = new Map<string, number>();
  for (const it of datos.intentos) {
    if (!it.actividad_id || !datos.cohorte.has(it.user_id)) continue;
    const uacId = uacDeAct.get(it.actividad_id);
    if (!uacId) continue;
    const clave = `${it.user_id}|${it.actividad_id}`;
    if (vistos.has(clave)) continue;
    vistos.add(clave);
    hechasPorUac.set(uacId, (hechasPorUac.get(uacId) ?? 0) + 1);
  }

  return uacs.map((u) => {
    const posible = (totalPorUac.get(u.id) ?? 0) * datos.cohorte.size;
    const pct = posible > 0 ? Math.min(100, Math.round(((hechasPorUac.get(u.id) ?? 0) / posible) * 100)) : 0;
    return { uacId: u.id, codigo: u.codigo, nombre: u.nombre, pct };
  });
}
