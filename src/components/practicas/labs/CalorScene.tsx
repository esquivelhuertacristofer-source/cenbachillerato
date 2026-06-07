"use client";

/**
 * Escena 3D del laboratorio "Propagación del calor" (CNEYT-II·O4).
 *
 * Tres mecanismos, cada uno con su animación (toda dentro de useFrame, mutando
 * refs — nunca en el render — conforme a las reglas del React Compiler):
 *  - conduccion: barra segmentada cuyo gradiente de color (azul→rojo) avanza
 *    desde la flama átomo a átomo según escena.frac.
 *  - conveccion: tanque de fluido con partículas que suben calientes por el
 *    centro y bajan frías por los lados (celda de convección).
 *  - radiacion:  esfera caliente que emite anillos de onda que se expanden y se
 *    desvanecen; viaja sin medio.
 *  - comparar:   los tres lado a lado con etiquetas.
 *
 * Etiquetas con <Html> (NUNCA <Text> de drei: cuelga el chunk con Turbopack).
 */

import * as THREE from "three";
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Html, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { type Modo, type Escena } from "./calor-data";

type Pt = [number, number, number];

export interface CalorSceneProps {
  modo: Modo;
  escena: Escena;
  playing: boolean;
  modoColor: string;
  resetNonce: number;
}

const COLD = new THREE.Color("#2563eb");
const WARM = new THREE.Color("#f59e0b");
const HOT = new THREE.Color("#ef4444");

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

/* Mezcla azul→ámbar→rojo según calor 0..1 (mutando un color destino). */
function tintByHeat(out: THREE.Color, heat: number) {
  const h = clamp01(heat);
  if (h < 0.5) out.copy(COLD).lerp(WARM, h / 0.5);
  else out.copy(WARM).lerp(HOT, (h - 0.5) / 0.5);
}

/* ── CONDUCCIÓN: barra segmentada con flama en el extremo izquierdo ───────── */
const N_SEG = 16;

