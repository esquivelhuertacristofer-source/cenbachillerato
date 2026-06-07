"use client";

/**
 * Escena 3D — "Clasificador de tipos de reacciones químicas" (CNEYT-IV-P02).
 *
 * Un modelo ball-and-stick (esferas CPK + barras) donde los MISMOS átomos viajan
 * de su posición en los reactivos a su posición en los productos según un
 * `progreso` 0→1 que controla el shell (reproducir / arrastrar). Los enlaces de
 * los reactivos (`rbonds`) se desvanecen y los de los productos (`pbonds`)
 * aparecen en una ventana central (crossfade): se ve cómo se rompen unos enlaces
 * y se forman otros, mientras ningún átomo se crea ni se destruye (conservación
 * de la masa, Lavoisier).
 *
 * Patrón R3F: el default export solo monta <Canvas> y delega en <Contenido>.
 * React Compiler: nada de Math.random()/Date.now()/setState en render; las
 * posiciones se derivan determinísticamente de `progreso` (prop). El giro suave
 * vive en un ref dentro de useFrame (cosmético, permitido).
 */

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { ELEMS, type Elem, type RAtom, type RBond, type V } from "./reacciones-tipos-data";

export interface ReaccionesTiposSceneProps {
  reaccionId: string;
  atoms: RAtom[];
  rbonds: RBond[];
  pbonds: RBond[];
  progreso: number;
  accent: string;
  girar: boolean;
  resetNonce: number;
}

const BOND_COLOR = "#C4CDD8";
const NEW_COLOR = "#7DF0C0";   // verde: enlaces que se forman

/* smoothstep para un morph suave */
function ease(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
function lerpV(a: V, b: V, t: number): V {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

/* ── Átomo (esfera CPK) ───────────────────────────────────────────────────── */
function Atomo({ el, pos }: { el: Elem; pos: V }) {
  const e = ELEMS[el];
  return (
    <mesh position={pos} castShadow receiveShadow>
      <sphereGeometry args={[e.radio, 32, 32]} />
      <meshStandardMaterial color={e.color} emissive={e.color} emissiveIntensity={0.12} roughness={0.34} metalness={0.18} />
    </mesh>
  );
}

/* ── Enlace (cilindros; nº de barras = orden), con opacidad para el crossfade ─ */
function Bond({ start, end, orden, opacity, nuevo }: { start: V; end: V; orden: 1 | 2; opacity: number; nuevo: boolean }) {
  const { mid, quat, length, perp, offsets } = useMemo(() => {
    const s = new THREE.Vector3(...start);
    const e = new THREE.Vector3(...end);
    const dir = new THREE.Vector3().subVectors(e, s);
    const length = dir.length();
    const mid = new THREE.Vector3().addVectors(s, e).multiplyScalar(0.5);
    const ndir = dir.clone().normalize();
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), ndir);
    let up = new THREE.Vector3(0, 1, 0);
    if (Math.abs(ndir.dot(up)) > 0.9) up = new THREE.Vector3(1, 0, 0);
    const perp = new THREE.Vector3().crossVectors(ndir, up).normalize();
    const g = 0.12;
    const offsets = orden === 1 ? [0] : [-g, g];
    return { mid, quat, length, perp, offsets };
  }, [start, end, orden]);

  if (opacity <= 0.02 || length < 0.01) return null;
  const radio = orden === 1 ? 0.06 : 0.045;
  const col = nuevo ? NEW_COLOR : BOND_COLOR;
  return (
    <>
      {offsets.map((o, i) => (
        <mesh key={i} position={mid.clone().add(perp.clone().multiplyScalar(o))} quaternion={quat}>
          <cylinderGeometry args={[radio, radio, length, 16]} />
          <meshStandardMaterial
            color={col}
            emissive={nuevo ? NEW_COLOR : "#000000"}
            emissiveIntensity={nuevo ? 0.4 * opacity : 0}
            roughness={0.35}
            metalness={0.5}
            transparent
            opacity={opacity}
            depthWrite={opacity > 0.85}
          />
        </mesh>
      ))}
    </>
  );
}

/* ── Sistema de reacción (átomos morfando + crossfade de enlaces) ─────────── */
function Sistema({ atoms, rbonds, pbonds, progreso, girar }: { atoms: RAtom[]; rbonds: RBond[]; pbonds: RBond[]; progreso: number; girar: boolean }) {
  const grp = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (grp.current && girar) grp.current.rotation.y += dt * 0.35;
  });

  const t = ease(progreso);
  // posición actual de cada átomo
  const pos: V[] = atoms.map((a) => lerpV(a.from, a.to, t));

  // crossfade en la ventana central 0.30 → 0.70
  const rOp = progreso < 0.30 ? 1 : progreso > 0.70 ? 0 : 1 - (progreso - 0.30) / 0.40;
  const pOp = progreso < 0.30 ? 0 : progreso > 0.70 ? 1 : (progreso - 0.30) / 0.40;

  return (
    <group ref={grp}>
      {atoms.map((a, i) => (
        <Atomo key={`a${i}`} el={a.el} pos={pos[i]!} />
      ))}
      {rbonds.map((b, i) => (
        <Bond key={`r${i}`} start={pos[b.a]!} end={pos[b.b]!} orden={b.orden} opacity={rOp} nuevo={false} />
      ))}
      {pbonds.map((b, i) => (
        <Bond key={`p${i}`} start={pos[b.a]!} end={pos[b.b]!} orden={b.orden} opacity={pOp} nuevo />
      ))}
    </group>
  );
}

/* ── Contenido (descendiente del Canvas) ─────────────────────────────────── */
function Contenido({ reaccionId, atoms, rbonds, pbonds, progreso, accent, girar, resetNonce }: ReaccionesTiposSceneProps) {
  const sig = `${reaccionId}-${resetNonce}`;
  return (
    <>
      <color attach="background" args={["#041018"]} />
      <fog attach="fog" args={["#041018", 16, 44]} />

      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 9, 7]} intensity={1.9} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-far={30} shadow-bias={-0.0004} />
      <pointLight position={[-5, 3, 4]} intensity={9} color={accent} />
      <pointLight position={[5, 2, 5]} intensity={6} color="#ffffff" />

      <group key={sig} position={[0, 0.1, 0]}>
        <Sistema atoms={atoms} rbonds={rbonds} pbonds={pbonds} progreso={progreso} girar={girar} />
        <ContactShadows position={[0, -2.6, 0]} opacity={0.3} scale={16} blur={2.6} far={6} color="#16314a" />
      </group>

      <Environment resolution={256}>
        <Lightformer intensity={1.9} position={[0, 5, 4]} scale={[10, 4, 1]} color="#ffffff" />
        <Lightformer intensity={1.3} position={[-6, 2, -2]} scale={[5, 5, 1]} color={accent} />
        <Lightformer intensity={1.0} position={[6, 1, 3]} scale={[4, 4, 1]} color="#bfe8ff" />
      </Environment>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={5}
        maxDistance={16}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.6}
        target={[0, 0, 0]}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.45} luminanceThreshold={0.6} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.24} darkness={0.42} />
      </EffectComposer>
    </>
  );
}

export default function ReaccionesTiposScene(props: ReaccionesTiposSceneProps) {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={{ position: [0, 1.4, 9], fov: 46 }}>
      <Contenido {...props} />
    </Canvas>
  );
}
