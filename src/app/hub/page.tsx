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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 1100 }}>

      {/* Saludo */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#1E40AF', marginBottom: 8 }}>
          <i className="fa-solid fa-circle" style={{ fontSize: 8, color: '#10b981', marginRight: 6 }} />
          Sesión activa
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0B2545', letterSpacing: '-0.03em', margin: '0 0 4px' }}>
          Hola, {nombre}
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(11,37,69,0.55)', margin: 0 }}>
          Semestre {semestreActual}
          {profile.area_eleccion ? ` · ${profile.area_eleccion}` : ""}
        </p>
      </div>

      {/* Banner de próximo contenido */}
      <div style={{
        borderRadius: 16,
        border: '1px solid rgba(30,64,175,0.15)',
        background: '#EFF6FF',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 16,
      }}>
        <i className="fa-solid fa-hammer" style={{ fontSize: 22, color: '#1E40AF', marginTop: 2, flexShrink: 0 }} />
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0B2545', margin: '0 0 4px' }}>
            Contenido pedagógico en desarrollo
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(11,37,69,0.65)', margin: 0, lineHeight: 1.6 }}>
            La estructura curricular MCCEMS está cargada. Las actividades y
            progresiones de aprendizaje se publicarán próximamente. Por ahora
            puedes explorar la organización por semestre y UAC.
          </p>
        </div>
      </div>

      {/* UAC del semestre actual */}
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0B2545', letterSpacing: '-0.02em', marginBottom: 16 }}>
          Tus UAC — Semestre {semestreActual}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
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
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0B2545', letterSpacing: '-0.02em', marginBottom: 16 }}>
          Ámbitos de Formación Socioemocional
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {RECURSOS_SOCIOEMOCIONALES.map((rse) => (
            <div
              key={rse.codigo}
              style={{
                borderRadius: 14,
                border: '1px solid rgba(11,37,69,0.10)',
                background: '#fff',
                padding: '16px 20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <i className="fa-solid fa-seedling" style={{ fontSize: 14, color: '#1E40AF' }} />
                <p style={{ fontSize: 13, fontWeight: 700, color: '#0B2545', margin: 0 }}>{rse.nombre}</p>
              </div>
              <p style={{ fontSize: 12, color: 'rgba(11,37,69,0.55)', margin: '0 0 10px', lineHeight: 1.5 }}>
                {rse.descripcion}
              </p>
              <span style={{
                display: 'inline-block',
                borderRadius: 999,
                background: 'rgba(11,37,69,0.07)',
                padding: '2px 10px',
                fontSize: 11,
                fontWeight: 600,
                color: 'rgba(11,37,69,0.50)',
              }}>
                Transversal
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
