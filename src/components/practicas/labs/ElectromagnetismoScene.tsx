"use client";

/**
 * Escena 3D — "Electromagnetismo: Ohm, Faraday y motores" (CNEYT-V-P07-A2).
 *
 * Tres MODOS, según la prop `modo`:
 *  · "circuito"  — un circuito cerrado: fuente (red de CFE) → resistencia. Los
 *    electrones recorren el lazo a una rapidez proporcional a la corriente I = V/R
 *    y la lámpara brilla según la potencia P = V²/R. (Parte (a) del problema A2.)
 *  · "generador" — una bobina de N vueltas gira dentro de un campo magnético B y,
 *    por inducción de Faraday, produce una FEM alterna FEM = N·B·A·ω·sen(ωt). Un
 *    trazo senoidal y una lámpara que late muestran la salida.
 *  · "motor"     — un rotor gira al convertir energía eléctrica en mecánica; una
 *    barra de eficiencia separa la potencia útil (verde) del calor perdido (rojo).
 *    (Parte (b) del problema A2.)
 *
 * Patrón R3F: el default export solo monta <Canvas key={modo}> y delega en
 * <Contenido>. React Compiler: TODA la animación vive en useFrame y solo MUTA
 * refs (posición de electrones, rotación de la bobina/rotor, intensidad emisiva
 * de la lámpara, posición del marcador senoidal); nunca llama a setState. Los
 * números de los paneles son los que devuelven los resolvers de los datos.
 */

import * as THREE from "three";
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Html, Line, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  type Modo,
  resolverCircuito, resolverGenerador, resolverMotor,
  fmtV, fmtA, fmtR, fmtW, fmtKw, fmtHz, fmtPct,
} from "./electromagnetismo-data";

export interface ElectromagnetismoSceneProps {
  modo: Modo;
  // circuito
  V: number;
  R: number;
  horas: number;
  precio: number;
  // generador
  N: number;
  B: number;
  area: number;
  f: number;
  // motor
  pElec: number;
  efic: number;
  // común
  playing: boolean;
  accent: string;
  resetNonce: number;
}

type Pt = [number, number, number];

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Punto a la fracción f∈[0,1] de una polilínea cerrada. */
function pointAtFraction(path: Pt[], f: number): Pt {
  let total = 0;
  const segs: number[] = [];
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1]!, b = path[i]!;
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    segs.push(L); total += L;
  }
  if (total < 1e-6) return path[0] ?? [0, 0, 0];
  let d = ((f % 1) + 1) % 1 * total;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1]!, b = path[i]!;
    const L = segs[i - 1]!;
    if (d <= L) {
      const t = L < 1e-6 ? 0 : d / L;
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, 0.06];
    }
    d -= L;
  }
  return path[path.length - 1] ?? [0, 0, 0];
}

/* ── Título flotante ──────────────────────────────────────────────────────── */
function Titulo({ texto, sub, color, y = 5.4 }: { texto: string; sub?: string; color: string; y?: number }) {
  return (
    <Html position={[0, y, 0]} center distanceFactor={20} pointerEvents="none">
      <div style={{
        whiteSpace: "nowrap", textAlign: "center", padding: "4px 12px", borderRadius: 10,
        background: "rgba(4,12,26,0.9)", border: `1px solid ${color}aa`, color: "#fff",
        fontFamily: "system-ui, sans-serif", boxShadow: "0 6px 22px rgba(0,0,0,0.5)",
      }}>
        <div style={{ fontWeight: 900, fontSize: 12 }}>{texto}</div>
        {sub && <div style={{ fontWeight: 800, fontSize: 10.5, color }}>{sub}</div>}
      </div>
    </Html>
  );
}

function Etiqueta({ pos, texto, color, mono = false }: { pos: Pt; texto: string; color: string; mono?: boolean }) {
  return (
    <Html position={pos} center distanceFactor={17} pointerEvents="none">
      <div style={{ whiteSpace: "nowrap", padding: "2px 8px", borderRadius: 8, background: "rgba(5,13,26,0.85)", border: `1px solid ${color}88`, color, fontWeight: 900, fontSize: 10, fontFamily: mono ? "ui-monospace, monospace" : "system-ui, sans-serif" }}>
        {texto}
      </div>
    </Html>
  );
}

/* ── (a) Circuito — ley de Ohm ────────────────────────────────────────────── */
const WX = 4.6;  // semiancho del lazo
const WY = 2.7;  // semialto del lazo

