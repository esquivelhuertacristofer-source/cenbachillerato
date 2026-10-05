"use client";

/**
 * Laboratorio 3D — Conservación de la energía: el péndulo.
 * Práctica experimental para CNEYT-II-P02-A1
 * ("Transformación, transferencia y conservación de la energía").
 *
 * "La energía no se crea ni se destruye, solo se transforma." Un péndulo lo
 * hace visible: en lo alto toda la energía es POTENCIAL (Ep = m·g·h) y v = 0;
 * en el punto más bajo toda es CINÉTICA (Ec = ½·m·v²) y v es máxima. Sin
 * fricción, Ep + Ec se mantiene constante. Con fricción, parte pasa a CALOR y
 * el péndulo se detiene: la energía cambia de forma, nunca desaparece.
 * Ciencias Naturales, Experimentales y Tecnología II (MCCEMS 2025).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { EppGate } from "./_epp-gate";
import { LabSfx } from "./lab-audio";
import { CONSERVACION_ENERGIA_FICHA } from "./conservacion-energia-pendulo-ficha";
import { QUIZ_A2 } from "./conservacion-energia-pendulo-data";
import {
  PLANETAS,
  grados2rad,
  altura,
  energiaTotal,
  velocidadMax,
  periodo,
  fmtNum,
  ANG_MIN, ANG_MAX, ANG_STEP,
  LARGO_MIN, LARGO_MAX, LARGO_STEP,
  MASA_MIN, MASA_MAX, MASA_STEP,
} from "./conservacion-data";

const ConservacionScene = dynamic(() => import("./ConservacionScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-atom fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const EP_COL = "#3BA7FF";
const EC_COL = "#FFB13B";
const HEAT_COL = "#FF5A5A";
const WARN = "#FF8A3C";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
const RETO_KEY = "cen-conservacion-reto";

export function LabConservacion({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [planetaKey, setPlanetaKey] = useState("tierra");
  const planeta = useMemo(() => PLANETAS.find((p) => p.key === planetaKey) ?? PLANETAS[0]!, [planetaKey]);

  const [anguloDeg, setAnguloDeg] = useState(45);
  const [largo, setLargo] = useState(1.6);
  const [masa, setMasa] = useState(1.5);
  const [friccion, setFriccion] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // compuerta de equipamiento (pilar: equiparse)
  const [eppListo, setEppListo] = useState(false);

  // objetivos
  const [arrastro, setArrastro] = useState(false); // arrastró la masa en 3D
  const [cambioGravedad, setCambioGravedad] = useState(false);
  const [vioFriccion, setVioFriccion] = useState(false);
  const [pauso, setPauso] = useState(false);
  const [cambioMasa, setCambioMasa] = useState(false);
  const [predicho, setPredicho] = useState(false); // resolvió el cálculo de v
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);

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

  // valores estáticos (calculados de los controles, no de la animación)
  const theta0 = grados2rad(anguloDeg);
  const hMax = altura(largo, theta0);
  const eTotal = energiaTotal(masa, planeta.g, largo, theta0);
  const vMax = velocidadMax(planeta.g, largo, theta0);
  const T_periodo = periodo(largo, planeta.g);

  const bump = () => setResetNonce((n) => n + 1);

  const cambiarPlaneta = (k: string) => { setPlanetaKey(k); setCambioGravedad(k !== "tierra" ? true : cambioGravedad); bump(); };
  const cambiarAngulo = (v: number) => { setAnguloDeg(v); if (sonido) audioRef.current?.blip(); bump(); };
  const cambiarLargo = (v: number) => { setLargo(v); bump(); };
  const cambiarMasa = (v: number) => { setMasa(v); setCambioMasa(true); bump(); };
  const cambiarFriccion = (v: number) => { setFriccion(v); if (v > 0) setVioFriccion(true); };
  const togglePausa = () => { setPausado((p) => { if (!p) setPauso(true); return !p; }); };
  const reset = () => { bump(); };

  // la masa arrastrada en 3D entra por aquí (pilar: manipular)
  const onArrastreAngulo = useCallback((deg: number) => {
    setArrastro(true);
    setAnguloDeg(deg);
    if (sonido) audioRef.current?.blip();
    setResetNonce((n) => n + 1);
  }, [sonido]);

  const registraEstrellas = useCallback((est: number) => {
    setPredicho(true);
    guardaEstrellas(est);
  }, [guardaEstrellas]);

  const objetivos = [
    { txt: "Equípate para entrar al laboratorio", done: eppListo },
    { txt: "Arrastra la masa para soltarla", done: arrastro },
    { txt: "Cambia la masa: la rapidez máxima no cambia, la energía sí", done: cambioMasa },
    { txt: "Cambia la gravedad (otro planeta)", done: cambioGravedad },
    { txt: "Activa la fricción y observa el calor", done: vioFriccion },
    { txt: "Pausa para comparar Ep y Ec", done: pauso },
    { txt: "Calcula la rapidez máxima (v = √2gh)", done: predicho },
    { txt: "Resuelve el reto evaluable (A2)", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-atom" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text, ...NUM }}>Ep + Ec = constante</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: sin fricción la energía solo cambia de forma, su suma se conserva.
      </div>
    </div>
  );

  const lecturaVivo = friccion > 0
    ? <>Con fricción: Ep + Ec baja y el calor sube</>
    : <>Sin fricción: Ep + Ec = E₀, siempre</>;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <>
          <SceneBoundary fallback={sceneFallback}>
            <ConservacionScene
              anguloDeg={anguloDeg}
              largo={largo}
              masa={masa}
              g={planeta.g}
              friccion={friccion}
              pausado={pausado}
              accent={accent}
              autoRotate={false}
              resetNonce={resetNonce}
              arrastrable={eppListo}
              onAnguloChange={onArrastreAngulo}
            />
          </SceneBoundary>
          {!eppListo && <EppGate accent={accent} rgba={color.rgba} onEntrar={() => setEppListo(true)} />}
        </>
      }
      modos={{
        opciones: PLANETAS.map((p) => ({ id: p.key, etiqueta: p.nombre, icono: p.icono })),
        valor: planetaKey,
        cambiar: cambiarPlaneta,
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono={pausado ? "fa-play" : "fa-pause"} titulo={pausado ? "Reanudar" : "Pausar para comparar Ep y Ec"} activo={!pausado} onClick={togglePausa} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar el péndulo" onClick={reset} />
        </>
      }
      leyenda={
        <>
          <LegItem col={EP_COL} txt="Ep potencial" />
          <LegItem col={EC_COL} txt="Ec cinética" />
          <LegItem col={HEAT_COL} txt="Calor" />
          <div style={{ fontSize: 14, fontWeight: 800, color: accent, ...NUM }}>E₀ = {fmtNum(eTotal, 1)} J</div>
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
              <Bloque titulo={`Condiciones · ${planeta.nombre} (g = ${fmtNum(planeta.g, 2)} m/s²)`} icono="fa-sliders">
                <Deslizador label="Ángulo inicial" icon="fa-angle-up" colr={accent} valor={`${anguloDeg}°`} min={ANG_MIN} max={ANG_MAX} step={ANG_STEP} value={anguloDeg} onChange={cambiarAngulo} hintL="o arrastra la masa en la escena" />
                <Deslizador label="Largo del hilo" icon="fa-ruler-vertical" colr={EP_COL} valor={`${fmtNum(largo, 1)} m`} min={LARGO_MIN} max={LARGO_MAX} step={LARGO_STEP} value={largo} onChange={cambiarLargo} />
                <Deslizador label="Masa" icon="fa-weight-hanging" colr={EC_COL} valor={`${fmtNum(masa, 1)} kg`} min={MASA_MIN} max={MASA_MAX} step={MASA_STEP} value={masa} onChange={cambiarMasa} />
                <Deslizador label="Fricción" icon="fa-fire" colr={HEAT_COL} valor={`${Math.round(friccion * 100)}%`} min={0} max={1} step={0.01} value={friccion} onChange={cambiarFriccion} />
              </Bloque>
              <Bloque titulo="Lecturas" icono="fa-gauge-high">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="Altura máx." value={`${fmtNum(hMax, 2)} m`} col={accent} />
                  <Dato label="Energía E₀" value={`${fmtNum(eTotal, 1)} J`} col={EP_COL} />
                  <Dato label="Rapidez máx." value={`${fmtNum(vMax, 2)} m/s`} col={EC_COL} />
                  <Dato label="Periodo" value={`${fmtNum(T_periodo, 2)} s`} />
                </div>
                <p style={{ margin: 0, color: T.text2 }}>
                  <i className="fa-solid fa-circle-info" style={{ marginRight: 7, color: accent }} />
                  <strong style={{ color: accent }}>Pausa</strong> el péndulo en cualquier punto para comparar las barras de <strong style={{ color: EP_COL }}>Ep</strong> y <strong style={{ color: EC_COL }}>Ec</strong>.
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
              <PrediccionVCard
                accent={accent}
                gLive={planeta.g}
                lLive={largo}
                angLive={anguloDeg}
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
              <Bloque titulo="Por qué se conserva" icono="fa-scale-balanced">
                <p style={{ margin: 0, color: T.text2 }}>
                  Al soltar el péndulo desde lo alto, toda su energía es <strong style={{ color: EP_COL }}>potencial</strong> (Ep = m·g·h) y no se mueve. Al caer, esa energía se transforma en <strong style={{ color: EC_COL }}>cinética</strong> (Ec = ½·m·v²): abajo la rapidez es máxima. Sube de nuevo y la cinética vuelve a ser potencial. <strong style={{ color: T.text }}>Sin fricción, Ep + Ec es siempre la misma.</strong>
                </p>
                <div style={{ borderRadius: 12, border: `1px solid ${accent}44`, background: `rgba(${color.rgba},0.08)`, padding: "11px 14px" }}>
                  <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.1em", color: T.text3, marginBottom: 5 }}>LA LEY</div>
                  <div style={{ color: T.text2 }}>
                    La energía no se crea ni se destruye, solo se transforma. Con fricción no se pierde: pasa a <strong style={{ color: HEAT_COL }}>calor</strong>.
                  </div>
                  <div style={{ marginTop: 9, fontSize: 16, fontWeight: 900, color: accent, ...NUM }}>Ep + Ec + Calor = E₀</div>
                </div>
              </Bloque>
              <Bloque titulo="Las fórmulas" icono="fa-square-root-variable">
                <div style={{ color: T.text2, display: "grid", gap: 6, ...NUM }}>
                  <div><strong style={{ color: EP_COL }}>Ep</strong> = m · g · h</div>
                  <div><strong style={{ color: EC_COL }}>Ec</strong> = ½ · m · v²</div>
                  <div>h = L · (1 − cos θ)</div>
                  <div>v<sub>máx</sub> = √(2 · g · h)</div>
                </div>
              </Bloque>
              <Bloque titulo="Para pensar" icono="fa-circle-question">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  <li>¿La masa cambia la rapidez máxima? Cámbiala y observa v<sub>máx</sub>.</li>
                  <li>En la Luna, ¿el péndulo va más lento o más rápido? ¿Por qué?</li>
                  <li>Con fricción, ¿a dónde se fue la energía? No se perdió.</li>
                </ul>
                <p style={{ margin: 0, color: T.text2 }}>
                  <i className="fa-solid fa-lightbulb" style={{ marginRight: 7, color: accent }} />
                  Fíjate: cambiar la <strong style={{ color: EC_COL }}>masa</strong> no cambia la <strong style={{ color: T.text }}>rapidez máxima</strong> (v depende solo de g y h), pero sí cambia la <strong style={{ color: EP_COL }}>energía</strong>. La gravedad sí cambia ambas.
                </p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={CONSERVACION_ENERGIA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
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

/* ── Reto de cálculo: predice la rapidez máxima con v = √(2·g·h) ──────── */
function PrediccionVCard({
  accent,
  gLive,
  lLive,
  angLive,
  mejor,
  onResultado,
  playSfx,
}: {
  accent: string;
  gLive: number;
  lLive: number;
  angLive: number;
  mejor: number;
  onResultado: (estrellas: number) => void;
  playSfx?: (ok: boolean) => void;
}) {
  const [snap, setSnap] = useState<{ g: number; L: number; ang: number } | null>(null);
  const [val, setVal] = useState("");
  const [intentos, setIntentos] = useState(0);
  const [check, setCheck] = useState(false);
  const [estrellas, setEstrellas] = useState<number | null>(null);

  const tomarLectura = () => {
    setSnap({ g: gLive, L: lLive, ang: angLive });
    setVal("");
    setIntentos(0);
    setCheck(false);
    setEstrellas(null);
  };

  const hSnap = snap ? altura(snap.L, grados2rad(snap.ang)) : 0;
  const vEsp = snap ? velocidadMax(snap.g, snap.L, grados2rad(snap.ang)) : 0;
  const num = Number((val || "").trim().replace(",", "."));
  const okActual = snap !== null && val.trim() !== "" && !Number.isNaN(num) && Math.abs(num - vEsp) <= Math.max(0.15, vEsp * 0.04);

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
        Reto de cálculo · Predice la rapidez máxima
      </Eyebrow>

      <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55, marginBottom: 14 }}>
        Toma una lectura del estado actual del péndulo. En el punto más bajo toda la energía es cinética, así que{" "}
        <strong style={{ color: accent, ...NUM }}>v = √(2·g·h)</strong> con{" "}
        <strong style={{ color: accent, ...NUM }}>h = L·(1 − cos θ)</strong>. Calcúlala y compárala con la rapidez de la escena. (La masa no influye.)
      </div>

      {!snap ? (
        <button className="calc-btn calc-btn-primary" onClick={tomarLectura}>
          <i className="fa-solid fa-camera" style={{ marginRight: 8 }} />
          Tomar lectura del péndulo
        </button>
      ) : (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
            <Snap label="g" value={`${fmtNum(snap.g, 2)} m/s²`} col={accent} />
            <Snap label="L" value={`${fmtNum(snap.L, 1)} m`} col={EP_COL} />
            <Snap label="θ" value={`${snap.ang}°`} col={EC_COL} />
            <Snap label="h = L(1−cos θ)" value={`${fmtNum(hSnap, 2)} m`} col={T.text2} />
          </div>

          <div style={{ fontSize: 14, fontWeight: 800, color: T.text2, marginBottom: 7 }}>¿Cuál es la rapidez máxima v? (m/s)</div>
          <div style={{ display: "flex", gap: 9, alignItems: "center", maxWidth: "100%" }}>
            <input
              className="calc-in"
              type="number"
              inputMode="decimal"
              placeholder="m/s"
              value={val}
              onChange={(e) => { setVal(e.target.value); setCheck(false); }}
              style={{ flex: 1, borderColor: check ? (okActual ? OK : WARN) : undefined }}
            />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text2 }}>m/s</span>
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
                    ¡Correcto! v = {fmtNum(vEsp, 2)} m/s
                  </div>
                  <div style={{ color: T.text2, ...NUM }}>
                    h = {fmtNum(snap.L, 1)} × (1 − cos {snap.ang}°) = {fmtNum(hSnap, 2)} m; v = √(2 × {fmtNum(snap.g, 2)} × {fmtNum(hSnap, 2)}) = {fmtNum(vEsp, 2)} m/s. Coincide con la rapidez del punto bajo.
                  </div>
                </>
              ) : (
                <div style={{ color: "#FFB27A" }}>
                  <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 8 }} />
                  Aún no. Primero saca h = L·(1 − cos θ) y luego v = √(2·g·h). Revisa que uses el ángulo en grados al sacar el coseno. Vuelve a intentarlo.
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
