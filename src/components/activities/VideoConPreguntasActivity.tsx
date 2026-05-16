'use client';

import { useState } from 'react';
import type { ActividadVideoConPreguntas, CallbackProgreso } from '@/types/activities';

interface Props {
  actividad: ActividadVideoConPreguntas;
  onProgreso?: CallbackProgreso;
}

export function VideoConPreguntasActivity({ actividad, onProgreso }: Props) {
  const { contenido } = actividad;
  const preguntas = contenido.preguntas ?? [];
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});
  const [completado, setCompletado] = useState(false);

  function handleCompletar() {
    setCompletado(true);
    onProgreso?.({ actividadId: actividad.id ?? '', completada: true, puntaje: 100, respuestas });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-xl overflow-hidden border border-gray-200 bg-black aspect-video flex items-center justify-center">
        {contenido.url_video ? (
          <iframe
            src={contenido.url_video}
            title={contenido.titulo_video}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        ) : (
          <p className="text-gray-400 text-sm">Video no disponible</p>
        )}
      </div>

      {contenido.descripcion_video && (
        <p className="text-sm text-gray-600">{contenido.descripcion_video}</p>
      )}

      {preguntas.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700">Preguntas de comprensión</h3>
          {preguntas.map((p, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
              <p className="text-sm font-medium text-gray-800">{i + 1}. {p.pregunta}</p>
              {p.tipo === 'opcion_multiple' && p.opciones ? (
                p.opciones.map((op, oi) => (
                  <label key={oi} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="radio"
                      name={`vq-${i}`}
                      disabled={completado}
                      onChange={() => setRespuestas(r => ({ ...r, [i]: String(oi) }))}
                      className="accent-blue-600"
                    />
                    {op}
                  </label>
                ))
              ) : (
                <textarea
                  disabled={completado}
                  rows={3}
                  placeholder="Tu respuesta..."
                  onChange={e => setRespuestas(r => ({ ...r, [i]: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {!completado && (
        <button
          onClick={handleCompletar}
          className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          Completar actividad
        </button>
      )}
      {completado && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-center text-sm text-green-700 font-medium">
          Actividad completada ✓
        </div>
      )}
    </div>
  );
}
