"use client";

/**
 * Escena 3D del laboratorio de Modelos atómicos (React Three Fiber).
 * Se carga de forma diferida (ssr:false) desde LabModelosAtomicos.tsx.
 *
 * LA HISTORIA DEL ÁTOMO COMO UN VIAJE: un solo lienzo y una cámara que viaja
 * de un modelo al siguiente.
 *   · DALTON (1808)      → esfera maciza e indivisible, pulida, sobre su soporte.
 *   · THOMSON (1904)     → «budín» translúcido positivo con electrones incrustados.
 *   · RUTHERFORD (1911)  → el EXPERIMENTO de la lámina de oro, con zoom del
 *                          aparato a la lámina y de la lámina al núcleo.
 *   · BOHR (1913)        → hidrógeno: órbitas r ∝ n², saltos y fotones de color real.
 *   · SCHRÖDINGER (1926) → nubes de probabilidad |ψ|² de orbitales s, p y d.
 *   · CONSTRUIR          → el átomo que arma el alumno (núcleo + capas).
 */

import * as THREE from "three";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PerformanceMonitor } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Escenario, calidadEscena } from "./_escenario";
import { Etiqueta, Halo, NucleoPBR, ELECTRON_COLOR, PROTON_COLOR } from "./modelos-atomicos-kit3d";
import { rugosidadPulida } from "./modelos-atomicos-texturas";
import { prng, type Metal } from "./modelos-atomicos-fisica";
import ExperimentoRutherford, { Y_SUELO_RUTHERFORD, type StatsRutherford } from "./modelos-atomicos-rutherford";
import AtomoBohr, { radioOrbita, type TransicionBohr } from "./modelos-atomicos-bohr";
import NubeOrbital, { type VistaOrbital } from "./modelos-atomicos-orbitales";

export type ModeloKey = "dalton" | "thomson" | "rutherford" | "bohr" | "schrodinger";
export type VistaEscena = ModeloKey | "construir";

export interface AtomoSceneProps {
  vista: VistaEscena;
  protones: number;
  neutrones: number;
  electrones: number;
  shells: number[]; // electrones por capa
  elementColor: string;
  accent: string; // color del área (hex) para luces
  autoRotate: boolean;
  resetNonce: number;
  /* Rutherford */
  etapa: 0 | 1 | 2;
  metal: Metal;
  kMeV: number;
  grosorUm: number;
  disparando: boolean;
  ritmo: number;
  limpiarNonce: number;
  onStats: (s: StatsRutherford) => void;
  /* Bohr */
  nivel: number;
  transicion: TransicionBohr | null;
  /** En Bohr: mostrar las capas del elemento elegido en lugar del hidrógeno. */
  bohrCapas: boolean;
  /* Schrödinger */
  orbital: VistaOrbital;
  zOrbital: number;
  separar: number;
  fases: boolean;
  nodos: boolean;
}

const R0 = 0.95; // radio de la primera capa (vista de capas)
const STEP = 0.52; // separación entre capas
const ELECTRON_R = 0.085;

/* ── Electrones en órbita (vista de capas) ───────────────────────────── */
interface OrbSpec {
  r: number;
  ux: number; uy: number; uz: number;
  vx: number; vy: number; vz: number;
  phase: number;
  speed: number;
}

function OrbitElectrones({ specs }: { specs: OrbSpec[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const m = ref.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < specs.length; i++) {
      const s = specs[i]!;
      const a = s.phase + t * s.speed;
      const c = Math.cos(a), sn = Math.sin(a);
      dummy.position.set(s.r * (c * s.ux + sn * s.vx), s.r * (c * s.uy + sn * s.vy), s.r * (c * s.uz + sn * s.vz));
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  if (!specs.length) return null;
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, specs.length]} castShadow>
      <sphereGeometry args={[ELECTRON_R, 20, 16]} />
      <meshPhysicalMaterial color={ELECTRON_COLOR} emissive="#2aa8ff" emissiveIntensity={1.5} roughness={0.2} clearcoat={1} />
    </instancedMesh>
  );
}

