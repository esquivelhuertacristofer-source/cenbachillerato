import { notFound, redirect } from "next/navigation";
import { getUser, getProfile } from "@/lib/supabase-helpers";
import { UACCard } from "@/components/hub/UACCard";
import { UAC_BASE } from "@/lib/mccems/estructura";
import { RECURSOS_SOCIOCOGNITIVOS } from "@/lib/mccems/recursos-sociocognitivos";
import { AREAS_CONOCIMIENTO } from "@/lib/mccems/areas-conocimiento";
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

  const profile = await getProfile(user.id);
  if (!profile) redirect("/log-in");

  const uacSemestre = UAC_BASE.filter((uac) => uac.semestre === semestre);
  const uacFundamental = uacSemestre.filter((uac) => uac.recursoCodigo !== undefined);
  const uacArea = uacSemestre.filter((uac) => uac.areaCodigo !== undefined);

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
          UAC del Currículum Fundamental y Fundamental Extendido
        </p>
      </div>

      {/* Recursos Sociocognitivos */}
      {uacFundamental.length > 0 && (
        <section>
          <div className="mb-2 inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
            Currículum Fundamental
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            Recursos Sociocognitivos
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {uacFundamental.map((uac) => {
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

      {/* Áreas de Conocimiento */}
      {uacArea.length > 0 && (
        <section>
          <div className="mb-2 inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
            Currículum Fundamental Extendido
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            Área de Conocimiento{" "}
            {profile.area_eleccion ? `· ${profile.area_eleccion}` : "(por definir)"}
          </h2>

          {!profile.area_eleccion && (
            <div className="mb-4 mt-2 rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-700">
              Aún no tienes un área de conocimiento asignada. Contacta al administrador de tu
              institución para que configure tu área.
            </div>
          )}

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {uacArea
              .filter(
                (uac) =>
                  !profile.area_eleccion ||
                  AREAS_CONOCIMIENTO.find(
                    (a) =>
                      a.codigo === uac.areaCodigo &&
                      (profile.area_eleccion === "ciencias-sociales"
                        ? a.codigo === "AC-CS"
                        : profile.area_eleccion === "ciencias-naturales-mate"
                        ? a.codigo === "AC-CNT"
                        : a.codigo === "AC-HUM")
                  )
              )
              .map((uac) => {
                const area = AREAS_CONOCIMIENTO.find(
                  (a) => a.codigo === uac.areaCodigo
                );
                return (
                  <UACCard
                    key={uac.codigo}
                    codigo={uac.codigo}
                    nombre={uac.nombre}
                    icono={area?.icono ?? "🔭"}
                    colorClass="bg-purple-100 text-purple-700"
                    totalProgresiones={uac.totalProgresionesEsperadas}
                    semestre={semestre}
                    tipo="area"
                  />
                );
              })}
          </div>
        </section>
      )}
    </div>
  );
}
