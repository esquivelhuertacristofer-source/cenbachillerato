"use client";

/**
 * Laboratorio 3D — Cónicas: circunferencia y parábola como lugares geométricos.
 * Práctica experimental para PM-IV-P07-A1 (infografía; progresión 7).
 *
 * El alumno explora, sobre un plano cartesiano flotante, las dos cónicas básicas
 * DEFINIDAS como lugares geométricos:
 *   · CIRCUNFERENCIA: ajusta centro (h, k) y radio r; un punto P recorre la curva
 *     con su radio (= r) y un punto de prueba Q se clasifica dentro / sobre / fuera.
 *   · PARÁBOLA: ajusta p; ve el foco (0, p), la directriz y = −p y un punto P cuya
 *     distancia al foco SIEMPRE es igual a su distancia a la directriz. Opcional:
 *     la propiedad focal (rayos paralelos al eje que convergen en el foco).
 * Todos los valores son exactos.
 */

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import {
  type Modo,
  calcCirc, calcParab, distanciasParab, puntoParab,
  ESCENARIOS_CIRC, ESCENARIOS_PARAB, IDEAS, DATOS,
  H_MIN, H_MAX, K_MIN, K_MAX, R_MIN, R_MAX, C_STEP, H_DEF, K_DEF, R_DEF, QX_DEF, QY_DEF,
  P_MIN, P_MAX, P_STEP, P_DEF, PARAB_HALF,
  fmtNum2, fmtInt, fmtPar, ecCircunferencia, ecParabFoco, ecParabAbierta,
  type EscenarioCirc, type EscenarioParab,
} from "./conicas-data";

const ConicasScene = dynamic(() => import("./ConicasScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-bezier-curve fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Trazando las cónicas…</span>
    </div>
  ),
});

const CENTRO_COL = "#f5d36b";
const RADIO_COL = "#34D399";
const FOCO_COL = "#f5d36b";
const DIR_COL = "#fb7185";
const VERT_COL = "#60a5fa";
const DFOCO_COL = "#34D399";
const DDIR_COL = "#c4b5fd";

