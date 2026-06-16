"use client";

/**
 * Escena 3D del laboratorio de Propiedades y cambios de la materia (R3F).
 * Se carga de forma diferida (ssr:false) desde LabPropiedadesMateria.tsx, por lo
 * que es 100% cliente: no entra al bundle SSR del Worker.
 *
 * Montaje de laboratorio real: mechero Bunsen → trípode con rejilla → vaso de
 * precipitado de vidrio (borosilicato, material físico con transmisión) que
 * contiene la MUESTRA. Sobre una mesa de laboratorio reflectante.
 *
 * La muestra (partículas instanciadas) se comporta según `modo` conforme avanza
 * `progreso` (0 → 1):
 *   - estado:    el sólido se funde y se extiende (mismo material).
 *   - fragmenta: el bloque se rompe en trozos que se separan.
 *   - gas:       las partículas suben y se desvanecen (evaporación).
 *   - reaccion:  cambia de color y emite humo/burbujas (sustancia nueva).
 * Si `flama`, se enciende el mechero cuya flama parpadea y crece con el progreso.
 *
 * Toda la VIDA visual (parpadeo de flama, flotación de la muestra, humo/burbujas
 * en bucle, brasas, vaho, motas de polvo) vive en `useFrame` con el reloj de la
 * escena; el progreso se suaviza con damp para que la transformación sea fluida
 * aunque el shell lo avance a pasos. Los desplazamientos pseudoaleatorios usan un
 * hash determinista (prand), nunca Math.random en render.
 */

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  ContactShadows,
  Environment,
  Lightformer,
  Html,
  MeshReflectorMaterial,
  Sparkles,
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, SMAA } from "@react-three/postprocessing";
import type { Modo, Emision } from "./propiedades-data";

export interface PropiedadesSceneProps {
  transKey: string;
  modo: Modo;
  colorInicial: string;
  colorFinal: string;
  emite: Emision;
  flama: boolean;
  progreso: number; // 0..1
  accent: string;
  autoRotate: boolean;
  resetNonce: number;
  sustancia?: string;
  etiquetas?: boolean;
}

const N = 24; // partículas de la muestra
const M = 20; // partículas de emisión (humo / burbujas)
const RAD = 0.6;
const Y0 = -0.4; // base de la muestra (dentro del vaso)

const FLOOR_Y = -2.2;
const BK_BOT = -0.78; // base interior del vaso
const BK_R = 0.92; // radio exterior del vaso
const BK_H = 1.75; // alto del vaso
const GAUZE_Y = BK_BOT - 0.04; // rejilla de asbesto
const GLASS = "#cfeaff";

