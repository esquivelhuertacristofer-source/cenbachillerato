"use client";

/**
 * Escena 3D del laboratorio de Recta numérica (R3F).
 * Se carga de forma diferida (ssr:false) desde LabRectaNumerica.tsx.
 *
 * Dibuja una recta numérica horizontal de −RANGO a +RANGO con sus marcas y
 * etiquetas (drei Html, el patrón del proyecto). Sobre ella:
 *   · modo "ubicar"  →  marca el número a; opcionalmente su opuesto −a (simétrico
 *                       respecto al cero) y su valor absoluto |a| (segmento desde
 *                       el cero, cuya longitud es la distancia).
 *   · modo "operar"  →  marca el inicio a y dibuja un ARCO de salto hasta el
 *                       resultado: a la derecha si se suma, a la izquierda si se
 *                       resta. El resultado queda marcado sobre la recta.
 * Todo se calcula en el render a partir de las props (sin useFrame, sin
 * Math.random) → cumple las reglas del React Compiler.
 */

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Line, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { RANGO, type Modo, type Operacion, fmtNum } from "./recta-data";

export interface RectaSceneProps {
  modo: Modo;
  a: number;
  b: number;
  op: Operacion;
  resultado: number;
  showOpuesto: boolean;
  showAbsoluto: boolean;
  unidad: string;
  accent: string;
  autoRotate: boolean;
  resetNonce: number;
}

const HALF = 9; // semiancho de la recta en el mundo 3D
const UNIT = HALF / RANGO; // separación entre enteros
const OPP_COL = "#22D3EE"; // opuesto
const ABS_COL = "#FFD166"; // valor absoluto / salto

type P3 = [number, number, number];

const posX = (v: number) => v * UNIT;

function Chip({ pos, color, children, df = 11 }: { pos: P3; color: string; children: React.ReactNode; df?: number }) {
  return (
    <Html position={pos} center distanceFactor={df} zIndexRange={[10, 0]}>
      <div
        style={{
          whiteSpace: "nowrap",
          fontWeight: 900,
          fontSize: 12,
          color: "#fff",
          background: `${color}e6`,
          padding: "3px 9px",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.4)",
          boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
        }}
      >
        {children}
      </div>
    </Html>
  );
}

