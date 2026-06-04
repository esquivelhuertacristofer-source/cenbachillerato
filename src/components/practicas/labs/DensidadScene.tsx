"use client";

/**
 * Escena 3D del laboratorio de Densidad y Flotación (React Three Fiber).
 * Se carga de forma diferida (ssr:false) desde LabDensidad.tsx.
 *
 * Física representada:
 *   · Fracción sumergida  f = ρo / ρl   (principio de Arquímedes)
 *       f < 1 → flota   ·   f ≈ 1 → suspendido   ·   f ≥ 1 → se hunde
 *   · El NIVEL del líquido sube por el volumen desplazado por el objeto.
 *   · Vectores de fuerza: Peso (P, hacia abajo) y Empuje (E, hacia arriba).
 */

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  ContactShadows,
  Environment,
  Lightformer,
  Html,
  Sparkles,
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";

export interface DensidadSceneProps {
  liquidDensity: number;
  liquidColor: string;
  objDensity: number;
  objColor: string;
  objMetalness: number;
  objRoughness: number;
  shape: "cube" | "sphere";
  volume: number; // cm³
  accent: string; // color del área (hex) para luces
  showForces: boolean;
  autoRotate: boolean;
  dropNonce: number; // cambia para volver a soltar el objeto
  weightN: number; // peso en newtons
  buoyancyN: number; // empuje en newtons
}

// Geometría del tanque (unidades de mundo)
const TANK = { w: 3, d: 2, h: 2.8, t: 0.06 };
const LIQ = { bottom: 0, baseTop: 1.7 }; // nivel base del líquido en reposo
const INNER_AREA = (TANK.w - 0.16) * (TANK.d - 0.16);

/** Convierte un volumen (cm³) en un tamaño visual razonable.
 *  Escala con la raíz cúbica (físicamente correcto: V ∝ lado³) pero con un
 *  rango amplio para que el cambio sea claramente perceptible en todo el slider
 *  (10 cm³ se ve pequeño, 500 cm³ se ve grande). */
function sizeFromVolume(v: number) {
  const side = Math.cbrt(Math.max(v, 1)) * 0.12;
  return THREE.MathUtils.clamp(side, 0.28, 1.25);
}

/** Calcula geometría de equilibrio: tamaño, fracción y niveles. */
function useFloatModel(
  objDensity: number,
  liquidDensity: number,
  shape: "cube" | "sphere",
  volume: number
) {
  return useMemo(() => {
    const size = sizeFromVolume(volume);
    const ratio = objDensity / liquidDensity;
    const neutral = Math.abs(ratio - 1) < 0.02;
    const submergedFrac = neutral ? 1 : ratio < 1 ? THREE.MathUtils.clamp(ratio, 0, 1) : 1;

    // Volumen del mesh en unidades de mundo (para desplazamiento realista)
    const meshVol =
      shape === "cube" ? size ** 3 : (4 / 3) * Math.PI * (size / 2) ** 3;
    const displaced = meshVol * submergedFrac;
    const rise = THREE.MathUtils.clamp(displaced / INNER_AREA, 0, 0.7);
    const liquidTop = LIQ.baseTop + rise;

    let target: number;
    if (neutral) target = (liquidTop + LIQ.bottom) / 2;
    else if (ratio < 1) target = liquidTop - submergedFrac * size + size / 2;
    else target = LIQ.bottom + size / 2;

    return { size, ratio, neutral, submergedFrac, liquidTop, target, floating: ratio < 1 && !neutral };
  }, [objDensity, liquidDensity, shape, volume]);
}