/** Hash determinista [0,1) por índice (sin Math.random, válido en render). */
function prand(i: number, salt = 0): number {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const smooth = (x: number) => {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
};

/** Posición base de la partícula i dentro de la muestra (espiral apilada). */
function baseAt(i: number): [number, number, number] {
  const a = i * 2.3999632;
  const r = RAD * Math.sqrt((i + 0.5) / N);
  const layer = i % 4;
  return [Math.cos(a) * r, Y0 + layer * 0.15, Math.sin(a) * r];
}

/** Posición viva de una partícula de la muestra según el modo y el progreso. */
function posMuestra(modo: Modo, base: [number, number, number], off: number, p: number): [number, number, number] {
  const [bx, by, bz] = base;
  if (modo === "estado") {
    const spread = 1 + 0.55 * p;
    return [bx * spread, by * (1 - p) + (Y0 - 0.12 + off * 0.05) * p, bz * spread];
  }
  if (modo === "fragmenta") {
    const dir = Math.hypot(bx, bz) || 1;
    const push = p * 0.9;
    return [bx + (bx / dir) * push, by + (off - 0.5) * p * 0.7, bz + (bz / dir) * push];
  }
  if (modo === "gas") {
    const spread = 1 + 1.1 * p;
    return [bx * spread, by + p * (2.6 + off * 1.4), bz * spread];
  }
  // reaccion: se mantiene con leve vibración (el color es lo que cambia)
  const j = (off - 0.5) * 0.16 * p;
  return [bx + j, by + Math.abs(j) * 0.6, bz - j];
}

/* ── Muestra: partículas instanciadas que se transforman y flotan ───────── */
function Muestra({ modo, ci, cf, progreso }: { modo: Modo; ci: string; cf: string; progreso: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const mat = useRef<THREE.MeshPhysicalMaterial>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const disp = useRef(0);
  const c0 = useMemo(() => new THREE.Color(ci), [ci]);
  const c1 = useMemo(() => new THREE.Color(cf), [cf]);

  useFrame((state, dt) => {
    const m = mesh.current;
    if (!m) return;
    disp.current = THREE.MathUtils.damp(disp.current, progreso, 6, dt);
    const p = disp.current;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < N; i++) {
      const base = baseAt(i);
      const off = prand(i, 1);
      const [x, y, z] = posMuestra(modo, base, off, p);
      const fl =
        modo === "reaccion"
          ? Math.sin(t * 6 + i) * 0.02 * (0.4 + p)
          : Math.sin(t * 1.4 + i * 1.7) * 0.03 * (1 - p * 0.5);
      dummy.position.set(x, y + fl, z);
      dummy.rotation.set(t * 0.25 + i, t * 0.18 + i * 0.6, 0);
      const sc = modo === "gas" ? 0.17 * (1 - p * 0.45) : 0.17;
      dummy.scale.setScalar(Math.max(0.02, sc));
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
    const mt = mat.current;
    if (mt) {
      const mix = modo === "fragmenta" ? 0 : smooth(p);
      mt.color.copy(c0).lerp(c1, mix);
      mt.emissive.copy(mt.color);
      mt.emissiveIntensity = modo === "reaccion" ? 0.16 + 0.7 * p : 0.14;
      mt.opacity = modo === "gas" ? Math.max(0.05, 1 - p * 0.9) : 1;
      mt.transparent = modo === "gas";
    }
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, N]} castShadow receiveShadow>
      <icosahedronGeometry args={[1, 0]} />
      <meshPhysicalMaterial ref={mat} roughness={0.22} metalness={0.15} clearcoat={0.7} clearcoatRoughness={0.25} reflectivity={0.5} />
    </instancedMesh>
  );
}

/* ── Emisión: humo (gris, sube y se difumina) o burbujas (claras) ──────── */
function Emisiones({ esHumo, progreso }: { esHumo: boolean; progreso: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame((state) => {
    const m = mesh.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    const p = progreso;
    const alive = p > 0.05 ? 1 : 0;
    const speed = esHumo ? 0.26 : 0.55;
    for (let i = 0; i < M; i++) {
      const ph = prand(i, 7);
      const cyc = (t * speed + ph) % 1;
      const x = (prand(i, 3) - 0.5) * 0.9 * (1 + cyc * 0.5) + Math.sin(t * 0.8 + i) * 0.06;
      const z = (prand(i, 5) - 0.5) * 0.9 * (1 + cyc * 0.5);
      const y = Y0 + 0.2 + cyc * (esHumo ? 2.6 + ph * 1.4 : 1.7 + ph * 0.9);
      const fade = Math.sin(cyc * Math.PI);
      const grow = esHumo ? 0.16 + cyc * 0.55 : 0.08 + cyc * 0.03;
      dummy.position.set(x, y, z);
      dummy.scale.setScalar(Math.max(0.001, grow * fade * alive));
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, M]}>
      <sphereGeometry args={[1, 12, 12]} />
      {esHumo ? (
        <meshStandardMaterial color="#8a8a8a" roughness={0.95} transparent opacity={0.6} depthWrite={false} />
      ) : (
        <meshPhysicalMaterial color="#eaf6ff" roughness={0.1} metalness={0} transmission={0.7} thickness={0.2} transparent opacity={0.8} depthWrite={false} emissive="#bfe8ff" emissiveIntensity={0.3} />
      )}
    </instancedMesh>
  );
}

/* ── Brasas: chispas naranjas en bucle al quemar (realismo) ─────────────── */
function Brasas({ progreso }: { progreso: number }) {
  const K = 16;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame((state) => {
    const m = mesh.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    const alive = progreso > 0.05 ? 1 : 0;
    for (let i = 0; i < K; i++) {
      const ph = prand(i, 11);
      const cyc = (t * (0.5 + ph * 0.5) + ph) % 1;
      const x = (prand(i, 13) - 0.5) * 0.7 + Math.sin(cyc * 6 + i) * 0.14;
      const z = (prand(i, 17) - 0.5) * 0.7;
      const y = Y0 + 0.1 + cyc * (2.6 + ph * 1.2);
      const s = 0.05 * (1 - cyc * 0.7) * alive;
      dummy.position.set(x, y, z);
      dummy.scale.setScalar(Math.max(0.001, s));
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, K]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial color="#FFC15A" emissive="#FF7A1A" emissiveIntensity={3} toneMapped={false} transparent opacity={0.95} depthWrite={false} />
    </instancedMesh>
  );
}

/* ── Vaho: volutas de vapor que ascienden al evaporar (realismo) ───────── */
function Vaho({ progreso }: { progreso: number }) {
  const K = 12;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame((state) => {
    const m = mesh.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    const alive = progreso > 0.05 ? 1 : 0;
    for (let i = 0; i < K; i++) {
      const ph = prand(i, 23);
      const cyc = (t * (0.32 + ph * 0.25) + ph) % 1;
      const x = (prand(i, 27) - 0.5) * 1.0 + Math.sin(cyc * 4 + i) * 0.2;
      const z = (prand(i, 29) - 0.5) * 1.0;
      const y = Y0 + 0.3 + cyc * (3.0 + ph);
      const s = (0.18 + cyc * 0.3) * Math.sin(cyc * Math.PI) * alive;
      dummy.position.set(x, y, z);
      dummy.scale.setScalar(Math.max(0.001, s));
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, K]}>
      <sphereGeometry args={[1, 10, 10]} />
      <meshStandardMaterial color="#eef7fd" roughness={1} transparent opacity={0.16} depthWrite={false} />
    </instancedMesh>
  );
}

/* ── Vaso de precipitado de vidrio (borosilicato con transmisión) ──────── */
function Vaso() {
  return (
    <group>
      {/* pared cilíndrica */}
      <mesh position={[0, BK_BOT + BK_H / 2, 0]}>
        <cylinderGeometry args={[BK_R, BK_R * 0.96, BK_H, 56, 1, true]} />
        <meshPhysicalMaterial
          color={GLASS}
          roughness={0.05}
          metalness={0}
          transmission={1}
          thickness={0.5}
          ior={1.47}
          transparent
          opacity={1}
          side={THREE.DoubleSide}
          depthWrite={false}
          clearcoat={1}
          clearcoatRoughness={0.05}
        />
      </mesh>
      {/* fondo */}
      <mesh position={[0, BK_BOT + 0.04, 0]} receiveShadow>
        <cylinderGeometry args={[BK_R * 0.96, BK_R * 0.96, 0.08, 56]} />
        <meshPhysicalMaterial color={GLASS} roughness={0.06} metalness={0} transmission={0.95} thickness={0.6} ior={1.47} transparent opacity={1} side={THREE.DoubleSide} />
      </mesh>
      {/* labio superior */}
      <mesh position={[0, BK_BOT + BK_H, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[BK_R, 0.035, 14, 56]} />
        <meshPhysicalMaterial color="#eaf6ff" roughness={0.08} metalness={0} transmission={0.9} thickness={0.3} ior={1.47} transparent opacity={0.9} />
      </mesh>
      {/* vierteaguas (pico) */}
      <mesh position={[BK_R - 0.02, BK_BOT + BK_H - 0.02, 0]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.16, 0.06, 0.18]} />
        <meshPhysicalMaterial color="#eaf6ff" roughness={0.08} metalness={0} transmission={0.9} thickness={0.3} ior={1.47} transparent opacity={0.85} />
      </mesh>
    </group>
  );
}

/* ── Trípode metálico + rejilla de asbesto ─────────────────────────────── */
function Tripode() {
  const legs = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];
  const ringR = 1.05;
  return (
    <group>
      {/* aro superior */}
      <mesh position={[0, GAUZE_Y, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[ringR, 0.05, 12, 40]} />
        <meshStandardMaterial color="#7c8696" roughness={0.35} metalness={0.85} />
      </mesh>
      {/* patas */}
      {legs.map((a, i) => {
        const x = Math.cos(a) * ringR;
        const z = Math.sin(a) * ringR;
        const top = new THREE.Vector3(x, GAUZE_Y, z);
        const bot = new THREE.Vector3(x * 1.15, FLOOR_Y + 0.02, z * 1.15);
        const mid = top.clone().add(bot).multiplyScalar(0.5);
        const len = top.distanceTo(bot);
        const dir = bot.clone().sub(top).normalize();
        const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
        const euler = new THREE.Euler().setFromQuaternion(quat);
        return (
          <mesh key={i} position={[mid.x, mid.y, mid.z]} rotation={[euler.x, euler.y, euler.z]} castShadow>
            <cylinderGeometry args={[0.045, 0.045, len, 12]} />
            <meshStandardMaterial color="#6b7585" roughness={0.4} metalness={0.85} />
          </mesh>
        );
      })}
      {/* rejilla de asbesto */}
      <mesh position={[0, GAUZE_Y + 0.01, 0]}>
        <boxGeometry args={[1.7, 0.04, 1.7]} />
        <meshStandardMaterial color="#1d242e" roughness={0.85} metalness={0.2} />
      </mesh>
      <mesh position={[0, GAUZE_Y + 0.035, 0]}>
        <boxGeometry args={[1.1, 0.02, 1.1]} />
        <meshStandardMaterial color="#cfd6de" roughness={0.7} metalness={0.3} />
      </mesh>
    </group>
  );
}

/* ── Mechero Bunsen + llama parpadeante ────────────────────────────────── */
function Mechero({ flama, progreso, accent }: { flama: boolean; progreso: number; accent: string }) {
  const flameRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const barrelTop = -1.32;
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const g = flameRef.current;
    if (g) {
      g.scale.y = (0.5 + progreso * 0.9) * (1 + Math.sin(t * 22) * 0.1 + Math.sin(t * 13.3) * 0.06);
      g.scale.x = 1 + Math.sin(t * 17) * 0.05;
      g.scale.z = 1 + Math.sin(t * 19) * 0.05;
    }
    const l = lightRef.current;
    if (l) l.intensity = (0.5 + progreso * 1.7) * 8 * (0.85 + Math.sin(t * 20) * 0.15);
  });

  return (
    <group position={[0, FLOOR_Y, 0]}>
      {/* base pesada */}
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.46, 0.56, 0.24, 32]} />
        <meshStandardMaterial color="#2b3543" roughness={0.5} metalness={0.7} />
      </mesh>
      {/* cuello */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.18, 0.45, 24]} />
        <meshStandardMaterial color="#4a5667" roughness={0.4} metalness={0.8} />
      </mesh>
      {/* cañón */}
      <mesh position={[0, (barrelTop - FLOOR_Y) / 2 + 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.11, 0.12, barrelTop - FLOOR_Y - 0.1, 24]} />
        <meshStandardMaterial color="#5a6779" roughness={0.35} metalness={0.85} />
      </mesh>
      {/* collar de aire */}
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.135, 0.135, 0.18, 24]} />
        <meshStandardMaterial color="#39434f" roughness={0.45} metalness={0.75} />
      </mesh>

      {flama && (
        <group ref={flameRef} position={[0, barrelTop - FLOOR_Y, 0]}>
          {/* llama externa (azul/naranja) */}
          <mesh position={[0, 0.42, 0]}>
            <coneGeometry args={[0.2, 0.9, 22]} />
            <meshStandardMaterial color="#FF8A3C" emissive="#FF6A1A" emissiveIntensity={1.4} toneMapped={false} transparent opacity={0.9} depthWrite={false} />
          </mesh>
          {/* cono interno azul (más caliente) */}
          <mesh position={[0, 0.3, 0]}>
            <coneGeometry args={[0.1, 0.55, 18]} />
            <meshStandardMaterial color="#9FE8FF" emissive="#4FB8FF" emissiveIntensity={1.8} toneMapped={false} transparent opacity={0.95} depthWrite={false} />
          </mesh>
          <pointLight ref={lightRef} position={[0, 0.55, 0]} color={accent} distance={10} />
          <pointLight position={[0, 0.4, 0]} color="#FF8A3C" intensity={4} distance={5} />
        </group>
      )}
    </group>
  );
}

