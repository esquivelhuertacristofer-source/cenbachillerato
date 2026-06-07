"use client";

/**
 * Escena 3D — "La derivada: la secante que se vuelve tangente (cociente de
 * Newton)" (PM-V-P03-A2).
 *
 * Un PLANO CARTESIANO flotante (z = 0) que se orbita, con escala propia por caso.
 * Dibuja:
 *  · la curva f(x),
 *  · el punto de tangencia P = (a, f(a)),
 *  · un segundo punto Q = (a+h, f(a+h)) sobre la curva,
 *  · la recta SECANTE por P y Q (su pendiente es el cociente de Newton),
 *  · la recta TANGENTE en P (pendiente f'(a)).
 * Cuando h → 0, Q se acerca a P y la secante se confunde con la tangente.
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
  func, evalFunc, deriv, muestrear, tangente, pendienteSecante, clipRecta, cruzaCorte,
  fmt2, type FuncId, type Vista,
} from "./derivada-data";

export interface DerivadaSceneProps {
  funcId: FuncId;
  aPos: number;     // punto de tangencia a
  hSep: number;     // separación h del segundo punto (cociente de Newton)
  accent: string;
  resetNonce: number;
}

type Pt = [number, number, number];

const AXIS_COL = "#7dd3fc";   // ejes
const GRID_COL = "#1f3a4d";   // rejilla
const SEC_COL = "#fbbf24";    // recta secante (cociente de Newton)
const TAN_COL = "#34D399";    // recta tangente (derivada)
const Q_COL = "#f472b6";      // segundo punto (a+h)

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

/* ── Curva de f (una o varias polilíneas si hay asíntota) ─────────────────── */
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

/* ── Secante + tangente + puntos P y Q ────────────────────────────────────── */
function Rectas({ funcId, v, aPos, hSep }: { funcId: FuncId; v: Vista; aPos: number; hSep: number }) {
  const { sx, sy, S } = useMemo(() => hacerMapa(v), [v]);
  const pulso = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (pulso.current) pulso.current.scale.setScalar(1 + Math.sin(s.clock.elapsedTime * 4) * 0.16);
  });

  const f = func(funcId);
  const fa = evalFunc(funcId, aPos);
  const m = deriv(funcId, aPos);
  const { m: mt, b: bt } = tangente(funcId, aPos);

  // segundo punto Q = (a+h, f(a+h)); válido si no cruza una asíntota
  const xq = aPos + hSep;
  const fq = evalFunc(funcId, xq);
  const secValida = !cruzaCorte(funcId, aPos, hSep) && Number.isFinite(fq);
  const mSec = pendienteSecante(funcId, aPos, hSep);
  const bSec = fa - mSec * aPos;

  const ax0 = v.ymin <= 0 && v.ymax >= 0 ? 0 : v.ymin;
  const ay0 = v.xmin <= 0 && v.xmax >= 0 ? 0 : v.xmin;

  // segmentos recortados a la vista (el React Compiler los memoiza)
  const tanSeg: Pt[] = clipRecta(mt, bt, v).map(([x, y]) => S(x, y));
  const secSeg: Pt[] = secValida ? clipRecta(mSec, bSec, v).map(([x, y]) => S(x, y)) : [];

  const pVisible = Number.isFinite(fa) && fa >= v.ymin && fa <= v.ymax;
  const qVisible = secValida && fq >= v.ymin && fq <= v.ymax && xq >= v.xmin && xq <= v.xmax;

  const P = S(aPos, fa);
  const Q = S(xq, fq);

  return (
    <group>
      {/* recta SECANTE (cociente de Newton) */}
      {secSeg.length === 2 && (
        <Line points={[secSeg[0]!, secSeg[1]!]} color={SEC_COL} lineWidth={2.6} dashed dashSize={0.22} gapSize={0.12} transparent opacity={0.92} />
      )}
      {/* recta TANGENTE (derivada) */}
      {tanSeg.length === 2 && (
        <Line points={[tanSeg[0]!, tanSeg[1]!]} color={TAN_COL} lineWidth={3.4} />
      )}

      {/* segmento h (base) entre las verticales de a y a+h */}
      {pVisible && qVisible && (
        <>
          <Line
            points={[[sx(aPos), sy(ax0), 0], [sx(xq), sy(ax0), 0]]}
            color={SEC_COL} lineWidth={2} transparent opacity={0.7}
          />
          <Etiqueta pos={[(sx(aPos) + sx(xq)) / 2, sy(ax0) - 0.36, 0]} color={SEC_COL} size={10} bg="rgba(6,16,31,0.82)">
            h = {fmt2(hSep)}
          </Etiqueta>
          <Line points={[[sx(xq), sy(ax0), 0], Q]} color={Q_COL} lineWidth={1.4} dashed dashSize={0.13} gapSize={0.1} transparent opacity={0.5} />
        </>
      )}

      {/* punto Q = (a+h, f(a+h)) */}
      {qVisible && (
        <>
          <mesh position={Q}>
            <sphereGeometry args={[0.13, 20, 20]} />
            <meshStandardMaterial color="#fff" emissive={Q_COL} emissiveIntensity={1.4} toneMapped={false} />
          </mesh>
          <Etiqueta pos={[Q[0] + 0.2, Q[1] + 0.45, 0.05]} color={Q_COL} size={10.5} bg="rgba(6,16,31,0.92)">
            Q = ({fmt2(xq)}, {fmt2(fq)})
          </Etiqueta>
        </>
      )}

      {/* punto de tangencia P = (a, f(a)) */}
      {pVisible && (
        <>
          <Line points={[[sx(aPos), sy(ax0), 0], P]} color={TAN_COL} lineWidth={1.4} dashed dashSize={0.13} gapSize={0.1} transparent opacity={0.5} />
          <Line points={[[sx(ay0), sy(fa), 0], P]} color={TAN_COL} lineWidth={1.4} dashed dashSize={0.13} gapSize={0.1} transparent opacity={0.4} />
          <group ref={pulso} position={P}>
            <mesh>
              <sphereGeometry args={[0.16, 22, 22]} />
              <meshStandardMaterial color="#fff" emissive={f.color} emissiveIntensity={1.9} toneMapped={false} />
            </mesh>
          </group>
          <Etiqueta pos={[P[0] - 0.2, P[1] + 0.55, 0.05]} color={f.color} size={12} bg="rgba(6,16,31,0.95)">
            P = ({fmt2(aPos)}, {fmt2(fa)})
          </Etiqueta>
          <Etiqueta pos={[P[0] + 1.7, P[1] - 0.5, 0.05]} color={TAN_COL} size={11} bg="rgba(6,16,31,0.92)">
            f&apos;({fmt2(aPos)}) = {fmt2(m)}
          </Etiqueta>
        </>
      )}
    </group>
  );
}

/* ── Contenido (descendiente del Canvas) ─────────────────────────────────── */
function Contenido({ funcId, aPos, hSep, accent, resetNonce }: DerivadaSceneProps) {
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
        <Curva funcId={funcId} v={v} color={f.color} />
        <Rectas funcId={funcId} v={v} aPos={aPos} hSep={hSep} />
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

export default function DerivadaScene(props: DerivadaSceneProps) {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={{ position: [3.2, 2.4, 13], fov: 44 }}>
      <Contenido {...props} />
    </Canvas>
  );
}
