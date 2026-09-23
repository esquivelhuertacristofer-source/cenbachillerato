"use client";

/**
 * Laboratorio — Describing people, clothes and weather
 * Práctica experimental para IN-II-P04 (Inglés II, progresión 4).
 *
 * El ángulo: las tres reglas del inglés descriptivo que el español NO tiene y
 * que por eso cuestan. No es un mural de vocabulario con dibujitos; en cada
 * modo el alumno PRODUCE la estructura y el laboratorio le explica en español
 * la regla que rompió, con el ejemplo correcto en inglés.
 *
 *  1. «Adjective order» — arma la frase moviendo los adjetivos a sus casillas
 *     (opinión → tamaño → edad → color → material → sustantivo) y después juzga
 *     seis frases: tres que se dicen y tres que a un hablante de inglés le
 *     suenan imposibles («a red big jacket»).
 *  2. «Be or have?» — elige is / are / has / have para ocho descripciones. El
 *     cruce clásico («She have brown eyes», «She is have long hair») se caza y
 *     se explica: adjetivo → be; sustantivo → have.
 *  3. «Dress for the weather» — lee el parte meteorológico de cuatro lugares de
 *     México, viste a la persona (hay varias combinaciones válidas y algunas
 *     claramente absurdas) y justifica con la oración correcta.
 *  4. «Now or usually?» — SE ESCRIBE: teclea is wearing / wears según el
 *     marcador de tiempo (right now frente a every day).
 *  5. «Completa el texto» — los huecos verbatim de A2.
 *  + Reto evaluable con el verdadero/falso verbatim de A4.
 *
 * DOM puro (sin three.js): el fenómeno aquí es la lengua, y la escena —el
 * clóset, el parte del clima y la figura que se viste— se dibuja en SVG.
 *
 * Contenido verbatim de IN-II·P04; ver la nota al pie y el encabezado de
 * `describir-personas-clima-data.ts` para lo que es ilustrativo.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { hablarLab, callarLab } from "./lab-voz";
import { LabSfx } from "./lab-audio";
import { CompletaTexto, normaliza } from "./_mecanica-huecos";
import { DESCRIBIR_PERSONAS_CLIMA_HUECOS } from "./describir-personas-clima-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { TableroObjetivos } from "./_objetivos";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { DESCRIBIR_PERSONAS_CLIMA_FICHA } from "./describir-personas-clima-ficha";
import {
  FRASES,
  TOTAL_ADJETIVOS,
  CAT_INFO,
  ORDEN_ADJ,
  JUICIOS,
  BE_HAVE,
  FORMAS,
  explicaBeHave,
  PRENDAS,
  PRENDA_POR_ID,
  PRONOSTICOS,
  PRENDAS_POR_ATUENDO,
  nivelDe,
  razonAbsurda,
  AHORA,
  MARCADORES_INFO,
  QUIZ,
  PUNTOS_CLAVE,
  REGLA_ADJETIVO_A1,
  REFLEXION_A1,
  TU_TURNO_A3,
  VIDEO_A8,
  GLOSARIO_A5,
  DATO_BILINGUE,
  FUENTE,
  type FormaVerbo,
  type Condicion,
  type Prenda,
  type Pronostico,
  type FraseOrden,
} from "./describir-personas-clima-data";

const NO = "#FF5E5E";
const RETO_KEY = "cen-describir-personas-clima-reto";

type Modo = "orden" | "behave" | "clima" | "ahora" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "orden", label: "Adjective order", icono: "fa-arrow-down-1-9" },
  { id: "behave", label: "Be or have?", icono: "fa-code-compare" },
  { id: "clima", label: "Dress for the weather", icono: "fa-shirt" },
  { id: "ahora", label: "Now or usually?", icono: "fa-clock-rotate-left" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

export function LabDescribirPersonasClima({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("orden");

  /* ── sonido y partida ─────────────────────────────────────────────── */
  const partida = usePartida();
  const [sonido, setSonido] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);
  useEffect(() => () => audioRef.current?.dispose(), []);
  // `callarLab()` ya se traga sus propios fallos: no hace falta envolverlo.
  useEffect(() => callarLab, []);
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

  /* ── MODO 1 · Adjective order ─────────────────────────────────────── */
  const [fraseIdx, setFraseIdx] = useState(0);
  const [puestos, setPuestos] = useState<Record<string, string[]>>({});
  const [selAdj, setSelAdj] = useState<string | null>(null);
  const [shakeSlot, setShakeSlot] = useState<number | null>(null);
  const [msgOrden, setMsgOrden] = useState<{ mal: boolean; txt: string } | null>(null);

  const frase = FRASES[fraseIdx]!;
  const slotsFrase = puestos[frase.id] ?? frase.adjetivos.map(() => "");
  const adjLibres = frase.adjetivos
    .filter((a) => !slotsFrase.includes(a.palabra))
    .slice()
    .sort((a, b) => a.palabra.localeCompare(b.palabra, "en"));
  const fraseLista = slotsFrase.every((s) => s !== "");
  const colocadosTotal = FRASES.reduce((n, f) => n + (puestos[f.id]?.filter((s) => s !== "").length ?? 0), 0);
  const ordenDone = colocadosTotal >= TOTAL_ADJETIVOS;

  const ponerAdj = (palabra: string, slot: number) => {
    if (slotsFrase[slot] !== "") return;
    const esperado = frase.adjetivos[slot]!;
    if (esperado.palabra === palabra) {
      const nuevo = [...slotsFrase];
      nuevo[slot] = palabra;
      setPuestos((p) => ({ ...p, [frase.id]: nuevo }));
      setSelAdj(null);
      setShakeSlot(null);
      sfxPlace();
      if (nuevo.every((s) => s !== "")) {
        sfxOk();
        setMsgOrden({
          mal: false,
          txt: `Frase completa: «${frase.articulo ? `${frase.articulo} ` : ""}${frase.adjetivos.map((x) => x.palabra).join(" ")} ${frase.sustantivo}». En español dirías «${frase.es}»: el orden es otro, y por eso hay que pensarlo en inglés.`,
        });
      } else {
        const info = CAT_INFO[esperado.cat];
        setMsgOrden({ mal: false, txt: `Bien: «${palabra}» es ${info.titulo.toLowerCase()} (${info.en}) y va en esa casilla.` });
      }
    } else {
      const puesta = frase.adjetivos.find((a) => a.palabra === palabra);
      const catPuesta = puesta ? CAT_INFO[puesta.cat] : null;
      const catEsperada = CAT_INFO[esperado.cat];
      setShakeSlot(slot);
      sfxNo();
      setMsgOrden({
        mal: true,
        txt: catPuesta
          ? `«${palabra}» es ${catPuesta.titulo.toLowerCase()} (${catPuesta.en}); en esa casilla va ${catEsperada.titulo.toLowerCase()} (${catEsperada.en}). El orden del inglés es fijo: opinión → tamaño → edad → color → material.`
          : `Esa palabra no va en esa casilla: ahí toca ${catEsperada.titulo.toLowerCase()} (${catEsperada.en}).`,
      });
      window.setTimeout(() => setShakeSlot(null), 420);
    }
  };

  const [juicios, setJuicios] = useState<Record<string, boolean>>({});
  const [msgJuicio, setMsgJuicio] = useState<{ id: string; mal: boolean; txt: string } | null>(null);
  const juiciosDone = Object.keys(juicios).length >= JUICIOS.length;

  const juzgar = (id: string, dice: boolean) => {
    if (juicios[id]) return;
    const j = JUICIOS.find((x) => x.id === id);
    if (!j) return;
    if (j.posible === dice) {
      setJuicios((m) => ({ ...m, [id]: true }));
      setMsgJuicio({ id, mal: false, txt: j.porque });
      sfxPlace();
      if (Object.keys(juicios).length + 1 >= JUICIOS.length) sfxOk();
    } else {
      setMsgJuicio({
        id,
        mal: true,
        txt: j.posible
          ? "Sí se dice: repasa el orden opinión → tamaño → edad → color → material y vuelve a mirarla."
          : "Mírala otra vez: hay un adjetivo adelantado. En inglés el orden no es libre.",
      });
      sfxNo();
    }
  };

  const resetOrden = () => {
    setPuestos({});
    setSelAdj(null);
    setMsgOrden(null);
    setJuicios({});
    setMsgJuicio(null);
    setFraseIdx(0);
  };

  /* ── MODO 2 · Be or have? ─────────────────────────────────────────── */
  const [bhOk, setBhOk] = useState<Record<string, boolean>>({});
  const [bhFallo, setBhFallo] = useState<{ id: string; txt: string } | null>(null);
  const behaveDone = Object.keys(bhOk).length >= BE_HAVE.length;

  const elegirForma = (itemId: string, forma: FormaVerbo) => {
    if (bhOk[itemId]) return;
    const item = BE_HAVE.find((x) => x.id === itemId);
    if (!item) return;
    if (item.correcta === forma) {
      setBhOk((m) => ({ ...m, [itemId]: true }));
      setBhFallo(null);
      sfxPlace();
      if (Object.keys(bhOk).length + 1 >= BE_HAVE.length) sfxOk();
    } else {
      setBhFallo({ id: itemId, txt: explicaBeHave(item, forma) });
      sfxNo();
    }
  };
  const resetBeHave = () => {
    setBhOk({});
    setBhFallo(null);
  };

  /* ── MODO 3 · Dress for the weather ───────────────────────────────── */
  const [pronIdx, setPronIdx] = useState(0);
  const [atuendos, setAtuendos] = useState<Record<string, string[]>>({});
  const [msgClima, setMsgClima] = useState<{ mal: boolean; txt: string } | null>(null);
  const [oracionOk, setOracionOk] = useState<Record<string, boolean>>({});
  const [msgOracion, setMsgOracion] = useState<{ mal: boolean; txt: string } | null>(null);

  const pron = PRONOSTICOS[pronIdx]!;
  const atuendo = atuendos[pron.id] ?? [];
  const atuendoListo = atuendo.length >= PRENDAS_POR_ATUENDO;
  const atuendosDone = PRONOSTICOS.every((p) => (atuendos[p.id]?.length ?? 0) >= PRENDAS_POR_ATUENDO);
  const oracionesDone = PRONOSTICOS.every((p) => oracionOk[p.id] === true);

  const tocarPrenda = (p: Prenda) => {
    if (atuendo.includes(p.id)) {
      setAtuendos((m) => ({ ...m, [pron.id]: atuendo.filter((x) => x !== p.id) }));
      setMsgClima(null);
      return;
    }
    if (atuendoListo) {
      setMsgClima({ mal: true, txt: `Ya elegiste ${PRENDAS_POR_ATUENDO} prendas. Toca una de las que trae puestas para quitarla y probar otra.` });
      return;
    }
    const nivel = nivelDe(p.id, pron.condicion);
    if (nivel === "absurdo") {
      sfxNo();
      setMsgClima({ mal: true, txt: `${razonAbsurda(p.id, pron.condicion)}` });
      return;
    }
    if (nivel === "neutral") {
      setMsgClima({
        mal: false,
        txt: `«${p.en}» se puede llevar, pero no es lo que este clima pide. Busca las prendas que resuelven «${pron.texto.replace(/^.*?It's/, "It's")}».`,
      });
      return;
    }
    const nuevo = [...atuendo, p.id];
    setAtuendos((m) => ({ ...m, [pron.id]: nuevo }));
    sfxPlace();
    const frasePrenda = `${pron.pronombre} is wearing ${p.en}.`;
    if (nuevo.length >= PRENDAS_POR_ATUENDO) {
      sfxOk();
      setMsgClima({ mal: false, txt: `Atuendo listo. Ahora elige abajo la oración que lo explica en inglés.` });
    } else {
      setMsgClima({ mal: false, txt: `Good choice: ${frasePrenda} (${p.es})` });
    }
  };

  const elegirOracion = (idx: number) => {
    if (oracionOk[pron.id]) return;
    const op = pron.oraciones[idx];
    if (!op) return;
    if (op.correcta) {
      setOracionOk((m) => ({ ...m, [pron.id]: true }));
      setMsgOracion({ mal: false, txt: `Correcta. Present continuous (is + wearing) para lo que trae puesto AHORA, y «because» para la razón.` });
      sfxPlace();
      if (Object.keys(oracionOk).length + 1 >= PRONOSTICOS.length) sfxOk();
    } else {
      setMsgOracion({ mal: true, txt: op.porque });
      sfxNo();
    }
  };

  const resetClima = () => {
    setAtuendos({});
    setOracionOk({});
    setMsgClima(null);
    setMsgOracion(null);
    setPronIdx(0);
  };

  /* ── MODO 4 · Now or usually? (se escribe) ────────────────────────── */
  const [ahoraVal, setAhoraVal] = useState<Record<string, string>>({});
  const [ahoraEstado, setAhoraEstado] = useState<Record<string, "vacio" | "bien" | "mal">>({});
  const [ahoraMsg, setAhoraMsg] = useState<Record<string, string>>({});
  const ahoraDone = AHORA.every((i) => ahoraEstado[i.id] === "bien");

  const comprobarAhora = (id: string) => {
    const item = AHORA.find((x) => x.id === id);
    if (!item || ahoraEstado[id] === "bien") return;
    const valor = ahoraVal[id] ?? "";
    if (valor.trim() === "") {
      setAhoraEstado((m) => ({ ...m, [id]: "vacio" }));
      return;
    }
    const v = normaliza(valor);
    const bien = [item.respuesta, ...item.alternativas].some((r) => normaliza(r) === v);
    if (bien) {
      setAhoraEstado((m) => ({ ...m, [id]: "bien" }));
      setAhoraMsg((m) => ({
        ...m,
        [id]:
          item.tipo === "continuous"
            ? `«${item.marcador}» señala este momento: present continuous (${MARCADORES_INFO.continuous.forma}).`
            : `«${item.marcador}» señala un hábito: present simple (${MARCADORES_INFO.simple.forma}).`,
      }));
      sfxPlace();
      if (AHORA.filter((x) => ahoraEstado[x.id] === "bien").length + 1 >= AHORA.length) sfxOk();
      return;
    }
    const cruzado = item.contrario.some((c) => normaliza(c) === v);
    setAhoraEstado((m) => ({ ...m, [id]: "mal" }));
    setAhoraMsg((m) => ({
      ...m,
      [id]: cruzado
        ? item.tipo === "continuous"
          ? `Ese es el tiempo del hábito. «${item.marcador}» habla de este momento, así que pide present continuous: ${MARCADORES_INFO.continuous.forma} → «${item.respuesta}».`
          : `Ese es el tiempo de ahora mismo. «${item.marcador}» habla de lo que pasa normalmente, así que pide present simple: ${MARCADORES_INFO.simple.forma} → «${item.respuesta}».`
        : `Todavía no. Fíjate en «${item.marcador}» y en el sujeto «${item.antes.trim().split(/\s+/).slice(-1)[0] ?? ""}»: decide el tiempo y la forma del verbo «${item.verbo}».`,
    }));
    sfxNo();
  };

  const resetAhora = () => {
    setAhoraVal({});
    setAhoraEstado({});
    setAhoraMsg({});
  };

  /* ── MODO 5 · Completa el texto (A2 verbatim) ─────────────────────── */
  const [textoDone, setTextoDone] = useState(false);
  const [textoIntento, setTextoIntento] = useState(0);
  const resetTexto = () => {
    setTextoDone(false);
    setTextoIntento((n) => n + 1);
  };

  /* ── reto evaluable ───────────────────────────────────────────────── */
  const [quizAprobado, setQuizAprobado] = useState(false);

  /* ── objetivos ────────────────────────────────────────────────────── */
  const todoHecho = ordenDone && juiciosDone && behaveDone && atuendosDone && oracionesDone && ahoraDone && textoDone;
  const objetivos = [
    { txt: `Arma las ${FRASES.length} frases con el orden del adjetivo`, done: ordenDone },
    { txt: `Juzga las ${JUICIOS.length} frases: cuál se dice y cuál suena imposible`, done: juiciosDone },
    { txt: `Elige be o have en las ${BE_HAVE.length} descripciones`, done: behaveDone },
    { txt: `Viste a las ${PRONOSTICOS.length} personas según su pronóstico`, done: atuendosDone },
    { txt: "Justifica cada atuendo con la oración correcta", done: oracionesDone },
    { txt: `Escribe las ${AHORA.length} formas de wear (ahora frente a normalmente)`, done: ahoraDone },
    { txt: "Completa el texto de la progresión", done: textoDone },
    { txt: "Aprueba el reto evaluable", done: quizAprobado },
    { txt: "Termina con 2 errores o menos", done: todoHecho && partida.errores <= 2 },
  ];

  /* ── arrastre nativo (modo 1) ─────────────────────────────────────── */
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
  });

  const resetActual = modo === "orden" ? resetOrden : modo === "behave" ? resetBeHave : modo === "clima" ? resetClima : modo === "ahora" ? resetAhora : resetTexto;

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes dpcShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-5px);} 40%{transform:translateX(5px);} 60%{transform:translateX(-3px);} 80%{transform:translateX(3px);} }
        @keyframes dpcPop { 0%{transform:scale(.7);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        @keyframes dpcLluvia { 0%{transform:translateY(-14px);opacity:0;} 15%{opacity:.85;} 100%{transform:translateY(120px);opacity:0;} }
        @keyframes dpcNieve { 0%{transform:translateY(-12px) translateX(0);opacity:0;} 15%{opacity:.95;} 100%{transform:translateY(120px) translateX(10px);opacity:0;} }
        @keyframes dpcSol { 0%{transform:rotate(0deg);} 100%{transform:rotate(360deg);} }
        @keyframes dpcViento { 0%{transform:translateX(-30px);opacity:0;} 20%{opacity:.8;} 100%{transform:translateX(150px);opacity:0;} }

        .dpc-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 15px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .dpc-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .dpc-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .dpc-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .dpc-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .dpc-icobtn:hover { background:rgba(255,255,255,0.12); }

        .dpc-chip { cursor:grab; display:inline-flex; align-items:center; gap:8px; padding:11px 16px; border-radius:999px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14.5px; font-weight:800; transition:all .14s; user-select:none; }
        .dpc-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); transform:translateY(-2px); }
        .dpc-chip[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; transform:translateY(-3px) scale(1.02); }
        .dpc-chip:active { cursor:grabbing; }

        .dpc-slot { cursor:pointer; min-width:104px; min-height:46px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
          display:inline-flex; flex-direction:column; align-items:center; justify-content:center; color:${T.text3}; font-size:12px; transition:all .16s; padding:4px 10px; }
        .dpc-slot[data-armed="true"] { border-color:${accent}; background:rgba(${color.rgba},0.1); }
        .dpc-slot[data-shake="true"] { animation:dpcShake .4s; border-color:${NO}; }
        .dpc-slot[data-done="true"] { cursor:default; border-style:solid; }

        .dpc-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; transition:all .16s; }
        .dpc-row[data-done="true"] { border-color:${OK}66; background:${OK}0e; }
        .dpc-row[data-mal="true"] { border-color:${NO}66; }

        .dpc-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:10px 16px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .dpc-btn:hover:not(:disabled) { border-color:${T.lineStrong}; }
        .dpc-btn:disabled { opacity:.42; cursor:default; }
        .dpc-btn[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.18); color:#fff; }
        .dpc-btn[data-done="true"] { border-color:${OK}77; background:${OK}18; color:#fff; }

        .dpc-pill { cursor:pointer; display:inline-flex; align-items:center; gap:7px; padding:8px 13px; border-radius:10px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:12.5px; font-weight:800; transition:all .14s; }
        .dpc-pill:hover { border-color:${T.lineStrong}; color:#fff; }
        .dpc-pill[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; }
        .dpc-pill[data-done="true"] { color:${OK}; border-color:${OK}66; }

        .dpc-verbo { cursor:pointer; min-width:70px; padding:9px 14px; border-radius:10px; border:1.5px solid ${T.line};
          background:${T.inset}; color:${T.text2}; font-size:14.5px; font-weight:800; font-family:inherit; transition:all .14s; }
        .dpc-verbo:hover:not(:disabled) { border-color:${accent}; color:#fff; }
        .dpc-verbo:disabled { cursor:default; }

        .dpc-prenda { cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:6px; padding:11px 8px; border-radius:13px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:11.5px; font-weight:700; text-align:center; transition:all .14s; }
        .dpc-prenda:hover { border-color:${T.lineStrong}; color:#fff; transform:translateY(-2px); }
        .dpc-prenda[data-on="true"] { border-color:${OK}; background:${OK}1a; color:#fff; }

        .dpc-in { border-radius:9px; border:1.5px solid ${T.lineStrong}; background:${T.inset}; color:#fff;
          font-size:14.5px; font-weight:700; padding:6px 11px; font-family:inherit; transition:all .15s; outline:none; width:150px; }
        .dpc-in:focus { border-color:${accent}; box-shadow:0 0 0 3px rgba(${color.rgba},0.18); }
        .dpc-in[data-e="bien"] { border-color:${OK}; background:${OK}1a; color:${OK}; }
        .dpc-in[data-e="mal"] { border-color:${NO}; background:${NO}14; animation:dpcShake .35s; }

        .dpc-escena { position:relative; overflow:hidden; border-radius:18px; border:1px solid ${T.line}; min-height:330px; }
        .dpc-gota { position:absolute; width:2.5px; height:17px; border-radius:2px; background:linear-gradient(180deg,rgba(186,230,253,0) 0%,#BAE6FD 60%,#E0F2FE 100%); animation:dpcLluvia 1.1s linear infinite; }
        .dpc-copo { position:absolute; width:6px; height:6px; border-radius:50%; background:#F8FAFC; animation:dpcNieve 2.6s linear infinite; }
        .dpc-rafaga { position:absolute; height:2px; border-radius:2px; background:rgba(255,255,255,0.75); animation:dpcViento 1.9s linear infinite; }
        .dpc-sol { position:absolute; top:16px; right:22px; width:66px; height:66px; animation:dpcSol 22s linear infinite; }

        .dpc-divider { height:1px; background:${T.line}; margin:16px 0; }
        @media (prefers-reduced-motion: reduce){
          .dpc-slot[data-shake="true"], .dpc-in[data-e="mal"] { animation:none; }
          .dpc-chip, .dpc-chip:hover, .dpc-chip[data-sel="true"], .dpc-prenda:hover { transform:none; }
          .dpc-gota, .dpc-copo, .dpc-rafaga, .dpc-sol { animation:none; }
        }

        /* Cajón de teoría */
        .dpc-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .dpc-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .dpc-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .dpc-drawer[data-open="true"] { transform:translateX(0); }
        .dpc-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .dpc-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .dpc-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .dpc-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .dpc-teoria-fab { position:fixed; right:20px; bottom:20px; z-index:58; cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.86); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .dpc-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
        @media (max-width: 640px){ .dpc-teoria-fab { right:12px; bottom:12px; padding:10px 13px; font-size:12px; } }
        @media (max-width: 980px){ .dpc-grid { grid-template-columns:minmax(0,1fr) !important; } .dpc-escenario { grid-template-columns:minmax(0,1fr) !important; } }
      `}</style>

      {/* ── barra de modos y herramientas ───────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        {MODOS.map((m) => (
          <button key={m.id} className="dpc-tab" data-on={modo === m.id} onClick={() => setModo(m.id)}>
            <i className={`fa-solid ${m.icono}`} />
            {m.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
        <button className="dpc-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría de la práctica">
          <i className="fa-solid fa-book-open" />
        </button>
        <button className="dpc-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
          <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
        </button>
        <button className="dpc-icobtn" onClick={resetActual} title="Reiniciar este modo">
          <i className="fa-solid fa-rotate-left" />
        </button>
      </div>

      {/* ── cajón de teoría ─────────────────────────────────────────── */}
      <button className="dpc-teoria-fab" onClick={() => setDrawer(true)}>
        <i className="fa-solid fa-book-open" />
        Teoría
      </button>
      <div className="dpc-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="dpc-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="dpc-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="dpc-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="dpc-drawer-body">
          <FichaTeorica data={DESCRIBIR_PERSONAS_CLIMA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>

      <div className="dpc-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,28vw,400px)", gap: 22, alignItems: "start" }}>
        {/* ── columna principal ─────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {/* MODO 1 — Adjective order */}
          {modo === "orden" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                  <Eyebrow>Arma la frase: cada adjetivo tiene su casilla</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: ordenDone ? OK : T.text3 }}>
                    {colocadosTotal}/{TOTAL_ADJETIVOS}
                  </span>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                  {FRASES.map((f, i) => {
                    const listo = (puestos[f.id]?.filter((s) => s !== "").length ?? 0) >= f.adjetivos.length;
                    return (
                      <button
                        key={f.id}
                        className="dpc-pill"
                        data-on={fraseIdx === i}
                        data-done={listo}
                        onClick={() => {
                          setFraseIdx(i);
                          setSelAdj(null);
                          setMsgOrden(null);
                        }}
                      >
                        <i className={`fa-solid ${listo ? "fa-circle-check" : "fa-shirt"}`} />
                        {f.sustantivo}
                      </button>
                    );
                  })}
                </div>

                <div style={{ fontSize: 12.5, color: T.text3, marginBottom: 14, lineHeight: 1.55 }}>
                  En español dirías <strong style={{ color: T.text2 }}>«{frase.es}»</strong>. En inglés los adjetivos van <strong style={{ color: T.text2 }}>antes</strong> del
                  sustantivo y en un orden fijo. Coloca cada uno en su casilla.
                </div>

                {/* la frase en construcción */}
                <FilaSlots frase={frase} slots={slotsFrase} selAdj={selAdj} shakeSlot={shakeSlot} onPoner={ponerAdj} dropProps={dropProps} />

                {/* adjetivos sueltos */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 18 }}>
                  {adjLibres.length === 0 ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13.5, color: OK, fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 9 }}>
                        <i className="fa-solid fa-circle-check" /> {frase.articulo ? `${frase.articulo} ` : ""}
                        {frase.adjetivos.map((a) => a.palabra).join(" ")} {frase.sustantivo}
                      </span>
                      <button className="dpc-btn" onClick={() => hablarLab(`${frase.articulo} ${frase.adjetivos.map((a) => a.palabra).join(" ")} ${frase.sustantivo}`)}>
                        <i className="fa-solid fa-volume-high" />
                        Escuchar
                      </button>
                    </div>
                  ) : (
                    adjLibres.map((a) => (
                      <button
                        key={a.palabra}
                        className="dpc-chip"
                        data-sel={selAdj === a.palabra}
                        onClick={() => setSelAdj((s) => (s === a.palabra ? null : a.palabra))}
                        {...dragProps(a.palabra)}
                      >
                        {a.palabra}
                        <span style={{ fontSize: 10.5, fontWeight: 600, color: T.text3 }}>{a.es}</span>
                      </button>
                    ))
                  )}
                </div>

                {/* la versión imposible, una vez armada */}
                {fraseLista && (
                  <div style={{ marginTop: 16, borderRadius: 13, border: `1px solid ${NO}44`, background: `${NO}10`, padding: "12px 15px", display: "flex", gap: 12 }}>
                    <i className="fa-solid fa-ban" style={{ color: NO, fontSize: 15, marginTop: 2 }} />
                    <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.55 }}>
                      Un hablante de inglés no diría <span style={{ textDecoration: "line-through", color: NO, fontWeight: 800 }}>{frase.malSuena}</span>. {frase.porque}
                    </div>
                  </div>
                )}

                {msgOrden && (
                  <div
                    style={{
                      marginTop: 14,
                      borderRadius: 13,
                      border: `1px solid ${msgOrden.mal ? `${NO}55` : `rgba(${color.rgba},0.32)`}`,
                      background: msgOrden.mal ? `${NO}12` : `rgba(${color.rgba},0.09)`,
                      padding: "12px 15px",
                      display: "flex",
                      gap: 12,
                    }}
                  >
                    <i className={`fa-solid ${msgOrden.mal ? "fa-circle-xmark" : "fa-circle-check"}`} style={{ color: msgOrden.mal ? NO : accent, fontSize: 15, marginTop: 2 }} />
                    <span style={{ fontSize: 13, color: T.text2, lineHeight: 1.55 }}>{msgOrden.txt}</span>
                  </div>
                )}
              </div>

              {/* detector de frases imposibles */}
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                  <Eyebrow>
                    <i className="fa-solid fa-ear-listen" style={{ marginRight: 8, color: accent }} />
                    ¿Esta frase se dice o suena imposible?
                  </Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: juiciosDone ? OK : T.text3 }}>
                    {Object.keys(juicios).length}/{JUICIOS.length}
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: T.text3, marginBottom: 14, lineHeight: 1.5 }}>
                  Tres de las seis las diría cualquier hablante de inglés; las otras tres tienen un adjetivo adelantado.
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {JUICIOS.map((j) => {
                    const done = juicios[j.id] === true;
                    const msg = msgJuicio?.id === j.id ? msgJuicio : null;
                    return (
                      <div key={j.id} className="dpc-row" data-done={done} data-mal={msg?.mal === true}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                          <span style={{ flex: 1, minWidth: 180, fontSize: 15.5, fontWeight: 700, color: done ? "#fff" : T.text2 }}>{j.frase}</span>
                          {done ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12.5, fontWeight: 900, color: j.posible ? OK : NO }}>
                              <i className={`fa-solid ${j.posible ? "fa-circle-check" : "fa-ban"}`} />
                              {j.posible ? "Se dice" : "Imposible"}
                            </span>
                          ) : (
                            <>
                              <button className="dpc-btn" onClick={() => juzgar(j.id, true)}>
                                <i className="fa-solid fa-check" />
                                Se dice
                              </button>
                              <button className="dpc-btn" onClick={() => juzgar(j.id, false)}>
                                <i className="fa-solid fa-ban" />
                                Suena imposible
                              </button>
                            </>
                          )}
                        </div>
                        {msg && (
                          <div style={{ marginTop: 10, fontSize: 12.5, color: msg.mal ? NO : T.text3, lineHeight: 1.5, display: "flex", gap: 9 }}>
                            <i className={`fa-solid ${msg.mal ? "fa-circle-xmark" : "fa-circle-info"}`} style={{ marginTop: 2 }} />
                            <span>{msg.txt}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* MODO 2 — Be or have? */}
          {modo === "behave" && (
            <div style={{ ...card, padding: "18px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                <Eyebrow>Elige el verbo que va en cada descripción</Eyebrow>
                <span style={{ fontSize: 12.5, fontWeight: 800, color: behaveDone ? OK : T.text3 }}>
                  {Object.keys(bhOk).length}/{BE_HAVE.length}
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: T.text3, marginBottom: 16, lineHeight: 1.55 }}>
                La regla es la clase de palabra que sigue: si es un <strong style={{ color: "#38BDF8" }}>adjetivo</strong> (tall, young) va{" "}
                <strong style={{ color: "#38BDF8" }}>be</strong>; si es un <strong style={{ color: "#FBBF24" }}>sustantivo</strong> (hair, eyes, glasses) va{" "}
                <strong style={{ color: "#FBBF24" }}>have / has</strong>. Y con he / she / it, have se convierte en <strong>has</strong>.
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {BE_HAVE.map((item) => {
                  const done = bhOk[item.id] === true;
                  const fallo = bhFallo?.id === item.id ? bhFallo : null;
                  return (
                    <div key={item.id} className="dpc-row" data-done={done} data-mal={!!fallo}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 15.5, color: done ? "#fff" : T.text2, display: "inline-flex", alignItems: "center", gap: 9, flexWrap: "wrap", flex: 1, minWidth: 220 }}>
                          <span style={{ fontWeight: 700 }}>{item.sujeto}</span>
                          {done ? (
                            <span style={{ animation: "dpcPop .25s ease", fontWeight: 900, color: OK }}>{item.correcta}</span>
                          ) : (
                            <span className="dpc-slot" style={{ minWidth: 76, minHeight: 36 }}>
                              <i className="fa-solid fa-question" style={{ fontSize: 12 }} />
                            </span>
                          )}
                          <span>{item.resto}</span>
                        </span>
                        {!done && (
                          <span style={{ display: "inline-flex", gap: 8, flexWrap: "wrap" }}>
                            {FORMAS.map((f) => (
                              <button key={f} className="dpc-verbo" onClick={() => elegirForma(item.id, f)}>
                                {f}
                              </button>
                            ))}
                          </span>
                        )}
                        {done && (
                          <button className="dpc-btn" onClick={() => hablarLab(`${item.sujeto} ${item.correcta} ${item.resto}`)} title="Escuchar la oración">
                            <i className="fa-solid fa-volume-high" />
                          </button>
                        )}
                      </div>
                      {done && (
                        <div style={{ marginTop: 9, fontSize: 12.5, color: T.text3, lineHeight: 1.5, display: "flex", gap: 9 }}>
                          <i className="fa-solid fa-circle-check" style={{ color: OK, marginTop: 2 }} />
                          <span>
                            {item.es} · «{item.clave}» es un {item.sigue}, por eso va {item.correcta === "is" || item.correcta === "are" ? "be" : "have"}.
                          </span>
                        </div>
                      )}
                      {fallo && (
                        <div style={{ marginTop: 9, fontSize: 12.5, color: T.text2, lineHeight: 1.5, display: "flex", gap: 9 }}>
                          <i className="fa-solid fa-circle-xmark" style={{ color: NO, marginTop: 2 }} />
                          <span>{fallo.txt}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MODO 3 — Dress for the weather */}
          {modo === "clima" && (
            <>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {PRONOSTICOS.map((p, i) => {
                  const listo = (atuendos[p.id]?.length ?? 0) >= PRENDAS_POR_ATUENDO && oracionOk[p.id] === true;
                  return (
                    <button
                      key={p.id}
                      className="dpc-pill"
                      data-on={pronIdx === i}
                      data-done={listo}
                      onClick={() => {
                        setPronIdx(i);
                        setMsgClima(null);
                        setMsgOracion(null);
                      }}
                    >
                      <i className={`fa-solid ${listo ? "fa-circle-check" : p.icono}`} />
                      {p.lugar.split(",")[0]}
                    </button>
                  );
                })}
              </div>

              <div className="dpc-escenario" style={{ display: "grid", gridTemplateColumns: "minmax(0,300px) minmax(0,1fr)", gap: 16, alignItems: "start" }}>
                <Escenario pron={pron} prendas={atuendo} />

                <div style={{ ...card, padding: "18px 20px" }}>
                  <Eyebrow>Weather report · {pron.lugar}</Eyebrow>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", lineHeight: 1.5, marginBottom: 6 }}>{pron.texto}</div>
                  <div style={{ fontSize: 12, color: T.text3, marginBottom: 4 }}>{pron.es}</div>
                  <div style={{ fontSize: 12, color: T.text3, marginBottom: 14 }}>
                    {pron.cuando} · {pron.persona_desc}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 800, color: T.text2 }}>
                      Elige {PRENDAS_POR_ATUENDO} prendas para {pron.persona}
                    </span>
                    <span style={{ fontSize: 12.5, fontWeight: 800, color: atuendoListo ? OK : T.text3 }}>
                      {atuendo.length}/{PRENDAS_POR_ATUENDO}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px,1fr))", gap: 9 }}>
                    {PRENDAS.map((p) => (
                      <button key={p.id} className="dpc-prenda" data-on={atuendo.includes(p.id)} onClick={() => tocarPrenda(p)} title={p.es}>
                        <i className={`fa-solid ${p.icono}`} style={{ fontSize: 17, color: atuendo.includes(p.id) ? OK : p.color }} />
                        <span>{p.en}</span>
                      </button>
                    ))}
                  </div>

                  {msgClima && (
                    <div
                      style={{
                        marginTop: 14,
                        borderRadius: 12,
                        border: `1px solid ${msgClima.mal ? `${NO}55` : `rgba(${color.rgba},0.32)`}`,
                        background: msgClima.mal ? `${NO}12` : `rgba(${color.rgba},0.09)`,
                        padding: "11px 14px",
                        display: "flex",
                        gap: 11,
                      }}
                    >
                      <i className={`fa-solid ${msgClima.mal ? "fa-triangle-exclamation" : "fa-circle-info"}`} style={{ color: msgClima.mal ? NO : accent, fontSize: 14, marginTop: 2 }} />
                      <span style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>{msgClima.txt}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* justificación */}
              <div style={{ ...card, padding: "18px 22px", opacity: atuendoListo ? 1 : 0.55 }}>
                <Eyebrow>
                  <i className="fa-solid fa-comment-dots" style={{ marginRight: 8, color: accent }} />
                  Justifica el atuendo en inglés
                </Eyebrow>
                {!atuendoListo ? (
                  <div style={{ fontSize: 13, color: T.text3, display: "flex", gap: 10, alignItems: "center" }}>
                    <i className="fa-solid fa-lock" />
                    Viste primero a {pron.persona} con {PRENDAS_POR_ATUENDO} prendas adecuadas.
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 12.5, color: T.text3, marginBottom: 12, lineHeight: 1.5 }}>
                      Solo una de las tres está bien escrita <em>y</em> dice la razón correcta.
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                      {pron.oraciones.map((op, i) => {
                        const resuelto = oracionOk[pron.id] === true;
                        return (
                          <button
                            key={i}
                            className="dpc-btn"
                            data-done={resuelto && op.correcta}
                            disabled={resuelto}
                            onClick={() => elegirOracion(i)}
                            style={{ justifyContent: "flex-start", textAlign: "left", fontSize: 14.5, fontWeight: 700, lineHeight: 1.45, padding: "12px 15px" }}
                          >
                            <span
                              style={{
                                width: 22,
                                height: 22,
                                flexShrink: 0,
                                borderRadius: "50%",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 11,
                                fontWeight: 900,
                                border: `1.5px solid ${resuelto && op.correcta ? OK : T.line}`,
                                color: resuelto && op.correcta ? OK : T.text3,
                              }}
                            >
                              {resuelto && op.correcta ? <i className="fa-solid fa-check" /> : String.fromCharCode(65 + i)}
                            </span>
                            <span style={{ flex: 1 }}>{op.texto}</span>
                          </button>
                        );
                      })}
                    </div>
                    {oracionOk[pron.id] === true && (
                      <button className="dpc-btn" style={{ marginTop: 12 }} onClick={() => hablarLab(pron.oraciones.find((o) => o.correcta)?.texto ?? "")}>
                        <i className="fa-solid fa-volume-high" />
                        Escuchar la oración
                      </button>
                    )}
                    {msgOracion && (
                      <div
                        style={{
                          marginTop: 12,
                          borderRadius: 12,
                          border: `1px solid ${msgOracion.mal ? `${NO}55` : `${OK}55`}`,
                          background: msgOracion.mal ? `${NO}12` : `${OK}12`,
                          padding: "11px 14px",
                          display: "flex",
                          gap: 11,
                        }}
                      >
                        <i className={`fa-solid ${msgOracion.mal ? "fa-circle-xmark" : "fa-circle-check"}`} style={{ color: msgOracion.mal ? NO : OK, fontSize: 14, marginTop: 2 }} />
                        <span style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>{msgOracion.txt}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}

          {/* MODO 4 — Now or usually? */}
          {modo === "ahora" && (
            <div style={{ ...card, padding: "18px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                <Eyebrow>Escribe la forma del verbo: ahora mismo o normalmente</Eyebrow>
                <span style={{ fontSize: 12.5, fontWeight: 800, color: ahoraDone ? OK : T.text3 }}>
                  {AHORA.filter((i) => ahoraEstado[i.id] === "bien").length}/{AHORA.length}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 11, marginBottom: 18 }}>
                {(["continuous", "simple"] as const).map((k) => {
                  const info = MARCADORES_INFO[k];
                  return (
                    <div key={k} style={{ borderRadius: 13, border: `1px solid ${info.color}44`, background: `${info.color}10`, padding: "12px 15px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, fontWeight: 900, color: info.color }}>
                        <i className={`fa-solid ${info.icono}`} />
                        {info.titulo}
                      </div>
                      <div style={{ fontSize: 12.5, color: "#fff", fontWeight: 700, marginTop: 6 }}>{info.forma}</div>
                      <div style={{ fontSize: 11.5, color: T.text3, marginTop: 5, lineHeight: 1.5 }}>Marcas: {info.marcas.join(" · ")}</div>
                      <div style={{ fontSize: 11.5, color: T.text3, marginTop: 4, fontStyle: "italic" }}>{info.ejemplo}</div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {AHORA.map((item) => {
                  const est = ahoraEstado[item.id] ?? "vacio";
                  const done = est === "bien";
                  return (
                    <div key={item.id} className="dpc-row" data-done={done} data-mal={est === "mal"}>
                      <div style={{ fontSize: 15, lineHeight: 2.1, color: done ? "#fff" : T.text2 }}>
                        {item.antes}
                        {done ? (
                          <strong style={{ color: OK, animation: "dpcPop .25s ease" }}>{item.respuesta}</strong>
                        ) : (
                          <input
                            className="dpc-in"
                            data-e={est}
                            value={ahoraVal[item.id] ?? ""}
                            aria-label={`Oración ${item.id}: forma de ${item.verbo}`}
                            placeholder={`(${item.verbo})`}
                            onChange={(e) => {
                              const v = e.target.value;
                              setAhoraVal((m) => ({ ...m, [item.id]: v }));
                              if (est === "mal") setAhoraEstado((m) => ({ ...m, [item.id]: "vacio" }));
                            }}
                            onBlur={() => comprobarAhora(item.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                comprobarAhora(item.id);
                              }
                            }}
                          />
                        )}
                        {item.despues}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".05em", textTransform: "uppercase", color: T.text3, border: `1px solid ${T.line}`, borderRadius: 6, padding: "2px 8px" }}>
                          {item.marcador}
                        </span>
                        {done && (
                          <button className="dpc-btn" style={{ padding: "6px 11px", fontSize: 12 }} onClick={() => hablarLab(`${item.antes}${item.respuesta}${item.despues}`)}>
                            <i className="fa-solid fa-volume-high" />
                          </button>
                        )}
                        {done && <span style={{ fontSize: 12, color: T.text3 }}>{item.es}</span>}
                      </div>
                      {ahoraMsg[item.id] && (
                        <div style={{ marginTop: 8, fontSize: 12.5, color: est === "mal" ? T.text2 : T.text3, lineHeight: 1.5, display: "flex", gap: 9 }}>
                          <i className={`fa-solid ${est === "mal" ? "fa-circle-xmark" : "fa-circle-info"}`} style={{ color: est === "mal" ? NO : OK, marginTop: 2 }} />
                          <span>
                            {ahoraMsg[item.id]}
                            {item.nota && done ? ` ${item.nota}` : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MODO 5 — Completa el texto (A2 verbatim) */}
          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={DESCRIBIR_PERSONAS_CLIMA_HUECOS}
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
        </div>

        {/* ── columna lateral ───────────────────────────────────────── */}
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
              {modo === "orden" && (
                <>
                  El orden nunca cambia: <strong style={{ color: T.text }}>opinión → tamaño → edad → color → material → sustantivo</strong>. No hace falta usarlos todos, pero
                  los que uses van en ese orden.
                </>
              )}
              {modo === "behave" && (
                <>
                  Mira la palabra que sigue al hueco. ¿Es un adjetivo? <strong style={{ color: T.text }}>be</strong>. ¿Es un sustantivo?{" "}
                  <strong style={{ color: T.text }}>have / has</strong>. Y jamás los dos juntos: «She is have long hair» no existe.
                </>
              )}
              {modo === "clima" && (
                <>
                  Hay más de una combinación válida por pronóstico: lo que se evalúa es que ninguna prenda contradiga el clima y que la oración diga{" "}
                  <strong style={{ color: T.text }}>is wearing … because it&apos;s …</strong>.
                </>
              )}
              {modo === "ahora" && (
                <>
                  <strong style={{ color: T.text }}>right now / at the moment / today</strong> → is wearing. <strong style={{ color: T.text }}>every day / usually</strong> →
                  wears. Se acepta la contracción («he&apos;s wearing») y no se castiga la mayúscula.
                </>
              )}
              {modo === "texto" && <>Aquí ya no se toca: se escribe. El botón de pista y el banco de palabras están ahí si te atoras.</>}
            </span>
          </div>

          {/* la regla, tal como la enuncia A1 */}
          <div style={{ ...card, padding: "18px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-ruler" style={{ marginRight: 8, color: accent }} />
              El orden del adjetivo
            </Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {ORDEN_ADJ.map((c, i) => {
                const info = CAT_INFO[c];
                return (
                  <div key={c} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5 }}>
                    <span style={{ width: 20, height: 20, borderRadius: 6, background: `${info.color}22`, color: info.color, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, flexShrink: 0 }}>
                      {i + 1}
                    </span>
                    <span style={{ fontWeight: 800, color: "#fff", minWidth: 62 }}>{info.titulo}</span>
                    <span style={{ color: T.text3 }}>{info.ejemplo}</span>
                  </div>
                );
              })}
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, marginTop: 2 }}>
                <span style={{ width: 20, height: 20, borderRadius: 6, background: T.glassSoft, color: T.text3, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, flexShrink: 0 }}>
                  <i className="fa-solid fa-flag-checkered" />
                </span>
                <span style={{ fontWeight: 800, color: "#fff" }}>Sustantivo</span>
                <span style={{ color: T.text3 }}>jacket, dress, backpack</span>
              </div>
            </div>
            <div className="dpc-divider" />
            <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.55 }}>{REGLA_ADJETIVO_A1}</div>
          </div>

          {/* glosario verbatim A5 */}
          <div style={{ ...card, padding: "18px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-spell-check" style={{ marginRight: 8, color: accent }} />
              Glosario de la progresión
            </Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {GLOSARIO_A5.map((g) => (
                <div key={g.termino} style={{ fontSize: 12.5, lineHeight: 1.5 }}>
                  <div style={{ fontWeight: 800, color: "#fff" }}>{g.termino}</div>
                  <div style={{ color: T.text3 }}>{g.definicion}</div>
                  <div style={{ color: T.text3, fontStyle: "italic" }}>{g.ejemplo}</div>
                </div>
              ))}
            </div>
          </div>

          {/* dato verbatim */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid ${T.line}`, background: T.glass, fontSize: 12.5, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-circle-info" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>{DATO_BILINGUE}</span>
          </div>
        </div>
      </div>

      {/* ── paneles verbatim ─────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px,1fr))", gap: 16, marginTop: 22 }}>
        <div style={{ ...card, padding: "20px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-lightbulb" style={{ marginRight: 8, color: accent }} />
            Puntos clave de la infografía
          </Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {PUNTOS_CLAVE.map((p, i) => (
              <div key={i} style={{ display: "flex", gap: 11, fontSize: 12.5, lineHeight: 1.55, color: T.text2 }}>
                <i className="fa-solid fa-angle-right" style={{ color: accent, marginTop: 3, flexShrink: 0 }} />
                <span>{p}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...card, padding: "20px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-pen-nib" style={{ marginRight: 8, color: accent }} />
            Tu turno
          </Eyebrow>
          <div style={{ fontSize: 13.5, color: T.text, lineHeight: 1.55, marginBottom: 12 }}>{TU_TURNO_A3.prompt}</div>
          <ul style={{ margin: "0 0 12px", paddingLeft: 18, fontSize: 12.5, color: T.text2, lineHeight: 1.6, display: "flex", flexDirection: "column", gap: 5 }}>
            {TU_TURNO_A3.pistas.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
          <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.55 }}>
            De {TU_TURNO_A3.minimo} a {TU_TURNO_A3.maximo} palabras. Se evalúa: {TU_TURNO_A3.criterios.join(" · ")}.
          </div>
        </div>

        <div style={{ ...card, padding: "20px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-film" style={{ marginRight: 8, color: accent }} />
            Del video de la progresión
          </Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text3, marginBottom: 12 }}>{VIDEO_A8.titulo}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {VIDEO_A8.preguntas.map((q, i) => (
              <div key={i} style={{ fontSize: 12.5, lineHeight: 1.5 }}>
                <div style={{ color: "#fff", fontWeight: 700 }}>{q.pregunta}</div>
                <div style={{ color: T.text3, marginTop: 3 }}>{q.respuesta}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...card, padding: "20px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-comments" style={{ marginRight: 8, color: accent }} />
            Preguntas de reflexión
          </Eyebrow>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: T.text2, lineHeight: 1.6, display: "flex", flexDirection: "column", gap: 9 }}>
            {REFLEXION_A1.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── reto evaluable (A4 verbatim) ─────────────────────────────── */}
      <RetoQuizCard
        quiz={QUIZ}
        accent={accent}
        rgba={color.rgba}
        aprobado={quizAprobado}
        onAprobado={() => setQuizAprobado(true)}
        playSfx={sonido ? (ok) => (ok ? sfxOk() : sfxNo()) : undefined}
        mensajeAprobado="Describes en inglés con el orden, el verbo y el tiempo correctos."
      />

      {/* ── nota al pie ──────────────────────────────────────────────── */}
      <div style={{ marginTop: 18, display: "flex", gap: 12, fontSize: 11.5, color: T.text3, lineHeight: 1.6 }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          Son <strong>verbatim</strong> de la progresión IN-II-P04: el marco teórico, los puntos clave, la regla del adjetivo y las preguntas de reflexión de la
          infografía A1; el texto con huecos de A2 con sus pistas y alternativas; el encargo de escritura y sus criterios de A3; el reto evaluable de A4; el
          glosario de A5; y las preguntas del video de A8. La oración 7 del modo «Now or usually?» está <strong>adaptada</strong> del texto de A6. Lo que escribí
          para esta práctica y hay que leer como <strong>ilustrativo</strong>: las seis frases del modo «Adjective order», las seis del detector de frases
          imposibles, las ocho descripciones de «Be or have?» y las cuatro personas de los pronósticos (Paola, Bruno, Renata e Iker son{" "}
          <strong>ficticias</strong>, y se describen solo por estatura, cabello, lentes y ropa: describir sin juzgar el cuerpo es un criterio explícito de A3).
          La regla del orden del adjetivo y las formas verbales son las de cualquier gramática descriptiva del inglés estadounidense estándar. Los lugares son
          reales y su clima es el que se describe —en Creel, Sierra Tarahumara, nieva en invierno; La Ventosa, en el Istmo de Tehuantepec, es de las zonas más
          ventosas del país y por eso concentra parques eólicos; Mérida es calurosa todo el año; Xalapa es lluviosa y templada—, pero las{" "}
          <strong>temperaturas son valores típicos ilustrativos</strong>, no mediciones de un día concreto. Fuente: {FUENTE}
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * La fila de casillas del modo «Adjective order».
 *
 * Vive fuera del shell a propósito: dentro, el `dropProps((id) => …)` de cada
 * casilla es un cierre creado en render que acaba tocando el ref del audio, y
 * el linter del compilador de React lo rechaza («Cannot access refs during
 * render»). Como componente hijo, el cierre se crea al renderizar el hijo y la
 * regla se cumple sin cambiar el comportamiento.
 * ═══════════════════════════════════════════════════════════════════════════ */
function FilaSlots({
  frase,
  slots,
  selAdj,
  shakeSlot,
  onPoner,
  dropProps,
}: {
  frase: FraseOrden;
  slots: string[];
  selAdj: string | null;
  shakeSlot: number | null;
  onPoner: (palabra: string, slot: number) => void;
  dropProps: (onDrop: (id: string) => void) => { onDragOver: (e: React.DragEvent) => void; onDrop: (e: React.DragEvent) => void };
}) {
  const completa = slots.every((s) => s !== "");
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10, flexWrap: "wrap", padding: "8px 0 4px" }}>
      {frase.articulo && <span style={{ fontSize: 20, fontWeight: 800, color: T.text2, paddingBottom: 12 }}>{frase.articulo}</span>}
      {frase.adjetivos.map((a, i) => {
        const puesto = slots[i] ?? "";
        const info = CAT_INFO[a.cat];
        return (
          <div key={a.palabra} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase", color: info.color }}>
              {i + 1}. {info.titulo}
            </span>
            <span
              className="dpc-slot"
              role="button"
              tabIndex={puesto ? -1 : 0}
              aria-label={puesto ? `Casilla ${i + 1}: ${puesto}` : `Casilla ${i + 1} de ${info.titulo}, vacía`}
              data-armed={!!selAdj && !puesto}
              data-shake={shakeSlot === i}
              data-done={!!puesto}
              onClick={() => selAdj && onPoner(selAdj, i)}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && selAdj) {
                  e.preventDefault();
                  onPoner(selAdj, i);
                }
              }}
              {...dropProps((id) => onPoner(id, i))}
              style={puesto ? { borderColor: info.color, background: `${info.color}1f`, color: "#fff" } : undefined}
            >
              {puesto ? (
                <span style={{ animation: "dpcPop .25s ease", fontSize: 16, fontWeight: 900 }}>{puesto}</span>
              ) : (
                <i className="fa-solid fa-arrow-down" style={{ fontSize: 12 }} />
              )}
            </span>
          </div>
        );
      })}
      <span style={{ fontSize: 20, fontWeight: 900, color: completa ? OK : T.text2, paddingBottom: 12 }}>{frase.sustantivo}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * La escena: el parte del clima y la persona que se viste.
 * SVG puro; cada prenda elegida dibuja una capa sobre la figura.
 * ═══════════════════════════════════════════════════════════════════════════ */

const CIELO: Record<Condicion, { fondo: string; suelo: string; etiqueta: string }> = {
  raining: { fondo: "linear-gradient(180deg,#334155 0%,#1E293B 60%,#0F172A 100%)", suelo: "#1E293B", etiqueta: "It's raining" },
  snowing: { fondo: "linear-gradient(180deg,#475569 0%,#334155 55%,#1E293B 100%)", suelo: "#E2E8F0", etiqueta: "It's snowing" },
  hot: { fondo: "linear-gradient(180deg,#0EA5E9 0%,#7DD3FC 55%,#FDE68A 100%)", suelo: "#FCD34D", etiqueta: "It's hot and sunny" },
  windy: { fondo: "linear-gradient(180deg,#0C4A6E 0%,#0369A1 55%,#075985 100%)", suelo: "#0C4A6E", etiqueta: "It's windy" },
};

/** Posiciones deterministas (nada de Math.random en render). */
const GOTAS = [8, 20, 33, 46, 58, 70, 83, 92];
const COPOS = [12, 26, 40, 54, 68, 82, 94];
const RAFAGAS = [24, 46, 68, 88];

/** Escala de la figura según la estatura que declara la descripción. */
const ESTATURA: Record<"alta" | "media" | "baja", number> = { alta: 1, media: 0.94, baja: 0.87 };

function Escenario({ pron, prendas }: { pron: Pronostico; prendas: string[] }) {
  const cond = pron.condicion;
  const cielo = CIELO[cond];
  const lleva = (id: string) => prendas.includes(id);
  const torso = prendas.map((p) => PRENDA_POR_ID[p]).find((p) => p?.slot === "torso");
  const piernas = prendas.map((p) => PRENDA_POR_ID[p]).find((p) => p?.slot === "piernas");
  const pies = prendas.map((p) => PRENDA_POR_ID[p]).find((p) => p?.slot === "pies");
  // La figura crece o encoge con la estatura que dice el texto, para que el
  // dibujo y la descripción en inglés no se contradigan. Los pies se quedan
  // sobre el suelo: la escala se compensa con un desplazamiento.
  const k = ESTATURA[pron.estatura];
  const transform = `translate(${90 * (1 - k)} ${250 * (1 - k)}) scale(${k})`;

  return (
    <div className="dpc-escena" style={{ background: cielo.fondo }}>
      {/* clima */}
      {cond === "raining" &&
        GOTAS.map((x, i) => <span key={x} className="dpc-gota" style={{ left: `${x}%`, top: 0, animationDelay: `${i * 0.13}s` }} />)}
      {cond === "snowing" &&
        COPOS.map((x, i) => <span key={x} className="dpc-copo" style={{ left: `${x}%`, top: 0, animationDelay: `${i * 0.31}s` }} />)}
      {cond === "windy" &&
        RAFAGAS.map((y, i) => <span key={y} className="dpc-rafaga" style={{ top: `${y}px`, left: 0, width: `${58 + i * 14}px`, animationDelay: `${i * 0.37}s` }} />)}
      {cond === "hot" && (
        <svg className="dpc-sol" viewBox="0 0 100 100" aria-hidden>
          <circle cx="50" cy="50" r="22" fill="#FDE047" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <rect key={a} x="48" y="8" width="4" height="13" rx="2" fill="#FDE047" transform={`rotate(${a} 50 50)`} />
          ))}
        </svg>
      )}

      {/* suelo */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 46, background: cielo.suelo, opacity: 0.85 }} />

      {/* la persona */}
      <svg viewBox="0 0 200 300" style={{ position: "relative", display: "block", width: "100%", height: 300 }} role="img" aria-label={`${pron.persona}: ${pron.persona_desc} Lleva ${prendas.length} prendas.`}>
        <g transform={transform}>
        {/* cuerpo base, silueta neutra */}
        <g fill="#94A3B8">
          <circle cx="90" cy="52" r="23" />
          <rect x="83" y="72" width="14" height="12" />
          <rect x="62" y="82" width="56" height="80" rx="14" />
          <rect x="48" y="88" width="14" height="68" rx="7" />
          <rect x="118" y="88" width="14" height="68" rx="7" />
          <rect x="68" y="160" width="20" height="74" rx="9" />
          <rect x="92" y="160" width="20" height="74" rx="9" />
        </g>
        {/* manos */}
        <circle cx="55" cy="160" r="9" fill={lleva("gloves") ? (PRENDA_POR_ID["gloves"]?.color ?? "#A78BFA") : "#94A3B8"} />
        <circle cx="125" cy="160" r="9" fill={lleva("gloves") ? (PRENDA_POR_ID["gloves"]?.color ?? "#A78BFA") : "#94A3B8"} />
        {/* pies descalzos / con calzado */}
        <ellipse cx="78" cy="240" rx="14" ry="7" fill={pies ? pies.color : "#94A3B8"} />
        <ellipse cx="102" cy="240" rx="14" ry="7" fill={pies ? pies.color : "#94A3B8"} />
        {pies?.id === "boots" && (
          <g fill={pies.color}>
            <rect x="66" y="206" width="24" height="30" rx="6" />
            <rect x="90" y="206" width="24" height="30" rx="6" />
          </g>
        )}

        {/* pantalón o shorts */}
        {piernas && (
          <g fill={piernas.color}>
            <rect x="66" y="158" width="24" height={piernas.id === "shorts" ? 32 : 70} rx="8" />
            <rect x="90" y="158" width="24" height={piernas.id === "shorts" ? 32 : 70} rx="8" />
          </g>
        )}

        {/* prenda de torso */}
        {torso && (
          <g fill={torso.color}>
            <rect x="60" y="80" width="60" height={torso.id === "tshirt" ? 62 : 86} rx="14" />
            <rect x="46" y="86" width="16" height={torso.id === "tshirt" ? 34 : 70} rx="8" />
            <rect x="118" y="86" width="16" height={torso.id === "tshirt" ? 34 : 70} rx="8" />
          </g>
        )}

        {/* cabello, del largo que dice la descripción (va encima de la ropa,
            si no los hombros lo taparían) */}
        <g fill="#3F3A38">
          <path d="M66 50 A24 24 0 0 1 114 50 L110 44 L70 44 Z" />
          {pron.pelo === "largo" && (
            <>
              <path d="M66 46 L78 46 L78 122 L66 122 Z" />
              <path d="M102 46 L114 46 L114 122 L102 122 Z" />
            </>
          )}
        </g>

        {/* bufanda */}
        {lleva("scarf") && (
          <g fill={PRENDA_POR_ID["scarf"]?.color ?? "#F472B6"}>
            <rect x="70" y="70" width="40" height="13" rx="6" />
            <rect x="96" y="80" width="12" height="30" rx="5" />
          </g>
        )}

        {/* gorra */}
        {lleva("cap") && (
          <g fill={PRENDA_POR_ID["cap"]?.color ?? "#EF4444"}>
            <path d="M67 44 A23 23 0 0 1 113 44 Z" />
            <rect x="107" y="40" width="26" height="7" rx="3.5" />
          </g>
        )}

        {/* lentes de sol */}
        {lleva("sunglasses") && (
          <g fill="#111827">
            <rect x="74" y="48" width="14" height="10" rx="4" />
            <rect x="92" y="48" width="14" height="10" rx="4" />
            <rect x="88" y="51" width="4" height="3" />
          </g>
        )}

        {/* paraguas: abierto arriba y a la derecha, sostenido por la mano */}
        {lleva("umbrella") && (
          <g>
            <line x1="152" y1="64" x2="127" y2="158" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
            <path d="M126 64 A26 26 0 0 1 178 64 Z" fill={PRENDA_POR_ID["umbrella"]?.color ?? "#38BDF8"} />
            <path d="M126 64 L152 64 L178 64" stroke="#0EA5E9" strokeWidth="2" fill="none" />
          </g>
        )}

        {/* lentes graduados, si la descripción dice que los usa */}
        {pron.lentes && !lleva("sunglasses") && (
          <g fill="none" stroke="#1F2937" strokeWidth="2">
            <circle cx="81" cy="52" r="7" />
            <circle cx="99" cy="52" r="7" />
            <line x1="88" y1="52" x2="92" y2="52" />
          </g>
        )}

        {/* cara mínima y neutra */}
        {!lleva("sunglasses") && (
          <g fill="#0F172A">
            <circle cx="81" cy="52" r="2.6" />
            <circle cx="99" cy="52" r="2.6" />
          </g>
        )}
        </g>
      </svg>

      {/* etiqueta del clima */}
      <div
        style={{
          position: "absolute",
          left: 14,
          top: 14,
          padding: "6px 12px",
          borderRadius: 999,
          background: "rgba(2,12,28,0.7)",
          border: "1px solid rgba(255,255,255,0.18)",
          fontSize: 12,
          fontWeight: 900,
          color: "#fff",
          backdropFilter: "blur(6px)",
        }}
      >
        {cielo.etiqueta}
      </div>
      <div
        style={{
          position: "absolute",
          right: 14,
          bottom: 12,
          fontSize: 12,
          fontWeight: 800,
          color: "rgba(255,255,255,0.85)",
          textShadow: "0 1px 6px rgba(0,0,0,0.6)",
        }}
      >
        {pron.persona}
      </div>
    </div>
  );
}
