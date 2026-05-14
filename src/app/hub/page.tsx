import { redirect } from "next/navigation";
import { getUser, getProfile } from "@/lib/supabase-helpers";
import { UACCard } from "@/components/hub/UACCard";
import {
  UAC_BASE,
  RECURSOS_SOCIOEMOCIONALES,
} from "@/lib/mccems/estructura";
import { RECURSOS_SOCIOCOGNITIVOS } from "@/lib/mccems/recursos-sociocognitivos";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mi Hub — CEN Bachillerato",
};

export default async function HubPage() {
  const user = await getUser();
  if (!user) redirect("/log-in");

  const profile = await getProfile(user.id);
  if (!profile) redirect("/log-in");

  const semestreActual = profile.semestre ?? 1;
  const uacDelSemestre = UAC_BASE.filter(
    (uac) => uac.semestre === semestreActual
  );

  const nombre = profile.full_name?.split(" ")[0] ?? "Alumno";

  return (
    <div className="space-y-8">
      {/* Saludo */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-cen-navy">
          Hola, {nombre}
        </h1>
        <p className="mt-1 text-sm text-ink-60">
          Semestre {semestreActual}
          {profile.area_eleccion ? ` · ${profile.area_eleccion}` : ""}
        </p>
      </div>

      {/* Banner de próximo contenido */}
      <div className="rounded-2xl border border-cen-blue-soft bg-cen-cool p-5">
        <div className="flex items-start gap-4">
          <span className="text-2xl">🏗️</span>
          <div>
            <h2 className="font-bold text-cen-navy">
              Contenido pedagógico en desarrollo
            </h2>
            <p className="mt-1 text-sm text-ink-60">
              La estructura curricular MCCEMS está cargada. Las actividades y
              progresiones de aprendizaje se publicarán próximamente. Por ahora
              puedes explorar la organización por semestre y UAC.
            </p>
          </div>
        </div>
      </div>

      {/* UAC del semestre actual */}
      <div>
        <h2 className="mb-6 text-lg font-black uppercase tracking-tight text-cen-navy">
          Tus UAC — Semestre {semestreActual}
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {uacDelSemestre.map((uac) => {
            const recurso = uac.recursoCodigo
              ? RECURSOS_SOCIOCOGNITIVOS.find((r) => r.codigo === uac.recursoCodigo)
              : undefined;

            return (
              <UACCard
                key={uac.codigo}
                codigo={uac.codigo}
                nombre={uac.nombre}
                icono={recurso?.icono ?? "📚"}
                colorClass={
                  recurso
                    ? `${recurso.color} bg-opacity-10 text-gray-700`
                    : "bg-purple-100 text-purple-700"
                }
                totalProgresiones={uac.totalProgresionesEsperadas}
                semestre={semestreActual}
                tipo="sociocognitivo"
              />
            );
          })}
        </div>
      </div>

      {/* Recursos Socioemocionales */}
      <div>
        <h2 className="mb-4 text-lg font-black uppercase tracking-tight text-cen-navy">
          Ámbitos de Formación Socioemocional
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {RECURSOS_SOCIOEMOCIONALES.map((rse) => (
            <div
              key={rse.codigo}
              className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4"
            >
              <p className="font-bold text-emerald-900">{rse.nombre}</p>
              <p className="mt-1 text-xs text-emerald-700">{rse.descripcion}</p>
              <span className="mt-2 inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.15em] text-emerald-600">
                Transversal
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
