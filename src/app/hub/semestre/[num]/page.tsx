import { notFound, redirect } from "next/navigation";
import { getUser, getProfile } from "@/lib/supabase-helpers";
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

  const profile = await getProfile(user.id);
  if (!profile) redirect("/log-in");

  const miSemestre = profile.semestre ?? 1;
  const esExploracion = miSemestre !== semestre;

  const uacSemestre = UAC_BASE.filter((uac) => uac.semestre === semestre);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 1100 }}>

      {esExploracion && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
          background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 14,
          padding: '12px 16px',
        }}>
          <i className="fa-solid fa-compass" style={{ fontSize: 16, color: '#B45309' }} />
          <span style={{ fontSize: 13, color: '#92400E', fontWeight: 600, flex: 1, minWidth: 200 }}>
            Estás explorando el {semestre}.º semestre. Tu semestre es el {miSemestre}.º — aquí no se guarda tu progreso.
          </span>
          <a href="/hub" style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: '#0B2545', color: '#fff', textDecoration: 'none',
            borderRadius: 999, padding: '8px 16px', fontSize: 12.5, fontWeight: 700,
            whiteSpace: 'nowrap',
          }}>
            <i className="fa-solid fa-arrow-left" style={{ fontSize: 10 }} />
            Volver a mi hub
          </a>
        </div>
      )}

      <div>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(11,37,69,0.45)', marginBottom: 12 }}>
          <a href="/hub" style={{ color: 'rgba(11,37,69,0.45)', textDecoration: 'none' }}>Mi Hub</a>
          <i className="fa-solid fa-chevron-right" style={{ fontSize: 9 }} />
          <span style={{ color: '#0B2545', fontWeight: 600 }}>Semestre {semestre}</span>
        </nav>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0B2545', letterSpacing: '-0.03em', margin: '0 0 4px' }}>
          Semestre {semestre}
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(11,37,69,0.55)', margin: 0 }}>
          Unidades de Aprendizaje Curricular — Currículum Fundamental
        </p>
      </div>

      {uacSemestre.length > 0 && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{
              borderRadius: 999,
              background: '#DBEAFE',
              padding: '4px 14px',
              fontSize: 11,
              fontWeight: 700,
              color: '#1E40AF',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}>
              Currículum Fundamental
            </span>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0B2545', margin: 0 }}>
              Recursos Sociocognitivos
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
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
