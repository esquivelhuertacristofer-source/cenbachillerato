"use client";

/**
 * Escena 3D — "Geometría analítica: distancia, punto medio y pendiente"
 * (PM-IV-P06-A2).
 *
 * Un PLANO CARTESIANO flotante (rejilla en z = 0, con ejes X e Y) que se puede
 * orbitar. Tres modos, cada uno enseña UNA idea con consecuencia visible:
 *   · DISTANCIA: sobre los catetos Δx, Δy y la hipotenusa se levantan cuadrados
 *     reales; el alumno ve que los dos cuadrados chicos «suman» el grande.
 *   · PUNTO MEDIO: marcas de mitades iguales y líneas punteadas a los ejes que
 *     muestran que las coordenadas de M son el promedio de las de P₁ y P₂.
 *   · PENDIENTE: la escalera «avanza 1, sube m».
 * La rejilla usa una escala fija (U unidades de escena por unidad del plano), así
 * que las posiciones son reales; las etiquetas muestran los valores exactos.
 *
 * Etiquetas: máx. 4 a la vez, tamaño fijo en píxeles.
 * Patrón R3F: el default export solo monta <Canvas> y delega en <Contenido>.
 */

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { calcGeom, fmtNum2, fmtPar, type Geom } from "./geometria-analitica-data";
import { Escenario } from "./_escenario";
import { CurvaTubo } from "./_tablero";

export type ModoGeo = "distancia" | "medio" | "pendiente";

export interface GeometriaAnaliticaSceneProps {
  modo: ModoGeo;
  x1: number; y1: number; x2: number; y2: number;
  accent: string;
  mostrarTriangulo: boolean;
  autoRotate: boolean;
  pausado: boolean;
  resetNonce: number;
}

type Pt = [number, number, number];

const P1_COL = "#60a5fa";   // punto P₁
const P2_COL = "#f5d36b";   // punto P₂
const SEG_COL = "#f97316";  // segmento / distancia (la hipotenusa)
const DX_COL = "#34D399";   // cateto Δx (horizontal)
const DY_COL = "#c4b5fd";   // cateto Δy (vertical)
const MID_COL = "#fb7185";  // punto medio M
const AXIS_COL = "#7dd3fc"; // ejes X, Y
const GRID_COL = "#1f3a4d"; // rejilla
const PEND_COL = "#fbbf24"; // pendiente

const G = 10;               // semirango del plano: −10 … +10
const U = 0.46;             // unidades de escena por unidad del plano

/** Lleva un punto del plano (gx, gy) a coordenadas de escena (z = 0). */
const S = (gx: number, gy: number): Pt => [gx * U, gy * U, 0];

interface Geo {
  g: Geom;
  P1: Pt; P2: Pt; M: Pt; corner: Pt;  // corner = (x2, y1): vértice recto del triángulo
}

function construir(x1: number, y1: number, x2: number, y2: number): Geo {
  const g = calcGeom(x1, y1, x2, y2);
  return {
    g,
    P1: S(x1, y1),
    P2: S(x2, y2),
    M: S(g.mx, g.my),
    corner: S(x2, y1),
  };
}

/* ── Etiqueta flotante: tamaño fijo en píxeles (≥ 14 px), sin distanceFactor ── */
function Etiqueta({
  pos, color, children, size = 14,
}: {
  pos: Pt; color: string; children: React.ReactNode; size?: number;
}) {
  return (
    <Html position={pos} center pointerEvents="none" zIndexRange={[20, 0]}>
      <div style={{
        whiteSpace: "nowrap", padding: "3px 9px", borderRadius: 8, background: "rgba(4,10,22,0.88)",
        border: `1.5px solid ${color}`, color: "#fff", fontWeight: 800, fontSize: size,
        fontFamily: "system-ui, sans-serif", boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
      }}>
        {children}
      </div>
    </Html>
  );
}

/* ── Punto del plano (esfera; la etiqueta es opcional) ───────────────────── */
function Punto({ p, color, label, sub }: { p: Pt; color: string; label?: string; sub?: string }) {
  return (
    <group position={p}>
      <mesh castShadow>
        <sphereGeometry args={[0.17, 24, 24]} />
        <meshStandardMaterial color="#fff" emissive={color} emissiveIntensity={0.9} />
      </mesh>
      {label && (
        <Etiqueta pos={[0, 0.5, 0]} color={color}>
          <strong>{label}</strong>&nbsp;{sub}
        </Etiqueta>
      )}
    </group>
  );
}

