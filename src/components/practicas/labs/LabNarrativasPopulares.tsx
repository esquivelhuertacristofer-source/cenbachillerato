"use client";

/**
 * Laboratorio — La lengua de las narrativas populares.
 * Práctica interactiva para LC-II-P03 (Lengua y Comunicación II, 2.º semestre):
 * «Identifica características lingüísticas a partir de la lectura de narrativas
 * populares.»
 *
 * Por qué NO es un laboratorio 3D: el fenómeno de esta progresión es LA LENGUA
 * —qué huellas deja la voz en un texto que alguna vez se contó en voz alta—. Eso
 * ocurre dentro del texto, no en el espacio: una escena tridimensional aquí sería
 * decoración. DOM puro, accesible con ratón, teclado y pantalla táctil.
 *
 * Por qué no se parece a `subgeneros-narrativos`, `generos-literarios` ni
 * `movimientos-literarios`: aquellos clasifican OBRAS; este marca RASGOS dentro
 * de un texto y los pone a prueba trasladándolos a otro registro.
 *
 * Cinco modos:
 *  1. «Marca los rasgos» — dentro de tres relatos, identifica qué rasgo de la
 *     lengua oral es cada fragmento subrayado (fórmulas, repetición, diminutivo,
 *     voz regional, tiempo verbal, refrán, discurso directo, hipérbole).
 *  2. «De la voz al papel» — pasa una frase del registro oral al escrito y
 *     decide qué se queda en el camino.
 *  3. «¿De dónde viene esa voz?» — clasifica once palabras del relato según la
 *     lengua de la que vienen: náhuatl, maya yucateco o taíno.
 *  4. «Escribe el término» — el glosario A5, escrito de memoria.
 *  5. «Completa el texto» — los huecos verbatim de A2.
 *  + Hechos verdadero/falso (A4) y reto evaluable (A8 + reactivos propios).
 *
 * Criterio de respeto cultural, sostenido en todos los modos: las voces
 * regionales y las de lenguas originarias son variación legítima del español de
 * México, nunca errores ni pintoresquismo. Los relatos son textos propios
 * declarados ilustrativos; no se reproduce ninguna leyenda ni corrido real.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { NARRATIVAS_POPULARES_HUECOS } from "./narrativas-populares-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { TableroObjetivos } from "./_objetivos";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { NARRATIVAS_POPULARES_FICHA } from "./narrativas-populares-ficha";
import {
  RELATOS,
  RASGOS,
  RASGO_INFO,
  TOTAL_MARCAS,
  CASOS_REGISTRO,
  VOCES,
  LENGUA_INFO,
  GLOSARIO,
  HECHOS,
  RETO_QUIZ,
  COMPRENSION_A1,
  DATO_RULFO,
  NOTA_PIE,
  type Rasgo,
  type Lengua,
  type Relato,
  type CasoRegistro,
} from "./narrativas-populares-data";

const NO = "#FF5E5E";
const RETO_KEY = "cen-narrativas-populares-lengua-reto";

type Modo = "rasgos" | "registro" | "voces" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "rasgos", label: "Marca los rasgos", icono: "fa-highlighter" },
  { id: "registro", label: "De la voz al papel", icono: "fa-right-left" },
  { id: "voces", label: "¿De dónde viene esa voz?", icono: "fa-language" },
  { id: "glosario", label: "Escribe el término", icono: "fa-spell-check" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

const LENGUAS: Lengua[] = ["nahuatl", "maya", "taino"];

/** Todos los fragmentos marcables de los tres relatos, en un solo índice. */
const MARCAS = RELATOS.flatMap((r) =>
  r.segmentos.flatMap((s) => (s.marca ? [{ ...s.marca, texto: s.t, relatoId: r.id }] : []))
);
const IDS_APERTURA = MARCAS.filter((m) => m.rasgo === "apertura").map((m) => m.id);
const IDS_CIERRE = MARCAS.filter((m) => m.rasgo === "cierre").map((m) => m.id);

