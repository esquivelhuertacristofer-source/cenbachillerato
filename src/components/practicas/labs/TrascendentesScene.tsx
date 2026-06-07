"use client";

/**
 * Escena 3D — "Derivadas de funciones trascendentes: trig, exp y log"
 * (PM-V-P05-A2).
 *
 * Un PLANO CARTESIANO flotante (z = 0) que se orbita, con escala propia por caso.
 * Dibuja a la vez:
 *  · la curva f(x)            (color de la función),
 *  · la curva f'(x)           (ámbar): la DERIVADA es a su vez una función,
 *  · una sonda vertical en x = a,
 *  · el punto P = (a, f(a)) sobre f con su recta TANGENTE (pendiente f'(a)),
 *  · el punto D = (a, f'(a)) sobre la curva de la derivada.
 * La ALTURA de D coincide con la PENDIENTE de la tangente en P: derivar las
 * funciones trascendentes (con sus derivadas básicas + cadena/producto) es
 * justamente construir esa curva f'.
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
  func, evalFunc, deriv, muestrear, tangente, clipRecta,
  fmt2, type FuncId, type Vista, type Curva,
} from "./trascendentes-data";

export interface TrascendentesSceneProps {
  funcId: FuncId;
  aPos: number;     // sonda x = a
  accent: string;
  resetNonce: number;
}

type Pt = [number, number, number];

const AXIS_COL = "#7dd3fc";   // ejes
const GRID_COL = "#1f3a4d";   // rejilla
const DER_COL = "#fbbf24";    // curva de la derivada f'
const TAN_COL = "#34D399";    // recta tangente a f
const A_COL = "#7dd3fc";      // sonda x = a

const BX = 5.6;               // semiancho del plano (unidades de escena)
const BY = 3.8;               // semialto del plano (unidades de escena)

/* ── Mapeo datos → plano (cierre sobre la vista activa) ───────────────────── */
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
        <Etiqueta key={`ty${t}`} pos={[sx(ay0) - 0.42, sy(t), 0]} color={AXIS_COL} size={9.5} bg="rgba(6,16,31,0.55)">{fmtTick(t)}</Etiqueta>
      ))}
    </group>
  );
}

/* ── Curva (f o f') ───────────────────────────────────────────────────────── */
function CurvaTrazo({ funcId, which, v, color, width, dashed }: {
  funcId: FuncId; which: Curva; v: Vista; color: string; width: number; dashed?: boolean;
}) {
  const { S } = useMemo(() => hacerMapa(v), [v]);
  const polis = useMemo(() => {
    return muestrear(funcId, which).map((poli) =>
      poli
        .filter(([x, y]) => x >= v.xmin && x <= v.xmax && y >= v.ymin && y <= v.ymax)
        .map(([x, y]) => S(x, y)),
    );
  }, [funcId, which, v, S]);
  return (
    <>
      {polis.map((pts, i) =>
        pts.length > 1
          ? <Line key={i} points={pts} color={color} lineWidth={width} dashed={dashed} dashSize={0.22} gapSize={0.14} transparent opacity={dashed ? 0.95 : 1} />
          : null,
      )}
    </>
  );
}

