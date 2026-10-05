"use client";

/**
 * Laboratorio 3D — Gas ideal y primera ley de la termodinámica.
 * Práctica experimental para CNEYT-II-P09-A1
 * ("Gas ideal y primera ley de la termodinámica").
 *
 * Un gas encerrado en un cilindro con pistón es un sistema cerrado. Su estado se
 * describe con P, V, T y n, relacionados por PV = nRT. El lab hace visible de
 * dónde sale la presión: las partículas chocan contra las paredes y el pistón.
 * Sube T y se mueven más rápido (↑P); baja V y chocan más seguido (↑P); mete más
 * gas (↑n) y hay más choques (↑P). La energía interna U = 3/2·n·R·T y la primera
 * ley ΔU = Q − W cierran la idea: la energía solo cambia de forma o se transfiere.
 * Ciencias Naturales, Experimentales y Tecnología II (MCCEMS 2025).
 *
 * Robustecido (máxima interactividad): el alumno se EQUIPA (EppGate), SIGUE PASOS
 * (stepper guiado), ARRASTRA el pistón en 3D para comprimir el gas (PV = nRT
 * responde en tiempo real), ve las PARTÍCULAS chocar y HACE EL CÁLCULO: predice
 * la presión con la ecuación de estado y gana estrellas (récord local).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { GAS_IDEAL_FICHA } from "./gas-ideal-piston-ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { QUIZ_A2 } from "./gas-ideal-piston-data";
import { EppGate } from "./_epp-gate";
import { LabSfx } from "./lab-audio";
import {
  presion,
  energiaInterna,
  kelvinACelsius,
  fmtNum,
  R_GAS,
  T_MIN, T_MAX, T_STEP,
  V_MIN, V_MAX, V_STEP,
  N_MIN, N_MAX, N_STEP,
  P_GAUGE_MAX,
} from "./gas-ideal-data";

const GasIdealScene = dynamic(() => import("./GasIdealScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-wind fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const T_COL = "#FF7A45"; // temperatura → cálido
const V_COL = "#3BA7FF"; // volumen → azul
const N_COL = "#34D399"; // cantidad → verde
const WARN = "#FF8A3C";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
const RETO_KEY = "cen-gas-ideal-reto";

export function LabGasIdeal({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [temp, setTemp] = useState(300); // K
  const [volumen, setVolumen] = useState(10); // L
  const [moles, setMoles] = useState(1.0); // mol
  const [pausado, setPausado] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // compuerta de equipamiento (pilar: equiparse)
  const [eppListo, setEppListo] = useState(false);

  // objetivos / pasos
  const [subioTemp, setSubioTemp] = useState(false);
  const [cambioMoles, setCambioMoles] = useState(false);
  const [pauso, setPauso] = useState(false);
  const [arrastro, setArrastro] = useState(false); // usó el arrastre del pistón
  const [predicho, setPredicho] = useState(false); // resolvió el cálculo de P
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false); // quiz A2

  // diagrama P–V en vivo (traza de puntos de operación)
  const [muestras, setMuestras] = useState<{ V: number; P: number }[]>([]);

  // récord de estrellas del reto de cálculo (persistido)
  const { mejorEstrellas, registraEstrellas: guardaEstrellas } = useEstrellas(RETO_KEY);

  // sonido
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

  // valores de estado (calculados de los controles)
  const P = useMemo(() => presion(moles, temp, volumen), [moles, temp, volumen]);
  const U = useMemo(() => energiaInterna(moles, temp), [moles, temp]);
  const tC = useMemo(() => kelvinACelsius(temp), [temp]);
  const pAtm = P / 101.325; // kPa → atm

  const bump = () => setResetNonce((n) => n + 1);

  // registra un punto (V, P) en el diagrama (limitado para no crecer sin fin)
  const registraMuestra = useCallback((v: number, n: number, t: number) => {
    const p = presion(n, t, v);
    setMuestras((prev) => {
      const last = prev[prev.length - 1];
      if (last && Math.abs(last.V - v) < 0.01 && Math.abs(last.P - p) < 0.5) return prev;
      const next = [...prev, { V: v, P: p }];
      return next.length > 90 ? next.slice(next.length - 90) : next;
    });
  }, []);

  const cambiarTemp = (v: number) => { setTemp(v); if (sonido) audioRef.current?.blip(); if (v > 300) setSubioTemp(true); registraMuestra(volumen, moles, v); };
  const cambiarVolumen = (v: number) => { setVolumen(v); registraMuestra(v, moles, temp); };
  const cambiarVolumenSlider = (v: number) => { cambiarVolumen(v); if (sonido) audioRef.current?.blip(); };
  const cambiarMoles = (v: number) => { setMoles(v); if (sonido) audioRef.current?.blip(); if (v !== 1.0) setCambioMoles(true); registraMuestra(volumen, v, temp); };
  // el pistón arrastrado en 3D entra por aquí
  const onArrastrePiston = useCallback((v: number) => {
    setArrastro(true);
    setVolumen(v);
   
    registraMuestra(v, moles, temp);
  }, [moles, temp, registraMuestra]);

  const togglePausa = () => { setPausado((p) => { if (!p) setPauso(true); return !p; }); };
  const reset = () => { setTemp(300); setVolumen(10); setMoles(1.0); setMuestras([]); bump(); };

  const registraEstrellas = useCallback((est: number) => {
    setPredicho(true);
    guardaEstrellas(est);
  }, [guardaEstrellas]);

  const objetivos = [
    { txt: "Equípate para entrar al laboratorio", done: eppListo },
    { txt: "Calienta el gas y observa la presión", done: subioTemp },
    { txt: "Arrastra el pistón para comprimir", done: arrastro },
    { txt: "Comprime a la mitad (V = 5 L) sin tocar T ni n: la presión se duplica", done: volumen <= 5 && temp === 300 && moles === 1 },
    { txt: "Cambia la cantidad de gas (n)", done: cambioMoles },
    { txt: "Pausa para contar los choques", done: pauso },
    { txt: "Calcula la presión con PV = nRT", done: predicho },
    { txt: "Resuelve el reto evaluable (A2)", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-wind" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text, ...NUM }}>P · V = n · R · T</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: la presión nace de los choques de las partículas; más temperatura o menos volumen significan más presión.
      </div>
    </div>
  );

  const lecturaVivo = <>P = {fmtNum(P, 0)} kPa · {temp} K · {fmtNum(volumen, 1)} L</>;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <>
          <SceneBoundary fallback={sceneFallback}>
            <GasIdealScene
              temp={temp}
              volumen={volumen}
              moles={moles}
              accent={accent}
              pausado={pausado}
              autoRotate={false}
              resetNonce={resetNonce}
              arrastrable={eppListo}
              onVolumenChange={onArrastrePiston}
            />
          </SceneBoundary>
          {!eppListo && <EppGate accent={accent} rgba={color.rgba} onEntrar={() => setEppListo(true)} />}
        </>
      }
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono={pausado ? "fa-play" : "fa-pause"} titulo={pausado ? "Reanudar" : "Pausar para contar los choques"} activo={!pausado} onClick={togglePausa} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar el gas" onClick={reset} />
        </>
      }
      leyenda={
        <>
          <div style={{ fontSize: 14, fontWeight: 800, color: accent, ...NUM }}>P = {fmtNum(P, 0)} kPa ({fmtNum(pAtm, 2)} atm)</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: T_COL, ...NUM }}>T = {temp} K ({fmtNum(tC, 0)} °C)</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: V_COL, ...NUM }}>V = {fmtNum(volumen, 1)} L</div>
        </>
      }
      lectura={lecturaVivo}
      objetivos={objetivos}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <Bloque titulo="Variables de estado del gas" icono="fa-sliders">
                <Deslizador label="Temperatura" icon="fa-temperature-half" colr={T_COL} valor={`${temp} K`} min={T_MIN} max={T_MAX} step={T_STEP} value={temp} onChange={cambiarTemp} />
                <Deslizador label="Volumen" icon="fa-down-left-and-up-right-to-center" colr={V_COL} valor={`${fmtNum(volumen, 1)} L`} min={V_MIN} max={V_MAX} step={V_STEP} value={volumen} onChange={cambiarVolumenSlider} hintL="o arrastra el pistón en la escena" />
                <Deslizador label="Cantidad (n)" icon="fa-atom" colr={N_COL} valor={`${fmtNum(moles, 1)} mol`} min={N_MIN} max={N_MAX} step={N_STEP} value={moles} onChange={cambiarMoles} />
              </Bloque>
              <Bloque titulo="Lecturas" icono="fa-gauge-high">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="Presión" value={`${fmtNum(P, 0)} kPa`} col={accent} />
                  <Dato label="Volumen" value={`${fmtNum(volumen, 1)} L`} col={V_COL} />
                  <Dato label="Temperatura" value={`${fmtNum(tC, 0)} °C`} col={T_COL} />
                  <Dato label="Energía interna" value={`${fmtNum(U, 0)} J`} col={N_COL} />
                </div>
                <p style={{ margin: 0, color: T.text2 }}>
                  <i className="fa-solid fa-circle-info" style={{ marginRight: 7, color: accent }} />
                  <strong style={{ color: accent }}>Pausa</strong> el gas para ver las partículas detenidas y comparar cuántas hay y qué tan apretadas están.
                </p>
              </Bloque>
              {eppListo && (
                <Bloque titulo="Diagrama P–V (isoterma)" icono="fa-chart-line">
                  <DiagramaPV muestras={muestras} n={moles} T={temp} Vactual={volumen} accent={accent} />
                </Bloque>
              )}
            </>
          ),
        },
        {
          id: "reto",
          etiqueta: "Reto",
          icono: "fa-trophy",
          contenido: (
            <>
              <PrediccionPCard
                accent={accent}
                nLive={moles}
                tLive={temp}
                vLive={volumen}
                mejor={mejorEstrellas}
                onResultado={registraEstrellas}
                playSfx={sonido ? (ok) => (ok ? audioRef.current?.correcto() : audioRef.current?.incorrecto()) : undefined}
              />
              <div style={{ height: 20 }} />
              <RetoQuizCard
                quiz={QUIZ_A2}
                accent={accent}
                rgba={color.rgba}
                aprobado={ejercicioAprobado}
                onAprobado={() => setEjercicioAprobado(true)}
                playSfx={sonido ? (ok) => { if (ok) audioRef.current?.correcto(); else audioRef.current?.incorrecto(); } : undefined}
                playPick={sonido ? () => audioRef.current?.blip() : undefined}
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
              <Bloque titulo="De dónde sale la presión" icono="fa-wind">
                <p style={{ margin: 0, color: T.text2 }}>
                  La <strong style={{ color: accent }}>presión</strong> es el resultado de millones de choques de las partículas contra las paredes. Si subes la <strong style={{ color: T_COL }}>temperatura</strong>, se mueven más rápido y golpean con más fuerza. Si bajas el <strong style={{ color: V_COL }}>volumen</strong>, el mismo gas choca más seguido. Si metes más <strong style={{ color: N_COL }}>gas</strong> (n), hay más partículas chocando. Todo se resume en una sola ecuación.
                </p>
                <div style={{ borderRadius: 12, border: `1px solid ${accent}44`, background: `rgba(${color.rgba},0.08)`, padding: "11px 14px" }}>
                  <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.1em", color: T.text3, marginBottom: 5 }}>PRIMERA LEY DE LA TERMODINÁMICA</div>
                  <div style={{ color: T.text2 }}>
                    La energía interna del gas solo cambia por el <strong style={{ color: T_COL }}>calor</strong> que entra (Q) menos el <strong style={{ color: V_COL }}>trabajo</strong> que hace al expandirse (W). La energía no se crea ni se destruye.
                  </div>
                  <div style={{ marginTop: 9, fontSize: 16, fontWeight: 900, color: accent, ...NUM }}>ΔU = Q − W</div>
                </div>
              </Bloque>
              <Bloque titulo="La ecuación de estado" icono="fa-square-root-variable">
                <div style={{ color: T.text2, display: "grid", gap: 6, ...NUM }}>
                  <div style={{ fontSize: 17, fontWeight: 900, color: accent }}>P · V = n · R · T</div>
                  <div><strong style={{ color: accent }}>P</strong> = presión (kPa)</div>
                  <div><strong style={{ color: V_COL }}>V</strong> = volumen (L)</div>
                  <div><strong style={{ color: N_COL }}>n</strong> = cantidad (mol)</div>
                  <div><strong style={{ color: T_COL }}>T</strong> = temperatura (K)</div>
                  <div>R = {fmtNum(R_GAS, 3)} J/mol·K</div>
                </div>
              </Bloque>
              <Bloque titulo="El gas ideal" icono="fa-atom">
                <p style={{ margin: 0, color: T.text2 }}>
                  Un modelo donde las partículas no interactúan (salvo en choques) y su volumen propio es despreciable. Describe bien a los gases reales a <strong style={{ color: T.text }}>baja presión y alta temperatura</strong>.
                </p>
              </Bloque>
              <Bloque titulo="Para pensar" icono="fa-circle-question">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  <li>Si duplicas la temperatura (en K) sin cambiar V ni n, ¿qué pasa con P?</li>
                  <li>Comprime a la mitad el volumen: ¿la presión sube al doble?</li>
                  <li>¿Por qué la temperatura va en kelvin y no en °C?</li>
                </ul>
                <p style={{ margin: 0, color: T.text2 }}>
                  <i className="fa-solid fa-lightbulb" style={{ marginRight: 7, color: accent }} />
                  Fíjate: P, V y T están <strong style={{ color: T.text }}>amarradas</strong>. No puedes cambiar una sin que las otras (o la presión) respondan. Eso es lo que dice <strong style={{ color: accent }}>PV = nRT</strong>.
                </p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={GAS_IDEAL_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

/* ── Diagrama P–V (isoterma de Boyle) en vivo ─────────────────────────── */
function DiagramaPV({ muestras, n, T: temp, Vactual, accent }: { muestras: { V: number; P: number }[]; n: number; T: number; Vactual: number; accent: string }) {
  const W = 336, H = 190, PAD_L = 34, PAD_B = 26, PAD_T = 10, PAD_R = 12;
  const iw = W - PAD_L - PAD_R, ih = H - PAD_T - PAD_B;
  const x = (v: number) => PAD_L + ((v - V_MIN) / (V_MAX - V_MIN)) * iw;
  const y = (p: number) => PAD_T + ih - (Math.min(P_GAUGE_MAX, Math.max(0, p)) / P_GAUGE_MAX) * ih;

  // isoterma teórica P = nRT/V para los n,T actuales
  const iso: string[] = [];
  const STEPS = 28;
  for (let i = 0; i <= STEPS; i++) {
    const v = V_MIN + (i / STEPS) * (V_MAX - V_MIN);
    iso.push(`${x(v).toFixed(1)},${y(presion(n, temp, v)).toFixed(1)}`);
  }
  const Pactual = presion(n, temp, Vactual);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", maxWidth: 420, borderRadius: 12, background: "rgba(2,12,28,0.5)", border: `1px solid ${T.line}` }} role="img" aria-label="Diagrama presión contra volumen">
      <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + ih} stroke="rgba(255,255,255,0.25)" strokeWidth={1} />
      <line x1={PAD_L} y1={PAD_T + ih} x2={W - PAD_R} y2={PAD_T + ih} stroke="rgba(255,255,255,0.25)" strokeWidth={1} />
      <text x={PAD_L - 6} y={PAD_T + 12} textAnchor="end" fontSize={14} fill="rgba(255,255,255,0.7)">P</text>
      <text x={W - PAD_R} y={H - 6} textAnchor="end" fontSize={14} fill="rgba(255,255,255,0.7)">V (L) →</text>
      <polyline points={iso.join(" ")} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={2} strokeDasharray="5 4" />
      {muestras.map((m, i) => (
        <circle key={i} cx={x(m.V)} cy={y(m.P)} r={2.6} fill={accent} opacity={0.55} />
      ))}
      <circle cx={x(Vactual)} cy={y(Pactual)} r={6} fill="#fff" stroke={accent} strokeWidth={3} />
    </svg>
  );
}

