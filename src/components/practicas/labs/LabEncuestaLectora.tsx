"use client";

/**
 * Laboratorio — La encuesta lectora de tu comunidad.
 * Práctica interactiva para LC-I-P02 (Lengua y Comunicación I): «Investiga los
 * gustos y las inclinaciones de las personas de su comunidad escolar respecto
 * de la lectura».
 *
 * El alumno recorre la investigación completa, no una parte: construye el
 * instrumento, codifica lo que la gente contestó y lee la gráfica que sale de
 * sus propias decisiones. Cuatro modos:
 *
 *  1. «Arma la encuesta» — decide, una por una, si cada pregunta candidata
 *     entra al cuestionario o se descarta, y recibe el nombre del defecto
 *     (inducida, ambigua, doble, invasiva, supuesto falso).
 *  2. «Levanta los datos» — codifica las nueve respuestas abiertas de la
 *     comunidad asignándoles tipo de texto y soporte; la gráfica crece en vivo.
 *  3. «Lee la gráfica» — interpreta las barras que acaba de producir y
 *     distingue lo que los datos dicen de lo que no autorizan a decir.
 *  4. «Completa el texto» — los huecos verbatim de LC-I-P02-A6.
 *  + Cuestionario evaluable verbatim de LC-I-P02-A2.
 *
 * DOM puro (sin three.js). El fenómeno aquí es una práctica de indagación, no
 * un sistema físico: la escena honesta es el cuestionario, la tabla y la
 * gráfica, no una maqueta decorativa. Accesible con ratón, teclado y táctil.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { ENCUESTA_LECTORA_HUECOS } from "./encuesta-lectora-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { TableroObjetivos } from "./_objetivos";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { ENCUESTA_LECTORA_FICHA } from "./encuesta-lectora-ficha";
import {
  CANDIDATAS,
  CANDIDATAS_UTILES,
  PERSONAS,
  TIPO_INFO,
  SOPORTE_INFO,
  TIPOS,
  SOPORTES,
  LECTURA_GRAFICA,
  QUIZ,
  HECHOS,
  PISTAS_ENTREVISTA,
  CALLOUT_A1,
  DATO_MOLEC,
  NOTA_PIE,
  type TipoTexto,
  type Soporte,
  type PreguntaCandidata,
  type PersonaEncuestada,
} from "./encuesta-lectora-data";

const NO = "#FF5E5E";
const ORO = "#FFC75A";
const RETO_KEY = "cen-encuesta-lectora-reto";

/** Tope del eje de la gráfica: con nueve personas ninguna barra pasa de 4. */
const EJE_MAX = 5;