function Electrones({ path, count, color, speed, playing }: { path: Pt[]; count: number; color: string; speed: number; playing: boolean }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const phase = useRef(0);

  useFrame((_, dt) => {
    if (playing) phase.current = (phase.current + dt * speed * 0.06) % 1;
    for (let i = 0; i < count; i++) {
      const m = refs.current[i];
      if (!m) continue;
      const p = pointAtFraction(path, phase.current + i / count);
      m.position.set(p[0], p[1], p[2]);
    }
  });

  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }}>
          <sphereGeometry args={[0.13, 14, 14]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} toneMapped={false} />
        </mesh>
      ))}
    </>
  );
}

/** Lámpara cuyo brillo lata o sea fijo según un ref externo. */
function Lampara({ pos, baseColor, refIntensity }: { pos: Pt; baseColor: string; refIntensity: React.MutableRefObject<number> }) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  useFrame(() => {
    const v = refIntensity.current;
    if (matRef.current) matRef.current.emissiveIntensity = v;
    if (lightRef.current) lightRef.current.intensity = clamp(v * 0.6, 0, 3);
  });
  return (
    <group position={pos}>
      <mesh>
        <sphereGeometry args={[0.42, 24, 24]} />
        <meshStandardMaterial ref={matRef} color={baseColor} emissive={baseColor} emissiveIntensity={1} toneMapped={false} />
      </mesh>
      <pointLight ref={lightRef} color={baseColor} intensity={0.6} distance={9} />
    </group>
  );
}

function EscenaCircuito({ V, R, playing, accent }: { V: number; R: number; playing: boolean; accent: string }) {
  const c = resolverCircuito(V, R, 1, 1);
  // rapidez visual de los electrones ∝ corriente (escala logarítmica)
  const speed = clamp(Math.log10(c.I * 10 + 1), 0.3, 3.6);
  // brillo de la lámpara ∝ potencia (escala logarítmica); se fija en useFrame
  // para no escribir el ref durante el render (React Compiler / regla de refs).
  const brillo = useRef(1);
  useFrame(() => { brillo.current = clamp(Math.log10(c.P + 1) * 0.9, 0.3, 2.6); });

  // lazo rectangular (sentido horario desde arriba-izquierda)
  const path: Pt[] = [
    [-WX, WY, 0], [WX, WY, 0], [WX, -WY, 0], [-WX, -WY, 0], [-WX, WY, 0],
  ];

  // resistencia (zigzag) sobre el lado derecho
  const zig: Pt[] = [];
  const zN = 7, zTop = 1.1, zBot = -1.1, zStep = (zTop - zBot) / zN;
  zig.push([WX, zTop, 0]);
  for (let i = 0; i < zN; i++) {
    const y = zTop - zStep * (i + 0.5);
    zig.push([WX + (i % 2 === 0 ? 0.42 : -0.42), y, 0]);
  }
  zig.push([WX, zBot, 0]);

  return (
    <group>
      <Titulo texto="Circuito — ley de Ohm" sub={`V = ${fmtV(V)} · R = ${fmtR(R)} · I = ${fmtA(c.I)} · P = ${fmtW(c.P)}`} color={accent} />

      {/* cable */}
      <Line points={path} color="#94a3b8" lineWidth={3} />

      {/* fuente (batería / red CFE) sobre el lado izquierdo */}
      <group position={[-WX, 0, 0]}>
        <mesh><boxGeometry args={[0.55, 1.5, 0.3]} /><meshStandardMaterial color="#1e293b" /></mesh>
        {/* bornes */}
        <Line points={[[-0.18, 0.55, 0.2], [0.18, 0.55, 0.2]] as Pt[]} color="#f87171" lineWidth={4} />
        <Line points={[[0, 0.45, 0.2], [0, 0.65, 0.2]] as Pt[]} color="#f87171" lineWidth={4} />
        <Line points={[[-0.12, -0.55, 0.2], [0.12, -0.55, 0.2]] as Pt[]} color="#60a5fa" lineWidth={4} />
        <Etiqueta pos={[-1.05, 0, 0]} texto={`${fmtV(V)}`} color="#fbbf24" mono />
        <Html position={[-1.05, -0.7, 0]} center distanceFactor={17} pointerEvents="none">
          <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(220,232,255,0.7)", fontFamily: "system-ui, sans-serif" }}>red CFE</div>
        </Html>
      </group>

      {/* resistencia */}
      <Line points={zig} color="#fbbf24" lineWidth={4} />
      <Etiqueta pos={[WX + 1.1, 0, 0]} texto={`R = ${fmtR(R)}`} color="#fbbf24" mono />

      {/* lámpara en la esquina superior derecha */}
      <Lampara pos={[WX - 1.4, WY, 0]} baseColor="#fde047" refIntensity={brillo} />
      <Etiqueta pos={[WX - 1.4, WY + 0.7, 0]} texto={`P = ${fmtW(c.P)}`} color="#fde047" mono />

      {/* electrones */}
      <Electrones path={path} count={14} color={accent} speed={speed} playing={playing} />

      {/* sentido de la corriente */}
      <Etiqueta pos={[0, WY + 0.55, 0]} texto={`I = ${fmtA(c.I)} →`} color={accent} mono />
    </group>
  );
}

