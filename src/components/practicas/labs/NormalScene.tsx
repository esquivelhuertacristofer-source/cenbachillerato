"use client";

/**
 * Escena 3D del laboratorio de la Distribución normal — R3F.
 * Se carga de forma diferida (ssr:false) desde LabNormal.tsx.
 *
 * Sobre un plano cartesiano se traza la campana de Gauss f(x) para una media μ
 * y una desviación σ. Según el modo:
 *  • "campana": μ desplaza el centro y σ ensancha/estrecha la campana; se marcan
 *    μ y las líneas en ±1σ, ±2σ, ±3σ.
 *  • "empirica": se sombrean las tres regiones anidadas μ±1σ / μ±2σ / μ±3σ con
 *    sus áreas 68 % / 95 % / 99.7 %.
 *  • "probabilidad": se sombrea el rango [a,b]; su área es P(a ≤ X ≤ b) y cada
 *    extremo se estandariza con z = (x−μ)/σ.
 *
 * Patrón R3F: useFrame solo dentro de <Canvas>; toda pieza animada vive en un
 * hijo del Canvas y muta REFS (nada de setState ni Math.random en el render).
 */

import * as THREE from "three";
import { useCallback, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Line, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  presetPorId,
  curvaNormal,
  bordeRegion,
  pdf,
  picoMaximo,
  zScore,
  areaEntre,
  REGLA_EMPIRICA,
  fmtNum,
  fmtPct,
  type Modo,
} from "./normal-data";

export interface NormalSceneProps {
  presetId: string;
  accent: string;
  modo: Modo;
  mu: number;
  sigma: number;
  a: number;
  b: number;
  pausado: boolean;
  autoRotate: boolean;
  resetNonce: number;
  /** Habilita arrastrar los tiradores (μ, σ, extremos a/b) sobre la campana. */
  arrastrable?: boolean;
  onDragMu?: (mu: number) => void;
  onDragSigma?: (sigma: number) => void;
  onDragA?: (a: number) => void;
  onDragB?: (b: number) => void;
  /** Se llama al tomar un tirador (para el sonido). */
  onGrab?: () => void;
}

const ORO = "#ffd24a";
const VERDE = "#34D399";
const AZUL = "#5fb0ff";
const MAGENTA = "#f0a6ff";
const EJE = "#9fb2c8";

// Tonos de las tres bandas de la regla empírica (de la más estrecha a la más ancha).
const BANDAS = ["#34D399", "#5fb0ff", "#a78bfa"];

// Caja de dibujo en coordenadas de MUNDO (centrada en el origen del Canvas).
const BOARD_W = 12;
const BOARD_H = 7;

/* ── Scratch a nivel de módulo (sin asignar memoria por frame) ─────────── */
const _planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); // plano del tablero (z=0)
const _hit = new THREE.Vector3();
const _obj = new THREE.Object3D();
const MUESTRAS_N = 46; // datos cayendo sobre la campana (partículas en tiempo real)

// Hash determinista [0,1) (sin Math.random, válido en useFrame).
const hashU = (n: number): number => {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
};
// Suma de 3 uniformes (Irwin-Hall) ≈ normal estándar (σ≈0.5): da una nube en forma de campana.
const quasiNormal = (i: number): number =>
  hashU(i * 1.7 + 0.3) + hashU(i * 2.3 + 1.1) + hashU(i * 3.1 + 2.7) - 1.5;

