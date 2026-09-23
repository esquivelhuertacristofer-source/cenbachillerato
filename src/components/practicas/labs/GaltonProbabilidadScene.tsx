"use client";

/**
 * Escena 3D del laboratorio "Azar, frecuencia y probabilidad — el tablero de
 * Galton" (PM-VI-P05). Tres modos:
 *
 *  - laplace:      el espacio muestral Ω se enumera objeto por objeto (las 6
 *                  caras del dado, los 4 resultados de dos monedas, las 52
 *                  cartas). Los que pertenecen al evento se elevan y se
 *                  encienden; los del complemento se apagan. La fracción que
 *                  el alumno ve en el panel es el conteo de lo que está
 *                  mirando, no un número escrito a mano.
 *  - galton:       filas de clavos y cajones acumuladores. Cada bola baja
 *                  desviándose a derecha o izquierda; el cajón donde cae es el
 *                  número de desvíos a la derecha. La curva binomial teórica
 *                  se dibuja encima de las barras para comparar lo que pasó
 *                  con lo que la teoría predice.
 *  - convergencia: la frecuencia relativa del evento frente al número de
 *                  repeticiones, en escala logarítmica, contra la recta de la
 *                  probabilidad teórica. El embudo que se cierra ES la ley de
 *                  los grandes números.
 *
 * La simulación NO vive aquí: el shell decide qué bolas caen y cuántas
 * repeticiones van, y esta escena solo interpola posiciones en useFrame
 * mutando refs (nunca estado), conforme al React Compiler. NO se usa <Text> de
 * drei (cuelga el chunk con Turbopack): el texto del lienzo va en <Html>.
 */

import * as THREE from "three";
import { useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Escenario } from "./_escenario";
import { CurvaTubo } from "./_tablero";
import {
  type Modo,
  type ExperimentoDef,
  type EventoDef,
  type PuntoConvergencia,
  CONV_MAX_REPS,
} from "./galton-probabilidad-data";

/** Una bola en vuelo: su ruta ya está decidida, aquí solo se dibuja. */
export interface Vuelo {
  id: number;
  /** Un 0 (izquierda) o 1 (derecha) por fila de clavos. */
  pasos: number[];
  /** Momento en que se soltó, en ms de performance.now(). */
  t0: number;
}

export interface GaltonSceneProps {
  modo: Modo;
  // ── laplace
  exp: ExperimentoDef;
  evento: EventoDef;
  // ── galton
  filas: number;
  p: number;
  /** Cuántas bolas cayeron en cada cajón (longitud filas+1). */
  conteos: number[];
  /** Probabilidad teórica de cada cajón (binomial). */
  teorica: number[];
  vuelos: Vuelo[];
  /** Duración del vuelo completo, en ms. */
  duracionVuelo: number;
  // ── convergencia
  traza: PuntoConvergencia[];
  probTeorica: number;
  playing: boolean;
  accent: string;
  modoColor: string;
  resetNonce: number;
}

type Pt = [number, number, number];

/* ── Etiqueta flotante ────────────────────────────────────────────────── */
function Etiqueta({ pos, children, df = 10, col }: { pos: Pt; children: ReactNode; df?: number; col?: string }) {
  return (
    <Html position={pos} center distanceFactor={df} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 11px",
          borderRadius: 999,
          background: "rgba(4,10,22,0.82)",
          border: `1px solid ${col ?? "rgba(255,255,255,0.22)"}`,
          color: "#fff",
          fontSize: 12,
          fontWeight: 800,
          whiteSpace: "nowrap",
          boxShadow: "0 6px 18px -8px #000",
        }}
      >
        {children}
      </div>
    </Html>
  );
}

