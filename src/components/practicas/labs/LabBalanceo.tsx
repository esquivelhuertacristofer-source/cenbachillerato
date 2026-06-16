"use client";

/**
 * Laboratorio 3D — Balanceo de ecuaciones químicas.
 * Práctica experimental para CNEYT-IV-P01-A2 (ejercicio_matematico "Balancea:
 * ejercicio paso a paso con ecuaciones reales"; UAC "Reacciones químicas",
 * progresión 1: Ley de conservación de la masa).
 *
 * El alumno ajusta los COEFICIENTES de cada fórmula (nunca los subíndices) y ve
 * en 3D aparecer/desaparecer copias enteras de cada molécula. Los contadores de
 * átomos por elemento (izquierda vs derecha) se igualan y la flecha se pone
 * verde cuando la ecuación queda balanceada: misma cantidad de cada átomo →
 * la masa se conserva. Las tres ecuaciones son EXACTAMENTE las de la actividad.
 * Conteo y masas: cálculo exacto.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import {
  REACCIONES_BAL, MOLS_B, ELEMS_B, calcBalance, ecuacion, IDEAS, DATOS,
  fmtMasa, fmtInt, COEF_MIN, COEF_MAX, REACCION_DEF,
} from "./balanceo-data";
import { FichaTeorica } from "./_ficha";
import { BALANCEO_FICHA } from "./balanceo-ecuaciones-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { RETO_A2 } from "./balanceo-ecuaciones-data";
import { LabSfx } from "./lab-audio";

const BalanceoScene = dynamic(() => import("./BalanceoScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-flask-vial fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Montando las moléculas…</span>
    </div>
  ),
});

const OK_COL = "#34D399";
const NO_COL = "#FB923C";

const unos = (n: number) => Array.from({ length: n }, () => 1);

export function LabBalanceo({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [idx, setIdx] = useState(REACCION_DEF);
  const r = REACCIONES_BAL[idx]!;

  const [coefR, setCoefR] = useState<number[]>(() => unos(REACCIONES_BAL[REACCION_DEF]!.reactivos.length));
  const [coefP, setCoefP] = useState<number[]>(() => unos(REACCIONES_BAL[REACCION_DEF]!.productos.length));
  const [resolviendo, setResolviendo] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // reto evaluable, teoría (cajón deslizable) y sonido
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  const [drawer, setDrawer] = useState(false);
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
  const bal = useMemo(() => calcBalance(r, coefR, coefP), [r, coefR, coefP]);

  // Cambiar de reacción: reinicia coeficientes a 1 (el reto auténtico parte
  // desbalanceado) y detiene cualquier animación.
  const elegirReaccion = (i: number) => {
    if (sonido) audioRef.current?.blip();
    setResolviendo(false);
    setIdx(i);
    setCoefR(unos(REACCIONES_BAL[i]!.reactivos.length));
    setCoefP(unos(REACCIONES_BAL[i]!.productos.length));
    bump();
  };

  const reiniciar = () => {
    setResolviendo(false);
    setCoefR(unos(r.reactivos.length));
    setCoefP(unos(r.productos.length));
    bump();
  };

  const resolver = () => {
    if (bal.balanceada && bal.minima) return;
    setResolviendo(true);
  };

  // Animación "Resolver": cada tick acerca un paso cada coeficiente a su valor
  // de la solución (método de tanteo visto en cámara lenta). setInterval dentro
  // de useEffect es seguro con React Compiler (no es render ni useFrame).
  useEffect(() => {
    if (!resolviendo) return;
    const id = setInterval(() => {
      let listo = true;
      setCoefR((prev) => prev.map((c, i) => {
        const meta = r.solR[i] ?? c;
        if (c === meta) return c;
        listo = false;
        return c < meta ? c + 1 : c - 1;
      }));
      setCoefP((prev) => prev.map((c, i) => {
        const meta = r.solP[i] ?? c;
        if (c === meta) return c;
        listo = false;
        return c < meta ? c + 1 : c - 1;
      }));
      if (listo) setResolviendo(false);
    }, 440);
    return () => clearInterval(id);
  }, [resolviendo, r]);

  const setCoef = (lado: "R" | "P", i: number, delta: number) => {
    setResolviendo(false);
    const clamp = (v: number) => Math.max(COEF_MIN, Math.min(COEF_MAX, v));
    if (lado === "R") setCoefR((prev) => prev.map((c, j) => (j === i ? clamp(c + delta) : c)));
    else setCoefP((prev) => prev.map((c, j) => (j === i ? clamp(c + delta) : c)));
  };

  const estadoCol = bal.balanceada ? OK_COL : NO_COL;
  const estadoTxt = bal.balanceada
    ? (bal.minima ? "¡Balanceada! (mínima expresión)" : "Balanceada (se puede simplificar)")
    : "Aún desbalanceada";

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-flask-vial" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Balancea la ecuación</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la idea sigue: {ecuacion(r, coefR, coefP)} — {estadoTxt.toLowerCase()}.
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes exPulseBal { 0%,100%{ box-shadow:0 0 0 0 var(--exc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .ex-live-dot { animation: exPulseBal 1.6s ease-in-out infinite; }
        .ex-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(300px,26vw,380px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .ex-grid { grid-template-columns: 1fr; } }
        .ex-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .ex-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .ex-icobtn:hover { background:rgba(255,255,255,0.12); }
        .ex-chip { cursor:pointer; padding:8px 12px; border-radius:12px; border:1px solid ${T.line}; background:${T.inset};
          color:${T.text2}; font-size:12px; font-weight:800; transition:all .15s; text-align:left; }
        .ex-chip:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
        .ex-chip[data-on="true"] { border-color:rgba(${color.rgba},0.7); background:rgba(${color.rgba},0.18); color:#fff; }
        .ex-step { cursor:pointer; width:30px; height:30px; border-radius:8px; border:1px solid ${T.line}; background:${T.inset};
          color:#fff; font-size:14px; font-weight:900; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .ex-step:hover:not(:disabled) { border-color:rgba(${color.rgba},0.6); background:rgba(${color.rgba},0.18); }
        .ex-step:disabled { opacity:0.32; cursor:not-allowed; }
        .ex-solve { cursor:pointer; flex:1; padding:11px 14px; border-radius:11px; border:none; font-size:13px; font-weight:900;
          display:flex; align-items:center; justify-content:center; gap:8px; transition:all .15s; }
        .ex-ghost { cursor:pointer; padding:11px 14px; border-radius:11px; border:1px solid ${T.line}; background:${T.inset};
          color:${T.text2}; font-size:13px; font-weight:900; display:flex; align-items:center; justify-content:center; gap:8px; transition:all .15s; }
        .ex-ghost:hover { border-color:rgba(255,255,255,0.3); color:#fff; }
        @media (max-width: 1000px){ .ex-bottom { grid-template-columns: 1fr !important; } }

        /* Cajón de teoría */
        .ex-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .ex-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .ex-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .ex-drawer[data-open="true"] { transform:translateX(0); }
        .ex-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .ex-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .ex-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .ex-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .ex-teoria-fab { position:absolute; bottom:16px; left:50%; transform:translateX(-50%); cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .ex-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateX(-50%) translateY(-1px); }
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
              <BalanceoScene
                reaccionKey={r.key}
                reactivos={r.reactivos}
                productos={r.productos}
                coefReact={coefR}
                coefProd={coefP}
                balanceada={bal.balanceada}
                accent={accent}
                autoRotate={autoRotate}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{ecuacion(r, coefR, coefP)}</span>
            </div>

            {/* Badge de estado */}
            <div style={{ position: "absolute", top: 58, left: 16, display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${estadoCol}88`, backdropFilter: "blur(10px)" }}>
              <i className={`fa-solid ${bal.balanceada ? "fa-circle-check" : "fa-triangle-exclamation"}`} style={{ color: estadoCol, fontSize: 12 }} />
              <span style={{ fontSize: 11.5, fontWeight: 900, color: estadoCol }}>{estadoTxt}</span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ex-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="ex-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="ex-icobtn" data-on={resolviendo} onClick={resolver} title="Resolver paso a paso">
                <i className={`fa-solid ${resolviendo ? "fa-spinner fa-spin" : "fa-wand-magic-sparkles"}`} />
              </button>
              <button className="ex-icobtn" data-on={autoRotate} onClick={() => setAutoRotate((vv) => !vv)} title="Girar la cámara">
                <i className="fa-solid fa-arrows-rotate" />
              </button>
              <button className="ex-icobtn" onClick={reiniciar} title="Reiniciar (todos a 1)">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Botón flotante de Teoría */}
            <button className="ex-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>

            {/* Pie: lectura en vivo */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                <i className="fa-solid fa-scale-balanced" style={{ color: estadoCol, marginRight: 7 }} />
                Átomos: <strong style={{ color: estadoCol }}>{fmtInt(bal.totalAtomosIzq)}</strong> a la izquierda · <strong style={{ color: estadoCol }}>{fmtInt(bal.totalAtomosDer)}</strong> a la derecha
              </div>
              <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>
                {bal.filas.map((f) => (
                  <span key={f.el} style={{ marginRight: 14, whiteSpace: "nowrap" }}>
                    <span style={{ display: "inline-block", width: 9, height: 9, borderRadius: "50%", background: ELEMS_B[f.el].color, marginRight: 5, verticalAlign: "middle", border: "1px solid rgba(255,255,255,0.3)" }} />
                    {f.el}: {fmtInt(f.izq)}/{fmtInt(f.der)} <i className={`fa-solid ${f.ok ? "fa-check" : "fa-xmark"}`} style={{ color: f.ok ? OK_COL : NO_COL, fontSize: 10 }} />
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Controles: coeficientes */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: accent }} />
              Ajusta los coeficientes (los subíndices NO se tocan)
            </Eyebrow>

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
              {r.reactivos.map((s, i) => (
                <Stepper key={`R${i}`} formula={MOLS_B[s.mol]!.formula} nombre={MOLS_B[s.mol]!.nombre}
                  valor={coefR[i] ?? 1} accent={accent}
                  onMinus={() => setCoef("R", i, -1)} onPlus={() => setCoef("R", i, +1)}
                  sep={i < r.reactivos.length - 1} />
              ))}
              <span style={{ fontSize: 22, fontWeight: 900, color: estadoCol, margin: "0 4px" }}>→</span>
              {r.productos.map((s, i) => (
                <Stepper key={`P${i}`} formula={MOLS_B[s.mol]!.formula} nombre={MOLS_B[s.mol]!.nombre}
                  valor={coefP[i] ?? 1} accent={accent}
                  onMinus={() => setCoef("P", i, -1)} onPlus={() => setCoef("P", i, +1)}
                  sep={i < r.productos.length - 1} />
              ))}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button className="ex-solve" onClick={resolver} disabled={bal.balanceada && bal.minima}
                style={{ background: (bal.balanceada && bal.minima) ? "rgba(255,255,255,0.06)" : accent, color: (bal.balanceada && bal.minima) ? T.text3 : "#04121f", cursor: (bal.balanceada && bal.minima) ? "default" : "pointer" }}>
                <i className={`fa-solid ${resolviendo ? "fa-spinner fa-spin" : "fa-wand-magic-sparkles"}`} />
                {bal.balanceada && bal.minima ? "Ya está balanceada" : resolviendo ? "Balanceando…" : "Resolver paso a paso"}
              </button>
              <button className="ex-ghost" onClick={reiniciar}>
                <i className="fa-solid fa-rotate-left" /> Reiniciar a 1
              </button>
            </div>

            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: T.text3, margin: "18px 0 8px" }}>REACCIONES REALES</div>
            <div style={{ display: "grid", gap: 8 }}>
              {REACCIONES_BAL.map((rr, i) => (
                <button key={rr.key} className="ex-chip" data-on={i === idx} onClick={() => elegirReaccion(i)}
                  style={{ display: "flex", alignItems: "flex-start", gap: 9, lineHeight: 1.4 }}>
                  <i className="fa-solid fa-vial" style={{ color: accent, marginTop: 2 }} />
                  <span>
                    <span style={{ color: "#fff", fontWeight: 900 }}>{rr.nombre}</span>
                    <span style={{ display: "block", fontSize: 11, color: T.text2, fontWeight: 600 }}>{rr.contexto}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Tabla de balance por elemento */}
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${estadoCol}55`, background: bal.balanceada ? "rgba(16,52,38,0.4)" : `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: estadoCol }}>
                <i className="fa-solid fa-scale-balanced" />
              </div>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>Átomos de cada elemento</div>
                <div style={{ fontSize: 11.5, color: estadoCol, fontWeight: 800 }}>{estadoTxt}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: "0 12px", alignItems: "center", fontSize: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: T.text3, letterSpacing: "0.08em" }}>ELEMENTO</div>
              <div style={{ fontSize: 10, fontWeight: 800, color: T.text3, textAlign: "center" }}>IZQ</div>
              <div style={{ fontSize: 10, fontWeight: 800, color: T.text3, textAlign: "center" }}>DER</div>
              <div style={{ width: 18 }} />
              {bal.filas.map((f) => (
                <FilaBalance key={f.el} el={f.el} izq={f.izq} der={f.der} ok={f.ok} />
              ))}
            </div>

            <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.5, marginTop: 13, paddingTop: 13, borderTop: `1px solid ${T.line}` }}>
              {bal.balanceada
                ? <>Cada elemento tiene <strong style={{ color: OK_COL }}>el mismo número de átomos</strong> a ambos lados: la ecuación está balanceada y la <strong>masa se conserva</strong>.{!bal.minima && " (Los coeficientes se pueden dividir entre un factor común para llegar a la mínima expresión.)"}</>
                : <>Sube o baja los coeficientes hasta que <strong style={{ color: NO_COL }}>cada fila tenga el mismo número</strong> en IZQ y DER.</>}
            </div>
          </div>

          {/* Conservación de la masa */}
          <div style={{ ...card, padding: "20px 22px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-equals" style={{ marginRight: 8, color: accent }} />
              Conservación de la masa
            </Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "center" }}>
              <div style={{ textAlign: "center", padding: "12px 8px", borderRadius: 11, background: "rgba(4,10,22,0.45)", border: `1px solid ${T.line}` }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: T.text3, letterSpacing: "0.06em" }}>REACTIVOS</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", marginTop: 5 }}>{fmtMasa(bal.masaIzq)}</div>
              </div>
              <i className={`fa-solid ${bal.balanceada ? "fa-equals" : "fa-not-equal"}`} style={{ fontSize: 18, color: estadoCol }} />
              <div style={{ textAlign: "center", padding: "12px 8px", borderRadius: 11, background: "rgba(4,10,22,0.45)", border: `1px solid ${T.line}` }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: T.text3, letterSpacing: "0.06em" }}>PRODUCTOS</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", marginTop: 5 }}>{fmtMasa(bal.masaDer)}</div>
              </div>
            </div>
            <div style={{ fontSize: 11.8, color: T.text2, lineHeight: 1.5, marginTop: 12 }}>
              {bal.balanceada
                ? <>La masa total <strong style={{ color: OK_COL }}>coincide</strong>: lo que entra como reactivos sale como productos (Lavoisier).</>
                : <>Mientras no esté balanceada, las masas <strong style={{ color: NO_COL }}>no cuadran</strong> porque faltan o sobran átomos de un lado.</>}
            </div>
          </div>

          {/* Cómo balancear esta reacción */}
          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: `1px solid ${accent}40`, background: `rgba(${color.rgba},0.08)` }}>
            <Eyebrow>
              <i className="fa-solid fa-lightbulb" style={{ marginRight: 8, color: accent }} />
              Pista: cómo balancear esta
            </Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{r.descripcion}</div>
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            <Readout label="átomos izq" value={fmtInt(bal.totalAtomosIzq)} col={accent} size={18} />
            <Readout label="átomos der" value={fmtInt(bal.totalAtomosDer)} col={bal.balanceada ? OK_COL : NO_COL} size={18} />
            <Readout label="moléculas" value={`${fmtInt(bal.nMolIzq)} → ${fmtInt(bal.nMolDer)}`} col="#bfe8ff" size={15} />
            <Readout label="estado" value={bal.balanceada ? "✓" : "✗"} col={bal.balanceada ? OK_COL : NO_COL} size={18} />
          </div>
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

      {/* ── Objetivos ──────────────────────────────────────────────────────── */}
      <div style={{ ...card, padding: "18px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
          Objetivos
        </Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
          {[
            { txt: "Balancea la ecuación de H₂ + O₂ → H₂O", done: bal.balanceada && idx === 0 },
            { txt: "Balancea la combustión CH₄ + O₂ → CO₂ + H₂O", done: bal.balanceada && idx === 1 },
            { txt: "Balancea la herrumbre Fe + O₂ → Fe₂O₃", done: bal.balanceada && idx === 2 },
            { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
          ].map((o, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: o.done ? "#34D399" : T.text2 }}>
              <i className={`fa-solid ${o.done ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 15, opacity: o.done ? 1 : 0.3 }} />
              <span style={{ fontWeight: o.done ? 700 : 500 }}>{o.txt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* nota de honestidad del modelo */}
      <div style={{ marginTop: 16, fontSize: 11.5, color: T.text3, lineHeight: 1.5, display: "flex", gap: 9, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          Conteo de átomos y masas: <strong>cálculo exacto</strong> a partir de las fórmulas y masas atómicas (u). Las moléculas se dibujan como modelos de <strong>bolas y barras a escala fija</strong> (las geometrías son representaciones didácticas, no las distancias de enlace reales), pero el número de átomos, la condición de balance y la igualdad de masas son siempre los valores exactos.
        </span>
      </div>

      {/* ── Reto evaluable: el ejercicio verbatim del ancla A2 ────────── */}
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

      {/* ── Cajón de teoría ──────────────────────────────────────────── */}
      <div className="ex-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="ex-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="ex-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="ex-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="ex-drawer-body">
          <FichaTeorica data={BALANCEO_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}

/* ── Selector de coeficiente (−/valor/+) por especie ─────────────────────── */
function Stepper({ formula, nombre, valor, accent, onMinus, onPlus, sep }: {
  formula: string; nombre: string; valor: number; accent: string;
  onMinus: () => void; onPlus: () => void; sep: boolean;
}) {
  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }} title={nombre}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button className="ex-step" onClick={onMinus} disabled={valor <= COEF_MIN} aria-label={`menos ${formula}`}>−</button>
          <div style={{ minWidth: 26, textAlign: "center", fontSize: 19, fontWeight: 900, color: accent, fontFamily: "ui-monospace, monospace" }}>{valor}</div>
          <button className="ex-step" onClick={onPlus} disabled={valor >= COEF_MAX} aria-label={`más ${formula}`}>+</button>
        </div>
        <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{formula}</div>
      </div>
      {sep && <span style={{ fontSize: 18, fontWeight: 900, color: T.text3, margin: "0 2px" }}>+</span>}
    </>
  );
}

/* ── Fila de la tabla de balance por elemento ────────────────────────────── */
function FilaBalance({ el, izq, der, ok }: { el: string; izq: number; der: number; ok: boolean }) {
  const elColor = ELEMS_B[el as keyof typeof ELEMS_B].color;
  const nombre = ELEMS_B[el as keyof typeof ELEMS_B].nombre;
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0" }}>
        <span style={{ width: 16, height: 16, borderRadius: "50%", background: elColor, border: "1px solid rgba(255,255,255,0.35)", flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 900, color: "#fff" }}>{el}</span>
        <span style={{ fontSize: 10.5, color: T.text3 }}>{nombre}</span>
      </div>
      <div style={{ textAlign: "center", fontSize: 15, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{izq}</div>
      <div style={{ textAlign: "center", fontSize: 15, fontWeight: 900, color: ok ? OK_COL : NO_COL, fontFamily: "ui-monospace, monospace" }}>{der}</div>
      <div style={{ textAlign: "center", width: 18 }}>
        <i className={`fa-solid ${ok ? "fa-check" : "fa-xmark"}`} style={{ color: ok ? OK_COL : NO_COL, fontSize: 13 }} />
      </div>
    </>
  );
}
