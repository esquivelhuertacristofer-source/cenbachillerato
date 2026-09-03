"use client";

/**
 * Laboratorio — Movimientos literarios: del Barroco a las Vanguardias
 * Práctica experimental para LC-III-P02-A2 (Lenguaje y Comunicación III).
 *
 * Interactividad máxima. Cuatro modos: los tres de arrastrar/clasificar y, al
 * final, uno que se escribe («Completa el texto», verbatim de la progresión):
 *  1. «¿A qué movimiento pertenece?» — clasifica diez obras y autores
 *     representativos entre los seis movimientos literarios de la fuente.
 *  2. «El rasgo de cada movimiento» — empareja cada movimiento con su rasgo
 *     definitorio (verbatim de las opciones correctas del quiz A2).
 *  3. «Escribe el término» — lee la definición verbatim (A5) y escribe
 *     de memoria el término del glosario que la nombra.
 *  + Cuestionario de comprensión (opción múltiple verbatim de A2).
 *
 * DOM puro (sin three.js): ligero, accesible (ratón, teclado y táctil mediante
 * clic-para-seleccionar / clic-para-colocar). Contenido VERBATIM de LC-III·P02.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { MOVIMIENTOS_LITERARIOS_HUECOS } from "./movimientos-literarios-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { MOVIMIENTOS_LITERARIOS_FICHA } from "./movimientos-literarios-ficha";
import {
  OBRAS,
  MOVIMIENTO_INFO,
  RASGOS,
  PARES,
  QUIZ,
  DATO_MOVIMIENTOS,
  type Movimiento,
} from "./movimientos-literarios-data";

const NO = "#FF5E5E";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
const RETO_KEY = "cen-movimientos-literarios-reto";

type Modo = "obras" | "rasgos" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "obras", label: "¿A qué movimiento pertenece?", icono: "fa-book" },
  { id: "rasgos", label: "El rasgo de cada movimiento", icono: "fa-list-check" },
  { id: "glosario", label: "Escribe el término", icono: "fa-keyboard" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

export function LabMovimientosLiterarios({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("obras");

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

  // ── modo obras (clasifica por movimiento) ──────────────────────────────
  const [ubicObra, setUbicObra] = useState<Record<string, Movimiento>>({});
  const [selObra, setSelObra] = useState<string | null>(null);
  const [shakeObra, setShakeObra] = useState<Movimiento | null>(null);
  const obrasLibres = OBRAS.filter((o) => !ubicObra[o.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarObra = (obraId: string, bin: Movimiento) => {
    if (ubicObra[obraId]) return;
    const o = OBRAS.find((x) => x.id === obraId);
    if (o && o.movimiento === bin) {
      setUbicObra((e) => ({ ...e, [obraId]: bin }));
      setSelObra(null);
      sfxPlace();
      if (Object.keys(ubicObra).length + 1 >= OBRAS.length) {
        sfxOk();
        persistMejor(true, rasgosDone, glosarioDone);
      }
    } else {
      setShakeObra(bin);
      sfxNo();
      window.setTimeout(() => setShakeObra(null), 420);
    }
  };
  const resetObras = () => {
    setUbicObra({});
    setSelObra(null);
  };

  // ── modo rasgos (empareja movimiento → rasgo) ──────────────────────────
  const [empRasgo, setEmpRasgo] = useState<Record<string, boolean>>({});
  const [selRasgo, setSelRasgo] = useState<string | null>(null);
  const [shakeRasgo, setShakeRasgo] = useState<string | null>(null);
  const rasgosLibres = RASGOS.filter((r) => !empRasgo[r.id]).slice().sort((a, b) => a.movimiento.localeCompare(b.movimiento, "es"));

  const intentarRasgo = (chipId: string, rowId: string) => {
    if (empRasgo[rowId]) return;
    if (chipId === rowId) {
      setEmpRasgo((e) => ({ ...e, [rowId]: true }));
      setSelRasgo(null);
      sfxPlace();
      if (Object.keys(empRasgo).length + 1 >= RASGOS.length) {
        sfxOk();
        persistMejor(obrasDone, true, glosarioDone);
      }
    } else {
      setShakeRasgo(rowId);
      sfxNo();
      window.setTimeout(() => setShakeRasgo(null), 420);
    }
  };
  const resetRasgos = () => {
    setEmpRasgo({});
    setSelRasgo(null);
  };

  // ── modo glosario (lee la definición y ESCRIBE el término) ─────────────
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
  const obrasDone = Object.keys(ubicObra).length >= OBRAS.length;
  const rasgosDone = Object.keys(empRasgo).length >= RASGOS.length;
  const modosHechos = (obrasDone ? 1 : 0) + (rasgosDone ? 1 : 0) + (glosarioDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los 3 modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 4);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);

  const persistMejor = (a: boolean, b: boolean, c: boolean) => {
    const est = (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0);
    registraEstrellas(est);
  };

  const objetivos = [
    { txt: "Clasifica las 10 obras por su movimiento", done: obrasDone },
    { txt: "Empareja los 5 rasgos con su movimiento", done: rasgosDone },
    { txt: "Escribe los 6 términos del glosario", done: glosarioDone },
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
  const resetActual = modo === "texto" ? resetTexto : modo === "obras" ? resetObras : modo === "rasgos" ? resetRasgos : resetGlosario;

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes mlShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes mlPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .ml-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 16px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .ml-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .ml-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .ml-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .ml-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .ml-icobtn:hover { background:rgba(255,255,255,0.12); }
        .ml-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:14px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:13.5px; font-weight:700; transition:all .14s; user-select:none; max-width:360px; text-align:left; line-height:1.4; }
        .ml-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
        .ml-chip[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
        .ml-chip:active { cursor:grabbing; }
        .ml-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; transition:all .16s; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
        .ml-row[data-shake="true"] { animation:mlShake .4s; border-color:${NO}; }
        .ml-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
        .ml-slot { flex-shrink:0; min-width:190px; min-height:42px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
          display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:12.5px; transition:all .16s; cursor:pointer; padding:4px 10px; }
        .ml-slot[data-armed="true"] { border-color:${accent}; background:rgba(${color.rgba},0.1); }
        .ml-bin { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; transition:all .16s; min-height:180px; }
        .ml-bin[data-shake="true"] { animation:mlShake .4s; border-color:${NO}; }
        .ml-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
        .ml-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
        .ml-q:disabled{ cursor:default; }
        .ml-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .ml-btn:hover { border-color:${T.lineStrong}; }
        .ml-divider { height:1px; background:${T.line}; margin:18px 0; }
        @media (prefers-reduced-motion: reduce){ .ml-row[data-shake="true"], .ml-bin[data-shake="true"] { animation:none; } }

        /* Cajón de teoría */
        .ml-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .ml-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .ml-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .ml-drawer[data-open="true"] { transform:translateX(0); }
        .ml-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .ml-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .ml-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .ml-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .ml-teoria-fab { position:fixed; right:20px; bottom:20px; z-index:58; cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.86); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .ml-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
        @media (max-width: 640px){ .ml-teoria-fab { right:12px; bottom:12px; padding:10px 13px; font-size:12px; } }

        /* Identidad del tablero */
        .ml-bin, .ml-row { --tono:188; position:relative;
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
        .ml-bin:nth-of-type(6n+1), .ml-row:nth-of-type(6n+1) { --tono:188; }
        .ml-bin:nth-of-type(6n+2), .ml-row:nth-of-type(6n+2) { --tono:262; }
        .ml-bin:nth-of-type(6n+3), .ml-row:nth-of-type(6n+3) { --tono:44; }
        .ml-bin:nth-of-type(6n+4), .ml-row:nth-of-type(6n+4) { --tono:152; }
        .ml-bin:nth-of-type(6n+5), .ml-row:nth-of-type(6n+5) { --tono:330; }
        .ml-bin:nth-of-type(6n+6), .ml-row:nth-of-type(6n+6) { --tono:18; }
        .ml-bin::before, .ml-row::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
          background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
        .ml-bin[data-done="true"], .ml-row[data-done="true"] {
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }
        .ml-chip { transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
        .ml-chip:hover { transform:translateY(-2px); }
        .ml-chip[data-sel="true"] { transform:translateY(-3px) scale(1.02); }
        @media (prefers-reduced-motion: reduce){
          .ml-chip, .ml-chip:hover, .ml-chip[data-sel="true"] { transform:none; transition:none; }
        }
      `}</style>

      {/* selector de modo + toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        {MODOS.map((m) => (
          <button key={m.id} className="ml-tab" data-on={modo === m.id} onClick={() => setModo(m.id)}>
            <i className={`fa-solid ${m.icono}`} />
            {m.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
        <button className="ml-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría de la práctica">
          <i className="fa-solid fa-book-open" />
        </button>
        <button className="ml-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
          <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
        </button>
        <button className="ml-icobtn" onClick={resetActual} title="Reiniciar este modo">
          <i className="fa-solid fa-rotate-left" />
        </button>
      </div>

      {/* ── Cajón de teoría ──────────────────────────────────────────── */}
      <button className="ml-teoria-fab" onClick={() => setDrawer(true)}>
        <i className="fa-solid fa-book-open" />
        Teoría
      </button>
      <div className="ml-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="ml-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="ml-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="ml-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="ml-drawer-body">
          <FichaTeorica data={MOVIMIENTOS_LITERARIOS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,28vw,400px)", gap: 22, alignItems: "start" }}>
        {/* ── Columna principal ─────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {/* MODO 1 — obras */}
          {/* MODO — completa el texto (fill_blanks verbatim de la progresión) */}
          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={MOVIMIENTOS_LITERARIOS_HUECOS}
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

          {modo === "obras" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada obra o autor a su movimiento</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: obrasDone ? OK : T.text3 }}>
                    {Object.keys(ubicObra).length}/{OBRAS.length}
                  </span>
                </div>
                {obrasLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Clasificaste las {OBRAS.length} obras!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {obrasLibres.map((o) => (
                      <button key={o.id} className="ml-chip" data-sel={selObra === o.id} onClick={() => setSelObra((s) => (s === o.id ? null : o.id))} {...dragProps(o.id)}>
                        {o.texto}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <BinsObras selObra={selObra} shakeObra={shakeObra} ubicObra={ubicObra} onMatch={intentarObra} dropProps={dropProps} />
            </>
          )}

          {/* MODO 2 — rasgos */}
          {modo === "rasgos" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada movimiento a su rasgo definitorio</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: rasgosDone ? OK : T.text3 }}>
                    {Object.keys(empRasgo).length}/{RASGOS.length}
                  </span>
                </div>
                {rasgosLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Emparejaste los {RASGOS.length} movimientos!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {rasgosLibres.map((r) => (
                      <button key={r.id} className="ml-chip" data-sel={selRasgo === r.id} onClick={() => setSelRasgo((s) => (s === r.id ? null : r.id))} {...dragProps(r.id)}>
                        <i className="fa-solid fa-feather" style={{ fontSize: 11, color: T.text3 }} />
                        {r.movimiento}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <RowsRasgos selRasgo={selRasgo} shakeRasgo={shakeRasgo} empRasgo={empRasgo} onMatch={intentarRasgo} dropProps={dropProps} />
            </>
          )}

          {/* MODO 3 — glosario */}
          {modo === "glosario" && (
            <EscribeTermino
              key={glosIntento}
              pares={PARES}
              accent={accent}
              rgba={color.rgba}
              completado={glosarioDone}
              instrucciones="Lee la definición y escribe el término del glosario que le corresponde."
              onCompletado={() => {
                setGlosarioDone(true);
                sfxOk();
                persistMejor(obrasDone, rasgosDone, true);
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

            <div className="ml-divider" />

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
                  {bestEstrellas >= 3 ? "¡Reconoces los movimientos literarios como un crítico!" : "Termina los tres modos para ganar 2★; la tercera pide 2 errores o menos."}
                </div>
              </div>
            </div>
          </div>

          {/* pista del modo actual */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid rgba(${color.rgba},0.3)`, background: `rgba(${color.rgba},0.08)`, fontSize: 13, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>
              {modo === "obras" && (
                <>El <strong style={{ color: T.text }}>Barroco</strong> es del s. XVII; <strong style={{ color: T.text }}>Romanticismo</strong> y <strong style={{ color: T.text }}>Realismo</strong> del s. XIX; <strong style={{ color: T.text }}>Modernismo</strong>, <strong style={{ color: T.text }}>Vanguardias</strong> y <strong style={{ color: T.text }}>Realismo mágico</strong> del s. XX.</>
              )}
              {modo === "rasgos" && (
                <>Cada movimiento responde a una pregunta clave: ¿exalta la <strong style={{ color: T.text }}>emoción</strong> o la <strong style={{ color: T.text }}>objetividad</strong>?, ¿busca la <strong style={{ color: T.text }}>musicalidad</strong> o la <strong style={{ color: T.text }}>ruptura</strong>?</>
              )}
              {modo === "glosario" && (
                <>Ya no se arrastra: lee la definición y su ejemplo y escribe el término. Si te atoras, la pista te da la inicial y las letras.</>
              )}
            </span>
          </div>

          {/* dato verbatim */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid ${T.line}`, background: T.glass, fontSize: 12.5, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-circle-info" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>{DATO_MOVIMIENTOS}</span>
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

function BinsObras({
  selObra,
  shakeObra,
  ubicObra,
  onMatch,
  dropProps,
}: {
  selObra: string | null;
  shakeObra: Movimiento | null;
  ubicObra: Record<string, Movimiento>;
  onMatch: (obraId: string, bin: Movimiento) => void;
  dropProps: DropFactory;
}) {
  const bins: Movimiento[] = ["barroco", "romanticismo", "realismo", "modernismo", "vanguardias", "realismo-magico"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
      {bins.map((bin) => {
        const info = MOVIMIENTO_INFO[bin];
        const dentro = OBRAS.filter((o) => ubicObra[o.id] === bin);
        return (
          <div
            key={bin}
            className="ml-bin"
            data-shake={shakeObra === bin}
            onClick={() => selObra && onMatch(selObra, bin)}
            {...dropProps((id) => onMatch(id, bin))}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
              <i className={`fa-solid ${info.icono}`} style={{ color: T.text2 }} />
              <span style={{ fontSize: 13.5, fontWeight: 800, color: "#fff" }}>{info.titulo}</span>
            </div>
            <div style={{ fontSize: 11, color: T.text3, marginBottom: 12, lineHeight: 1.4 }}>{info.subtitulo}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dentro.length === 0 ? (
                <div style={{ fontSize: 12, color: T.text3, opacity: 0.6, padding: "8px 0" }}>Arrastra aquí…</div>
              ) : (
                dentro.map((o) => (
                  <span key={o.id} style={{ animation: "mlPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 12.5, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 10, color: OK, marginTop: 3 }} />
                    {o.texto}
                  </span>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RowsRasgos({
  selRasgo,
  shakeRasgo,
  empRasgo,
  onMatch,
  dropProps,
}: {
  selRasgo: string | null;
  shakeRasgo: string | null;
  empRasgo: Record<string, boolean>;
  onMatch: (chipId: string, rowId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {RASGOS.map((r) => {
        const done = empRasgo[r.id];
        return (
          <div
            key={r.id}
            className="ml-row"
            data-shake={shakeRasgo === r.id}
            data-done={done}
            onClick={() => !done && selRasgo && onMatch(selRasgo, r.id)}
            {...dropProps((id) => onMatch(id, r.id))}
          >
            <div className="ml-slot" data-armed={!done && !!selRasgo} style={done ? { borderStyle: "solid", borderColor: OK, background: `${OK}1a` } : undefined}>
              {done ? (
                <span style={{ animation: "mlPop .25s ease", fontSize: 13, fontWeight: 900, color: "#fff", display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <i className="fa-solid fa-feather" />
                  {r.movimiento}
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: 11 }} /> movimiento
                </span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: done ? "#fff" : T.text2, lineHeight: 1.4 }}>{r.rasgo}</div>
              <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.4, marginTop: 3 }}>{r.ejemplo}</div>
            </div>
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
        Cinco preguntas sobre los rasgos definitorios de cada movimiento literario. Elige la opción correcta y pulsa «Comprobar».
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 9 }}>
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
                    <button key={oi} className="ml-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="ml-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="ml-btn" onClick={reintentar}>
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
