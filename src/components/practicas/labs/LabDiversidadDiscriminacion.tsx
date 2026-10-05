"use client";

/**
 * Laboratorio — Diversidad cultural, organización social y discriminación:
 * SIMULADOR de convivencia en una secundaria ficticia.
 * Práctica experimental para CS-II-P02-A4 (Ciencias Sociales II).
 *
 * El alumno recorre siete escenas cotidianas de la secundaria «Los Cedros»
 * (escuela y personajes FICTICIOS; las cifras son de simulación). En cada una
 * decide: (1) ¿hay discriminación o es una forma de organización social?,
 * (2) ¿de qué tipo? (subordinación, exclusión, dominación, racismo, con las
 * definiciones del propio laboratorio) y (3) ¿qué responde? El medidor de
 * convivencia y la reacción de los personajes cambian con cada decisión, y la
 * retroalimentación explica el porqué con derechos, estereotipos y prejuicios.
 *
 * Modos extra (conservados): «¿Organización o discriminación?» (clasificar,
 * en Mesa), «Empareja concepto e idea» (Mesa), «Escribe el término» y
 * «Completa el texto». La teoría verbatim está en la pestaña Teoría. Lógica
 * pura en `diversidad-discriminacion-sim.ts`.
 */

import { useEffect, useRef, useState, type DragEvent, type KeyboardEvent, type ReactNode } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, Eyebrow } from "./_kit";
import { LabShell, Bloque, Mesa, BotonHerramienta } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { DIVERSIDAD_DISCRIMINACION_HUECOS } from "./diversidad-discriminacion-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { DIVERSIDAD_DISCRIMINACION_FICHA } from "./diversidad-discriminacion-ficha";
import { FondoTermino, VinetaTermino } from "./_vineta";
import {
  TARJETAS,
  CATEGORIA_INFO,
  CONCEPTOS,
  PARES,
  QUIZ,
  DATO_DIVERSIDAD,
  type Categoria,
} from "./diversidad-discriminacion-data";
import {
  CONV_INICIO,
  CONV_META,
  ESCENAS,
  PERSONAJES,
  TIPOS,
  convivencia,
  deltaIdentificar,
  deltaTipo,
  esDiscriminacion,
  estadoAnimo,
  pasoDe,
  type Escena,
  type Juicios,
  type Tipo,
} from "./diversidad-discriminacion-sim";

const NO = "#FF5E5E";
const AMBAR = "#FFC75A";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
const RETO_KEY = "cen-diversidad-discriminacion-reto";
const RUTA_FOTOS = "/media/labs-sim/diversidad-discriminacion";

