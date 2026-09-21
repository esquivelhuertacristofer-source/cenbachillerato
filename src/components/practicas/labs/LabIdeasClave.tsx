"use client";

/**
 * Laboratorio — Ideas clave: qué subrayar y por qué.
 * Práctica experimental para LC-I-P05 (Lengua y Comunicación I):
 * «Identifica información de un texto que lee para resaltar los elementos
 * significativos».
 *
 * El corazón es SUBRAYAR DE VERDAD sobre el texto. Cuatro modos:
 *  1. «Subraya el texto» — el alumno toma uno de tres marcadores (idea
 *     principal / detalle de apoyo / relleno) y marca cada oración del texto.
 *     El laboratorio le dice si acertó y POR QUÉ esa oración es lo que es.
 *  2. «Arma el esquema» — con las mismas oraciones construye la jerarquía del
 *     texto: tema general arriba, la idea principal de cada párrafo debajo y el
 *     detalle que la sostiene colgando de ella. El relleno no entra.
 *  3. «Diagnostica el resumen» — nueve resúmenes ajenos, cuatro veredictos:
 *     buen resumen, copia literal, se quedó en un detalle, dice lo que el texto
 *     no dice.
 *  4. «Completa el texto» — los huecos verbatim de LC-I-P05-A4.
 *  + Reto evaluable con el quiz verbatim de LC-I-P05-A2.
 *
 * DOM puro (sin three.js): el fenómeno que se estudia ES el texto, así que la
 * escena correcta es el texto mismo. Además funciona con ratón, teclado y
 * pantalla táctil (clic-para-seleccionar y clic-para-colocar) y no infla el
 * bundle del Worker.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { IDEAS_CLAVE_HUECOS } from "./ideas-clave-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { TableroObjetivos } from "./_objetivos";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { IDEAS_CLAVE_FICHA } from "./ideas-clave-ficha";
import {
  TEXTOS,
  TODAS_LAS_FRASES,
  ROL_INFO,
  RESUMENES,
  VEREDICTO_INFO,
  LECTURA_A1,
  DATO_IDEAS,
  PISTAS_A3,
  HECHOS,
  GLOSARIO,
  QUIZ,
  NOTA_PIE,
  type Rol,
  type Veredicto,
  type TextoLectura,
} from "./ideas-clave-data";

const NO = "#FF5E5E";
const RETO_KEY = "cen-ideas-clave-subrayado-reto";

type Modo = "subrayar" | "esquema" | "resumen" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "subrayar", label: "Subraya el texto", icono: "fa-highlighter" },
  { id: "esquema", label: "Arma el esquema", icono: "fa-sitemap" },
  { id: "resumen", label: "Diagnostica el resumen", icono: "fa-clipboard-check" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

const ROLES: Rol[] = ["principal", "apoyo", "relleno"];
const VEREDICTOS: Veredicto[] = ["bueno", "copia", "detalle", "agrega"];

/** Cuántas oraciones tiene cada texto (3 párrafos × 3 oraciones). */
const FRASES_POR_TEXTO = TEXTOS[0]!.parrafos.reduce((n, p) => n + p.frases.length, 0);
const TOTAL_FRASES = TODAS_LAS_FRASES.length;
const TOTAL_RELLENO = TODAS_LAS_FRASES.filter((f) => f.rol === "relleno").length;
const COPIAS = RESUMENES.filter((r) => r.veredicto === "copia");

/** Los tonos del trazo del subrayado (el CSS los interpola una sola vez). */
const ROLES_BG = {
  principal: "rgba(52,211,153,0.40)",
  apoyo: "rgba(255,199,90,0.38)",
};

/** Un mismo objeto vacío para los esquemas sin empezar: mantiene estables los `useMemo`. */
const SIN_PIEZAS: Record<string, string> = {};

/** Pista que se da cuando el marcador elegido no era el correcto. */
const PISTA_ROL: Record<Rol, string> = {
  principal: "Pregúntate de qué trata el párrafo ENTERO. Si la oración sólo habla de una parte, no es la principal.",
  apoyo: "Un detalle de apoyo respalda a la idea principal con un ejemplo, una cifra o una explicación. ¿Esta oración respalda algo?",
  relleno: "El relleno no aporta información sobre el tema. Si la oración sí dice algo del tema, entonces sirve para algo.",
};

/* ── Esquema: los espacios que hay que llenar ─────────────────────────── */
type TipoSlot = "tema" | "principal" | "apoyo";
interface Slot {
  id: string;
  tipo: TipoSlot;
  /** Índice del párrafo al que pertenece; -1 para el tema del texto. */
  parrafoIdx: number;
  label: string;
}

function slotsDe(texto: TextoLectura): Slot[] {
  const out: Slot[] = [{ id: `${texto.id}-tema`, tipo: "tema", parrafoIdx: -1, label: "Tema del texto completo" }];
  texto.parrafos.forEach((p, i) => {
    out.push({ id: `${p.id}-principal`, tipo: "principal", parrafoIdx: i, label: `Idea principal · párrafo ${i + 1}` });
    out.push({ id: `${p.id}-apoyo`, tipo: "apoyo", parrafoIdx: i, label: `Detalle que la apoya · párrafo ${i + 1}` });
  });
  return out;
}

function textoDePieza(texto: TextoLectura, piezaId: string): string {
  const tema = texto.temas.find((t) => t.id === piezaId);
  if (tema) return tema.texto;
  for (const p of texto.parrafos) {
    const f = p.frases.find((x) => x.id === piezaId);
    if (f) return f.texto;
  }
  return "";
}

