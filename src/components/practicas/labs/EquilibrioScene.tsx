"use client";

/**
 * Escena 3D del laboratorio "Equilibrio químico" (CNEYT-IV·O3).
 *
 * Cuatro modos, toda la animación dentro de useFrame mutando refs (nunca en el
 * render — reglas del React Compiler):
 *  - reversible:  recipiente con moléculas N₂O₄ ⇌ 2 NO₂. Las moléculas pasan de
 *    "unidas + azul" (N₂O₄) a "separadas + pardas" (2 NO₂) conforme escena.frac;
 *    dos barras laterales muestran las velocidades directa e inversa igualándose.
 *  - constante:   proceso Haber con un medidor vertical donde Q sube hasta la
 *    línea fija de Kc.
 *  - lechatelier: un pistón comprime el gas (2 NO₂ ⇌ N₂O₄) y el equilibrio se
 *    desplaza hacia el lado de menos moles de gas.
 *  - comparar:    una reacción reversible (llega al equilibrio) junto a una
 *    irreversible (se agota).
 *
 * Etiquetas con <Html> (NUNCA <Text> de drei: cuelga el chunk con Turbopack).
 */

import * as THREE from "three";
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Html, Stars, Line } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { type Modo, type Escena } from "./equilibrio-data";

type Pt = [number, number, number];

export interface EquilibrioSceneProps {
  modo: Modo;
  escena: Escena;
  playing: boolean;
  modoColor: string;
  resetNonce: number;
}

const AZUL = new THREE.Color("#3b82f6"); // N₂O₄ / N
const PARDO = new THREE.Color("#ea580c"); // NO₂

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
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

function Etiqueta({ pos, color, children, df = 14 }: { pos: Pt; color: string; children: React.ReactNode; df?: number }) {
  return (
    <Html position={pos} center distanceFactor={df} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div style={pillStyle(color)}>{children}</div>
    </Html>
  );
}

/* Caja de vidrio reutilizable (recipiente cerrado) */
function Caja({ s = 4 }: { s?: number }) {
  return (
    <group>
      <mesh>
        <boxGeometry args={[s, s, s]} />
        <meshStandardMaterial color="#7dd3fc" transparent opacity={0.05} roughness={0.05} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(s, s, s)]} />
        <lineBasicMaterial color="#7dd3fc" transparent opacity={0.4} />
      </lineSegments>
    </group>
  );
}

/* ── REVERSIBLE: N₂O₄ ⇌ 2 NO₂ ─────────────────────────────────────────────── */
const N_MOL = 14;