/** Átomo por capas (constructor y «capas del elemento» en Bohr). */
function AtomoCapas({ protones, neutrones, shells }: { protones: number; neutrones: number; shells: number[] }) {
  const { specs, rings } = useMemo(() => {
    const specs: OrbSpec[] = [];
    const rings: { r: number; rotX: number }[] = [];
    for (let s = 0; s < shells.length; s++) {
      const count = shells[s]!;
      if (!count) continue;
      const r = R0 + s * STEP;
      const phi = s * 0.5;
      const dir = s % 2 === 0 ? 1 : -1;
      const speed = dir * (0.95 / (s * 0.5 + 1));
      rings.push({ r, rotX: phi + Math.PI / 2 });
      for (let j = 0; j < count; j++) {
        specs.push({ r, ux: 1, uy: 0, uz: 0, vx: 0, vy: -Math.sin(phi), vz: Math.cos(phi), phase: (j / count) * Math.PI * 2, speed });
      }
    }
    return { specs, rings };
  }, [shells]);

  return (
    <group>
      <NucleoPBR protones={protones} neutrones={neutrones} rNucleon={0.1} />
      {rings.map((ring, i) => (
        <mesh key={i} rotation={[ring.rotX, 0, 0]}>
          <torusGeometry args={[ring.r, 0.014, 10, 160]} />
          <meshStandardMaterial color="#bfe6ff" emissive="#3aa0d8" emissiveIntensity={0.7} roughness={0.4} transparent opacity={0.7} />
        </mesh>
      ))}
      <OrbitElectrones specs={specs} />
    </group>
  );
}

/* ── Modelo de Dalton: esfera maciza e indivisible, pulida ───────────── */
function EsferaDalton({ color }: { color: string }) {
  const rug = useMemo(() => rugosidadPulida(), []);
  return (
    <group>
      {/* Dalton propuso una bola MACIZA E INDIVISIBLE, sin estructura interna:
          una bola de billar. Con barniz y un estudio que reflejar, se lee sola. */}
      <mesh castShadow position={[0, 0, 0]}>
        <sphereGeometry args={[1.3, 96, 64]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.22}
          roughnessMap={rug}
          metalness={0.05}
          clearcoat={1}
          clearcoatRoughness={0.05}
          sheen={0.25}
          sheenColor="#ffffff"
          envMapIntensity={1.35}
        />
      </mesh>
      {/* Soporte: un aro de latón sobre una peana */}
      <mesh position={[0, -1.24, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.46, 0.05, 20, 72]} />
        <meshStandardMaterial color="#b08d57" metalness={1} roughness={0.28} />
      </mesh>
      <mesh position={[0, -1.43, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.32, 0.4, 0.34, 48]} />
        <meshStandardMaterial color="#1d242d" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[0, -1.6, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.78, 0.82, 0.06, 64]} />
        <meshStandardMaterial color="#1d242d" metalness={0.7} roughness={0.35} />
      </mesh>
    </group>
  );
}

/* ── Modelo de Thomson: «budín» positivo translúcido + electrones ────── */
function puntosFibonacci(n: number, r: number, giro: number): number[] {
  const out: number[] = [];
  const ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = n === 1 ? 0 : 1 - (i / (n - 1)) * 2;
    const rr = Math.sqrt(1 - y * y);
    const th = ga * i + giro;
    out.push(Math.cos(th) * rr * r, y * r, Math.sin(th) * rr * r);
  }
  return out;
}

