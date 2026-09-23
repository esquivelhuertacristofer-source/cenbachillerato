"use client";

/**
 * Laboratorio — Tema, idea central y sus hilos.
 * Práctica experimental para LC-II-P05 (Lengua y Comunicación II):
 * «Distingue los temas y las ideas centrales y secundarias en las narrativas
 * populares».
 *
 * Lo que este laboratorio NO es: el hermano mayor `ideas-clave-subrayado`
 * (LC-I-P05) ya trabaja idea principal / detalle de apoyo / relleno subrayando
 * textos EXPOSITIVOS. Aquí el material es NARRATIVO, y en una narrativa la
 * distinción es otra y más difícil: el tema casi nunca está escrito, hay que
 * inferirlo; lo que pasa (el asunto) no es de qué trata; y dos relatos que no
 * se parecen en nada pueden sostener el mismo tema.
 *
 * Seis modos:
 *  1. «¿Qué pasa? ¿De qué trata?» — reparte doce tarjetas de tres relatos
 *     entre «lo que pasa» y «de qué trata».
 *  2. «El tema que el texto sostiene» — de tres temas candidatos, sólo uno
 *     está sostenido por el relato; luego hay que señalar los dos hilos (el
 *     motivo que se repite, el objeto que vuelve, lo que dice un personaje)
 *     que lo sostienen.
 *  3. «Ni tan ancho ni tan angosto» — mide nueve formulaciones del tema:
 *     demasiado amplio, a la medida, demasiado estrecho.
 *  4. «Dos relatos, un tema» — empareja seis narrativas distintas por el tema
 *     que comparten y nombra ese tema.
 *  5. «Escribe el término» — el glosario de la progresión, de memoria.
 *  6. «Completa el texto» — los huecos verbatim de LC-II-P05-A6.
 *  + Reto evaluable con el quiz verbatim de LC-II-P05-A2.
 *
 * DOM puro (sin three.js): el fenómeno que se estudia ES el texto, así que la
 * escena correcta es el texto mismo. Además funciona con ratón, teclado y
 * pantalla táctil, y no infla el bundle del Worker.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { TEMAS_IDEAS_HUECOS } from "./temas-ideas-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { TableroObjetivos } from "./_objetivos";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { TEMAS_IDEAS_FICHA } from "./temas-ideas-ficha";
import {
  RELATOS,
  relatoPorId,
  TARJETAS,
  CUBETA_INFO,
  CASOS_TEMA,
  CASOS_MEDIDA,
  MEDIDA_INFO,
  MEDIDAS,
  FICHAS_RELATO,
  PAREJAS,
  parejaPorId,
  GLOSARIO,
  LECTURA_A1,
  DATO_A1,
  COMPRENSION_A1,
  PISTAS_A3,
  CONSIGNA_A3,
  HECHOS,
  CRITERIOS_A7,
  QUIZ,
  NOTA_PIE,
  type Cubeta,
  type Medida,
  type Relato,
  type CasoTema,
  type CasoMedida,
} from "./temas-ideas-data";

const NO = "#FF5E5E";
const RETO_KEY = "cen-temas-ideas-narrativa-reto";

type Modo = "asunto" | "tema" | "medida" | "parejas" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "asunto", label: "¿Qué pasa? ¿De qué trata?", icono: "fa-boxes-stacked" },
  { id: "tema", label: "El tema y sus hilos", icono: "fa-diagram-project" },
  { id: "medida", label: "Ni tan ancho ni tan angosto", icono: "fa-ruler-horizontal" },
  { id: "parejas", label: "Dos relatos, un tema", icono: "fa-clone" },
  { id: "glosario", label: "Escribe el término", icono: "fa-spell-check" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

const CUBETAS: Cubeta[] = ["asunto", "tema"];

/** Pista cuando la tarjeta se echó a la caja equivocada (la que se eligió). */
const PISTA_CUBETA: Record<Cubeta, string> = {
  asunto:
    "Lo que pasa se podría filmar: alguien hace algo, en un lugar, en un momento. Si la tarjeta no cuenta ningún hecho, no es el asunto.",
  tema:
    "El tema se dice en pocas palabras y no cuenta hechos: es aquello sobre lo que la historia hace pensar. Si la tarjeta narra lo que ocurre, es el asunto.",
};

/** Pista cuando se le pone al tema una medida que no era. */
const PISTA_MEDIDA: Record<Medida, string> = {
  amplio: "Un tema demasiado amplio cabría en cientos de relatos distintos. ¿De verdad esta formulación serviría para casi cualquier historia?",
  justo: "El tema a la medida abarca el relato completo y no le sobra nada. ¿Esta formulación cubre los tres párrafos, ni más ni menos?",
  estrecho: "Un tema demasiado estrecho se queda en un objeto o en una sola escena. ¿Esta formulación cubre nada más un detalle?",
};

const TOTAL_TARJETAS = TARJETAS.length;
const TOTAL_HILOS = CASOS_TEMA.reduce((n, c) => n + c.hilos.filter((h) => h.sostiene).length, 0);
const TOTAL_EXTREMOS = CASOS_MEDIDA.reduce((n, c) => n + c.formulaciones.filter((f) => f.medida !== "justo").length, 0);