function BarraConduccion({ frac, playing }: { frac: number; playing: boolean }) {
  const refs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const flama = useRef<THREE.Mesh>(null);
  const tmp = useRef(new THREE.Color());
  const t = useRef(0);

  useFrame((_, dt) => {
    if (playing) t.current += dt;
    const reach = frac; // qué tan lejos llegó el calor (0..1)
    for (let i = 0; i < N_SEG; i++) {
      const x = i / (N_SEG - 1); // 0 = extremo caliente, 1 = frío
      // gradiente lineal ya formado (1-x), pero "abierto" sólo hasta donde llegó el calor
      const gate = clamp01((reach - x) * 3 + 1);
      const heat = (1 - x) * gate;
      const mat = refs.current[i];
      if (mat) {
        tintByHeat(tmp.current, heat);
        mat.color.lerp(tmp.current, 0.18);
        mat.emissive.copy(mat.color);
        mat.emissiveIntensity = 0.15 + heat * 0.6;
      }
    }
    if (flama.current) {
      const s = 1 + Math.sin(t.current * 12) * 0.12;
      flama.current.scale.set(s, 1 + Math.sin(t.current * 9) * 0.18, s);
    }
  });

  const segW = 0.7;
  const startX = -((N_SEG - 1) * segW) / 2;
  return (
    <group>
      {/* segmentos de la barra */}
      {Array.from({ length: N_SEG }).map((_, i) => (
        <mesh key={i} position={[startX + i * segW, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[segW * 0.96, 1.1, 1.1]} />
          <meshStandardMaterial
            ref={(m) => {
              refs.current[i] = m;
            }}
            color="#2563eb"
            roughness={0.35}
            metalness={0.55}
          />
        </mesh>
      ))}
      {/* flama en el extremo caliente */}
      <group position={[startX - 0.9, -0.1, 0]}>
        <mesh ref={flama}>
          <coneGeometry args={[0.34, 1.1, 18]} />
          <meshStandardMaterial color="#fb923c" emissive="#f97316" emissiveIntensity={1.4} roughness={0.5} transparent opacity={0.92} />
        </mesh>
        <pointLight position={[0, 0.3, 0]} intensity={3} distance={6} color="#fb923c" />
      </group>
      <Html position={[startX - 0.9, -1.3, 0]} center distanceFactor={12} style={{ pointerEvents: "none" }}>
        <div style={pillStyle("#fb923c")}>Foco de calor</div>
      </Html>
      <Html position={[-startX + 0.9, -1.3, 0]} center distanceFactor={12} style={{ pointerEvents: "none" }}>
        <div style={pillStyle("#60a5fa")}>Extremo frío</div>
      </Html>
    </group>
  );
}

/* ── CONVECCIÓN: tanque con partículas que circulan ──────────────────────── */
const N_PART = 26;

function TanqueConveccion({ frac, playing }: { frac: number; playing: boolean }) {
  const grp = useRef<(THREE.Group | null)[]>([]);
  const mats = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const t = useRef(0);
  const tmp = useRef(new THREE.Color());
  const placa = useRef<THREE.MeshStandardMaterial>(null);

  // fase inicial distribuida por partícula (determinista, sin random)
  const phases = useRef<number[]>(Array.from({ length: N_PART }, (_, i) => i / N_PART));

  useFrame((_, dt) => {
    const speed = 0.12 + frac * 0.32;
    if (playing) t.current += dt * speed;
    for (let i = 0; i < N_PART; i++) {
      const side = i % 2 === 0 ? 1 : -1; // mitad sube por la izquierda del centro, mitad por la derecha
      const ph = phases.current[i] ?? 0;
      const s = (t.current + ph) % 1; // 0..1 a lo largo del lazo
      // lazo rectangular: sube por el centro, cruza arriba, baja por el lado, cruza abajo
      let x: number;
      let y: number;
      const cx = 0.28 * side; // carril de subida cerca del centro
      const ex = 1.5 * side; // carril de bajada en el borde
      if (s < 0.4) {
        x = cx;
        y = -1.5 + (s / 0.4) * 3.0; // subiendo
      } else if (s < 0.5) {
        const u = (s - 0.4) / 0.1;
        x = cx + (ex - cx) * u;
        y = 1.5;
      } else if (s < 0.9) {
        const u = (s - 0.5) / 0.4;
        x = ex;
        y = 1.5 - u * 3.0; // bajando
      } else {
        const u = (s - 0.9) / 0.1;
        x = ex + (cx - ex) * u;
        y = -1.5;
      }
      const g = grp.current[i];
      if (g) g.position.set(x, y, ((i * 0.37) % 1.2) - 0.6);
      const m = mats.current[i];
      if (m) {
        const heat = clamp01((y + 1.5) / 3.0); // caliente abajo... pero al subir va perdiendo
        const tHeat = s < 0.5 ? 1 - heat * 0.4 : heat * 0.5; // subiendo: caliente; bajando: frío
        tintByHeat(tmp.current, tHeat);
        m.color.lerp(tmp.current, 0.2);
        m.emissive.copy(m.color);
        m.emissiveIntensity = 0.4;
      }
    }
    if (placa.current) {
      placa.current.emissiveIntensity = 0.6 + 0.4 * Math.abs(Math.sin(t.current * 6));
    }
  });

  return (
    <group>
      {/* paredes del tanque (translúcido) */}
      <mesh>
        <boxGeometry args={[3.6, 3.6, 2.0]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.06} roughness={0.1} metalness={0.1} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh>
        <boxGeometry args={[3.62, 3.62, 2.02]} />
        <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.18} />
      </mesh>
      {/* placa caliente abajo */}
      <mesh position={[0, -1.85, 0]} receiveShadow>
        <boxGeometry args={[3.6, 0.18, 2.0]} />
        <meshStandardMaterial ref={placa} color="#ef4444" emissive="#f97316" emissiveIntensity={0.8} roughness={0.5} />
      </mesh>
      {/* partículas del fluido */}
      {Array.from({ length: N_PART }).map((_, i) => (
        <group
          key={i}
          ref={(g) => {
            grp.current[i] = g;
          }}
        >
          <mesh>
            <sphereGeometry args={[0.16, 14, 14]} />
            <meshStandardMaterial
              ref={(m) => {
                mats.current[i] = m;
              }}
              color="#38bdf8"
              roughness={0.35}
            />
          </mesh>
        </group>
      ))}
      <Html position={[0, -2.3, 0]} center distanceFactor={12} style={{ pointerEvents: "none" }}>
        <div style={pillStyle("#ef4444")}>Base caliente</div>
      </Html>
    </group>
  );
}

/* ── RADIACIÓN: esfera caliente que emite anillos de onda ─────────────────── */
const N_RING = 5;

