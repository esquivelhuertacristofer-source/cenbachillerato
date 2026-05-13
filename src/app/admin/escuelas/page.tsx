import { getSupabaseServer } from "@/lib/supabase-helpers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gestión de Escuelas — Admin | CEN Bachillerato",
};

export default async function EscuelasPage() {
  const sb = await getSupabaseServer();
  const { data: escuelas } = await sb
    .from("escuelas")
    .select("id, nombre, cct, subsistema, estado, municipio, created_at")
    .order("nombre");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Panel de Administración</h1>
            <p className="text-sm text-gray-500">CEN Bachillerato</p>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <a href="/admin/escuelas" className="font-medium text-indigo-700">Escuelas</a>
            <a href="/admin/grupos" className="text-gray-600 hover:text-indigo-700">Grupos</a>
            <a href="/admin/usuarios" className="text-gray-600 hover:text-indigo-700">Usuarios</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Escuelas{" "}
            <span className="ml-2 rounded-full bg-gray-100 px-3 py-0.5 text-base font-normal text-gray-500">
              {escuelas?.length ?? 0}
            </span>
          </h2>
          <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            + Agregar escuela
          </button>
        </div>

        {!escuelas || escuelas.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-20 text-center">
            <span className="text-5xl">🏫</span>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Sin escuelas registradas</h3>
            <p className="mt-2 text-gray-500">
              Agrega la primera institución para comenzar a configurar la plataforma.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-500">
                  <th className="px-6 py-3 font-medium">Nombre</th>
                  <th className="px-6 py-3 font-medium">CCT</th>
                  <th className="px-6 py-3 font-medium">Subsistema</th>
                  <th className="px-6 py-3 font-medium">Estado</th>
                  <th className="px-6 py-3 font-medium">Municipio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {escuelas.map((esc) => (
                  <tr key={esc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{esc.nombre}</td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{esc.cct ?? "—"}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs text-blue-700">
                        {esc.subsistema ?? "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{esc.estado ?? "—"}</td>
                    <td className="px-6 py-4 text-gray-500">{esc.municipio ?? "—"}</td>
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
