"use client";

/**
 * Escena 3D del laboratorio de Modelos atómicos (React Three Fiber).
 * Se carga de forma diferida (ssr:false) desde LabModelosAtomicos.tsx.
 *
 * Representa la EVOLUCIÓN histórica del modelo atómico para el elemento elegido:
 *   · DALTON (1808)      → esfera maciza e indivisible.
 *   · THOMSON (1904)     → "budín de pasas": esfera positiva con electrones dentro.
 *   · RUTHERFORD (1911)  → núcleo denso y positivo; electrones en órbitas sin definir.
 *   · BOHR (1913)        → electrones en órbitas circulares de energía definida (capas).
 *   · SCHRÖDINGER (1926) → nube de probabilidad (orbitales) alrededor del núcleo.
 *
 * El núcleo se arma con el nº real de protones (rojo) y neutrones (gris) del
 * elemento; los electrones se reparten por capas según su configuración.
 */

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";

export type ModeloKey = "dalton" | "thomson" | "rutherford" | "bohr" | "schrodinger";

export interface AtomoSceneProps {
  modelo: ModeloKey;
  protones: number;
  neutrones: number;
  electrones: number;
  shells: number[]; // electrones por capa
  elementColor: string;
  accent: string; // color del área (hex) para luces
  autoRotate: boolean;
  resetNonce: number;
}

const PROTON_COLOR = "#FF6B6B";
const NEUTRON_COLOR = "#9AA7B5";
const ELECTRON_COLOR = "#5BC8FF";

const R0 = 0.95; // radio de la primera capa
const STEP = 0.52; // separación entre capas
const NUCLEON_R = 0.1;
const ELECTRON_R = 0.085;

// PRNG determinista (sin Math.random): mismo índice → mismo valor en cada render.
function rng(n: number): number {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/* ── Núcleo: cúmulo de protones (rojo) y neutrones (gris) ─────────────── */
function buildCluster(count: number, radius: number, salt: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    const th = rng(i + salt) * Math.PI * 2;
    const ph = Math.acos(2 * rng(i + salt + 50) - 1);
    const r = radius * Math.cbrt(rng(i + salt + 100));
    out.push(r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th));
  }
  return out;
}

