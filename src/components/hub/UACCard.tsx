import Link from "next/link";

interface UACCardProps {
  codigo: string;
  nombre: string;
  icono?: string;
  colorClass?: string;
  totalProgresiones: number;
  semestre: number;
  tipo: "sociocognitivo" | "area" | "socioemocional";
}

export function UACCard({
  codigo,
  nombre,
  icono = "📚",
  colorClass = "bg-indigo-100 text-indigo-700",
  totalProgresiones,
  semestre,
  tipo,
}: UACCardProps) {
  const tipoBadge: Record<typeof tipo, string> = {
    sociocognitivo: "Recurso Sociocognitivo",
    area: "Área de Conocimiento",
    socioemocional: "Recurso Socioemocional",
  };

  return (
    <Link href={`/hub/uac/${codigo}`}>
      <div className="group flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md">
        <div className="flex items-start justify-between">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${colorClass}`}
          >
            {icono}
          </div>
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500">
            Sem. {semestre}
          </span>
        </div>

        <div>
          <p className="text-xs font-medium text-indigo-600">{tipoBadge[tipo]}</p>
          <h3 className="mt-1 font-semibold text-gray-900 group-hover:text-indigo-700">
            {nombre}
          </h3>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <span className="text-xs text-gray-500">
            {totalProgresiones} progresiones
          </span>
          <span className="text-xs font-medium text-indigo-600 group-hover:underline">
            Ver contenido →
          </span>
        </div>
      </div>
    </Link>
  );
}
