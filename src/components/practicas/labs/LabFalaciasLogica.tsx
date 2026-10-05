"use client";

/**
 * Laboratorio — Lógica: del silogismo a las falacias
 * Práctica experimental para PFH-III-P01 (Pensamiento Filosófico III).
 *
 * Cinco modos:
 *  1. «El debate» (SIMULADOR) — el Consejo Estudiantil de una prepa ficticia
 *     discute si guardar el celular en clase. Seis mensajes de compañeros
 *     ficticios: el alumno nombra la falacia (o reconoce el argumento sólido),
 *     elige cómo responder y ve moverse la fuerza de cada equipo y la reacción
 *     del público. Modelo en `falacias-logica-sim.ts`.
 *  2. «¿Qué falacia comete?» — clasifica ocho argumentos de ejemplo (verbatim A1).
 *  3. «¿Argumento válido o falacia?» — clasifica seis razonamientos.
 *  4. «Escribe el término» — definición verbatim (A5) → término del glosario.
 *  5. «Completa el texto» — fill_blanks verbatim de la progresión.
 *  + Reto: cuestionario de comprensión (V/F verbatim de A4).
 *
 * DOM puro (sin three.js). Contenido curricular VERBATIM de PFH-III·P01 en «Teoría».
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK } from "./_kit";
import { LabShell, Bloque, BotonHerramienta, Mesa, Dato } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { FALACIAS_LOGICA_HUECOS } from "./falacias-logica-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { FALACIAS_LOGICA_FICHA } from "./falacias-logica-ficha";
import {
  EJEMPLOS,
  FALACIA_INFO,
  ARGUMENTOS,
  VALIDEZ_INFO,
  PARES,
  QUIZ,
  DATO_FALACIAS,
  type Falacia,
  type Validez,
} from "./falacias-logica-data";
import {
  MENSAJES,
  LADOS,
  TEMA,
  ETIQUETAS,
  aplicarEtiqueta,
  aplicarRespuesta,
  calcular,
  humor,
  nombreEtiqueta,
  type Delta,
  type Etiqueta,
  type Mensaje,
  type TipoResp,
  type Turno,
} from "./falacias-logica-sim";

const NO = "#FF5E5E";
const AVISO = "#FFC75A";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { FondoTermino, VinetaTermino } from "./_vineta";
const RETO_KEY = "cen-falacias-logica-reto";
const RUTA_FOTOS = "/media/labs-sim/falacias-logica";

type Modo = "debate" | "falacias" | "validez" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "debate", label: "El debate", icono: "fa-comments" },
  { id: "falacias", label: "¿Qué falacia comete?", icono: "fa-layer-group" },
  { id: "validez", label: "¿Argumento válido o falacia?", icono: "fa-scale-balanced" },
  { id: "glosario", label: "Escribe el término", icono: "fa-keyboard" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

export function LabFalaciasLogica({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("debate");

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

  // ── modo debate (simulador) ────────────────────────────────────────────
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [ronda, setRonda] = useState(0);
  const debate = calcular(turnos);
  const msg = ronda < MENSAJES.length ? MENSAJES[ronda]! : null;
  const turnoActual = msg ? turnos.find((t) => t.id === msg.id) : undefined;

  const etiquetar = (etq: Etiqueta) => {
    if (!msg || turnoActual) return;
    setTurnos((t) => [...t, { id: msg.id, etiqueta: etq }]);
    if (aplicarEtiqueta(msg, etq).acierto) sfxPlace();
    else sfxNo();
  };
  const responder = (tipo: TipoResp) => {
    if (!msg || !turnoActual || turnoActual.resp) return;
    setTurnos((t) => t.map((x) => (x.id === msg.id ? { ...x, resp: tipo } : x)));
    if (tipo === "razon") sfxPlace();
    else sfxNo();
    if (turnos.filter((x) => x.resp).length + 1 >= MENSAJES.length) sfxOk();
  };
  const reiniciarDebate = () => {
    setTurnos([]);
    setRonda(0);
    partida.reiniciar();
  };

  // ── modo falacias (clasifica argumento por falacia) ────────────────────
  const [ubicFal, setUbicFal] = useState<Record<string, Falacia>>({});
  const [selFal, setSelFal] = useState<string | null>(null);
  const [shakeFal, setShakeFal] = useState<Falacia | null>(null);
  const falLibres = EJEMPLOS.filter((e) => !ubicFal[e.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarFal = (ejId: string, bin: Falacia) => {
    if (ubicFal[ejId]) return;
    const e = EJEMPLOS.find((x) => x.id === ejId);
    if (e && e.falacia === bin) {
      setUbicFal((prev) => ({ ...prev, [ejId]: bin }));
      setSelFal(null);
      sfxPlace();
      if (Object.keys(ubicFal).length + 1 >= EJEMPLOS.length) {
        sfxOk();
        persistMejor(true, validezDone, glosarioDone);
      }
    } else {
      setShakeFal(bin);
      sfxNo();
      window.setTimeout(() => setShakeFal(null), 420);
    }
  };
  const resetFalacias = () => {
    setUbicFal({});
    setSelFal(null);
  };

  // ── modo validez (clasifica argumento como válido / falacia) ───────────
  const [ubicVal, setUbicVal] = useState<Record<string, Validez>>({});
  const [selVal, setSelVal] = useState<string | null>(null);
  const [shakeVal, setShakeVal] = useState<Validez | null>(null);
  const valLibres = ARGUMENTOS.filter((a) => !ubicVal[a.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarVal = (argId: string, bin: Validez) => {
    if (ubicVal[argId]) return;
    const a = ARGUMENTOS.find((x) => x.id === argId);
    if (a && a.validez === bin) {
      setUbicVal((prev) => ({ ...prev, [argId]: bin }));
      setSelVal(null);
      sfxPlace();
      if (Object.keys(ubicVal).length + 1 >= ARGUMENTOS.length) {
        sfxOk();
        persistMejor(falaciasDone, true, glosarioDone);
      }
    } else {
      setShakeVal(bin);
      sfxNo();
      window.setTimeout(() => setShakeVal(null), 420);
    }
  };
  const resetValidez = () => {
    setUbicVal({});
    setSelVal(null);
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
  const falaciasDone = Object.keys(ubicFal).length >= EJEMPLOS.length;
  const validezDone = Object.keys(ubicVal).length >= ARGUMENTOS.length;
  const modosHechos = (falaciasDone ? 1 : 0) + (validezDone ? 1 : 0) + (glosarioDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los 3 modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 4);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);

  const persistMejor = (a: boolean, b: boolean, c: boolean) => {
    const est = (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0);
    registraEstrellas(est);
  };

  const objetivos = [
    { txt: "Analiza los 6 mensajes del debate y responde a cada uno", done: debate.cerrado },
    { txt: "Detecta la falacia (o su ausencia) en 5 de los 6 mensajes", done: debate.aciertos >= 5 },
    { txt: "Clasifica los 8 argumentos por su falacia", done: falaciasDone },
    { txt: "Separa los 6 razonamientos en válidos y falacias", done: validezDone },
    { txt: "Escribe los 6 términos del glosario", done: glosarioDone, modo: "glosario" },
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
  const resetActual =
    modo === "texto" ? resetTexto : modo === "falacias" ? resetFalacias : modo === "validez" ? resetValidez : modo === "debate" ? reiniciarDebate : resetGlosario;

  const instruccion = (txt: string, n?: string, ok?: boolean) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", fontSize: 15, fontWeight: 800, color: T.text }}>
      <span>{txt}</span>
      {n && <span style={{ fontSize: 15, fontWeight: 900, color: ok ? OK : T.text3 }}>{n}</span>}
    </div>
  );

  const hm = humor(debate.estado.publico);
  const lectura =
    modo === "debate" ? (
      <>
        {msg ? `Mensaje ${ronda + 1} de ${MENSAJES.length}` : "Debate terminado"} · Público: {hm.texto} ({debate.estado.publico})
      </>
    ) : modo === "falacias" ? (
      <>Argumentos clasificados: {Object.keys(ubicFal).length}/{EJEMPLOS.length}</>
    ) : modo === "validez" ? (
      <>Razonamientos clasificados: {Object.keys(ubicVal).length}/{ARGUMENTOS.length}</>
    ) : (
      <>Repaso de los términos de la lógica</>
    );

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
      lectura={lectura}
      objetivos={objetivos}
      escena={
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <style>{css(accent, color.rgba)}</style>

          {modo === "debate" && (
            <Debate
              ronda={ronda}
              msg={msg}
              turnos={turnos}
              turnoActual={turnoActual}
              resumen={debate}
              onEtiquetar={etiquetar}
              onResponder={responder}
              onSiguiente={() => setRonda((r) => r + 1)}
              onReiniciar={reiniciarDebate}
              onVer={(i) => setRonda(i)}
            />
          )}

          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={FALACIAS_LOGICA_HUECOS}
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

          {modo === "falacias" && (
            <Mesa>
              <div>
                {instruccion("Arrastra cada argumento a la falacia que comete", `${Object.keys(ubicFal).length}/${EJEMPLOS.length}`, falaciasDone)}
                {falLibres.length === 0 ? (
                  <div style={{ fontSize: 15, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Clasificaste los {EJEMPLOS.length} argumentos!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {falLibres.map((e) => (
                      <button key={e.id} className="fal-chip" data-sel={selFal === e.id} onClick={() => setSelFal((v) => (v === e.id ? null : e.id))} {...dragProps(e.id)}>
                        {e.texto}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <BinsFalacias selFal={selFal} shakeFal={shakeFal} ubicFal={ubicFal} onMatch={intentarFal} dropProps={dropProps} />
            </Mesa>
          )}

          {modo === "validez" && (
            <Mesa>
              <div>
                {instruccion("Arrastra cada razonamiento a su tipo de validez", `${Object.keys(ubicVal).length}/${ARGUMENTOS.length}`, validezDone)}
                {valLibres.length === 0 ? (
                  <div style={{ fontSize: 15, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Clasificaste los {ARGUMENTOS.length} razonamientos!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {valLibres.map((a) => (
                      <button key={a.id} className="fal-chip" data-sel={selVal === a.id} onClick={() => setSelVal((v) => (v === a.id ? null : a.id))} {...dragProps(a.id)}>
                        {a.texto}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <BinsValidez selVal={selVal} shakeVal={shakeVal} ubicVal={ubicVal} onMatch={intentarVal} dropProps={dropProps} />
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
                persistMejor(falaciasDone, validezDone, true);
              }}
              onAcierto={sfxPlace}
              onError={sfxNo}
            />
          )}
        </div>
      }
      pestanas={[
        {
          id: "cuaderno",
          etiqueta: "Cuaderno",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="Tu partida" icono="fa-star">
                <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
                  <Dato label="Falacias detectadas" value={`${debate.aciertos}/${MENSAJES.length}`} col={debate.aciertos >= 5 ? OK : undefined} />
                  <Dato label="Público (simulación)" value={`${debate.estado.publico}/100`} col={hm.color} />
                  <Dato label={LADOS.a.corto} value={`${debate.estado.a}`} col={LADOS.a.color} />
                  <Dato label={LADOS.b.corto} value={`${debate.estado.b}`} col={LADOS.b.color} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1, 2, 3].map((s) => (
                      <i key={s} className="fa-solid fa-star" style={{ fontSize: 20, color: s <= bestEstrellas ? "#FFC75A" : "rgba(255,255,255,0.16)" }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.45, flex: "1 1 160px" }}>
                    {bestEstrellas >= 3 ? "¡Detectas falacias y razonas como un filósofo!" : "Termina los tres modos de clasificar y escribir para ganar 2★; la tercera pide 2 errores o menos."}
                  </span>
                </div>
              </Bloque>
              {turnos.length === 0 ? (
                <Bloque titulo="Tus decisiones en el debate" icono="fa-comments">
                  <p style={{ margin: 0, color: T.text3 }}>Aún no hay decisiones. Nombra la falacia del primer mensaje en «El debate».</p>
                </Bloque>
              ) : (
                turnos.map((t, i) => {
                  const m = MENSAJES.find((x) => x.id === t.id)!;
                  const ok = aplicarEtiqueta(m, t.etiqueta).acierto;
                  return (
                    <Bloque key={t.id} titulo={`${i + 1}. ${m.autor} · ${nombreEtiqueta(m.falacia)}`} icono={ok ? "fa-circle-check" : "fa-circle-xmark"}>
                      <p style={{ margin: 0, color: T.text2 }}>
                        <strong style={{ color: T.text }}>Tú dijiste:</strong> {nombreEtiqueta(t.etiqueta)}.
                      </p>
                      <p style={{ margin: 0, color: T.text2 }}>{m.porque}</p>
                    </Bloque>
                  );
                })
              )}
            </>
          ),
        },
        {
          id: "reto",
          etiqueta: "Reto",
          icono: "fa-trophy",
          contenido: <QuizCard accent={accent} rgba={color.rgba} aprobado={quizAprobado} onAprobado={() => setQuizAprobado(true)} playSfx={sonido ? (ok) => (ok ? sfxOk() : sfxNo()) : undefined} />,
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book",
          contenido: (
            <>
              <Bloque titulo="Las cinco falacias" icono="fa-layer-group">
                {(Object.keys(FALACIA_INFO) as Falacia[]).map((f) => (
                  <p key={f} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{FALACIA_INFO[f].titulo}.</strong> {FALACIA_INFO[f].subtitulo}
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Argumento válido y falacia" icono="fa-scale-balanced">
                {(Object.keys(VALIDEZ_INFO) as Validez[]).map((v) => (
                  <p key={v} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{VALIDEZ_INFO[v].titulo}.</strong> {VALIDEZ_INFO[v].subtitulo}
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Dato" icono="fa-circle-info">
                <p style={{ margin: 0, color: T.text2 }}>{DATO_FALACIAS}</p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={FALACIAS_LOGICA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Imagen con respaldo: degradado + ícono detrás; si la imagen no existe, se oculta.
 * ═══════════════════════════════════════════════════════════════════════════ */