function EsferaThomson({ electrones, ligero }: { electrones: number; ligero: boolean }) {
  const radio = 1.45;
  const eRef = useRef<THREE.InstancedMesh>(null);
  const masH = useRef<THREE.InstancedMesh>(null);
  const masV = useRef<THREE.InstancedMesh>(null);
  const budin = useRef<THREE.Mesh>(null);
  const N_MAS = 22;

  // Thomson acomodó sus electrones en anillos concéntricos: dos capas esféricas.
  const base = useMemo(() => {
    const n = Math.max(electrones, 0);
    if (n <= 6) return puntosFibonacci(n, radio * 0.5, 0.3);
    const dentro = Math.ceil(n / 3);
    return [...puntosFibonacci(dentro, radio * 0.36, 0.7), ...puntosFibonacci(n - dentro, radio * 0.74, 0.2)];
  }, [electrones]);

  const mas = useMemo(() => {
    const rnd = prng(91);
    const out: number[] = [];
    for (let i = 0; i < N_MAS; i++) {
      const th = rnd() * Math.PI * 2, ph = Math.acos(2 * rnd() - 1), r = radio * (0.25 + 0.6 * Math.cbrt(rnd()));
      out.push(r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th));
    }
    return out;
  }, []);

  useEffect(() => {
    const o = new THREE.Object3D();
    for (let i = 0; i < N_MAS; i++) {
      o.position.set(mas[i * 3]!, mas[i * 3 + 1]!, mas[i * 3 + 2]!);
      o.rotation.set(i * 0.7, i * 1.3, 0);
      o.updateMatrix();
      masH.current?.setMatrixAt(i, o.matrix);
      masV.current?.setMatrixAt(i, o.matrix);
    }
    if (masH.current) masH.current.instanceMatrix.needsUpdate = true;
    if (masV.current) masV.current.instanceMatrix.needsUpdate = true;
  }, [mas]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const m = eRef.current;
    if (m) {
      for (let i = 0; i < electrones; i++) {
        const w = 0.045;
        dummy.position.set(
          base[i * 3]! + Math.sin(t * 1.6 + i) * w,
          base[i * 3 + 1]! + Math.sin(t * 1.9 + i * 1.7) * w,
          base[i * 3 + 2]! + Math.sin(t * 1.4 + i * 2.3) * w,
        );
        dummy.updateMatrix();
        m.setMatrixAt(i, dummy.matrix);
      }
      m.instanceMatrix.needsUpdate = true;
    }
    // el budín «respira» un poco: es una masa blanda, no un cristal
    if (budin.current) {
      const s = 1 + Math.sin(t * 1.1) * 0.012;
      budin.current.scale.set(s, 1 / s, s);
    }
  });

  return (
    <group>
      <mesh ref={budin} castShadow>
        <sphereGeometry args={[radio, 96, 64]} />
        {ligero ? (
          <meshPhysicalMaterial color="#ffb48a" transparent opacity={0.32} roughness={0.35} clearcoat={0.8} depthWrite={false} />
        ) : (
          <meshPhysicalMaterial
            color="#ffd9c2"
            transmission={1}
            thickness={1.3}
            roughness={0.1}
            ior={1.06}
            attenuationColor="#ff8a5c"
            attenuationDistance={4.5}
            emissive="#ff6a3a"
            emissiveIntensity={0.14}
            clearcoat={0.7}
            clearcoatRoughness={0.15}
            sheen={0.6}
            sheenColor="#ffe2cf"
          />
        )}
      </mesh>
      {/* La carga positiva repartida por todo el budín */}
      <instancedMesh ref={masH} args={[undefined, undefined, N_MAS]}>
        <boxGeometry args={[0.13, 0.036, 0.036]} />
        <meshStandardMaterial color="#ff8a5c" emissive="#ff5a2a" emissiveIntensity={0.9} roughness={0.4} />
      </instancedMesh>
      <instancedMesh ref={masV} args={[undefined, undefined, N_MAS]}>
        <boxGeometry args={[0.036, 0.13, 0.036]} />
        <meshStandardMaterial color="#ff8a5c" emissive="#ff5a2a" emissiveIntensity={0.9} roughness={0.4} />
      </instancedMesh>
      {electrones > 0 && (
        <instancedMesh ref={eRef} args={[undefined, undefined, electrones]} castShadow>
          <sphereGeometry args={[0.13, 28, 20]} />
          <meshPhysicalMaterial color={ELECTRON_COLOR} emissive="#1f8fe0" emissiveIntensity={1.8} roughness={0.15} clearcoat={1} />
        </instancedMesh>
      )}
    </group>
  );
}

/* ── Cámara que viaja entre puntos de vista ──────────────────────────── */
interface Toma {
  clave: string;
  pos: [number, number, number];
  target: [number, number, number];
}

