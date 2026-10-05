"use client";

/**
 * Laboratorio 3D — Sistemas de ecuaciones lineales 2×2.
 * Práctica experimental para PM-II-P05-A2.
 *
 * El plano cartesiano es el piso y cada ecuación es una recta. Resolver el
 * sistema es hallar el punto donde se cruzan. El estudiante elige una situación
 * (real o uno de los tres casos) e INCLINA la segunda recta con un deslizador
 * para descubrir cuándo hay:
 *   · 1 solución   (rectas que se cruzan)        → se levanta una columna,
 *   · sin solución (rectas paralelas)            → nada se levanta,
 *   · infinitas    (rectas coincidentes)         → toda la recta brilla.
 * Experimento central: la pendiente m₂ se acerca a m₁ y el cruce se aleja hasta
 * desaparecer; un medidor muestra la diferencia de pendientes (D = 0 ⇒ sin cruce).
 * Pensamiento Matemático II — Introducción al Álgebra (MCCEMS 2025).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { SISTEMAS_FICHA } from "./sistemas-ecuaciones-2x2-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { RETO_A2 } from "./sistemas-ecuaciones-2x2-data";
import { LabSfx } from "./lab-audio";
import {
  ESCENARIOS,
  pendiente,
  ordenada,
  resolver,
  dentro,
  eqStr,
  fmtNum,
  CASO_LABEL,
  PEND_MIN,
  PEND_MAX,
  PEND_STEP,
  type Escenario,
  type Caso,
} from "./sistemas-data";

const SistemasScene = dynamic(() => import("./SistemasScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-diagram-project fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const R2_COL = "#5EE6C5"; // recta 2
const SOL_COL = "#FFD166"; // solución / cruce

const CASO_ICON: Record<Caso, string> = {
  unica: "fa-circle-dot",
  paralelas: "fa-equals",
  coincidentes: "fa-clone",
};

/** Nombre corto de cada escenario para la barra de modos. */
const CORTO: Record<string, string> = {
  granja: "Gallinas",
  dulces: "Paletas",
  monedas: "Monedas",
  "caso-unica": "Se cruzan",
  "caso-paralelas": "Paralelas",
  "caso-coincidentes": "Coincidentes",
};

/** y = m·x + i en texto legible. */
const rectaStr = (m: number, i: number) => {
  const mp = Math.abs(m) === 1 ? "" : fmtNum(Math.abs(m));
  const signoM = m < 0 ? "−" : "";
  const termX = m === 0 ? "" : `${signoM}${mp}x`;
  if (i === 0) return `y = ${termX || "0"}`;
  const signoI = i < 0 ? "−" : "+";
  return `y = ${termX} ${signoI} ${fmtNum(Math.abs(i))}`;
};

const RETO_KEY = "cen-sistemas-ecuaciones-2x2-reto";

