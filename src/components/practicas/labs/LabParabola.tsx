"use client";

/**
 * Laboratorio 3D — Parábolas y funciones cuadráticas (tiro parabólico).
 * Práctica experimental para PM-III-P06-A2
 * ("Analizo la trayectoria de un tiro parabólico"; progresión 6).
 *
 * Una función cuadrática h(x) = a·x² + b·x + c se DIBUJA como una parábola, y
 * cada parte del álgebra tiene significado geométrico: el signo de a fija la
 * APERTURA, el VÉRTICE (x = −b/2a) es el punto más alto, los CEROS son donde
 * la curva toca el suelo y el EJE DE SIMETRÍA (x = x_v) la parte en dos mitades
 * espejo. Pensamiento Matemático III — relación álgebra↔geometría (MCCEMS 2025).
 *
 * Robustecido (máxima interactividad): el alumno se EQUIPA con sus instrumentos
 * de medición (EppGate), ARRASTRA el vértice del tiro en 3D y la parábola se
 * reconstruye en tiempo real (con a fija, mover el apex fija b = −2a·x_v y
 * c = a·x_v² + h_v), ve la ESTELA de PARTÍCULAS del balón y HACE EL CÁLCULO:
 * predice el vértice con x = −b/2a y gana estrellas (récord local).
 *
 * EXPERIMENTO CENTRAL: ¿el balón entra al arco? Con la portería a 25 m, el
 * alumno cambia a, b, c (o arrastra el vértice) y ve en la escena si h(25)
 * queda por debajo del travesaño (2.44 m, entra) o por encima (se va por arriba).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { PARABOLA_FICHA } from "./parabola-trayectoria-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { RETO_A2 } from "./parabola-trayectoria-data";
import { EppGate, type EppItem } from "./_epp-gate";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import {
  DEFAULTS,
  GOL,
  evalH,
  vertice,
  discriminante,
  raices,
  ejeSimetria,
  aterrizaje,
  fmtNum,
  fmtEcuacion,
  A_MIN, A_MAX, A_STEP, B_MIN, B_MAX, B_STEP, C_MIN, C_MAX, C_STEP,
} from "./parabola-data";

const ParabolaScene = dynamic(() => import("./ParabolaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-chart-line fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const VERDE = "#34D399";
const ORO = "#ffd24a";
const ROJO = "#ff6b6b";
const EJE = "#7fd4ff";
const WARN = "#FF8A3C";
const RETO_KEY = "cen-parabola-reto";

/** Instrumentos de medición del topógrafo del tiro (3 correctos + 3 distractores). */
const INSTRUMENTOS: EppItem[] = [
  { key: "cinta", nombre: "Cinta métrica", icono: "fa-ruler-horizontal", ok: true, nota: "Mide el alcance y la altura en metros: las coordenadas de la parábola." },
  { key: "transportador", nombre: "Transportador", icono: "fa-draw-polygon", ok: true, nota: "Mide el ángulo de salida del balón, ligado a la inclinación b." },
  { key: "cronometro", nombre: "Cronómetro", icono: "fa-stopwatch", ok: true, nota: "Registra el tiempo de vuelo para relacionarlo con la trayectoria." },
  { key: "balon", nombre: "Balón", icono: "fa-futbol", ok: false, nota: "Es el objeto que estudias, no un instrumento de medición." },
  { key: "bandera", nombre: "Bandera de córner", icono: "fa-flag", ok: false, nota: "Marca la cancha, pero no mide nada." },
  { key: "tacos", nombre: "Tacos", icono: "fa-shoe-prints", ok: false, nota: "Calzado del jugador: no sirve para medir la parábola." },
];

