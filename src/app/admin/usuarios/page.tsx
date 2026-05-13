import { getSupabaseAdmin } from "@/lib/supabase-admin";
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

const ROLE_COLORS: Record<string, string> = {
  student: "bg-blue-50 text-blue-700",
  teacher: "bg-green-50 text-green-700",
  admin: "bg-amber-50 text-amber-700",
  super_admin: "bg-red-50 text-red-700",
};

export default async function UsuariosAdminPage() {
  const sb = getSupabaseAdmin();
  const { data: usuarios } = await sb
    .from("profiles")
    .select("id, email, full_name, role, semestre, created_at")
    .order("role")
    .order("full_name");

  const totales = {
    student: usuarios?.filter((u) => u.role === "student").length ?? 0,
    teacher: usuarios?.filter((u) => u.role === "teacher").length ?? 0,
    admin: usuarios?.filter((u) => u.role === "admin" || u.role === "super_admin").length ?? 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Panel de Administración</h1>
            <p className="text-sm text-gray-500">CEN Bachillerato</p>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <a href="/admin/escuelas" className="text-gray-600 hover:text-indigo-700">Escuelas</a>
            <a href="/admin/grupos" className="text-gray-600 hover:text-indigo-700">Grupos</a>
            <a href="/admin/usuarios" className="font-medium text-indigo-700">Usuarios</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Resumen por rol */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{totales.student}</p>
            <p className="mt-1 text-sm text-gray-500">Alumnos</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{totales.teacher}</p>
            <p className="mt-1 text-sm text-gray-500">Docentes</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{totales.admin}</p>
            <p className="mt-1 text-sm text-gray-500">Admins</p>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Todos los usuarios{" "}
            <span className="ml-2 rounded-full bg-gray-100 px-3 py-0.5 text-base font-normal text-gray-500">
              {usuarios?.length ?? 0}
            </span>
          </h2>
        </div>

        {!usuarios || usuarios.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-20 text-center">
            <span className="text-5xl">👤</span>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Sin usuarios</h3>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-500">
                  <th className="px-6 py-3 font-medium">Nombre</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Rol</th>
                  <th className="px-6 py-3 font-medium">Semestre</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {u.full_name ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[u.role] ?? "bg-gray-100 text-gray-600"}`}>
                        {ROLE_LABELS[u.role] ?? u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {u.semestre ? `${u.semestre}°` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