/* ── Muestras cayendo que “llenan” la campana (InstancedMesh) ──────────── */
function LluviaMuestras({ mu, sigma, xMin, xMax, OX, SX, OY, SY, yMax, accent, pausado }: {
  mu: number; sigma: number; xMin: number; xMax: number;
  OX: number; SX: number; OY: number; SY: number; yMax: number; accent: string; pausado: boolean;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const reloj = useRef(0);
  useFrame((_, delta) => {
    const m = ref.current;
    if (!m) return;
    if (!pausado) reloj.current += delta;
    const t = reloj.current;
    const wyTop = OY + yMax * SY + 0.6;
    for (let i = 0; i < MUESTRAS_N; i++) {
      let tx = mu + quasiNormal(i) * 2 * sigma;
      tx = Math.max(xMin, Math.min(xMax, tx));
      const wx = OX + (tx - xMin) * SX;
      const curveY = OY + pdf(tx, mu, sigma) * SY;
      const p = (t * 0.22 + i * 0.111) % 1; // 0 arriba → 1 sobre la curva
      const y = curveY + (1 - p) * (wyTop - curveY);
      _obj.position.set(wx, y, 0.05);
      _obj.scale.setScalar(0.06 + 0.05 * p);
      _obj.updateMatrix();
      m.setMatrixAt(i, _obj.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, MUESTRAS_N]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.6} transparent opacity={0.72} toneMapped={false} />
    </instancedMesh>
  );
}

/* ── Tirador arrastrable (μ / σ / extremo a / extremo b) ───────────────── */
function Tirador({ px, py, color, label, invX, toValue, lo, hi, onSet, onGrab, setDragging }: {
  px: number; py: number; color: string; label: string;
  invX: (worldX: number) => number; toValue: (mathX: number) => number;
  lo: number; hi: number;
  onSet: (v: number) => void; onGrab?: () => void; setDragging: (v: boolean) => void;
}) {
  const drag = useRef(false);
  const knob = useRef<THREE.Mesh>(null);
  const [hover, setHover] = useState(false);
  useFrame((s) => {
    if (knob.current) {
      const t = s.clock.elapsedTime;
      knob.current.scale.setScalar((hover || drag.current ? 1.3 : 1) * (1 + Math.sin(t * 4) * 0.06));
    }
  });
  const set = (e: ThreeEvent<PointerEvent>) => {
    if (!e.ray.intersectPlane(_planeZ, _hit)) return;
    onSet(Math.max(lo, Math.min(hi, toValue(invX(_hit.x)))));
  };
  return (
    <group position={[px, py, 0.16]}>
      <mesh ref={knob}>
        <sphereGeometry args={[0.2, 20, 20]} />
        <meshStandardMaterial color="#ffffff" emissive={color} emissiveIntensity={0.9} toneMapped={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.36, 0.04, 12, 28]} />
        <meshBasicMaterial color={color} transparent opacity={hover ? 0.95 : 0.5} />
      </mesh>
      <mesh
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        onPointerDown={(e) => {
          e.stopPropagation();
          (e.target as Element).setPointerCapture?.(e.pointerId);
          drag.current = true;
          setDragging(true);
          onGrab?.();
          set(e);
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          e.stopPropagation();
          set(e);
        }}
        onPointerUp={(e) => {
          drag.current = false;
          setDragging(false);
          (e.target as Element).releasePointerCapture?.(e.pointerId);
        }}
      >
        <sphereGeometry args={[0.6, 14, 14]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <Html position={[0, 0.55, 0]} center distanceFactor={14} zIndexRange={[30, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 8px", borderRadius: 999, background: "rgba(4,10,22,0.82)", border: `1px solid ${color}`, color: "#fff", fontSize: 10, fontWeight: 800, whiteSpace: "nowrap" }}>
          <i className="fa-solid fa-hand-pointer" /> {label}
        </div>
      </Html>
    </group>
  );
}

/* ════════════════════ CONTENIDO DEL PLANO ═══════════════════════════════ */
function Plano({ presetId, accent, modo, mu, sigma, a, b, pausado, arrastrable, onDragMu, onDragSigma, onDragA, onDragB, onGrab, setDragging }: {
  presetId: string; accent: string; modo: Modo; mu: number; sigma: number; a: number; b: number; pausado: boolean;
  arrastrable?: boolean;
  onDragMu?: (mu: number) => void;
  onDragSigma?: (sigma: number) => void;
  onDragA?: (a: number) => void;
  onDragB?: (b: number) => void;
  onGrab?: () => void;
  setDragging: (v: boolean) => void;
}) {
  const preset = useMemo(() => presetPorId(presetId), [presetId]);
  const { xMin, xMax, unidad, muMin, muMax, sigmaMin, sigmaMax } = preset;
  const yMax = useMemo(() => picoMaximo(preset) * 1.06, [preset]);

  // Mapeo matemático → mundo.
  const SX = BOARD_W / (xMax - xMin);
  const SY = BOARD_H / yMax;
  const OX = -BOARD_W / 2;
  const OY = -BOARD_H / 2;
  const wx = useCallback((x: number): number => OX + (x - xMin) * SX, [OX, xMin, SX]);
  const wy = useCallback((y: number): number => OY + y * SY, [OY, SY]);
  const invX = useCallback((worldX: number): number => xMin + (worldX - OX) / SX, [OX, xMin, SX]);
  const w3 = (x: number, y: number, z = 0): [number, number, number] => [wx(x), wy(y), z];

  const curva = useMemo(() => curvaNormal(mu, sigma, xMin, xMax), [mu, sigma, xMin, xMax]);

  // Polígono de relleno de una región [lo,hi] bajo la campana.
  const shapeDe = useCallback(
    (lo: number, hi: number): THREE.Shape => {
      const sh = new THREE.Shape();
      const a0 = Math.max(xMin, Math.min(lo, hi));
      const b0 = Math.min(xMax, Math.max(lo, hi));
      sh.moveTo(wx(a0), wy(0));
      for (const [x, y] of bordeRegion(a0, b0, mu, sigma)) sh.lineTo(wx(x), wy(y));
      sh.lineTo(wx(b0), wy(0));
      sh.lineTo(wx(a0), wy(0));
      return sh;
    },
    [mu, sigma, xMin, xMax, wx, wy]
  );

  // Regiones de la regla empírica (de la más ancha a la más estrecha para apilar).
  const bandas = useMemo(
    () =>
      [3, 2, 1].map((k) => ({
        k,
        shape: shapeDe(mu - k * sigma, mu + k * sigma),
        color: BANDAS[k - 1]!,
      })),
    [mu, sigma, shapeDe]
  );

  // Región de probabilidad [a,b].
  const regionAB = useMemo(() => shapeDe(a, b), [a, b, shapeDe]);

  // Marcas de unidad sobre el eje X (en valores μ−3σ … μ+3σ y extremos del dominio).
  const xticks = useMemo(() => {
    const t: number[] = [];
    for (let k = -3; k <= 3; k++) {
      const v = mu + k * sigma;
      if (v >= xMin && v <= xMax) t.push(v);
    }
    return t;
  }, [mu, sigma, xMin, xMax]);

  // Punto viajero sobre la campana.
  const punto = useRef<THREE.Mesh>(null);
  const fase = useRef(0);
  useFrame((_, delta) => {
    const d = pausado ? 0 : delta;
    if (curva.length < 2) return;
    fase.current = (fase.current + d * 0.06) % 1;
    const mesh = punto.current;
    if (mesh) {
      const idx = Math.min(curva.length - 1, Math.floor(fase.current * (curva.length - 1)));
      const p = curva[idx]!;
      mesh.position.set(wx(p[0]), wy(p[1]), 0.09);
    }
  });

  const prob = useMemo(() => areaEntre(a, b, mu, sigma), [a, b, mu, sigma]);
  const za = useMemo(() => zScore(a, mu, sigma), [a, mu, sigma]);
  const zb = useMemo(() => zScore(b, mu, sigma), [b, mu, sigma]);

  return (
    <group position={[0, 0, 0]}>
      {/* tablero */}
      <mesh position={[0, 0, -0.06]} receiveShadow>
        <planeGeometry args={[BOARD_W + 2, BOARD_H + 2.2]} />
        <meshStandardMaterial color="#07182c" metalness={0.05} roughness={0.95} />
      </mesh>

      {/* rejilla vertical en cada marca; horizontal de referencia */}
      {xticks.map((x, i) => (
        <Line key={`gx${i}`} points={[w3(x, 0, -0.03), w3(x, yMax, -0.03)]} color="#173453" lineWidth={1} />
      ))}
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <Line key={`gy${f}`} points={[[wx(xMin), wy(yMax * f), -0.03], [wx(xMax), wy(yMax * f), -0.03]]} color="#11283f" lineWidth={1} />
      ))}

      {/* eje X */}
      <Line points={[[wx(xMin), wy(0), 0], [wx(xMax) + 0.5, wy(0), 0]]} color={EJE} lineWidth={2} />
      <mesh position={[wx(xMax) + 0.6, wy(0), 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.13, 0.34, 16]} />
        <meshStandardMaterial color={EJE} />
      </mesh>
      <Html position={[wx(xMax) + 0.95, wy(0) + 0.05, 0]} center distanceFactor={15} pointerEvents="none">
        <div style={{ color: EJE, fontSize: 11, fontWeight: 900, whiteSpace: "nowrap" }}>{unidad}</div>
      </Html>

      {/* eje Y (densidad) */}
      <Line points={[[wx(xMin), wy(0), 0], [wx(xMin), wy(yMax) + 0.5, 0]]} color={EJE} lineWidth={2} />
      <mesh position={[wx(xMin), wy(yMax) + 0.6, 0]}>
        <coneGeometry args={[0.13, 0.34, 16]} />
        <meshStandardMaterial color={EJE} />
      </mesh>
      <Html position={[wx(xMin) - 0.2, wy(yMax) + 0.95, 0]} center distanceFactor={15} pointerEvents="none">
        <div style={{ color: EJE, fontSize: 10, fontWeight: 800, whiteSpace: "nowrap" }}>densidad</div>
      </Html>

      {/* marcas numéricas */}
      {xticks.map((x, i) => {
        const k = Math.round((x - mu) / sigma);
        return (
          <group key={`tx${i}`}>
            <Line points={[[wx(x), wy(0) - 0.12, 0], [wx(x), wy(0) + 0.12, 0]]} color={EJE} lineWidth={1} />
            <Html position={[wx(x), wy(0) - 0.4, 0]} center distanceFactor={16} pointerEvents="none">
              <div style={{ color: k === 0 ? ORO : EJE, fontSize: 9.5, fontWeight: 700, whiteSpace: "nowrap" }}>{fmtNum(x, 0)}</div>
            </Html>
            {k !== 0 && (
              <Html position={[wx(x), wy(0) - 0.78, 0]} center distanceFactor={16} pointerEvents="none">
                <div style={{ color: "#6b8199", fontSize: 8.5, fontWeight: 700, whiteSpace: "nowrap" }}>{k > 0 ? `+${k}σ` : `${k}σ`}</div>
              </Html>
            )}
          </group>
        );
      })}

      {/* ── REGLA EMPÍRICA: tres bandas anidadas ── */}
      {modo === "empirica" &&
        bandas.map((bd) => (
          <mesh key={`bd${bd.k}`} position={[0, 0, -0.02 + bd.k * 0.004]}>
            <shapeGeometry args={[bd.shape]} />
            <meshBasicMaterial color={bd.color} transparent opacity={0.22} side={THREE.DoubleSide} toneMapped={false} />
          </mesh>
        ))}
      {modo === "empirica" &&
        REGLA_EMPIRICA.map((r) => (
          <Html key={`pe${r.k}`} position={w3(mu, yMax * (0.16 + (r.k - 1) * 0.2), 0.1)} center distanceFactor={15} pointerEvents="none">
            <div style={{ color: BANDAS[r.k - 1], fontSize: 10, fontWeight: 900, textShadow: "0 2px 8px #000", whiteSpace: "nowrap" }}>
              μ±{r.k}σ → {fmtNum(r.pct, r.k === 1 ? 0 : 1)}%
            </div>
          </Html>
        ))}

      {/* ── PROBABILIDAD: región [a,b] ── */}
      {modo === "probabilidad" && (
        <>
          <mesh position={[0, 0, -0.01]}>
            <shapeGeometry args={[regionAB]} />
            <meshBasicMaterial color={accent} transparent opacity={0.3} side={THREE.DoubleSide} toneMapped={false} />
          </mesh>
          {[{ x: a, z: za, col: VERDE, lbl: "a" }, { x: b, z: zb, col: MAGENTA, lbl: "b" }].map((m) => (
            <group key={m.lbl}>
              <Line points={[w3(m.x, 0, 0.05), w3(m.x, pdf(m.x, mu, sigma) * 1.04, 0.05)]} color={m.col} lineWidth={2} dashed dashSize={0.14} gapSize={0.1} />
              <Html position={[wx(m.x), wy(0) - 1.18, 0]} center distanceFactor={15} pointerEvents="none">
                <div style={{ color: m.col, fontSize: 10, fontWeight: 900, textShadow: "0 2px 8px #000", whiteSpace: "nowrap" }}>
                  {m.lbl}={fmtNum(m.x, 1)} · z={fmtNum(m.z, 2)}
                </div>
              </Html>
            </group>
          ))}
          <Html position={w3(mu, yMax * 0.45, 0.1)} center distanceFactor={14} pointerEvents="none">
            <div style={{ background: "rgba(2,12,28,0.85)", border: `1px solid ${accent}66`, borderRadius: 8, padding: "4px 9px", whiteSpace: "nowrap", textAlign: "center" }}>
              <span style={{ color: accent, fontSize: 11, fontWeight: 900 }}>P(a ≤ X ≤ b) = {fmtPct(prob, 1)}</span>
            </div>
          </Html>
        </>
      )}

      {/* línea de la media μ */}
      <Line points={[w3(mu, 0, 0.04), w3(mu, pdf(mu, mu, sigma) * 1.02, 0.04)]} color={ORO} lineWidth={2} />
      <Html position={[wx(mu), wy(pdf(mu, mu, sigma)) + 0.45, 0]} center distanceFactor={14} pointerEvents="none">
        <div style={{ color: ORO, fontSize: 11, fontWeight: 900, textShadow: "0 2px 8px #000", whiteSpace: "nowrap" }}>
          μ = {fmtNum(mu, 0)} {unidad}
        </div>
      </Html>

      {/* líneas ±σ (modo campana) */}
      {modo === "campana" &&
        [-1, 1, -2, 2, -3, 3].map((k) => {
          const x = mu + k * sigma;
          if (x < xMin || x > xMax) return null;
          return (
            <Line
              key={`s${k}`}
              points={[w3(x, 0, 0.03), w3(x, pdf(x, mu, sigma), 0.03)]}
              color={AZUL}
              lineWidth={1.4}
              dashed
              dashSize={0.12}
              gapSize={0.1}
            />
          );
        })}
      {modo === "campana" && (
        <Html position={w3(mu + sigma, pdf(mu + sigma, mu, sigma) + 0.0006, 0.05)} center distanceFactor={14} pointerEvents="none">
          <div style={{ color: AZUL, fontSize: 10, fontWeight: 900, textShadow: "0 2px 8px #000", whiteSpace: "nowrap" }}>
            σ = {fmtNum(sigma, 1)}
          </div>
        </Html>
      )}

      {/* la campana f(x) */}
      <Line points={curva.map(([x, y]) => w3(x, y, 0.06))} color={accent} lineWidth={4} />

      {/* punto viajero */}
      {curva.length >= 2 && (
        <mesh ref={punto} castShadow>
          <sphereGeometry args={[0.1, 20, 20]} />
          <meshStandardMaterial color="#ffffff" emissive={accent} emissiveIntensity={0.55} metalness={0.1} roughness={0.4} />
        </mesh>
      )}

      {/* muestras que “llueven” y se acomodan en la campana (partículas en vivo) */}
      <LluviaMuestras mu={mu} sigma={sigma} xMin={xMin} xMax={xMax} OX={OX} SX={SX} OY={OY} SY={SY} yMax={yMax} accent={accent} pausado={pausado} />

      {/* ── Tiradores arrastrables (manipular μ, σ y el rango directamente) ── */}
      {arrastrable && (
        <>
          <Tirador
            px={wx(mu)} py={wy(pdf(mu, mu, sigma))} color={ORO} label="μ"
            invX={invX} toValue={(mx) => mx} lo={muMin} hi={muMax}
            onSet={(v) => onDragMu?.(v)} onGrab={onGrab} setDragging={setDragging}
          />
          <Tirador
            px={wx(Math.min(mu + sigma, xMax))} py={wy(pdf(mu + sigma, mu, sigma))} color={AZUL} label="σ"
            invX={invX} toValue={(mx) => mx - mu} lo={sigmaMin} hi={sigmaMax}
            onSet={(v) => onDragSigma?.(v)} onGrab={onGrab} setDragging={setDragging}
          />
          {modo === "probabilidad" && (
            <>
              <Tirador
                px={wx(a)} py={wy(pdf(a, mu, sigma))} color={VERDE} label="a"
                invX={invX} toValue={(mx) => mx} lo={xMin} hi={xMax}
                onSet={(v) => onDragA?.(v)} onGrab={onGrab} setDragging={setDragging}
              />
              <Tirador
                px={wx(b)} py={wy(pdf(b, mu, sigma))} color={MAGENTA} label="b"
                invX={invX} toValue={(mx) => mx} lo={xMin} hi={xMax}
                onSet={(v) => onDragB?.(v)} onGrab={onGrab} setDragging={setDragging}
              />
            </>
          )}
        </>
      )}

      <ContactShadows position={[0, OY - 0.4, 0]} opacity={0.26} scale={BOARD_W + 6} blur={2.4} far={6} />
    </group>
  );
}

/* ════════════════════ CANVAS + CONTENIDO ═════════════════════════════════ */
export default function NormalScene(props: NormalSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [0, 0, 16], fov: 46 }}
    >
      <Contenido {...props} />
    </Canvas>
  );
}

