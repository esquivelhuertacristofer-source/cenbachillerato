"use client";

/**
 * Laboratorio — Ideas clave: qué subrayar y por qué.
 * Práctica experimental para LC-I-P05 (Lengua y Comunicación I):
 * «Identifica información de un texto que lee para resaltar los elementos
 * significativos».
 *
 * EXPERIMENTO CENTRAL: el alumno subraya un artículo y VE qué resumen sale de
 * lo que subrayó. A la derecha del artículo se arman, en vivo:
 *  · el RESUMEN (lo subrayado, párrafo por párrafo),
 *  · el MAPA de ideas (título → idea principal de cada párrafo → detalle),
 *  · un MEDIDOR de longitud con la marca del resumen ideal.
 * Si subraya de más (relleno), el resumen se infla y el medidor se pone rojo;
 * si subraya de menos, el resumen y el mapa muestran HUECOS punteados.
 *
 * Modos: «Subraya y mira el resumen» (simulador) · «Arma el esquema» ·
 * «Diagnostica el resumen» · «Completa el texto» (huecos verbatim A4).
 * La teoría verbatim vive en la pestaña «Teoría» y el quiz de A2 en «Reto».
 *
 * DOM puro (sin three.js): el fenómeno que se estudia ES el texto.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK } from "./_kit";
import { LabShell, Bloque, BotonHerramienta, Mesa, Dato } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { IDEAS_CLAVE_HUECOS } from "./ideas-clave-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
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
const AVISO = "#FFC75A";
const RETO_KEY = "cen-ideas-clave-subrayado-reto";
const RUTA_FOTOS = "/media/labs-sim/ideas-clave-subrayado";

/** Foto de cabecera de cada artículo (clave del archivo + ícono de respaldo). */
const FOTO_TEXTO: Record<string, { clave: string; icono: string }> = {
  maiz: { clave: "milpa-mazorcas", icono: "fa-wheat-awn" },
  metro: { clave: "anden-metro", icono: "fa-train-subway" },
  alerta: { clave: "poste-alerta", icono: "fa-bell" },
};

