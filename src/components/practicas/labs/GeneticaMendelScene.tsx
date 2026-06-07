"use client";

/**
 * Escena 3D del laboratorio "Genética mendeliana: cuadro de Punnett"
 * (CNEYT-VI-P05). Renderiza el cuadro de Punnett en 3D según el modo:
 *  - monohibrido: grilla 2×2 con flores coloreadas por su fenotipo.
 *  - dihibrido:   grilla 4×4 con semillas (amarilla/verde · lisa/rugosa).
 *  - ligado:      grilla 2×2 con cromosomas sexuales (X / Y) e hijas/hijos.
 *
 * Toda la animación ocurre dentro de useFrame mutando refs (nunca durante el
 * render), conforme a las reglas del React Compiler.
 */

import * as THREE from "three";
import { useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Html, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { T, OK } from "./_kit";
import {
  type Modo, type Geno1, type GenoDi, type GenoMadre, type GenoPadre, type Herencia,
  resolverMono, resolverDi, resolverLig, HERENCIAS, FENO_DI,
} from "./genetica-mendel-data";

type Pt = [number, number, number];

export interface GeneticaMendelSceneProps {
  modo: Modo;
  monoP1: Geno1; monoP2: Geno1; herencia: Herencia;
  diP1: GenoDi; diP2: GenoDi;
  madre: GenoMadre; padre: GenoPadre;
  playing: boolean;
  accent: string;
  resetNonce: number;
}

/* ── Etiquetas flotantes (Html) ───────────────────────────────────────────── */
function Etiqueta({ pos, children, df = 11, fuerte = false, col }: { pos: Pt; children: ReactNode; df?: number; fuerte?: boolean; col?: string }) {
  return (
    <Html position={pos} center distanceFactor={df} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div
        style={{
          padding: fuerte ? "6px 12px" : "3px 8px",
          borderRadius: 9,
          background: fuerte ? "rgba(5,14,30,0.82)" : "rgba(5,14,30,0.6)",
          border: `1px solid ${col ?? T.lineStrong}`,
          color: col ?? T.text,
          fontSize: fuerte ? 17 : 14,
          fontWeight: 800,
          whiteSpace: "nowrap",
          letterSpacing: "0.01em",
          textShadow: "0 1px 4px rgba(0,0,0,0.6)",
          fontFamily: "ui-monospace, 'Cascadia Code', monospace",
        }}
      >
        {children}
      </div>
    </Html>
  );
}

/* ── Base de cada casilla del cuadro de Punnett ───────────────────────────── */
function Casilla({ pos, size, accent }: { pos: Pt; size: number; accent: string }) {
  return (
    <group position={pos}>
      <mesh position={[0, 0, -0.18]}>
        <boxGeometry args={[size, size, 0.18]} />
        <meshStandardMaterial color="#0b1a33" metalness={0.2} roughness={0.7} transparent opacity={0.9} />
      </mesh>
      {/* marco */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(size, size, 0.18)]} />
        <lineBasicMaterial color={accent} transparent opacity={0.5} />
      </lineSegments>
    </group>
  );
}

/* ── Flor (monohíbrido) ───────────────────────────────────────────────────── */
function Flor({ color, color2, seed, playing, escala = 1 }: { color: string; color2?: string; seed: number; playing: boolean; escala?: number }) {
  const g = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!g.current) return;
    const t = state.clock.elapsedTime;
    g.current.rotation.z = playing ? t * 0.5 + seed : seed * 0.6;
    g.current.position.z = playing ? Math.sin(t * 1.6 + seed) * 0.04 : 0;
  });
  const petalos = [0, 1, 2, 3, 4, 5];
  return (
    <group ref={g} scale={escala}>
      {petalos.map((i) => {
        const a = (i / petalos.length) * Math.PI * 2;
        const pc = color2 && i % 2 === 1 ? color2 : color;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.34, Math.sin(a) * 0.34, 0]} rotation={[0, 0, a]} scale={[0.34, 0.18, 0.16]}>
            <sphereGeometry args={[1, 18, 18]} />
            <meshStandardMaterial color={pc} roughness={0.45} metalness={0.05} emissive={pc} emissiveIntensity={0.12} />
          </mesh>
        );
      })}
      <mesh position={[0, 0, 0.06]}>
        <sphereGeometry args={[0.2, 20, 20]} />
        <meshStandardMaterial color="#fde047" emissive="#facc15" emissiveIntensity={0.5} roughness={0.4} />
      </mesh>
    </group>
  );
}

