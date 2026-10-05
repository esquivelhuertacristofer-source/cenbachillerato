"use client";

/**
 * Laboratorio 3D — "Química orgánica en la industria: de la molécula al producto".
 * Práctica anclada a CNEYT-IV-P06-A2 (quiz «Aplicaciones industriales de la
 * química orgánica») y CNEYT-IV-P06-A6 (completa el texto); progresión 9 de la
 * UAC CNEYT-IV. El marco teórico es la lectura A1, los hechos salen del quiz A4,
 * el glosario del A5 y el panel de debate del A3.
 *
 * Tres modos:
 *  (1) Reactor de síntesis — aspirina, paracetamol, aroma de plátano y
 *      bioetanol con moléculas reales: qué enlaces se rompen y se forman,
 *      reactivo limitante, equilibrio y economía atómica.
 *  (2) Planta de polímeros — polietileno (adición), PET y nylon 6,6
 *      (condensación): el largo de la cadena decide el material.
 *  (3) Del grupo al producto — nueve productos cotidianos: grupo funcional →
 *      propiedad → uso → industria.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import type { ObjetivoLab } from "./_objetivos";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { RetoQuizCard } from "./_reto-quiz";
import { CompletaTexto } from "./_mecanica-huecos";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { ORGANICA_INDUSTRIA_FICHA } from "./organica-industria-ficha";
import type { FaseSintesis } from "./OrganicaIndustriaScene";
import {
  type Modo,
  type ReaccionId,
  type PolimeroId,
  type GrupoId,
  type Industria,
  type Subproducto,
  MODOS,
  MODOS_DEF,
  INDUSTRIAS,
  REACCIONES,
  sintesis,
  masaMolar,
  fq,
  DENSIDAD_ETANOL,
  VOLUMEN_MOLAR_25C,
  K_ESTER,
  POLIMEROS,
  masaCadena,
  estadoPolimero,
  META_POLIMERO,
  balancePorKg,
  PRODUCTOS,
  GRUPOS,
  GRUPOS_ORDEN,
  SUBPRODUCTOS,
  SUBPRODUCTOS_ORDEN,
  PROCESOS,
  rondaProcesos,
  estrellasPorErrores,
  mulberry32,
  TITULO_A1,
  LECTURA_A1,
  RECUADRO_A1,
  PREGUNTAS,
  HECHOS,
  GLOSARIO,
  ACTIVIDAD_A5,
  DEBATE_A3,
  FUENTE,
  PROBLEMA,
  INSTRUCCIONES,
  IDEAS,
  QUIZ_A2,
  HUECOS_A6,
  num,
} from "./organica-industria-data";

const OrganicaIndustriaScene = dynamic(() => import("./OrganicaIndustriaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-atom fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Cargando la planta química en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-organica-industria-reto";
const WARN = "#FF8A3C";
const ROJO = "#f87171";
const T_REACCION = 4300;
const RONDA_INICIAL = rondaProcesos(mulberry32(7));
const IND_ORDEN: Industria[] = ["farmaceutica", "alimentaria", "materiales"];

type Gramos = Record<ReaccionId, { a: number; b: number }>;
const GRAMOS_INICIALES = Object.fromEntries(REACCIONES.map((r) => [r.id, { a: r.gA, b: r.gB }])) as Gramos;
/** Valor del deslizador de cada polímero: log₁₀ del grado de polimerización. */
const LOGN_INICIAL: Record<PolimeroId, number> = { pe: 0, pet: 0.3, nylon: 0.3 };

/** Fórmula con subíndices <sub>: en negritas pesadas algunas fuentes no traen los dígitos subíndice Unicode. */
function Fq({ f }: { f: string }) {
  return (
    <>
      {f.split(/(\d+)/).map((x, i) =>
        /^\d+$/.test(x) ? (
          <sub key={i} style={{ fontSize: "0.7em", verticalAlign: "-0.25em", lineHeight: 0 }}>
            {x}
          </sub>
        ) : (
          <span key={i}>{x}</span>
        ),
      )}
    </>
  );
}

