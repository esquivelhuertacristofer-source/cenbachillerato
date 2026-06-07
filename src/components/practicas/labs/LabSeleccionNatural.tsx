"use client";

/**
 * Laboratorio 3D — "Selección natural en 3D: conejos, tipos y evidencias".
 * Práctica experimental para CNEYT-VI-P07-A2 (simulación "Selección natural en
 * conejos"; progresión 7 "Explica la teoría de la evolución por selección natural
 * y la evidencia que la sustenta", UAC CNEYT-VI).
 *
 * Tres modos:
 *  (1) conejos     — selección sobre el color del pelaje; el ambiente y la
 *                    presión depredadora cambian las frecuencias alélicas
 *                    generación a generación (ancla A2).
 *  (2) tipos       — selección estabilizadora / direccional / disruptiva (A5).
 *  (3) evidencias  — homología: mismos huesos en humano, ballena y murciélago.
 */

import { useState, useEffect, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, card, Eyebrow, SceneBoundary } from "./_kit";
import {
  type Modo,
  MODOS,
  MODOS_DEF,
  AMBIENTES,
  ambientePorId,
  PREDACION,
  predacionPorId,
  simular,
  MAXGEN_CONEJOS,
  TIPOS_SEL,
  tipoSelPorId,
  distribucionTipo,
  fitnessTipo,
  MAXGEN_TIPOS,
  ANIMALES,
  animalPorId,
  HUESOS_LEYENDA,
  HOMOLOGAS_DEF,
  ANALOGAS_DEF,
  A2_DESCRIPCION,
  PREGUNTAS_A2,
  POSTULADOS,
  PROBLEMA,
  INSTRUCCIONES,
  IDEAS,
  GLOSARIO,
  CONTEXTO,
  FUENTE,
  DATOS,
} from "./seleccion-natural-data";

const SeleccionNaturalScene = dynamic(() => import("./SeleccionNaturalScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-paw fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Cargando la selección natural en 3D…</span>
    </div>
  ),
});

