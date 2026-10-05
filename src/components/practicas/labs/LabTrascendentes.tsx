"use client";

/**
 * Laboratorio 3D — Derivadas de funciones trascendentes: trig, exp y log.
 * Práctica experimental para PM-V-P05-A2 (ejercicio_matematico "Calculando
 * derivadas de funciones trigonométricas y exponenciales"; progresión 5,
 * UAC PM-V Cálculo Diferencial).
 *
 * El alumno elige una función, mueve la sonda x = a y ve a la vez la curva f, la
 * curva de su derivada f' (ámbar) y la recta tangente a f en P: la ALTURA de la
 * derivada en a coincide con la PENDIENTE de esa tangente. Derivar las funciones
 * trascendentes (con sus derivadas básicas + cadena/producto) construye f'.
 * Casos verbatim del A2:
 *  (a) f(x)=3 sen x − 2 cos x + tan x → 3 cos x + 2 sen x + sec²x  (linealidad, default)
 *  (b) g(x)=e^(2x)·cos x             → e^(2x)(2 cos x − sen x)      (producto + cadena)
 *  (c) h(x)=ln(x²+1)                 → 2x/(x²+1)                    (cadena)
 *  (d) k(x)=sen(x³)                  → 3x² cos(x³)                  (cadena)
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { TRASCENDENTES_FICHA } from "./trascendentes-derivacion-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { RETO_A2 } from "./trascendentes-derivacion-data";
import { LabSfx } from "./lab-audio";
import {
  FUNCIONES, func, evalFunc, deriv, tangente, rectaStr,
  IDEAS, DATOS, fmt1, fmt2, fmt3,
  FUNC_DEF, type FuncId,
} from "./trascendentes-data";

const TrascendentesScene = dynamic(() => import("./TrascendentesScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-wave-square fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Derivando…</span>
    </div>
  ),
});

const DER_COL = "#fbbf24";   // curva de la derivada f'
const TAN_COL = "#34D399";   // recta tangente a f
const A_COL = "#7dd3fc";     // sonda x = a

const RETO_KEY = "cen-trascendentes-derivacion-reto";

export function LabTrascendentes({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [funcId, setFuncId] = useState<FuncId>(FUNC_DEF);
  const [aPos, setAPos] = useState<number>(func(FUNC_DEF).aDef);
  const [playing, setPlaying] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  const [sonido, setSonido] = useState(false);
  // Tramo del dominio que la sonda ya recorrió (para la misión de barrido).
  const [recorrido, setRecorrido] = useState<{ id: FuncId; lo: number; hi: number }>({ id: FUNC_DEF, lo: func(FUNC_DEF).aDef, hi: func(FUNC_DEF).aDef });
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

  const f = useMemo(() => func(funcId), [funcId]);

  // Ajuste durante el render: acumula el tramo recorrido por la sonda.
  if (recorrido.id !== funcId) {
    setRecorrido({ id: funcId, lo: aPos, hi: aPos });
  } else if (aPos < recorrido.lo || aPos > recorrido.hi) {
    setRecorrido({ id: funcId, lo: Math.min(recorrido.lo, aPos), hi: Math.max(recorrido.hi, aPos) });
  }
  const barrido = (recorrido.hi - recorrido.lo) / (f.aMax - f.aMin);

  // Animación: la sonda x = a barre el dominio de ida y vuelta. La tangente gira
  // y el punto D recorre la curva de la derivada: f' es la "pendiente en cada x".
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = 0;
    let dir = 1;
    const tick = (ts: number) => {
      if (last === 0) last = ts;
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      const span = f.aMax - f.aMin;
      setAPos((prev) => {
        let next = prev + dir * dt * span * 0.32;
        if (next <= f.aMin) { next = f.aMin; dir = 1; }
        else if (next >= f.aMax) { next = f.aMax; dir = -1; }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, f.aMin, f.aMax]);

  const bump = () => setResetNonce((n) => n + 1);
  const elegirFunc = (id: FuncId) => {
    setPlaying(false);
    setFuncId(id);
    setAPos(func(id).aDef);
    if (sonido) audioRef.current?.blip();
    bump();
  };
  const reset = () => {
    setPlaying(false);
    setFuncId(FUNC_DEF);
    setAPos(func(FUNC_DEF).aDef);
    bump();
  };

  // valores en vivo
  const fa = evalFunc(funcId, aPos);
  const da = deriv(funcId, aPos);
  const { m: mt, b: bt } = tangente(funcId, aPos);
  const creciente = Number.isFinite(da) ? da > 1e-9 : false;
  const decreciente = Number.isFinite(da) ? da < -1e-9 : false;

  const objetivos = [
    { txt: "Barre la sonda x = a por todo el dominio: la tangente gira y el punto ámbar traza f'", done: barrido >= 0.85 },
    { txt: "Elige una función y observa su derivada en la escena", done: funcId !== FUNC_DEF || aPos !== func(FUNC_DEF).aDef },
    { txt: "Mueve la sonda x = a y comprueba pendiente = altura de f'", done: aPos !== func(funcId).aDef },
    { txt: "Prueba la regla del producto y la de la cadena", done: funcId === "expprod" || funcId === "senocadena", modo: ["expprod", "senocadena"] },
    { txt: "Prueba la derivada del logaritmo", done: funcId === "logaritmo", modo: "logaritmo" },
    { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${f.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{f.titulo}</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la idea sigue: aplicando la regla {f.regla.toLowerCase()} se obtiene {f.derivExpr}, y la altura de esa derivada en x = a es la pendiente de la tangente a f.
      </div>
    </div>
  );

  const lecturaCorta = <>pendiente en x = {fmt2(aPos)} → f&apos;(a) = {fmt3(da)}</>;
  const sentido = creciente
    ? `f'(${fmt2(aPos)}) > 0: la curva ámbar va por encima del eje y f está creciendo aquí.`
    : decreciente
    ? `f'(${fmt2(aPos)}) < 0: la curva ámbar va por debajo del eje y f está decreciendo aquí.`
    : `f'(${fmt2(aPos)}) ≈ 0: la tangente es casi horizontal (la derivada cruza el eje).`;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <TrascendentesScene funcId={funcId} aPos={aPos} accent={accent} resetNonce={resetNonce} />
        </SceneBoundary>
      }
      modos={{
        opciones: FUNCIONES.map((ff) => ({ id: ff.id, etiqueta: ff.label, icono: ff.icono })),
        valor: funcId,
        cambiar: (id) => elegirFunc(id as FuncId),
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
          <LegItem col={f.color} txt="f(x)" />
          <LegItem col={DER_COL} txt="f'(x)" dashed />
          <LegItem col={TAN_COL} txt="tangente" />
          <MedidorPendiente da={da} />
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
                  min={f.aMin} max={f.aMax} step={0.02} value={aPos}
                  onChange={(v) => { setPlaying(false); setAPos(v); }}
                  hintL={fmt2(f.aMin)} hintR={fmt2(f.aMax)}
                />
                <p style={{ margin: 0, color: T.text2 }}>
                  Recorrido de la sonda: <strong style={{ color: "#fff" }}>{Math.round(Math.min(1, barrido) * 100)} %</strong> del dominio.
                </p>
              </Bloque>
              <Bloque titulo="La altura de f' = la pendiente" icono="fa-arrows-up-down">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="sonda a" value={fmt2(aPos)} col={A_COL} />
                  <Dato label={`f(${fmt2(aPos)})`} value={fmt2(fa)} col={f.color} />
                  <Dato label="altura de f' en a" value={fmt3(da)} col={DER_COL} />
                  <Dato label="pendiente tangente" value={fmt3(mt)} col={TAN_COL} />
                </div>
                <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: `1px solid ${TAN_COL}55`, background: `${TAN_COL}12` }}>
                  {sentido} La tangente es <strong style={{ color: TAN_COL, fontFamily: "ui-monospace, monospace" }}>{rectaStr(mt, bt)}</strong>.
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
              <Bloque titulo={`Regla: ${f.regla}`} icono={f.icono}>
                <div style={{ fontWeight: 900, color: f.color, fontFamily: "ui-monospace, monospace" }}>{f.reglaFormula}</div>
                <div style={{ padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${f.color}33` }}>
                  <div style={{ fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{f.expr}</div>
                  <div style={{ fontWeight: 900, color: DER_COL, fontFamily: "ui-monospace, monospace", marginTop: 3 }}>{f.derivExpr}</div>
                </div>
                <p style={{ margin: 0, color: T.text2 }}>{f.contexto}</p>
              </Bloque>
              <Bloque titulo="Aplicando la regla — paso a paso" icono="fa-list-ol">
                <div style={{ display: "grid", gap: 9 }}>
                  {f.pasos.map((p) => (
                    <div key={p.etiqueta} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${accent}25` }}>
                      <div style={{ minWidth: 24, height: 24, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#04121f", background: accent, flexShrink: 0 }}>{p.etiqueta}</div>
                      <div style={{ minWidth: 0 }}>{p.texto}</div>
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Derivadas básicas trascendentes" icono="fa-pen-nib">
                <div style={{ display: "grid", gap: 9 }}>
                  <TipoRef icono="fa-wave-square" col="#2DD4BF" titulo="Trigonométricas" texto="(sen x)' = cos x · (cos x)' = −sen x · (tan x)' = sec²x." activo={funcId === "trig"} />
                  <TipoRef icono="fa-bolt" col="#A78BFA" titulo="Exponencial" texto="(eˣ)' = eˣ y, con cadena, (e^(kx))' = k·e^(kx). Es 'su propia derivada'." activo={funcId === "expprod"} />
                  <TipoRef icono="fa-divide" col="#F472B6" titulo="Logaritmo" texto="(ln x)' = 1/x y, con cadena, (ln u)' = u'/u." activo={funcId === "logaritmo"} />
                  <TipoRef icono="fa-link" col="#60A5FA" titulo="Cadena (trig)" texto="(sen u)' = cos(u)·u'. Deriva de afuera hacia adentro." activo={funcId === "senocadena"} />
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
                <FichaTeorica data={TRASCENDENTES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3 }}>
                Cálculo <strong>exacto</strong>: las cuatro derivadas son <strong>simbólicas</strong> y la tangente usa la pendiente real f&apos;(a). Los cuatro casos —3 sen x − 2 cos x + tan x, e^(2x)·cos x, ln(x² + 1) y sen(x³)— son verbatim del enunciado A2. El plano dibuja f y f&apos; a una escala propia por caso para que ambas curvas quepan; en la tangente (tan x) el plano se queda dentro de ±1.05 rad para no tocar la asíntota de x = π/2.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}

/* ── Inclinómetro: la flecha gira con la pendiente de la tangente ──────────── */
function MedidorPendiente({ da }: { da: number }) {
  const ang = Number.isFinite(da) ? (Math.atan(da) * 180) / Math.PI : 0;
  const txt = Math.abs(da) < 0.05 ? "horizontal" : da > 0 ? "sube" : "baja";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 800, color: "#dce6f5", marginTop: 4 }}>
      <span style={{ width: 34, height: 34, borderRadius: "50%", border: `2px solid ${TAN_COL}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <i className="fa-solid fa-arrow-right" aria-hidden style={{ color: TAN_COL, transform: `rotate(${-ang}deg)`, transition: "transform 120ms linear" }} />
      </span>
      <span>{fmt1(ang)}° · {txt}</span>
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

/* ── Tarjeta de referencia ────────────────────────────────────────────────── */
function TipoRef({ icono, col, titulo, texto, activo }: { icono: string; col: string; titulo: string; texto: string; activo?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: activo ? `${col}1e` : T.glass, border: `1px solid ${activo ? `${col}88` : `${col}33`}` }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: col, background: `${col}1e`, flexShrink: 0 }}>
        <i className={`fa-solid ${icono}`} />
      </div>
      <div>
        <div style={{ fontWeight: 900, color: "#fff" }}>{titulo}{activo ? "  ←" : ""}</div>
        <div style={{ color: T.text2, lineHeight: 1.45 }}>{texto}</div>
      </div>
    </div>
  );
}
