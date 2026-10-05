"use client";

/**
 * Escena 3D del laboratorio "Azar, frecuencia y probabilidad — el tablero de
 * Galton" (PM-VI-P05). Tres modos:
 *
 *  - laplace:      el espacio muestral Ω se enumera objeto por objeto (las 6
 *                  caras del dado con sus puntos, los 4 resultados de dos
 *                  monedas, las 52 cartas). Los que pertenecen al evento se
 *                  elevan y se encienden; los del complemento se apagan. La
 *                  fracción que el alumno ve en el panel es el conteo de lo que
 *                  está mirando, no un número escrito a mano.
 *  - galton:       filas de clavos y cajones acumuladores. Cada bola baja
 *                  desviándose a derecha o izquierda; el cajón donde cae es el
 *                  número de desvíos a la derecha. La curva binomial teórica
 *                  se dibuja encima de las barras para comparar lo que pasó
 *                  con lo que la teoría predice, y dos marcas señalan la media
 *                  teórica (banda rosa) y la observada (cono) para ver cómo se
 *                  corre el montón al cargar el tablero.
 *  - convergencia: la frecuencia relativa del evento frente al número de
 *                  repeticiones, en escala logarítmica, contra la recta de la
 *                  probabilidad teórica. El embudo que se cierra ES la ley de
 *                  los grandes números.
 *
 * La simulación NO vive aquí: el shell decide qué bolas caen y cuántas
 * repeticiones van, y esta escena solo interpola posiciones en useFrame
 * mutando refs (nunca estado), conforme al React Compiler. Los clavos y las
 * bolas en vuelo son mallas instanciadas. NO se usa <Text> de drei (cuelga el
 * chunk con Turbopack): el texto del lienzo va en <Html>, máx. 4 a la vez.
 */

