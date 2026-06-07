/**
 * Progreso queries — estadísticas personales del alumno.
 * Algunas funciones dependen de tablas futuras (logros) — devuelven vacíos si no existen.
 */

import { getSupabaseServer } from "@/lib/supabase-helpers";
import { UAC_BASE } from "@/lib/mccems/estructura";
import { CATEGORIA_COMPLEMENTO } from "@/lib/mccems/categorias";
import { getRachaDelAlumno } from "@/lib/queries/hub";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SbAny = any;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProgresoUAC {
  codigo: string;
  nombre: string;
  rscCodigo: string;
  completadas: number;
  total: number;
  pct: number;
  ultimaActividad: string | null;
}

export interface ActividadReciente {
  id: string;
  uacNombre: string;
  uacCodigo: string;
  rscCodigo: string;
  tipo: string;
  titulo: string;
  completadaEn: string;
  xpGanado: number;
}

export interface Logro {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  desbloqueadoEn: string | null;
}

export interface EstadisticasProgreso {
  materiaMasFuerte: { nombre: string; pct: number } | null;
  tipoActividades: { tipo: string; cantidad: number }[];
  totalXP: number;
  totalMinutos: number;
  totalActividades: number;
}

export interface CalendarioDia {
  fecha: string;
  activo: boolean;
  rscCodigo: string | null;
}

// ─── getProgresoDetallePorUAC ─────────────────────────────────────────────────

export async function getProgresoDetallePorUAC(
  alumnoId: string,
  semestre: number
): Promise<ProgresoUAC[]> {
  try {
    const sb = await getSupabaseServer();

    const { data: uacRows } = await sb
      .from("uac")
      .select("id, codigo, nombre, total_progresiones")
      .eq("semestre", semestre)
      .order("codigo", { ascending: true });

    if (!uacRows || uacRows.length === 0) return [];

    const results: ProgresoUAC[] = [];

    for (const uac of uacRows) {
      const { data: progresiones } = await sb
        .from("progresiones")
        .select("id, categoria")
        .eq("uac_id", uac.id);

      // Solo cuentan los propósitos oficiales 2025; los complementos no inflan la meta.
      const oficiales = (progresiones ?? []).filter((p) => p.categoria !== CATEGORIA_COMPLEMENTO);
      const progIds = oficiales.map((p) => p.id);
      if (progIds.length === 0) {
        const baseUAC0 = UAC_BASE.find((b) => b.codigo === uac.codigo);
        results.push({
          codigo: uac.codigo,
          nombre: uac.nombre,
          rscCodigo: baseUAC0?.recursoCodigo ?? "RSC-LC",
          completadas: 0,
          total: 0,
          pct: 0,
          ultimaActividad: null,
        });
        continue;
      }

      const { data: actividades } = await sb
        .from("actividades")
        .select("id")
        .in("progresion_id", progIds);

      const actIds = (actividades ?? []).map((a) => a.id);

      const { data: intentos } = await sb
        .from("intentos")
        .select("actividad_id, status, completed_at")
        .eq("user_id", alumnoId)
        .in("actividad_id", actIds)
        .eq("status", "completed");

      const completadasSet = new Set((intentos ?? []).map((i) => i.actividad_id));

      // Count fully completed progressions
      let completadasProg = 0;
      for (const prog of oficiales) {
        const { data: acts } = await sb
          .from("actividades")
          .select("id")
          .eq("progresion_id", prog.id);
        const allActs = (acts ?? []).map((a) => a.id);
        if (allActs.length > 0 && allActs.every((id) => completadasSet.has(id))) {
          completadasProg++;
        }
      }

      const lastIntento = (intentos ?? [])
        .filter((i) => i.completed_at)
        .sort((a, b) => new Date(b.completed_at ?? 0).getTime() - new Date(a.completed_at ?? 0).getTime())[0];

      const baseUAC = UAC_BASE.find((b) => b.codigo === uac.codigo);
      const total = oficiales.length;
      results.push({
        codigo: uac.codigo,
        nombre: uac.nombre,
        rscCodigo: baseUAC?.recursoCodigo ?? "RSC-LC",
        completadas: completadasProg,
        total,
        pct: total > 0 ? Math.round((completadasProg / total) * 100) : 0,
        ultimaActividad: lastIntento?.completed_at ?? null,
      });
    }

    return results;
  } catch {
    return [];
  }
}

// ─── getActividadesRecientes ──────────────────────────────────────────────────

