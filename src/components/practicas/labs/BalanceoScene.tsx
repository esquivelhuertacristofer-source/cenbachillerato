"use client";

/**
 * Escena 3D — "Balanceo de ecuaciones químicas" (CNEYT-IV-P01-A2).
 *
 * A la IZQUIERDA los reactivos, a la DERECHA los productos. De cada especie se
 * dibujan tantas COPIAS de la molécula como indica su coeficiente actual: subir
 * un coeficiente hace aparecer una molécula entera más. En el centro, una flecha
 * de reacción que se vuelve VERDE cuando la ecuación queda balanceada (mismos
 * átomos de cada elemento a ambos lados → la masa se conserva). Escala fija, así
 * que lo que cuenta es lo que se ve. Los átomos usan colores tipo CPK.
 *
 * Patrón R3F: el default export solo monta <Canvas> y delega en <Contenido>.
 * React Compiler: nada de Math.random()/Date.now()/setState en render; la
 * geometría se memoiza y useFrame solo late en un ref.
 */

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { ELEMS_B, MOLS_B, type Elem, type Especie } from "./balanceo-data";

export interface BalanceoSceneProps {
  reaccionKey: string;
  reactivos: Especie[];
  productos: Especie[];
  coefReact: number[];
  coefProd: number[];
  balanceada: boolean;
  accent: string;
  autoRotate: boolean;
  resetNonce: number;
}

type Pt = [number, number, number];

const BOND_COLOR = "#C4CDD8";
const OK_COL = "#34D399";   // balanceada
const NO_COL = "#FB923C";   // desbalanceada

const SIDE_X = 4.4;
const COL_SP = 2.4;
const ROW_SP = 2.4;

interface PlacedAtom { el: Elem; pos: Pt; }
interface PlacedBond { a: number; b: number; orden: 1 | 2 | 3; }
interface Side { atoms: PlacedAtom[]; bonds: PlacedBond[]; }

/** Expande las especies según sus coeficientes y las coloca en una cuadrícula. */
function buildSide(species: Especie[], coefs: number[], centerX: number): Side {
  const instances: string[] = [];
  species.forEach((s, i) => {
    const c = coefs[i] ?? 0;
    for (let k = 0; k < c; k++) instances.push(s.mol);
  });
  const n = instances.length;
  const cols = n <= 2 ? 1 : n <= 6 ? 2 : 3;
  const rows = Math.max(1, Math.ceil(n / cols));
  const gridW = (cols - 1) * COL_SP;
  const gridH = (rows - 1) * ROW_SP;

  const atoms: PlacedAtom[] = [];
  const bonds: PlacedBond[] = [];
  instances.forEach((molName, idx) => {
    const def = MOLS_B[molName]!;
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const ox = centerX + col * COL_SP - gridW / 2;
    const oy = -(row * ROW_SP) + gridH / 2;
    const base = atoms.length;
    for (const a of def.atoms) atoms.push({ el: a.el, pos: [a.p[0] + ox, a.p[1] + oy, a.p[2]] });
    for (const b of def.bonds) bonds.push({ a: base + b.a, b: base + b.b, orden: b.orden });
  });
  return { atoms, bonds };
}

/* ── Átomo (esfera CPK) ──────────────────────────────────────────────────── */
function Atomo({ el, pos, boost }: { el: Elem; pos: Pt; boost: number }) {
  const e = ELEMS_B[el];
  return (
    <mesh position={pos} castShadow receiveShadow>
      <sphereGeometry args={[e.radio, 28, 28]} />
      <meshStandardMaterial color={e.color} emissive={e.color} emissiveIntensity={0.1 + boost} roughness={0.34} metalness={0.14} />
    </mesh>
  );
}

/* ── Enlace (cilindros; nº de barras = orden) ────────────────────────────── */
function Bond({ start, end, orden }: { start: Pt; end: Pt; orden: 1 | 2 | 3 }) {
  const { mid, quat, len, perp, offsets } = useMemo(() => {
    const s = new THREE.Vector3(...start);
    const e = new THREE.Vector3(...end);
    const dir = new THREE.Vector3().subVectors(e, s);
    const len = dir.length();
    const mid = new THREE.Vector3().addVectors(s, e).multiplyScalar(0.5);
    const ndir = dir.clone().normalize();
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), ndir);
    let up = new THREE.Vector3(0, 1, 0);
    if (Math.abs(ndir.dot(up)) > 0.9) up = new THREE.Vector3(1, 0, 0);
    const perp = new THREE.Vector3().crossVectors(ndir, up).normalize();
    const g = 0.12;
    const offsets = orden === 1 ? [0] : orden === 2 ? [-g, g] : [-g, 0, g];
    return { mid, quat, len, perp, offsets };
  }, [start, end, orden]);
  const radio = orden === 1 ? 0.06 : 0.045;
  return (
    <>
      {offsets.map((o, i) => (
        <mesh key={i} position={mid.clone().add(perp.clone().multiplyScalar(o))} quaternion={quat}>
          <cylinderGeometry args={[radio, radio, len, 14]} />
          <meshStandardMaterial color={BOND_COLOR} roughness={0.35} metalness={0.5} />
        </mesh>
      ))}
    </>
  );
}

