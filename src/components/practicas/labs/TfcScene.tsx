"use client";

/**
 * Escena 3D del laboratorio del Teorema Fundamental del Cálculo — R3F.
 * Se carga de forma diferida (ssr:false) desde LabTfc.tsx.
 *
 * Sobre un plano cartesiano (x ∈ [0,4], y ∈ [0,8]) se dibuja y = f(x). Según el
 * modo:
 *  • "area": rectángulos de Riemann que aproximan ∫₀ᵇ f, sobre el área exacta
 *    sombreada. A más rectángulos, la aproximación se pega al área real.
 *  • "acumulacion": la función de acumulación F(x) = ∫₀ˣ f se traza en paralelo;
 *    su altura en b es exactamente el área sombreada bajo f hasta b.
 *  • "conexion": el TFC — la PENDIENTE de F en x=b (recta tangente) es justo la
 *    ALTURA f(b). Derivar la acumulación devuelve la función original.
 *
 * Etiquetas: solo <Html>, 14 px, máx. 4 a la vez; las escalas de los ejes se
 * leen en la leyenda del shell y los valores en el panel.
 */

import * as THREE from "three";
import { useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Line, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Escenario } from "./_escenario";
import { CurvaTubo, EjeVarilla, PanelGrafica } from "./_tablero";
import { EncuadreMate } from "./EncuadreMate";
import {
  funcionPorId,
  curvaF,
  curvaAcumulada,
  bordeArea,
  rectangulos,
  sumaRiemann,
  integralExacta,
  A_FIJO,
  XMAX,
  YMAX,
  N_MAX,
  fmtNum,
  type Modo,
} from "./tfc-data";

export interface TfcSceneProps {
  funcionId: string;
  accent: string;
  modo: Modo;
  b: number;
  n: number;
  resetNonce: number;
}

const ORO = "#ffd24a";
const VERDE = "#34D399";
const MAGENTA = "#f0a6ff";
const EJE = "#9fb2c8";

// Caja de dibujo en coordenadas de MUNDO (centrada en el origen del Canvas).
const BOARD_W = 11;
const BOARD_H = 7.6;
const SX = BOARD_W / XMAX; // escala horizontal (4 → 11)
const SY = BOARD_H / YMAX; // escala vertical (8 → 7.6)
const OX = -BOARD_W / 2; // mundo-x del origen matemático (x=0)
const OY = -BOARD_H / 2; // mundo-y del origen matemático (y=0)

const wx = (x: number): number => OX + x * SX;
const wy = (y: number): number => OY + y * SY;
const w3 = (x: number, y: number, z = 0): [number, number, number] => [wx(x), wy(y), z];

/** Rectángulos de Riemann como UNA malla instanciada (hasta 40 piezas). */
function Rectangulos({ rects }: { rects: Array<{ x0: number; w: number; h: number }> }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const o = new THREE.Object3D();
    rects.forEach((r, i) => {
      const h = Math.max(0.001, r.h * SY);
      o.position.set(wx(r.x0 + r.w / 2), wy(0) + h / 2, 0.03);
      o.scale.set(r.w * SX * 0.95, h, 1);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
    });
    mesh.count = rects.length;
    mesh.instanceMatrix.needsUpdate = true;
  }, [rects]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, N_MAX]} castShadow>
      <boxGeometry args={[1, 1, 0.06]} />
      <meshStandardMaterial color={ORO} emissive={ORO} emissiveIntensity={0.25} transparent opacity={0.55} roughness={0.5} />
    </instancedMesh>
  );
}

