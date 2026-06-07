"use client";

/**
 * Escena 3D del laboratorio de Estados de la materia (React Three Fiber).
 * Se carga de forma diferida (ssr:false) desde LabEstadosMateria.tsx.
 *
 * Teoría cinética representada:
 *   · SÓLIDO  → partículas en red cristalina, vibrando en su sitio.
 *   · LÍQUIDO → partículas juntas pero móviles, ocupan el fondo del recipiente.
 *   · GAS     → partículas libres y veloces que llenan todo el recipiente.
 * La "agitación" (energía cinética media) crece con la temperatura: a mayor
 * temperatura, más vibran/se mueven las partículas y más cálida es la luz.
 */

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Edges } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";

export type Fase = "solido" | "liquido" | "gas";

export interface EstadosSceneProps {
  fase: Fase;
  agitacion: number; // 0..1 (energía cinética relativa dentro del rango)
  particleColor: string;
  accent: string; // color del área (hex) para luces
  autoRotate: boolean;
  resetNonce: number; // cambia para reordenar las partículas
  // Identidad física de la sustancia (hace visibles las diferencias):
  metal: boolean; // metales → brillo metálico y resplandor incandescente al calentar
  metalness: number; // 0 (molecular) … 1 (metal)
  roughness: number; // acabado de la superficie
  pScale: number; // tamaño relativo de partícula (mayor en sustancias densas)
  cohesion: number; // 0..1 — cohesión del líquido (mercurio se agrupa, gases no)
}

// Recipiente (semiejes en unidades de mundo)
const BOX = { hx: 1.45, hy: 1.5, hz: 0.95 };
const R = 0.12; // radio de partícula
const N = 64; // 4 × 4 × 4
const SPACING = 0.42;

// Límite vertical de los centros (para la superficie del líquido en reposo)
const BY = BOX.hy - R;
// Techo del líquido: ocupa el ~55% inferior del recipiente
const LIQ_CEIL = -BY + (2 * BY) * 0.55;

