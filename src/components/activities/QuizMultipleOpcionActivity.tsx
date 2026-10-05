'use client';

/**
 * QUIZ DE OPCIÓN MÚLTIPLE — una pregunta a la vez.
 *
 * Cada respuesta se corrige al instante con su explicación; el alumno pasa a
 * la siguiente cuando quiere (WCAG 2.2.1, sin avance automático). Los puntos
 * permiten volver a las preguntas ya vistas y al final hay una pantalla de
 * resultado con aciertos, lo que se falló y el botón para entregar.
 *
 * La calificación no cambia: puntaje = aciertos / total (redondeado), aprobada
 * con `puntaje_minimo_aprobacion` (70 por omisión) y `onProgreso` recibe las
 * mismas `respuestas` (índice de pregunta → índice de opción elegida).
 */

import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ListChecks, Check, RotateCcw, ArrowRight, Trophy, Sparkles, Clock, Eye, X } from 'lucide-react';
import { springs } from '@/lib/motion/tokens';
import { useReducedMotion } from '@/lib/motion/hooks';
import { celebrate, fireworks } from '@/lib/motion/celebrate';
import type { ActividadQuizMultipleOpcion, CallbackProgreso } from '@/types/activities';
import type { AreaColor } from '@/components/hub/hub-colors';
import { imagenDeLectura } from '@/lib/contenido/lectura-imagenes';
import {
  QUIZ_CSS, quizVars, PortadaQuiz, ProgresoQuiz, RetroQuiz, NavQuiz,
  asomarArriba, enfocarLuego, type ResultadoPunto,
} from './QuizPasoAPaso';

const FALLBACK_COLOR: AreaColor = { hex: '#A78BFA', rgba: '167,139,250', faIcon: 'fa-circle-dot', gradient: '' };
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

interface Props {
  actividad: ActividadQuizMultipleOpcion;
  onProgreso?: CallbackProgreso;
  /** Código de la UAC, para elegir una imagen temática cuando no hay lámina propia. */
  uacCodigo?: string;
  color?: AreaColor;
  estado?: 'no_iniciada' | 'en_progreso' | 'completada';
  respuestasIntento?: Record<string, string>;
}

type Fase = 'quiz' | 'resumen';
type EstadoOpcion = 'bien' | 'mal' | 'revela' | 'apagada' | undefined;

// ── CounterAnimation ───────────────────────────────────────────────────────────

