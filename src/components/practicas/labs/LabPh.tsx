"use client";

/**
 * Laboratorio 3D — Escala de pH, ácidos y bases.
 * Práctica experimental para CNEYT-IV-P03-A2 (simulacion "Simulación de
 * laboratorio: midiendo el pH"; UAC "Reacciones químicas", progresión 3:
 * "Analiza el concepto de pH y la importancia de los ácidos y bases…").
 *
 * Dos modos:
 *  · Medir — el alumno elige una sustancia (las 6 del panel de la simulación +
 *    sustancias cotidianas de la lectura) y ve la disolución teñirse con el
 *    indicador de col morada y el marcador moverse por la escala 0–14.
 *  · Neutralizar — titula un ácido (fuerte HCl / débil vinagre) con NaOH gota a
 *    gota; el pH sube hasta el punto de equivalencia. La curva muestra la
 *    diferencia entre ácido fuerte y débil (región buffer).
 *
 * Valores de pH = los de la actividad. Color del indicador = cualitativo.
 * Curva de titulación = modelo simplificado con las formas correctas.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { PH_FICHA } from "./ph-escala-ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { QUIZ_A2 } from "./ph-escala-data";
import { EppGate, type EppItem } from "./_epp-gate";
import { LabSfx } from "./lab-audio";
import {
  SUSTANCIAS, COTIDIANAS, sustancia, SUST_DEF,
  ACIDOS, type TipoAcido, phPorGotas, curvaTitulacion, GOTAS_EQ, GOTAS_MAX,
  colorCol, nombreColor, clasifica, fmtPh,
  BUFFER, DATOS, IDEAS, type Sustancia,
} from "./ph-data";

const PhScene = dynamic(() => import("./PhScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-flask fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando las disoluciones…</span>
    </div>
  ),
});

type Modo = "medir" | "neutralizar";

const WARN = "#FF8A3C";
import { guardarEstrellas } from "@/app/actions/guardarEstrellas";
const RETO_KEY = "cen-ph-reto";

/** Equipo de protección personal: en química se manejan ácidos y bases corrosivos. */
const INSTRUMENTOS: EppItem[] = [
  { key: "lentes", nombre: "Lentes de seguridad", icono: "fa-glasses", ok: true, nota: "Protegen tus ojos de salpicaduras de ácido o base." },
  { key: "bata", nombre: "Bata de laboratorio", icono: "fa-user-doctor", ok: true, nota: "Protege tu piel y tu ropa de los reactivos." },
  { key: "guantes", nombre: "Guantes de nitrilo", icono: "fa-hand", ok: true, nota: "Evitan el contacto directo con sustancias corrosivas." },
  { key: "gorra", nombre: "Gorra", icono: "fa-hat-cowboy", ok: false, nota: "No es equipo de protección de laboratorio." },
  { key: "audifonos", nombre: "Audífonos", icono: "fa-headphones", ok: false, nota: "Te distraen y no protegen de los reactivos." },
  { key: "sandalias", nombre: "Sandalias", icono: "fa-shoe-prints", ok: false, nota: "En el laboratorio se exige calzado cerrado, no sandalias." },
];

