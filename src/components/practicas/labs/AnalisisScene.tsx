"use client";

/**
 * Escena 3D — "Análisis completo de una función: máximos, mínimos e inflexión"
 * (PM-V-P06-A2).
 *
 * Un PLANO CARTESIANO flotante (z = 0) que se orbita. Dibuja a la vez:
 *  · la curva f(x)            (teal),
 *  · la curva f'(x)           (ámbar, punteada): localiza críticos donde cruza el eje,
 *  · la curva f''(x)          (violeta, punteada): da la concavidad e inflexión,
 *  · marcadores fijos: máximo (verde), mínimo (rojo), inflexión (violeta),
 *  · una sonda x = a con la tangente a f y los puntos alineados sobre f, f' y f''.
 * En un crítico la tangente es horizontal y el punto de f' toca el eje (f' = 0);
 * la inflexión es donde el punto de f'' cruza el eje (f'' = 0).
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
  VISTA, PUNTOS, evalF, evalD1, evalD2, muestrear, tangente, clipRecta, fmt2,
  type Curva, type Vista,
} from "./analisis-data";

export interface AnalisisSceneProps {
  aPos: number;       // sonda x = a
  show1: boolean;     // mostrar f'(x)
  show2: boolean;     // mostrar f''(x)
  accent: string;
  resetNonce: number;
}

type Pt = [number, number, number];

const AXIS_COL = "#7dd3fc";   // ejes
const GRID_COL = "#1f3a4d";   // rejilla
const F_COL = "#2DD4BF";      // curva f
const D1_COL = "#fbbf24";     // curva f'
const D2_COL = "#C084FC";     // curva f''
const TAN_COL = "#34D399";    // tangente a f en a
const A_COL = "#7dd3fc";      // sonda x = a

const BX = 5.8;               // semiancho del plano (unidades de escena)
const BY = 3.9;               // semialto del plano (unidades de escena)

/* ── Mapeo datos → plano ──────────────────────────────────────────────────── */
function hacerMapa(v: Vista) {
  const sx = (dx: number) => -BX + ((dx - v.xmin) / (v.xmax - v.xmin)) * 2 * BX;
  const sy = (dy: number) => -BY + ((dy - v.ymin) / (v.ymax - v.ymin)) * 2 * BY;
  const S = (dx: number, dy: number): Pt => [sx(dx), sy(dy), 0];
  return { sx, sy, S };
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

  const fmtTick = (n: number) => n.toLocaleString("es-MX", { maximumFractionDigits: 2 }).replace("-", "−");

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
        <Etiqueta key={`ty${t}`} pos={[sx(ay0) - 0.5, sy(t), 0]} color={AXIS_COL} size={9.5} bg="rgba(6,16,31,0.55)">{fmtTick(t)}</Etiqueta>
      ))}
    </group>
  );
}

/* ── Curva (f, f' o f'') ──────────────────────────────────────────────────── */
function CurvaTrazo({ which, v, color, width, dashed }: {
  which: Curva; v: Vista; color: string; width: number; dashed?: boolean;
}) {
  const { S } = useMemo(() => hacerMapa(v), [v]);
  const polis = useMemo(() => {
    return muestrear(which).map((poli) =>
      poli
        .filter(([x, y]) => x >= v.xmin && x <= v.xmax && y >= v.ymin && y <= v.ymax)
        .map(([x, y]) => S(x, y)),
    );
  }, [which, v, S]);
  return (
    <>
      {polis.map((pts, i) =>
        pts.length > 1
          ? <Line key={i} points={pts} color={color} lineWidth={width} dashed={dashed} dashSize={0.24} gapSize={0.15} transparent opacity={dashed ? 0.95 : 1} />
          : null,
      )}
    </>
  );
}

/* ── Marcadores fijos de puntos notables sobre f ──────────────────────────── */
function Notables({ v }: { v: Vista }) {
  const { S } = useMemo(() => hacerMapa(v), [v]);
  return (
    <group>
      {PUNTOS.map((p) => {
        const P = S(p.x, p.y);
        return (
          <group key={p.id}>
            <mesh position={P}>
              <sphereGeometry args={[0.17, 22, 22]} />
              <meshStandardMaterial color="#fff" emissive={p.color} emissiveIntensity={1.7} toneMapped={false} />
            </mesh>
            <Etiqueta pos={[P[0], P[1] + (p.id === "min" ? -0.6 : 0.6), 0.05]} color={p.color} size={11}>
              {p.tipo} ({fmt2(p.x)}, {fmt2(p.y)})
            </Etiqueta>
          </group>
        );
      })}
    </group>
  );
}

