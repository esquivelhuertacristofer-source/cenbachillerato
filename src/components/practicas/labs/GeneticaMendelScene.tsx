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
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { T, OK } from "./_kit";
import { Escenario } from "./_escenario";
import {
  type Modo, type Geno1, type GenoDi, type GenoMadre, type GenoPadre, type Herencia,
  type MuestraCruce, resolverMono, resolverDi, resolverLig, HERENCIAS, FENO_DI,
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
  /** 0 = cuadro ya lleno; >0 = animar el cruce (gametos a casillas). */
  cruzarNonce: number;
  /** Descendencia sembrada (null = sin campo). */
  muestra: MuestraCruce | null;
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


/* ── Animación del cruce: tiempos ─────────────────────────────────────────── */
const VUELO = 0.8; // s que tarda un gameto en llegar a su casilla
const tLlega = (i: number, dt: number) => VUELO + i * dt;
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const easeOutBack = (k: number) => { const c = 1.7; const x = k - 1; return 1 + (c + 1) * x * x * x + c * x * x; };
const hash = (i: number) => { const s = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return s - Math.floor(s); };
const DUM = new THREE.Object3D();
const COL = new THREE.Color();

/** Casilla que "se llena": al llegar los gametos, su contenido crece desde el centro. */
function Revelar({ pos, idx, dt, animar, children, etiqueta }: {
  pos: Pt; idx: number; dt: number; animar: boolean; children: ReactNode; etiqueta?: ReactNode;
}) {
  const g = useRef<THREE.Group>(null);
  const ini = useRef<number | null>(null);
  const [listo, setListo] = useState(!animar);
  useFrame((state) => {
    if (!animar || !g.current) return;
    ini.current ??= state.clock.elapsedTime;
    const k = clamp01((state.clock.elapsedTime - ini.current - tLlega(idx, dt)) / 0.45);
    g.current.scale.setScalar(k > 0 ? Math.max(0.0001, easeOutBack(k)) : 0.0001);
    if (k > 0 && !listo) setListo(true);
  });
  return (
    <group ref={g} position={pos} scale={animar ? 0.0001 : 1}>
      {children}
      {listo && etiqueta}
    </group>
  );
}

/** Gametos de cada progenitor viajando a la casilla que les toca. */
function FlujoGametos({ animar, destinos, desdeFila, desdeCol, dt, accent }: {
  animar: boolean; destinos: Pt[]; desdeFila: Pt[]; desdeCol: Pt[]; dt: number; accent: string;
}) {
  const mA = useRef<THREE.InstancedMesh>(null);
  const mB = useRef<THREE.InstancedMesh>(null);
  const ini = useRef<number | null>(null);
  const n = destinos.length;
  useFrame((state) => {
    if (!animar || !mA.current || !mB.current) return;
    ini.current ??= state.clock.elapsedTime;
    const t = state.clock.elapsedTime - ini.current;
    for (let i = 0; i < n; i++) {
      const u = (t - (tLlega(i, dt) - VUELO)) / VUELO;
      const dentro = u >= 0 && u <= 1;
      const e = clamp01(u) * clamp01(u) * (3 - 2 * clamp01(u));
      const to = destinos[i]!;
      const lote: [THREE.InstancedMesh, Pt][] = [[mA.current, desdeFila[i]!], [mB.current, desdeCol[i]!]];
      for (const [m, f] of lote) {
        DUM.position.set(
          f[0] + (to[0] - f[0]) * e,
          f[1] + (to[1] - f[1]) * e,
          0.55 + Math.sin(Math.PI * clamp01(u)) * 0.7,
        );
        DUM.rotation.set(0, 0, 0);
        DUM.scale.setScalar(dentro ? 0.15 : 0.0001);
        DUM.updateMatrix();
        m.setMatrixAt(i, DUM.matrix);
      }
    }
    mA.current.instanceMatrix.needsUpdate = true;
    mB.current.instanceMatrix.needsUpdate = true;
  });
  if (!animar) return null;
  return (
    <>
      <instancedMesh ref={mA} args={[undefined, undefined, n]} frustumCulled={false}>
        <sphereGeometry args={[1, 14, 12]} />
        <meshStandardMaterial color="#fcd34d" emissive="#fcd34d" emissiveIntensity={0.7} roughness={0.3} />
      </instancedMesh>
      <instancedMesh ref={mB} args={[undefined, undefined, n]} frustumCulled={false}>
        <sphereGeometry args={[1, 14, 12]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.7} roughness={0.3} />
      </instancedMesh>
    </>
  );
}

/** Tablero oscuro detrás del cuadro: da cuerpo y sombra a las casillas. */
function Tablero({ lado }: { lado: number }) {
  return (
    <mesh position={[0, 0, -0.36]}>
      <boxGeometry args={[lado, lado, 0.12]} />
      <meshStandardMaterial color="#071326" roughness={0.85} metalness={0.1} />
    </mesh>
  );
}

/* ── Modo monohíbrido ─────────────────────────────────────────────────────── */
function EscenaMono({ p1, p2, herencia, playing, accent, animar }: { p1: Geno1; p2: Geno1; herencia: Herencia; playing: boolean; accent: string; animar: boolean }) {
  const r = resolverMono(p1, p2, herencia);
  const H = HERENCIAS[herencia];
  const SZ = 2.3;
  const X = [-1.35, 1.35];
  const Y = [1.35, -1.35];
  const dt = 0.9;
  const pos = r.celdas.map((_, i): Pt => [X[i % 2]!, Y[Math.floor(i / 2)]!, 0]);
  return (
    <group>
      {/* progenitores */}
      <group position={[-1.35, 4.2, 0]}>
        <Flor color={H[p1].color} color2={H[p1].color2} seed={1.1} playing={playing} escala={1.15} />
        <Etiqueta pos={[0, -0.9, 0]} df={12} fuerte col={accent}>♀ {p1}</Etiqueta>
      </group>
      <group position={[1.35, 4.2, 0]}>
        <Flor color={H[p2].color} color2={H[p2].color2} seed={2.4} playing={playing} escala={1.15} />
        <Etiqueta pos={[0, -0.9, 0]} df={12} fuerte col={accent}>♂ {p2}</Etiqueta>
      </group>
      <Etiqueta pos={[0, 4.2, 0]} df={14}>×</Etiqueta>

      <Tablero lado={5.3} />
      {/* encabezados de gametos */}
      <Etiqueta pos={[-2.85, 2.85, 0]} df={13} col={T.text3}>gametos</Etiqueta>
      {r.gam2.map((a, i) => <Etiqueta key={`c${i}`} pos={[X[i]!, 2.85, 0]} df={11} fuerte col={accent}>{a}</Etiqueta>)}
      {r.gam1.map((a, i) => <Etiqueta key={`f${i}`} pos={[-2.85, Y[i]!, 0]} df={11} fuerte col={accent}>{a}</Etiqueta>)}

      {/* casillas */}
      {r.celdas.map((c, i) => {
        const f = H[c.geno];
        return (
          <group key={i}>
            <Casilla pos={pos[i]!} size={SZ} accent={accent} />
            <Revelar pos={pos[i]!} idx={i} dt={dt} animar={animar}
              etiqueta={<Etiqueta pos={[0, -0.78, 0.2]} df={10} fuerte col={c.geno === "aa" ? "#fca5a5" : OK}>{c.geno}</Etiqueta>}>
              <group position={[0, 0.25, 0.2]}>
                <Flor color={f.color} color2={f.color2} seed={i * 1.7 + 0.5} playing={playing} escala={1.15} />
              </group>
            </Revelar>
          </group>
        );
      })}
      <FlujoGametos animar={animar} dt={dt} accent={accent} destinos={pos}
        desdeFila={pos.map((_, i): Pt => [-2.85, Y[Math.floor(i / 2)]!, 0.5])}
        desdeCol={pos.map((_, i): Pt => [X[i % 2]!, 2.85, 0.5])} />
    </group>
  );
}

/* ── Modo dihíbrido ───────────────────────────────────────────────────────── */
function EscenaDi({ p1, p2, playing, accent, animar }: { p1: GenoDi; p2: GenoDi; playing: boolean; accent: string; animar: boolean }) {
  const r = resolverDi(p1, p2);
  const SZ = 1.18;
  const STEP = 1.32;
  const coord = (k: number) => (k - 1.5) * STEP;
  const dt = 0.3;
  const pos = r.celdas.map((_, i): Pt => [coord(i % 4), -coord(Math.floor(i / 4)), 0]);
  return (
    <group>
      {/* título del cruce */}
      <Etiqueta pos={[0, 3.95, 0]} df={15} fuerte col={accent}>{p1} × {p2}</Etiqueta>
      <Tablero lado={5.4} />

      {/* encabezados de gametos */}
      {r.gam2.map((a, i) => <Etiqueta key={`c${i}`} pos={[coord(i), 3.0, 0]} df={11} fuerte col={accent}>{a}</Etiqueta>)}
      {r.gam1.map((a, i) => <Etiqueta key={`f${i}`} pos={[-2.85, -coord(i), 0]} df={11} fuerte col={accent}>{a}</Etiqueta>)}

      {/* casillas (16) */}
      {r.celdas.map((c, i) => {
        const fd = FENO_DI[c.feno];
        return (
          <group key={i}>
            <Casilla pos={pos[i]!} size={SZ} accent={accent} />
            <Revelar pos={pos[i]!} idx={i} dt={dt} animar={animar}
              etiqueta={<Etiqueta pos={[0, -0.42, 0.25]} df={9}>{c.genoA}{c.genoB}</Etiqueta>}>
              <group position={[0, 0.06, 0.25]}>
                <Semilla color={fd.color} rugosa={fd.rugosa} seed={i * 0.9} playing={playing} />
              </group>
            </Revelar>
          </group>
        );
      })}
      <FlujoGametos animar={animar} dt={dt} accent={accent} destinos={pos}
        desdeFila={pos.map((_, i): Pt => [-2.85, -coord(Math.floor(i / 4)), 0.5])}
        desdeCol={pos.map((_, i): Pt => [coord(i % 4), 3.0, 0.5])} />
    </group>
  );
}

/* ── Modo ligado al sexo ──────────────────────────────────────────────────── */
function EscenaLig({ madre, padre, playing, accent, animar }: { madre: GenoMadre; padre: GenoPadre; playing: boolean; accent: string; animar: boolean }) {
  const r = resolverLig(madre, padre);
  const SZ = 2.4;
  const X = [-1.4, 1.4];
  const Y = [1.4, -1.4];
  const dt = 0.9;
  const pos = r.celdas.map((_, i): Pt => [X[i % 2]!, Y[Math.floor(i / 2)]!, 0]);
  const FCOL: Record<string, string> = {
    hijaNormal: "#f9a8d4", hijaPortadora: "#c084fc", hijaDaltonica: "#ef4444",
    hijoNormal: "#60a5fa", hijoDaltonico: "#ef4444",
  };
  return (
    <group>
      {/* título */}
      <Etiqueta pos={[0, 4.2, 0]} df={15} fuerte col={accent}>
        ♀ {madre.replace("XD", "Xᴰ").replace("Xd", "Xᵈ").replace("XD", "Xᴰ").replace("Xd", "Xᵈ")} × ♂ {padre === "XDY" ? "XᴰY" : "XᵈY"}
      </Etiqueta>
      <Tablero lado={5.5} />

      {/* encabezados de gametos */}
      <Etiqueta pos={[-2.95, 2.95, 0]} df={13} col={T.text3}>gametos</Etiqueta>
      {r.gamPadre.map((a, i) => <Etiqueta key={`c${i}`} pos={[X[i]!, 2.95, 0]} df={11} fuerte col={accent}>{a === "Y" ? "Y" : `X${a === "D" ? "ᴰ" : "ᵈ"}`}</Etiqueta>)}
      {r.gamMadre.map((a, i) => <Etiqueta key={`f${i}`} pos={[-2.95, Y[i]!, 0]} df={11} fuerte col={accent}>X{a === "D" ? "ᴰ" : "ᵈ"}</Etiqueta>)}

      {/* casillas */}
      {r.celdas.map((c, i) => {
        const tipo: "XX" | "XY" = c.feno.startsWith("hija") ? "XX" : "XY";
        const color = FCOL[c.feno] ?? "#fff";
        return (
          <group key={i}>
            <Casilla pos={pos[i]!} size={SZ} accent={accent} />
            <Revelar pos={pos[i]!} idx={i} dt={dt} animar={animar}
              etiqueta={
                <Etiqueta pos={[0, -0.82, 0.3]} df={10} fuerte col={c.feno === "hijoDaltonico" || c.feno === "hijaDaltonica" ? "#fca5a5" : OK}>
                  {tipo === "XX" ? "♀" : "♂"} {c.etqGeno.replace(/\^D/g, "ᴰ").replace(/\^d/g, "ᵈ")}
                </Etiqueta>
              }>
              <group position={[0, 0.3, 0.3]} scale={1.15}>
                <ParCrom tipo={tipo} color={color} seed={i * 1.3} playing={playing} />
              </group>
            </Revelar>
          </group>
        );
      })}
      <FlujoGametos animar={animar} dt={dt} accent={accent} destinos={pos}
        desdeFila={pos.map((_, i): Pt => [-2.95, Y[Math.floor(i / 2)]!, 0.5])}
        desdeCol={pos.map((_, i): Pt => [X[i % 2]!, 2.95, 0.5])} />
    </group>
  );
}

/* ── Campo de descendientes (instanciado, máx. 100) ───────────────────────── */
type Kind = "petalo" | "centro" | "semL" | "semR" | "cabeza" | "cono" | "capsula";
interface Pieza { kind: Kind; pos: Pt; rotZ: number; sc: Pt; color: string; i: number }
const PASO_BROTE = 0.03; // s entre un descendiente y el siguiente

function construirPiezas(modo: Modo, m: MuestraCruce, pitch: number, cols: number): Pieza[] {
  const out: Pieza[] = [];
  const rows = Math.ceil(m.n / cols);
  for (let i = 0; i < m.n; i++) {
    const cat = m.cats[m.idx[i]!]!;
    const x = ((i % cols) - (cols - 1) / 2) * pitch + (hash(i) - 0.5) * pitch * 0.12;
    const y = ((rows - 1) / 2 - Math.floor(i / cols)) * pitch + (hash(i + 99) - 0.5) * pitch * 0.12;
    if (modo === "monohibrido") {
      const sc = pitch * 0.62;
      const giro = hash(i + 7) * Math.PI;
      for (let p = 0; p < 6; p++) {
        const a = (p / 6) * Math.PI * 2 + giro;
        const col = cat.color2 && p % 2 === 1 ? cat.color2 : cat.color;
        out.push({ kind: "petalo", pos: [x + Math.cos(a) * 0.34 * sc, y + Math.sin(a) * 0.34 * sc, 0.12], rotZ: a, sc: [0.34 * sc, 0.18 * sc, 0.16 * sc], color: col, i });
      }
      out.push({ kind: "centro", pos: [x, y, 0.2], rotZ: 0, sc: [0.2 * sc, 0.2 * sc, 0.2 * sc], color: "#fde047", i });
    } else if (modo === "dihibrido") {
      const r = pitch * 0.4;
      out.push({ kind: cat.rugosa ? "semR" : "semL", pos: [x, y, 0.2], rotZ: hash(i) * 3, sc: [r, r, r], color: cat.color, i });
    } else {
      const sc = pitch * 0.95;
      out.push({ kind: "cabeza", pos: [x, y + 0.3 * sc, 0.2], rotZ: 0, sc: [0.15 * sc, 0.15 * sc, 0.15 * sc], color: "#fde4cf", i });
      if (cat.sexo === "hija") out.push({ kind: "cono", pos: [x, y - 0.07 * sc, 0.2], rotZ: 0, sc: [0.24 * sc, 0.2 * sc, 0.24 * sc], color: cat.color, i });
      else out.push({ kind: "capsula", pos: [x, y - 0.05 * sc, 0.2], rotZ: 0, sc: [0.3 * sc, 0.17 * sc, 0.3 * sc], color: cat.color, i });
    }
  }
  return out;
}

function Campo({ modo, muestra, pitch, cols }: { modo: Modo; muestra: MuestraCruce; pitch: number; cols: number }) {
  const porKind = useMemo(() => {
    const m = new Map<Kind, Pieza[]>();
    for (const p of construirPiezas(modo, muestra, pitch, cols)) {
      const l = m.get(p.kind);
      if (l) l.push(p); else m.set(p.kind, [p]);
    }
    return m;
  }, [modo, muestra, pitch, cols]);
  const refs = useRef<Partial<Record<Kind, THREE.InstancedMesh | null>>>({});
  const ini = useRef<number | null>(null);
  const listo = useRef(false);

  useEffect(() => {
    porKind.forEach((lista, kind) => {
      const mesh = refs.current[kind];
      if (!mesh) return;
      lista.forEach((p, j) => {
        mesh.setColorAt(j, COL.set(p.color));
        DUM.position.set(p.pos[0], p.pos[1], p.pos[2]);
        DUM.rotation.set(0, 0, p.rotZ);
        DUM.scale.setScalar(0.0001);
        DUM.updateMatrix();
        mesh.setMatrixAt(j, DUM.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    });
    ini.current = null;
    listo.current = false;
  }, [porKind]);

  useFrame((state) => {
    if (listo.current) return;
    ini.current ??= state.clock.elapsedTime;
    const t = state.clock.elapsedTime - ini.current;
    porKind.forEach((lista, kind) => {
      const mesh = refs.current[kind];
      if (!mesh) return;
      lista.forEach((p, j) => {
        const k = clamp01((t - p.i * PASO_BROTE) / 0.5);
        const g = k > 0 ? Math.max(0.0001, easeOutBack(k)) : 0.0001;
        DUM.position.set(p.pos[0], p.pos[1], p.pos[2]);
        DUM.rotation.set(0, 0, p.rotZ);
        DUM.scale.set(p.sc[0] * g, p.sc[1] * g, p.sc[2] * g);
        DUM.updateMatrix();
        mesh.setMatrixAt(j, DUM.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    });
    if (t > muestra.n * PASO_BROTE + 0.7) listo.current = true;
  });

  const geo = (kind: Kind) => {
    if (kind === "semR") return <icosahedronGeometry args={[1, 1]} />;
    if (kind === "cono") return <coneGeometry args={[1, 2, 14]} />;
    if (kind === "capsula") return <capsuleGeometry args={[0.5, 1, 4, 10]} />;
    return <sphereGeometry args={[1, kind === "petalo" || kind === "centro" ? 10 : 16, 10]} />;
  };
  return (
    <>
      {Array.from(porKind.entries()).map(([kind, lista]) => (
        <instancedMesh key={kind} args={[undefined, undefined, lista.length]} frustumCulled={false}
          ref={(m) => { refs.current[kind] = m; }}>
          {geo(kind)}
          <meshStandardMaterial roughness={kind === "semR" ? 0.85 : 0.45} metalness={0.05} flatShading={kind === "semR"} />
        </instancedMesh>
      ))}
    </>
  );
}

/* ── Encuadre: que el cuadro (y el campo) quepan entre la barra y el aviso ─── */
interface Caja { x0: number; x1: number; y0: number; y1: number }
const CAJAS: Record<Modo, Caja> = {
  monohibrido: { x0: -4.1, x1: 2.7, y0: -2.7, y1: 5.2 },
  dihibrido: { x0: -3.6, x1: 2.7, y0: -2.8, y1: 4.5 },
  ligado: { x0: -4.2, x1: 2.8, y0: -2.8, y1: 4.8 },
};
const CAM_Z = 13.5;
const CAM_FOV = 46;
const RESERVA_ARRIBA = 64;
const RESERVA_ABAJO = 150;
const GAP = 0.9;

function campoDims(n: number) {
  const pitch = n <= 30 ? 0.95 : n <= 60 ? 0.78 : 0.62;
  const cols = Math.ceil(Math.sqrt(n * 1.15));
  const rows = Math.ceil(n / cols);
  return { pitch, cols, rows, w: cols * pitch + 0.5, h: rows * pitch + 0.5 };
}

function planEncuadre(modo: Modo, n: number, W: number, H: number) {
  const caja = CAJAS[modo];
  const visH = 2 * CAM_Z * Math.tan(((CAM_FOV / 2) * Math.PI) / 180);
  const wpp = visH / Math.max(1, H);
  const uH = Math.max(H * 0.4, H - RESERVA_ARRIBA - RESERVA_ABAJO) * wpp;
  const uW = Math.max(W * 0.5, W - 24) * wpp;
  const ccx = (caja.x0 + caja.x1) / 2, ccy = (caja.y0 + caja.y1) / 2;
  const subir = ((RESERVA_ABAJO - RESERVA_ARRIBA) / 2) * wpp;
  const ajusta = (x0: number, x1: number, y0: number, y1: number) => {
    const s = Math.min(uW / (x1 - x0), uH / (y1 - y0), 1.5);
    return { s, x: -((x0 + x1) / 2) * s, y: -((y0 + y1) / 2) * s + subir };
  };
  if (n <= 0) return { ...ajusta(caja.x0, caja.x1, caja.y0, caja.y1), campo: null };
  const f = campoDims(n);
  const hCampo = f.h + 0.9; // + título
  // A) campo a la derecha
  const gxA = caja.x1 + GAP + f.w / 2;
  const A = ajusta(caja.x0, caja.x1 + GAP + f.w, Math.min(caja.y0, ccy - hCampo / 2), Math.max(caja.y1, ccy + hCampo / 2));
  // B) campo debajo
  const gyB = caja.y0 - GAP - hCampo / 2;
  const B = ajusta(Math.min(caja.x0, ccx - f.w / 2), Math.max(caja.x1, ccx + f.w / 2), caja.y0 - GAP - hCampo, caja.y1);
  return A.s >= B.s
    ? { ...A, campo: { x: gxA, y: ccy, ...f } }
    : { ...B, campo: { x: ccx, y: gyB, ...f } };
}

/* ── Contenido de la escena ───────────────────────────────────────────────── */
function Contenido(props: GeneticaMendelSceneProps) {
  const { modo, playing, accent, resetNonce, cruzarNonce, muestra } = props;
  const size = useThree((s) => s.size);
  const plan = planEncuadre(modo, muestra ? muestra.n : 0, size.width, size.height);
  const animar = cruzarNonce > 0;
  return (
    <>
      {/* Suelo, luz de tres puntos y entorno que reflejar. */}
      {/* Sin altura: esta escena no tenía sombra de la que leerla, así
          que el escenario la MIDE de la propia escena al montarse, en
          vez de que alguien la adivine. */}
      <Escenario acento={accent} mesa={false} niebla={false} />
      <directionalLight position={[-8, -4, 4]} intensity={0.35} color={accent} />
      <Stars radius={80} depth={40} count={1400} factor={3} saturation={0} fade speed={0.6} />

      <group position={[plan.x, plan.y, 0]} scale={plan.s}>
        <group key={`${modo}-${resetNonce}-${cruzarNonce}`}>
          {modo === "monohibrido" && (
            <EscenaMono p1={props.monoP1} p2={props.monoP2} herencia={props.herencia} playing={playing} accent={accent} animar={animar} />
          )}
          {modo === "dihibrido" && (
            <EscenaDi p1={props.diP1} p2={props.diP2} playing={playing} accent={accent} animar={animar} />
          )}
          {modo === "ligado" && (
            <EscenaLig madre={props.madre} padre={props.padre} playing={playing} accent={accent} animar={animar} />
          )}
        </group>

        {muestra && plan.campo && (
          <group position={[plan.campo.x, plan.campo.y, 0]} key={`campo-${modo}-${resetNonce}-${muestra.id}`}>
            {/* tierra del campo */}
            <mesh position={[0, -0.45, -0.2]}>
              <boxGeometry args={[plan.campo.w, plan.campo.h, 0.25]} />
              <meshStandardMaterial color="#3a2a1b" roughness={0.95} metalness={0} />
            </mesh>
            <Etiqueta pos={[0, (plan.campo.h + 0.9) / 2 - 0.15, 0]} df={12} fuerte col={accent}>
              {muestra.n} {modo === "dihibrido" ? "semillas" : modo === "ligado" ? "descendientes" : "plantas"}
            </Etiqueta>
            <group position={[0, -0.45, 0]}>
              <Campo modo={modo} muestra={muestra} pitch={plan.campo.pitch} cols={plan.campo.cols} />
            </group>
          </group>
        )}
      </group>

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
  const cam = { position: [0, 0, CAM_Z] as Pt, fov: CAM_FOV };
  return (
    <Canvas key={props.modo} dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={cam}>
      <Contenido {...props} />
    </Canvas>
  );
}
