"use client";

/**
 * Escena 3D del laboratorio "Reacciones redox y combustión" (CNEYT-IV·O5).
 *
 * Tres procesos, cada uno con su animación (toda dentro de useFrame, mutando
 * refs — nunca en el render — conforme a las reglas del React Compiler):
 *  - redox:      lámina de zinc dentro de una disolución azul de Cu²⁺; partículas
 *    de electrón viajan del Zn a los iones cobre, que se depositan como cobre
 *    rojizo conforme avanza escena.frac.
 *  - combustion: combustible + O₂ que se encienden y forman una llama con
 *    partículas de calor que ascienden; intensidad según escena.frac.
 *  - pila:       dos semiceldas (Zn|Zn²⁺ y Cu²⁺|Cu) unidas por un cable; los
 *    electrones recorren el cable del ánodo al cátodo y encienden un foco.
 *  - comparar:   los tres lado a lado con etiquetas.
 *
 * Etiquetas con <Html> (NUNCA <Text> de drei: cuelga el chunk con Turbopack).
 */

import * as THREE from "three";
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Html, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { type Modo, type Escena } from "./redox-data";

type Pt = [number, number, number];

export interface RedoxSceneProps {
  modo: Modo;
  escena: Escena;
  playing: boolean;
  modoColor: string;
  resetNonce: number;
}

const ZINC = new THREE.Color("#cbd5e1");
const COBRE = new THREE.Color("#d97706");
const AZUL_CU = new THREE.Color("#1d4ed8");

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

/* ── REDOX: lámina de zinc en disolución de Cu²⁺, electrones que viajan ────── */
const N_ELEC = 10;
const N_ION = 14;