function Reversible({ frac, playing }: { frac: number; playing: boolean }) {
  const slots = useRef<(THREE.Group | null)[]>([]);
  const izq = useRef<(THREE.Mesh | null)[]>([]);
  const der = useRef<(THREE.Mesh | null)[]>([]);
  const matIzq = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const matDer = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const barDir = useRef<THREE.Mesh>(null);
  const barInv = useRef<THREE.Mesh>(null);
  const t = useRef(0);
  const tmp = useRef(new THREE.Color());

  const base = useRef<Pt[]>(
    Array.from({ length: N_MOL }, (_, i) => {
      const a = i * 2.39996; // ángulo áureo
      const r = 0.4 + (i % 4) * 0.42;
      return [Math.cos(a) * r, ((i % 5) - 2) * 0.62, Math.sin(a) * r];
    }),
  );

  useFrame((_, dt) => {
    if (playing) t.current += dt;
    // fracción de equilibrio: a frac=1 ~55 % de las moléculas son producto (NO₂)
    const prodFrac = 0.55 * frac;
    const prodCount = prodFrac * N_MOL;
    for (let i = 0; i < N_MOL; i++) {
      // "reducido" = qué tan disociada (producto) está esta molécula
      const reduced = clamp01(prodCount - i); // las primeras i moléculas se disocian primero
      const g = slots.current[i];
      const b = base.current[i] ?? [0, 0, 0];
      if (g) {
        const bob = playing ? Math.sin(t.current * 1.6 + i) * 0.12 : 0;
        g.position.set(b[0], b[1] + bob, b[2]);
        g.rotation.y = t.current * 0.4 + i;
      }
      // separación: unidas (N₂O₄) → separadas (2 NO₂)
      const sep = 0.16 + reduced * 0.34;
      const mi = izq.current[i];
      const md = der.current[i];
      if (mi) mi.position.x = -sep;
      if (md) md.position.x = sep;
      const ci = matIzq.current[i];
      const cd = matDer.current[i];
      tmp.current.copy(AZUL).lerp(PARDO, reduced);
      if (ci) {
        ci.color.lerp(tmp.current, 0.2);
        ci.emissive.copy(ci.color);
        ci.emissiveIntensity = 0.2 + reduced * 0.4;
      }
      if (cd) {
        cd.color.lerp(tmp.current, 0.2);
        cd.emissive.copy(cd.color);
        cd.emissiveIntensity = 0.2 + reduced * 0.4;
      }
    }
    // velocidades: directa ∝ reactivo restante; inversa ∝ producto. Se igualan en frac=1.
    const vDir = (1 - prodFrac) * (1 - 0.45 * frac) + 0.001;
    const vInv = prodFrac * (0.45 + 0.55 * frac) + 0.001;
    if (barDir.current) {
      const h = 0.3 + vDir * 3.2;
      barDir.current.scale.y = h;
      barDir.current.position.y = -2.6 + h / 2;
    }
    if (barInv.current) {
      const h = 0.3 + vInv * 3.2;
      barInv.current.scale.y = h;
      barInv.current.position.y = -2.6 + h / 2;
    }
  });

  return (
    <group>
      <Caja s={4.4} />
      {Array.from({ length: N_MOL }).map((_, i) => (
        <group
          key={i}
          ref={(g) => {
            slots.current[i] = g;
          }}
        >
          <mesh
            ref={(m) => {
              izq.current[i] = m;
            }}
            position={[-0.16, 0, 0]}
          >
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshStandardMaterial
              ref={(m) => {
                matIzq.current[i] = m;
              }}
              color="#3b82f6"
              emissive="#3b82f6"
              emissiveIntensity={0.2}
              roughness={0.3}
            />
          </mesh>
          <mesh
            ref={(m) => {
              der.current[i] = m;
            }}
            position={[0.16, 0, 0]}
          >
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshStandardMaterial
              ref={(m) => {
                matDer.current[i] = m;
              }}
              color="#3b82f6"
              emissive="#3b82f6"
              emissiveIntensity={0.2}
              roughness={0.3}
            />
          </mesh>
        </group>
      ))}

      {/* Barras de velocidad */}
      <group position={[-3.5, 0, 0]}>
        <mesh ref={barDir}>
          <boxGeometry args={[0.5, 1, 0.5]} />
          <meshStandardMaterial color="#fb923c" emissive="#fb923c" emissiveIntensity={0.5} />
        </mesh>
      </group>
      <group position={[3.5, 0, 0]}>
        <mesh ref={barInv}>
          <boxGeometry args={[0.5, 1, 0.5]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.5} />
        </mesh>
      </group>
      <Etiqueta pos={[-3.5, 2.4, 0]} color="#fb923c">v directa →</Etiqueta>
      <Etiqueta pos={[3.5, 2.4, 0]} color="#38bdf8">← v inversa</Etiqueta>
      <Etiqueta pos={[0, 3.1, 0]} color="#fb923c">N₂O₄ ⇌ 2 NO₂</Etiqueta>
    </group>
  );
}

/* ── CONSTANTE: proceso Haber con medidor Q vs Kc ─────────────────────────── */
const N_HAB = 12;

