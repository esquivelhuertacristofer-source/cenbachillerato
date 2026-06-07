"use client";

/**
 * Escena 3D — "Funciones de 1.º y 2.º grado y sus transformaciones"
 * (PM-IV-P02-A2).
 *
 * Un PLANO CARTESIANO flotante (rejilla en z = 0, con ejes X e Y) que se orbita.
 * Sobre él se dibujan dos gráficas:
 *   · la función PADRE (y = x² o y = x), tenue/punteada como referencia,
 *   · la función TRANSFORMADA f(x) = a(x−h)² + k (o a(x−h)+k), resaltada.
 * Dos flechas muestran la traslación del vértice del padre (0,0) al nuevo vértice
 * (h, k): una horizontal (h, verde) y otra vertical (k, morada). El vértice se
 * marca con una esfera pulsante. La escala es fija (U por unidad), así que las
 * posiciones son reales y las etiquetas muestran los valores exactos.
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
import { calcFuncion, evalF, evalPadre, fmtPar, type Funcion, type Modo } from "./transformaciones-funciones-data";

export interface TransformacionesFuncionesSceneProps {
  modo: Modo;
  a: number; h: number; k: number;
  accent: string;
  mostrarPadre: boolean;
  autoRotate: boolean;
  pausado: boolean;
  resetNonce: number;
}

type Pt = [number, number, number];

const CURVE_COL = "#f97316";   // función transformada
const PADRE_COL = "#64748b";   // función padre (referencia)
const VERT_COL = "#f5d36b";    // vértice
const DX_COL = "#34D399";      // traslación horizontal (h)
const DY_COL = "#c4b5fd";      // traslación vertical (k)
const AXIS_COL = "#7dd3fc";    // ejes
const GRID_COL = "#1f3a4d";    // rejilla

const G = 10;                  // semirango del plano: −10 … +10
const U = 0.46;               // unidades de escena por unidad del plano
const NS = 240;                // muestras para trazar la curva

const S = (gx: number, gy: number): Pt => [gx * U, gy * U, 0];

/** Muestrea una curva y la recorta al rango visible |y| ≤ G (tramo contiguo). */
function curva(fn: (x: number) => number): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= NS; i++) {
    const x = -G + (2 * G * i) / NS;
    const y = fn(x);
    if (Number.isFinite(y) && y <= G && y >= -G) pts.push(S(x, y));
  }
  return pts;
}

interface Geo {
  f: Funcion;
  transformada: Pt[];
  padre: Pt[];
  vertice: Pt;
  verticeEnPlano: boolean;
}