/* ── Etiquetas flotantes opcionales (drei Html con z-index bajo) ────────── */
function Etiqueta({ pos, texto, accent }: { pos: [number, number, number]; texto: string; accent: string }) {
  return (
    <Html position={pos} center distanceFactor={11} zIndexRange={[40, 0]} style={{ pointerEvents: "none" }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 10px",
          borderRadius: 999,
          background: "rgba(2,12,28,0.82)",
          border: `1px solid ${accent}88`,
          color: "#fff",
          fontSize: 12,
          fontWeight: 800,
          whiteSpace: "nowrap",
          fontFamily: "system-ui, sans-serif",
          boxShadow: "0 4px 14px -4px rgba(0,0,0,0.6)",
        }}
      >
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: accent }} />
        {texto}
      </div>
    </Html>
  );
}

/* ── Escena completa ───────────────────────────────────────────────────── */
export default function PropiedadesMateriaScene(props: PropiedadesSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [0, 1.5, 11], fov: 42 }}
    >
      <color attach="background" args={["#040e1c"]} />
      <fog attach="fog" args={["#040e1c", 16, 40]} />

      <ambientLight intensity={0.5} />
      <hemisphereLight intensity={0.4} color="#bfe8ff" groundColor="#0a1422" />
      <directionalLight
        position={[5, 9, 5]}
        intensity={2.1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={32}
        shadow-bias={-0.0004}
      />
      <pointLight position={[-6, 3, 3]} intensity={14} color={props.accent} />
      <pointLight position={[5, 1, 5]} intensity={7} color="#ffffff" />

      {/* Mesa de laboratorio reflectante */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <MeshReflectorMaterial
          resolution={512}
          blur={[420, 160]}
          mixBlur={1}
          mixStrength={2.4}
          mixContrast={1}
          roughness={0.82}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.3}
          color="#050f1c"
          metalness={0.55}
          mirror={0.55}
        />
      </mesh>

      <group key={`${props.transKey}-${props.resetNonce}`}>
        <Mechero flama={props.flama} progreso={props.progreso} accent={props.accent} />
        <Tripode />
        <Muestra modo={props.modo} ci={props.colorInicial} cf={props.colorFinal} progreso={props.progreso} />
        {props.emite !== "ninguno" && <Emisiones esHumo={props.emite === "humo"} progreso={props.progreso} />}
        {props.flama && props.emite === "humo" && <Brasas progreso={props.progreso} />}
        {props.modo === "gas" && <Vaho progreso={props.progreso} />}
        <Vaso />
        {props.etiquetas && (
          <>
            {props.sustancia && <Etiqueta pos={[0, BK_BOT + BK_H + 0.5, 0]} texto={props.sustancia} accent={props.accent} />}
            {props.flama && <Etiqueta pos={[1.3, FLOOR_Y + 0.9, 0]} texto="Mechero Bunsen" accent="#FF8A3C" />}
            <Etiqueta pos={[-1.35, GAUZE_Y, 0]} texto="Trípode + rejilla" accent="#9fb4cc" />
          </>
        )}
        <ContactShadows position={[0, FLOOR_Y + 0.02, 0]} opacity={0.4} scale={18} blur={2.6} far={7} color="#020912" />
      </group>

      {/* Motas de polvo suspendidas (atmósfera) */}
      <Sparkles count={34} scale={[12, 7, 12]} position={[0, 1.2, 0]} size={2.4} speed={0.3} opacity={0.5} color={props.accent} noise={0.4} />

      <Environment resolution={256}>
        <Lightformer intensity={2.2} position={[0, 5, 2]} scale={[10, 4, 1]} color="#ffffff" />
        <Lightformer intensity={1.5} position={[-6, 2, -2]} scale={[6, 6, 1]} color={props.accent} />
        <Lightformer intensity={1.2} position={[6, 1, 3]} scale={[5, 5, 1]} color="#bfe8ff" />
        <Lightformer intensity={0.8} position={[0, -3, -4]} scale={[10, 6, 1]} color="#1a2c44" />
      </Environment>

      <OrbitControls
        enablePan={false}
        minDistance={6}
        maxDistance={18}
        minPolarAngle={Math.PI / 7}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, -0.1, 0]}
        autoRotate={props.autoRotate}
        autoRotateSpeed={0.45}
      />

      <EffectComposer enableNormalPass={false} multisampling={0}>
        <Bloom intensity={0.7} luminanceThreshold={0.6} luminanceSmoothing={0.3} mipmapBlur radius={0.72} />
        <Vignette eskil={false} offset={0.26} darkness={0.5} />
        <SMAA />
      </EffectComposer>
    </Canvas>
  );
}