function Constante({ frac, playing }: { frac: number; playing: boolean }) {
  const mols = useRef<(THREE.Group | null)[]>([]);
  const aguja = useRef<THREE.Mesh>(null);
  const t = useRef(0);

  const base = useRef<Pt[]>(
    Array.from({ length: N_HAB }, (_, i) => {
      const a = i * 2.39996;
      const r = 0.5 + (i % 3) * 0.5;
      return [Math.cos(a) * r, ((i % 4) - 1.5) * 0.7, Math.sin(a) * r];
    }),
  );

  useFrame((_, dt) => {
    if (playing) t.current += dt;
    // a frac sube, parte de las moléculas "se convierten" en NH₃ (se encogen y reaparecen)
    const conv = 0.5 * frac;
    for (let i = 0; i < N_HAB; i++) {
      const g = mols.current[i];
      const b = base.current[i] ?? [0, 0, 0];
      if (g) {
        const bob = playing ? Math.sin(t.current * 1.4 + i) * 0.14 : 0;
        g.position.set(b[0], b[1] + bob, b[2]);
        g.rotation.y = t.current * 0.5 + i;
        // las primeras moléculas son producto (más pequeñas), el resto reactivo
        const esProd = i / N_HAB < conv;
        g.scale.setScalar(esProd ? 0.7 : 1);
      }
    }
    // medidor: Q sube de 0 a Kc conforme frac → 1. La aguja recorre la barra.
    if (aguja.current) {
      const y = -2.6 + frac * 5.0; // de abajo (Q=0) a la línea Kc (arriba)
      aguja.current.position.y = y;
    }
  });

  return (
    <group>
      <Caja s={4.4} />
      {Array.from({ length: N_HAB }).map((_, i) => {
        const esN = i % 3 === 0;
        return (
          <group
            key={i}
            ref={(g) => {
              mols.current[i] = g;
            }}
          >
            {/* N₂ (azul doble) o H₂ (blanco doble) */}
            <mesh position={[-0.16, 0, 0]}>
              <sphereGeometry args={[esN ? 0.24 : 0.16, 16, 16]} />
              <meshStandardMaterial color={esN ? "#3b82f6" : "#e2e8f0"} emissive={esN ? "#1d4ed8" : "#64748b"} emissiveIntensity={0.3} roughness={0.3} />
            </mesh>
            <mesh position={[0.16, 0, 0]}>
              <sphereGeometry args={[esN ? 0.24 : 0.16, 16, 16]} />
              <meshStandardMaterial color={esN ? "#3b82f6" : "#e2e8f0"} emissive={esN ? "#1d4ed8" : "#64748b"} emissiveIntensity={0.3} roughness={0.3} />
            </mesh>
          </group>
        );
      })}

      {/* Medidor Q vs Kc */}
      <group position={[3.6, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.18, 5.2, 0.18]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        {/* línea fija de Kc (arriba) */}
        <mesh position={[0, 2.4, 0]}>
          <boxGeometry args={[0.9, 0.1, 0.4]} />
          <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={0.7} />
        </mesh>
        {/* aguja de Q */}
        <mesh ref={aguja} position={[0, -2.6, 0]}>
          <boxGeometry args={[0.7, 0.16, 0.4]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.8} />
        </mesh>
        <Etiqueta pos={[0, 2.9, 0]} color="#34d399">Kc</Etiqueta>
        <Etiqueta pos={[1.5, 0, 0]} color="#fbbf24">Q</Etiqueta>
      </group>
      <Etiqueta pos={[0, 3.1, 0]} color="#38bdf8">N₂ + 3 H₂ ⇌ 2 NH₃</Etiqueta>
    </group>
  );
}

/* ── LE CHÂTELIER: pistón que comprime 2 NO₂ ⇌ N₂O₄ ───────────────────────── */
const N_LC = 12;

function LeChatelier({ frac, playing }: { frac: number; playing: boolean }) {
  const piston = useRef<THREE.Group>(null);
  const slots = useRef<(THREE.Group | null)[]>([]);
  const izq = useRef<(THREE.Mesh | null)[]>([]);
  const der = useRef<(THREE.Mesh | null)[]>([]);
  const matIzq = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const matDer = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const t = useRef(0);
  const tmp = useRef(new THREE.Color());

  const base = useRef<Pt[]>(
    Array.from({ length: N_LC }, (_, i) => {
      const a = i * 2.39996;
      const r = 0.45 + (i % 3) * 0.4;
      return [Math.cos(a) * r, ((i % 4) - 1.5) * 0.5, Math.sin(a) * r];
    }),
  );

  useFrame((_, dt) => {
    if (playing) t.current += dt;
    // frac 0→0.5: el pistón baja (comprime). 0.5→1: el sistema responde uniendo NO₂→N₂O₄.
    const compresion = clamp01(frac / 0.5);
    const respuesta = clamp01((frac - 0.5) / 0.5);
    if (piston.current) {
      piston.current.position.y = 2.2 - compresion * 1.0;
    }
    const altoUtil = 1.9 - compresion * 0.9; // las moléculas se confinan
    for (let i = 0; i < N_LC; i++) {
      const g = slots.current[i];
      const b = base.current[i] ?? [0, 0, 0];
      if (g) {
        const bob = playing ? Math.sin(t.current * 1.6 + i) * 0.1 : 0;
        const y = Math.max(-altoUtil, Math.min(altoUtil, b[1])) + bob;
        g.position.set(b[0], y, b[2]);
        g.rotation.y = t.current * 0.4 + i;
      }
      // al responder, las moléculas se UNEN (NO₂ separadas/pardas → N₂O₄ juntas/azules)
      const unida = respuesta; // 0 separadas (NO₂), 1 unidas (N₂O₄)
      const sep = 0.5 - unida * 0.34;
      const mi = izq.current[i];
      const md = der.current[i];
      if (mi) mi.position.x = -sep;
      if (md) md.position.x = sep;
      const ci = matIzq.current[i];
      const cd = matDer.current[i];
      tmp.current.copy(PARDO).lerp(AZUL, unida);
      if (ci) {
        ci.color.lerp(tmp.current, 0.2);
        ci.emissive.copy(ci.color);
        ci.emissiveIntensity = 0.3;
      }
      if (cd) {
        cd.color.lerp(tmp.current, 0.2);
        cd.emissive.copy(cd.color);
        cd.emissiveIntensity = 0.3;
      }
    }
  });

  return (
    <group>
      {/* cilindro del pistón */}
      <mesh>
        <cylinderGeometry args={[2.0, 2.0, 5.0, 36, 1, true]} />
        <meshStandardMaterial color="#7dd3fc" transparent opacity={0.08} roughness={0.1} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[0, -2.5, 0]}>
        <cylinderGeometry args={[2.0, 2.0, 0.2, 36]} />
        <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* émbolo móvil */}
      <group ref={piston} position={[0, 2.2, 0]}>
        <mesh>
          <cylinderGeometry args={[1.95, 1.95, 0.3, 36]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.0, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 1.8, 16]} />
          <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>

      {Array.from({ length: N_LC }).map((_, i) => (
        <group
          key={i}
          ref={(g) => {
            slots.current[i] = g;
          }}
        >
          <mesh
            ref={(m) => {
              izq.current[i] = m;
            }}
            position={[-0.5, 0, 0]}
          >
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial
              ref={(m) => {
                matIzq.current[i] = m;
              }}
              color="#ea580c"
              emissive="#ea580c"
              emissiveIntensity={0.3}
              roughness={0.3}
            />
          </mesh>
          <mesh
            ref={(m) => {
              der.current[i] = m;
            }}
            position={[0.5, 0, 0]}
          >
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial
              ref={(m) => {
                matDer.current[i] = m;
              }}
              color="#ea580c"
              emissive="#ea580c"
              emissiveIntensity={0.3}
              roughness={0.3}
            />
          </mesh>
        </group>
      ))}
      <Etiqueta pos={[0, -3.0, 0]} color="#a78bfa">2 NO₂ ⇌ N₂O₄ (menos moles →)</Etiqueta>
    </group>
  );
}