/* ── (b) Generador — inducción de Faraday ─────────────────────────────────── */
function BobinaGiratoria({ N, color, speed, playing }: { N: number; color: string; speed: number; playing: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current && playing) ref.current.rotation.y += dt * speed;
  });
  // espira rectangular (en el plano xy), se replica en z para sugerir N vueltas
  const w = 1.7, h = 1.15;
  const loop: Pt[] = [[-w, h, 0], [w, h, 0], [w, -h, 0], [-w, -h, 0], [-w, h, 0]];
  const turns = Math.min(5, Math.max(2, Math.round(N / 80)));
  return (
    <group ref={ref}>
      {Array.from({ length: turns }, (_, i) => {
        const z = (i - (turns - 1) / 2) * 0.14;
        return <Line key={i} points={loop.map((p) => [p[0], p[1], z] as Pt)} color={color} lineWidth={3} transparent opacity={0.92} />;
      })}
      {/* eje de giro */}
      <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.05, 0.05, 4.4, 10]} /><meshStandardMaterial color="#cbd5e1" /></mesh>
    </group>
  );
}

function TrazoSenoidal({ ampVis, speed, color, playing }: { ampVis: number; speed: number; color: string; playing: boolean }) {
  const dot = useRef<THREE.Mesh>(null);
  const phase = useRef(0);
  const W = 5.2;     // ancho del trazo
  const x0 = -W / 2; // empieza a la izquierda
  const ciclos = 2;  // ciclos visibles
  const k = (ciclos * 2 * Math.PI) / W;

  // curva estática
  const pts: Pt[] = [];
  const M = 120;
  for (let i = 0; i <= M; i++) {
    const x = x0 + (W * i) / M;
    pts.push([x, ampVis * Math.sin(k * (x - x0)), 0]);
  }

  useFrame((_, dt) => {
    if (playing) phase.current = (phase.current + dt * speed * 0.5) % W;
    const x = x0 + phase.current;
    if (dot.current) dot.current.position.set(x, ampVis * Math.sin(k * phase.current), 0.05);
  });

  return (
    <group position={[0, -3.6, 0]}>
      {/* eje */}
      <Line points={[[x0, 0, 0], [x0 + W, 0, 0]] as Pt[]} color="#46587a" lineWidth={1} transparent opacity={0.6} />
      <Line points={pts} color={color} lineWidth={2.5} transparent opacity={0.9} />
      <mesh ref={dot}>
        <sphereGeometry args={[0.12, 14, 14]} />
        <meshStandardMaterial color="#fde047" emissive="#fde047" emissiveIntensity={1.3} toneMapped={false} />
      </mesh>
      <Etiqueta pos={[x0 - 0.4, 0, 0]} texto="FEM" color={color} mono />
      <Etiqueta pos={[x0 + W + 0.4, 0, 0]} texto="t" color="#94a3b8" mono />
    </group>
  );
}

