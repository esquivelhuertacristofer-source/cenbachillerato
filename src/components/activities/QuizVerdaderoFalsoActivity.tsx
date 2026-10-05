'use client';

/**
 * QUIZ VERDADERO O FALSO — una afirmación a la vez.
 *
 * Antes apilaba las 10 afirmaciones en una página larga y la retroalimentación
 * solo aparecía al final. Ahora: una afirmación por pantalla, la respuesta se
 * corrige al instante con su explicación, los puntos permiten volver a las ya
 * vistas y al final hay una pantalla de resultado con lo que se falló.
 *
 * La calificación no cambia: puntaje = aciertos / total (redondeado), aprobada
 * con `puntaje_minimo_aprobacion` (70 por omisión) y `onProgreso` recibe las
 * mismas `respuestas` (índice → booleano) al pulsar «Enviar respuestas».
 */

import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { CircleHelp, Check, X, Send, Eye, Info } from 'lucide-react';
import { springs } from '@/lib/motion/tokens';
import { useReducedMotion } from '@/lib/motion/hooks';
import type { ActividadQuizVerdaderoFalso, CallbackProgreso } from '@/types/activities';
import type { AreaColor } from '@/components/hub/hub-colors';
import { imagenDeLectura } from '@/lib/contenido/lectura-imagenes';
import {
  QUIZ_CSS, quizVars, PortadaQuiz, ProgresoQuiz, RetroQuiz, NavQuiz,
  asomarArriba, enfocarLuego, type ResultadoPunto,
} from './QuizPasoAPaso';

const FALLBACK_COLOR: AreaColor = { hex: '#A78BFA', rgba: '167,139,250', faIcon: 'fa-circle-dot', gradient: '' };

interface Props {
  actividad: ActividadQuizVerdaderoFalso;
  onProgreso?: CallbackProgreso;
  /** Código de la UAC, para elegir una imagen temática cuando no hay lámina propia. */
  uacCodigo?: string;
  color?: AreaColor;
  /**
   * Opcionales: con `estado === 'completada'` y las respuestas guardadas del
   * intento, el quiz abre en modo revisión (resultado + todas las preguntas
   * navegables, sin volver a enviar).
   */
  estado?: 'no_iniciada' | 'en_progreso' | 'completada';
  respuestasIntento?: Record<string, string | boolean>;
}

type Fase = 'quiz' | 'resultado';

/** Las respuestas guardadas llegan como booleanos o como texto 'true'/'false'. */
function leerGuardadas(r: Props['respuestasIntento'], total: number): Record<number, boolean> {
  const out: Record<number, boolean> = {};
  if (!r) return out;
  for (let i = 0; i < total; i++) {
    const v = r[String(i)];
    if (v === true || v === 'true') out[i] = true;
    else if (v === false || v === 'false') out[i] = false;
  }
  return out;
}

const textoValor = (v: boolean) => (v ? 'Verdadero' : 'Falso');