export function LabTemasIdeas({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("asunto");

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
  /** Clic sin veredicto (seleccionar una ficha): suena, no puntúa. */
  const sfxPick = () => sonido && audioRef.current?.blip();

  // ── el pie: la última explicación, siempre a la vista ─────────────────
  const [pie, setPie] = useState<{ ok: boolean; titulo: string; txt: string } | null>(null);

  /* ── modo 1 · ¿qué pasa? ¿de qué trata? ─────────────────────────────── */
  const [atIdx, setAtIdx] = useState(0);
  const [reparto, setReparto] = useState<Record<string, Cubeta>>({});
  const [selTarjeta, setSelTarjeta] = useState<string | null>(null);
  const [shakeCubeta, setShakeCubeta] = useState<Cubeta | null>(null);
  const atRelato = RELATOS[atIdx]!;
  const repartidas = Object.keys(reparto).length;

  const intentarCubeta = (tarjetaId: string, cubeta: Cubeta) => {
    const t = TARJETAS.find((x) => x.id === tarjetaId);
    if (!t || reparto[t.id]) return;
    if (t.cubeta === cubeta) {
      setReparto((r) => ({ ...r, [t.id]: cubeta }));
      setSelTarjeta(null);
      sfxPlace();
      setPie({ ok: true, titulo: CUBETA_INFO[cubeta].label, txt: t.porque });
    } else {
      setShakeCubeta(cubeta);
      sfxNo();
      setPie({ ok: false, titulo: `Ahí no: «${CUBETA_INFO[cubeta].label}»`, txt: PISTA_CUBETA[cubeta] });
      window.setTimeout(() => setShakeCubeta(null), 420);
    }
  };
  const resetAsunto = () => {
    const quedan: Record<string, Cubeta> = {};
    for (const [id, c] of Object.entries(reparto)) {
      const t = TARJETAS.find((x) => x.id === id);
      if (t && t.relatoId !== atRelato.id) quedan[id] = c;
    }
    setReparto(quedan);
    setSelTarjeta(null);
    setPie(null);
  };

  /* ── modo 2 · el tema y sus hilos ───────────────────────────────────── */
  const [temaIdx, setTemaIdx] = useState(0);
  const [temaElegido, setTemaElegido] = useState<Record<string, string>>({});
  const [hilosOk, setHilosOk] = useState<Record<string, boolean>>({});
  const [shakeTema, setShakeTema] = useState<string | null>(null);
  const casoTema = CASOS_TEMA[temaIdx]!;
  const temasAcertados = CASOS_TEMA.filter((c) => temaElegido[c.relatoId]).length;
  const hilosAcertados = Object.keys(hilosOk).length;

  const elegirTema = (casoRelatoId: string, candId: string) => {
    if (temaElegido[casoRelatoId]) return;
    const caso = CASOS_TEMA.find((c) => c.relatoId === casoRelatoId);
    const cand = caso?.candidatos.find((x) => x.id === candId);
    if (!cand) return;
    if (cand.correcto) {
      setTemaElegido((m) => ({ ...m, [casoRelatoId]: candId }));
      sfxPlace();
      setPie({ ok: true, titulo: "Ese tema sí lo sostiene el texto", txt: cand.porque });
    } else {
      setShakeTema(candId);
      sfxNo();
      setPie({ ok: false, titulo: "El texto no sostiene ese tema", txt: cand.porque });
      window.setTimeout(() => setShakeTema(null), 420);
    }
  };

  const marcarHilo = (hiloId: string) => {
    if (hilosOk[hiloId]) return;
    const h = casoTema.hilos.find((x) => x.id === hiloId);
    if (!h) return;
    if (h.sostiene) {
      setHilosOk((m) => ({ ...m, [hiloId]: true }));
      sfxPlace();
      setPie({ ok: true, titulo: h.clase, txt: h.porque });
    } else {
      setShakeTema(hiloId);
      sfxNo();
      setPie({ ok: false, titulo: `Eso es: ${h.clase.toLowerCase()}`, txt: h.porque });
      window.setTimeout(() => setShakeTema(null), 420);
    }
  };

  const resetTema = () => {
    const rid = casoTema.relatoId;
    setTemaElegido((m) => {
      const nx = { ...m };
      delete nx[rid];
      return nx;
    });
    setHilosOk((m) => {
      const nx = { ...m };
      for (const h of casoTema.hilos) delete nx[h.id];
      return nx;
    });
    setPie(null);
  };

  /* ── modo 3 · la medida del tema ────────────────────────────────────── */
  const [medIdx, setMedIdx] = useState(0);
  const [medidas, setMedidas] = useState<Record<string, Medida>>({});
  const [shakeForm, setShakeForm] = useState<string | null>(null);
  const casoMedida = CASOS_MEDIDA[medIdx]!;
  const justosOk = CASOS_MEDIDA.reduce(
    (n, c) => n + c.formulaciones.filter((f) => f.medida === "justo" && medidas[f.id]).length,
    0,
  );
  const extremosOk = CASOS_MEDIDA.reduce(
    (n, c) => n + c.formulaciones.filter((f) => f.medida !== "justo" && medidas[f.id]).length,
    0,
  );

  const intentarMedida = (formId: string, m: Medida) => {
    if (medidas[formId]) return;
    const f = casoMedida.formulaciones.find((x) => x.id === formId);
    if (!f) return;
    if (f.medida === m) {
      setMedidas((prev) => ({ ...prev, [formId]: m }));
      sfxPlace();
      setPie({ ok: true, titulo: MEDIDA_INFO[m].label, txt: f.porque });
    } else {
      setShakeForm(formId);
      sfxNo();
      setPie({ ok: false, titulo: `No es «${MEDIDA_INFO[m].label}»`, txt: PISTA_MEDIDA[m] });
      window.setTimeout(() => setShakeForm(null), 420);
    }
  };
  const resetMedida = () => {
    setMedidas((prev) => {
      const nx = { ...prev };
      for (const f of casoMedida.formulaciones) delete nx[f.id];
      return nx;
    });
    setPie(null);
  };

  /* ── modo 4 · dos relatos, un tema ──────────────────────────────────── */
  const [selFicha, setSelFicha] = useState<string | null>(null);
  const [parejasHechas, setParejasHechas] = useState<string[]>([]);
  const [temaPareja, setTemaPareja] = useState<Record<string, string>>({});
  const [shakeFicha, setShakeFicha] = useState<string | null>(null);
  const temasParejaOk = Object.keys(temaPareja).length;

  const tocarFicha = (id: string) => {
    const f = FICHAS_RELATO.find((x) => x.id === id);
    if (!f || parejasHechas.includes(f.parejaId)) return;
    if (selFicha === null) {
      setSelFicha(id);
      sfxPick();
      return;
    }
    if (selFicha === id) {
      setSelFicha(null);
      return;
    }
    const otra = FICHAS_RELATO.find((x) => x.id === selFicha);
    if (!otra) {
      setSelFicha(id);
      return;
    }
    if (otra.parejaId === f.parejaId) {
      setParejasHechas((ps) => [...ps, f.parejaId]);
      setSelFicha(null);
      sfxPlace();
      setPie({ ok: true, titulo: "Comparten tema", txt: parejaPorId(f.parejaId).contraste });
    } else {
      setShakeFicha(id);
      sfxNo();
      setPie({
        ok: false,
        titulo: "Estos dos no comparten tema",
        txt: "Fíjate en lo que cada relato dice sobre el mundo, no en dónde pasa ni en quién aparece. El escenario y los objetos pueden coincidir sin que el tema coincida.",
      });
      window.setTimeout(() => setShakeFicha(null), 420);
    }
  };

  const elegirTemaPareja = (parejaId: string, opcionId: string) => {
    if (temaPareja[parejaId]) return;
    const op = parejaPorId(parejaId).opciones.find((o) => o.id === opcionId);
    if (!op) return;
    if (op.correcto) {
      setTemaPareja((m) => ({ ...m, [parejaId]: opcionId }));
      sfxPlace();
      setPie({ ok: true, titulo: "Ese es el tema compartido", txt: op.porque });
    } else {
      setShakeFicha(opcionId);
      sfxNo();
      setPie({ ok: false, titulo: "Ese no es el tema compartido", txt: op.porque });
      window.setTimeout(() => setShakeFicha(null), 420);
    }
  };

  const resetParejas = () => {
    setParejasHechas([]);
    setTemaPareja({});
    setSelFicha(null);
    setPie(null);
  };

  /* ── modo 5 · escribe el término ────────────────────────────────────── */
  const [glosarioDone, setGlosarioDone] = useState(false);
  const [glosarioIntento, setGlosarioIntento] = useState(0);
  const resetGlosario = () => {
    setGlosarioDone(false);
    setGlosarioIntento((n) => n + 1);
    setPie(null);
  };

  /* ── modo 6 · completa el texto ─────────────────────────────────────── */
  const [textoDone, setTextoDone] = useState(false);
  const [textoIntento, setTextoIntento] = useState(0);
  const resetTexto = () => {
    setTextoDone(false);
    setTextoIntento((n) => n + 1);
    setPie(null);
  };

  /* ── hechos (A4) ────────────────────────────────────────────────────── */
  const [hechos, setHechos] = useState<(boolean | null)[]>(() => HECHOS.map(() => null));
  const hechosResueltos = hechos.filter((h, i) => h !== null && h === HECHOS[i]!.respuesta).length;
  const hechosDone = hechosResueltos >= HECHOS.length;
  const responderHecho = (i: number, valor: boolean) => {
    const h = HECHOS[i]!;
    if (hechos[i] === h.respuesta) return;
    setHechos((prev) => prev.map((v, j) => (j === i ? valor : v)));
    if (valor === h.respuesta) {
      sfxPlace();
      setPie({ ok: true, titulo: h.respuesta ? "Verdadero" : "Falso", txt: h.retro });
    } else {
      sfxNo();
      setPie({ ok: false, titulo: "No es así", txt: h.retro });
    }
  };

  /* ── reto evaluable (A2) ────────────────────────────────────────────── */
  const [quizAprobado, setQuizAprobado] = useState(false);

  /* ── objetivos ──────────────────────────────────────────────────────── */
  const objetivos = [
    { txt: `Reparte las ${TOTAL_TARJETAS} tarjetas entre asunto y tema`, done: repartidas >= TOTAL_TARJETAS },
    { txt: `Elige el tema que sostienen los ${CASOS_TEMA.length} relatos`, done: temasAcertados >= CASOS_TEMA.length },
    { txt: `Señala los ${TOTAL_HILOS} hilos que sostienen esos temas`, done: hilosAcertados >= TOTAL_HILOS },
    { txt: `Encuentra el tema a la medida en los ${CASOS_MEDIDA.length} casos`, done: justosOk >= CASOS_MEDIDA.length },
    { txt: `Descarta los ${TOTAL_EXTREMOS} temas demasiado anchos o angostos`, done: extremosOk >= TOTAL_EXTREMOS },
    { txt: `Arma las ${PAREJAS.length} parejas de relatos que comparten tema`, done: parejasHechas.length >= PAREJAS.length },
    { txt: "Nombra el tema que comparte cada pareja", done: temasParejaOk >= PAREJAS.length },
    { txt: `Escribe los ${GLOSARIO.length} términos del glosario`, done: glosarioDone },
    { txt: "Completa el texto de la progresión", done: textoDone },
    { txt: `Acierta los ${HECHOS.length} hechos verdadero o falso`, done: hechosDone },
    { txt: "Aprueba el reto evaluable (70 %)", done: quizAprobado },
  ];

  /* ── arrastre nativo + clic para seleccionar y clic para colocar ────── */
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

  const resetActual =
    modo === "asunto"
      ? resetAsunto
      : modo === "tema"
        ? resetTema
        : modo === "medida"
          ? resetMedida
          : modo === "parejas"
            ? resetParejas
            : modo === "glosario"
              ? resetGlosario
              : resetTexto;

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes tinShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes tinPop { 0%{transform:scale(.72);opacity:0;} 100%{transform:scale(1);opacity:1;} }

        .tin-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 15px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13px; font-weight:800; transition:all .14s; }
        .tin-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .tin-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }

        .tin-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .tin-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .tin-icobtn:hover { background:rgba(255,255,255,0.12); }

        .tin-prob { cursor:pointer; padding:8px 13px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass};
          color:${T.text2}; font-size:12.5px; font-weight:800; transition:all .14s; }
        .tin-prob:hover { border-color:${T.lineStrong}; color:#fff; }
        .tin-prob[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; }
        .tin-prob[data-done="true"] { color:${OK}; border-color:${OK}66; }

        .tin-card { cursor:pointer; display:block; width:100%; text-align:left; padding:13px 16px; border-radius:13px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:${T.text}; font-size:13.5px; line-height:1.55;
          transition:all .14s; user-select:none; }
        .tin-card:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.07); }
        .tin-card[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); box-shadow:0 0 18px -5px ${accent}; }
        .tin-card[data-shake="true"] { animation:tinShake .4s; border-color:${NO}; }
        .tin-card[data-done="true"] { cursor:default; border-color:${OK}66; background:${OK}10; }
        .tin-card[data-drag="true"] { cursor:grab; }
        .tin-card[data-drag="true"]:active { cursor:grabbing; }

        .tin-bin { border-radius:16px; border:2px dashed ${T.lineStrong}; padding:16px; min-height:150px; transition:all .16s; }
        .tin-bin[data-shake="true"] { animation:tinShake .4s; }

        .tin-pill { cursor:pointer; display:inline-flex; align-items:center; gap:7px; padding:7px 12px; border-radius:999px;
          border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text2}; font-size:12px; font-weight:800; transition:all .14s; white-space:nowrap; }
        .tin-pill:hover { color:#fff; border-color:${T.lineStrong}; }
        .tin-pill:disabled { cursor:default; opacity:.9; }

        .tin-vf { cursor:pointer; padding:5px 12px; border-radius:9px; border:1px solid ${T.line}; background:${T.glass};
          color:${T.text2}; font-size:11.5px; font-weight:900; letter-spacing:.04em; transition:all .14s; }
        .tin-vf:hover { color:#fff; border-color:${T.lineStrong}; }
        .tin-vf[data-on="true"] { color:#04121f; }

        .tin-hilo { cursor:pointer; display:flex; gap:12px; align-items:flex-start; width:100%; text-align:left;
          padding:12px 15px; border-radius:12px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text2};
          font-size:13.5px; line-height:1.55; transition:all .14s; }
        .tin-hilo:hover:not(:disabled) { border-color:${T.lineStrong}; color:#fff; }
        .tin-hilo:disabled { cursor:default; }
        .tin-hilo[data-ok="true"] { border-color:${OK}; background:${OK}14; color:#fff; animation:tinPop .25s ease; }
        .tin-hilo[data-shake="true"] { animation:tinShake .4s; border-color:${NO}; }

        .tin-grid { display:grid; grid-template-columns:minmax(0,1fr) clamp(300px,27vw,392px); gap:22px; align-items:start; }
        .tin-bins { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:14px; }
        .tin-fichas { display:grid; grid-template-columns:repeat(auto-fit, minmax(230px,1fr)); gap:12px; }
        @media (max-width: 980px){ .tin-grid { grid-template-columns:minmax(0,1fr); } .tin-bins { grid-template-columns:minmax(0,1fr); } }

        .tin-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .tin-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .tin-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .tin-drawer[data-open="true"] { transform:translateX(0); }
        .tin-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .tin-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .tin-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .tin-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .tin-fab { position:fixed; right:20px; bottom:20px; z-index:58; cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.86); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .tin-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
        @media (max-width: 640px){ .tin-fab { right:12px; bottom:12px; padding:10px 13px; font-size:12px; } }

        @media (prefers-reduced-motion: reduce){
          .tin-card, .tin-bin, .tin-hilo { animation:none !important; transition:none; }
          .tin-fab:hover { transform:none; }
        }
      `}</style>

      {/* barra de modos + herramientas */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        {MODOS.map((m) => (
          <button key={m.id} className="tin-tab" data-on={modo === m.id} onClick={() => setModo(m.id)}>
            <i className={`fa-solid ${m.icono}`} />
            {m.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        {/* El marcador y las herramientas viajan juntos: si la barra se parte,
            se parte por aquí y no deja los iconos huérfanos en otro renglón. */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "nowrap" }}>
          <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
          <button className="tin-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría de la práctica">
            <i className="fa-solid fa-book-open" />
          </button>
          <button className="tin-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
            <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
          </button>
          <button className="tin-icobtn" onClick={resetActual} title="Reiniciar este modo">
            <i className="fa-solid fa-rotate-left" />
          </button>
        </div>
      </div>

      {/* cajón de teoría */}
      <button className="tin-fab" onClick={() => setDrawer(true)}>
        <i className="fa-solid fa-book-open" />
        Teoría
      </button>
      <div className="tin-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="tin-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="tin-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="tin-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="tin-drawer-body">
          <FichaTeorica data={TEMAS_IDEAS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>

      <div className="tin-grid">
        {/* ── Columna principal ───────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {modo === "asunto" && (
            <AsuntoPanel
              accent={accent}
              rgba={color.rgba}
              relato={atRelato}
              atIdx={atIdx}
              reparto={reparto}
              selTarjeta={selTarjeta}
              shakeCubeta={shakeCubeta}
              repartidas={repartidas}
              onSelRelato={(i) => {
                setAtIdx(i);
                setSelTarjeta(null);
              }}
              onSelTarjeta={(id) => setSelTarjeta((p) => (p === id ? null : id))}
              onCubeta={(c) => {
                if (selTarjeta) intentarCubeta(selTarjeta, c);
              }}
              onDropCubeta={(id, c) => intentarCubeta(id, c)}
              dragProps={dragProps}
              dropProps={dropProps}
            />
          )}

          {modo === "tema" && (
            <TemaPanel
              accent={accent}
              rgba={color.rgba}
              caso={casoTema}
              temaIdx={temaIdx}
              temaElegido={temaElegido}
              hilosOk={hilosOk}
              shake={shakeTema}
              onSelCaso={setTemaIdx}
              onTema={(id) => elegirTema(casoTema.relatoId, id)}
              onHilo={marcarHilo}
            />
          )}

          {modo === "medida" && (
            <MedidaPanel
              accent={accent}
              caso={casoMedida}
              medIdx={medIdx}
              medidas={medidas}
              shakeForm={shakeForm}
              onSelCaso={setMedIdx}
              onMedida={intentarMedida}
            />
          )}

          {modo === "parejas" && (
            <ParejasPanel
              accent={accent}
              rgba={color.rgba}
              selFicha={selFicha}
              parejasHechas={parejasHechas}
              temaPareja={temaPareja}
              shakeFicha={shakeFicha}
              onFicha={tocarFicha}
              onTemaPareja={elegirTemaPareja}
            />
          )}

          {modo === "glosario" && (
            <div style={{ ...card, padding: "20px 22px" }}>
              <Eyebrow>
                <i className="fa-solid fa-spell-check" style={{ marginRight: 8, color: accent }} />
                Glosario de la progresión · LC-II-P05-A5
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
                    titulo: "Glosario completo",
                    txt: "Con esos seis términos ya puedes decir de cualquier narrativa qué pasa en ella (asunto), de qué trata (tema), qué afirma sobre ese tema (idea principal) y qué lo sostiene (ideas secundarias y motivos recurrentes).",
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
              data={TEMAS_IDEAS_HUECOS}
              accent={accent}
              rgba={color.rgba}
              completado={textoDone}
              onCompletado={() => {
                setTextoDone(true);
                setPie({
                  ok: true,
                  titulo: "Texto completo",
                  txt: "Ese párrafo resume la jerarquía entera: el tema es el asunto general, la idea principal es lo que el texto afirma sobre él, las secundarias lo apoyan, y un mismo tema se puede comparar entre narrativas distintas.",
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
              borderRadius: 16,
              padding: "14px 18px",
              border: `1px solid ${pie ? (pie.ok ? `${OK}55` : `${NO}55`) : T.line}`,
              background: pie ? (pie.ok ? `${OK}12` : `${NO}12`) : T.glass,
              display: "flex",
              gap: 13,
              alignItems: "flex-start",
              minHeight: 62,
              transition: "all .18s",
            }}
          >
            <i
              className={`fa-solid ${pie ? (pie.ok ? "fa-circle-check" : "fa-circle-question") : "fa-comment-dots"}`}
              style={{ color: pie ? (pie.ok ? OK : NO) : T.text3, fontSize: 17, marginTop: 2 }}
            />
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: pie ? (pie.ok ? OK : NO) : T.text3,
                }}
              >
                {pie ? pie.titulo : "¿Por qué?"}
              </div>
              <div style={{ marginTop: 4, fontSize: 13.5, lineHeight: 1.55, color: T.text2 }}>
                {pie
                  ? pie.txt
                  : "Cada vez que decidas algo, aquí aparece la razón: por qué eso es el asunto y no el tema, por qué ese hilo sostiene la idea o por qué el tema le queda grande al relato."}
              </div>
            </div>
          </div>
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
              {modo === "asunto" && (
                <>
                  Lee el relato y reparte sus cuatro tarjetas. <strong style={{ color: T.text }}>Lo que pasa</strong> se podría filmar;{" "}
                  <strong style={{ color: T.text }}>de qué trata</strong> casi nunca está escrito en el texto: se deduce.
                </>
              )}
              {modo === "tema" && (
                <>
                  Primero elige el <strong style={{ color: T.text }}>único tema que el relato sostiene</strong>. Después señala los{" "}
                  <strong style={{ color: T.text }}>dos hilos</strong> que lo sostienen: el motivo que se repite, el objeto que vuelve o lo que dice un personaje.
                </>
              )}
              {modo === "medida" && (
                <>
                  Un tema <strong style={{ color: T.text }}>demasiado amplio</strong> cabe en cualquier relato; uno{" "}
                  <strong style={{ color: T.text }}>demasiado estrecho</strong> se queda en un objeto. El que sirve abarca el relato entero y nada más.
                </>
              )}
              {modo === "parejas" && (
                <>
                  Toca dos fichas que <strong style={{ color: T.text }}>compartan tema</strong>. No se parecen en escenario, época ni personajes: lo único que comparten es la idea.
                </>
              )}
              {modo === "glosario" && (
                <>
                  Lee la definición y su ejemplo y <strong style={{ color: T.text }}>escribe el término</strong>. Si te atoras, usa la pista o abre el banco de términos.
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
              Cómo encontrar el tema
            </Eyebrow>
            <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8 }}>
              {PISTAS_A3.map((p, i) => (
                <li key={i} style={{ fontSize: 13, lineHeight: 1.5, color: T.text2 }}>
                  {p}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 12, paddingTop: 11, borderTop: `1px solid ${T.line}`, fontSize: 12.5, lineHeight: 1.55, color: T.text3 }}>
              <strong style={{ color: T.text2 }}>Después de esta práctica (A3): </strong>
              {CONSIGNA_A3}
            </div>
            <div style={{ marginTop: 10, fontSize: 11, color: T.text3, fontStyle: "italic" }}>Verbatim de LC-II-P05-A3.</div>
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

          {/* Preguntas de comprensión A1 verbatim */}
          <div style={{ ...card, padding: "18px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-circle-question" style={{ marginRight: 8, color: accent }} />
              Comprueba tu lectura
            </Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {COMPRENSION_A1.map((c, i) => (
                <div key={i} style={{ borderRadius: 12, border: `1px solid ${T.line}`, background: T.inset, padding: "11px 14px" }}>
                  <div style={{ fontSize: 12.8, fontWeight: 800, color: T.text }}>{c.pregunta}</div>
                  <div style={{ marginTop: 4, fontSize: 12.3, lineHeight: 1.5, color: T.text3 }}>{c.respuesta}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 11, fontSize: 11, color: T.text3, fontStyle: "italic" }}>Verbatim de LC-II-P05-A1.</div>
          </div>
        </div>
      </div>

      {/* ── Hechos (V/F verbatim A4) + Glosario (A5) ───────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginTop: 22 }}>
        <div style={{ ...card, padding: "20px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <Eyebrow>
              <i className="fa-solid fa-scale-balanced" style={{ marginRight: 8, color: accent }} />
              Hechos: ¿verdadero o falso?
            </Eyebrow>
            <span style={{ fontSize: 12.5, fontWeight: 800, color: hechosDone ? OK : T.text3, fontVariantNumeric: "tabular-nums" }}>
              {hechosResueltos}/{HECHOS.length}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {HECHOS.map((h, i) => {
              const resp = hechos[i];
              const acertado = resp !== null && resp === h.respuesta;
              const fallado = resp !== null && resp !== h.respuesta;
              return (
                <div
                  key={i}
                  style={{
                    borderRadius: 12,
                    border: `1px solid ${acertado ? `${OK}55` : fallado ? `${NO}55` : T.line}`,
                    background: acertado ? `${OK}10` : fallado ? `${NO}10` : T.inset,
                    padding: "11px 14px",
                    transition: "all .16s",
                  }}
                >
                  <div style={{ fontSize: 13, lineHeight: 1.45, color: T.text }}>{h.enunciado}</div>
                  <div style={{ marginTop: 9, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    {[true, false].map((v) => (
                      <button
                        key={String(v)}
                        className="tin-vf"
                        data-on={resp === v}
                        onClick={() => responderHecho(i, v)}
                        disabled={acertado}
                        style={
                          resp === v
                            ? { background: v === h.respuesta ? OK : NO, borderColor: v === h.respuesta ? OK : NO }
                            : undefined
                        }
                      >
                        {v ? "VERDADERO" : "FALSO"}
                      </button>
                    ))}
                    {acertado && (
                      <span style={{ fontSize: 12, fontWeight: 800, color: OK, display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <i className="fa-solid fa-circle-check" /> Correcto
                      </span>
                    )}
                  </div>
                  {resp !== null && <div style={{ marginTop: 8, fontSize: 12.3, lineHeight: 1.5, color: T.text3 }}>{h.retro}</div>}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: T.text3, fontStyle: "italic" }}>Verbatim de LC-II-P05-A4.</div>
        </div>

        <div style={{ ...card, padding: "20px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-spell-check" style={{ marginRight: 8, color: accent }} />
            Glosario de la progresión
          </Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {GLOSARIO.map((g) => (
              <div key={g.id} style={{ borderRadius: 12, border: `1px solid ${T.line}`, background: T.inset, padding: "11px 14px" }}>
                <div style={{ fontSize: 13.5, fontWeight: 900, color: accent }}>{g.termino}</div>
                <div style={{ marginTop: 3, fontSize: 12.8, lineHeight: 1.5, color: T.text2 }}>{g.definicion}</div>
                <div style={{ marginTop: 5, fontSize: 12, color: T.text3, fontStyle: "italic" }}>
                  <i className="fa-solid fa-arrow-turn-up fa-rotate-90" style={{ marginRight: 7, opacity: 0.6 }} />
                  {g.ejemplo}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: T.text3, fontStyle: "italic" }}>
            Los cuatro primeros, verbatim de LC-II-P05-A5; «Asunto» y «Motivo recurrente» se añadieron para esta práctica.
          </div>

          <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.line}` }}>
            <Eyebrow>
              <i className="fa-solid fa-list-check" style={{ marginRight: 8, color: accent }} />
              Al terminar, podrás decir que…
            </Eyebrow>
            <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 7 }}>
              {CRITERIOS_A7.map((c, i) => (
                <li key={i} style={{ fontSize: 12.8, lineHeight: 1.5, color: T.text2 }}>
                  {c}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 10, fontSize: 11, color: T.text3, fontStyle: "italic" }}>Criterios verbatim de LC-II-P05-A7.</div>
          </div>
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
        <span>
          <strong style={{ color: T.text }}>Dato de la progresión. </strong>
          {DATO_A1}
        </span>
      </div>

      <RetoQuizCard
        quiz={QUIZ}
        accent={accent}
        rgba={color.rgba}
        aprobado={quizAprobado}
        onAprobado={() => setQuizAprobado(true)}
        playSfx={(ok) => (ok ? sfxOk() : sfxNo())}
        playPick={sfxPick}
        mensajeAprobado="Distingues el tema de la trama y sabes qué ideas lo sostienen."
      />

      <p style={{ margin: "18px 0 0", paddingBottom: 60, fontSize: 11.5, lineHeight: 1.6, color: T.text3, fontStyle: "italic" }}>
        <i className="fa-solid fa-circle-info" style={{ marginRight: 7, opacity: 0.7 }} />
        {NOTA_PIE}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * El relato, tal como se lee
 * ═══════════════════════════════════════════════════════════════════════════ */
function RelatoCard({ relato, accent, rgba, extra }: { relato: Relato; accent: string; rgba: string; extra?: string }) {
  return (
    <div style={{ ...card, padding: "20px 24px 22px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: accent }}>
            <i className="fa-solid fa-feather" style={{ marginRight: 7 }} />
            {relato.forma}
          </div>
          <h3 style={{ margin: "7px 0 2px", fontSize: 21, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>{relato.titulo}</h3>
        </div>
        {extra && (
          <span
            style={{
              flexShrink: 0,
              padding: "6px 12px",
              borderRadius: 999,
              fontSize: 11.5,
              fontWeight: 900,
              color: "#fff",
              border: `1px solid rgba(${rgba},0.4)`,
              background: `rgba(${rgba},0.14)`,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {extra}
          </span>
        )}
      </div>

      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
        {relato.parrafos.map((p, i) => (
          <div key={i} style={{ display: "flex", gap: 13 }}>
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
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.8, color: T.text2, minWidth: 0 }}>{p}</p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14, paddingTop: 11, borderTop: `1px solid ${T.line}`, fontSize: 11.5, color: T.text3, fontStyle: "italic" }}>
        {relato.procedencia}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 1 — «¿Qué pasa? ¿De qué trata?»
 * ═══════════════════════════════════════════════════════════════════════════ */
function AsuntoPanel({
  accent,
  rgba,
  relato,
  atIdx,
  reparto,
  selTarjeta,
  shakeCubeta,
  repartidas,
  onSelRelato,
  onSelTarjeta,
  onCubeta,
  onDropCubeta,
  dragProps,
  dropProps,
}: {
  accent: string;
  rgba: string;
  relato: Relato;
  atIdx: number;
  reparto: Record<string, Cubeta>;
  selTarjeta: string | null;
  shakeCubeta: Cubeta | null;
  repartidas: number;
  onSelRelato: (i: number) => void;
  onSelTarjeta: (id: string) => void;
  onCubeta: (c: Cubeta) => void;
  onDropCubeta: (id: string, c: Cubeta) => void;
  dragProps: (id: string) => Record<string, unknown>;
  dropProps: (onDrop: (id: string) => void) => Record<string, unknown>;
}) {
  const delRelato = TARJETAS.filter((t) => t.relatoId === relato.id);
  const libres = delRelato.filter((t) => !reparto[t.id]);
  const listo = (rid: string) => TARJETAS.filter((t) => t.relatoId === rid).every((t) => reparto[t.id]);

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
        {RELATOS.map((r, i) => (
          <button key={r.id} className="tin-prob" data-on={atIdx === i} data-done={listo(r.id)} onClick={() => onSelRelato(i)}>
            {listo(r.id) && <i className="fa-solid fa-circle-check" style={{ marginRight: 6 }} />}
            {r.titulo}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, fontWeight: 800, color: repartidas >= TOTAL_TARJETAS ? OK : T.text3, fontVariantNumeric: "tabular-nums" }}>
          {repartidas}/{TOTAL_TARJETAS} tarjetas
        </span>
      </div>

      <RelatoCard relato={relato} accent={accent} rgba={rgba} extra={`${delRelato.length - libres.length}/${delRelato.length} repartidas`} />

      <div style={{ ...card, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 13 }}>
          <Eyebrow>
            <i className="fa-solid fa-layer-group" style={{ marginRight: 8, color: accent }} />
            Cuatro tarjetas sobre este relato
          </Eyebrow>
          <span style={{ fontSize: 11.5, color: T.text3 }}>Tócala y después toca su caja, o arrástrala.</span>
        </div>
        {libres.length === 0 ? (
          <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
            <i className="fa-solid fa-circle-check" /> ¡Relato repartido! Cambia de relato arriba para seguir.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {libres.map((t) => (
              <button key={t.id} className="tin-card" data-drag="true" data-sel={selTarjeta === t.id} onClick={() => onSelTarjeta(t.id)} {...dragProps(t.id)}>
                {t.texto}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="tin-bins">
        {CUBETAS.map((c) => {
          const info = CUBETA_INFO[c];
          const dentro = delRelato.filter((t) => reparto[t.id] === c);
          return (
            <div
              key={c}
              className="tin-bin"
              data-shake={shakeCubeta === c}
              onClick={() => onCubeta(c)}
              {...dropProps((id) => onDropCubeta(id, c))}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onCubeta(c);
                }
              }}
              style={{ borderColor: `${info.color}66`, background: `${info.color}0d`, cursor: selTarjeta ? "pointer" : "default" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 11 }}>
                <span
                  style={{
                    width: 32,
                    height: 32,
                    flexShrink: 0,
                    borderRadius: 9,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    color: "#04121f",
                    background: info.color,
                  }}
                >
                  <i className={`fa-solid ${info.icono}`} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 900, color: "#fff" }}>{info.label}</div>
                  <div style={{ fontSize: 11, color: T.text3, lineHeight: 1.4 }}>{info.descripcion}</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {dentro.map((t) => (
                  <span
                    key={t.id}
                    style={{
                      animation: "tinPop .25s ease",
                      fontSize: 12.5,
                      lineHeight: 1.45,
                      color: "#fff",
                      padding: "9px 11px",
                      borderRadius: 9,
                      background: `${info.color}1f`,
                      border: `1px solid ${info.color}55`,
                    }}
                  >
                    {t.texto}
                  </span>
                ))}
                {dentro.length === 0 && <span style={{ fontSize: 11.5, color: T.text3, fontStyle: "italic" }}>Vacía</span>}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 2 — «El tema y sus hilos»
 * ═══════════════════════════════════════════════════════════════════════════ */
function TemaPanel({
  accent,
  rgba,
  caso,
  temaIdx,
  temaElegido,
  hilosOk,
  shake,
  onSelCaso,
  onTema,
  onHilo,
}: {
  accent: string;
  rgba: string;
  caso: CasoTema;
  temaIdx: number;
  temaElegido: Record<string, string>;
  hilosOk: Record<string, boolean>;
  shake: string | null;
  onSelCaso: (i: number) => void;
  onTema: (candId: string) => void;
  onHilo: (hiloId: string) => void;
}) {
  const relato = relatoPorId(caso.relatoId);
  const elegido = temaElegido[caso.relatoId];
  const sostienen = caso.hilos.filter((h) => h.sostiene);
  const marcados = sostienen.filter((h) => hilosOk[h.id]).length;
  const casoListo = (c: CasoTema) => !!temaElegido[c.relatoId] && c.hilos.filter((h) => h.sostiene).every((h) => hilosOk[h.id]);

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
        {CASOS_TEMA.map((c, i) => {
          const r = relatoPorId(c.relatoId);
          return (
            <button key={c.relatoId} className="tin-prob" data-on={temaIdx === i} data-done={casoListo(c)} onClick={() => onSelCaso(i)}>
              {casoListo(c) && <i className="fa-solid fa-circle-check" style={{ marginRight: 6 }} />}
              {r.titulo}
            </button>
          );
        })}
      </div>

      <RelatoCard relato={relato} accent={accent} rgba={rgba} />

      <div style={{ ...card, padding: "20px 22px" }}>
        <Eyebrow>
          <i className="fa-solid fa-scale-unbalanced" style={{ marginRight: 8, color: accent }} />
          Paso 1 · ¿Cuál de estos tres temas sostiene el relato?
        </Eyebrow>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {caso.candidatos.map((cand) => {
            const acertado = elegido === cand.id;
            const bloqueado = !!elegido;
            return (
              <button
                key={cand.id}
                className="tin-card"
                data-sel={acertado}
                data-done={acertado}
                data-shake={shake === cand.id}
                disabled={bloqueado}
                onClick={() => onTema(cand.id)}
                style={acertado ? { borderColor: OK, background: `${OK}14` } : bloqueado ? { opacity: 0.45 } : undefined}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <i
                    className={`fa-solid ${acertado ? "fa-circle-check" : "fa-circle"}`}
                    style={{ fontSize: 14, color: acertado ? OK : T.text3, opacity: acertado ? 1 : 0.35 }}
                  />
                  <span style={{ fontWeight: acertado ? 800 : 600 }}>{cand.texto}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ ...card, padding: "20px 22px", opacity: elegido ? 1 : 0.55, transition: "opacity .2s" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <Eyebrow>
            <i className="fa-solid fa-diagram-project" style={{ marginRight: 8, color: accent }} />
            Paso 2 · ¿Qué dos líneas sostienen ese tema?
          </Eyebrow>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: marcados >= sostienen.length ? OK : T.text3, fontVariantNumeric: "tabular-nums" }}>
            {marcados}/{sostienen.length}
          </span>
        </div>
        {!elegido ? (
          <div style={{ fontSize: 13, color: T.text3, display: "flex", alignItems: "center", gap: 9 }}>
            <i className="fa-solid fa-lock" /> Primero elige el tema que el relato sostiene.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {caso.hilos.map((h) => {
              const ok = !!hilosOk[h.id];
              // Con los dos hilos encontrados, los demás se apagan: seguir
              // tocándolos ya no enseña nada y sólo costaría estrellas.
              const cerrado = marcados >= sostienen.length;
              return (
                <button
                  key={h.id}
                  className="tin-hilo"
                  data-ok={ok}
                  data-shake={shake === h.id}
                  disabled={ok || cerrado}
                  style={cerrado && !ok ? { opacity: 0.4 } : undefined}
                  onClick={() => onHilo(h.id)}
                >
                  <i
                    className={`fa-solid ${ok ? "fa-circle-check" : "fa-quote-left"}`}
                    style={{ fontSize: ok ? 15 : 11, color: ok ? OK : accent, marginTop: ok ? 1 : 4, flexShrink: 0 }}
                  />
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block" }}>{h.texto}</span>
                    {ok && (
                      <span style={{ display: "block", marginTop: 5, fontSize: 11, fontWeight: 900, letterSpacing: "0.07em", textTransform: "uppercase", color: OK }}>
                        {h.clase}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 3 — «Ni tan ancho ni tan angosto»
 * ═══════════════════════════════════════════════════════════════════════════ */
function MedidaPanel({
  accent,
  caso,
  medIdx,
  medidas,
  shakeForm,
  onSelCaso,
  onMedida,
}: {
  accent: string;
  caso: CasoMedida;
  medIdx: number;
  medidas: Record<string, Medida>;
  shakeForm: string | null;
  onSelCaso: (i: number) => void;
  onMedida: (formId: string, m: Medida) => void;
}) {
  const relato = relatoPorId(caso.relatoId);
  const casoListo = (c: CasoMedida) => c.formulaciones.every((f) => medidas[f.id]);
  const hechas = caso.formulaciones.filter((f) => medidas[f.id]).length;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
        {CASOS_MEDIDA.map((c, i) => {
          const r = relatoPorId(c.relatoId);
          return (
            <button key={c.relatoId} className="tin-prob" data-on={medIdx === i} data-done={casoListo(c)} onClick={() => onSelCaso(i)}>
              {casoListo(c) && <i className="fa-solid fa-circle-check" style={{ marginRight: 6 }} />}
              {r.titulo}
            </button>
          );
        })}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, fontWeight: 800, color: hechas >= caso.formulaciones.length ? OK : T.text3, fontVariantNumeric: "tabular-nums" }}>
          {hechas}/{caso.formulaciones.length}
        </span>
      </div>

      {/* La leyenda de las tres medidas */}
      <div style={{ ...card, padding: "16px 20px" }}>
        <Eyebrow>
          <i className="fa-solid fa-ruler-horizontal" style={{ marginRight: 8, color: accent }} />
          Las tres medidas de un tema
        </Eyebrow>
        <div style={{ display: "flex", gap: 11, flexWrap: "wrap" }}>
          {MEDIDAS.map((m) => {
            const info = MEDIDA_INFO[m];
            return (
              <div
                key={m}
                style={{
                  flex: "1 1 200px",
                  minWidth: 0,
                  borderRadius: 12,
                  border: `1px solid ${info.color}55`,
                  background: `${info.color}0d`,
                  padding: "11px 14px",
                  display: "flex",
                  gap: 11,
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    flexShrink: 0,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    color: "#04121f",
                    background: info.color,
                  }}
                >
                  <i className={`fa-solid ${info.icono}`} />
                </span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 12.5, fontWeight: 900, color: "#fff" }}>{info.label}</span>
                  <span style={{ display: "block", fontSize: 11.5, color: T.text3, lineHeight: 1.4, marginTop: 2 }}>{info.descripcion}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ ...card, padding: "20px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
          <Eyebrow>
            <i className="fa-solid fa-feather" style={{ marginRight: 8, color: accent }} />
            Tres formulaciones del tema de «{relato.titulo}»
          </Eyebrow>
        </div>
        <div style={{ fontSize: 12.8, color: T.text3, lineHeight: 1.5, marginBottom: 15 }}>
          Recuerda de qué va: {relato.asunto}. Ponle a cada formulación la medida que le corresponde.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {caso.formulaciones.map((f) => {
            const puesta = medidas[f.id];
            const info = puesta ? MEDIDA_INFO[puesta] : null;
            return (
              <div
                key={f.id}
                className="tin-card"
                data-shake={shakeForm === f.id}
                data-done={!!puesta}
                style={{
                  cursor: "default",
                  borderColor: info ? `${info.color}88` : undefined,
                  background: info ? `${info.color}12` : undefined,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 11, flexWrap: "wrap" }}>
                  <span style={{ flex: "1 1 220px", minWidth: 0, fontSize: 15, fontWeight: 800, color: "#fff" }}>«{f.texto}»</span>
                  {puesta && info ? (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 13px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 900,
                        color: "#04121f",
                        background: info.color,
                        animation: "tinPop .25s ease",
                      }}
                    >
                      <i className={`fa-solid ${info.icono}`} />
                      {info.label}
                    </span>
                  ) : (
                    <span style={{ display: "inline-flex", gap: 7, flexWrap: "wrap" }}>
                      {MEDIDAS.map((m) => {
                        const mi = MEDIDA_INFO[m];
                        return (
                          <button
                            key={m}
                            className="tin-pill"
                            onClick={() => onMedida(f.id, m)}
                            style={{ borderColor: `${mi.color}55` }}
                            title={mi.descripcion}
                          >
                            <i className={`fa-solid ${mi.icono}`} style={{ color: mi.color }} />
                            {mi.corto}
                          </button>
                        );
                      })}
                    </span>
                  )}
                </div>
                {puesta && <div style={{ marginTop: 9, fontSize: 12.8, lineHeight: 1.55, color: T.text2 }}>{f.porque}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 4 — «Dos relatos, un tema»
 * ═══════════════════════════════════════════════════════════════════════════ */
function ParejasPanel({
  accent,
  rgba,
  selFicha,
  parejasHechas,
  temaPareja,
  shakeFicha,
  onFicha,
  onTemaPareja,
}: {
  accent: string;
  rgba: string;
  selFicha: string | null;
  parejasHechas: string[];
  temaPareja: Record<string, string>;
  shakeFicha: string | null;
  onFicha: (id: string) => void;
  onTemaPareja: (parejaId: string, opcionId: string) => void;
}) {
  const libres = FICHAS_RELATO.filter((f) => !parejasHechas.includes(f.parejaId));

  return (
    <>
      <div style={{ ...card, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 13 }}>
          <Eyebrow>
            <i className="fa-solid fa-clone" style={{ marginRight: 8, color: accent }} />
            Seis narrativas populares · toca dos que compartan tema
          </Eyebrow>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: parejasHechas.length >= PAREJAS.length ? OK : T.text3, fontVariantNumeric: "tabular-nums" }}>
            {parejasHechas.length}/{PAREJAS.length} parejas
          </span>
        </div>
        {libres.length === 0 ? (
          <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
            <i className="fa-solid fa-circle-check" /> ¡Las tres parejas están armadas!
          </div>
        ) : (
          <div className="tin-fichas">
            {libres.map((f) => (
              <button
                key={f.id}
                className="tin-card"
                data-sel={selFicha === f.id}
                data-shake={shakeFicha === f.id}
                onClick={() => onFicha(f.id)}
                style={{ display: "flex", flexDirection: "column", gap: 7, alignItems: "flex-start" }}
              >
                <span
                  style={{
                    padding: "2px 9px",
                    borderRadius: 999,
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    color: accent,
                    border: `1px solid rgba(${rgba},0.42)`,
                    background: `rgba(${rgba},0.12)`,
                  }}
                >
                  {f.forma}
                </span>
                <span style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.25 }}>{f.titulo}</span>
                <span style={{ fontSize: 12.5, lineHeight: 1.5, color: T.text3 }}>{f.asunto}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {parejasHechas.map((pid) => {
        const pareja = parejaPorId(pid);
        const fichas = FICHAS_RELATO.filter((f) => f.parejaId === pid);
        const elegida = temaPareja[pid];
        return (
          <div key={pid} style={{ ...card, padding: "20px 22px", borderColor: `${OK}44`, animation: "tinPop .25s ease" }}>
            <Eyebrow>
              <i className="fa-solid fa-link" style={{ marginRight: 8, color: OK }} />
              Pareja armada
            </Eyebrow>
            <div style={{ display: "flex", gap: 11, flexWrap: "wrap", marginBottom: 13 }}>
              {fichas.map((f) => (
                <span
                  key={f.id}
                  style={{
                    flex: "1 1 230px",
                    minWidth: 0,
                    borderRadius: 12,
                    border: `1px solid ${OK}44`,
                    background: `${OK}0d`,
                    padding: "11px 14px",
                  }}
                >
                  <span style={{ display: "block", fontSize: 10, fontWeight: 900, letterSpacing: "0.06em", textTransform: "uppercase", color: T.text3 }}>{f.forma}</span>
                  <span style={{ display: "block", marginTop: 4, fontSize: 14, fontWeight: 900, color: "#fff" }}>{f.titulo}</span>
                  <span style={{ display: "block", marginTop: 3, fontSize: 12, lineHeight: 1.45, color: T.text3 }}>{f.asunto}</span>
                </span>
              ))}
            </div>

            <div style={{ fontSize: 13, lineHeight: 1.6, color: T.text2, marginBottom: 14 }}>
              <i className="fa-solid fa-code-compare" style={{ marginRight: 9, color: accent }} />
              {pareja.contraste}
            </div>

            <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 14 }}>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: T.text2, marginBottom: 10 }}>
                {elegida ? "Tema compartido:" : "¿Cuál es el tema que comparten?"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {pareja.opciones.map((o) => {
                  const ok = elegida === o.id;
                  if (elegida && !ok) return null;
                  return (
                    <button
                      key={o.id}
                      className="tin-card"
                      data-done={ok}
                      data-shake={shakeFicha === o.id}
                      disabled={!!elegida}
                      onClick={() => onTemaPareja(pid, o.id)}
                      style={ok ? { borderColor: OK, background: `${OK}14`, cursor: "default" } : undefined}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: 11 }}>
                        <i
                          className={`fa-solid ${ok ? "fa-circle-check" : "fa-circle"}`}
                          style={{ fontSize: 14, color: ok ? OK : T.text3, opacity: ok ? 1 : 0.35 }}
                        />
                        <span style={{ fontWeight: ok ? 800 : 600 }}>{o.texto}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
