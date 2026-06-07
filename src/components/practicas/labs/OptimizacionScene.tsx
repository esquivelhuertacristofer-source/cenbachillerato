"use client";

/**
 * Escena 3D — "Optimización con la derivada: la lata de mínimo material"
 * (PM-V-P07-A2).
 *
 * Dos elementos en un mismo espacio 3D que se orbita:
 *  · IZQUIERDA — el CILINDRO físico SIN tapa (lata): radio r controlado por el
 *    alumno, altura h impuesta por la restricción V = π r² h = 1000 (la altura
 *    se recalcula sola). Pared lateral (violeta) + base circular (ámbar) =
 *    material. Al variar r el envase pasa de alto-delgado a bajo-ancho.
 *  · DERECHA — el PLANO de costo A(r): la curva del material total (teal) y su
 *    descomposición en base π r² (ámbar) y lateral 2000/r (violeta). Marcador
 *    fijo en el MÍNIMO (r ≈ 6.83, A ≈ 439.3) y una sonda r con la recta tangente
 *    a A: en el óptimo la tangente es horizontal porque A'(r) = 0.
 *
 * Patrón R3F: el default export solo monta <Canvas> y delega en <Contenido>.
 * React Compiler: nada de Math.random()/Date.now()/setState en render; la
 * geometría se memoiza y useFrame solo late/gira en refs.
 */

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Html, Line } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  VISTA, R_OPT, A_OPT, hDeR, areaTotal,
  muestrear, tangente, clipRecta, fmt1, fmt2,
  type Curva, type Vista,
} from "./optimizacion-data";

export interface OptimizacionSceneProps {
  rPos: number;        // radio explorado (cm)
  showDecomp: boolean; // mostrar base/lateral en el plano
  accent: string;
  resetNonce: number;
}

type Pt = [number, number, number];

const AXIS_COL = "#7dd3fc";   // ejes
const GRID_COL = "#1f3a4d";   // rejilla
const TOTAL_COL = "#2DD4BF";  // material total A(r)
const BASE_COL = "#fbbf24";   // base π r²
const LAT_COL = "#C084FC";    // lateral 2000/r
const OPT_COL = "#34D399";    // mínimo / tangente horizontal
const R_COL = "#7dd3fc";      // sonda r

const BX = 4.2;               // semiancho del plano
const BY = 3.0;               // semialto del plano
const PLANE_X = 3.2;          // desplazamiento del plano (derecha)
const CYL_X = -5.2;           // desplazamiento del cilindro (izquierda)
const W = 0.165;              // escala cm → unidades de escena (cilindro)

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
    <Html position={pos} center distanceFactor={16} pointerEvents="none">
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

/* ── Rejilla + ejes + ticks (plano de costo) ──────────────────────────────── */
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

  const ejeX: Pt[] = [S(v.xmin, v.ymin), S(v.xmax, v.ymin)];
  const ejeY: Pt[] = [S(v.xmin, v.ymin), S(v.xmin, v.ymax)];
  const fmtTick = (n: number) => n.toLocaleString("es-MX", { maximumFractionDigits: 0 }).replace("-", "−");

  return (
    <group>
      <lineSegments geometry={geo}>
        <lineBasicMaterial color={GRID_COL} transparent opacity={0.5} />
      </lineSegments>

      <Line points={ejeX} color={AXIS_COL} lineWidth={2.4} />
      <Line points={ejeY} color={AXIS_COL} lineWidth={2.4} />
      <Etiqueta pos={[BX + 0.5, -BY, 0]} color={AXIS_COL} size={11} bg="rgba(6,16,31,0.7)">{v.xlabel}</Etiqueta>
      <Etiqueta pos={[-BX, BY + 0.5, 0]} color={AXIS_COL} size={11} bg="rgba(6,16,31,0.7)">{v.ylabel}</Etiqueta>

      {v.xticks.filter((t) => t !== v.xmin).map((t) => (
        <Etiqueta key={`tx${t}`} pos={[sx(t), -BY - 0.34, 0]} color={AXIS_COL} size={9.5} bg="rgba(6,16,31,0.55)">{fmtTick(t)}</Etiqueta>
      ))}
      {v.yticks.filter((t) => t !== v.ymin).map((t) => (
        <Etiqueta key={`ty${t}`} pos={[-BX - 0.66, sy(t), 0]} color={AXIS_COL} size={9.5} bg="rgba(6,16,31,0.55)">{fmtTick(t)}</Etiqueta>
      ))}
    </group>
  );
}

