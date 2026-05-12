import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reportes — Dashboard Docente | CEN Bachillerato",
};

export default function ReportesPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
        <p className="mt-2 text-gray-500">Generación de reportes institucionales para la SEP.</p>

        <div className="mt-8 flex flex-col items-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-20 text-center">
          <span className="text-5xl">📋</span>
          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            Próximamente
          </h2>
          <p className="mt-2 text-gray-500">
            Reportes automatizados en formato SEP: asistencia, calificaciones, avance curricular.
          </p>
        </div>
      </div>
    </div>
  );
}
