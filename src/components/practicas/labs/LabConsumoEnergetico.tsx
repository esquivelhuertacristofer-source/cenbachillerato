"use client";

/**
 * Laboratorio 3D — "Consumo energético e impacto ambiental".
 * Práctica anclada a CNEYT-II-P06-A2 (quiz «¿Qué sabemos sobre la huella de
 * carbono?») y CNEYT-II-P06-A6 (completa el texto); progresión 10 de la UAC
 * CNEYT-II. El marco teórico es la lectura A1, los hechos salen del quiz A4, el
 * glosario del A5 y el recuadro de debate del A3.
 *
 * Tres modos:
 *  (1) Mi casa y el recibo — 12 aparatos con potencia y horas reales: kWh del
 *      bimestre, tarifa doméstica 1 escalonada, CO₂ con el factor del SEN 2024
 *      y consumo fantasma.
 *  (2) De la planta al foco — cadena de eficiencias: central, red con 12.2 %
 *      de pérdidas y foco; cuánta energía primaria hay detrás de la luz.
 *  (3) Mi huella de carbono — transporte, alimentación, hogar y bienes como
 *      globos de CO₂ a tamaño real, comparados con la distribución de la A1.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { CompletaTexto } from "./_mecanica-huecos";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { CONSUMO_ENERGETICO_FICHA } from "./consumo-energetico-ficha";
import type { VistaConsumo } from "./ConsumoEnergeticoScene";
import {
  type Modo,
  type AparatoId,
  type EstadoCasa,
  type PlantaId,
  type FocoId,
  type EstadoHuella,
  MODOS,
  MODOS_DEF,
  APARATOS,
  FOCOS,
  REFRIS,
  N_FOCOS,
  DIAS_BIMESTRE,
  FE_SEN,
  FE_SEN_ANIO,
  PERDIDAS_RED,
  LIMITE_DAC_BIM,
  estadoCasaInicial,
  resumenCasa,
  PLANTAS,
  cadena,
  fraccionLuz,
  vecesMenosCombustible,
  TRANSPORTES,
  CALENTADORES,
  BIENES,
  CATEGORIAS,
  HUELLA_INICIAL,
  huella,
  totalHuella,
  diametroEsfera,
  PER_CAPITA_MX,
  DUELOS,
  kwhUso,
  rondaDuelos,
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
  REFLEXION_A7,
  FUENTE,
  PROBLEMA,
  INSTRUCCIONES,
  IDEAS,
  QUIZ_A2,
  HUECOS_A6,
  num,
  pesos,
} from "./consumo-energetico-data";

const ConsumoScene = dynamic(() => import("./ConsumoEnergeticoScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-plug fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Conectando la casa en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-consumo-energetico-reto";
const WARN = "#FF8A3C";
const RONDA_INICIAL = rondaDuelos(mulberry32(7));
const CASA_INICIAL = estadoCasaInicial();
const KWH_INICIAL = resumenCasa(CASA_INICIAL).kwhBim;
const HUELLA_BASE = huella(HUELLA_INICIAL, KWH_INICIAL);
const TOTAL_BASE = totalHuella(HUELLA_BASE);

/* ── Tarjeta de estrellas: ¿qué gasta más? ────────────────────────────── */
function DueloCard({
  accent,
  rgba,
  mejor,
  onResultado,
  playSfx,
}: {
  accent: string;
  rgba: string;
  mejor: number;
  onResultado: (e: number) => void;
  playSfx?: (ok: boolean) => void;
}) {
  const [ronda, setRonda] = useState(RONDA_INICIAL);
  const [pos, setPos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [aviso, setAviso] = useState<{ txt: string; ok: boolean } | null>(null);
  const [resuelto, setResuelto] = useState<number | null>(null);
  const r = ronda[pos] ?? ronda[0]!;
  const duelo = DUELOS[r.idx]!;
  const izq = r.invertir ? duelo.b : duelo.a;
  const der = r.invertir ? duelo.a : duelo.b;
  const kI = kwhUso(izq);
  const kD = kwhUso(der);

  const responder = (lado: "izq" | "der") => {
    if (resuelto !== null || aviso?.ok) return;
    const ok = lado === "izq" ? kI > kD : kD > kI;
    playSfx?.(ok);
    const explica = `${izq.etq}: ${num(izq.w)} W × ${num(izq.min / 60, 2)} h = ${num(kI, 2)} kWh. ${der.etq}: ${num(der.w)} W × ${num(der.min / 60, 2)} h = ${num(kD, 2)} kWh.`;
    if (!ok) {
      setErrores((e) => e + 1);
      setAviso({ txt: `No. ${explica} La potencia sola no decide: la energía es potencia por tiempo.`, ok: false });
      return;
    }
    setAviso({ txt: `¡Correcto! ${explica}`, ok: true });
  };
  const siguiente = () => {
    setAviso(null);
    if (pos + 1 >= ronda.length) {
      const est = estrellasPorErrores(errores);
      setResuelto(est);
      onResultado(est);
    } else setPos((p) => p + 1);
  };
  const otra = () => {
    setRonda(rondaDuelos(Math.random));
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
          ¿Qué gasta más energía al día?
        </Eyebrow>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10.5, fontWeight: 800, color: T.text3, letterSpacing: "0.06em" }}>MEJOR MARCA</span>
          {[1, 2, 3].map((k) => (
            <i key={k} className="fa-solid fa-star" style={{ fontSize: 13, color: k <= mejor ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
          ))}
        </div>
      </div>
      {resuelto === null ? (
        <>
          <div style={{ fontSize: 11, color: T.text3, fontWeight: 800, marginBottom: 10 }}>
            Duelo {pos + 1} de {ronda.length} · toca el que consume más kWh en un día
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }} className="ce-duelo">
            {(["izq", "der"] as const).map((lado) => {
              const u = lado === "izq" ? izq : der;
              return (
                <button
                  key={lado}
                  className="ce-opt ce-duelo-btn"
                  data-on="true"
                  onClick={() => responder(lado)}
                  disabled={!!aviso?.ok}
                  style={{ ["--cec" as string]: accent, textAlign: "left", padding: "14px 14px", fontSize: 13, lineHeight: 1.4 }}
                >
                  <i className="fa-solid fa-plug" style={{ marginRight: 8, color: accent }} />
                  {u.etq}
                </button>
              );
            })}
          </div>
          {aviso && (
            <div style={{ marginTop: 10, fontSize: 12, color: aviso.ok ? OK : WARN, lineHeight: 1.5, ...NUM }}>
              {aviso.txt}
              {aviso.ok ? "" : " Inténtalo de nuevo."}
            </div>
          )}
          {aviso?.ok && (
            <button className="ce-opt ce-duelo-sig" data-on="true" onClick={siguiente} style={{ ["--cec" as string]: OK, marginTop: 10 }}>
              {pos + 1 >= ronda.length ? "Ver resultado" : "Siguiente duelo"}
              <i className="fa-solid fa-forward" style={{ marginLeft: 8 }} />
            </button>
          )}
        </>
      ) : (
        <div
          style={{
            padding: "12px 14px",
            borderRadius: 11,
            border: `1px solid ${OK}55`,
            background: "rgba(52,211,153,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
            {[1, 2, 3].map((k) => (
              <i key={k} className="fa-solid fa-star" style={{ fontSize: 15, color: k <= resuelto ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
            ))}
            <span style={{ fontSize: 12.5, fontWeight: 900, color: OK, marginLeft: 4 }}>
              Ronda con {errores === 0 ? "cero errores" : `${errores} ${errores === 1 ? "error" : "errores"}`}
            </span>
          </span>
          <button
            onClick={otra}
            style={{
              cursor: "pointer",
              padding: "9px 14px",
              borderRadius: 10,
              border: `1px solid ${accent}`,
              background: `rgba(${rgba},0.16)`,
              color: "#fff",
              fontSize: 12.5,
              fontWeight: 900,
            }}
          >
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

export function LabConsumoEnergetico({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("casa");

  // ── Casa
  const [casa, setCasa] = useState<EstadoCasa>(CASA_INICIAL);
  const [sel, setSel] = useState<AparatoId>("tv");
  const [encontroMayor, setEncontroMayor] = useState(false);
  const [vioFantasma, setVioFantasma] = useState(false);

  // ── Cadena
  const [plantaId, setPlantaId] = useState<PlantaId>("ciclo");
  const [focoId, setFocoId] = useState<FocoId>("incandescente");
  const [nFocos, setNFocos] = useState(8);
  const [horasLuz, setHorasLuz] = useState(5);
  const [vioPeor, setVioPeor] = useState(false);
  const [logro5x, setLogro5x] = useState(false);

  // ── Huella
  const [h, setH] = useState<EstadoHuella>(HUELLA_INICIAL);

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
  const sfx = (ok: boolean) => {
    if (!sonido) return;
    if (ok) audioRef.current?.correcto();
    else audioRef.current?.incorrecto();
  };

  const def = MODOS_DEF[modo];
  const modoCol = `#${def.color.replace("#", "")}`;

  /* ── Casa ──────────────────────────────────────────────────────────── */
  const rc = resumenCasa(casa);
  const ap = APARATOS.find((a) => a.id === sel)!;
  const cAp = rc.aparatos.find((a) => a.id === sel)!;
  const focoCasa = FOCOS.find((f) => f.id === casa.foco)!;
  const pctFantasma = rc.kwhBim > 0 ? (rc.fantasmaBim / rc.kwhBim) * 100 : 0;

  const aplicarCasa = (nueva: EstadoCasa) => {
    setCasa(nueva);
    const r = resumenCasa(nueva);
    if (APARATOS.some((a) => !a.continuo && !nueva.uso[a.id] && a.espera > 0 && !nueva.desconectar)) setVioFantasma(true);
    return r;
  };
  const seleccionar = useCallback(
    (id: AparatoId) => {
      setSel(id);
      if (id === resumenCasa(casa).mayor) setEncontroMayor(true);
      if (sonido) audioRef.current?.blip();
    },
    [casa, sonido],
  );
  const setUso = (id: AparatoId, v: boolean) => {
    aplicarCasa({ ...casa, uso: { ...casa.uso, [id]: v } });
    blip();
  };
  const setHoras = (id: AparatoId, v: number) => aplicarCasa({ ...casa, horas: { ...casa.horas, [id]: v }, uso: { ...casa.uso, [id]: v > 0 ? true : casa.uso[id] } });
  const setFocoCasa = (f: FocoId) => {
    aplicarCasa({ ...casa, foco: f });
    blip();
  };
  const setRefri = (id: EstadoCasa["refri"]) => {
    aplicarCasa({ ...casa, refri: id });
    blip();
  };
  const setRegleta = () => {
    aplicarCasa({ ...casa, desconectar: !casa.desconectar });
    blip();
  };

  /* ── Cadena ────────────────────────────────────────────────────────── */
  const planta = PLANTAS.find((p) => p.id === plantaId)!;
  const focoC = FOCOS.find((f) => f.id === focoId)!;
  const cad = cadena(planta, focoC, nFocos, horasLuz);
  const veces = vecesMenosCombustible(planta, focoC);
  const elegirCadena = (p: PlantaId, f: FocoId) => {
    setPlantaId(p);
    setFocoId(f);
    if (p === "carbon" && f === "incandescente") setVioPeor(true);
    if (
      p !== "solar" &&
      vecesMenosCombustible(
        PLANTAS.find((x) => x.id === p)!,
        FOCOS.find((x) => x.id === f)!,
      ) >= 5
    )
      setLogro5x(true);
    blip();
  };

  /* ── Huella ────────────────────────────────────────────────────────── */
  const hu = huella(h, rc.kwhBim);
  const totalH = totalHuella(hu);
  const reduccion = 1 - totalH / TOTAL_BASE;
  const transporteMitad = hu.transporte < HUELLA_BASE.transporte / 2;
  const huellaBaja = reduccion >= 0.4;
  const cambioPct = Math.round(Math.abs(reduccion) * 100);
  const cambioTxt = cambioPct === 0 ? "0 %" : `${reduccion > 0 ? "−" : "+"}${cambioPct} %`;
  const setHu = (parcial: Partial<EstadoHuella>) => setH((x) => ({ ...x, ...parcial }));
  const mayorCat = CATEGORIAS.reduce((m, c) => (hu[c.id] > hu[m.id] ? c : m), CATEGORIAS[0]!);

  const cambiarModo = (m: Modo) => {
    setModo(m);
    if (m === "cadena" && plantaId === "carbon" && focoId === "incandescente") setVioPeor(true);
    blip();
  };
  const reiniciar = () => {
    if (modo === "casa") {
      setCasa(CASA_INICIAL);
      setSel("tv");
    }
    if (modo === "cadena") {
      setPlantaId("ciclo");
      setFocoId("incandescente");
      setNFocos(8);
      setHorasLuz(5);
    }
    if (modo === "huella") setH(HUELLA_INICIAL);
    setResetNonce((k) => k + 1);
  };

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const objetivos: { t: string; done: boolean }[] = [
    { t: "Encontrar el aparato que más energía gasta al bimestre (tócalo)", done: encontroMayor },
    { t: "Descubrir el consumo fantasma: deja sin usar un aparato que sigue enchufado", done: vioFantasma },
    { t: "Cambiar los focos a LED y el refrigerador por uno eficiente", done: casa.foco === "led" && casa.refri === "eficiente" },
    { t: "Sacar la casa del consumo excedente (280 kWh o menos) sin dejar de usar los focos", done: rc.kwhBim <= 280 && casa.uso.focos && casa.horas.focos > 0 },
    { t: "Seguir la energía de una carboeléctrica a un foco incandescente", done: vioPeor },
    { t: "Dar la misma luz con al menos 5 veces menos combustible", done: logro5x },
    { t: "Reducir a menos de la mitad la huella de tu transporte", done: transporteMitad },
    { t: "Bajar tu huella total al menos 40 % respecto al punto de partida", done: huellaBaja },
    { t: "Ganar estrellas en «¿Qué gasta más energía al día?»", done: clasifico },
    { t: "Aprobar el quiz evaluable (A2)", done: quizAprobado },
    { t: "Completar el texto (A6)", done: textoOk },
  ];

  /* ── Visor ─────────────────────────────────────────────────────────── */
  const vista: VistaConsumo = modo;
  let chipVivo = "";
  let pie = "";
  if (modo === "casa") {
    chipVivo = `${num(rc.kwhBim)} kWh/bim · ${pesos(rc.recibo.total)} · ${num(rc.co2Bim)} kg CO₂e`;
    pie =
      rc.recibo.escalon === "excedente"
        ? `La casa pasa de 280 kWh: ${num(rc.recibo.tramos[2]!.kwh)} kWh se cobran como excedente a ${pesos(rc.recibo.tramos[2]!.precio)} cada uno, casi el triple del básico. El consumo fantasma suma ${num(rc.fantasmaBim, 1)} kWh (${num(pctFantasma, 1)} %).`
        : `Con ${num(rc.kwhBim)} kWh la casa queda en consumo ${rc.recibo.escalon}. Cada kWh que consumes equivale a ${num(FE_SEN * 1000)} g de CO₂e en la red mexicana (factor del SEN ${FE_SEN_ANIO}).`;
  } else if (modo === "cadena") {
    chipVivo = `${planta.corto} → ${focoC.etq.toLowerCase()} · ${num(cad.global * 100, 1)} % llega como luz`;
    pie =
      plantaId === "solar"
        ? `El parque solar convierte cerca del 20 % de la luz en electricidad y no emite CO₂ al generar; de noche, sin almacenamiento, no hay luz. Del total, ${num(cad.global * 100, 1)} % de la energía solar termina como luz del foco.`
        : `Para ${nFocos} ${nFocos === 1 ? "foco" : "focos"} ${num(horasLuz)} h al día hay que quemar ${num(cad.combustible)} ${planta.unidad} al año y se emiten ${num(cad.co2)} kg de CO₂. Cada partícula que se desvía es calor perdido.`;
  } else {
    chipVivo = `${num(totalH, 2)} t CO₂e al año · ${cambioTxt}`;
    pie = `Tu mayor globo es ${mayorCat.etq.toLowerCase()} (${num((hu[mayorCat.id] / totalH) * 100)} %). Todo tu CO₂ de un año, a 15 °C y 1 atm, llenaría una esfera de ${num(diametroEsfera(totalH), 1)} m de diámetro.`;
  }

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div
        style={{
          width: 74,
          height: 74,
          borderRadius: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 30,
          color: "#04121f",
          background: accent,
          boxShadow: `0 10px 30px -6px ${accent}`,
        }}
      >
        <i className={`fa-solid ${def.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{def.etq}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 440, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero los controles y los resultados siguen aquí. {pie}
      </div>
    </div>
  );

  const sub = (txt: string) => (
    <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px", textTransform: "uppercase" }}>{txt}</div>
  );
  const nota = (txt: ReactNode, col: string, icono = "fa-circle-info") => (
    <div style={{ marginTop: 10, fontSize: 12, lineHeight: 1.55, color: col }}>
      <i className={`fa-solid ${icono}`} style={{ marginRight: 7 }} />
      {txt}
    </div>
  );
  const dato = (etq: string, valor: string, col = "#fff") => (
    <div style={{ padding: "9px 10px", borderRadius: 10, background: "rgba(4,10,22,0.45)", border: `1px solid ${T.line}` }}>
      <div style={{ fontSize: 9.5, fontWeight: 800, color: T.text3, letterSpacing: "0.06em", textTransform: "uppercase" }}>{etq}</div>
      <div style={{ fontSize: 15, fontWeight: 900, color: col, marginTop: 3, ...NUM }}>{valor}</div>
    </div>
  );
  const rango = (label: string, min: number, max: number, step: number, value: number, onChange: (v: number) => void, txt: string, col = modoCol) => (
    <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
      <span style={{ width: 150, fontSize: 11.5, color: T.text2, fontWeight: 700 }}>{label.replace(/ \(.*\)$/, "")}</span>
      <input
        type="range"
        aria-label={label}
        className="ce-range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ["--cec" as string]: col }}
      />
      <span style={{ width: 78, textAlign: "right", fontSize: 12.5, color: "#fff", fontWeight: 800, ...NUM }}>{txt}</span>
    </label>
  );

  /* ── Panel ─────────────────────────────────────────────────────────── */
  let control: ReactNode = null;
  if (modo === "casa") {
    const maxBim = Math.max(...rc.aparatos.map((a) => a.kwhBim), 1);
    control = (
      <>
        {sub("1 · Toca un aparato (aquí o en la casa)")}
        <div className="ce-aps">
          {APARATOS.map((a) => {
            const c = rc.aparatos.find((x) => x.id === a.id)!;
            const on = a.id === sel;
            const estado = a.continuo || (casa.uso[a.id] && casa.horas[a.id] > 0) ? "uso" : c.esperaKwhDia > 0 ? "espera" : "off";
            return (
              <button
                key={a.id}
                className="ce-opt ce-ap"
                data-on={on}
                onClick={() => seleccionar(a.id)}
                style={{ ["--cec" as string]: modoCol, background: on ? `${modoCol}1f` : "transparent" }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: estado === "uso" ? OK : estado === "espera" ? "#f87171" : "rgba(255,255,255,0.2)",
                      flexShrink: 0,
                    }}
                  />
                  <i className={`fa-solid ${a.icono}`} style={{ width: 14, color: on ? modoCol : T.text3 }} />
                  <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.id === "focos" ? `${N_FOCOS} focos` : a.etq}</span>
                </span>
                <span style={{ display: "block", height: 3, borderRadius: 2, marginTop: 6, background: "rgba(255,255,255,0.08)" }}>
                  <span style={{ display: "block", height: 3, borderRadius: 2, width: `${(c.kwhBim / maxBim) * 100}%`, background: estado === "espera" ? "#f87171" : modoCol }} />
                </span>
                <span style={{ display: "block", fontSize: 10.5, color: T.text3, marginTop: 4, ...NUM }}>{num(c.kwhBim, 1)} kWh/bim</span>
              </button>
            );
          })}
        </div>

        {sub(`2 · ${ap.id === "focos" ? `${N_FOCOS} focos` : ap.etq}`)}
        <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5 }}>{ap.nota}</div>
        {!ap.continuo && (
          <div className="ce-opts" style={{ marginTop: 10 }}>
            <button
              className="ce-opt ce-uso"
              data-on={casa.uso[sel]}
              onClick={() => setUso(sel, true)}
              style={{ ["--cec" as string]: OK, background: casa.uso[sel] ? `${OK}1f` : "transparent" }}
            >
              <i className="fa-solid fa-power-off" style={{ marginRight: 8 }} />
              En uso
            </button>
            <button
              className="ce-opt ce-sinuso"
              data-on={!casa.uso[sel]}
              onClick={() => setUso(sel, false)}
              style={{ ["--cec" as string]: "#f87171", background: !casa.uso[sel] ? "#f871711f" : "transparent" }}
            >
              <i className="fa-solid fa-plug" style={{ marginRight: 8 }} />
              Sin usar (enchufado)
            </button>
          </div>
        )}
        {!ap.continuo && rango("Horas de uso al día (h)", 0, ap.hMax, ap.paso, casa.horas[sel], (v) => setHoras(sel, v), `${num(casa.horas[sel], 2)} h`)}
        {ap.id === "focos" && (
          <div className="ce-opts" style={{ marginTop: 10 }}>
            {FOCOS.map((f) => (
              <button
                key={f.id}
                className="ce-opt ce-foco"
                data-on={casa.foco === f.id}
                onClick={() => setFocoCasa(f.id)}
                style={{ ["--cec" as string]: accent, background: casa.foco === f.id ? `rgba(${color.rgba},0.16)` : "transparent" }}
              >
                {f.etq}
              </button>
            ))}
          </div>
        )}
        {ap.id === "focos" && nota(focoCasa.nota, T.text3, "fa-lightbulb")}
        {ap.id === "refri" && (
          <>
            <div className="ce-opts" style={{ marginTop: 10 }}>
              {REFRIS.map((x) => (
                <button
                  key={x.id}
                  className="ce-opt ce-refri"
                  data-on={casa.refri === x.id}
                  onClick={() => setRefri(x.id)}
                  style={{ ["--cec" as string]: accent, background: casa.refri === x.id ? `rgba(${color.rgba},0.16)` : "transparent" }}
                >
                  {x.etq} · {x.wMedia} W
                </button>
              ))}
            </div>
            {nota(REFRIS.find((x) => x.id === casa.refri)!.nota, T.text3, "fa-temperature-low")}
          </>
        )}
        <div style={{ marginTop: 10, fontSize: 12, color: T.text2, lineHeight: 1.6, ...NUM }}>
          Uso: {num(cAp.wUso)} W × {num(cAp.horasUso, 2)} h = <strong style={{ color: "#fff" }}>{num(cAp.usoKwhDia, 3)} kWh/día</strong>
          {ap.espera > 0 && (
            <>
              <br />
              Espera: {num(ap.espera, 1)} W × {num(cAp.horasEspera, 2)} h ={" "}
              <strong style={{ color: cAp.esperaKwhDia > 0 ? "#fca5a5" : "#fff" }}>{num(cAp.esperaKwhDia, 3)} kWh/día</strong>
            </>
          )}
          <br />
          Bimestre: {num(cAp.kwhDia, 3)} kWh × {DIAS_BIMESTRE} días = <strong style={{ color: modoCol }}>{num(cAp.kwhBim, 1)} kWh</strong>
        </div>

        {sub("3 · Consumo fantasma")}
        <button className="ce-toggle ce-regleta" onClick={setRegleta} style={{ ["--cec" as string]: casa.desconectar ? OK : "#f87171" }}>
          <i className={`fa-solid ${casa.desconectar ? "fa-plug-circle-xmark" : "fa-plug-circle-bolt"}`} style={{ marginRight: 9, color: casa.desconectar ? OK : "#f87171" }} />
          {casa.desconectar ? "Regleta apagada: lo que no usas está desconectado" : `Apagar la regleta (hoy se van ${num(rc.fantasmaBim, 1)} kWh en espera)`}
        </button>

        {sub("4 · Recibo bimestral · tarifa doméstica 1")}
        <div style={{ display: "grid", gap: 6 }}>
          {rc.recibo.tramos.map((t, k) => {
            const cap = k === 0 ? 150 : k === 1 ? 130 : Math.max(t.kwh, 150);
            return (
              <div key={t.id} style={{ display: "grid", gridTemplateColumns: "82px 1fr 150px", alignItems: "center", gap: 8, fontSize: 11.5, ...NUM }}>
                <span style={{ color: t.color, fontWeight: 800 }}>{t.etq}</span>
                <span style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                  <span style={{ display: "block", height: 8, width: `${Math.min(100, (t.kwh / cap) * 100)}%`, background: t.color }} />
                </span>
                <span style={{ textAlign: "right", color: T.text2 }}>
                  {num(t.kwh)} × {pesos(t.precio)} = <strong style={{ color: "#fff" }}>{pesos(t.importe)}</strong>
                </span>
              </div>
            );
          })}
        </div>
        <div className="ce-datos" style={{ marginTop: 10 }}>
          {dato("kWh del bimestre", num(rc.kwhBim), rc.recibo.escalon === "excedente" ? "#f87171" : "#fff")}
          {dato("Total con IVA", pesos(rc.recibo.total), modoCol)}
          {dato(`CO₂e (× ${FE_SEN})`, `${num(rc.co2Bim)} kg`)}
          {dato("Fantasma", `${num(pctFantasma, 1)} %`, pctFantasma > 0 ? "#fca5a5" : OK)}
        </div>
        {rc.kwhBim > LIMITE_DAC_BIM &&
          nota(
            `Más de ${LIMITE_DAC_BIM} kWh al bimestre: si el promedio del año pasa de 250 kWh al mes, la CFE cambia la casa a la tarifa DAC, sin subsidio.`,
            "#f87171",
            "fa-triangle-exclamation",
          )}
        {nota("Precios de referencia de 2025, aproximados y sin cargos fijos ni DAP; la CFE los ajusta cada mes y varían por región.", T.text3)}
      </>
    );
  } else if (modo === "cadena") {
    const pasos: { etq: string; kwh: number; col: string; txt?: string }[] = [
      {
        etq: `Entra (${planta.entrada})`,
        kwh: cad.entrada,
        col: planta.color === "#475569" ? "#94a3b8" : planta.color,
        txt: planta.pc > 0 ? `${num(cad.combustible)} ${planta.unidad}` : "sin combustible",
      },
      { etq: "Calor en la planta", kwh: -cad.perdidaPlanta, col: "#fb923c" },
      { etq: "Pérdidas de la red", kwh: -cad.perdidaRed, col: "#ef4444" },
      { etq: "Llega al foco", kwh: cad.electricidadFoco, col: "#22d3ee" },
      { etq: "Calor del foco", kwh: -cad.calorFoco, col: "#f87171" },
      { etq: "Luz visible", kwh: cad.luz, col: "#fef08a" },
    ];
    control = (
      <>
        {sub("1 · La central eléctrica")}
        <div className="ce-opts">
          {PLANTAS.map((p) => (
            <button
              key={p.id}
              className="ce-opt ce-planta"
              data-on={p.id === plantaId}
              onClick={() => elegirCadena(p.id, focoId)}
              style={{ ["--cec" as string]: modoCol, background: p.id === plantaId ? `${modoCol}1f` : "transparent" }}
            >
              {p.etq} · η {num(p.eta * 100)} %
            </button>
          ))}
        </div>
        {nota(planta.nota, T.text3, plantaId === "solar" ? "fa-sun" : "fa-industry")}
        {sub("2 · El foco (los tres dan 800 lúmenes)")}
        <div className="ce-opts">
          {FOCOS.map((f) => (
            <button
              key={f.id}
              className="ce-opt ce-foco2"
              data-on={f.id === focoId}
              onClick={() => elegirCadena(plantaId, f.id)}
              style={{ ["--cec" as string]: accent, background: f.id === focoId ? `rgba(${color.rgba},0.16)` : "transparent" }}
            >
              {f.etq} · {num(fraccionLuz(f) * 100, 1)} % luz
            </button>
          ))}
        </div>
        {rango("Número de focos", 1, 10, 1, nFocos, setNFocos, `${nFocos}`)}
        {rango("Horas encendidos al día (h)", 1, 12, 1, horasLuz, setHorasLuz, `${horasLuz} h`)}
        {sub("3 · La energía de un año, etapa por etapa")}
        <div style={{ display: "grid", gap: 6 }}>
          {pasos.map((s) => (
            <div key={s.etq} style={{ display: "grid", gridTemplateColumns: "130px 1fr 120px", alignItems: "center", gap: 8, fontSize: 11.5, ...NUM }}>
              <span style={{ color: s.col, fontWeight: 800 }}>{s.etq}</span>
              <span style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <span
                  style={{ display: "block", height: 8, width: `${Math.max(0.6, (Math.abs(s.kwh) / cad.entrada) * 100)}%`, background: s.col, opacity: s.kwh < 0 ? 0.65 : 1 }}
                />
              </span>
              <span style={{ textAlign: "right", color: "#fff", fontWeight: 800 }}>
                {s.kwh < 0 ? "−" : ""}
                {num(Math.abs(s.kwh), 1)} kWh
              </span>
            </div>
          ))}
        </div>
        <div className="ce-datos" style={{ marginTop: 10 }}>
          {dato("Eficiencia total", `${num(cad.global * 100, 1)} %`, modoCol)}
          {dato("CO₂ al año", `${num(cad.co2, 1)} kg`, cad.co2 > 0 ? "#fca5a5" : OK)}
          {dato("Combustible", planta.pc > 0 ? `${num(cad.combustible, 1)}` : "0", "#fff")}
          {dato("vs carbón + incand.", plantaId === "solar" ? "sin quemar" : `${num(veces, 1)}× menos`, veces >= 5 ? OK : "#fff")}
        </div>
        <div style={{ marginTop: 10, fontSize: 12, color: T.text2, lineHeight: 1.6, ...NUM }}>
          Eficiencia total = planta × red × foco = {num(planta.eta * 100)} % × {num((1 - PERDIDAS_RED) * 100, 1)} % × {num(fraccionLuz(focoC) * 100, 1)} % ={" "}
          <strong style={{ color: modoCol }}>{num(cad.global * 100, 2)} %</strong>
        </div>
        {nota(
          "Eficiencias típicas de cada tecnología; CO₂ con factores del IPCC 2006; pérdidas de la red de 2023 (PRODESEN 2024-2038). La fracción de luz se estima dividiendo la eficacia del foco (lm/W) entre 250 lm/W de la luz blanca ideal.",
          T.text3,
        )}
      </>
    );
  } else {
    control = (
      <>
        {sub("1 · Cómo te mueves")}
        <div className="ce-opts">
          {TRANSPORTES.map((t) => (
            <button
              key={t.id}
              className="ce-opt ce-tr"
              data-on={t.id === h.transporte}
              onClick={() => {
                setHu({ transporte: t.id });
                blip();
              }}
              style={{ ["--cec" as string]: modoCol, background: t.id === h.transporte ? `${modoCol}1f` : "transparent" }}
            >
              <i className={`fa-solid ${t.icono}`} style={{ marginRight: 7 }} />
              {t.etq}
            </button>
          ))}
        </div>
        {rango("Kilómetros al día (km)", 0, 60, 1, h.km, (v) => setHu({ km: v }), `${h.km} km`)}
        {nota(
          `${TRANSPORTES.find((t) => t.id === h.transporte)!.nota} ${num(TRANSPORTES.find((t) => t.id === h.transporte)!.kgKm, 3)} kg × ${h.km} km × 365 días = ${num(hu.transporte, 2)} t.`,
          T.text3,
          "fa-route",
        )}
        {sub("2 · Qué comes (porción de 120 g)")}
        {rango("Porciones de res a la semana", 0, 10, 1, h.res, (v) => setHu({ res: v }), `${h.res}`, "#fbbf24")}
        {rango("Porciones de pollo o cerdo a la semana", 0, 14, 1, h.polloCerdo, (v) => setHu({ polloCerdo: v }), `${h.polloCerdo}`, "#fbbf24")}
        {nota("Producir 1 kg de carne de res emite ≈ 60 kg de CO₂e (metano del ganado y deforestación); 1 kg de pollo o cerdo, ≈ 6.5 kg.", T.text3, "fa-drumstick-bite")}
        {sub("3 · Tu casa")}
        <div className="ce-opts">
          {CALENTADORES.map((c) => (
            <button
              key={c.id}
              className="ce-opt ce-cal"
              data-on={c.id === h.calentador}
              onClick={() => {
                setHu({ calentador: c.id });
                blip();
              }}
              style={{ ["--cec" as string]: "#38bdf8", background: c.id === h.calentador ? "#38bdf81f" : "transparent" }}
            >
              {c.etq}
            </button>
          ))}
        </div>
        {rango("Personas en la casa", 1, 8, 1, h.habitantes, (v) => setHu({ habitantes: v }), `${h.habitantes}`, "#38bdf8")}
        {nota(
          `La electricidad sale del modo «Mi casa»: ${num(rc.kwhBim)} kWh al bimestre × 6 × ${FE_SEN} kg, más el gas LP, repartidos entre ${h.habitantes} ${h.habitantes === 1 ? "persona" : "personas"}.`,
          T.text3,
          "fa-house",
        )}
        {sub("4 · Lo que compras")}
        <div className="ce-opts">
          {BIENES.map((b) => (
            <button
              key={b.id}
              className="ce-opt ce-bienes"
              data-on={b.id === h.bienes}
              onClick={() => {
                setHu({ bienes: b.id });
                blip();
              }}
              style={{ ["--cec" as string]: "#c084fc", background: b.id === h.bienes ? "#c084fc1f" : "transparent" }}
            >
              {b.etq}
            </button>
          ))}
        </div>
        {sub("Tu distribución frente a la de la lectura A1")}
        {[
          { etq: "Tú", pcts: CATEGORIAS.map((c) => (hu[c.id] / totalH) * 100) },
          { etq: "A1", pcts: CATEGORIAS.map((c) => c.a1) },
        ].map((fila) => (
          <div key={fila.etq} style={{ display: "grid", gridTemplateColumns: "28px 1fr", gap: 8, alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 900, color: T.text2 }}>{fila.etq}</span>
            <div style={{ display: "flex", height: 20, borderRadius: 6, overflow: "hidden" }}>
              {CATEGORIAS.map((c, k) => (
                <div
                  key={c.id}
                  title={c.etq}
                  style={{
                    width: `${fila.pcts[k]}%`,
                    background: c.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 900,
                    color: "#04121f",
                    overflow: "hidden",
                    ...NUM,
                  }}
                >
                  {(fila.pcts[k] ?? 0) >= 8 ? `${num(fila.pcts[k] ?? 0)}%` : ""}
                </div>
              ))}
            </div>
          </div>
        ))}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 10.5, color: T.text3, marginBottom: 4 }}>
          {CATEGORIAS.map((c) => (
            <span key={c.id}>
              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: c.color, marginRight: 5 }} />
              {c.etq}
            </span>
          ))}
        </div>
        <div className="ce-datos" style={{ marginTop: 10 }}>
          {dato("Tu huella", `${num(totalH, 2)} t`, modoCol)}
          {dato("Cambio", `${cambioTxt}`, reduccion >= 0.4 ? OK : "#fff")}
          {dato("Transporte", `${num(hu.transporte, 2)} t`, transporteMitad ? OK : "#fff")}
          {dato("Esfera total", `${num(diametroEsfera(totalH), 1)} m`)}
        </div>
        {nota(
          `Referencia: México emitió 748 Mt de CO₂e en 2022 (A1) para unos 129 millones de habitantes: ${num(PER_CAPITA_MX, 1)} t por persona, incluyendo industria, energía y agricultura del país, no solo los hábitos personales.`,
          T.text3,
          "fa-flag",
        )}
      </>
    );
  }

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes cePulse { 0%,100%{ box-shadow:0 0 0 0 var(--ced); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .ce-live-dot { animation: cePulse 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce){ .ce-live-dot { animation:none; } }
        .ce-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(310px,28vw,410px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .ce-grid { grid-template-columns: 1fr; } }
        .ce-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .ce-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .ce-icobtn:hover { background:rgba(255,255,255,0.12); }
        .ce-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .ce-tab { cursor:pointer; border:1px solid var(--cec); border-radius:12px; padding:11px 8px; text-align:center; background:transparent; transition:all .15s; color:#fff; }
        .ce-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.62); }
        .ce-tab:hover { background:rgba(255,255,255,0.06); }
        .ce-opts { display:flex; flex-wrap:wrap; gap:7px; }
        .ce-aps { display:grid; grid-template-columns: repeat(auto-fill, minmax(150px,1fr)); gap:7px; }
        .ce-datos { display:grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap:7px; }
        @media (max-width: 640px){ .ce-datos { grid-template-columns: repeat(2, minmax(0,1fr)); } .ce-duelo { grid-template-columns: 1fr !important; } }
        .ce-opt { cursor:pointer; border:1px solid var(--cec); border-radius:10px; padding:9px 12px; font-size:12px; font-weight:800; color:#fff; background:transparent; transition:all .15s; text-align:left; }
        .ce-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.72); }
        .ce-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
        .ce-opt:disabled { cursor:default; }
        .ce-toggle { width:100%; cursor:pointer; border:1px solid var(--cec); border-radius:11px; padding:11px 14px; background:rgba(4,10,22,0.4); color:#fff; font-size:12.5px; font-weight:900; text-align:left; transition:all .15s; }
        .ce-toggle:hover { background:rgba(255,255,255,0.07); }
        .ce-range { flex:1; min-width:0; accent-color: var(--cec); }
        .ce-opt:focus-visible, .ce-tab:focus-visible, .ce-toggle:focus-visible, .ce-icobtn:focus-visible, .ce-range:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
        @media (max-width: 1000px){ .ce-bottom { grid-template-columns: 1fr !important; } }
        .ce-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px); opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .ce-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .ce-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61; background:linear-gradient(180deg,#06121e 0%,#040a16 100%);
          border-left:1px solid rgba(${color.rgba},0.32); box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1); display:flex; flex-direction:column; }
        .ce-drawer[data-open="true"] { transform:translateX(0); }
        .ce-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .ce-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .ce-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .ce-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .ce-teoria-fab { position:absolute; bottom:16px; right:16px; cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:11px 16px; border-radius:999px;
          border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800; background:rgba(4,10,22,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; z-index:5; }
        .ce-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
      `}</style>

      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="ce-tabs">
          {MODOS.map((m) => {
            const d = MODOS_DEF[m];
            const col = `#${d.color.replace("#", "")}`;
            const on = m === modo;
            return (
              <button key={m} className="ce-tab" data-on={on} onClick={() => cambiarModo(m)} style={{ ["--cec" as string]: col, background: on ? `${col}1f` : "transparent" }}>
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

      <div className="ce-grid">
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
              <ConsumoScene
                vista={vista}
                modoColor={modoCol}
                resetNonce={resetNonce}
                casa={casa}
                seleccionado={sel}
                onSeleccionar={seleccionar}
                plantaId={plantaId}
                focoId={focoId}
                huella={hu}
              />
            </SceneBoundary>

            <div style={{ position: "absolute", top: 14, left: 16, right: 150, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, pointerEvents: "none" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 14px 8px 12px",
                  borderRadius: 999,
                  background: "rgba(4,10,22,0.74)",
                  border: `1px solid ${modoCol}66`,
                  backdropFilter: "blur(10px)",
                  maxWidth: "100%",
                }}
              >
                <span className="ce-live-dot" style={{ ["--ced" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3, flexShrink: 0 }}>EN VIVO</span>
                <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)", flexShrink: 0 }} />
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 900,
                    color: "#fff",
                    fontFamily: "ui-monospace, monospace",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    ...NUM,
                  }}
                >
                  {chipVivo}
                </span>
              </div>
            </div>

            <div
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                display: "flex",
                gap: 2,
                padding: 4,
                borderRadius: 12,
                background: "rgba(4,10,22,0.74)",
                border: `1px solid ${T.line}`,
                backdropFilter: "blur(10px)",
              }}
            >
              <button className="ce-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría" aria-label="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button
                className="ce-icobtn"
                data-on={sonido}
                onClick={toggleSonido}
                title={sonido ? "Silenciar" : "Activar sonido"}
                aria-label={sonido ? "Silenciar" : "Activar sonido"}
              >
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="ce-icobtn" onClick={reiniciar} title="Reiniciar" aria-label="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "30px 132px 14px 18px",
                background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)",
                pointerEvents: "none",
              }}
            >
              <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                <i className={`fa-solid ${def.icono}`} style={{ color: modoCol, marginRight: 7 }} />
                {def.etq} — {def.subtitulo}
              </div>
              <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6, ...NUM }}>{pie}</div>
            </div>

            <button className="ce-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>
          </div>

          <div style={{ ...card, padding: "18px 22px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: modoCol }} />
              Controles — {def.etq}
            </Eyebrow>
            <div style={{ marginTop: 4 }}>{control}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${accent}66`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  color: "#04121f",
                  background: accent,
                }}
              >
                <i className="fa-solid fa-file-invoice-dollar" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>¿Qué hay detrás de tu recibo de luz?</div>
            </div>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{PROBLEMA}</div>
          </div>

          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: "1px solid #7dd3fc55", background: "rgba(125,211,252,0.07)" }}>
            <Eyebrow>
              <i className="fa-solid fa-book-open" style={{ marginRight: 8, color: "#7dd3fc" }} />
              Lectura A1
            </Eyebrow>
            <div style={{ fontSize: 13, color: "#fff", fontWeight: 800, lineHeight: 1.4, marginBottom: 10 }}>{TITULO_A1}</div>
            <div style={{ display: "grid", gap: 9, marginBottom: 12 }}>
              {LECTURA_A1.map((p, i) => (
                <div key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>
                  {p}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, fontWeight: 900, color: T.text3, letterSpacing: "0.08em", marginBottom: 8 }}>PARA REFLEXIONAR</div>
            <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 8 }}>
              {PREGUNTAS.map((q, i) => (
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
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 11,
                    alignItems: "flex-start",
                    padding: "10px 12px",
                    borderRadius: 11,
                    background: "rgba(4,10,22,0.4)",
                    border: `1px solid ${accent}25`,
                  }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 900,
                      color: "#04121f",
                      background: accent,
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </div>
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

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="ce-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <div style={{ padding: "14px 16px", borderRadius: 12, border: `1px solid ${accent}33`, background: `rgba(${color.rgba},0.07)` }}>
            <Eyebrow>
              <i className="fa-solid fa-scale-balanced" style={{ marginRight: 8, color: accent }} />
              Importante (lectura A1)
            </Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{RECUADRO_A1}</div>
          </div>
          <div style={{ marginTop: 16 }}>
            <Eyebrow>
              <i className="fa-solid fa-circle-question" style={{ marginRight: 8, color: accent }} />
              Hechos (quiz A4)
            </Eyebrow>
            <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 8 }}>
              {HECHOS.map((x, i) => (
                <li key={i} style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>
                  {x}
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
                    <i className="fa-solid fa-plug" style={{ marginRight: 6, color: accent }} />
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
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
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
          <div style={{ ...card, padding: "18px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-comments" style={{ marginRight: 8, color: accent }} />
              Para debatir (A3)
            </Eyebrow>
            <div style={{ fontSize: 12.5, color: "#fff", fontWeight: 800, lineHeight: 1.45, marginBottom: 8 }}>{DEBATE_A3.tema}</div>
            {DEBATE_A3.posturas.map((p, i) => (
              <div key={i} style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45, padding: "7px 10px", borderRadius: 9, border: `1px solid ${T.line}`, marginBottom: 6 }}>
                <strong style={{ color: accent }}>Postura {i + 1}:</strong> {p}
              </div>
            ))}
            <ul style={{ margin: "6px 0 0", paddingLeft: 16, display: "grid", gap: 5 }}>
              {DEBATE_A3.reglas.map((x, i) => (
                <li key={i} style={{ fontSize: 11, color: T.text3, lineHeight: 1.4 }}>
                  {x}
                </li>
              ))}
            </ul>
            <div style={{ fontSize: 11.5, color: T.text2, marginTop: 10, lineHeight: 1.45 }}>
              <strong style={{ color: "#fff" }}>Reflexión (A7):</strong> {REFLEXION_A7}
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, fontSize: 11.5, color: T.text3, lineHeight: 1.5, display: "flex", gap: 9, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          La lectura A1 con sus preguntas y su recuadro, el quiz A2, el debate A3, los hechos del quiz A4, el glosario A5, el texto A6 y la reflexión A7 son{" "}
          <strong>verbatim</strong> del material de la plataforma. Son <strong>datos oficiales</strong>: el factor de emisión del Sistema Eléctrico Nacional {FE_SEN_ANIO} (0.444
          tCO₂e/MWh, aviso de la CRE y la SENER), las pérdidas de la red de 12.2 % en 2023 (PRODESEN 2024-2038) y los bloques de 150 y 130 kWh de la tarifa doméstica 1. Son{" "}
          <strong>aproximados o ilustrativos</strong>: los precios del kWh (referencia de 2025, sin cargos fijos), las potencias y horas de los aparatos, las eficiencias típicas de
          las centrales, la fracción de luz de cada foco, los factores por kilómetro, la huella de los alimentos (medianas de Poore y Nemecek, 2018), el gas LP y los bienes. Los
          globos suponen CO₂ a 15 °C y 1 atm. Fuente: {FUENTE}
        </span>
      </div>

      <DueloCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sfx} />

      <RetoQuizCard
        quiz={QUIZ_A2}
        accent={accent}
        rgba={color.rgba}
        aprobado={quizAprobado}
        onAprobado={() => setQuizAprobado(true)}
        playSfx={sfx}
        playPick={blip}
        mensajeAprobado="¡Aprobado! Sabes medir el impacto de la energía que usas."
      />

      <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-keyboard" style={{ marginRight: 8, color: accent }} />
          Completa el texto (A6)
        </Eyebrow>
        <div style={{ marginTop: 12 }}>
          <CompletaTexto
            data={HUECOS_A6}
            accent={accent}
            rgba={color.rgba}
            completado={textoOk}
            onCompletado={() => {
              setTextoOk(true);
              sfx(true);
            }}
            onAcierto={blip}
            onError={() => sfx(false)}
          />
        </div>
      </div>

      <div className="ce-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="ce-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="ce-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="ce-close" onClick={() => setDrawer(false)} title="Cerrar" aria-label="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="ce-drawer-body">
          <FichaTeorica data={CONSUMO_ENERGETICO_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}
