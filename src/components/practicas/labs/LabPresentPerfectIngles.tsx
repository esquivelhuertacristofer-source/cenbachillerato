"use client";

/**
 * Laboratorio — Sharing experiences: present perfect for life events
 * Práctica experimental para IN-V-P02-A4 (Inglés V).
 *
 * EXPERIMENTO CENTRAL: una conversación ramificada con Sam, un estudiante de
 * intercambio (ficticio). Sam pregunta por tus experiencias: si respondes con
 * present perfect (have/has + participio; ever, never, already, yet, for,
 * since) la pregunta siguiente cambia según tu camino y el mapa de
 * experiencias se llena; si cuentas CUÁNDO pasó, toca past simple. Una forma o
 * un tiempo equivocado («I have gone yesterday») confunde a Sam y se explica la
 * regla en español.
 *
 * Modos: conversación · present perfect or past simple? · complete the
 * paragraph · match the structure · complete the text. Cuestionario V/F en
 * «Reto». Contenido curricular VERBATIM de IN-V·P02 (en la pestaña «Teoría»).
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { PRESENT_PERFECT_INGLES_HUECOS } from "./present-perfect-ingles-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { LabShell, Bloque, BotonHerramienta, Mesa } from "./_shell";
import { PRESENT_PERFECT_INGLES_FICHA } from "./present-perfect-ingles-ficha";
import {
  CASOS,
  TIEMPO_INFO,
  HUECOS,
  DISTRACTORES_HUECO,
  PARES,
  QUIZ,
  DATO_PRESENT_PERFECT,
  type Tiempo,
} from "./present-perfect-ingles-data";
import {
  estadoInicial,
  turnoActual,
  responder,
  conversacionCompleta,
  temasCompletos,
  mapa,
  TEMAS,
  type CarrilMapa,
  type Mensaje,
} from "./present-perfect-ingles-sim";

const NO = "#FF5E5E";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { FondoTermino, VinetaTermino } from "./_vineta";
const RETO_KEY = "cen-present-perfect-reto";
const RUTA_SIM = "/media/labs-sim/present-perfect-ingles";

type Modo = "conversacion" | "clasificar" | "parrafo" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "conversacion", label: "Chat with Sam", icono: "fa-comments" },
  { id: "clasificar", label: "Present perfect or past simple?", icono: "fa-table-columns" },
  { id: "parrafo", label: "Complete the paragraph", icono: "fa-pen-fancy" },
  { id: "glosario", label: "Match the structure", icono: "fa-book-open" },
  { id: "texto", label: "Complete the text", icono: "fa-pen-to-square" },
];

/** Fichas del modo «parrafo»: formas correctas + distractores. */
const FICHAS_PARRAFO: { id: string; label: string }[] = [
  ...HUECOS.map((h) => ({ id: h.id, label: h.resp })),
  ...DISTRACTORES_HUECO.map((d, i) => ({ id: `xd-${i}`, label: d })),
];

/** Foto de escena con respaldo: gradiente + ícono detrás; si la imagen falta, se oculta. */
function FotoSim({ clave, icono, redonda }: { clave: string; icono: string; redonda?: boolean }) {
  const [fallo, setFallo] = useState(false);
  return (
    <span className="ppf-foto" data-redonda={redonda ?? false} aria-hidden>
      <i className={`fa-solid ${icono}`} />
      {!fallo && <img src={`${RUTA_SIM}/${clave}.webp`} alt="" loading="lazy" onError={() => setFallo(true)} />}
    </span>
  );
}

const TXT_LANE: Record<CarrilMapa["estado"], string> = {
  vacio: "Todavía sin responder",
  vive: "have + participio · experiencia sin fecha",
  nunca: "never / not yet · aún no ha pasado",
  "vive-fechado": "past simple · momento concreto",
  "nunca-duracion": "have + participio · for / since",
};