function CounterAnimation({ to, duracion = 1.2, sufijo = '' }: { to: number; duracion?: number; sufijo?: string }) {
  const reducedMotion = useReducedMotion();
  const [count, setCount] = useState(reducedMotion ? to : 0);
  const started = useRef(false);

  useEffect(() => {
    if (reducedMotion) return;
    if (started.current) return;
    started.current = true;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / duracion, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(to * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [to, duracion, reducedMotion]);

  return <>{count}{sufijo}</>;
}

function formatTiempo(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

// ── Main component ─────────────────────────────────────────────────────────────

export function QuizMultipleOpcionActivity({ actividad, onProgreso, uacCodigo, color = FALLBACK_COLOR, estado, respuestasIntento }: Props) {
  const { contenido } = actividad;
  const preguntas = contenido.preguntas;
  const total = preguntas.length;
  const minPuntaje = contenido.puntaje_minimo_aprobacion ?? 70;
  const reducedMotion = useReducedMotion();
  const modoRevision = estado === 'completada';
  const fireworksFired = useRef(false);

  // Respuestas previas para el modo revisión. Si `respuestas` llegó null o
  // vacío desde la BD (intentos históricos, o detalle almacenado fuera de la
  // fila), NO fabricamos respuestas con '-1': eso marcaba todo como incorrecto
  // y el resumen mostraba un "0 aciertos" engañoso. En ese caso el resumen cae
  // al estado neutral (ver abajo). Si hay respuestas pero falta alguna
  // pregunta, esa sí queda en -1 ("sin respuesta registrada"), como antes.
  const [guardadas] = useState<Record<number, number>>(() => {
    const tiene = !!respuestasIntento && Object.keys(respuestasIntento).length > 0;
    if (!modoRevision || !respuestasIntento || !tiene) return {};
    const out: Record<number, number> = {};
    preguntas.forEach((_, i) => {
      out[i] = parseInt(respuestasIntento[String(i)] ?? '-1', 10);
    });
    return out;
  });

  const [fase, setFase] = useState<Fase>(modoRevision || total === 0 ? 'resumen' : 'quiz');
  const [actual, setActual] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<number, number>>(guardadas);
  const [entregado, setEntregado] = useState(false);
  // Tras «Volver a hacer» ya no es la revisión del intento guardado.
  const [rehaciendo, setRehaciendo] = useState(false);
  const [tiempoTotal, setTiempoTotal] = useState(0);
  const inicioRef = useRef(0);
  // Guard síncrono contra doble clic: el estado llega un render tarde entre
  // dos clics en el mismo tick y duplicaba la respuesta. lockRef bloquea de
  // inmediato la pregunta en curso.
  const lockRef = useRef<number | null>(null);
  const raizRef = useRef<HTMLDivElement>(null);
  const sigRef = useRef<HTMLButtonElement>(null);

  const revisionGuardada = modoRevision && !rehaciendo;
  const imagenTematica = imagenDeLectura(uacCodigo, actividad.titulo);

  useEffect(() => {
    inicioRef.current = Date.now();
  }, []);

  const resultados: ResultadoPunto[] = preguntas.map((p, i) =>
    respuestas[i] === undefined ? undefined : respuestas[i] === p.respuesta_correcta ? 'bien' : 'mal',
  );
  const aciertos = resultados.filter((r) => r === 'bien').length;
  const pct = total > 0 ? Math.round((aciertos / total) * 100) : 0;

  // Las preguntas se responden en orden: los puntos hasta la primera sin
  // responder se pueden tocar; con todas respondidas (o en revisión), todos.
  const primeraPendiente = preguntas.findIndex((_, i) => respuestas[i] === undefined);
  const frontera = primeraPendiente === -1 ? total : primeraPendiente;
  const habilitado = (i: number) => i <= frontera;

  // fireworks en el resumen si score >= 80
  useEffect(() => {
    if (fase === 'resumen' && !fireworksFired.current) {
      if (pct >= 80 && !reducedMotion) {
        fireworksFired.current = true;
        setTimeout(() => { void fireworks(); }, 400);
      }
    }
  // `pct` se calcula de respuestas ya estables; solo `fase` es reactiva aquí —
  // añadir lo demás volvería a disparar en cada respuesta.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase]);

  function irA(i: number) {
    setActual(i);
    setFase('quiz');
    asomarArriba(raizRef.current, !reducedMotion);
  }

  function verResumen() {
    if (tiempoTotal === 0 && !revisionGuardada) {
      setTiempoTotal(Math.round((Date.now() - inicioRef.current) / 1000));
    }
    setFase('resumen');
    asomarArriba(raizRef.current, !reducedMotion);
  }

  function handleSeleccion(indice: number) {
    if (respuestas[actual] !== undefined || lockRef.current === actual) return;
    lockRef.current = actual;
    const correcta = indice === preguntas[actual]?.respuesta_correcta;
    setRespuestas((r) => ({ ...r, [actual]: indice }));
    if (correcta && !reducedMotion) {
      void celebrate('small');
    }
    // El avance NO es automático: el alumno lee la retroalimentación a su
    // ritmo y pulsa "Siguiente" cuando esté listo (WCAG 2.2.1).
    enfocarLuego(sigRef);
  }

  function handleReiniciar() {
    lockRef.current = null;
    fireworksFired.current = false;
    inicioRef.current = Date.now();
    setRehaciendo(true);
    setRespuestas({});
    setActual(0);
    setTiempoTotal(0);
    setEntregado(false);
    setFase('quiz');
    asomarArriba(raizRef.current, !reducedMotion);
  }

  function handleEntregar() {
    if (entregado) return;
    setEntregado(true);
    onProgreso?.({
      actividadId: actividad.id ?? '',
      completada: pct >= minPuntaje,
      puntaje: pct,
      respuestas: preguntas.reduce<Record<number, number>>((acc, _, i) => ({ ...acc, [i]: respuestas[i] ?? -1 }), {}),
    });
  }

  const portada = (
    <PortadaQuiz
      urlImagen={contenido.url_imagen ?? ''}
      imagenTematica={imagenTematica}
      titulo={actividad.titulo}
      icono={<ListChecks size={26} />}
    />
  );

  const bannerRevision = revisionGuardada && (
    <div className="qz-aviso">
      <Check size={18} />
      <span><b>Ya completaste este quiz.</b> Esta es una revisión.</span>
    </div>
  );

  // ── RESUMEN ──────────────────────────────────────────────────────────────────

  if (fase === 'resumen') {
    // Estado neutral de revisión: el intento existe pero no hay respuestas
    // guardadas que reconstruir. No inventamos aciertos ni porcentajes:
    // reconocemos la entrega y ofrecemos rehacer.
    const sinDetalleRevision = revisionGuardada && Object.keys(respuestas).length === 0;

    if (sinDetalleRevision) {
      return (
        <div ref={raizRef} className="qz" style={quizVars(color)}>
          <style>{QUIZ_CSS}</style>
          {bannerRevision}
          <section className="qz-bloque qz-neutral">
            <ListChecks size={44} />
            <h2>Entrega registrada</h2>
            <p>
              La revisión detallada no está disponible para este intento.
              Puedes volver a hacer el quiz si quieres repasarlo.
            </p>
          </section>
          {/* Solo "Volver a hacer": re-entregar sin respuestas registraría un
              puntaje de 0 que no corresponde. */}
          <div className="qz-acciones">
            <button type="button" className="qz-btn" onClick={handleReiniciar}>
              <RotateCcw size={18} /> Volver a hacer
            </button>
          </div>
        </div>
      );
    }

    const aprobado = pct >= minPuntaje;
    const fallos = preguntas
      .map((p, i) => ({ p, i, sel: respuestas[i] }))
      .filter(({ p, sel }) => sel !== p.respuesta_correcta);

    return (
      <div ref={raizRef} className="qz" style={quizVars(color)}>
        <style>{QUIZ_CSS}</style>
        {bannerRevision}
        <ProgresoQuiz actual={null} resultados={resultados} habilitado={habilitado} onIr={irA} />

        <motion.section
          className="qz-bloque qz-resultado"
          data-r={aprobado ? 'bien' : 'mal'}
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reducedMotion ? { duration: 0 } : springs.gentle}
        >
          <h2 className="qz-res-titulo">
            {aprobado
              ? <Trophy size={24} color={color.hex} />
              : <Sparkles size={24} color="rgba(255,255,255,0.55)" />}
            {aprobado ? '¡Excelente trabajo!' : 'Buen intento'}
          </h2>
          <p className="qz-pct"><CounterAnimation to={pct} sufijo="%" /></p>
          <p className="qz-res-sub">
            {aciertos} de {total} correctas · Mínimo aprobatorio: {minPuntaje}%
          </p>
          {tiempoTotal > 0 && (
            <div className="qz-chips">
              <span className="qz-chip"><Clock size={16} color={color.hex} /> {formatTiempo(tiempoTotal)} <small>de tiempo</small></span>
            </div>
          )}
        </motion.section>

        <section className="qz-bloque qz-repaso">
          <h3>{fallos.length > 0 ? `Para repasar (${fallos.length})` : 'Para repasar'}</h3>
          {fallos.length === 0 ? (
            <p className="qz-repaso-ok">No fallaste ninguna pregunta. ¡Muy bien!</p>
          ) : (
            fallos.map(({ p, i, sel }) => (
              <div key={i} className="qz-fallo">
                <p className="qz-fallo-enun">{i + 1}. {p.enunciado}</p>
                <p className="qz-fallo-dato">
                  Tu respuesta:{' '}
                  <span className="qz-tuya">
                    {sel === undefined || sel < 0
                      ? 'Sin respuesta registrada'
                      : `${LETTERS[sel] ?? sel + 1} — ${p.opciones[sel] ?? ''}`}
                  </span>
                </p>
                <p className="qz-fallo-dato">
                  Correcta:{' '}
                  <span className="qz-buena">
                    {LETTERS[p.respuesta_correcta] ?? p.respuesta_correcta + 1} — {p.opciones[p.respuesta_correcta]}
                  </span>
                </p>
                {p.retroalimentacion && <p className="qz-fallo-exp">{p.retroalimentacion}</p>}
              </div>
            ))
          )}
        </section>

        <div className="qz-acciones">
          {total > 0 && (
            <button type="button" className="qz-btn" onClick={() => irA(0)}>
              <Eye size={18} /> Revisar preguntas
            </button>
          )}
          <button type="button" className="qz-btn" onClick={handleReiniciar}>
            <RotateCcw size={18} /> Volver a hacer
          </button>
          {!entregado ? (
            <button type="button" className="qz-btn qz-btn-pri" onClick={handleEntregar}>
              Entregar y continuar <ArrowRight size={18} />
            </button>
          ) : (
            <div className="qz-hecho" role="status">
              <Check size={18} /> Quiz entregado
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── QUIZ (una pregunta por pantalla) ─────────────────────────────────────────

  const pregunta = preguntas[actual];
  if (!pregunta) return null;
  const sel = respuestas[actual];
  const verificada = sel !== undefined;
  const esUltima = actual + 1 >= total;

  function getEstadoOpcion(i: number): EstadoOpcion {
    if (!verificada || !pregunta) return undefined;
    const isSelected = sel === i;
    const isCorrect = i === pregunta.respuesta_correcta;
    if (isSelected && isCorrect) return 'bien';
    if (isSelected && !isCorrect) return 'mal';
    if (!isSelected && isCorrect) return 'revela';
    return 'apagada';
  }

  const acerto = sel === pregunta.respuesta_correcta;
  const letraCorrecta = LETTERS[pregunta.respuesta_correcta] ?? String(pregunta.respuesta_correcta + 1);

  return (
    <div ref={raizRef} className="qz" style={quizVars(color)}>
      <style>{QUIZ_CSS}</style>
      {bannerRevision}
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

        <div className="qz-ops" role="group" aria-label="Opciones">
          {pregunta.opciones.map((opcion, i) => {
            const r = getEstadoOpcion(i);
            const letra = LETTERS[i] ?? String(i + 1);
            return (
              <button
                key={i}
                type="button"
                className="qz-op"
                data-r={r}
                disabled={verificada}
                aria-pressed={sel === i}
                aria-label={`Opción ${letra}: ${opcion}`}
                onClick={() => handleSeleccion(i)}
              >
                <span className="qz-letra" aria-hidden="true">
                  {r === 'bien' || r === 'revela' ? <Check size={18} /> : r === 'mal' ? <X size={18} /> : letra}
                </span>
                <span>{opcion}</span>
              </button>
            );
          })}
        </div>

        {verificada && (
          <RetroQuiz
            bien={acerto}
            titulo={sel < 0 ? 'Sin respuesta registrada' : acerto ? '¡Correcto!' : 'Respuesta incorrecta'}
            correcta={!acerto
              ? <>La correcta es la <b>{letraCorrecta}</b>: {pregunta.opciones[pregunta.respuesta_correcta]}</>
              : undefined}
            explicacion={pregunta.retroalimentacion}
          />
        )}

        <NavQuiz
          puedeAnterior={actual > 0}
          onAnterior={() => irA(actual - 1)}
          puedeSiguiente={verificada}
          onSiguiente={() => (esUltima ? verResumen() : irA(actual + 1))}
          esUltima={esUltima}
          sigRef={sigRef}
        />
      </motion.article>
    </div>
  );
}
