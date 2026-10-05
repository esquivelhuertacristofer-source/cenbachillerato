"use client";

/**
 * Laboratorio — Advice in English: should, shouldn't and imperatives
 * Práctica experimental para IN-IV-P04-A1 (Inglés IV — A2+).
 *
 * Modo principal: simulador «Helpline». Cuatro amigos ficticios piden consejo; el
 * alumno arma la respuesta (saludo + forma + acción) y ve cómo cambia su ánimo:
 * una forma incorrecta («should to») los confunde, un consejo que perjudica los
 * empeora y «must» suena a orden. Los modos de arrastre se conservan, en <Mesa>.
 *
 * Interactividad máxima. Cuatro modos: los tres de arrastrar/clasificar (forma · uso · estructura) y,
 * al final, uno que se escribe («Completa el texto», verbatim de la progresión):
 *  1. «Should, shouldn't or imperative?» — clasifica nueve oraciones de consejo
 *     en tres columnas según su forma (should / shouldn't / imperative). La FORMA.
 *  2. «Complete the advice» — arrastra la forma correcta a cada hueco de los
 *     ejemplos (should, shouldn't, Don't, should) evitando los distractores
 *     (should to, must, shoulds, musn't). El USO en contexto.
 *  3. «Match the structure» — empareja cada estructura del glosario A5 con su
 *     definición. Las ESTRUCTURAS para dar y pedir consejos con empatía.
 *  + Cuestionario de comprensión (V/F verbatim de A4, ampliado con A2).
 *
 * DOM puro (sin three.js): ligero, accesible (ratón, teclado y táctil mediante
 * clic-para-seleccionar / clic-para-colocar). Contenido VERBATIM de IN-IV·P04.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { CONSEJOS_INGLES_HUECOS } from "./consejos-ingles-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { LabShell, Bloque, Mesa, Dato, BotonHerramienta } from "./_shell";
import {
  ADOLESCENTES,
  FRASES,
  OPENERS,
  ANIMO_INICIO,
  ANIMO_META,
  armarTexto,
  evaluar,
  aplicarAnimo,
  caraDe,
  type FraseId,
  type OpenerId,
  type Resultado,
} from "./consejos-ingles-sim";
import { CONSEJOS_INGLES_FICHA } from "./consejos-ingles-ficha";
import {
  ORACIONES,
  FORMA_INFO,
  HUECOS,
  DISTRACTORES_HUECO,
  PARES,
  QUIZ,
  DATO_CONSEJOS,
  type Forma,
} from "./consejos-ingles-data";

const NO = "#FF5E5E";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { FondoTermino, VinetaTermino } from "./_vineta";
const RETO_KEY = "cen-consejos-ingles-reto";

type Modo = "helpline" | "clasificar" | "completar" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "helpline", label: "Helpline", icono: "fa-comments" },
  { id: "clasificar", label: "Should, shouldn't or imperative?", icono: "fa-layer-group" },
  { id: "completar", label: "Complete the advice", icono: "fa-pen-fancy" },
  { id: "glosario", label: "Match the structure", icono: "fa-book-open" },
  { id: "texto", label: "Complete the text", icono: "fa-pen-to-square" },
];

/** Fichas del modo «completar»: formas correctas + distractores. */
const FICHAS_HUECO: { id: string; label: string }[] = [
  ...HUECOS.map((h) => ({ id: h.id, label: h.resp })),
  ...DISTRACTORES_HUECO.map((d, i) => ({ id: `xd-${i}`, label: d })),
];

