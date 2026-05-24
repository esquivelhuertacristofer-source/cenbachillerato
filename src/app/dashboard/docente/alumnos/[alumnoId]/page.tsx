import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getUser, getProfile, getSupabaseServer } from "@/lib/supabase-helpers";
import { getGruposDocente } from "@/lib/queries/docente";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Perfil alumno — Dashboard Docente | CEN Bachillerato",
};

function timeAgo(iso: string | null): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Hace unos minutos';
  if (hours < 24) return `Hace ${hours}h`;
  if (days === 1) return 'Ayer';
  if (days < 7) return `Hace ${days} días`;
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

const STATUS_CONFIG: Record<string, { color: string; label: string; icon: string }> = {
  completed: { color: '#10b981', label: 'Completado', icon: 'fa-solid fa-circle-check' },
  in_progress: { color: '#f59e0b', label: 'En progreso', icon: 'fa-solid fa-clock' },
  failed: { color: '#ef4444', label: 'Fallido', icon: 'fa-solid fa-circle-xmark' },
  abandoned: { color: '#94a3b8', label: 'Abandonado', icon: 'fa-regular fa-circle' },
};

export default async function AlumnoPerfilPage({ params }: { params: Promise<{ alumnoId: string }> }) {
  const { alumnoId } = await params;

  const user = await getUser();
  if (!user) redirect("/log-in");
  const profile = await getProfile(user.id);
  if (!profile || profile.role === "student") redirect("/hub");

  // Verificar que el alumno pertenece a uno de los grupos del docente
  const grupos = await getGruposDocente(user.id);
  const grupoIds = grupos.map((g) => g.id);

  const sb = await getSupabaseServer();

  const { data: relacion } = await sb
    .from("alumnos_grupos")
    .select("id_grupo")
    .eq("id_alumno", alumnoId)
    .in("id_grupo", grupoIds)
    .maybeSingle();

  if (!relacion) notFound();

  const grupoDelAlumno = grupos.find((g) => g.id === relacion.id_grupo);

  // Perfil del alumno
  const { data: alumnoProfile } = await sb
    .from("profiles")
    .select("id, full_name, email, semestre, created_at")
    .eq("id", alumnoId)
    .maybeSingle();

  if (!alumnoProfile) notFound();

  // Intentos del alumno
  const { data: intentos } = await sb
    .from("intentos")
    .select("id, actividad_id, score, tiempo_segundos, status, completed_at, started_at")
    .eq("user_id", alumnoId)
    .order("started_at", { ascending: false })
    .limit(50);

  const actividadIds = [...new Set(intentos?.map((i) => i.actividad_id) ?? [])];
  const { data: actividades } = actividadIds.length > 0
    ? await sb.from("actividades").select("id, codigo, titulo, tipo").in("id", actividadIds)
    : { data: [] };

  const actMap = new Map(actividades?.map((a) => [a.id, a]) ?? []);

  const completadas = intentos?.filter((i) => i.status === 'completed') ?? [];
  const scorePromedio = completadas.length > 0
    ? Math.round(completadas.reduce((s, i) => s + (i.score ?? 0), 0) / completadas.length)
    : null;
  const tiempoTotal = Math.round((intentos?.reduce((s, i) => s + (i.tiempo_segundos ?? 0), 0) ?? 0) / 60);

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 80px' }}>
      {/* Back */}
      <Link href="/dashboard/docente/alumnos" style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        color: 'rgba(11,37,69,0.55)', fontSize: 13, fontWeight: 600,
        textDecoration: 'none', marginBottom: 24,
      }}>
        <i className="fa-solid fa-arrow-left" style={{ fontSize: 12 }} />
        Volver a alumnos
      </Link>

      {/* Cabecera alumno */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 36, flexWrap: 'wrap' }}>
        <div style={{
          width: 64, height: 64, borderRadius: 999,
          background: '#EFF6FF', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, fontWeight: 900, color: '#1E40AF',
        }}>
          {(alumnoProfile.full_name ?? alumnoProfile.email).charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0B2545', letterSpacing: '-0.03em', margin: 0 }}>
            {alumnoProfile.full_name ?? '—'}
          </h1>
          <div style={{ fontSize: 14, color: 'rgba(11,37,69,0.60)', marginTop: 4 }}>
            {alumnoProfile.email}
            {grupoDelAlumno && (
              <span style={{ marginLeft: 12, color: '#1E40AF', fontWeight: 600 }}>
                · {grupoDelAlumno.nombre} (Sem. {grupoDelAlumno.semestre})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Completadas', valor: completadas.length, icon: 'fa-solid fa-circle-check', color: '#10b981' },
          { label: 'Score promedio', valor: scorePromedio !== null ? `${scorePromedio}` : '—', icon: 'fa-solid fa-star', color: scorePromedio !== null ? (scorePromedio >= 80 ? '#10b981' : scorePromedio >= 60 ? '#f59e0b' : '#ef4444') : '#7DD3FC' },
          { label: 'Tiempo total', valor: `${tiempoTotal}m`, icon: 'fa-solid fa-clock', color: '#7DD3FC' },
          { label: 'Total intentos', valor: intentos?.length ?? 0, icon: 'fa-solid fa-list', color: '#7DD3FC' },
        ].map((m) => (
          <div key={m.label} style={{
            background: '#0B2545', borderRadius: 20, padding: '22px 24px',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <i className={m.icon} style={{ fontSize: 20, color: m.color }} />
            <div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>{m.valor}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.60)', marginTop: 4 }}>{m.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Historial de intentos */}
      <div style={{ background: '#fff', border: '1px solid rgba(11,37,69,0.10)', borderRadius: 20, padding: 28 }}>
        <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0B2545', marginBottom: 20, letterSpacing: '-0.02em' }}>
          <i className="fa-solid fa-clock-rotate-left" style={{ color: '#1E40AF', marginRight: 8 }} />
          Historial de actividades ({intentos?.length ?? 0})
        </h2>

        {!intentos || intentos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(11,37,69,0.45)' }}>
            <i className="fa-regular fa-clock" style={{ fontSize: 36, marginBottom: 12, display: 'block' }} />
            <p style={{ fontSize: 14 }}>Este alumno aún no ha realizado ninguna actividad.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Actividad', 'Tipo', 'Estado', 'Score', 'Tiempo', 'Fecha'].map((h) => (
                    <th key={h} style={{
                      padding: '10px 12px', textAlign: 'left',
                      fontSize: 11, fontWeight: 700, color: 'rgba(11,37,69,0.50)',
                      textTransform: 'uppercase', letterSpacing: '0.08em',
                      borderBottom: '2px solid rgba(11,37,69,0.08)', whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {intentos.map((intento) => {
                  const act = actMap.get(intento.actividad_id);
                  const cfg = STATUS_CONFIG[intento.status] ?? STATUS_CONFIG.in_progress!;
                  return (
                    <tr key={intento.id} style={{ borderBottom: '1px solid rgba(11,37,69,0.05)' }}>
                      <td style={{ padding: '12px 12px' }}>
                        <div style={{ fontWeight: 600, color: '#0B2545', fontSize: 13 }}>{act?.titulo ?? '—'}</div>
                        {act && <div style={{ fontSize: 11, color: 'rgba(11,37,69,0.45)', fontFamily: 'monospace' }}>{act.codigo}</div>}
                      </td>
                      <td style={{ padding: '12px 12px', color: 'rgba(11,37,69,0.55)', fontSize: 12 }}>
                        {act?.tipo ?? '—'}
                      </td>
                      <td style={{ padding: '12px 12px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          fontSize: 12, fontWeight: 600, color: cfg.color,
                          background: `${cfg.color}15`, padding: '3px 10px', borderRadius: 999,
                        }}>
                          <i className={cfg.icon} style={{ fontSize: 10 }} />
                          {cfg.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 12px', fontWeight: 700, color: intento.score !== null ? '#0B2545' : 'rgba(11,37,69,0.35)' }}>
                        {intento.score !== null ? `${intento.score}/100` : '—'}
                      </td>
                      <td style={{ padding: '12px 12px', color: 'rgba(11,37,69,0.55)', fontSize: 12 }}>
                        {intento.tiempo_segundos ? `${Math.round(intento.tiempo_segundos / 60)}m` : '—'}
                      </td>
                      <td style={{ padding: '12px 12px', color: 'rgba(11,37,69,0.55)', fontSize: 12, whiteSpace: 'nowrap' }}>
                        {timeAgo(intento.completed_at ?? intento.started_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
