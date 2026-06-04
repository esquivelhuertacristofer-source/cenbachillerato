import { notFound, redirect } from "next/navigation";
import { getUser, getProfile } from "@/lib/supabase-helpers";
import { getUACPorCodigo } from "@/lib/mccems/estructura";
import { getActividadConContenido } from "@/lib/queries/hub";
import { getRSCColor } from "@/components/hub/hub-colors";
import { PracticaRunner } from "@/components/practicas/PracticaRunner";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ codigo: string; id: string; orden: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { codigo, id, orden } = await params;
  const uac = getUACPorCodigo(codigo);
  return {
    title: uac
      ? `Práctica experimental · A${orden} · P${id} · ${uac.nombre} — CEN Bachillerato`
      : "Práctica experimental — CEN Bachillerato",
  };
}

export default async function PracticaPage({ params }: Props) {
  const { codigo, id, orden } = await params;
  const progNum = parseInt(id, 10);
  const ordenNum = parseInt(orden, 10);

  const user = await getUser();
  if (!user) redirect("/log-in");

  const profile = await getProfile(user.id);
  if (!profile) redirect("/log-in");

  const uac = getUACPorCodigo(codigo);
  if (!uac) notFound();

  if (isNaN(progNum) || isNaN(ordenNum)) notFound();

  const actividad = await getActividadConContenido(codigo, progNum, ordenNum, user.id);
  if (!actividad) notFound();

  // Sin práctica experimental asociada → no hay sección que mostrar.
  if (!actividad.practica_slug) notFound();

  const color = getRSCColor(uac.recursoCodigo ?? null);

  return (
    <PracticaRunner
      slug={actividad.practica_slug}
      color={color}
      backHref={`/hub/uac/${codigo}/progresion/${progNum}/actividad/${ordenNum}`}
      uacNombre={uac.nombre}
      uacCodigo={codigo}
      progresionNum={progNum}
      ordenNum={ordenNum}
      actividadCodigo={actividad.codigo}
      actividadTitulo={actividad.titulo}
    />
  );
}