import * as THREE from "three";
import { useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
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

/* ── Etiquetas: tamaño fijo en píxeles, sin distanceFactor ─────────────── */
function Etiqueta({ pos, children, col, ancho = false }: { pos: Pt; children: ReactNode; col?: string; ancho?: boolean }) {
  const w = useThree((s) => s.size.width);
  if (ancho && w < 640) return null;
  return (
    <Html position={pos} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 12px",
          borderRadius: 999,
          background: "rgba(4,10,22,0.86)",
          border: `1px solid ${col ?? "rgba(255,255,255,0.22)"}`,
          color: "#fff",
          fontSize: 14,
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
function Letra({ pos, children, col = "#e2e8f0", size = 14 }: { pos: Pt; children: ReactNode; col?: string; size?: number }) {
  return (
    <Html position={pos} center zIndexRange={[15, 0]} style={{ pointerEvents: "none" }}>
      <div style={{ color: col, fontSize: size, fontWeight: 900, whiteSpace: "nowrap", textShadow: "0 2px 6px #000" }}>{children}</div>
    </Html>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * MODO 1 · PROBABILIDAD CLÁSICA — el espacio muestral, objeto por objeto
 * ════════════════════════════════════════════════════════════════════════ */

/** Posiciones de los puntos de un dado (cara frontal), en una rejilla 3×3. */
const PUNTOS_DADO: Record<number, [number, number][]> = {
  1: [[0, 0]],
  2: [[-1, 1], [1, -1]],
  3: [[-1, 1], [0, 0], [1, -1]],
  4: [[-1, 1], [1, 1], [-1, -1], [1, -1]],
  5: [[-1, 1], [1, 1], [0, 0], [-1, -1], [1, -1]],
  6: [[-1, 1], [1, 1], [-1, 0], [1, 0], [-1, -1], [1, -1]],
};

/** Un resultado de Ω. Si pertenece al evento, flota y brilla. */
function Resultado({
  pos,
  dentro,
  forma,
  col,
  colApagado,
  playing,
  fase,
  puntos = 0,
}: {
  pos: Pt;
  dentro: boolean;
  forma: "cubo" | "disco" | "carta";
  col: string;
  colApagado: string;
  playing: boolean;
  fase: number;
  /** Número de puntos de la cara (solo para el dado). */
  puntos?: number;
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
        <>
          <mesh castShadow>
            <boxGeometry args={[0.9, 0.9, 0.9]} />
            <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={dentro ? 0.45 : 0} roughness={0.35} metalness={0.25} transparent opacity={dentro ? 1 : 0.6} />
          </mesh>
          {(PUNTOS_DADO[puntos] ?? []).map(([px, py], i) => (
            <mesh key={i} position={[px * 0.24, py * 0.24, 0.46]}>
              <sphereGeometry args={[0.075, 12, 12]} />
              <meshStandardMaterial color={dentro ? "#04121f" : "#0f172a"} roughness={0.4} />
            </mesh>
          ))}
        </>
      )}
      {forma === "disco" && (
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.48, 0.48, 0.14, 32]} />
          <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={dentro ? 0.5 : 0} roughness={0.3} metalness={0.5} transparent opacity={dentro ? 1 : 0.55} />
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
  // El dado se lee por sus puntos; las 52 cartas, por color. Solo las 4
  // combinaciones de las monedas llevan letrero (4 rótulos como máximo).
  const conEtiquetas = exp.id === "dosmonedas";

  return (
    <group position={[0, 0, 0]}>
      {exp.omega.map((r, i) => {
        const c = i % cols;
        const f = Math.floor(i / cols);
        const x = (c - (cols - 1) / 2) * paso;
        const y = ((filas - 1) / 2 - f) * pasoY;
        const dentro = evento.pertenece(r);
        const col = exp.id === "baraja" ? (r.rojo ? "#f87171" : "#e2e8f0") : dentro ? accent : "#94a3b8";
        return (
          <group key={`${r.etq}-${i}`}>
            <Resultado
              pos={[x, y, 0]}
              dentro={dentro}
              forma={forma}
              col={dentro ? (exp.id === "baraja" ? accent : col) : col}
              colApagado="#64748b"
              playing={playing}
              fase={i * 0.6}
              puntos={exp.id === "dado" ? r.valor : 0}
            />
            {conEtiquetas && (
              <Letra pos={[x, y + 1.0, 0]} col={dentro ? "#ffffff" : "rgba(255,255,255,0.55)"} size={16}>
                {r.etq}
              </Letra>
            )}
          </group>
        );
      })}
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
/** Cuántas bolas caben en la malla instanciada (el shell suelta ≤ 12). */
const CAP_BOLAS = 16;

/** Geometría del tablero para un número de filas dado. */
function geometria(filas: number) {
  const yPegTop = 0;
  const yPegBottom = yPegTop - (filas - 1) * DY;
  const yFloor = yPegBottom - 0.85 - ALTO_BARRA;
  const ySuelta = yPegTop + DY * 1.6;
  const altoTotal = ySuelta - yFloor;
  // El tablero crece con el número de filas; lo re-escalamos para que siempre
  // ocupe ~60 % del alto del visor (entre la barra superior y la misión).
  const escala = 5.0 / altoTotal;
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

const _o = new THREE.Object3D();

/** Todos los clavos del tablero en UNA malla instanciada (hasta 78). */
function Clavos({ filas, g }: { filas: number; g: ReturnType<typeof geometria> }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const pos = useMemo(() => {
    const out: Pt[] = [];
    for (let i = 0; i < filas; i++) {
      for (let j = 0; j <= i; j++) out.push([(j - i / 2) * DX, g.yPegTop - i * DY, 0]);
    }
    return out;
  }, [filas, g.yPegTop]);
  useLayoutEffect(() => {
    const m = mesh.current;
    if (!m) return;
    pos.forEach((p, i) => {
      _o.position.set(p[0], p[1], p[2]);
      _o.scale.setScalar(1);
      _o.updateMatrix();
      m.setMatrixAt(i, _o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, [pos]);
  return (
    <instancedMesh key={pos.length} ref={mesh} args={[undefined, undefined, pos.length]} castShadow frustumCulled={false}>
      <sphereGeometry args={[0.075, 10, 10]} />
      <meshStandardMaterial color="#cbd5e1" emissive="#94a3b8" emissiveIntensity={0.25} roughness={0.3} metalness={0.6} />
    </instancedMesh>
  );
}

/** Las bolas en vuelo, en UNA malla instanciada. */
function BolasEnVuelo({ vuelos, filas, duracion, accent, playing }: { vuelos: Vuelo[]; filas: number; duracion: number; accent: string; playing: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const g = useMemo(() => geometria(filas), [filas]);
  // Avance de cada bola; al pausar se queda donde iba.
  const avance = useRef<Map<number, number>>(new Map());

  useFrame(() => {
    const m = mesh.current;
    if (!m) return;
    const mapa = avance.current;
    if (mapa.size > 64) mapa.clear();
    const ahora = performance.now();
    for (let i = 0; i < CAP_BOLAS; i++) {
      const v = vuelos[i];
      if (!v) {
        _o.scale.setScalar(0.0001);
        _o.position.set(0, 0, 0);
      } else {
        const u = playing ? (ahora - v.t0) / duracion : (mapa.get(v.id) ?? (ahora - v.t0) / duracion);
        mapa.set(v.id, u);
        const [x, y] = posicionVuelo(v.pasos, u, g);
        _o.position.set(x, y, 0);
        _o.scale.setScalar(1);
      }
      _o.updateMatrix();
      m.setMatrixAt(i, _o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, CAP_BOLAS]} castShadow frustumCulled={false}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.55} roughness={0.2} metalness={0.3} />
    </instancedMesh>
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
      <meshStandardMaterial color={col} emissive={col} emissiveIntensity={resaltada ? 0.4 : 0.18} roughness={0.4} metalness={0.15} transparent opacity={0.92} />
    </mesh>
  );
}

function EscenaGalton({
  filas,
  p,
  conteos,
  teorica,
  vuelos,
  duracionVuelo,
  accent,
  modoColor,
  playing,
}: {
  filas: number;
  p: number;
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

  // Curva teórica, dibujada sobre los cajones.
  const puntosTeorica: Pt[] = teorica.map((pk, k) => [(k - filas / 2) * DX, g.yFloor + (pk / refMax) * ALTO_BARRA, 0.32]);

  // Medias: la teórica (n·p) y la observada, para ver cómo se corre el montón.
  const mediaTeo = filas * p;
  const mediaObs = total > 0 ? conteos.reduce((a, c, k) => a + c * k, 0) / total : null;
  const xTeo = (mediaTeo - filas / 2) * DX;

  return (
    <group position={[0, -g.centroY * g.escala, 0]} scale={g.escala}>
      <Clavos filas={filas} g={g} />

      {/* Boca de entrada */}
      <mesh position={[0, g.ySuelta + 0.18, 0]}>
        <torusGeometry args={[0.3, 0.055, 10, 28]} />
        <meshStandardMaterial color={modoColor} emissive={modoColor} emissiveIntensity={0.5} roughness={0.3} metalness={0.4} />
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
      <CurvaTubo puntos={puntosTeorica} color="#f472b6" grosor={0.045} brillo={0.7} />
      {puntosTeorica.map((pt, k) => (
        <mesh key={`pt-${k}`} position={pt}>
          <sphereGeometry args={[0.07, 10, 10]} />
          <meshStandardMaterial color="#f472b6" emissive="#f472b6" emissiveIntensity={0.6} />
        </mesh>
      ))}

      {/* Media teórica: banda rosa vertical */}
      <mesh position={[xTeo, g.yFloor + ALTO_BARRA / 2, -0.1]}>
        <boxGeometry args={[0.05, ALTO_BARRA + 0.4, 0.04]} />
        <meshStandardMaterial color="#f472b6" transparent opacity={0.45} emissive="#f472b6" emissiveIntensity={0.3} depthWrite={false} />
      </mesh>
      {/* Media observada: cono amarillo sobre el cajón donde cae el promedio */}
      {mediaObs !== null && (
        <mesh position={[(mediaObs - filas / 2) * DX, g.yFloor + ALTO_BARRA + 0.38, 0.1]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.16, 0.34, 14]} />
          <meshStandardMaterial color="#fde047" emissive="#fde047" emissiveIntensity={0.6} roughness={0.3} />
        </mesh>
      )}

      {/* Bolas en vuelo */}
      <BolasEnVuelo vuelos={vuelos} filas={filas} duracion={duracionVuelo} accent={accent} playing={playing} />

      {/* Rótulos: máx. 4. Extremos, cajón modal y media observada. */}
      <Letra pos={[(0 - filas / 2) * DX, g.yFloor - 0.42, 0]} col="rgba(255,255,255,0.7)" size={14}>0</Letra>
      <Letra pos={[(filas - filas / 2) * DX, g.yFloor - 0.42, 0]} col="rgba(255,255,255,0.7)" size={14}>{filas}</Letra>
      {cajonModal > 0 && cajonModal < filas && (
        <Letra pos={[(cajonModal - filas / 2) * DX, g.yFloor - 0.42, 0]} col="#fff" size={14}>{cajonModal}</Letra>
      )}
      {mediaObs !== null && (
        <Etiqueta pos={[(mediaObs - filas / 2) * DX, g.yFloor + ALTO_BARRA + 1.0, 0.1]} col="#fde047aa">
          x̄ = {mediaObs.toFixed(2)}
        </Etiqueta>
      )}
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

function EscenaConvergencia({ traza, probTeorica, accent }: { traza: PuntoConvergencia[]; probTeorica: number; accent: string }) {
  const puntos: Pt[] = traza.length >= 2 ? traza.map((p) => [xDeN(p.n), yDeF(p.frecuencia), 0.05]) : [];
  const yTeorica = yDeF(probTeorica);
  const ultimo = traza.length > 0 ? traza[traza.length - 1]! : null;

  const marcasN = [1, 10, 100, 1000, CONV_MAX_REPS];
  const marcasF = [0, 0.25, 0.5, 0.75, 1];

  return (
    <group position={[0, 0, 0]} scale={0.86}>
      {/* Rejilla horizontal (fondo) */}
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

      {/* Recta de la probabilidad teórica */}
      <CurvaTubo
        puntos={[
          [-CONV_W / 2, yTeorica, 0.02] as Pt,
          [CONV_W / 2, yTeorica, 0.02] as Pt,
        ]}
        color="#f472b6"
        grosor={0.05}
        brillo={0.7}
      />

      {/* Traza de la frecuencia relativa */}
      {puntos.length >= 2 && <CurvaTubo puntos={puntos} color={accent} grosor={0.054} />}

      {/* Punto actual */}
      {ultimo && (
        <mesh position={[xDeN(ultimo.n), yDeF(ultimo.frecuencia), 0.12]}>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.8} />
        </mesh>
      )}

      {/* Rótulos: máx. 4. */}
      <Etiqueta pos={[-CONV_W / 2 + 1.9, yTeorica + (probTeorica > 0.8 ? -0.5 : 0.5), 0.1]} col="#f472b688" ancho>
        <span style={{ width: 16, height: 3, background: "#f472b6", borderRadius: 2, display: "inline-block" }} />
        P(A) = {probTeorica.toFixed(4)}
      </Etiqueta>
      {ultimo ? (
        <Etiqueta pos={[xDeN(ultimo.n), yDeF(ultimo.frecuencia) + (ultimo.frecuencia > probTeorica ? 0.55 : -0.55), 0.12]} col={`${accent}88`} ancho>
          n = {ultimo.n.toLocaleString("es-MX")} · {ultimo.frecuencia.toFixed(3)}
        </Etiqueta>
      ) : (
        <Etiqueta pos={[0, 0, 0.3]} col={`${accent}aa`} ancho>
          <i className="fa-solid fa-play" style={{ color: accent }} />
          Pulsa «Repetir el experimento»
        </Etiqueta>
      )}
      <Letra pos={[xDeN(1), -CONV_H / 2 - 0.45, 0]} col="rgba(255,255,255,0.7)" size={14}>1</Letra>
      <Letra pos={[xDeN(CONV_MAX_REPS), -CONV_H / 2 - 0.45, 0]} col="rgba(255,255,255,0.7)" size={14}>{CONV_MAX_REPS.toLocaleString("es-MX")}</Letra>
    </group>
  );
}

/* ── Cámara por modo ──────────────────────────────────────────────────── */
function camaraDe(modo: Modo, exp: ExperimentoDef): { position: Pt; fov: number } {
  if (modo === "laplace") {
    return exp.id === "baraja" ? { position: [0, 0, 8.8], fov: 42 } : { position: [0, 0, 8.4], fov: 42 };
  }
  if (modo === "galton") return { position: [0, 0, 11.5], fov: 40 };
  return { position: [0, 0, 11], fov: 42 };
}

export default function GaltonProbabilidadScene(props: GaltonSceneProps) {
  const { modo, exp, evento, filas, p, conteos, teorica, vuelos, duracionVuelo, traza, probTeorica, playing, accent, modoColor, resetNonce } = props;
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
          p={p}
          conteos={conteos}
          teorica={teorica}
          vuelos={vuelos}
          duracionVuelo={duracionVuelo}
          accent={accent}
          modoColor={modoColor}
          playing={playing}
        />
      )}
      {modo === "convergencia" && <EscenaConvergencia traza={traza} probTeorica={probTeorica} accent={accent} />}

      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={5}
        maxDistance={20}
        maxPolarAngle={Math.PI * 0.86}
        minPolarAngle={Math.PI * 0.14}
        autoRotate={false}
        target={[0, -0.6, 0]}
      />

      <EffectComposer>
        <Bloom intensity={0.42} luminanceThreshold={0.35} luminanceSmoothing={0.85} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.72} />
      </EffectComposer>
    </Canvas>
  );
}
