import { redirect } from "next/navigation";
import { getUser, getProfile } from "@/lib/supabase-helpers";
import { getMetricasDocente } from "@/lib/queries/docente";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Configuración — Dashboard Docente | CEN Bachillerato",
};

export default async function ConfiguracionPage() {
  const user = await getUser();
  if (!user) redirect("/log-in");
  const profile = await getProfile(user.id);
  if (!profile || profile.role === "student") redirect("/hub");

  const metricas = await getMetricasDocente(user.id);

  const inicial = (profile.full_name ?? profile.email ?? 'D').charAt(0).toUpperCase();
  const nombre = profile.full_name ?? '—';
  const email = profile.email ?? user.email ?? '—';
  const rol = profile.role === 'super_admin' ? 'Super Admin' : profile.role === 'admin' ? 'Administrador' : 'Docente';

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#1E40AF', marginBottom: 8 }}>
          <i className="fa-solid fa-circle" style={{ fontSize: 8, color: '#10b981', marginRight: 6 }} />
          Docente · Configuración
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0B2545', letterSpacing: '-0.03em', margin: 0 }}>
          Mi perfil
        </h1>
      </div>

      {/* Profile card */}
      <div style={{
        background: '#fff', border: '1px solid rgba(11,37,69,0.10)',
        borderRadius: 24, padding: '40px 40px 32px', marginBottom: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32, flexWrap: 'wrap' }}>
          <div style={{
            width: 80, height: 80, borderRadius: 999,
            background: '#0B2545', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30, fontWeight: 900, color: '#7DD3FC',
          }}>
            {inicial}
          </div>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0B2545', margin: 0, letterSpacing: '-0.02em' }}>{nombre}</h2>
            <div style={{ fontSize: 14, color: 'rgba(11,37,69,0.55)', marginTop: 4 }}>{email}</div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#EFF6FF', color: '#1E40AF',
              borderRadius: 999, padding: '3px 12px', fontSize: 12, fontWeight: 700, marginTop: 8,
            }}>
              <i className="fa-solid fa-chalkboard-teacher" style={{ fontSize: 10 }} />
              {rol}
            </div>
          </div>
        </div>

        {/* Info fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { label: 'Nombre completo', value: nombre, icon: 'fa-solid fa-user' },
            { label: 'Correo electrónico', value: email, icon: 'fa-solid fa-envelope' },
            { label: 'Rol en el sistema', value: rol, icon: 'fa-solid fa-shield-halved' },
            { label: 'ID de usuario', value: user.id.slice(0, 8) + '…', icon: 'fa-solid fa-fingerprint' },
          ].map((field) => (
            <div key={field.label} style={{
              background: 'rgba(11,37,69,0.03)',
              borderRadius: 14, padding: '16px 18px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <i className={field.icon} style={{ fontSize: 12, color: '#1E40AF' }} />
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(11,37,69,0.45)' }}>
                  {field.label}
                </span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#0B2545' }}>{field.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats summary */}
      <div style={{ background: '#0B2545', borderRadius: 20, padding: '28px 32px', marginBottom: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: 'rgba(255,255,255,0.75)', marginBottom: 20, letterSpacing: '-0.01em' }}>
          Resumen docente
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {[
            { label: 'Grupos', valor: metricas.totalGrupos, icon: 'fa-solid fa-users-rectangle', color: '#7DD3FC' },
            { label: 'Alumnos', valor: metricas.totalAlumnos, icon: 'fa-solid fa-user-graduate', color: '#7DD3FC' },
            { label: 'Semestres', valor: metricas.uacEnCurso, icon: 'fa-solid fa-layer-group', color: '#7DD3FC' },
          ].map((m) => (
            <div key={m.label}>
              <i className={m.icon} style={{ fontSize: 18, color: m.color, marginBottom: 8, display: 'block' }} />
              <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>{m.valor}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.50)', marginTop: 2 }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Note */}
      <div style={{
        background: 'rgba(30,64,175,0.06)', border: '1px solid rgba(30,64,175,0.15)',
        borderRadius: 14, padding: '16px 20px',
        display: 'flex', alignItems: 'flex-start', gap: 12,
      }}>
        <i className="fa-solid fa-circle-info" style={{ color: '#1E40AF', fontSize: 16, marginTop: 1, flexShrink: 0 }} />
        <p style={{ fontSize: 13, color: 'rgba(11,37,69,0.70)', lineHeight: 1.65, margin: 0 }}>
          Para modificar tu nombre, correo o contraseña, contacta al administrador de tu plantel.
          Los cambios de datos personales se realizan desde el panel de administración.
        </p>
      </div>

      <style>{`
        @media (max-width: 600px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="grid-template-columns: repeat(3, 1fr)"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}