/** Mapa de experiencias: una línea de tiempo por tema que se llena con tus respuestas. */
function MapaExperiencias({ carriles }: { carriles: CarrilMapa[] }) {
  return (
    <div className="ppf-mapa" aria-label="Mapa de experiencias">
      <div className="ppf-mapa-eje"><span>pasado</span><span>hoy</span></div>
      {carriles.map((c) => (
        <div key={c.id} className="ppf-lane" data-estado={c.estado}>
          <span className="ppf-lane-lugar"><i className={`fa-solid ${c.icono}`} aria-hidden />{c.lugar}</span>
          <div className="ppf-track">
            {(c.estado === "vive" || c.estado === "vive-fechado") && <div className="ppf-barra-pp" />}
            {c.estado === "vive-fechado" && c.pos !== undefined && <div className="ppf-punto" style={{ left: `${c.pos * 100}%` }} />}
            {c.estado === "nunca" && <span className="ppf-nunca"><i className="fa-solid fa-xmark" aria-hidden /> never</span>}
            {c.estado === "nunca-duracion" && c.pos !== undefined && (
              <div className="ppf-duracion" style={{ left: `${c.pos * 100}%`, right: 0 }} />
            )}
          </div>
          <span className="ppf-lane-nota">
            {TXT_LANE[c.estado]}
            {c.cuando ? <strong> · {c.cuando}</strong> : null}
          </span>
        </div>
      ))}
    </div>
  );
}

function Burbuja({ m }: { m: Mensaje }) {
  return (
    <div className="ppf-burbuja" data-de={m.de} data-estado={m.estado ?? "ok"}>
      {m.texto}
    </div>
  );
}

