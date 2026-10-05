"use client";

/**
 * Laboratorio — Habits and comparisons: comparar lo que la gente hace, elige o
 * prefiere. Práctica interactiva para IN-III-P04 (Inglés III, 3.er semestre).
 *
 * Por qué NO es un laboratorio 3D: comparar es una operación de lenguaje, no un
 * fenómeno físico. Lo que hay que ver aquí son DOS COLUMNAS DE DATOS y la
 * oración que esos datos sostienen; una escena tridimensional sería decoración
 * alrededor de una tabla. DOM puro: ligero, y manejable con ratón, teclado y
 * pantalla táctil.
 *
 * Y por qué no es una hoja de ejercicios: en los cinco modos el alumno DECIDE y
 * el laboratorio le explica en español la regla que falló, con el ejemplo en
 * inglés. Los errores que persigue son los de verdad: «more easier», «gooder»,
 * «the most big», el superlativo usado para comparar solo dos cosas, «prefer …
 * than», «would rather to walk» y la oración perfectamente escrita que dice lo
 * CONTRARIO de lo que trae la tabla.
 *
 * Cinco modos:
 *  1. «La escalera del adjetivo» — para cada adjetivo, primero se nombra la
 *     regla y después se construyen el comparativo y el superlativo, con las
 *     trampas clásicas dentro del mazo.
 *  2. «Los datos mandan» — una tabla y cuatro oraciones en inglés correcto:
 *     solo una dice lo que los datos dicen.
 *  3. «as … as» — la igualdad y su negación, armadas pieza por pieza; y en las
 *     negaciones, a qué comparativo equivalen.
 *  4. «Preferencias» — prefer … to, would rather … than y like … better than,
 *     con la forma del verbo que cada una exige detrás.
 *  5. «Completa el texto» — los siete huecos verbatim de A2.
 *  + Hechos verdadero/falso (A4), la lectura A1 con sus preguntas, la escala de
 *    frecuencia de A1 como consulta y el reto evaluable (A3).
 *
 * Se compara SIEMPRE lo que la gente hace, elige o cuánto cuesta algo: rutas,
 * teléfonos, climas, frecuencias, libros y precios. Nunca cuerpos ni
 * capacidades de las personas.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, NUM, card } from "./_kit";
import { LabShell, Bloque, BotonHerramienta, Dato } from "./_shell";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { hablarLab, callarLab } from "./lab-voz";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { HABITOS_COMPARACIONES_FICHA } from "./habitos-comparaciones-ficha";
import { HABITOS_COMPARACIONES_HUECOS } from "./habitos-comparaciones-huecos";
import {
  SITUACIONES,
  TOPE_MINUTOS,
  TOPE_PESOS,
  calcularPlan,
  estrellasDelPlan,
  type PlanSim,
} from "./habitos-comparaciones-sim";
import {
  REGLAS,
  ESCALERA,
  explicaForma,
  explicaRegla,
  TARJETAS,
  IGUALDADES,
  explicaIgualdad,
  PREFERENCIAS,
  HECHOS,
  COMPRENSION_A1,
  ESCALA_FRECUENCIA,
  ACTIVIDAD_FINAL_A5,
  CRITERIOS_A7,
  RETO_QUIZ,
  type Regla,
  type Escalon,
  type TarjetaDatos,
  type RondaIgualdad,
  type RondaPreferencia,
} from "./habitos-comparaciones-data";

const NO = "#FF5E5E";
const RETO_KEY = "cen-habitos-comparaciones-ingles-reto";

type Modo = "simulador" | "escalera" | "datos" | "igualdad" | "preferencias" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "simulador", label: "El sábado de Ana", icono: "fa-comments" },
  { id: "escalera", label: "La escalera del adjetivo", icono: "fa-stairs" },
  { id: "datos", label: "Los datos mandan", icono: "fa-table" },
  { id: "igualdad", label: "as … as", icono: "fa-equals" },
  { id: "preferencias", label: "Preferencias", icono: "fa-heart" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

function BotonEscuchar({ txt, accent }: { txt: string; accent: string }) {
  return (
    <button type="button" className="hcp-mini" onClick={() => hablarLab(txt)} title="Escuchar en inglés">
      <i className="fa-solid fa-volume-high" style={{ marginRight: 7, color: accent }} />
      Escuchar
    </button>
  );
}

/** Arma la oración completa de una ronda de preferencias con lo ya elegido. */
function frasePreferencia(ronda: RondaPreferencia, elegidas: Record<string, string>): string {
  return ronda.partes
    .map((parte, i) => parte + (i < ronda.ranuras.length ? (elegidas[`${ronda.id}:${i}`] ?? "___") : ""))
    .join("");
}

