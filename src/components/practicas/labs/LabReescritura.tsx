"use client";

/**
 * Laboratorio — Taller de reescritura: el borrador que cambia.
 * Práctica interactiva para LC-II-P06 (Lengua y Comunicación II, 2.º semestre):
 * «Reescribe un texto».
 *
 * El corazón es INTERVENIR UN BORRADOR, no reconocer una figura. Seis modos:
 *  1. «Cirugía de párrafo» — el alumno opera tres borradores reales: toca las
 *     muletillas, las repeticiones y el relleno, y el contador de palabras baja
 *     delante de él. Tocar algo que carga información cuesta un error y explica
 *     por qué esa parte se queda.
 *  2. «Elige la operación» — doce defectos concretos y cuatro herramientas:
 *     suprimir, sustituir, reordenar y ampliar. No se juzga el texto: se decide
 *     qué operación lo repara, y se ve el arreglo.
 *  3. «Marcas del corrector» — un borrador vuelve anotado; hay que aplicar la
 *     marca tal cual. Las opciones falsas no son malas frases: son reescrituras
 *     que hacen de más, de menos o algo distinto de lo que la marca pedía.
 *  4. «Antes o después» — dos versiones y un PROPÓSITO declarado. Dos parejas
 *     vuelven con el propósito volteado y la respuesta cambia: no hay versión
 *     mejor en abstracto. Después de elegir la versión hay que elegir la razón,
 *     y una de las falsas siempre es del tipo «suena mejor».
 *  5. «Escribe el término» — el glosario A5, de memoria.
 *  6. «Completa el texto» — los huecos verbatim de A2.
 *  + Reto evaluable con los reactivos verbatim de A4 y del video A9.
 *
 * DOM puro (sin three.js): el fenómeno que se estudia ES el texto, así que la
 * escena correcta es el texto mismo, con sus palabras tachándose y su contador
 * bajando. Funciona con ratón, teclado y pantalla táctil, y no infla el bundle
 * del Worker.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { REESCRITURA_HUECOS } from "./reescritura-taller-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { TableroObjetivos } from "./_objetivos";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { REESCRITURA_FICHA } from "./reescritura-taller-ficha";
import {
  cuentaPalabras,
  BORRADORES,
  ESTORBO_INFO,
  DEFECTOS,
  OPERACION_INFO,
  MARCAS,
  MARCA_INFO,
  VERSIONES,
  LECTURA_A1,
  CALLOUT_A1,
  COMPRENSION_A1,
  TALLER_A3,
  PARES,
  RETO_QUIZ,
  NOTA_PIE,
  type Borrador,
  type Trozo,
  type Estorbo,
  type Operacion,
  type BorradorMarcado,
  type ParVersion,
} from "./reescritura-taller-data";

const NO = "#FF5E5E";
const RETO_KEY = "cen-reescritura-taller-reto";

type Modo = "cirugia" | "operacion" | "marcas" | "versiones" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "cirugia", label: "Cirugía de párrafo", icono: "fa-scissors" },
  { id: "operacion", label: "Elige la operación", icono: "fa-toolbox" },
  { id: "marcas", label: "Marcas del corrector", icono: "fa-pen-nib" },
  { id: "versiones", label: "Antes o después", icono: "fa-scale-balanced" },
  { id: "glosario", label: "Escribe el término", icono: "fa-keyboard" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

const OPERACIONES: Operacion[] = ["suprimir", "sustituir", "reordenar", "ampliar"];

/** Palabras de un trozo del borrador (los signos sueltos no cuentan). */
const palabrasDe = (t: Trozo) => cuentaPalabras(t.texto);

const TOTAL_MULETILLAS = BORRADORES.reduce((n, b) => n + b.trozos.filter((t) => t.estorbo === "muletilla").length, 0);
const GEMELOS = VERSIONES.filter((v) => v.gemelo);

/** Cuántas palabras tiene un borrador entero y cuántas debería tener al final. */
function medidas(b: Borrador, cortes: Record<string, true>) {
  let total = 0;
  let meta = 0;
  let actual = 0;
  for (const t of b.trozos) {
    const n = palabrasDe(t);
    total += n;
    if (t.estorbo === null) meta += n;
    if (!cortes[t.id]) actual += n;
  }
  return { total, meta, actual };
}

const limpioYa = (b: Borrador, cortes: Record<string, true>) => b.trozos.every((t) => t.estorbo === null || cortes[t.id]);

