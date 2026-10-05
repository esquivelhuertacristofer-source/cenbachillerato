"use client";

/**
 * Laboratorio 3D — "Diagrama de cuerpo libre: las leyes de Newton".
 * Práctica experimental para CNEYT-V-P01-A2 (simulacion "Simulación de fuerzas:
 * diagrama de cuerpo libre interactivo"; progresión 1, UAC CNEYT-V "La energía en
 * procesos de vida diaria").
 *
 * El alumno elige un escenario (caja en plano horizontal, caja en plano inclinado
 * a θ, o sistema con polea) y ve el DIAGRAMA DE CUERPO LIBRE en 3D: el objeto
 * aislado con TODAS sus fuerzas (peso, normal, fricción, tensión) dibujadas como
 * flechas a escala. Mueve masa, ángulo, fuerza aplicada y coeficientes de fricción
 * y observa cuándo ΣF = 0 (equilibrio, 1ª ley) y cuándo ΣF ≠ 0 → a = ΣF/m (2ª ley).
 * Toda la física es de cálculo cerrado con g = 9.81 m/s².
 */

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { NEWTON_FICHA } from "./dcl-leyes-newton-ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { QUIZ_A2 } from "./dcl-leyes-newton-data";
import { LabSfx } from "./lab-audio";
import {
  resolver, escenario, ESCENARIOS,
  M_MIN, M_MAX, F_MIN, F_MAX, TH_MIN, TH_MAX, MU_MIN, MU_MAX,
  M_DEF, F_DEF, TH_DEF, M1_DEF, M2_DEF, MUS_DEF, MUK_DEF,
  PASOS, IDEAS, DATOS, REFLEXION, fmt0, fmt1, fmt2, anguloCritico,
  type Modo,
} from "./newton-data";


/** Clave de la mejor marca de este laboratorio. */
const RETO_KEY = "cen-dcl-leyes-newton-reto";

const NewtonScene = dynamic(() => import("./NewtonScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-arrows-up-down-left-right fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Dibujando las fuerzas…</span>
    </div>
  ),
});

const C_PESO = "#f87171";
const C_NORM = "#34D399";
const C_FRIC = "#fb923c";
const C_APLI = "#C084FC";
const C_TENS = "#fbbf24";
const C_NETO = "#7dd3fc";

