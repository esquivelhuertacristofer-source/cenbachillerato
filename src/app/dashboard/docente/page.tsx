import { redirect } from "next/navigation";
import { getUser, getProfile } from "@/lib/supabase-helpers";
import { getMetricasDocente } from "@/lib/queries/docente";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Docente — CEN Bachillerato",
};

const METRIC_ICONS = [
  { fa: "fa-solid fa-users", color: "#7DD3FC" },
  { fa: "fa-solid fa-school", color: "#7DD3FC" },
  { fa: "fa-solid fa-book-open", color: "#7DD3FC" },
  { fa: "fa-solid fa-chart-bar", color: "#7DD3FC" },
];

export default async function DocenteDashboardPage() {
  const user = await getUser();
  if (!user) redirect("/log-in");

  const profile = await getProfile(user.id);
  if (!profile) redirect("/log-in");

  if (profile.role === "student") redirect("/hub");
  if (profile.role === "admin" || profile.role === "super_admin") redirect("/admin/escuelas");

  const nombre = profile.full_name?.split(" ")[0] ?? "Docente";
  const metricas = await getMetricasDocente(user.id);

  const metricCards = [
    { label: "Alumnos activos", valor: String(metricas.totalAlumnos) },
    { label: "Grupos asignados", valor: String(metricas.totalGrupos) },
    { label: "Semestres en curso", valor: String(metricas.uacEnCurso) },
    { label: "Promedio de avance", valor: "—" },
  ];

  const quickCards = [
    { icon: "fa-solid fa-file-import", title: "Alta de alumnos", desc: "Carga masiva por Excel/CSV. Próximamente disponible." },
    { icon: "fa-solid fa-clipboard-list", title: "Reportes SEP", desc: "Generación de reportes en formato institucional. Próximamente." },
    { icon: "fa-solid fa-layer-group", title: "Gestión de grupos", desc: "Crear y gestionar grupos por semestre y UAC. Próximamente." },
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
          Aquí tienes un resumen de tu actividad docente.
        </p>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        {metricCards.map((metric, i) => (
          <div key={metric.label} style={{
            background: '#0B2545',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 20,
            padding: '24px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}>
            <i className={METRIC_ICONS[i]?.fa} style={{ fontSize: 22, color: METRIC_ICONS[i]?.color }} />
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

      {/* Grupos table */}
      <div style={{ background: '#fff', border: '1px solid rgba(11,37,69,0.10)', borderRadius: 20, padding: 32, marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0B2545', letterSpacing: '-0.02em', marginBottom: 20 }}>
          <i className="fa-solid fa-users-rectangle" style={{ color: '#1E40AF', marginRight: 10 }} />
          Mis grupos
        </h2>
        {metricas.grupos.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', textAlign: 'center' }}>
            <i className="fa-regular fa-clipboard" style={{ fontSize: 40, color: 'rgba(11,37,69,0.18)', marginBottom: 16 }} />
            <p style={{ fontSize: 16, fontWeight: 600, color: '#0B2545' }}>Sin grupos asignados</p>
            <p style={{ fontSize: 14, color: 'rgba(11,37,69,0.55)', marginTop: 4 }}>
              El administrador debe asignarte a un grupo para ver alumnos aquí.
            </p>
          </div>
        ) : (
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
                  <td style={{ padding: '14px 0', fontWeight: 600, color: '#0B2545' }}>{g.nombre}</td>
                  <td style={{ padding: '14px 0', color: 'rgba(11,37,69,0.65)' }}>{g.semestre}°</td>
                  <td style={{ padding: '14px 0', textAlign: 'right', fontWeight: 700, color: '#1E40AF' }}>{g.total_alumnos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick access */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {quickCards.map((card) => (
          <div key={card.title} style={{
            background: '#fff',
            border: '1px solid rgba(11,37,69,0.10)',
            borderRadius: 20,
            padding: 28,
            cursor: 'pointer',
            transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
          }}>
            <i className={card.icon} style={{ fontSize: 20, color: '#1E40AF', marginBottom: 12, display: 'block' }} />
            <div style={{ fontSize: 15, fontWeight: 800, color: '#0B2545', marginBottom: 8, letterSpacing: '-0.01em' }}>
              {card.title}
            </div>
            <p style={{ fontSize: 13, color: 'rgba(11,37,69,0.55)', lineHeight: 1.6, margin: 0 }}>
              {card.desc}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
