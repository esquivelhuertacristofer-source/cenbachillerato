"use client";

/**
 * Laboratorio — Anatomía de una exposición oral.
 * Práctica interactiva para LC-I-P08 (Lengua y Comunicación I, 1.er semestre):
 * «Identifica las características de una exposición oral para conocer su
 * desarrollo y ponerlo en práctica.»
 *
 * Por qué NO es un laboratorio 3D: lo que hay que enseñar aquí no es un objeto
 * en el espacio, es cómo está armada por dentro una exposición y en qué orden
 * se construye. Eso se ve en el guion, en el reloj y en el texto; una escena
 * tridimensional sería decoración. DOM puro: ligero y accesible con ratón,
 * teclado y pantalla táctil.
 *
 * Cinco modos, y ninguno es un repaso de características sueltas:
 *  1. «Mesa de montaje» — arma el guion pieza por pieza en el orden en que
 *     tendría que ocurrir y después le quita cada pieza para ver qué se rompe
 *     sin ella.
 *  2. «El reloj» — reparte los segundos entre introducción, desarrollo,
 *     conclusión y preguntas contra una duración fija, hasta descubrir que el
 *     desarrollo se come el cierre.
 *  3. «¿Qué apoyo para este momento?» — decide el apoyo visual de cinco
 *     momentos y lee por qué los otros dos no sirven ahí.
 *  4. «Escribe el término» — el glosario A5, escrito de memoria.
 *  5. «Completa el texto» — los huecos verbatim de A6.
 *  + Clínica de exposiciones (diagnóstico), hechos verdadero/falso (A4), la
 *    mesa de debate (A7) y el reto evaluable (A2).
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, NUM, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { ANATOMIA_EXPOSICION_HUECOS } from "./anatomia-exposicion-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { TableroObjetivos } from "./_objetivos";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { ANATOMIA_EXPOSICION_FICHA } from "./anatomia-exposicion-ficha";
import {
  PIEZAS,
  PARTE_INFO,
  BLOQUES,
  ESCENARIOS_TIEMPO,
  PALABRAS_POR_MINUTO,
  APOYOS,
  CLINICA,
  GLOSARIO,
  HECHOS,
  DEBATE,
  CONSIGNA_A3,
  COMPRENSION_A1,
  DATO_FIL,
  RETO_QUIZ,
  type Parte,
  type BloqueId,
  type BloqueTiempo,
  type EscenarioTiempo,
  type PiezaGuion,
} from "./anatomia-exposicion-data";
import { FondoTermino, VinetaTermino } from "./_vineta";

const NO = "#FF5E5E";
const RETO_KEY = "cen-anatomia-exposicion-oral-reto";

type Modo = "guion" | "reloj" | "apoyos" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "guion", label: "Mesa de montaje", icono: "fa-clone" },
  { id: "reloj", label: "El reloj", icono: "fa-stopwatch" },
  { id: "apoyos", label: "¿Qué apoyo para este momento?", icono: "fa-image" },
  { id: "glosario", label: "Escribe el término", icono: "fa-spell-check" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

const PARTES_ORDEN: Parte[] = ["introduccion", "desarrollo", "conclusion", "despues"];

/** Palabras de verdad: se ignoran los espacios de sobra y los saltos de línea. */
function cuentaPalabras(s: string): number {
  const limpio = s.trim();
  return limpio === "" ? 0 : limpio.split(/\s+/).length;
}

