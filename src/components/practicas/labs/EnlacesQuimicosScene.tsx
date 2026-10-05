"use client";

/**
 * Escena 3D del laboratorio de Enlaces químicos (React Three Fiber).
 * Se carga de forma diferida (ssr:false) desde LabEnlacesQuimicos.tsx.
 *
 * Renderiza un modelo de barras y esferas (ball-and-stick) de la molécula
 * elegida. Distingue visualmente el tipo de enlace:
 *   · COVALENTE  → los átomos COMPARTEN electrones: barras sólidas que los unen
 *                  (orden 1/2/3 = enlace simple/doble/triple).
 *   · IÓNICO     → un átomo CEDE un electrón al otro: se anima la transferencia
 *                  y aparecen las cargas (Na⁺ y Cl⁻) que se atraen.
 */

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { ELEMS, CAT_COLOR, type AtomoMol, type EnlaceMol, type ElementoQuim, type Categoria } from "./enlaces-data";
import { Escenario } from "./_escenario";
import { ATOMO } from "./_vidrio";

export interface EnlacesSceneProps {
  molKey: string;
  atoms: AtomoMol[];
  bonds: EnlaceMol[];
  ionico: boolean;
  /** Tipo de enlace: decide las cargas parciales (δ) que se rotulan. */
  categoria: Categoria;
  accent: string;
  autoRotate: boolean;
  resetNonce: number;
}

const BOND_COLOR = "#C4CDD8";
const ELECTRON_COLOR = "#5BC8FF";

/* ── Átomo: esfera con color tipo CPK ─────────────────────────────────── */
function AtomoMesh({ el, pos }: { el: ElementoQuim; pos: [number, number, number] }) {
  const e = ELEMS[el];
  return (
    <mesh position={pos} castShadow receiveShadow>
      <sphereGeometry args={[e.radio, 32, 32]} />
      <meshPhysicalMaterial {...ATOMO} color={e.color} emissive={e.color} emissiveIntensity={0.1} />
    </mesh>
  );
}

/* ── Enlace covalente: barra(s) entre dos átomos (orden = nº de barras) ── */
function Bond({ start, end, orden }: { start: [number, number, number]; end: [number, number, number]; orden: 1 | 2 | 3 }) {
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
    const g = 0.14;
    const offsets = orden === 1 ? [0] : orden === 2 ? [-g, g] : [-g, 0, g];
    return { mid, quat, len, perp, offsets };
  }, [start, end, orden]);

  const radio = orden === 1 ? 0.075 : 0.055;

  return (
    <>
      {offsets.map((o, i) => (
        <mesh key={i} position={mid.clone().add(perp.clone().multiplyScalar(o))} quaternion={quat} castShadow>
          <cylinderGeometry args={[radio, radio, len, 16]} />
          <meshStandardMaterial color={BOND_COLOR} roughness={0.35} metalness={0.5} />
        </mesh>
      ))}
    </>
  );
}

/* ── Marca de carga (+ / −) para los iones ────────────────────────────── */
function ChargeMark({ tipo, pos }: { tipo: "+" | "-"; pos: [number, number, number] }) {
  return (
    <group position={pos}>
      <mesh>
        <boxGeometry args={[0.36, 0.08, 0.08]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.9} />
      </mesh>
      {tipo === "+" && (
        <mesh>
          <boxGeometry args={[0.08, 0.36, 0.08]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.9} />
        </mesh>
      )}
    </group>
  );
}

/* ── Molécula covalente: comparten electrones (barras) ────────────────── */
function Covalente({ atoms, bonds }: { atoms: AtomoMol[]; bonds: EnlaceMol[] }) {
  return (
    <>
      {atoms.map((a, i) => (
        <AtomoMesh key={i} el={a.el} pos={a.pos} />
      ))}
      {bonds.map((b, i) => (
        <Bond key={i} start={atoms[b.a]!.pos} end={atoms[b.b]!.pos} orden={b.orden} />
      ))}
    </>
  );
}

/* ── Enlace iónico: el metal CEDE un electrón al no metal ─────────────── */
function Ionico({ atoms }: { atoms: AtomoMol[] }) {
  const eRef = useRef<THREE.Mesh>(null);
  const a0 = atoms[0]!; // metal (cede)
  const a1 = atoms[1]!; // no metal (recibe)
  const from = a0.pos;
  const to = a1.pos;

  useFrame((state) => {
    const m = eRef.current;
    if (!m) return;
    const t = (state.clock.elapsedTime * 0.4) % 1; // ciclo de transferencia
    const p = Math.min(1, t / 0.55); // viaja en la primera parte del ciclo
    const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    m.position.set(
      from[0] + (to[0] - from[0]) * ease,
      from[1] + (to[1] - from[1]) * ease + Math.sin(ease * Math.PI) * 0.45,
      from[2] + (to[2] - from[2]) * ease,
    );
    m.visible = t < 0.62; // se oculta al integrarse al no metal
  });

  return (
    <>
      <AtomoMesh el={a0.el} pos={a0.pos} />
      <AtomoMesh el={a1.el} pos={a1.pos} />
      {/* electrón en tránsito */}
      <mesh ref={eRef}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color={ELECTRON_COLOR} emissive={ELECTRON_COLOR} emissiveIntensity={1.5} />
      </mesh>
      {/* cargas resultantes */}
      <ChargeMark tipo="+" pos={[a0.pos[0], a0.pos[1] + ELEMS[a0.el].radio + 0.45, a0.pos[2]]} />
      <ChargeMark tipo="-" pos={[a1.pos[0], a1.pos[1] + ELEMS[a1.el].radio + 0.45, a1.pos[2]]} />
      {/* halo de atracción electrostática */}
      <mesh>
        <sphereGeometry args={[1.9, 24, 24]} />
        <meshBasicMaterial color={ELECTRON_COLOR} transparent opacity={0.05} depthWrite={false} />
      </mesh>
    </>
  );
}