export function QuizVerdaderoFalsoActivity({
  actividad, onProgreso, uacCodigo, color = FALLBACK_COLOR, estado, respuestasIntento,
}: Props) {
  const { contenido } = actividad;
  const preguntas = contenido.preguntas;
  const total = preguntas.length;
  const minPuntaje = contenido.puntaje_minimo_aprobacion ?? 70;
  const reducedMotion = useReducedMotion();
  const modoRevision = estado === 'completada';

  const [guardadas] = useState(() => (modoRevision ? leerGuardadas(respuestasIntento, total) : {}));
  const revisionConDetalle = modoRevision && Object.keys(guardadas).length > 0;

  const [respuestas, setRespuestas] = useState<Record<number, boolean>>(guardadas);
  const [enviado, setEnviado] = useState(revisionConDetalle);
  const [fase, setFase] = useState<Fase>(revisionConDetalle || total === 0 ? 'resultado' : 'quiz');
  const [actual, setActual] = useState(0);
  // Guard síncrono contra doble clic en la misma afirmación (el estado llega
  // un render tarde).
  const lockRef = useRef<number | null>(null);
  const raizRef = useRef<HTMLDivElement>(null);
  const sigRef = useRef<HTMLButtonElement>(null);

  const imagenTematica = imagenDeLectura(uacCodigo, actividad.titulo);
  const respondidas = Object.keys(respuestas).length;

  // Las afirmaciones se responden en orden: la primera sin responder es la
  // frontera; los puntos hasta ella se pueden tocar. En revisión, todos.
  const primeraPendiente = preguntas.findIndex((_, i) => respuestas[i] === undefined);
  const frontera = primeraPendiente === -1 ? total : primeraPendiente;
  const habilitado = (i: number) => enviado || i <= frontera;

  const resultados: ResultadoPunto[] = preguntas.map((p, i) =>
    respuestas[i] === undefined ? undefined : respuestas[i] === p.respuesta ? 'bien' : 'mal',
  );

  function calcularPuntaje() {
    let correctas = 0;
    preguntas.forEach((p, i) => {
      if (respuestas[i] === p.respuesta) correctas++;
    });
    return total > 0 ? Math.round((correctas / total) * 100) : 100;
  }

  function handleEnviar() {
    if (enviado || respondidas < total) return;
    const puntaje = calcularPuntaje();
    setEnviado(true);
    onProgreso?.({
      actividadId: actividad.id ?? '',
      completada: puntaje >= minPuntaje,
      puntaje,
      respuestas,
    });
  }

  function irA(i: number) {
    setActual(i);
    setFase('quiz');
    asomarArriba(raizRef.current, !reducedMotion);
  }

  function verResultado() {
    setFase('resultado');
    asomarArriba(raizRef.current, !reducedMotion);
  }

  function handleResponder(valor: boolean) {
    if (enviado || respuestas[actual] !== undefined || lockRef.current === actual) return;
    lockRef.current = actual;
    setRespuestas((r) => ({ ...r, [actual]: valor }));
    enfocarLuego(sigRef);
  }

  const portada = (
    <PortadaQuiz
      urlImagen={contenido.url_imagen ?? ''}
      imagenTematica={imagenTematica}
      titulo={actividad.titulo}
      icono={<CircleHelp size={26} />}
    />
  );

  const avisoRevision = modoRevision && (
    <div className="qz-aviso">
      <Info size={18} />
      {revisionConDetalle ? (
        <span><b>Ya completaste esta actividad.</b> Esta es una revisión de tus respuestas.</span>
      ) : (
        <span><b>Entrega registrada.</b> La revisión detallada no está disponible; puedes responder de nuevo para repasar.</span>
      )}
    </div>
  );

  // ── RESULTADO ────────────────────────────────────────────────────────────────

  if (fase === 'resultado') {
    const puntaje = calcularPuntaje();
    const aciertos = resultados.filter((r) => r === 'bien').length;
    const aprobado = puntaje >= minPuntaje;
    const fallos = preguntas
      .map((p, i) => ({ p, i }))
      .filter(({ p, i }) => respuestas[i] !== p.respuesta);

    return (
      <div ref={raizRef} className="qz" style={quizVars(color)}>
        <style>{QUIZ_CSS}</style>
        {avisoRevision}
        {portada}
        <ProgresoQuiz actual={null} resultados={resultados} habilitado={habilitado} onIr={irA} />

        <motion.section
          className="qz-bloque qz-resultado"
          data-r={aprobado ? 'bien' : 'mal'}
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reducedMotion ? { duration: 0 } : springs.gentle}
        >
          <h2 className="qz-res-titulo">
            {aprobado ? <Check size={22} color="#4ADE80" /> : <X size={22} color="#F87171" />}
            {aprobado ? 'Aprobado' : 'Sigue intentando'}
          </h2>
          <p className="qz-pct">{puntaje}%</p>
          <p className="qz-res-sub">
            {aciertos} de {total} correctas · Mínimo aprobatorio: {minPuntaje}%
          </p>
        </motion.section>

        <section className="qz-bloque qz-repaso">
          <h3>{fallos.length > 0 ? `Para repasar (${fallos.length})` : 'Para repasar'}</h3>
          {fallos.length === 0 ? (
            <p className="qz-repaso-ok">No fallaste ninguna afirmación. ¡Muy bien!</p>
          ) : (
            fallos.map(({ p, i }) => (
              <div key={i} className="qz-fallo">
                <p className="qz-fallo-enun">{i + 1}. {p.enunciado}</p>
                <p className="qz-fallo-dato">
                  Tu respuesta:{' '}
                  <span className="qz-tuya">
                    {respuestas[i] === undefined ? 'Sin respuesta registrada' : textoValor(respuestas[i]!)}
                  </span>
                  {' · '}Correcta: <span className="qz-buena">{textoValor(p.respuesta)}</span>
                </p>
                {p.retroalimentacion && <p className="qz-fallo-exp">{p.retroalimentacion}</p>}
              </div>
            ))
          )}
        </section>

        <div className="qz-acciones">
          <button type="button" className="qz-btn" onClick={() => irA(0)}>
            <Eye size={18} /> Revisar preguntas
          </button>
          {!enviado ? (
            <button
              type="button"
              className="qz-btn qz-btn-pri"
              onClick={handleEnviar}
              disabled={respondidas < total}
            >
              <Send size={18} /> Enviar respuestas ({respondidas}/{total})
            </button>
          ) : (
            <div className="qz-hecho" role="status">
              <Check size={18} /> Respuestas enviadas
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── UNA AFIRMACIÓN A LA VEZ ──────────────────────────────────────────────────

  const pregunta = preguntas[actual];
  if (!pregunta) return null;
  const elegida = respuestas[actual];
  const respondida = elegida !== undefined;
  // En revisión puede haber afirmaciones sin respuesta guardada: se muestran
  // corregidas igual (con la correcta a la vista), sin botón activo.
  const corregida = respondida || enviado;
  const esUltima = actual + 1 >= total;

  return (
    <div ref={raizRef} className="qz" style={quizVars(color)}>
      <style>{QUIZ_CSS}</style>
      {avisoRevision}
      {portada}
      <ProgresoQuiz actual={actual} resultados={resultados} habilitado={habilitado} onIr={irA} />

      <motion.article
        key={actual}
        className="qz-bloque qz-pregunta"
        initial={reducedMotion ? false : { opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={reducedMotion ? { duration: 0 } : springs.smooth}
      >
        <p className="qz-enunciado">{pregunta.enunciado}</p>

        <div className="qz-vf" role="group" aria-label="¿Verdadero o falso?">
          {([true, false] as const).map((valor) => {
            const esta = elegida === valor;
            const r = !corregida
              ? undefined
              : valor === pregunta.respuesta
                ? (esta ? 'bien' : 'revela')
                : (esta ? 'mal' : 'apagada');
            return (
              <button
                key={String(valor)}
                type="button"
                className="qz-op"
                data-r={r}
                disabled={corregida}
                aria-pressed={esta}
                onClick={() => handleResponder(valor)}
              >
                {r === 'bien' || r === 'revela' ? <Check size={20} /> : r === 'mal' ? <X size={20} /> : null}
                {textoValor(valor)}
              </button>
            );
          })}
        </div>

        {corregida && (
          <RetroQuiz
            bien={elegida === pregunta.respuesta}
            titulo={!respondida ? 'Sin respuesta registrada' : undefined}
            correcta={elegida !== pregunta.respuesta
              ? <>La afirmación es <b>{pregunta.respuesta ? 'verdadera' : 'falsa'}</b>.</>
              : undefined}
            explicacion={pregunta.retroalimentacion}
          />
        )}

        <NavQuiz
          puedeAnterior={actual > 0}
          onAnterior={() => irA(actual - 1)}
          puedeSiguiente={corregida}
          onSiguiente={() => (esUltima ? verResultado() : irA(actual + 1))}
          esUltima={esUltima}
          sigRef={sigRef}
        />
      </motion.article>
    </div>
  );
}
