"use client";

/**
 * Laboratorio — Constructor de algoritmos.
 * Práctica experimental para CD-I-P11-A2 (Cultura Digital I · lenguaje algorítmico).
 *
 * Interactividad máxima: el alumno EXPERIMENTA construyendo algoritmos. Tres modos:
 *  1. «Construye el algoritmo»: arrastra los bloques del diagrama de flujo
 *     (inicio, entrada, proceso, decisión, salida, fin) hasta ordenarlos y
 *     resolver el problema. Solo avanza si coloca el paso correcto a continuación.
 *  2. «Clasifica los operadores»: arrastra +, −, ×, ÷, >, <, =, ≠, Y, O, NO a su
 *     caja (aritméticos / relacionales / lógicos).
 *  3. «Estructuras de control»: empareja cada situación con su estructura
 *     (secuencial, condicional o repetitiva).
 *  + Cuestionario de comprensión.
 *
 * DOM puro (sin three.js): no infla el bundle del Worker y funciona con ratón,
 * teclado y pantalla táctil (clic-para-seleccionar y clic-para-colocar, además
 * del arrastre nativo HTML5).
 *
 * Contenido VERBATIM de las lecturas A1 de CD-I·P11 y CD-I·P04.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { CONSTRUCTOR_ALGORITMOS_HUECOS } from "./constructor-algoritmos-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { CONSTRUCTOR_ALGORITMOS_FICHA } from "./constructor-algoritmos-ficha";
import {
  PROBLEMAS,
  FORMA_INFO,
  OPERADORES,
  OP_INFO,
  ESTRUCTURAS,
  ESCENARIOS,
  QUIZ,
  DATO_ALGORITMOS,
  type TipoOp,
  type Forma,
} from "./algoritmos-data";

const NO = "#FF5E5E";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
const RETO_KEY = "cen-algoritmos-reto";

type Modo = "construir" | "operadores" | "estructuras" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "construir", label: "Construye el algoritmo", icono: "fa-diagram-project" },
  { id: "operadores", label: "Clasifica operadores", icono: "fa-calculator" },
  { id: "estructuras", label: "Estructuras de control", icono: "fa-code-branch" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

const porTexto = (a: { texto: string }, b: { texto: string }) => a.texto.localeCompare(b.texto, "es");

export function LabConstructorAlgoritmos({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("construir");

  // ── sonido ────────────────────────────────────────────────────────────
  const partida = usePartida();
  const [sonido, setSonido] = useState(false);
  const [drawer, setDrawer] = useState(false);
  // Modo «Completa el texto». El contador sirve de `key`: subirlo remonta
  // el componente y devuelve todos los huecos en blanco.
  const [textoDone, setTextoDone] = useState(false);
  const [textoIntento, setTextoIntento] = useState(0);
  const resetHuecos = () => {
    setTextoDone(false);
    setTextoIntento((v) => v + 1);
  };
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

  // ── modo Construir ────────────────────────────────────────────────────
  const [probIdx, setProbIdx] = useState(0);
  const [colocados, setColocados] = useState<Record<string, string[]>>({});
  const [completados, setCompletados] = useState<Set<string>>(() => new Set<string>());
  const [selPaso, setSelPaso] = useState<string | null>(null);
  const [shakePaso, setShakePaso] = useState(false);

  const problema = PROBLEMAS[probIdx]!;
  const ordenActual = colocados[problema.id] ?? [];
  const pasosLibres = problema.pasos.filter((p) => !ordenActual.includes(p.id)).sort(porTexto);

  const [estrellas, setEstrellas] = useState(0);
  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);

  const intentarPaso = (pasoId: string) => {
    if (ordenActual.includes(pasoId)) return;
    const siguiente = problema.pasos[ordenActual.length];
    if (siguiente && siguiente.id === pasoId) {
      const nuevoOrden = [...ordenActual, pasoId];
      setColocados((c) => ({ ...c, [problema.id]: nuevoOrden }));
      setSelPaso(null);
      sfxPlace();
      if (nuevoOrden.length >= problema.pasos.length) {
        const nuevosComp = new Set(completados).add(problema.id);
        setCompletados(nuevosComp);
        const est = nuevosComp.size;
        setEstrellas(est);
        sfxOk();
        registraEstrellas(est);
      }
    } else {
      setShakePaso(true);
      sfxNo();
      window.setTimeout(() => setShakePaso(false), 420);
    }
  };
  const resetProblema = () => {
    setColocados((c) => ({ ...c, [problema.id]: [] }));
    setSelPaso(null);
  };

  // ── modo Operadores ───────────────────────────────────────────────────
  const [ubicOp, setUbicOp] = useState<Record<string, TipoOp>>({});
  const [selOp, setSelOp] = useState<string | null>(null);
  const [shakeBin, setShakeBin] = useState<TipoOp | null>(null);
  const opLibres = OPERADORES.filter((o) => !ubicOp[o.id]);

  const intentarOp = (opId: string, tipo: TipoOp) => {
    const op = OPERADORES.find((o) => o.id === opId);
    if (!op || ubicOp[opId]) return;
    if (op.tipo === tipo) {
      setUbicOp((u) => ({ ...u, [opId]: tipo }));
      setSelOp(null);
      sfxPlace();
      if (Object.keys(ubicOp).length + 1 >= OPERADORES.length) sfxOk();
    } else {
      setShakeBin(tipo);
      sfxNo();
      window.setTimeout(() => setShakeBin(null), 420);
    }
  };
  const resetOp = () => {
    setUbicOp({});
    setSelOp(null);
  };

  // ── modo Estructuras ──────────────────────────────────────────────────
  const [empar, setEmpar] = useState<Record<string, string>>({}); // escenarioId -> estructuraId
  const [selEstr, setSelEstr] = useState<string | null>(null);
  const [shakeEsc, setShakeEsc] = useState<string | null>(null);
  const estrLibres = ESTRUCTURAS.filter((e) => !Object.values(empar).includes(e.id));

  const intentarEstr = (estrId: string, escId: string) => {
    const esc = ESCENARIOS.find((e) => e.id === escId);
    if (!esc || empar[escId]) return;
    if (esc.estructuraId === estrId) {
      setEmpar((e) => ({ ...e, [escId]: estrId }));
      setSelEstr(null);
      sfxPlace();
      if (Object.keys(empar).length + 1 >= ESCENARIOS.length) sfxOk();
    } else {
      setShakeEsc(escId);
      sfxNo();
      window.setTimeout(() => setShakeEsc(null), 420);
    }
  };
  const resetEstr = () => {
    setEmpar({});
    setSelEstr(null);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso ──────────────────────────────────────────────────────────
  const construirDone = completados.size >= PROBLEMAS.length;
  const opDone = Object.keys(ubicOp).length >= OPERADORES.length;
  const estrDone = Object.keys(empar).length >= ESCENARIOS.length;
  // Los cuatro modos cuentan, no sólo la construcción: el modo de escribir
  // es trabajo real y antes no dejaba marca. La regla de precisión propia de
  // este lab se conserva, y se toma la mejor de las dos.
  const modosHechos = (construirDone ? 1 : 0) + (opDone ? 1 : 0) + (estrDone ? 1 : 0) + (textoDone ? 1 : 0);
  const bestEstrellas = Math.max(estrellas, partida.estrellasCon(modosHechos, 4), mejor);

  const objetivos = [
    { txt: "Construye los 3 algoritmos", done: construirDone },
    { txt: "Clasifica los 11 operadores", done: opDone },
    { txt: "Empareja las 3 estructuras de control", done: estrDone },
    { txt: "Consigue 3★ (un algoritmo armado por estrella)", done: bestEstrellas >= 3 },
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

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes alShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes alPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .al-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 16px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .al-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .al-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .al-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .al-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .al-icobtn:hover { background:rgba(255,255,255,0.12); }
        .al-chip { cursor:grab; display:inline-flex; align-items:center; gap:9px; padding:10px 13px; border-radius:12px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:${T.text}; font-size:13px; font-weight:700; text-align:left;
          transition:all .14s; user-select:none; width:100%; }
        .al-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
        .al-chip[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
        .al-chip:active { cursor:grabbing; }
        .al-opchip { cursor:grab; display:flex; align-items:center; justify-content:center; gap:8px; min-width:60px; padding:12px 14px; border-radius:12px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:18px; font-weight:900; transition:all .14s; user-select:none; }
        .al-opchip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
        .al-opchip[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
        .al-bin { border-radius:16px; border:2px dashed ${T.lineStrong}; padding:16px; min-height:120px; transition:all .16s; }
        .al-bin[data-shake="true"] { animation:alShake .4s; }
        .al-slot { border-radius:12px; border:1.5px dashed ${T.lineStrong}; background:${T.inset}; min-height:54px;
          display:flex; align-items:center; justify-content:center; color:${T.text3}; font-size:12.5px; gap:8px; transition:all .16s; }
        .al-slot[data-active="true"] { border-color:${accent}; background:rgba(${color.rgba},0.1); cursor:pointer; }
        .al-slot[data-shake="true"] { animation:alShake .4s; border-color:${NO}; }
        .al-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
        .al-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
        .al-q:disabled{ cursor:default; }
        .al-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .al-btn:hover { border-color:${T.lineStrong}; }
        .al-prob { cursor:pointer; padding:8px 13px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass};
          color:${T.text2}; font-size:12.5px; font-weight:800; transition:all .14s; }
        .al-prob:hover { border-color:${T.lineStrong}; color:#fff; }
        .al-prob[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; }
        .al-prob[data-done="true"] { color:${OK}; border-color:${OK}66; }
        .al-divider { height:1px; background:${T.line}; margin:18px 0; }
        @media (prefers-reduced-motion: reduce){ .al-slot[data-shake="true"], .al-bin[data-shake="true"] { animation:none; } }

        /* Cajón de teoría */
        .al-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .al-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .al-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .al-drawer[data-open="true"] { transform:translateX(0); }
        .al-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .al-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .al-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .al-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .al-teoria-fab { position:fixed; right:20px; bottom:20px; z-index:58; cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.86); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .al-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
        @media (max-width: 640px){ .al-teoria-fab { right:12px; bottom:12px; padding:10px 13px; font-size:12px; } }

        /* Identidad del tablero */
        .al-bin { --tono:188; position:relative;
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
        .al-bin:nth-of-type(6n+1) { --tono:188; }
        .al-bin:nth-of-type(6n+2) { --tono:262; }
        .al-bin:nth-of-type(6n+3) { --tono:44; }
        .al-bin:nth-of-type(6n+4) { --tono:152; }
        .al-bin:nth-of-type(6n+5) { --tono:330; }
        .al-bin:nth-of-type(6n+6) { --tono:18; }
        .al-bin::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
          background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
        .al-bin[data-done="true"] {
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }
        .al-chip { transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
        .al-chip:hover { transform:translateY(-2px); }
        .al-chip[data-sel="true"] { transform:translateY(-3px) scale(1.02); }
        @media (prefers-reduced-motion: reduce){
          .al-chip, .al-chip:hover, .al-chip[data-sel="true"] { transform:none; transition:none; }
        }
      `}</style>

      {/* selector de modo + toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        {MODOS.map((m) => (
          <button key={m.id} className="al-tab" data-on={modo === m.id} onClick={() => setModo(m.id)}>
            <i className={`fa-solid ${m.icono}`} />
            {m.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
        <button className="al-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría de la práctica">
          <i className="fa-solid fa-book-open" />
        </button>
        <button className="al-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
          <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
        </button>
        <button
          className="al-icobtn"
          onClick={modo === "texto" ? resetHuecos : modo === "construir" ? resetProblema : modo === "operadores" ? resetOp : resetEstr}
          title="Reiniciar este modo"
        >
          <i className="fa-solid fa-rotate-left" />
        </button>
      </div>

      {/* ── Cajón de teoría ──────────────────────────────────────────── */}
      <button className="al-teoria-fab" onClick={() => setDrawer(true)}>
        <i className="fa-solid fa-book-open" />
        Teoría
      </button>
      <div className="al-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="al-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="al-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="al-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="al-drawer-body">
          <FichaTeorica data={CONSTRUCTOR_ALGORITMOS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,28vw,400px)", gap: 22, alignItems: "start" }} className="al-grid">
        {/* ── Columna principal ─────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {/* MODO — completa el texto (fill_blanks verbatim de la progresión) */}
          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={CONSTRUCTOR_ALGORITMOS_HUECOS}
              accent={accent}
              rgba={color.rgba}
              completado={textoDone}
              onCompletado={() => {
                setTextoDone(true);
                sfxOk();
                registraEstrellas(
                  partida.estrellasCon((construirDone ? 1 : 0) + (opDone ? 1 : 0) + (estrDone ? 1 : 0) + 1, 4)
                );
              }}
              onAcierto={sfxPlace}
              onError={sfxNo}
            />
          )}

          {modo === "construir" && (
            <ConstruirPanel
              accent={accent}
              problema={problema}
              probIdx={probIdx}
              ordenActual={ordenActual}
              pasosLibres={pasosLibres}
              selPaso={selPaso}
              shakePaso={shakePaso}
              completado={completados.has(problema.id)}
              onSelProb={(i) => setProbIdx(i)}
              completados={completados}
              onSelPaso={(id) => setSelPaso((p) => (p === id ? null : id))}
              onSlot={() => {
                if (selPaso) intentarPaso(selPaso);
              }}
              onDropSlot={(pasoId) => intentarPaso(pasoId)}
              dragProps={dragProps}
              dropProps={dropProps}
            />
          )}

          {modo === "operadores" && (
            <OperadoresPanel
              ubicOp={ubicOp}
              selOp={selOp}
              shakeBin={shakeBin}
              opLibres={opLibres}
              onSelOp={(id) => setSelOp((p) => (p === id ? null : id))}
              onBin={(tipo) => {
                if (selOp) intentarOp(selOp, tipo);
              }}
              onDropBin={(opId, tipo) => intentarOp(opId, tipo)}
              dragProps={dragProps}
              dropProps={dropProps}
            />
          )}

          {modo === "estructuras" && (
            <EstructurasPanel
              accent={accent}
              rgba={color.rgba}
              empar={empar}
              selEstr={selEstr}
              shakeEsc={shakeEsc}
              estrLibres={estrLibres}
              onSelEstr={(id) => setSelEstr((p) => (p === id ? null : id))}
              onEsc={(escId) => {
                if (selEstr) intentarEstr(selEstr, escId);
              }}
              onDropEsc={(estrId, escId) => intentarEstr(estrId, escId)}
              dragProps={dragProps}
              dropProps={dropProps}
            />
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

            <div className="al-divider" />

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
                  {bestEstrellas >= 3 ? "¡Armaste los 3 algoritmos!" : "Arma cada algoritmo para ganar una estrella."}
                </div>
              </div>
            </div>
          </div>

          {/* pista del modo actual */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid rgba(${color.rgba},0.3)`, background: `rgba(${color.rgba},0.08)`, fontSize: 13, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>
              {modo === "construir" && (
                <>Un <strong style={{ color: T.text }}>algoritmo</strong> es una secuencia ordenada de pasos. Coloca cada bloque en el orden correcto: el siguiente paso se ilumina.</>
              )}
              {modo === "operadores" && (
                <>Los operadores <strong style={{ color: T.text }}>aritméticos</strong> calculan, los <strong style={{ color: T.text }}>relacionales</strong> comparan y los <strong style={{ color: T.text }}>lógicos</strong> combinan condiciones.</>
              )}
              {modo === "estructuras" && (
                <>Las tres estructuras de control: <strong style={{ color: T.text }}>secuencial</strong>, <strong style={{ color: T.text }}>condicional</strong> y <strong style={{ color: T.text }}>repetitiva</strong>.</>
              )}
            </span>
          </div>

          {/* dato verbatim */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid ${T.line}`, background: T.glass, fontSize: 12.5, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-circle-info" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>{DATO_ALGORITMOS}</span>
          </div>
        </div>
      </div>

      <QuizCard
        accent={accent}
        rgba={color.rgba}
        aprobado={quizAprobado}
        onAprobado={() => setQuizAprobado(true)}
        playSfx={sonido ? (ok) => (ok ? sfxOk() : sfxNo()) : undefined}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Bloque del diagrama de flujo (visual por forma)
 * ═══════════════════════════════════════════════════════════════════════════ */
function Bloque({ texto, forma, n }: { texto: string; forma: Forma; n: number }) {
  const info = FORMA_INFO[forma];
  const radius = forma === "terminal" ? 999 : forma === "decision" ? 6 : 12;
  return (
    <div
      style={{
        animation: "alPop .25s ease",
        display: "flex",
        alignItems: "center",
        gap: 11,
        padding: "11px 15px",
        borderRadius: radius,
        border: `1.5px solid ${info.color}`,
        background: `${info.color}1c`,
        borderStyle: forma === "decision" ? "dashed" : "solid",
      }}
    >
      <span style={{ width: 22, height: 22, flexShrink: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, background: `${info.color}33`, color: "#fff" }}>{n}</span>
      <i className={`fa-solid ${info.icono}`} style={{ color: info.color, fontSize: 14, width: 18, textAlign: "center" }} />
      <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: "#fff" }}>{texto}</span>
      <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: "0.06em", color: info.color, textTransform: "uppercase" }}>{info.label}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Panel «Construye el algoritmo»
 * ═══════════════════════════════════════════════════════════════════════════ */
function ConstruirPanel({
  accent,
  problema,
  probIdx,
  ordenActual,
  pasosLibres,
  selPaso,
  shakePaso,
  completado,
  onSelProb,
  completados,
  onSelPaso,
  onSlot,
  onDropSlot,
  dragProps,
  dropProps,
}: {
  accent: string;
  problema: (typeof PROBLEMAS)[number];
  probIdx: number;
  ordenActual: string[];
  pasosLibres: (typeof PROBLEMAS)[number]["pasos"];
  selPaso: string | null;
  shakePaso: boolean;
  completado: boolean;
  onSelProb: (i: number) => void;
  completados: Set<string>;
  onSelPaso: (id: string) => void;
  onSlot: () => void;
  onDropSlot: (id: string) => void;
  dragProps: (id: string) => Record<string, unknown>;
  dropProps: (onDrop: (id: string) => void) => Record<string, unknown>;
}) {
  return (
    <>
      {/* selector de problema */}
      <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
        {PROBLEMAS.map((p, i) => (
          <button key={p.id} className="al-prob" data-on={probIdx === i} data-done={completados.has(p.id)} onClick={() => onSelProb(i)}>
            {completados.has(p.id) && <i className="fa-solid fa-circle-check" style={{ marginRight: 6 }} />}
            {p.titulo}
          </button>
        ))}
      </div>

      {/* enunciado + diagrama */}
      <div style={{ ...card, padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, gap: 10, flexWrap: "wrap" }}>
          <Eyebrow>
            <i className="fa-solid fa-diagram-project" style={{ marginRight: 8, color: accent }} />
            {problema.enunciado}
          </Eyebrow>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: completado ? OK : T.text3 }}>
            {completado ? "Algoritmo completo ✓" : `${ordenActual.length}/${problema.pasos.length} pasos`}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {problema.pasos.map((_, i) => {
            const colocadoId = ordenActual[i];
            const paso = colocadoId ? problema.pasos.find((p) => p.id === colocadoId) : null;
            const esActivo = i === ordenActual.length;
            return (
              <div key={i}>
                {i > 0 && (
                  <div style={{ textAlign: "center", color: T.text3, lineHeight: 0.6, margin: "1px 0" }}>
                    <i className="fa-solid fa-arrow-down" style={{ fontSize: 11, opacity: paso || i <= ordenActual.length ? 0.7 : 0.2 }} />
                  </div>
                )}
                {paso ? (
                  <Bloque texto={paso.texto} forma={paso.forma} n={i + 1} />
                ) : (
                  <div
                    className="al-slot"
                    data-active={esActivo}
                    data-shake={esActivo && shakePaso}
                    onClick={() => esActivo && onSlot()}
                    {...(esActivo ? dropProps((id) => onDropSlot(id)) : {})}
                  >
                    {esActivo ? (
                      <>
                        <i className="fa-solid fa-arrow-down-to-bracket" /> Suelta aquí el paso {i + 1}
                      </>
                    ) : (
                      <span style={{ opacity: 0.4 }}>Paso {i + 1}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* bandeja de bloques */}
      <div style={{ ...card, padding: "18px 22px" }}>
        <Eyebrow>Bloques disponibles — arrástralos en orden</Eyebrow>
        {pasosLibres.length === 0 ? (
          <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
            <i className="fa-solid fa-circle-check" /> ¡Diagrama de flujo completo! Cambia de problema arriba para armar otro.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {pasosLibres.map((p) => {
              const info = FORMA_INFO[p.forma];
              return (
                <button key={p.id} className="al-chip" data-sel={selPaso === p.id} onClick={() => onSelPaso(p.id)} {...dragProps(p.id)} title={info.label}>
                  <span style={{ width: 28, height: 28, flexShrink: 0, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: info.color, background: `${info.color}22` }}>
                    <i className={`fa-solid ${info.icono}`} />
                  </span>
                  <span style={{ flex: 1, fontSize: 12.5 }}>{p.texto}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Panel «Clasifica los operadores»
 * ═══════════════════════════════════════════════════════════════════════════ */
function OperadoresPanel({
  ubicOp,
  selOp,
  shakeBin,
  opLibres,
  onSelOp,
  onBin,
  onDropBin,
  dragProps,
  dropProps,
}: {
  ubicOp: Record<string, TipoOp>;
  selOp: string | null;
  shakeBin: TipoOp | null;
  opLibres: typeof OPERADORES;
  onSelOp: (id: string) => void;
  onBin: (tipo: TipoOp) => void;
  onDropBin: (opId: string, tipo: TipoOp) => void;
  dragProps: (id: string) => Record<string, unknown>;
  dropProps: (onDrop: (id: string) => void) => Record<string, unknown>;
}) {
  const tipos: TipoOp[] = ["aritmetico", "relacional", "logico"];
  const colocados = Object.keys(ubicOp).length;
  return (
    <>
      <div style={{ ...card, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
          <Eyebrow>Arrastra cada operador a su caja</Eyebrow>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: colocados >= OPERADORES.length ? OK : T.text3 }}>{colocados}/{OPERADORES.length}</span>
        </div>
        {opLibres.length === 0 ? (
          <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
            <i className="fa-solid fa-circle-check" /> ¡Clasificaste los 11 operadores!
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {opLibres.map((op) => (
              <button key={op.id} className="al-opchip" data-sel={selOp === op.id} onClick={() => onSelOp(op.id)} {...dragProps(op.id)}>
                {op.simbolo}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }} className="al-bins">
        {tipos.map((tipo) => {
          const info = OP_INFO[tipo];
          const dentro = OPERADORES.filter((o) => ubicOp[o.id] === tipo);
          return (
            <div
              key={tipo}
              className="al-bin"
              data-shake={shakeBin === tipo}
              onClick={() => onBin(tipo)}
              {...dropProps((opId) => onDropBin(opId, tipo))}
              style={{ borderColor: `${info.color}66`, background: `${info.color}0d`, cursor: selOp ? "pointer" : "default" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
                <span style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#fff", background: `${info.color}33` }}>
                  <i className={`fa-solid ${info.icono}`} />
                </span>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 900, color: "#fff" }}>{info.label}</div>
                  <div style={{ fontSize: 10.5, color: T.text3 }}>{info.descripcion}</div>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {dentro.map((op) => (
                  <span key={op.id} style={{ animation: "alPop .25s ease", display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 34, padding: "6px 9px", borderRadius: 8, fontSize: 15, fontWeight: 900, color: "#fff", background: `${info.color}26`, border: `1px solid ${info.color}55` }}>
                    {op.simbolo}
                  </span>
                ))}
                {dentro.length === 0 && <span style={{ fontSize: 11.5, color: T.text3, fontStyle: "italic" }}>Vacío</span>}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Panel «Estructuras de control»
 * ═══════════════════════════════════════════════════════════════════════════ */
function EstructurasPanel({
  accent,
  rgba,
  empar,
  selEstr,
  shakeEsc,
  estrLibres,
  onSelEstr,
  onEsc,
  onDropEsc,
  dragProps,
  dropProps,
}: {
  accent: string;
  rgba: string;
  empar: Record<string, string>;
  selEstr: string | null;
  shakeEsc: string | null;
  estrLibres: typeof ESTRUCTURAS;
  onSelEstr: (id: string) => void;
  onEsc: (escId: string) => void;
  onDropEsc: (estrId: string, escId: string) => void;
  dragProps: (id: string) => Record<string, unknown>;
  dropProps: (onDrop: (id: string) => void) => Record<string, unknown>;
}) {
  return (
    <>
      <div style={{ ...card, padding: "20px 24px" }}>
        <Eyebrow>
          <i className="fa-solid fa-code-branch" style={{ marginRight: 8, color: accent }} />
          Situaciones — arrastra a cada una su estructura
        </Eyebrow>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {ESCENARIOS.map((esc) => {
            const estrId = empar[esc.id];
            const resuelto = !!estrId;
            const estr = estrId ? ESTRUCTURAS.find((e) => e.id === estrId) : null;
            return (
              <div
                key={esc.id}
                {...dropProps((eid) => onDropEsc(eid, esc.id))}
                onClick={() => !resuelto && onEsc(esc.id)}
                style={{
                  borderRadius: 14,
                  border: `1.5px ${resuelto ? "solid" : "dashed"} ${resuelto ? OK : selEstr ? accent : T.lineStrong}`,
                  background: resuelto ? `${OK}12` : selEstr ? `rgba(${rgba},0.08)` : T.inset,
                  padding: "13px 16px",
                  cursor: resuelto ? "default" : selEstr ? "pointer" : "default",
                  animation: shakeEsc === esc.id ? "alShake .4s" : undefined,
                  transition: "all .16s",
                }}
              >
                <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                  <i className={`fa-solid ${resuelto ? "fa-circle-check" : "fa-circle-question"}`} style={{ color: resuelto ? OK : accent, fontSize: 16, marginTop: 2 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: T.text }}>{esc.texto}</div>
                    {resuelto && estr ? (
                      <div style={{ animation: "alPop .25s ease", marginTop: 8, fontSize: 12.5, color: "#fff", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 11px", borderRadius: 9, background: `${OK}26`, border: `1px solid ${OK}55` }}>
                        <i className="fa-solid fa-arrow-right-long" style={{ opacity: 0.7 }} />
                        {estr.texto.split(":")[0]}
                      </div>
                    ) : (
                      <div style={{ marginTop: 6, fontSize: 11.5, color: T.text3, fontStyle: "italic" }}>Suelta aquí la estructura.</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ ...card, padding: "18px 22px" }}>
        <Eyebrow>Estructuras de control</Eyebrow>
        {estrLibres.length === 0 ? (
          <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
            <i className="fa-solid fa-circle-check" /> ¡Emparejaste las 3 estructuras!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {estrLibres.map((e) => (
              <button key={e.id} className="al-chip" data-sel={selEstr === e.id} onClick={() => onSelEstr(e.id)} {...dragProps(e.id)}>
                <span style={{ width: 28, height: 28, flexShrink: 0, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: accent, background: `rgba(${rgba},0.16)` }}>
                  <i className="fa-solid fa-sitemap" />
                </span>
                <span style={{ flex: 1, fontSize: 12.5 }}>{e.texto}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
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
        Cinco preguntas sobre algoritmos, variables, operadores y estructuras de control. Responde y pulsa «Comprobar».
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
                    <button key={oi} className="al-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="al-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="al-btn" onClick={reintentar}>
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
