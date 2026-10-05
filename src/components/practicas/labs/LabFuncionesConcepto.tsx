"use client";

/**
 * Laboratorio 3D — Concepto de función y sus representaciones.
 * Práctica experimental para PM-IV-P01-A2 (ejercicio_matematico "Identifico y
 * evalúo una función a partir de una tabla de valores"; progresión 1).
 *
 * Dos modos sobre un plano cartesiano flotante:
 *  · MÁQUINA: el alumno mueve la entrada x y ve la salida f(x) — a cada entrada,
 *    EXACTAMENTE UNA salida (definición de función). Las 4 representaciones
 *    (tabular, gráfica, algebraica, verbal) se sincronizan en vivo.
 *  · TEST: prueba de la línea vertical — distingue funciones (parábola, recta…)
 *    de no-funciones (circunferencia, parábola acostada).
 * Valores verbatim del enunciado del café (A2) y de los ejemplos de la lectura (A1).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { FUNCIONES_FICHA } from "./funciones-concepto-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import {
  RELACIONES, FUNCIONES, rel, evalRel, ramas, tablaDe, enDominio,
  IDEAS, DATOS, RETO, RETO_A2, fmt1, conUnidad, sustitucion,
  MODO_DEF, REL_DEF, type RelId, type Modo,
} from "./funciones-concepto-data";
import { LabSfx } from "./lab-audio";

/** Clave de la mejor marca de este laboratorio. */
const RETO_KEY = "cen-funciones-concepto-reto";

const FuncionesConceptoScene = dynamic(() => import("./FuncionesConceptoScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-diagram-project fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Dibujando el plano…</span>
    </div>
  ),
});

const IN_COL = "#fbbf24";   // entrada (x)
const OUT_COL = "#34D399";  // salida (f(x))
const OK_COL = "#34D399";   // pasa la prueba
const BAD_COL = "#f87171";  // no pasa la prueba

