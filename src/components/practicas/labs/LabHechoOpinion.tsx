"use client";

/**
 * Laboratorio — Hecho, idea y opinión
 * Práctica experimental para LC-I-P03-A9 (Lengua y Comunicación I, semestre 1):
 * «Analiza en textos de su elección la información, ideas, pensamientos y
 * opiniones, para comprender su sentido.»
 *
 * El corazón del laboratorio es TRABAJAR SOBRE UN TEXTO REAL, no mirar una
 * escena: el alumno elige un marcador (información / idea / opinión) y lo pasa
 * por los enunciados del propio párrafo. Cada acierto devuelve la explicación
 * de por qué ese enunciado es de ese tipo; cada fallo devuelve el criterio que
 * no se cumplió. Por eso es DOM puro y no three.js: aquí el fenómeno es el
 * texto, y cualquier escena 3D sería decoración.
 *
 * Cuatro modos, cada uno con un acto distinto:
 *  1. «Marca el texto»   — marcar dentro del párrafo y después juzgar si el
 *     texto quiere informar, convencer o las dos cosas (3 textos completos).
 *  2. «Clasifica»        — los nueve enunciados verbatim de A9 a sus columnas.
 *  3. «Caza la marca»    — clic sobre la PALABRA exacta que delata la
 *     valoración (o declarar que la oración no tiene ninguna), y ver cómo se
 *     reescribiría sin valorar.
 *  4. «Completa el texto» — los huecos verbatim de A5, escribiendo.
 *  + Reto evaluable con el quiz verbatim de A2.
 *
 * Contenido verbatim de LC-I·P03; los tres textos que se marcan son
 * ilustrativos (ver `hecho-opinion-data.ts` y la nota al pie).
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { HECHO_OPINION_HUECOS } from "./hecho-opinion-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { TableroObjetivos } from "./_objetivos";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { HECHO_OPINION_FICHA } from "./hecho-opinion-ficha";
import {
  TEXTOS,
  TOTAL_SEGMENTOS,
  CATEGORIAS,
  CATEGORIA_INFO,
  ERROR_POR_LENTE,
  PROPOSITO_INFO,
  ENUNCIADOS,
  INSTRUCCION_A9,
  MARCAS,
  QUIZ,
  HECHOS,
  DATO_RULFO,
  DEBATE_A6,
  PISTAS_A3,
  FUENTE,
  type Categoria,
  type Proposito,
  type Segmento,
  type TextoAnalizable,
  type Marca,
} from "./hecho-opinion-data";
import { FondoTermino, VinetaTermino } from "./_vineta";

const NO = "#FF5E5E";
const RETO_KEY = "cen-hecho-opinion-reto";

type Modo = "marcar" | "clasificar" | "marca" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "marcar", label: "Marca el texto", icono: "fa-highlighter" },
  { id: "clasificar", label: "Clasifica los enunciados", icono: "fa-layer-group" },
  { id: "marca", label: "Caza la marca", icono: "fa-magnifying-glass" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

const PROPOSITOS: Proposito[] = ["informar", "convencer", "ambas"];

export function LabHechoOpinion({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("marcar");

  // ── sonido y partida ──────────────────────────────────────────────────
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
  const sfxOk = () => sonido && audioRef.current?.correcto();
  const sfxNo = () => {
    partida.error();
    return sonido && audioRef.current?.incorrecto();
  };
  const sfxPlace = () => {
    partida.acierto();
    return sonido && audioRef.current?.blip();
  };

  /* ── MODO 1 · marcar el texto ───────────────────────────────────────── */
  const [txtIdx, setTxtIdx] = useState(0);
  const [lente, setLente] = useState<Categoria>("informacion");
  const [marcado, setMarcado] = useState<Record<string, Categoria>>({});
  const [ultimo, setUltimo] = useState<string | null>(null);
  const [fallo, setFallo] = useState<{ segId: string; lente: Categoria } | null>(null);
  const [shakeSeg, setShakeSeg] = useState<string | null>(null);
  const [propElegido, setPropElegido] = useState<Record<string, Proposito>>({});

  const texto: TextoAnalizable = TEXTOS[txtIdx]!;
  const marcadosDelTexto = texto.segmentos.filter((s) => marcado[s.id]).length;
  const textoCompleto = marcadosDelTexto >= texto.segmentos.length;
  const propOkDelTexto = propElegido[texto.id] === texto.proposito;

  const marcarSegmento = (seg: Segmento) => {
    if (marcado[seg.id]) return;
    if (seg.categoria === lente) {
      setMarcado((m) => ({ ...m, [seg.id]: lente }));
      setUltimo(seg.id);
      setFallo(null);
      sfxPlace();
      if (marcadosDelTexto + 1 >= texto.segmentos.length) sfxOk();
    } else {
      setFallo({ segId: seg.id, lente });
      setUltimo(null);
      setShakeSeg(seg.id);
      sfxNo();
      window.setTimeout(() => setShakeSeg(null), 420);
    }
  };

  const elegirProposito = (p: Proposito) => {
    if (propElegido[texto.id] === texto.proposito) return;
    setPropElegido((m) => ({ ...m, [texto.id]: p }));
    if (p === texto.proposito) sfxOk();
    else sfxNo();
  };

  const resetMarcar = () => {
    const quitar = new Set(texto.segmentos.map((s) => s.id));
    setMarcado((m) => Object.fromEntries(Object.entries(m).filter(([k]) => !quitar.has(k))));
    setPropElegido((m) => Object.fromEntries(Object.entries(m).filter(([k]) => k !== texto.id)));
    setUltimo(null);
    setFallo(null);
  };

  const marcarDone = Object.keys(marcado).length >= TOTAL_SEGMENTOS;
  const propositosDone = TEXTOS.every((t) => propElegido[t.id] === t.proposito);

  /* ── MODO 2 · clasificar los nueve enunciados (A9) ───────────────────── */
  const [ubic, setUbic] = useState<Record<string, Categoria>>({});
  const [selEnun, setSelEnun] = useState<string | null>(null);
  const [shakeBin, setShakeBin] = useState<Categoria | null>(null);
  const enunLibres = ENUNCIADOS.filter((e) => !ubic[e.id]);

  const intentarEnun = (enunId: string, bin: Categoria) => {
    if (ubic[enunId]) return;
    const e = ENUNCIADOS.find((x) => x.id === enunId);
    if (!e) return;
    if (e.categoria === bin) {
      setUbic((u) => ({ ...u, [enunId]: bin }));
      setSelEnun(null);
      sfxPlace();
      if (Object.keys(ubic).length + 1 >= ENUNCIADOS.length) sfxOk();
    } else {
      setShakeBin(bin);
      sfxNo();
      window.setTimeout(() => setShakeBin(null), 420);
    }
  };
  const resetClasificar = () => {
    setUbic({});
    setSelEnun(null);
  };
  const clasificarDone = Object.keys(ubic).length >= ENUNCIADOS.length;

  /* ── MODO 3 · caza la marca ─────────────────────────────────────────── */
  const [mIdx, setMIdx] = useState(0);
  const [resueltas, setResueltas] = useState<Record<string, boolean>>({});
  const [falloMarca, setFalloMarca] = useState<string | null>(null);
  const item: Marca = MARCAS[mIdx]!;
  const itemResuelto = resueltas[item.id] === true;

  const clicPalabra = (i: number) => {
    if (itemResuelto) return;
    if (!item.sinMarca && item.marcas.includes(i)) {
      setResueltas((r) => ({ ...r, [item.id]: true }));
      setFalloMarca(null);
      sfxPlace();
      if (Object.keys(resueltas).length + 1 >= MARCAS.length) sfxOk();
    } else {
      setFalloMarca(
        item.sinMarca
          ? "Ninguna palabra de esta oración valora nada: todas aportan el dato. Si crees que no hay marca, dilo con el botón de abajo."
          : "Esa palabra no valora: describe. Busca la que califica («mejor», «insoportable»), la que propone («deberíamos») o la que finge certeza («sin duda»).",
      );
      sfxNo();
    }
  };

  const clicSinMarca = () => {
    if (itemResuelto) return;
    if (item.sinMarca) {
      setResueltas((r) => ({ ...r, [item.id]: true }));
      setFalloMarca(null);
      sfxPlace();
      if (Object.keys(resueltas).length + 1 >= MARCAS.length) sfxOk();
    } else {
      setFalloMarca("Sí hay marca: alguna palabra de esta oración está valorando. Léela otra vez y señálala.");
      sfxNo();
    }
  };

  const resetMarcas = () => {
    setResueltas({});
    setFalloMarca(null);
    setMIdx(0);
  };
  const marcasDone = Object.keys(resueltas).length >= MARCAS.length;

  /* ── MODO 4 · completa el texto (A5 verbatim) ────────────────────────── */
  const [huecosDone, setHuecosDone] = useState(false);
  const [huecosIntento, setHuecosIntento] = useState(0);
  const resetHuecos = () => {
    setHuecosDone(false);
    setHuecosIntento((n) => n + 1);
  };

  /* ── reto evaluable ─────────────────────────────────────────────────── */
  const [quizAprobado, setQuizAprobado] = useState(false);

  /* ── objetivos ──────────────────────────────────────────────────────── */
  const todoHecho = marcarDone && propositosDone && clasificarDone && marcasDone && huecosDone;
  const objetivos = [
    { txt: `Marca los ${TEXTOS[0]!.segmentos.length} enunciados de la nota informativa`, done: TEXTOS[0]!.segmentos.every((s) => !!marcado[s.id]) },
    { txt: `Marca los ${TEXTOS[1]!.segmentos.length} enunciados de la columna de opinión`, done: TEXTOS[1]!.segmentos.every((s) => !!marcado[s.id]) },
    { txt: `Marca los ${TEXTOS[2]!.segmentos.length} enunciados del anuncio`, done: TEXTOS[2]!.segmentos.every((s) => !!marcado[s.id]) },
    { txt: "Acierta el propósito de los tres textos", done: propositosDone },
    { txt: `Clasifica los ${ENUNCIADOS.length} enunciados de la actividad`, done: clasificarDone },
    { txt: `Caza la marca de las ${MARCAS.length} oraciones`, done: marcasDone },
    { txt: "Completa el texto con los cuatro términos", done: huecosDone },
    { txt: "Aprueba el reto evaluable", done: quizAprobado },
    { txt: "Termina con 2 errores o menos", done: todoHecho && partida.errores <= 2 },
  ];

  /* ── arrastre nativo (modo clasificar) ──────────────────────────────── */
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
    role: "button" as const,
    tabIndex: 0,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        (e.currentTarget as HTMLElement).click();
      }
    },
  });

  const resetActual = modo === "marcar" ? resetMarcar : modo === "clasificar" ? resetClasificar : modo === "marca" ? resetMarcas : resetHuecos;

  const segUltimo = ultimo ? texto.segmentos.find((s) => s.id === ultimo) : undefined;
  const segFallo = fallo ? texto.segmentos.find((s) => s.id === fallo.segId) : undefined;

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes hopShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-5px);} 40%{transform:translateX(5px);} 60%{transform:translateX(-3px);} 80%{transform:translateX(3px);} }
        @keyframes hopPop { 0%{transform:scale(.7);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .hop-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 16px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .hop-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .hop-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .hop-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .hop-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .hop-icobtn:hover { background:rgba(255,255,255,0.12); }

        /* Selector de texto */
        .hop-doc { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:9px 14px; border-radius:10px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:12.5px; font-weight:800; transition:all .14s; }
        .hop-doc:hover { border-color:${T.lineStrong}; color:#fff; }
        .hop-doc[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; }
        .hop-doc[data-done="true"] { color:${OK}; border-color:${OK}66; }

        /* Marcadores (los tres lentes) */
        .hop-lente { cursor:pointer; flex:1; min-width:170px; text-align:left; padding:12px 14px; border-radius:14px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:${T.text2}; transition:all .15s; }
        .hop-lente:hover { border-color:${T.lineStrong}; }
        .hop-lente[data-on="true"] { color:#fff; }

        /* El texto marcable */
        .hop-parrafo { font-size:15.5px; line-height:2.15; color:${T.text}; }
        .hop-seg { cursor:pointer; display:inline; border-radius:5px; padding:2px 3px; margin:0 1px;
          border-bottom:2px dashed rgba(255,255,255,0.22); transition:background .15s, border-color .15s; }
        .hop-seg:hover { background:rgba(255,255,255,0.09); border-bottom-color:rgba(255,255,255,0.5); }
        .hop-seg:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
        .hop-seg[data-done="true"] { cursor:default; border-bottom-style:solid; font-weight:600; }
        .hop-seg[data-done="true"]:hover { background:inherit; }
        .hop-seg[data-shake="true"] { animation:hopShake .4s; background:${NO}22; border-bottom-color:${NO}; }
        .hop-badge { display:inline-flex; align-items:center; gap:4px; font-size:10px; font-weight:900; letter-spacing:.06em;
          text-transform:uppercase; padding:1px 6px; border-radius:999px; margin-left:5px; vertical-align:middle; }

        /* Palabras del modo «caza la marca» */
        .hop-word { cursor:pointer; display:inline-block; border-radius:7px; padding:3px 5px; margin:2px 1px;
          border:1px solid transparent; background:transparent; color:${T.text}; font-size:17px; line-height:1.7; transition:all .12s; }
        .hop-word:hover:not(:disabled) { background:rgba(255,255,255,0.11); border-color:${T.lineStrong}; }
        .hop-word:disabled { cursor:default; }
        .hop-word[data-hit="true"] { background:#FBBF2433; border-color:#FBBF24; color:#fff; font-weight:800; }

        /* Fichas y columnas del modo clasificar */
        .hop-chip { cursor:grab; display:inline-flex; align-items:center; gap:8px; padding:11px 15px; border-radius:13px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:13px; font-weight:700; transition:all .14s;
          user-select:none; max-width:340px; text-align:left; line-height:1.4; }
        .hop-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); transform:translateY(-2px); }
        .hop-chip[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; transform:translateY(-3px) scale(1.02); }
        .hop-chip:active { cursor:grabbing; }
        /* Aquí el color de cada columna NO es decorativo ni cíclico: lo pone el
           propio marcador (información / idea / opinión) desde el JSX, así que
           el tono es el significado y no se toca desde aquí. */
        .hop-bin { border-radius:16px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; transition:all .16s; min-height:250px; }
        .hop-bin[data-shake="true"] { animation:hopShake .4s; border-color:${NO}; }

        .hop-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .hop-btn:hover:not(:disabled) { border-color:${T.lineStrong}; }
        .hop-btn:disabled { opacity:.45; cursor:default; }
        .hop-btn[data-primary="true"] { background:${accent}; color:#04121f; border-color:${accent}; }
        .hop-paso { cursor:pointer; width:30px; height:30px; border-radius:9px; border:1px solid ${T.line}; background:${T.glass};
          color:${T.text3}; font-size:12.5px; font-weight:900; transition:all .14s; }
        .hop-paso:hover { border-color:${T.lineStrong}; color:#fff; }
        .hop-paso[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.18); color:#fff; }
        .hop-paso[data-done="true"] { color:${OK}; border-color:${OK}66; }
        .hop-divider { height:1px; background:${T.line}; margin:18px 0; }
        @media (prefers-reduced-motion: reduce){
          .hop-seg[data-shake="true"], .hop-bin[data-shake="true"] { animation:none; }
          .hop-chip, .hop-chip:hover, .hop-chip[data-sel="true"] { transform:none; }
        }

        /* Cajón de teoría */
        .hop-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .hop-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .hop-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .hop-drawer[data-open="true"] { transform:translateX(0); }
        .hop-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .hop-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .hop-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .hop-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .hop-teoria-fab { position:fixed; right:20px; bottom:20px; z-index:58; cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.86); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .hop-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
        @media (max-width: 640px){ .hop-teoria-fab { right:12px; bottom:12px; padding:10px 13px; font-size:12px; } }
        @media (max-width: 900px){ .hop-grid { grid-template-columns:minmax(0,1fr) !important; } }
      `}</style>

      {/* ── barra de modos y herramientas ───────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        {MODOS.map((m) => (
          <button key={m.id} className="hop-tab" data-on={modo === m.id} onClick={() => setModo(m.id)}>
            <i className={`fa-solid ${m.icono}`} />
            {m.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
        <button className="hop-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría de la práctica">
          <i className="fa-solid fa-book-open" />
        </button>
        <button className="hop-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
          <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
        </button>
        <button className="hop-icobtn" onClick={resetActual} title="Reiniciar este modo">
          <i className="fa-solid fa-rotate-left" />
        </button>
      </div>

      {/* ── cajón de teoría ─────────────────────────────────────────────── */}
      <button className="hop-teoria-fab" onClick={() => setDrawer(true)}>
        <i className="fa-solid fa-book-open" />
        Teoría
      </button>
      <div className="hop-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="hop-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="hop-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="hop-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="hop-drawer-body">
          <FichaTeorica data={HECHO_OPINION_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>

      <div className="hop-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,28vw,400px)", gap: 22, alignItems: "start" }}>
        {/* ── columna principal ─────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {/* MODO 1 — marca el texto */}
          {modo === "marcar" && (
            <>
              <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                {TEXTOS.map((t, i) => {
                  const listo = t.segmentos.every((s) => !!marcado[s.id]) && propElegido[t.id] === t.proposito;
                  return (
                    <button key={t.id} className="hop-doc" data-on={txtIdx === i} data-done={listo} onClick={() => { setTxtIdx(i); setUltimo(null); setFallo(null); }}>
                      <i className={`fa-solid ${listo ? "fa-circle-check" : t.icono}`} />
                      {t.genero}
                    </button>
                  );
                })}
              </div>

              {/* los tres marcadores */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {CATEGORIAS.map((c) => {
                  const info = CATEGORIA_INFO[c];
                  const on = lente === c;
                  return (
                    <button
                      key={c}
                      className="hop-lente"
                      data-on={on}
                      aria-pressed={on}
                      onClick={() => setLente(c)}
                      style={on ? { borderColor: info.color, background: `${info.color}1f`, boxShadow: `0 0 18px -7px ${info.color}` } : undefined}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 900, color: on ? "#fff" : info.color }}>
                        <i className={`fa-solid ${info.icono}`} />
                        {info.titulo}
                      </div>
                      <div style={{ fontSize: 11.5, lineHeight: 1.4, marginTop: 5, color: on ? T.text2 : T.text3 }}>{info.descripcion}</div>
                    </button>
                  );
                })}
              </div>

              {/* el texto */}
              <div style={{ ...card, padding: "20px 24px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <VinetaTermino termino={texto.titulo} color={accent} icono={texto.icono} tam={33} radio={9} />
                    <span style={{ fontSize: 16, fontWeight: 900 }}>{texto.titulo}</span>
                    <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: T.text3 }}>{texto.genero}</span>
                  </div>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: textoCompleto ? OK : T.text3 }}>
                    {marcadosDelTexto}/{texto.segmentos.length} marcados
                  </span>
                </div>
                <div style={{ fontSize: 11.5, color: T.text3, marginBottom: 16 }}>{texto.credito}</div>

                <p className="hop-parrafo">
                  {texto.segmentos.map((s) => {
                    const cat = marcado[s.id];
                    const info = cat ? CATEGORIA_INFO[cat] : null;
                    return (
                      <span
                        key={s.id}
                        className="hop-seg"
                        role="button"
                        tabIndex={cat ? -1 : 0}
                        aria-label={cat ? `${s.texto} — marcado como ${info!.titulo}` : s.texto}
                        data-done={!!cat}
                        data-shake={shakeSeg === s.id}
                        onClick={() => marcarSegmento(s)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            marcarSegmento(s);
                          }
                        }}
                        style={info ? { background: `${info.color}26`, borderBottomColor: info.color } : undefined}
                      >
                        {s.texto}
                        {info && (
                          <span className="hop-badge" style={{ background: `${info.color}33`, color: info.color, animation: "hopPop .25s ease" }}>
                            <i className={`fa-solid ${info.icono}`} style={{ fontSize: 9 }} />
                            {info.titulo}
                          </span>
                        )}{" "}
                      </span>
                    );
                  })}
                </p>

                {/* retroalimentación del último clic */}
                {segFallo && fallo && (
                  <div style={{ marginTop: 16, borderRadius: 13, border: `1px solid ${NO}55`, background: `${NO}12`, padding: "13px 16px", display: "flex", gap: 12 }}>
                    <i className="fa-solid fa-circle-xmark" style={{ color: NO, fontSize: 16, marginTop: 2 }} />
                    <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.55 }}>
                      <strong style={{ color: "#fff" }}>Eso no es {CATEGORIA_INFO[fallo.lente].titulo.toLowerCase()}.</strong> {ERROR_POR_LENTE[fallo.lente]}
                      <div style={{ marginTop: 6, color: T.text3 }}>
                        Prueba con otro marcador sobre «{segFallo.texto.length > 58 ? `${segFallo.texto.slice(0, 58)}…` : segFallo.texto}»
                      </div>
                    </div>
                  </div>
                )}
                {segUltimo && !fallo && (
                  <div
                    style={{
                      marginTop: 16,
                      borderRadius: 13,
                      border: `1px solid ${CATEGORIA_INFO[segUltimo.categoria].color}55`,
                      background: `${CATEGORIA_INFO[segUltimo.categoria].color}12`,
                      padding: "13px 16px",
                      display: "flex",
                      gap: 12,
                    }}
                  >
                    <i className={`fa-solid ${CATEGORIA_INFO[segUltimo.categoria].icono}`} style={{ color: CATEGORIA_INFO[segUltimo.categoria].color, fontSize: 16, marginTop: 2 }} />
                    <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.55 }}>
                      <strong style={{ color: "#fff" }}>{CATEGORIA_INFO[segUltimo.categoria].titulo}.</strong> {segUltimo.explicacion}
                    </div>
                  </div>
                )}
                {!segUltimo && !fallo && (
                  <div style={{ marginTop: 16, fontSize: 12.5, color: T.text3, display: "flex", gap: 10, alignItems: "center" }}>
                    <i className="fa-solid fa-hand-pointer" />
                    Elige un marcador arriba y toca el enunciado que le corresponda dentro del texto.
                  </div>
                )}
              </div>

              {/* propósito del texto */}
              <div style={{ ...card, padding: "18px 22px", opacity: textoCompleto ? 1 : 0.55 }}>
                <Eyebrow>
                  <i className="fa-solid fa-scale-balanced" style={{ marginRight: 8, color: accent }} />
                  ¿Este texto quiere informarte o convencerte?
                </Eyebrow>
                {!textoCompleto ? (
                  <div style={{ fontSize: 13, color: T.text3, lineHeight: 1.55 }}>
                    Marca primero los {texto.segmentos.length} enunciados. Con el texto entero a la vista podrás juzgar su propósito.
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                      {PROPOSITOS.map((p) => {
                        const elegido = propElegido[texto.id] === p;
                        const correcto = propOkDelTexto && p === texto.proposito;
                        const malo = elegido && !propOkDelTexto;
                        return (
                          <button
                            key={p}
                            className="hop-btn"
                            onClick={() => elegirProposito(p)}
                            disabled={propOkDelTexto}
                            style={correcto ? { borderColor: OK, background: `${OK}1c` } : malo ? { borderColor: NO, background: `${NO}1c` } : undefined}
                          >
                            <i className={`fa-solid ${PROPOSITO_INFO[p].icono}`} />
                            {PROPOSITO_INFO[p].titulo}
                          </button>
                        );
                      })}
                    </div>
                    {propOkDelTexto ? (
                      <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.6, display: "flex", gap: 11 }}>
                        <i className="fa-solid fa-circle-check" style={{ color: OK, marginTop: 3 }} />
                        <span>{texto.explicacionProposito}</span>
                      </div>
                    ) : propElegido[texto.id] ? (
                      <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.6, display: "flex", gap: 11 }}>
                        <i className="fa-solid fa-circle-xmark" style={{ color: NO, marginTop: 3 }} />
                        <span>
                          Todavía no. Cuenta los colores del párrafo: fíjate en cuántos enunciados son información y cuántos valoran o proponen. Ese reparto
                          delata el propósito.
                        </span>
                      </div>
                    ) : (
                      <div style={{ fontSize: 12.5, color: T.text3 }}>Decide con el párrafo marcado a la vista.</div>
                    )}
                  </>
                )}
              </div>
            </>
          )}

          {/* MODO 2 — clasifica los nueve enunciados */}
          {modo === "clasificar" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Los nueve enunciados de la actividad</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: clasificarDone ? OK : T.text3 }}>
                    {Object.keys(ubic).length}/{ENUNCIADOS.length}
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: T.text3, lineHeight: 1.5, marginBottom: 14 }}>{INSTRUCCION_A9}</div>
                {enunLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Clasificaste los {ENUNCIADOS.length} enunciados!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {enunLibres.map((e) => (
                      <button key={e.id} className="hop-chip" data-sel={selEnun === e.id} onClick={() => setSelEnun((v) => (v === e.id ? null : e.id))} {...dragProps(e.id)}>
                        <i className="fa-solid fa-quote-left" style={{ fontSize: 10, color: T.text3 }} />
                        {e.texto}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <ColumnasClasificar selEnun={selEnun} shakeBin={shakeBin} ubic={ubic} onMatch={intentarEnun} dropProps={dropProps} />
            </>
          )}

          {/* MODO 3 — caza la marca */}
          {modo === "marca" && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                {MARCAS.map((m, i) => (
                  <button key={m.id} className="hop-paso" data-on={mIdx === i} data-done={resueltas[m.id] === true} onClick={() => { setMIdx(i); setFalloMarca(null); }}>
                    {resueltas[m.id] === true ? <i className="fa-solid fa-check" /> : i + 1}
                  </button>
                ))}
                <span style={{ fontSize: 12.5, fontWeight: 800, color: marcasDone ? OK : T.text3, marginLeft: 4 }}>
                  {Object.keys(resueltas).length}/{MARCAS.length}
                </span>
              </div>

              <div style={{ ...card, padding: "22px 24px 24px" }}>
                <Eyebrow>
                  <i className="fa-solid fa-magnifying-glass" style={{ marginRight: 8, color: accent }} />
                  Señala la palabra que valora
                </Eyebrow>
                <div style={{ fontSize: 12.5, color: T.text3, lineHeight: 1.55, marginBottom: 16 }}>
                  Toca la palabra exacta que delata el juicio de quien escribe. Si la oración sólo da un dato comprobable, usa el botón «No hay marca».
                </div>

                <div style={{ padding: "12px 6px", borderRadius: 14, background: T.inset, border: `1px solid ${T.line}` }}>
                  {item.palabras.map((p, i) => (
                    <button
                      key={`${item.id}-${i}`}
                      className="hop-word"
                      disabled={itemResuelto}
                      data-hit={itemResuelto && item.marcas.includes(i)}
                      onClick={() => clicPalabra(i)}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
                  <button className="hop-btn" onClick={clicSinMarca} disabled={itemResuelto}>
                    <i className="fa-solid fa-ban" />
                    No hay marca: es información
                  </button>
                  <button className="hop-btn" data-primary={itemResuelto && mIdx < MARCAS.length - 1} onClick={() => { setMIdx((i) => Math.min(i + 1, MARCAS.length - 1)); setFalloMarca(null); }} disabled={mIdx >= MARCAS.length - 1}>
                    Siguiente oración
                    <i className="fa-solid fa-arrow-right" />
                  </button>
                </div>

                {falloMarca && !itemResuelto && (
                  <div style={{ marginTop: 16, borderRadius: 13, border: `1px solid ${NO}55`, background: `${NO}12`, padding: "13px 16px", display: "flex", gap: 12 }}>
                    <i className="fa-solid fa-circle-xmark" style={{ color: NO, fontSize: 16, marginTop: 2 }} />
                    <span style={{ fontSize: 13, color: T.text2, lineHeight: 1.55 }}>{falloMarca}</span>
                  </div>
                )}

                {itemResuelto && (
                  <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 11 }}>
                    <div style={{ borderRadius: 13, border: `1px solid ${OK}55`, background: `${OK}12`, padding: "13px 16px", display: "flex", gap: 12 }}>
                      <i className="fa-solid fa-circle-check" style={{ color: OK, fontSize: 16, marginTop: 2 }} />
                      <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.55 }}>
                        <strong style={{ color: "#fff" }}>{item.tipo}.</strong> {item.porque}
                      </div>
                    </div>
                    {item.reescritura && (
                      <div style={{ borderRadius: 13, border: `1px solid rgba(${color.rgba},0.32)`, background: `rgba(${color.rgba},0.09)`, padding: "13px 16px", display: "flex", gap: 12 }}>
                        <i className="fa-solid fa-pen-to-square" style={{ color: accent, fontSize: 16, marginTop: 2 }} />
                        <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.55 }}>
                          <strong style={{ color: "#fff" }}>Cómo se diría sin valorar. </strong>
                          {item.reescritura}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* MODO 4 — completa el texto (A5 verbatim) */}
          {modo === "texto" && (
            <CompletaTexto
              key={huecosIntento}
              data={HECHO_OPINION_HUECOS}
              accent={accent}
              rgba={color.rgba}
              completado={huecosDone}
              onCompletado={() => {
                setHuecosDone(true);
                sfxOk();
              }}
              onAcierto={sfxPlace}
              onError={sfxNo}
            />
          )}
        </div>

        {/* ── columna lateral ───────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ ...card, padding: "20px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
              Objetivos de la sesión
            </Eyebrow>
            <TableroObjetivos objetivos={objetivos} retoKey={RETO_KEY} accent={accent} />
          </div>

          {/* pista del modo actual */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid rgba(${color.rgba},0.3)`, background: `rgba(${color.rgba},0.08)`, fontSize: 13, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>
              {modo === "marcar" && (
                <>
                  Ante cada enunciado pregúntate: <strong style={{ color: T.text }}>¿dónde lo comprobaría?</strong> Si tiene respuesta, es información. Si explica
                  o relaciona hechos, es una idea. Si califica o propone, es una opinión.
                </>
              )}
              {modo === "clasificar" && (
                <>
                  Una <strong style={{ color: T.text }}>idea</strong> parte de datos reales pero propone una causa o un sentido; una{" "}
                  <strong style={{ color: T.text }}>opinión</strong> jerarquiza («la mejor») o propone lo que conviene («deberíamos»).
                </>
              )}
              {modo === "marca" && (
                <>
                  Las marcas de opinión más frecuentes son los <strong style={{ color: T.text }}>superlativos</strong> («el mejor»), los{" "}
                  <strong style={{ color: T.text }}>adjetivos de valor</strong> («insoportable») y los <strong style={{ color: T.text }}>verbos de deber</strong>{" "}
                  («deberíamos»). Dos de las siete oraciones no tienen ninguna.
                </>
              )}
              {modo === "texto" && (
                <>
                  Ya no se toca: se escribe. Si te atoras, el botón de pista te da la definición y el banco de palabras te deja tocar el término en vez de
                  teclearlo.
                </>
              )}
            </span>
          </div>

          {/* las tres preguntas de la reflexión A3, verbatim */}
          <div style={{ ...card, padding: "18px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-circle-question" style={{ marginRight: 8, color: accent }} />
              Las tres preguntas del lector crítico
            </Eyebrow>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: T.text2, lineHeight: 1.6, display: "flex", flexDirection: "column", gap: 7 }}>
              {PISTAS_A3.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>

          {/* dato verbatim */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid ${T.line}`, background: T.glass, fontSize: 12.5, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-circle-info" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>{DATO_RULFO}</span>
          </div>
        </div>
      </div>

      {/* ── hechos (A4) y debate (A6), verbatim ─────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px,1fr))", gap: 16, marginTop: 22 }}>
        <div style={{ ...card, padding: "20px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-check-double" style={{ marginRight: 8, color: accent }} />
            Hechos
          </Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {HECHOS.map((h, i) => (
              <div key={i} style={{ display: "flex", gap: 11 }}>
                <i
                  className={`fa-solid ${h.verdadero ? "fa-circle-check" : "fa-circle-xmark"}`}
                  style={{ color: h.verdadero ? OK : NO, fontSize: 14, marginTop: 3, flexShrink: 0 }}
                />
                <div style={{ fontSize: 12.5, lineHeight: 1.5 }}>
                  <div style={{ color: T.text }}>{h.enunciado}</div>
                  <div style={{ color: T.text3, marginTop: 3 }}>{h.retro}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...card, padding: "20px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-comments" style={{ marginRight: 8, color: accent }} />
            Debate de la progresión
          </Eyebrow>
          <div style={{ fontSize: 13.5, fontWeight: 800, color: T.text, lineHeight: 1.5, marginBottom: 14 }}>{DEBATE_A6.tema}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            {DEBATE_A6.posturas.map((p, i) => (
              <div key={i} style={{ borderRadius: 13, border: `1px solid ${T.line}`, background: T.inset, padding: "12px 14px" }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: T.text, lineHeight: 1.5 }}>{p.postura}</div>
                <ul style={{ margin: "8px 0 0", paddingLeft: 17, fontSize: 12, color: T.text3, lineHeight: 1.55 }}>
                  {p.argumentos.map((a, j) => (
                    <li key={j}>{a}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11.5, color: T.text3, marginTop: 12, lineHeight: 1.5 }}>
            El anuncio del modo «Marca el texto» es el caso para este debate: las dos posturas son defendibles y aquí no hay una respuesta moral correcta, sino
            argumentos mejor o peor sostenidos.
          </div>
        </div>
      </div>

      {/* ── reto evaluable (quiz A2 verbatim) ───────────────────────────── */}
      <RetoQuizCard
        quiz={QUIZ}
        accent={accent}
        rgba={color.rgba}
        aprobado={quizAprobado}
        onAprobado={() => setQuizAprobado(true)}
        playSfx={sonido ? (ok) => (ok ? sfxOk() : sfxNo()) : undefined}
        mensajeAprobado="Distingues el dato del juicio: ya lees críticamente."
      />

      {/* ── nota al pie ─────────────────────────────────────────────────── */}
      <div style={{ marginTop: 18, display: "flex", gap: 12, fontSize: 11.5, color: T.text3, lineHeight: 1.6 }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          Son <strong>verbatim</strong> de la progresión LC-I-P03: la lectura y el «¿sabías que?» de A1, el quiz evaluable de A2, las preguntas de A3, los
          hechos de A4, el texto con huecos de A5, el debate de A6 y los nueve enunciados de A9 con sus categorías y explicaciones. Los{" "}
          <strong>tres textos que se marcan</strong> y las <strong>siete oraciones</strong> del modo «Caza la marca» los escribí para esta práctica porque la
          progresión pide «textos de su elección» y no trae ninguno: son <strong>ilustrativos</strong>. La biblioteca de la colonia Las Águilas y la marca
          «Colibrí» son ficticias a propósito, para no atribuir a nadie real un texto que no escribió. Los datos externos que aparecen sí son reales y
          comprobables: Juan Rulfo publicó El Llano en llamas (1953) y Pedro Páramo (1955); el Metro de la Ciudad de México abrió en 1969; la Feria
          Internacional del Libro de Guadalajara se celebra desde 1987. Fuente: {FUENTE}
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Columnas del modo «Clasifica los enunciados» (A9)
 * ═══════════════════════════════════════════════════════════════════════════ */
type DropFactory = (onDrop: (id: string) => void) => {
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
};

function ColumnasClasificar({
  selEnun,
  shakeBin,
  ubic,
  onMatch,
  dropProps,
}: {
  selEnun: string | null;
  shakeBin: Categoria | null;
  ubic: Record<string, Categoria>;
  onMatch: (enunId: string, bin: Categoria) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 12 }}>
      {CATEGORIAS.map((bin) => {
        const info = CATEGORIA_INFO[bin];
        const dentro = ENUNCIADOS.filter((e) => ubic[e.id] === bin);
        return (
          <div
            key={bin}
            className="hop-bin"
            data-shake={shakeBin === bin}
            onClick={() => selEnun && onMatch(selEnun, bin)}
            style={{ position: "relative", isolation: "isolate", borderColor: `${info.color}44`,
              backgroundImage: `radial-gradient(120% 90% at 0% 0%, ${info.color}1a 0%, transparent 62%)`,
            }}
            {...dropProps((id) => onMatch(id, bin))}
          >
            {/* La ilustración del concepto llenando la caja vacía. */}
            <FondoTermino termino={info.titulo} />
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
              <VinetaTermino termino={info.titulo} color={info.color} icono={info.icono} tam={29} radio={8} />
              <span style={{ fontSize: 13.5, fontWeight: 900, color: "#fff" }}>{info.titulo}</span>
            </div>
            <div style={{ fontSize: 11, color: T.text3, marginBottom: 12, lineHeight: 1.45 }}>{info.descripcion}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {dentro.length === 0 ? (
                <div style={{ fontSize: 12, color: T.text3, opacity: 0.6, padding: "8px 0" }}>Arrastra aquí…</div>
              ) : (
                dentro.map((e) => (
                  <div
                    key={e.id}
                    style={{
                      animation: "hopPop .25s ease",
                      padding: "9px 12px",
                      borderRadius: 11,
                      background: `${info.color}18`,
                      border: `1px solid ${info.color}55`,
                      lineHeight: 1.45,
                    }}
                  >
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: "#fff", display: "flex", gap: 7 }}>
                      <i className="fa-solid fa-check" style={{ fontSize: 10, color: info.color, marginTop: 4 }} />
                      <span>{e.texto}</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: T.text3, marginTop: 5, paddingLeft: 17 }}>{e.explicacion}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