/* ── Sonda en x = a: tangente a f + puntos alineados en f, f', f'' ─────────── */
function SondaActiva({ v, aPos, show1, show2 }: { v: Vista; aPos: number; show1: boolean; show2: boolean }) {
  const { sx, sy, S } = useMemo(() => hacerMapa(v), [v]);
  const pulso = useRef<THREE.Group>(null);
  useFrame((s) => {
    const k = 1 + Math.sin(s.clock.elapsedTime * 4) * 0.16;
    if (pulso.current) pulso.current.scale.setScalar(k);
  });

  const fa = evalF(aPos);
  const d1 = evalD1(aPos);
  const d2 = evalD2(aPos);
  const { m: mt, b: bt } = tangente(aPos);
  const ax0 = v.ymin <= 0 && v.ymax >= 0 ? 0 : v.ymin;

  // segmento de la tangente recortado a la vista (el React Compiler lo memoiza)
  const tanSeg: Pt[] = clipRecta(mt, bt, v).map(([x, y]) => S(x, y));

  const vis = (y: number) => Number.isFinite(y) && y >= v.ymin && y <= v.ymax && aPos >= v.xmin && aPos <= v.xmax;
  const P = S(aPos, fa);
  const D1 = S(aPos, d1);
  const D2 = S(aPos, d2);

  return (
    <group>
      {/* sonda vertical en x = a */}
      <Line
        points={[[sx(aPos), -BY, 0], [sx(aPos), BY, 0]]}
        color={A_COL} lineWidth={1.5} dashed dashSize={0.16} gapSize={0.12} transparent opacity={0.5}
      />
      <Etiqueta pos={[sx(aPos), -BY - 0.4, 0]} color={A_COL} size={10.5} bg="rgba(6,16,31,0.85)">
        x = {fmt2(aPos)}
      </Etiqueta>

      {/* recta TANGENTE a f en P (pendiente f'(a)) */}
      {tanSeg.length === 2 && (
        <Line points={[tanSeg[0]!, tanSeg[1]!]} color={TAN_COL} lineWidth={3} />
      )}

      {/* punto sobre f'' (concavidad) */}
      {show2 && vis(d2) && (
        <>
          <Line points={[[sx(aPos), sy(ax0), 0], D2]} color={D2_COL} lineWidth={1.1} dashed dashSize={0.12} gapSize={0.1} transparent opacity={0.4} />
          <mesh position={D2}>
            <sphereGeometry args={[0.12, 18, 18]} />
            <meshStandardMaterial color="#fff" emissive={D2_COL} emissiveIntensity={1.4} toneMapped={false} />
          </mesh>
          <Etiqueta pos={[D2[0] + 0.2, D2[1] + 0.45, 0.05]} color={D2_COL} size={10.5} bg="rgba(6,16,31,0.92)">
            f&apos;&apos;({fmt2(aPos)}) = {fmt2(d2)}
          </Etiqueta>
        </>
      )}

      {/* punto sobre f' (pendiente de f) */}
      {show1 && vis(d1) && (
        <>
          <Line points={[[sx(aPos), sy(ax0), 0], D1]} color={D1_COL} lineWidth={1.1} dashed dashSize={0.12} gapSize={0.1} transparent opacity={0.4} />
          <mesh position={D1}>
            <sphereGeometry args={[0.13, 20, 20]} />
            <meshStandardMaterial color="#fff" emissive={D1_COL} emissiveIntensity={1.5} toneMapped={false} />
          </mesh>
          <Etiqueta pos={[D1[0] + 0.2, D1[1] - 0.5, 0.05]} color={D1_COL} size={10.5} bg="rgba(6,16,31,0.92)">
            f&apos;({fmt2(aPos)}) = {fmt2(d1)}
          </Etiqueta>
        </>
      )}

      {/* punto P = (a, f(a)) sobre f */}
      {vis(fa) && (
        <>
          <group ref={pulso} position={P}>
            <mesh>
              <sphereGeometry args={[0.16, 22, 22]} />
              <meshStandardMaterial color="#fff" emissive={F_COL} emissiveIntensity={1.9} toneMapped={false} />
            </mesh>
          </group>
          <Etiqueta pos={[P[0] - 0.2, P[1] + 0.6, 0.05]} color={F_COL} size={12} bg="rgba(6,16,31,0.95)">
            P = ({fmt2(aPos)}, {fmt2(fa)})
          </Etiqueta>
        </>
      )}
    </group>
  );
}

/* ── Contenido (descendiente del Canvas) ─────────────────────────────────── */
function Contenido({ aPos, show1, show2, accent, resetNonce }: AnalisisSceneProps) {
  const v = VISTA;
  return (
    <>
      <color attach="background" args={["#08131f"]} />
      <fog attach="fog" args={["#08131f", 22, 60]} />

      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 9, 11]} intensity={1.3} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-far={40} />
      <pointLight position={[-6, 4, 6]} intensity={0.5} color={accent} />

      <group key={resetNonce}>
        <Plano v={v} />
        {show2 && <CurvaTrazo which="d2" v={v} color={D2_COL} width={2.6} dashed />}
        {show1 && <CurvaTrazo which="d1" v={v} color={D1_COL} width={3} dashed />}
        <CurvaTrazo which="f" v={v} color={F_COL} width={4.5} />
        <Notables v={v} />
        <SondaActiva v={v} aPos={aPos} show1={show1} show2={show2} />
      </group>

      <ContactShadows position={[0, -BY - 0.5, 0]} opacity={0.3} scale={24} blur={2.6} far={9} />

      <Environment resolution={128}>
        <group>
          <Lightformer intensity={1.3} position={[0, 6, 8]} scale={10} color="#eaf1ff" />
          <Lightformer intensity={0.7} position={[6, 2, 5]} scale={6} color="#cfe0ff" />
          <Lightformer intensity={0.5} position={[-6, 3, 4]} scale={6} color="#e9d5ff" />
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

export default function AnalisisScene(props: AnalisisSceneProps) {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={{ position: [3.2, 2.4, 13], fov: 44 }}>
      <Contenido {...props} />
    </Canvas>
  );
}