/* ── Cuadrado plano construido sobre un segmento a→b, hacia el lado n ─────── */
function Cuadro({ a, b, n, color }: { a: Pt; b: Pt; n: [number, number]; color: string }) {
  const geo = useMemo(() => {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const v = [
      a[0], a[1], -0.02,
      b[0], b[1], -0.02,
      b[0] + n[0] * L, b[1] + n[1] * L, -0.02,
      a[0] + n[0] * L, a[1] + n[1] * L, -0.02,
    ];
    const gg = new THREE.BufferGeometry();
    gg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(v), 3));
    gg.setIndex([0, 1, 2, 0, 2, 3]);
    return gg;
  }, [a, b, n]);
  return (
    <mesh geometry={geo}>
      <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

/* ── Rejilla del plano cartesiano (líneas en z = 0) ──────────────────────── */
function Rejilla() {
  const geo = useMemo(() => {
    const pts: number[] = [];
    for (let i = -G; i <= G; i++) {
      pts.push(i * U, -G * U, 0, i * U, G * U, 0);
      pts.push(-G * U, i * U, 0, G * U, i * U, 0);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pts), 3));
    return g;
  }, []);
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color={GRID_COL} transparent opacity={0.55} />
    </lineSegments>
  );
}

/* ── La construcción completa ────────────────────────────────────────────── */
function Escena({ geo, modo, mostrarTriangulo }: { geo: Geo; modo: ModoGeo; mostrarTriangulo: boolean }) {
  const { g } = geo;
  const marca = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (marca.current) marca.current.scale.setScalar(1 + Math.sin(s.clock.elapsedTime * 3) * 0.2);
  });

  const ejeX: Pt[] = [S(-G, 0), S(G, 0)];
  const ejeY: Pt[] = [S(0, -G), S(0, G)];

  const midDx: Pt = [(geo.P1[0] + geo.corner[0]) / 2, geo.P1[1], 0];
  const midDy: Pt = [geo.corner[0], (geo.corner[1] + geo.P2[1]) / 2, 0];
  const midSeg: Pt = [(geo.P1[0] + geo.P2[0]) / 2, (geo.P1[1] + geo.P2[1]) / 2, 0];
  const sdx = geo.P2[0] - geo.P1[0], sdy = geo.P2[1] - geo.P1[1];
  const sl = Math.hypot(sdx, sdy) || 1;
  const segLab: Pt = [midSeg[0] - (sdy / sl) * 0.6, midSeg[1] + (sdx / sl) * 0.6, 0.05];

  const verTri = modo === "distancia" || (modo === "pendiente" && mostrarTriangulo);
  const verDx = Math.abs(g.dx) > 0.05;
  const verDy = Math.abs(g.dy) > 0.05;

  // Cuadrados de Pitágoras (solo en «Distancia»)
  const sgnY = g.dy >= 0 ? 1 : -1;
  const sgnX = g.dx >= 0 ? 1 : -1;
  let nx = -sdy / sl, ny = sdx / sl;
  if (nx * (geo.corner[0] - midSeg[0]) + ny * (geo.corner[1] - midSeg[1]) > 0) { nx = -nx; ny = -ny; }
  const nHip: [number, number] = [nx, ny];

  // Escalera unitaria de la pendiente: parte del punto de la izquierda
  const izq = geo.P1[0] <= geo.P2[0] ? geo.P1 : geo.P2;
  const mClamp = g.pendienteDef ? Math.max(-G, Math.min(G, g.pendiente)) : 0;
  const paso0: Pt = [izq[0], izq[1], 0.03];
  const paso1: Pt = [izq[0] + U, izq[1], 0.03];
  const paso2: Pt = [izq[0] + U, izq[1] + mClamp * U, 0.03];

  return (
    <group>
      <Rejilla />

      <Line points={ejeX} color={AXIS_COL} lineWidth={2.4} />
      <Line points={ejeY} color={AXIS_COL} lineWidth={2.4} />

      {/* ── DISTANCIA: Pitágoras con cuadrados de verdad ── */}
      {modo === "distancia" && (
        <>
          {verDx && <Cuadro a={geo.P1} b={geo.corner} n={[0, -sgnY]} color={DX_COL} />}
          {verDy && <Cuadro a={geo.corner} b={geo.P2} n={[-sgnX, 0]} color={DY_COL} />}
          <Cuadro a={geo.P1} b={geo.P2} n={nHip} color={SEG_COL} />
        </>
      )}

      {/* ── Triángulo de la recta (catetos Δx, Δy) ── */}
      {verTri && (
        <>
          <Line points={[geo.P1, geo.corner]} color={DX_COL} lineWidth={3.2} dashed dashSize={0.18} gapSize={0.1} />
          <Line points={[geo.corner, geo.P2]} color={DY_COL} lineWidth={3.2} dashed dashSize={0.18} gapSize={0.1} />
          {verDx && (
            <Etiqueta pos={[midDx[0], midDx[1] + (sgnY > 0 ? -0.55 : 0.55), 0.04]} color={DX_COL}>
              Δx = {fmtNum2(g.dx)}
            </Etiqueta>
          )}
          {verDy && (
            <Etiqueta pos={[midDy[0] + sgnX * 0.95, midDy[1], 0.04]} color={DY_COL}>
              Δy = {fmtNum2(g.dy)}
            </Etiqueta>
          )}
        </>
      )}

      {/* ── Segmento P₁P₂ = distancia (hipotenusa) ── */}
      <CurvaTubo puntos={[geo.P1, geo.P2]} color={SEG_COL} grosor={0.09} />
      {modo === "distancia" && (
        <Etiqueta pos={segLab} color={SEG_COL}>
          d = {fmtNum2(g.dist)}
        </Etiqueta>
      )}

      {/* ── PUNTO MEDIO: proyecciones a los ejes y marcas de mitades iguales ── */}
      {modo === "medio" && (
        <>
          {([geo.P1, geo.M, geo.P2] as Pt[]).map((p, i) => (
            <group key={i}>
              <Line points={[p, [p[0], 0, 0]]} color={i === 1 ? MID_COL : "#94a3b8"} lineWidth={1.8} dashed dashSize={0.12} gapSize={0.1} />
              <Line points={[p, [0, p[1], 0]]} color={i === 1 ? MID_COL : "#94a3b8"} lineWidth={1.8} dashed dashSize={0.12} gapSize={0.1} />
            </group>
          ))}
          {[0.25, 0.75].map((t) => (
            <mesh key={t} position={[geo.P1[0] + sdx * t, geo.P1[1] + sdy * t, 0.05]} rotation={[0, 0, Math.atan2(sdy, sdx)]}>
              <boxGeometry args={[0.06, 0.42, 0.06]} />
              <meshStandardMaterial color="#fff" emissive={MID_COL} emissiveIntensity={0.5} />
            </mesh>
          ))}
          <group ref={marca} position={geo.M}>
            <mesh>
              <sphereGeometry args={[0.15, 20, 20]} />
              <meshStandardMaterial color="#fff" emissive={MID_COL} emissiveIntensity={1} />
            </mesh>
          </group>
          <Etiqueta pos={[geo.M[0] + 0.1, geo.M[1] - 0.65, 0.05]} color={MID_COL}>
            <strong>M</strong>&nbsp;{fmtPar(g.mx, g.my)}
          </Etiqueta>
        </>
      )}

      {/* ── PENDIENTE: la escalera «avanza 1, sube m» ── */}
      {modo === "pendiente" && g.pendienteDef && (
        <>
          <CurvaTubo puntos={[paso0, paso1]} color={PEND_COL} grosor={0.06} />
          <CurvaTubo puntos={[paso1, paso2]} color={PEND_COL} grosor={0.06} />
          <Etiqueta pos={[paso1[0] + 1.6, (paso1[1] + paso2[1]) / 2, 0.05]} color={PEND_COL}>
            avanza 1 → sube {fmtNum2(g.pendiente)}
          </Etiqueta>
        </>
      )}
      {modo === "pendiente" && !g.pendienteDef && (
        <Etiqueta pos={[midSeg[0] + 1.3, midSeg[1], 0.05]} color={PEND_COL}>
          vertical: m indefinida
        </Etiqueta>
      )}

      {/* ── Los dos puntos (con etiqueta solo en «Punto medio», donde hay sitio) ── */}
      <Punto p={geo.P1} color={P1_COL} label={modo === "medio" ? "P₁" : undefined} sub={fmtPar(g.x1, g.y1)} />
      <Punto p={geo.P2} color={P2_COL} label={modo === "medio" ? "P₂" : undefined} sub={fmtPar(g.x2, g.y2)} />
    </group>
  );
}

/* ── Contenido (descendiente del Canvas) ─────────────────────────────────── */
function Contenido({ modo, x1, y1, x2, y2, accent, mostrarTriangulo, autoRotate, pausado, resetNonce }: GeometriaAnaliticaSceneProps) {
  const geo = useMemo(() => construir(x1, y1, x2, y2), [x1, y1, x2, y2]);

  return (
    <>
      <Escenario acento={accent} suelo={-G * U - 0.4} />

      <group key={`${resetNonce}`}>
        <Escena geo={geo} modo={modo} mostrarTriangulo={mostrarTriangulo} />
      </group>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={9}
        maxDistance={30}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 1.55}
        target={[0, -0.7, 0]}
        autoRotate={autoRotate && !pausado}
        autoRotateSpeed={0.45}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.4} luminanceThreshold={0.7} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.4} />
      </EffectComposer>
    </>
  );
}

export default function GeometriaAnaliticaScene(props: GeometriaAnaliticaSceneProps) {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={{ position: [2.5, 0.8, 17.5], fov: 45 }}>
      <Contenido {...props} />
    </Canvas>
  );
}
