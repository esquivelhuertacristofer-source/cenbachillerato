"use client";

/**
 * Laboratorio — Causalidad histórica
 * Práctica experimental para CH-I-P03-A4 (Conciencia Histórica I).
 *
 * Interactividad máxima. Cuatro modos: los tres de arrastrar/clasificar y, al
 * final, uno que se escribe («Completa el texto», verbatim de la progresión):
 *  1. «¿Qué tipo de causa?» — clasifica nueve hechos históricos en causa
 *     estructural, causa coyuntural o consecuencia (su ALCANCE temporal).
 *  2. «¿Monocausal o multicausal?» — detecta el error: clasifica explicaciones
 *     históricas como monocausales (error) o multicausales (correctas).
 *  3. «Escribe el término» — lee la definición verbatim (A5) y escribe
 *     de memoria el término del glosario que la nombra.
 *  + Cuestionario de comprensión (V/F verbatim de A4).
 *
 * DOM puro (sin three.js): ligero, accesible (ratón, teclado y táctil mediante
 * clic-para-seleccionar / clic-para-colocar). Contenido VERBATIM de CH-I·P03.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { CAUSALIDAD_HISTORICA_HUECOS } from "./causalidad-historica-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { CAUSALIDAD_HISTORICA_FICHA } from "./causalidad-historica-ficha";
import {
  CAUSAS,
  TIPO_CAUSA_INFO,
  EXPLICACIONES,
  EXPLICACION_INFO,
  PARES,
  QUIZ,
  DATO_CAUSALIDAD,
  type TipoCausa,
  type TipoExplicacion,
} from "./causalidad-historica-data";

const NO = "#FF5E5E";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
const RETO_KEY = "cen-causalidad-historica-reto";

type Modo = "causas" | "explicacion" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "causas", label: "¿Qué tipo de causa?", icono: "fa-diagram-project" },
  { id: "explicacion", label: "¿Monocausal o multicausal?", icono: "fa-scale-unbalanced" },
  { id: "glosario", label: "Escribe el término", icono: "fa-keyboard" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

export function LabCausalidadHistorica({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("causas");

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

  // ── modo causas (clasifica por alcance temporal) ───────────────────────
  const [ubicCausa, setUbicCausa] = useState<Record<string, TipoCausa>>({});
  const [selCausa, setSelCausa] = useState<string | null>(null);
  const [shakeCausa, setShakeCausa] = useState<TipoCausa | null>(null);
  const causasLibres = CAUSAS.filter((c) => !ubicCausa[c.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarCausa = (causaId: string, bin: TipoCausa) => {
    if (ubicCausa[causaId]) return;
    const c = CAUSAS.find((x) => x.id === causaId);
    if (c && c.tipo === bin) {
      setUbicCausa((e) => ({ ...e, [causaId]: bin }));
      setSelCausa(null);
      sfxPlace();
      if (Object.keys(ubicCausa).length + 1 >= CAUSAS.length) {
        sfxOk();
        persistMejor(true, explicacionDone, glosarioDone);
      }
    } else {
      setShakeCausa(bin);
      sfxNo();
      window.setTimeout(() => setShakeCausa(null), 420);
    }
  };
  const resetCausas = () => {
    setUbicCausa({});
    setSelCausa(null);
  };

  // ── modo explicación (monocausal vs multicausal) ───────────────────────
  const [ubicExpl, setUbicExpl] = useState<Record<string, TipoExplicacion>>({});
  const [selExpl, setSelExpl] = useState<string | null>(null);
  const [shakeExpl, setShakeExpl] = useState<TipoExplicacion | null>(null);
  const explLibres = EXPLICACIONES.filter((x) => !ubicExpl[x.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarExpl = (explId: string, bin: TipoExplicacion) => {
    if (ubicExpl[explId]) return;
    const x = EXPLICACIONES.find((e) => e.id === explId);
    if (x && x.tipo === bin) {
      setUbicExpl((e) => ({ ...e, [explId]: bin }));
      setSelExpl(null);
      sfxPlace();
      if (Object.keys(ubicExpl).length + 1 >= EXPLICACIONES.length) {
        sfxOk();
        persistMejor(causasDone, true, glosarioDone);
      }
    } else {
      setShakeExpl(bin);
      sfxNo();
      window.setTimeout(() => setShakeExpl(null), 420);
    }
  };
  const resetExplicacion = () => {
    setUbicExpl({});
    setSelExpl(null);
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
  const causasDone = Object.keys(ubicCausa).length >= CAUSAS.length;
  const explicacionDone = Object.keys(ubicExpl).length >= EXPLICACIONES.length;
  const modosHechos = (causasDone ? 1 : 0) + (explicacionDone ? 1 : 0) + (glosarioDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los 3 modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 4);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);

  const persistMejor = (a: boolean, b: boolean, c: boolean) => {
    const est = (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0);
    registraEstrellas(est);
  };

  const objetivos = [
    { txt: "Clasifica los 9 hechos por tipo de causa", done: causasDone },
    { txt: "Distingue explicaciones mono y multicausales", done: explicacionDone },
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
  const resetActual = modo === "texto" ? resetTexto : modo === "causas" ? resetCausas : modo === "explicacion" ? resetExplicacion : resetGlosario;

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes cauShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes cauPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .cau-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 16px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .cau-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .cau-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .cau-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .cau-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .cau-icobtn:hover { background:rgba(255,255,255,0.12); }
        .cau-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:14px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:13.5px; font-weight:700; transition:all .14s; user-select:none; max-width:360px; text-align:left; line-height:1.4; }
        .cau-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
        .cau-chip[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
        .cau-chip:active { cursor:grabbing; }
        .cau-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; transition:all .16s; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
        .cau-row[data-shake="true"] { animation:cauShake .4s; border-color:${NO}; }
        .cau-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
        .cau-slot { flex-shrink:0; min-width:170px; min-height:42px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
          display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:12.5px; transition:all .16s; cursor:pointer; padding:4px 10px; }
        .cau-slot[data-armed="true"] { border-color:${accent}; background:rgba(${color.rgba},0.1); }
        .cau-bin { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; transition:all .16s; min-height:230px; }
        .cau-bin[data-shake="true"] { animation:cauShake .4s; border-color:${NO}; }
        .cau-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
        .cau-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
        .cau-q:disabled{ cursor:default; }
        .cau-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .cau-btn:hover { border-color:${T.lineStrong}; }
        .cau-divider { height:1px; background:${T.line}; margin:18px 0; }
        @media (prefers-reduced-motion: reduce){ .cau-row[data-shake="true"], .cau-bin[data-shake="true"] { animation:none; } }

        /* Cajón de teoría */
        .cau-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .cau-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .cau-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .cau-drawer[data-open="true"] { transform:translateX(0); }
        .cau-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .cau-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .cau-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .cau-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .cau-teoria-fab { position:fixed; right:20px; bottom:20px; z-index:58; cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.86); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .cau-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
        @media (max-width: 640px){ .cau-teoria-fab { right:12px; bottom:12px; padding:10px 13px; font-size:12px; } }

        /* Identidad del tablero */
        .cau-bin, .cau-row { --tono:188; position:relative;
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
        .cau-bin:nth-of-type(6n+1), .cau-row:nth-of-type(6n+1) { --tono:188; }
        .cau-bin:nth-of-type(6n+2), .cau-row:nth-of-type(6n+2) { --tono:262; }
        .cau-bin:nth-of-type(6n+3), .cau-row:nth-of-type(6n+3) { --tono:44; }
        .cau-bin:nth-of-type(6n+4), .cau-row:nth-of-type(6n+4) { --tono:152; }
        .cau-bin:nth-of-type(6n+5), .cau-row:nth-of-type(6n+5) { --tono:330; }
        .cau-bin:nth-of-type(6n+6), .cau-row:nth-of-type(6n+6) { --tono:18; }
        .cau-bin::before, .cau-row::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
          background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
        .cau-bin[data-done="true"], .cau-row[data-done="true"] {
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }
        .cau-chip { transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
        .cau-chip:hover { transform:translateY(-2px); }
        .cau-chip[data-sel="true"] { transform:translateY(-3px) scale(1.02); }
        @media (prefers-reduced-motion: reduce){
          .cau-chip, .cau-chip:hover, .cau-chip[data-sel="true"] { transform:none; transition:none; }
        }
      `}</style>

      {/* selector de modo + toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        {MODOS.map((m) => (
          <button key={m.id} className="cau-tab" data-on={modo === m.id} onClick={() => setModo(m.id)}>
            <i className={`fa-solid ${m.icono}`} />
            {m.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
        <button className="cau-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría de la práctica">
          <i className="fa-solid fa-book-open" />
        </button>
        <button className="cau-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
          <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
        </button>
        <button className="cau-icobtn" onClick={resetActual} title="Reiniciar este modo">
          <i className="fa-solid fa-rotate-left" />
        </button>
      </div>

      {/* ── Cajón de teoría ──────────────────────────────────────────── */}
      <button className="cau-teoria-fab" onClick={() => setDrawer(true)}>
        <i className="fa-solid fa-book-open" />
        Teoría
      </button>
      <div className="cau-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="cau-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="cau-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="cau-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="cau-drawer-body">
          <FichaTeorica data={CAUSALIDAD_HISTORICA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,28vw,400px)", gap: 22, alignItems: "start" }}>
        {/* ── Columna principal ─────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {/* MODO 1 — causas */}
          {/* MODO — completa el texto (fill_blanks verbatim de la progresión) */}
          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={CAUSALIDAD_HISTORICA_HUECOS}
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

          {modo === "causas" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada hecho a su tipo de causa o consecuencia</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: causasDone ? OK : T.text3 }}>
                    {Object.keys(ubicCausa).length}/{CAUSAS.length}
                  </span>
                </div>
                {causasLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Clasificaste los 9 hechos!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {causasLibres.map((c) => (
                      <button key={c.id} className="cau-chip" data-sel={selCausa === c.id} onClick={() => setSelCausa((s) => (s === c.id ? null : c.id))} {...dragProps(c.id)}>
                        {c.texto}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <BinsCausas selCausa={selCausa} shakeCausa={shakeCausa} ubicCausa={ubicCausa} onMatch={intentarCausa} dropProps={dropProps} />
            </>
          )}

          {/* MODO 2 — explicación */}
          {modo === "explicacion" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada explicación: ¿una sola causa o varias?</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: explicacionDone ? OK : T.text3 }}>
                    {Object.keys(ubicExpl).length}/{EXPLICACIONES.length}
                  </span>
                </div>
                {explLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Clasificaste las {EXPLICACIONES.length} explicaciones!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {explLibres.map((x) => (
                      <button key={x.id} className="cau-chip" data-sel={selExpl === x.id} onClick={() => setSelExpl((s) => (s === x.id ? null : x.id))} {...dragProps(x.id)}>
                        {x.texto}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <BinsExplicacion selExpl={selExpl} shakeExpl={shakeExpl} ubicExpl={ubicExpl} onMatch={intentarExpl} dropProps={dropProps} />
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
                persistMejor(causasDone, explicacionDone, true);
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

            <div className="cau-divider" />

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
                  {bestEstrellas >= 3 ? "¡Piensas la historia con multicausalidad!" : "Termina los tres modos para ganar 2★; la tercera pide 2 errores o menos."}
                </div>
              </div>
            </div>
          </div>

          {/* pista del modo actual */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid rgba(${color.rgba},0.3)`, background: `rgba(${color.rgba},0.08)`, fontSize: 13, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>
              {modo === "causas" && (
                <>La causa <strong style={{ color: T.text }}>estructural</strong> es profunda y de larga duración; la <strong style={{ color: T.text }}>coyuntural</strong> es el detonante inmediato; la <strong style={{ color: T.text }}>consecuencia</strong> es el efecto posterior.</>
              )}
              {modo === "explicacion" && (
                <>Una explicación <strong style={{ color: T.text }}>monocausal</strong> usa palabras como «solo», «únicamente» o «exclusivamente». La <strong style={{ color: T.text }}>multicausal</strong> combina varios factores.</>
              )}
              {modo === "glosario" && (
                <>Ya no se arrastra: lee la definición y su ejemplo y escribe el término. Si te atoras, la pista te da la inicial y las letras.</>
              )}
            </span>
          </div>

          {/* dato verbatim */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid ${T.line}`, background: T.glass, fontSize: 12.5, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-circle-info" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>{DATO_CAUSALIDAD}</span>
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

function BinsCausas({
  selCausa,
  shakeCausa,
  ubicCausa,
  onMatch,
  dropProps,
}: {
  selCausa: string | null;
  shakeCausa: TipoCausa | null;
  ubicCausa: Record<string, TipoCausa>;
  onMatch: (causaId: string, bin: TipoCausa) => void;
  dropProps: DropFactory;
}) {
  const bins: TipoCausa[] = ["estructural", "coyuntural", "consecuencia"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
      {bins.map((bin) => {
        const info = TIPO_CAUSA_INFO[bin];
        const dentro = CAUSAS.filter((c) => ubicCausa[c.id] === bin);
        return (
          <div
            key={bin}
            className="cau-bin"
            data-shake={shakeCausa === bin}
            onClick={() => selCausa && onMatch(selCausa, bin)}
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
                dentro.map((c) => (
                  <span key={c.id} style={{ animation: "cauPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 12.5, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 10, color: OK, marginTop: 3 }} />
                    {c.texto}
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

function BinsExplicacion({
  selExpl,
  shakeExpl,
  ubicExpl,
  onMatch,
  dropProps,
}: {
  selExpl: string | null;
  shakeExpl: TipoExplicacion | null;
  ubicExpl: Record<string, TipoExplicacion>;
  onMatch: (explId: string, bin: TipoExplicacion) => void;
  dropProps: DropFactory;
}) {
  const bins: TipoExplicacion[] = ["monocausal", "multicausal"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
      {bins.map((bin) => {
        const info = EXPLICACION_INFO[bin];
        const dentro = EXPLICACIONES.filter((x) => ubicExpl[x.id] === bin);
        return (
          <div
            key={bin}
            className="cau-bin"
            data-shake={shakeExpl === bin}
            onClick={() => selExpl && onMatch(selExpl, bin)}
            {...dropProps((id) => onMatch(id, bin))}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
              <i className={`fa-solid ${info.icono}`} style={{ color: bin === "monocausal" ? NO : OK }} />
              <span style={{ fontSize: 13.5, fontWeight: 800, color: "#fff" }}>{info.titulo}</span>
            </div>
            <div style={{ fontSize: 11, color: T.text3, marginBottom: 12, lineHeight: 1.4 }}>{info.subtitulo}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dentro.length === 0 ? (
                <div style={{ fontSize: 12, color: T.text3, opacity: 0.6, padding: "8px 0" }}>Arrastra aquí…</div>
              ) : (
                dentro.map((x) => (
                  <span key={x.id} style={{ animation: "cauPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 12.5, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 10, color: OK, marginTop: 3 }} />
                    {x.texto}
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
        Cinco afirmaciones sobre causalidad y multicausalidad histórica. Decide si son verdaderas o falsas y pulsa «Comprobar».
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
                    <button key={oi} className="cau-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="cau-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="cau-btn" onClick={reintentar}>
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
