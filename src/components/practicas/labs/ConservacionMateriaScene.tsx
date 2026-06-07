"use client";

/**
 * Escena 3D del laboratorio de Conservación de la materia (React Three Fiber).
 * Se carga de forma diferida (ssr:false) desde LabConservacionMateria.tsx.
 *
 * Los MISMOS átomos viajan de los reactivos (izquierda) a los productos
 * (derecha) según el avance de la reacción `progreso` (0 → 1):
 *   · progreso 0   → moléculas de reactivos intactas (enlaces visibles).
 *   · progreso 0.5 → los átomos se separan y se mezclan en el centro.
 *   · progreso 1   → moléculas de productos formadas (enlaces nuevos).
 * Ningún átomo aparece ni desaparece: la materia se conserva.
 */

import * as THREE from "three";
import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { ELEMS_R, type MovAtom, type MovBond, type Elem } from "./reacciones-data";

export interface ConservacionSceneProps {
  reaccionKey: string;
  atoms: MovAtom[];
  reactBonds: MovBond[];
  prodBonds: MovBond[];
  progreso: number; // 0..1
  accent: string;
  autoRotate: boolean;
  resetNonce: number;
}

const BOND_COLOR = "#C4CDD8";

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/** Posición de un átomo a lo largo de la reacción (curva de Bézier cuadrática). */
function atomPos(a: MovAtom, idx: number, t: number): [number, number, number] {
  const sx = a.start[0], sy = a.start[1], sz = a.start[2];
  const ex = a.end[0], ey = a.end[1], ez = a.end[2];
  // punto de control: centro de la escena, abierto en abanico para que se "mezclen"
  const dir = idx % 2 === 0 ? 1 : -1;
  const cx = 0;
  const cy = (sy + ey) / 2 + dir * (1.4 + (idx % 3) * 0.5);
  const cz = ((idx % 5) - 2) * 0.9;
  const u = 1 - t;
  return [
    u * u * sx + 2 * u * t * cx + t * t * ex,
    u * u * sy + 2 * u * t * cy + t * t * ey,
    u * u * sz + 2 * u * t * cz + t * t * ez,
  ];
}

/* ── Átomo: esfera con color tipo CPK ─────────────────────────────────── */
function AtomoMesh({ el, pos }: { el: Elem; pos: [number, number, number] }) {
  const e = ELEMS_R[el];
  return (
    <mesh position={pos} castShadow receiveShadow>
      <sphereGeometry args={[e.radio, 28, 28]} />
      <meshStandardMaterial color={e.color} emissive={e.color} emissiveIntensity={0.12} roughness={0.32} metalness={0.12} />
    </mesh>
  );
}

/* ── Enlace: barra(s) entre dos átomos (orden = nº de barras) ──────────── */
function Bond({ start, end, orden, opacity }: { start: [number, number, number]; end: [number, number, number]; orden: 1 | 2 | 3; opacity: number }) {
  const { mid, quat, len, perp, offsets } = useMemo(() => {
    const s = new THREE.Vector3(start[0], start[1], start[2]);
    const e = new THREE.Vector3(end[0], end[1], end[2]);
    const dir = new THREE.Vector3().subVectors(e, s);
    const len = dir.length();
    const mid = new THREE.Vector3().addVectors(s, e).multiplyScalar(0.5);
    const ndir = dir.clone().normalize();
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), ndir);
    let up = new THREE.Vector3(0, 1, 0);
    if (Math.abs(ndir.dot(up)) > 0.9) up = new THREE.Vector3(1, 0, 0);
    const perp = new THREE.Vector3().crossVectors(ndir, up).normalize();
    const g = 0.13;
    const offsets = orden === 1 ? [0] : orden === 2 ? [-g, g] : [-g, 0, g];
    return { mid, quat, len, perp, offsets };
  }, [start, end, orden]);

  const radio = orden === 1 ? 0.07 : 0.05;

  return (
    <>
      {offsets.map((o, i) => (
        <mesh key={i} position={mid.clone().add(perp.clone().multiplyScalar(o))} quaternion={quat}>
          <cylinderGeometry args={[radio, radio, len, 14]} />
          <meshStandardMaterial color={BOND_COLOR} roughness={0.35} metalness={0.5} transparent opacity={opacity} depthWrite={opacity > 0.6} />
        </mesh>
      ))}
    </>
  );
}

/* ── Conjunto reaccionando ────────────────────────────────────────────── */
function Reaccion({ atoms, reactBonds, prodBonds, progreso }: { atoms: MovAtom[]; reactBonds: MovBond[]; prodBonds: MovBond[]; progreso: number }) {
  const t = clamp01(progreso);
  const positions = atoms.map((a, i) => atomPos(a, i, t));

  // los enlaces de reactivos se deshacen; los de productos se forman
  const opReact = clamp01(1 - t / 0.42);
  const opProd = clamp01((t - 0.58) / 0.42);

  return (
    <>
      {atoms.map((a, i) => (
        <AtomoMesh key={i} el={a.el} pos={positions[i]!} />
      ))}
      {opReact > 0.02 &&
        reactBonds.map((b, i) => (
          <Bond key={`r${i}`} start={positions[b.i]!} end={positions[b.j]!} orden={b.orden} opacity={opReact} />
        ))}
      {opProd > 0.02 &&
        prodBonds.map((b, i) => (
          <Bond key={`p${i}`} start={positions[b.i]!} end={positions[b.j]!} orden={b.orden} opacity={opProd} />
        ))}
    </>
  );
}

/* ── Escena completa ─────────────────────────────────────────────────── */
export default function ConservacionMateriaScene(props: ConservacionSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [0, 1, 11.5], fov: 45 }}
    >
      <color attach="background" args={["#03101f"]} />
      <fog attach="fog" args={["#03101f", 18, 40]} />

      <ambientLight intensity={0.55} />
      <directionalLight
        position={[5, 9, 5]}
        intensity={2.1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-bias={-0.0004}
      />
      <pointLight position={[-5, 3, -3]} intensity={18} color={props.accent} />
      <pointLight position={[4, 1, 5]} intensity={10} color="#ffffff" />

      <group position={[0, 0.3, 0]} key={`${props.reaccionKey}-${props.resetNonce}`}>
        <Reaccion atoms={props.atoms} reactBonds={props.reactBonds} prodBonds={props.prodBonds} progreso={props.progreso} />
        <ContactShadows position={[0, -4.4, 0]} opacity={0.3} scale={16} blur={3} far={6} color="#2a3f57" />
      </group>

      <Environment resolution={256}>
        <Lightformer intensity={2.0} position={[0, 5, 2]} scale={[10, 4, 1]} color="#ffffff" />
        <Lightformer intensity={1.4} position={[-6, 2, -2]} scale={[6, 6, 1]} color={props.accent} />
        <Lightformer intensity={1.1} position={[6, 1, 3]} scale={[5, 5, 1]} color="#bfe8ff" />
      </Environment>

      <OrbitControls
        enablePan={false}
        minDistance={7}
        maxDistance={20}
        minPolarAngle={Math.PI / 7}
        maxPolarAngle={Math.PI / 1.9}
        target={[0, 0, 0]}
        autoRotate={props.autoRotate}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.4} luminanceThreshold={0.7} luminanceSmoothing={0.3} mipmapBlur radius={0.65} />
        <Vignette eskil={false} offset={0.28} darkness={0.42} />
      </EffectComposer>
    </Canvas>
  );
}
