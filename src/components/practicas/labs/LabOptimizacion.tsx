"use client";

/**
 * Laboratorio 3D — "Optimización con la derivada: la lata de mínimo material".
 * Práctica experimental para PM-V-P07-A2 (ejercicio_matematico "Resolviendo
 * problemas de optimización en contextos reales"; progresión 7, UAC PM-V
 * Cálculo Diferencial).
 *
 * El alumno mueve el radio r de una lata cilíndrica SIN tapa de volumen fijo
 * V = 1000 cm³; la altura h se recalcula sola por la restricción. A la vez ve la
 * curva del material A(r) = πr² + 2000/r y cómo se reparte entre base (πr², crece)
 * y lateral (2000/r, baja). El mínimo está donde A'(r) = 0 (tangente horizontal):
 * r = h ≈ 6.83 cm, A ≈ 439.3 cm². Todos los valores son de cálculo cerrado.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { EppGate, type EppItem } from "./_epp-gate";
import { FichaTeorica } from "./_ficha";
import { OPTIMIZACION_FICHA } from "./optimizacion-cilindro-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { RETO_A2 } from "./optimizacion-cilindro-data";
import { LabSfx } from "./lab-audio";
import {
  R_OPT, A_OPT, R_MIN, R_MAX,
  hDeR, areaBase, areaLateral, areaTotal, dArea,
  PASOS, IDEAS, DATOS, fmt0, fmt1, fmt2, fmt3,
} from "./optimizacion-data";

const OptimizacionScene = dynamic(() => import("./OptimizacionScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-wine-bottle fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Construyendo la lata…</span>
    </div>
  ),
});

const TOTAL_COL = "#2DD4BF";  // material total A(r)
const BASE_COL = "#fbbf24";   // base πr²
const LAT_COL = "#C084FC";    // lateral 2000/r
const OPT_COL = "#34D399";    // óptimo / tangente horizontal
const R_COL = "#7dd3fc";      // sonda r
const WARN = "#FF8A3C";

import { useEstrellas } from "@/lib/hooks/useEstrellas";
const RETO_KEY = "cen-cilindro-reto";

/** Instrumentos de diseño/medición de un envase (3 correctos + 3 distractores). */
const INSTRUMENTOS: EppItem[] = [
  { key: "vernier", nombre: "Calibrador Vernier", icono: "fa-ruler-combined", ok: true, nota: "Mide con precisión el radio r de la lata (décimas de mm)." },
  { key: "flexometro", nombre: "Flexómetro", icono: "fa-ruler-vertical", ok: true, nota: "Mide la altura h del envase sobre la mesa." },
  { key: "calculadora", nombre: "Calculadora científica", icono: "fa-calculator", ok: true, nota: "Evalúa A(r) = πr² + 2000/r y su derivada A'(r)." },
  { key: "termometro", nombre: "Termómetro", icono: "fa-temperature-half", ok: false, nota: "Mide temperatura; no interviene en optimizar el material." },
  { key: "cronometro", nombre: "Cronómetro", icono: "fa-stopwatch", ok: false, nota: "Mide tiempo; aquí no hay movimiento que cronometrar." },
  { key: "brujula", nombre: "Brújula", icono: "fa-compass", ok: false, nota: "Da orientación; no mide ni radio ni altura ni material." },
];