function EscenaGenerador({ N, B, area, f, playing, accent }: { N: number; B: number; area: number; f: number; playing: boolean; accent: string }) {
  const g = resolverGenerador(N, B, area, f);
  const speed = clamp(f / 14, 0.4, 9);          // rad/s visuales ∝ f
  const ampVis = clamp(Math.log10(g.femPico + 1) * 0.7, 0.3, 2.6);

  // lámpara que late con la frecuencia
  const brillo = useRef(1);
  const tRef = useRef(0);
  useFrame((_, dt) => {
    if (playing) tRef.current += dt * speed;
    brillo.current = clamp(0.4 + Math.abs(Math.sin(tRef.current)) * ampVis, 0.3, 2.8);
  });

  return (
    <group>
      <Titulo texto="Generador — inducción de Faraday" sub={`FEM = N·B·A·ω·sen(ωt) · FEM_pico = ${fmtV(g.femPico)} · ${fmtHz(f)}`} color={accent} />

      {/* polos del imán */}
      <group position={[0, 0.4, 0]}>
        <mesh position={[-2.6, 0, 0]}><boxGeometry args={[0.5, 2.6, 2.2]} /><meshStandardMaterial color="#ef4444" emissive="#7f1d1d" emissiveIntensity={0.3} /></mesh>
        <mesh position={[2.6, 0, 0]}><boxGeometry args={[0.5, 2.6, 2.2]} /><meshStandardMaterial color="#3b82f6" emissive="#1e3a8a" emissiveIntensity={0.3} /></mesh>
        <Etiqueta pos={[-2.6, 1.7, 0]} texto="N" color="#fca5a5" />
        <Etiqueta pos={[2.6, 1.7, 0]} texto="S" color="#93c5fd" />

        {/* líneas de campo N → S */}
        {[-0.8, 0, 0.8].map((y, i) => (
          <Line key={i} points={[[-2.3, y, 0], [2.3, y, 0]] as Pt[]} color="#a5b4fc" lineWidth={1.5} transparent opacity={0.4} dashed dashSize={0.2} gapSize={0.16} />
        ))}
        <Etiqueta pos={[0, -1.55, 0]} texto={`B = ${B.toFixed(2)} T`} color="#a5b4fc" mono />

        {/* bobina giratoria */}
        <BobinaGiratoria N={N} color={accent} speed={speed} playing={playing} />
      </group>

      {/* lámpara de salida */}
      <Lampara pos={[0, 2.9, 0]} baseColor="#fde047" refIntensity={brillo} />
      <Etiqueta pos={[1.7, 2.9, 0]} texto={`${N} vueltas`} color={accent} mono />

      {/* trazo senoidal de la FEM */}
      <TrazoSenoidal ampVis={ampVis} speed={speed} color={accent} playing={playing} />
    </group>
  );
}

/* ── (c) Motor — eficiencia ───────────────────────────────────────────────── */
function Rotor({ color, speed, playing }: { color: string; speed: number; playing: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current && playing) ref.current.rotation.z += dt * speed;
  });
  return (
    <group ref={ref}>
      {/* rotor */}
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.9, 0.9, 0.7, 28]} /><meshStandardMaterial color="#334155" metalness={0.6} roughness={0.35} /></mesh>
      {/* aspas */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} rotation={[0, 0, (i * Math.PI) / 2]} position={[0, 0, 0.42]}>
          <boxGeometry args={[2.0, 0.34, 0.1]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.45} toneMapped={false} />
        </mesh>
      ))}
      {/* eje */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.6]}><cylinderGeometry args={[0.12, 0.12, 1.6, 12]} /><meshStandardMaterial color="#cbd5e1" /></mesh>
    </group>
  );
}

