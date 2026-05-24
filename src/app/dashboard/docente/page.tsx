import { redirect } from "next/navigation";
import Link from "next/link";
import { getUser, getProfile } from "@/lib/supabase-helpers";
import {
  getMetricasDocente,
  getIntentosRecientesDocente,
} from "@/lib/queries/docente";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Docente — CEN Bachillerato",
};

const STATUS_CFG: Record<string, { color: string; label: string; icon: string }> = {
  completed: { color: '#10b981', label: 'Completado', icon: 'fa-solid fa-circle-check' },
  in_progress: { color: '#f59e0b', label: 'En progreso', icon: 'fa-solid fa-clock' },
  failed: { color: '#ef4444', label: 'Fallido', icon: 'fa-solid fa-circle-xmark' },
  abandoned: { color: '#94a3b8', label: 'Abandonado', icon: 'fa-regular fa-circle' },
};

function timeAgo(iso: string | null): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (hours < 1) return 'Hace unos minutos';
  if (hours < 24) return `Hace ${hours}h`;
  if (days === 1) return 'Ayer';
  if (days < 7) return `Hace ${days} días`;
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

export default async function DocenteDashboardPage() {
  const user = await getUser();
  if (!user) redirect("/log-in");

  const profile = await getProfile(user.id);
  if (!profile) redirect("/log-in");

  if (profile.role === "student") redirect("/hub");
  if (profile.role === "admin" || profile.role === "super_admin") redirect("/admin/escuelas");

  const nombre = profile.full_name?.split(" ")[0] ?? "Docente";

  const [metricas, intentosRecientes] = await Promise.all([
    getMetricasDocente(user.id),
    getIntentosRecientesDocente(user.id, 8),
  ]);

  const metricCards = [
    { label: "Alumnos activos", valor: String(metricas.totalAlumnos), icon: "fa-solid fa-users", color: '#7DD3FC' },
    { label: "Grupos asignados", valor: String(metricas.totalGrupos), icon: "fa-solid fa-school", color: '#7DD3FC' },
    { label: "Semestres en curso", valor: String(metricas.uacEnCurso), icon: "fa-solid fa-layer-group", color: '#7DD3FC' },
    { label: "Planteamiento", valor: "Ver →", icon: "fa-solid fa-map", color: '#7DD3FC' },
  ];

  const quickLinks = [
    { href: '/dashboard/docente/grupos', icon: 'fa-solid fa-users-rectangle', title: 'Mis grupos', desc: 'Ver alumnos y progreso por grupo' },
    { href: '/dashboard/docente/planteamiento', icon: 'fa-solid fa-map', title: 'Planteamiento', desc: 'Avance curricular MCCEMS por UAC' },
    { href: '/dashboard/docente/alumnos', icon: 'fa-solid fa-user-graduate', title: 'Alumnos', desc: 'Historial de actividades individual' },
  ];

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 64px' }}>

      {/* Welcome */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#1E40AF', marginBottom: 8 }}>
          <i className="fa-solid fa-circle" style={{ fontSize: 8, color: '#10b981', marginRight: 6 }} />
          Sesión activa
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0B2545', letterSpacing: '-0.03em', margin: 0 }}>
          Bienvenido, {nombre}
        </h1>
        <p style={{ fontSize: 15, color: 'rgba(11,37,69,0.60)', marginTop: 6 }}>
          Panel de seguimiento académico · MCCEMS Bachillerato
        </p>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        {metricCards.map((metric) => (
          <div key={metric.label} style={{
            background: '#0B2545',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 20,
            padding: '24px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}>
            <i className={metric.icon} style={{ fontSize: 22, color: metric.color }} />
            <div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>
                {metric.valor}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.60)', marginTop: 4 }}>
                {metric.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 24, marginBottom: 24 }}>
        {/* Quick links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {quickLinks.map((ql) => (
            <Link key={ql.href} href={ql.href} style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#fff', border: '1px solid rgba(11,37,69,0.10)',
                borderRadius: 18, padding: '20px 24px',
                display: 'flex', alignItems: 'center', gap: 16,
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
              }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(30,64,175,0.25)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(11,37,69,0.08)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(11,37,69,0.10)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: '#EFF6FF', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <i className={ql.icon} style={{ fontSize: 18, color: '#1E40AF' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0B2545' }}>{ql.title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(11,37,69,0.50)', marginTop: 2 }}>{ql.desc}</div>
                </div>
                <i className="fa-solid fa-chevron-right" style={{ fontSize: 12, color: 'rgba(11,37,69,0.25)' }} />
              </div>
            </Link>
          ))}
        </div>

        {/* Activity feed */}
        <div style={{ background: '#fff', border: '1px solid rgba(11,37,69,0.10)', borderRadius: 20, padding: '24px 28px' }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0B2545', marginBottom: 18, letterSpacing: '-0.02em' }}>
            <i className="fa-solid fa-bolt" style={{ color: '#1E40AF', marginRight: 8, fontSize: 14 }} />
            Actividad reciente
          </h2>

          {intentosRecientes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(11,37,69,0.40)' }}>
              <i className="fa-regular fa-clock" style={{ fontSize: 28, marginBottom: 10, display: 'block' }} />
              <p style={{ fontSize: 13, margin: 0 }}>Aún no hay actividad registrada.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {intentosRecientes.map((intento) => {
                const cfg = STATUS_CFG[intento.status] ?? STATUS_CFG.in_progress!;
                return (
                  <div key={intento.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 0',
                    borderBottom: '1px solid rgba(11,37,69,0.05)',
                  }}>
                    <i className={cfg.icon} style={{ fontSize: 14, color: cfg.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0B2545', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {intento.alumno_nombre ?? intento.alumno_email}
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(11,37,69,0.50)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {intento.actividad_titulo}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {intento.score !== null && (
                        <div style={{
                          fontSize: 13, fontWeight: 700,
                          color: intento.score >= 80 ? '#10b981' : intento.score >= 60 ? '#f59e0b' : '#ef4444',
                        }}>
                          {intento.score}/100
                        </div>
                      )}
                      <div style={{ fontSize: 11, color: 'rgba(11,37,69,0.40)' }}>
                        {timeAgo(intento.completed_at ?? intento.started_at)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Grupos table */}
      {metricas.grupos.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid rgba(11,37,69,0.10)', borderRadius: 20, padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0B2545', letterSpacing: '-0.02em', margin: 0 }}>
              <i className="fa-solid fa-users-rectangle" style={{ color: '#1E40AF', marginRight: 10 }} />
              Mis grupos
            </h2>
            <Link href="/dashboard/docente/grupos" style={{
              fontSize: 12, fontWeight: 700, color: '#1E40AF', textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              Ver todos <i className="fa-solid fa-chevron-right" style={{ fontSize: 10 }} />
            </Link>
          </div>
          <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(11,37,69,0.08)' }}>
                <th style={{ padding: '0 0 12px', textAlign: 'left', fontWeight: 700, color: 'rgba(11,37,69,0.55)', letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: 11 }}>Grupo</th>
                <th style={{ padding: '0 0 12px', textAlign: 'left', fontWeight: 700, color: 'rgba(11,37,69,0.55)', letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: 11 }}>Semestre</th>
                <th style={{ padding: '0 0 12px', textAlign: 'right', fontWeight: 700, color: 'rgba(11,37,69,0.55)', letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: 11 }}>Alumnos</th>
              </tr>
            </thead>
            <tbody>
              {metricas.grupos.map((g) => (
                <tr key={g.id} style={{ borderBottom: '1px solid rgba(11,37,69,0.06)' }}>
                  <td style={{ padding: '12px 0' }}>
                    <Link href={`/dashboard/docente/grupos/${g.id}`} style={{
                      fontWeight: 600, color: '#1E40AF', textDecoration: 'none', fontSize: 14,
                    }}>
                      {g.nombre}
                    </Link>
                  </td>
                  <td style={{ padding: '12px 0', color: 'rgba(11,37,69,0.65)' }}>{g.semestre}°</td>
                  <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 700, color: '#0B2545' }}>{g.total_alumnos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1.4fr"] {
            grid-template-columns: 1fr !important;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          * { transition: none !important; }
        }
      `}</style>
    </main>
  );
}
