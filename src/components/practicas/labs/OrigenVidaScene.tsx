"use client";

/**
 * Escena 3D del laboratorio "El origen de la vida: hipótesis científicas"
 * (CNEYT-VI-P01). Tres modos:
 *
 *  - miller:    el aparato de Miller-Urey (1953). El océano hierve → el vapor
 *               sube por el tubo izquierdo a la atmósfera primitiva (CH₄, NH₃,
 *               H₂, H₂O); una chispa eléctrica entre dos electrodos sintetiza
 *               moléculas; el condensador enfría y las gotas con aminoácidos se
 *               acumulan en la trampa. Sin chispa no hay síntesis.
 *  - ambientes: dioramas de las cunas candidatas de la vida (caldo primordial,
 *               ventiladeros hidrotermales y panspermia / meteorito).
 *  - mundoarn:  el mundo de ARN: una ribozima que almacena información y
 *               cataliza, junto a un coacervado (protocélula).
 *
 * Toda animación ocurre dentro de useFrame mutando refs (nunca en el render),
 * conforme a las reglas del React Compiler. NO se usa <Text> de drei (cuelga el
 * chunk bajo Turbopack): el texto en el lienzo va en <Html>.
 */

import * as THREE from "three";
import { useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Html, Line, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  type Modo,
  type Ambiente,
  type Pt,
  GASES_PRIMITIVOS,
} from "./origen-vida-data";

export interface OrigenVidaSceneProps {
  modo: Modo;
  ambiente: Ambiente;
  dias: number; // 0..7 (modo miller)
  chispa: boolean; // energía eléctrica encendida
  nAmino: number; // aminoácidos visibles acumulados en la trampa
  playing: boolean;
  accent: string;
  modoColor: string;
  resetNonce: number;
}

/* ── helper de geometría (puro) para tubos ────────────────────────────── */
function seg(a: Pt, b: Pt): { pos: Pt; quat: [number, number, number, number]; len: number } {
  const va = new THREE.Vector3(a[0], a[1], a[2]);
  const vb = new THREE.Vector3(b[0], b[1], b[2]);
  const dir = new THREE.Vector3().subVectors(vb, va);
  const len = dir.length() || 0.0001;
  const mid = new THREE.Vector3().addVectors(va, vb).multiplyScalar(0.5);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  return { pos: [mid.x, mid.y, mid.z], quat: [q.x, q.y, q.z, q.w], len };
}

/* ── Etiqueta flotante (Html) ─────────────────────────────────────────── */
function Etiqueta({ pos, children, df = 11, col }: { pos: Pt; children: ReactNode; df?: number; col?: string }) {
  return (
    <Html position={pos} center distanceFactor={df} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: 999, background: "rgba(4,10,22,0.82)", border: `1px solid ${col ?? "rgba(255,255,255,0.22)"}`, color: "#fff", fontSize: 12, fontWeight: 800, whiteSpace: "nowrap", boxShadow: "0 6px 18px -8px #000" }}>
        {children}
      </div>
    </Html>
  );
}

