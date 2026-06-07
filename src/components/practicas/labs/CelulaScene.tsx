"use client";

/**
 * Escena 3D del laboratorio "La célula en 3D: organelos y funciones"
 * (CNEYT-VI-P02). Renderiza una célula esquemática según el modo:
 *  - animal:     esfera con núcleo, mitocondrias, RE, Golgi, lisosomas, ribosomas.
 *  - vegetal:    caja con pared, vacuola central, cloroplastos y los demás organelos.
 *  - procariota: bastón (cápsula) con ADN circular flotante y ribosomas, sin núcleo.
 *
 * Los organelos internos son clicables: al hacer clic, la UI muestra su función.
 * La envoltura (membrana/pared) se resalta cuando se elige desde el panel.
 * Toda la animación ocurre dentro de useFrame mutando refs (nunca durante el
 * render), conforme a las reglas del React Compiler.
 */

import * as THREE from "three";
import { useRef, type ReactNode } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Html, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { T } from "./_kit";
import { type Modo, type Forma, organeloPorId, CELULAS } from "./celula-data";

type Pt = [number, number, number];

export interface CelulaSceneProps {
  modo: Modo;
  selected: string | null;
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
          padding: fuerte ? "6px 12px" : "2px 7px",
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

/* ── Geometría esquemática de cada organelo interno ───────────────────────── */
function FormaMesh({ forma, color, emis }: { forma: Forma; color: string; emis: number }) {
  switch (forma) {
    case "nucleo":
      return (
        <group>
          <mesh>
            <sphereGeometry args={[1.1, 40, 40]} />
            <meshStandardMaterial color={color} transparent opacity={0.42} emissive={color} emissiveIntensity={emis} roughness={0.4} />
          </mesh>
          <mesh>
            <sphereGeometry args={[1.12, 28, 28]} />
            <meshBasicMaterial color={color} wireframe transparent opacity={0.28} />
          </mesh>
          {/* nucléolo */}
          <mesh>
            <sphereGeometry args={[0.42, 24, 24]} />
            <meshStandardMaterial color="#7c3aed" emissive="#7c3aed" emissiveIntensity={0.55} roughness={0.3} />
          </mesh>
        </group>
      );
    case "mitocondria":
      return (
        <group rotation={[0, 0, Math.PI / 7]}>
          <mesh>
            <capsuleGeometry args={[0.5, 1.0, 8, 18]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emis} roughness={0.4} />
          </mesh>
          {[-0.3, 0, 0.3].map((y, i) => (
            <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.33, 0.05, 8, 20]} />
              <meshStandardMaterial color="#fdba74" emissive="#fb923c" emissiveIntensity={0.45} roughness={0.5} />
            </mesh>
          ))}
        </group>
      );
    case "cloroplasto":
      return (
        <group rotation={[0, 0, Math.PI / 2.4]}>
          <mesh scale={[1.3, 0.72, 0.72]}>
            <sphereGeometry args={[0.82, 28, 28]} />
            <meshStandardMaterial color={color} transparent opacity={0.88} emissive={color} emissiveIntensity={emis} roughness={0.4} />
          </mesh>
          {[-0.45, 0, 0.45].map((x, i) => (
            <group key={i} position={[x, 0, 0]}>
              {[0, 1, 2].map((j) => (
                <mesh key={j} position={[0, (j - 1) * 0.18, 0]}>
                  <cylinderGeometry args={[0.16, 0.16, 0.1, 16]} />
                  <meshStandardMaterial color="#15803d" emissive="#16a34a" emissiveIntensity={0.45} roughness={0.5} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      );
    case "re":
      return (
        <group>
          {[0, 1, 2].map((i) => (
            <mesh key={i} rotation={[Math.PI / 2, i * 0.5, i * 0.7]} position={[0, (i - 1) * 0.26, 0]}>
              <torusGeometry args={[0.62 + i * 0.12, 0.06, 10, 40, Math.PI * 1.45]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emis} roughness={0.45} />
            </mesh>
          ))}
        </group>
      );
    case "golgi":
      return (
        <group rotation={[0, 0, 0.18]}>
          {[0, 1, 2, 3].map((i) => {
            const s = 1 - i * 0.13;
            return (
              <mesh key={i} position={[0, (i - 1.5) * 0.22, 0]} scale={[s, 1, s * 0.7]}>
                <torusGeometry args={[0.52, 0.11, 12, 30, Math.PI * 1.25]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emis} roughness={0.45} />
              </mesh>
            );
          })}
        </group>
      );
    case "ribosomas":
      return (
        <group>
          {RIBO_OFFS.map((o, i) => (
            <mesh key={i} position={o}>
              <sphereGeometry args={[0.15, 14, 14]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emis * 0.6} roughness={0.5} />
            </mesh>
          ))}
        </group>
      );
    case "lisosoma":
      return (
        <mesh>
          <sphereGeometry args={[0.5, 26, 26]} />
          <meshStandardMaterial color={color} transparent opacity={0.88} emissive={color} emissiveIntensity={emis} roughness={0.4} />
        </mesh>
      );
    case "vacuola":
      return (
        <group>
          <mesh>
            <sphereGeometry args={[1.5, 40, 40]} />
            <meshStandardMaterial color={color} transparent opacity={0.2} emissive={color} emissiveIntensity={emis} roughness={0.15} />
          </mesh>
          <mesh>
            <sphereGeometry args={[1.51, 24, 24]} />
            <meshBasicMaterial color={color} wireframe transparent opacity={0.2} />
          </mesh>
        </group>
      );
    case "nucleoide":
      return (
        <group>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.9, 0.1, 12, 64]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emis} roughness={0.4} />
          </mesh>
          <mesh rotation={[Math.PI / 2.3, 0.6, 0.3]}>
            <torusGeometry args={[0.7, 0.08, 12, 56]} />
            <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={emis * 0.85} roughness={0.4} />
          </mesh>
        </group>
      );
    default:
      return null;
  }
}

const RIBO_OFFS: Pt[] = [
  [0, 0, 0], [0.34, 0.18, 0.1], [-0.3, 0.22, -0.12], [0.2, -0.3, 0.18],
  [-0.28, -0.24, 0.1], [0.42, -0.05, -0.2], [-0.1, 0.36, 0.22],
];

const ALTURA: Record<Forma, number> = {
  membrana: 3.3, pared: 3.5, nucleo: 1.5, mitocondria: 0.95, cloroplasto: 0.85,
  re: 1.0, golgi: 0.95, ribosomas: 0.6, lisosoma: 0.7, vacuola: 1.75, nucleoide: 1.2,
};

/* ── Organelo interno clicable ────────────────────────────────────────────── */
function Organelo({ id, pos, escala, selected, playing, onSelect }: {
  id: string; pos: Pt; escala: number; selected: boolean; playing: boolean; onSelect: (id: string) => void;
}) {
  const g = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!g.current) return;
    const t = state.clock.elapsedTime;
    const pulse = selected ? 1 + Math.sin(t * 4) * 0.07 : 1;
    g.current.scale.setScalar(escala * pulse);
    g.current.position.y = pos[1] + (playing ? Math.sin(t * 1.3 + pos[0]) * 0.05 : 0);
  });
  const def = organeloPorId(id);
  if (!def) return null;
  const emis = selected ? 0.95 : 0.28;
  return (
    <group ref={g} position={pos}>
      <group
        onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect(id); }}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { document.body.style.cursor = "default"; }}
      >
        <FormaMesh forma={def.forma} color={def.color} emis={emis} />
      </group>
      <Etiqueta pos={[0, ALTURA[def.forma], 0]} df={selected ? 11 : 13} fuerte={selected} col={selected ? def.color : T.text2}>
        {selected ? def.nombre : def.nombre.replace(" (RE)", "").replace(" (nucleoide)", "")}
      </Etiqueta>
    </group>
  );
}

