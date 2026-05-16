'use client';

import { useState } from 'react';
import type { ActividadReflexionEscrita, CallbackProgreso } from '@/types/activities';

interface Props {
  actividad: ActividadReflexionEscrita;
  onProgreso?: CallbackProgreso;
}

export function ReflexionEscritaActivity({ actividad, onProgreso }: Props) {
  const { contenido } = actividad;
  const [texto, setTexto] = useState('');
  const [enviado, setEnviado] = useState(false);

  const palabras = texto.trim().split(/\s+/).filter(Boolean).length;
  const minPalabras = contenido.longitud_minima_palabras ?? 80;
  const cumpleMinimo = palabras >= minPalabras;

  function handleEnviar() {
    setEnviado(true);
    onProgreso?.({
      actividadId: actividad.id ?? '',
      completada: true,
      puntaje: 100,
      respuestas: { texto },
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
        <p className="font-medium text-blue-900 leading-relaxed">{contenido.prompt}</p>
      </div>

      {contenido.pistas && contenido.pistas.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pistas para guiar tu reflexión</p>
          <ul className="space-y-1">
            {contenido.pistas.map((pista, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="mt-0.5 text-blue-400">•</span>
                {pista}
              </li>
            ))}
          </ul>
        </div>
      )}

      {contenido.criterios_evaluacion && contenido.criterios_evaluacion.length > 0 && (
        <details className="rounded-lg border border-gray-200">
          <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-gray-700">Ver criterios de evaluación</summary>
          <ul className="px-5 pb-3 space-y-1">
            {contenido.criterios_evaluacion.map((criterio, i) => (
              <li key={i} className="text-sm text-gray-600 list-disc">{criterio}</li>
            ))}
          </ul>
        </details>
      )}

      <div className="space-y-2">
        <textarea
          value={texto}
          onChange={e => setTexto(e.target.value)}
          disabled={enviado}
          rows={8}
          placeholder="Escribe tu reflexión aquí..."
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 resize-y"
        />
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{palabras} palabras</span>
          <span className={cumpleMinimo ? 'text-green-600' : ''}>
            Mínimo: {minPalabras} palabras
            {cumpleMinimo && ' ✓'}
          </span>
        </div>
      </div>

      {enviado ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center text-sm text-green-700 font-medium">
          Reflexión entregada. Tu docente la revisará pronto.
        </div>
      ) : (
        <button
          onClick={handleEnviar}
          disabled={!cumpleMinimo}
          className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Entregar reflexión
        </button>
      )}
    </div>
  );
}