/* ── Nube de electrones compartidos (diatómicas covalentes) ────────────
 * Se desplaza hacia el átomo más electronegativo: cuanto mayor la ΔEN, más
 * se carga hacia él (enlace polar). Con ΔEN = 0 queda justo al centro. */
function NubeCompartida({ atoms }: { atoms: AtomoMol[] }) {
  const a0 = atoms[0]!, a1 = atoms[1]!;
  const dx = a1.pos[0] - a0.pos[0];
  const dist = Math.abs(dx) || 1;
  const sign = dx >= 0 ? 1 : -1;
  const shift = ((ELEMS[a1.el].en - ELEMS[a0.el].en) / 2.6) * dist * 0.5 * sign;
  const cx = (a0.pos[0] + a1.pos[0]) / 2 + shift;
  return (
    <mesh position={[cx, (a0.pos[1] + a1.pos[1]) / 2, (a0.pos[2] + a1.pos[2]) / 2]} scale={[dist * 0.62 + 0.45, 0.55, 0.55]}>
      <sphereGeometry args={[1, 32, 24]} />
      <meshBasicMaterial color={ELECTRON_COLOR} transparent opacity={0.3} depthWrite={false} />
    </mesh>
  );
}

/* Etiqueta fija en px (nunca <Text>: cuelga Turbopack). Se oculta en pantallas angostas. */
function Etiqueta({ pos, color, children }: { pos: [number, number, number]; color: string; children: React.ReactNode }) {
  const ancho = useThree((st) => st.size.width);
  if (ancho < 640) return null;
  return (
    <Html position={pos} center pointerEvents="none" zIndexRange={[20, 0]}>
      <div style={{ transform: "translate(0,-70%)" }}>
        <div style={{
          whiteSpace: "nowrap", padding: "3px 10px", borderRadius: 8, background: "rgba(4,10,22,0.88)",
          border: `1.5px solid ${color}`, color, fontWeight: 900, fontSize: 15,
          fontFamily: "system-ui, sans-serif", boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
        }}>
          {children}
        </div>
      </div>
    </Html>
  );
}

/* Rótulos sobre los átomos: símbolo y, según el enlace, carga (iónico) o carga parcial δ (polar). */
function Rotulos({ atoms, ionico, categoria }: { atoms: AtomoMol[]; ionico: boolean; categoria: Categoria }) {
  const ens = atoms.map((a) => ELEMS[a.el].en);
  const enMax = Math.max(...ens), enMin = Math.min(...ens);
  const visibles = atoms.length <= 4 ? atoms.map((a, i) => ({ a, i })) : [{ a: atoms[0]!, i: 0 }];
  return (
    <>
      {visibles.map(({ a, i }) => {
        const en = ELEMS[a.el].en;
        let txt = a.el as string;
        let col = "#e6eefb";
        if (ionico) {
          txt = `${a.el}${en === enMin ? "⁺" : "⁻"}`;
          col = en === enMin ? "#F87171" : "#60A5FA";
        } else if (categoria === "polar" && enMax !== enMin) {
          if (en === enMax) { txt = `${a.el} δ−`; col = "#60A5FA"; }
          else if (en === enMin) { txt = `${a.el} δ+`; col = "#F87171"; }
        } else {
          col = CAT_COLOR[categoria];
        }
        return <Etiqueta key={i} pos={[a.pos[0], a.pos[1] + ELEMS[a.el].radio + (ionico ? 0.95 : 0.35), a.pos[2]]} color={col}>{txt}</Etiqueta>;
      })}
    </>
  );
}

/* ── Escena completa ─────────────────────────────────────────────────── */
export default function EnlacesQuimicosScene(props: EnlacesSceneProps) {
  const key = `${props.molKey}-${props.resetNonce}`;

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [0, 1.2, 6.4], fov: 45 }}
    >
      {/* Suelo, luz de tres puntos y entorno que reflejar. */}
      {/* La altura sale de donde esta escena ya ponía su sombra de
          contacto: es donde su autor decidió que estaba el piso. */}
      <Escenario acento={props.accent} suelo={-2.2} />


      <group position={[0, 0.15, 0]} key={key}>
        {props.ionico ? <Ionico atoms={props.atoms} /> : <Covalente atoms={props.atoms} bonds={props.bonds} />}
        {!props.ionico && props.atoms.length === 2 && <NubeCompartida atoms={props.atoms} />}
        <Rotulos atoms={props.atoms} ionico={props.ionico} categoria={props.categoria} />
      </group>


      <OrbitControls
        enablePan={false}
        minDistance={4}
        maxDistance={11}
        minPolarAngle={Math.PI / 7}
        maxPolarAngle={Math.PI / 1.9}
        target={[0, -0.2, 0]}
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