/* ── Tubo de vidrio entre dos puntos ──────────────────────────────────── */
function Tubo({ a, b, r = 0.16, color = "#bfe6ff", opacity = 0.22 }: { a: Pt; b: Pt; r?: number; color?: string; opacity?: number }) {
  const { pos, quat, len } = seg(a, b);
  return (
    <mesh position={pos} quaternion={quat}>
      <cylinderGeometry args={[r, r, len, 18, 1, true]} />
      <meshStandardMaterial color={color} transparent opacity={opacity} roughness={0.12} metalness={0.05} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

/* ── Matraz de vidrio (esfera + cuello) ───────────────────────────────── */
function Matraz({ pos, r, tint = "#bfe6ff" }: { pos: Pt; r: number; tint?: string }) {
  return (
    <group position={pos}>
      <mesh>
        <sphereGeometry args={[r, 32, 32]} />
        <meshStandardMaterial color={tint} transparent opacity={0.12} roughness={0.08} metalness={0.05} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[0, r + 0.35, 0]}>
        <cylinderGeometry args={[r * 0.32, r * 0.32, 0.7, 18, 1, true]} />
        <meshStandardMaterial color={tint} transparent opacity={0.16} roughness={0.08} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ── Burbuja que asciende dentro de un rango vertical ─────────────────── */
function Burbuja({ x, z, y0, y1, speed, phase, playing, color = "#cdebff" }: { x: number; z: number; y0: number; y1: number; speed: number; phase: number; playing: boolean; color?: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const rango = y1 - y0;
  useFrame((s) => {
    if (!ref.current) return;
    const t = playing ? s.clock.elapsedTime : 0;
    const f = (((t * speed + phase) % rango) + rango) % rango;
    ref.current.position.set(x, y0 + f, z);
    const k = 0.55 + 0.45 * Math.sin((f / rango) * Math.PI);
    ref.current.scale.setScalar(k);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.09, 12, 12]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} transparent opacity={0.8} />
    </mesh>
  );
}

/* ── Molécula de gas flotando en la atmósfera primitiva ───────────────── */
function GasMolecula({ base, phase, color }: { base: Pt; phase: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    const t = s.clock.elapsedTime;
    ref.current.position.set(
      base[0] + Math.sin(t * 0.7 + phase) * 0.22,
      base[1] + Math.cos(t * 0.6 + phase * 1.3) * 0.22,
      base[2] + Math.sin(t * 0.5 + phase * 0.7) * 0.22,
    );
  });
  return (
    <mesh ref={ref} position={base}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.45} roughness={0.4} />
    </mesh>
  );
}

/* ── Chispa eléctrica entre los electrodos ────────────────────────────── */
function Chispa({ on }: { on: boolean }) {
  const g = useRef<THREE.Group>(null);
  const lt = useRef<THREE.PointLight>(null);
  useFrame((s) => {
    const flick = on && Math.sin(s.clock.elapsedTime * 23) > 0.15;
    if (g.current) g.current.visible = flick;
    if (lt.current) lt.current.intensity = flick ? 4 : 0;
  });
  const pts: Pt[] = [
    [-0.55, 2.6, 0],
    [-0.2, 2.82, 0.06],
    [0.05, 2.42, -0.06],
    [0.28, 2.74, 0.04],
    [0.55, 2.6, 0],
  ];
  return (
    <group>
      <group ref={g}>
        <Line points={pts} color="#dbeafe" lineWidth={3.5} />
      </group>
      <pointLight ref={lt} position={[0, 2.6, 0]} color="#7dd3fc" intensity={0} distance={7} />
    </group>
  );
}

/* ── Aminoácido acumulado en la trampa ────────────────────────────────── */
function AminoBead({ i, color }: { i: number; color: string }) {
  // posiciones deterministas apiladas dentro de la trampa
  const ring = i % 5;
  const layer = Math.floor(i / 5);
  const ang = (ring / 5) * Math.PI * 2 + layer * 0.6;
  const rad = 0.32;
  const x = 2.4 + Math.cos(ang) * rad;
  const z = Math.sin(ang) * rad;
  const y = -1.95 + layer * 0.2;
  return (
    <mesh position={[x, y, z]} castShadow>
      <sphereGeometry args={[0.13, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} roughness={0.4} />
    </mesh>
  );
}

/* ── MODO miller: el aparato de Miller-Urey ───────────────────────────── */
function MundoMiller({ chispa, nAmino, playing }: { chispa: boolean; nAmino: number; playing: boolean }) {
  const UF: Pt = [0, 2.6, 0];
  const LF: Pt = [-2.4, -2.2, 0];
  const cuerpo: ReactNode[] = [];

  // tubos del circuito
  cuerpo.push(<Tubo key="riser" a={[-2.4, -1.4, 0]} b={[-0.9, 1.7, 0]} />);
  cuerpo.push(<Tubo key="out1" a={[0.9, 1.7, 0]} b={[2.4, 0.7, 0]} />);
  cuerpo.push(<Tubo key="cond" a={[2.4, 0.7, 0]} b={[2.4, -1.2, 0]} r={0.18} />);
  cuerpo.push(<Tubo key="ret" a={[2.0, -2.55, 0]} b={[-1.6, -2.7, 0]} r={0.12} opacity={0.18} />);

  // serpentín del condensador
  for (let k = 0; k < 5; k++) {
    cuerpo.push(
      <mesh key={`coil${k}`} position={[2.4, 0.5 - k * 0.34, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.3, 0.05, 8, 24]} />
        <meshStandardMaterial color="#7dd3fc" emissive="#38bdf8" emissiveIntensity={0.35} transparent opacity={0.7} />
      </mesh>,
    );
  }

  // electrodos en la atmósfera
  cuerpo.push(
    <mesh key="el-izq" position={[-0.85, 2.6, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.07, 0.07, 0.6, 12]} />
      <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.25} />
    </mesh>,
  );
  cuerpo.push(
    <mesh key="el-der" position={[0.85, 2.6, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.07, 0.07, 0.6, 12]} />
      <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.25} />
    </mesh>,
  );

  // gases de la atmósfera primitiva
  const gasPos: Pt[] = [
    [-0.7, 3.1, 0.4], [0.6, 3.2, -0.3], [-0.9, 2.0, -0.5], [0.9, 2.1, 0.4],
    [0.2, 3.4, 0.2], [-0.3, 1.9, 0.6], [1.0, 2.8, -0.2], [-1.0, 2.7, 0.3],
  ];
  const gases = gasPos.map((p, i) => {
    const g = GASES_PRIMITIVOS[i % GASES_PRIMITIVOS.length] ?? GASES_PRIMITIVOS[0]!;
    return <GasMolecula key={`g${i}`} base={p} phase={i * 1.2} color={g.color} />;
  });

  // vapor que sube por el tubo izquierdo
  const vapor: ReactNode[] = [];
  for (let k = 0; k < 6; k++) {
    vapor.push(<Burbuja key={`v${k}`} x={-2.0 + k * 0.18} z={0} y0={-1.3} y1={1.6} speed={0.9} phase={k * 0.5} playing={playing} color="#dbeafe" />);
  }

  // ebullición en el océano
  const boil: ReactNode[] = [];
  for (let k = 0; k < 7; k++) {
    const ang = (k / 7) * Math.PI * 2;
    boil.push(<Burbuja key={`b${k}`} x={LF[0] + Math.cos(ang) * 0.45} z={Math.sin(ang) * 0.45} y0={-2.9} y1={-1.4} speed={1.1} phase={k * 0.7} playing={playing} color="#7dd3fc" />);
  }

  // condensación que cae al colector
  const drops: ReactNode[] = [];
  for (let k = 0; k < 4; k++) {
    drops.push(<Burbuja key={`d${k}`} x={2.4} z={0} y0={-1.6} y1={0.4} speed={chispa ? 0.8 : 0.25} phase={k * 0.9} playing={playing} color="#a7f3d0" />);
  }

  // aminoácidos acumulados
  const aminos: ReactNode[] = [];
  for (let k = 0; k < nAmino; k++) {
    aminos.push(<AminoBead key={`a${k}`} i={k} color="#34d399" />);
  }

  return (
    <group>
      <Matraz pos={UF} r={1.7} />
      <Matraz pos={LF} r={1.05} tint="#9fe0ff" />
      {/* trampa colectora */}
      <mesh position={[2.4, -1.85, 0]}>
        <sphereGeometry args={[0.7, 24, 24]} />
        <meshStandardMaterial color="#bfe6ff" transparent opacity={0.14} roughness={0.08} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* agua del océano */}
      <mesh position={[LF[0], LF[1] - 0.25, 0]}>
        <sphereGeometry args={[0.92, 24, 24]} />
        <meshStandardMaterial color="#1e6fae" transparent opacity={0.6} roughness={0.2} emissive="#0e3a5e" emissiveIntensity={0.3} />
      </mesh>
      {/* fuente de calor bajo el océano */}
      <mesh position={[LF[0], LF[1] - 1.4, 0]}>
        <coneGeometry args={[0.5, 0.7, 18]} />
        <meshStandardMaterial color="#fb923c" emissive="#f97316" emissiveIntensity={playing ? 0.9 : 0.3} transparent opacity={0.85} />
      </mesh>

      {cuerpo}
      {gases}
      {vapor}
      {boil}
      {drops}
      {aminos}
      <Chispa on={chispa && playing} />

      <Etiqueta pos={[0, 4.4, 0]} col="#38bdf8aa">
        <i className="fa-solid fa-wind" style={{ color: "#7dd3fc" }} /> Atmósfera primitiva · CH₄ · NH₃ · H₂ · H₂O
      </Etiqueta>
      <Etiqueta pos={[0, 1.9, 0]} col={chispa ? "#fbbf24aa" : "#64748baa"}>
        <i className="fa-solid fa-bolt" style={{ color: chispa ? "#fbbf24" : "#64748b" }} /> {chispa ? "Descarga eléctrica" : "Sin energía"}
      </Etiqueta>
      <Etiqueta pos={[-2.4, -3.6, 0]} col="#7dd3fcaa">
        <i className="fa-solid fa-fire-flame-simple" style={{ color: "#fb923c" }} /> Océano en ebullición
      </Etiqueta>
      <Etiqueta pos={[3.5, -0.2, 0]} col="#38bdf8aa">
        <i className="fa-solid fa-droplet" style={{ color: "#7dd3fc" }} /> Condensador
      </Etiqueta>
      <Etiqueta pos={[2.4, -2.9, 0]} col="#34d399aa">
        <i className="fa-solid fa-vial-circle-check" style={{ color: "#34d399" }} /> Trampa · {nAmino > 0 ? "aminoácidos" : "vacía"}
      </Etiqueta>
    </group>
  );
}