export default function RectaScene(props: RectaSceneProps) {
  const { modo, a, b, op, resultado, showOpuesto, showAbsoluto, unidad, accent } = props;

  const enteros = useMemo(() => {
    const out: number[] = [];
    for (let i = -RANGO; i <= RANGO; i++) out.push(i);
    return out;
  }, []);

  // Arco del salto (modo operar): media onda seno desde a hasta el resultado.
  const arco = useMemo<P3[]>(() => {
    if (modo !== "operar") return [];
    const x0 = posX(a);
    const x1 = posX(resultado);
    const N = 48;
    const h = 1.5 + Math.min(2.2, Math.abs(x1 - x0) * 0.22);
    const pts: P3[] = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      pts.push([x0 + (x1 - x0) * t, Math.sin(Math.PI * t) * h, 0]);
    }
    return pts;
  }, [modo, a, resultado]);

  // Punta de flecha del arco (cono apuntando al resultado).
  const flecha = useMemo(() => {
    if (arco.length < 2) return null;
    const end = arco[arco.length - 1]!;
    const prev = arco[arco.length - 2]!;
    const ang = Math.atan2(end[1] - prev[1], end[0] - prev[0]);
    return { pos: end, rot: ang - Math.PI / 2 };
  }, [arco]);

  const xa = posX(a);
  const xr = posX(resultado);
  const xo = posX(-a);
  const sumando = op === "suma";

  // Arco punteado de simetría a ↔ −a (modo ubicar / opuesto).
  const arcoOpuesto = useMemo<P3[]>(() => {
    if (modo !== "ubicar" || !showOpuesto || a === 0) return [];
    const N = 40;
    const h = 1.2 + Math.min(1.6, Math.abs(xa) * 0.18);
    const pts: P3[] = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      pts.push([xa + (xo - xa) * t, Math.sin(Math.PI * t) * h, 0]);
    }
    return pts;
  }, [modo, showOpuesto, a, xa, xo]);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [0, 3.6, 13], fov: 42 }}
    >
      <color attach="background" args={["#03101f"]} />
      <fog attach="fog" args={["#03101f", 22, 48]} />

      <ambientLight intensity={0.62} />
      <directionalLight
        position={[4, 9, 7]}
        intensity={1.7}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={36}
        shadow-bias={-0.0004}
      />
      <pointLight position={[-7, 3, 5]} intensity={9} color={accent} />
      <pointLight position={[6, 2, 5]} intensity={5} color="#ffffff" />

      <group key={`${modo}-${props.resetNonce}`}>
        {/* Eje principal */}
        <mesh>
          <boxGeometry args={[HALF * 2, 0.08, 0.08]} />
          <meshStandardMaterial color="#8aa2b6" emissive="#8aa2b6" emissiveIntensity={0.25} />
        </mesh>
        {/* Puntas de flecha del eje */}
        <mesh position={[HALF + 0.18, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.14, 0.36, 20]} />
          <meshStandardMaterial color="#8aa2b6" emissive="#8aa2b6" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[-HALF - 0.18, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.14, 0.36, 20]} />
          <meshStandardMaterial color="#8aa2b6" emissive="#8aa2b6" emissiveIntensity={0.3} />
        </mesh>

        {/* Marcas y etiquetas de los enteros */}
        {enteros.map((i) => {
          const esCero = i === 0;
          const esCinco = i % 5 === 0;
          const alto = esCero ? 0.62 : esCinco ? 0.42 : 0.26;
          const col = esCero ? "#cfe0ee" : "#3a566e";
          return (
            <group key={i} position={[posX(i), 0, 0]}>
              <mesh>
                <boxGeometry args={[esCero ? 0.07 : 0.045, alto, 0.045]} />
                <meshStandardMaterial color={col} emissive={col} emissiveIntensity={esCero ? 0.4 : 0.2} />
              </mesh>
              {(esCero || esCinco) && (
                <Chip pos={[0, -0.72, 0]} color={esCero ? "#1b3147" : "#16263a"} df={13}>
                  {i}
                </Chip>
              )}
            </group>
          );
        })}

        {/* ── Valor absoluto: segmento del 0 hasta a ──────────────── */}
        {modo === "ubicar" && showAbsoluto && a !== 0 && (
          <>
            <Line points={[[0, 0.16, 0], [xa, 0.16, 0]]} color={ABS_COL} lineWidth={6} />
            <Chip pos={[xa / 2, 0.62, 0]} color="#9a7b16">
              |{fmtNum(a)}| = {fmtNum(Math.abs(a))}
            </Chip>
          </>
        )}

        {/* ── Opuesto −a ──────────────────────────────────────────── */}
        {modo === "ubicar" && showOpuesto && a !== 0 && (
          <>
            {arcoOpuesto.length > 1 && (
              <Line points={arcoOpuesto} color={OPP_COL} lineWidth={2.4} dashed dashSize={0.22} gapSize={0.16} transparent opacity={0.9} />
            )}
            <group position={[xo, 0, 0]}>
              <mesh position={[0, 0.55, 0]} castShadow>
                <sphereGeometry args={[0.24, 32, 32]} />
                <meshStandardMaterial color="#ffffff" emissive={OPP_COL} emissiveIntensity={0.85} roughness={0.25} metalness={0.3} />
              </mesh>
              <mesh position={[0, 0.27, 0]}>
                <boxGeometry args={[0.05, 0.56, 0.05]} />
                <meshStandardMaterial color={OPP_COL} emissive={OPP_COL} emissiveIntensity={0.5} />
              </mesh>
              <Chip pos={[0, 1.0, 0]} color={OPP_COL}>
                opuesto = {fmtNum(-a)}{unidad ? ` ${unidad}` : ""}
              </Chip>
            </group>
          </>
        )}

        {/* ── modo OPERAR: punto de inicio + arco de salto ────────── */}
        {modo === "operar" && (
          <>
            {/* inicio a (apagado) */}
            <group position={[xa, 0, 0]}>
              <mesh position={[0, 0.18, 0]}>
                <sphereGeometry args={[0.17, 24, 24]} />
                <meshStandardMaterial color="#9fb4c6" emissive="#9fb4c6" emissiveIntensity={0.4} />
              </mesh>
              <Chip pos={[0, -1.0, 0]} color="#33506a">
                inicio {fmtNum(a)}
              </Chip>
            </group>

            {/* arco del salto */}
            {arco.length > 1 && <Line points={arco} color={ABS_COL} lineWidth={4} />}
            {flecha && (
              <mesh position={flecha.pos} rotation={[0, 0, flecha.rot]}>
                <coneGeometry args={[0.16, 0.4, 20]} />
                <meshStandardMaterial color={ABS_COL} emissive={ABS_COL} emissiveIntensity={0.6} />
              </mesh>
            )}
            <Chip pos={[(xa + xr) / 2, 1.5 + Math.min(2.2, Math.abs(xr - xa) * 0.22) + 0.5, 0]} color="#9a7b16">
              {sumando ? "+" : "−"} {fmtNum(b)}  ({sumando ? "derecha" : "izquierda"})
            </Chip>
          </>
        )}

        {/* ── Marcador principal: a (ubicar) o resultado (operar) ──── */}
        <group position={[modo === "operar" ? xr : xa, 0, 0]}>
          <mesh position={[0, 0.9, 0]} castShadow>
            <sphereGeometry args={[0.28, 32, 32]} />
            <meshStandardMaterial color="#ffffff" emissive={accent} emissiveIntensity={0.95} roughness={0.22} metalness={0.32} />
          </mesh>
          <mesh position={[0, 0.45, 0]}>
            <boxGeometry args={[0.05, 0.9, 0.05]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.1, 24]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.6} />
          </mesh>
          <Chip pos={[0, 1.4, 0]} color={accent}>
            {modo === "operar" ? "resultado " : ""}{fmtNum(modo === "operar" ? resultado : a)}{unidad ? ` ${unidad}` : ""}
          </Chip>
        </group>

        <ContactShadows position={[0, -0.45, 0.6]} opacity={0.24} scale={26} blur={3} far={6} color="#16263a" />
      </group>

      <Environment resolution={256}>
        <Lightformer intensity={2.0} position={[0, 5, 2]} scale={[12, 4, 1]} color="#ffffff" />
        <Lightformer intensity={1.3} position={[-7, 2, -2]} scale={[6, 6, 1]} color={accent} />
        <Lightformer intensity={1.0} position={[7, 1, 3]} scale={[5, 5, 1]} color="#bfe8ff" />
      </Environment>

      <OrbitControls
        enablePan={false}
        minDistance={8}
        maxDistance={22}
        minPolarAngle={Math.PI / 7}
        maxPolarAngle={Math.PI / 1.9}
        target={[0, 0.4, 0]}
        autoRotate={props.autoRotate}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.46} luminanceThreshold={0.62} luminanceSmoothing={0.3} mipmapBlur radius={0.64} />
        <Vignette eskil={false} offset={0.28} darkness={0.42} />
      </EffectComposer>
    </Canvas>
  );
}
