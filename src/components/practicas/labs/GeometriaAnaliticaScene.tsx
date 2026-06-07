"use client";

/**
 * Escena 3D — "Geometría analítica: distancia, punto medio y pendiente"
 * (PM-IV-P06-A2).
 *
 * Un PLANO CARTESIANO flotante (rejilla en z = 0, con ejes X e Y) que se puede
 * orbitar: así se ve que el plano vive en el espacio, no en papel. Sobre él:
 *   · los dos puntos P₁(x₁,y₁) y P₂(x₂,y₂) como esferas,
 *   · el SEGMENTO P₁P₂ (la distancia = hipotenusa),
 *   · el TRIÁNGULO de la recta: cateto horizontal Δx (run) y cateto vertical Δy
 *     (rise), que es Pitágoras para la distancia y Δy/Δx para la pendiente,
 *   · el PUNTO MEDIO M como marcador.
 * La rejilla usa una escala fija (U unidades de escena por unidad del plano), así
 * que las posiciones son reales; las etiquetas muestran los valores exactos.
 *
 * Patrón R3F: el default export solo monta <Canvas> y delega en <Contenido>.
 * React Compiler: nada de Math.random()/Date.now()/setState en render; la
 * geometría se memoiza y useFrame solo late en un ref.
 */

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Html, Line } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { calcGeom, fmtNum2, fmtPar, type Geom } from "./geometria-analitica-data";

