"use client";

/**
 * Escena 3D del laboratorio de Inecuaciones lineales (R3F).
 * Se carga de forma diferida (ssr:false) desde LabInecuaciones.tsx.
 *
 * Dos modos:
 *   · UNA VARIABLE — la inecuación a·x + b ⧁ c se resuelve sobre la recta
 *     numérica. La solución es un RAYO: punto cerrado (●) si el límite se incluye
 *     (≤, ≥), abierto (○) si no (<, >). Una cuenta de prueba recorre la recta y se
 *     pone verde donde cumple, roja donde no. Si a < 0, el panel avisa que el
 *     signo se invirtió al despejar.
 *   · DOS VARIABLES — la inecuación a·x + b·y ⧁ c define un SEMIPLANO. Una malla
 *     de fichas se ELEVA (verde) donde se cumple y queda plana (azul) donde no; la
 *     frontera a·x + b·y = c se traza continua (≤/≥) o punteada (</>). Un punto de
 *     prueba orbita y reporta si está dentro de la región solución.
 *
 * Patrón R3F: useFrame solo dentro de <Canvas>; toda pieza animada vive en un hijo
 * del Canvas y muta REFS (nada de setState ni Math.random en el render).
 */

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Edges, Html, Line } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  type ModoKey,
  type Op,
  resolverRecta,
  satisfaceRecta,
  satisfacePlano,
  fronteraPlano,
  getOp,
  fmtNum,
  RECTA_MIN,
  RECTA_MAX,
  PLANO_MIN,
  PLANO_MAX,
  PLANO_TILES,
} from "./inecuaciones-data";

export interface InecuacionesSceneProps {
  modo: ModoKey;
  a: number;
  b: number;
  c: number;
  op: Op;
  accent: string;
  pausado: boolean;
  autoRotate: boolean;
  resetNonce: number;
}

const VERDE = new THREE.Color("#34d399");
const ROJO = new THREE.Color("#ff5a5a");
const PLANO_DARK = new THREE.Color("#15324f");
const ORO = "#ffd24a";

