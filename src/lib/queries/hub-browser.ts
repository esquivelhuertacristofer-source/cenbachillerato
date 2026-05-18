/**
 * hub-browser.ts — Browser-client versions of hub queries.
 * Used by Client Component pages ('use client') in the Hub.
 * Mirrors the logic of hub.ts but uses createBrowserClient.
 */

import { createBrowserClient } from "@supabase/ssr";

function getClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export interface HubProfile {
  userId: string;
  fullName: string | null;
  email: string | null;
  semestre: number;
}

/** Returns the current authenticated user's profile, or null if not logged in. */
export async function getCurrentProfile(): Promise<HubProfile | null> {
  const sb = getClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;

  const { data: profile } = await sb
    .from("profiles")
    .select("full_name, email, semestre")
    .eq("id", user.id)
    .single();

  return {
    userId: user.id,
    fullName: profile?.full_name ?? null,
    email: profile?.email ?? user.email ?? null,
    semestre: profile?.semestre ?? 1,
  };
}

export interface UACProgreso {
  completadas: number;
  total: number;
  ultimaActividad: string | null;
}

/** Returns completed/total progresiones count for a single UAC. */
export async function getProgresionesCompletadasDeUAC(
  codigoUAC: string,
  userId: string
): Promise<UACProgreso> {
  const sb = getClient();

  const { data: uacRow } = await sb
    .from("uac")
    .select("id")
    .eq("codigo", codigoUAC)
    .single();

  if (!uacRow) return { completadas: 0, total: 0, ultimaActividad: null };

  const { data: progs } = await sb
    .from("progresiones")
    .select("id")
    .eq("uac_id", uacRow.id)
    .eq("es_placeholder", false);

  const total = progs?.length ?? 0;
  if (total === 0) return { completadas: 0, total: 0, ultimaActividad: null };

  const progIds = (progs ?? []).map((p) => p.id);

  const { data: acts } = await sb
    .from("actividades")
    .select("id, progresion_id")
    .in("progresion_id", progIds);

  const actIds = (acts ?? []).map((a) => a.id);
  if (actIds.length === 0) return { completadas: 0, total, ultimaActividad: null };

  const { data: intentos } = await sb
    .from("intentos")
    .select("actividad_id, status, started_at")
    .eq("user_id", userId)
    .in("actividad_id", actIds)
    .order("started_at", { ascending: false });

  const completedSet = new Set<string>();
  let ultimaActividad: string | null = null;

  for (const i of intentos ?? []) {
    if (!ultimaActividad) ultimaActividad = i.started_at;
    if (i.status === "completed") completedSet.add(i.actividad_id);
  }

  const actsByProg = new Map<string, string[]>();
  for (const a of acts ?? []) {
    if (!actsByProg.has(a.progresion_id!)) actsByProg.set(a.progresion_id!, []);
    actsByProg.get(a.progresion_id!)!.push(a.id);
  }

  let completadas = 0;
  for (const [, actList] of actsByProg) {
    if (actList.every((id) => completedSet.has(id))) completadas++;
  }

  return { completadas, total, ultimaActividad };
}

export interface ProgresionBrowser {
  id: string;
  numero: number;
  titulo: string;
  descripcion: string | null;
  ejes_articuladores: string[] | null;
  estado: "no_iniciada" | "en_progreso" | "completada";
  actividades: Array<{
    orden: number;
    tipo: string;
    estado: "no_iniciada" | "en_progreso" | "completada";
  }>;
}