export function LabReescritura({ color }: PracticaLabProps) {
  const accent = color.hex.startsWith("#") ? color.hex : `#${color.hex}`;
  const [modo, setModo] = useState<Modo>("cirugia");

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
  /** Clic sin veredicto (elegir opción del reto): suena, no puntúa. */
  const sfxPick = () => sonido && audioRef.current?.blip();

  // ── retroalimentación viva (el «pie del visor» de este laboratorio) ───
  const [nota, setNota] = useState<{ tono: "ok" | "no"; titulo: string; texto: string } | null>(null);

  /* ── modo 1 · cirugía ──────────────────────────────────────────────── */
  const [boIdx, setBoIdx] = useState(0);
  const [cortes, setCortes] = useState<Record<string, true>>({});
  const [shakeTrozo, setShakeTrozo] = useState<string | null>(null);
  const borrador = BORRADORES[boIdx]!;

  const cortar = (trozoId: string) => {
    if (cortes[trozoId]) return;
    const t = borrador.trozos.find((x) => x.id === trozoId);
    if (!t) return;
    if (t.estorbo) {
      const siguiente: Record<string, true> = { ...cortes, [trozoId]: true };
      setCortes(siguiente);
      sfxPlace();
      setNota({ tono: "ok", titulo: `${ESTORBO_INFO[t.estorbo].label} fuera · −${palabrasDe(t)} palabras`, texto: t.porque });
      if (limpioYa(borrador, siguiente)) sfxOk();
    } else {
      setShakeTrozo(trozoId);
      sfxNo();
      setNota({ tono: "no", titulo: "Eso carga información", texto: t.porque });
      window.setTimeout(() => setShakeTrozo(null), 420);
    }
  };
  const resetCirugia = () => {
    const quedan: Record<string, true> = {};
    for (const id of Object.keys(cortes)) {
      if (!borrador.trozos.some((t) => t.id === id)) quedan[id] = true;
    }
    setCortes(quedan);
    setNota(null);
  };

  const muletillasCortadas = BORRADORES.reduce(
    (n, b) => n + b.trozos.filter((t) => t.estorbo === "muletilla" && cortes[t.id]).length,
    0,
  );

  /* ── modo 2 · elige la operación ───────────────────────────────────── */
  const [ubicDef, setUbicDef] = useState<Record<string, Operacion>>({});
  const [selDef, setSelDef] = useState<string | null>(null);
  const [shakeOp, setShakeOp] = useState<Operacion | null>(null);
  const defLibres = DEFECTOS.filter((d) => !ubicDef[d.id]);

  const intentarOperacion = (defId: string, op: Operacion) => {
    const d = DEFECTOS.find((x) => x.id === defId);
    if (!d || ubicDef[defId]) return;
    if (d.operacion === op) {
      setUbicDef((u) => ({ ...u, [defId]: op }));
      setSelDef(null);
      sfxPlace();
      setNota({ tono: "ok", titulo: `Operación correcta: ${OPERACION_INFO[op].label}`, texto: `«${d.arreglo}» — ${d.porque}` });
      if (Object.keys(ubicDef).length + 1 >= DEFECTOS.length) sfxOk();
    } else {
      setShakeOp(op);
      sfxNo();
      setNota({ tono: "no", titulo: `No es «${OPERACION_INFO[op].label}»`, texto: `${OPERACION_INFO[op].pista} Vuelve a leer el diagnóstico: ${d.defecto}` });
      window.setTimeout(() => setShakeOp(null), 420);
    }
  };
  const resetOperacion = () => {
    setUbicDef({});
    setSelDef(null);
    setNota(null);
  };

  /* ── modo 3 · marcas del corrector ─────────────────────────────────── */
  const [maIdx, setMaIdx] = useState(0);
  const [maResueltas, setMaResueltas] = useState<Record<string, true>>({});
  const [maFallos, setMaFallos] = useState<Record<string, number[]>>({});
  const marcado = MARCAS[maIdx]!;

  const elegirOpcionMarca = (item: BorradorMarcado, i: number) => {
    if (maResueltas[item.id]) return;
    const op = item.opciones[i];
    if (!op) return;
    if ((maFallos[item.id] ?? []).includes(i)) return;
    if (op.ok) {
      setMaResueltas((m) => ({ ...m, [item.id]: true }));
      sfxPlace();
      setNota({ tono: "ok", titulo: `${MARCA_INFO[item.marca].label} aplicada`, texto: op.porque });
      if (Object.keys(maResueltas).length + 1 >= MARCAS.length) sfxOk();
    } else {
      setMaFallos((m) => ({ ...m, [item.id]: [...(m[item.id] ?? []), i] }));
      sfxNo();
      setNota({ tono: "no", titulo: "Esa no aplica la marca", texto: op.porque });
    }
  };
  const resetMarcas = () => {
    setMaResueltas({});
    setMaFallos({});
    setNota(null);
  };

  /* ── modo 4 · antes o después ──────────────────────────────────────── */
  const [veIdx, setVeIdx] = useState(0);
  const [veVersion, setVeVersion] = useState<Record<string, "a" | "b">>({});
  const [veRazon, setVeRazon] = useState<Record<string, number>>({});
  const [veFallosV, setVeFallosV] = useState<Record<string, true>>({});
  const [veFallosR, setVeFallosR] = useState<Record<string, number[]>>({});
  const par = VERSIONES[veIdx]!;

  const elegirVersion = (item: ParVersion, cual: "a" | "b") => {
    if (veVersion[item.id]) return;
    if (item.correcta === cual) {
      setVeVersion((v) => ({ ...v, [item.id]: cual }));
      sfxPlace();
      setNota({ tono: "ok", titulo: `Versión ${cual.toUpperCase()} · ahora, ¿por qué?`, texto: "Elige abajo la razón que sostiene tu elección. Las otras dos suenan bien pero no dicen nada del propósito." });
    } else {
      setVeFallosV((v) => ({ ...v, [item.id]: true }));
      sfxNo();
      setNota({
        tono: "no",
        titulo: "Esa versión no cumple el propósito",
        texto: `Relee el propósito declarado: «${item.proposito}» Pregúntate qué necesita ese lector, no cuál te gusta más.`,
      });
    }
  };
  const elegirRazon = (item: ParVersion, i: number) => {
    if (!veVersion[item.id] || veRazon[item.id] !== undefined) return;
    const r = item.razones[i];
    if (!r) return;
    if ((veFallosR[item.id] ?? []).includes(i)) return;
    if (r.ok) {
      setVeRazon((v) => ({ ...v, [item.id]: i }));
      sfxPlace();
      setNota({
        tono: "ok",
        titulo: "Razón correcta",
        texto: `Propósito: «${item.proposito}» → versión ${item.correcta.toUpperCase()}. La explicación completa queda debajo de las razones.`,
      });
      if (Object.keys(veRazon).length + 1 >= VERSIONES.length) sfxOk();
    } else {
      setVeFallosR((v) => ({ ...v, [item.id]: [...(v[item.id] ?? []), i] }));
      sfxNo();
      setNota({
        tono: "no",
        titulo: "Esa razón no evalúa nada",
        texto: "«Suena mejor», «es más larga» o «es más formal» no son criterios: no se pueden comprobar. Busca la razón que hable del propósito o del lector.",
      });
    }
  };
  const resetVersiones = () => {
    setVeVersion({});
    setVeRazon({});
    setVeFallosV({});
    setVeFallosR({});
    setNota(null);
  };

  /* ── modo 5 · glosario ─────────────────────────────────────────────── */
  const [glosarioDone, setGlosarioDone] = useState(false);
  const [glosIntento, setGlosIntento] = useState(0);
  const resetGlosario = () => {
    setGlosarioDone(false);
    setGlosIntento((n) => n + 1);
  };

  /* ── modo 6 · completa el texto ────────────────────────────────────── */
  const [textoDone, setTextoDone] = useState(false);
  const [textoIntento, setTextoIntento] = useState(0);
  const resetHuecos = () => {
    setTextoDone(false);
    setTextoIntento((n) => n + 1);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  /* ── objetivos ─────────────────────────────────────────────────────── */
  const versionesHechas = VERSIONES.filter((v) => veRazon[v.id] !== undefined).length;
  const gemelosHechos = GEMELOS.every((v) => veRazon[v.id] !== undefined);
  const objetivos = [
    { txt: "Limpia el borrador «Aviso vecinal»", done: limpioYa(BORRADORES[0]!, cortes) },
    { txt: "Limpia el borrador «Diario de viaje»", done: limpioYa(BORRADORES[1]!, cortes) },
    { txt: "Limpia el borrador «Reporte escolar»", done: limpioYa(BORRADORES[2]!, cortes) },
    { txt: `Caza las ${TOTAL_MULETILLAS} muletillas de los tres borradores`, done: muletillasCortadas >= TOTAL_MULETILLAS },
    { txt: `Clasifica los ${DEFECTOS.length} defectos en su operación`, done: Object.keys(ubicDef).length >= DEFECTOS.length },
    { txt: `Aplica las ${MARCAS.length} marcas del corrector`, done: Object.keys(maResueltas).length >= MARCAS.length },
    { txt: `Resuelve las ${VERSIONES.length} parejas antes/después`, done: versionesHechas >= VERSIONES.length },
    { txt: "Comprueba que el propósito manda (las 2 parejas gemelas)", done: gemelosHechos },
    { txt: `Escribe los ${PARES.length} términos del glosario`, done: glosarioDone },
    { txt: "Completa el texto de la progresión", done: textoDone },
    { txt: "Aprueba el reto evaluable (70 %)", done: quizAprobado },
  ];

  /* ── arrastre nativo ───────────────────────────────────────────────── */
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
    modo === "cirugia"
      ? resetCirugia
      : modo === "operacion"
        ? resetOperacion
        : modo === "marcas"
          ? resetMarcas
          : modo === "versiones"
            ? resetVersiones
            : modo === "glosario"
              ? resetGlosario
              : resetHuecos;

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes rewShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes rewPop { 0%{transform:scale(.7);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        @keyframes rewTacha { from{background-size:0% 2px;} to{background-size:100% 2px;} }

        .rew-tab { cursor:pointer; display:inline-flex; align-items:center; gap:8px; padding:9px 13px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13px; font-weight:800; transition:all .14s; }
        .rew-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .rew-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }

        .rew-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .rew-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .rew-icobtn:hover { background:rgba(255,255,255,0.12); }

        .rew-prob { cursor:pointer; padding:8px 13px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass};
          color:${T.text2}; font-size:12.5px; font-weight:800; transition:all .14s; }
        .rew-prob:hover { border-color:${T.lineStrong}; color:#fff; }
        .rew-prob[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; }
        .rew-prob[data-done="true"] { color:${OK}; border-color:${OK}66; }

        /* El trozo del borrador: un texto que fluye, pero se puede tachar */
        .rew-trozo { display:inline; box-decoration-break:clone; -webkit-box-decoration-break:clone;
          padding:1px 0; border-radius:4px; cursor:pointer; transition:background-color .14s, color .14s, opacity .2s;
          background-repeat:no-repeat; background-position:0 62%;
          background-image:linear-gradient(currentColor, currentColor); background-size:0% 2px; }
        .rew-trozo:hover { background-color:rgba(255,255,255,0.10); }
        .rew-trozo:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
        .rew-trozo[data-cortado="true"] { cursor:default; opacity:.42; color:${T.text3};
          background-size:100% 2px; animation:rewTacha .3s ease-out; }
        .rew-trozo[data-cortado="true"]:hover { background-color:transparent; }
        .rew-trozo[data-shake="true"] { animation:rewShake .4s; background-color:${NO}26; }

        .rew-card { cursor:grab; display:block; padding:12px 15px; border-radius:13px; border:1.5px solid ${T.line};
          background:${T.glassSoft}; color:${T.text}; font-size:13px; line-height:1.5; text-align:left; transition:all .14s; user-select:none; width:100%; }
        .rew-card:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.07); }
        .rew-card[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); box-shadow:0 0 16px -5px ${accent}; }
        .rew-card:active { cursor:grabbing; }

        .rew-bin { border-radius:16px; border:2px dashed ${T.lineStrong}; padding:15px; min-height:118px; transition:all .16s; position:relative; }
        .rew-bin[data-shake="true"] { animation:rewShake .4s; }

        .rew-opt { cursor:pointer; display:block; width:100%; text-align:left; padding:13px 16px; border-radius:13px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:${T.text}; font-size:13.5px; line-height:1.55; transition:all .14s; }
        .rew-opt:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.07); }
        .rew-opt[data-e="bien"] { border-color:${OK}; background:${OK}14; color:#fff; cursor:default; animation:rewPop .25s ease; }
        .rew-opt[data-e="mal"] { border-color:${NO}66; background:${NO}10; color:${T.text3}; cursor:default; text-decoration:line-through; }
        .rew-opt[disabled] { cursor:default; }

        .rew-ver { cursor:pointer; display:block; width:100%; text-align:left; padding:16px 18px; border-radius:15px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:${T.text}; font-size:14.5px; line-height:1.6; transition:all .15s; }
        .rew-ver:hover { border-color:${accent}; transform:translateY(-1px); }
        .rew-ver[data-e="bien"] { border-color:${OK}; background:${OK}12; cursor:default; transform:none; }
        .rew-ver[data-e="mal"] { border-color:${NO}55; background:${NO}0d; color:${T.text2}; }
        .rew-ver[disabled] { cursor:default; transform:none; }

        .rew-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:10px 16px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:13px; font-weight:800; transition:all .14s; }
        .rew-btn:hover { border-color:${accent}; }
        .rew-btn[disabled] { opacity:.4; cursor:default; }

        .rew-divider { height:1px; background:${T.line}; margin:16px 0; }

        .rew-grid { display:grid; grid-template-columns:minmax(0,1fr) clamp(300px,28vw,400px); gap:22px; align-items:start; }
        .rew-bins { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:13px; }
        @media (max-width: 980px){ .rew-grid { grid-template-columns:minmax(0,1fr); } .rew-bins { grid-template-columns:minmax(0,1fr); } }

        /* Cajón de teoría */
        .rew-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .rew-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .rew-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .rew-drawer[data-open="true"] { transform:translateX(0); }
        .rew-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .rew-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .rew-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .rew-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .rew-teoria-fab { position:fixed; right:20px; bottom:20px; z-index:58; cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.86); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .rew-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
        @media (max-width: 640px){ .rew-teoria-fab { right:12px; bottom:12px; padding:10px 13px; font-size:12px; } }

        @media (prefers-reduced-motion: reduce){
          .rew-trozo, .rew-bin, .rew-opt, .rew-ver { animation:none !important; transition:none; }
          .rew-ver:hover, .rew-teoria-fab:hover { transform:none; }
        }
      `}</style>

      {/* barra de modos + herramientas */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        {MODOS.map((m) => (
          <button key={m.id} className="rew-tab" data-on={modo === m.id} onClick={() => setModo(m.id)}>
            <i className={`fa-solid ${m.icono}`} />
            {m.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
          <button className="rew-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría de la práctica">
            <i className="fa-solid fa-book-open" />
          </button>
          <button className="rew-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
            <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
          </button>
          <button className="rew-icobtn" onClick={reiniciarModo} title="Reiniciar este modo">
            <i className="fa-solid fa-rotate-left" />
          </button>
        </div>
      </div>

      {/* cajón de teoría */}
      <button className="rew-teoria-fab" onClick={() => setDrawer(true)}>
        <i className="fa-solid fa-book-open" />
        Teoría
      </button>
      <div className="rew-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="rew-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="rew-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="rew-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="rew-drawer-body">
          <FichaTeorica data={REESCRITURA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>

      <div className="rew-grid">
        {/* ── Columna principal ───────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {modo === "cirugia" && (
            <CirugiaPanel
              accent={accent}
              rgba={color.rgba}
              borrador={borrador}
              boIdx={boIdx}
              cortes={cortes}
              shakeTrozo={shakeTrozo}
              onSelBorrador={setBoIdx}
              onTrozo={cortar}
            />
          )}

          {modo === "operacion" && (
            <OperacionPanel
              accent={accent}
              ubicDef={ubicDef}
              defLibres={defLibres}
              selDef={selDef}
              shakeOp={shakeOp}
              onSelDef={(id) => setSelDef((p) => (p === id ? null : id))}
              onBin={(op) => {
                if (selDef) intentarOperacion(selDef, op);
              }}
              onDropBin={(id, op) => intentarOperacion(id, op)}
              dragProps={dragProps}
              dropProps={dropProps}
            />
          )}

          {modo === "marcas" && (
            <MarcasPanel
              accent={accent}
              rgba={color.rgba}
              item={marcado}
              maIdx={maIdx}
              resueltas={maResueltas}
              fallos={maFallos[marcado.id] ?? []}
              onSelItem={setMaIdx}
              onOpcion={(i) => elegirOpcionMarca(marcado, i)}
            />
          )}

          {modo === "versiones" && (
            <VersionesPanel
              accent={accent}
              rgba={color.rgba}
              item={par}
              veIdx={veIdx}
              version={veVersion[par.id]}
              razon={veRazon[par.id]}
              falloV={!!veFallosV[par.id]}
              fallosR={veFallosR[par.id] ?? []}
              resueltas={veRazon}
              onSelItem={setVeIdx}
              onVersion={(c) => elegirVersion(par, c)}
              onRazon={(i) => elegirRazon(par, i)}
            />
          )}

          {modo === "glosario" && (
            <EscribeTermino
              key={glosIntento}
              pares={PARES}
              accent={accent}
              rgba={color.rgba}
              completado={glosarioDone}
              instrucciones="Lee la definición y su ejemplo, y escribe el término del glosario que le corresponde."
              onCompletado={() => {
                setGlosarioDone(true);
                sfxOk();
              }}
              onAcierto={sfxPlace}
              onError={sfxNo}
            />
          )}

          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={REESCRITURA_HUECOS}
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

          {/* retroalimentación: el porqué de la última decisión */}
          {modo !== "texto" && modo !== "glosario" && (
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
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: nota ? (nota.tono === "ok" ? OK : NO) : T.text3,
                  }}
                >
                  {nota ? nota.titulo : "¿Por qué?"}
                </div>
                <div style={{ marginTop: 4, fontSize: 13.5, lineHeight: 1.55, color: T.text2 }}>
                  {nota
                    ? nota.texto
                    : "Cada vez que cortes, clasifiques o elijas, aquí aparece la razón: qué se gana y qué se pierde con esa decisión."}
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
              {modo === "cirugia" && (
                <>
                  Toca lo que sobra y míralo tacharse. Caen las <strong style={{ color: T.text }}>muletillas</strong>, las{" "}
                  <strong style={{ color: T.text }}>repeticiones</strong> y el <strong style={{ color: T.text }}>relleno</strong>; lo que carga
                  información se queda, aunque sea largo.
                </>
              )}
              {modo === "operacion" && (
                <>
                  Lee el diagnóstico y decide la herramienta: <strong style={{ color: T.text }}>suprimir</strong> lo que sobra,{" "}
                  <strong style={{ color: T.text }}>sustituir</strong> lo vago, <strong style={{ color: T.text }}>reordenar</strong> lo que confunde o{" "}
                  <strong style={{ color: T.text }}>ampliar</strong> lo que falta.
                </>
              )}
              {modo === "marcas" && (
                <>
                  Una marca se aplica <strong style={{ color: T.text }}>tal cual</strong>: ni de más ni de menos. Dos de las tres opciones son frases
                  correctas que, sin embargo, no hacen lo que el corrector pidió.
                </>
              )}
              {modo === "versiones" && (
                <>
                  La pregunta nunca es cuál suena mejor, sino cuál cumple el <strong style={{ color: T.text }}>propósito declarado</strong>. Elige la
                  versión y después la razón: si tu razón no se puede comprobar, no es una razón.
                </>
              )}
              {modo === "glosario" && (
                <>
                  Lee la definición y su ejemplo y <strong style={{ color: T.text }}>escribe</strong> el término. Si te atoras, usa la pista o abre el
                  banco de términos.
                </>
              )}
              {modo === "texto" && (
                <>
                  Escribe las palabras que faltan. Si te atoras, usa la <strong style={{ color: T.text }}>pista</strong> de cada hueco o abre el banco de
                  palabras.
                </>
              )}
            </span>
          </div>

          {/* Consigna verbatim de la reflexión A3 */}
          <div style={{ ...card, padding: "18px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-feather-pointed" style={{ marginRight: 8, color: accent }} />
              Tu taller (A3)
            </Eyebrow>
            <p style={{ margin: "0 0 11px", fontSize: 12.8, lineHeight: 1.6, color: T.text2 }}>{TALLER_A3.prompt}</p>
            <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 7 }}>
              {TALLER_A3.pistas.map((p, i) => (
                <li key={i} style={{ fontSize: 12.5, lineHeight: 1.5, color: T.text2 }}>
                  {p}
                </li>
              ))}
            </ul>
            <div className="rew-divider" />
            <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.5 }}>
              Se evalúa con cuatro criterios: {TALLER_A3.criterios.join("; ").toLowerCase()}. Extensión: {TALLER_A3.minimo}–{TALLER_A3.maximo}{" "}
              palabras.
            </div>
            <div style={{ marginTop: 10, fontSize: 11, color: T.text3, fontStyle: "italic" }}>Consigna, pistas y criterios verbatim de LC-II-P06-A3.</div>
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

      {/* ── Comprensión A1 + glosario A5 ───────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginTop: 22 }}>
        <div style={{ ...card, padding: "20px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-circle-question" style={{ marginRight: 8, color: accent }} />
            Preguntas de comprensión
          </Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {COMPRENSION_A1.map((c, i) => (
              <div key={i} style={{ borderRadius: 12, border: `1px solid ${T.line}`, background: T.inset, padding: "11px 14px" }}>
                <div style={{ fontSize: 13, lineHeight: 1.45, color: T.text, fontWeight: 700 }}>{c.pregunta}</div>
                <div style={{ marginTop: 7, fontSize: 12.3, lineHeight: 1.5, color: T.text3 }}>
                  <i className="fa-solid fa-arrow-turn-up fa-rotate-90" style={{ marginRight: 7, opacity: 0.6 }} />
                  {c.guia}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: T.text3, fontStyle: "italic" }}>Verbatim de LC-II-P06-A1.</div>
        </div>

        <div style={{ ...card, padding: "20px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-spell-check" style={{ marginRight: 8, color: accent }} />
            Glosario de la progresión
          </Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {PARES.map((g) => (
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
          <div style={{ marginTop: 12, fontSize: 11, color: T.text3, fontStyle: "italic" }}>Verbatim de LC-II-P06-A5.</div>
        </div>
      </div>

      {/* Recuadro «importante» verbatim de A1 */}
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
        <i className="fa-solid fa-triangle-exclamation" style={{ color: accent, fontSize: 17, marginTop: 2 }} />
        <span>{CALLOUT_A1}</span>
      </div>

      <RetoQuizCard
        quiz={RETO_QUIZ}
        accent={accent}
        rgba={color.rgba}
        aprobado={quizAprobado}
        onAprobado={() => setQuizAprobado(true)}
        playSfx={(ok) => (ok ? sfxOk() : sfxNo())}
        playPick={sfxPick}
        mensajeAprobado="Sabes qué operar en un borrador y para qué."
      />

      <p style={{ margin: "18px 0 0", paddingBottom: 60, fontSize: 11.5, lineHeight: 1.6, color: T.text3, fontStyle: "italic" }}>
        <i className="fa-solid fa-circle-info" style={{ marginRight: 7, opacity: 0.7 }} />
        {NOTA_PIE}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 1 — «Cirugía de párrafo»
 * ═══════════════════════════════════════════════════════════════════════════ */
function CirugiaPanel({
  accent,
  rgba,
  borrador,
  boIdx,
  cortes,
  shakeTrozo,
  onSelBorrador,
  onTrozo,
}: {
  accent: string;
  rgba: string;
  borrador: Borrador;
  boIdx: number;
  cortes: Record<string, true>;
  shakeTrozo: string | null;
  onSelBorrador: (i: number) => void;
  onTrozo: (id: string) => void;
}) {
  const { total, meta, actual } = medidas(borrador, cortes);
  const listo = limpioYa(borrador, cortes);
  const recorte = total > 0 ? Math.round(((total - actual) / total) * 100) : 0;
  const porTipo = (e: Estorbo) => {
    const tot = borrador.trozos.filter((t) => t.estorbo === e).length;
    const hechos = borrador.trozos.filter((t) => t.estorbo === e && cortes[t.id]).length;
    return { tot, hechos };
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
        {BORRADORES.map((b, i) => (
          <button key={b.id} className="rew-prob" data-on={boIdx === i} data-done={limpioYa(b, cortes)} onClick={() => onSelBorrador(i)}>
            {limpioYa(b, cortes) && <i className="fa-solid fa-circle-check" style={{ marginRight: 6 }} />}
            {b.titulo}
          </button>
        ))}
      </div>

      <div style={{ ...card, padding: "22px 26px 24px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 6 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: accent }}>
              <i className="fa-solid fa-file-pen" style={{ marginRight: 7 }} />
              Borrador por operar
            </div>
            <h3 style={{ margin: "7px 0 3px", fontSize: 21, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>{borrador.titulo}</h3>
            <div style={{ fontSize: 12.8, color: T.text2, lineHeight: 1.5, maxWidth: 560 }}>{borrador.contexto}</div>
          </div>
          <span
            style={{
              flexShrink: 0,
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              padding: "8px 14px",
              borderRadius: 999,
              fontSize: 12.5,
              fontWeight: 900,
              color: listo ? OK : "#fff",
              border: `1px solid ${listo ? `${OK}66` : `rgba(${rgba},0.4)`}`,
              background: listo ? `${OK}14` : `rgba(${rgba},0.14)`,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <i className={`fa-solid ${listo ? "fa-circle-check" : "fa-hashtag"}`} />
            {actual} palabras
            <span style={{ color: T.text3, fontWeight: 700 }}>
              · meta {meta} · antes {total}
            </span>
          </span>
        </div>

        <div style={{ marginTop: 14 }}>
          <div style={{ height: 6, borderRadius: 999, background: T.inset, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${total > 0 ? Math.min(100, ((total - actual) / Math.max(1, total - meta)) * 100) : 0}%`,
                background: listo ? OK : accent,
                borderRadius: 999,
                transition: "width .3s ease",
              }}
            />
          </div>
          <div style={{ marginTop: 6, fontSize: 11.5, color: T.text3 }}>
            {listo ? `Borrador limpio: ${recorte} % menos palabras, la misma información.` : `Llevas ${recorte} % de recorte. Falta lo que no informa.`}
          </div>
        </div>

        <p style={{ margin: "18px 0 0", fontSize: 16, lineHeight: 2.1, color: T.text2 }}>
          {borrador.trozos.map((t) => {
            const cortado = !!cortes[t.id];
            return (
              /* Un <span> y no un <button>: el botón es un bloque atómico y
                 partiría el párrafo en un trozo por renglón. Aquí el texto
                 tiene que fluir como un texto de verdad. */
              <span
                key={t.id}
                className="rew-trozo"
                role="button"
                tabIndex={cortado ? -1 : 0}
                aria-disabled={cortado}
                data-cortado={cortado}
                data-shake={shakeTrozo === t.id}
                data-trozo={t.id}
                onClick={() => onTrozo(t.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onTrozo(t.id);
                  }
                }}
                aria-label={cortado ? `Suprimido: ${t.texto}` : `Suprimir: ${t.texto}`}
              >
                {t.texto}
              </span>
            );
          })}
        </p>

        <div className="rew-divider" />
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          {(Object.keys(ESTORBO_INFO) as Estorbo[]).map((e) => {
            const info = ESTORBO_INFO[e];
            const { tot, hechos } = porTipo(e);
            return (
              <span
                key={e}
                title={info.descripcion}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 800, color: hechos >= tot ? info.color : T.text3 }}
              >
                <span style={{ width: 11, height: 11, borderRadius: 3, background: info.color, opacity: hechos >= tot ? 1 : 0.45 }} />
                {info.corto}{" "}
                <span style={{ fontVariantNumeric: "tabular-nums" }}>
                  {hechos}/{tot}
                </span>
              </span>
            );
          })}
        </div>
      </div>

      {listo && (
        <div
          style={{
            ...card,
            padding: "18px 22px",
            border: `1px solid ${OK}55`,
            background: `${OK}0d`,
            animation: "rewPop .3s ease",
          }}
        >
          <Eyebrow>
            <i className="fa-solid fa-wand-magic-sparkles" style={{ marginRight: 8, color: OK }} />
            Versión final (recompuesta: mayúsculas y puntuación ajustadas)
          </Eyebrow>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.75, color: "#fff" }}>{borrador.limpio}</p>
          <div style={{ marginTop: 12, fontSize: 12, color: T.text3 }}>
            De {total} a {meta} palabras ({recorte} % menos) sin perder un solo dato. Eso es la <strong style={{ color: T.text2 }}>condensación</strong> de
            la lectura A1.
          </div>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 2 — «Elige la operación»
 * ═══════════════════════════════════════════════════════════════════════════ */