export async function getActividadesRecientes(
  alumnoId: string,
  limit = 15
): Promise<ActividadReciente[]> {
  try {
    const sba: SbAny = await getSupabaseServer();
    const { data } = await sba
      .from("intentos")
      .select(`
        id,
        completed_at,
        actividades!actividad_id (
          id,
          titulo,
          tipo_codigo,
          xp,
          progresiones!progresion_id (
            id,
            uac!uac_id (
              id, codigo, nombre
            )
          )
        )
      `)
      .eq("user_id", alumnoId)
      .eq("status", "completed")
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false })
      .limit(limit);

    if (!data) return [];

    return (data as {
      id: string; completed_at: string | null;
      actividades: { id: string; titulo: string; tipo_codigo: string; xp: number;
        progresiones: { id: string; uac: { id: string; codigo: string; nombre: string } | null } | null;
      } | null;
    }[])
      .filter((i) => i.actividades && i.completed_at)
      .map((i) => {
        const act = i.actividades;
        const uacDb = act?.progresiones?.uac;
        const baseUAC = uacDb ? UAC_BASE.find((b) => b.codigo === uacDb.codigo) : undefined;
        return {
          id: i.id,
          uacNombre: uacDb?.nombre ?? "—",
          uacCodigo: uacDb?.codigo ?? "—",
          rscCodigo: baseUAC?.recursoCodigo ?? "RSC-LC",
          tipo: act?.tipo_codigo ?? "—",
          titulo: act?.titulo ?? "—",
          completadaEn: i.completed_at as string,
          xpGanado: act?.xp ?? 0,
        };
      });
  } catch {
    return [];
  }
}

// ─── getCalendario30Dias ──────────────────────────────────────────────────────

export async function getCalendario30Dias(alumnoId: string): Promise<CalendarioDia[]> {
  try {
    const sb = await getSupabaseServer();

    const dias: CalendarioDia[] = [];
    const hoy = new Date();

    for (let i = 29; i >= 0; i--) {
      const d = new Date(hoy);
      d.setDate(hoy.getDate() - i);
      dias.push({
        fecha: d.toISOString().slice(0, 10),
        activo: false,
        rscCodigo: null,
      });
    }

    const desde = dias[0]?.fecha ?? "";

    const sba: SbAny = sb;
    const { data } = await sba
      .from("intentos")
      .select(`completed_at, actividades!actividad_id ( progresiones!progresion_id ( uac!uac_id ( codigo ) ) )`)
      .eq("user_id", alumnoId)
      .eq("status", "completed")
      .gte("completed_at", desde)
      .not("completed_at", "is", null);

    if (data) {
      const porFecha = new Map<string, string | null>();
      for (const intento of data as { completed_at: string; actividades: { progresiones: { uac: { codigo: string } | null } | null } | null }[]) {
        const fecha = intento.completed_at.slice(0, 10);
        const uacCodigo = intento.actividades?.progresiones?.uac?.codigo ?? null;
        const baseUAC = uacCodigo ? UAC_BASE.find((b) => b.codigo === uacCodigo) : undefined;
        const rsc = baseUAC?.recursoCodigo ?? null;
        if (!porFecha.has(fecha)) porFecha.set(fecha, rsc);
      }
      return dias.map((d) => ({
        ...d,
        activo: porFecha.has(d.fecha),
        rscCodigo: porFecha.get(d.fecha) ?? null,
      }));
    }

    return dias;
  } catch {
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return { fecha: d.toISOString().slice(0, 10), activo: false, rscCodigo: null };
    });
  }
}

// ─── getEstadisticasProgreso ──────────────────────────────────────────────────

export async function getEstadisticasProgreso(
  alumnoId: string
): Promise<EstadisticasProgreso> {
  try {
    const sba2: SbAny = await getSupabaseServer();

    const { data } = await sba2
      .from("intentos")
      .select(`actividades!actividad_id ( tipo_codigo, xp, duracion_estimada_minutos, progresiones!progresion_id ( uac!uac_id ( codigo, nombre ) ) )`)
      .eq("user_id", alumnoId)
      .eq("status", "completed");

    if (!data || (data as unknown[]).length === 0) {
      return { materiaMasFuerte: null, tipoActividades: [], totalXP: 0, totalMinutos: 0, totalActividades: 0 };
    }

    let totalXP = 0;
    let totalMinutos = 0;
    const xpPorUAC = new Map<string, { nombre: string; xp: number }>();
    const conteoTipos = new Map<string, number>();

    for (const intento of data as { actividades: { tipo_codigo: string; xp: number; duracion_estimada_minutos: number | null; progresiones: { uac: { codigo: string; nombre: string } | null } | null } | null }[]) {
      const act = intento.actividades;
      if (!act) continue;

      totalXP += act.xp ?? 0;
      totalMinutos += act.duracion_estimada_minutos ?? 5;
      conteoTipos.set(act.tipo_codigo, (conteoTipos.get(act.tipo_codigo) ?? 0) + 1);

      const uac = act.progresiones?.uac;
      if (uac) {
        const prev = xpPorUAC.get(uac.codigo);
        xpPorUAC.set(uac.codigo, { nombre: uac.nombre, xp: (prev?.xp ?? 0) + (act.xp ?? 0) });
      }
    }

    let materiaMasFuerte: { nombre: string; pct: number } | null = null;
    let maxXP = 0;
    for (const [, val] of xpPorUAC) {
      if (val.xp > maxXP) { maxXP = val.xp; materiaMasFuerte = { nombre: val.nombre, pct: val.xp }; }
    }

    const tipoActividades = [...conteoTipos.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tipo, cantidad]) => ({ tipo, cantidad }));

    return {
      materiaMasFuerte,
      tipoActividades,
      totalXP,
      totalMinutos,
      totalActividades: data.length,
    };
  } catch {
    return { materiaMasFuerte: null, tipoActividades: [], totalXP: 0, totalMinutos: 0, totalActividades: 0 };
  }
}

