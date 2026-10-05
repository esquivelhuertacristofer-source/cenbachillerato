"use client";

/**
 * Laboratorio 3D — Modelado y estimación con cónicas.
 * Pensamiento Matemático IV («Trigonometría y geometría analítica»).
 * Propósito PM-IV P07: aplicar ecuaciones con dos variables para estimar.
 *
 * Tres modos en un mismo visor:
 *   • CORTAR EL CONO — un cono de doble napa y un plano inclinable generan las
 *     cuatro cónicas (circunferencia, elipse, parábola, hipérbola) según el
 *     ángulo del plano.
 *   • ANTENA (parábola) — y = 0.25·x²: los rayos paralelos al eje se concentran
 *     en el FOCO (0, 1).
 *   • COBERTURA (círculo) — x² + y² = 25: la casa (3, 4) cae justo en el borde.
 *
 * Contenido VERBATIM del Modelo MCCEMS 2025 (anclas PM-IV-P08-A1 / A2).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { EppGate, type EppItem } from "./_epp-gate";
import { FichaTeorica } from "./_ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { LabSfx } from "./lab-audio";
import { MODELADO_CONICAS_FICHA } from "./modelado-conicas-ficha";
import {
  VARIANTES,
  IDEAS,
  GLOSARIO,
  CONTEXTO,
  FUENTE,
  OBJETIVOS,
  CORTES_PRESET,
  clasificaCorte,
  GAMMA_PARABOLA,
  RETO_CONICAS,
  PARABOLA,
  COBERTURA,
  type Variante,
} from "./modelado-conicas-data";

const ModeladoConicasScene = dynamic(() => import("./ModeladoConicasScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-bezier-curve fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const ORO = "#ffd24a";
const VERDE = "#34D399";
const AZUL = "#5fb0ff";

// Pilar EQUIPARSE: el "equipo" del geómetra analítico (3 correctos + 3 distractores).
const INSTRUMENTOS: EppItem[] = [
  { key: "plano", nombre: "Plano cartesiano", icono: "fa-table-cells", ok: true, nota: "Ubica cada punto (x, y) y traza la cónica con precisión." },
  { key: "compas", nombre: "Compás", icono: "fa-compass-drafting", ok: true, nota: "Dibuja circunferencias de radio exacto a partir del centro." },
  { key: "calc", nombre: "Calculadora", icono: "fa-calculator", ok: true, nota: "Evalúa la ecuación y estima alturas y distancias." },
  { key: "imán", nombre: "Imán", icono: "fa-magnet", ok: false, nota: "Mide campos magnéticos; no interviene en geometría analítica." },
  { key: "probeta", nombre: "Probeta", icono: "fa-flask", ok: false, nota: "Mide volúmenes de líquido; aquí no se usa." },
  { key: "termo", nombre: "Termómetro", icono: "fa-temperature-half", ok: false, nota: "Mide temperatura; no aporta a modelar una cónica." },
];

const RETO_KEY = "cen-modelado-conicas-estimacion-reto";

function LabModeladoConicas({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Variante>("seccion");
  const [gammaDeg, setGammaDeg] = useState<number>(0); // ángulo del plano (modo sección)
  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // objetivos
  const [vioCirc, setVioCirc] = useState(false);
  const [vioElipse, setVioElipse] = useState(false);
  const [vioParabola, setVioParabola] = useState(false);
  const [vioHiperbola, setVioHiperbola] = useState(false);
  const [vioAntena, setVioAntena] = useState(false);
  const [vioCobertura, setVioCobertura] = useState(false);

  const [eppListo, setEppListo] = useState(false);
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

  const bump = () => setResetNonce((k) => k + 1);

  const clase = useMemo(() => clasificaCorte(gammaDeg), [gammaDeg]);

  // marca el "visto" de cada cónica según el ángulo del corte (en los handlers,
  // nunca en un effect, para no disparar renders en cascada)
  const marcarVisto = useCallback((g: number) => {
    const t = clasificaCorte(g).tipo;
    if (t === "circunferencia") setVioCirc(true);
    else if (t === "elipse") setVioElipse(true);
    else if (t === "parabola") setVioParabola(true);
    else if (t === "hiperbola") setVioHiperbola(true);
  }, []);

  const elegirModo = (m: Variante) => {
    setModo(m);
    if (sonido) audioRef.current?.blip();
    if (m === "parabola") setVioAntena(true);
    if (m === "circunferencia") setVioCobertura(true);
    if (m === "seccion") marcarVisto(gammaDeg);
  };

  const ponerCorte = (g: number) => {
    setModo("seccion");
    setGammaDeg(g);
    marcarVisto(g);
    if (sonido) audioRef.current?.blip();
  };

  const reset = () => {
    setModo("seccion");
    setGammaDeg(0);
    bump();
  };

  const modoActual = VARIANTES.find((v) => v.id === modo) ?? VARIANTES[0]!;

  const objetivos = [
    { txt: "Equípate con el instrumental de geometría analítica", done: eppListo },
    { txt: "Genera la circunferencia y la elipse cortando el cono", done: vioCirc && vioElipse },
    { txt: "Inclina el plano hasta quedar paralelo a la línea dorada: ahí la elipse se abre en parábola", done: vioParabola },
    { txt: "Obtén la parábola y la hipérbola variando el ángulo", done: vioParabola && vioHiperbola },
    { txt: "Modela la antena y localiza su foco", done: vioAntena },
    { txt: "Estima el alcance con la circunferencia de cobertura", done: vioCobertura },
    { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
  ];
  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-bezier-curve" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Las cónicas: cortar un cono con un plano</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 400, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: según el ángulo del plano, el corte de un cono produce una circunferencia, una elipse, una parábola o una hipérbola. Cada una tiene una ecuación con dos variables que permite modelar y estimar fenómenos reales, como una antena parabólica (y = 0.25·x²) o el alcance de una señal (x² + y² = 25).
      </div>
    </div>
  );

  const lecturaCorta = modo === "seccion"
    ? <>γ = {gammaDeg.toFixed(0)}° → {clase.nombre}</>
    : modo === "parabola"
      ? <>Rayos paralelos al eje → todos al foco (0, 1)</>
      : <>3² + 4² = 25 = r²: la casa está en el borde</>;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <>
          <SceneBoundary fallback={sceneFallback}>
            <ModeladoConicasScene modo={modo} gammaDeg={gammaDeg} accent={accent} pausado={pausado} autoRotate={autoRotate} resetNonce={resetNonce} />
          </SceneBoundary>
          {!eppListo && (
            <EppGate
              accent={accent}
              rgba={color.rgba}
              items={INSTRUMENTOS}
              titulo="Prepara tu mesa de geometría analítica"
              subtitulo="Antes de modelar las cónicas, equípate con lo correcto"
              intro={`Para ubicar puntos (x, y), trazar circunferencias y estimar con la ecuación necesitas el instrumental adecuado. Selecciona solo las ${INSTRUMENTOS.filter((i) => i.ok).length} piezas que sirven (deja fuera lo que mide otra cosa).`}
              verbo="trazo y cálculo"
              onEntrar={() => {
                setEppListo(true);
                if (sonido) audioRef.current?.blip();
              }}
            />
          )}
        </>
      }
      modos={{
        opciones: VARIANTES.map((v) => ({ id: v.id, etiqueta: v.nombre, icono: v.icon })),
        valor: modo,
        cambiar: (id) => elegirModo(id as Variante),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono={pausado ? "fa-play" : "fa-pause"} titulo={pausado ? "Reanudar" : "Pausar"} activo={!pausado} onClick={() => setPausado((p) => !p)} />
          <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar la cámara" activo={autoRotate} onClick={() => setAutoRotate((v) => !v)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reset} />
        </>
      }
      leyenda={modo === "seccion" ? <MedidorAngulo gamma={gammaDeg} compacto /> : undefined}
      lectura={lecturaCorta}
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
              </Bloque>

              {modo === "seccion" && (
                <Bloque titulo="El experimento: inclina el plano" icono="fa-scissors">
                  <MedidorAngulo gamma={gammaDeg} />
                  <Deslizador
                    label="ángulo del plano γ"
                    icon="fa-angle"
                    colr={clase.color}
                    valor={`${gammaDeg.toFixed(0)}°`}
                    min={0}
                    max={85}
                    step={1}
                    value={gammaDeg}
                    hintL="horizontal"
                    hintR="muy inclinado"
                    onChange={(g) => { setModo("seccion"); setGammaDeg(g); marcarVisto(g); }}
                  />
                  <p style={{ margin: 0, color: T.text2 }}>
                    El plano es paralelo a la línea dorada cuando γ = {GAMMA_PARABOLA}°: justo ahí la curva deja de cerrarse.
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 8 }}>
                    {CORTES_PRESET.map((p) => {
                      const c = clasificaCorte(p.gamma);
                      return (
                        <button
                          key={p.tipo}
                          type="button"
                          onClick={() => ponerCorte(p.gamma)}
                          style={{ cursor: "pointer", textAlign: "left", padding: "10px 12px", borderRadius: 12, border: `1px solid ${Math.abs(gammaDeg - p.gamma) < 0.5 ? c.color : T.line}`, background: T.inset, color: T.text, fontSize: 14, fontWeight: 800 }}
                        >
                          <i className={`fa-solid ${c.icono}`} style={{ marginRight: 7, color: c.color }} aria-hidden />{c.nombre}
                          <div style={{ fontSize: 14, fontWeight: 500, color: T.text2 }}>γ = {p.gamma}°</div>
                        </button>
                      );
                    })}
                  </div>
                </Bloque>
              )}

              <Bloque titulo={modo === "seccion" ? "La cónica del corte" : modo === "parabola" ? "El modelo de la antena" : "El modelo de cobertura"} icono="fa-magnifying-glass-chart">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  {modo === "seccion" ? (
                    <>
                      <Dato label="tipo de cónica" value={clase.nombre} col={clase.color} />
                      <Dato label="ángulo del plano" value={`${gammaDeg.toFixed(0)}°`} col={AZUL} />
                    </>
                  ) : modo === "parabola" ? (
                    <>
                      <Dato label="coeficiente a" value={`${PARABOLA.a}`} col={ORO} />
                      <Dato label="foco" value={`(0, ${PARABOLA.foco})`} col={VERDE} />
                      <Dato label="y a x = 2" value={`${PARABOLA.a * 4} m`} col={AZUL} />
                    </>
                  ) : (
                    <>
                      <Dato label="radio r" value={`${COBERTURA.radio} km`} col={AZUL} />
                      <Dato label="casa: 3²+4²" value={`${COBERTURA.casaDist2}`} col={VERDE} />
                      <Dato label="r²" value={`${COBERTURA.radio * COBERTURA.radio}`} col={AZUL} />
                    </>
                  )}
                </div>
                <p style={{ margin: 0, color: T.text2 }}>
                  {modo === "seccion" ? (
                    <><strong style={{ color: clase.color }}>{clase.ecuacion}</strong>. {clase.descripcion}</>
                  ) : modo === "parabola" ? (
                    <>La antena <strong style={{ color: ORO }}>y = 0.25·x²</strong> pasa por (1, 0.25). Su <strong style={{ color: VERDE }}>foco</strong> está en (0, 1/(4a)) = (0, 1): ahí va el receptor, porque los rayos paralelos al eje se concentran en ese punto.</>
                  ) : (
                    <>La cobertura es <strong style={{ color: AZUL }}>x² + y² = 25</strong>. Para la casa (3, 4): 3²+4² = 9+16 = <strong style={{ color: VERDE }}>25 = r²</strong>, justo en el borde. Si x²+y² &lt; 25 hay señal y si &gt; 25 no la hay.</>
                  )}
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
            <RetoNumericoCard
              reto={RETO_CONICAS}
              accent={accent}
              aprobado={ejercicioAprobado}
              onAprobado={() => setEjercicioAprobado(true)}
              playSfx={() => {
                if (sonido) audioRef.current?.correcto();
              }}
            />
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="Qué son las secciones cónicas" icono="fa-bezier-curve">
                <p style={{ margin: 0, color: T.text2 }}>
                  Las <strong style={{ color: T.text }}>secciones cónicas</strong> —circunferencia, parábola, elipse e hipérbola— son las curvas que se obtienen al cortar un cono con un plano. El <strong style={{ color: accent }}>ángulo del plano</strong> decide cuál aparece, y cada una tiene una ecuación con dos variables que sirve para <strong style={{ color: AZUL }}>modelar y estimar</strong>.
                </p>
              </Bloque>
              <Bloque titulo="Las cuatro cónicas" icono="fa-shapes">
                <Parte col={AZUL} icon="fa-circle" titulo="Circunferencia — plano horizontal">
                  (x−h)²+(y−k)²=r². Todos los puntos a la misma distancia r del centro. Modela el alcance de una señal.
                </Parte>
                <Parte col={VERDE} icon="fa-egg" titulo="Elipse — plano inclinado">
                  x²/a²+y²/b²=1. Curva cerrada con dos focos. Modela las órbitas (Kepler) y los arcos.
                </Parte>
                <Parte col={ORO} icon="fa-satellite-dish" titulo="Parábola — paralelo a la generatriz">
                  y=a·x². Concentra los rayos paralelos en el foco: antenas, telescopios y faros.
                </Parte>
                <Parte col="#f0a6ff" icon="fa-bezier-curve" titulo="Hipérbola — corta las dos napas">
                  x²/a²−y²/b²=1. Dos ramas abiertas. Modela la proporcionalidad inversa (ley de Boyle) y la navegación.
                </Parte>
              </Bloque>
              <Bloque titulo="En la vida real (México)" icono="fa-location-dot">
                <p style={{ margin: 0, color: T.text2 }}>
                  Las antenas <strong>DISH/SKY</strong> y el internet satelital usan reflectores <strong style={{ color: ORO }}>parabólicos</strong>; el satélite <strong>Mexsat</strong> sigue una órbita <strong style={{ color: VERDE }}>elíptica</strong> (Kepler); la <strong>cobertura</strong> de una antena de telefonía se modela con una <strong style={{ color: AZUL }}>circunferencia</strong> x²+y²≤r².
                </p>
              </Bloque>
              <Bloque titulo="Modelar y estimar en 3 pasos" icono="fa-route">
                <p style={{ margin: 0, color: T.text2 }}>
                  (1) Identifica qué cónica describe la situación. (2) Escribe su ecuación con los datos. (3) Úsala para estimar el valor buscado.
                </p>
                <p style={{ margin: 0, color: T.text2 }}>
                  Para el reto A2: la antena <strong style={{ color: ORO }}>y = a·x²</strong> pasa por (1, 0.25), así que a = 0.25; a x = 2 sube 0.25·4 = 1 m. El alcance de 5 km es <strong style={{ color: AZUL }}>x²+y²=25</strong>, y la casa (3, 4) da 3²+4² = 25: está en el borde.
                </p>
              </Bloque>
              <Bloque titulo="Ideas clave" icono="fa-flask-vial">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {IDEAS.map((idea, i) => <li key={i}>{idea}</li>)}
                </ul>
                <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, background: `rgba(${color.rgba},0.08)`, border: `1px solid rgba(${color.rgba},0.28)`, color: T.text }}>
                  <strong style={{ color: accent }}>Contexto. </strong>{CONTEXTO}
                </p>
              </Bloque>
              <Bloque titulo="Glosario" icono="fa-spell-check">
                {GLOSARIO.map((g) => (
                  <div key={g.termino} style={{ padding: "10px 12px", borderRadius: 11, background: T.inset, border: `1px solid ${T.line}` }}>
                    <div style={{ fontWeight: 800, color: T.text }}>{g.termino}</div>
                    <div style={{ color: T.text2 }}>{g.definicion}</div>
                    <div style={{ color: T.text3, marginTop: 4 }}><i className="fa-solid fa-angle-right" style={{ marginRight: 5, color: accent }} aria-hidden />{g.ejemplo}</div>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={MODELADO_CONICAS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3 }}>
                <i className="fa-solid fa-book" style={{ marginRight: 6 }} aria-hidden />{FUENTE}
              </p>
              {/* objetivos verbatim (referencia para lectura) */}
              <div style={{ display: "none" }} aria-hidden>{OBJETIVOS.join(" · ")}</div>
            </>
          ),
        },
      ]}
    />
  );
}

