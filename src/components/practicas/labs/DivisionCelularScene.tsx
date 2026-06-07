"use client";

/**
 * Escena 3D del laboratorio "División celular: mitosis y meiosis" (CNEYT-VI·O5).
 *
 * Renderiza una célula con 2n = 4 (dos pares de homólogos) y, fase a fase,
 * coloca cada cromátida en su objetivo. Cada cromátida tiene un id ESTABLE entre
 * fases: la escena la mantiene montada (key={id}) y solo interpola (lerp) hacia
 * su nueva posición/rotación dentro de useFrame —nunca en el render—, conforme a
 * las reglas del React Compiler.
 *
 *  - mitosis:  Interfase → … → Citocinesis  ⇒ 2 células idénticas (2n).
 *  - meiosis:  Interfase → Profase I (crossing over) → … → Telofase II ⇒ 4 (n).
 *  - comparar: vista estática lado a lado.
 */

import * as THREE from "three";
import { useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Html, Line, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  type Modo,
  type EscenaVis,
  type Cromatida as CromatidaT,
  type Celula as CelulaT,
  COLOR_CENTROMERO,
} from "./division-celular-data";

type Pt = [number, number, number];

export interface DivisionCelularSceneProps {
  modo: Modo;
  escena: EscenaVis;
  playing: boolean;
  modoColor: string;
  resetNonce: number;
}

const LERP = 0.14;

/* ── Una cromátida: cápsula coloreada, con centrómero y tramo recombinado ── */
function Cromatida({ pos, rot, largo, color, colorPunta, condensada }: CromatidaT) {
  const ref = useRef<THREE.Group>(null);
  const init = useRef(false);
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    if (!init.current) {
      g.position.set(pos[0], pos[1], pos[2]);
      g.rotation.z = rot;
      init.current = true;
      return;
    }
    g.position.x += (pos[0] - g.position.x) * LERP;
    g.position.y += (pos[1] - g.position.y) * LERP;
    g.position.z += (pos[2] - g.position.z) * LERP;
    g.rotation.z += (rot - g.rotation.z) * LERP;
  });
  const radio = condensada ? 0.15 : 0.09;
  const len = Math.max(0.2, largo - radio * 2);
  return (
    <group ref={ref}>
      <mesh castShadow>
        <capsuleGeometry args={[radio, len, 6, 14]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={condensada ? 0.45 : 0.22} roughness={0.4} metalness={0.05} transparent opacity={condensada ? 1 : 0.85} />
      </mesh>
      {colorPunta && (
        <mesh position={[0, largo * 0.32, 0]} castShadow>
          <capsuleGeometry args={[radio * 1.02, len * 0.34, 6, 14]} />
          <meshStandardMaterial color={colorPunta} emissive={colorPunta} emissiveIntensity={0.5} roughness={0.4} />
        </mesh>
      )}
      {condensada && (
        <mesh>
          <sphereGeometry args={[radio * 1.25, 14, 14]} />
          <meshStandardMaterial color={COLOR_CENTROMERO} emissive={COLOR_CENTROMERO} emissiveIntensity={0.3} roughness={0.5} />
        </mesh>
      )}
    </group>
  );
}

/* ── Membrana celular (esfera translúcida que también interpola) ─────────── */
function Membrana({ c, r, color }: { c: Pt; r: number; color: string }) {
  const ref = useRef<THREE.Group>(null);
  const init = useRef(false);
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    if (!init.current) {
      g.position.set(c[0], c[1], c[2]);
      g.scale.setScalar(r);
      init.current = true;
      return;
    }
    g.position.x += (c[0] - g.position.x) * LERP;
    g.position.y += (c[1] - g.position.y) * LERP;
    g.position.z += (c[2] - g.position.z) * LERP;
    const s = g.scale.x + (r - g.scale.x) * LERP;
    g.scale.setScalar(s);
  });
  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color={color} transparent opacity={0.1} emissive={color} emissiveIntensity={0.25} roughness={0.2} metalness={0.1} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.005, 32, 32]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

