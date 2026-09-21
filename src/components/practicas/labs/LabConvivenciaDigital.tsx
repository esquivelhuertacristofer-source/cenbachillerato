"use client";

/**
 * Laboratorio — Convivencia digital
 * Práctica para CD-I-P07 (Cultura Digital I, semestre 1): «Identidades y
 * respeto en el ciberespacio».
 *
 * El riesgo de este tema es el sermón: una lámina que dice «sé respetuoso» y un
 * quiz que confirma que el alumno sabe decirlo. Aquí no hay nada que leer y
 * asentir; hay cuatro cosas que operar, y todas devuelven consecuencias:
 *
 *  1. «La misma frase, otro efecto» — el mismo mensaje cambia de sentido según
 *     el canal, el tono y si lleva o no el motivo. Cuatro encargos pedían un
 *     efecto concreto, y no siempre es «lo más privado posible»: hay uno que
 *     sólo se resuelve publicando abierto.
 *  2. «Huella e identidad» — un perfil que revela cosas que nunca escribió. El
 *     alumno lo cierra elemento por elemento con DOS medidores: exposición y
 *     presencia. Borrarlo todo pone la exposición en cero y suspende, porque
 *     desaparecer no es la respuesta.
 *  3. «Escalar o no escalar» — primero se lee la situación con las tres señales
 *     (repetición, desequilibrio de poder, intención), que es lo que separa una
 *     molestia de un acoso; después se elige la respuesta proporcional entre
 *     diez acciones. Bloquear aparece como lo que es: útil y nunca suficiente.
 *  4. «Reescribe para desescalar» — tres mensajes hostiles partidos en
 *     movimientos, con su salida agresiva, su salida sumisa y la firme.
 *  5. «Completa el texto» y «Escribe el término», con el contenido verbatim de
 *     A6 y A5.
 *  + Reto evaluable con el quiz verbatim de A2.
 *
 * Es DOM puro y no three.js a propósito: el fenómeno de esta progresión es una
 * conversación, y una escena 3D sería decoración encima del texto.
 *
 * Contenido verbatim de CD-I·P07; los casos, el perfil y los mensajes son
 * ilustrativos (ver `convivencia-digital-data.ts` y la nota al pie).
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { CONVIVENCIA_HUECOS } from "./convivencia-digital-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { TableroObjetivos } from "./_objetivos";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { CONVIVENCIA_FICHA } from "./convivencia-digital-ficha";
import {
  CANALES,
  TONOS,
  CONTEXTOS,
  ENCARGOS,
  componeMensaje,
  lecturaDe,
  PERFIL,
  META_EXPOSICION,
  META_PRESENCIA,
  AVISO_PERFIL,
  SENALES,
  NIVELES,
  ACCIONES,
  CASOS,
  nivelPor,
  REESCRITURAS,
  TIPO_RESP,
  QUIZ,
  HECHOS,
  PARES,
  PISTAS_A3,
  PREGUNTA_A7,
  TAREA_A5,
  DATO_A1,
  FUENTE,
  type CanalId,
  type TonoId,
  type ContextoId,
  type SenalId,
} from "./convivencia-digital-data";

const NO = "#FF5E5E";
const RETO_KEY = "cen-convivencia-digital-reto";

type Modo = "canal" | "perfil" | "escalar" | "reescribir" | "texto" | "glosario";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "canal", label: "La misma frase, otro efecto", icono: "fa-sliders" },
  { id: "perfil", label: "Huella e identidad", icono: "fa-id-card" },
  { id: "escalar", label: "Escalar o no escalar", icono: "fa-scale-balanced" },
  { id: "reescribir", label: "Reescribe para desescalar", icono: "fa-pen-to-square" },
  { id: "texto", label: "Completa el texto", icono: "fa-keyboard" },
  { id: "glosario", label: "Escribe el término", icono: "fa-spell-check" },
];

const COLOR_RIESGO = ["#34D399", "#FBBF24", "#FF8A3C", "#FF5E5E"];

export function LabConvivenciaDigital({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("canal");

  /* ── sonido y partida ─────────────────────────────────────────────────── */
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

  /* ── MODO 1 · la misma frase, otro efecto ─────────────────────────────── */
  const [encIdx, setEncIdx] = useState(0);
  const [canal, setCanal] = useState<CanalId>("privado");
  const [tono, setTono] = useState<TonoId>("neutro");
  const [contexto, setContexto] = useState<ContextoId>("con");
  const [probados, setProbados] = useState<Record<string, boolean>>({ privado: true });
  const [enviados, setEnviados] = useState<Record<string, boolean>>({});
  const [veredictoEnv, setVeredictoEnv] = useState<string | null>(null);

  const encargo = ENCARGOS[encIdx]!;
  const canalInfo = CANALES.find((c) => c.id === canal) ?? CANALES[0]!;
  const lectura = lecturaDe(canal, tono, contexto);
  const mensaje = componeMensaje(encargo, tono, contexto);
  const encargoOk = enviados[encargo.id] === true;

  const elegirCanal = (c: CanalId) => {
    setCanal(c);
    setProbados((p) => ({ ...p, [c]: true }));
    setVeredictoEnv(null);
  };

  const enviar = () => {
    if (encargoOk) return;
    const o = encargo.objetivo;
    if (o.canal === canal && o.tono === tono && o.contexto === contexto) {
      setEnviados((e) => ({ ...e, [encargo.id]: true }));
      setVeredictoEnv(null);
      sfxPlace();
      sfxOk();
      return;
    }
    const falla: string[] = [];
    if (o.canal !== canal) falla.push("el canal: piensa a quién le sirve leerlo y a quién puede dañar");
    if (o.tono !== tono) falla.push("el tono: el encargo pide otro registro");
    if (o.contexto !== contexto) falla.push("el motivo: decide si quien lo recibe tiene que adivinarlo");
    setVeredictoEnv(`Todavía no. Revisa ${falla.join("; ")}.`);
    sfxNo();
  };

  const resetCanal = () => {
    setEnviados({});
    setVeredictoEnv(null);
    setCanal("privado");
    setTono("neutro");
    setContexto("con");
    setProbados({ privado: true });
  };

  const canalDone = ENCARGOS.every((e) => enviados[e.id] === true);
  const canalesProbados = CANALES.filter((c) => probados[c.id]).length;

  /* ── MODO 2 · huella e identidad ──────────────────────────────────────── */
  const [elec, setElec] = useState<Record<string, string>>(() =>
    Object.fromEntries(PERFIL.map((el) => [el.id, el.opciones[0]!.id])),
  );
  const [tocados, setTocados] = useState<Record<string, boolean>>({});
  const [perfilLogrado, setPerfilLogrado] = useState(false);
  const [veredictoPerfil, setVeredictoPerfil] = useState<string | null>(null);

  const opcionDe = (elId: string) => {
    const el = PERFIL.find((e) => e.id === elId);
    if (!el) return null;
    return el.opciones.find((o) => o.id === elec[elId]) ?? el.opciones[0]!;
  };
  const exposicion = PERFIL.reduce((n, el) => n + (opcionDe(el.id)?.exposicion ?? 0), 0);
  const presencia = PERFIL.reduce((n, el) => n + (opcionDe(el.id)?.presencia ?? 0), 0);
  const perfilDone = perfilLogrado;

  const elegirOpcion = (elId: string, opcId: string) => {
    setElec((m) => ({ ...m, [elId]: opcId }));
    setTocados((m) => ({ ...m, [elId]: true }));
    setVeredictoPerfil(null);
  };

  const comprobarPerfil = () => {
    if (perfilLogrado) return;
    if (exposicion <= META_EXPOSICION && presencia >= META_PRESENCIA) {
      setPerfilLogrado(true);
      setVeredictoPerfil(null);
      sfxPlace();
      sfxOk();
      return;
    }
    const partes: string[] = [];
    if (exposicion > META_EXPOSICION)
      partes.push(
        `la exposición sigue en ${exposicion} (la meta es ${META_EXPOSICION} o menos): queda algún elemento del que se deduce dónde estás, a qué hora o cómo te llamas`,
      );
    if (presencia < META_PRESENCIA)
      partes.push(
        `la presencia bajó a ${presencia} (la meta es ${META_PRESENCIA} o más): estás borrándote en lugar de cerrar. Busca la opción intermedia de cada elemento, la que conserva el contenido y quita el dato`,
      );
    setVeredictoPerfil(`Todavía no: ${partes.join(". También ")}.`);
    sfxNo();
  };

  const resetPerfil = () => {
    setElec(Object.fromEntries(PERFIL.map((el) => [el.id, el.opciones[0]!.id])));
    setTocados({});
    setPerfilLogrado(false);
    setVeredictoPerfil(null);
  };

  const perfilRevisado = PERFIL.every((el) => tocados[el.id]);

  /* ── MODO 3 · escalar o no escalar ────────────────────────────────────── */
  const [casoIdx, setCasoIdx] = useState(0);
  const [senalResp, setSenalResp] = useState<Record<string, Partial<Record<SenalId, boolean>>>>({});
  const [falloSenal, setFalloSenal] = useState<string | null>(null);
  const [selAcc, setSelAcc] = useState<Record<string, string[]>>({});
  const [accOk, setAccOk] = useState<Record<string, boolean>>({});
  const [verAcc, setVerAcc] = useState<Record<string, { faltan: string[]; sobran: string[] }>>({});

  const caso = CASOS[casoIdx]!;
  const respDelCaso = senalResp[caso.id] ?? {};
  const senalesOk = SENALES.every((s) => respDelCaso[s.id] !== undefined);
  const selDelCaso = selAcc[caso.id] ?? [];
  const casoResuelto = accOk[caso.id] === true;

  const responderSenal = (s: SenalId, valor: boolean) => {
    if (respDelCaso[s] !== undefined) return;
    if (caso.senales[s] === valor) {
      setSenalResp((m) => ({ ...m, [caso.id]: { ...(m[caso.id] ?? {}), [s]: valor } }));
      setFalloSenal(null);
      sfxPlace();
    } else {
      const info = SENALES.find((x) => x.id === s);
      setFalloSenal(info ? `${info.pregunta} Todavía no: ${info.explica} Vuelve a leer el caso con ese criterio.` : null);
      sfxNo();
    }
  };

  const alternarAccion = (id: string) => {
    if (casoResuelto) return;
    setSelAcc((m) => {
      const actual = m[caso.id] ?? [];
      return { ...m, [caso.id]: actual.includes(id) ? actual.filter((x) => x !== id) : [...actual, id] };
    });
  };

  const comprobarAcciones = () => {
    if (casoResuelto || !senalesOk) return;
    const sel = selAcc[caso.id] ?? [];
    const faltan = caso.correctas.filter((x) => !sel.includes(x));
    const sobran = sel.filter((x) => !caso.correctas.includes(x));
    if (faltan.length === 0 && sobran.length === 0) {
      setAccOk((m) => ({ ...m, [caso.id]: true }));
      setVerAcc((m) => ({ ...m, [caso.id]: { faltan: [], sobran: [] } }));
      sfxPlace();
      sfxOk();
      return;
    }
    setVerAcc((m) => ({ ...m, [caso.id]: { faltan, sobran } }));
    sfxNo();
  };

  const resetEscalar = () => {
    setSenalResp({});
    setSelAcc({});
    setAccOk({});
    setVerAcc({});
    setFalloSenal(null);
    setCasoIdx(0);
  };

  const senalesDone = CASOS.every((c) => SENALES.every((s) => senalResp[c.id]?.[s.id] !== undefined));
  const accionesDone = CASOS.every((c) => accOk[c.id] === true);

  /* ── MODO 4 · reescribe para desescalar ───────────────────────────────── */
  const [msgIdx, setMsgIdx] = useState(0);
  const [elecMov, setElecMov] = useState<Record<string, string>>({});
  const [falloMov, setFalloMov] = useState<{ clave: string; porque: string; tipo: string } | null>(null);

  const mensajeH = REESCRITURAS[msgIdx]!;
  const claveMov = (msgId: string, movId: string) => `${msgId}:${movId}`;
  const msgListo = mensajeH.movimientos.every((mv) => elecMov[claveMov(mensajeH.id, mv.id)] !== undefined);

  const elegirMovimiento = (movId: string, opcId: string) => {
    const mv = mensajeH.movimientos.find((x) => x.id === movId);
    const op = mv?.opciones.find((x) => x.id === opcId);
    if (!mv || !op) return;
    const clave = claveMov(mensajeH.id, movId);
    if (elecMov[clave] !== undefined) return;
    if (op.tipo === "firme") {
      setElecMov((m) => ({ ...m, [clave]: opcId }));
      setFalloMov(null);
      sfxPlace();
    } else {
      setFalloMov({ clave, porque: op.porque, tipo: op.tipo });
      sfxNo();
    }
  };

  const resetReescribir = () => {
    setElecMov({});
    setFalloMov(null);
    setMsgIdx(0);
  };

  const reescribirDone = REESCRITURAS.every((m) => m.movimientos.every((mv) => elecMov[claveMov(m.id, mv.id)] !== undefined));

  /* ── MODO 5 · completa el texto (A6 verbatim) ─────────────────────────── */
  const [textoDone, setTextoDone] = useState(false);
  const [textoIntento, setTextoIntento] = useState(0);
  const resetTexto = () => {
    setTextoDone(false);
    setTextoIntento((n) => n + 1);
  };

  /* ── MODO 6 · escribe el término (A5 verbatim) ────────────────────────── */
  const [glosarioDone, setGlosarioDone] = useState(false);
  const [glosarioIntento, setGlosarioIntento] = useState(0);
  const resetGlosario = () => {
    setGlosarioDone(false);
    setGlosarioIntento((n) => n + 1);
  };

  /* ── reto evaluable ───────────────────────────────────────────────────── */
  const [quizAprobado, setQuizAprobado] = useState(false);

  /* ── objetivos ────────────────────────────────────────────────────────── */
  const todoHecho = canalDone && perfilDone && senalesDone && accionesDone && reescribirDone && textoDone && glosarioDone;
  const objetivos = [
    { txt: `Resuelve los ${ENCARGOS.length} encargos de mensajería`, done: canalDone },
    { txt: "Compara el efecto en los cuatro canales", done: canalesProbados >= CANALES.length },
    { txt: `Revisa los ${PERFIL.length} elementos del perfil`, done: perfilRevisado },
    { txt: `Baja la exposición a ${META_EXPOSICION} sin perder presencia`, done: perfilDone },
    { txt: `Lee las tres señales en los ${CASOS.length} casos`, done: senalesDone },
    { txt: `Elige la respuesta proporcional en los ${CASOS.length} casos`, done: accionesDone },
    { txt: `Reescribe en firme los ${REESCRITURAS.length} mensajes`, done: reescribirDone },
    { txt: "Completa el texto con los cuatro términos", done: textoDone },
    { txt: `Escribe los ${PARES.length} términos del glosario`, done: glosarioDone },
    { txt: "Aprueba el reto evaluable", done: quizAprobado },
    { txt: "Termina con 2 errores o menos", done: todoHecho && partida.errores <= 2 },
  ];

  const resetActual =
    modo === "canal"
      ? resetCanal
      : modo === "perfil"
        ? resetPerfil
        : modo === "escalar"
          ? resetEscalar
          : modo === "reescribir"
            ? resetReescribir
            : modo === "glosario"
              ? resetGlosario
              : resetTexto;

  const nivelActual = senalesOk ? nivelPor(SENALES.map((s) => caso.senales[s.id])) : null;
  const verDelCaso = verAcc[caso.id];

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes cvdShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-5px);} 40%{transform:translateX(5px);} 60%{transform:translateX(-3px);} 80%{transform:translateX(3px);} }
        @keyframes cvdPop { 0%{transform:scale(.7);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .cvd-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 15px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13px; font-weight:800; transition:all .14s; }
        .cvd-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .cvd-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .cvd-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .cvd-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .cvd-icobtn:hover { background:rgba(255,255,255,0.12); }

        /* Selector de caso / encargo / mensaje */
        .cvd-doc { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:9px 14px; border-radius:10px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:12.5px; font-weight:800; transition:all .14s; }
        .cvd-doc:hover { border-color:${T.lineStrong}; color:#fff; }
        .cvd-doc[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; }
        .cvd-doc[data-done="true"] { color:${OK}; border-color:${OK}66; }

        /* Controles de la consola de mensajes */
        .cvd-dial { cursor:pointer; flex:1; min-width:150px; text-align:left; padding:11px 13px; border-radius:13px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:${T.text2}; transition:all .15s; }
        .cvd-dial:hover { border-color:${T.lineStrong}; }
        .cvd-dial[data-on="true"] { color:#fff; }

        /* Burbujas de mensaje */
        .cvd-burbuja { border-radius:16px 16px 16px 5px; padding:14px 17px; font-size:15px; line-height:1.6;
          border:1px solid ${T.lineStrong}; background:${T.inset}; color:#fff; }
        .cvd-burbuja[data-tipo="hostil"] { border-color:${NO}66; background:${NO}14; }
        .cvd-burbuja[data-tipo="firme"] { border-color:${OK}66; background:${OK}12; }

        /* Barras de exposición / presencia */
        .cvd-barra { height:11px; border-radius:999px; background:${T.inset}; border:1px solid ${T.line}; overflow:hidden; }
        .cvd-barra > span { display:block; height:100%; border-radius:999px; transition:width .3s ease; }

        /* Opciones (perfil, movimientos, acciones) */
        .cvd-opt { cursor:pointer; text-align:left; width:100%; padding:10px 13px; border-radius:11px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13px; font-weight:700;
          line-height:1.45; transition:all .14s; }
        .cvd-opt:hover:not(:disabled) { border-color:${T.lineStrong}; background:rgba(255,255,255,0.07); color:#fff; }
        .cvd-opt:disabled { cursor:default; }
        .cvd-opt[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.17); color:#fff; }
        .cvd-opt[data-bien="true"] { border-color:${OK}; background:${OK}16; color:#fff; }
        .cvd-opt[data-mal="true"] { border-color:${NO}; background:${NO}14; animation:cvdShake .4s; }

        .cvd-acc { cursor:pointer; display:flex; align-items:center; gap:10px; text-align:left; padding:10px 13px; border-radius:11px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:12.5px; font-weight:700; line-height:1.4; transition:all .14s; }
        .cvd-acc:hover:not(:disabled) { border-color:${T.lineStrong}; color:#fff; }
        .cvd-acc[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.18); color:#fff; }
        .cvd-acc[data-bien="true"] { border-color:${OK}; background:${OK}16; color:#fff; }
        .cvd-acc[data-mal="true"] { border-color:${NO}; background:${NO}16; color:#fff; }
        .cvd-acc:disabled { cursor:default; }

        .cvd-si-no { cursor:pointer; padding:7px 16px; border-radius:10px; border:1.5px solid ${T.line};
          background:${T.inset}; color:${T.text2}; font-size:12.5px; font-weight:800; transition:all .14s; }
        .cvd-si-no:hover:not(:disabled) { border-color:${T.lineStrong}; color:#fff; }
        .cvd-si-no[data-on="true"] { border-color:${OK}; background:${OK}1c; color:#fff; }
        .cvd-si-no:disabled { cursor:default; opacity:.55; }

        .cvd-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .cvd-btn:hover:not(:disabled) { border-color:${T.lineStrong}; }
        .cvd-btn:disabled { opacity:.45; cursor:default; }
        .cvd-btn[data-primary="true"] { background:${accent}; color:#04121f; border-color:${accent}; }
        .cvd-divider { height:1px; background:${T.line}; margin:16px 0; }
        @media (prefers-reduced-motion: reduce){ .cvd-opt[data-mal="true"] { animation:none; } }

        /* Cajón de teoría */
        .cvd-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .cvd-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .cvd-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .cvd-drawer[data-open="true"] { transform:translateX(0); }
        .cvd-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .cvd-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .cvd-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .cvd-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .cvd-teoria-fab { position:fixed; right:20px; bottom:20px; z-index:58; cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.86); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .cvd-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
        @media (max-width: 640px){ .cvd-teoria-fab { right:12px; bottom:12px; padding:10px 13px; font-size:12px; } }
        @media (max-width: 900px){ .cvd-grid { grid-template-columns:minmax(0,1fr) !important; } }
      `}</style>

      {/* ── barra de modos y herramientas ───────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap", marginBottom: 18 }}>
        {MODOS.map((m) => (
          <button key={m.id} className="cvd-tab" data-on={modo === m.id} onClick={() => setModo(m.id)}>
            <i className={`fa-solid ${m.icono}`} />
            {m.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
        <button className="cvd-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría de la práctica">
          <i className="fa-solid fa-book-open" />
        </button>
        <button className="cvd-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
          <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
        </button>
        <button className="cvd-icobtn" onClick={resetActual} title="Reiniciar este modo">
          <i className="fa-solid fa-rotate-left" />
        </button>
      </div>

      {/* ── cajón de teoría ─────────────────────────────────────────────── */}
      <button className="cvd-teoria-fab" onClick={() => setDrawer(true)}>
        <i className="fa-solid fa-book-open" />
        Teoría
      </button>
      <div className="cvd-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="cvd-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="cvd-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="cvd-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="cvd-drawer-body">
          <FichaTeorica data={CONVIVENCIA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>

      <div className="cvd-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,28vw,400px)", gap: 22, alignItems: "start" }}>
        {/* ── columna principal ─────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {/* MODO 1 — la misma frase, otro efecto */}
          {modo === "canal" && (
            <>
              <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                {ENCARGOS.map((e, i) => (
                  <button
                    key={e.id}
                    className="cvd-doc"
                    data-on={encIdx === i}
                    data-done={enviados[e.id] === true}
                    onClick={() => {
                      setEncIdx(i);
                      setVeredictoEnv(null);
                    }}
                  >
                    <i className={`fa-solid ${enviados[e.id] === true ? "fa-circle-check" : e.icono}`} />
                    {e.titulo}
                  </button>
                ))}
                <span style={{ fontSize: 12.5, fontWeight: 800, color: canalDone ? OK : T.text3, alignSelf: "center" }}>
                  {ENCARGOS.filter((e) => enviados[e.id]).length}/{ENCARGOS.length}
                </span>
              </div>

              <div style={{ ...card, padding: "18px 22px" }}>
                <Eyebrow>
                  <i className="fa-solid fa-circle-info" style={{ marginRight: 8, color: accent }} />
                  La situación
                </Eyebrow>
                <div style={{ fontSize: 13.5, color: T.text2, lineHeight: 1.6 }}>{encargo.situacion}</div>
                <div
                  style={{
                    marginTop: 13,
                    borderRadius: 12,
                    border: `1px solid rgba(${color.rgba},0.32)`,
                    background: `rgba(${color.rgba},0.09)`,
                    padding: "11px 14px",
                    fontSize: 13,
                    color: T.text,
                    lineHeight: 1.55,
                    display: "flex",
                    gap: 11,
                  }}
                >
                  <i className="fa-solid fa-bullseye" style={{ color: accent, marginTop: 3 }} />
                  <span>{encargo.pide}</span>
                </div>
              </div>

              {/* los tres controles */}
              <div style={{ ...card, padding: "18px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <Eyebrow>1 · ¿Dónde lo mandas?</Eyebrow>
                  <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                    {CANALES.map((c) => {
                      const on = canal === c.id;
                      return (
                        <button
                          key={c.id}
                          className="cvd-dial"
                          data-on={on}
                          aria-pressed={on}
                          onClick={() => elegirCanal(c.id)}
                          style={on ? { borderColor: c.color, background: `${c.color}1f`, boxShadow: `0 0 18px -7px ${c.color}` } : undefined}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 900, color: on ? "#fff" : c.color }}>
                            <i className={`fa-solid ${c.icono}`} />
                            {c.titulo}
                          </div>
                          <div style={{ fontSize: 11.5, marginTop: 4, color: on ? T.text2 : T.text3 }}>{c.audiencia}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Eyebrow>2 · ¿Con qué tono lo escribes?</Eyebrow>
                  <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                    {TONOS.map((t) => {
                      const on = tono === t.id;
                      return (
                        <button
                          key={t.id}
                          className="cvd-dial"
                          data-on={on}
                          aria-pressed={on}
                          onClick={() => {
                            setTono(t.id);
                            setVeredictoEnv(null);
                          }}
                          style={on ? { borderColor: accent, background: `rgba(${color.rgba},0.17)` } : undefined}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 900, color: on ? "#fff" : T.text2 }}>
                            <i className={`fa-solid ${t.icono}`} />
                            {t.titulo}
                          </div>
                          <div style={{ fontSize: 11.5, marginTop: 4, color: T.text3 }}>{t.nota}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Eyebrow>3 · ¿Dices por qué escribes?</Eyebrow>
                  <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                    {CONTEXTOS.map((c) => {
                      const on = contexto === c.id;
                      return (
                        <button
                          key={c.id}
                          className="cvd-dial"
                          data-on={on}
                          aria-pressed={on}
                          onClick={() => {
                            setContexto(c.id);
                            setVeredictoEnv(null);
                          }}
                          style={on ? { borderColor: accent, background: `rgba(${color.rgba},0.17)` } : undefined}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 900, color: on ? "#fff" : T.text2 }}>
                            <i className={`fa-solid ${c.icono}`} />
                            {c.titulo}
                          </div>
                          <div style={{ fontSize: 11.5, marginTop: 4, color: T.text3 }}>{c.nota}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* la vista previa y el efecto */}
              <div style={{ ...card, padding: "20px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <i className={`fa-solid ${canalInfo.icono}`} style={{ color: canalInfo.color }} />
                  <span style={{ fontSize: 13.5, fontWeight: 900 }}>{canalInfo.titulo}</span>
                  <span style={{ fontSize: 11.5, color: T.text3 }}>· lo leen: {canalInfo.audiencia}</span>
                </div>

                <div className="cvd-burbuja">{mensaje}</div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 14 }}>
                  <div style={{ flex: "1 1 220px", borderRadius: 12, border: `1px solid ${T.line}`, background: T.inset, padding: "11px 14px" }}>
                    <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase", color: T.text3 }}>Cuánto dura</div>
                    <div style={{ fontSize: 12.5, color: T.text2, marginTop: 5, lineHeight: 1.5 }}>{canalInfo.permanencia}</div>
                  </div>
                  <div
                    style={{
                      flex: "1 1 260px",
                      borderRadius: 12,
                      border: `1px solid ${COLOR_RIESGO[lectura.riesgo] ?? T.line}55`,
                      background: `${COLOR_RIESGO[lectura.riesgo] ?? "#ffffff"}10`,
                      padding: "11px 14px",
                    }}
                  >
                    <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase", color: T.text3 }}>Cómo puede leerse</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: COLOR_RIESGO[lectura.riesgo] ?? "#fff", marginTop: 5 }}>{lectura.titulo}</div>
                    <div style={{ fontSize: 12.5, color: T.text2, marginTop: 5, lineHeight: 1.5 }}>{lectura.detalle}</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16, alignItems: "center" }}>
                  <button className="cvd-btn" data-primary={!encargoOk} onClick={enviar} disabled={encargoOk}>
                    <i className="fa-solid fa-paper-plane" />
                    {encargoOk ? "Encargo resuelto" : "Enviar así"}
                  </button>
                  {encIdx < ENCARGOS.length - 1 && (
                    <button
                      className="cvd-btn"
                      onClick={() => {
                        setEncIdx((i) => Math.min(i + 1, ENCARGOS.length - 1));
                        setVeredictoEnv(null);
                      }}
                    >
                      Siguiente encargo
                      <i className="fa-solid fa-arrow-right" />
                    </button>
                  )}
                </div>

                {encargoOk && (
                  <div style={{ marginTop: 15, borderRadius: 13, border: `1px solid ${OK}55`, background: `${OK}12`, padding: "13px 16px", display: "flex", gap: 12 }}>
                    <i className="fa-solid fa-circle-check" style={{ color: OK, fontSize: 16, marginTop: 2 }} />
                    <span style={{ fontSize: 13, color: T.text2, lineHeight: 1.6 }}>{encargo.porque}</span>
                  </div>
                )}
                {!encargoOk && veredictoEnv && (
                  <div style={{ marginTop: 15, borderRadius: 13, border: `1px solid ${NO}55`, background: `${NO}12`, padding: "13px 16px", display: "flex", gap: 12 }}>
                    <i className="fa-solid fa-circle-xmark" style={{ color: NO, fontSize: 16, marginTop: 2 }} />
                    <span style={{ fontSize: 13, color: T.text2, lineHeight: 1.6 }}>{veredictoEnv}</span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* MODO 2 — huella e identidad */}
          {modo === "perfil" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <Eyebrow>
                  <i className="fa-solid fa-gauge" style={{ marginRight: 8, color: accent }} />
                  Cierra la puerta sin apagar la luz
                </Eyebrow>
                <div style={{ fontSize: 12.5, color: T.text3, lineHeight: 1.55, marginBottom: 15 }}>
                  Baja la <strong style={{ color: T.text }}>exposición</strong> a {META_EXPOSICION} o menos sin que la{" "}
                  <strong style={{ color: T.text }}>presencia</strong> caiga por debajo de {META_PRESENCIA}. Borrarlo todo también suspende: desaparecer no es
                  cuidarse.
                </div>

                <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
                  <div style={{ flex: "1 1 220px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 800, marginBottom: 6 }}>
                      <span style={{ color: T.text2 }}>Exposición</span>
                      <span style={{ color: exposicion <= META_EXPOSICION ? OK : NO, fontVariantNumeric: "tabular-nums" }}>
                        {exposicion} <span style={{ color: T.text3, fontWeight: 600 }}>/ meta ≤ {META_EXPOSICION}</span>
                      </span>
                    </div>
                    <div className="cvd-barra">
                      <span style={{ width: `${Math.min(100, (exposicion / 15) * 100)}%`, background: exposicion <= META_EXPOSICION ? OK : NO }} />
                    </div>
                    <div style={{ fontSize: 11.5, color: T.text3, marginTop: 6 }}>Lo que se puede deducir de ti sin que lo hayas escrito.</div>
                  </div>
                  <div style={{ flex: "1 1 220px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 800, marginBottom: 6 }}>
                      <span style={{ color: T.text2 }}>Presencia</span>
                      <span style={{ color: presencia >= META_PRESENCIA ? OK : NO, fontVariantNumeric: "tabular-nums" }}>
                        {presencia} <span style={{ color: T.text3, fontWeight: 600 }}>/ meta ≥ {META_PRESENCIA}</span>
                      </span>
                    </div>
                    <div className="cvd-barra">
                      <span style={{ width: `${Math.min(100, (presencia / 13) * 100)}%`, background: presencia >= META_PRESENCIA ? OK : accent }} />
                    </div>
                    <div style={{ fontSize: 11.5, color: T.text3, marginTop: 6 }}>Cuánto sigues estando para la gente que sí te importa.</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16, alignItems: "center" }}>
                  <button className="cvd-btn" data-primary={!perfilLogrado} onClick={comprobarPerfil} disabled={perfilLogrado}>
                    <i className="fa-solid fa-shield-halved" />
                    {perfilLogrado ? "Perfil en orden" : "Comprobar el perfil"}
                  </button>
                  <span style={{ fontSize: 12, color: T.text3 }}>
                    {PERFIL.filter((el) => tocados[el.id]).length}/{PERFIL.length} elementos revisados
                  </span>
                </div>

                {perfilLogrado && (
                  <div style={{ marginTop: 14, borderRadius: 13, border: `1px solid ${OK}55`, background: `${OK}12`, padding: "13px 16px", display: "flex", gap: 12 }}>
                    <i className="fa-solid fa-circle-check" style={{ color: OK, fontSize: 16, marginTop: 2 }} />
                    <span style={{ fontSize: 13, color: T.text2, lineHeight: 1.6 }}>
                      Eso es cerrar sin desaparecer: el perfil sigue siendo tuyo y reconocible, y ya no regala tu escuela, tu horario ni dónde estás. Fíjate en
                      que casi ninguna de las opciones que sirvieron era «quitarlo todo».
                    </span>
                  </div>
                )}
                {!perfilLogrado && veredictoPerfil && (
                  <div style={{ marginTop: 14, borderRadius: 13, border: `1px solid ${NO}55`, background: `${NO}12`, padding: "13px 16px", display: "flex", gap: 12 }}>
                    <i className="fa-solid fa-circle-xmark" style={{ color: NO, fontSize: 16, marginTop: 2 }} />
                    <span style={{ fontSize: 13, color: T.text2, lineHeight: 1.6 }}>{veredictoPerfil}</span>
                  </div>
                )}
              </div>

              {PERFIL.map((el) => {
                const sel = opcionDe(el.id);
                return (
                  <div key={el.id} style={{ ...card, padding: "16px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <i className={`fa-solid ${el.icono}`} style={{ color: accent, fontSize: 15 }} />
                      <span style={{ fontSize: 14.5, fontWeight: 900 }}>{el.titulo}</span>
                    </div>
                    <div style={{ fontSize: 12.5, color: T.text3, marginTop: 5, lineHeight: 1.5 }}>{el.detalle}</div>
                    <div
                      style={{
                        marginTop: 10,
                        borderRadius: 11,
                        border: `1px solid ${T.line}`,
                        background: T.inset,
                        padding: "9px 13px",
                        fontSize: 12.5,
                        color: T.text2,
                        lineHeight: 1.5,
                        display: "flex",
                        gap: 10,
                      }}
                    >
                      <i className="fa-solid fa-eye" style={{ color: "#FBBF24", marginTop: 3, fontSize: 12 }} />
                      <span>
                        <strong style={{ color: "#fff" }}>Revela: </strong>
                        {el.revela}
                      </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: 9, marginTop: 12 }}>
                      {el.opciones.map((o) => (
                        <button key={o.id} className="cvd-opt" data-on={elec[el.id] === o.id} onClick={() => elegirOpcion(el.id, o.id)}>
                          {o.label}
                        </button>
                      ))}
                    </div>

                    {sel && (
                      <div style={{ marginTop: 11, display: "flex", gap: 10, fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
                        <i className="fa-solid fa-arrow-turn-down" style={{ color: accent, marginTop: 3, fontSize: 11 }} />
                        <span>{sel.efecto}</span>
                      </div>
                    )}
                  </div>
                );
              })}

              <div
                style={{
                  borderRadius: 16,
                  border: `1px solid ${NO}44`,
                  background: `${NO}0e`,
                  padding: "14px 18px",
                  fontSize: 12.5,
                  color: T.text2,
                  lineHeight: 1.6,
                  display: "flex",
                  gap: 12,
                }}
              >
                <i className="fa-solid fa-triangle-exclamation" style={{ color: NO, fontSize: 15, marginTop: 2 }} />
                <span>{AVISO_PERFIL}</span>
              </div>
            </>
          )}

          {/* MODO 3 — escalar o no escalar */}
          {modo === "escalar" && (
            <>
              <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                {CASOS.map((c, i) => (
                  <button
                    key={c.id}
                    className="cvd-doc"
                    data-on={casoIdx === i}
                    data-done={accOk[c.id] === true}
                    onClick={() => {
                      setCasoIdx(i);
                      setFalloSenal(null);
                    }}
                  >
                    <i className={`fa-solid ${accOk[c.id] === true ? "fa-circle-check" : c.icono}`} />
                    {c.titulo}
                  </button>
                ))}
                <span style={{ fontSize: 12.5, fontWeight: 800, color: accionesDone ? OK : T.text3, alignSelf: "center" }}>
                  {CASOS.filter((c) => accOk[c.id]).length}/{CASOS.length}
                </span>
              </div>

              <div style={{ ...card, padding: "20px 22px" }}>
                <Eyebrow>
                  <i className="fa-solid fa-file-lines" style={{ marginRight: 8, color: accent }} />
                  El caso
                </Eyebrow>
                <div style={{ fontSize: 14, color: T.text, lineHeight: 1.7 }}>{caso.relato}</div>
              </div>

              {/* paso 1 — las tres señales */}
              <div style={{ ...card, padding: "20px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                  <Eyebrow>Paso 1 · Lee la situación con las tres señales</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: senalesOk ? OK : T.text3 }}>
                    {SENALES.filter((s) => respDelCaso[s.id] !== undefined).length}/{SENALES.length}
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: T.text3, lineHeight: 1.55, marginBottom: 14 }}>
                  Tres señales de tres es ciberacoso; dos, un conflicto que puede escalar; una o ninguna, una molestia. No lo decide lo fuerte que suene la
                  frase: lo deciden la repetición y el desequilibrio.
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                  {SENALES.map((s) => {
                    const resuelta = respDelCaso[s.id] !== undefined;
                    const valor = caso.senales[s.id];
                    return (
                      <div
                        key={s.id}
                        style={{
                          borderRadius: 13,
                          border: `1px solid ${resuelta ? `${OK}55` : T.line}`,
                          background: resuelta ? `${OK}0e` : T.glass,
                          padding: "12px 15px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 11, flexWrap: "wrap" }}>
                          <i className={`fa-solid ${s.icono}`} style={{ color: resuelta ? OK : accent, fontSize: 14 }} />
                          <span style={{ fontSize: 13.5, fontWeight: 800, flex: 1, minWidth: 160 }}>{s.pregunta}</span>
                          <button className="cvd-si-no" data-on={resuelta && valor} disabled={resuelta} onClick={() => responderSenal(s.id, true)}>
                            Sí
                          </button>
                          <button className="cvd-si-no" data-on={resuelta && !valor} disabled={resuelta} onClick={() => responderSenal(s.id, false)}>
                            No
                          </button>
                        </div>
                        {resuelta && (
                          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55, marginTop: 9, display: "flex", gap: 10 }}>
                            <i className="fa-solid fa-circle-check" style={{ color: OK, marginTop: 3, fontSize: 11 }} />
                            <span>{caso.porqueSenal[s.id]}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {falloSenal && !senalesOk && (
                  <div style={{ marginTop: 14, borderRadius: 13, border: `1px solid ${NO}55`, background: `${NO}12`, padding: "12px 15px", display: "flex", gap: 12 }}>
                    <i className="fa-solid fa-circle-xmark" style={{ color: NO, fontSize: 15, marginTop: 2 }} />
                    <span style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{falloSenal}</span>
                  </div>
                )}

                {senalesOk && nivelActual && (
                  <div
                    style={{
                      marginTop: 15,
                      borderRadius: 14,
                      border: `1px solid ${NIVELES[nivelActual].color}66`,
                      background: `${NIVELES[nivelActual].color}12`,
                      padding: "14px 17px",
                      animation: "cvdPop .25s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <i className={`fa-solid ${NIVELES[nivelActual].icono}`} style={{ color: NIVELES[nivelActual].color, fontSize: 16 }} />
                      <span style={{ fontSize: 14.5, fontWeight: 900, color: "#fff" }}>{NIVELES[nivelActual].titulo}</span>
                      <span style={{ fontSize: 11.5, color: T.text3 }}>
                        · {SENALES.filter((s) => caso.senales[s.id]).length} de 3 señales
                      </span>
                    </div>
                    <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.6, marginTop: 8 }}>{NIVELES[nivelActual].descripcion}</div>
                    <div style={{ fontSize: 12.5, color: T.text, lineHeight: 1.6, marginTop: 9, fontWeight: 600 }}>{caso.nota}</div>
                  </div>
                )}
              </div>

              {/* paso 2 — la respuesta proporcional */}
              <div style={{ ...card, padding: "20px 22px", opacity: senalesOk ? 1 : 0.55 }}>
                <Eyebrow>Paso 2 · Elige la respuesta proporcional</Eyebrow>
                {!senalesOk ? (
                  <div style={{ fontSize: 13, color: T.text3, lineHeight: 1.55 }}>
                    Primero lee la situación con las tres señales. La respuesta correcta depende de la gravedad, así que no se puede elegir antes de medirla.
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 12.5, color: T.text3, lineHeight: 1.55, marginBottom: 13 }}>
                      Marca TODAS las acciones que corresponden a este caso, ni una más. Quedarse corto deja el problema, y pasarse convierte un roce en un
                      expediente.
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px,1fr))", gap: 9 }}>
                      {ACCIONES.map((a) => {
                        const marcada = selDelCaso.includes(a.id);
                        const esCorrecta = caso.correctas.includes(a.id);
                        const revelada = casoResuelto || (verDelCaso !== undefined && (verDelCaso.faltan.includes(a.id) || verDelCaso.sobran.includes(a.id)));
                        return (
                          <button
                            key={a.id}
                            className="cvd-acc"
                            data-on={marcada && !revelada}
                            data-bien={revelada && esCorrecta}
                            data-mal={revelada && !esCorrecta}
                            disabled={casoResuelto}
                            onClick={() => alternarAccion(a.id)}
                          >
                            <i
                              className={`fa-solid ${revelada ? (esCorrecta ? "fa-circle-check" : "fa-circle-xmark") : marcada ? "fa-square-check" : a.icono}`}
                              style={{ fontSize: 13, flexShrink: 0 }}
                            />
                            <span>{a.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 15, alignItems: "center" }}>
                      <button className="cvd-btn" data-primary={!casoResuelto} onClick={comprobarAcciones} disabled={casoResuelto}>
                        <i className="fa-solid fa-scale-balanced" />
                        {casoResuelto ? "Respuesta correcta" : "Comprobar la respuesta"}
                      </button>
                      {casoIdx < CASOS.length - 1 && (
                        <button
                          className="cvd-btn"
                          onClick={() => {
                            setCasoIdx((i) => Math.min(i + 1, CASOS.length - 1));
                            setFalloSenal(null);
                          }}
                        >
                          Siguiente caso
                          <i className="fa-solid fa-arrow-right" />
                        </button>
                      )}
                    </div>

                    {casoResuelto && (
                      <div style={{ marginTop: 15, display: "flex", flexDirection: "column", gap: 10 }}>
                        {caso.correctas.map((id) => {
                          const a = ACCIONES.find((x) => x.id === id);
                          if (!a) return null;
                          return (
                            <div key={id} style={{ borderRadius: 12, border: `1px solid ${OK}44`, background: `${OK}0e`, padding: "11px 14px", display: "flex", gap: 11 }}>
                              <i className="fa-solid fa-circle-check" style={{ color: OK, marginTop: 3, fontSize: 12 }} />
                              <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
                                <strong style={{ color: "#fff" }}>{a.label}. </strong>
                                {caso.porque[id]}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {!casoResuelto && verDelCaso && (
                      <div style={{ marginTop: 15, display: "flex", flexDirection: "column", gap: 10 }}>
                        {caso.nivel === "acoso" && verDelCaso.faltan.includes("adulto") && (
                          <div style={{ borderRadius: 12, border: `1px solid ${NO}66`, background: `${NO}16`, padding: "12px 15px", display: "flex", gap: 11 }}>
                            <i className="fa-solid fa-user-shield" style={{ color: NO, marginTop: 3 }} />
                            <span style={{ fontSize: 12.5, color: T.text, lineHeight: 1.6, fontWeight: 600 }}>
                              Falta lo más importante: en un caso así, pedir ayuda a una persona adulta de confianza no es una opción de reserva, es parte de la
                              respuesta correcta. Nadie tiene que sostener esto solo.
                            </span>
                          </div>
                        )}
                        {verDelCaso.sobran.map((id) => {
                          const a = ACCIONES.find((x) => x.id === id);
                          if (!a) return null;
                          return (
                            <div key={`s-${id}`} style={{ borderRadius: 12, border: `1px solid ${NO}44`, background: `${NO}0e`, padding: "11px 14px", display: "flex", gap: 11 }}>
                              <i className="fa-solid fa-circle-xmark" style={{ color: NO, marginTop: 3, fontSize: 12 }} />
                              <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
                                <strong style={{ color: "#fff" }}>{a.label}: </strong>
                                {caso.porque[id]}
                              </div>
                            </div>
                          );
                        })}
                        {verDelCaso.faltan.length > 0 && (
                          <div style={{ borderRadius: 12, border: `1px solid ${T.lineStrong}`, background: T.inset, padding: "11px 14px", fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
                            <i className="fa-solid fa-circle-info" style={{ color: accent, marginRight: 9 }} />
                            Te {verDelCaso.faltan.length === 1 ? "falta 1 acción" : `faltan ${verDelCaso.faltan.length} acciones`} por marcar. Vuelve a leer el
                            caso y el nivel: ¿quién puede hacer algo que tú no puedes hacer solo?
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}

          {/* MODO 4 — reescribe para desescalar */}
          {modo === "reescribir" && (
            <>
              <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                {REESCRITURAS.map((m, i) => {
                  const listo = m.movimientos.every((mv) => elecMov[claveMov(m.id, mv.id)] !== undefined);
                  return (
                    <button
                      key={m.id}
                      className="cvd-doc"
                      data-on={msgIdx === i}
                      data-done={listo}
                      onClick={() => {
                        setMsgIdx(i);
                        setFalloMov(null);
                      }}
                    >
                      <i className={`fa-solid ${listo ? "fa-circle-check" : m.icono}`} />
                      {m.titulo}
                    </button>
                  );
                })}
              </div>

              <div style={{ ...card, padding: "20px 22px" }}>
                <Eyebrow>
                  <i className="fa-solid fa-fire" style={{ marginRight: 8, color: NO }} />
                  Lo que escribiste y no has enviado
                </Eyebrow>
                <div style={{ fontSize: 12.5, color: T.text3, lineHeight: 1.55, marginBottom: 12 }}>{mensajeH.contexto}</div>
                <div className="cvd-burbuja" data-tipo="hostil">
                  {mensajeH.hostil}
                </div>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 14 }}>
                  {(["agresiva", "sumisa", "firme"] as const).map((t) => (
                    <div key={t} style={{ flex: "1 1 200px", display: "flex", gap: 10, fontSize: 11.5, color: T.text3, lineHeight: 1.5 }}>
                      <i className={`fa-solid ${TIPO_RESP[t].icono}`} style={{ color: TIPO_RESP[t].color, marginTop: 3 }} />
                      <span>
                        <strong style={{ color: TIPO_RESP[t].color }}>{TIPO_RESP[t].titulo}. </strong>
                        {TIPO_RESP[t].descripcion}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {mensajeH.movimientos.map((mv, i) => {
                const clave = claveMov(mensajeH.id, mv.id);
                const elegida = elecMov[clave];
                const resuelto = elegida !== undefined;
                const opElegida = resuelto ? mv.opciones.find((o) => o.id === elegida) : undefined;
                return (
                  <div key={mv.id} style={{ ...card, padding: "16px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <span
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 8,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          fontWeight: 900,
                          background: resuelto ? `${OK}22` : T.inset,
                          color: resuelto ? OK : T.text3,
                          border: `1px solid ${resuelto ? `${OK}66` : T.line}`,
                        }}
                      >
                        {resuelto ? <i className="fa-solid fa-check" style={{ fontSize: 10 }} /> : i + 1}
                      </span>
                      <span style={{ fontSize: 13.5, fontWeight: 800 }}>{mv.pide}</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 11 }}>
                      {mv.opciones.map((o) => {
                        const esFallo = falloMov?.clave === clave && falloMov.porque === o.porque;
                        const mostrada = resuelto && o.tipo === "firme";
                        return (
                          <button
                            key={o.id}
                            className="cvd-opt"
                            data-bien={mostrada}
                            data-mal={esFallo}
                            disabled={resuelto}
                            onClick={() => elegirMovimiento(mv.id, o.id)}
                          >
                            «{o.texto}»
                            {resuelto && (
                              <span style={{ display: "block", marginTop: 6, fontSize: 11.5, fontWeight: 700, color: TIPO_RESP[o.tipo].color }}>
                                <i className={`fa-solid ${TIPO_RESP[o.tipo].icono}`} style={{ marginRight: 7 }} />
                                {TIPO_RESP[o.tipo].titulo}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {resuelto && opElegida && (
                      <div style={{ marginTop: 11, borderRadius: 12, border: `1px solid ${OK}44`, background: `${OK}0e`, padding: "11px 14px", display: "flex", gap: 11 }}>
                        <i className="fa-solid fa-circle-check" style={{ color: OK, marginTop: 3, fontSize: 12 }} />
                        <span style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{opElegida.porque}</span>
                      </div>
                    )}
                    {!resuelto && falloMov?.clave === clave && (
                      <div style={{ marginTop: 11, borderRadius: 12, border: `1px solid ${NO}44`, background: `${NO}0e`, padding: "11px 14px", display: "flex", gap: 11 }}>
                        <i className="fa-solid fa-circle-xmark" style={{ color: NO, marginTop: 3, fontSize: 12 }} />
                        <span style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
                          <strong style={{ color: "#fff" }}>Esa salida es {falloMov.tipo}. </strong>
                          {falloMov.porque}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}

              {msgListo && (
                <div style={{ ...card, padding: "20px 22px" }}>
                  <Eyebrow>
                    <i className="fa-solid fa-hand" style={{ marginRight: 8, color: OK }} />
                    El mismo mensaje, en firme
                  </Eyebrow>
                  <div className="cvd-burbuja" data-tipo="firme">
                    {mensajeH.movimientos
                      .map((mv) => mv.opciones.find((o) => o.id === elecMov[claveMov(mensajeH.id, mv.id)])?.texto ?? "")
                      .filter(Boolean)
                      .join(" ")}
                  </div>
                  <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.6, marginTop: 13, display: "flex", gap: 11 }}>
                    <i className="fa-solid fa-lightbulb" style={{ color: accent, marginTop: 3 }} />
                    <span>{mensajeH.cierre}</span>
                  </div>
                  {msgIdx < REESCRITURAS.length - 1 && (
                    <button
                      className="cvd-btn"
                      data-primary
                      style={{ marginTop: 14 }}
                      onClick={() => {
                        setMsgIdx((i) => Math.min(i + 1, REESCRITURAS.length - 1));
                        setFalloMov(null);
                      }}
                    >
                      Siguiente mensaje
                      <i className="fa-solid fa-arrow-right" />
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {/* MODO 5 — completa el texto (A6 verbatim) */}
          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={CONVIVENCIA_HUECOS}
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

          {/* MODO 6 — escribe el término (A5 verbatim) */}
          {modo === "glosario" && (
            <EscribeTermino
              key={glosarioIntento}
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
              {modo === "canal" && (
                <>
                  Antes de enviar, pregúntate <strong style={{ color: T.text }}>a quién le sirve leer esto</strong> y{" "}
                  <strong style={{ color: T.text }}>a quién puede dañar</strong>. No siempre gana lo privado: uno de los cuatro encargos sólo se resuelve
                  publicando abierto.
                </>
              )}
              {modo === "perfil" && (
                <>
                  Casi ningún elemento se arregla borrándolo. Busca la opción del medio: la que <strong style={{ color: T.text }}>conserva el contenido</strong>{" "}
                  y quita el dato del que se deduce dónde estás.
                </>
              )}
              {modo === "escalar" && (
                <>
                  Repetición, desequilibrio de poder e intención. Esas tres señales son lo que convierte una molestia en{" "}
                  <strong style={{ color: T.text }}>ciberacoso</strong>, y lo que decide si la respuesta es hablar o pedir ayuda.
                </>
              )}
              {modo === "reescribir" && (
                <>
                  <strong style={{ color: T.text }}>Firme</strong> no es un punto medio entre agresivo y sumiso: es otra cosa. Dice el hecho, el efecto y lo que
                  pides, sin insultar y sin retirar la petición.
                </>
              )}
              {modo === "texto" && (
                <>
                  Ya no se toca: se escribe. Si te atoras, el botón de pista te da la definición y el banco de palabras te deja tocar el término en vez de
                  teclearlo.
                </>
              )}
              {modo === "glosario" && (
                <>
                  Aquí se recuerda, no se reconoce: lees la definición y su ejemplo y escribes el término. Son los cuatro del glosario de la progresión.
                </>
              )}
            </span>
          </div>

          <div style={{ ...card, padding: "18px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-circle-question" style={{ marginRight: 8, color: accent }} />
              Preguntas para mirarte a ti
            </Eyebrow>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: T.text2, lineHeight: 1.6, display: "flex", flexDirection: "column", gap: 7 }}>
              {PISTAS_A3.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
              <li style={{ color: T.text, fontWeight: 600 }}>{PREGUNTA_A7}</li>
            </ul>
          </div>

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
            <span>{DATO_A1}</span>
          </div>
        </div>
      </div>

      {/* ── hechos (A4) y tarea de cierre (A5) ──────────────────────────── */}
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
            Para llevarte del laboratorio
          </Eyebrow>
          <div style={{ fontSize: 13.5, fontWeight: 800, color: T.text, lineHeight: 1.55, marginBottom: 12 }}>{TAREA_A5}</div>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.6 }}>
            Después de operar los cuatro modos ya tienes materia prima para escribirlas: una regla sobre <strong style={{ color: T.text }}>dónde</strong> se dice
            cada cosa (lo que es de dos no va al grupo), una sobre <strong style={{ color: T.text }}>cómo</strong> se dice (sin mayúsculas ni burla, y con el
            motivo por delante) y una sobre <strong style={{ color: T.text }}>qué hace el grupo</strong> cuando algo se repite: no reenviar, avisar, y acompañar
            a quien lo está recibiendo.
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
        mensajeAprobado="Distingues el respeto de la etiqueta: sabes leer lo que un mensaje hace, no solo lo que dice."
      />

      {/* ── nota al pie ─────────────────────────────────────────────────── */}
      <div style={{ marginTop: 18, display: "flex", gap: 12, fontSize: 11.5, color: T.text3, lineHeight: 1.6 }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          Son <strong>verbatim</strong> de la progresión CD-I-P07: la lectura y el recuadro de A1 (incluida la cifra de la ENDUTIH que ahí se cita), el quiz
          evaluable de A2, las preguntas de A3, los hechos de A4, el glosario y la tarea final de A5, el texto con huecos de A6 y la pregunta de cierre de A7.
          Los <strong>cuatro encargos de mensajería</strong>, el <strong>perfil</strong> que se cierra, los <strong>cuatro casos</strong> y los{" "}
          <strong>tres mensajes</strong> que se reescriben los escribí para esta práctica: son <strong>ilustrativos</strong>, igual que los medidores de
          exposición y presencia, que son un modelo para comparar decisiones y no una medida real. Las personas, cuentas y escuelas son ficticias a propósito,
          para no atribuir a nadie real una conducta que no tuvo. Las tres señales del modo «Escalar o no escalar» —repetición, desequilibrio de poder e
          intención de dañar— son los criterios con los que se define el acoso escolar y el ciberacoso en la literatura educativa. Si algo de lo que ves aquí
          te está pasando, no es tu culpa y no tienes que resolverlo solo: habla con una persona adulta de confianza. Fuente: {FUENTE}
        </span>
      </div>
    </div>
  );
}