/* ── Sonda en x = a: tangente sobre f + punto D sobre f' ──────────────────── */
function SondaActiva({ funcId, v, aPos }: { funcId: FuncId; v: Vista; aPos: number }) {
  const { sx, sy, S } = useMemo(() => hacerMapa(v), [v]);
  const pulso = useRef<THREE.Group>(null);
  const pulsoD = useRef<THREE.Group>(null);
  useFrame((s) => {
    const k = 1 + Math.sin(s.clock.elapsedTime * 4) * 0.16;
    if (pulso.current) pulso.current.scale.setScalar(k);
    if (pulsoD.current) pulsoD.current.scale.setScalar(k);
  });

  const f = func(funcId);
  const fa = evalFunc(funcId, aPos);
  const da = deriv(funcId, aPos);
  const { m: mt, b: bt } = tangente(funcId, aPos);

  const ax0 = v.ymin <= 0 && v.ymax >= 0 ? 0 : v.ymin;

  // segmento de la tangente recortado a la vista (el React Compiler lo memoiza)
  const tanSeg: Pt[] = clipRecta(mt, bt, v).map(([x, y]) => S(x, y));

  const pVisible = Number.isFinite(fa) && fa >= v.ymin && fa <= v.ymax && aPos >= v.xmin && aPos <= v.xmax;
  const dVisible = Number.isFinite(da) && da >= v.ymin && da <= v.ymax && aPos >= v.xmin && aPos <= v.xmax;

  const P = S(aPos, fa);
  const D = S(aPos, da);

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

      {/* recta TANGENTE a f en P (su pendiente es f'(a)) */}
      {tanSeg.length === 2 && (
        <Line points={[tanSeg[0]!, tanSeg[1]!]} color={TAN_COL} lineWidth={3.2} />
      )}

      {/* enlace vertical P ↔ D: la altura de D = pendiente de la tangente en P */}
      {pVisible && dVisible && (
        <Line points={[P, D]} color={DER_COL} lineWidth={1.5} dashed dashSize={0.13} gapSize={0.1} transparent opacity={0.55} />
      )}

      {/* punto D = (a, f'(a)) sobre la curva de la derivada */}
      {dVisible && (
        <>
          <Line points={[[sx(aPos), sy(ax0), 0], D]} color={DER_COL} lineWidth={1.2} dashed dashSize={0.12} gapSize={0.1} transparent opacity={0.4} />
          <group ref={pulsoD} position={D}>
            <mesh>
              <sphereGeometry args={[0.13, 20, 20]} />
              <meshStandardMaterial color="#fff" emissive={DER_COL} emissiveIntensity={1.5} toneMapped={false} />
            </mesh>
          </group>
          <Etiqueta pos={[D[0] + 0.2, D[1] - 0.5, 0.05]} color={DER_COL} size={11} bg="rgba(6,16,31,0.92)">
            f&apos;({fmt2(aPos)}) = {fmt2(da)}
          </Etiqueta>
        </>
      )}

      {/* punto de tangencia P = (a, f(a)) */}
      {pVisible && (
        <>
          <group ref={pulso} position={P}>
            <mesh>
              <sphereGeometry args={[0.16, 22, 22]} />
              <meshStandardMaterial color="#fff" emissive={f.color} emissiveIntensity={1.9} toneMapped={false} />
            </mesh>
          </group>
          <Etiqueta pos={[P[0] - 0.2, P[1] + 0.55, 0.05]} color={f.color} size={12} bg="rgba(6,16,31,0.95)">
            P = ({fmt2(aPos)}, {fmt2(fa)})
          </Etiqueta>
        </>
      )}
    </group>
  );
}

/* ── Contenido (descendiente del Canvas) ─────────────────────────────────── */
function Contenido({ funcId, aPos, accent, resetNonce }: TrascendentesSceneProps) {
  const f = func(funcId);
  const v = f.vista;

  return (
    <>
      <color attach="background" args={["#08131f"]} />
      <fog attach="fog" args={["#08131f", 22, 60]} />

      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 9, 11]} intensity={1.3} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-far={40} />
      <pointLight position={[-6, 4, 6]} intensity={0.5} color={accent} />

      <group key={`${funcId}-${resetNonce}`}>
        <Plano v={v} />
        <CurvaTrazo funcId={funcId} which="d" v={v} color={DER_COL} width={3} dashed />
        <CurvaTrazo funcId={funcId} which="f" v={v} color={f.color} width={4.5} />
        <SondaActiva funcId={funcId} v={v} aPos={aPos} />
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

export default function TrascendentesScene(props: TrascendentesSceneProps) {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={{ position: [3.2, 2.4, 13], fov: 44 }}>
      <Contenido {...props} />
    </Canvas>
  );
}
