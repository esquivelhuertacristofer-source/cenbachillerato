/**
 * progreso-shared.ts — Lógica PURA de las estadísticas de progreso del alumno.
 *
 * Aquí viven los tipos y las funciones de derivación (deriveRecientes,
 * deriveCalendario, deriveStats, etc.) que NO dependen de si el cliente de
 * Supabase es de servidor o de navegador. Los consumen tanto progreso.ts
 * (Server Components / RSC) como hub-browser.ts (Client Components), para que
 * el cálculo tenga UNA sola fuente de verdad y no derive entre las dos rutas.
 *
 * Este módulo no importa NADA de servidor (sin getSupabaseServer), así que es
 * seguro incluirlo en el bundle del cliente.
 */

import { UAC_BASE } from "@/lib/mccems/estructura";

// El cliente de Supabase (server o browser) se pasa como parámetro; su forma
// tipada completa no aporta aquí, así que se trata como `any` acotado a los
// pocos métodos que se usan (`.from().select()...`).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SbAny = any;

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

// Solo lo que la lista de "Actividades recientes" pinta de verdad: el chip usa
// el CÓDIGO de la UAC (no el nombre) y el color sale de rscCodigo vía UAC_BASE.
export interface ActividadReciente {
  id: string;
  uacCodigo: string;
  rscCodigo: string;
  tipo: string;
  titulo: string;
  completadaEn: string;
}

export interface EstadisticasProgreso {
  materiaMasFuerte: { nombre: string; cantidad: number } | null;
  tipoActividades: { tipo: string; cantidad: number }[];
  totalMinutos: number;
  totalActividades: number;
}

export interface CalendarioDia {
  fecha: string;
  activo: boolean;
  rscCodigo: string | null;
}

export interface ResumenActividadAlumno {
  recientes: ActividadReciente[];
  calendario: CalendarioDia[];
  stats: EstadisticasProgreso;
}

// Filas acotadas: cada consulta trae SOLO las columnas que su vista consume
// (sin UUIDs anidados ni campos decorativos — cada byte cuenta para el egress).

export interface IntentoRecienteRow {
  id: string;
  completed_at: string | null;
  actividades: {
    titulo: string;
    tipo_codigo: string;
    progresiones: {
      uac: { codigo: string } | null;
    } | null;
  } | null;
}

export interface IntentoCalendarioRow {
  completed_at: string | null;
  actividades: {
    progresiones: {
      uac: { codigo: string } | null;
    } | null;
  } | null;
}

// Solo para el fallback legacy (RPC aún no aplicada): réplica del select viejo
// pero sin los UUIDs anidados que nadie usaba.
export interface IntentoStatsRow {
  completed_at: string | null;
  actividades: {
    tipo_codigo: string;
    duracion_estimada_minutos: number | null;
    progresiones: {
      uac: { codigo: string; nombre: string } | null;
    } | null;
  } | null;
}

// ─── Vacíos ─────────────────────────────────────────────────────────────────

export function statsVacias(): EstadisticasProgreso {
  return { materiaMasFuerte: null, tipoActividades: [], totalMinutos: 0, totalActividades: 0 };
}

export function calendarioVacio(): CalendarioDia[] {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return { fecha: d.toISOString().slice(0, 10), activo: false, rscCodigo: null };
  });
}

/**
 * Fecha (YYYY-MM-DD, en UTC) del PRIMER día de la ventana de 30 días del
 * heatmap. Mismo cómputo que deriveCalendario (setDate local → toISOString),
 * para que el .gte() del servidor y el corte en memoria coincidan exactamente.
 */
export function fechaInicioVentana30Dias(): string {
  const d = new Date();
  d.setDate(d.getDate() - 29);
  return d.toISOString().slice(0, 10);
}

// ─── Derivaciones ─────────────────────────────────────────────────────────────

export function deriveRecientes(rows: IntentoRecienteRow[]): ActividadReciente[] {
  return rows.map((i) => {
    const act = i.actividades!;
    const uacDb = act.progresiones?.uac;
    const baseUAC = uacDb ? UAC_BASE.find((b) => b.codigo === uacDb.codigo) : undefined;
    return {
      id: i.id,
      uacCodigo: uacDb?.codigo ?? "—",
      rscCodigo: baseUAC?.recursoCodigo ?? "RSC-LC",
      tipo: act.tipo_codigo ?? "—",
      titulo: act.titulo ?? "—",
      completadaEn: i.completed_at as string,
    };
  });
}