export function LabPh({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("medir");
  const [sustId, setSustId] = useState(SUST_DEF);
  const [acidoId, setAcidoId] = useState<TipoAcido>("fuerte");
  const [gotas, setGotas] = useState(0);
  const [titulando, setTitulando] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  // pilares: equiparse · pasos · arrastrar · calcular
  const [eppListo, setEppListo] = useState(false);
  const [medido, setMedido] = useState(false);
  const [arrastro, setArrastro] = useState(false);
  const [predicho, setPredicho] = useState(false);
  const [mejorEstrellas, setMejorEstrellas] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    try { return Number(window.localStorage.getItem(RETO_KEY)) || 0; } catch { return 0; }
  });
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

  // pH actual según el modo.
  const sust = useMemo(() => sustancia(sustId), [sustId]);
  const ph = modo === "medir" ? sust.ph : phPorGotas(acidoId, gotas);
  const colorLiquido = colorCol(ph);
  const clase = clasifica(ph);
  const colorTxt = nombreColor(ph);

  const acido = ACIDOS.find((a) => a.id === acidoId)!;
  const curva = useMemo(() => curvaTitulacion(acidoId), [acidoId]);
  const enEquivalencia = modo === "neutralizar" && gotas === GOTAS_EQ;

  // ── Pasos guiados (pilar "seguir pasos") ───────────────────────────
  const pasos = [
    { t: "Equípate", icon: "fa-shield-halved", done: eppListo },
    { t: "Mide una sustancia", icon: "fa-eye-dropper", done: medido },
    { t: "Arrastra la bureta y titula", icon: "fa-hand-pointer", done: arrastro },
    { t: "Calcula los iones H⁺", icon: "fa-calculator", done: predicho },
  ];
  const pasoActivo = pasos.findIndex((p) => !p.done);

  // ── Objetivos guiados (se marcan en vivo) ──────────────────────────
  const objetivos = [
    { txt: "Equípate con tu equipo de protección personal", done: eppListo },
    { txt: "Mide el pH de una sustancia", done: medido },
    { txt: "Observa cómo cambia el indicador de col morada", done: medido && ph !== 7 },
    { txt: "Arrastra la bureta de NaOH para titular", done: arrastro },
    { txt: "Alcanza el punto de equivalencia (neutralización)", done: modo === "neutralizar" && gotas >= GOTAS_EQ },
    { txt: "Calcula los iones H⁺ (escala logarítmica)", done: predicho },
    { txt: "Aprueba el cuestionario de la actividad A4", done: ejercicioAprobado },
  ];

  // Concentración relativa de H⁺ respecto al agua pura (potencia de 10).
  const exp = 7 - ph;
  const relTxt = Math.abs(exp) < 0.05 ? "igual que el agua" : `×10${supScript(exp)}`;

  // Titulación automática "paso a paso" (setInterval en useEffect: seguro con
  // React Compiler — no es render ni useFrame).
  useEffect(() => {
    if (!titulando) return;
    const id = setInterval(() => {
      setGotas((g) => {
        if (g >= GOTAS_MAX) {
          setTitulando(false);
          return g;
        }
        return g + 1;
      });
    }, 320);
    return () => clearInterval(id);
  }, [titulando]);

  const cambiarModo = (m: Modo) => {
    setTitulando(false);
    setModo(m);
    bump();
  };

  const elegirSust = (id: string) => {
    setSustId(id);
    setMedido(true);
    if (sonido) audioRef.current?.blip();
    bump();
  };

  // Arrastre de la bureta en la escena 3D → gotas de NaOH (pilar "manipular").
  const onArrastraGotas = useCallback((g: number) => {
    setTitulando(false);
    setArrastro(true);
    setGotas(Math.max(0, Math.min(GOTAS_MAX, Math.round(g))));
  }, []);
  const onGrabGotas = useCallback(() => {
    if (sonido) audioRef.current?.blip();
  }, [sonido]);

  // Registro del reto de cálculo (estrellas + récord en localStorage).
  const registraEstrellas = useCallback((est: number) => {
    setPredicho(true);
    setMejorEstrellas((prev) => {
      const mejor = Math.max(prev, est);
      try { window.localStorage.setItem(RETO_KEY, String(mejor)); } catch { /* ignore */ }
      return mejor;
    });
    void guardarEstrellas(RETO_KEY, est);
  }, []);

  const elegirAcido = (id: TipoAcido) => {
    setTitulando(false);
    setAcidoId(id);
    setGotas(0);
    bump();
  };

  const setGota = (delta: number) => {
    setTitulando(false);
    setGotas((g) => Math.max(0, Math.min(GOTAS_MAX, g + delta)));
  };

  const titular = () => {
    if (gotas >= GOTAS_MAX) setGotas(0);
    setTitulando(true);
  };

  const reiniciar = () => {
    setTitulando(false);
    setGotas(0);
    bump();
  };

  const goteando = titulando;

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-flask" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Escala de pH</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la idea sigue: pH = {fmtPh(ph)} → {clase.etiqueta.toLowerCase()} (indicador de col morada: {colorTxt}).
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes phPulse { 0%,100%{ box-shadow:0 0 0 0 var(--exc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .ph-live-dot { animation: phPulse 1.6s ease-in-out infinite; }
        .ph-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(300px,26vw,380px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .ph-grid { grid-template-columns: 1fr; } }
        .ph-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .ph-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .ph-icobtn:hover { background:rgba(255,255,255,0.12); }
        .ph-modebtn { cursor:pointer; padding:8px 16px; border-radius:10px; border:1px solid ${T.line}; background:transparent;
          color:${T.text2}; font-size:12.5px; font-weight:900; transition:all .15s; display:flex; align-items:center; gap:7px; }
        .ph-modebtn[data-on="true"] { border-color:rgba(${color.rgba},0.7); background:rgba(${color.rgba},0.2); color:#fff; }
        .ph-modebtn:hover { color:#fff; }
        .ph-chip { cursor:pointer; padding:9px 11px; border-radius:12px; border:1px solid ${T.line}; background:${T.inset};
          color:${T.text2}; font-size:12px; font-weight:800; transition:all .15s; text-align:left; display:flex; align-items:center; gap:9px; }
        .ph-chip:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
        .ph-chip[data-on="true"] { border-color:rgba(${color.rgba},0.7); background:rgba(${color.rgba},0.16); color:#fff; }
        .ph-step { cursor:pointer; width:34px; height:34px; border-radius:9px; border:1px solid ${T.line}; background:${T.inset};
          color:#fff; font-size:15px; font-weight:900; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .ph-step:hover:not(:disabled) { border-color:rgba(${color.rgba},0.6); background:rgba(${color.rgba},0.18); }
        .ph-step:disabled { opacity:0.32; cursor:not-allowed; }
        .ph-solve { cursor:pointer; flex:1; padding:11px 14px; border-radius:11px; border:none; font-size:13px; font-weight:900;
          display:flex; align-items:center; justify-content:center; gap:8px; transition:all .15s; }
        .ph-ghost { cursor:pointer; padding:11px 14px; border-radius:11px; border:1px solid ${T.line}; background:${T.inset};
          color:${T.text2}; font-size:13px; font-weight:900; display:flex; align-items:center; justify-content:center; gap:8px; transition:all .15s; }
        .ph-ghost:hover { border-color:rgba(255,255,255,0.3); color:#fff; }
        @media (max-width: 1000px){ .ph-bottom { grid-template-columns: 1fr !important; } }

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

        /* Pasos guiados */
        .ex-steps { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:18px; }
        .ex-step { display:inline-flex; align-items:center; gap:8px; padding:8px 13px; border-radius:999px;
          border:1px solid ${T.line}; background:${T.inset}; color:${T.text2}; font-size:12.5px; font-weight:800; transition:all .18s; }
        .ex-step[data-state="active"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 0 3px rgba(${color.rgba},0.12); }
        .ex-step[data-state="done"] { border-color:${OK}66; background:${OK}1a; color:${OK}; }
        .ex-step-n { width:20px; height:20px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center;
          font-size:11px; font-weight:900; background:rgba(255,255,255,0.1); }
        .ex-step[data-state="active"] .ex-step-n { background:${accent}; color:#04121f; }
        .ex-step[data-state="done"] .ex-step-n { background:${OK}; color:#04121f; }

        /* Reto de cálculo */
        .calc-in { width:100%; padding:11px 13px; border-radius:11px; border:1px solid ${T.line}; background:${T.inset};
          color:#fff; font-size:16px; font-weight:800; font-family:ui-monospace, monospace; outline:none; transition:border-color .15s; }
        .calc-in:focus { border-color:${accent}; }
        .calc-btn { cursor:pointer; padding:11px 16px; border-radius:11px; border:none; font-size:13px; font-weight:900;
          display:inline-flex; align-items:center; justify-content:center; gap:8px; transition:all .15s; }
        .calc-btn-primary { background:${accent}; color:#04121f; }
        .calc-btn-primary:hover { filter:brightness(1.08); }
        .calc-btn-primary:disabled { opacity:0.4; cursor:not-allowed; }
        .calc-btn-ghost { background:${T.inset}; color:${T.text2}; border:1px solid ${T.line}; }
        .calc-btn-ghost:hover { color:#fff; border-color:rgba(255,255,255,0.3); }
      `}</style>

      {/* ── Pasos guiados ──────────────────────────────────────────── */}
      <div className="ex-steps">
        {pasos.map((p, i) => (
          <div key={p.t} className="ex-step" data-state={p.done ? "done" : i === pasoActivo ? "active" : "todo"}>
            <span className="ex-step-n">{p.done ? <i className="fa-solid fa-check" /> : i + 1}</span>
            <i className={`fa-solid ${p.icon}`} style={{ fontSize: 12, opacity: 0.85 }} />
            <span>{p.t}</span>
          </div>
        ))}
      </div>

      <div className="ph-grid">
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
              <PhScene
                ph={ph}
                colorLiquido={colorLiquido}
                accent={accent}
                modo={modo}
                goteando={goteando}
                gotas={gotas}
                gotasMax={GOTAS_MAX}
                resetNonce={resetNonce}
                arrastrable={eppListo}
                onGotasChange={onArrastraGotas}
                onGrab={onGrabGotas}
              />
            </SceneBoundary>

            {/* Compuerta de equipamiento: hasta no equiparse no se entra al laboratorio */}
            {!eppListo && (
              <EppGate
                accent={accent}
                rgba={color.rgba}
                items={INSTRUMENTOS}
                titulo="Antes de medir: equípate"
                subtitulo="Vas a manejar ácidos y bases corrosivos. Selecciona tu equipo de protección personal."
                intro="En química la seguridad es lo primero. Elige las tres piezas de protección correctas para entrar al laboratorio."
                verbo="Entrar al laboratorio"
                onEntrar={() => { setEppListo(true); if (sonido) audioRef.current?.blip(); }}
              />
            )}

            {/* Cinta EN VIVO: pH actual */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="ph-live-dot" style={{ ["--exc" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 14, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>pH {fmtPh(ph)}</span>
            </div>

            {/* Badge tipo (ácido/neutro/base) */}
            <div style={{ position: "absolute", top: 58, left: 16, display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${clase.color}88`, backdropFilter: "blur(10px)" }}>
              <span style={{ width: 11, height: 11, borderRadius: 3, background: colorLiquido, border: "1px solid rgba(255,255,255,0.4)" }} />
              <span style={{ fontSize: 11.5, fontWeight: 900, color: clase.color }}>
                {clase.etiqueta}{clase.matiz ? ` (${clase.matiz})` : ""}
              </span>
            </div>

            {/* Toggle de modo + toolbar teoría/sonido */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
              <div style={{ display: "flex", gap: 4, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
                <button className="ph-modebtn" data-on={modo === "medir"} onClick={() => cambiarModo("medir")}>
                  <i className="fa-solid fa-eye-dropper" /> Medir
                </button>
                <button className="ph-modebtn" data-on={modo === "neutralizar"} onClick={() => cambiarModo("neutralizar")}>
                  <i className="fa-solid fa-droplet" /> Neutralizar
                </button>
              </div>
              <div style={{ display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
                <button className="ph-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría">
                  <i className="fa-solid fa-book-open" />
                </button>
                <button className="ph-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                  <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
                </button>
              </div>
            </div>

            {/* Botón flotante de Teoría */}
            <button className="ex-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>

            {/* Pie: lectura del indicador */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 14, height: 14, borderRadius: 4, background: colorLiquido, border: "1px solid rgba(255,255,255,0.4)" }} />
                Indicador de col morada: <strong style={{ color: colorLiquido === "#000000" ? "#fff" : colorLiquido, textShadow: "0 0 6px rgba(0,0,0,0.6)" }}>{colorTxt}</strong>
                <span style={{ color: T.text3, fontWeight: 600 }}>· escala 0–14 a la derecha</span>
              </div>
              {modo === "medir" && (
                <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>
                  <i className={`fa-solid ${sust.icono}`} style={{ color: accent, marginRight: 7 }} />
                  {sust.nombre}{sust.formula ? ` (${sust.formula})` : ""} — pH {sust.phTexto}
                </div>
              )}
              {modo === "neutralizar" && (
                <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>
                  <i className="fa-solid fa-droplet" style={{ color: accent, marginRight: 7 }} />
                  {acido.nombre} + NaOH · {gotas} de {GOTAS_MAX} gotas {enEquivalencia ? "· punto de equivalencia" : ""}
                </div>
              )}
            </div>
          </div>

          {/* ── Controles según el modo ─────────────────────────── */}
          {modo === "medir" ? (
            <div style={{ ...card, padding: "18px 22px 20px" }}>
              <Eyebrow>
                <i className="fa-solid fa-vials" style={{ marginRight: 8, color: accent }} />
                Elige una sustancia y mide su pH
              </Eyebrow>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: T.text3, margin: "2px 0 9px" }}>EN EL LABORATORIO (simulación)</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                {SUSTANCIAS.map((s) => (
                  <ChipSust key={s.id} s={s} on={s.id === sustId} onClick={() => elegirSust(s.id)} />
                ))}
              </div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 9px" }}>EN LA VIDA DIARIA (lectura)</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                {COTIDIANAS.map((s) => (
                  <ChipSust key={s.id} s={s} on={s.id === sustId} onClick={() => elegirSust(s.id)} />
                ))}
              </div>
            </div>
          ) : (
            <div style={{ ...card, padding: "18px 22px 20px" }}>
              <Eyebrow>
                <i className="fa-solid fa-flask-vial" style={{ marginRight: 8, color: accent }} />
                Titula el ácido con NaOH (base fuerte)
              </Eyebrow>

              <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
                {ACIDOS.map((a) => (
                  <button key={a.id} className="ph-chip" data-on={a.id === acidoId} onClick={() => elegirAcido(a.id)} style={{ alignItems: "flex-start", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-vial" style={{ color: accent, marginTop: 2 }} />
                    <span>
                      <span style={{ color: "#fff", fontWeight: 900 }}>{a.nombre}</span>
                      <span style={{ display: "block", fontSize: 11, color: T.text2, fontWeight: 600 }}>{a.descripcion}</span>
                    </span>
                  </button>
                ))}
              </div>

              {/* Stepper de gotas */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 6 }}>
                <button className="ph-step" onClick={() => setGota(-1)} disabled={gotas <= 0} aria-label="quitar gota">−</button>
                <div style={{ textAlign: "center", minWidth: 92 }}>
                  <div style={{ fontSize: 26, fontWeight: 900, color: accent, fontFamily: "ui-monospace, monospace" }}>{gotas}</div>
                  <div style={{ fontSize: 10.5, color: T.text3, fontWeight: 800, letterSpacing: "0.06em" }}>GOTAS DE NaOH</div>
                </div>
                <button className="ph-step" onClick={() => setGota(1)} disabled={gotas >= GOTAS_MAX} aria-label="añadir gota">+</button>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button className="ph-solve" onClick={titular} disabled={titulando}
                  style={{ background: titulando ? "rgba(255,255,255,0.06)" : accent, color: titulando ? T.text3 : "#04121f", cursor: titulando ? "default" : "pointer" }}>
                  <i className={`fa-solid ${titulando ? "fa-spinner fa-spin" : "fa-play"}`} />
                  {titulando ? "Goteando…" : "Neutralizar paso a paso"}
                </button>
                <button className="ph-ghost" onClick={reiniciar}>
                  <i className="fa-solid fa-rotate-left" /> Reiniciar
                </button>
              </div>

              {/* Curva de titulación */}
              <div style={{ marginTop: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: T.text3, marginBottom: 8 }}>CURVA pH vs GOTAS</div>
                <CurvaTitulacion curva={curva} gotas={gotas} accent={accent} />
              </div>
            </div>
          )}

          {/* ── Reto de cálculo: iones H⁺ en escala logarítmica ──── */}
          <PrediccionPhCard
            accent={accent}
            phLive={ph}
            mejor={mejorEstrellas}
            onResultado={registraEstrellas}
            playSfx={
              sonido
                ? (ok) => { if (ok) audioRef.current?.correcto(); else audioRef.current?.incorrecto(); }
                : undefined
            }
          />
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Lecturas en vivo */}
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${clase.color}55`, background: `rgba(${color.rgba},0.08)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#04121f", background: colorLiquido, boxShadow: `0 6px 18px -6px ${colorLiquido}` }}>
                <i className="fa-solid fa-flask" />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1, fontFamily: "ui-monospace, monospace" }}>pH {fmtPh(ph)}</div>
                <div style={{ fontSize: 12, color: clase.color, fontWeight: 800 }}>{clase.etiqueta}{clase.matiz ? ` (${clase.matiz})` : ""}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
              <Readout label="indicador" value={colorTxt} col={colorLiquido} size={14} />
              <Readout label="H⁺ vs agua" value={relTxt} col="#bfe8ff" size={14} />
            </div>
            <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.5, marginTop: 13, paddingTop: 13, borderTop: `1px solid ${T.line}` }}>
              {clase.tipo === "acido"
                ? <>Más ácido que el agua: hay <strong style={{ color: "#FB7185" }}>más iones H⁺</strong>. Como la escala es logarítmica, bajar 1 de pH es <strong>×10</strong> más H⁺.</>
                : clase.tipo === "base"
                  ? <>Más básico que el agua: hay <strong style={{ color: "#34D399" }}>menos iones H⁺</strong> (más OH⁻). Subir 1 de pH es <strong>×10</strong> menos H⁺.</>
                  : <>pH 7: <strong style={{ color: "#A78BFA" }}>neutro</strong>, como el agua pura a 25 °C.</>}
            </div>
          </div>

          {/* Contexto */}
          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-circle-info" style={{ marginRight: 8, color: accent }} />
              {modo === "medir" ? "Sobre esta sustancia" : "Sobre esta titulación"}
            </Eyebrow>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
              {modo === "medir" ? sust.contexto : acido.descripcion}
            </div>
            {modo === "neutralizar" && (
              <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.5, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.line}` }}>
                El <strong style={{ color: accent }}>punto de equivalencia</strong> es donde el ácido queda justo neutralizado ({GOTAS_EQ} gotas). En ácido fuerte cae en pH 7; en ácido débil, en pH &gt; 7.
              </div>
            )}
          </div>

          {/* Buffer */}
          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-shield-halved" style={{ marginRight: 8, color: accent }} />
              ¿Qué hace un buffer?
            </Eyebrow>
            <div style={{ fontSize: 11.8, color: T.text2, lineHeight: 1.5, marginBottom: 12 }}>
              Si añades la misma gota de ácido fuerte a cada una, mira cuánto cambia el pH:
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {BUFFER.map((b) => (
                <BarraBuffer key={b.nombre} b={b} />
              ))}
            </div>
            <div style={{ fontSize: 11, color: T.text3, lineHeight: 1.5, marginTop: 12 }}>
              Por eso la sangre, amortiguada con bicarbonato, se mantiene entre 7.35 y 7.45.
            </div>
          </div>
        </div>
      </div>

      {/* ── Objetivos guiados ──────────────────────────────────────── */}
      <div style={{ ...card, padding: "18px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
          Objetivos
        </Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
          {objetivos.map((o, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: o.done ? "#34D399" : T.text2 }}>
              <i className={`fa-solid ${o.done ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 15, opacity: o.done ? 1 : 0.3 }} />
              <span style={{ fontWeight: o.done ? 700 : 500 }}>{o.txt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Lecturas + ideas clave ─────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="ph-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-gauge-high" style={{ marginRight: 8, color: accent }} />
            Datos clave
          </Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {DATOS.map((d, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", borderRadius: 10, background: T.glass, border: `1px solid ${T.line}` }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: accent, background: `rgba(${color.rgba},0.16)`, flexShrink: 0 }}>
                  <i className={`fa-solid ${d.icono}`} />
                </div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{d.valor}</div>
                  <div style={{ fontSize: 11, color: T.text2, lineHeight: 1.4 }}>{d.texto}</div>
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
          Los valores de pH son los de la actividad (lectura y simulación); donde hay un rango se usa un valor representativo y se conserva el texto original. El color del indicador de col morada es <strong>cualitativo</strong> (reproduce la regla rojo/rosa→morado→azul/verde, no es una medición colorimétrica). La curva de titulación usa un <strong>modelo simplificado</strong> (ácido 0.1 M en 25 mL, NaOH 0.1 M), pero el salto brusco en la equivalencia y la región buffer del ácido débil son las formas correctas de la fisicoquímica.
        </span>
      </div>

      {/* ── Reto evaluable: quiz V/F verbatim de A4 ───────────────────── */}
      <RetoQuizCard
        quiz={QUIZ_A2}
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
        playPick={sonido ? () => audioRef.current?.blip() : undefined}
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
          <FichaTeorica data={PH_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}

/* ── Superíndice de potencia de 10 (entero redondeado) ───────────────────── */
function supScript(exp: number): string {
  const n = Math.round(exp);
  if (n === 0) return "⁰";
  const sup: Record<string, string> = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻" };
  return String(n).split("").map((c) => sup[c] ?? c).join("");
}

/* ── Factor de concentración (potencia de 10 legible) ────────────────────── */
function fmtFactor(f: number): string {
  if (f >= 100) {
    const e = Math.round(Math.log10(f));
    return `10${supScript(e)}`;
  }
  return f.toFixed(f < 10 ? 1 : 0);
}

/* ── Reto de cálculo: iones H⁺ frente al agua (escala logarítmica) ────────── */
function PrediccionPhCard({
  accent, phLive, mejor, onResultado, playSfx,
}: {
  accent: string;
  phLive: number;
  mejor: number;
  onResultado: (estrellas: number) => void;
  playSfx?: (ok: boolean) => void;
}) {
  const [snap, setSnap] = useState<number | null>(null);
  const [val, setVal] = useState("");
  const [intentos, setIntentos] = useState(0);
  const [check, setCheck] = useState(false);
  const [estrellas, setEstrellas] = useState<number | null>(null);

  const tomarLectura = () => {
    setSnap(Number(phLive.toFixed(2)));
    setVal(""); setIntentos(0); setCheck(false); setEstrellas(null);
  };

  const expDiff = snap !== null ? 7 - snap : 0;
  const absExp = Math.abs(expDiff);
  const esAcido = expDiff > 0.05;
  const esBase = expDiff < -0.05;
  const factorEsp = Math.pow(10, absExp);
  const dir = esAcido ? "más" : esBase ? "menos" : "igual";

  const num = Number((val || "").trim().replace(",", "."));
  const okActual =
    snap !== null && val.trim() !== "" && !Number.isNaN(num) && num > 0 &&
    Math.abs(Math.log10(num) - absExp) <= 0.2;

  const comprobar = () => {
    if (snap === null || val.trim() === "") return;
    const n = intentos + 1;
    setIntentos(n);
    setCheck(true);
    if (okActual) {
      const est = n <= 1 ? 3 : n === 2 ? 2 : 1;
      setEstrellas(est);
      onResultado(est);
    }
    playSfx?.(okActual);
  };

  return (
    <div style={{ ...card, padding: "18px 22px 20px" }}>
      <Eyebrow>
        <i className="fa-solid fa-calculator" style={{ marginRight: 8, color: accent }} />
        Reto: calcula los iones H⁺
      </Eyebrow>

      {snap === null ? (
        <>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55, marginBottom: 14 }}>
            La escala de pH es <strong style={{ color: "#fff" }}>logarítmica</strong>: cada unidad de pH equivale a <strong style={{ color: accent }}>×10</strong> en la concentración de iones H⁺. Toma una lectura del visor y calcula cuántas veces difiere del agua pura.
          </div>
          <button className="calc-btn calc-btn-primary" onClick={tomarLectura} style={{ width: "100%" }}>
            <i className="fa-solid fa-crosshairs" /> Tomar lectura del visor (pH {fmtPh(phLive)})
          </button>
        </>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
            <Snap label="pH medido" value={fmtPh(snap)} accent={accent} />
            <i className="fa-solid fa-arrow-right" style={{ color: T.text3 }} />
            <Snap label="agua pura" value="7.00" accent={accent} />
          </div>

          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55, marginBottom: 12 }}>
            ¿Cuántas veces <strong style={{ color: "#fff" }}>{dir === "igual" ? "más o menos" : dir}</strong> concentración de iones H⁺ tiene esta disolución respecto al agua pura?{" "}
            <span style={{ color: T.text3 }}>Pista: {absExp < 0.05 ? "el pH es 7" : `la diferencia es ${absExp.toFixed(absExp % 1 === 0 ? 0 : 1)} unidad(es) de pH`}.</span>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "stretch", marginBottom: 6 }}>
            <input
              className="calc-in"
              inputMode="decimal"
              placeholder="número de veces"
              value={val}
              onChange={(e) => { setVal(e.target.value); setCheck(false); }}
              onKeyDown={(e) => { if (e.key === "Enter") comprobar(); }}
              style={{ flex: 1 }}
            />
            <button className="calc-btn calc-btn-primary" onClick={comprobar} disabled={val.trim() === ""}>
              <i className="fa-solid fa-check" /> Comprobar
            </button>
          </div>

          {check && (
            <div style={{ fontSize: 12.5, lineHeight: 1.55, marginTop: 10, padding: "11px 13px", borderRadius: 11,
              border: `1px solid ${okActual ? OK : WARN}55`, background: okActual ? `${OK}14` : `${WARN}12`, color: okActual ? OK : WARN }}>
              {okActual ? (
                <>
                  <strong>¡Correcto!</strong> Hay <strong>{fmtFactor(factorEsp)}</strong> veces {dir} H⁺ que el agua{" "}
                  {esAcido ? "(disolución ácida)" : esBase ? "(disolución básica)" : "(es neutra)"}: [H⁺] = 10<sup>−{fmtPh(snap)}</sup> M.
                </>
              ) : (
                <>
                  Aún no. La diferencia de pH es <strong>{absExp.toFixed(absExp % 1 === 0 ? 0 : 1)}</strong> unidad(es), así que el factor es 10<sup>{absExp.toFixed(absExp % 1 === 0 ? 0 : 1)}</sup> = <strong>{fmtFactor(factorEsp)}</strong>. Vuelve a intentarlo.
                </>
              )}
            </div>
          )}

          {estrellas !== null && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
              <div style={{ display: "flex", gap: 3 }}>
                {[1, 2, 3].map((s) => (
                  <i key={s} className="fa-solid fa-star" style={{ fontSize: 16, color: s <= estrellas ? "#FBBF24" : "rgba(255,255,255,0.16)" }} />
                ))}
              </div>
              <span style={{ fontSize: 11.5, color: T.text3, fontWeight: 700 }}>
                {estrellas === 3 ? "¡A la primera!" : estrellas === 2 ? "Bien hecho" : "Resuelto"}
                {mejor > 0 && ` · Mejor: ${mejor}★`}
              </span>
            </div>
          )}

          <button className="calc-btn calc-btn-ghost" onClick={tomarLectura} style={{ width: "100%", marginTop: 12, background: "transparent" }}>
            <i className="fa-solid fa-rotate-left" /> Tomar otra lectura
          </button>
        </>
      )}
    </div>
  );
}

/* ── Mini-tarjeta de lectura capturada ───────────────────────────────────── */
function Snap({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div style={{ padding: "8px 14px", borderRadius: 11, border: `1px solid ${accent}44`, background: `${accent}10`, textAlign: "center" }}>
      <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: "0.1em", color: T.text3, textTransform: "uppercase" }}>{label}</div>
      <div style={{ ...NUM, fontSize: 18, fontWeight: 900, color: "#fff" }}>{value}</div>
    </div>
  );
}

/* ── Chip de sustancia ───────────────────────────────────────────────────── */
function ChipSust({ s, on, onClick }: { s: Sustancia; on: boolean; onClick: () => void }) {
  const col = colorCol(s.ph);
  return (
    <button className="ph-chip" data-on={on} onClick={onClick} title={s.nombre}>
      <span style={{ width: 16, height: 16, borderRadius: 5, background: col, border: "1px solid rgba(255,255,255,0.4)", flexShrink: 0 }} />
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "block", color: "#fff", fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.nombre}</span>
        <span style={{ display: "block", fontSize: 10.5, color: T.text3, fontWeight: 700 }}>pH {s.phTexto}</span>
      </span>
    </button>
  );
}

