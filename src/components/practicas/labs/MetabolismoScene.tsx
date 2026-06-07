"use client";

/**
 * Escena 3D del laboratorio "Metabolismo celular: respiración y fotosíntesis"
 * (CNEYT-VI-P03). Renderiza el organelo del proceso elegido y los nodos de cada
 * etapa, clicables:
 *  - respiracion:  mitocondria (cápsula con crestas) + nodos glucólisis/Krebs/cadena.
 *  - fotosintesis: cloroplasto (elipsoide con grana) + nodos fase lumínica/Calvin.
 *  - fermentacion: citosol (nube translúcida) + nodos glucólisis/fermentación.
 *
 * Las "moléculas de flujo" recorren la ruta metabólica y, al seleccionar una
 * etapa que produce ATP, orbitan fichas de ATP a su alrededor. Toda animación
 * ocurre dentro de useFrame mutando refs (nunca durante el render), conforme a
 * las reglas del React Compiler.
 */

import * as THREE from "three";
import { useRef, type ReactNode } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Html, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { T } from "./_kit";
import { type Proceso, etapaPorId, PROCESOS_DEF } from "./metabolismo-data";

type Pt = [number, number, number];

export interface MetabolismoSceneProps {
  proceso: Proceso;
  etapaActiva: string | null;
  onSelect: (id: string) => void;
  playing: boolean;
  accent: string;
  resetNonce: number;
}

/* ── Etiqueta flotante (Html) ─────────────────────────────────────────────── */
function Etiqueta({ pos, children, df = 11, fuerte = false, col }: { pos: Pt; children: ReactNode; df?: number; fuerte?: boolean; col?: string }) {
  return (
    <Html position={pos} center distanceFactor={df} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div
        style={{
          padding: fuerte ? "6px 12px" : "2px 8px",
          borderRadius: 8,
          background: fuerte ? "rgba(5,14,30,0.85)" : "rgba(5,14,30,0.55)",
          border: `1px solid ${col ?? T.lineStrong}`,
          color: col ?? T.text,
          fontSize: fuerte ? 16 : 12.5,
          fontWeight: fuerte ? 800 : 700,
          whiteSpace: "nowrap",
          letterSpacing: "0.01em",
          textShadow: "0 1px 4px rgba(0,0,0,0.7)",
          fontFamily: "ui-monospace, 'Cascadia Code', monospace",
        }}
      >
        {children}
      </div>
    </Html>
  );
}

/* ── Mitocondria (respiración) ────────────────────────────────────────────── */
function Mitocondria() {
  return (
    <group>
      {/* membrana externa */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[1.75, 3.4, 14, 32]} />
        <meshStandardMaterial color="#f97316" transparent opacity={0.12} emissive="#f97316" emissiveIntensity={0.18} roughness={0.3} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[1.77, 3.4, 8, 22]} />
        <meshBasicMaterial color="#fb923c" wireframe transparent opacity={0.16} />
      </mesh>
      {/* crestas (membrana interna plegada) */}
      {[-1.6, -0.95, -0.3, 0.35, 1.0, 1.65].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]} rotation={[0, 0, i % 2 === 0 ? Math.PI / 2 : -Math.PI / 2]}>
          <torusGeometry args={[1.05, 0.1, 8, 26, Math.PI * 1.25]} />
          <meshStandardMaterial color="#fdba74" emissive="#fb923c" emissiveIntensity={0.32} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Cloroplasto (fotosíntesis) ───────────────────────────────────────────── */
