import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getUser, getProfile } from "@/lib/supabase-helpers";
import { getUACPorCodigo } from "@/lib/mccems/estructura";
import { getRSCColor } from "@/components/hub/hub-colors";
import { PRACTICAS_META } from "@/components/practicas/registry-meta";
import { LAB_UBICACION } from "@/lib/practicas/lab-ubicacion.generated";
import { nombreLab } from "@/lib/practicas/lab-catalogo";
import { PracticaRunner } from "@/components/practicas/PracticaRunner";

/**
 * Un laboratorio, abierto por su propio nombre.
 *
 * La otra ruta —/hub/uac/…/actividad/…/practica— abre el laboratorio que cuelga
 * de una actividad, y es la que usa el alumno cuando va siguiendo su progresión.
 * Ésta abre CUALQUIER laboratorio del registro, tenga o no una actividad que lo
 * apunte todavía. Sin ella, un laboratorio escrito y registrado no lo ve nadie
 * hasta que alguien lo engancha en la base, y así estaban 70 de 211.
 *
 * El progreso no se pierde ni se duplica: cada laboratorio guarda sus estrellas
 * con una clave propia (RETO_KEY), no con el código de la actividad, así que da
 * lo mismo por qué puerta se entre.
 */

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = PRACTICAS_META[slug];
  return { title: meta ? `${nombreLab(slug)} — CEN Bachillerato` : "Laboratorio — CEN Bachillerato" };
}

export default async function LaboratorioPage({ params }: Props) {
  const { slug } = await params;

  const user = await getUser();
  if (!user) redirect("/log-in");
  const profile = await getProfile(user.id);
  if (!profile) redirect("/log-in");

  const meta = PRACTICAS_META[slug];
  if (!meta) notFound();

  const ubic = LAB_UBICACION[slug];
  const uac = ubic?.uacCodigo ? getUACPorCodigo(ubic.uacCodigo) : undefined;
  const color = getRSCColor(uac?.recursoCodigo ?? null);

  return (
    <PracticaRunner
      slug={slug}
      color={color}
      backHref="/hub/recursos/laboratorios"
      uacNombre={uac?.nombre ?? "Laboratorios"}
      uacCodigo={ubic?.uacCodigo ?? "LAB"}
      progresionNum={0}
      ordenNum={0}
      actividadCodigo={ubic?.actividadCodigo ?? `LAB-${slug}`}
      actividadTitulo={nombreLab(slug)}
    />
  );
}