/** 185 → «3:05». Los segundos sueltos se escriben con dos cifras. */
function reloj(segundos: number): string {
  const s = Math.max(0, Math.round(segundos));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

/** Segundos mínimos y máximos que este laboratorio recomienda para un bloque. */
function segMin(b: BloqueTiempo, total: number): number {
  return Math.ceil((b.min / 100) * total);
}
function segMax(b: BloqueTiempo, total: number): number {
  return Math.floor((b.max / 100) * total);
}

type Reparto = Record<BloqueId, number>;

function repartoInicial(esc: EscenarioTiempo): Reparto {
  const cuarto = Math.round(esc.segundos / 4 / esc.paso) * esc.paso;
  return { apertura: cuarto, desarrollo: cuarto, cierre: cuarto, preguntas: esc.segundos - cuarto * 3 };
}

function sumaReparto(r: Reparto): number {
  return BLOQUES.reduce((acc, b) => acc + r[b.id], 0);
}

function repartoValido(r: Reparto, total: number): boolean {
  if (sumaReparto(r) !== total) return false;
  return BLOQUES.every((b) => r[b.id] >= segMin(b, total) && r[b.id] <= segMax(b, total));
}

export function LabAnatomiaExposicion({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("guion");

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

  // ── modo 1: mesa de montaje ───────────────────────────────────────────
  const [guionPos, setGuionPos] = useState(0);
  const [selPieza, setSelPieza] = useState<string | null>(null);
  const [shakeParte, setShakeParte] = useState<Parte | null>(null);
  const [probadas, setProbadas] = useState<Record<string, boolean>>({});
  const [piezaAbierta, setPiezaAbierta] = useState<string | null>(null);

  const guionDone = guionPos >= PIEZAS.length;
  const roturasDone = Object.keys(probadas).length >= PIEZAS.length;
  const piezasLibres = PIEZAS.filter((p) => p.orden >= guionPos)
    .slice()
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  const intentarPieza = (id: string) => {
    if (guionPos >= PIEZAS.length) return;
    const esperada = PIEZAS[guionPos]!;
    if (id === esperada.id) {
      setGuionPos((p) => p + 1);
      setSelPieza(null);
      sfxPlace(`${esperada.nombre}. ${esperada.funcion}`);
      if (guionPos + 1 >= PIEZAS.length) {
        sfxOk();
        setPie({ ok: true, txt: "Guion completo. Ahora toca cada pieza para quitarla del guion y ver qué se rompe sin ella." });
      }
    } else {
      const fallida = PIEZAS.find((p) => p.id === id);
      setShakeParte(esperada.parte);
      sfxNo(
        fallida
          ? `«${fallida.nombre}» todavía no: antes tiene que ir «${esperada.nombre}», porque ${esperada.funcion.charAt(0).toLowerCase()}${esperada.funcion.slice(1)}`
          : "Esa pieza no va todavía."
      );
      window.setTimeout(() => setShakeParte(null), 420);
    }
  };

  const quitarPieza = (id: string) => {
    const p = PIEZAS.find((x) => x.id === id);
    if (!p) return;
    setPiezaAbierta((v) => (v === id ? null : id));
    if (!probadas[id]) {
      setProbadas((prev) => ({ ...prev, [id]: true }));
      if (Object.keys(probadas).length + 1 >= PIEZAS.length) sfxOk();
    }
    setPie({ ok: false, txt: `Sin «${p.nombre}»: ${p.falta}` });
  };

  const resetGuion = () => {
    setGuionPos(0);
    setSelPieza(null);
    setProbadas({});
    setPiezaAbierta(null);
    setPie(null);
  };

  // ── modo 2: el reloj ──────────────────────────────────────────────────
  const [escIdx, setEscIdx] = useState(0);
  const escenario = ESCENARIOS_TIEMPO[escIdx] ?? ESCENARIOS_TIEMPO[0]!;
  const [reparto, setReparto] = useState<Reparto>(() => repartoInicial(ESCENARIOS_TIEMPO[0]!));
  const [relojOk, setRelojOk] = useState<Record<string, boolean>>({});
  const [desbordeVisto, setDesbordeVisto] = useState(false);
  const [ensayo, setEnsayo] = useState(false);

  const suma = sumaReparto(reparto);
  const sobra = suma - escenario.segundos;
  const palabrasCaben = Math.round(
    ((reparto.apertura + reparto.desarrollo + reparto.cierre) / 60) * PALABRAS_POR_MINUTO
  );
  const relojDone = ESCENARIOS_TIEMPO.every((e) => relojOk[e.id]);

  const ajustar = (id: BloqueId, valor: number) => {
    const siguiente: Reparto = { ...reparto, [id]: valor };
    setReparto(siguiente);
    const total = escenario.segundos;
    const bloque = BLOQUES.find((b) => b.id === id)!;

    if (id === "desarrollo" && valor > segMax(bloque, total)) {
      setDesbordeVisto(true);
      const resto = total - valor;
      setPie({
        ok: false,
        txt: `El desarrollo se está comiendo lo que viene después: con ${reloj(valor)} para los tres puntos sólo quedan ${reloj(Math.max(0, resto))} para la introducción, la conclusión y las preguntas juntas. En el salón esto termina igual que siempre: te avisan que se acabó el tiempo a media idea y la exposición se queda sin cierre.`,
      });
    }

    if (repartoValido(siguiente, total)) {
      if (!relojOk[escenario.id]) {
        setRelojOk((prev) => ({ ...prev, [escenario.id]: true }));
        sfxPlace(
          `Reparto viable para ${reloj(total)}: el desarrollo es la parte central y la conclusión conserva su rato. A ese ritmo caben unas ${Math.round(((siguiente.apertura + siguiente.desarrollo + siguiente.cierre) / 60) * PALABRAS_POR_MINUTO)} palabras habladas.`
        );
        sfxOk();
      }
    }
  };

  const cambiarEscenario = (i: number) => {
    const esc = ESCENARIOS_TIEMPO[i];
    if (!esc) return;
    setEscIdx(i);
    setReparto(repartoInicial(esc));
    setEnsayo(false);
    setPie({ ok: true, txt: `${esc.nombre}: ${esc.nota}` });
  };

  const resetReloj = () => {
    setReparto(repartoInicial(escenario));
    setRelojOk({});
    setDesbordeVisto(false);
    setEnsayo(false);
    setPie(null);
  };

  // ── modo 3: apoyos visuales ───────────────────────────────────────────
  // Se guardan TODAS las opciones probadas, no sólo la última: el modo promete
  // que se lee por qué las otras no sirven, y si la explicación desapareciera
  // al acertar, esa lectura se perdería justo cuando se entiende.
  const [apoyoSel, setApoyoSel] = useState<Record<string, number[]>>({});
  const [apoyoOk, setApoyoOk] = useState<Record<string, boolean>>({});
  const [shakeApoyo, setShakeApoyo] = useState<string | null>(null);
  const apoyosDone = Object.keys(apoyoOk).length >= APOYOS.length;

  const elegirApoyo = (casoId: string, i: number) => {
    const caso = APOYOS.find((c) => c.id === casoId);
    if (!caso || apoyoOk[casoId]) return;
    const op = caso.opciones[i];
    if (!op) return;
    setApoyoSel((prev) => {
      const ya = prev[casoId] ?? [];
      return ya.includes(i) ? prev : { ...prev, [casoId]: [...ya, i] };
    });
    if (i === caso.correcta) {
      setApoyoOk((prev) => ({ ...prev, [casoId]: true }));
      sfxPlace(op.porque);
      if (Object.keys(apoyoOk).length + 1 >= APOYOS.length) sfxOk();
    } else {
      setShakeApoyo(casoId);
      sfxNo(op.porque);
      window.setTimeout(() => setShakeApoyo(null), 420);
    }
  };

  const resetApoyos = () => {
    setApoyoSel({});
    setApoyoOk({});
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

  // ── clínica de exposiciones ───────────────────────────────────────────
  const [clinica, setClinica] = useState<(number | null)[]>(() => CLINICA.map(() => null));
  const clinicaAciertos = clinica.filter((v, i) => v !== null && v === CLINICA[i]!.correcta).length;
  const clinicaDone = clinicaAciertos >= CLINICA.length;
  const responderClinica = (i: number, op: number) => {
    const caso = CLINICA[i]!;
    if (clinica[i] === caso.correcta) return;
    setClinica((prev) => prev.map((v, j) => (j === i ? op : v)));
    if (op === caso.correcta) sfxPlace(caso.retro);
    else sfxNo(caso.retro);
  };

  // ── hechos (A4) ───────────────────────────────────────────────────────
  const [hechos, setHechos] = useState<(boolean | null)[]>(() => HECHOS.map(() => null));
  const hechosDone = hechos.filter((h, i) => h !== null && h === HECHOS[i]!.respuesta).length >= HECHOS.length;
  const responderHecho = (i: number, valor: boolean) => {
    const h = HECHOS[i]!;
    if (hechos[i] === h.respuesta) return;
    setHechos((prev) => prev.map((v, j) => (j === i ? valor : v)));
    if (valor === h.respuesta) sfxPlace(h.retro);
    else sfxNo(h.retro);
  };

  // ── debate (A7) ───────────────────────────────────────────────────────
  const [postura, setPostura] = useState<string | null>(null);
  const [argumento, setArgumento] = useState("");
  const [puntoValido, setPuntoValido] = useState<string | null>(null);
  const argumentoDone = postura !== null && cuentaPalabras(argumento) >= DEBATE.minimoPalabras;
  const debateDone = argumentoDone && puntoValido !== null;

  // ── reto evaluable (A2) ───────────────────────────────────────────────
  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── objetivos de la sesión ────────────────────────────────────────────
  const objetivos = [
    { txt: "Arma el guion con las 7 piezas en orden", done: guionDone },
    { txt: "Quita cada pieza y descubre qué se rompe", done: roturasDone },
    { txt: "Reparte el tiempo de los 2 escenarios", done: relojDone },
    { txt: "Comprueba qué pasa si el desarrollo se desborda", done: desbordeVisto },
    { txt: "Elige el apoyo correcto en los 5 momentos", done: apoyosDone },
    { txt: "Escribe los 5 términos del glosario", done: glosarioDone },
    { txt: "Completa el texto de las etapas (A6)", done: textoDone },
    { txt: "Diagnostica las 4 exposiciones de la clínica", done: clinicaDone },
    { txt: "Acierta los 5 hechos verdadero o falso", done: hechosDone },
    { txt: "Toma postura y sostén tu argumento", done: debateDone },
    { txt: "Aprueba el reto evaluable (70 %)", done: quizAprobado },
  ];

  const resetActual =
    modo === "guion"
      ? resetGuion
      : modo === "reloj"
        ? resetReloj
        : modo === "apoyos"
          ? resetApoyos
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
        @keyframes aexShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes aexPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        @keyframes aexBarrido { 0%{left:0;} 100%{left:100%;} }
        .aex-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 16px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .aex-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .aex-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .aex-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .aex-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .aex-icobtn:hover { background:rgba(255,255,255,0.12); }
        .aex-chip { cursor:grab; display:flex; align-items:flex-start; gap:10px; padding:11px 15px; border-radius:14px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:13px; font-weight:700; transition:all .14s;
          user-select:none; text-align:left; line-height:1.45; width:100%; }
        .aex-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); transform:translateY(-2px); }
        .aex-chip[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; transform:translateY(-3px) scale(1.02); }
        .aex-chip:active { cursor:grabbing; }
        .aex-mazo { display:grid; grid-template-columns:repeat(auto-fill, minmax(230px, 1fr)); gap:10px; align-items:stretch; }
        .aex-bin { border-radius:16px; border:1.5px solid ${T.line}; background:${T.glass}; padding:15px; transition:all .16s; }
        .aex-bin[data-shake="true"] { animation:aexShake .4s; border-color:${NO}; }
        .aex-row { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:15px 17px; transition:all .16s; }
        .aex-row[data-shake="true"] { animation:aexShake .4s; border-color:${NO}; }
        .aex-row[data-done="true"] { border-color:${OK}66; }
        .aex-slot { border-radius:12px; border:1.5px dashed ${T.lineStrong}; background:${T.inset}; min-height:54px; padding:9px 12px;
          display:flex; align-items:center; gap:10px; color:${T.text3}; font-size:12.5px; transition:all .16s; }
        .aex-slot[data-armed="true"] { border-color:${accent}; background:rgba(${color.rgba},0.1); cursor:pointer; }
        .aex-pieza { cursor:pointer; width:100%; text-align:left; border-radius:12px; border:1.5px solid ${OK}66; background:${OK}14;
          color:#fff; font-size:13px; font-weight:700; padding:10px 13px; line-height:1.45; transition:all .15s; animation:aexPop .25s ease; }
        .aex-pieza:hover { border-color:${OK}; background:${OK}22; }
        .aex-pieza[data-probada="true"] { border-style:dashed; }
        .aex-op { cursor:pointer; display:flex; align-items:flex-start; gap:11px; width:100%; text-align:left; border-radius:12px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13px; font-weight:600; padding:11px 14px;
          line-height:1.45; transition:all .14s; }
        .aex-op:hover:not(:disabled) { border-color:${T.lineStrong}; color:#fff; }
        .aex-op:disabled { cursor:default; }
        .aex-op[data-ok="true"] { border-color:${OK}; background:${OK}1c; color:#fff; }
        .aex-op[data-bad="true"] { border-color:${NO}; background:${NO}1c; color:#fff; }
        .aex-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .aex-btn:hover:not(:disabled) { border-color:${T.lineStrong}; }
        .aex-btn:disabled { opacity:.45; cursor:not-allowed; }
        .aex-prob { cursor:pointer; padding:8px 13px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass};
          color:${T.text2}; font-size:12.5px; font-weight:800; transition:all .14s; }
        .aex-prob:hover { border-color:${T.lineStrong}; color:#fff; }
        .aex-prob[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; }
        .aex-prob[data-done="true"] { color:${OK}; border-color:${OK}66; }
        .aex-vf { cursor:pointer; padding:8px 16px; border-radius:10px; border:1.5px solid ${T.line}; background:${T.glass};
          color:${T.text2}; font-size:12.5px; font-weight:800; transition:all .14s; }
        .aex-vf:hover:not(:disabled) { border-color:${T.lineStrong}; color:#fff; }
        .aex-vf:disabled { cursor:default; opacity:.85; }
        .aex-vf[data-on="true"] { border-color:${OK}; background:${OK}1f; color:#fff; }
        .aex-vf[data-bad="true"] { border-color:${NO}; background:${NO}1f; color:#fff; }
        .aex-ta { width:100%; min-height:140px; resize:vertical; border-radius:13px; border:1.5px solid ${T.lineStrong};
          background:${T.inset}; color:#fff; font-size:14.5px; line-height:1.7; padding:14px 16px; font-family:inherit; outline:none; transition:all .15s; }
        .aex-ta:focus { border-color:${accent}; box-shadow:0 0 0 3px rgba(${color.rgba},0.18); }
        .aex-ta::placeholder { color:rgba(255,255,255,0.28); }
        .aex-postura { cursor:pointer; text-align:left; width:100%; border:1.5px solid ${T.line}; background:${T.glass};
          border-radius:14px; padding:13px 15px; color:${T.text2}; font-size:13.5px; line-height:1.5; transition:all .15s; }
        .aex-postura:hover { border-color:${T.lineStrong}; color:#fff; }
        .aex-postura[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 18px -7px ${accent}; }
        .aex-range { width:100%; accent-color:${accent}; cursor:pointer; }
        .aex-pista { position:absolute; top:-6px; bottom:-6px; width:2px; background:#fff; box-shadow:0 0 12px #fff; }
        .aex-aguja { position:absolute; top:-8px; bottom:-8px; width:3px; background:${accent}; box-shadow:0 0 14px ${accent};
          animation:aexBarrido 6s linear 1; }
        .aex-divider { height:1px; background:${T.line}; margin:16px 0; }
        @media (max-width: 900px){ .aex-grid { grid-template-columns:minmax(0,1fr) !important; } }

        /* Cajón de teoría */
        .aex-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .aex-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .aex-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .aex-drawer[data-open="true"] { transform:translateX(0); }
        .aex-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .aex-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .aex-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .aex-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .aex-teoria-fab { position:fixed; right:20px; bottom:20px; z-index:58; cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.86); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .aex-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
        @media (max-width: 640px){ .aex-teoria-fab { right:12px; bottom:12px; padding:10px 13px; font-size:12px; } }

        /* Identidad del tablero */
        .aex-bin, .aex-row { --tono:200; position:relative;
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
        .aex-bin:nth-of-type(6n+1), .aex-row:nth-of-type(6n+1) { --tono:200; }
        .aex-bin:nth-of-type(6n+2), .aex-row:nth-of-type(6n+2) { --tono:272; }
        .aex-bin:nth-of-type(6n+3), .aex-row:nth-of-type(6n+3) { --tono:38; }
        .aex-bin:nth-of-type(6n+4), .aex-row:nth-of-type(6n+4) { --tono:150; }
        .aex-bin:nth-of-type(6n+5), .aex-row:nth-of-type(6n+5) { --tono:326; }
        .aex-bin:nth-of-type(6n+6), .aex-row:nth-of-type(6n+6) { --tono:16; }
        .aex-bin::before, .aex-row::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
          background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
        .aex-bin[data-done="true"], .aex-row[data-done="true"] {
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }
        .aex-chip { transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
        .aex-chip:hover { transform:translateY(-2px); }
        .aex-chip[data-sel="true"] { transform:translateY(-3px) scale(1.02); }
        .aex-pieza { transition:transform .14s, border-color .15s, background .15s; }
        .aex-pieza:hover { transform:translateY(-1px); }
        @media (prefers-reduced-motion: reduce){
          .aex-bin[data-shake="true"], .aex-row[data-shake="true"], .aex-aguja { animation:none; }
          .aex-chip, .aex-chip:hover, .aex-chip[data-sel="true"] { transform:none; transition:none; }
          .aex-pieza, .aex-pieza:hover { transform:none; }
        }
      `}</style>

      {/* ── Barra de modos y herramientas ───────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        {MODOS.map((m) => (
          <button key={m.id} className="aex-tab" data-on={modo === m.id} onClick={() => setModo(m.id)}>
            <i className={`fa-solid ${m.icono}`} />
            {m.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
        <button className="aex-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría de la práctica">
          <i className="fa-solid fa-book-open" />
        </button>
        <button className="aex-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
          <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
        </button>
        <button className="aex-icobtn" onClick={resetActual} title="Reiniciar este modo">
          <i className="fa-solid fa-rotate-left" />
        </button>
      </div>

      {/* ── Cajón de teoría ─────────────────────────────────────────────── */}
      <button className="aex-teoria-fab" onClick={() => setDrawer(true)}>
        <i className="fa-solid fa-book-open" />
        Teoría
      </button>
      <div className="aex-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="aex-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="aex-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="aex-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="aex-drawer-body">
          <FichaTeorica data={ANATOMIA_EXPOSICION_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>

      <div
        className="aex-grid"
        style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,28vw,400px)", gap: 22, alignItems: "start" }}
      >
        {/* ── Columna principal ─────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {modo === "guion" && (
            <GuionPanel
              accent={accent}
              guionPos={guionPos}
              piezasLibres={piezasLibres}
              selPieza={selPieza}
              shakeParte={shakeParte}
              probadas={probadas}
              piezaAbierta={piezaAbierta}
              onSelPieza={(id) => setSelPieza((s) => (s === id ? null : id))}
              onZona={() => {
                if (selPieza) intentarPieza(selPieza);
              }}
              onDropZona={(id) => intentarPieza(id)}
              onQuitar={quitarPieza}
              dragProps={dragProps}
              dropProps={dropProps}
            />
          )}

          {modo === "reloj" && (
            <RelojPanel
              accent={accent}
              rgba={color.rgba}
              escenario={escenario}
              escIdx={escIdx}
              reparto={reparto}
              suma={suma}
              sobra={sobra}
              palabras={palabrasCaben}
              valido={relojOk[escenario.id] === true}
              ensayo={ensayo}
              onEscenario={cambiarEscenario}
              onAjustar={ajustar}
              onEnsayar={() => setEnsayo(true)}
              onFinEnsayo={() => {
                setEnsayo(false);
                setPie({
                  ok: sobra <= 0,
                  txt:
                    sobra > 0
                      ? `Se acabó el tiempo en ${reloj(escenario.segundos)} y a tu exposición todavía le faltaban ${reloj(sobra)}. Lo que queda fuera es siempre lo último: el cierre y las preguntas.`
                      : `Ensayo terminado dentro de los ${reloj(escenario.segundos)}. Ese es el reparto que puedes sostener en el salón.`,
                });
              }}
            />
          )}

          {modo === "apoyos" && (
            <ApoyosPanel
              accent={accent}
              seleccion={apoyoSel}
              resueltos={apoyoOk}
              shake={shakeApoyo}
              onElegir={elegirApoyo}
            />
          )}

          {modo === "glosario" && (
            <div style={{ ...card, padding: "20px 22px" }}>
              <Eyebrow>
                <i className="fa-solid fa-spell-check" style={{ marginRight: 8, color: accent }} />
                Glosario de la progresión · LC-I-P08-A5
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
                  setPie({ ok: true, txt: "Los cinco términos, escritos de memoria. Cuatro de ellos son las partes que acabas de montar en la mesa; el quinto es lo que las sostiene en pantalla." });
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
              data={ANATOMIA_EXPOSICION_HUECOS}
              accent={accent}
              rgba={color.rgba}
              completado={textoDone}
              onCompletado={() => {
                setTextoDone(true);
                setPie({ ok: true, txt: "Texto completo. Fíjate en el orden del párrafo: la planeación ocurre antes de exponer; la introducción, el desarrollo y la conclusión, durante." });
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
              {pie ? pie.txt : "Aquí aparece la explicación de cada movimiento: por qué esa pieza va en ese lugar, qué se rompe sin ella y qué pasa cuando el reloj no alcanza."}
            </span>
          </div>
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
              {modo === "guion" && (
                <>
                  Una exposición no es una lista de temas, es una <strong style={{ color: T.text }}>secuencia</strong>: cada pieza
                  prepara a la siguiente. Colócalas en el orden en que tendrían que ocurrir y después quítalas una por una para
                  ver de qué se hacía cargo cada una.
                </>
              )}
              {modo === "reloj" && (
                <>
                  El tiempo es lo único que no se puede estirar. Mueve los deslizadores hasta que la suma dé exactamente{" "}
                  <strong style={{ color: T.text }}>{reloj(escenario.segundos)}</strong> y cada parte quede dentro de su banda; si
                  subes el desarrollo por encima de la suya, verás a quién se lo quita.
                </>
              )}
              {modo === "apoyos" && (
                <>
                  El apoyo visual <strong style={{ color: T.text }}>refuerza</strong> el mensaje oral; no lo repite ni lo
                  sustituye. Pregúntate qué forma tiene lo que vas a decir: ¿una secuencia, una comparación, una relación entre
                  partes?
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

          {/* Consigna verbatim de A3 */}
          <div style={{ ...card, padding: "18px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-pen-nib" style={{ marginRight: 8, color: accent }} />
              La tarea que viene · A3
            </Eyebrow>
            <p style={{ margin: "0 0 12px", fontSize: 12.5, color: T.text2, lineHeight: 1.6 }}>{CONSIGNA_A3.prompt}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {CONSIGNA_A3.pistas.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 9, fontSize: 12, color: T.text3, lineHeight: 1.45 }}>
                  <i className="fa-solid fa-angle-right" style={{ color: accent, marginTop: 3, fontSize: 10 }} />
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Preguntas de comprensión de la lectura A1 (verbatim) */}
          <div style={{ ...card, padding: "18px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-book-open-reader" style={{ marginRight: 8, color: accent }} />
              Lectura A1 · para pensar
            </Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
              <strong style={{ color: T.text }}>¿Sabías?</strong> {DATO_FIL}
            </span>
          </div>
        </div>
      </div>

      <ClinicaCard accent={accent} respuestas={clinica} onResponder={responderClinica} />

      <HechosCard accent={accent} respuestas={hechos} onResponder={responderHecho} />

      <DebateCard
        accent={accent}
        rgba={color.rgba}
        postura={postura}
        argumento={argumento}
        puntoValido={puntoValido}
        onPostura={(id) => {
          setPostura(id);
          setPuntoValido(null);
        }}
        onArgumento={setArgumento}
        onPuntoValido={(txt) => {
          setPuntoValido(txt);
          setPie({ ok: true, txt: "Reconocer un punto válido de la postura contraria no es perder el debate: es la parte de A7 que pide proponer en qué situaciones conviene cada forma." });
        }}
      />

      <RetoQuizCard
        quiz={RETO_QUIZ}
        accent={accent}
        rgba={color.rgba}
        aprobado={quizAprobado}
        onAprobado={() => setQuizAprobado(true)}
        playSfx={sonido ? (ok) => (ok ? sfxOk() : sfxNo()) : undefined}
        mensajeAprobado="Conoces la anatomía de una exposición: sus fases, sus partes y lo que sostiene cada una."
      />

      {/* Nota al pie: qué es verbatim y qué es de este laboratorio */}
      <p style={{ margin: "20px 2px 0", fontSize: 11.5, lineHeight: 1.6, color: T.text3 }}>
        <i className="fa-solid fa-quote-right" style={{ marginRight: 7, opacity: 0.7 }} />
        <strong style={{ color: T.text2 }}>Verbatim de la progresión LC-I-P08:</strong> la lectura, su callout «¿Sabías?» y sus
        preguntas de comprensión (A1), el reto evaluable (A2), la consigna y las pistas de la mini-exposición de tres minutos
        (A3), los hechos verdadero/falso (A4), el glosario (A5, los mismos pares que A9 pide relacionar), el texto con huecos
        (A6) y el debate con sus posturas y argumentos guía (A7).{" "}
        <strong style={{ color: T.text2 }}>Escrito para este laboratorio (ilustrativo):</strong> las siete piezas del guion y su
        exposición de demostración sobre el cuidado del agua en la colonia —el tema que el Producto Integrador de la materia
        propone como ejemplo—, las bandas de tiempo recomendadas, el escenario de diez minutos, las cinco decisiones de apoyo
        visual y los cuatro casos de la clínica. Las personas y los salones son ficticios. El ritmo de{" "}
        {PALABRAS_POR_MINUTO} palabras por minuto es una estimación para calcular cuánto texto cabe en un tiempo: al hablar en
        público el rango cómodo va de 120 a 150, y no es un dato de la progresión. En el debate no hay respuesta correcta: el
        laboratorio no califica tu postura, solo te pide sostenerla y reconocer un punto válido de la contraria.
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 1 — Mesa de montaje
 * ═══════════════════════════════════════════════════════════════════════════ */
type DragFactory = (id: string) => {
  draggable: boolean;
  onDragStart: (e: React.DragEvent) => void;
};
type DropFactory = (onDrop: (id: string) => void) => {
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  role: "button";
  tabIndex: number;
  onKeyDown: (e: React.KeyboardEvent) => void;
};

function GuionPanel({
  accent,
  guionPos,
  piezasLibres,
  selPieza,
  shakeParte,
  probadas,
  piezaAbierta,
  onSelPieza,
  onZona,
  onDropZona,
  onQuitar,
  dragProps,
  dropProps,
}: {
  accent: string;
  guionPos: number;
  piezasLibres: PiezaGuion[];
  selPieza: string | null;
  shakeParte: Parte | null;
  probadas: Record<string, boolean>;
  piezaAbierta: string | null;
  onSelPieza: (id: string) => void;
  onZona: () => void;
  onDropZona: (id: string) => void;
  onQuitar: (id: string) => void;
  dragProps: DragFactory;
  dropProps: DropFactory;
}) {
  const completo = guionPos >= PIEZAS.length;
  const siguiente = PIEZAS[guionPos];
  const abierta = PIEZAS.find((p) => p.id === piezaAbierta);

  return (
    <>
      <div style={{ ...card, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
          <Eyebrow>Piezas sueltas del guion · colócalas en el orden en que ocurren</Eyebrow>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: completo ? OK : T.text3, ...NUM }}>
            {guionPos}/{PIEZAS.length}
          </span>
        </div>
        <p style={{ margin: "0 0 14px", fontSize: 12.5, color: T.text3, lineHeight: 1.5 }}>
          Exposición de demostración: <strong style={{ color: T.text2 }}>«El cuidado del agua en mi colonia»</strong>, tres
          minutos ante el grupo.
        </p>
        {completo ? (
          <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
            <i className="fa-solid fa-circle-check" /> Guion completo. Ahora toca cada pieza colocada para quitarla y ver qué se
            rompe sin ella ({Object.keys(probadas).length}/{PIEZAS.length} probadas).
          </div>
        ) : (
          <div className="aex-mazo">
            {piezasLibres.map((p) => (
              <button
                key={p.id}
                className="aex-chip"
                data-sel={selPieza === p.id}
                onClick={() => onSelPieza(p.id)}
                {...dragProps(p.id)}
              >
                <i className={`fa-solid ${p.icono}`} style={{ color: accent, marginTop: 3, fontSize: 12 }} />
                <span>
                  <span style={{ display: "block", fontWeight: 800 }}>{p.nombre}</span>
                  <span style={{ display: "block", fontWeight: 500, color: T.text2, fontSize: 12.5, marginTop: 3 }}>{p.funcion}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 12 }}>
        {PARTES_ORDEN.map((parte) => {
          const info = PARTE_INFO[parte];
          const dentro = PIEZAS.filter((p) => p.parte === parte && p.orden < guionPos);
          const faltan = PIEZAS.filter((p) => p.parte === parte && p.orden >= guionPos);
          const armada = faltan.length === 0;
          const esperaAqui = !completo && siguiente?.parte === parte;
          return (
            <div
              key={parte}
              className="aex-bin"
              data-shake={shakeParte === parte}
              data-done={armada}
              onClick={() => esperaAqui && onZona()}
              style={{ position: "relative", isolation: "isolate" }}
            {...dropProps((id) => onDropZona(id))}
            >
            {/* La ilustración del concepto llenando la caja vacía. */}
            <FondoTermino termino={info.titulo} />
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
                <VinetaTermino termino={info.titulo} color={T.text2} icono={info.icono} tam={29} radio={8} />
                <span style={{ fontSize: 13.5, fontWeight: 800, color: "#fff" }}>{info.titulo}</span>
              </div>
              <div style={{ fontSize: 11, color: T.text3, marginBottom: 12, lineHeight: 1.45 }}>{info.subtitulo}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {dentro.map((p) => (
                  <button
                    key={p.id}
                    className="aex-pieza"
                    data-probada={probadas[p.id] === true}
                    title="Quitar del guion y ver qué se rompe"
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuitar(p.id);
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <i className={`fa-solid ${probadas[p.id] ? "fa-link-slash" : p.icono}`} style={{ color: OK, fontSize: 11 }} />
                      {p.nombre}
                    </span>
                    <span style={{ display: "block", fontWeight: 500, color: T.text2, fontSize: 12, marginTop: 4, fontStyle: "italic" }}>
                      {p.ejemplo}
                    </span>
                  </button>
                ))}
                {faltan.map((p) => (
                  <div key={p.id} className="aex-slot" data-armed={esperaAqui && siguiente?.id === p.id}>
                    <i className="fa-solid fa-circle-notch" style={{ fontSize: 11 }} />
                    {esperaAqui && siguiente?.id === p.id ? "Aquí va la siguiente pieza" : "Pieza pendiente"}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {abierta && (
        <div
          style={{
            borderRadius: 16,
            border: `1px solid ${NO}55`,
            background: `${NO}10`,
            padding: "16px 18px",
            display: "flex",
            gap: 13,
            alignItems: "flex-start",
          }}
        >
          <i className="fa-solid fa-link-slash" style={{ color: NO, fontSize: 17, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: "#fff", marginBottom: 5 }}>
              Una exposición sin «{abierta.nombre}»
            </div>
            <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.6 }}>{abierta.falta}</div>
          </div>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 2 — El reloj
 * ═══════════════════════════════════════════════════════════════════════════ */
function RelojPanel({
  accent,
  rgba,
  escenario,
  escIdx,
  reparto,
  suma,
  sobra,
  palabras,
  valido,
  ensayo,
  onEscenario,
  onAjustar,
  onEnsayar,
  onFinEnsayo,
}: {
  accent: string;
  rgba: string;
  escenario: EscenarioTiempo;
  escIdx: number;
  reparto: Reparto;
  suma: number;
  sobra: number;
  palabras: number;
  valido: boolean;
  ensayo: boolean;
  onEscenario: (i: number) => void;
  onAjustar: (id: BloqueId, v: number) => void;
  onEnsayar: () => void;
  onFinEnsayo: () => void;
}) {
  const total = escenario.segundos;
  const escala = Math.max(suma, total);
  const colores: Record<BloqueId, string> = {
    apertura: "#5BC8FF",
    desarrollo: "#A78BFA",
    cierre: "#34D399",
    preguntas: "#FFC75A",
  };

  return (
    <>
      <div style={{ ...card, padding: "18px 22px" }}>
        <Eyebrow>Elige la duración y reparte los segundos</Eyebrow>
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginBottom: 14 }}>
          {ESCENARIOS_TIEMPO.map((e, i) => (
            <button key={e.id} className="aex-prob" data-on={escIdx === i} onClick={() => onEscenario(i)}>
              <i className="fa-solid fa-stopwatch" style={{ marginRight: 7, fontSize: 11 }} />
              {e.nombre}
            </button>
          ))}
        </div>
        <p style={{ margin: "0 0 16px", fontSize: 12.5, color: T.text3, lineHeight: 1.5 }}>{escenario.nota}</p>

        {/* Línea de tiempo */}
        <div style={{ position: "relative", marginBottom: 10 }}>
          <div style={{ display: "flex", height: 42, borderRadius: 11, overflow: "hidden", border: `1px solid ${T.line}`, background: T.inset }}>
            {BLOQUES.map((b) => {
              const v = reparto[b.id];
              const pct = escala > 0 ? (v / escala) * 100 : 0;
              return (
                <div
                  key={b.id}
                  title={`${b.nombre}: ${reloj(v)}`}
                  style={{
                    width: `${pct}%`,
                    background: `${colores[b.id]}44`,
                    borderRight: `1px solid ${colores[b.id]}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#fff",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    transition: "width .18s",
                  }}
                >
                  {pct > 11 ? reloj(v) : ""}
                </div>
              );
            })}
          </div>
          {/* Dónde termina el tiempo permitido */}
          {escala > total && (
            <div className="aex-pista" style={{ left: `${(total / escala) * 100}%` }} title={`Aquí se acaba el tiempo: ${reloj(total)}`} />
          )}
          {ensayo && <div className="aex-aguja" onAnimationEnd={onFinEnsayo} />}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.text3, ...NUM, marginBottom: 6 }}>
          <span>0:00</span>
          {escala > total && (
            <span style={{ color: "#fff", fontWeight: 800 }}>
              <i className="fa-solid fa-scissors" style={{ marginRight: 6 }} />
              aquí se acaba tu tiempo: {reloj(total)}
            </span>
          )}
          <span>{reloj(escala)}</span>
        </div>

        {/* Deslizadores */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
          {BLOQUES.map((b) => {
            const v = reparto[b.id];
            const lo = segMin(b, total);
            const hi = segMax(b, total);
            const dentro = v >= lo && v <= hi;
            return (
              <div key={b.id}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 5, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: dentro ? "#fff" : T.text2, display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <i className={`fa-solid ${b.icono}`} style={{ color: colores[b.id], fontSize: 12 }} />
                    {b.nombre}
                  </span>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: dentro ? OK : "#FF8A3C", ...NUM }}>
                    {reloj(v)}
                    <span style={{ color: T.text3, fontWeight: 600 }}>
                      {" "}
                      · recomendado {reloj(lo)}–{reloj(hi)}
                    </span>
                  </span>
                </div>
                <input
                  className="aex-range"
                  type="range"
                  min={0}
                  max={total}
                  step={escenario.paso}
                  value={v}
                  aria-label={`${b.nombre} (segundos)`}
                  onChange={(e) => onAjustar(b.id, Number(e.target.value))}
                />
                <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.45, marginTop: 2 }}>{b.porque}</div>
              </div>
            );
          })}
        </div>

        <div className="aex-divider" />

        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              borderRadius: 12,
              padding: "10px 15px",
              border: `1px solid ${sobra === 0 ? `${OK}66` : `${NO}66`}`,
              background: sobra === 0 ? `${OK}14` : `${NO}12`,
              fontSize: 13,
              fontWeight: 800,
              color: sobra === 0 ? OK : NO,
              ...NUM,
            }}
          >
            <i className={`fa-solid ${sobra === 0 ? "fa-circle-check" : "fa-triangle-exclamation"}`} />
            {sobra === 0
              ? `Cabe exacto en ${reloj(total)}`
              : sobra > 0
                ? `Te pasas por ${reloj(sobra)}`
                : `Te sobran ${reloj(-sobra)} sin repartir`}
          </div>
          <div style={{ fontSize: 12.5, color: T.text2, ...NUM }}>
            Hablando caben ≈ <strong style={{ color: T.text }}>{palabras}</strong> palabras
          </div>
          <div style={{ flex: 1 }} />
          <button className="aex-btn" onClick={onEnsayar} disabled={ensayo}>
            <i className="fa-solid fa-play" />
            {ensayo ? "Ensayando…" : "Ensayar el reparto"}
          </button>
        </div>

        {valido && (
          <div style={{ marginTop: 13, fontSize: 13, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
            <i className="fa-solid fa-circle-check" /> Reparto viable para {escenario.nombre.toLowerCase()}.
          </div>
        )}
      </div>

      <div
        style={{
          borderRadius: 16,
          border: `1px solid rgba(${rgba},0.28)`,
          background: `rgba(${rgba},0.07)`,
          padding: "15px 18px",
          fontSize: 12.5,
          color: T.text2,
          lineHeight: 1.6,
          display: "flex",
          gap: 12,
        }}
      >
        <i className="fa-solid fa-scale-balanced" style={{ color: accent, fontSize: 15, marginTop: 2 }} />
        <span>
          Las bandas recomendadas son un criterio de este laboratorio, no un dato de la progresión: dejan al desarrollo como
          parte central sin que la conclusión —que la lectura A1 considera igual de obligatoria— se quede sin tiempo. El cálculo
          de palabras usa {PALABRAS_POR_MINUTO} por minuto, un ritmo de referencia para hablar en público.
        </span>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 3 — ¿Qué apoyo para este momento?
 * ═══════════════════════════════════════════════════════════════════════════ */
function ApoyosPanel({
  accent,
  seleccion,
  resueltos,
  shake,
  onElegir,
}: {
  accent: string;
  seleccion: Record<string, number[]>;
  resueltos: Record<string, boolean>;
  shake: string | null;
  onElegir: (casoId: string, i: number) => void;
}) {
  const hechos = Object.keys(resueltos).length;
  return (
    <>
      <div style={{ ...card, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
          <Eyebrow>Elige el apoyo que sirve en cada momento (y lee por qué los otros no)</Eyebrow>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: hechos >= APOYOS.length ? OK : T.text3, ...NUM }}>
            {hechos}/{APOYOS.length}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 12.5, color: T.text3, lineHeight: 1.55 }}>
          Sigues con la exposición sobre el agua. En cada momento hay tres apoyos posibles y sólo uno hace el trabajo que ese
          momento necesita.
        </p>
      </div>

      {APOYOS.map((caso) => {
        const probadas = seleccion[caso.id] ?? [];
        const listo = resueltos[caso.id] === true;
        return (
          <div key={caso.id} className="aex-row" data-shake={shake === caso.id} data-done={listo}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <i className={`fa-solid ${caso.icono}`} style={{ color: accent }} />
              <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{caso.momento}</span>
              {listo && <i className="fa-solid fa-circle-check" style={{ color: OK, marginLeft: "auto" }} />}
            </div>
            <div style={{ fontSize: 12.5, color: T.text3, lineHeight: 1.5, marginBottom: 12 }}>{caso.detalle}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {caso.opciones.map((op, i) => {
                const esta = probadas.includes(i);
                const buena = i === caso.correcta;
                return (
                  <button
                    key={i}
                    className="aex-op"
                    disabled={listo && !buena}
                    data-ok={listo && buena}
                    data-bad={esta && !buena}
                    onClick={() => onElegir(caso.id, i)}
                  >
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
                        border: `1px solid ${T.line}`,
                      }}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span style={{ flex: 1 }}>{op.txt}</span>
                  </button>
                );
              })}
            </div>
            {probadas.map((i) => {
              const op = caso.opciones[i];
              if (!op) return null;
              const buena = i === caso.correcta;
              return (
                <div
                  key={i}
                  style={{
                    marginTop: 10,
                    fontSize: 12.5,
                    color: T.text2,
                    lineHeight: 1.55,
                    borderRadius: 10,
                    border: `1px solid ${buena ? `${OK}44` : T.line}`,
                    background: buena ? `${OK}0f` : T.inset,
                    padding: "9px 13px",
                  }}
                >
                  <i
                    className={`fa-solid ${buena ? "fa-circle-check" : "fa-circle-xmark"}`}
                    style={{ marginRight: 8, color: buena ? OK : accent }}
                  />
                  <strong style={{ color: T.text }}>{String.fromCharCode(65 + i)}.</strong> {op.porque}
                </div>
              );
            })}
          </div>
        );
      })}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Clínica de exposiciones — diagnostica lo que le pasó a cada una
 * ═══════════════════════════════════════════════════════════════════════════ */
function ClinicaCard({
  accent,
  respuestas,
  onResponder,
}: {
  accent: string;
  respuestas: (number | null)[];
  onResponder: (i: number, op: number) => void;
}) {
  const aciertos = respuestas.filter((v, i) => v !== null && v === CLINICA[i]!.correcta).length;
  return (
    <div style={{ ...card, padding: "20px 24px 24px", marginTop: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-stethoscope" style={{ marginRight: 8, color: accent }} />
          Clínica de exposiciones · ¿qué le pasó a cada una?
        </Eyebrow>
        <span style={{ fontSize: 12.5, fontWeight: 800, color: aciertos >= CLINICA.length ? OK : T.text3, ...NUM }}>
          {aciertos}/{CLINICA.length}
        </span>
      </div>
      <p style={{ margin: "0 0 18px", fontSize: 12.5, color: T.text3, lineHeight: 1.55 }}>
        Cuatro exposiciones de un salón de bachillerato, contadas tal como se vieron. Ninguna es un desastre: a cada una le
        falló una sola cosa. Encuéntrala.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {CLINICA.map((caso, i) => {
          const elegida = respuestas[i];
          const listo = elegida === caso.correcta;
          return (
            <div key={caso.id} style={{ borderRadius: 14, border: `1px solid ${listo ? `${OK}55` : T.line}`, background: T.glass, padding: "14px 16px" }}>
              <div style={{ fontSize: 13.5, color: T.text, lineHeight: 1.6, marginBottom: 12, fontStyle: "italic" }}>
                <i className="fa-solid fa-quote-left" style={{ fontSize: 10, marginRight: 8, color: accent }} />
                {caso.relato}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 8 }}>
                {caso.opciones.map((op, j) => (
                  <button
                    key={j}
                    className="aex-op aex-clinica"
                    disabled={listo && j !== caso.correcta}
                    data-ok={listo && j === caso.correcta}
                    data-bad={elegida === j && j !== caso.correcta}
                    onClick={() => onResponder(i, j)}
                  >
                    <span style={{ flex: 1 }}>{op}</span>
                  </button>
                ))}
              </div>
              {elegida !== null && elegida !== undefined && (
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 12.5,
                    color: T.text2,
                    lineHeight: 1.55,
                    borderRadius: 10,
                    border: `1px solid ${T.line}`,
                    background: T.inset,
                    padding: "9px 13px",
                  }}
                >
                  <i className={`fa-solid ${listo ? "fa-circle-check" : "fa-circle-info"}`} style={{ marginRight: 8, color: listo ? OK : accent }} />
                  {listo ? caso.retro : "Ese no es el problema principal: vuelve a leer el relato y fíjate en qué parte de la exposición se quedó fuera."}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Hechos verdadero / falso — A4 verbatim
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
  const aciertos = respuestas.filter((v, i) => v !== null && v === HECHOS[i]!.respuesta).length;
  return (
    <div style={{ ...card, padding: "20px 24px 24px", marginTop: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-scale-balanced" style={{ marginRight: 8, color: accent }} />
          Hechos · verdadero o falso (A4, verbatim)
        </Eyebrow>
        <span style={{ fontSize: 12.5, fontWeight: 800, color: aciertos >= HECHOS.length ? OK : T.text3, ...NUM }}>
          {aciertos}/{HECHOS.length}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {HECHOS.map((h, i) => {
          const dada = respuestas[i];
          const listo = dada === h.respuesta;
          return (
            <div key={i} style={{ borderRadius: 13, border: `1px solid ${listo ? `${OK}55` : T.line}`, background: T.glass, padding: "13px 16px" }}>
              <div style={{ fontSize: 13.5, color: T.text, lineHeight: 1.5, marginBottom: 10 }}>{h.enunciado}</div>
              <div style={{ display: "flex", gap: 9, flexWrap: "wrap", alignItems: "center" }}>
                {[true, false].map((v) => (
                  <button
                    key={String(v)}
                    className="aex-vf"
                    disabled={listo}
                    data-on={listo && v === h.respuesta}
                    data-bad={dada === v && v !== h.respuesta}
                    onClick={() => onResponder(i, v)}
                  >
                    {v ? "Verdadero" : "Falso"}
                  </button>
                ))}
                {dada !== null && dada !== undefined && (
                  <span style={{ fontSize: 12.5, color: listo ? T.text2 : NO, lineHeight: 1.5, flex: 1, minWidth: 200 }}>
                    {listo ? h.retro : "Todavía no: vuelve a leer el enunciado con calma."}
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

/* ═══════════════════════════════════════════════════════════════════════════
 * Mesa de debate — A7 verbatim
 * ═══════════════════════════════════════════════════════════════════════════ */
function DebateCard({
  accent,
  rgba,
  postura,
  argumento,
  puntoValido,
  onPostura,
  onArgumento,
  onPuntoValido,
}: {
  accent: string;
  rgba: string;
  postura: string | null;
  argumento: string;
  puntoValido: string | null;
  onPostura: (id: string) => void;
  onArgumento: (v: string) => void;
  onPuntoValido: (txt: string) => void;
}) {
  const palabras = cuentaPalabras(argumento);
  const otra = DEBATE.posturas.find((p) => p.id !== postura);

  return (
    <div style={{ ...card, padding: "20px 24px 24px", marginTop: 22 }}>
      <Eyebrow>
        <i className="fa-solid fa-comments" style={{ marginRight: 8, color: accent }} />
        Mesa de debate · A7 (verbatim)
      </Eyebrow>
      <div style={{ fontSize: 14.5, fontWeight: 800, color: T.text, marginBottom: 6 }}>{DEBATE.tema}</div>
      <div style={{ fontSize: 12.5, color: T.text3, lineHeight: 1.55, marginBottom: 16 }}>
        {DEBATE.reglas.join(" · ")} Aquí no hay respuesta correcta: lo que se evalúa es que sostengas tu postura y reconozcas
        algo válido en la contraria.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10, marginBottom: 16 }}>
        {DEBATE.posturas.map((p) => (
          <button key={p.id} className="aex-postura" data-on={postura === p.id} onClick={() => onPostura(p.id)}>
            <span style={{ display: "block", fontWeight: 800, marginBottom: 6 }}>{p.texto}</span>
            {p.guia.map((g, i) => (
              <span key={i} style={{ display: "block", fontSize: 12, color: T.text3, lineHeight: 1.45 }}>
                <i className="fa-solid fa-angle-right" style={{ fontSize: 9, marginRight: 6 }} />
                {g}
              </span>
            ))}
          </button>
        ))}
      </div>

      <textarea
        className="aex-ta"
        value={argumento}
        placeholder={`Escribe tus argumentos (mínimo ${DEBATE.minimoPalabras} palabras) y di en qué situaciones conviene cada forma.`}
        aria-label="Tu argumento"
        onChange={(e) => onArgumento(e.target.value)}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12.5, color: palabras >= DEBATE.minimoPalabras ? OK : T.text3, fontWeight: 800, ...NUM }}>
          {palabras} / {DEBATE.minimoPalabras} palabras
        </span>
        {postura === null && <span style={{ fontSize: 12.5, color: T.text3 }}>Elige primero una postura.</span>}
      </div>

      {otra && (
        <div style={{ marginTop: 18, borderRadius: 14, border: `1px solid rgba(${rgba},0.3)`, background: `rgba(${rgba},0.07)`, padding: "14px 16px" }}>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: T.text2, marginBottom: 10 }}>
            Ahora reconoce un punto válido de la postura contraria:
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {otra.guia.map((g) => (
              <button
                key={g}
                className="aex-op aex-punto"
                data-ok={puntoValido === g}
                onClick={() => onPuntoValido(g)}
              >
                <span style={{ flex: 1 }}>{g}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