export function LabOptimizacion({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [rPos, setRPos] = useState<number>(R_MIN + 1); // arranca alto-delgado
  const [showDecomp, setShowDecomp] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // pilares de robustecimiento: equiparse, arrastrar, predecir/calcular
  const [eppListo, setEppListo] = useState(false);
  const [arrastro, setArrastro] = useState(false);
  // Misión central: ver la lata delgada y la ancha (ambas gastan más que la óptima).
  const [vioDelgada, setVioDelgada] = useState(false);
  const [vioAncha, setVioAncha] = useState(false);
  const [predicho, setPredicho] = useState(false);
  const { mejorEstrellas, registraEstrellas: guardaEstrellas } = useEstrellas(RETO_KEY);

  // reto evaluable y sonido
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);

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

  // Animación: la sonda r barre el rango de ida y vuelta.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = 0;
    let dir = 1;
    const tick = (ts: number) => {
      if (last === 0) last = ts;
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      const span = R_MAX - R_MIN;
      setRPos((prev) => {
        let next = prev + dir * dt * span * 0.22;
        if (next <= R_MIN) { next = R_MIN; dir = 1; }
        else if (next >= R_MAX) { next = R_MAX; dir = -1; }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const bump = () => setResetNonce((n) => n + 1);
  const reset = () => {
    setPlaying(false);
    setRPos(R_MIN + 1);
    setShowDecomp(true);
    bump();
  };

  // arrastre de la sonda r sobre el plano de costo (pilar ARRASTRAR)
  const onArrastraR = useCallback((r: number) => {
    setPlaying(false);
    setArrastro(true);
    setRPos(r);
  }, []);
  const onGrabR = useCallback(() => {
    if (sonido) audioRef.current?.blip();
  }, [sonido]);
  const registraEstrellas = useCallback((estrellas: number) => {
    setPredicho(true);
    guardaEstrellas(estrellas);
  }, [guardaEstrellas]);

  // valores en vivo
  const h = hDeR(rPos);
  const aB = areaBase(rPos);
  const aL = areaLateral(rPos);
  const aT = areaTotal(rPos);
  const d1 = dArea(rPos);
  const vol = Math.PI * rPos * rPos * h; // = 1000 (verificación viva)
  const cercaOptimo = Math.abs(rPos - R_OPT) < 0.12;

  let lecturaDeriv = "A'(r) ≈ 0: la tangente es casi horizontal — estás en el óptimo, el material no baja más.";
  if (d1 < -1e-6) lecturaDeriv = `A'(${fmt2(rPos)}) = ${fmt1(d1)} < 0 → el material AÚN BAJA si agrandas r (ensancha y baja).`;
  else if (d1 > 1e-6) lecturaDeriv = `A'(${fmt2(rPos)}) = ${fmt1(d1)} > 0 → el material YA SUBE: te pasaste del óptimo.`;

  const explorado = rPos !== R_MIN + 1;
  if (rPos <= R_MIN + 0.8 && !vioDelgada) setVioDelgada(true);
  if (rPos >= R_MAX - 0.8 && !vioAncha) setVioAncha(true);

  const objetivos = [
    { txt: "Equípate con los instrumentos de medición correctos", done: eppListo },
    { txt: "Compara la lata delgada y la ancha: las dos gastan más material que la del óptimo", done: vioDelgada && vioAncha },
    { txt: "Arrastra la sonda del radio r sobre el plano de costo", done: arrastro },
    { txt: "Mueve r y observa cómo cambia el material A(r)", done: explorado },
    { txt: "Identifica el mínimo donde A'(r) = 0 (tangente horizontal)", done: cercaOptimo },
    { txt: "Predice el material A(r) en un instante y gana estrellas", done: predicho },
    { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-wine-bottle" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>A(r) = πr² + 2000/r</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la idea sigue: con V = 1000 cm³ fijo, A&apos;(r) = 0 da r³ = 1000/π, así que r = h ≈ 6.83 cm y el material mínimo es A ≈ 439.3 cm².
      </div>
    </div>
  );

  // modo = qué lata se está viendo
  const forma = cercaOptimo ? "optimo" : Math.abs(rPos - R_MIN) < 0.3 ? "delgada" : Math.abs(rPos - R_MAX) < 0.3 ? "ancha" : "libre";
  const lecturaCorta = cercaOptimo
    ? <>Óptimo: r = h ≈ {fmt2(R_OPT)} cm, A ≈ {fmt1(A_OPT)} cm²</>
    : <>r = {fmt2(rPos)} → h = {fmt2(h)} cm, A = {fmt1(aT)} cm²</>;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <>
          <SceneBoundary fallback={sceneFallback}>
            <OptimizacionScene
              rPos={rPos} showDecomp={showDecomp} accent={accent} resetNonce={resetNonce}
              arrastrable={eppListo}
              onScrubR={onArrastraR}
              onGrab={onGrabR}
            />
          </SceneBoundary>
          {/* Compuerta de equipamiento (pilar EQUIPARSE) */}
          {!eppListo && (
            <EppGate
              accent={accent}
              rgba={color.rgba}
              items={INSTRUMENTOS}
              titulo="Antes de diseñar: equípate"
              subtitulo="Elige tus instrumentos de medición"
              intro="Vas a optimizar el material de una lata sin tapa de 1000 cm³. Para medir el envase y evaluar A(r) necesitas los instrumentos correctos. Selecciona los 3 instrumentos de medición (no los distractores) para entrar al laboratorio."
              verbo="instrumentos de medición"
              onEntrar={() => { setEppListo(true); if (sonido) audioRef.current?.blip(); }}
            />
          )}
        </>
      }
      modos={{
        opciones: [
          { id: "delgada", etiqueta: "Delgada", icono: "fa-arrow-up-long" },
          { id: "optimo", etiqueta: "Óptimo", icono: "fa-trophy" },
          { id: "ancha", etiqueta: "Ancha", icono: "fa-arrows-left-right" },
          { id: "libre", etiqueta: "Libre", icono: "fa-hand-pointer" },
        ],
        valor: forma,
        cambiar: (id) => {
          setPlaying(false);
          if (id === "delgada") setRPos(R_MIN);
          else if (id === "optimo") setRPos(R_OPT);
          else if (id === "ancha") setRPos(R_MAX);
          bump();
          if (sonido) audioRef.current?.blip();
        },
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono={playing ? "fa-pause" : "fa-play"} titulo={playing ? "Pausar" : "Barrer el radio (r)"} activo={playing} onClick={() => setPlaying((p) => !p)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reset} />
        </>
      }
      leyenda={
        <>
          <LegItem col={TOTAL_COL} txt="material A(r)" />
          {showDecomp && <LegItem col={BASE_COL} txt="base  πr²" dashed />}
          {showDecomp && <LegItem col={LAT_COL} txt="lateral  2000/r" dashed />}
          <LegItem col={OPT_COL} txt="mínimo (A' = 0)" />
          <MedidorMaterial aB={aB} aL={aL} aT={aT} />
        </>
      }
      lectura={lecturaCorta}
      objetivos={objetivos}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <Bloque titulo="Mueve el radio r (h se ajusta sola)" icono="fa-crosshairs">
                <Deslizador
                  label="radio  r (cm)"
                  icon="fa-arrows-left-right-to-line"
                  colr={R_COL}
                  valor={`${fmt2(rPos)} cm`}
                  min={R_MIN} max={R_MAX} step={0.02} value={rPos}
                  onChange={(v) => { setPlaying(false); setRPos(v); }}
                  hintL={`${fmt0(R_MIN)} cm`} hintR={`${fmt0(R_MAX)} cm`}
                />
                <button
                  type="button"
                  onClick={() => setShowDecomp((s) => !s)}
                  style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 10, border: `1px solid ${showDecomp ? BASE_COL : "rgba(255,255,255,0.18)"}`, background: "rgba(4,10,22,0.5)", color: "#fff", fontSize: 14, fontWeight: 800 }}
                >
                  <i className={`fa-solid ${showDecomp ? "fa-eye" : "fa-eye-slash"}`} style={{ color: BASE_COL }} aria-hidden />
                  Descomponer base + lateral
                </button>
                <p style={{ margin: 0, color: T.text2 }}>
                  También puedes <strong style={{ color: "#fff" }}>arrastrar la sonda del radio r</strong> (la esfera azul sobre el eje r) en el plano de costo 3D.
                </p>
              </Bloque>
              <Bloque titulo={`El reparto del material en r = ${fmt2(rPos)} cm`} icono="fa-scale-balanced">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="base  πr²" value={`${fmt1(aB)} cm²`} col={BASE_COL} />
                  <Dato label="lateral  2000/r" value={`${fmt1(aL)} cm²`} col={LAT_COL} />
                  <Dato label="total  A(r)" value={`${fmt1(aT)} cm²`} col={TOTAL_COL} />
                  <Dato label="pendiente A'(r)" value={fmt2(d1)} col={R_COL} />
                  <Dato label="radio r" value={`${fmt2(rPos)} cm`} col={R_COL} />
                  <Dato label="altura h" value={`${fmt2(h)} cm`} col={LAT_COL} />
                  <Dato label="volumen V" value={`${fmt0(vol)} cm³`} col={OPT_COL} />
                  <Dato label="sobre el mínimo" value={`+${fmt1(Math.max(0, aT - A_OPT))} cm²`} col={cercaOptimo ? OPT_COL : WARN} />
                </div>
                <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: `1px solid ${OPT_COL}55`, background: `${OPT_COL}12` }}>
                  {lecturaDeriv} El mínimo está donde <strong style={{ color: OPT_COL }}>A&apos;(r) = 0</strong>: ahí lo que gana la base iguala lo que pierde la pared.
                </p>
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
              <PrediccionMaterialCard
                accent={accent}
                rLive={rPos}
                aLive={aT}
                dLive={d1}
                mejor={mejorEstrellas}
                onResultado={registraEstrellas}
                playSfx={
                  sonido
                    ? (ok) => { if (ok) audioRef.current?.correcto(); else audioRef.current?.incorrecto(); }
                    : undefined
                }
              />
              <RetoNumericoCard
                reto={RETO_A2}
                accent={accent}
                aprobado={ejercicioAprobado}
                onAprobado={() => setEjercicioAprobado(true)}
                playSfx={
                  sonido
                    ? (ok) => {
                        if (ok) audioRef.current?.correcto();
                        else audioRef.current?.incorrecto();
                      }
                    : undefined
                }
              />
            </>
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="El modelo de la lata sin tapa" icono="fa-wine-bottle">
                <div style={{ display: "grid", gap: 7 }}>
                  <ExprRow col={TOTAL_COL} txt="V = π r² h = 1000  (restricción)" />
                  <ExprRow col={BASE_COL} txt="h = 1000 / (π r²)" />
                  <ExprRow col={LAT_COL} txt="A(r) = π r² + 2000 / r" />
                  <ExprRow col={R_COL} txt="A'(r) = 2π r − 2000 / r²" />
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 11px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${OPT_COL}44` }}>
                  <i className="fa-solid fa-trophy" style={{ color: OPT_COL, marginTop: 4 }} aria-hidden />
                  <div>
                    <div style={{ fontWeight: 900, color: "#fff" }}>Óptimo: r = h ≈ {fmt2(R_OPT)} cm</div>
                    <div style={{ color: T.text2, lineHeight: 1.4 }}>A&apos;(r) = 0 → r³ = 1000/π. Material mínimo A = 3πr² ≈ {fmt1(A_OPT)} cm².</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 11px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${LAT_COL}44` }}>
                  <i className="fa-solid fa-circle-info" style={{ color: LAT_COL, marginTop: 4 }} aria-hidden />
                  <div>
                    <div style={{ fontWeight: 900, color: "#fff" }}>Sin tapa → h = r</div>
                    <div style={{ color: T.text2, lineHeight: 1.4 }}>En un cilindro cerrado (con dos tapas) el óptimo sería h = 2r.</div>
                  </div>
                </div>
              </Bloque>
              <Bloque titulo="Optimización — paso a paso" icono="fa-list-ol">
                <div style={{ display: "grid", gap: 9 }}>
                  {PASOS.map((p) => (
                    <div key={p.etiqueta} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${accent}25` }}>
                      <div style={{ minWidth: 24, height: 24, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#04121f", background: accent, flexShrink: 0 }}>{p.etiqueta}</div>
                      <div style={{ minWidth: 0 }}>{p.texto}</div>
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Ideas clave" icono="fa-lightbulb">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {IDEAS.map((x, i) => <li key={i}>{x}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Datos" icono="fa-gauge-high">
                {DATOS.map((dd, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <i className={`fa-solid ${dd.icono}`} style={{ color: accent, marginTop: 4 }} aria-hidden />
                    <div>
                      <strong style={{ fontFamily: "ui-monospace, monospace" }}>{dd.valor}</strong>
                      <div style={{ color: T.text2 }}>{dd.texto}</div>
                    </div>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={OPTIMIZACION_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3 }}>
                Cálculo <strong>exacto</strong>: el problema (lata SIN tapa, V = 1000 cm³) es verbatim del enunciado A2, y el óptimo es <strong>simbólico cerrado</strong>: A&apos;(r) = 0 ⇒ r = (1000/π)<sup>1/3</sup> ≈ {fmt3(R_OPT)} cm, h = r y A = 3πr² ≈ {fmt1(A_OPT)} cm². En el cilindro sin tapa el óptimo cumple <strong>h = r</strong> (el cerrado da h = 2r). La lata 3D usa una escala fija para que quepa en el recuadro y se ve girando para apreciar la base abierta; las medidas en cm son las reales.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}

/* ── Medidor de material: la barra se reparte entre base y pared ─────────────── */
function MedidorMaterial({ aB, aL, aT }: { aB: number; aL: number; aT: number }) {
  const tope = Math.max(areaTotal(R_MIN), areaTotal(R_MAX)) * 1.02;
  const pB = Math.min(100, (aB / tope) * 100);
  const pL = Math.min(100 - pB, (aL / tope) * 100);
  const pMin = (A_OPT / tope) * 100;
  return (
    <div style={{ display: "grid", gap: 4, marginTop: 4, width: 176 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>
        <span>material</span><span style={{ fontFamily: "ui-monospace, monospace" }}>{fmt1(aT)} cm²</span>
      </div>
      <div style={{ position: "relative", height: 12, borderRadius: 6, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pB}%`, background: BASE_COL, transition: "width 120ms linear" }} />
        <div style={{ position: "absolute", left: `${pB}%`, top: 0, bottom: 0, width: `${pL}%`, background: LAT_COL, transition: "all 120ms linear" }} />
        <div style={{ position: "absolute", left: `${pMin}%`, top: 0, bottom: 0, width: 3, background: OPT_COL }} />
      </div>
      <div style={{ fontSize: 14, fontWeight: 800, color: Math.abs(aT - A_OPT) < 1 ? OPT_COL : WARN }}>
        {Math.abs(aT - A_OPT) < 1 ? "en el mínimo" : `+${fmt1(aT - A_OPT)} cm² sobre el mínimo`}
      </div>
    </div>
  );
}

