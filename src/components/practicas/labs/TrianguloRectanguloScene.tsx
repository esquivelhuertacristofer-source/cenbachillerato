"use client";

/**
 * Escena 3D — "Medición indirecta con razones trigonométricas" (PM-IV-P03-A2).
 *
 * Un observador se para a una distancia d de un árbol y mira su copa con un
 * ángulo de elevación θ. Se forma un TRIÁNGULO RECTÁNGULO vertical (en el plano
 * z = 0) cuyos lados son:
 *   · adyacente  = d            (cateto horizontal, a la altura de los ojos)
 *   · opuesto    = d·tan θ       (cateto vertical: altura por encima de los ojos)
 *   · hipotenusa = d/cos θ       (la línea de visión hacia la copa)
 * La altura real del árbol es H = (altura del observador) + opuesto. El triángulo
 * se dibuja escalado para encuadrar (su FORMA solo depende de θ —triángulos
 * semejantes—; d lo agranda), pero los valores numéricos de las etiquetas son
 * reales.
 *
 * Patrón R3F: el default export solo monta <Canvas> y delega en <Contenido>
 * (descendiente del Canvas). React Compiler: nada de Math.random()/Date.now()/
 * setState en render; la geometría se memoiza y useFrame solo late en un ref.
 */

import * as THREE from "three";
import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { calcMed, fmtM, fmtDeg, D_MIN, D_MAX, type Medicion } from "./triangulo-rectangulo-data";
import { CurvaTubo } from "./_tablero";
import { Escenario, calidadEscena } from "./_escenario";

export interface TrianguloRectanguloSceneProps {
  d: number;
  angDeg: number;
  accent: string;
  mostrarHip: boolean;
  autoRotate: boolean;
  pausado: boolean;
  resetNonce: number;
}

type Pt = [number, number, number];

const ADY_COL = "#60a5fa";   // adyacente (distancia)
const OP_COL = "#34D399";    // opuesto (altura)
const HYP_COL = "#f5d36b";   // hipotenusa (línea de visión)
const ARC_COL = "#fbbf24";   // arco del ángulo
const MAXV = 7;              // altura visual máxima del triángulo
const EYV = 0.55;           // altura visual de los ojos del observador

const mapR = (v: number, a: number, b: number, c: number, e: number) =>
  c + ((Math.max(a, Math.min(b, v)) - a) / (b - a)) * (e - c);

interface Geo {
  m: Medicion;
  halfX: number;
  topY: number;       // y de la copa (ojos + opuesto visual)
  E: Pt;              // ojo del observador
  Ph: Pt;            // pie del cateto opuesto (a la altura de los ojos)
  Top: Pt;           // copa (punto medido)
  baseObs: Pt;       // pies del observador en el piso
  baseObj: Pt;       // base del árbol en el piso
  arcPts: Pt[];
  raPts: Pt[];        // marca de ángulo recto (90°)
}

function construir(d: number, angDeg: number): Geo {
  const m = calcMed(d, angDeg);
  const bx = mapR(d, D_MIN, D_MAX, 2.6, 8.0);
  let sx = bx;
  let sy = bx * m.tan;
  if (sy > MAXV) { const k = MAXV / sy; sx *= k; sy *= k; }
  const halfX = sx / 2;
  const topY = EYV + sy;

  const E: Pt = [-halfX, EYV, 0];
  const Ph: Pt = [halfX, EYV, 0];
  const Top: Pt = [halfX, topY, 0];

  // arco del ángulo en el ojo
  const ra = Math.min(0.8, sx * 0.34);
  const na = Math.max(2, Math.round(m.rad / 0.08) + 1);
  const arcPts: Pt[] = [];
  for (let i = 0; i < na; i++) {
    const f = (m.rad * i) / (na - 1);
    arcPts.push([E[0] + ra * Math.cos(f), E[1] + ra * Math.sin(f), 0]);
  }

  // marca de ángulo recto en Ph
  const rr = Math.min(0.3, sy * 0.5, sx * 0.5);
  const raPts: Pt[] = [
    [halfX - rr, EYV, 0],
    [halfX - rr, EYV + rr, 0],
    [halfX, EYV + rr, 0],
  ];

  return {
    m, halfX, topY, E, Ph, Top,
    baseObs: [-halfX, 0, 0], baseObj: [halfX, 0, 0],
    arcPts, raPts,
  };
}

/* ── Etiqueta flotante: tamaño fijo en píxeles, en la punta de lo que nombra ── */
function Etiqueta({ pos, color, children }: { pos: Pt; color: string; children: React.ReactNode }) {
  return (
    <Html position={pos} center pointerEvents="none" zIndexRange={[20, 0]}>
      <div style={{
        whiteSpace: "nowrap", padding: "3px 9px", borderRadius: 8, background: "rgba(4,10,22,0.88)",
        border: `1.5px solid ${color}`, color, fontWeight: 900, fontSize: 15,
        fontFamily: "system-ui, sans-serif", boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
      }}>
        {children}
      </div>
    </Html>
  );
}

