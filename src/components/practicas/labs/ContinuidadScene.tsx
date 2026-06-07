"use client";

/**
 * Escena 3D — "Continuidad: las 3 condiciones, los tipos de discontinuidad y el
 * Teorema del Valor Intermedio" (PM-V-P02).
 *
 * Un PLANO CARTESIANO flotante (z = 0) que se orbita, con escala propia por caso
 * para mostrar valores REALES. Dos modos:
 *
 *  · CONTINUIDAD: dibuja f(x) (partida en saltos/huecos/asíntotas), marca el
 *    punto de análisis x = a y, según el tipo de discontinuidad, un ANILLO ABIERTO
 *    (límite no alcanzado) y/o un PUNTO LLENO (valor f(a)); para la esencial,
 *    una asíntota vertical. Un punto móvil P = (x, f(x)) recorre la curva.
 *  · TVI: dibuja g(x)=x³−x−1 en [1,2], los puntos (1,g(1)) y (2,g(2)), una recta
 *    horizontal y = N y el punto garantizado (c, N) donde g(c) = N (cruce).
 *
 * Patrón R3F: el default export solo monta <Canvas> y delega en <Contenido>.
 * React Compiler: nada de Math.random()/Date.now()/setState en render; la
 * geometría se memoiza y useFrame solo late en refs.
 */

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Html, Line } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  func, evalFunc, muestrear, muestrearG, bisectN, TVI, fmt1, fmt2,
  type FuncId, type Modo, type Vista,
} from "./continuidad-data";

export interface ContinuidadSceneProps {
  modo: Modo;
  funcId: FuncId;
  xPos: number;     // posición del punto móvil (modo continuidad)
  nObj: number;     // valor objetivo N (modo TVI)
  accent: string;
  resetNonce: number;
}

type Pt = [number, number, number];

const AXIS_COL = "#7dd3fc";   // ejes
const GRID_COL = "#1f3a4d";   // rejilla
const X_COL = "#fbbf24";      // posición de x (entrada)
const OK_COL = "#34D399";     // valor alcanzado / continuo / raíz
const HOLE_COL = "#f87171";   // hueco / no existe / asíntota

const BX = 5.6;               // semiancho del plano (unidades de escena)
const BY = 3.8;               // semialto del plano (unidades de escena)

/* ── Mapeo datos → plano (cierre sobre la vista activa) ───────────────────── */
function hacerMapa(v: Vista) {
  const sx = (dx: number) => -BX + ((dx - v.xmin) / (v.xmax - v.xmin)) * 2 * BX;
  const sy = (dy: number) => -BY + ((dy - v.ymin) / (v.ymax - v.ymin)) * 2 * BY;
  const S = (dx: number, dy: number): Pt => [sx(dx), sy(dy), 0];
  return { sx, sy, S };
}

function anilloPts(P: Pt, rad = 0.16, n = 40): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = (2 * Math.PI * i) / n;
    pts.push([P[0] + rad * Math.cos(t), P[1] + rad * Math.sin(t), P[2]]);
  }
  return pts;
}

/* ── Etiqueta flotante ────────────────────────────────────────────────────── */
function Etiqueta({
  pos, color, children, size = 11.5, bg = "rgba(6,16,31,0.82)",
}: {
  pos: Pt; color: string; children: React.ReactNode; size?: number; bg?: string;
}) {
  return (
    <Html position={pos} center distanceFactor={15} pointerEvents="none">
      <div style={{
        whiteSpace: "nowrap", padding: "4px 9px", borderRadius: 9, background: bg,
        border: `1px solid ${color}66`, color: "#fff", fontWeight: 700, fontSize: size,
        fontFamily: "system-ui, sans-serif", boxShadow: "0 8px 28px rgba(0,0,0,0.4)",
      }}>
        {children}
      </div>
    </Html>
  );
}

