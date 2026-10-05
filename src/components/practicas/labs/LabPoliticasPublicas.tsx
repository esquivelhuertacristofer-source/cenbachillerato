"use client";

/**
 * Laboratorio — Políticas públicas: SIMULADOR del ciclo de la política pública
 * Práctica experimental para CS-III-P02-A4 (Ciencias Sociales III).
 *
 * El alumno no lee el ciclo: lo HACE. Es la alcaldía de «San Isidro del Valle»,
 * un municipio FICTICIO (simulación; todas las cifras son valores de juego, no
 * estadísticas reales) con un problema: el abandono escolar en bachillerato.
 * Las cinco etapas del ciclo (A1, verbatim) son los modos del laboratorio y se
 * desbloquean en orden:
 *  1. Identificar — lee 6 evidencias y elige las 2 causas de raíz (hay señuelos).
 *  2. Diseñar     — combina hasta 3 de 6 políticas con un presupuesto fijo.
 *  3. Adoptar     — consulta ciudadana, cabildo o decreto: tiempo contra apoyo.
 *  4. Implementar — 3 imprevistos (semilla determinista) y una decisión por cada uno.
 *  5. Evaluar     — el tablero se anima de «antes» a «después», se distingue el
 *                   indicador de impacto del que solo cuenta productos, aparece la
 *                   contraloría social y se publica el informe con contrafactual.
 *  + «Escribe el término» y «Completa el texto» (glosario A5 y fill_blanks A6,
 *    verbatim) como refuerzo, y el cuestionario V/F (A4 y A2) en la pestaña Reto.
 *
 * Las consecuencias salen de un modelo determinista y comentado en
 * `politicas-publicas-sim.ts`. DOM + SVG/CSS (sin three.js).
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, Eyebrow } from "./_kit";
import { LabShell, Bloque, BotonHerramienta } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { POLITICAS_PUBLICAS_HUECOS } from "./politicas-publicas-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { POLITICAS_PUBLICAS_FICHA } from "./politicas-publicas-ficha";
import { CICLO, PARES, GLOSARIO, QUIZ, DATO_POLITICAS } from "./politicas-publicas-data";
import {
  ADOPCIONES,
  ALTERNATIVAS,
  CAUSAS,
  EVIDENCIAS,
  INDICADORES_EVAL,
  INICIO,
  MAX_POLITICAS,
  POLITICAS,
  PRESUPUESTO,
  eventosDe,
  gastoDe,
  metaLograda,
  simular,
  type CausaId,
  type Evidencia,
  type Resultado,
} from "./politicas-publicas-sim";

const NO = "#FF5E5E";
const AMBAR = "#FFC75A";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
const RETO_KEY = "cen-politicas-publicas-reto";

type Modo = "identificar" | "disenar" | "adoptar" | "implementar" | "evaluar" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "identificar", label: "1 Identificar", icono: "fa-magnifying-glass-chart" },
  { id: "disenar", label: "2 Diseñar", icono: "fa-pen-ruler" },
  { id: "adoptar", label: "3 Adoptar", icono: "fa-landmark" },
  { id: "implementar", label: "4 Implementar", icono: "fa-person-digging" },
  { id: "evaluar", label: "5 Evaluar", icono: "fa-chart-line" },
  { id: "glosario", label: "Escribe el término", icono: "fa-keyboard" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

const ETAPA_DE: Partial<Record<Modo, number>> = { identificar: 0, disenar: 1, adoptar: 2, implementar: 3, evaluar: 4 };

/**
 * El glosario de esta progresión no trae ejemplo sino `etiquetas` (A5), que es
 * lo que el modo anterior enseñaba como pista. Se conservan tal cual.
 */
const PARES_GLOSARIO = GLOSARIO.map((g) => ({ ...g, ejemplo: g.etiquetas.join(" · ") }));

