'use client';

import { useState } from 'react';
import type { ActividadInfografia, CallbackProgreso } from '@/types/activities';

interface Props {
  actividad: ActividadInfografia;
  onProgreso?: CallbackProgreso;
}

export function InfografiaActivity({ actividad, onProgreso }: Props) {
  const { contenido } = actividad;
  const [respuesta, setRespuesta] = useState('');
  const [completado, setCompletado] = useState(false);

  function handleCompletar() {
    setCompletado(true);
    onProgreso?.({ actividadId: actividad.id ?? '', completada: true, puntaje: 100 });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
        <img
          src={contenido.url_imagen}
          alt={contenido.descripcion_accesible ?? contenido.titulo}
          className="w-full object-contain max-h-[500px]"
        />
      </div>

      {contenido.fuente && (
        <p className="text-xs text-gray-400">Fuente: {contenido.fuente}</p>
      )}

      {contenido.puntos_clave && contenido.puntos_clave.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-2">
          <p className="text-sm font-semibold text-gray-700">Puntos clave</p>
          <ul className="space-y-1.5">
            {contenido.puntos_clave.map((punto, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-blue-500 mt-0.5">›</span>
                {punto}
              </li>
            ))}
          </ul>
        </div>
      )}

      {contenido.actividad_post && (
        <div className="space-y-3">
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm font-medium text-blue-900">{contenido.actividad_post}</p>
          </div>
          <textarea
            value={respuesta}
            onChange={e => setRespuesta(e.target.value)}
            disabled={completado}
            rows={4}
            placeholder="Escribe tu respuesta..."
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {!completado && (
        <button
          onClick={handleCompletar}
          className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          Marcar como revisado
        </button>
      )}
    </div>
  );
}
