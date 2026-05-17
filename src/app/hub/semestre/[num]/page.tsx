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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 1100 }}>

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
