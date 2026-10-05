"use client";

/**
 * Laboratorio — Las juventudes como sujetos políticos
 * Práctica experimental para CS-III-P03-A4 (Ciencias Sociales III).
 *
 * EXPERIMENTO CENTRAL: «Colectivo en acción». El Colectivo Raíces Jóvenes de
 * un municipio FICTICIO (Santa Marta del Llano) quiere salvar su único centro
 * juvenil de ser demolido. En 4 semanas el alumno elige formas de participación
 * (asamblea, brigada, mural, festival, redes, consulta, candidatura) y ve cómo se
 * mueven tres indicadores (alcance, incidencia, legitimidad; valores de
 * simulación), cómo reacciona la autoridad y qué decide el cabildo. Combinar
 * formas, construir legitimidad antes de lo formal y articular lo digital con lo
 * presencial funciona; repetir una sola forma, no. La lógica vive en
 * `juventudes-politicas-sim.ts`.
 *
 * Modos (los de siempre se conservan; las misiones y las estrellas dependen de
 * ellos):
 *  0. «Colectivo en acción» — el simulador.
 *  1. «¿Electoral, comunitaria, cultural o digital?» — clasifica ocho ejemplos.
 *  2. «Empareja concepto y definición» — conceptos clave de A2, verbatim.
 *  3. «Escribe el término» — glosario A5, verbatim.
 *  4. «Completa el texto» — fill_blanks verbatim.
 *  + Reto: cuestionario V/F verbatim de A4. Teoría: ficha y datos verbatim.
 *
 * DOM puro (sin three.js). Contenido VERBATIM de CS-III·P03.
 */

import React, { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, Eyebrow } from "./_kit";
import { LabShell, Bloque, Mesa, BotonHerramienta } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { JUVENTUDES_POLITICAS_HUECOS } from "./juventudes-politicas-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { JUVENTUDES_POLITICAS_FICHA } from "./juventudes-politicas-ficha";
import {
  EJEMPLOS,
  CATEGORIA_INFO,
  CONCEPTOS,
  PARES,
  QUIZ,
  DATO_JUVENTUDES,
  type Categoria,
} from "./juventudes-politicas-data";
import {
  ACCIONES,
  ENERGIA,
  INICIO,
  POSTURAS,
  SEMANAS,
  UMBRAL_APRUEBA,
  UMBRAL_NEGOCIA,
  accionDe,
  cabildo,
  energiaGastada,
  formasUsadas,
  simular,
  type Efecto,
  type Resultado,
  type Sesion,
} from "./juventudes-politicas-sim";

const NO = "#FF5E5E";
const AMBAR = "#FFC75A";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { FondoTermino, VinetaTermino } from "./_vineta";
const RETO_KEY = "cen-juventudes-politicas-reto";
const RUTA_SIM = "/media/labs-sim/juventudes-politicas";