function Foto({ clave, icono, alt, clase }: { clave: string; icono: string; alt: string; clase?: string }) {
  const [falla, setFalla] = useState(false);
  return (
    <span className={`fal-foto ${clase ?? ""}`}>
      <i className={`fa-solid ${icono}`} aria-hidden />
      {!falla && <img src={`${RUTA_FOTOS}/${clave}.webp`} alt={alt} loading="lazy" onError={() => setFalla(true)} />}
    </span>
  );
}

function Medidor({ label, valor, color, icono }: { label: string; valor: number; color: string; icono: string }) {
  return (
    <div className="fal-med" role="group" aria-label={`${label}: ${valor} de 100`}>
      <span className="fal-med-top">
        <span>
          <i className={`fa-solid ${icono}`} style={{ color, marginRight: 7 }} aria-hidden />
          {label}
        </span>
        <strong style={{ color }}>{valor}</strong>
      </span>
      <span className="fal-med-barra">
        <span style={{ width: `${valor}%`, background: color }} />
      </span>
    </div>
  );
}

function Deltas({ d }: { d: Delta }) {
  const filas: { k: string; n: number; col: string }[] = [
    { k: LADOS.a.corto, n: d.a, col: LADOS.a.color },
    { k: LADOS.b.corto, n: d.b, col: LADOS.b.color },
    { k: "Público", n: d.publico, col: d.publico >= 0 ? OK : NO },
  ];
  return (
    <div className="fal-deltas">
      {filas
        .filter((f) => f.n !== 0)
        .map((f) => (
          <span key={f.k} className="fal-delta" style={{ borderColor: `${f.col}88` }}>
            {f.k} <strong style={{ color: f.n > 0 ? OK : NO }}>{f.n > 0 ? `+${f.n}` : f.n}</strong>
          </span>
        ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Simulador: el debate del Consejo Estudiantil
 * ═══════════════════════════════════════════════════════════════════════════ */
function Debate({
  ronda,
  msg,
  turnos,
  turnoActual,
  resumen,
  onEtiquetar,
  onResponder,
  onSiguiente,
  onReiniciar,
  onVer,
}: {
  ronda: number;
  msg: Mensaje | null;
  turnos: Turno[];
  turnoActual: Turno | undefined;
  resumen: ReturnType<typeof calcular>;
  onEtiquetar: (e: Etiqueta) => void;
  onResponder: (t: TipoResp) => void;
  onSiguiente: () => void;
  onReiniciar: () => void;
  onVer: (i: number) => void;
}) {
  const hm = humor(resumen.estado.publico);
  const resEtq = msg && turnoActual ? aplicarEtiqueta(msg, turnoActual.etiqueta) : null;
  const resResp = msg && turnoActual?.resp ? aplicarRespuesta(msg, turnoActual.resp) : null;
  const ultima = ronda >= MENSAJES.length - 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
      <div className="fal-cab">
        <Foto clave="debate-aula" icono="fa-people-group" alt="Salón de clases durante un debate" clase="fal-cab-foto" />
        <div style={{ minWidth: 0 }}>
          <strong className="fal-cab-t">{TEMA.titulo}</strong>
          <span className="fal-cab-p">{TEMA.propuesta}</span>
          <span className="fal-cab-n">{TEMA.nota}</span>
        </div>
      </div>

      <div className="fal-meds">
        <Medidor label={LADOS.a.nombre} valor={resumen.estado.a} color={LADOS.a.color} icono={LADOS.a.icono} />
        <Medidor label={LADOS.b.nombre} valor={resumen.estado.b} color={LADOS.b.color} icono={LADOS.b.icono} />
        <Medidor label={`Público: ${hm.texto}`} valor={resumen.estado.publico} color={hm.color} icono={hm.icono} />
      </div>

      <div className="fal-ronda" role="tablist" aria-label="Mensajes del debate">
        {MENSAJES.map((m, i) => {
          const t = turnos.find((x) => x.id === m.id);
          const ok = t ? aplicarEtiqueta(m, t.etiqueta).acierto : null;
          const accesible = i <= turnos.filter((x) => x.resp).length;
          return (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={i === ronda}
              className="fal-pto"
              data-sel={i === ronda}
              disabled={!accesible}
              onClick={() => onVer(i)}
              style={ok === null ? undefined : { borderColor: ok ? OK : NO }}
            >
              {i + 1}
              {ok !== null && <i className={`fa-solid ${ok ? "fa-check" : "fa-xmark"}`} aria-hidden style={{ color: ok ? OK : NO }} />}
            </button>
          );
        })}
      </div>

      {msg ? (
        <>
          <article className="fal-msg" data-lado={msg.lado} style={{ borderColor: `${LADOS[msg.lado].color}77` }}>
            <Foto clave={msg.foto} icono="fa-user" alt={`Retrato de ${msg.autor}`} clase="fal-retrato" />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="fal-msg-cab">
                <strong>{msg.autor}</strong>
                <span style={{ color: LADOS[msg.lado].color }}>
                  <i className={`fa-solid ${LADOS[msg.lado].icono}`} aria-hidden /> {LADOS[msg.lado].nombre}
                </span>
              </div>
              <p className="fal-msg-txt">{msg.texto}</p>
            </div>
          </article>

          <div>
            {instruccion2("1. ¿Qué falacia comete este mensaje?", turnoActual ? "respondido" : undefined)}
            <div className="fal-opc">
              {ETIQUETAS.map((e) => {
                const sel = turnoActual?.etiqueta === e.id;
                const real = !!turnoActual && e.id === msg.falacia;
                return (
                  <button key={e.id} type="button" className="fal-op" data-sel={sel} data-real={real} disabled={!!turnoActual} onClick={() => onEtiquetar(e.id)}>
                    <i className={`fa-solid ${e.icono}`} aria-hidden />
                    <span>{e.texto}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {turnoActual && resEtq && (
            <div className="fal-retro" data-ok={resEtq.acierto}>
              <strong>
                <i className={`fa-solid ${resEtq.acierto ? "fa-circle-check" : "fa-circle-xmark"}`} aria-hidden />{" "}
                {resEtq.acierto ? "Bien visto" : `Era: ${nombreEtiqueta(msg.falacia)}`}
              </strong>
              <span>{resEtq.texto}</span>
              <span>
                <strong style={{ color: "#fff" }}>Por qué:</strong> {msg.porque}
              </span>
              <Deltas d={resEtq.delta} />
              <span className="fal-sim">Medidores de simulación</span>
            </div>
          )}

          {turnoActual && (
            <div>
              {instruccion2("2. ¿Cómo respondes en el debate?", turnoActual.resp ? "respondido" : undefined)}
              <div className="fal-resp">
                {msg.respuestas.map((r) => (
                  <button key={r.id} type="button" className="fal-op fal-r" data-sel={turnoActual.resp === r.tipo} disabled={!!turnoActual.resp} onClick={() => onResponder(r.tipo)}>
                    <i className={`fa-solid ${r.tipo === "razon" ? "fa-lightbulb" : r.tipo === "contraataque" ? "fa-bolt" : "fa-face-meh-blank"}`} aria-hidden />
                    <span>{r.texto}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {resResp && turnoActual?.resp && (
            <div className="fal-retro" data-ok={turnoActual.resp === "razon"}>
              <strong>
                <i className={`fa-solid ${hm.icono}`} aria-hidden style={{ color: hm.color }} /> El público: {hm.texto}
              </strong>
              <span>{resResp.texto}</span>
              <Deltas d={resResp.delta} />
              <button type="button" className="fal-btn" style={{ background: "var(--lsa)", color: "#04121f", border: "none" }} onClick={onSiguiente}>
                <i className={`fa-solid ${ultima ? "fa-flag-checkered" : "fa-arrow-right"}`} aria-hidden /> {ultima ? "Ver el resultado" : "Siguiente mensaje"}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="fal-retro" data-ok={resumen.estado.publico >= 60}>
          <strong>
            <i className="fa-solid fa-flag-checkered" aria-hidden /> Debate terminado: {resumen.aciertos}/{MENSAJES.length} detectadas · público {hm.texto.toLowerCase()} ({resumen.estado.publico}/100)
          </strong>
          <span>
            {resumen.aciertos >= 5
              ? "Nombras la falacia sin acusar de más y distingues el argumento sólido."
              : "Repasa en el Cuaderno por qué cada mensaje no probaba lo que decía y vuelve a intentarlo."}{" "}
            {resumen.conRazones >= 4
              ? "Además respondiste con razones y el debate salió ganando."
              : "Responder a la idea con razones, en vez de atacar a la persona o callar, es lo que sube al público."}
          </span>
          <span className="fal-sim">Equipos, personas y cifras de simulación.</span>
          <button type="button" className="fal-btn" onClick={onReiniciar}>
            <i className="fa-solid fa-rotate-left" aria-hidden /> Repetir el debate
          </button>
        </div>
      )}
    </div>
  );
}

const instruccion2 = (txt: string, n?: string) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 8 }}>
    <span>{txt}</span>
    {n && <span style={{ fontSize: 14, fontWeight: 900, color: T.text3 }}>{n}</span>}
  </div>
);

const css = (accent: string, rgba: string) => `
  @keyframes falShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
  @keyframes falPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
  .fal-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:14px;
    border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14.5px; font-weight:700; user-select:none; max-width:100%; text-align:left; line-height:1.4;
    transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
  .fal-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); transform:translateY(-2px); }
  .fal-chip[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -5px ${accent}; transform:translateY(-3px) scale(1.02); }
  .fal-chip:active { cursor:grabbing; }
  .fal-bin { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; transition:all .16s; min-height:200px; }
  .fal-bin[data-shake="true"] { animation:falShake .4s; border-color:${NO}; }
  .fal-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14.5px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
  .fal-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
  .fal-q:disabled{ cursor:default; }
  .fal-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
    border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14.5px; font-weight:800; transition:all .14s; }
  .fal-btn:hover { border-color:${T.lineStrong}; }

  /* Simulador del debate */
  .fal-foto { position:relative; display:block; overflow:hidden; background:linear-gradient(135deg, rgba(${rgba},0.35), rgba(8,19,31,0.9)); }
  .fal-foto > i { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:26px; color:rgba(255,255,255,0.55); }
  .fal-foto > img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block; }
  .fal-cab { display:grid; grid-template-columns:minmax(0,120px) minmax(0,1fr); gap:12px; align-items:center; padding:10px; border-radius:14px; border:1.5px solid ${T.line}; background:${T.glass}; }
  .fal-cab-foto { aspect-ratio:16/10; border-radius:10px; }
  .fal-cab-t { display:block; font-size:15px; color:#fff; }
  .fal-cab-p { display:block; font-size:14.5px; color:${T.text2}; line-height:1.4; margin-top:2px; }
  .fal-cab-n { display:block; font-size:14px; color:${T.text3}; margin-top:2px; }
  .fal-meds { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 170px), 1fr)); gap:10px; }
  .fal-med { display:grid; gap:6px; padding:10px 12px; border-radius:12px; border:1.5px solid ${T.line}; background:${T.glass}; min-width:0; }
  .fal-med-top { display:flex; justify-content:space-between; gap:8px; font-size:14px; font-weight:800; color:${T.text2}; }
  .fal-med-top strong { font-size:16px; font-variant-numeric:tabular-nums; }
  .fal-med-barra { display:block; height:8px; border-radius:6px; background:${T.inset}; overflow:hidden; }
  .fal-med-barra > span { display:block; height:100%; border-radius:6px; transition:width .4s; }
  .fal-ronda { display:flex; gap:8px; flex-wrap:wrap; }
  .fal-pto { cursor:pointer; display:inline-flex; align-items:center; gap:5px; min-width:44px; height:40px; justify-content:center; border-radius:12px; border:2px solid ${T.line};
    background:${T.glassSoft}; color:#fff; font-size:14.5px; font-weight:900; }
  .fal-pto[data-sel="true"] { border-color:${accent}; box-shadow:0 0 14px -5px ${accent}; }
  .fal-pto:disabled { opacity:.45; cursor:default; }
  .fal-msg { display:flex; gap:12px; align-items:flex-start; padding:12px; border-radius:16px; border:2px solid ${T.line}; background:${T.glass}; min-width:0; }
  .fal-retrato { flex-shrink:0; width:72px; height:72px; border-radius:50%; border:2px solid ${T.lineStrong}; }
  .fal-msg-cab { display:flex; flex-wrap:wrap; gap:4px 12px; align-items:baseline; font-size:14.5px; }
  .fal-msg-cab strong { color:#fff; font-size:16px; }
  .fal-msg-txt { margin:6px 0 0; font-size:16px; line-height:1.5; color:#fff; overflow-wrap:anywhere; }
  .fal-opc { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap:10px; }
  .fal-resp { display:grid; grid-template-columns:minmax(0,1fr); gap:10px; }
  .fal-op { cursor:pointer; display:flex; align-items:center; gap:10px; min-height:52px; padding:10px 12px; border-radius:13px; border:1.5px solid ${T.line};
    background:${T.glassSoft}; color:#fff; font-size:14.5px; font-weight:700; text-align:left; line-height:1.35; transition:all .14s; }
  .fal-op i { flex-shrink:0; font-size:17px; color:${accent}; width:22px; text-align:center; }
  .fal-op:hover:not(:disabled) { border-color:${accent}; transform:translateY(-2px); }
  .fal-op[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); }
  .fal-op[data-real="true"] { border-color:${OK}; background:${OK}18; }
  .fal-op:disabled { cursor:default; }
  .fal-op:focus-visible, .fal-pto:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
  .fal-r span { overflow-wrap:anywhere; }
  .fal-retro { display:flex; flex-direction:column; gap:8px; align-items:flex-start; padding:13px 15px; border-radius:13px; font-size:14.5px; line-height:1.5; color:${T.text2};
    border:1.5px solid ${NO}66; background:${NO}10; }
  .fal-retro[data-ok="true"] { border-color:${OK}66; background:${OK}10; }
  .fal-retro strong { color:#fff; font-size:15px; }
  .fal-deltas { display:flex; flex-wrap:wrap; gap:8px; }
  .fal-delta { padding:4px 10px; border-radius:999px; border:1.5px solid ${T.line}; font-size:14px; font-weight:700; color:${T.text2}; background:${T.inset}; }
  .fal-sim { font-size:14px; color:${AVISO}; font-weight:700; }

  /* Identidad del tablero */
  .fal-bin { --tono:188; position:relative;
    background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
  .fal-bin:nth-of-type(6n+1) { --tono:188; }
  .fal-bin:nth-of-type(6n+2) { --tono:262; }
  .fal-bin:nth-of-type(6n+3) { --tono:44; }
  .fal-bin:nth-of-type(6n+4) { --tono:152; }
  .fal-bin:nth-of-type(6n+5) { --tono:330; }
  .fal-bin:nth-of-type(6n+6) { --tono:18; }
  .fal-bin::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
    background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
  .fal-bin[data-done="true"] { background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }
  @media (prefers-reduced-motion: reduce){ .fal-bin[data-shake="true"] { animation:none; } .fal-chip, .fal-chip:hover, .fal-chip[data-sel="true"], .fal-op:hover:not(:disabled) { transform:none; transition:none; } .fal-med-barra > span { transition:none; } }
`;

/* ═══════════════════════════════════════════════════════════════════════════
 * Paneles de cada modo (componentes hijos: reciben los manejadores como props,
 * así el linter no rastrea el acceso al ref de audio hasta el render del map).
 * ═══════════════════════════════════════════════════════════════════════════ */
type DropFactory = (onDrop: (id: string) => void) => {
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
};

function BinsFalacias({
  selFal,
  shakeFal,
  ubicFal,
  onMatch,
  dropProps,
}: {
  selFal: string | null;
  shakeFal: Falacia | null;
  ubicFal: Record<string, Falacia>;
  onMatch: (ejId: string, bin: Falacia) => void;
  dropProps: DropFactory;
}) {
  const bins: Falacia[] = ["ad-hominem", "hombre-paja", "pendiente", "autoridad", "dicotomia"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 12 }}>
      {bins.map((bin) => {
        const info = FALACIA_INFO[bin];
        const dentro = EJEMPLOS.filter((e) => ubicFal[e.id] === bin);
        return (
          <div
            key={bin}
            className="fal-bin"
            data-shake={shakeFal === bin}
            onClick={() => selFal && onMatch(selFal, bin)}
            style={{ position: "relative", isolation: "isolate" }}
            {...dropProps((id) => onMatch(id, bin))}
          >
            {/* La ilustración del concepto llenando la caja vacía. */}
            <FondoTermino termino={info.titulo} />
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
              <VinetaTermino termino={info.titulo} color={T.text2} icono={info.icono} tam={29} radio={8} />
              <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{info.titulo}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dentro.length === 0 ? (
                <div style={{ fontSize: 14, color: T.text3, opacity: 0.7, padding: "8px 0" }}>Arrastra aquí…</div>
              ) : (
                dentro.map((e) => (
                  <span key={e.id} style={{ animation: "falPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
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

function BinsValidez({
  selVal,
  shakeVal,
  ubicVal,
  onMatch,
  dropProps,
}: {
  selVal: string | null;
  shakeVal: Validez | null;
  ubicVal: Record<string, Validez>;
  onMatch: (argId: string, bin: Validez) => void;
  dropProps: DropFactory;
}) {
  const bins: Validez[] = ["valido", "invalido"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 12 }}>
      {bins.map((bin) => {
        const info = VALIDEZ_INFO[bin];
        const dentro = ARGUMENTOS.filter((a) => ubicVal[a.id] === bin);
        return (
          <div
            key={bin}
            className="fal-bin"
            data-shake={shakeVal === bin}
            onClick={() => selVal && onMatch(selVal, bin)}
            style={{ position: "relative", isolation: "isolate" }}
            {...dropProps((id) => onMatch(id, bin))}
          >
            {/* La ilustración del concepto llenando la caja vacía. */}
            <FondoTermino termino={info.titulo} />
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
              <VinetaTermino termino={info.titulo} color={bin === "valido" ? OK : NO} icono={info.icono} tam={29} radio={8} />
              <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{info.titulo}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dentro.length === 0 ? (
                <div style={{ fontSize: 14, color: T.text3, opacity: 0.7, padding: "8px 0" }}>Arrastra aquí…</div>
              ) : (
                dentro.map((a) => (
                  <span key={a.id} style={{ animation: "falPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 14, color: OK, marginTop: 2 }} />
                    {a.texto}
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
        <strong style={{ fontSize: 15, color: T.text }}>
          <i className="fa-solid fa-clipboard-question" style={{ marginRight: 8, color: accent }} />
          Comprueba lo aprendido
        </strong>
        {aprobado && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 14, fontWeight: 800, color: OK }}>
            <i className="fa-solid fa-circle-check" /> Aprobado
          </span>
        )}
      </div>
      <div style={{ fontSize: 14, color: T.text3, marginBottom: 18, lineHeight: 1.5 }}>
        Cinco afirmaciones sobre deducción, inducción, silogismos, tablas de verdad y falacias. Decide si son verdaderas o falsas y pulsa «Comprobar».
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))", gap: 9 }}>
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
                    <button key={oi} className="fal-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="fal-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="fal-btn" onClick={reintentar}>
            <i className="fa-solid fa-rotate-left" />
            Reintentar
          </button>
        )}
        {comprobado && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, borderRadius: 12, padding: "10px 16px", border: `1px solid ${aprobadoAhora ? OK : NO}55`, background: `${aprobadoAhora ? OK : NO}14`, fontSize: 14.5, fontWeight: 800, color: aprobadoAhora ? OK : NO }}>
            <i className={`fa-solid ${aprobadoAhora ? "fa-trophy" : "fa-circle-half-stroke"}`} />
            {aciertos} / {total} correctas
            {!aprobadoAhora && <span style={{ color: T.text3, fontWeight: 600 }}>· revisa las marcadas e inténtalo de nuevo</span>}
          </div>
        )}
      </div>
    </div>
  );
}
