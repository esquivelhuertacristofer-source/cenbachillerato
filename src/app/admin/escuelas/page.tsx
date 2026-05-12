import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gestión de Escuelas — Admin | CEN Bachillerato",
};

export default function EscuelasPage() {
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
          <h2 className="text-2xl font-bold text-gray-900">Escuelas</h2>
          <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            + Agregar escuela
          </button>
        </div>

        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-20 text-center">
          <span className="text-5xl">🏫</span>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            Sin escuelas registradas
          </h3>
          <p className="mt-2 text-gray-500">
            Agrega la primera institución para comenzar a configurar la plataforma.
          </p>
        </div>
      </main>
    </div>
  );
}