/* ── Curva de titulación (SVG inline) ────────────────────────────────────── */
function CurvaTitulacion({ curva, gotas, accent }: { curva: { gota: number; ph: number }[]; gotas: number; accent: string }) {
  const W = 320, H = 150, PL = 30, PB = 22, PT = 8, PR = 8;
  const x = (g: number) => PL + (g / GOTAS_MAX) * (W - PL - PR);
  const y = (ph: number) => PT + (1 - ph / 14) * (H - PT - PB);
  const pts = curva.map((p) => `${x(p.gota).toFixed(1)},${y(p.ph).toFixed(1)}`).join(" ");
  const cur = curva.find((p) => p.gota === gotas) ?? curva[0]!;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      {/* rejilla pH 0,7,14 */}
      {[0, 7, 14].map((g) => (
        <g key={g}>
          <line x1={PL} y1={y(g)} x2={W - PR} y2={y(g)} stroke="rgba(255,255,255,0.12)" strokeWidth={1} strokeDasharray={g === 7 ? "3 3" : undefined} />
          <text x={PL - 5} y={y(g) + 3} textAnchor="end" fontSize={9} fill="rgba(255,255,255,0.5)">{g}</text>
        </g>
      ))}
      {/* línea de equivalencia */}
      <line x1={x(GOTAS_EQ)} y1={PT} x2={x(GOTAS_EQ)} y2={H - PB} stroke={`${accent}66`} strokeWidth={1} strokeDasharray="4 3" />
      <text x={x(GOTAS_EQ)} y={H - 8} textAnchor="middle" fontSize={8.5} fill={accent} fontWeight={700}>equivalencia</text>
      {/* curva */}
      <polyline points={pts} fill="none" stroke={accent} strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round" />
      {/* punto actual */}
      <circle cx={x(cur.gota)} cy={y(cur.ph)} r={4.5} fill="#fff" stroke={accent} strokeWidth={2} />
      <text x={x(cur.gota)} y={y(cur.ph) - 8} textAnchor="middle" fontSize={9.5} fill="#fff" fontWeight={800}>pH {fmtPh(cur.ph)}</text>
      {/* eje x */}
      <text x={(PL + W - PR) / 2} y={H - 1} textAnchor="middle" fontSize={8.5} fill="rgba(255,255,255,0.4)">gotas de NaOH →</text>
    </svg>
  );
}