function Contenido(props: NormalSceneProps) {
  const { presetId, accent, modo, mu, sigma, a, b, pausado, autoRotate, resetNonce, arrastrable, onDragMu, onDragSigma, onDragA, onDragB, onGrab } = props;
  const [dragging, setDragging] = useState(false);
  return (
    <>
      <color attach="background" args={["#03101f"]} />
      <fog attach="fog" args={["#03101f", 26, 54]} />

      <ambientLight intensity={0.6} />
      <directionalLight
        position={[4, 8, 9]}
        intensity={1.3}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={36}
        shadow-bias={-0.0004}
      />
      <pointLight position={[0, 0, 8]} intensity={2.4} color="#ffffff" />

      <group key={`${resetNonce}`}>
        <Plano
          presetId={presetId} accent={accent} modo={modo} mu={mu} sigma={sigma} a={a} b={b} pausado={pausado}
          arrastrable={arrastrable} onDragMu={onDragMu} onDragSigma={onDragSigma} onDragA={onDragA} onDragB={onDragB}
          onGrab={onGrab} setDragging={setDragging}
        />
      </group>

      <Environment resolution={256}>
        <Lightformer intensity={1.4} position={[0, 7, 6]} scale={[16, 5, 1]} color="#ffffff" />
        <Lightformer intensity={1.0} position={[-9, 3, 2]} scale={[5, 6, 1]} color={accent} />
        <Lightformer intensity={1.0} position={[9, 2, 4]} scale={[4, 5, 1]} color="#bfe8ff" />
      </Environment>

      <OrbitControls
        enablePan={false}
        enabled={!dragging}
        minDistance={9}
        maxDistance={24}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.9}
        target={[0, 0, 0]}
        autoRotate={autoRotate && !dragging}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.5} luminanceThreshold={0.55} luminanceSmoothing={0.3} mipmapBlur radius={0.7} />
        <Vignette eskil={false} offset={0.28} darkness={0.42} />
      </EffectComposer>
    </>
  );
}