type Modo = "encuesta" | "campo" | "grafica" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "encuesta", label: "Arma la encuesta", icono: "fa-clipboard-question" },
  { id: "campo", label: "Levanta los datos", icono: "fa-users" },
  { id: "grafica", label: "Lee la gráfica", icono: "fa-chart-simple" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

/** Codificación que el alumno ya acertó para una persona. */
interface Codificacion {
  tipo?: TipoTexto;
  soporte?: Soporte;
}

export function LabEncuestaLectora({ color }: PracticaLabProps) {
  const accent = color.hex;
  const rgba = color.rgba;
  const [modo, setModo] = useState<Modo>("encuesta");
  const [drawer, setDrawer] = useState(false);

  /* ── sonido ─────────────────────────────────────────────────────────── */
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
  const sfxFin = () => sonido && audioRef.current?.correcto();
  const sfxOk = () => {
    partida.acierto();
    return sonido && audioRef.current?.blip();
  };
  const sfxNo = () => {
    partida.error();
    return sonido && audioRef.current?.incorrecto();
  };

  /* ── modo 1 · Arma la encuesta ──────────────────────────────────────── */
  // id → decisión acertada ("incluir" | "descartar"). Solo se guarda cuando el
  // alumno decide bien: una decisión equivocada no se registra, se explica.
  const [decididas, setDecididas] = useState<Record<string, "incluir" | "descartar">>({});
  const [sacude, setSacude] = useState<string | null>(null);

  const decidir = (c: PreguntaCandidata, decision: "incluir" | "descartar") => {
    if (decididas[c.id]) return;
    const correcta = c.sirve ? "incluir" : "descartar";
    if (decision === correcta) {
      const siguiente = { ...decididas, [c.id]: decision };
      setDecididas(siguiente);
      sfxOk();
      if (Object.keys(siguiente).length >= CANDIDATAS.length) sfxFin();
    } else {
      setSacude(c.id);
      sfxNo();
      window.setTimeout(() => setSacude(null), 420);
    }
  };
  const reiniciarEncuesta = () => {
    setDecididas({});
    setSacude(null);
  };

  const incluidas = CANDIDATAS.filter((c) => decididas[c.id] === "incluir");
  const encuestaDone = Object.keys(decididas).length >= CANDIDATAS.length;

  /* ── modo 2 · Levanta los datos ─────────────────────────────────────── */
  const [codificado, setCodificado] = useState<Record<string, Codificacion>>({});
  const [sacudePersona, setSacudePersona] = useState<string | null>(null);

  const marcar = (p: PersonaEncuestada, campo: "tipo" | "soporte", valor: TipoTexto | Soporte) => {
    const actual = codificado[p.id] ?? {};
    if (actual[campo]) return;
    const esperado: string = campo === "tipo" ? p.tipo : p.soporte;
    if (valor === esperado) {
      const nuevo: Codificacion = { ...actual, [campo]: valor };
      const siguiente = { ...codificado, [p.id]: nuevo };
      setCodificado(siguiente);
      sfxOk();
      const listas = PERSONAS.filter((x) => {
        const c = siguiente[x.id];
        return c?.tipo && c.soporte;
      }).length;
      if (listas >= PERSONAS.length) sfxFin();
    } else {
      setSacudePersona(`${p.id}-${campo}`);
      sfxNo();
      window.setTimeout(() => setSacudePersona(null), 420);
    }
  };
  const reiniciarCampo = () => {
    setCodificado({});
    setSacudePersona(null);
  };

  const tabuladas = useMemo(
    () => PERSONAS.filter((p) => codificado[p.id]?.tipo && codificado[p.id]?.soporte),
    [codificado],
  );
  const campoDone = tabuladas.length >= PERSONAS.length;

  // La gráfica se alimenta SOLO de lo que el alumno ya codificó: cada acierto
  // mueve una barra, que es lo que hace visible que los datos los produce él.
  const conteoTipo = useMemo(() => {
    const base: Record<TipoTexto, number> = { informativo: 0, narrativo: 0, digital: 0 };
    for (const p of PERSONAS) {
      const t = codificado[p.id]?.tipo;
      if (t) base[t] += 1;
    }
    return base;
  }, [codificado]);
  const conteoSoporte = useMemo(() => {
    const base: Record<Soporte, number> = { papel: 0, pantalla: 0, calle: 0 };
    for (const p of PERSONAS) {
      const s = codificado[p.id]?.soporte;
      if (s) base[s] += 1;
    }
    return base;
  }, [codificado]);

  /* ── modo 3 · Lee la gráfica ────────────────────────────────────────── */
  const [respG, setRespG] = useState<(number | null)[]>(() => LECTURA_GRAFICA.map(() => null));
  const [gIdx, setGIdx] = useState(0);

  const responderG = (iOpcion: number) => {
    if (respG[gIdx] !== null) return;
    const q = LECTURA_GRAFICA[gIdx];
    if (!q) return;
    const siguiente = [...respG];
    siguiente[gIdx] = iOpcion;
    setRespG(siguiente);
    if (iOpcion === q.correcta) sfxOk();
    else sfxNo();
    if (siguiente.every((r) => r !== null)) sfxFin();
  };
  const reiniciarGrafica = () => {
    setRespG(LECTURA_GRAFICA.map(() => null));
    setGIdx(0);
  };
  const graficaDone = respG.every((r) => r !== null);
  const g5Ok = respG[4] === LECTURA_GRAFICA[4]?.correcta;

  /* ── modo 4 · Completa el texto ─────────────────────────────────────── */
  const [textoDone, setTextoDone] = useState(false);
  const [textoIntento, setTextoIntento] = useState(0);
  const reiniciarTexto = () => {
    setTextoDone(false);
    setTextoIntento((v) => v + 1);
  };

  /* ── cuestionario evaluable ─────────────────────────────────────────── */
  const [quizAprobado, setQuizAprobado] = useState(false);

  /* ── objetivos ──────────────────────────────────────────────────────── */
  const modosHechos = (encuestaDone ? 1 : 0) + (campoDone ? 1 : 0) + (graficaDone ? 1 : 0) + (textoDone ? 1 : 0);
  const objetivos = [
    { txt: `Decide las ${CANDIDATAS.length} preguntas candidatas`, done: encuestaDone },
    { txt: `Arma un cuestionario con las ${CANDIDATAS_UTILES} preguntas útiles`, done: incluidas.length >= CANDIDATAS_UTILES },
    { txt: "Descarta la pregunta inducida y la del supuesto falso", done: decididas["c3"] === "descartar" && decididas["c12"] === "descartar" },
    { txt: `Codifica las ${PERSONAS.length} respuestas de la comunidad`, done: campoDone },
    { txt: "Registra la lectura que ocurre en la calle", done: Boolean(codificado["p7"]?.soporte) },
    { txt: "Contesta las 5 preguntas de lectura de la gráfica", done: graficaDone },
    { txt: "Reconoce lo que la gráfica NO te dice", done: g5Ok },
    { txt: "Completa el texto sobre tipos de texto", done: textoDone },
    { txt: "Aprueba el cuestionario de la progresión", done: quizAprobado },
    { txt: "Encadena 8 aciertos seguidos sin fallar", done: partida.mejorRacha >= 8 },
  ];

  const reiniciarModo =
    modo === "encuesta" ? reiniciarEncuesta : modo === "campo" ? reiniciarCampo : modo === "grafica" ? reiniciarGrafica : reiniciarTexto;

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes enlShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes enlPop { 0%{transform:scale(.7);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .enl-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 16px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .enl-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .enl-tab[data-on="true"] { border-color:${accent}; background:rgba(${rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .enl-tab[data-done="true"] { color:${OK}; }
        .enl-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .enl-icobtn[data-on="true"] { background:rgba(${rgba},0.22); color:#fff; border-color:${accent}; }
        .enl-icobtn:hover { background:rgba(255,255,255,0.12); }
        .enl-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:10px 16px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:13px; font-weight:800; transition:all .14s; }
        .enl-btn:hover:not(:disabled) { border-color:${T.lineStrong}; }
        .enl-btn:disabled { opacity:.45; cursor:default; }
        .enl-btn[data-si="true"]:hover { border-color:${OK}; background:${OK}18; }
        .enl-btn[data-no="true"]:hover { border-color:${ORO}; background:${ORO}18; }

        /* Tarjeta de pregunta candidata / de persona encuestada */
        .enl-ficha { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glassSoft}; padding:15px 17px; transition:all .16s; }
        .enl-ficha[data-shake="true"] { animation:enlShake .4s; border-color:${NO}; }
        .enl-ficha[data-ok="true"] { border-color:${OK}55; background:${OK}10; }
        .enl-ficha[data-out="true"] { border-color:${ORO}55; background:${ORO}0e; }
        .enl-ficha[data-done="true"] { animation:enlPop .25s ease; }

        /* Opciones de codificación */
        .enl-op { cursor:pointer; display:inline-flex; align-items:center; gap:8px; padding:8px 13px; border-radius:999px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:12.5px; font-weight:800; transition:all .14s; }
        .enl-op:hover:not(:disabled) { border-color:${T.lineStrong}; color:#fff; transform:translateY(-1px); }
        .enl-op:disabled { cursor:default; }
        .enl-op[data-on="true"] { color:#04121f; }
        .enl-fila[data-shake="true"] { animation:enlShake .4s; }

        /* Gráfica */
        .enl-graf { position:relative; }
        .enl-barra { height:26px; border-radius:0 8px 8px 0; transition:width .45s cubic-bezier(.4,0,.2,1); min-width:2px; }
        .enl-rejilla { position:absolute; top:0; bottom:0; width:1px; background:${T.line}; }

        /* Opciones de lectura de gráfica */
        .enl-opt { cursor:pointer; display:flex; align-items:center; gap:12px; width:100%; text-align:left;
          border-radius:12px; border:1px solid ${T.line}; background:${T.glass}; color:${T.text2};
          font-size:13.5px; font-weight:600; padding:11px 14px; transition:all .14s; }
        .enl-opt:hover:not(:disabled) { border-color:${T.lineStrong}; background:${T.glassSoft}; color:#fff; }
        .enl-opt:disabled { cursor:default; }
        .enl-opt[data-ok="true"] { border-color:${OK}; background:${OK}1c; color:#fff; }
        .enl-opt[data-bad="true"] { border-color:${NO}; background:${NO}1c; color:#fff; }
        .enl-bullet { flex-shrink:0; width:26px; height:26px; border-radius:8px; display:flex; align-items:center;
          justify-content:center; font-size:12px; font-weight:900; border:1px solid ${T.line}; color:${T.text3}; }

        .enl-divider { height:1px; background:${T.line}; margin:16px 0; }
        .enl-badge { display:inline-flex; align-items:center; gap:7px; padding:4px 10px; border-radius:999px;
          font-size:11px; font-weight:800; letter-spacing:.02em; }

        /* Cajón de teoría */
        .enl-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .enl-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .enl-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .enl-drawer[data-open="true"] { transform:translateX(0); }
        .enl-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .enl-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .enl-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .enl-close:hover { border-color:${accent}; background:rgba(${rgba},0.16); }
        .enl-fab { position:fixed; right:20px; bottom:20px; z-index:58; cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.86); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .enl-fab:hover { background:rgba(${rgba},0.28); transform:translateY(-1px); }

        .enl-grid { display:grid; grid-template-columns:minmax(0,1fr) clamp(300px,28vw,400px); gap:22px; align-items:start; }
        @media (max-width: 900px){ .enl-grid { grid-template-columns:minmax(0,1fr); } }
        @media (max-width: 640px){ .enl-fab { right:12px; bottom:12px; padding:10px 13px; font-size:12px; } }
        @media (prefers-reduced-motion: reduce){
          .enl-ficha[data-shake="true"], .enl-fila[data-shake="true"], .enl-ficha[data-done="true"] { animation:none; }
          .enl-op:hover:not(:disabled) { transform:none; }
          .enl-barra { transition:none; }
        }
      `}</style>

      {/* ── barra de modos y herramientas ─────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        {MODOS.map((m) => {
          const hecho =
            (m.id === "encuesta" && encuestaDone) ||
            (m.id === "campo" && campoDone) ||
            (m.id === "grafica" && graficaDone) ||
            (m.id === "texto" && textoDone);
          return (
            <button key={m.id} className="enl-tab" data-on={modo === m.id} data-done={hecho} onClick={() => setModo(m.id)}>
              <i className={`fa-solid ${hecho ? "fa-circle-check" : m.icono}`} />
              {m.label}
            </button>
          );
        })}
        <div style={{ flex: 1 }} />
        <MarcadorPartida partida={partida} accent={accent} rgba={rgba} />
        <button className="enl-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría de la práctica">
          <i className="fa-solid fa-book-open" />
        </button>
        <button className="enl-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
          <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
        </button>
        <button className="enl-icobtn" onClick={reiniciarModo} title="Reiniciar este modo">
          <i className="fa-solid fa-rotate-left" />
        </button>
      </div>

      {/* ── cajón de teoría ───────────────────────────────────────────── */}
      <button className="enl-fab" onClick={() => setDrawer(true)}>
        <i className="fa-solid fa-book-open" />
        Teoría
      </button>
      <div className="enl-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="enl-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="enl-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="enl-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="enl-drawer-body">
          <FichaTeorica data={ENCUESTA_LECTORA_FICHA} accent={accent} rgba={rgba} defaultOpen />
        </div>
      </aside>

      <div className="enl-grid">
        {/* ── columna principal ──────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {modo === "encuesta" && (
            <PanelEncuesta
              accent={accent}
              rgba={rgba}
              decididas={decididas}
              sacude={sacude}
              incluidas={incluidas.length}
              onDecidir={decidir}
            />
          )}

          {modo === "campo" && (
            <PanelCampo
              accent={accent}
              rgba={rgba}
              codificado={codificado}
              sacudePersona={sacudePersona}
              conteoTipo={conteoTipo}
              conteoSoporte={conteoSoporte}
              tabuladas={tabuladas.length}
              onMarcar={marcar}
            />
          )}

          {modo === "grafica" && (
            <PanelGrafica
              accent={accent}
              rgba={rgba}
              listo={campoDone}
              tabuladas={tabuladas.length}
              conteoTipo={conteoTipo}
              conteoSoporte={conteoSoporte}
              respG={respG}
              gIdx={gIdx}
              onResponder={responderG}
              onIr={(i) => setGIdx(i)}
              onIrACampo={() => setModo("campo")}
            />
          )}

          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={ENCUESTA_LECTORA_HUECOS}
              accent={accent}
              rgba={rgba}
              completado={textoDone}
              onCompletado={() => {
                setTextoDone(true);
                sfxFin();
              }}
              onAcierto={sfxOk}
              onError={sfxNo}
            />
          )}
        </div>

        {/* ── columna lateral ────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ ...card, padding: "20px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
              Objetivos de la sesión
            </Eyebrow>
            <TableroObjetivos objetivos={objetivos} retoKey={RETO_KEY} accent={accent} />
            <div className="enl-divider" />
            <div style={{ fontSize: 12, color: T.text3, lineHeight: 1.5 }}>
              <strong style={{ color: modosHechos >= 4 ? OK : T.text2 }}>{modosHechos} de 4 modos</strong> terminados.
            </div>
          </div>

          {/* pista del modo actual */}
          <div
            style={{
              borderRadius: 18,
              padding: "16px 18px",
              border: `1px solid rgba(${rgba},0.3)`,
              background: `rgba(${rgba},0.08)`,
              fontSize: 13,
              color: T.text2,
              lineHeight: 1.55,
              display: "flex",
              gap: 12,
            }}
          >
            <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>
              {modo === "encuesta" && (
                <>
                  Una buena pregunta <strong style={{ color: T.text }}>no sugiere la respuesta</strong>, significa lo mismo para todos y pregunta{" "}
                  <strong style={{ color: T.text }}>una sola cosa</strong>. Si la respuesta ya viene dentro de la pregunta, descártala.
                </>
              )}
              {modo === "campo" && (
                <>
                  El <strong style={{ color: T.text }}>tipo de texto</strong> depende de lo que el texto hace (informar, relatar, circular en
                  plataformas); el <strong style={{ color: T.text }}>soporte</strong>, del medio donde aparece. Un mismo tipo puede llegar en papel,
                  en pantalla o en un cartel.
                </>
              )}
              {modo === "grafica" && (
                <>
                  Antes de concluir, revisa <strong style={{ color: T.text }}>cuántas personas</strong> hay detrás de cada barra. Nueve respuestas
                  describen a esas nueve personas, no a toda la escuela.
                </>
              )}
              {modo === "texto" && (
                <>
                  Fíjate en <strong style={{ color: T.text }}>qué hace</strong> cada texto: si da pasos o datos es informativo; si cuenta algo en el
                  tiempo es narrativo; si vive en una plataforma es digital.
                </>
              )}
            </span>
          </div>

          {/* pistas de entrevista verbatim (A3) */}
          <div style={{ ...card, padding: "18px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-microphone-lines" style={{ marginRight: 8, color: accent }} />
              Tu entrevista (A3)
            </Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {PISTAS_ENTREVISTA.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 10, fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
                  <i className="fa-solid fa-quote-left" style={{ color: T.text3, fontSize: 11, marginTop: 3 }} />
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* hechos verbatim (A5) */}
          <div style={{ ...card, padding: "18px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-circle-check" style={{ marginRight: 8, color: accent }} />
              Hechos de la progresión (A5)
            </Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {HECHOS.map((h, i) => (
                <div key={i} style={{ fontSize: 12.5, lineHeight: 1.5 }}>
                  <span
                    className="enl-badge"
                    style={{
                      background: h.respuesta ? `${OK}1e` : `${ORO}1e`,
                      color: h.respuesta ? OK : ORO,
                      border: `1px solid ${h.respuesta ? OK : ORO}44`,
                      marginRight: 8,
                    }}
                  >
                    {h.respuesta ? "VERDADERO" : "FALSO"}
                  </span>
                  <span style={{ color: T.text }}>{h.enunciado}</span>
                  <div style={{ color: T.text3, marginTop: 4 }}>{h.retroalimentacion}</div>
                </div>
              ))}
            </div>
          </div>

          {/* dato nacional real */}
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
            <i className="fa-solid fa-chart-pie" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>{DATO_MOLEC}</span>
          </div>

          {/* callout verbatim A1 */}
          <div
            style={{
              borderRadius: 18,
              padding: "16px 18px",
              border: `1px solid ${T.line}`,
              background: T.inset,
              fontSize: 12,
              color: T.text3,
              lineHeight: 1.55,
              display: "flex",
              gap: 12,
            }}
          >
            <i className="fa-solid fa-circle-info" style={{ color: T.text3, fontSize: 15, marginTop: 1 }} />
            <span>{CALLOUT_A1}</span>
          </div>
        </div>
      </div>

      <RetoQuizCard
        quiz={QUIZ}
        accent={accent}
        rgba={rgba}
        aprobado={quizAprobado}
        onAprobado={() => setQuizAprobado(true)}
        playSfx={(ok) => (ok ? sfxFin() : sonido && audioRef.current?.incorrecto())}
        playPick={() => sonido && audioRef.current?.blip()}
        mensajeAprobado="Ya sabes investigar lo que lee tu comunidad."
      />

      <p style={{ marginTop: 18, fontSize: 11.5, color: T.text3, lineHeight: 1.6 }}>
        <i className="fa-solid fa-circle-info" style={{ marginRight: 7 }} />
        {NOTA_PIE}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * Modo 1 — «Arma la encuesta»
 * ═══════════════════════════════════════════════════════════════════════ */
function PanelEncuesta({
  accent,
  rgba,
  decididas,
  sacude,
  incluidas,
  onDecidir,
}: {
  accent: string;
  rgba: string;
  decididas: Record<string, "incluir" | "descartar">;
  sacude: string | null;
  incluidas: number;
  onDecidir: (c: PreguntaCandidata, d: "incluir" | "descartar") => void;
}) {
  const resueltas = Object.keys(decididas).length;
  const listo = resueltas >= CANDIDATAS.length;
  return (
    <>
      <div style={{ ...card, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <Eyebrow>
            <i className="fa-solid fa-clipboard-question" style={{ marginRight: 8, color: accent }} />
            Decide qué preguntas entran a tu cuestionario
          </Eyebrow>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: listo ? OK : T.text3, fontVariantNumeric: "tabular-nums" }}>
            {resueltas}/{CANDIDATAS.length} decididas · {incluidas}/{CANDIDATAS_UTILES} incluidas
          </span>
        </div>
        <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.55, marginTop: 4 }}>
          Vas a preguntar a gente de tu escuela qué lee, cuándo y para qué. Estas doce preguntas llegaron al borrador; seis sirven y seis tienen un
          defecto. Decide una por una: si aciertas, la tarjeta se queda con la explicación.
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {CANDIDATAS.map((c) => {
          const dec = decididas[c.id];
          const dentro = dec === "incluir";
          const fuera = dec === "descartar";
          return (
            <div key={c.id} className="enl-ficha" data-shake={sacude === c.id} data-ok={dentro} data-out={fuera} data-done={Boolean(dec)}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <i
                  className={`fa-solid ${dentro ? "fa-circle-check" : fuera ? "fa-circle-minus" : "fa-comment-dots"}`}
                  style={{ color: dentro ? OK : fuera ? ORO : T.text3, fontSize: 16, marginTop: 2 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: T.text, lineHeight: 1.45 }}>«{c.texto}»</div>

                  {!dec && (
                    <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                      <button className="enl-btn" data-si="true" onClick={() => onDecidir(c, "incluir")}>
                        <i className="fa-solid fa-plus" /> Incluir en la encuesta
                      </button>
                      <button className="enl-btn" data-no="true" onClick={() => onDecidir(c, "descartar")}>
                        <i className="fa-solid fa-xmark" /> Descartar
                      </button>
                    </div>
                  )}

                  {sacude === c.id && (
                    <div role="status" style={{ marginTop: 10, fontSize: 12.5, color: NO, lineHeight: 1.5 }}>
                      <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 7 }} />
                      Todavía no. Vuelve a leerla: ¿le sugiere a la persona qué contestar?, ¿significa lo mismo para todos?, ¿pregunta una sola
                      cosa?, ¿sirve para saber qué lee?
                    </div>
                  )}

                  {dec && (
                    <div style={{ marginTop: 10 }}>
                      <span
                        className="enl-badge"
                        style={{
                          background: dentro ? `${OK}1e` : `${ORO}1e`,
                          color: dentro ? OK : ORO,
                          border: `1px solid ${dentro ? OK : ORO}44`,
                        }}
                      >
                        <i className={`fa-solid ${dentro ? "fa-check" : "fa-ban"}`} />
                        {dentro ? "Entra al cuestionario" : `Descartada · ${c.defecto ?? "con defecto"}`}
                      </span>
                      <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55, marginTop: 8 }}>{c.porque}</div>
                      {c.arreglo && (
                        <div style={{ fontSize: 12.5, color: accent, lineHeight: 1.55, marginTop: 6 }}>
                          <i className="fa-solid fa-wrench" style={{ marginRight: 7 }} />
                          {c.arreglo}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {listo && (
        <div
          style={{
            borderRadius: 16,
            border: `1px solid ${OK}55`,
            background: `${OK}12`,
            padding: "16px 18px",
            fontSize: 13.5,
            color: T.text,
            lineHeight: 1.55,
          }}
        >
          <i className="fa-solid fa-clipboard-check" style={{ color: OK, marginRight: 9 }} />
          Tu cuestionario quedó con {incluidas} preguntas. Con ese instrumento ya puedes salir a preguntar: pasa a{" "}
          <strong style={{ color: `rgb(${rgba})` }}>«Levanta los datos»</strong> para trabajar lo que contestaron nueve personas de la escuela.
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * Gráfica de frecuencias (compartida por los modos 2 y 3)
 * ═══════════════════════════════════════════════════════════════════════ */
function Grafica({
  conteoTipo,
  conteoSoporte,
  tabuladas,
  compacta,
}: {
  conteoTipo: Record<TipoTexto, number>;
  conteoSoporte: Record<Soporte, number>;
  tabuladas: number;
  compacta?: boolean;
}) {
  const filas: { key: string; label: string; color: string; icono: string; valor: number }[] = [
    ...TIPOS.map((t) => ({ key: `t-${t}`, label: TIPO_INFO[t].corto, color: TIPO_INFO[t].color, icono: TIPO_INFO[t].icono, valor: conteoTipo[t] })),
    ...SOPORTES.map((s) => ({
      key: `s-${s}`,
      label: SOPORTE_INFO[s].corto,
      color: SOPORTE_INFO[s].color,
      icono: SOPORTE_INFO[s].icono,
      valor: conteoSoporte[s],
    })),
  ];

  const bloque = (titulo: string, desde: number, hasta: number) => (
    <div>
      <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.1em", color: T.text3, textTransform: "uppercase", marginBottom: 9 }}>
        {titulo}
      </div>
      <div className="enl-graf" style={{ display: "flex", flexDirection: "column", gap: 8, position: "relative" }}>
        {/* Rejilla del eje: se dibuja EXACTAMENTE sobre la pista de las barras
            (de 114px por la izquierda a 34px por la derecha), para que la marca
            del 4 caiga donde termina una barra que vale 4. */}
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 114, right: 35, pointerEvents: "none" }} aria-hidden>
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="enl-rejilla" style={{ left: `${(n / EJE_MAX) * 100}%` }} />
          ))}
        </div>
        {filas.slice(desde, hasta).map((f) => (
          <div key={f.key} style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
            <div
              style={{
                width: 104,
                flexShrink: 0,
                fontSize: 12,
                fontWeight: 700,
                color: T.text2,
                display: "flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              <i className={`fa-solid ${f.icono}`} style={{ color: f.color, fontSize: 12 }} />
              {f.label}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                className="enl-barra"
                style={{
                  width: `${(f.valor / EJE_MAX) * 100}%`,
                  background: `linear-gradient(90deg, ${f.color}dd 0%, ${f.color}77 100%)`,
                  boxShadow: f.valor > 0 ? `0 0 18px -8px ${f.color}` : "none",
                }}
                role="img"
                aria-label={`${f.label}: ${f.valor} personas`}
              />
            </div>
            <span
              style={{
                width: 25,
                flexShrink: 0,
                textAlign: "right",
                fontSize: 12.5,
                fontWeight: 800,
                color: f.valor > 0 ? f.color : T.text3,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {f.valor}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ ...card, padding: compacta ? "16px 20px" : "20px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        <Eyebrow>
          <i className="fa-solid fa-chart-simple" style={{ marginRight: 8 }} />
          Resultados de tu encuesta · {tabuladas} de {PERSONAS.length} personas tabuladas
        </Eyebrow>
        <span style={{ fontSize: 11, color: T.text3 }}>Eje horizontal: número de personas (0 a {EJE_MAX})</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {bloque("Tipo de texto que más lee", 0, 3)}
        {bloque("Soporte donde lo lee", 3, 6)}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * Modo 2 — «Levanta los datos»
 * ═══════════════════════════════════════════════════════════════════════ */
function PanelCampo({
  accent,
  rgba,
  codificado,
  sacudePersona,
  conteoTipo,
  conteoSoporte,
  tabuladas,
  onMarcar,
}: {
  accent: string;
  rgba: string;
  codificado: Record<string, Codificacion>;
  sacudePersona: string | null;
  conteoTipo: Record<TipoTexto, number>;
  conteoSoporte: Record<Soporte, number>;
  tabuladas: number;
  onMarcar: (p: PersonaEncuestada, campo: "tipo" | "soporte", valor: TipoTexto | Soporte) => void;
}) {
  return (
    <>
      <div style={{ ...card, padding: "18px 22px" }}>
        <Eyebrow>
          <i className="fa-solid fa-users" style={{ marginRight: 8, color: accent }} />
          Nueve personas de la escuela ya contestaron
        </Eyebrow>
        <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.55 }}>
          Contestaron con sus propias palabras, así que todavía no se pueden contar. Tu trabajo es{" "}
          <strong style={{ color: `rgb(${rgba})` }}>codificar</strong> cada respuesta: decidir qué tipo de texto es y en qué soporte lo lee. Cada
          acierto mueve una barra de la gráfica.
        </div>
      </div>

      <Grafica conteoTipo={conteoTipo} conteoSoporte={conteoSoporte} tabuladas={tabuladas} compacta />

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {PERSONAS.map((p) => {
          const c = codificado[p.id] ?? {};
          const listo = Boolean(c.tipo && c.soporte);
          return (
            <div key={p.id} className="enl-ficha" data-ok={listo} data-done={listo}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    flexShrink: 0,
                    borderRadius: 11,
                    background: `rgba(${rgba},0.16)`,
                    border: `1px solid rgba(${rgba},0.3)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: accent,
                    fontSize: 15,
                  }}
                >
                  <i className={`fa-solid ${p.icono}`} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 9, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 900, color: T.text }}>{p.nombre}</span>
                    <span style={{ fontSize: 11.5, color: T.text3, fontWeight: 700 }}>{p.rol}</span>
                    {listo && (
                      <span className="enl-badge" style={{ background: `${OK}1e`, color: OK, border: `1px solid ${OK}44`, marginLeft: "auto" }}>
                        <i className="fa-solid fa-check" /> Tabulada
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.55, marginTop: 6, fontStyle: "italic" }}>«{p.respuesta}»</div>

                  {/* fila tipo */}
                  <div className="enl-fila" data-shake={sacudePersona === `${p.id}-tipo`} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 11 }}>
                    <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.08em", color: T.text3, textTransform: "uppercase", width: 74 }}>
                      Tipo
                    </span>
                    {TIPOS.map((t) => {
                      const on = c.tipo === t;
                      const info = TIPO_INFO[t];
                      return (
                        <button
                          key={t}
                          className="enl-op"
                          data-on={on}
                          disabled={Boolean(c.tipo)}
                          onClick={() => onMarcar(p, "tipo", t)}
                          title={info.definicion}
                          style={on ? { background: info.color, borderColor: info.color, color: "#04121f" } : undefined}
                        >
                          <i className={`fa-solid ${info.icono}`} />
                          {info.corto}
                        </button>
                      );
                    })}
                  </div>

                  {/* fila soporte */}
                  <div className="enl-fila" data-shake={sacudePersona === `${p.id}-soporte`} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                    <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.08em", color: T.text3, textTransform: "uppercase", width: 74 }}>
                      Soporte
                    </span>
                    {SOPORTES.map((s) => {
                      const on = c.soporte === s;
                      const info = SOPORTE_INFO[s];
                      return (
                        <button
                          key={s}
                          className="enl-op"
                          data-on={on}
                          disabled={Boolean(c.soporte)}
                          onClick={() => onMarcar(p, "soporte", s)}
                          title={info.ejemplo}
                          style={on ? { background: info.color, borderColor: info.color, color: "#04121f" } : undefined}
                        >
                          <i className={`fa-solid ${info.icono}`} />
                          {info.corto}
                        </button>
                      );
                    })}
                  </div>

                  {listo && <div style={{ fontSize: 12.5, color: T.text3, lineHeight: 1.55, marginTop: 9 }}>{p.porque}</div>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {tabuladas >= PERSONAS.length && (
        <div
          style={{
            borderRadius: 16,
            border: `1px solid ${OK}55`,
            background: `${OK}12`,
            padding: "16px 18px",
            fontSize: 13.5,
            color: T.text,
            lineHeight: 1.55,
          }}
        >
          <i className="fa-solid fa-table-list" style={{ color: OK, marginRight: 9 }} />
          Tabla completa: nueve respuestas abiertas convertidas en datos contables. Ahora pasa a{" "}
          <strong style={{ color: `rgb(${rgba})` }}>«Lee la gráfica»</strong> e interpreta lo que produjiste.
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * Modo 3 — «Lee la gráfica»
 * ═══════════════════════════════════════════════════════════════════════ */
function PanelGrafica({
  accent,
  rgba,
  listo,
  tabuladas,
  conteoTipo,
  conteoSoporte,
  respG,
  gIdx,
  onResponder,
  onIr,
  onIrACampo,
}: {
  accent: string;
  rgba: string;
  listo: boolean;
  tabuladas: number;
  conteoTipo: Record<TipoTexto, number>;
  conteoSoporte: Record<Soporte, number>;
  respG: (number | null)[];
  gIdx: number;
  onResponder: (i: number) => void;
  onIr: (i: number) => void;
  onIrACampo: () => void;
}) {
  const q = LECTURA_GRAFICA[gIdx];
  const dada = respG[gIdx] ?? null;
  const contestadas = respG.filter((r) => r !== null).length;
  const aciertos = respG.reduce<number>((acc, r, i) => acc + (r !== null && r === LECTURA_GRAFICA[i]?.correcta ? 1 : 0), 0);

  return (
    <>
      <Grafica conteoTipo={conteoTipo} conteoSoporte={conteoSoporte} tabuladas={tabuladas} />

      {!listo ? (
        <div style={{ ...card, padding: "22px 24px", textAlign: "center" }}>
          <i className="fa-solid fa-triangle-exclamation" style={{ color: ORO, fontSize: 22 }} />
          <div style={{ fontSize: 14, color: T.text, fontWeight: 800, marginTop: 10 }}>La gráfica todavía está incompleta</div>
          <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.55, marginTop: 7, maxWidth: 520, marginInline: "auto" }}>
            Llevas {tabuladas} de {PERSONAS.length} respuestas codificadas. Interpretar una gráfica a medias es justo el error que se busca evitar:
            termina de levantar los datos y regresa.
          </div>
          <button className="enl-btn" onClick={onIrACampo} style={{ marginTop: 14 }}>
            <i className="fa-solid fa-users" /> Ir a «Levanta los datos»
          </button>
        </div>
      ) : (
        <div style={{ ...card, padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
            <Eyebrow>
              <i className="fa-solid fa-magnifying-glass-chart" style={{ marginRight: 8, color: accent }} />
              Interpreta tus resultados
            </Eyebrow>
            <span style={{ fontSize: 12.5, fontWeight: 800, color: contestadas >= LECTURA_GRAFICA.length ? OK : T.text3, fontVariantNumeric: "tabular-nums" }}>
              {contestadas}/{LECTURA_GRAFICA.length} contestadas · {aciertos} correctas
            </span>
          </div>

          {/* navegación entre preguntas */}
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 16 }}>
            {LECTURA_GRAFICA.map((_, i) => {
              const r = respG[i];
              const ok = r !== null && r === LECTURA_GRAFICA[i]?.correcta;
              const mal = r !== null && !ok;
              return (
                <button
                  key={i}
                  className="enl-op"
                  data-on={gIdx === i}
                  onClick={() => onIr(i)}
                  aria-label={`Pregunta ${i + 1}`}
                  style={
                    gIdx === i
                      ? { background: accent, borderColor: accent, color: "#04121f" }
                      : ok
                        ? { borderColor: `${OK}88`, color: OK }
                        : mal
                          ? { borderColor: `${NO}88`, color: NO }
                          : undefined
                  }
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          {q && (
            <>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: T.text, lineHeight: 1.45, marginBottom: 12 }}>
                <span style={{ color: accent }}>{gIdx + 1}.</span> {q.enunciado}
              </div>
              <div role="radiogroup" aria-label={q.enunciado} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {q.opciones.map((op, j) => {
                  const esCorrecta = dada !== null && j === q.correcta;
                  const esFallo = dada !== null && dada === j && j !== q.correcta;
                  return (
                    <button
                      key={j}
                      className="enl-opt"
                      role="radio"
                      aria-checked={dada === j}
                      data-ok={esCorrecta}
                      data-bad={esFallo}
                      disabled={dada !== null}
                      onClick={() => onResponder(j)}
                    >
                      <span className="enl-bullet">{String.fromCharCode(65 + j)}</span>
                      <span style={{ flex: 1 }}>{op}</span>
                      {esCorrecta && <i className="fa-solid fa-circle-check" style={{ color: OK }} />}
                      {esFallo && <i className="fa-solid fa-circle-xmark" style={{ color: NO }} />}
                    </button>
                  );
                })}
              </div>

              {dada !== null && (
                <div
                  role="status"
                  style={{
                    marginTop: 13,
                    borderRadius: 12,
                    border: `1px solid ${T.line}`,
                    background: T.inset,
                    padding: "12px 15px",
                    fontSize: 12.5,
                    color: T.text2,
                    lineHeight: 1.55,
                  }}
                >
                  <i className="fa-solid fa-circle-info" style={{ marginRight: 8, color: accent }} />
                  {q.explica}
                </div>
              )}

              {dada !== null && gIdx < LECTURA_GRAFICA.length - 1 && (
                <button className="enl-btn" onClick={() => onIr(gIdx + 1)} style={{ marginTop: 14 }}>
                  Siguiente pregunta <i className="fa-solid fa-arrow-right" />
                </button>
              )}
            </>
          )}

          {contestadas >= LECTURA_GRAFICA.length && (
            <div
              style={{
                marginTop: 16,
                borderRadius: 14,
                border: `1px solid ${OK}55`,
                background: `${OK}12`,
                padding: "14px 16px",
                fontSize: 13,
                color: T.text,
                lineHeight: 1.55,
              }}
            >
              <i className="fa-solid fa-flag-checkered" style={{ color: OK, marginRight: 9 }} />
              Cerraste el ciclo de la investigación: preguntaste, registraste, contaste e interpretaste. Lo que sigue es tuyo:{" "}
              <span style={{ color: `rgb(${rgba})` }}>entrevista de verdad a alguien de tu comunidad</span> y compara sus respuestas con esta tabla.
            </div>
          )}
        </div>
      )}
    </>
  );
}
