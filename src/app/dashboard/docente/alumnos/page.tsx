import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Alumnos — Dashboard Docente | CEN Bachillerato",
};

export default function AlumnosPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-2xl font-bold text-gray-900">Alumnos</h1>
        <p className="mt-2 text-gray-500">Gestión de alumnos por grupo y semestre.</p>

        <div className="mt-8 flex flex-col items-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-20 text-center">
          <span className="text-5xl">👥</span>
          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            Próximamente
          </h2>
          <p className="mt-2 text-gray-500">
            Vista de alumnos con progreso por UAC, progresión y actividad.
          </p>
        </div>
      </div>
    </div>
  );
}