/* ── Núcleo (esfera interior tenue) ───────────────────────────────────────── */
function Nucleo({ c }: { c: Pt }) {
  return (
    <mesh position={c}>
      <sphereGeometry args={[1.55, 24, 24]} />
      <meshStandardMaterial color="#a5b4fc" transparent opacity={0.12} emissive="#818cf8" emissiveIntensity={0.3} roughness={0.3} depthWrite={false} />
    </mesh>
  );
}

/* ── Polos del huso + fibras ─────────────────────────────────────────────── */
function Huso({ polos }: { polos: Pt[] }) {
  const out: ReactNode[] = [];
  for (let i = 0; i + 1 < polos.length; i += 2) {
    const a = polos[i]!;
    const b = polos[i + 1]!;
    out.push(<Line key={`f${i}`} points={[a, b]} color="#fbbf24" lineWidth={1.5} transparent opacity={0.28} dashed dashSize={0.25} gapSize={0.18} />);
    for (const p of [a, b]) {
      out.push(
        <mesh key={`p${p[0]}-${p[1]}`} position={p}>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial color="#fcd34d" emissive="#fbbf24" emissiveIntensity={0.8} roughness={0.4} />
        </mesh>,
      );
    }
  }
  return <group>{out}</group>;
}

/* ── Etiquetas para el modo comparar ─────────────────────────────────────── */
function Etiqueta({ pos, color, children }: { pos: Pt; color: string; children: ReactNode }) {
  return (
    <Html position={pos} center distanceFactor={14} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div style={{ padding: "5px 12px", borderRadius: 999, background: "rgba(4,10,22,0.82)", border: `1px solid ${color}`, color: "#fff", fontSize: 12, fontWeight: 800, whiteSpace: "nowrap", boxShadow: "0 6px 18px -8px #000" }}>
        {children}
      </div>
    </Html>
  );
}

function Contenido({ modo, escena, playing, modoColor, resetNonce }: DivisionCelularSceneProps) {
  const giro = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (giro.current && playing && modo !== "comparar") giro.current.rotation.y += dt * 0.06;
  });

  return (
    <>
      <color attach="background" args={["#040912"]} />
      <fog attach="fog" args={["#040912", 22, 48]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[6, 9, 6]} intensity={1.4} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-6, 4, -4]} intensity={0.5} color={modoColor} />
      <Stars radius={80} depth={40} count={1200} factor={3} fade speed={0.4} />

      <group ref={giro} key={`${modo}-${resetNonce}`}>
        {escena.celulas.map((cel: CelulaT, i: number) => (
          <Membrana key={`cel${i}`} c={cel.c} r={cel.r} color={modoColor} />
        ))}
        {escena.nucleos.map((n: Pt, i: number) => (
          <Nucleo key={`nuc${i}`} c={n} />
        ))}
        <Huso polos={escena.polos} />
        {escena.cromatidas.map((c: CromatidaT) => (
          <Cromatida key={c.id} {...c} />
        ))}
        {modo === "comparar" && (
          <>
            <Etiqueta pos={[0, 4.0, 0]} color="#34d399aa">Mitosis · 2 células idénticas (2n)</Etiqueta>
            <Etiqueta pos={[0, -4.0, 0]} color="#a78bfaaa">Meiosis · 4 gametos distintos (n)</Etiqueta>
          </>
        )}
      </group>

      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.1} position={[0, 6, 4]} scale={9} color="#bcd4ff" />
        <Lightformer form="rect" intensity={0.7} position={[6, 0, -4]} scale={7} color={modoColor} />
      </Environment>
      <OrbitControls enablePan={false} minDistance={9} maxDistance={34} autoRotate={false} />
      <EffectComposer>
        <Bloom intensity={0.5} luminanceThreshold={0.25} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.7} />
      </EffectComposer>
    </>
  );
}

export default function DivisionCelularScene(props: DivisionCelularSceneProps) {
  const cam: Pt = props.modo === "comparar" ? [0, 0, 18] : [0, 0.5, 16];
  return (
    <Canvas key={props.modo} shadows dpr={[1, 2]} camera={{ position: cam, fov: 50 }} gl={{ antialias: true }} style={{ width: "100%", height: "100%" }}>
      <Contenido {...props} />
    </Canvas>
  );
}