/* ════════════════════ CONTENIDO DEL PLANO ═══════════════════════════════ */
function Plano({ funcionId, accent, modo, b, n }: {
  funcionId: string; accent: string; modo: Modo; b: number; n: number;
}) {
  const angosto = useThree((s) => s.size.width) < 640;
  const fn = useMemo(() => funcionPorId(funcionId), [funcionId]);
  const curva = useMemo(() => curvaF(fn, A_FIJO, XMAX), [fn]);
  const acum = useMemo(() => curvaAcumulada(fn, A_FIJO, XMAX), [fn]);
  const rects = useMemo(() => rectangulos(fn, A_FIJO, b, n), [fn, b, n]);

  // polígono del área exacta bajo f en [0, b] (relleno translúcido)
  const areaShape = useMemo(() => {
    const borde = bordeArea(fn, A_FIJO, b, 90);
    const sh = new THREE.Shape();
    sh.moveTo(wx(A_FIJO), wy(0));
    for (const [x, y] of borde) sh.lineTo(wx(x), wy(y));
    sh.lineTo(wx(b), wy(0));
    sh.lineTo(wx(A_FIJO), wy(0));
    return sh;
  }, [fn, b]);

  const mostrarArea = modo === "area" || modo === "acumulacion";
  const mostrarRects = modo === "area";
  const mostrarAcum = modo === "acumulacion" || modo === "conexion";

  // valores clave
  const Fb = useMemo(() => integralExacta(fn, A_FIJO, b), [fn, b]);
  const fb = fn.f(b);

  // recta tangente a F en x=b (su pendiente = f(b)): modo "conexion"
  const tangente = useMemo<[number, number, number][]>(() => {
    const dx = 0.9;
    const x0 = Math.max(A_FIJO, b - dx);
    const x1 = Math.min(XMAX, b + dx);
    return [w3(x0, Fb - fb * (b - x0), 0.06), w3(x1, Fb + fb * (x1 - b), 0.06)];
  }, [b, Fb, fb]);

  const marcasX = [1, 2, 3, 4];
  const marcasY = [2, 4, 6, 8];

  return (
    <group position={[0, 0, 0]}>
      {/* tablero con grosor y marco */}
      <PanelGrafica ancho={BOARD_W + 1.8} alto={BOARD_H + 1.8} frente={-0.06} />

      {/* rejilla: verticales y horizontales en coordenadas matemáticas */}
      {[0, 1, 2, 3, 4].filter((x) => x <= XMAX).map((x) => (
        <Line key={`gx${x}`} points={[w3(x, 0, -0.03), w3(x, YMAX, -0.03)]} color="#173453" lineWidth={1} />
      ))}
      {[0, 2, 4, 6, 8].filter((y) => y <= YMAX).map((y) => (
        <Line key={`gy${y}`} points={[w3(0, y, -0.03), w3(XMAX, y, -0.03)]} color="#173453" lineWidth={1} />
      ))}

      {/* ejes: varillas con punta */}
      <EjeVarilla desde={w3(0, 0, 0)} hasta={[wx(XMAX) + 0.6, wy(0), 0]} color={EJE} />
      <EjeVarilla desde={w3(0, 0, 0)} hasta={[wx(0), wy(YMAX) + 0.6, 0]} color={EJE} />

      {/* marcas de unidad como geometría */}
      {marcasX.map((x) => (
        <mesh key={`tx${x}`} position={[wx(x), wy(0), 0]}>
          <boxGeometry args={[0.04, 0.26, 0.04]} />
          <meshStandardMaterial color={EJE} roughness={0.4} metalness={0.6} />
        </mesh>
      ))}
      {marcasY.map((y) => (
        <mesh key={`ty${y}`} position={[wx(0), wy(y), 0]}>
          <boxGeometry args={[0.26, 0.04, 0.04]} />
          <meshStandardMaterial color={EJE} roughness={0.4} metalness={0.6} />
        </mesh>
      ))}

      {/* área exacta sombreada bajo f en [0,b] */}
      {mostrarArea && b > A_FIJO + 1e-6 && (
        <mesh position={[0, 0, 0.0]}>
          <shapeGeometry args={[areaShape]} />
          <meshBasicMaterial color={accent} transparent opacity={0.22} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* rectángulos de Riemann (modo área) */}
      {mostrarRects && <Rectangulos rects={rects} />}

      {/* la curva y = f(x) */}
      <CurvaTubo puntos={curva.map(([x, y]) => w3(x, y, 0.05))} color={accent} grosor={0.072} />

      {/* la función de acumulación F(x) = ∫₀ˣ f */}
      {mostrarAcum && <CurvaTubo puntos={acum.map(([x, y]) => w3(x, y, 0.06))} color={VERDE} grosor={0.063} />}

      {/* límite móvil b: guía vertical y su etiqueta */}
      <CurvaTubo puntos={[w3(b, 0, 0.05), w3(b, YMAX, 0.05)]} color={MAGENTA} grosor={0.025} brillo={0.6} />
      <Html position={[wx(b), wy(0) - 0.75, 0]} center pointerEvents="none" zIndexRange={[20, 0]}>
        <div style={{ color: MAGENTA, fontSize: 14, fontWeight: 900, textShadow: "0 2px 8px #000", whiteSpace: "nowrap" }}>
          b = {fmtNum(b, 2)}
        </div>
      </Html>

      {/* punto sobre f en x=b (altura f(b)) */}
      <group position={w3(b, fb, 0.1)}>
        <mesh castShadow>
          <sphereGeometry args={[0.16, 24, 24]} />
          <meshStandardMaterial color="#ffffff" emissive={accent} emissiveIntensity={0.5} />
        </mesh>
        <Html position={[0.95, 0.35, 0]} center pointerEvents="none" zIndexRange={[20, 0]}>
          <div style={{ background: "rgba(2,12,28,0.88)", border: `1px solid ${accent}99`, borderRadius: 8, padding: "3px 8px", whiteSpace: "nowrap" }}>
            <span style={{ color: accent, fontSize: 14, fontWeight: 900 }}>f(b) = {fmtNum(fb, 2)}</span>
          </div>
        </Html>
      </group>

      {/* punto sobre F en x=b (altura = área acumulada) */}
      {mostrarAcum && (
        <group position={w3(b, Fb, 0.11)}>
          <mesh castShadow>
            <sphereGeometry args={[0.17, 24, 24]} />
            <meshStandardMaterial color="#ffffff" emissive={VERDE} emissiveIntensity={0.6} />
          </mesh>
          <Html position={[0.95, -0.4, 0]} center pointerEvents="none" zIndexRange={[20, 0]}>
            <div style={{ background: "rgba(2,12,28,0.88)", border: `1px solid ${VERDE}99`, borderRadius: 8, padding: "3px 8px", whiteSpace: "nowrap" }}>
              <span style={{ color: VERDE, fontSize: 14, fontWeight: 900 }}>F(b) = {fmtNum(Fb, 2)}</span>
            </div>
          </Html>
        </group>
      )}

      {/* recta tangente a F en b: su pendiente es f(b) — el TFC (modo conexión) */}
      {modo === "conexion" && (
        <>
          <CurvaTubo puntos={tangente} color={ORO} grosor={0.054} />
          {!angosto && (
            <Html position={w3(b, Fb, 0.12)} center pointerEvents="none" zIndexRange={[20, 0]}>
              <div style={{ background: "rgba(2,12,28,0.9)", border: `1px solid ${ORO}88`, borderRadius: 8, padding: "3px 8px", whiteSpace: "nowrap", marginTop: -48 }}>
                <span style={{ color: ORO, fontSize: 14, fontWeight: 900 }}>F′(b) = {fmtNum(fb, 2)} = f(b)</span>
              </div>
            </Html>
          )}
        </>
      )}

      {/* etiqueta de la suma vs integral (modo área) */}
      {modo === "area" && !angosto && (
        <Html position={[wx(b / 2), wy(YMAX) - 0.3, 0]} center pointerEvents="none" zIndexRange={[20, 0]}>
          <div style={{ background: "rgba(2,12,28,0.88)", border: `1px solid ${ORO}77`, borderRadius: 8, padding: "3px 9px", whiteSpace: "nowrap", textAlign: "center" }}>
            <span style={{ color: ORO, fontSize: 14, fontWeight: 900 }}>Σ Riemann ≈ {fmtNum(sumaRiemann(fn, A_FIJO, b, n), 2)}</span>
          </div>
        </Html>
      )}
    </group>
  );
}

/* ════════════════════ CANVAS + CONTENIDO ═════════════════════════════════ */
export default function TfcScene(props: TfcSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [0, 0, 20], fov: 46 }}
    >
      <Contenido {...props} />
    </Canvas>
  );
}

function Contenido(props: TfcSceneProps) {
  const { funcionId, accent, modo, b, n, resetNonce } = props;
  return (
    <>
      {/* Suelo, luz de tres puntos y entorno que reflejar. */}
      <Escenario acento={accent} suelo={OY - 0.4} />

      <EncuadreMate ancho={BOARD_W + 2.6} alto={BOARD_H + 2.4} nonce={resetNonce} />

      <group key={`${resetNonce}`}>
        <Plano funcionId={funcionId} accent={accent} modo={modo} b={b} n={n} />
      </group>

      <OrbitControls
        enablePan={false}
        minDistance={8}
        maxDistance={40}
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
