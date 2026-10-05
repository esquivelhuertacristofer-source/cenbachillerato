"use client";

/**
 * Laboratorio 3D — "Estructura de una reacción química".
 * Práctica experimental anclada a CNEYT-III·O4 (UAC "Nuestro hogar. El sistema
 * terrestre"). Desarma una ecuación química en 3D (reactivos · flecha · productos),
 * cuenta los átomos a ambos lados para comprobar la conservación de la materia y
 * recorre la simbología, todo con reacciones reales del módulo de datos.
 *
 * Tres modos: anatomía de la ecuación · conservación (conteo de átomos) · simbología.
 *
 * EXPERIMENTO CENTRAL: el alumno cambia el COEFICIENTE de una sustancia y ve
 * aparecer o desaparecer moléculas completas; en «Conservación», las barras de
 * átomos de cada elemento dejan de coincidir (naranja) y la ecuación deja de
 * estar balanceada. Los subíndices nunca se tocan.
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { ESTRUCTURA_REACCION_FICHA } from "./estructura-reaccion-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { LabSfx } from "./lab-audio";
import {
  type Modo,
  type Reaccion,
  MODOS,
  MODOS_DEF,
  FASES,
  numFases,
  escenaPara,
  REACCIONES,
  reaccionPorId,
  contarAtomos,
  moleculasPorLado,
  SIMBOLOS,
  PROBLEMA,
  INSTRUCCIONES,
  PREGUNTAS,
  IDEAS,
  GLOSARIO,
  CONTEXTO,
  FUENTE,
  EJEMPLO,
  DATOS,
  HECHOS,
  RETO_A2,
} from "./estructura-reaccion-data";

/** Clave de la mejor marca de este laboratorio. */
const RETO_KEY = "cen-estructura-reaccion-reto";

const OK_COL = "#34D399";
const NO_COL = "#FB923C";

const EstructuraReaccionScene = dynamic(() => import("./EstructuraReaccionScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-arrows-rotate fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Cargando la reacción química en 3D…</span>
    </div>
  ),
});

const COLORES_ELEM: Record<string, string> = { H: "#e2e8f0", C: "#475569", O: "#ef4444", N: "#3b82f6", Cl: "#22c55e", Na: "#a855f7" };

const th: React.CSSProperties = { padding: "8px 9px", fontSize: 13, letterSpacing: "0.06em", textTransform: "uppercase", color: T.text3, textAlign: "left", borderBottom: `1px solid ${T.line}` };
const td: React.CSSProperties = { padding: "8px 9px", fontSize: 14, borderBottom: `1px solid ${T.line}`, verticalAlign: "top", textAlign: "left" };

const COEF_MIN = 1;
const COEF_MAX = 6;

/** Ecuación escrita con los coeficientes actuales. */
function ecuacionTexto(r: Reaccion): string {
  const lado = (l: Reaccion["reactivos"]) => l.map((e) => `${e.coef > 1 ? `${e.coef} ` : ""}${e.formula} (${e.estado})`).join(" + ");
  return `${lado(r.reactivos)} ${r.reversible ? "⇌" : "→"} ${lado(r.productos)}`;
}