export function LabSeleccionNatural({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("conejos");
  const [ambienteId, setAmbienteId] = useState<string>("pradera");
  const [predacionId, setPredacionId] = useState<string>("media");
  const [tipoId, setTipoId] = useState<string>("estabilizadora");
  const [animalId, setAnimalId] = useState<string>("humano");
  const [gen, setGen] = useState<number>(0);
  const [playing, setPlaying] = useState<boolean>(true);
  const [resetNonce, setResetNonce] = useState(0);

  const bump = () => setResetNonce((n) => n + 1);

  // valores en vivo ─ conejos
  const amb = ambientePorId(ambienteId);
  const pred = predacionPorId(predacionId);
  const traj = simular(amb.favorece, pred.s);
  // valores en vivo ─ tipos
  const tipo = tipoSelPorId(tipoId);
  const dists = distribucionTipo(tipoId);
  const fit = fitnessTipo(tipoId);
  // valores en vivo ─ evidencias
  const animal = animalPorId(animalId);

  const def = MODOS_DEF[modo];
  const modoCol = `#${def.color.replace("#", "")}`;
  const maxGen = modo === "conejos" ? MAXGEN_CONEJOS : modo === "tipos" ? MAXGEN_TIPOS : 0;
  const genActual = Math.min(gen, maxGen);

  const cur = traj[genActual] ?? traj[0]!;
  const barras = dists[genActual] ?? dists[0]!;

  // avance del tiempo (generaciones) por temporizador
  useEffect(() => {
    if (!playing || maxGen === 0) return;
    if (genActual >= maxGen) return;
    const t = setInterval(() => setGen((g) => Math.min(maxGen, g + 1)), 950);
    return () => clearInterval(t);
  }, [playing, maxGen, genActual]);

  const cambiarModo = (m: Modo) => {
    setModo(m);
    setGen(0);
    bump();
  };
  const reiniciar = () => {
    setGen(0);
    setPlaying(true);
    bump();
  };
  const cambiarAmbiente = (id: string) => {
    setAmbienteId(id);
    setGen(0);
    bump();
  };
  const cambiarPredacion = (id: string) => {
    setPredacionId(id);
    setGen(0);
  };
  const cambiarTipo = (id: string) => {
    setTipoId(id);
    setGen(0);
    bump();
  };

  // porcentajes para la lectura en vivo (conejos)
  const pctClaro = Math.round(cur.fClaro * 100);
  const pctOscuro = Math.round(cur.fOscuro * 100);
  const pctD = Math.round(cur.pD * 100);
  const morfoDominante = cur.fClaro > cur.fOscuro ? "claro" : "oscuro";
  const camuflado = amb.favorece;

  // texto del pie del visor
  const pie: string =
    modo === "conejos"
      ? `${amb.etq} · depredación ${pred.etq.toLowerCase()} · gen ${genActual}/${maxGen} — pelaje ${camuflado} favorecido: ${camuflado === "claro" ? pctClaro : pctOscuro}% de la población`
      : modo === "tipos"
        ? `Selección ${tipo.etq.toLowerCase()} · generación ${genActual}/${maxGen} — la distribución del rasgo se reforma según la aptitud`
        : `Homología: brazo humano, aleta de ballena y ala de murciélago comparten los mismos huesos (ancestro amniota común)`;

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#04121f", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${def.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{def.etq}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 440, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la información sigue aquí. {modo === "conejos" ? A2_DESCRIPCION : modo === "tipos" ? tipo.definicion : HOMOLOGAS_DEF}
      </div>
    </div>
  );

  /* ── Panel de control específico del modo (valor calculado, no componente) ── */
  let control: ReactNode = null;
  if (modo === "conejos") {
    control = (
      <>
        {/* ambiente */}
        <Eyebrow><i className="fa-solid fa-globe" style={{ marginRight: 8, color: modoCol }} />Ambiente</Eyebrow>
        <div className="sn-row3" style={{ marginBottom: 14 }}>
          {AMBIENTES.map((a) => {
            const on = a.id === ambienteId;
            return (
              <button key={a.id} className="sn-tab" data-on={on} onClick={() => cambiarAmbiente(a.id)} style={{ ["--snc" as string]: modoCol, background: on ? `${modoCol}1f` : "transparent" }}>
                <div style={{ fontSize: 16, marginBottom: 3, color: on ? modoCol : "inherit" }}><i className={`fa-solid ${a.icono}`} /></div>
                <div style={{ fontSize: 11.5, fontWeight: 900 }}>{a.etq}</div>
              </button>
            );
          })}
        </div>
        {/* predación */}
        <Eyebrow><i className="fa-solid fa-crow" style={{ marginRight: 8, color: modoCol }} />Presión depredadora</Eyebrow>
        <div className="sn-row3" style={{ marginBottom: 16 }}>
          {PREDACION.map((p) => {
            const on = p.id === predacionId;
            return (
              <button key={p.id} className="sn-tab" data-on={on} onClick={() => cambiarPredacion(p.id)} style={{ ["--snc" as string]: modoCol, background: on ? `${modoCol}1f` : "transparent" }}>
                <div style={{ fontSize: 12.5, fontWeight: 900 }}>{p.etq}</div>
                <div style={{ fontSize: 9.5, color: T.text3, marginTop: 2 }}>{p.predadores} depred.</div>
              </button>
            );
          })}
        </div>
        {/* generaciones */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
          <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.1em", color: T.text3 }}>GENERACIÓN</span>
          <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{genActual} / {maxGen}</span>
        </div>
        <input type="range" min={0} max={maxGen} value={genActual} onChange={(e) => { setPlaying(false); setGen(Number(e.target.value)); }} className="sn-range" style={{ ["--snc" as string]: modoCol }} />

        {/* lecturas */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginTop: 14 }}>
          <div className="sn-read">
            <div className="sn-read-l">Pelaje oscuro</div>
            <div className="sn-read-v" style={{ color: "#c9a98a" }}>{pctOscuro}%</div>
          </div>
          <div className="sn-read">
            <div className="sn-read-l">Pelaje claro</div>
            <div className="sn-read-v" style={{ color: "#e9eef4" }}>{pctClaro}%</div>
          </div>
          <div className="sn-read">
            <div className="sn-read-l">Alelo D (osc.)</div>
            <div className="sn-read-v" style={{ color: modoCol }}>{pctD}%</div>
          </div>
          <div className="sn-read">
            <div className="sn-read-l">Aptitud media</div>
            <div className="sn-read-v" style={{ color: "#fbbf24" }}>{cur.wbar.toFixed(2)}</div>
          </div>
        </div>

        {/* veredicto */}
        <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 12, border: `1px solid ${modoCol}44`, background: `${modoCol}12`, fontSize: 12, color: "#eaf0fb", lineHeight: 1.5 }}>
          <i className="fa-solid fa-circle-info" style={{ color: modoCol, marginRight: 8 }} />
          En {amb.etq.toLowerCase()} se camufla el pelaje <strong>{camuflado}</strong>. Tras {genActual} generaciones, el morfo predominante es el <strong>{morfoDominante}</strong> ({morfoDominante === "claro" ? pctClaro : pctOscuro}%).
        </div>
      </>
    );
  } else if (modo === "tipos") {
    control = (
      <>
        <Eyebrow><i className="fa-solid fa-chart-column" style={{ marginRight: 8, color: modoCol }} />Tipo de selección</Eyebrow>
        <div className="sn-row3" style={{ marginBottom: 16 }}>
          {TIPOS_SEL.map((tp) => {
            const on = tp.id === tipoId;
            const c = `#${tp.color.replace("#", "")}`;
            return (
              <button key={tp.id} className="sn-tab" data-on={on} onClick={() => cambiarTipo(tp.id)} style={{ ["--snc" as string]: c, background: on ? `${c}1f` : "transparent" }}>
                <div style={{ fontSize: 15, marginBottom: 3, color: on ? c : "inherit" }}><i className={`fa-solid ${tp.icono}`} /></div>
                <div style={{ fontSize: 11, fontWeight: 900 }}>{tp.etq}</div>
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
          <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.1em", color: T.text3 }}>GENERACIÓN</span>
          <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{genActual} / {maxGen}</span>
        </div>
        <input type="range" min={0} max={maxGen} value={genActual} onChange={(e) => { setPlaying(false); setGen(Number(e.target.value)); }} className="sn-range" style={{ ["--snc" as string]: modoCol }} />

        <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 12, border: `1px solid ${modoCol}44`, background: `${modoCol}12` }}>
          <div style={{ fontSize: 12.5, fontWeight: 900, color: modoCol, marginBottom: 6 }}>
            <i className={`fa-solid ${tipo.icono}`} style={{ marginRight: 8 }} />{tipo.etq}
          </div>
          <div style={{ fontSize: 12, color: "#eaf0fb", lineHeight: 1.5, marginBottom: 8 }}>
            Selección {tipo.definicion}.
          </div>
          <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.5, paddingTop: 8, borderTop: `1px solid ${T.line}` }}>
            <i className="fa-solid fa-flask" style={{ color: modoCol, marginRight: 7 }} />{tipo.ejemplo}
          </div>
        </div>
      </>
    );
  } else {
    control = (
      <>
        <Eyebrow><i className="fa-solid fa-bone" style={{ marginRight: 8, color: modoCol }} />Extremidad a resaltar</Eyebrow>
        <div className="sn-row3" style={{ marginBottom: 16 }}>
          {ANIMALES.map((a) => {
            const on = a.id === animalId;
            return (
              <button key={a.id} className="sn-tab" data-on={on} onClick={() => setAnimalId(a.id)} style={{ ["--snc" as string]: modoCol, background: on ? `${modoCol}1f` : "transparent" }}>
                <div style={{ fontSize: 15, marginBottom: 3, color: on ? modoCol : "inherit" }}><i className={`fa-solid ${a.icono}`} /></div>
                <div style={{ fontSize: 10.5, fontWeight: 900, lineHeight: 1.15 }}>{a.etq}</div>
              </button>
            );
          })}
        </div>
        {/* leyenda de huesos */}
        <Eyebrow><i className="fa-solid fa-palette" style={{ marginRight: 8, color: modoCol }} />Mismos huesos, mismo color</Eyebrow>
        <div style={{ display: "grid", gap: 7, marginBottom: 14 }}>
          {HUESOS_LEYENDA.map((h) => (
            <div key={h.tipo} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11.5 }}>
              <span style={{ width: 14, height: 14, borderRadius: 4, background: h.color, flexShrink: 0, boxShadow: `0 0 8px ${h.color}88` }} />
              <span style={{ fontWeight: 900, color: "#fff" }}>{h.tipo}</span>
              <span style={{ color: T.text3 }}>· {h.nota}</span>
            </div>
          ))}
        </div>
        {/* animal seleccionado */}
        <div style={{ padding: "13px 15px", borderRadius: 12, border: `1px solid ${modoCol}44`, background: `${modoCol}12` }}>
          <div style={{ fontSize: 12.5, fontWeight: 900, color: modoCol, marginBottom: 4 }}>
            <i className={`fa-solid ${animal.icono}`} style={{ marginRight: 8 }} />{animal.etq} <span style={{ color: T.text3, fontWeight: 600 }}>· {animal.funcion}</span>
          </div>
          <div style={{ fontSize: 12, color: "#eaf0fb", lineHeight: 1.5 }}>{animal.descripcion}</div>
        </div>
      </>
    );
  }

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes snPulse { 0%,100%{ box-shadow:0 0 0 0 var(--snd); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .sn-live-dot { animation: snPulse 1.6s ease-in-out infinite; }
        .sn-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(310px,28vw,410px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .sn-grid { grid-template-columns: 1fr; } }
        .sn-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .sn-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .sn-icobtn:hover { background:rgba(255,255,255,0.12); }
        .sn-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .sn-tab { cursor:pointer; border:1px solid var(--snc); border-radius:12px; padding:11px 8px; text-align:center;
          background:transparent; transition:all .15s; color:#fff; }
        .sn-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.62); }
        .sn-tab:hover { background:rgba(255,255,255,0.06); }
        .sn-row3 { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .sn-read { padding:10px 8px; border-radius:11px; border:1px solid rgba(255,255,255,0.10); background:rgba(4,10,22,0.4); text-align:center; }
        .sn-read-l { font-size:9.5px; font-weight:800; letter-spacing:0.06em; color:rgba(255,255,255,0.42); text-transform:uppercase; }
        .sn-read-v { font-size:20px; font-weight:900; font-family:ui-monospace,monospace; margin-top:3px; }
        .sn-range { width:100%; accent-color: var(--snc); cursor:pointer; }
        @media (max-width: 1000px){ .sn-bottom { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* Selector de modo */}
      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="sn-tabs">
          {MODOS.map((m) => {
            const d = MODOS_DEF[m];
            const col = `#${d.color.replace("#", "")}`;
            const on = m === modo;
            return (
              <button key={m} className="sn-tab" data-on={on} onClick={() => cambiarModo(m)} style={{ ["--snc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                <div style={{ fontSize: 18, marginBottom: 4, color: on ? col : "inherit" }}><i className={`fa-solid ${d.icono}`} /></div>
                <div style={{ fontSize: 12.5, fontWeight: 900 }}>{d.etq}</div>
                <div style={{ fontSize: 10, color: T.text3, marginTop: 3, lineHeight: 1.25 }}>{d.subtitulo}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="sn-grid">
        {/* ── Columna visor ──────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              position: "relative",
              height: "clamp(440px, 58vh, 660px)",
              borderRadius: 20,
              overflow: "hidden",
              border: `1px solid rgba(${color.rgba},0.22)`,
              background: `radial-gradient(120% 80% at 30% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#06121e 0%,#040a16 100%)`,
              boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}`,
            }}
          >
            <SceneBoundary fallback={sceneFallback}>
              <SeleccionNaturalScene
                modo={modo}
                terreno={amb.terreno}
                cielo={amb.cielo}
                fClaro={cur.fClaro}
                predadores={pred.predadores}
                barras={barras}
                fitness={fit}
                tipoColor={`#${tipo.color.replace("#", "")}`}
                animalSel={animalId}
                playing={playing}
                accent={accent}
                resetNonce={resetNonce}
                gen={genActual}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)" }}>
              <span className="sn-live-dot" style={{ ["--snd" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{def.etq.toUpperCase()}</span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="sn-icobtn" data-on={playing} onClick={() => setPlaying((p) => !p)} title={playing ? "Pausar" : "Reanudar"}>
                <i className={`fa-solid ${playing ? "fa-pause" : "fa-play"}`} />
              </button>
              <button className="sn-icobtn" onClick={reiniciar} title="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Pie: lectura en vivo */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                <i className={`fa-solid ${def.icono}`} style={{ color: modoCol, marginRight: 7 }} />
                {def.etq} — {def.subtitulo}
              </div>
              <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>{pie}</div>
            </div>
          </div>

          {/* Panel de control del modo */}
          <div style={{ ...card, padding: "18px 22px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <Eyebrow>
                <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: modoCol }} />
                Controles — {def.etq}
              </Eyebrow>
              <span style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: def.fuente === "A2" ? "#fcd34d" : def.fuente === "A5" ? "#86efac" : "#7dd3fc", border: `1px solid ${def.fuente === "A2" ? "#fcd34d55" : def.fuente === "A5" ? "#86efac55" : "#7dd3fc55"}`, borderRadius: 6, padding: "3px 7px" }}>
                {def.fuente === "A2" ? "SIMULACIÓN A2" : def.fuente === "A5" ? "GLOSARIO A5" : "LECTURA A1"}
              </span>
            </div>
            {control}
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Descripción del laboratorio */}
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${accent}66`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: accent }}>
                <i className="fa-solid fa-dna" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>El visor de la evolución</div>
            </div>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{PROBLEMA}</div>
          </div>

          {/* Ancla por modo */}
          {modo === "conejos" && (
            <>
              <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: "1px solid #fcd34d55", background: "rgba(252,211,77,0.07)" }}>
                <Eyebrow><i className="fa-solid fa-flask-vial" style={{ marginRight: 8, color: "#fcd34d" }} />Simulación A2 — Selección natural en conejos</Eyebrow>
                <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55, marginBottom: 12 }}>{A2_DESCRIPCION}</div>
                <div style={{ fontSize: 11, fontWeight: 900, color: T.text3, letterSpacing: "0.08em", marginBottom: 8 }}>PARA REFLEXIONAR</div>
                <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 8 }}>
                  {PREGUNTAS_A2.map((q, i) => (
                    <li key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>{q}</li>
                  ))}
                </ul>
              </div>
              <div style={{ ...card, padding: "18px 20px 20px" }}>
                <Eyebrow><i className="fa-solid fa-list-check" style={{ marginRight: 8, color: accent }} />Los 4 postulados de Darwin</Eyebrow>
                <div style={{ display: "grid", gap: 9 }}>
                  {POSTULADOS.map((p) => (
                    <div key={p.n} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${accent}25` }}>
                      <div style={{ width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#04121f", background: accent, flexShrink: 0 }}>{p.n}</div>
                      <div style={{ fontSize: 12, color: "#fff", lineHeight: 1.45, minWidth: 0 }}>{p.texto}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          {modo === "tipos" && (
            <div style={{ ...card, padding: "18px 20px 20px" }}>
              <Eyebrow><i className="fa-solid fa-layer-group" style={{ marginRight: 8, color: accent }} />Tres tipos de selección (A5)</Eyebrow>
              <div style={{ display: "grid", gap: 10 }}>
                {TIPOS_SEL.map((tp) => {
                  const c = `#${tp.color.replace("#", "")}`;
                  return (
                    <div key={tp.id} style={{ padding: "11px 13px", borderRadius: 11, background: tp.id === tipoId ? `${c}14` : "rgba(4,10,22,0.4)", border: `1px solid ${tp.id === tipoId ? `${c}55` : T.line}` }}>
                      <div style={{ fontSize: 12.5, fontWeight: 900, color: c, marginBottom: 3 }}><i className={`fa-solid ${tp.icono}`} style={{ marginRight: 7 }} />{tp.etq}</div>
                      <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>Selección {tp.definicion}.</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {modo === "evidencias" && (
            <div style={{ ...card, padding: "18px 20px 20px" }}>
              <Eyebrow><i className="fa-solid fa-code-branch" style={{ marginRight: 8, color: accent }} />Homólogas vs. análogas (A5)</Eyebrow>
              <div style={{ padding: "11px 13px", borderRadius: 11, background: `${modoCol}12`, border: `1px solid ${modoCol}44`, marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: "#eaf0fb", lineHeight: 1.5 }}>{HOMOLOGAS_DEF}</div>
              </div>
              <div style={{ padding: "11px 13px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5 }}>{ANALOGAS_DEF}</div>
              </div>
              <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 11, background: `rgba(${color.rgba},0.12)`, border: `1px solid ${accent}44` }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>ADN humano–chimpancé</span>
                <span style={{ fontSize: 20, fontWeight: 900, color: accent, fontFamily: "ui-monospace, monospace" }}>~98.7%</span>
              </div>
            </div>
          )}

          {/* Cómo usar */}
          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <Eyebrow><i className="fa-solid fa-list-ol" style={{ marginRight: 8, color: accent }} />Cómo usar el laboratorio</Eyebrow>
            <div style={{ display: "grid", gap: 9 }}>
              {INSTRUCCIONES.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${accent}25` }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#04121f", background: accent, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ fontSize: 12, color: "#fff", lineHeight: 1.45, minWidth: 0 }}>{p}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Lecturas + ideas clave ─────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="sn-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow><i className="fa-solid fa-magnifying-glass-chart" style={{ marginRight: 8, color: accent }} />Datos y evidencias</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {DATOS.map((dd, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", borderRadius: 10, background: T.glass, border: `1px solid ${T.line}` }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: accent, background: `rgba(${color.rgba},0.16)`, flexShrink: 0 }}>
                  <i className={`fa-solid ${dd.icono}`} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{dd.valor}</div>
                  <div style={{ fontSize: 11, color: T.text2, lineHeight: 1.4 }}>{dd.texto}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Contexto mexicano: CONABIO */}
          <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 12, border: `1px solid ${accent}33`, background: `rgba(${color.rgba},0.07)` }}>
            <Eyebrow><i className="fa-solid fa-location-dot" style={{ marginRight: 8, color: accent }} />México: un país megadiverso</Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{CONTEXTO}</div>
          </div>

          {/* Glosario */}
          <div style={{ marginTop: 16 }}>
            <Eyebrow><i className="fa-solid fa-book" style={{ marginRight: 8, color: accent }} />Glosario</Eyebrow>
            <div style={{ display: "grid", gap: 8 }}>
              {GLOSARIO.map((g, i) => (
                <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                  <span style={{ fontSize: 12, fontWeight: 900, color: accent }}>{g.termino}. </span>
                  <span style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>{g.definicion}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow><i className="fa-solid fa-lightbulb" style={{ marginRight: 8, color: accent }} />Ideas clave</Eyebrow>
          <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 9 }}>
            {IDEAS.map((x, i) => (
              <li key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>{x}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* nota de honestidad del modelo */}
      <div style={{ marginTop: 16, fontSize: 11.5, color: T.text3, lineHeight: 1.5, display: "flex", gap: 9, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          La descripción y las preguntas de reflexión del modo «conejos» son <strong>verbatim</strong> de la simulación A2 (etiqueta «SIMULACIÓN A2»). Los tres tipos de selección y el glosario son verbatim del glosario A5 (etiqueta «GLOSARIO A5»); los cuatro postulados, las evidencias (homología, ~98.7% de ADN compartido con el chimpancé) y el contexto de la CONABIO son verbatim de la lectura A1 (etiqueta «LECTURA A1»). El modelo 3D es <strong>esquemático</strong>: las frecuencias alélicas siguen un modelo de un gen con dos alelos (D dominante oscuro, d recesivo claro) y selección sobre el fenotipo con el coeficiente <i>s</i> de la presión elegida; los conejos, los depredadores, las barras del rasgo y los huesos son representaciones visuales (no a escala) para entender el mecanismo, no medidas reales de una población concreta. Fuente: {FUENTE}
        </span>
      </div>
    </div>
  );
}
