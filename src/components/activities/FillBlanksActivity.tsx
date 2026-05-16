'use client';

import { useState, useMemo } from 'react';
import type { ActividadFillBlanks, CallbackProgreso } from '@/types/activities';

interface Props {
  actividad: ActividadFillBlanks;
  onProgreso?: CallbackProgreso;
}

export function FillBlanksActivity({ actividad, onProgreso }: Props) {
  const { contenido } = actividad;
  const [valores, setValores] = useState<Record<number, string>>({});
  const [enviado, setEnviado] = useState(false);

  const partes = useMemo(() => contenido.texto_con_huecos.split('___'), [contenido.texto_con_huecos]);
  const numHuecos = partes.length - 1;

  function esCorrecta(hueco: number) {
    const h = contenido.huecos[hueco];
    if (!h) return false;
    const v = valores[hueco]?.trim() ?? '';
    const comparar = (a: string, b: string) =>
      contenido.distingue_mayusculas ? a === b : a.toLowerCase() === b.toLowerCase();
    return comparar(v, h.respuesta_correcta) ||
      (h.alternativas_aceptadas ?? []).some(alt => comparar(v, alt));
  }

  function handleEnviar() {
    const correctas = Array.from({ length: numHuecos }, (_, i) => esCorrecta(i)).filter(Boolean).length;
    const puntaje = Math.round((correctas / numHuecos) * 100);
    setEnviado(true);
    onProgreso?.({
      actividadId: actividad.id ?? '',
      completada: puntaje >= 70,
      puntaje,
      respuestas: valores,
    });
  }

  const completadas = Object.values(valores).filter(v => v.trim().length > 0).length;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {contenido.instrucciones && (
        <p className="text-sm text-gray-600 italic">{contenido.instrucciones}</p>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-6 leading-relaxed text-gray-800 text-base">
        {partes.map((parte, i) => (
          <span key={i}>
            {parte}
            {i < numHuecos && (
              <span className="inline-flex flex-col items-center mx-1">
                <input
                  type="text"
                  disabled={enviado}
                  value={valores[i] ?? ''}
                  onChange={e => setValores(v => ({ ...v, [i]: e.target.value }))}
                  placeholder={contenido.huecos[i]?.pista ?? '...'}
                  className={`inline w-28 border-b-2 bg-transparent px-1 text-center text-sm font-medium outline-none transition-colors
                    ${enviado
                      ? esCorrecta(i) ? 'border-green-500 text-green-700' : 'border-red-400 text-red-700'
                      : 'border-blue-400 focus:border-blue-600'}`}
                />
                {enviado && !esCorrecta(i) && (
                  <span className="text-xs text-green-700">({contenido.huecos[i]?.respuesta_correcta})</span>
                )}
              </span>
            )}
          </span>
        ))}
      </div>

      {!enviado && (
        <button
          onClick={handleEnviar}
          disabled={completadas < numHuecos}
          className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Verificar respuestas
        </button>
      )}
    </div>
  );
}