export function deriveCalendario(rows: IntentoCalendarioRow[]): CalendarioDia[] {
  const dias: CalendarioDia[] = [];
  const hoy = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() - i);
    dias.push({ fecha: d.toISOString().slice(0, 10), activo: false, rscCodigo: null });
  }
  const desde = dias[0]?.fecha ?? "";

  // Las filas llegan en orden completed_at DESC: el color del día lo decide el
  // intento MÁS RECIENTE de ese día (primera aparición gana, como siempre).
  const porFecha = new Map<string, string | null>();
  for (const intento of rows) {
    const fecha = (intento.completed_at as string).slice(0, 10);
    if (fecha < desde) continue; // fuera de la ventana de 30 días
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

// Cálculo legacy en memoria — HOY solo lo usa el fallback statsLegacyEnMemoria;
// la fuente normal de stats es la RPC resumen_stats_alumno, que replica estas
// fórmulas en SQL (incluidos los desempates por "más reciente": las filas
// llegan en completed_at DESC y el `>` estricto deja ganar a la 1.ª aparición).
export function deriveStats(rows: IntentoStatsRow[]): EstadisticasProgreso {
  if (rows.length === 0) return statsVacias();

  let totalMinutos = 0;
  const conteoPorUAC = new Map<string, { nombre: string; cantidad: number }>();
  const conteoTipos = new Map<string, number>();

  for (const intento of rows) {
    const act = intento.actividades;
    if (!act) continue;

    totalMinutos += act.duracion_estimada_minutos ?? 5;
    conteoTipos.set(act.tipo_codigo, (conteoTipos.get(act.tipo_codigo) ?? 0) + 1);

    const uac = act.progresiones?.uac;
    if (uac) {
      const prev = conteoPorUAC.get(uac.codigo);
      conteoPorUAC.set(uac.codigo, { nombre: uac.nombre, cantidad: (prev?.cantidad ?? 0) + 1 });
    }
  }

  let materiaMasFuerte: { nombre: string; cantidad: number } | null = null;
  let maxCantidad = 0;
  for (const [, val] of conteoPorUAC) {
    if (val.cantidad > maxCantidad) { maxCantidad = val.cantidad; materiaMasFuerte = { nombre: val.nombre, cantidad: val.cantidad }; }
  }

  const tipoActividades = [...conteoTipos.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tipo, cantidad]) => ({ tipo, cantidad }));

  return { materiaMasFuerte, tipoActividades, totalMinutos, totalActividades: rows.length };
}

// ── RPC de stats + fallback de despliegue ────────────────────────────────────

// PGRST202: PostgREST no encuentra la función en su schema cache (la migración
// aún no se aplicó, o falta `NOTIFY pgrst, 'reload schema'`). 42883:
// undefined_function de Postgres. El regex cubre variantes del mensaje entre
// versiones de PostgREST.
export function esRpcInexistente(
  error: { code?: string; message?: string } | null | undefined
): boolean {
  if (!error) return false;
  if (error.code === "PGRST202" || error.code === "42883") return true;
  const msg = error.message ?? "";
  return /function/i.test(msg) && /could not find|does not exist/i.test(msg);
}

// Lo que devuelve la RPC (claves construidas en SQL con jsonb_build_object).
export type StatsRpcPayload = {
  totalMinutos?: number | null;
  totalActividades?: number | null;
  materiaMasFuerte?: { nombre: string; cantidad: number } | null;
  tipoActividades?: { tipo: string; cantidad: number }[] | null;
};

/** Blinda la forma del jsonb de la RPC (por si llegara parcial o nulo). */
export function normalizarStatsRpc(d: StatsRpcPayload): EstadisticasProgreso {
  return {
    materiaMasFuerte: d.materiaMasFuerte ?? null,
    tipoActividades: Array.isArray(d.tipoActividades) ? d.tipoActividades : [],
    totalMinutos: typeof d.totalMinutos === "number" ? d.totalMinutos : 0,
    totalActividades: typeof d.totalActividades === "number" ? d.totalActividades : 0,
  };
}

/**
 * Fallback de despliegue: baja el historial completo (como el código antiguo,
 * pero solo con las columnas de stats) y deriva los agregados en memoria.
 * Solo se usa mientras la migración 23 no esté aplicada en la BD. El cliente
 * (server o browser) se recibe por parámetro; la RLS de `intentos` limita las
 * filas al propio alumno en ambas rutas.
 */
export async function statsLegacyEnMemoria(sba: SbAny, alumnoId: string): Promise<EstadisticasProgreso> {
  const { data } = await sba
    .from("intentos")
    .select(`
      completed_at,
      actividades!actividad_id!inner (
        tipo_codigo,
        duracion_estimada_minutos,
        progresiones!progresion_id (
          uac!uac_id ( codigo, nombre )
        )
      )
    `)
    .eq("user_id", alumnoId)
    .eq("status", "completed")
    .not("completed_at", "is", null)
    // El orden DESC importa: los desempates de deriveStats dependen de él.
    .order("completed_at", { ascending: false });

  const rows = ((data ?? []) as IntentoStatsRow[]).filter((i) => i.actividades && i.completed_at);
  return deriveStats(rows);
}