export function LabEstructuraReaccion({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("anatomia");
  const [paso, setPaso] = useState<number>(0);
  const [playing, setPlaying] = useState<boolean>(true);
  const [resetNonce, setResetNonce] = useState(0);
  const [simbolo, setSimbolo] = useState(0);

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

  // reacción seleccionada y coeficientes que el alumno ha cambiado
  const [reaccionId, setReaccionId] = useState<string>("combustion-metano");
  const [delta, setDelta] = useState<Record<string, number>>({});
  const base = reaccionPorId(reaccionId);
  const reaccion = useMemo<Reaccion>(
    () => ({
      ...base,
      reactivos: base.reactivos.map((e, i) => ({ ...e, coef: delta[`R${i}`] ?? e.coef })),
      productos: base.productos.map((e, i) => ({ ...e, coef: delta[`P${i}`] ?? e.coef })),
    }),
    [base, delta],
  );
  const libre = Object.keys(delta).length > 0;

  const bump = () => setResetNonce((n) => n + 1);

  const def = MODOS_DEF[modo];
  const modoCol = `#${def.color.replace("#", "")}`;
  const totalFases = numFases(modo);
  const total = Math.max(0, totalFases - 1);
  const idx = Math.min(paso, total);
  const escena = escenaPara(modo, idx);
  const esGaleria = modo === "simbologia";
  const nombresFase = esGaleria ? [] : FASES[modo as Exclude<Modo, "simbologia">];

  useEffect(() => {
    if (!playing || esGaleria || total === 0) return;
    if (idx >= total) return;
    const t = setInterval(() => setPaso((p) => Math.min(total, p + 1)), 1700);
    return () => clearInterval(t);
  }, [playing, total, idx, esGaleria]);

  const cambiarModo = (m: Modo) => {
    setModo(m);
    setPaso(0);
    setPlaying(m !== "simbologia");
    if (sonido) audioRef.current?.blip();
    bump();
  };
  const reiniciar = () => {
    setPaso(0);
    setPlaying(!esGaleria);
    bump();
  };
  const elegirReaccion = (id: string) => {
    setReaccionId(id);
    setDelta({});
    setPaso(0);
    bump();
  };
  const setCoef = (clave: string, v: number) => {
    setDelta((d) => ({ ...d, [clave]: Math.max(COEF_MIN, Math.min(COEF_MAX, Math.round(v))) }));
    if (sonido) audioRef.current?.blip();
  };

  // ── Conteo de átomos y balance (con los coeficientes actuales) ─────────────
  const conteo = useMemo(() => contarAtomos(reaccion), [reaccion]);
  const moles = useMemo(() => moleculasPorLado(reaccion), [reaccion]);
  const estadoCol = conteo.balanceada ? OK_COL : NO_COL;

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#04121f", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${def.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{def.etq}</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 440, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la información sigue aquí. {ecuacionTexto(reaccion)}.
      </div>
    </div>
  );

  const sim = SIMBOLOS[Math.min(simbolo, SIMBOLOS.length - 1)]!;
  const lecturasAnatomia: Record<string, string> = {
    reactivos: "Reactivos: lo que hay antes de reaccionar",
    flecha: "La flecha → significa «se transforma en»",
    productos: "Productos: las sustancias nuevas",
    coeficientes: "Coeficiente: cuántas moléculas (número grande)",
    subindices: "Subíndice: cuántos átomos por molécula",
  };
  const lectura =
    modo === "simbologia"
      ? <>{sim.simbolo} — {sim.nombre}</>
      : modo === "conservacion"
        ? (conteo.balanceada ? <>Balanceada: cada elemento coincide</> : <>No coinciden: faltan o sobran átomos</>)
        : <>{lecturasAnatomia[escena.foco] ?? escena.nombre}</>;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <EstructuraReaccionScene
            modo={modo}
            escena={escena}
            reaccion={reaccion}
            playing={playing}
            modoColor={modoCol}
            resetNonce={resetNonce}
            libre={libre}
            simbolo={simbolo}
          />
        </SceneBoundary>
      }
      modos={{
        opciones: MODOS.map((mm) => ({ id: mm, etiqueta: MODOS_DEF[mm].etq, icono: MODOS_DEF[mm].icono })),
        valor: modo,
        cambiar: (id) => cambiarModo(id as Modo),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          {!esGaleria && (
            <>
              <BotonHerramienta icono="fa-backward-step" titulo="Fase anterior" onClick={() => { setPlaying(false); setPaso((p) => Math.max(0, p - 1)); }} />
              <BotonHerramienta icono={playing ? "fa-pause" : "fa-play"} titulo={playing ? "Pausar" : "Reanudar"} activo={playing} onClick={() => setPlaying((p) => !p)} />
              <BotonHerramienta icono="fa-forward-step" titulo="Fase siguiente" onClick={() => { setPlaying(false); setPaso((p) => Math.min(total, p + 1)); }} />
              <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reiniciar} />
            </>
          )}
        </>
      }
      leyenda={
        <>
          {!esGaleria && conteo.elementos.map((el) => (
            <div key={el} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>
              <span style={{ width: 12, height: 12, borderRadius: "50%", background: COLORES_ELEM[el] ?? "#fbbf24", border: "1px solid rgba(255,255,255,0.35)", flexShrink: 0 }} />
              {el}
            </div>
          ))}
        </>
      }
      lectura={lectura}
      objetivos={[
        { txt: "Identifica reactivos, flecha y productos en la anatomía de la ecuación", done: modo === "anatomia" && idx >= 2 },
        { txt: "Verifica la conservación de la materia contando átomos a ambos lados", done: modo === "conservacion" },
        { txt: "En Conservación, sube un coeficiente y mira qué barras se descuadran", done: !conteo.balanceada },
        { txt: "Distingue coeficiente (número grande) de subíndice (número pequeño)", done: modo === "simbologia" },
        { txt: "Recorre la reacción paso a paso", done: paso > 0 },
        { txt: "Compara con otra reacción además de la combustión del metano", done: reaccionId !== "combustion-metano" },
        { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
      ]}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <Bloque titulo="Reacción" icono="fa-flask-vial">
                <select
                  value={reaccionId}
                  onChange={(e) => elegirReaccion(e.target.value)}
                  aria-label="Reacción química"
                  style={{ boxSizing: "border-box", width: "100%", fontSize: 16, fontWeight: 700, color: "#fff", background: "rgba(4,10,22,0.55)", border: `1px solid ${accent}`, borderRadius: 10, padding: "10px 12px" }}
                >
                  {REACCIONES.map((r) => (
                    <option key={r.id} value={r.id}>{r.nombre}</option>
                  ))}
                </select>
                <div style={{ padding: "10px 12px", borderRadius: 12, border: `1px solid ${estadoCol}55`, background: `${estadoCol}12`, fontFamily: "ui-monospace, monospace", fontWeight: 900, color: "#fff", overflowWrap: "anywhere" }}>
                  {ecuacionTexto(reaccion)}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="tipo" value={base.tipo.split(" (")[0] ?? base.tipo} col={accent} />
                  <Dato label="flecha" value={base.reversible ? "⇌ reversible" : "→ irreversible"} col="#a78bfa" />
                </div>
              </Bloque>

              <Bloque titulo="Experimenta: cambia los coeficientes" icono="fa-hand-pointer">
                {reaccion.reactivos.map((e, i) => (
                  <Deslizador key={`R${i}`} label={`${e.formula} (${e.nombre})`} icon="fa-circle-dot" colr="#38bdf8" valor={String(e.coef)}
                    min={COEF_MIN} max={COEF_MAX} step={1} value={e.coef} onChange={(v) => setCoef(`R${i}`, v)} />
                ))}
                {reaccion.productos.map((e, i) => (
                  <Deslizador key={`P${i}`} label={`${e.formula} (${e.nombre})`} icon="fa-circle-dot" colr="#34d399" valor={String(e.coef)}
                    min={COEF_MIN} max={COEF_MAX} step={1} value={e.coef} onChange={(v) => setCoef(`P${i}`, v)} />
                ))}
                <button
                  type="button"
                  onClick={() => setDelta({})}
                  disabled={!libre}
                  style={{ cursor: libre ? "pointer" : "default", padding: "12px 14px", borderRadius: 12, border: "none", fontSize: 15, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    background: libre ? accent : "rgba(255,255,255,0.06)", color: libre ? "#04121f" : T.text3 }}
                >
                  <i className="fa-solid fa-rotate-left" aria-hidden />
                  Volver a la ecuación original
                </button>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="átomos reactivos" value={String(conteo.totalReactivos)} col="#38bdf8" />
                  <Dato label="átomos productos" value={String(conteo.totalProductos)} col={estadoCol} />
                  <Dato label="moléculas" value={`${moles.reactivos} → ${moles.productos}`} col="#bfe8ff" />
                  <Dato label="estado" value={conteo.balanceada ? "balanceada ✓" : "no coincide ✗"} col={estadoCol} />
                </div>
                <p style={{ margin: 0, color: T.text2 }}>
                  {conteo.balanceada
                    ? <>Cada elemento tiene <strong style={{ color: OK_COL }}>los mismos átomos</strong> a ambos lados: la materia se conserva ({moles.reactivos} moléculas de reactivo → {moles.productos} de producto).</>
                    : <>Los átomos <strong style={{ color: NO_COL }}>no coinciden</strong>: cambiar un coeficiente multiplica TODOS los átomos de esa sustancia. Los subíndices no se tocan.</>}
                </p>
              </Bloque>

              <Bloque titulo="Átomos por elemento (coef × subíndice)" icono="fa-scale-balanced">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={th}>Elem.</th>
                      <th style={{ ...th, color: "#38bdf8", textAlign: "right" }}>Reactivos</th>
                      <th style={{ ...th, color: "#34d399", textAlign: "right" }}>Productos</th>
                      <th style={{ ...th, textAlign: "center" }}>¿Igual?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conteo.elementos.map((el) => {
                      const nr = conteo.reactivos[el] ?? 0;
                      const np = conteo.productos[el] ?? 0;
                      const ok = nr === np;
                      return (
                        <tr key={el}>
                          <td style={{ ...td, color: "#fff", fontWeight: 900 }}>{el}</td>
                          <td style={{ ...td, color: "#fff", textAlign: "right", fontFamily: "ui-monospace, monospace" }}>{nr}</td>
                          <td style={{ ...td, color: ok ? "#fff" : NO_COL, textAlign: "right", fontFamily: "ui-monospace, monospace" }}>{np}</td>
                          <td style={{ ...td, textAlign: "center", color: ok ? OK_COL : NO_COL, fontWeight: 900 }}>{ok ? "✓" : "✗"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Bloque>

              {esGaleria ? (
                <Bloque titulo="Símbolos de la ecuación" icono="fa-icons">
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {SIMBOLOS.map((s, i) => (
                      <button
                        key={s.nombre}
                        type="button"
                        onClick={() => setSimbolo(i)}
                        style={{ cursor: "pointer", padding: "8px 12px", borderRadius: 10, border: "1px solid", fontSize: 15, fontWeight: 900, fontFamily: "ui-monospace, monospace",
                          borderColor: i === simbolo ? s.color : "rgba(255,255,255,0.14)", background: i === simbolo ? `${s.color}26` : "transparent", color: "#fff" }}
                      >
                        {s.simbolo}
                      </button>
                    ))}
                  </div>
                  <p style={{ margin: 0, color: T.text2 }}><strong style={{ color: sim.color }}>{sim.nombre}.</strong> {sim.significado}</p>
                  <p style={{ margin: 0, color: T.text3 }}>Ejemplo: <span style={{ fontFamily: "ui-monospace, monospace", color: "#fff" }}>{sim.ejemplo}</span></p>
                </Bloque>
              ) : (
                <Bloque titulo={`Fases — ${def.etq}`} icono="fa-list-ol">
                  <Deslizador
                    label="Fase"
                    icon="fa-forward-step"
                    colr={modoCol}
                    valor={`${idx + 1} / ${totalFases}`}
                    min={0}
                    max={total}
                    step={1}
                    value={idx}
                    onChange={(v) => { setPlaying(false); setPaso(v); }}
                  />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {nombresFase.map((nom, i) => {
                      const on = i === idx;
                      const visto = i < idx;
                      return (
                        <button
                          key={nom}
                          type="button"
                          onClick={() => { setPlaying(false); setPaso(i); }}
                          style={{
                            cursor: "pointer", padding: "8px 11px", borderRadius: 10, border: "1px solid", fontSize: 14, fontWeight: 800,
                            borderColor: on ? modoCol : visto ? `${modoCol}55` : "rgba(255,255,255,0.12)",
                            background: on ? `${modoCol}22` : "transparent",
                            color: on ? "#fff" : visto ? "#cdd8ec" : T.text2,
                          }}
                        >
                          {nom}
                        </button>
                      );
                    })}
                  </div>
                  <p style={{ margin: 0, color: T.text2 }}>{escena.desc}</p>
                </Bloque>
              )}

              <Bloque titulo="Dónde ocurre esta reacción" icono="fa-location-dot">
                <p style={{ margin: 0, color: T.text2 }}>{base.contexto}</p>
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
              playSfx={
                sonido
                  ? (ok) => {
                      if (ok) audioRef.current?.correcto();
                      else audioRef.current?.incorrecto();
                    }
                  : undefined
              }
            />
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="El visor de la reacción química" icono="fa-flask-vial">
                <p style={{ margin: 0, color: T.text2 }}>{PROBLEMA}</p>
              </Bloque>
              <Bloque titulo={`Cómo usar — ${def.etq}`} icono="fa-list-ol">
                <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {INSTRUCCIONES[modo].map((p, i) => <li key={i}>{p}</li>)}
                </ol>
              </Bloque>
              <Bloque titulo={`Para reflexionar — ${def.etq}`} icono="fa-circle-question">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {PREGUNTAS[modo].map((q, i) => <li key={i}>{q}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Ejemplo resuelto (A2)" icono="fa-square-root-variable">
                <p style={{ margin: 0, color: T.text2 }}>{EJEMPLO.enunciado}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {EJEMPLO.datos.map((d, i) => (
                    <span key={i} style={{ fontSize: 14, fontWeight: 800, color: "#fff", padding: "4px 9px", borderRadius: 8, background: "rgba(4,10,22,0.5)", border: `1px solid ${T.line}` }}>{d}</span>
                  ))}
                </div>
                <p style={{ margin: 0, color: T.text2 }}>{EJEMPLO.solucion}</p>
                <div style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid ${accent}44`, background: `rgba(${color.rgba},0.08)`, fontWeight: 800, color: "#86efac" }}>
                  <i className="fa-solid fa-flag-checkered" style={{ marginRight: 7, color: accent }} aria-hidden />{EJEMPLO.resultado}
                </div>
              </Bloque>
              <Bloque titulo="Simbología química" icono="fa-icons">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr><th style={th}>Símbolo</th><th style={th}>Nombre</th><th style={th}>Significado</th></tr>
                  </thead>
                  <tbody>
                    {SIMBOLOS.map((s) => (
                      <tr key={s.nombre}>
                        <td style={{ ...td, color: s.color, fontWeight: 900, fontFamily: "ui-monospace, monospace" }}>{s.simbolo}</td>
                        <td style={{ ...td, color: "#fff", fontWeight: 700 }}>{s.nombre}</td>
                        <td style={{ ...td, color: T.text2 }}>{s.significado}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Bloque>
              <Bloque titulo="Datos de las reacciones químicas" icono="fa-magnifying-glass-chart">
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
              <Bloque titulo="México: estufas, maíz, fertilizantes y antiácidos" icono="fa-location-dot">
                <p style={{ margin: 0, color: T.text2 }}>{CONTEXTO}</p>
              </Bloque>
              <Bloque titulo="¿Sabías que?" icono="fa-circle-question">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {HECHOS.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Ideas clave" icono="fa-lightbulb">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {IDEAS.map((x, i) => <li key={i}>{x}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Glosario" icono="fa-book">
                {GLOSARIO.map((g, i) => (
                  <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                    <span style={{ fontWeight: 900, color: accent }}>{g.termino}. </span>
                    <span style={{ color: T.text2 }}>{g.definicion}</span>
                    <div style={{ color: T.text3, marginTop: 4 }}><i className="fa-solid fa-flask" style={{ marginRight: 6, color: accent }} aria-hidden />{g.ejemplo}</div>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book-open">
                <FichaTeorica data={ESTRUCTURA_REACCION_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3 }}>
                Las fórmulas, los coeficientes originales y el conteo de átomos por elemento son <strong>exactos</strong> (todas las reacciones del catálogo vienen balanceadas). Al mover un coeficiente la ecuación puede dejar de estarlo: es justo lo que se quiere ver. El modelo 3D es <strong>esquemático</strong> (no a escala): cada esfera representa un átomo y cada molécula es un grupo de esferas, sin reflejar los ángulos ni las distancias reales de enlace. Fuente: {FUENTE}
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
