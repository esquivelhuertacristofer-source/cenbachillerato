'use client';

import { useState } from 'react';
import type { ActividadAutoevaluacion, CallbackProgreso } from '@/types/activities';

interface Props {
  actividad: ActividadAutoevaluacion;
  onProgreso?: CallbackProgreso;
}

export function AutoevaluacionActivity({ actividad, onProgreso }: Props) {
  const { contenido } = actividad;
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const [reflexion, setReflexion] = useState('');
  const [entregado, setEntregado] = useState(false);

  const totalCriterios = contenido.criterios.length;
  const respondidos = Object.keys(respuestas).length;
  const todosRespondidos = respondidos === totalCriterios;

  function handleSeleccion(criterioIdx: number, valor: number) {
    if (entregado) return;
    setRespuestas(prev => ({ ...prev, [criterioIdx]: valor }));
  }

  function handleEntregar() {
    setEntregado(true);
    const puntaje = totalCriterios > 0
      ? Math.round((Object.values(respuestas).reduce((a, b) => a + b, 0) / (totalCriterios * Math.max(...contenido.criterios.flatMap(c => c.escala.map(e => e.valor))))) * 100)
      : 100;
    onProgreso?.({ actividadId: actividad.id ?? '', completada: true, puntaje, respuestas: { criterios: respuestas, reflexion } });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {contenido.instrucciones && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
          <p className="text-sm text-blue-800">{contenido.instrucciones}</p>
        </div>
      )}

      <div className="space-y-4">
        {contenido.criterios.map((criterio, ci) => {
          const seleccionado = respuestas[ci];
          return (
            <div key={ci} className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
              <p className="text-sm font-semibold text-gray-800">{criterio.descripcion}</p>
              <div className="flex flex-wrap gap-2">
                {criterio.escala.map((nivel) => {
                  const activo = seleccionado === nivel.valor;
                  return (
                    <button
                      key={nivel.valor}
                      disabled={entregado}
                      onClick={() => handleSeleccion(ci, nivel.valor)}
                      title={nivel.descripcion}
                      className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors
                        ${activo
                          ? 'border-blue-500 bg-blue-600 text-white'
                          : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                        } disabled:cursor-not-allowed`}
                    >
                      {nivel.etiqueta}
                    </button>
                  );
                })}
              </div>
              {seleccionado !== undefined && (
                <p className="text-xs text-gray-400 italic">
                  {criterio.escala.find(e => e.valor === seleccionado)?.descripcion}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {contenido.reflexion_final_prompt && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">{contenido.reflexion_final_prompt}</label>
          <textarea
            value={reflexion}
            onChange={e => setReflexion(e.target.value)}
            disabled={entregado}
            rows={4}
            placeholder="Escribe tu reflexión..."
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          />
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{respondidos} / {totalCriterios} criterios evaluados</span>
        {contenido.visible_para_docente && (
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-600 border border-amber-100">Visible para docente</span>
        )}
      </div>

      {!entregado ? (
        <button
          onClick={handleEntregar}
          disabled={!todosRespondidos}
          className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Entregar autoevaluación
        </button>
      ) : (
        <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-center text-sm text-green-700 font-medium">
          Autoevaluación entregada ✓
        </div>
      )}
    </div>
  );
}