const GRANA: Pt[] = [
  [-1.1, 0.25, 0.7], [0.2, -0.35, 0.5], [1.2, 0.4, -0.3], [-0.3, 0.5, -0.6], [0.7, -0.2, -0.9],
];
function Cloroplasto() {
  return (
    <group>
      <mesh scale={[1.55, 0.92, 0.92]}>
        <sphereGeometry args={[2.0, 44, 44]} />
        <meshStandardMaterial color="#22c55e" transparent opacity={0.14} emissive="#16a34a" emissiveIntensity={0.18} roughness={0.3} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh scale={[1.55, 0.92, 0.92]}>
        <sphereGeometry args={[2.02, 32, 32]} />
        <meshBasicMaterial color="#4ade80" wireframe transparent opacity={0.14} />
      </mesh>
      {/* grana: pilas de tilacoides */}
      {GRANA.map((g, i) => (
        <group key={i} position={g}>
          {[0, 1, 2, 3].map((j) => (
            <mesh key={j} position={[0, (j - 1.5) * 0.16, 0]}>
              <cylinderGeometry args={[0.34, 0.34, 0.1, 22]} />
              <meshStandardMaterial color="#15803d" emissive="#16a34a" emissiveIntensity={0.42} roughness={0.5} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/* ── Citosol (fermentación) ───────────────────────────────────────────────── */
function Citosol() {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[2.7, 44, 44]} />
        <meshStandardMaterial color="#a855f7" transparent opacity={0.08} emissive="#a855f7" emissiveIntensity={0.12} roughness={0.2} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.72, 26, 26]} />
        <meshBasicMaterial color="#c084fc" wireframe transparent opacity={0.1} />
      </mesh>
    </group>
  );
}

/* ── Fichas de ATP que orbitan una etapa ──────────────────────────────────── */
function AtpTokens({ n, playing }: { n: number; playing: boolean }) {
  const g = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!g.current || !playing) return;
    g.current.rotation.y = state.clock.elapsedTime * 1.1;
  });
  const vis = Math.min(n, 9);
  return (
    <group ref={g}>
      {Array.from({ length: vis }).map((_, i) => {
        const a = (i / vis) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 1.05, 0.15, Math.sin(a) * 1.05]}>
            <octahedronGeometry args={[0.13, 0]} />
            <meshStandardMaterial color="#fde047" emissive="#facc15" emissiveIntensity={0.95} roughness={0.3} />
          </mesh>
        );
      })}
      <Etiqueta pos={[0, -0.95, 0]} df={13} col="#fde047">+{n} ATP</Etiqueta>
    </group>
  );
}

/* ── Nodo de etapa (clicable) ─────────────────────────────────────────────── */
function EtapaNodo({ id, pos, selected, playing, onSelect }: {
  id: string; pos: Pt; selected: boolean; playing: boolean; onSelect: (id: string) => void;
}) {
  const g = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!g.current) return;
    const t = state.clock.elapsedTime;
    const pulse = selected ? 1 + Math.sin(t * 4) * 0.09 : 1;
    g.current.scale.setScalar(pulse);
    g.current.rotation.y = t * (selected ? 0.8 : 0.3);
  });
  const def = etapaPorId(id);
  if (!def) return null;
  const emis = selected ? 1.0 : 0.4;
  return (
    <group position={pos}>
      <group
        ref={g}
        onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect(id); }}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { document.body.style.cursor = "default"; }}
      >
        <mesh>
          <icosahedronGeometry args={[0.5, 1]} />
          <meshStandardMaterial color={def.color} emissive={def.color} emissiveIntensity={emis} roughness={0.3} metalness={0.1} />
        </mesh>
        <mesh>
          <icosahedronGeometry args={[0.64, 1]} />
          <meshBasicMaterial color={def.color} wireframe transparent opacity={selected ? 0.55 : 0.22} />
        </mesh>
      </group>
      <Etiqueta pos={[0, 1.05, 0]} df={selected ? 11 : 13} fuerte={selected} col={selected ? def.color : T.text2}>
        {def.nombre}
      </Etiqueta>
      {selected && def.atp > 0 && <AtpTokens n={def.atp} playing={playing} />}
    </group>
  );
}