export function LabPoliticasPublicas({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("identificar");

  // ── sonido ────────────────────────────────────────────────────────────
  const partida = usePartida();
  const [sonido, setSonido] = useState(false);
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
  const sfxOk = () => sonido && audioRef.current?.correcto();
  const sfxNo = () => {
    partida.error();
    return sonido && audioRef.current?.incorrecto();
  };
  const sfxPlace = () => {
    partida.acierto();
    return sonido && audioRef.current?.blip();
  };
  const sfxClick = () => sonido && audioRef.current?.blip();

  // ── estado de la simulación ───────────────────────────────────────────
  const [leidas, setLeidas] = useState<string[]>([]);
  const [causasSel, setCausasSel] = useState<CausaId[]>([]);
  const [diagDone, setDiagDone] = useState(false);
  const [polSel, setPolSel] = useState<string[]>([]);
  const [disenoDone, setDisenoDone] = useState(false);
  const [adopSel, setAdopSel] = useState<string | null>(null);
  const [adoptDone, setAdoptDone] = useState(false);
  const [reacciones, setReacciones] = useState<Record<string, string>>({});
  const [evalPick, setEvalPick] = useState<string | null>(null);
  const [impactoOk, setImpactoOk] = useState(false);
  const [evalDone, setEvalDone] = useState(false);

  const resetSim = () => {
    setLeidas([]);
    setCausasSel([]);
    setDiagDone(false);
    setPolSel([]);
    setDisenoDone(false);
    setAdopSel(null);
    setAdoptDone(false);
    setReacciones({});
    setEvalPick(null);
    setImpactoOk(false);
    setEvalDone(false);
    partida.reiniciar();
    setModo("identificar");
  };

  // El glosario se escribe: el contador hace de `key` y deja las tarjetas en blanco.
  const [glosarioDone, setGlosarioDone] = useState(false);
  const [glosIntento, setGlosIntento] = useState(0);
  const resetGlosario = () => {
    setGlosarioDone(false);
    setGlosIntento((n) => n + 1);
  };
  const resetTexto = () => {
    setTextoDone(false);
    setTextoIntento((n) => n + 1);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── derivados ─────────────────────────────────────────────────────────
  const eventos = adoptDone ? eventosDe(polSel, adopSel ?? "") : [];
  const implDone = adoptDone && eventos.every((e) => reacciones[e.id]);
  const decisiones = { politicas: polSel, adopcion: adopSel ?? "", reacciones, eventos: eventos.map((e) => e.id) };
  const resultado: Resultado = simular(decisiones);
  const diagCorrecto = causasSel.length === 2 && causasSel.every((c) => CAUSAS.find((x) => x.id === c)?.raiz);
  const etapasAbiertas = [true, diagDone, disenoDone, adoptDone, implDone];
  const simDone = evalDone;
  const meta = simDone && metaLograda(resultado);

  const modosHechos = (simDone ? 1 : 0) + (glosarioDone ? 1 : 0) + (textoDone ? 1 : 0);
  const estrellasBase = partida.estrellasCon(modosHechos, 3);
  // Terminar con todo pero sin cumplir la meta del municipio no da la tercera.
  const estrellas = modosHechos >= 3 && !meta ? Math.min(2, estrellasBase) : estrellasBase;

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);
  useEffect(() => {
    if (estrellas > 0) registraEstrellas(estrellas);
  }, [estrellas, registraEstrellas]);

  const objetivos = [
    { txt: "Identifica las 2 causas de raíz", done: diagDone && diagCorrecto },
    { txt: "Diseña una política dentro del presupuesto", done: disenoDone },
    { txt: "Termina el ciclo hasta la evaluación", done: evalDone },
    { txt: "Logra bajar el indicador con equidad", done: meta },
    { txt: "Resuelve el reto", done: quizAprobado },
  ];

  const resetActual = modo === "texto" ? resetTexto : modo === "glosario" ? resetGlosario : resetSim;
  const etapaIdx = ETAPA_DE[modo];
  const lectura = `${modosHechos}/3 · ${bestEstrellas}★`;

  // ── acciones ──────────────────────────────────────────────────────────
  const leer = (id: string) => {
    sfxClick();
    setLeidas((l) => (l.includes(id) ? l : [...l, id]));
  };
  const toggleCausa = (id: CausaId) => {
    if (diagDone) return;
    sfxClick();
    setCausasSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length >= 2 ? s : [...s, id]));
  };
  const confirmarDiag = () => {
    if (causasSel.length !== 2 || diagDone) return;
    let todas = true;
    for (const c of causasSel) {
      if (CAUSAS.find((x) => x.id === c)?.raiz) partida.acierto();
      else {
        sfxNo();
        todas = false;
      }
    }
    if (todas) sfxOk();
    setDiagDone(true);
  };
  const togglePol = (id: string) => {
    if (disenoDone) return;
    sfxClick();
    setPolSel((s) => {
      if (s.includes(id)) return s.filter((x) => x !== id);
      if (s.length >= MAX_POLITICAS) return s;
      const p = POLITICAS.find((x) => x.id === id);
      if (!p || gastoDe(s) + p.costo > PRESUPUESTO) return s;
      return [...s, id];
    });
  };
  const confirmarDiseno = () => {
    if (polSel.length < 2 || disenoDone) return;
    sfxPlace();
    setDisenoDone(true);
  };
  const reservaTrasDiseno = PRESUPUESTO - gastoDe(polSel);
  const confirmarAdopcion = () => {
    if (!adopSel || adoptDone) return;
    sfxPlace();
    setAdoptDone(true);
  };
  const reaccionar = (eventoId: string, opId: string) => {
    if (reacciones[eventoId]) return;
    sfxClick();
    setReacciones((r) => ({ ...r, [eventoId]: opId }));
  };
  const elegirIndicador = (id: string) => {
    if (impactoOk) return;
    setEvalPick(id);
    if (INDICADORES_EVAL.find((x) => x.id === id)?.tipo === "impacto") {
      sfxPlace();
      setImpactoOk(true);
    } else {
      sfxNo();
    }
  };
  const publicarInforme = () => {
    if (!impactoOk || evalDone) return;
    sfxOk();
    setEvalDone(true);
  };

  // Reserva «en vivo» durante la implementación (diseño + adopción + reacciones).
  const adop = ADOPCIONES.find((a) => a.id === adopSel);
  const reservaVivo = Math.max(
    0,
    reservaTrasDiseno -
      (adop?.costo ?? 0) -
      eventos.reduce((s, e) => s + (e.opciones.find((o) => o.id === reacciones[e.id])?.costo ?? 0), 0)
  );

  const etapaActual = etapaIdx !== undefined ? CICLO[etapaIdx]! : null;
  const bloqueada = etapaIdx !== undefined && !etapasAbiertas[etapaIdx];

  const escena = (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
      <style>{ESTILOS(accent, color.rgba)}</style>

      {etapaIdx !== undefined && bloqueada && <Bloqueada n={etapaIdx} />}

      {modo === "identificar" && (
        <EtapaIdentificar
          accent={accent}
          leidas={leidas}
          onLeer={leer}
          causasSel={causasSel}
          onCausa={toggleCausa}
          diagDone={diagDone}
          onConfirmar={confirmarDiag}
        />
      )}

      {modo === "disenar" && !bloqueada && (
        <EtapaDisenar
          causasSel={causasSel}
          polSel={polSel}
          onToggle={togglePol}
          done={disenoDone}
          onConfirmar={confirmarDiseno}
          accent={accent}
        />
      )}

      {modo === "adoptar" && !bloqueada && (
        <EtapaAdoptar
          reserva={reservaTrasDiseno}
          sel={adopSel}
          onSel={(id) => !adoptDone && setAdopSel(id)}
          done={adoptDone}
          onConfirmar={confirmarAdopcion}
          accent={accent}
        />
      )}

      {modo === "implementar" && !bloqueada && (
        <EtapaImplementar eventos={eventos} reacciones={reacciones} reserva={reservaVivo} onReaccion={reaccionar} resultado={resultado} accent={accent} />
      )}

      {modo === "evaluar" && !bloqueada && (
        <EtapaEvaluar
          resultado={resultado}
          decisiones={decisiones}
          pick={evalPick}
          impactoOk={impactoOk}
          onPick={elegirIndicador}
          done={evalDone}
          onPublicar={publicarInforme}
          estrellas={bestEstrellas}
          meta={meta}
          onReiniciar={resetSim}
          accent={accent}
        />
      )}

      {modo === "glosario" && (
        <EscribeTermino
          key={glosIntento}
          pares={PARES_GLOSARIO}
          accent={accent}
          rgba={color.rgba}
          completado={glosarioDone}
          instrucciones="Lee la definición y escribe el término."
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
          data={POLITICAS_PUBLICAS_HUECOS}
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
  );

  const pistaDe: Record<Modo, string> = {
    identificar: "Abre las evidencias y distingue DATOS de opiniones. Una causa de raíz es la que la evidencia respalda, no la que suena más lógica.",
    disenar: "El tablero te dice qué prometen las medidas, no qué logran. Si marcaste bien las causas, verás a cuál ataca cada una. Ojo con dejar la reserva en cero.",
    adoptar: "Legitimar cuesta tiempo o dinero; saltarte el diálogo es rápido pero resta eficacia. Piensa qué te conviene con tu reserva.",
    implementar: "Los imprevistos salen de tus decisiones anteriores (siempre los mismos con las mismas decisiones). Cada reacción tiene costo en meses, reserva, apoyo o equidad.",
    evaluar: "Contar lo que se hizo (becas, gasto) no demuestra que el problema cambió. Busca el indicador del PROBLEMA que querías resolver.",
    glosario: "Lee la definición y sus etiquetas y escribe el término. Si te atoras, la pista te da la inicial y las letras.",
    texto: "Escribe la palabra que falta en cada hueco del texto.",
  };

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
          <BotonHerramienta icono="fa-rotate-left" titulo={modo === "texto" || modo === "glosario" ? "Reiniciar este modo" : "Reiniciar la simulación"} onClick={resetActual} />
        </>
      }
      lectura={lectura}
      objetivos={objetivos}
      retoKey={RETO_KEY}
      pestanas={[
        {
          id: "pistas",
          etiqueta: "Etapa",
          icono: "fa-lightbulb",
          contenido: (
            <>
              {etapaActual && (
                <Bloque titulo={`${etapaActual.etapa}: ${etapaActual.texto}`} icono="fa-arrows-spin">
                  <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>{etapaActual.detalle}</div>
                </Bloque>
              )}
              <Bloque titulo="Tu partida" icono="fa-gauge-high">
                <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
                <div style={{ display: "flex", gap: 4 }}>
                  {[1, 2, 3].map((s) => (
                    <i key={s} className="fa-solid fa-star" style={{ fontSize: 20, color: s <= bestEstrellas ? AMBAR : "rgba(255,255,255,0.16)" }} />
                  ))}
                </div>
                <div style={{ fontSize: 14, color: T.text2 }}>
                  {bestEstrellas >= 3 ? "¡Dominas el ciclo de las políticas públicas!" : "Termina la simulación y los dos modos de refuerzo; la tercera pide bajar el abandono con equidad y 2 errores o menos."}
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
                <FichaTeorica data={POLITICAS_PUBLICAS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <Bloque titulo="Las 5 etapas del ciclo" icono="fa-arrows-spin">
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {CICLO.map((c) => (
                    <div key={c.id} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>{c.etapa} · {c.texto}.</strong> {c.detalle}
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Conceptos clave" icono="fa-link">
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
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>{DATO_POLITICAS}</div>
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Estilos
 * ═══════════════════════════════════════════════════════════════════════════ */
const ESTILOS = (accent: string, rgba: string) => `
  @keyframes ppPop { 0%{transform:scale(.7);opacity:0;} 100%{transform:scale(1);opacity:1;} }
  @keyframes ppShake { 0%,100%{transform:translateX(0);} 25%{transform:translateX(-5px);} 75%{transform:translateX(5px);} }
  .pp-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap:11px; }
  .pp-grid-s { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 140px), 1fr)); gap:10px; }
  .pp-card { position:relative; display:flex; flex-direction:column; gap:7px; text-align:left; padding:13px 14px; border-radius:14px;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text}; font-size:14px; line-height:1.45; cursor:pointer; transition:transform .14s, border-color .14s, background .14s; min-width:0; }
  .pp-card:hover:not(:disabled) { border-color:${T.lineStrong}; transform:translateY(-2px); }
  .pp-card[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.16); box-shadow:0 0 18px -6px ${accent}; }
  .pp-card[data-ok="true"] { border-color:${OK}88; background:${OK}14; }
  .pp-card[data-mal="true"] { border-color:${NO}88; background:${NO}12; }
  .pp-card:disabled { cursor:not-allowed; opacity:.5; }
  .pp-card[data-quieta="true"] { cursor:default; }
  .pp-card h5 { margin:0; font-size:15px; font-weight:800; }
  .pp-tag { display:inline-flex; align-items:center; gap:6px; font-size:14px; font-weight:700; padding:3px 9px; border-radius:8px; border:1px solid ${T.line}; background:${T.inset}; color:${T.text2}; }
  .pp-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:12px 18px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; }
  .pp-btn:hover:not(:disabled) { border-color:${T.lineStrong}; }
  .pp-btn:disabled { opacity:.45; cursor:not-allowed; }
  .pp-btn-main { background:${accent}; color:#04121f; border-color:transparent; }
  .pp-panel { border-radius:16px; border:1px solid ${T.line}; background:${T.glass}; padding:14px 16px; display:flex; flex-direction:column; gap:11px; min-width:0; }
  .pp-pop { animation:ppPop .28s ease; }
  .pp-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
  .pp-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
  .pp-q:disabled{ cursor:default; }
  .pp-barra { height:12px; border-radius:7px; background:${T.inset}; overflow:hidden; border:1px solid ${T.line}; }
  .pp-barra > i { display:block; height:100%; border-radius:7px; transition:width .9s cubic-bezier(.2,.8,.2,1); }
  @media (prefers-reduced-motion: reduce){
    .pp-pop { animation:none; }
    .pp-card, .pp-card:hover:not(:disabled) { transform:none; transition:none; }
    .pp-barra > i { transition:none; }
  }
  /* Cabecera de color de cada panel */
  .pp-panel:nth-of-type(6n+1) { --tono:188; }
  .pp-panel:nth-of-type(6n+2) { --tono:262; }
  .pp-panel:nth-of-type(6n+3) { --tono:44; }
  .pp-panel:nth-of-type(6n+4) { --tono:152; }
  .pp-panel:nth-of-type(6n+5) { --tono:330; }
  .pp-panel:nth-of-type(6n+6) { --tono:18; }
  .pp-panel::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
    background:linear-gradient(90deg, hsl(var(--tono, 188) 78% 62%) 0%, hsl(var(--tono, 188) 78% 62% / 0.15) 100%); }
  .pp-panel { position:relative; }
  .pp-panel[data-done="true"] { border-color:${OK}66; }
`;

/* ═══════════════════════════════════════════════════════════════════════════
 * Piezas visuales
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Medidor semicircular SVG. Anima de `desde` a `valor` al montarse o cambiar. */
function Medidor({
  etiqueta,
  valor,
  max,
  sufijo,
  buenoAlto,
  desde,
  icono,
}: {
  etiqueta: string;
  valor: number;
  max: number;
  sufijo: string;
  buenoAlto: boolean;
  desde?: number;
  icono: string;
}) {
  const [v, setV] = useState(desde ?? valor);
  useEffect(() => {
    const t = window.setTimeout(() => setV(valor), 80);
    return () => window.clearTimeout(t);
  }, [valor]);
  const frac = Math.max(0, Math.min(1, v / max));
  const bueno = buenoAlto ? frac : 1 - frac;
  const col = bueno >= 0.6 ? OK : bueno >= 0.35 ? AMBAR : NO;
  return (
    <div className="pp-panel" style={{ alignItems: "center", gap: 4, padding: "12px 10px" }}>
      <svg viewBox="0 0 120 72" role="img" aria-label={`${etiqueta}: ${Math.round(valor * 10) / 10}${sufijo}`} style={{ width: "100%", maxWidth: 150, height: "auto" }}>
        <path d="M10 62 A50 50 0 0 1 110 62" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="11" strokeLinecap="round" pathLength={100} />
        <path d="M10 62 A50 50 0 0 1 110 62" fill="none" stroke={col} strokeWidth="11" strokeLinecap="round" pathLength={100} strokeDasharray={`${frac * 100} 100`} style={{ transition: "stroke-dasharray .9s cubic-bezier(.2,.8,.2,1), stroke .9s" }} />
        <text x="60" y="52" textAnchor="middle" fontSize="22" fontWeight="800" fill="#fff">
          {Math.round(v * 10) / 10}
          <tspan fontSize="12" fill="rgba(255,255,255,0.6)">{sufijo}</tspan>
        </text>
      </svg>
      <div style={{ fontSize: 14, fontWeight: 800, color: T.text, textAlign: "center", display: "flex", alignItems: "center", gap: 6 }}>
        <i className={`fa-solid ${icono}`} style={{ color: col }} aria-hidden /> {etiqueta}
      </div>
      {desde !== undefined && (
        <div style={{ fontSize: 14, color: T.text3 }}>antes: {desde}{sufijo}</div>
      )}
    </div>
  );
}

/** Tablero municipal: 4 indicadores (valores de simulación). */
function Tablero({ abandono, satisfaccion, equidad, reserva, desde }: { abandono: number; satisfaccion: number; equidad: number; reserva: number; desde?: { abandono: number; satisfaccion: number; equidad: number } }) {
  return (
    <div className="pp-panel" style={{ gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <Eyebrow>Tablero municipal · San Isidro del Valle</Eyebrow>
        <span className="pp-tag"><i className="fa-solid fa-flask" aria-hidden /> Simulación: cifras ficticias</span>
      </div>
      <div className="pp-grid-s">
        <Medidor etiqueta="Abandono" valor={abandono} max={50} sufijo="%" buenoAlto={false} desde={desde?.abandono} icono="fa-person-walking-arrow-right" />
        <Medidor etiqueta="Satisfacción" valor={satisfaccion} max={100} sufijo="" buenoAlto icono="fa-face-smile" desde={desde?.satisfaccion} />
        <Medidor etiqueta="Equidad" valor={equidad} max={100} sufijo="" buenoAlto icono="fa-scale-balanced" desde={desde?.equidad} />
        <Medidor etiqueta="Reserva" valor={reserva} max={PRESUPUESTO} sufijo=" M" buenoAlto icono="fa-piggy-bank" />
      </div>
    </div>
  );
}

function Bloqueada({ n }: { n: number }) {
  const c = CICLO[n]!;
  const prev = n > 0 ? CICLO[n - 1]!.texto : "";
  return (
    <div className="pp-panel" data-bloqueada="true" style={{ alignItems: "flex-start" }}>
      <Eyebrow>{c.etapa} · {c.texto}</Eyebrow>
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, fontWeight: 800, color: T.text }}>
        <i className="fa-solid fa-lock" aria-hidden style={{ color: AMBAR }} />
        Etapa bloqueada: termina primero «{prev}».
      </div>
      <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>
        <strong style={{ color: T.text }}>Qué se hace en esta etapa.</strong> {c.detalle}
      </div>
    </div>
  );
}

function Encabezado({ n, instruccion }: { n: number; instruccion: string }) {
  const c = CICLO[n]!;
  return (
    <div className="pp-panel">
      <Eyebrow>{c.etapa} · {c.texto}</Eyebrow>
      <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>{instruccion}</div>
    </div>
  );
}

function Estrellitas({ n, max = 5 }: { n: number; max?: number }) {
  return (
    <span aria-label={`${n} de ${max}`} style={{ whiteSpace: "nowrap" }}>
      {Array.from({ length: max }, (_, i) => (
        <i key={i} className="fa-solid fa-star" aria-hidden style={{ fontSize: 14, color: i < n ? AMBAR : "rgba(255,255,255,0.16)" }} />
      ))}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Etapa 1 · Identificar
 * ═══════════════════════════════════════════════════════════════════════════ */
const ICONO_EVID: Record<Evidencia["tipo"], string> = { testimonio: "fa-comment-dots", grafica: "fa-chart-simple", mapa: "fa-map-location-dot", opinion: "fa-bullhorn" };

function colorAbandono(a: number) {
  return a >= 36 ? NO : a >= 20 ? AMBAR : OK;
}

function MiniMapa({ e }: { e: Evidencia }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox="0 0 100 100" role="img" aria-label="Mapa esquemático del municipio" style={{ width: "100%", maxWidth: 260, height: "auto", borderRadius: 12, background: "rgba(2,12,28,0.55)", border: `1px solid ${T.line}` }}>
        {e.puntos?.map((p) => (
          <line key={`l-${p.nombre}`} x1="50" y1="52" x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeDasharray="3 3" />
        ))}
        {e.puntos?.map((p) => (
          <circle key={p.nombre} cx={p.x} cy={p.y} r={5 + p.abandono / 8} fill={colorAbandono(p.abandono)} fillOpacity="0.85" stroke="#fff" strokeOpacity="0.5" />
        ))}
      </svg>
      <div style={{ display: "grid", gap: 4 }}>
        {e.puntos?.map((p) => (
          <div key={p.nombre} style={{ fontSize: 14, color: T.text2, display: "flex", alignItems: "center", gap: 8 }}>
            <i className="fa-solid fa-circle" aria-hidden style={{ color: colorAbandono(p.abandono), fontSize: 14 }} />
            <strong style={{ color: T.text }}>{p.nombre}</strong> · {p.km} km · {p.abandono}% abandono
          </div>
        ))}
      </div>
    </div>
  );
}

function EtapaIdentificar({
  accent,
  leidas,
  onLeer,
  causasSel,
  onCausa,
  diagDone,
  onConfirmar,
}: {
  accent: string;
  leidas: string[];
  onLeer: (id: string) => void;
  causasSel: CausaId[];
  onCausa: (id: CausaId) => void;
  diagDone: boolean;
  onConfirmar: () => void;
}) {
  const [abierta, setAbierta] = useState<string | null>(null);
  const puedeElegir = leidas.length >= 4;
  return (
    <>
      <Encabezado n={0} instruccion="San Isidro del Valle (municipio FICTICIO) tiene un problema: de cada 100 jóvenes que empiezan el bachillerato, 28 lo abandonan (valor de simulación). Abre al menos 4 evidencias y elige las 2 causas de raíz; ojo, hay causas que solo son opiniones." />
      <Tablero abandono={INICIO.abandono} satisfaccion={INICIO.satisfaccion} equidad={INICIO.equidad} reserva={PRESUPUESTO} />
      <div className="pp-panel">
        <Eyebrow>Evidencias · leídas {leidas.length}/{EVIDENCIAS.length}</Eyebrow>
        <div className="pp-grid">
          {EVIDENCIAS.map((e) => {
            const leida = leidas.includes(e.id);
            const abre = abierta === e.id;
            return (
              <button
                key={e.id}
                className="pp-card"
                data-sel={abre}
                data-ok={leida && !abre}
                aria-expanded={abre}
                onClick={() => {
                  onLeer(e.id);
                  setAbierta((a) => (a === e.id ? null : e.id));
                }}
              >
                <h5>
                  <i className={`fa-solid ${ICONO_EVID[e.tipo]}`} aria-hidden style={{ marginRight: 8, color: accent }} />
                  {e.titulo}
                </h5>
                {!abre && <span style={{ color: T.text3 }}>{leida ? "Leída. Toca para volver a abrir." : "Toca para abrir."}</span>}
                {abre && (
                  <>
                    <span style={{ color: T.text2 }}>{e.texto}</span>
                    {e.barras && (
                      <div style={{ display: "grid", gap: 6 }}>
                        {e.barras.map((b, i) => (
                          <div key={b.etiqueta}>
                            <div style={{ color: T.text2 }}>{b.etiqueta}: <strong style={{ color: T.text }}>{b.valor} {b.unidad}</strong></div>
                            <div className="pp-barra"><i style={{ width: `${b.valor * 10}%`, background: i === 0 ? accent : "rgba(255,255,255,0.35)" }} /></div>
                          </div>
                        ))}
                      </div>
                    )}
                    {e.puntos && <MiniMapa e={e} />}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className="pp-panel">
        <Eyebrow>Elige las 2 causas de raíz · {causasSel.length}/2</Eyebrow>
        {!puedeElegir && <div style={{ fontSize: 14, color: AMBAR }}><i className="fa-solid fa-lock" aria-hidden /> Abre al menos 4 evidencias para poder decidir.</div>}
        <div className="pp-grid">
          {CAUSAS.map((c) => {
            const sel = causasSel.includes(c.id);
            return (
              <button
                key={c.id}
                className="pp-card"
                disabled={!puedeElegir && !diagDone}
                data-sel={sel && !diagDone}
                data-ok={diagDone && c.raiz}
                data-mal={diagDone && sel && !c.raiz}
                data-quieta={diagDone}
                onClick={() => onCausa(c.id)}
              >
                <span style={{ fontWeight: 700 }}>
                  {diagDone && <i className={`fa-solid ${c.raiz ? "fa-circle-check" : sel ? "fa-circle-xmark" : "fa-circle-minus"}`} aria-hidden style={{ marginRight: 8, color: c.raiz ? OK : sel ? NO : T.text3 }} />}
                  {c.texto}
                </span>
                {diagDone && <span style={{ color: T.text2 }}>{c.porque}</span>}
              </button>
            );
          })}
        </div>
        {!diagDone ? (
          <button className="pp-btn pp-btn-main" disabled={causasSel.length !== 2} onClick={onConfirmar}>
            <i className="fa-solid fa-check" aria-hidden /> Confirmar diagnóstico
          </button>
        ) : (
          <div className="pp-pop" style={{ fontSize: 14, color: OK, fontWeight: 700 }}>
            <i className="fa-solid fa-circle-check" aria-hidden /> Diagnóstico registrado: el problema entra a la agenda. Pasa a «2 Diseñar».
          </div>
        )}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Etapa 2 · Diseñar
 * ═══════════════════════════════════════════════════════════════════════════ */
function EtapaDisenar({ causasSel, polSel, onToggle, done, onConfirmar, accent }: { causasSel: CausaId[]; polSel: string[]; onToggle: (id: string) => void; done: boolean; onConfirmar: () => void; accent: string }) {
  const gasto = gastoDe(polSel);
  const resto = PRESUPUESTO - gasto;
  return (
    <>
      <Encabezado n={1} instruccion={`Combina de 2 a ${MAX_POLITICAS} políticas sin pasar de ${PRESUPUESTO} millones simulados. Cada carta muestra costo y lo que PROMETE quien la propone; el efecto real lo verás al final. Lo que no gastes queda como reserva para imprevistos.`} />
      <div className="pp-panel">
        <Eyebrow>Presupuesto · gastado {gasto} de {PRESUPUESTO} M · reserva {resto} M</Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${PRESUPUESTO}, 1fr)`, gap: 3 }} role="img" aria-label={`Gastado ${gasto} de ${PRESUPUESTO} millones`}>
          {Array.from({ length: PRESUPUESTO }, (_, i) => (
            <div key={i} style={{ height: 16, borderRadius: 4, background: i < gasto ? accent : "rgba(255,255,255,0.1)", transition: "background .25s" }} />
          ))}
        </div>
      </div>
      <div className="pp-grid">
        {POLITICAS.map((p) => {
          const sel = polSel.includes(p.id);
          const noAlcanza = !sel && (gasto + p.costo > PRESUPUESTO || polSel.length >= MAX_POLITICAS);
          const causa = CAUSAS.find((c) => c.id === p.ataca)!;
          const conocida = causasSel.includes(p.ataca);
          return (
            <button key={p.id} className="pp-card" data-sel={sel} data-quieta={done} disabled={noAlcanza && !done} onClick={() => onToggle(p.id)}>
              <h5>
                <i className={`fa-solid ${p.icono}`} aria-hidden style={{ marginRight: 8, color: accent }} />
                {p.nombre}
              </h5>
              <span style={{ color: T.text2 }}>{p.descripcion}</span>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span className="pp-tag"><i className="fa-solid fa-coins" aria-hidden /> {p.costo} M</span>
                <span className="pp-tag" title="Lo que promete quien la propone">Promete <Estrellitas n={p.promesa} /></span>
              </div>
              <span style={{ color: conocida ? T.text : T.text3 }}>
                <i className="fa-solid fa-bullseye" aria-hidden style={{ marginRight: 6 }} />
                {conocida ? <>Ataca: {causa.texto.split(" (")[0]}</> : "Ataca: ¿? (no la marcaste como causa)"}
              </span>
              {noAlcanza && !done && <span style={{ color: AMBAR }}>{gasto + p.costo > PRESUPUESTO ? "No alcanza el presupuesto." : `Máximo ${MAX_POLITICAS} políticas.`}</span>}
            </button>
          );
        })}
      </div>
      {!done ? (
        <button className="pp-btn pp-btn-main" disabled={polSel.length < 2} onClick={onConfirmar}>
          <i className="fa-solid fa-file-circle-check" aria-hidden /> Presentar propuesta ({polSel.length} políticas · {gasto} M)
        </button>
      ) : (
        <div className="pp-pop" style={{ fontSize: 14, color: OK, fontWeight: 700 }}>
          <i className="fa-solid fa-circle-check" aria-hidden /> Propuesta presentada con {resto} M de reserva. Pasa a «3 Adoptar».
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Etapa 3 · Adoptar
 * ═══════════════════════════════════════════════════════════════════════════ */
function LineaMeses({ meses, accent }: { meses: number; accent: string }) {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 3 }} role="img" aria-label={`${meses} de 12 meses operando`}>
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} style={{ height: 14, borderRadius: 3, background: i < 12 - Math.round(12 - meses) ? accent : "rgba(255,255,255,0.12)" }} />
        ))}
      </div>
      <div style={{ fontSize: 14, color: T.text3, marginTop: 4 }}>{meses} de 12 meses operando</div>
    </div>
  );
}

function EtapaAdoptar({ reserva, sel, onSel, done, onConfirmar, accent }: { reserva: number; sel: string | null; onSel: (id: string) => void; done: boolean; onConfirmar: () => void; accent: string }) {
  return (
    <>
      <Encabezado n={2} instruccion="Una política necesita legitimidad: autorización legal, presupuesto y responsables. Elige cómo adoptarla; cada camino cambia el tiempo que tendrá para operar, el apoyo ciudadano y el dinero que te queda." />
      <div className="pp-grid">
        {ADOPCIONES.map((a) => {
          const sinReserva = a.costo > reserva;
          return (
            <button key={a.id} className="pp-card" data-sel={sel === a.id} data-quieta={done} disabled={sinReserva && !done} onClick={() => onSel(a.id)}>
              <h5>
                <i className={`fa-solid ${a.icono}`} aria-hidden style={{ marginRight: 8, color: accent }} />
                {a.nombre}
              </h5>
              <span style={{ color: T.text2 }}>{a.descripcion}</span>
              <LineaMeses meses={12 - a.retraso} accent={accent} />
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span className="pp-tag" style={{ color: a.satisfaccion >= 0 ? OK : NO }}><i className="fa-solid fa-handshake" aria-hidden /> Apoyo {a.satisfaccion >= 0 ? "+" : ""}{a.satisfaccion}</span>
                <span className="pp-tag"><i className="fa-solid fa-coins" aria-hidden /> {a.costo} M de reserva</span>
              </div>
              {sinReserva && !done && <span style={{ color: AMBAR }}>Tu reserva ({reserva} M) no alcanza.</span>}
            </button>
          );
        })}
      </div>
      {!done ? (
        <button className="pp-btn pp-btn-main" disabled={!sel} onClick={onConfirmar}>
          <i className="fa-solid fa-stamp" aria-hidden /> Adoptar la política
        </button>
      ) : (
        <div className="pp-pop" style={{ fontSize: 14, color: OK, fontWeight: 700 }}>
          <i className="fa-solid fa-circle-check" aria-hidden /> Política adoptada. Ahora hay que operarla en «4 Implementar».
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Etapa 4 · Implementar
 * ═══════════════════════════════════════════════════════════════════════════ */
function EtapaImplementar({ eventos, reacciones, reserva, onReaccion, resultado, accent }: { eventos: ReturnType<typeof eventosDe>; reacciones: Record<string, string>; reserva: number; onReaccion: (e: string, o: string) => void; resultado: Resultado; accent: string }) {
  const siguiente = eventos.findIndex((e) => !reacciones[e.id]);
  return (
    <>
      <Encabezado n={3} instruccion="La implementación es donde más fallan las políticas. Te llegarán 3 imprevistos (siempre los mismos con las mismas decisiones). Reacciona a cada uno: algunas respuestas cuestan reserva, otras meses o apoyo ciudadano." />
      <Tablero abandono={INICIO.abandono} satisfaccion={INICIO.satisfaccion} equidad={INICIO.equidad} reserva={reserva} />
      <div className="pp-panel">
        <Eyebrow>Meses de operación</Eyebrow>
        <LineaMeses meses={resultado.meses} accent={accent} />
      </div>
      {eventos.map((ev, i) => {
        const hecha = reacciones[ev.id];
        const activa = i === siguiente;
        if (!hecha && !activa) {
          return (
            <div key={ev.id} className="pp-panel" style={{ opacity: 0.55 }}>
              <div style={{ fontSize: 14, color: T.text3 }}><i className="fa-solid fa-lock" aria-hidden /> Imprevisto {i + 1}: se revela al resolver el anterior.</div>
            </div>
          );
        }
        return (
          <div key={ev.id} className="pp-panel pp-pop" data-done={!!hecha}>
            <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>
              <i className={`fa-solid ${ev.icono}`} aria-hidden style={{ marginRight: 8, color: AMBAR }} />
              Imprevisto {i + 1}: {ev.titulo}
            </div>
            <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>{ev.situacion}</div>
            <div className="pp-grid">
              {ev.opciones.map((o) => {
                const elegida = hecha === o.id;
                const sinReserva = !hecha && o.costo > reserva;
                return (
                  <button key={o.id} className="pp-card" data-sel={elegida} data-quieta={!!hecha} disabled={sinReserva} onClick={() => onReaccion(ev.id, o.id)}>
                    <span style={{ fontWeight: 700 }}>{o.texto}</span>
                    {sinReserva && <span style={{ color: AMBAR }}>Sin reserva suficiente.</span>}
                    {elegida && <span style={{ color: T.text2 }}>{o.resultado}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      {siguiente === -1 && eventos.length > 0 && (
        <div className="pp-pop" style={{ fontSize: 14, color: OK, fontWeight: 700 }}>
          <i className="fa-solid fa-circle-check" aria-hidden /> Año de operación terminado. Pasa a «5 Evaluar» para ver cómo cambió el tablero.
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Etapa 5 · Evaluar
 * ═══════════════════════════════════════════════════════════════════════════ */
function EtapaEvaluar({
  resultado,
  decisiones,
  pick,
  impactoOk,
  onPick,
  done,
  onPublicar,
  estrellas,
  meta,
  onReiniciar,
  accent,
}: {
  resultado: Resultado;
  decisiones: Parameters<typeof simular>[0];
  pick: string | null;
  impactoOk: boolean;
  onPick: (id: string) => void;
  done: boolean;
  onPublicar: () => void;
  estrellas: number;
  meta: boolean;
  onReiniciar: () => void;
  accent: string;
}) {
  const alternativas = ALTERNATIVAS.map((a) => ({ ...a, r: simular({ ...decisiones, politicas: a.politicas }) }));
  const tu = resultado;
  const filas = [{ id: "tu", titulo: "Tu diseño", r: tu }, ...alternativas.map((a) => ({ id: a.id, titulo: a.titulo, r: a.r }))];
  const valorInd: Record<string, string> = {
    gasto: `${PRESUPUESTO - tu.reserva} M gastados`,
    producto: `${tu.becas} becas · ${tu.tutorias} tutorías`,
    satisfaccion: `${tu.satisfaccion} de 100`,
    abandono: `${INICIO.abandono}% → ${tu.abandono}%`,
  };
  const pickInd = INDICADORES_EVAL.find((x) => x.id === pick);
  return (
    <>
      <Encabezado n={4} instruccion="El año terminó. Mira cómo se movió el tablero y decide qué indicador demuestra de verdad que la política funcionó. Después, la contraloría social revisa el informe." />
      <Tablero abandono={tu.abandono} satisfaccion={tu.satisfaccion} equidad={tu.equidad} reserva={tu.reserva} desde={{ abandono: INICIO.abandono, satisfaccion: INICIO.satisfaccion, equidad: INICIO.equidad }} />
      <div className="pp-panel">
        <Eyebrow>¿Cuál indicador prueba el impacto?</Eyebrow>
        <div className="pp-grid">
          {INDICADORES_EVAL.map((i) => (
            <button key={i.id} className="pp-card" data-ok={impactoOk && i.tipo === "impacto"} data-mal={pick === i.id && i.tipo !== "impacto"} data-quieta={impactoOk} onClick={() => onPick(i.id)}>
              <h5>{i.titulo}</h5>
              <span style={{ color: T.text, fontWeight: 800 }}>{valorInd[i.id]}</span>
            </button>
          ))}
        </div>
        {pickInd && (
          <div className="pp-pop" style={{ fontSize: 14, lineHeight: 1.5, color: pickInd.tipo === "impacto" ? OK : NO }}>
            <i className={`fa-solid ${pickInd.tipo === "impacto" ? "fa-circle-check" : "fa-circle-xmark"}`} aria-hidden /> {pickInd.explica}
          </div>
        )}
      </div>

      {impactoOk && (
        <div className="pp-panel pp-pop" data-done={done}>
          <Eyebrow>Contraloría social</Eyebrow>
          <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
            El comité vecinal vigila y evalúa la ejecución del programa. Esto es lo que revisa en tu informe:
          </div>
          <div style={{ display: "grid", gap: 6, fontSize: 14, color: T.text2 }}>
            <div><i className="fa-solid fa-circle-check" aria-hidden style={{ color: OK }} /> Gasto en programas dentro del presupuesto: {PRESUPUESTO - tu.reserva} de {PRESUPUESTO} M.</div>
            <div><i className={`fa-solid ${tu.equidad >= 55 ? "fa-circle-check" : "fa-triangle-exclamation"}`} aria-hidden style={{ color: tu.equidad >= 55 ? OK : AMBAR }} /> Equidad: {tu.equidad} de 100 {tu.equidad >= 55 ? "(llegó a quien más lo necesita)." : "(se quedó corta con las localidades más lejanas)."}</div>
            <div><i className={`fa-solid ${tu.mejora >= 8 ? "fa-circle-check" : "fa-triangle-exclamation"}`} aria-hidden style={{ color: tu.mejora >= 8 ? OK : AMBAR }} /> Abandono: {tu.mejora >= 0 ? "bajó" : "subió"} {Math.abs(tu.mejora)} puntos.</div>
          </div>
          {!done && (
            <button className="pp-btn pp-btn-main" onClick={onPublicar}>
              <i className="fa-solid fa-file-lines" aria-hidden /> Publicar informe ciudadano
            </button>
          )}
        </div>
      )}

      {done && (
        <div className="pp-panel pp-pop" data-done="true" data-informe="true">
          <Eyebrow>Informe final · simulación</Eyebrow>
          <div style={{ fontSize: 15, fontWeight: 800, color: meta ? OK : AMBAR }}>
            <i className={`fa-solid ${meta ? "fa-trophy" : "fa-circle-half-stroke"}`} aria-hidden style={{ marginRight: 8 }} />
            {meta ? "Meta lograda: el abandono bajó con equidad." : "Meta no lograda: baja al menos 8 puntos sin sacrificar equidad (55 o más)."}
          </div>
          <div className="pp-grid-s">
            <Dato2 label="Abandono" valor={`${INICIO.abandono}% → ${tu.abandono}%`} />
            <Dato2 label="Satisfacción" valor={`${INICIO.satisfaccion} → ${tu.satisfaccion}`} />
            <Dato2 label="Equidad" valor={`${INICIO.equidad} → ${tu.equidad}`} />
            <Dato2 label="Reserva final" valor={`${tu.reserva} M`} />
          </div>
          <Eyebrow>¿Qué habría pasado con otro diseño? (mismos imprevistos y adopción)</Eyebrow>
          <div style={{ display: "grid", gap: 10 }}>
            {filas.map((f) => (
              <div key={f.id}>
                <div style={{ fontSize: 14, color: T.text2, display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                  <strong style={{ color: f.id === "tu" ? accent : T.text }}>{f.titulo}</strong>
                  <span>abandono {f.r.abandono}% · equidad {f.r.equidad} · satisfacción {f.r.satisfaccion}</span>
                </div>
                <div className="pp-barra"><i style={{ width: `${(f.r.abandono / 45) * 100}%`, background: f.id === "tu" ? accent : "rgba(255,255,255,0.4)" }} /></div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>
            La evaluación retroalimenta el ciclo: lo aprendido vuelve a la etapa 1. Lo popular no siempre es lo efectivo, y lo efectivo depende de atacar las causas de raíz.
          </div>
          <div style={{ display: "flex", gap: 4 }} aria-label={`${estrellas} estrellas`}>
            {[1, 2, 3].map((s) => (
              <i key={s} className="fa-solid fa-star" aria-hidden style={{ fontSize: 24, color: s <= estrellas ? AMBAR : "rgba(255,255,255,0.16)" }} />
            ))}
          </div>
          <button className="pp-btn" onClick={onReiniciar}>
            <i className="fa-solid fa-rotate-left" aria-hidden /> Probar otro diseño
          </button>
        </div>
      )}
    </>
  );
}

function Dato2({ label, valor }: { label: string; valor: string }) {
  return (
    <div style={{ border: `1px solid ${T.line}`, borderRadius: 11, padding: "9px 12px", background: T.inset, display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 14, color: T.text3 }}>{label}</span>
      <strong style={{ fontSize: 15, color: T.text }}>{valor}</strong>
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
    <div>
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
        Seis afirmaciones sobre el diseño, la implementación y la evaluación de las políticas públicas, y el papel de la ciudadanía. Decide si son verdaderas o falsas y pulsa «Comprobar».
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {QUIZ.map((q, qi) => {
          const elegida = resp[qi];
          return (
            <div key={qi}>
              <div style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 11, display: "flex", gap: 10 }}>
                <span style={{ color: accent }}>{qi + 1}.</span>
                <span>{q.pregunta}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 9 }}>
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
                    <button key={oi} className="pp-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
                      <span style={{ width: 26, height: 26, flexShrink: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, border: `1.5px solid ${sel || (comprobado && esCorrecta) ? "currentColor" : T.line}` }}>
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
          <button className="pp-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="pp-btn" onClick={reintentar}>
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
