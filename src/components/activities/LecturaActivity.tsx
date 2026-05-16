'use client';

import type { ActividadLectura, CallbackProgreso } from '@/types/activities';

interface Props {
  actividad: ActividadLectura;
  onProgreso?: CallbackProgreso;
}

export function LecturaActivity({ actividad, onProgreso }: Props) {
  const { contenido } = actividad;
  const preguntas = contenido.preguntas_comprension ?? [];

  function handleCompletar() {
    onProgreso?.({
      actividadId: actividad.id ?? '',
      completada: true,
      puntaje: 100,
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Metadatos */}
      <div className="flex items-center gap-3 text-sm text-gray-500">
        {contenido.fuente && (
          <span className="rounded-full bg-gray-100 px-3 py-0.5">
            Fuente: {contenido.fuente}
          </span>
        )}
        {contenido.nivel_lectura && (
          <span className="rounded-full bg-blue-50 px-3 py-0.5 text-blue-700 capitalize">
            {contenido.nivel_lectura}
          </span>
        )}
        {contenido.tiempo_estimado_minutos && (
          <span>{contenido.tiempo_estimado_minutos} min aprox.</span>
        )}
      </div>

      {/* Texto */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 leading-relaxed text-gray-800 whitespace-pre-wrap">
        {contenido.texto}
      </div>

      {/* Preguntas de comprensión */}
      {preguntas.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700">Preguntas de comprensión</h3>
          {preguntas.map((p, i) => (
            <div key={i} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-800">{i + 1}. {p.pregunta}</p>
              {p.respuesta_guia && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-blue-600">Ver respuesta guía</summary>
                  <p className="mt-1 text-xs text-gray-600">{p.respuesta_guia}</p>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleCompletar}
        className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
      >
        Marcar como leído
      </button>
    </div>
  );
}