/** Texto pequeño anclado a un punto, sin fondo. */
function Letra({ pos, children, df = 8, col = "#e2e8f0", size = 14 }: { pos: Pt; children: ReactNode; df?: number; col?: string; size?: number }) {
  return (
    <Html position={pos} center distanceFactor={df} zIndexRange={[15, 0]} style={{ pointerEvents: "none" }}>
      <div style={{ color: col, fontSize: size, fontWeight: 900, whiteSpace: "nowrap", textShadow: "0 2px 6px #000" }}>{children}</div>
    </Html>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * MODO 1 · PROBABILIDAD CLÁSICA — el espacio muestral, objeto por objeto
 * ════════════════════════════════════════════════════════════════════════ */

/** Un resultado de Ω. Si pertenece al evento, flota y brilla. */
function Resultado({
  pos,
  dentro,
  forma,
  col,
  colApagado,
  playing,
  fase,
}: {
  pos: Pt;
  dentro: boolean;
  forma: "cubo" | "disco" | "carta";
  col: string;
  colApagado: string;
  playing: boolean;
  fase: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((s) => {
    const g = ref.current;
    if (!g) return;
    const t = playing ? s.clock.elapsedTime : 0;
    // Los del evento suben y respiran; los del complemento se quedan abajo.
    const objetivo = dentro ? 0.42 + Math.sin(t * 1.5 + fase) * 0.07 : 0;
    g.position.y = pos[1] + (g.position.y - pos[1]) * 0.86 + objetivo * 0.14;
    g.rotation.y = dentro ? Math.sin(t * 0.7 + fase) * 0.35 : 0;
  });

  const color = dentro ? col : colApagado;
  const emissive = dentro ? col : "#000000";

  return (
    <group ref={ref} position={pos}>
      {forma === "cubo" && (
        <mesh castShadow>
          <boxGeometry args={[0.72, 0.72, 0.72]} />
          <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={dentro ? 0.55 : 0} roughness={0.35} metalness={0.25} transparent opacity={dentro ? 1 : 0.55} />
        </mesh>
      )}
      {forma === "disco" && (
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.12, 32]} />
          <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={dentro ? 0.55 : 0} roughness={0.3} metalness={0.5} transparent opacity={dentro ? 1 : 0.55} />
        </mesh>
      )}
      {forma === "carta" && (
        <mesh castShadow>
          <boxGeometry args={[0.34, 0.5, 0.045]} />
          <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={dentro ? 0.5 : 0} roughness={0.5} metalness={0.05} transparent opacity={dentro ? 1 : 0.28} />
        </mesh>
      )}
    </group>
  );
}

function EscenaLaplace({ exp, evento, accent, playing }: { exp: ExperimentoDef; evento: EventoDef; accent: string; playing: boolean }) {
  const forma: "cubo" | "disco" | "carta" = exp.id === "dado" ? "cubo" : exp.id === "dosmonedas" ? "disco" : "carta";
  const cols = exp.columnas;
  const paso = exp.id === "baraja" ? 0.52 : 1.45;
  const pasoY = exp.id === "baraja" ? 0.78 : 2.05;
  const filas = Math.ceil(exp.omega.length / cols);
  const conEtiquetas = exp.omega.length <= 12;

  return (
    <group position={[0, 0.3, 0]}>
      {exp.omega.map((r, i) => {
        const c = i % cols;
        const f = Math.floor(i / cols);
        const x = (c - (cols - 1) / 2) * paso;
        const y = ((filas - 1) / 2 - f) * pasoY;
        const dentro = evento.pertenece(r);
        const col = exp.id === "baraja" ? (r.rojo ? "#f87171" : "#e2e8f0") : dentro ? accent : "#94a3b8";
        return (
          <group key={`${r.etq}-${i}`}>
            <Resultado pos={[x, y, 0]} dentro={dentro} forma={forma} col={dentro ? (exp.id === "baraja" ? accent : col) : col} colApagado="#64748b" playing={playing} fase={i * 0.6} />
            {conEtiquetas && (
              <Letra pos={[x, y + (forma === "cubo" ? 0.95 : 0.8), 0]} col={dentro ? "#ffffff" : "rgba(255,255,255,0.45)"} size={16} df={9}>
                {r.etq}
              </Letra>
            )}
          </group>
        );
      })}

      {/* Rótulo del espacio muestral */}
      <Etiqueta pos={[0, ((filas - 1) / 2) * pasoY + (exp.id === "baraja" ? 1.3 : 1.9), 0]} col={`${accent}88`} df={13}>
        <i className="fa-solid fa-layer-group" style={{ color: accent }} />
        {exp.omegaTexto}
      </Etiqueta>
      <Etiqueta pos={[0, -((filas - 1) / 2) * pasoY - (exp.id === "baraja" ? 1.1 : 1.5), 0]} col="rgba(255,255,255,0.24)" df={13}>
        <i className="fa-solid fa-circle-check" style={{ color: accent }} />
        {evento.notacion}
      </Etiqueta>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * MODO 2 · TABLERO DE GALTON
 * ════════════════════════════════════════════════════════════════════════ */

const DX = 0.62;
const DY = 0.55;
/** Altura máxima que puede alcanzar una barra de cajón. */
const ALTO_BARRA = 2.5;

/** Geometría del tablero para un número de filas dado. */
function geometria(filas: number) {
  const yPegTop = 0;
  const yPegBottom = yPegTop - (filas - 1) * DY;
  const yFloor = yPegBottom - 0.85 - ALTO_BARRA;
  const ySuelta = yPegTop + DY * 1.6;
  const altoTotal = ySuelta - yFloor;
  // El tablero crece con el número de filas; lo re-escalamos para que siempre
  // quepa en el mismo encuadre (si no, con 12 filas se sale de cámara).
  const escala = 6.1 / altoTotal;
  const centroY = (ySuelta + yFloor) / 2;
  return { yPegTop, yPegBottom, yFloor, ySuelta, escala, centroY };
}

/** Posición de una bola a lo largo de su ruta, en función del avance 0..1. */
function posicionVuelo(pasos: number[], u: number, g: ReturnType<typeof geometria>): [number, number] {
  const n = pasos.length;
  // Tramo 0: caída libre desde la boca hasta la primera fila de clavos.
  const tramos = n + 1;
  const t = Math.min(Math.max(u, 0), 1) * tramos;
  const i = Math.min(Math.floor(t), tramos - 1);
  const f = t - i;

  // Desvío acumulado antes del tramo i.
  let x = 0;
  for (let k = 0; k < Math.min(i, n); k++) x += (pasos[k]! === 1 ? 1 : -1) * (DX / 2);

  if (i === 0) {
    // Entra por la boca, todavía sin desviarse.
    return [0, g.ySuelta + (g.yPegTop - g.ySuelta) * f];
  }
  const yArriba = g.yPegTop - (i - 1) * DY;
  if (i <= n) {
    const dx = (pasos[i - 1]! === 1 ? 1 : -1) * (DX / 2);
    const yAbajo = i === n ? g.yFloor : g.yPegTop - i * DY;
    // Un pequeño salto al rebotar en el clavo.
    const arco = i === n ? 0 : Math.sin(f * Math.PI) * 0.09;
    return [x + dx * f, yArriba + (yAbajo - yArriba) * f + arco];
  }
  return [x, g.yFloor];
}

function BolaEnVuelo({ vuelo, filas, duracion, accent, playing }: { vuelo: Vuelo; filas: number; duracion: number; accent: string; playing: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const g = useMemo(() => geometria(filas), [filas]);
  const pausaU = useRef(0);

  useFrame(() => {
    const m = ref.current;
    if (!m) return;
    if (playing) pausaU.current = (performance.now() - vuelo.t0) / duracion;
    const [x, y] = posicionVuelo(vuelo.pasos, pausaU.current, g);
    m.position.set(x, y, 0);
  });

  return (
    <mesh ref={ref} castShadow>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.85} roughness={0.2} metalness={0.3} />
    </mesh>
  );
}

/** Barra de un cajón: crece con suavidad hasta la altura que le toca. */
function BarraCajon({ x, alturaObjetivo, yFloor, col, resaltada }: { x: number; alturaObjetivo: number; yFloor: number; col: string; resaltada: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const m = ref.current;
    if (!m) return;
    const h = Math.max(m.scale.y + (alturaObjetivo - m.scale.y) * 0.12, 0.0001);
    m.scale.y = h;
    m.position.set(x, yFloor + h / 2, 0);
  });
  return (
    <mesh ref={ref} castShadow>
      <boxGeometry args={[DX * 0.78, 1, 0.42]} />
      <meshStandardMaterial color={col} emissive={col} emissiveIntensity={resaltada ? 0.5 : 0.22} roughness={0.4} metalness={0.15} transparent opacity={0.92} />
    </mesh>
  );
}

function EscenaGalton({
  filas,
  conteos,
  teorica,
  vuelos,
  duracionVuelo,
  accent,
  modoColor,
  playing,
}: {
  filas: number;
  conteos: number[];
  teorica: number[];
  vuelos: Vuelo[];
  duracionVuelo: number;
  accent: string;
  modoColor: string;
  playing: boolean;
}) {
  const g = useMemo(() => geometria(filas), [filas]);

  const total = conteos.reduce((a, b) => a + b, 0);
  // Las barras se escalan contra la probabilidad teórica máxima, no contra el
  // máximo observado: así la barra y la curva son comparables a simple vista y
  // la barra no "salta" cada vez que un cajón toma la delantera.
  const refMax = Math.max(...teorica, 0.0001) * 1.35;
  const cajonModal = total > 0 ? conteos.indexOf(Math.max(...conteos)) : -1;

  // Clavos
  const clavos: Pt[] = [];
  for (let i = 0; i < filas; i++) {
    for (let j = 0; j <= i; j++) {
      clavos.push([(j - i / 2) * DX, g.yPegTop - i * DY, 0]);
    }
  }

  // Curva teórica, dibujada sobre los cajones.
  const puntosTeorica: Pt[] = teorica.map((pk, k) => [(k - filas / 2) * DX, g.yFloor + (pk / refMax) * ALTO_BARRA, 0.32]);

  return (
    <group position={[0, -g.centroY * g.escala + 0.45, 0]} scale={g.escala}>
      {/* Clavos */}
      {clavos.map((pos, i) => (
        <mesh key={i} position={pos} castShadow>
          <sphereGeometry args={[0.075, 10, 10]} />
          <meshStandardMaterial color="#cbd5e1" emissive="#94a3b8" emissiveIntensity={0.25} roughness={0.3} metalness={0.6} />
        </mesh>
      ))}

      {/* Boca de entrada */}
      <mesh position={[0, g.ySuelta + 0.18, 0]}>
        <torusGeometry args={[0.3, 0.055, 10, 28]} />
        <meshStandardMaterial color={modoColor} emissive={modoColor} emissiveIntensity={0.6} roughness={0.3} metalness={0.4} />
      </mesh>

      {/* Separadores de los cajones */}
      {Array.from({ length: filas + 2 }, (_, k) => (
        <mesh key={`sep-${k}`} position={[(k - 0.5 - filas / 2) * DX, g.yFloor + ALTO_BARRA / 2, 0]}>
          <boxGeometry args={[0.025, ALTO_BARRA, 0.5]} />
          <meshStandardMaterial color="#334155" transparent opacity={0.5} roughness={0.8} />
        </mesh>
      ))}

      {/* Piso */}
      <mesh position={[0, g.yFloor - 0.06, 0]} receiveShadow>
        <boxGeometry args={[(filas + 2) * DX, 0.1, 0.6]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>

      {/* Barras acumuladas */}
      {conteos.map((c, k) => {
        const frec = total > 0 ? c / total : 0;
        return (
          <BarraCajon
            key={k}
            x={(k - filas / 2) * DX}
            alturaObjetivo={Math.min((frec / refMax) * ALTO_BARRA, ALTO_BARRA)}
            yFloor={g.yFloor}
            col={k === cajonModal ? accent : modoColor}
            resaltada={k === cajonModal}
          />
        );
      })}

      {/* Curva binomial teórica */}
      <Line points={puntosTeorica} color="#f472b6" lineWidth={2.4} dashed={false} />
      {puntosTeorica.map((pt, k) => (
        <mesh key={`pt-${k}`} position={pt}>
          <sphereGeometry args={[0.07, 10, 10]} />
          <meshStandardMaterial color="#f472b6" emissive="#f472b6" emissiveIntensity={0.8} />
        </mesh>
      ))}

      {/* Bolas en vuelo */}
      {vuelos.map((v) => (
        <BolaEnVuelo key={v.id} vuelo={v} filas={filas} duracion={duracionVuelo} accent={accent} playing={playing} />
      ))}

      {/* Número de cajón */}
      {conteos.map((c, k) => (
        <Letra key={`lbl-${k}`} pos={[(k - filas / 2) * DX, g.yFloor - 0.42, 0]} col={k === cajonModal ? "#fff" : "rgba(255,255,255,0.5)"} size={13} df={7 / g.escala}>
          {k}
        </Letra>
      ))}

      <Etiqueta pos={[0, g.ySuelta + 0.85, 0]} col={`${modoColor}88`} df={11 / g.escala}>
        <i className="fa-solid fa-arrow-down" style={{ color: modoColor }} />
        {filas} filas de clavos · {filas + 1} cajones
      </Etiqueta>
      <Etiqueta pos={[((filas / 2) + 1.1) * DX, g.yFloor + ALTO_BARRA * 0.85, 0]} col="#f472b688" df={11 / g.escala}>
        <span style={{ width: 16, height: 3, background: "#f472b6", borderRadius: 2, display: "inline-block" }} />
        Teoría: C(n,k)·p^k·q^(n−k)
      </Etiqueta>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * MODO 3 · LEY DE LOS GRANDES NÚMEROS
 * ════════════════════════════════════════════════════════════════════════ */

const CONV_W = 8.2; // ancho del área de gráfica
const CONV_H = 4.6; // alto

/** n (1..CONV_MAX_REPS) → x en la gráfica, en escala logarítmica. */
function xDeN(n: number): number {
  const u = Math.log10(Math.max(n, 1)) / Math.log10(CONV_MAX_REPS);
  return -CONV_W / 2 + u * CONV_W;
}
/** frecuencia (0..1) → y en la gráfica. */
function yDeF(f: number): number {
  return -CONV_H / 2 + Math.min(Math.max(f, 0), 1) * CONV_H;
}

function EscenaConvergencia({ traza, probTeorica, accent, modoColor }: { traza: PuntoConvergencia[]; probTeorica: number; accent: string; modoColor: string }) {
  const puntos: Pt[] = traza.length >= 2 ? traza.map((p) => [xDeN(p.n), yDeF(p.frecuencia), 0.05]) : [];
  const yTeorica = yDeF(probTeorica);
  const ultimo = traza.length > 0 ? traza[traza.length - 1]! : null;

  const marcasN = [1, 10, 100, 1000, CONV_MAX_REPS];
  const marcasF = [0, 0.25, 0.5, 0.75, 1];

  return (
    <group position={[0.35, 0.35, 0]} scale={0.86}>
      {/* Rejilla horizontal */}
      {marcasF.map((f) => (
        <Line
          key={`h-${f}`}
          points={[
            [-CONV_W / 2, yDeF(f), 0] as Pt,
            [CONV_W / 2, yDeF(f), 0] as Pt,
          ]}
          color="#334155"
          lineWidth={1}
        />
      ))}
      {marcasF.map((f) => (
        <Letra key={`hl-${f}`} pos={[-CONV_W / 2 - 0.55, yDeF(f), 0]} col="rgba(255,255,255,0.5)" size={12} df={9}>
          {f.toFixed(2)}
        </Letra>
      ))}

      {/* Rejilla vertical (escala logarítmica) */}
      {marcasN.map((n) => (
        <Line
          key={`v-${n}`}
          points={[
            [xDeN(n), -CONV_H / 2, 0] as Pt,
            [xDeN(n), CONV_H / 2, 0] as Pt,
          ]}
          color="#334155"
          lineWidth={1}
        />
      ))}
      {marcasN.map((n) => (
        <Letra key={`vl-${n}`} pos={[xDeN(n), -CONV_H / 2 - 0.42, 0]} col="rgba(255,255,255,0.5)" size={12} df={9}>
          {n.toLocaleString("es-MX")}
        </Letra>
      ))}

      {/* Recta de la probabilidad teórica */}
      <Line
        points={[
          [-CONV_W / 2, yTeorica, 0.02] as Pt,
          [CONV_W / 2, yTeorica, 0.02] as Pt,
        ]}
        color="#f472b6"
        lineWidth={2.6}
      />
      <Etiqueta pos={[-CONV_W / 2 + 1.7, yTeorica + (probTeorica > 0.8 ? -0.42 : 0.42), 0.1]} col="#f472b688" df={11}>
        <span style={{ width: 16, height: 3, background: "#f472b6", borderRadius: 2, display: "inline-block" }} />
        P(A) teórica = {probTeorica.toFixed(4)}
      </Etiqueta>

      {/* Traza de la frecuencia relativa */}
      {puntos.length >= 2 && <CurvaTubo puntos={puntos} color={accent} grosor={0.054} />}

      {/* Punto actual */}
      {ultimo && (
        <>
          <mesh position={[xDeN(ultimo.n), yDeF(ultimo.frecuencia), 0.12]}>
            <sphereGeometry args={[0.13, 16, 16]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1} />
          </mesh>
          <Etiqueta pos={[xDeN(ultimo.n), yDeF(ultimo.frecuencia) + 0.5, 0.12]} col={`${accent}88`} df={10}>
            <i className="fa-solid fa-location-crosshairs" style={{ color: accent }} />
            n = {ultimo.n.toLocaleString("es-MX")} · {ultimo.frecuencia.toFixed(4)}
          </Etiqueta>
        </>
      )}

      {/* Rótulos de ejes */}
      <Etiqueta pos={[0, -CONV_H / 2 - 1.05, 0]} col={`${modoColor}66`} df={12}>
        <i className="fa-solid fa-repeat" style={{ color: modoColor }} />
        Repeticiones del experimento (escala logarítmica)
      </Etiqueta>
      <Etiqueta pos={[-CONV_W / 2 + 2.2, CONV_H / 2 + 0.55, 0]} col={`${modoColor}66`} df={12}>
        <i className="fa-solid fa-percent" style={{ color: modoColor }} />
        Frecuencia relativa del evento
      </Etiqueta>

      {traza.length === 0 && (
        <Etiqueta pos={[0, 0, 0.3]} col={`${accent}aa`} df={14}>
          <i className="fa-solid fa-play" style={{ color: accent }} />
          Pulsa «Repetir el experimento» para ver la convergencia
        </Etiqueta>
      )}
    </group>
  );
}

/* ── Cámara por modo ──────────────────────────────────────────────────── */
function camaraDe(modo: Modo, exp: ExperimentoDef): { position: Pt; fov: number } {
  if (modo === "laplace") {
    return exp.id === "baraja" ? { position: [0, 0.5, 10.5], fov: 42 } : { position: [0, 0.8, 9], fov: 42 };
  }
  if (modo === "galton") return { position: [0, 0.2, 11.5], fov: 40 };
  return { position: [0, 0.2, 10.5], fov: 42 };
}

export default function GaltonProbabilidadScene(props: GaltonSceneProps) {
  const { modo, exp, evento, filas, conteos, teorica, vuelos, duracionVuelo, traza, probTeorica, playing, accent, modoColor, resetNonce } = props;
  const cam = camaraDe(modo, exp);

  return (
    <Canvas key={`${modo}-${resetNonce}`} shadows dpr={[1, 1.75]} camera={{ position: cam.position, fov: cam.fov }} gl={{ antialias: true }}>
      {/* Suelo, luz de tres puntos y entorno que reflejar. */}
      {/* Sin altura: esta escena no tenía sombra de la que leerla, así
          que el escenario la MIDE de la propia escena al montarse, en
          vez de que alguien la adivine. */}
      <Escenario acento={accent} />

      <pointLight position={[-6, -3, 4]} intensity={0.5} color={modoColor} />


      {modo === "laplace" && <EscenaLaplace exp={exp} evento={evento} accent={accent} playing={playing} />}
      {modo === "galton" && (
        <EscenaGalton
          filas={filas}
          conteos={conteos}
          teorica={teorica}
          vuelos={vuelos}
          duracionVuelo={duracionVuelo}
          accent={accent}
          modoColor={modoColor}
          playing={playing}
        />
      )}
      {modo === "convergencia" && <EscenaConvergencia traza={traza} probTeorica={probTeorica} accent={accent} modoColor={modoColor} />}

      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={5}
        maxDistance={20}
        maxPolarAngle={Math.PI * 0.86}
        minPolarAngle={Math.PI * 0.14}
        autoRotate={false}
      />

      <EffectComposer>
        <Bloom intensity={0.42} luminanceThreshold={0.35} luminanceSmoothing={0.85} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.72} />
      </EffectComposer>
    </Canvas>
  );
}
