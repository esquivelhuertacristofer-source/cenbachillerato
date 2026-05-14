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
    <div className="flex items-start gap-4 rounded-2xl border border-ink-10 bg-white p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-cen-blue/30 text-sm font-bold text-cen-blue/50">
        {numero}
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-40">
          {uacNombre}
        </p>
        <h4 className="mt-0.5 font-semibold text-ink-80">{titulo}</h4>
        <div className="mt-2 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-cen-blue-soft px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.15em] text-cen-blue">
            <span className="h-1.5 w-1.5 rounded-full bg-cen-sky" />
            Próximamente
          </span>
          <span className="text-xs text-ink-40">Contenido en desarrollo</span>
        </div>
      </div>
    </div>
  );
}