/* ── Un lado completo (reactivos o productos) ────────────────────────────── */
function LadoMesh({ side, boost }: { side: Side; boost: number }) {
  return (
    <>
      {side.atoms.map((a, i) => <Atomo key={`a${i}`} el={a.el} pos={a.pos} boost={boost} />)}
      {side.bonds.map((b, i) => <Bond key={`b${i}`} start={side.atoms[b.a]!.pos} end={side.atoms[b.b]!.pos} orden={b.orden} />)}
    </>
  );
}

/* ── Flecha de reacción central + estado ─────────────────────────────────── */
function Flecha({ balanceada }: { balanceada: boolean }) {
  const col = balanceada ? OK_COL : NO_COL;
  const ring = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ring.current) {
      const k = balanceada ? 1 + Math.sin(s.clock.elapsedTime * 4) * 0.12 : 1;
      ring.current.scale.setScalar(k);
    }
  });
  return (
    <group>
      {/* cuerpo de la flecha (a lo largo de X) */}
      <mesh position={[-0.2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 1.7, 12]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.6} toneMapped={false} />
      </mesh>
      <mesh position={[0.85, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.22, 0.5, 18]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.7} toneMapped={false} />
      </mesh>
      {/* anillo/indicador pulsante cuando está balanceada */}
      {balanceada && (
        <mesh ref={ring} position={[0, 1.25, 0]}>
          <torusGeometry args={[0.26, 0.06, 12, 28]} />
          <meshStandardMaterial color={OK_COL} emissive={OK_COL} emissiveIntensity={1.6} toneMapped={false} />
        </mesh>
      )}
      <Html position={[0, 1.95, 0]} center distanceFactor={16} pointerEvents="none">
        <div style={{
          whiteSpace: "nowrap", padding: "5px 12px", borderRadius: 999,
          background: balanceada ? "rgba(6,30,22,0.9)" : "rgba(34,18,6,0.9)",
          border: `1px solid ${col}`, color: "#fff", fontWeight: 800, fontSize: 12,
          fontFamily: "system-ui, sans-serif", boxShadow: "0 8px 28px rgba(0,0,0,0.45)",
        }}>
          {balanceada ? "✓ Balanceada" : "✗ Desbalanceada"}
        </div>
      </Html>
    </group>
  );
}

/* ── Contenido (descendiente del Canvas) ─────────────────────────────────── */
function Contenido({ reactivos, productos, coefReact, coefProd, balanceada, accent, autoRotate, resetNonce, reaccionKey }: BalanceoSceneProps) {
  const izq = useMemo(() => buildSide(reactivos, coefReact, -SIDE_X), [reactivos, coefReact]);
  const der = useMemo(() => buildSide(productos, coefProd, SIDE_X), [productos, coefProd]);
  const boost = balanceada ? 0.35 : 0;
  const sig = `${reaccionKey}-${coefReact.join(",")}-${coefProd.join(",")}-${resetNonce}`;

  return (
    <>
      <color attach="background" args={["#041018"]} />
      <fog attach="fog" args={["#041018", 24, 64]} />

      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 8]} intensity={1.9} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-far={40} shadow-bias={-0.0004} />
      <pointLight position={[-6, 4, 4]} intensity={12} color={accent} />
      <pointLight position={[6, 2, 5]} intensity={8} color="#ffffff" />

      <group key={sig} position={[0, 0.2, 0]}>
        <LadoMesh side={izq} boost={boost} />
        <LadoMesh side={der} boost={boost} />
        <Flecha balanceada={balanceada} />
        <ContactShadows position={[0, -4.6, 0]} opacity={0.32} scale={22} blur={2.8} far={8} color="#16314a" />
      </group>

      <Environment resolution={256}>
        <Lightformer intensity={1.9} position={[0, 6, 4]} scale={[12, 4, 1]} color="#ffffff" />
        <Lightformer intensity={1.3} position={[-7, 2, -2]} scale={[6, 6, 1]} color={accent} />
        <Lightformer intensity={1.0} position={[7, 1, 3]} scale={[5, 5, 1]} color="#bfe8ff" />
      </Environment>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={9}
        maxDistance={28}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.7}
        target={[0, 0, 0]}
        autoRotate={autoRotate}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={balanceada ? 0.7 : 0.4} luminanceThreshold={0.62} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.24} darkness={0.42} />
      </EffectComposer>
    </>
  );
}

export default function BalanceoScene(props: BalanceoSceneProps) {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={{ position: [0, 1.6, 17], fov: 48 }}>
      <Contenido {...props} />
    </Canvas>
  );
}