/* ── Rayo (zigzag intermitente) ───────────────────────────────────────── */
function Rayo({ playing }: { playing: boolean }) {
  const g = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (g.current) g.current.visible = playing && Math.sin(s.clock.elapsedTime * 4) > 0.7;
  });
  const pts: Pt[] = [
    [-1.4, 4.2, 0], [-1.0, 3.2, 0.2], [-1.5, 2.4, -0.2], [-1.1, 1.5, 0.1], [-1.3, 0.6, 0],
  ];
  return (
    <group ref={g}>
      <Line points={pts} color="#fef08a" lineWidth={4} />
      <pointLight position={[-1.3, 2.4, 0]} color="#fde047" intensity={playing ? 2.5 : 0} distance={8} />
    </group>
  );
}

/* ── Diorama: caldo primordial ────────────────────────────────────────── */
function DioramaCaldo({ playing }: { playing: boolean }) {
  const burbujas: ReactNode[] = [];
  for (let k = 0; k < 9; k++) {
    const ang = (k / 9) * Math.PI * 2;
    const g = GASES_PRIMITIVOS[k % GASES_PRIMITIVOS.length] ?? GASES_PRIMITIVOS[0]!;
    burbujas.push(<Burbuja key={k} x={Math.cos(ang) * 2.4} z={Math.sin(ang) * 1.4} y0={-1.4} y1={1.4} speed={0.7} phase={k * 0.8} playing={playing} color={g.color} />);
  }
  return (
    <group>
      {/* superficie del océano primitivo */}
      <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[4, 48]} />
        <meshStandardMaterial color="#0e3a5e" emissive="#0b2a44" emissiveIntensity={0.4} transparent opacity={0.92} roughness={0.3} />
      </mesh>
      {/* volcán al fondo */}
      <mesh position={[3, -0.7, -2.2]}>
        <coneGeometry args={[1.3, 2, 24]} />
        <meshStandardMaterial color="#3f2d22" roughness={0.9} />
      </mesh>
      <mesh position={[3, 0.4, -2.2]}>
        <coneGeometry args={[0.35, 0.6, 16]} />
        <meshStandardMaterial color="#f97316" emissive="#ea580c" emissiveIntensity={playing ? 0.9 : 0.3} />
      </mesh>
      {burbujas}
      <Rayo playing={playing} />
      <Etiqueta pos={[0, 2.6, 0]} col="#fbbf24aa">
        <i className="fa-solid fa-water" style={{ color: "#fbbf24" }} /> Caldo primordial (Oparin-Haldane)
      </Etiqueta>
      <Etiqueta pos={[-1.3, 4.6, 0]} col="#fde047aa">Energía: relámpagos y volcanes</Etiqueta>
    </group>
  );
}