/* ── Rejilla + ejes + ticks ───────────────────────────────────────────────── */
function Plano({ v }: { v: Vista }) {
  const { sx, sy, S } = useMemo(() => hacerMapa(v), [v]);

  const geo = useMemo(() => {
    const pts: number[] = [];
    for (const tx of v.xticks) { pts.push(sx(tx), -BY, 0, sx(tx), BY, 0); }
    for (const ty of v.yticks) { pts.push(-BX, sy(ty), 0, BX, sy(ty), 0); }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pts), 3));
    return g;
  }, [v, sx, sy]);

  const ax0 = v.ymin <= 0 && v.ymax >= 0 ? 0 : v.ymin;
  const ay0 = v.xmin <= 0 && v.xmax >= 0 ? 0 : v.xmin;
  const ejeX: Pt[] = [S(v.xmin, ax0), S(v.xmax, ax0)];
  const ejeY: Pt[] = [S(ay0, v.ymin), S(ay0, v.ymax)];

  const fmtTick = (n: number) => n.toLocaleString("es-MX", { maximumFractionDigits: 1 }).replace("-", "−");

  return (
    <group>
      <lineSegments geometry={geo}>
        <lineBasicMaterial color={GRID_COL} transparent opacity={0.5} />
      </lineSegments>

      <Line points={ejeX} color={AXIS_COL} lineWidth={2.4} />
      <Line points={ejeY} color={AXIS_COL} lineWidth={2.4} />
      <Etiqueta pos={[BX + 0.5, sy(ax0), 0]} color={AXIS_COL} size={11} bg="rgba(6,16,31,0.7)">{v.xlabel}</Etiqueta>
      <Etiqueta pos={[sx(ay0), BY + 0.5, 0]} color={AXIS_COL} size={11} bg="rgba(6,16,31,0.7)">{v.ylabel}</Etiqueta>

      {v.xticks.filter((t) => t !== ay0).map((t) => (
        <Etiqueta key={`tx${t}`} pos={[sx(t), sy(ax0) - 0.34, 0]} color={AXIS_COL} size={9.5} bg="rgba(6,16,31,0.55)">{fmtTick(t)}</Etiqueta>
      ))}
      {v.yticks.filter((t) => t !== ax0).map((t) => (
        <Etiqueta key={`ty${t}`} pos={[sx(ay0) - 0.42, sy(t), 0]} color={AXIS_COL} size={9.5} bg="rgba(6,16,31,0.55)">{fmtTick(t)}</Etiqueta>
      ))}
    </group>
  );
}

/* ── Curva de f (una o varias polilíneas si hay saltos/huecos/asíntotas) ──── */
function Curva({ funcId, v, color }: { funcId: FuncId; v: Vista; color: string }) {
  const { S } = useMemo(() => hacerMapa(v), [v]);
  const polis = useMemo(() => {
    return muestrear(funcId).map((poli) =>
      poli
        .filter(([x, y]) => x >= v.xmin && x <= v.xmax && y >= v.ymin && y <= v.ymax)
        .map(([x, y]) => S(x, y)),
    );
  }, [funcId, v, S]);
  return (
    <>
      {polis.map((pts, i) =>
        pts.length > 1 ? <Line key={i} points={pts} color={color} lineWidth={4.5} /> : null,
      )}
    </>
  );
}

