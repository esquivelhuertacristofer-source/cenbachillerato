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
import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { ELEMS_R, type MovAtom, type MovBond, type Elem } from "./reacciones-data";
import { Escenario } from "./_escenario";
import { ATOMO } from "./_vidrio";

export interface ConservacionSceneProps {
  reaccionKey: string;
  atoms: MovAtom[];
  reactBonds: MovBond[];
  prodBonds: MovBond[];
  progreso: number; // 0..1
  accent: string;
  autoRotate: boolean;
  resetNonce: number;
  /** Masa total (u) de reactivos y productos: lo que pesa la balanza. */
  masaReact: number;
  masaProd: number;
  /** Sistema abierto: la fracción gaseosa de los productos escapa y no se pesa. */
  abierto: boolean;
  /** Fracción de la masa de los productos que es gas (0..1). */
  fraccionGas: number;
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
      <meshPhysicalMaterial {...ATOMO} color={e.color} emissive={e.color} emissiveIntensity={0.12} />
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

/* ── Balanza: pesa reactivos (izq.) y productos (der.) ───────────────────
 * Con el sistema cerrado se queda nivelada: la masa se conserva. Con el
 * sistema abierto, el gas escapa del plato derecho y la balanza se inclina. */
const BEAM_L = 2.7;       // semialcance del brazo
const PIVOTE_Y = -2.55;
const MAX_INCL = 0.2;     // rad
const fmtU = (n: number) => n.toLocaleString("es-MX", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function Plato({ lado, texto, color, extra, estrecho }: { lado: -1 | 1; texto: string; color: string; extra?: string; estrecho: boolean }) {
  return (
    <group position={[lado * BEAM_L, 0, 0]}>
      <mesh position={[0, -0.35, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.7, 8]} />
        <meshStandardMaterial color="#9fb2c8" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.72, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.0, 0.85, 0.12, 36]} />
        <meshStandardMaterial color="#c4cdd8" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.65, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 0.03, 36]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} />
      </mesh>
      <Html position={[0, -0.32, 0]} center pointerEvents="none" zIndexRange={[20, 0]}>
        <div style={{ whiteSpace: "nowrap", padding: "4px 10px", borderRadius: 9, background: "rgba(4,10,22,0.88)", border: `1.5px solid ${color}`, color, fontWeight: 900, fontSize: estrecho ? 14 : 15, fontFamily: "system-ui, sans-serif", textAlign: "center", lineHeight: 1.25 }}>
          {texto}
          {extra && <div style={{ fontSize: 14, color: "#fbbf24" }}>{extra}</div>}
        </div>
      </Html>
    </group>
  );
}

function Balanza({ masaReact, masaProd, abierto, fraccionGas, progreso }: { masaReact: number; masaProd: number; abierto: boolean; fraccionGas: number; progreso: number }) {
  const { size } = useThree();
  const viga = useRef<THREE.Group>(null);
  const aguja = useRef<THREE.Mesh>(null);
  const ang = useRef(0);
  const escapado = abierto ? masaProd * fraccionGas * clamp01((progreso - 0.5) / 0.5) : 0;
  const pesoProd = masaProd - escapado;
  const objetivo = masaReact > 0 ? ((masaReact - pesoProd) / masaReact) * MAX_INCL * 5 : 0;
  const tope = Math.max(-MAX_INCL, Math.min(MAX_INCL, objetivo));

  useFrame((_, dt) => {
    ang.current += (tope - ang.current) * Math.min(1, dt * 5);
    if (viga.current) viga.current.rotation.z = ang.current;
    if (aguja.current) aguja.current.rotation.z = -ang.current * 2.2;
  });

  const nivelada = Math.abs(tope) < 0.004;
  const estrecho = size.width < 640;
  return (
    <group position={[0, PIVOTE_Y, 0]}>
      {/* columna y base */}
      <mesh position={[0, -0.6, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.2, 1.2, 20]} />
        <meshStandardMaterial color="#8da2b8" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, -1.2, 0]} receiveShadow>
        <cylinderGeometry args={[0.9, 1.0, 0.14, 32]} />
        <meshStandardMaterial color="#6f8399" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* aguja indicadora (verde = nivelada) */}
      <mesh ref={aguja} position={[0, 0.25, 0]}>
        <coneGeometry args={[0.07, 0.5, 12]} />
        <meshStandardMaterial color={nivelada ? "#34D399" : "#fbbf24"} emissive={nivelada ? "#34D399" : "#fbbf24"} emissiveIntensity={0.5} />
      </mesh>
      {/* brazo + platos (giran juntos) */}
      <group ref={viga}>
        <mesh castShadow>
          <boxGeometry args={[BEAM_L * 2, 0.1, 0.14]} />
          <meshStandardMaterial color="#c4cdd8" metalness={0.7} roughness={0.3} />
        </mesh>
        <Plato lado={-1} texto={`Reactivos ${fmtU(masaReact)} u`} color="#8AB4FF" estrecho={estrecho} />
        <Plato lado={1} texto={`Productos ${fmtU(pesoProd)} u`} color="#34D399" estrecho={estrecho} extra={escapado > 0.05 ? `escapó ${fmtU(escapado)} u de gas` : undefined} />
      </group>
    </group>
  );
}

/* ── Escena completa ─────────────────────────────────────────────────── */
export default function ConservacionMateriaScene(props: ConservacionSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [0, 0.4, 14.5], fov: 45 }}
    >
      {/* Suelo, luz de tres puntos y entorno que reflejar. */}
      {/* La altura sale de donde esta escena ya ponía su sombra de
          contacto: es donde su autor decidió que estaba el piso. */}
      <Escenario acento={props.accent} suelo={-3.85} />


      {/* Átomos a 72 %: dejan sitio a la balanza debajo y caben entre la barra y la misión. */}
      <group position={[0, 0.8, 0]} scale={0.72} key={`${props.reaccionKey}-${props.resetNonce}`}>
        <Reaccion atoms={props.atoms} reactBonds={props.reactBonds} prodBonds={props.prodBonds} progreso={props.progreso} />
      </group>
      <Balanza masaReact={props.masaReact} masaProd={props.masaProd} abierto={props.abierto} fraccionGas={props.fraccionGas} progreso={props.progreso} />


      <OrbitControls
        enablePan={false}
        minDistance={9}
        maxDistance={20}
        minPolarAngle={Math.PI / 7}
        maxPolarAngle={Math.PI / 1.9}
        target={[0, -0.6, 0]}
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
