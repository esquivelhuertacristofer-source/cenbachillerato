"use client";

/**
 * Escena 3D del laboratorio de Energía, partículas y electricidad (R3F).
 * Se carga de forma diferida (ssr:false) desde LabEnergiaElectricidad.tsx.
 *
 * Un circuito en forma de lazo rectangular: una PILA (fuente de energía) empuja
 * los ELECTRONES (esferas azules) por el CONDUCTOR. En el lazo hay un INTERRUPTOR
 * y un MATERIAL de prueba. La corriente solo circula —y el FOCO solo enciende—
 * cuando el interruptor está cerrado y el material conduce. El brillo del foco
 * crece con el voltaje: la energía eléctrica se transforma en luz.
 */

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";

export interface ElectricidadSceneProps {
  conduce: boolean;
  switchClosed: boolean;
  voltaje: number;
  brillo: number; // 0..1
  materialColor: string;
  materialConductor: boolean;
  accent: string;
  autoRotate: boolean;
  resetNonce: number;
}

const ELECTRON = "#5BC8FF";
const WIRE = "#8A95A3";
const FOCO_ON = "#FFE08A";

/* ── Geometría del lazo (rectángulo en el plano XY) ───────────────────── */
const CORNERS: [number, number][] = [
  [-3.4, -2.1], // inferior izquierda
  [3.4, -2.1], // inferior derecha
  [3.4, 2.1], // superior derecha
  [-3.4, 2.1], // superior izquierda
];
const SEG_LEN = [6.8, 4.2, 6.8, 4.2];
const PERIM = SEG_LEN[0]! + SEG_LEN[1]! + SEG_LEN[2]! + SEG_LEN[3]!;

/** Posición a lo largo del perímetro del lazo (recorrido continuo). */
function posAt(s: number): [number, number, number] {
  let d = ((s % PERIM) + PERIM) % PERIM;
  for (let i = 0; i < 4; i++) {
    const a = CORNERS[i]!;
    const b = CORNERS[(i + 1) % 4]!;
    const len = SEG_LEN[i]!;
    if (d <= len) {
      const f = d / len;
      return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, 0];
    }
    d -= len;
  }
  return [CORNERS[0]![0], CORNERS[0]![1], 0];
}

/* ── Tramo de cable entre dos puntos del plano ─────────────────────────── */
function Wire({ a, b }: { a: [number, number]; b: [number, number] }) {
  const { mid, quat, len } = useMemo(() => {
    const s = new THREE.Vector3(a[0], a[1], 0);
    const e = new THREE.Vector3(b[0], b[1], 0);
    const dir = new THREE.Vector3().subVectors(e, s);
    const len = dir.length();
    const mid = new THREE.Vector3().addVectors(s, e).multiplyScalar(0.5);
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    return { mid, quat, len };
  }, [a, b]);
  return (
    <mesh position={mid} quaternion={quat} castShadow>
      <cylinderGeometry args={[0.075, 0.075, len, 14]} />
      <meshStandardMaterial color={WIRE} roughness={0.3} metalness={0.7} />
    </mesh>
  );
}

/* ── Electrones que fluyen por el lazo ─────────────────────────────────── */
function ElectronesFlujo({ conduce, voltaje }: { conduce: boolean; voltaje: number }) {
  const N = 26;
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const phase = useRef(0);
  useFrame((_, delta) => {
    const speed = conduce ? 2.7 * (voltaje / 4.5) : 0;
    phase.current = (phase.current + speed * delta) % PERIM;
    for (let i = 0; i < N; i++) {
      const m = refs.current[i];
      if (!m) continue;
      const p = posAt(phase.current + (i / N) * PERIM);
      m.position.set(p[0], p[1], p[2]);
      m.scale.setScalar(conduce ? 1 : 0.78);
    }
  });
  return (
    <>
      {Array.from({ length: N }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.13, 14, 14]} />
          <meshStandardMaterial color={ELECTRON} emissive={ELECTRON} emissiveIntensity={conduce ? 1.8 : 0.5} toneMapped={false} roughness={0.4} />
        </mesh>
      ))}
    </>
  );
}

