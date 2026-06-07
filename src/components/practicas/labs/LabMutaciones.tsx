"use client";

/**
 * Laboratorio 3D — "Mutaciones: tipos, causas y consecuencias".
 * Práctica experimental anclada a CNEYT-VI-P06-A1 (lectura "Mutaciones: tipos,
 * causas y consecuencias"; progresión 6, UAC CNEYT-VI "Organismos y evolución
 * biológica"). P06 no tiene A2 manipulable (su A2 es un quiz de opción múltiple),
 * por lo que el laboratorio se ancla a la lectura A1, con el glosario verbatim A5
 * y los hechos de los quizzes A2/A4.
 *
 * Tres modos:
 *  (1) Puntuales — sobre una secuencia real de la β-globina se aplica una
 *      sustitución / inserción / deleción y se compara en 3D la proteína original
 *      con la mutada (silenciosa, missense, nonsense, frameshift).
 *  (2) Cromosómicas — deleción, duplicación, inversión, translocación y
 *      aneuploidía (trisomía 21) sobre un cromosoma "modelo" de bandas.
 *  (3) Mutágenos — UV (dímero de timina), radiación ionizante, químicos y
 *      biológicos, y la reparación del ADN (NER).
 */

import { useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, card, Eyebrow, SceneBoundary } from "./_kit";
import {
  type Modo,
  type ClasePuntual,
  type TipoCromo,
  type TipoMutageno,
  MODOS,
  MODOS_DEF,
  MUTACIONES_PUNTUALES,
  mutPuntualPorId,
  analizarPuntual,
  MUTACIONES_CROMO,
  mutCromoPorId,
  resultadoCromo,
  MUTAGENOS,
  mutagenoPorId,
  REPARACION,
  PROBLEMA,
  DEFINICION,
  LECTURA_A1,
  PREGUNTAS,
  INSTRUCCIONES,
  IDEAS,
  GLOSARIO,
  HECHOS,
  DATOS,
  CONTEXTO,
  FUENTE,
} from "./mutaciones-data";

const MutacionesScene = dynamic(() => import("./MutacionesScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-dna fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Cargando las mutaciones en 3D…</span>
    </div>
  ),
});