const U_R = 0.42; // unidad de mundo por unidad matemática (recta)
const U_P = 0.58; // unidad de mundo por unidad matemática (plano)

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/* ── Cono (punta de flecha) apuntando a +X ───────────────────────────── */
function PuntaX({ color, x, size = 0.16 }: { color: string; x: number; size?: number }) {
  return (
    <mesh position={[x, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
      <coneGeometry args={[size, size * 2.2, 18]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
    </mesh>
  );
}

/* ════════════════════ MODO 1 — RECTA NUMÉRICA ════════════════════════ */
function RectaNumerica({ a, b, c, op, accent: _accent, pausado }: {
  a: number; b: number; c: number; op: Op; accent: string; pausado: boolean;
}) {
  const sol = useMemo(() => resolverRecta(a, b, c, op), [a, b, c, op]);
  const ticks = useMemo(() => Array.from({ length: RECTA_MAX - RECTA_MIN + 1 }, (_, i) => RECTA_MIN + i), []);
  const etiquetas = useMemo(() => [-12, -8, -4, 0, 4, 8, 12], []);

  const halfW = (RECTA_MAX - RECTA_MIN) / 2 * U_R;
  const kClamp = clamp(sol.k, RECTA_MIN, RECTA_MAX);
  const xk = kClamp * U_R;
  const dir = sol.haciaMayor ? 1 : -1;
  const edge = dir > 0 ? RECTA_MAX * U_R : RECTA_MIN * U_R;
  const rayMid = (xk + edge) / 2;
  const rayLen = Math.max(0.001, Math.abs(edge - xk));

  // cuenta de prueba que recorre la recta
  const beadPhase = useRef(0.15);
  const beadRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const htmlRef = useRef<HTMLDivElement>(null);

  useFrame((_, delta) => {
    if (!pausado) beadPhase.current = (beadPhase.current + delta * 0.16) % 2;
    const tri = beadPhase.current < 1 ? beadPhase.current : 2 - beadPhase.current; // 0..1..0
    const v = RECTA_MIN + tri * (RECTA_MAX - RECTA_MIN);
    const ok = satisfaceRecta(v, a, b, c, op);
    if (beadRef.current) beadRef.current.position.x = v * U_R;
    if (matRef.current) {
      const col = ok ? VERDE : ROJO;
      matRef.current.color.copy(col);
      matRef.current.emissive.copy(col);
    }
    if (htmlRef.current) {
      htmlRef.current.textContent = `x = ${fmtNum(v, 1)}  ${ok ? "✓ cumple" : "✗ no"}`;
      htmlRef.current.style.color = ok ? "#7CFFC4" : "#ff9a9a";
    }
  });

  return (
    <group position={[0, 0.1, 0]}>
      {/* eje */}
      <mesh>
        <boxGeometry args={[halfW * 2 + 0.6, 0.06, 0.06]} />
        <meshStandardMaterial color="#9fb2c8" metalness={0.3} roughness={0.4} />
      </mesh>
      <PuntaX color="#9fb2c8" x={halfW + 0.36} />
      <mesh position={[-(halfW + 0.36), 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.16, 0.35, 18]} />
        <meshStandardMaterial color="#9fb2c8" emissive="#9fb2c8" emissiveIntensity={0.4} />
      </mesh>

      {/* marcas */}
      {ticks.map((t) => (
        <mesh key={t} position={[t * U_R, 0, 0]}>
          <boxGeometry args={[0.025, t % 2 === 0 ? 0.26 : 0.16, 0.025]} />
          <meshStandardMaterial color="#5b7088" />
        </mesh>
      ))}
      {etiquetas.map((t) => (
        <Html key={t} position={[t * U_R, -0.42, 0]} center distanceFactor={11} pointerEvents="none">
          <div style={{ color: "#9fb2c8", fontSize: 13, fontWeight: 700, fontFamily: "ui-monospace, monospace" }}>{t}</div>
        </Html>
      ))}

      {/* rayo solución */}
      <mesh position={[rayMid, 0.16, 0]}>
        <boxGeometry args={[rayLen, 0.1, 0.1]} />
        <meshStandardMaterial color={VERDE} emissive={VERDE} emissiveIntensity={0.8} transparent opacity={0.92} />
      </mesh>
      <PuntaX color="#34d399" x={edge + dir * 0.18} size={0.18} />

      {/* marcador frontera: ● cerrado o ○ abierto */}
      {sol.incluye ? (
        <mesh position={[xk, 0.16, 0]}>
          <sphereGeometry args={[0.2, 24, 24]} />
          <meshStandardMaterial color={ORO} emissive={ORO} emissiveIntensity={0.6} />
        </mesh>
      ) : (
        <mesh position={[xk, 0.16, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.18, 0.05, 16, 32]} />
          <meshStandardMaterial color={ORO} emissive={ORO} emissiveIntensity={0.6} />
        </mesh>
      )}
      <Html position={[xk, 0.62, 0]} center distanceFactor={10} pointerEvents="none">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <div style={{ color: ORO, fontSize: 17, fontWeight: 900, fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap", textShadow: "0 2px 8px #000" }}>
            x {getOp(sol.opFinal).sim} {fmtNum(sol.k, 2)}
          </div>
          <div style={{ color: "#cfe0f2", fontSize: 10.5, fontWeight: 700 }}>{sol.incluye ? "● incluido" : "○ no incluido"}</div>
        </div>
      </Html>

      {/* cuenta de prueba */}
      <mesh ref={beadRef} position={[0, 0.16, 0]}>
        <sphereGeometry args={[0.16, 20, 20]} />
        <meshStandardMaterial ref={matRef} color={VERDE} emissive={VERDE} emissiveIntensity={0.7} />
      </mesh>
      <Html position={[0, 0.16, 0]} center distanceFactor={11} pointerEvents="none">
        <div ref={htmlRef} style={{ marginTop: -46, fontSize: 12.5, fontWeight: 800, fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap", textShadow: "0 2px 8px #000" }} />
      </Html>

      <ContactShadows position={[0, -0.5, 0]} opacity={0.32} scale={14} blur={2.4} far={4} />
    </group>
  );
}

/* ════════════════════ MODO 2 — SEMIPLANO ═════════════════════════════ */
function Semiplano({ a, b, c, op, accent, pausado }: {
  a: number; b: number; c: number; op: Op; accent: string; pausado: boolean;
}) {
  const N = PLANO_TILES;
  const count = N * N;
  const cell = (PLANO_MAX - PLANO_MIN) / N;
  const tileW = cell * U_P * 0.92;
  const o = useMemo(() => getOp(op), [op]);

  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const heights = useRef<Float32Array | null>(null);

  // centros y cumplimiento de cada ficha (determinista)
  const data = useMemo(() => {
    const arr: { gx: number; gy: number; sat: boolean }[] = [];
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const gx = PLANO_MIN + (i + 0.5) * cell;
        const gy = PLANO_MIN + (j + 0.5) * cell;
        arr.push({ gx, gy, sat: satisfacePlano(gx, gy, a, b, c, op) });
      }
    }
    return arr;
  }, [a, b, c, op, N, cell]);

  // frontera a·x + b·y = c
  const fr = useMemo(() => fronteraPlano(a, b, c), [a, b, c]);
  const lineaPts = useMemo<[number, number, number][]>(() => {
    if (!fr) return [];
    return [
      [fr[0].x * U_P, 0.46, fr[0].y * U_P],
      [fr[1].x * U_P, 0.46, fr[1].y * U_P],
    ];
  }, [fr]);

  // punto de prueba orbitando
  const tPhase = useRef(0.4);
  const probeRef = useRef<THREE.Mesh>(null);
  const probeMat = useRef<THREE.MeshStandardMaterial>(null);
  const probeHtml = useRef<HTMLDivElement>(null);

  useFrame((_, delta) => {
    const m = meshRef.current;
    if (m) {
      if (!heights.current) heights.current = new Float32Array(count);
      const h = heights.current;
      for (let idx = 0; idx < count; idx++) {
        const d = data[idx]!;
        const target = d.sat ? 0.42 : 0.04;
        h[idx]! += (target - h[idx]!) * Math.min(1, delta * 4);
        const hv = Math.max(0.04, h[idx]!);
        dummy.position.set(d.gx * U_P, hv / 2, d.gy * U_P);
        dummy.scale.set(tileW, hv, tileW);
        dummy.updateMatrix();
        m.setMatrixAt(idx, dummy.matrix);
        m.setColorAt(idx, d.sat ? VERDE : PLANO_DARK);
      }
      m.instanceMatrix.needsUpdate = true;
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
    }

    // punto de prueba
    if (!pausado) tPhase.current += delta * 0.4;
    const ph = tPhase.current;
    const px = 4.4 * Math.sin(ph);
    const py = 4.4 * Math.sin(ph * 0.73 + 1.1);
    const ok = satisfacePlano(px, py, a, b, c, op);
    if (probeRef.current) probeRef.current.position.set(px * U_P, 0.62, py * U_P);
    if (probeMat.current) {
      const col = ok ? VERDE : ROJO;
      probeMat.current.color.copy(col);
      probeMat.current.emissive.copy(col);
    }
    if (probeHtml.current) {
      probeHtml.current.textContent = `(${fmtNum(px, 1)}, ${fmtNum(py, 1)}) ${ok ? "✓" : "✗"}`;
      probeHtml.current.style.color = ok ? "#7CFFC4" : "#ff9a9a";
    }
  });

  const half = (PLANO_MAX - PLANO_MIN) / 2 * U_P;

  return (
    <group position={[0, -0.2, 0]}>
      {/* tablero */}
      <mesh position={[0, -0.02, 0]} receiveShadow>
        <boxGeometry args={[half * 2 + 0.5, 0.04, half * 2 + 0.5]} />
        <meshStandardMaterial color="#081a2c" metalness={0.2} roughness={0.85} />
        <Edges threshold={15} color="#1d4060" />
      </mesh>
      <gridHelper args={[half * 2, PLANO_MAX - PLANO_MIN, "#2a4f72", "#1a3550"]} position={[0, 0.01, 0]} />

      {/* ejes */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[half * 2 + 0.3, 0.04, 0.04]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.04, 0.04, half * 2 + 0.3]} />
        <meshStandardMaterial color="#7fb0e0" emissive="#7fb0e0" emissiveIntensity={0.3} />
      </mesh>
      <Html position={[half + 0.32, 0.18, 0]} center distanceFactor={12} pointerEvents="none">
        <div style={{ color: accent, fontSize: 15, fontWeight: 900 }}>x</div>
      </Html>
      <Html position={[0, 0.18, half + 0.32]} center distanceFactor={12} pointerEvents="none">
        <div style={{ color: "#7fb0e0", fontSize: 15, fontWeight: 900 }}>y</div>
      </Html>

      {/* fichas (región solución) */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial metalness={0.1} roughness={0.55} toneMapped={false} />
      </instancedMesh>

      {/* frontera */}
      {lineaPts.length === 2 && (
        <Line
          points={lineaPts}
          color={ORO}
          lineWidth={3.4}
          dashed={!o.incluye}
          dashSize={0.28}
          gapSize={0.18}
        />
      )}

      {/* punto de prueba */}
      <mesh ref={probeRef}>
        <sphereGeometry args={[0.17, 22, 22]} />
        <meshStandardMaterial ref={probeMat} color={VERDE} emissive={VERDE} emissiveIntensity={0.7} />
      </mesh>
      <Html position={[0, 0, 0]} center distanceFactor={12} pointerEvents="none">
        <div ref={probeHtml} style={{ marginTop: -52, fontSize: 12.5, fontWeight: 800, fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap", textShadow: "0 2px 8px #000" }} />
      </Html>

      <ContactShadows position={[0, -0.05, 0]} opacity={0.35} scale={12} blur={2.2} far={5} />
    </group>
  );
}

/* ════════════════════ CANVAS + CONTENIDO ═════════════════════════════ */
export default function InecuacionesScene(props: InecuacionesSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [0.2, 3.4, 9.4], fov: 44 }}
    >
      <Contenido {...props} />
    </Canvas>
  );
}

/** Contenido: DEBE vivir dentro de <Canvas> (useFrame solo funciona ahí). */
function Contenido(props: InecuacionesSceneProps) {
  const { modo, a, b, c, op, accent, pausado, autoRotate, resetNonce } = props;

  const target = useMemo<[number, number, number]>(
    () => (modo === "plano" ? [0, 0.2, 0] : [0, 0.2, 0]),
    [modo]
  );

  return (
    <>
      <color attach="background" args={["#03101f"]} />
      <fog attach="fog" args={["#03101f", 20, 42]} />

      <ambientLight intensity={0.55} />
      <directionalLight
        position={[4, 9, 6]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-bias={-0.0004}
      />
      <pointLight position={[0, 5, 4]} intensity={5} color="#ffffff" />

      <group key={`${modo}-${resetNonce}`}>
        {modo === "recta" ? (
          <RectaNumerica a={a} b={b} c={c} op={op} accent={accent} pausado={pausado} />
        ) : (
          <Semiplano a={a} b={b} c={c} op={op} accent={accent} pausado={pausado} />
        )}
      </group>

      <Environment resolution={256}>
        <Lightformer intensity={1.6} position={[0, 6, 2]} scale={[12, 4, 1]} color="#ffffff" />
        <Lightformer intensity={1.1} position={[-7, 3, -2]} scale={[5, 6, 1]} color={accent} />
        <Lightformer intensity={1.0} position={[7, 2, 4]} scale={[4, 5, 1]} color="#bfe8ff" />
      </Environment>

      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={16}
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={Math.PI / 2.05}
        target={target}
        autoRotate={autoRotate}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.55} luminanceThreshold={0.6} luminanceSmoothing={0.3} mipmapBlur radius={0.7} />
        <Vignette eskil={false} offset={0.28} darkness={0.42} />
      </EffectComposer>
    </>
  );
}