/** Returns all progresiones for a UAC with status info. */
export async function getProgresionesConEstadoBrowser(
  codigoUAC: string,
  userId: string
): Promise<ProgresionBrowser[]> {
  const sb = getClient();

  const { data: uacRow } = await sb
    .from("uac")
    .select("id")
    .eq("codigo", codigoUAC)
    .single();

  if (!uacRow) return [];

  const { data: progs } = await sb
    .from("progresiones")
    .select("id, numero, titulo, descripcion, ejes_articuladores")
    .eq("uac_id", uacRow.id)
    .eq("es_placeholder", false)
    .order("numero");

  if (!progs || progs.length === 0) return [];

  const progIds = progs.map((p) => p.id);

  const { data: allActs } = await sb
    .from("actividades")
    .select("id, codigo, tipo, progresion_id")
    .in("progresion_id", progIds)
    .order("codigo");

  const allActIds = (allActs ?? []).map((a) => a.id);

  const intentosByActId = new Map<string, "in_progress" | "completed">();
  if (allActIds.length > 0) {
    const { data: intentos } = await sb
      .from("intentos")
      .select("actividad_id, status, started_at")
      .eq("user_id", userId)
      .in("actividad_id", allActIds)
      .order("started_at", { ascending: false });

    for (const i of intentos ?? []) {
      if (!intentosByActId.has(i.actividad_id)) {
        intentosByActId.set(i.actividad_id, i.status as "in_progress" | "completed");
      }
    }
  }

  return progs.map((prog) => {
    const actsForProg = (allActs ?? [])
      .filter((a) => a.progresion_id === prog.id)
      .map((a) => {
        const ordenMatch = a.codigo.match(/-A(\d+)$/);
        const orden = ordenMatch?.[1] ? parseInt(ordenMatch[1]) : 1;
        const status = intentosByActId.get(a.id);
        return {
          orden,
          tipo: a.tipo,
          estado: (status === "completed"
            ? "completada"
            : status === "in_progress"
            ? "en_progreso"
            : "no_iniciada") as "no_iniciada" | "en_progreso" | "completada",
        };
      })
      .sort((a, b) => a.orden - b.orden);

    const totalActs = actsForProg.length;
    const completadas = actsForProg.filter((a) => a.estado === "completada").length;
    const hayEnProgreso = actsForProg.some((a) => a.estado === "en_progreso");

    let estado: "no_iniciada" | "en_progreso" | "completada" = "no_iniciada";
    if (completadas === totalActs && totalActs > 0) estado = "completada";
    else if (completadas > 0 || hayEnProgreso) estado = "en_progreso";

    return {
      id: prog.id,
      numero: prog.numero,
      titulo: prog.titulo,
      descripcion: prog.descripcion,
      ejes_articuladores: prog.ejes_articuladores,
      estado,
      actividades: actsForProg,
    };
  });
}

export interface ProgresoSemestreBrowser {
  totalProgresiones: number;
  progresionesCompletadas: number;
  porcentaje: number;
}

/** Light aggregated progress stats for the hub hero. */
export async function getProgresoSemestreBrowser(
  userId: string,
  semestre: number
): Promise<ProgresoSemestreBrowser> {
  const sb = getClient();

  const { data: uacRows } = await sb
    .from("uac")
    .select("id")
    .eq("semestre", semestre);

  if (!uacRows || uacRows.length === 0)
    return { totalProgresiones: 0, progresionesCompletadas: 0, porcentaje: 0 };

  const uacIds = uacRows.map((u) => u.id);

  const { data: progs } = await sb
    .from("progresiones")
    .select("id")
    .in("uac_id", uacIds)
    .eq("es_placeholder", false);

  const totalProgresiones = progs?.length ?? 0;
  if (totalProgresiones === 0)
    return { totalProgresiones: 0, progresionesCompletadas: 0, porcentaje: 0 };

  const progIds = (progs ?? []).map((p) => p.id);

  const { data: allActs } = await sb
    .from("actividades")
    .select("id, progresion_id")
    .in("progresion_id", progIds);

  const actIds = (allActs ?? []).map((a) => a.id);
  if (actIds.length === 0)
    return { totalProgresiones, progresionesCompletadas: 0, porcentaje: 0 };

  const { data: completedIntentos } = await sb
    .from("intentos")
    .select("actividad_id")
    .eq("user_id", userId)
    .eq("status", "completed")
    .in("actividad_id", actIds);

  const completedActIds = new Set(completedIntentos?.map((i) => i.actividad_id) ?? []);

  const actsByProg = new Map<string, string[]>();
  for (const act of allActs ?? []) {
    if (!actsByProg.has(act.progresion_id!)) actsByProg.set(act.progresion_id!, []);
    actsByProg.get(act.progresion_id!)!.push(act.id);
  }

  let progresionesCompletadas = 0;
  for (const [, acts] of actsByProg) {
    if (acts.every((id) => completedActIds.has(id))) progresionesCompletadas++;
  }

  const porcentaje =
    totalProgresiones > 0
      ? Math.round((progresionesCompletadas / totalProgresiones) * 100)
      : 0;

  return { totalProgresiones, progresionesCompletadas, porcentaje };
}
