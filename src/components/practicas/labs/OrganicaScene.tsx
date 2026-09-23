"use client";

/**
 * Escena 3D — "Visor molecular de química orgánica" (CNEYT-IV-P04).
 *
 * Una molécula ball-and-stick (esferas CPK + barras) en el centro, que el alumno
 * gira para verla desde cualquier ángulo. Cuando "resaltar grupo funcional" está
 * activo, los átomos y enlaces del grupo funcional (–OH, –COOH o el doble enlace
 * C=C) brillan y se rodean de un halo, para localizar de un vistazo qué define a
 * cada familia. La molécula puede girar sobre su eje ("play").
 *
 * Patrón R3F: el default export solo monta <Canvas> y delega en <Contenido>.
 * React Compiler: nada de Math.random()/Date.now()/setState en render; la
 * rotación vive en un ref dentro de useFrame (cosmético, permitido).
 */

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { ELEMS_O, type Elem, type AtomLocal, type BondLocal } from "./organica-data";
import { Escenario } from "./_escenario";

export interface OrganicaSceneProps {
  molId: string;
  atoms: AtomLocal[];
  bonds: BondLocal[];
  accent: string;
  fgColor: string;
  resaltarFG: boolean;
  girar: boolean;
  autoRotate: boolean;
  resetNonce: number;
}

type Pt = [number, number, number];

const BOND_COLOR = "#C4CDD8";

/* ── Átomo (esfera CPK), con halo opcional si pertenece al grupo funcional ── */
function Atomo({ el, pos, fg, resaltar, fgColor }: { el: Elem; pos: Pt; fg: boolean; resaltar: boolean; fgColor: string }) {
  const e = ELEMS_O[el];
  const destaca = fg && resaltar;
  const atenua = resaltar && !fg;
  return (
    <group position={pos}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[e.radio, 32, 32]} />
        <meshStandardMaterial
          color={e.color}
          emissive={destaca ? fgColor : e.color}
          emissiveIntensity={destaca ? 0.55 : 0.1}
          roughness={0.34}
          metalness={0.16}
          transparent={atenua}
          opacity={atenua ? 0.45 : 1}
        />
      </mesh>
      {destaca && (
        <mesh>
          <sphereGeometry args={[e.radio + 0.14, 24, 24]} />
          <meshBasicMaterial color={fgColor} transparent opacity={0.18} depthWrite={false} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}

/* ── Enlace (cilindros; nº de barras = orden) ────────────────────────────── */
function Bond({ start, end, orden, fg, resaltar, fgColor }: { start: Pt; end: Pt; orden: 1 | 2 | 3; fg: boolean; resaltar: boolean; fgColor: string }) {
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
    const offsets = orden === 1 ? [0] : orden === 2 ? [-g, g] : [-g, 0, g];
    return { mid, quat, length, perp, offsets };
  }, [start, end, orden]);

  const destaca = fg && resaltar;
  const atenua = resaltar && !fg;
  const radio = orden === 1 ? 0.06 : 0.045;
  const col = destaca ? fgColor : BOND_COLOR;
  return (
    <>
      {offsets.map((o, i) => (
        <mesh key={i} position={mid.clone().add(perp.clone().multiplyScalar(o))} quaternion={quat}>
          <cylinderGeometry args={[radio, radio, length, 16]} />
          <meshStandardMaterial
            color={col}
            emissive={destaca ? fgColor : "#000000"}
            emissiveIntensity={destaca ? 0.6 : 0}
            roughness={0.35}
            metalness={0.5}
            transparent={atenua}
            opacity={atenua ? 0.4 : 1}
            toneMapped={!destaca}
          />
        </mesh>
      ))}
    </>
  );
}

/* ── Molécula completa, girando sobre su eje ─────────────────────────────── */
function Molecula({ atoms, bonds, resaltarFG, fgColor, girar }: { atoms: AtomLocal[]; bonds: BondLocal[]; resaltarFG: boolean; fgColor: string; girar: boolean }) {
  const grp = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (grp.current && girar) grp.current.rotation.y += dt * 0.6;
  });
  return (
    <group ref={grp}>
      {atoms.map((a, i) => (
        <Atomo key={`a${i}`} el={a.el} pos={a.p} fg={!!a.fg} resaltar={resaltarFG} fgColor={fgColor} />
      ))}
      {bonds.map((b, i) => (
        <Bond key={`b${i}`} start={atoms[b.a]!.p} end={atoms[b.b]!.p} orden={b.orden} fg={!!b.fg} resaltar={resaltarFG} fgColor={fgColor} />
      ))}
    </group>
  );
}

/* ── Contenido (descendiente del Canvas) ─────────────────────────────────── */
function Contenido({ molId, atoms, bonds, accent, fgColor, resaltarFG, girar, autoRotate, resetNonce }: OrganicaSceneProps) {
  const sig = `${molId}-${resetNonce}`;
  return (
    <>
      {/* Suelo, luz de tres puntos y entorno que reflejar. */}
      {/* La altura sale de donde esta escena ya ponía su sombra de
          contacto: es donde su autor decidió que estaba el piso. */}
      <Escenario acento={accent} suelo={-2.6} />


      <group key={sig} position={[0, 0.1, 0]}>
        <Molecula atoms={atoms} bonds={bonds} resaltarFG={resaltarFG} fgColor={fgColor} girar={girar} />
      </group>


      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={4}
        maxDistance={14}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.6}
        target={[0, 0, 0]}
        autoRotate={autoRotate}
        autoRotateSpeed={0.5}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={resaltarFG ? 0.6 : 0.4} luminanceThreshold={0.6} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.24} darkness={0.42} />
      </EffectComposer>
    </>
  );
}

export default function OrganicaScene(props: OrganicaSceneProps) {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={{ position: [0, 1.2, 8], fov: 46 }}>
      <Contenido {...props} />
    </Canvas>
  );
}
