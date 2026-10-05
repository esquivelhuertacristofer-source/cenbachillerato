"use client";

/**
 * Laboratorio 3D — "Equilibrio químico y reacciones reversibles".
 * Práctica experimental anclada a CNEYT-IV·O3 (UAC "El poder de la química").
 * Recorre el equilibrio dinámico paso a paso y calcula el cociente Q frente a la
 * constante Kc (para predecir el sentido) y la respuesta de Le Châtelier, con la
 * química exacta del módulo de datos.
 *
 * EL experimento: mueves las concentraciones y la aguja de Q cruza la línea fija
 * de Kc (el sistema se desplaza en el sentido contrario a la aguja); aprietas el
 * pistón y las moléculas pardas de NO₂ se unen en N₂O₄ incoloro-azulado.
 *
 * Cuatro modos: equilibrio dinámico · constante Kc · Le Châtelier · comparar.
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { EQUILIBRIO_FICHA } from "./equilibrio-quimico-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { RETO_A2 } from "./equilibrio-quimico-data";
import { LabSfx } from "./lab-audio";
import {
  type Modo,
  MODOS,
  MODOS_DEF,
  FASES,
  numFases,
  escenaPara,
  REACCIONES,
  reaccionPorId,
  evaluarEquilibrio,
  PERTURBACIONES,
  type Perturbacion,
  prediceLeChatelier,
  fmtNum,
  COMPARACION,
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
} from "./equilibrio-data";

const EquilibrioScene = dynamic(() => import("./EquilibrioScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-arrows-rotate fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Cargando el equilibrio químico en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-equilibrio-quimico-reto";

export function LabEquilibrio({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("reversible");
  const [paso, setPaso] = useState<number>(0);
  const [playing, setPlaying] = useState<boolean>(true);
  const [resetNonce, setResetNonce] = useState(0);

  // calculadora de la actividad A2
  const [reacId, setReacId] = useState<string>("hi");
  const [conc, setConc] = useState<Record<string, number>>({ "H₂": 0.2, "I₂": 0.2, HI: 0.5 });
  const [perturb, setPerturb] = useState<Perturbacion>("subir-presion");
  // presión sobre el pistón (modo Le Châtelier)
  const [presion, setPresion] = useState<number>(0);

  // banderas de misión (se activan en eventos y ya no se desactivan)
  const [qSobreKc, setQSobreKc] = useState(false);
  const [apretoPiston, setApretoPiston] = useState(false);
  const [vioEquilibrio, setVioEquilibrio] = useState(false);
  const [cambioConc, setCambioConc] = useState(false);
  const [probaPerturb, setProbaPerturb] = useState(false);

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

  const bump = () => setResetNonce((n) => n + 1);

  const def = MODOS_DEF[modo];
  const modoCol = `#${def.color.replace("#", "")}`;
  const totalFases = numFases(modo);
  const total = Math.max(0, totalFases - 1);
  const idx = Math.min(paso, total);
  const escena = escenaPara(modo, idx);
  const esComparar = modo === "comparar";
  const nombresFase = esComparar ? [] : FASES[modo];

  useEffect(() => {
    if (!playing || esComparar || total === 0) return;
    if (idx >= total) return;
    const t = setInterval(() => {
      const sig = Math.min(total, idx + 1);
      setPaso(sig);
      if (modo === "reversible" && sig >= total) setVioEquilibrio(true);
    }, 1700);
    return () => clearInterval(t);
  }, [playing, total, idx, esComparar, modo]);

  const cambiarModo = (m: Modo) => {
    if (sonido) audioRef.current?.blip();
    setModo(m);
    setPaso(0);
    setPlaying(m !== "comparar");
    bump();
  };
  const reiniciar = () => {
    setPaso(0);
    setPlaying(!esComparar);
    setPresion(0);
    bump();
  };

  // ── Calculadora A2: cociente Q vs Kc + Le Châtelier ──────────────────────
  const reac = reaccionPorId(reacId);
  const especies = useMemo(() => [...reac.reactivos, ...reac.productos], [reac]);

  // al cambiar de reacción, sembrar concentraciones por defecto razonables
  const cambiarReaccion = (id: string) => {
    const r = reaccionPorId(id);
    const next: Record<string, number> = {};
    for (const e of [...r.reactivos, ...r.productos]) next[e.formula] = 0.5;
    setReacId(id);
    setConc(next);
  };

  const evalEq = evaluarEquilibrio(reac, conc);
  const pred = prediceLeChatelier(reac, perturb);
  const sentidoTxt = evalEq.sentido === "directa" ? "→ derecha" : evalEq.sentido === "inversa" ? "← izquierda" : "= equilibrio";
  const sentidoCol = evalEq.sentido === "directa" ? "#fb923c" : evalEq.sentido === "inversa" ? "#38bdf8" : "#34d399";
  const predCol = pred.sentido === "directa" ? "#fb923c" : pred.sentido === "inversa" ? "#38bdf8" : "#94a3b8";

  // posición de Q en la escala log respecto a Kc (0.5 = Q igual a Kc)
  const qPos = !isFinite(evalEq.q) ? 1 : evalEq.q <= 0 ? 0 : Math.max(0, Math.min(1, 0.5 + Math.log10(evalEq.q / evalEq.kc) / 6));
  const sumaProd = reac.productos.reduce((a, e) => a + (conc[e.formula] ?? 0), 0);
  const sumaTodo = especies.reduce((a, e) => a + (conc[e.formula] ?? 0), 0);
  const prodFrac = sumaTodo > 0 ? sumaProd / sumaTodo : 0;
  const relQK = evalEq.sentido === "directa" ? "Q < Kc" : evalEq.sentido === "inversa" ? "Q > Kc" : "Q = Kc";

  const predPiston = prediceLeChatelier(reaccionPorId("n2o4"), "subir-presion");
  const presionAtm = 1 + presion * 4;

  const cambiarConc = (formula: string, valor: number) => {
    const v = Math.max(0, valor);
    const nuevo = { ...conc, [formula]: v };
    setConc(nuevo);
    if (reacId === "hi") setCambioConc(true);
    if (modo === "constante" && evaluarEquilibrio(reac, nuevo).sentido === "inversa") setQSobreKc(true);
  };

  // Lleva la mezcla al equilibrio: deja los reactivos y ajusta los productos para que Q = Kc.
  const alEquilibrio = () => {
    const nuevo: Record<string, number> = { ...conc };
    let den = 1;
    for (const a of reac.reactivos) {
      if ((nuevo[a.formula] ?? 0) <= 0) nuevo[a.formula] = 1;
      den *= Math.pow(nuevo[a.formula] ?? 1, a.coef);
    }
    const sumaCoef = reac.productos.reduce((a, e) => a + e.coef, 0);
    const p = Math.pow(reac.kc * den, 1 / sumaCoef);
    for (const e of reac.productos) nuevo[e.formula] = p;
    setConc(nuevo);
    if (sonido) audioRef.current?.blip();
  };

  const cambiarPresion = (v: number) => {
    setPresion(v);
    if (modo === "lechatelier" && v >= 0.9) setApretoPiston(true);
  };

  const cambiarPerturb = (v: Perturbacion) => {
    setPerturb(v);
    setProbaPerturb(true);
  };

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#04121f", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${def.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{def.etq}</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 440, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la información sigue aquí. {def.subtitulo}.
      </div>
    </div>
  );

  const lectura: React.ReactNode =
    modo === "constante" ? (
      <>{relQK}: el sistema se desplaza {sentidoTxt.replace("= equilibrio", "= ya está en equilibrio")}</>
    ) : modo === "lechatelier" ? (
      <>Presión {fmtNum(presionAtm, 1)} atm: favorece el lado con menos moles de gas</>
    ) : esComparar ? (
      <>Reversible: se queda en equilibrio. Irreversible: se agota.</>
    ) : (
      <>Fase {idx + 1}/{totalFases} — {escena.nombre}</>
    );

  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box", fontSize: 15, fontWeight: 700, color: "#fff", background: "rgba(4,10,22,0.55)",
    border: `1px solid ${accent}`, borderRadius: 9, padding: "10px 10px", outline: "none", cursor: "pointer",
  };
  const etqStyle: React.CSSProperties = { fontSize: 14, color: T.text2, fontWeight: 700 };

  const bloqueQ = (
    <Bloque titulo="Calculadora — cociente Q vs Kc" icono="fa-calculator">
      <label style={{ display: "grid", gap: 4 }}>
        <span style={etqStyle}>Reacción en equilibrio</span>
        <select value={reacId} onChange={(e) => cambiarReaccion(e.target.value)} style={inputStyle}>
          {REACCIONES.map((r) => (
            <option key={r.id} value={r.id}>{r.ecuacion} — Kc={fmtNum(r.kc)} ({r.temperatura})</option>
          ))}
        </select>
      </label>
      {especies.map((e) => {
        const esProd = reac.productos.some((p) => p.formula === e.formula);
        const v = conc[e.formula] ?? 0;
        return (
          <Deslizador
            key={e.formula}
            label={`[${e.formula}]${e.coef > 1 ? ` (×${e.coef})` : ""}`}
            icon={esProd ? "fa-vial" : "fa-flask-vial"}
            colr={esProd ? "#fb923c" : "#38bdf8"}
            valor={`${v >= 0.1 ? v.toFixed(2) : v.toFixed(3)} mol/L`}
            min={0}
            max={2}
            step={0.01}
            value={Math.min(2, v)}
            onChange={(x) => cambiarConc(e.formula, x)}
          />
        );
      })}
      <button
        type="button"
        onClick={alEquilibrio}
        style={{ cursor: "pointer", padding: "12px 14px", borderRadius: 12, border: `1px solid #34d399`, fontSize: 15, fontWeight: 900, color: "#fff", background: "rgba(52,211,153,0.14)" }}
      >
        <i className="fa-solid fa-scale-balanced" style={{ marginRight: 8 }} aria-hidden />
        Llevar al equilibrio (Q = Kc)
      </button>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
        <Dato label="cociente Q" value={fmtNum(evalEq.q)} col="#fbbf24" />
        <Dato label="constante Kc" value={fmtNum(evalEq.kc)} col="#34d399" />
        <Dato label={relQK} value={sentidoTxt} col={sentidoCol} />
      </div>
      <p style={{ margin: 0, color: T.text2 }}>{evalEq.texto}</p>
      <p style={{ margin: 0, color: T.text3 }}>
        Q se calcula igual que Kc (productos sobre reactivos, cada uno elevado a su coeficiente). Para {reac.ecuacion}, Kc = {fmtNum(reac.kc)} a {reac.temperatura}.
      </p>
    </Bloque>
  );

  const bloqueLC = (
    <Bloque titulo="Le Châtelier — ¿qué pasa si…?" icono="fa-weight-hanging">
      <label style={{ display: "grid", gap: 4 }}>
        <span style={etqStyle}>Perturbación al equilibrio</span>
        <select value={perturb} onChange={(e) => cambiarPerturb(e.target.value as Perturbacion)} style={inputStyle}>
          {PERTURBACIONES.map((p) => (
            <option key={p.id} value={p.id}>{p.etq}</option>
          ))}
        </select>
      </label>
      <div style={{ padding: "12px 14px", borderRadius: 12, border: `1px solid ${predCol}55`, background: `${predCol}14` }}>
        <div style={{ fontWeight: 900, color: predCol, marginBottom: 6 }}>
          <i className="fa-solid fa-arrow-right-arrow-left" style={{ marginRight: 6 }} aria-hidden />
          Desplazamiento <span style={{ fontFamily: "ui-monospace, monospace", marginLeft: 6 }}>{pred.flecha}</span>
        </div>
        <div style={{ color: "#fff" }}>{pred.texto}</div>
      </div>
    </Bloque>
  );

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <EquilibrioScene
            modo={modo}
            escena={escena}
            playing={playing}
            modoColor={modoCol}
            resetNonce={resetNonce}
            presion={presion}
            qPos={qPos}
            prodFrac={prodFrac}
            ecuacionTxt={reac.ecuacion}
            sentidoTxt={`${relQK} → ${sentidoTxt}`}
            sentidoCol={sentidoCol}
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
          {!esComparar && modo === "reversible" && (
            <BotonHerramienta icono={playing ? "fa-pause" : "fa-play"} titulo={playing ? "Pausar" : "Reanudar"} activo={playing} onClick={() => setPlaying((p) => !p)} />
          )}
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reiniciar} />
        </>
      }
      lectura={lectura}
      objetivos={[
        { txt: "En el modo Constante, sube los productos hasta que Q pase de Kc y mira hacia dónde se desplaza", done: qSobreKc, modo: "constante" },
        { txt: "En el modo Le Châtelier, aprieta el pistón al máximo y mira qué color domina", done: apretoPiston, modo: "lechatelier" },
        { txt: "Observa el equilibrio dinámico en las cuatro fases de la animación", done: vioEquilibrio, modo: "reversible" },
        { txt: "Usa la calculadora para comparar Q con Kc en la reacción H₂ + I₂ ⇌ 2 HI", done: cambioConc },
        { txt: "Predice el desplazamiento con Le Châtelier", done: probaPerturb },
        { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
      ]}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              {modo === "constante" && bloqueQ}

              {modo === "lechatelier" && (
                <Bloque titulo="Presión sobre el pistón" icono="fa-compress">
                  <Deslizador label="Presión" icon="fa-compress" colr={modoCol} valor={`${fmtNum(presionAtm, 1)} atm`} min={0} max={1} step={0.05} value={presion} onChange={cambiarPresion} hintL="baja" hintR="máxima" />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                    <Dato label="moles de gas" value="2 NO₂ → 1 N₂O₄" col="#a78bfa" />
                    <Dato label="se favorece" value={predPiston.flecha === "←" ? "N₂O₄ (pálido)" : "NO₂ (pardo)"} col="#38bdf8" />
                  </div>
                  <p style={{ margin: 0, color: T.text2 }}>Al comprimir, el sistema se opone: forma el lado con menos moles de gas, así que el pardo del NO₂ se aclara. Escala de presión de ejemplo.</p>
                </Bloque>
              )}

              {modo === "reversible" && (
                <Bloque titulo="Qué está pasando" icono="fa-circle-info">
                  <p style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: "#fff" }}>Fase {idx + 1}/{totalFases} — {escena.nombre}.</strong> {escena.desc}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {nombresFase.map((nom, i) => (
                      <button
                        key={nom}
                        type="button"
                        onClick={() => {
                          setPlaying(false);
                          setPaso(i);
                          if (i >= total) setVioEquilibrio(true);
                        }}
                        style={{ cursor: "pointer", padding: "8px 11px", borderRadius: 9, fontSize: 14, fontWeight: 800, color: i === idx ? "#fff" : T.text2,
                          border: `1px solid ${i === idx ? modoCol : "rgba(255,255,255,0.14)"}`, background: i === idx ? `${modoCol}22` : "transparent" }}
                      >
                        {nom}
                      </button>
                    ))}
                  </div>
                </Bloque>
              )}

              {modo === "lechatelier" && (
                <Bloque titulo="Qué está pasando" icono="fa-circle-info">
                  <p style={{ margin: 0, color: T.text2 }}>{escena.desc}</p>
                </Bloque>
              )}

              {esComparar && (
                <Bloque titulo="Reversible vs irreversible" icono="fa-table-list">
                  <p style={{ margin: 0, color: T.text2 }}>Una reacción reversible (⇌) llega al equilibrio y conserva reactivos y productos; una irreversible (→) avanza hasta agotar un reactivo. La tabla completa está en «Teoría».</p>
                </Bloque>
              )}

              {modo !== "constante" && bloqueQ}
              {bloqueLC}
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
              <Bloque titulo="El visor del equilibrio químico" icono="fa-arrows-rotate">
                <p style={{ margin: 0, color: T.text2 }}>{PROBLEMA}</p>
              </Bloque>
              <Bloque titulo={`Para reflexionar — ${def.etq}`} icono="fa-circle-question">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {PREGUNTAS[modo].map((q, i) => <li key={i}>{q}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Cómo usar el laboratorio" icono="fa-list-ol">
                <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {INSTRUCCIONES[modo].map((p, i) => <li key={i}>{p}</li>)}
                </ol>
              </Bloque>
              <Bloque titulo="Reversible (⇌) vs irreversible (→)" icono="fa-table-list">
                <div style={{ display: "grid", gap: 10 }}>
                  {COMPARACION.map((f) => (
                    <div key={f.rasgo} style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid ${T.line}`, background: "rgba(4,10,22,0.4)" }}>
                      <strong style={{ color: "#fff" }}>{f.rasgo}</strong>
                      <div style={{ color: "#34d399" }}>Reversible: <span style={{ color: T.text2 }}>{f.reversible}</span></div>
                      <div style={{ color: "#fb923c" }}>Irreversible: <span style={{ color: T.text2 }}>{f.irreversible}</span></div>
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Ejemplo resuelto (A2)" icono="fa-square-root-variable">
                <p style={{ margin: 0, color: T.text2 }}>{EJEMPLO.enunciado}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {EJEMPLO.datos.map((d, i) => (
                    <span key={i} style={{ fontWeight: 800, color: "#fff", padding: "4px 9px", borderRadius: 8, background: "rgba(4,10,22,0.5)", border: `1px solid ${T.line}` }}>{d}</span>
                  ))}
                </div>
                <p style={{ margin: 0, color: T.text2 }}>{EJEMPLO.solucion}</p>
                <div style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid ${accent}44`, fontWeight: 800, color: "#86efac" }}>
                  <i className="fa-solid fa-flag-checkered" style={{ marginRight: 7, color: accent }} aria-hidden />{EJEMPLO.resultado}
                </div>
              </Bloque>
              <Bloque titulo="Datos del equilibrio químico" icono="fa-magnifying-glass-chart">
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
              <Bloque titulo="México: fertilizantes, esmog y la sangre" icono="fa-location-dot">
                <p style={{ margin: 0, color: T.text2 }}>{CONTEXTO}</p>
              </Bloque>
              <Bloque titulo="¿Sabías que?" icono="fa-circle-question">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {HECHOS.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Glosario" icono="fa-book">
                <div style={{ display: "grid", gap: 8 }}>
                  {GLOSARIO.map((g, i) => (
                    <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                      <span style={{ fontWeight: 900, color: accent }}>{g.termino}. </span>
                      <span style={{ color: T.text2 }}>{g.definicion}</span>
                      <div style={{ color: T.text3, marginTop: 4 }}><i className="fa-solid fa-flask" style={{ marginRight: 6, color: accent }} aria-hidden />{g.ejemplo}</div>
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Ideas clave" icono="fa-lightbulb">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {IDEAS.map((x, i) => <li key={i}>{x}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={EQUILIBRIO_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3 }}>
                El cociente Q = [productos]^coef / [reactivos]^coef, su comparación con Kc y la predicción de Le Châtelier son <strong>exactos</strong> para los valores tabulados de Kc y ΔH de cada reacción. El modelo 3D es <strong>esquemático</strong> (no a escala): la aguja sigue log(Q/Kc) y el pistón responde a la presión elegida, pero las esferas y las barras representan el mecanismo, no medidas físicas. Fuente: {FUENTE}
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
