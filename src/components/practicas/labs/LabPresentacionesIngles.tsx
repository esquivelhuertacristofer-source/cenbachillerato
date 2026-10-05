"use client";

/**
 * Laboratorio — English Lab: Greetings & introductions.
 * Práctica experimental para IN-I-P01-A2 (Inglés I · presentaciones).
 *
 * «Club day» es el simulador: una situación social ramificada. Ana (el alumno)
 * llega al club de inglés y elige qué decir para saludar, presentarse, presentar a
 * un amigo y despedirse. Cada frase cambia la reacción ilustrada de los
 * personajes (contenta, normal, confundida), la línea del siguiente personaje y el
 * medidor de amistad. Personajes ficticios; el puntaje es una simulación.
 * Modos extra de repaso:
 *  · «Build the sentence»: ordena las palabras de cada oración.
 *  · «The verb to be»: sujeto → am / is / are.
 *  · «Greeting or farewell?»: frase → saludo / presentación / despedida.
 *  · «Complete the text» (huecos de la progresión).
 *  + Reto «Check your English» (pestaña «Reto»); la teoría vive en «Teoría».
 *
 * DOM puro (sin three.js). Contenido VERBATIM de las actividades A1/A2/A4/A6 de IN-I·P01.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabShell, Bloque, BotonHerramienta, Mesa, Dato } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { PRESENTACIONES_INGLES_HUECOS } from "./presentaciones-ingles-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { PRESENTACIONES_INGLES_FICHA } from "./presentaciones-ingles-ficha";
import {
  ORACIONES,
  SUJETOS,
  TOBE_INFO,
  FRASES,
  FUNCION_INFO,
  QUIZ,
  DATO_INGLES,
  type ToBe,
  type Funcion,
} from "./ingles-presentaciones-data";
import {
  NODOS,
  PERSONAJES,
  ANIMO_INFO,
  ESCENAS,
  PUNTOS_MAX,
  animosDe,
  finalDe,
  type Animo,
  type NodoSim,
  type PersonajeId,
} from "./presentaciones-ingles-sim";

const NO = "#FF5E5E";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
const RETO_KEY = "cen-ingles-presentaciones-reto";
const RUTA_FOTOS = "/media/labs-sim/presentaciones-ingles";

type Modo = "club" | "construir" | "tobe" | "funciones" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "club", label: "Club day", icono: "fa-people-group" },
  { id: "construir", label: "Build the sentence", icono: "fa-quote-right" },
  { id: "tobe", label: "The verb to be", icono: "fa-equals" },
  { id: "funciones", label: "Greeting or farewell?", icono: "fa-comments" },
  { id: "texto", label: "Complete the text", icono: "fa-pen-to-square" },
];

const porTexto = (a: { texto: string }, b: { texto: string }) => a.texto.localeCompare(b.texto, "en");

export function LabPresentacionesIngles({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("club");

  // ── sonido ────────────────────────────────────────────────────────────
  const partida = usePartida();
  const [sonido, setSonido] = useState(false);
  // Modo «Completa el texto». El contador sirve de `key`: subirlo remonta
  // el componente y devuelve todos los huecos en blanco.
  const [textoDone, setTextoDone] = useState(false);
  const [textoIntento, setTextoIntento] = useState(0);
  const resetHuecos = () => {
    setTextoDone(false);
    setTextoIntento((v) => v + 1);
  };
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
  const sfxBlip = () => sonido && audioRef.current?.blip();

  // ── simulador: Club day ───────────────────────────────────────────────
  const [nodoIdx, setNodoIdx] = useState(0);
  const [resp, setResp] = useState<Record<string, string>>({});
  const [reaccion, setReaccion] = useState(false);
  const [simFin, setSimFin] = useState(false);
  const [simBest, setSimBest] = useState(0);
  const enFinal = nodoIdx >= NODOS.length;
  const nodo: NodoSim = NODOS[Math.min(nodoIdx, NODOS.length - 1)]!;
  const ptsPorNodo: Record<string, number> = {};
  for (const n of NODOS) {
    const op = n.opciones.find((o) => o.id === resp[n.id]);
    if (op) ptsPorNodo[n.id] = op.puntos;
  }
  const totalPts = Object.values(ptsPorNodo).reduce((a, b) => a + b, 0);
  const simDone = simBest >= 11;

  const elegirOpcion = (opId: string) => {
    if (reaccion || enFinal) return;
    const op = nodo.opciones.find((o) => o.id === opId);
    if (!op) return;
    setResp((r) => ({ ...r, [nodo.id]: opId }));
    setReaccion(true);
    if (op.puntos === 2) sfxPlace();
    else if (op.puntos === 0) sfxNo();
    else sfxBlip();
  };
  const siguienteNodo = () => {
    if (!reaccion) return;
    setReaccion(false);
    if (nodoIdx + 1 >= NODOS.length) {
      setNodoIdx(NODOS.length);
      setSimFin(true);
      if (totalPts > simBest) setSimBest(totalPts);
      if (totalPts >= 11) {
        sfxOk();
        persistMejor(armarDone, tobeDone, funcionesDone, true);
      }
    } else {
      setNodoIdx((i) => i + 1);
    }
  };
  const resetClub = () => {
    setNodoIdx(0);
    setResp({});
    setReaccion(false);
  };

  // ── modo Construir (ordenar palabras) ─────────────────────────────────
  const [oraIdx, setOraIdx] = useState(0);
  const [colocadas, setColocadas] = useState<Record<string, number[]>>({});
  const [armadas, setArmadas] = useState<Set<string>>(() => new Set<string>());
  const [selWord, setSelWord] = useState<number | null>(null);
  const [shakeWord, setShakeWord] = useState(false);

  const oracion = ORACIONES[oraIdx]!;
  const placed = colocadas[oracion.id] ?? [];
  const libresIdx = oracion.palabras
    .map((palabra, idx) => ({ palabra, idx }))
    .filter((w) => !placed.includes(w.idx))
    .sort((a, b) => a.palabra.localeCompare(b.palabra, "en"));

  const intentarPalabra = (idx: number) => {
    if (placed.includes(idx)) return;
    const nextPos = placed.length;
    if (oracion.palabras[idx] === oracion.palabras[nextPos]) {
      const nuevo = [...placed, idx];
      setColocadas((c) => ({ ...c, [oracion.id]: nuevo }));
      setSelWord(null);
      sfxPlace();
      if (nuevo.length >= oracion.palabras.length) {
        const nuevasArmadas = new Set(armadas).add(oracion.id);
        setArmadas(nuevasArmadas);
        sfxOk();
        persistMejor(nuevasArmadas.size >= ORACIONES.length, tobeDone, funcionesDone, simDone);
      }
    } else {
      setShakeWord(true);
      sfxNo();
      window.setTimeout(() => setShakeWord(false), 420);
    }
  };
  const resetOracion = () => {
    setColocadas((c) => ({ ...c, [oracion.id]: [] }));
    setSelWord(null);
  };

  // ── modo To be (sujeto → am/is/are) ───────────────────────────────────
  const [ubicSuj, setUbicSuj] = useState<Record<string, ToBe>>({});
  const [selSuj, setSelSuj] = useState<string | null>(null);
  const [shakeBe, setShakeBe] = useState<ToBe | null>(null);
  const sujLibres = SUJETOS.filter((s) => !ubicSuj[s.id]);

  const intentarBe = (sujId: string, forma: ToBe) => {
    const s = SUJETOS.find((x) => x.id === sujId);
    if (!s || ubicSuj[sujId]) return;
    if (s.forma === forma) {
      setUbicSuj((u) => ({ ...u, [sujId]: forma }));
      setSelSuj(null);
      sfxPlace();
      if (Object.keys(ubicSuj).length + 1 >= SUJETOS.length) {
        sfxOk();
        persistMejor(armarDone, true, funcionesDone, simDone);
      }
    } else {
      setShakeBe(forma);
      sfxNo();
      window.setTimeout(() => setShakeBe(null), 420);
    }
  };
  const resetBe = () => {
    setUbicSuj({});
    setSelSuj(null);
  };

  // ── modo Funciones (frase → greeting/introduction/farewell) ───────────
  const [ubicFra, setUbicFra] = useState<Record<string, Funcion>>({});
  const [selFra, setSelFra] = useState<string | null>(null);
  const [shakeFun, setShakeFun] = useState<Funcion | null>(null);
  const fraLibres = FRASES.filter((f) => !ubicFra[f.id]).slice().sort(porTexto);

  const intentarFuncion = (fraId: string, fun: Funcion) => {
    const f = FRASES.find((x) => x.id === fraId);
    if (!f || ubicFra[fraId]) return;
    if (f.funcion === fun) {
      setUbicFra((u) => ({ ...u, [fraId]: fun }));
      setSelFra(null);
      sfxPlace();
      if (Object.keys(ubicFra).length + 1 >= FRASES.length) {
        sfxOk();
        persistMejor(armarDone, tobeDone, true, simDone);
      }
    } else {
      setShakeFun(fun);
      sfxNo();
      window.setTimeout(() => setShakeFun(null), 420);
    }
  };
  const resetFunciones = () => {
    setUbicFra({});
    setSelFra(null);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso / estrellas ──────────────────────────────────────────────
  const armarDone = armadas.size >= ORACIONES.length;
  const tobeDone = Object.keys(ubicSuj).length >= SUJETOS.length;
  const funcionesDone = Object.keys(ubicFra).length >= FRASES.length;
  const modosHechos = (simDone ? 1 : 0) + (armarDone ? 1 : 0) + (tobeDone ? 1 : 0) + (funcionesDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 5);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);

  // Persiste la mejor marca al completar un modo (en el handler, no en un efecto).
  const persistMejor = (a: boolean, t: boolean, f: boolean, s: boolean) => {
    const est = (a ? 1 : 0) + (t ? 1 : 0) + (f ? 1 : 0) + (s ? 1 : 0);
    registraEstrellas(Math.min(3, est));
  };

  const objetivos = [
    { txt: "Termina el día en el club: saluda, preséntate y despídete", done: simFin },
    { txt: "Logra «Great first day»: 11 de 12 puntos", done: simDone },
    { txt: "Arma las 4 oraciones en inglés", done: armarDone },
    { txt: "Clasifica los 7 sujetos por su forma de «to be»", done: tobeDone },
    { txt: "Clasifica las 10 frases (saludo/presentación/despedida)", done: funcionesDone },
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

  const resetActual =
    modo === "club" ? resetClub : modo === "texto" ? resetHuecos : modo === "construir" ? resetOracion : modo === "tobe" ? resetBe : resetFunciones;

  const lectura =
    modo === "club" ? (
      <>Friendship: {totalPts}/{PUNTOS_MAX} · {enFinal ? "day over" : `scene ${nodoIdx + 1} of ${NODOS.length}`}</>
    ) : modo === "construir" ? (
      <>Words in place: {placed.length}/{oracion.palabras.length}</>
    ) : modo === "tobe" ? (
      <>Subjects sorted: {Object.keys(ubicSuj).length}/{SUJETOS.length}</>
    ) : modo === "funciones" ? (
      <>Phrases sorted: {Object.keys(ubicFra).length}/{FRASES.length}</>
    ) : (
      <>Fill in the missing words</>
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

          {modo === "club" && (
            <ClubPanel
              accent={accent}
              nodoIdx={nodoIdx}
              nodo={nodo}
              enFinal={enFinal}
              resp={resp}
              ptsPorNodo={ptsPorNodo}
              totalPts={totalPts}
              reaccion={reaccion}
              onOpcion={elegirOpcion}
              onSiguiente={siguienteNodo}
              onReiniciar={resetClub}
            />
          )}

          {/* MODO — completa el texto (fill_blanks verbatim de la progresión) */}
          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={PRESENTACIONES_INGLES_HUECOS}
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

          {modo === "construir" && (
            <ConstruirPanel
              accent={accent}
              oracion={oracion}
              oraIdx={oraIdx}
              armadas={armadas}
              placed={placed}
              libresIdx={libresIdx}
              selWord={selWord}
              shakeWord={shakeWord}
              onSelOracion={(i) => setOraIdx(i)}
              onSelWord={(idx) => setSelWord((p) => (p === idx ? null : idx))}
              onSlot={() => {
                if (selWord !== null) intentarPalabra(selWord);
              }}
              onDropSlot={(id) => intentarPalabra(Number(id))}
              dragProps={dragProps}
              dropProps={dropProps}
            />
          )}

          {modo === "tobe" && (
            <BinsPanel<ToBe>
              titulo="Arrastra cada sujeto a su forma del verbo «to be»"
              items={sujLibres.map((s) => ({ id: s.id, texto: s.texto, sub: s.traduccion }))}
              total={SUJETOS.length}
              colocados={Object.keys(ubicSuj).length}
              bins={(["am", "is", "are"] as ToBe[]).map((b) => ({
                key: b,
                info: TOBE_INFO[b],
                dentro: SUJETOS.filter((s) => ubicSuj[s.id] === b).map((s) => ({ id: s.id, texto: s.texto })),
              }))}
              sel={selSuj}
              shake={shakeBe}
              onSel={(id) => setSelSuj((p) => (p === id ? null : id))}
              onBin={(b) => {
                if (selSuj) intentarBe(selSuj, b);
              }}
              onDropBin={(id, b) => intentarBe(id, b)}
              dragProps={dragProps}
              dropProps={dropProps}
              hechoMsg="¡Clasificaste los 7 sujetos!"
            />
          )}

          {modo === "funciones" && (
            <BinsPanel<Funcion>
              titulo="Arrastra cada frase a su función comunicativa"
              items={fraLibres.map((f) => ({ id: f.id, texto: f.texto }))}
              total={FRASES.length}
              colocados={Object.keys(ubicFra).length}
              bins={(["greeting", "introduction", "farewell"] as Funcion[]).map((b) => ({
                key: b,
                info: FUNCION_INFO[b],
                dentro: FRASES.filter((f) => ubicFra[f.id] === b).map((f) => ({ id: f.id, texto: f.texto })),
              }))}
              sel={selFra}
              shake={shakeFun}
              onSel={(id) => setSelFra((p) => (p === id ? null : id))}
              onBin={(b) => {
                if (selFra) intentarFuncion(selFra, b);
              }}
              onDropBin={(id, b) => intentarFuncion(id, b)}
              dragProps={dragProps}
              dropProps={dropProps}
              hechoMsg="¡Clasificaste las 10 frases!"
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
                  <Dato label="Amistad ahora" value={`${totalPts}/${PUNTOS_MAX}`} col={totalPts >= 11 ? OK : undefined} />
                  <Dato label="Mejor día" value={`${simBest}/${PUNTOS_MAX}`} col={simDone ? OK : undefined} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1, 2, 3].map((s) => (
                      <i key={s} className="fa-solid fa-star" style={{ fontSize: 20, color: s <= bestEstrellas ? "#FFC75A" : "rgba(255,255,255,0.16)" }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.45, flex: "1 1 160px" }}>
                    {bestEstrellas >= 3 ? "¡Dominaste las presentaciones!" : "Completa los modos para 2★; la tercera pide 2 errores o menos."}
                  </span>
                </div>
              </Bloque>
              <Bloque titulo="Lo que dijiste en el club" icono="fa-comments">
                {NODOS.map((n, i) => {
                  const op = n.opciones.find((o) => o.id === resp[n.id]);
                  return (
                    <p key={n.id} style={{ margin: 0, color: T.text2 }}>
                      <strong style={{ color: T.text }}>{i + 1}.</strong>{" "}
                      {op ? (
                        <>
                          «{op.texto}» <span style={{ color: op.puntos === 2 ? OK : op.puntos === 1 ? "#FFC75A" : NO }}>{op.puntos === 2 ? "✓" : op.puntos === 1 ? "~" : "✗"}</span>
                        </>
                      ) : (
                        <span style={{ color: T.text3 }}>pendiente</span>
                      )}
                    </p>
                  );
                })}
              </Bloque>
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
              <Bloque titulo="El verbo to be" icono="fa-equals">
                {(Object.keys(TOBE_INFO) as ToBe[]).map((b) => (
                  <p key={b} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{TOBE_INFO[b].label}.</strong> {TOBE_INFO[b].descripcion}
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Saludos, presentaciones y despedidas" icono="fa-hand">
                {(Object.keys(FUNCION_INFO) as Funcion[]).map((f) => (
                  <p key={f} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{FUNCION_INFO[f].label} ({FUNCION_INFO[f].descripcion}).</strong>{" "}
                    {FRASES.filter((x) => x.funcion === f).map((x) => x.texto).join(" · ")}
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Dato" icono="fa-circle-info">
                <p style={{ margin: 0, color: T.text2 }}>{DATO_INGLES}</p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={PRESENTACIONES_INGLES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

const css = (accent: string, rgba: string) => `
  @keyframes enShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
  @keyframes enPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
  @keyframes enBob { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-6px);} }
  .en-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; padding:11px 16px; border-radius:999px;
    border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:15px; font-weight:800; user-select:none;
    transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
  .en-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); transform:translateY(-2px); }
  .en-chip[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -5px ${accent}; transform:translateY(-3px) scale(1.02); }
  .en-chip:active { cursor:grabbing; }
  .en-bin { border-radius:16px; border:2px dashed ${T.lineStrong}; padding:16px; min-height:140px; transition:all .16s; }
  .en-bin[data-shake="true"] { animation:enShake .4s; }
  .en-slot { border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset}; min-width:74px; min-height:48px; padding:0 12px;
    display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:14px; gap:6px; transition:all .16s; }
  .en-slot[data-active="true"] { border-color:${accent}; background:rgba(${rgba},0.1); cursor:pointer; }
  .en-slot[data-shake="true"] { animation:enShake .4s; border-color:${NO}; }
  .en-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14.5px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
  .en-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
  .en-q:disabled{ cursor:default; }
  .en-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
    border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14.5px; font-weight:800; transition:all .14s; }
  .en-btn:hover { border-color:${T.lineStrong}; }
  .en-prob { cursor:pointer; padding:9px 14px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass};
    color:${T.text2}; font-size:14px; font-weight:800; transition:all .14s; }
  .en-prob:hover { border-color:${T.lineStrong}; color:#fff; }
  .en-prob[data-on="true"] { border-color:${accent}; background:rgba(${rgba},0.16); color:#fff; }
  .en-prob[data-done="true"] { color:${OK}; border-color:${OK}66; }

  /* Simulador: Club day */
  .en-pasos { display:flex; gap:6px; }
  .en-paso { flex:1; height:10px; border-radius:6px; background:${T.inset}; border:1px solid ${T.line}; }
  .en-paso[data-on="true"] { border-color:${accent}; }
  .en-paso[data-p="2"] { background:${OK}; border-color:${OK}; }
  .en-paso[data-p="1"] { background:#FFC75A; border-color:#FFC75A; }
  .en-paso[data-p="0"] { background:${NO}; border-color:${NO}; }
  .en-escena { position:relative; border-radius:16px; overflow:hidden; border:1.5px solid ${T.line}; min-height:190px;
    background:linear-gradient(135deg, rgba(${rgba},0.3), rgba(8,18,36,0.95)); display:flex; flex-direction:column; justify-content:flex-end; }
  .en-escena-fondo { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; }
  .en-escena-fondo > i { font-size:54px; color:rgba(255,255,255,0.18); }
  .en-escena-fondo img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .en-escena-tit { position:absolute; left:10px; top:10px; padding:5px 11px; border-radius:999px; background:rgba(2,12,28,.8); color:#fff; font-size:14px; font-weight:800; }
  .en-elenco { position:relative; display:flex; justify-content:space-evenly; gap:8px; padding:46px 8px 10px; flex-wrap:wrap;
    background:linear-gradient(180deg, transparent, rgba(2,10,24,.78) 60%); }
  .en-pj { display:flex; flex-direction:column; align-items:center; gap:4px; min-width:0; }
  .en-retrato { position:relative; width:84px; height:84px; border-radius:50%; overflow:hidden; border:3px solid var(--ac,#8FA3BF);
    background:linear-gradient(135deg, rgba(${rgba},0.4), rgba(8,18,36,0.95)); display:flex; align-items:center; justify-content:center; }
  .en-retrato > i { font-size:36px; color:var(--ac,#8FA3BF); }
  .en-retrato img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .en-retrato[data-animo="confuso"] { animation:enShake .5s 1; }
  .en-retrato[data-animo="feliz"] { animation:enBob 1.2s ease-in-out infinite; }
  .en-pj-nombre { padding:2px 9px; border-radius:999px; background:rgba(2,12,28,.82); color:#fff; font-size:14px; font-weight:800; }
  .en-pj-animo { display:inline-flex; align-items:center; gap:5px; padding:2px 9px; border-radius:999px; background:rgba(2,12,28,.82); font-size:14px; font-weight:700; color:var(--ac,#8FA3BF); }
  .en-burbuja { border-radius:16px; padding:12px 16px; background:${T.glass}; border:1.5px solid ${T.line}; }
  .en-burbuja strong { display:block; font-size:14px; color:${T.text3}; margin-bottom:3px; }
  .en-burbuja .en-ing { font-size:18px; font-weight:800; color:#fff; line-height:1.35; }
  .en-burbuja .en-esp { font-size:14px; color:${T.text3}; margin-top:3px; }
  .en-opciones { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap:10px; }
  .en-op { cursor:pointer; text-align:left; padding:13px 15px; border-radius:14px; border:1.5px solid ${T.line}; background:${T.glassSoft};
    color:#fff; font-size:16px; font-weight:700; line-height:1.35; transition:all .14s; }
  .en-op:hover:not(:disabled) { border-color:${accent}; transform:translateY(-2px); }
  .en-op:disabled { cursor:default; }
  .en-op[data-estado="elegida-2"] { border-color:${OK}; background:${OK}18; }
  .en-op[data-estado="elegida-1"] { border-color:#FFC75A; background:#FFC75A18; }
  .en-op[data-estado="elegida-0"] { border-color:${NO}; background:${NO}14; }
  .en-op[data-estado="otra"] { opacity:.45; }
  .en-retro { display:flex; flex-direction:column; gap:8px; align-items:flex-start; padding:13px 15px; border-radius:13px; font-size:14.5px; line-height:1.5; color:${T.text2};
    border:1.5px solid var(--rc); background:${T.glass}; }
  .en-retro strong { color:#fff; font-size:15px; }
  .en-amistad { display:grid; grid-template-columns:auto 1fr auto; gap:10px; align-items:center; font-size:14px; font-weight:800; color:${T.text2}; }
  .en-amistad-barra { height:12px; border-radius:8px; background:${T.inset}; border:1px solid ${T.line}; overflow:hidden; }
  .en-amistad-barra > div { height:100%; background:linear-gradient(90deg, #FF8FAB, #FFC75A); transition:width .35s; }
  .en-op:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }

  /* Identidad del tablero */
  .en-bin { --tono:188; position:relative;
    background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
  .en-bin:nth-of-type(6n+1) { --tono:188; }
  .en-bin:nth-of-type(6n+2) { --tono:262; }
  .en-bin:nth-of-type(6n+3) { --tono:44; }
  .en-bin:nth-of-type(6n+4) { --tono:152; }
  .en-bin:nth-of-type(6n+5) { --tono:330; }
  .en-bin:nth-of-type(6n+6) { --tono:18; }
  .en-bin::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
    background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
  .en-bin[data-done="true"] {
    background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }
  @media (prefers-reduced-motion: reduce){
    .en-slot[data-shake="true"], .en-bin[data-shake="true"], .en-retrato[data-animo="confuso"], .en-retrato[data-animo="feliz"] { animation:none; }
    .en-chip, .en-chip:hover, .en-chip[data-sel="true"], .en-op:hover:not(:disabled) { transform:none; transition:none; }
    .en-amistad-barra > div { transition:none; }
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════
 * Imagen con respaldo: si el archivo aún no existe se oculta y queda el degradado + ícono.
 * ═══════════════════════════════════════════════════════════════════════════ */
function ImgSim({ src }: { src: string }) {
  const [rota, setRota] = useState(false);
  if (rota) return null;
  return <img src={src} alt="" loading="lazy" onError={() => setRota(true)} />;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Panel «Club day» (situación social ramificada)
 * ═══════════════════════════════════════════════════════════════════════════ */
function ClubPanel({
  accent,
  nodoIdx,
  nodo,
  enFinal,
  resp,
  ptsPorNodo,
  totalPts,
  reaccion,
  onOpcion,
  onSiguiente,
  onReiniciar,
}: {
  accent: string;
  nodoIdx: number;
  nodo: NodoSim;
  enFinal: boolean;
  resp: Record<string, string>;
  ptsPorNodo: Record<string, number>;
  totalPts: number;
  reaccion: boolean;
  onOpcion: (id: string) => void;
  onSiguiente: () => void;
  onReiniciar: () => void;
}) {
  const esc = ESCENAS[nodo.escena];
  const opElegida = nodo.opciones.find((o) => o.id === resp[nodo.id]);
  const animos: Record<string, Animo> = reaccion && opElegida ? animosDe(nodo, opElegida) : {};
  const fin = finalDe(totalPts);
  const hablante = PERSONAJES[nodo.habla];
  return (
    <>
      <div className="en-pasos" aria-label="Progreso de la conversación">
        {NODOS.map((n, i) => (
          <span key={n.id} className="en-paso" data-on={i === nodoIdx && !enFinal} data-p={ptsPorNodo[n.id] !== undefined && (i < nodoIdx || enFinal || (i === nodoIdx && reaccion)) ? String(ptsPorNodo[n.id]) : undefined} />
        ))}
      </div>

      <div className="en-escena">
        <div className="en-escena-fondo">
          <i className={`fa-solid ${esc.icono}`} aria-hidden />
          <ImgSim key={esc.foto} src={`${RUTA_FOTOS}/${esc.foto}.webp`} />
        </div>
        <span className="en-escena-tit">
          <i className={`fa-solid ${esc.icono}`} style={{ marginRight: 7, color: accent }} />
          {esc.titulo}
        </span>
        <div className="en-elenco">
          {(enFinal ? (["torres", "valeria", "diego"] as PersonajeId[]) : nodo.presentes).map((id) => {
            const p = PERSONAJES[id];
            const animo: Animo = enFinal ? (totalPts >= 11 ? "feliz" : totalPts >= 7 ? "neutral" : "confuso") : (animos[id] ?? "neutral");
            const ai = ANIMO_INFO[animo];
            return (
              <div key={id} className="en-pj" style={{ ["--ac" as string]: ai.color }}>
                <div className="en-retrato" data-animo={animo}>
                  <i className={`fa-solid ${ai.icono}`} aria-hidden />
                  <ImgSim key={p.foto} src={`${RUTA_FOTOS}/${p.foto}.webp`} />
                </div>
                <span className="en-pj-nombre">{p.nombre}</span>
                <span className="en-pj-animo">
                  <i className={`fa-solid ${ai.icono}`} aria-hidden /> {ai.etiqueta}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {!enFinal && (
        <>
          <div className="en-burbuja" aria-live="polite">
            <strong>{hablante.nombre} dice:</strong>
            <div className="en-ing">“{nodo.linea(ptsPorNodo)}”</div>
            <div className="en-esp">{nodo.traduccion}</div>
          </div>

          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 8 }}>¿Qué respondes tú (Ana)?</div>
            <div className="en-opciones">
              {nodo.opciones.map((o) => {
                const elegida = reaccion && opElegida?.id === o.id;
                const estado = reaccion ? (elegida ? `elegida-${o.puntos}` : "otra") : undefined;
                return (
                  <button key={o.id} type="button" className="en-op" data-estado={estado} disabled={reaccion} onClick={() => onOpcion(o.id)}>
                    {o.texto}
                  </button>
                );
              })}
            </div>
          </div>

          {reaccion && opElegida && (
            <div className="en-retro" style={{ ["--rc" as string]: opElegida.puntos === 2 ? OK : opElegida.puntos === 1 ? "#FFC75A" : NO }}>
              <strong>
                <i className={`fa-solid ${ANIMO_INFO[opElegida.animo].icono}`} style={{ marginRight: 8, color: ANIMO_INFO[opElegida.animo].color }} />
                {hablante.nombre}: {ANIMO_INFO[opElegida.animo].etiqueta} · {opElegida.puntos}/2
              </strong>
              <span>{opElegida.porque}</span>
              <button type="button" className="en-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={onSiguiente}>
                <i className="fa-solid fa-arrow-right" /> {nodoIdx + 1 >= NODOS.length ? "Terminar el día" : "Siguiente escena"}
              </button>
            </div>
          )}
        </>
      )}

      {enFinal && (
        <div className="en-retro" style={{ ["--rc" as string]: fin.color }}>
          <strong>
            <i className={`fa-solid ${fin.icono}`} style={{ marginRight: 8, color: fin.color }} />
            {fin.titulo} · {totalPts}/{PUNTOS_MAX}
          </strong>
          <span>{fin.texto}</span>
          <button type="button" className="en-btn" onClick={onReiniciar}>
            <i className="fa-solid fa-rotate-left" /> Volver a empezar el día
          </button>
        </div>
      )}

      <div className="en-amistad">
        <span><i className="fa-solid fa-heart" style={{ color: "#FF8FAB", marginRight: 6 }} />Amistad</span>
        <div className="en-amistad-barra"><div style={{ width: `${(totalPts / PUNTOS_MAX) * 100}%` }} /></div>
        <span>{totalPts}/{PUNTOS_MAX} · simulación</span>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Panel «Build the sentence» (ordenar palabras)
 * ═══════════════════════════════════════════════════════════════════════════ */
function ConstruirPanel({
  accent,
  oracion,
  oraIdx,
  armadas,
  placed,
  libresIdx,
  selWord,
  shakeWord,
  onSelOracion,
  onSelWord,
  onSlot,
  onDropSlot,
  dragProps,
  dropProps,
}: {
  accent: string;
  oracion: (typeof ORACIONES)[number];
  oraIdx: number;
  armadas: Set<string>;
  placed: number[];
  libresIdx: { palabra: string; idx: number }[];
  selWord: number | null;
  shakeWord: boolean;
  onSelOracion: (i: number) => void;
  onSelWord: (idx: number) => void;
  onSlot: () => void;
  onDropSlot: (id: string) => void;
  dragProps: (id: string) => Record<string, unknown>;
  dropProps: (onDrop: (id: string) => void) => Record<string, unknown>;
}) {
  const completado = armadas.has(oracion.id);
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
        {ORACIONES.map((o, i) => (
          <button key={o.id} className="en-prob" data-on={oraIdx === i} data-done={armadas.has(o.id)} onClick={() => onSelOracion(i)}>
            {armadas.has(o.id) && <i className="fa-solid fa-circle-check" style={{ marginRight: 6 }} />}
            {i + 1}
          </button>
        ))}
      </div>

      <Mesa>
        <div>
      <div style={{ ...card, padding: "18px 22px" }}>
        <Eyebrow>Palabras — arrástralas en orden</Eyebrow>
        {libresIdx.length === 0 ? (
          <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
            <i className="fa-solid fa-circle-check" /> Well done! Cambia de oración arriba para armar otra.
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {libresIdx.map((w) => (
              <button key={w.idx} className="en-chip" data-sel={selWord === w.idx} onClick={() => onSelWord(w.idx)} {...dragProps(String(w.idx))}>
                {w.palabra}
              </button>
            ))}
          </div>
        )}
      </div>
        </div>
        <div>
      <div style={{ ...card, padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, gap: 10, flexWrap: "wrap" }}>
          <Eyebrow>
            <i className="fa-solid fa-language" style={{ marginRight: 8, color: accent }} />
            Traducción
          </Eyebrow>
          <span style={{ fontSize: 14, fontWeight: 800, color: completado ? OK : T.text3 }}>
            {completado ? "Sentence complete ✓" : `${placed.length}/${oracion.palabras.length} words`}
          </span>
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 16 }}>«{oracion.traduccion}»</div>

        {/* slots de la oración */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginBottom: 4 }}>
          {oracion.palabras.map((_, i) => {
            const colocadaIdx = placed[i];
            const palabra = colocadaIdx !== undefined ? oracion.palabras[colocadaIdx] : null;
            const esActivo = i === placed.length;
            if (palabra != null) {
              return (
                <span key={i} style={{ animation: "enPop .25s ease", display: "inline-flex", alignItems: "center", padding: "11px 16px", borderRadius: 11, border: `1.5px solid ${accent}`, background: `${accent}1f`, fontSize: 15, fontWeight: 800, color: "#fff" }}>
                  {palabra}
                </span>
              );
            }
            return (
              <span
                key={i}
                className="en-slot"
                data-active={esActivo}
                data-shake={esActivo && shakeWord}
                onClick={() => esActivo && onSlot()}
                {...(esActivo ? dropProps((id) => onDropSlot(id)) : {})}
              >
                {esActivo ? <i className="fa-solid fa-arrow-down" /> : <span style={{ opacity: 0.35 }}>·</span>}
              </span>
            );
          })}
        </div>
      </div>

        </div>
      </Mesa>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Panel genérico de clasificación por contenedores (to be / funciones)
 * ═══════════════════════════════════════════════════════════════════════════ */
type BinInfo = { label: string; descripcion: string; icono: string; color: string };
function BinsPanel<K extends string>({
  titulo,
  items,
  total,
  colocados,
  bins,
  sel,
  shake,
  onSel,
  onBin,
  onDropBin,
  dragProps,
  dropProps,
  hechoMsg,
}: {
  titulo: string;
  items: { id: string; texto: string; sub?: string }[];
  total: number;
  colocados: number;
  bins: { key: K; info: BinInfo; dentro: { id: string; texto: string }[] }[];
  sel: string | null;
  shake: K | null;
  onSel: (id: string) => void;
  onBin: (k: K) => void;
  onDropBin: (id: string, k: K) => void;
  dragProps: (id: string) => Record<string, unknown>;
  dropProps: (onDrop: (id: string) => void) => Record<string, unknown>;
  hechoMsg: string;
}) {
  return (
    <>
      <Mesa>
        <div>
      <div style={{ ...card, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
          <Eyebrow>{titulo}</Eyebrow>
          <span style={{ fontSize: 14, fontWeight: 800, color: colocados >= total ? OK : T.text3 }}>{colocados}/{total}</span>
        </div>
        {items.length === 0 ? (
          <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
            <i className="fa-solid fa-circle-check" /> {hechoMsg}
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {items.map((it) => (
              <button key={it.id} className="en-chip" data-sel={sel === it.id} onClick={() => onSel(it.id)} {...dragProps(it.id)}>
                {it.texto}
                {it.sub && <span style={{ marginLeft: 7, fontSize: 14, fontWeight: 600, color: T.text3 }}>· {it.sub}</span>}
              </button>
            ))}
          </div>
        )}
      </div>

        </div>
        <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 14 }}>
        {bins.map((bin) => (
          <div
            key={bin.key}
            className="en-bin"
            data-shake={shake === bin.key}
            onClick={() => onBin(bin.key)}
            {...dropProps((id) => onDropBin(id, bin.key))}
            style={{ borderColor: `${bin.info.color}66`, background: `${bin.info.color}0d`, cursor: sel ? "pointer" : "default" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
              <span style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#fff", background: `${bin.info.color}33` }}>
                <i className={`fa-solid ${bin.info.icono}`} />
              </span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>{bin.info.label}</div>
                <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.3 }}>{bin.info.descripcion}</div>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {bin.dentro.map((d) => (
                <span key={d.id} style={{ animation: "enPop .25s ease", fontSize: 14, fontWeight: 800, color: "#fff", padding: "6px 12px", borderRadius: 999, background: `${bin.info.color}26`, border: `1px solid ${bin.info.color}55` }}>
                  {d.texto}
                </span>
              ))}
              {bin.dentro.length === 0 && <span style={{ fontSize: 14, color: T.text3, fontStyle: "italic" }}>Empty</span>}
            </div>
          </div>
        ))}
      </div>
        </div>
      </Mesa>
    </>
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
          Check your English
        </Eyebrow>
        {aprobado && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 14, fontWeight: 800, color: OK }}>
            <i className="fa-solid fa-circle-check" /> Aprobado
          </span>
        )}
      </div>
      <div style={{ fontSize: 14, color: T.text3, marginBottom: 18, lineHeight: 1.5 }}>
        Cinco preguntas sobre saludos, el verbo «to be» y presentaciones. Responde y pulsa «Comprobar».
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 9 }}>
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
                    <button key={oi} className="en-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="en-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="en-btn" onClick={reintentar}>
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