export function LabHabitosComparaciones({ color }: PracticaLabProps) {
  const accent = color.hex;
  const [modo, setModo] = useState<Modo>("simulador");

  // ── sonido, partida y teoría ──────────────────────────────────────────
  const partida = usePartida();
  const [sonido, setSonido] = useState(false);
  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const audioRef = useRef<LabSfx | null>(null);
  useEffect(() => () => audioRef.current?.dispose(), []);
  // `callarLab()` ya se traga sus propios fallos: no hace falta envolverlo.
  useEffect(() => callarLab, []);
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
  const sfxSi = (txt?: string) => {
    partida.acierto();
    if (txt) setPie({ ok: true, txt });
    return sonido && audioRef.current?.blip();
  };

  // ── modo 1: la escalera del adjetivo ──────────────────────────────────
  const [escIdx, setEscIdx] = useState(0);
  const [escRegla, setEscRegla] = useState<Record<string, Regla>>({});
  const [escComp, setEscComp] = useState<Record<string, string>>({});
  const [escSup, setEscSup] = useState<Record<string, string>>({});
  const [shakeEsc, setShakeEsc] = useState<string | null>(null);

  const escalon = ESCALERA[escIdx] ?? ESCALERA[0]!;
  const reglasDone = ESCALERA.every((e) => escRegla[e.id] !== undefined);
  const escaleraDone = ESCALERA.every((e) => escComp[e.id] !== undefined && escSup[e.id] !== undefined);

  const elegirRegla = (id: Regla) => {
    if (escRegla[escalon.id]) return;
    if (id === escalon.regla) {
      setEscRegla((prev) => ({ ...prev, [escalon.id]: id }));
      sfxSi(`«${escalon.adjetivo}» (${escalon.silabas}). ${escalon.porqueRegla}`);
    } else {
      setShakeEsc(`regla:${id}`);
      sfxNo(explicaRegla(escalon, id));
      window.setTimeout(() => setShakeEsc(null), 420);
    }
  };

  const elegirForma = (peldano: "comp" | "sup", valor: string) => {
    const ya = peldano === "comp" ? escComp[escalon.id] : escSup[escalon.id];
    if (ya) return;
    const buena = peldano === "comp" ? escalon.comparativo : escalon.superlativo;
    if (valor === buena) {
      if (peldano === "comp") {
        setEscComp((prev) => ({ ...prev, [escalon.id]: valor }));
        sfxSi(`${escalon.adjetivo} → ${valor} than. ${escalon.porqueRegla}`);
      } else {
        setEscSup((prev) => ({ ...prev, [escalon.id]: valor }));
        sfxSi(`La escalera completa: ${escalon.adjetivo} → ${escalon.comparativo} → ${escalon.superlativo}. ${escalon.ejemplo}`);
        sfxOk();
      }
    } else {
      setShakeEsc(`${peldano}:${valor}`);
      sfxNo(explicaForma(escalon, valor, peldano));
      window.setTimeout(() => setShakeEsc(null), 420);
    }
  };

  const irEscalon = (i: number) => {
    const n = ESCALERA.length;
    setEscIdx(((i % n) + n) % n);
  };

  const resetEscalera = () => {
    setEscIdx(0);
    setEscRegla({});
    setEscComp({});
    setEscSup({});
    setPie(null);
  };

  // ── modo 2: los datos mandan ──────────────────────────────────────────
  const [datIdx, setDatIdx] = useState(0);
  const [datOk, setDatOk] = useState<Record<string, boolean>>({});
  const [datFallos, setDatFallos] = useState<Record<string, boolean>>({});

  const tarjeta = TARJETAS[datIdx] ?? TARJETAS[0]!;
  const datosDone = TARJETAS.every((t) => datOk[t.id] === true);
  const datosSerieDone = datOk["td-lectura"] === true && datOk["td-cafe"] === true;

  const responderDatos = (i: number) => {
    if (datOk[tarjeta.id]) return;
    const op = tarjeta.opciones[i];
    if (!op) return;
    if (i === tarjeta.correcta) {
      const siguiente = { ...datOk, [tarjeta.id]: true };
      setDatOk(siguiente);
      sfxSi(`«${op.texto}» ${op.porque}`);
      if (TARJETAS.every((t) => siguiente[t.id] === true)) sfxOk();
    } else {
      setDatFallos((prev) => ({ ...prev, [`${tarjeta.id}:${i}`]: true }));
      sfxNo(`«${op.texto}» ${op.porque}`);
    }
  };

  const irTarjeta = (i: number) => {
    const n = TARJETAS.length;
    setDatIdx(((i % n) + n) % n);
  };

  const resetDatos = () => {
    setDatIdx(0);
    setDatOk({});
    setDatFallos({});
    setPie(null);
  };

  // ── modo 3: as … as ───────────────────────────────────────────────────
  const [igIdx, setIgIdx] = useState(0);
  const [igArmado, setIgArmado] = useState<Record<string, string[]>>({});
  const [igEquiv, setIgEquiv] = useState<Record<string, boolean>>({});
  const [shakeIg, setShakeIg] = useState<string | null>(null);

  const igualdad = IGUALDADES[igIdx] ?? IGUALDADES[0]!;
  const igActual = igArmado[igualdad.id] ?? [];
  const igCompleta = (r: RondaIgualdad) => (igArmado[r.id]?.length ?? 0) >= r.solucion.length;
  const igualdadDone = IGUALDADES.every((r) => igCompleta(r));
  const equivDone = IGUALDADES.filter((r) => r.equivalencia).every((r) => igEquiv[r.id] === true);

  const ponerPiezaIg = (pieza: string, iPieza: number) => {
    const pos = igActual.length;
    if (pos >= igualdad.solucion.length) return;
    const esperada = igualdad.solucion[pos]!;
    if (pieza === esperada) {
      const siguiente = [...igActual, pieza];
      setIgArmado((prev) => ({ ...prev, [igualdad.id]: siguiente }));
      if (siguiente.length >= igualdad.solucion.length) {
        sfxSi(`«${igualdad.solucion.join(" ")}.» ${igualdad.regla}`);
        sfxOk();
      } else {
        sfxSi();
      }
    } else {
      setShakeIg(`${igualdad.id}:${iPieza}`);
      sfxNo(explicaIgualdad(igualdad, pieza, pos));
      window.setTimeout(() => setShakeIg(null), 420);
    }
  };

  const borrarPiezaIg = () => {
    if (igActual.length === 0) return;
    setIgArmado((prev) => ({ ...prev, [igualdad.id]: igActual.slice(0, -1) }));
  };

  const responderEquiv = (i: number) => {
    const eq = igualdad.equivalencia;
    if (!eq || igEquiv[igualdad.id]) return;
    if (i === eq.correcta) {
      setIgEquiv((prev) => ({ ...prev, [igualdad.id]: true }));
      sfxSi(eq.porque);
      sfxOk();
    } else {
      sfxNo(`Esa no. ${eq.porque}`);
    }
  };

  const irIgualdad = (i: number) => {
    const n = IGUALDADES.length;
    setIgIdx(((i % n) + n) % n);
  };

  const resetIgualdad = () => {
    setIgIdx(0);
    setIgArmado({});
    setIgEquiv({});
    setPie(null);
  };

  // ── modo 4: preferencias ──────────────────────────────────────────────
  const [prIdx, setPrIdx] = useState(0);
  const [prOk, setPrOk] = useState<Record<string, string>>({});
  const [shakePr, setShakePr] = useState<string | null>(null);

  const pref = PREFERENCIAS[prIdx] ?? PREFERENCIAS[0]!;
  const prefCompleta = (r: RondaPreferencia) => r.ranuras.every((_, k) => prOk[`${r.id}:${k}`] !== undefined);
  const prefDone = PREFERENCIAS.every((r) => prefCompleta(r));
  const ratherDone = PREFERENCIAS.filter((r) => r.familia === "rather").every((r) => prefCompleta(r));

  const elegirRanura = (k: number, valor: string) => {
    const clave = `${pref.id}:${k}`;
    if (prOk[clave]) return;
    const ranura = pref.ranuras[k];
    if (!ranura) return;
    if (valor === ranura.correcta) {
      const siguiente = { ...prOk, [clave]: valor };
      setPrOk(siguiente);
      if (pref.ranuras.every((_, j) => siguiente[`${pref.id}:${j}`] !== undefined)) {
        sfxSi(`«${frasePreferencia(pref, siguiente)}» ${pref.regla}`);
        sfxOk();
      } else {
        sfxSi();
      }
    } else {
      setShakePr(`${clave}:${valor}`);
      sfxNo(ranura.errores[valor] ?? `«${valor}» no encaja aquí. ${pref.regla}`);
      window.setTimeout(() => setShakePr(null), 420);
    }
  };

  const irPref = (i: number) => {
    const n = PREFERENCIAS.length;
    setPrIdx(((i % n) + n) % n);
  };

  const resetPref = () => {
    setPrIdx(0);
    setPrOk({});
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

  // ── hechos (A4, verbatim) ─────────────────────────────────────────────
  const [hechos, setHechos] = useState<(boolean | null)[]>(() => HECHOS.map(() => null));
  const hechosDone = hechos.filter((h, i) => h !== null && h === HECHOS[i]!.respuesta).length >= HECHOS.length;
  const responderHecho = (i: number, valor: boolean) => {
    const h = HECHOS[i]!;
    if (hechos[i] === h.respuesta) return;
    setHechos((prev) => prev.map((v, j) => (j === i ? valor : v)));
    if (valor === h.respuesta) sfxSi(h.retro);
    else sfxNo(h.retro);
  };

  // ── reto evaluable (A3) ───────────────────────────────────────────────
  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── simulador: «El sábado de Ana» ─────────────────────────────────────
  const [simIdx, setSimIdx] = useState(0);
  const [simElegidas, setSimElegidas] = useState<Record<string, number>>({});
  const plan = calcularPlan(simElegidas);
  const simDone = plan.hechas >= SITUACIONES.length;
  const planCabe = simDone && plan.minutos <= TOPE_MINUTOS && plan.pesos <= TOPE_PESOS;
  const estrellasSim = estrellasDelPlan(plan);
  const bestEstrellas = Math.max(estrellasSim, mejor);

  const elegirOracion = (iOracion: number) => {
    const s = SITUACIONES[simIdx]!;
    if (simElegidas[s.id] !== undefined) return;
    const o = s.oraciones[iOracion];
    if (!o) return;
    const siguiente = { ...simElegidas, [s.id]: iOracion };
    setSimElegidas(siguiente);
    if (o.clase === "ok") sfxSi();
    else sfxNo();
    const p = calcularPlan(siguiente);
    if (p.hechas >= SITUACIONES.length) {
      registraEstrellas(estrellasDelPlan(p));
      sfxOk();
    }
  };
  const irSim = (i: number) => {
    const n = SITUACIONES.length;
    setSimIdx(((i % n) + n) % n);
  };
  const resetSim = () => {
    setSimIdx(0);
    setSimElegidas({});
    partida.reiniciar();
  };

  // ── objetivos de la sesión ────────────────────────────────────────────
  const objetivos = [
    { txt: "Ayuda a Ana en las 5 situaciones del sábado", done: simDone },
    { txt: `Que el plan quepa en ${TOPE_MINUTOS} min y $${TOPE_PESOS.toLocaleString("en-US")}`, done: planCabe },
    { txt: `Nombra la regla de los ${ESCALERA.length} adjetivos`, done: reglasDone },
    { txt: "Construye sus comparativos y superlativos", done: escaleraDone },
    { txt: `Resuelve las ${TARJETAS.length} tarjetas de datos`, done: datosDone },
    { txt: "Usa el superlativo solo cuando la serie lo permite", done: datosSerieDone },
    { txt: "Arma las 6 oraciones con as … as / not as … as", done: igualdadDone },
    { txt: "Traduce las 3 negaciones a su comparativo", done: equivDone },
    { txt: "Completa las 6 estructuras de preferencia", done: prefDone },
    { txt: "Distingue would rather … than de prefer … to", done: ratherDone },
    { txt: "Completa el texto con huecos de A2", done: textoDone },
    { txt: "Acierta los 5 hechos verdadero o falso (A4)", done: hechosDone },
    { txt: "Aprueba el reto evaluable (70 %)", done: quizAprobado },
  ];

  const resetActual =
    modo === "simulador"
      ? resetSim
      : modo === "escalera"
        ? resetEscalera
      : modo === "datos"
        ? resetDatos
        : modo === "igualdad"
          ? resetIgualdad
          : modo === "preferencias"
            ? resetPref
            : resetTexto;

  const pieEstado = (
    <div
      role="status"
      aria-live="polite"
      style={{
        borderRadius: 14,
        border: `1px solid ${pie ? (pie.ok ? `${OK}55` : `${NO}55`) : T.line}`,
        background: pie ? (pie.ok ? `${OK}12` : `${NO}12`) : T.glass,
        padding: "13px 16px",
        fontSize: 14.5,
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
        style={{ color: pie ? (pie.ok ? OK : NO) : T.text3, fontSize: 16, marginTop: 2 }}
      />
      <span>{pie ? pie.txt : "Aquí aparece por qué cada decisión estuvo bien o mal."}</span>
    </div>
  );

  const lectura =
    modo === "simulador" ? (
      <>
        {plan.minutos}/{TOPE_MINUTOS} min · ${plan.pesos.toLocaleString("en-US")}/${TOPE_PESOS.toLocaleString("en-US")} · Ana te entendió {plan.entendidas}/{plan.hechas}
      </>
    ) : (
      <>Cada decisión se explica abajo</>
    );

  const consejo =
    modo === "escalera" ? (
      <>Una sílaba: <strong style={{ color: T.text }}>-er / the -est</strong>. Dos o más: <strong style={{ color: T.text }}>more / the most</strong>. Nunca las dos: «more easier» no existe.</>
    ) : modo === "datos" ? (
      <>Las cuatro oraciones están bien escritas, pero <strong style={{ color: T.text }}>tres dicen algo que la tabla no dice</strong>. El superlativo solo vale con tres cosas o más.</>
    ) : modo === "igualdad" ? (
      <>Entre los dos <strong style={{ color: T.text }}>as</strong> el adjetivo va en forma base: as fast as. <strong style={{ color: T.text }}>not as … as</strong> deja a la primera cosa por debajo.</>
    ) : modo === "preferencias" ? (
      <><strong style={{ color: T.text }}>prefer … to</strong> (nunca «than»), <strong style={{ color: T.text }}>would rather + verbo base + than + verbo base</strong> y <strong style={{ color: T.text }}>like … better than</strong>.</>
    ) : modo === "texto" ? (
      <>Lee el párrafo entero antes de escribir: el contexto decide la forma. Pulsa <strong style={{ color: T.text }}>Enter</strong> para comprobar cada hueco.</>
    ) : (
      <>Lo que dices manda: una oración mal armada confunde a Ana, y una bien armada pero falsa la lleva al lugar equivocado.</>
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
          <style>{`
        @keyframes hcpShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }

        .hcp-card { border-radius:16px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px 18px; transition:all .16s; }
        .hcp-card[data-done="true"] { border-color:${OK}66; }

        /* Navegador de rondas */
        .hcp-dots { display:flex; align-items:center; gap:7px; flex-wrap:wrap; }
        .hcp-dot { cursor:pointer; width:30px; height:30px; border-radius:9px; border:1.5px solid ${T.line}; background:${T.glass};
          color:${T.text3}; font-size:14px; font-weight:800; transition:all .14s; font-family:inherit; font-variant-numeric:tabular-nums; }
        .hcp-dot:hover { border-color:${T.lineStrong}; color:#fff; }
        .hcp-dot[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); color:#fff; }
        .hcp-dot[data-done="true"] { border-color:${OK}88; color:${OK}; }

        /* Fichas elegibles (reglas, formas, piezas, opciones de ranura) */
        .hcp-chip { cursor:pointer; border-radius:11px; border:1.5px solid ${T.lineStrong}; background:${T.glassSoft};
          color:#fff; font-size:15px; font-weight:800; padding:9px 15px; transition:all .14s; font-family:inherit; }
        .hcp-chip:hover:not(:disabled) { border-color:${accent}; background:rgba(${color.rgba},0.18); transform:translateY(-2px); }
        .hcp-chip:disabled { opacity:.3; cursor:default; }
        .hcp-chip[data-shake="true"] { animation:hcpShake .4s; border-color:${NO}; background:${NO}18; }
        /* La que acertó se queda legible aunque el paso ya esté cerrado: es la
           forma que hay que recordar, no puede apagarse junto a las trampas. */
        .hcp-chip[data-ok="true"] { border-color:${OK}; background:${OK}1c; color:#fff; opacity:1; }

        /* Tarjetas de regla (más altas, con subtítulo) */
        .hcp-regla { cursor:pointer; text-align:left; border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass};
          color:${T.text2}; padding:12px 14px; transition:all .14s; font-family:inherit; display:flex; flex-direction:column; gap:4px; }
        .hcp-regla:hover:not(:disabled) { border-color:${accent}; color:#fff; }
        .hcp-regla:disabled { cursor:default; }
        .hcp-regla[data-shake="true"] { animation:hcpShake .4s; border-color:${NO}; background:${NO}14; }
        .hcp-regla[data-ok="true"] { border-color:${OK}; background:${OK}16; color:#fff; }

        /* Opciones de oración completa */
        .hcp-op { cursor:pointer; display:flex; align-items:flex-start; gap:11px; width:100%; text-align:left; border-radius:12px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14.5px; font-weight:600; padding:12px 15px;
          line-height:1.45; transition:all .14s; font-family:inherit; }
        .hcp-op:hover:not(:disabled) { border-color:${T.lineStrong}; color:#fff; }
        .hcp-op:disabled { cursor:default; }
        .hcp-op[data-ok="true"] { border-color:${OK}; background:${OK}1c; color:#fff; }
        .hcp-op[data-bad="true"] { border-color:${NO}; background:${NO}16; }

        /* Línea de armado */
        .hcp-linea { border-radius:13px; border:1.5px dashed ${T.lineStrong}; background:${T.inset}; min-height:58px;
          padding:11px 14px; display:flex; align-items:center; gap:9px; flex-wrap:wrap; transition:all .16s; }
        .hcp-linea[data-ok="true"] { border-style:solid; border-color:${OK}; background:${OK}10; }
        .hcp-palabra { font-size:16.5px; font-weight:800; color:#fff; }

        /* Ranura dentro del marco de una oración */
        .hcp-ranura { display:inline-flex; align-items:center; gap:6px; border-radius:9px; border:1.5px dashed ${T.lineStrong};
          background:${T.inset}; padding:2px 10px; font-size:16px; font-weight:800; color:${T.text3}; transition:all .16s; }
        .hcp-ranura[data-ok="true"] { border-style:solid; border-color:${OK}; color:${OK}; background:${OK}14; }
        .hcp-ranura[data-activa="true"] { border-color:${accent}; color:#fff; box-shadow:0 0 14px -5px ${accent}; }

        /* Escalera: los tres peldaños */
        .hcp-peldano { border-radius:13px; border:1.5px solid ${T.line}; background:${T.inset}; padding:12px 15px;
          display:flex; flex-direction:column; gap:5px; min-width:0; transition:all .16s; }
        .hcp-peldano[data-ok="true"] { border-color:${OK}; background:${OK}12; }

        /* Tabla de datos */
        .hcp-col { border-radius:14px; border:1.5px solid ${T.line}; background:${T.inset}; padding:13px 15px; min-width:0; }
        .hcp-fila { display:flex; align-items:baseline; justify-content:space-between; gap:12px; padding:5px 0;
          border-bottom:1px solid ${T.line}; font-size:14px; }
        .hcp-fila:last-child { border-bottom:none; }

        .hcp-mini { cursor:pointer; padding:7px 13px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass};
          color:${T.text2}; font-size:14px; font-weight:800; transition:all .14s; font-family:inherit; }
        .hcp-mini:hover:not(:disabled) { border-color:${T.lineStrong}; color:#fff; }
        .hcp-mini:disabled { opacity:.45; cursor:not-allowed; }

        .hcp-vf { cursor:pointer; padding:8px 16px; border-radius:10px; border:1.5px solid ${T.line}; background:${T.glass};
          color:${T.text2}; font-size:14px; font-weight:800; transition:all .14s; font-family:inherit; }
        .hcp-vf:hover:not(:disabled) { border-color:${T.lineStrong}; color:#fff; }
        .hcp-vf:disabled { cursor:default; opacity:.85; }
        .hcp-vf[data-on="true"] { border-color:${OK}; background:${OK}1f; color:#fff; }
        .hcp-vf[data-bad="true"] { border-color:${NO}; background:${NO}1f; color:#fff; }

        /* Simulador «El sábado de Ana» */
        .hsim-foto { position:relative; aspect-ratio:16/9; max-height:210px; width:100%; border-radius:14px; overflow:hidden;
          display:flex; align-items:center; justify-content:center; border:1px solid ${T.line}; }
        .hsim-foto > i { font-size:54px; color:rgba(255,255,255,0.28); }
        .hsim-foto > img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
        .hsim-foto-titulo { position:absolute; left:10px; bottom:10px; right:10px; padding:6px 12px; border-radius:10px; width:fit-content; max-width:calc(100% - 20px);
          background:rgba(2,12,28,0.78); color:#fff; font-size:15px; font-weight:800; }
        .hsim-barra { position:relative; display:grid; grid-template-columns:minmax(84px,auto) minmax(0,1fr) auto; align-items:center; gap:10px;
          padding:8px 10px; border-radius:11px; border:1.5px solid transparent; transition:all .2s; }
        .hsim-barra[data-elegida="true"] { border-color:${accent}; background:rgba(${color.rgba},0.12); }
        .hsim-barra-et { font-size:14.5px; font-weight:800; color:#fff; }
        .hsim-barra-et i { color:${accent}; margin-right:4px; }
        .hsim-barra-pista { height:16px; border-radius:8px; background:${T.inset}; overflow:hidden; display:block; }
        .hsim-barra-fill { display:block; height:100%; border-radius:8px; background:linear-gradient(90deg, rgba(${color.rgba},0.55), ${accent}); transition:width .4s; }
        .hsim-barra-val { font-size:14.5px; font-weight:800; color:#fff; font-variant-numeric:tabular-nums; }
        .hsim-ana { position:absolute; right:10px; top:-11px; padding:2px 10px; border-radius:999px; background:${accent}; color:#021022; font-size:14px; font-weight:900; animation:hsimPop .3s; }
        @keyframes hsimPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .hsim-burbuja { display:flex; align-items:center; gap:12px; flex-wrap:wrap; padding:12px 14px; border-radius:14px; background:${T.inset}; border:1px solid ${T.line}; }
        .hsim-cara { font-size:34px; color:${accent}; transition:color .2s; }
        .hsim-porque { border-radius:12px; padding:12px 14px; font-size:14.5px; line-height:1.55; color:${T.text2}; border:1px solid ${NO}55; background:${NO}12; }
        .hsim-porque[data-ok="true"] { border-color:${OK}55; background:${OK}12; }
        .hsim-porque strong { color:#fff; }
        .hsim-medidores { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap:12px; }
        .hsim-medidor { display:flex; flex-direction:column; gap:6px; min-width:0; }
        .hsim-medidor-cab { display:flex; align-items:baseline; justify-content:space-between; gap:8px; flex-wrap:wrap; font-size:14px; color:${T.text2}; font-weight:700; }
        .hsim-medidor-cab strong { font-variant-numeric:tabular-nums; }
        .hsim-pista { position:relative; height:16px; border-radius:8px; background:${T.inset}; overflow:hidden; }
        .hsim-relleno { height:100%; border-radius:8px; transition:width .4s, background .3s; }
        .hsim-tope { position:absolute; top:0; bottom:0; left:66.667%; width:3px; background:#fff; opacity:.85; }
        .hsim-punto { width:18px; height:18px; border-radius:50%; border:2px solid ${T.lineStrong}; background:transparent; }
        .hsim-punto[data-estado="si"] { background:${OK}; border-color:${OK}; }
        .hsim-punto[data-estado="no"] { background:${NO}; border-color:${NO}; }
        .hsim-final { display:flex; align-items:center; gap:14px; flex-wrap:wrap; padding:12px 14px; border-radius:12px; border:1px solid ${NO}55; background:${NO}10;
          font-size:14.5px; line-height:1.5; color:${T.text2}; }
        .hsim-final[data-ok="true"] { border-color:${OK}55; background:${OK}10; }
        .hsim-final span { flex:1 1 200px; min-width:0; }
        @media (prefers-reduced-motion: reduce){ .hsim-ana { animation:none; } .hsim-barra-fill, .hsim-relleno { transition:none; } }

        /* Identidad del tablero: cada tarjeta lleva su franja de color */
        .hcp-card, .hcp-col { --tono:196; position:relative;
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.10) 0%, transparent 62%); }
        .hcp-card:nth-of-type(6n+1), .hcp-col:nth-of-type(6n+1) { --tono:196; }
        .hcp-card:nth-of-type(6n+2), .hcp-col:nth-of-type(6n+2) { --tono:268; }
        .hcp-card:nth-of-type(6n+3), .hcp-col:nth-of-type(6n+3) { --tono:42; }
        .hcp-card:nth-of-type(6n+4), .hcp-col:nth-of-type(6n+4) { --tono:150; }
        .hcp-card:nth-of-type(6n+5), .hcp-col:nth-of-type(6n+5) { --tono:328; }
        .hcp-card:nth-of-type(6n+6), .hcp-col:nth-of-type(6n+6) { --tono:16; }
        .hcp-card::before, .hcp-col::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
          background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }

        @media (prefers-reduced-motion: reduce){
          .hcp-chip[data-shake="true"], .hcp-regla[data-shake="true"] { animation:none; }
          .hcp-chip:hover { transform:none; }
        }
          `}</style>

          {modo === "simulador" && (
            <SimPanel accent={accent} rgba={color.rgba} indice={simIdx} elegidas={simElegidas} plan={plan} onIr={irSim} onElegir={elegirOracion} />
          )}

          {modo === "escalera" && (
            <EscaleraPanel
              accent={accent}
              indice={escIdx}
              reglaOk={escRegla}
              compOk={escComp}
              supOk={escSup}
              shake={shakeEsc}
              onIr={irEscalon}
              onRegla={elegirRegla}
              onForma={elegirForma}
            />
          )}

          {modo === "datos" && (
            <DatosPanel accent={accent} indice={datIdx} resueltas={datOk} fallos={datFallos} onIr={irTarjeta} onResponder={responderDatos} />
          )}

          {modo === "igualdad" && (
            <IgualdadPanel
              accent={accent}
              indice={igIdx}
              armado={igActual}
              armados={igArmado}
              equivalencias={igEquiv}
              shake={shakeIg}
              onIr={irIgualdad}
              onPieza={ponerPiezaIg}
              onBorrar={borrarPiezaIg}
              onEquiv={responderEquiv}
            />
          )}

          {modo === "preferencias" && (
            <PreferenciasPanel accent={accent} indice={prIdx} elegidas={prOk} shake={shakePr} onIr={irPref} onElegir={elegirRanura} />
          )}

          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={HABITOS_COMPARACIONES_HUECOS}
              accent={accent}
              rgba={color.rgba}
              completado={textoDone}
              onCompletado={() => {
                setTextoDone(true);
                setPie({
                  ok: true,
                  txt: "Texto completo. Es el párrafo de la actividad A2: en siete huecos caben un superlativo (the healthiest), un comparativo largo (more interesting), uno irregular (better), dos adverbios de frecuencia y dos «like + verb-ing».",
                });
                sfxOk();
              }}
              onAcierto={() => sfxSi()}
              onError={() => sfxNo()}
            />
          )}

          {modo !== "simulador" && pieEstado}
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
                  <Dato label="Minutos" value={`${plan.minutos}/${TOPE_MINUTOS}`} col={plan.minutos > TOPE_MINUTOS ? NO : undefined} />
                  <Dato label="Pesos" value={`$${plan.pesos.toLocaleString("en-US")}`} col={plan.pesos > TOPE_PESOS ? NO : undefined} />
                  <Dato label="Ana te entendió" value={`${plan.entendidas}/${SITUACIONES.length}`} />
                  <Dato label="Oraciones exactas" value={`${plan.buenas}/${SITUACIONES.length}`} col={plan.buenas >= SITUACIONES.length ? OK : undefined} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1, 2, 3].map((n) => (
                      <i key={n} className="fa-solid fa-star" style={{ fontSize: 20, color: n <= bestEstrellas ? "#FFC75A" : "rgba(255,255,255,0.16)" }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.45, flex: "1 1 160px" }}>
                    1★ terminar el sábado · 2★ que quepa en tiempo y dinero · 3★ con las cinco oraciones exactas.
                  </span>
                </div>
              </Bloque>
              <Bloque titulo="Pista del modo" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>{consejo}</p>
              </Bloque>
              {SITUACIONES.map((s, i) => {
                const k = simElegidas[s.id];
                const o = k !== undefined ? s.oraciones[k] : undefined;
                return (
                  <Bloque key={s.id} titulo={`${i + 1}. ${s.titulo}`} icono={o ? (o.clase === "ok" ? "fa-circle-check" : "fa-circle-xmark") : "fa-folder-open"}>
                    {o ? (
                      <p style={{ margin: 0, color: T.text2 }}>
                        <strong style={{ color: T.text }}>«{o.texto}»</strong> {o.porque}
                      </p>
                    ) : (
                      <p style={{ margin: 0, color: T.text3 }}>Sin decidir todavía. Ábrela en «El sábado de Ana».</p>
                    )}
                  </Bloque>
                );
              })}
            </>
          ),
        },
        {
          id: "reto",
          etiqueta: "Reto",
          icono: "fa-trophy",
          contenido: (
            <>
              <RetoQuizCard
                quiz={RETO_QUIZ}
                accent={accent}
                rgba={color.rgba}
                aprobado={quizAprobado}
                onAprobado={() => setQuizAprobado(true)}
                playSfx={sonido ? (ok) => (ok ? sfxOk() : sfxNo()) : undefined}
                mensajeAprobado="Ya puedes comparar hábitos, precios y preferencias en inglés sin mezclar las reglas."
              />
              <HechosCard accent={accent} respuestas={hechos} onResponder={responderHecho} />
            </>
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book",
          contenido: (
            <>
              <Bloque titulo="Escala de frecuencia · A1" icono="fa-gauge-high">
                {ESCALA_FRECUENCIA.map((f) => (
                  <div key={f.adverbio} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, fontSize: 14 }}>
                    <span style={{ fontWeight: 800, color: T.text }}>{f.adverbio}</span>
                    <span style={{ color: T.text3, flex: 1, textAlign: "right" }}>{f.es}</span>
                    <span style={{ color: accent, fontWeight: 800, ...NUM, minWidth: 42, textAlign: "right" }}>{f.pct}</span>
                  </div>
                ))}
                <p style={{ margin: 0, color: T.text2 }}>
                  De consulta: aquí la frecuencia se usa como dato que se compara («Ana goes to the gym more often than Luis»).
                </p>
              </Bloque>
              <Bloque titulo="La tarea que viene · A5" icono="fa-pen-nib">
                <p style={{ margin: 0, color: T.text2 }}>{ACTIVIDAD_FINAL_A5}</p>
                {CRITERIOS_A7.map((c, i) => (
                  <p key={i} style={{ margin: 0, color: T.text2 }}>
                    <i className="fa-solid fa-angle-right" style={{ color: accent, marginRight: 8 }} />
                    {c}
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Lectura A1 · para pensar" icono="fa-book-open-reader">
                {COMPRENSION_A1.map((c, i) => (
                  <details key={i} style={{ borderRadius: 11, border: `1px solid ${T.line}`, background: T.inset, padding: "10px 13px" }}>
                    <summary style={{ cursor: "pointer", fontWeight: 700, color: T.text2, lineHeight: 1.45 }}>{c.pregunta}</summary>
                    <p style={{ margin: "9px 0 0", color: T.text3 }}>{c.guia}</p>
                  </details>
                ))}
              </Bloque>
              <Bloque titulo="Se comparan hábitos y datos, no personas" icono="fa-scale-balanced">
                <p style={{ margin: 0, color: T.text2 }}>
                  En todo el laboratorio lo que se pone lado a lado son rutas, precios, climas, frecuencias y libros leídos: cosas que una tabla puede
                  sostener. Comparar cuerpos o capacidades de compañeros con esta gramática no es practicar inglés, es otra cosa.
                </p>
              </Bloque>
              <Bloque titulo="Qué es verbatim y qué es de este laboratorio" icono="fa-quote-right">
                <p style={{ margin: 0, color: T.text2 }}>
                  <strong style={{ color: T.text }}>Verbatim de la progresión IN-III-P04:</strong> la lectura A1 «Habits and Comparisons in English» con
                  sus cuatro preguntas de comprensión y su escala de adverbios de frecuencia, el texto con huecos y sus pistas (A2), el reto evaluable
                  de cinco reactivos con su retroalimentación (A3), los cinco enunciados verdadero/falso (A4), el glosario y la actividad final (A5),
                  las oraciones de A6 y los criterios de la autoevaluación (A7).{" "}
                  <strong style={{ color: T.text }}>Escrito para este laboratorio:</strong> «El sábado de Ana» (simulación), las siete escaleras de
                  adjetivos con su mazo de trampas, las seis tarjetas de datos, las seis oraciones de «as … as» y las seis estructuras de preferencia.
                  Las personas (Ana, Luis, Mateo, Sofía, Daniela), las rutas, los teléfonos y las cafeterías son{" "}
                  <strong style={{ color: T.text }}>ficticios</strong>, y sus precios y tiempos, de simulación. Las cifras de clima de Mérida y
                  Toluca están redondeadas a partir de las normales climatológicas y sirven para comparar dos ciudades, no como dato de reporte.
                  El inglés de todas las oraciones es inglés estadounidense estándar.
                </p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={HABITOS_COMPARACIONES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Eyebrow local (14 px) y modo 0 — «El sábado de Ana» (simulador)
 * ═══════════════════════════════════════════════════════════════════════════ */
function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p style={{ fontSize: 14, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: T.text3, margin: "0 0 13px" }}>{children}</p>
  );
}

const RUTA_FOTOS = "/media/labs-sim/habitos-comparaciones-ingles";

function Medidor({ etiqueta, valor, tope, formato, icono }: { etiqueta: string; valor: number; tope: number; formato: (n: number) => string; icono: string }) {
  const pasa = valor > tope;
  const ancho = Math.min(100, (valor / (tope * 1.5)) * 100);
  return (
    <div className="hsim-medidor" data-pasa={pasa}>
      <div className="hsim-medidor-cab">
        <span>
          <i className={`fa-solid ${icono}`} aria-hidden /> {etiqueta}
        </span>
        <strong style={{ color: pasa ? NO : "#fff" }}>
          {formato(valor)} / {formato(tope)}
        </strong>
      </div>
      <div className="hsim-pista">
        <div className="hsim-relleno" style={{ width: `${ancho}%`, background: pasa ? NO : OK }} />
        <div className="hsim-tope" />
      </div>
      {pasa && <span style={{ fontSize: 14, color: NO, fontWeight: 700 }}>Te pasaste del tope.</span>}
    </div>
  );
}

function SimPanel({
  accent,
  rgba,
  indice,
  elegidas,
  plan,
  onIr,
  onElegir,
}: {
  accent: string;
  rgba: string;
  indice: number;
  elegidas: Record<string, number>;
  plan: PlanSim;
  onIr: (i: number) => void;
  onElegir: (i: number) => void;
}) {
  const s = SITUACIONES[indice] ?? SITUACIONES[0]!;
  const k = elegidas[s.id];
  const o = k !== undefined ? s.oraciones[k] : undefined;
  const maximo = Math.max(...s.barras.map((b) => b.valor));
  const fin = plan.hechas >= SITUACIONES.length;
  const estrellas = estrellasDelPlan(plan);
  const cara = !o ? "fa-face-smile" : o.clase === "gramatica" ? "fa-face-dizzy" : "fa-face-smile";
  const formatoValor = (n: number) => (s.unidad === "$" ? `$${n.toLocaleString("en-US")}` : `${n} ${s.unidad}`);

  return (
    <>
      <div style={{ ...card, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        <Rondas
          total={SITUACIONES.length}
          indice={indice}
          hechas={SITUACIONES.map((x) => elegidas[x.id] !== undefined)}
          etiqueta="situaciones"
          onIr={onIr}
        />

        <div className="hsim-foto" style={{ background: `linear-gradient(135deg, rgba(${rgba},0.34), rgba(2,12,28,0.92))` }}>
          <i className={`fa-solid ${s.icono}`} aria-hidden />
          <img
            src={`${RUTA_FOTOS}/${s.foto}.webp`}
            alt=""
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <span className="hsim-foto-titulo">{s.titulo}</span>
        </div>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: T.text2 }}>{s.contexto}</p>
      </div>

      {/* La gráfica: lo que dice la tabla */}
      <div style={{ ...card, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        <Eyebrow>
          <i className="fa-solid fa-chart-simple" style={{ marginRight: 8, color: accent }} />
          {s.medida} · simulación
        </Eyebrow>
        {s.barras.map((b, i) => {
          const elegida = o !== undefined && o.elige === i;
          return (
            <div key={b.etiqueta} className="hsim-barra" data-elegida={elegida}>
              <span className="hsim-barra-et">
                <i className={`fa-solid ${b.icono}`} aria-hidden /> {b.etiqueta}
              </span>
              <span className="hsim-barra-pista">
                <span className="hsim-barra-fill" style={{ width: `${(b.valor / maximo) * 100}%` }} />
              </span>
              <span className="hsim-barra-val">{formatoValor(b.valor)}</span>
              {elegida && (
                <span className="hsim-ana" title="Ana eligió esta opción">
                  <i className="fa-solid fa-person-dress" aria-hidden /> Ana
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Ana pregunta; tú contestas con una oración */}
      <div style={{ ...card, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="hsim-burbuja">
          <i className={`fa-solid ${cara} hsim-cara`} aria-hidden />
          <div style={{ minWidth: 0, flex: 1 }}>
            <strong style={{ color: T.text, fontSize: 14 }}>Ana</strong>
            <p style={{ margin: "2px 0 0", fontSize: 16, lineHeight: 1.45, color: "#fff", fontWeight: 700 }}>
              «{o ? o.ana : s.pregunta}»
            </p>
          </div>
          <BotonEscuchar txt={o ? o.ana : s.pregunta} accent={accent} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: T.text }}>{o ? "Dijiste:" : "Elige lo que le contestas a Ana:"}</span>
          {s.oraciones.map((x, i) => (
            <button
              key={x.texto}
              type="button"
              className="hcp-op"
              disabled={o !== undefined}
              data-ok={k === i && x.clase === "ok"}
              data-bad={k === i && x.clase !== "ok"}
              onClick={() => onElegir(i)}
            >
              <i className={`fa-solid ${k === i ? (x.clase === "ok" ? "fa-circle-check" : "fa-circle-xmark") : "fa-comment"}`} style={{ marginTop: 3 }} aria-hidden />
              <span>{x.texto}</span>
            </button>
          ))}
        </div>

        {o && (
          <div className="hsim-porque" data-ok={o.clase === "ok"}>
            <strong>
              {o.clase === "ok" ? "Bien armada y cierta." : o.clase === "gramatica" ? "Mal armada: Ana no te entendió." : "Bien armada, pero la gráfica dice otra cosa."}
            </strong>{" "}
            {o.porque}
          </div>
        )}
        {o && indice < SITUACIONES.length - 1 && (
          <button type="button" className="hcp-mini" style={{ alignSelf: "flex-end" }} onClick={() => onIr(indice + 1)}>
            Siguiente situación <i className="fa-solid fa-arrow-right" style={{ marginLeft: 6 }} aria-hidden />
          </button>
        )}
      </div>

      {/* El plan del sábado: la consecuencia acumulada */}
      <div style={{ ...card, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        <Eyebrow>
          <i className="fa-solid fa-calendar-day" style={{ marginRight: 8, color: accent }} />
          El plan del sábado
        </Eyebrow>
        <div className="hsim-medidores">
          <Medidor etiqueta="Tiempo en traslados" valor={plan.minutos} tope={TOPE_MINUTOS} formato={(n) => `${n} min`} icono="fa-clock" />
          <Medidor etiqueta="Dinero gastado" valor={plan.pesos} tope={TOPE_PESOS} formato={(n) => `$${n.toLocaleString("en-US")}`} icono="fa-coins" />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: 14, color: T.text2 }}>
          <span style={{ fontWeight: 800, color: T.text }}>Ana te entendió</span>
          {SITUACIONES.map((x) => {
            const j = elegidas[x.id];
            const oo = j !== undefined ? x.oraciones[j] : undefined;
            const estado = !oo ? "" : oo.clase === "gramatica" ? "no" : "si";
            return <span key={x.id} className="hsim-punto" data-estado={estado} title={x.titulo} />;
          })}
          <span style={{ ...NUM, fontWeight: 800 }}>
            {plan.entendidas}/{plan.hechas}
          </span>
        </div>
        {fin && (
          <div className="hsim-final" data-ok={estrellas >= 2}>
            <div style={{ display: "flex", gap: 4 }}>
              {[1, 2, 3].map((n) => (
                <i key={n} className="fa-solid fa-star" style={{ fontSize: 20, color: n <= estrellas ? "#FFC75A" : "rgba(255,255,255,0.16)" }} />
              ))}
            </div>
            <span>
              {estrellas === 3
                ? "Plan perfecto: cinco oraciones exactas y todo cabe en el tope. Pulsa reiniciar para probar el otro camino del cine."
                : estrellas === 2
                  ? "El plan cabe, pero alguna oración falló. Reinicia y cámbiala para ver cómo cambia lo que hace Ana."
                  : "El sábado se pasó de tiempo o de dinero. Cada oración mal dicha o falsa tuvo un costo: reinicia y mira cuál."}
            </span>
          </div>
        )}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Navegador de rondas, compartido por los cuatro modos
 * ═══════════════════════════════════════════════════════════════════════════ */
function Rondas({
  total,
  indice,
  hechas,
  etiqueta,
  onIr,
}: {
  total: number;
  indice: number;
  hechas: boolean[];
  etiqueta: string;
  onIr: (i: number) => void;
}) {
  const cuantas = hechas.filter(Boolean).length;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
      <div className="hcp-dots">
        <button type="button" className="hcp-dot" onClick={() => onIr(indice - 1)} title="Anterior" aria-label="Ronda anterior">
          <i className="fa-solid fa-chevron-left" />
        </button>
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            type="button"
            className="hcp-dot"
            data-on={i === indice}
            data-done={hechas[i] === true}
            onClick={() => onIr(i)}
            aria-label={`${etiqueta} ${i + 1} de ${total}`}
          >
            {hechas[i] === true ? <i className="fa-solid fa-check" /> : i + 1}
          </button>
        ))}
        <button type="button" className="hcp-dot" onClick={() => onIr(indice + 1)} title="Siguiente" aria-label="Ronda siguiente">
          <i className="fa-solid fa-chevron-right" />
        </button>
      </div>
      <span style={{ fontSize: 14, fontWeight: 800, color: cuantas >= total ? OK : T.text3, ...NUM }}>
        {cuantas}/{total} {etiqueta}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 1 — La escalera del adjetivo
 * ═══════════════════════════════════════════════════════════════════════════ */
function EscaleraPanel({
  accent,
  indice,
  reglaOk,
  compOk,
  supOk,
  shake,
  onIr,
  onRegla,
  onForma,
}: {
  accent: string;
  indice: number;
  reglaOk: Record<string, Regla>;
  compOk: Record<string, string>;
  supOk: Record<string, string>;
  shake: string | null;
  onIr: (i: number) => void;
  onRegla: (r: Regla) => void;
  onForma: (peldano: "comp" | "sup", valor: string) => void;
}) {
  const e: Escalon = ESCALERA[indice] ?? ESCALERA[0]!;
  const rOk = reglaOk[e.id] !== undefined;
  const cOk = compOk[e.id];
  const sOk = supOk[e.id];
  const completa = rOk && cOk !== undefined && sOk !== undefined;

  return (
    <>
      <div style={{ ...card, padding: "18px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
        <Rondas
          total={ESCALERA.length}
          indice={indice}
          hechas={ESCALERA.map((x) => reglaOk[x.id] !== undefined && compOk[x.id] !== undefined && supOk[x.id] !== undefined)}
          etiqueta="escaleras"
          onIr={onIr}
        />

        <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
          <span style={{ fontSize: 34, fontWeight: 900, color: accent, letterSpacing: "-0.01em" }}>{e.adjetivo}</span>
          <span style={{ fontSize: 15, color: T.text2, fontWeight: 600 }}>{e.es}</span>
          <span
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: T.text3,
              border: `1px solid ${T.line}`,
              borderRadius: 999,
              padding: "4px 11px",
            }}
          >
            {e.silabas}
          </span>
        </div>

        {/* Los tres peldaños */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 11 }}>
          <div className="hcp-peldano" data-ok="true">
            <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.08em", color: T.text3, textTransform: "uppercase" }}>Base</span>
            <span style={{ fontSize: 19, fontWeight: 800, color: "#fff" }}>{e.adjetivo}</span>
          </div>
          <div className="hcp-peldano" data-ok={cOk !== undefined}>
            <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.08em", color: T.text3, textTransform: "uppercase" }}>
              Comparative (+ than)
            </span>
            <span style={{ fontSize: 19, fontWeight: 800, color: cOk ? OK : T.text3 }}>{cOk ?? "—"}</span>
          </div>
          <div className="hcp-peldano" data-ok={sOk !== undefined}>
            <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.08em", color: T.text3, textTransform: "uppercase" }}>
              Superlative
            </span>
            <span style={{ fontSize: 19, fontWeight: 800, color: sOk ? OK : T.text3 }}>{sOk ?? "—"}</span>
          </div>
        </div>
      </div>

      {/* Paso 1 — la regla */}
      <div className="hcp-card" data-done={rOk}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          <span
            style={{
              width: 24,
              height: 24,
              borderRadius: 8,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: rOk ? `${OK}22` : `${accent}22`,
              color: rOk ? OK : accent,
              fontSize: 14,
              fontWeight: 900,
            }}
          >
            {rOk ? <i className="fa-solid fa-check" /> : 1}
          </span>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>¿Qué regla le toca a «{e.adjetivo}»?</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
          {REGLAS.map((r) => (
            <button
              key={r.id}
              type="button"
              className="hcp-regla"
              disabled={rOk}
              data-ok={rOk && r.id === e.regla}
              data-shake={shake === `regla:${r.id}`}
              onClick={() => onRegla(r.id)}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 800 }}>
                <i className={`fa-solid ${r.icono}`} style={{ fontSize: 14, color: rOk && r.id === e.regla ? OK : accent }} />
                {r.etiqueta}
              </span>
              <span style={{ fontSize: 14, color: T.text3 }}>{r.detalle}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Paso 2 — el comparativo */}
      {rOk && (
        <div className="hcp-card" data-done={cOk !== undefined}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: 8,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: cOk ? `${OK}22` : `${accent}22`,
                color: cOk ? OK : accent,
                fontSize: 14,
                fontWeight: 900,
              }}
            >
              {cOk ? <i className="fa-solid fa-check" /> : 2}
            </span>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>El comparativo, para poner dos cosas frente a frente</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
            {e.opcionesComp.map((op) => (
              <button
                key={op}
                type="button"
                className="hcp-chip"
                disabled={cOk !== undefined}
                data-ok={cOk === op}
                data-shake={shake === `comp:${op}`}
                onClick={() => onForma("comp", op)}
              >
                {op}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Paso 3 — el superlativo */}
      {rOk && cOk !== undefined && (
        <div className="hcp-card" data-done={sOk !== undefined}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: 8,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: sOk ? `${OK}22` : `${accent}22`,
                color: sOk ? OK : accent,
                fontSize: 14,
                fontWeight: 900,
              }}
            >
              {sOk ? <i className="fa-solid fa-check" /> : 3}
            </span>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>El superlativo, para el extremo de tres o más</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
            {e.opcionesSup.map((op) => (
              <button
                key={op}
                type="button"
                className="hcp-chip"
                disabled={sOk !== undefined}
                data-ok={sOk === op}
                data-shake={shake === `sup:${op}`}
                onClick={() => onForma("sup", op)}
              >
                {op}
              </button>
            ))}
          </div>
        </div>
      )}

      {completa && (
        <div className="hcp-card" data-done="true">
          <Eyebrow>
            <i className="fa-solid fa-quote-left" style={{ marginRight: 8, color: accent }} />
            La escalera, en una oración
          </Eyebrow>
          <p style={{ margin: "0 0 12px", fontSize: 15.5, lineHeight: 1.6, color: "#fff", fontWeight: 600 }}>{e.ejemplo}</p>
          <BotonEscuchar txt={e.ejemplo} accent={accent} />
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 2 — Los datos mandan
 * ═══════════════════════════════════════════════════════════════════════════ */
function DatosPanel({
  accent,
  indice,
  resueltas,
  fallos,
  onIr,
  onResponder,
}: {
  accent: string;
  indice: number;
  resueltas: Record<string, boolean>;
  fallos: Record<string, boolean>;
  onIr: (i: number) => void;
  onResponder: (i: number) => void;
}) {
  const t: TarjetaDatos = TARJETAS[indice] ?? TARJETAS[0]!;
  const resuelta = resueltas[t.id] === true;

  return (
    <>
      <div style={{ ...card, padding: "18px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
        <Rondas total={TARJETAS.length} indice={indice} hechas={TARJETAS.map((x) => resueltas[x.id] === true)} etiqueta="tarjetas" onIr={onIr} />

        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>{t.titulo}</span>
          <span
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: t.cuantas >= 3 ? OK : accent,
              border: `1px solid ${t.cuantas >= 3 ? `${OK}66` : `${accent}66`}`,
              borderRadius: 999,
              padding: "4px 11px",
            }}
          >
            {t.cuantas} cosas comparadas → {t.cuantas >= 3 ? "cabe el superlativo" : "solo comparativo"}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 14, color: T.text2, lineHeight: 1.55 }}>{t.contexto}</p>

        <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(190px, 1fr))`, gap: 11 }}>
          {t.columnas.map((c) => (
            <div key={c.nombre} className="hcp-col">
              <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", marginBottom: 8 }}>{c.nombre}</div>
              {c.filas.map((f) => (
                <div key={f.etiqueta} className="hcp-fila">
                  <span style={{ color: T.text3, fontWeight: 600 }}>{f.etiqueta}</span>
                  <span style={{ color: accent, fontWeight: 800, ...NUM }}>{f.valor}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <span style={{ fontSize: 14, color: T.text3 }}>
          <i className="fa-solid fa-circle-info" style={{ marginRight: 6, opacity: 0.7 }} />
          {t.nota}
        </span>
      </div>

      <div className="hcp-card" data-done={resuelta}>
        <Eyebrow>
          <i className="fa-solid fa-list-check" style={{ marginRight: 8, color: accent }} />
          ¿Cuál de estas oraciones sostienen los datos?
        </Eyebrow>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {t.opciones.map((op, i) => {
            const esCorrecta = resuelta && i === t.correcta;
            const fallada = fallos[`${t.id}:${i}`] === true;
            return (
              <button
                key={op.texto}
                type="button"
                className="hcp-op"
                disabled={resuelta}
                data-ok={esCorrecta}
                data-bad={fallada}
                onClick={() => onResponder(i)}
              >
                <i
                  className={`fa-solid ${esCorrecta ? "fa-circle-check" : fallada ? "fa-circle-xmark" : "fa-circle"}`}
                  style={{ fontSize: 14, marginTop: 2, color: esCorrecta ? OK : fallada ? NO : T.text3, opacity: esCorrecta || fallada ? 1 : 0.35 }}
                />
                <span>{op.texto}</span>
              </button>
            );
          })}
        </div>
        {resuelta && (
          <div style={{ marginTop: 13 }}>
            <BotonEscuchar txt={t.opciones[t.correcta]?.texto ?? ""} accent={accent} />
          </div>
        )}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 3 — as … as / not as … as
 * ═══════════════════════════════════════════════════════════════════════════ */
function IgualdadPanel({
  accent,
  indice,
  armado,
  armados,
  equivalencias,
  shake,
  onIr,
  onPieza,
  onBorrar,
  onEquiv,
}: {
  accent: string;
  indice: number;
  armado: string[];
  armados: Record<string, string[]>;
  equivalencias: Record<string, boolean>;
  shake: string | null;
  onIr: (i: number) => void;
  onPieza: (pieza: string, i: number) => void;
  onBorrar: () => void;
  onEquiv: (i: number) => void;
}) {
  const r: RondaIgualdad = IGUALDADES[indice] ?? IGUALDADES[0]!;
  const lista = armado.length >= r.solucion.length;
  const frase = `${r.solucion.join(" ")}.`;
  const equivOk = equivalencias[r.id] === true;

  return (
    <>
      <div style={{ ...card, padding: "18px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
        <Rondas
          total={IGUALDADES.length}
          indice={indice}
          hechas={IGUALDADES.map((x) => (armados[x.id]?.length ?? 0) >= x.solucion.length && (!x.equivalencia || equivalencias[x.id] === true))}
          etiqueta="oraciones"
          onIr={onIr}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 11, flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: r.negativa ? NO : accent,
              border: `1px solid ${r.negativa ? `${NO}66` : `${accent}66`}`,
              borderRadius: 999,
              padding: "4px 11px",
            }}
          >
            {r.negativa ? "not as … as" : "as … as"}
          </span>
          <span style={{ fontSize: 14, color: T.text3, fontWeight: 700, ...NUM }}>{r.datos}</span>
        </div>

        <p style={{ margin: 0, fontSize: 16, color: "#fff", fontWeight: 700, lineHeight: 1.5 }}>{r.intencion}</p>
        <p style={{ margin: 0, fontSize: 14, color: T.text2, lineHeight: 1.55 }}>
          Toca las piezas <strong style={{ color: T.text }}>en el orden correcto</strong> para decirlo en inglés. Hay piezas que sobran: son las
          que casi todo el mundo usa por costumbre.
        </p>

        <div className="hcp-linea" data-ok={lista}>
          {armado.length === 0 ? (
            <span style={{ fontSize: 14, color: T.text3 }}>Empieza por el sujeto…</span>
          ) : (
            armado.map((p, i) => (
              <span key={`${p}-${i}`} className="hcp-palabra">
                {/* El punto se pega a la última palabra: suelto parecía otra pieza. */}
                {lista && i === armado.length - 1 ? `${p}.` : p}
              </span>
            ))
          )}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
          {r.piezas.map((p, i) => (
            <button
              key={`${r.id}-${i}`}
              type="button"
              className="hcp-chip"
              disabled={lista}
              data-shake={shake === `${r.id}:${i}`}
              onClick={() => onPieza(p, i)}
            >
              {p}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button type="button" className="hcp-mini" onClick={onBorrar} disabled={armado.length === 0 || lista}>
            <i className="fa-solid fa-delete-left" style={{ marginRight: 7 }} />
            Borrar la última
          </button>
          {lista && <BotonEscuchar txt={frase} accent={accent} />}
          {lista && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 800, color: OK }}>
              <i className="fa-solid fa-circle-check" /> Oración armada
            </span>
          )}
        </div>
      </div>

      {lista && r.equivalencia && (
        <div className="hcp-card" data-done={equivOk}>
          <Eyebrow>
            <i className="fa-solid fa-right-left" style={{ marginRight: 8, color: accent }} />
            {r.equivalencia.pregunta}
          </Eyebrow>
          <p style={{ margin: "0 0 12px", fontSize: 14.5, color: T.text2, fontStyle: "italic" }}>«{frase}»</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {r.equivalencia.opciones.map((op, i) => (
              <button
                key={op}
                type="button"
                className="hcp-op"
                disabled={equivOk}
                data-ok={equivOk && i === r.equivalencia!.correcta}
                onClick={() => onEquiv(i)}
              >
                <i
                  className={`fa-solid ${equivOk && i === r.equivalencia!.correcta ? "fa-circle-check" : "fa-circle"}`}
                  style={{ fontSize: 14, marginTop: 2, color: equivOk && i === r.equivalencia!.correcta ? OK : T.text3, opacity: 0.6 }}
                />
                <span>{op}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {lista && (
        <div className="hcp-card">
          <Eyebrow>
            <i className="fa-solid fa-lightbulb" style={{ marginRight: 8, color: accent }} />
            La regla
          </Eyebrow>
          <p style={{ margin: 0, fontSize: 14, color: T.text2, lineHeight: 1.6 }}>{r.regla}</p>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 4 — Preferencias
 * ═══════════════════════════════════════════════════════════════════════════ */
function PreferenciasPanel({
  accent,
  indice,
  elegidas,
  shake,
  onIr,
  onElegir,
}: {
  accent: string;
  indice: number;
  elegidas: Record<string, string>;
  shake: string | null;
  onIr: (i: number) => void;
  onElegir: (k: number, valor: string) => void;
}) {
  const r: RondaPreferencia = PREFERENCIAS[indice] ?? PREFERENCIAS[0]!;
  const activa = r.ranuras.findIndex((_, k) => elegidas[`${r.id}:${k}`] === undefined);
  const completa = activa < 0;
  const ranuraActiva = activa >= 0 ? r.ranuras[activa] : undefined;

  return (
    <>
      <div style={{ ...card, padding: "18px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
        <Rondas
          total={PREFERENCIAS.length}
          indice={indice}
          hechas={PREFERENCIAS.map((x) => x.ranuras.every((_, k) => elegidas[`${x.id}:${k}`] !== undefined))}
          etiqueta="estructuras"
          onIr={onIr}
        />

        <span
          style={{
            alignSelf: "flex-start",
            fontSize: 14,
            fontWeight: 800,
            color: accent,
            border: `1px solid ${accent}66`,
            borderRadius: 999,
            padding: "4px 12px",
          }}
        >
          {r.estructura}
        </span>

        <p style={{ margin: 0, fontSize: 16, color: "#fff", fontWeight: 700, lineHeight: 1.5 }}>{r.intencion}</p>

        <div
          style={{
            borderRadius: 14,
            border: `1.5px solid ${completa ? OK : T.lineStrong}`,
            background: completa ? `${OK}10` : T.inset,
            padding: "16px 18px",
            fontSize: 18,
            lineHeight: 2,
            color: "#fff",
            fontWeight: 600,
            transition: "all .2s",
          }}
        >
          {r.partes.map((parte, i) => (
            <span key={i}>
              {parte}
              {i < r.ranuras.length && (
                <span className="hcp-ranura" data-ok={elegidas[`${r.id}:${i}`] !== undefined} data-activa={i === activa}>
                  {elegidas[`${r.id}:${i}`] ?? "___"}
                </span>
              )}
            </span>
          ))}
        </div>

        {ranuraActiva && (
          <div>
            <p style={{ margin: "0 0 10px", fontSize: 14, color: T.text2, fontWeight: 700 }}>
              Hueco {activa + 1} de {r.ranuras.length}: ¿qué va aquí?
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
              {ranuraActiva.opciones.map((op) => (
                <button
                  key={op}
                  type="button"
                  className="hcp-chip"
                  data-shake={shake === `${r.id}:${activa}:${op}`}
                  onClick={() => onElegir(activa, op)}
                >
                  {op}
                </button>
              ))}
            </div>
          </div>
        )}

        {completa && (
          <div style={{ display: "flex", alignItems: "center", gap: 11, flexWrap: "wrap" }}>
            <BotonEscuchar txt={frasePreferencia(r, elegidas)} accent={accent} />
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 800, color: OK }}>
              <i className="fa-solid fa-circle-check" /> Estructura completa
            </span>
          </div>
        )}
      </div>

      {completa && (
        <div className="hcp-card" data-done="true">
          <Eyebrow>
            <i className="fa-solid fa-lightbulb" style={{ marginRight: 8, color: accent }} />
            La regla
          </Eyebrow>
          <p style={{ margin: 0, fontSize: 14, color: T.text2, lineHeight: 1.6 }}>{r.regla}</p>
        </div>
      )}
    </>
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
    <div style={{ ...card, padding: "20px 22px", marginTop: 18 }}>
      <Eyebrow>
        <i className="fa-solid fa-scale-balanced" style={{ marginRight: 8, color: accent }} />
        Hechos · verdadero o falso (IN-III-P04-A4, verbatim)
      </Eyebrow>
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        {HECHOS.map((h, i) => {
          const dada = respuestas[i];
          const acertada = dada !== null && dada !== undefined && dada === h.respuesta;
          return (
            <div
              key={i}
              style={{
                borderRadius: 13,
                border: `1px solid ${acertada ? `${OK}55` : T.line}`,
                background: acertada ? `${OK}0e` : T.inset,
                padding: "12px 15px",
                display: "flex",
                flexDirection: "column",
                gap: 9,
                transition: "all .18s",
              }}
            >
              <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>{h.enunciado}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="hcp-vf"
                  disabled={acertada}
                  data-on={acertada && h.respuesta === true}
                  data-bad={dada === true && h.respuesta === false}
                  onClick={() => onResponder(i, true)}
                >
                  Verdadero
                </button>
                <button
                  type="button"
                  className="hcp-vf"
                  disabled={acertada}
                  data-on={acertada && h.respuesta === false}
                  data-bad={dada === false && h.respuesta === true}
                  onClick={() => onResponder(i, false)}
                >
                  Falso
                </button>
                {acertada && <span style={{ fontSize: 14, color: OK, fontWeight: 700 }}>{h.retro}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