/* ── Curva (total, base o lateral) ────────────────────────────────────────── */
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

/* ── Marcador fijo del MÍNIMO sobre la curva total ────────────────────────── */
function Minimo({ v }: { v: Vista }) {
  const { sx, S } = useMemo(() => hacerMapa(v), [v]);
  const P = S(R_OPT, A_OPT);
  return (
    <group>
      {/* guía punteada al eje r */}
      <Line points={[[sx(R_OPT), -BY, 0], P]} color={OPT_COL} lineWidth={1.2} dashed dashSize={0.14} gapSize={0.1} transparent opacity={0.5} />
      <mesh position={P}>
        <sphereGeometry args={[0.17, 22, 22]} />
        <meshStandardMaterial color="#fff" emissive={OPT_COL} emissiveIntensity={1.8} toneMapped={false} />
      </mesh>
      <Etiqueta pos={[P[0], P[1] + 0.62, 0.05]} color={OPT_COL} size={11}>
        mínimo ({fmt2(R_OPT)}, {fmt1(A_OPT)})
      </Etiqueta>
    </group>
  );
}

/* ── Sonda en r: punto sobre A(r) + recta tangente (horizontal en el óptimo) ─ */
function SondaActiva({ v, rPos }: { v: Vista; rPos: number }) {
  const { sx, S } = useMemo(() => hacerMapa(v), [v]);
  const pulso = useRef<THREE.Group>(null);
  useFrame((s) => {
    const k = 1 + Math.sin(s.clock.elapsedTime * 4) * 0.16;
    if (pulso.current) pulso.current.scale.setScalar(k);
  });

  const a = areaTotal(rPos);
  const { m: mt, b: bt } = tangente(rPos);

  // segmento de la tangente recortado a la vista (el React Compiler lo memoiza)
  const tanSeg: Pt[] = clipRecta(mt, bt, v).map(([x, y]) => S(x, y));

  const vis = Number.isFinite(a) && a >= v.ymin && a <= v.ymax && rPos >= v.xmin && rPos <= v.xmax;
  const P = S(rPos, a);

  return (
    <group>
      <Line points={[[sx(rPos), -BY, 0], [sx(rPos), BY, 0]]} color={R_COL} lineWidth={1.5} dashed dashSize={0.16} gapSize={0.12} transparent opacity={0.5} />
      <Etiqueta pos={[sx(rPos), -BY - 0.4, 0]} color={R_COL} size={10.5} bg="rgba(6,16,31,0.85)">r = {fmt2(rPos)}</Etiqueta>

      {tanSeg.length === 2 && (
        <Line points={[tanSeg[0]!, tanSeg[1]!]} color={OPT_COL} lineWidth={3} />
      )}

      {vis && (
        <>
          <group ref={pulso} position={P}>
            <mesh>
              <sphereGeometry args={[0.16, 22, 22]} />
              <meshStandardMaterial color="#fff" emissive={TOTAL_COL} emissiveIntensity={1.9} toneMapped={false} />
            </mesh>
          </group>
          <Etiqueta pos={[P[0] + 0.2, P[1] + 0.6, 0.05]} color={TOTAL_COL} size={11.5} bg="rgba(6,16,31,0.95)">
            A({fmt2(rPos)}) = {fmt1(a)}
          </Etiqueta>
        </>
      )}
    </group>
  );
}

