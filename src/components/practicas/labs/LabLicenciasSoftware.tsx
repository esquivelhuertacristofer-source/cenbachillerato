"use client";

/**
 * Laboratorio — Licencias digitales: ¿libre o privativo?
 * Práctica experimental para CD-I-P02-A2 (Cultura Digital I · licenciamiento).
 *
 * Interactividad máxima. Cuatro modos: los tres de arrastrar/clasificar y, al
 * final, uno que se escribe («Completa el texto», verbatim de la progresión):
 *  1. «¿Libre o privativo?»  — clasifica seis programas en dos contenedores
 *     (Windows / Office / Photoshop vs GNU/Linux / LibreOffice / Firefox).
 *  2. «Creative Commons»     — empareja cada licencia (CC BY, CC BY-SA,
 *     CC BY-NC, CC BY-NC-ND) con el permiso que concede.
 *  3. «Las cuatro libertades»— ordena de 0 a 3 las libertades del software libre.
 *  + Cuestionario de comprensión.
 *
 * DOM puro (sin three.js): ligero, accesible (ratón, teclado y táctil mediante
 * clic-para-seleccionar / clic-para-colocar). Contenido VERBATIM de CD-I·P02
 * (A1/A2/A5) y CD-I·P09-A1.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { LICENCIAS_SOFTWARE_HUECOS } from "./licencias-software-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { LICENCIAS_SOFTWARE_FICHA } from "./licencias-software-ficha";
import {
  PROGRAMAS,
  TIPO_INFO,
  LICENCIAS_CC,
  LIBERTADES,
  QUIZ,
  DATO_LICENCIAS,
  type TipoLic,
} from "./licencias-software-data";

const NO = "#FF5E5E";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
const RETO_KEY = "cen-licencias-software-reto";

type Modo = "clasificar" | "creativecommons" | "libertades" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "clasificar", label: "¿Libre o privativo?", icono: "fa-scale-balanced" },
  { id: "creativecommons", label: "Creative Commons", icono: "fa-copyright" },
  { id: "libertades", label: "Las cuatro libertades", icono: "fa-dove" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

const porTexto = (a: { texto: string }, b: { texto: string }) => a.texto.localeCompare(b.texto, "es");

export function LabLicenciasSoftware({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("clasificar");

  // ── sonido ────────────────────────────────────────────────────────────
  const partida = usePartida();
  const [sonido, setSonido] = useState(false);
  const [drawer, setDrawer] = useState(false);
  // Modo «Completa el texto». El contador sirve de `key`: subirlo remonta
  // el componente y devuelve todos los huecos en blanco.
  const [textoDone, setTextoDone] = useState(false);
  const [textoIntento, setTextoIntento] = useState(0);
  const audioRef = useRef<LabSfx | null>(null);
  useEffect(() => () => audioRef.current?.dispose(), []);
  const toggleSonido = async () => {
    if (!sonido) {
      if (!audioRef.current) audioRef.current = new LabSfx();
      await audioRef.current.enable();
      setSonido(true);
    } else {
      audioRef.current?.mute();
      setSonido(false);
    }
  };
  // Los tres ayudantes son el único punto por el que pasan todos los aciertos
  // y todos los fallos del laboratorio, así que la partida se lleva aquí.
  // `sfxOk` no cuenta: marca el fin de un modo, no una respuesta suelta.
  const sfxOk = () => sonido && audioRef.current?.correcto();
  const sfxNo = () => {
    partida.error();
    return sonido && audioRef.current?.incorrecto();
  };
  const sfxPlace = () => {
    partida.acierto();
    return sonido && audioRef.current?.blip();
  };

  // ── modo Clasificar (programa → privativo/libre) ──────────────────────
  const [ubicProg, setUbicProg] = useState<Record<string, TipoLic>>({});
  const [selProg, setSelProg] = useState<string | null>(null);
  const [shakeTipo, setShakeTipo] = useState<TipoLic | null>(null);
  const progLibres = PROGRAMAS.filter((p) => !ubicProg[p.id]).slice().sort(porTexto);

  const intentarProg = (progId: string, tipo: TipoLic) => {
    const p = PROGRAMAS.find((x) => x.id === progId);
    if (!p || ubicProg[progId]) return;
    if (p.tipo === tipo) {
      setUbicProg((u) => ({ ...u, [progId]: tipo }));
      setSelProg(null);
      sfxPlace();
      if (Object.keys(ubicProg).length + 1 >= PROGRAMAS.length) {
        sfxOk();
        persistMejor(true, ccDone, libertadesDone);
      }
    } else {
      setShakeTipo(tipo);
      sfxNo();
      window.setTimeout(() => setShakeTipo(null), 420);
    }
  };
  const resetProg = () => {
    setUbicProg({});
    setSelProg(null);
  };

  // ── modo Creative Commons (licencia → permiso) ────────────────────────
  const [empCC, setEmpCC] = useState<Record<string, boolean>>({});
  const [selCC, setSelCC] = useState<string | null>(null);
  const [shakeRow, setShakeRow] = useState<string | null>(null);
  const ccLibres = LICENCIAS_CC.filter((l) => !empCC[l.id]).slice().sort((a, b) => a.sigla.localeCompare(b.sigla, "es"));

  const intentarCC = (ccId: string, rowId: string) => {
    if (empCC[rowId]) return;
    if (ccId === rowId) {
      setEmpCC((e) => ({ ...e, [rowId]: true }));
      setSelCC(null);
      sfxPlace();
      if (Object.keys(empCC).length + 1 >= LICENCIAS_CC.length) {
        sfxOk();
        persistMejor(clasificarDone, true, libertadesDone);
      }
    } else {
      setShakeRow(rowId);
      sfxNo();
      window.setTimeout(() => setShakeRow(null), 420);
    }
  };
  const resetCC = () => {
    setEmpCC({});
    setSelCC(null);
  };

  // ── modo Libertades (ordenar 0→3) ─────────────────────────────────────
  const [ordenLib, setOrdenLib] = useState<number[]>([]);
  const [selLib, setSelLib] = useState<number | null>(null);
  const [shakeLib, setShakeLib] = useState(false);
  const libLibres = LIBERTADES.filter((l) => !ordenLib.includes(l.numero))
    .slice()
    .sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarLib = (numero: number) => {
    if (ordenLib.includes(numero)) return;
    const next = ordenLib.length; // posición esperada = el número de libertad next (0,1,2,3)
    if (numero === next) {
      const nuevo = [...ordenLib, numero];
      setOrdenLib(nuevo);
      setSelLib(null);
      sfxPlace();
      if (nuevo.length >= LIBERTADES.length) {
        sfxOk();
        persistMejor(clasificarDone, ccDone, true);
      }
    } else {
      setShakeLib(true);
      sfxNo();
      window.setTimeout(() => setShakeLib(false), 420);
    }
  };
  const resetLib = () => {
    setOrdenLib([]);
    setSelLib(null);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso / estrellas ──────────────────────────────────────────────
  const clasificarDone = Object.keys(ubicProg).length >= PROGRAMAS.length;
  const ccDone = Object.keys(empCC).length >= LICENCIAS_CC.length;
  const libertadesDone = ordenLib.length >= LIBERTADES.length;
  const modosHechos = (clasificarDone ? 1 : 0) + (ccDone ? 1 : 0) + (libertadesDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los 3 modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 4);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);

  const persistMejor = (a: boolean, b: boolean, c: boolean) => {
    const est = (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0);
    registraEstrellas(est);
  };

  const objetivos = [
    { txt: "Clasifica los 6 programas (libre / privativo)", done: clasificarDone },
    { txt: "Empareja las 4 licencias Creative Commons", done: ccDone },
    { txt: "Ordena las 4 libertades del software libre", done: libertadesDone },
    { txt: "Consigue 3★ (una por cada modo)", done: bestEstrellas >= 3 },
    { txt: "Aprueba el cuestionario de comprensión", done: quizAprobado },
  ];

  // arrastre nativo
  const dragProps = (id: string) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.setData("text/plain", id);
      e.dataTransfer.effectAllowed = "move";
    },
  });
  const dropProps = (onDrop: (id: string) => void) => ({
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      const id = e.dataTransfer.getData("text/plain");
      if (id) onDrop(id);
    },
    role: "button" as const,
    tabIndex: 0,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        (e.currentTarget as HTMLElement).click();
      }
    },
  });

  const resetTexto = () => {
    setTextoDone(false);
    setTextoIntento((n) => n + 1);
  };
  const resetActual = modo === "texto" ? resetTexto : modo === "clasificar" ? resetProg : modo === "creativecommons" ? resetCC : resetLib;

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes licShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes licPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .lic-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 16px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .lic-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .lic-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .lic-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .lic-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .lic-icobtn:hover { background:rgba(255,255,255,0.12); }
        .lic-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:999px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14.5px; font-weight:800; transition:all .14s; user-select:none; }
        .lic-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
        .lic-chip[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
        .lic-chip:active { cursor:grabbing; }
        .lic-bin { border-radius:16px; border:2px dashed ${T.lineStrong}; padding:16px; min-height:150px; transition:all .16s; }
        .lic-bin[data-shake="true"] { animation:licShake .4s; }
        .lic-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:13px 15px; transition:all .16s; display:flex; align-items:center; gap:14px; }
        .lic-row[data-shake="true"] { animation:licShake .4s; border-color:${NO}; }
        .lic-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
        .lic-drop { flex-shrink:0; min-width:118px; min-height:46px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
          display:flex; align-items:center; justify-content:center; color:${T.text3}; font-size:12.5px; transition:all .16s; cursor:pointer; }
        .lic-drop[data-armed="true"] { border-color:${accent}; background:rgba(${color.rgba},0.1); }
        .lic-slot { display:flex; align-items:center; gap:12px; border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:12px 15px; transition:all .16s; }
        .lic-slot[data-active="true"] { border-color:${accent}; background:rgba(${color.rgba},0.08); cursor:pointer; }
        .lic-slot[data-shake="true"] { animation:licShake .4s; border-color:${NO}; }
        .lic-num { flex-shrink:0; width:34px; height:34px; border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:900; }
        .lic-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
        .lic-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
        .lic-q:disabled{ cursor:default; }
        .lic-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .lic-btn:hover { border-color:${T.lineStrong}; }
        .lic-divider { height:1px; background:${T.line}; margin:18px 0; }
        @media (prefers-reduced-motion: reduce){ .lic-bin[data-shake="true"], .lic-row[data-shake="true"], .lic-slot[data-shake="true"] { animation:none; } }

        /* Cajón de teoría */
        .lic-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .lic-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .lic-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .lic-drawer[data-open="true"] { transform:translateX(0); }
        .lic-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .lic-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .lic-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .lic-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .lic-teoria-fab { position:fixed; right:20px; bottom:20px; z-index:58; cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.86); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .lic-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
        @media (max-width: 640px){ .lic-teoria-fab { right:12px; bottom:12px; padding:10px 13px; font-size:12px; } }

        /* Identidad del tablero */
        .lic-bin, .lic-row { --tono:188; position:relative;
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
        .lic-bin:nth-of-type(6n+1), .lic-row:nth-of-type(6n+1) { --tono:188; }
        .lic-bin:nth-of-type(6n+2), .lic-row:nth-of-type(6n+2) { --tono:262; }
        .lic-bin:nth-of-type(6n+3), .lic-row:nth-of-type(6n+3) { --tono:44; }
        .lic-bin:nth-of-type(6n+4), .lic-row:nth-of-type(6n+4) { --tono:152; }
        .lic-bin:nth-of-type(6n+5), .lic-row:nth-of-type(6n+5) { --tono:330; }
        .lic-bin:nth-of-type(6n+6), .lic-row:nth-of-type(6n+6) { --tono:18; }
        .lic-bin::before, .lic-row::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
          background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
        .lic-bin[data-done="true"], .lic-row[data-done="true"] {
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }
        .lic-chip { transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
        .lic-chip:hover { transform:translateY(-2px); }
        .lic-chip[data-sel="true"] { transform:translateY(-3px) scale(1.02); }
        @media (prefers-reduced-motion: reduce){
          .lic-chip, .lic-chip:hover, .lic-chip[data-sel="true"] { transform:none; transition:none; }
        }
      `}</style>

      {/* selector de modo + toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        {MODOS.map((m) => (
          <button key={m.id} className="lic-tab" data-on={modo === m.id} onClick={() => setModo(m.id)}>
            <i className={`fa-solid ${m.icono}`} />
            {m.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
        <button className="lic-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría de la práctica">
          <i className="fa-solid fa-book-open" />
        </button>
        <button className="lic-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
          <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
        </button>
        <button className="lic-icobtn" onClick={resetActual} title="Reiniciar este modo">
          <i className="fa-solid fa-rotate-left" />
        </button>
      </div>

      {/* ── Cajón de teoría ──────────────────────────────────────────── */}
      <button className="lic-teoria-fab" onClick={() => setDrawer(true)}>
        <i className="fa-solid fa-book-open" />
        Teoría
      </button>
      <div className="lic-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="lic-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="lic-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="lic-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="lic-drawer-body">
          <FichaTeorica data={LICENCIAS_SOFTWARE_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,28vw,400px)", gap: 22, alignItems: "start" }}>
        {/* ── Columna principal ─────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {/* MODO 1 — clasificar */}
          {/* MODO — completa el texto (fill_blanks verbatim de la progresión) */}
          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={LICENCIAS_SOFTWARE_HUECOS}
              accent={accent}
              rgba={color.rgba}
              completado={textoDone}
              onCompletado={() => {
                setTextoDone(true);
                sfxOk();
              }}
              onAcierto={sfxPlace}
              onError={sfxNo}
            />
          )}

          {modo === "clasificar" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada programa a su tipo de licencia</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: clasificarDone ? OK : T.text3 }}>
                    {Object.keys(ubicProg).length}/{PROGRAMAS.length}
                  </span>
                </div>
                {progLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Clasificaste los 6 programas!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {progLibres.map((p) => (
                      <button key={p.id} className="lic-chip" data-sel={selProg === p.id} onClick={() => setSelProg((s) => (s === p.id ? null : p.id))} {...dragProps(p.id)}>
                        <i className="fa-solid fa-cube" style={{ fontSize: 12, opacity: 0.7 }} />
                        {p.texto}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <BinsClasificar selProg={selProg} shakeTipo={shakeTipo} ubicProg={ubicProg} onBin={intentarProg} dropProps={dropProps} />
            </>
          )}

          {/* MODO 2 — Creative Commons (emparejar) */}
          {modo === "creativecommons" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada licencia hasta el permiso que concede</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: ccDone ? OK : T.text3 }}>
                    {Object.keys(empCC).length}/{LICENCIAS_CC.length}
                  </span>
                </div>
                {ccLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Emparejaste las 4 licencias!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {ccLibres.map((l) => (
                      <button key={l.id} className="lic-chip" data-sel={selCC === l.id} onClick={() => setSelCC((s) => (s === l.id ? null : l.id))} {...dragProps(l.id)}>
                        <i className="fa-solid fa-copyright" style={{ fontSize: 13, opacity: 0.85 }} />
                        {l.sigla}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <RowsCC selCC={selCC} shakeRow={shakeRow} empCC={empCC} onMatch={intentarCC} dropProps={dropProps} />
            </>
          )}

          {/* MODO 3 — Las cuatro libertades (ordenar) */}
          {modo === "libertades" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>
                    <i className="fa-solid fa-dove" style={{ marginRight: 8, color: accent }} />
                    Ordena las libertades de la 0 a la 3
                  </Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: libertadesDone ? OK : T.text3 }}>{ordenLib.length}/{LIBERTADES.length}</span>
                </div>
                <div style={{ fontSize: 12, color: T.text3, marginBottom: 14, lineHeight: 1.5 }}>
                  El software libre se define por cuatro libertades numeradas. Colócalas en orden, empezando por la libertad 0.
                </div>

                <SlotsLibertades ordenLib={ordenLib} selLib={selLib} shakeLib={shakeLib} onPlace={intentarLib} dropProps={dropProps} accent={accent} rgba={color.rgba} />
              </div>

              <div style={{ ...card, padding: "18px 22px" }}>
                <Eyebrow>Libertades — arrástralas en orden</Eyebrow>
                {libLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Ordenaste las cuatro libertades!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {libLibres.map((l) => (
                      <button
                        key={l.numero}
                        className="lic-slot"
                        data-active={true}
                        style={{ textAlign: "left", width: "100%", cursor: "grab" }}
                        data-sel={selLib === l.numero}
                        onClick={() => setSelLib((s) => (s === l.numero ? null : l.numero))}
                        {...dragProps(String(l.numero))}
                      >
                        <span className="lic-num" style={{ background: selLib === l.numero ? `${accent}33` : T.inset, color: selLib === l.numero ? "#fff" : T.text2, border: `1px solid ${selLib === l.numero ? accent : T.line}` }}>
                          <i className="fa-solid fa-grip-vertical" style={{ fontSize: 12 }} />
                        </span>
                        <span style={{ fontSize: 13, color: "#fff", fontWeight: 600, lineHeight: 1.4 }}>{l.texto}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Columna lateral ───────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ ...card, padding: "20px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
              Objetivos
            </Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {objetivos.map((o, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: o.done ? OK : T.text2 }}>
                  <i className={`fa-solid ${o.done ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 15, opacity: o.done ? 1 : 0.3 }} />
                  <span style={{ fontWeight: o.done ? 700 : 500 }}>{o.txt}</span>
                </div>
              ))}
            </div>

            <div className="lic-divider" />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: T.text3, textTransform: "uppercase" }}>Puntuación</div>
                <div style={{ display: "flex", gap: 4, marginTop: 5 }}>
                  {[1, 2, 3].map((s) => (
                    <i key={s} className="fa-solid fa-star" style={{ fontSize: 18, color: s <= bestEstrellas ? "#FFC75A" : "rgba(255,255,255,0.16)" }} />
                  ))}
                </div>
              </div>
              <div style={{ textAlign: "right", maxWidth: 180 }}>
                <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.45 }}>
                  {bestEstrellas >= 3 ? "¡Dominas las licencias digitales!" : "Termina los tres modos para ganar 2★; la tercera pide 2 errores o menos."}
                </div>
              </div>
            </div>
          </div>

          {/* pista del modo actual */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid rgba(${color.rgba},0.3)`, background: `rgba(${color.rgba},0.08)`, fontSize: 13, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>
              {modo === "clasificar" && (
                <>El software <strong style={{ color: T.text }}>privativo</strong> tiene código secreto (Windows, Office, Photoshop); el <strong style={{ color: T.text }}>libre</strong> se puede estudiar y modificar (GNU/Linux, LibreOffice, Firefox).</>
              )}
              {modo === "creativecommons" && (
                <>Las licencias <strong style={{ color: T.text }}>Creative Commons</strong> son para contenidos creativos. A más siglas (NC, ND), más restricciones: la más restrictiva es <strong style={{ color: T.text }}>CC BY-NC-ND</strong>.</>
              )}
              {modo === "libertades" && (
                <>Truco: van de menor a mayor compromiso con la comunidad — <strong style={{ color: T.text }}>usar (0) → estudiar (1) → distribuir (2) → mejorar (3)</strong>.</>
              )}
            </span>
          </div>

          {/* dato verbatim */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid ${T.line}`, background: T.glass, fontSize: 12.5, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-circle-info" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>{DATO_LICENCIAS}</span>
          </div>
        </div>
      </div>

      <QuizCard accent={accent} rgba={color.rgba} aprobado={quizAprobado} onAprobado={() => setQuizAprobado(true)} playSfx={sonido ? (ok) => (ok ? sfxOk() : sfxNo()) : undefined} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Paneles de cada modo (componentes hijos: reciben los manejadores como props,
 * así el linter no rastrea el acceso al ref de audio hasta el render del map).
 * ═══════════════════════════════════════════════════════════════════════════ */
type DropFactory = (onDrop: (id: string) => void) => {
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
};

function BinsClasificar({
  selProg,
  shakeTipo,
  ubicProg,
  onBin,
  dropProps,
}: {
  selProg: string | null;
  shakeTipo: TipoLic | null;
  ubicProg: Record<string, TipoLic>;
  onBin: (progId: string, tipo: TipoLic) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      {(["privativo", "libre"] as TipoLic[]).map((tipo) => {
        const info = TIPO_INFO[tipo];
        const dentro = PROGRAMAS.filter((p) => ubicProg[p.id] === tipo);
        return (
          <div
            key={tipo}
            className="lic-bin"
            data-shake={shakeTipo === tipo}
            onClick={() => selProg && onBin(selProg, tipo)}
            {...dropProps((id) => onBin(id, tipo))}
            style={{ borderColor: `${info.color}66`, background: `${info.color}0d`, cursor: selProg ? "pointer" : "default" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ width: 32, height: 32, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#fff", background: `${info.color}33` }}>
                <i className={`fa-solid ${info.icono}`} />
              </span>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff" }}>{info.label}</div>
                <div style={{ fontSize: 10.5, color: T.text3, lineHeight: 1.3 }}>{info.descripcion}</div>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {dentro.map((d) => (
                <span key={d.id} style={{ animation: "licPop .25s ease", fontSize: 13.5, fontWeight: 800, color: "#fff", padding: "7px 13px", borderRadius: 999, background: `${info.color}26`, border: `1px solid ${info.color}55` }}>
                  {d.texto}
                </span>
              ))}
              {dentro.length === 0 && <span style={{ fontSize: 11.5, color: T.text3, fontStyle: "italic" }}>Suelta aquí…</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RowsCC({
  selCC,
  shakeRow,
  empCC,
  onMatch,
  dropProps,
}: {
  selCC: string | null;
  shakeRow: string | null;
  empCC: Record<string, boolean>;
  onMatch: (ccId: string, rowId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {LICENCIAS_CC.map((l) => {
        const done = empCC[l.id];
        return (
          <div
            key={l.id}
            className="lic-row"
            data-shake={shakeRow === l.id}
            data-done={done}
            onClick={() => !done && selCC && onMatch(selCC, l.id)}
            {...dropProps((id) => onMatch(id, l.id))}
          >
            <div className="lic-drop" data-armed={!done && !!selCC} style={done ? { borderStyle: "solid", borderColor: OK, background: `${OK}1a` } : undefined}>
              {done ? (
                <span style={{ animation: "licPop .25s ease", fontSize: 13.5, fontWeight: 900, color: "#fff", display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <i className="fa-solid fa-copyright" />
                  {l.sigla}
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: 11 }} /> licencia
                </span>
              )}
            </div>
            <div style={{ fontSize: 13, color: done ? "#fff" : T.text2, lineHeight: 1.45 }}>
              {l.permiso}
              {l.restrictiva && (
                <span style={{ marginLeft: 8, fontSize: 10.5, fontWeight: 800, color: NO, border: `1px solid ${NO}55`, borderRadius: 6, padding: "1px 6px" }}>
                  MÁS RESTRICTIVA
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SlotsLibertades({
  ordenLib,
  selLib,
  shakeLib,
  onPlace,
  dropProps,
  accent,
  rgba,
}: {
  ordenLib: number[];
  selLib: number | null;
  shakeLib: boolean;
  onPlace: (numero: number) => void;
  dropProps: DropFactory;
  accent: string;
  rgba: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {LIBERTADES.map((_, i) => {
        const numColocado = ordenLib[i];
        const lib = numColocado !== undefined ? LIBERTADES.find((l) => l.numero === numColocado) : null;
        const esActivo = i === ordenLib.length;
        if (lib) {
          return (
            <div key={i} className="lic-slot" style={{ animation: "licPop .25s ease", borderColor: `${accent}`, background: `rgba(${rgba},0.12)` }}>
              <span className="lic-num" style={{ background: `${accent}33`, color: "#fff" }}>{lib.numero}</span>
              <span style={{ fontSize: 13, color: "#fff", fontWeight: 600, lineHeight: 1.4 }}>{lib.texto}</span>
            </div>
          );
        }
        return (
          <div
            key={i}
            className="lic-slot"
            data-active={esActivo}
            data-shake={esActivo && shakeLib}
            onClick={() => esActivo && selLib !== null && onPlace(selLib)}
            {...(esActivo ? dropProps((id) => onPlace(Number(id))) : {})}
          >
            <span className="lic-num" style={{ background: T.inset, color: T.text3, border: `1px dashed ${T.lineStrong}` }}>{i}</span>
            <span style={{ fontSize: 12.5, color: T.text3, fontStyle: "italic" }}>
              {esActivo ? "Suelta aquí la siguiente libertad…" : "—"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Cuestionario de comprensión
 * ═══════════════════════════════════════════════════════════════════════════ */
function QuizCard({
  accent,
  rgba,
  aprobado,
  onAprobado,
  playSfx,
}: {
  accent: string;
  rgba: string;
  aprobado: boolean;
  onAprobado: () => void;
  playSfx?: (ok: boolean) => void;
}) {
  const [resp, setResp] = useState<(number | null)[]>(() => QUIZ.map(() => null));
  const [comprobado, setComprobado] = useState(false);

  const aciertos = resp.filter((r, i) => r === QUIZ[i]!.correcta).length;
  const total = QUIZ.length;
  const todas = resp.every((r) => r !== null);
  const aprobadoAhora = aciertos === total;

  const elegir = (qi: number, oi: number) => {
    if (comprobado) return;
    setResp((prev) => prev.map((v, i) => (i === qi ? oi : v)));
  };
  const comprobar = () => {
    setComprobado(true);
    const ok = aciertos === total;
    playSfx?.(ok);
    if (ok) onAprobado();
  };
  const reintentar = () => {
    setResp(QUIZ.map(() => null));
    setComprobado(false);
  };

  return (
    <div style={{ ...card, padding: "20px 24px 24px", marginTop: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-clipboard-question" style={{ marginRight: 8, color: accent }} />
          Comprueba lo aprendido
        </Eyebrow>
        {aprobado && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 800, color: OK }}>
            <i className="fa-solid fa-circle-check" /> Aprobado
          </span>
        )}
      </div>
      <div style={{ fontSize: 12.5, color: T.text3, marginBottom: 18, lineHeight: 1.5 }}>
        Cinco preguntas sobre software libre/privativo y licencias Creative Commons. Responde y pulsa «Comprobar».
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {QUIZ.map((q, qi) => {
          const elegida = resp[qi];
          return (
            <div key={qi}>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: T.text, marginBottom: 11, display: "flex", gap: 10 }}>
                <span style={{ color: accent }}>{qi + 1}.</span>
                <span>{q.pregunta}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
                {q.opciones.map((op, oi) => {
                  const sel = elegida === oi;
                  const esCorrecta = oi === q.correcta;
                  let borde = T.line;
                  let fondo = T.glass;
                  let colorTxt = T.text2;
                  if (comprobado && esCorrecta) {
                    borde = OK;
                    fondo = `${OK}1c`;
                    colorTxt = "#fff";
                  } else if (comprobado && sel && !esCorrecta) {
                    borde = NO;
                    fondo = `${NO}1c`;
                    colorTxt = "#fff";
                  } else if (!comprobado && sel) {
                    borde = accent;
                    fondo = `rgba(${rgba},0.16)`;
                    colorTxt = "#fff";
                  }
                  return (
                    <button key={oi} className="lic-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
                      <span style={{ width: 22, height: 22, flexShrink: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, border: `1.5px solid ${sel || (comprobado && esCorrecta) ? "currentColor" : T.line}` }}>
                        {comprobado && esCorrecta ? <i className="fa-solid fa-check" /> : comprobado && sel ? <i className="fa-solid fa-xmark" /> : String.fromCharCode(65 + oi)}
                      </span>
                      <span style={{ flex: 1, lineHeight: 1.35 }}>{op}</span>
                    </button>
                  );
                })}
              </div>
              {comprobado && (
                <div style={{ marginTop: 9, fontSize: 12.5, color: T.text2, lineHeight: 1.5, display: "flex", gap: 9, padding: "9px 12px", borderRadius: 10, background: T.inset, border: `1px solid ${T.line}` }}>
                  <i className="fa-solid fa-circle-info" style={{ color: accent, marginTop: 2 }} />
                  <span>{q.retro}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 22, flexWrap: "wrap" }}>
        {!comprobado ? (
          <button className="lic-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="lic-btn" onClick={reintentar}>
            <i className="fa-solid fa-rotate-left" />
            Reintentar
          </button>
        )}
        {comprobado && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, borderRadius: 12, padding: "10px 16px", border: `1px solid ${aprobadoAhora ? OK : NO}55`, background: `${aprobadoAhora ? OK : NO}14`, fontSize: 13.5, fontWeight: 800, color: aprobadoAhora ? OK : NO }}>
            <i className={`fa-solid ${aprobadoAhora ? "fa-trophy" : "fa-circle-half-stroke"}`} />
            {aciertos} / {total} correctas
            {!aprobadoAhora && <span style={{ color: T.text3, fontWeight: 600 }}>· revisa las marcadas e inténtalo de nuevo</span>}
          </div>
        )}
      </div>
    </div>
  );
}