/* ── Flecha de fuerza (cilindro + cono + etiqueta) ───────────────────── */
function ForceArrow({
  length,
  dir,
  color,
  label,
  xOffset,
}: {
  length: number;
  dir: 1 | -1; // 1 arriba, -1 abajo
  color: string;
  label: string;
  xOffset: number;
}) {
  const head = 0.16;
  const shaft = Math.max(length - head, 0.04);
  return (
    <group position={[xOffset, 0, 0]} rotation={[0, 0, dir === 1 ? 0 : Math.PI]}>
      <mesh position={[0, shaft / 2, 0]}>
        <cylinderGeometry args={[0.028, 0.028, shaft, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} toneMapped={false} />
      </mesh>
      <mesh position={[0, shaft + head / 2, 0]}>
        <coneGeometry args={[0.075, head, 20]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} toneMapped={false} />
      </mesh>
      <Html position={[0, dir === 1 ? shaft + head + 0.18 : -(shaft + head + 0.18), 0]} center distanceFactor={6} zIndexRange={[10, 0]}>
        <div
          style={{
            transform: dir === 1 ? "none" : "rotate(180deg)",
            whiteSpace: "nowrap",
            fontWeight: 800,
            fontSize: 11,
            color: "#fff",
            background: `${color}cc`,
            padding: "2px 7px",
            borderRadius: 7,
            border: "1px solid rgba(255,255,255,0.35)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
          }}
        >
          {label}
        </div>
      </Html>
    </group>
  );
}

/* ── Objeto que flota / se hunde + fuerzas + salpicadura ─────────────── */
function FloatingObject({
  model,
  objColor,
  objMetalness,
  objRoughness,
  shape,
  showForces,
  weightN,
  buoyancyN,
  dropNonce,
}: {
  model: ReturnType<typeof useFloatModel>;
  objColor: string;
  objMetalness: number;
  objRoughness: number;
  shape: "cube" | "sphere";
  showForces: boolean;
  weightN: number;
  buoyancyN: number;
  dropNonce: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const rippleRef = useRef<THREE.Mesh>(null);
  const splashT = useRef(-99);
  const prevY = useRef(99);
  const { size, target, floating, neutral, liquidTop } = model;

  // Reiniciar caída cuando cambia dropNonce
  useEffect(() => {
    if (ref.current) ref.current.position.y = liquidTop + 1.6;
    prevY.current = 99;
    splashT.current = -99;
  }, [dropNonce, liquidTop]);

  // Longitudes de los vectores (la mayor ≈ 1.25 u de mundo)
  const maxN = Math.max(weightN, buoyancyN, 0.0001);
  const lenW = THREE.MathUtils.clamp((weightN / maxN) * 1.25, 0.18, 1.25);
  const lenB = THREE.MathUtils.clamp((buoyancyN / maxN) * 1.25, 0.18, 1.25);

  useFrame((state, delta) => {
    const g = ref.current;
    if (!g) return;
    const bob = floating ? Math.sin(state.clock.elapsedTime * 1.4) * 0.03 : 0;
    // Velocidad de caída/ascenso según la fuerza neta: lo más denso se hunde
    // más rápido (plomo > aluminio); lo que flota sube con suavidad.
    const net = weightN - buoyancyN;
    const sinking = !floating && !neutral;
    const lambda = sinking ? THREE.MathUtils.clamp(2 + Math.abs(net) * 0.5, 2.5, 9) : 3.2;
    g.position.y = THREE.MathUtils.damp(g.position.y, target + bob, lambda, delta);

    if (objMetalness > 0.5) g.rotation.y += delta * 0.18;
    else g.rotation.y = THREE.MathUtils.damp(g.rotation.y, 0.5, 2, delta);

    // Detectar entrada al líquido para la salpicadura
    if (prevY.current > liquidTop && g.position.y <= liquidTop) {
      splashT.current = state.clock.elapsedTime;
    }
    prevY.current = g.position.y;

    // Animar el anillo de salpicadura
    const ring = rippleRef.current;
    if (ring) {
      const age = state.clock.elapsedTime - splashT.current;
      const mat = ring.material as THREE.Material & { opacity: number };
      if (age >= 0 && age < 1.1) {
        const k = age / 1.1;
        const sc = 0.3 + k * 2.1;
        ring.scale.set(sc, sc, sc);
        ring.position.y = liquidTop + 0.01;
        mat.opacity = (1 - k) * 0.5;
        ring.visible = true;
      } else {
        ring.visible = false;
      }
    }
  });

  return (
    <>
      <group ref={ref} position={[0, liquidTop + 1.6, 0]}>
        <mesh castShadow receiveShadow rotation={[0.2, 0.5, 0]}>
          {shape === "cube" ? (
            <boxGeometry args={[size, size, size]} />
          ) : (
            <sphereGeometry args={[size / 2, 64, 64]} />
          )}
          <meshPhysicalMaterial
            color={objColor}
            metalness={objMetalness}
            roughness={objRoughness}
            clearcoat={objMetalness > 0.5 ? 0.7 : 0.18}
            clearcoatRoughness={0.25}
            envMapIntensity={1.25}
            reflectivity={0.6}
          />
        </mesh>

        {showForces && (
          <>
            <ForceArrow length={lenW} dir={-1} color="#F87171" label={`P = ${weightN.toFixed(2)} N`} xOffset={0.28} />
            <ForceArrow length={lenB} dir={1} color="#38BDF8" label={`E = ${buoyancyN.toFixed(2)} N`} xOffset={-0.28} />
          </>
        )}
      </group>

      {/* Anillo de salpicadura en la superficie */}
      <mesh ref={rippleRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, liquidTop + 0.01, 0]} visible={false}>
        <ringGeometry args={[0.32, 0.42, 48]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
    </>
  );
}

/* ── Vidrio del tanque (4 paredes + base) ────────────────────────────── */
function GlassPanel(props: {
  args: [number, number, number];
  position: [number, number, number];
}) {
  return (
    <mesh position={props.position}>
      <boxGeometry args={props.args} />
      <meshPhysicalMaterial
        transparent
        transmission={1}
        thickness={0.4}
        roughness={0.03}
        ior={1.5}
        clearcoat={1}
        clearcoatRoughness={0.04}
        color="#eaf6ff"
        opacity={1}
        envMapIntensity={1.3}
        specularIntensity={1}
      />
    </mesh>
  );
}

function Tank() {
  const { w, d, h, t } = TANK;
  return (
    <group>
      <GlassPanel args={[w, t, d]} position={[0, -t / 2, 0]} />
      <GlassPanel args={[w, h, t]} position={[0, h / 2, -d / 2]} />
      <GlassPanel args={[w, h, t]} position={[0, h / 2, d / 2]} />
      <GlassPanel args={[t, h, d]} position={[-w / 2, h / 2, 0]} />
      <GlassPanel args={[t, h, d]} position={[w / 2, h / 2, 0]} />
      {/* Borde superior resaltado */}
      <mesh position={[0, h, 0]}>
        <boxGeometry args={[w + 0.04, 0.04, d + 0.04]} />
        <meshStandardMaterial color="#9fd8ff" emissive="#3aa0d8" emissiveIntensity={0.25} metalness={0.4} roughness={0.3} />
      </mesh>
    </group>
  );
}

/* ── Líquido con oleaje en la superficie ─────────────────────────────── */
function Liquid({ color, liquidTop }: { color: string; liquidTop: number }) {
  const w = TANK.w - 0.16;
  const d = TANK.d - 0.16;
  const surfaceRef = useRef<THREE.Mesh>(null);
  const geoRef = useRef<THREE.PlaneGeometry>(null);
  const base = useRef<Float32Array | null>(null);

  useFrame((state) => {
    const geo = geoRef.current;
    if (!geo) return;
    const pos = geo.attributes.position as THREE.BufferAttribute;
    if (!base.current) base.current = Float32Array.from(pos.array as Float32Array);
    const t = state.clock.elapsedTime;
    const b = base.current;
    for (let i = 0; i < pos.count; i++) {
      const x = b[i * 3] as number;
      const y = b[i * 3 + 1] as number;
      const wave =
        Math.sin(x * 3.1 + t * 1.6) * 0.022 +
        Math.sin(y * 2.4 + t * 1.15) * 0.018 +
        Math.sin((x + y) * 1.7 - t) * 0.012;
      pos.setZ(i, wave);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  });

  const height = liquidTop - LIQ.bottom;

  return (
    <group>
      {/* volumen del líquido */}
      <mesh position={[0, LIQ.bottom + height / 2, 0]}>
        <boxGeometry args={[w, height, d]} />
        <meshPhysicalMaterial
          transparent
          transmission={0.92}
          thickness={1.6}
          roughness={0.14}
          ior={1.33}
          color={color}
          opacity={0.9}
          envMapIntensity={0.7}
          attenuationColor={color}
          attenuationDistance={1.4}
        />
      </mesh>
      {/* superficie con oleaje */}
      <mesh ref={surfaceRef} position={[0, liquidTop, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry ref={geoRef} args={[w, d, 48, 36]} />
        <meshPhysicalMaterial
          transparent
          color={color}
          transmission={0.55}
          roughness={0.06}
          ior={1.33}
          opacity={0.6}
          metalness={0.1}
          side={THREE.DoubleSide}
          envMapIntensity={1.6}
        />
      </mesh>
    </group>
  );
}

/* ── Burbujas ambientales ────────────────────────────────────────────── */
function Bubbles({ liquidTop }: { liquidTop: number }) {
  const group = useRef<THREE.Group>(null);
  const data = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        x: (Math.cos(i * 2.3) * (TANK.w - 0.7)) / 2,
        z: (Math.sin(i * 1.7) * (TANK.d - 0.6)) / 2,
        speed: 0.25 + (i % 5) * 0.07,
        offset: (i / 16) * (liquidTop - LIQ.bottom),
        r: 0.016 + (i % 4) * 0.008,
      })),
    [liquidTop]
  );

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const span = liquidTop - LIQ.bottom - 0.1;
    g.children.forEach((child, i) => {
      const bb = data[i];
      if (!bb) return;
      const y = ((state.clock.elapsedTime * bb.speed + bb.offset) % span) + LIQ.bottom + 0.05;
      child.position.set(bb.x + Math.sin(y * 4 + i) * 0.04, y, bb.z);
    });
  });

  return (
    <group ref={group}>
      {data.map((b, i) => (
        <mesh key={i}>
          <sphereGeometry args={[b.r, 12, 12]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.35}
            roughness={0.2}
            emissive="#bfe8ff"
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ── Pedestal bajo el tanque ─────────────────────────────────────────── */
function Pedestal() {
  return (
    <mesh position={[0, -0.18, 0]} receiveShadow>
      <cylinderGeometry args={[2.2, 2.5, 0.28, 64]} />
      <meshStandardMaterial color="#cdd9e6" metalness={0.2} roughness={0.7} />
    </mesh>
  );
}

/* ── Escena completa ─────────────────────────────────────────────────── */
export default function DensidadScene(props: DensidadSceneProps) {
  const model = useFloatModel(props.objDensity, props.liquidDensity, props.shape, props.volume);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [4, 3, 5], fov: 42 }}
    >
      <color attach="background" args={["#eef4fb"]} />
      <fog attach="fog" args={["#eef4fb", 12, 22]} />

      <ambientLight intensity={0.75} />
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
      <pointLight position={[-4, 3, -3]} intensity={16} color={props.accent} />
      <pointLight position={[3, 1, 4]} intensity={10} color="#ffffff" />

      <group position={[0, -1.2, 0]}>
        <Pedestal />
        <Tank />
        <Liquid color={props.liquidColor} liquidTop={model.liquidTop} />
        <Bubbles liquidTop={model.liquidTop} />
        <Sparkles count={26} scale={[TANK.w - 0.5, model.liquidTop, TANK.d - 0.5]} position={[0, model.liquidTop / 2, 0]} size={2} speed={0.25} opacity={0.35} color={props.accent} />
        <FloatingObject
          model={model}
          objColor={props.objColor}
          objMetalness={props.objMetalness}
          objRoughness={props.objRoughness}
          shape={props.shape}
          showForces={props.showForces}
          weightN={props.weightN}
          buoyancyN={props.buoyancyN}
          dropNonce={props.dropNonce}
        />
        <ContactShadows position={[0, -0.04, 0]} opacity={0.4} scale={9} blur={2.8} far={4.5} color="#2a3f57" />
      </group>

      {/* Reflejos de estudio sin assets externos */}
      <Environment resolution={256}>
        <Lightformer intensity={2.4} position={[0, 5, 2]} scale={[9, 4, 1]} color="#ffffff" />
        <Lightformer intensity={1.5} position={[-5, 2, -2]} scale={[5, 5, 1]} color={props.accent} />
        <Lightformer intensity={1.1} position={[5, 1, 3]} scale={[4, 4, 1]} color="#bfe8ff" />
      </Environment>

      <OrbitControls
        enablePan={false}
        minDistance={4}
        maxDistance={10}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 0.2, 0]}
        autoRotate={props.autoRotate}
        autoRotateSpeed={0.45}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.32} luminanceThreshold={0.9} luminanceSmoothing={0.25} mipmapBlur radius={0.6} />
        <Vignette eskil={false} offset={0.3} darkness={0.32} />
      </EffectComposer>
    </Canvas>
  );
}