/* ── Marcadores de continuidad en x = a ───────────────────────────────────── */
function Marcadores({ funcId, v }: { funcId: FuncId; v: Vista }) {
  const { sx, S } = useMemo(() => hacerMapa(v), [v]);
  const f = func(funcId);

  const dentroX = f.a >= v.xmin && f.a <= v.xmax;
  const vertical: Pt[] = [[sx(f.a), -BY, 0], [sx(f.a), BY, 0]];
  const lineCol = f.tipo === "esencial" ? HOLE_COL : X_COL;

  // anillos / puntos según el tipo
  const ringLim = f.lim; // límite bilateral (evitable)
  const ringSaltoIzq = f.limIzq; // salto: límite izquierdo (no alcanzado)

  return (
    <group>
      {dentroX && (
        <Line
          points={vertical}
          color={lineCol}
          lineWidth={f.tipo === "esencial" ? 2.2 : 1.6}
          dashed
          dashSize={0.16}
          gapSize={0.12}
          transparent
          opacity={f.tipo === "esencial" ? 0.85 : 0.6}
        />
      )}
      {dentroX && (
        <Etiqueta pos={[sx(f.a), -BY - 0.42, 0]} color={lineCol} size={11} bg="rgba(6,16,31,0.85)">
          x = {f.a.toLocaleString("es-MX", { maximumFractionDigits: 1 })}
        </Etiqueta>
      )}

      {/* EVITABLE: anillo abierto en (a, lim) — f(a) no existe pero el límite sí */}
      {f.tipo === "evitable" && ringLim !== null && (
        <>
          <Line points={anilloPts(S(f.a, ringLim))} color={HOLE_COL} lineWidth={3} />
          <Etiqueta pos={[S(f.a, ringLim)[0] + 0.3, S(f.a, ringLim)[1] + 0.55, 0.05]} color={HOLE_COL} size={11} bg="rgba(6,16,31,0.92)">
            f({fmt1(f.a)}) no existe (0/0) · lím = {fmt2(ringLim)}
          </Etiqueta>
        </>
      )}

      {/* SALTO: anillo abierto en (a, limIzq) + punto lleno en (a, f(a)) */}
      {f.tipo === "salto" && ringSaltoIzq !== null && f.fa !== null && (
        <>
          <Line points={anilloPts(S(f.a, ringSaltoIzq))} color={HOLE_COL} lineWidth={3} />
          <Etiqueta pos={[S(f.a, ringSaltoIzq)[0] - 1.0, S(f.a, ringSaltoIzq)[1] - 0.1, 0.05]} color={HOLE_COL} size={10.5} bg="rgba(6,16,31,0.92)">
            lím izq = {fmt1(ringSaltoIzq)}
          </Etiqueta>
          <mesh position={S(f.a, f.fa)}>
            <sphereGeometry args={[0.15, 22, 22]} />
            <meshStandardMaterial color="#fff" emissive={f.color} emissiveIntensity={1.6} toneMapped={false} />
          </mesh>
          <Etiqueta pos={[S(f.a, f.fa)[0] + 0.95, S(f.a, f.fa)[1] + 0.15, 0.05]} color={f.color} size={10.5} bg="rgba(6,16,31,0.92)">
            f({fmt1(f.a)}) = lím der = {fmt1(f.fa)}
          </Etiqueta>
        </>
      )}

      {/* ESENCIAL: etiqueta de asíntota vertical */}
      {f.tipo === "esencial" && dentroX && (
        <Etiqueta pos={[sx(f.a) + 0.95, BY - 0.4, 0.05]} color={HOLE_COL} size={11} bg="rgba(6,16,31,0.92)">
          asíntota: x = {fmt1(f.a)} (±∞)
        </Etiqueta>
      )}

      {/* CONTINUA: punto lleno en (a, f(a)), todo en verde */}
      {f.tipo === "ninguna" && f.fa !== null && (
        <>
          <mesh position={S(f.a, f.fa)}>
            <sphereGeometry args={[0.15, 22, 22]} />
            <meshStandardMaterial color="#fff" emissive={OK_COL} emissiveIntensity={1.7} toneMapped={false} />
          </mesh>
          <Etiqueta pos={[S(f.a, f.fa)[0] + 0.95, S(f.a, f.fa)[1] + 0.45, 0.05]} color={OK_COL} size={11} bg="rgba(6,16,31,0.92)">
            f({fmt1(f.a)}) = lím = {fmt1(f.fa)} ✓
          </Etiqueta>
        </>
      )}
    </group>
  );
}