type Modo = "secundaria" | "clasificar" | "conceptos" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "secundaria", label: "La secundaria", icono: "fa-school" },
  { id: "clasificar", label: "¿Organización o discriminación?", icono: "fa-layer-group" },
  { id: "conceptos", label: "Empareja concepto e idea", icono: "fa-link" },
  { id: "glosario", label: "Escribe el término", icono: "fa-keyboard" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

const ANIMO = {
  bien: { icono: "fa-face-smile", col: OK },
  regular: { icono: "fa-face-meh", col: AMBAR },
  mal: { icono: "fa-face-frown", col: NO },
} as const;

export function LabDiversidadDiscriminacion({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("secundaria");

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

  // ── simulador de la secundaria ────────────────────────────────────────
  const [juicios, setJuicios] = useState<Juicios>({});
  const [vista, setVista] = useState(0);
  const hechas = ESCENAS.filter((e) => pasoDe(e, juicios[e.id]) === "hecha").length;
  const finalizado = hechas === ESCENAS.length;
  const conv = convivencia(juicios);
  const meta = finalizado && conv >= CONV_META;

  const identificar = (e: Escena, discr: boolean) => {
    if (juicios[e.id]) return;
    setJuicios((j) => ({ ...j, [e.id]: { discr } }));
    if (discr === esDiscriminacion(e)) sfxPlace();
    else sfxNo();
  };
  const elegirTipo = (e: Escena, tipo: Tipo) => {
    const j = juicios[e.id];
    if (!j || j.tipo) return;
    setJuicios((x) => ({ ...x, [e.id]: { ...j, tipo } }));
    if (tipo === e.correcto) sfxPlace();
    else sfxNo();
  };
  const responder = (e: Escena, id: string) => {
    const j = juicios[e.id];
    if (!j || j.resp) return;
    setJuicios((x) => ({ ...x, [e.id]: { ...j, resp: id } }));
    const r = e.respuestas.find((q) => q.id === id)!;
    if (r.tono === "bien") sfxPlace();
    else if (r.tono === "mal") sfxNo();
    else if (sonido) audioRef.current?.blip();
  };
  const resetSim = () => {
    setJuicios({});
    setVista(0);
  };

  // arrastre nativo
  const dragProps = (id: string) => ({
    draggable: true,
    onDragStart: (e: DragEvent) => {
      e.dataTransfer.setData("text/plain", id);
      e.dataTransfer.effectAllowed = "move";
      // El hueco que deja la tarjeta mientras viaja. Por atributo y no por
      // estado: un render por cada gesto de arrastre se nota con 20 tarjetas.
      e.currentTarget.setAttribute("data-arrastrando", "true");
    },
    onDragEnd: (e: DragEvent) => {
      // También cuando se suelta FUERA de cualquier zona; si no, la tarjeta se
      // queda medio borrada para siempre.
      e.currentTarget.removeAttribute("data-arrastrando");
      document.querySelectorAll('[data-sobre="true"]').forEach((z) => z.removeAttribute("data-sobre"));
    },
  });
  const dropProps = (onDrop: (id: string) => void) => ({
    onDragOver: (e: DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    },
    onDragEnter: (e: DragEvent) => {
      e.preventDefault();
      e.currentTarget.setAttribute("data-sobre", "true");
    },
    onDragLeave: (e: DragEvent) => {
      // `dragleave` salta también al pasar sobre un HIJO de la zona. Apagar sin
      // comprobar deja la zona parpadeando mientras mueves la mano por dentro.
      const r = e.currentTarget.getBoundingClientRect();
      const fuera = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      if (fuera) e.currentTarget.removeAttribute("data-sobre");
    },
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      e.currentTarget.removeAttribute("data-sobre");
      const id = e.dataTransfer.getData("text/plain");
      if (id) onDrop(id);
    },
    "data-zona": "true" as const,
    role: "button" as const,
    tabIndex: 0,
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        (e.currentTarget as HTMLElement).click();
      }
    },
  });

  // ── modo clasificar (organización / discriminación) ─────────────────────
  const [ubicTarj, setUbicTarj] = useState<Record<string, Categoria>>({});
  const [selTarj, setSelTarj] = useState<string | null>(null);
  const [shakeTarj, setShakeTarj] = useState<Categoria | null>(null);
  const tarjLibres = TARJETAS.filter((t) => !ubicTarj[t.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarTarj = (tarjId: string, bin: Categoria) => {
    if (ubicTarj[tarjId]) return;
    const t = TARJETAS.find((x) => x.id === tarjId);
    if (t && t.categoria === bin) {
      setUbicTarj((e) => ({ ...e, [tarjId]: bin }));
      setSelTarj(null);
      sfxPlace();
      if (Object.keys(ubicTarj).length + 1 >= TARJETAS.length) sfxOk();
    } else {
      setShakeTarj(bin);
      sfxNo();
      window.setTimeout(() => setShakeTarj(null), 420);
    }
  };
  const resetClasificar = () => {
    setUbicTarj({});
    setSelTarj(null);
  };

  // ── modo conceptos (empareja concepto → idea) ───────────────────────────
  const [empCon, setEmpCon] = useState<Record<string, boolean>>({});
  const [selCon, setSelCon] = useState<string | null>(null);
  const [shakeCon, setShakeCon] = useState<string | null>(null);
  const conLibres = CONCEPTOS.filter((c) => !empCon[c.id]).slice().sort((a, b) => a.concepto.localeCompare(b.concepto, "es"));

  const intentarCon = (chipId: string, rowId: string) => {
    if (empCon[rowId]) return;
    if (chipId === rowId) {
      setEmpCon((e) => ({ ...e, [rowId]: true }));
      setSelCon(null);
      sfxPlace();
      if (Object.keys(empCon).length + 1 >= CONCEPTOS.length) sfxOk();
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
  const resetTexto = () => {
    setTextoDone(false);
    setTextoIntento((n) => n + 1);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso / estrellas ──────────────────────────────────────────────
  const clasificarDone = Object.keys(ubicTarj).length >= TARJETAS.length;
  const conceptosDone = Object.keys(empCon).length >= CONCEPTOS.length;
  const modosHechos = (finalizado ? 1 : 0) + (clasificarDone ? 1 : 0) + (conceptosDone ? 1 : 0) + (glosarioDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar todos los modos vale 2★; la tercera se gana con precisión y
  // dejando la convivencia de la escuela en buen punto.
  const base = Math.min(3, partida.estrellasCon(modosHechos, 5));
  const estrellas = modosHechos >= 5 && !meta ? Math.min(2, base) : base;

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);
  useEffect(() => {
    if (estrellas > 0) registraEstrellas(estrellas);
  }, [estrellas, registraEstrellas]);

  const objetivos = [
    { txt: `Resuelve las ${ESCENAS.length} escenas de la secundaria`, done: finalizado },
    { txt: `Termina con la convivencia en ${CONV_META} o más`, done: meta },
    { txt: "Clasifica las 9 tarjetas (organización / discriminación)", done: clasificarDone },
    { txt: "Empareja los 5 conceptos con su idea", done: conceptosDone },
    { txt: "Escribe los 5 términos del glosario", done: glosarioDone },
    { txt: "Consigue 3★ (una por cada modo)", done: bestEstrellas >= 3 },
    { txt: "Aprueba el cuestionario de comprensión", done: quizAprobado },
  ];

  const resetActual = modo === "texto" ? resetTexto : modo === "clasificar" ? resetClasificar : modo === "conceptos" ? resetConceptos : modo === "secundaria" ? resetSim : resetGlosario;

  const lectura = modo === "secundaria" ? `Convivencia ${conv} de 100 · escena ${Math.min(hechas + 1, ESCENAS.length)} de ${ESCENAS.length}` : `${modosHechos}/5 modos · ${bestEstrellas}★`;

  const escena = (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
      <style>{ESTILOS(accent, color.rgba)}</style>

      {modo === "secundaria" && (
        <Secundaria accent={accent} juicios={juicios} vista={vista} onVista={setVista} conv={conv} finalizado={finalizado} meta={meta} onIdentificar={identificar} onTipo={elegirTipo} onResponder={responder} onReiniciar={resetSim} />
      )}

      {modo === "texto" && (
        <CompletaTexto
          key={textoIntento}
          data={DIVERSIDAD_DISCRIMINACION_HUECOS}
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
          <div className="dd-banco">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
              <Eyebrow>Arrastra cada tarjeta a su categoría</Eyebrow>
              <span style={{ fontSize: 14, fontWeight: 800, color: clasificarDone ? OK : T.text3 }}>
                {Object.keys(ubicTarj).length}/{TARJETAS.length}
              </span>
            </div>
            {tarjLibres.length === 0 ? (
              <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                <i className="fa-solid fa-circle-check" /> ¡Clasificaste las {TARJETAS.length} tarjetas!
              </div>
            ) : (
              tarjLibres.map((t) => (
                <button key={t.id} className="dd-chip" data-sel={selTarj === t.id} onClick={() => setSelTarj((v) => (v === t.id ? null : t.id))} {...dragProps(t.id)}>
                  {t.texto}
                </button>
              ))
            )}
          </div>
          <BinsTarjetas selTarj={selTarj} shakeTarj={shakeTarj} ubicTarj={ubicTarj} onMatch={intentarTarj} dropProps={dropProps} />
        </Mesa>
      )}

      {modo === "conceptos" && (
        <Mesa>
          <div className="dd-banco">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
              <Eyebrow>Arrastra cada concepto a la idea que lo define</Eyebrow>
              <span style={{ fontSize: 14, fontWeight: 800, color: conceptosDone ? OK : T.text3 }}>
                {Object.keys(empCon).length}/{CONCEPTOS.length}
              </span>
            </div>
            {conLibres.length === 0 ? (
              <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                <i className="fa-solid fa-circle-check" /> ¡Emparejaste los {CONCEPTOS.length} conceptos!
              </div>
            ) : (
              conLibres.map((c) => (
                <button key={c.id} className="dd-chip" data-sel={selCon === c.id} onClick={() => setSelCon((v) => (v === c.id ? null : c.id))} {...dragProps(c.id)}>
                  <i className="fa-solid fa-people-group" style={{ fontSize: 14, color: T.text3 }} />
                  {c.concepto}
                </button>
              ))
            )}
          </div>
          <RowsConceptos selCon={selCon} shakeCon={shakeCon} empCon={empCon} onMatch={intentarCon} dropProps={dropProps} />
        </Mesa>
      )}

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
          }}
          onAcierto={sfxPlace}
          onError={sfxNo}
        />
      )}
    </div>
  );

  const pista: Record<Modo, string> = {
    secundaria: "Una forma de organización social agrupa y coordina a las personas; la discriminación es un trato desigual e injusto que opera con subordinación, exclusión y dominación. Después de nombrarla, importa qué haces: mira cómo reacciona el personaje.",
    clasificar: "Una forma de organización social coordina y agrupa a las personas (familia, comunidad, clases, sociedad civil); la discriminación opera mediante la subordinación, la exclusión y la dominación.",
    conceptos: "Las OSC son organizaciones formales y registradas; los movimientos sociales son acciones colectivas más flexibles.",
    glosario: "Lee la definición y su ejemplo y escribe el término. Si te atoras, la pista te da la inicial y las letras.",
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
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                  {bestEstrellas >= 3 ? "¡Distingues organización social de discriminación con claridad!" : "Termina los cinco modos para ganar 2★; la tercera pide 2 errores o menos y una escuela con buena convivencia."}
                </div>
              </Bloque>
              <Bloque titulo="Pista de este modo" icono="fa-lightbulb">
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>{pista[modo]}</div>
              </Bloque>
              {modo === "secundaria" && (
                <Bloque titulo="Los tipos que verás" icono="fa-scale-balanced">
                  <div style={{ display: "grid", gap: 8 }}>
                    {TIPOS.map((t) => (
                      <div key={t.id} style={{ fontSize: 14, color: T.text2, lineHeight: 1.45 }}>
                        <strong style={{ color: T.text }}>{t.nombre}.</strong> {t.def}
                      </div>
                    ))}
                  </div>
                </Bloque>
              )}
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
                <FichaTeorica data={DIVERSIDAD_DISCRIMINACION_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <Bloque titulo="Organización o discriminación" icono="fa-layer-group">
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {(Object.keys(CATEGORIA_INFO) as Categoria[]).map((k) => (
                    <div key={k} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>{CATEGORIA_INFO[k].titulo}.</strong> {CATEGORIA_INFO[k].subtitulo}
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Conceptos clave" icono="fa-link">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {CONCEPTOS.map((c) => (
                    <div key={c.id} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>{c.concepto}.</strong> {c.idea}
                      <div style={{ fontStyle: "italic", color: T.text3, marginTop: 2 }}>{c.ejemplo}</div>
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Glosario" icono="fa-spell-check">
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
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>{DATO_DIVERSIDAD}</div>
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
  @keyframes ddShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
  @keyframes ddPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
  .dd-banco { display:flex; flex-direction:column; gap:10px; padding:14px; border-radius:16px; border:1px solid ${T.line}; background:${T.glass}; min-width:0; }
  .dd-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:flex-start; gap:8px; padding:11px 14px; border-radius:14px;
    border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:700; user-select:none; max-width:100%; text-align:left; line-height:1.4;
    transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
  .dd-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); transform:translateY(-2px); }
  .dd-chip[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -5px ${accent}; transform:translateY(-3px) scale(1.02); }
  .dd-chip[data-arrastrando="true"] { opacity:.4; }
  .dd-chip:active { cursor:grabbing; }
  .dd-row { position:relative; border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; transition:all .16s; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
  .dd-row[data-shake="true"] { animation:ddShake .4s; border-color:${NO}; }
  .dd-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
  .dd-row[data-sobre="true"], .dd-bin[data-sobre="true"] { border-color:${accent}; background:rgba(${rgba},0.12); }
  .dd-slot { flex-shrink:0; min-width:min(100%, 200px); min-height:42px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
    display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:14px; transition:all .16s; cursor:pointer; padding:4px 10px; }
  .dd-slot[data-armed="true"] { border-color:${accent}; background:rgba(${rgba},0.1); }
  .dd-bin { position:relative; border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; transition:all .16s; min-height:160px; }
  .dd-bin[data-shake="true"] { animation:ddShake .4s; border-color:${NO}; }
  .dd-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
  .dd-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
  .dd-q:disabled{ cursor:default; }
  .dd-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:12px 18px;
    border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; }
  .dd-btn:hover:not(:disabled) { border-color:${T.lineStrong}; }
  .dd-btn:disabled { opacity:.45; cursor:not-allowed; }
  .dd-btn-main { background:${accent}; color:#04121f; border-color:transparent; }

  /* Simulador */
  .dd-panel { display:flex; flex-direction:column; gap:10px; padding:14px; border-radius:16px; border:1px solid ${T.line}; background:${T.glass}; min-width:0; }
  .dd-escena { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap:14px; align-items:start; }
  .dd-foto { position:relative; overflow:hidden; border-radius:12px; aspect-ratio:16 / 9; display:flex; align-items:center; justify-content:center;
    background:linear-gradient(135deg, rgba(${rgba},0.35) 0%, rgba(8,19,31,0.9) 100%); }
  .dd-foto > i { font-size:34px; color:rgba(255,255,255,0.5); }
  .dd-foto > img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .dd-opt { cursor:pointer; display:flex; align-items:center; gap:10px; padding:11px 13px; border-radius:12px; border:1.5px solid ${T.line}; background:${T.inset};
    color:${T.text}; font-size:14px; font-weight:700; text-align:left; line-height:1.35; width:100%; min-width:0; transition:border-color .14s, background .14s; }
  .dd-opt:hover:not(:disabled) { border-color:${T.lineStrong}; background:rgba(255,255,255,0.07); }
  .dd-opt:disabled { cursor:default; }
  .dd-opt[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); }
  .dd-opt[data-t="bien"] { border-color:${OK}88; background:${OK}14; }
  .dd-opt[data-t="mal"] { border-color:${NO}88; background:${NO}12; }
  .dd-opt[data-t="regular"] { border-color:${AMBAR}88; background:${AMBAR}12; }
  .dd-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 150px), 1fr)); gap:8px; }
  .dd-barra { height:14px; border-radius:8px; background:${T.inset}; border:1px solid ${T.line}; position:relative; overflow:hidden; }
  .dd-barra > i { display:block; height:100%; border-radius:8px; transition:width .6s cubic-bezier(.2,.8,.2,1), background .6s; }
  .dd-barra > b { position:absolute; top:0; bottom:0; width:2px; background:#fff; opacity:.7; }
  .dd-gente { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 90px), 1fr)); gap:8px; }
  .dd-per { display:flex; flex-direction:column; align-items:center; gap:4px; padding:8px 6px; border-radius:12px; border:1.5px solid transparent; font-size:14px; font-weight:700; color:${T.text2}; text-align:center; transition:border-color .2s, background .2s; }
  .dd-per[data-foco="true"] { border-color:${accent}; background:rgba(${rgba},0.14); color:#fff; }
  .dd-av { position:relative; width:42px; height:42px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:18px; color:#04121f; }
  .dd-av i.fa-face-smile, .dd-av i.fa-face-meh, .dd-av i.fa-face-frown { position:absolute; right:-6px; bottom:-6px; font-size:20px; background:#08131f; border-radius:50%; }
  .dd-dots { display:flex; gap:6px; flex-wrap:wrap; }
  .dd-dot { cursor:pointer; width:34px; height:34px; border-radius:50%; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text2}; font-size:14px; font-weight:800; }
  .dd-dot[data-on="true"] { border-color:${accent}; color:#fff; background:rgba(${rgba},0.2); }
  .dd-dot[data-hecha="true"] { border-color:${OK}88; color:${OK}; }
  .dd-nota { display:flex; gap:9px; align-items:flex-start; font-size:14px; line-height:1.45; padding:9px 11px; border-radius:10px; border:1px solid ${T.line}; background:${T.inset}; color:${T.text2}; }
  .dd-pop { animation:ddPop .28s ease; }
  @media (prefers-reduced-motion: reduce){
    .dd-row[data-shake="true"], .dd-bin[data-shake="true"], .dd-pop { animation:none; }
    .dd-chip, .dd-chip:hover, .dd-chip[data-sel="true"] { transform:none; transition:none; }
    .dd-barra > i { transition:none; }
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════
 * Simulador: la secundaria «Los Cedros» (ficticia)
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Foto de la escena con respaldo (gradiente + ícono) si el archivo aún no existe. */
function FotoSim({ clave, icono }: { clave: string; icono: string }) {
  const [ok, setOk] = useState(true);
  return (
    <div className="dd-foto">
      <i className={`fa-solid ${icono}`} aria-hidden />
      {ok && <img src={`${RUTA_FOTOS}/${clave}.webp`} alt="" loading="lazy" onError={() => setOk(false)} />}
    </div>
  );
}

const TONOS_PERSONAJE = ["#7DD3FC", "#FCA5A5", "#FDE68A", "#C4B5FD", "#86EFAC", "#FDBA74"];

function Nota({ ok, children }: { ok: boolean | null; children: ReactNode }) {
  const col = ok === null ? AMBAR : ok ? OK : NO;
  const ico = ok === null ? "fa-circle-info" : ok ? "fa-circle-check" : "fa-circle-xmark";
  return (
    <div className="dd-nota dd-pop" style={{ borderColor: `${col}66` }}>
      <i className={`fa-solid ${ico}`} aria-hidden style={{ color: col, marginTop: 3 }} />
      <span>{children}</span>
    </div>
  );
}

function Secundaria({
  accent,
  juicios,
  vista,
  onVista,
  conv,
  finalizado,
  meta,
  onIdentificar,
  onTipo,
  onResponder,
  onReiniciar,
}: {
  accent: string;
  juicios: Juicios;
  vista: number;
  onVista: (i: number) => void;
  conv: number;
  finalizado: boolean;
  meta: boolean;
  onIdentificar: (e: Escena, discr: boolean) => void;
  onTipo: (e: Escena, t: Tipo) => void;
  onResponder: (e: Escena, id: string) => void;
  onReiniciar: () => void;
}) {
  const e = ESCENAS[Math.min(vista, ESCENAS.length - 1)]!;
  const j = juicios[e.id];
  const paso = pasoDe(e, j);
  const real = esDiscriminacion(e);
  const resp = e.respuestas.find((r) => r.id === j?.resp);
  const animoGeneral = estadoAnimo(conv);
  const colConv = animoGeneral === "bien" ? OK : animoGeneral === "regular" ? AMBAR : NO;
  const hechas = ESCENAS.filter((x) => pasoDe(x, juicios[x.id]) === "hecha").length;

  return (
    <>
      <div className="dd-panel">
        <Eyebrow>Secundaria «Los Cedros» · escuela ficticia (simulación)</Eyebrow>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: T.text }}>
          <span>
            <i className="fa-solid fa-handshake-angle" aria-hidden style={{ color: colConv, marginRight: 8 }} />
            Convivencia e inclusión
          </span>
          <span style={{ color: colConv, fontVariantNumeric: "tabular-nums" }}>{conv} / 100</span>
        </div>
        <div className="dd-barra" role="img" aria-label={`Convivencia: ${conv} de 100`}>
          <i style={{ width: `${conv}%`, background: colConv }} />
          <b style={{ left: `${CONV_META}%` }} />
        </div>
        <div style={{ fontSize: 14, color: T.text3 }}>
          Empieza en {CONV_INICIO}. La raya blanca marca {CONV_META}: una escuela donde la convivencia es buena.
        </div>
        <div className="dd-gente">
          {PERSONAJES.map((p, i) => {
            const foco = p === e.personaje;
            const animo = foco && resp ? resp.tono : animoGeneral;
            const a = ANIMO[animo];
            return (
              <div key={p} className="dd-per" data-foco={foco}>
                <span className="dd-av" style={{ background: TONOS_PERSONAJE[i % TONOS_PERSONAJE.length] }}>
                  <i className="fa-solid fa-user" aria-hidden />
                  <i className={`fa-regular ${a.icono}`} aria-hidden style={{ color: a.col }} />
                </span>
                {p}
              </div>
            );
          })}
        </div>
        <div className="dd-dots" role="tablist" aria-label="Escenas">
          {ESCENAS.map((x, i) => {
            const alcanzable = i <= hechas;
            return (
              <button key={x.id} type="button" role="tab" aria-selected={i === vista} className="dd-dot" data-on={i === vista} data-hecha={pasoDe(x, juicios[x.id]) === "hecha"} disabled={!alcanzable} onClick={() => onVista(i)} aria-label={`Escena ${i + 1}: ${x.titulo}`}>
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div className="dd-escena">
        <div className="dd-panel">
          <Eyebrow>
            Escena {vista + 1} de {ESCENAS.length} · {e.titulo}
          </Eyebrow>
          <FotoSim clave={e.foto} icono={e.icono} />
          <div style={{ fontSize: 15, lineHeight: 1.55, color: T.text }}>{e.relato}</div>
        </div>

        <div className="dd-panel">
          <Eyebrow>Tus decisiones</Eyebrow>

          <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>1. ¿Qué ves en esta escena?</div>
          <div className="dd-grid">
            <button type="button" className="dd-opt" disabled={!!j} data-sel={j?.discr === true} onClick={() => onIdentificar(e, true)}>
              <i className="fa-solid fa-ban" aria-hidden style={{ color: NO }} /> Discriminación
            </button>
            <button type="button" className="dd-opt" disabled={!!j} data-sel={j?.discr === false} onClick={() => onIdentificar(e, false)}>
              <i className="fa-solid fa-people-group" aria-hidden style={{ color: OK }} /> Organización social
            </button>
          </div>
          {j && (
            <Nota ok={j.discr === real}>
              {j.discr === real ? "Bien visto. " : real ? "Aquí sí había discriminación y pasó inadvertida. " : "Aquí no había discriminación y la acusaste sin motivo. "}
              <span style={{ color: T.text3 }}>(convivencia {deltaIdentificar(e, j.discr) > 0 ? "+" : ""}
              {deltaIdentificar(e, j.discr)}, simulación)</span>
            </Nota>
          )}

          {j && (paso === "tipo" || j.tipo) && (
            <>
              <div style={{ fontSize: 14, fontWeight: 800, color: T.text, marginTop: 4 }}>2. ¿De qué tipo es?</div>
              <div className="dd-grid">
                {TIPOS.map((t) => (
                  <button key={t.id} type="button" className="dd-opt" disabled={!!j.tipo} data-sel={j.tipo === t.id} data-t={j.tipo ? (t.id === e.correcto ? "bien" : j.tipo === t.id ? "mal" : undefined) : undefined} onClick={() => onTipo(e, t.id)}>
                    <i className={`fa-solid ${t.icono}`} aria-hidden style={{ color: accent }} /> {t.nombre}
                  </button>
                ))}
              </div>
              {j.tipo && (
                <Nota ok={j.tipo === e.correcto}>
                  {j.tipo === e.correcto ? "Correcto. " : "No es ese tipo. "}
                  {e.porque} <span style={{ color: T.text3 }}>(convivencia {deltaTipo(e, j.tipo) > 0 ? "+" : ""}{deltaTipo(e, j.tipo)})</span>
                </Nota>
              )}
            </>
          )}

          {j && !real && (
            <Nota ok={null}>{e.porque}</Nota>
          )}
          {j && real && !j.discr && (
            <Nota ok={null}>{e.porque}</Nota>
          )}

          {(paso === "responder" || paso === "hecha") && (
            <>
              <div style={{ fontSize: 14, fontWeight: 800, color: T.text, marginTop: 4 }}>3. ¿Qué haces tú?</div>
              <div style={{ display: "grid", gap: 8 }}>
                {e.respuestas.map((r) => (
                  <button key={r.id} type="button" className="dd-opt" disabled={paso === "hecha"} data-sel={j?.resp === r.id} data-t={paso === "hecha" ? (j?.resp === r.id ? r.tono : undefined) : undefined} onClick={() => onResponder(e, r.id)}>
                    {r.texto}
                  </button>
                ))}
              </div>
              {resp && (
                <>
                  <Nota ok={resp.tono === "bien" ? true : resp.tono === "mal" ? false : null}>
                    <strong style={{ color: T.text }}>{resp.reaccion}</strong> {resp.porque}{" "}
                    <span style={{ color: T.text3 }}>(convivencia {resp.delta > 0 ? "+" : ""}{resp.delta})</span>
                  </Nota>
                  {vista < ESCENAS.length - 1 ? (
                    <button type="button" className="dd-btn dd-btn-main" onClick={() => onVista(vista + 1)}>
                      <i className="fa-solid fa-arrow-right" aria-hidden /> Siguiente escena
                    </button>
                  ) : null}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {finalizado && (
        <div className="dd-panel dd-pop" style={{ borderColor: `${meta ? OK : AMBAR}66` }}>
          <Eyebrow>Cierre del ciclo escolar · simulación</Eyebrow>
          <div style={{ fontSize: 15, fontWeight: 800, color: meta ? OK : AMBAR, lineHeight: 1.45 }}>
            <i className={`fa-solid ${meta ? "fa-trophy" : "fa-circle-half-stroke"}`} aria-hidden style={{ marginRight: 8 }} />
            {meta
              ? `La convivencia llegó a ${conv}: nombrar la discriminación y actuar juntos mejora la vida de la escuela.`
              : `La convivencia quedó en ${conv}. Para llegar a ${CONV_META} hay que reconocer la discriminación, nombrar su tipo y responder sin sumarse ni callar.`}
          </div>
          <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
            La discriminación produce exclusión y desigualdad en el acceso a derechos; la organización comunitaria, en cambio, suma a las personas. Reconocer la diferencia es el primer paso para actuar.
          </div>
          <button type="button" className="dd-btn" onClick={onReiniciar}>
            <i className="fa-solid fa-rotate-left" aria-hidden /> Volver a empezar
          </button>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Paneles de los modos de arrastre (reciben los manejadores como props)
 * ═══════════════════════════════════════════════════════════════════════════ */
type DropFactory = (onDrop: (id: string) => void) => {
  onDragOver: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
};

function BinsTarjetas({
  selTarj,
  shakeTarj,
  ubicTarj,
  onMatch,
  dropProps,
}: {
  selTarj: string | null;
  shakeTarj: Categoria | null;
  ubicTarj: Record<string, Categoria>;
  onMatch: (tarjId: string, bin: Categoria) => void;
  dropProps: DropFactory;
}) {
  const bins: Categoria[] = ["organizacion", "discriminacion"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 12 }}>
      {bins.map((bin) => {
        const info = CATEGORIA_INFO[bin];
        const dentro = TARJETAS.filter((t) => ubicTarj[t.id] === bin);
        return (
          <div
            key={bin}
            className="dd-bin"
            data-shake={shakeTarj === bin}
            onClick={() => selTarj && onMatch(selTarj, bin)}
            style={{ isolation: "isolate" }}
            {...dropProps((id) => onMatch(id, bin))}
          >
            {/* La ilustración del concepto llenando la caja vacía. */}
            <FondoTermino termino={info.titulo} />
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
              <VinetaTermino termino={info.titulo} color={T.text2} icono={info.icono} tam={29} radio={8} />
              <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{info.titulo}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dentro.length === 0 ? (
                <div style={{ fontSize: 14, color: T.text3, opacity: 0.7, padding: "8px 0" }}>Arrastra aquí…</div>
              ) : (
                dentro.map((t) => (
                  <span key={t.id} style={{ animation: "ddPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 14, color: OK, marginTop: 2 }} />
                    {t.texto}
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
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {CONCEPTOS.map((c) => {
        const done = empCon[c.id];
        return (
          <div
            key={c.id}
            className="dd-row"
            data-shake={shakeCon === c.id}
            data-done={done}
            onClick={() => !done && selCon && onMatch(selCon, c.id)}
            {...dropProps((id) => onMatch(id, c.id))}
          >
            <div className="dd-slot" data-armed={!done && !!selCon} style={done ? { borderStyle: "solid", borderColor: OK, background: `${OK}1a` } : undefined}>
              {done ? (
                <span style={{ animation: "ddPop .25s ease", fontSize: 14, fontWeight: 900, color: "#fff", display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <i className="fa-solid fa-people-group" />
                  {c.concepto}
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: 14 }} /> concepto
                </span>
              )}
            </div>
            <div style={{ flex: "1 1 220px", minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: done ? "#fff" : T.text2, lineHeight: 1.4 }}>{c.idea}</div>
              <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.4, marginTop: 3 }}>{c.ejemplo}</div>
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
        Cuatro afirmaciones sobre organización social, diversidad cultural y discriminación. Decide si son verdaderas o falsas y pulsa «Comprobar».
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
                    <button key={oi} className="dd-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="dd-btn dd-btn-main" onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="dd-btn" onClick={reintentar}>
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