/* ── Partícula que asciende desde la fumarola ─────────────────────────── */
function Humo({ x, z, phase, playing, color }: { x: number; z: number; phase: number; playing: boolean; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    const t = playing ? s.clock.elapsedTime : 0;
    const f = ((t * 0.8 + phase) % 4 + 4) % 4;
    ref.current.position.set(x + Math.sin(f * 2 + phase) * 0.25, -1.2 + f, z + Math.cos(f * 2) * 0.25);
    ref.current.scale.setScalar(0.4 + f * 0.18);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.2, 12, 12]} />
      <meshStandardMaterial color={color} transparent opacity={0.45} emissive={color} emissiveIntensity={0.3} />
    </mesh>
  );
}

/* ── Diorama: ventiladeros hidrotermales ──────────────────────────────── */
function DioramaHidrotermal({ playing }: { playing: boolean }) {
  const humo: ReactNode[] = [];
  for (let k = 0; k < 8; k++) {
    humo.push(<Humo key={k} x={(k % 2 === 0 ? -0.9 : 0.9)} z={0} phase={k * 0.6} playing={playing} color={k % 2 === 0 ? "#475569" : "#94a3b8"} />);
  }
  return (
    <group>
      {/* fondo oceánico */}
      <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[4.2, 48]} />
        <meshStandardMaterial color="#0a1830" emissive="#08101f" emissiveIntensity={0.3} roughness={0.8} />
      </mesh>
      {/* chimeneas (black smokers) */}
      {[-0.9, 0.9].map((cx, i) => (
        <group key={i} position={[cx, 0, 0]}>
          <mesh position={[0, -0.5, 0]}>
            <cylinderGeometry args={[0.35, 0.6, 1.8, 18]} />
            <meshStandardMaterial color="#2b2018" roughness={0.95} />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.22, 0.35, 0.6, 18]} />
            <meshStandardMaterial color="#1c140e" roughness={0.95} />
          </mesh>
          <pointLight position={[0, 0.8, 0]} color="#fb7185" intensity={playing ? 1.6 : 0.4} distance={4} />
        </group>
      ))}
      {humo}
      <Etiqueta pos={[0, 2.6, 0]} col="#fb7185aa">
        <i className="fa-solid fa-fire" style={{ color: "#fb7185" }} /> Ventiladeros hidrotermales
      </Etiqueta>
      <Etiqueta pos={[0, 1.7, 0]} col="#fda4afaa">Minerales + gradientes de T y pH · sin atmósfera reductora</Etiqueta>
    </group>
  );
}

