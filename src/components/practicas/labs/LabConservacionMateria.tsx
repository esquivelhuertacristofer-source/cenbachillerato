"use client";

/**
 * Laboratorio 3D — Conservación de la materia (Ley de Lavoisier).
 * Práctica experimental para CNEYT-I-P08-A1.
 *
 * El estudiante elige una REACCIÓN química y la "avanza" con un control: ve cómo
 * los MISMOS átomos de los reactivos se separan y se reacomodan para formar los
 * productos. Una tabla cuenta los átomos de cada elemento (iguales antes y
 * después) y una balanza muestra que la masa total no cambia: en una reacción
 * química la materia no se crea ni se destruye, solo se transforma.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, OK, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { CONSERVACION_MATERIA_FICHA } from "./conservacion-materia-ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { QUIZ_A2 } from "./conservacion-materia-data";
import { LabSfx } from "./lab-audio";
import { REACCIONES, ELEMS_R, buildReaccion } from "./reacciones-data";

const ConservacionMateriaScene = dynamic(() => import("./ConservacionMateriaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-flask-vial fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const fmt = (n: number, dec = 0) => n.toLocaleString("es-MX", { minimumFractionDigits: dec, maximumFractionDigits: dec });

/** Fracción de la masa de los productos que es gas (escapa si el sistema está abierto). */
const FRACCION_GAS: Record<string, number> = { "combustion-metano": 1, "sintesis-agua": 1, amoniaco: 1, sal: 0 };
const NOMBRE_CORTO: Record<string, { et: string; ic: string }> = {
  "combustion-metano": { et: "Metano", ic: "fa-fire" },
  "sintesis-agua": { et: "Agua", ic: "fa-droplet" },
  amoniaco: { et: "Amoniaco", ic: "fa-flask" },
  sal: { et: "Sal", ic: "fa-cubes" },
};

const STEP = 0.02; // avance por tick de reproducción
const TICK_MS = 32;

const RETO_KEY = "cen-conservacion-materia-reto";

