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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 860 }}>

      {/* Breadcrumb */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(11,37,69,0.45)' }}>
        <Link href="/hub" style={{ color: 'rgba(11,37,69,0.45)', textDecoration: 'none' }}>Mi Hub</Link>
        <i className="fa-solid fa-chevron-right" style={{ fontSize: 9 }} />
        <Link href={`/hub/semestre/${uac.semestre}`} style={{ color: 'rgba(11,37,69,0.45)', textDecoration: 'none' }}>
          Semestre {uac.semestre}
        </Link>
        <i className="fa-solid fa-chevron-right" style={{ fontSize: 9 }} />
        <Link href={`/hub/uac/${codigo}`} style={{ color: 'rgba(11,37,69,0.45)', textDecoration: 'none' }}>
          {uac.nombre}
        </Link>
        <i className="fa-solid fa-chevron-right" style={{ fontSize: 9 }} />
        <span style={{ color: '#0B2545', fontWeight: 600 }}>Progresión {num}</span>
      </nav>

      {/* Placeholder de actividades */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 24,
        border: '2px dashed rgba(11,37,69,0.14)',
        background: '#fff',
        padding: '80px 32px',
        textAlign: 'center',
      }}>
        <i className="fa-solid fa-hammer" style={{ fontSize: 44, color: 'rgba(11,37,69,0.14)', marginBottom: 24 }} />
        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0B2545', letterSpacing: '-0.02em', margin: '0 0 12px' }}>
          Progresión {num} · {uac.nombre}
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(11,37,69,0.55)', maxWidth: 480, lineHeight: 1.65, margin: '0 0 28px' }}>
          Las actividades pedagógicas para esta progresión están en desarrollo.
          Próximamente encontrarás aquí contenido alineado al programa oficial del MCCEMS.
        </p>

        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          borderRadius: 999,
          background: '#FFF7ED',
          border: '1px solid rgba(251,146,60,0.25)',
          padding: '6px 18px',
          fontSize: 13,
          fontWeight: 700,
          color: '#C2410C',
          marginBottom: 32,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#FB923C', display: 'inline-block' }} />
          Próximamente
        </span>

        <div style={{ display: 'flex', gap: 12 }}>
          <Link
            href={`/hub/uac/${codigo}`}
            style={{
              borderRadius: 999,
              border: '1px solid rgba(11,37,69,0.15)',
              padding: '10px 22px',
              fontSize: 13,
              fontWeight: 700,
              color: '#0B2545',
              textDecoration: 'none',
              background: '#fff',
            }}
          >
            <i className="fa-solid fa-arrow-left" style={{ marginRight: 6 }} />
            Volver a {uac.nombre}
          </Link>
          {num < uac.totalProgresionesEsperadas && (
            <Link
              href={`/hub/uac/${codigo}/progresion/${num + 1}`}
              style={{
                borderRadius: 999,
                background: '#0B2545',
                padding: '10px 22px',
                fontSize: 13,
                fontWeight: 700,
                color: '#fff',
                textDecoration: 'none',
              }}
            >
              Siguiente progresión
              <i className="fa-solid fa-arrow-right" style={{ marginLeft: 6 }} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
