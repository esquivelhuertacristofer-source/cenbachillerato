"use client";

/**
 * Laboratorio 3D — Concentración de una disolución (% en masa).
 * Práctica experimental para CNEYT-I-P04-A6.
 *
 * El estudiante prepara una disolución: elige un SOLUTO, agrega gramos de soluto
 * y de DISOLVENTE (agua) y observa cómo cambia la CONCENTRACIÓN en % en masa
 * = (masa de soluto / masa de la disolución) × 100. Si agrega más soluto del que
 * el agua admite (solubilidad), el excedente no se disuelve: la disolución se
 * SATURA. Conecta la química con los porcentajes. Ciencias Naturales,
 * Experimentales y Tecnología I.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { SOLUTOS, AGUAS, SOLUTO_MAX, SOLUTO_PASO, disolver, nivelDisolucion, EJERCICIO_A6 } from "./concentracion-data";
import { FichaTeorica } from "./_ficha";
import { CONCENTRACION_FICHA } from "./concentracion-ficha";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { useLogros } from "./_partida";

const ConcentracionScene = dynamic(() => import("./ConcentracionScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-flask fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const SAT = "#FF8A3C"; // color de saturación

const fmtG = (n: number) => `${n % 1 === 0 ? n.toLocaleString("es-MX") : n.toLocaleString("es-MX", { maximumFractionDigits: 1 })} g`;
const fmtPct = (n: number) => `${n.toLocaleString("es-MX", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;

const RETO_KEY = "cen-concentracion-disolucion-reto";

export function LabConcentracion({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [solutoKey, setSolutoKey] = useState(SOLUTOS[0]!.key);
  const [masaSoluto, setMasaSoluto] = useState(20);
  const [masaAgua, setMasaAgua] = useState<number>(100);
  const [autoRotate, setAutoRotate] = useState(true);
  const [resetNonce, setResetNonce] = useState(0);
  // seguimiento de objetivos
  const [interactuo, setInteractuo] = useState(false);
  const [vioConcentrada, setVioConcentrada] = useState(false);
  const [diluyo, setDiluyo] = useState(false);
  const [saturo, setSaturo] = useState(false);
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  // teoría (cajón deslizable) y sonido
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
      sfx.burbujas(true);
      setSonido(true);
    }
  }, [sonido]);

  useEffect(() => {
    return () => {
      audioRef.current?.dispose();
      audioRef.current = null;
    };
  }, []);

  // efecto de sonido al manipular el soluto/agua (sólo si el audio está activo).
  const playGota = useCallback(() => {
    if (sonido) audioRef.current?.gota();
  }, [sonido]);

  // marca objetivos a partir del resultado de una combinación
  const marcar = (soluto: number, aguaG: number, key: string) => {
    const s = SOLUTOS.find((x) => x.key === key)!;
    const d = disolver(soluto, aguaG, s.solubilidad);
    if (d.concentracion >= 20) setVioConcentrada(true);
    if (d.saturada) setSaturo(true);
  };

  const elegirSoluto = (key: string) => {
    setSolutoKey(key);
    setInteractuo(true);
    playGota();
    marcar(masaSoluto, masaAgua, key);
  };
  const masSoluto = () => {
    const n = Math.min(SOLUTO_MAX, masaSoluto + SOLUTO_PASO);
    setMasaSoluto(n);
    setInteractuo(true);
    playGota();
    marcar(n, masaAgua, solutoKey);
  };
  const menosSoluto = () => {
    const n = Math.max(0, masaSoluto - SOLUTO_PASO);
    setMasaSoluto(n);
    setInteractuo(true);
    playGota();
    marcar(n, masaAgua, solutoKey);
  };
  const elegirAgua = (g: number) => {
    if (g > masaAgua && masaSoluto > 0) setDiluyo(true);
    setMasaAgua(g);
    setInteractuo(true);
    playGota();
    marcar(masaSoluto, g, solutoKey);
  };
  const reset = () => {
    setSolutoKey(SOLUTOS[0]!.key);
    setMasaSoluto(20);
    setMasaAgua(100);
    setResetNonce((n) => n + 1);
  };

  const soluto = useMemo(() => SOLUTOS.find((x) => x.key === solutoKey)!, [solutoKey]);
  const d = useMemo(() => disolver(masaSoluto, masaAgua, soluto.solubilidad), [masaSoluto, masaAgua, soluto.solubilidad]);
  const nivelInfo = useMemo(() => nivelDisolucion(masaSoluto, d), [masaSoluto, d]);

  const nivel = 0.28 + ((masaAgua - 50) / 150) * 0.6; // 50 g → 0.28, 200 g → 0.88
  const intensidad = Math.min(1, d.concentracion / 35);
  const excedenteFrac = Math.min(1, d.excedente / 40);

  const objetivos = [
    { txt: "Agrega soluto y prepara una disolución", done: interactuo && masaSoluto > 0 },
    { txt: "Llega a una disolución concentrada (≥ 20 %)", done: vioConcentrada },
    { txt: "Diluye agregando más agua (baja el %)", done: diluyo },
    { txt: "Satura: deja soluto sin disolver", done: saturo },
    { txt: "Resuelve el reto de concentración", done: ejercicioAprobado },
  ];
  // Los objetivos se recuerdan (algunos dependían del modo y se desmarcaban
  // solos) y se convierten en la marca del laboratorio, que antes no se
  // guardaba en ninguna parte.
  const { logros: logrosLab, cumplidos: cumplidosLab, total: totalLab } = useLogros(objetivos.map((o) => o.done));
  const { registraEstrellas } = useEstrellas(RETO_KEY);
  useEffect(() => {
    if (cumplidosLab === 0) return;
    const est = cumplidosLab >= totalLab ? 3 : cumplidosLab >= Math.ceil((totalLab * 2) / 3) ? 2 : 1;
    registraEstrellas(est);
  }, [cumplidosLab, totalLab, registraEstrellas]);

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${soluto.icono}`} />
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, color: T.text, ...NUM }}>{fmtPct(d.concentracion)}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: {fmtG(d.disuelto)} de {soluto.nombre} disueltos en {fmtG(masaAgua)} de agua dan una disolución del {fmtPct(d.concentracion)} en masa.
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes exPulse { 0%,100%{ box-shadow:0 0 0 0 var(--exc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .ex-live-dot { animation: exPulse 1.6s ease-in-out infinite; }
        .ex-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(300px,26vw,380px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .ex-grid { grid-template-columns: 1fr; } }
        .ex-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .ex-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .ex-icobtn:hover { background:rgba(255,255,255,0.12); }
        .ex-divider { height:1px; background:${T.line}; margin:18px 0; }
        .ex-chip { cursor:pointer; border-radius:11px; border:1px solid ${T.line}; background:${T.glass}; color:${T.text2};
          font-size:14px; font-weight:800; padding:11px 0; transition:all .14s ease; }
        .ex-chip:hover { border-color:${T.lineStrong}; background:${T.glassSoft}; color:#fff; }
        .ex-chip[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.18); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .ex-sol { cursor:pointer; flex:1; border-radius:12px; border:1px solid ${T.line}; background:${T.glass}; color:${T.text2};
          font-weight:800; padding:13px 6px; transition:all .14s ease; display:flex; flex-direction:column; align-items:center; gap:5px; }
        .ex-sol:hover { border-color:${T.lineStrong}; color:#fff; }
        .ex-sol[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.18); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .ex-step { cursor:pointer; width:46px; height:46px; border-radius:12px; border:1px solid ${T.line}; background:${T.glass};
          color:#fff; font-size:18px; transition:all .14s; display:flex; align-items:center; justify-content:center; }
        .ex-step:hover:not(:disabled) { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .ex-step:disabled { opacity:0.32; cursor:not-allowed; }
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
        .ex-teoria-fab { position:absolute; bottom:16px; right:16px; cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .ex-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }

        /* Reto evaluable — arrastrar y soltar */
        .rd-grid { display:grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap:22px; align-items:start; }
        @media (max-width: 760px){ .rd-grid { grid-template-columns:1fr; } }
        .rd-chip { cursor:grab; user-select:none; border-radius:12px; border:1px solid ${T.line}; background:${T.glass};
          color:#fff; font-weight:800; font-size:13.5px; padding:12px 8px; display:flex; flex-direction:column; align-items:center; gap:4px;
          transition:all .14s ease; }
        .rd-chip:hover { border-color:${T.lineStrong}; background:${T.glassSoft}; transform:translateY(-1px); }
        .rd-chip:active { cursor:grabbing; }
        .rd-chip[data-kind="soluto"]:hover { border-color:${accent}; box-shadow:0 0 16px -7px ${accent}; }
        .rd-chip[data-kind="agua"]:hover { border-color:#5BC8FF; box-shadow:0 0 16px -7px #5BC8FF; }
        .rd-vaso { border-radius:16px; border:2px dashed ${T.lineStrong}; background:${T.inset};
          min-height:158px; padding:16px; display:flex; flex-direction:column; justify-content:flex-end; transition:all .16s ease; position:relative; overflow:hidden; }
        .rd-vaso[data-over="true"] { border-color:${accent}; background:rgba(${color.rgba},0.12); }
        .rd-num { width:100%; box-sizing:border-box; border-radius:12px; border:1px solid ${T.line}; background:${T.inset};
          color:#fff; font-size:20px; font-weight:900; text-align:center; padding:13px 12px; outline:none; transition:border-color .15s; }
        .rd-num:focus { border-color:${accent}; }
        .rd-num::-webkit-outer-spin-button, .rd-num::-webkit-inner-spin-button { -webkit-appearance:none; margin:0; }
        .rd-num { -moz-appearance:textfield; }
        .rd-btn { cursor:pointer; border:none; border-radius:12px; font-size:14px; font-weight:800; padding:13px 18px; transition:all .15s; }
        .rd-btn-primary { background:${accent}; color:#04121f; }
        .rd-btn-primary:hover:not(:disabled) { filter:brightness(1.08); }
        .rd-btn-primary:disabled { opacity:0.4; cursor:not-allowed; }
        .rd-btn-ghost { background:${T.glass}; border:1px solid ${T.line}; color:#fff; }
        .rd-btn-ghost:hover { border-color:${accent}; }
      `}</style>

      <div className="ex-grid">
        {/* ── Columna visor ──────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              position: "relative",
              height: "clamp(460px, 66vh, 780px)",
              borderRadius: 20,
              overflow: "hidden",
              border: `1px solid rgba(${color.rgba},0.22)`,
              background: `radial-gradient(120% 80% at 50% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#06182f 0%,#020d1d 100%)`,
              boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}`,
            }}
          >
            <SceneBoundary fallback={sceneFallback}>
              <ConcentracionScene
                nivel={nivel}
                solutoColor={soluto.color}
                intensidad={intensidad}
                saturada={d.saturada}
                excedenteFrac={excedenteFrac}
                accent={accent}
                autoRotate={autoRotate}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO con la concentración */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(2,12,28,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13.5, fontWeight: 900, color: accent, ...NUM }}>{fmtPct(d.concentracion)} en masa</span>
            </div>

            {/* Etiqueta de estado (diluida / concentrada / saturada) */}
            <div style={{ position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)", display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 14px", borderRadius: 999, background: "rgba(2,12,28,0.74)", border: `1px solid ${nivelInfo.color}66`, backdropFilter: "blur(10px)" }}>
              <i className={`fa-solid ${d.saturada ? "fa-triangle-exclamation" : "fa-droplet"}`} style={{ color: nivelInfo.color, fontSize: 12 }} />
              <span style={{ fontSize: 12, fontWeight: 800, color: nivelInfo.color }}>{nivelInfo.texto}</span>
            </div>

            {/* Etiqueta inferior */}
            <div style={{ position: "absolute", bottom: 16, left: 18, fontSize: 11, fontWeight: 800, letterSpacing: "0.04em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", pointerEvents: "none" }}>
              <i className={`fa-solid ${soluto.icono}`} style={{ marginRight: 7, color: accent }} />
              {fmtG(d.disuelto)} {soluto.nombre} · {fmtG(masaAgua)} agua
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(2,12,28,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ex-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="ex-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="ex-icobtn" data-on={autoRotate} onClick={() => setAutoRotate((v) => !v)} title="Girar automáticamente">
                <i className="fa-solid fa-arrows-rotate" />
              </button>
              <button className="ex-icobtn" onClick={reset} title="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Botón flotante de Teoría */}
            <button className="ex-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>
          </div>

          {/* La concentración paso a paso */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>La concentración paso a paso</Eyebrow>
            <div style={{ display: "flex", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}` }}>
              <Readout label="Soluto disuelto" value={fmtG(d.disuelto)} col={accent} />
              <div style={{ width: 1, background: T.line }} />
              <Readout label="Disolvente" value={fmtG(masaAgua)} />
              <div style={{ width: 1, background: T.line }} />
              <Readout label="Disolución" value={fmtG(d.masaDisolucion)} />
              <div style={{ width: 1, background: T.line }} />
              <Readout label="% en masa" value={fmtPct(d.concentracion)} col={nivelInfo.color} />
            </div>
            <div style={{ marginTop: 12, fontSize: 13.5, color: T.text2, lineHeight: 1.5 }}>
              <i className="fa-solid fa-percent" style={{ marginRight: 8, color: accent }} />
              <strong style={{ color: T.text }}>% en masa</strong> ={" "}
              <span style={{ ...NUM }}>
                ({fmtG(d.disuelto).replace(" g", "")} ÷ {fmtG(d.masaDisolucion).replace(" g", "")}) × 100 ={" "}
              </span>
              <strong style={{ color: nivelInfo.color, ...NUM }}>{fmtPct(d.concentracion)}</strong>. La masa de la disolución es soluto disuelto + disolvente.
            </div>

            {/* Aviso de saturación */}
            {d.saturada && (
              <div style={{ marginTop: 14, borderRadius: 13, border: `1px solid ${SAT}66`, background: `${SAT}14`, padding: "12px 16px", display: "flex", gap: 12, alignItems: "center" }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ color: SAT, fontSize: 18 }} />
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text, lineHeight: 1.45 }}>
                  Disolución <span style={{ color: SAT }}>saturada</span>: el agua solo disuelve {fmtG(d.maxDisuelto)} de {soluto.nombre}.{" "}
                  <strong style={{ color: SAT, ...NUM }}>{fmtG(d.excedente)}</strong> quedan sin disolver en el fondo.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Columna controles ──────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          {/* Soluto */}
          <Eyebrow>Soluto · lo que se disuelve</Eyebrow>
          <div style={{ display: "flex", gap: 8 }}>
            {SOLUTOS.map((s) => (
              <button key={s.key} className="ex-sol" data-on={s.key === solutoKey} onClick={() => elegirSoluto(s.key)}>
                <i className={`fa-solid ${s.icono}`} style={{ fontSize: 18, color: s.key === solutoKey ? accent : T.text3 }} />
                <span style={{ fontSize: 12.5 }}>{s.nombre}</span>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: T.text3, ...NUM }}>{s.formula}</span>
              </button>
            ))}
          </div>

          <div className="ex-divider" />

          {/* Masa de soluto */}
          <Eyebrow>Masa de soluto</Eyebrow>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <button className="ex-step" onClick={menosSoluto} disabled={masaSoluto <= 0} title="Quitar soluto">
              <i className="fa-solid fa-minus" />
            </button>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: accent, ...NUM, textShadow: `0 0 18px ${accent}55` }}>{fmtG(masaSoluto)}</div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: T.text3, letterSpacing: "0.05em", textTransform: "uppercase" }}>de {soluto.nombre}</div>
            </div>
            <button className="ex-step" onClick={masSoluto} disabled={masaSoluto >= SOLUTO_MAX} title="Agregar soluto">
              <i className="fa-solid fa-plus" />
            </button>
          </div>
          <div style={{ marginTop: 11, fontSize: 12, color: T.text2, lineHeight: 1.45 }}>
            <i className="fa-solid fa-circle-info" style={{ marginRight: 7, color: accent }} />
            En este vaso el agua disuelve hasta <strong style={{ color: T.text, ...NUM }}>{fmtG(d.maxDisuelto)}</strong> de {soluto.nombre}.
          </div>

          <div className="ex-divider" />

          {/* Disolvente */}
          <Eyebrow>Disolvente · agua</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 7 }}>
            {AGUAS.map((g) => (
              <button key={g} className="ex-chip" data-on={g === masaAgua} onClick={() => elegirAgua(g)}>
                {g} g
              </button>
            ))}
          </div>

          <div className="ex-divider" />

          {/* Marcador */}
          <Eyebrow>Marcador</Eyebrow>
          <div style={{ display: "flex", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}` }}>
            <Readout label="Concentración" value={fmtPct(d.concentracion)} col={nivelInfo.color} />
            <div style={{ width: 1, background: T.line }} />
            <Readout label="Estado" value={nivelInfo.texto} col={nivelInfo.color} />
          </div>
        </div>
      </div>

      {/* ── Objetivos + pista ──────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="ex-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
            Objetivos
          </Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
            {objetivos.map((o, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: logrosLab[i] ? OK : T.text2 }}>
                <i className={`fa-solid ${logrosLab[i] ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 15, opacity: logrosLab[i] ? 1 : 0.3 }} />
                <span style={{ fontWeight: logrosLab[i] ? 700 : 500 }}>{o.txt}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderRadius: 18, padding: "18px 20px", border: `1px solid rgba(${color.rgba},0.3)`, background: `rgba(${color.rgba},0.08)`, fontSize: 13.5, color: T.text2, lineHeight: 1.55, display: "flex", gap: 13 }}>
          <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 17, marginTop: 1 }} />
          <span>
            La <strong style={{ color: T.text }}>concentración</strong> sube si agregas soluto y baja si agregas agua (la diluyes). Pero el agua tiene un límite: al rebasar la{" "}
            <strong style={{ color: SAT }}>solubilidad</strong>, el soluto extra se queda sin disolver y la disolución está saturada.
          </span>
        </div>
      </div>

      {/* ── Reto evaluable: arma la disolución y calcula el % ─────────── */}
      <RetoDisolucionCard
        accent={accent}
        rgba={color.rgba}
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
        playDrop={sonido ? () => audioRef.current?.gota() : undefined}
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
          <FichaTeorica data={CONCENTRACION_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}