/* ── Semilla (dihíbrido): amarilla/verde · lisa/rugosa ────────────────────── */
function Semilla({ color, rugosa, seed, playing }: { color: string; rugosa: boolean; seed: number; playing: boolean }) {
  const g = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!g.current) return;
    const t = state.clock.elapsedTime;
    g.current.rotation.y = playing ? t * 0.6 + seed : seed;
  });
  return (
    <group ref={g}>
      <mesh>
        {rugosa
          ? <icosahedronGeometry args={[0.34, 1]} />
          : <sphereGeometry args={[0.34, 24, 24]} />}
        <meshStandardMaterial color={color} flatShading={rugosa} roughness={rugosa ? 0.85 : 0.35} metalness={0.05} emissive={color} emissiveIntensity={0.1} />
      </mesh>
    </group>
  );
}

/* ── Cromosomas (ligado al sexo) ──────────────────────────────────────────── */
function CromX({ color }: { color: string }) {
  // X = dos cápsulas cruzadas
  return (
    <group>
      {[Math.PI / 5, -Math.PI / 5].map((r, i) => (
        <mesh key={i} rotation={[0, 0, r]}>
          <capsuleGeometry args={[0.06, 0.5, 6, 12]} />
          <meshStandardMaterial color={color} roughness={0.5} emissive={color} emissiveIntensity={0.18} />
        </mesh>
      ))}
    </group>
  );
}
function CromY({ color }: { color: string }) {
  // Y = tallo + dos brazos cortos arriba
  return (
    <group>
      <mesh position={[0, -0.14, 0]}>
        <capsuleGeometry args={[0.06, 0.34, 6, 12]} />
        <meshStandardMaterial color={color} roughness={0.5} emissive={color} emissiveIntensity={0.18} />
      </mesh>
      {[Math.PI / 4, -Math.PI / 4].map((r, i) => (
        <mesh key={i} position={[0, 0.12, 0]} rotation={[0, 0, r]}>
          <capsuleGeometry args={[0.06, 0.22, 6, 12]} />
          <meshStandardMaterial color={color} roughness={0.5} emissive={color} emissiveIntensity={0.18} />
        </mesh>
      ))}
    </group>
  );
}
function ParCrom({ tipo, color, seed, playing }: { tipo: "XX" | "XY"; color: string; seed: number; playing: boolean }) {
  const g = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!g.current) return;
    const t = state.clock.elapsedTime;
    g.current.position.y = playing ? Math.sin(t * 1.4 + seed) * 0.05 : 0;
    g.current.rotation.y = playing ? Math.sin(t * 0.5 + seed) * 0.3 : 0;
  });
  return (
    <group ref={g}>
      <group position={[-0.32, 0, 0]} scale={0.92}><CromX color={color} /></group>
      <group position={[0.32, 0, 0]} scale={0.92}>{tipo === "XX" ? <CromX color={color} /> : <CromY color="#7dd3fc" />}</group>
    </group>
  );
}

