"use client";

/**
 * Laboratorio 3D — Análisis completo de una función: máximos, mínimos e inflexión.
 * Práctica experimental para PM-V-P06-A2 (ejercicio_matematico "Análisis completo
 * de función: encontrando extremos e inflexión"; progresión 6, UAC PM-V Cálculo
 * Diferencial).
 *
 * El alumno explora una sola función, f(x) = x³ − 3x² − 9x + 5, viendo a la vez
 * la curva f, su derivada f' (ámbar) y su segunda derivada f'' (violeta). Una
 * sonda x = a (deslizable, animada o saltando a un punto notable) muestra que:
 *  · donde f' = 0 hay un punto crítico (la tangente es horizontal),
 *  · el signo de f'' clasifica ese crítico (f'' < 0 → máximo, f'' > 0 → mínimo),
 *  · donde f'' cambia de signo hay un punto de inflexión.
 * Resultados verbatim del A2: máximo (−1, 10), inflexión (1, −6), mínimo (3, −22);
 * crece en x < −1 ó x > 3; cóncava arriba en x > 1.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, OK, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { ANALISIS_FICHA } from "./extremos-inflexion-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { RETO_A2 } from "./extremos-inflexion-data";
import { LabSfx } from "./lab-audio";
import {
  VISTA, PUNTOS, punto, evalF, evalD1, evalD2, clasificar, tangente, rectaStr,
  INTERVALOS, PASOS, IDEAS, DATOS, F_EXPR, D1_EXPR, D2_EXPR, fmt1, fmt2, fmt3,
  type FocoId,
} from "./analisis-data";

const AnalisisScene = dynamic(() => import("./AnalisisScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-chart-line fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Analizando la función…</span>
    </div>
  ),
});

const F_COL = "#2DD4BF";    // curva f
const D1_COL = "#fbbf24";   // curva f'
const D2_COL = "#C084FC";   // curva f''
const TAN_COL = "#34D399";  // tangente a f
const A_COL = "#7dd3fc";    // sonda x = a

const RETO_KEY = "cen-extremos-inflexion-reto";

export function LabAnalisis({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [aPos, setAPos] = useState<number>(-1); // arranca en el máximo
  const [show1, setShow1] = useState(true);
  const [show2, setShow2] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // reto evaluable y sonido
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  const [sonido, setSonido] = useState(false);
  // Para la misión central: ¿vio crecer y decrecer a f al barrer la sonda?
  const [vio, setVio] = useState({ sube: false, baja: false });
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

  // Animación: la sonda x = a barre el dominio de ida y vuelta.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = 0;
    let dir = 1;
    const tick = (ts: number) => {
      if (last === 0) last = ts;
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      const span = VISTA.xmax - VISTA.xmin;
      setAPos((prev) => {
        let next = prev + dir * dt * span * 0.26;
        if (next <= VISTA.xmin) { next = VISTA.xmin; dir = 1; }
        else if (next >= VISTA.xmax) { next = VISTA.xmax; dir = -1; }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const bump = () => setResetNonce((n) => n + 1);
  const irA = (id: FocoId) => {
    setPlaying(false);
    if (id !== "libre") setAPos(punto(id).x);
    if (sonido) audioRef.current?.blip();
    bump();
  };
  const reset = () => {
    setPlaying(false);
    setAPos(-1);
    setShow1(true);
    setShow2(true);
    bump();
  };

  // valores en vivo
  const fa = evalF(aPos);
  const d1 = evalD1(aPos);
  const d2 = evalD2(aPos);
  const { m: mt, b: bt } = tangente(aPos);
  const cl = clasificar(aPos);

  // ¿en qué foco está la sonda? (para resaltar el botón)
  const focoActivo: FocoId = cl.cerca ? cl.cerca.id : "libre";

  let lecturaCrec = "f'(a) ≈ 0: pendiente casi horizontal (cerca de un punto crítico).";
  if (cl.creciente) lecturaCrec = `f'(${fmt2(aPos)}) = ${fmt2(d1)} > 0 → f está CRECIENDO aquí.`;
  else if (cl.decreciente) lecturaCrec = `f'(${fmt2(aPos)}) = ${fmt2(d1)} < 0 → f está DECRECIENDO aquí.`;

  let lecturaConc = "f''(a) ≈ 0: cerca de un cambio de concavidad (inflexión).";
  if (cl.concavaArriba) lecturaConc = `f''(${fmt2(aPos)}) = ${fmt2(d2)} > 0 → cóncava hacia ARRIBA (∪).`;
  else if (cl.concavaAbajo) lecturaConc = `f''(${fmt2(aPos)}) = ${fmt2(d2)} < 0 → cóncava hacia ABAJO (∩).`;

  // Ajuste durante el render: recuerda si ya vio a f crecer y decrecer.
  if ((cl.creciente && !vio.sube) || (cl.decreciente && !vio.baja)) {
    setVio({ sube: vio.sube || cl.creciente, baja: vio.baja || cl.decreciente });
  }

  const objetivos = [
    { txt: "Barre la sonda y mira a f subir y luego bajar: la tangente cambia de inclinación en el crítico", done: vio.sube && vio.baja },
    { txt: "Salta al máximo local (x = −1) y lee f'(a) ≈ 0", done: focoActivo === "max", modo: "max" },
    { txt: "Salta al mínimo local (x = 3) y confirma f''(a) > 0", done: focoActivo === "min", modo: "min" },
    { txt: "Salta al punto de inflexión (x = 1) y verifica cambio de concavidad", done: focoActivo === "infl", modo: "infl" },
    { txt: "Barre la sonda con Play para ver las tres curvas en movimiento", done: playing },
    { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-chart-line" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{F_EXPR}</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la idea sigue: f&apos; = 0 da los críticos x = −1 y x = 3; f&apos;&apos; los clasifica (máximo en −1, mínimo en 3) y f&apos;&apos; = 0 marca la inflexión en x = 1.
      </div>
    </div>
  );

  const lecturaCorta = cl.cerca
    ? <>{cl.cerca.tipo} en x = {fmt2(cl.cerca.x)}</>
    : <>x = {fmt2(aPos)}: f {cl.creciente ? "crece" : cl.decreciente ? "decrece" : "se aplana"}, {cl.concavaArriba ? "∪" : cl.concavaAbajo ? "∩" : "inflexión"}</>;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <AnalisisScene aPos={aPos} show1={show1} show2={show2} accent={accent} resetNonce={resetNonce} />
        </SceneBoundary>
      }
      modos={{
        opciones: [
          ...PUNTOS.map((p) => ({ id: p.id as string, etiqueta: p.tipo, icono: p.icono })),
          { id: "libre", etiqueta: "Libre", icono: "fa-hand-pointer" },
        ],
        valor: focoActivo,
        cambiar: (id) => irA(id as FocoId),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono={playing ? "fa-pause" : "fa-play"} titulo={playing ? "Pausar" : "Barrer la sonda (x = a)"} activo={playing} onClick={() => setPlaying((p) => !p)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reset} />
        </>
      }
      leyenda={
        <>
          <LegItem col={F_COL} txt="f(x)" />
          {show1 && <LegItem col={D1_COL} txt="f'(x)" dashed />}
          {show2 && <LegItem col={D2_COL} txt="f''(x)" dashed />}
          <LegItem col={TAN_COL} txt="tangente" />
          <MedidorPendiente d1={d1} d2={d2} />
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
              <Bloque titulo="Mueve la sonda x = a" icono="fa-crosshairs">
                <Deslizador
                  label="sonda  x = a"
                  icon="fa-crosshairs"
                  colr={A_COL}
                  valor={fmt2(aPos)}
                  min={VISTA.xmin} max={VISTA.xmax} step={0.02} value={aPos}
                  onChange={(v) => { setPlaying(false); setAPos(v); }}
                  hintL={fmt2(VISTA.xmin)} hintR={fmt2(VISTA.xmax)}
                />
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <button type="button" onClick={() => setShow1((s) => !s)} style={{ ...BTN_VER, borderColor: show1 ? D1_COL : "rgba(255,255,255,0.18)" }}>
                    <i className={`fa-solid ${show1 ? "fa-eye" : "fa-eye-slash"}`} style={{ color: D1_COL }} aria-hidden />
                    f&apos;(x)
                  </button>
                  <button type="button" onClick={() => setShow2((s) => !s)} style={{ ...BTN_VER, borderColor: show2 ? D2_COL : "rgba(255,255,255,0.18)" }}>
                    <i className={`fa-solid ${show2 ? "fa-eye" : "fa-eye-slash"}`} style={{ color: D2_COL }} aria-hidden />
                    f&apos;&apos;(x)
                  </button>
                </div>
              </Bloque>
              <Bloque titulo={`Las tres alturas en x = ${fmt2(aPos)}`} icono="fa-layer-group">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label={`f(${fmt2(aPos)})`} value={fmt2(fa)} col={F_COL} />
                  <Dato label="f'(a) pendiente" value={fmt2(d1)} col={D1_COL} />
                  <Dato label="f''(a) concavidad" value={fmt2(d2)} col={D2_COL} />
                  <Dato label="sonda a" value={fmt2(aPos)} col={A_COL} />
                </div>
                <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: `1px solid ${TAN_COL}55`, background: `${TAN_COL}12` }}>
                  {cl.cerca ? `${cl.cerca.tipo} en x = ${fmt2(cl.cerca.x)} — ${cl.cerca.criterio}. ` : `${lecturaCrec} `}
                  {lecturaConc} La tangente es <strong style={{ color: TAN_COL, fontFamily: "ui-monospace, monospace" }}>{rectaStr(mt, bt)}</strong>; su pendiente es <strong style={{ color: D1_COL }}>f&apos;({fmt2(aPos)}) = {fmt3(d1)}</strong>.
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
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="La función y sus derivadas" icono="fa-chart-line">
                <div style={{ display: "grid", gap: 7 }}>
                  <ExprRow col={F_COL} txt={F_EXPR} />
                  <ExprRow col={D1_COL} txt={D1_EXPR} />
                  <ExprRow col={D2_COL} txt={D2_EXPR} />
                </div>
                <div style={{ display: "grid", gap: 8 }}>
                  {PUNTOS.map((p) => (
                    <div key={p.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 11px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${p.color}44` }}>
                      <i className={`fa-solid ${p.icono}`} style={{ color: p.color, marginTop: 4 }} aria-hidden />
                      <div>
                        <div style={{ fontWeight: 900, color: "#fff" }}>{p.tipo} ({fmt2(p.x)}, {fmt2(p.y)})</div>
                        <div style={{ color: T.text2, lineHeight: 1.4 }}>{p.criterio}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Análisis completo — paso a paso" icono="fa-list-ol">
                <div style={{ display: "grid", gap: 9 }}>
                  {PASOS.map((p) => (
                    <div key={p.etiqueta} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${accent}25` }}>
                      <div style={{ minWidth: 24, height: 24, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#04121f", background: accent, flexShrink: 0 }}>{p.etiqueta}</div>
                      <div style={{ minWidth: 0 }}>{p.texto}</div>
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Intervalos de la función" icono="fa-arrows-left-right-to-line">
                <div style={{ display: "grid", gap: 9 }}>
                  <Intervalo col="#34D399" icono="fa-arrow-trend-up" titulo="Creciente (f' > 0)" texto={INTERVALOS.crece} />
                  <Intervalo col="#F87171" icono="fa-arrow-trend-down" titulo="Decreciente (f' < 0)" texto={INTERVALOS.decrece} />
                  <Intervalo col="#C084FC" icono="fa-arrow-down-wide-short" titulo="Cóncava abajo (f'' < 0, ∩)" texto={INTERVALOS.concavaAbajo} />
                  <Intervalo col="#7dd3fc" icono="fa-arrow-up-wide-short" titulo="Cóncava arriba (f'' > 0, ∪)" texto={INTERVALOS.concavaArriba} />
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
                <FichaTeorica data={ANALISIS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3 }}>
                Cálculo <strong>exacto</strong>: la función <strong>f(x) = x³ − 3x² − 9x + 5</strong> y sus derivadas son verbatim del enunciado A2, y todos los valores (críticos x = −1 y x = 3, inflexión x = 1, máximo (−1, 10), mínimo (3, −22), inflexión (1, −6) e intervalos) son <strong>simbólicos cerrados</strong> resueltos a mano. La curva de f&apos; localiza los críticos donde toca el eje y la de f&apos;&apos; da la concavidad; el plano usa una escala vertical comprimida para que las tres curvas quepan, así que en los bordes f&apos; y f&apos;&apos; salen del recuadro visible.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}

/* ── Inclinómetro y concavidad: la flecha gira con f' y la copa sigue a f'' ─── */
function MedidorPendiente({ d1, d2 }: { d1: number; d2: number }) {
  const ang = (Math.atan(d1) * 180) / Math.PI;
  const plano = Math.abs(d1) < 0.5;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 800, color: "#dce6f5", marginTop: 4 }}>
      <span style={{ width: 34, height: 34, borderRadius: "50%", border: `2px solid ${plano ? OK : TAN_COL}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <i className="fa-solid fa-arrow-right" aria-hidden style={{ color: plano ? OK : TAN_COL, transform: `rotate(${-ang}deg)`, transition: "transform 120ms linear" }} />
      </span>
      <span>{plano ? "horizontal" : d1 > 0 ? "sube" : "baja"} · {Math.abs(d2) < 0.8 ? "inflexión" : d2 > 0 ? "∪" : "∩"} {fmt1(ang)}°</span>
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

/* ── Fila de intervalo ────────────────────────────────────────────────────── */
function Intervalo({ col, icono, titulo, texto }: { col: string; icono: string; titulo: string; texto: string }) {
  return (
    <div style={{ display: "flex", gap: 11, alignItems: "center", padding: "10px 12px", borderRadius: 11, background: T.glass, border: `1px solid ${col}33` }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: col, background: `${col}1e`, flexShrink: 0 }}>
        <i className={`fa-solid ${icono}`} />
      </div>
      <div>
        <div style={{ fontWeight: 900, color: "#fff" }}>{titulo}</div>
        <div style={{ color: col, fontWeight: 800, fontFamily: "ui-monospace, monospace" }}>{texto}</div>
      </div>
    </div>
  );
}

const BTN_VER = {
  cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 10,
  border: "1px solid", background: "rgba(4,10,22,0.5)", color: "#fff", fontSize: 14, fontWeight: 800,
} as const;