function EmisorRadiacion({ frac, playing, color }: { frac: number; playing: boolean; color: string }) {
  const rings = useRef<(THREE.Group | null)[]>([]);
  const ringMats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const core = useRef<THREE.MeshStandardMaterial>(null);
  const t = useRef(0);

  useFrame((_, dt) => {
    const rate = 0.25 + frac * 0.6;
    if (playing) t.current += dt * rate;
    for (let i = 0; i < N_RING; i++) {
      const s = (t.current + i / N_RING) % 1; // 0..1 ciclo de expansión
      const g = rings.current[i];
      if (g) {
        const scale = 0.6 + s * 4.2;
        g.scale.set(scale, scale, scale);
      }
      const m = ringMats.current[i];
      if (m) m.opacity = (1 - s) * 0.5 * (0.3 + frac);
    }
    if (core.current) {
      core.current.emissiveIntensity = 0.6 + frac * 2.2 + Math.sin(t.current * 8) * 0.15;
    }
  });

  return (
    <group>
      {/* cuerpo caliente */}
      <mesh castShadow>
        <sphereGeometry args={[0.85, 32, 32]} />
        <meshStandardMaterial ref={core} color="#ef4444" emissive="#f97316" emissiveIntensity={0.8} roughness={0.4} metalness={0.1} />
      </mesh>
      <pointLight intensity={2 + frac * 4} distance={12} color="#fb923c" />
      {/* anillos de onda electromagnética */}
      {Array.from({ length: N_RING }).map((_, i) => (
        <group
          key={i}
          ref={(g) => {
            rings.current[i] = g;
          }}
        >
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1, 0.035, 12, 64]} />
            <meshBasicMaterial
              ref={(m) => {
                ringMats.current[i] = m;
              }}
              color={color}
              transparent
              opacity={0.4}
            />
          </mesh>
          <mesh>
            <torusGeometry args={[1, 0.035, 12, 64]} />
            <meshBasicMaterial color={color} transparent opacity={0.25} />
          </mesh>
        </group>
      ))}
      <Html position={[0, -1.7, 0]} center distanceFactor={12} style={{ pointerEvents: "none" }}>
        <div style={pillStyle("#f472b6")}>Sin medio · viaja en el vacío</div>
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

function Contenido({ modo, escena, playing, modoColor, resetNonce }: CalorSceneProps) {
  const giro = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (giro.current && playing && modo !== "comparar" && modo !== "conduccion") {
      giro.current.rotation.y += dt * 0.08;
    }
  });

  return (
    <>
      <color attach="background" args={["#040912"]} />
      <fog attach="fog" args={["#040912", 22, 52]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[6, 9, 6]} intensity={1.3} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-6, 4, -4]} intensity={0.5} color={modoColor} />
      <Stars radius={80} depth={40} count={1000} factor={3} fade speed={0.4} />

      <group ref={giro} key={`${modo}-${resetNonce}`}>
        {modo === "conduccion" && <BarraConduccion frac={escena.frac} playing={playing} />}
        {modo === "conveccion" && <TanqueConveccion frac={escena.frac} playing={playing} />}
        {modo === "radiacion" && <EmisorRadiacion frac={escena.frac} playing={playing} color={modoColor} />}

        {modo === "comparar" && (
          <>
            <group position={[-5.2, 0, 0]} scale={0.62}>
              <BarraConduccion frac={1} playing={playing} />
            </group>
            <Etiqueta pos={[-5.2, 2.6, 0]} color="#fb923caa">Conducción · sólido</Etiqueta>

            <group position={[0, 0, 0]} scale={0.72}>
              <TanqueConveccion frac={1} playing={playing} />
            </group>
            <Etiqueta pos={[0, 2.9, 0]} color="#38bdf8aa">Convección · fluido</Etiqueta>

            <group position={[5.2, 0, 0]} scale={0.72}>
              <EmisorRadiacion frac={1} playing={playing} color="#f472b6" />
            </group>
            <Etiqueta pos={[5.2, 2.9, 0]} color="#f472b6aa">Radiación · vacío</Etiqueta>
          </>
        )}
      </group>

      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.0} position={[0, 6, 4]} scale={9} color="#bcd4ff" />
        <Lightformer form="rect" intensity={0.7} position={[6, 0, -4]} scale={7} color={modoColor} />
      </Environment>
      <OrbitControls enablePan={false} minDistance={6} maxDistance={36} autoRotate={false} />
      <EffectComposer>
        <Bloom intensity={0.55} luminanceThreshold={0.2} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.7} />
      </EffectComposer>
    </>
  );
}

export default function CalorScene(props: CalorSceneProps) {
  const cam: Pt =
    props.modo === "comparar"
      ? [0, 0.5, 17]
      : props.modo === "conduccion"
        ? [0, 1.2, 12]
        : [0, 0.5, 9];
  return (
    <Canvas key={props.modo} shadows dpr={[1, 2]} camera={{ position: cam, fov: 50 }} gl={{ antialias: true }} style={{ width: "100%", height: "100%" }}>
      <Contenido {...props} />
    </Canvas>
  );
}
