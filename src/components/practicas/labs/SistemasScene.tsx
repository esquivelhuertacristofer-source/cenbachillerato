"use client";

/**
 * Escena 3D del laboratorio de Sistemas de ecuaciones 2×2 (R3F).
 * Se carga de forma diferida (ssr:false) desde LabSistemas.tsx.
 *
 * El plano cartesiano es el PISO; cada ecuación es una recta dibujada sobre él.
 * La gracia en 3D: la solución (el cruce) se LEVANTA como una columna luminosa.
 *   · 1 solución      →  una columna en el punto donde se cruzan las rectas.
 *   · sin solución    →  rectas paralelas, nada se levanta (no hay cruce).
 *   · infinitas       →  las rectas coinciden: toda la recta brilla en alto
 *                        (todos sus puntos son solución).
 * Todo se calcula en el render desde las props (sin useFrame, sin Math.random)
 * → cumple las reglas del React Compiler.
 */

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Line } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { segmentoVisible, dentro, type Ventana, type Solucion } from "./sistemas-data";
import { Escenario } from "./_escenario";
import { CurvaTubo } from "./_tablero";

export interface SistemasSceneProps {
  win: Ventana;
  l1: { m: number; i: number };
  l2: { m: number; i: number };
  sol: Solucion;
  accent: string; // color de la recta 1 (color del área)
  autoRotate: boolean;
  resetNonce: number;
}

const W = 9; // ancho del piso (eje X de datos)
const D = 9; // profundidad del piso (eje Y de datos)
const HP = 3; // altura de la columna de la solución
const R2_COL = "#5EE6C5"; // recta 2 (verde-azulado)
const SOL_COL = "#FFD166"; // solución / cruce (ámbar)
const AXIS_COL = "#7d96ad";

type P3 = [number, number, number];