/* ── Modo monohíbrido ─────────────────────────────────────────────────────── */
function EscenaMono({ p1, p2, herencia, playing, accent }: { p1: Geno1; p2: Geno1; herencia: Herencia; playing: boolean; accent: string }) {
  const r = resolverMono(p1, p2, herencia);
  const H = HERENCIAS[herencia];
  const SZ = 2.3;
  const X = [-1.35, 1.35];
  const Y = [1.35, -1.35];
  return (
    <group position={[0, -0.9, 0]}>
      {/* progenitores */}
      <group position={[-1.35, 4.5, 0]}>
        <Flor color={H[p1].color} color2={H[p1].color2} seed={1.1} playing={playing} escala={1.25} />
        <Etiqueta pos={[0, -0.95, 0]} df={12} fuerte col={accent}>♀ {p1}</Etiqueta>
      </group>
      <group position={[1.35, 4.5, 0]}>
        <Flor color={H[p2].color} color2={H[p2].color2} seed={2.4} playing={playing} escala={1.25} />
        <Etiqueta pos={[0, -0.95, 0]} df={12} fuerte col={accent}>♂ {p2}</Etiqueta>
      </group>
      <Etiqueta pos={[0, 4.5, 0]} df={14}>×</Etiqueta>

      {/* encabezados de gametos */}
      <Etiqueta pos={[-2.85, 2.85, 0]} df={13} col={T.text3}>gametos</Etiqueta>
      {r.gam2.map((a, i) => <Etiqueta key={`c${i}`} pos={[X[i]!, 2.85, 0]} df={11} fuerte col={accent}>{a}</Etiqueta>)}
      {r.gam1.map((a, i) => <Etiqueta key={`f${i}`} pos={[-2.85, Y[i]!, 0]} df={11} fuerte col={accent}>{a}</Etiqueta>)}

      {/* casillas */}
      {r.celdas.map((c, i) => {
        const col = i % 2; const row = Math.floor(i / 2);
        const pos: Pt = [X[col]!, Y[row]!, 0];
        const f = H[c.geno];
        return (
          <group key={i}>
            <Casilla pos={pos} size={SZ} accent={accent} />
            <group position={[pos[0], pos[1] + 0.25, 0.2]}>
              <Flor color={f.color} color2={f.color2} seed={i * 1.7 + 0.5} playing={playing} escala={1.15} />
            </group>
            <Etiqueta pos={[pos[0], pos[1] - 0.78, 0.2]} df={10} fuerte col={c.geno === "aa" ? "#fca5a5" : OK}>{c.geno}</Etiqueta>
          </group>
        );
      })}
    </group>
  );
}

/* ── Modo dihíbrido ───────────────────────────────────────────────────────── */
function EscenaDi({ p1, p2, playing, accent }: { p1: GenoDi; p2: GenoDi; playing: boolean; accent: string }) {
  const r = resolverDi(p1, p2);
  const SZ = 1.18;
  const STEP = 1.32;
  const coord = (k: number) => (k - 1.5) * STEP;
  return (
    <group position={[0, -0.2, 0]}>
      {/* título del cruce */}
      <Etiqueta pos={[0, 3.55, 0]} df={15} fuerte col={accent}>{p1} × {p2}</Etiqueta>

      {/* encabezados de gametos */}
      {r.gam2.map((a, i) => <Etiqueta key={`c${i}`} pos={[coord(i), 2.55, 0]} df={11} fuerte col={accent}>{a}</Etiqueta>)}
      {r.gam1.map((a, i) => <Etiqueta key={`f${i}`} pos={[-2.55, -coord(i), 0]} df={11} fuerte col={accent}>{a}</Etiqueta>)}

      {/* casillas (16) */}
      {r.celdas.map((c, i) => {
        const row = Math.floor(i / 4); const col = i % 4;
        const pos: Pt = [coord(col), -coord(row), 0];
        const fd = FENO_DI[c.feno];
        return (
          <group key={i}>
            <Casilla pos={pos} size={SZ} accent={accent} />
            <group position={[pos[0], pos[1] + 0.06, 0.25]}>
              <Semilla color={fd.color} rugosa={fd.rugosa} seed={i * 0.9} playing={playing} />
            </group>
            <Etiqueta pos={[pos[0], pos[1] - 0.42, 0.25]} df={9}>{c.genoA}{c.genoB}</Etiqueta>
          </group>
        );
      })}
    </group>
  );
}

