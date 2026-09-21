"use client";

/**
 * Laboratorio — Mis derechos en el mundo digital.
 * Práctica de la progresión CD-I-P05 (Cultura Digital I · Ciudadanía digital).
 *
 * El riesgo de este tema es quedarse en el cartel de buenas intenciones: el
 * alumno repite «tengo derecho a la privacidad» y no sabría qué hacer el día
 * que se lo pisen. Aquí lo manipulable es el DERECHO APLICADO A UN CASO, en
 * cinco modos:
 *
 *  1. «El expediente»: cuatro situaciones y tres decisiones por cada una —qué
 *     derecho o principio está en juego, qué mecanismo procede y con qué
 *     plazo, y qué deber impone ese mismo derecho cuando el que decide sobre
 *     datos ajenos eres tú.
 *  2. «Buzón ARCO»: ocho peticiones redactadas como se redactan de verdad, y
 *     hay que llevarlas a la letra correcta de ARCO. Acceso, rectificación,
 *     cancelación y oposición no son sinónimos: son cuatro trámites distintos.
 *  3. «Audita el aviso»: un aviso de privacidad verosímil (ficticio) con once
 *     cláusulas; seis cumplen la ley y cinco piden de más.
 *  4. «Escribe el término»: el glosario A5, de memoria.
 *  5. «Completa el texto»: el párrafo con huecos A6, verbatim.
 *
 * Es DOM puro (sin three.js): no infla el bundle del Worker y funciona con
 * ratón, teclado y pantalla táctil.
 *
 * Todo artículo citado se verificó contra el texto vigente de la Ley Federal
 * de Protección de Datos Personales en Posesión de los Particulares (DOF
 * 20/03/2025, última reforma DOF 14/11/2025). No se inventa ninguno.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { usePartida, MarcadorPartida } from "./_partida";
import { TableroObjetivos } from "./_objetivos";
import { RetoQuizCard } from "./_reto-quiz";
import { FichaTeorica } from "./_ficha";
import { DERECHOS_DIGITALES_FICHA } from "./derechos-digitales-ficha";
import {
  CASOS,
  TOTAL_DECISIONES,
  LETRAS,
  SOLICITUDES,
  REGLAS_SOLICITUD,
  AVISO_TITULO,
  AVISO_ENTRADA,
  CLAUSULAS,
  EXCESOS_TOTALES,
  GLOSARIO,
  DERECHOS_DIGITALES_HUECOS,
  HECHOS,
  RETO_QUIZ,
  NOTA_REACTIVO_3,
  opcionesOrdenadas,
  COMPRENSION_A1,
  REFLEXION_A3,
  type CasoDigital,
  type Letra,
} from "./derechos-digitales-data";

const NO = "#FF5E5E";
const RETO_KEY = "cen-derechos-digitales-reto";

type Modo = "caso" | "arco" | "aviso" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "caso", label: "El expediente", icono: "fa-folder-open" },
  { id: "arco", label: "Buzón ARCO", icono: "fa-inbox" },
  { id: "aviso", label: "Audita el aviso", icono: "fa-file-contract" },
  { id: "glosario", label: "Escribe el término", icono: "fa-spell-check" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

const claveDe = (casoId: string, paso: number) => `${casoId}:${paso}`;

export function LabDerechosDigitales({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("caso");

  // ── sonido, partida y pie ─────────────────────────────────────────────
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

  // ── modo 1: el expediente ─────────────────────────────────────────────
  const [casoIdx, setCasoIdx] = useState(0);
  const [resueltos, setResueltos] = useState<Record<string, string>>({});
  const [fallos, setFallos] = useState<Record<string, string[]>>({});
  const caso: CasoDigital = CASOS[casoIdx]!;

  const elegirOpcion = (casoId: string, pasoIdx: number, opcionId: string) => {
    const c = CASOS.find((x) => x.id === casoId);
    const paso = c?.pasos[pasoIdx];
    if (!c || !paso) return;
    const clave = claveDe(casoId, pasoIdx);
    if (resueltos[clave]) return;
    const op = paso.opciones.find((o) => o.id === opcionId);
    if (!op) return;

    if (op.ok) {
      const nuevos = { ...resueltos, [clave]: opcionId };
      setResueltos(nuevos);
      sfxPlace(op.porque);
      if (Object.keys(nuevos).length >= TOTAL_DECISIONES) sfxOk();
    } else {
      setFallos((f) => ({ ...f, [clave]: [...(f[clave] ?? []), opcionId] }));
      sfxNo(op.porque);
    }
  };
  const resetCasos = () => {
    setResueltos({});
    setFallos({});
    setCasoIdx(0);
    setPie(null);
  };

  // ── modo 2: buzón ARCO ────────────────────────────────────────────────
  const [ubic, setUbic] = useState<Record<string, Letra>>({});
  const [selSol, setSelSol] = useState<string | null>(null);
  const [shakeBin, setShakeBin] = useState<Letra | null>(null);

  const intentarArco = (solId: string, letra: Letra) => {
    const sol = SOLICITUDES.find((s) => s.id === solId);
    if (!sol || ubic[solId]) return;
    if (sol.letra === letra) {
      const next = { ...ubic, [solId]: letra };
      setUbic(next);
      setSelSol(null);
      sfxPlace(sol.porque);
      if (Object.keys(next).length >= SOLICITUDES.length) sfxOk();
    } else {
      const info = LETRAS.find((l) => l.id === letra);
      setShakeBin(letra);
      sfxNo(info ? `No es ${info.nombre}: ${info.noEs}. Vuelve a leer qué está pidiendo la solicitud.` : "No es esa letra.");
      window.setTimeout(() => setShakeBin(null), 420);
    }
  };
  const resetArco = () => {
    setUbic({});
    setSelSol(null);
    setPie(null);
  };

  // ── modo 3: audita el aviso ───────────────────────────────────────────
  const [veredictos, setVeredictos] = useState<Record<string, boolean>>({});
  const [fallados, setFallados] = useState<Record<string, boolean>>({});
  const [shakeCl, setShakeCl] = useState<string | null>(null);

  const juzgarClausula = (clId: string, diceExceso: boolean) => {
    const cl = CLAUSULAS.find((c) => c.id === clId);
    if (!cl || veredictos[clId]) return;
    if (cl.exceso === diceExceso) {
      const next = { ...veredictos, [clId]: true };
      setVeredictos(next);
      sfxPlace(cl.porque);
      if (Object.keys(next).length >= CLAUSULAS.length) sfxOk();
    } else {
      setFallados((f) => ({ ...f, [clId]: true }));
      setShakeCl(clId);
      sfxNo(
        cl.exceso
          ? "Mira otra vez: esta cláusula sí se está pasando. Pregúntate si ese dato hace falta para lo que la app promete hacer."
          : "Esta cláusula es de las que la ley exige. Un aviso completo no es un aviso abusivo: lo abusivo es lo que pide de más."
      );
      window.setTimeout(() => setShakeCl(null), 420);
    }
  };
  const resetAviso = () => {
    setVeredictos({});
    setFallados({});
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

  // ── hechos (A4) ───────────────────────────────────────────────────────
  const [hechos, setHechos] = useState<(boolean | null)[]>(() => HECHOS.map(() => null));
  const hechosResueltos = hechos.filter((h, i) => h !== null && h === HECHOS[i]!.respuesta).length;
  const hechosDone = hechosResueltos >= HECHOS.length;
  const responderHecho = (i: number, valor: boolean) => {
    const h = HECHOS[i]!;
    if (hechos[i] === h.respuesta) return;
    setHechos((prev) => prev.map((v, j) => (j === i ? valor : v)));
    if (valor === h.respuesta) sfxPlace(h.retro);
    else sfxNo(h.retro);
  };

  // ── reto evaluable (A2) ───────────────────────────────────────────────
  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso ──────────────────────────────────────────────────────────
  const hecho = (casoId: string, paso: number) => resueltos[claveDe(casoId, paso)] !== undefined;
  const derechosDone = CASOS.every((c) => hecho(c.id, 0));
  const mecanismosDone = CASOS.every((c) => hecho(c.id, 1));
  const deberesDone = CASOS.every((c) => hecho(c.id, 2));
  const arcoDone = Object.keys(ubic).length >= SOLICITUDES.length;
  const avisoDone = Object.keys(veredictos).length >= CLAUSULAS.length;
  const excesosDone = CLAUSULAS.filter((c) => c.exceso && veredictos[c.id]).length >= EXCESOS_TOTALES;

  const objetivos = [
    { txt: `Identifica el derecho en juego en los ${CASOS.length} casos`, done: derechosDone },
    { txt: `Elige el mecanismo que procede en los ${CASOS.length} casos`, done: mecanismosDone },
    { txt: "Nombra el deber que acompaña a cada derecho", done: deberesDone },
    { txt: `Coloca las ${SOLICITUDES.length} solicitudes en su letra de ARCO`, done: arcoDone },
    { txt: `Detecta las ${EXCESOS_TOTALES} cláusulas que piden de más`, done: excesosDone },
    { txt: `Audita las ${CLAUSULAS.length} cláusulas del aviso`, done: avisoDone },
    { txt: `Escribe los ${GLOSARIO.length} términos del glosario`, done: glosarioDone },
    { txt: "Completa el texto de la progresión", done: textoDone },
    { txt: `Acierta los ${HECHOS.length} hechos verdadero o falso`, done: hechosDone },
    { txt: "Aprueba el reto evaluable (70 %)", done: quizAprobado },
  ];

  const resetActual =
    modo === "caso"
      ? resetCasos
      : modo === "arco"
        ? resetArco
        : modo === "aviso"
          ? resetAviso
          : modo === "glosario"
            ? resetGlosario
            : resetTexto;

  const solicitudesLibres = SOLICITUDES.filter((s) => !ubic[s.id]);

  // arrastre nativo (ratón) + clic para seleccionar y clic para colocar (táctil)
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

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes derShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes derPop { 0%{transform:scale(.72);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .der-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(300px,28vw,400px); gap:22px; align-items:start; }
        @media (max-width:1000px){ .der-grid { grid-template-columns:minmax(0,1fr); } }
        .der-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 15px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13px; font-weight:800; transition:all .14s; }
        .der-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .der-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .der-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .der-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .der-icobtn:hover { background:rgba(255,255,255,0.12); }

        /* Expediente */
        .der-exp { cursor:pointer; display:flex; align-items:center; gap:10px; padding:9px 13px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:12.5px; font-weight:800; transition:all .14s; text-align:left; }
        .der-exp:hover { border-color:${T.lineStrong}; color:#fff; }
        .der-exp[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; }
        .der-exp[data-done="true"] { color:${OK}; border-color:${OK}66; }
        .der-opt { cursor:pointer; display:flex; align-items:flex-start; gap:12px; width:100%; text-align:left;
          border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2};
          font-size:13.5px; line-height:1.5; font-weight:600; padding:13px 16px; transition:all .14s; }
        .der-opt:hover:not(:disabled) { border-color:${T.lineStrong}; background:${T.glassSoft}; color:#fff; }
        .der-opt:disabled { cursor:default; }
        .der-opt[data-ok="true"] { border-color:${OK}; background:${OK}16; color:#fff; }
        .der-opt[data-bad="true"] { border-color:${NO}; background:${NO}14; color:${T.text2}; opacity:.75; }
        .der-bullet { flex-shrink:0; width:25px; height:25px; border-radius:8px; display:flex; align-items:center;
          justify-content:center; font-size:11.5px; font-weight:900; border:1px solid ${T.line}; color:${T.text3}; }
        .der-opt[data-ok="true"] .der-bullet { background:${OK}; color:#04121f; border-color:${OK}; }
        .der-opt[data-bad="true"] .der-bullet { background:${NO}; color:#04121f; border-color:${NO}; }

        /* Buzón ARCO */
        .der-sol { cursor:grab; display:flex; align-items:flex-start; gap:11px; padding:12px 14px; border-radius:13px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:${T.text}; font-size:13px; line-height:1.5;
          font-weight:600; text-align:left; transition:all .14s; user-select:none; width:100%; }
        .der-sol:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.08); transform:translateY(-2px); }
        .der-sol[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.18); box-shadow:0 0 16px -5px ${accent}; transform:translateY(-3px); }
        .der-sol:active { cursor:grabbing; }
        .der-bin { position:relative; border-radius:16px; border:2px dashed ${T.lineStrong}; padding:14px; min-height:132px;
          transition:all .16s; background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.12) 0%, transparent 62%); }
        .der-bin[data-sel="true"] { cursor:pointer; border-color:hsl(var(--tono) 78% 62%); }
        .der-bin[data-shake="true"] { animation:derShake .4s; border-color:${NO}; }
        .der-bin[data-done="true"] { border-style:solid; border-color:hsl(var(--tono) 70% 55% / 0.65); }
        .der-bin::before { content:""; position:absolute; top:0; left:12px; right:12px; height:3px; border-radius:0 0 3px 3px;
          background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }

        /* Aviso de privacidad */
        .der-cl { border-radius:14px; border:1.5px solid ${T.line}; background:${T.inset}; padding:14px 16px;
          display:flex; flex-direction:column; gap:10px; transition:all .16s; }
        .der-cl[data-shake="true"] { animation:derShake .4s; border-color:${NO}; }
        .der-cl[data-v="ok"] { border-color:${OK}66; background:${OK}0e; }
        .der-cl[data-v="exceso"] { border-color:${NO}66; background:${NO}0e; }
        .der-vbtn { cursor:pointer; padding:8px 14px; border-radius:10px; border:1.5px solid ${T.line}; background:${T.glass};
          color:${T.text2}; font-size:12.5px; font-weight:800; transition:all .14s; }
        .der-vbtn:hover:not(:disabled) { border-color:${T.lineStrong}; color:#fff; }
        .der-vbtn:disabled { cursor:default; opacity:.6; }
        .der-vbtn[data-on="ok"] { border-color:${OK}; background:${OK}22; color:#fff; opacity:1; }
        .der-vbtn[data-on="exceso"] { border-color:${NO}; background:${NO}22; color:#fff; opacity:1; }

        .der-vf { cursor:pointer; padding:8px 16px; border-radius:10px; border:1.5px solid ${T.line}; background:${T.glass};
          color:${T.text2}; font-size:12.5px; font-weight:800; transition:all .14s; }
        .der-vf:hover:not(:disabled) { border-color:${T.lineStrong}; color:#fff; }
        .der-vf:disabled { cursor:default; opacity:.85; }
        .der-vf[data-on="true"] { border-color:${OK}; background:${OK}1f; color:#fff; }
        .der-vf[data-bad="true"] { border-color:${NO}; background:${NO}1f; color:#fff; }
        .der-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:10px 17px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:13px; font-weight:800; transition:all .14s; }
        .der-btn:hover { border-color:${accent}; background:rgba(${color.rgba},0.14); }
        @media (prefers-reduced-motion: reduce){
          .der-bin[data-shake="true"], .der-cl[data-shake="true"] { animation:none; }
          .der-sol, .der-sol:hover, .der-sol[data-sel="true"] { transform:none; }
        }

        /* Cajón de teoría */
        .der-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .der-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .der-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .der-drawer[data-open="true"] { transform:translateX(0); }
        .der-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .der-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .der-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .der-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .der-teoria-fab { position:fixed; right:20px; bottom:20px; z-index:58; cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.86); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .der-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
        @media (max-width: 640px){ .der-teoria-fab { right:12px; bottom:12px; padding:10px 13px; font-size:12px; } }
      `}</style>

      {/* ── Barra de modos y herramientas ───────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        {MODOS.map((m) => (
          <button key={m.id} className="der-tab" data-on={modo === m.id} onClick={() => setModo(m.id)}>
            <i className={`fa-solid ${m.icono}`} />
            {m.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
        <button className="der-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría de la práctica">
          <i className="fa-solid fa-book-open" />
        </button>
        <button className="der-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
          <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
        </button>
        <button className="der-icobtn" onClick={resetActual} title="Reiniciar este modo">
          <i className="fa-solid fa-rotate-left" />
        </button>
      </div>

      {/* ── Cajón de teoría ─────────────────────────────────────────────── */}
      <button className="der-teoria-fab" onClick={() => setDrawer(true)}>
        <i className="fa-solid fa-book-open" />
        Teoría
      </button>
      <div className="der-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="der-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="der-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="der-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="der-drawer-body">
          <FichaTeorica data={DERECHOS_DIGITALES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>

      <div className="der-grid">
        {/* ── Columna principal ───────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {modo === "caso" && (
            <ExpedientePanel
              accent={accent}
              rgba={color.rgba}
              caso={caso}
              casoIdx={casoIdx}
              resueltos={resueltos}
              fallos={fallos}
              onCaso={(i) => {
                setCasoIdx(i);
                setPie(null);
              }}
              onElegir={(pasoIdx, opcionId) => elegirOpcion(caso.id, pasoIdx, opcionId)}
            />
          )}

          {modo === "arco" && (
            <ArcoPanel
              accent={accent}
              ubic={ubic}
              selSol={selSol}
              shakeBin={shakeBin}
              libres={solicitudesLibres}
              onSel={(id) => setSelSol((p) => (p === id ? null : id))}
              onBin={(letra) => {
                if (selSol) intentarArco(selSol, letra);
              }}
              onDropBin={(solId, letra) => intentarArco(solId, letra)}
              dragProps={dragProps}
              dropProps={dropProps}
            />
          )}

          {modo === "aviso" && (
            <AvisoPanel
              accent={accent}
              rgba={color.rgba}
              veredictos={veredictos}
              fallados={fallados}
              shakeCl={shakeCl}
              onJuzgar={juzgarClausula}
            />
          )}

          {modo === "glosario" && (
            <div style={{ ...card, padding: "20px 22px" }}>
              <Eyebrow>
                <i className="fa-solid fa-spell-check" style={{ marginRight: 8, color: accent }} />
                Glosario de la progresión · CD-I-P05-A5
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
                    txt: "Glosario completo. Fíjate en el orden: los cuatro primeros términos son el derecho; los dos últimos —aviso de privacidad y derechos ARCO— son las herramientas con las que se ejerce.",
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
              data={DERECHOS_DIGITALES_HUECOS}
              accent={accent}
              rgba={color.rgba}
              completado={textoDone}
              onCompletado={() => {
                setTextoDone(true);
                setPie({
                  ok: true,
                  txt: "Texto completo. La última palabra es la que importa: conocer los derechos no basta, hay que ejercerlos, y ejercerlos tiene una vía concreta —la solicitud ARCO ante quien trata tus datos.",
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
              {pie
                ? pie.txt
                : "Aquí aparecerá la explicación de cada decisión, con el artículo de la ley en el que se apoya. Ninguna respuesta se da por buena sin decirte por qué."}
            </span>
          </div>

          {/* Preguntas de comprensión de la lectura A1 (verbatim) */}
          <div style={{ ...card, padding: "18px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-book-open-reader" style={{ marginRight: 8, color: accent }} />
              Lectura A1 · para pensar
            </Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
              {modo === "caso" && (
                <>
                  Un derecho que no sabes <strong style={{ color: T.text }}>cómo ejercer</strong> no te sirve de nada. En cada
                  caso hay tres decisiones: qué está en juego, qué se puede hacer y qué deber te toca a ti cuando el que decide
                  sobre datos ajenos eres tú.
                </>
              )}
              {modo === "arco" && (
                <>
                  Las cuatro letras no son sinónimos: <strong style={{ color: T.text }}>acceso</strong> es ver,{" "}
                  <strong style={{ color: T.text }}>rectificación</strong> es corregir, <strong style={{ color: T.text }}>cancelación</strong> es
                  retirar y <strong style={{ color: T.text }}>oposición</strong> es que cese un uso. Pide el trámite equivocado y
                  te contestan que no procede.
                </>
              )}
              {modo === "aviso" && (
                <>
                  Un aviso de privacidad no se lee entero: se <strong style={{ color: T.text }}>audita</strong>. Ante cada
                  cláusula pregúntate si ese dato hace falta para lo que la app promete hacer. Si no hace falta, se está pasando.
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

          {/* Chuleta permanente: las cuatro letras y las reglas del trámite */}
          <div style={{ ...card, padding: "18px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-scale-balanced" style={{ marginRight: 8, color: accent }} />
              Las cuatro letras
            </Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {LETRAS.map((l) => (
                <div
                  key={l.id}
                  style={{
                    display: "flex",
                    gap: 11,
                    alignItems: "flex-start",
                    borderRadius: 12,
                    border: `1px solid ${T.line}`,
                    background: T.inset,
                    padding: "10px 12px",
                  }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      width: 28,
                      height: 28,
                      borderRadius: 9,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 900,
                      color: "#04121f",
                      background: `hsl(${l.tono} 78% 62%)`,
                    }}
                  >
                    {l.id}
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 13, fontWeight: 800, color: T.text }}>
                      {l.nombre} <span style={{ color: T.text3, fontWeight: 600 }}>· {l.clave}</span>
                    </span>
                    <span style={{ display: "block", fontSize: 12, color: T.text2, lineHeight: 1.45, marginTop: 3 }}>{l.resumen}</span>
                    <span style={{ display: "block", fontSize: 11, color: T.text3, marginTop: 3, fontStyle: "italic" }}>{l.articulo}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <HechosCard accent={accent} respuestas={hechos} onResponder={responderHecho} />

      <RetoQuizCard
        quiz={RETO_QUIZ}
        accent={accent}
        rgba={color.rgba}
        aprobado={quizAprobado}
        onAprobado={() => setQuizAprobado(true)}
        playSfx={sonido ? (ok) => (ok ? sfxOk() : sfxNo()) : undefined}
        mensajeAprobado="Sabes qué derecho está en juego y por dónde se ejerce, que es lo que separa conocer un derecho de tenerlo."
      />

      <ReflexionCard accent={accent} rgba={color.rgba} />

      {/* Nota al pie: qué es verbatim, qué es ilustrativo y de dónde sale la ley */}
      <p style={{ margin: "20px 2px 0", fontSize: 11.5, lineHeight: 1.6, color: T.text3 }}>
        <i className="fa-solid fa-quote-right" style={{ marginRight: 7, opacity: 0.7 }} />
        <strong style={{ color: T.text2 }}>Verbatim de la progresión CD-I-P05:</strong> la lectura A1 (marco teórico de la ficha
        y sus preguntas de comprensión), el reto evaluable A2, la consigna, las pistas y los criterios de la reflexión A3, los
        hechos verdadero/falso A4, el glosario A5 y el texto con huecos A6.{" "}
        <strong style={{ color: T.text2 }}>Escrito para este laboratorio (ilustrativo):</strong> los cuatro casos del
        expediente, las ocho solicitudes del buzón y el aviso de privacidad de «Tareas Exprés». Son situaciones verosímiles de
        un entorno mexicano cotidiano; ninguna persona, empresa, escuela o aplicación es real.{" "}
        <strong style={{ color: T.text2 }}>Marco legal (verificado, no inventado):</strong> todos los artículos citados son de
        la Ley Federal de Protección de Datos Personales en Posesión de los Particulares publicada en el Diario Oficial de la
        Federación el 20 de marzo de 2025, con última reforma publicada el 14 de noviembre de 2025. Esa ley abrogó la de 2010
        que menciona la lectura A1, y llama «Secretaría» a la Secretaría Anticorrupción y Buen Gobierno (art. 2, fr. XV); el
        INAI, que la lectura nombra como instancia, se extinguió.{" "}
        <strong style={{ color: T.text2 }}>Un cambio declarado:</strong> {NOTA_REACTIVO_3}{" "}
        <strong style={{ color: T.text2 }}>Lo que este laboratorio NO califica:</strong> la reflexión escrita A3. Un texto
        propio no se evalúa con honestidad desde el navegador, así que aquí solo se te recuerda la consigna y sus criterios.
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Panel «El expediente»
 * ═══════════════════════════════════════════════════════════════════════════ */
function ExpedientePanel({
  accent,
  rgba,
  caso,
  casoIdx,
  resueltos,
  fallos,
  onCaso,
  onElegir,
}: {
  accent: string;
  rgba: string;
  caso: CasoDigital;
  casoIdx: number;
  resueltos: Record<string, string>;
  fallos: Record<string, string[]>;
  onCaso: (i: number) => void;
  onElegir: (pasoIdx: number, opcionId: string) => void;
}) {
  const resueltosDelCaso = caso.pasos.filter((_, i) => resueltos[claveDe(caso.id, i)] !== undefined).length;
  const cerrado = resueltosDelCaso >= caso.pasos.length;

  return (
    <>
      {/* Selector de casos */}
      <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
        {CASOS.map((c, i) => {
          const n = c.pasos.filter((_, j) => resueltos[claveDe(c.id, j)] !== undefined).length;
          return (
            <button key={c.id} className="der-exp" data-on={i === casoIdx} data-done={n >= c.pasos.length} onClick={() => onCaso(i)}>
              <i className={`fa-solid ${n >= c.pasos.length ? "fa-circle-check" : c.icono}`} />
              <span>
                {c.titulo}
                <span style={{ marginLeft: 7, color: T.text3, fontVariantNumeric: "tabular-nums" }}>
                  {n}/{c.pasos.length}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* La escena */}
      <div
        style={{
          ...card,
          padding: "20px 22px",
          background: `radial-gradient(120% 90% at 0% 0%, rgba(${rgba},0.12) 0%, transparent 60%), ${T.glass}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <Eyebrow>
            <i className={`fa-solid ${caso.icono}`} style={{ marginRight: 8, color: accent }} />
            Caso {casoIdx + 1} de {CASOS.length} · {caso.titulo}
          </Eyebrow>
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 800,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              color: T.text3,
              border: `1px solid ${T.line}`,
              borderRadius: 999,
              padding: "3px 10px",
            }}
          >
            Caso ilustrativo
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: T.text }}>{caso.escena}</p>
      </div>

      {/* Los tres pasos, uno tras otro */}
      {caso.pasos.map((paso, i) => {
        const clave = claveDe(caso.id, i);
        const elegida = resueltos[clave];
        const malas = fallos[clave] ?? [];
        const anterior = i === 0 || resueltos[claveDe(caso.id, i - 1)] !== undefined;
        if (!anterior) {
          return (
            <div
              key={clave}
              style={{
                borderRadius: 16,
                border: `1px dashed ${T.line}`,
                background: T.inset,
                padding: "16px 20px",
                fontSize: 13,
                color: T.text3,
                display: "flex",
                alignItems: "center",
                gap: 11,
              }}
            >
              <i className="fa-solid fa-lock" />
              <span>
                <strong style={{ color: T.text2 }}>{paso.rotulo}</strong> — resuelve el paso anterior para llegar aquí.
              </span>
            </div>
          );
        }
        return (
          <div key={clave} style={{ ...card, padding: "20px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-diamond" style={{ marginRight: 8, color: accent, fontSize: 9 }} />
              Paso {i + 1} · {paso.rotulo}
            </Eyebrow>
            <div style={{ fontSize: 14.5, fontWeight: 800, color: T.text, lineHeight: 1.45, margin: "2px 0 13px" }}>{paso.pregunta}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {opcionesOrdenadas(paso.opciones, casoIdx * caso.pasos.length + i).map((op, j) => {
                const esta = elegida === op.id;
                const mala = malas.includes(op.id);
                return (
                  <button
                    key={op.id}
                    className="der-opt"
                    data-ok={esta}
                    data-bad={mala}
                    disabled={elegida !== undefined || mala}
                    onClick={() => onElegir(i, op.id)}
                  >
                    <span className="der-bullet">{String.fromCharCode(65 + j)}</span>
                    <span style={{ flex: 1 }}>{op.texto}</span>
                    {esta && <i className="fa-solid fa-circle-check" style={{ color: OK, marginTop: 3 }} />}
                    {mala && <i className="fa-solid fa-circle-xmark" style={{ color: NO, marginTop: 3 }} />}
                  </button>
                );
              })}
            </div>
            {elegida !== undefined && (
              <div
                style={{
                  marginTop: 12,
                  borderRadius: 11,
                  border: `1px solid ${OK}44`,
                  background: `${OK}10`,
                  padding: "11px 14px",
                  fontSize: 12.5,
                  color: T.text2,
                  lineHeight: 1.55,
                  animation: "derPop .25s ease",
                }}
              >
                <i className="fa-solid fa-gavel" style={{ marginRight: 9, color: OK }} />
                {paso.opciones.find((o) => o.id === elegida)?.porque}
              </div>
            )}
          </div>
        );
      })}

      {cerrado && (
        <div
          style={{
            borderRadius: 16,
            border: `1px solid ${OK}55`,
            background: `${OK}12`,
            padding: "15px 18px",
            display: "flex",
            alignItems: "center",
            gap: 13,
            flexWrap: "wrap",
          }}
        >
          <i className="fa-solid fa-folder-closed" style={{ color: OK, fontSize: 19 }} />
          <span style={{ flex: 1, minWidth: 200, fontSize: 13.5, color: T.text, lineHeight: 1.5 }}>
            Caso cerrado: nombraste el derecho, elegiste la vía y dijiste qué deber te toca a ti.
          </span>
          {casoIdx < CASOS.length - 1 && (
            <button className="der-btn" onClick={() => onCaso(casoIdx + 1)}>
              Siguiente caso <i className="fa-solid fa-arrow-right" />
            </button>
          )}
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Panel «Buzón ARCO»
 * ═══════════════════════════════════════════════════════════════════════════ */
function ArcoPanel({
  accent,
  ubic,
  selSol,
  shakeBin,
  libres,
  onSel,
  onBin,
  onDropBin,
  dragProps,
  dropProps,
}: {
  accent: string;
  ubic: Record<string, Letra>;
  selSol: string | null;
  shakeBin: Letra | null;
  libres: typeof SOLICITUDES;
  onSel: (id: string) => void;
  onBin: (letra: Letra) => void;
  onDropBin: (solId: string, letra: Letra) => void;
  dragProps: (id: string) => Record<string, unknown>;
  dropProps: (onDrop: (id: string) => void) => Record<string, unknown>;
}) {
  const colocadas = Object.keys(ubic).length;
  return (
    <>
      <div style={{ ...card, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 13, flexWrap: "wrap", gap: 8 }}>
          <Eyebrow>
            <i className="fa-solid fa-inbox" style={{ marginRight: 8, color: accent }} />
            Solicitudes por clasificar
          </Eyebrow>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: colocadas >= SOLICITUDES.length ? OK : T.text3, fontVariantNumeric: "tabular-nums" }}>
            {colocadas}/{SOLICITUDES.length}
          </span>
        </div>
        {libres.length === 0 ? (
          <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
            <i className="fa-solid fa-circle-check" /> Buzón vacío: las ocho solicitudes están en su letra.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 10 }}>
            {libres.map((s) => (
              <button key={s.id} className="der-sol" data-sel={selSol === s.id} onClick={() => onSel(s.id)} {...dragProps(s.id)}>
                <i className="fa-solid fa-envelope-open-text" style={{ color: accent, marginTop: 2, flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{s.texto}</span>
              </button>
            ))}
          </div>
        )}
        <p style={{ margin: "13px 0 0", fontSize: 12, color: T.text3, lineHeight: 1.5 }}>
          Arrastra cada solicitud a su letra, o tócala y después toca la letra. Se presentan ante quien trata tus datos, no ante
          una autoridad.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(215px,1fr))", gap: 13 }}>
        {LETRAS.map((l) => {
          const dentro = SOLICITUDES.filter((s) => ubic[s.id] === l.id);
          const total = SOLICITUDES.filter((s) => s.letra === l.id).length;
          return (
            <div
              key={l.id}
              className="der-bin"
              style={{ ["--tono" as string]: String(l.tono) }}
              data-sel={selSol !== null}
              data-shake={shakeBin === l.id}
              data-done={dentro.length >= total}
              onClick={() => onBin(l.id)}
              {...dropProps((solId) => onDropBin(solId, l.id))}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
                <span
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 900,
                    color: "#04121f",
                    background: `hsl(${l.tono} 78% 62%)`,
                  }}
                >
                  {l.id}
                </span>
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ display: "block", fontSize: 13.5, fontWeight: 900, color: T.text }}>{l.nombre}</span>
                  <span style={{ display: "block", fontSize: 11, color: T.text3 }}>{l.articulo}</span>
                </span>
                <span style={{ fontSize: 12, fontWeight: 800, color: dentro.length >= total ? OK : T.text3, fontVariantNumeric: "tabular-nums" }}>
                  {dentro.length}/{total}
                </span>
              </div>
              <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45, marginBottom: 9 }}>{l.clave}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {dentro.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      animation: "derPop .25s ease",
                      borderRadius: 10,
                      border: `1px solid ${OK}55`,
                      background: `${OK}12`,
                      padding: "8px 11px",
                      fontSize: 11.5,
                      color: T.text2,
                      lineHeight: 1.45,
                    }}
                  >
                    <i className="fa-solid fa-check" style={{ color: OK, marginRight: 7 }} />
                    {s.texto}
                  </div>
                ))}
                {dentro.length === 0 && (
                  <div style={{ fontSize: 11.5, color: T.text3, display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
                    <i className="fa-solid fa-arrow-down-to-bracket" /> Suelta aquí
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reglas del trámite: verificadas en la ley */}
      <div style={{ ...card, padding: "18px 22px" }}>
        <Eyebrow>
          <i className="fa-solid fa-file-signature" style={{ marginRight: 8, color: accent }} />
          Cómo funciona el trámite
        </Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 11 }}>
          {REGLAS_SOLICITUD.map((r) => (
            <div key={r.titulo} style={{ borderRadius: 12, border: `1px solid ${T.line}`, background: T.inset, padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
                <i className={`fa-solid ${r.icono}`} style={{ color: accent, fontSize: 13 }} />
                <span style={{ fontSize: 12.5, fontWeight: 800, color: T.text }}>{r.titulo}</span>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: T.text2, lineHeight: 1.5 }}>{r.detalle}</p>
            </div>
          ))}
        </div>
        <p style={{ margin: "12px 0 0", fontSize: 11.5, color: T.text3, lineHeight: 1.5, fontStyle: "italic" }}>
          Ley Federal de Protección de Datos Personales en Posesión de los Particulares, DOF 20/03/2025 (última reforma DOF
          14/11/2025). «Días» significa días hábiles (art. 2, fr. VIII).
        </p>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Panel «Audita el aviso de privacidad»
 * ═══════════════════════════════════════════════════════════════════════════ */
function AvisoPanel({
  accent,
  rgba,
  veredictos,
  fallados,
  shakeCl,
  onJuzgar,
}: {
  accent: string;
  rgba: string;
  veredictos: Record<string, boolean>;
  fallados: Record<string, boolean>;
  shakeCl: string | null;
  onJuzgar: (clId: string, diceExceso: boolean) => void;
}) {
  const hechas = Object.keys(veredictos).length;
  const excesosHallados = CLAUSULAS.filter((c) => c.exceso && veredictos[c.id]).length;

  return (
    <div
      style={{
        ...card,
        padding: "22px 24px",
        background: `radial-gradient(120% 70% at 100% 0%, rgba(${rgba},0.1) 0%, transparent 58%), ${T.glass}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-file-contract" style={{ marginRight: 8, color: accent }} />
          {AVISO_TITULO}
        </Eyebrow>
        <span style={{ fontSize: 12.5, fontWeight: 800, color: hechas >= CLAUSULAS.length ? OK : T.text3, fontVariantNumeric: "tabular-nums" }}>
          {hechas}/{CLAUSULAS.length} · {excesosHallados}/{EXCESOS_TOTALES} excesos
        </span>
      </div>

      <p style={{ margin: "0 0 16px", fontSize: 12.5, color: T.text2, lineHeight: 1.6 }}>{AVISO_ENTRADA}</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        {CLAUSULAS.map((cl, i) => {
          const resuelta = veredictos[cl.id] === true;
          const fallo = fallados[cl.id] === true;
          return (
            <div key={cl.id} className="der-cl" data-shake={shakeCl === cl.id} data-v={resuelta ? (cl.exceso ? "exceso" : "ok") : undefined}>
              <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                <span
                  style={{
                    flexShrink: 0,
                    width: 25,
                    height: 25,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11.5,
                    fontWeight: 900,
                    color: "#04121f",
                    background: accent,
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 10.5, fontWeight: 800, letterSpacing: "0.09em", textTransform: "uppercase", color: T.text3 }}>
                    {cl.rotulo}
                  </span>
                  <span style={{ display: "block", fontSize: 14, color: T.text, lineHeight: 1.55, marginTop: 4 }}>{cl.texto}</span>
                </span>
              </div>

              <div style={{ display: "flex", gap: 9, flexWrap: "wrap", alignItems: "center" }}>
                <button
                  className="der-vbtn"
                  data-on={resuelta && !cl.exceso ? "ok" : undefined}
                  disabled={resuelta}
                  onClick={() => onJuzgar(cl.id, false)}
                >
                  <i className="fa-solid fa-circle-check" style={{ marginRight: 7 }} />
                  Cumple la ley
                </button>
                <button
                  className="der-vbtn"
                  data-on={resuelta && cl.exceso ? "exceso" : undefined}
                  disabled={resuelta}
                  onClick={() => onJuzgar(cl.id, true)}
                >
                  <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 7 }} />
                  Se está pasando
                </button>
                {fallo && !resuelta && <span style={{ fontSize: 12, color: NO, fontWeight: 700 }}>Vuelve a leerla</span>}
              </div>

              {resuelta && (
                <div
                  style={{
                    borderRadius: 11,
                    border: `1px solid ${T.line}`,
                    background: T.glass,
                    padding: "10px 13px",
                    fontSize: 12.5,
                    color: T.text2,
                    lineHeight: 1.55,
                    animation: "derPop .25s ease",
                  }}
                >
                  <i className="fa-solid fa-gavel" style={{ marginRight: 9, color: cl.exceso ? NO : OK }} />
                  {cl.porque}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {hechas >= CLAUSULAS.length && (
        <div
          style={{
            marginTop: 16,
            borderRadius: 14,
            border: `1px solid ${OK}55`,
            background: `${OK}12`,
            padding: "14px 17px",
            fontSize: 13.5,
            color: T.text,
            lineHeight: 1.55,
            display: "flex",
            gap: 12,
          }}
        >
          <i className="fa-solid fa-clipboard-check" style={{ color: OK, fontSize: 18, marginTop: 1 }} />
          <span>
            Auditoría terminada. Las {EXCESOS_TOTALES} cláusulas abusivas tenían algo en común: pedían datos que la finalidad
            declarada no necesitaba, o intentaban quitarte un derecho que la ley no permite negociar.
          </span>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Hechos verdadero/falso (A4, verbatim)
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
  return (
    <div style={{ ...card, padding: "22px 24px", marginTop: 22 }}>
      <Eyebrow>
        <i className="fa-solid fa-scale-unbalanced" style={{ marginRight: 8, color: accent }} />
        Hechos · verdadero o falso (CD-I-P05-A4)
      </Eyebrow>
      <div style={{ display: "flex", flexDirection: "column", gap: 13, marginTop: 4 }}>
        {HECHOS.map((h, i) => {
          const r = respuestas[i];
          const acertado = r !== null && r !== undefined && r === h.respuesta;
          const fallado = r !== null && r !== undefined && r !== h.respuesta;
          return (
            <div key={i} style={{ borderRadius: 13, border: `1px solid ${T.line}`, background: T.inset, padding: "13px 16px" }}>
              <div style={{ fontSize: 13.5, color: T.text, lineHeight: 1.5, marginBottom: 10 }}>{h.enunciado}</div>
              <div style={{ display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap" }}>
                <button
                  className="der-vf"
                  data-on={acertado && h.respuesta}
                  data-bad={fallado && r === true}
                  disabled={acertado}
                  onClick={() => onResponder(i, true)}
                >
                  Verdadero
                </button>
                <button
                  className="der-vf"
                  data-on={acertado && !h.respuesta}
                  data-bad={fallado && r === false}
                  disabled={acertado}
                  onClick={() => onResponder(i, false)}
                >
                  Falso
                </button>
                {(acertado || fallado) && (
                  <span style={{ fontSize: 12.5, color: acertado ? OK : NO, lineHeight: 1.5, flex: 1, minWidth: 200 }}>{h.retro}</span>
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
 * Reflexión escrita (A3, verbatim) — se recuerda, no se califica
 * ═══════════════════════════════════════════════════════════════════════════ */
function ReflexionCard({ accent, rgba }: { accent: string; rgba: string }) {
  return (
    <div style={{ ...card, padding: "22px 24px", marginTop: 22 }}>
      <Eyebrow>
        <i className="fa-solid fa-feather-pointed" style={{ marginRight: 8, color: accent }} />
        Para tu reflexión escrita · CD-I-P05-A3
      </Eyebrow>
      <p style={{ margin: "2px 0 14px", fontSize: 14.5, color: T.text, lineHeight: 1.65 }}>{REFLEXION_A3.prompt}</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 13 }}>
        <div style={{ borderRadius: 13, border: `1px solid rgba(${rgba},0.28)`, background: `rgba(${rgba},0.07)`, padding: "13px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: accent, marginBottom: 8 }}>
            Criterios de evaluación
          </div>
          <ul style={{ margin: 0, paddingLeft: 17, display: "flex", flexDirection: "column", gap: 6 }}>
            {REFLEXION_A3.criterios.map((c, i) => (
              <li key={i} style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
                {c}
              </li>
            ))}
          </ul>
        </div>
        <div style={{ borderRadius: 13, border: `1px solid ${T.line}`, background: T.inset, padding: "13px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: T.text3, marginBottom: 8 }}>
            Pistas de la actividad
          </div>
          <ul style={{ margin: 0, paddingLeft: 17, display: "flex", flexDirection: "column", gap: 6 }}>
            {REFLEXION_A3.pistas.map((p, i) => (
              <li key={i} style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p style={{ margin: "13px 0 0", fontSize: 11.5, color: T.text3, lineHeight: 1.55 }}>
        <i className="fa-solid fa-circle-info" style={{ marginRight: 7 }} />
        La cuarta pista y el cuarto criterio mencionan el INAI porque así están redactados en la actividad. Si escribes tu
        reflexión, nombra la autoridad vigente: la Secretaría Anticorrupción y Buen Gobierno (LFPDPPP, art. 2, fr. XV).
      </p>
    </div>
  );
}
