"use client";

/**
 * Laboratorio 3D — "Biotecnología y bioética: CRISPR, OGM y clonación".
 * Práctica experimental anclada a CNEYT-VI-P08-A1 (infografía "Biotecnología y
 * bioética en México"; progresión 8, UAC CNEYT-VI). La parte MANIPULABLE es la
 * biotecnología (las tres técnicas que nombra la infografía: «transgénicos,
 * CRISPR o clonación»); la dimensión ética se conserva como debate verbatim,
 * porque es deliberación, no un mecanismo que se pueda «correr».
 *
 * Tres modos:
 *  (1) CRISPR-Cas9 — una ARN guía (sgRNA) localiza la secuencia diana junto al
 *      PAM, Cas9 corta la doble cadena y la célula repara por NHEJ (indel →
 *      knockout) o HDR (inserción precisa). El alumno elige cortar y reparar.
 *  (2) Transgénico / OGM — ADN recombinante: un gen foráneo se inserta en un
 *      plásmido y se transforma un hospedero (insulina humana, maíz Bt, arroz
 *      dorado), que produce la proteína.
 *  (3) Clonación — transferencia nuclear (Dolly): reproductiva (clon completo)
 *      vs terapéutica (células madre, sin fin reproductivo).
 */

import { useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, card, Eyebrow, SceneBoundary } from "./_kit";
import {
  type Modo,
  type Reparacion,
  type TipoClon,
  MODOS,
  MODOS_DEF,
  REPARACIONES,
  reparacionPorId,
  resultadoCrispr,
  ETAPAS_CRISPR,
  TRANSGENES,
  transgenPorId,
  ETAPAS_TRANSGEN,
  CLONES,
  clonPorId,
  ETAPAS_CLONACION,
  DEFINICION,
  TITULO_A1,
  PUNTOS_CLAVE,
  HITOS,
  PRINCIPIOS_BIOETICA,
  CASOS_CRITICOS,
  GERMINAL_VS_SOMATICA,
  GLOSARIO,
  HECHOS,
  DATOS,
  PREGUNTAS,
  CONTEXTO,
  FUENTE,
} from "./biotecnologia-data";

const BiotecnologiaScene = dynamic(() => import("./BiotecnologiaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-dna fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Cargando la biotecnología en 3D…</span>
    </div>
  ),
});

