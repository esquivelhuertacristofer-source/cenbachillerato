'use client';

import { useState } from 'react';
import type { ActividadQuizVerdaderoFalso, CallbackProgreso } from '@/types/activities';

interface Props {
  actividad: ActividadQuizVerdaderoFalso;
  onProgreso?: CallbackProgreso;
}

export function QuizVerdaderoFalsoActivity({ actividad, onProgreso }: Props) {
  const { contenido } = actividad;
  const [respuestas, setRespuestas] = useState<Record<number, boolean>>({});
  const [enviado, setEnviado] = useState(false);

  const total = contenido.preguntas.length;
  const respondidas = Object.keys(respuestas).length;

  function calcularPuntaje() {
    let correctas = 0;
    contenido.preguntas.forEach((p, i) => {
      if (respuestas[i] === p.respuesta) correctas++;
    });
    return Math.round((correctas / total) * 100);
  }

  function handleEnviar() {
    if (respondidas < total) return;
    const puntaje = calcularPuntaje();
    setEnviado(true);
    onProgreso?.({
      actividadId: actividad.id ?? '',
      completada: puntaje >= (contenido.puntaje_minimo_aprobacion ?? 70),
      puntaje,
      respuestas,
    });
  }

  const puntaje = enviado ? calcularPuntaje() : null;
  const aprobado = puntaje !== null && puntaje >= (contenido.puntaje_minimo_aprobacion ?? 70);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {enviado && puntaje !== null && (
        <div className={`rounded-xl border p-4 text-center ${aprobado ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <p className={`text-2xl font-bold ${aprobado ? 'text-green-700' : 'text-red-700'}`}>{puntaje}%</p>
          <p className={`text-sm ${aprobado ? 'text-green-600' : 'text-red-600'}`}>
            {aprobado ? 'Aprobado ✓' : 'Sigue intentando'}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {contenido.preguntas.map((pregunta, pi) => {
          const seleccionada = respuestas[pi];
          const esCorrecta = enviado && seleccionada === pregunta.respuesta;

          return (
            <div
              key={pi}
              className={`rounded-xl border p-5 ${enviado ? (esCorrecta ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50') : 'border-gray-200 bg-white'}`}
            >
              <p className="mb-3 font-medium text-gray-800">{pi + 1}. {pregunta.enunciado}</p>
              <div className="flex gap-3">
                {([true, false] as const).map((valor) => {
                  const seleccionadaEsta = seleccionada === valor;
                  const correctaEsta = enviado && valor === pregunta.respuesta;
                  return (
                    <button
                      key={String(valor)}
                      disabled={enviado}
                      onClick={() => setRespuestas(r => ({ ...r, [pi]: valor }))}
                      className={`flex-1 rounded-lg border py-2.5 text-sm font-semibold transition-colors
                        ${correctaEsta ? 'border-green-400 bg-green-100 text-green-800'
                          : seleccionadaEsta && enviado ? 'border-red-400 bg-red-100 text-red-800'
                          : seleccionadaEsta ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                      {valor ? 'Verdadero' : 'Falso'}
                    </button>
                  );
                })}
              </div>
              {enviado && pregunta.retroalimentacion && (
                <p className="mt-2 text-xs text-gray-600 italic">{pregunta.retroalimentacion}</p>
              )}
            </div>
          );
        })}
      </div>

      {!enviado && (
        <button
          onClick={handleEnviar}
          disabled={respondidas < total}
          className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Enviar respuestas ({respondidas}/{total})
        </button>
      )}
    </div>
  );
}
