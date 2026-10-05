"use client";

/**
 * Escena 3D — "Ley de Senos y Ley de Cosenos" (PM-IV-P05-A2).
 *
 * Un TERRENO triangular oblicuángulo dibujado sobre el piso (plano XZ). El vértice
 * C (ángulo conocido) está en el origen; de él salen el lado b (hacia A) y el lado
 * a (hacia B). El lado c —desconocido, opuesto a C— cierra el triángulo entre A y
 * B y se resalta como "la incógnita" que resuelve la Ley de Cosenos:
 *   c = √(a² + b² − 2ab·cos C)
 * El triángulo se centra y se ESCALA para encuadrarlo (su forma depende de a, b y
 * C), pero las etiquetas muestran los valores reales en metros y grados.
 *
 * Patrón R3F: el default export solo monta <Canvas> y delega en <Contenido>
 * (descendiente del Canvas). React Compiler: nada de Math.random()/Date.now()/
 * setState en render; la geometría se memoiza y useFrame solo late en un ref.
 */

import * as THREE from "three";
import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { calcTri, fmtM, fmtDeg, type Triangulo } from "./ley-senos-cosenos-data";
import { CurvaTubo } from "./_tablero";
import { Escenario, calidadEscena } from "./_escenario";

export interface LeySenosCosenosSceneProps {
  a: number;
  b: number;
  angC: number;
  accent: string;
  mostrarAngulos: boolean;
  autoRotate: boolean;
  pausado: boolean;
  resetNonce: number;
}

type Pt = [number, number, number];

const A_COL = "#60a5fa";   // lado a (C→B)
const B_COL = "#34D399";   // lado b (C→A)
const C_COL = "#f5d36b";   // lado c (incógnita, A→B)
const ANGC_COL = "#fbbf24"; // arco del ángulo conocido C
const ANG_COL = "#c4b5fd"; // arcos de los ángulos calculados A y B
const FIT = 5.0;            // radio visual al que se ajusta el terreno
const YL = 0.04;           // levante de líneas sobre el piso (anti z-fight)

const len2 = (p: Pt, q: Pt) => Math.hypot(p[0] - q[0], p[2] - q[2]);

/** Arco sobre el piso en `center`, barriendo del rayo a `pa` al rayo a `pb`. */
function arco(center: Pt, pa: Pt, pb: Pt, ra: number, n = 24): Pt[] {
  const a1 = Math.atan2(pa[2] - center[2], pa[0] - center[0]);
  const a2 = Math.atan2(pb[2] - center[2], pb[0] - center[0]);
  let d = a2 - a1;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const ang = a1 + d * (i / (n - 1));
    pts.push([center[0] + ra * Math.cos(ang), YL, center[2] + ra * Math.sin(ang)]);
  }
  return pts;
}

const mid = (p: Pt, q: Pt): Pt => [(p[0] + q[0]) / 2, 0, (p[2] + q[2]) / 2];
const outward = (p: Pt, off: number): Pt => {
  const r = Math.hypot(p[0], p[2]) || 1;
  return [p[0] + (p[0] / r) * off, 0, p[2] + (p[2] / r) * off];
};

interface Geo {
  t: Triangulo;
  A: Pt; B: Pt; C: Pt;
  arcC: Pt[]; arcA: Pt[]; arcB: Pt[];
  midA: Pt; midB: Pt; midC: Pt;  // puntos medios de los lados a, b, c
  labC: Pt;                       // posición de la etiqueta del ángulo C
}