export function LabNarrativasPopulares({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("rasgos");

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

  /** El pie del laboratorio: la última explicación, siempre a la vista. */
  const [pie, setPie] = useState<{ ok: boolean; txt: string } | null>(null);

  const sfxOk = () => sonido && audioRef.current?.correcto();
  const sfxNo = (txt?: string) => {
    partida.error();
    if (txt) setPie({ ok: false, txt });
    return sonido && audioRef.current?.incorrecto();
  };
  const sfxPlace = (txt?: string) => {
    partida.acierto();
    if (txt) setPie({ ok: true, txt });
    return sonido && audioRef.current?.blip();
  };

  // ── modo 1: marca los rasgos ──────────────────────────────────────────
  const [relatoIdx, setRelatoIdx] = useState(0);
  const [marcadas, setMarcadas] = useState<Record<string, Rasgo>>({});
  const [selMarca, setSelMarca] = useState<string | null>(null);
  const [shakeMarca, setShakeMarca] = useState<string | null>(null);
  const relato = RELATOS[relatoIdx]!;

  const intentarRasgo = (marcaId: string, rasgo: Rasgo) => {
    const m = MARCAS.find((x) => x.id === marcaId);
    if (!m || marcadas[marcaId]) return;
    if (m.rasgo === rasgo) {
      const nuevas = { ...marcadas, [marcaId]: rasgo };
      setMarcadas(nuevas);
      setSelMarca(null);
      sfxPlace(m.porque);
      if (Object.keys(nuevas).length >= TOTAL_MARCAS) sfxOk();
    } else {
      setShakeMarca(marcaId);
      sfxNo(
        `«${m.texto}» no es ${RASGO_INFO[rasgo].label.toLowerCase()}. ${RASGO_INFO[rasgo].que} Vuelve a leer el fragmento y pregúntate qué hace en el relato.`
      );
      window.setTimeout(() => setShakeMarca(null), 420);
    }
  };
  const resetRasgos = () => {
    setMarcadas({});
    setSelMarca(null);
    setPie(null);
  };

  // ── modo 2: de la voz al papel ────────────────────────────────────────
  const [casoIdx, setCasoIdx] = useState(0);
  const [versiones, setVersiones] = useState<Record<string, string>>({});
  const [perdidas, setPerdidas] = useState<Record<string, string>>({});
  const caso = CASOS_REGISTRO[casoIdx]!;

  const elegirVersion = (casoId: string, opId: string) => {
    const c = CASOS_REGISTRO.find((x) => x.id === casoId);
    const op = c?.versiones.find((v) => v.id === opId);
    if (!c || !op || versiones[casoId]) return;
    if (op.ok) {
      const nuevas = { ...versiones, [casoId]: opId };
      setVersiones(nuevas);
      sfxPlace(op.porque);
      if (Object.keys(nuevas).length >= CASOS_REGISTRO.length) sfxOk();
    } else {
      sfxNo(op.porque);
    }
  };

  const elegirPerdida = (casoId: string, opId: string) => {
    const c = CASOS_REGISTRO.find((x) => x.id === casoId);
    const op = c?.perdidas.find((p) => p.id === opId);
    if (!c || !op || !versiones[casoId] || perdidas[casoId]) return;
    if (op.ok) {
      const nuevas = { ...perdidas, [casoId]: opId };
      setPerdidas(nuevas);
      sfxPlace(op.porque);
      if (Object.keys(nuevas).length >= CASOS_REGISTRO.length) sfxOk();
    } else {
      sfxNo(op.porque);
    }
  };
  const resetRegistro = () => {
    setVersiones({});
    setPerdidas({});
    setPie(null);
  };

  // ── modo 3: ¿de dónde viene esa voz? ──────────────────────────────────
  const [ubicVoz, setUbicVoz] = useState<Record<string, Lengua>>({});
  const [selVoz, setSelVoz] = useState<string | null>(null);
  const [shakeLengua, setShakeLengua] = useState<Lengua | null>(null);
  const vocesLibres = VOCES.filter((v) => !ubicVoz[v.id]);

  const intentarVoz = (vozId: string, lengua: Lengua) => {
    const v = VOCES.find((x) => x.id === vozId);
    if (!v || ubicVoz[vozId]) return;
    if (v.lengua === lengua) {
      const nuevas = { ...ubicVoz, [vozId]: lengua };
      setUbicVoz(nuevas);
      setSelVoz(null);
      sfxPlace(`${v.origen} ${v.enRelato}`);
      if (Object.keys(nuevas).length >= VOCES.length) sfxOk();
    } else {
      setShakeLengua(lengua);
      sfxNo(
        `«${v.palabra}» no viene del ${LENGUA_INFO[lengua].titulo.toLowerCase()}. ${v.origen} Que una palabra suene «antigua» no dice de qué lengua vino: hay que consultarlo.`
      );
      window.setTimeout(() => setShakeLengua(null), 420);
    }
  };
  const resetVoces = () => {
    setUbicVoz({});
    setSelVoz(null);
    setPie(null);
  };

  // ── modo 4: escribe el término ────────────────────────────────────────
  const [glosarioDone, setGlosarioDone] = useState(false);
  const [glosarioIntento, setGlosarioIntento] = useState(0);
  const resetGlosario = () => {
    setGlosarioDone(false);
    setGlosarioIntento((n) => n + 1);
    setPie(null);
  };

  // ── modo 5: completa el texto ─────────────────────────────────────────
  const [textoDone, setTextoDone] = useState(false);
  const [textoIntento, setTextoIntento] = useState(0);
  const resetTexto = () => {
    setTextoDone(false);
    setTextoIntento((n) => n + 1);
    setPie(null);
  };

  // ── hechos (A4) ───────────────────────────────────────────────────────
  const [hechos, setHechos] = useState<(boolean | null)[]>(() => HECHOS.map(() => null));
  const hechosResueltos = hechos.filter((h, i) => h !== null && h === HECHOS[i]!.respuesta).length;
  const hechosDone = hechosResueltos >= HECHOS.length;
  const responderHecho = (i: number, valor: boolean) => {
    const h = HECHOS[i]!;
    if (hechos[i] === h.respuesta) return;
    setHechos((prev) => prev.map((v, j) => (j === i ? valor : v)));
    if (valor === h.respuesta) sfxPlace(h.retro);
    else sfxNo(h.retro);
  };

  // ── reto evaluable ────────────────────────────────────────────────────
  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso ──────────────────────────────────────────────────────────
  const rasgosDone = Object.keys(marcadas).length >= TOTAL_MARCAS;
  const formulasDone =
    IDS_APERTURA.some((id) => marcadas[id]) && IDS_CIERRE.some((id) => marcadas[id]);
  const versionesDone = Object.keys(versiones).length >= CASOS_REGISTRO.length;
  const perdidasDone = Object.keys(perdidas).length >= CASOS_REGISTRO.length;
  const vocesDone = Object.keys(ubicVoz).length >= VOCES.length;

  const objetivos = [
    { txt: `Marca los ${TOTAL_MARCAS} rasgos de los tres relatos`, done: rasgosDone },
    { txt: "Distingue la fórmula de apertura de la de cierre", done: formulasDone },
    { txt: `Reescribe las ${CASOS_REGISTRO.length} frases en registro escrito`, done: versionesDone },
    { txt: `Decide qué se pierde en los ${CASOS_REGISTRO.length} traslados`, done: perdidasDone },
    { txt: `Clasifica las ${VOCES.length} voces por su lengua de origen`, done: vocesDone },
    { txt: `Escribe los ${GLOSARIO.length} términos del glosario`, done: glosarioDone },
    { txt: "Completa el texto de la progresión", done: textoDone },
    { txt: `Acierta los ${HECHOS.length} hechos verdadero o falso`, done: hechosDone },
    { txt: "Aprueba el reto evaluable (70 %)", done: quizAprobado },
  ];

  const resetActual =
    modo === "rasgos"
      ? resetRasgos
      : modo === "registro"
        ? resetRegistro
        : modo === "voces"
          ? resetVoces
          : modo === "glosario"
            ? resetGlosario
            : resetTexto;

  // arrastre nativo (ratón) + clic para seleccionar y clic para colocar (táctil)
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
    "data-zona": "true" as const,
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
        @keyframes napShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes napPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .nap-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 15px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13px; font-weight:800; transition:all .14s; }
        .nap-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .nap-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .nap-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .nap-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .nap-icobtn:hover { background:rgba(255,255,255,0.12); }
        .nap-prob { cursor:pointer; padding:8px 13px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass};
          color:${T.text2}; font-size:12.5px; font-weight:800; transition:all .14s; }
        .nap-prob:hover { border-color:${T.lineStrong}; color:#fff; }
        .nap-prob[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; }
        .nap-prob[data-done="true"] { color:${OK}; border-color:${OK}66; }

        /* Fragmento marcable dentro del relato */
        .nap-marca { cursor:pointer; display:inline; font:inherit; color:#fff; padding:2px 5px; margin:0 1px;
          border:none; border-bottom:2px dashed ${T.lineStrong}; background:rgba(255,255,255,0.05);
          border-radius:5px 5px 0 0; transition:background .14s, border-color .14s, box-shadow .14s; }
        .nap-marca:hover:not(:disabled) { background:rgba(255,255,255,0.13); border-bottom-color:${accent}; }
        .nap-marca[data-sel="true"] { background:rgba(${color.rgba},0.26); border-bottom-color:${accent};
          box-shadow:0 0 0 2px rgba(${color.rgba},0.35); }
        .nap-marca[data-shake="true"] { animation:napShake .4s; border-bottom-color:${NO}; background:${NO}22; }
        .nap-marca:disabled { cursor:default; border-bottom-style:solid; }

        /* Chips de la paleta de rasgos */
        .nap-rasgo { cursor:pointer; display:inline-flex; align-items:center; gap:8px; padding:9px 14px; border-radius:999px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:12.5px; font-weight:800; transition:all .14s; }
        .nap-rasgo:hover:not(:disabled) { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); transform:translateY(-2px); }
        .nap-rasgo:disabled { cursor:default; opacity:.45; }

        .nap-opt { cursor:pointer; display:flex; align-items:flex-start; gap:12px; width:100%; text-align:left;
          border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2};
          font-size:13.5px; line-height:1.55; font-weight:600; padding:13px 16px; transition:all .14s; }
        .nap-opt:hover:not(:disabled) { border-color:${T.lineStrong}; background:${T.glassSoft}; color:#fff; }
        .nap-opt:disabled { cursor:default; }
        .nap-opt[data-ok="true"] { border-color:${OK}; background:${OK}16; color:#fff; }
        .nap-opt[data-bad="true"] { border-color:${NO}; background:${NO}14; color:#fff; animation:napShake .4s; }

        .nap-chip { cursor:grab; display:inline-flex; align-items:center; gap:8px; padding:10px 16px; border-radius:999px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:800; transition:all .14s; user-select:none; }
        .nap-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); transform:translateY(-2px); }
        .nap-chip[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; transform:translateY(-3px); }
        .nap-chip:active { cursor:grabbing; }

        .nap-bin { border-radius:16px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; min-height:210px; transition:all .16s; position:relative; }
        .nap-bin[data-shake="true"] { animation:napShake .4s; border-color:${NO}; }
        .nap-bin::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px; background:var(--tono); }

        .nap-vf { cursor:pointer; padding:8px 16px; border-radius:10px; border:1.5px solid ${T.line}; background:${T.glass};
          color:${T.text2}; font-size:12.5px; font-weight:800; transition:all .14s; }
        .nap-vf:hover:not(:disabled) { border-color:${T.lineStrong}; color:#fff; }
        .nap-vf:disabled { cursor:default; opacity:.85; }
        .nap-vf[data-on="true"] { border-color:${OK}; background:${OK}1f; color:#fff; }
        .nap-vf[data-bad="true"] { border-color:${NO}; background:${NO}1f; color:#fff; }

        @media (prefers-reduced-motion: reduce){
          .nap-marca[data-shake="true"], .nap-bin[data-shake="true"], .nap-opt[data-bad="true"] { animation:none; }
          .nap-chip, .nap-chip:hover, .nap-chip[data-sel="true"], .nap-rasgo:hover { transform:none; }
        }

        /* Cajón de teoría */
        .nap-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .nap-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .nap-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .nap-drawer[data-open="true"] { transform:translateX(0); }
        .nap-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .nap-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .nap-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .nap-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .nap-teoria-fab { position:fixed; right:20px; bottom:20px; z-index:58; cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.86); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .nap-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
        @media (max-width: 640px){ .nap-teoria-fab { right:12px; bottom:12px; padding:10px 13px; font-size:12px; } }

        @media (max-width: 900px){ .nap-grid { grid-template-columns:minmax(0,1fr) !important; } }
      `}</style>

      {/* ── Barra de modos y herramientas ───────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        {MODOS.map((m) => (
          <button key={m.id} className="nap-tab" data-on={modo === m.id} onClick={() => setModo(m.id)}>
            <i className={`fa-solid ${m.icono}`} />
            {m.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
        <button className="nap-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría de la práctica">
          <i className="fa-solid fa-book-open" />
        </button>
        <button className="nap-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
          <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
        </button>
        <button className="nap-icobtn" onClick={resetActual} title="Reiniciar este modo">
          <i className="fa-solid fa-rotate-left" />
        </button>
      </div>

      {/* ── Cajón de teoría ─────────────────────────────────────────────── */}
      <button className="nap-teoria-fab" onClick={() => setDrawer(true)}>
        <i className="fa-solid fa-book-open" />
        Teoría
      </button>
      <div className="nap-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="nap-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="nap-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="nap-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="nap-drawer-body">
          <FichaTeorica data={NARRATIVAS_POPULARES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>

      <div
        className="nap-grid"
        style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,28vw,400px)", gap: 22, alignItems: "start" }}
      >
        {/* ── Columna principal ─────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {modo === "rasgos" && (
            <RasgosPanel
              accent={accent}
              relato={relato}
              relatoIdx={relatoIdx}
              marcadas={marcadas}
              selMarca={selMarca}
              shakeMarca={shakeMarca}
              onSelRelato={(i) => {
                setRelatoIdx(i);
                setSelMarca(null);
                setPie(null);
              }}
              onSelMarca={(id) => setSelMarca((s) => (s === id ? null : id))}
              onRasgo={(r) => {
                if (selMarca) intentarRasgo(selMarca, r);
              }}
            />
          )}

          {modo === "registro" && (
            <RegistroPanel
              accent={accent}
              caso={caso}
              casoIdx={casoIdx}
              versiones={versiones}
              perdidas={perdidas}
              onSelCaso={(i) => {
                setCasoIdx(i);
                setPie(null);
              }}
              onVersion={(id) => elegirVersion(caso.id, id)}
              onPerdida={(id) => elegirPerdida(caso.id, id)}
            />
          )}

          {modo === "voces" && (
            <VocesPanel
              ubicVoz={ubicVoz}
              selVoz={selVoz}
              shakeLengua={shakeLengua}
              vocesLibres={vocesLibres}
              onSelVoz={(id) => setSelVoz((s) => (s === id ? null : id))}
              onBin={(l) => {
                if (selVoz) intentarVoz(selVoz, l);
              }}
              onDropBin={(vozId, l) => intentarVoz(vozId, l)}
              dragProps={dragProps}
              dropProps={dropProps}
            />
          )}

          {modo === "glosario" && (
            <div style={{ ...card, padding: "20px 22px" }}>
              <Eyebrow>
                <i className="fa-solid fa-spell-check" style={{ marginRight: 8, color: accent }} />
                Glosario de la progresión · LC-II-P03-A5
              </Eyebrow>
              <EscribeTermino
                key={glosarioIntento}
                pares={GLOSARIO}
                accent={accent}
                rgba={color.rgba}
                completado={glosarioDone}
                instrucciones="Lee la definición y su ejemplo, y escribe el término que le corresponde. Se ignoran acentos y mayúsculas."
                onCompletado={() => {
                  setGlosarioDone(true);
                  setPie({
                    ok: true,
                    txt: "Completaste el glosario de memoria. Los seis términos describen el mismo circuito: un relato nace en una comunidad, viaja de boca en boca y hoy se reescribe en una pantalla sin dejar de ser suyo.",
                  });
                  sfxOk();
                }}
                onAcierto={() => sfxPlace()}
                onError={() => sfxNo()}
              />
            </div>
          )}

          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={NARRATIVAS_POPULARES_HUECOS}
              accent={accent}
              rgba={color.rgba}
              completado={textoDone}
              onCompletado={() => {
                setTextoDone(true);
                setPie({
                  ok: true,
                  txt: "Texto completo. Ese párrafo es el resumen de lo que acabas de marcar en los relatos: vocabulario coloquial y regional, sintaxis sencilla, pasado con saltos al presente, fórmulas de inicio e hipérbole.",
                });
                sfxOk();
              }}
              onAcierto={() => sfxPlace()}
              onError={() => sfxNo()}
            />
          )}

          {/* Pie: la última explicación, siempre a la vista */}
          <div
            role="status"
            aria-live="polite"
            style={{
              borderRadius: 14,
              border: `1px solid ${pie ? (pie.ok ? `${OK}55` : `${NO}55`) : T.line}`,
              background: pie ? (pie.ok ? `${OK}12` : `${NO}12`) : T.glass,
              padding: "13px 16px",
              fontSize: 13,
              lineHeight: 1.55,
              color: T.text2,
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              transition: "all .2s",
            }}
          >
            <i
              className={`fa-solid ${pie ? (pie.ok ? "fa-circle-check" : "fa-circle-exclamation") : "fa-comment-dots"}`}
              style={{ color: pie ? (pie.ok ? OK : NO) : T.text3, fontSize: 15, marginTop: 2 }}
            />
            <span>
              {pie
                ? pie.txt
                : "Aquí aparecerá la explicación de cada decisión: qué hace en el relato el fragmento que marcaste y qué se pierde al llevarlo al papel."}
            </span>
          </div>

          <ChuletaCard modo={modo} accent={accent} />
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

          {/* Qué se practica en el modo actual */}
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
              {modo === "rasgos" && (
                <>
                  Un relato popular deja <strong style={{ color: T.text }}>huellas de la voz</strong> en el papel. Toca un
                  fragmento subrayado y pregúntate qué hace ahí: ¿abre?, ¿mide el tiempo?, ¿acerca?, ¿cita a alguien?
                </>
              )}
              {modo === "registro" && (
                <>
                  La frase oral <strong style={{ color: T.text }}>no está mal dicha</strong>: está dicha para alguien que está
                  enfrente. Al escribirla para un lector ausente se gana precisión y se pierde algo. Averigua qué.
                </>
              )}
              {modo === "voces" && (
                <>
                  Ninguna de estas palabras es un adorno: todas nombran cosas para las que el español peninsular no tenía
                  nombre. Reconocer <strong style={{ color: T.text }}>de qué lengua vienen</strong> es reconocer de qué
                  tradición viene el relato.
                </>
              )}
              {modo === "glosario" && (
                <>
                  Recordar el término es más difícil —y enseña más— que reconocerlo entre opciones. Si te atoras, usa la pista o
                  abre el <strong style={{ color: T.text }}>banco de términos</strong>.
                </>
              )}
              {modo === "texto" && (
                <>
                  Lee el párrafo completo antes de escribir: el contexto decide la palabra. Pulsa{" "}
                  <strong style={{ color: T.text }}>Enter</strong> para comprobar cada hueco.
                </>
              )}
            </span>
          </div>

          {/* Dato verbatim del callout de A1 */}
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
              <strong style={{ color: T.text }}>¿Sabías?</strong> {DATO_RULFO}
            </span>
          </div>

          {/* Preguntas de comprensión de la lectura A1 (verbatim) */}
          <div style={{ ...card, padding: "18px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-book-open-reader" style={{ marginRight: 8, color: accent }} />
              Lectura A1 · para pensar
            </Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {COMPRENSION_A1.map((c, i) => (
                <details key={i} style={{ borderRadius: 11, border: `1px solid ${T.line}`, background: T.inset, padding: "10px 13px" }}>
                  <summary style={{ cursor: "pointer", fontSize: 13, fontWeight: 700, color: T.text2, lineHeight: 1.45 }}>
                    {c.pregunta}
                  </summary>
                  <p style={{ margin: "9px 0 0", fontSize: 12.5, color: T.text3, lineHeight: 1.5 }}>{c.guia}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>

      <HechosCard accent={accent} respuestas={hechos} onResponder={responderHecho} />

      <RetoQuizCard
        quiz={RETO_QUIZ}
        accent={accent}
        rgba={color.rgba}
        aprobado={quizAprobado}
        onAprobado={() => setQuizAprobado(true)}
        playSfx={sonido ? (ok) => (ok ? sfxOk() : sfxNo()) : undefined}
        mensajeAprobado="Ya no lees la narrativa popular sólo por lo que cuenta, sino por cómo está hecha su lengua."
      />

      {/* Nota al pie: qué es verbatim y qué es de este laboratorio */}
      <p style={{ margin: "20px 2px 0", fontSize: 11.5, lineHeight: 1.6, color: T.text3 }}>
        <i className="fa-solid fa-quote-right" style={{ marginRight: 7, opacity: 0.7 }} />
        {NOTA_PIE}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Chuleta del modo — la referencia que el alumno necesita a la mano.
 *
 * No es relleno: en «Marca los rasgos» hay que distinguir nueve categorías y en
 * «¿De dónde viene esa voz?», tres lenguas. Tenerlas delante convierte la
 * práctica en lectura atenta en lugar de adivinanza. En los modos de escritura
 * no aparece, porque ahí el andamiaje ya lo dan la pista y el banco.
 * ═══════════════════════════════════════════════════════════════════════════ */
function ChuletaCard({ modo, accent }: { modo: Modo; accent: string }) {
  if (modo === "glosario" || modo === "texto") return null;

  const filas: { titulo: string; nota: string; color: string; icono: string }[] =
    modo === "rasgos"
      ? RASGOS.map((r) => ({
          titulo: RASGO_INFO[r].label,
          nota: RASGO_INFO[r].que,
          color: RASGO_INFO[r].color,
          icono: RASGO_INFO[r].icono,
        }))
      : modo === "registro"
        ? [
            {
              titulo: "Registro oral",
              nota: "Se dice a alguien que está presente: hay entonación, gestos y posibilidad de repetir. Por eso admite fórmulas, repeticiones y voces sin comillas.",
              color: "#FFC75A",
              icono: "fa-comments",
            },
            {
              titulo: "Registro escrito",
              nota: "Se escribe para un lector ausente que no puede preguntar. Por eso necesita marcas explícitas: comillas, conectores, atribución de la fuente.",
              color: "#5BC0EB",
              icono: "fa-pen-nib",
            },
            {
              titulo: "Lo que NO es cambiar de registro",
              nota: "Sustituir palabras por sinónimos «más elegantes», o recortar el relato hasta que quepa en una línea. Eso no traslada: empobrece.",
              color: NO,
              icono: "fa-ban",
            },
          ]
        : LENGUAS.map((l) => ({
            titulo: LENGUA_INFO[l].titulo,
            nota: LENGUA_INFO[l].subtitulo,
            color: LENGUA_INFO[l].color,
            icono: LENGUA_INFO[l].icono,
          }));

  const titulo =
    modo === "rasgos"
      ? "Los nueve rasgos de la lengua oral"
      : modo === "registro"
        ? "Los dos registros y la trampa de en medio"
        : "Las tres lenguas de este archivo";

  return (
    <div style={{ ...card, padding: "18px 22px" }}>
      <Eyebrow>
        <i className="fa-solid fa-table-list" style={{ marginRight: 8, color: accent }} />
        {titulo}
      </Eyebrow>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px,1fr))", gap: 10 }}>
        {filas.map((f) => (
          <div
            key={f.titulo}
            style={{
              borderRadius: 12,
              border: `1px solid ${f.color}44`,
              background: `${f.color}0d`,
              padding: "11px 14px",
              display: "flex",
              gap: 11,
              alignItems: "flex-start",
            }}
          >
            <i className={`fa-solid ${f.icono}`} style={{ color: f.color, fontSize: 13, marginTop: 3 }} />
            <span>
              <strong style={{ display: "block", fontSize: 13, color: "#fff", marginBottom: 3 }}>{f.titulo}</strong>
              <span style={{ fontSize: 12, lineHeight: 1.5, color: T.text3 }}>{f.nota}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 1 — «Marca los rasgos»
 * ═══════════════════════════════════════════════════════════════════════════ */
function RasgosPanel({
  accent,
  relato,
  relatoIdx,
  marcadas,
  selMarca,
  shakeMarca,
  onSelRelato,
  onSelMarca,
  onRasgo,
}: {
  accent: string;
  relato: Relato;
  relatoIdx: number;
  marcadas: Record<string, Rasgo>;
  selMarca: string | null;
  shakeMarca: string | null;
  onSelRelato: (i: number) => void;
  onSelMarca: (id: string) => void;
  onRasgo: (r: Rasgo) => void;
}) {
  const delRelato = relato.segmentos.flatMap((s) => (s.marca ? [{ ...s.marca, texto: s.t }] : []));
  const hechasAqui = delRelato.filter((m) => marcadas[m.id]).length;
  const totales = RELATOS.reduce((n, r) => n + r.segmentos.filter((s) => s.marca).length, 0);
  const hechasTodas = Object.keys(marcadas).length;
  const seleccionado = selMarca ? delRelato.find((m) => m.id === selMarca) : undefined;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
        {RELATOS.map((r, i) => {
          const marcas = r.segmentos.filter((s) => s.marca);
          const listo = marcas.every((s) => s.marca && marcadas[s.marca.id]);
          return (
            <button key={r.id} className="nap-prob" data-on={relatoIdx === i} data-done={listo} onClick={() => onSelRelato(i)}>
              {listo && <i className="fa-solid fa-circle-check" style={{ marginRight: 6 }} />}
              {r.titulo}
            </button>
          );
        })}
        <span
          style={{
            marginLeft: "auto",
            fontSize: 12.5,
            fontWeight: 800,
            color: hechasTodas >= totales ? OK : T.text3,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {hechasTodas}/{totales}
        </span>
      </div>

      <div style={{ ...card, padding: "22px 26px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
          <Eyebrow>
            <i className="fa-solid fa-highlighter" style={{ marginRight: 8, color: accent }} />
            «{relato.titulo}» · {relato.tipo}
          </Eyebrow>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: hechasAqui >= delRelato.length ? OK : T.text3, fontVariantNumeric: "tabular-nums" }}>
            {hechasAqui}/{delRelato.length} en este relato
          </span>
        </div>

        <p style={{ margin: 0, fontSize: 16.5, lineHeight: 2.1, color: T.text2 }}>
          {relato.segmentos.map((s, i) => {
            if (!s.marca) return <span key={i}>{s.t}</span>;
            const marca = s.marca;
            const resuelto = marcadas[marca.id];
            const info = resuelto ? RASGO_INFO[resuelto] : null;
            return (
              <span key={i} style={{ whiteSpace: "normal" }}>
                <button
                  className="nap-marca"
                  data-sel={selMarca === marca.id}
                  data-shake={shakeMarca === marca.id}
                  disabled={!!resuelto}
                  aria-label={resuelto ? `${s.t} — ${info?.label}` : `Fragmento por identificar: ${s.t}`}
                  onClick={() => onSelMarca(marca.id)}
                  style={
                    resuelto && info
                      ? { background: `${info.color}2e`, borderBottomColor: info.color, color: "#fff" }
                      : undefined
                  }
                >
                  {s.t}
                </button>
                {resuelto && info && (
                  <span
                    style={{
                      animation: "napPop .25s ease",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      margin: "0 4px",
                      padding: "2px 9px",
                      borderRadius: 999,
                      fontSize: 10.5,
                      fontWeight: 900,
                      letterSpacing: "0.03em",
                      textTransform: "uppercase",
                      color: info.color,
                      background: `${info.color}1f`,
                      border: `1px solid ${info.color}66`,
                      verticalAlign: "middle",
                    }}
                  >
                    <i className={`fa-solid ${info.icono}`} style={{ fontSize: 9 }} />
                    {info.corto}
                  </span>
                )}
              </span>
            );
          })}
        </p>

        {hechasAqui >= delRelato.length && (
          <div
            style={{
              marginTop: 16,
              borderRadius: 12,
              border: `1px solid ${OK}55`,
              background: `${OK}0f`,
              padding: "12px 15px",
              fontSize: 13,
              lineHeight: 1.55,
              color: T.text2,
              display: "flex",
              gap: 11,
            }}
          >
            <i className="fa-solid fa-circle-check" style={{ color: OK, marginTop: 2 }} />
            <span>
              Relato completo. Quítale al texto los {delRelato.length} fragmentos que acabas de marcar y lo que queda es un
              resumen: la historia sigue, pero ya no suena a nadie contándola.
            </span>
          </div>
        )}
      </div>

      <div style={{ ...card, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <Eyebrow>
            {seleccionado ? "¿Qué rasgo es ese fragmento?" : "Toca un fragmento subrayado del relato"}
          </Eyebrow>
          {seleccionado && (
            <span style={{ fontSize: 13, fontWeight: 800, color: accent, fontStyle: "italic" }}>«{seleccionado.texto}»</span>
          )}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
          {RASGOS.map((r) => {
            const info = RASGO_INFO[r];
            return (
              <button
                key={r}
                className="nap-rasgo"
                disabled={!seleccionado}
                title={info.que}
                onClick={() => onRasgo(r)}
                style={seleccionado ? { borderColor: `${info.color}66`, background: `${info.color}14` } : undefined}
              >
                <i className={`fa-solid ${info.icono}`} style={{ fontSize: 11, color: info.color }} />
                {info.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 2 — «De la voz al papel»
 * ═══════════════════════════════════════════════════════════════════════════ */
function RegistroPanel({
  accent,
  caso,
  casoIdx,
  versiones,
  perdidas,
  onSelCaso,
  onVersion,
  onPerdida,
}: {
  accent: string;
  caso: CasoRegistro;
  casoIdx: number;
  versiones: Record<string, string>;
  perdidas: Record<string, string>;
  onSelCaso: (i: number) => void;
  onVersion: (id: string) => void;
  onPerdida: (id: string) => void;
}) {
  const versionOk = versiones[caso.id] ?? null;
  const perdidaOk = perdidas[caso.id] ?? null;
  const info = RASGO_INFO[caso.rasgo];

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
        {CASOS_REGISTRO.map((c, i) => (
          <button key={c.id} className="nap-prob" data-on={casoIdx === i} data-done={!!perdidas[c.id]} onClick={() => onSelCaso(i)}>
            {perdidas[c.id] && <i className="fa-solid fa-circle-check" style={{ marginRight: 6 }} />}
            {c.titulo}
          </button>
        ))}
        <span
          style={{
            marginLeft: "auto",
            fontSize: 12.5,
            fontWeight: 800,
            color: Object.keys(perdidas).length >= CASOS_REGISTRO.length ? OK : T.text3,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {Object.keys(perdidas).length}/{CASOS_REGISTRO.length}
        </span>
      </div>

      <div style={{ ...card, padding: "20px 24px" }}>
        <Eyebrow>
          <i className="fa-solid fa-comments" style={{ marginRight: 8, color: accent }} />
          Como se cuenta en voz alta
        </Eyebrow>
        <blockquote
          style={{
            margin: 0,
            padding: "16px 20px",
            borderRadius: 14,
            border: `1px solid ${info.color}55`,
            background: `${info.color}12`,
            fontSize: 16.5,
            lineHeight: 1.7,
            color: "#fff",
            fontStyle: "italic",
          }}
        >
          «{caso.oral}»
        </blockquote>
        <div style={{ marginTop: 11, display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, color: T.text3 }}>
          <i className={`fa-solid ${info.icono}`} style={{ color: info.color }} />
          Rasgo en juego: <strong style={{ color: info.color }}>{info.label}</strong>
        </div>
      </div>

      <div style={{ ...card, padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <Eyebrow>
            <i className="fa-solid fa-1" style={{ marginRight: 8, color: accent }} />
            ¿Cuál de estas tres es la versión en registro escrito?
          </Eyebrow>
          {versionOk && (
            <span style={{ fontSize: 12, fontWeight: 800, color: OK, display: "inline-flex", alignItems: "center", gap: 7 }}>
              <i className="fa-solid fa-circle-check" /> Resuelto
            </span>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {caso.versiones.map((v) => (
            <button
              key={v.id}
              className="nap-opt"
              disabled={!!versionOk}
              data-ok={versionOk === v.id}
              onClick={() => onVersion(v.id)}
            >
              <i
                className={`fa-solid ${versionOk === v.id ? "fa-circle-check" : "fa-circle"}`}
                style={{ fontSize: 14, marginTop: 3, color: versionOk === v.id ? OK : T.text3, opacity: versionOk === v.id ? 1 : 0.35 }}
              />
              <span>{v.texto}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ ...card, padding: "20px 24px", opacity: versionOk ? 1 : 0.55, transition: "opacity .2s" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <Eyebrow>
            <i className="fa-solid fa-2" style={{ marginRight: 8, color: accent }} />
            Y en ese traslado, ¿qué se pierde?
          </Eyebrow>
          {!versionOk && <span style={{ fontSize: 12, color: T.text3 }}>Resuelve antes la reescritura.</span>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {caso.perdidas.map((p) => (
            <button
              key={p.id}
              className="nap-opt"
              disabled={!versionOk || !!perdidaOk}
              data-ok={perdidaOk === p.id}
              onClick={() => onPerdida(p.id)}
            >
              <i
                className={`fa-solid ${perdidaOk === p.id ? "fa-circle-check" : "fa-circle"}`}
                style={{ fontSize: 14, marginTop: 3, color: perdidaOk === p.id ? OK : T.text3, opacity: perdidaOk === p.id ? 1 : 0.35 }}
              />
              <span>{p.texto}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 3 — «¿De dónde viene esa voz?»
 * ═══════════════════════════════════════════════════════════════════════════ */
function VocesPanel({
  ubicVoz,
  selVoz,
  shakeLengua,
  vocesLibres,
  onSelVoz,
  onBin,
  onDropBin,
  dragProps,
  dropProps,
}: {
  ubicVoz: Record<string, Lengua>;
  selVoz: string | null;
  shakeLengua: Lengua | null;
  vocesLibres: typeof VOCES;
  onSelVoz: (id: string) => void;
  onBin: (l: Lengua) => void;
  onDropBin: (vozId: string, l: Lengua) => void;
  dragProps: (id: string) => Record<string, unknown>;
  dropProps: (onDrop: (id: string) => void) => Record<string, unknown>;
}) {
  const colocadas = Object.keys(ubicVoz).length;
  return (
    <>
      <div style={{ ...card, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
          <Eyebrow>Arrastra cada palabra a la lengua de la que viene</Eyebrow>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: colocadas >= VOCES.length ? OK : T.text3, fontVariantNumeric: "tabular-nums" }}>
            {colocadas}/{VOCES.length}
          </span>
        </div>
        {vocesLibres.length === 0 ? (
          <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
            <i className="fa-solid fa-circle-check" /> ¡Clasificaste las {VOCES.length} voces! Ninguna es un préstamo exótico:
            las once están en el diccionario del español y las usamos todos los días.
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {vocesLibres.map((v) => (
              <button key={v.id} className="nap-chip" data-sel={selVoz === v.id} onClick={() => onSelVoz(v.id)} {...dragProps(v.id)}>
                {v.palabra}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px,1fr))", gap: 14 }}>
        {LENGUAS.map((l) => {
          const info = LENGUA_INFO[l];
          const dentro = VOCES.filter((v) => ubicVoz[v.id] === l);
          return (
            <div
              key={l}
              className="nap-bin"
              data-shake={shakeLengua === l}
              onClick={() => onBin(l)}
              {...dropProps((vozId) => onDropBin(vozId, l))}
              style={{
                borderColor: `${info.color}55`,
                background: `${info.color}0b`,
                cursor: selVoz ? "pointer" : "default",
                ["--tono" as string]: info.color,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    color: "#fff",
                    background: `${info.color}33`,
                  }}
                >
                  <i className={`fa-solid ${info.icono}`} />
                </span>
                <span style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>{info.titulo}</span>
              </div>
              <div style={{ fontSize: 11, color: T.text3, marginBottom: 12, lineHeight: 1.45 }}>{info.subtitulo}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {dentro.length === 0 ? (
                  <span style={{ fontSize: 11.5, color: T.text3, fontStyle: "italic" }}>Suelta aquí…</span>
                ) : (
                  dentro.map((v) => (
                    <span
                      key={v.id}
                      style={{
                        animation: "napPop .25s ease",
                        display: "block",
                        padding: "9px 12px",
                        borderRadius: 11,
                        background: `${info.color}1f`,
                        border: `1px solid ${info.color}55`,
                        lineHeight: 1.45,
                      }}
                    >
                      <strong style={{ display: "block", fontSize: 13.5, fontWeight: 900, color: "#fff" }}>{v.palabra}</strong>
                      <span style={{ fontSize: 11, color: T.text3 }}>{v.origen}</span>
                    </span>
                  ))
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
 * Hechos verdadero/falso — VERBATIM de LC-II-P03-A4
 * ═══════════════════════════════════════════════════════════════════════════ */
function HechosCard({
  accent,
  respuestas,
  onResponder,
}: {
  accent: string;
  respuestas: (boolean | null)[];
  onResponder: (i: number, valor: boolean) => void;
}) {
  const aciertos = respuestas.filter((r, i) => r !== null && r === HECHOS[i]!.respuesta).length;
  return (
    <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-scale-balanced" style={{ marginRight: 8, color: accent }} />
          Hechos · verdadero o falso (LC-II-P03-A4)
        </Eyebrow>
        <span
          style={{
            marginLeft: "auto",
            fontSize: 12.5,
            fontWeight: 800,
            color: aciertos >= HECHOS.length ? OK : T.text3,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {aciertos}/{HECHOS.length}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {HECHOS.map((h, i) => {
          const r = respuestas[i] ?? null;
          const resuelto = r !== null && r === h.respuesta;
          const fallado = r !== null && r !== h.respuesta;
          return (
            <div
              key={i}
              style={{
                borderRadius: 13,
                border: `1px solid ${resuelto ? `${OK}55` : fallado ? `${NO}55` : T.line}`,
                background: resuelto ? `${OK}0f` : fallado ? `${NO}0f` : T.inset,
                padding: "13px 16px",
                transition: "all .18s",
              }}
            >
              <div style={{ fontSize: 13.5, lineHeight: 1.5, color: T.text, marginBottom: 10, display: "flex", gap: 10 }}>
                <span style={{ color: accent, fontWeight: 900 }}>{i + 1}.</span>
                <span>{h.enunciado}</span>
              </div>
              <div style={{ display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap" }}>
                {[true, false].map((v) => (
                  <button
                    key={String(v)}
                    className="nap-vf"
                    disabled={resuelto}
                    data-on={resuelto && h.respuesta === v}
                    data-bad={fallado && r === v}
                    onClick={() => onResponder(i, v)}
                  >
                    <i className={`fa-solid ${v ? "fa-check" : "fa-xmark"}`} style={{ marginRight: 7 }} />
                    {v ? "Verdadero" : "Falso"}
                  </button>
                ))}
                {resuelto && <span style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.45, flex: 1, minWidth: 220 }}>{h.retro}</span>}
                {fallado && (
                  <span style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.45, flex: 1, minWidth: 220 }}>
                    {h.retro} <em style={{ color: T.text3 }}>Inténtalo de nuevo.</em>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
