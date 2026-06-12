import { notFound, redirect } from "next/navigation";
import { getUser, getProfile } from "@/lib/supabase-helpers";
import { getUACPorCodigo } from "@/lib/mccems/estructura";
import { getActividadesConEstado, getSiguienteProgresion } from "@/lib/queries/hub";
import { getRSCColor } from "@/components/hub/hub-colors";
import { ProgresionClient } from "@/components/hub-v2/ProgresionClient";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ codigo: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { codigo, id } = await params;
  const uac = getUACPorCodigo(codigo);
  return {
    title: uac
      ? `Propósito formativo ${id} · ${uac.nombre} — CEN Bachillerato`
      : "Propósito formativo — CEN Bachillerato",
  };
}

export default async function ProgresionPage({ params }: Props) {
  const { codigo, id } = await params;
  const numParsed = parseInt(id, 10);

  const user = await getUser();
  if (!user) redirect("/log-in");

  const profile = await getProfile(user.id);
  if (!profile) redirect("/log-in");

  const uac = getUACPorCodigo(codigo);
  if (!uac) notFound();

  if (isNaN(numParsed)) notFound();

  const { progresion, actividades } = await getActividadesConEstado(codigo, numParsed, user.id);
  if (!progresion) notFound();

  const color = getRSCColor(uac.recursoCodigo ?? null);
  const siguiente = await getSiguienteProgresion(codigo, numParsed);

  return (
    <ProgresionClient
      uacNombre={uac.nombre}
      uacCodigo={codigo}
      progresion={progresion}
      actividades={actividades}
      color={color}
      numParsed={numParsed}
      siguiente={siguiente}
    />
  );
}
