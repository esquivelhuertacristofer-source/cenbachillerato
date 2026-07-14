'use client';

import { useEffect } from 'react';

export default function HubError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error('[HubError]', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="text-4xl mb-4">📡</div>
        <h2 className="text-xl font-black text-white mb-2">
          No se pudo cargar el hub
        </h2>
        <p className="text-white/50 text-sm mb-6">
          Verifica tu conexión o intenta de nuevo.
        </p>
        <button
          onClick={unstable_retry}
          className="px-5 py-2.5 bg-[#D4A574] text-[#011C40] rounded-xl font-bold text-sm hover:bg-[#c89560] transition-colors"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
