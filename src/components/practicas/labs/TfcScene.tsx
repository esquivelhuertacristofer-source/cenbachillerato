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
 * Patrón R3F: useFrame solo dentro de <Canvas>; toda pieza animada vive en un
 * hijo del Canvas y muta REFS (nada de setState ni Math.random en el render).
 */

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Line, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
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
  fmtNum,
  type Modo,
} from "./tfc-data";

export interface TfcSceneProps {
  funcionId: string;
  accent: string;
  modo: Modo;
  b: number;
  n: number;
  pausado: boolean;
  autoRotate: boolean;
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

/* ════════════════════ CONTENIDO DEL PLANO ═══════════════════════════════ */
function Plano({ funcionId, accent, modo, b, n, pausado }: {
  funcionId: string; accent: string; modo: Modo; b: number; n: number; pausado: boolean;
}) {
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

  // punto viajero sobre la curva relevante (f en "area", F en los otros modos)
  const ruta = useMemo<[number, number][]>(
    () => (mostrarAcum ? acum : curva).map(([x, y]) => [x, y] as [number, number]),
    [mostrarAcum, acum, curva]
  );
  const punto = useRef<THREE.Mesh>(null);
  const fase = useRef(0);
  useFrame((_, delta) => {
    const d = pausado ? 0 : delta;
    if (ruta.length < 2) return;
    fase.current = (fase.current + d * 0.06) % 1;
    const mesh = punto.current;
    if (mesh) {
      const idx = Math.min(ruta.length - 1, Math.floor(fase.current * (ruta.length - 1)));
      const p = ruta[idx]!;
      mesh.position.set(wx(p[0]), wy(p[1]), 0.08);
    }
  });

  const xticks = useMemo(() => [1, 2, 3, 4].filter((x) => x <= XMAX), []);
  const yticks = useMemo(() => [2, 4, 6, 8].filter((y) => y <= YMAX), []);

  return (
    <group position={[0, 0, 0]}>
      {/* tablero del plano */}
      <mesh position={[0, 0, -0.06]} receiveShadow>
        <planeGeometry args={[BOARD_W + 1.8, BOARD_H + 1.8]} />
        <meshStandardMaterial color="#07182c" metalness={0.05} roughness={0.95} />
      </mesh>

      {/* rejilla: verticales y horizontales en coordenadas matemáticas */}
      {[0, 1, 2, 3, 4].filter((x) => x <= XMAX).map((x) => (
        <Line key={`gx${x}`} points={[w3(x, 0, -0.03), w3(x, YMAX, -0.03)]} color="#173453" lineWidth={1} />
      ))}
      {[0, 2, 4, 6, 8].filter((y) => y <= YMAX).map((y) => (
        <Line key={`gy${y}`} points={[w3(0, y, -0.03), w3(XMAX, y, -0.03)]} color="#173453" lineWidth={1} />
      ))}

      {/* eje X */}
      <Line points={[w3(0, 0, 0), [wx(XMAX) + 0.5, wy(0), 0]]} color={EJE} lineWidth={2} />
      <mesh position={[wx(XMAX) + 0.6, wy(0), 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.13, 0.34, 16]} />
        <meshStandardMaterial color={EJE} />
      </mesh>
      <Html position={[wx(XMAX) + 0.95, wy(0) + 0.05, 0]} center distanceFactor={15} pointerEvents="none">
        <div style={{ color: EJE, fontSize: 12, fontWeight: 900 }}>x</div>
      </Html>

      {/* eje Y */}
      <Line points={[w3(0, 0, 0), [wx(0), wy(YMAX) + 0.5, 0]]} color={EJE} lineWidth={2} />
      <mesh position={[wx(0), wy(YMAX) + 0.6, 0]}>
        <coneGeometry args={[0.13, 0.34, 16]} />
        <meshStandardMaterial color={EJE} />
      </mesh>
      <Html position={[wx(0) + 0.05, wy(YMAX) + 0.95, 0]} center distanceFactor={15} pointerEvents="none">
        <div style={{ color: EJE, fontSize: 12, fontWeight: 900 }}>y</div>
      </Html>

      {/* marcas + números de unidad */}
      {xticks.map((x) => (
        <group key={`tx${x}`}>
          <Line points={[[wx(x), wy(0) - 0.12, 0], [wx(x), wy(0) + 0.12, 0]]} color={EJE} lineWidth={1} />
          <Html position={[wx(x), wy(0) - 0.45, 0]} center distanceFactor={16} pointerEvents="none">
            <div style={{ color: EJE, fontSize: 10, fontWeight: 700 }}>{x}</div>
          </Html>
        </group>
      ))}
      {yticks.map((y) => (
        <group key={`ty${y}`}>
          <Line points={[[wx(0) - 0.12, wy(y), 0], [wx(0) + 0.12, wy(y), 0]]} color={EJE} lineWidth={1} />
          <Html position={[wx(0) - 0.42, wy(y), 0]} center distanceFactor={16} pointerEvents="none">
            <div style={{ color: EJE, fontSize: 10, fontWeight: 700 }}>{y}</div>
          </Html>
        </group>
      ))}
      <Html position={[wx(0) - 0.38, wy(0) - 0.38, 0]} center distanceFactor={16} pointerEvents="none">
        <div style={{ color: EJE, fontSize: 10, fontWeight: 700 }}>0</div>
      </Html>

      {/* área exacta sombreada bajo f en [0,b] */}
      {mostrarArea && b > A_FIJO + 1e-6 && (
        <mesh position={[0, 0, -0.01]}>
          <shapeGeometry args={[areaShape]} />
          <meshBasicMaterial color={accent} transparent opacity={0.16} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
      )}

      {/* rectángulos de Riemann (modo área) */}
      {mostrarRects &&
        rects.map((r, i) => {
          const cx = wx(r.x0 + r.w / 2);
          const cy = wy(r.h / 2);
          const w = r.w * SX;
          const h = Math.max(0.001, r.h * SY);
          return (
            <group key={`rc${i}`}>
              <mesh position={[cx, cy, 0.015]}>
                <planeGeometry args={[w * 0.97, h]} />
                <meshBasicMaterial color={ORO} transparent opacity={0.22} side={THREE.DoubleSide} toneMapped={false} />
              </mesh>
              <Line
                points={[
                  [cx - w * 0.485, wy(0) + 0.001, 0.02],
                  [cx - w * 0.485, wy(r.h), 0.02],
                  [cx + w * 0.485, wy(r.h), 0.02],
                  [cx + w * 0.485, wy(0) + 0.001, 0.02],
                ]}
                color={ORO}
                lineWidth={1.5}
              />
            </group>
          );
        })}

      {/* la curva y = f(x) */}
      <Line points={curva.map(([x, y]) => w3(x, y, 0.03))} color={accent} lineWidth={4} />
      <Html position={w3(XMAX, fn.f(XMAX), 0.03)} center distanceFactor={14} pointerEvents="none">
        <div style={{ color: accent, fontSize: 11, fontWeight: 900, textShadow: "0 2px 8px #000", whiteSpace: "nowrap" }}>
          f(x)
        </div>
      </Html>

      {/* la función de acumulación F(x) = ∫₀ˣ f */}
      {mostrarAcum && (
        <>
          <Line points={acum.map(([x, y]) => w3(x, y, 0.04))} color={VERDE} lineWidth={3.5} />
          <Html position={w3(XMAX, integralExacta(fn, A_FIJO, XMAX), 0.04)} center distanceFactor={14} pointerEvents="none">
            <div style={{ color: VERDE, fontSize: 11, fontWeight: 900, textShadow: "0 2px 8px #000", whiteSpace: "nowrap" }}>
              F(x)=∫₀ˣf
            </div>
          </Html>
        </>
      )}

      {/* límite móvil b: línea vertical guía */}
      <Line points={[w3(b, 0, 0.05), w3(b, YMAX, 0.05)]} color={MAGENTA} lineWidth={1.5} dashed dashSize={0.16} gapSize={0.12} />
      <Html position={[wx(b), wy(0) - 0.78, 0]} center distanceFactor={15} pointerEvents="none">
        <div style={{ color: MAGENTA, fontSize: 11, fontWeight: 900, textShadow: "0 2px 8px #000", whiteSpace: "nowrap" }}>
          b = {fmtNum(b, 2)}
        </div>
      </Html>

      {/* punto sobre f en x=b (altura f(b)) */}
      <group position={w3(b, fb, 0.07)}>
        <mesh castShadow>
          <sphereGeometry args={[0.14, 24, 24]} />
          <meshStandardMaterial color="#ffffff" emissive={accent} emissiveIntensity={0.6} />
        </mesh>
        <Html position={[0.5, 0.2, 0]} center distanceFactor={13} pointerEvents="none">
          <div style={{ background: "rgba(2,12,28,0.85)", border: `1px solid ${accent}66`, borderRadius: 8, padding: "3px 7px", whiteSpace: "nowrap" }}>
            <span style={{ color: accent, fontSize: 10.5, fontWeight: 900 }}>f(b) = {fmtNum(fb, 2)}</span>
          </div>
        </Html>
      </group>

      {/* punto sobre F en x=b (altura = área acumulada) */}
      {mostrarAcum && (
        <group position={w3(b, Fb, 0.08)}>
          <mesh castShadow>
            <sphereGeometry args={[0.15, 24, 24]} />
            <meshStandardMaterial color="#ffffff" emissive={VERDE} emissiveIntensity={0.7} />
          </mesh>
          <Html position={[0.55, -0.05, 0]} center distanceFactor={13} pointerEvents="none">
            <div style={{ background: "rgba(2,12,28,0.85)", border: `1px solid ${VERDE}66`, borderRadius: 8, padding: "3px 7px", whiteSpace: "nowrap" }}>
              <span style={{ color: VERDE, fontSize: 10.5, fontWeight: 900 }}>F(b) = {fmtNum(Fb, 2)}</span>
            </div>
          </Html>
        </group>
      )}

      {/* recta tangente a F en b: su pendiente es f(b) — el TFC (modo conexión) */}
      {modo === "conexion" && (
        <>
          <Line points={tangente} color={ORO} lineWidth={3} />
          <Html position={w3(b, Fb, 0.09)} center distanceFactor={13} pointerEvents="none">
            <div style={{ background: "rgba(2,12,28,0.88)", border: `1px solid ${ORO}77`, borderRadius: 8, padding: "3px 8px", whiteSpace: "nowrap", marginTop: -34 }}>
              <span style={{ color: ORO, fontSize: 10.5, fontWeight: 900 }}>F′(b) = {fmtNum(fb, 2)} = f(b)</span>
            </div>
          </Html>
        </>
      )}

      {/* etiqueta de la suma vs integral (modo área) */}
      {modo === "area" && (
        <Html position={[wx(b / 2), wy(YMAX) - 0.2, 0]} center distanceFactor={15} pointerEvents="none">
          <div style={{ background: "rgba(2,12,28,0.82)", border: `1px solid ${ORO}55`, borderRadius: 8, padding: "4px 9px", whiteSpace: "nowrap", textAlign: "center" }}>
            <span style={{ color: ORO, fontSize: 10.5, fontWeight: 900 }}>Σ Riemann ≈ {fmtNum(sumaRiemann(fn, A_FIJO, b, n), 2)}</span>
          </div>
        </Html>
      )}

      {/* punto viajero */}
      {ruta.length >= 2 && (
        <mesh ref={punto} castShadow>
          <sphereGeometry args={[0.1, 20, 20]} />
          <meshStandardMaterial color="#ffffff" emissive={mostrarAcum ? VERDE : accent} emissiveIntensity={0.5} metalness={0.1} roughness={0.4} />
        </mesh>
      )}

      <ContactShadows position={[0, OY - 0.4, 0]} opacity={0.26} scale={BOARD_W + 6} blur={2.4} far={6} />
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
      camera={{ position: [0, 0, 16], fov: 46 }}
    >
      <Contenido {...props} />
    </Canvas>
  );
}

function Contenido(props: TfcSceneProps) {
  const { funcionId, accent, modo, b, n, pausado, autoRotate, resetNonce } = props;
  return (
    <>
      <color attach="background" args={["#03101f"]} />
      <fog attach="fog" args={["#03101f", 26, 54]} />

      <ambientLight intensity={0.6} />
      <directionalLight
        position={[4, 8, 9]}
        intensity={1.3}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={36}
        shadow-bias={-0.0004}
      />
      <pointLight position={[0, 0, 8]} intensity={2.4} color="#ffffff" />

      <group key={`${resetNonce}`}>
        <Plano funcionId={funcionId} accent={accent} modo={modo} b={b} n={n} pausado={pausado} />
      </group>

      <Environment resolution={256}>
        <Lightformer intensity={1.4} position={[0, 7, 6]} scale={[16, 5, 1]} color="#ffffff" />
        <Lightformer intensity={1.0} position={[-9, 3, 2]} scale={[5, 6, 1]} color={accent} />
        <Lightformer intensity={1.0} position={[9, 2, 4]} scale={[4, 5, 1]} color="#bfe8ff" />
      </Environment>

      <OrbitControls
        enablePan={false}
        minDistance={9}
        maxDistance={24}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.9}
        target={[0, 0, 0]}
        autoRotate={autoRotate}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.5} luminanceThreshold={0.55} luminanceSmoothing={0.3} mipmapBlur radius={0.7} />
        <Vignette eskil={false} offset={0.28} darkness={0.42} />
      </EffectComposer>
    </>
  );
}