function CamaraGuia({ toma }: { toma: Toma }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;
  const size = useThree((s) => s.size);
  const vuelo = useRef(true);
  const v = useMemo(() => ({ p: new THREE.Vector3(), t: new THREE.Vector3() }), []);

  useEffect(() => {
    vuelo.current = true;
  }, [toma.clave, size.width, size.height]);

  useEffect(() => {
    if (!controls) return undefined;
    const cancelar = () => {
      vuelo.current = false;
    };
    controls.addEventListener("start", cancelar);
    return () => controls.removeEventListener("start", cancelar);
  }, [controls]);

  useFrame((_, dt) => {
    if (!vuelo.current || !controls) return;
    const asp = size.width / Math.max(1, size.height);
    const f = asp < 1.2 ? Math.min(1.8, 1.15 / asp) : 1;
    v.t.set(...toma.target);
    v.p.set(...toma.pos).sub(v.t).multiplyScalar(f).add(v.t);
    const k = 1 - Math.exp(-Math.min(dt, 0.1) * 2.6);
    camera.position.lerp(v.p, k);
    controls.target.lerp(v.t, k);
    controls.update();
    if (camera.position.distanceTo(v.p) < 0.01 && controls.target.distanceTo(v.t) < 0.005) vuelo.current = false;
  });
  return null;
}

/** Al cambiar de modelo, el nuevo entra creciendo suavemente. */
function Entrada({ children }: { children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    const o = g.current;
    if (!o) return;
    const s = THREE.MathUtils.damp(o.scale.x, 1, 5, Math.min(dt, 0.1));
    o.scale.setScalar(s > 0.999 ? 1 : s);
  });
  return (
    <group ref={g} scale={0.72}>
      {children}
    </group>
  );
}