export interface GeometriaAnaliticaSceneProps {
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

/* ── Etiqueta flotante reutilizable ──────────────────────────────────────── */
function Etiqueta({
  pos, color, children, size = 12, bg = "rgba(6,16,31,0.82)",
}: {
  pos: Pt; color: string; children: React.ReactNode; size?: number; bg?: string;
}) {
  return (
    <Html position={pos} center distanceFactor={14} pointerEvents="none">
      <div style={{
        whiteSpace: "nowrap", padding: "4px 10px", borderRadius: 9, background: bg,
        border: `1px solid ${color}66`, color: "#fff", fontWeight: 700, fontSize: size,
        fontFamily: "system-ui, sans-serif", boxShadow: "0 8px 28px rgba(0,0,0,0.4)",
      }}>
        {children}
      </div>
    </Html>
  );
}

/* ── Punto del plano (esfera + etiqueta) ─────────────────────────────────── */
function Punto({ p, color, label, sub }: { p: Pt; color: string; label: string; sub: string }) {
  return (
    <group position={p}>
      <mesh castShadow>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshStandardMaterial color="#fff" emissive={color} emissiveIntensity={1.6} toneMapped={false} />
      </mesh>
      <Etiqueta pos={[0, 0.42, 0]} color={color} size={12.5} bg="rgba(6,16,31,0.9)">
        <strong>{label}</strong>&nbsp;{sub}
      </Etiqueta>
    </group>
  );
}

/* ── Rejilla del plano cartesiano (líneas en z = 0) ──────────────────────── */
function Rejilla() {
  const geo = useMemo(() => {
    const pts: number[] = [];
    for (let i = -G; i <= G; i++) {
      // líneas verticales (x = i)
      pts.push(i * U, -G * U, 0, i * U, G * U, 0);
      // líneas horizontales (y = i)
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
function Escena({ geo, accent: _accent, mostrarTriangulo }: { geo: Geo; accent: string; mostrarTriangulo: boolean }) {
  const { g } = geo;
  // marcador pulsante sobre el punto medio
  const marca = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (marca.current) {
      const k = 1 + Math.sin(s.clock.elapsedTime * 3) * 0.2;
      marca.current.scale.setScalar(k);
    }
  });

  const ejeX: Pt[] = [S(-G, 0), S(G, 0)];
  const ejeY: Pt[] = [S(0, -G), S(0, G)];

  // puntos medios de los catetos para las etiquetas Δx, Δy
  const midDx: Pt = [(geo.P1[0] + geo.corner[0]) / 2, geo.P1[1], 0];
  const midDy: Pt = [geo.corner[0], (geo.corner[1] + geo.P2[1]) / 2, 0];
  const midSeg: Pt = [(geo.P1[0] + geo.P2[0]) / 2, (geo.P1[1] + geo.P2[1]) / 2, 0];
  // desplazamiento de la etiqueta de distancia, perpendicular al segmento
  const sdx = geo.P2[0] - geo.P1[0], sdy = geo.P2[1] - geo.P1[1];
  const sl = Math.hypot(sdx, sdy) || 1;
  const segLab: Pt = [midSeg[0] - (sdy / sl) * 0.5, midSeg[1] + (sdx / sl) * 0.5, 0.05];

  return (
    <group>
      <Rejilla />

      {/* ejes X, Y */}
      <Line points={ejeX} color={AXIS_COL} lineWidth={2.4} />
      <Line points={ejeY} color={AXIS_COL} lineWidth={2.4} />
      <Etiqueta pos={S(G, 0)} color={AXIS_COL} size={11} bg="rgba(6,16,31,0.7)">x</Etiqueta>
      <Etiqueta pos={S(0, G)} color={AXIS_COL} size={11} bg="rgba(6,16,31,0.7)">y</Etiqueta>
      {/* origen */}
      <mesh position={S(0, 0)}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial color={AXIS_COL} emissive={AXIS_COL} emissiveIntensity={0.8} toneMapped={false} />
      </mesh>

      {/* ── Triángulo de la recta (catetos Δx, Δy) ── */}
      {mostrarTriangulo && (
        <>
          <Line points={[geo.P1, geo.corner]} color={DX_COL} lineWidth={3.2} dashed dashSize={0.18} gapSize={0.1} />
          <Line points={[geo.corner, geo.P2]} color={DY_COL} lineWidth={3.2} dashed dashSize={0.18} gapSize={0.1} />
          {Math.abs(g.dx) > 0.05 && (
            <Etiqueta pos={[midDx[0], midDx[1] - 0.34, 0.04]} color={DX_COL} size={11}>
              Δx = {fmtNum2(g.dx)}
            </Etiqueta>
          )}
          {Math.abs(g.dy) > 0.05 && (
            <Etiqueta pos={[midDy[0] + 0.42, midDy[1], 0.04]} color={DY_COL} size={11}>
              Δy = {fmtNum2(g.dy)}
            </Etiqueta>
          )}
        </>
      )}

      {/* ── Segmento P₁P₂ = distancia (hipotenusa) ── */}
      <Line points={[geo.P1, geo.P2]} color={SEG_COL} lineWidth={5} />
      <Etiqueta pos={segLab} color={SEG_COL} size={12.5} bg="rgba(6,16,31,0.92)">
        d = {fmtNum2(g.dist)}
      </Etiqueta>

      {/* ── Punto medio M ── */}
      <group ref={marca} position={geo.M}>
        <mesh>
          <sphereGeometry args={[0.13, 20, 20]} />
          <meshStandardMaterial color="#fff" emissive={MID_COL} emissiveIntensity={1.8} toneMapped={false} />
        </mesh>
      </group>
      <Etiqueta pos={[geo.M[0] - 0.1, geo.M[1] - 0.42, 0.05]} color={MID_COL} size={12} bg="rgba(6,16,31,0.9)">
        <strong>M</strong>&nbsp;{fmtPar(g.mx, g.my)}
      </Etiqueta>

      {/* ── Los dos puntos ── */}
      <Punto p={geo.P1} color={P1_COL} label="P₁" sub={fmtPar(g.x1, g.y1)} />
      <Punto p={geo.P2} color={P2_COL} label="P₂" sub={fmtPar(g.x2, g.y2)} />
    </group>
  );
}

/* ── Contenido (descendiente del Canvas) ─────────────────────────────────── */
function Contenido({ x1, y1, x2, y2, accent, mostrarTriangulo, autoRotate, pausado, resetNonce }: GeometriaAnaliticaSceneProps) {
  const geo = useMemo(() => construir(x1, y1, x2, y2), [x1, y1, x2, y2]);

  return (
    <>
      <color attach="background" args={["#08131f"]} />
      <fog attach="fog" args={["#08131f", 22, 60]} />

      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 9, 11]} intensity={1.3} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-far={40} />
      <pointLight position={[-6, 4, 6]} intensity={0.4} color={accent} />

      <group key={`${resetNonce}`}>
        <Escena geo={geo} accent={accent} mostrarTriangulo={mostrarTriangulo} />
      </group>

      <ContactShadows position={[0, -G * U - 0.4, 0]} opacity={0.3} scale={24} blur={2.6} far={9} />

      <Environment resolution={128}>
        <group>
          <Lightformer intensity={1.3} position={[0, 6, 8]} scale={10} color="#eaf1ff" />
          <Lightformer intensity={0.7} position={[6, 2, 5]} scale={6} color="#cfe0ff" />
          <Lightformer intensity={0.5} position={[-6, 3, 4]} scale={6} color="#bfe6c4" />
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
        autoRotate={autoRotate && !pausado}
        autoRotateSpeed={0.45}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.5} luminanceThreshold={0.62} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.4} />
      </EffectComposer>
    </>
  );
}

export default function GeometriaAnaliticaScene(props: GeometriaAnaliticaSceneProps) {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={{ position: [3.5, 2.5, 12], fov: 45 }}>
      <Contenido {...props} />
    </Canvas>
  );
}