function construir(a: number, b: number, angC: number): Geo {
  const t = calcTri(a, b, angC);
  const half = t.radC / 2;
  // vértices en metros: C en origen, bisectriz del ángulo C sobre +X
  const Cm: Pt = [0, 0, 0];
  const Am: Pt = [b * Math.cos(half), 0, b * Math.sin(half)];   // lado b: C→A
  const Bm: Pt = [a * Math.cos(half), 0, -a * Math.sin(half)];  // lado a: C→B
  // centrar en el centroide y escalar para encuadrar
  const cen: Pt = [(Am[0] + Bm[0] + Cm[0]) / 3, 0, (Am[2] + Bm[2] + Cm[2]) / 3];
  const maxR = Math.max(
    Math.hypot(Am[0] - cen[0], Am[2] - cen[2]),
    Math.hypot(Bm[0] - cen[0], Bm[2] - cen[2]),
    Math.hypot(Cm[0] - cen[0], Cm[2] - cen[2]),
  ) || 1;
  const k = FIT / maxR;
  const S = (p: Pt): Pt => [(p[0] - cen[0]) * k, YL, (p[2] - cen[2]) * k];
  const A = S(Am), B = S(Bm), C = S(Cm);

  // radios de los arcos (fracción del lado adyacente más corto)
  const raC = Math.min(1.0, 0.3 * Math.min(len2(C, A), len2(C, B)));
  const raA = Math.min(0.8, 0.26 * Math.min(len2(A, C), len2(A, B)));
  const raB = Math.min(0.8, 0.26 * Math.min(len2(B, C), len2(B, A)));

  // etiqueta del ángulo C: hacia el interior del triángulo
  const inner = mid(A, B);
  const dirx = inner[0] - C[0], dirz = inner[2] - C[2];
  const dl = Math.hypot(dirx, dirz) || 1;
  const labC: Pt = [C[0] + (dirx / dl) * (raC + 0.55), 0.18, C[2] + (dirz / dl) * (raC + 0.55)];

  return {
    t, A, B, C,
    arcC: arco(C, A, B, raC),
    arcA: arco(A, C, B, raA),
    arcB: arco(B, C, A, raB),
    midA: mid(C, B),  // lado a (C→B)
    midB: mid(C, A),  // lado b (C→A)
    midC: mid(A, B),  // lado c (A→B) — la incógnita
    labC,
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

/* ── Estaca de topógrafo en un vértice ───────────────────────────────────── */
function Estaca({ p, color }: { p: Pt; color: string }) {
  return (
    <group position={[p[0], 0, p[2]]}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 0.7, 8]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.74, 0]}>
        <sphereGeometry args={[0.11, 16, 16]} />
        <meshStandardMaterial color="#fff" emissive={color} emissiveIntensity={0.9} />
      </mesh>
    </group>
  );
}

/* ── Terreno triangular (relleno traslúcido) ─────────────────────────────── */
function Terreno({ A, B, C, accent }: { A: Pt; B: Pt; C: Pt; accent: string }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array([...A, ...B, ...C]), 3),
    );
    g.setIndex([0, 1, 2]);
    g.computeVertexNormals();
    return g;
  }, [A, B, C]);
  return (
    <mesh geometry={geo} position={[0, 0.005, 0]} receiveShadow>
      <meshStandardMaterial
        color={accent} transparent opacity={0.16} roughness={0.9}
        side={THREE.DoubleSide} depthWrite={false}
      />
    </mesh>
  );
}

