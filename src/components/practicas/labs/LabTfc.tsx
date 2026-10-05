"use client";

/**
 * Laboratorio 3D — Teorema Fundamental del Cálculo.
 * Práctica experimental para PM-V-P10-A2
 * ("Aproximo el área bajo una curva y la conecto con la antiderivada";
 *  progresión 8 / propósito formativo O8).
 *
 * El alumno elige una función f y la integra geométricamente: con el modo ÁREA
 * aproxima ∫₀ᵇ f con rectángulos de Riemann (a más rectángulos, más se pegan al
 * área exacta); con ACUMULACIÓN ve cómo F(x) = ∫₀ˣ f acumula esa área; y con
 * CONEXIÓN comprueba el Teorema Fundamental del Cálculo: la pendiente de F en b
 * es justo la altura f(b), es decir F′(x) = f(x). Pensamiento Matemático V —
 * «Cálculo diferencial», propósito formativo 8 (MCCEMS 2025).
 *
 * Experimento central: arrastrar (o barrer) el límite b y VER cómo el área
 * sombreada se llena; un medidor compara, según el modo, la suma de Riemann con
 * la integral, el área con la altura de F, o la pendiente de F con f(b).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { TFC_FICHA } from "./teorema-fundamental-calculo-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { RETO_A2 } from "./teorema-fundamental-calculo-data";
import { LabSfx } from "./lab-audio";
import {
  FUNCIONES,
  FUNCION_DEFAULT,
  funcionPorId,
  sumaRiemann,
  integralExacta,
  errorRelativo,
  MODOS,
  A_FIJO,
  XMAX,
  B_DEFAULT,
  N_DEFAULT,
  N_MIN,
  N_MAX,
  fmtNum,
  type Modo,
} from "./tfc-data";

const TfcScene = dynamic(() => import("./TfcScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-chart-area fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const VERDE = "#34D399";
const ORO = "#ffd24a";
const CIAN = "#7fd4ff";
const MAGENTA = "#f0a6ff";

const RETO_KEY = "cen-teorema-fundamental-calculo-reto";

const B_MIN = 0.5;
const NOMBRE_CORTO: Record<Modo, string> = { area: "Área", acumulacion: "Acumulación", conexion: "Conexión" };

export function LabTfc({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [funcionId, setFuncionId] = useState(FUNCION_DEFAULT);
  const [modo, setModo] = useState<Modo>("area");
  const [b, setB] = useState(B_DEFAULT);
  const [n, setN] = useState(N_DEFAULT);
  const [barriendo, setBarriendo] = useState(false);
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

  // Barrido: el límite b va y viene y el área se llena y se vacía.
  useEffect(() => {
    if (!barriendo) return;
    let raf = 0;
    let last = 0;
    let dir = 1;
    const tick = (ts: number) => {
      if (last === 0) last = ts;
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      setB((prev) => {
        let next = prev + dir * dt * (XMAX - B_MIN) * 0.25;
        if (next <= B_MIN) { next = B_MIN; dir = 1; }
        else if (next >= XMAX) { next = XMAX; dir = -1; }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [barriendo]);

  // objetivos
  const [movioB, setMovioB] = useState(false);
  const [cambioFuncion, setCambioFuncion] = useState(false);
  const [refinoRiemann, setRefinoRiemann] = useState(false);
  const [vioAcumulacion, setVioAcumulacion] = useState(false);
  const [vioConexion, setVioConexion] = useState(false);

  const bump = () => setResetNonce((k) => k + 1);

  const elegir = (id: string) => { setFuncionId(id); setCambioFuncion(true); if (sonido) audioRef.current?.blip(); };
  const elegirModo = (m: Modo) => {
    setModo(m);
    if (sonido) audioRef.current?.blip();
    if (m === "acumulacion") setVioAcumulacion(true);
    if (m === "conexion") setVioConexion(true);
  };
  const cambiarB = (v: number) => { setBarriendo(false); setB(v); setMovioB(true); };
  const cambiarN = (v: number) => { setN(v); if (v >= 16) setRefinoRiemann(true); };
  const toggleBarrido = () => { setBarriendo((p) => !p); setMovioB(true); };

  const reset = () => {
    setBarriendo(false);
    setFuncionId(FUNCION_DEFAULT);
    setModo("area"); setB(B_DEFAULT); setN(N_DEFAULT);
    bump();
  };

  // magnitudes matemáticas (deterministas)
  const fn = useMemo(() => funcionPorId(funcionId), [funcionId]);
  const suma = useMemo(() => sumaRiemann(fn, A_FIJO, b, n), [fn, b, n]);
  const exacta = useMemo(() => integralExacta(fn, A_FIJO, b), [fn, b]);
  const err = useMemo(() => errorRelativo(fn, A_FIJO, b, n), [fn, b, n]);
  const fb = fn.f(b);

  const modoActual = MODOS.find((m) => m.id === modo) ?? MODOS[0]!;

  const objetivos = [
    { txt: "Mueve el límite b y mira cómo se llena el área bajo la curva", done: movioB },
    { txt: "Integra una función del catálogo", done: cambioFuncion },
    { txt: "Refina la suma de Riemann (≥16 rect.)", done: refinoRiemann },
    { txt: "Observa la función de acumulación", done: vioAcumulacion },
    { txt: "Verifica F′(x) = f(x) (el TFC)", done: vioConexion },
    { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-chart-area" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>La integral es el área bajo la curva</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: ∫ₐᵇ f es el área entre la curva y el eje X. Si F es una antiderivada de f, ese área vale F(b) − F(a), y derivar la acumulación devuelve f: ese es el Teorema Fundamental del Cálculo.
      </div>
    </div>
  );

  // Medidor: dos barras que se comparan según el modo.
  const medidor = (compacto: boolean) => {
    const filas: Array<{ txt: string; val: number; col: string }> =
      modo === "area"
        ? [{ txt: `Σ Riemann (n = ${n})`, val: suma, col: ORO }, { txt: "∫₀ᵇ f exacta", val: exacta, col: VERDE }]
        : modo === "acumulacion"
          ? [{ txt: "área sombreada bajo f", val: exacta, col: accent }, { txt: "altura de F(b)", val: exacta, col: VERDE }]
          : [{ txt: "pendiente de F en b", val: fb, col: ORO }, { txt: "altura f(b)", val: fb, col: accent }];
    const tope = Math.max(...filas.map((f) => Math.abs(f.val)), 1) * 1.1;
    const veredicto =
      modo === "area"
        ? `error ${fmtNum(err, 1)} %${err < 5 ? " · casi exacta" : " · sube n"}`
        : modo === "acumulacion"
          ? "área acumulada = altura de F"
          : "F′(b) = f(b): el TFC";
    return (
      <div style={{ display: "grid", gap: compacto ? 6 : 10, width: compacto ? 200 : undefined }}>
        {filas.map((f) => (
          <div key={f.txt} style={{ display: "grid", gap: 3 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>
              <span>{f.txt}</span><span style={{ fontFamily: "ui-monospace, monospace" }}>{fmtNum(f.val, 2)}</span>
            </div>
            <div style={{ height: compacto ? 9 : 12, borderRadius: 6, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
              <div style={{ width: `${Math.min(100, (Math.abs(f.val) / tope) * 100)}%`, height: "100%", background: f.col, transition: "width 120ms linear" }} />
            </div>
          </div>
        ))}
        <div style={{ fontSize: 14, fontWeight: 900, color: modo === "area" ? MAGENTA : VERDE }}>{veredicto}</div>
      </div>
    );
  };

  const lectura =
    modo === "area" ? <>∫₀^{fmtNum(b, 2)} f ≈ {fmtNum(suma, 2)} (exacta {fmtNum(exacta, 2)})</>
    : modo === "acumulacion" ? <>F({fmtNum(b, 2)}) = área = {fmtNum(exacta, 2)}</>
    : <>F′({fmtNum(b, 2)}) = f({fmtNum(b, 2)}) = {fmtNum(fb, 2)}</>;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <TfcScene
            funcionId={funcionId}
            accent={accent}
            modo={modo}
            b={b}
            n={n}
            resetNonce={resetNonce}
          />
        </SceneBoundary>
      }
      modos={{
        opciones: MODOS.map((m) => ({ id: m.id, etiqueta: NOMBRE_CORTO[m.id], icono: m.icon })),
        valor: modo,
        cambiar: (id) => elegirModo(id as Modo),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono={barriendo ? "fa-pause" : "fa-play"} titulo={barriendo ? "Pausar el barrido de b" : "Barrer el límite b"} activo={barriendo} onClick={toggleBarrido} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reset} />
        </>
      }
      leyenda={
        <>
          <div style={{ fontSize: 15, fontWeight: 900, color: accent, fontFamily: "ui-monospace, monospace" }}>
            ∫₀ᵇ {fn.formula.replace("f(x) = ", "")} dx
          </div>
          {medidor(true)}
          <div style={{ fontSize: 14, color: T.text3 }}>ejes: x de 0 a {XMAX}, y de 0 a 8</div>
        </>
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
              <Bloque titulo={modoActual.nombre} icono={modoActual.icon}>
                <p style={{ margin: 0, color: T.text2 }}>{modoActual.desc}</p>
                <Deslizador label="Límite superior b" icon="fa-arrows-left-right" colr={MAGENTA}
                  valor={fmtNum(b, 2)} min={B_MIN} max={XMAX} step={0.25} value={b} onChange={cambiarB} />
                {modo === "area" && (
                  <Deslizador label="Rectángulos de Riemann n" icon="fa-grip-lines-vertical" colr={ORO}
                    valor={`${n}`} min={N_MIN} max={N_MAX} step={1} value={n} onChange={cambiarN}
                    hintL="pocos: sobra o falta" hintR="muchos: se pega" />
                )}
              </Bloque>

              <Bloque titulo="El medidor" icono="fa-gauge-high">
                {medidor(false)}
              </Bloque>

              <Bloque titulo={`Integral de ${fn.formula} en [0, ${fmtNum(b, 2)}]`} icono="fa-magnifying-glass-chart">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label={`suma de Riemann (n=${n})`} value={fmtNum(suma, 2)} col={ORO} />
                  <Dato label="integral exacta F(b)−F(a)" value={fmtNum(exacta, 2)} col={VERDE} />
                  <Dato label="error de aproximación" value={`${fmtNum(err, 1)} %`} col={MAGENTA} />
                  <Dato label="pendiente de F = f(b)" value={fmtNum(fb, 2)} col={ORO} />
                  <Dato label="antiderivada usada" value={fn.antiderivada} col={CIAN} />
                </div>
                <p style={{ margin: 0, color: T.text2 }}>{fn.significado}</p>
              </Bloque>

              <Bloque titulo="Elige una función para integrar" icono="fa-shapes">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 8 }}>
                  {FUNCIONES.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => elegir(f.id)}
                      aria-pressed={funcionId === f.id}
                      style={{
                        cursor: "pointer", textAlign: "left", display: "flex", flexDirection: "column", gap: 2, padding: "10px 12px", borderRadius: 11,
                        border: `1px solid ${funcionId === f.id ? accent : T.line}`,
                        background: funcionId === f.id ? `rgba(${color.rgba},0.16)` : T.inset,
                        color: funcionId === f.id ? "#fff" : T.text2,
                      }}
                    >
                      <span style={{ fontSize: 15, fontWeight: 900, color: funcionId === f.id ? accent : T.text, fontFamily: "ui-monospace, monospace" }}>{f.formula}</span>
                      <span style={{ fontSize: 14, color: T.text3 }}>{f.nombre}</span>
                    </button>
                  ))}
                </div>
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
              <Bloque titulo="El Teorema Fundamental del Cálculo" icono="fa-link">
                <p style={{ margin: 0, color: T.text2 }}>
                  La función de acumulación <strong style={{ color: VERDE }}>F(x) = ∫₀ˣ f</strong> mide el área bajo f hasta x. Su altura aquí en b vale <strong style={{ color: VERDE }}>{fmtNum(exacta, 2)}</strong>, justo el área sombreada. Y su <strong style={{ color: ORO }}>pendiente</strong> en b es <strong style={{ color: ORO }}>{fmtNum(fb, 2)}</strong> = f(b): derivar la acumulación devuelve la función original, <strong style={{ color: accent }}>F′(x) = f(x)</strong>. Esa es la conexión entre derivar e integrar.
                </p>
              </Bloque>

              <Bloque titulo="Qué es integrar" icono="fa-chart-area">
                <p style={{ margin: 0, color: T.text2 }}>
                  <strong style={{ color: T.text }}>Integrar</strong> una función es medir el <strong style={{ color: accent }}>área bajo su curva</strong>. La integral definida <strong>∫ₐᵇ f(x) dx</strong> es esa área entre x = a y x = b. Si f es un ritmo de cambio (velocidad, caudal, potencia), su área es el total acumulado (distancia, volumen, energía).
                </p>
              </Bloque>

              <Bloque titulo="Las ideas a leer" icono="fa-list-check">
                <Parte col={ORO} icon="fa-grip-lines-vertical" titulo="Sumas de Riemann">
                  Partimos [a, b] en n rectángulos; su suma aproxima el área. Sube n y mira cómo el error se acerca a cero.
                </Parte>
                <Parte col={VERDE} icon="fa-layer-group" titulo="Función de acumulación">
                  F(x) = ∫₀ˣ f acumula el área desde 0 hasta x: dice cuánto cambio se ha sumado hasta ese punto.
                </Parte>
                <Parte col={ORO} icon="fa-link" titulo="El Teorema Fundamental">
                  Derivar la acumulación devuelve la función: F′(x) = f(x). Y por eso ∫ₐᵇ f = F(b) − F(a).
                </Parte>
                <Parte col={CIAN} icon="fa-rotate" titulo="Operaciones inversas">
                  Integrar y derivar se deshacen mutuamente, como sumar y restar o elevar al cuadrado y la raíz.
                </Parte>
              </Bloque>

              <Bloque titulo="De Riemann a la integral" icono="fa-grip-lines-vertical">
                <p style={{ margin: 0, color: T.text2 }}>
                  Con pocos rectángulos la suma <strong style={{ color: ORO }}>sobra o falta</strong> respecto al área real. Al usar cada vez más rectángulos —más delgados— la suma de Riemann se <strong style={{ color: T.text }}>pega</strong> al valor exacto: ese límite es la integral definida. El TFC nos da un atajo: en vez de sumar infinitos rectángulos, basta evaluar la antiderivada en los extremos.
                </p>
              </Bloque>

              <Bloque titulo="En la vida real (México)" icono="fa-location-dot">
                <p style={{ margin: 0, color: T.text2 }}>
                  El área bajo una gráfica <strong>velocidad–tiempo</strong> es la distancia de un viaje Puebla–CDMX; bajo el <strong>caudal</strong> del Cutzamala, el volumen de agua que llega a la CDMX; bajo la <strong>potencia eléctrica</strong>, la energía en kWh que cobra la CFE; bajo la <strong>tasa de lluvia</strong>, el agua acumulada en una presa. Integrar es sumar un cambio continuo, y el TFC garantiza que derivar esa suma devuelve el ritmo original.
                </p>
              </Bloque>

              <Bloque titulo="Pista para el reto" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>
                  Para el ejercicio de A2 elige <strong style={{ color: accent }}>f(x) = 2x</strong> (la velocidad v = 2t) y lleva <strong>b = 4</strong>: el área es <strong style={{ color: VERDE }}>16</strong> (∫₀⁴ 2t dt = [t²]₀⁴ = 16). En modo «Conexión» verás que la pendiente de F en b vale 2b = f(b): el TFC en acción.
                </p>
              </Bloque>

              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={TFC_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

/* ── Tarjeta de "parte" en la teoría ─────────────────────────────────── */
function Parte({ col, icon, titulo, children }: { col: string; icon: string; titulo: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
      <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: col, background: `${col}1f` }}>
        <i className={`fa-solid ${icon}`} />
      </div>
      <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
        <strong style={{ color: T.text, display: "block", marginBottom: 2 }}>{titulo}</strong>
        {children}
      </div>
    </div>
  );
}
