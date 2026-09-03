"use client";

/**
 * Laboratorio 3D — Estadística descriptiva.
 * Pensamiento Matemático VI («Pensamiento estadístico y probabilístico»).
 *
 * Un mismo conjunto de datos se visualiza como un "dot plot" 3D sobre la recta
 * numérica y según el modo se marcan:
 *   • TENDENCIA — la MEDIA como fulcro de una balanza (la inclina el atípico),
 *     la MEDIANA como corte central y la(s) MODA(s) como columna(s) más altas;
 *   • DISPERSIÓN — la banda media ± σ y el rango [mín, máx];
 *   • HISTOGRAMA — el agrupamiento de los datos en intervalos (clases).
 *
 * Sirve a tres propósitos formativos de PM-VI mediante un único shell con tres
 * variantes iniciales:
 *   tendencia  → PM-VI-P03-A2 (medidas de tendencia central),
 *   dispersion → PM-VI-P04-A2 (medidas de dispersión),
 *   graficas   → PM-VI-P02-A2 (tablas de frecuencia e histogramas).
 * Contenido VERBATIM del Modelo MCCEMS 2025; nada se inventa.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { EppGate, type EppItem } from "./_epp-gate";
import { FichaTeorica } from "./_ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { useLogros } from "./_partida";
import { ESTADISTICA_FICHA } from "./estadistica-ficha";
import {
  CONJUNTOS,
  CONJUNTO_DEFAULT,
  conjuntoPorId,
  VARIANTES,
  IDEAS,
  GLOSARIO,
  CONTEXTO,
  resumen,
  fmt,
  RETO_TENDENCIA,
  RETO_DISPERSION,
  RETO_GRAFICAS,
  type Variante,
  type RetoNumericoData,
} from "./estadistica-data";

const EstadisticaScene = dynamic(() => import("./EstadisticaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-chart-simple fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const ORO = "#ffd24a";
const VERDE = "#34D399";
const AZUL = "#5fb0ff";
const MAGENTA = "#f0a6ff";

// La mejor marca del reto se guarda por variante (cada slug tiene su ancla A2).
const RETO_POR_VARIANTE: Record<Variante, { reto: RetoNumericoData; key: string }> = {
  tendencia: { reto: RETO_TENDENCIA, key: "cen-estadistica-reto-tendencia" },
  dispersion: { reto: RETO_DISPERSION, key: "cen-estadistica-reto-dispersion" },
  graficas: { reto: RETO_GRAFICAS, key: "cen-estadistica-reto-graficas" },
};

// Conjunto recomendado para arrancar cada variante (la data del propio ejercicio).
const CONJUNTO_POR_VARIANTE: Record<Variante, string> = {
  tendencia: "salarios",
  dispersion: "grupoA",
  graficas: "examen20",
};

// Pilar EQUIPARSE: en un estudio estadístico el “equipo” es el instrumental para
// RECOLECTAR datos y CALCULAR (3 correctos + 3 distractores que miden otra cosa).
const INSTRUMENTOS: EppItem[] = [
  { key: "hoja", nombre: "Hoja de registro", icono: "fa-table-list", ok: true, nota: "Anota cada dato de la muestra para luego ordenarlos y contarlos." },
  { key: "calc", nombre: "Calculadora científica", icono: "fa-calculator", ok: true, nota: "Calcula la suma, la media, la varianza y la desviación estándar." },
  { key: "regla", nombre: "Regla y papel cuadriculado", icono: "fa-ruler", ok: true, nota: "Construye la tabla de frecuencias y traza el histograma a escala." },
  { key: "dado", nombre: "Dado", icono: "fa-dice", ok: false, nota: "Genera azar artificial; aquí trabajas con datos ya recolectados." },
  { key: "termo", nombre: "Termómetro", icono: "fa-temperature-half", ok: false, nota: "Mide temperatura; no es el instrumento para resumir un conjunto de datos." },
  { key: "balanza", nombre: "Balanza de laboratorio", icono: "fa-scale-unbalanced", ok: false, nota: "Mide masa; el «equilibrio» de la media es una analogía, no se pesa nada." },
];

/** Shell base; cada slug fija su `varianteInicial`. */
function LabEstadistica({ color, varianteInicial }: PracticaLabProps & { varianteInicial: Variante }) {
  const accent = `#${color.hex.replace("#", "")}`;

  const conjuntoArranque = CONJUNTO_POR_VARIANTE[varianteInicial] ?? CONJUNTO_DEFAULT;
  const [conjuntoId, setConjuntoId] = useState(conjuntoArranque);
  const [modo, setModo] = useState<Variante>(varianteInicial);
  const [verMedia, setVerMedia] = useState(true);
  const [verMediana, setVerMediana] = useState(true);
  const [verModa, setVerModa] = useState(true);
  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // objetivos
  const [cambioConjunto, setCambioConjunto] = useState(false);
  const [vioTendencia, setVioTendencia] = useState(varianteInicial === "tendencia");
  const [vioDispersion, setVioDispersion] = useState(varianteInicial === "dispersion");
  const [vioGraficas, setVioGraficas] = useState(varianteInicial === "graficas");

  // compuerta de equipamiento (pilar EQUIPARSE)
  const [eppListo, setEppListo] = useState(false);

  // reto evaluable, teoría (cajón deslizable) y sonido
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);

  const retoActual = RETO_POR_VARIANTE[varianteInicial];

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

  const bump = () => setResetNonce((k) => k + 1);

  const conjunto = useMemo(() => conjuntoPorId(conjuntoId), [conjuntoId]);
  const stats = useMemo(() => resumen(conjunto.valores), [conjunto]);
  const dec = conjunto.dec;

  const elegirConjunto = (id: string) => {
    setConjuntoId(id);
    setCambioConjunto(true);
    if (sonido) audioRef.current?.blip();
    bump();
  };

  const elegirModo = (m: Variante) => {
    setModo(m);
    if (sonido) audioRef.current?.blip();
    if (m === "tendencia") setVioTendencia(true);
    if (m === "dispersion") setVioDispersion(true);
    if (m === "graficas") setVioGraficas(true);
  };

  const reset = () => {
    setModo(varianteInicial);
    setConjuntoId(conjuntoArranque);
    setVerMedia(true);
    setVerMediana(true);
    setVerModa(true);
    bump();
  };

  const modoActual = VARIANTES.find((v) => v.id === modo) ?? VARIANTES[0]!;

  const modaTxt =
    stats.moda.tipo === "amodal"
      ? "sin moda"
      : stats.moda.valores.map((v) => fmt(v, dec)).join(", ");

  const objetivos = [
    { txt: "Equípate con el instrumental de recolección y cálculo", done: eppListo },
    { txt: "Carga distintos conjuntos de datos reales", done: cambioConjunto },
    { txt: "Identifica la media, la mediana y la moda", done: vioTendencia },
    { txt: "Mide la dispersión: rango, varianza y desviación σ", done: vioDispersion },
    { txt: "Agrupa los datos y lee el histograma", done: vioGraficas },
    { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
  ];
  // Los objetivos se recuerdan (algunos dependían del modo y se desmarcaban
  // solos) y se convierten en la marca del laboratorio, que antes no se
  // guardaba en ninguna parte.
  const { logros: logrosLab, cumplidos: cumplidosLab, total: totalLab } = useLogros(objetivos.map((o) => o.done));
  const { registraEstrellas } = useEstrellas(RETO_KEY);
  useEffect(() => {
    if (cumplidosLab === 0) return;
    const est = cumplidosLab >= totalLab ? 3 : cumplidosLab >= Math.ceil((totalLab * 2) / 3) ? 2 : 1;
    registraEstrellas(est);
  }, [cumplidosLab, totalLab, registraEstrellas]);

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-chart-simple" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Resumir muchos datos en pocos números</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: la MEDIA es el promedio (sensible a valores atípicos), la MEDIANA es el valor central (resistente a ellos) y la MODA es el valor más frecuente. La dispersión —rango, varianza y desviación σ— mide qué tan esparcidos están los datos.
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes estPulse { 0%,100%{ box-shadow:0 0 0 0 var(--est); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .est-live-dot { animation: estPulse 1.6s ease-in-out infinite; }
        .est-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(300px,26vw,380px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .est-grid { grid-template-columns: 1fr; } }
        .est-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .est-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .est-icobtn:hover { background:rgba(255,255,255,0.12); }
        .est-divider { height:1px; background:${T.line}; margin:18px 0; }
        .est-catgrid { display:grid; grid-template-columns: 1fr; gap:8px; }
        .est-catbtn { cursor:pointer; text-align:left; display:flex; flex-direction:column; gap:2px;
          padding:9px 11px; border-radius:11px; border:1px solid ${T.line}; background:${T.inset};
          color:${T.text2}; transition:all .15s; }
        .est-catbtn:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
        .est-catbtn[data-on="true"] { border-color:var(--est); background:rgba(${color.rgba},0.14); color:#fff; box-shadow:0 4px 16px -8px var(--est); }
        .est-modgrid { display:grid; grid-template-columns: 1fr 1fr 1fr; gap:8px; }
        @media (max-width: 560px){ .est-modgrid { grid-template-columns: 1fr; } }
        .est-modbtn { cursor:pointer; text-align:center; display:flex; flex-direction:column; align-items:center; gap:5px;
          padding:11px 8px; border-radius:12px; border:1px solid ${T.line}; background:${T.inset}; color:${T.text2}; transition:all .15s; }
        .est-modbtn:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
        .est-modbtn[data-on="true"] { border-color:var(--est); background:rgba(${color.rgba},0.14); color:#fff; box-shadow:0 4px 16px -8px var(--est); }
        .est-chip { cursor:pointer; display:inline-flex; align-items:center; gap:7px; padding:8px 13px; border-radius:999px;
          border:1px solid ${T.line}; background:${T.inset}; color:${T.text2}; font-size:12px; font-weight:800; transition:all .15s; }
        .est-chip:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
        .est-chip[data-on="true"] { color:#04121f; }

        /* Banda de pasos guiados (pilar SEGUIR PASOS) */
        .est-steps { display:grid; grid-template-columns: repeat(5, 1fr); gap:10px; }
        @media (max-width: 760px){ .est-steps { grid-template-columns: 1fr 1fr; } }
        .est-step { display:flex; gap:10px; align-items:flex-start; padding:11px 12px; border-radius:13px;
          border:1px solid ${T.line}; background:${T.inset}; transition:all .18s; }
        .est-step[data-on="true"] { border-color:var(--est); background:rgba(${color.rgba},0.12); box-shadow:0 4px 16px -8px var(--est); }
        .est-step-n { flex-shrink:0; width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center;
          font-size:12px; font-weight:900; color:${T.text3}; background:${T.glass}; border:1px solid ${T.line}; }
        .est-step[data-on="true"] .est-step-n { color:#04121f; background:var(--est); border-color:var(--est); }
        .est-step-tx { font-size:11.5px; line-height:1.4; color:${T.text2}; }
        .est-step[data-on="true"] .est-step-tx { color:#fff; }
        .est-step-tx strong { display:block; font-size:12px; color:${T.text}; margin-bottom:1px; }

        /* Cajón de teoría */
        .es-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .es-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .es-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .es-drawer[data-open="true"] { transform:translateX(0); }
        .es-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .es-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .es-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .es-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .es-teoria-fab { position:absolute; bottom:16px; left:50%; transform:translateX(-50%); cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .es-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateX(-50%) translateY(-1px); }
        @media (max-width: 1000px){ .est-bottom { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* ── Banda de pasos guiados (pilar SEGUIR PASOS) ──────────────── */}
      <div style={{ ...card, padding: "16px 20px", marginBottom: 18 }}>
        <Eyebrow>
          <i className="fa-solid fa-list-check" style={{ marginRight: 8, color: accent }} />
          Sigue los pasos del experimento
        </Eyebrow>
        <div className="est-steps" style={{ ["--est" as string]: accent }}>
          {[
            { n: 1, done: eppListo, t: "Equípate", d: "Elige el instrumental de recolección y cálculo." },
            { n: 2, done: cambioConjunto, t: "Carga los datos", d: "Prueba distintos conjuntos reales de México." },
            { n: 3, done: vioTendencia, t: "Centro", d: "Mira media (fulcro), mediana (corte) y moda." },
            { n: 4, done: vioDispersion || vioGraficas, t: "Dispersión / forma", d: "Banda media ± σ e histograma por intervalos." },
            { n: 5, done: ejercicioAprobado, t: "Resuelve A2", d: "Aprueba el reto evaluable de la actividad." },
          ].map((s) => (
            <div key={s.n} className="est-step" data-on={s.done}>
              <span className="est-step-n">{s.done ? <i className="fa-solid fa-check" /> : s.n}</span>
              <span className="est-step-tx">
                <strong>{s.t}</strong>
                {s.d}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="est-grid">
        {/* ── Columna visor ──────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              position: "relative",
              height: "clamp(460px, 66vh, 780px)",
              borderRadius: 20,
              overflow: "hidden",
              border: `1px solid rgba(${color.rgba},0.22)`,
              background: `radial-gradient(120% 80% at 50% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#06182f 0%,#020d1d 100%)`,
              boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}`,
            }}
          >
            <SceneBoundary fallback={sceneFallback}>
              <EstadisticaScene
                valores={conjunto.valores}
                accent={accent}
                modo={modo}
                unidad={conjunto.simbolo}
                dec={dec}
                pausado={pausado}
                autoRotate={autoRotate}
                resetNonce={resetNonce}
                verMedia={verMedia}
                verMediana={verMediana}
                verModa={verModa}
              />
            </SceneBoundary>

            {/* Compuerta de equipamiento (pilar EQUIPARSE) */}
            {!eppListo && (
              <EppGate
                accent={accent}
                rgba={color.rgba}
                items={INSTRUMENTOS}
                titulo="Prepara tu mesa de análisis de datos"
                subtitulo="Antes de resumir los datos, equípate con lo correcto"
                intro={`Para ordenar la muestra, calcular media, mediana, moda y desviación, y trazar el histograma necesitas el instrumental adecuado. Selecciona solo las ${INSTRUMENTOS.filter((i) => i.ok).length} piezas que sirven para recolectar y calcular (deja fuera las que miden otra cosa o generan azar).`}
                verbo="recolección y cálculo"
                onEntrar={() => {
                  setEppListo(true);
                  if (sonido) audioRef.current?.blip();
                }}
              />
            )}

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(2,12,28,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="est-live-dot" style={{ ["--est" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 15, fontWeight: 900, color: accent, fontFamily: "ui-monospace, monospace" }}>
                <i className="fa-solid fa-chart-simple" style={{ marginRight: 8 }} />
                n = {stats.n}
              </span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(2,12,28,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="est-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="est-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="est-icobtn" data-on={!pausado} onClick={() => setPausado((p) => !p)} title={pausado ? "Reanudar" : "Pausar"}>
                <i className={`fa-solid ${pausado ? "fa-play" : "fa-pause"}`} />
              </button>
              <button className="est-icobtn" data-on={autoRotate} onClick={() => setAutoRotate((v) => !v)} title="Girar la cámara">
                <i className="fa-solid fa-arrows-rotate" />
              </button>
              <button className="est-icobtn" onClick={reset} title="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Pie: lectura del modo actual */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(2,10,24,0.88) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#dCE8F6", lineHeight: 1.5, maxWidth: 660 }}>
                {modo === "dispersion" ? (
                  <>
                    <strong style={{ color: ORO }}>media x̄</strong> {fmt(stats.media, dec)} · <strong style={{ color: AZUL }}>σ</strong> {fmt(stats.desviacion, dec)} · <strong style={{ color: MAGENTA }}>rango</strong> {fmt(stats.rango, dec)} · banda x̄ ± σ = [<strong>{fmt(stats.media - stats.desviacion, dec)}</strong>, <strong>{fmt(stats.media + stats.desviacion, dec)}</strong>]
                  </>
                ) : modo === "graficas" ? (
                  <>
                    <strong style={{ color: accent }}>Histograma</strong> — {stats.n} datos agrupados en clases; el rango va de <strong>{fmt(stats.min, dec)}</strong> a <strong>{fmt(stats.max, dec)}</strong>. La barra más alta marca la clase con más datos.
                  </>
                ) : (
                  <>
                    <strong style={{ color: ORO }}>media x̄</strong> {fmt(stats.media, dec)} · <strong style={{ color: VERDE }}>mediana</strong> {fmt(stats.mediana, dec)} · <strong style={{ color: MAGENTA }}>moda</strong> {modaTxt}
                  </>
                )}
              </div>
            </div>

            {/* Botón flotante de Teoría */}
            <button className="es-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>
          </div>

          {/* Controles: modo + visibilidad de medidas */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: accent }} />
              ¿Qué quieres explorar?
            </Eyebrow>
            <div className="est-modgrid">
              {VARIANTES.map((v) => (
                <button
                  key={v.id}
                  className="est-modbtn"
                  data-on={modo === v.id}
                  onClick={() => elegirModo(v.id)}
                  style={{ ["--est" as string]: accent }}
                >
                  <i className={`fa-solid ${v.icon}`} style={{ fontSize: 17, color: modo === v.id ? accent : T.text3 }} />
                  <span style={{ fontSize: 12, fontWeight: 800, color: modo === v.id ? accent : T.text }}>{v.nombre}</span>
                </button>
              ))}
            </div>
            <div style={{ fontSize: 12, color: T.text3, lineHeight: 1.5, marginTop: 10 }}>{modoActual.desc}</div>

            {/* Toggles de medidas — solo afectan el modo tendencia */}
            <div style={{ marginTop: 16, opacity: modo === "tendencia" ? 1 : 0.4, pointerEvents: modo === "tendencia" ? "auto" : "none" }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: T.text3, marginBottom: 9, letterSpacing: "0.04em" }}>
                MEDIDAS VISIBLES EN LA ESCENA (modo tendencia central)
              </div>
              <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                <button className="est-chip" data-on={verMedia} onClick={() => setVerMedia((v) => !v)} style={{ background: verMedia ? ORO : T.inset, borderColor: verMedia ? ORO : T.line }}>
                  <i className={`fa-solid ${verMedia ? "fa-eye" : "fa-eye-slash"}`} /> Media (fulcro)
                </button>
                <button className="est-chip" data-on={verMediana} onClick={() => setVerMediana((v) => !v)} style={{ background: verMediana ? VERDE : T.inset, borderColor: verMediana ? VERDE : T.line }}>
                  <i className={`fa-solid ${verMediana ? "fa-eye" : "fa-eye-slash"}`} /> Mediana (corte)
                </button>
                <button className="est-chip" data-on={verModa} onClick={() => setVerModa((v) => !v)} style={{ background: verModa ? MAGENTA : T.inset, borderColor: verModa ? MAGENTA : T.line }}>
                  <i className={`fa-solid ${verModa ? "fa-eye" : "fa-eye-slash"}`} /> Moda (columnas)
                </button>
              </div>
            </div>
          </div>

          {/* Resultado en vivo */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-magnifying-glass-chart" style={{ marginRight: 8, color: accent }} />
              {conjunto.nombre} — n = {stats.n}
            </Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 12 }}>
              <Readout label="Media x̄" value={fmt(stats.media, dec)} col={ORO} size={15} />
              <Readout label="Mediana" value={fmt(stats.mediana, dec)} col={VERDE} size={15} />
              <Readout label="Moda" value={modaTxt} col={MAGENTA} size={15} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 12 }}>
              <Readout label="Rango" value={fmt(stats.rango, dec)} col={AZUL} size={14} />
              <Readout label="Varianza σ²" value={fmt(stats.varianza, dec)} col={AZUL} size={14} />
              <Readout label="Desviación σ" value={fmt(stats.desviacion, dec)} col={AZUL} size={14} />
              <Readout label="CV" value={`${fmt(stats.cv, 1)} %`} col={AZUL} size={14} />
            </div>

            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
              {modo === "dispersion" ? (
                <>
                  El <strong style={{ color: AZUL }}>rango</strong> ({fmt(stats.rango, dec)}) es máx − mín; la <strong style={{ color: AZUL }}>varianza σ²</strong> ({fmt(stats.varianza, dec)}) es el promedio de los cuadrados de las distancias a la media; la <strong style={{ color: AZUL }}>desviación σ</strong> ({fmt(stats.desviacion, dec)}) está en las mismas unidades que los datos. El coeficiente de variación CV = σ/x̄ permite comparar dispersiones de conjuntos distintos.
                </>
              ) : modo === "graficas" ? (
                <>
                  Al agrupar los {stats.n} datos en intervalos (clases) nace el <strong style={{ color: accent }}>histograma</strong>: cada barra cuenta cuántos datos caen en su intervalo. La forma del histograma revela de un vistazo dónde se concentran los datos y si la distribución es simétrica o sesgada.
                </>
              ) : (
                <>
                  La <strong style={{ color: ORO }}>media</strong> ({fmt(stats.media, dec)}) es el punto de equilibrio; un valor atípico la jala. La <strong style={{ color: VERDE }}>mediana</strong> ({fmt(stats.mediana, dec)}) parte los datos ordenados en dos mitades y resiste a los extremos. La <strong style={{ color: MAGENTA }}>moda</strong> ({modaTxt}) es el valor más frecuente.
                </>
              )}
            </div>

            {/* Bloque del contexto real */}
            <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 12, background: `rgba(${color.rgba},0.08)`, border: `1px solid rgba(${color.rgba},0.28)` }}>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: T.text, marginBottom: 7 }}>
                <i className="fa-solid fa-location-dot" style={{ marginRight: 7, color: accent }} />
                {conjunto.nombre}
              </div>
              <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>{conjunto.contexto}</div>
            </div>
          </div>

          {/* Catálogo de conjuntos */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-database" style={{ marginRight: 8, color: accent }} />
              Elige un conjunto de datos
            </Eyebrow>
            <div className="est-catgrid">
              {CONJUNTOS.map((c) => (
                <button
                  key={c.id}
                  className="est-catbtn"
                  data-on={conjuntoId === c.id}
                  onClick={() => elegirConjunto(c.id)}
                  style={{ ["--est" as string]: accent }}
                >
                  <span style={{ fontSize: 13.5, fontWeight: 900, color: conjuntoId === c.id ? accent : T.text }}>{c.nombre}</span>
                  <span style={{ fontSize: 11, color: T.text3, fontFamily: "ui-monospace, monospace" }}>n = {c.valores.length} · {c.unidad}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          <Eyebrow>Qué es la estadística descriptiva</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            La <strong style={{ color: T.text }}>estadística descriptiva</strong> resume un conjunto de datos en pocos números: las <strong style={{ color: accent }}>medidas de tendencia central</strong> (dónde está el centro) y las <strong style={{ color: AZUL }}>medidas de dispersión</strong> (qué tan esparcidos están). Elegir la medida correcta evita conclusiones engañosas.
          </div>

          <div className="est-divider" />

          <Eyebrow>Las ideas a leer</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Parte col={ORO} icon="fa-scale-balanced" titulo="Media — punto de equilibrio">
              x̄ = Σx / n. Es el promedio; un solo valor atípico la jala hacia el extremo y deja de representar al grupo típico.
            </Parte>
            <Parte col={VERDE} icon="fa-scissors" titulo="Mediana — corte central">
              El valor central de los datos ordenados. Deja la mitad a cada lado y es resistente a los valores extremos.
            </Parte>
            <Parte col={MAGENTA} icon="fa-ranking-star" titulo="Moda — el más frecuente">
              El valor que más se repite. Única medida útil para variables cualitativas; un conjunto puede ser amodal o multimodal.
            </Parte>
            <Parte col={AZUL} icon="fa-arrows-left-right-to-line" titulo="Dispersión — rango, σ²,  σ">
              El rango es máx − mín; la varianza σ² = Σ(x − x̄)²/n promedia las distancias al cuadrado; σ = √σ² está en las unidades de los datos.
            </Parte>
          </div>

          <div className="est-divider" />

          <Eyebrow>Media vs mediana en México</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            El ejemplo más claro es el <strong style={{ color: T.text }}>salario</strong>. El ingreso laboral <strong style={{ color: ORO }}>promedio</strong> (media) se eleva por los sueldos extremadamente altos del decil 10. El <strong style={{ color: VERDE }}>salario mediano</strong> —donde la mitad gana más y la mitad menos— es menor y refleja mejor a la mayoría. Los datos de la <strong>ENOE</strong> (INEGI) muestran esa brecha.
          </div>

          <div className="est-divider" />

          <Eyebrow>En la vida real (México)</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            El <strong>promedio escolar</strong> mexicano pondera las calificaciones por créditos; el <strong>INPC</strong> del INEGI es una media ponderada de precios; el <strong>ingreso mediano</strong> de los hogares (ENIGH) describe mejor que el promedio la situación típica. Saber qué medida usar es leer bien los datos.
          </div>
        </div>
      </div>

      {/* ── Objetivos + pista ──────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="est-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
            Objetivos
          </Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
            {objetivos.map((o, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: logrosLab[i] ? OK : T.text2 }}>
                <i className={`fa-solid ${logrosLab[i] ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 15, opacity: logrosLab[i] ? 1 : 0.3 }} />
                <span style={{ fontWeight: logrosLab[i] ? 700 : 500 }}>{o.txt}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderRadius: 18, padding: "18px 20px", border: `1px solid rgba(${color.rgba},0.3)`, background: `rgba(${color.rgba},0.08)`, fontSize: 13.5, color: T.text2, lineHeight: 1.55, display: "flex", gap: 13 }}>
          <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 17, marginTop: 1 }} />
          <span>
            Para el reto A2 carga el conjunto recomendado y compara: en <strong style={{ color: ORO }}>Salarios</strong> la media (12 666.67) y la mediana (8 500) difieren mucho por el atípico de 45 000; en <strong style={{ color: VERDE }}>Grupo A</strong> la σ vale 10; en <strong style={{ color: accent }}>Examen 20</strong> la ojiva del último intervalo llega al 100 %.
          </span>
        </div>
      </div>

      {/* ── Ideas + glosario ────────────────────────────────────────── */}
      <div style={{ ...card, padding: "20px 22px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-flask-vial" style={{ marginRight: 8, color: accent }} />
          Ideas clave
        </Eyebrow>
        <ul style={{ margin: "4px 0 4px", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
          {IDEAS.map((idea, i) => (
            <li key={i} style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>{idea}</li>
          ))}
        </ul>

        <div style={{ marginTop: 12, padding: "11px 14px", borderRadius: 11, background: `rgba(${color.rgba},0.08)`, border: `1px solid rgba(${color.rgba},0.28)`, fontSize: 12.5, color: T.text, lineHeight: 1.5 }}>
          <strong style={{ color: accent }}>Contexto. </strong>{CONTEXTO}
        </div>

        <div className="est-divider" />

        <Eyebrow>Glosario</Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {GLOSARIO.map((g) => (
            <div key={g.termino} style={{ padding: "10px 12px", borderRadius: 11, background: T.inset, border: `1px solid ${T.line}` }}>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: T.text, marginBottom: 3 }}>{g.termino}</div>
              <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>{g.definicion}</div>
              <div style={{ fontSize: 11, color: T.text3, lineHeight: 1.4, marginTop: 4 }}><i className="fa-solid fa-angle-right" style={{ marginRight: 5, color: accent }} />{g.ejemplo}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Reto evaluable: el ejercicio verbatim del ancla A2 ────────── */}
      <RetoNumericoCard
        reto={retoActual.reto}
        accent={accent}
        aprobado={ejercicioAprobado}
        onAprobado={() => setEjercicioAprobado(true)}
        playSfx={() => {
          if (sonido) audioRef.current?.correcto();
        }}
      />

      {/* ── Cajón de teoría ──────────────────────────────────────────── */}
      <div className="es-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="es-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="es-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="es-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="es-drawer-body">
          <FichaTeorica data={ESTADISTICA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}

/* ── Tarjeta de "parte" en el panel lateral ──────────────────────────── */
function Parte({ col, icon, titulo, children }: { col: string; icon: string; titulo: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
      <div style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: col, background: `${col}1f` }}>
        <i className={`fa-solid ${icon}`} />
      </div>
      <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5 }}>
        <strong style={{ color: T.text, display: "block", marginBottom: 2 }}>{titulo}</strong>
        {children}
      </div>
    </div>
  );
}

/* ── Wrappers por slug (la firma del registry es PracticaLabProps) ────── */
const RETO_KEY = "cen-datos-graficas-estadisticas-reto";

export function LabTendenciaCentral(props: PracticaLabProps) {
  return <LabEstadistica {...props} varianteInicial="tendencia" />;
}
export function LabDispersion(props: PracticaLabProps) {
  return <LabEstadistica {...props} varianteInicial="dispersion" />;
}
export function LabHistograma(props: PracticaLabProps) {
  return <LabEstadistica {...props} varianteInicial="graficas" />;
}