/** ¿Cabe esa pieza en ese espacio? Y sobre todo: por qué sí o por qué no. */
function validarEsquema(texto: TextoLectura, slot: Slot, piezaId: string): { ok: boolean; msg: string } {
  const tema = texto.temas.find((t) => t.id === piezaId);
  if (tema) {
    if (slot.tipo !== "tema") return { ok: false, msg: "Eso es un tema del texto completo; este espacio pide una oración de un párrafo." };
    return { ok: tema.correcto, msg: tema.porque };
  }
  for (let i = 0; i < texto.parrafos.length; i++) {
    const f = texto.parrafos[i]!.frases.find((x) => x.id === piezaId);
    if (!f) continue;
    if (slot.tipo === "tema") return { ok: false, msg: "Arriba va el tema del texto completo, no una oración suelta de un párrafo." };
    if (f.rol === "relleno") return { ok: false, msg: "El relleno no entra en el esquema: no aporta información sobre el tema." };
    if (i !== slot.parrafoIdx) return { ok: false, msg: `Esa oración es del párrafo ${i + 1}; este espacio es del párrafo ${slot.parrafoIdx + 1}.` };
    if (f.rol !== slot.tipo) {
      return {
        ok: false,
        msg:
          slot.tipo === "principal"
            ? "Esa oración es el detalle de apoyo del párrafo. Aquí va la oración que engloba a las demás."
            : "Esa oración es la idea principal del párrafo. Aquí va el ejemplo o el dato que la respalda.",
      };
    }
    return { ok: true, msg: f.porque };
  }
  return { ok: false, msg: "Esa pieza no pertenece a este texto." };
}

