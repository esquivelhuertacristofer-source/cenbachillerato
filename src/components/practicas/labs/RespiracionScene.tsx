"use client";

/**
 * Escena 3D del laboratorio "Respiración aerobia y anaerobia" (CNEYT-IV·O8).
 *
 * Cuatro modos; TODA la animación ocurre dentro de useFrame mutando refs (nunca
 * en el render — reglas del React Compiler):
 *  - glucolisis:  una glucosa (6 C) en el citoplasma se parte en 2 piruvato (3 C)
 *    conforme escena.frac; aparecen 2 ATP netos + 2 NADH (cosecha).
 *  - aerobia:     una mitocondria esquemática: el piruvato entra, gira el ciclo de
 *    Krebs, la cadena transportadora bombea H⁺, el O₂ forma H₂O y se cosechan ~38 ATP.
 *  - fermentacion: el piruvato acepta los e⁻ del NADH → lactato / etanol + CO₂,
 *    regenerando NAD⁺; solo 2 ATP.
 *  - comparar:    mitocondria (≈38 ATP) junto a citoplasma fermentando (2 ATP).
 *
 * Esquemática (no a escala). Etiquetas con <Html> (NUNCA <Text> de drei: cuelga
 * el chunk con Turbopack).
 */

import * as THREE from "three";
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Html, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { type Modo, type Escena } from "./respiracion-data";

type Pt = [number, number, number];

export interface RespiracionSceneProps {
  modo: Modo;
  escena: Escena;
  playing: boolean;
  modoColor: string;
  resetNonce: number;
}

const C_GLUCOSA = "#4ade80";
const C_PIRUVATO = "#fbbf24";
const C_ATP = "#fde047";
const C_CO2 = "#94a3b8";
const C_O2 = "#38bdf8";
const C_H2O = "#60a5fa";
const C_NADH = "#a78bfa";
const C_LACTATO = "#f472b6";
const C_ETANOL = "#2dd4bf";

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

/* Molécula esférica reutilizable */
function Mol({ r = 0.4, color, refMesh }: { r?: number; color: string; refMesh?: (m: THREE.Mesh | null) => void }) {
  return (
    <mesh ref={refMesh}>
      <sphereGeometry args={[r, 20, 20]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.3} metalness={0.1} />
    </mesh>
  );
}