function CeldaRedox({ frac, playing }: { frac: number; playing: boolean }) {
  const elecs = useRef<(THREE.Group | null)[]>([]);
  const iones = useRef<(THREE.Mesh | null)[]>([]);
  const ionMats = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const laminaMat = useRef<THREE.MeshStandardMaterial>(null);
  const solMat = useRef<THREE.MeshStandardMaterial>(null);
  const tmp = useRef(new THREE.Color());
  const t = useRef(0);

  const ePhase = useRef<number[]>(Array.from({ length: N_ELEC }, (_, i) => i / N_ELEC));
  const ionPos = useRef<Pt[]>(
    Array.from({ length: N_ION }, (_, i) => {
      const a = (i / N_ION) * Math.PI * 2;
      const r = 0.7 + (i % 3) * 0.45;
      return [0.9 + Math.cos(a) * r, Math.sin(a * 1.7) * 1.1, Math.sin(a) * r * 0.6];
    }),
  );

  useFrame((_, dt) => {
    if (playing) t.current += dt;
    // electrones viajan de la lámina (x≈-1.1) hacia los iones (x>0)
    for (let i = 0; i < N_ELEC; i++) {
      const ph = ePhase.current[i] ?? 0;
      const s = (t.current * 0.5 + ph) % 1;
      const g = elecs.current[i];
      if (g) {
        const x = -1.0 + s * 2.0;
        const y = Math.sin((ph + s) * Math.PI * 2) * 0.9;
        const z = Math.cos((ph * 5)) * 0.5;
        g.position.set(x, y, z);
        const vis = frac > 0.4 ? 1 : 0.0;
        g.scale.setScalar(0.0001 + vis * (0.7 + Math.sin(s * Math.PI) * 0.3));
      }
    }
    // iones Cu²⁺ → se reducen a cobre conforme frac sube (cambian azul→cobre y caen a la lámina)
    for (let i = 0; i < N_ION; i++) {
      const m = ionMats.current[i];
      const mesh = iones.current[i];
      const base = ionPos.current[i] ?? [0, 0, 0];
      const reduced = clamp01((frac - i / N_ION) * 2.2);
      if (m) {
        tmp.current.copy(AZUL_CU).lerp(COBRE, reduced);
        m.color.lerp(tmp.current, 0.15);
        m.emissive.copy(m.color);
        m.emissiveIntensity = 0.25 + reduced * 0.4;
      }
      if (mesh) {
        // al reducirse, migra hacia la lámina de zinc
        const tx = base[0] * (1 - reduced) + (-0.95) * reduced;
        const ty = base[1] * (1 - reduced) + (-1.2 + (i % 5) * 0.5) * reduced;
        const tz = base[2] * (1 - reduced);
        const bob = playing ? Math.sin(t.current * 2 + i) * 0.05 : 0;
        mesh.position.set(tx, ty + bob, tz);
      }
    }
    if (laminaMat.current) {
      // la lámina se oscurece/cobriza al depositarse cobre
      tmp.current.copy(ZINC).lerp(COBRE, clamp01(frac - 0.2) * 0.7);
      laminaMat.current.color.lerp(tmp.current, 0.05);
    }
    if (solMat.current) {
      // la disolución azul se aclara al consumirse el Cu²⁺
      solMat.current.opacity = 0.16 * (1 - frac * 0.5);
    }
  });

  return (
    <group>
      {/* vaso de precipitados (disolución translúcida azul) */}
      <mesh>
        <cylinderGeometry args={[2.0, 2.0, 3.2, 36, 1, true]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.08} roughness={0.1} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[2.02, 2.02, 3.2, 36, 1, true]} />
        <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.14} />
      </mesh>
      {/* disolución (volumen interior) */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[1.92, 1.92, 2.8, 36]} />
        <meshStandardMaterial ref={solMat} color="#1d4ed8" transparent opacity={0.16} roughness={0.2} depthWrite={false} />
      </mesh>
      {/* lámina de zinc */}
      <mesh position={[-1.1, 0, 0]} castShadow>
        <boxGeometry args={[0.16, 2.8, 1.2]} />
        <meshStandardMaterial ref={laminaMat} color="#cbd5e1" roughness={0.35} metalness={0.75} />
      </mesh>
      {/* iones Cu²⁺ */}
      {Array.from({ length: N_ION }).map((_, i) => (
        <mesh
          key={i}
          ref={(m) => {
            iones.current[i] = m;
          }}
        >
          <sphereGeometry args={[0.18, 14, 14]} />
          <meshStandardMaterial
            ref={(m) => {
              ionMats.current[i] = m;
            }}
            color="#1d4ed8"
            emissive="#1d4ed8"
            emissiveIntensity={0.25}
            roughness={0.3}
          />
        </mesh>
      ))}
      {/* electrones en tránsito */}
      {Array.from({ length: N_ELEC }).map((_, i) => (
        <group
          key={i}
          ref={(g) => {
            elecs.current[i] = g;
          }}
        >
          <mesh>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshBasicMaterial color="#fde047" />
          </mesh>
          <pointLight intensity={0.4} distance={2} color="#fde047" />
        </group>
      ))}
      <Html position={[-1.1, -2.1, 0]} center distanceFactor={12} style={{ pointerEvents: "none" }}>
        <div style={pillStyle("#cbd5e1")}>Zn → Zn²⁺ + 2e⁻ (se oxida)</div>
      </Html>
      <Html position={[1.0, 2.1, 0]} center distanceFactor={12} style={{ pointerEvents: "none" }}>
        <div style={pillStyle("#60a5fa")}>Cu²⁺ + 2e⁻ → Cu (se reduce)</div>
      </Html>
    </group>
  );
}

/* ── COMBUSTIÓN: combustible + O₂, chispa y llama ─────────────────────────── */
const N_LLAMA = 24;
const N_O2 = 8;