function Nucleo({ protones, neutrones }: { protones: number; neutrones: number }) {
  const pRef = useRef<THREE.InstancedMesh>(null);
  const nRef = useRef<THREE.InstancedMesh>(null);
  const grupo = useRef<THREE.Group>(null);
  const dummy = useRef(new THREE.Object3D());

  const total = protones + neutrones;
  const radio = 0.16 + 0.05 * Math.cbrt(total);

  // Posiciones deterministas (entremezcla protones y neutrones en el cúmulo).
  const { pp, nn } = useMemo(() => {
    const all = buildCluster(total, radio * 0.9, 7);
    const pp: number[] = [];
    const nn: number[] = [];
    for (let i = 0; i < total; i++) {
      const trio = [all[i * 3]!, all[i * 3 + 1]!, all[i * 3 + 2]!];
      if (i < protones) pp.push(...trio);
      else nn.push(...trio);
    }
    return { pp, nn };
  }, [protones, total, radio]);

  useEffect(() => {
    const d = dummy.current;
    if (pRef.current) {
      for (let i = 0; i < protones; i++) {
        d.position.set(pp[i * 3]!, pp[i * 3 + 1]!, pp[i * 3 + 2]!);
        d.updateMatrix();
        pRef.current.setMatrixAt(i, d.matrix);
      }
      pRef.current.instanceMatrix.needsUpdate = true;
    }
    if (nRef.current) {
      for (let i = 0; i < neutrones; i++) {
        d.position.set(nn[i * 3]!, nn[i * 3 + 1]!, nn[i * 3 + 2]!);
        d.updateMatrix();
        nRef.current.setMatrixAt(i, d.matrix);
      }
      nRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [pp, nn, protones, neutrones]);

  useFrame((_, delta) => {
    if (grupo.current) grupo.current.rotation.y += delta * 0.25;
  });

  return (
    <group ref={grupo}>
      <instancedMesh ref={pRef} args={[undefined, undefined, Math.max(protones, 1)]} castShadow>
        <sphereGeometry args={[NUCLEON_R, 16, 16]} />
        <meshStandardMaterial color={PROTON_COLOR} emissive={PROTON_COLOR} emissiveIntensity={0.35} roughness={0.4} metalness={0.1} />
      </instancedMesh>
      {neutrones > 0 && (
        <instancedMesh ref={nRef} args={[undefined, undefined, neutrones]} castShadow>
          <sphereGeometry args={[NUCLEON_R, 16, 16]} />
          <meshStandardMaterial color={NEUTRON_COLOR} emissive={NEUTRON_COLOR} emissiveIntensity={0.12} roughness={0.55} metalness={0.1} />
        </instancedMesh>
      )}
      {/* halo tenue del núcleo */}
      <mesh>
        <sphereGeometry args={[radio * 1.15, 24, 24]} />
        <meshBasicMaterial color={PROTON_COLOR} transparent opacity={0.07} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ── Electrones en órbita (Bohr = capas definidas, Rutherford = caóticas) ─ */
interface OrbSpec {
  r: number;
  ux: number; uy: number; uz: number;
  vx: number; vy: number; vz: number;
  phase: number;
  speed: number;
}

function OrbitElectrones({ specs }: { specs: OrbSpec[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useRef(new THREE.Object3D());

  useFrame((state) => {
    const m = ref.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    const d = dummy.current;
    for (let i = 0; i < specs.length; i++) {
      const s = specs[i]!;
      const a = s.phase + t * s.speed;
      const c = Math.cos(a), sn = Math.sin(a);
      d.position.set(
        s.r * (c * s.ux + sn * s.vx),
        s.r * (c * s.uy + sn * s.vy),
        s.r * (c * s.uz + sn * s.vz),
      );
      d.updateMatrix();
      m.setMatrixAt(i, d.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, Math.max(specs.length, 1)]} castShadow>
      <sphereGeometry args={[ELECTRON_R, 18, 18]} />
      <meshStandardMaterial color={ELECTRON_COLOR} emissive={ELECTRON_COLOR} emissiveIntensity={1.1} roughness={0.3} metalness={0} />
    </instancedMesh>
  );
}

/* ── Anillos de las órbitas de Bohr (energía definida) ────────────────── */
function AnillosBohr({ rings }: { rings: { r: number; rotX: number }[] }) {
  return (
    <>
      {rings.map((ring, i) => (
        <mesh key={i} rotation={[ring.rotX, 0, 0]}>
          <torusGeometry args={[ring.r, 0.008, 8, 96]} />
          <meshStandardMaterial color="#7fd4ff" emissive="#3aa0d8" emissiveIntensity={0.5} transparent opacity={0.55} />
        </mesh>
      ))}
    </>
  );
}

/* ── Electrones "incrustados" del modelo de Thomson (budín de pasas) ───── */
function EmbeddedElectrones({ electrones, radio }: { electrones: number; radio: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useRef(new THREE.Object3D());
  const base = useMemo(() => buildCluster(electrones, radio * 0.78, 13), [electrones, radio]);

  useFrame((state) => {
    const m = ref.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    const d = dummy.current;
    for (let i = 0; i < electrones; i++) {
      const w = 0.05;
      d.position.set(
        base[i * 3]! + Math.sin(t * 1.6 + i) * w,
        base[i * 3 + 1]! + Math.sin(t * 1.9 + i * 1.7) * w,
        base[i * 3 + 2]! + Math.sin(t * 1.4 + i * 2.3) * w,
      );
      d.updateMatrix();
      m.setMatrixAt(i, d.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, Math.max(electrones, 1)]}>
      <sphereGeometry args={[ELECTRON_R, 18, 18]} />
      <meshStandardMaterial color={ELECTRON_COLOR} emissive={ELECTRON_COLOR} emissiveIntensity={1.0} roughness={0.3} metalness={0} />
    </instancedMesh>
  );
}

/* ── Nube de probabilidad (Schrödinger): orbitales como densidad de puntos ─ */
function NubeProbabilidad({ shells }: { shells: number[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useRef(new THREE.Object3D());
  const COUNT = 460;

  const buf = useRef<{ pos: Float32Array; sc: Float32Array; seed: Float32Array } | null>(null);
  if (buf.current === null) {
    const pos = new Float32Array(COUNT * 3);
    const sc = new Float32Array(COUNT);
    const seed = new Float32Array(COUNT);
    const totalE = shells.reduce((a, b) => a + b, 0) || 1;
    let written = 0;
    for (let s = 0; s < shells.length; s++) {
      const cuota = Math.round((shells[s]! / totalE) * COUNT);
      const radioCapa = R0 + s * STEP;
      const fin = s === shells.length - 1 ? COUNT : Math.min(COUNT, written + cuota);
      for (; written < fin; written++) {
        const k = written;
        const th = rng(k + 1) * Math.PI * 2;
        const ph = Math.acos(2 * rng(k + 201) - 1);
        // jitter gaussiano alrededor del radio típico de la capa
        const g = (rng(k + 401) + rng(k + 601) + rng(k + 801) - 1.5) * 0.4;
        const r = Math.max(0.2, radioCapa + g);
        pos[k * 3] = r * Math.sin(ph) * Math.cos(th);
        pos[k * 3 + 1] = r * Math.cos(ph);
        pos[k * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
        sc[k] = 0.5 + rng(k + 1001) * 0.9;
        seed[k] = rng(k + 1201) * 10;
      }
    }
    buf.current = { pos, sc, seed };
  }

  useFrame((state) => {
    const m = ref.current;
    if (!m || buf.current === null) return;
    const { pos, sc, seed } = buf.current;
    const t = state.clock.elapsedTime;
    const d = dummy.current;
    for (let i = 0; i < COUNT; i++) {
      d.position.set(pos[i * 3]!, pos[i * 3 + 1]!, pos[i * 3 + 2]!);
      const pulse = 0.7 + 0.3 * Math.sin(t * 2 + seed[i]!);
      d.scale.setScalar(sc[i]! * pulse);
      d.updateMatrix();
      m.setMatrixAt(i, d.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, COUNT]}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshStandardMaterial
        color={ELECTRON_COLOR}
        emissive={ELECTRON_COLOR}
        emissiveIntensity={1.3}
        transparent
        opacity={0.5}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}

/* ── Modelo de Dalton: esfera maciza e indivisible ───────────────────── */
function EsferaDalton({ color }: { color: string }) {
  return (
    <group>
      <mesh castShadow>
        <sphereGeometry args={[1.35, 48, 48]} />
        <meshStandardMaterial color={color} roughness={0.55} metalness={0.15} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.355, 24, 18]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.08} />
      </mesh>
    </group>
  );
}

/* ── Modelo de Thomson: esfera positiva translúcida + electrones ─────── */
function EsferaThomson({ electrones }: { electrones: number }) {
  const radio = 1.45;
  return (
    <group>
      <mesh>
        <sphereGeometry args={[radio, 48, 48]} />
        <meshPhysicalMaterial color="#ff9166" transparent opacity={0.14} roughness={0.2} metalness={0} clearcoat={1} clearcoatRoughness={0.1} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[radio, 24, 18]} />
        <meshBasicMaterial color="#ffb38a" wireframe transparent opacity={0.12} />
      </mesh>
      <EmbeddedElectrones electrones={electrones} radio={radio} />
    </group>
  );
}

/* ── Composición del átomo según el modelo activo ────────────────────── */
function Atomo({ modelo, protones, neutrones, electrones, shells, elementColor }: {
  modelo: ModeloKey;
  protones: number;
  neutrones: number;
  electrones: number;
  shells: number[];
  elementColor: string;
}) {
  // Especificaciones de las órbitas (Bohr y Rutherford).
  const { specs, rings } = useMemo(() => {
    const specs: OrbSpec[] = [];
    const rings: { r: number; rotX: number }[] = [];

    if (modelo === "bohr") {
      for (let s = 0; s < shells.length; s++) {
        const r = R0 + s * STEP;
        const phi = s * 0.5;
        const ux = 1, uy = 0, uz = 0;
        const vx = 0, vy = -Math.sin(phi), vz = Math.cos(phi);
        const dir = s % 2 === 0 ? 1 : -1;
        const speed = dir * (0.95 / (s * 0.5 + 1));
        const count = shells[s]!;
        rings.push({ r, rotX: phi + Math.PI / 2 });
        for (let j = 0; j < count; j++) {
          specs.push({ r, ux, uy, uz, vx, vy, vz, phase: (j / count) * Math.PI * 2, speed });
        }
      }
    } else if (modelo === "rutherford") {
      for (let k = 0; k < electrones; k++) {
        const r = 1.05 + rng(k + 1) * 1.35;
        // normal aleatoria → base ortonormal (u, v) del plano de la órbita
        const th = rng(k + 11) * Math.PI * 2;
        const ph = Math.acos(2 * rng(k + 21) - 1);
        const nx = Math.sin(ph) * Math.cos(th), ny = Math.cos(ph), nz = Math.sin(ph) * Math.sin(th);
        const ax = Math.abs(nx) < 0.9 ? 1 : 0, ay = Math.abs(nx) < 0.9 ? 0 : 1, az = 0;
        // u = normalize(n × a)
        let uxr = ny * az - nz * ay, uyr = nz * ax - nx * az, uzr = nx * ay - ny * ax;
        const ul = Math.hypot(uxr, uyr, uzr) || 1;
        uxr /= ul; uyr /= ul; uzr /= ul;
        // v = n × u
        const vxr = ny * uzr - nz * uyr, vyr = nz * uxr - nx * uzr, vzr = nx * uyr - ny * uxr;
        const speed = (rng(k + 31) < 0.5 ? 1 : -1) * (0.5 + rng(k + 41) * 0.7);
        specs.push({ r, ux: uxr, uy: uyr, uz: uzr, vx: vxr, vy: vyr, vz: vzr, phase: rng(k + 51) * Math.PI * 2, speed });
      }
    }
    return { specs, rings };
  }, [modelo, shells, electrones]);

  if (modelo === "dalton") return <EsferaDalton color={elementColor} />;
  if (modelo === "thomson") return <EsferaThomson electrones={electrones} />;

  return (
    <group>
      <Nucleo protones={protones} neutrones={neutrones} />
      {modelo === "bohr" && <AnillosBohr rings={rings} />}
      {(modelo === "bohr" || modelo === "rutherford") && <OrbitElectrones specs={specs} />}
      {modelo === "schrodinger" && <NubeProbabilidad shells={shells} />}
    </group>
  );
}

/* ── Escena completa ─────────────────────────────────────────────────── */
export default function ModelosAtomicosScene(props: AtomoSceneProps) {
  // resetNonce: remonta el átomo para reiniciar las posiciones de las partículas.
  const atomoKey = `${props.modelo}-${props.protones}-${props.neutrones}-${props.resetNonce}`;

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [0, 1.4, 6.4], fov: 45 }}
    >
      <color attach="background" args={["#03101f"]} />
      <fog attach="fog" args={["#03101f", 14, 26]} />

      <ambientLight intensity={0.55} />
      <directionalLight
        position={[4, 8, 4]}
        intensity={2.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={26}
        shadow-bias={-0.0004}
      />
      <pointLight position={[-4, 3, -3]} intensity={18} color={props.accent} />
      <pointLight position={[3, 1, 4]} intensity={9} color="#ffffff" />

      <group position={[0, 0.1, 0]} key={atomoKey}>
        <Atomo
          modelo={props.modelo}
          protones={props.protones}
          neutrones={props.neutrones}
          electrones={props.electrones}
          shells={props.shells}
          elementColor={props.elementColor}
        />
        <ContactShadows position={[0, -2.6, 0]} opacity={0.35} scale={9} blur={2.8} far={5} color="#2a3f57" />
      </group>

      {/* Reflejos de estudio sin assets externos */}
      <Environment resolution={256}>
        <Lightformer intensity={2.0} position={[0, 5, 2]} scale={[9, 4, 1]} color="#ffffff" />
        <Lightformer intensity={1.4} position={[-5, 2, -2]} scale={[5, 5, 1]} color={props.accent} />
        <Lightformer intensity={1.1} position={[5, 1, 3]} scale={[4, 4, 1]} color="#bfe8ff" />
      </Environment>

      <OrbitControls
        enablePan={false}
        minDistance={3.5}
        maxDistance={12}
        minPolarAngle={Math.PI / 7}
        maxPolarAngle={Math.PI / 1.9}
        target={[0, 0, 0]}
        autoRotate={props.autoRotate}
        autoRotateSpeed={0.5}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.4} luminanceThreshold={0.7} luminanceSmoothing={0.3} mipmapBlur radius={0.65} />
        <Vignette eskil={false} offset={0.28} darkness={0.42} />
      </EffectComposer>
    </Canvas>
  );
}