/* ── Punto móvil P = (x, f(x)) (modo continuidad) ─────────────────────────── */
function Movil({ funcId, v, xPos }: { funcId: FuncId; v: Vista; xPos: number }) {
  const { sx, sy, S } = useMemo(() => hacerMapa(v), [v]);
  const pulso = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (pulso.current) pulso.current.scale.setScalar(1 + Math.sin(s.clock.elapsedTime * 4) * 0.16);
  });

  const f = func(funcId);
  const y = evalFunc(funcId, xPos);
  const visible = Number.isFinite(y) && xPos >= v.xmin && xPos <= v.xmax && y >= v.ymin && y <= v.ymax;
  if (!visible) return null;

  const ax0 = v.ymin <= 0 && v.ymax >= 0 ? 0 : v.ymin;
  const ay0 = v.xmin <= 0 && v.xmax >= 0 ? 0 : v.xmin;
  const P = S(xPos, y);
  const baseX: Pt = [sx(xPos), sy(ax0), 0];
  const baseY: Pt = [sx(ay0), sy(y), 0];

  return (
    <group>
      <Line points={[baseX, P]} color={X_COL} lineWidth={2.2} dashed dashSize={0.16} gapSize={0.11} />
      <Line points={[P, baseY]} color={OK_COL} lineWidth={2.2} dashed dashSize={0.16} gapSize={0.11} />

      <mesh position={baseX}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color={X_COL} emissive={X_COL} emissiveIntensity={0.7} toneMapped={false} />
      </mesh>

      <group ref={pulso} position={P}>
        <mesh>
          <sphereGeometry args={[0.15, 22, 22]} />
          <meshStandardMaterial color="#fff" emissive={f.color} emissiveIntensity={1.8} toneMapped={false} />
        </mesh>
      </group>
      <Etiqueta pos={[P[0] + 0.15, P[1] + 0.5, 0.05]} color={f.color} size={12} bg="rgba(6,16,31,0.92)">
        f({fmt2(xPos)}) = {fmt2(y)}
      </Etiqueta>
    </group>
  );
}

/* ── Escena del Teorema del Valor Intermedio ──────────────────────────────── */
function EscenaTvi({ nObj }: { nObj: number }) {
  const v = TVI.vista;
  const { sx, sy, S } = useMemo(() => hacerMapa(v), [v]);
  const pulso = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (pulso.current) pulso.current.scale.setScalar(1 + Math.sin(s.clock.elapsedTime * 4) * 0.16);
  });

  const curva = useMemo(() => {
    return muestrearG()
      .filter(([x, y]) => x >= v.xmin && x <= v.xmax && y >= v.ymin && y <= v.ymax)
      .map(([x, y]) => S(x, y));
  }, [v, S]);

  const c = bisectN(nObj);
  const esRaiz = Math.abs(nObj) < 1e-9;

  const horizontal: Pt[] = [[-BX, sy(nObj), 0], [BX, sy(nObj), 0]];
  const vertA: Pt[] = [[sx(TVI.a), -BY, 0], [sx(TVI.a), BY, 0]];
  const vertB: Pt[] = [[sx(TVI.b), -BY, 0], [sx(TVI.b), BY, 0]];
  const vertC: Pt[] = [[sx(c), sy(v.ymin), 0], [sx(c), sy(nObj), 0]];

  return (
    <group>
      {/* curva g */}
      {curva.length > 1 && <Line points={curva} color="#a78bfa" lineWidth={4.5} />}

      {/* límites del intervalo [a,b] */}
      <Line points={vertA} color={X_COL} lineWidth={1.4} dashed dashSize={0.14} gapSize={0.12} transparent opacity={0.5} />
      <Line points={vertB} color={X_COL} lineWidth={1.4} dashed dashSize={0.14} gapSize={0.12} transparent opacity={0.5} />
      <Etiqueta pos={[sx(TVI.a), -BY - 0.42, 0]} color={X_COL} size={10.5} bg="rgba(6,16,31,0.8)">a = 1</Etiqueta>
      <Etiqueta pos={[sx(TVI.b), -BY - 0.42, 0]} color={X_COL} size={10.5} bg="rgba(6,16,31,0.8)">b = 2</Etiqueta>

      {/* extremos (a, g(a)) y (b, g(b)) */}
      <mesh position={S(TVI.a, TVI.ga)}>
        <sphereGeometry args={[0.13, 20, 20]} />
        <meshStandardMaterial color="#fff" emissive={HOLE_COL} emissiveIntensity={1.4} toneMapped={false} />
      </mesh>
      <Etiqueta pos={[S(TVI.a, TVI.ga)[0] - 0.7, S(TVI.a, TVI.ga)[1] - 0.1, 0.05]} color={HOLE_COL} size={11} bg="rgba(6,16,31,0.92)">
        g(1) = −1
      </Etiqueta>
      <mesh position={S(TVI.b, TVI.gb)}>
        <sphereGeometry args={[0.13, 20, 20]} />
        <meshStandardMaterial color="#fff" emissive={OK_COL} emissiveIntensity={1.4} toneMapped={false} />
      </mesh>
      <Etiqueta pos={[S(TVI.b, TVI.gb)[0] - 0.7, S(TVI.b, TVI.gb)[1] + 0.1, 0.05]} color={OK_COL} size={11} bg="rgba(6,16,31,0.92)">
        g(2) = 5
      </Etiqueta>

      {/* recta objetivo y = N */}
      <Line points={horizontal} color={esRaiz ? OK_COL : "#fbbf24"} lineWidth={1.8} dashed dashSize={0.18} gapSize={0.12} transparent opacity={0.7} />
      <Etiqueta pos={[-BX - 0.7, sy(nObj), 0]} color={esRaiz ? OK_COL : "#fbbf24"} size={11} bg="rgba(6,16,31,0.92)">
        {esRaiz ? "N = 0 (raíz)" : `N = ${fmt2(nObj)}`}
      </Etiqueta>

      {/* punto garantizado (c, N) */}
      <Line points={vertC} color={esRaiz ? OK_COL : "#fbbf24"} lineWidth={1.6} dashed dashSize={0.14} gapSize={0.1} transparent opacity={0.6} />
      <group ref={pulso} position={S(c, nObj)}>
        <mesh>
          <sphereGeometry args={[0.16, 22, 22]} />
          <meshStandardMaterial color="#fff" emissive={esRaiz ? OK_COL : "#fbbf24"} emissiveIntensity={2} toneMapped={false} />
        </mesh>
      </group>
      <Etiqueta pos={[S(c, nObj)[0] + 0.2, S(c, nObj)[1] + 0.55, 0.05]} color={esRaiz ? OK_COL : "#fbbf24"} size={12} bg="rgba(6,16,31,0.95)">
        c ≈ {fmt3Local(c)} · g(c) = {fmt2(nObj)}
      </Etiqueta>
    </group>
  );
}

