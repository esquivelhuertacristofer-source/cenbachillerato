import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/supabase-helpers";
import { ProgresionPlaceholder } from "@/components/hub/ProgresionPlaceholder";
import { getUACPorCodigo } from "@/lib/mccems/estructura";
import { RECURSOS_SOCIOCOGNITIVOS } from "@/lib/mccems/recursos-sociocognitivos";
import { AREAS_CONOCIMIENTO } from "@/lib/mccems/areas-conocimiento";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ codigo: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { codigo } = await params;
  const uac = getUACPorCodigo(codigo);
  return {
    title: uac ? `${uac.nombre} — CEN Bachillerato` : "UAC — CEN Bachillerato",
  };
}

export default async function UACPage({ params }: Props) {
  const { codigo } = await params;

  const user = await getUser();
  if (!user) redirect("/log-in");

  const uac = getUACPorCodigo(codigo);
  if (!uac) notFound();

  const recurso = uac.recursoCodigo
    ? RECURSOS_SOCIOCOGNITIVOS.find((r) => r.codigo === uac.recursoCodigo)
    : undefined;
  const area = uac.areaCodigo
    ? AREAS_CONOCIMIENTO.find((a) => a.codigo === uac.areaCodigo)
    : undefined;

  const progresiones = Array.from(
    { length: uac.totalProgresionesEsperadas },
    (_, i) => ({
      numero: i + 1,
      titulo: `Progresión ${i + 1} — ${uac.nombre}`,
    })
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/hub" className="hover:text-gray-600">
          Mi Hub
        </Link>
        <span>/</span>
        <Link
          href={`/hub/semestre/${uac.semestre}`}
          className="hover:text-gray-600"
        >
          Semestre {uac.semestre}
        </Link>
        <span>/</span>
        <span className="text-gray-700">{uac.nombre}</span>
      </nav>

      {/* Header UAC */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-2xl">
            {recurso?.icono ?? area?.icono ?? "📚"}
          </div>
          <div>
            <div className="flex flex-wrap gap-2">
              {recurso && (
                <span className="rounded-full bg-indigo-100 px-3 py-0.5 text-xs font-medium text-indigo-700">
                  Recurso Sociocognitivo
                </span>
              )}
              {area && (
                <span className="rounded-full bg-purple-100 px-3 py-0.5 text-xs font-medium text-purple-700">
                  Área de Conocimiento
                </span>
              )}
              <span className="rounded-full bg-gray-100 px-3 py-0.5 text-xs text-gray-600">
                Semestre {uac.semestre}
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">{uac.nombre}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {uac.totalProgresionesEsperadas} progresiones de aprendizaje
            </p>
          </div>
        </div>
      </div>

      {/* Lista de progresiones */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Progresiones de Aprendizaje
        </h2>

        <div className="space-y-3">
          {progresiones.map((prog) => (
            <Link
              key={prog.numero}
              href={`/hub/uac/${codigo}/progresion/${prog.numero}`}
            >
              <ProgresionPlaceholder
                numero={prog.numero}
                titulo={prog.titulo}
                uacNombre={uac.nombre}
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
