"use client";

/**
 * Laboratorio — Anatomía de una exposición oral.
 * Práctica interactiva para LC-I-P08 (Lengua y Comunicación I, 1.er semestre):
 * «Identifica las características de una exposición oral para conocer su
 * desarrollo y ponerlo en práctica.»
 *
 * Por qué NO es un laboratorio 3D: lo que hay que enseñar aquí no es un objeto
 * en el espacio, es cómo está armada por dentro una exposición y en qué orden
 * se construye. Eso se ve en el guion, en el reloj y en el texto; una escena
 * tridimensional sería decoración. DOM puro: ligero y accesible con ratón,
 * teclado y pantalla táctil.
 *
 * Cinco modos, y ninguno es un repaso de características sueltas:
 *  1. «Mesa de montaje» — arma el guion pieza por pieza en el orden en que
 *     tendría que ocurrir y después le quita cada pieza para ver qué se rompe
 *     sin ella.
 *  2. «El reloj» — reparte los segundos entre introducción, desarrollo,
 *     conclusión y preguntas contra una duración fija, hasta descubrir que el
 *     desarrollo se come el cierre.
 *  3. «¿Qué apoyo para este momento?» — decide el apoyo visual de cinco
 *     momentos y lee por qué los otros dos no sirven ahí.
 *  4. «Escribe el término» — el glosario A5, escrito de memoria.
 *  5. «Completa el texto» — los huecos verbatim de A6.
 *  + Clínica de exposiciones (diagnóstico), hechos verdadero/falso (A4), la
 *    mesa de debate (A7) y el reto evaluable (A2).
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, NUM, card, Eyebrow } from "./_kit";
import { LabShell, Bloque, BotonHerramienta, Mesa, Dato, Deslizador } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { ANATOMIA_EXPOSICION_HUECOS } from "./anatomia-exposicion-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { ANATOMIA_EXPOSICION_FICHA } from "./anatomia-exposicion-ficha";
import {
  PIEZAS,
  PARTE_INFO,
  BLOQUES,
  ESCENARIOS_TIEMPO,
  PALABRAS_POR_MINUTO,
  APOYOS,
  CLINICA,
  GLOSARIO,
  HECHOS,
  DEBATE,
  CONSIGNA_A3,
  COMPRENSION_A1,
  DATO_FIL,
  RETO_QUIZ,
  type Parte,
  type BloqueId,
  type BloqueTiempo,
  type EscenarioTiempo,
  type PiezaGuion,
} from "./anatomia-exposicion-data";
import { FondoTermino, VinetaTermino } from "./_vineta";
import { AuditorioEscena, CurvaAtencion, OpcionesSim } from "./AnatomiaAuditorio";
import {
  ELECCION_INICIAL,
  MOMENTOS,
  OPC_APERTURA,
  OPC_MIRADA,
  OPC_APOYO,
  OPC_CIERRE,
  PUBLICO,
  curvaAtencion,
  estadoPersona,
  reaccion,
  recuerdo,
  type EleccionSim,
} from "./anatomia-exposicion-sim";

const NO = "#FF5E5E";
const RETO_KEY = "cen-anatomia-exposicion-oral-reto";

type Modo = "auditorio" | "guion" | "reloj" | "apoyos" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "auditorio", label: "Da la exposición", icono: "fa-person-chalkboard" },
  { id: "guion", label: "Mesa de montaje", icono: "fa-clone" },
  { id: "reloj", label: "El reloj", icono: "fa-stopwatch" },
  { id: "apoyos", label: "¿Qué apoyo para este momento?", icono: "fa-image" },
  { id: "glosario", label: "Escribe el término", icono: "fa-spell-check" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

const PARTES_ORDEN: Parte[] = ["introduccion", "desarrollo", "conclusion", "despues"];

/** Palabras de verdad: se ignoran los espacios de sobra y los saltos de línea. */
function cuentaPalabras(s: string): number {
  const limpio = s.trim();
  return limpio === "" ? 0 : limpio.split(/\s+/).length;
}