function EscenaMotor({ pElec, efic, playing, accent }: { pElec: number; efic: number; playing: boolean; accent: string }) {
  const m = resolverMotor(pElec, efic);
  const speed = clamp(Math.log10(m.pMec * 5 + 1), 0.3, 4.5);
  const VERDE = "#34d399", ROJO = "#fb7185";

  // barra de eficiencia (ancho total fijo)
  const BARW = 6, BARH = 0.7;
  const wUtil = BARW * (efic / 100);
  const wCalor = BARW - wUtil;
  const x0 = -BARW / 2;

  return (
    <group>
      <Titulo texto="Motor — eficiencia" sub={`P_elec = ${fmtKw(pElec)} · η = ${fmtPct(efic)} · P_mec = ${fmtKw(m.pMec)}`} color={accent} />

      {/* entrada eléctrica */}
      <group position={[-4.4, 0.4, 0]}>
        <mesh><boxGeometry args={[0.7, 1.6, 0.5]} /><meshStandardMaterial color="#1e293b" /></mesh>
        <mesh position={[0, 0, 0.3]}><sphereGeometry args={[0.18, 12, 12]} /><meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1} toneMapped={false} /></mesh>
        <Etiqueta pos={[0, 1.3, 0]} texto={`P_elec = ${fmtKw(pElec)}`} color="#fbbf24" mono />
      </group>
      {/* cable de entrada */}
      <Line points={[[-3.7, 0.4, 0], [-1.2, 0.4, 0]] as Pt[]} color="#fbbf24" lineWidth={3} />

      {/* rotor en su carcasa entre polos */}
      <group position={[0.4, 0.4, 0]}>
        <mesh position={[-1.5, 0, -0.2]}><boxGeometry args={[0.35, 2.0, 1.6]} /><meshStandardMaterial color="#ef4444" emissive="#7f1d1d" emissiveIntensity={0.25} /></mesh>
        <mesh position={[1.5, 0, -0.2]}><boxGeometry args={[0.35, 2.0, 1.6]} /><meshStandardMaterial color="#3b82f6" emissive="#1e3a8a" emissiveIntensity={0.25} /></mesh>
        <Rotor color={accent} speed={speed} playing={playing} />
      </group>

      {/* salida mecánica */}
      <Line points={[[2.0, 0.4, 0], [3.8, 0.4, 0]] as Pt[]} color={VERDE} lineWidth={3} />
      <Etiqueta pos={[4.4, 0.9, 0]} texto={`P_mec = ${fmtKw(m.pMec)}`} color={VERDE} mono />
      <Etiqueta pos={[4.4, 0.2, 0]} texto={`${m.hp.toFixed(0)} hp`} color={VERDE} mono />

      {/* calor perdido (sube) */}
      <Line points={[[0.4, 1.5, 0], [0.4, 2.5, 0]] as Pt[]} color={ROJO} lineWidth={2} transparent opacity={0.7} dashed dashSize={0.18} gapSize={0.14} />
      <Etiqueta pos={[0.4, 2.9, 0]} texto={`calor = ${fmtKw(m.pPerdida)}`} color={ROJO} mono />

      {/* barra de eficiencia */}
      <group position={[0, -2.9, 0]}>
        <mesh position={[x0 + wUtil / 2, 0, 0]}><boxGeometry args={[Math.max(0.001, wUtil), BARH, 0.15]} /><meshStandardMaterial color={VERDE} emissive={VERDE} emissiveIntensity={0.4} toneMapped={false} /></mesh>
        <mesh position={[x0 + wUtil + wCalor / 2, 0, 0]}><boxGeometry args={[Math.max(0.001, wCalor), BARH, 0.15]} /><meshStandardMaterial color={ROJO} emissive={ROJO} emissiveIntensity={0.4} toneMapped={false} /></mesh>
        <Etiqueta pos={[x0 + wUtil / 2, 0.7, 0]} texto={`útil ${fmtPct(efic)}`} color={VERDE} mono />
        <Etiqueta pos={[x0 + wUtil + wCalor / 2, -0.7, 0]} texto={`calor ${fmtPct(100 - efic)}`} color={ROJO} mono />
      </group>
    </group>
  );
}

/* ── Contenido ────────────────────────────────────────────────────────────── */
function Contenido(props: ElectromagnetismoSceneProps) {
  const { modo, accent, resetNonce, playing } = props;
  return (
    <>
      <color attach="background" args={["#040a16"]} />
      <fog attach="fog" args={["#040a16", 28, 80]} />

      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 8, 8]} intensity={1.05} />
      <pointLight position={[-8, 4, 7]} intensity={0.45} color={accent} />
      <Stars radius={70} depth={30} count={900} factor={3} saturation={0} fade speed={0.5} />

      <group key={`${modo}-${resetNonce}`}>
        {modo === "circuito" && <EscenaCircuito V={props.V} R={props.R} playing={playing} accent={accent} />}
        {modo === "generador" && <EscenaGenerador N={props.N} B={props.B} area={props.area} f={props.f} playing={playing} accent={accent} />}
        {modo === "motor" && <EscenaMotor pElec={props.pElec} efic={props.efic} playing={playing} accent={accent} />}
      </group>

      <Environment resolution={128}>
        <group>
          <Lightformer intensity={1.1} position={[0, 7, 8]} scale={14} color="#eaf1ff" />
          <Lightformer intensity={0.6} position={[8, 3, 5]} scale={7} color="#cfe0ff" />
          <Lightformer intensity={0.6} position={[-8, 3, 4]} scale={7} color="#dcd5ff" />
        </group>
      </Environment>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={12}
        maxDistance={30}
        minPolarAngle={Math.PI / 3.4}
        maxPolarAngle={Math.PI / 1.7}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.55} luminanceThreshold={0.5} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.45} />
      </EffectComposer>
    </>
  );
}

export default function ElectromagnetismoScene(props: ElectromagnetismoSceneProps) {
  const cam = { position: [0, 0.6, 17] as Pt, fov: 48 };
  return (
    <Canvas key={props.modo} dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={cam}>
      <Contenido {...props} />
    </Canvas>
  );
}