function fmt3Local(n: number): string {
  return n.toLocaleString("es-MX", { maximumFractionDigits: 4 }).replace("-", "−");
}

/* ── Contenido (descendiente del Canvas) ─────────────────────────────────── */
function Contenido({ modo, funcId, xPos, nObj, accent, resetNonce }: ContinuidadSceneProps) {
  const f = func(funcId);
  const v = modo === "tvi" ? TVI.vista : f.vista;

  return (
    <>
      <color attach="background" args={["#08131f"]} />
      <fog attach="fog" args={["#08131f", 22, 60]} />

      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 9, 11]} intensity={1.3} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-far={40} />
      <pointLight position={[-6, 4, 6]} intensity={0.5} color={accent} />

      <group key={`${modo}-${funcId}-${resetNonce}`}>
        <Plano v={v} />
        {modo === "continuidad" ? (
          <>
            <Curva funcId={funcId} v={v} color={f.color} />
            <Marcadores funcId={funcId} v={v} />
            <Movil funcId={funcId} v={v} xPos={xPos} />
          </>
        ) : (
          <EscenaTvi nObj={nObj} />
        )}
      </group>

      <ContactShadows position={[0, -BY - 0.5, 0]} opacity={0.3} scale={24} blur={2.6} far={9} />

      <Environment resolution={128}>
        <group>
          <Lightformer intensity={1.3} position={[0, 6, 8]} scale={10} color="#eaf1ff" />
          <Lightformer intensity={0.7} position={[6, 2, 5]} scale={6} color="#cfe0ff" />
          <Lightformer intensity={0.5} position={[-6, 3, 4]} scale={6} color="#ffd9b3" />
        </group>
      </Environment>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={7}
        maxDistance={26}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 1.55}
        target={[0, 0, 0]}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.5} luminanceThreshold={0.62} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.4} />
      </EffectComposer>
    </>
  );
}

export default function ContinuidadScene(props: ContinuidadSceneProps) {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={{ position: [3.2, 2.4, 13], fov: 44 }}>
      <Contenido {...props} />
    </Canvas>
  );
}
