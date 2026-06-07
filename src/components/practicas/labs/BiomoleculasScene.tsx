"use client";

/**
 * Escena 3D — "Visor de las 4 biomoléculas" (CNEYT-IV-P05).
 *
 * Una biomolécula ball-and-stick (esferas CPK + barras) en el centro, que el
 * alumno gira. Según el modo, muestra el MONÓMERO (la subunidad) o el ENSAMBLADO
 * (el polímero / la estructura grande). Los enlaces que UNEN monómeros se pintan
 * de verde (`nuevo`) para visualizar la polimerización; cuando "resaltar" está
 * activo, la parte característica (el grupo funcional / la base) brilla.
 *
 * Patrón R3F: el default export solo monta <Canvas> y delega en <Contenido>.
 * React Compiler: nada de Math.random()/Date.now()/setState en render; la
 * rotación vive en un ref dentro de useFrame (cosmético, permitido).
 */

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { ELEMS_B, type Elem, type AtomLocal, type BondLocal } from "./biomoleculas-data";

export interface BiomoleculasSceneProps {
  sigId: string;
  atoms: AtomLocal[];
  bonds: BondLocal[];
  accent: string;
  resaltar: boolean;
  girar: boolean;
  resetNonce: number;
}

type Pt = [number, number, number];

const BOND_COLOR = "#C4CDD8";
const NEW_COLOR = "#7DF0C0"; // verde: enlaces que unen monómeros (polimerización)

/* ── Átomo (esfera CPK), con halo opcional al resaltar ───────────────────── */
function Atomo({ el, pos, fg, resaltar }: { el: Elem; pos: Pt; fg: boolean; resaltar: boolean }) {
  const e = ELEMS_B[el];
  const destaca = fg && resaltar;
  const atenua = resaltar && !fg;
  return (
    <group position={pos}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[e.radio, 32, 32]} />
        <meshStandardMaterial
          color={e.color}
          emissive={destaca ? e.color : e.color}
          emissiveIntensity={destaca ? 0.5 : 0.1}
          roughness={0.34}
          metalness={0.16}
          transparent={atenua}
          opacity={atenua ? 0.4 : 1}
        />
      </mesh>
      {destaca && (
        <mesh>
          <sphereGeometry args={[e.radio + 0.14, 24, 24]} />
          <meshBasicMaterial color={e.color} transparent opacity={0.2} depthWrite={false} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}

/* ── Enlace (cilindros; nº de barras = orden); verde si une monómeros ─────── */
function Bond({ start, end, orden, nuevo, fg, resaltar }: { start: Pt; end: Pt; orden: 1 | 2; nuevo: boolean; fg: boolean; resaltar: boolean }) {
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

  if (length < 0.01) return null;
  const atenua = resaltar && !fg && !nuevo;
  const radio = nuevo ? 0.075 : orden === 1 ? 0.06 : 0.045;
  const col = nuevo ? NEW_COLOR : BOND_COLOR;
  return (
    <>
      {offsets.map((o, i) => (
        <mesh key={i} position={mid.clone().add(perp.clone().multiplyScalar(o))} quaternion={quat}>
          <cylinderGeometry args={[radio, radio, length, 16]} />
          <meshStandardMaterial
            color={col}
            emissive={nuevo ? NEW_COLOR : "#000000"}
            emissiveIntensity={nuevo ? 0.5 : 0}
            roughness={0.35}
            metalness={0.5}
            transparent={atenua}
            opacity={atenua ? 0.4 : 1}
            toneMapped={!nuevo}
          />
        </mesh>
      ))}
    </>
  );
}

/* ── Biomolécula completa, girando sobre su eje ──────────────────────────── */
function Biomolecula({ atoms, bonds, resaltar, girar }: { atoms: AtomLocal[]; bonds: BondLocal[]; resaltar: boolean; girar: boolean }) {
  const grp = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (grp.current && girar) grp.current.rotation.y += dt * 0.5;
  });
  return (
    <group ref={grp}>
      {atoms.map((a, i) => (
        <Atomo key={`a${i}`} el={a.el} pos={a.p} fg={!!a.fg} resaltar={resaltar} />
      ))}
      {bonds.map((b, i) => (
        <Bond key={`b${i}`} start={atoms[b.a]!.p} end={atoms[b.b]!.p} orden={b.orden} nuevo={!!b.nuevo} fg={!!b.fg} resaltar={resaltar} />
      ))}
    </group>
  );
}

/* ── Contenido (descendiente del Canvas) ─────────────────────────────────── */
function Contenido({ sigId, atoms, bonds, accent, resaltar, girar, resetNonce }: BiomoleculasSceneProps) {
  const sig = `${sigId}-${resetNonce}`;
  return (
    <>
      <color attach="background" args={["#041018"]} />
      <fog attach="fog" args={["#041018", 16, 46]} />

      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 9, 7]} intensity={1.9} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-far={30} shadow-bias={-0.0004} />
      <pointLight position={[-5, 3, 4]} intensity={9} color={accent} />
      <pointLight position={[5, 2, 5]} intensity={6} color="#ffffff" />

      <group key={sig} position={[0, 0.1, 0]}>
        <Biomolecula atoms={atoms} bonds={bonds} resaltar={resaltar} girar={girar} />
        <ContactShadows position={[0, -3.2, 0]} opacity={0.28} scale={18} blur={2.6} far={7} color="#16314a" />
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
        maxDistance={18}
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

export default function BiomoleculasScene(props: BiomoleculasSceneProps) {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={{ position: [0, 1.4, 10], fov: 46 }}>
      <Contenido {...props} />
    </Canvas>
  );
}
