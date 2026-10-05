"use client";

/**
 * Laboratorio 3D — Ecuaciones cuadráticas: tres métodos y el discriminante.
 * Práctica experimental para PM-III-P02-A2 (progresión 2).
 *
 * El alumno mueve los coeficientes a, b, c y ve la parábola y = ax²+bx+c como
 * un "valle" sobre el "agua" (y = 0): las raíces de ax²+bx+c=0 son donde el
 * valle toca el agua. Experimento central: subir c con a>0 hace que el valle se
 * despegue del agua; las dos raíces se juntan, se vuelven una (Δ=0) y desaparecen
 * (Δ<0), con un medidor del discriminante que cruza el umbral Δ=0. En vivo se
 * calculan Δ = b²−4ac, el número de soluciones reales, el vértice y las tres
 * formas de resolver (factorización, completar el cuadrado y fórmula general).
 * Incluye el caso verbatim del terreno del agricultor (2w²+5w−133=0 → w=7 m, l=19 m).
 * Pensamiento Matemático III — ecuaciones cuadráticas (MCCEMS 2025).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { CUADRATICA_FICHA } from "./ecuacion-cuadratica-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { RETO_A2 } from "./ecuacion-cuadratica-data";
import { LabSfx } from "./lab-audio";
import {
  EJEMPLOS, METODOS, CASO_AGRICULTOR,
  discriminante, resolver, vertice, polinomio, fmt, fmtCoef,
  A_MIN, A_MAX, A_STEP, A_DEFAULT,
  B_MIN, B_MAX, B_STEP, B_DEFAULT,
  C_MIN, C_MAX, C_STEP, C_DEFAULT,
} from "./cuadratica-data";

const CuadraticaScene = dynamic(() => import("./CuadraticaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-superscript fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const AZUL = "#3aa0ff";
const AMBAR = "#ffd24a";
const ROSA = "#ff7ad9";
const VERDE = "#34D399";

const RETO_KEY = "cen-ecuacion-cuadratica-reto";

/** Rango del discriminante con los coeficientes del laboratorio (para el medidor). */
const DISC_MIN = -(4 * Math.max(Math.abs(A_MIN), A_MAX) * Math.max(Math.abs(C_MIN), C_MAX));
const DISC_MAX = Math.max(Math.abs(B_MIN), B_MAX) ** 2 + 4 * Math.max(Math.abs(A_MIN), A_MAX) * Math.max(Math.abs(C_MIN), C_MAX);