/* ── Medidor del ángulo: dónde cae γ entre las cuatro cónicas ─────────── */
function MedidorAngulo({ gamma, compacto = false }: { gamma: number; compacto?: boolean }) {
  const MAX = 85;
  const tol = 1.6;
  const pct = (g: number) => `${(g / MAX) * 100}%`;
  const c = clasificaCorte(gamma);
  const zonas = [
    { de: 0, a: tol, col: "#5fb0ff" },
    { de: tol, a: GAMMA_PARABOLA - tol, col: "#34D399" },
    { de: GAMMA_PARABOLA - tol, a: GAMMA_PARABOLA + tol, col: "#ffd24a" },
    { de: GAMMA_PARABOLA + tol, a: MAX, col: "#f0a6ff" },
  ];
  return (
    <div style={{ display: "grid", gap: 6, width: compacto ? 176 : undefined, marginTop: compacto ? 4 : 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>
        <span style={{ color: c.color }}>{c.nombre}</span>
        <span style={{ fontFamily: "ui-monospace, monospace" }}>{gamma.toFixed(0)}°</span>
      </div>
      <div style={{ position: "relative", height: compacto ? 10 : 14, borderRadius: 7, background: "rgba(255,255,255,0.08)" }}>
        {zonas.map((z, i) => (
          <div key={i} style={{ position: "absolute", top: 0, bottom: 0, left: pct(z.de), width: `calc(${pct(z.a)} - ${pct(z.de)})`, background: z.col, opacity: 0.75, minWidth: i === 0 || i === 2 ? 4 : undefined }} />
        ))}
        <div style={{ position: "absolute", top: -4, bottom: -4, left: `calc(${pct(gamma)} - 2px)`, width: 4, borderRadius: 2, background: "#fff", boxShadow: "0 0 8px rgba(255,255,255,0.8)", transition: "left 120ms linear" }} />
      </div>
      {!compacto && (
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: T.text3 }}>
          <span>0° círculo</span><span>{GAMMA_PARABOLA}° parábola</span><span>85°</span>
        </div>
      )}
    </div>
  );
}

/* ── Tarjeta de "parte" en la teoría ──────────────────────────────────── */
function Parte({ col, icon, titulo, children }: { col: string; icon: string; titulo: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
      <div style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: col, background: `${col}1f` }}>
        <i className={`fa-solid ${icon}`} aria-hidden />
      </div>
      <div style={{ color: T.text2 }}>
        <strong style={{ color: T.text, display: "block", marginBottom: 2 }}>{titulo}</strong>
        {children}
      </div>
    </div>
  );
}

export { LabModeladoConicas };
export default LabModeladoConicas;
