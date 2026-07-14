import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getUser, getProfile } from "@/lib/supabase-helpers";
import ResetearPasswordButton from "@/components/admin/ResetearPasswordButton";
import CrearAdminEscolarForm from "@/components/admin/CrearAdminEscolarForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gestión de Usuarios — Admin | CEN Bachillerato",
};

const ROLE_LABELS: Record<string, string> = {
  student: "Alumno",
  teacher: "Docente",
  admin: "Admin",
  super_admin: "Super Admin",
};

const ROLE_STYLES: Record<string, { background: string; color: string }> = {
  student: { background: '#DBEAFE', color: '#1E40AF' },
  teacher: { background: 'rgba(125,211,252,0.18)', color: '#0B2545' },
  admin: { background: 'rgba(11,37,69,0.10)', color: '#0B2545' },
  super_admin: { background: '#0B2545', color: '#7DD3FC' },
};

export default async function UsuariosAdminPage() {
  // Aislamiento multi-tenant: este page lee con service_role, que SALTA RLS.
  // Por eso el filtro por escuela DEBE hacerse aquí explícitamente, o un admin
  // escolar vería PII de menores de OTRAS escuelas (LFPDPPP). super_admin
  // (operador de la plataforma) conserva visión global.
  const user = await getUser();
  if (!user) redirect("/log-in");
  const profile = await getProfile(user.id);
  if (!profile) redirect("/log-in");

  const sb = getSupabaseAdmin();
  let query = sb
    .from("profiles")
    .select("id, email, full_name, role, semestre, created_at")
    .order("role")
    .order("full_name");

  if (profile.role !== "super_admin") {
    // Admin escolar: solo su escuela. Sin escuela asignada ⇒ no ve a nadie.
    if (!profile.escuela_id) {
      query = query.eq("escuela_id", "00000000-0000-0000-0000-000000000000");
    } else {
      query = query.eq("escuela_id", profile.escuela_id);
    }
  }

  const { data: usuarios } = await query;

  // Crear admin escolar es exclusivo de super_admin (ADMIN-FLOW.md §5.2);
  // el resto de altas (docentes/alumnos por escuela) usan alta-masiva.ts.
  const esSuperAdmin = profile.role === "super_admin";
  let escuelas: { id: string; nombre: string }[] = [];
  if (esSuperAdmin) {
    const { data } = await sb.from("escuelas").select("id, nombre").order("nombre");
    escuelas = data ?? [];
  }

  const totales = {
    student: usuarios?.filter((u) => u.role === "student").length ?? 0,
    teacher: usuarios?.filter((u) => u.role === "teacher").length ?? 0,
    admin: usuarios?.filter((u) => u.role === "admin" || u.role === "super_admin").length ?? 0,
  };

  const summaryCards = [
    { label: 'Alumnos', value: totales.student, icon: 'fa-solid fa-graduation-cap' },
    { label: 'Docentes', value: totales.teacher, icon: 'fa-solid fa-chalkboard-user' },
    { label: 'Admins', value: totales.admin, icon: 'fa-solid fa-shield-halved' },
  ];

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 64px' }}>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, gap: 24 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#1E40AF', marginBottom: 8 }}>
            Admin · Usuarios
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0B2545', letterSpacing: '-0.03em', margin: 0 }}>
            Usuarios
            <span style={{
              display: 'inline-flex',
              marginLeft: 12,
              borderRadius: 999,
              background: 'rgba(11,37,69,0.08)',
              padding: '2px 12px',
              fontSize: 15,
              fontWeight: 600,
              color: 'rgba(11,37,69,0.50)',
              verticalAlign: 'middle',
            }}>
              {usuarios?.length ?? 0}
            </span>
          </h1>
        </div>
        {esSuperAdmin && <CrearAdminEscolarForm escuelas={escuelas} />}
      </div>

      {/* Resumen por rol */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {summaryCards.map((card) => (
          <div key={card.label} style={{
            background: '#0B2545',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 20,
            padding: '24px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}>
            <i className={card.icon} style={{ fontSize: 20, color: '#7DD3FC' }} />
            <div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>
                {card.value}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.60)', marginTop: 4 }}>
                {card.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!usuarios || usuarios.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          borderRadius: 24, border: '2px dashed rgba(11,37,69,0.14)',
          background: '#fff', padding: '80px 32px', textAlign: 'center',
        }}>
          <i className="fa-solid fa-user" style={{ fontSize: 44, color: 'rgba(11,37,69,0.14)', marginBottom: 20 }} />
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0B2545', margin: 0 }}>Sin usuarios</h3>
        </div>
      ) : (
        <div style={{ overflow: 'hidden', borderRadius: 20, border: '1px solid rgba(11,37,69,0.10)', background: '#fff' }}>
          <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid rgba(11,37,69,0.08)' }}>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontWeight: 700, fontSize: 11, color: 'rgba(11,37,69,0.50)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nombre</th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontWeight: 700, fontSize: 11, color: 'rgba(11,37,69,0.50)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontWeight: 700, fontSize: 11, color: 'rgba(11,37,69,0.50)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rol</th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontWeight: 700, fontSize: 11, color: 'rgba(11,37,69,0.50)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Semestre</th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontWeight: 700, fontSize: 11, color: 'rgba(11,37,69,0.50)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => {
                const roleStyle = ROLE_STYLES[u.role] ?? { background: 'rgba(11,37,69,0.07)', color: '#0B2545' };
                // AdminLayout ya garantiza que profile.role es 'admin' o
                // 'super_admin' aquí. Un admin escolar no puede resetear a un
                // super_admin (mismo límite que aplica resetearPassword server-side).
                const puedeResetear = profile.role === 'super_admin' || u.role !== 'super_admin';
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(11,37,69,0.06)' }}>
                    <td style={{ padding: '14px 24px', fontWeight: 600, color: '#0B2545' }}>
                      {u.full_name ?? "—"}
                    </td>
                    <td style={{ padding: '14px 24px', color: 'rgba(11,37,69,0.60)', fontSize: 13 }}>{u.email}</td>
                    <td style={{ padding: '14px 24px' }}>
                      <span style={{
                        borderRadius: 999,
                        padding: '3px 10px',
                        fontSize: 11,
                        fontWeight: 700,
                        ...roleStyle,
                      }}>
                        {ROLE_LABELS[u.role] ?? u.role}
                      </span>
                    </td>
                    <td style={{ padding: '14px 24px', color: 'rgba(11,37,69,0.60)' }}>
                      {u.semestre ? `${u.semestre}°` : "—"}
                    </td>
                    <td style={{ padding: '14px 24px' }}>
                      {puedeResetear ? (
                        <ResetearPasswordButton userId={u.id} nombre={u.full_name ?? u.email} />
                      ) : (
                        <span style={{ fontSize: 12, color: 'rgba(11,37,69,0.30)' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