export function LabCuadratica({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [a, setA] = useState(A_DEFAULT);
  const [b, setB] = useState(B_DEFAULT);
  const [c, setC] = useState(C_DEFAULT);
  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [barriendo, setBarriendo] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

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

  // objetivos
  const [vioDos, setVioDos] = useState(false);
  const [vioUna, setVioUna] = useState(false);
  const [vioNinguna, setVioNinguna] = useState(false);
  const [vioCaso, setVioCaso] = useState(false);
  const [cruzoUmbral, setCruzoUmbral] = useState(false); // movió c y cambió el número de raíces

  const bump = () => setResetNonce((n) => n + 1);

  const aSeguro = (v: number) => (v === 0 ? (a >= 0 ? 1 : -1) : v); // a ≠ 0

  const disc = useMemo(() => discriminante(a, b, c), [a, b, c]);
  const raices = useMemo(() => resolver(a, b, c), [a, b, c]);
  const v = useMemo(() => vertice(a, b, c), [a, b, c]);
  const poli = useMemo(() => polinomio(a, b, c), [a, b, c]);

  // marca objetivos según el tipo de solución actual
  if (raices.tipo === "dos" && !vioDos) setVioDos(true);
  if (raices.tipo === "una" && !vioUna) setVioUna(true);
  if (raices.tipo === "ninguna" && !vioNinguna) setVioNinguna(true);

  // c mueve el valle: si al moverla cambia el número de raíces, el alumno cruzó el umbral Δ = 0
  const cambiarC = useCallback((nc: number) => {
    const antes = resolver(a, b, c).tipo;
    const despues = resolver(a, b, nc).tipo;
    if (antes !== despues && antes !== "no_cuadratica") setCruzoUmbral(true);
    setC(nc);
  }, [a, b, c]);

  // Barrido: c recorre su rango de ida y vuelta para ver nacer y morir las raíces.
  const dirRef = useRef(1);
  useEffect(() => {
    if (!barriendo) return;
    let raf = 0;
    let last = 0;
    const tick = (ts: number) => {
      if (last === 0) last = ts;
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      setC((prev) => {
        let next = prev + dirRef.current * dt * (C_MAX - C_MIN) * 0.12;
        if (next <= C_MIN) { next = C_MIN; dirRef.current = 1; }
        else if (next >= C_MAX) { next = C_MAX; dirRef.current = -1; }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [barriendo]);

  // durante el barrido el número de raíces cambia solo: cuenta como cruce del umbral
  const [tipoPrevio, setTipoPrevio] = useState(raices.tipo);
  if (tipoPrevio !== raices.tipo) {
    setTipoPrevio(raices.tipo);
    if (barriendo && tipoPrevio !== "no_cuadratica" && raices.tipo !== "no_cuadratica") setCruzoUmbral(true);
  }

  const cargar = (na: number, nb: number, nc: number) => {
    setBarriendo(false);
    setA(aSeguro(na)); setB(nb); setC(nc); bump();
  };
  const cargarCaso = () => {
    cargar(CASO_AGRICULTOR.a, CASO_AGRICULTOR.b, CASO_AGRICULTOR.c);
    setVioCaso(true);
    if (sonido) audioRef.current?.blip();
  };
  const reset = () => cargar(A_DEFAULT, B_DEFAULT, C_DEFAULT);

  // texto del estado de las soluciones
  const estado = useMemo(() => {
    if (raices.tipo === "no_cuadratica") return { txt: "no es cuadrática (a = 0)", col: T.text3, n: "—" };
    if (raices.tipo === "dos") return { txt: "dos soluciones reales", col: VERDE, n: "2" };
    if (raices.tipo === "una") return { txt: "una solución (raíz doble)", col: AMBAR, n: "1" };
    return { txt: "sin soluciones reales", col: "#94a3b8", n: "0" };
  }, [raices.tipo]);

  // formas resueltas (para el panel de métodos)
  const formaFactor = useMemo(() => {
    if (raices.tipo === "dos") {
      const [r1, r2] = raices.reales;
      const fac = (r: number) => `(x ${r >= 0 ? "−" : "+"} ${fmt(Math.abs(r))})`;
      return `${a === 1 ? "" : a === -1 ? "−" : fmtCoef(a)}${fac(r1!)}${fac(r2!)} = 0`;
    }
    if (raices.tipo === "una") {
      const r = raices.reales[0]!;
      return `${a === 1 ? "" : fmtCoef(a)}(x ${r >= 0 ? "−" : "+"} ${fmt(Math.abs(r))})² = 0`;
    }
    return "no factoriza en los reales";
  }, [a, raices]);

  const formaCuadrado = useMemo(() => {
    const h = v.x; // a(x − h)² + k
    const k = v.y;
    const coef = a === 1 ? "" : fmtCoef(a);
    return `${coef}(x ${h <= 0 ? "+" : "−"} ${fmt(Math.abs(h))})² ${k >= 0 ? "+" : "−"} ${fmt(Math.abs(k))}`;
  }, [a, v]);

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-superscript" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Las raíces tocan el eje</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 410, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: las soluciones de {poli} son los puntos donde la parábola corta el eje x. El discriminante Δ = b²−4ac dice cuántos cortes hay.
      </div>
    </div>
  );

  const lectura = raices.tipo === "no_cuadratica"
    ? <>a = 0: ya no hay parábola</>
    : <>Δ = {fmtCoef(disc)} → {estado.txt}</>;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <CuadraticaScene a={a} b={b} c={c} accent={accent} pausado={pausado} autoRotate={autoRotate} resetNonce={resetNonce} />
        </SceneBoundary>
      }
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono={barriendo ? "fa-stop" : "fa-play"} titulo={barriendo ? "Detener el barrido de c" : "Barrer c y ver nacer y morir las raíces"} activo={barriendo} onClick={() => setBarriendo((x) => !x)} />
          <BotonHerramienta icono={pausado ? "fa-play" : "fa-pause"} titulo={pausado ? "Reanudar los marcadores" : "Pausar los marcadores"} activo={!pausado} onClick={() => setPausado((p) => !p)} />
          <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar la cámara" activo={autoRotate} onClick={() => setAutoRotate((x) => !x)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reset} />
        </>
      }
      leyenda={<MedidorDiscriminante disc={disc} col={estado.col} txt={estado.txt} compacto />}
      lectura={lectura}
      objetivos={[
        { txt: "Sube c poco a poco con a > 0: las raíces se juntan y desaparecen", done: cruzoUmbral },
        { txt: "Mira una ecuación con 2 raíces", done: vioDos },
        { txt: "Encuentra una raíz doble (Δ=0)", done: vioUna },
        { txt: "Halla un caso sin raíces (Δ<0)", done: vioNinguna },
        { txt: "Resuelve el caso del agricultor", done: vioCaso },
        { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
      ]}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <Bloque titulo="Coeficientes de ax² + bx + c" icono="fa-sliders">
                <Deslizador label="c: sube o baja el valle" icon="fa-c" colr={AMBAR}
                  valor={fmtCoef(c)} min={C_MIN} max={C_MAX} step={C_STEP} value={c}
                  onChange={(val) => { setBarriendo(false); cambiarC(val); }} hintL={`${C_MIN}`} hintR={`${C_MAX}`} />
                <Deslizador label="a: abre, cierra y orienta" icon="fa-a" colr={accent}
                  valor={fmtCoef(a)} min={A_MIN} max={A_MAX} step={A_STEP} value={a}
                  onChange={(val) => { setBarriendo(false); setA(aSeguro(val)); }} hintL="a ≠ 0" hintR={`${A_MAX}`} />
                <Deslizador label="b: desplaza el vértice" icon="fa-b" colr={ROSA}
                  valor={fmtCoef(b)} min={B_MIN} max={B_MAX} step={B_STEP} value={b}
                  onChange={(val) => { setBarriendo(false); setB(val); }} hintL={`${B_MIN}`} hintR={`${B_MAX}`} />
              </Bloque>

              <Bloque titulo="El umbral: ¿toca el agua?" icono="fa-water">
                <MedidorDiscriminante disc={disc} col={estado.col} txt={estado.txt} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="Discriminante Δ" value={fmtCoef(disc)} col={estado.col} />
                  <Dato label="Soluciones reales" value={estado.n} col={estado.col} />
                  <Dato label="Raíces (x)" value={raices.reales.length ? raices.reales.map((r) => fmt(r)).join(", ") : "—"} col={AMBAR} />
                  <Dato label="Vértice" value={`(${fmt(v.x)}, ${fmt(v.y)})`} col={ROSA} />
                </div>
                <p style={{ margin: 0, color: T.text2 }}>
                  El <strong style={{ color: estado.col }}>discriminante</strong> Δ = b² − 4ac decide todo: si es positivo hay dos raíces, si es cero una raíz doble (el vértice toca el agua) y si es negativo ninguna real. El signo de <strong style={{ color: accent }}>a</strong> dice si la parábola abre hacia arriba (a&gt;0) o hacia abajo (a&lt;0).
                </p>
              </Bloque>

              <Bloque titulo="Ejemplos para cargar" icono="fa-wand-magic-sparkles">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 8 }}>
                  {EJEMPLOS.map((e) => (
                    <button key={e.label} type="button" onClick={() => cargar(e.a, e.b, e.c)}
                      style={{ cursor: "pointer", display: "flex", flexDirection: "column", gap: 2, minWidth: 0, textAlign: "left", padding: "9px 12px", borderRadius: 12, border: `1px solid ${T.line}`, background: T.inset, color: "#fff" }}>
                      <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 14, fontWeight: 800 }}>{e.label}</span>
                      <span style={{ fontSize: 14, color: T.text3, fontWeight: 600 }}>{e.metodo}</span>
                    </button>
                  ))}
                </div>
              </Bloque>

              <Bloque titulo="Caso real: el terreno" icono="fa-ruler-combined">
                <p style={{ margin: 0, color: T.text2 }}>{CASO_AGRICULTOR.resumen}</p>
                <button type="button" onClick={cargarCaso}
                  style={{ width: "100%", cursor: "pointer", padding: "12px 14px", borderRadius: 12, border: `1px solid rgba(${color.rgba},0.5)`, background: `rgba(${color.rgba},0.16)`, color: "#fff", fontSize: 14.5, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 9 }}>
                  <i className="fa-solid fa-ruler-combined" aria-hidden />
                  Cargar {CASO_AGRICULTOR.ecuacion}
                </button>
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
              playSfx={sonido ? (ok) => { if (ok) audioRef.current?.correcto(); else audioRef.current?.incorrecto(); } : undefined}
            />
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="Los tres métodos, en vivo" icono="fa-list-check">
                <Metodo icono={METODOS[0]!.icono} nombre={METODOS[0]!.nombre} color={accent} desc={METODOS[0]!.desc} formula={formaFactor} />
                <Metodo icono={METODOS[1]!.icono} nombre={METODOS[1]!.nombre} color={ROSA} desc={METODOS[1]!.desc} formula={`${formaCuadrado} = 0`} />
                <Metodo icono={METODOS[2]!.icono} nombre={METODOS[2]!.nombre} color={AMBAR} desc={METODOS[2]!.desc} formula={`x = (−(${fmtCoef(b)}) ± √${fmtCoef(disc)}) / (2·${fmtCoef(a)})`} />
              </Bloque>
              <Bloque titulo="Idea clave" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>
                  Sube <strong style={{ color: AMBAR }}>c</strong> poco a poco con <strong style={{ color: accent }}>a&gt;0</strong>: el valle sube hasta despegarse del <strong style={{ color: AZUL }}>agua</strong> y las dos raíces se juntan, se vuelven una (Δ=0) y desaparecen (Δ&lt;0). Eso es el discriminante hecho imagen.
                </p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={CUADRATICA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

/* ── Medidor del discriminante: la aguja cruza Δ = 0 ───────────────────── */
function MedidorDiscriminante({ disc, col, txt, compacto = false }: { disc: number; col: string; txt: string; compacto?: boolean }) {
  const pos = Math.min(100, Math.max(0, ((disc - DISC_MIN) / (DISC_MAX - DISC_MIN)) * 100));
  const cero = ((0 - DISC_MIN) / (DISC_MAX - DISC_MIN)) * 100;
  return (
    <div style={{ display: "grid", gap: compacto ? 6 : 8, minWidth: compacto ? 190 : undefined }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>
        <span>Δ = b² − 4ac</span>
        <span style={{ fontFamily: "ui-monospace, monospace", color: col }}>{fmtCoef(disc)}</span>
      </div>
      <div style={{ position: "relative", height: compacto ? 12 : 16, borderRadius: 8, overflow: "hidden", background: "linear-gradient(90deg, #64748b 0%, #64748b " + cero + "%, #34D399 " + cero + "%, #34D399 100%)", opacity: 0.85 }}>
        <div style={{ position: "absolute", left: `${cero}%`, top: 0, bottom: 0, width: 3, background: "#ffd24a", transform: "translateX(-50%)" }} />
        <div style={{ position: "absolute", left: `${pos}%`, top: -2, bottom: -2, width: 6, borderRadius: 3, background: "#fff", transform: "translateX(-50%)", boxShadow: "0 0 8px rgba(0,0,0,0.6)", transition: "left 120ms linear" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#9fb2c8", fontWeight: 700 }}>
        <span>Δ &lt; 0: sin raíces</span>
        <span>Δ &gt; 0: dos</span>
      </div>
      <div style={{ fontSize: 14, fontWeight: 900, color: col }}>{txt}</div>
    </div>
  );
}

/* ── Un método con su fórmula resuelta en vivo ───────────────────────── */
function Metodo({ icono, nombre, color, desc, formula }: {
  icono: string; nombre: string; color: string; desc: string; formula: string;
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
        <div style={{ width: 30, height: 30, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color, background: `${color}22` }}>
          <i className={`fa-solid ${icono}`} />
        </div>
        <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{nombre}</span>
      </div>
      <div style={{ fontSize: 14.5, color: T.text2, lineHeight: 1.45, marginBottom: 8 }}>{desc}</div>
      <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 14.5, fontWeight: 800, color, padding: "8px 11px", borderRadius: 9, background: "rgba(255,255,255,0.04)", border: `1px solid ${color}33`, wordBreak: "break-word" }}>
        {formula}
      </div>
    </div>
  );
}