export function LabNewton({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("inclinado"); // arranca en el plano a 30° (verbatim)
  const [m, setM] = useState<number>(M_DEF);
  const [F, setF] = useState<number>(F_DEF);
  const [theta, setTheta] = useState<number>(TH_DEF);
  const [m1, setM1] = useState<number>(M1_DEF);
  const [m2, setM2] = useState<number>(M2_DEF);
  const [muS, setMuS] = useState<number>(MUS_DEF);
  const [muK, setMuK] = useState<number>(MUK_DEF);
  const [playing, setPlaying] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  const [sonido, setSonido] = useState(false);
  const [componentes, setComponentes] = useState(false);
  // Experimento clave: ¿el alumno cruzó el umbral (quieta ↔ desliza) con θ a ±1° de arctan μs?
  const [umbralHallado, setUmbralHallado] = useState(false);
  const [prevEstado, setPrevEstado] = useState<{ modo: Modo; mueve: boolean } | null>(null);
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

  // Animación: barre la variable "motriz" del escenario de ida y vuelta.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = 0;
    let dir = 1;
    const tick = (ts: number) => {
      if (last === 0) last = ts;
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      if (modo === "horizontal") {
        const span = F_MAX - F_MIN;
        setF((prev) => {
          let next = prev + dir * dt * span * 0.28;
          if (next <= F_MIN) { next = F_MIN; dir = 1; }
          else if (next >= F_MAX) { next = F_MAX; dir = -1; }
          return next;
        });
      } else if (modo === "inclinado") {
        const span = TH_MAX - TH_MIN;
        setTheta((prev) => {
          let next = prev + dir * dt * span * 0.28;
          if (next <= TH_MIN) { next = TH_MIN; dir = 1; }
          else if (next >= TH_MAX) { next = TH_MAX; dir = -1; }
          return next;
        });
      } else {
        const span = M_MAX - M_MIN;
        setM2((prev) => {
          let next = prev + dir * dt * span * 0.28;
          if (next <= M_MIN) { next = M_MIN; dir = 1; }
          else if (next >= M_MAX) { next = M_MAX; dir = -1; }
          return next;
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, modo]);

  const bump = () => setResetNonce((n) => n + 1);
  const cambiarModo = (nm: Modo) => { setPlaying(false); setModo(nm); bump(); if (sonido) audioRef.current?.blip(); };
  const reset = () => {
    setPlaying(false);
    setM(M_DEF); setF(F_DEF); setTheta(TH_DEF);
    setM1(M1_DEF); setM2(M2_DEF); setMuS(MUS_DEF); setMuK(MUK_DEF);
    bump();
  };

  // mantener μk ≤ μs (físicamente la cinética no supera a la estática)
  const setMuSafe = (s: number) => { setMuS(s); if (muK > s) setMuK(s); };
  const setMuKSafe = (k: number) => { setMuK(Math.min(k, muS)); };

  const info = escenario(modo);
  const d = resolver(modo, { m, F, theta, m1, m2, muS, muK });
  const thetaC = anguloCritico(muS);

  // Ajuste durante el render (patrón de React): detecta el cambio quieta ↔ desliza.
  if (!prevEstado || prevEstado.modo !== modo || prevEstado.mueve !== d.mueve) {
    setPrevEstado({ modo, mueve: d.mueve });
    if (prevEstado && prevEstado.modo === modo && modo === "inclinado" && Math.abs(theta - thetaC) <= 1) {
      setUmbralHallado(true);
    }
  }

  // lectura en vivo según el estado del DCL
  let lectura: string;
  if (!d.mueve) {
    if (modo === "horizontal") lectura = `ΣF = 0: la fricción estática (hasta f_s,máx = ${fmt0(d.fsMax)} N) equilibra a F = ${fmt0(F)} N. El cuerpo NO arranca (1ª ley).`;
    else if (modo === "inclinado") lectura = `ΣF = 0: la fricción estática (hasta f_s,máx = ${fmt0(d.fsMax)} N) sostiene el peso a favor del plano (${fmt0(d.aplicada)} N). La caja NO desliza.`;
    else lectura = `ΣF = 0: el peso colgante m₂·g = ${fmt0(d.aplicada)} N no supera f_s,máx = ${fmt0(d.fsMax)} N. El sistema NO se mueve.`;
  } else {
    lectura = `ΣF = ${fmt0(d.neto)} N ≠ 0 → a = ΣF/m = ${fmt1(d.a)} m/s² (2ª ley). La fricción cinética f_k = ${fmt0(d.fric)} N se opone al movimiento.`;
  }

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-arrows-up-down-left-right" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>ΣF = m·a</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la idea sigue: aísla el objeto, dibuja todas las fuerzas y súmalas. Si ΣF = 0 hay equilibrio (a = 0); si no, acelera con a = ΣF/m. Ahora mismo: a = {fmt1(d.a)} m/s².
      </div>
    </div>
  );

  // Lo corto va sobre la escena; la frase completa, en el panel.
  const lecturaCorta = d.mueve
    ? <>ΣF = {fmt0(d.neto)} N → a = {fmt1(d.a)} m/s²</>
    : <>Equilibrio: ΣF = 0 → no se mueve</>;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <NewtonScene componentes={componentes} modo={modo} m={m} F={F} theta={theta} m1={m1} m2={m2} muS={muS} muK={muK} accent={accent} resetNonce={resetNonce} />
        </SceneBoundary>
      }
      modos={{
        opciones: ESCENARIOS.map((e) => ({ id: e.modo, etiqueta: e.etiqueta, icono: e.icono })),
        valor: modo,
        cambiar: (id) => cambiarModo(id as Modo),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono={playing ? "fa-pause" : "fa-play"} titulo={playing ? "Pausar" : "Barrer la variable del escenario"} activo={playing} onClick={() => setPlaying((p) => !p)} />
          {modo === "inclinado" && (
            <BotonHerramienta icono="fa-code-branch" titulo={componentes ? "Ocultar componentes del peso" : "Ver componentes del peso"} activo={componentes} onClick={() => setComponentes((c) => !c)} />
          )}
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reset} />
        </>
      }
      leyenda={
        <>
          <LegItem col={C_PESO} txt="peso W" />
          <LegItem col={C_NORM} txt="normal N" />
          <LegItem col={C_FRIC} txt="fricción f" />
          {modo === "horizontal" && <LegItem col={C_APLI} txt="aplicada F" />}
          {modo === "polea" && <LegItem col={C_TENS} txt="tensión T" />}
          <LegItem col={C_NETO} txt="neta ΣF" />
          <MedidorUmbral d={d} modo={modo} compacto />
        </>
      }
      lectura={lecturaCorta}
      objetivos={[
        { txt: "Encuentra el ángulo exacto en que la caja empieza a deslizar", done: umbralHallado, modo: "inclinado" },
        { txt: "Analiza el plano inclinado: el peso se reparte en dos componentes", done: modo === "inclinado", modo: "inclinado" },
        { txt: "Pasa al plano horizontal y al sistema de polea", done: modo === "horizontal" || modo === "polea", modo: ["horizontal", "polea"] },
        { txt: "Consigue el equilibrio: ΣF = 0 y el cuerpo no acelera", done: !d.mueve },
        { txt: "Rompe el equilibrio: ΣF ≠ 0 y aparece la aceleración a = ΣF/m", done: d.mueve },
        { txt: "Resuelve el reto evaluable de la actividad", done: ejercicioAprobado },
      ]}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <Bloque titulo={info.titulo} icono={info.icono}>
                {modo === "horizontal" && (
                  <>
                    <Deslizador label="masa m" icon="fa-cube" colr="#38bdf8" valor={`${fmt1(m)} kg`} min={M_MIN} max={M_MAX} step={0.1} value={m} onChange={(v) => { setPlaying(false); setM(v); }} />
                    <Deslizador label="fuerza aplicada F" icon="fa-hand-point-right" colr={C_APLI} valor={`${fmt0(F)} N`} min={F_MIN} max={F_MAX} step={0.5} value={F} onChange={(v) => { setPlaying(false); setF(v); }} />
                  </>
                )}
                {modo === "inclinado" && (
                  <>
                    <Deslizador label="masa m" icon="fa-cube" colr="#38bdf8" valor={`${fmt1(m)} kg`} min={M_MIN} max={M_MAX} step={0.1} value={m} onChange={(v) => { setPlaying(false); setM(v); }} />
                    <Deslizador label="ángulo del plano θ" icon="fa-mountain" colr="#facc15" valor={`${fmt0(theta)}°`} min={TH_MIN} max={TH_MAX} step={1} value={theta} onChange={(v) => { setPlaying(false); setTheta(v); }} />
                  </>
                )}
                {modo === "polea" && (
                  <>
                    <Deslizador label="masa en la mesa m₁" icon="fa-cube" colr="#38bdf8" valor={`${fmt1(m1)} kg`} min={M_MIN} max={M_MAX} step={0.1} value={m1} onChange={(v) => { setPlaying(false); setM1(v); }} />
                    <Deslizador label="masa colgante m₂" icon="fa-weight-hanging" colr="#a78bfa" valor={`${fmt1(m2)} kg`} min={M_MIN} max={M_MAX} step={0.1} value={m2} onChange={(v) => { setPlaying(false); setM2(v); }} />
                  </>
                )}
                <Deslizador label="fricción estática μs" icon="fa-shoe-prints" colr={C_FRIC} valor={fmt2(muS)} min={MU_MIN} max={MU_MAX} step={0.01} value={muS} onChange={(v) => { setPlaying(false); setMuSafe(v); }} />
                <Deslizador label="fricción cinética μk (≤ μs)" icon="fa-shoe-prints" colr="#fdba74" valor={fmt2(muK)} min={MU_MIN} max={MU_MAX} step={0.01} value={muK} onChange={(v) => { setPlaying(false); setMuKSafe(v); }} />
              </Bloque>

              <Bloque titulo="El umbral: ¿se sostiene o desliza?" icono="fa-scale-unbalanced">
                <MedidorUmbral d={d} modo={modo} />
                {modo === "inclinado" && (
                  <p style={{ margin: 0, color: T.text2 }}>
                    Sube θ poco a poco y mira cuándo la barra del empuje alcanza a la de la fricción: ahí tan θ = μs.
                    {umbralHallado
                      ? <> ¡Lo encontraste! Con μs = {fmt2(muS)} el ángulo crítico es θc = arctan({fmt2(muS)}) = <strong style={{ color: "#fff" }}>{fmt1(thetaC)}°</strong>.</>
                      : <> Ahora θ = {fmt0(theta)}°.</>}
                  </p>
                )}
              </Bloque>

              <Bloque titulo="Las fuerzas ahora" icono="fa-vector-square">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="peso W" value={`${fmt1(d.W)} N`} col={C_PESO} />
                  <Dato label="normal N" value={`${fmt1(d.N)} N`} col={C_NORM} />
                  <Dato label="fricción f" value={`${fmt1(d.fric)} N`} col={C_FRIC} />
                  {modo === "polea"
                    ? <Dato label="tensión T" value={`${fmt1(d.T ?? 0)} N`} col={C_TENS} />
                    : modo === "horizontal"
                      ? <Dato label="aplicada F" value={`${fmt1(F)} N`} col={C_APLI} />
                      : <Dato label="mg·senθ" value={`${fmt1(d.Wpar ?? 0)} N`} col={C_APLI} />}
                  {modo === "inclinado" && <Dato label="mg·cosθ" value={`${fmt1(d.Wperp ?? 0)} N`} col={C_NORM} />}
                  {modo === "inclinado" && <Dato label="masa m" value={`${fmt1(m)} kg`} col="#38bdf8" />}
                  <Dato label="neta ΣF" value={`${fmt1(d.neto)} N`} col={C_NETO} />
                  <Dato label="aceleración a" value={`${fmt2(d.a)} m/s²`} col={d.mueve ? C_NETO : C_NORM} />
                </div>
                <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: `1px solid ${(d.mueve ? C_NETO : C_NORM)}55`, background: `${(d.mueve ? C_NETO : C_NORM)}12` }}>
                  {lectura}
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
            <RetoQuizCard
              quiz={QUIZ_A2}
              accent={accent}
              rgba={color.rgba}
              aprobado={ejercicioAprobado}
              onAprobado={() => setEjercicioAprobado(true)}
              playSfx={sonido ? (ok) => { if (ok) audioRef.current?.correcto(); else audioRef.current?.incorrecto(); } : undefined}
              playPick={sonido ? () => audioRef.current?.blip() : undefined}
            />
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="El modelo de este escenario" icono={info.icono}>
                {info.modelo.map((eq, i) => <ExprRow key={i} col={accent} txt={eq} />)}
                <p style={{ margin: 0, color: T.text2 }}>
                  Si la fuerza motriz no supera <strong style={{ color: "#fff" }}>f_s,máx = μ_s·N</strong>, el cuerpo queda en <strong style={{ color: C_NORM }}>equilibrio</strong> (ΣF = 0, a = 0). Al superarla, manda la cinética f_k = μ_k·N.
                </p>
              </Bloque>
              <Bloque titulo="El DCL paso a paso" icono="fa-list-ol">
                <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
                  {PASOS.map((p) => <li key={p.etiqueta}>{p.texto}</li>)}
                </ol>
              </Bloque>
              <Bloque titulo="Ideas clave" icono="fa-lightbulb">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {IDEAS.map((x, i) => <li key={i}>{x}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Para pensar" icono="fa-circle-question">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {REFLEXION.map((q, i) => <li key={i}>{q}</li>)}
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
                <FichaTeorica data={NEWTON_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3 }}>
                Física exacta con g = 9.81 m/s²: poleas y cuerdas ideales, cuerda inextensible y fricción de Coulomb. El largo de cada flecha es proporcional a la fuerza, así que se pueden comparar entre sí. Los tres escenarios son verbatim del enunciado A2.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}

