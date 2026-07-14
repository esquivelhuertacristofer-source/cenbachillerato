import { getSupabaseServer } from "@/lib/supabase-helpers";
import { getRSCColor, getTipoConfig } from "@/components/hub/hub-colors";
import { getUACPorCodigo } from "@/lib/mccems/estructura";

export interface BuscarResultado {
  actividadId: string;
  actividadTitulo: string;
  actividadTipo: string;
  actividadCodigo: string;
  orden: number;
  progresionNumero: number;
  progresionTitulo: string;
  uacCodigo: string;
  uacNombre: string;
  href: string;
  accentHex: string;
  accentRgba: string;
  tipoIcono: string;
  tipoLabel: string;
}

export async function buscarActividades(q: string): Promise<BuscarResultado[]> {
  const trimmed = q.trim();
  if (trimmed.length < 2) return [];

  const sb = await getSupabaseServer();

  const { data: acts } = await sb
    .from("actividades")
    .select("id, codigo, titulo, tipo, progresion_id")
    .ilike("titulo", `%${trimmed}%`)
    .neq("nivel_revision", "borrador")
    .limit(30);

  if (!acts?.length) return [];

  const progIds = [...new Set(acts.map((a) => a.progresion_id).filter((x): x is string => x != null))];
  const { data: progs } = await sb
    .from("progresiones")
    .select("id, numero, titulo, uac_id")
    .in("id", progIds);
  if (!progs?.length) return [];

  const uacIds = [...new Set(progs.map((p) => p.uac_id).filter((x): x is string => x != null))];
  const { data: uacRows } = await sb
    .from("uac")
    .select("id, codigo, nombre")
    .in("id", uacIds);
  if (!uacRows?.length) return [];

  const progMap = new Map(progs.map((p) => [p.id, p]));
  const uacMap = new Map(uacRows.map((u) => [u.id, u]));

  return acts.flatMap((act) => {
    const prog = progMap.get(act.progresion_id ?? "");
    if (!prog) return [];
    const uac = uacMap.get(prog.uac_id ?? "");
    if (!uac) return [];
    const ordenMatch = act.codigo.match(/-A(\d+)$/);
    const orden = ordenMatch?.[1] ? parseInt(ordenMatch[1], 10) : 1;
    const color = getRSCColor(getUACPorCodigo(uac.codigo)?.recursoCodigo ?? null);
    const tc = getTipoConfig(act.tipo);
    return [
      {
        actividadId: act.id,
        actividadTitulo: act.titulo,
        actividadTipo: act.tipo,
        actividadCodigo: act.codigo,
        orden,
        progresionNumero: prog.numero,
        progresionTitulo: prog.titulo,
        uacCodigo: uac.codigo,
        uacNombre: uac.nombre,
        href: `/hub/uac/${uac.codigo}/progresion/${prog.numero}/actividad/${orden}`,
        accentHex: color.hex,
        accentRgba: color.rgba,
        tipoIcono: tc.faIcon,
        tipoLabel: tc.label,
      },
    ];
  });
}
