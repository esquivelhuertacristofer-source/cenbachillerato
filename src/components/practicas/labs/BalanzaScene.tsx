"use client";

/**
 * Escena 3D del laboratorio de Ecuación lineal de una variable — la balanza (R3F).
 * Se carga de forma diferida (ssr:false) desde LabBalanza.tsx.
 *
 * Una ecuación a·x + b = c es una BALANZA en equilibrio: los dos platos pesan lo
 * mismo. El brazo se INCLINA cuando se rompe la igualdad (operar en un solo lado)
 * y permanece NIVELADO cuando se aplica la misma operación en ambos lados
 * (propiedad de uniformidad). El plato izquierdo lleva las cajas-x (incógnita) y
 * las unidades sueltas; el derecho, las unidades del otro lado.
 *
 * Animación compiler-safe: la inclinación del brazo se suaviza con useFrame
 * mutando REFS (nunca setState, nunca Math.random en el render). La disposición
 * de los bloques se calcula con useMemo a partir de las props.
 */

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Html, RoundedBox } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import type { Group } from "three";

export interface BalanzaSceneProps {
  /** Valor real de x (lo conoce la simulación para inclinar el brazo; el alumno lo descubre). */
  xTrue: number;
  aCount: number; // cajas-x en el plato izquierdo
  leftUnits: number; // unidades sueltas a la izquierda
  rightUnits: number; // unidades a la derecha
  leftLabel: string; // texto del lado izquierdo (p. ej. "x + 3")
  rightLabel: string; // texto del lado derecho (p. ej. "8")
  resuelto: boolean; // x ya está despejada (aCount===1 && leftUnits===0)
  accent: string; // color del área (cajas-x)
  autoRotate: boolean;
  resetNonce: number;
}

const L = 2.35; // semilongitud del brazo
const BEAM_Y = 3.0; // altura del eje del brazo
const ROD = 1.25; // largo de la cuerda que sostiene el plato
const PAN_R = 1.02; // radio del plato
const UNIT = 0.26; // arista del cubo unidad
const XW = 0.5; // ancho de la caja-x
const XH = 0.72; // alto de la caja-x
const MAX_ANG = 0.34; // inclinación máxima (rad)
const UNIT_COL = "#9bb4cf"; // unidades sueltas (gris azulado)
const PAN_COL = "#c8d6e6";

type XY = [number, number];

/** Posiciones (x,z) en rejilla centrada para n elementos. */
function rejilla(n: number, cols: number, paso: number): XY[] {
  const out: XY[] = [];
  const filas = Math.max(1, Math.ceil(n / cols));
  for (let k = 0; k < n; k++) {
    const r = Math.floor(k / cols);
    const c = k % cols;
    const enFila = r === filas - 1 ? n - r * cols : cols;
    const x = (c - (enFila - 1) / 2) * paso;
    const z = (r - (filas - 1) / 2) * paso;
    out.push([x, z]);
  }
  return out;
}

/** Plato con su cuerda; se mantiene nivelado contra la inclinación del brazo. */
function Plato({
  side,
  beam,
  children,
  label,
  labelCol,
}: {
  side: number; // -1 izquierda, +1 derecha
  beam: React.RefObject<Group | null>;
  children: React.ReactNode;
  label: string;
  labelCol: string;
}) {
  const ref = useRef<Group>(null);
  // Contrarresta la rotación del brazo para que la cuerda quede vertical y el
  // plato nivelado (como una balanza real con pivotes).
  useFrame(() => {
    if (ref.current && beam.current) ref.current.rotation.z = -beam.current.rotation.z;
  });
  return (
    <group position={[side * L, 0, 0]} ref={ref}>
      {/* enganche en el brazo */}
      <mesh position={[0, -0.05, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#d7e2ee" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* cuerda */}
      <mesh position={[0, -ROD / 2, 0]}>
        <cylinderGeometry args={[0.022, 0.022, ROD, 10]} />
        <meshStandardMaterial color="#7d8ea0" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* plato */}
      <group position={[0, -ROD, 0]}>
        <mesh receiveShadow castShadow>
          <cylinderGeometry args={[PAN_R, PAN_R * 0.86, 0.12, 48]} />
          <meshStandardMaterial color={PAN_COL} metalness={0.45} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.075, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[PAN_R * 0.9, PAN_R, 48]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.18} />
        </mesh>
        {/* etiqueta del lado */}
        <Html center position={[0, -0.5, 0]} distanceFactor={9} pointerEvents="none">
          <div
            style={{
              fontWeight: 900,
              fontSize: 30,
              color: labelCol,
              fontVariantNumeric: "tabular-nums",
              textShadow: "0 2px 12px rgba(0,0,0,0.8)",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </div>
        </Html>
        {children}
      </group>
    </group>
  );
}

/** Caja-x: la incógnita. Flota suavemente para destacar que es el misterio. */
function CajaX({ pos, accent, phase }: { pos: XY; accent: string; phase: number }) {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.position.y = XH / 2 + 0.06 + Math.sin(t * 1.6 + phase) * 0.05;
  });
  return (
    <group ref={ref} position={[pos[0], XH / 2 + 0.06, pos[1]]}>
      <RoundedBox args={[XW, XH, XW]} radius={0.07} smoothness={4} castShadow>
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.5} metalness={0.3} roughness={0.35} />
      </RoundedBox>
      <Html center position={[0, 0, XW / 2 + 0.01]} distanceFactor={8} pointerEvents="none">
        <div style={{ fontWeight: 900, fontSize: 30, color: "#fff", textShadow: "0 1px 6px rgba(0,0,0,0.7)" }}>x</div>
      </Html>
    </group>
  );
}