type Modo = "sim" | "clasificar" | "conceptos" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "sim", label: "Colectivo en acción", icono: "fa-people-group" },
  { id: "clasificar", label: "¿Electoral, comunitaria, cultural o digital?", icono: "fa-layer-group" },
  { id: "conceptos", label: "Empareja concepto y definición", icono: "fa-diagram-project" },
  { id: "glosario", label: "Escribe el término", icono: "fa-keyboard" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

export function LabJuventudesPoliticas({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("sim");

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
  const sfxPlace = () => {
    partida.acierto();
    return sonido && audioRef.current?.blip();
  };

  // ── modo Simulador (el colectivo, 4 semanas) ───────────────────────────
  const [semanas, setSemanas] = useState<string[][]>([[]]);
  const [cerradas, setCerradas] = useState(0);
  const resultado: Resultado = simular(semanas, cerradas);
  const terminado = cerradas >= SEMANAS;
  const sesion: Sesion | null = terminado ? cabildo(resultado.ind) : null;
  const actual = semanas[cerradas] ?? [];
  const energiaLibre = ENERGIA - energiaGastada(actual);

  const elegirAccion = (id: string) => {
    if (terminado) return;
    if (accionDe(id).costo > energiaLibre) return;
    const nuevo = semanas.map((s, i) => (i === cerradas ? [...s, id] : s));
    const r = simular(nuevo, cerradas);
    const ef = r.efectos[cerradas]?.[r.efectos[cerradas]!.length - 1];
    setSemanas(nuevo);
    if (ef?.bueno) sfxPlace();
    else sfxNo();
  };
  const deshacer = () => {
    if (terminado || actual.length === 0) return;
    setSemanas((s) => s.map((x, i) => (i === cerradas ? x.slice(0, -1) : x)));
  };
  const terminarSemana = () => {
    if (terminado || actual.length === 0) return;
    const sig = cerradas + 1;
    setCerradas(sig);
    if (sig < SEMANAS) setSemanas((s) => [...s, []]);
    else {
      const fin = cabildo(simular(semanas, sig).ind);
      if (fin.voto === "aprueba") sfxOk();
    }
  };
  const resetSim = () => {
    setSemanas([[]]);
    setCerradas(0);
  };
  const formasDone = formasUsadas(semanas) >= 3;
  const cabildoOk = sesion?.voto === "aprueba";

  // ── modo clasificar (por forma de participación) ───────────────────────
  const [ubicEj, setUbicEj] = useState<Record<string, Categoria>>({});
  const [selEj, setSelEj] = useState<string | null>(null);
  const [shakeEj, setShakeEj] = useState<Categoria | null>(null);
  const ejLibres = EJEMPLOS.filter((e) => !ubicEj[e.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarEj = (ejId: string, bin: Categoria) => {
    if (ubicEj[ejId]) return;
    const e = EJEMPLOS.find((x) => x.id === ejId);
    if (e && e.categoria === bin) {
      setUbicEj((prev) => ({ ...prev, [ejId]: bin }));
      setSelEj(null);
      sfxPlace();
      if (Object.keys(ubicEj).length + 1 >= EJEMPLOS.length) {
        sfxOk();
        persistMejor(true, conceptosDone, glosarioDone);
      }
    } else {
      setShakeEj(bin);
      sfxNo();
      window.setTimeout(() => setShakeEj(null), 420);
    }
  };
  const resetClasificar = () => {
    setUbicEj({});
    setSelEj(null);
  };

  // ── modo conceptos (empareja concepto → definición) ────────────────────
  const [empCon, setEmpCon] = useState<Record<string, boolean>>({});
  const [selCon, setSelCon] = useState<string | null>(null);
  const [shakeCon, setShakeCon] = useState<string | null>(null);
  const conLibres = CONCEPTOS.filter((c) => !empCon[c.id]).slice().sort((a, b) => a.concepto.localeCompare(b.concepto, "es"));

  const intentarCon = (chipId: string, rowId: string) => {
    if (empCon[rowId]) return;
    if (chipId === rowId) {
      setEmpCon((prev) => ({ ...prev, [rowId]: true }));
      setSelCon(null);
      sfxPlace();
      if (Object.keys(empCon).length + 1 >= CONCEPTOS.length) {
        sfxOk();
        persistMejor(clasificarDone, true, glosarioDone);
      }
    } else {
      setShakeCon(rowId);
      sfxNo();
      window.setTimeout(() => setShakeCon(null), 420);
    }
  };
  const resetConceptos = () => {
    setEmpCon({});
    setSelCon(null);
  };

  // ── modo glosario (lee la definición y ESCRIBE el término) ─────────────
  // El contador hace de `key`: subirlo remonta el componente y deja todas
  // las tarjetas en blanco.
  const [glosarioDone, setGlosarioDone] = useState(false);
  const [glosIntento, setGlosIntento] = useState(0);
  const resetGlosario = () => {
    setGlosarioDone(false);
    setGlosIntento((n) => n + 1);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso / estrellas ──────────────────────────────────────────────
  const clasificarDone = Object.keys(ubicEj).length >= EJEMPLOS.length;
  const conceptosDone = Object.keys(empCon).length >= CONCEPTOS.length;
  const modosHechos = (clasificarDone ? 1 : 0) + (conceptosDone ? 1 : 0) + (glosarioDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los 3 modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 4);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);

  const persistMejor = (a: boolean, b: boolean, c: boolean) => {
    const est = (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0);
    registraEstrellas(est);
  };

  const objetivos = [
    { txt: "Combina al menos 3 formas de participación en tu campaña", done: formasDone },
    { txt: "Logra que el cabildo conserve el centro juvenil", done: cabildoOk },
    { txt: "Clasifica los 8 ejemplos por forma de participación", done: clasificarDone },
    { txt: "Empareja los 5 conceptos con su definición", done: conceptosDone },
    { txt: "Escribe los 6 términos del glosario", done: glosarioDone },
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
  const resetActual = modo === "texto" ? resetTexto : modo === "sim" ? resetSim : modo === "clasificar" ? resetClasificar : modo === "conceptos" ? resetConceptos : resetGlosario;

  const lectura =
    modo === "sim"
      ? terminado
        ? `Sesión de cabildo: ${sesion!.voto === "aprueba" ? "se conserva" : sesion!.voto === "negocia" ? "acuerdo parcial" : "se demuele"}`
        : `Semana ${cerradas + 1} de ${SEMANAS} · energía ${energiaLibre}/${ENERGIA} · autoridad ${resultado.postura.toLowerCase()}`
      : `${modosHechos}/4 modos · ${bestEstrellas}★`;

  const escena = (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
      <style>{ESTILOS(accent, color.rgba)}</style>

      {/* MODO — completa el texto (fill_blanks verbatim de la progresión) */}
      {modo === "texto" && (
        <CompletaTexto
          key={textoIntento}
          data={JUVENTUDES_POLITICAS_HUECOS}
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

      {/* MODO 0 — Colectivo en acción */}
      {modo === "sim" && (
        <SimColectivo
          accent={accent}
          semanas={semanas}
          cerradas={cerradas}
          resultado={resultado}
          sesion={sesion}
          energiaLibre={energiaLibre}
          onAccion={elegirAccion}
          onDeshacer={deshacer}
          onTerminar={terminarSemana}
          onReiniciar={resetSim}
        />
      )}

      {/* MODO 1 — clasificar */}
      {modo === "clasificar" && (
        <Mesa>
          <div className="jp-panel">
            <div className="jp-cab">
              <Eyebrow>Arrastra cada ejemplo a su forma de participación</Eyebrow>
              <span style={{ fontSize: 14, fontWeight: 800, color: clasificarDone ? OK : T.text3 }}>
                {Object.keys(ubicEj).length}/{EJEMPLOS.length}
              </span>
            </div>
            {ejLibres.length === 0 ? (
              <div className="jp-ok">
                <i className="fa-solid fa-circle-check" /> ¡Clasificaste los {EJEMPLOS.length} ejemplos!
              </div>
            ) : (
              <div className="jp-chips">
                {ejLibres.map((e) => (
                  <button key={e.id} className="jp-chip" data-sel={selEj === e.id} onClick={() => setSelEj((v) => (v === e.id ? null : e.id))} {...dragProps(e.id)}>
                    {e.texto}
                  </button>
                ))}
              </div>
            )}
          </div>
          <BinsCategorias selEj={selEj} shakeEj={shakeEj} ubicEj={ubicEj} onMatch={intentarEj} dropProps={dropProps} />
        </Mesa>
      )}

      {/* MODO 2 — conceptos */}
      {modo === "conceptos" && (
        <Mesa>
          <div className="jp-panel">
            <div className="jp-cab">
              <Eyebrow>Arrastra cada concepto a su definición</Eyebrow>
              <span style={{ fontSize: 14, fontWeight: 800, color: conceptosDone ? OK : T.text3 }}>
                {Object.keys(empCon).length}/{CONCEPTOS.length}
              </span>
            </div>
            {conLibres.length === 0 ? (
              <div className="jp-ok">
                <i className="fa-solid fa-circle-check" /> ¡Emparejaste los {CONCEPTOS.length} conceptos!
              </div>
            ) : (
              <div className="jp-chips">
                {conLibres.map((c) => (
                  <button key={c.id} className="jp-chip" data-sel={selCon === c.id} onClick={() => setSelCon((v) => (v === c.id ? null : c.id))} {...dragProps(c.id)}>
                    <i className="fa-solid fa-diagram-project" style={{ fontSize: 14, color: T.text3 }} />
                    {c.concepto}
                  </button>
                ))}
              </div>
            )}
          </div>
          <RowsConceptos selCon={selCon} shakeCon={shakeCon} empCon={empCon} onMatch={intentarCon} dropProps={dropProps} />
        </Mesa>
      )}

      {/* MODO 3 — glosario */}
      {modo === "glosario" && (
        <EscribeTermino
          key={glosIntento}
          pares={PARES}
          accent={accent}
          rgba={color.rgba}
          completado={glosarioDone}
          instrucciones="Lee la definición y escribe el término del glosario que le corresponde."
          onCompletado={() => {
            setGlosarioDone(true);
            sfxOk();
            persistMejor(clasificarDone, conceptosDone, true);
          }}
          onAcierto={sfxPlace}
          onError={sfxNo}
        />
      )}
    </div>
  );

  const pistaDe: Record<Modo, React.ReactNode> = {
    sim: (
      <>
        Primero construye <strong style={{ color: T.text }}>legitimidad</strong> con el barrio; después lo formal (consulta, candidatura) pesa. Las redes funcionan cuando se <strong style={{ color: T.text }}>articulan con acciones presenciales</strong>, y repetir una sola forma rinde cada vez menos.
      </>
    ),
    clasificar: (
      <>
        La participación política juvenil no se agota en el voto: también es <strong style={{ color: T.text }}>comunitaria</strong>, <strong style={{ color: T.text }}>cultural</strong> y <strong style={{ color: T.text }}>digital</strong>. Las y los jóvenes son ciudadanos de hoy, no solo del mañana.
      </>
    ),
    conceptos: (
      <>
        La <strong style={{ color: T.text }}>agencia política</strong> es actuar con propósito en la esfera pública; ser <strong style={{ color: T.text }}>sujeto histórico</strong> es producir historia, no recibirla pasivamente.
      </>
    ),
    glosario: <>Ya no se arrastra: lee la definición y su ejemplo y escribe el término. Si te atoras, la pista te da la inicial y las letras.</>,
    texto: <>Escribe la palabra que falta en cada hueco del texto.</>,
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
          <BotonHerramienta icono="fa-rotate-left" titulo={modo === "sim" ? "Reiniciar la campaña" : "Reiniciar este modo"} onClick={resetActual} />
        </>
      }
      lectura={lectura}
      objetivos={objetivos}
      retoKey={RETO_KEY}
      pestanas={[
        {
          id: "pistas",
          etiqueta: "Pistas",
          icono: "fa-lightbulb",
          contenido: (
            <>
              <Bloque titulo="Tu partida" icono="fa-gauge-high">
                <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
                <div style={{ display: "flex", gap: 4 }}>
                  {[1, 2, 3].map((s) => (
                    <i key={s} className="fa-solid fa-star" style={{ fontSize: 20, color: s <= bestEstrellas ? AMBAR : "rgba(255,255,255,0.16)" }} />
                  ))}
                </div>
                <div style={{ fontSize: 14, color: T.text2 }}>
                  {bestEstrellas >= 3 ? "¡Reconoces a las juventudes como sujetos políticos!" : "Termina los modos de clasificar, emparejar y escribir para ganar estrellas; la tercera pide 2 errores o menos."}
                </div>
              </Bloque>
              <Bloque titulo="Pista de este modo" icono="fa-lightbulb">
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>{pistaDe[modo]}</div>
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
                <FichaTeorica data={JUVENTUDES_POLITICAS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <Bloque titulo="Formas de participación" icono="fa-layer-group">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {(Object.keys(CATEGORIA_INFO) as Categoria[]).map((c) => (
                    <div key={c} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>{CATEGORIA_INFO[c].titulo}.</strong> {CATEGORIA_INFO[c].subtitulo}
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Conceptos clave" icono="fa-diagram-project">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {CONCEPTOS.map((c) => (
                    <div key={c.id} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>{c.concepto}.</strong> {c.definicion}
                      <div style={{ fontStyle: "italic", color: T.text3, marginTop: 2 }}>{c.ejemplo}</div>
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Dato" icono="fa-circle-info">
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>{DATO_JUVENTUDES}</div>
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
  @keyframes jpShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
  @keyframes jpPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
  .jp-panel { border-radius:16px; border:1px solid ${T.line}; background:${T.glass}; padding:14px 16px; display:flex; flex-direction:column; gap:10px; min-width:0; }
  .jp-cab { display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap; }
  .jp-cab p { margin:0; }
  .jp-nota { font-size:14px; color:${T.text3}; line-height:1.5; }
  .jp-ok { font-size:14px; color:${OK}; font-weight:700; display:flex; align-items:center; gap:9px; }
  .jp-chips { display:flex; flex-wrap:wrap; gap:10px; }
  .jp-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:flex-start; gap:8px; padding:11px 14px; border-radius:14px;
    border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:700; user-select:none; max-width:100%; text-align:left; line-height:1.4;
    transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
  .jp-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); transform:translateY(-2px); }
  .jp-chip[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -5px ${accent}; transform:translateY(-3px) scale(1.02); }
  .jp-chip:active { cursor:grabbing; }
  .jp-chip[data-arrastrando="true"] { opacity:.4; }
  .jp-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:12px 14px; transition:all .16s; display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
  .jp-row[data-shake="true"] { animation:jpShake .4s; border-color:${NO}; }
  .jp-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
  .jp-row[data-sobre="true"], .jp-bin[data-sobre="true"] { border-color:${accent}; background:rgba(${rgba},0.12); }
  .jp-slot { flex:0 1 200px; min-width:0; min-height:42px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
    display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:14px; transition:all .16s; cursor:pointer; padding:4px 10px; text-align:center; }
  .jp-slot[data-armed="true"] { border-color:${accent}; background:rgba(${rgba},0.1); }
  .jp-bins { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap:12px; }
  .jp-bin { position:relative; isolation:isolate; border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px; transition:all .16s; min-height:150px; }
  .jp-bin[data-shake="true"] { animation:jpShake .4s; border-color:${NO}; }
  .jp-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
  .jp-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
  .jp-q:disabled{ cursor:default; }
  .jp-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 16px;
    border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; }
  .jp-btn:hover:not(:disabled) { border-color:${T.lineStrong}; }
  .jp-btn:disabled { opacity:.45; cursor:not-allowed; }
  .jp-btn-main { background:${accent}; color:#04121f; border-color:transparent; }

  /* Simulador */
  .jp-foto { position:relative; overflow:hidden; border-radius:16px; border:1px solid ${T.line}; aspect-ratio:16/9; max-height:220px; width:100%;
    background:linear-gradient(135deg, rgba(${rgba},0.28) 0%, rgba(8,19,31,0.9) 100%); display:flex; align-items:center; justify-content:center; }
  .jp-foto > i { font-size:54px; color:rgba(255,255,255,0.22); }
  .jp-foto img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .jp-pie { position:absolute; left:10px; right:10px; bottom:10px; display:flex; flex-wrap:wrap; gap:8px; align-items:center; justify-content:space-between;
    padding:9px 12px; border-radius:12px; background:rgba(4,10,22,0.82); border:1px solid ${T.line}; backdrop-filter:blur(6px); font-size:14px; font-weight:700; color:#fff; }
  .jp-meds { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 170px), 1fr)); gap:10px; }
  .jp-med { display:grid; gap:6px; padding:10px 12px; border-radius:12px; border:1px solid ${T.line}; background:${T.inset}; min-width:0; }
  .jp-med > div:first-child { display:flex; justify-content:space-between; gap:8px; font-size:14px; font-weight:800; color:${T.text2}; }
  .jp-barra { height:12px; border-radius:7px; background:rgba(255,255,255,0.08); overflow:hidden; border:1px solid ${T.line}; }
  .jp-barra > i { display:block; height:100%; border-radius:7px; transition:width .7s cubic-bezier(.2,.8,.2,1); }
  .jp-posturas { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 120px), 1fr)); gap:6px; }
  .jp-post { padding:8px 6px; border-radius:10px; border:1.5px solid ${T.line}; background:${T.inset}; font-size:14px; font-weight:800; color:${T.text3}; text-align:center; transition:all .3s; }
  .jp-post[data-on="true"] { color:#04121f; background:${accent}; border-color:transparent; }
  .jp-acciones { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 210px), 1fr)); gap:10px; }
  .jp-accion { cursor:pointer; display:flex; flex-direction:column; gap:6px; text-align:left; padding:12px 14px; border-radius:14px; border:1.5px solid ${T.line}; background:${T.glassSoft};
    color:#fff; font-size:14px; line-height:1.4; transition:all .14s; min-width:0; }
  .jp-accion:hover:not(:disabled) { border-color:${accent}; background:rgba(${rgba},0.14); transform:translateY(-2px); }
  .jp-accion:disabled { opacity:.45; cursor:not-allowed; }
  .jp-accion h5 { margin:0; font-size:15px; font-weight:800; }
  .jp-tag { display:inline-flex; align-items:center; gap:6px; font-size:14px; font-weight:700; padding:2px 9px; border-radius:8px; border:1px solid ${T.line}; background:${T.inset}; color:${T.text2}; }
  .jp-efecto { display:grid; gap:4px; padding:10px 12px; border-radius:12px; font-size:14px; line-height:1.45; animation:jpPop .25s ease; }
  .jp-energia { display:inline-flex; gap:5px; }
  .jp-energia i { width:16px; height:16px; border-radius:50%; background:rgba(255,255,255,0.14); display:block; }
  .jp-energia i[data-on="true"] { background:${AMBAR}; }
  @media (prefers-reduced-motion: reduce){
    .jp-row[data-shake="true"], .jp-bin[data-shake="true"] { animation:none; }
    .jp-chip, .jp-chip:hover, .jp-chip[data-sel="true"], .jp-accion:hover:not(:disabled) { transform:none; transition:none; }
    .jp-efecto { animation:none; }
    .jp-barra > i { transition:none; }
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════
 * Simulador «Colectivo en acción»
 * ═══════════════════════════════════════════════════════════════════════════ */

function Foto({ clave, icono, children }: { clave: string; icono: string; children?: React.ReactNode }) {
  const [falla, setFalla] = useState<string | null>(null);
  return (
    <div className="jp-foto">
      <i className={`fa-solid ${icono}`} aria-hidden />
      {falla !== clave && <img key={clave} src={`${RUTA_SIM}/${clave}.webp`} alt="" loading="lazy" onError={() => setFalla(clave)} />}
      {children}
    </div>
  );
}

const FOTO_FORMA: Record<Categoria, string> = {
  comunitaria: "asamblea-patio",
  cultural: "mural-calle",
  digital: "jovenes-celular",
  electoral: "cabildo-sala",
};

function signo(n: number) {
  return n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : "0";
}

function Medida({ etiqueta, valor, icono, bueno }: { etiqueta: string; valor: number; icono: string; bueno: string }) {
  return (
    <div className="jp-med">
      <div>
        <span>
          <i className={`fa-solid ${icono}`} aria-hidden style={{ marginRight: 7, color: bueno }} />
          {etiqueta}
        </span>
        <strong style={{ color: "#fff", fontVariantNumeric: "tabular-nums" }}>{valor}</strong>
      </div>
      <div className="jp-barra" role="img" aria-label={`${etiqueta}: ${valor} de 100`}>
        <i style={{ width: `${valor}%`, background: bueno }} />
      </div>
    </div>
  );
}

function FilaEfecto({ e }: { e: Efecto }) {
  const nombre = e.accion === "articulacion" ? "Articulación de formas" : accionDe(e.accion).nombre;
  const d = e.delta;
  return (
    <div className="jp-efecto" style={{ background: e.bueno ? `${OK}12` : `${NO}12`, border: `1px solid ${e.bueno ? OK : NO}55`, color: T.text2 }}>
      <strong style={{ color: e.bueno ? OK : NO }}>
        {nombre} · alcance {signo(d.alcance)} · incidencia {signo(d.incidencia)} · legitimidad {signo(d.legitimidad)}
      </strong>
      <span>{e.nota}</span>
    </div>
  );
}

function SimColectivo({
  accent,
  semanas,
  cerradas,
  resultado,
  sesion,
  energiaLibre,
  onAccion,
  onDeshacer,
  onTerminar,
  onReiniciar,
}: {
  accent: string;
  semanas: string[][];
  cerradas: number;
  resultado: Resultado;
  sesion: Sesion | null;
  energiaLibre: number;
  onAccion: (id: string) => void;
  onDeshacer: () => void;
  onTerminar: () => void;
  onReiniciar: () => void;
}) {
  const terminado = cerradas >= SEMANAS;
  const actual = semanas[cerradas] ?? [];
  const ult = actual.length > 0 ? actual[actual.length - 1] : cerradas > 0 ? semanas[cerradas - 1]?.[semanas[cerradas - 1]!.length - 1] : undefined;
  const clave = sesion
    ? sesion.voto === "aprueba" ? "celebracion" : sesion.voto === "rechaza" ? "demolicion" : "cabildo-sala"
    : ult ? FOTO_FORMA[accionDe(ult).forma] : "centro-juvenil";
  const vista = terminado ? SEMANAS - 1 : actual.length === 0 && cerradas > 0 ? cerradas - 1 : cerradas;
  const efectos = resultado.efectos[vista] ?? [];
  const reaccion = resultado.reacciones[resultado.reacciones.length - 1];
  const ind = resultado.ind;
  const verde = (v: number) => (v >= 55 ? OK : v >= 30 ? AMBAR : NO);
  const usos: Record<string, number> = {};
  for (const s of semanas) for (const id of s) usos[id] = (usos[id] ?? 0) + 1;

  return (
    <>
      <div className="jp-panel">
        <Eyebrow>Colectivo Raíces Jóvenes · Santa Marta del Llano (municipio ficticio)</Eyebrow>
        <div className="jp-nota">
          Un estacionamiento reemplazará al único centro juvenil del municipio. Tienen {SEMANAS} semanas para lograr que el cabildo lo conserve. Cada semana cuentas con {ENERGIA} puntos de energía. Todas las cifras son valores de simulación.
        </div>
      </div>

      <Foto clave={clave} icono="fa-people-roof">
        <div className="jp-pie">
          <span>{terminado ? "Sesión de cabildo" : `Semana ${cerradas + 1} de ${SEMANAS}`}</span>
          <span className="jp-energia" role="img" aria-label={`Energía restante: ${energiaLibre} de ${ENERGIA}`}>
            {Array.from({ length: ENERGIA }, (_, i) => (
              <i key={i} data-on={!terminado && i < energiaLibre} />
            ))}
          </span>
        </div>
      </Foto>

      <div className="jp-panel">
        <div className="jp-cab">
          <Eyebrow>Indicadores del colectivo · simulación</Eyebrow>
          <span className="jp-tag">
            <i className="fa-solid fa-flask" aria-hidden /> inicio: {INICIO.alcance} · {INICIO.incidencia} · {INICIO.legitimidad}
          </span>
        </div>
        <div className="jp-meds">
          <Medida etiqueta="Alcance" valor={ind.alcance} icono="fa-bullhorn" bueno={verde(ind.alcance)} />
          <Medida etiqueta="Incidencia" valor={ind.incidencia} icono="fa-landmark" bueno={verde(ind.incidencia)} />
          <Medida etiqueta="Legitimidad" valor={ind.legitimidad} icono="fa-handshake" bueno={verde(ind.legitimidad)} />
        </div>
        <div className="jp-posturas" role="img" aria-label={`Postura de la autoridad: ${resultado.postura}`}>
          {POSTURAS.map((p) => (
            <div key={p} className="jp-post" data-on={p === resultado.postura}>
              {p}
            </div>
          ))}
        </div>
        {reaccion && (
          <div className="jp-nota">
            <i className="fa-solid fa-building-columns" aria-hidden style={{ color: accent, marginRight: 8 }} />
            <strong style={{ color: T.text2 }}>Alcaldía, semana {reaccion.semana}:</strong> {reaccion.texto}
          </div>
        )}
      </div>

      {!terminado && (
        <div className="jp-panel">
          <div className="jp-cab">
            <Eyebrow>Elige cómo participa el colectivo esta semana</Eyebrow>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="jp-btn" onClick={onDeshacer} disabled={actual.length === 0}>
                <i className="fa-solid fa-rotate-left" aria-hidden /> Deshacer
              </button>
              <button className="jp-btn jp-btn-main" onClick={onTerminar} disabled={actual.length === 0}>
                <i className="fa-solid fa-calendar-check" aria-hidden /> Terminar la semana
              </button>
            </div>
          </div>
          <div className="jp-acciones">
            {ACCIONES.map((a) => {
              const sin = a.costo > energiaLibre;
              return (
                <button key={a.id} className="jp-accion" disabled={sin} onClick={() => onAccion(a.id)}>
                  <h5>
                    <i className={`fa-solid ${a.icono}`} aria-hidden style={{ marginRight: 8, color: accent }} />
                    {a.nombre}
                  </h5>
                  <span style={{ color: T.text2 }}>{a.descripcion}</span>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span className="jp-tag">{CATEGORIA_INFO[a.forma].titulo}</span>
                    <span className="jp-tag">
                      <i className="fa-solid fa-bolt" aria-hidden /> {a.costo}
                    </span>
                    {usos[a.id] ? <span className="jp-tag">hecha ×{usos[a.id]}</span> : null}
                  </div>
                  {sin && <span style={{ color: AMBAR }}>No alcanza la energía de la semana.</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {terminado && sesion && (
        <div className="jp-panel" style={{ borderColor: `${sesion.voto === "aprueba" ? OK : sesion.voto === "negocia" ? AMBAR : NO}88` }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: sesion.voto === "aprueba" ? OK : sesion.voto === "negocia" ? AMBAR : NO }}>
            <i className={`fa-solid ${sesion.voto === "aprueba" ? "fa-trophy" : "fa-gavel"}`} aria-hidden style={{ marginRight: 8 }} />
            {sesion.texto}
          </div>
          <div className="jp-nota">
            Puntaje de la sesión: {sesion.puntaje} (simulación). Se conserva el centro con {UMBRAL_APRUEBA} o más; hay acuerdo parcial con {UMBRAL_NEGOCIA} o más. Pesa más la incidencia (55 %), luego la legitimidad (30 %) y por último el alcance (15 %).
          </div>
          <button className="jp-btn jp-btn-main" onClick={onReiniciar}>
            <i className="fa-solid fa-rotate-left" aria-hidden /> Probar otra estrategia
          </button>
        </div>
      )}

      {efectos.length > 0 && (
        <div className="jp-panel">
          <Eyebrow>Qué pasó y por qué · semana {vista + 1}</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {efectos.map((e, i) => (
              <FilaEfecto key={`${e.accion}-${i}`} e={e} />
            ))}
          </div>
        </div>
      )}
    </>
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

function BinsCategorias({
  selEj,
  shakeEj,
  ubicEj,
  onMatch,
  dropProps,
}: {
  selEj: string | null;
  shakeEj: Categoria | null;
  ubicEj: Record<string, Categoria>;
  onMatch: (ejId: string, bin: Categoria) => void;
  dropProps: DropFactory;
}) {
  const bins: Categoria[] = ["electoral", "comunitaria", "cultural", "digital"];
  return (
    <div className="jp-bins">
      {bins.map((bin) => {
        const info = CATEGORIA_INFO[bin];
        const dentro = EJEMPLOS.filter((e) => ubicEj[e.id] === bin);
        return (
          <div key={bin} className="jp-bin" data-shake={shakeEj === bin} onClick={() => selEj && onMatch(selEj, bin)} {...dropProps((id) => onMatch(id, bin))}>
            {/* La ilustración del concepto llenando la caja vacía. */}
            <FondoTermino termino={info.titulo} />
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
              <VinetaTermino termino={info.titulo} color={T.text2} icono={info.icono} tam={29} radio={8} />
              <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{info.titulo}</span>
            </div>
            <div style={{ fontSize: 14, color: T.text3, marginBottom: 10, lineHeight: 1.4 }}>{info.subtitulo}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dentro.length === 0 ? (
                <div style={{ fontSize: 14, color: T.text3, opacity: 0.7, padding: "6px 0" }}>Arrastra aquí…</div>
              ) : (
                dentro.map((e) => (
                  <span key={e.id} style={{ animation: "jpPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 14, color: OK, marginTop: 2 }} />
                    {e.texto}
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

function RowsConceptos({
  selCon,
  shakeCon,
  empCon,
  onMatch,
  dropProps,
}: {
  selCon: string | null;
  shakeCon: string | null;
  empCon: Record<string, boolean>;
  onMatch: (chipId: string, rowId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11, minWidth: 0 }}>
      {CONCEPTOS.map((c) => {
        const done = empCon[c.id];
        return (
          <div
            key={c.id}
            className="jp-row"
            data-shake={shakeCon === c.id}
            data-done={done}
            onClick={() => !done && selCon && onMatch(selCon, c.id)}
            {...dropProps((id) => onMatch(id, c.id))}
          >
            <div className="jp-slot" data-armed={!done && !!selCon} style={done ? { borderStyle: "solid", borderColor: OK, background: `${OK}1a` } : undefined}>
              {done ? (
                <span style={{ animation: "jpPop .25s ease", fontSize: 14, fontWeight: 900, color: "#fff", display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <i className="fa-solid fa-diagram-project" />
                  {c.concepto}
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: 14 }} /> concepto
                </span>
              )}
            </div>
            <div style={{ flex: "1 1 200px", minWidth: 0 }}>
              <div style={{ fontSize: 14, color: done ? "#fff" : T.text2, lineHeight: 1.45 }}>{c.definicion}</div>
              <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.4, marginTop: 3, fontStyle: "italic" }}>{c.ejemplo}</div>
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
        Cinco afirmaciones sobre la agencia juvenil, las formas de participación y el papel de las juventudes en la historia. Decide si son verdaderas o falsas y pulsa «Comprobar».
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))", gap: 9 }}>
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
                    <button key={oi} className="jp-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="jp-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="jp-btn" onClick={reintentar}>
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
