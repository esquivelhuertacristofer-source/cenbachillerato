import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gestión de Grupos — Admin | CEN Bachillerato",
};

export default async function GruposAdminPage() {
  const sb = getSupabaseAdmin();

  const [{ data: grupos }, { data: escuelas }, { data: docentes }] = await Promise.all([
    sb.from("grupos").select("id, nombre, semestre, escuela_id, id_docente").order("semestre").order("nombre"),
    sb.from("escuelas").select("id, nombre"),
    sb.from("profiles").select("id, full_name, email").eq("role", "teacher"),
  ]);

  const escuelaMap = new Map(escuelas?.map((e) => [e.id, e.nombre]) ?? []);
  const docenteMap = new Map(docentes?.map((d) => [d.id, d.full_name ?? d.email]) ?? []);

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
            <a href="/admin/grupos" className="font-medium text-indigo-700">Grupos</a>
            <a href="/admin/usuarios" className="text-gray-600 hover:text-indigo-700">Usuarios</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Grupos{" "}
            <span className="ml-2 rounded-full bg-gray-100 px-3 py-0.5 text-base font-normal text-gray-500">
              {grupos?.length ?? 0}
            </span>
          </h2>
          <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            + Agregar grupo
          </button>
        </div>

        {!grupos || grupos.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-20 text-center">
            <span className="text-5xl">🗂️</span>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Sin grupos registrados</h3>
            <p className="mt-2 text-gray-500">
              Crea el primer grupo para comenzar a asignar alumnos y docentes.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-500">
                  <th className="px-6 py-3 font-medium">Grupo</th>
                  <th className="px-6 py-3 font-medium">Semestre</th>
                  <th className="px-6 py-3 font-medium">Escuela</th>
                  <th className="px-6 py-3 font-medium">Docente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {grupos.map((g) => (
                  <tr key={g.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{g.nombre}</td>
                    <td className="px-6 py-4 text-gray-600">{g.semestre}°</td>
                    <td className="px-6 py-4 text-gray-500">
                      {escuelaMap.get(g.escuela_id) ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {g.id_docente ? (docenteMap.get(g.id_docente) ?? "Docente sin perfil") : "Sin asignar"}
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
