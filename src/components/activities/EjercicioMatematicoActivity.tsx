'use client';

import { useState } from 'react';
import type { ActividadEjercicioMatematico, CallbackProgreso } from '@/types/activities';

interface Props {
  actividad: ActividadEjercicioMatematico;
  onProgreso?: CallbackProgreso;
}

export function EjercicioMatematicoActivity({ actividad, onProgreso }: Props) {
  const { contenido } = actividad;
  const [respuesta, setRespuesta] = useState('');
  const [mostrarSolucion, setMostrarSolucion] = useState(false);
  const [completado, setCompletado] = useState(false);

  function handleVerificar() {
    if (contenido.tipo_respuesta === 'desarrollo') {
      setMostrarSolucion(true);
      setCompletado(true);
      onProgreso?.({ actividadId: actividad.id ?? '', completada: true, puntaje: 100 });
      return;
    }
    const tolerancia = contenido.tolerancia_error ?? 0;
    const esperada = parseFloat(contenido.respuesta_final ?? '');
    const dada = parseFloat(respuesta);
    const correcta = !isNaN(esperada) && !isNaN(dada) && Math.abs(dada - esperada) <= tolerancia;
    setMostrarSolucion(true);
    setCompletado(correcta);
    onProgreso?.({ actividadId: actividad.id ?? '', completada: correcta, puntaje: correcta ? 100 : 0 });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {contenido.contexto && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold mb-1">Contexto</p>
          {contenido.contexto}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <p className="font-semibold text-gray-800 mb-2">Problema</p>
        <p className="text-gray-700 leading-relaxed">{contenido.problema}</p>
        {contenido.imagen_problema && (
          <img src={contenido.imagen_problema} alt="Imagen del problema" className="mt-4 rounded-lg max-h-48 object-contain" />
        )}
      </div>

      {contenido.pasos_guia && contenido.pasos_guia.length > 0 && (
        <details className="rounded-lg border border-gray-200 bg-gray-50">
          <summary className="cursor-pointer p-4 text-sm font-medium text-gray-700">Ver guía de resolución paso a paso</summary>
          <ol className="px-6 pb-4 space-y-2">
            {contenido.pasos_guia.map((paso, i) => (
              <li key={i} className="text-sm text-gray-700 list-decimal">{paso}</li>
            ))}
          </ol>
        </details>
      )}

      {contenido.tipo_respuesta !== 'desarrollo' ? (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Tu respuesta {contenido.unidades && `(${contenido.unidades})`}
          </label>
          <input
            type="text"
            value={respuesta}
            onChange={e => setRespuesta(e.target.value)}
            disabled={mostrarSolucion}
            placeholder="Escribe tu resultado..."
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Desarrollo de tu solución</p>
          <textarea
            value={respuesta}
            onChange={e => setRespuesta(e.target.value)}
            disabled={mostrarSolucion}
            rows={5}
            placeholder="Escribe tu procedimiento aquí..."
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 resize-y"
          />
        </div>
      )}

      {mostrarSolucion && contenido.respuesta_final && (
        <div className={`rounded-lg border p-4 ${completado ? 'border-green-200 bg-green-50' : 'border-blue-100 bg-blue-50'}`}>
          <p className="text-sm font-semibold text-gray-700 mb-1">Solución correcta</p>
          <p className="text-sm text-gray-800">{contenido.respuesta_final} {contenido.unidades}</p>
        </div>
      )}

      {!mostrarSolucion && (
        <button
          onClick={handleVerificar}
          disabled={respuesta.trim().length === 0}
          className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {contenido.tipo_respuesta === 'desarrollo' ? 'Ver solución' : 'Verificar respuesta'}
        </button>
      )}
    </div>
  );
}
