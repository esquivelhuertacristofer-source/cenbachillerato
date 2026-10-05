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
import { LabShell, Bloque, BotonHerramienta } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { CONVIVENCIA_HUECOS } from "./convivencia-digital-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
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
import { VinetaTermino } from "./_vineta";
import {
  ESCENAS_CHAT,
  CLIMA_INICIAL,
  GRUPO_TOTAL,
  META_CLIMA,
  META_ALCANCE,
  NOMBRE_GRUPO,
  COLOR_PERSONA,
  carasClima,
  type MsgChat,
  type OpcionChat,
} from "./convivencia-digital-chat";

const NO = "#FF5E5E";
const RETO_KEY = "cen-convivencia-digital-reto";
const RUTA_SIM = "/media/labs-sim/convivencia-digital";

type Modo = "chat" | "canal" | "perfil" | "escalar" | "reescribir" | "texto" | "glosario";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "chat", label: "El grupo del salón", icono: "fa-comments" },
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
  const [modo, setModo] = useState<Modo>("chat");

  /* ── sonido y partida ─────────────────────────────────────────────────── */
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

  /* ── MODO 0 · el grupo del salón (simulador) ──────────────────────────── */
  const [chatIdx, setChatIdx] = useState(0);
  const [chatElec, setChatElec] = useState<Record<string, string>>({});
  const chatRef = useRef<HTMLDivElement | null>(null);
  const escChat = ESCENAS_CHAT[chatIdx]!;
  const opcionChat = escChat.opciones.find((o) => o.id === chatElec[escChat.id]);
  let clima = CLIMA_INICIAL;
  let alcanceRaw = 0;
  const logChat: (MsgChat & { yo?: boolean; priv?: string })[] = [];
  for (let i = 0; i <= chatIdx; i++) {
    const e = ESCENAS_CHAT[i]!;
    alcanceRaw += e.alcanceBase;
    logChat.push(...e.entrada);
    const o = e.opciones.find((x) => x.id === chatElec[e.id]);
    if (o) {
      clima = Math.max(0, Math.min(100, clima + o.clima));
      alcanceRaw = Math.max(0, alcanceRaw + o.alcance);
      logChat.push({ quien: "Tú", texto: o.envio, hora: "", yo: true, priv: o.privadoA });
      logChat.push(...o.respuesta.map((m) => (o.privadoA && !m.sistema ? { ...m, priv: o.privadoA } : m)));
    }
  }
  const alcanceChat = Math.min(GRUPO_TOTAL, alcanceRaw);
  const cara = carasClima(clima);
  const chatDone = ESCENAS_CHAT.every((e) => chatElec[e.id] !== undefined);
  const chatLogrado = chatDone && clima >= META_CLIMA && alcanceChat <= META_ALCANCE;

  useEffect(() => {
    const el = chatRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logChat.length]);

  const elegirChat = (o: OpcionChat) => {
    if (chatElec[escChat.id]) return;
    setChatElec((m) => ({ ...m, [escChat.id]: o.id }));
    if (o.clima >= 8) {
      sfxPlace();
      sfxOk();
    } else if (o.clima < 0) sfxNo();
  };
  const resetChat = () => {
    setChatElec({});
    setChatIdx(0);
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
    { txt: `Lleva el clima del grupo a ${META_CLIMA} o más en las ${ESCENAS_CHAT.length} escenas`, done: chatDone && clima >= META_CLIMA },
    { txt: `Que el contenido dañino lo vean ${META_ALCANCE} personas o menos`, done: chatDone && alcanceChat <= META_ALCANCE },
    { txt: `Resuelve los ${ENCARGOS.length} encargos de mensajería`, done: canalDone },
    { txt: "Compara el efecto en los cuatro canales", done: canalesProbados >= CANALES.length },
    { txt: `Revisa los ${PERFIL.length} elementos del perfil`, done: perfilRevisado },
    { txt: `Baja la exposición a ${META_EXPOSICION} sin perder presencia`, done: perfilDone },
    { txt: `Lee las tres señales en los ${CASOS.length} casos`, done: senalesDone },
    { txt: `Elige la respuesta proporcional en los ${CASOS.length} casos`, done: accionesDone },
    { txt: `Reescribe en firme los ${REESCRITURAS.length} mensajes`, done: reescribirDone },
    { txt: "Completa el texto con los cuatro términos", done: textoDone, modo: "texto" },
    { txt: `Escribe los ${PARES.length} términos del glosario`, done: glosarioDone, modo: "glosario" },
    { txt: "Aprueba el reto evaluable", done: quizAprobado },
    { txt: "Termina con 2 errores o menos", done: todoHecho && partida.errores <= 2 },
  ];

  const resetActual =
    modo === "chat"
      ? resetChat
      : modo === "canal"
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

  const lecturaVivo =
    modo === "chat"
      ? `Clima ${clima}/100 · lo vieron ${alcanceChat}/${GRUPO_TOTAL}`
      : modo === "canal"
        ? `Encargos ${ENCARGOS.filter((e) => enviados[e.id]).length}/${ENCARGOS.length} · canales probados ${canalesProbados}/${CANALES.length}`
        : modo === "perfil"
          ? `Exposición ${exposicion} · presencia ${presencia}`
          : modo === "escalar"
            ? `Casos resueltos ${CASOS.filter((c) => accOk[c.id]).length}/${CASOS.length}`
            : modo === "reescribir"
              ? `Mensajes en firme ${REESCRITURAS.filter((m) => m.movimientos.every((mv) => elecMov[claveMov(m.id, mv.id)] !== undefined)).length}/${REESCRITURAS.length}`
              : "Repaso de los términos de la progresión";

  const nivelActual = senalesOk ? nivelPor(SENALES.map((s) => caso.senales[s.id])) : null;
  const verDelCaso = verAcc[caso.id];

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
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar este modo" onClick={resetActual} />
        </>
      }
      lectura={lecturaVivo}
      objetivos={objetivos}
      escena={
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
      <style>{`
        @keyframes cvdShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-5px);} 40%{transform:translateX(5px);} 60%{transform:translateX(-3px);} 80%{transform:translateX(3px);} }
        @keyframes cvdPop { 0%{transform:scale(.7);opacity:0;} 100%{transform:scale(1);opacity:1;} }

        /* Selector de caso / encargo / mensaje */
        .cvd-doc { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:9px 14px; border-radius:10px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:800; transition:all .14s; }
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
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:700;
          line-height:1.45; transition:all .14s; }
        .cvd-opt:hover:not(:disabled) { border-color:${T.lineStrong}; background:rgba(255,255,255,0.07); color:#fff; }
        .cvd-opt:disabled { cursor:default; }
        .cvd-opt[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.17); color:#fff; }
        .cvd-opt[data-bien="true"] { border-color:${OK}; background:${OK}16; color:#fff; }
        .cvd-opt[data-mal="true"] { border-color:${NO}; background:${NO}14; animation:cvdShake .4s; }

        .cvd-acc { cursor:pointer; display:flex; align-items:center; gap:10px; text-align:left; padding:10px 13px; border-radius:11px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:700; line-height:1.4; transition:all .14s; }
        .cvd-acc:hover:not(:disabled) { border-color:${T.lineStrong}; color:#fff; }
        .cvd-acc[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.18); color:#fff; }
        .cvd-acc[data-bien="true"] { border-color:${OK}; background:${OK}16; color:#fff; }
        .cvd-acc[data-mal="true"] { border-color:${NO}; background:${NO}16; color:#fff; }
        .cvd-acc:disabled { cursor:default; }

        .cvd-si-no { cursor:pointer; padding:7px 16px; border-radius:10px; border:1.5px solid ${T.line};
          background:${T.inset}; color:${T.text2}; font-size:14px; font-weight:800; transition:all .14s; }
        .cvd-si-no:hover:not(:disabled) { border-color:${T.lineStrong}; color:#fff; }
        .cvd-si-no[data-on="true"] { border-color:${OK}; background:${OK}1c; color:#fff; }
        .cvd-si-no:disabled { cursor:default; opacity:.55; }

        .cvd-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; }
        .cvd-btn:hover:not(:disabled) { border-color:${T.lineStrong}; }
        .cvd-btn:disabled { opacity:.45; cursor:default; }
        .cvd-btn[data-primary="true"] { background:${accent}; color:#04121f; border-color:${accent}; }
        .cvd-divider { height:1px; background:${T.line}; margin:16px 0; }
        @media (prefers-reduced-motion: reduce){ .cvd-opt[data-mal="true"] { animation:none; } }

        .cvd-medidores { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%,240px), 1fr)); gap:12px; }
        .cvd-medidor { display:flex; flex-direction:column; gap:7px; padding:12px 14px; border-radius:14px; border:1px solid ${T.line}; background:${T.glass}; }
        .cvd-chat { border-radius:16px; border:1px solid ${T.lineStrong}; background:${T.inset}; overflow:hidden; }
        .cvd-chat-cab { display:flex; align-items:center; gap:12px; padding:10px 14px; border-bottom:1px solid ${T.line}; background:${T.glass}; }
        .cvd-avatar-grupo { width:56px; height:40px; border-radius:10px; flex-shrink:0; }
        .cvd-chat-cuerpo { display:flex; flex-direction:column; gap:10px; padding:14px; max-height:min(46vh,420px); overflow-y:auto; }
        .cvd-msg { display:flex; align-items:flex-end; gap:9px; max-width:92%; animation:cvdPop .22s ease; }
        .cvd-msg[data-yo="true"] { align-self:flex-end; flex-direction:row-reverse; }
        .cvd-av { width:30px; height:30px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:900; color:#06121f; }
        .cvd-globo { min-width:0; display:flex; flex-direction:column; gap:4px; padding:9px 12px; border-radius:14px 14px 14px 4px; background:${T.glassSoft}; border:1px solid ${T.line}; }
        .cvd-msg[data-yo="true"] .cvd-globo { border-radius:14px 14px 4px 14px; background:rgba(${color.rgba},0.18); border-color:${accent}66; }
        .cvd-msg[data-priv="true"] .cvd-globo { border-style:dashed; border-color:${accent}; }
        .cvd-sis { align-self:center; text-align:center; font-size:14px; color:${T.text3}; font-style:italic; padding:2px 10px; }
        .cvd-foto { position:relative; display:flex; align-items:center; justify-content:center; overflow:hidden; color:rgba(255,255,255,0.35); font-size:22px; background:linear-gradient(135deg,#1e3a5f,#312e81); }
        .cvd-foto img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
        .cvd-foto-msg { width:100%; max-width:260px; aspect-ratio:1/1; border-radius:10px; }
        @media (prefers-reduced-motion: reduce){ .cvd-msg { animation:none; } }
      `}</style>
          {/* MODO 0 — el grupo del salón (simulador) */}
          {modo === "chat" && (
            <>
              <div className="cvd-medidores">
                <div className="cvd-medidor">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 800 }}>
                    <span style={{ color: T.text2 }}>Clima del grupo</span>
                    <span style={{ color: cara.color }}>
                      {cara.emoji} {clima}/100
                    </span>
                  </div>
                  <div className="cvd-barra">
                    <span style={{ width: `${clima}%`, background: cara.color }} />
                  </div>
                  <div style={{ fontSize: 14, color: T.text3 }}>
                    {cara.texto} · meta {META_CLIMA}
                  </div>
                </div>
                <div className="cvd-medidor">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 800 }}>
                    <span style={{ color: T.text2 }}>Lo vieron</span>
                    <span style={{ color: alcanceChat <= META_ALCANCE ? OK : NO }}>
                      {alcanceChat}/{GRUPO_TOTAL}
                    </span>
                  </div>
                  <div className="cvd-barra">
                    <span style={{ width: `${(alcanceChat / GRUPO_TOTAL) * 100}%`, background: alcanceChat <= META_ALCANCE ? OK : NO }} />
                  </div>
                  <div style={{ fontSize: 14, color: T.text3 }}>Simulación · meta {META_ALCANCE} o menos</div>
                </div>
              </div>

              <div className="cvd-chat">
                <div className="cvd-chat-cab">
                  <Foto clave="grupo-salon" icono="fa-users" alt="Un salón de clases con pupitres y celulares sobre las mesas" className="cvd-avatar-grupo" />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 900, color: "#fff" }}>{NOMBRE_GRUPO}</div>
                    <div style={{ fontSize: 14, color: T.text3 }}>Grupo ficticio · {GRUPO_TOTAL} integrantes</div>
                  </div>
                  <span style={{ marginLeft: "auto", fontSize: 14, fontWeight: 800, color: T.text3 }}>
                    Escena {chatIdx + 1}/{ESCENAS_CHAT.length}
                  </span>
                </div>
                <div className="cvd-chat-cuerpo" ref={chatRef}>
                  {logChat.map((m, i) =>
                    m.sistema ? (
                      <div key={i} className="cvd-sis">
                        {m.quien} {m.texto}
                      </div>
                    ) : (
                      <div key={i} className="cvd-msg" data-yo={m.yo === true} data-priv={m.priv !== undefined}>
                        {!m.yo && (
                          <span className="cvd-av" style={{ background: COLOR_PERSONA[m.quien] ?? "#94A3B8" }} aria-hidden>
                            {m.quien.startsWith("Cuenta") ? "?" : m.quien.charAt(0)}
                          </span>
                        )}
                        <div className="cvd-globo">
                          <div style={{ fontSize: 14, fontWeight: 800, color: COLOR_PERSONA[m.quien] ?? T.text2 }}>
                            {m.quien}
                            {m.priv !== undefined && (
                              <span style={{ color: T.text3, fontWeight: 700 }}>
                                {" "}
                                · privado {m.yo ? `a ${m.priv}` : "(el grupo no lo ve)"}
                              </span>
                            )}
                          </div>
                          {m.foto && <Foto clave={m.foto} icono="fa-image" alt="Foto compartida en el chat" className="cvd-foto-msg" />}
                          <div style={{ fontSize: 15, color: "#fff", lineHeight: 1.45, overflowWrap: "anywhere" }}>{m.texto}</div>
                          {m.hora && <div style={{ fontSize: 14, color: T.text3, textAlign: "right" }}>{m.hora}</div>}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {!opcionChat ? (
                <div style={{ ...card, padding: "16px 18px" }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 10 }}>
                    <i className="fa-solid fa-hand-pointer" style={{ color: accent, marginRight: 8 }} />
                    {escChat.titulo}: ¿qué haces?
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,240px),1fr))", gap: 10 }}>
                    {escChat.opciones.map((o) => (
                      <button key={o.id} className="cvd-acc" onClick={() => elegirChat(o)}>
                        <i className={`fa-solid ${o.icono}`} style={{ flexShrink: 0 }} />
                        <span>{o.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ ...card, padding: "16px 18px" }}>
                  <div
                    style={{
                      display: "flex",
                      gap: 11,
                      borderRadius: 12,
                      padding: "12px 14px",
                      border: `1px solid ${opcionChat.clima >= 0 ? OK : NO}55`,
                      background: `${opcionChat.clima >= 0 ? OK : NO}12`,
                    }}
                  >
                    <i className={`fa-solid ${opcionChat.clima >= 0 ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ color: opcionChat.clima >= 0 ? OK : NO, marginTop: 3 }} />
                    <span style={{ fontSize: 15, color: T.text2, lineHeight: 1.55 }}>
                      <strong style={{ color: "#fff" }}>
                        Clima {opcionChat.clima >= 0 ? "+" : ""}
                        {opcionChat.clima} · alcance {opcionChat.alcance >= 0 ? "+" : ""}
                        {opcionChat.alcance}.{" "}
                      </strong>
                      {opcionChat.porque}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
                    {chatIdx < ESCENAS_CHAT.length - 1 && (
                      <button className="cvd-btn" data-primary onClick={() => setChatIdx((i) => Math.min(i + 1, ESCENAS_CHAT.length - 1))}>
                        Siguiente escena
                        <i className="fa-solid fa-arrow-right" />
                      </button>
                    )}
                    <button className="cvd-btn" onClick={resetChat}>
                      <i className="fa-solid fa-rotate-left" />
                      Probar otro camino
                    </button>
                  </div>
                </div>
              )}

              {chatDone && (
                <div
                  style={{
                    borderRadius: 14,
                    padding: "14px 16px",
                    display: "flex",
                    gap: 12,
                    border: `1px solid ${chatLogrado ? OK : "#FBBF24"}66`,
                    background: `${chatLogrado ? OK : "#FBBF24"}12`,
                  }}
                >
                  <i className={`fa-solid ${chatLogrado ? "fa-trophy" : "fa-circle-half-stroke"}`} style={{ color: chatLogrado ? OK : "#FBBF24", marginTop: 3 }} />
                  <span style={{ fontSize: 15, color: T.text2, lineHeight: 1.55 }}>
                    <strong style={{ color: "#fff" }}>
                      Clima final {clima}/100 · lo vieron {alcanceChat} de {GRUPO_TOTAL}.{" "}
                    </strong>
                    {chatLogrado
                      ? "Cuidaste al grupo sin pelear: hablar en privado, cortar la cadena, guardar pruebas y pedir ayuda cambian el clima. Reír, reenviar o contestar igual lo empeoran."
                      : "El grupo quedó tenso o la burla llegó lejos. Prueba otro camino: ¿qué opción corta la cadena sin darle más público?"}
                  </span>
                </div>
              )}
            </>
          )}


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
                <span style={{ fontSize: 14, fontWeight: 800, color: canalDone ? OK : T.text3, alignSelf: "center" }}>
                  {ENCARGOS.filter((e) => enviados[e.id]).length}/{ENCARGOS.length}
                </span>
              </div>

              <div style={{ ...card, padding: "18px 22px" }}>
                <Eyebrow>
                  <i className="fa-solid fa-circle-info" style={{ marginRight: 8, color: accent }} />
                  La situación
                </Eyebrow>
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.6 }}>{encargo.situacion}</div>
                <div
                  style={{
                    marginTop: 13,
                    borderRadius: 12,
                    border: `1px solid rgba(${color.rgba},0.32)`,
                    background: `rgba(${color.rgba},0.09)`,
                    padding: "11px 14px",
                    fontSize: 14,
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
                          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 900, color: on ? "#fff" : c.color }}>
                            <i className={`fa-solid ${c.icono}`} />
                            {c.titulo}
                          </div>
                          <div style={{ fontSize: 14, marginTop: 4, color: on ? T.text2 : T.text3 }}>{c.audiencia}</div>
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
                          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 900, color: on ? "#fff" : T.text2 }}>
                            <i className={`fa-solid ${t.icono}`} />
                            {t.titulo}
                          </div>
                          <div style={{ fontSize: 14, marginTop: 4, color: T.text3 }}>{t.nota}</div>
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
                          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 900, color: on ? "#fff" : T.text2 }}>
                            <i className={`fa-solid ${c.icono}`} />
                            {c.titulo}
                          </div>
                          <div style={{ fontSize: 14, marginTop: 4, color: T.text3 }}>{c.nota}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* la vista previa y el efecto */}
              <div style={{ ...card, padding: "20px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <VinetaTermino termino={canalInfo.titulo} color={canalInfo.color} icono={canalInfo.icono} tam={29} radio={8} />
                  <span style={{ fontSize: 14, fontWeight: 900 }}>{canalInfo.titulo}</span>
                  <span style={{ fontSize: 14, color: T.text3 }}>· lo leen: {canalInfo.audiencia}</span>
                </div>

                <div className="cvd-burbuja">{mensaje}</div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 14 }}>
                  <div style={{ flex: "1 1 220px", borderRadius: 12, border: `1px solid ${T.line}`, background: T.inset, padding: "11px 14px" }}>
                    <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase", color: T.text3 }}>Cuánto dura</div>
                    <div style={{ fontSize: 14, color: T.text2, marginTop: 5, lineHeight: 1.5 }}>{canalInfo.permanencia}</div>
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
                    <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase", color: T.text3 }}>Cómo puede leerse</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: COLOR_RIESGO[lectura.riesgo] ?? "#fff", marginTop: 5 }}>{lectura.titulo}</div>
                    <div style={{ fontSize: 14, color: T.text2, marginTop: 5, lineHeight: 1.5 }}>{lectura.detalle}</div>
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
                    <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.6 }}>{encargo.porque}</span>
                  </div>
                )}
                {!encargoOk && veredictoEnv && (
                  <div style={{ marginTop: 15, borderRadius: 13, border: `1px solid ${NO}55`, background: `${NO}12`, padding: "13px 16px", display: "flex", gap: 12 }}>
                    <i className="fa-solid fa-circle-xmark" style={{ color: NO, fontSize: 16, marginTop: 2 }} />
                    <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.6 }}>{veredictoEnv}</span>
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
                <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.55, marginBottom: 15 }}>
                  Baja la <strong style={{ color: T.text }}>exposición</strong> a {META_EXPOSICION} o menos sin que la{" "}
                  <strong style={{ color: T.text }}>presencia</strong> caiga por debajo de {META_PRESENCIA}. Borrarlo todo también suspende: desaparecer no es
                  cuidarse.
                </div>

                <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
                  <div style={{ flex: "1 1 220px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, marginBottom: 6 }}>
                      <span style={{ color: T.text2 }}>Exposición</span>
                      <span style={{ color: exposicion <= META_EXPOSICION ? OK : NO, fontVariantNumeric: "tabular-nums" }}>
                        {exposicion} <span style={{ color: T.text3, fontWeight: 600 }}>/ meta ≤ {META_EXPOSICION}</span>
                      </span>
                    </div>
                    <div className="cvd-barra">
                      <span style={{ width: `${Math.min(100, (exposicion / 15) * 100)}%`, background: exposicion <= META_EXPOSICION ? OK : NO }} />
                    </div>
                    <div style={{ fontSize: 14, color: T.text3, marginTop: 6 }}>Lo que se puede deducir de ti sin que lo hayas escrito.</div>
                  </div>
                  <div style={{ flex: "1 1 220px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, marginBottom: 6 }}>
                      <span style={{ color: T.text2 }}>Presencia</span>
                      <span style={{ color: presencia >= META_PRESENCIA ? OK : NO, fontVariantNumeric: "tabular-nums" }}>
                        {presencia} <span style={{ color: T.text3, fontWeight: 600 }}>/ meta ≥ {META_PRESENCIA}</span>
                      </span>
                    </div>
                    <div className="cvd-barra">
                      <span style={{ width: `${Math.min(100, (presencia / 13) * 100)}%`, background: presencia >= META_PRESENCIA ? OK : accent }} />
                    </div>
                    <div style={{ fontSize: 14, color: T.text3, marginTop: 6 }}>Cuánto sigues estando para la gente que sí te importa.</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16, alignItems: "center" }}>
                  <button className="cvd-btn" data-primary={!perfilLogrado} onClick={comprobarPerfil} disabled={perfilLogrado}>
                    <i className="fa-solid fa-shield-halved" />
                    {perfilLogrado ? "Perfil en orden" : "Comprobar el perfil"}
                  </button>
                  <span style={{ fontSize: 14, color: T.text3 }}>
                    {PERFIL.filter((el) => tocados[el.id]).length}/{PERFIL.length} elementos revisados
                  </span>
                </div>

                {perfilLogrado && (
                  <div style={{ marginTop: 14, borderRadius: 13, border: `1px solid ${OK}55`, background: `${OK}12`, padding: "13px 16px", display: "flex", gap: 12 }}>
                    <i className="fa-solid fa-circle-check" style={{ color: OK, fontSize: 16, marginTop: 2 }} />
                    <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.6 }}>
                      Eso es cerrar sin desaparecer: el perfil sigue siendo tuyo y reconocible, y ya no regala tu escuela, tu horario ni dónde estás. Fíjate en
                      que casi ninguna de las opciones que sirvieron era «quitarlo todo».
                    </span>
                  </div>
                )}
                {!perfilLogrado && veredictoPerfil && (
                  <div style={{ marginTop: 14, borderRadius: 13, border: `1px solid ${NO}55`, background: `${NO}12`, padding: "13px 16px", display: "flex", gap: 12 }}>
                    <i className="fa-solid fa-circle-xmark" style={{ color: NO, fontSize: 16, marginTop: 2 }} />
                    <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.6 }}>{veredictoPerfil}</span>
                  </div>
                )}
              </div>

              {PERFIL.map((el) => {
                const sel = opcionDe(el.id);
                return (
                  <div key={el.id} style={{ ...card, padding: "16px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <VinetaTermino termino={el.titulo} color={accent} icono={el.icono} tam={33} radio={9} />
                      <span style={{ fontSize: 14.5, fontWeight: 900 }}>{el.titulo}</span>
                    </div>
                    <div style={{ fontSize: 14, color: T.text3, marginTop: 5, lineHeight: 1.5 }}>{el.detalle}</div>
                    <div
                      style={{
                        marginTop: 10,
                        borderRadius: 11,
                        border: `1px solid ${T.line}`,
                        background: T.inset,
                        padding: "9px 13px",
                        fontSize: 14,
                        color: T.text2,
                        lineHeight: 1.5,
                        display: "flex",
                        gap: 10,
                      }}
                    >
                      <i className="fa-solid fa-eye" style={{ color: "#FBBF24", marginTop: 3, fontSize: 14 }} />
                      <span>
                        <strong style={{ color: "#fff" }}>Revela: </strong>
                        {el.revela}
                      </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,200px),1fr))", gap: 9, marginTop: 12 }}>
                      {el.opciones.map((o) => (
                        <button key={o.id} className="cvd-opt" data-on={elec[el.id] === o.id} onClick={() => elegirOpcion(el.id, o.id)}>
                          {o.label}
                        </button>
                      ))}
                    </div>

                    {sel && (
                      <div style={{ marginTop: 11, display: "flex", gap: 10, fontSize: 14, color: T.text2, lineHeight: 1.55 }}>
                        <i className="fa-solid fa-arrow-turn-down" style={{ color: accent, marginTop: 3, fontSize: 14 }} />
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
                  fontSize: 14,
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
                <span style={{ fontSize: 14, fontWeight: 800, color: accionesDone ? OK : T.text3, alignSelf: "center" }}>
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
                  <span style={{ fontSize: 14, fontWeight: 800, color: senalesOk ? OK : T.text3 }}>
                    {SENALES.filter((s) => respDelCaso[s.id] !== undefined).length}/{SENALES.length}
                  </span>
                </div>
                <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.55, marginBottom: 14 }}>
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
                          <span style={{ fontSize: 14, fontWeight: 800, flex: 1, minWidth: 160 }}>{s.pregunta}</span>
                          <button className="cvd-si-no" data-on={resuelta && valor} disabled={resuelta} onClick={() => responderSenal(s.id, true)}>
                            Sí
                          </button>
                          <button className="cvd-si-no" data-on={resuelta && !valor} disabled={resuelta} onClick={() => responderSenal(s.id, false)}>
                            No
                          </button>
                        </div>
                        {resuelta && (
                          <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55, marginTop: 9, display: "flex", gap: 10 }}>
                            <i className="fa-solid fa-circle-check" style={{ color: OK, marginTop: 3, fontSize: 14 }} />
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
                    <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>{falloSenal}</span>
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
                      <span style={{ fontSize: 14, color: T.text3 }}>
                        · {SENALES.filter((s) => caso.senales[s.id]).length} de 3 señales
                      </span>
                    </div>
                    <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.6, marginTop: 8 }}>{NIVELES[nivelActual].descripcion}</div>
                    <div style={{ fontSize: 14, color: T.text, lineHeight: 1.6, marginTop: 9, fontWeight: 600 }}>{caso.nota}</div>
                  </div>
                )}
              </div>

              {/* paso 2 — la respuesta proporcional */}
              <div style={{ ...card, padding: "20px 22px", opacity: senalesOk ? 1 : 0.55 }}>
                <Eyebrow>Paso 2 · Elige la respuesta proporcional</Eyebrow>
                {!senalesOk ? (
                  <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.55 }}>
                    Primero lee la situación con las tres señales. La respuesta correcta depende de la gravedad, así que no se puede elegir antes de medirla.
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.55, marginBottom: 13 }}>
                      Marca TODAS las acciones que corresponden a este caso, ni una más. Quedarse corto deja el problema, y pasarse convierte un roce en un
                      expediente.
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,270px),1fr))", gap: 9 }}>
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
                              style={{ fontSize: 14, flexShrink: 0 }}
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
                              <i className="fa-solid fa-circle-check" style={{ color: OK, marginTop: 3, fontSize: 14 }} />
                              <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>
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
                            <span style={{ fontSize: 14, color: T.text, lineHeight: 1.6, fontWeight: 600 }}>
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
                              <i className="fa-solid fa-circle-xmark" style={{ color: NO, marginTop: 3, fontSize: 14 }} />
                              <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>
                                <strong style={{ color: "#fff" }}>{a.label}: </strong>
                                {caso.porque[id]}
                              </div>
                            </div>
                          );
                        })}
                        {verDelCaso.faltan.length > 0 && (
                          <div style={{ borderRadius: 12, border: `1px solid ${T.lineStrong}`, background: T.inset, padding: "11px 14px", fontSize: 14, color: T.text2, lineHeight: 1.55 }}>
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
                <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.55, marginBottom: 12 }}>{mensajeH.contexto}</div>
                <div className="cvd-burbuja" data-tipo="hostil">
                  {mensajeH.hostil}
                </div>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 14 }}>
                  {(["agresiva", "sumisa", "firme"] as const).map((t) => (
                    <div key={t} style={{ flex: "1 1 200px", display: "flex", gap: 10, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
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
                          fontSize: 14,
                          fontWeight: 900,
                          background: resuelto ? `${OK}22` : T.inset,
                          color: resuelto ? OK : T.text3,
                          border: `1px solid ${resuelto ? `${OK}66` : T.line}`,
                        }}
                      >
                        {resuelto ? <i className="fa-solid fa-check" style={{ fontSize: 14 }} /> : i + 1}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 800 }}>{mv.pide}</span>
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
                              <span style={{ display: "block", marginTop: 6, fontSize: 14, fontWeight: 700, color: TIPO_RESP[o.tipo].color }}>
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
                        <i className="fa-solid fa-circle-check" style={{ color: OK, marginTop: 3, fontSize: 14 }} />
                        <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>{opElegida.porque}</span>
                      </div>
                    )}
                    {!resuelto && falloMov?.clave === clave && (
                      <div style={{ marginTop: 11, borderRadius: 12, border: `1px solid ${NO}44`, background: `${NO}0e`, padding: "11px 14px", display: "flex", gap: 11 }}>
                        <i className="fa-solid fa-circle-xmark" style={{ color: NO, marginTop: 3, fontSize: 14 }} />
                        <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>
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
                  <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.6, marginTop: 13, display: "flex", gap: 11 }}>
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
      }
      pestanas={[
        {
          id: "pistas",
          etiqueta: "Pistas",
          icono: "fa-lightbulb",
          contenido: (
            <>
              <Bloque titulo="Tu partida" icono="fa-star">
                <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
              </Bloque>
              <Bloque titulo="Qué mirar en este modo" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>
                  {modo === "chat" && (
                    <>
                      Cada respuesta mueve el <strong style={{ color: T.text }}>clima</strong> y el <strong style={{ color: T.text }}>alcance</strong>. Antes de
                      elegir pregúntate: ¿esto frena la cadena o le da más público?
                    </>
                  )}
                  {modo === "canal" && (
                    <>
                      Antes de enviar, pregúntate <strong style={{ color: T.text }}>a quién le sirve leer esto</strong> y{" "}
                      <strong style={{ color: T.text }}>a quién puede dañar</strong>. No siempre gana lo privado: uno de los cuatro encargos sólo se resuelve
                      publicando abierto.
                    </>
                  )}
                  {modo === "perfil" && (
                    <>
                      Casi ningún elemento se arregla borrándolo. Busca la opción del medio: la que{" "}
                      <strong style={{ color: T.text }}>conserva el contenido</strong> y quita el dato del que se deduce dónde estás.
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
                      <strong style={{ color: T.text }}>Firme</strong> no es un punto medio entre agresivo y sumiso: es otra cosa. Dice el hecho, el efecto y lo
                      que pides, sin insultar y sin retirar la petición.
                    </>
                  )}
                  {modo === "texto" && <>Ya no se toca: se escribe. Si te atoras, el botón de pista te da la definición.</>}
                  {modo === "glosario" && <>Aquí se recuerda, no se reconoce: lees la definición y su ejemplo y escribes el término.</>}
                </p>
              </Bloque>
              <Bloque titulo="Preguntas para mirarte a ti" icono="fa-circle-question">
                <ul style={{ margin: 0, paddingLeft: 18, color: T.text2, lineHeight: 1.6, display: "flex", flexDirection: "column", gap: 7 }}>
                  {PISTAS_A3.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                  <li style={{ color: T.text, fontWeight: 600 }}>{PREGUNTA_A7}</li>
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
              playSfx={sonido ? (ok) => (ok ? sfxOk() : sfxNo()) : undefined}
              mensajeAprobado="Distingues el respeto de la etiqueta: sabes leer lo que un mensaje hace, no solo lo que dice."
            />
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book",
          contenido: (
            <>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={CONVIVENCIA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <Bloque titulo="Dato" icono="fa-circle-info">
                <p style={{ margin: 0, color: T.text2 }}>{DATO_A1}</p>
              </Bloque>
              <Bloque titulo="Hechos" icono="fa-check-double">
                {HECHOS.map((h, i) => (
                  <p key={i} style={{ margin: 0, color: T.text2 }}>
                    <i className={`fa-solid ${h.verdadero ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ color: h.verdadero ? OK : NO, marginRight: 8 }} />
                    <strong style={{ color: T.text }}>{h.enunciado}</strong> {h.retro}
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Para llevarte del laboratorio" icono="fa-comments">
                <p style={{ margin: 0, color: T.text, fontWeight: 800 }}>{TAREA_A5}</p>
                <p style={{ margin: 0, color: T.text2 }}>
                  Ya tienes materia prima: una regla sobre <strong style={{ color: T.text }}>dónde</strong> se dice cada cosa (lo que es de dos no va al
                  grupo), una sobre <strong style={{ color: T.text }}>cómo</strong> se dice (sin mayúsculas ni burla, y con el motivo por delante) y una sobre{" "}
                  <strong style={{ color: T.text }}>qué hace el grupo</strong> cuando algo se repite: no reenviar, avisar, y acompañar a quien lo recibe.
                </p>
              </Bloque>
              <Bloque titulo="Sobre este material" icono="fa-circle-info">
                <p style={{ margin: 0, color: T.text3 }}>
                  Son <strong>verbatim</strong> de la progresión CD-I-P07: la lectura y el recuadro de A1 (incluida la cifra de la ENDUTIH que ahí se cita), el
                  quiz evaluable de A2, las preguntas de A3, los hechos de A4, el glosario y la tarea final de A5, el texto con huecos de A6 y la pregunta de
                  cierre de A7. El <strong>grupo del salón</strong>, los <strong>encargos</strong>, el <strong>perfil</strong>, los <strong>casos</strong> y los{" "}
                  <strong>mensajes</strong> que se reescriben los escribí para esta práctica: son <strong>ilustrativos</strong>, igual que los medidores de
                  clima, alcance, exposición y presencia, que son una simulación para comparar decisiones y no una medida real. Las personas, cuentas y
                  escuelas son ficticias. Las tres señales de «Escalar o no escalar» —repetición, desequilibrio de poder e intención de dañar— son los
                  criterios con los que se define el acoso escolar y el ciberacoso. Si algo de esto te está pasando, no es tu culpa y no tienes que
                  resolverlo solo: habla con una persona adulta de confianza. Fuente: {FUENTE}
                </p>
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

/** Imagen con respaldo: fondo de gradiente + ícono detrás; si el archivo no existe se oculta. */
function Foto({ clave, icono, alt, className }: { clave: string; icono: string; alt: string; className: string }) {
  const [ok, setOk] = useState(true);
  return (
    <div className={`cvd-foto ${className}`}>
      <i className={`fa-solid ${icono}`} aria-hidden />
      {ok && <img src={`${RUTA_SIM}/${clave}.webp`} alt={alt} loading="lazy" onError={() => setOk(false)} />}
    </div>
  );
}