export function LabPresentPerfectIngles({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("conversacion");

  // ── conversación con Sam ───────────────────────────────────────────────
  const [conv, setConv] = useState(estadoInicial);
  const [provocoConfusion, setProvocoConfusion] = useState(false);
  const [mapaLleno, setMapaLleno] = useState(false);
  const turno = turnoActual(conv);
  const carriles = mapa(conv);
  const elegirRespuesta = (id: string) => {
    const sig = responder(conv, id);
    if (sig === conv) return;
    setConv(sig);
    if (sig.errores > conv.errores) {
      setProvocoConfusion(true);
      sfxNo();
    } else {
      sfxPlace();
      if (conversacionCompleta(sig)) {
        setMapaLleno(true);
        sfxOk();
      }
    }
  };

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

  // ── modo Present perfect or past simple? (clasifica por tiempo) ─────────
  const [ubicado, setUbicado] = useState<Record<string, Tiempo>>({});
  const [selCaso, setSelCaso] = useState<string | null>(null);
  const [shakeBin, setShakeBin] = useState<Tiempo | null>(null);
  const casosLibres = CASOS.filter((c) => !ubicado[c.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarClasificar = (casoId: string, bin: Tiempo) => {
    if (ubicado[casoId]) return;
    const c = CASOS.find((x) => x.id === casoId);
    if (c && c.tiempo === bin) {
      setUbicado((e) => ({ ...e, [casoId]: bin }));
      setSelCaso(null);
      sfxPlace();
      if (Object.keys(ubicado).length + 1 >= CASOS.length) {
        sfxOk();
        persistMejor(true, parrafoDone, glosarioDone);
      }
    } else {
      setShakeBin(bin);
      sfxNo();
      window.setTimeout(() => setShakeBin(null), 420);
    }
  };
  const resetClasificar = () => {
    setUbicado({});
    setSelCaso(null);
  };

  // ── modo Complete the paragraph (arrastra al hueco) ────────────────────
  const [completado, setCompletado] = useState<Record<string, boolean>>({});
  const [selFicha, setSelFicha] = useState<string | null>(null);
  const [shakeHueco, setShakeHueco] = useState<string | null>(null);
  const fichasLibres = FICHAS_PARRAFO.filter((f) => !completado[f.id]).slice().sort((a, b) => a.label.localeCompare(b.label, "es"));

  const intentarParrafo = (chipId: string, rowId: string) => {
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
  const resetParrafo = () => {
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
        persistMejor(clasificarDone, parrafoDone, true);
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
  const clasificarDone = Object.keys(ubicado).length >= CASOS.length;
  const parrafoDone = Object.keys(completado).length >= HUECOS.length;
  const glosarioDone = Object.keys(empGlos).length >= PARES.length;
  const modosHechos = (clasificarDone ? 1 : 0) + (parrafoDone ? 1 : 0) + (glosarioDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los 3 modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 4);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);

  const persistMejor = (a: boolean, b: boolean, c: boolean) => {
    const est = (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0);
    registraEstrellas(est);
  };

  const objetivos = [
    { txt: "Responde mal a propósito y lee por qué Sam se confunde", done: provocoConfusion },
    { txt: "Completa el mapa: las 3 experiencias de Sam con su momento", done: mapaLleno },
    { txt: "Clasifica las 10 oraciones en present perfect / past simple", done: clasificarDone },
    { txt: "Completa los 6 huecos del párrafo en contexto", done: parrafoDone },
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
  const resetConversacion = () => setConv(estadoInicial());
  const resetActual = modo === "conversacion" ? resetConversacion : modo === "texto" ? resetTexto : modo === "clasificar" ? resetClasificar : modo === "parrafo" ? resetParrafo : resetGlosario;

  const lectura =
    modo === "conversacion"
      ? `Sam: ${temasCompletos(conv)} de ${TEMAS.length} experiencias · ${conv.errores} confusiones`
      : modo === "clasificar"
        ? `${Object.keys(ubicado).length} de ${CASOS.length} oraciones clasificadas`
        : modo === "parrafo"
          ? `${Object.keys(completado).length} de ${HUECOS.length} huecos completos`
          : modo === "glosario"
            ? `${Object.keys(empGlos).length} de ${PARES.length} estructuras emparejadas`
            : undefined;

  const pista =
    modo === "conversacion" ? (
      <>Si cuentas que algo <strong style={{ color: T.text }}>ha pasado</strong> (sin fecha) usa <strong style={{ color: T.text }}>have/has + participio</strong>; si dices <strong style={{ color: T.text }}>cuándo</strong>, usa <strong style={{ color: T.text }}>past simple</strong>. Con <strong style={{ color: T.text }}>since</strong> y <strong style={{ color: T.text }}>for</strong>, present perfect.</>
    ) : modo === "clasificar" ? (
      <>El <strong style={{ color: T.text }}>present perfect</strong> (have/has + participio) describe experiencias sin tiempo concreto y va con <strong style={{ color: T.text }}>since</strong> y <strong style={{ color: T.text }}>always</strong>. El <strong style={{ color: T.text }}>past simple</strong> pide un momento específico (last year, when I was…).</>
    ) : modo === "parrafo" ? (
      <>Con <strong style={{ color: T.text }}>since then</strong> y <strong style={{ color: T.text }}>always</strong> usa <strong style={{ color: T.text }}>have + participio</strong>; con <strong style={{ color: T.text }}>last year</strong> usa past simple; tras <strong style={{ color: T.text }}>going to</strong> va el verbo base.</>
    ) : modo === "glosario" ? (
      <>Lee la definición y su ejemplo; luego suelta la estructura que le corresponde para narrar tu experiencia.</>
    ) : (
      <>Completa cada hueco con la palabra que falta en el texto.</>
    );

  const ultimo = conv.ultimo;

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
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <style>{css(accent, color.rgba)}</style>

          {/* MODO — conversación con Sam */}
          {modo === "conversacion" && (
            <div className="ppf-sim">
              <MapaExperiencias carriles={carriles} />

              <div className="ppf-chat-cols">
                <div className="ppf-chat">
                  <div className="ppf-sam">
                    <FotoSim clave="sam" icono="fa-user-graduate" redonda />
                    <div>
                      <strong>Sam</strong>
                      <small>Estudiante de intercambio (personaje ficticio)</small>
                    </div>
                    {turno && <FotoSim clave={turno.tema.foto} icono={turno.tema.icono} />}
                  </div>
                  <div className="ppf-log" aria-live="polite">
                    {conv.log.slice(-8).map((m) => (
                      <Burbuja key={m.id} m={m} />
                    ))}
                  </div>
                </div>

                <div className="ppf-respuestas">
                  {turno ? (
                    <>
                      <div className="ppf-ceja">Tu respuesta</div>
                      {turno.turno.opciones.map((o) => {
                        const fallada = conv.fallos.includes(o.id);
                        return (
                          <button key={o.id} type="button" className="ppf-resp" data-fallada={fallada} disabled={fallada} onClick={() => elegirRespuesta(o.id)}>
                            {o.texto}
                          </button>
                        );
                      })}
                    </>
                  ) : (
                    <div className="ppf-fin">
                      <i className="fa-solid fa-circle-check" aria-hidden /> ¡Conversación completa! Tu mapa muestra experiencias sin fecha (have + participio) y momentos concretos (past simple).
                    </div>
                  )}

                  {ultimo && (
                    <div className="ppf-regla" data-ok={ultimo.tipo === "ok"}>
                      <i className={`fa-solid ${ultimo.tipo === "ok" ? "fa-circle-check" : "fa-circle-question"}`} aria-hidden />
                      <span>
                        <strong>{ultimo.tipo === "ok" ? "Sam entendió." : "Sam se confundió."}</strong> {ultimo.porque}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* MODO — completa el texto (fill_blanks verbatim de la progresión) */}
          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={PRESENT_PERFECT_INGLES_HUECOS}
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
                  <Eyebrow>Arrastra cada oración a su tiempo verbal</Eyebrow>
                  <span style={{ fontSize: 14, fontWeight: 800, color: clasificarDone ? OK : T.text3 }}>
                    {Object.keys(ubicado).length}/{CASOS.length}
                  </span>
                </div>
                {casosLibres.length === 0 ? (
                  <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Clasificaste las {CASOS.length} oraciones!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {casosLibres.map((c) => (
                      <button key={c.id} className="ppf-chip" data-sel={selCaso === c.id} onClick={() => setSelCaso((s) => (s === c.id ? null : c.id))} {...dragProps(c.id)}>
                        {c.texto}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <BinsClasificar selCaso={selCaso} shakeBin={shakeBin} ubicado={ubicado} onMatch={intentarClasificar} dropProps={dropProps} />
            </Mesa>
          )}

          {modo === "parrafo" && (
            <Mesa>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra la forma correcta a cada hueco</Eyebrow>
                  <span style={{ fontSize: 14, fontWeight: 800, color: parrafoDone ? OK : T.text3 }}>
                    {Object.keys(completado).length}/{HUECOS.length}
                  </span>
                </div>
                <div style={{ fontSize: 14, color: T.text3, marginBottom: 14, lineHeight: 1.5 }}>
                  Cuidado: hay formas <strong style={{ color: T.text2 }}>incorrectas</strong> (has, took, taked, developed) que no encajan en ningún hueco.
                </div>
                {fichasLibres.length === 0 ? (
                  <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Completaste los {HUECOS.length} huecos!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {fichasLibres.map((f) => (
                      <button key={f.id} className="ppf-chip-sm" data-sel={selFicha === f.id} onClick={() => setSelFicha((s) => (s === f.id ? null : f.id))} {...dragProps(f.id)}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <RowsParrafo selFicha={selFicha} shakeHueco={shakeHueco} completado={completado} onMatch={intentarParrafo} dropProps={dropProps} />
            </Mesa>
          )}

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
                      <button key={g.id} className="ppf-chip" data-sel={selGlos === g.id} onClick={() => setSelGlos((s) => (s === g.id ? null : g.id))} {...dragProps(g.id)}>
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
                <p style={{ margin: 0, color: T.text2 }}>
                  Conversación con Sam: {temasCompletos(conv)} de {TEMAS.length} experiencias · {conv.errores} {conv.errores === 1 ? "confusión" : "confusiones"}.
                </p>
              </Bloque>
              <Bloque titulo="Pista" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>{pista}</p>
              </Bloque>
              {ultimo && modo === "conversacion" && (
                <Bloque titulo="Última regla" icono="fa-circle-question">
                  <p style={{ margin: 0, color: T.text2 }}>{ultimo.porque}</p>
                </Bloque>
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
              {(Object.keys(TIEMPO_INFO) as Tiempo[]).map((t) => (
                <Bloque key={t} titulo={TIEMPO_INFO[t].titulo} icono={TIEMPO_INFO[t].icono}>
                  <p style={{ margin: 0, color: T.text2 }}>
                    {TIEMPO_INFO[t].subtitulo} <em>{TIEMPO_INFO[t].ejemplo}</em>
                  </p>
                </Bloque>
              ))}
              <Bloque titulo="Estructuras para narrar experiencias" icono="fa-book-open">
                {PARES.map((g) => (
                  <p key={g.id} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{g.termino}</strong> {g.definicion} <em>{g.ejemplo}</em>
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Dato" icono="fa-circle-info">
                <p style={{ margin: 0, color: T.text2 }}>{DATO_PRESENT_PERFECT}</p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={PRESENT_PERFECT_INGLES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

const css = (accent: string, rgba: string) => `
        @keyframes ppfShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes ppfPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .ppf-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:14px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:700; transition:all .14s; user-select:none; max-width:360px; text-align:left; line-height:1.4; }
        .ppf-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
        .ppf-chip[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
        .ppf-chip:active { cursor:grabbing; }
        .ppf-chip-sm { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:999px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:800; transition:all .14s; user-select:none; }
        .ppf-chip-sm:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
        .ppf-chip-sm[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
        .ppf-chip-sm:active { cursor:grabbing; }
        .ppf-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; transition:all .16s; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
        .ppf-row[data-shake="true"] { animation:ppfShake .4s; border-color:${NO}; }
        .ppf-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
        .ppf-slot { flex-shrink:0; min-width:96px; min-height:42px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
          display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:14px; transition:all .16s; cursor:pointer; padding:4px 10px; }
        .ppf-slot[data-armed="true"] { border-color:${accent}; background:rgba(${rgba},0.1); }
        .ppf-bin { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; transition:all .16s; min-height:240px; }
        .ppf-bin[data-shake="true"] { animation:ppfShake .4s; border-color:${NO}; }
        .ppf-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
        .ppf-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
        .ppf-q:disabled{ cursor:default; }
        .ppf-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; }
        .ppf-btn:hover { border-color:${T.lineStrong}; }
        .ppf-divider { height:1px; background:${T.line}; margin:18px 0; }
        @media (prefers-reduced-motion: reduce){ .ppf-row[data-shake="true"], .ppf-bin[data-shake="true"] { animation:none; } }

        /* Conversación con Sam */
        .ppf-sim { display:flex; flex-direction:column; gap:14px; min-width:0; }
        .ppf-ceja { font-size:14px; font-weight:900; letter-spacing:.1em; text-transform:uppercase; color:${T.text3}; }
        .ppf-foto { position:relative; display:flex; align-items:center; justify-content:center; width:100%; aspect-ratio:16/10; overflow:hidden; border-radius:10px;
          background:linear-gradient(135deg, rgba(${rgba},0.35) 0%, rgba(8,19,31,0.9) 100%); color:rgba(255,255,255,0.55); font-size:22px; }
        .ppf-foto[data-redonda="true"] { aspect-ratio:1/1; border-radius:50%; }
        .ppf-foto img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
        .ppf-mapa { display:flex; flex-direction:column; gap:8px; padding:12px 14px; border-radius:14px; border:1px solid ${T.line}; background:${T.glass}; }
        .ppf-mapa-eje { display:flex; justify-content:space-between; font-size:14px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; color:${T.text3}; }
        .ppf-lane { display:grid; grid-template-columns:minmax(0,110px) minmax(0,1fr); gap:4px 12px; align-items:center; }
        .ppf-lane-lugar { font-size:14px; font-weight:800; color:#fff; display:flex; align-items:center; gap:7px; }
        .ppf-lane-lugar i { color:${accent}; }
        .ppf-track { position:relative; height:26px; border-radius:99px; border:1.5px dashed ${T.lineStrong}; background:${T.inset}; overflow:hidden; }
        .ppf-lane[data-estado="vive"] .ppf-track, .ppf-lane[data-estado="vive-fechado"] .ppf-track { border-style:solid; border-color:#4FC3F7; }
        .ppf-lane[data-estado="nunca"] .ppf-track { border-color:rgba(255,255,255,0.3); }
        .ppf-lane[data-estado="nunca-duracion"] .ppf-track { border-style:solid; border-color:#FFB74D; }
        .ppf-barra-pp { position:absolute; inset:0; background:linear-gradient(90deg, rgba(79,195,247,0.04), rgba(79,195,247,0.45)); animation:ppfPop .3s ease; }
        .ppf-punto { position:absolute; top:50%; width:16px; height:16px; margin:-8px 0 0 -8px; border-radius:50%; background:${OK}; border:3px solid #04121f; animation:ppfPop .3s ease; }
        .ppf-duracion { position:absolute; top:0; bottom:0; background:linear-gradient(90deg, rgba(255,183,77,0.7), rgba(255,183,77,0.25)); animation:ppfPop .3s ease; }
        .ppf-nunca { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; gap:6px; font-size:14px; font-weight:800; color:${T.text2}; }
        .ppf-lane-nota { grid-column:2; font-size:14px; color:${T.text2}; line-height:1.35; }
        .ppf-lane-nota strong { color:#fff; }
        .ppf-chat-cols { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 300px), 1fr)); gap:16px; align-items:start; }
        .ppf-chat { display:flex; flex-direction:column; gap:10px; min-width:0; }
        .ppf-sam { display:grid; grid-template-columns:48px minmax(0,1fr) minmax(0,110px); gap:10px; align-items:center; font-size:15px; }
        .ppf-sam small { display:block; font-size:14px; color:${T.text3}; line-height:1.3; }
        .ppf-log { display:flex; flex-direction:column; gap:8px; }
        .ppf-burbuja { max-width:92%; padding:10px 14px; border-radius:16px; font-size:15px; line-height:1.4; border:1px solid ${T.line}; animation:ppfPop .25s ease; }
        .ppf-burbuja[data-de="sam"] { align-self:flex-start; background:${T.glassSoft}; color:#fff; border-bottom-left-radius:4px; }
        .ppf-burbuja[data-de="tu"] { align-self:flex-end; background:rgba(${rgba},0.22); color:#fff; border-color:rgba(${rgba},0.5); border-bottom-right-radius:4px; }
        .ppf-burbuja[data-estado="confuso"] { border-color:${NO}88; }
        .ppf-burbuja[data-de="sam"][data-estado="confuso"] { background:${NO}1a; }
        .ppf-respuestas { display:flex; flex-direction:column; gap:8px; min-width:0; }
        .ppf-resp { cursor:pointer; padding:11px 14px; border-radius:12px; text-align:left; color:#fff; font-size:15px; font-weight:700; line-height:1.35;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; transition:all .14s; }
        .ppf-resp:hover:not(:disabled) { border-color:${accent}; background:rgba(${rgba},0.16); }
        .ppf-resp[data-fallada="true"] { border-color:${NO}88; background:${NO}12; color:${T.text3}; text-decoration:line-through; cursor:default; }
        .ppf-regla { display:flex; gap:10px; align-items:flex-start; padding:10px 12px; border-radius:12px; font-size:14px; line-height:1.45; color:${T.text2};
          border:1px solid ${NO}66; background:${NO}12; }
        .ppf-regla[data-ok="true"] { border-color:${OK}66; background:${OK}12; }
        .ppf-regla i { margin-top:3px; color:${NO}; }
        .ppf-regla[data-ok="true"] i { color:${OK}; }
        .ppf-regla strong { color:#fff; }
        .ppf-fin { display:flex; gap:10px; padding:12px 14px; border-radius:12px; font-size:15px; font-weight:700; color:${OK}; border:1px solid ${OK}66; background:${OK}12; }
        @media (prefers-reduced-motion: reduce){ .ppf-burbuja, .ppf-barra-pp, .ppf-punto, .ppf-duracion { animation:none; } }

        /* Identidad del tablero */
        .ppf-bin, .ppf-row { --tono:188; position:relative;
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
        .ppf-bin:nth-of-type(6n+1), .ppf-row:nth-of-type(6n+1) { --tono:188; }
        .ppf-bin:nth-of-type(6n+2), .ppf-row:nth-of-type(6n+2) { --tono:262; }
        .ppf-bin:nth-of-type(6n+3), .ppf-row:nth-of-type(6n+3) { --tono:44; }
        .ppf-bin:nth-of-type(6n+4), .ppf-row:nth-of-type(6n+4) { --tono:152; }
        .ppf-bin:nth-of-type(6n+5), .ppf-row:nth-of-type(6n+5) { --tono:330; }
        .ppf-bin:nth-of-type(6n+6), .ppf-row:nth-of-type(6n+6) { --tono:18; }
        .ppf-bin::before, .ppf-row::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
          background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
        .ppf-bin[data-done="true"], .ppf-row[data-done="true"] {
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }
        .ppf-chip { transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
        .ppf-chip:hover { transform:translateY(-2px); }
        .ppf-chip[data-sel="true"] { transform:translateY(-3px) scale(1.02); }
        @media (prefers-reduced-motion: reduce){
          .ppf-chip, .ppf-chip:hover, .ppf-chip[data-sel="true"] { transform:none; transition:none; }
        }
`;

/* ═══════════════════════════════════════════════════════════════════════════
 * Paneles de cada modo (componentes hijos: reciben los manejadores como props,
 * así el linter no rastrea el acceso al ref de audio hasta el render del map).
 * ═══════════════════════════════════════════════════════════════════════════ */
type DropFactory = (onDrop: (id: string) => void) => {
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
};

function BinsClasificar({
  selCaso,
  shakeBin,
  ubicado,
  onMatch,
  dropProps,
}: {
  selCaso: string | null;
  shakeBin: Tiempo | null;
  ubicado: Record<string, Tiempo>;
  onMatch: (casoId: string, bin: Tiempo) => void;
  dropProps: DropFactory;
}) {
  const bins: Tiempo[] = ["present_perfect", "past_simple"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      {bins.map((bin) => {
        const info = TIEMPO_INFO[bin];
        const dentro = CASOS.filter((c) => ubicado[c.id] === bin);
        return (
          <div
            key={bin}
            className="ppf-bin"
            data-shake={shakeBin === bin}
            onClick={() => selCaso && onMatch(selCaso, bin)}
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
                dentro.map((c) => (
                  <span key={c.id} style={{ animation: "ppfPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 14, color: OK, marginTop: 3 }} />
                    {c.texto}
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

function RowsParrafo({
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
            className="ppf-row"
            data-shake={shakeHueco === h.id}
            data-done={done}
            onClick={() => !done && selFicha && onMatch(selFicha, h.id)}
            {...dropProps((id) => onMatch(id, h.id))}
          >
            <div style={{ fontSize: 14.5, color: done ? "#fff" : T.text2, lineHeight: 1.6, display: "inline-flex", alignItems: "center", gap: 7, flexWrap: "wrap", flex: 1, minWidth: 0 }}>
              <span>{h.antes}</span>
              {done ? (
                <span style={{ animation: "ppfPop .25s ease", fontWeight: 900, color: OK }}>{h.resp}</span>
              ) : (
                <span className="ppf-slot" data-armed={!!selFicha} style={{ minWidth: 96 }}>
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
            className="ppf-row"
            data-shake={shakeGlos === g.id}
            data-done={done}
            onClick={() => !done && selGlos && onMatch(selGlos, g.id)}
            {...dropProps((id) => onMatch(id, g.id))}
          >
            <div className="ppf-slot" data-armed={!done && !!selGlos} style={{ minWidth: 200, ...(done ? { borderStyle: "solid", borderColor: OK, background: `${OK}1a` } : {}) }}>
              {done ? (
                <span style={{ animation: "ppfPop .25s ease", fontSize: 14, fontWeight: 900, color: "#fff", display: "inline-flex", alignItems: "center", gap: 7, lineHeight: 1.35 }}>
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
        Cinco afirmaciones sobre el present perfect y el past simple para compartir experiencias. Decide si son verdaderas o falsas y pulsa «Comprobar».
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
                    <button key={oi} className="ppf-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="ppf-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="ppf-btn" onClick={reintentar}>
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