function OperacionPanel({
  accent,
  ubicDef,
  defLibres,
  selDef,
  shakeOp,
  onSelDef,
  onBin,
  onDropBin,
  dragProps,
  dropProps,
}: {
  accent: string;
  ubicDef: Record<string, Operacion>;
  defLibres: typeof DEFECTOS;
  selDef: string | null;
  shakeOp: Operacion | null;
  onSelDef: (id: string) => void;
  onBin: (op: Operacion) => void;
  onDropBin: (id: string, op: Operacion) => void;
  dragProps: (id: string) => Record<string, unknown>;
  dropProps: (onDrop: (id: string) => void) => Record<string, unknown>;
}) {
  const colocados = Object.keys(ubicDef).length;
  return (
    <>
      <div style={{ ...card, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 13, flexWrap: "wrap", gap: 8 }}>
          <Eyebrow>
            <i className="fa-solid fa-stethoscope" style={{ marginRight: 8, color: accent }} />
            Lee el defecto y elige la operación que lo repara
          </Eyebrow>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: colocados >= DEFECTOS.length ? OK : T.text3, fontVariantNumeric: "tabular-nums" }}>
            {colocados}/{DEFECTOS.length}
          </span>
        </div>
        {defLibres.length === 0 ? (
          <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
            <i className="fa-solid fa-circle-check" /> ¡Las {DEFECTOS.length} oraciones están en su operación!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {defLibres.map((d) => (
              <button key={d.id} className="rew-card" data-sel={selDef === d.id} onClick={() => onSelDef(d.id)} {...dragProps(d.id)}>
                <span style={{ display: "block", fontSize: 14.5, lineHeight: 1.5, color: "#fff" }}>«{d.texto}»</span>
                <span style={{ display: "block", marginTop: 6, fontSize: 12, color: T.text3, lineHeight: 1.45 }}>
                  <i className="fa-solid fa-magnifying-glass" style={{ marginRight: 7, opacity: 0.7 }} />
                  {d.defecto}
                  {d.deA1 && (
                    <span style={{ marginLeft: 8, padding: "1px 7px", borderRadius: 999, fontSize: 10, fontWeight: 900, color: accent, border: `1px solid ${accent}55` }}>
                      A1
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="rew-bins">
        {OPERACIONES.map((op) => {
          const info = OPERACION_INFO[op];
          const dentro = DEFECTOS.filter((d) => ubicDef[d.id] === op);
          return (
            <div
              key={op}
              className="rew-bin"
              data-shake={shakeOp === op}
              onClick={() => onBin(op)}
              {...dropProps((id) => onDropBin(id, op))}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onBin(op);
                }
              }}
              style={{ borderColor: `${info.color}66`, background: `${info.color}0d`, cursor: selDef ? "pointer" : "default" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span
                  style={{
                    width: 30,
                    height: 30,
                    flexShrink: 0,
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
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 900, color: "#fff" }}>{info.label}</div>
                  <div style={{ fontSize: 10.5, color: T.text3, lineHeight: 1.35 }}>{info.descripcion}</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {dentro.map((d) => (
                  <span
                    key={d.id}
                    style={{
                      animation: "rewPop .25s ease",
                      fontSize: 11.5,
                      lineHeight: 1.45,
                      color: "#fff",
                      padding: "8px 10px",
                      borderRadius: 9,
                      background: `${info.color}1f`,
                      border: `1px solid ${info.color}55`,
                    }}
                  >
                    <span style={{ color: T.text3, textDecoration: "line-through" }}>{d.texto.length > 62 ? d.texto.slice(0, 60) + "…" : d.texto}</span>
                    <br />
                    <i className="fa-solid fa-arrow-right-long" style={{ margin: "4px 7px 0 0", color: info.color }} />
                    {d.arreglo.length > 118 ? d.arreglo.slice(0, 116) + "…" : d.arreglo}
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

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 3 — «Marcas del corrector»
 * ═══════════════════════════════════════════════════════════════════════════ */
function MarcasPanel({
  accent,
  rgba,
  item,
  maIdx,
  resueltas,
  fallos,
  onSelItem,
  onOpcion,
}: {
  accent: string;
  rgba: string;
  item: BorradorMarcado;
  maIdx: number;
  resueltas: Record<string, true>;
  fallos: number[];
  onSelItem: (i: number) => void;
  onOpcion: (i: number) => void;
}) {
  const info = MARCA_INFO[item.marca];
  const hecho = !!resueltas[item.id];
  const total = Object.keys(resueltas).length;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
        {MARCAS.map((m, i) => (
          <button key={m.id} className="rew-prob" data-on={maIdx === i} data-done={!!resueltas[m.id]} onClick={() => onSelItem(i)}>
            {resueltas[m.id] ? <i className="fa-solid fa-circle-check" style={{ marginRight: 6 }} /> : <span style={{ marginRight: 6, opacity: 0.7 }}>{MARCA_INFO[m.marca].simbolo}</span>}
            Borrador {i + 1}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, fontWeight: 800, color: total >= MARCAS.length ? OK : T.text3, fontVariantNumeric: "tabular-nums" }}>
          {total}/{MARCAS.length} marcas aplicadas
        </span>
      </div>

      {/* El borrador anotado */}
      <div style={{ ...card, padding: "22px 26px" }}>
        <Eyebrow>
          <i className="fa-solid fa-file-circle-check" style={{ marginRight: 8, color: accent }} />
          El borrador vuelve del corrector
        </Eyebrow>

        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div
            style={{
              flexShrink: 0,
              minWidth: 128,
              borderRadius: 13,
              border: `1px solid rgba(${rgba},0.34)`,
              background: `rgba(${rgba},0.10)`,
              padding: "12px 14px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 30, lineHeight: 1, color: accent, fontWeight: 700 }}>{info.simbolo}</div>
            <div style={{ marginTop: 7, fontSize: 12, fontWeight: 900, color: "#fff" }}>{info.label}</div>
            <div style={{ marginTop: 4, fontSize: 10.8, color: T.text3, lineHeight: 1.35 }}>{info.significa}</div>
          </div>

          <div style={{ flex: 1, minWidth: 260 }}>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.95, color: T.text2 }}>
              {item.antes}
              <span
                style={{
                  padding: "2px 5px",
                  borderRadius: 5,
                  color: "#fff",
                  background: `rgba(${rgba},0.3)`,
                  boxShadow: `inset 0 -2px 0 ${accent}`,
                  fontWeight: 600,
                }}
              >
                {item.senalado}
              </span>
              {item.despues}
            </p>
            <div
              style={{
                marginTop: 13,
                display: "inline-flex",
                gap: 9,
                alignItems: "center",
                fontSize: 12.5,
                color: T.text2,
                borderLeft: `3px solid ${accent}`,
                paddingLeft: 11,
                fontStyle: "italic",
              }}
            >
              <i className="fa-solid fa-comment-dots" style={{ color: accent }} />
              Nota al margen: {item.anotacion}
            </div>
          </div>
        </div>
      </div>

      {/* Las tres reescrituras */}
      <div style={{ ...card, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 13 }}>
          <Eyebrow>¿Cuál aplica la marca, exactamente?</Eyebrow>
          {hecho && (
            <span style={{ fontSize: 12.5, fontWeight: 800, color: OK, display: "inline-flex", alignItems: "center", gap: 8 }}>
              <i className="fa-solid fa-circle-check" /> Marca aplicada
            </span>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {item.opciones.map((o, i) => {
            const mal = fallos.includes(i);
            const bien = hecho && o.ok;
            return (
              <button
                key={i}
                className="rew-opt"
                data-e={bien ? "bien" : mal ? "mal" : undefined}
                disabled={hecho || mal}
                onClick={() => onOpcion(i)}
              >
                <span style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
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
                      color: bien ? "#04121f" : mal ? NO : T.text3,
                      background: bien ? OK : "transparent",
                      border: `1px solid ${bien ? OK : mal ? `${NO}66` : T.line}`,
                    }}
                  >
                    {String.fromCharCode(97 + i)}
                  </span>
                  <span style={{ minWidth: 0 }}>
                    {o.texto.split("||").map((parte, k) => (
                      <span key={k} style={{ display: "block", marginTop: k > 0 ? 8 : 0 }}>
                        {parte.trim()}
                      </span>
                    ))}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 4 — «Antes o después»
 * ═══════════════════════════════════════════════════════════════════════════ */
function VersionesPanel({
  accent,
  rgba,
  item,
  veIdx,
  version,
  razon,
  falloV,
  fallosR,
  resueltas,
  onSelItem,
  onVersion,
  onRazon,
}: {
  accent: string;
  rgba: string;
  item: ParVersion;
  veIdx: number;
  version: "a" | "b" | undefined;
  razon: number | undefined;
  falloV: boolean;
  fallosR: number[];
  resueltas: Record<string, number>;
  onSelItem: (i: number) => void;
  onVersion: (c: "a" | "b") => void;
  onRazon: (i: number) => void;
}) {
  const hechas = Object.keys(resueltas).length;
  const gemelo = useMemo(() => (item.gemelo ? VERSIONES.find((v) => v.id === item.gemelo) : undefined), [item.gemelo]);
  const gemeloHecho = gemelo ? resueltas[gemelo.id] !== undefined : false;

  const botonVersion = (cual: "a" | "b") => {
    const texto = cual === "a" ? item.a : item.b;
    const elegida = version === cual;
    const fallada = falloV && item.correcta !== cual;
    const bloqueada = version !== undefined;
    return (
      <button
        className="rew-ver"
        data-e={elegida ? "bien" : fallada ? "mal" : undefined}
        disabled={bloqueada}
        onClick={() => onVersion(cual)}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
          <span
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 900,
              color: elegida ? "#04121f" : T.text2,
              background: elegida ? OK : `rgba(${rgba},0.16)`,
              border: `1px solid ${elegida ? OK : T.line}`,
            }}
          >
            {cual.toUpperCase()}
          </span>
          <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", color: T.text3 }}>
            {cual === "a" ? "Versión A" : "Versión B"}
          </span>
          <span style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: T.text3, fontVariantNumeric: "tabular-nums" }}>{cuentaPalabras(texto)} palabras</span>
        </span>
        {texto}
      </button>
    );
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
        {VERSIONES.map((v, i) => (
          <button key={v.id} className="rew-prob" data-on={veIdx === i} data-done={resueltas[v.id] !== undefined} onClick={() => onSelItem(i)}>
            {resueltas[v.id] !== undefined && <i className="fa-solid fa-circle-check" style={{ marginRight: 6 }} />}
            {v.gemelo && <i className="fa-solid fa-link" style={{ marginRight: 6, opacity: 0.6, fontSize: 10 }} />}
            Par {i + 1}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, fontWeight: 800, color: hechas >= VERSIONES.length ? OK : T.text3, fontVariantNumeric: "tabular-nums" }}>
          {hechas}/{VERSIONES.length} resueltos
        </span>
      </div>

      {/* El propósito declarado */}
      <div
        style={{
          borderRadius: 18,
          border: `1px solid rgba(${rgba},0.34)`,
          background: `rgba(${rgba},0.09)`,
          padding: "16px 20px",
          display: "flex",
          gap: 13,
          alignItems: "flex-start",
        }}
      >
        <i className="fa-solid fa-bullseye" style={{ color: accent, fontSize: 18, marginTop: 3 }} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 10.5, fontWeight: 900, letterSpacing: "0.13em", textTransform: "uppercase", color: accent }}>Propósito declarado</div>
          <div style={{ marginTop: 5, fontSize: 15, fontWeight: 700, color: "#fff", lineHeight: 1.5 }}>{item.proposito}</div>
          <div style={{ marginTop: 6, fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>{item.contexto}</div>
          {gemelo && (
            <div style={{ marginTop: 9, fontSize: 12, color: gemeloHecho ? OK : T.text3, display: "flex", gap: 8, alignItems: "center" }}>
              <i className="fa-solid fa-link" />
              Este par usa las MISMAS dos versiones que otro par de la lista, con el propósito volteado.
              {gemeloHecho ? " Ya resolviste el otro: compara." : " Resuélvelos los dos y compara."}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: 13 }}>
        {botonVersion("a")}
        {botonVersion("b")}
      </div>

      {/* Paso 2: la razón */}
      <div style={{ ...card, padding: "18px 22px", opacity: version ? 1 : 0.55 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 13 }}>
          <Eyebrow>
            <i className="fa-solid fa-2" style={{ marginRight: 8, color: accent }} />
            ¿Y por qué? (no vale «suena mejor»)
          </Eyebrow>
          {razon !== undefined && (
            <span style={{ fontSize: 12.5, fontWeight: 800, color: OK, display: "inline-flex", alignItems: "center", gap: 8 }}>
              <i className="fa-solid fa-circle-check" /> Par resuelto
            </span>
          )}
        </div>
        {!version ? (
          <div style={{ fontSize: 13, color: T.text3, fontStyle: "italic" }}>Primero elige arriba la versión que cumple el propósito.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {item.razones.map((r, i) => {
              const mal = fallosR.includes(i);
              const bien = razon === i;
              return (
                <button key={i} className="rew-opt" data-e={bien ? "bien" : mal ? "mal" : undefined} disabled={razon !== undefined || mal} onClick={() => onRazon(i)}>
                  <span style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                    <i
                      className={`fa-solid ${bien ? "fa-circle-check" : mal ? "fa-circle-xmark" : "fa-circle"}`}
                      style={{ fontSize: 14, marginTop: 2, color: bien ? OK : mal ? NO : T.text3, opacity: bien || mal ? 1 : 0.35 }}
                    />
                    <span style={{ minWidth: 0 }}>{r.texto}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
        {razon !== undefined && (
          <div style={{ marginTop: 14, borderRadius: 12, border: `1px solid ${OK}44`, background: `${OK}0d`, padding: "12px 15px", fontSize: 13, lineHeight: 1.55, color: T.text2 }}>
            <i className="fa-solid fa-lightbulb" style={{ marginRight: 9, color: OK }} />
            {item.porque}
          </div>
        )}
      </div>
    </>
  );
}