/** Cubo-unidad (peso suelto de valor 1). */
function Unidad({ pos }: { pos: XY }) {
  return (
    <mesh position={[pos[0], UNIT / 2 + 0.06, pos[1]]} castShadow>
      <boxGeometry args={[UNIT, UNIT, UNIT]} />
      <meshStandardMaterial color={UNIT_COL} metalness={0.2} roughness={0.55} />
    </mesh>
  );
}

function Brazo(props: BalanzaSceneProps) {
  const { xTrue, aCount, leftUnits, rightUnits, accent } = props;
  const beam = useRef<Group>(null);

  // Inclinación objetivo: peso izquierdo − peso derecho (x vale xTrue de verdad).
  // Izquierda más pesada ⇒ baja la izquierda (−x) ⇒ rotación +z.
  const imbalance = aCount * xTrue + leftUnits - rightUnits;

  useFrame(() => {
    if (!beam.current) return;
    const k = 0.09;
    const target = Math.max(-MAX_ANG, Math.min(MAX_ANG, imbalance * k));
    beam.current.rotation.z += (target - beam.current.rotation.z) * 0.1;
  });

  // Disposición de los bloques en cada plato (cajas-x atrás, unidades adelante).
  const izqX = useMemo(() => rejilla(aCount, 3, 0.62).map(([x, z]) => [x, z - 0.32] as XY), [aCount]);
  const izqU = useMemo(() => rejilla(leftUnits, 4, 0.34).map(([x, z]) => [x, z + 0.42] as XY), [leftUnits]);
  const derU = useMemo(() => rejilla(rightUnits, 4, 0.34), [rightUnits]);

  return (
    <group ref={beam} position={[0, BEAM_Y, 0]}>
      {/* brazo */}
      <mesh castShadow>
        <boxGeometry args={[2 * L + 0.2, 0.14, 0.22]} />
        <meshStandardMaterial color="#d7e2ee" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* tope central */}
      <mesh position={[0, 0.16, 0]}>
        <coneGeometry args={[0.14, 0.26, 4]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.4} metalness={0.4} roughness={0.35} />
      </mesh>

      <Plato side={-1} beam={beam} label={props.leftLabel} labelCol={accent}>
        {izqX.map((p, i) => (
          <CajaX key={`x${i}`} pos={p} accent={accent} phase={i * 1.7} />
        ))}
        {izqU.map((p, i) => (
          <Unidad key={`lu${i}`} pos={p} />
        ))}
      </Plato>

      <Plato side={1} beam={beam} label={props.rightLabel} labelCol={props.resuelto ? "#FFD166" : PAN_COL}>
        {derU.map((p, i) => (
          <Unidad key={`ru${i}`} pos={p} />
        ))}
      </Plato>
    </group>
  );
}

export default function BalanzaScene(props: BalanzaSceneProps) {
  const { accent } = props;
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [0, 2.6, 9.2], fov: 42 }}
    >
      <color attach="background" args={["#03101f"]} />
      <fog attach="fog" args={["#03101f", 16, 40]} />

      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 10, 6]}
        intensity={1.7}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={36}
        shadow-bias={-0.0004}
      />
      <pointLight position={[-7, 4, 5]} intensity={8} color={accent} />
      <pointLight position={[6, 3, -4]} intensity={5} color="#bfe8ff" />

      <group key={`${props.resetNonce}`}>
        {/* base */}
        <mesh position={[0, 0.1, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[1.5, 1.8, 0.2, 48]} />
          <meshStandardMaterial color="#0a1d33" metalness={0.3} roughness={0.6} />
        </mesh>
        {/* columna */}
        <mesh position={[0, BEAM_Y / 2 + 0.1, 0]} castShadow>
          <cylinderGeometry args={[0.13, 0.18, BEAM_Y, 24]} />
          <meshStandardMaterial color="#c8d6e6" metalness={0.55} roughness={0.35} />
        </mesh>
        {/* fulcro (pivote) */}
        <mesh position={[0, BEAM_Y, 0]}>
          <coneGeometry args={[0.2, 0.3, 4]} />
          <meshStandardMaterial color="#d7e2ee" metalness={0.6} roughness={0.3} />
        </mesh>

        <Brazo {...props} />

        <ContactShadows position={[0, 0, 0]} opacity={0.32} scale={14} blur={2.6} far={6} color="#020c1c" />
      </group>

      <Environment resolution={256}>
        <Lightformer intensity={2.0} position={[0, 6, 2]} scale={[10, 4, 1]} color="#ffffff" />
        <Lightformer intensity={1.4} position={[-6, 3, -2]} scale={[6, 6, 1]} color={accent} />
        <Lightformer intensity={1.1} position={[6, 2, 3]} scale={[5, 5, 1]} color="#bfe8ff" />
      </Environment>

      <OrbitControls
        enablePan={false}
        minDistance={6.5}
        maxDistance={16}
        minPolarAngle={Math.PI / 7}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 2, 0]}
        autoRotate={props.autoRotate}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.5} luminanceThreshold={0.62} luminanceSmoothing={0.3} mipmapBlur radius={0.66} />
        <Vignette eskil={false} offset={0.28} darkness={0.42} />
      </EffectComposer>
    </Canvas>
  );
}
