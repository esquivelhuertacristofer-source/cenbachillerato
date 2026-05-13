import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/supabase-helpers";
import { UACCard } from "@/components/hub/UACCard";
import { UAC_BASE } from "@/lib/mccems/estructura";
import { RECURSOS_SOCIOCOGNITIVOS } from "@/lib/mccems/recursos-sociocognitivos";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ num: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { num } = await params;
  return { title: `Semestre ${num} — CEN Bachillerato` };
}

export default async function SemestrePage({ params }: Props) {
  const { num } = await params;
  const semestre = parseInt(num, 10);

  if (isNaN(semestre) || semestre < 1 || semestre > 6) notFound();

  const user = await getUser();
  if (!user) redirect("/log-in");

  const uacSemestre = UAC_BASE.filter((uac) => uac.semestre === semestre);

  return (
    <div className="space-y-8">
      <div>
        <nav className="mb-2 flex items-center gap-2 text-sm text-gray-400">
          <a href="/hub" className="hover:text-gray-600">Mi Hub</a>
          <span>/</span>
          <span className="text-gray-700">Semestre {semestre}</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Semestre {semestre}</h1>
        <p className="mt-1 text-gray-500">
          Unidades de Aprendizaje Curricular — Currículum Fundamental
        </p>
      </div>

      {/* UAC del semestre */}
      {uacSemestre.length > 0 && (
        <section>
          <div className="mb-2 inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
            Currículum Fundamental
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            Recursos Sociocognitivos
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {uacSemestre.map((uac) => {
              const recurso = RECURSOS_SOCIOCOGNITIVOS.find(
                (r) => r.codigo === uac.recursoCodigo
              );
              return (
                <UACCard
                  key={uac.codigo}
                  codigo={uac.codigo}
                  nombre={uac.nombre}
                  icono={recurso?.icono ?? "📚"}
                  colorClass={`${recurso?.color ?? "bg-indigo-100"} bg-opacity-15 text-gray-700`}
                  totalProgresiones={uac.totalProgresionesEsperadas}
                  semestre={semestre}
                  tipo="sociocognitivo"
                />
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
