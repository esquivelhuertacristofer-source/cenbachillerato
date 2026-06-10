import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getUser, getProfile } from "@/lib/supabase-helpers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gestión de Grupos — Admin | CEN Bachillerato",
};

export default async function GruposAdminPage() {
  // Aislamiento multi-tenant: service_role salta RLS ⇒ filtramos por escuela
  // del admin aquí. super_admin conserva visión global. Ver admin/usuarios.
  const user = await getUser();
  if (!user) redirect("/log-in");
  const profile = await getProfile(user.id);
  if (!profile) redirect("/log-in");

  const esGlobal = profile.role === "super_admin";
  // Admin sin escuela asignada ⇒ scope imposible (no ve nada).
  const escuelaScope = esGlobal ? null : (profile.escuela_id ?? "00000000-0000-0000-0000-000000000000");

  const sb = getSupabaseAdmin();

  let gruposQuery = sb.from("grupos").select("id, nombre, semestre, escuela_id, id_docente").order("semestre").order("nombre");
  let escuelasQuery = sb.from("escuelas").select("id, nombre");
  let docentesQuery = sb.from("profiles").select("id, full_name, email").eq("role", "teacher");
  if (escuelaScope !== null) {
    gruposQuery = gruposQuery.eq("escuela_id", escuelaScope);
    escuelasQuery = escuelasQuery.eq("id", escuelaScope);
    docentesQuery = docentesQuery.eq("escuela_id", escuelaScope);
  }

  const [{ data: grupos }, { data: escuelas }, { data: docentes }] = await Promise.all([
    gruposQuery,
    escuelasQuery,
    docentesQuery,
  ]);

  const escuelaMap = new Map(escuelas?.map((e) => [e.id, e.nombre]) ?? []);
  const docenteMap = new Map(docentes?.map((d) => [d.id, d.full_name ?? d.email]) ?? []);

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 64px' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#1E40AF', marginBottom: 8 }}>
            Admin · Grupos
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0B2545', letterSpacing: '-0.03em', margin: 0 }}>
            Grupos
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
              {grupos?.length ?? 0}
            </span>
          </h1>
        </div>
        <button style={{
          borderRadius: 999,
          background: '#0B2545',
          padding: '10px 22px',
          fontSize: 13,
          fontWeight: 700,
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
        }}>
          <i className="fa-solid fa-plus" style={{ marginRight: 8 }} />
          Agregar grupo
        </button>
      </div>

      {!grupos || grupos.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          borderRadius: 24, border: '2px dashed rgba(11,37,69,0.14)',
          background: '#fff', padding: '80px 32px', textAlign: 'center',
        }}>
          <i className="fa-solid fa-layer-group" style={{ fontSize: 44, color: 'rgba(11,37,69,0.14)', marginBottom: 20 }} />
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0B2545', margin: '0 0 8px' }}>Sin grupos registrados</h3>
          <p style={{ fontSize: 14, color: 'rgba(11,37,69,0.55)', margin: 0 }}>
            Crea el primer grupo para comenzar a asignar alumnos y docentes.
          </p>
        </div>
      ) : (
        <div style={{ overflow: 'hidden', borderRadius: 20, border: '1px solid rgba(11,37,69,0.10)', background: '#fff' }}>
          <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid rgba(11,37,69,0.08)' }}>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontWeight: 700, fontSize: 11, color: 'rgba(11,37,69,0.50)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Grupo</th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontWeight: 700, fontSize: 11, color: 'rgba(11,37,69,0.50)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Semestre</th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontWeight: 700, fontSize: 11, color: 'rgba(11,37,69,0.50)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Escuela</th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontWeight: 700, fontSize: 11, color: 'rgba(11,37,69,0.50)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Docente</th>
              </tr>
            </thead>
            <tbody>
              {grupos.map((g) => (
                <tr key={g.id} style={{ borderBottom: '1px solid rgba(11,37,69,0.06)' }}>
                  <td style={{ padding: '14px 24px', fontWeight: 600, color: '#0B2545' }}>{g.nombre}</td>
                  <td style={{ padding: '14px 24px', color: 'rgba(11,37,69,0.65)' }}>{g.semestre}°</td>
                  <td style={{ padding: '14px 24px', color: 'rgba(11,37,69,0.60)' }}>
                    {escuelaMap.get(g.escuela_id) ?? "—"}
                  </td>
                  <td style={{ padding: '14px 24px', color: 'rgba(11,37,69,0.60)' }}>
                    {g.id_docente ? (docenteMap.get(g.id_docente) ?? "Docente sin perfil") : (
                      <span style={{ color: 'rgba(11,37,69,0.35)', fontStyle: 'italic' }}>Sin asignar</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