/* ── Pila (fuente de energía) en el tramo inferior ─────────────────────── */
function Pila() {
  return (
    <group position={[0, -2.1, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.9, 0.82, 0.62]} />
        <meshStandardMaterial color="#2A2F38" roughness={0.45} metalness={0.4} />
      </mesh>
      {/* banda */}
      <mesh position={[0, 0, 0.32]}>
        <boxGeometry args={[1.9, 0.34, 0.02]} />
        <meshStandardMaterial color="#11151b" roughness={0.6} />
      </mesh>
      {/* terminal + (derecha) */}
      <mesh position={[0.78, 0, 0.34]}>
        <boxGeometry args={[0.26, 0.06, 0.04]} />
        <meshStandardMaterial color="#FF6B5E" emissive="#FF6B5E" emissiveIntensity={0.8} toneMapped={false} />
      </mesh>
      <mesh position={[0.78, 0, 0.34]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.26, 0.06, 0.04]} />
        <meshStandardMaterial color="#FF6B5E" emissive="#FF6B5E" emissiveIntensity={0.8} toneMapped={false} />
      </mesh>
      {/* terminal − (izquierda) */}
      <mesh position={[-0.78, 0, 0.34]}>
        <boxGeometry args={[0.26, 0.06, 0.04]} />
        <meshStandardMaterial color="#7FB6FF" emissive="#7FB6FF" emissiveIntensity={0.8} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ── Foco en el tramo superior ─────────────────────────────────────────── */
function Foco({ brillo }: { brillo: number }) {
  const on = brillo > 0.001;
  return (
    <group position={[0, 2.1, 0]}>
      {/* casquillo */}
      <mesh position={[0, -0.32, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.24, 0.34, 16]} />
        <meshStandardMaterial color="#9aa3ad" roughness={0.4} metalness={0.8} />
      </mesh>
      {/* bulbo */}
      <mesh position={[0, 0.18, 0]} castShadow>
        <sphereGeometry args={[0.46, 26, 26]} />
        <meshStandardMaterial
          color={on ? FOCO_ON : "#3a3d44"}
          emissive={FOCO_ON}
          emissiveIntensity={brillo * 2.6}
          transparent
          opacity={0.92}
          roughness={0.15}
          metalness={0.05}
          toneMapped={false}
        />
      </mesh>
      {on && <pointLight position={[0, 0.25, 0]} intensity={brillo * 9} distance={9} color={FOCO_ON} />}
    </group>
  );
}

/* ── Interruptor en el tramo derecho ───────────────────────────────────── */
function Interruptor({ closed }: { closed: boolean }) {
  // pivote abajo; cerrado = vertical (toca el contacto superior), abierto = inclinado
  return (
    <group position={[3.4, 0, 0]}>
      {/* contactos */}
      <mesh position={[0, -0.55, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#C9D2DC" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color={closed ? "#C9D2DC" : "#5a626c"} roughness={0.3} metalness={0.8} />
      </mesh>
      {/* palanca */}
      <group position={[0, -0.55, 0]} rotation={[0, 0, closed ? 0 : -0.85]}>
        <mesh position={[0, 0.55, 0]} castShadow>
          <boxGeometry args={[0.14, 1.18, 0.14]} />
          <meshStandardMaterial color={closed ? "#FFC24D" : "#aeb6c0"} emissive={closed ? "#FFC24D" : "#000000"} emissiveIntensity={closed ? 0.5 : 0} roughness={0.4} metalness={0.5} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

/* ── Material de prueba en el tramo izquierdo ──────────────────────────── */
function MaterialPrueba({ color, conductor }: { color: string; conductor: boolean }) {
  return (
    <group position={[-3.4, 0, 0]}>
      {/* contactos */}
      <mesh position={[0, -0.62, 0]}>
        <sphereGeometry args={[0.11, 16, 16]} />
        <meshStandardMaterial color="#C9D2DC" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.62, 0]}>
        <sphereGeometry args={[0.11, 16, 16]} />
        <meshStandardMaterial color="#C9D2DC" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* barra del material */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.5, 1.0, 0.5]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.2} />
      </mesh>
      {/* indicador conduce / no conduce */}
      <mesh position={[-0.62, 0, 0]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial color={conductor ? "#34D399" : "#FF5E5E"} emissive={conductor ? "#34D399" : "#FF5E5E"} emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ── Escena completa ───────────────────────────────────────────────────── */
export default function EnergiaElectricidadScene(props: ElectricidadSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [0, 0.3, 11], fov: 44 }}
    >
      <color attach="background" args={["#03101f"]} />
      <fog attach="fog" args={["#03101f", 16, 38]} />

      <ambientLight intensity={0.5} />
      <directionalLight
        position={[4, 8, 6]}
        intensity={1.9}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-bias={-0.0004}
      />
      <pointLight position={[-6, 3, 3]} intensity={14} color={props.accent} />

      <group key={`${props.resetNonce}`}>
        {/* Cables (con huecos para el interruptor y el material) */}
        <Wire a={CORNERS[0]!} b={CORNERS[1]!} />
        <Wire a={CORNERS[2]!} b={CORNERS[3]!} />
        <Wire a={[3.4, -2.1]} b={[3.4, -0.55]} />
        <Wire a={[3.4, 0.55]} b={[3.4, 2.1]} />
        <Wire a={[-3.4, -2.1]} b={[-3.4, -0.62]} />
        <Wire a={[-3.4, 0.62]} b={[-3.4, 2.1]} />

        {/* Esquinas */}
        {CORNERS.map((c, i) => (
          <mesh key={i} position={[c[0], c[1], 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color={WIRE} roughness={0.3} metalness={0.7} />
          </mesh>
        ))}

        <Pila />
        <Foco brillo={props.brillo} />
        <Interruptor closed={props.switchClosed} />
        <MaterialPrueba color={props.materialColor} conductor={props.materialConductor} />
        <ElectronesFlujo conduce={props.conduce} voltaje={props.voltaje} />

        <ContactShadows position={[0, -3.4, 0]} opacity={0.32} scale={16} blur={3} far={6} color="#2a3f57" />
      </group>

      <Environment resolution={256}>
        <Lightformer intensity={1.9} position={[0, 5, 2]} scale={[10, 4, 1]} color="#ffffff" />
        <Lightformer intensity={1.3} position={[-6, 2, -2]} scale={[6, 6, 1]} color={props.accent} />
        <Lightformer intensity={1.0} position={[6, 1, 3]} scale={[5, 5, 1]} color="#bfe8ff" />
      </Environment>

      <OrbitControls
        enablePan={false}
        minDistance={7}
        maxDistance={18}
        minPolarAngle={Math.PI / 3.4}
        maxPolarAngle={Math.PI / 1.8}
        target={[0, 0, 0]}
        autoRotate={props.autoRotate}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.5} luminanceThreshold={0.62} luminanceSmoothing={0.3} mipmapBlur radius={0.7} />
        <Vignette eskil={false} offset={0.28} darkness={0.42} />
      </EffectComposer>
    </Canvas>
  );
}