// ─── getLogros ────────────────────────────────────────────────────────────────
// Lee el catálogo (public.logros), otorga de forma idempotente los logros recién
// alcanzados según métricas YA rastreadas (actividades completadas, XP, racha,
// minutos) y devuelve los desbloqueados por el alumno, en orden de catálogo.
// El otorgamiento corre con la sesión RLS del propio alumno (alumno_id = auth.uid())
// y es idempotente por UNIQUE(alumno_id, logro_id).
// Si las tablas `logros`/`logros_alumno` aún no existen (migración 13 sin aplicar),
// degrada a [] — igual que el resto de funciones de este archivo.

type CriterioTipo = "actividades" | "xp" | "racha" | "minutos";

interface CatalogoLogro {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  criterio_tipo: CriterioTipo;
  criterio_valor: number;
}

export async function getLogros(alumnoId: string): Promise<Logro[]> {
  try {
    const sb: SbAny = await getSupabaseServer();

    // 1) Catálogo activo, en orden.
    const { data: catData, error: catErr } = await sb
      .from("logros")
      .select("id, nombre, descripcion, icono, criterio_tipo, criterio_valor")
      .eq("activo", true)
      .order("orden", { ascending: true });

    if (catErr || !catData || catData.length === 0) return [];
    const catalogo = catData as CatalogoLogro[];

    // 2) Métricas actuales del alumno (intentos completados + racha).
    const [{ data: intentosData }, racha] = await Promise.all([
      sb
        .from("intentos")
        .select("actividades!actividad_id ( xp, duracion_estimada_minutos )")
        .eq("user_id", alumnoId)
        .eq("status", "completed"),
      getRachaDelAlumno(alumnoId),
    ]);

    const intentos = (intentosData ?? []) as {
      actividades: { xp: number | null; duracion_estimada_minutos: number | null } | null;
    }[];

    let totalXP = 0;
    let totalMinutos = 0;
    for (const it of intentos) {
      totalXP += it.actividades?.xp ?? 0;
      totalMinutos += it.actividades?.duracion_estimada_minutos ?? 5;
    }

    const metricas: Record<CriterioTipo, number> = {
      actividades: intentos.length,
      xp: totalXP,
      minutos: totalMinutos,
      racha: racha.diasConsecutivos,
    };

    // 3) Logros ya desbloqueados (id → fecha).
    const { data: unlockedData } = await sb
      .from("logros_alumno")
      .select("logro_id, desbloqueado_en")
      .eq("alumno_id", alumnoId);

    const desbloqueados = new Map<string, string>(
      ((unlockedData ?? []) as { logro_id: string; desbloqueado_en: string }[]).map(
        (r) => [r.logro_id, r.desbloqueado_en] as const
      )
    );

    // 4) Otorgar (idempotente) los recién alcanzados.
    const nuevos = catalogo.filter(
      (l) => !desbloqueados.has(l.id) && metricas[l.criterio_tipo] >= l.criterio_valor
    );
    if (nuevos.length > 0) {
      const { data: insertados } = await sb
        .from("logros_alumno")
        .upsert(
          nuevos.map((l) => ({ alumno_id: alumnoId, logro_id: l.id })),
          { onConflict: "alumno_id,logro_id", ignoreDuplicates: true }
        )
        .select("logro_id, desbloqueado_en");
      for (const r of (insertados ?? []) as { logro_id: string; desbloqueado_en: string }[]) {
        desbloqueados.set(r.logro_id, r.desbloqueado_en);
      }
    }

    // 5) Devolver los desbloqueados, en orden de catálogo.
    return catalogo
      .filter((l) => desbloqueados.has(l.id))
      .map((l) => ({
        id: l.id,
        nombre: l.nombre,
        descripcion: l.descripcion,
        icono: l.icono,
        desbloqueadoEn: desbloqueados.get(l.id) ?? null,
      }));
  } catch {
    return [];
  }
}
