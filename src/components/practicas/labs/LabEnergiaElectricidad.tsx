"use client";

/**
 * Laboratorio 3D — Energía, partículas y electricidad.
 * Práctica experimental para CNEYT-I-P11-A1.
 *
 * El estudiante arma un circuito simple: cierra el INTERRUPTOR, elige el VOLTAJE
 * de la pila y prueba distintos MATERIALES. Ve que la corriente es el FLUJO de
 * electrones (partículas con carga) y que solo circula con un conductor y el
 * circuito cerrado. Al circular, la energía eléctrica se transforma en luz: el
 * foco brilla más a mayor voltaje (P = V·I).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, OK, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, BotonHerramienta } from "./_shell";
import { MATERIALES, VOLTAJES, corriente, potencia, brilloDe } from "./electricidad-data";
import { FichaTeorica } from "./_ficha";
import { ENERGIA_ELECTRICIDAD_FICHA } from "./energia-electricidad-ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { QUIZ_A2 } from "./energia-electricidad-data";
import { LabSfx } from "./lab-audio";

const EnergiaElectricidadScene = dynamic(() => import("./EnergiaElectricidadScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-bolt fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const NO = "#FF5E5E";
const FOCO_GLOW = "#FFD66B";

const fmt = (n: number, dec = 0) => n.toLocaleString("es-MX", { minimumFractionDigits: dec, maximumFractionDigits: dec });

const RETO_KEY = "cen-energia-electricidad-reto";

export function LabEnergiaElectricidad({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [switchClosed, setSwitchClosed] = useState(false);
  const [materialKey, setMaterialKey] = useState("cobre");
  const [voltaje, setVoltaje] = useState(4.5);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);
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

  // seguimiento de objetivos
  const [cerro, setCerro] = useState(false);
  const [encendio, setEncendio] = useState(false);
  const [proboAislante, setProboAislante] = useState(false);
  const [vistosEncendido, setVistosEncendido] = useState<Set<number>>(() => new Set<number>());
  const [voltajesProbados, setVoltajesProbados] = useState<Set<number>>(() => new Set<number>([4.5]));

  const material = useMemo(() => MATERIALES.find((m) => m.key === materialKey)!, [materialKey]);
  const conduce = switchClosed && material.conductor;
  const corrienteA = conduce ? corriente(voltaje) : 0;
  const potenciaW = conduce ? potencia(voltaje) : 0;
  const brillo = conduce ? brilloDe(voltaje) : 0;

  const marcaEncendido = (v: number) => {
    setVistosEncendido((prev) => {
      if (prev.has(v)) return prev;
      const nx = new Set(prev);
      nx.add(v);
      return nx;
    });
  };
  const toggleSwitch = () => {
    const next = !switchClosed;
    setSwitchClosed(next);
    if (sonido) audioRef.current?.blip();
    if (next) setCerro(true);
    if (next && material.conductor) { setEncendio(true); marcaEncendido(voltaje); }
  };
  const elegirVoltaje = (v: number) => {
    setVoltaje(v);
    setVoltajesProbados((prev) => {
      if (prev.has(v)) return prev;
      const nx = new Set(prev);
      nx.add(v);
      return nx;
    });
    if (switchClosed && material.conductor) { setEncendio(true); marcaEncendido(v); }
  };
  const elegirMaterial = (k: string) => {
    setMaterialKey(k);
    const m = MATERIALES.find((mm) => mm.key === k)!;
    if (!m.conductor) setProboAislante(true);
    if (switchClosed && m.conductor) { setEncendio(true); marcaEncendido(voltaje); }
  };
  const reset = () => {
    setSwitchClosed(false);
    setResetNonce((n) => n + 1);
  };

  // Las estrellas las registra TableroObjetivos, que LabShell monta con estos objetivos.
  const objetivos = [
    { txt: "Cierra el interruptor", done: cerro },
    { txt: "Enciende el foco con un conductor", done: encendio },
    { txt: "Con el foco encendido, compara 1,5 V contra 9 V: ¿cuánto crece el brillo?", done: vistosEncendido.has(1.5) && vistosEncendido.has(9) },
    { txt: "Comprueba que un aislante no conduce", done: proboAislante },
    { txt: "Prueba los 4 voltajes", done: voltajesProbados.size >= 4 },
    { txt: "Resuelve el reto de energía y electricidad", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-bolt" />
      </div>
      <div style={{ fontSize: 20, fontWeight: 900, color: T.text }}>Circuito eléctrico</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: la corriente es el <strong style={{ color: T.text }}>flujo de electrones</strong> y solo circula con un conductor y el circuito cerrado.
      </div>
    </div>
  );

  const lectura = conduce
    ? `${fmt(voltaje, 1)} V → ${fmt(corrienteA, 2)} A → ${fmt(potenciaW, 1)} W de luz`
    : switchClosed
      ? "El aislante bloquea a los electrones"
      : "Circuito abierto: sin camino, sin corriente";

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <EnergiaElectricidadScene
            conduce={conduce}
            switchClosed={switchClosed}
            voltaje={voltaje}
            brillo={brillo}
            materialColor={material.color}
            materialConductor={material.conductor}
            materialNombre={material.nombre}
            corrienteA={corrienteA}
            potenciaW={potenciaW}
            accent={accent}
            autoRotate={autoRotate}
            resetNonce={resetNonce}
          />
        </SceneBoundary>
      }
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono={switchClosed ? "fa-toggle-on" : "fa-toggle-off"} titulo={switchClosed ? "Abrir el circuito" : "Cerrar el circuito"} activo={switchClosed} onClick={toggleSwitch} />
          <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar automáticamente" activo={autoRotate} onClick={() => setAutoRotate((v) => !v)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reset} />
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
              <Bloque titulo="Interruptor" icono="fa-toggle-on">
                <button
                  type="button"
                  className="ex-bigbtn"
                  onClick={toggleSwitch}
                  style={{ cursor: "pointer", width: "100%", padding: "13px 16px", borderRadius: 13, fontSize: 15, fontWeight: 800, background: switchClosed ? accent : T.inset, color: switchClosed ? "#04121f" : T.text2, border: switchClosed ? "none" : `1px solid ${T.lineStrong}` }}
                >
                  <i className={`fa-solid ${switchClosed ? "fa-toggle-on" : "fa-toggle-off"}`} aria-hidden /> {switchClosed ? "Circuito cerrado: abrir" : "Circuito abierto: cerrar"}
                </button>
              </Bloque>

              <Bloque titulo="Voltaje de la pila" icono="fa-car-battery">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 8 }}>
                  {VOLTAJES.map((v) => {
                    const on = v === voltaje;
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => elegirVoltaje(v)}
                        style={{ cursor: "pointer", padding: "11px 4px", borderRadius: 11, fontSize: 15, fontWeight: 800, border: `1px solid ${on ? accent : T.line}`, background: on ? `rgba(${color.rgba},0.22)` : T.inset, color: on ? "#fff" : T.text2, fontFamily: "ui-monospace, monospace" }}
                      >
                        {fmt(v, v % 1 === 0 ? 0 : 1)} V
                      </button>
                    );
                  })}
                </div>
                <p style={{ margin: 0, color: T.text2 }}>Más voltaje: los electrones se empujan con más energía y el foco brilla más.</p>
              </Bloque>

              <Bloque titulo="Material en el circuito" icono="fa-cubes-stacked">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  {MATERIALES.map((m) => {
                    const on = m.key === materialKey;
                    return (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => elegirMaterial(m.key)}
                        style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 9, padding: "10px 11px", borderRadius: 12, textAlign: "left", border: `1px solid ${on ? accent : T.line}`, background: on ? `rgba(${color.rgba},0.18)` : T.glass, color: on ? "#fff" : T.text }}
                      >
                        <span style={{ width: 16, height: 16, borderRadius: 5, background: m.color, border: "1px solid rgba(255,255,255,0.25)", flexShrink: 0 }} />
                        <span style={{ display: "grid", minWidth: 0 }}>
                          <span style={{ fontSize: 14, fontWeight: 800 }}>{m.nombre}</span>
                          <span style={{ fontSize: 14, fontWeight: 700, color: m.conductor ? OK : NO }}>{m.conductor ? "Conductor" : "Aislante"}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p style={{ margin: 0, color: T.text2, fontStyle: "italic" }}>{material.nota}</p>
              </Bloque>

              <Bloque titulo="Mediciones del circuito" icono="fa-gauge-high">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="voltaje" value={`${fmt(voltaje, voltaje % 1 === 0 ? 0 : 1)} V`} col={accent} />
                  <Dato label="corriente" value={`${fmt(corrienteA, 2)} A`} col={conduce ? OK : undefined} />
                  <Dato label="potencia" value={`${fmt(potenciaW, 1)} W`} col={conduce ? OK : undefined} />
                  <Dato label="¿conduce?" value={conduce ? "Sí" : "No"} col={conduce ? OK : NO} />
                  <Dato label="circuito" value={switchClosed ? "Cerrado" : "Abierto"} col={switchClosed ? OK : "#8AB4FF"} />
                  <Dato label="foco" value={brillo > 0.001 ? `${fmt(brillo * 100)} %` : "Apagado"} col={brillo > 0.001 ? FOCO_GLOW : undefined} />
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
              <Bloque titulo="Corriente y energía" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>
                  La <strong style={{ color: T.text }}>corriente eléctrica</strong> es el flujo de electrones por un conductor. La pila les da{" "}
                  <strong style={{ color: T.text }}>energía</strong>, que al pasar por el foco se transforma en{" "}
                  <strong style={{ color: T.text }}>luz y calor</strong> (P = V · I).
                </p>
                <p style={{ margin: 0, color: T.text2 }}>
                  El circuito debe estar <strong style={{ color: T.text }}>cerrado</strong> para que los electrones tengan un camino completo por donde fluir.
                </p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={ENERGIA_ELECTRICIDAD_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}
