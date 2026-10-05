"use client";

/**
 * Laboratorio 3D — "El diferencial: la recta tangente como aproximación".
 * Práctica experimental para PM-V-P08-A2 (ejercicio_matematico "Aplicando
 * diferenciales para estimar errores y valores"; progresión 8, UAC PM-V
 * Cálculo Diferencial).
 *
 * Dos modos:
 *  · ESTIMAR UN VALOR — el alumno mueve x sobre la curva (√x o eˣ) y compara el
 *    valor real f(x) con el estimado por la linealización L(x) = f(a)+f'(a)(x−a).
 *    La brecha es el error; cerca del punto base es diminuta (√9.04 ≈ 3.0067,
 *    e^0.1 ≈ 1.1). dy = f'(a)·dx es el diferencial (cambio sobre la tangente).
 *  · ESTIMAR UN ERROR — esfera r = 5.0 ± 0.05 cm; dV = 4π r²·dr = 5π ≈ 15.71 cm³
 *    es el volumen de una cáscara delgada (superficie × grosor); dV/V = 3·dr/r = 3 %.
 *
 * Todos los valores son de cálculo cerrado / funciones exactas.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { DIFERENCIAL_FICHA } from "./diferencial-linealizacion-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { RETO_A2 } from "./diferencial-linealizacion-data";
import { LabSfx } from "./lab-audio";
import {
  LIN_CASOS, linCaso, linLectura,
  esferaLectura, R_BASE, DR_BASE, R_MIN, R_MAX, DR_MIN, DR_MAX,
  PASOS_ESFERA, IDEAS, DATOS, fmt1, fmt2, fmt3, fmt4,
  type LinId,
} from "./diferencial-data";

const DiferencialScene = dynamic(() => import("./DiferencialScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-ruler-combined fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Trazando la tangente…</span>
    </div>
  ),
});

const TAN_COL = "#7dd3fc";    // linealización
const REAL_COL = "#34D399";   // valor real f(x)
const EST_COL = "#f472b6";    // valor estimado L(x)
const ERR_COL = "#f87171";    // error
const DY_COL = "#fbbf24";     // diferencial dy

type Modo = "valor" | "esfera";

const RETO_KEY = "cen-diferencial-linealizacion-reto";

export function LabDiferencial({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("valor");
  const [casoId, setCasoId] = useState<LinId>("raiz");
  const [xPos, setXPos] = useState<number>(12);       // sonda x (modo valor)
  const [r, setR] = useState<number>(R_BASE);          // modo esfera
  const [dr, setDr] = useState<number>(DR_BASE);
  const [playing, setPlaying] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

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

  const caso = linCaso(casoId);

  // Animación: en "valor" barre x; en "esfera" barre el radio r.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = 0;
    let dir = 1;
    const tick = (ts: number) => {
      if (last === 0) last = ts;
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      if (modo === "valor") {
        const span = caso.xmax - caso.xmin;
        setXPos((prev) => {
          let next = prev + dir * dt * span * 0.22;
          if (next <= caso.xmin) { next = caso.xmin; dir = 1; }
          else if (next >= caso.xmax) { next = caso.xmax; dir = -1; }
          return next;
        });
      } else {
        const span = R_MAX - R_MIN;
        setR((prev) => {
          let next = prev + dir * dt * span * 0.18;
          if (next <= R_MIN) { next = R_MIN; dir = 1; }
          else if (next >= R_MAX) { next = R_MAX; dir = -1; }
          return next;
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, modo, caso.xmin, caso.xmax]);

  const bump = () => setResetNonce((n) => n + 1);

  const cambiarModo = (m: Modo) => { setPlaying(false); setModo(m); bump(); };
  const cambiarCaso = (id: LinId) => {
    setPlaying(false);
    setCasoId(id);
    const c = linCaso(id);
    setXPos(c.a + (c.xmax - c.a) * 0.5);
    bump();
  };
  const irAlProblema = () => { setPlaying(false); if (sonido) audioRef.current?.blip(); setXPos(caso.xEval); bump(); };
  const medidaProblema = () => { setPlaying(false); if (sonido) audioRef.current?.blip(); setR(R_BASE); setDr(DR_BASE); bump(); };
  const reset = () => {
    setPlaying(false);
    if (modo === "valor") setXPos(caso.a + (caso.xmax - caso.a) * 0.5);
    else { setR(R_BASE); setDr(DR_BASE); }
    bump();
  };

  // lecturas en vivo
  const lv = linLectura(caso, xPos);
  const le = esferaLectura(r, dr);
  // El error más grande que puede darse en el rango explorable (escala del medidor).
  const errMax = Math.max(linLectura(caso, caso.xmin).error, linLectura(caso, caso.xmax).error, 1e-9);

  const objetivos = [
    { txt: "Acerca x al punto base a hasta que el error sea menor que 0.001", done: modo === "valor" && lv.error < 0.001, modo: "valor" },
    { txt: "Aleja x del punto base y mira cómo la brecha roja crece (error mayor que 0.1)", done: modo === "valor" && lv.error > 0.1, modo: "valor" },
    { txt: "Mueve el punto x y compara la curva con su recta tangente", done: modo === "valor" && xPos !== 12, modo: "valor" },
    { txt: "Cambia de caso (raíz, exponencial…) y repite la linealización", done: casoId !== "raiz" },
    { txt: "Activa el modo Estimar un error (esfera) y mueve el radio", done: modo !== "valor" },
    { txt: "Cambia la incertidumbre dr y observa cómo se propaga al volumen", done: dr !== DR_BASE },
    { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-ruler-combined" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>L(x) = f(a) + f&apos;(a)(x − a)</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 430, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena 3D, pero la idea sigue: cerca del punto base a, la recta tangente aproxima la curva. Así √9.04 ≈ 3 + (1/6)(0.04) ≈ 3.0067 y, para la esfera, dV = 4πr²·dr = 5π ≈ 15.71 cm³.
      </div>
    </div>
  );

  const lectura = modo === "valor"
    ? <>A {fmt2(Math.abs(lv.dx))} de a: error = {fmt4(lv.error)}</>
    : <>dr/r = {fmt2((dr / r) * 100)} % → dV/V = {fmt2(le.pct)} %</>;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <DiferencialScene modo={modo} casoId={casoId} xPos={xPos} r={r} dr={dr} accent={accent} resetNonce={resetNonce} />
        </SceneBoundary>
      }
      modos={{
        opciones: [
          { id: "valor", etiqueta: "Estimar un valor", icono: "fa-chart-line" },
          { id: "esfera", etiqueta: "Estimar un error", icono: "fa-globe" },
        ],
        valor: modo,
        cambiar: (id) => cambiarModo(id as Modo),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono={playing ? "fa-pause" : "fa-play"} titulo={playing ? "Pausar" : (modo === "valor" ? "Barrer x" : "Barrer el radio")} activo={playing} onClick={() => setPlaying((p) => !p)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reset} />
        </>
      }
      leyenda={
        modo === "valor" ? (
          <>
            <LegItem col={caso.color} txt={`curva  ${caso.fExpr.replace("f(x) = ", "")}`} />
            <LegItem col={TAN_COL} txt="tangente L(x)" dashed />
            <LegItem col={ERR_COL} txt="error" />
          </>
        ) : (
          <>
            <LegItem col={accent} txt="esfera (radio r)" />
            <LegItem col={ERR_COL} txt="cáscara = dV" />
          </>
        )
      }
      lectura={lectura}
      objetivos={objetivos}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <style>{`
                .df-chip { cursor:pointer; padding:9px 12px; border-radius:12px; border:1px solid ${T.line}; background:${T.inset};
                  color:${T.text2}; font-size:14px; font-weight:800; transition:all .15s; text-align:left; display:flex; align-items:center; gap:7px; }
                .df-chip:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
                .df-chip[data-on="true"] { border-color:rgba(${color.rgba},0.7); background:rgba(${color.rgba},0.18); color:#fff; }
              `}</style>
              {modo === "valor" ? (
                <>
                  <Bloque titulo="Elige la función y mueve x" icono="fa-function">
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {LIN_CASOS.map((c) => (
                        <button key={c.id} type="button" className="df-chip" data-on={casoId === c.id} onClick={() => cambiarCaso(c.id)}>
                          <i className="fa-solid fa-square-root-variable" style={{ color: c.color }} aria-hidden />
                          {c.titulo}
                        </button>
                      ))}
                      <button type="button" className="df-chip" onClick={irAlProblema} title="Va al punto del enunciado del A2">
                        <i className="fa-solid fa-bullseye" style={{ color: REAL_COL }} aria-hidden />
                        Punto del problema (x = {fmt2(caso.xEval)})
                      </button>
                    </div>
                    <Deslizador
                      label="punto x"
                      icon="fa-arrows-left-right-to-line"
                      colr={TAN_COL}
                      valor={`${fmt2(xPos)}`}
                      min={caso.xmin} max={caso.xmax} step={(caso.xmax - caso.xmin) / 600} value={xPos}
                      onChange={(v) => { setPlaying(false); setXPos(v); }}
                      hintL={`${fmt1(caso.xmin)}`} hintR={`${fmt1(caso.xmax)}`}
                    />
                    <p style={{ margin: 0, color: T.text2 }}>
                      Punto base <strong style={{ color: REAL_COL }}>a = {fmt1(caso.a)}</strong>. La tangente pega con la curva en a y se separa al alejarte.
                    </p>
                  </Bloque>

                  <Bloque titulo="Medidor: el error de la estimación" icono="fa-gauge-high">
                    <Barra txt="error |f − L|" val={lv.error} max={errMax} col={ERR_COL} marca={0.001} fmtv={fmt4(lv.error)} />
                    <Barra txt="dy sobre la tangente" val={Math.abs(lv.dy)} max={Math.max(Math.abs(lv.dy), Math.abs(lv.deltaY), 1e-9)} col={DY_COL} fmtv={fmt4(lv.dy)} />
                    <Barra txt="Δy cambio real" val={Math.abs(lv.deltaY)} max={Math.max(Math.abs(lv.dy), Math.abs(lv.deltaY), 1e-9)} col={REAL_COL} fmtv={fmt4(lv.deltaY)} />
                    <p style={{ margin: 0, color: lv.error < 0.001 ? REAL_COL : T.text2, fontWeight: 700 }}>
                      {lv.error < 0.001
                        ? "Error menor que 0.001: aquí la tangente casi no se distingue de la curva."
                        : "La marca blanca es 0.001. Acerca x a a para que la barra roja baje hasta ella."}
                    </p>
                  </Bloque>

                  <Bloque titulo="Lecturas" icono="fa-list">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                      <Dato label="x" value={fmt2(xPos)} col={TAN_COL} />
                      <Dato label="real f(x)" value={fmt4(lv.real)} col={REAL_COL} />
                      <Dato label="estimado L(x)" value={fmt4(lv.estimado)} col={EST_COL} />
                      <Dato label="dx = x − a" value={fmt2(lv.dx)} col={TAN_COL} />
                    </div>
                  </Bloque>
                </>
              ) : (
                <>
                  <Bloque titulo="Mide la esfera: r y su incertidumbre dr" icono="fa-globe">
                    <button type="button" className="df-chip" onClick={medidaProblema} title="Datos del enunciado del A2">
                      <i className="fa-solid fa-bullseye" style={{ color: REAL_COL }} aria-hidden />
                      Medida del problema (r = 5.0, dr = 0.05)
                    </button>
                    <Deslizador
                      label="radio r (cm)"
                      icon="fa-circle-dot"
                      colr={accent}
                      valor={`${fmt2(r)} cm`}
                      min={R_MIN} max={R_MAX} step={0.05} value={r}
                      onChange={(v) => { setPlaying(false); setR(v); }}
                      hintL={`${fmt1(R_MIN)} cm`} hintR={`${fmt1(R_MAX)} cm`}
                    />
                    <Deslizador
                      label="incertidumbre dr (cm)"
                      icon="fa-plus-minus"
                      colr={ERR_COL}
                      valor={`± ${fmt3(dr)} cm`}
                      min={DR_MIN} max={DR_MAX} step={0.005} value={dr}
                      onChange={(v) => { setPlaying(false); setDr(v); }}
                      hintL={`${fmt2(DR_MIN)}`} hintR={`${fmt2(DR_MAX)}`}
                    />
                    <p style={{ margin: 0, color: T.text2 }}>
                      La cáscara roja es dV = 4πr²·dr. Su grosor se dibuja exagerado; los números son los reales.
                    </p>
                  </Bloque>

                  <Bloque titulo="Medidor: el error se triplica" icono="fa-gauge-high">
                    <Barra txt="error del radio dr/r" val={(dr / r) * 100} max={Math.max((dr / r) * 100, le.pct, 1e-9)} col={accent} fmtv={`${fmt2((dr / r) * 100)} %`} />
                    <Barra txt="error del volumen dV/V" val={le.pct} max={Math.max((dr / r) * 100, le.pct, 1e-9)} col={ERR_COL} fmtv={`${fmt2(le.pct)} %`} />
                    <p style={{ margin: 0, color: T.text2, fontWeight: 700 }}>
                      La barra roja siempre mide 3 veces la azul: el exponente de r³ amplifica el error.
                    </p>
                  </Bloque>

                  <Bloque titulo="Lecturas" icono="fa-list">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                      <Dato label="volumen V" value={`${fmt1(le.V)} cm³`} col={REAL_COL} />
                      <Dato label="dV diferencial" value={`${fmt2(le.dV)} cm³`} col={DY_COL} />
                      <Dato label="ΔV real" value={`${fmt2(le.dVreal)} cm³`} col={TAN_COL} />
                      <Dato label="error dV/V" value={`${fmt2(le.pct)} %`} col={ERR_COL} />
                    </div>
                  </Bloque>
                </>
              )}
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
              <Bloque titulo="El diferencial y la linealización" icono="fa-ruler-combined">
                <ExprRow col={TAN_COL} txt="L(x) = f(a) + f′(a)(x − a)" />
                <ExprRow col={DY_COL} txt="dy = f′(a)·dx   (sobre la tangente)" />
                <ExprRow col={REAL_COL} txt="Δy = f(a + dx) − f(a)   (real)" />
                <ExprRow col={ERR_COL} txt="dV = 4π r²·dr  →  dV/V = 3·dr/r" />
                <div style={{ display: "grid", gap: 4, padding: "9px 11px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${REAL_COL}44` }}>
                  <strong style={{ color: "#fff" }}>√(9.04) ≈ 3.0067</strong>
                  <span style={{ color: T.text2 }}>3 + (1/6)(0.04). Real ≈ 3.00666: error &lt; 0.0001.</span>
                </div>
                <div style={{ display: "grid", gap: 4, padding: "9px 11px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${DY_COL}44` }}>
                  <strong style={{ color: "#fff" }}>e^(0.1) ≈ 1.1</strong>
                  <span style={{ color: T.text2 }}>1 + x con L(x) = 1 + x. Real ≈ 1.1052: error &lt; 0.5 %.</span>
                </div>
              </Bloque>
              {LIN_CASOS.map((c) => (
                <Bloque key={c.id} titulo={`${c.titulo} — paso a paso`} icono="fa-list-ol">
                  <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
                    {c.pasos.map((t, i) => <li key={i}>{t}</li>)}
                  </ol>
                </Bloque>
              ))}
              <Bloque titulo="El error de la esfera — paso a paso" icono="fa-globe">
                <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
                  {PASOS_ESFERA.map((p) => <li key={p.etiqueta}>{p.texto}</li>)}
                </ol>
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
                <FichaTeorica data={DIFERENCIAL_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3 }}>
                Cálculo exacto: las funciones (√x, eˣ) y la esfera son verbatim del enunciado A2. En el modo esfera el grosor dr se dibuja exagerado para que la cáscara sea visible (el valor real ±0.05 cm es minúsculo frente a r = 5 cm); los números en cm y cm³ son los reales.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}

/* ── Barra del medidor: valor contra su escala, con marca opcional ──────────── */
function Barra({ txt, val, max, col, fmtv, marca }: { txt: string; val: number; max: number; col: string; fmtv: string; marca?: number }) {
  return (
    <div style={{ display: "grid", gap: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>
        <span>{txt}</span><span style={{ fontFamily: "ui-monospace, monospace" }}>{fmtv}</span>
      </div>
      <div style={{ position: "relative", height: 12, borderRadius: 6, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
        <div style={{ width: `${Math.min(100, (val / max) * 100)}%`, height: "100%", background: col, transition: "width 120ms linear" }} />
        {marca != null && (
          <div style={{ position: "absolute", top: 0, bottom: 0, left: `${Math.min(99, (marca / max) * 100)}%`, width: 2, background: "#fff" }} />
        )}
      </div>
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