/* ── Reto de predicción: calcula el material en un radio ──────────────────────
 * El alumno congela una lectura del radio r y PREDICE el material A(r) antes de
 * verlo. La revisión es numérica (tolerancia 5 cm²); las estrellas premian
 * acertar con pocos intentos y el récord se guarda en localStorage. Es el pilar
 * HACER CÁLCULOS. */
function PrediccionMaterialCard({
  accent, rLive, aLive, dLive, mejor, onResultado, playSfx,
}: {
  accent: string;
  rLive: number;
  aLive: number;
  dLive: number;
  mejor: number;
  onResultado: (estrellas: number) => void;
  playSfx?: (ok: boolean) => void;
}) {
  const [snap, setSnap] = useState<{ r: number; a: number; d: number } | null>(null);
  const [val, setVal] = useState("");
  const [intentos, setIntentos] = useState(0);
  const [estrellas, setEstrellas] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; cerca: boolean; txt: string } | null>(null);

  const tomarLectura = () => {
    setSnap({ r: rLive, a: aLive, d: dLive });
    setVal(""); setIntentos(0); setEstrellas(null); setMsg(null);
  };

  const comprobar = () => {
    if (!snap || estrellas != null) return;
    const num = Number(val.replace(",", "."));
    if (!Number.isFinite(num)) {
      setMsg({ ok: false, cerca: false, txt: "Escribe un número válido (en cm²)." });
      return;
    }
    const next = intentos + 1;
    const dif = Math.abs(num - snap.a);
    if (dif <= 5) {
      const est = next <= 1 ? 3 : next === 2 ? 2 : 1;
      setEstrellas(est);
      setMsg({ ok: true, cerca: false, txt: `¡Correcto! A(${fmt2(snap.r)}) = ${fmt1(snap.a)} cm².` });
      onResultado(est);
      playSfx?.(true);
    } else {
      setIntentos(next);
      const cerca = dif <= 20;
      setMsg({ ok: false, cerca, txt: cerca ? "Muy cerca. Ajusta tu cálculo y vuelve a intentar." : "Aún no. Usa A(r) = πr² + 2000/r con ese radio." });
      playSfx?.(false);
    }
  };

  return (
    <div style={{ ...card, padding: "20px 22px 22px", marginBottom: 16, borderColor: `${accent}55` }}>
      <style>{`
        .op-calc-in { width:100%; box-sizing:border-box; padding:11px 13px; border-radius:11px; border:1px solid ${T.line};
          background:rgba(4,10,22,0.5); color:#fff; font-size:15px; outline:none; transition:border-color .15s; }
        .op-calc-in:focus { border-color:${accent}; }
        .op-calc-btn { cursor:pointer; border:none; border-radius:11px; font-size:14px; font-weight:800; padding:11px 16px; transition:filter .15s; }
        .op-calc-btn:hover:not(:disabled) { filter:brightness(1.08); }
        .op-calc-btn:disabled { cursor:not-allowed; opacity:0.5; }
        .op-calc-primary { background:${accent}; color:#04121f; }
        .op-calc-ghost { background:transparent; border:1px solid ${T.line}; color:${T.text2}; }
        .op-calc-ghost:hover { border-color:${accent}; color:#fff; }
      `}</style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 6, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-calculator" style={{ marginRight: 8, color: accent }} />
          Reto: predice el material
        </Eyebrow>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", gap: 3 }}>
            {[0, 1, 2].map((i) => (
              <i key={i} className="fa-solid fa-star" style={{ fontSize: 14, color: estrellas != null && i < estrellas ? "#FFC94D" : "rgba(255,255,255,0.18)" }} />
            ))}
          </div>
          <span style={{ fontSize: 14, fontWeight: 800, color: T.text3 }}>Mejor: {mejor}★</span>
        </div>
      </div>

      <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.55, margin: "0 0 14px" }}>
        Arrastra la sonda o mueve el radio hasta un valor que te interese y <strong style={{ color: "#fff" }}>congela la lectura</strong>. Antes de mirar el marcador, calcula tú el material con <strong style={{ color: accent }}>A(r) = πr² + 2000/r</strong>.
      </p>

      {!snap ? (
        <button className="op-calc-btn op-calc-primary" onClick={tomarLectura}>
          <i className="fa-solid fa-camera" style={{ marginRight: 8 }} />
          Tomar lectura del radio
        </button>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 12, marginBottom: 14 }}>
            <div style={{ padding: "10px 13px", borderRadius: 11, background: "rgba(4,10,22,0.5)", border: `1px solid ${T.line}` }}>
              <div style={{ fontSize: 14, color: T.text3, fontWeight: 700 }}>radio</div>
              <div style={{ ...NUM, fontSize: 17, fontWeight: 900, color: "#fff" }}>r = {fmt2(snap.r)} cm</div>
            </div>
            <div style={{ padding: "10px 13px", borderRadius: 11, background: "rgba(4,10,22,0.5)", border: `1px solid ${T.line}` }}>
              <div style={{ fontSize: 14, color: T.text3, fontWeight: 700 }}>pendiente</div>
              <div style={{ ...NUM, fontSize: 17, fontWeight: 900, color: snap.d <= 0 ? OPT_COL : WARN }}>A&apos;(r) = {fmt2(snap.d)}</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "stretch", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 160px", display: "flex", alignItems: "center", gap: 8 }}>
              <input
                className="op-calc-in"
                inputMode="decimal"
                placeholder="A en cm²"
                value={val}
                disabled={estrellas != null}
                onChange={(e) => setVal(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") comprobar(); }}
                style={{ ...NUM }}
              />
              <span style={{ fontSize: 14, fontWeight: 800, color: T.text2 }}>cm²</span>
            </div>
            <button className="op-calc-btn op-calc-primary" onClick={comprobar} disabled={estrellas != null || val.trim() === ""}>
              <i className="fa-solid fa-check" style={{ marginRight: 7 }} />
              Comprobar
            </button>
            <button className="op-calc-btn op-calc-ghost" onClick={tomarLectura}>
              <i className="fa-solid fa-rotate" style={{ marginRight: 7 }} />
              Otra lectura
            </button>
          </div>

          {msg && (
            <div style={{ marginTop: 13, display: "flex", gap: 9, alignItems: "flex-start", fontSize: 14, lineHeight: 1.45, color: msg.ok ? OK : msg.cerca ? WARN : "#f87171" }}>
              <i className={`fa-solid ${msg.ok ? "fa-circle-check" : msg.cerca ? "fa-circle-half-stroke" : "fa-circle-xmark"}`} style={{ marginTop: 1 }} />
              <span>{msg.txt}{!msg.ok && intentos > 0 ? ` (intento ${intentos})` : ""}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── Fila de expresión ────────────────────────────────────────────────────── */
function ExprRow({ col, txt }: { col: string; txt: string }) {
  return (
    <div style={{ padding: "9px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${col}33` }}>
      <div style={{ fontSize: 15, fontWeight: 900, color: col, fontFamily: "ui-monospace, monospace" }}>{txt}</div>
    </div>
  );
}

/* ── Item de leyenda (visor) ──────────────────────────────────────────────── */
function LegItem({ col, txt, dashed }: { col: string; txt: string; dashed?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>
      <span style={{ width: 18, height: 0, borderTop: `${dashed ? "2px dashed" : "3px solid"} ${col}`, flexShrink: 0 }} />
      {txt}
    </div>
  );
}