/* ── Escena completa ─────────────────────────────────────────────────── */
export default function ModelosAtomicosScene(props: AtomoSceneProps) {
  const { vista } = props;
  const velo = useRef<HTMLDivElement>(null);
  const ponerVelo = useCallback((o: number) => {
    const v = velo.current;
    if (v) v.style.opacity = o.toFixed(3);
  }, []);
  const [dpr, setDpr] = useState(1.75);
  const ligero = useMemo(() => {
    if (typeof window === "undefined") return false;
    return calidadEscena() === "baja" || window.innerWidth < 640;
  }, []);

  // Altura del piso por modelo (cada sujeto se apoya o flota a su manera).
  const suelo =
    vista === "dalton" ? -1.63 :
    vista === "thomson" ? -1.9 :
    vista === "rutherford" ? Y_SUELO_RUTHERFORD :
    vista === "bohr" ? -2.4 :
    vista === "schrodinger" ? -4.2 : -2.6;

  const enCapas = vista === "construir" || (vista === "bohr" && props.bohrCapas);

  // La toma de cámara de cada modelo (y de cada escala/nivel).
  const nRef = Math.min(6, props.nivel + 1);
  const dBohr = 2.2 + 2.5 * radioOrbita(nRef);
  const toma: Toma =
    vista === "dalton" ? { clave: "dalton", pos: [0, 0.7, 6.4], target: [0, -0.2, 0] } :
    vista === "thomson" ? { clave: "thomson", pos: [0.5, 0.9, 6.1], target: [0, 0, 0] } :
    vista === "rutherford"
      ? props.etapa === 0 ? { clave: "r0", pos: [2.4, 5.1, 8.6], target: [-0.9, -0.35, 0] }
      : props.etapa === 1 ? { clave: "r1", pos: [4.4, 2.3, 5.8], target: [0, 0, 0] }
      : { clave: "r2", pos: [0.3, 14.5, 9.5], target: [0, 0, 0.4] } :
    vista === "bohr"
      ? enCapas ? { clave: "bohr-capas", pos: [0, 1.6, 8], target: [0, -0.2, 0] }
      : { clave: `bohr-${nRef}`, pos: [0, dBohr * 0.62, dBohr], target: [0, 0, 0] } :
    vista === "schrodinger" ? { clave: "schro", pos: [5.0, 2.2, 6.6], target: [0, 0, 0] } :
    { clave: "construir", pos: [0, 1.6, 8], target: [0, -0.25, 0] };

  const giraSolo = props.autoRotate && (vista === "dalton" || vista === "thomson" || vista === "schrodinger" || vista === "construir");
  const atomoKey = `${vista}-${props.resetNonce}`;
  const nucleoVisible = props.protones + props.neutrones > 0;

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Canvas
        shadows
        dpr={[1, dpr]}
        gl={{ antialias: true, alpha: false, preserveDrawingBuffer: false, toneMapping: THREE.ACESFilmicToneMapping }}
        camera={{ position: [0, 1.6, 8], fov: 42, near: 0.05, far: 120 }}
      >
        <PerformanceMonitor onDecline={() => setDpr(1)} />
        <Escenario acento={props.accent} suelo={suelo} calidad={ligero ? "baja" : "media"} mesa={vista !== "schrodinger"} />

        <Entrada key={atomoKey}>
          {vista === "dalton" && <EsferaDalton color={props.elementColor} />}
          {vista === "thomson" && <EsferaThomson electrones={props.electrones} ligero={ligero} />}
          {vista === "rutherford" && (
            <ExperimentoRutherford
              etapa={props.etapa}
              metal={props.metal}
              kMeV={props.kMeV}
              grosorUm={props.grosorUm}
              disparando={props.disparando}
              ritmo={props.ritmo}
              limpiarNonce={props.limpiarNonce}
              onStats={props.onStats}
              ligero={ligero}
              onVelo={ponerVelo}
            />
          )}
          {vista === "bohr" && !enCapas && <AtomoBohr nivel={props.nivel} transicion={props.transicion} ligero={ligero} />}
          {vista === "schrodinger" && (
            <NubeOrbital vista={props.orbital} Z={props.zOrbital} separar={props.separar} fases={props.fases} nodos={props.nodos} ligero={ligero} />
          )}
          {enCapas && <AtomoCapas protones={props.protones} neutrones={props.neutrones} shells={props.shells} />}
        </Entrada>

        {/* Etiquetas: máx. 4 a la vez, en la punta de lo que nombran */}
        {vista === "dalton" && <Etiqueta pos={[0, 1.45, 0]} color="#94A3B8">Esfera maciza: sin partes</Etiqueta>}
        {vista === "thomson" && (
          <>
            <Etiqueta pos={[0, 1.6, 0]} color="#F59E0B">Esfera de carga positiva</Etiqueta>
            {props.electrones > 0 && <Etiqueta pos={[1.05, -0.2, 0.6]} color={ELECTRON_COLOR} lado="right">Electrones incrustados</Etiqueta>}
          </>
        )}
        {enCapas && nucleoVisible && (
          <Etiqueta pos={[0, 0.3 + 0.05 * Math.cbrt(props.protones + props.neutrones), 0]} color={PROTON_COLOR}>Núcleo (+)</Etiqueta>
        )}
        {enCapas && props.electrones > 0 && <Etiqueta pos={[R0, 0, 0]} color={ELECTRON_COLOR} lado="right">Capa n = 1</Etiqueta>}
        {vista === "construir" && !nucleoVisible && <Halo color="#5BC8FF" escala={1.4} opacidad={0.25} />}

        <OrbitControls
          makeDefault
          enablePan={false}
          enableDamping
          minDistance={vista === "bohr" ? 1.2 : vista === "rutherford" ? 2.2 : 3}
          maxDistance={vista === "rutherford" ? 24 : 18}
          minPolarAngle={vista === "schrodinger" ? 0.05 : Math.PI / 9}
          maxPolarAngle={vista === "schrodinger" ? Math.PI - 0.05 : Math.PI / 1.95}
          autoRotate={giraSolo}
          autoRotateSpeed={0.6}
        />
        <CamaraGuia toma={toma} />

        {!ligero && (
          <EffectComposer enableNormalPass={false} multisampling={4}>
            <Bloom intensity={0.75} luminanceThreshold={0.62} luminanceSmoothing={0.25} mipmapBlur radius={0.7} />
            <Vignette eskil={false} offset={0.3} darkness={0.45} />
          </EffectComposer>
        )}
      </Canvas>
      {/* Velo del zoom entre escalas (Rutherford): se oscurece a la mitad del salto */}
      <div
        ref={velo}
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0,
          background: "radial-gradient(circle at 50% 50%, rgba(255,214,140,0.28) 0%, rgba(5,14,28,0.92) 55%, #050e1c 100%)",
        }}
      />
    </div>
  );
}
