"use client";

/**
 * Laboratorio 3D — "Energías renovables y no renovables en México".
 * Práctica anclada a CNEYT-II-P07-A2 (quiz verdadero/falso «¿Verdadero o
 * falso? Energía en México») y CNEYT-II-P07-A6 (completa el texto);
 * progresión 11 de la UAC CNEYT-II. El marco teórico es la infografía A1, los
 * hechos salen del quiz A4, el glosario del A5 y la tarjeta de estrellas usa
 * la clasificación A11 con el ritmo contrarreloj del reto A10.
 *
 * Tres modos:
 *  (1) Mapa de centrales — doce centrales reales en un relieve de México:
 *      capacidad instalada frente a generación real (factor de planta).
 *  (2) Un día en la red — sol, viento, baterías y gas frente a la curva de
 *      demanda, hora por hora, en verano o invierno.
 *  (3) Emisiones y agotamiento — la mezcla nacional y sus emisiones de ciclo
 *      de vida, y la caída de la producción petrolera 2004–2023.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { CompletaTexto } from "./_mecanica-huecos";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { RENOVABLES_MEXICO_FICHA } from "./renovables-mexico-ficha";
import type { SubMezcla } from "./RenovablesMexicoScene";
import {
  type Modo,
  type Estacion,
  type PresetId,
  type OrdenRetiro,
  type ResultadoRed,
  MODOS,
  MODOS_DEF,
  TEC,
  TECNOLOGIAS,
  CENTRALES,
  generacionGWh,
  emisionesT,
  PAR_PREDICCION,
  FP_SOLAR_TIPICO,
  SOLAR_MAX_MW,
  TOLERANCIA_EQUIV,
  mwSolarEquivalente,
  ESTACIONES,
  GEO_MW,
  SOL,
  LIMITES_RED,
  RED_INICIAL,
  HORAS_BATERIA,
  EFICIENCIA_BATERIA,
  simulaRed,
  pasoEn,
  horaTexto,
  DT_H,
  PRESETS,
  ORDENES,
  mezclaAjustada,
  pctRenovable,
  pctLimpia,
  emisionesMt,
  META_LIMPIA,
  TWH_MEXICO,
  PRODUCCION,
  ELEMENTOS_A11,
  CRITERIO_A11,
  SEGUNDOS_POR_REACTIVO,
  rondaElementos,
  estrellasPorErrores,
  mulberry32,
  TITULO_A1,
  CONTEXTO_A1,
  PUNTOS_A1,
  PREGUNTAS_A1,
  ACTIVIDAD_POST_A1,
  FUENTE_A1,
  HECHOS,
  GLOSARIO,
  ACTIVIDAD_A5,
  FUENTE,
  PROBLEMA,
  INSTRUCCIONES,
  IDEAS,
  QUIZ_A2,
  HUECOS_A6,
  num,
} from "./renovables-mexico-data";

const RenovablesScene = dynamic(() => import("./RenovablesMexicoScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-solar-panel fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Cargando el mapa energético de México en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-renovables-mexico-reto";
const WARN = "#FF8A3C";
const NO = "#f87171";
const MS_PASO = 140;
const RONDA_INICIAL = rondaElementos(mulberry32(7));

/* ── Tarjeta de estrellas: ¿renovable o no renovable? contrarreloj ──────── */
function RenovableCard({ accent, rgba, mejor, onResultado, playSfx }: { accent: string; rgba: string; mejor: number; onResultado: (e: number) => void; playSfx?: (ok: boolean) => void }) {
  const [ronda, setRonda] = useState<number[]>(RONDA_INICIAL);
  const [pos, setPos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [resuelto, setResuelto] = useState<number | null>(null);
  const [inicio, setInicio] = useState<number | null>(null);
  const [ahora, setAhora] = useState(0);
  const actual = ELEMENTOS_A11[ronda[pos] ?? 0]!;

  useEffect(() => {
    if (inicio === null || resuelto !== null) return;
    const id = window.setInterval(() => {
      const t = Date.now();
      setAhora(t);
      if ((t - inicio) / 1000 >= SEGUNDOS_POR_REACTIVO) {
        setErrores((e) => e + 1);
        setAviso(`Se acabó el tiempo. Es ${actual.renovable ? "renovable" : "no renovable"}: ${actual.explicacion}`);
        setInicio(t);
        playSfx?.(false);
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [inicio, resuelto, actual, playSfx]);

  const restante = inicio === null ? SEGUNDOS_POR_REACTIVO : Math.max(0, Math.ceil(SEGUNDOS_POR_REACTIVO - (ahora - inicio) / 1000));

  const empezar = () => {
    const t = Date.now();
    setInicio(t);
    setAhora(t);
  };
  const responder = (renovable: boolean) => {
    if (resuelto !== null || inicio === null) return;
    const ok = renovable === actual.renovable;
    playSfx?.(ok);
    if (!ok) {
      setErrores((e) => e + 1);
      setAviso(`${actual.renovable ? "Es renovable" : "No es renovable"}: ${actual.explicacion}`);
      return;
    }
    setAviso(null);
    const t = Date.now();
    if (pos + 1 >= ronda.length) {
      const est = estrellasPorErrores(errores);
      setResuelto(est);
      onResultado(est);
    } else {
      setPos((p) => p + 1);
      setInicio(t);
      setAhora(t);
    }
  };
  const otra = () => {
    setRonda(rondaElementos(Math.random));
    setPos(0);
    setErrores(0);
    setAviso(null);
    setResuelto(null);
    setInicio(null);
  };

  return (
    <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-star" style={{ marginRight: 8, color: accent }} />
          ¿Renovable o no renovable? · contrarreloj
        </Eyebrow>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10.5, fontWeight: 800, color: T.text3, letterSpacing: "0.06em" }}>MEJOR MARCA</span>
          {[1, 2, 3].map((k) => (
            <i key={k} className="fa-solid fa-star" style={{ fontSize: 13, color: k <= mejor ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
          ))}
        </div>
      </div>
      <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5, marginBottom: 12 }}>
        {CRITERIO_A11} <span style={{ color: T.text3 }}>(Clasificación A11; {SEGUNDOS_POR_REACTIVO} segundos por fuente, como el reto A10.)</span>
      </div>
      {resuelto === null ? (
        inicio === null ? (
          <button className="rm-opt rm-empezar" data-on="true" onClick={empezar} style={{ ["--rmc" as string]: accent, background: `rgba(${rgba},0.16)` }}>
            <i className="fa-solid fa-stopwatch" style={{ marginRight: 8 }} />
            Empezar la ronda de {ronda.length} fuentes
          </button>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: T.text3, fontWeight: 800 }}>
                Fuente {pos + 1} de {ronda.length}
              </span>
              <span style={{ fontSize: 12, fontWeight: 900, color: restante <= 5 ? WARN : "#fff", ...NUM }}>
                <i className="fa-solid fa-stopwatch" style={{ marginRight: 6 }} />
                {restante} s
              </span>
            </div>
            <div style={{ height: 4, borderRadius: 4, background: "rgba(255,255,255,0.08)", marginBottom: 10, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(restante / SEGUNDOS_POR_REACTIVO) * 100}%`, background: restante <= 5 ? WARN : accent, transition: "width .25s linear" }} />
            </div>
            <div className="rm-fuente" style={{ fontSize: 15, color: "#fff", fontWeight: 800, lineHeight: 1.45, marginBottom: 12 }}>
              {actual.texto}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="rm-opt rm-clasif" data-on="true" onClick={() => responder(true)} style={{ ["--rmc" as string]: OK }}>
                <i className="fa-solid fa-rotate" style={{ marginRight: 8 }} />
                Renovable
              </button>
              <button className="rm-opt rm-clasif" data-on="true" onClick={() => responder(false)} style={{ ["--rmc" as string]: WARN }}>
                <i className="fa-solid fa-hourglass-end" style={{ marginRight: 8 }} />
                No renovable
              </button>
            </div>
            {aviso && <div style={{ marginTop: 10, fontSize: 12, color: WARN, lineHeight: 1.5 }}>{aviso}</div>}
          </>
        )
      ) : (
        <div style={{ padding: "12px 14px", borderRadius: 11, border: `1px solid ${OK}55`, background: "rgba(52,211,153,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
            {[1, 2, 3].map((k) => (
              <i key={k} className="fa-solid fa-star" style={{ fontSize: 15, color: k <= resuelto ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
            ))}
            <span style={{ fontSize: 12.5, fontWeight: 900, color: OK, marginLeft: 4 }}>Ronda con {errores === 0 ? "cero errores" : `${errores} ${errores === 1 ? "error" : "errores"}`}</span>
          </span>
          <button onClick={otra} style={{ cursor: "pointer", padding: "9px 14px", borderRadius: 10, border: `1px solid ${accent}`, background: `rgba(${rgba},0.16)`, color: "#fff", fontSize: 12.5, fontWeight: 900 }}>
            <i className="fa-solid fa-shuffle" style={{ marginRight: 8 }} />
            Otra ronda
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Gráfica del día (SVG) ──────────────────────────────────────────────── */
const G_W = 360;
const G_H = 150;

function GraficaDia({ red, hora }: { red: ResultadoRed; hora: number }) {
  const maxY = Math.max(1300, ...red.pasos.map((p) => Math.max(p.demanda, p.geo + p.solar + p.eolica))) * 1.05;
  const X = (h: number) => (h / 24) * G_W;
  const Y = (v: number) => G_H - (v / maxY) * G_H;
  const capas = red.pasos.map((p) => {
    const geo = Math.min(p.geo, p.demanda);
    const eol = Math.min(p.eolica, p.demanda - geo);
    const sol = Math.min(p.solar, p.demanda - geo - eol);
    const c1 = geo;
    const c2 = c1 + eol;
    const c3 = c2 + sol;
    const c4 = c3 + p.descarga;
    const c5 = c4 + p.gas;
    return { h: p.h, c1, c2, c3, c4, c5, d: p.demanda, ren: p.geo + p.solar + p.eolica };
  });
  const area = (arriba: (c: (typeof capas)[number]) => number, abajo: (c: (typeof capas)[number]) => number) => {
    const ida = capas.map((c) => `${X(c.h).toFixed(1)},${Y(arriba(c)).toFixed(1)}`);
    const vuelta = [...capas].reverse().map((c) => `${X(c.h).toFixed(1)},${Y(abajo(c)).toFixed(1)}`);
    return `M${ida.join("L")}L${vuelta.join("L")}Z`;
  };
  const linea = capas.map((c, i) => `${i ? "L" : "M"}${X(c.h).toFixed(1)},${Y(c.d).toFixed(1)}`).join("");
  return (
    <svg viewBox={`0 0 ${G_W} ${G_H + 18}`} style={{ width: "100%", display: "block" }} role="img" aria-label="Generación y demanda a lo largo del día">
      {[0, 6, 12, 18, 24].map((h) => (
        <g key={h}>
          <line x1={X(h)} x2={X(h)} y1={0} y2={G_H} stroke="rgba(255,255,255,0.08)" />
          <text x={Math.min(G_W - 14, Math.max(2, X(h) - 8))} y={G_H + 13} fontSize={9.5} fill="rgba(255,255,255,0.45)">
            {String(h).padStart(2, "0")} h
          </text>
        </g>
      ))}
      <path d={area((c) => c.ren, (c) => c.c3)} fill="#fde68a" opacity={0.22} />
      <path d={area((c) => c.c1, () => 0)} fill={TEC.geotermia.color} opacity={0.85} />
      <path d={area((c) => c.c2, (c) => c.c1)} fill={TEC.eolica.color} opacity={0.85} />
      <path d={area((c) => c.c3, (c) => c.c2)} fill={TEC.solar.color} opacity={0.85} />
      <path d={area((c) => c.c4, (c) => c.c3)} fill="#34d399" opacity={0.85} />
      <path d={area((c) => c.c5, (c) => c.c4)} fill={TEC.gas.color} opacity={0.85} />
      <path d={area((c) => c.d, (c) => c.c5)} fill={NO} opacity={0.75} />
      <path d={linea} fill="none" stroke="#fff" strokeWidth={1.6} />
      <line x1={X(hora + DT_H / 2)} x2={X(hora + DT_H / 2)} y1={0} y2={G_H} stroke="#fff" strokeWidth={1.2} strokeDasharray="3 3" />
    </svg>
  );
}

/* ── Deslizador con etiqueta y valor ─────────────────────────────────── */
function Deslizador({ etq, unidad, valor, min, max, paso, on, col, icono, fmt }: { etq: string; unidad: string; valor: number; min: number; max: number; paso: number; on: (v: number) => void; col: string; icono: string; fmt?: (v: number) => string }) {
  return (
    <label style={{ display: "grid", gridTemplateColumns: "18px minmax(0,1fr) 92px", alignItems: "center", gap: 10, marginTop: 10 }}>
      <i className={`fa-solid ${icono}`} style={{ color: col }} />
      <span style={{ display: "grid", gap: 4 }}>
        <span style={{ fontSize: 11, color: T.text2, fontWeight: 800 }}>{etq}</span>
        <input type="range" aria-label={`${etq} (${unidad})`} className="rm-range" min={min} max={max} step={paso} value={valor} onChange={(e) => on(Number(e.target.value))} style={{ ["--rmc" as string]: col }} />
      </span>
      <span style={{ textAlign: "right", fontSize: 13, color: "#fff", fontWeight: 800, ...NUM }}>{fmt ? fmt(valor) : `${num(valor)} ${unidad}`}</span>
    </label>
  );
}

const fmtPct = (v: number) => `${num(v, 1)} %`;
const fmtAnio = (v: number) => String(PRODUCCION[v]!.anio);

/* ════════════════════════════════════════════════════════════════════════
 * Shell
 * ════════════════════════════════════════════════════════════════════════ */

export function LabRenovablesMexico({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("mapa");

  // ── Mapa
  const [centralSel, setCentralSel] = useState("laguna-verde");
  const [consultadas, setConsultadas] = useState<Set<string>>(() => new Set(["laguna-verde"]));
  const [prediccion, setPrediccion] = useState<string | null>(null);
  const [solarEquiv, setSolarEquiv] = useState(0);
  const [igualado, setIgualado] = useState(false);

  // ── Red
  const [estacion, setEstacion] = useState<Estacion>("verano");
  const [nublado, setNublado] = useState(false);
  const [solarMW, setSolarMW] = useState(RED_INICIAL.solarMW);
  const [eolicaMW, setEolicaMW] = useState(RED_INICIAL.eolicaMW);
  const [bateriaMWh, setBateriaMWh] = useState(RED_INICIAL.bateriaMWh);
  const [gasMW, setGasMW] = useState(RED_INICIAL.gasMW);
  const [hora, setHora] = useState(12);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [vioDeficit, setVioDeficit] = useState(false);
  const [cubrio, setCubrio] = useState(false);

  // ── Mezcla
  const [subMezcla, setSubMezcla] = useState<SubMezcla>("emisiones");
  const [presetId, setPresetId] = useState<PresetId>("mexico");
  const [solarPct, setSolarPct] = useState(PRESETS[0]!.mezcla.solar);
  const [eolicaPct, setEolicaPct] = useState(PRESETS[0]!.mezcla.eolica);
  const [orden, setOrden] = useState<OrdenRetiro>("sucios");
  const [ordenesProbadas, setOrdenesProbadas] = useState<Set<OrdenRetiro>>(() => new Set());
  const [metaOk, setMetaOk] = useState(false);
  const [anioIdx, setAnioIdx] = useState(0);
  const [agotamientoVisto, setAgotamientoVisto] = useState(false);

  // ── Evaluables
  const [clasifico, setClasifico] = useState(false);
  const [quizAprobado, setQuizAprobado] = useState(false);
  const [textoOk, setTextoOk] = useState(false);

  // ── Comunes
  const [resetNonce, setResetNonce] = useState(0);
  const [drawer, setDrawer] = useState(false);
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);
  const { mejorEstrellas, registraEstrellas: guardaEstrellas } = useEstrellas(RETO_KEY);
  const registraEstrellas = useCallback(
    (est: number) => {
      setClasifico(true);
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
    return () => {
      audioRef.current?.dispose();
      audioRef.current = null;
    };
  }, []);

  const blip = () => {
    if (sonido) audioRef.current?.blip();
  };
  const sfx = useCallback(
    (ok: boolean) => {
      if (!sonido) return;
      if (ok) audioRef.current?.correcto();
      else audioRef.current?.incorrecto();
    },
    [sonido],
  );

  const def = MODOS_DEF[modo];
  const modoCol = `#${def.color.replace("#", "")}`;

  /* ── Mapa ──────────────────────────────────────────────────────────── */
  const central = CENTRALES.find((c) => c.id === centralSel)!;
  const revelado = prediccion !== null;
  const genSel = generacionGWh(central.mw, central.fp);
  const [idA, idB] = PAR_PREDICCION;
  const cA = CENTRALES.find((c) => c.id === idA)!;
  const cB = CENTRALES.find((c) => c.id === idB)!;
  const ganador = generacionGWh(cA.mw, cA.fp) >= generacionGWh(cB.mw, cB.fp) ? cA : cB;
  const lv = CENTRALES.find((c) => c.id === "laguna-verde")!;
  const genLV = generacionGWh(lv.mw, lv.fp);
  const genPaneles = generacionGWh(solarEquiv, FP_SOLAR_TIPICO);
  const equivMW = mwSolarEquivalente(lv.mw, lv.fp);

  const elegirCentral = useCallback(
    (id: string) => {
      setCentralSel(id);
      setConsultadas((s) => (s.has(id) ? s : new Set(s).add(id)));
      if (sonido) audioRef.current?.blip();
    },
    [sonido],
  );
  const predecir = (id: string) => {
    if (prediccion) return;
    setPrediccion(id);
    sfx(id === ganador.id);
  };
  const moverPaneles = (v: number) => {
    setSolarEquiv(v);
    if (v > 0 && Math.abs(generacionGWh(v, FP_SOLAR_TIPICO) - genLV) / genLV <= TOLERANCIA_EQUIV) {
      if (!igualado) sfx(true);
      setIgualado(true);
    }
  };

  /* ── Red ───────────────────────────────────────────────────────────── */
  const params = useMemo(() => ({ estacion, nublado, solarMW, eolicaMW, bateriaMWh, gasMW }), [estacion, nublado, solarMW, eolicaMW, bateriaMWh, gasMW]);
  const red = useMemo(() => simulaRed(params), [params]);
  const paso = pasoEn(red, hora);
  const sol = SOL[estacion];
  const nocheEn = (h: number) => h + DT_H / 2 < sol.sale || h + DT_H / 2 > sol.pone;

  const revisaCobertura = (r: ResultadoRed) => {
    if (r.deficitMWh < 1 && r.pctRenovable >= 60 && r.descargaMWh > 1) {
      if (!cubrio) sfx(true);
      setCubrio(true);
    }
  };
  const cambiaRed = (cambio: Partial<typeof params>) => {
    const nuevo = { ...params, ...cambio };
    if (cambio.estacion !== undefined) setEstacion(cambio.estacion);
    if (cambio.nublado !== undefined) setNublado(cambio.nublado);
    if (cambio.solarMW !== undefined) setSolarMW(cambio.solarMW);
    if (cambio.eolicaMW !== undefined) setEolicaMW(cambio.eolicaMW);
    if (cambio.bateriaMWh !== undefined) setBateriaMWh(cambio.bateriaMWh);
    if (cambio.gasMW !== undefined) setGasMW(cambio.gasMW);
    const r = simulaRed(nuevo);
    revisaCobertura(r);
    const p = pasoEn(r, hora);
    const s = SOL[nuevo.estacion];
    if (p.deficit > 0.5 && (p.h < s.sale || p.h > s.pone)) setVioDeficit(true);
  };
  const moverHora = (h: number) => {
    setHora(h);
    const p = pasoEn(red, h);
    if (p.deficit > 0.5 && nocheEn(h)) setVioDeficit(true);
  };

  useEffect(() => {
    if (!reproduciendo) return;
    const id = window.setTimeout(() => {
      const nh = hora + DT_H;
      if (nh >= 24) {
        setReproduciendo(false);
        return;
      }
      setHora(nh);
      const p = pasoEn(red, nh);
      if (p.deficit > 0.5 && (p.h < SOL[estacion].sale || p.h > SOL[estacion].pone)) setVioDeficit(true);
    }, MS_PASO);
    return () => window.clearTimeout(id);
  }, [reproduciendo, hora, red, estacion]);

  const reproducir = () => {
    if (reproduciendo) {
      setReproduciendo(false);
      return;
    }
    if (hora >= 24 - DT_H) setHora(0);
    setReproduciendo(true);
    blip();
  };

  /* ── Mezcla ────────────────────────────────────────────────────────── */
  const preset = PRESETS.find((p) => p.id === presetId)!;
  const { mezcla, recortado } = mezclaAjustada(preset.mezcla, solarPct, eolicaPct, orden);
  const agregado = solarPct - preset.mezcla.solar + (eolicaPct - preset.mezcla.eolica);
  const mtActual = emisionesMt(mezcla);
  const mtMexico = emisionesMt(PRESETS[0]!.mezcla);
  const mtSucios = emisionesMt(mezclaAjustada(preset.mezcla, solarPct, eolicaPct, "sucios").mezcla);
  const mtGas = emisionesMt(mezclaAjustada(preset.mezcla, solarPct, eolicaPct, "gas").mezcla);
  const anio = PRODUCCION[anioIdx]!;

  const revisaMezcla = (pid: PresetId, s: number, e: number, o: OrdenRetiro) => {
    const base = PRESETS.find((p) => p.id === pid)!;
    const m = mezclaAjustada(base.mezcla, s, e, o).mezcla;
    const add = s - base.mezcla.solar + (e - base.mezcla.eolica);
    if (pid === "mexico" && pctLimpia(m) >= META_LIMPIA) {
      if (!metaOk) sfx(true);
      setMetaOk(true);
    }
    if (add >= 5) setOrdenesProbadas((x) => (x.has(o) ? x : new Set(x).add(o)));
  };
  const elegirPreset = (pid: PresetId) => {
    const base = PRESETS.find((p) => p.id === pid)!;
    setPresetId(pid);
    setSolarPct(base.mezcla.solar);
    setEolicaPct(base.mezcla.eolica);
    blip();
  };
  const moverSolarPct = (v: number) => {
    setSolarPct(v);
    revisaMezcla(presetId, v, eolicaPct, orden);
  };
  const moverEolicaPct = (v: number) => {
    setEolicaPct(v);
    revisaMezcla(presetId, solarPct, v, orden);
  };
  const elegirOrden = (o: OrdenRetiro) => {
    setOrden(o);
    revisaMezcla(presetId, solarPct, eolicaPct, o);
    blip();
  };
  const moverAnio = (i: number) => {
    setAnioIdx(i);
    if (i === PRODUCCION.length - 1) setAgotamientoVisto(true);
  };

  const cambiarModo = (m: Modo) => {
    setModo(m);
    setReproduciendo(false);
    blip();
  };
  const reiniciar = () => {
    if (modo === "mapa") {
      setSolarEquiv(0);
      setCentralSel("laguna-verde");
    }
    if (modo === "red") {
      setReproduciendo(false);
      setHora(12);
      setSolarMW(RED_INICIAL.solarMW);
      setEolicaMW(RED_INICIAL.eolicaMW);
      setBateriaMWh(RED_INICIAL.bateriaMWh);
      setGasMW(RED_INICIAL.gasMW);
      setNublado(false);
    }
    if (modo === "mezcla") {
      elegirPreset("mexico");
      setOrden("sucios");
      setAnioIdx(0);
    }
    setResetNonce((k) => k + 1);
  };

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const objetivos: { t: string; done: boolean }[] = [
    { t: "Consultar al menos seis centrales en el mapa", done: consultadas.size >= 6 },
    { t: "Predecir qué central genera más en un año", done: prediccion === ganador.id },
    { t: "Igualar con paneles solares la energía anual de Laguna Verde", done: igualado },
    { t: "Ver un déficit de electricidad con el Sol ya puesto", done: vioDeficit },
    { t: "Cubrir la demanda las 24 h con al menos 60 % renovable usando la batería", done: cubrio },
    { t: "Llevar la mezcla de México hoy a la meta de 35 % limpia", done: metaOk },
    { t: "Comparar retirar primero carbón y combustóleo contra retirar gas", done: ordenesProbadas.size === 2 },
    { t: "Seguir la producción de petróleo de 2004 a 2023", done: agotamientoVisto },
    { t: "Clasificar fuentes contrarreloj y ganar estrellas", done: clasifico },
    { t: "Aprobar el quiz evaluable (A2)", done: quizAprobado },
    { t: "Completar el texto (A6)", done: textoOk },
  ];

  /* ── Visor ─────────────────────────────────────────────────────────── */
  const noche = nocheEn(hora);
  let chipVivo = "";
  let pie = "";
  if (modo === "mapa") {
    chipVivo = `${central.nombre.toLowerCase()} · ${num(central.mw)} MW${revelado ? ` · ${num(genSel)} GWh/año` : ""}`;
    pie = revelado
      ? `${central.nombre} (${central.lugar}): ${num(central.mw)} MW × ${num(central.fp * 100)} % de factor de planta × 8 760 h = ${num(genSel)} GWh al año. La columna de vidrio es la capacidad; el relleno, lo que de verdad genera.`
      : `Cada columna mide la capacidad instalada de una central. Antes de ver cuánto generan de verdad, predice cuál produce más energía en un año.`;
  } else if (modo === "red") {
    const ren = paso.geo + paso.solar + paso.eolica;
    chipVivo = `${horaTexto(hora)} · demanda ${num(paso.demanda)} MW · ${paso.deficit > 0.5 ? `déficit ${num(paso.deficit)} MW` : `${num((100 * Math.min(ren + paso.descarga, paso.demanda)) / paso.demanda)} % renovable`}`;
    if (paso.deficit > 0.5)
      pie = noche
        ? `Déficit de ${num(paso.deficit)} MW: sin sol, el viento y la geotermia no alcanzan y ${bateriaMWh > 0 ? "la batería ya se vació" : "no hay batería"}${gasMW > 0 ? ` y el gas está al tope (${num(gasMW)} MW)` : " ni respaldo de gas"}. Parte de la ciudad se queda sin luz.`
        : `Déficit de ${num(paso.deficit)} MW aun con luz: la demanda de la tarde supera lo que da el sol${nublado ? " nublado" : ""} más el viento y el respaldo.`;
    else if (ren >= paso.demanda)
      pie = `Las renovables dan ${num(ren)} MW y la ciudad pide ${num(paso.demanda)} MW. ${paso.carga > 1 ? `El excedente carga la batería (${num(paso.carga)} MW)` : "No hay batería que cargar"}${paso.vertido > 1 ? ` y ${num(paso.vertido)} MW se desperdician` : ""}.`;
    else pie = `Las renovables dan ${num(ren)} MW de ${num(paso.demanda)} MW. ${paso.descarga > 1 ? `La batería entrega ${num(paso.descarga)} MW` : "La batería no aporta"}${paso.gas > 1 ? ` y el gas cubre ${num(paso.gas)} MW` : ""}.`;
  } else if (subMezcla === "emisiones") {
    chipVivo = `${num(mtActual, 1)} Mt CO₂e/año · ${num(pctLimpia(mezcla), 1)} % limpia`;
    pie = `${Math.abs(agregado) < 0.05 ? preset.explica : `Partiste de «${preset.etq}» y ${agregado > 0 ? "agregaste" : "quitaste"} ${num(Math.abs(agregado), 1)} puntos de solar y eólica: ${num(pctLimpia(mezcla), 1)} % de generación limpia.`} Emisiones de ciclo de vida de ${num(TWH_MEXICO)} TWh al año: ${num(mtActual, 1)} Mt CO₂e (México hoy: ${num(mtMexico, 1)} Mt).`;
  } else {
    chipVivo = `${anio.anio} · ${num(anio.mbd, 1)} millones de barriles diarios`;
    pie = `${anio.anio}: ${anio.nota}`;
  }

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#04121f", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${def.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{def.etq}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 440, lineHeight: 1.5 }}>Tu equipo no puede mostrar la escena en 3D, pero los controles y los resultados siguen aquí. {pie}</div>
    </div>
  );

  const sub = (txt: string) => <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px", textTransform: "uppercase" }}>{txt}</div>;
  const nota = (txt: ReactNode, col: string, icono = "fa-circle-info") => (
    <div style={{ marginTop: 10, fontSize: 12, lineHeight: 1.55, color: col }}>
      <i className={`fa-solid ${icono}`} style={{ marginRight: 7 }} />
      {txt}
    </div>
  );
  const dato = (etq: string, valor: string, col = "#fff") => (
    <div style={{ padding: "8px 10px", borderRadius: 10, background: "rgba(4,10,22,0.45)", border: `1px solid ${T.line}` }}>
      <div style={{ fontSize: 9.5, fontWeight: 800, color: T.text3, letterSpacing: "0.06em", textTransform: "uppercase" }}>{etq}</div>
      <div style={{ fontSize: 14, fontWeight: 900, color: col, marginTop: 3, ...NUM }}>{valor}</div>
    </div>
  );

  /* ── Panel ─────────────────────────────────────────────────────────── */
  let control: ReactNode = null;
  if (modo === "mapa") {
    const tc = TEC[central.tec];
    control = (
      <>
        <div className="rm-opts">
          {CENTRALES.map((c) => (
            <button key={c.id} className="rm-opt rm-central" data-on={c.id === centralSel} onClick={() => elegirCentral(c.id)} style={{ ["--rmc" as string]: TEC[c.tec].color, background: c.id === centralSel ? `${TEC[c.tec].color}22` : "transparent" }}>
              <i className={`fa-solid ${TEC[c.tec].icono}`} style={{ marginRight: 7, color: TEC[c.tec].color }} />
              {c.nombre.replace(/ \(.*\)$/, "")}
              {consultadas.has(c.id) && c.id !== centralSel && <i className="fa-solid fa-check" style={{ marginLeft: 6, color: T.text3 }} />}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 12, background: "rgba(248,250,252,0.05)", border: `1px solid ${tc.color}55` }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "baseline" }}>
            <div style={{ fontSize: 14, color: "#fff", fontWeight: 900 }}>{central.nombre}</div>
            <div style={{ fontSize: 11, color: T.text3, fontWeight: 800 }}>{central.lugar}</div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "8px 0" }}>
            <span className="rm-tag" style={{ ["--rmc" as string]: tc.color }}>
              <i className={`fa-solid ${tc.icono}`} style={{ marginRight: 5 }} />
              {tc.etq}
            </span>
            <span className="rm-tag" style={{ ["--rmc" as string]: tc.renovable ? OK : WARN }}>{tc.renovable ? "Renovable" : "No renovable"}</span>
            <span className="rm-tag" style={{ ["--rmc" as string]: tc.limpia ? OK : "#94a3b8" }}>{tc.limpia ? "Limpia" : "Emite CO₂"}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(96px,1fr))", gap: 6 }}>
            {dato("Capacidad", `${central.aprox ? "≈ " : ""}${num(central.mw)} MW`)}
            {dato("Factor de planta", revelado ? `≈ ${num(central.fp * 100)} %` : "¿?")}
            {dato("Genera al año", revelado ? `${num(genSel)} GWh` : "¿?", tc.color)}
            {dato("CO₂e ciclo de vida", revelado ? `${num(emisionesT(genSel, tc.gCO2) / 1000)} kt` : "¿?")}
          </div>
          <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5, marginTop: 8 }}>{central.nota}</div>
        </div>
        {sub(`1 · Predice: ¿cuál genera más electricidad en un año?`)}
        <div className="rm-opts">
          {[cA, cB].map((c) => {
            const on = prediccion === c.id;
            const col = on ? (c.id === ganador.id ? OK : WARN) : prediccion && c.id === ganador.id ? OK : modoCol;
            return (
              <button key={c.id} className="rm-opt rm-pred" data-on={on || (!!prediccion && c.id === ganador.id)} onClick={() => predecir(c.id)} disabled={!!prediccion} style={{ ["--rmc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                <i className={`fa-solid ${TEC[c.tec].icono}`} style={{ marginRight: 8 }} />
                {c.nombre.replace(/ \(.*\)$/, "")} · {num(c.mw)} MW
              </button>
            );
          })}
        </div>
        {prediccion
          ? nota(
              <>
                {prediccion === ganador.id ? "Bien predicho. " : "No: la de mayor capacidad no es la que más genera. "}
                {cA.nombre.replace(/ \(.*\)$/, "")}: {num(cA.mw)} MW × {num(cA.fp * 100)} % × 8 760 h = {num(generacionGWh(cA.mw, cA.fp))} GWh. {cB.nombre}: {num(cB.mw)} MW × {num(cB.fp * 100)} % × 8 760 h = {num(generacionGWh(cB.mw, cB.fp))} GWh. La presa depende de la lluvia y guarda agua para las horas pico; la nuclear trabaja casi todo el año sin parar.
              </>,
              prediccion === ganador.id ? OK : WARN,
              prediccion === ganador.id ? "fa-circle-check" : "fa-lightbulb",
            )
          : nota("Pista: la capacidad (MW) es lo máximo que puede dar; la energía del año depende de cuántas horas trabaja a esa potencia.", T.text3)}
        {sub("2 · Iguala Laguna Verde con paneles solares en Sonora")}
        <Deslizador etq="Paneles solares en Sonora" unidad="MW" valor={solarEquiv} min={0} max={SOLAR_MAX_MW} paso={100} on={moverPaneles} col={TEC.solar.color} icono="fa-solar-panel" />
        <div style={{ fontSize: 12, color: T.text2, marginTop: 8, ...NUM }}>
          {num(solarEquiv)} MW × {num(FP_SOLAR_TIPICO * 100)} % × 8 760 h = <strong style={{ color: "#fff" }}>{num(genPaneles)} GWh</strong> · Laguna Verde: <strong style={{ color: TEC.nuclear.color }}>{num(genLV)} GWh</strong>
        </div>
        {igualado
          ? nota(`Hacen falta unos ${num(Math.round(equivMW / 100) * 100)} MW de paneles —${num(equivMW / lv.mw, 1)} veces la capacidad de Laguna Verde— para dar la misma energía en un año, y aun así solo de día: sin almacenamiento no la sustituyen de noche.`, OK, "fa-circle-check")
          : solarEquiv > 0 && nota(genPaneles < genLV ? `Faltan ${num(genLV - genPaneles)} GWh al año. Sigue agregando paneles.` : `Te pasaste por ${num(genPaneles - genLV)} GWh. Quita algunos paneles.`, "#fbbf24")}
      </>
    );
  } else if (modo === "red") {
    control = (
      <>
        <div className="rm-opts">
          {ESTACIONES.map((e) => (
            <button key={e.id} className="rm-opt rm-estacion" data-on={e.id === estacion} onClick={() => { cambiaRed({ estacion: e.id }); blip(); }} style={{ ["--rmc" as string]: modoCol, background: e.id === estacion ? `${modoCol}1f` : "transparent" }}>
              <i className={`fa-solid ${e.icono}`} style={{ marginRight: 8 }} />
              {e.etq}
            </button>
          ))}
          <button className="rm-opt rm-nublado" data-on={nublado} onClick={() => { cambiaRed({ nublado: !nublado }); blip(); }} style={{ ["--rmc" as string]: "#94a3b8", background: nublado ? "#94a3b81f" : "transparent" }}>
            <i className="fa-solid fa-cloud" style={{ marginRight: 8 }} />
            Día nublado
          </button>
        </div>
        <div style={{ fontSize: 11.5, color: T.text3, marginTop: 8, lineHeight: 1.45 }}>{ESTACIONES.find((e) => e.id === estacion)!.explica}</div>
        {sub(`1 · Instala tu mezcla (la geotermia da ${GEO_MW} MW fijos)`)}
        <Deslizador etq="Solar" unidad="MW" valor={solarMW} min={0} max={LIMITES_RED.solar} paso={100} on={(v) => cambiaRed({ solarMW: v })} col={TEC.solar.color} icono="fa-solar-panel" />
        <Deslizador etq="Eólica" unidad="MW" valor={eolicaMW} min={0} max={LIMITES_RED.eolica} paso={100} on={(v) => cambiaRed({ eolicaMW: v })} col={TEC.eolica.color} icono="fa-wind" />
        <Deslizador etq="Batería" unidad="MWh" valor={bateriaMWh} min={0} max={LIMITES_RED.bateria} paso={250} on={(v) => cambiaRed({ bateriaMWh: v })} col="#34d399" icono="fa-car-battery" />
        <Deslizador etq="Respaldo de gas" unidad="MW" valor={gasMW} min={0} max={LIMITES_RED.gas} paso={50} on={(v) => cambiaRed({ gasMW: v })} col={TEC.gas.color} icono="fa-fire-flame-simple" />
        <div style={{ fontSize: 11, color: T.text3, marginTop: 6 }}>
          La batería entrega hasta {num(bateriaMWh / HORAS_BATERIA)} MW durante {HORAS_BATERIA} h y devuelve el {num(EFICIENCIA_BATERIA * 100)} % de lo que guarda; solo se carga con excedente renovable.
        </div>
        {sub("2 · Recorre el día")}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button className="rm-opt rm-play" data-on="true" onClick={reproducir} style={{ ["--rmc" as string]: modoCol, background: `${modoCol}1f`, flexShrink: 0 }}>
            <i className={`fa-solid ${reproduciendo ? "fa-pause" : "fa-play"}`} style={{ marginRight: 8 }} />
            {reproduciendo ? "Pausa" : "Reproducir el día"}
          </button>
          <input type="range" aria-label="Hora del día (h)" className="rm-range" min={0} max={24 - DT_H} step={DT_H} value={hora} onChange={(e) => { setReproduciendo(false); moverHora(Number(e.target.value)); }} style={{ ["--rmc" as string]: modoCol }} />
          <span style={{ width: 46, textAlign: "right", fontSize: 13, color: "#fff", fontWeight: 800, ...NUM }}>{horaTexto(hora)}</span>
        </div>
        <div style={{ marginTop: 12, padding: "10px 10px 6px", borderRadius: 12, background: "rgba(4,10,22,0.5)", border: `1px solid ${T.line}` }}>
          <GraficaDia red={red} hora={hora} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 10px", marginTop: 6 }}>
            {[
              ["Geotermia", TEC.geotermia.color],
              ["Eólica", TEC.eolica.color],
              ["Solar", TEC.solar.color],
              ["Batería", "#34d399"],
              ["Gas", TEC.gas.color],
              ["Déficit", NO],
              ["Excedente", "#fde68a88"],
            ].map(([t, c]) => (
              <span key={t} style={{ fontSize: 10, color: T.text2, display: "inline-flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 9, height: 9, borderRadius: 2, background: c }} />
                {t}
              </span>
            ))}
            <span style={{ fontSize: 10, color: T.text2 }}>— línea blanca: demanda</span>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(96px,1fr))", gap: 6, marginTop: 10 }}>
          {dato("Renovable del día", `${num(red.pctRenovable)} %`, red.pctRenovable >= 60 ? OK : "#fff")}
          {dato("Déficit", `${num(red.deficitMWh)} MWh`, red.deficitMWh > 1 ? NO : OK)}
          {dato("Gas quemado", `${num(red.gasMWh)} MWh`)}
          {dato("Desperdiciado", `${num(red.vertidoMWh)} MWh`)}
          {dato("CO₂e del gas", `${num(red.co2t)} t`)}
        </div>
        {red.deficitMWh > 1
          ? nota(`Hay ${num(red.horasDeficit, 2)} h de déficit${red.primerDeficit !== null ? `, la primera a las ${horaTexto(red.primerDeficit - DT_H / 2)}` : ""}. Súbele al respaldo, agrega batería o reparte mejor sol y viento.`, NO, "fa-triangle-exclamation")
          : red.pctRenovable >= 60 && red.descargaMWh > 1
            ? nota(`La red se sostiene las 24 h con ${num(red.pctRenovable)} % renovable: la batería movió ${num(red.descargaMWh)} MWh del mediodía a la noche.`, OK, "fa-circle-check")
            : nota(`Sin déficit, pero solo ${num(red.pctRenovable)} % renovable: el gas cubre ${num(red.gasMWh)} MWh. ${red.vertidoMWh > 1 ? `Además se desperdician ${num(red.vertidoMWh)} MWh de excedente que una batería podría guardar.` : ""}`, "#fbbf24")}
      </>
    );
  } else {
    control = (
      <>
        <div className="rm-opts">
          {(["emisiones", "agotamiento"] as const).map((s) => (
            <button key={s} className="rm-opt rm-sub" data-on={s === subMezcla} onClick={() => { setSubMezcla(s); blip(); }} style={{ ["--rmc" as string]: modoCol, background: s === subMezcla ? `${modoCol}1f` : "transparent" }}>
              <i className={`fa-solid ${s === "emisiones" ? "fa-smog" : "fa-oil-well"}`} style={{ marginRight: 8 }} />
              {s === "emisiones" ? "Mezcla y emisiones" : "Agotamiento del petróleo"}
            </button>
          ))}
        </div>
        {subMezcla === "emisiones" ? (
          <>
            {sub("1 · Punto de partida")}
            <div className="rm-opts">
              {PRESETS.map((p) => (
                <button key={p.id} className="rm-opt rm-preset" data-on={p.id === presetId} onClick={() => elegirPreset(p.id)} style={{ ["--rmc" as string]: accent, background: p.id === presetId ? `rgba(${color.rgba},0.16)` : "transparent" }}>
                  {p.etq}
                </button>
              ))}
            </div>
            {sub("2 · Agrega sol y viento")}
            <Deslizador etq="Solar" unidad="% de la generación" valor={solarPct} min={0} max={40} paso={0.5} on={moverSolarPct} col={TEC.solar.color} icono="fa-solar-panel" fmt={fmtPct} />
            <Deslizador etq="Eólica" unidad="% de la generación" valor={eolicaPct} min={0} max={40} paso={0.5} on={moverEolicaPct} col={TEC.eolica.color} icono="fa-wind" fmt={fmtPct} />
            {sub("3 · ¿Qué fósil retiras primero?")}
            <div className="rm-opts">
              {(Object.keys(ORDENES) as OrdenRetiro[]).map((o) => (
                <button key={o} className="rm-opt rm-orden" data-on={o === orden} onClick={() => elegirOrden(o)} style={{ ["--rmc" as string]: modoCol, background: o === orden ? `${modoCol}1f` : "transparent" }}>
                  {ORDENES[o].etq}
                  {ordenesProbadas.has(o) && <i className="fa-solid fa-check" style={{ marginLeft: 7, color: OK }} />}
                </button>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(96px,1fr))", gap: 6, marginTop: 12 }}>
              {dato("Renovable", `${num(pctRenovable(mezcla), 1)} %`, OK)}
              {dato("Limpia", `${num(pctLimpia(mezcla), 1)} %`, pctLimpia(mezcla) >= META_LIMPIA ? OK : "#fff")}
              {dato("Emisiones", `${num(mtActual, 1)} Mt`)}
              {dato("Frente a hoy", `${mtActual <= mtMexico ? "−" : "+"}${num(Math.abs(mtMexico - mtActual), 1)} Mt`, mtActual <= mtMexico ? OK : WARN)}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 10 }}>
              {TECNOLOGIAS.map((t) => (
                <span key={t.id} style={{ fontSize: 10.5, padding: "3px 7px", borderRadius: 7, border: `1px solid ${t.color}55`, color: T.text2, ...NUM }}>
                  <span style={{ color: t.color, fontWeight: 900 }}>{t.etq}</span> {num(mezcla[t.id], 1)} % · {t.gCO2} g/kWh
                </span>
              ))}
            </div>
            {agregado >= 5
              ? nota(
                  <>
                    Con {num(agregado, 1)} puntos más de sol y viento: retirando carbón y combustóleo primero quedan <strong>{num(mtSucios, 1)} Mt</strong>; retirando gas primero, <strong>{num(mtGas, 1)} Mt</strong>. Cada kWh de carbón emite 820 g de CO₂e y cada kWh de gas 490 g: sustituir el combustible más sucio ahorra {num(mtGas - mtSucios, 1)} Mt más.
                  </>,
                  OK,
                  "fa-scale-unbalanced",
                )
              : nota("Sube solar o eólica al menos 5 puntos sobre el punto de partida para comparar qué conviene retirar.", T.text3)}
            {recortado && nota("Ya no quedan fósiles que sustituir: el sol y el viento extra se recortaron para que la mezcla sume 100 %.", "#fbbf24")}
            {presetId === "mexico" && pctLimpia(mezcla) >= META_LIMPIA && nota(`Meta cumplida: ${num(pctLimpia(mezcla), 1)} % de generación limpia (renovables más nuclear). En la realidad México no la alcanzó en 2024 (A1).`, OK, "fa-flag-checkered")}
          </>
        ) : (
          <>
            {sub("Año de producción")}
            <div className="rm-opts">
              {PRODUCCION.map((p, i) => (
                <button key={p.anio} className="rm-opt rm-anio" data-on={i === anioIdx} onClick={() => { moverAnio(i); blip(); }} style={{ ["--rmc" as string]: "#f59e0b", background: i === anioIdx ? "#f59e0b1f" : "transparent" }}>
                  {p.anio}
                </button>
              ))}
            </div>
            <Deslizador etq="Avanza en el tiempo" unidad="año" valor={anioIdx} min={0} max={PRODUCCION.length - 1} paso={1} on={moverAnio} col="#f59e0b" icono="fa-calendar" fmt={fmtAnio} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))", gap: 6, marginTop: 12 }}>
              {dato("Producción", `${num(anio.mbd, 1)} mbd`, "#f59e0b")}
              {dato("Frente a 2004", `${num((100 * anio.mbd) / PRODUCCION[0]!.mbd)} %`)}
            </div>
            {nota(anio.nota, anioIdx === PRODUCCION.length - 1 ? OK : T.text2, "fa-oil-well")}
            {agotamientoVisto &&
              nota("Un yacimiento es una reserva finita: al extraerlo pierde presión y rinde menos. El sol y el viento, en cambio, son un flujo que llega cada día, lo usemos o no.", OK, "fa-lightbulb")}
          </>
        )}
      </>
    );
  }

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes rmPulse { 0%,100%{ box-shadow:0 0 0 0 var(--rmd); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .rm-live-dot { animation: rmPulse 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce){ .rm-live-dot { animation:none; } }
        .rm-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(310px,28vw,410px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .rm-grid { grid-template-columns: 1fr; } }
        .rm-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .rm-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .rm-icobtn:hover { background:rgba(255,255,255,0.12); }
        .rm-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .rm-tab { cursor:pointer; border:1px solid var(--rmc); border-radius:12px; padding:11px 8px; text-align:center; background:transparent; transition:all .15s; color:#fff; }
        .rm-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.62); }
        .rm-tab:hover { background:rgba(255,255,255,0.06); }
        .rm-opts { display:flex; flex-wrap:wrap; gap:7px; }
        .rm-opt { cursor:pointer; border:1px solid var(--rmc); border-radius:10px; padding:9px 12px; font-size:12px; font-weight:800; color:#fff; background:transparent; transition:all .15s; }
        .rm-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.72); }
        .rm-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
        .rm-opt:disabled { cursor:default; }
        .rm-opt:disabled[data-on="false"] { opacity:0.55; }
        .rm-tag { font-size:10.5px; font-weight:900; padding:3px 8px; border-radius:999px; border:1px solid var(--rmc); color:var(--rmc); }
        .rm-range { width:100%; accent-color: var(--rmc); }
        .rm-opt:focus-visible, .rm-tab:focus-visible, .rm-icobtn:focus-visible, .rm-range:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
        @media (max-width: 1000px){ .rm-bottom { grid-template-columns: 1fr !important; } }
        .rm-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px); opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .rm-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .rm-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61; background:linear-gradient(180deg,#06121e 0%,#040a16 100%);
          border-left:1px solid rgba(${color.rgba},0.32); box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1); display:flex; flex-direction:column; }
        .rm-drawer[data-open="true"] { transform:translateX(0); }
        .rm-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .rm-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .rm-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .rm-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .rm-teoria-fab { position:absolute; bottom:16px; right:16px; cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:11px 16px; border-radius:999px;
          border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800; background:rgba(4,10,22,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; z-index:5; }
        .rm-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
      `}</style>

      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="rm-tabs">
          {MODOS.map((m) => {
            const d = MODOS_DEF[m];
            const col = `#${d.color.replace("#", "")}`;
            const on = m === modo;
            return (
              <button key={m} className="rm-tab" data-on={on} onClick={() => cambiarModo(m)} style={{ ["--rmc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                <div style={{ fontSize: 18, marginBottom: 4, color: on ? col : "inherit" }}>
                  <i className={`fa-solid ${d.icono}`} />
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 900 }}>{d.etq}</div>
                <div style={{ fontSize: 10, color: T.text3, marginTop: 3, lineHeight: 1.25 }}>{d.subtitulo}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rm-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              position: "relative",
              height: "clamp(440px, 58vh, 660px)",
              borderRadius: 20,
              overflow: "hidden",
              border: `1px solid rgba(${color.rgba},0.22)`,
              background: `radial-gradient(120% 80% at 30% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#06121e 0%,#040a16 100%)`,
              boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}`,
            }}
          >
            <SceneBoundary fallback={sceneFallback}>
              <RenovablesScene
                vista={modo}
                modoColor={modoCol}
                resetNonce={resetNonce}
                centralSel={centralSel}
                revelado={revelado}
                solarEquivMW={solarEquiv}
                onSelCentral={elegirCentral}
                params={params}
                red={red}
                hora={hora}
                subMezcla={subMezcla}
                mezcla={mezcla}
                anioIdx={anioIdx}
              />
            </SceneBoundary>

            <div style={{ position: "absolute", top: 14, left: 16, right: 150, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, pointerEvents: "none" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)", maxWidth: "100%" }}>
                <span className="rm-live-dot" style={{ ["--rmd" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3, flexShrink: 0 }}>EN VIVO</span>
                <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)", flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", ...NUM }}>{chipVivo}</span>
              </div>
            </div>

            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="rm-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría" aria-label="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="rm-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"} aria-label={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="rm-icobtn" onClick={reiniciar} title="Reiniciar" aria-label="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 132px 14px 18px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                <i className={`fa-solid ${def.icono}`} style={{ color: modoCol, marginRight: 7 }} />
                {def.etq} — {def.subtitulo}
              </div>
              <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6, ...NUM }}>{pie}</div>
            </div>

            <button className="rm-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>
          </div>

          <div style={{ ...card, padding: "18px 22px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: modoCol }} />
              Controles — {def.etq}
            </Eyebrow>
            <div style={{ marginTop: 12 }}>{control}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${accent}66`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: accent }}>
                <i className="fa-solid fa-bolt" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>¿Por qué México sigue quemando fósiles?</div>
            </div>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{PROBLEMA}</div>
          </div>

          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: "1px solid #7dd3fc55", background: "rgba(125,211,252,0.07)" }}>
            <Eyebrow>
              <i className="fa-solid fa-map" style={{ marginRight: 8, color: "#7dd3fc" }} />
              Infografía A1
            </Eyebrow>
            <div style={{ fontSize: 13, color: "#fff", fontWeight: 800, lineHeight: 1.4, marginBottom: 10 }}>{TITULO_A1}</div>
            <div style={{ display: "grid", gap: 9, marginBottom: 12 }}>
              {CONTEXTO_A1.map((p, i) => (
                <div key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>
                  {p}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, fontWeight: 900, color: T.text3, letterSpacing: "0.08em", marginBottom: 8 }}>PUNTOS CLAVE</div>
            <ul style={{ margin: "0 0 12px", paddingLeft: 16, display: "grid", gap: 7 }}>
              {PUNTOS_A1.map((q, i) => (
                <li key={i} style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>
                  {q}
                </li>
              ))}
            </ul>
            <div style={{ fontSize: 11, fontWeight: 900, color: T.text3, letterSpacing: "0.08em", marginBottom: 8 }}>PARA REFLEXIONAR</div>
            <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 8 }}>
              {PREGUNTAS_A1.map((q, i) => (
                <li key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>
                  {q}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-list-ol" style={{ marginRight: 8, color: accent }} />
              Cómo usar el laboratorio
            </Eyebrow>
            <div style={{ display: "grid", gap: 9 }}>
              {INSTRUCCIONES.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${accent}25` }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#04121f", background: accent, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ fontSize: 12, color: "#fff", lineHeight: 1.45, minWidth: 0 }}>{p}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <Eyebrow>
                <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
                Objetivos de la sesión
              </Eyebrow>
              <span style={{ fontSize: 11, fontWeight: 800, color: objetivos.every((o) => o.done) ? OK : T.text3 }}>
                {objetivos.filter((o) => o.done).length}/{objetivos.length}
              </span>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {objetivos.map((o, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <i className={`fa-solid ${o.done ? "fa-circle-check" : "fa-circle"}`} style={{ marginTop: 2, fontSize: 13, color: o.done ? OK : "rgba(255,255,255,0.22)" }} />
                  <span style={{ fontSize: 12, color: o.done ? "#fff" : T.text2, lineHeight: 1.4 }}>{o.t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="rm-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <div style={{ padding: "14px 16px", borderRadius: 12, border: `1px solid ${accent}33`, background: `rgba(${color.rgba},0.07)` }}>
            <Eyebrow>
              <i className="fa-solid fa-earth-americas" style={{ marginRight: 8, color: accent }} />
              Después de la infografía (A1)
            </Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{ACTIVIDAD_POST_A1}</div>
            <div style={{ fontSize: 11, color: T.text3, lineHeight: 1.45, marginTop: 6, fontStyle: "italic" }}>Fuente de la infografía: {FUENTE_A1}</div>
          </div>
          <div style={{ marginTop: 16 }}>
            <Eyebrow>
              <i className="fa-solid fa-circle-question" style={{ marginRight: 8, color: accent }} />
              Hechos (quiz A4)
            </Eyebrow>
            <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 8 }}>
              {HECHOS.map((h, i) => (
                <li key={i} style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>
                  {h}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ marginTop: 16 }}>
            <Eyebrow>
              <i className="fa-solid fa-book" style={{ marginRight: 8, color: accent }} />
              Glosario (A5)
            </Eyebrow>
            <div style={{ display: "grid", gap: 8 }}>
              {GLOSARIO.map((gi, i) => (
                <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                  <span style={{ fontSize: 12, fontWeight: 900, color: accent }}>{gi.termino}. </span>
                  <span style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>{gi.definicion}</span>
                  <div style={{ fontSize: 11, color: T.text3, lineHeight: 1.4, marginTop: 4 }}>
                    <i className="fa-solid fa-bolt" style={{ marginRight: 6, color: accent }} />
                    {gi.ejemplo}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11.5, color: T.text2, marginTop: 10 }}>
              <strong style={{ color: "#fff" }}>Actividad:</strong> {ACTIVIDAD_A5}
            </div>
          </div>
        </div>
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-lightbulb" style={{ marginRight: 8, color: accent }} />
            Ideas clave
          </Eyebrow>
          <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 9 }}>
            {IDEAS.map((x, i) => (
              <li key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>
                {x}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ marginTop: 16, fontSize: 11.5, color: T.text3, lineHeight: 1.5, display: "flex", gap: 9, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          La infografía A1 (contexto, puntos clave, preguntas, glosario y actividad), el quiz A2, los hechos del quiz A4, el glosario A5, el texto A6 y las nueve fuentes de la clasificación A11 son <strong>verbatim</strong> del material de la plataforma. Las centrales del mapa son reales; sus capacidades están redondeadas (las marcadas con ≈ son aproximadas) y los factores de planta son <strong>típicos y aproximados</strong>, no datos oficiales de un año; el ingenio azucarero es un caso ilustrativo. La red de un día es una <strong>región ilustrativa</strong>: sus perfiles de demanda, sol y viento son un modelo con la estacionalidad real, no mediciones. Las emisiones usan las medianas de ciclo de vida del IPCC (AR5, 2014), salvo el combustóleo (estimación); la generación anual de México se toma como {num(TWH_MEXICO)} TWh y el reparto entre gas, combustóleo y carbón es aproximado. La producción petrolera de 2004 y 2023 es la de A1; la de los años intermedios es aproximada (Pemex). Fuente: {FUENTE}
        </span>
      </div>

      <RenovableCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sfx} />

      <RetoQuizCard quiz={QUIZ_A2} accent={accent} rgba={color.rgba} aprobado={quizAprobado} onAprobado={() => setQuizAprobado(true)} playSfx={sfx} playPick={blip} mensajeAprobado="¡Aprobado! Conoces el mapa energético de México." />

      <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-keyboard" style={{ marginRight: 8, color: accent }} />
          Completa el texto (A6)
        </Eyebrow>
        <div style={{ marginTop: 12 }}>
          <CompletaTexto data={HUECOS_A6} accent={accent} rgba={color.rgba} completado={textoOk} onCompletado={() => { setTextoOk(true); sfx(true); }} onAcierto={blip} onError={() => sfx(false)} />
        </div>
      </div>

      <div className="rm-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="rm-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="rm-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="rm-close" onClick={() => setDrawer(false)} title="Cerrar" aria-label="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="rm-drawer-body">
          <FichaTeorica data={RENOVABLES_MEXICO_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}
