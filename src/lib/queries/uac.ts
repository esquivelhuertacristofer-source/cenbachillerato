import { getSupabaseServer } from "@/lib/supabase-helpers";
import type { Progresion } from "@/types/domain.types";

export async function getProgresionesDeUAC(codigoUAC: string): Promise<Progresion[]> {
  const sb = await getSupabaseServer();

  const { data: uacRow } = await sb
    .from("uac")
    .select("id")
    .eq("codigo", codigoUAC)
    .single();

  if (!uacRow) return [];

  const { data } = await sb
    .from("progresiones")
    .select("*")
    .eq("uac_id", uacRow.id)
    .order("numero");

  return (data as Progresion[]) ?? [];
}

export async function getUACIdPorCodigo(codigo: string): Promise<string | null> {
  const sb = await getSupabaseServer();
  const { data } = await sb.from("uac").select("id").eq("codigo", codigo).single();
  return data?.id ?? null;
}
