/**
 * Biblioteca queries — fichas pedagógicas del alumno.
 * Requiere migración 05_biblioteca.sql ejecutada en Supabase.
 * Si la tabla no existe, las funciones devuelven arrays vacíos / null.
 */

import { getSupabaseServer } from "@/lib/supabase-helpers";
import { UAC_BASE } from "@/lib/mccems/estructura";

// fichas_biblioteca y fichas_lecturas no están en el schema tipado hasta que
// se ejecute 05_biblioteca.sql — se usa any para esas tablas únicamente.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SbAny = any;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SeccionContenido {
  tipo: "parrafo" | "imagen" | "callout" | "lista" | "cita" | "subtitulo";
  contenido?: string;
  url?: string;
  alt?: string;
  caption?: string;
  variante?: "importante" | "sabias" | "advertencia";
  items?: string[];
  fuente?: string;
  nivel?: 2 | 3;
}

export interface FichaResumen {
  id: string;
  slug: string;
  titulo: string;
  categoria: string | null;
  imagen_destacada: string | null;
  tiempo_lectura_minutos: number;
  es_placeholder: boolean;
  orden: number;
  leida: boolean;
}

export interface FichaCompleta extends FichaResumen {
  contenido: { secciones: SeccionContenido[] };
  conceptos_clave: string[];
  fichas_relacionadas: string[];
  uac_id: string;
}

export interface FichasPorUAC {
  uacCodigo: string;
  uacNombre: string;
  uacRscCodigo: string;
  fichas: FichaResumen[];
}

type FichaRow = {
  id: string; slug: string; titulo: string; categoria: string | null;
  imagen_destacada: string | null; tiempo_lectura_minutos: number;
  es_placeholder: boolean; orden: number;
};

type FichaRowWithUAC = FichaRow & { uac_id: string };

// ─── getFichasBibliotecaUAC ───────────────────────────────────────────────────

export async function getFichasBibliotecaUAC(
  uacCodigo: string,
  alumnoId: string
): Promise<FichaResumen[]> {
  try {
    const sb = await getSupabaseServer();
    const sba: SbAny = sb;

    const { data: uac } = await sb
      .from("uac")
      .select("id")
      .eq("codigo", uacCodigo)
      .single();

    if (!uac) return [];

    const { data: fichas } = await sba
      .from("fichas_biblioteca")
      .select("id, slug, titulo, categoria, imagen_destacada, tiempo_lectura_minutos, es_placeholder, orden")
      .eq("uac_id", uac.id)
      .order("orden", { ascending: true });

    if (!fichas || (fichas as unknown[]).length === 0) return [];

    const fichaIds = (fichas as FichaRow[]).map((f) => f.id);
    const { data: lecturas } = await sba
      .from("fichas_lecturas")
      .select("ficha_id")
      .eq("alumno_id", alumnoId)
      .in("ficha_id", fichaIds);

    const leidasSet = new Set(((lecturas ?? []) as { ficha_id: string }[]).map((l) => l.ficha_id));
    return (fichas as FichaRow[]).map((f) => ({ ...f, leida: leidasSet.has(f.id) }));
  } catch {
    return [];
  }
}

// ─── getFichasBibliotecaTodasUAC ─────────────────────────────────────────────

export async function getFichasBibliotecaTodasUAC(
  uacCodigos: string[],
  alumnoId: string
): Promise<FichasPorUAC[]> {
  try {
    const sb = await getSupabaseServer();
    const sba: SbAny = sb;

    const { data: uacRows } = await sb
      .from("uac")
      .select("id, codigo, nombre, semestre")
      .in("codigo", uacCodigos)
      .order("semestre", { ascending: true });

    if (!uacRows || uacRows.length === 0) return [];

    const uacIds = uacRows.map((u) => u.id);

    const { data: fichas } = await sba
      .from("fichas_biblioteca")
      .select("id, slug, titulo, categoria, imagen_destacada, tiempo_lectura_minutos, es_placeholder, orden, uac_id")
      .in("uac_id", uacIds)
      .order("orden", { ascending: true });

    if (!fichas || (fichas as unknown[]).length === 0) {
      return uacRows.map((u) => {
        const base = UAC_BASE.find((b) => b.codigo === u.codigo);
        return { uacCodigo: u.codigo, uacNombre: u.nombre, uacRscCodigo: base?.recursoCodigo ?? "RSC-LC", fichas: [] };
      });
    }

    const fichaIds = (fichas as FichaRowWithUAC[]).map((f) => f.id);
    const { data: lecturas } = await sba
      .from("fichas_lecturas")
      .select("ficha_id")
      .eq("alumno_id", alumnoId)
      .in("ficha_id", fichaIds);

    const leidasSet = new Set(((lecturas ?? []) as { ficha_id: string }[]).map((l) => l.ficha_id));

    return uacRows.map((u) => {
      const base = UAC_BASE.find((b) => b.codigo === u.codigo);
      return {
        uacCodigo: u.codigo,
        uacNombre: u.nombre,
        uacRscCodigo: base?.recursoCodigo ?? "RSC-LC",
        fichas: (fichas as FichaRowWithUAC[])
          .filter((f) => f.uac_id === u.id)
          .map((f) => ({ ...f, leida: leidasSet.has(f.id) })),
      };
    });
  } catch {
    return [];
  }
}