export function LabSistemas({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [escKey, setEscKey] = useState(ESCENARIOS[0]!.key);
  const esc = useMemo<Escenario>(() => ESCENARIOS.find((e) => e.key === escKey) ?? ESCENARIOS[0]!, [escKey]);

  const [m2, setM2] = useState(pendiente(ESCENARIOS[0]!.r2));
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);
  const [playing, setPlaying] = useState(false);

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

  // seguimiento de objetivos
  const [movioPendiente, setMovioPendiente] = useState(false);
  const [rompioCruce, setRompioCruce] = useState(false);
  const [casosVistos, setCasosVistos] = useState<Set<Caso>>(() => new Set<Caso>([ESCENARIOS[0]!.casoBase]));

  const m1 = useMemo(() => pendiente(esc.r1), [esc]);
  const i1 = useMemo(() => ordenada(esc.r1), [esc]);
  const i2 = useMemo(() => ordenada(esc.r2), [esc]);

  const sol = useMemo(() => resolver(m1, i1, m2, i2), [m1, i1, m2, i2]);
  const m2Base = useMemo(() => pendiente(esc.r2), [esc]);

  const registrarCaso = (c: Caso) =>
    setCasosVistos((prev) => (prev.has(c) ? prev : new Set(prev).add(c)));

  const elegir = (key: string) => {
    const e = ESCENARIOS.find((x) => x.key === key);
    if (!e) return;
    setPlaying(false);
    setEscKey(e.key);
    const nm2 = pendiente(e.r2);
    setM2(nm2);
    registrarCaso(resolver(pendiente(e.r1), ordenada(e.r1), nm2, ordenada(e.r2)).caso);
  };

  const moverPendiente = (v: number) => {
    setM2(v);
    setMovioPendiente(true);
    if (sonido) audioRef.current?.blip();
    const c = resolver(m1, i1, v, i2).caso;
    if (c !== "unica") setRompioCruce(true);
    registrarCaso(c);
  };

  // Barrido automático de la pendiente de la 2ª recta (de ida y vuelta).
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = 0;
    let dir = 1;
    let v = m2Base;
    const tick = (ts: number) => {
      if (last === 0) last = ts;
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      v += dir * dt * (PEND_MAX - PEND_MIN) * 0.12;
      if (v >= PEND_MAX) { v = PEND_MAX; dir = -1; }
      else if (v <= PEND_MIN) { v = PEND_MIN; dir = 1; }
      const q = Math.round(v / PEND_STEP) * PEND_STEP;
      setM2(q);
      setMovioPendiente(true);
      const c = resolver(m1, i1, q, i2).caso;
      if (c !== "unica") setRompioCruce(true);
      setCasosVistos((prev) => (prev.has(c) ? prev : new Set(prev).add(c)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, m1, i1, i2, m2Base]);

  const reset = () => {
    setPlaying(false);
    setM2(m2Base);
    setResetNonce((n) => n + 1);
  };

  const modificada = Math.abs(m2 - m2Base) > 1e-9;
  const solVisible = sol.caso === "unica" && sol.x != null && sol.y != null && dentro(sol.x, sol.y, esc.ventana);

  const colorCaso = sol.caso === "unica" ? SOL_COL : sol.caso === "coincidentes" ? SOL_COL : R2_COL;
  const dif = Math.abs(m1 - m2);

  const objetivos = [
    { txt: "Inclina la segunda recta y observa el cruce", done: movioPendiente },
    { txt: "Iguala m₂ a la pendiente de la 1ª recta: el cruce desaparece", done: rompioCruce },
    { txt: "Encuentra una solución única (se cruzan)", done: casosVistos.has("unica") },
    { txt: "Logra rectas paralelas (sin solución)", done: casosVistos.has("paralelas") },
    { txt: "Logra rectas coincidentes (infinitas)", done: casosVistos.has("coincidentes") },
    { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${esc.icono}`} />
      </div>
      <div style={{ fontSize: 20, fontWeight: 900, color: T.text }}>{CASO_LABEL[sol.caso]}</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: dos rectas en el plano.{" "}
        {sol.caso === "unica" && sol.x != null && sol.y != null ? (
          <>Se cruzan en <strong style={{ color: SOL_COL, ...NUM }}>({fmtNum(sol.x)}, {fmtNum(sol.y)})</strong>.</>
        ) : sol.caso === "paralelas" ? (
          <>Son <strong>paralelas</strong>: nunca se tocan, así que no hay solución.</>
        ) : (
          <>Son <strong>la misma recta</strong>: se tocan en todos sus puntos (infinitas soluciones).</>
        )}
      </div>
    </div>
  );

  const lecturaCorta =
    sol.caso === "unica" && sol.x != null && sol.y != null ? (
      <>Se cruzan en ({fmtNum(sol.x)}, {fmtNum(sol.y)}){solVisible ? "" : " (fuera de la vista)"}</>
    ) : sol.caso === "paralelas" ? (
      <>Paralelas: nunca se cruzan, sin solución</>
    ) : (
      <>Misma recta: infinitas soluciones</>
    );

  const etiqueta2 = modificada ? rectaStr(m2, i2) : eqStr(esc.r2);

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <SistemasScene
            win={esc.ventana}
            l1={{ m: m1, i: i1 }}
            l2={{ m: m2, i: i2 }}
            sol={sol}
            accent={accent}
            autoRotate={autoRotate}
            resetNonce={resetNonce}
            etiquetas={{
              r1: eqStr(esc.r1),
              r2: etiqueta2,
              cruce: sol.caso === "unica" && sol.x != null && sol.y != null ? `(${fmtNum(sol.x)}, ${fmtNum(sol.y)})` : undefined,
            }}
          />
        </SceneBoundary>
      }
      modos={{
        opciones: ESCENARIOS.map((e) => ({ id: e.key, etiqueta: CORTO[e.key] ?? e.titulo, icono: e.icono })),
        valor: escKey,
        cambiar: elegir,
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono={playing ? "fa-pause" : "fa-play"} titulo={playing ? "Pausar" : "Barrer la pendiente de la 2ª recta"} activo={playing} onClick={() => setPlaying((p) => !p)} />
          <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar automáticamente" activo={autoRotate} onClick={() => setAutoRotate((v) => !v)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar la 2ª recta" onClick={reset} />
        </>
      }
      leyenda={
        <>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.text2 }}>Diferencia de pendientes</div>
          <div style={{ width: 180, height: 10, borderRadius: 6, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
            <div style={{ width: `${Math.min(100, (dif / 6) * 100)}%`, height: "100%", background: dif < 1e-9 ? R2_COL : SOL_COL, transition: "width 120ms linear" }} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 900, color: colorCaso, maxWidth: 190 }}>
            {dif < 1e-9 ? "m₁ = m₂: no hay cruce único" : `|m₁ − m₂| = ${fmtNum(dif)}: se cruzan`}
          </div>
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
              <Bloque titulo={esc.titulo} icono={esc.icono}>
                <p style={{ margin: 0, color: T.text2 }}>{esc.contexto}</p>
                <Deslizador
                  label="Pendiente m₂ de la 2ª recta" icon="fa-chart-line" colr={R2_COL} valor={fmtNum(m2)}
                  min={PEND_MIN} max={PEND_MAX} step={PEND_STEP} value={m2}
                  onChange={(v) => { setPlaying(false); moverPendiente(v); }}
                  hintL={fmtNum(PEND_MIN)} hintR={fmtNum(PEND_MAX)}
                />
                <p style={{ margin: 0, color: T.text2 }}>
                  Pendiente de la 1ª recta: <strong style={{ color: accent }}>{fmtNum(m1)}</strong>. Acerca m₂ a ese valor y mira cómo el cruce se aleja.
                </p>
              </Bloque>

              <Bloque titulo="La solución" icono="fa-crosshairs">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="Caso" value={CASO_LABEL[sol.caso]} col={colorCaso} />
                  <Dato label="Recta 2" value={modificada ? "Modificada" : "Original"} col={R2_COL} />
                  <Dato label={esc.xNombre} value={solVisible && sol.x != null ? fmtNum(sol.x) : "—"} col={accent} />
                  <Dato label={esc.yNombre} value={solVisible && sol.y != null ? fmtNum(sol.y) : "—"} col={R2_COL} />
                </div>
                <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: `1px solid ${colorCaso}55`, background: `${colorCaso}14`, color: T.text }}>
                  <i className={`fa-solid ${CASO_ICON[sol.caso]}`} style={{ color: colorCaso, marginRight: 8 }} aria-hidden />
                  {sol.caso === "unica" ? (
                    <>Pendientes <strong>distintas</strong>: las rectas se cruzan en un solo punto, la <strong style={{ color: SOL_COL }}>solución única</strong>.</>
                  ) : sol.caso === "paralelas" ? (
                    <>Misma pendiente, distinta altura: <strong style={{ color: R2_COL }}>paralelas</strong>. Ningún (x, y) cumple las dos: <strong>sin solución</strong>.</>
                  ) : (
                    <>Es <strong style={{ color: SOL_COL }}>la misma recta</strong>: cualquier punto cumple las dos, hay <strong>infinitas soluciones</strong>.</>
                  )}
                </p>
                {sol.caso === "unica" && !solVisible && (
                  <p style={{ margin: 0, color: T.text2 }}>
                    <i className="fa-solid fa-arrows-left-right-to-line" style={{ marginRight: 7, color: SOL_COL }} aria-hidden />
                    Hay solución, pero el cruce queda fuera de la vista. Acerca m₂ a m₁ para verlo entrar y luego desaparecer.
                  </p>
                )}
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
              <Bloque titulo="Qué es resolver un sistema" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>
                  Resolver un sistema 2×2 es <strong style={{ color: T.text }}>buscar dónde se cruzan dos rectas</strong>. Hay tres finales: se cruzan <strong style={{ color: SOL_COL }}>(1 solución)</strong>, van paralelas <strong style={{ color: R2_COL }}>(ninguna)</strong> o son la misma recta <strong style={{ color: SOL_COL }}>(infinitas)</strong>.
                </p>
                <p style={{ margin: 0, color: T.text2 }}>{esc.porque}</p>
              </Bloque>
              <Bloque titulo="Métodos para resolverlo" icono="fa-list-check">
                <div style={{ display: "grid", gap: 8, color: T.text2 }}>
                  <div><strong style={{ color: T.text }}>Gráfico:</strong> dibujar las dos rectas y leer el punto donde se cruzan (lo que haces aquí).</div>
                  <div><strong style={{ color: T.text }}>Sustitución:</strong> despejar una variable en una ecuación y meterla en la otra.</div>
                  <div><strong style={{ color: T.text }}>Igualación:</strong> despejar la misma variable en ambas e igualar los resultados.</div>
                  <div><strong style={{ color: T.text }}>Eliminación:</strong> sumar o restar las ecuaciones para cancelar una variable.</div>
                </div>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={SISTEMAS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}
