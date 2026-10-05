"use client";

/**
 * Laboratorio 3D — "Cinemática del MRUA: acelerar y frenar".
 * Práctica experimental para CNEYT-V-P02-A2 ("Práctica de verificación y ejercicio
 * científico"; progresión 2 "Describe el movimiento rectilíneo uniforme y
 * uniformemente acelerado con representaciones gráficas y algebraicas", UAC CNEYT-V
 * "La energía en procesos de vida diaria").
 *
 * El alumno ve un automóvil recorrer una autopista (problema verbatim Puebla–CDMX):
 * acelera uniformemente, alcanza su velocidad máxima y luego frena hasta detenerse.
 * Una línea de tiempo reproduce el recorrido y, en paralelo, se dibujan las TRES
 * representaciones gráficas del MRUA —posición-tiempo, velocidad-tiempo y
 * aceleración-tiempo— con una sonda sincronizada al instante actual. Puede mover la
 * aceleración, la duración y el frenado y ver cómo cambian la velocidad final y las
 * distancias. Toda la cinemática es de cálculo cerrado.
 *
 * EXPERIMENTO CENTRAL: sube la aceleración a₁ y el auto llega más rápido y más lejos;
 * sube el frenado a₂ y se detiene en menos metros. Un velocímetro y una barra de
 * distancia (panel) y la gráfica v–t trazándose lo hacen visible.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { EppGate, type EppItem } from "./_epp-gate";
import { FichaTeorica } from "./_ficha";
import { MRUA_FICHA } from "./mrua-acelerar-frenar-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { RETO_A2 } from "./mrua-acelerar-frenar-data";
import { LabSfx } from "./lab-audio";
import {
  resolver, estadoEn, resultado, muestrear,
  A1_MIN, A1_MAX, T1_MIN, T1_MAX, A2_MIN, A2_MAX,
  A1_DEF, T1_DEF, A2_DEF,
  PROBLEMA, PASOS, IDEAS, DATOS, type Punto,
  fmt0, fmt1,
} from "./cinematica-data";

const CinematicaScene = dynamic(() => import("./CinematicaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-car-side fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Trazando la autopista…</span>
    </div>
  ),
});

const C_POS = "#c084fc";   // posición x-t
const C_VEL = "#7dd3fc";   // velocidad v-t
const C_ACC = "#34D399";   // aceleración (positiva)
const C_BRK = "#f87171";   // aceleración (frenado)
const WARN = "#FF8A3C";

import { useEstrellas } from "@/lib/hooks/useEstrellas";
const RETO_KEY = "cen-mrua-reto";

/** Instrumentos de una prueba de cinemática en campo (3 correctos + 3 distractores). */
const INSTRUMENTOS: EppItem[] = [
  { key: "cronometro", nombre: "Cronómetro", icono: "fa-stopwatch", ok: true, nota: "Mide el tiempo del recorrido: la t de v = v₀ + a·t." },
  { key: "radar", nombre: "Radar de velocidad", icono: "fa-gauge-high", ok: true, nota: "Mide la velocidad instantánea v del automóvil." },
  { key: "cinta", nombre: "Cinta métrica", icono: "fa-ruler-horizontal", ok: true, nota: "Mide la distancia recorrida x sobre la autopista." },
  { key: "termometro", nombre: "Termómetro", icono: "fa-temperature-half", ok: false, nota: "Mide temperatura; no interviene en la cinemática del MRUA." },
  { key: "balanza", nombre: "Balanza", icono: "fa-scale-balanced", ok: false, nota: "Mide masa; el MRUA no la usa (la masa no cambia el movimiento aquí)." },
  { key: "brujula", nombre: "Brújula", icono: "fa-compass", ok: false, nota: "Da orientación, no tiempo, velocidad ni distancia." },
];