/* ── Medidor del umbral: lo que empuja vs lo máximo que la estática aguanta ─── */
function MedidorUmbral({ d, modo, compacto = false }: { d: ReturnType<typeof resolver>; modo: Modo; compacto?: boolean }) {
  const etiquetaEmpuje = modo === "horizontal" ? "F aplicada" : modo === "inclinado" ? "mg·senθ" : "m₂·g";
  const tope = Math.max(d.aplicada, d.fsMax, 1) * 1.1;
  const col = d.mueve ? C_NETO : C_NORM;
  const barra = (txt: string, val: number, c: string) => (
    <div style={{ display: "grid", gap: 3 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: compacto ? 12 : 13.5, fontWeight: 800, color: "#dce6f5" }}>
        <span>{txt}</span><span style={{ fontFamily: "ui-monospace, monospace" }}>{fmt1(val)} N</span>
      </div>
      <div style={{ height: compacto ? 8 : 12, borderRadius: 6, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
        <div style={{ width: `${Math.min(100, (val / tope) * 100)}%`, height: "100%", background: c, transition: "width 120ms linear, background 120ms linear" }} />
      </div>
    </div>
  );
  return (
    <div style={{ display: "grid", gap: compacto ? 6 : 10, width: compacto ? 176 : undefined, marginTop: compacto ? 4 : 0 }}>
      {barra(etiquetaEmpuje, d.aplicada, d.mueve ? C_NETO : C_APLI)}
      {barra("f_s,máx = μs·N", d.fsMax, C_FRIC)}
      <div style={{ fontSize: compacto ? 12 : 13.5, fontWeight: 900, color: col }}>
        {d.mueve ? "Empuje > f_s,máx: DESLIZA" : "Empuje ≤ f_s,máx: se sostiene"}
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
function LegItem({ col, txt }: { col: string; txt: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>
      <span style={{ width: 18, height: 0, borderTop: `3px solid ${col}`, flexShrink: 0 }} />
      {txt}
    </div>
  );
}
