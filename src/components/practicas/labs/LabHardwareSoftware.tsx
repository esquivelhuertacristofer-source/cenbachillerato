"use client";

/**
 * Laboratorio — Taller de hardware y software.
 * Práctica experimental para CD-I-P01-A2 (Cultura Digital I · Ciudadanía digital).
 *
 * Interactividad máxima: el alumno EXPERIMENTA arrastrando piezas. Tres modos:
 *  1. «Arma el equipo»: lleva cada componente (CPU, RAM, almacenamiento, GPU) a
 *     su ranura en la tarjeta madre y enciende el equipo.
 *  2. «Hardware o software»: arrastra 12 elementos a la caja correcta (lo que se
 *     toca vs. los programas e instrucciones).
 *  3. «¿Por qué se traba?»: empareja cada síntoma con su causa real.
 *  + Cuestionario de comprensión.
 *
 * Es DOM puro (sin three.js): no infla el bundle del Worker y funciona con ratón,
 * teclado y pantalla táctil (clic-para-seleccionar y clic-para-colocar, además
 * del arrastre nativo HTML5).
 *
 * Contenido VERBATIM de la lectura A1 «¿Qué hay dentro de mis dispositivos?».
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { HARDWARE_SOFTWARE_HUECOS } from "./hardware-software-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { HARDWARE_SOFTWARE_FICHA } from "./hardware-software-ficha";
import {
  PIEZAS,
  ITEMS,
  CAT_INFO,
  CAUSAS,
  DIAGNOSTICOS,
  QUIZ,
  DATO_ENDUTIH,
  type Cat,
} from "./hardware-software-data";

const NO = "#FF5E5E";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
const RETO_KEY = "cen-hardware-reto";

type Modo = "armar" | "clasificar" | "diagnostico" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "armar", label: "Arma el equipo", icono: "fa-screwdriver-wrench" },
  { id: "clasificar", label: "Hardware o software", icono: "fa-layer-group" },
  { id: "diagnostico", label: "¿Por qué se traba?", icono: "fa-stethoscope" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

const itemById = (id: string) => ITEMS.find((i) => i.id === id);
const causaById = (id: string) => CAUSAS.find((c) => c.id === id);

export function LabHardwareSoftware({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("armar");

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

  // ── modo Armar ────────────────────────────────────────────────────────
  const [colocadas, setColocadas] = useState<Set<string>>(() => new Set<string>());
  const [selPieza, setSelPieza] = useState<string | null>(null);
  const [shakeSlot, setShakeSlot] = useState<string | null>(null);
  const [encendido, setEncendido] = useState(false);

  const intentarArmar = (piezaId: string, slotId: string) => {
    if (colocadas.has(piezaId)) return;
    if (piezaId === slotId) {
      const next = new Set(colocadas);
      next.add(piezaId);
      setColocadas(next);
      setSelPieza(null);
      sfxPlace();
      if (next.size >= PIEZAS.length) {
        setEncendido(true);
        sfxOk();
      }
    } else {
      setShakeSlot(slotId);
      sfxNo();
      window.setTimeout(() => setShakeSlot(null), 420);
    }
  };
  const resetArmar = () => {
    setColocadas(new Set());
    setSelPieza(null);
    setEncendido(false);
  };

  // ── modo Clasificar ───────────────────────────────────────────────────
  const [ubic, setUbic] = useState<Record<string, Cat>>({});
  const [selItem, setSelItem] = useState<string | null>(null);
  const [intentadas, setIntentadas] = useState<Set<string>>(() => new Set<string>());
  const [primeros, setPrimeros] = useState<Set<string>>(() => new Set<string>());
  const [shakeBin, setShakeBin] = useState<Cat | null>(null);
  const [estrellas, setEstrellas] = useState(0);
  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);

  const intentarClasificar = (itemId: string, cat: Cat) => {
    const item = itemById(itemId);
    if (!item || ubic[itemId]) return;
    const primeraVez = !intentadas.has(itemId);
    if (primeraVez) setIntentadas((s) => new Set(s).add(itemId));

    if (item.cat === cat) {
      const next = { ...ubic, [itemId]: cat };
      setUbic(next);
      setSelItem(null);
      sfxPlace();
      let nextPrimeros = primeros;
      if (primeraVez) {
        nextPrimeros = new Set(primeros).add(itemId);
        setPrimeros(nextPrimeros);
      }
      if (Object.keys(next).length >= ITEMS.length) {
        const est = nextPrimeros.size >= ITEMS.length ? 3 : nextPrimeros.size >= 8 ? 2 : 1;
        setEstrellas(est);
        sfxOk();
        registraEstrellas(est);
      }
    } else {
      setShakeBin(cat);
      sfxNo();
      window.setTimeout(() => setShakeBin(null), 420);
    }
  };
  const resetClasificar = () => {
    setUbic({});
    setSelItem(null);
    setIntentadas(new Set());
    setPrimeros(new Set());
    setEstrellas(0);
  };

  // ── modo Diagnóstico ──────────────────────────────────────────────────
  const [empar, setEmpar] = useState<Record<string, string>>({}); // diagId -> causaId (solo correctos)
  const [selCausa, setSelCausa] = useState<string | null>(null);
  const [shakeDiag, setShakeDiag] = useState<string | null>(null);

  const intentarDiag = (causaId: string, diagId: string) => {
    const diag = DIAGNOSTICOS.find((d) => d.id === diagId);
    if (!diag || empar[diagId]) return;
    if (diag.causaId === causaId) {
      setEmpar((e) => ({ ...e, [diagId]: causaId }));
      setSelCausa(null);
      sfxPlace();
      if (Object.keys(empar).length + 1 >= DIAGNOSTICOS.length) sfxOk();
    } else {
      setShakeDiag(diagId);
      sfxNo();
      window.setTimeout(() => setShakeDiag(null), 420);
    }
  };
  const resetDiag = () => {
    setEmpar({});
    setSelCausa(null);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso ──────────────────────────────────────────────────────────
  const armarDone = colocadas.size >= PIEZAS.length;
  const clasifDone = Object.keys(ubic).length >= ITEMS.length;
  const diagDone = Object.keys(empar).length >= DIAGNOSTICOS.length;
  // Los cuatro modos cuentan, no sólo la clasificación: el modo de escribir
  // es trabajo real y antes no dejaba marca. La regla de precisión propia de
  // este lab se conserva, y se toma la mejor de las dos.
  const modosHechos = (armarDone ? 1 : 0) + (clasifDone ? 1 : 0) + (diagDone ? 1 : 0) + (textoDone ? 1 : 0);
  const bestEstrellas = Math.max(estrellas, partida.estrellasCon(modosHechos, 4), mejor);

  const objetivos = [
    { txt: "Arma el equipo completo", done: armarDone },
    { txt: "Clasifica las 12 piezas (hardware / software)", done: clasifDone },
    { txt: "Resuelve los 3 diagnósticos", done: diagDone },
    { txt: "Consigue 3★ en la clasificación", done: bestEstrellas >= 3 },
    { txt: "Aprueba el cuestionario de comprensión", done: quizAprobado },
  ];

  const causasLibres = CAUSAS.filter((c) => !Object.values(empar).includes(c.id));
  const piezasLibres = PIEZAS.filter((p) => !colocadas.has(p.id));
  const itemsLibres = ITEMS.filter((i) => !ubic[i.id]);

  // helper para arrastre nativo
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
        @keyframes hsShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes hsPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        @keyframes hsGlow { 0%,100%{box-shadow:0 0 0 0 ${accent}66;} 50%{box-shadow:0 0 26px 4px ${accent}66;} }
        .hs-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(300px,28vw,400px); gap:22px; align-items:start; }
        @media (max-width:1000px){ .hs-grid { grid-template-columns:1fr; } }
        .hs-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 16px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .hs-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .hs-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .hs-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .hs-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .hs-icobtn:hover { background:rgba(255,255,255,0.12); }
        .hs-chip { cursor:grab; display:inline-flex; align-items:center; gap:9px; padding:10px 13px; border-radius:12px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:${T.text}; font-size:13px; font-weight:700; text-align:left;
          transition:all .14s; user-select:none; width:100%; }
        .hs-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
        .hs-chip[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
        .hs-chip:active { cursor:grabbing; }
        .hs-slot { border-radius:14px; border:1.5px dashed ${T.lineStrong}; background:${T.inset}; padding:14px;
          display:flex; flex-direction:column; gap:8px; min-height:104px; transition:all .16s; }
        .hs-slot[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.1); cursor:pointer; }
        .hs-slot[data-done="true"] { border-style:solid; border-color:${OK}; background:${OK}14; }
        .hs-slot[data-shake="true"] { animation:hsShake .4s; border-color:${NO}; }
        .hs-bin { border-radius:16px; border:2px dashed ${T.lineStrong}; padding:16px; min-height:150px; transition:all .16s; }
        .hs-bin[data-sel="true"] { cursor:pointer; }
        .hs-bin[data-shake="true"] { animation:hsShake .4s; }
        .hs-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
        .hs-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
        .hs-q:disabled{ cursor:default; }
        .hs-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .hs-btn:hover { border-color:${T.lineStrong}; }
        .hs-divider { height:1px; background:${T.line}; margin:18px 0; }
        @media (prefers-reduced-motion: reduce){ .hs-slot[data-shake="true"], .hs-bin[data-shake="true"] { animation:none; } }

        /* Cajón de teoría */
        .hs-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .hs-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .hs-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .hs-drawer[data-open="true"] { transform:translateX(0); }
        .hs-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .hs-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .hs-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .hs-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .hs-teoria-fab { position:fixed; right:20px; bottom:20px; z-index:58; cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.86); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .hs-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
        @media (max-width: 640px){ .hs-teoria-fab { right:12px; bottom:12px; padding:10px 13px; font-size:12px; } }

        /* Identidad del tablero */
        .hs-bin { --tono:188; position:relative;
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
        .hs-bin:nth-of-type(6n+1) { --tono:188; }
        .hs-bin:nth-of-type(6n+2) { --tono:262; }
        .hs-bin:nth-of-type(6n+3) { --tono:44; }
        .hs-bin:nth-of-type(6n+4) { --tono:152; }
        .hs-bin:nth-of-type(6n+5) { --tono:330; }
        .hs-bin:nth-of-type(6n+6) { --tono:18; }
        .hs-bin::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
          background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
        .hs-bin[data-done="true"] {
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }
        .hs-chip { transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
        .hs-chip:hover { transform:translateY(-2px); }
        .hs-chip[data-sel="true"] { transform:translateY(-3px) scale(1.02); }
        @media (prefers-reduced-motion: reduce){
          .hs-chip, .hs-chip:hover, .hs-chip[data-sel="true"] { transform:none; transition:none; }
        }
      `}</style>

      {/* selector de modo + toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        {MODOS.map((m) => (
          <button key={m.id} className="hs-tab" data-on={modo === m.id} onClick={() => setModo(m.id)}>
            <i className={`fa-solid ${m.icono}`} />
            {m.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
        <button className="hs-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría de la práctica">
          <i className="fa-solid fa-book-open" />
        </button>
        <button className="hs-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
          <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
        </button>
        <button
          className="hs-icobtn"
          onClick={modo === "texto" ? resetHuecos : modo === "armar" ? resetArmar : modo === "clasificar" ? resetClasificar : resetDiag}
          title="Reiniciar este modo"
        >
          <i className="fa-solid fa-rotate-left" />
        </button>
      </div>

      {/* ── Cajón de teoría ──────────────────────────────────────────── */}
      <button className="hs-teoria-fab" onClick={() => setDrawer(true)}>
        <i className="fa-solid fa-book-open" />
        Teoría
      </button>
      <div className="hs-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="hs-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="hs-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="hs-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="hs-drawer-body">
          <FichaTeorica data={HARDWARE_SOFTWARE_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>

      <div className="hs-grid">
        {/* ── Columna principal (tablero del modo) ──────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* MODO — completa el texto (fill_blanks verbatim de la progresión) */}
          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={HARDWARE_SOFTWARE_HUECOS}
              accent={accent}
              rgba={color.rgba}
              completado={textoDone}
              onCompletado={() => {
                setTextoDone(true);
                sfxOk();
                registraEstrellas(
                  partida.estrellasCon((armarDone ? 1 : 0) + (clasifDone ? 1 : 0) + (diagDone ? 1 : 0) + 1, 4)
                );
              }}
              onAcierto={sfxPlace}
              onError={sfxNo}
            />
          )}

          {modo === "armar" && (
            <ArmarPanel
              accent={accent}
              rgba={color.rgba}
              colocadas={colocadas}
              selPieza={selPieza}
              shakeSlot={shakeSlot}
              encendido={encendido}
              piezasLibres={piezasLibres}
              onSelPieza={(id) => setSelPieza((p) => (p === id ? null : id))}
              onSlot={(slotId) => {
                if (selPieza) intentarArmar(selPieza, slotId);
              }}
              onDropSlot={(piezaId, slotId) => intentarArmar(piezaId, slotId)}
              dragProps={dragProps}
              dropProps={dropProps}
            />
          )}

          {modo === "clasificar" && (
            <ClasificarPanel
              accent={accent}
              rgba={color.rgba}
              ubic={ubic}
              selItem={selItem}
              shakeBin={shakeBin}
              itemsLibres={itemsLibres}
              estrellas={bestEstrellas}
              onSelItem={(id) => setSelItem((p) => (p === id ? null : id))}
              onBin={(cat) => {
                if (selItem) intentarClasificar(selItem, cat);
              }}
              onDropBin={(itemId, cat) => intentarClasificar(itemId, cat)}
              dragProps={dragProps}
              dropProps={dropProps}
            />
          )}

          {modo === "diagnostico" && (
            <DiagnosticoPanel
              accent={accent}
              rgba={color.rgba}
              empar={empar}
              selCausa={selCausa}
              shakeDiag={shakeDiag}
              causasLibres={causasLibres}
              onSelCausa={(id) => setSelCausa((p) => (p === id ? null : id))}
              onDiag={(diagId) => {
                if (selCausa) intentarDiag(selCausa, diagId);
              }}
              onDropDiag={(causaId, diagId) => intentarDiag(causaId, diagId)}
              dragProps={dragProps}
              dropProps={dropProps}
            />
          )}
        </div>

        {/* ── Columna lateral (objetivos + reto + dato) ─────────────────── */}
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

            <div className="hs-divider" />

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
                  {bestEstrellas >= 3
                    ? "¡Perfecto! Clasificaste las 12 a la primera."
                    : "Clasifica las 12 piezas; acierta todo a la primera para 3★."}
                </div>
              </div>
            </div>
          </div>

          {/* pista del modo actual */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid rgba(${color.rgba},0.3)`, background: `rgba(${color.rgba},0.08)`, fontSize: 13, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>
              {modo === "armar" && (
                <>Arrastra (o toca y luego toca la ranura) cada componente a su lugar. El <strong style={{ color: T.text }}>hardware</strong> es todo lo que puedes tocar.</>
              )}
              {modo === "clasificar" && (
                <>Pregúntate: <strong style={{ color: T.text }}>¿lo puedo tocar?</strong> Si sí, es hardware; si es un programa o instrucción, es software.</>
              )}
              {modo === "diagnostico" && (
                <>Conocer los componentes ayuda a entender <strong style={{ color: T.text }}>por qué falla un equipo</strong>. Empareja cada síntoma con su causa.</>
              )}
            </span>
          </div>

          {/* dato verbatim */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid ${T.line}`, background: T.glass, fontSize: 12.5, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-chart-simple" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>{DATO_ENDUTIH}</span>
          </div>
        </div>
      </div>

      {/* ── Cuestionario ─────────────────────────────────────────────────── */}
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
 * Panel «Arma el equipo»
 * ═══════════════════════════════════════════════════════════════════════════ */
function ArmarPanel({
  accent,
  rgba,
  colocadas,
  selPieza,
  shakeSlot,
  encendido,
  piezasLibres,
  onSelPieza,
  onSlot,
  onDropSlot,
  dragProps,
  dropProps,
}: {
  accent: string;
  rgba: string;
  colocadas: Set<string>;
  selPieza: string | null;
  shakeSlot: string | null;
  encendido: boolean;
  piezasLibres: typeof PIEZAS;
  onSelPieza: (id: string) => void;
  onSlot: (slotId: string) => void;
  onDropSlot: (piezaId: string, slotId: string) => void;
  dragProps: (id: string) => Record<string, unknown>;
  dropProps: (onDrop: (id: string) => void) => Record<string, unknown>;
}) {
  return (
    <>
      <div
        style={{
          ...card,
          padding: "22px 24px",
          position: "relative",
          background: encendido
            ? `radial-gradient(120% 90% at 50% 0%, rgba(${rgba},0.16) 0%, transparent 60%), ${T.glass}`
            : T.glass,
          animation: encendido ? "hsGlow 2.4s ease-in-out infinite" : undefined,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <Eyebrow>
            <i className="fa-solid fa-computer" style={{ marginRight: 8, color: accent }} />
            Tarjeta madre — coloca cada componente
          </Eyebrow>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12.5,
              fontWeight: 800,
              color: encendido ? OK : T.text3,
            }}
          >
            <i className={`fa-solid ${encendido ? "fa-power-off" : "fa-plug-circle-xmark"}`} />
            {encendido ? "Equipo encendido" : `${colocadas.size}/${PIEZAS.length} colocados`}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {PIEZAS.map((p) => {
            const done = colocadas.has(p.id);
            return (
              <div
                key={p.id}
                className="hs-slot"
                data-done={done}
                data-sel={!done && selPieza !== null}
                data-shake={shakeSlot === p.id}
                onClick={() => !done && onSlot(p.id)}
                {...dropProps((piezaId) => onDropSlot(piezaId, p.id))}
              >
                <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.08em", color: T.text3, textTransform: "uppercase" }}>
                  {p.ranura}
                </div>
                {done ? (
                  <div style={{ animation: "hsPop .25s ease", display: "flex", gap: 11, alignItems: "flex-start" }}>
                    <span style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#fff", background: `rgba(${rgba},0.3)` }}>
                      <i className={`fa-solid ${p.icono}`} />
                    </span>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 800, color: "#fff" }}>{p.nombre}</div>
                      <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.4, marginTop: 2 }}>{p.funcion}</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: T.text3, fontSize: 12.5, gap: 8 }}>
                    <i className="fa-solid fa-arrow-down-to-bracket" />
                    Suelta aquí el componente
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* bandeja de piezas */}
      <div style={{ ...card, padding: "18px 22px" }}>
        <Eyebrow>Componentes disponibles</Eyebrow>
        {piezasLibres.length === 0 ? (
          <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
            <i className="fa-solid fa-circle-check" /> ¡Equipo armado! Todos los componentes están en su ranura.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {piezasLibres.map((p) => (
              <button
                key={p.id}
                className="hs-chip"
                data-sel={selPieza === p.id}
                onClick={() => onSelPieza(p.id)}
                {...dragProps(p.id)}
              >
                <span style={{ width: 30, height: 30, flexShrink: 0, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: accent, background: `rgba(${rgba},0.16)` }}>
                  <i className={`fa-solid ${p.icono}`} />
                </span>
                <span style={{ flex: 1 }}>{p.nombre}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Panel «Hardware o software»
 * ═══════════════════════════════════════════════════════════════════════════ */
function ClasificarPanel({
  accent,
  rgba,
  ubic,
  selItem,
  shakeBin,
  itemsLibres,
  estrellas,
  onSelItem,
  onBin,
  onDropBin,
  dragProps,
  dropProps,
}: {
  accent: string;
  rgba: string;
  ubic: Record<string, Cat>;
  selItem: string | null;
  shakeBin: Cat | null;
  itemsLibres: typeof ITEMS;
  estrellas: number;
  onSelItem: (id: string) => void;
  onBin: (cat: Cat) => void;
  onDropBin: (itemId: string, cat: Cat) => void;
  dragProps: (id: string) => Record<string, unknown>;
  dropProps: (onDrop: (id: string) => void) => Record<string, unknown>;
}) {
  const cats: Cat[] = ["hw", "sw"];
  const colocadasN = Object.keys(ubic).length;
  return (
    <>
      {/* bandeja de elementos por clasificar */}
      <div style={{ ...card, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
          <Eyebrow>Arrastra cada elemento a su caja</Eyebrow>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: colocadasN >= ITEMS.length ? OK : T.text3 }}>{colocadasN}/{ITEMS.length}</span>
        </div>
        {itemsLibres.length === 0 ? (
          <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
            <i className="fa-solid fa-circle-check" /> ¡Clasificaste las 12 piezas!{estrellas >= 3 ? " Y a la primera: 3★." : ""}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
            {itemsLibres.map((it) => (
              <button key={it.id} className="hs-chip" data-sel={selItem === it.id} onClick={() => onSelItem(it.id)} {...dragProps(it.id)} title={it.pista}>
                <span style={{ width: 28, height: 28, flexShrink: 0, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: accent, background: `rgba(${rgba},0.16)` }}>
                  <i className={`fa-solid ${it.icono}`} />
                </span>
                <span style={{ flex: 1, fontSize: 12.5 }}>{it.nombre}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* las dos cajas */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {cats.map((cat) => {
          const info = CAT_INFO[cat];
          const dentro = ITEMS.filter((i) => ubic[i.id] === cat);
          return (
            <div
              key={cat}
              className="hs-bin"
              data-sel={selItem !== null}
              data-shake={shakeBin === cat}
              onClick={() => onBin(cat)}
              {...dropProps((itemId) => onDropBin(itemId, cat))}
              style={{ borderColor: `${info.color}66`, background: `${info.color}0d` }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ width: 34, height: 34, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "#fff", background: `${info.color}33` }}>
                  <i className={`fa-solid ${info.icono}`} />
                </span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: "#fff" }}>{info.label}</div>
                  <div style={{ fontSize: 11, color: T.text3 }}>{info.descripcion}</div>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {dentro.map((it) => (
                  <span key={it.id} style={{ animation: "hsPop .25s ease", display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 10px", borderRadius: 9, fontSize: 11.5, fontWeight: 700, color: "#fff", background: `${info.color}26`, border: `1px solid ${info.color}55` }}>
                    <i className={`fa-solid ${it.icono}`} style={{ fontSize: 11 }} />
                    {it.nombre.replace(/ \(.*\)/, "")}
                  </span>
                ))}
                {dentro.length === 0 && (
                  <span style={{ fontSize: 12, color: T.text3, fontStyle: "italic" }}>Vacío — suelta elementos aquí.</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Panel «¿Por qué se traba?»
 * ═══════════════════════════════════════════════════════════════════════════ */
function DiagnosticoPanel({
  accent,
  rgba,
  empar,
  selCausa,
  shakeDiag,
  causasLibres,
  onSelCausa,
  onDiag,
  onDropDiag,
  dragProps,
  dropProps,
}: {
  accent: string;
  rgba: string;
  empar: Record<string, string>;
  selCausa: string | null;
  shakeDiag: string | null;
  causasLibres: typeof CAUSAS;
  onSelCausa: (id: string) => void;
  onDiag: (diagId: string) => void;
  onDropDiag: (causaId: string, diagId: string) => void;
  dragProps: (id: string) => Record<string, unknown>;
  dropProps: (onDrop: (id: string) => void) => Record<string, unknown>;
}) {
  return (
    <>
      <div style={{ ...card, padding: "20px 24px" }}>
        <Eyebrow>
          <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 8, color: accent }} />
          Síntomas — arrastra a cada uno su causa
        </Eyebrow>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {DIAGNOSTICOS.map((d) => {
            const causaId = empar[d.id];
            const resuelto = !!causaId;
            const causa = causaId ? causaById(causaId) : null;
            return (
              <div
                key={d.id}
                {...dropProps((cid) => onDropDiag(cid, d.id))}
                onClick={() => !resuelto && onDiag(d.id)}
                style={{
                  borderRadius: 14,
                  border: `1.5px ${resuelto ? "solid" : "dashed"} ${resuelto ? OK : selCausa ? accent : T.lineStrong}`,
                  background: resuelto ? `${OK}12` : selCausa ? `rgba(${rgba},0.08)` : T.inset,
                  padding: "13px 16px",
                  cursor: resuelto ? "default" : selCausa ? "pointer" : "default",
                  animation: shakeDiag === d.id ? "hsShake .4s" : undefined,
                  transition: "all .16s",
                }}
              >
                <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                  <i className={`fa-solid ${resuelto ? "fa-circle-check" : "fa-circle-question"}`} style={{ color: resuelto ? OK : accent, fontSize: 16, marginTop: 2 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: T.text }}>{d.sintoma}</div>
                    {resuelto && causa && (
                      <div style={{ animation: "hsPop .25s ease", marginTop: 8, fontSize: 12.5, color: "#fff", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 11px", borderRadius: 9, background: `${OK}26`, border: `1px solid ${OK}55` }}>
                        <i className="fa-solid fa-arrow-right-long" style={{ opacity: 0.7 }} />
                        {causa.texto}
                      </div>
                    )}
                    {!resuelto && (
                      <div style={{ marginTop: 6, fontSize: 11.5, color: T.text3, fontStyle: "italic" }}>Suelta aquí la causa probable.</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ ...card, padding: "18px 22px" }}>
        <Eyebrow>Causas posibles</Eyebrow>
        {causasLibres.length === 0 ? (
          <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
            <i className="fa-solid fa-circle-check" /> ¡Diagnóstico completo! Emparejaste cada síntoma con su causa.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {causasLibres.map((c) => (
              <button key={c.id} className="hs-chip" data-sel={selCausa === c.id} onClick={() => onSelCausa(c.id)} {...dragProps(c.id)}>
                <span style={{ width: 28, height: 28, flexShrink: 0, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: accent, background: `rgba(${rgba},0.16)` }}>
                  <i className="fa-solid fa-wrench" />
                </span>
                <span style={{ flex: 1, fontSize: 12.5 }}>{c.texto}</span>
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
        Cinco preguntas sobre hardware, software y los componentes de un dispositivo. Responde y pulsa «Comprobar».
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
                    <button key={oi} className="hs-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="hs-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="hs-btn" onClick={reintentar}>
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
