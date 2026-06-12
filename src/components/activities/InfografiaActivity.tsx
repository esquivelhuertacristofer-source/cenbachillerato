'use client';

import { useState } from 'react';
import type { ActividadInfografia, CallbackProgreso } from '@/types/activities';
import { imagenDeLectura } from '@/lib/contenido/lectura-imagenes';

interface Props {
  actividad: ActividadInfografia;
  onProgreso?: CallbackProgreso;
  /** Código de la UAC, para elegir una imagen temática cuando no hay lámina propia. */
  uacCodigo?: string;
}

export function InfografiaActivity({ actividad, onProgreso, uacCodigo }: Props) {
  const { contenido } = actividad;
  const [respuesta, setRespuesta] = useState('');
  const [completado, setCompletado] = useState(false);
  const [glosarioAbierto, setGlosarioAbierto] = useState(false);
  const [imgError, setImgError] = useState(false);

  // El placeholder genérico no existe en disco; evita el ícono de imagen rota.
  const urlImagen = contenido.url_imagen ?? '';
  const tieneImagen = urlImagen.length > 0 && !urlImagen.includes('/placeholder/') && !imgError;
  // Sin lámina propia → imagen temática con licencia libre acorde a la materia.
  const imagenTematica = imagenDeLectura(uacCodigo, contenido.titulo);

  const tieneContexto = Boolean(contenido.contexto_mexicano?.trim());
  const tieneGlosario = Array.isArray(contenido.glosario) && contenido.glosario.length > 0;
  const tienePreguntas = Array.isArray(contenido.preguntas_reflexion) && contenido.preguntas_reflexion.length > 0;

  function handleCompletar() {
    setCompletado(true);
    onProgreso?.({ actividadId: actividad.id ?? '', completada: true, puntaje: 100 });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">

      {/* Imagen principal */}
      {tieneImagen ? (
        <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
          <img
            src={urlImagen}
            alt={contenido.descripcion_accesible ?? contenido.titulo}
            className="w-full object-contain max-h-[500px]"
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 overflow-hidden bg-white relative">
          <img
            src={imagenTematica}
            alt={contenido.descripcion_accesible ?? contenido.titulo}
            className="w-full object-cover h-56"
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(1,17,38,0.55) 0%, rgba(1,17,38,0.10) 40%, transparent 70%)' }}
          />
          <p className="absolute bottom-3 left-4 right-4 text-xs font-medium text-white/85">
            {contenido.titulo}
          </p>
        </div>
      )}

      {tieneImagen && contenido.fuente && (
        <p className="text-xs text-gray-400">Fuente: {contenido.fuente}</p>
      )}

      {/* Puntos clave */}
      {contenido.puntos_clave && contenido.puntos_clave.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-2">
          <p className="text-sm font-semibold text-gray-700">Puntos clave</p>
          <ul className="space-y-1.5">
            {contenido.puntos_clave.map((punto, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-blue-500 mt-0.5 shrink-0">›</span>
                {punto}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Contexto mexicano */}
      {tieneContexto && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-base" aria-hidden="true">🇲🇽</span>
            <p className="text-sm font-semibold text-amber-900">Contexto mexicano</p>
          </div>
          <p className="text-sm text-amber-800 leading-relaxed">
            {contenido.contexto_mexicano}
          </p>
        </div>
      )}

      {/* Glosario expandible */}
      {tieneGlosario && (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <button
            type="button"
            onClick={() => setGlosarioAbierto((prev) => !prev)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
            aria-expanded={glosarioAbierto}
          >
            <div className="flex items-center gap-2">
              <span className="text-base" aria-hidden="true">📖</span>
              <span className="text-sm font-semibold text-gray-700">
                Glosario ({contenido.glosario!.length} términos)
              </span>
            </div>
            <span
              className="text-gray-400 text-xs transition-transform duration-200"
              style={{ transform: glosarioAbierto ? 'rotate(180deg)' : 'rotate(0deg)' }}
              aria-hidden="true"
            >
              ▼
            </span>
          </button>

          {glosarioAbierto && (
            <div className="border-t border-gray-100 divide-y divide-gray-100">
              {contenido.glosario!.map((item, i) => (
                <div key={i} className="px-5 py-3">
                  <p className="text-sm font-medium text-gray-800">{item.termino}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{item.definicion}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actividad posterior */}
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

      {/* Preguntas para reflexionar */}
      {tienePreguntas && (
        <div className="rounded-xl border border-violet-200 bg-violet-50 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-base" aria-hidden="true">🔍</span>
            <p className="text-sm font-semibold text-violet-900">Preguntas para reflexionar</p>
          </div>
          <ol className="space-y-2 list-none">
            {contenido.preguntas_reflexion!.map((pregunta, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-violet-800">
                <span className="font-semibold shrink-0 text-violet-500">{i + 1}.</span>
                {pregunta}
              </li>
            ))}
          </ol>
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
