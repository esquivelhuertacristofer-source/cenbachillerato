import { redirect } from "next/navigation";
import { getUser, getProfile } from "@/lib/supabase-helpers";
import { getMetricasDocente } from "@/lib/queries/docente";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Docente — CEN Bachillerato",
};

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
    { label: "Alumnos activos", valor: String(metricas.totalAlumnos), icono: "👥", color: "text-cen-blue" },
    { label: "Grupos asignados", valor: String(metricas.totalGrupos), icono: "🏫", color: "text-purple-600" },
    { label: "Semestres en curso", valor: String(metricas.uacEnCurso), icono: "📚", color: "text-emerald-600" },
    { label: "Promedio de avance", valor: "—", icono: "📊", color: "text-amber-600" },
  ];

  return (
    <div className="min-h-screen bg-cen-bg">
      {/* Header */}
      <header className="border-b border-ink-10 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-cen-navy">
              Dashboard Docente
            </h1>
            <p className="text-sm text-ink-60">Bienvenido, {nombre}</p>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <a href="/dashboard/docente/alumnos" className="text-ink-60 hover:text-cen-blue transition-colors">Alumnos</a>
            <a href="/dashboard/docente/metricas" className="text-ink-60 hover:text-cen-blue transition-colors">Métricas</a>
            <a href="/dashboard/docente/reportes" className="text-ink-60 hover:text-cen-blue transition-colors">Reportes</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Métricas */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {metricCards.map((metric) => (
            <Card key={metric.label}>
              <CardContent className="flex items-center gap-4">
                <span className="text-3xl">{metric.icono}</span>
                <div>
                  <p className={`text-2xl font-black ${metric.color}`}>{metric.valor}</p>
                  <p className="text-sm text-ink-60">{metric.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabla de grupos */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Mis grupos</CardTitle>
            </CardHeader>
            <CardContent>
              {metricas.grupos.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <span className="text-4xl">📋</span>
                  <p className="mt-4 text-ink-60">Sin grupos asignados.</p>
                  <p className="mt-1 text-sm text-ink-40">
                    El administrador debe asignarte a un grupo para ver alumnos aquí.
                  </p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-ink-10 text-left text-ink-40">
                      <th className="pb-3 font-bold uppercase tracking-[0.1em]">Grupo</th>
                      <th className="pb-3 font-bold uppercase tracking-[0.1em]">Semestre</th>
                      <th className="pb-3 text-right font-bold uppercase tracking-[0.1em]">Alumnos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-10">
                    {metricas.grupos.map((g) => (
                      <tr key={g.id} className="py-2">
                        <td className="py-3 font-bold text-cen-navy">{g.nombre}</td>
                        <td className="py-3 text-ink-60">{g.semestre}°</td>
                        <td className="py-3 text-right font-black text-cen-navy">{g.total_alumnos}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Accesos rápidos */}
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Card hoverable>
            <CardHeader>
              <CardTitle>📥 Alta de alumnos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-ink-60">
                Carga masiva por Excel/CSV. Próximamente disponible.
              </p>
            </CardContent>
          </Card>

          <Card hoverable>
            <CardHeader>
              <CardTitle>📊 Reportes SEP</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-ink-60">
                Generación de reportes en formato institucional. Próximamente.
              </p>
            </CardContent>
          </Card>

          <Card hoverable>
            <CardHeader>
              <CardTitle>🗂️ Gestión de grupos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-ink-60">
                Crear y gestionar grupos por semestre y UAC. Próximamente.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
