"use client";

/**
 * Laboratorio — Concordancia y conectores: el hilo del texto.
 * Práctica experimental para LC-I-P06-A4 (Lengua y Comunicación I).
 *
 * Interactividad máxima. Cuatro modos: los tres de arrastrar/clasificar y, al
 * final, uno que se escribe («Completa el texto», verbatim de la progresión):
 *  1. «Repara la concordancia» — arrastra la forma correcta para corregir el
 *     error de concordancia de cada oración.
 *  2. «Conectores en su lugar» — arrastra el conector adecuado al hueco de cada
 *     oración según su sentido (causa, adición, comparación, consecuencia).
 *  3. «Escribe el término» — lee la definición verbatim (A5) y escribe
 *     de memoria el término del glosario que la nombra.
 *  + Cuestionario de comprensión.
 *
 * DOM puro (sin three.js): ligero, accesible (ratón, teclado y táctil mediante
 * clic-para-seleccionar / clic-para-colocar). Contenido VERBATIM de LC-I·P06
 * (A1 lectura, A2 quiz, A4 fill_blanks, A5 V/F, A6 glosario).
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { CONCORDANCIA_CONECTORES_HUECOS } from "./concordancia-conectores-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { CONCORDANCIA_CONECTORES_FICHA } from "./concordancia-conectores-ficha";
import {
  REPARACIONES,
  FRASES,
  GLOSARIO,
  QUIZ,
  DATO_CONCORDANCIA,
} from "./concordancia-conectores-data";

const NO = "#FF5E5E";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
const RETO_KEY = "cen-concordancia-conectores-reto";

type Modo = "reparar" | "conectores" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "reparar", label: "Repara la concordancia", icono: "fa-screwdriver-wrench" },
  { id: "conectores", label: "Conectores en su lugar", icono: "fa-link" },
  { id: "glosario", label: "Escribe el término", icono: "fa-keyboard" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

export function LabConcordanciaConectores({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("reparar");

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

  // ── modo Reparar (arrastra la forma correcta) ─────────────────────────
  const [reparado, setReparado] = useState<Record<string, boolean>>({});
  const [selRep, setSelRep] = useState<string | null>(null);
  const [shakeRep, setShakeRep] = useState<string | null>(null);
  const repLibres = REPARACIONES.filter((r) => !reparado[r.id]).slice().sort((a, b) => a.bien.localeCompare(b.bien, "es"));

  const intentarRep = (chipId: string, rowId: string) => {
    if (reparado[rowId]) return;
    if (chipId === rowId) {
      setReparado((e) => ({ ...e, [rowId]: true }));
      setSelRep(null);
      sfxPlace();
      if (Object.keys(reparado).length + 1 >= REPARACIONES.length) {
        sfxOk();
        persistMejor(true, conectoresDone, glosarioDone);
      }
    } else {
      setShakeRep(rowId);
      sfxNo();
      window.setTimeout(() => setShakeRep(null), 420);
    }
  };
  const resetReparar = () => {
    setReparado({});
    setSelRep(null);
  };

  // ── modo Conectores (arrastra el conector al hueco) ───────────────────
  const [colocado, setColocado] = useState<Record<string, boolean>>({});
  const [selCon, setSelCon] = useState<string | null>(null);
  const [shakeFrase, setShakeFrase] = useState<string | null>(null);
  const conLibres = FRASES.filter((f) => !colocado[f.id]).slice().sort((a, b) => a.conector.localeCompare(b.conector, "es"));

  const intentarCon = (chipId: string, rowId: string) => {
    if (colocado[rowId]) return;
    if (chipId === rowId) {
      setColocado((e) => ({ ...e, [rowId]: true }));
      setSelCon(null);
      sfxPlace();
      if (Object.keys(colocado).length + 1 >= FRASES.length) {
        sfxOk();
        persistMejor(reparadoDone, true, glosarioDone);
      }
    } else {
      setShakeFrase(rowId);
      sfxNo();
      window.setTimeout(() => setShakeFrase(null), 420);
    }
  };
  const resetConectores = () => {
    setColocado({});
    setSelCon(null);
  };

  // ── modo Glosario (emparejar término → definición) ────────────────────
  // El contador hace de `key`: subirlo remonta el componente y deja todas
  // las tarjetas en blanco.
  const [glosarioDone, setGlosarioDone] = useState(false);
  const [glosIntento, setGlosIntento] = useState(0);
  const resetGlosario = () => {
    setGlosarioDone(false);
    setGlosIntento((n) => n + 1);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso / estrellas ──────────────────────────────────────────────
  const reparadoDone = Object.keys(reparado).length >= REPARACIONES.length;
  const conectoresDone = Object.keys(colocado).length >= FRASES.length;
  const modosHechos = (reparadoDone ? 1 : 0) + (conectoresDone ? 1 : 0) + (glosarioDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los 3 modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 4);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);

  const persistMejor = (a: boolean, b: boolean, c: boolean) => {
    const est = (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0);
    registraEstrellas(est);
  };

  const objetivos = [
    { txt: "Repara las 4 oraciones con error de concordancia", done: reparadoDone },
    { txt: "Coloca los 4 conectores en su lugar", done: conectoresDone },
    { txt: "Escribe los 5 términos del glosario", done: glosarioDone },
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
  const resetActual = modo === "texto" ? resetTexto : modo === "reparar" ? resetReparar : modo === "conectores" ? resetConectores : resetGlosario;

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes ccShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes ccPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .cc-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 16px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .cc-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .cc-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .cc-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .cc-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .cc-icobtn:hover { background:rgba(255,255,255,0.12); }
        .cc-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:999px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:800; transition:all .14s; user-select:none; }
        .cc-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
        .cc-chip[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
        .cc-chip:active { cursor:grabbing; }
        .cc-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; transition:all .16s; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
        .cc-row[data-shake="true"] { animation:ccShake .4s; border-color:${NO}; }
        .cc-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
        .cc-slot { flex-shrink:0; min-width:118px; min-height:44px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
          display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:12.5px; transition:all .16s; cursor:pointer; padding:4px 12px; }
        .cc-slot[data-armed="true"] { border-color:${accent}; background:rgba(${color.rgba},0.1); }
        .cc-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
        .cc-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
        .cc-q:disabled{ cursor:default; }
        .cc-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .cc-btn:hover { border-color:${T.lineStrong}; }
        .cc-divider { height:1px; background:${T.line}; margin:18px 0; }
        @media (prefers-reduced-motion: reduce){ .cc-row[data-shake="true"] { animation:none; } }

        /* Cajón de teoría */
        .cc-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .cc-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .cc-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .cc-drawer[data-open="true"] { transform:translateX(0); }
        .cc-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .cc-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .cc-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .cc-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .cc-teoria-fab { position:fixed; right:20px; bottom:20px; z-index:58; cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.86); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .cc-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
        @media (max-width: 640px){ .cc-teoria-fab { right:12px; bottom:12px; padding:10px 13px; font-size:12px; } }

        /* Identidad del tablero */
        .cc-row { --tono:188; position:relative;
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
        .cc-row:nth-of-type(6n+1) { --tono:188; }
        .cc-row:nth-of-type(6n+2) { --tono:262; }
        .cc-row:nth-of-type(6n+3) { --tono:44; }
        .cc-row:nth-of-type(6n+4) { --tono:152; }
        .cc-row:nth-of-type(6n+5) { --tono:330; }
        .cc-row:nth-of-type(6n+6) { --tono:18; }
        .cc-row::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
          background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
        .cc-row[data-done="true"] {
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }
        .cc-chip { transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
        .cc-chip:hover { transform:translateY(-2px); }
        .cc-chip[data-sel="true"] { transform:translateY(-3px) scale(1.02); }
        @media (prefers-reduced-motion: reduce){
          .cc-chip, .cc-chip:hover, .cc-chip[data-sel="true"] { transform:none; transition:none; }
        }
      `}</style>

      {/* selector de modo + toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        {MODOS.map((m) => (
          <button key={m.id} className="cc-tab" data-on={modo === m.id} onClick={() => setModo(m.id)}>
            <i className={`fa-solid ${m.icono}`} />
            {m.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
        <button className="cc-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría de la práctica">
          <i className="fa-solid fa-book-open" />
        </button>
        <button className="cc-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
          <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
        </button>
        <button className="cc-icobtn" onClick={resetActual} title="Reiniciar este modo">
          <i className="fa-solid fa-rotate-left" />
        </button>
      </div>

      {/* ── Cajón de teoría ──────────────────────────────────────────── */}
      <button className="cc-teoria-fab" onClick={() => setDrawer(true)}>
        <i className="fa-solid fa-book-open" />
        Teoría
      </button>
      <div className="cc-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="cc-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="cc-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="cc-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="cc-drawer-body">
          <FichaTeorica data={CONCORDANCIA_CONECTORES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,28vw,400px)", gap: 22, alignItems: "start" }}>
        {/* ── Columna principal ─────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {/* MODO 1 — reparar concordancia */}
          {/* MODO — completa el texto (fill_blanks verbatim de la progresión) */}
          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={CONCORDANCIA_CONECTORES_HUECOS}
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

          {modo === "reparar" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra la forma correcta sobre la palabra tachada</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: reparadoDone ? OK : T.text3 }}>
                    {Object.keys(reparado).length}/{REPARACIONES.length}
                  </span>
                </div>
                {repLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Reparaste las 4 oraciones!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {repLibres.map((r) => (
                      <button key={r.id} className="cc-chip" data-sel={selRep === r.id} onClick={() => setSelRep((s) => (s === r.id ? null : r.id))} {...dragProps(r.id)}>
                        <i className="fa-solid fa-pen" style={{ fontSize: 12, opacity: 0.7 }} />
                        {r.bien}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <RowsReparar selRep={selRep} shakeRep={shakeRep} reparado={reparado} onMatch={intentarRep} dropProps={dropProps} />
            </>
          )}

          {/* MODO 2 — conectores en su lugar */}
          {modo === "conectores" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada conector al hueco según el sentido</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: conectoresDone ? OK : T.text3 }}>
                    {Object.keys(colocado).length}/{FRASES.length}
                  </span>
                </div>
                {conLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Colocaste los 4 conectores!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {conLibres.map((f) => (
                      <button key={f.id} className="cc-chip" data-sel={selCon === f.id} onClick={() => setSelCon((s) => (s === f.id ? null : f.id))} {...dragProps(f.id)}>
                        <i className="fa-solid fa-link" style={{ fontSize: 12, opacity: 0.7 }} />
                        {f.conector}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <RowsConectores selCon={selCon} shakeFrase={shakeFrase} colocado={colocado} onMatch={intentarCon} dropProps={dropProps} accent={accent} />
            </>
          )}

          {/* MODO 3 — glosario (emparejar) */}
          {modo === "glosario" && (
            <EscribeTermino
              key={glosIntento}
              pares={GLOSARIO}
              accent={accent}
              rgba={color.rgba}
              completado={glosarioDone}
              instrucciones="Lee la definición y escribe el término del glosario que le corresponde."
              onCompletado={() => {
                setGlosarioDone(true);
                sfxOk();
                persistMejor(reparadoDone, conectoresDone, true);
              }}
              onAcierto={sfxPlace}
              onError={sfxNo}
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

            <div className="cc-divider" />

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
                  {bestEstrellas >= 3 ? "¡Dominas la concordancia y los conectores!" : "Termina los tres modos para ganar 2★; la tercera pide 2 errores o menos."}
                </div>
              </div>
            </div>
          </div>

          {/* pista del modo actual */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid rgba(${color.rgba},0.3)`, background: `rgba(${color.rgba},0.08)`, fontSize: 13, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>
              {modo === "reparar" && (
                <>El sustantivo y el adjetivo concuerdan en <strong style={{ color: T.text }}>género y número</strong>; el sujeto y el verbo, en <strong style={{ color: T.text }}>número y persona</strong>.</>
              )}
              {modo === "conectores" && (
                <><strong style={{ color: T.text }}>porque</strong> = causa · <strong style={{ color: T.text }}>además</strong> = adición · <strong style={{ color: T.text }}>como</strong> = comparación. Lee la frase completa para captar el sentido.</>
              )}
              {modo === "glosario" && (
                <>Ya no se arrastra: lee la definición y su ejemplo y escribe el término. Si te atoras, la pista te da la inicial y las letras.</>
              )}
            </span>
          </div>

          {/* dato verbatim */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid ${T.line}`, background: T.glass, fontSize: 12.5, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-circle-info" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>{DATO_CONCORDANCIA}</span>
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

function RowsReparar({
  selRep,
  shakeRep,
  reparado,
  onMatch,
  dropProps,
}: {
  selRep: string | null;
  shakeRep: string | null;
  reparado: Record<string, boolean>;
  onMatch: (chipId: string, rowId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {REPARACIONES.map((r) => {
        const done = reparado[r.id];
        return (
          <div
            key={r.id}
            className="cc-row"
            data-shake={shakeRep === r.id}
            data-done={done}
            onClick={() => !done && selRep && onMatch(selRep, r.id)}
            {...dropProps((id) => onMatch(id, r.id))}
          >
            <div style={{ fontSize: 14, color: done ? "#fff" : T.text2, lineHeight: 1.5, display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span>{r.antes}</span>
              {done ? (
                <span style={{ animation: "ccPop .25s ease", fontWeight: 900, color: OK }}>{r.bien}</span>
              ) : (
                <>
                  <span style={{ textDecoration: "line-through", color: NO, fontWeight: 700, opacity: 0.85 }}>{r.mal}</span>
                  <span className="cc-slot" data-armed={!!selRep} style={{ minWidth: 80 }}>
                    <i className="fa-solid fa-arrow-down" style={{ fontSize: 11 }} />
                  </span>
                </>
              )}
              <span>{r.despues}</span>
            </div>
            {done && (
              <div style={{ flexBasis: "100%", fontSize: 12, color: T.text3, lineHeight: 1.45, display: "flex", gap: 8 }}>
                <i className="fa-solid fa-circle-check" style={{ color: OK, marginTop: 2 }} />
                <span>{r.regla}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function RowsConectores({
  selCon,
  shakeFrase,
  colocado,
  onMatch,
  dropProps,
  accent,
}: {
  selCon: string | null;
  shakeFrase: string | null;
  colocado: Record<string, boolean>;
  onMatch: (chipId: string, rowId: string) => void;
  dropProps: DropFactory;
  accent: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {FRASES.map((f) => {
        const done = colocado[f.id];
        return (
          <div
            key={f.id}
            className="cc-row"
            data-shake={shakeFrase === f.id}
            data-done={done}
            onClick={() => !done && selCon && onMatch(selCon, f.id)}
            {...dropProps((id) => onMatch(id, f.id))}
          >
            <div style={{ fontSize: 14, color: done ? "#fff" : T.text2, lineHeight: 1.6, display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span>{f.antes}</span>
              {done ? (
                <span style={{ animation: "ccPop .25s ease", fontWeight: 900, color: OK }}>{f.conector}</span>
              ) : (
                <span className="cc-slot" data-armed={!!selCon}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <i className="fa-solid fa-link" style={{ fontSize: 11 }} /> conector
                  </span>
                </span>
              )}
              <span>{f.despues}</span>
              <span style={{ fontSize: 10.5, fontWeight: 800, color: done ? OK : T.text3, border: `1px solid ${done ? `${OK}55` : T.line}`, borderRadius: 6, padding: "1px 7px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {f.tipo}
              </span>
            </div>
          </div>
        );
      })}
      <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.45, display: "flex", gap: 8, marginTop: 2 }}>
        <i className="fa-solid fa-circle-info" style={{ color: accent, marginTop: 2 }} />
        <span>La etiqueta de la derecha indica el tipo de relación que debe expresar el conector.</span>
      </div>
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
        Cinco preguntas sobre concordancia gramatical y uso de conectores. Responde y pulsa «Comprobar».
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
                    <button key={oi} className="cc-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="cc-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="cc-btn" onClick={reintentar}>
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