/* ── Modo ligado al sexo ──────────────────────────────────────────────────── */
function EscenaLig({ madre, padre, playing, accent }: { madre: GenoMadre; padre: GenoPadre; playing: boolean; accent: string }) {
  const r = resolverLig(madre, padre);
  const SZ = 2.4;
  const X = [-1.4, 1.4];
  const Y = [1.4, -1.4];
  const FCOL: Record<string, string> = {
    hijaNormal: "#f9a8d4", hijaPortadora: "#c084fc", hijaDaltonica: "#ef4444",
    hijoNormal: "#60a5fa", hijoDaltonico: "#ef4444",
  };
  return (
    <group position={[0, -0.8, 0]}>
      {/* título */}
      <Etiqueta pos={[0, 4.2, 0]} df={15} fuerte col={accent}>
        ♀ {madre.replace("XD", "Xᴰ").replace("Xd", "Xᵈ").replace("XD", "Xᴰ").replace("Xd", "Xᵈ")} × ♂ {padre === "XDY" ? "XᴰY" : "XᵈY"}
      </Etiqueta>

      {/* encabezados de gametos */}
      <Etiqueta pos={[-2.95, 2.9, 0]} df={13} col={T.text3}>gametos</Etiqueta>
      {r.gamPadre.map((a, i) => <Etiqueta key={`c${i}`} pos={[X[i]!, 2.9, 0]} df={11} fuerte col={accent}>{a === "Y" ? "Y" : `Xˢ`.replace("ˢ", "")}{a === "Y" ? "" : (a === "D" ? "ᴰ" : "ᵈ")}</Etiqueta>)}
      {r.gamMadre.map((a, i) => <Etiqueta key={`f${i}`} pos={[-2.95, Y[i]!, 0]} df={11} fuerte col={accent}>X{a === "D" ? "ᴰ" : "ᵈ"}</Etiqueta>)}

      {/* casillas */}
      {r.celdas.map((c, i) => {
        const col = i % 2; const row = Math.floor(i / 2);
        const pos: Pt = [X[col]!, Y[row]!, 0];
        const tipo: "XX" | "XY" = c.feno.startsWith("hija") ? "XX" : "XY";
        const color = FCOL[c.feno] ?? "#fff";
        return (
          <group key={i}>
            <Casilla pos={pos} size={SZ} accent={accent} />
            <group position={[pos[0], pos[1] + 0.3, 0.3]} scale={1.15}>
              <ParCrom tipo={tipo} color={color} seed={i * 1.3} playing={playing} />
            </group>
            <Etiqueta pos={[pos[0], pos[1] - 0.82, 0.3]} df={10} fuerte col={c.feno === "hijoDaltonico" || c.feno === "hijaDaltonica" ? "#fca5a5" : OK}>
              {tipo === "XX" ? "♀" : "♂"} {c.etqGeno.replace(/\^D/g, "ᴰ").replace(/\^d/g, "ᵈ").replace(/X/g, "X")}
            </Etiqueta>
          </group>
        );
      })}
    </group>
  );
}

/* ── Contenido de la escena ───────────────────────────────────────────────── */
function Contenido(props: GeneticaMendelSceneProps) {
  const { modo, playing, accent, resetNonce } = props;
  return (
    <>
      <color attach="background" args={["#040912"]} />
      <fog attach="fog" args={["#040912", 16, 34]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[6, 8, 10]} intensity={1.1} />
      <directionalLight position={[-8, -4, 4]} intensity={0.35} color={accent} />
      <Stars radius={80} depth={40} count={1400} factor={3} saturation={0} fade speed={0.6} />

      <group key={`${modo}-${resetNonce}`}>
        {modo === "monohibrido" && (
          <EscenaMono p1={props.monoP1} p2={props.monoP2} herencia={props.herencia} playing={playing} accent={accent} />
        )}
        {modo === "dihibrido" && (
          <EscenaDi p1={props.diP1} p2={props.diP2} playing={playing} accent={accent} />
        )}
        {modo === "ligado" && (
          <EscenaLig madre={props.madre} padre={props.padre} playing={playing} accent={accent} />
        )}
      </group>

      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.2} position={[0, 4, 6]} scale={[10, 6, 1]} color="#bcd4ff" />
        <Lightformer form="rect" intensity={0.7} position={[-6, 0, 4]} scale={[6, 6, 1]} color={accent} />
      </Environment>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={7}
        maxDistance={20}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={(Math.PI * 3) / 4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.55} luminanceThreshold={0.5} luminanceSmoothing={0.9} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.72} />
      </EffectComposer>
    </>
  );
}

/* ── Export por defecto: Canvas ───────────────────────────────────────────── */
export default function GeneticaMendelScene(props: GeneticaMendelSceneProps) {
  const cam =
    props.modo === "dihibrido"
      ? { position: [0, 0.4, 15.5] as Pt, fov: 46 }
      : { position: [0, 0.6, 13.5] as Pt, fov: 46 };
  return (
    <Canvas key={props.modo} dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={cam}>
      <Contenido {...props} />
    </Canvas>
  );
}
