'use client';

import { useEffect } from 'react';

export default function DocenteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[DocenteError]', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#011C40] p-6">
      <div className="text-center max-w-sm">
        <div className="text-4xl mb-4">🔌</div>
        <h2 className="text-xl font-black text-white mb-2 tracking-tight">
          Error al cargar el dashboard
        </h2>
        <p className="text-white/50 text-sm mb-6">
          No se pudieron obtener los datos del grupo. Verifica tu conexión o contacta soporte.
        </p>
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-[#D4A574] text-[#011C40] rounded-xl font-bold text-sm hover:bg-[#c89560] transition-colors"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