export function LabConservacionMateria({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [reaccionKey, setReaccionKey] = useState("combustion-metano");
  const [progreso, setProgreso] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);
  const [vistas, setVistas] = useState<Set<string>>(() => new Set<string>(["combustion-metano"]));
  const [completadas, setCompletadas] = useState<Set<string>>(() => new Set<string>());
  const [interactuo, setInteractuo] = useState(false);
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  const [abierto, setAbierto] = useState(false);
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

  const reaccion = REACCIONES.find((r) => r.key === reaccionKey)!;
  const built = useMemo(() => buildReaccion(reaccion), [reaccion]);

  // Reproducción automática: al llegar al 100% se detiene y marca como completada
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setProgreso((p) => {
        const np = Math.min(1, p + STEP);
        if (np >= 1) {
          setPlaying(false);
          setCompletadas((prev) => {
            if (prev.has(reaccionKey)) return prev;
            const next = new Set(prev);
            next.add(reaccionKey);
            return next;
          });
        }
        return np;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [playing, reaccionKey]);

  const irAReaccion = (k: string) => {
    setReaccionKey(k);
    setProgreso(0);
    setPlaying(false);
    if (sonido) audioRef.current?.blip();
    setVistas((prev) => {
      if (prev.has(k)) return prev;
      const next = new Set(prev);
      next.add(k);
      return next;
    });
  };
  const togglePlay = () => {
    setInteractuo(true);
    if (progreso >= 1) {
      setProgreso(0);
      setPlaying(true);
      return;
    }
    setPlaying((v) => !v);
  };
  const scrub = (v: number) => {
    setInteractuo(true);
    setPlaying(false);
    setProgreso(v);
  };

  const totalAtomos = built.conteo.reduce((s, c) => s + c.n, 0);
  const completada = completadas.has(reaccionKey);
  const fraccionGas = FRACCION_GAS[reaccionKey] ?? 0;
  const escapado = abierto ? built.masaProd * fraccionGas * Math.max(0, Math.min(1, (progreso - 0.5) / 0.5)) : 0;

  // Las estrellas las registra TableroObjetivos, que LabShell monta con estos objetivos.
  const objetivos = [
    { txt: "Lleva una reacción al 100%: la balanza debe seguir nivelada", done: !abierto && progreso >= 0.99 },
    { txt: "Abre el sistema (icono del viento) y avanza una reacción con gas: mira cómo se inclina", done: abierto && fraccionGas > 0 && progreso >= 0.95 },
    { txt: "Inicia una reacción (mueve el control)", done: interactuo },
    { txt: "Lleva una reacción al 100%", done: completadas.size >= 1 },
    { txt: "Comprueba la conservación en las 4 reacciones", done: completadas.size >= 4 },
    { txt: "Recorre las 4 ecuaciones", done: vistas.size >= 4 },
    { txt: "Resuelve el reto de conservación de la materia", done: ejercicioAprobado },
  ];

  const [izqEc, derEc] = reaccion.ecuacion.split("→");

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-atom" />
      </div>
      <div style={{ fontSize: 20, fontWeight: 900, color: T.text }}>{reaccion.ecuacion}</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero el experimento sigue: <strong style={{ color: T.text }}>{reaccion.nombre}</strong> — {reaccion.descripcion}
      </div>
    </div>
  );

  const lectura = abierto && escapado > 0.05
    ? `Sistema abierto: escaparon ${fmt(escapado, 1)} u de gas`
    : `Masa: ${fmt(built.masaReact, 1)} u antes = ${fmt(built.masaProd, 1)} u después`;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <ConservacionMateriaScene
            reaccionKey={reaccion.key}
            atoms={built.atoms}
            reactBonds={built.reactBonds}
            prodBonds={built.prodBonds}
            progreso={progreso}
            accent={accent}
            autoRotate={autoRotate}
            resetNonce={resetNonce}
            masaReact={built.masaReact}
            masaProd={built.masaProd}
            abierto={abierto}
            fraccionGas={fraccionGas}
          />
        </SceneBoundary>
      }
      modos={{
        opciones: REACCIONES.map((r) => ({ id: r.key, etiqueta: NOMBRE_CORTO[r.key]?.et ?? r.nombre, icono: NOMBRE_CORTO[r.key]?.ic })),
        valor: reaccionKey,
        cambiar: irAReaccion,
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono={playing ? "fa-pause" : progreso >= 1 ? "fa-rotate-right" : "fa-play"} titulo={playing ? "Pausar" : "Iniciar reacción"} activo={playing} onClick={togglePlay} />
          <BotonHerramienta icono="fa-wind" titulo={abierto ? "Cerrar el sistema (nada escapa)" : "Abrir el sistema (el gas escapa)"} activo={abierto} onClick={() => { setAbierto((v) => !v); setInteractuo(true); }} />
          <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar automáticamente" activo={autoRotate} onClick={() => setAutoRotate((v) => !v)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={() => { setProgreso(0); setPlaying(false); setAbierto(false); setResetNonce((n) => n + 1); }} />
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
              <Bloque titulo={reaccion.nombre} icono="fa-flask-vial">
                <div style={{ padding: "10px 12px", borderRadius: 12, border: `1px solid rgba(${color.rgba},0.35)`, background: `rgba(${color.rgba},0.1)`, fontSize: 16, fontWeight: 900, color: accent, fontFamily: "ui-monospace, monospace" }}>
                  <span style={{ color: "#8AB4FF" }}>{izqEc?.trim()}</span> → <span style={{ color: OK }}>{derEc?.trim()}</span>
                </div>
                <Deslizador label="avance de la reacción" icon="fa-forward" colr={accent} valor={`${fmt(progreso * 100)} %`} min={0} max={1} step={0.01} value={progreso} onChange={scrub} hintL="reactivos" hintR="productos" />
                <button
                  type="button"
                  onClick={() => { setAbierto((v) => !v); setInteractuo(true); }}
                  style={{ cursor: "pointer", padding: "11px 14px", borderRadius: 12, border: `1px solid ${abierto ? "#fbbf24" : T.line}`, background: abierto ? "rgba(251,191,36,0.14)" : "rgba(255,255,255,0.04)", color: "#fff", fontSize: 14, fontWeight: 800 }}
                >
                  <i className="fa-solid fa-wind" aria-hidden /> {abierto ? "Sistema abierto: el gas escapa" : "Sistema cerrado: nada escapa"}
                </button>
                {abierto && fraccionGas === 0 && (
                  <p style={{ margin: 0, color: T.text2 }}>Aquí el producto es un sólido (sal): no hay gas que escape, así que la balanza sigue nivelada.</p>
                )}
                {abierto && fraccionGas > 0 && (
                  <p style={{ margin: 0, color: T.text2 }}>La masa no se destruyó: los productos gaseosos salieron del plato y ya no se pesan.</p>
                )}
              </Bloque>

              <Bloque titulo="¿Se conservan los átomos?" icono="fa-scale-balanced">
                <div style={{ borderRadius: 13, border: `1px solid ${T.line}`, background: T.inset, overflow: "hidden" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 64px 64px 24px", fontSize: 13, fontWeight: 800, color: T.text3, textTransform: "uppercase", padding: "9px 12px", borderBottom: `1px solid ${T.line}` }}>
                    <span>Elemento</span><span style={{ textAlign: "center" }}>Antes</span><span style={{ textAlign: "center" }}>Después</span><span />
                  </div>
                  {built.conteo.map((c) => (
                    <div key={c.el} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 64px 64px 24px", alignItems: "center", padding: "9px 12px", borderBottom: `1px solid ${T.line}` }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 9, fontSize: 14, fontWeight: 600, color: T.text2 }}>
                        <span style={{ width: 13, height: 13, borderRadius: "50%", background: ELEMS_R[c.el].color, border: "1px solid rgba(255,255,255,0.25)" }} />
                        {ELEMS_R[c.el].nombre}
                      </span>
                      <span style={{ textAlign: "center", fontSize: 15, fontWeight: 800, fontFamily: "ui-monospace, monospace" }}>{c.n}</span>
                      <span style={{ textAlign: "center", fontSize: 15, fontWeight: 800, fontFamily: "ui-monospace, monospace" }}>{c.n}</span>
                      <span style={{ textAlign: "center" }}><i className="fa-solid fa-check" style={{ color: OK, fontSize: 13 }} aria-hidden /></span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="átomos" value={fmt(totalAtomos)} col={OK} />
                  <Dato label="estado" value={completada ? "completa" : `${fmt(progreso * 100)} %`} col={completada ? OK : undefined} />
                  <Dato label="masa antes (u)" value={fmt(built.masaReact, 1)} col="#8AB4FF" />
                  <Dato label="masa después (u)" value={fmt(built.masaProd - escapado, 1)} col={escapado > 0.05 ? "#fbbf24" : OK} />
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
              <Bloque titulo="Ley de conservación de la materia" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>
                  <strong style={{ color: T.text }}>Lavoisier:</strong> en una reacción química la materia{" "}
                  <strong style={{ color: T.text }}>no se crea ni se destruye, solo se transforma</strong>. Por eso hay los mismos átomos —y la misma masa— antes y después.
                </p>
              </Bloque>
              <Bloque titulo="Esta reacción" icono="fa-flask">
                <p style={{ margin: 0, color: T.text2 }}>{reaccion.descripcion}</p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={CONSERVACION_MATERIA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}