/* ── Envoltura de la célula (membrana + pared) ────────────────────────────── */
function Envoltura({ modo, selected }: { modo: Modo; selected: string | null }) {
  const cel = CELULAS[modo];
  const membDef = organeloPorId("membrana")!;
  const paredDef = organeloPorId("pared")!;
  const selMemb = selected === "membrana";
  const selPared = selected === "pared";

  // material de la membrana (varía con la selección)
  const matMemb = (
    <meshStandardMaterial
      color={membDef.color}
      transparent
      opacity={selMemb ? 0.22 : 0.1}
      emissive={membDef.color}
      emissiveIntensity={selMemb ? 0.55 : 0.16}
      roughness={0.2}
      metalness={0.1}
      side={THREE.DoubleSide}
      depthWrite={false}
    />
  );
  const matPared = (
    <meshStandardMaterial
      color={paredDef.color}
      transparent
      opacity={selPared ? 0.18 : 0.07}
      emissive={paredDef.color}
      emissiveIntensity={selPared ? 0.4 : 0.1}
      roughness={0.5}
      side={THREE.DoubleSide}
      depthWrite={false}
    />
  );

  // membrana plasmática según el tipo de célula (JSX, no componente)
  let membrana: ReactNode;
  if (modo === "procariota") {
    membrana = (
      <group rotation={[0, 0, Math.PI / 2]}>
        <mesh><capsuleGeometry args={[1.7, 3.2, 12, 28]} />{matMemb}</mesh>
        <mesh><capsuleGeometry args={[1.72, 3.2, 8, 18]} /><meshBasicMaterial color={membDef.color} wireframe transparent opacity={selMemb ? 0.32 : 0.14} /></mesh>
      </group>
    );
  } else if (modo === "vegetal") {
    membrana = (
      <group>
        <mesh><boxGeometry args={[5.6, 5.6, 5.6]} />{matMemb}</mesh>
        <lineSegments><edgesGeometry args={[new THREE.BoxGeometry(5.6, 5.6, 5.6)]} /><lineBasicMaterial color={membDef.color} transparent opacity={selMemb ? 0.5 : 0.22} /></lineSegments>
      </group>
    );
  } else {
    membrana = (
      <group>
        <mesh><sphereGeometry args={[3.1, 48, 48]} />{matMemb}</mesh>
        <mesh><sphereGeometry args={[3.12, 30, 30]} /><meshBasicMaterial color={membDef.color} wireframe transparent opacity={selMemb ? 0.34 : 0.15} /></mesh>
      </group>
    );
  }

  // pared celular (solo vegetal y procariota)
  let pared: ReactNode = null;
  if (cel.conPared) {
    pared =
      modo === "procariota" ? (
        <group rotation={[0, 0, Math.PI / 2]}>
          <mesh><capsuleGeometry args={[1.92, 3.2, 12, 28]} />{matPared}</mesh>
          <mesh><capsuleGeometry args={[1.94, 3.2, 8, 18]} /><meshBasicMaterial color={paredDef.color} wireframe transparent opacity={selPared ? 0.45 : 0.16} /></mesh>
        </group>
      ) : (
        <group>
          <mesh><boxGeometry args={[6.2, 6.2, 6.2]} />{matPared}</mesh>
          <lineSegments><edgesGeometry args={[new THREE.BoxGeometry(6.2, 6.2, 6.2)]} /><lineBasicMaterial color={paredDef.color} transparent opacity={selPared ? 0.6 : 0.26} /></lineSegments>
        </group>
      );
  }

  return (
    <group>
      {pared}
      {membrana}
      {selMemb && <Etiqueta pos={[0, ALTURA.membrana, 0]} df={12} fuerte col={membDef.color}>{membDef.nombre}</Etiqueta>}
      {selPared && cel.conPared && <Etiqueta pos={[0, ALTURA.pared, 0]} df={12} fuerte col={paredDef.color}>{paredDef.nombre}</Etiqueta>}
    </group>
  );
}