// PRNG determinista (sin Math.random): mismo índice → mismo valor en cada render.
// Mantiene la simulación reproducible y cumple la regla de pureza de React.
function rng(n: number): number {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/* ── Nube de partículas (instanced) ──────────────────────────────────── */
function Particulas({ fase, agitacion, particleColor, resetNonce, metal, metalness, roughness, pScale, cohesion }: {
  fase: Fase;
  agitacion: number;
  particleColor: string;
  resetNonce: number;
  metal: boolean;
  metalness: number;
  roughness: number;
  pScale: number;
  cohesion: number;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const dummy = useRef(new THREE.Object3D());

  // Buffers mutables de la simulación: viven en un ref (no en useMemo) porque se
  // mutan cada frame; así cumplimos la regla de inmutabilidad de React Compiler.
  const buf = useRef<{ home: Float32Array; pos: Float32Array; vel: Float32Array; seed: Float32Array } | null>(null);
  if (buf.current === null) {
    const home = new Float32Array(N * 3);
    const pos = new Float32Array(N * 3);
    const vel = new Float32Array(N * 3);
    const seed = new Float32Array(N * 3);
    let i = 0;
    for (let ix = 0; ix < 4; ix++) {
      for (let iy = 0; iy < 4; iy++) {
        for (let iz = 0; iz < 4; iz++) {
          const x = (ix - 1.5) * SPACING;
          const y = (iy - 1.5) * SPACING;
          const z = (iz - 1.5) * SPACING;
          home[i * 3] = x; home[i * 3 + 1] = y; home[i * 3 + 2] = z;
          pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
          // velocidad inicial pseudoaleatoria pero determinista (dirección unitaria)
          const a = rng(i + 1) * Math.PI * 2;
          const b = Math.acos(2 * rng(i + 101) - 1);
          vel[i * 3] = Math.sin(b) * Math.cos(a);
          vel[i * 3 + 1] = Math.cos(b);
          vel[i * 3 + 2] = Math.sin(b) * Math.sin(a);
          seed[i * 3] = rng(i + 201) * 10;
          seed[i * 3 + 1] = rng(i + 301) * 10;
          seed[i * 3 + 2] = rng(i + 401) * 10;
          i++;
        }
      }
    }
    buf.current = { home, pos, vel, seed };
  }

  // Reordenar al pulsar "reiniciar"
  useEffect(() => {
    const { home, pos } = buf.current!;
    for (let i = 0; i < N * 3; i++) pos[i] = home[i]!;
  }, [resetNonce]);

  useFrame((state, rawDelta) => {
    const m = mesh.current;
    if (!m) return;
    const { home, pos, vel, seed } = buf.current!;
    const d = dummy.current;
    const delta = Math.min(rawDelta, 0.05); // estabilidad si baja el frame-rate
    const t = state.clock.elapsedTime;
    const a = agitacion;

    // Radio efectivo según el tamaño de partícula de esta sustancia: las paredes
    // se ajustan para que las esferas grandes (metales densos) no traspasen.
    const er = R * pScale;
    const bx = BOX.hx - er, bz = BOX.hz - er, by = BOX.hy - er;
    const liqCeil = -by + 2 * by * 0.55;

    for (let i = 0; i < N; i++) {
      const i3 = i * 3;
      let x: number, y: number, z: number;

      if (fase === "solido") {
        // Vibración alrededor del sitio en la red; crece al acercarse a la fusión
        const amp = 0.02 + a * 0.15;
        x = home[i3]! + Math.sin(t * 8.0 + seed[i3]!) * amp;
        y = home[i3 + 1]! + Math.sin(t * 7.3 + seed[i3 + 1]!) * amp;
        z = home[i3 + 2]! + Math.sin(t * 8.6 + seed[i3 + 2]!) * amp;
        pos[i3] = x; pos[i3 + 1] = y; pos[i3 + 2] = z;
      } else {
        const speed = fase === "liquido" ? 0.7 + a * 0.8 : 1.7 + a * 2.0;
        let vx = vel[i3]!, vy = vel[i3 + 1]!, vz = vel[i3 + 2]!;
        x = pos[i3]! + vx * speed * delta;
        y = pos[i3 + 1]! + vy * speed * delta;
        z = pos[i3 + 2]! + vz * speed * delta;

        // Rebote contra las paredes
        const ceilY = fase === "liquido" ? liqCeil : by;
        if (x > bx) { x = bx; vx = -Math.abs(vx); }
        else if (x < -bx) { x = -bx; vx = Math.abs(vx); }
        if (z > bz) { z = bz; vz = -Math.abs(vz); }
        else if (z < -bz) { z = -bz; vz = Math.abs(vz); }
        if (y > ceilY) { y = ceilY; vy = -Math.abs(vy); }
        else if (y < -by) { y = -by; vy = Math.abs(vy); }

        // El líquido cae al fondo; cuanto mayor su cohesión, más se asienta
        // (mercurio se agrupa; etanol se reparte).
        if (fase === "liquido") vy -= delta * (0.45 + cohesion * 0.9);

        vel[i3] = vx; vel[i3 + 1] = vy; vel[i3 + 2] = vz;
        pos[i3] = x; pos[i3 + 1] = y; pos[i3 + 2] = z;
      }

      d.position.set(x, y, z);
      d.scale.setScalar(pScale);
      d.updateMatrix();
      m.setMatrixAt(i, d.matrix);
    }
    m.instanceMatrix.needsUpdate = true;

    // Brillo: las moléculas emiten luz propia; los metales casi no brillan en frío
    // pero se ponen incandescentes (al rojo/naranja) cuando están muy calientes.
    if (matRef.current) {
      matRef.current.emissiveIntensity = metal ? a * a * 1.1 : 0.22 + a * 0.7;
    }
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, N]} castShadow frustumCulled={false}>
      <sphereGeometry args={[R, 20, 20]} />
      <meshStandardMaterial
        ref={matRef}
        color={particleColor}
        emissive={metal ? "#ff5a1f" : particleColor}
        emissiveIntensity={0.3}
        roughness={roughness}
        metalness={metalness}
        envMapIntensity={metal ? 1.6 : 0.9}
      />
    </instancedMesh>
  );
}

/* ── Superficie translúcida del líquido ──────────────────────────────── */
function SuperficieLiquido({ color }: { color: string }) {
  return (
    <mesh position={[0, LIQ_CEIL + R, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[BOX.hx * 2 - 0.04, BOX.hz * 2 - 0.04]} />
      <meshStandardMaterial transparent color={color} opacity={0.22} emissive={color} emissiveIntensity={0.25} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

/* ── Recipiente de vidrio (paredes tenues + aristas) ─────────────────── */
function GlassPanel({ args, position }: { args: [number, number, number]; position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <boxGeometry args={args} />
      <meshPhysicalMaterial transparent opacity={0.08} roughness={0.05} metalness={0} clearcoat={1} clearcoatRoughness={0.04} color="#dff1ff" envMapIntensity={1.1} depthWrite={false} />
    </mesh>
  );
}

function Recipiente() {
  const w = BOX.hx * 2, h = BOX.hy * 2, d = BOX.hz * 2, t = 0.05;
  return (
    <group>
      <GlassPanel args={[w, t, d]} position={[0, -BOX.hy - t / 2, 0]} />
      <GlassPanel args={[w, h, t]} position={[0, 0, -BOX.hz]} />
      <GlassPanel args={[w, h, t]} position={[0, 0, BOX.hz]} />
      <GlassPanel args={[t, h, d]} position={[-BOX.hx, 0, 0]} />
      <GlassPanel args={[t, h, d]} position={[BOX.hx, 0, 0]} />
      {/* Aristas para leer el recipiente */}
      <mesh>
        <boxGeometry args={[w, h, d]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        <Edges threshold={15} color="#bfe8ff" />
      </mesh>
      {/* Borde superior resaltado */}
      <mesh position={[0, BOX.hy, 0]}>
        <boxGeometry args={[w + 0.04, 0.04, d + 0.04]} />
        <meshStandardMaterial color="#9fd8ff" emissive="#3aa0d8" emissiveIntensity={0.15} metalness={0.4} roughness={0.3} />
      </mesh>
    </group>
  );
}

/* ── Pedestal ────────────────────────────────────────────────────────── */
function Pedestal() {
  return (
    <mesh position={[0, -BOX.hy - 0.2, 0]} receiveShadow>
      <cylinderGeometry args={[1.9, 2.2, 0.28, 64]} />
      <meshStandardMaterial color="#22344b" metalness={0.45} roughness={0.55} />
    </mesh>
  );
}

/* ── Escena completa ─────────────────────────────────────────────────── */
export default function EstadosMateriaScene(props: EstadosSceneProps) {
  // Luz que pasa de fría (azul) a cálida (naranja) con la temperatura.
  const heat = useMemo(
    () => new THREE.Color("#2f7dff").lerp(new THREE.Color("#ff5a1f"), THREE.MathUtils.clamp(props.agitacion, 0, 1)),
    [props.agitacion]
  );

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [4, 2.6, 5], fov: 42 }}
    >
      <color attach="background" args={["#03101f"]} />
      <fog attach="fog" args={["#03101f", 13, 24]} />

      <ambientLight intensity={0.5} />
      <directionalLight
        position={[4, 8, 4]}
        intensity={2.4}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={24}
        shadow-bias={-0.0004}
      />
      <pointLight position={[-4, 3, -3]} intensity={20} color={`#${heat.getHexString()}`} />
      <pointLight position={[3, 1, 4]} intensity={10} color="#ffffff" />

      <group position={[0, -0.4, 0]}>
        <Pedestal />
        <Recipiente />
        {props.fase === "liquido" && <SuperficieLiquido color={props.particleColor} />}
        <Particulas
          fase={props.fase}
          agitacion={props.agitacion}
          particleColor={props.particleColor}
          resetNonce={props.resetNonce}
          metal={props.metal}
          metalness={props.metalness}
          roughness={props.roughness}
          pScale={props.pScale}
          cohesion={props.cohesion}
        />
        <ContactShadows position={[0, -BOX.hy - 0.06, 0]} opacity={0.4} scale={8} blur={2.8} far={4.5} color="#2a3f57" />
      </group>

      {/* Reflejos de estudio sin assets externos */}
      <Environment resolution={256}>
        <Lightformer intensity={2.2} position={[0, 5, 2]} scale={[9, 4, 1]} color="#ffffff" />
        <Lightformer intensity={1.5} position={[-5, 2, -2]} scale={[5, 5, 1]} color={props.accent} />
        <Lightformer intensity={1.1} position={[5, 1, 3]} scale={[4, 4, 1]} color="#bfe8ff" />
      </Environment>

      <OrbitControls
        enablePan={false}
        minDistance={3.5}
        maxDistance={10}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 0, 0]}
        autoRotate={props.autoRotate}
        autoRotateSpeed={0.45}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.34} luminanceThreshold={0.82} luminanceSmoothing={0.28} mipmapBlur radius={0.6} />
        <Vignette eskil={false} offset={0.28} darkness={0.42} />
      </EffectComposer>
    </Canvas>
  );
}
