'use client';

import { useState } from 'react';
import type { ActividadGlosarioInteractivo, CallbackProgreso } from '@/types/activities';

interface Props {
  actividad: ActividadGlosarioInteractivo;
  onProgreso?: CallbackProgreso;
}

export function GlosarioInteractivoActivity({ actividad, onProgreso }: Props) {
  const { contenido } = actividad;
  const [dominados, setDominados] = useState<Set<number>>(new Set());
  const [modoFlashcard, setModoFlashcard] = useState(false);
  const [flashIdx, setFlashIdx] = useState(0);
  const [mostrandoDefinicion, setMostrandoDefinicion] = useState(false);
  const [completado, setCompletado] = useState(false);

  function toggleDominado(i: number) {
    setDominados(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  function handleCompletar() {
    setCompletado(true);
    onProgreso?.({ actividadId: actividad.id ?? '', completada: true, puntaje: Math.round((dominados.size / contenido.terminos.length) * 100) });
  }

  if (modoFlashcard) {
    const termino = contenido.terminos[flashIdx] ?? contenido.terminos[0];
    if (!termino) return null;
    return (
      <div className="mx-auto max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={() => setModoFlashcard(false)} className="text-sm text-blue-600">← Volver a lista</button>
          <span className="text-xs text-gray-400">{flashIdx + 1} / {contenido.terminos.length}</span>
        </div>
        <div
          className="rounded-2xl border border-gray-200 bg-white p-8 min-h-[200px] flex flex-col items-center justify-center cursor-pointer gap-4 shadow-sm"
          onClick={() => setMostrandoDefinicion(v => !v)}
        >
          {!mostrandoDefinicion ? (
            <>
              <p className="text-2xl font-bold text-gray-800 text-center">{termino.termino}</p>
              <p className="text-xs text-gray-400">Toca para ver la definición</p>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-700 text-center leading-relaxed">{termino.definicion}</p>
              {termino.ejemplo && <p className="text-xs text-gray-500 italic text-center">Ej: {termino.ejemplo}</p>}
            </>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setFlashIdx(i => Math.max(0, i - 1)); setMostrandoDefinicion(false); }}
            disabled={flashIdx === 0}
            className="flex-1 rounded-lg border border-gray-200 py-2 text-sm text-gray-600 disabled:opacity-40"
          >
            ← Anterior
          </button>
          <button
            onClick={() => { setFlashIdx(i => Math.min(contenido.terminos.length - 1, i + 1)); setMostrandoDefinicion(false); }}
            disabled={flashIdx === contenido.terminos.length - 1}
            className="flex-1 rounded-lg border border-gray-200 py-2 text-sm text-gray-600 disabled:opacity-40"
          >
            Siguiente →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{dominados.size} / {contenido.terminos.length} términos dominados</p>
        <button
          onClick={() => setModoFlashcard(true)}
          className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
        >
          Modo flashcard
        </button>
      </div>

      <div className="space-y-3">
        {contenido.terminos.map((termino, i) => (
          <div key={i} className={`rounded-xl border p-4 transition-colors ${dominados.has(i) ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{termino.termino}</p>
                <p className="mt-1 text-sm text-gray-600">{termino.definicion}</p>
                {termino.ejemplo && (
                  <p className="mt-1 text-xs text-gray-400 italic">Ej: {termino.ejemplo}</p>
                )}
              </div>
              <button
                onClick={() => toggleDominado(i)}
                disabled={completado}
                className={`shrink-0 rounded-full w-7 h-7 text-xs font-bold transition-colors ${dominados.has(i) ? 'bg-green-500 text-white' : 'border border-gray-300 text-gray-400 hover:border-green-400'}`}
              >
                {dominados.has(i) ? '✓' : ''}
              </button>
            </div>
          </div>
        ))}
      </div>

      {!completado && (
        <button
          onClick={handleCompletar}
          disabled={dominados.size === 0}
          className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Completar glosario
        </button>
      )}
    </div>
  );
}
