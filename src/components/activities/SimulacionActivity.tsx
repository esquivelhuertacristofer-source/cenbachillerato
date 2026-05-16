'use client';

import { useState } from 'react';
import type { ActividadSimulacion, CallbackProgreso } from '@/types/activities';

interface Props {
  actividad: ActividadSimulacion;
  onProgreso?: CallbackProgreso;
}

export function SimulacionActivity({ actividad, onProgreso }: Props) {
  const { contenido } = actividad;
  const [reporte, setReporte] = useState('');
  const [completado, setCompletado] = useState(false);

  function handleCompletar() {
    setCompletado(true);
    onProgreso?.({ actividadId: actividad.id ?? '', completada: true, puntaje: 100, respuestas: { reporte } });
  }

  const etiquetaTipo: Record<typeof contenido.tipo_simulacion, string> = {
    laboratorio: 'Laboratorio virtual',
    matematica:  'Simulación matemática',
    social:      'Simulación social',
    tecnologia:  'Simulación tecnológica',
    historica:   'Simulación histórica',
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-purple-100 px-3 py-0.5 text-xs font-medium text-purple-700">
          {etiquetaTipo[contenido.tipo_simulacion]}
        </span>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <p className="text-gray-700 leading-relaxed">{contenido.descripcion}</p>
      </div>

      {contenido.instrucciones && contenido.instrucciones.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">Instrucciones</p>
          <ol className="space-y-2">
            {contenido.instrucciones.map((inst, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">{i + 1}</span>
                {inst}
              </li>
            ))}
          </ol>
        </div>
      )}

      {contenido.url_simulacion && (
        <a
          href={contenido.url_simulacion}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full rounded-lg border-2 border-blue-600 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
        >
          Abrir simulación ↗
        </a>
      )}

      {contenido.variables_a_explorar && contenido.variables_a_explorar.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-1">
          <p className="text-xs font-semibold text-gray-500 uppercase">Variables a explorar</p>
          <ul className="space-y-0.5">
            {contenido.variables_a_explorar.map((v, i) => (
              <li key={i} className="text-sm text-gray-700">• {v}</li>
            ))}
          </ul>
        </div>
      )}

      {contenido.preguntas_reflexion && contenido.preguntas_reflexion.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">Preguntas de reflexión</p>
          {contenido.preguntas_reflexion.map((q, i) => (
            <p key={i} className="text-sm text-gray-600 rounded-lg border border-gray-200 bg-white p-3">{i + 1}. {q}</p>
          ))}
        </div>
      )}

      {contenido.reporte_esperado && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">Reporte a entregar</p>
          <p className="text-xs text-gray-500 italic">{contenido.reporte_esperado}</p>
          <textarea
            value={reporte}
            onChange={e => setReporte(e.target.value)}
            disabled={completado}
            rows={6}
            placeholder="Escribe tu reporte aquí..."
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          />
        </div>
      )}

      {!completado && (
        <button
          onClick={handleCompletar}
          className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          Completar simulación
        </button>
      )}
    </div>
  );
}
