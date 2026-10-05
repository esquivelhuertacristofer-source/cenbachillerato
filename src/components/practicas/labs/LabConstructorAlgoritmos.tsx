"use client";

/**
 * Laboratorio — Constructor de algoritmos.
 * Práctica experimental para CD-I-P11-A2 (Cultura Digital I · lenguaje algorítmico).
 *
 * Experimento central: los bloques que el alumno ordena SE EJECUTAN.
 *  1. «Programa al robot»: Chispa, un robot repartidor, recorre una cuadrícula
 *     paso a paso con el programa del alumno. Un orden equivocado se ve: choca
 *     con una pared o se queda corto. Tres niveles = las tres estructuras de
 *     control (secuencial, repetitiva, condicional).
 *  2. «Diagrama de flujo»: los bloques de inicio, entrada, proceso, decisión y
 *     salida se colocan en cualquier orden y el diagrama se ejecuta con datos
 *     de prueba; el primer paso imposible queda marcado en rojo.
 *  + «Clasifica operadores», «Estructuras de control» y «Completa el texto»
 *    como refuerzo. Cuestionario en la pestaña «Reto».
 *
 * DOM puro (sin three.js): ratón, teclado y pantalla táctil (tocar para
 * agregar, además del arrastre nativo HTML5).
 *
 * Contenido VERBATIM de las lecturas A1 de CD-I·P11 y CD-I·P04.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { CONSTRUCTOR_ALGORITMOS_HUECOS } from "./constructor-algoritmos-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { LabShell, Bloque, Mesa, BotonHerramienta } from "./_shell";
import { CONSTRUCTOR_ALGORITMOS_FICHA } from "./constructor-algoritmos-ficha";
import {
  PROBLEMAS,
  FORMA_INFO,
  OPERADORES,
  OP_INFO,
  ESTRUCTURAS,
  ESCENARIOS,
  QUIZ,
  DATO_ALGORITMOS,
  type TipoOp,
  type Forma,
} from "./algoritmos-data";
import {
  NIVELES_ROBOT,
  BLOQUES_ROBOT,
  ejecutarRobot,
  ejecutarFlujo,
  pruebasDe,
  hayMuro,
  type BloqueRobot,
  type NivelRobot,
  type ResultadoRobot,
  type ResultadoFlujo,
} from "./algoritmos-sim";

const NO = "#FF5E5E";
const AMBAR = "#F2A33C";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
const RETO_KEY = "cen-algoritmos-reto";
const RUTA_FOTOS = "/media/labs-sim/constructor-algoritmos";
const CASILLA = 56;
const MS_PASO = 380;

type Modo = "robot" | "construir" | "operadores" | "estructuras" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "robot", label: "Programa al robot", icono: "fa-robot" },
  { id: "construir", label: "Diagrama de flujo", icono: "fa-diagram-project" },
  { id: "operadores", label: "Clasifica operadores", icono: "fa-calculator" },
  { id: "estructuras", label: "Estructuras de control", icono: "fa-code-branch" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

const porTexto = (a: { texto: string }, b: { texto: string }) => a.texto.localeCompare(b.texto, "es");
const NOMBRE_DIR = ["el norte", "el este", "el sur", "el oeste"];

export function LabConstructorAlgoritmos({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("robot");

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
  const timer = useRef<number | null>(null);
  useEffect(
    () => () => {
      audioRef.current?.dispose();
      if (timer.current) window.clearTimeout(timer.current);
    },
    []
  );
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
  const sfxClick = () => sonido && audioRef.current?.blip();

  // ── modo Robot ────────────────────────────────────────────────────────
  const [nivIdx, setNivIdx] = useState(0);
  const [progs, setProgs] = useState<Record<string, BloqueRobot[]>>({});
  const [bucles, setBucles] = useState<Record<string, boolean>>({});
  const [corrida, setCorrida] = useState<ResultadoRobot | null>(null);
  const [idx, setIdx] = useState(0);
  const [corriendo, setCorriendo] = useState(false);
  const [terminada, setTerminada] = useState(false);
  const [resueltosR, setResueltosR] = useState<string[]>([]);

  const nivel = NIVELES_ROBOT[nivIdx]!;
  const programa = progs[nivel.id] ?? [];
  const repetir = !!bucles[nivel.id];

  const detener = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
    setCorriendo(false);
  };
  const limpiarCorrida = () => {
    detener();
    setCorrida(null);
    setIdx(0);
    setTerminada(false);
  };
  const terminar = (res: ResultadoRobot, n: NivelRobot) => {
    setTerminada(true);
    if (res.fin === "meta") {
      setResueltosR((r) => (r.includes(n.id) ? r : [...r, n.id]));
      sfxPlace();
      sfxOk();
    } else {
      sfxNo();
    }
  };
  const editarPrograma = (nuevo: BloqueRobot[]) => {
    limpiarCorrida();
    setProgs((p) => ({ ...p, [nivel.id]: nuevo }));
  };
  const agregarBloque = (b: BloqueRobot) => {
    if (programa.length >= nivel.maxBloques || !nivel.permitidos.includes(b)) return;
    sfxClick();
    editarPrograma([...programa, b]);
  };
  const quitarBloque = (i: number) => editarPrograma(programa.filter((_, k) => k !== i));
  const moverBloque = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= programa.length) return;
    const copia = [...programa];
    [copia[i], copia[j]] = [copia[j]!, copia[i]!];
    editarPrograma(copia);
  };
  const cambiarNivel = (i: number) => {
    limpiarCorrida();
    setNivIdx(i);
  };
  const alternarRepetir = () => {
    limpiarCorrida();
    setBucles((b) => ({ ...b, [nivel.id]: !b[nivel.id] }));
  };
  const ejecutar = () => {
    detener();
    if (programa.length === 0) {
      setCorrida(null);
      setTerminada(false);
      return;
    }
    const res = ejecutarRobot(nivel, programa, repetir);
    setCorrida(res);
    setIdx(0);
    setTerminada(false);
    if (res.micros.length <= 1) {
      terminar(res, nivel);
      return;
    }
    setCorriendo(true);
    let i = 0;
    const sig = () => {
      i += 1;
      setIdx(i);
      if (i >= res.micros.length - 1) {
        timer.current = null;
        setCorriendo(false);
        terminar(res, nivel);
      } else {
        timer.current = window.setTimeout(sig, MS_PASO);
      }
    };
    timer.current = window.setTimeout(sig, MS_PASO);
  };
  const unPaso = () => {
    if (corriendo) return;
    if (!corrida || terminada) {
      if (programa.length === 0) return;
      const res = ejecutarRobot(nivel, programa, repetir);
      setCorrida(res);
      setIdx(0);
      setTerminada(false);
      if (res.micros.length <= 1) terminar(res, nivel);
      return;
    }
    const i = idx + 1;
    setIdx(i);
    if (i >= corrida.micros.length - 1) terminar(corrida, nivel);
  };
  const resetRobot = () => {
    limpiarCorrida();
    setProgs({});
    setBucles({});
    setResueltosR([]);
  };

  // ── modo Diagrama de flujo ────────────────────────────────────────────
  const [probIdx, setProbIdx] = useState(0);
  const [ordenes, setOrdenes] = useState<Record<string, string[]>>({});
  const [ejec, setEjec] = useState<Record<string, ResultadoFlujo[] | null>>({});
  const [pruebaIdx, setPruebaIdx] = useState(0);
  const [completados, setCompletados] = useState<Set<string>>(() => new Set<string>());

  const problema = PROBLEMAS[probIdx]!;
  const ordenActual = ordenes[problema.id] ?? [];
  const pasosLibres = problema.pasos.filter((p) => !ordenActual.includes(p.id)).sort(porTexto);
  const resultadosFlujo = ejec[problema.id] ?? null;

  const [estrellas, setEstrellas] = useState(0);
  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);

  const editarOrden = (nuevo: string[]) => {
    setOrdenes((o) => ({ ...o, [problema.id]: nuevo }));
    setEjec((e) => ({ ...e, [problema.id]: null }));
  };
  const agregarPaso = (id: string) => {
    if (ordenActual.includes(id) || !problema.pasos.some((p) => p.id === id)) return;
    sfxClick();
    editarOrden([...ordenActual, id]);
  };
  const quitarPaso = (i: number) => editarOrden(ordenActual.filter((_, k) => k !== i));
  const moverPaso = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= ordenActual.length) return;
    const copia = [...ordenActual];
    [copia[i], copia[j]] = [copia[j]!, copia[i]!];
    editarOrden(copia);
  };
  const ejecutarDiagrama = () => {
    if (ordenActual.length === 0) return;
    const res = pruebasDe(problema.id).map((p) => ejecutarFlujo(problema.id, ordenActual, p));
    setEjec((e) => ({ ...e, [problema.id]: res }));
    const malaIdx = res.findIndex((r) => !r.ok);
    setPruebaIdx(malaIdx >= 0 ? malaIdx : 0);
    if (malaIdx < 0) {
      const nuevosComp = new Set(completados).add(problema.id);
      setCompletados(nuevosComp);
      const est = nuevosComp.size;
      setEstrellas(est);
      sfxPlace();
      sfxOk();
      registraEstrellas(est);
    } else {
      sfxNo();
    }
  };
  const resetProblema = () => {
    setOrdenes((o) => ({ ...o, [problema.id]: [] }));
    setEjec((e) => ({ ...e, [problema.id]: null }));
  };

  // ── modo Operadores ───────────────────────────────────────────────────
  const [ubicOp, setUbicOp] = useState<Record<string, TipoOp>>({});
  const [selOp, setSelOp] = useState<string | null>(null);
  const [shakeBin, setShakeBin] = useState<TipoOp | null>(null);
  const opLibres = OPERADORES.filter((o) => !ubicOp[o.id]);

  const intentarOp = (opId: string, tipo: TipoOp) => {
    const op = OPERADORES.find((o) => o.id === opId);
    if (!op || ubicOp[opId]) return;
    if (op.tipo === tipo) {
      setUbicOp((u) => ({ ...u, [opId]: tipo }));
      setSelOp(null);
      sfxPlace();
      if (Object.keys(ubicOp).length + 1 >= OPERADORES.length) sfxOk();
    } else {
      setShakeBin(tipo);
      sfxNo();
      window.setTimeout(() => setShakeBin(null), 420);
    }
  };
  const resetOp = () => {
    setUbicOp({});
    setSelOp(null);
  };

  // ── modo Estructuras ──────────────────────────────────────────────────
  const [empar, setEmpar] = useState<Record<string, string>>({}); // escenarioId -> estructuraId
  const [selEstr, setSelEstr] = useState<string | null>(null);
  const [shakeEsc, setShakeEsc] = useState<string | null>(null);
  const estrLibres = ESTRUCTURAS.filter((e) => !Object.values(empar).includes(e.id));

  const intentarEstr = (estrId: string, escId: string) => {
    const esc = ESCENARIOS.find((e) => e.id === escId);
    if (!esc || empar[escId]) return;
    if (esc.estructuraId === estrId) {
      setEmpar((e) => ({ ...e, [escId]: estrId }));
      setSelEstr(null);
      sfxPlace();
      if (Object.keys(empar).length + 1 >= ESCENARIOS.length) sfxOk();
    } else {
      setShakeEsc(escId);
      sfxNo();
      window.setTimeout(() => setShakeEsc(null), 420);
    }
  };
  const resetEstr = () => {
    setEmpar({});
    setSelEstr(null);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso ──────────────────────────────────────────────────────────
  const robotDone = resueltosR.length >= NIVELES_ROBOT.length;
  const construirDone = completados.size >= PROBLEMAS.length;
  const opDone = Object.keys(ubicOp).length >= OPERADORES.length;
  const estrDone = Object.keys(empar).length >= ESCENARIOS.length;
  // Todos los modos cuentan, no sólo la construcción: el modo de escribir
  // es trabajo real y antes no dejaba marca. La regla de precisión propia de
  // este lab se conserva, y se toma la mejor de las dos.
  const modosHechos = (robotDone ? 1 : 0) + (construirDone ? 1 : 0) + (opDone ? 1 : 0) + (estrDone ? 1 : 0) + (textoDone ? 1 : 0);
  const bestEstrellas = Math.max(estrellas, partida.estrellasCon(modosHechos, 5), mejor);

  const objetivos = [
    { txt: "Lleva a Chispa hasta el paquete (nivel 1)", done: resueltosR.length >= 1 },
    { txt: "Resuelve los 3 niveles del robot", done: robotDone },
    { txt: "Construye los 3 algoritmos", done: construirDone },
    { txt: "Clasifica los 11 operadores", done: opDone },
    { txt: "Empareja las 3 estructuras de control", done: estrDone },
    { txt: "Consigue 3★ (un algoritmo armado por estrella)", done: bestEstrellas >= 3 },
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
  const dropBase = (onDrop: (id: string) => void) => ({
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
  });
  // Las zonas con botones dentro (el programa) no son un botón en sí; las
  // casillas de emparejar sí, y se activan con Enter o espacio.
  const dropProps = (onDrop: (id: string) => void) => ({
    ...dropBase(onDrop),
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
    modo === "texto" ? resetHuecos : modo === "robot" ? resetRobot : modo === "construir" ? resetProblema : modo === "operadores" ? resetOp : resetEstr;

  const escena = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
      <style>{ESTILOS(accent, color.rgba)}</style>

      {/* MODO — completa el texto (fill_blanks verbatim de la progresión) */}
      {modo === "texto" && (
        <CompletaTexto
          key={textoIntento}
          data={CONSTRUCTOR_ALGORITMOS_HUECOS}
          accent={accent}
          rgba={color.rgba}
          completado={textoDone}
          onCompletado={() => {
            setTextoDone(true);
            sfxOk();
            registraEstrellas(
              partida.estrellasCon((robotDone ? 1 : 0) + (construirDone ? 1 : 0) + (opDone ? 1 : 0) + (estrDone ? 1 : 0) + 1, 5)
            );
          }}
          onAcierto={sfxPlace}
          onError={sfxNo}
        />
      )}

      {modo === "robot" && (
        <RobotEscena
          nivel={nivel}
          nivIdx={nivIdx}
          programa={programa}
          repetir={repetir}
          corrida={corrida}
          idx={idx}
          corriendo={corriendo}
          terminada={terminada}
          resueltos={resueltosR}
          onNivel={cambiarNivel}
          onAgregar={agregarBloque}
          onQuitar={quitarBloque}
          onMover={moverBloque}
          onRepetir={alternarRepetir}
          onEjecutar={ejecutar}
          onPaso={unPaso}
          onLimpiar={() => editarPrograma([])}
          dragProps={dragProps}
          dropProps={dropBase}
        />
      )}

      {modo === "construir" && (
        <FlujoEscena
          problema={problema}
          probIdx={probIdx}
          orden={ordenActual}
          libres={pasosLibres}
          resultados={resultadosFlujo}
          pruebaIdx={pruebaIdx}
          completados={completados}
          onProblema={setProbIdx}
          onPrueba={setPruebaIdx}
          onAgregar={agregarPaso}
          onQuitar={quitarPaso}
          onMover={moverPaso}
          onEjecutar={ejecutarDiagrama}
          dragProps={dragProps}
          dropProps={dropBase}
        />
      )}

      {modo === "operadores" && (
        <OperadoresPanel
          ubicOp={ubicOp}
          selOp={selOp}
          shakeBin={shakeBin}
          opLibres={opLibres}
          onSelOp={(id) => setSelOp((p) => (p === id ? null : id))}
          onBin={(tipo) => {
            if (selOp) intentarOp(selOp, tipo);
          }}
          onDropBin={(opId, tipo) => intentarOp(opId, tipo)}
          dragProps={dragProps}
          dropProps={dropProps}
        />
      )}

      {modo === "estructuras" && (
        <EstructurasPanel
          accent={accent}
          rgba={color.rgba}
          empar={empar}
          selEstr={selEstr}
          shakeEsc={shakeEsc}
          estrLibres={estrLibres}
          onSelEstr={(id) => setSelEstr((p) => (p === id ? null : id))}
          onEsc={(escId) => {
            if (selEstr) intentarEstr(selEstr, escId);
          }}
          onDropEsc={(estrId, escId) => intentarEstr(estrId, escId)}
          dragProps={dragProps}
          dropProps={dropProps}
        />
      )}
    </div>
  );

  const pistaDe: Record<Modo, string> = {
    robot: "Un algoritmo es una secuencia ordenada de pasos. Arma el programa, ejecútalo y mira dónde falla Chispa: el error está en el orden o en lo que falta.",
    construir: "Coloca los bloques del diagrama en un orden, ejecútalo y mira qué paso se pone en rojo: no se puede usar un dato antes de leerlo.",
    operadores: "Los operadores aritméticos calculan, los relacionales comparan y los lógicos combinan condiciones.",
    estructuras: "Las tres estructuras de control: secuencial, condicional y repetitiva.",
    texto: "Escribe la palabra que falta en cada hueco del texto.",
  };

  const posRobot = corrida ? corrida.micros[Math.min(idx, corrida.micros.length - 1)]! : { x: nivel.inicio.x, y: nivel.inicio.y };
  const lectura =
    modo === "robot"
      ? `Chispa en (${posRobot.x + 1}, ${posRobot.y + 1}) · bloques ${programa.length}/${nivel.maxBloques}`
      : modo === "construir"
        ? `${ordenActual.length}/${problema.pasos.length} bloques · ${completados.size}/${PROBLEMAS.length} algoritmos`
        : `${modosHechos}/5 modos · ${bestEstrellas}★`;

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
              {modo === "robot" && (
                <>
                  <Bloque titulo={`Nivel ${nivel.titulo}`} icono="fa-robot">
                    <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>{nivel.enunciado}</div>
                    <div style={{ fontSize: 14, color: AMBAR, lineHeight: 1.5 }}>
                      <i className="fa-solid fa-lightbulb" aria-hidden /> {nivel.pista}
                    </div>
                  </Bloque>
                  <Bloque titulo="Los bloques de Chispa" icono="fa-puzzle-piece">
                    <div style={{ display: "grid", gap: 8 }}>
                      {(Object.keys(BLOQUES_ROBOT) as BloqueRobot[]).map((b) => (
                        <div key={b} style={{ fontSize: 14, color: T.text2, lineHeight: 1.45 }}>
                          <i className={`fa-solid ${BLOQUES_ROBOT[b].icono}`} style={{ color: BLOQUES_ROBOT[b].color, marginRight: 8 }} aria-hidden />
                          <strong style={{ color: T.text }}>{BLOQUES_ROBOT[b].texto}</strong> · estructura {BLOQUES_ROBOT[b].estructura}
                        </div>
                      ))}
                    </div>
                  </Bloque>
                </>
              )}
              {modo === "construir" && (
                <Bloque titulo={problema.titulo} icono="fa-diagram-project">
                  <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>{problema.enunciado}</div>
                  <div style={{ display: "grid", gap: 6 }}>
                    {(Object.keys(FORMA_INFO) as Forma[]).map((f) => (
                      <div key={f} style={{ fontSize: 14, color: T.text2 }}>
                        <i className={`fa-solid ${FORMA_INFO[f].icono}`} style={{ color: FORMA_INFO[f].color, marginRight: 8 }} aria-hidden />
                        {FORMA_INFO[f].label}
                      </div>
                    ))}
                  </div>
                </Bloque>
              )}
              <Bloque titulo="Tu partida" icono="fa-gauge-high">
                <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
                <div style={{ display: "flex", gap: 4 }}>
                  {[1, 2, 3].map((s) => (
                    <i key={s} className="fa-solid fa-star" style={{ fontSize: 20, color: s <= bestEstrellas ? "#FFC75A" : "rgba(255,255,255,0.16)" }} />
                  ))}
                </div>
                <div style={{ fontSize: 14, color: T.text2 }}>
                  {bestEstrellas >= 3 ? "¡Armaste los 3 algoritmos!" : "Arma cada diagrama de flujo para ganar una estrella."}
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
                <FichaTeorica data={CONSTRUCTOR_ALGORITMOS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <Bloque titulo="Estructuras de control" icono="fa-code-branch">
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {ESTRUCTURAS.map((e) => (
                    <div key={e.id} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>{e.texto}</div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Dato" icono="fa-circle-info">
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>{DATO_ALGORITMOS}</div>
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
  @keyframes alShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
  @keyframes alPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
  @keyframes alLate { 0%,100%{opacity:.7;} 50%{opacity:1;} }
  .al-chip { cursor:grab; display:inline-flex; align-items:center; gap:9px; padding:10px 13px; border-radius:12px;
    border:1.5px solid ${T.line}; background:${T.glassSoft}; color:${T.text}; font-size:14px; font-weight:700; text-align:left;
    user-select:none; width:100%; transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
  .al-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
  .al-chip[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
  .al-chip:active { cursor:grabbing; }
  .al-chip:disabled { opacity:.45; cursor:default; }
  .al-opchip { cursor:grab; display:flex; align-items:center; justify-content:center; gap:8px; min-width:60px; padding:12px 14px; border-radius:12px;
    border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:18px; font-weight:900; transition:all .14s; user-select:none; }
  .al-opchip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
  .al-opchip[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
  .al-bin { border-radius:16px; border:2px dashed ${T.lineStrong}; padding:16px; min-height:120px; transition:all .16s; }
  .al-bin[data-shake="true"] { animation:alShake .4s; }
  .al-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
  .al-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
  .al-q:disabled{ cursor:default; }
  .al-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:12px 18px;
    border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:15px; font-weight:800; transition:all .14s; }
  .al-btn:hover { border-color:${T.lineStrong}; }
  .al-btn:disabled { opacity:.5; cursor:default; }
  .al-prob { cursor:pointer; padding:9px 14px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass};
    color:${T.text2}; font-size:14px; font-weight:800; transition:all .14s; }
  .al-prob:hover { border-color:${T.lineStrong}; color:#fff; }
  .al-prob[data-on="true"] { border-color:${accent}; background:rgba(${rgba},0.16); color:#fff; }
  .al-prob[data-done="true"] { color:${OK}; border-color:${OK}66; }

  /* Robot y diagrama */
  .al-fila { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
  .al-mapa { border-radius:16px; border:1px solid ${T.line}; background:rgba(2,12,28,0.55); padding:10px; display:flex; justify-content:center; }
  .al-mapa svg { width:100%; height:auto; display:block; }
  .al-zona { border-radius:14px; border:2px dashed ${T.lineStrong}; padding:10px; display:grid; gap:8px; min-height:64px; background:${T.inset}; }
  .al-zona[data-sobre="true"] { border-color:${accent}; background:rgba(${rgba},0.12); }
  .al-paso { display:flex; align-items:center; gap:10px; padding:9px 10px 9px 12px; border-radius:12px; border:1.5px solid ${T.line};
    background:${T.glassSoft}; font-size:14px; font-weight:700; color:#fff; min-width:0; animation:alPop .25s ease both; }
  .al-paso[data-act="true"] { border-color:${accent}; background:rgba(${rgba},0.25); box-shadow:0 0 14px -4px ${accent}; }
  .al-paso[data-est="ok"] { border-color:${OK}; background:${OK}16; }
  .al-paso[data-est="error"] { border-color:${NO}; background:${NO}18; }
  .al-paso[data-est="salta"] { opacity:.55; border-style:dashed; }
  .al-paso > span.t { flex:1; min-width:0; line-height:1.35; }
  .al-paso small { display:block; font-size:14px; font-weight:600; color:${T.text2}; }
  .al-mini { cursor:pointer; width:34px; height:34px; border-radius:9px; border:1px solid ${T.line}; background:${T.glass}; color:#fff; font-size:14px;
    display:inline-flex; align-items:center; justify-content:center; flex-shrink:0; }
  .al-mini:hover:not(:disabled) { border-color:${accent}; }
  .al-mini:disabled { opacity:.3; cursor:default; }
  .al-banco { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap:9px; }
  .al-resp { padding:12px 14px; border-radius:14px; font-size:15px; line-height:1.45; font-weight:700; border:1px solid ${T.line}; }
  .al-resp[data-ok="true"] { border-color:${OK}; background:${OK}18; }
  .al-resp[data-ok="false"] { border-color:${NO}88; background:${NO}14; }
  .al-vars { display:flex; flex-wrap:wrap; gap:8px; }
  .al-vars span { padding:7px 11px; border-radius:10px; background:${T.inset}; border:1px solid ${T.line}; font-size:14px; font-weight:800;
    font-family:ui-monospace, monospace; }
  .al-meta { animation:alLate 1.4s ease-in-out infinite; }
  @media (prefers-reduced-motion: reduce){ .al-bin[data-shake="true"], .al-meta, .al-paso { animation:none; } }

  /* Identidad del tablero */
  .al-bin { --tono:188; position:relative;
    background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
  .al-bin:nth-of-type(6n+1) { --tono:188; }
  .al-bin:nth-of-type(6n+2) { --tono:262; }
  .al-bin:nth-of-type(6n+3) { --tono:44; }
  .al-bin:nth-of-type(6n+4) { --tono:152; }
  .al-bin:nth-of-type(6n+5) { --tono:330; }
  .al-bin:nth-of-type(6n+6) { --tono:18; }
  .al-bin::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
    background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
  .al-bin[data-done="true"] {
    background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }
  .al-chip:hover:not(:disabled) { transform:translateY(-2px); }
  .al-chip[data-sel="true"] { transform:translateY(-3px) scale(1.02); }
  @media (prefers-reduced-motion: reduce){
    .al-chip, .al-chip:hover, .al-chip[data-sel="true"] { transform:none; transition:none; }
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════
 * Robot en cuadrícula
 * ═══════════════════════════════════════════════════════════════════════════ */
function FotoMini({ clave, icono }: { clave: string; icono: string }) {
  const [falla, setFalla] = useState(false);
  return (
    <span
      aria-hidden
      style={{
        position: "relative",
        width: 64,
        height: 64,
        borderRadius: 12,
        overflow: "hidden",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 24,
        color: "rgba(255,255,255,0.55)",
        background: "linear-gradient(135deg, rgba(91,200,255,0.25), rgba(2,12,28,0.85))",
      }}
    >
      <i className={`fa-solid ${icono}`} />
      {!falla && (
        <img src={`${RUTA_FOTOS}/${clave}.webp`} alt="" loading="lazy" onError={() => setFalla(true)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      )}
    </span>
  );
}

function Mapa({ nivel, corrida, idx }: { nivel: NivelRobot; corrida: ResultadoRobot | null; idx: number }) {
  const S = CASILLA;
  const actual = corrida ? corrida.micros[Math.min(idx, corrida.micros.length - 1)]! : { x: nivel.inicio.x, y: nivel.inicio.y, dir: nivel.inicio.dir, evento: "inicio" as const };
  const huella = corrida ? corrida.micros.slice(0, Math.min(idx, corrida.micros.length - 1)) : [];
  const choque = actual.evento === "choque";
  const enMeta = actual.x === nivel.meta.x && actual.y === nivel.meta.y && actual.evento !== "inicio";
  const cuerpo = choque ? NO : enMeta ? OK : "#5BC8FF";
  return (
    <div className="al-mapa" style={{ maxWidth: Math.max(340, nivel.cols * 78), margin: "0 auto", width: "100%" }}>
      <svg viewBox={`0 0 ${nivel.cols * S} ${nivel.rows * S}`} role="img" aria-label={`Mapa de ${nivel.cols} por ${nivel.rows} casillas con el robot Chispa y el paquete`}>
        {Array.from({ length: nivel.rows }).map((_, y) =>
          Array.from({ length: nivel.cols }).map((__, x) =>
            hayMuro(nivel, x, y) ? (
              <g key={`${x},${y}`}>
                <rect x={x * S + 1} y={y * S + 1} width={S - 2} height={S - 2} rx="5" fill="#3a2b24" stroke="#5a4236" />
                <path d={`M${x * S + 6} ${y * S + S / 2} H${x * S + S - 6} M${x * S + S / 2} ${y * S + 6} V${y * S + S / 2}`} stroke="#5a4236" strokeWidth="2" />
              </g>
            ) : (
              <rect key={`${x},${y}`} x={x * S + 1} y={y * S + 1} width={S - 2} height={S - 2} rx="5" fill="#12304a" stroke="#1d4a6e" />
            )
          )
        )}
        {huella.map((m, i) => (
          <circle key={i} cx={m.x * S + S / 2} cy={m.y * S + S / 2} r="5" fill="#5BC8FF" opacity="0.45" />
        ))}
        {/* paquete */}
        <g className="al-meta" transform={`translate(${nivel.meta.x * S} ${nivel.meta.y * S})`}>
          <rect x="13" y="15" width="30" height="26" rx="4" fill="#C98B4A" stroke="#F2C078" strokeWidth="2" />
          <path d="M28 15 V41 M13 28 H43" stroke="#F2C078" strokeWidth="3" />
        </g>
        {/* Chispa */}
        <g style={{ transform: `translate(${actual.x * S}px, ${actual.y * S}px)`, transition: "transform .3s ease" }}>
          <g transform={`rotate(${actual.dir * 90} ${S / 2} ${S / 2})`}>
            <rect x="11" y="13" width="34" height="32" rx="9" fill={cuerpo} stroke="#0b1b2b" strokeWidth="2" />
            <circle cx="22" cy="26" r="4" fill="#0b1b2b" />
            <circle cx="34" cy="26" r="4" fill="#0b1b2b" />
            <path d="M28 4 L38 14 H18 Z" fill="#FFC75A" stroke="#0b1b2b" strokeWidth="2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function RobotEscena({
  nivel,
  nivIdx,
  programa,
  repetir,
  corrida,
  idx,
  corriendo,
  terminada,
  resueltos,
  onNivel,
  onAgregar,
  onQuitar,
  onMover,
  onRepetir,
  onEjecutar,
  onPaso,
  onLimpiar,
  dragProps,
  dropProps,
}: {
  nivel: NivelRobot;
  nivIdx: number;
  programa: BloqueRobot[];
  repetir: boolean;
  corrida: ResultadoRobot | null;
  idx: number;
  corriendo: boolean;
  terminada: boolean;
  resueltos: string[];
  onNivel: (i: number) => void;
  onAgregar: (b: BloqueRobot) => void;
  onQuitar: (i: number) => void;
  onMover: (i: number, d: -1 | 1) => void;
  onRepetir: () => void;
  onEjecutar: () => void;
  onPaso: () => void;
  onLimpiar: () => void;
  dragProps: (id: string) => Record<string, unknown>;
  dropProps: (onDrop: (id: string) => void) => Record<string, unknown>;
}) {
  const micro = corrida ? corrida.micros[Math.min(idx, corrida.micros.length - 1)]! : null;
  const activo = micro ? micro.bloque : -2;
  const lleno = programa.length >= nivel.maxBloques;
  return (
    <>
      <div className="al-fila" role="tablist" aria-label="Nivel">
        {NIVELES_ROBOT.map((n, i) => (
          <button key={n.id} type="button" role="tab" aria-selected={nivIdx === i} className="al-prob" data-on={nivIdx === i} data-done={resueltos.includes(n.id)} onClick={() => onNivel(i)}>
            {resueltos.includes(n.id) && <i className="fa-solid fa-circle-check" style={{ marginRight: 6 }} aria-hidden />}
            {n.titulo}
          </button>
        ))}
      </div>

      <div style={{ ...card, padding: "12px 14px", display: "flex", gap: 12, alignItems: "center" }}>
        <FotoMini clave={nivel.clave} icono="fa-robot" />
        <div style={{ fontSize: 15, lineHeight: 1.45, color: T.text }}>{nivel.enunciado}</div>
      </div>

      <Mapa nivel={nivel} corrida={corrida} idx={idx} />

      {/* programa */}
      <div style={{ display: "grid", gap: 8 }}>
        <Eyebrow>
          <i className="fa-solid fa-list-ol" style={{ marginRight: 8 }} aria-hidden />
          Programa · {programa.length}/{nivel.maxBloques} bloques{repetir ? " · se repite" : ""}
        </Eyebrow>
        <div className="al-zona" {...dropProps((id) => id.startsWith("b:") && onAgregar(id.slice(2) as BloqueRobot))}>
          {programa.length === 0 && <span style={{ fontSize: 14, color: T.text3 }}>Toca o arrastra los bloques de abajo para armar el programa de Chispa.</span>}
          {programa.map((b, i) => {
            const info = BLOQUES_ROBOT[b];
            return (
              <div key={i} className="al-paso" data-act={activo === i}>
                <span style={{ width: 24, height: 24, borderRadius: "50%", background: `${info.color}33`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, flexShrink: 0 }}>{i + 1}</span>
                <i className={`fa-solid ${info.icono}`} style={{ color: info.color }} aria-hidden />
                <span className="t">{info.texto}</span>
                <button type="button" className="al-mini" onClick={() => onMover(i, -1)} disabled={i === 0} aria-label="Subir bloque" title="Subir">
                  <i className="fa-solid fa-chevron-up" aria-hidden />
                </button>
                <button type="button" className="al-mini" onClick={() => onMover(i, 1)} disabled={i === programa.length - 1} aria-label="Bajar bloque" title="Bajar">
                  <i className="fa-solid fa-chevron-down" aria-hidden />
                </button>
                <button type="button" className="al-mini" onClick={() => onQuitar(i)} aria-label="Quitar bloque" title="Quitar">
                  <i className="fa-solid fa-xmark" aria-hidden />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* paleta */}
      <div className="al-banco">
        {nivel.permitidos.map((b) => {
          const info = BLOQUES_ROBOT[b];
          return (
            <button key={b} type="button" className="al-chip" disabled={lleno} onClick={() => onAgregar(b)} {...dragProps(`b:${b}`)} title={`Estructura ${info.estructura}`}>
              <i className={`fa-solid ${info.icono}`} style={{ color: info.color, width: 20, textAlign: "center" }} aria-hidden />
              <span style={{ flex: 1 }}>{info.texto}</span>
            </button>
          );
        })}
      </div>
      {lleno && <div style={{ fontSize: 14, color: AMBAR, fontWeight: 700 }}>Ya no caben más bloques. Quita alguno o usa uno que repita o decida.</div>}

      {nivel.bucle && (
        <button type="button" className="al-chip" data-sel={repetir} onClick={onRepetir} style={{ cursor: "pointer" }}>
          <i className={`fa-solid ${repetir ? "fa-square-check" : "fa-square"}`} aria-hidden />
          <span style={{ flex: 1 }}>Repetir el programa hasta llegar a la meta</span>
        </button>
      )}

      <div className="al-fila">
        <button type="button" className="al-btn" style={{ background: "#34D399", color: "#04121f", border: "none" }} onClick={onEjecutar} disabled={corriendo}>
          <i className="fa-solid fa-play" aria-hidden />
          Ejecutar
        </button>
        <button type="button" className="al-btn" onClick={onPaso} disabled={corriendo}>
          <i className="fa-solid fa-forward-step" aria-hidden />
          Un paso
        </button>
        <button type="button" className="al-btn" onClick={onLimpiar} disabled={corriendo || programa.length === 0}>
          <i className="fa-solid fa-trash" aria-hidden />
          Borrar
        </button>
      </div>

      {corrida && terminada && (
        <div className="al-resp" data-ok={corrida.fin === "meta"} role="status">
          <i className={`fa-solid ${corrida.fin === "meta" ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ marginRight: 8, color: corrida.fin === "meta" ? OK : NO }} aria-hidden />
          {corrida.motivo}
        </div>
      )}
      {corrida && !terminada && micro && (
        <div style={{ fontSize: 14, color: T.text2 }}>
          Chispa mira hacia {NOMBRE_DIR[micro.dir]}
          {micro.bloque >= 0 ? ` · bloque ${micro.bloque + 1}: ${BLOQUES_ROBOT[programa[micro.bloque]!].texto}` : ""}
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Diagrama de flujo ejecutable
 * ═══════════════════════════════════════════════════════════════════════════ */
function FlujoEscena({
  problema,
  probIdx,
  orden,
  libres,
  resultados,
  pruebaIdx,
  completados,
  onProblema,
  onPrueba,
  onAgregar,
  onQuitar,
  onMover,
  onEjecutar,
  dragProps,
  dropProps,
}: {
  problema: (typeof PROBLEMAS)[number];
  probIdx: number;
  orden: string[];
  libres: (typeof PROBLEMAS)[number]["pasos"];
  resultados: ResultadoFlujo[] | null;
  pruebaIdx: number;
  completados: Set<string>;
  onProblema: (i: number) => void;
  onPrueba: (i: number) => void;
  onAgregar: (id: string) => void;
  onQuitar: (i: number) => void;
  onMover: (i: number, d: -1 | 1) => void;
  onEjecutar: () => void;
  dragProps: (id: string) => Record<string, unknown>;
  dropProps: (onDrop: (id: string) => void) => Record<string, unknown>;
}) {
  const pruebas = pruebasDe(problema.id);
  const res = resultados ? resultados[Math.min(pruebaIdx, resultados.length - 1)]! : null;
  const todoOk = !!resultados && resultados.every((r) => r.ok);
  return (
    <>
      <div className="al-fila">
        {PROBLEMAS.map((p, i) => (
          <button key={p.id} type="button" className="al-prob" data-on={probIdx === i} data-done={completados.has(p.id)} onClick={() => onProblema(i)}>
            {completados.has(p.id) && <i className="fa-solid fa-circle-check" style={{ marginRight: 6 }} aria-hidden />}
            {p.titulo}
          </button>
        ))}
      </div>

      <div style={{ ...card, padding: "12px 14px", fontSize: 15, lineHeight: 1.45 }}>
        <strong>{problema.enunciado}</strong> Ordena los bloques y ejecuta el diagrama con datos de prueba.
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <Eyebrow>
          <i className="fa-solid fa-diagram-project" style={{ marginRight: 8 }} aria-hidden />
          Tu diagrama · {orden.length}/{problema.pasos.length} bloques
        </Eyebrow>
        <div className="al-zona" {...dropProps((id) => onAgregar(id))}>
          {orden.length === 0 && <span style={{ fontSize: 14, color: T.text3 }}>Toca o arrastra los bloques de abajo, en el orden en que crees que se ejecutan.</span>}
          {orden.map((id, i) => {
            const paso = problema.pasos.find((p) => p.id === id)!;
            const info = FORMA_INFO[paso.forma];
            const fila = res?.filas[i];
            return (
              <div key={id} className="al-paso" data-est={fila?.estado} style={{ animationDelay: res ? `${i * 70}ms` : undefined, borderRadius: paso.forma === "terminal" ? 999 : 12 }}>
                <span style={{ width: 24, height: 24, borderRadius: "50%", background: `${info.color}33`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, flexShrink: 0 }}>{i + 1}</span>
                <i className={`fa-solid ${info.icono}`} style={{ color: info.color }} aria-hidden />
                <span className="t">
                  {paso.texto}
                  {fila && fila.estado !== "pend" && <small>{fila.nota}</small>}
                </span>
                {fila && fila.estado !== "pend" && (
                  <i
                    className={`fa-solid ${fila.estado === "ok" ? "fa-circle-check" : fila.estado === "error" ? "fa-circle-xmark" : "fa-forward"}`}
                    style={{ color: fila.estado === "ok" ? OK : fila.estado === "error" ? NO : T.text3 }}
                    aria-hidden
                  />
                )}
                <button type="button" className="al-mini" onClick={() => onMover(i, -1)} disabled={i === 0} aria-label="Subir bloque" title="Subir">
                  <i className="fa-solid fa-chevron-up" aria-hidden />
                </button>
                <button type="button" className="al-mini" onClick={() => onMover(i, 1)} disabled={i === orden.length - 1} aria-label="Bajar bloque" title="Bajar">
                  <i className="fa-solid fa-chevron-down" aria-hidden />
                </button>
                <button type="button" className="al-mini" onClick={() => onQuitar(i)} aria-label="Quitar bloque" title="Quitar">
                  <i className="fa-solid fa-xmark" aria-hidden />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {libres.length > 0 ? (
        <div className="al-banco">
          {libres.map((p) => {
            const info = FORMA_INFO[p.forma];
            return (
              <button key={p.id} type="button" className="al-chip" onClick={() => onAgregar(p.id)} {...dragProps(p.id)} title={info.label}>
                <i className={`fa-solid ${info.icono}`} style={{ color: info.color, width: 20, textAlign: "center" }} aria-hidden />
                <span style={{ flex: 1 }}>{p.texto}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div style={{ fontSize: 14, color: OK, fontWeight: 700 }}>
          <i className="fa-solid fa-circle-check" aria-hidden /> Colocaste todos los bloques. Ahora ejecútalo.
        </div>
      )}

      <div className="al-fila">
        <button type="button" className="al-btn" style={{ background: "#34D399", color: "#04121f", border: "none" }} onClick={onEjecutar} disabled={orden.length === 0}>
          <i className="fa-solid fa-play" aria-hidden />
          Ejecutar el diagrama
        </button>
        {resultados &&
          pruebas.map((p, i) => (
            <button key={p.etiqueta} type="button" className="al-prob" data-on={pruebaIdx === i} data-done={resultados[i]?.ok} onClick={() => onPrueba(i)}>
              <i className={`fa-solid ${resultados[i]?.ok ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ marginRight: 6, color: resultados[i]?.ok ? OK : NO }} aria-hidden />
              {p.etiqueta}
            </button>
          ))}
      </div>

      {res && (
        <>
          <div className="al-vars" aria-label="Variables">
            {res.vars.length === 0 && <span>sin datos todavía</span>}
            {res.vars.map(([k, v], i) => (
              <span key={`${k}${i}`}>
                {k} = {v}
              </span>
            ))}
            <span style={{ borderColor: res.salida ? OK : T.line }}>salida: {res.salida ?? "—"}</span>
          </div>
          <div className="al-resp" data-ok={todoOk} role="status">
            <i className={`fa-solid ${todoOk ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ marginRight: 8, color: todoOk ? OK : NO }} aria-hidden />
            {todoOk ? "El algoritmo funciona con todos los datos de prueba." : res.error ?? "Revisa las pruebas marcadas."}
          </div>
        </>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Panel «Clasifica los operadores»
 * ═══════════════════════════════════════════════════════════════════════════ */
function OperadoresPanel({
  ubicOp,
  selOp,
  shakeBin,
  opLibres,
  onSelOp,
  onBin,
  onDropBin,
  dragProps,
  dropProps,
}: {
  ubicOp: Record<string, TipoOp>;
  selOp: string | null;
  shakeBin: TipoOp | null;
  opLibres: typeof OPERADORES;
  onSelOp: (id: string) => void;
  onBin: (tipo: TipoOp) => void;
  onDropBin: (opId: string, tipo: TipoOp) => void;
  dragProps: (id: string) => Record<string, unknown>;
  dropProps: (onDrop: (id: string) => void) => Record<string, unknown>;
}) {
  const tipos: TipoOp[] = ["aritmetico", "relacional", "logico"];
  const colocados = Object.keys(ubicOp).length;
  return (
    <Mesa>
      <div style={{ ...card, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
          <Eyebrow>Arrastra cada operador a su caja</Eyebrow>
          <span style={{ fontSize: 14, fontWeight: 800, color: colocados >= OPERADORES.length ? OK : T.text3 }}>{colocados}/{OPERADORES.length}</span>
        </div>
        {opLibres.length === 0 ? (
          <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
            <i className="fa-solid fa-circle-check" /> ¡Clasificaste los 11 operadores!
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {opLibres.map((op) => (
              <button key={op.id} className="al-opchip" data-sel={selOp === op.id} onClick={() => onSelOp(op.id)} {...dragProps(op.id)}>
                {op.simbolo}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 14 }} className="al-bins">
        {tipos.map((tipo) => {
          const info = OP_INFO[tipo];
          const dentro = OPERADORES.filter((o) => ubicOp[o.id] === tipo);
          return (
            <div
              key={tipo}
              className="al-bin"
              data-shake={shakeBin === tipo}
              onClick={() => onBin(tipo)}
              {...dropProps((opId) => onDropBin(opId, tipo))}
              style={{ borderColor: `${info.color}66`, background: `${info.color}0d`, cursor: selOp ? "pointer" : "default" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
                <span style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#fff", background: `${info.color}33` }}>
                  <i className={`fa-solid ${info.icono}`} />
                </span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>{info.label}</div>
                  <div style={{ fontSize: 14, color: T.text3 }}>{info.descripcion}</div>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {dentro.map((op) => (
                  <span key={op.id} style={{ animation: "alPop .25s ease", display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 34, padding: "6px 9px", borderRadius: 8, fontSize: 15, fontWeight: 900, color: "#fff", background: `${info.color}26`, border: `1px solid ${info.color}55` }}>
                    {op.simbolo}
                  </span>
                ))}
                {dentro.length === 0 && <span style={{ fontSize: 14, color: T.text3, fontStyle: "italic" }}>Vacío</span>}
              </div>
            </div>
          );
        })}
      </div>
    </Mesa>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Panel «Estructuras de control»
 * ═══════════════════════════════════════════════════════════════════════════ */
function EstructurasPanel({
  accent,
  rgba,
  empar,
  selEstr,
  shakeEsc,
  estrLibres,
  onSelEstr,
  onEsc,
  onDropEsc,
  dragProps,
  dropProps,
}: {
  accent: string;
  rgba: string;
  empar: Record<string, string>;
  selEstr: string | null;
  shakeEsc: string | null;
  estrLibres: typeof ESTRUCTURAS;
  onSelEstr: (id: string) => void;
  onEsc: (escId: string) => void;
  onDropEsc: (estrId: string, escId: string) => void;
  dragProps: (id: string) => Record<string, unknown>;
  dropProps: (onDrop: (id: string) => void) => Record<string, unknown>;
}) {
  return (
    <Mesa>
      <div style={{ ...card, padding: "18px 22px" }}>
        <Eyebrow>Estructuras de control</Eyebrow>
        {estrLibres.length === 0 ? (
          <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
            <i className="fa-solid fa-circle-check" /> ¡Emparejaste las 3 estructuras!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {estrLibres.map((e) => (
              <button key={e.id} className="al-chip" data-sel={selEstr === e.id} onClick={() => onSelEstr(e.id)} {...dragProps(e.id)}>
                <span style={{ width: 28, height: 28, flexShrink: 0, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: accent, background: `rgba(${rgba},0.16)` }}>
                  <i className="fa-solid fa-sitemap" />
                </span>
                <span style={{ flex: 1, fontSize: 14 }}>{e.texto}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ ...card, padding: "20px 24px" }}>
        <Eyebrow>
          <i className="fa-solid fa-code-branch" style={{ marginRight: 8, color: accent }} />
          Situaciones — arrastra a cada una su estructura
        </Eyebrow>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {ESCENARIOS.map((esc) => {
            const estrId = empar[esc.id];
            const resuelto = !!estrId;
            const estr = estrId ? ESTRUCTURAS.find((e) => e.id === estrId) : null;
            return (
              <div
                key={esc.id}
                {...dropProps((eid) => onDropEsc(eid, esc.id))}
                onClick={() => !resuelto && onEsc(esc.id)}
                style={{
                  borderRadius: 14,
                  border: `1.5px ${resuelto ? "solid" : "dashed"} ${resuelto ? OK : selEstr ? accent : T.lineStrong}`,
                  background: resuelto ? `${OK}12` : selEstr ? `rgba(${rgba},0.08)` : T.inset,
                  padding: "13px 16px",
                  cursor: resuelto ? "default" : selEstr ? "pointer" : "default",
                  animation: shakeEsc === esc.id ? "alShake .4s" : undefined,
                  transition: "all .16s",
                }}
              >
                <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                  <i className={`fa-solid ${resuelto ? "fa-circle-check" : "fa-circle-question"}`} style={{ color: resuelto ? OK : accent, fontSize: 16, marginTop: 2 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{esc.texto}</div>
                    {resuelto && estr ? (
                      <div style={{ animation: "alPop .25s ease", marginTop: 8, fontSize: 14, color: "#fff", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 11px", borderRadius: 9, background: `${OK}26`, border: `1px solid ${OK}55` }}>
                        <i className="fa-solid fa-arrow-right-long" style={{ opacity: 0.7 }} />
                        {estr.texto.split(":")[0]}
                      </div>
                    ) : (
                      <div style={{ marginTop: 6, fontSize: 14, color: T.text3, fontStyle: "italic" }}>Suelta aquí la estructura.</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Mesa>
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
        Cinco preguntas sobre algoritmos, variables, operadores y estructuras de control. Responde y pulsa «Comprobar».
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
                    <button key={oi} className="al-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="al-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="al-btn" onClick={reintentar}>
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