export function LabParabola({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [a, setA] = useState(DEFAULTS.a);
  const [b, setB] = useState(DEFAULTS.b);
  const [c, setC] = useState(DEFAULTS.c);
  const [showGol, setShowGol] = useState(true);
  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // compuerta de equipamiento (pilar: equiparse)
  const [eppListo, setEppListo] = useState(false);

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

  // objetivos
  const [movioA, setMovioA] = useState(false);
  const [movioBC, setMovioBC] = useState(false);
  const [vioGol, setVioGol] = useState(true);
  const [arrastro, setArrastro] = useState(false); // arrastró el vértice en 3D
  const [predicho, setPredicho] = useState(false); // resolvió el cálculo del vértice
  const [metioGol, setMetioGol] = useState(false); // logró que el balón entre al arco

  // récord de estrellas del reto de cálculo (persistido)
  const { mejorEstrellas, registraEstrellas: guardaEstrellas } = useEstrellas(RETO_KEY);

  const bump = () => setResetNonce((n) => n + 1);

  // a nunca puede ser 0 (dejaría de ser parábola).
  const cambiarA = (v: number) => {
    if (v === 0) v = a < 0 ? -A_STEP : A_STEP;
    setA(v);
    setMovioA(true);
  };
  const cambiarB = (v: number) => { setB(v); setMovioBC(true); if (sonido) audioRef.current?.blip(); };
  const cambiarC = (v: number) => { setC(v); setMovioBC(true); if (sonido) audioRef.current?.blip(); };
  const toggleGol = () => { setShowGol((g) => !g); setVioGol(true); if (sonido) audioRef.current?.blip(); };

  // el vértice arrastrado en 3D entra por aquí (a fija → b y c nuevos)
  const onVerticeArrastre = useCallback((nb: number, nc: number) => {
    setArrastro(true);
    setMovioBC(true);
    setB(nb);
    setC(nc);
  }, []);
  const onGrabVertice = useCallback(() => {
    if (sonido) audioRef.current?.blip();
  }, [sonido]);

  const reset = () => {
    setA(DEFAULTS.a); setB(DEFAULTS.b); setC(DEFAULTS.c);
    setShowGol(true);
    bump();
  };

  const registraEstrellas = useCallback((est: number) => {
    setPredicho(true);
    guardaEstrellas(est);
  }, [guardaEstrellas]);

  // magnitudes matemáticas (deterministas)
  const vert = useMemo(() => vertice(a, b, c), [a, b, c]);
  const D = useMemo(() => discriminante(a, b, c), [a, b, c]);
  const rs = useMemo(() => raices(a, b, c), [a, b, c]);
  const eje = useMemo(() => ejeSimetria(a, b), [a, b]);
  const land = useMemo(() => aterrizaje(a, b, c), [a, b, c]);
  const ecuacion = useMemo(() => fmtEcuacion(a, b, c), [a, b, c]);

  const hPorteria = useMemo(() => evalH(a, b, c, GOL.porteriaX), [a, b, c]);
  const balonSupera = hPorteria > GOL.travesano;
  // ¿el balón sigue en el aire al llegar a la portería? (la parábola no ha caído)
  const enAire = hPorteria > 0 && (land === 0 || GOL.porteriaX <= land);
  const entraAlArco = enAire && !balonSupera;

  // Ajuste durante el render (patrón de React): el balón entró al arco.
  if (entraAlArco && !metioGol) setMetioGol(true);

  const cerosTxt =
    rs.length === 0 ? "no toca el suelo" :
    rs.length === 1 ? `x = ${fmtNum(rs[0]!, 1)}` :
    `x = ${fmtNum(rs[0]!, 1)} y x = ${fmtNum(rs[1]!, 1)}`;

  const objetivos = [
    { txt: "Haz que el balón entre al arco: h(25) debajo del travesaño (2.44 m)", done: metioGol },
    { txt: "Cambia la apertura moviendo a", done: movioA },
    { txt: "Mueve b y c y observa el desplazamiento", done: movioBC },
    { txt: "Arrastra el vértice del tiro en 3D", done: arrastro },
    { txt: "Pon a prueba el escenario del gol", done: vioGol },
    { txt: "Calcula el vértice con x = −b/2a", done: predicho },
    { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-chart-line" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Una cuadrática se dibuja como una parábola</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: h(x) = a·x² + b·x + c traza una parábola con un vértice, dos ceros y un eje de simetría. El signo de a decide hacia dónde abre.
      </div>
    </div>
  );

  // lectura corta en vivo
  const lectura = showGol ? (
    enAire ? (
      <>
        h(25) = <strong style={{ color: balonSupera ? ROJO : VERDE }}>{fmtNum(hPorteria, 2)} m {balonSupera ? ">" : "≤"} {fmtNum(GOL.travesano, 2)} m</strong> · {balonSupera ? "se va por arriba" : "entra al arco"}
      </>
    ) : (
      <>El balón cae en x = {fmtNum(land, 1)} m: no llega al arco</>
    )
  ) : (
    <>Vértice ({fmtNum(vert.x, 1)}, {fmtNum(vert.h, 1)}) · ceros {cerosTxt}</>
  );

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <>
          <SceneBoundary fallback={sceneFallback}>
            <ParabolaScene
              a={a}
              b={b}
              c={c}
              showGol={showGol}
              accent={accent}
              pausado={pausado}
              autoRotate={autoRotate}
              resetNonce={resetNonce}
              arrastrable={eppListo}
              onVerticeChange={onVerticeArrastre}
              onGrab={onGrabVertice}
            />
          </SceneBoundary>

          {/* Compuerta de equipamiento */}
          {!eppListo && (
            <EppGate
              accent={accent}
              rgba={color.rgba}
              items={INSTRUMENTOS}
              titulo="Antes de medir: equípate"
              subtitulo="Identifica tus instrumentos de medición"
              verbo="instrumentos de medición"
              intro="Para estudiar el tiro hay que medirlo. Entre el material de abajo, selecciona solo los 3 instrumentos de medición (no el balón ni el equipo del jugador) para entrar."
              onEntrar={() => setEppListo(true)}
            />
          )}
        </>
      }
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono="fa-futbol" titulo={showGol ? "Ocultar portería del problema" : "Mostrar el escenario del gol"} activo={showGol} onClick={toggleGol} />
          <BotonHerramienta icono={pausado ? "fa-play" : "fa-pause"} titulo={pausado ? "Reanudar" : "Pausar"} activo={!pausado} onClick={() => setPausado((p) => !p)} />
          <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar la cámara" activo={autoRotate} onClick={() => setAutoRotate((v) => !v)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reset} />
        </>
      }
      leyenda={
        <>
          <div style={{ fontSize: 14, fontWeight: 900, color: accent, ...NUM }}>{ecuacion}</div>
          <LegItem col={ORO} txt="vértice (arrástralo)" />
          <LegItem col={EJE} txt="eje de simetría" />
          <LegItem col={VERDE} txt="cero: donde cae" />
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
              <Bloque titulo="Coeficientes de h(x) = a·x² + b·x + c" icono="fa-sliders">
                <Deslizador label="Apertura (a)" icon="fa-a" colr={accent}
                  valor={fmtNum(a, 2)} min={A_MIN} max={A_MAX} step={A_STEP} value={a} onChange={cambiarA}
                  hintL="más negativo: arco cerrado" hintR="cerca de 0: abierto" />
                <Deslizador label="Inclinación de salida (b)" icon="fa-b" colr="#7fb0e0"
                  valor={fmtNum(b, 1)} min={B_MIN} max={B_MAX} step={B_STEP} value={b} onChange={cambiarB}
                  hintL="sube el alcance y la altura" />
                <Deslizador label="Altura inicial (c)" icon="fa-arrow-up-from-ground-water" colr={ORO}
                  valor={`${fmtNum(c, 1)} m`} min={C_MIN} max={C_MAX} step={C_STEP} value={c} onChange={cambiarC}
                  hintL="desde dónde sale el balón" />
                <p style={{ margin: 0, color: T.text3, textAlign: "center" }}>
                  <i className="fa-solid fa-hand-pointer" style={{ marginRight: 6, color: accent }} />
                  o <strong style={{ color: T.text2 }}>arrastra el vértice</strong> (el punto dorado) en la escena: a se mantiene.
                </p>
              </Bloque>

              <Bloque titulo={`El balón en el arco (x = ${GOL.porteriaX} m)`} icono="fa-futbol">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="Altura h(25)" value={`${fmtNum(hPorteria, 2)} m`} col={ORO} />
                  <Dato label="Travesaño" value={`${fmtNum(GOL.travesano, 2)} m`} col="#9fb2c8" />
                </div>
                <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: `1px solid ${(enAire ? (balonSupera ? ROJO : VERDE) : WARN)}55`, background: `${(enAire ? (balonSupera ? ROJO : VERDE) : WARN)}12`, color: T.text2 }}>
                  {enAire ? (
                    <>Comparación: <strong style={{ color: balonSupera ? ROJO : VERDE, ...NUM }}>{fmtNum(hPorteria, 2)} m {balonSupera ? ">" : "≤"} {fmtNum(GOL.travesano, 2)} m</strong>. {balonSupera
                      ? "El balón pasa por ENCIMA del travesaño: con esta trayectoria sale por arriba del arco. Baja b o sube |a| para que llegue más bajo."
                      : "El balón pasa por DEBAJO del travesaño: a esta altura entra dentro del marco."}</>
                  ) : (
                    <>Con estos coeficientes el balón ya tocó el suelo antes de los {GOL.porteriaX} m (alcance {fmtNum(land, 1)} m): no llega a la portería.</>
                  )}
                </p>
                <p style={{ margin: 0, color: T.text3 }}>
                  La actividad usa este modelo para comparar h(25) con la altura del travesaño; ajusta a, b y c para ver cuándo el balón pasa por encima o por debajo.
                </p>
              </Bloque>

              <Bloque titulo="Las partes de la parábola" icono="fa-square-root-variable">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="Altura máxima" value={`${fmtNum(vert.h, 2)} m`} col={ORO} />
                  <Dato label="Alcance (x_v)" value={`${fmtNum(vert.x, 2)} m`} col={accent} />
                  <Dato label="Eje de simetría" value={`x = ${fmtNum(eje, 2)}`} col={EJE} />
                  <Dato label="Discriminante" value={fmtNum(D, 2)} col={D >= 0 ? VERDE : ROJO} />
                </div>
                <p style={{ margin: 0, color: T.text2 }}>
                  Ceros (toca el suelo): <strong style={{ color: VERDE }}>{cerosTxt}</strong>. Como <strong style={{ color: accent }}>a = {fmtNum(a, 2)}</strong> es negativo, la parábola <strong>abre hacia abajo</strong>: el vértice es el punto <strong style={{ color: ORO }}>más alto</strong>. El discriminante <strong style={{ color: D >= 0 ? VERDE : ROJO }}>{D >= 0 ? "≥ 0" : "< 0"}</strong> indica que {D > 0 ? "cruza el eje X en dos puntos" : D === 0 ? "lo toca en un punto" : "no toca el suelo en este tramo"}.
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
              <Bloque titulo="Reto de cálculo" icono="fa-calculator">
                <PrediccionVerticeCard
                  accent={accent}
                  aLive={a}
                  bLive={b}
                  cLive={c}
                  mejor={mejorEstrellas}
                  onResultado={registraEstrellas}
                  playSfx={sonido ? (ok) => (ok ? audioRef.current?.correcto() : audioRef.current?.incorrecto()) : undefined}
                />
              </Bloque>
              <Bloque titulo="Reto de la actividad" icono="fa-trophy">
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
              </Bloque>
            </>
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="Del álgebra a la geometría" icono="fa-chart-line">
                <p style={{ margin: 0, color: T.text2 }}>
                  La ecuación <strong style={{ color: T.text }}>h(x) = a·x² + b·x + c</strong> y la <strong style={{ color: accent }}>parábola</strong> son lo mismo visto de dos formas. Cada número del álgebra tiene un significado en el dibujo: por eso resolver la ecuación es <em>leer</em> la curva.
                </p>
              </Bloque>
              <Bloque titulo="Las cuatro partes" icono="fa-shapes">
                <Parte col={accent} icon="fa-up-down" titulo="Apertura (signo de a)">
                  a &lt; 0 abre hacia abajo (un tiro); a &gt; 0 hacia arriba. Cuanto mayor |a|, más cerrada la curva.
                </Parte>
                <Parte col={ORO} icon="fa-mountain" titulo="Vértice x = −b/2a">
                  El punto más alto (o más bajo). Aquí está la altura máxima del balón.
                </Parte>
                <Parte col={VERDE} icon="fa-down-long" titulo="Ceros (raíces)">
                  Donde la parábola cruza el eje X: el balón toca el suelo. Se obtienen con la fórmula general.
                </Parte>
                <Parte col={EJE} icon="fa-arrows-up-to-line" titulo="Eje de simetría x = x_v">
                  La recta vertical que parte la parábola en dos mitades espejo.
                </Parte>
              </Bloque>
              <Bloque titulo="El discriminante" icono="fa-code-compare">
                <p style={{ margin: 0, color: T.text2 }}>
                  <strong style={{ color: T.text }}>D = b² − 4ac</strong> dice <strong>cuántos ceros</strong> tiene la parábola sin resolverla:
                </p>
                <div style={{ display: "grid", gap: 5, color: T.text2 }}>
                  <span><strong style={{ color: VERDE }}>D &gt; 0</strong> → dos ceros (cruza el suelo dos veces)</span>
                  <span><strong style={{ color: ORO }}>D = 0</strong> → un cero (apenas lo toca)</span>
                  <span><strong style={{ color: ROJO }}>D &lt; 0</strong> → ningún cero real (no lo toca)</span>
                </div>
              </Bloque>
              <Bloque titulo="En la vida real (México)" icono="fa-location-dot">
                <p style={{ margin: 0, color: T.text2 }}>
                  La parábola modela <strong>todo lo que sube y cae</strong>: un tiro libre de la Selección, el chorro de una fuente en el Zócalo, la trayectoria de un cohete, o el cable de un puente. También aparece en las <strong>antenas parabólicas</strong> y en los faros, porque concentran las señales en el foco.
                </p>
              </Bloque>
              <Bloque titulo="Para empezar" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>
                  Empieza con el balón por defecto <strong style={{ color: accent }}>h(x) = −0.04x² + 1.2x</strong>: vértice en <strong style={{ color: ORO }}>(15, 9)</strong> y ceros en <strong style={{ color: VERDE }}>0 y 30</strong>. Luego sube <strong>b</strong> para llegar más lejos, o acerca <strong>a</strong> a cero para abrir el arco.
                </p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={PARABOLA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
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

/* ── Fila de "parte" en la teoría ────────────────────────────────────── */
function Parte({ col, icon, titulo, children }: { col: string; icon: string; titulo: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
      <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: col, background: `${col}1f` }}>
        <i className={`fa-solid ${icon}`} />
      </div>
      <div style={{ color: T.text2, lineHeight: 1.5 }}>
        <strong style={{ color: T.text, display: "block", marginBottom: 2 }}>{titulo}</strong>
        {children}
      </div>
    </div>
  );
}