/* ── Tarjeta de estrellas: ¿qué más sale del reactor? ─────────────────── */
function SubproductoCard({ accent, rgba, mejor, onResultado, playSfx }: { accent: string; rgba: string; mejor: number; onResultado: (e: number) => void; playSfx?: (ok: boolean) => void }) {
  const [ronda, setRonda] = useState<number[]>(RONDA_INICIAL);
  const [pos, setPos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [resuelto, setResuelto] = useState<number | null>(null);
  const actual = PROCESOS[ronda[pos] ?? 0]!;

  const responder = (s: Subproducto) => {
    if (resuelto !== null) return;
    const ok = s === actual.sale;
    playSfx?.(ok);
    if (!ok) {
      setErrores((e) => e + 1);
      setAviso(`No es «${SUBPRODUCTOS[s].etq}».`);
      return;
    }
    setAviso(null);
    if (pos + 1 >= ronda.length) {
      const est = estrellasPorErrores(errores);
      setResuelto(est);
      onResultado(est);
    } else setPos((p) => p + 1);
  };
  const otra = () => {
    setRonda(rondaProcesos(Math.random));
    setPos(0);
    setErrores(0);
    setAviso(null);
    setResuelto(null);
  };

  return (
    <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-star" style={{ marginRight: 8, color: accent }} />
          ¿Qué más sale del reactor?
        </Eyebrow>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: T.text3, letterSpacing: "0.06em" }}>MEJOR MARCA</span>
          {[1, 2, 3].map((k) => (
            <i key={k} className="fa-solid fa-star" style={{ fontSize: 14, color: k <= mejor ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
          ))}
        </div>
      </div>
      {resuelto === null ? (
        <>
          <div style={{ fontSize: 14, color: T.text3, fontWeight: 800, marginBottom: 6 }}>
            Proceso {pos + 1} de {ronda.length} · además del producto principal, ¿qué otra sustancia se forma?
          </div>
          <div className="oi-proceso" style={{ fontSize: 15, color: "#fff", fontWeight: 800, lineHeight: 1.45, marginBottom: 12 }}>
            {actual.texto}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {SUBPRODUCTOS_ORDEN.map((s) => (
              <button key={s} className="oi-opt oi-sub" data-on="true" onClick={() => responder(s)} style={{ ["--oic" as string]: accent }}>
                <i className={`fa-solid ${SUBPRODUCTOS[s].icono}`} style={{ marginRight: 8 }} />
                {SUBPRODUCTOS[s].etq}
              </button>
            ))}
          </div>
          {aviso && <div style={{ marginTop: 10, fontSize: 14, color: WARN, lineHeight: 1.5 }}>{aviso} Piensa si los monómeros o reactivos pierden átomos al unirse. Inténtalo de nuevo.</div>}
          {pos > 0 && !aviso && <div style={{ marginTop: 10, fontSize: 14, color: OK, lineHeight: 1.5 }}>{PROCESOS[ronda[pos - 1] ?? 0]!.porque}</div>}
        </>
      ) : (
        <div style={{ padding: "12px 14px", borderRadius: 11, border: `1px solid ${OK}55`, background: "rgba(52,211,153,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
            {[1, 2, 3].map((k) => (
              <i key={k} className="fa-solid fa-star" style={{ fontSize: 15, color: k <= resuelto ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
            ))}
            <span style={{ fontSize: 14, fontWeight: 900, color: OK, marginLeft: 4 }}>Ronda con {errores === 0 ? "cero errores" : `${errores} ${errores === 1 ? "error" : "errores"}`}</span>
          </span>
          <button onClick={otra} style={{ cursor: "pointer", padding: "9px 14px", borderRadius: 10, border: `1px solid ${accent}`, background: `rgba(${rgba},0.16)`, color: "#fff", fontSize: 14, fontWeight: 900 }}>
            <i className="fa-solid fa-shuffle" style={{ marginRight: 8 }} />
            Otra ronda
          </button>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Shell
 * ════════════════════════════════════════════════════════════════════════ */

export function LabOrganicaIndustria({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("sintesis");

  // ── Síntesis
  const [reaccionId, setReaccionId] = useState<ReaccionId>("aspirina");
  const [gramos, setGramos] = useState<Gramos>(GRAMOS_INICIALES);
  const [retirarAgua, setRetirarAgua] = useState(false);
  const [fase, setFase] = useState<FaseSintesis>("listo");
  const [corrida, setCorrida] = useState(0);
  const [hechas, setHechas] = useState<Set<ReaccionId>>(() => new Set());
  const [limitantes, setLimitantes] = useState<Set<string>>(() => new Set());
  const [esterAlto, setEsterAlto] = useState(false);
  const turno = useRef(0);

  // ── Polímeros
  const [polimeroId, setPolimeroId] = useState<PolimeroId>("pe");
  const [logN, setLogN] = useState<Record<PolimeroId, number>>(LOGN_INICIAL);
  const [metas, setMetas] = useState<Set<PolimeroId>>(() => new Set());

  // ── Productos
  const [productoId, setProductoId] = useState(PRODUCTOS[0]!.id);
  const [respGrupo, setRespGrupo] = useState<Record<string, GrupoId>>({});
  const [respInd, setRespInd] = useState<Record<string, Industria>>({});
  const [clasificados, setClasificados] = useState<string[]>([]);

  // ── Evaluables
  const [identifico, setIdentifico] = useState(false);
  const [quizAprobado, setQuizAprobado] = useState(false);
  const [textoOk, setTextoOk] = useState(false);
  const [postura, setPostura] = useState(0);

  // ── Comunes
  const [resetNonce, setResetNonce] = useState(0);
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);
  const timers = useRef<number[]>([]);
  const { mejorEstrellas, registraEstrellas: guardaEstrellas } = useEstrellas(RETO_KEY);
  const registraEstrellas = useCallback(
    (est: number) => {
      setIdentifico(true);
      guardaEstrellas(est);
    },
    [guardaEstrellas],
  );

  const toggleSonido = useCallback(async () => {
    if (!audioRef.current) audioRef.current = new LabSfx();
    const sfx = audioRef.current;
    if (sonido) {
      sfx.mute();
      setSonido(false);
    } else {
      await sfx.enable();
      setSonido(true);
    }
  }, [sonido]);

  useEffect(() => {
    const lista = timers.current;
    return () => {
      audioRef.current?.dispose();
      audioRef.current = null;
      lista.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const despues = (ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  const blip = () => {
    if (sonido) audioRef.current?.blip();
  };
  const sfx = (ok: boolean) => {
    if (!sonido) return;
    if (ok) audioRef.current?.correcto();
    else audioRef.current?.incorrecto();
  };

  const def = MODOS_DEF[modo];
  const modoCol = `#${def.color.replace("#", "")}`;

  /* ── Síntesis ──────────────────────────────────────────────────────── */
  const reac = REACCIONES.find((r) => r.id === reaccionId)!;
  const gr = gramos[reaccionId];
  const res = sintesis(reac, gr.a, gr.b, retirarAgua);
  const esFerm = reaccionId === "fermentacion";

  const elegirReaccion = (id: ReaccionId) => {
    turno.current += 1;
    setReaccionId(id);
    setFase("listo");
    blip();
  };
  const cambiarGramos = (lado: "a" | "b", v: number) => {
    setGramos((g) => ({ ...g, [reaccionId]: { ...g[reaccionId], [lado]: v } }));
  };
  const reaccionar = () => {
    if (fase === "reaccionando") return;
    turno.current += 1;
    const mio = turno.current;
    const id = reaccionId;
    const r = sintesis(reac, gr.a, gr.b, retirarAgua);
    setFase("reaccionando");
    setCorrida((c) => c + 1);
    if (sonido) audioRef.current?.chispa();
    despues(T_REACCION, () => {
      if (turno.current !== mio) return;
      setFase("hecho");
      setHechas((s) => new Set(s).add(id));
      if (reac.b && r.limitante !== "igual") setLimitantes((s) => new Set(s).add(`${id}:${r.limitante}`));
      if (id === "ester" && r.conversion >= 0.85) setEsterAlto(true);
      sfx(true);
    });
  };
  const ambosLimitantes = REACCIONES.some((r) => limitantes.has(`${r.id}:A`) && limitantes.has(`${r.id}:B`));

  /* ── Polímeros ─────────────────────────────────────────────────────── */
  const pol = POLIMEROS.find((p) => p.id === polimeroId)!;
  const valor = logN[polimeroId];
  const nPol = polimeroId === "pe" ? Math.max(1, Math.round(Math.pow(10, valor))) : Math.pow(10, valor);
  const nEntero = Math.max(1, Math.round(nPol));
  const pConv = 1 - 1 / nPol;
  const estado = estadoPolimero(polimeroId, nEntero);
  const meta = META_POLIMERO[polimeroId];
  const balance = balancePorKg(pol);
  const unidadesVis = Math.min(pol.maxVisibles, Math.max(1, Math.floor(nPol + 1e-9)));

  const moverPolimero = (v: number) => {
    setLogN((l) => ({ ...l, [polimeroId]: v }));
    const n = polimeroId === "pe" ? Math.round(Math.pow(10, v)) : Math.pow(10, v);
    if (Math.round(n) >= meta.n && !metas.has(polimeroId)) setMetas((s) => new Set(s).add(polimeroId));
  };
  const elegirPolimero = (id: PolimeroId) => {
    setPolimeroId(id);
    blip();
  };

  /* ── Productos ─────────────────────────────────────────────────────── */
  const prod = PRODUCTOS.find((p) => p.id === productoId)!;
  const gElegido = respGrupo[productoId] ?? null;
  const iElegida = respInd[productoId] ?? null;
  const grupoOk = gElegido === prod.grupo;
  const indOk = iElegida === prod.industria;
  const yaClasificado = clasificados.includes(productoId);

  const elegirProducto = (id: string) => {
    setProductoId(id);
    blip();
  };
  const revisarClasificado = (id: string, g: GrupoId | null, i: Industria | null) => {
    const p = PRODUCTOS.find((x) => x.id === id)!;
    if (g === p.grupo && i === p.industria && !clasificados.includes(id)) {
      setClasificados((c) => [...c, id]);
      sfx(true);
    }
  };
  const elegirGrupo = (g: GrupoId) => {
    if (yaClasificado) return;
    setRespGrupo((r) => ({ ...r, [productoId]: g }));
    if (g !== prod.grupo) sfx(false);
    else blip();
    revisarClasificado(productoId, g, iElegida);
  };
  const elegirIndustria = (i: Industria) => {
    if (yaClasificado) return;
    setRespInd((r) => ({ ...r, [productoId]: i }));
    if (i !== prod.industria) sfx(false);
    else blip();
    revisarClasificado(productoId, gElegido, i);
  };

  const cambiarModo = (m: Modo) => {
    setModo(m);
    blip();
  };
  const reiniciar = () => {
    if (modo === "sintesis") {
      turno.current += 1;
      setFase("listo");
    }
    if (modo === "polimeros") setLogN((l) => ({ ...l, [polimeroId]: LOGN_INICIAL[polimeroId] }));
    setResetNonce((k) => k + 1);
  };

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const objetivos: ObjetivoLab[] = [
    { txt: "Pulsa Reaccionar y mira qué probeta llega a cero: ese es el reactivo limitante", done: limitantes.size > 0 },
    { txt: "Sintetizar los dos fármacos: aspirina (éster) y paracetamol (amida)", done: hechas.has("aspirina") && hechas.has("paracetamol") },
    { txt: "Cambiar las cantidades hasta que el reactivo limitante sea el otro", done: ambosLimitantes },
    { txt: "Llevar el aroma de plátano a 85 % de conversión o más", done: esterAlto },
    { txt: "Fermentar glucosa y obtener bioetanol", done: hechas.has("fermentacion") },
    { txt: "Polimerizar etileno hasta obtener un plástico tenaz", done: metas.has("pe") },
    { txt: "Obtener PET grado botella y nylon grado fibra por condensación", done: metas.has("pet") && metas.has("nylon") },
    { txt: `Clasificar los ${PRODUCTOS.length} productos por grupo funcional e industria`, done: clasificados.length === PRODUCTOS.length },
    { txt: "Ganar estrellas en «¿Qué más sale del reactor?»", done: identifico },
    { txt: "Aprobar el quiz evaluable (A2)", done: quizAprobado },
    { txt: "Completar el texto (A6)", done: textoOk },
  ];

  /* ── Visor ─────────────────────────────────────────────────────────── */
  let chipVivo = "";
  let pie = "";
  if (modo === "sintesis") {
    chipVivo =
      fase === "reaccionando"
        ? "rompiendo y formando enlaces…"
        : fase === "hecho"
          ? esFerm
            ? `${num(res.gP, 1)} g de etanol · ${num(res.gQ, 1)} g de CO₂`
            : `${res.limitante === "igual" ? "sin sobrante" : `limita ${res.limitante === "A" ? reac.a.nombre : reac.b!.nombre}`} · ${num(res.gP, 2)} g de producto`
          : `${reac.etq.toLowerCase()} · listo para reaccionar`;
    pie =
      fase === "hecho"
        ? `Se formó un grupo ${reac.grupoFormado}. ${reac.dato}`
        : fase === "reaccionando"
          ? "Rojo: enlaces que se rompen. Verde: enlaces que se forman. Los fragmentos se mueven como piezas rígidas hasta su lugar en los productos."
          : `${reac.tipo}. En rojo, los enlaces que se van a romper; los átomos resaltados son los que cambian de pareja.`;
  } else if (modo === "polimeros") {
    chipVivo = `${pol.etq.toLowerCase()} · n = ${num(nEntero)} · ${estado.etq.toLowerCase()}`;
    pie = `${estado.detalle} ${pol.tipo === "adicion" ? "Adición: ningún átomo se pierde." : `Condensación: cada enlace ${pol.enlace.split(" ")[0]} libera una molécula de agua.`}`;
  } else {
    chipVivo = `${clasificados.length}/${PRODUCTOS.length} clasificados · ${prod.etq.toLowerCase()}`;
    pie = grupoOk ? `${GRUPOS[prod.grupo].etq}: ${prod.propiedad}` : `${prod.etq}: ${prod.molEtq} (${fq(prod.formula)}). Gira la molécula y busca el grupo funcional que la define.`;
  }

  const probetas = {
    molA: res.molA,
    molB: res.molB,
    avance: res.avance,
    coefP: reac.coefP,
    hayB: !!reac.b,
    tope: Math.max(reac.maxA / masaMolar(reac.a.formula), reac.b ? reac.maxB / masaMolar(reac.b.formula) : 0),
  };

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#04121f", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${def.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{def.etq}</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 440, lineHeight: 1.5 }}>Tu equipo no puede mostrar la escena en 3D, pero los controles y los resultados siguen aquí. {pie}</div>
    </div>
  );

  const sub = (txt: string) => <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px", textTransform: "uppercase" }}>{txt}</div>;
  const nota = (txt: ReactNode, col: string, icono = "fa-circle-info") => (
    <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.55, color: col }}>
      <i className={`fa-solid ${icono}`} style={{ marginRight: 7 }} />
      {txt}
    </div>
  );
  const dato = (etq: string, val: string, col?: string) => <Dato label={etq} value={val} col={col} />;
  const deslizador = (etq: string, aria: string, v: number, min: number, max: number, step: number, onChange: (x: number) => void, mostrar: string, col: string) => (
    <Deslizador key={aria} label={etq} colr={col} valor={mostrar} min={min} max={max} step={step} value={v} onChange={onChange} />
  );

  /* ── Panel ─────────────────────────────────────────────────────────── */
  let control: ReactNode = null;
  if (modo === "sintesis") {
    const mA = masaMolar(reac.a.formula);
    const mB = reac.b ? masaMolar(reac.b.formula) : 0;
    const limNombre = res.limitante === "igual" ? "proporción 1 : 1 exacta" : res.limitante === "A" ? reac.a.nombre : reac.b!.nombre;
    control = (
      <>
        <div className="oi-opts">
          {REACCIONES.map((r) => {
            const on = r.id === reaccionId;
            return (
              <button key={r.id} className="oi-opt oi-reac" data-on={on} onClick={() => elegirReaccion(r.id)} style={{ ["--oic" as string]: modoCol, background: on ? `${modoCol}1f` : "transparent" }}>
                <i className={`fa-solid ${INDUSTRIAS[r.industria].icono}`} style={{ marginRight: 8, color: INDUSTRIAS[r.industria].color }} />
                {r.etq}
                {hechas.has(r.id) && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
              </button>
            );
          })}
        </div>
        {sub(`Industria ${INDUSTRIAS[reac.industria].etq.toLowerCase()} · ${reac.tipo}`)}
        <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(248,250,252,0.05)", border: `1px solid ${T.line}` }}>
          <div style={{ fontSize: 15, color: "#fff", fontWeight: 900, ...NUM }}>
            <Fq f={reac.a.formula} />
            {reac.b && (
              <>
                {" + "}
                <Fq f={reac.b.formula} />
              </>
            )}
            {" → "}
            {reac.coefP > 1 ? `${reac.coefP} ` : ""}
            <Fq f={reac.p.formula} />
            {" + "}
            {reac.coefQ > 1 ? `${reac.coefQ} ` : ""}
            <Fq f={reac.q.formula} />
          </div>
          <div style={{ fontSize: 14, color: T.text2, marginTop: 4, lineHeight: 1.45 }}>
            {reac.a.nombre}
            {reac.b ? ` + ${reac.b.nombre}` : ""} → {reac.p.nombre} + {reac.q.nombre}
          </div>
          <div style={{ fontSize: 14, color: T.text3, marginTop: 6, lineHeight: 1.45 }}>
            <i className="fa-solid fa-fire-burner" style={{ marginRight: 6, color: "#fb923c" }} />
            {reac.condiciones}
          </div>
        </div>
        <div className="oi-2col" style={{ marginTop: 10 }}>
          <div style={{ padding: "10px 12px", borderRadius: 11, border: `1px solid ${ROJO}44`, background: "rgba(248,113,113,0.06)" }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: ROJO, letterSpacing: "0.06em", marginBottom: 5 }}>SE ROMPEN</div>
            {reac.rompe.map((x, i) => (
              <div key={i} style={{ fontSize: 14, color: T.text2, lineHeight: 1.45 }}>
                ✂ {x}
              </div>
            ))}
          </div>
          <div style={{ padding: "10px 12px", borderRadius: 11, border: `1px solid ${OK}44`, background: "rgba(52,211,153,0.06)" }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: OK, letterSpacing: "0.06em", marginBottom: 5 }}>SE FORMAN</div>
            {reac.forma.map((x, i) => (
              <div key={i} style={{ fontSize: 14, color: T.text2, lineHeight: 1.45 }}>
                + {x}
              </div>
            ))}
          </div>
        </div>
        {sub("1 · Cantidades de reactivo")}
        {deslizador(`${reac.a.nombre} (${num(mA, 2)} g/mol)`, `Masa de ${reac.a.nombre} (g)`, gr.a, esFerm ? 10 : 0.5, reac.maxA, esFerm ? 10 : 0.1, (v) => cambiarGramos("a", v), `${num(gr.a, esFerm ? 0 : 1)} g`, accent)}
        {reac.b && deslizador(`${reac.b.nombre} (${num(mB, 2)} g/mol)`, `Masa de ${reac.b.nombre} (g)`, gr.b, 0.5, reac.maxB, 0.1, (v) => cambiarGramos("b", v), `${num(gr.b, 1)} g`, accent)}
        {reac.reversible && (
          <button className="oi-toggle" data-on={retirarAgua} onClick={() => { setRetirarAgua((x) => !x); blip(); }} style={{ marginTop: 12, ["--oic" as string]: retirarAgua ? OK : modoCol }}>
            <i className={`fa-solid ${retirarAgua ? "fa-square-check" : "fa-square"}`} style={{ marginRight: 9, color: retirarAgua ? OK : T.text3 }} />
            Retirar el agua conforme se forma (desplaza el equilibrio)
          </button>
        )}
        {sub("2 · Reacciona")}
        <button className="oi-toggle oi-reaccionar" onClick={reaccionar} disabled={fase === "reaccionando"} style={{ ["--oic" as string]: accent }}>
          <i className={`fa-solid ${fase === "reaccionando" ? "fa-spinner fa-spin" : "fa-bolt"}`} style={{ marginRight: 9, color: accent }} />
          {fase === "reaccionando" ? "Reaccionando…" : fase === "hecho" ? "Reaccionar otra vez" : "Reaccionar"}
        </button>
        {sub(fase === "hecho" ? "3 · Resultado" : "3 · Predicción estequiométrica")}
        <div className="oi-datos">
          {dato(`mol de ${reac.a.nombre.split(" (")[0]}`, num(res.molA, 4))}
          {reac.b ? dato(`mol de ${reac.b.nombre.split(" (")[0]}`, num(res.molB, 4)) : dato("etanol (volumen)", `${num(res.gP / DENSIDAD_ETANOL, 1)} mL`)}
          {reac.b ? dato("Reactivo limitante", limNombre, res.limitante === "igual" ? "#fbbf24" : "#fff") : dato("CO₂ a 25 °C y 1 atm", `${num((res.gQ / masaMolar("CO2")) * VOLUMEN_MOLAR_25C, 1)} L`)}
          {dato(`${reac.producto} (teórico)`, `${num(res.gP, 2)} g`, OK)}
          {dato(reac.q.nombre, `${num(res.gQ, 2)} g`)}
          {reac.b ? dato("Sobra del reactivo en exceso", `${num(res.gExceso, 2)} g`) : dato("Glucosa que reacciona", `${num(res.molA, 3)} mol`)}
          {reac.reversible && dato("Conversión del limitante", `${num(res.conversion * 100, 1)} %`, res.conversion >= 0.85 ? OK : "#fbbf24")}
          {dato("Economía atómica", `${num(res.economiaAtomica * 100, 1)} %`)}
        </div>
        {reac.reversible &&
          nota(
            retirarAgua
              ? "Al retirar el agua, la reacción inversa no puede ocurrir y el equilibrio se desplaza hasta agotar el reactivo limitante (modelo ideal)."
              : `Equilibrio con K ≈ ${K_ESTER}: con cantidades equimolares solo se convierte 2/3 del limitante. Pon exceso de un reactivo o retira el agua (principio de Le Châtelier).`,
            res.conversion >= 0.85 ? OK : "#fbbf24",
            "fa-scale-balanced",
          )}
        {!reac.reversible && reac.b && nota(`Por cada mol de ${reac.a.nombre} se necesita 1 mol de ${reac.b.nombre}. Lo que sobra del reactivo en exceso no se convierte en producto.`, T.text3)}
        {nota("La economía atómica compara la masa del producto deseado con la de todos los reactivos: lo que no queda en el producto es subproducto.", T.text3, "fa-leaf")}
        {fase === "hecho" && nota(reac.dato, OK, "fa-lightbulb")}
      </>
    );
  } else if (modo === "polimeros") {
    control = (
      <>
        <div className="oi-opts">
          {POLIMEROS.map((p) => {
            const on = p.id === polimeroId;
            return (
              <button key={p.id} className="oi-opt oi-pol" data-on={on} onClick={() => elegirPolimero(p.id)} style={{ ["--oic" as string]: modoCol, background: on ? `${modoCol}1f` : "transparent" }}>
                {p.etq}
                {metas.has(p.id) && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
              </button>
            );
          })}
        </div>
        {sub(`${pol.nombre} · polimerización por ${pol.tipo === "adicion" ? "adición" : "condensación"}`)}
        <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(248,250,252,0.05)", border: `1px solid ${T.line}` }}>
          <div style={{ fontSize: 14.5, color: "#fff", fontWeight: 900, ...NUM }}>
            {pol.tipo === "adicion" ? (
              <>
                n <Fq f={pol.monomeros[0]!.formula} /> → –(<Fq f={pol.unidad} />)<sub>n</sub>–
              </>
            ) : (
              <>
                n <Fq f={pol.monomeros[0]!.formula} /> + n <Fq f={pol.monomeros[1]!.formula} /> → –(<Fq f={pol.unidad} />)<sub>n</sub>– + (2n − 1) H<sub>2</sub>O
              </>
            )}
          </div>
          <div style={{ fontSize: 14, color: T.text2, marginTop: 4, lineHeight: 1.45 }}>
            {pol.monomeros.map((m) => m.nombre).join(" + ")} · enlace {pol.enlace}
          </div>
        </div>
        {sub(pol.tipo === "adicion" ? "Largo de la cadena" : "Conversión de los grupos funcionales")}
        {pol.tipo === "adicion"
          ? deslizador("Grado de polimerización (escala logarítmica)", "Grado de polimerización (unidades)", valor, 0, 5.3, 0.01, moverPolimero, `n = ${num(nEntero)}`, modoCol)
          : deslizador("Conversión p (escala logarítmica de 1 − p)", "Conversión de grupos funcionales (%)", valor, 0.3, 3, 0.005, moverPolimero, `p = ${num(pConv * 100, pConv > 0.99 ? 2 : 1)} %`, modoCol)}
        {pol.tipo === "condensacion" && (
          <div style={{ fontSize: 14, color: T.text2, marginTop: 8, ...NUM }}>
            Ecuación de Carothers: Xₙ = 1 / (1 − p) = 1 / {num(1 - pConv, 4)} = <strong style={{ color: "#fff" }}>{num(nPol, 0)} unidades</strong>
          </div>
        )}
        <div className="oi-datos" style={{ marginTop: 10 }}>
          {dato("Unidades por cadena", num(nEntero))}
          {dato("Masa molar de la cadena", `${num(masaCadena(pol, nEntero), 0)} g/mol`)}
          {dato("Material que resulta", estado.etq, estado.util ? OK : "#fbbf24")}
          {pol.tipo === "condensacion" ? dato("Agua liberada por cadena", `${num(2 * nEntero - 1)} moléculas`) : dato("Subproducto", "ninguno")}
        </div>
        {nota(estado.detalle, estado.util ? OK : "#fbbf24", estado.util ? "fa-circle-check" : "fa-triangle-exclamation")}
        {nota(
          <>
            Meta: <strong>{meta.etq}</strong> — {pol.tipo === "adicion" ? `n ≥ ${num(meta.n)}` : `Xₙ ≥ ${meta.n}, es decir p ≥ ${num((1 - 1 / meta.n) * 100, 2)} %`}.{metas.has(polimeroId) ? " ¡Lograda!" : ""}
          </>,
          metas.has(polimeroId) ? OK : T.text2,
          "fa-bullseye",
        )}
        {sub("Balance por kilogramo de polímero")}
        <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55, ...NUM }}>
          {balance.monomeros.map((m) => `${num(m.g)} g de ${m.nombre}`).join(" + ")} → 1 000 g de {pol.etq}
          {balance.agua > 0 ? ` + ${num(balance.agua)} g de agua` : ""}. Economía atómica: <strong style={{ color: "#fff" }}>{num(balance.economiaAtomica * 100, 1)} %</strong>.
        </div>
        {nota(pol.dato, T.text2, "fa-lightbulb")}
        <div style={{ marginTop: 8, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
          {pol.usos} {pol.reciclaje}
        </div>
      </>
    );
  } else {
    control = (
      <>
        <div className="oi-prods">
          {PRODUCTOS.map((p) => {
            const on = p.id === productoId;
            const listo = clasificados.includes(p.id);
            return (
              <button key={p.id} className="oi-opt oi-prod" data-on={on} onClick={() => elegirProducto(p.id)} style={{ ["--oic" as string]: modoCol, background: on ? `${modoCol}1f` : "transparent", textAlign: "left" }}>
                {p.etq}
                {listo && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
              </button>
            );
          })}
        </div>
        {sub(`${prod.etq} · ${prod.molEtq} (${fq(prod.formula)})`)}
        {sub("1 · ¿Qué grupo funcional lo define?")}
        <div className="oi-opts">
          {GRUPOS_ORDEN.map((g) => {
            const on = gElegido === g;
            const col = on ? (g === prod.grupo ? OK : prod.otros.includes(g) ? "#fbbf24" : WARN) : modoCol;
            return (
              <button key={g} className="oi-opt oi-grupo" data-on={on} onClick={() => elegirGrupo(g)} disabled={yaClasificado} style={{ ["--oic" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                {GRUPOS[g].etq} <span style={{ opacity: 0.7, marginLeft: 4 }}>{GRUPOS[g].formula}</span>
              </button>
            );
          })}
        </div>
        {gElegido &&
          (grupoOk
            ? nota(prod.propiedad, OK, "fa-circle-check")
            : prod.otros.includes(gElegido)
              ? nota(`Sí tiene ${GRUPOS[gElegido].etq.toLowerCase()}, pero no es el grupo que lo define aquí. Busca otro grupo en la molécula.`, "#fbbf24", "fa-magnifying-glass")
              : nota(`Esta molécula no tiene ${GRUPOS[gElegido].etq.toLowerCase()} (${GRUPOS[gElegido].formula}). Mira qué átomos rodean al oxígeno o al nitrógeno.`, WARN, "fa-rotate-left"))}
        {sub("2 · ¿A qué industria va?")}
        <div className="oi-opts">
          {IND_ORDEN.map((i) => {
            const on = iElegida === i;
            const col = on ? (i === prod.industria ? OK : WARN) : INDUSTRIAS[i].color;
            return (
              <button key={i} className="oi-opt oi-ind" data-on={on} onClick={() => elegirIndustria(i)} disabled={yaClasificado} style={{ ["--oic" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                <i className={`fa-solid ${INDUSTRIAS[i].icono}`} style={{ marginRight: 8 }} />
                {INDUSTRIAS[i].etq}
              </button>
            );
          })}
        </div>
        {iElegida && !indOk && nota(`No va a la industria ${INDUSTRIAS[iElegida].etq.toLowerCase()}. Piensa para qué se usa el producto.`, WARN, "fa-rotate-left")}
        {yaClasificado && nota(<>{prod.uso} <strong>Enviado a la industria {INDUSTRIAS[prod.industria].etq.toLowerCase()}.</strong></>, OK, "fa-truck-fast")}
        {yaClasificado && clasificados.length < PRODUCTOS.length && (
          <div className="oi-opts" style={{ marginTop: 10 }}>
            <button className="oi-opt oi-sig" data-on="true" onClick={() => elegirProducto(PRODUCTOS.find((p) => !clasificados.includes(p.id))!.id)} style={{ ["--oic" as string]: modoCol, background: `${modoCol}1f` }}>
              Siguiente producto
              <i className="fa-solid fa-forward-step" style={{ marginLeft: 8 }} />
            </button>
          </div>
        )}
        <div style={{ marginTop: 12, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
          Clasificados: {clasificados.length} de {PRODUCTOS.length}. Observa que el mismo grupo aparece en varias industrias: el éster está en la aspirina, en el aroma de plátano y en el PET.
        </div>
      </>
    );
  }

  const css = `
    .oi-opts { display:flex; flex-wrap:wrap; gap:8px; }
    .oi-prods { display:grid; grid-template-columns: repeat(auto-fill, minmax(min(100%,150px),1fr)); gap:8px; }
    .oi-2col { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:8px; }
    .oi-datos { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:8px; }
    .oi-opt { cursor:pointer; border:1px solid var(--oic); border-radius:10px; padding:9px 12px; font-size:14px; font-weight:800; color:#fff; background:transparent; transition:all .15s; }
    .oi-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.72); }
    .oi-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
    .oi-opt:disabled { cursor:default; }
    .oi-opt:disabled[data-on="false"] { opacity:0.55; }
    .oi-toggle { width:100%; cursor:pointer; border:1px solid var(--oic); border-radius:11px; padding:11px 14px; background:rgba(4,10,22,0.4); color:#fff; font-size:14px; font-weight:900; text-align:left; transition:all .15s; }
    .oi-toggle:hover:not(:disabled) { background:rgba(255,255,255,0.07); }
    .oi-toggle:disabled { cursor:default; opacity:0.75; }
    .oi-opt:focus-visible, .oi-toggle:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
  `;

  const teoria = (
    <>
      <Bloque titulo="¿Qué tienen en común una tableta, un dulce y una botella?" icono="fa-industry">
        <div style={{ fontSize: 15, color: T.text2, lineHeight: 1.55 }}>{PROBLEMA}</div>
      </Bloque>
      <Bloque titulo="Cómo usar el laboratorio" icono="fa-list-ol">
        <div style={{ display: "grid", gap: 9 }}>
          {INSTRUCCIONES.map((p, i) => (
            <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${accent}25` }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#04121f", background: accent, flexShrink: 0 }}>{i + 1}</div>
              <div style={{ fontSize: 14, color: "#fff", lineHeight: 1.45, minWidth: 0 }}>{p}</div>
            </div>
          ))}
        </div>
      </Bloque>
      <Bloque titulo={`Lectura A1 · ${TITULO_A1}`} icono="fa-book-open">
        <div style={{ display: "grid", gap: 9 }}>
          {LECTURA_A1.map((p, i) => (
            <div key={i} style={{ fontSize: 15, color: T.text2, lineHeight: 1.55 }}>
              {p}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 14, fontWeight: 900, color: T.text3, letterSpacing: "0.08em" }}>PARA REFLEXIONAR</div>
        <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8 }}>
          {PREGUNTAS.map((q, i) => (
            <li key={i} style={{ fontSize: 15, color: T.text2, lineHeight: 1.45 }}>
              {q}
            </li>
          ))}
        </ul>
      </Bloque>
      <Bloque titulo="Importante (lectura A1)" icono="fa-landmark">
        <div style={{ fontSize: 15, color: T.text2, lineHeight: 1.55 }}>{RECUADRO_A1}</div>
      </Bloque>
      <Bloque titulo="Hechos (quiz A4)" icono="fa-circle-question">
        <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8 }}>
          {HECHOS.map((h, i) => (
            <li key={i} style={{ fontSize: 15, color: T.text2, lineHeight: 1.45 }}>
              {h}
            </li>
          ))}
        </ul>
      </Bloque>
      <Bloque titulo="Glosario (A5)" icono="fa-book">
        <div style={{ display: "grid", gap: 8 }}>
          {GLOSARIO.map((gi, i) => (
            <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
              <span style={{ fontSize: 15, fontWeight: 900, color: accent }}>{gi.termino}. </span>
              <span style={{ fontSize: 15, color: T.text2, lineHeight: 1.45 }}>{gi.definicion}</span>
              <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.4, marginTop: 4 }}>
                <i className="fa-solid fa-flask" style={{ marginRight: 6, color: accent }} />
                {gi.ejemplo}
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 15, color: T.text2 }}>
          <strong style={{ color: "#fff" }}>Actividad:</strong> {ACTIVIDAD_A5}
        </div>
      </Bloque>
      <Bloque titulo="Ideas clave" icono="fa-lightbulb">
        <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 9 }}>
          {IDEAS.map((x, i) => (
            <li key={i} style={{ fontSize: 15, color: T.text2, lineHeight: 1.45 }}>
              {x}
            </li>
          ))}
        </ul>
      </Bloque>
      <Bloque titulo="Debate (A3)" icono="fa-comments">
        <div style={{ fontSize: 15, color: "#fff", fontWeight: 800, lineHeight: 1.45 }}>{DEBATE_A3.tema}</div>
        <div className="oi-opts">
          {DEBATE_A3.posturas.map((p, i) => (
            <button key={i} className="oi-opt oi-postura" data-on={i === postura} onClick={() => { setPostura(i); blip(); }} style={{ ["--oic" as string]: accent, background: i === postura ? `rgba(${color.rgba},0.16)` : "transparent" }}>
              {p.etq}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 15, color: T.text2, fontStyle: "italic", lineHeight: 1.45 }}>«{DEBATE_A3.posturas[postura]!.postura}»</div>
        <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 7 }}>
          {DEBATE_A3.posturas[postura]!.argumentos.map((a, i) => (
            <li key={i} style={{ fontSize: 15, color: T.text2, lineHeight: 1.45 }}>
              {a}
            </li>
          ))}
        </ul>
        <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.45 }}>Reglas: {DEBATE_A3.reglas.join(" ")}</div>
      </Bloque>
      <Bloque titulo="Ficha teórica" icono="fa-book">
        <FichaTeorica data={ORGANICA_INDUSTRIA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
      </Bloque>
      <p style={{ marginTop: 18, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
        La lectura A1 con su recuadro y sus preguntas, los hechos del quiz A4, el glosario A5, el debate A3, el quiz A2 y el texto A6 son <strong>verbatim</strong> del material de la
        plataforma. Las moléculas de las reacciones y de los productos son <strong>confórmeros 3D reales de PubChem</strong>; la trayectoria de los átomos es una animación didáctica
        (los mecanismos reales pasan por intermedios y, en la fermentación, por 12 pasos enzimáticos). Las cadenas de PE, PET y nylon se dibujan en zigzag extendido con
        longitudes y ángulos típicos. Masas molares con masas atómicas IUPAC; la constante K ≈ 4 de la esterificación es un valor típico ilustrativo y los umbrales de grado de
        polimerización para cera, fibra o botella son <strong>aproximados</strong>. Fuente: {FUENTE}
      </p>
    </>
  );

  return (
    <LabShell
      accent={modoCol}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <OrganicaIndustriaScene
            vista={modo}
            modoColor={modoCol}
            resetNonce={resetNonce}
            reaccion={reaccionId}
            corrida={corrida}
            fase={fase}
            polimero={polimeroId}
            unidades={unidadesVis}
            nivel={estado.nivel}
            extraEtq={nEntero > pol.maxVisibles ? `+ ${num(nEntero - pol.maxVisibles)} unidades más` : null}
            productoId={productoId}
            resaltar={gElegido}
            resaltarOk={grupoOk}
            clasificados={clasificados}
            probetas={probetas}
          />
        </SceneBoundary>
      }
      modos={{
        opciones: MODOS.map((m) => ({ id: m, etiqueta: MODOS_DEF[m].etq, icono: MODOS_DEF[m].icono })),
        valor: modo,
        cambiar: (id) => cambiarModo(id as Modo),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reiniciar} />
        </>
      }
      lectura={chipVivo}
      objetivos={objetivos}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <style>{css}</style>
              <Bloque titulo={`${def.etq} — ${def.subtitulo}`} icono={def.icono}>
                <div style={{ fontSize: 15, color: T.text2, lineHeight: 1.5 }}>{pie}</div>
                {control}
              </Bloque>
            </>
          ),
        },
        {
          id: "reto",
          etiqueta: "Reto",
          icono: "fa-trophy",
          contenido: (
            <>
              <style>{css}</style>
              <SubproductoCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sfx} />
              <RetoQuizCard quiz={QUIZ_A2} accent={accent} rgba={color.rgba} aprobado={quizAprobado} onAprobado={() => setQuizAprobado(true)} playSfx={sfx} playPick={blip} mensajeAprobado="¡Aprobado! Sabes cómo la química orgánica llega a la industria." />
              <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
                <Eyebrow>
                  <i className="fa-solid fa-keyboard" style={{ marginRight: 8, color: accent }} />
                  Completa el texto (A6)
                </Eyebrow>
                <div style={{ marginTop: 12 }}>
                  <CompletaTexto data={HUECOS_A6} accent={accent} rgba={color.rgba} completado={textoOk} onCompletado={() => { setTextoOk(true); sfx(true); }} onAcierto={blip} onError={() => sfx(false)} />
                </div>
              </div>
            </>
          ),
        },
        { id: "teoria", etiqueta: "Teoría", icono: "fa-book-open", contenido: <><style>{css}</style>{teoria}</> },
      ]}
    />
  );
}