/* ── Cosecha de monedas de ATP: aparecen conforme `vis` (0→1) ──────────────── */
function ATPStack({
  count,
  vis,
  playing,
  base = [0, 0, 0],
  cols = 4,
  color = C_ATP,
}: {
  count: number;
  vis: number;
  playing: boolean;
  base?: Pt;
  cols?: number;
  color?: string;
}) {
  const refs = useRef<(THREE.Group | null)[]>([]);
  const t = useRef(0);
  useFrame((_, dt) => {
    if (playing) t.current += dt;
    for (let i = 0; i < count; i++) {
      const g = refs.current[i];
      if (!g) continue;
      const target = clamp01(count * vis - i);
      g.scale.setScalar(g.scale.x + (target - g.scale.x) * 0.18);
      const row = Math.floor(i / cols);
      const col = i % cols;
      g.position.set(
        (base[0] ?? 0) + (col - (cols - 1) / 2) * 0.62,
        (base[1] ?? 0) + row * 0.62 + Math.sin(t.current * 2 + i) * 0.05 * target,
        base[2] ?? 0,
      );
    }
  });
  return (
    <group>
      {Array.from({ length: count }).map((_, i) => (
        <group
          key={i}
          scale={0}
          ref={(g) => {
            refs.current[i] = g;
          }}
        >
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.26, 0.26, 0.1, 18]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} roughness={0.25} metalness={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ── GLUCÓLISIS: glucosa (6C) → 2 piruvato (3C) ───────────────────────────── */
function Glucolisis({ frac, playing }: { frac: number; playing: boolean }) {
  const gluc = useRef<THREE.Group>(null);
  const pirA = useRef<THREE.Group>(null);
  const pirB = useRef<THREE.Group>(null);
  const t = useRef(0);
  // separación de piruvatos: 0 → 1 sobre la 2ª mitad de la animación
  const sep = clamp01((frac - 0.4) / 0.5);
  useFrame((_, dt) => {
    if (playing) t.current += dt;
    if (gluc.current) {
      gluc.current.scale.setScalar(1 - sep * 0.92);
      gluc.current.position.y = Math.sin(t.current * 1.4) * 0.1;
      gluc.current.rotation.y += dt * 0.4;
    }
    if (pirA.current) {
      pirA.current.scale.setScalar(sep);
      pirA.current.position.set(-1.6 * sep, Math.sin(t.current * 1.6) * 0.08, 0);
    }
    if (pirB.current) {
      pirB.current.scale.setScalar(sep);
      pirB.current.position.set(1.6 * sep, Math.sin(t.current * 1.6 + 1) * 0.08, 0);
    }
  });
  const atpVis = clamp01((frac - 0.6) / 0.4);
  const nadhVis = clamp01((frac - 0.55) / 0.4);
  return (
    <group>
      <Membrana label="Citoplasma" color="#38bdf8" rx={5.2} ry={3.4} />
      <group ref={gluc}>
        <Mol r={0.85} color={C_GLUCOSA} />
        <Etiqueta pos={[0, 1.35, 0]} color={`${C_GLUCOSA}cc`}>Glucosa · C₆H₁₂O₆</Etiqueta>
      </group>
      <group ref={pirA}>
        <Mol r={0.5} color={C_PIRUVATO} />
      </group>
      <group ref={pirB}>
        <Mol r={0.5} color={C_PIRUVATO} />
      </group>
      {sep > 0.5 && <Etiqueta pos={[0, -1.6, 0]} color={`${C_PIRUVATO}cc`}>2 piruvato (3 C)</Etiqueta>}
      <ATPStack count={2} vis={atpVis} playing={playing} base={[-2.6, 1.6, 0]} cols={2} />
      {atpVis > 0.5 && <Etiqueta pos={[-2.6, 2.6, 0]} color={`${C_ATP}cc`}>+2 ATP netos</Etiqueta>}
      <ATPStack count={2} vis={nadhVis} playing={playing} base={[2.6, 1.6, 0]} cols={2} color={C_NADH} />
      {nadhVis > 0.5 && <Etiqueta pos={[2.6, 2.6, 0]} color={`${C_NADH}cc`}>+2 NADH</Etiqueta>}
    </group>
  );
}

/* Membrana / contorno ovalado para representar un compartimento */
function Membrana({ label, color, rx, ry }: { label: string; color: string; rx: number; ry: number }) {
  const pts: Pt[] = [];
  const N = 64;
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2;
    pts.push([Math.cos(a) * rx, Math.sin(a) * ry, 0]);
  }
  const geo = new THREE.BufferGeometry().setFromPoints(pts.map((p) => new THREE.Vector3(...p)));
  return (
    <group>
      <lineLoop>
        <primitive object={geo} attach="geometry" />
        <lineBasicMaterial color={color} transparent opacity={0.5} />
      </lineLoop>
      <Etiqueta pos={[0, ry + 0.45, 0]} color={`${color}aa`} df={16}>
        {label}
      </Etiqueta>
    </group>
  );
}

/* ── AEROBIA: mitocondria con Krebs + cadena transportadora ───────────────── */
function Aerobia({ frac, playing }: { frac: number; playing: boolean }) {
  const piruvato = useRef<THREE.Group>(null);
  const krebs = useRef<THREE.Group>(null);
  const agua = useRef<THREE.Group>(null);
  const t = useRef(0);

  const entra = clamp01(frac / 0.25); // piruvato entra
  const giraKrebs = clamp01((frac - 0.25) / 0.4);
  const cadena = clamp01((frac - 0.45) / 0.35);
  const aguaVis = clamp01((frac - 0.65) / 0.3);
  const atpVis = clamp01((frac - 0.7) / 0.3);

  useFrame((_, dt) => {
    if (playing) t.current += dt;
    if (piruvato.current) {
      piruvato.current.position.x = -4.5 + entra * 3.0;
      piruvato.current.scale.setScalar(clamp01(1 - giraKrebs));
    }
    if (krebs.current && playing) krebs.current.rotation.z -= dt * 1.1 * (0.2 + giraKrebs);
    if (agua.current) {
      agua.current.scale.setScalar(aguaVis);
      agua.current.position.y = Math.sin(t.current * 1.6) * 0.08;
    }
  });

  // cresta (membrana interna plegada) como toroides
  return (
    <group>
      {/* doble membrana mitocondrial */}
      <Capsula color="#34d399" w={9.2} h={4.8} op={0.05} />
      <Capsula color="#34d399" w={8.2} h={3.9} op={0.0} wire />
      {/* piruvato entrando */}
      <group ref={piruvato} position={[-4.5, 0, 0]}>
        <Mol r={0.45} color={C_PIRUVATO} />
        <Etiqueta pos={[0, 0.95, 0]} color={`${C_PIRUVATO}cc`}>piruvato</Etiqueta>
      </group>

      {/* ciclo de Krebs: anillo de moléculas */}
      <group ref={krebs} position={[-1.6, 0, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.0, 0.07, 12, 40]} />
          <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={0.5} roughness={0.4} />
        </mesh>
        {Array.from({ length: 6 }).map((_, i) => {
          const a = i * 2.39996;
          return (
            <mesh key={i} position={[Math.cos(a), Math.sin(a), 0]}>
              <sphereGeometry args={[0.2, 14, 14]} />
              <meshStandardMaterial color={C_NADH} emissive={C_NADH} emissiveIntensity={0.6} roughness={0.3} />
            </mesh>
          );
        })}
      </group>
      {giraKrebs > 0.3 && <Etiqueta pos={[-1.6, 1.5, 0]} color="#34d399cc">Ciclo de Krebs</Etiqueta>}

      {/* CO2 saliendo */}
      {giraKrebs > 0.4 && (
        <>
          <group position={[-1.6, -1.7, 0]}>
            <Mol r={0.22} color={C_CO2} />
          </group>
          <Etiqueta pos={[-1.6, -2.3, 0]} color={`${C_CO2}cc`}>CO₂</Etiqueta>
        </>
      )}

      {/* cadena transportadora: 4 complejos */}
      <group position={[1.6, -0.2, 0]}>
        {Array.from({ length: 4 }).map((_, i) => {
          const lit = cadena > i / 4;
          return (
            <mesh key={i} position={[i * 0.85, 0, 0]}>
              <boxGeometry args={[0.5, 1.1, 0.5]} />
              <meshStandardMaterial color={lit ? C_O2 : "#1e3a4d"} emissive={C_O2} emissiveIntensity={lit ? 0.7 : 0.05} roughness={0.4} />
            </mesh>
          );
        })}
        {cadena > 0.2 && <Etiqueta pos={[1.3, 1.1, 0]} color={`${C_O2}cc`}>Cadena transportadora</Etiqueta>}
      </group>

      {/* O2 + H2O */}
      {cadena > 0.5 && (
        <group position={[4.4, -0.2, 0]}>
          <Mol r={0.28} color={C_O2} />
          <Etiqueta pos={[0, 0.8, 0]} color={`${C_O2}cc`}>O₂</Etiqueta>
        </group>
      )}
      <group ref={agua} position={[4.4, -1.6, 0]}>
        <Mol r={0.3} color={C_H2O} />
        <Etiqueta pos={[0, 0.75, 0]} color={`${C_H2O}cc`}>H₂O</Etiqueta>
      </group>

      {/* cosecha de ATP */}
      <ATPStack count={12} vis={atpVis} playing={playing} base={[-0.9, 2.0, 0]} cols={6} />
      {atpVis > 0.4 && <Etiqueta pos={[0, 3.4, 0]} color={`${C_ATP}cc`}>≈ 38 ATP</Etiqueta>}
    </group>
  );
}

/* Cápsula (estadio) para la mitocondria: dos semicírculos + lados */
function Capsula({ color, w, h, op, wire = false }: { color: string; w: number; h: number; op: number; wire?: boolean }) {
  const pts: Pt[] = [];
  const N = 80;
  const r = h / 2;
  const sx = w / 2 - r;
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2;
    const cx = a < Math.PI ? sx : -sx;
    // construir un estadio (rectángulo con extremos redondeados)
    const x = Math.cos(a) * r + cx;
    const y = Math.sin(a) * r;
    pts.push([x, y, 0]);
  }
  const geo = new THREE.BufferGeometry().setFromPoints(pts.map((p) => new THREE.Vector3(...p)));
  return (
    <group>
      <lineLoop>
        <primitive object={geo} attach="geometry" />
        <lineBasicMaterial color={color} transparent opacity={wire ? 0.35 : 0.6} />
      </lineLoop>
      {!wire && op > 0 && (
        <mesh>
          <boxGeometry args={[w, h, 0.02]} />
          <meshStandardMaterial color={color} transparent opacity={op} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

/* ── FERMENTACIÓN: piruvato → lactato / etanol + CO₂, regenera NAD⁺ ─────────── */
function Fermentacion({ frac, playing }: { frac: number; playing: boolean }) {
  const nadh = useRef<THREE.Group>(null);
  const prod = useRef<THREE.Group>(null);
  const t = useRef(0);
  const conv = clamp01((frac - 0.4) / 0.5);
  useFrame((_, dt) => {
    if (playing) t.current += dt;
    if (nadh.current) {
      // el NADH viaja del piruvato y vuelve como NAD+ (bucle)
      const a = t.current * 1.2;
      nadh.current.position.set(Math.cos(a) * 1.4, Math.sin(a) * 0.9 + 0.2, 0);
    }
    if (prod.current) {
      prod.current.scale.setScalar(conv);
      prod.current.position.y = -1.4 + Math.sin(t.current * 1.5) * 0.06 * conv;
    }
  });
  return (
    <group>
      <Membrana label="Citoplasma (sin O₂)" color="#a78bfa" rx={5.2} ry={3.4} />
      {/* piruvato origen */}
      <group position={[-1.6, 0.4, 0]}>
        <Mol r={0.45} color={C_PIRUVATO} />
        <Etiqueta pos={[0, 0.95, 0]} color={`${C_PIRUVATO}cc`}>piruvato</Etiqueta>
      </group>
      {/* bucle de NADH ↔ NAD+ */}
      <group ref={nadh}>
        <Mol r={0.26} color={C_NADH} />
      </group>
      <Etiqueta pos={[0, 1.7, 0]} color={`${C_NADH}cc`}>NADH → NAD⁺ (se regenera)</Etiqueta>
      {/* productos */}
      <group ref={prod} position={[1.8, -1.4, 0]}>
        <Mol r={0.42} color={C_LACTATO} />
        <group position={[1.0, 0, 0]}>
          <Mol r={0.42} color={C_ETANOL} />
        </group>
        <group position={[1.9, 0.4, 0]}>
          <Mol r={0.2} color={C_CO2} />
        </group>
      </group>
      {conv > 0.4 && <Etiqueta pos={[2.4, -2.4, 0]} color={`${C_LACTATO}cc`}>lactato · etanol + CO₂</Etiqueta>}
      {/* solo 2 ATP */}
      <ATPStack count={2} vis={1} playing={playing} base={[-3.2, 1.7, 0]} cols={2} />
      <Etiqueta pos={[-3.2, 2.6, 0]} color={`${C_ATP}cc`}>solo 2 ATP</Etiqueta>
    </group>
  );
}

/* ── COMPARAR: aerobia (≈38) vs anaerobia (2) ─────────────────────────────── */
function ComparaLado({ aerobia, playing }: { aerobia: boolean; playing: boolean }) {
  const t = useRef(0);
  const giro = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (playing) t.current += dt;
    if (giro.current) giro.current.rotation.z += dt * (aerobia ? 0.5 : 0.2);
  });
  return (
    <group>
      {aerobia ? <Capsula color="#34d399" w={4.6} h={3.0} op={0.05} /> : <Membrana label="" color="#a78bfa" rx={2.3} ry={1.6} />}
      <group ref={giro}>
        <Mol r={0.5} color={aerobia ? C_GLUCOSA : C_PIRUVATO} />
      </group>
      <ATPStack count={aerobia ? 12 : 2} vis={1} playing={playing} base={[0, -2.6, 0]} cols={aerobia ? 6 : 2} />
    </group>
  );
}

function Contenido({ modo, escena, playing, modoColor, resetNonce }: RespiracionSceneProps) {
  return (
    <>
      <color attach="background" args={["#040b12"]} />
      <fog attach="fog" args={["#040b12", 24, 64]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[6, 9, 6]} intensity={1.3} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-6, 4, -4]} intensity={0.5} color={modoColor} />
      <Stars radius={80} depth={40} count={1000} factor={3} fade speed={0.4} />

      <group key={`${modo}-${resetNonce}`}>
        {modo === "glucolisis" && <Glucolisis frac={escena.frac} playing={playing} />}
        {modo === "aerobia" && <Aerobia frac={escena.frac} playing={playing} />}
        {modo === "fermentacion" && <Fermentacion frac={escena.frac} playing={playing} />}

        {modo === "comparar" && (
          <>
            <group position={[-4.2, 0.4, 0]}>
              <ComparaLado aerobia playing={playing} />
            </group>
            <Etiqueta pos={[-4.2, 3.0, 0]} color="#34d399cc">Aerobia ≈ 38 ATP</Etiqueta>
            <group position={[4.2, 0.4, 0]}>
              <ComparaLado aerobia={false} playing={playing} />
            </group>
            <Etiqueta pos={[4.2, 3.0, 0]} color="#a78bfacc">Anaerobia · 2 ATP</Etiqueta>
          </>
        )}
      </group>

      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.0} position={[0, 6, 4]} scale={9} color="#bcd4ff" />
        <Lightformer form="rect" intensity={0.7} position={[6, 0, -4]} scale={7} color={modoColor} />
      </Environment>
      <OrbitControls enablePan={false} minDistance={7} maxDistance={44} autoRotate={false} />
      <EffectComposer>
        <Bloom intensity={0.55} luminanceThreshold={0.25} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.7} />
      </EffectComposer>
    </>
  );
}

export default function RespiracionScene(props: RespiracionSceneProps) {
  const cam: Pt =
    props.modo === "comparar" ? [0, 0.6, 16] : props.modo === "aerobia" ? [0, 0.8, 15] : [0, 0.6, 13];
  return (
    <Canvas key={props.modo} shadows dpr={[1, 2]} camera={{ position: cam, fov: 50 }} gl={{ antialias: true }} style={{ width: "100%", height: "100%" }}>
      <Contenido {...props} />
    </Canvas>
  );
}