export default function SistemasScene(props: SistemasSceneProps) {
  const { win, l1, l2, sol, accent } = props;

  // Normalización datos → mundo (piso centrado en el origen del mundo)
  const nx = useMemo(
    () => (vx: number) => ((vx - win.xMin) / (win.xMax - win.xMin) - 0.5) * W,
    [win],
  );
  const nz = useMemo(
    () => (vy: number) => ((vy - win.yMin) / (win.yMax - win.yMin) - 0.5) * D,
    [win],
  );

  // Paso de cuadrícula (en unidades de datos), ≤ ~12 divisiones por eje
  const pasoX = useMemo(() => Math.max(1, Math.ceil((win.xMax - win.xMin) / 12)), [win]);
  const pasoY = useMemo(() => Math.max(1, Math.ceil((win.yMax - win.yMin) / 12)), [win]);

  // Líneas de la cuadrícula
  const grid = useMemo<P3[][]>(() => {
    const Y = 0.012;
    const lines: P3[][] = [];
    const from = (n: number, p: number) => Math.ceil(n / p) * p;
    for (let gx = from(win.xMin, pasoX); gx <= win.xMax + 1e-6; gx += pasoX) {
      lines.push([
        [nx(gx), Y, nz(win.yMin)],
        [nx(gx), Y, nz(win.yMax)],
      ]);
    }
    for (let gy = from(win.yMin, pasoY); gy <= win.yMax + 1e-6; gy += pasoY) {
      lines.push([
        [nx(win.xMin), Y, nz(gy)],
        [nx(win.xMax), Y, nz(gy)],
      ]);
    }
    return lines;
  }, [win, pasoX, pasoY, nx, nz]);

  // Ejes (x = 0 y y = 0) si caen dentro de la ventana
  const ejes = useMemo<P3[][]>(() => {
    const Y = 0.03;
    const out: P3[][] = [];
    if (win.yMin <= 0 && win.yMax >= 0) {
      out.push([
        [nx(win.xMin), Y, nz(0)],
        [nx(win.xMax), Y, nz(0)],
      ]); // eje X
    }
    if (win.xMin <= 0 && win.xMax >= 0) {
      out.push([
        [nx(0), Y, nz(win.yMin)],
        [nx(0), Y, nz(win.yMax)],
      ]); // eje Y
    }
    return out;
  }, [win, nx, nz]);

  // Segmentos visibles de cada recta
  const seg = useMemo(() => {
    const Y = 0.07;
    const build = (m: number, i: number): P3[] | null => {
      const s = segmentoVisible(m, i, win);
      if (!s) return null;
      const [x0, x1] = s;
      return [
        [nx(x0), Y, nz(m * x0 + i)],
        [nx(x1), Y, nz(m * x1 + i)],
      ];
    };
    return { r1: build(l1.m, l1.i), r2: build(l2.m, l2.i) };
  }, [l1, l2, win, nx, nz]);

  // Punto de cruce visible (solo si hay solución única dentro de la ventana)
  const cruce = useMemo<P3 | null>(() => {
    if (sol.caso !== "unica" || sol.x == null || sol.y == null) return null;
    if (!dentro(sol.x, sol.y, win)) return null;
    return [nx(sol.x), 0, nz(sol.y)];
  }, [sol, win, nx, nz]);

  // Cresta luminosa cuando las rectas coinciden (toda la recta es solución)
  const cresta = useMemo<P3[] | null>(() => {
    if (sol.caso !== "coincidentes") return null;
    const s = segmentoVisible(l1.m, l1.i, win);
    if (!s) return null;
    const Y = 0.14;
    const [x0, x1] = s;
    return [
      [nx(x0), Y, nz(l1.m * x0 + l1.i)],
      [nx(x1), Y, nz(l1.m * x1 + l1.i)],
    ];
  }, [sol, l1, win, nx, nz]);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [0.2, 7.6, 11], fov: 42 }}
    >
      {/* Suelo, luz de tres puntos y entorno que reflejar. */}
      {/* La altura sale de donde esta escena ya ponía su sombra de
          contacto: es donde su autor decidió que estaba el piso. */}
      <Escenario acento={accent} suelo={-0.02} />

      <pointLight position={[6, 3, -4]} intensity={6} color={R2_COL} />

      <group key={`${props.resetNonce}`}>
        {/* Piso del plano cartesiano */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <planeGeometry args={[W + 0.6, D + 0.6]} />
          <meshStandardMaterial color="#06182f" roughness={0.9} metalness={0.05} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[W, D]} />
          <meshStandardMaterial color="#0a1d33" roughness={0.85} metalness={0.05} />
        </mesh>

        {/* Cuadrícula */}
        {grid.map((l, idx) => (
          <Line key={`g${idx}`} points={l} color="#1d3147" lineWidth={1} transparent opacity={0.6} />
        ))}

        {/* Ejes */}
        {ejes.map((l, idx) => (
          <Line key={`ax${idx}`} points={l} color={AXIS_COL} lineWidth={2.4} transparent opacity={0.95} />
        ))}

        {/* Recta 1 */}
        {seg.r1 && <CurvaTubo puntos={seg.r1} color={accent} grosor={0.09} />}
        {/* Recta 2 */}
        {seg.r2 && <CurvaTubo puntos={seg.r2} color={R2_COL} grosor={0.09} />}

        {/* Cresta de solución (rectas coincidentes → infinitas soluciones) */}
        {cresta && (
          <>
            <CurvaTubo puntos={cresta} color={SOL_COL} grosor={0.09} />
            <Line points={cresta} color="#ffffff" lineWidth={2.5} />
          </>
        )}

        {/* Columna de la solución única */}
        {cruce && (
          <group position={[cruce[0], 0, cruce[2]]}>
            {/* disco en el piso */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
              <ringGeometry args={[0.28, 0.42, 40]} />
              <meshBasicMaterial color={SOL_COL} transparent opacity={0.85} />
            </mesh>
            {/* columna */}
            <mesh position={[0, HP / 2, 0]} castShadow>
              <cylinderGeometry args={[0.07, 0.07, HP, 24]} />
              <meshStandardMaterial color={SOL_COL} emissive={SOL_COL} emissiveIntensity={1.1} />
            </mesh>
            {/* esfera arriba */}
            <mesh position={[0, HP, 0]} castShadow>
              <sphereGeometry args={[0.26, 32, 32]} />
              <meshStandardMaterial color="#ffffff" emissive={SOL_COL} emissiveIntensity={0.95} roughness={0.25} metalness={0.3} />
            </mesh>
            {/* esfera en el piso (el punto de cruce) */}
            <mesh position={[0, 0.06, 0]} castShadow>
              <sphereGeometry args={[0.19, 28, 28]} />
              <meshStandardMaterial color="#ffffff" emissive={SOL_COL} emissiveIntensity={0.8} roughness={0.3} metalness={0.2} />
            </mesh>
          </group>
        )}

      </group>


      <OrbitControls
        enablePan={false}
        minDistance={8}
        maxDistance={22}
        minPolarAngle={Math.PI / 7}
        maxPolarAngle={Math.PI / 2.15}
        target={[0, 0.6, 0]}
        autoRotate={props.autoRotate}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.5} luminanceThreshold={0.62} luminanceSmoothing={0.3} mipmapBlur radius={0.66} />
        <Vignette eskil={false} offset={0.28} darkness={0.42} />
      </EffectComposer>
    </Canvas>
  );
}