function Combustion({ frac, playing, color }: { frac: number; playing: boolean; color: string }) {
  const parts = useRef<(THREE.Group | null)[]>([]);
  const partMats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const o2 = useRef<(THREE.Group | null)[]>([]);
  const fuelMat = useRef<THREE.MeshStandardMaterial>(null);
  const luz = useRef<THREE.PointLight>(null);
  const t = useRef(0);

  const phase = useRef<number[]>(Array.from({ length: N_LLAMA }, (_, i) => i / N_LLAMA));
  const o2Phase = useRef<number[]>(Array.from({ length: N_O2 }, (_, i) => i / N_O2));

  const FUEGO = useRef(new THREE.Color("#f97316"));
  const AMAR = useRef(new THREE.Color("#fde047"));
  const ROJO = useRef(new THREE.Color("#ef4444"));
  const tmp = useRef(new THREE.Color());

  useFrame((_, dt) => {
    if (playing) t.current += dt;
    const intensidad = frac; // 0 sin fuego → 1 llama plena
    for (let i = 0; i < N_LLAMA; i++) {
      const ph = phase.current[i] ?? 0;
      const s = (t.current * (0.6 + intensidad * 0.8) + ph) % 1;
      const g = parts.current[i];
      if (g) {
        const spread = (1 - s) * 0.5;
        const x = Math.sin((ph + i) * 30) * spread;
        const z = Math.cos((ph + i) * 21) * spread;
        const y = -0.6 + s * (1.4 + intensidad * 2.2);
        g.position.set(x, y, z);
        const sc = (0.35 - s * 0.3) * (0.4 + intensidad);
        g.scale.setScalar(Math.max(0.0001, sc));
      }
      const m = partMats.current[i];
      if (m) {
        // base roja → amarillo arriba
        tmp.current.copy(ROJO.current).lerp(AMAR.current, s);
        if (s < 0.3) tmp.current.lerp(FUEGO.current, 0.5);
        m.color.copy(tmp.current);
        m.opacity = (1 - s) * intensidad;
      }
    }
    // moléculas de O₂ que orbitan y se consumen
    for (let i = 0; i < N_O2; i++) {
      const ph = o2Phase.current[i] ?? 0;
      const a = t.current * 0.5 + ph * Math.PI * 2;
      const g = o2.current[i];
      if (g) {
        const r = 2.4 - intensidad * 0.8;
        g.position.set(Math.cos(a) * r, -0.3 + Math.sin(a * 2) * 0.4, Math.sin(a) * r);
        g.scale.setScalar(0.0001 + (1 - intensidad) * 0.6 + 0.2);
      }
    }
    if (fuelMat.current) {
      fuelMat.current.emissiveIntensity = 0.2 + intensidad * 1.2;
    }
    if (luz.current) {
      luz.current.intensity = 0.5 + intensidad * 5 + (playing ? Math.sin(t.current * 14) * 0.3 : 0);
    }
  });

  return (
    <group>
      {/* mechero / combustible */}
      <mesh position={[0, -1.0, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.7, 0.6, 24]} />
        <meshStandardMaterial ref={fuelMat} color="#7c3aed" emissive={color} emissiveIntensity={0.3} roughness={0.5} metalness={0.3} />
      </mesh>
      <pointLight ref={luz} position={[0, 0.4, 0]} intensity={1} distance={10} color="#fb923c" />
      {/* partículas de llama */}
      {Array.from({ length: N_LLAMA }).map((_, i) => (
        <group
          key={i}
          ref={(g) => {
            parts.current[i] = g;
          }}
        >
          <mesh>
            <sphereGeometry args={[0.5, 10, 10]} />
            <meshBasicMaterial
              ref={(m) => {
                partMats.current[i] = m;
              }}
              color="#f97316"
              transparent
              opacity={0.8}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
      {/* moléculas de O₂ (dos esferas unidas) */}
      {Array.from({ length: N_O2 }).map((_, i) => (
        <group
          key={i}
          ref={(g) => {
            o2.current[i] = g;
          }}
        >
          <mesh position={[-0.12, 0, 0]}>
            <sphereGeometry args={[0.14, 12, 12]} />
            <meshStandardMaterial color="#22d3ee" emissive="#0891b2" emissiveIntensity={0.4} />
          </mesh>
          <mesh position={[0.12, 0, 0]}>
            <sphereGeometry args={[0.14, 12, 12]} />
            <meshStandardMaterial color="#22d3ee" emissive="#0891b2" emissiveIntensity={0.4} />
          </mesh>
        </group>
      ))}
      <Html position={[0, -1.8, 0]} center distanceFactor={12} style={{ pointerEvents: "none" }}>
        <div style={pillStyle("#fb923c")}>Combustible + O₂ → CO₂ + H₂O + calor</div>
      </Html>
    </group>
  );
}

/* ── PILA: dos semiceldas con cable y foco; electrones por el cable ───────── */
const N_FLUJO = 12;

function PilaGalvanica({ frac, playing }: { frac: number; playing: boolean }) {
  const elecs = useRef<(THREE.Group | null)[]>([]);
  const foco = useRef<THREE.MeshStandardMaterial>(null);
  const focoLuz = useRef<THREE.PointLight>(null);
  const t = useRef(0);
  const phase = useRef<number[]>(Array.from({ length: N_FLUJO }, (_, i) => i / N_FLUJO));

  // recorrido del cable: ánodo Zn (−2.4, 1.5) → arriba → foco (0,2.6) → cátodo Cu (2.4,1.5)
  const PATH: Pt[] = [
    [-2.4, 1.5, 0],
    [-2.4, 2.6, 0],
    [0, 2.6, 0],
    [2.4, 2.6, 0],
    [2.4, 1.5, 0],
  ];

  function onPath(s: number): Pt {
    const segs = PATH.length - 1;
    const f = clamp01(s) * segs;
    const i = Math.min(segs - 1, Math.floor(f));
    const u = f - i;
    const a = PATH[i] ?? [0, 0, 0];
    const b = PATH[i + 1] ?? a;
    return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, 0];
  }

  useFrame((_, dt) => {
    const on = frac > 0.3;
    if (playing && on) t.current += dt;
    for (let i = 0; i < N_FLUJO; i++) {
      const ph = phase.current[i] ?? 0;
      const s = (t.current * 0.3 + ph) % 1;
      const p = onPath(s);
      const g = elecs.current[i];
      if (g) {
        g.position.set(p[0], p[1], p[2]);
        g.scale.setScalar(on ? 0.7 : 0.0001);
      }
    }
    if (foco.current) {
      foco.current.emissiveIntensity = on ? 1.4 + (playing ? Math.sin(t.current * 10) * 0.3 : 0) : 0.05;
    }
    if (focoLuz.current) {
      focoLuz.current.intensity = on ? 3 : 0;
    }
  });

  return (
    <group>
      {/* puente salino */}
      <mesh position={[0, 0.6, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[1.6, 0.12, 12, 40, Math.PI]} />
        <meshStandardMaterial color="#a78bfa" roughness={0.4} transparent opacity={0.85} />
      </mesh>
      {/* semicelda izquierda (ánodo, Zn) */}
      <group position={[-2.4, -0.6, 0]}>
        <mesh>
          <cylinderGeometry args={[1.0, 1.0, 2.2, 28, 1, true]} />
          <meshStandardMaterial color="#94a3b8" transparent opacity={0.1} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.95, 0.95, 1.9, 28]} />
          <meshStandardMaterial color="#64748b" transparent opacity={0.18} depthWrite={false} />
        </mesh>
        <mesh position={[0, 1.1, 0]} castShadow>
          <boxGeometry args={[0.16, 2.6, 0.7]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.35} metalness={0.8} />
        </mesh>
      </group>
      {/* semicelda derecha (cátodo, Cu) */}
      <group position={[2.4, -0.6, 0]}>
        <mesh>
          <cylinderGeometry args={[1.0, 1.0, 2.2, 28, 1, true]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.1} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.95, 0.95, 1.9, 28]} />
          <meshStandardMaterial color="#1d4ed8" transparent opacity={0.2} depthWrite={false} />
        </mesh>
        <mesh position={[0, 1.1, 0]} castShadow>
          <boxGeometry args={[0.16, 2.6, 0.7]} />
          <meshStandardMaterial color="#d97706" roughness={0.35} metalness={0.8} />
        </mesh>
      </group>
      {/* cable */}
      {[
        { p: [-2.4, 2.05, 0] as Pt, s: [0.06, 1.1, 0.06] as Pt },
        { p: [-1.2, 2.6, 0] as Pt, s: [2.4, 0.06, 0.06] as Pt },
        { p: [1.2, 2.6, 0] as Pt, s: [2.4, 0.06, 0.06] as Pt },
        { p: [2.4, 2.05, 0] as Pt, s: [0.06, 1.1, 0.06] as Pt },
      ].map((seg, i) => (
        <mesh key={i} position={seg.p} scale={seg.s}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      {/* foco */}
      <mesh position={[0, 2.6, 0]}>
        <sphereGeometry args={[0.34, 20, 20]} />
        <meshStandardMaterial ref={foco} color="#fef9c3" emissive="#fde047" emissiveIntensity={0.05} roughness={0.3} transparent opacity={0.92} />
      </mesh>
      <pointLight ref={focoLuz} position={[0, 2.6, 0]} intensity={0} distance={8} color="#fde047" />
      {/* electrones por el cable */}
      {Array.from({ length: N_FLUJO }).map((_, i) => (
        <group
          key={i}
          ref={(g) => {
            elecs.current[i] = g;
          }}
        >
          <mesh>
            <sphereGeometry args={[0.1, 10, 10]} />
            <meshBasicMaterial color="#fde047" />
          </mesh>
        </group>
      ))}
      <Html position={[-2.4, -2.0, 0]} center distanceFactor={12} style={{ pointerEvents: "none" }}>
        <div style={pillStyle("#cbd5e1")}>Ánodo (−): Zn se oxida</div>
      </Html>
      <Html position={[2.4, -2.0, 0]} center distanceFactor={12} style={{ pointerEvents: "none" }}>
        <div style={pillStyle("#d97706")}>Cátodo (+): Cu²⁺ se reduce</div>
      </Html>
      <Html position={[0, 3.3, 0]} center distanceFactor={12} style={{ pointerEvents: "none" }}>
        <div style={pillStyle("#fde047")}>E°pila = +1.10 V</div>
      </Html>
    </group>
  );
}

function pillStyle(color: string): React.CSSProperties {
  return {
    padding: "4px 11px",
    borderRadius: 999,
    background: "rgba(4,10,22,0.82)",
    border: `1px solid ${color}`,
    color: "#fff",
    fontSize: 11,
    fontWeight: 800,
    whiteSpace: "nowrap",
    boxShadow: "0 6px 18px -8px #000",
  };
}

function Etiqueta({ pos, color, children }: { pos: Pt; color: string; children: React.ReactNode }) {
  return (
    <Html position={pos} center distanceFactor={16} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div style={pillStyle(color)}>{children}</div>
    </Html>
  );
}

function Contenido({ modo, escena, playing, modoColor, resetNonce }: RedoxSceneProps) {
  const giro = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (giro.current && playing && modo !== "comparar" && modo !== "pila") {
      giro.current.rotation.y += dt * 0.08;
    }
  });

  return (
    <>
      <color attach="background" args={["#040912"]} />
      <fog attach="fog" args={["#040912", 22, 54]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[6, 9, 6]} intensity={1.3} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-6, 4, -4]} intensity={0.5} color={modoColor} />
      <Stars radius={80} depth={40} count={1000} factor={3} fade speed={0.4} />

      <group ref={giro} key={`${modo}-${resetNonce}`}>
        {modo === "redox" && <CeldaRedox frac={escena.frac} playing={playing} />}
        {modo === "combustion" && <Combustion frac={escena.frac} playing={playing} color={modoColor} />}
        {modo === "pila" && <PilaGalvanica frac={escena.frac} playing={playing} />}

        {modo === "comparar" && (
          <>
            <group position={[-6.0, 0, 0]} scale={0.6}>
              <CeldaRedox frac={1} playing={playing} />
            </group>
            <Etiqueta pos={[-6.0, 2.9, 0]} color="#34d399aa">Redox · Zn + Cu²⁺</Etiqueta>

            <group position={[0, 0, 0]} scale={0.7}>
              <Combustion frac={1} playing={playing} color="#fb923c" />
            </group>
            <Etiqueta pos={[0, 3.0, 0]} color="#fb923caa">Combustión · CH₄ + O₂</Etiqueta>

            <group position={[6.0, 0, 0]} scale={0.58}>
              <PilaGalvanica frac={1} playing={playing} />
            </group>
            <Etiqueta pos={[6.0, 3.1, 0]} color="#38bdf8aa">Pila · Zn–Cu</Etiqueta>
          </>
        )}
      </group>

      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.0} position={[0, 6, 4]} scale={9} color="#bcd4ff" />
        <Lightformer form="rect" intensity={0.7} position={[6, 0, -4]} scale={7} color={modoColor} />
      </Environment>
      <OrbitControls enablePan={false} minDistance={6} maxDistance={40} autoRotate={false} />
      <EffectComposer>
        <Bloom intensity={0.6} luminanceThreshold={0.2} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.7} />
      </EffectComposer>
    </>
  );
}

export default function RedoxScene(props: RedoxSceneProps) {
  const cam: Pt =
    props.modo === "comparar"
      ? [0, 0.8, 19]
      : props.modo === "pila"
        ? [0, 1.0, 12]
        : [0, 0.6, 10];
  return (
    <Canvas key={props.modo} shadows dpr={[1, 2]} camera={{ position: cam, fov: 50 }} gl={{ antialias: true }} style={{ width: "100%", height: "100%" }}>
      <Contenido {...props} />
    </Canvas>
  );
}
