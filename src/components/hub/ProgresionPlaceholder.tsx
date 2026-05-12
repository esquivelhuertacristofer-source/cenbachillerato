interface ProgresionPlaceholderProps {
  numero: number;
  titulo: string;
  uacNombre: string;
}

export function ProgresionPlaceholder({
  numero,
  titulo,
  uacNombre,
}: ProgresionPlaceholderProps) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-gray-300 text-sm font-semibold text-gray-400">
        {numero}
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium text-gray-400">{uacNombre}</p>
        <h4 className="mt-0.5 font-medium text-gray-700">{titulo}</h4>
        <div className="mt-2 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs text-amber-700">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Próximamente
          </span>
          <span className="text-xs text-gray-400">Contenido en desarrollo</span>
        </div>
      </div>
    </div>
  );
}
