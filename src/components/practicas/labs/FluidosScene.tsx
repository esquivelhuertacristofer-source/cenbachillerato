"use client";

/**
 * Escena 3D — "El comportamiento de los fluidos: Arquímedes, Pascal y Bernoulli"
 * (CNEYT-V-P09-A2).
 *
 * Tres MODOS, según la prop `modo`:
 *  · "flotacion" — un cubo dentro de un tanque de fluido. Si su densidad es menor
 *    que la del fluido, flota con una fracción sumergida ρ_cuerpo/ρ_fluido; si es
 *    mayor, se hunde. Se dibujan el empuje (↑) y el peso (↓) a escala. Arquímedes.
 *  · "presion"   — una sonda a profundidad h dentro de la columna. La presión
 *    P = P_ext + ρ·g·h actúa en TODAS direcciones (flechas radiales a escala). Al
 *    subir la presión externa (émbolo) se transmite por igual a toda profundidad: Pascal.
 *  · "flujo"     — una tubería horizontal con estrechamiento. Partículas que viajan
 *    más rápido en la sección estrecha (continuidad A₁v₁ = A₂v₂) y manómetros que
 *    muestran cómo cae la presión donde el fluido acelera: Bernoulli.
 *
 * Patrón R3F: el default export solo monta <Canvas key={modo}> y delega en
 * <Contenido>. React Compiler: las animaciones (cabeceo del cubo, partículas del
 * flujo) viven en useFrame que MUTA refs (nunca setState ni Math.random en render).
 * Las posiciones de las partículas se inicializan de forma determinista por índice.
 * Los números de los paneles son los que devuelven los resolvers de fluidos-data.ts.
 */

import * as THREE from "three";
import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Html, Line, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  type Modo,
  fluidoPorId,
  resolverFlotacion,
  resolverPresion,
  resolverFlujo,
  PROF_MAX,
  P_ATM,
  PEXT_MAX_KPA,
  fmtPresion,
  fmtFuerza,
  fmtVel,
  fmt1,
  fmt2,
} from "./fluidos-data";

export interface FluidosSceneProps {
  modo: Modo;
  fluidoId: string;
  // flotación
  rhoObj: number;
  volL: number;
  // presión
  prof: number; // m
  pextKpa: number; // sobrepresión kPa
  // flujo
  caudalLs: number; // L/s
  razon: number; // A2/A1
  // común
  playing: boolean;
  accent: string;
  resetNonce: number;
}

type Pt = [number, number, number];
const UP = new THREE.Vector3(0, 1, 0);