/* ── Reto de cálculo: predice la presión con PV = nRT ─────────────────── */
function PrediccionPCard({
  accent,
  nLive,
  tLive,
  vLive,
  mejor,
  onResultado,
  playSfx,
}: {
  accent: string;
  nLive: number;
  tLive: number;
  vLive: number;
  mejor: number;
  onResultado: (estrellas: number) => void;
  playSfx?: (ok: boolean) => void;
}) {
  const [snap, setSnap] = useState<{ n: number; T: number; V: number } | null>(null);
  const [val, setVal] = useState("");
  const [intentos, setIntentos] = useState(0);
  const [check, setCheck] = useState(false);
  const [estrellas, setEstrellas] = useState<number | null>(null);

  const tomarLectura = () => {
    setSnap({ n: nLive, T: tLive, V: vLive });
    setVal("");
    setIntentos(0);
    setCheck(false);
    setEstrellas(null);
  };

  const Pesp = snap ? presion(snap.n, snap.T, snap.V) : 0;
  const num = Number((val || "").trim().replace(",", "."));
  const okActual = snap !== null && val.trim() !== "" && !Number.isNaN(num) && Math.abs(num - Pesp) <= Math.max(6, Pesp * 0.04);

  const comprobar = () => {
    if (!snap) return;
    const intentoN = intentos + 1;
    setIntentos(intentoN);
    setCheck(true);
    if (okActual) {
      const est = intentoN <= 1 ? 3 : intentoN === 2 ? 2 : 1;
      setEstrellas(est);
      onResultado(est);
    }
    playSfx?.(okActual);
  };

  return (
    <div style={{ ...card, padding: "18px 16px 20px" }}>
      <style>{`
        .calc-in { width:100%; box-sizing:border-box; border-radius:12px; border:1px solid ${T.line}; background:${T.inset};
          color:#fff; font-size:18px; font-weight:900; text-align:center; padding:12px; outline:none; transition:border-color .15s; -moz-appearance:textfield; }
        .calc-in:focus { border-color:${accent}; }
        .calc-in::-webkit-outer-spin-button, .calc-in::-webkit-inner-spin-button { -webkit-appearance:none; margin:0; }
        .calc-btn { cursor:pointer; border:none; border-radius:12px; font-size:14px; font-weight:800; padding:12px 18px; transition:all .15s; }
        .calc-btn-primary { background:${accent}; color:#04121f; }
        .calc-btn-primary:hover:not(:disabled) { filter:brightness(1.08); }
        .calc-btn-primary:disabled { opacity:0.4; cursor:not-allowed; }
        .calc-btn-ghost { background:${T.glass}; border:1px solid ${T.line}; color:#fff; }
        .calc-btn-ghost:hover { border-color:${accent}; }
      `}</style>
      <Eyebrow>
        <i className="fa-solid fa-calculator" style={{ marginRight: 8, color: accent }} />
        Reto de cálculo · Predice la presión
      </Eyebrow>

      <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55, marginBottom: 14 }}>
        Toma una lectura del estado actual de tu gas y calcula la presión con la ecuación de estado{" "}
        <strong style={{ color: accent, ...NUM }}>P = n·R·T / V</strong> (recuerda R = {fmtNum(R_GAS, 3)} J/mol·K y que con V en litros el resultado sale en kPa). Compruébalo contra el manómetro.
      </div>

      {!snap ? (
        <button className="calc-btn calc-btn-primary" onClick={tomarLectura}>
          <i className="fa-solid fa-camera" style={{ marginRight: 8 }} />
          Tomar lectura del gas
        </button>
      ) : (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
            <Snap label="n" value={`${fmtNum(snap.n, 1)} mol`} col={N_COL} />
            <Snap label="R" value={`${fmtNum(R_GAS, 3)}`} col={T.text2} />
            <Snap label="T" value={`${snap.T} K`} col={T_COL} />
            <Snap label="V" value={`${fmtNum(snap.V, 1)} L`} col={V_COL} />
          </div>

          <div style={{ fontSize: 14, fontWeight: 800, color: T.text2, marginBottom: 7 }}>¿Cuál es la presión P? (kPa)</div>
          <div style={{ display: "flex", gap: 9, alignItems: "center", maxWidth: "100%" }}>
            <input
              className="calc-in"
              type="number"
              inputMode="decimal"
              placeholder="kPa"
              value={val}
              onChange={(e) => { setVal(e.target.value); setCheck(false); }}
              style={{ flex: 1, borderColor: check ? (okActual ? OK : WARN) : undefined }}
            />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text2 }}>kPa</span>
            {check && <i className={`fa-solid ${okActual ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ color: okActual ? OK : WARN, fontSize: 17 }} />}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 16, alignItems: "center", flexWrap: "wrap" }}>
            {!(check && okActual) && (
              <button className="calc-btn calc-btn-primary" onClick={comprobar} disabled={val.trim() === ""}>
                <i className="fa-solid fa-circle-check" style={{ marginRight: 8 }} />
                Comprobar
              </button>
            )}
            <button className="calc-btn calc-btn-ghost" onClick={tomarLectura}>
              <i className="fa-solid fa-arrow-rotate-left" style={{ marginRight: 8 }} />
              Otra lectura
            </button>
            {estrellas !== null && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" }}>
                <div style={{ display: "flex", gap: 3 }}>
                  {[1, 2, 3].map((s) => (
                    <i key={s} className="fa-solid fa-star" style={{ fontSize: 16, color: s <= estrellas ? "#FBBF24" : "rgba(255,255,255,0.18)" }} />
                  ))}
                </div>
                <span style={{ fontSize: 14, color: T.text3 }}>Mejor: <strong style={{ color: mejor >= 3 ? OK : T.text2 }}>{mejor}★</strong></span>
              </div>
            )}
          </div>

          {check && (
            <div style={{ marginTop: 14, borderRadius: 13, border: `1px solid ${okActual ? OK : WARN}66`, background: `${okActual ? OK : WARN}14`, padding: "14px 16px", fontSize: 14, color: T.text, lineHeight: 1.5 }}>
              {okActual ? (
                <>
                  <div style={{ fontWeight: 900, color: OK, marginBottom: 6 }}>
                    <i className="fa-solid fa-trophy" style={{ marginRight: 8 }} />
                    ¡Correcto! P = {fmtNum(Pesp, 0)} kPa
                  </div>
                  <div style={{ color: T.text2, ...NUM }}>
                    P = ({fmtNum(snap.n, 1)} × {fmtNum(R_GAS, 3)} × {snap.T}) / {fmtNum(snap.V, 1)} = {fmtNum(Pesp, 1)} kPa. Coincide con el manómetro de la escena.
                  </div>
                </>
              ) : (
                <div style={{ color: "#FFB27A" }}>
                  <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 8 }} />
                  Aún no. Sustituye n, R, T y V en P = n·R·T / V y revisa tus unidades (T en kelvin, V en litros). Vuelve a intentarlo.
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Snap({ label, value, col }: { label: string; value: string; col?: string }) {
  return (
    <div style={{ flex: "1 1 0", minWidth: 78, borderRadius: 11, border: `1px solid ${T.line}`, background: T.inset, padding: "9px 10px", textAlign: "center" }}>
      <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.08em", color: T.text3 }}>{label}</div>
      <div style={{ marginTop: 4, fontSize: 14, fontWeight: 900, color: col ?? T.text, ...NUM }}>{value}</div>
    </div>
  );
}