export function LabIdeasClave({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("subrayar");

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
  /** Clic sin veredicto (elegir una opción del reto): sólo suena, no puntúa. */
  const sfxPick = () => sonido && audioRef.current?.blip();

  // ── retroalimentación viva (el «pie del visor» de este laboratorio) ───
  const [nota, setNota] = useState<{ tono: "ok" | "no"; titulo: string; texto: string } | null>(null);

  // ── modo 1 · subrayar ─────────────────────────────────────────────────
  const [txtIdx, setTxtIdx] = useState(0);
  const [marcador, setMarcador] = useState<Rol>("principal");
  const [marcas, setMarcas] = useState<Record<string, Rol>>({});
  const [shakeFrase, setShakeFrase] = useState<string | null>(null);
  const texto = TEXTOS[txtIdx]!;

  const marcadasDe = (t: TextoLectura) => t.parrafos.reduce((n, p) => n + p.frases.filter((f) => marcas[f.id]).length, 0);
  const totalMarcadas = Object.keys(marcas).length;
  const rellenoMarcado = Object.values(marcas).filter((r) => r === "relleno").length;

  const intentarMarcar = (fraseId: string) => {
    if (marcas[fraseId]) return;
    const f = TODAS_LAS_FRASES.find((x) => x.id === fraseId);
    if (!f) return;
    if (f.rol === marcador) {
      setMarcas((m) => ({ ...m, [fraseId]: f.rol }));
      sfxPlace();
      setNota({ tono: "ok", titulo: ROL_INFO[f.rol].label, texto: f.porque });
    } else {
      setShakeFrase(fraseId);
      sfxNo();
      setNota({ tono: "no", titulo: `No es «${ROL_INFO[marcador].label}»`, texto: PISTA_ROL[marcador] });
      window.setTimeout(() => setShakeFrase(null), 420);
    }
  };
  const resetSubrayar = () => {
    const quedan: Record<string, Rol> = {};
    for (const [id, rol] of Object.entries(marcas)) {
      if (!texto.parrafos.some((p) => p.frases.some((f) => f.id === id))) quedan[id] = rol;
    }
    setMarcas(quedan);
    setNota(null);
  };

  // ── modo 2 · esquema ──────────────────────────────────────────────────
  const [esqIdx, setEsqIdx] = useState(0);
  const [esqPuestos, setEsqPuestos] = useState<Record<string, Record<string, string>>>({});
  const [selPieza, setSelPieza] = useState<string | null>(null);
  const [shakeSlot, setShakeSlot] = useState<string | null>(null);
  const esqTexto = TEXTOS[esqIdx]!;
  const slots = useMemo(() => slotsDe(esqTexto), [esqTexto]);
  const puestos = esqPuestos[esqTexto.id] ?? SIN_PIEZAS;
  const usadas = useMemo(() => new Set(Object.values(puestos)), [puestos]);

  const piezas = useMemo(() => {
    const temas = esqTexto.temas.map((t) => ({ id: t.id, texto: t.texto, kind: "tema" as const }));
    const frases = esqTexto.parrafos.flatMap((p, i) =>
      p.frases.map((f) => ({ id: f.id, texto: f.texto, kind: "frase" as const, parrafo: i + 1 })),
    );
    return [
      ...temas.slice().sort((a, b) => a.texto.localeCompare(b.texto, "es")),
      ...frases.slice().sort((a, b) => a.texto.localeCompare(b.texto, "es")),
    ];
  }, [esqTexto]);

  const esquemaCompleto = (t: TextoLectura) => {
    const puesto = esqPuestos[t.id] ?? {};
    return slotsDe(t).every((s) => puesto[s.id]);
  };
  const esquemasHechos = TEXTOS.filter((t) => esquemaCompleto(t)).length;
  const temasElegidos = TEXTOS.filter((t) => (esqPuestos[t.id] ?? {})[`${t.id}-tema`]).length;

  const intentarSlot = (slot: Slot, piezaId: string) => {
    if (puestos[slot.id]) return;
    if (usadas.has(piezaId)) return;
    const r = validarEsquema(esqTexto, slot, piezaId);
    if (r.ok) {
      setEsqPuestos((prev) => ({ ...prev, [esqTexto.id]: { ...(prev[esqTexto.id] ?? {}), [slot.id]: piezaId } }));
      setSelPieza(null);
      sfxPlace();
      setNota({ tono: "ok", titulo: slot.label, texto: r.msg });
    } else {
      setShakeSlot(slot.id);
      sfxNo();
      setNota({ tono: "no", titulo: "Ahí no va", texto: r.msg });
      window.setTimeout(() => setShakeSlot(null), 420);
    }
  };
  const resetEsquema = () => {
    setEsqPuestos((prev) => ({ ...prev, [esqTexto.id]: {} }));
    setSelPieza(null);
    setNota(null);
  };

  // ── modo 3 · diagnostica el resumen ───────────────────────────────────
  const [ubicRes, setUbicRes] = useState<Record<string, Veredicto>>({});
  const [selRes, setSelRes] = useState<string | null>(null);
  const [shakeVer, setShakeVer] = useState<Veredicto | null>(null);
  const resLibres = RESUMENES.filter((r) => !ubicRes[r.id]);
  const copiasHechas = COPIAS.every((r) => ubicRes[r.id]);

  const intentarVeredicto = (resId: string, ver: Veredicto) => {
    const r = RESUMENES.find((x) => x.id === resId);
    if (!r || ubicRes[resId]) return;
    if (r.veredicto === ver) {
      setUbicRes((u) => ({ ...u, [resId]: ver }));
      setSelRes(null);
      sfxPlace();
      setNota({ tono: "ok", titulo: VEREDICTO_INFO[ver].label, texto: r.porque });
      if (Object.keys(ubicRes).length + 1 >= RESUMENES.length) sfxOk();
    } else {
      setShakeVer(ver);
      sfxNo();
      setNota({ tono: "no", titulo: `No es «${VEREDICTO_INFO[ver].label}»`, texto: VEREDICTO_INFO[ver].descripcion + " Relee el resumen y compáralo con el texto." });
      window.setTimeout(() => setShakeVer(null), 420);
    }
  };
  const resetResumen = () => {
    setUbicRes({});
    setSelRes(null);
    setNota(null);
  };

  // ── modo 4 · completa el texto ────────────────────────────────────────
  const [textoDone, setTextoDone] = useState(false);
  const [textoIntento, setTextoIntento] = useState(0);
  const resetHuecos = () => {
    setTextoDone(false);
    setTextoIntento((v) => v + 1);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── objetivos ─────────────────────────────────────────────────────────
  const subrayadoDe = (i: number) => marcadasDe(TEXTOS[i]!) >= FRASES_POR_TEXTO;
  const objetivos = [
    { txt: "Subraya «El maíz que nos hizo»", done: subrayadoDe(0) },
    { txt: "Subraya «El Metro que mueve a la ciudad»", done: subrayadoDe(1) },
    { txt: "Subraya «Sesenta segundos de aviso»", done: subrayadoDe(2) },
    { txt: `Descarta las ${TOTAL_RELLENO} oraciones de relleno`, done: rellenoMarcado >= TOTAL_RELLENO },
    { txt: "Elige el tema correcto de los 3 textos", done: temasElegidos >= TEXTOS.length },
    { txt: "Arma el esquema de los 3 textos", done: esquemasHechos >= TEXTOS.length },
    { txt: `Diagnostica los ${RESUMENES.length} resúmenes`, done: Object.keys(ubicRes).length >= RESUMENES.length },
    { txt: "Detecta los 2 resúmenes de copia literal", done: copiasHechas },
    { txt: "Completa el texto de la progresión", done: textoDone },
    { txt: "Aprueba el reto evaluable (70 %)", done: quizAprobado },
  ];

  // ── arrastre nativo ───────────────────────────────────────────────────
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
  });

  const reiniciarModo =
    modo === "subrayar" ? resetSubrayar : modo === "esquema" ? resetEsquema : modo === "resumen" ? resetResumen : resetHuecos;

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes idcShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes idcPop { 0%{transform:scale(.7);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        @keyframes idcTrazo { from{background-size:0% 100%;} to{background-size:100% 100%;} }

        .idc-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 16px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .idc-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .idc-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }

        .idc-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .idc-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .idc-icobtn:hover { background:rgba(255,255,255,0.12); }

        .idc-prob { cursor:pointer; padding:8px 13px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass};
          color:${T.text2}; font-size:12.5px; font-weight:800; transition:all .14s; }
        .idc-prob:hover { border-color:${T.lineStrong}; color:#fff; }
        .idc-prob[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; }
        .idc-prob[data-done="true"] { color:${OK}; border-color:${OK}66; }

        /* El marcador: la herramienta con la que se subraya */
        .idc-pen { cursor:pointer; display:inline-flex; align-items:center; gap:10px; padding:11px 15px; border-radius:12px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:${T.text2}; font-size:13px; font-weight:800;
          transition:all .15s; text-align:left; }
        .idc-pen:hover { border-color:${T.lineStrong}; color:#fff; transform:translateY(-1px); }
        .idc-pen[data-on="true"] { color:#fff; transform:translateY(-2px); }

        /* La oración dentro del texto: es un botón, pero se lee como texto */
        .idc-frase { display:inline; box-decoration-break:clone; -webkit-box-decoration-break:clone;
          padding:1px 2px; border-radius:4px; cursor:default; transition:background-color .14s, color .14s;
          background-repeat:no-repeat; }
        .idc-frase[data-armado="true"] { cursor:pointer; }
        .idc-frase[data-armado="true"]:hover { background-color:rgba(255,255,255,0.10); }
        .idc-frase:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
        .idc-frase[data-rol="principal"] { color:#fff; font-weight:600;
          background-image:linear-gradient(transparent 56%, ${ROLES_BG.principal} 56%, ${ROLES_BG.principal} 94%, transparent 94%);
          animation:idcTrazo .32s ease-out; }
        .idc-frase[data-rol="apoyo"] { color:#fff;
          background-image:linear-gradient(transparent 60%, ${ROLES_BG.apoyo} 60%, ${ROLES_BG.apoyo} 92%, transparent 92%);
          animation:idcTrazo .32s ease-out; }
        .idc-frase[data-rol="relleno"] { color:${T.text3}; text-decoration:line-through; text-decoration-thickness:1.5px; }
        .idc-frase[data-shake="true"] { animation:idcShake .4s; background-color:${NO}26; }

        .idc-marca { display:inline-flex; vertical-align:baseline; font-size:10px; margin-left:5px; }

        .idc-card { cursor:grab; display:block; padding:12px 15px; border-radius:13px; border:1.5px solid ${T.line};
          background:${T.glassSoft}; color:${T.text}; font-size:13px; line-height:1.5; text-align:left; transition:all .14s; user-select:none; width:100%; }
        .idc-card:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.07); }
        .idc-card[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); box-shadow:0 0 16px -5px ${accent}; }
        .idc-card:active { cursor:grabbing; }

        .idc-slot { border-radius:12px; border:1.5px dashed ${T.lineStrong}; background:${T.inset}; min-height:52px;
          display:flex; align-items:center; gap:10px; padding:10px 13px; color:${T.text3}; font-size:12.5px; transition:all .16s; width:100%; text-align:left; }
        .idc-slot[data-libre="true"] { cursor:pointer; }
        .idc-slot[data-libre="true"]:hover { border-color:${accent}; background:rgba(${color.rgba},0.1); }
        .idc-slot[data-shake="true"] { animation:idcShake .4s; border-color:${NO}; }
        .idc-slot[data-lleno="true"] { border-style:solid; animation:idcPop .25s ease; }

        .idc-bin { border-radius:16px; border:2px dashed ${T.lineStrong}; padding:15px; min-height:120px; transition:all .16s;
          --tono:188; position:relative; background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
        .idc-bin[data-shake="true"] { animation:idcShake .4s; }
        .idc-bin::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
          background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
        .idc-bin:nth-of-type(4n+1) { --tono:152; }
        .idc-bin:nth-of-type(4n+2) { --tono:214; }
        .idc-bin:nth-of-type(4n+3) { --tono:44; }
        .idc-bin:nth-of-type(4n+4) { --tono:22; }

        .idc-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .idc-btn:hover { border-color:${T.lineStrong}; }

        .idc-divider { height:1px; background:${T.line}; margin:16px 0; }

        .idc-grid { display:grid; grid-template-columns:minmax(0,1fr) clamp(300px,28vw,400px); gap:22px; align-items:start; }
        .idc-bins { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:13px; }
        @media (max-width: 980px){ .idc-grid { grid-template-columns:minmax(0,1fr); } .idc-bins { grid-template-columns:minmax(0,1fr); } }

        /* Cajón de teoría */
        .idc-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .idc-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .idc-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .idc-drawer[data-open="true"] { transform:translateX(0); }
        .idc-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .idc-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .idc-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .idc-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .idc-teoria-fab { position:fixed; right:20px; bottom:20px; z-index:58; cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.86); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .idc-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
        @media (max-width: 640px){ .idc-teoria-fab { right:12px; bottom:12px; padding:10px 13px; font-size:12px; } }

        @media (prefers-reduced-motion: reduce){
          .idc-frase, .idc-slot, .idc-bin, .idc-pen { animation:none !important; transition:none; }
          .idc-pen:hover, .idc-pen[data-on="true"] { transform:none; }
        }
      `}</style>

      {/* barra de modos + herramientas */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        {MODOS.map((m) => (
          <button key={m.id} className="idc-tab" data-on={modo === m.id} onClick={() => setModo(m.id)}>
            <i className={`fa-solid ${m.icono}`} />
            {m.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
        <button className="idc-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría de la práctica">
          <i className="fa-solid fa-book-open" />
        </button>
        <button className="idc-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
          <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
        </button>
        <button className="idc-icobtn" onClick={reiniciarModo} title="Reiniciar este modo">
          <i className="fa-solid fa-rotate-left" />
        </button>
      </div>

      {/* cajón de teoría */}
      <button className="idc-teoria-fab" onClick={() => setDrawer(true)}>
        <i className="fa-solid fa-book-open" />
        Teoría
      </button>
      <div className="idc-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="idc-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="idc-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="idc-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="idc-drawer-body">
          <FichaTeorica data={IDEAS_CLAVE_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>

      <div className="idc-grid">
        {/* ── Columna principal ───────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {modo === "subrayar" && (
            <SubrayarPanel
              accent={accent}
              rgba={color.rgba}
              texto={texto}
              txtIdx={txtIdx}
              marcador={marcador}
              marcas={marcas}
              shakeFrase={shakeFrase}
              marcadasEnTexto={marcadasDe(texto)}
              totalMarcadas={totalMarcadas}
              onSelTexto={setTxtIdx}
              onSelMarcador={setMarcador}
              onFrase={intentarMarcar}
              listo={(i) => subrayadoDe(i)}
            />
          )}

          {modo === "esquema" && (
            <EsquemaPanel
              accent={accent}
              rgba={color.rgba}
              texto={esqTexto}
              esqIdx={esqIdx}
              slots={slots}
              puestos={puestos}
              piezas={piezas}
              usadas={usadas}
              selPieza={selPieza}
              shakeSlot={shakeSlot}
              completo={(t) => esquemaCompleto(t)}
              onSelTexto={(i) => {
                setEsqIdx(i);
                setSelPieza(null);
              }}
              onSelPieza={(id) => setSelPieza((p) => (p === id ? null : id))}
              onSlot={(slot) => {
                if (selPieza) intentarSlot(slot, selPieza);
              }}
              onDropSlot={(slot, id) => intentarSlot(slot, id)}
              dragProps={dragProps}
              dropProps={dropProps}
            />
          )}

          {modo === "resumen" && (
            <ResumenPanel
              accent={accent}
              ubicRes={ubicRes}
              resLibres={resLibres}
              selRes={selRes}
              shakeVer={shakeVer}
              onSelRes={(id) => setSelRes((p) => (p === id ? null : id))}
              onBin={(v) => {
                if (selRes) intentarVeredicto(selRes, v);
              }}
              onDropBin={(id, v) => intentarVeredicto(id, v)}
              dragProps={dragProps}
              dropProps={dropProps}
            />
          )}

          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={IDEAS_CLAVE_HUECOS}
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

          {/* retroalimentación: el porqué de la última marca */}
          {modo !== "texto" && (
            <div
              role="status"
              aria-live="polite"
              style={{
                borderRadius: 16,
                padding: "14px 18px",
                border: `1px solid ${nota ? (nota.tono === "ok" ? `${OK}55` : `${NO}55`) : T.line}`,
                background: nota ? (nota.tono === "ok" ? `${OK}12` : `${NO}12`) : T.glass,
                display: "flex",
                gap: 13,
                alignItems: "flex-start",
                minHeight: 62,
                transition: "all .18s",
              }}
            >
              <i
                className={`fa-solid ${nota ? (nota.tono === "ok" ? "fa-circle-check" : "fa-circle-question") : "fa-comment-dots"}`}
                style={{ color: nota ? (nota.tono === "ok" ? OK : NO) : T.text3, fontSize: 17, marginTop: 2 }}
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", color: nota ? (nota.tono === "ok" ? OK : NO) : T.text3 }}>
                  {nota ? nota.titulo : "¿Por qué?"}
                </div>
                <div style={{ marginTop: 4, fontSize: 13.5, lineHeight: 1.55, color: T.text2 }}>
                  {nota ? nota.texto : "Cada vez que marques algo, aquí aparece la razón por la que esa oración es idea principal, detalle de apoyo o relleno."}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Columna lateral ─────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ ...card, padding: "20px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
              Objetivos de la sesión
            </Eyebrow>
            <TableroObjetivos objetivos={objetivos} retoKey={RETO_KEY} accent={accent} />
          </div>

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
              {modo === "subrayar" && (
                <>
                  Elige un marcador y toca las oraciones. La <strong style={{ color: T.text }}>idea principal</strong> engloba al párrafo, el{" "}
                  <strong style={{ color: T.text }}>detalle de apoyo</strong> la respalda y el <strong style={{ color: T.text }}>relleno</strong> no se subraya.
                </>
              )}
              {modo === "esquema" && (
                <>
                  Arriba va el <strong style={{ color: T.text }}>tema del texto completo</strong>; debajo, la idea principal de cada párrafo, y colgando de ella el detalle que
                  la sostiene. El relleno se queda fuera.
                </>
              )}
              {modo === "resumen" && (
                <>
                  Un resumen bueno <strong style={{ color: T.text }}>reescribe las ideas principales con palabras propias</strong>. Los demás copian, se quedan en un detalle o
                  añaden lo que el texto nunca dijo.
                </>
              )}
              {modo === "texto" && (
                <>
                  Escribe las palabras que faltan. Si te atoras, usa la <strong style={{ color: T.text }}>pista</strong> de cada hueco o abre el banco de palabras.
                </>
              )}
            </span>
          </div>

          {/* Pistas verbatim de la reflexión A3 */}
          <div style={{ ...card, padding: "18px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-compass" style={{ marginRight: 8, color: accent }} />
              Cómo encontrar lo esencial
            </Eyebrow>
            <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8 }}>
              {PISTAS_A3.map((p, i) => (
                <li key={i} style={{ fontSize: 13, lineHeight: 1.5, color: T.text2 }}>
                  {p}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 12, fontSize: 11, color: T.text3, fontStyle: "italic" }}>Pistas verbatim de LC-I-P05-A3.</div>
          </div>

          {/* Lectura A1 verbatim */}
          <div style={{ ...card, padding: "18px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-book-open-reader" style={{ marginRight: 8, color: accent }} />
              Lectura A1
            </Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {LECTURA_A1.map((p, i) => (
                <p key={i} style={{ margin: 0, fontSize: 12.8, lineHeight: 1.6, color: T.text2 }}>
                  {p}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Hechos (V/F verbatim A5) + Glosario (A6) ───────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginTop: 22 }}>
        <div style={{ ...card, padding: "20px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-scale-balanced" style={{ marginRight: 8, color: accent }} />
            Hechos: verdadero o falso
          </Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {HECHOS.map((h, i) => (
              <div key={i} style={{ borderRadius: 12, border: `1px solid ${T.line}`, background: T.inset, padding: "11px 14px" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span
                    style={{
                      flexShrink: 0,
                      padding: "2px 9px",
                      borderRadius: 999,
                      fontSize: 10.5,
                      fontWeight: 900,
                      letterSpacing: "0.06em",
                      color: h.respuesta ? OK : NO,
                      border: `1px solid ${h.respuesta ? OK : NO}66`,
                      background: `${h.respuesta ? OK : NO}14`,
                    }}
                  >
                    {h.respuesta ? "VERDADERO" : "FALSO"}
                  </span>
                  <span style={{ fontSize: 13, lineHeight: 1.45, color: T.text }}>{h.enunciado}</span>
                </div>
                <div style={{ marginTop: 7, fontSize: 12.3, lineHeight: 1.5, color: T.text3 }}>{h.retroalimentacion}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: T.text3, fontStyle: "italic" }}>Verbatim de LC-I-P05-A5.</div>
        </div>

        <div style={{ ...card, padding: "20px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-spell-check" style={{ marginRight: 8, color: accent }} />
            Glosario de la progresión
          </Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {GLOSARIO.map((g) => (
              <div key={g.termino} style={{ borderRadius: 12, border: `1px solid ${T.line}`, background: T.inset, padding: "11px 14px" }}>
                <div style={{ fontSize: 13.5, fontWeight: 900, color: accent }}>{g.termino}</div>
                <div style={{ marginTop: 3, fontSize: 12.8, lineHeight: 1.5, color: T.text2 }}>{g.definicion}</div>
                <div style={{ marginTop: 5, fontSize: 12, color: T.text3, fontStyle: "italic" }}>
                  <i className="fa-solid fa-arrow-turn-up fa-rotate-90" style={{ marginRight: 7, opacity: 0.6 }} />
                  {g.ejemplo}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: T.text3, fontStyle: "italic" }}>Verbatim de LC-I-P05-A6.</div>
        </div>
      </div>

      {/* Dato verbatim del recuadro de A1 */}
      <div
        style={{
          marginTop: 16,
          borderRadius: 18,
          padding: "16px 20px",
          border: `1px solid rgba(${color.rgba},0.28)`,
          background: `rgba(${color.rgba},0.07)`,
          fontSize: 13,
          color: T.text2,
          lineHeight: 1.6,
          display: "flex",
          gap: 13,
        }}
      >
        <i className="fa-solid fa-feather-pointed" style={{ color: accent, fontSize: 17, marginTop: 2 }} />
        <span>{DATO_IDEAS}</span>
      </div>

      <RetoQuizCard
        quiz={QUIZ}
        accent={accent}
        rgba={color.rgba}
        aprobado={quizAprobado}
        onAprobado={() => setQuizAprobado(true)}
        playSfx={(ok) => (ok ? sfxOk() : sfxNo())}
        playPick={sfxPick}
        mensajeAprobado="Sabes distinguir lo esencial de lo accesorio."
      />

      <p style={{ margin: "18px 0 0", paddingBottom: 60, fontSize: 11.5, lineHeight: 1.6, color: T.text3, fontStyle: "italic" }}>
        <i className="fa-solid fa-circle-info" style={{ marginRight: 7, opacity: 0.7 }} />
        {NOTA_PIE}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 1 — «Subraya el texto»
 * ═══════════════════════════════════════════════════════════════════════════ */
function SubrayarPanel({
  accent,
  rgba,
  texto,
  txtIdx,
  marcador,
  marcas,
  shakeFrase,
  marcadasEnTexto,
  totalMarcadas,
  onSelTexto,
  onSelMarcador,
  onFrase,
  listo,
}: {
  accent: string;
  rgba: string;
  texto: TextoLectura;
  txtIdx: number;
  marcador: Rol;
  marcas: Record<string, Rol>;
  shakeFrase: string | null;
  marcadasEnTexto: number;
  totalMarcadas: number;
  onSelTexto: (i: number) => void;
  onSelMarcador: (r: Rol) => void;
  onFrase: (id: string) => void;
  listo: (i: number) => boolean;
}) {
  const completo = marcadasEnTexto >= FRASES_POR_TEXTO;
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
        {TEXTOS.map((t, i) => (
          <button key={t.id} className="idc-prob" data-on={txtIdx === i} data-done={listo(i)} onClick={() => onSelTexto(i)}>
            {listo(i) && <i className="fa-solid fa-circle-check" style={{ marginRight: 6 }} />}
            {t.titulo}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, fontWeight: 800, color: T.text3, fontVariantNumeric: "tabular-nums" }}>
          {totalMarcadas}/{TOTAL_FRASES} oraciones en total
        </span>
      </div>

      {/* La caja de marcadores */}
      <div style={{ ...card, padding: "16px 20px" }}>
        <Eyebrow>
          <i className="fa-solid fa-pen-ruler" style={{ marginRight: 8, color: accent }} />
          Toma un marcador y toca las oraciones
        </Eyebrow>
        <div style={{ display: "flex", gap: 11, flexWrap: "wrap" }}>
          {ROLES.map((r) => {
            const info = ROL_INFO[r];
            const on = marcador === r;
            return (
              <button
                key={r}
                className="idc-pen"
                data-on={on}
                onClick={() => onSelMarcador(r)}
                aria-pressed={on}
                style={{
                  borderColor: on ? info.color : undefined,
                  background: on ? `${info.color}26` : undefined,
                  boxShadow: on ? `0 8px 22px -12px ${info.color}` : undefined,
                }}
              >
                <span
                  style={{
                    width: 30,
                    height: 30,
                    flexShrink: 0,
                    borderRadius: 9,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    color: "#04121f",
                    background: info.color,
                  }}
                >
                  <i className={`fa-solid ${info.icono}`} />
                </span>
                <span>
                  <span style={{ display: "block", fontSize: 13, fontWeight: 900, color: on ? "#fff" : T.text2 }}>{info.label}</span>
                  <span style={{ display: "block", fontSize: 11, color: T.text3, marginTop: 2, maxWidth: 230, lineHeight: 1.35 }}>{info.descripcion}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* El texto */}
      <div style={{ ...card, padding: "22px 26px 24px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 6 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: accent }}>
              <i className="fa-solid fa-tag" style={{ marginRight: 7 }} />
              Paratextos
            </div>
            <h3 style={{ margin: "7px 0 2px", fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>{texto.titulo}</h3>
            <div style={{ fontSize: 13.5, color: T.text2, fontStyle: "italic" }}>{texto.subtitulo}</div>
          </div>
          <span
            style={{
              flexShrink: 0,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 12px",
              borderRadius: 999,
              fontSize: 11.5,
              fontWeight: 900,
              color: completo ? OK : "#fff",
              border: `1px solid ${completo ? `${OK}66` : `rgba(${rgba},0.4)`}`,
              background: completo ? `${OK}14` : `rgba(${rgba},0.14)`,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <i className={`fa-solid ${completo ? "fa-circle-check" : "fa-highlighter"}`} />
            {completo ? "Texto subrayado" : `${marcadasEnTexto}/${FRASES_POR_TEXTO} oraciones`}
          </span>
        </div>

        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 15 }}>
          {texto.parrafos.map((p, i) => (
            <div key={p.id} style={{ display: "flex", gap: 13 }}>
              <span
                style={{
                  flexShrink: 0,
                  width: 24,
                  height: 24,
                  borderRadius: 7,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 900,
                  color: T.text3,
                  border: `1px solid ${T.line}`,
                  background: T.inset,
                  marginTop: 3,
                }}
              >
                {i + 1}
              </span>
              <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.95, color: T.text2, minWidth: 0 }}>
                {p.frases.map((f, j) => {
                  const rol = marcas[f.id];
                  return (
                    <span key={f.id}>
                      {/* Un <span> y no un <button>: el botón es un bloque atómico y
                          partiría el párrafo en una oración por renglón. Aquí el
                          texto tiene que fluir como un texto de verdad. */}
                      <span
                        className="idc-frase"
                        role="button"
                        tabIndex={rol ? -1 : 0}
                        aria-disabled={!!rol}
                        data-rol={rol ?? undefined}
                        data-armado={!rol}
                        data-shake={shakeFrase === f.id}
                        data-frase={f.id}
                        onClick={() => onFrase(f.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onFrase(f.id);
                          }
                        }}
                        aria-label={rol ? `${f.texto} — marcada como ${ROL_INFO[rol].label}` : `Marcar: ${f.texto}`}
                      >
                        {f.texto}
                        {rol && (
                          <span className="idc-marca" style={{ color: ROL_INFO[rol].color }}>
                            <i className={`fa-solid ${ROL_INFO[rol].icono}`} />
                          </span>
                        )}
                      </span>
                      {j < p.frases.length - 1 ? " " : ""}
                    </span>
                  );
                })}
              </p>
            </div>
          ))}
        </div>

        <div className="idc-divider" />
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          {ROLES.map((r) => {
            const info = ROL_INFO[r];
            const n = texto.parrafos.reduce((acc, p) => acc + p.frases.filter((f) => marcas[f.id] === r).length, 0);
            const tot = texto.parrafos.reduce((acc, p) => acc + p.frases.filter((f) => f.rol === r).length, 0);
            return (
              <span key={r} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 800, color: n >= tot ? info.color : T.text3 }}>
                <span style={{ width: 11, height: 11, borderRadius: 3, background: info.color, opacity: n >= tot ? 1 : 0.45 }} />
                {info.corto} <span style={{ fontVariantNumeric: "tabular-nums" }}>{n}/{tot}</span>
              </span>
            );
          })}
          <span style={{ flex: 1 }} />
          <span style={{ fontSize: 11.5, color: T.text3, fontStyle: "italic" }}>{texto.fuente}</span>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 2 — «Arma el esquema»
 * ═══════════════════════════════════════════════════════════════════════════ */
function EsquemaPanel({
  accent,
  rgba,
  texto,
  esqIdx,
  slots,
  puestos,
  piezas,
  usadas,
  selPieza,
  shakeSlot,
  completo,
  onSelTexto,
  onSelPieza,
  onSlot,
  onDropSlot,
  dragProps,
  dropProps,
}: {
  accent: string;
  rgba: string;
  texto: TextoLectura;
  esqIdx: number;
  slots: Slot[];
  puestos: Record<string, string>;
  piezas: { id: string; texto: string; kind: "tema" | "frase"; parrafo?: number }[];
  usadas: Set<string>;
  selPieza: string | null;
  shakeSlot: string | null;
  completo: (t: TextoLectura) => boolean;
  onSelTexto: (i: number) => void;
  onSelPieza: (id: string) => void;
  onSlot: (slot: Slot) => void;
  onDropSlot: (slot: Slot, id: string) => void;
  dragProps: (id: string) => Record<string, unknown>;
  dropProps: (onDrop: (id: string) => void) => Record<string, unknown>;
}) {
  const llenos = slots.filter((s) => puestos[s.id]).length;
  const libres = piezas.filter((p) => !usadas.has(p.id));
  const tipoColor: Record<TipoSlot, string> = {
    tema: accent,
    principal: ROL_INFO.principal.color,
    apoyo: ROL_INFO.apoyo.color,
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
        {TEXTOS.map((t, i) => (
          <button key={t.id} className="idc-prob" data-on={esqIdx === i} data-done={completo(t)} onClick={() => onSelTexto(i)}>
            {completo(t) && <i className="fa-solid fa-circle-check" style={{ marginRight: 6 }} />}
            {t.titulo}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12.5, fontWeight: 800, color: llenos >= slots.length ? OK : T.text3, fontVariantNumeric: "tabular-nums" }}>
          {llenos}/{slots.length} espacios
        </span>
      </div>

      <div style={{ ...card, padding: "20px 24px" }}>
        <Eyebrow>
          <i className="fa-solid fa-sitemap" style={{ marginRight: 8, color: accent }} />
          Esquema de «{texto.titulo}»
        </Eyebrow>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {slots.map((s) => {
            const piezaId = puestos[s.id];
            const col = tipoColor[s.tipo];
            const sangria = s.tipo === "tema" ? 0 : s.tipo === "principal" ? 22 : 46;
            return (
              <div key={s.id} style={{ marginLeft: sangria, display: "flex", gap: 10, alignItems: "stretch" }}>
                {s.tipo !== "tema" && (
                  <span aria-hidden style={{ width: 14, flexShrink: 0, borderLeft: `2px solid ${T.line}`, borderBottom: `2px solid ${T.line}`, borderBottomLeftRadius: 8, marginBottom: 20 }} />
                )}
                <button
                  className="idc-slot"
                  data-libre={!piezaId && !!selPieza}
                  data-lleno={!!piezaId}
                  data-shake={shakeSlot === s.id}
                  onClick={() => !piezaId && onSlot(s)}
                  disabled={!!piezaId}
                  {...(!piezaId ? dropProps((id) => onDropSlot(s, id)) : {})}
                  style={piezaId ? { borderColor: `${col}88`, background: `${col}12` } : undefined}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      color: piezaId ? "#04121f" : col,
                      background: piezaId ? col : `${col}22`,
                    }}
                  >
                    <i className={`fa-solid ${s.tipo === "tema" ? "fa-diagram-project" : s.tipo === "principal" ? "fa-highlighter" : "fa-pen-nib"}`} />
                  </span>
                  <span style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ display: "block", fontSize: 10, fontWeight: 900, letterSpacing: "0.09em", textTransform: "uppercase", color: col }}>{s.label}</span>
                    <span style={{ display: "block", marginTop: 3, fontSize: 13, lineHeight: 1.45, color: piezaId ? "#fff" : T.text3 }}>
                      {piezaId ? textoDePieza(texto, piezaId) : selPieza ? "Toca aquí para colocar lo seleccionado" : "Vacío — elige una pieza abajo"}
                    </span>
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ ...card, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 13 }}>
          <Eyebrow>Piezas del texto — arrástralas a su lugar</Eyebrow>
          <span style={{ fontSize: 11.5, color: T.text3 }}>Sobran cinco: los dos temas mal medidos y el relleno de los tres párrafos.</span>
        </div>
        {libres.length === 0 ? (
          <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
            <i className="fa-solid fa-circle-check" /> ¡Esquema armado! Cambia de texto arriba para armar el siguiente.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {libres.map((p) => (
              <button key={p.id} className="idc-card" data-sel={selPieza === p.id} onClick={() => onSelPieza(p.id)} {...dragProps(p.id)}>
                <span
                  style={{
                    display: "inline-block",
                    marginRight: 9,
                    padding: "2px 8px",
                    borderRadius: 999,
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    color: p.kind === "tema" ? accent : T.text3,
                    border: `1px solid ${p.kind === "tema" ? `rgba(${rgba},0.45)` : T.line}`,
                    background: p.kind === "tema" ? `rgba(${rgba},0.12)` : T.inset,
                  }}
                >
                  {p.kind === "tema" ? "Tema" : `Párrafo ${p.parrafo}`}
                </span>
                {p.texto}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 3 — «Diagnostica el resumen»
 * ═══════════════════════════════════════════════════════════════════════════ */
function ResumenPanel({
  accent,
  ubicRes,
  resLibres,
  selRes,
  shakeVer,
  onSelRes,
  onBin,
  onDropBin,
  dragProps,
  dropProps,
}: {
  accent: string;
  ubicRes: Record<string, Veredicto>;
  resLibres: typeof RESUMENES;
  selRes: string | null;
  shakeVer: Veredicto | null;
  onSelRes: (id: string) => void;
  onBin: (v: Veredicto) => void;
  onDropBin: (id: string, v: Veredicto) => void;
  dragProps: (id: string) => Record<string, unknown>;
  dropProps: (onDrop: (id: string) => void) => Record<string, unknown>;
}) {
  const colocados = Object.keys(ubicRes).length;
  return (
    <>
      <div style={{ ...card, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 13, flexWrap: "wrap", gap: 8 }}>
          <Eyebrow>
            <i className="fa-solid fa-clipboard-check" style={{ marginRight: 8, color: accent }} />
            Lee cada resumen y dictamina qué le pasa
          </Eyebrow>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: colocados >= RESUMENES.length ? OK : T.text3, fontVariantNumeric: "tabular-nums" }}>
            {colocados}/{RESUMENES.length}
          </span>
        </div>
        {resLibres.length === 0 ? (
          <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
            <i className="fa-solid fa-circle-check" /> ¡Diagnosticaste los {RESUMENES.length} resúmenes!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {resLibres.map((r) => (
              <button key={r.id} className="idc-card" data-sel={selRes === r.id} onClick={() => onSelRes(r.id)} {...dragProps(r.id)}>
                <span style={{ display: "block", fontSize: 10, fontWeight: 900, letterSpacing: "0.07em", textTransform: "uppercase", color: T.text3, marginBottom: 5 }}>
                  <i className="fa-solid fa-book-bookmark" style={{ marginRight: 7 }} />
                  Resumen de «{r.deTexto}»
                </span>
                {r.texto}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="idc-bins">
        {VEREDICTOS.map((v) => {
          const info = VEREDICTO_INFO[v];
          const dentro = RESUMENES.filter((r) => ubicRes[r.id] === v);
          return (
            <div
              key={v}
              className="idc-bin"
              data-shake={shakeVer === v}
              onClick={() => onBin(v)}
              {...dropProps((id) => onDropBin(id, v))}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onBin(v);
                }
              }}
              style={{ borderColor: `${info.color}66`, background: `${info.color}0d`, cursor: selRes ? "pointer" : "default" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ width: 30, height: 30, flexShrink: 0, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#fff", background: `${info.color}33` }}>
                  <i className={`fa-solid ${info.icono}`} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 900, color: "#fff" }}>{info.label}</div>
                  <div style={{ fontSize: 10.5, color: T.text3, lineHeight: 1.35 }}>{info.descripcion}</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {dentro.map((r) => (
                  <span
                    key={r.id}
                    style={{
                      animation: "idcPop .25s ease",
                      fontSize: 11.5,
                      lineHeight: 1.4,
                      color: "#fff",
                      padding: "8px 10px",
                      borderRadius: 9,
                      background: `${info.color}1f`,
                      border: `1px solid ${info.color}55`,
                    }}
                  >
                    {r.texto.length > 96 ? r.texto.slice(0, 94) + "…" : r.texto}
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
