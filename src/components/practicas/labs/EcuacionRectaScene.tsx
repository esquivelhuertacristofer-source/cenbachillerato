"use client";

/**
 * Escena 3D del laboratorio de la Ecuación de la recta — R3F.
 * Se carga de forma diferida (ssr:false) desde LabEcuacionRecta.tsx.
 *
 * Sobre un plano cartesiano (cuatro cuadrantes, ejes X e Y perpendiculares), la
 * ecuación y = m·x + b se dibuja como una RECTA. Se marcan sus partes:
 *   • la ORDENADA AL ORIGEN (0, b): punto donde cruza el eje Y;
 *   • la RAÍZ (x, 0): punto donde cruza el eje X;
 *   • el TRIÁNGULO DE PENDIENTE: avance de 1 en X y subida de m en Y (m = subida/avance);
 *   • las SOLUCIONES enteras: cada punto de la recta es una solución de la ecuación;
 *   • la SONDA: un punto (x, y) que el alumno desliza por la recta con una guía
 *     hasta cada eje, para LEER una solución de la ecuación.
 *
 * Etiquetas: solo <Html> (nunca <Text>), 14 px, máx. 4 a la vez.
 */

import * as THREE from "three";
import { useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { raizX, solucionesEnteras, evalY, RANGO, fmtNum } from "./ecuacion-recta-data";
import { Escenario } from "./_escenario";
import { CurvaTubo, PanelGrafica, EjeVarilla, MarcasEje } from "./_tablero";
import { EncuadreMate } from "./EncuadreMate";

export interface EcuacionRectaSceneProps {
  m: number;
  b: number;
  accent: string;
  showTriangulo: boolean;
  showSoluciones: boolean;
  /** Abscisa de la sonda: el alumno la mueve y lee la solución (x, y). */
  x0: number;
  resetNonce: number;
}

const ORO = "#ffd24a";
const VERDE = "#34D399";
const CIAN = "#7fd4ff";
const EJE = "#9fb2c8";
const H = RANGO; // medio-ancho del plano (mundo: −H..H)

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Recorta la recta y = m·x + b a la caja [−H,H]×[−H,H]. Devuelve sus 2 extremos. */
function clipLinea(m: number, b: number): [number, number][] {
  const raw: [number, number][] = [];
  for (const x of [-H, H]) {
    const y = m * x + b;
    if (y >= -H - 1e-6 && y <= H + 1e-6) raw.push([x, clamp(y, -H, H)]);
  }
  if (m !== 0) {
    for (const y of [-H, H]) {
      const x = (y - b) / m;
      if (x >= -H - 1e-6 && x <= H + 1e-6) raw.push([clamp(x, -H, H), y]);
    }
  }
  // dedupe (puntos casi iguales) y conservar 2 extremos
  const uniq: [number, number][] = [];
  for (const p of raw) {
    if (!uniq.some((q) => Math.abs(q[0] - p[0]) < 1e-4 && Math.abs(q[1] - p[1]) < 1e-4)) uniq.push(p);
  }
  return uniq.length >= 2 ? [uniq[0]!, uniq[uniq.length - 1]!] : [];
}

/* ════════════════════ CONTENIDO DEL PLANO ═══════════════════════════════ */
function Plano({ m, b, accent, showTriangulo, showSoluciones, x0 }: {
  m: number; b: number; accent: string; showTriangulo: boolean; showSoluciones: boolean; x0: number;
}) {
  const angosto = useThree((s) => s.size.width) < 640;
  const seg = useMemo(() => clipLinea(m, b), [m, b]);
  const xr = useMemo(() => raizX(m, b), [m, b]);
  const soluciones = useMemo(() => solucionesEnteras(m, b), [m, b]);

  // puntos de la recta (mundo)
  const linea = useMemo<[number, number, number][]>(
    () => (seg.length === 2 ? [[seg[0]![0], seg[0]![1], 0.05], [seg[1]![0], seg[1]![1], 0.05]] : []),
    [seg]
  );

  // sonda: el punto (x0, y0) que el alumno coloca sobre la recta
  const y0 = evalY(m, b, x0);
  const sondaVisible = Math.abs(y0) <= H;

  const bVisible = Math.abs(b) <= H;
  const triPunta = b + m; // (1, b+m)
  const triDentro = showTriangulo && Math.abs(b) <= H && Math.abs(triPunta) <= H && m !== 0;

  return (
    <group>
      {/* tablero con grosor y marco */}
      <PanelGrafica ancho={2 * H + 1.4} alto={2 * H + 1.4} />

      {/* rejilla del plano cartesiano */}
      <gridHelper
        args={[2 * H, 2 * H, "#274868", "#16314c"]}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, -0.04]}
      />

      {/* ejes: varillas con punta */}
      <EjeVarilla desde={[-H - 0.4, 0, 0]} hasta={[H + 0.5, 0, 0]} color={EJE} />
      <Html position={[H + 0.95, 0.05, 0]} center pointerEvents="none" zIndexRange={[20, 0]}>
        <div style={{ color: EJE, fontSize: 14, fontWeight: 900 }}>X</div>
      </Html>
      <EjeVarilla desde={[0, -H - 0.4, 0]} hasta={[0, H + 0.5, 0]} color={EJE} />
      <Html position={[0.05, H + 0.95, 0]} center pointerEvents="none" zIndexRange={[20, 0]}>
        <div style={{ color: EJE, fontSize: 14, fontWeight: 900 }}>Y</div>
      </Html>
      <MarcasEje desde={-H} hasta={H} eje="x" color={EJE} />
      <MarcasEje desde={-H} hasta={H} eje="y" color={EJE} />

      {/* soluciones de coordenadas enteras (cada punto = una solución) */}
      {showSoluciones && soluciones.map((p, i) => (
        <mesh key={`sol${i}`} position={[p.x, p.y, 0.02]}>
          <ringGeometry args={[0.1, 0.17, 22]} />
          <meshStandardMaterial color={VERDE} emissive={VERDE} emissiveIntensity={0.6} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* la recta */}
      {linea.length === 2 && <CurvaTubo puntos={linea} color={accent} grosor={0.072} />}

      {/* triángulo de pendiente desde (0, b): avance 1 (cian) y subida m (oro) */}
      {triDentro && (
        <>
          <CurvaTubo puntos={[[0, b, 0.03], [1, b, 0.03]]} color={CIAN} grosor={0.032} brillo={0.6} />
          <CurvaTubo puntos={[[1, b, 0.03], [1, b + m, 0.03]]} color={ORO} grosor={0.032} brillo={0.6} />
        </>
      )}

      {/* ordenada al origen (0, b) */}
      {bVisible && (
        <group position={[0, b, 0.05]}>
          <mesh castShadow>
            <sphereGeometry args={[0.16, 24, 24]} />
            <meshStandardMaterial color={ORO} emissive={ORO} emissiveIntensity={0.6} />
          </mesh>
          {!angosto && (
            <Html position={[-1.6, 0.55, 0]} center pointerEvents="none" zIndexRange={[20, 0]}>
              <div style={{ background: "rgba(2,12,28,0.85)", border: `1px solid ${ORO}66`, borderRadius: 8, padding: "3px 8px", whiteSpace: "nowrap" }}>
                <span style={{ color: ORO, fontSize: 14, fontWeight: 900 }}>ordenada (0, {fmtNum(b, 1)})</span>
              </div>
            </Html>
          )}
        </group>
      )}

      {/* raíz / cruce con el eje X (x, 0) */}
      {xr !== null && Math.abs(xr) <= H && (
        <group position={[xr, 0, 0.05]}>
          <mesh>
            <ringGeometry args={[0.12, 0.2, 24]} />
            <meshStandardMaterial color={CIAN} emissive={CIAN} emissiveIntensity={0.6} side={THREE.DoubleSide} />
          </mesh>
          {!angosto && (
            <Html position={[0, -0.75, 0]} center pointerEvents="none" zIndexRange={[20, 0]}>
              <div style={{ color: CIAN, fontSize: 14, fontWeight: 900, whiteSpace: "nowrap", textShadow: "0 2px 8px #000" }}>
                raíz ({fmtNum(xr, 1)}, 0)
              </div>
            </Html>
          )}
        </group>
      )}

      {/* la sonda: guías hasta los ejes y el punto (x, y) que el alumno mueve */}
      {sondaVisible && (
        <>
          <CurvaTubo puntos={[[x0, 0, 0.03], [x0, y0, 0.03]]} color="#ffffff" grosor={0.026} brillo={0.3} />
          <CurvaTubo puntos={[[0, y0, 0.03], [x0, y0, 0.03]]} color="#ffffff" grosor={0.026} brillo={0.3} />
          <group position={[x0, y0, 0.08]}>
            <mesh castShadow>
              <sphereGeometry args={[0.2, 24, 24]} />
              <meshStandardMaterial color="#ffffff" emissive={accent} emissiveIntensity={0.5} metalness={0.1} roughness={0.4} />
            </mesh>
            <Html position={[0.2, 0.75, 0]} center pointerEvents="none" zIndexRange={[20, 0]}>
              <div style={{ background: "rgba(2,12,28,0.88)", border: `1px solid ${accent}99`, borderRadius: 8, padding: "3px 8px", whiteSpace: "nowrap" }}>
                <span style={{ color: "#fff", fontSize: 14, fontWeight: 900 }}>({fmtNum(x0, 1)}, {fmtNum(y0, 2)})</span>
              </div>
            </Html>
          </group>
        </>
      )}
    </group>
  );
}

/* ════════════════════ CANVAS + CONTENIDO ═════════════════════════════════ */
export default function EcuacionRectaScene(props: EcuacionRectaSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [0, 0, 22], fov: 46 }}
    >
      <Contenido {...props} />
    </Canvas>
  );
}

function Contenido(props: EcuacionRectaSceneProps) {
  const { m, b, accent, showTriangulo, showSoluciones, x0, resetNonce } = props;
  return (
    <>
      {/* Suelo, luz de tres puntos y entorno que reflejar. */}
      <Escenario acento={accent} suelo={0} />

      <EncuadreMate ancho={2 * H + 2} alto={2 * H + 2} nonce={resetNonce} />

      <group key={`${resetNonce}`}>
        <Plano m={m} b={b} accent={accent} showTriangulo={showTriangulo} showSoluciones={showSoluciones} x0={x0} />
      </group>

      <OrbitControls
        enablePan={false}
        minDistance={9}
        maxDistance={42}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.9}
        target={[0, 0, 0]}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.5} luminanceThreshold={0.55} luminanceSmoothing={0.3} mipmapBlur radius={0.7} />
        <Vignette eskil={false} offset={0.28} darkness={0.42} />
      </EffectComposer>
    </>
  );
}