export function LabMutaciones({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("puntuales");
  const [clasePuntual, setClasePuntual] = useState<ClasePuntual>("missense");
  const [tipoCromo, setTipoCromo] = useState<TipoCromo>("delecion");
  const [tipoMutageno, setTipoMutageno] = useState<TipoMutageno>("uv");
  const [dimero, setDimero] = useState<boolean>(true); // UV: daño formado
  const [reparar, setReparar] = useState<boolean>(false); // NER aplicado
  const [playing, setPlaying] = useState<boolean>(true);
  const [resetNonce, setResetNonce] = useState(0);

  const bump = () => setResetNonce((n) => n + 1);

  const def = MODOS_DEF[modo];
  const modoCol = `#${def.color.replace("#", "")}`;

  const analisis = analizarPuntual(clasePuntual);
  const puntualDef = mutPuntualPorId(clasePuntual);
  const resCromo = resultadoCromo(tipoCromo);
  const cromoDef = mutCromoPorId(tipoCromo);
  const mutageno = mutagenoPorId(tipoMutageno);

  const cambiarModo = (m: Modo) => {
    setModo(m);
    setPlaying(true);
    bump();
  };
  const reiniciar = () => {
    setReparar(false);
    if (modo === "mutagenos") setDimero(true);
    setPlaying(true);
    bump();
  };

  // pie del visor
  const pie: string =
    modo === "puntuales"
      ? `${puntualDef.etq} (${puntualDef.tipoTec}). ${analisis.efecto}`
      : modo === "cromosomicas"
        ? `${cromoDef.etq} (${cromoDef.clase}). ${cromoDef.descripcion} Ejemplo: ${cromoDef.ejemplo}`
        : mutageno.id === "uv"
          ? reparar
            ? "La reparación por escisión de nucleótidos (NER) retira el dímero de timina y restaura la doble hélice."
            : dimero
              ? mutageno.mecanismo
              : "Doble hélice intacta. Activa la radiación UV para formar un dímero de timina entre las dos timinas adyacentes."
          : `${mutageno.categoria} — ${mutageno.mecanismo}`;

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#04121f", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${def.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{def.etq}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 440, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la información sigue aquí. {DEFINICION}
      </div>
    </div>
  );

  /* ── Panel de control específico del modo ──────────────────────────── */
  let control: ReactNode = null;
  if (modo === "puntuales") {
    control = (
      <>
        <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "0 0 8px", textTransform: "uppercase" }}>Aplica una mutación a la β-globina</div>
        <div className="mu-opts">
          {MUTACIONES_PUNTUALES.map((m) => {
            const col = `#${m.color.replace("#", "")}`;
            const on = m.id === clasePuntual;
            return (
              <button key={m.id} className="mu-opt" data-on={on} onClick={() => { setClasePuntual(m.id); setPlaying(true); bump(); }} style={{ ["--muc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                <i className={`fa-solid ${m.icono}`} style={{ marginRight: 8, color: on ? col : T.text3 }} />
                {m.etq}
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 13, padding: "12px 14px", borderRadius: 12, border: `1px solid ${modoCol}55`, background: `${modoCol}12` }}>
          <div style={{ fontSize: 12.5, fontWeight: 900, color: "#fff", marginBottom: 5 }}>
            <i className={`fa-solid ${puntualDef.icono}`} style={{ color: modoCol, marginRight: 8 }} />
            {puntualDef.etq} <span style={{ fontSize: 11, color: T.text3, fontWeight: 700 }}>· {puntualDef.tipoTec}</span>
          </div>
          <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{puntualDef.descripcion}</div>
          <div style={{ marginTop: 10, fontSize: 11.5, color: "#eaf0fb", lineHeight: 1.5, padding: "9px 11px", borderRadius: 9, background: "rgba(4,10,22,0.4)" }}>
            <i className="fa-solid fa-arrow-right-long" style={{ color: modoCol, marginRight: 7 }} />{analisis.efecto}
          </div>
          <div style={{ marginTop: 9, fontSize: 11, color: T.text3, fontFamily: "ui-monospace, monospace", lineHeight: 1.5 }}>
            ARNm: {analisis.arnmMutado}
          </div>
        </div>
      </>
    );
  } else if (modo === "cromosomicas") {
    control = (
      <>
        <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "0 0 8px", textTransform: "uppercase" }}>Tipo de mutación cromosómica</div>
        <div className="mu-opts">
          {MUTACIONES_CROMO.filter((m) => m.id !== "normal").map((m) => {
            const col = `#${m.color.replace("#", "")}`;
            const on = m.id === tipoCromo;
            return (
              <button key={m.id} className="mu-opt" data-on={on} onClick={() => { setTipoCromo(m.id); setPlaying(true); bump(); }} style={{ ["--muc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                <i className={`fa-solid ${m.icono}`} style={{ marginRight: 8, color: on ? col : T.text3 }} />
                {m.etq}
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 13, padding: "12px 14px", borderRadius: 12, border: `1px solid ${modoCol}55`, background: `${modoCol}12` }}>
          <div style={{ fontSize: 12.5, fontWeight: 900, color: "#fff", marginBottom: 5 }}>
            <i className={`fa-solid ${cromoDef.icono}`} style={{ color: modoCol, marginRight: 8 }} />
            {cromoDef.etq} <span style={{ fontSize: 11, color: T.text3, fontWeight: 700 }}>· {cromoDef.clase}</span>
          </div>
          <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{cromoDef.descripcion}</div>
          <div style={{ marginTop: 10, fontSize: 11.5, color: "#eaf0fb", lineHeight: 1.5, padding: "9px 11px", borderRadius: 9, background: "rgba(4,10,22,0.4)" }}>
            <i className="fa-solid fa-flask-vial" style={{ color: modoCol, marginRight: 7 }} />{cromoDef.ejemplo}
          </div>
        </div>
      </>
    );
  } else {
    control = (
      <>
        <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "0 0 8px", textTransform: "uppercase" }}>Agente mutágeno</div>
        <div className="mu-opts">
          {MUTAGENOS.map((m) => {
            const col = `#${m.color.replace("#", "")}`;
            const on = m.id === tipoMutageno;
            return (
              <button key={m.id} className="mu-opt" data-on={on} onClick={() => { setTipoMutageno(m.id); setReparar(false); setDimero(true); setPlaying(true); bump(); }} style={{ ["--muc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                <i className={`fa-solid ${m.icono}`} style={{ marginRight: 8, color: on ? col : T.text3 }} />
                {m.etq}
              </button>
            );
          })}
        </div>

        {/* controles del dímero de timina (solo UV) */}
        {mutageno.id === "uv" && (
          <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
            <button className="mu-toggle" data-on={dimero} onClick={() => { setDimero((d) => !d); setReparar(false); }} style={{ ["--muc" as string]: dimero ? "#fbbf24" : "rgba(255,255,255,0.2)" }}>
              <i className={`fa-solid ${dimero ? "fa-sun" : "fa-ban"}`} style={{ marginRight: 9, color: dimero ? "#fbbf24" : T.text3 }} />
              {dimero ? "Radiación UV: dímero de timina formado" : "Radiación UV: sin daño"}
            </button>
            <button className="mu-toggle" data-on={reparar} disabled={!dimero} onClick={() => setReparar((r) => !r)} style={{ ["--muc" as string]: reparar ? "#34d399" : "rgba(255,255,255,0.2)", opacity: dimero ? 1 : 0.45, cursor: dimero ? "pointer" : "not-allowed" }}>
              <i className="fa-solid fa-scissors" style={{ marginRight: 9, color: reparar ? "#34d399" : T.text3 }} />
              {reparar ? "Reparación NER: ACTIVADA" : "Reparar con NER (escisión de nucleótidos)"}
            </button>
          </div>
        )}

        {/* agentes representativos */}
        <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 7px", textTransform: "uppercase" }}>Agentes representativos</div>
        <div className="mu-chips">
          {mutageno.agentes.map((a) => (
            <span key={a} className="mu-chip" style={{ borderColor: `${modoCol}66`, background: `${modoCol}1e`, color: "#fff" }}>
              <i className={`fa-solid ${mutageno.icono}`} style={{ color: modoCol }} />{a}
            </span>
          ))}
        </div>

        <div style={{ marginTop: 14, padding: "11px 13px", borderRadius: 11, border: `1px solid ${modoCol}44`, background: `${modoCol}12`, fontSize: 12, color: "#eaf0fb", lineHeight: 1.5 }}>
          <i className="fa-solid fa-circle-info" style={{ color: modoCol, marginRight: 8 }} />
          {mutageno.ejemplo}
        </div>
      </>
    );
  }

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes muPulse { 0%,100%{ box-shadow:0 0 0 0 var(--mud); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .mu-live-dot { animation: muPulse 1.6s ease-in-out infinite; }
        .mu-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(310px,28vw,410px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .mu-grid { grid-template-columns: 1fr; } }
        .mu-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .mu-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .mu-icobtn:hover { background:rgba(255,255,255,0.12); }
        .mu-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .mu-tab { cursor:pointer; border:1px solid var(--muc); border-radius:12px; padding:11px 8px; text-align:center;
          background:transparent; transition:all .15s; color:#fff; }
        .mu-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.62); }
        .mu-tab:hover { background:rgba(255,255,255,0.06); }
        .mu-opts { display:flex; flex-wrap:wrap; gap:7px; }
        .mu-opt { cursor:pointer; border:1px solid var(--muc); border-radius:10px; padding:9px 12px; font-size:12px;
          font-weight:800; color:#fff; transition:all .15s; }
        .mu-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.66); }
        .mu-opt:hover { background:rgba(255,255,255,0.06); }
        .mu-chips { display:flex; flex-wrap:wrap; gap:6px; }
        .mu-chip { display:inline-flex; align-items:center; gap:6px; padding:6px 10px; border-radius:9px;
          border:1px solid; font-size:11.5px; font-weight:800; }
        .mu-toggle { width:100%; cursor:pointer; border:1px solid var(--muc); border-radius:11px; padding:11px 14px;
          background:rgba(4,10,22,0.4); color:#fff; font-size:12.5px; font-weight:900; text-align:left; transition:all .15s; }
        .mu-toggle:hover { background:rgba(255,255,255,0.07); }
        @media (max-width: 1000px){ .mu-bottom { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* Selector de modo */}
      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="mu-tabs">
          {MODOS.map((m) => {
            const d = MODOS_DEF[m];
            const col = `#${d.color.replace("#", "")}`;
            const on = m === modo;
            return (
              <button key={m} className="mu-tab" data-on={on} onClick={() => cambiarModo(m)} style={{ ["--muc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                <div style={{ fontSize: 18, marginBottom: 4, color: on ? col : "inherit" }}><i className={`fa-solid ${d.icono}`} /></div>
                <div style={{ fontSize: 12.5, fontWeight: 900 }}>{d.etq}</div>
                <div style={{ fontSize: 10, color: T.text3, marginTop: 3, lineHeight: 1.25 }}>{d.subtitulo}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mu-grid">
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
              <MutacionesScene
                modo={modo}
                analisis={analisis}
                resultadoCromo={resCromo}
                cromoDef={cromoDef}
                mutageno={mutageno}
                dimero={dimero}
                reparar={reparar}
                playing={playing}
                accent={accent}
                modoColor={modoCol}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)" }}>
              <span className="mu-live-dot" style={{ ["--mud" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{def.etq.toUpperCase()}</span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              {modo === "mutagenos" && mutageno.id === "uv" && (
                <button className="mu-icobtn" data-on={dimero} onClick={() => { setDimero((d) => !d); setReparar(false); }} title={dimero ? "Quitar daño UV" : "Aplicar radiación UV"}>
                  <i className={`fa-solid ${dimero ? "fa-sun" : "fa-ban"}`} />
                </button>
              )}
              <button className="mu-icobtn" data-on={playing} onClick={() => setPlaying((p) => !p)} title={playing ? "Pausar" : "Reanudar"}>
                <i className={`fa-solid ${playing ? "fa-pause" : "fa-play"}`} />
              </button>
              <button className="mu-icobtn" onClick={reiniciar} title="Reiniciar">
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
              <span style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: "#7dd3fc", border: "1px solid #7dd3fc55", borderRadius: 6, padding: "3px 7px" }}>
                {def.fuente === "A5" ? "GLOSARIO A5" : "LECTURA A1"}
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
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>Mutaciones del ADN</div>
            </div>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{PROBLEMA}</div>
          </div>

          {/* Ancla A1 — lectura + reflexión */}
          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: "1px solid #7dd3fc55", background: "rgba(125,211,252,0.07)" }}>
            <Eyebrow><i className="fa-solid fa-book-open" style={{ marginRight: 8, color: "#7dd3fc" }} />Lectura A1 — ¿Qué es una mutación?</Eyebrow>
            <div style={{ display: "grid", gap: 9, marginBottom: 12 }}>
              {LECTURA_A1.map((p, i) => (
                <div key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{p}</div>
              ))}
            </div>
            <div style={{ fontSize: 11, fontWeight: 900, color: T.text3, letterSpacing: "0.08em", marginBottom: 8 }}>PARA REFLEXIONAR</div>
            <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 8 }}>
              {PREGUNTAS.map((q, i) => (
                <li key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>{q}</li>
              ))}
            </ul>
          </div>

          {/* Reparación del ADN (NER/MMR/NHEJ) */}
          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <Eyebrow><i className="fa-solid fa-screwdriver-wrench" style={{ marginRight: 8, color: accent }} />Reparación del ADN (A5)</Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{REPARACION}</div>
          </div>

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

      {/* ── Datos + ideas clave ────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="mu-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow><i className="fa-solid fa-magnifying-glass-chart" style={{ marginRight: 8, color: accent }} />Datos clave</Eyebrow>
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

          {/* Contexto mexicano: INMEGEN */}
          <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 12, border: `1px solid ${accent}33`, background: `rgba(${color.rgba},0.07)` }}>
            <Eyebrow><i className="fa-solid fa-location-dot" style={{ marginRight: 8, color: accent }} />México: medicina genómica (INMEGEN)</Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{CONTEXTO}</div>
          </div>

          {/* ¿Sabías que? */}
          <div style={{ marginTop: 16 }}>
            <Eyebrow><i className="fa-solid fa-circle-question" style={{ marginRight: 8, color: accent }} />¿Sabías que? (quizzes A2/A4)</Eyebrow>
            <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 8 }}>
              {HECHOS.map((h, i) => (
                <li key={i} style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>{h}</li>
              ))}
            </ul>
          </div>

          {/* Glosario */}
          <div style={{ marginTop: 16 }}>
            <Eyebrow><i className="fa-solid fa-book" style={{ marginRight: 8, color: accent }} />Glosario (A5)</Eyebrow>
            <div style={{ display: "grid", gap: 8 }}>
              {GLOSARIO.map((g, i) => (
                <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                  <span style={{ fontSize: 12, fontWeight: 900, color: accent }}>{g.termino}. </span>
                  <span style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>{g.definicion}</span>
                  <div style={{ fontSize: 11, color: T.text3, lineHeight: 1.4, marginTop: 4 }}><i className="fa-solid fa-flask" style={{ marginRight: 6, color: accent }} />{g.ejemplo}</div>
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
          La lectura A1, las preguntas de reflexión, el glosario A5 (con sus ejemplos) y los hechos de «¿sabías que?» (quizzes A2/A4) son <strong>verbatim</strong> del MCCEMS 2025. En el modo de mutaciones puntuales, la secuencia, la traducción a aminoácidos y el efecto de cada mutación se <strong>calculan</strong> sobre el inicio real del gen de la β-globina humana usando el código genético universal estándar. Los cromosomas de bandas, la doble hélice y el dímero de timina son representaciones <strong>esquemáticas</strong> del mecanismo, no modelos a escala molecular. El contexto del INMEGEN es informativo. Fuente: {FUENTE}
        </span>
      </div>
    </div>
  );
}