/** 185 → «3:05». Los segundos sueltos se escriben con dos cifras. */
function reloj(segundos: number): string {
  const s = Math.max(0, Math.round(segundos));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

/** Segundos mínimos y máximos que este laboratorio recomienda para un bloque. */
function segMin(b: BloqueTiempo, total: number): number {
  return Math.ceil((b.min / 100) * total);
}
function segMax(b: BloqueTiempo, total: number): number {
  return Math.floor((b.max / 100) * total);
}

type Reparto = Record<BloqueId, number>;

function repartoInicial(esc: EscenarioTiempo): Reparto {
  const cuarto = Math.round(esc.segundos / 4 / esc.paso) * esc.paso;
  return { apertura: cuarto, desarrollo: cuarto, cierre: cuarto, preguntas: esc.segundos - cuarto * 3 };
}

function sumaReparto(r: Reparto): number {
  return BLOQUES.reduce((acc, b) => acc + r[b.id], 0);
}

function repartoValido(r: Reparto, total: number): boolean {
  if (sumaReparto(r) !== total) return false;
  return BLOQUES.every((b) => r[b.id] >= segMin(b, total) && r[b.id] <= segMax(b, total));
}

export function LabAnatomiaExposicion({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("auditorio");

  // ── sonido y partida ──────────────────────────────────────────────────
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

  // ── modo 1: mesa de montaje ───────────────────────────────────────────
  const [guionPos, setGuionPos] = useState(0);
  const [selPieza, setSelPieza] = useState<string | null>(null);
  const [shakeParte, setShakeParte] = useState<Parte | null>(null);
  const [probadas, setProbadas] = useState<Record<string, boolean>>({});
  const [piezaAbierta, setPiezaAbierta] = useState<string | null>(null);

  const guionDone = guionPos >= PIEZAS.length;
  const roturasDone = Object.keys(probadas).length >= PIEZAS.length;
  const piezasLibres = PIEZAS.filter((p) => p.orden >= guionPos)
    .slice()
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  const intentarPieza = (id: string) => {
    if (guionPos >= PIEZAS.length) return;
    const esperada = PIEZAS[guionPos]!;
    if (id === esperada.id) {
      setGuionPos((p) => p + 1);
      setSelPieza(null);
      sfxPlace(`${esperada.nombre}. ${esperada.funcion}`);
      if (guionPos + 1 >= PIEZAS.length) {
        sfxOk();
        setPie({ ok: true, txt: "Guion completo. Ahora toca cada pieza para quitarla del guion y ver qué se rompe sin ella." });
      }
    } else {
      const fallida = PIEZAS.find((p) => p.id === id);
      setShakeParte(esperada.parte);
      sfxNo(
        fallida
          ? `«${fallida.nombre}» todavía no: antes tiene que ir «${esperada.nombre}», porque ${esperada.funcion.charAt(0).toLowerCase()}${esperada.funcion.slice(1)}`
          : "Esa pieza no va todavía."
      );
      window.setTimeout(() => setShakeParte(null), 420);
    }
  };

  const quitarPieza = (id: string) => {
    const p = PIEZAS.find((x) => x.id === id);
    if (!p) return;
    setPiezaAbierta((v) => (v === id ? null : id));
    if (!probadas[id]) {
      setProbadas((prev) => ({ ...prev, [id]: true }));
      if (Object.keys(probadas).length + 1 >= PIEZAS.length) sfxOk();
    }
    setPie({ ok: false, txt: `Sin «${p.nombre}»: ${p.falta}` });
  };

  const resetGuion = () => {
    setGuionPos(0);
    setSelPieza(null);
    setProbadas({});
    setPiezaAbierta(null);
    setPie(null);
  };

  // ── modo 2: el reloj ──────────────────────────────────────────────────
  const [escIdx, setEscIdx] = useState(0);
  const escenario = ESCENARIOS_TIEMPO[escIdx] ?? ESCENARIOS_TIEMPO[0]!;
  const [reparto, setReparto] = useState<Reparto>(() => repartoInicial(ESCENARIOS_TIEMPO[0]!));
  const [relojOk, setRelojOk] = useState<Record<string, boolean>>({});
  const [desbordeVisto, setDesbordeVisto] = useState(false);
  const [ensayo, setEnsayo] = useState(false);

  const suma = sumaReparto(reparto);
  const sobra = suma - escenario.segundos;
  const palabrasCaben = Math.round(
    ((reparto.apertura + reparto.desarrollo + reparto.cierre) / 60) * PALABRAS_POR_MINUTO
  );
  const relojDone = ESCENARIOS_TIEMPO.every((e) => relojOk[e.id]);

  const ajustar = (id: BloqueId, valor: number) => {
    const siguiente: Reparto = { ...reparto, [id]: valor };
    setReparto(siguiente);
    const total = escenario.segundos;
    const bloque = BLOQUES.find((b) => b.id === id)!;

    if (id === "desarrollo" && valor > segMax(bloque, total)) {
      setDesbordeVisto(true);
      const resto = total - valor;
      setPie({
        ok: false,
        txt: `El desarrollo se está comiendo lo que viene después: con ${reloj(valor)} para los tres puntos sólo quedan ${reloj(Math.max(0, resto))} para la introducción, la conclusión y las preguntas juntas. En el salón esto termina igual que siempre: te avisan que se acabó el tiempo a media idea y la exposición se queda sin cierre.`,
      });
    }

    if (repartoValido(siguiente, total)) {
      if (!relojOk[escenario.id]) {
        setRelojOk((prev) => ({ ...prev, [escenario.id]: true }));
        sfxPlace(
          `Reparto viable para ${reloj(total)}: el desarrollo es la parte central y la conclusión conserva su rato. A ese ritmo caben unas ${Math.round(((siguiente.apertura + siguiente.desarrollo + siguiente.cierre) / 60) * PALABRAS_POR_MINUTO)} palabras habladas.`
        );
        sfxOk();
      }
    }
  };

  const cambiarEscenario = (i: number) => {
    const esc = ESCENARIOS_TIEMPO[i];
    if (!esc) return;
    setEscIdx(i);
    setReparto(repartoInicial(esc));
    setEnsayo(false);
    setPie({ ok: true, txt: `${esc.nombre}: ${esc.nota}` });
  };

  const resetReloj = () => {
    setReparto(repartoInicial(escenario));
    setRelojOk({});
    setDesbordeVisto(false);
    setEnsayo(false);
    setPie(null);
  };

  // ── modo 3: apoyos visuales ───────────────────────────────────────────
  // Se guardan TODAS las opciones probadas, no sólo la última: el modo promete
  // que se lee por qué las otras no sirven, y si la explicación desapareciera
  // al acertar, esa lectura se perdería justo cuando se entiende.
  const [apoyoSel, setApoyoSel] = useState<Record<string, number[]>>({});
  const [apoyoOk, setApoyoOk] = useState<Record<string, boolean>>({});
  const [shakeApoyo, setShakeApoyo] = useState<string | null>(null);
  const apoyosDone = Object.keys(apoyoOk).length >= APOYOS.length;

  const elegirApoyo = (casoId: string, i: number) => {
    const caso = APOYOS.find((c) => c.id === casoId);
    if (!caso || apoyoOk[casoId]) return;
    const op = caso.opciones[i];
    if (!op) return;
    setApoyoSel((prev) => {
      const ya = prev[casoId] ?? [];
      return ya.includes(i) ? prev : { ...prev, [casoId]: [...ya, i] };
    });
    if (i === caso.correcta) {
      setApoyoOk((prev) => ({ ...prev, [casoId]: true }));
      sfxPlace(op.porque);
      if (Object.keys(apoyoOk).length + 1 >= APOYOS.length) sfxOk();
    } else {
      setShakeApoyo(casoId);
      sfxNo(op.porque);
      window.setTimeout(() => setShakeApoyo(null), 420);
    }
  };

  const resetApoyos = () => {
    setApoyoSel({});
    setApoyoOk({});
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

  // ── clínica de exposiciones ───────────────────────────────────────────
  const [clinica, setClinica] = useState<(number | null)[]>(() => CLINICA.map(() => null));
  const clinicaAciertos = clinica.filter((v, i) => v !== null && v === CLINICA[i]!.correcta).length;
  const clinicaDone = clinicaAciertos >= CLINICA.length;
  const responderClinica = (i: number, op: number) => {
    const caso = CLINICA[i]!;
    if (clinica[i] === caso.correcta) return;
    setClinica((prev) => prev.map((v, j) => (j === i ? op : v)));
    if (op === caso.correcta) sfxPlace(caso.retro);
    else sfxNo(caso.retro);
  };

  // ── hechos (A4) ───────────────────────────────────────────────────────
  const [hechos, setHechos] = useState<(boolean | null)[]>(() => HECHOS.map(() => null));
  const hechosDone = hechos.filter((h, i) => h !== null && h === HECHOS[i]!.respuesta).length >= HECHOS.length;
  const responderHecho = (i: number, valor: boolean) => {
    const h = HECHOS[i]!;
    if (hechos[i] === h.respuesta) return;
    setHechos((prev) => prev.map((v, j) => (j === i ? valor : v)));
    if (valor === h.respuesta) sfxPlace(h.retro);
    else sfxNo(h.retro);
  };

  // ── debate (A7) ───────────────────────────────────────────────────────
  const [postura, setPostura] = useState<string | null>(null);
  const [argumento, setArgumento] = useState("");
  const [puntoValido, setPuntoValido] = useState<string | null>(null);
  const argumentoDone = postura !== null && cuentaPalabras(argumento) >= DEBATE.minimoPalabras;
  const debateDone = argumentoDone && puntoValido !== null;

  // ── reto evaluable (A2) ───────────────────────────────────────────────
  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── modo 0: da la exposición (simulador del auditorio) ───────────────
  const [sim, setSim] = useState<EleccionSim>(ELECCION_INICIAL);
  const [momento, setMomento] = useState(3);
  const [atencionOk, setAtencionOk] = useState(false);
  const [rapidoVisto, setRapidoVisto] = useState(false);
  const [lentoVisto, setLentoVisto] = useState(false);
  const curva = curvaAtencion(sim);
  const atencionAhora = curva[Math.min(momento, curva.length - 1)]!;
  const atencionFin = curva[curva.length - 1]!;
  const recuerdoPct = recuerdo(sim);
  const atentos = PUBLICO.filter((p) => estadoPersona(atencionAhora, p) === "atento").length;
  const notaRitmo = (v: number) =>
    v > 170
      ? "Hablas tan rápido que el público no alcanza a procesar: recordará menos aunque te escuche."
      : v < 100
        ? "Hablas tan lento que la mente del público se va a otro lado y la atención se cae."
        : v >= 120 && v <= 150
          ? "Ritmo cómodo: el público puede seguirte y pensar lo que dices."
          : "Estás cerca del rango cómodo (120 a 150 ppm); acércate un poco más.";

  const cambiarSim = (parcial: Partial<EleccionSim>, nota?: string) => {
    const antes = curvaAtencion(sim);
    const sig: EleccionSim = { ...sim, ...parcial };
    const despues = curvaAtencion(sig);
    const a = Math.round(antes[antes.length - 1]! * 100);
    const d = Math.round(despues[despues.length - 1]! * 100);
    setSim(sig);
    if (d >= 70) setAtencionOk(true);
    if (sig.ritmo >= 180) setRapidoVisto(true);
    if (sig.ritmo <= 90) setLentoVisto(true);
    setPie({ ok: d >= a, txt: `${nota ?? ""} La atención al final pasó de ${a} % a ${d} % (simulación).`.trim() });
    if (d > a && sonido) audioRef.current?.blip();
  };

  const resetAuditorio = () => {
    setSim(ELECCION_INICIAL);
    setMomento(3);
    setAtencionOk(false);
    setRapidoVisto(false);
    setLentoVisto(false);
    setPie(null);
  };

  // ── objetivos de la sesión ────────────────────────────────────────────
  const objetivos = [
    { txt: "Logra que al final atienda 70 % del público", done: atencionOk },
    { txt: "Habla muy rápido y muy lento y mira qué pasa", done: rapidoVisto && lentoVisto },
    { txt: "Arma el guion con las 7 piezas en orden", done: guionDone },
    { txt: "Quita cada pieza y descubre qué se rompe", done: roturasDone },
    { txt: "Reparte el tiempo de los 2 escenarios", done: relojDone },
    { txt: "Comprueba qué pasa si el desarrollo se desborda", done: desbordeVisto },
    { txt: "Elige el apoyo correcto en los 5 momentos", done: apoyosDone },
    { txt: "Escribe los 5 términos del glosario", done: glosarioDone },
    { txt: "Completa el texto de las etapas (A6)", done: textoDone },
    { txt: "Diagnostica las 4 exposiciones de la clínica", done: clinicaDone },
    { txt: "Acierta los 5 hechos verdadero o falso", done: hechosDone },
    { txt: "Toma postura y sostén tu argumento", done: debateDone },
    { txt: "Aprueba el reto evaluable (70 %)", done: quizAprobado },
  ];

  const resetActual =
    modo === "auditorio"
      ? resetAuditorio
      : modo === "guion"
        ? resetGuion
      : modo === "reloj"
        ? resetReloj
        : modo === "apoyos"
          ? resetApoyos
          : modo === "glosario"
            ? resetGlosario
            : resetTexto;

  // arrastre nativo (ratón) + clic para seleccionar y clic para colocar (táctil)
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

  const lectura =
    modo === "auditorio"
      ? `Atención ${Math.round(atencionAhora * 100)} %: ${atentos} de ${PUBLICO.length} te siguen`
      : modo === "guion"
        ? `Guion: ${guionPos} de ${PIEZAS.length} piezas`
        : modo === "reloj"
          ? sobra === 0
            ? `Cabe exacto en ${reloj(escenario.segundos)}`
            : sobra > 0
              ? `Te pasas ${reloj(sobra)}`
              : `Te sobran ${reloj(-sobra)}`
          : modo === "apoyos"
            ? `Apoyos resueltos: ${Object.keys(apoyoOk).length} de ${APOYOS.length}`
            : undefined;

  const pieEl = (
    <div
      role="status"
      aria-live="polite"
      style={{
        borderRadius: 14,
        border: `1px solid ${pie ? (pie.ok ? `${OK}55` : `${NO}55`) : T.line}`,
        background: pie ? (pie.ok ? `${OK}12` : `${NO}12`) : T.glass,
        padding: "13px 16px",
        fontSize: 14,
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
        {pie ? pie.txt : "Aquí aparece la explicación de cada movimiento: por qué cambia la atención del público, por qué esa pieza va en ese lugar y qué pasa cuando el reloj no alcanza."}
      </span>
    </div>
  );

  const consejo: Record<Modo, ReactNode> = {
    auditorio: (
      <>
        Cambia una decisión a la vez y mira al público: cada una mueve la atención. Los resultados son una <strong style={{ color: T.text }}>simulación</strong> con
        personas ficticias.
      </>
    ),
    guion: (
      <>
        Una exposición no es una lista de temas, es una <strong style={{ color: T.text }}>secuencia</strong>: cada pieza prepara a la siguiente. Colócalas en
        el orden en que tendrían que ocurrir y después quítalas una por una para ver de qué se hacía cargo cada una.
      </>
    ),
    reloj: (
      <>
        El tiempo es lo único que no se puede estirar. Mueve los deslizadores hasta que la suma dé exactamente{" "}
        <strong style={{ color: T.text }}>{reloj(escenario.segundos)}</strong> y cada parte quede dentro de su banda.
      </>
    ),
    apoyos: (
      <>
        El apoyo visual <strong style={{ color: T.text }}>refuerza</strong> el mensaje oral; no lo repite ni lo sustituye. Pregúntate qué forma tiene lo que vas
        a decir.
      </>
    ),
    glosario: (
      <>
        Recordar el término es más difícil —y enseña más— que reconocerlo entre opciones. Si te atoras, usa la pista o abre el{" "}
        <strong style={{ color: T.text }}>banco de términos</strong>.
      </>
    ),
    texto: (
      <>
        Lee el párrafo completo antes de escribir: el contexto decide la palabra. Pulsa <strong style={{ color: T.text }}>Enter</strong> para comprobar cada
        hueco.
      </>
    ),
  };

  const controles =
    modo === "auditorio" ? (
      <>
        <Bloque titulo="Resultado (simulación)" icono="fa-chart-line">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
            <Dato label="Atención al final" value={`${Math.round(atencionFin * 100)} %`} col={atencionFin >= 0.7 ? OK : undefined} />
            <Dato label="Lo recordarán" value={`${recuerdoPct} %`} />
          </div>
        </Bloque>
        <Bloque titulo="1 · Cómo abres" icono="fa-door-open">
          <OpcionesSim lista={OPC_APERTURA} actual={sim.apertura} cambiar={(id) => cambiarSim({ apertura: id }, OPC_APERTURA.find((o) => o.id === id)!.nota)} grupo="apertura" />
        </Bloque>
        <Bloque titulo="2 · A qué ritmo hablas" icono="fa-gauge-high">
          <Deslizador
            label="Palabras por minuto"
            icon="fa-microphone"
            colr="#5BC8FF"
            valor={`${sim.ritmo} ppm`}
            min={70}
            max={220}
            step={5}
            value={sim.ritmo}
            onChange={(v) => cambiarSim({ ritmo: v }, notaRitmo(v))}
            hintL="muy lento"
            hintR="muy rápido"
          />
          <div style={{ fontSize: 14, color: T.text2 }}>El rango cómodo para hablar en público va de 120 a 150 ppm.</div>
        </Bloque>
        <Bloque titulo="3 · Hacia dónde miras" icono="fa-eye">
          <OpcionesSim lista={OPC_MIRADA} actual={sim.mirada} cambiar={(id) => cambiarSim({ mirada: id }, OPC_MIRADA.find((o) => o.id === id)!.nota)} grupo="mirada" />
        </Bloque>
        <Bloque titulo="4 · Qué muestras" icono="fa-display">
          <OpcionesSim lista={OPC_APOYO} actual={sim.apoyo} cambiar={(id) => cambiarSim({ apoyo: id }, OPC_APOYO.find((o) => o.id === id)!.nota)} grupo="apoyo" />
        </Bloque>
        <Bloque titulo="5 · Cómo cierras" icono="fa-flag-checkered">
          <OpcionesSim lista={OPC_CIERRE} actual={sim.cierre} cambiar={(id) => cambiarSim({ cierre: id }, OPC_CIERRE.find((o) => o.id === id)!.nota)} grupo="cierre" />
        </Bloque>
      </>
    ) : (
      <Bloque titulo="Qué practicas aquí" icono="fa-lightbulb">
        <div style={{ color: T.text2, lineHeight: 1.55 }}>{consejo[modo]}</div>
        <div style={{ color: T.text3, fontSize: 14 }}>Para ver el efecto en un público ilustrado, entra a «Da la exposición».</div>
      </Bloque>
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
          <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar este modo" onClick={resetActual} />
        </>
      }
      lectura={lectura}
      objetivos={objetivos}
      pestanas={[
        { id: "controles", etiqueta: "Controles", icono: "fa-sliders", contenido: controles },
        {
          id: "casos",
          etiqueta: "Casos",
          icono: "fa-stethoscope",
          contenido: (
            <>
              <ClinicaCard accent={accent} respuestas={clinica} onResponder={responderClinica} />
              <HechosCard accent={accent} respuestas={hechos} onResponder={responderHecho} />
              <DebateCard
                accent={accent}
                rgba={color.rgba}
                postura={postura}
                argumento={argumento}
                puntoValido={puntoValido}
                onPostura={(id) => {
                  setPostura(id);
                  setPuntoValido(null);
                }}
                onArgumento={setArgumento}
                onPuntoValido={(txt) => {
                  setPuntoValido(txt);
                  setPie({ ok: true, txt: "Reconocer un punto válido de la postura contraria no es perder el debate: es la parte de A7 que pide proponer en qué situaciones conviene cada forma." });
                }}
              />
            </>
          ),
        },
        {
          id: "reto",
          etiqueta: "Reto",
          icono: "fa-trophy",
          contenido: (
            <RetoQuizCard
              quiz={RETO_QUIZ}
              accent={accent}
              rgba={color.rgba}
              aprobado={quizAprobado}
              onAprobado={() => setQuizAprobado(true)}
              playSfx={sonido ? (ok) => (ok ? sfxOk() : sfxNo()) : undefined}
              mensajeAprobado="Conoces la anatomía de una exposición: sus fases, sus partes y lo que sostiene cada una."
            />
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="Ficha teórica" icono="fa-book-open">
                <FichaTeorica data={ANATOMIA_EXPOSICION_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <Bloque titulo="La tarea que viene · A3" icono="fa-pen-nib">
                <p style={{ margin: 0, color: T.text2, lineHeight: 1.6 }}>{CONSIGNA_A3.prompt}</p>
                {CONSIGNA_A3.pistas.map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: 9, color: T.text2, lineHeight: 1.5 }}>
                    <i className="fa-solid fa-angle-right" style={{ color: accent, marginTop: 5 }} />
                    <span>{p}</span>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Lectura A1 · para pensar" icono="fa-book-open-reader">
                {COMPRENSION_A1.map((c, i) => (
                  <details key={i} style={{ borderRadius: 11, border: `1px solid ${T.line}`, background: T.inset, padding: "10px 13px" }}>
                    <summary style={{ cursor: "pointer", fontWeight: 700, color: T.text2, lineHeight: 1.45 }}>{c.pregunta}</summary>
                    <p style={{ margin: "9px 0 0", color: T.text3, lineHeight: 1.5 }}>{c.guia}</p>
                  </details>
                ))}
              </Bloque>
              <Bloque titulo="¿Sabías?" icono="fa-circle-info">
                <p style={{ margin: 0, color: T.text2, lineHeight: 1.55 }}>{DATO_FIL}</p>
              </Bloque>
              <Bloque titulo="Qué es verbatim y qué es de este laboratorio" icono="fa-quote-right">
                <p style={{ margin: 0, color: T.text3, lineHeight: 1.6 }}>
                  <strong style={{ color: T.text2 }}>Verbatim de la progresión LC-I-P08:</strong> la lectura, su callout «¿Sabías?» y sus preguntas de
                  comprensión (A1), el reto evaluable (A2), la consigna y las pistas de la mini-exposición de tres minutos (A3), los hechos
                  verdadero/falso (A4), el glosario (A5), el texto con huecos (A6) y el debate con sus posturas y argumentos guía (A7).{" "}
                  <strong style={{ color: T.text2 }}>Escrito para este laboratorio (ilustrativo):</strong> el auditorio simulado (público ficticio y cifras de
                  simulación), las siete piezas del guion y su exposición de demostración sobre el cuidado del agua en la colonia, las bandas de tiempo
                  recomendadas, el escenario de diez minutos, las cinco decisiones de apoyo visual y los cuatro casos de la clínica. Las personas y los
                  salones son ficticios. El ritmo de {PALABRAS_POR_MINUTO} palabras por minuto es una estimación para calcular cuánto texto cabe en un
                  tiempo; no es un dato de la progresión. En el debate no hay respuesta correcta: el laboratorio no califica tu postura, solo te pide
                  sostenerla y reconocer un punto válido de la contraria.
                </p>
              </Bloque>
            </>
          ),
        },
      ]}
      escena={
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <style>{`
        @keyframes aexShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes aexPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        @keyframes aexBarrido { 0%{left:0;} 100%{left:100%;} }
        .aex-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 16px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:800; transition:all .14s; }
        .aex-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .aex-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .aex-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .aex-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .aex-icobtn:hover { background:rgba(255,255,255,0.12); }
        .aex-chip { cursor:grab; display:flex; align-items:flex-start; gap:10px; padding:11px 15px; border-radius:14px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:700; transition:all .14s;
          user-select:none; text-align:left; line-height:1.45; width:100%; }
        .aex-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); transform:translateY(-2px); }
        .aex-chip[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; transform:translateY(-3px) scale(1.02); }
        .aex-chip:active { cursor:grabbing; }
        .aex-mazo { display:grid; grid-template-columns:repeat(auto-fill, minmax(min(100%, 230px), 1fr)); gap:10px; align-items:stretch; }
        .aex-bin { border-radius:16px; border:1.5px solid ${T.line}; background:${T.glass}; padding:15px; transition:all .16s; }
        .aex-bin[data-shake="true"] { animation:aexShake .4s; border-color:${NO}; }
        .aex-row { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:15px 17px; transition:all .16s; }
        .aex-row[data-shake="true"] { animation:aexShake .4s; border-color:${NO}; }
        .aex-row[data-done="true"] { border-color:${OK}66; }
        .aex-slot { border-radius:12px; border:1.5px dashed ${T.lineStrong}; background:${T.inset}; min-height:54px; padding:9px 12px;
          display:flex; align-items:center; gap:10px; color:${T.text3}; font-size:14px; transition:all .16s; }
        .aex-slot[data-armed="true"] { border-color:${accent}; background:rgba(${color.rgba},0.1); cursor:pointer; }
        .aex-pieza { cursor:pointer; width:100%; text-align:left; border-radius:12px; border:1.5px solid ${OK}66; background:${OK}14;
          color:#fff; font-size:14px; font-weight:700; padding:10px 13px; line-height:1.45; transition:all .15s; animation:aexPop .25s ease; }
        .aex-pieza:hover { border-color:${OK}; background:${OK}22; }
        .aex-pieza[data-probada="true"] { border-style:dashed; }
        .aex-op { cursor:pointer; display:flex; align-items:flex-start; gap:11px; width:100%; text-align:left; border-radius:12px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:600; padding:11px 14px;
          line-height:1.45; transition:all .14s; }
        .aex-op:hover:not(:disabled) { border-color:${T.lineStrong}; color:#fff; }
        .aex-op:disabled { cursor:default; }
        .aex-op[data-ok="true"] { border-color:${OK}; background:${OK}1c; color:#fff; }
        .aex-op[data-bad="true"] { border-color:${NO}; background:${NO}1c; color:#fff; }
        .aex-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; }
        .aex-btn:hover:not(:disabled) { border-color:${T.lineStrong}; }
        .aex-btn:disabled { opacity:.45; cursor:not-allowed; }
        .aex-prob { cursor:pointer; padding:8px 13px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass};
          color:${T.text2}; font-size:14px; font-weight:800; transition:all .14s; }
        .aex-prob:hover { border-color:${T.lineStrong}; color:#fff; }
        .aex-prob[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; }
        .aex-prob[data-done="true"] { color:${OK}; border-color:${OK}66; }
        .aex-vf { cursor:pointer; padding:8px 16px; border-radius:10px; border:1.5px solid ${T.line}; background:${T.glass};
          color:${T.text2}; font-size:14px; font-weight:800; transition:all .14s; }
        .aex-vf:hover:not(:disabled) { border-color:${T.lineStrong}; color:#fff; }
        .aex-vf:disabled { cursor:default; opacity:.85; }
        .aex-vf[data-on="true"] { border-color:${OK}; background:${OK}1f; color:#fff; }
        .aex-vf[data-bad="true"] { border-color:${NO}; background:${NO}1f; color:#fff; }
        .aex-ta { width:100%; min-height:140px; resize:vertical; border-radius:13px; border:1.5px solid ${T.lineStrong};
          background:${T.inset}; color:#fff; font-size:14.5px; line-height:1.7; padding:14px 16px; font-family:inherit; outline:none; transition:all .15s; }
        .aex-ta:focus { border-color:${accent}; box-shadow:0 0 0 3px rgba(${color.rgba},0.18); }
        .aex-ta::placeholder { color:rgba(255,255,255,0.28); }
        .aex-postura { cursor:pointer; text-align:left; width:100%; border:1.5px solid ${T.line}; background:${T.glass};
          border-radius:14px; padding:13px 15px; color:${T.text2}; font-size:14px; line-height:1.5; transition:all .15s; }
        .aex-postura:hover { border-color:${T.lineStrong}; color:#fff; }
        .aex-postura[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 18px -7px ${accent}; }
        .aex-range { width:100%; accent-color:${accent}; cursor:pointer; }
        .aex-pista { position:absolute; top:-6px; bottom:-6px; width:2px; background:#fff; box-shadow:0 0 12px #fff; }
        .aex-aguja { position:absolute; top:-8px; bottom:-8px; width:3px; background:${accent}; box-shadow:0 0 14px ${accent};
          animation:aexBarrido 6s linear 1; }
        .aex-divider { height:1px; background:${T.line}; margin:16px 0; }
        @media (max-width: 900px){  }

        /* Simulador del auditorio */
        .aex-aud { border-radius:16px; overflow:hidden; border:1px solid ${T.line}; background:#0a1524; }
        .aex-medidor { height:10px; background:rgba(255,255,255,0.1); }
        .aex-medidor > div { height:100%; transition:width .35s, background .35s; }
        .aex-sim-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap:14px; align-items:center; }
        .aex-reaccion { padding:10px 13px; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid ${T.line};
          font-size:14px; line-height:1.45; color:#fff; }
        .aex-opciones { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 150px), 1fr)); gap:8px; }
        .aex-opcion { cursor:pointer; display:grid; gap:6px; align-content:start; text-align:left; padding:8px; border-radius:12px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:700; line-height:1.3; transition:all .14s; }
        .aex-opcion > i { font-size:20px; color:${accent}; padding:4px 2px; }
        .aex-opcion:hover { border-color:${T.lineStrong}; color:#fff; }
        .aex-opcion[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.18); color:#fff; }

        /* Identidad del tablero */
        .aex-bin, .aex-row { --tono:200; position:relative;
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
        .aex-bin:nth-of-type(6n+1), .aex-row:nth-of-type(6n+1) { --tono:200; }
        .aex-bin:nth-of-type(6n+2), .aex-row:nth-of-type(6n+2) { --tono:272; }
        .aex-bin:nth-of-type(6n+3), .aex-row:nth-of-type(6n+3) { --tono:38; }
        .aex-bin:nth-of-type(6n+4), .aex-row:nth-of-type(6n+4) { --tono:150; }
        .aex-bin:nth-of-type(6n+5), .aex-row:nth-of-type(6n+5) { --tono:326; }
        .aex-bin:nth-of-type(6n+6), .aex-row:nth-of-type(6n+6) { --tono:16; }
        .aex-bin::before, .aex-row::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
          background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
        .aex-bin[data-done="true"], .aex-row[data-done="true"] {
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }
        .aex-chip { transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
        .aex-chip:hover { transform:translateY(-2px); }
        .aex-chip[data-sel="true"] { transform:translateY(-3px) scale(1.02); }
        .aex-pieza { transition:transform .14s, border-color .15s, background .15s; }
        .aex-pieza:hover { transform:translateY(-1px); }
        @media (prefers-reduced-motion: reduce){
          .aex-bin[data-shake="true"], .aex-row[data-shake="true"], .aex-aguja { animation:none; }
          .aex-chip, .aex-chip:hover, .aex-chip[data-sel="true"] { transform:none; transition:none; }
          .aex-pieza, .aex-pieza:hover { transform:none; }
        }
      `}</style>

          {modo === "auditorio" && (
            <>
              <AuditorioEscena eleccion={sim} atencion={atencionAhora} />
              <div className="aex-sim-grid">
                <div style={{ display: "grid", gap: 10 }}>
                  <Deslizador
                    label="Momento de la exposición"
                    icon="fa-clock"
                    colr="#A78BFA"
                    valor={reloj(MOMENTOS[momento]!)}
                    min={0}
                    max={MOMENTOS.length - 1}
                    step={1}
                    value={momento}
                    onChange={setMomento}
                    hintL="0:00"
                    hintR="3:00"
                  />
                  <div className="aex-reaccion">
                    <i className="fa-solid fa-comment" aria-hidden /> {reaccion(sim, atencionAhora)}
                  </div>
                </div>
                <CurvaAtencion eleccion={sim} indice={momento} />
              </div>
              <div style={{ fontSize: 14, color: T.text3 }}>Público ficticio y cifras de simulación: sirven para comparar decisiones, no para medir personas reales.</div>
            </>
          )}

          {modo === "guion" && (
            <GuionPanel
              accent={accent}
              guionPos={guionPos}
              piezasLibres={piezasLibres}
              selPieza={selPieza}
              shakeParte={shakeParte}
              probadas={probadas}
              piezaAbierta={piezaAbierta}
              onSelPieza={(id) => setSelPieza((s) => (s === id ? null : id))}
              onZona={() => {
                if (selPieza) intentarPieza(selPieza);
              }}
              onDropZona={(id) => intentarPieza(id)}
              onQuitar={quitarPieza}
              dragProps={dragProps}
              dropProps={dropProps}
            />
          )}

          {modo === "reloj" && (
            <RelojPanel
              accent={accent}
              rgba={color.rgba}
              escenario={escenario}
              escIdx={escIdx}
              reparto={reparto}
              suma={suma}
              sobra={sobra}
              palabras={palabrasCaben}
              valido={relojOk[escenario.id] === true}
              ensayo={ensayo}
              onEscenario={cambiarEscenario}
              onAjustar={ajustar}
              onEnsayar={() => setEnsayo(true)}
              onFinEnsayo={() => {
                setEnsayo(false);
                setPie({
                  ok: sobra <= 0,
                  txt:
                    sobra > 0
                      ? `Se acabó el tiempo en ${reloj(escenario.segundos)} y a tu exposición todavía le faltaban ${reloj(sobra)}. Lo que queda fuera es siempre lo último: el cierre y las preguntas.`
                      : `Ensayo terminado dentro de los ${reloj(escenario.segundos)}. Ese es el reparto que puedes sostener en el salón.`,
                });
              }}
            />
          )}

          {modo === "apoyos" && (
            <ApoyosPanel accent={accent} seleccion={apoyoSel} resueltos={apoyoOk} shake={shakeApoyo} onElegir={elegirApoyo} />
          )}

          {modo === "glosario" && (
            <div style={{ ...card, padding: "20px 22px" }}>
              <Eyebrow>
                <i className="fa-solid fa-spell-check" style={{ marginRight: 8, color: accent }} />
                Glosario de la progresión · LC-I-P08-A5
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
                  setPie({ ok: true, txt: "Los cinco términos, escritos de memoria. Cuatro de ellos son las partes que acabas de montar en la mesa; el quinto es lo que las sostiene en pantalla." });
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
              data={ANATOMIA_EXPOSICION_HUECOS}
              accent={accent}
              rgba={color.rgba}
              completado={textoDone}
              onCompletado={() => {
                setTextoDone(true);
                setPie({ ok: true, txt: "Texto completo. Fíjate en el orden del párrafo: la planeación ocurre antes de exponer; la introducción, el desarrollo y la conclusión, durante." });
                sfxOk();
              }}
              onAcierto={() => sfxPlace()}
              onError={() => sfxNo()}
            />
          )}

          {pieEl}
        </div>
      }
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 1 — Mesa de montaje
 * ═══════════════════════════════════════════════════════════════════════════ */
type DragFactory = (id: string) => {
  draggable: boolean;
  onDragStart: (e: React.DragEvent) => void;
};
type DropFactory = (onDrop: (id: string) => void) => {
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  role: "button";
  tabIndex: number;
  onKeyDown: (e: React.KeyboardEvent) => void;
};

function GuionPanel({
  accent,
  guionPos,
  piezasLibres,
  selPieza,
  shakeParte,
  probadas,
  piezaAbierta,
  onSelPieza,
  onZona,
  onDropZona,
  onQuitar,
  dragProps,
  dropProps,
}: {
  accent: string;
  guionPos: number;
  piezasLibres: PiezaGuion[];
  selPieza: string | null;
  shakeParte: Parte | null;
  probadas: Record<string, boolean>;
  piezaAbierta: string | null;
  onSelPieza: (id: string) => void;
  onZona: () => void;
  onDropZona: (id: string) => void;
  onQuitar: (id: string) => void;
  dragProps: DragFactory;
  dropProps: DropFactory;
}) {
  const completo = guionPos >= PIEZAS.length;
  const siguiente = PIEZAS[guionPos];
  const abierta = PIEZAS.find((p) => p.id === piezaAbierta);

  return (
    <Mesa>
      <div style={{ ...card, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
          <Eyebrow>Piezas sueltas del guion · colócalas en el orden en que ocurren</Eyebrow>
          <span style={{ fontSize: 14, fontWeight: 800, color: completo ? OK : T.text3, ...NUM }}>
            {guionPos}/{PIEZAS.length}
          </span>
        </div>
        <p style={{ margin: "0 0 14px", fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
          Exposición de demostración: <strong style={{ color: T.text2 }}>«El cuidado del agua en mi colonia»</strong>, tres
          minutos ante el grupo.
        </p>
        {completo ? (
          <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
            <i className="fa-solid fa-circle-check" /> Guion completo. Ahora toca cada pieza colocada para quitarla y ver qué se
            rompe sin ella ({Object.keys(probadas).length}/{PIEZAS.length} probadas).
          </div>
        ) : (
          <div className="aex-mazo">
            {piezasLibres.map((p) => (
              <button
                key={p.id}
                className="aex-chip"
                data-sel={selPieza === p.id}
                onClick={() => onSelPieza(p.id)}
                {...dragProps(p.id)}
              >
                <i className={`fa-solid ${p.icono}`} style={{ color: accent, marginTop: 3, fontSize: 14 }} />
                <span>
                  <span style={{ display: "block", fontWeight: 800 }}>{p.nombre}</span>
                  <span style={{ display: "block", fontWeight: 500, color: T.text2, fontSize: 14, marginTop: 3 }}>{p.funcion}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 12 }}>
        {PARTES_ORDEN.map((parte) => {
          const info = PARTE_INFO[parte];
          const dentro = PIEZAS.filter((p) => p.parte === parte && p.orden < guionPos);
          const faltan = PIEZAS.filter((p) => p.parte === parte && p.orden >= guionPos);
          const armada = faltan.length === 0;
          const esperaAqui = !completo && siguiente?.parte === parte;
          return (
            <div
              key={parte}
              className="aex-bin"
              data-shake={shakeParte === parte}
              data-done={armada}
              onClick={() => esperaAqui && onZona()}
              style={{ position: "relative", isolation: "isolate" }}
            {...dropProps((id) => onDropZona(id))}
            >
            {/* La ilustración del concepto llenando la caja vacía. */}
            <FondoTermino termino={info.titulo} />
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
                <VinetaTermino termino={info.titulo} color={T.text2} icono={info.icono} tam={29} radio={8} />
                <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{info.titulo}</span>
              </div>
              <div style={{ fontSize: 14, color: T.text3, marginBottom: 12, lineHeight: 1.45 }}>{info.subtitulo}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {dentro.map((p) => (
                  <button
                    key={p.id}
                    className="aex-pieza"
                    data-probada={probadas[p.id] === true}
                    title="Quitar del guion y ver qué se rompe"
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuitar(p.id);
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <i className={`fa-solid ${probadas[p.id] ? "fa-link-slash" : p.icono}`} style={{ color: OK, fontSize: 14 }} />
                      {p.nombre}
                    </span>
                    <span style={{ display: "block", fontWeight: 500, color: T.text2, fontSize: 14, marginTop: 4, fontStyle: "italic" }}>
                      {p.ejemplo}
                    </span>
                  </button>
                ))}
                {faltan.map((p) => (
                  <div key={p.id} className="aex-slot" data-armed={esperaAqui && siguiente?.id === p.id}>
                    <i className="fa-solid fa-circle-notch" style={{ fontSize: 14 }} />
                    {esperaAqui && siguiente?.id === p.id ? "Aquí va la siguiente pieza" : "Pieza pendiente"}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {abierta && (
        <div
          style={{
            borderRadius: 16,
            border: `1px solid ${NO}55`,
            background: `${NO}10`,
            padding: "16px 18px",
            display: "flex",
            gap: 13,
            alignItems: "flex-start",
          }}
        >
          <i className="fa-solid fa-link-slash" style={{ color: NO, fontSize: 17, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 5 }}>
              Una exposición sin «{abierta.nombre}»
            </div>
            <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.6 }}>{abierta.falta}</div>
          </div>
        </div>
      )}
      </div>
    </Mesa>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 2 — El reloj
 * ═══════════════════════════════════════════════════════════════════════════ */
function RelojPanel({
  accent,
  rgba,
  escenario,
  escIdx,
  reparto,
  suma,
  sobra,
  palabras,
  valido,
  ensayo,
  onEscenario,
  onAjustar,
  onEnsayar,
  onFinEnsayo,
}: {
  accent: string;
  rgba: string;
  escenario: EscenarioTiempo;
  escIdx: number;
  reparto: Reparto;
  suma: number;
  sobra: number;
  palabras: number;
  valido: boolean;
  ensayo: boolean;
  onEscenario: (i: number) => void;
  onAjustar: (id: BloqueId, v: number) => void;
  onEnsayar: () => void;
  onFinEnsayo: () => void;
}) {
  const total = escenario.segundos;
  const escala = Math.max(suma, total);
  const colores: Record<BloqueId, string> = {
    apertura: "#5BC8FF",
    desarrollo: "#A78BFA",
    cierre: "#34D399",
    preguntas: "#FFC75A",
  };

  return (
    <>
      <div style={{ ...card, padding: "18px 22px" }}>
        <Eyebrow>Elige la duración y reparte los segundos</Eyebrow>
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginBottom: 14 }}>
          {ESCENARIOS_TIEMPO.map((e, i) => (
            <button key={e.id} className="aex-prob" data-on={escIdx === i} onClick={() => onEscenario(i)}>
              <i className="fa-solid fa-stopwatch" style={{ marginRight: 7, fontSize: 14 }} />
              {e.nombre}
            </button>
          ))}
        </div>
        <p style={{ margin: "0 0 16px", fontSize: 14, color: T.text3, lineHeight: 1.5 }}>{escenario.nota}</p>

        {/* Línea de tiempo */}
        <div style={{ position: "relative", marginBottom: 10 }}>
          <div style={{ display: "flex", height: 42, borderRadius: 11, overflow: "hidden", border: `1px solid ${T.line}`, background: T.inset }}>
            {BLOQUES.map((b) => {
              const v = reparto[b.id];
              const pct = escala > 0 ? (v / escala) * 100 : 0;
              return (
                <div
                  key={b.id}
                  title={`${b.nombre}: ${reloj(v)}`}
                  style={{
                    width: `${pct}%`,
                    background: `${colores[b.id]}44`,
                    borderRight: `1px solid ${colores[b.id]}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 800,
                    color: "#fff",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    transition: "width .18s",
                  }}
                >
                  {pct > 11 ? reloj(v) : ""}
                </div>
              );
            })}
          </div>
          {/* Dónde termina el tiempo permitido */}
          {escala > total && (
            <div className="aex-pista" style={{ left: `${(total / escala) * 100}%` }} title={`Aquí se acaba el tiempo: ${reloj(total)}`} />
          )}
          {ensayo && <div className="aex-aguja" onAnimationEnd={onFinEnsayo} />}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: T.text3, ...NUM, marginBottom: 6 }}>
          <span>0:00</span>
          {escala > total && (
            <span style={{ color: "#fff", fontWeight: 800 }}>
              <i className="fa-solid fa-scissors" style={{ marginRight: 6 }} />
              aquí se acaba tu tiempo: {reloj(total)}
            </span>
          )}
          <span>{reloj(escala)}</span>
        </div>

        {/* Deslizadores */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
          {BLOQUES.map((b) => {
            const v = reparto[b.id];
            const lo = segMin(b, total);
            const hi = segMax(b, total);
            const dentro = v >= lo && v <= hi;
            return (
              <div key={b.id}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 5, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: dentro ? "#fff" : T.text2, display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <i className={`fa-solid ${b.icono}`} style={{ color: colores[b.id], fontSize: 14 }} />
                    {b.nombre}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: dentro ? OK : "#FF8A3C", ...NUM }}>
                    {reloj(v)}
                    <span style={{ color: T.text3, fontWeight: 600 }}>
                      {" "}
                      · recomendado {reloj(lo)}–{reloj(hi)}
                    </span>
                  </span>
                </div>
                <input
                  className="aex-range"
                  type="range"
                  min={0}
                  max={total}
                  step={escenario.paso}
                  value={v}
                  aria-label={`${b.nombre} (segundos)`}
                  onChange={(e) => onAjustar(b.id, Number(e.target.value))}
                />
                <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.45, marginTop: 2 }}>{b.porque}</div>
              </div>
            );
          })}
        </div>

        <div className="aex-divider" />

        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              borderRadius: 12,
              padding: "10px 15px",
              border: `1px solid ${sobra === 0 ? `${OK}66` : `${NO}66`}`,
              background: sobra === 0 ? `${OK}14` : `${NO}12`,
              fontSize: 14,
              fontWeight: 800,
              color: sobra === 0 ? OK : NO,
              ...NUM,
            }}
          >
            <i className={`fa-solid ${sobra === 0 ? "fa-circle-check" : "fa-triangle-exclamation"}`} />
            {sobra === 0
              ? `Cabe exacto en ${reloj(total)}`
              : sobra > 0
                ? `Te pasas por ${reloj(sobra)}`
                : `Te sobran ${reloj(-sobra)} sin repartir`}
          </div>
          <div style={{ fontSize: 14, color: T.text2, ...NUM }}>
            Hablando caben ≈ <strong style={{ color: T.text }}>{palabras}</strong> palabras
          </div>
          <div style={{ flex: 1 }} />
          <button className="aex-btn" onClick={onEnsayar} disabled={ensayo}>
            <i className="fa-solid fa-play" />
            {ensayo ? "Ensayando…" : "Ensayar el reparto"}
          </button>
        </div>

        {valido && (
          <div style={{ marginTop: 13, fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
            <i className="fa-solid fa-circle-check" /> Reparto viable para {escenario.nombre.toLowerCase()}.
          </div>
        )}
      </div>

      <div
        style={{
          borderRadius: 16,
          border: `1px solid rgba(${rgba},0.28)`,
          background: `rgba(${rgba},0.07)`,
          padding: "15px 18px",
          fontSize: 14,
          color: T.text2,
          lineHeight: 1.6,
          display: "flex",
          gap: 12,
        }}
      >
        <i className="fa-solid fa-scale-balanced" style={{ color: accent, fontSize: 15, marginTop: 2 }} />
        <span>
          Las bandas recomendadas son un criterio de este laboratorio, no un dato de la progresión: dejan al desarrollo como
          parte central sin que la conclusión —que la lectura A1 considera igual de obligatoria— se quede sin tiempo. El cálculo
          de palabras usa {PALABRAS_POR_MINUTO} por minuto, un ritmo de referencia para hablar en público.
        </span>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 3 — ¿Qué apoyo para este momento?
 * ═══════════════════════════════════════════════════════════════════════════ */
function ApoyosPanel({
  accent,
  seleccion,
  resueltos,
  shake,
  onElegir,
}: {
  accent: string;
  seleccion: Record<string, number[]>;
  resueltos: Record<string, boolean>;
  shake: string | null;
  onElegir: (casoId: string, i: number) => void;
}) {
  const hechos = Object.keys(resueltos).length;
  return (
    <>
      <div style={{ ...card, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
          <Eyebrow>Elige el apoyo que sirve en cada momento (y lee por qué los otros no)</Eyebrow>
          <span style={{ fontSize: 14, fontWeight: 800, color: hechos >= APOYOS.length ? OK : T.text3, ...NUM }}>
            {hechos}/{APOYOS.length}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 14, color: T.text3, lineHeight: 1.55 }}>
          Sigues con la exposición sobre el agua. En cada momento hay tres apoyos posibles y sólo uno hace el trabajo que ese
          momento necesita.
        </p>
      </div>

      {APOYOS.map((caso) => {
        const probadas = seleccion[caso.id] ?? [];
        const listo = resueltos[caso.id] === true;
        return (
          <div key={caso.id} className="aex-row" data-shake={shake === caso.id} data-done={listo}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <i className={`fa-solid ${caso.icono}`} style={{ color: accent }} />
              <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{caso.momento}</span>
              {listo && <i className="fa-solid fa-circle-check" style={{ color: OK, marginLeft: "auto" }} />}
            </div>
            <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.5, marginBottom: 12 }}>{caso.detalle}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {caso.opciones.map((op, i) => {
                const esta = probadas.includes(i);
                const buena = i === caso.correcta;
                return (
                  <button
                    key={i}
                    className="aex-op"
                    disabled={listo && !buena}
                    data-ok={listo && buena}
                    data-bad={esta && !buena}
                    onClick={() => onElegir(caso.id, i)}
                  >
                    <span
                      style={{
                        flexShrink: 0,
                        width: 24,
                        height: 24,
                        borderRadius: 7,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        fontWeight: 900,
                        border: `1px solid ${T.line}`,
                      }}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span style={{ flex: 1 }}>{op.txt}</span>
                  </button>
                );
              })}
            </div>
            {probadas.map((i) => {
              const op = caso.opciones[i];
              if (!op) return null;
              const buena = i === caso.correcta;
              return (
                <div
                  key={i}
                  style={{
                    marginTop: 10,
                    fontSize: 14,
                    color: T.text2,
                    lineHeight: 1.55,
                    borderRadius: 10,
                    border: `1px solid ${buena ? `${OK}44` : T.line}`,
                    background: buena ? `${OK}0f` : T.inset,
                    padding: "9px 13px",
                  }}
                >
                  <i
                    className={`fa-solid ${buena ? "fa-circle-check" : "fa-circle-xmark"}`}
                    style={{ marginRight: 8, color: buena ? OK : accent }}
                  />
                  <strong style={{ color: T.text }}>{String.fromCharCode(65 + i)}.</strong> {op.porque}
                </div>
              );
            })}
          </div>
        );
      })}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Clínica de exposiciones — diagnostica lo que le pasó a cada una
 * ═══════════════════════════════════════════════════════════════════════════ */
function ClinicaCard({
  accent,
  respuestas,
  onResponder,
}: {
  accent: string;
  respuestas: (number | null)[];
  onResponder: (i: number, op: number) => void;
}) {
  const aciertos = respuestas.filter((v, i) => v !== null && v === CLINICA[i]!.correcta).length;
  return (
    <div style={{ ...card, padding: "20px 24px 24px", marginTop: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-stethoscope" style={{ marginRight: 8, color: accent }} />
          Clínica de exposiciones · ¿qué le pasó a cada una?
        </Eyebrow>
        <span style={{ fontSize: 14, fontWeight: 800, color: aciertos >= CLINICA.length ? OK : T.text3, ...NUM }}>
          {aciertos}/{CLINICA.length}
        </span>
      </div>
      <p style={{ margin: "0 0 18px", fontSize: 14, color: T.text3, lineHeight: 1.55 }}>
        Cuatro exposiciones de un salón de bachillerato, contadas tal como se vieron. Ninguna es un desastre: a cada una le
        falló una sola cosa. Encuéntrala.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {CLINICA.map((caso, i) => {
          const elegida = respuestas[i];
          const listo = elegida === caso.correcta;
          return (
            <div key={caso.id} style={{ borderRadius: 14, border: `1px solid ${listo ? `${OK}55` : T.line}`, background: T.glass, padding: "14px 16px" }}>
              <div style={{ fontSize: 14, color: T.text, lineHeight: 1.6, marginBottom: 12, fontStyle: "italic" }}>
                <i className="fa-solid fa-quote-left" style={{ fontSize: 14, marginRight: 8, color: accent }} />
                {caso.relato}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: 8 }}>
                {caso.opciones.map((op, j) => (
                  <button
                    key={j}
                    className="aex-op aex-clinica"
                    disabled={listo && j !== caso.correcta}
                    data-ok={listo && j === caso.correcta}
                    data-bad={elegida === j && j !== caso.correcta}
                    onClick={() => onResponder(i, j)}
                  >
                    <span style={{ flex: 1 }}>{op}</span>
                  </button>
                ))}
              </div>
              {elegida !== null && elegida !== undefined && (
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 14,
                    color: T.text2,
                    lineHeight: 1.55,
                    borderRadius: 10,
                    border: `1px solid ${T.line}`,
                    background: T.inset,
                    padding: "9px 13px",
                  }}
                >
                  <i className={`fa-solid ${listo ? "fa-circle-check" : "fa-circle-info"}`} style={{ marginRight: 8, color: listo ? OK : accent }} />
                  {listo ? caso.retro : "Ese no es el problema principal: vuelve a leer el relato y fíjate en qué parte de la exposición se quedó fuera."}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Hechos verdadero / falso — A4 verbatim
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
  const aciertos = respuestas.filter((v, i) => v !== null && v === HECHOS[i]!.respuesta).length;
  return (
    <div style={{ ...card, padding: "20px 24px 24px", marginTop: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-scale-balanced" style={{ marginRight: 8, color: accent }} />
          Hechos · verdadero o falso (A4, verbatim)
        </Eyebrow>
        <span style={{ fontSize: 14, fontWeight: 800, color: aciertos >= HECHOS.length ? OK : T.text3, ...NUM }}>
          {aciertos}/{HECHOS.length}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {HECHOS.map((h, i) => {
          const dada = respuestas[i];
          const listo = dada === h.respuesta;
          return (
            <div key={i} style={{ borderRadius: 13, border: `1px solid ${listo ? `${OK}55` : T.line}`, background: T.glass, padding: "13px 16px" }}>
              <div style={{ fontSize: 14, color: T.text, lineHeight: 1.5, marginBottom: 10 }}>{h.enunciado}</div>
              <div style={{ display: "flex", gap: 9, flexWrap: "wrap", alignItems: "center" }}>
                {[true, false].map((v) => (
                  <button
                    key={String(v)}
                    className="aex-vf"
                    disabled={listo}
                    data-on={listo && v === h.respuesta}
                    data-bad={dada === v && v !== h.respuesta}
                    onClick={() => onResponder(i, v)}
                  >
                    {v ? "Verdadero" : "Falso"}
                  </button>
                ))}
                {dada !== null && dada !== undefined && (
                  <span style={{ fontSize: 14, color: listo ? T.text2 : NO, lineHeight: 1.5, flex: 1, minWidth: 0 }}>
                    {listo ? h.retro : "Todavía no: vuelve a leer el enunciado con calma."}
                  </span>
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
 * Mesa de debate — A7 verbatim
 * ═══════════════════════════════════════════════════════════════════════════ */
function DebateCard({
  accent,
  rgba,
  postura,
  argumento,
  puntoValido,
  onPostura,
  onArgumento,
  onPuntoValido,
}: {
  accent: string;
  rgba: string;
  postura: string | null;
  argumento: string;
  puntoValido: string | null;
  onPostura: (id: string) => void;
  onArgumento: (v: string) => void;
  onPuntoValido: (txt: string) => void;
}) {
  const palabras = cuentaPalabras(argumento);
  const otra = DEBATE.posturas.find((p) => p.id !== postura);

  return (
    <div style={{ ...card, padding: "20px 24px 24px", marginTop: 22 }}>
      <Eyebrow>
        <i className="fa-solid fa-comments" style={{ marginRight: 8, color: accent }} />
        Mesa de debate · A7 (verbatim)
      </Eyebrow>
      <div style={{ fontSize: 14.5, fontWeight: 800, color: T.text, marginBottom: 6 }}>{DEBATE.tema}</div>
      <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.55, marginBottom: 16 }}>
        {DEBATE.reglas.join(" · ")} Aquí no hay respuesta correcta: lo que se evalúa es que sostengas tu postura y reconozcas
        algo válido en la contraria.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 10, marginBottom: 16 }}>
        {DEBATE.posturas.map((p) => (
          <button key={p.id} className="aex-postura" data-on={postura === p.id} onClick={() => onPostura(p.id)}>
            <span style={{ display: "block", fontWeight: 800, marginBottom: 6 }}>{p.texto}</span>
            {p.guia.map((g, i) => (
              <span key={i} style={{ display: "block", fontSize: 14, color: T.text3, lineHeight: 1.45 }}>
                <i className="fa-solid fa-angle-right" style={{ fontSize: 9, marginRight: 6 }} />
                {g}
              </span>
            ))}
          </button>
        ))}
      </div>

      <textarea
        className="aex-ta"
        value={argumento}
        placeholder={`Escribe tus argumentos (mínimo ${DEBATE.minimoPalabras} palabras) y di en qué situaciones conviene cada forma.`}
        aria-label="Tu argumento"
        onChange={(e) => onArgumento(e.target.value)}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 14, color: palabras >= DEBATE.minimoPalabras ? OK : T.text3, fontWeight: 800, ...NUM }}>
          {palabras} / {DEBATE.minimoPalabras} palabras
        </span>
        {postura === null && <span style={{ fontSize: 14, color: T.text3 }}>Elige primero una postura.</span>}
      </div>

      {otra && (
        <div style={{ marginTop: 18, borderRadius: 14, border: `1px solid rgba(${rgba},0.3)`, background: `rgba(${rgba},0.07)`, padding: "14px 16px" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.text2, marginBottom: 10 }}>
            Ahora reconoce un punto válido de la postura contraria:
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {otra.guia.map((g) => (
              <button
                key={g}
                className="aex-op aex-punto"
                data-ok={puntoValido === g}
                onClick={() => onPuntoValido(g)}
              >
                <span style={{ flex: 1 }}>{g}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