export function LabConicas({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("circunferencia");
  // circunferencia
  const [h, setH] = useState(H_DEF);
  const [k, setK] = useState(K_DEF);
  const [r, setR] = useState(R_DEF);
  const [qx, setQx] = useState(QX_DEF);
  const [qy, setQy] = useState(QY_DEF);
  // parábola
  const [p, setP] = useState(P_DEF);
  const [mostrarFocal, setMostrarFocal] = useState(true);
  // común
  const [fase, setFase] = useState(0);
  const [reproduciendo, setReproduciendo] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // animación del punto móvil P (recorre la cónica): fase 0..1 cíclica
  useEffect(() => {
    if (!reproduciendo) return;
    const id = setInterval(() => {
      setFase((f) => (f + 0.008) % 1);
    }, 40);
    return () => clearInterval(id);
  }, [reproduciendo]);

  const c = useMemo(() => calcCirc(h, k, r, qx, qy), [h, k, r, qx, qy]);
  const par = useMemo(() => calcParab(p), [p]);
  // medio-ancho efectivo (mismo cálculo que la escena) y punto P de la parábola
  const halfEff = Math.min(PARAB_HALF, Math.sqrt(4 * p * 7.4));
  const tP = halfEff * Math.sin(fase * Math.PI * 2);
  const Pparab = puntoParab(tP, p);
  const dParab = distanciasParab(tP, p);

  const bump = () => setResetNonce((n) => n + 1);
  const cambiarModo = (m: Modo) => { setModo(m); setFase(0); bump(); };
  const aplicarCirc = (e: EscenarioCirc) => { setH(e.h); setK(e.k); setR(e.r); bump(); };
  const aplicarParab = (e: EscenarioParab) => { setP(e.p); bump(); };
  const reset = () => {
    if (modo === "circunferencia") { setH(H_DEF); setK(K_DEF); setR(R_DEF); setQx(QX_DEF); setQy(QY_DEF); }
    else { setP(P_DEF); }
    setFase(0); bump();
  };

  const esCirc = modo === "circunferencia";
  const liveEq = esCirc ? ecCircunferencia(h, k, r) : ecParabFoco(p);

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-bezier-curve" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Cónicas como lugares geométricos</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la idea sigue: {esCirc
          ? <>la circunferencia <strong>{ecCircunferencia(h, k, r)}</strong> tiene centro {fmtPar(h, k)} y radio {fmtNum2(r)}; el punto Q {fmtPar(qx, qy)} está <strong>{c.estadoQ}</strong>.</>
          : <>la parábola <strong>{ecParabFoco(p)}</strong> tiene foco {fmtPar(0, par.focoY)} y directriz y = {fmtNum2(par.directrizY)}; todo punto suyo equidista del foco y de la directriz.</>}
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes exPulseCon { 0%,100%{ box-shadow:0 0 0 0 var(--exc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .ex-live-dot { animation: exPulseCon 1.6s ease-in-out infinite; }
        .ex-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(300px,26vw,380px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .ex-grid { grid-template-columns: 1fr; } }
        .ex-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .ex-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .ex-icobtn:hover { background:rgba(255,255,255,0.12); }
        .ex-range { -webkit-appearance:none; appearance:none; width:100%; height:6px; border-radius:999px; outline:none;
          background:linear-gradient(90deg, var(--exc) 0%, var(--exc) var(--exfill), rgba(255,255,255,0.12) var(--exfill), rgba(255,255,255,0.12) 100%); }
        .ex-range::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:20px; height:20px; border-radius:50%;
          background:#fff; border:3px solid var(--exc); cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.4); }
        .ex-range::-moz-range-thumb { width:20px; height:20px; border-radius:50%; background:#fff; border:3px solid var(--exc); cursor:pointer; }
        .ex-chip { cursor:pointer; padding:8px 12px; border-radius:12px; border:1px solid ${T.line}; background:${T.inset};
          color:${T.text2}; font-size:12px; font-weight:800; transition:all .15s; text-align:left; }
        .ex-chip:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
        .ex-chip[data-on="true"] { border-color:rgba(${color.rgba},0.7); background:rgba(${color.rgba},0.18); color:#fff; }
        .ex-modo { cursor:pointer; flex:1; padding:11px 12px; border-radius:13px; border:1px solid ${T.line};
          background:${T.inset}; color:${T.text2}; font-size:13px; font-weight:900; transition:all .15s; display:flex;
          align-items:center; justify-content:center; gap:8px; }
        .ex-modo[data-on="true"] { border-color:rgba(${color.rgba},0.8); background:rgba(${color.rgba},0.2); color:#fff; }
        .ex-tog { cursor:pointer; display:flex; align-items:center; gap:8px; padding:9px 12px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.inset}; color:${T.text2}; font-size:12px; font-weight:800; transition:all .15s; }
        @media (max-width: 1000px){ .ex-bottom { grid-template-columns: 1fr !important; } }
      `}</style>

      <div className="ex-grid">
        {/* ── Columna visor ──────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              position: "relative",
              height: "clamp(440px, 62vh, 720px)",
              borderRadius: 20,
              overflow: "hidden",
              border: `1px solid rgba(${color.rgba},0.22)`,
              background: `radial-gradient(120% 80% at 30% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#0b2233 0%,#08131f 100%)`,
              boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}`,
            }}
          >
            <SceneBoundary fallback={sceneFallback}>
              <ConicasScene
                modo={modo}
                h={h} k={k} r={r} qx={qx} qy={qy}
                p={p}
                fase={fase}
                mostrarFocal={mostrarFocal}
                accent={accent}
                autoRotate={autoRotate}
                pausado={false}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{liveEq}</span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ex-icobtn" data-on={reproduciendo} onClick={() => setReproduciendo((v) => !v)} title={reproduciendo ? "Pausar el punto móvil" : "Animar el punto P"}>
                <i className={`fa-solid ${reproduciendo ? "fa-pause" : "fa-play"}`} />
              </button>
              <button className="ex-icobtn" data-on={autoRotate} onClick={() => setAutoRotate((v) => !v)} title="Girar la cámara">
                <i className="fa-solid fa-arrows-rotate" />
              </button>
              <button className="ex-icobtn" onClick={reset} title="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Pie: lectura en vivo del lugar geométrico */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              {esCirc ? (
                <>
                  <div style={{ fontSize: 13, color: "#eaf0fb", fontWeight: 800, fontFamily: "ui-monospace, monospace" }}>
                    <i className="fa-solid fa-ruler-combined" style={{ color: RADIO_COL, marginRight: 7 }} />
                    todo punto de la curva está a distancia r = <span style={{ color: RADIO_COL }}>{fmtNum2(r)}</span> del centro {fmtPar(h, k)}
                  </div>
                  <div style={{ fontSize: 12.5, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>
                    Q {fmtPar(qx, qy)}: dist al centro = <strong>{fmtNum2(c.distQ)}</strong> {c.distQ < r ? "<" : c.distQ > r ? ">" : "="} r = {fmtNum2(r)} → <strong style={{ color: c.estadoQ === "dentro" ? RADIO_COL : c.estadoQ === "sobre" ? "#fbbf24" : DIR_COL }}>{c.estadoQ}</strong>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 13, color: "#eaf0fb", fontWeight: 800, fontFamily: "ui-monospace, monospace" }}>
                    d(P, foco) = <span style={{ color: DFOCO_COL }}>{fmtNum2(dParab.aFoco)}</span> = d(P, directriz) = <span style={{ color: DDIR_COL }}>{fmtNum2(dParab.aDirectriz)}</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>
                    <i className="fa-solid fa-bullseye" style={{ color: FOCO_COL, marginRight: 6 }} />
                    P {fmtPar(Pparab[0]!, Pparab[1]!)} sobre la parábola · foco {fmtPar(0, par.focoY)} · directriz y = {fmtNum2(par.directrizY)}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Selector de modo */}
          <div style={{ display: "flex", gap: 10 }}>
            <button className="ex-modo" data-on={esCirc} onClick={() => cambiarModo("circunferencia")}>
              <i className="fa-solid fa-circle-dot" style={{ color: esCirc ? accent : T.text3 }} /> Circunferencia
            </button>
            <button className="ex-modo" data-on={!esCirc} onClick={() => cambiarModo("parabola")}>
              <i className="fa-solid fa-bullseye" style={{ color: !esCirc ? accent : T.text3 }} /> Parábola
            </button>
          </div>

          {/* Controles */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: accent }} />
              {esCirc ? "Ajusta la circunferencia y el punto de prueba" : "Ajusta la parábola"}
            </Eyebrow>

            {esCirc ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                  <Deslizador label="Centro h" icon="fa-arrows-left-right" colr={CENTRO_COL}
                    valor={fmtInt(h)} min={H_MIN} max={H_MAX} step={C_STEP} value={h} onChange={setH} hintL={`${H_MIN}`} hintR={`${H_MAX}`} />
                  <Deslizador label="Centro k" icon="fa-arrows-up-down" colr={CENTRO_COL}
                    valor={fmtInt(k)} min={K_MIN} max={K_MAX} step={C_STEP} value={k} onChange={setK} hintL={`${K_MIN}`} hintR={`${K_MAX}`} />
                  <Deslizador label="Radio r" icon="fa-ruler" colr={RADIO_COL}
                    valor={fmtInt(r)} min={R_MIN} max={R_MAX} step={C_STEP} value={r} onChange={setR} hintL={`${R_MIN}`} hintR={`${R_MAX}`} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px" }}>PUNTO DE PRUEBA Q</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Deslizador label="Q · x" icon="fa-arrows-left-right" colr="#fbbf24"
                    valor={fmtInt(qx)} min={H_MIN} max={H_MAX} step={C_STEP} value={qx} onChange={setQx} hintL={`${H_MIN}`} hintR={`${H_MAX}`} />
                  <Deslizador label="Q · y" icon="fa-arrows-up-down" colr="#fbbf24"
                    valor={fmtInt(qy)} min={K_MIN} max={K_MAX} step={C_STEP} value={qy} onChange={setQy} hintL={`${K_MIN}`} hintR={`${K_MAX}`} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px" }}>EJEMPLOS</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {ESCENARIOS_CIRC.map((e) => (
                    <button key={e.label} className="ex-chip" title={e.desc}
                      data-on={h === e.h && k === e.k && r === e.r}
                      onClick={() => aplicarCirc(e)} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <i className={`fa-solid ${e.icono}`} style={{ color: accent }} /> {e.label}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                  <Deslizador label="Parámetro p (vértice → foco)" icon="fa-up-down" colr={FOCO_COL}
                    valor={fmtNum2(p)} min={P_MIN} max={P_MAX} step={P_STEP} value={p} onChange={setP} hintL={`${P_MIN}`} hintR={`${P_MAX}`} />
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
                  <button className="ex-tog" onClick={() => setMostrarFocal((v) => !v)} style={{ borderColor: mostrarFocal ? "#7dd3fc88" : T.line, background: mostrarFocal ? "#7dd3fc1a" : T.inset, color: mostrarFocal ? "#fff" : T.text2 }}>
                    <i className={`fa-solid ${mostrarFocal ? "fa-eye" : "fa-eye-slash"}`} style={{ color: "#7dd3fc" }} /> Propiedad focal (rayos)
                  </button>
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px" }}>EJEMPLOS</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {ESCENARIOS_PARAB.map((e) => (
                    <button key={e.label} className="ex-chip" title={e.desc}
                      data-on={p === e.p}
                      onClick={() => aplicarParab(e)} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <i className={`fa-solid ${e.icono}`} style={{ color: accent }} /> {e.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* El cálculo paso a paso */}
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${accent}55`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: accent }}>
                <i className={`fa-solid ${esCirc ? "fa-circle-dot" : "fa-bullseye"}`} />
              </div>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>{esCirc ? "La circunferencia, paso a paso" : "La parábola, paso a paso"}</div>
                <div style={{ fontSize: 11.5, color: accent, fontWeight: 800 }}>Lugar geométrico</div>
              </div>
            </div>
            <div style={{ display: "grid", gap: 9 }}>
              {esCirc ? (
                <>
                  <PasoRow n={1} texto="Identifico centro (h, k) y radio r:" valor={`C = ${fmtPar(h, k)},  r = ${fmtNum2(r)}`} col={CENTRO_COL} />
                  <PasoRow n={2} texto="Escribo la ecuación canónica:" valor={ecCircunferencia(h, k, r)} col={accent} />
                  <PasoRow n={3} texto="Distancia del punto Q al centro:" valor={`√((${fmtInt(qx)}−${fmtInt(h)})² + (${fmtInt(qy)}−${fmtInt(k)})²) = ${fmtNum2(c.distQ)}`} col="#fbbf24" />
                  <PasoRow n={4} texto={`Comparo con r = ${fmtNum2(r)}:`} valor={`${fmtNum2(c.distQ)} ${c.distQ < r ? "<" : c.distQ > r ? ">" : "="} ${fmtNum2(r)} → ${c.estadoQ}`} col={c.estadoQ === "dentro" ? RADIO_COL : c.estadoQ === "sobre" ? "#fbbf24" : DIR_COL} />
                </>
              ) : (
                <>
                  <PasoRow n={1} texto="Identifico el parámetro p (vértice → foco):" valor={`p = ${fmtNum2(p)}`} col={FOCO_COL} />
                  <PasoRow n={2} texto="Ecuación canónica (vértice en el origen):" valor={`${ecParabFoco(p)}   ·   ${ecParabAbierta(p)}`} col={accent} />
                  <PasoRow n={3} texto="Ubico foco y directriz:" valor={`F = ${fmtPar(0, par.focoY)},  directriz y = ${fmtNum2(par.directrizY)}`} col={VERT_COL} />
                  <PasoRow n={4} texto="Compruebo la definición en P:" valor={`d(P,F) = ${fmtNum2(dParab.aFoco)} = d(P, directriz) = ${fmtNum2(dParab.aDirectriz)}`} col={DFOCO_COL} />
                </>
              )}
            </div>
          </div>

          {/* Anatomía */}
          <div style={{ ...card, padding: "20px 22px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-vector-square" style={{ marginRight: 8, color: accent }} />
              Anatomía
            </Eyebrow>
            <div style={{ display: "grid", gap: 9 }}>
              {esCirc ? (
                <>
                  <LadoRow label="Centro (h, k)" valor={fmtPar(h, k)} col={CENTRO_COL} icon="fa-crosshairs" />
                  <LadoRow label="Radio r" valor={fmtNum2(r)} col={RADIO_COL} icon="fa-ruler" />
                  <LadoRow label="Perímetro 2πr" valor={fmtNum2(c.perimetro)} col="#fbbf24" icon="fa-circle-notch" />
                  <LadoRow label="Área πr²" valor={fmtNum2(c.area)} col="#c4b5fd" icon="fa-circle" />
                </>
              ) : (
                <>
                  <LadoRow label="Vértice" valor="(0, 0)" col={VERT_COL} icon="fa-location-dot" />
                  <LadoRow label="Foco (0, p)" valor={fmtPar(0, par.focoY)} col={FOCO_COL} icon="fa-bullseye" />
                  <LadoRow label="Directriz" valor={`y = ${fmtNum2(par.directrizY)}`} col={DIR_COL} icon="fa-ruler-horizontal" />
                  <LadoRow label="Coeficiente a = 1/4p" valor={ecParabAbierta(p).replace("y = ", "").replace(" x²", "")} col="#c4b5fd" icon="fa-superscript" />
                </>
              )}
            </div>
            <div style={{ fontSize: 11.8, color: T.text2, lineHeight: 1.5, marginTop: 11 }}>
              {esCirc
                ? <>La circunferencia es el <strong style={{ color: RADIO_COL }}>lugar geométrico</strong> de los puntos que están a la <strong>misma distancia</strong> (el radio) de un centro fijo.</>
                : <>La parábola es el <strong style={{ color: DFOCO_COL }}>lugar geométrico</strong> de los puntos que <strong>equidistan</strong> del foco y de la directriz. Esa igualdad <em>es</em> la definición.</>}
            </div>
          </div>

          {/* Aplicación real */}
          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: `1px solid ${accent}40`, background: `rgba(${color.rgba},0.08)` }}>
            <Eyebrow>
              <i className="fa-solid fa-satellite-dish" style={{ marginRight: 8, color: accent }} />
              {esCirc ? "Por qué importa" : "Propiedad focal"}
            </Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>
              {esCirc
                ? <>La circunferencia aparece en ruedas, rotondas, fuentes y plazas circulares. Saber su centro y radio permite ubicar un punto de interés <strong>dentro, sobre o fuera</strong> de ella — base de mapas y diseño urbano.</>
                : <>Todo rayo paralelo al eje se refleja exactamente hacia el <strong style={{ color: FOCO_COL }}>foco</strong>. Por eso el <strong>GTM del INAOE</strong> (reflector parabólico de 50 m) y las antenas satelitales domésticas concentran la señal en el receptor, colocado justo en el foco.</>}
            </div>
          </div>
        </div>
      </div>

      {/* ── Lecturas + ideas clave ─────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="ex-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-gauge-high" style={{ marginRight: 8, color: accent }} />
            Lecturas
          </Eyebrow>
          {esCirc ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <Readout label="centro (h,k)" value={fmtPar(h, k)} col={CENTRO_COL} size={15} />
              <Readout label="radio r" value={fmtNum2(r)} col={RADIO_COL} size={18} />
              <Readout label="dist Q→centro" value={fmtNum2(c.distQ)} col="#fbbf24" size={18} />
              <Readout label="Q está" value={c.estadoQ} col={c.estadoQ === "dentro" ? RADIO_COL : c.estadoQ === "sobre" ? "#fbbf24" : DIR_COL} size={15} />
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <Readout label="foco (0,p)" value={fmtPar(0, par.focoY)} col={FOCO_COL} size={15} />
              <Readout label="directriz" value={`y=${fmtNum2(par.directrizY)}`} col={DIR_COL} size={15} />
              <Readout label="d(P,foco)" value={fmtNum2(dParab.aFoco)} col={DFOCO_COL} size={18} />
              <Readout label="d(P,directriz)" value={fmtNum2(dParab.aDirectriz)} col={DDIR_COL} size={18} />
            </div>
          )}
          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {DATOS.map((dd, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", borderRadius: 10, background: T.glass, border: `1px solid ${T.line}` }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: accent, background: `rgba(${color.rgba},0.16)`, flexShrink: 0 }}>
                  <i className={`fa-solid ${dd.icono}`} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{dd.valor}</div>
                  <div style={{ fontSize: 11, color: T.text2, lineHeight: 1.4 }}>{dd.texto}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-lightbulb" style={{ marginRight: 8, color: accent }} />
            Ideas clave
          </Eyebrow>
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
          Cálculo <strong>exacto</strong>: la circunferencia es (x−h)²+(y−k)²=r² y la clasificación de Q sale de comparar su distancia al centro con r; la parábola es x²=4py con foco (0, p) y directriz y=−p, y la igualdad d(P,foco)=d(P,directriz) se cumple para cada punto. El plano se dibuja a <strong>escala fija</strong>, así que las posiciones son reales; los <strong>valores numéricos</strong> de las etiquetas y lecturas son los exactos.
        </span>
      </div>
    </div>
  );
}

/* ── Fila de un paso del cálculo ─────────────────────────────────────────── */
function PasoRow({ n, texto, valor, col }: { n: number; texto: string; valor: string; col: string }) {
  return (
    <div style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${col}30` }}>
      <div style={{ width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#04121f", background: col, flexShrink: 0 }}>{n}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.35 }}>{texto}</div>
        <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", marginTop: 2 }}>{valor}</div>
      </div>
    </div>
  );
}

/* ── Fila de un dato de la anatomía ──────────────────────────────────────── */
function LadoRow({ label, valor, col, icon }: { label: string; valor: string; col: string; icon: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 13px", borderRadius: 11, background: "rgba(4,10,22,0.45)", border: `1px solid ${col}33` }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: col, background: `${col}1e`, flexShrink: 0 }}>
        <i className={`fa-solid ${icon}`} />
      </div>
      <span style={{ fontSize: 12.5, fontWeight: 800, color: T.text2 }}>{label}</span>
      <span style={{ marginLeft: "auto", fontSize: 15, fontWeight: 900, color: col, fontFamily: "ui-monospace, monospace" }}>{valor}</span>
    </div>
  );
}

/* ── Deslizador reutilizable ─────────────────────────────────────────────── */
function Deslizador({ label, icon, colr, valor, min, max, step, value, onChange, hintL, hintR }: {
  label: string; icon: string; colr: string; valor: string;
  min: number; max: number; step: number; value: number; onChange: (v: number) => void;
  hintL?: string; hintR?: string;
}) {
  const fill = `${((Math.min(max, Math.max(min, value)) - min) / (max - min)) * 100}%`;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: colr }}>
          <i className={`fa-solid ${icon}`} style={{ marginRight: 6 }} />
          {label}
        </span>
        <span style={{ fontSize: 14, fontWeight: 900, color: colr, fontFamily: "ui-monospace, monospace" }}>{valor}</span>
      </div>
      <input type="range" className="ex-range" min={min} max={max} step={step} value={Math.min(max, Math.max(min, value))}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ["--exc" as string]: colr, ["--exfill" as string]: fill }} />
      {(hintL || hintR) && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
          <span>{hintL}</span>
          <span>{hintR}</span>
        </div>
      )}
    </div>
  );
}