// ─── getFichaBiblioteca ───────────────────────────────────────────────────────

export async function getFichaBiblioteca(
  slug: string,
  alumnoId: string
): Promise<FichaCompleta | null> {
  try {
    const sb = await getSupabaseServer();
    const sba: SbAny = sb;

    const { data } = await sba
      .from("fichas_biblioteca")
      .select("id, slug, titulo, categoria, imagen_destacada, contenido, conceptos_clave, fichas_relacionadas, tiempo_lectura_minutos, es_placeholder, orden, uac_id")
      .eq("slug", slug)
      .single();

    if (!data) return null;

    const { data: lectura } = await sba
      .from("fichas_lecturas")
      .select("id")
      .eq("alumno_id", alumnoId)
      .eq("ficha_id", data.id)
      .maybeSingle();

    return {
      id: data.id,
      slug: data.slug,
      titulo: data.titulo,
      categoria: data.categoria,
      imagen_destacada: data.imagen_destacada,
      contenido: (data.contenido as { secciones: SeccionContenido[] }) ?? { secciones: [] },
      conceptos_clave: (data.conceptos_clave as string[]) ?? [],
      fichas_relacionadas: (data.fichas_relacionadas as string[]) ?? [],
      tiempo_lectura_minutos: data.tiempo_lectura_minutos,
      es_placeholder: data.es_placeholder,
      orden: data.orden,
      uac_id: data.uac_id,
      leida: !!lectura,
    };
  } catch {
    return null;
  }
}

// ─── marcarFichaLeida ─────────────────────────────────────────────────────────

export async function marcarFichaLeida(fichaId: string, alumnoId: string): Promise<void> {
  try {
    const sba: SbAny = await getSupabaseServer();
    await sba.from("fichas_lecturas").upsert(
      { alumno_id: alumnoId, ficha_id: fichaId, ultima_lectura: new Date().toISOString() },
      { onConflict: "alumno_id,ficha_id", ignoreDuplicates: false }
    );
  } catch (e) {
    // No bloquea la lectura si falla (p. ej. tabla ausente o RLS): la ficha se
    // muestra igual. Se registra para no perder el error de vista (RLS mal
    // configurada devuelve 0 filas SIN lanzar, pero un fallo de red/permiso sí).
    console.error("[biblioteca] marcarFichaLeida falló:", e);
  }
}

// ─── buscarFichasBiblioteca ───────────────────────────────────────────────────

export async function buscarFichasBiblioteca(
  query: string,
  uacCodigos: string[],
  alumnoId: string
): Promise<FichaResumen[]> {
  if (!query.trim()) return [];
  try {
    const sb = await getSupabaseServer();
    const sba: SbAny = sb;

    const { data: uacRows } = await sb
      .from("uac")
      .select("id")
      .in("codigo", uacCodigos);

    if (!uacRows || uacRows.length === 0) return [];

    const uacIds = uacRows.map((u) => u.id);

    const { data } = await sba
      .from("fichas_biblioteca")
      .select("id, slug, titulo, categoria, imagen_destacada, tiempo_lectura_minutos, es_placeholder, orden")
      .in("uac_id", uacIds)
      .ilike("titulo", `%${query}%`)
      .order("orden", { ascending: true })
      .limit(30);

    if (!data || (data as unknown[]).length === 0) return [];

    const fichaIds = (data as FichaRow[]).map((f) => f.id);
    const { data: lecturas } = await sba
      .from("fichas_lecturas")
      .select("ficha_id")
      .eq("alumno_id", alumnoId)
      .in("ficha_id", fichaIds);

    const leidasSet = new Set(((lecturas ?? []) as { ficha_id: string }[]).map((l) => l.ficha_id));
    return (data as FichaRow[]).map((f) => ({ ...f, leida: leidasSet.has(f.id) }));
  } catch {
    return [];
  }
}
