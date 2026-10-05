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
import { OrbitControls, Html } from "@react-three/drei";
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
  /** 0…1: cuánto se aleja el grupo funcional del resto de la molécula. */
  separacion: number;
  /** Texto corto del grupo funcional (vacío si la familia no tiene). */
  etiquetaFG: string;
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
          <meshBasicMaterial color={fgColor} transparent opacity={0.18} depthWrite={false} />
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
          />
        </mesh>
      ))}
    </>
  );
}

/* ── Molécula completa, girando sobre su eje ─────────────────────────────── */
const SEPARA_MAX = 2.4; // distancia máxima a la que se aleja el grupo funcional

function Molecula({ atoms, bonds, resaltarFG, fgColor, girar, separacion, etiquetaFG }: {
  atoms: AtomLocal[]; bonds: BondLocal[]; resaltarFG: boolean; fgColor: string; girar: boolean; separacion: number; etiquetaFG: string;
}) {
  const grp = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (grp.current && girar) grp.current.rotation.y += dt * 0.6;
  });

  // El grupo funcional se aleja del resto a lo largo del eje que los une;
  // los enlaces entre ambos partes se estiran solos porque leen estas posiciones.
  const { pos, centroFG } = useMemo(() => {
    const fgs = atoms.filter((x) => x.fg);
    const resto = atoms.filter((x) => !x.fg);
    const cen = (l: AtomLocal[]): Pt => {
      const n = Math.max(1, l.length);
      return [l.reduce((t, x) => t + x.p[0], 0) / n, l.reduce((t, x) => t + x.p[1], 0) / n, l.reduce((t, x) => t + x.p[2], 0) / n];
    };
    const cf = cen(fgs), cr = cen(resto);
    let d: Pt = [0, 0, 0];
    if (fgs.length > 0 && resto.length > 0) {
      const v = new THREE.Vector3(cf[0] - cr[0], cf[1] - cr[1], cf[2] - cr[2]).normalize().multiplyScalar(separacion * SEPARA_MAX);
      d = [v.x, v.y, v.z];
    }
    const pos = atoms.map((x): Pt => (x.fg ? [x.p[0] + d[0], x.p[1] + d[1], x.p[2] + d[2]] : [x.p[0], x.p[1], x.p[2]]));
    const centroFG: Pt = [cf[0] + d[0], cf[1] + d[1], cf[2] + d[2]];
    return { pos, centroFG };
  }, [atoms, separacion]);

  return (
    <group ref={grp}>
      {atoms.map((a, i) => (
        <Atomo key={`a${i}`} el={a.el} pos={pos[i]!} fg={!!a.fg} resaltar={resaltarFG} fgColor={fgColor} />
      ))}
      {bonds.map((b, i) => (
        <Bond key={`b${i}`} start={pos[b.a]!} end={pos[b.b]!} orden={b.orden} fg={!!b.fg} resaltar={resaltarFG} fgColor={fgColor} />
      ))}
      {etiquetaFG && resaltarFG && (
        <Html position={[centroFG[0], centroFG[1] + 0.85, centroFG[2]]} center pointerEvents="none" zIndexRange={[20, 0]}>
          <div style={{
            whiteSpace: "nowrap", padding: "3px 9px", borderRadius: 8, background: "rgba(4,10,22,0.88)",
            border: `1.5px solid ${fgColor}`, color: fgColor, fontWeight: 900, fontSize: 15,
            fontFamily: "system-ui, sans-serif", boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
          }}>
            {etiquetaFG}
          </div>
        </Html>
      )}
    </group>
  );
}

/* ── Contenido (descendiente del Canvas) ─────────────────────────────────── */
function Contenido({ molId, atoms, bonds, accent, fgColor, resaltarFG, girar, autoRotate, resetNonce, separacion, etiquetaFG }: OrganicaSceneProps) {
  const sig = `${molId}-${resetNonce}`;
  return (
    <>
      {/* Suelo, luz de tres puntos y entorno que reflejar. La altura sale
          de donde esta escena ya ponía su sombra de contacto, que es donde
          su autor decidió que estaba el piso. */}
      <Escenario acento={accent} suelo={-2.6} />


      <group key={sig} position={[0, 0.1, 0]}>
        <Molecula atoms={atoms} bonds={bonds} resaltarFG={resaltarFG} fgColor={fgColor} girar={girar} separacion={separacion} etiquetaFG={etiquetaFG} />
      </group>


      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={4}
        maxDistance={14}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.6}
        target={[0, -0.45, 0]}
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
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={{ position: [0, 0.8, 6.6], fov: 46 }}>
      {/* A 8 unidades, una molécula pequeña como el metano ocupaba menos de un
          tercio del alto y la escena parecía vacía. A 6 sigue cabiendo entera
          una cadena larga, y `maxDistance` deja alejarse si hace falta. */}
      <Contenido {...props} />
    </Canvas>
  );
}
