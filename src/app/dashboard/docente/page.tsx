import { redirect } from "next/navigation";
import { getUser, getProfile } from "@/lib/supabase-helpers";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Docente — CEN Bachillerato",
};

const METRIC_CARDS = [
  { label: "Alumnos activos", valor: "—", icono: "👥", color: "text-blue-600" },
  { label: "Grupos asignados", valor: "—", icono: "🏫", color: "text-purple-600" },
  { label: "UAC en curso", valor: "—", icono: "📚", color: "text-green-600" },
  { label: "Promedio de avance", valor: "—", icono: "📊", color: "text-amber-600" },
];

export default async function DocenteDashboardPage() {
  const user = await getUser();
  if (!user) redirect("/log-in");

  const profile = await getProfile(user.id);
  if (!profile) redirect("/log-in");

  if (profile.role === "student") redirect("/hub");
  if (profile.role === "admin" || profile.role === "super_admin") redirect("/admin/escuelas");

  const nombre = profile.full_name?.split(" ")[0] ?? "Docente";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dashboard Docente</h1>
            <p className="text-sm text-gray-500">Bienvenido, {nombre}</p>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <a href="/dashboard/docente/alumnos" className="text-gray-600 hover:text-indigo-700">Alumnos</a>
            <a href="/dashboard/docente/metricas" className="text-gray-600 hover:text-indigo-700">Métricas</a>
            <a href="/dashboard/docente/reportes" className="text-gray-600 hover:text-indigo-700">Reportes</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Métricas */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {METRIC_CARDS.map((metric) => (
            <Card key={metric.label}>
              <CardContent className="flex items-center gap-4">
                <span className="text-3xl">{metric.icono}</span>
                <div>
                  <p className={`text-2xl font-bold ${metric.color}`}>{metric.valor}</p>
                  <p className="text-sm text-gray-500">{metric.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Placeholder — Tabla de alumnos */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Alumnos recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center py-12 text-center">
                <span className="text-4xl">📋</span>
                <p className="mt-4 text-gray-500">
                  Próximamente: lista de alumnos con progreso por UAC.
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  Las métricas se activarán cuando haya contenido y actividades publicadas.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Placeholder — Accesos rápidos */}
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Card hoverable>
            <CardHeader>
              <CardTitle>📥 Alta de alumnos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Carga masiva por Excel/CSV. Próximamente disponible.
              </p>
            </CardContent>
          </Card>

          <Card hoverable>
            <CardHeader>
              <CardTitle>📊 Reportes SEP</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Generación de reportes en formato institucional. Próximamente.
              </p>
            </CardContent>
          </Card>

          <Card hoverable>
            <CardHeader>
              <CardTitle>🗂️ Gestión de grupos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Crear y gestionar grupos por semestre y UAC. Próximamente.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