/* ── Barra del buffer ────────────────────────────────────────────────────── */
function BarraBuffer({ b }: { b: typeof BUFFER[number] }) {
  const delta = Math.abs(b.phAntes - b.phDespues);
  const pct = (ph: number) => `${(ph / 14) * 100}%`;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
        <i className={`fa-solid ${b.icono}`} style={{ color: T.text2, fontSize: 12, width: 16, textAlign: "center" }} />
        <span style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>{b.nombre}</span>
        <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 800, color: delta > 1 ? "#FB7185" : "#34D399", fontFamily: "ui-monospace, monospace" }}>
          ΔpH {delta.toFixed(1)}
        </span>
      </div>
      <div style={{ position: "relative", height: 10, borderRadius: 6, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: pct(Math.min(b.phAntes, b.phDespues)), width: `${(delta / 14) * 100}%`, top: 0, bottom: 0, background: delta > 1 ? "rgba(251,113,133,0.5)" : "rgba(52,211,153,0.5)" }} />
        <div style={{ position: "absolute", left: pct(b.phDespues), top: -2, bottom: -2, width: 2, background: "#fff" }} />
        <div style={{ position: "absolute", left: pct(b.phAntes), top: -2, bottom: -2, width: 2, background: "rgba(255,255,255,0.5)" }} />
      </div>
      <div style={{ fontSize: 10.5, color: T.text3, marginTop: 4 }}>
        pH {b.phAntes} → <strong style={{ color: "#fff" }}>{b.phDespues}</strong> · {b.nota}
      </div>
    </div>
  );
}