export function LabConsejosIngles({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("helpline");

  // ── sonido ────────────────────────────────────────────────────────────
  const partida = usePartida();
  const [sonido, setSonido] = useState(false);
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
  const sfxSim = (ok: boolean) => sonido && (ok ? audioRef.current?.blip() : audioRef.current?.incorrecto());
  const sfxPlace = () => {
    partida.acierto();
    return sonido && audioRef.current?.blip();
  };

  // ── modo Helpline (simulador) ──────────────────────────────────────────
  const [animos, setAnimos] = useState<Record<string, number>>(() => Object.fromEntries(ADOLESCENTES.map((a) => [a.id, ANIMO_INICIO])));
  const [resueltos, setResueltos] = useState<string[]>([]);
  const [empaticaOk, setEmpaticaOk] = useState(false);
  const [simKey, setSimKey] = useState(0);
  const enviar = (tid: string, r: Resultado) => {
    sfxSim(r.veredicto === "bien");
    const nuevo = aplicarAnimo(animos[tid] ?? ANIMO_INICIO, r.delta);
    setAnimos((a) => ({ ...a, [tid]: nuevo }));
    if (nuevo >= ANIMO_META) setResueltos((v) => (v.includes(tid) ? v : [...v, tid]));
    if (r.veredicto === "bien" && r.empatica) setEmpaticaOk(true);
  };
  const resetSim = () => {
    setAnimos(Object.fromEntries(ADOLESCENTES.map((a) => [a.id, ANIMO_INICIO])));
    setResueltos([]);
    setEmpaticaOk(false);
    setSimKey((n) => n + 1);
  };
  const simDone = resueltos.length >= ADOLESCENTES.length;

  // ── modo Should, shouldn't or imperative? (clasifica por forma) ────────
  const [ubicado, setUbicado] = useState<Record<string, Forma>>({});
  const [selOracion, setSelOracion] = useState<string | null>(null);
  const [shakeBin, setShakeBin] = useState<Forma | null>(null);
  const oracionesLibres = ORACIONES.filter((o) => !ubicado[o.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarClasificar = (oracionId: string, bin: Forma) => {
    if (ubicado[oracionId]) return;
    const o = ORACIONES.find((x) => x.id === oracionId);
    if (o && o.forma === bin) {
      setUbicado((e) => ({ ...e, [oracionId]: bin }));
      setSelOracion(null);
      sfxPlace();
      if (Object.keys(ubicado).length + 1 >= ORACIONES.length) {
        sfxOk();
        persistMejor(true, completarDone, glosarioDone);
      }
    } else {
      setShakeBin(bin);
      sfxNo();
      window.setTimeout(() => setShakeBin(null), 420);
    }
  };
  const resetClasificar = () => {
    setUbicado({});
    setSelOracion(null);
  };

  // ── modo Complete the advice (arrastra al hueco) ───────────────────────
  const [completado, setCompletado] = useState<Record<string, boolean>>({});
  const [selFicha, setSelFicha] = useState<string | null>(null);
  const [shakeHueco, setShakeHueco] = useState<string | null>(null);
  const fichasLibres = FICHAS_HUECO.filter((f) => !completado[f.id]).slice().sort((a, b) => a.label.localeCompare(b.label, "es"));

  const intentarCompletar = (chipId: string, rowId: string) => {
    if (completado[rowId]) return;
    if (chipId === rowId) {
      setCompletado((e) => ({ ...e, [rowId]: true }));
      setSelFicha(null);
      sfxPlace();
      if (Object.keys(completado).length + 1 >= HUECOS.length) {
        sfxOk();
        persistMejor(clasificarDone, true, glosarioDone);
      }
    } else {
      setShakeHueco(rowId);
      sfxNo();
      window.setTimeout(() => setShakeHueco(null), 420);
    }
  };
  const resetCompletar = () => {
    setCompletado({});
    setSelFicha(null);
  };

  // ── modo Match the structure (empareja término → definición) ───────────
  const [empGlos, setEmpGlos] = useState<Record<string, boolean>>({});
  const [selGlos, setSelGlos] = useState<string | null>(null);
  const [shakeGlos, setShakeGlos] = useState<string | null>(null);
  const glosLibres = PARES.filter((g) => !empGlos[g.id]).slice().sort((a, b) => a.termino.localeCompare(b.termino, "es"));

  const intentarGlos = (chipId: string, rowId: string) => {
    if (empGlos[rowId]) return;
    if (chipId === rowId) {
      setEmpGlos((e) => ({ ...e, [rowId]: true }));
      setSelGlos(null);
      sfxPlace();
      if (Object.keys(empGlos).length + 1 >= PARES.length) {
        sfxOk();
        persistMejor(clasificarDone, completarDone, true);
      }
    } else {
      setShakeGlos(rowId);
      sfxNo();
      window.setTimeout(() => setShakeGlos(null), 420);
    }
  };
  const resetGlosario = () => {
    setEmpGlos({});
    setSelGlos(null);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso / estrellas ──────────────────────────────────────────────
  const clasificarDone = Object.keys(ubicado).length >= ORACIONES.length;
  const completarDone = Object.keys(completado).length >= HUECOS.length;
  const glosarioDone = Object.keys(empGlos).length >= PARES.length;
  const modosHechos = (clasificarDone ? 1 : 0) + (completarDone ? 1 : 0) + (glosarioDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los 3 modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 4);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);

  const persistMejor = (a: boolean, b: boolean, c: boolean) => {
    const est = (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0);
    registraEstrellas(est);
  };

  const objetivos = [
    { txt: "Ayuda a los 4 amigos: lleva el ánimo de cada uno a 80 o más", done: simDone },
    { txt: "Da un buen consejo con una forma empática (Why don't you, Have you thought about o If I were you)", done: empaticaOk },
    { txt: "Clasifica las 9 oraciones por su forma (should / shouldn't / imperative)", done: clasificarDone },
    { txt: "Completa los 4 huecos de los consejos en contexto", done: completarDone },
    { txt: "Empareja las 6 estructuras del glosario", done: glosarioDone },
    { txt: "Consigue 3★ (una por cada modo)", done: bestEstrellas >= 3 },
    { txt: "Aprueba el cuestionario de comprensión", done: quizAprobado },
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

  const resetTexto = () => {
    setTextoDone(false);
    setTextoIntento((n) => n + 1);
  };
  const resetActual = modo === "helpline" ? resetSim : modo === "texto" ? resetTexto : modo === "clasificar" ? resetClasificar : modo === "completar" ? resetCompletar : resetGlosario;

  const pistaDe: Record<Modo, string> = {
    helpline: "Arma el consejo con tres piezas: saludo, forma y acción. Mira la cara y la barra de ánimo: se mueve distinto si la forma es incorrecta, si el consejo perjudica o si suena como una orden.",
    clasificar: "Should + verbo base recomienda una acción; shouldn't + verbo base aconseja en contra; el imperativo da una instrucción directa (con o sin Don't).",
    completar: "Recuerda: should y shouldn't van con el verbo base SIN to. Los distractores (should to, must, shoulds, musn't) no encajan en ningún hueco.",
    glosario: "Lee la definición y su ejemplo; luego suelta la estructura que le corresponde para dar o pedir un consejo con empatía.",
    texto: "Escribe la palabra que falta en cada hueco del texto.",
  };

  const escena = (
    <div style={{ color: T.text, display: "grid", gap: 16, minWidth: 0 }}>
      <style>{`
        @keyframes advShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes advPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .adv-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 16px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:800; transition:all .14s; }
        .adv-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .adv-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .adv-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .adv-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .adv-icobtn:hover { background:rgba(255,255,255,0.12); }
        .adv-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:14px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:700; transition:all .14s; user-select:none; max-width:100%; text-align:left; line-height:1.4; }
        .adv-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
        .adv-chip[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
        .adv-chip:active { cursor:grabbing; }
        .adv-chip-sm { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:999px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:800; transition:all .14s; user-select:none; }
        .adv-chip-sm:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
        .adv-chip-sm[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
        .adv-chip-sm:active { cursor:grabbing; }
        .adv-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; transition:all .16s; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
        .adv-row[data-shake="true"] { animation:advShake .4s; border-color:${NO}; }
        .adv-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
        .adv-slot { flex-shrink:0; min-width:96px; min-height:42px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
          display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:14px; transition:all .16s; cursor:pointer; padding:4px 10px; }
        .adv-slot[data-armed="true"] { border-color:${accent}; background:rgba(${color.rgba},0.1); }
        .adv-bin { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; transition:all .16s; min-height:240px; }
        .adv-bin[data-shake="true"] { animation:advShake .4s; border-color:${NO}; }
        .adv-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
        .adv-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
        .adv-q:disabled{ cursor:default; }
        .adv-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; }
        .adv-btn:hover { border-color:${T.lineStrong}; }
        .adv-divider { height:1px; background:${T.line}; margin:18px 0; }
        @media (prefers-reduced-motion: reduce){ .adv-row[data-shake="true"], .adv-bin[data-shake="true"] { animation:none; } }

        .adv-teen { cursor:pointer; display:grid; gap:6px; padding:8px; border-radius:14px; border:1.5px solid ${T.line}; background:${T.glass}; color:#fff; text-align:left; transition:all .14s; min-width:0; }
        .adv-teen:hover { border-color:${T.lineStrong}; }
        .adv-teen[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); box-shadow:0 0 16px -6px ${accent}; }
        .adv-bubble { padding:11px 14px; border-radius:14px; border:1.5px solid ${T.line}; background:${T.inset}; font-size:15px; line-height:1.5; color:#fff; }
        .adv-paso { font-size:14px; font-weight:900; color:${T.text2}; margin-bottom:6px; }
        /* Identidad del tablero */
        .adv-bin, .adv-row { --tono:188; position:relative;
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
        .adv-bin:nth-of-type(6n+1), .adv-row:nth-of-type(6n+1) { --tono:188; }
        .adv-bin:nth-of-type(6n+2), .adv-row:nth-of-type(6n+2) { --tono:262; }
        .adv-bin:nth-of-type(6n+3), .adv-row:nth-of-type(6n+3) { --tono:44; }
        .adv-bin:nth-of-type(6n+4), .adv-row:nth-of-type(6n+4) { --tono:152; }
        .adv-bin:nth-of-type(6n+5), .adv-row:nth-of-type(6n+5) { --tono:330; }
        .adv-bin:nth-of-type(6n+6), .adv-row:nth-of-type(6n+6) { --tono:18; }
        .adv-bin::before, .adv-row::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
          background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
        .adv-bin[data-done="true"], .adv-row[data-done="true"] {
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }
        .adv-chip { transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
        .adv-chip:hover { transform:translateY(-2px); }
        .adv-chip[data-sel="true"] { transform:translateY(-3px) scale(1.02); }
        @media (prefers-reduced-motion: reduce){
          .adv-chip, .adv-chip:hover, .adv-chip[data-sel="true"] { transform:none; transition:none; }
        }
      `}</style>

      {modo === "helpline" && (
        <Helpline
          key={simKey}
          accent={accent}
          rgba={color.rgba}
          animos={animos}
          resueltos={resueltos}
          onEnviar={enviar}
        />
      )}

      {modo === "texto" && (
        <CompletaTexto
          key={textoIntento}
          data={CONSEJOS_INGLES_HUECOS}
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

          {modo === "clasificar" && (
            <Mesa>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada consejo a su forma</Eyebrow>
                  <span style={{ fontSize: 14, fontWeight: 800, color: clasificarDone ? OK : T.text3 }}>
                    {Object.keys(ubicado).length}/{ORACIONES.length}
                  </span>
                </div>
                {oracionesLibres.length === 0 ? (
                  <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Clasificaste las {ORACIONES.length} oraciones!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {oracionesLibres.map((o) => (
                      <button key={o.id} className="adv-chip" data-sel={selOracion === o.id} onClick={() => setSelOracion((s) => (s === o.id ? null : o.id))} {...dragProps(o.id)}>
                        {o.texto}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <BinsClasificar selOracion={selOracion} shakeBin={shakeBin} ubicado={ubicado} onMatch={intentarClasificar} dropProps={dropProps} />
            </Mesa>
          )}

          {/* MODO 2 — Complete the advice */}
          {modo === "completar" && (
            <Mesa>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra la forma correcta a cada hueco</Eyebrow>
                  <span style={{ fontSize: 14, fontWeight: 800, color: completarDone ? OK : T.text3 }}>
                    {Object.keys(completado).length}/{HUECOS.length}
                  </span>
                </div>
                <div style={{ fontSize: 14, color: T.text3, marginBottom: 14, lineHeight: 1.5 }}>
                  Cuidado: hay formas <strong style={{ color: T.text2 }}>incorrectas</strong> (should to, must, shoulds, musn&apos;t) que no encajan en ningún hueco.
                </div>
                {fichasLibres.length === 0 ? (
                  <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Completaste los {HUECOS.length} huecos!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {fichasLibres.map((f) => (
                      <button key={f.id} className="adv-chip-sm" data-sel={selFicha === f.id} onClick={() => setSelFicha((s) => (s === f.id ? null : f.id))} {...dragProps(f.id)}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <RowsCompletar selFicha={selFicha} shakeHueco={shakeHueco} completado={completado} onMatch={intentarCompletar} dropProps={dropProps} />
            </Mesa>
          )}

          {/* MODO 3 — Match the structure */}
          {modo === "glosario" && (
            <Mesa>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada estructura a su definición</Eyebrow>
                  <span style={{ fontSize: 14, fontWeight: 800, color: glosarioDone ? OK : T.text3 }}>
                    {Object.keys(empGlos).length}/{PARES.length}
                  </span>
                </div>
                {glosLibres.length === 0 ? (
                  <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Emparejaste las {PARES.length} estructuras!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {glosLibres.map((g) => (
                      <button key={g.id} className="adv-chip" data-sel={selGlos === g.id} onClick={() => setSelGlos((s) => (s === g.id ? null : g.id))} {...dragProps(g.id)}>
                        <i className="fa-solid fa-quote-left" style={{ fontSize: 14, color: T.text3 }} />
                        {g.termino}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <RowsGlosario selGlos={selGlos} shakeGlos={shakeGlos} empGlos={empGlos} onMatch={intentarGlos} dropProps={dropProps} />
            </Mesa>
          )}
    </div>
  );

  const lectura = modo === "helpline" ? `${resueltos.length}/${ADOLESCENTES.length} amigos ayudados` : `${modosHechos}/4 modos · ${bestEstrellas}★`;

  return (
    <LabShell
      dom
      accent={accent}
      rgba={color.rgba}
      escena={escena}
      modos={{ opciones: MODOS.map((m) => ({ id: m.id, etiqueta: m.label, icono: m.icono })), valor: modo, cambiar: (id) => setModo(id as Modo) }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar este modo" onClick={resetActual} />
        </>
      }
      lectura={lectura}
      objetivos={objetivos}
      retoKey={RETO_KEY}
      pestanas={[
        {
          id: "cuaderno",
          etiqueta: "Cuaderno",
          icono: "fa-comments",
          contenido: (
            <>
              <Bloque titulo="Ánimo de cada amigo (simulación)" icono="fa-face-smile">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 10 }}>
                  {ADOLESCENTES.map((t) => (
                    <Dato key={t.id} label={t.nombre} value={`${animos[t.id]}`} col={caraDe(animos[t.id] ?? 0).color} />
                  ))}
                </div>
                <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
                  Con {ANIMO_META} puntos o más, el amigo se siente bien. Los puntos son una simulación, no una medida real.
                </div>
              </Bloque>
              <Bloque titulo="Tu partida" icono="fa-gauge-high">
                <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
                <div style={{ display: "flex", gap: 4 }}>
                  {[1, 2, 3].map((s) => (
                    <i key={s} className="fa-solid fa-star" style={{ fontSize: 20, color: s <= bestEstrellas ? "#FFC75A" : "rgba(255,255,255,0.16)" }} />
                  ))}
                </div>
                <div style={{ fontSize: 14, color: T.text2 }}>
                  {bestEstrellas >= 3 ? "You can give advice like a pro!" : "Termina los tres modos de refuerzo para ganar 2★; la tercera pide 2 errores o menos."}
                </div>
              </Bloque>
              <Bloque titulo="Pista de este modo" icono="fa-lightbulb">
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>{pistaDe[modo]}</div>
              </Bloque>
            </>
          ),
        },
        {
          id: "reto",
          etiqueta: "Reto",
          icono: "fa-clipboard-question",
          contenido: <QuizCard accent={accent} rgba={color.rgba} aprobado={quizAprobado} onAprobado={() => setQuizAprobado(true)} playSfx={sonido ? (ok) => (ok ? sfxOk() : sfxNo()) : undefined} />,
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="Teoría de la práctica" icono="fa-book-open">
                <FichaTeorica data={CONSEJOS_INGLES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <Bloque titulo="Las tres formas" icono="fa-layer-group">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {(Object.keys(FORMA_INFO) as Forma[]).map((f) => (
                    <div key={f} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>{FORMA_INFO[f].titulo}.</strong> {FORMA_INFO[f].subtitulo}
                      <div style={{ fontStyle: "italic", color: T.text3, marginTop: 2 }}>{FORMA_INFO[f].ejemplo}</div>
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Estructuras para dar y pedir consejos" icono="fa-link">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {PARES.map((p) => (
                    <div key={p.id} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>{p.termino}.</strong> {p.definicion}
                      <div style={{ fontStyle: "italic", color: T.text3, marginTop: 2 }}>{p.ejemplo}</div>
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Dato" icono="fa-circle-info">
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>{DATO_CONSEJOS}</div>
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * SIMULADOR «Helpline»: cuatro amigos ficticios piden consejo; el alumno arma
 * la respuesta (saludo + forma + acción) y ve cómo cambia el ánimo.
 * ═══════════════════════════════════════════════════════════════════════════ */
const RUTA_SIM = "/media/labs-sim/consejos-ingles";

function FotoSim({ clave, icono, color, alto }: { clave: string; icono: string; color: string; alto: number }) {
  const [fallo, setFallo] = useState(false);
  return (
    <div style={{ position: "relative", height: alto, borderRadius: 12, overflow: "hidden", background: `linear-gradient(135deg, ${color}55, #0b2233)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <i className={`fa-solid ${icono}`} aria-hidden style={{ fontSize: Math.round(alto / 3), color: `${color}bb` }} />
      {!fallo && (
        <img src={`${RUTA_SIM}/${clave}.webp`} alt="" loading="lazy" onError={() => setFallo(true)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      )}
    </div>
  );
}

function Helpline({
  accent,
  rgba,
  animos,
  resueltos,
  onEnviar,
}: {
  accent: string;
  rgba: string;
  animos: Record<string, number>;
  resueltos: string[];
  onEnviar: (tid: string, r: Resultado) => void;
}) {
  const [tid, setTid] = useState(ADOLESCENTES[0]!.id);
  const [opener, setOpener] = useState<OpenerId>("none");
  const [fraseId, setFraseId] = useState<FraseId | null>(null);
  const [accionId, setAccionId] = useState<string | null>(null);
  const [res, setRes] = useState<Resultado | null>(null);

  const t = ADOLESCENTES.find((x) => x.id === tid)!;
  const frase = FRASES.find((f) => f.id === fraseId) ?? null;
  const accion = t.acciones.find((a) => a.id === accionId) ?? null;
  const animo = animos[tid] ?? ANIMO_INICIO;
  const cara = caraDe(animo);
  const vista = frase && accion ? armarTexto(opener, frase, accion) : "…";

  const elegirAdolescente = (id: string) => {
    setTid(id);
    setOpener("none");
    setFraseId(null);
    setAccionId(null);
    setRes(null);
  };
  const enviar = () => {
    if (!frase || !accion) return;
    const r = evaluar(accion, frase, opener);
    setRes(r);
    onEnviar(tid, r);
  };
  const colorVeredicto = res ? (res.veredicto === "bien" ? OK : res.veredicto === "fuerte" ? "#FBBF24" : NO) : T.text3;

  return (
    <div style={{ display: "grid", gap: 14, minWidth: 0 }}>
      {/* Los cuatro amigos */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 130px), 1fr))", gap: 10 }}>
        {ADOLESCENTES.map((a) => {
          const an = animos[a.id] ?? ANIMO_INICIO;
          const c = caraDe(an);
          return (
            <button key={a.id} type="button" className="adv-teen" data-on={a.id === tid} onClick={() => elegirAdolescente(a.id)} aria-pressed={a.id === tid}>
              <FotoSim clave={a.imagen} icono={a.icono} color={accent} alto={64} />
              <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 800 }}>
                <span>{a.nombre}</span>
                {resueltos.includes(a.id) ? <i className="fa-solid fa-circle-check" aria-hidden style={{ color: OK }} /> : <i className={`fa-solid ${c.icono}`} aria-hidden style={{ color: c.color }} />}
              </span>
              <span style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.14)", overflow: "hidden" }}>
                <span style={{ display: "block", width: `${an}%`, height: "100%", background: c.color, transition: "width .6s ease, background .6s ease" }} />
              </span>
            </button>
          );
        })}
      </div>

      {/* El mensaje */}
      <div style={{ ...card, padding: 16, display: "grid", gap: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 12 }}>
          <FotoSim key={t.imagen} clave={t.imagen} icono={t.icono} color={cara.color} alto={110} />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <i className={`fa-solid ${cara.icono}`} aria-hidden style={{ fontSize: 34, color: cara.color, transition: "color .5s ease" }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: cara.color }}>
                <span>{t.nombre}, {t.edad} · {cara.texto}</span>
                <span style={{ fontFamily: "ui-monospace, monospace" }}>{animo}</span>
              </div>
              <div style={{ height: 10, borderRadius: 99, background: "rgba(255,255,255,0.14)", overflow: "hidden", marginTop: 5 }}>
                <div style={{ width: `${animo}%`, height: "100%", background: cara.color, borderRadius: 99, transition: "width .6s ease, background .6s ease" }} />
              </div>
            </div>
          </div>
          <div className="adv-bubble" style={{ borderColor: `${cara.color}88` }}>
            <strong style={{ color: cara.color }}>{t.nombre}: </strong>
            “{t.mensaje}”
          </div>
        </div>

        {/* Armar el consejo */}
        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <div className="adv-paso">1 · Empieza con… (opcional)</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {OPENERS.map((o) => (
                <button key={o.id} type="button" className="adv-chip-sm" data-sel={opener === o.id} aria-pressed={opener === o.id} onClick={() => setOpener(o.id)}>
                  {o.texto}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="adv-paso">2 · Forma de consejo</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {FRASES.map((f) => (
                <button key={f.id} type="button" className="adv-chip-sm" data-sel={fraseId === f.id} aria-pressed={fraseId === f.id} onClick={() => setFraseId(f.id)}>
                  {f.etiqueta}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="adv-paso">3 · ¿Qué le aconsejas sobre esto?</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {t.acciones.map((a) => (
                <button key={a.id} type="button" className="adv-chip-sm" data-sel={accionId === a.id} aria-pressed={accionId === a.id} onClick={() => setAccionId(a.id)}>
                  {a.base}
                </button>
              ))}
            </div>
          </div>
          <div className="adv-bubble" style={{ borderColor: `rgba(${rgba},0.6)` }}>
            <strong style={{ color: accent }}>Tú: </strong>
            {opener === "none" ? "" : `${OPENERS.find((o) => o.id === opener)!.texto} `}
            {vista}
          </div>
          <button type="button" className="adv-btn" disabled={!frase || !accion} onClick={enviar} style={{ background: accent, color: "#04121f", border: "none", justifySelf: "start", opacity: frase && accion ? 1 : 0.45 }}>
            <i className="fa-solid fa-paper-plane" aria-hidden /> Enviar consejo
          </button>
        </div>
      </div>

      {/* La reacción */}
      {res && (
        <div style={{ ...card, padding: 16, display: "grid", gap: 10, borderColor: `${colorVeredicto}88` }} role="status">
          <div className="adv-bubble" style={{ borderColor: `${colorVeredicto}88` }}>
            <strong style={{ color: colorVeredicto }}>{t.nombre}: </strong>
            “{res.reaccion}”
          </div>
          <div style={{ fontSize: 14, fontWeight: 900, color: colorVeredicto }}>
            Ánimo {res.delta > 0 ? `+${res.delta}` : res.delta}
            {res.veredicto === "bien" ? " · buen consejo" : res.veredicto === "confuso" ? " · forma confusa" : res.veredicto === "fuerte" ? " · suena a orden" : " · consejo que perjudica"}
          </div>
          <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>
            <i className="fa-solid fa-circle-info" aria-hidden style={{ color: accent, marginRight: 8 }} />
            {res.explica}
          </div>
        </div>
      )}
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

function BinsClasificar({
  selOracion,
  shakeBin,
  ubicado,
  onMatch,
  dropProps,
}: {
  selOracion: string | null;
  shakeBin: Forma | null;
  ubicado: Record<string, Forma>;
  onMatch: (oracionId: string, bin: Forma) => void;
  dropProps: DropFactory;
}) {
  const bins: Forma[] = ["should", "shouldnt", "imperative"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
      {bins.map((bin) => {
        const info = FORMA_INFO[bin];
        const dentro = ORACIONES.filter((o) => ubicado[o.id] === bin);
        return (
          <div
            key={bin}
            className="adv-bin"
            data-shake={shakeBin === bin}
            onClick={() => selOracion && onMatch(selOracion, bin)}
            style={{ position: "relative", isolation: "isolate" }}
            {...dropProps((id) => onMatch(id, bin))}
          >
            {/* La ilustración del concepto llenando la caja vacía. */}
            <FondoTermino termino={info.titulo} />
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
              <VinetaTermino termino={info.titulo} color={T.text2} icono={info.icono} tam={29} radio={8} />
              <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{info.titulo}</span>
            </div>
            <div style={{ fontSize: 14, color: T.text3, marginBottom: 4, lineHeight: 1.4 }}>{info.subtitulo}</div>
            <div style={{ fontSize: 14, color: T.text3, fontStyle: "italic", marginBottom: 12 }}>{info.ejemplo}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dentro.length === 0 ? (
                <div style={{ fontSize: 14, color: T.text3, opacity: 0.6, padding: "8px 0" }}>Arrastra aquí…</div>
              ) : (
                dentro.map((o) => (
                  <span key={o.id} style={{ animation: "advPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 14, color: OK, marginTop: 3 }} />
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

function RowsCompletar({
  selFicha,
  shakeHueco,
  completado,
  onMatch,
  dropProps,
}: {
  selFicha: string | null;
  shakeHueco: string | null;
  completado: Record<string, boolean>;
  onMatch: (chipId: string, rowId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {HUECOS.map((h) => {
        const done = completado[h.id];
        return (
          <div
            key={h.id}
            className="adv-row"
            data-shake={shakeHueco === h.id}
            data-done={done}
            onClick={() => !done && selFicha && onMatch(selFicha, h.id)}
            {...dropProps((id) => onMatch(id, h.id))}
          >
            <div style={{ fontSize: 14.5, color: done ? "#fff" : T.text2, lineHeight: 1.6, display: "inline-flex", alignItems: "center", gap: 7, flexWrap: "wrap", flex: 1, minWidth: 0 }}>
              {h.antes && <span>{h.antes}</span>}
              {done ? (
                <span style={{ animation: "advPop .25s ease", fontWeight: 900, color: OK }}>{h.resp}</span>
              ) : (
                <span className="adv-slot" data-armed={!!selFicha} style={{ minWidth: 96 }}>
                  <i className="fa-solid fa-arrow-down" style={{ fontSize: 14 }} />
                </span>
              )}
              <span>{h.despues}</span>
            </div>
            {!done && (
              <span style={{ fontSize: 14, color: T.text3, fontStyle: "italic", flexShrink: 0, maxWidth: 220, lineHeight: 1.4 }}>{h.pista}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function RowsGlosario({
  selGlos,
  shakeGlos,
  empGlos,
  onMatch,
  dropProps,
}: {
  selGlos: string | null;
  shakeGlos: string | null;
  empGlos: Record<string, boolean>;
  onMatch: (chipId: string, rowId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {PARES.map((g) => {
        const done = empGlos[g.id];
        return (
          <div
            key={g.id}
            className="adv-row"
            data-shake={shakeGlos === g.id}
            data-done={done}
            onClick={() => !done && selGlos && onMatch(selGlos, g.id)}
            {...dropProps((id) => onMatch(id, g.id))}
          >
            <div className="adv-slot" data-armed={!done && !!selGlos} style={{ minWidth: 200, ...(done ? { borderStyle: "solid", borderColor: OK, background: `${OK}1a` } : {}) }}>
              {done ? (
                <span style={{ animation: "advPop .25s ease", fontSize: 14, fontWeight: 900, color: "#fff", display: "inline-flex", alignItems: "center", gap: 7, lineHeight: 1.35 }}>
                  <i className="fa-solid fa-quote-left" />
                  {g.termino}
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: 14 }} /> estructura
                </span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, color: done ? "#fff" : T.text2, lineHeight: 1.45 }}>{g.definicion}</div>
              <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.4, marginTop: 3, fontStyle: "italic" }}>{g.ejemplo}</div>
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
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 14, fontWeight: 800, color: OK }}>
            <i className="fa-solid fa-circle-check" /> Aprobado
          </span>
        )}
      </div>
      <div style={{ fontSize: 14, color: T.text3, marginBottom: 18, lineHeight: 1.5 }}>
        Siete afirmaciones sobre cómo dar y pedir consejos en inglés (should, shouldn&apos;t e imperativos). Decide si son verdaderas o falsas y pulsa «Comprobar».
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
                    <button key={oi} className="adv-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
                      <span style={{ width: 22, height: 22, flexShrink: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, border: `1.5px solid ${sel || (comprobado && esCorrecta) ? "currentColor" : T.line}` }}>
                        {comprobado && esCorrecta ? <i className="fa-solid fa-check" /> : comprobado && sel ? <i className="fa-solid fa-xmark" /> : String.fromCharCode(65 + oi)}
                      </span>
                      <span style={{ flex: 1, lineHeight: 1.35 }}>{op}</span>
                    </button>
                  );
                })}
              </div>
              {comprobado && (
                <div style={{ marginTop: 9, fontSize: 14, color: T.text2, lineHeight: 1.5, display: "flex", gap: 9, padding: "9px 12px", borderRadius: 10, background: T.inset, border: `1px solid ${T.line}` }}>
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
          <button className="adv-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="adv-btn" onClick={reintentar}>
            <i className="fa-solid fa-rotate-left" />
            Reintentar
          </button>
        )}
        {comprobado && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, borderRadius: 12, padding: "10px 16px", border: `1px solid ${aprobadoAhora ? OK : NO}55`, background: `${aprobadoAhora ? OK : NO}14`, fontSize: 14, fontWeight: 800, color: aprobadoAhora ? OK : NO }}>
            <i className={`fa-solid ${aprobadoAhora ? "fa-trophy" : "fa-circle-half-stroke"}`} />
            {aciertos} / {total} correctas
            {!aprobadoAhora && <span style={{ color: T.text3, fontWeight: 600 }}>· revisa las marcadas e inténtalo de nuevo</span>}
          </div>
        )}
      </div>
    </div>
  );
}