/* ── Distribución de organelos internos por tipo de célula ────────────────── */
const LAYOUT: Record<Modo, { id: string; pos: Pt; escala: number }[]> = {
  animal: [
    { id: "nucleo", pos: [0, 0.2, 0], escala: 1 },
    { id: "mitocondria", pos: [1.8, -0.6, 0.5], escala: 0.95 },
    { id: "mitocondria", pos: [-1.6, -1.2, -0.6], escala: 0.8 },
    { id: "re", pos: [-1.5, 0.9, 0.5], escala: 0.9 },
    { id: "golgi", pos: [1.4, 1.3, -0.3], escala: 0.95 },
    { id: "ribosomas", pos: [0.4, -1.7, 0.8], escala: 1 },
    { id: "lisosoma", pos: [1.7, -1.6, -0.7], escala: 0.9 },
  ],
  vegetal: [
    { id: "vacuola", pos: [-0.4, -0.2, 0], escala: 1 },
    { id: "nucleo", pos: [1.7, 1.4, 0.3], escala: 0.78 },
    { id: "cloroplasto", pos: [-1.8, 1.5, 0.5], escala: 0.9 },
    { id: "cloroplasto", pos: [1.6, -1.7, -0.4], escala: 0.85 },
    { id: "mitocondria", pos: [2.0, 0.1, 0.6], escala: 0.78 },
    { id: "golgi", pos: [0.1, 2.0, -0.4], escala: 0.78 },
    { id: "re", pos: [1.1, -1.8, 0.4], escala: 0.78 },
    { id: "ribosomas", pos: [-1.9, -1.4, 0.5], escala: 0.9 },
  ],
  procariota: [
    { id: "nucleoide", pos: [0, 0, 0], escala: 0.85 },
    { id: "ribosomas", pos: [-1.6, 0.5, 0.3], escala: 0.7 },
    { id: "ribosomas", pos: [1.7, -0.4, 0.4], escala: 0.7 },
    { id: "ribosomas", pos: [0.6, 0.7, -0.5], escala: 0.6 },
  ],
};

