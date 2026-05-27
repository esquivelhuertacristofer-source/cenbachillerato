'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#011C40]">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-6">⚠️</div>
        <h2 className="text-2xl font-black text-white mb-3 tracking-tight">
          Algo salió mal
        </h2>
        <p className="text-white/60 mb-8 text-sm leading-relaxed">
          {error.message && error.message !== 'undefined'
            ? error.message
            : 'Ocurrió un error inesperado. Intenta de nuevo o recarga la página.'}
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-[#D4A574] text-[#011C40] rounded-xl font-bold text-sm hover:bg-[#c89560] transition-colors"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