/* ── Meteoro que cruza hacia la Tierra ────────────────────────────────── */
function Meteoro({ playing }: { playing: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (!ref.current) return;
    const t = playing ? s.clock.elapsedTime : 1.5;
    const f = ((t * 0.35) % 1 + 1) % 1; // 0..1
    ref.current.position.set(-4 + f * 5.5, 3 - f * 4.2, 0);
  });
  return (
    <group ref={ref}>
      <mesh castShadow>
        <dodecahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color="#6b5b4d" roughness={0.85} emissive="#b45309" emissiveIntensity={0.35} />
      </mesh>
      {/* aminoácidos en el meteorito */}
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2;
        const c = ["#34d399", "#fbbf24", "#a855f7"][i] ?? "#34d399";
        return (
          <mesh key={i} position={[Math.cos(a) * 0.55, Math.sin(a) * 0.55, 0.2]}>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.5} />
          </mesh>
        );
      })}
      <pointLight color="#fbbf24" intensity={playing ? 1.4 : 0.4} distance={5} />
    </group>
  );
}

/* ── Diorama: panspermia ──────────────────────────────────────────────── */
function DioramaPanspermia({ playing }: { playing: boolean }) {
  return (
    <group>
      {/* Tierra primitiva */}
      <mesh position={[2.2, -1.6, 0]}>
        <sphereGeometry args={[1.4, 36, 36]} />
        <meshStandardMaterial color="#1d4ed8" emissive="#0b2a6b" emissiveIntensity={0.35} roughness={0.55} />
      </mesh>
      <mesh position={[2.2, -1.2, 0.9]}>
        <sphereGeometry args={[0.5, 20, 20]} />
        <meshStandardMaterial color="#16a34a" roughness={0.7} />
      </mesh>
      <Meteoro playing={playing} />
      <Etiqueta pos={[0, 3.2, 0]} col="#818cf8aa">
        <i className="fa-solid fa-meteor" style={{ color: "#818cf8" }} /> Panspermia · meteorito de Murchison (1969)
      </Etiqueta>
      <Etiqueta pos={[2.2, 0.4, 0]} col="#60a5faaa">Tierra primitiva</Etiqueta>
    </group>
  );
}