/* ── Mundo (envoltura + organelos), con giro suave ────────────────────────── */
function Mundo({ modo, selected, playing, onSelect }: {
  modo: Modo; selected: string | null; playing: boolean; onSelect: (id: string) => void;
}) {
  const g = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!g.current) return;
    if (playing) g.current.rotation.y = state.clock.elapsedTime * 0.12;
  });
  return (
    <group ref={g}>
      <Envoltura modo={modo} selected={selected} />
      {LAYOUT[modo].map((it, i) => (
        <Organelo
          key={`${it.id}-${i}`}
          id={it.id}
          pos={it.pos}
          escala={it.escala}
          selected={selected === it.id}
          playing={playing}
          onSelect={onSelect}
        />
      ))}
    </group>
  );
}

/* ── Contenido de la escena ───────────────────────────────────────────────── */
function Contenido(props: CelulaSceneProps) {
  const { modo, selected, playing, accent, resetNonce, onSelect } = props;
  return (
    <>
      <color attach="background" args={["#040912"]} />
      <fog attach="fog" args={["#040912", 16, 36]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[6, 8, 10]} intensity={1.1} />
      <directionalLight position={[-8, -4, 4]} intensity={0.35} color={accent} />
      <Stars radius={80} depth={40} count={1400} factor={3} saturation={0} fade speed={0.6} />

      <group key={`${modo}-${resetNonce}`}>
        <Mundo modo={modo} selected={selected} playing={playing} onSelect={onSelect} />
      </group>

      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.2} position={[0, 4, 6]} scale={[10, 6, 1]} color="#bcd4ff" />
        <Lightformer form="rect" intensity={0.7} position={[-6, 0, 4]} scale={[6, 6, 1]} color={accent} />
      </Environment>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={6}
        maxDistance={18}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={(Math.PI * 4) / 5}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.5} luminanceThreshold={0.55} luminanceSmoothing={0.9} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.72} />
      </EffectComposer>
    </>
  );
}

/* ── Export por defecto: Canvas ───────────────────────────────────────────── */
export default function CelulaScene(props: CelulaSceneProps) {
  const cam =
    props.modo === "procariota"
      ? { position: [0, 1.2, 9.8] as Pt, fov: 48 }
      : { position: [0, 1.4, 9] as Pt, fov: 46 };
  return (
    <Canvas key={props.modo} dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={cam}>
      <Contenido {...props} />
    </Canvas>
  );
}