export function LabFuncionesConcepto({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>(MODO_DEF);
  const [relId, setRelId] = useState<RelId>(REL_DEF);
  const [xPos, setXPos] = useState<number>(rel(REL_DEF).xDef);
  const [playing, setPlaying] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);
  // experimento central: cuántos valores distintos de x ha probado el alumno en la máquina
  const [probadas, setProbadas] = useState<number[]>([]);

  // reto evaluable y sonido
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);

  const toggleSonido = useCallback(async () => {
    if (!audioRef.current) audioRef.current = new LabSfx();
    const sfx = audioRef.current;
    if (sonido) {
      sfx.mute();
      setSonido(false);
    } else {
      await sfx.enable();
      setSonido(true);
    }
  }, [sonido]);

  useEffect(() => {
    return () => {
      audioRef.current?.dispose();
      audioRef.current = null;
    };
  }, []);

  const r = useMemo(() => rel(relId), [relId]);

  // Barrido automático de la entrada x (rebota en los extremos del dominio).
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = 0;
    let dir = 1;
    const span = r.domMax - r.domMin || 1;
    const speed = span / 6; // recorre el dominio en ~6 s
    const tick = (ts: number) => {
      if (last === 0) last = ts;
      const dt = (ts - last) / 1000;
      last = ts;
      setXPos((prev) => {
        let next = prev + dt * speed * dir;
        if (next >= r.domMax) { next = r.domMax; dir = -1; }
        else if (next <= r.domMin) { next = r.domMin; dir = 1; }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, r.domMin, r.domMax]);

  const bump = () => setResetNonce((n) => n + 1);
  const elegirRel = (id: RelId) => {
    setPlaying(false); setRelId(id); setXPos(rel(id).xDef); bump();
    if (sonido) audioRef.current?.blip();
  };
  const elegirModo = (m: Modo) => {
    setPlaying(false);
    setModo(m);
    // en máquina solo tienen sentido las funciones: si la relación actual no lo es, cambia a una función
    if (m === "maquina" && !rel(relId).esFuncion) { setRelId(REL_DEF); setXPos(rel(REL_DEF).xDef); }
    bump();
    if (sonido) audioRef.current?.blip();
  };
  const setXman = (v: number) => {
    setPlaying(false);
    setXPos(v);
    if (modo === "maquina") setProbadas((p) => (p.includes(v) ? p : [...p, v]));
  };
  const reset = () => { setPlaying(false); setModo(MODO_DEF); setRelId(REL_DEF); setXPos(rel(REL_DEF).xDef); bump(); };

  const dentro = enDominio(relId, xPos);
  const yVal = evalRel(relId, xPos);
  const yTxt = r.esFuncion && Number.isFinite(yVal) ? conUnidad(yVal, r.unidadY, 1) : "—";
  const cortes = ramas(relId, xPos).length;

  const tabla = useMemo(() => tablaDe(relId), [relId]);
  // fila resaltada: la más cercana a xPos
  const filaActiva = useMemo(() => {
    if (!tabla.rows.length) return -1;
    let best = 0;
    let bestD = Infinity;
    tabla.rows.forEach((row, i) => {
      const d = Math.abs(row.x - xPos);
      if (d < bestD) { bestD = d; best = i; }
    });
    return best;
  }, [tabla, xPos]);

  const relsVisibles = modo === "maquina" ? FUNCIONES : RELACIONES;

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-diagram-project" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{r.titulo}</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la idea sigue: {r.algebraica}. {r.verbal}
      </div>
    </div>
  );

  const lectura = modo === "maquina"
    ? <>entra {conUnidad(xPos, r.unidadX, 1)} → sale {yTxt}</>
    : <>La vertical corta en {cortes} {cortes === 1 ? "punto" : "puntos"}: {r.esFuncion ? "SÍ" : "NO"} es función</>;

  const chip = (on: boolean): React.CSSProperties => ({
    cursor: "pointer", padding: "10px 12px", borderRadius: 12, fontSize: 14, fontWeight: 800, textAlign: "left",
    display: "flex", alignItems: "center", gap: 8, minHeight: 44, color: on ? "#fff" : T.text2,
    border: `1px solid ${on ? `rgba(${color.rgba},0.7)` : T.line}`,
    background: on ? `rgba(${color.rgba},0.18)` : T.inset,
  });

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <FuncionesConceptoScene relId={relId} modo={modo} xPos={xPos} accent={accent} resetNonce={resetNonce} />
        </SceneBoundary>
      }
      modos={{
        opciones: [
          { id: "maquina", etiqueta: "Máquina", icono: "fa-gears" },
          { id: "test", etiqueta: "¿Es función?", icono: "fa-grip-lines-vertical" },
        ],
        valor: modo,
        cambiar: (id) => elegirModo(id as Modo),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono={playing ? "fa-pause" : "fa-play"} titulo={playing ? "Pausar el barrido" : modo === "maquina" ? "Recorrer las entradas" : "Barrer la línea vertical"} activo={playing} onClick={() => setPlaying((p) => !p)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reset} />
        </>
      }
      lectura={lectura}
      objetivos={[
        { txt: "Prueba tres entradas distintas y observa que cada una da una sola salida", done: probadas.length >= 3 },
        { txt: "Mueve la entrada x y observa la única salida f(x)", done: xPos !== r.xDef },
        { txt: "Aplica la prueba de la línea vertical en modo ¿Es función?", done: modo === "test" },
        { txt: "Encuentra una relación que NO es función (la recta vertical la corta dos veces)", done: modo === "test" && !r.esFuncion && cortes > 1 },
        { txt: "Compara al menos dos relaciones distintas", done: relId !== REL_DEF },
        { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
      ]}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <Bloque titulo={modo === "maquina" ? "Mueve la entrada y observa la salida" : "Barre la línea vertical y juzga"} icono="fa-sliders">
                <Deslizador
                  label={modo === "maquina" ? `entrada x (${r.unidadX || "x"})` : "posición de la línea vertical"}
                  icon={modo === "maquina" ? "fa-right-to-bracket" : "fa-grip-lines-vertical"}
                  colr={modo === "maquina" ? IN_COL : (r.esFuncion ? OK_COL : BAD_COL)}
                  valor={conUnidad(xPos, r.unidadX, 1)}
                  min={r.domMin} max={r.domMax} step={r.xStep} value={xPos}
                  onChange={setXman}
                  hintL={fmt1(r.domMin)} hintR={fmt1(r.domMax)}
                />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="es función" value={r.esFuncion ? "sí" : "no"} col={r.esFuncion ? OK_COL : BAD_COL} />
                  <Dato label="cortes de la vertical" value={`${cortes}`} col={cortes > 1 ? BAD_COL : OK_COL} />
                  <Dato label={modo === "maquina" ? "entrada x" : "línea en x"} value={conUnidad(xPos, r.unidadX, 1)} col={IN_COL} />
                  <Dato label="salida f(x)" value={yTxt} col={OUT_COL} />
                </div>
                <p style={{ margin: 0, color: T.text2 }}>
                  Ejes: <strong style={{ color: "#fff" }}>{r.vista.xlabel}</strong> (horizontal) y <strong style={{ color: "#fff" }}>{r.vista.ylabel}</strong> (vertical), de {fmt1(r.vista.xmin)} a {fmt1(r.vista.xmax)} y de {fmt1(r.vista.ymin)} a {fmt1(r.vista.ymax)}.
                </p>
              </Bloque>

              <Bloque titulo={modo === "maquina" ? "Funciones (elige una)" : "Relaciones: ¿cuáles son función?"} icono="fa-shapes">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))", gap: 8 }}>
                  {relsVisibles.map((rr) => (
                    <button key={rr.id} type="button" style={chip(relId === rr.id)} onClick={() => elegirRel(rr.id)} title={rr.titulo}>
                      <i className={`fa-solid ${rr.icono}`} style={{ color: rr.color }} />
                      <span>{rr.label}</span>
                      {!rr.esFuncion && <span style={{ fontSize: 14, fontWeight: 900, color: BAD_COL, border: `1px solid ${BAD_COL}66`, borderRadius: 5, padding: "1px 4px" }}>no fn</span>}
                    </button>
                  ))}
                </div>
              </Bloque>

              <Bloque titulo="Tabla y fórmula en vivo" icono="fa-table-cells">
                {tabla.rows.length ? (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ borderCollapse: "collapse", fontFamily: "ui-monospace, monospace", fontSize: 14 }}>
                      <tbody>
                        <tr>
                          <td style={{ color: T.text3, padding: "3px 8px", fontWeight: 800 }}>{r.unidadX || "x"}</td>
                          {tabla.rows.map((row, i) => (
                            <td key={i} style={{ textAlign: "center", padding: "3px 8px", color: i === filaActiva && modo === "maquina" ? IN_COL : T.text2, fontWeight: i === filaActiva && modo === "maquina" ? 900 : 600 }}>{fmt1(row.x)}</td>
                          ))}
                        </tr>
                        <tr>
                          <td style={{ color: T.text3, padding: "3px 8px", fontWeight: 800 }}>{r.unidadY || "y"}</td>
                          {tabla.rows.map((row, i) => (
                            <td key={i} style={{ textAlign: "center", padding: "3px 8px", color: i === filaActiva && modo === "maquina" ? OUT_COL : T.text2, fontWeight: i === filaActiva && modo === "maquina" ? 900 : 600 }}>{fmt1(row.y)}</td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ margin: 0, color: T.text3 }}>Relación sin tabla (no es función).</p>
                )}
                <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{r.algebraica}</div>
                {modo === "maquina" && r.esFuncion && (
                  <div style={{ fontSize: 14, color: OUT_COL, fontFamily: "ui-monospace, monospace" }}>{dentro ? sustitucion(relId, xPos) : "x fuera del dominio"}</div>
                )}
              </Bloque>
            </>
          ),
        },
        {
          id: "reto",
          etiqueta: "Reto",
          icono: "fa-trophy",
          contenido: (
            <RetoNumericoCard
              reto={RETO_A2}
              accent={accent}
              aprobado={ejercicioAprobado}
              onAprobado={() => setEjercicioAprobado(true)}
              playSfx={sonido ? (ok) => { if (ok) audioRef.current?.correcto(); else audioRef.current?.incorrecto(); } : undefined}
            />
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo={r.titulo} icono={r.icono}>
                <p style={{ margin: 0, color: r.esFuncion ? OK_COL : BAD_COL, fontWeight: 800 }}>{r.esFuncion ? "SÍ es función" : "NO es función"}</p>
                <p style={{ margin: 0, color: T.text2 }}>{r.dominioTxt}</p>
                <p style={{ margin: 0, color: T.text3 }}>{r.contexto}</p>
                <p style={{ margin: 0, color: T.text2 }}><strong style={{ color: "#fff" }}>Verbal:</strong> {r.verbal}</p>
                {r.nota && <p style={{ margin: 0, color: T.text3 }}>{r.nota}</p>}
              </Bloque>
              <Bloque titulo="¿Qué es una función?" icono="fa-circle-question">
                <p style={{ margin: 0, color: T.text2 }}>
                  Una función es una regla que a <strong style={{ color: IN_COL }}>cada elemento del dominio</strong> (las entradas x) le asigna <strong style={{ color: OUT_COL }}>exactamente un elemento del rango</strong> (una salida y).
                </p>
              </Bloque>
              <Bloque titulo="Prueba de la línea vertical" icono="fa-grip-lines-vertical">
                <p style={{ margin: 0, color: T.text2 }}>
                  Si una recta vertical corta la gráfica en <strong style={{ color: BAD_COL }}>más de un punto</strong>, NO es función. Una circunferencia completa no la pasa; una parábola (vertical) sí.
                </p>
              </Bloque>
              <Bloque titulo="Reto resuelto: el café que se enfría" icono="fa-mug-hot">
                <p style={{ margin: 0, color: T.text2 }}>{RETO.enunciado}</p>
                {RETO.pasos.map((p) => (
                  <div key={p.etiqueta} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <strong style={{ color: accent }}>{p.etiqueta}</strong>
                    <div>
                      <div style={{ color: T.text2 }}>{p.pregunta}</div>
                      <div style={{ fontWeight: 800, color: "#fff" }}>{p.respuesta}</div>
                    </div>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Ideas clave" icono="fa-lightbulb">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {IDEAS.map((x, i) => <li key={i}>{x}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Datos" icono="fa-gauge-high">
                {DATOS.map((dd, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <i className={`fa-solid ${dd.icono}`} style={{ color: accent, marginTop: 4 }} aria-hidden />
                    <div>
                      <strong style={{ fontFamily: "ui-monospace, monospace" }}>{dd.valor}</strong>
                      <div style={{ color: T.text2 }}>{dd.texto}</div>
                    </div>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={FUNCIONES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3 }}>
                Cálculo exacto: cada salida f(x) se evalúa con la fórmula real (la tabla del café son los valores verbatim del enunciado A2). El plano se dibuja a escala propia por relación para mostrar valores reales; los modelos del Pico de Orizaba y del Metro son aproximados/típicos donde se indica.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
