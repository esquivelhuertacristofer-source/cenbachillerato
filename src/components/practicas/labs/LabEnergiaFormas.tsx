"use client";

/**
 * Laboratorio 3D — Formas y transformación de la energía.
 * Práctica experimental para CNEYT-II-P01-A1
 * ("Formas de energía en el mundo cotidiano"; progresión 1).
 *
 * La energía no se crea ni se destruye: solo se TRANSFORMA de una forma a otra
 * (conservación de la energía). Los aparatos cotidianos son transformadores que
 * convierten una forma en otra, y en cada paso una parte se disipa como calor;
 * por eso ninguno es 100% eficiente, pero la energía total siempre se conserva:
 * entrada = salida útil + calor disipado. El estudiante elige un transformador,
 * regula la energía de entrada y ve fluir la energía cambiando de forma (color)
 * mientras el calor se escapa hacia arriba.
 * Ciencias Naturales, Experimentales y Tecnología II — "El poder de la energía"
 * (MCCEMS 2025).
 *
 * EXPERIMENTO CENTRAL: la columna de conservación al final de la cadena. Verde
 * (útil) + naranja (calor) siempre miden exactamente lo que entró: al cambiar de
 * aparato cambia la proporción, al mover la entrada crece o baja la columna
 * entera, pero la suma nunca se pierde.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { LabSfx } from "./lab-audio";
import { FORMAS_ENERGIA_FICHA } from "./formas-energia-transformacion-ficha";
import { QUIZ_A2 } from "./formas-energia-transformacion-data";
import {
  TRANSFORMADORES,
  FORMAS,
  CASOS_IDENTIF,
  getTransformador,
  getForma,
  calcularBalance,
  fmtNum,
  fmtPct,
  DEFAULT_TRANSFORMADOR,
  E_MIN, E_MAX, E_STEP, E_DEFAULT,
} from "./energia-formas-data";

const EnergiaFormasScene = dynamic(() => import("./EnergiaFormasScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-bolt fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const VERDE = "#34D399";
const ORO = "#ffd24a";
const CALOR = "#ff7a4a";

const RETO_KEY = "cen-formas-energia-transformacion-reto";

export function LabEnergiaFormas({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [transformadorKey, setTransformadorKey] = useState<string>(DEFAULT_TRANSFORMADOR);
  const [entrada, setEntrada] = useState(E_DEFAULT);
  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // objetivos
  const [vioCadena, setVioCadena] = useState(false);
  const [vioFoco, setVioFoco] = useState(false);
  const [cambioEnergia, setCambioEnergia] = useState(false);
  const [vioVarios, setVioVarios] = useState(false);
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);

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

  const t = useMemo(() => getTransformador(transformadorKey), [transformadorKey]);
  const balance = useMemo(() => calcularBalance(t, entrada), [t, entrada]);

  const bump = () => setResetNonce((n) => n + 1);

  const cambiarTransformador = (k: string) => {
    setTransformadorKey(k);
    bump();
    if (sonido) audioRef.current?.blip();
    setVioCadena(true);
    if (k === "bombilla") setVioFoco(true);
    if (k !== DEFAULT_TRANSFORMADOR) setVioVarios(true);
  };

  const cambiarEntrada = (v: number) => { setEntrada(v); setCambioEnergia(true); };

  const reset = () => { setEntrada(E_DEFAULT); bump(); };

  const formaEntrada = getForma(balance.formaEntrada);
  const formaFinal = getForma(balance.formaFinal);

  const objetivos = [
    { txt: "Observa una cadena de transformación", done: vioCadena },
    { txt: "Mira el foco: solo 5% se vuelve luz", done: vioFoco },
    { txt: "Cambia la energía de entrada", done: cambioEnergia },
    { txt: "Compara varios transformadores", done: vioVarios },
    { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-bolt" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>La energía no se destruye: se transforma</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: en cada conversión, la entrada se reparte entre energía útil y calor. La suma siempre se conserva.
      </div>
    </div>
  );

  const lectura = (
    <>
      {fmtNum(balance.entrada)} J = <strong style={{ color: VERDE }}>{fmtNum(balance.util)} útil</strong> + <strong style={{ color: CALOR }}>{fmtNum(balance.calorTotal)} calor</strong>
    </>
  );

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <EnergiaFormasScene
            transformadorKey={transformadorKey}
            entrada={entrada}
            accent={accent}
            pausado={pausado}
            autoRotate={autoRotate}
            resetNonce={resetNonce}
          />
        </SceneBoundary>
      }
      modos={{
        opciones: TRANSFORMADORES.map((tr) => ({ id: tr.key, etiqueta: tr.nombre, icono: tr.icono })),
        valor: transformadorKey,
        cambiar: cambiarTransformador,
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono={pausado ? "fa-play" : "fa-pause"} titulo={pausado ? "Reanudar" : "Pausar"} activo={!pausado} onClick={() => setPausado((p) => !p)} />
          <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar la cámara" activo={autoRotate} onClick={() => setAutoRotate((v) => !v)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reset} />
        </>
      }
      leyenda={
        <>
          <LegItem col={VERDE} txt="energía útil" />
          <LegItem col={CALOR} txt="calor disipado" />
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
              <Bloque titulo={t.nombre} icono={t.icono}>
                <Deslizador label="Energía de entrada" icon="fa-battery-full" colr={accent}
                  valor={`${fmtNum(entrada)} J`} min={E_MIN} max={E_MAX} step={E_STEP} value={entrada} onChange={cambiarEntrada}
                  hintL={`${formaEntrada.nombre} (entrada)`} hintR={`${formaFinal.nombre} (salida)`} />
                <p style={{ margin: 0, color: T.text2 }}>{t.resumen}</p>
              </Bloque>

              <Bloque titulo="Balance · la energía se conserva" icono="fa-scale-balanced">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="Entra" value={`${fmtNum(balance.entrada)} J`} col={accent} />
                  <Dato label="Eficiencia" value={fmtPct(balance.eficienciaGlobal)} col={ORO} />
                  <Dato label="Útil (sale)" value={`${fmtNum(balance.util)} J`} col={VERDE} />
                  <Dato label="Calor disipado" value={`${fmtNum(balance.calorTotal)} J`} col={CALOR} />
                </div>
                <div style={{ display: "flex", height: 28, borderRadius: 8, overflow: "hidden", border: `1px solid ${T.line}` }}>
                  <div style={{ width: `${balance.eficienciaGlobal * 100}%`, background: VERDE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#04241a", minWidth: 0, overflow: "hidden", whiteSpace: "nowrap", transition: "width 150ms linear" }}>
                    {balance.eficienciaGlobal >= 0.2 ? `${fmtPct(balance.eficienciaGlobal)} útil` : ""}
                  </div>
                  <div style={{ flex: 1, background: CALOR, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#3a1404", minWidth: 0, overflow: "hidden", whiteSpace: "nowrap" }}>
                    {(1 - balance.eficienciaGlobal) >= 0.2 ? `${fmtPct(1 - balance.eficienciaGlobal)} calor` : ""}
                  </div>
                </div>
                <p style={{ margin: 0, color: T.text2 }}>
                  La energía útil más el calor suman exactamente lo que entró: <strong style={{ color: T.text }}>{fmtNum(balance.util)} + {fmtNum(balance.calorTotal)} = {fmtNum(balance.entrada)} J</strong>. {t.verbatim ? (
                    <span style={{ color: "#ffd9a8" }}> Las cifras de este caso son <strong>dato de la actividad</strong> (5% luz / 95% calor).</span>
                  ) : (
                    <span style={{ color: T.text3 }}> Eficiencias aproximadas típicas (valores reales orientativos).</span>
                  )}
                </p>
                <p style={{ margin: 0, color: T.text2 }}>
                  Fíjate en el <strong style={{ color: accent }}>grosor del río</strong>: tras cada aparato se adelgaza porque parte de la energía se fue como <strong style={{ color: CALOR }}>calor</strong> (las partículas que suben).
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
              playSfx={
                sonido
                  ? (ok) => {
                      if (ok) audioRef.current?.correcto();
                      else audioRef.current?.incorrecto();
                    }
                  : undefined
              }
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
              <Bloque titulo="Conservación de la energía" icono="fa-infinity">
                <p style={{ margin: 0, color: T.text2 }}>
                  La energía es la capacidad de producir cambios. <strong style={{ color: T.text }}>No se crea ni se destruye</strong>: solo se transforma de una forma a otra. En cada transformación real una parte se vuelve <strong style={{ color: CALOR }}>calor</strong>, así que ningún aparato es 100% eficiente, pero la suma siempre se conserva.
                </p>
              </Bloque>
              <Bloque titulo="Las seis formas de energía" icono="fa-bolt">
                {FORMAS.map((f) => (
                  <div key={f.key} style={{ display: "flex", alignItems: "flex-start", gap: 11, color: T.text2 }}>
                    <span style={{ width: 22, textAlign: "center", color: f.color, marginTop: 2 }}>
                      <i className={`fa-solid ${f.icono}`} />
                    </span>
                    <span><strong style={{ color: f.color }}>{f.nombre}</strong>{f.formula ? <span style={{ color: T.text3, fontFamily: "ui-monospace, monospace" }}> · {f.formula}</span> : null} — {f.descripcion}</span>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Identifica la forma" icono="fa-magnifying-glass">
                {CASOS_IDENTIF.map((c, i) => (
                  <div key={i} style={{ color: T.text2, lineHeight: 1.45 }}>
                    <strong style={{ color: T.text }}>{c.caso}</strong> → <strong style={{ color: accent }}>{c.forma}</strong>
                    <span style={{ display: "block", color: T.text3, fontSize: 14 }}>{c.detalle}</span>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="En la vida real (México)" icono="fa-location-dot">
                <p style={{ margin: 0, color: T.text2 }}>
                  Las presas como <strong>Chicoasén</strong> convierten energía potencial del agua en eléctrica; los <strong>paneles solares</strong> que crecen en Sonora transforman luz en electricidad; y cambiar focos incandescentes por <strong style={{ color: ORO }}>LED</strong> ahorra porque el viejo foco tiraba el 95% de la energía en calor.
                </p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={FORMAS_ENERGIA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
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