/* ── Moléculas que recorren la ruta metabólica ────────────────────────────── */
function Flujo({ puntos, color, playing }: { puntos: Pt[]; color: string; playing: boolean }) {
  const grp = useRef<THREE.Group>(null);
  const N = 5;
  useFrame((state) => {
    if (!grp.current || !playing || puntos.length < 2) return;
    const t = state.clock.elapsedTime;
    grp.current.children.forEach((c, i) => {
      const frac = (t * 0.15 + i / N) % 1;
      const seg = frac * (puntos.length - 1);
      const idx = Math.min(Math.floor(seg), puntos.length - 2);
      const local = seg - idx;
      const a = puntos[idx];
      const b = puntos[idx + 1];
      if (!a || !b) return;
      c.position.set(
        a[0] + (b[0] - a[0]) * local,
        a[1] + (b[1] - a[1]) * local,
        a[2] + (b[2] - a[2]) * local,
      );
    });
  });
  return (
    <group ref={grp}>
      {Array.from({ length: N }).map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.13, 14, 14]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Posición de los nodos de cada proceso ────────────────────────────────── */
const NODOS: Record<Proceso, { id: string; pos: Pt }[]> = {
  respiracion: [
    { id: "glucolisis", pos: [-3.7, 1.9, 0] },
    { id: "krebs", pos: [-0.1, 0.1, 0] },
    { id: "cadena", pos: [2.4, -0.3, 1.2] },
  ],
  fotosintesis: [
    { id: "luminica", pos: [-1.6, 0.3, 1.1] },
    { id: "calvin", pos: [1.9, 0.5, -0.3] },
  ],
  fermentacion: [
    { id: "glucolisis-ferm", pos: [-1.9, 0.7, 0] },
    { id: "fermentacion", pos: [1.9, -0.3, 0] },
  ],
};

/* ── Mundo (organelo + flujo + nodos), con giro suave ─────────────────────── */
function Mundo({ proceso, etapaActiva, playing, onSelect }: {
  proceso: Proceso; etapaActiva: string | null; playing: boolean; onSelect: (id: string) => void;
}) {
  const g = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!g.current) return;
    if (playing) g.current.rotation.y = state.clock.elapsedTime * 0.1;
  });
  const nodos = NODOS[proceso];
  const puntos = nodos.map((n) => n.pos);
  const col = PROCESOS_DEF[proceso].color;
  return (
    <group ref={g}>
      {proceso === "respiracion" && <Mitocondria />}
      {proceso === "fotosintesis" && <Cloroplasto />}
      {proceso === "fermentacion" && <Citosol />}
      <Flujo puntos={puntos} color={col} playing={playing} />
      {nodos.map((n) => (
        <EtapaNodo
          key={n.id}
          id={n.id}
          pos={n.pos}
          selected={etapaActiva === n.id}
          playing={playing}
          onSelect={onSelect}
        />
      ))}
    </group>
  );
}

/* ── Contenido de la escena ───────────────────────────────────────────────── */
function Contenido(props: MetabolismoSceneProps) {
  const { proceso, etapaActiva, playing, accent, resetNonce, onSelect } = props;
  return (
    <>
      <color attach="background" args={["#040912"]} />
      <fog attach="fog" args={["#040912", 16, 38]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[6, 8, 10]} intensity={1.1} />
      <directionalLight position={[-8, -4, 4]} intensity={0.35} color={accent} />
      <Stars radius={80} depth={40} count={1300} factor={3} saturation={0} fade speed={0.6} />

      <group key={`${proceso}-${resetNonce}`}>
        <Mundo proceso={proceso} etapaActiva={etapaActiva} playing={playing} onSelect={onSelect} />
      </group>

      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.2} position={[0, 4, 6]} scale={[10, 6, 1]} color="#bcd4ff" />
        <Lightformer form="rect" intensity={0.7} position={[-6, 0, 4]} scale={[6, 6, 1]} color={accent} />
      </Environment>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={6}
        maxDistance={20}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={(Math.PI * 4) / 5}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.55} luminanceThreshold={0.5} luminanceSmoothing={0.9} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.72} />
      </EffectComposer>
    </>
  );
}

/* ── Export por defecto: Canvas ───────────────────────────────────────────── */
export default function MetabolismoScene(props: MetabolismoSceneProps) {
  const cam: { position: Pt; fov: number } =
    props.proceso === "respiracion"
      ? { position: [0, 2.2, 11], fov: 46 }
      : props.proceso === "fotosintesis"
        ? { position: [0, 1.6, 9.5], fov: 46 }
        : { position: [0, 1.4, 8.5], fov: 48 };
  return (
    <Canvas key={props.proceso} dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={cam}>
      <Contenido {...props} />
    </Canvas>
  );
}