export function LabBiotecnologia({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("crispr");
  const [reparacion, setReparacion] = useState<Reparacion>("hdr");
  const [cortar, setCortar] = useState<boolean>(false);
  const [transgenId, setTransgenId] = useState<string>("insulina");
  const [clonId, setClonId] = useState<TipoClon>("reproductiva");
  const [playing, setPlaying] = useState<boolean>(true);
  const [resetNonce, setResetNonce] = useState(0);

  const bump = () => setResetNonce((n) => n + 1);

  const def = MODOS_DEF[modo];
  const modoCol = `#${def.color.replace("#", "")}`;

  const repDef = reparacionPorId(reparacion);
  const resCrispr = resultadoCrispr(reparacion);
  const transgen = transgenPorId(transgenId);
  const clon = clonPorId(clonId);

  const etapas =
    modo === "crispr" ? ETAPAS_CRISPR : modo === "transgenico" ? ETAPAS_TRANSGEN : ETAPAS_CLONACION;

  const cambiarModo = (m: Modo) => {
    setModo(m);
    if (m === "crispr") setCortar(false);
    setPlaying(true);
    bump();
  };
  const reiniciar = () => {
    if (modo === "crispr") setCortar(false);
    setPlaying(true);
    bump();
  };

  // pie del visor (lectura en vivo)
  const pie: string =
    modo === "crispr"
      ? cortar
        ? `${resCrispr.titulo}. ${repDef.resultado}`
        : "La ARN guía (sgRNA) se aparea con la secuencia diana junto al PAM (5′-NGG-3′). Pulsa «Cortar con Cas9» para realizar el corte de doble cadena."
      : modo === "transgenico"
        ? transgen.ejemplo
        : clon.ejemplo;

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
  if (modo === "crispr") {
    control = (
      <>
        <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "0 0 8px", textTransform: "uppercase" }}>Mecanismo de reparación tras el corte</div>
        <div className="bi-opts">
          {REPARACIONES.map((r) => {
            const col = `#${r.color.replace("#", "")}`;
            const on = r.id === reparacion;
            return (
              <button key={r.id} className="bi-opt" data-on={on} onClick={() => { setReparacion(r.id); setPlaying(true); bump(); }} style={{ ["--bic" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                <i className={`fa-solid ${r.icono}`} style={{ marginRight: 8, color: on ? col : T.text3 }} />
                {r.etq} · {r.nombre}
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 12 }}>
          <button className="bi-toggle" data-on={cortar} onClick={() => { setCortar((c) => !c); setPlaying(true); }} style={{ ["--bic" as string]: cortar ? "#f87171" : "#34d399" }}>
            <i className={`fa-solid ${cortar ? "fa-rotate-left" : "fa-scissors"}`} style={{ marginRight: 9, color: cortar ? "#fca5a5" : "#34d399" }} />
            {cortar ? "Cas9 ya cortó — reponer la doble cadena" : "Cortar con Cas9 (corte de doble cadena)"}
          </button>
        </div>

        <div style={{ marginTop: 13, padding: "12px 14px", borderRadius: 12, border: `1px solid ${modoCol}55`, background: `${modoCol}12` }}>
          <div style={{ fontSize: 12.5, fontWeight: 900, color: "#fff", marginBottom: 5 }}>
            <i className={`fa-solid ${repDef.icono}`} style={{ color: `#${repDef.color.replace("#", "")}`, marginRight: 8 }} />
            {repDef.nombre} <span style={{ fontSize: 11, color: T.text3, fontWeight: 700 }}>· {repDef.etq}</span>
          </div>
          <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{repDef.descripcion}</div>
          <div style={{ marginTop: 10, fontSize: 11.5, color: "#eaf0fb", lineHeight: 1.5, padding: "9px 11px", borderRadius: 9, background: "rgba(4,10,22,0.4)" }}>
            <i className="fa-solid fa-arrow-right-long" style={{ color: modoCol, marginRight: 7 }} />{repDef.uso}
          </div>
        </div>
      </>
    );
  } else if (modo === "transgenico") {
    control = (
      <>
        <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "0 0 8px", textTransform: "uppercase" }}>Organismo transgénico (ADN recombinante)</div>
        <div className="bi-opts">
          {TRANSGENES.map((tg) => {
            const col = `#${tg.color.replace("#", "")}`;
            const on = tg.id === transgenId;
            return (
              <button key={tg.id} className="bi-opt" data-on={on} onClick={() => { setTransgenId(tg.id); setPlaying(true); bump(); }} style={{ ["--bic" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                <i className={`fa-solid ${tg.icono}`} style={{ marginRight: 8, color: on ? col : T.text3 }} />
                {tg.etq}
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 13, padding: "12px 14px", borderRadius: 12, border: `1px solid ${modoCol}55`, background: `${modoCol}12` }}>
          <div style={{ fontSize: 12.5, fontWeight: 900, color: "#fff", marginBottom: 5 }}>
            <i className={`fa-solid ${transgen.icono}`} style={{ color: modoCol, marginRight: 8 }} />
            {transgen.etq} <span style={{ fontSize: 11, color: T.text3, fontWeight: 700 }}>· {transgen.anio}</span>
          </div>
          <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{transgen.descripcion}</div>
          <div style={{ marginTop: 10, fontSize: 11, color: T.text3, lineHeight: 1.5, display: "grid", gap: 3 }}>
            <span><strong style={{ color: "#eaf0fb" }}>Gen:</strong> {transgen.gen}</span>
            <span><strong style={{ color: "#eaf0fb" }}>Hospedero:</strong> {transgen.hospedero}</span>
            <span><strong style={{ color: "#eaf0fb" }}>Produce:</strong> {transgen.producto}</span>
          </div>
          <div style={{ marginTop: 10, fontSize: 11.5, color: "#eaf0fb", lineHeight: 1.5, padding: "9px 11px", borderRadius: 9, background: "rgba(4,10,22,0.4)" }}>
            <i className="fa-solid fa-flask-vial" style={{ color: modoCol, marginRight: 7 }} />{transgen.ejemplo}
          </div>
        </div>
      </>
    );
  } else {
    control = (
      <>
        <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "0 0 8px", textTransform: "uppercase" }}>Tipo de clonación (transferencia nuclear)</div>
        <div className="bi-opts">
          {CLONES.map((cl) => {
            const col = `#${cl.color.replace("#", "")}`;
            const on = cl.id === clonId;
            return (
              <button key={cl.id} className="bi-opt" data-on={on} onClick={() => { setClonId(cl.id); setPlaying(true); bump(); }} style={{ ["--bic" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                <i className={`fa-solid ${cl.icono}`} style={{ marginRight: 8, color: on ? col : T.text3 }} />
                {cl.etq}
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 13, padding: "12px 14px", borderRadius: 12, border: `1px solid ${modoCol}55`, background: `${modoCol}12` }}>
          <div style={{ fontSize: 12.5, fontWeight: 900, color: "#fff", marginBottom: 5 }}>
            <i className={`fa-solid ${clon.icono}`} style={{ color: modoCol, marginRight: 8 }} />
            Clonación {clon.etq.toLowerCase()}
          </div>
          <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{clon.descripcion}</div>
          <div style={{ marginTop: 10, fontSize: 11.5, color: "#eaf0fb", lineHeight: 1.5, padding: "9px 11px", borderRadius: 9, background: "rgba(4,10,22,0.4)" }}>
            <i className="fa-solid fa-arrow-right-long" style={{ color: modoCol, marginRight: 7 }} />{clon.resultado}
          </div>
        </div>
        {/* edición germinal vs somática (verbatim) */}
        <div style={{ marginTop: 12, padding: "11px 13px", borderRadius: 11, border: "1px solid #f8717155", background: "rgba(248,113,113,0.08)", fontSize: 11.5, color: "#eaf0fb", lineHeight: 1.5 }}>
          <i className="fa-solid fa-triangle-exclamation" style={{ color: "#fca5a5", marginRight: 8 }} />
          {GERMINAL_VS_SOMATICA}
        </div>
      </>
    );
  }

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes biPulse { 0%,100%{ box-shadow:0 0 0 0 var(--bid); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .bi-live-dot { animation: biPulse 1.6s ease-in-out infinite; }
        .bi-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(310px,28vw,410px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .bi-grid { grid-template-columns: 1fr; } }
        .bi-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .bi-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .bi-icobtn:hover { background:rgba(255,255,255,0.12); }
        .bi-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .bi-tab { cursor:pointer; border:1px solid var(--bic); border-radius:12px; padding:11px 8px; text-align:center;
          background:transparent; transition:all .15s; color:#fff; }
        .bi-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.62); }
        .bi-tab:hover { background:rgba(255,255,255,0.06); }
        .bi-opts { display:flex; flex-wrap:wrap; gap:7px; }
        .bi-opt { cursor:pointer; border:1px solid var(--bic); border-radius:10px; padding:9px 12px; font-size:12px;
          font-weight:800; color:#fff; transition:all .15s; }
        .bi-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.66); }
        .bi-opt:hover { background:rgba(255,255,255,0.06); }
        .bi-toggle { width:100%; cursor:pointer; border:1px solid var(--bic); border-radius:11px; padding:11px 14px;
          background:rgba(4,10,22,0.4); color:#fff; font-size:12.5px; font-weight:900; text-align:left; transition:all .15s; }
        .bi-toggle:hover { background:rgba(255,255,255,0.07); }
        @media (max-width: 1000px){ .bi-bottom { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* Selector de modo */}
      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="bi-tabs">
          {MODOS.map((m) => {
            const d = MODOS_DEF[m];
            const col = `#${d.color.replace("#", "")}`;
            const on = m === modo;
            return (
              <button key={m} className="bi-tab" data-on={on} onClick={() => cambiarModo(m)} style={{ ["--bic" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                <div style={{ fontSize: 18, marginBottom: 4, color: on ? col : "inherit" }}><i className={`fa-solid ${d.icono}`} /></div>
                <div style={{ fontSize: 12.5, fontWeight: 900 }}>{d.etq}</div>
                <div style={{ fontSize: 10, color: T.text3, marginTop: 3, lineHeight: 1.25 }}>{d.subtitulo}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bi-grid">
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
              <BiotecnologiaScene
                modo={modo}
                resultadoCrispr={resCrispr}
                reparacion={reparacion}
                cortar={cortar}
                transgen={transgen}
                clon={clon}
                playing={playing}
                accent={accent}
                modoColor={modoCol}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)" }}>
              <span className="bi-live-dot" style={{ ["--bid" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{def.etq.toUpperCase()}</span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              {modo === "crispr" && (
                <button className="bi-icobtn" data-on={cortar} onClick={() => { setCortar((c) => !c); setPlaying(true); }} title={cortar ? "Reponer la doble cadena" : "Cortar con Cas9"}>
                  <i className="fa-solid fa-scissors" />
                </button>
              )}
              <button className="bi-icobtn" data-on={playing} onClick={() => setPlaying((p) => !p)} title={playing ? "Pausar" : "Reanudar"}>
                <i className={`fa-solid ${playing ? "fa-pause" : "fa-play"}`} />
              </button>
              <button className="bi-icobtn" onClick={reiniciar} title="Reiniciar">
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
                {def.fuente === "A5" ? "GLOSARIO A5" : "INFOGRAFÍA A1"}
              </span>
            </div>
            {control}

            {/* Etapas del proceso */}
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "0 0 9px", textTransform: "uppercase" }}>Etapas del proceso</div>
              <div style={{ display: "grid", gap: 8 }}>
                {etapas.map((e, i) => (
                  <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${modoCol}22` }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#04121f", background: modoCol, flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 900, color: "#fff" }}>{e.etq}</div>
                      <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45, marginTop: 2 }}>{e.detalle}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>Biotecnología moderna</div>
            </div>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{DEFINICION}</div>
          </div>

          {/* Ancla A1 — infografía + reflexión */}
          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: "1px solid #7dd3fc55", background: "rgba(125,211,252,0.07)" }}>
            <Eyebrow><i className="fa-solid fa-circle-info" style={{ marginRight: 8, color: "#7dd3fc" }} />Infografía A1 — {TITULO_A1}</Eyebrow>
            <ul style={{ margin: "2px 0 12px", paddingLeft: 16, display: "grid", gap: 8 }}>
              {PUNTOS_CLAVE.map((p, i) => (
                <li key={i} style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.5 }}>{p}</li>
              ))}
            </ul>
            <div style={{ fontSize: 11, fontWeight: 900, color: T.text3, letterSpacing: "0.08em", marginBottom: 8 }}>PARA REFLEXIONAR (DEBATE ÉTICO)</div>
            <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 8 }}>
              {PREGUNTAS.map((q, i) => (
                <li key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>{q}</li>
              ))}
            </ul>
          </div>

          {/* Principios de la bioética */}
          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <Eyebrow><i className="fa-solid fa-scale-balanced" style={{ marginRight: 8, color: accent }} />Principios de la bioética (A1)</Eyebrow>
            <div style={{ display: "grid", gap: 8 }}>
              {PRINCIPIOS_BIOETICA.map((p, i) => (
                <div key={i} style={{ padding: "8px 11px", borderRadius: 9, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                  <span style={{ fontSize: 12, fontWeight: 900, color: accent }}>{p.nombre}. </span>
                  <span style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>{p.definicion}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Casos críticos (debate) */}
          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <Eyebrow><i className="fa-solid fa-gavel" style={{ marginRight: 8, color: accent }} />Casos críticos en México y el mundo (A1)</Eyebrow>
            <div style={{ display: "grid", gap: 10 }}>
              {CASOS_CRITICOS.map((c, i) => (
                <div key={i} style={{ padding: "11px 13px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${accent}25` }}>
                  <div style={{ fontSize: 12.5, fontWeight: 900, color: "#fff", marginBottom: 4 }}>
                    <i className={`fa-solid ${c.icono}`} style={{ color: accent, marginRight: 8 }} />{c.titulo}
                  </div>
                  <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.5 }}>{c.texto}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Datos + línea de tiempo + glosario ─────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="bi-bottom">
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

          {/* Contexto mexicano: LANGEBIO */}
          <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 12, border: `1px solid ${accent}33`, background: `rgba(${color.rgba},0.07)` }}>
            <Eyebrow><i className="fa-solid fa-location-dot" style={{ marginRight: 8, color: accent }} />México: la «zona gris» (LANGEBIO, Irapuato)</Eyebrow>
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

        {/* Línea de tiempo */}
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow><i className="fa-solid fa-timeline" style={{ marginRight: 8, color: accent }} />Línea de tiempo (A1)</Eyebrow>
          <div style={{ display: "grid", gap: 0 }}>
            {HITOS.map((h, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", paddingBottom: i === HITOS.length - 1 ? 0 : 14 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                  <div style={{ width: 11, height: 11, borderRadius: "50%", background: accent, boxShadow: `0 0 10px -1px ${accent}` }} />
                  {i !== HITOS.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 26, background: `${accent}44`, marginTop: 2 }} />}
                </div>
                <div style={{ paddingBottom: 2 }}>
                  <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{h.anio}</div>
                  <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.4 }}>{h.texto}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* nota de honestidad del modelo */}
      <div style={{ marginTop: 16, fontSize: 11.5, color: T.text3, lineHeight: 1.5, display: "flex", gap: 9, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          La infografía A1, las preguntas de reflexión, los principios de bioética, los casos críticos, el glosario A5 (con sus ejemplos) y los hechos de «¿sabías que?» (quizzes A2/A4) son <strong>verbatim</strong> del MCCEMS 2025. El mecanismo de CRISPR-Cas9 (ARN guía, PAM 5′-NGG-3′, corte de Cas9 ~3 pb antes del PAM, reparación NHEJ/HDR), el ADN recombinante y la transferencia nuclear son representaciones <strong>esquemáticas</strong> con biología estándar, no modelos a escala molecular. La dimensión ética se conserva como <strong>debate</strong>, no como mecanismo manipulable. Fuente: {FUENTE}
        </span>
      </div>
    </div>
  );
}