/* ── Reto de cálculo: predice el vértice con x = −b/2a ─────────────────── */
function PrediccionVerticeCard({
  accent,
  aLive,
  bLive,
  cLive,
  mejor,
  onResultado,
  playSfx,
}: {
  accent: string;
  aLive: number;
  bLive: number;
  cLive: number;
  mejor: number;
  onResultado: (estrellas: number) => void;
  playSfx?: (ok: boolean) => void;
}) {
  const [snap, setSnap] = useState<{ a: number; b: number; c: number } | null>(null);
  const [val, setVal] = useState("");
  const [intentos, setIntentos] = useState(0);
  const [check, setCheck] = useState(false);
  const [estrellas, setEstrellas] = useState<number | null>(null);

  const tomarLectura = () => {
    setSnap({ a: aLive, b: bLive, c: cLive });
    setVal("");
    setIntentos(0);
    setCheck(false);
    setEstrellas(null);
  };

  const xvEsp = snap ? -snap.b / (2 * snap.a) : 0;
  const hvEsp = snap ? evalH(snap.a, snap.b, snap.c, xvEsp) : 0;
  const num = Number((val || "").trim().replace(",", "."));
  const okActual = snap !== null && val.trim() !== "" && !Number.isNaN(num) && Math.abs(num - xvEsp) <= Math.max(0.5, Math.abs(xvEsp) * 0.04);

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
    <div style={{ ...card, padding: "16px" }}>
      <Eyebrow>
        <i className="fa-solid fa-calculator" style={{ marginRight: 8, color: accent }} />
        Predice el vértice
      </Eyebrow>

      <div style={{ fontSize: 13.5, color: T.text2, lineHeight: 1.55, marginBottom: 14 }}>
        Toma una lectura de los coeficientes actuales y calcula la coordenada x del vértice (el alcance del punto más alto) con{" "}
        <strong style={{ color: accent, ...NUM }}>x = −b / (2·a)</strong>. Compruébalo contra la lectura de la escena.
      </div>

      {!snap ? (
        <button className="calc-btn calc-btn-primary" onClick={tomarLectura}>
          <i className="fa-solid fa-camera" style={{ marginRight: 8 }} />
          Tomar lectura de los coeficientes
        </button>
      ) : (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
            <Snap label="a" value={fmtNum(snap.a, 2)} col={accent} />
            <Snap label="b" value={fmtNum(snap.b, 1)} col={"#7fb0e0"} />
            <Snap label="c" value={`${fmtNum(snap.c, 1)} m`} col={ORO} />
          </div>

          <div style={{ fontSize: 14, fontWeight: 800, color: T.text2, marginBottom: 7 }}>¿Cuál es x del vértice? (m)</div>
          <div style={{ display: "flex", gap: 9, alignItems: "center", maxWidth: "100%" }}>
            <input
              className="calc-in"
              type="number"
              inputMode="decimal"
              placeholder="m"
              value={val}
              onChange={(e) => { setVal(e.target.value); setCheck(false); }}
              style={{ flex: 1, borderColor: check ? (okActual ? OK : WARN) : undefined }}
            />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text2 }}>m</span>
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
            <div style={{ marginTop: 14, borderRadius: 13, border: `1px solid ${okActual ? OK : WARN}66`, background: `${okActual ? OK : WARN}14`, padding: "14px 16px", fontSize: 13, color: T.text, lineHeight: 1.5 }}>
              {okActual ? (
                <>
                  <div style={{ fontWeight: 900, color: OK, marginBottom: 6 }}>
                    <i className="fa-solid fa-trophy" style={{ marginRight: 8 }} />
                    ¡Correcto! x = {fmtNum(xvEsp, 1)} m
                  </div>
                  <div style={{ color: T.text2, ...NUM }}>
                    x = −({fmtNum(snap.b, 1)}) / (2 × {fmtNum(snap.a, 2)}) = {fmtNum(xvEsp, 1)} m. Ahí la altura máxima es h = {fmtNum(hvEsp, 1)} m, igual que el punto dorado de la escena.
                  </div>
                </>
              ) : (
                <div style={{ color: "#FFB27A" }}>
                  <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 8 }} />
                  Aún no. Sustituye b y a en x = −b / (2·a) (ojo con los signos: a es negativo). Vuelve a intentarlo.
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
      <div style={{ fontSize: 14, fontWeight: 800, color: T.text3 }}>{label}</div>
      <div style={{ marginTop: 4, fontSize: 14, fontWeight: 900, color: col ?? T.text, ...NUM }}>{value}</div>
    </div>
  );
}
