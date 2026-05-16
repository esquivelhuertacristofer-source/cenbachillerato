'use client';

import { useState } from 'react';
import type { ActividadQuizMultipleOpcion, CallbackProgreso } from '@/types/activities';

interface Props {
  actividad: ActividadQuizMultipleOpcion;
  onProgreso?: CallbackProgreso;
}

export function QuizMultipleOpcionActivity({ actividad, onProgreso }: Props) {
  const { contenido } = actividad;
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const [enviado, setEnviado] = useState(false);

  const total = contenido.preguntas.length;
  const respondidas = Object.keys(respuestas).length;

  function calcularPuntaje() {
    let correctas = 0;
    contenido.preguntas.forEach((p, i) => {
      if (respuestas[i] === p.respuesta_correcta) correctas++;
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
            {aprobado ? 'Aprobado ✓' : `Mínimo requerido: ${contenido.puntaje_minimo_aprobacion ?? 70}%`}
          </p>
        </div>
      )}

      <div className="space-y-6">
        {contenido.preguntas.map((pregunta, pi) => {
          const seleccionada = respuestas[pi];
          const esCorrecta = enviado && seleccionada === pregunta.respuesta_correcta;
          const esIncorrecta = enviado && seleccionada !== undefined && !esCorrecta;

          return (
            <div key={pi} className={`rounded-xl border p-5 ${enviado && esCorrecta ? 'border-green-200 bg-green-50' : enviado && esIncorrecta ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'}`}>
              <p className="mb-3 font-medium text-gray-800">{pi + 1}. {pregunta.enunciado}</p>
              <div className="space-y-2">
                {pregunta.opciones.map((opcion, oi) => {
                  const seleccionadaEsta = seleccionada === oi;
                  const correctaEsta = enviado && oi === pregunta.respuesta_correcta;
                  return (
                    <label
                      key={oi}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors
                        ${correctaEsta ? 'border-green-400 bg-green-100' : seleccionadaEsta && enviado ? 'border-red-400 bg-red-100' : seleccionadaEsta ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                      <input
                        type="radio"
                        name={`pregunta-${pi}`}
                        value={oi}
                        disabled={enviado}
                        checked={seleccionada === oi}
                        onChange={() => setRespuestas(r => ({ ...r, [pi]: oi }))}
                        className="accent-blue-600"
                      />
                      {opcion}
                    </label>
                  );
                })}
              </div>
              {enviado && pregunta.retroalimentacion && (
                <p className="mt-3 text-xs text-gray-600 italic">{pregunta.retroalimentacion}</p>
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