export function LabCinematica({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [a1, setA1] = useState<number>(A1_DEF);
  const [t1, setT1] = useState<number>(T1_DEF);
  const [a2, setA2] = useState<number>(A2_DEF);
  const [t, setT] = useState<number>(0);
  const [playing, setPlaying] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // pilares de robustecimiento: equiparse, arrastrar, predecir/calcular
  const [eppListo, setEppListo] = useState(false);
  const [arrastro, setArrastro] = useState(false);
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

  // Reproduce el recorrido en el tiempo (rAF). Al llegar al final, reinicia.
  useEffect(() => {
    if (!playing) return;
    const mov = resolver(a1, t1, a2);
    let raf = 0;
    let last = 0;
    const tick = (ts: number) => {
      if (last === 0) last = ts;
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      setT((prev) => {
        const next = prev + dt * 1.4;     // ~1.4× tiempo real
        return next >= mov.tTotal ? 0 : next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, a1, t1, a2]);

  const bump = () => setResetNonce((n) => n + 1);
  const reset = () => {
    if (sonido) audioRef.current?.blip();
    setPlaying(false);
    setA1(A1_DEF); setT1(T1_DEF); setA2(A2_DEF);
    setT(0); bump();
  };
  const scrub = (v: number) => { setPlaying(false); setT(v); };

  // arrastre del auto en la escena 3D → fija el instante de tiempo
  const onArrastraCar = useCallback((nuevoT: number) => {
    setPlaying(false);
    setArrastro(true);
    setT(nuevoT);
  }, []);
  const onGrabCar = useCallback(() => {
    if (sonido) audioRef.current?.blip();
  }, [sonido]);
  const registraEstrellas = useCallback((estrellas: number) => {
    setPredicho(true);
    guardaEstrellas(estrellas);
  }, [guardaEstrellas]);

  const mov = resolver(a1, t1, a2);
  const tCur = Math.min(t, mov.tTotal);
  const est = estadoEn(mov, tCur);
  const res = resultado(mov);
  const pts = muestrear(mov, 140);

  const fase = est.fase === 1 ? "acelerando" : est.fase === 2 ? "frenando" : "detenido";
  const faseCol = est.fase === 2 ? C_BRK : est.fase === 1 ? C_ACC : "#9fb4cc";
  const verbatim = a1 === A1_DEF && t1 === T1_DEF && a2 === A2_DEF;

  const objetivos = [
    { txt: "Equípate con los instrumentos de medición correctos", done: eppListo },
    { txt: "Arrastra el auto sobre la autopista en la escena 3D", done: arrastro },
    { txt: "Reproduce el recorrido y observa las gráficas (x-t, v-t, a-t)", done: playing || t > 0 },
    { txt: "Sube la aceleración a₁ y mira cómo crece la rapidez máxima del auto", done: a1 > A1_DEF },
    { txt: "Sube el frenado a₂ y comprueba que el auto se detiene en menos metros", done: a2 > A2_DEF },
    { txt: "Explora las variables con los deslizadores (a₁, t₁, a₂)", done: !verbatim },
    { txt: "Predice la velocidad v en un instante y gana estrellas", done: predicho },
    { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-car-side" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>x = v₀t + ½at²</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero las gráficas y los números siguen aquí. En t = {fmt1(tCur)} s el auto va a {fmt1(est.v)} m/s y ha recorrido {fmt0(est.x)} m.
      </div>
    </div>
  );

  const lectura = <>t = {fmt1(est.t)} s · {fase} · v = {fmt1(est.v)} m/s</>;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <CinematicaScene
            a1={a1} t1={t1} a2={a2} t={tCur} accent={accent} resetNonce={resetNonce}
            arrastrable={eppListo}
            onScrub={onArrastraCar}
            onGrab={onGrabCar}
          />
        </SceneBoundary>
      }
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono={playing ? "fa-pause" : "fa-play"} titulo={playing ? "Pausar" : "Reproducir el recorrido"} activo={playing} onClick={() => setPlaying((p) => !p)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar al problema" onClick={reset} />
        </>
      }
      leyenda={
        <>
          <LegItem col={C_VEL} txt="velocidad  v" />
          <LegItem col={C_ACC} txt="aceleración  (+)" />
          <LegItem col={C_BRK} txt="frenado  (−)" />
        </>
      }
      lectura={lectura}
      objetivos={objetivos}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: !eppListo ? (
            <div style={{ position: "relative", minHeight: 560 }}>
              <EppGate
                accent={accent}
                rgba={color.rgba}
                items={INSTRUMENTOS}
                titulo="Antes de medir: equípate"
                subtitulo="Elige tus instrumentos de medición"
                intro="Vas a hacer una prueba de cinemática en campo sobre la autopista. Selecciona los 3 instrumentos de medición (no los distractores) para entrar al laboratorio."
                verbo="instrumentos de medición"
                onEntrar={() => { setEppListo(true); if (sonido) audioRef.current?.blip(); }}
              />
            </div>
          ) : (
            <>
              <Bloque titulo="El recorrido" icono="fa-clock">
                <Deslizador label="línea de tiempo t" icon="fa-clock" colr={accent} valor={`${fmt1(tCur)} / ${fmt1(mov.tTotal)} s`}
                  min={0} max={mov.tTotal} step={0.05} value={tCur} onChange={scrub}
                  hintL="0 s · salida" hintR={`${fmt1(mov.tTotal)} s · alto`} />
                <p style={{ margin: 0, color: T.text2 }}>
                  También puedes <strong style={{ color: "#fff" }}>arrastrar el auto</strong> en la escena: el tiempo sigue su posición.
                </p>
              </Bloque>

              <Bloque titulo="Variables del MRUA" icono="fa-sliders">
                <Deslizador label="aceleración a₁" icon="fa-gauge-high" colr={C_ACC} valor={`${fmt1(a1)} m/s²`}
                  min={A1_MIN} max={A1_MAX} step={0.1} value={a1}
                  onChange={(v) => setA1(v)} hintL={`${fmt0(A1_MIN)}`} hintR={`${fmt0(A1_MAX)}`} />
                <Deslizador label="tiempo acelerando t₁" icon="fa-stopwatch" colr={accent} valor={`${fmt1(t1)} s`}
                  min={T1_MIN} max={T1_MAX} step={0.5} value={t1}
                  onChange={(v) => setT1(v)} hintL={`${fmt0(T1_MIN)}`} hintR={`${fmt0(T1_MAX)}`} />
                <Deslizador label="frenado a₂" icon="fa-car-burst" colr={C_BRK} valor={`−${fmt1(a2)} m/s²`}
                  min={A2_MIN} max={A2_MAX} step={0.1} value={a2}
                  onChange={(v) => setA2(v)} hintL={`${fmt0(A2_MIN)}`} hintR={`${fmt0(A2_MAX)}`} />
                {!verbatim && (
                  <button type="button" onClick={reset} style={{ cursor: "pointer", fontSize: 14, fontWeight: 800, color: accent, background: `rgba(${color.rgba},0.14)`, border: `1px solid ${accent}55`, borderRadius: 10, padding: "9px 12px" }}>
                    <i className="fa-solid fa-rotate-left" style={{ marginRight: 8 }} aria-hidden />Volver al problema
                  </button>
                )}
              </Bloque>

              <Bloque titulo="Velocímetro y odómetro" icono="fa-gauge-high">
                <Barra txt="velocidad v" val={est.v} max={Math.max(mov.v1, 1)} col={C_VEL} fmtv={`${fmt1(est.v)} m/s · ${fmt0(est.v * 3.6)} km/h`} />
                <Barra txt="distancia x" val={est.x} max={Math.max(mov.xTotal, 1)} col={C_POS} fmtv={`${fmt0(est.x)} de ${fmt0(mov.xTotal)} m`} />
                <p style={{ margin: 0, color: T.text2 }}>
                  Con estos valores llega a <strong style={{ color: C_VEL }}>{fmt0(res.vFin)} m/s ({fmt0(res.vKmh)} km/h)</strong> y frena en <strong style={{ color: C_BRK }}>{fmt0(res.dFreno)} m</strong>.
                </p>
              </Bloque>

              <Bloque titulo="Lecturas" icono="fa-list">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="tiempo t" value={`${fmt1(est.t)} s`} col={accent} />
                  <Dato label="posición x" value={`${fmt0(est.x)} m`} col={C_POS} />
                  <Dato label="velocidad v" value={`${fmt1(est.v)} m/s`} col={C_VEL} />
                  <Dato label="aceleración a" value={`${fmt1(est.a)} m/s²`} col={faseCol} />
                </div>
              </Bloque>
            </>
          ),
        },
        {
          id: "graficas",
          etiqueta: "Gráficas",
          icono: "fa-chart-line",
          contenido: (
            <>
              <Bloque titulo="Las tres gráficas del movimiento" icono="fa-chart-line">
                <Grafica pts={pts} acc={(p) => p.x} tTotal={mov.tTotal} t1={mov.t1} tCur={tCur} valCur={est.x}
                  color={C_POS} titulo="posición  x – t" unidad="m" yMin={0} yMax={mov.xTotal} fill curva />
                <Grafica pts={pts} acc={(p) => p.v} tTotal={mov.tTotal} t1={mov.t1} tCur={tCur} valCur={est.v}
                  color={C_VEL} titulo="velocidad  v – t" unidad="m/s" yMin={0} yMax={mov.v1} fill />
                <Grafica pts={pts} acc={(p) => p.a} tTotal={mov.tTotal} t1={mov.t1} tCur={tCur} valCur={est.a}
                  color={est.a >= 0 ? C_ACC : C_BRK} titulo="aceleración  a – t" unidad="m/s²" yMin={-a2} yMax={a1} escalonada />
                <p style={{ margin: 0, color: T.text2 }}>
                  La <strong style={{ color: C_VEL }}>pendiente</strong> de la recta v–t es la aceleración; el <strong style={{ color: C_VEL }}>área</strong> bajo ella es la distancia (área sombreada = {fmt0(mov.xTotal)} m). La x–t es una parábola que sube y luego se aplana al detenerse.
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
              <style>{`
                .cn-calc-in { width:100%; box-sizing:border-box; padding:11px 13px; border-radius:11px; border:1px solid ${T.line};
                  background:rgba(4,10,22,0.5); color:#fff; font-size:15px; outline:none; transition:border-color .15s; }
                .cn-calc-in:focus { border-color:${accent}; }
                .cn-calc-btn { cursor:pointer; border:none; border-radius:11px; font-size:14px; font-weight:800; padding:11px 16px; transition:filter .15s; }
                .cn-calc-btn:hover:not(:disabled) { filter:brightness(1.08); }
                .cn-calc-btn:disabled { cursor:not-allowed; opacity:0.5; }
                .cn-calc-primary { background:${accent}; color:#04121f; }
                .cn-calc-ghost { background:transparent; border:1px solid ${T.line}; color:${T.text2}; }
                .cn-calc-ghost:hover { border-color:${accent}; color:#fff; }
              `}</style>
              <PrediccionVelocidadCard
                accent={accent}
                tLive={tCur}
                vLive={est.v}
                aLive={est.a}
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
              <Bloque titulo="El problema" icono="fa-road">
                <p style={{ margin: 0, color: T.text2 }}>{PROBLEMA}</p>
              </Bloque>
              <Bloque titulo="Respuestas" icono="fa-square-check">
                <Respuesta etq="a" col={C_VEL} txt={`v = ${fmt0(res.vFin)} m/s ≈ ${fmt0(res.vKmh)} km/h`} sub="velocidad al final de la aceleración" />
                <Respuesta etq="b" col={C_POS} txt={`d₁ = ${fmt0(res.dAccel)} m`} sub="distancia durante la aceleración" />
                <Respuesta etq="c" col={C_BRK} txt={`t = ${fmt1(res.tFreno)} s · d₂ = ${fmt0(res.dFreno)} m`} sub="tiempo y distancia de frenado" />
                <Respuesta etq="Σ" col={accent} txt={`d_total = ${fmt0(res.dTotal)} m`} sub="distancia total del recorrido" />
              </Bloque>
              <Bloque titulo="Procedimiento con las ecuaciones del MRUA" icono="fa-list-ol">
                {PASOS.map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${accent}25` }}>
                    <div style={{ minWidth: 24, height: 24, padding: "0 4px", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: "#04121f", background: accent, flexShrink: 0 }}>{p.etiqueta}</div>
                    <div style={{ color: "#fff", minWidth: 0 }}>{p.texto}</div>
                  </div>
                ))}
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
                <FichaTeorica data={MRUA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3 }}>
                Cinemática exacta de cálculo cerrado (MRUA): v = v₀ + a·t, x = v₀·t + ½·a·t², v² = v₀² + 2·a·x, con v₀ = 0. Se desprecian la resistencia del aire y el tiempo de reacción del conductor; el frenado es a aceleración constante. La carretera 3D se reescala a la distancia total para verse completa. Valores y procedimiento son verbatim del enunciado A2.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}

/* ── Barra del medidor ───────────────────────────────────────────────────── */
function Barra({ txt, val, max, col, fmtv }: { txt: string; val: number; max: number; col: string; fmtv: string }) {
  return (
    <div style={{ display: "grid", gap: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>
        <span>{txt}</span><span style={{ fontFamily: "ui-monospace, monospace" }}>{fmtv}</span>
      </div>
      <div style={{ height: 12, borderRadius: 6, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
        <div style={{ width: `${Math.min(100, Math.max(0, (val / max) * 100))}%`, height: "100%", background: col, transition: "width 120ms linear" }} />
      </div>
    </div>
  );
}

/* ── Reto de predicción: calcula la velocidad en un instante ──────────────────
 * El alumno congela una lectura del recorrido (instante t y aceleración a) y
 * PREDICE la velocidad antes de verla. La revisión es numérica (tolerancia
 * 0.5 m/s); las estrellas premian acertar con pocos intentos y el récord se
 * guarda en localStorage. Es el pilar HACER CÁLCULOS. */
function PrediccionVelocidadCard({
  accent, tLive, vLive, aLive, mejor, onResultado, playSfx,
}: {
  accent: string;
  tLive: number;
  vLive: number;
  aLive: number;
  mejor: number;
  onResultado: (estrellas: number) => void;
  playSfx?: (ok: boolean) => void;
}) {
  const [snap, setSnap] = useState<{ t: number; v: number; a: number } | null>(null);
  const [val, setVal] = useState("");
  const [intentos, setIntentos] = useState(0);
  const [estrellas, setEstrellas] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; cerca: boolean; txt: string } | null>(null);

  const tomarLectura = () => {
    setSnap({ t: tLive, v: vLive, a: aLive });
    setVal(""); setIntentos(0); setEstrellas(null); setMsg(null);
  };

  const comprobar = () => {
    if (!snap || estrellas != null) return;
    const num = Number(val.replace(",", "."));
    if (!Number.isFinite(num)) {
      setMsg({ ok: false, cerca: false, txt: "Escribe un número válido (en m/s)." });
      return;
    }
    const next = intentos + 1;
    const dif = Math.abs(num - snap.v);
    if (dif <= 0.5) {
      const est = next <= 1 ? 3 : next === 2 ? 2 : 1;
      setEstrellas(est);
      setMsg({ ok: true, cerca: false, txt: `¡Correcto! v = ${fmt1(snap.v)} m/s en t = ${fmt1(snap.t)} s.` });
      onResultado(est);
      playSfx?.(true);
    } else {
      setIntentos(next);
      const cerca = dif <= 2;
      setMsg({ ok: false, cerca, txt: cerca ? "Muy cerca. Ajusta tu cálculo y vuelve a intentar." : "Aún no. Usa v = v₀ + a·t para ese instante." });
      playSfx?.(false);
    }
  };

  return (
    <div style={{ ...card, padding: "20px 22px 22px", marginBottom: 18, borderColor: `${accent}55` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 6, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-gauge" style={{ marginRight: 8, color: accent }} />
          Reto: predice la velocidad
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
        Mueve el auto o la línea de tiempo hasta un instante que te interese y <strong style={{ color: "#fff" }}>congela la lectura</strong>. Antes de mirar el marcador, calcula tú la velocidad con <strong style={{ color: accent }}>v = v₀ + a·t</strong> (o v = v₁ − a₂·τ si va frenando).
      </p>

      {!snap ? (
        <button className="cn-calc-btn cn-calc-primary" onClick={tomarLectura}>
          <i className="fa-solid fa-camera" style={{ marginRight: 8 }} />
          Tomar lectura del instante
        </button>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 12, marginBottom: 14 }}>
            <div style={{ padding: "10px 13px", borderRadius: 11, background: "rgba(4,10,22,0.5)", border: `1px solid ${T.line}` }}>
              <div style={{ fontSize: 14, color: T.text3, fontWeight: 700 }}>instante</div>
              <div style={{ ...NUM, fontSize: 17, fontWeight: 900, color: "#fff" }}>t = {fmt1(snap.t)} s</div>
            </div>
            <div style={{ padding: "10px 13px", borderRadius: 11, background: "rgba(4,10,22,0.5)", border: `1px solid ${T.line}` }}>
              <div style={{ fontSize: 14, color: T.text3, fontWeight: 700 }}>aceleración</div>
              <div style={{ ...NUM, fontSize: 17, fontWeight: 900, color: snap.a >= 0 ? C_ACC : C_BRK }}>a = {fmt1(snap.a)} m/s²</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "stretch", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 140px", display: "flex", alignItems: "center", gap: 8 }}>
              <input
                className="cn-calc-in"
                inputMode="decimal"
                placeholder="v en m/s"
                value={val}
                disabled={estrellas != null}
                onChange={(e) => setVal(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") comprobar(); }}
                style={{ ...NUM }}
              />
              <span style={{ fontSize: 14, fontWeight: 800, color: T.text2 }}>m/s</span>
            </div>
            <button className="cn-calc-btn cn-calc-primary" onClick={comprobar} disabled={estrellas != null || val.trim() === ""}>
              <i className="fa-solid fa-check" style={{ marginRight: 7 }} />
              Comprobar
            </button>
            <button className="cn-calc-btn cn-calc-ghost" onClick={tomarLectura}>
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

/* ── Gráfica SVG (x-t, v-t, a-t) con sonda en el tiempo actual ────────────── */
function Grafica({
  pts, acc, tTotal, t1, tCur, valCur, color, titulo, unidad, yMin, yMax, fill = false, curva = false, escalonada = false,
}: {
  pts: Punto[]; acc: (p: Punto) => number; tTotal: number; t1: number; tCur: number; valCur: number;
  color: string; titulo: string; unidad: string; yMin: number; yMax: number;
  fill?: boolean; curva?: boolean; escalonada?: boolean;
}) {
  const W = 200, H = 132;
  const pad = { l: 30, r: 8, t: 10, b: 22 };
  const lo = Math.min(yMin, 0);
  const hi = Math.max(yMax, 0.0001);
  const span = hi - lo || 1;

  const mapX = (tv: number) => pad.l + (tv / (tTotal || 1)) * (W - pad.l - pad.r);
  const mapY = (yv: number) => H - pad.b - ((yv - lo) / span) * (H - pad.t - pad.b);

  const path = pts.map((p, i) => `${i ? "L" : "M"} ${mapX(p.t).toFixed(1)} ${mapY(acc(p)).toFixed(1)}`).join(" ");
  const y0 = mapY(0);
  const areaPath = fill ? `${path} L ${mapX(tTotal).toFixed(1)} ${y0.toFixed(1)} L ${mapX(0).toFixed(1)} ${y0.toFixed(1)} Z` : "";

  // escalón de la aceleración: tramo + a1 hasta t1, − a2 después
  const stepPath = escalonada
    ? `M ${mapX(0)} ${mapY(acc(pts[0]!))} L ${mapX(t1)} ${mapY(acc(pts[0]!))} L ${mapX(t1)} ${mapY(acc(pts[pts.length - 1]!))} L ${mapX(tTotal)} ${mapY(acc(pts[pts.length - 1]!))}`
    : "";

  const probeX = mapX(tCur);
  const probeY = mapY(valCur);

  return (
    <div style={{ borderRadius: 12, padding: "10px 10px 6px", marginBottom: 4, background: "rgba(4,10,22,0.4)", border: `1px solid ${color}33` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2, padding: "0 2px" }}>
        <span style={{ fontSize: 14, fontWeight: 900, color }}>{titulo}</span>
        <span style={{ fontSize: 14, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{fmt1(valCur)} {unidad}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
        {/* ejes */}
        <line x1={pad.l} y1={pad.t} x2={pad.l} y2={H - pad.b} stroke="rgba(255,255,255,0.22)" strokeWidth={1} />
        <line x1={pad.l} y1={y0} x2={W - pad.r} y2={y0} stroke="rgba(255,255,255,0.22)" strokeWidth={1} />
        {/* límite de fase t₁ */}
        <line x1={mapX(t1)} y1={pad.t} x2={mapX(t1)} y2={H - pad.b} stroke="rgba(255,255,255,0.18)" strokeWidth={1} strokeDasharray="3 3" />
        {/* área (distancia) */}
        {fill && <path d={areaPath} fill={`${color}22`} stroke="none" />}
        {/* curva */}
        <path d={escalonada ? stepPath : path} fill="none" stroke={color} strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round" />
        {/* sonda */}
        <line x1={probeX} y1={pad.t} x2={probeX} y2={H - pad.b} stroke="#ffffff" strokeWidth={1} strokeDasharray="2 3" opacity={0.5} />
        <circle cx={probeX} cy={probeY} r={3.4} fill="#fff" stroke={color} strokeWidth={2} />
        {/* etiquetas de ejes */}
        <text x={pad.l - 4} y={mapY(hi) + 3} textAnchor="end" fontSize={9.5} fill="rgba(255,255,255,0.5)">{fmt0(hi)}</text>
        {lo < 0 && <text x={pad.l - 4} y={mapY(lo) + 3} textAnchor="end" fontSize={9.5} fill="rgba(255,255,255,0.5)">{fmt0(lo)}</text>}
        <text x={W - pad.r} y={H - pad.b + 12} textAnchor="end" fontSize={9.5} fill="rgba(255,255,255,0.5)">{fmt0(tTotal)} s</text>
        {curva && <text x={pad.l + 2} y={H - pad.b + 12} textAnchor="start" fontSize={9.5} fill="rgba(255,255,255,0.5)">0</text>}
      </svg>
    </div>
  );
}

/* ── Tarjeta de respuesta ─────────────────────────────────────────────────── */
function Respuesta({ etq, col, txt, sub }: { etq: string; col: string; txt: string; sub: string }) {
  return (
    <div style={{ display: "flex", gap: 11, alignItems: "center", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${col}44` }}>
      <div style={{ width: 24, height: 24, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: "#04121f", background: col, flexShrink: 0 }}>{etq}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{txt}</div>
        <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.3 }}>{sub}</div>
      </div>
    </div>
  );
}

/* ── Item de leyenda (visor) ──────────────────────────────────────────────── */
function LegItem({ col, txt }: { col: string; txt: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>
      <span style={{ width: 18, height: 0, borderTop: `3px solid ${col}`, flexShrink: 0 }} />
      {txt}
    </div>
  );
}