/* ── Árbol (objeto medido) ───────────────────────────────────────────────── */
function Arbol({ x, top, accent }: { x: number; top: number; accent: string }) {
  const copa = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (copa.current) {
      const k = 1 + Math.sin(s.clock.elapsedTime * 3) * 0.06;
      copa.current.scale.setScalar(k);
    }
  });
  const trH = top;
  return (
    <group position={[x, 0, 0]}>
      {/* tronco */}
      <mesh position={[0, trH * 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.2, trH, 14]} />
        <meshStandardMaterial color="#7c5230" roughness={0.9} />
      </mesh>
      {/* follaje */}
      <group position={[0, top - 0.55, 0]}>
        <mesh castShadow position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.78, 22, 22]} />
          <meshStandardMaterial color="#2f9e57" roughness={0.85} />
        </mesh>
        <mesh castShadow position={[-0.42, -0.18, 0.2]}>
          <sphereGeometry args={[0.52, 20, 20]} />
          <meshStandardMaterial color="#37b365" roughness={0.85} />
        </mesh>
        <mesh castShadow position={[0.44, -0.12, -0.15]}>
          <sphereGeometry args={[0.5, 20, 20]} />
          <meshStandardMaterial color="#2a8f4f" roughness={0.85} />
        </mesh>
      </group>
      {/* punto medido (copa) con latido */}
      <group ref={copa} position={[0, top, 0]}>
        <mesh>
          <sphereGeometry args={[0.13, 18, 18]} />
          <meshStandardMaterial color="#fff7e6" emissive={accent} emissiveIntensity={1.0} />
        </mesh>
      </group>
    </group>
  );
}

/* ── Observador ──────────────────────────────────────────────────────────── */
function Observador({ x, accent }: { x: number; accent: string }) {
  return (
    <group position={[x, 0, 0]}>
      {/* cuerpo */}
      <mesh position={[0, EYV * 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.14, EYV * 0.72, 12]} />
        <meshStandardMaterial color="#3b4866" roughness={0.7} />
      </mesh>
      {/* cabeza */}
      <mesh position={[0, EYV - 0.02, 0]} castShadow>
        <sphereGeometry args={[0.12, 18, 18]} />
        <meshStandardMaterial color="#e8c9a0" roughness={0.6} />
      </mesh>
      {/* ojo / clinómetro */}
      <mesh position={[0.08, EYV, 0]}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshStandardMaterial color="#fff" emissive={accent} emissiveIntensity={0.9} />
      </mesh>
    </group>
  );
}

/* ── La construcción completa ────────────────────────────────────────────── */
function Escena({ g, accent, mostrarHip }: { g: Geo; accent: string; mostrarHip: boolean }) {
  const { m } = g;
  const angosto = useThree((st) => st.size.width) < 640;
  return (
    <group>
      {/* terreno: disco de pasto sobre la mesa del escenario */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <circleGeometry args={[13, 64]} />
        <meshStandardMaterial color="#1f4a2c" roughness={1} />
      </mesh>
      {/* línea base de distancia en el piso (referencia) */}
      <Line points={[[g.baseObs[0], 0.05, 0], [g.baseObj[0], 0.05, 0]]} color="#3f5d49" lineWidth={1.4} dashed dashSize={0.2} gapSize={0.14} />

      {/* ── Triángulo rectángulo ── */}
      {/* cateto adyacente (distancia) */}
      <CurvaTubo puntos={[g.E, g.Ph]} color={ADY_COL} grosor={0.072} />
      {/* cateto opuesto (altura sobre los ojos) */}
      <CurvaTubo puntos={[g.Ph, g.Top]} color={OP_COL} grosor={0.072} />
      {/* hipotenusa = línea de visión */}
      {mostrarHip && (
        <CurvaTubo puntos={[g.E, g.Top]} color={HYP_COL} grosor={0.05} />
      )}
      {/* arco del ángulo θ */}
      <CurvaTubo puntos={g.arcPts} color={ARC_COL} grosor={0.04} />
      {/* marca de ángulo recto */}
      <CurvaTubo puntos={g.raPts} color="#cbd5e1" grosor={0.025} />

      {/* observador y árbol */}
      <Observador x={g.E[0]} accent={accent} />
      <Arbol x={g.halfX} top={g.topY} accent={accent} />

      {/* ── Etiquetas (máx. 4, en la punta de lo que nombran; la línea de visión va al panel) ── */}
      <Etiqueta pos={[g.E[0] + 1.25, g.E[1] + 0.45, 0]} color={ARC_COL}>
        θ = {fmtDeg(m.angDeg)}
      </Etiqueta>
      {!angosto && (
        <Etiqueta pos={[0, EYV - 0.5, 0]} color={ADY_COL}>
          d = {fmtM(m.d)}
        </Etiqueta>
      )}
      <Etiqueta pos={[g.halfX + 1.2, (EYV + g.topY) / 2, 0]} color={OP_COL}>
        opuesto = {fmtM(m.opuesto)}
      </Etiqueta>
      <Etiqueta pos={[g.halfX, g.topY + 0.95, 0]} color={accent}>
        H = {fmtM(m.H)}
      </Etiqueta>
    </group>
  );
}

/* ── Contenido (descendiente del Canvas) ─────────────────────────────────── */
function Contenido({ d, angDeg, accent, mostrarHip, autoRotate, pausado, resetNonce }: TrianguloRectanguloSceneProps) {
  const g = useMemo(() => construir(d, angDeg), [d, angDeg]);
  const [calidad] = useState(() => calidadEscena());
  const ty = (EYV + g.topY) / 2 - 0.5;

  return (
    <>
      <Escenario acento={accent} suelo={0} calidad={calidad} />

      <group key={`${resetNonce}`}>
        <Escena g={g} accent={accent} mostrarHip={mostrarHip} />
      </group>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={8}
        maxDistance={34}
        minPolarAngle={Math.PI / 9}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, ty, 0]}
        autoRotate={autoRotate && !pausado}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.55} luminanceThreshold={0.6} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.4} />
      </EffectComposer>
    </>
  );
}

export default function TrianguloRectanguloScene(props: TrianguloRectanguloSceneProps) {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={{ position: [9, 5, 11], fov: 45 }}>
      <Contenido {...props} />
    </Canvas>
  );
}
