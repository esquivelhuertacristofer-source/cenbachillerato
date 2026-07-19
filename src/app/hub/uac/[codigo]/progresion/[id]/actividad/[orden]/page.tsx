import { notFound, redirect } from "next/navigation";
import { getUser, getProfile } from "@/lib/supabase-helpers";
import { getUACPorCodigo } from "@/lib/mccems/estructura";
import { getActividadConContenido, getActividadesConEstado } from "@/lib/queries/hub";
import { getRSCColor } from "@/components/hub/hub-colors";
import { ActivityRunner } from "@/components/hub/ActivityRunner";
import { extraerGlosarioPresente } from "@/lib/glosario/extraer";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ codigo: string; id: string; orden: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { codigo, id, orden } = await params;
  const uac = getUACPorCodigo(codigo);
  return {
    title: uac
      ? `Actividad ${orden} · P${id} · ${uac.nombre} — CEN Bachillerato`
      : "Actividad — CEN Bachillerato",
  };
}

export default async function ActividadPage({ params }: Props) {
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

  const [{ actividades: actividadesProg }, actividad] = await Promise.all([
    getActividadesConEstado(codigo, progNum, user.id),
    getActividadConContenido(codigo, progNum, ordenNum, user.id),
  ]);

  if (!actividad) notFound();

  const color = getRSCColor(uac.recursoCodigo ?? null);

  const LABELS = ["Activación", "Práctica", "Aplicación"];
  const phaseLabel = LABELS[ordenNum - 1] ?? `Actividad ${ordenNum}`;

  // Glosario de la materia presente en la prosa (solo lecturas). Se calcula en
  // el servidor para no enviar el diccionario completo al cliente: sólo viaja
  // el pequeño subconjunto {t,d}[] de términos que realmente aparecen.
  const glosario =
    actividad.tipo === "lectura"
      ? extraerGlosarioPresente(
          codigo,
          (actividad.contenido as { texto?: string } | null)?.texto ?? "",
        )
      : [];

  return (
    <ActivityRunner
      actividadId={actividad.id}
      tipo={actividad.tipo}
      titulo={actividad.titulo}
      descripcion={actividad.descripcion}
      contenido={actividad.contenido}
      estado={actividad.estado}
      intentoId={actividad.intentoId}
      respuestasIntento={actividad.respuestasIntento}
      nivel_revision={actividad.nivel_revision}
      color={color}
      backHref={`/hub/uac/${codigo}/progresion/${progNum}`}
      uacNombre={uac.nombre}
      uacCodigo={codigo}
      progresionNum={progNum}
      ordenNum={ordenNum}
      phaseLabel={phaseLabel}
      glosario={glosario}
      actividadesProg={actividadesProg}
      practicaHref={
        actividad.practica_slug
          ? `/hub/uac/${codigo}/progresion/${progNum}/actividad/${ordenNum}/practica`
          : null
      }
    />
  );
}
