import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/supabase-helpers";
import { getUACPorCodigo } from "@/lib/mccems/estructura";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ codigo: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { codigo, id } = await params;
  const uac = getUACPorCodigo(codigo);
  return {
    title: uac
      ? `Progresión ${id} · ${uac.nombre} — CEN Bachillerato`
      : "Progresión — CEN Bachillerato",
  };
}

export default async function ProgresionPage({ params }: Props) {
  const { codigo, id } = await params;

  const user = await getUser();
  if (!user) redirect("/log-in");

  const uac = getUACPorCodigo(codigo);
  if (!uac) notFound();

  const num = parseInt(id, 10);
  if (isNaN(num) || num < 1 || num > uac.totalProgresionesEsperadas) notFound();

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/hub" className="hover:text-gray-600">Mi Hub</Link>
        <span>/</span>
        <Link href={`/hub/semestre/${uac.semestre}`} className="hover:text-gray-600">
          Semestre {uac.semestre}
        </Link>
        <span>/</span>
        <Link href={`/hub/uac/${codigo}`} className="hover:text-gray-600">
          {uac.nombre}
        </Link>
        <span>/</span>
        <span className="text-gray-700">Progresión {num}</span>
      </nav>

      {/* Placeholder de actividades */}
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-24 text-center">
        <div className="text-5xl">🏗️</div>
        <h1 className="mt-6 text-xl font-bold text-gray-900">
          Progresión {num} · {uac.nombre}
        </h1>
        <p className="mt-3 max-w-md text-gray-500">
          Las actividades pedagógicas para esta progresión están en desarrollo.
          Próximamente encontrarás aquí contenido alineado al programa oficial del MCCEMS.
        </p>

        <div className="mt-8 flex items-center gap-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Próximamente
          </span>
        </div>

        <div className="mt-10 flex gap-4">
          <Link
            href={`/hub/uac/${codigo}`}
            className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            ← Volver a {uac.nombre}
          </Link>
          {num < uac.totalProgresionesEsperadas && (
            <Link
              href={`/hub/uac/${codigo}/progresion/${num + 1}`}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Siguiente progresión →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