/* ── La construcción completa ────────────────────────────────────────────── */
function Escena({ g, accent, mostrarAngulos }: { g: Geo; accent: string; mostrarAngulos: boolean }) {
  const { t } = g;
  const angosto = useThree((st) => st.size.width) < 640;
  // marcador pulsante sobre la incógnita (lado c)
  const marca = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (marca.current) {
      const k = 1 + Math.sin(s.clock.elapsedTime * 3) * 0.18;
      marca.current.scale.setScalar(k);
    }
  });

  return (
    <group>
      {/* terreno: disco de pasto sobre la mesa del escenario */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]} receiveShadow>
        <circleGeometry args={[11, 64]} />
        <meshStandardMaterial color="#1f4a2c" roughness={1} />
      </mesh>

      {/* terreno relleno */}
      <Terreno A={g.A} B={g.B} C={g.C} accent={C_COL} />

      {/* ── Lados del triángulo ── */}
      {/* lado b: C→A */}
      <CurvaTubo puntos={[g.C, g.A]} color={B_COL} grosor={0.072} />
      {/* lado a: C→B */}
      <CurvaTubo puntos={[g.C, g.B]} color={A_COL} grosor={0.072} />
      {/* lado c (incógnita): A→B */}
      <CurvaTubo puntos={[g.A, g.B]} color={C_COL} grosor={0.09} />

      {/* ── Arcos de ángulos ── */}
      <CurvaTubo puntos={g.arcC} color={ANGC_COL} grosor={0.054} />
      {mostrarAngulos && <CurvaTubo puntos={g.arcA} color={ANG_COL} grosor={0.05} />}
      {mostrarAngulos && <CurvaTubo puntos={g.arcB} color={ANG_COL} grosor={0.05} />}

      {/* estacas en los vértices */}
      <Estaca p={g.C} color={ANGC_COL} />
      <Estaca p={g.A} color={B_COL} />
      <Estaca p={g.B} color={A_COL} />

      {/* marcador pulsante en el centro del lado incógnita */}
      <group ref={marca} position={[g.midC[0], YL + 0.18, g.midC[2]]}>
        <mesh>
          <sphereGeometry args={[0.12, 18, 18]} />
          <meshStandardMaterial color="#fff7e6" emissive={accent} emissiveIntensity={1.0} />
        </mesh>
      </group>

      {/* ── Etiquetas (máx. 4): c y C siempre; a y b, o A y B si se piden los ángulos ── */}
      <Etiqueta pos={[g.midC[0] + (g.midC[0] / (Math.hypot(g.midC[0], g.midC[2]) || 1)) * 0.9, 0.5, g.midC[2] + (g.midC[2] / (Math.hypot(g.midC[0], g.midC[2]) || 1)) * 0.9]} color={C_COL}>
        c = {fmtM(t.c)}
      </Etiqueta>
      {!angosto && (
        <Etiqueta pos={g.labC} color={ANGC_COL}>
          C = {fmtDeg(t.angC)}
        </Etiqueta>
      )}
      {mostrarAngulos ? (
        <>
          <Etiqueta pos={[g.A[0] * 0.8, 0.34, g.A[2] * 0.8]} color={ANG_COL}>
            A = {fmtDeg(t.angA)}
          </Etiqueta>
          <Etiqueta pos={[g.B[0] * 0.8, 0.34, g.B[2] * 0.8]} color={ANG_COL}>
            B = {fmtDeg(t.angB)}
          </Etiqueta>
        </>
      ) : (
        <>
          <Etiqueta pos={outward(g.midA, 0.8)} color={A_COL}>
            a = {fmtM(t.a)}
          </Etiqueta>
          <Etiqueta pos={outward(g.midB, 0.8)} color={B_COL}>
            b = {fmtM(t.b)}
          </Etiqueta>
        </>
      )}
    </group>
  );
}

/* ── Contenido (descendiente del Canvas) ─────────────────────────────────── */
function Contenido({ a, b, angC, accent, mostrarAngulos, autoRotate, pausado, resetNonce }: LeySenosCosenosSceneProps) {
  const g = useMemo(() => construir(a, b, angC), [a, b, angC]);
  const [calidad] = useState(() => calidadEscena());

  return (
    <>
      <Escenario acento={accent} suelo={0} calidad={calidad} />

      <group key={`${resetNonce}`}>
        <Escena g={g} accent={accent} mostrarAngulos={mostrarAngulos} />
      </group>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={8}
        maxDistance={32}
        minPolarAngle={Math.PI / 12}
        maxPolarAngle={Math.PI / 2.15}
        target={[0, 0.2, 1.4]}
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

export default function LeySenosCosenosScene(props: LeySenosCosenosSceneProps) {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={{ position: [7, 9, 12], fov: 45 }}>
      <Contenido {...props} />
    </Canvas>
  );
}
