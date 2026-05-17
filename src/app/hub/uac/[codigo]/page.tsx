import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/supabase-helpers";
import { getProgresionesDeUAC } from "@/lib/queries/uac";
import { getUACPorCodigo } from "@/lib/mccems/estructura";
import { RECURSOS_SOCIOCOGNITIVOS } from "@/lib/mccems/recursos-sociocognitivos";
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

  const progresiones = await getProgresionesDeUAC(codigo);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 860 }}>

      {/* Breadcrumb */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(11,37,69,0.45)' }}>
        <Link href="/hub" style={{ color: 'rgba(11,37,69,0.45)', textDecoration: 'none' }}>Mi Hub</Link>
        <i className="fa-solid fa-chevron-right" style={{ fontSize: 9 }} />
        <Link href={`/hub/semestre/${uac.semestre}`} style={{ color: 'rgba(11,37,69,0.45)', textDecoration: 'none' }}>
          Semestre {uac.semestre}
        </Link>
        <i className="fa-solid fa-chevron-right" style={{ fontSize: 9 }} />
        <span style={{ color: '#0B2545', fontWeight: 600 }}>{uac.nombre}</span>
      </nav>

      {/* Header UAC */}
      <div style={{
        borderRadius: 20,
        border: '1px solid rgba(11,37,69,0.10)',
        background: '#fff',
        padding: 28,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 20,
      }}>
        <div style={{
          width: 56, height: 56,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 16,
          background: '#DBEAFE',
          fontSize: 26,
          flexShrink: 0,
        }}>
          {recurso?.icono ?? "📚"}
        </div>
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
            {recurso && (
              <span style={{
                borderRadius: 999,
                background: '#DBEAFE',
                padding: '3px 12px',
                fontSize: 11,
                fontWeight: 700,
                color: '#1E40AF',
                letterSpacing: '0.04em',
              }}>
                {recurso.nombre}
              </span>
            )}
            <span style={{
              borderRadius: 999,
              background: 'rgba(11,37,69,0.07)',
              padding: '3px 12px',
              fontSize: 11,
              fontWeight: 600,
              color: 'rgba(11,37,69,0.50)',
            }}>
              Semestre {uac.semestre}
            </span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0B2545', letterSpacing: '-0.02em', margin: '0 0 6px' }}>
            {uac.nombre}
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(11,37,69,0.55)', margin: 0 }}>
            {progresiones.length > 0
              ? `${progresiones.length} progresiones de aprendizaje`
              : `${uac.totalProgresionesEsperadas} progresiones esperadas — contenido en preparación`}
          </p>
        </div>
      </div>

      {/* Lista de progresiones */}
      <div>
        <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0B2545', letterSpacing: '-0.02em', marginBottom: 14 }}>
          Progresiones de Aprendizaje
        </h2>

        {progresiones.length === 0 ? (
          <div style={{
            borderRadius: 20,
            border: '2px dashed rgba(11,37,69,0.14)',
            background: '#fff',
            padding: '48px 32px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}>
            <i className="fa-solid fa-hammer" style={{ fontSize: 36, color: 'rgba(11,37,69,0.14)', marginBottom: 16 }} />
            <p style={{ fontSize: 15, fontWeight: 700, color: '#0B2545', margin: '0 0 4px' }}>Contenido en preparación</p>
            <p style={{ fontSize: 13, color: 'rgba(11,37,69,0.50)', margin: 0 }}>
              Las progresiones de esta UAC se publicarán próximamente.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {progresiones.map((prog) => (
              <Link
                key={prog.id}
                href={`/hub/uac/${codigo}/progresion/${prog.numero}`}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  borderRadius: 14,
                  border: '1px solid rgba(11,37,69,0.10)',
                  background: '#fff',
                  padding: 16,
                  transition: 'border-color 0.2s ease, background 0.2s ease',
                  cursor: 'pointer',
                }}>
                  <div style={{
                    width: 36, height: 36,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '50%',
                    background: '#DBEAFE',
                    fontSize: 13,
                    fontWeight: 800,
                    color: '#1E40AF',
                    flexShrink: 0,
                  }}>
                    {prog.numero}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#0B2545', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {prog.titulo}
                    </p>
                    {prog.descripcion && (
                      <p style={{ fontSize: 12, color: 'rgba(11,37,69,0.50)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {prog.descripcion}
                      </p>
                    )}
                  </div>
                  <i className="fa-solid fa-chevron-right" style={{ fontSize: 12, color: 'rgba(11,37,69,0.25)', flexShrink: 0 }} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