function MundoAmbientes({ ambiente, playing }: { ambiente: Ambiente; playing: boolean }) {
  if (ambiente === "hidrotermal") return <DioramaHidrotermal playing={playing} />;
  if (ambiente === "panspermia") return <DioramaPanspermia playing={playing} />;
  return <DioramaCaldo playing={playing} />;
}

/* ── MODO mundoarn: ribozima + coacervado ─────────────────────────────── */
const ARN_COLORES: Record<string, string> = { A: "#34d399", U: "#fbbf24", G: "#38bdf8", C: "#fb7185" };

function MundoArn({ playing }: { playing: boolean }) {
  // cadena de ARN plegada en horquilla (ribozima)
  const secuencia = "GGCAUUGCCAUGGCAAUGCC";
  const n = secuencia.length;
  const beads: ReactNode[] = [];
  const path: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const tt = i / (n - 1);
    // forma de horquilla: sube, gira, baja
    const ang = tt * Math.PI;
    const x = -2.2 + Math.sin(ang) * 1.7;
    const y = -1.3 + tt * 2.6;
    const z = Math.cos(ang) * 0.6;
    const p: Pt = [x, y, z];
    path.push(p);
    const b = secuencia[i] ?? "A";
    const col = ARN_COLORES[b] ?? "#94a3b8";
    beads.push(
      <mesh key={i} position={p}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.4} roughness={0.4} />
      </mesh>,
    );
  }

  return (
    <group>
      {/* coacervado / protocélula */}
      <group position={[2.4, 0.2, 0]}>
        <mesh>
          <sphereGeometry args={[1.5, 36, 36]} />
          <meshStandardMaterial color="#a855f7" transparent opacity={0.14} roughness={0.1} side={THREE.DoubleSide} depthWrite={false} emissive="#7c3aed" emissiveIntensity={0.25} />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => {
          const a = (i / 5) * Math.PI * 2;
          const c = ["#34d399", "#fbbf24", "#38bdf8", "#fb7185", "#c084fc"][i] ?? "#fff";
          return (
            <GasMolecula key={i} base={[Math.cos(a) * 0.7, Math.sin(a) * 0.6, Math.cos(a * 2) * 0.4]} phase={i * 1.5} color={c} />
          );
        })}
        <Etiqueta pos={[0, 1.9, 0]} col="#a855f7aa">
          <i className="fa-solid fa-circle-nodes" style={{ color: "#c084fc" }} /> Coacervado · protocélula
        </Etiqueta>
      </group>

      {/* ribozima */}
      <Line points={path} color="#c084fc" lineWidth={3} transparent opacity={0.6} />
      {beads}
      {/* sitio catalítico: dos sustratos que se unen */}
      <ReaccionRibozima playing={playing} />
      <Etiqueta pos={[-2.2, 1.9, 0]} col="#a855f7aa">
        <i className="fa-solid fa-dna" style={{ color: "#c084fc" }} /> ARN: información + catálisis (ribozima)
      </Etiqueta>
    </group>
  );
}

