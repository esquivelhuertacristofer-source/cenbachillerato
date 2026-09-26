"use client";

/**
 * Laboratorio — Tu historia de vida como relato
 * Práctica experimental para LC-II-P01 (Lengua y Comunicación II).
 *
 * El tema de la progresión toca la vida privada del alumno, así que este
 * laboratorio NUNCA le pide ni evalúa confidencias. Lo evaluable es el OFICIO
 * de narrar, practicado sobre anécdotas ajenas (ficticias, escritas para la
 * práctica). Cinco modos:
 *
 *  1. «Ordena la anécdota» — coloca los seis momentos de un relato de
 *     experiencia en la línea del tiempo y después señala dónde está el giro
 *     y dónde la huella. Dos anécdotas.
 *  2. «¿Suceso, detalle o huella?» — separa doce frases en las tres capas de
 *     un relato de vida: narración, descripción e idea prioritaria.
 *  3. «¿Desde dónde se cuenta?» — tres controles (narrador, tiempo verbal,
 *     distancia) reescriben la misma escena de ocho maneras; cuatro encargos
 *     piden combinaciones concretas.
 *  4. «Escribe el término» — el glosario verbatim de A5, tecleado de memoria.
 *  5. «Completa el texto» — el fill_blanks verbatim de A2.
 *  + Reto evaluable con las afirmaciones verbatim de A4.
 *  + Cuaderno opcional: espacio privado para escribir lo propio. No se guarda,
 *    no se envía y no se califica.
 *
 * DOM puro (sin three.js): en Lengua el 3D sería decoración. Funciona con
 * ratón, teclado y pantalla táctil (clic-para-seleccionar / clic-para-colocar).
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { HISTORIA_DE_VIDA_HUECOS } from "./historia-de-vida-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { TableroObjetivos } from "./_objetivos";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { HISTORIA_DE_VIDA_FICHA } from "./historia-de-vida-ficha";
import {
  ANECDOTAS,
  MOMENTO_INFO,
  CAPA_INFO,
  FRAGMENTOS,
  PERSONA_INFO,
  TIEMPO_INFO,
  DISTANCIA_INFO,
  VERSIONES,
  ENCARGOS,
  claveVoz,
  PARES,
  QUIZ,
  LECTURA_A1,
  DATO_HISTORIA,
  CUADERNO,
  NOTA_PIE,
  type Capa,
  type Persona,
  type TiempoVerbal,
  type Distancia,
  type Anecdota,
  type TarjetaMomento,
} from "./historia-de-vida-data";

const NO = "#FF5E5E";
const RETO_KEY = "cen-historia-de-vida-reto";

type Modo = "linea" | "capas" | "voz" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "linea", label: "Ordena la anécdota", icono: "fa-timeline" },
  { id: "capas", label: "¿Suceso, detalle o huella?", icono: "fa-layer-group" },
  { id: "voz", label: "¿Desde dónde se cuenta?", icono: "fa-sliders" },
  { id: "glosario", label: "Escribe el término", icono: "fa-keyboard" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

export function LabHistoriaDeVida({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("linea");

  // ── sonido ────────────────────────────────────────────────────────────
  const partida = usePartida();
  const [sonido, setSonido] = useState(false);
  const [drawer, setDrawer] = useState(false);
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
  // Todos los aciertos y todos los fallos del laboratorio pasan por estos tres
  // ayudantes, así que la partida se lleva aquí. `sfxOk` no cuenta: marca el
  // fin de un modo, no una respuesta suelta.
  const sfxOk = () => sonido && audioRef.current?.correcto();
  const sfxNo = () => {
    partida.error();
    return sonido && audioRef.current?.incorrecto();
  };
  const sfxPlace = () => {
    partida.acierto();
    return sonido && audioRef.current?.blip();
  };

  // ── MODO 1 — línea del tiempo + giro y huella ─────────────────────────
  const [anecIdx, setAnecIdx] = useState(0);
  const [ordenados, setOrdenados] = useState<Record<string, string[]>>({});
  const [giroOk, setGiroOk] = useState<Record<string, boolean>>({});
  const [huellaOk, setHuellaOk] = useState<Record<string, boolean>>({});
  const [selTarjeta, setSelTarjeta] = useState<string | null>(null);
  const [shakeSlot, setShakeSlot] = useState(false);
  const [shakeMarca, setShakeMarca] = useState<string | null>(null);

  const anec: Anecdota = ANECDOTAS[anecIdx] ?? ANECDOTAS[0]!;
  const orden = ordenados[anec.id] ?? [];
  const sueltas = anec.tarjetas
    .filter((t) => !orden.includes(t.id))
    .slice()
    .sort((a, b) => a.texto.localeCompare(b.texto, "es"));
  const lineaLista = orden.length >= anec.tarjetas.length;

  const colocar = (tarjetaId: string) => {
    if (orden.includes(tarjetaId)) return;
    const siguiente = anec.tarjetas[orden.length];
    if (siguiente && siguiente.id === tarjetaId) {
      const nuevo = [...orden, tarjetaId];
      setOrdenados((o) => ({ ...o, [anec.id]: nuevo }));
      setSelTarjeta(null);
      sfxPlace();
      if (nuevo.length >= anec.tarjetas.length) sfxOk();
    } else {
      setShakeSlot(true);
      sfxNo();
      window.setTimeout(() => setShakeSlot(false), 420);
    }
  };

  const marcar = (tipo: "giro" | "huella", tarjeta: TarjetaMomento) => {
    const yaOk = tipo === "giro" ? giroOk[anec.id] : huellaOk[anec.id];
    if (yaOk) return;
    if (tarjeta.momento === tipo) {
      if (tipo === "giro") setGiroOk((g) => ({ ...g, [anec.id]: true }));
      else setHuellaOk((h) => ({ ...h, [anec.id]: true }));
      sfxPlace();
    } else {
      setShakeMarca(tarjeta.id);
      sfxNo();
      window.setTimeout(() => setShakeMarca(null), 420);
    }
  };

  const resetLinea = () => {
    setOrdenados((o) => ({ ...o, [anec.id]: [] }));
    setGiroOk((g) => ({ ...g, [anec.id]: false }));
    setHuellaOk((h) => ({ ...h, [anec.id]: false }));
    setSelTarjeta(null);
  };

  // ── MODO 2 — suceso / detalle / huella ────────────────────────────────
  const [ubicFrag, setUbicFrag] = useState<Record<string, Capa>>({});
  const [selFrag, setSelFrag] = useState<string | null>(null);
  const [shakeCapa, setShakeCapa] = useState<Capa | null>(null);
  const [porqueUltimo, setPorqueUltimo] = useState<string | null>(null);
  const fragLibres = FRAGMENTOS.filter((f) => !ubicFrag[f.id])
    .slice()
    .sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const clasificar = (fragId: string, capa: Capa) => {
    if (ubicFrag[fragId]) return;
    const f = FRAGMENTOS.find((x) => x.id === fragId);
    if (!f) return;
    if (f.capa === capa) {
      setUbicFrag((u) => ({ ...u, [fragId]: capa }));
      setSelFrag(null);
      setPorqueUltimo(f.porque);
      sfxPlace();
      if (Object.keys(ubicFrag).length + 1 >= FRAGMENTOS.length) sfxOk();
    } else {
      setShakeCapa(capa);
      setPorqueUltimo(null);
      sfxNo();
      window.setTimeout(() => setShakeCapa(null), 420);
    }
  };
  const resetCapas = () => {
    setUbicFrag({});
    setSelFrag(null);
    setPorqueUltimo(null);
  };

  // ── MODO 3 — voz narrativa ────────────────────────────────────────────
  const [persona, setPersona] = useState<Persona>("primera");
  const [tiempoV, setTiempoV] = useState<TiempoVerbal>("pasado");
  const [distancia, setDistancia] = useState<Distancia>("entonces");
  const [encargosOk, setEncargosOk] = useState<Record<string, boolean>>({});
  const [avisoVoz, setAvisoVoz] = useState<{ ok: boolean; texto: string } | null>(null);
  const encargoPendiente = ENCARGOS.find((e) => !encargosOk[e.id]) ?? null;
  const version = VERSIONES[claveVoz(persona, tiempoV, distancia)]!;

  const entregar = () => {
    if (!encargoPendiente) return;
    const e = encargoPendiente;
    const fallan: string[] = [];
    if (e.persona !== persona) fallan.push(`el narrador (pide ${PERSONA_INFO[e.persona].titulo.toLowerCase()})`);
    if (e.tiempo !== tiempoV) fallan.push(`el tiempo verbal (pide ${TIEMPO_INFO[e.tiempo].titulo.toLowerCase()})`);
    if (e.distancia !== distancia) fallan.push(`la distancia (pide ${DISTANCIA_INFO[e.distancia].titulo.toLowerCase()})`);
    if (fallan.length === 0) {
      setEncargosOk((v) => ({ ...v, [e.id]: true }));
      setAvisoVoz({ ok: true, texto: `Entregado. ${e.porque}` });
      sfxPlace();
      if (Object.keys(encargosOk).length + 1 >= ENCARGOS.length) sfxOk();
    } else {
      setAvisoVoz({ ok: false, texto: `Todavía no: revisa ${fallan.join(" y ")}.` });
      sfxNo();
    }
  };
  const resetVoz = () => {
    setEncargosOk({});
    setAvisoVoz(null);
    setPersona("primera");
    setTiempoV("pasado");
    setDistancia("entonces");
  };

  // ── MODO 4 — glosario que se escribe ──────────────────────────────────
  // El contador hace de `key`: subirlo remonta el componente y deja todas las
  // tarjetas en blanco.
  const [glosarioDone, setGlosarioDone] = useState(false);
  const [glosIntento, setGlosIntento] = useState(0);
  const resetGlosario = () => {
    setGlosarioDone(false);
    setGlosIntento((n) => n + 1);
  };

  // ── MODO 5 — completa el texto ────────────────────────────────────────
  const [textoDone, setTextoDone] = useState(false);
  const [textoIntento, setTextoIntento] = useState(0);
  const resetTexto = () => {
    setTextoDone(false);
    setTextoIntento((n) => n + 1);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── cuaderno opcional (privado: ni se guarda ni se califica) ──────────
  const [cuadernoAbierto, setCuadernoAbierto] = useState(false);
  const [cuaderno, setCuaderno] = useState("");

  const resetActual =
    modo === "texto" ? resetTexto : modo === "glosario" ? resetGlosario : modo === "linea" ? resetLinea : modo === "capas" ? resetCapas : resetVoz;

  // ── progreso ──────────────────────────────────────────────────────────
  const a0 = ANECDOTAS[0]!;
  const a1 = ANECDOTAS[1]!;
  const ordenListo = (id: string) => (ordenados[id]?.length ?? 0) >= 6;
  const marcasListas = (id: string) => giroOk[id] === true && huellaOk[id] === true;
  const capasDone = Object.keys(ubicFrag).length >= FRAGMENTOS.length;
  const vozDone = Object.keys(encargosOk).length >= ENCARGOS.length;

  const objetivos = [
    { txt: `Ordena la línea del tiempo de «${a0.titulo}»`, done: ordenListo(a0.id) },
    { txt: `Señala el giro y la huella de «${a0.titulo}»`, done: marcasListas(a0.id) },
    { txt: `Ordena la línea del tiempo de «${a1.titulo}»`, done: ordenListo(a1.id) },
    { txt: `Señala el giro y la huella de «${a1.titulo}»`, done: marcasListas(a1.id) },
    { txt: `Separa los ${FRAGMENTOS.length} fragmentos en sus tres capas`, done: capasDone },
    { txt: `Resuelve los ${ENCARGOS.length} encargos de voz narrativa`, done: vozDone },
    { txt: `Escribe los ${PARES.length} términos del glosario`, done: glosarioDone },
    { txt: "Completa el texto de la progresión", done: textoDone },
    { txt: `Aprueba el reto evaluable (${QUIZ.puntajeMinimo}%)`, done: quizAprobado },
  ];

  // arrastre nativo
  const dragProps = (id: string) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.setData("text/plain", id);
      e.dataTransfer.effectAllowed = "move";
      // El hueco que deja la tarjeta mientras viaja. Por atributo y no por
      // estado: un render por cada gesto de arrastre se nota con 20 tarjetas.
      e.currentTarget.setAttribute("data-arrastrando", "true");
    },
    onDragEnd: (e: React.DragEvent) => {
      // También cuando se suelta FUERA de cualquier zona; si no, la tarjeta se
      // queda medio borrada para siempre.
      e.currentTarget.removeAttribute("data-arrastrando");
      document.querySelectorAll('[data-sobre="true"]').forEach((z) => z.removeAttribute("data-sobre"));
    },
  });
  const dropProps = (onDrop: (id: string) => void) => ({
    "data-zona": "true" as const,
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    },
    onDragEnter: (e: React.DragEvent) => {
      e.preventDefault();
      e.currentTarget.setAttribute("data-sobre", "true");
    },
    onDragLeave: (e: React.DragEvent) => {
      // `dragleave` salta también al pasar sobre un HIJO de la zona. Apagar sin
      // comprobar deja la zona parpadeando mientras mueves la mano por dentro.
      const r = e.currentTarget.getBoundingClientRect();
      const fuera = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      if (fuera) e.currentTarget.removeAttribute("data-sobre");
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      e.currentTarget.removeAttribute("data-sobre");
      const id = e.dataTransfer.getData("text/plain");
      if (id) onDrop(id);
    },
  });

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes hdvShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes hdvPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .hdv-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 16px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .hdv-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .hdv-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .hdv-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .hdv-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .hdv-icobtn:hover { background:rgba(255,255,255,0.12); }
        .hdv-chip { cursor:grab; display:flex; align-items:flex-start; gap:10px; padding:12px 15px; border-radius:13px; text-align:left;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:13px; font-weight:600; transition:all .14s; user-select:none; line-height:1.5; width:100%; }
        .hdv-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
        .hdv-chip[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
        .hdv-chip:active { cursor:grabbing; }
        .hdv-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:13px 15px; transition:all .16s; display:flex; align-items:flex-start; gap:13px; }
        .hdv-row[data-shake="true"] { animation:hdvShake .4s; border-color:${NO}; }
        .hdv-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
        .hdv-slot { border-radius:12px; border:1.5px dashed ${T.lineStrong}; background:${T.inset}; padding:13px 15px;
          display:flex; align-items:center; justify-content:center; gap:9px; color:${T.text3}; font-size:12.5px; transition:all .16s; min-height:52px; }
        .hdv-slot[data-armed="true"] { border-color:${accent}; background:rgba(${color.rgba},0.1); color:#fff; cursor:pointer; }
        .hdv-slot[data-shake="true"] { animation:hdvShake .4s; border-color:${NO}; }
        .hdv-bin { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; transition:all .16s; min-height:210px; }
        .hdv-bin[data-shake="true"] { animation:hdvShake .4s; border-color:${NO}; }
        .hdv-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .hdv-btn:hover { border-color:${T.lineStrong}; }
        .hdv-btn:disabled { opacity:.45; cursor:default; }
        .hdv-seg { cursor:pointer; flex:1; padding:11px 12px; border-radius:11px; border:1.5px solid ${T.line}; background:${T.glass};
          color:${T.text2}; font-size:12.5px; font-weight:800; transition:all .14s; text-align:center; }
        .hdv-seg:hover { border-color:${T.lineStrong}; color:#fff; }
        .hdv-seg[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.18); color:#fff; }
        .hdv-mini { cursor:pointer; border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; border-radius:9px;
          padding:6px 12px; font-size:12px; font-weight:800; transition:all .14s; }
        .hdv-mini[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.18); color:#fff; }
        .hdv-mini:hover { border-color:${T.lineStrong}; color:#fff; }
        .hdv-area { width:100%; min-height:170px; border-radius:13px; border:1.5px solid ${T.line}; background:${T.inset}; color:#fff;
          font-family:inherit; font-size:14px; line-height:1.65; padding:14px 16px; outline:none; resize:vertical; }
        .hdv-area:focus { border-color:${accent}; box-shadow:0 0 0 3px rgba(${color.rgba},0.16); }
        .hdv-divider { height:1px; background:${T.line}; margin:18px 0; }
        @media (max-width: 900px){ .hdv-grid { grid-template-columns:minmax(0,1fr) !important; } }
        @media (prefers-reduced-motion: reduce){ .hdv-row[data-shake="true"], .hdv-bin[data-shake="true"], .hdv-slot[data-shake="true"] { animation:none; } }

        /* Cajón de teoría */
        .hdv-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .hdv-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .hdv-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .hdv-drawer[data-open="true"] { transform:translateX(0); }
        .hdv-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .hdv-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .hdv-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .hdv-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .hdv-teoria-fab { position:fixed; right:20px; bottom:20px; z-index:58; cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.86); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .hdv-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
        @media (max-width: 640px){ .hdv-teoria-fab { right:12px; bottom:12px; padding:10px 13px; font-size:12px; } }

        /* Identidad del tablero */
        .hdv-bin, .hdv-row { --tono:188; position:relative;
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
        .hdv-bin:nth-of-type(6n+1), .hdv-row:nth-of-type(6n+1) { --tono:188; }
        .hdv-bin:nth-of-type(6n+2), .hdv-row:nth-of-type(6n+2) { --tono:262; }
        .hdv-bin:nth-of-type(6n+3), .hdv-row:nth-of-type(6n+3) { --tono:44; }
        .hdv-bin:nth-of-type(6n+4), .hdv-row:nth-of-type(6n+4) { --tono:152; }
        .hdv-bin:nth-of-type(6n+5), .hdv-row:nth-of-type(6n+5) { --tono:330; }
        .hdv-bin:nth-of-type(6n+6), .hdv-row:nth-of-type(6n+6) { --tono:18; }
        .hdv-bin::before, .hdv-row::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
          background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
        .hdv-bin[data-done="true"], .hdv-row[data-done="true"] {
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }
        .hdv-chip { transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
        .hdv-chip:hover { transform:translateY(-2px); }
        .hdv-chip[data-sel="true"] { transform:translateY(-3px) scale(1.02); }
        @media (prefers-reduced-motion: reduce){
          .hdv-chip, .hdv-chip:hover, .hdv-chip[data-sel="true"] { transform:none; transition:none; }
        }
      `}</style>

      {/* selector de modo + barra */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        {MODOS.map((m) => (
          <button key={m.id} className="hdv-tab" data-on={modo === m.id} onClick={() => setModo(m.id)}>
            <i className={`fa-solid ${m.icono}`} />
            {m.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
        <button className="hdv-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría de la práctica">
          <i className="fa-solid fa-book-open" />
        </button>
        <button className="hdv-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
          <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
        </button>
        <button className="hdv-icobtn" onClick={resetActual} title="Reiniciar este modo">
          <i className="fa-solid fa-rotate-left" />
        </button>
      </div>

      {/* aviso de privacidad: se ve antes que nada */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
          borderRadius: 14,
          border: `1px solid rgba(${color.rgba},0.28)`,
          background: `rgba(${color.rgba},0.07)`,
          padding: "12px 16px",
          marginBottom: 18,
          fontSize: 12.5,
          color: T.text2,
          lineHeight: 1.55,
        }}
      >
        <i className="fa-solid fa-shield-halved" style={{ color: accent, fontSize: 15, marginTop: 2 }} />
        <span>
          Aquí <strong style={{ color: T.text }}>no se te pide contar nada tuyo</strong>. Vas a practicar el oficio de narrar sobre dos anécdotas
          ajenas, escritas para esta práctica con personajes ficticios. Si quieres escribir lo propio, abajo tienes un cuaderno opcional que{" "}
          <strong style={{ color: T.text }}>no se guarda, no se envía y no se califica</strong>.
        </span>
      </div>

      {/* ── Cajón de teoría ──────────────────────────────────────────── */}
      <button className="hdv-teoria-fab" onClick={() => setDrawer(true)}>
        <i className="fa-solid fa-book-open" />
        Teoría
      </button>
      <div className="hdv-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="hdv-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="hdv-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="hdv-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="hdv-drawer-body">
          <FichaTeorica data={HISTORIA_DE_VIDA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>

      <div className="hdv-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,28vw,400px)", gap: 22, alignItems: "start" }}>
        {/* ── Columna principal ─────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {/* MODO — completa el texto (fill_blanks verbatim de A2) */}
          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={HISTORIA_DE_VIDA_HUECOS}
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

          {/* MODO — glosario que se escribe (A5 verbatim) */}
          {modo === "glosario" && (
            <EscribeTermino
              key={glosIntento}
              pares={PARES}
              accent={accent}
              rgba={color.rgba}
              completado={glosarioDone}
              instrucciones="Lee la definición y su ejemplo y escribe el término del glosario que le corresponde."
              onCompletado={() => {
                setGlosarioDone(true);
                sfxOk();
              }}
              onAcierto={sfxPlace}
              onError={sfxNo}
            />
          )}

          {/* MODO — línea del tiempo */}
          {modo === "linea" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                  {ANECDOTAS.map((a, i) => (
                    <button
                      key={a.id}
                      className="hdv-mini"
                      data-on={anecIdx === i}
                      onClick={() => {
                        setAnecIdx(i);
                        setSelTarjeta(null);
                      }}
                    >
                      <i className="fa-solid fa-book-bookmark" style={{ marginRight: 7 }} />
                      {a.titulo}
                      {ordenListo(a.id) && marcasListas(a.id) && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
                    </button>
                  ))}
                  <div style={{ flex: 1 }} />
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: lineaLista ? OK : T.text3 }}>
                    {orden.length}/{anec.tarjetas.length}
                  </span>
                </div>
                <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.5 }}>
                  <i className="fa-solid fa-circle-info" style={{ marginRight: 7, color: accent }} />
                  {anec.ficha}
                </div>
              </div>

              <LineaDelTiempo
                anec={anec}
                orden={orden}
                selTarjeta={selTarjeta}
                shakeSlot={shakeSlot}
                shakeMarca={shakeMarca}
                giroOk={giroOk[anec.id] === true}
                huellaOk={huellaOk[anec.id] === true}
                onSlot={() => {
                  if (selTarjeta) colocar(selTarjeta);
                }}
                onDropSlot={(id) => colocar(id)}
                onMarcar={marcar}
                dropProps={dropProps}
              />

              <div style={{ ...card, padding: "18px 22px" }}>
                <Eyebrow>Momentos sueltos — colócalos en orden cronológico</Eyebrow>
                {sueltas.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Línea del tiempo armada! Ahora señala el giro y la huella arriba.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {sueltas.map((t) => (
                      <button
                        key={t.id}
                        className="hdv-chip"
                        data-sel={selTarjeta === t.id}
                        onClick={() => setSelTarjeta((s) => (s === t.id ? null : t.id))}
                        {...dragProps(t.id)}
                      >
                        <i className="fa-solid fa-grip-vertical" style={{ fontSize: 12, color: T.text3, marginTop: 3 }} />
                        <span>{t.texto}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* MODO — suceso / detalle / huella */}
          {modo === "capas" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada frase a su capa</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: capasDone ? OK : T.text3 }}>
                    {Object.keys(ubicFrag).length}/{FRAGMENTOS.length}
                  </span>
                </div>
                {fragLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Separaste las {FRAGMENTOS.length} frases!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    {fragLibres.map((f) => (
                      <button
                        key={f.id}
                        className="hdv-chip"
                        data-sel={selFrag === f.id}
                        onClick={() => setSelFrag((s) => (s === f.id ? null : f.id))}
                        {...dragProps(f.id)}
                      >
                        <i className="fa-solid fa-quote-left" style={{ fontSize: 11, color: T.text3, marginTop: 3 }} />
                        <span>{f.texto}</span>
                      </button>
                    ))}
                  </div>
                )}
                {porqueUltimo && (
                  <div
                    style={{
                      marginTop: 14,
                      borderRadius: 11,
                      border: `1px solid ${OK}55`,
                      background: `${OK}12`,
                      padding: "10px 14px",
                      fontSize: 12.5,
                      color: T.text2,
                      lineHeight: 1.55,
                      display: "flex",
                      gap: 10,
                    }}
                  >
                    <i className="fa-solid fa-lightbulb" style={{ color: OK, marginTop: 2 }} />
                    <span>{porqueUltimo}</span>
                  </div>
                )}
              </div>

              <MesaCapas
                ubicFrag={ubicFrag}
                selFrag={selFrag}
                shakeCapa={shakeCapa}
                onBin={(capa) => {
                  if (selFrag) clasificar(selFrag, capa);
                }}
                onDropBin={(fragId, capa) => clasificar(fragId, capa)}
                dropProps={dropProps}
              />
            </>
          )}

          {/* MODO — voz narrativa */}
          {modo === "voz" && (
            <ConsolaVoz
              persona={persona}
              tiempoV={tiempoV}
              distancia={distancia}
              texto={version.texto}
              efecto={version.efecto}
              encargo={encargoPendiente}
              hechos={Object.keys(encargosOk).length}
              aviso={avisoVoz}
              accent={accent}
              rgba={color.rgba}
              onPersona={setPersona}
              onTiempo={setTiempoV}
              onDistancia={setDistancia}
              onEntregar={entregar}
            />
          )}
        </div>

        {/* ── Columna lateral ───────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ ...card, padding: "20px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
              Objetivos de la sesión
            </Eyebrow>
            <TableroObjetivos objetivos={objetivos} retoKey={RETO_KEY} accent={accent} />
          </div>

          {/* pista del modo actual */}
          <div
            style={{
              borderRadius: 18,
              padding: "16px 18px",
              border: `1px solid rgba(${color.rgba},0.3)`,
              background: `rgba(${color.rgba},0.08)`,
              fontSize: 13,
              color: T.text2,
              lineHeight: 1.55,
              display: "flex",
              gap: 12,
            }}
          >
            <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>
              {modo === "linea" && (
                <>
                  Un relato de experiencia suele ir de la <strong style={{ color: T.text }}>situación inicial</strong> al{" "}
                  <strong style={{ color: T.text }}>detonante</strong>, crecer en el <strong style={{ color: T.text }}>desarrollo</strong>, cambiar
                  de dirección en el <strong style={{ color: T.text }}>giro</strong>, cerrar en el <strong style={{ color: T.text }}>desenlace</strong>{" "}
                  y terminar en la <strong style={{ color: T.text }}>huella</strong>.
                </>
              )}
              {modo === "capas" && (
                <>
                  Tres preguntas bastan: ¿<strong style={{ color: T.text }}>pasa algo</strong> (suceso)?, ¿
                  <strong style={{ color: T.text }}>cómo es</strong> (detalle)?, ¿<strong style={{ color: T.text }}>qué cambió</strong> en quien narra
                  (huella)? Son narración, descripción e idea prioritaria.
                </>
              )}
              {modo === "voz" && (
                <>
                  La misma escena cambia de sentido según quién la cuente, en qué tiempo y desde qué distancia. Mueve los controles, lee el efecto y
                  después entrega lo que te pide el editor.
                </>
              )}
              {modo === "glosario" && <>Ya no se arrastra: lee la definición y su ejemplo y escribe el término. La pista te da la inicial y las letras.</>}
              {modo === "texto" && <>El texto es el de la actividad de la progresión. Si te atoras, abre el banco de palabras o pide la pista del hueco.</>}
            </span>
          </div>

          {/* lectura verbatim A1 */}
          <div style={{ ...card, padding: "18px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-book-open-reader" style={{ marginRight: 8, color: accent }} />
              Lectura A1 · verbatim
            </Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {LECTURA_A1.map((p, i) => (
                <p key={i} style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: T.text2 }}>
                  {p}
                </p>
              ))}
            </div>
          </div>

          {/* dato verbatim */}
          <div
            style={{
              borderRadius: 18,
              padding: "16px 18px",
              border: `1px solid ${T.line}`,
              background: T.glass,
              fontSize: 12.5,
              color: T.text2,
              lineHeight: 1.55,
              display: "flex",
              gap: 12,
            }}
          >
            <i className="fa-solid fa-circle-info" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>
              <strong style={{ color: T.text }}>¿Sabías? </strong>
              {DATO_HISTORIA}
            </span>
          </div>
        </div>
      </div>

      {/* ── Cuaderno opcional ─────────────────────────────────────────── */}
      <div style={{ ...card, padding: "20px 24px", marginTop: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <Eyebrow>
            <i className="fa-solid fa-book" style={{ marginRight: 8, color: accent }} />
            Tu cuaderno · opcional y privado
          </Eyebrow>
          <div style={{ flex: 1 }} />
          <button className="hdv-btn" onClick={() => setCuadernoAbierto((v) => !v)} aria-expanded={cuadernoAbierto}>
            <i className={`fa-solid ${cuadernoAbierto ? "fa-chevron-up" : "fa-pen"}`} />
            {cuadernoAbierto ? "Cerrar el cuaderno" : "Abrir el cuaderno"}
          </button>
        </div>
        <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.6, marginTop: -4 }}>
          Si te dan ganas de escribir lo tuyo, este es el espacio. <strong style={{ color: T.text }}>No se guarda en ninguna parte, no se envía a
          nadie y el laboratorio no lo lee ni lo califica</strong>: lo que escribas vive solo en esta pantalla y se borra al recargar. No cuenta para
          los objetivos ni para las estrellas.
        </div>

        {cuadernoAbierto && (
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 13.5, color: T.text, lineHeight: 1.6, fontWeight: 600 }}>{CUADERNO.prompt}</div>
            <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              {CUADERNO.pistas.map((p, i) => (
                <li key={i} style={{ fontSize: 12.5, color: T.text3, lineHeight: 1.55 }}>
                  {p}
                </li>
              ))}
            </ul>
            <textarea
              className="hdv-area"
              value={cuaderno}
              onChange={(e) => setCuaderno(e.target.value)}
              placeholder="Escribe aquí si quieres. Nadie más lo va a leer."
              aria-label="Cuaderno opcional y privado (no se guarda ni se califica)"
            />
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: T.text3, fontVariantNumeric: "tabular-nums" }}>
                {cuaderno.trim() === "" ? 0 : cuaderno.trim().split(/\s+/).length} palabras · sin calificación
              </span>
              <button className="hdv-btn" onClick={() => setCuaderno("")} disabled={cuaderno === ""}>
                <i className="fa-solid fa-eraser" />
                Borrar lo escrito
              </button>
            </div>
          </div>
        )}
      </div>

      <RetoQuizCard
        quiz={QUIZ}
        accent={accent}
        rgba={color.rgba}
        aprobado={quizAprobado}
        onAprobado={() => setQuizAprobado(true)}
        mensajeAprobado="Distingues narración, descripción e idea prioritaria."
        playSfx={sonido ? (ok) => (ok ? sfxOk() : sfxNo()) : undefined}
        playPick={sonido ? () => void audioRef.current?.blip() : undefined}
      />

      {/* nota al pie */}
      <p style={{ marginTop: 20, fontSize: 11.5, color: T.text3, lineHeight: 1.6 }}>
        <i className="fa-solid fa-circle-info" style={{ marginRight: 7 }} />
        {NOTA_PIE}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Panel «Ordena la anécdota» — línea del tiempo + giro y huella
 * ═══════════════════════════════════════════════════════════════════════════ */
type DropFactory = (onDrop: (id: string) => void) => {
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
};

function LineaDelTiempo({
  anec,
  orden,
  selTarjeta,
  shakeSlot,
  shakeMarca,
  giroOk,
  huellaOk,
  onSlot,
  onDropSlot,
  onMarcar,
  dropProps,
}: {
  anec: Anecdota;
  orden: string[];
  selTarjeta: string | null;
  shakeSlot: boolean;
  shakeMarca: string | null;
  giroOk: boolean;
  huellaOk: boolean;
  onSlot: () => void;
  onDropSlot: (id: string) => void;
  onMarcar: (tipo: "giro" | "huella", tarjeta: TarjetaMomento) => void;
  dropProps: DropFactory;
}) {
  const completa = orden.length >= anec.tarjetas.length;
  const pendiente: "giro" | "huella" | null = !completa ? null : !giroOk ? "giro" : !huellaOk ? "huella" : null;

  return (
    <div style={{ ...card, padding: "18px 22px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        <Eyebrow>
          {completa ? "Señala dónde está el giro y dónde la huella" : `Línea del tiempo de «${anec.titulo}»`}
        </Eyebrow>
        {completa && (
          <span style={{ fontSize: 12.5, fontWeight: 800, color: giroOk && huellaOk ? OK : T.text3 }}>
            {(giroOk ? 1 : 0) + (huellaOk ? 1 : 0)}/2
          </span>
        )}
      </div>

      {pendiente && (
        <div
          style={{
            marginBottom: 14,
            borderRadius: 11,
            border: `1px solid ${T.lineStrong}`,
            background: T.inset,
            padding: "11px 14px",
            fontSize: 13,
            color: T.text,
            lineHeight: 1.55,
            display: "flex",
            gap: 10,
          }}
        >
          <i className="fa-solid fa-hand-pointer" style={{ marginTop: 2, color: "#FFC75A" }} />
          <span>
            {pendiente === "giro"
              ? "Toca el momento en que la historia cambia de dirección: el giro."
              : "Ahora toca el momento donde está la huella: lo que cambió en quien narra."}
          </span>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {anec.tarjetas.map((_, i) => {
          const puestaId = orden[i];
          const puesta = puestaId ? anec.tarjetas.find((t) => t.id === puestaId) : undefined;
          const esActivo = !puesta && i === orden.length;
          if (!puesta) {
            return (
              <div
                key={`slot-${i}`}
                className="hdv-slot"
                data-armed={esActivo && !!selTarjeta}
                data-shake={esActivo && shakeSlot}
                onClick={() => esActivo && onSlot()}
                role={esActivo ? "button" : undefined}
                tabIndex={esActivo ? 0 : undefined}
                onKeyDown={(e) => {
                  if (esActivo && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onSlot();
                  }
                }}
                {...(esActivo ? dropProps((id) => onDropSlot(id)) : {})}
              >
                {esActivo ? (
                  <>
                    <i className="fa-solid fa-arrow-down-to-bracket" /> Suelta aquí el momento {i + 1}
                  </>
                ) : (
                  <span style={{ opacity: 0.45 }}>Momento {i + 1}</span>
                )}
              </div>
            );
          }
          const info = MOMENTO_INFO[puesta.momento];
          const esGiro = puesta.momento === "giro";
          const esHuella = puesta.momento === "huella";
          const revelado = (esGiro && giroOk) || (esHuella && huellaOk);
          const marcable = pendiente !== null;
          const alMarcar = () => {
            if (pendiente) onMarcar(pendiente, puesta);
          };
          return (
            <div
              key={puesta.id}
              className="hdv-row"
              data-done={revelado || (!marcable && completa)}
              data-shake={shakeMarca === puesta.id}
              onClick={alMarcar}
              role={marcable ? "button" : undefined}
              tabIndex={marcable ? 0 : undefined}
              onKeyDown={(e) => {
                if (marcable && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  alMarcar();
                }
              }}
              style={marcable ? { cursor: "pointer" } : undefined}
            >
              <span
                style={{
                  flexShrink: 0,
                  width: 30,
                  height: 30,
                  borderRadius: 9,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 900,
                  color: "#fff",
                  background: "rgba(255,255,255,0.09)",
                  border: `1px solid ${T.line}`,
                }}
              >
                {i + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                  <i className={`fa-solid ${info.icono}`} style={{ fontSize: 11, color: T.text3 }} />
                  <span style={{ fontSize: 11.5, fontWeight: 900, letterSpacing: "0.06em", textTransform: "uppercase", color: revelado ? OK : T.text3 }}>
                    {completa ? info.titulo : "Momento"}
                  </span>
                  {revelado && (
                    <span style={{ animation: "hdvPop .25s ease", fontSize: 11, fontWeight: 800, color: OK }}>
                      <i className="fa-solid fa-circle-check" style={{ marginRight: 5 }} />
                      {esGiro ? "el giro" : "la huella"}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.55, color: "#fff" }}>{puesta.texto}</div>
                {completa && <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.45, marginTop: 5 }}>{info.descripcion}</div>}
              </div>
            </div>
          );
        })}
      </div>

      {completa && giroOk && huellaOk && (
        <div style={{ marginTop: 14, fontSize: 13, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
          <i className="fa-solid fa-circle-check" /> Anécdota resuelta: orden, giro y huella. Cambia de anécdota arriba para hacer la otra.
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Panel «¿Suceso, detalle o huella?»
 * ═══════════════════════════════════════════════════════════════════════════ */
function MesaCapas({
  ubicFrag,
  selFrag,
  shakeCapa,
  onBin,
  onDropBin,
  dropProps,
}: {
  ubicFrag: Record<string, Capa>;
  selFrag: string | null;
  shakeCapa: Capa | null;
  onBin: (capa: Capa) => void;
  onDropBin: (fragId: string, capa: Capa) => void;
  dropProps: DropFactory;
}) {
  const capas: Capa[] = ["suceso", "detalle", "huella"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 12 }}>
      {capas.map((capa) => {
        const info = CAPA_INFO[capa];
        const dentro = FRAGMENTOS.filter((f) => ubicFrag[f.id] === capa);
        return (
          <div
            key={capa}
            className="hdv-bin"
            data-shake={shakeCapa === capa}
            data-done={dentro.length >= 4}
            onClick={() => onBin(capa)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onBin(capa);
              }
            }}
            style={{ borderColor: `${info.color}55`, cursor: selFrag ? "pointer" : "default" }}
            {...dropProps((fragId) => onDropBin(fragId, capa))}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 5 }}>
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  color: "#fff",
                  background: `${info.color}33`,
                }}
              >
                <i className={`fa-solid ${info.icono}`} />
              </span>
              <span style={{ fontSize: 13.5, fontWeight: 900, color: "#fff" }}>{info.titulo}</span>
            </div>
            <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.45, marginBottom: 6 }}>{info.subtitulo}</div>
            <div style={{ fontSize: 11, color: info.color, lineHeight: 1.45, marginBottom: 12 }}>{info.prueba}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dentro.length === 0 ? (
                <span style={{ fontSize: 12, color: T.text3, opacity: 0.6 }}>Arrastra aquí…</span>
              ) : (
                dentro.map((f) => (
                  <span
                    key={f.id}
                    style={{
                      animation: "hdvPop .25s ease",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 7,
                      padding: "8px 11px",
                      borderRadius: 10,
                      background: `${info.color}1c`,
                      border: `1px solid ${info.color}55`,
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#fff",
                      lineHeight: 1.45,
                    }}
                  >
                    <i className="fa-solid fa-check" style={{ fontSize: 10, color: info.color, marginTop: 3 }} />
                    {f.texto}
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
 * Panel «¿Desde dónde se cuenta?» — consola de voz narrativa
 * ═══════════════════════════════════════════════════════════════════════════ */
function ConsolaVoz({
  persona,
  tiempoV,
  distancia,
  texto,
  efecto,
  encargo,
  hechos,
  aviso,
  accent,
  rgba,
  onPersona,
  onTiempo,
  onDistancia,
  onEntregar,
}: {
  persona: Persona;
  tiempoV: TiempoVerbal;
  distancia: Distancia;
  texto: string;
  efecto: string;
  encargo: { id: string; pedido: string } | null;
  hechos: number;
  aviso: { ok: boolean; texto: string } | null;
  accent: string;
  rgba: string;
  onPersona: (p: Persona) => void;
  onTiempo: (t: TiempoVerbal) => void;
  onDistancia: (d: Distancia) => void;
  onEntregar: () => void;
}) {
  const personas: Persona[] = ["primera", "tercera"];
  const tiempos: TiempoVerbal[] = ["pasado", "presente"];
  const distancias: Distancia[] = ["entonces", "ahora"];

  return (
    <>
      <div style={{ ...card, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
          <Eyebrow>Encargo de la revista escolar</Eyebrow>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: hechos >= ENCARGOS.length ? OK : T.text3 }}>
            {hechos}/{ENCARGOS.length}
          </span>
        </div>
        {encargo ? (
          <div style={{ fontSize: 14, color: "#fff", lineHeight: 1.6, fontStyle: "italic" }}>{encargo.pedido}</div>
        ) : (
          <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
            <i className="fa-solid fa-circle-check" /> ¡Entregaste los {ENCARGOS.length} encargos! Sigue moviendo los controles para ver las ocho versiones.
          </div>
        )}
      </div>

      <div style={{ ...card, padding: "18px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
        <Eyebrow>Los tres controles de la voz</Eyebrow>

        <div>
          <div style={{ fontSize: 11.5, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", color: T.text3, marginBottom: 8 }}>
            ¿Quién narra?
          </div>
          <div style={{ display: "flex", gap: 9 }}>
            {personas.map((p) => (
              <button key={p} className="hdv-seg" data-on={persona === p} onClick={() => onPersona(p)}>
                {PERSONA_INFO[p].titulo}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 12, color: T.text3, lineHeight: 1.5, marginTop: 7 }}>{PERSONA_INFO[persona].pista}</div>
        </div>

        <div>
          <div style={{ fontSize: 11.5, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", color: T.text3, marginBottom: 8 }}>
            ¿En qué tiempo verbal?
          </div>
          <div style={{ display: "flex", gap: 9 }}>
            {tiempos.map((t) => (
              <button key={t} className="hdv-seg" data-on={tiempoV === t} onClick={() => onTiempo(t)}>
                {TIEMPO_INFO[t].titulo}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 12, color: T.text3, lineHeight: 1.5, marginTop: 7 }}>{TIEMPO_INFO[tiempoV].pista}</div>
        </div>

        <div>
          <div style={{ fontSize: 11.5, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", color: T.text3, marginBottom: 8 }}>
            ¿Desde qué distancia?
          </div>
          <div style={{ display: "flex", gap: 9 }}>
            {distancias.map((d) => (
              <button key={d} className="hdv-seg" data-on={distancia === d} onClick={() => onDistancia(d)}>
                {DISTANCIA_INFO[d].titulo}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 12, color: T.text3, lineHeight: 1.5, marginTop: 7 }}>{DISTANCIA_INFO[distancia].pista}</div>
        </div>
      </div>

      <div
        style={{
          borderRadius: 18,
          border: `1px solid rgba(${rgba},0.3)`,
          background: `radial-gradient(120% 120% at 0% 0%, rgba(${rgba},0.12) 0%, transparent 60%), ${T.glass}`,
          padding: "20px 24px",
        }}
      >
        <Eyebrow>
          <i className="fa-solid fa-quote-left" style={{ marginRight: 8, color: accent }} />
          La escena, escrita así
        </Eyebrow>
        <p role="status" aria-live="polite" style={{ margin: 0, fontSize: 16, lineHeight: 1.75, color: "#fff" }}>
          {texto}
        </p>
        <div
          style={{
            marginTop: 14,
            paddingTop: 12,
            borderTop: `1px solid ${T.line}`,
            fontSize: 12.5,
            color: T.text2,
            lineHeight: 1.6,
            display: "flex",
            gap: 10,
          }}
        >
          <i className="fa-solid fa-wand-magic-sparkles" style={{ color: accent, marginTop: 2 }} />
          <span>{efecto}</span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <button className="hdv-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={onEntregar} disabled={!encargo}>
          <i className="fa-solid fa-paper-plane" />
          Entregar esta versión
        </button>
        {aviso && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              borderRadius: 11,
              padding: "10px 15px",
              border: `1px solid ${aviso.ok ? OK : NO}55`,
              background: `${aviso.ok ? OK : NO}14`,
              fontSize: 12.5,
              fontWeight: 700,
              color: aviso.ok ? OK : NO,
              lineHeight: 1.5,
              maxWidth: 560,
            }}
          >
            <i className={`fa-solid ${aviso.ok ? "fa-circle-check" : "fa-circle-exclamation"}`} />
            {aviso.texto}
          </span>
        )}
      </div>
    </>
  );
}