type Modo = "subrayar" | "esquema" | "resumen" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "subrayar", label: "Subraya y mira el resumen", icono: "fa-highlighter" },
  { id: "esquema", label: "Arma el esquema", icono: "fa-sitemap" },
  { id: "resumen", label: "Diagnostica el resumen", icono: "fa-clipboard-check" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

const ROLES: Rol[] = ["principal", "apoyo", "relleno"];
const VEREDICTOS: Veredicto[] = ["bueno", "copia", "detalle", "agrega"];

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

const palabras = (s: string) => s.trim().split(/\s+/).length;
const recorta = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

/* ── Simulador: lo que sale de lo subrayado ───────────────────────────── */
interface Analisis {
  totalPal: number;
  /** Palabras que el alumno metió al resumen (principal o apoyo). */
  resumenPal: number;
  /** De ellas, palabras de oraciones que en realidad son relleno. */
  ruidoPal: number;
  ruidoN: number;
  /** Ideas que faltan: principales sin subrayar + detalles sin subrayar. */
  huecosPrincipal: number;
  huecosApoyo: number;
  /** Oraciones marcadas con un marcador que no les toca. */
  malas: number;
  /** Palabras del resumen ideal (todo lo que no es relleno). */
  idealPal: number;
  perfecto: boolean;
}

function analiza(t: TextoLectura, marcas: Record<string, Rol>): Analisis {
  const a: Analisis = {
    totalPal: 0, resumenPal: 0, ruidoPal: 0, ruidoN: 0, huecosPrincipal: 0, huecosApoyo: 0, malas: 0, idealPal: 0, perfecto: true,
  };
  for (const p of t.parrafos) {
    for (const f of p.frases) {
      const w = palabras(f.texto);
      const m = marcas[f.id];
      a.totalPal += w;
      if (f.rol !== "relleno") a.idealPal += w;
      if (m && m !== "relleno") {
        a.resumenPal += w;
        if (f.rol === "relleno") {
          a.ruidoPal += w;
          a.ruidoN++;
        }
      }
      if (m && m !== f.rol) a.malas++;
      if (m !== f.rol) a.perfecto = false;
      if (f.rol === "principal" && m !== "principal") a.huecosPrincipal++;
      if (f.rol === "apoyo" && !(m === "apoyo" || m === "principal")) a.huecosApoyo++;
    }
  }
  return a;
}

const correctoDe = (t: TextoLectura, marcas: Record<string, Rol>) => t.parrafos.every((p) => p.frases.every((f) => marcas[f.id] === f.rol));

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

  // ── retroalimentación viva ────────────────────────────────────────────
  const [nota, setNota] = useState<{ tono: "ok" | "no"; titulo: string; texto: string } | null>(null);

  // ── modo 1 · subrayar y ver el resumen ────────────────────────────────
  const [txtIdx, setTxtIdx] = useState(0);
  const [marcador, setMarcador] = useState<Rol>("principal");
  const [marcas, setMarcas] = useState<Record<string, Rol>>({});
  const [shakeFrase, setShakeFrase] = useState<string | null>(null);
  /** ¿Ya provocó alguna vez un resumen inflado con relleno? (experimento) */
  const [inflo, setInflo] = useState(false);
  const texto = TEXTOS[txtIdx]!;
  const an = useMemo(() => analiza(texto, marcas), [texto, marcas]);

  const rellenoMarcado = TODAS_LAS_FRASES.filter((f) => f.rol === "relleno" && marcas[f.id] === "relleno").length;
  const totalMarcadas = Object.keys(marcas).length;
  const principalesOk = (i: number) => TEXTOS[i]!.parrafos.every((p) => p.frases.filter((f) => f.rol === "principal").every((f) => marcas[f.id] === "principal"));

  const intentarMarcar = (fraseId: string) => {
    const f = TODAS_LAS_FRASES.find((x) => x.id === fraseId);
    if (!f) return;
    if (marcas[fraseId] === marcador) {
      // Segundo toque con el mismo marcador: borra el subrayado.
      setMarcas((m) => {
        const n = { ...m };
        delete n[fraseId];
        return n;
      });
      setNota(null);
      return;
    }
    setMarcas((m) => ({ ...m, [fraseId]: marcador }));
    if (f.rol === marcador) {
      sfxPlace();
      setNota({ tono: "ok", titulo: ROL_INFO[f.rol].label, texto: f.porque });
    } else {
      setShakeFrase(fraseId);
      sfxNo();
      const entra = marcador !== "relleno" && f.rol === "relleno";
      if (entra) setInflo(true);
      setNota({
        tono: "no",
        titulo: `No es «${ROL_INFO[marcador].label}»`,
        texto: `${entra ? "Esa oración es relleno y ya se coló en tu resumen. " : ""}${PISTA_ROL[marcador]}`,
      });
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
  const subrayadoDe = (i: number) => correctoDe(TEXTOS[i]!, marcas);
  const objetivos = [
    { txt: "Subraya sólo la idea principal de cada párrafo de «El maíz que nos hizo» y mira cómo se arma el resumen", done: principalesOk(0) },
    { txt: "Marca una oración de relleno como idea y observa cómo se infla el resumen", done: inflo },
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

  const reiniciarModo =
    modo === "subrayar" ? resetSubrayar : modo === "esquema" ? resetEsquema : modo === "resumen" ? resetResumen : resetHuecos;

  const pctResumen = an.totalPal ? Math.round((an.resumenPal / an.totalPal) * 100) : 0;
  const lectura =
    modo === "subrayar" ? (
      <>Resumen: {pctResumen}% del texto · ruido {an.ruidoN} · huecos {an.huecosPrincipal + an.huecosApoyo}</>
    ) : modo === "esquema" ? (
      <>Espacios: {slots.filter((s) => puestos[s.id]).length}/{slots.length}</>
    ) : modo === "resumen" ? (
      <>Resúmenes diagnosticados: {Object.keys(ubicRes).length}/{RESUMENES.length}</>
    ) : (
      <>Completa las palabras que faltan</>
    );

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      dom
      modos={{
        opciones: MODOS.map((m) => ({ id: m.id, etiqueta: m.label, icono: m.icono })),
        valor: modo,
        cambiar: (id) => setModo(id as Modo),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar este modo" onClick={reiniciarModo} />
        </>
      }
      lectura={lectura}
      objetivos={objetivos}
      escena={
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <style>{css(accent, color.rgba)}</style>

          {modo === "subrayar" && (
            <SubrayarPanel
              texto={texto}
              txtIdx={txtIdx}
              marcador={marcador}
              marcas={marcas}
              analisis={an}
              shakeFrase={shakeFrase}
              onSelTexto={setTxtIdx}
              onSelMarcador={setMarcador}
              onFrase={intentarMarcar}
              listo={subrayadoDe}
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
            <div className="idc-nota" role="status" aria-live="polite" data-tono={nota?.tono ?? "vacio"}>
              <i className={`fa-solid ${nota ? (nota.tono === "ok" ? "fa-circle-check" : "fa-circle-question") : "fa-comment-dots"}`} />
              <div style={{ minWidth: 0 }}>
                <strong>{nota ? nota.titulo : "¿Por qué?"}</strong>
                <span>{nota ? nota.texto : "Cada vez que marques algo, aquí aparece la razón por la que esa oración es idea principal, detalle de apoyo o relleno."}</span>
              </div>
            </div>
          )}
        </div>
      }
      pestanas={[
        {
          id: "cuaderno",
          etiqueta: "Cuaderno",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="Tu partida" icono="fa-star">
                <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
                  <Dato label="Oraciones marcadas" value={`${totalMarcadas}`} />
                  <Dato label="Resúmenes" value={`${Object.keys(ubicRes).length}/${RESUMENES.length}`} />
                </div>
              </Bloque>
              <Bloque titulo="Los tres marcadores" icono="fa-highlighter">
                {ROLES.map((r) => (
                  <p key={r} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: ROL_INFO[r].color }}>{ROL_INFO[r].label}.</strong> {ROL_INFO[r].descripcion}
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Cómo encontrar lo esencial" icono="fa-compass">
                <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8 }}>
                  {PISTAS_A3.map((p, i) => (
                    <li key={i} style={{ color: T.text2 }}>
                      {p}
                    </li>
                  ))}
                </ul>
              </Bloque>
            </>
          ),
        },
        {
          id: "reto",
          etiqueta: "Reto",
          icono: "fa-trophy",
          contenido: (
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
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book",
          contenido: (
            <>
              <Bloque titulo="Lectura A1" icono="fa-book-open-reader">
                {LECTURA_A1.map((p, i) => (
                  <p key={i} style={{ margin: 0, color: T.text2 }}>
                    {p}
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Dato" icono="fa-feather-pointed">
                <p style={{ margin: 0, color: T.text2 }}>{DATO_IDEAS}</p>
              </Bloque>
              <Bloque titulo="Hechos: verdadero o falso" icono="fa-scale-balanced">
                {HECHOS.map((h, i) => (
                  <div key={i} className="idc-hecho">
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span className="idc-chip" style={{ color: h.respuesta ? OK : NO, borderColor: `${h.respuesta ? OK : NO}66`, background: `${h.respuesta ? OK : NO}14` }}>
                        {h.respuesta ? "VERDADERO" : "FALSO"}
                      </span>
                      <span style={{ color: T.text }}>{h.enunciado}</span>
                    </div>
                    <div style={{ marginTop: 6, color: T.text3 }}>{h.retroalimentacion}</div>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Glosario de la progresión" icono="fa-spell-check">
                {GLOSARIO.map((g) => (
                  <div key={g.termino} className="idc-hecho">
                    <div style={{ fontWeight: 900, color: accent }}>{g.termino}</div>
                    <div style={{ marginTop: 3, color: T.text2 }}>{g.definicion}</div>
                    <div style={{ marginTop: 4, color: T.text3, fontStyle: "italic" }}>{g.ejemplo}</div>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={IDEAS_CLAVE_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ margin: "16px 0 0", color: T.text3, fontStyle: "italic" }}>{NOTA_PIE}</p>
            </>
          ),
        },
      ]}
    />
  );
}

/** Foto de cabecera: se ve bien aunque el archivo aún no exista. */
function Foto({ clave, icono }: { clave: string; icono: string }) {
  const [ok, setOk] = useState(true);
  return (
    <div className="idc-foto">
      <i className={`fa-solid ${icono}`} aria-hidden />
      {ok && <img src={`${RUTA_FOTOS}/${clave}.webp`} alt="" loading="lazy" onError={() => setOk(false)} />}
    </div>
  );
}

const css = (accent: string, rgba: string) => `
  @keyframes idcShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
  @keyframes idcPop { 0%{transform:scale(.7);opacity:0;} 100%{transform:scale(1);opacity:1;} }
  @keyframes idcTrazo { from{background-size:0% 100%;} to{background-size:100% 100%;} }

  .idc-prob { cursor:pointer; padding:9px 14px; border-radius:11px; border:1px solid ${T.line}; background:${T.glass};
    color:${T.text2}; font-size:14px; font-weight:800; transition:all .14s; text-align:left; }
  .idc-prob:hover { border-color:${T.lineStrong}; color:#fff; }
  .idc-prob[data-on="true"] { border-color:${accent}; background:rgba(${rgba},0.16); color:#fff; }
  .idc-prob[data-done="true"] { color:${OK}; border-color:${OK}66; }

  .idc-pens { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 150px), 1fr)); gap:8px; }
  .idc-pen { cursor:pointer; display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:12px;
    border:1.5px solid ${T.line}; background:${T.glassSoft}; color:${T.text2}; font-size:14px; font-weight:800; transition:all .15s; text-align:left; }
  .idc-pen:hover { border-color:${T.lineStrong}; color:#fff; }
  .idc-pen[data-on="true"] { color:#fff; transform:translateY(-2px); }
  .idc-pen-ico { width:30px; height:30px; flex-shrink:0; border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:14px; color:#04121f; }

  .idc-sim { display:grid; grid-template-columns:minmax(0,1fr); gap:14px; align-items:start; }
  @container lsescena (min-width: 820px) { .idc-sim { grid-template-columns:minmax(0,1.15fr) minmax(0,1fr); } }

  .idc-art { border-radius:16px; border:1.5px solid ${T.line}; background:${T.glass}; overflow:hidden; min-width:0; }
  .idc-foto { position:relative; width:100%; aspect-ratio:16/7; background:linear-gradient(135deg, rgba(${rgba},0.35), rgba(8,19,31,0.9)); display:flex; align-items:center; justify-content:center; color:rgba(255,255,255,0.35); font-size:44px; }
  .idc-foto img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .idc-art-cuerpo { padding:14px 16px 16px; }
  .idc-art h3 { margin:0; font-size:21px; font-weight:900; color:#fff; line-height:1.2; }
  .idc-art-sub { margin-top:3px; font-size:14.5px; color:${T.text2}; font-style:italic; }
  .idc-parr { display:flex; gap:11px; margin-top:12px; }
  .idc-parr-n { flex-shrink:0; width:26px; height:26px; margin-top:3px; border-radius:7px; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:900; color:${T.text3}; border:1px solid ${T.line}; background:${T.inset}; }
  .idc-parr p { margin:0; font-size:16px; line-height:1.9; color:${T.text2}; min-width:0; overflow-wrap:anywhere; }

  .idc-frase { display:inline; box-decoration-break:clone; -webkit-box-decoration-break:clone; padding:1px 2px; border-radius:4px; cursor:pointer;
    transition:background-color .14s, color .14s; background-repeat:no-repeat; }
  .idc-frase:hover { background-color:rgba(255,255,255,0.10); }
  .idc-frase:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
  .idc-frase[data-rol="principal"] { color:#fff; font-weight:600;
    background-image:linear-gradient(transparent 56%, ${ROLES_BG.principal} 56%, ${ROLES_BG.principal} 94%, transparent 94%); animation:idcTrazo .32s ease-out; }
  .idc-frase[data-rol="apoyo"] { color:#fff;
    background-image:linear-gradient(transparent 60%, ${ROLES_BG.apoyo} 60%, ${ROLES_BG.apoyo} 92%, transparent 92%); animation:idcTrazo .32s ease-out; }
  .idc-frase[data-rol="relleno"] { color:${T.text3}; text-decoration:line-through; text-decoration-thickness:1.5px; }
  .idc-frase[data-mal="true"] { text-decoration:underline wavy ${NO}; text-underline-offset:4px; }
  .idc-frase[data-rol="relleno"][data-mal="true"] { text-decoration:line-through; text-decoration-color:${NO}; }
  .idc-frase[data-shake="true"] { animation:idcShake .4s; background-color:${NO}26; }
  .idc-marca { display:inline-flex; vertical-align:baseline; font-size:14px; margin-left:5px; }

  .idc-vivo { display:flex; flex-direction:column; gap:12px; min-width:0; }
  .idc-caja { border-radius:16px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; min-width:0; }
  .idc-caja-t { display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; font-size:14px; font-weight:900; letter-spacing:.06em; text-transform:uppercase; color:${T.text2}; margin-bottom:10px; }
  .idc-caja-t i { color:${accent}; margin-right:8px; }

  .idc-medidor { position:relative; height:18px; border-radius:10px; background:${T.inset}; overflow:hidden; border:1px solid ${T.line}; }
  .idc-medidor > span { position:absolute; top:0; bottom:0; left:0; transition:width .3s; }
  .idc-ideal { position:absolute; top:-3px; bottom:-3px; width:3px; background:#fff; border-radius:2px; }
  .idc-med-pie { margin-top:7px; display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap; font-size:14px; color:${T.text2}; }
  .idc-veredicto { margin-top:10px; padding:10px 12px; border-radius:12px; font-size:14.5px; line-height:1.45; color:${T.text2}; border:1.5px solid ${T.line}; background:${T.inset}; }
  .idc-veredicto[data-tono="ok"] { border-color:${OK}77; background:${OK}12; color:#fff; }
  .idc-veredicto[data-tono="mal"] { border-color:${NO}77; background:${NO}10; }
  .idc-veredicto[data-tono="aviso"] { border-color:${AVISO}77; background:${AVISO}10; }

  .idc-res { display:flex; flex-direction:column; gap:8px; margin:0; padding:0; list-style:none; }
  .idc-res li { padding:9px 11px; border-radius:11px; font-size:14.5px; line-height:1.45; color:${T.text2}; border:1.5px solid ${T.line}; background:${T.inset}; overflow-wrap:anywhere; animation:idcPop .25s ease; }
  .idc-res li[data-rol="principal"] { border-color:${ROL_INFO.principal.color}88; color:#fff; font-weight:700; }
  .idc-res li[data-rol="apoyo"] { border-color:${ROL_INFO.apoyo.color}88; margin-left:16px; }
  .idc-res li[data-mal="true"] { border-color:${NO}; background:${NO}12; }
  .idc-res li[data-hueco="true"] { border-style:dashed; border-color:${T.lineStrong}; background:transparent; color:${T.text3}; font-style:italic; animation:none; }
  .idc-res small { display:block; font-size:14px; font-weight:800; color:${NO}; }

  .idc-mapa { display:flex; flex-direction:column; gap:10px; }
  .idc-nodo { padding:9px 12px; border-radius:12px; border:1.5px solid ${T.lineStrong}; background:${T.glassSoft}; font-size:14.5px; line-height:1.4; color:#fff; overflow-wrap:anywhere; }
  .idc-nodo[data-centro="true"] { text-align:center; font-weight:900; background:rgba(${rgba},0.22); border-color:${accent}; }
  .idc-nodo[data-rol="principal"] { border-color:${ROL_INFO.principal.color}99; }
  .idc-nodo[data-rol="apoyo"] { border-color:${ROL_INFO.apoyo.color}99; font-size:14px; color:${T.text2}; }
  .idc-nodo[data-mal="true"] { border-color:${NO}; background:${NO}12; }
  .idc-nodo[data-hueco="true"] { border-style:dashed; border-color:${T.lineStrong}; background:transparent; color:${T.text3}; font-style:italic; }
  .idc-rama { margin-left:14px; padding-left:14px; border-left:2px solid ${T.lineStrong}; display:flex; flex-direction:column; gap:8px; }
  .idc-rama .idc-rama { margin-left:10px; }

  .idc-nota { border-radius:14px; padding:12px 16px; border:1.5px solid ${T.line}; background:${T.glass}; display:flex; gap:12px; align-items:flex-start; min-height:60px; transition:all .18s; }
  .idc-nota > i { font-size:17px; margin-top:2px; color:${T.text3}; }
  .idc-nota strong { display:block; font-size:14px; font-weight:900; letter-spacing:.06em; text-transform:uppercase; color:${T.text3}; }
  .idc-nota span { display:block; margin-top:4px; font-size:14.5px; line-height:1.5; color:${T.text2}; }
  .idc-nota[data-tono="ok"] { border-color:${OK}55; background:${OK}12; }
  .idc-nota[data-tono="ok"] > i, .idc-nota[data-tono="ok"] strong { color:${OK}; }
  .idc-nota[data-tono="no"] { border-color:${NO}55; background:${NO}12; }
  .idc-nota[data-tono="no"] > i, .idc-nota[data-tono="no"] strong { color:${NO}; }

  .idc-card { cursor:grab; display:block; padding:11px 14px; border-radius:13px; border:1.5px solid ${T.line};
    background:${T.glassSoft}; color:${T.text}; font-size:14.5px; line-height:1.5; text-align:left; transition:all .14s; user-select:none; width:100%; overflow-wrap:anywhere; }
  .idc-card:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.07); }
  .idc-card[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.16); box-shadow:0 0 16px -5px ${accent}; }
  .idc-card:active { cursor:grabbing; }
  .idc-etq { display:inline-block; margin-right:9px; padding:1px 8px; border-radius:999px; font-size:14px; font-weight:900; border:1px solid ${T.line}; background:${T.inset}; color:${T.text3}; }

  .idc-slot { border-radius:12px; border:1.5px dashed ${T.lineStrong}; background:${T.inset}; min-height:52px;
    display:flex; align-items:center; gap:10px; padding:10px 12px; color:${T.text3}; font-size:14.5px; transition:all .16s; width:100%; text-align:left; min-width:0; }
  .idc-slot[data-libre="true"] { cursor:pointer; }
  .idc-slot[data-libre="true"]:hover { border-color:${accent}; background:rgba(${rgba},0.1); }
  .idc-slot[data-shake="true"] { animation:idcShake .4s; border-color:${NO}; }
  .idc-slot[data-lleno="true"] { border-style:solid; animation:idcPop .25s ease; }

  .idc-bins { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap:12px; }
  .idc-bin { border-radius:16px; border:2px dashed ${T.lineStrong}; padding:13px; min-height:110px; transition:all .16s; }
  .idc-bin[data-shake="true"] { animation:idcShake .4s; }
  .idc-bin-hit { font-size:14px; line-height:1.4; color:#fff; padding:8px 10px; border-radius:9px; animation:idcPop .25s ease; overflow-wrap:anywhere; }

  .idc-chip { flex-shrink:0; padding:2px 9px; border-radius:999px; font-size:14px; font-weight:900; border:1px solid ${T.line}; }
  .idc-hecho { padding:10px 12px; border-radius:12px; border:1px solid ${T.line}; background:${T.inset}; font-size:14.5px; line-height:1.5; }
  .idc-hecho + .idc-hecho { margin-top:8px; }

  @media (prefers-reduced-motion: reduce){
    .idc-frase, .idc-slot, .idc-bin, .idc-pen, .idc-res li, .idc-medidor > span { animation:none !important; transition:none; }
    .idc-pen:hover, .idc-pen[data-on="true"] { transform:none; }
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 1 — «Subraya y mira el resumen» (el simulador)
 * ═══════════════════════════════════════════════════════════════════════════ */
function SubrayarPanel({
  texto,
  txtIdx,
  marcador,
  marcas,
  analisis,
  shakeFrase,
  onSelTexto,
  onSelMarcador,
  onFrase,
  listo,
}: {
  texto: TextoLectura;
  txtIdx: number;
  marcador: Rol;
  marcas: Record<string, Rol>;
  analisis: Analisis;
  shakeFrase: string | null;
  onSelTexto: (i: number) => void;
  onSelMarcador: (r: Rol) => void;
  onFrase: (id: string) => void;
  listo: (i: number) => boolean;
}) {
  const a = analisis;
  const huecos = a.huecosPrincipal + a.huecosApoyo;
  const nada = a.resumenPal === 0;
  const tono = nada ? "vacio" : a.perfecto ? "ok" : a.ruidoN > 0 || a.malas > 0 ? "mal" : "aviso";
  const mensaje = nada
    ? "Todavía no hay resumen: subraya las ideas del artículo y mira cómo se arma aquí."
    : a.perfecto
      ? "Resumen limpio: tiene todas las ideas y nada de relleno."
      : [
          a.ruidoN > 0 ? `Inflado: ${a.ruidoPal} palabras de relleno se colaron en tu resumen.` : "",
          huecos > 0 ? `Con huecos: faltan ${huecos} idea${huecos > 1 ? "s" : ""} del texto.` : "",
          a.malas > 0 && a.ruidoN === 0 ? "Hay oraciones con el marcador equivocado (subrayado rojo)." : "",
        ]
          .filter(Boolean)
          .join(" ");
  const pctRes = a.totalPal ? (a.resumenPal / a.totalPal) * 100 : 0;
  const pctRuido = a.totalPal ? (a.ruidoPal / a.totalPal) * 100 : 0;
  const pctIdeal = a.totalPal ? (a.idealPal / a.totalPal) * 100 : 0;
  const foto = FOTO_TEXTO[texto.id] ?? { clave: texto.id, icono: "fa-newspaper" };

  return (
    <>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {TEXTOS.map((t, i) => (
          <button key={t.id} type="button" className="idc-prob" data-on={txtIdx === i} data-done={listo(i)} onClick={() => onSelTexto(i)}>
            {listo(i) && <i className="fa-solid fa-circle-check" style={{ marginRight: 6 }} />}
            {t.titulo}
          </button>
        ))}
      </div>

      <div className="idc-pens" role="group" aria-label="Marcadores">
        {ROLES.map((r) => {
          const info = ROL_INFO[r];
          const on = marcador === r;
          return (
            <button
              key={r}
              type="button"
              className="idc-pen"
              data-on={on}
              aria-pressed={on}
              onClick={() => onSelMarcador(r)}
              style={{ borderColor: on ? info.color : undefined, background: on ? `${info.color}26` : undefined }}
            >
              <span className="idc-pen-ico" style={{ background: info.color }}>
                <i className={`fa-solid ${info.icono}`} />
              </span>
              {info.label}
            </button>
          );
        })}
      </div>

      <div className="idc-sim">
        <article className="idc-art">
          <Foto key={texto.id} clave={foto.clave} icono={foto.icono} />
          <div className="idc-art-cuerpo">
            <h3>{texto.titulo}</h3>
            <div className="idc-art-sub">{texto.subtitulo}</div>
            {texto.parrafos.map((p, i) => (
              <div key={p.id} className="idc-parr">
                <span className="idc-parr-n">{i + 1}</span>
                <p>
                  {p.frases.map((f, j) => {
                    const rol = marcas[f.id];
                    return (
                      <span key={f.id}>
                        {/* Un <span> y no un <button>: el botón partiría el párrafo
                            en una oración por renglón; aquí el texto fluye. */}
                        <span
                          className="idc-frase"
                          role="button"
                          tabIndex={0}
                          data-rol={rol ?? undefined}
                          data-mal={!!rol && rol !== f.rol}
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
        </article>

        <div className="idc-vivo">
          <div className="idc-caja">
            <div className="idc-caja-t">
              <span>
                <i className="fa-solid fa-ruler-horizontal" />
                Largo del resumen
              </span>
              <span style={{ color: T.text }}>
                {a.resumenPal} de {a.totalPal} palabras
              </span>
            </div>
            <div className="idc-medidor" role="img" aria-label={`El resumen usa ${Math.round(pctRes)} por ciento del texto`}>
              <span style={{ width: `${pctRes - pctRuido}%`, background: OK }} />
              <span style={{ left: `${pctRes - pctRuido}%`, width: `${pctRuido}%`, background: NO }} />
              <span className="idc-ideal" style={{ left: `calc(${pctIdeal}% - 1px)`, width: 3, background: "#fff" }} />
            </div>
            <div className="idc-med-pie">
              <span>
                <i className="fa-solid fa-square" style={{ color: OK, marginRight: 6 }} />
                ideas
              </span>
              <span>
                <i className="fa-solid fa-square" style={{ color: NO, marginRight: 6 }} />
                relleno
              </span>
              <span>
                <i className="fa-solid fa-grip-lines-vertical" style={{ marginRight: 6 }} />
                tope sin relleno
              </span>
            </div>
            <div className="idc-veredicto" data-tono={tono} role="status">
              {mensaje}
            </div>
          </div>

          <div className="idc-caja">
            <div className="idc-caja-t">
              <span>
                <i className="fa-solid fa-align-left" />
                Tu resumen en vivo
              </span>
            </div>
            <ul className="idc-res">
              {texto.parrafos.map((p, i) => {
                const subrayadas = p.frases.filter((f) => marcas[f.id] === "principal" || marcas[f.id] === "apoyo");
                const faltaP = !p.frases.some((f) => f.rol === "principal" && marcas[f.id] === "principal");
                const faltaA = !p.frases.some((f) => f.rol === "apoyo" && (marcas[f.id] === "apoyo" || marcas[f.id] === "principal"));
                return [
                  ...subrayadas.map((f) => (
                    <li key={f.id} data-rol={marcas[f.id]} data-mal={marcas[f.id] !== f.rol && f.rol === "relleno"}>
                      {f.rol === "relleno" && <small>Relleno: no informa sobre el tema</small>}
                      {f.texto}
                    </li>
                  )),
                  faltaP && (
                    <li key={`${p.id}-hp`} data-hueco="true">
                      Párrafo {i + 1}: falta su idea principal
                    </li>
                  ),
                  faltaA && (
                    <li key={`${p.id}-ha`} data-hueco="true" style={{ marginLeft: 16 }}>
                      Párrafo {i + 1}: falta el detalle que la respalda
                    </li>
                  ),
                ];
              })}
            </ul>
          </div>

          <div className="idc-caja">
            <div className="idc-caja-t">
              <span>
                <i className="fa-solid fa-sitemap" />
                Mapa de ideas
              </span>
            </div>
            <div className="idc-mapa">
              <div className="idc-nodo" data-centro="true">
                {texto.titulo}
              </div>
              <div className="idc-rama">
                {texto.parrafos.map((p, i) => {
                  const princ = p.frases.find((f) => marcas[f.id] === "principal");
                  const apoyos = p.frases.filter((f) => marcas[f.id] === "apoyo");
                  return (
                    <div key={p.id} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div className="idc-nodo" data-rol={princ ? "principal" : undefined} data-hueco={!princ} data-mal={!!princ && princ.rol !== "principal"}>
                        {princ ? recorta(princ.texto, 96) : `Párrafo ${i + 1}: idea principal pendiente`}
                      </div>
                      {apoyos.length > 0 && (
                        <div className="idc-rama">
                          {apoyos.map((f) => (
                            <div key={f.id} className="idc-nodo" data-rol="apoyo" data-mal={f.rol !== "apoyo"}>
                              {recorta(f.texto, 80)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <span style={{ fontSize: 14, color: T.text3, fontStyle: "italic" }}>
        {texto.fuente}
      </span>
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
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {TEXTOS.map((t, i) => (
          <button key={t.id} type="button" className="idc-prob" data-on={esqIdx === i} data-done={completo(t)} onClick={() => onSelTexto(i)}>
            {completo(t) && <i className="fa-solid fa-circle-check" style={{ marginRight: 6 }} />}
            {t.titulo}
          </button>
        ))}
        <span style={{ fontSize: 14, fontWeight: 800, color: llenos >= slots.length ? OK : T.text3, fontVariantNumeric: "tabular-nums" }}>
          {llenos}/{slots.length} espacios
        </span>
      </div>

      <Mesa>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>Piezas del texto: arrástralas a su lugar</div>
          <div style={{ fontSize: 14, color: T.text3 }}>Sobran cinco: los dos temas mal medidos y el relleno de los tres párrafos.</div>
          {libres.length === 0 ? (
            <div style={{ fontSize: 14.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
              <i className="fa-solid fa-circle-check" /> ¡Esquema armado! Cambia de texto para armar el siguiente.
            </div>
          ) : (
            libres.map((p) => (
              <button key={p.id} type="button" className="idc-card" data-sel={selPieza === p.id} onClick={() => onSelPieza(p.id)} {...dragProps(p.id)}>
                <span className="idc-etq" style={p.kind === "tema" ? { color: accent, borderColor: `rgba(${rgba},0.45)` } : undefined}>
                  {p.kind === "tema" ? "Tema" : `Párrafo ${p.parrafo}`}
                </span>
                {p.texto}
              </button>
            ))
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>Esquema de «{texto.titulo}»</div>
          {slots.map((s) => {
            const piezaId = puestos[s.id];
            const col = tipoColor[s.tipo];
            const sangria = s.tipo === "tema" ? 0 : s.tipo === "principal" ? 14 : 28;
            return (
              <div key={s.id} style={{ marginLeft: sangria, display: "flex", gap: 8, alignItems: "stretch", minWidth: 0 }}>
                <button
                  type="button"
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
                      fontSize: 14,
                      color: piezaId ? "#04121f" : col,
                      background: piezaId ? col : `${col}22`,
                    }}
                  >
                    <i className={`fa-solid ${s.tipo === "tema" ? "fa-diagram-project" : s.tipo === "principal" ? "fa-highlighter" : "fa-pen-nib"}`} />
                  </span>
                  <span style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ display: "block", fontSize: 14, fontWeight: 900, color: col }}>{s.label}</span>
                    <span style={{ display: "block", marginTop: 3, fontSize: 14.5, lineHeight: 1.45, color: piezaId ? "#fff" : T.text3 }}>
                      {piezaId ? textoDePieza(texto, piezaId) : selPieza ? "Toca aquí para colocar lo seleccionado" : "Vacío: elige una pieza"}
                    </span>
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </Mesa>
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
    <Mesa>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", fontSize: 15, fontWeight: 800, color: T.text }}>
          <span>
            <i className="fa-solid fa-clipboard-check" style={{ marginRight: 8, color: accent }} />
            Lee cada resumen y dictamina qué le pasa
          </span>
          <span style={{ color: colocados >= RESUMENES.length ? OK : T.text3 }}>
            {colocados}/{RESUMENES.length}
          </span>
        </div>
        {resLibres.length === 0 ? (
          <div style={{ fontSize: 14.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
            <i className="fa-solid fa-circle-check" /> ¡Diagnosticaste los {RESUMENES.length} resúmenes!
          </div>
        ) : (
          resLibres.map((r) => (
            <button key={r.id} type="button" className="idc-card" data-sel={selRes === r.id} onClick={() => onSelRes(r.id)} {...dragProps(r.id)}>
              <span style={{ display: "block", fontSize: 14, fontWeight: 900, color: T.text3, marginBottom: 5 }}>
                <i className="fa-solid fa-book-bookmark" style={{ marginRight: 7 }} />
                Resumen de «{r.deTexto}»
              </span>
              {r.texto}
            </button>
          ))
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
                <span style={{ width: 30, height: 30, flexShrink: 0, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#fff", background: `${info.color}33` }}>
                  <i className={`fa-solid ${info.icono}`} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff" }}>{info.label}</div>
                  <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.35 }}>{info.descripcion}</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {dentro.map((r) => (
                  <span key={r.id} className="idc-bin-hit" style={{ background: `${info.color}1f`, border: `1px solid ${info.color}55` }}>
                    {recorta(r.texto, 96)}
                  </span>
                ))}
                {dentro.length === 0 && <span style={{ fontSize: 14, color: T.text3, fontStyle: "italic" }}>Vacío</span>}
              </div>
            </div>
          );
        })}
      </div>
    </Mesa>
  );
}