function construir(modo: Modo, a: number, h: number, k: number): Geo {
  const f = calcFuncion(modo, a, h, k);
  return {
    f,
    transformada: curva((x) => evalF(modo, a, h, k, x)),
    padre: curva((x) => evalPadre(modo, x)),
    vertice: S(h, k),
    verticeEnPlano: Math.abs(h) <= G && Math.abs(k) <= G,
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
function Escena({ geo, accent: _accent, mostrarPadre }: { geo: Geo; accent: string; mostrarPadre: boolean }) {
  const { f } = geo;
  const marca = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (marca.current) {
      const kk = 1 + Math.sin(s.clock.elapsedTime * 3) * 0.2;
      marca.current.scale.setScalar(kk);
    }
  });

  const ejeX: Pt[] = [S(-G, 0), S(G, 0)];
  const ejeY: Pt[] = [S(0, -G), S(0, G)];

  // flechas de traslación: del origen (vértice padre) al vértice (h, k)
  const origen: Pt = S(0, 0);
  const codo: Pt = S(f.h, 0);          // primero horizontal (h), luego vertical (k)
  const hayH = Math.abs(f.h) > 0.05 && geo.verticeEnPlano;
  const hayK = Math.abs(f.k) > 0.05 && geo.verticeEnPlano;

  return (
    <group>
      <Rejilla />

      {/* ejes */}
      <Line points={ejeX} color={AXIS_COL} lineWidth={2.4} />
      <Line points={ejeY} color={AXIS_COL} lineWidth={2.4} />
      <Etiqueta pos={S(G, 0)} color={AXIS_COL} size={11} bg="rgba(6,16,31,0.7)">x</Etiqueta>
      <Etiqueta pos={S(0, G)} color={AXIS_COL} size={11} bg="rgba(6,16,31,0.7)">y</Etiqueta>
      <mesh position={S(0, 0)}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial color={AXIS_COL} emissive={AXIS_COL} emissiveIntensity={0.8} toneMapped={false} />
      </mesh>

      {/* función padre (referencia) */}
      {mostrarPadre && geo.padre.length > 1 && (
        <Line points={geo.padre} color={PADRE_COL} lineWidth={2} dashed dashSize={0.16} gapSize={0.12} />
      )}

      {/* flechas de traslación h y k */}
      {mostrarPadre && hayH && (
        <>
          <Line points={[origen, codo]} color={DX_COL} lineWidth={3} dashed dashSize={0.16} gapSize={0.1} />
          <Etiqueta pos={[(origen[0] + codo[0]) / 2, origen[1] - 0.34, 0.04]} color={DX_COL} size={11}>
            h = {f.h.toLocaleString("es-MX", { maximumFractionDigits: 1 }).replace("-", "−")}
          </Etiqueta>
        </>
      )}
      {mostrarPadre && hayK && (
        <>
          <Line points={[codo, geo.vertice]} color={DY_COL} lineWidth={3} dashed dashSize={0.16} gapSize={0.1} />
          <Etiqueta pos={[codo[0] + 0.42, (codo[1] + geo.vertice[1]) / 2, 0.04]} color={DY_COL} size={11}>
            k = {f.k.toLocaleString("es-MX", { maximumFractionDigits: 1 }).replace("-", "−")}
          </Etiqueta>
        </>
      )}

      {/* función transformada */}
      {geo.transformada.length > 1 && (
        <Line points={geo.transformada} color={CURVE_COL} lineWidth={5} />
      )}

      {/* vértice / punto ancla */}
      {geo.verticeEnPlano && (
        <>
          <group ref={marca} position={geo.vertice}>
            <mesh>
              <sphereGeometry args={[0.15, 22, 22]} />
              <meshStandardMaterial color="#fff" emissive={VERT_COL} emissiveIntensity={1.8} toneMapped={false} />
            </mesh>
          </group>
          <Etiqueta pos={[geo.vertice[0] + 0.1, geo.vertice[1] + 0.45, 0.05]} color={VERT_COL} size={12.5} bg="rgba(6,16,31,0.92)">
            <strong>{f.modo === "cuadratica" ? "Vértice" : "Punto"}</strong>&nbsp;{fmtPar(f.h, f.k)}
          </Etiqueta>
        </>
      )}
    </group>
  );
}

/* ── Contenido (descendiente del Canvas) ─────────────────────────────────── */
function Contenido({ modo, a, h, k, accent, mostrarPadre, autoRotate, pausado, resetNonce }: TransformacionesFuncionesSceneProps) {
  const geo = useMemo(() => construir(modo, a, h, k), [modo, a, h, k]);

  return (
    <>
      <color attach="background" args={["#08131f"]} />
      <fog attach="fog" args={["#08131f", 22, 60]} />

      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 9, 11]} intensity={1.3} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-far={40} />
      <pointLight position={[-6, 4, 6]} intensity={0.4} color={accent} />

      <group key={`${resetNonce}`}>
        <Escena geo={geo} accent={accent} mostrarPadre={mostrarPadre} />
      </group>

      <ContactShadows position={[0, -G * U - 0.4, 0]} opacity={0.3} scale={24} blur={2.6} far={9} />

      <Environment resolution={128}>
        <group>
          <Lightformer intensity={1.3} position={[0, 6, 8]} scale={10} color="#eaf1ff" />
          <Lightformer intensity={0.7} position={[6, 2, 5]} scale={6} color="#cfe0ff" />
          <Lightformer intensity={0.5} position={[-6, 3, 4]} scale={6} color="#ffd9b3" />
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

export default function TransformacionesFuncionesScene(props: TransformacionesFuncionesSceneProps) {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={{ position: [3.5, 2.5, 12], fov: 45 }}>
      <Contenido {...props} />
    </Canvas>
  );
}
