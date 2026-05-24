import { redirect } from "next/navigation";
import Link from "next/link";
import { getUser, getProfile } from "@/lib/supabase-helpers";
import { getGruposDocente } from "@/lib/queries/docente";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mis grupos — Dashboard Docente | CEN Bachillerato",
};

const SEM_COLOR: Record<number, string> = {
  1: '#6366f1', 2: '#8b5cf6', 3: '#06b6d4',
  4: '#10b981', 5: '#f59e0b', 6: '#ef4444',
};

export default async function GruposPage() {
  const user = await getUser();
  if (!user) redirect("/log-in");
  const profile = await getProfile(user.id);
  if (!profile || profile.role === "student") redirect("/hub");

  const grupos = await getGruposDocente(user.id);

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#1E40AF', marginBottom: 8 }}>
          <i className="fa-solid fa-circle" style={{ fontSize: 8, color: '#10b981', marginRight: 6 }} />
          Docente · Mis grupos
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0B2545', letterSpacing: '-0.03em', margin: 0 }}>
          Mis grupos
        </h1>
        <p style={{ fontSize: 15, color: 'rgba(11,37,69,0.60)', marginTop: 6 }}>
          {grupos.length === 0
            ? 'No tienes grupos asignados todavía.'
            : `${grupos.length} grupo${grupos.length > 1 ? 's' : ''} asignado${grupos.length > 1 ? 's' : ''}`}
        </p>
      </div>

      {grupos.length === 0 ? (
        <div style={{
          background: '#fff', border: '2px dashed rgba(11,37,69,0.14)',
          borderRadius: 24, padding: '80px 32px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        }}>
          <i className="fa-solid fa-users-rectangle" style={{ fontSize: 48, color: 'rgba(11,37,69,0.14)', marginBottom: 20 }} />
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0B2545', marginBottom: 8 }}>Sin grupos asignados</h2>
          <p style={{ fontSize: 15, color: 'rgba(11,37,69,0.55)', maxWidth: 420, lineHeight: 1.65 }}>
            El administrador debe asignarte a un grupo desde el panel de administración.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {grupos.map((g) => (
            <Link
              key={g.id}
              href={`/dashboard/docente/grupos/${g.id}`}
              style={{ textDecoration: 'none' }}
            >
              <div
                style={{
                  background: '#fff',
                  border: '1px solid rgba(11,37,69,0.10)',
                  borderRadius: 20,
                  padding: '28px 32px',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(11,37,69,0.12)';
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(11,37,69,0.20)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(11,37,69,0.10)';
                }}
              >
                {/* Semestre badge */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: SEM_COLOR[g.semestre] ?? '#6366f1',
                  color: '#fff', borderRadius: 999,
                  padding: '4px 12px', fontSize: 12, fontWeight: 700,
                  marginBottom: 16, letterSpacing: '0.04em',
                }}>
                  <i className="fa-solid fa-layer-group" style={{ fontSize: 10 }} />
                  Semestre {g.semestre}
                </div>

                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0B2545', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                  {g.nombre}
                </h2>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(11,37,69,0.65)', fontSize: 14 }}>
                    <i className="fa-solid fa-user-graduate" style={{ color: '#1E40AF', fontSize: 13 }} />
                    <span><strong style={{ color: '#0B2545' }}>{g.total_alumnos}</strong> alumno{g.total_alumnos !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                {/* Arrow */}
                <div style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)' }}>
                  <i className="fa-solid fa-chevron-right" style={{ color: 'rgba(11,37,69,0.25)', fontSize: 14 }} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Quick link to planteamiento */}
      {grupos.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <Link href="/dashboard/docente/planteamiento" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#0B2545', color: '#7DD3FC',
            padding: '12px 24px', borderRadius: 999, textDecoration: 'none',
            fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em',
            transition: 'opacity 0.15s ease',
          }}>
            <i className="fa-solid fa-map" />
            Ver planteamiento académico
          </Link>
        </div>
      )}
    </main>
  );
}