/* ── COMPARAR: reversible vs irreversible ─────────────────────────────────── */
function Reaccionita({ irreversible, playing }: { irreversible: boolean; playing: boolean }) {
  const a = useRef<(THREE.Mesh | null)[]>([]);
  const matA = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const t = useRef(0);
  const tmp = useRef(new THREE.Color());
  const NN = 8;
  const base = useRef<Pt[]>(
    Array.from({ length: NN }, (_, i) => {
      const ang = i * 2.39996;
      const r = 0.5 + (i % 2) * 0.5;
      return [Math.cos(ang) * r, ((i % 3) - 1) * 0.7, Math.sin(ang) * r];
    }),
  );

  useFrame((_, dt) => {
    if (playing) t.current += dt;
    // reversible: oscila alrededor de ~50 % convertido. irreversible: tiende a 100 %.
    const ciclo = (Math.sin(t.current * 0.6) * 0.5 + 0.5); // 0..1
    const conv = irreversible ? clamp01(0.5 + t.current * 0.05) : 0.35 + ciclo * 0.25;
    for (let i = 0; i < NN; i++) {
      const m = a.current[i];
      const b = base.current[i] ?? [0, 0, 0];
      if (m) {
        const bob = playing ? Math.sin(t.current * 1.5 + i) * 0.12 : 0;
        m.position.set(b[0], b[1] + bob, b[2]);
      }
      const reduced = clamp01(conv * NN - i);
      const mt = matA.current[i];
      if (mt) {
        tmp.current.copy(AZUL).lerp(PARDO, reduced);
        mt.color.lerp(tmp.current, 0.2);
        mt.emissive.copy(mt.color);
        mt.emissiveIntensity = 0.3;
      }
    }
  });

  return (
    <group>
      <Caja s={3.2} />
      {Array.from({ length: NN }).map((_, i) => (
        <mesh
          key={i}
          ref={(m) => {
            a.current[i] = m;
          }}
        >
          <sphereGeometry args={[0.26, 16, 16]} />
          <meshStandardMaterial
            ref={(m) => {
              matA.current[i] = m;
            }}
            color="#3b82f6"
            emissive="#3b82f6"
            emissiveIntensity={0.3}
            roughness={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

function Contenido({ modo, escena, playing, modoColor, resetNonce }: EquilibrioSceneProps) {
  const giro = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (giro.current && playing && modo !== "comparar" && modo !== "lechatelier") {
      giro.current.rotation.y += dt * 0.08;
    }
  });

  return (
    <>
      <color attach="background" args={["#040912"]} />
      <fog attach="fog" args={["#040912", 22, 60]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[6, 9, 6]} intensity={1.3} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-6, 4, -4]} intensity={0.5} color={modoColor} />
      <Stars radius={80} depth={40} count={1000} factor={3} fade speed={0.4} />

      <group ref={giro} key={`${modo}-${resetNonce}`}>
        {modo === "reversible" && <Reversible frac={escena.frac} playing={playing} />}
        {modo === "constante" && <Constante frac={escena.frac} playing={playing} />}
        {modo === "lechatelier" && <LeChatelier frac={escena.frac} playing={playing} />}

        {modo === "comparar" && (
          <>
            <group position={[-4.0, 0, 0]}>
              <Reaccionita irreversible={false} playing={playing} />
            </group>
            <Etiqueta pos={[-4.0, 2.7, 0]} color="#34d399aa">Reversible ⇌ (equilibrio)</Etiqueta>
            <Line points={[[-4.6, -2.4, 0], [-3.4, -2.4, 0]]} color="#34d399" lineWidth={2} />

            <group position={[4.0, 0, 0]}>
              <Reaccionita irreversible playing={playing} />
            </group>
            <Etiqueta pos={[4.0, 2.7, 0]} color="#fb923caa">Irreversible → (se agota)</Etiqueta>
            <Line points={[[3.4, -2.4, 0], [4.6, -2.4, 0]]} color="#fb923c" lineWidth={2} />
          </>
        )}
      </group>

      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.0} position={[0, 6, 4]} scale={9} color="#bcd4ff" />
        <Lightformer form="rect" intensity={0.7} position={[6, 0, -4]} scale={7} color={modoColor} />
      </Environment>
      <OrbitControls enablePan={false} minDistance={6} maxDistance={42} autoRotate={false} />
      <EffectComposer>
        <Bloom intensity={0.55} luminanceThreshold={0.25} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.7} />
      </EffectComposer>
    </>
  );
}

export default function EquilibrioScene(props: EquilibrioSceneProps) {
  const cam: Pt =
    props.modo === "comparar"
      ? [0, 1.0, 16]
      : props.modo === "lechatelier"
        ? [0, 0.6, 12]
        : [0, 0.8, 12];
  return (
    <Canvas key={props.modo} shadows dpr={[1, 2]} camera={{ position: cam, fov: 50 }} gl={{ antialias: true }} style={{ width: "100%", height: "100%" }}>
      <Contenido {...props} />
    </Canvas>
  );
}
