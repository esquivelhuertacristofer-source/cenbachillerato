'use client';

import { useState } from 'react';
import type { ActividadDebateEstructurado, CallbackProgreso } from '@/types/activities';

interface Props {
  actividad: ActividadDebateEstructurado;
  onProgreso?: CallbackProgreso;
}

export function DebateEstructuradoActivity({ actividad, onProgreso }: Props) {
  const { contenido } = actividad;
  const [posturaSeleccionada, setPosturaSeleccionada] = useState<number | null>(null);
  const [argumento, setArgumento] = useState('');
  const [entregado, setEntregado] = useState(false);

  function handleEntregar() {
    setEntregado(true);
    onProgreso?.({ actividadId: actividad.id ?? '', completada: true, puntaje: 100, respuestas: { postura: posturaSeleccionada, argumento } });
  }

  const posturaNombre = posturaSeleccionada !== null ? contenido.posturas[posturaSeleccionada] : null;
  const argumentosGuia = posturaNombre && contenido.argumentos_guia ? contenido.argumentos_guia[posturaNombre] : undefined;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Tema a debatir</p>
        <p className="text-lg font-semibold text-gray-800">{contenido.tema}</p>
        {contenido.modalidad && (
          <span className="inline-block rounded-full bg-blue-50 px-3 py-0.5 text-xs text-blue-700 capitalize">{contenido.modalidad}</span>
        )}
      </div>

      {contenido.reglas && contenido.reglas.length > 0 && (
        <details className="rounded-lg border border-gray-200">
          <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-gray-700">Reglas del debate</summary>
          <ul className="px-5 pb-3 space-y-1">
            {contenido.reglas.map((regla, i) => (
              <li key={i} className="text-sm text-gray-600 list-decimal">{regla}</li>
            ))}
          </ul>
        </details>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Elige tu postura</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {contenido.posturas.map((postura, i) => (
            <button
              key={i}
              disabled={entregado}
              onClick={() => setPosturaSeleccionada(i)}
              className={`rounded-xl border p-4 text-sm font-medium text-left transition-colors
                ${posturaSeleccionada === i ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >
              {postura}
            </button>
          ))}
        </div>
      </div>

      {posturaSeleccionada !== null && argumentosGuia && argumentosGuia.length > 0 && (
        <div className="rounded-lg border border-amber-100 bg-amber-50 p-4 space-y-1">
          <p className="text-xs font-semibold text-amber-700 uppercase">Argumentos guía para tu postura</p>
          <ul className="space-y-1">
            {argumentosGuia.map((arg, i) => (
              <li key={i} className="text-sm text-amber-900 flex items-start gap-2">
                <span className="mt-0.5">•</span>{arg}
              </li>
            ))}
          </ul>
        </div>
      )}

      {posturaSeleccionada !== null && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Desarrolla tu argumento</label>
          <textarea
            value={argumento}
            onChange={e => setArgumento(e.target.value)}
            disabled={entregado}
            rows={6}
            placeholder="Argumenta tu postura con evidencias, ejemplos y razonamientos..."
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          />
        </div>
      )}

      {!entregado && (
        <button
          onClick={handleEntregar}
          disabled={posturaSeleccionada === null || argumento.trim().length < 30}
          className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Entregar postura y argumentos
        </button>
      )}
      {entregado && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-center text-sm text-green-700 font-medium">
          Debate entregado para revisión ✓
        </div>
      )}
    </div>
  );
}