/* ── Flecha 3D (línea + punta cónica) ─────────────────────────────────────── */
function Flecha3D({ from, to, color, width = 3, opacity = 1 }: { from: Pt; to: Pt; color: string; width?: number; opacity?: number }) {
  const dir = new THREE.Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
  const len = dir.length();
  if (len < 1e-4) return null;
  const n = dir.clone().normalize();
  const head = Math.min(0.35, len * 0.35);
  const shaftEnd: Pt = [to[0] - n.x * head, to[1] - n.y * head, to[2] - n.z * head];
  const q = new THREE.Quaternion().setFromUnitVectors(UP, n);
  const conePos: Pt = [to[0] - (n.x * head) / 2, to[1] - (n.y * head) / 2, to[2] - (n.z * head) / 2];
  return (
    <group>
      <Line points={[from, shaftEnd] as Pt[]} color={color} lineWidth={width} transparent opacity={opacity} />
      <mesh position={conePos} quaternion={[q.x, q.y, q.z, q.w]}>
        <coneGeometry args={[head * 0.42, head, 14]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={opacity} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ── Etiqueta flotante ────────────────────────────────────────────────────── */
function Etiqueta({ pos, texto, sub, color, df = 16 }: { pos: Pt; texto: string; sub?: string; color: string; df?: number }) {
  return (
    <Html position={pos} center distanceFactor={df} pointerEvents="none">
      <div style={{ whiteSpace: "nowrap", textAlign: "center", padding: "2px 9px", borderRadius: 8, background: "rgba(5,13,26,0.85)", border: `1px solid ${color}88`, color, fontWeight: 900, fontSize: 10.5, fontFamily: "system-ui, sans-serif" }}>
        {texto}
        {sub && <div style={{ fontSize: 8.5, fontWeight: 800, color: "rgba(220,232,255,0.8)" }}>{sub}</div>}
      </div>
    </Html>
  );
}

/* ── Título flotante ──────────────────────────────────────────────────────── */
function Titulo({ texto, sub, color, y = 5.2 }: { texto: string; sub?: string; color: string; y?: number }) {
  return (
    <Html position={[0, y, 0]} center distanceFactor={22} pointerEvents="none">
      <div style={{ whiteSpace: "nowrap", textAlign: "center", padding: "4px 12px", borderRadius: 10, background: "rgba(4,12,26,0.9)", border: `1px solid ${color}aa`, color: "#fff", fontFamily: "system-ui, sans-serif", boxShadow: "0 6px 22px rgba(0,0,0,0.5)" }}>
        <div style={{ fontWeight: 900, fontSize: 12 }}>{texto}</div>
        {sub && <div style={{ fontWeight: 800, fontSize: 10.5, color }}>{sub}</div>}
      </div>
    </Html>
  );
}

/* ── Aristas de una caja (tanque de vidrio) ───────────────────────────────── */
function CajaAristas({ w, h, d, cy, color }: { w: number; h: number; d: number; cy: number; color: string }) {
  const x = w / 2, z = d / 2, yb = cy - h / 2, yt = cy + h / 2;
  const rect = (yy: number): Pt[] => [
    [-x, yy, -z], [x, yy, -z], [x, yy, z], [-x, yy, z], [-x, yy, -z],
  ];
  const verticales: Pt[][] = [
    [[-x, yb, -z], [-x, yt, -z]], [[x, yb, -z], [x, yt, -z]],
    [[x, yb, z], [x, yt, z]], [[-x, yb, z], [-x, yt, z]],
  ];
  return (
    <group>
      <Line points={rect(yb)} color={color} lineWidth={2} transparent opacity={0.85} />
      <Line points={rect(yt)} color={color} lineWidth={1.5} transparent opacity={0.5} />
      {verticales.map((seg, i) => (
        <Line key={i} points={seg} color={color} lineWidth={2} transparent opacity={0.8} />
      ))}
    </group>
  );
}

/* ── Geometría compartida del tanque ──────────────────────────────────────── */
const TANK_W = 5, TANK_D = 4, TANK_H = 7;
const TANK_CY = 0; // centro
const FLUID_BOTTOM = -TANK_H / 2; // -3.5

/* ───────────────────────── MODO FLOTACIÓN ───────────────────────── */
function ModoFlotacion({ fluidoId, rhoObj, volL, playing, accent }: Pick<FluidosSceneProps, "fluidoId" | "rhoObj" | "volL" | "playing" | "accent">) {
  const fluido = fluidoPorId(fluidoId);
  const volM3 = volL / 1000;
  const r = resolverFlotacion(rhoObj, fluido.rho, volM3);

  const fluidTop = 1.4;
  const fluidH = fluidTop - FLUID_BOTTOM;
  const L = 1.5; // lado visual del cubo

  // posición de equilibrio del cubo
  const baseY = r.flota
    ? fluidTop + L * (0.5 - r.fraccionSumergida)
    : FLUID_BOTTOM + L / 2 + 0.05;

  const grp = useRef<THREE.Group>(null);
  const tRef = useRef(0);
  useFrame((_, dt) => {
    const g = grp.current;
    if (!g) return;
    if (playing && r.flota) {
      tRef.current += dt;
      g.position.y = baseY + Math.sin(tRef.current * 1.6) * 0.07;
    } else {
      g.position.y = baseY;
    }
  });

  // escala de flechas (peso vs empuje)
  const maxF = Math.max(r.peso, r.empuje, 1e-6);
  const wLen = 0.6 + 1.8 * (r.peso / maxF);
  const eLen = 0.6 + 1.8 * (r.empuje / maxF);

  return (
    <group>
      <Titulo
        texto={r.flota ? "Flota (Arquímedes)" : "Se hunde"}
        sub={r.flota ? `sumergido ${fmt1(r.fraccionSumergida * 100)} % · E = W = ${fmtFuerza(r.empuje)}` : `peso aparente ${fmtFuerza(r.pesoAparente)} · E = ${fmtFuerza(r.empuje)}`}
        color={r.flota ? "#34D399" : "#fca5a5"}
      />

      {/* fluido */}
      <mesh position={[0, FLUID_BOTTOM + fluidH / 2, 0]}>
        <boxGeometry args={[TANK_W - 0.06, fluidH, TANK_D - 0.06]} />
        <meshStandardMaterial color={fluido.color} transparent opacity={0.34} roughness={0.1} metalness={0.0} />
      </mesh>
      {/* superficie brillante */}
      <mesh position={[0, fluidTop, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[TANK_W - 0.06, TANK_D - 0.06]} />
        <meshStandardMaterial color={fluido.color} transparent opacity={0.25} emissive={fluido.color} emissiveIntensity={0.2} side={THREE.DoubleSide} />
      </mesh>

      <CajaAristas w={TANK_W} h={TANK_H} d={TANK_D} cy={TANK_CY} color="#7da2c8" />

      {/* cubo + flechas (se mueven juntos) */}
      <group ref={grp} position={[0, baseY, 0]}>
        <mesh>
          <boxGeometry args={[L, L, L]} />
          <meshStandardMaterial color={accent} roughness={0.35} metalness={0.25} emissive={accent} emissiveIntensity={0.12} />
        </mesh>
        <Flecha3D from={[0, 0, 0]} to={[0, eLen, 0]} color="#34D399" />
        <Flecha3D from={[0, 0, 0]} to={[0, -wLen, 0]} color="#fca5a5" />
        <Etiqueta pos={[0.95, eLen * 0.7, 0]} texto={`E ${fmtFuerza(r.empuje)}`} color="#34D399" />
        <Etiqueta pos={[0.95, -wLen * 0.7, 0]} texto={`W ${fmtFuerza(r.peso)}`} color="#fca5a5" />
      </group>

      <Etiqueta pos={[-TANK_W / 2 - 0.7, fluidTop, 0]} texto={fluido.nombre} sub={`ρ = ${fmt1(fluido.rho)} kg/m³`} color={fluido.color} />
      <Etiqueta pos={[0, FLUID_BOTTOM - 0.6, 0]} texto={`cuerpo · ρ = ${fmt1(rhoObj)} kg/m³ · ${fmt1(volL)} L`} color={accent} />
    </group>
  );
}

/* ───────────────────────── MODO PRESIÓN ───────────────────────── */
function ModoPresion({ fluidoId, prof, pextKpa, playing, accent }: Pick<FluidosSceneProps, "fluidoId" | "prof" | "pextKpa" | "playing" | "accent">) {
  const fluido = fluidoPorId(fluidoId);
  const pextTotal = P_ATM + pextKpa * 1000;
  const r = resolverPresion(fluido.rho, prof, pextTotal);

  const fluidTop = 3.0;
  const fluidH = fluidTop - FLUID_BOTTOM; // 6.5
  // mapeo profundidad física → y visual
  const probeY = fluidTop - (prof / PROF_MAX) * fluidH;

  // escala de presión para las flechas radiales
  const maxP = P_ATM + PEXT_MAX_KPA * 1000 + 13600 * 9.81 * PROF_MAX;
  const aLen = 0.5 + 1.6 * Math.min(1, r.pAbsoluta / maxP);

  // émbolo (Pascal): baja un poco si hay sobrepresión
  const pistonY = fluidTop + 0.25;
  const pistonPush = pextKpa / PEXT_MAX_KPA; // 0..1

  const pulse = useRef<THREE.Group>(null);
  const tRef = useRef(0);
  useFrame((_, dt) => {
    const g = pulse.current;
    if (!g) return;
    if (playing) {
      tRef.current += dt;
      const s = 1 + Math.sin(tRef.current * 3) * 0.06;
      g.scale.setScalar(s);
    } else {
      g.scale.setScalar(1);
    }
  });

  const dirs: Pt[] = [
    [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1],
  ];

  return (
    <group>
      <Titulo
        texto="Presión en un fluido"
        sub={`P = P_ext + ρ·g·h = ${fmtPresion(r.pAbsoluta)}  (manométrica ${fmtPresion(r.pManometrica)})`}
        color={accent}
        y={fluidTop + 2.2}
      />

      {/* fluido con tono más oscuro = idea de mayor presión abajo */}
      <mesh position={[0, FLUID_BOTTOM + fluidH / 2, 0]}>
        <boxGeometry args={[TANK_W - 0.06, fluidH, TANK_D - 0.06]} />
        <meshStandardMaterial color={fluido.color} transparent opacity={0.32} roughness={0.1} />
      </mesh>
      <CajaAristas w={TANK_W} h={TANK_H} d={TANK_D} cy={TANK_CY} color="#7da2c8" />

      {/* émbolo (principio de Pascal) */}
      <mesh position={[0, pistonY + pistonPush * 0.0, 0]}>
        <boxGeometry args={[TANK_W - 0.1, 0.28, TANK_D - 0.1]} />
        <meshStandardMaterial color={pextKpa > 0 ? "#f59e0b" : "#64748b"} roughness={0.5} metalness={0.4} emissive={pextKpa > 0 ? "#f59e0b" : "#000"} emissiveIntensity={pextKpa > 0 ? 0.25 : 0} />
      </mesh>
      {pextKpa > 0 && (
        <>
          <Flecha3D from={[0, pistonY + 1.4, 0]} to={[0, pistonY + 0.25, 0]} color="#f59e0b" width={4} />
          <Etiqueta pos={[1.6, pistonY + 0.9, 0]} texto={`P_ext +${fmt1(pextKpa)} kPa`} sub="Pascal: se transmite a todo el fluido" color="#f59e0b" />
        </>
      )}

      {/* flechas de referencia a 3 profundidades (presión crece con h) */}
      {[0.25, 0.55, 0.85].map((f, i) => {
        const yy = fluidTop - f * fluidH;
        const pLoc = pextTotal + fluido.rho * 9.81 * (f * PROF_MAX);
        const len = 0.3 + 1.2 * Math.min(1, pLoc / maxP);
        return (
          <group key={i}>
            <Flecha3D from={[-TANK_W / 2 + 0.1, yy, 0]} to={[-TANK_W / 2 + 0.1 + len, yy, 0]} color="#93c5fd" width={2} opacity={0.7} />
            <Flecha3D from={[TANK_W / 2 - 0.1, yy, 0]} to={[TANK_W / 2 - 0.1 - len, yy, 0]} color="#93c5fd" width={2} opacity={0.7} />
          </group>
        );
      })}

      {/* sonda a profundidad h con flechas radiales (presión en todas direcciones) */}
      <group position={[0, probeY, 0]}>
        <group ref={pulse}>
          {dirs.map((d, i) => (
            <Flecha3D key={i} from={[0, 0, 0]} to={[d[0] * aLen, d[1] * aLen, d[2] * aLen]} color="#fde047" width={2.5} />
          ))}
        </group>
        <mesh>
          <sphereGeometry args={[0.22, 18, 18]} />
          <meshStandardMaterial color="#fde047" emissive="#fde047" emissiveIntensity={0.6} toneMapped={false} />
        </mesh>
        <Etiqueta pos={[0, -aLen - 0.5, 0]} texto={`h = ${fmt1(prof)} m`} sub={`P = ${fmtPresion(r.pAbsoluta)}`} color="#fde047" />
      </group>

      <Etiqueta pos={[-TANK_W / 2 - 0.7, fluidTop - 0.4, 0]} texto={fluido.nombre} sub={`ρ = ${fmt1(fluido.rho)} kg/m³`} color={fluido.color} />
    </group>
  );
}

/* ───────────────────────── MODO FLUJO ───────────────────────── */
const PIPE_X = 6;
const X_CONO_A = -1.2, X_CONO_B = 1.2;
const R_ANCHA = 1.25;

function radioEnX(x: number, rNarrow: number): number {
  if (x <= X_CONO_A) return R_ANCHA;
  if (x >= X_CONO_B) return rNarrow;
  const t = (x - X_CONO_A) / (X_CONO_B - X_CONO_A);
  return R_ANCHA + (rNarrow - R_ANCHA) * t;
}

const N_PART = 46;

function Particulas({ rNarrow, vWide, playing, color }: { rNarrow: number; vWide: number; playing: boolean; color: string }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  // posiciones iniciales deterministas (sin Math.random)
  const init = useMemo(() => {
    const arr: { x: number; ang: number; rf: number }[] = [];
    for (let i = 0; i < N_PART; i++) {
      arr.push({
        x: -PIPE_X + ((i * (2 * PIPE_X)) / N_PART),
        ang: (i * 2.39996) % (Math.PI * 2),
        rf: 0.18 + 0.72 * (((i * 7) % N_PART) / N_PART),
      });
    }
    return arr;
  }, []);
  const xs = useRef<number[]>(init.map((p) => p.x));

  // velocidad visual: escalada para que se aprecie la diferencia
  const kVis = 1.4 / Math.max(vWide, 0.01);

  useFrame((_, dt) => {
    if (!playing) return;
    for (let i = 0; i < N_PART; i++) {
      let x = xs.current[i]!;
      const rAtX = radioEnX(x, rNarrow);
      // v ∝ caudal/area ∝ 1/r²  → usa vWide en ancho, vNarrow en estrecho
      const vLocal = (R_ANCHA * R_ANCHA) / (rAtX * rAtX) * vWide;
      x += dt * vLocal * kVis;
      if (x > PIPE_X) x -= 2 * PIPE_X;
      xs.current[i] = x;
      const m = refs.current[i];
      if (!m) continue;
      const r = radioEnX(x, rNarrow) * init[i]!.rf;
      m.position.set(x, Math.sin(init[i]!.ang) * r, Math.cos(init[i]!.ang) * r);
    }
  });

  return (
    <group>
      {init.map((p, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }} position={[p.x, 0, 0]}>
          <sphereGeometry args={[0.12, 10, 10]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/** Cilindro abierto (pared de tubería) entre x0 y x1 con radios r0→r1. */
function Tubo({ x0, x1, r0, r1, color }: { x0: number; x1: number; r0: number; r1: number; color: string }) {
  const len = x1 - x0;
  return (
    <mesh position={[(x0 + x1) / 2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
      <cylinderGeometry args={[r1, r0, len, 28, 1, true]} />
      <meshStandardMaterial color={color} transparent opacity={0.22} side={THREE.DoubleSide} roughness={0.2} metalness={0.3} />
    </mesh>
  );
}

function ModoFlujo({ fluidoId, caudalLs, razon, playing, accent }: Pick<FluidosSceneProps, "fluidoId" | "caudalLs" | "razon" | "playing" | "accent">) {
  const fluido = fluidoPorId(fluidoId);
  const caudalM3s = caudalLs / 1000;
  const r = resolverFlujo(caudalM3s, razon, fluido);
  const rNarrow = R_ANCHA * Math.sqrt(razon);

  // manómetros: altura ∝ presión relativa (P1 ancho > P2 estrecho)
  const P1 = 60000; // referencia visual en la sección ancha (manométrica)
  const P2 = P1 + r.deltaP; // deltaP ≤ 0
  const maxMano = P1 + 5000;
  const hMano = (p: number) => 0.6 + 2.6 * Math.max(0.05, Math.min(1, p / maxMano));

  const xWide = (-PIPE_X + X_CONO_A) / 2;
  const xNarrow = (X_CONO_B + PIPE_X) / 2;

  return (
    <group>
      <Titulo
        texto="Continuidad y Bernoulli"
        sub={`A₁v₁ = A₂v₂ · v₁ ${fmtVel(r.v1)} → v₂ ${fmtVel(r.v2)} · la presión cae ${fmtPresion(Math.abs(r.deltaP))}`}
        color={accent}
        y={3.6}
      />

      {/* tubería: ancho · cono · estrecho */}
      <Tubo x0={-PIPE_X} x1={X_CONO_A} r0={R_ANCHA} r1={R_ANCHA} color="#8fb3d9" />
      <Tubo x0={X_CONO_A} x1={X_CONO_B} r0={R_ANCHA} r1={rNarrow} color="#8fb3d9" />
      <Tubo x0={X_CONO_B} x1={PIPE_X} r0={rNarrow} r1={rNarrow} color="#8fb3d9" />

      <Particulas rNarrow={rNarrow} vWide={r.v1} playing={playing} color={fluido.color} />

      {/* manómetros (columnas verticales de fluido) */}
      {[{ x: xWide, p: P1, v: r.v1, lbl: "ancha" }, { x: xNarrow, p: P2, v: r.v2, lbl: "estrecha" }].map((m, i) => {
        const h = hMano(m.p);
        const top = R_ANCHA + 0.1 + h;
        return (
          <group key={i}>
            <mesh position={[m.x, R_ANCHA + 0.1 + h / 2, 0]}>
              <cylinderGeometry args={[0.13, 0.13, h, 14, 1, true]} />
              <meshStandardMaterial color="#cbd5e1" transparent opacity={0.3} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[m.x, R_ANCHA + 0.1 + (h * 0.82) / 2, 0]}>
              <cylinderGeometry args={[0.1, 0.1, h * 0.82, 14]} />
              <meshStandardMaterial color={fluido.color} emissive={fluido.color} emissiveIntensity={0.25} />
            </mesh>
            <Etiqueta pos={[m.x, top + 0.5, 0]} texto={`v = ${fmtVel(m.v)}`} sub={`sección ${m.lbl}`} color={i === 1 ? "#fca5a5" : "#86efac"} />
          </group>
        );
      })}

      {/* flechas de velocidad sobre el eje */}
      <Flecha3D from={[xWide - 0.7, -R_ANCHA - 0.6, 0]} to={[xWide + 0.7, -R_ANCHA - 0.6, 0]} color="#86efac" width={3} />
      <Flecha3D from={[xNarrow - 1.1, -rNarrow - 0.6, 0]} to={[xNarrow + 1.1, -rNarrow - 0.6, 0]} color="#fca5a5" width={3} />

      <Etiqueta pos={[0, -R_ANCHA - 1.5, 0]} texto={`caudal Q = ${fmt1(caudalLs)} L/s`} sub={`${fluido.nombre} · Re ≈ ${fmt2(r.numReynolds / 1000)}k`} color={fluido.color} />
    </group>
  );
}

/* ── Contenido ────────────────────────────────────────────────────────────── */
function Contenido(props: FluidosSceneProps) {
  const { modo, accent, resetNonce, playing } = props;
  return (
    <>
      <color attach="background" args={["#040a16"]} />
      <fog attach="fog" args={["#040a16", 26, 80]} />

      <ambientLight intensity={0.75} />
      <directionalLight position={[5, 9, 8]} intensity={1.15} />
      <pointLight position={[-8, 4, 7]} intensity={0.5} color={accent} />
      <Stars radius={70} depth={30} count={800} factor={3} saturation={0} fade speed={0.5} />

      <group key={`${modo}-${resetNonce}`}>
        {modo === "flotacion" && <ModoFlotacion fluidoId={props.fluidoId} rhoObj={props.rhoObj} volL={props.volL} playing={playing} accent={accent} />}
        {modo === "presion" && <ModoPresion fluidoId={props.fluidoId} prof={props.prof} pextKpa={props.pextKpa} playing={playing} accent={accent} />}
        {modo === "flujo" && <ModoFlujo fluidoId={props.fluidoId} caudalLs={props.caudalLs} razon={props.razon} playing={playing} accent={accent} />}
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
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.8}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.5} luminanceThreshold={0.55} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.45} />
      </EffectComposer>
    </>
  );
}

export default function FluidosScene(props: FluidosSceneProps) {
  const cam = { position: [0.5, 1.5, 16] as Pt, fov: 48 };
  return (
    <Canvas key={props.modo} dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={cam}>
      <Contenido {...props} />
    </Canvas>
  );
}