function ReaccionRibozima({ playing }: { playing: boolean }) {
  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    const t = playing ? s.clock.elapsedTime : 0;
    const d = 0.5 + 0.45 * (0.5 + 0.5 * Math.sin(t * 1.6)); // se acercan y separan
    if (a.current) a.current.position.set(-0.6 - d, 0.1, 0.8);
    if (b.current) b.current.position.set(-0.6 + d, 0.1, 0.8);
  });
  return (
    <group>
      <mesh ref={a}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#fde047" emissive="#fbbf24" emissiveIntensity={0.6} />
      </mesh>
      <mesh ref={b}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#86efac" emissive="#34d399" emissiveIntensity={0.6} />
      </mesh>
      <Etiqueta pos={[-0.6, -0.4, 0.8]} col="#facc15aa">Sitio catalítico</Etiqueta>
    </group>
  );
}

/* ── Mundo + cámara + post ────────────────────────────────────────────── */
function Contenido(props: OrigenVidaSceneProps) {
  const { modo, ambiente, chispa, nAmino, modoColor, resetNonce, playing } = props;
  const giro = useRef<THREE.Group>(null);
  useFrame((s, dt) => {
    if (giro.current && playing && modo !== "miller") giro.current.rotation.y += dt * 0.12;
  });

  const mundo: ReactNode =
    modo === "miller" ? (
      <MundoMiller chispa={chispa} nAmino={nAmino} playing={playing} />
    ) : modo === "ambientes" ? (
      <MundoAmbientes ambiente={ambiente} playing={playing} />
    ) : (
      <MundoArn playing={playing} />
    );

  return (
    <>
      <color attach="background" args={["#040912"]} />
      <fog attach="fog" args={["#040912", 16, 42]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[6, 9, 6]} intensity={1.4} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-6, 4, -4]} intensity={0.5} color={modoColor} />
      <Stars radius={70} depth={30} count={1100} factor={3} fade speed={0.5} />

      <group ref={giro} key={`${modo}-${ambiente}-${resetNonce}`}>{mundo}</group>

      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.1} position={[0, 6, 4]} scale={8} color="#bcd4ff" />
        <Lightformer form="rect" intensity={0.7} position={[5, 0, -4]} scale={6} color={modoColor} />
      </Environment>
      <OrbitControls enablePan={false} minDistance={7} maxDistance={30} autoRotate={false} />
      <EffectComposer>
        <Bloom intensity={0.6} luminanceThreshold={0.2} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.72} />
      </EffectComposer>
    </>
  );
}

export default function OrigenVidaScene(props: OrigenVidaSceneProps) {
  const cam: Pt = props.modo === "miller" ? [0, 0.4, 13] : props.modo === "ambientes" ? [0, 1.4, 13] : [0, 0.6, 12];
  return (
    <Canvas key={props.modo} shadows dpr={[1, 2]} camera={{ position: cam, fov: 46 }} gl={{ antialias: true }} style={{ width: "100%", height: "100%" }}>
      <Contenido {...props} />
    </Canvas>
  );
}