/* ── Tarjeta evaluable: arrastrar y soltar + calcular % m/m ──────────────── */

interface RetoProps {
  accent: string;
  rgba: string;
  aprobado: boolean;
  onAprobado: () => void;
  playSfx?: (ok: boolean) => void;
  playDrop?: () => void;
}

/** Fichas que el alumno puede arrastrar (o tocar) hacia el vaso. */
const CHIPS_SOLUTO = [5, 10, 20] as const;
const CHIPS_AGUA = [20, 40, 80] as const;

function RetoDisolucionCard({ accent, rgba, aprobado, onAprobado, playSfx, playDrop }: RetoProps) {
  const ej = EJERCICIO_A6;
  const [soluto, setSoluto] = useState(0);
  const [agua, setAgua] = useState(0);
  const [over, setOver] = useState(false);
  const [respuesta, setRespuesta] = useState("");
  const [comprobado, setComprobado] = useState(false);

  const masaDisol = soluto + agua;
  const pct = masaDisol > 0 ? (soluto / masaDisol) * 100 : 0;
  const num = Number(respuesta.replace(",", "."));

  const solutoOk = Math.abs(soluto - ej.solutoObjetivo) < 0.5;
  const aguaOk = Math.abs(agua - ej.aguaObjetivo) < 0.5;
  const pctOk = respuesta.trim() !== "" && !Number.isNaN(num) && Math.abs(num - ej.porcentajeObjetivo) <= ej.toleranciaError;
  const todoOk = solutoOk && aguaOk && pctOk;
  const puedeComprobar = masaDisol > 0 && respuesta.trim() !== "";

  const agregar = (kind: "soluto" | "agua", g: number) => {
    if (kind === "soluto") setSoluto((v) => v + g);
    else setAgua((v) => v + g);
    setComprobado(false);
    playDrop?.();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setOver(false);
    try {
      const raw = e.dataTransfer.getData("text/plain");
      if (!raw) return;
      const { kind, g } = JSON.parse(raw) as { kind: "soluto" | "agua"; g: number };
      if ((kind === "soluto" || kind === "agua") && typeof g === "number") agregar(kind, g);
    } catch {
      /* payload inválido: ignorar */
    }
  };

  const vaciar = () => {
    setSoluto(0);
    setAgua(0);
    setComprobado(false);
  };

  const comprobar = () => {
    setComprobado(true);
    if (todoOk) onAprobado();
    playSfx?.(todoOk);
  };

  const fmt1 = (n: number) => n.toLocaleString("es-MX", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  return (
    <div style={{ ...card, padding: "22px 24px 24px", marginTop: 22 }}>
      <Eyebrow>
        <i className="fa-solid fa-flask-vial" style={{ marginRight: 8, color: accent }} />
        Reto · arma la disolución y calcula el porcentaje
      </Eyebrow>

      {/* Enunciado verbatim del A6 */}
      <div style={{ marginTop: 4, fontSize: 15, fontWeight: 800, color: T.text, lineHeight: 1.5 }}>{ej.problema}</div>
      <div style={{ marginTop: 8, fontSize: 12.5, color: T.text2, lineHeight: 1.5, borderRadius: 12, border: `1px solid ${T.line}`, background: T.inset, padding: "10px 14px" }}>
        <i className="fa-solid fa-circle-info" style={{ marginRight: 8, color: accent }} />
        {ej.contexto}
      </div>

      <div className="rd-grid" style={{ marginTop: 18 }}>
        {/* Columna izquierda: fichas arrastrables + vaso */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: T.text3, marginBottom: 8 }}>
            Arrastra (o toca) al vaso
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7, marginBottom: 9 }}>
            {CHIPS_SOLUTO.map((g) => (
              <div
                key={`s${g}`}
                className="rd-chip"
                data-kind="soluto"
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/plain", JSON.stringify({ kind: "soluto", g }))}
                onClick={() => agregar("soluto", g)}
                title="Agregar sal (soluto)"
              >
                <i className="fa-solid fa-cubes-stacked" style={{ color: accent, fontSize: 15 }} />
                <span>{g} g sal</span>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7 }}>
            {CHIPS_AGUA.map((g) => (
              <div
                key={`a${g}`}
                className="rd-chip"
                data-kind="agua"
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/plain", JSON.stringify({ kind: "agua", g }))}
                onClick={() => agregar("agua", g)}
                title="Agregar agua (disolvente)"
              >
                <i className="fa-solid fa-droplet" style={{ color: "#5BC8FF", fontSize: 15 }} />
                <span>{g} g agua</span>
              </div>
            ))}
          </div>

          {/* Vaso (zona de soltado) */}
          <div
            className="rd-vaso"
            data-over={over}
            style={{ marginTop: 12 }}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(true);
            }}
            onDragLeave={() => setOver(false)}
            onDrop={onDrop}
          >
            <div style={{ position: "absolute", top: 10, left: 14, fontSize: 10.5, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: T.text3 }}>
              <i className="fa-solid fa-prescription-bottle" style={{ marginRight: 6, color: accent }} />
              Vaso de la disolución
            </div>
            {masaDisol === 0 ? (
              <div style={{ textAlign: "center", color: T.text3, fontSize: 13, paddingBottom: 18 }}>
                Suelta aquí el soluto y el disolvente
              </div>
            ) : (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <span style={{ borderRadius: 999, padding: "6px 12px", background: `rgba(${rgba},0.18)`, color: "#fff", fontWeight: 800, fontSize: 13, ...NUM }}>
                  <i className="fa-solid fa-cubes-stacked" style={{ marginRight: 7, color: accent }} />
                  {soluto} g sal
                </span>
                <span style={{ borderRadius: 999, padding: "6px 12px", background: "rgba(91,200,255,0.16)", color: "#fff", fontWeight: 800, fontSize: 13, ...NUM }}>
                  <i className="fa-solid fa-droplet" style={{ marginRight: 7, color: "#5BC8FF" }} />
                  {agua} g agua
                </span>
              </div>
            )}
          </div>

          <button className="rd-btn rd-btn-ghost" onClick={vaciar} disabled={masaDisol === 0} style={{ marginTop: 10, width: "100%", opacity: masaDisol === 0 ? 0.4 : 1 }}>
            <i className="fa-solid fa-arrow-rotate-left" style={{ marginRight: 8 }} />
            Vaciar el vaso
          </button>
        </div>

        {/* Columna derecha: lectura en vivo + respuesta */}
        <div>
          <div style={{ display: "flex", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}` }}>
            <Readout label="Soluto" value={`${soluto} g`} col={accent} />
            <div style={{ width: 1, background: T.line }} />
            <Readout label="Disolución" value={`${masaDisol} g`} />
            <div style={{ width: 1, background: T.line }} />
            <Readout label="% calculado" value={`${fmt1(pct)} %`} col={OK} />
          </div>
          <div style={{ marginTop: 11, fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
            Masa de la disolución = soluto + disolvente ={" "}
            <strong style={{ color: T.text, ...NUM }}>{soluto} + {agua} = {masaDisol} g</strong>.
          </div>

          <div style={{ marginTop: 16, fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: T.text3, marginBottom: 7 }}>
            Tu respuesta · {ej.unidades}
          </div>
          <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
            <input
              className="rd-num"
              type="number"
              inputMode="decimal"
              placeholder="% m/m"
              value={respuesta}
              onChange={(e) => {
                setRespuesta(e.target.value);
                setComprobado(false);
              }}
              style={{ flex: 1 }}
            />
            <span style={{ fontSize: 18, fontWeight: 900, color: T.text2 }}>%</span>
          </div>

          <button className="rd-btn rd-btn-primary" onClick={comprobar} disabled={!puedeComprobar} style={{ marginTop: 12, width: "100%" }}>
            <i className="fa-solid fa-circle-check" style={{ marginRight: 8 }} />
            Comprobar
          </button>

          {/* Retroalimentación */}
          {comprobado && (
            <div
              style={{
                marginTop: 13,
                borderRadius: 13,
                border: `1px solid ${todoOk ? OK : "#FF8A3C"}66`,
                background: `${todoOk ? OK : "#FF8A3C"}14`,
                padding: "13px 16px",
                fontSize: 13,
                color: T.text,
                lineHeight: 1.5,
              }}
            >
              {todoOk ? (
                <>
                  <div style={{ fontWeight: 900, color: OK, marginBottom: 7 }}>
                    <i className="fa-solid fa-circle-check" style={{ marginRight: 8 }} />
                    ¡Correcto! {ej.respuestaFinal}.
                  </div>
                  <ol style={{ margin: "0 0 0 18px", padding: 0, color: T.text2, display: "flex", flexDirection: "column", gap: 3 }}>
                    {ej.pasosGuia.map((p, i) => (
                      <li key={i} style={{ ...NUM }}>{p}</li>
                    ))}
                  </ol>
                </>
              ) : (
                <div style={{ color: "#FFB27A" }}>
                  <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 8 }} />
                  Aún no. {!solutoOk && "Necesitas 20 g de sal en el vaso. "}
                  {!aguaOk && "Necesitas 80 g de agua en el vaso. "}
                  {solutoOk && aguaOk && !pctOk && "El soluto y el agua están bien; revisa el cálculo: % = (soluto ÷ disolución) × 100."}
                </div>
              )}
            </div>
          )}

          {aprobado && !comprobado && (
            <div style={{ marginTop: 12, fontSize: 12.5, fontWeight: 700, color: OK }}>
              <i className="fa-solid fa-circle-check" style={{ marginRight: 7 }} />
              Reto resuelto.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
