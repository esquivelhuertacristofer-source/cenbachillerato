import { redirect } from "next/navigation";
import Link from "next/link";
import { getUser, getProfile } from "@/lib/supabase-helpers";
import { getAlumnosDelDocente } from "@/lib/queries/docente";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Alumnos — Dashboard Docente | CEN Bachillerato",
};

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span style={{ color: 'rgba(11,37,69,0.35)', fontSize: 13 }}>—</span>;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <span style={{
      fontSize: 13, fontWeight: 700, color,
      background: `${color}18`, padding: '2px 10px', borderRadius: 999,
    }}>
      {score}
    </span>
  );
}

function timeAgo(iso: string | null): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Ayer';
  if (days < 7) return `Hace ${days} días`;
  return `Hace ${Math.floor(days / 7)} sem.`;
}

export default async function AlumnosPage() {
  const user = await getUser();
  if (!user) redirect("/log-in");
  const profile = await getProfile(user.id);
  if (!profile || profile.role === "student") redirect("/hub");

  const alumnos = await getAlumnosDelDocente(user.id);

  const grupos = [...new Set(alumnos.map((a) => a.grupo_nombre))].sort();

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#1E40AF', marginBottom: 8 }}>
          <i className="fa-solid fa-circle" style={{ fontSize: 8, color: '#10b981', marginRight: 6 }} />
          Docente · Alumnos
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0B2545', letterSpacing: '-0.03em', margin: 0 }}>
          Alumnos
        </h1>
        <p style={{ fontSize: 15, color: 'rgba(11,37,69,0.60)', marginTop: 6 }}>
          {alumnos.length === 0
            ? 'No tienes alumnos asignados todavía.'
            : `${alumnos.length} alumno${alumnos.length > 1 ? 's' : ''} en ${grupos.length} grupo${grupos.length > 1 ? 's' : ''}`}
        </p>
      </div>

      {alumnos.length === 0 ? (
        <div style={{
          background: '#fff', border: '2px dashed rgba(11,37,69,0.14)',
          borderRadius: 24, padding: '80px 32px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        }}>
          <i className="fa-solid fa-users" style={{ fontSize: 48, color: 'rgba(11,37,69,0.14)', marginBottom: 20 }} />
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0B2545', marginBottom: 8 }}>Sin alumnos</h2>
          <p style={{ fontSize: 15, color: 'rgba(11,37,69,0.55)', maxWidth: 420, lineHeight: 1.65 }}>
            Cuando el administrador asigne alumnos a tus grupos, aparecerán aquí.
          </p>
        </div>
      ) : (
        <>
          {/* Grupos summary */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
            {grupos.map((g) => {
              const count = alumnos.filter((a) => a.grupo_nombre === g).length;
              return (
                <div key={g} style={{
                  background: '#EFF6FF', borderRadius: 999,
                  padding: '6px 14px', fontSize: 13, fontWeight: 600, color: '#1E40AF',
                }}>
                  {g} · {count} alumno{count !== 1 ? 's' : ''}
                </div>
              );
            })}
          </div>

          {/* Tabla */}
          <div style={{ background: '#fff', border: '1px solid rgba(11,37,69,0.10)', borderRadius: 20, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(11,37,69,0.03)' }}>
                    {['Alumno', 'Grupo', 'Sem.', 'Completadas', 'Score avg', 'Último acceso', ''].map((h) => (
                      <th key={h} style={{
                        padding: '14px 16px', textAlign: 'left',
                        fontSize: 11, fontWeight: 700, color: 'rgba(11,37,69,0.50)',
                        textTransform: 'uppercase', letterSpacing: '0.08em',
                        borderBottom: '1px solid rgba(11,37,69,0.08)',
                        whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {alumnos.map((a) => (
                    <tr
                      key={a.id}
                      style={{ borderBottom: '1px solid rgba(11,37,69,0.06)', transition: 'background 0.1s ease' }}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: 999,
                            background: '#EFF6FF', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 700, color: '#1E40AF',
                          }}>
                            {(a.full_name ?? a.email).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#0B2545' }}>{a.full_name ?? '—'}</div>
                            <div style={{ fontSize: 12, color: 'rgba(11,37,69,0.50)' }}>{a.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'rgba(11,37,69,0.65)', fontWeight: 500 }}>{a.grupo_nombre}</td>
                      <td style={{ padding: '14px 16px', color: 'rgba(11,37,69,0.65)' }}>{a.semestre}°</td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: a.actividades_completadas > 0 ? '#0B2545' : 'rgba(11,37,69,0.35)' }}>
                        {a.actividades_completadas}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <ScoreBadge score={a.score_promedio} />
                      </td>
                      <td style={{ padding: '14px 16px', color: 'rgba(11,37,69,0.55)', fontSize: 13 }}>
                        {timeAgo(a.ultimo_intento)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <Link
                          href={`/dashboard/docente/alumnos/${a.id}`}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            color: '#1E40AF', fontSize: 12, fontWeight: 600, textDecoration: 'none',
                            padding: '5px 12px', borderRadius: 999, background: 'rgba(30,64,175,0.08)',
                          }}
                        >
                          Ver <i className="fa-solid fa-chevron-right" style={{ fontSize: 10 }} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