/* ── Cilindro físico (lata sin tapa): radio r, altura h por la restricción ──── */
function Lata({ rPos }: { rPos: number }) {
  const giro = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (giro.current) giro.current.rotation.y += dt * 0.35;
  });

  const rW = rPos * W;
  const hW = hDeR(rPos) * W;

  return (
    <group position={[CYL_X, -BY, 0]}>
      {/* base de apoyo (suelo) */}
      <mesh position={[0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[Math.max(rW, 1) + 0.6, 48]} />
        <meshStandardMaterial color="#0c2233" transparent opacity={0.55} />
      </mesh>

      <group ref={giro}>
        {/* pared lateral (área lateral) — cilindro hueco, sin tapas */}
        <mesh position={[0, hW / 2, 0]}>
          <cylinderGeometry args={[rW, rW, hW, 56, 1, true]} />
          <meshStandardMaterial
            color={LAT_COL} transparent opacity={0.4} side={THREE.DoubleSide}
            emissive={LAT_COL} emissiveIntensity={0.28} metalness={0.3} roughness={0.35}
          />
        </mesh>
        {/* base circular (área de la base) */}
        <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[rW, 56]} />
          <meshStandardMaterial
            color={BASE_COL} side={THREE.DoubleSide}
            emissive={BASE_COL} emissiveIntensity={0.35} metalness={0.25} roughness={0.45}
          />
        </mesh>
        {/* borde superior abierto */}
        <mesh position={[0, hW, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[rW, 0.03, 12, 56]} />
          <meshStandardMaterial color="#eaf1ff" emissive={LAT_COL} emissiveIntensity={0.7} toneMapped={false} />
        </mesh>
      </group>

      {/* etiquetas de medidas (fuera del giro) */}
      <Etiqueta pos={[0, hW + 0.62, 0]} color={R_COL} size={11.5}>r = {fmt2(rPos)} cm</Etiqueta>
      <Etiqueta pos={[rW + 0.9, hW / 2, 0]} color={LAT_COL} size={11}>h = {fmt2(hDeR(rPos))} cm</Etiqueta>
      <Etiqueta pos={[0, -0.62, 0]} color={TOTAL_COL} size={10.5} bg="rgba(6,16,31,0.9)">V = 1000 cm³ (fijo)</Etiqueta>
    </group>
  );
}

/* ── Contenido (descendiente del Canvas) ─────────────────────────────────── */
function Contenido({ rPos, showDecomp, accent, resetNonce }: OptimizacionSceneProps) {
  const v = VISTA;
  return (
    <>
      <color attach="background" args={["#08131f"]} />
      <fog attach="fog" args={["#08131f", 26, 70]} />

      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 9, 11]} intensity={1.3} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-far={40} />
      <pointLight position={[-6, 4, 6]} intensity={0.5} color={accent} />

      <group key={resetNonce}>
        {/* cilindro físico (izquierda) */}
        <Lata rPos={rPos} />

        {/* plano de costo (derecha) */}
        <group position={[PLANE_X, 0, 0]}>
          <Plano v={v} />
          {showDecomp && <CurvaTrazo which="base" v={v} color={BASE_COL} width={2.6} dashed />}
          {showDecomp && <CurvaTrazo which="lateral" v={v} color={LAT_COL} width={2.6} dashed />}
          <CurvaTrazo which="total" v={v} color={TOTAL_COL} width={4.5} />
          <Minimo v={v} />
          <SondaActiva v={v} rPos={rPos} />
        </group>
      </group>

      <ContactShadows position={[0, -BY - 0.5, 0]} opacity={0.3} scale={28} blur={2.6} far={9} />

      <Environment resolution={128}>
        <group>
          <Lightformer intensity={1.3} position={[0, 6, 8]} scale={12} color="#eaf1ff" />
          <Lightformer intensity={0.7} position={[6, 2, 5]} scale={6} color="#cfe0ff" />
          <Lightformer intensity={0.5} position={[-6, 3, 4]} scale={6} color="#e9d5ff" />
        </group>
      </Environment>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={9}
        maxDistance={34}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 1.55}
        target={[-0.5, 0, 0]}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.5} luminanceThreshold={0.62} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.4} />
      </EffectComposer>
    </>
  );
}

export default function OptimizacionScene(props: OptimizacionSceneProps) {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={{ position: [1, 4, 21], fov: 44 }}>
      <Contenido {...props} />
    </Canvas>
  );
}
