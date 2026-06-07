"use client";

/**
 * Escena 3D del laboratorio de Funciones de variable real — R3F.
 * Se carga de forma diferida (ssr:false) desde LabFunciones.tsx.
 *
 * Sobre un plano cartesiano se dibuja la gráfica y = f(x) de la función elegida.
 * Se marcan sus rasgos —raíces (cruces con X), intersección con Y, máximos y
 * mínimos locales— y, al analizar la SIMETRÍA, se superpone la curva reflejada
 * respecto al eje Y (si es PAR) o respecto al origen (si es IMPAR); cuando no
 * hay simetría, el reflejo respecto al eje Y NO coincide con la curva.
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
  segmentosCurva,
  raices,
  interseccionY,
  extremos,
  simetria,
  RANGO,
  fmtNum,
  type Simetria,
} from "./funciones-data";

export interface FuncionesSceneProps {
  funcionId: string;
  accent: string;
  showSimetria: boolean;
  showRasgos: boolean;
  pausado: boolean;
  autoRotate: boolean;
  resetNonce: number;
}

const ORO = "#ffd24a";
const VERDE = "#34D399";
const CIAN = "#7fd4ff";
const MAGENTA = "#f0a6ff";
const EJE = "#9fb2c8";
const H = RANGO; // medio-ancho del plano (mundo: −H..H)

/** Refleja una lista de segmentos según el tipo de simetría a comprobar. */
function reflejar(
  segs: Array<Array<[number, number]>>,
  modo: "ejeY" | "origen"
): Array<Array<[number, number]>> {
  return segs.map((s) =>
    s.map(([x, y]) => (modo === "ejeY" ? [-x, y] : [-x, -y]) as [number, number])
  );
}

/* ════════════════════ CONTENIDO DEL PLANO ═══════════════════════════════ */
function Plano({ funcionId, accent, showSimetria, showRasgos, pausado }: {
  funcionId: string; accent: string; showSimetria: boolean; showRasgos: boolean; pausado: boolean;
}) {
  const fn = useMemo(() => funcionPorId(funcionId), [funcionId]);
  const segs = useMemo(() => segmentosCurva(fn), [fn]);
  const sim = useMemo<Simetria>(() => simetria(fn), [fn]);
  const rs = useMemo(() => raices(fn), [fn]);
  const iy = useMemo(() => interseccionY(fn), [fn]);
  const exs = useMemo(() => extremos(fn), [fn]);

  // curva reflejada para ilustrar la simetría
  const reflejo = useMemo(() => {
    if (sim === "impar") return reflejar(segs, "origen");
    return reflejar(segs, "ejeY"); // par → coincide; ninguna → NO coincide (lo evidencia)
  }, [segs, sim]);
  const reflejoColor = sim === "impar" ? CIAN : sim === "par" ? ORO : "#ff7a7a";

  // todos los puntos de la curva, en orden, para el punto viajero
  const ruta = useMemo<[number, number][]>(() => segs.flat(), [segs]);

  // punto que viaja sobre la curva
  const punto = useRef<THREE.Mesh>(null);
  const fase = useRef(0);
  useFrame((_, delta) => {
    const d = pausado ? 0 : delta;
    if (ruta.length < 2) return;
    fase.current = (fase.current + d * 0.08) % 1;
    const mesh = punto.current;
    if (mesh) {
      const idx = Math.min(ruta.length - 1, Math.floor(fase.current * (ruta.length - 1)));
      const p = ruta[idx]!;
      mesh.position.set(p[0], p[1], 0.04);
    }
  });

  // marcas de unidades sobre los ejes (−H..H)
  const ticks = useMemo(() => {
    const t: number[] = [];
    for (let i = -H; i <= H; i++) if (i !== 0) t.push(i);
    return t;
  }, []);

  const iyVisible = Math.abs(iy) <= H;

  return (
    <group>
      {/* tablero del plano */}
      <mesh position={[0, 0, -0.06]} receiveShadow>
        <planeGeometry args={[2 * H + 1.4, 2 * H + 1.4]} />
        <meshStandardMaterial color="#07182c" metalness={0.05} roughness={0.95} />
      </mesh>

      {/* rejilla del plano cartesiano */}
      <gridHelper
        args={[2 * H, 2 * H, "#274868", "#16314c"]}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, -0.04]}
      />

      {/* eje X */}
      <Line points={[[-H - 0.4, 0, 0], [H + 0.5, 0, 0]]} color={EJE} lineWidth={2} />
      <mesh position={[H + 0.6, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.13, 0.34, 16]} />
        <meshStandardMaterial color={EJE} />
      </mesh>
      <Html position={[H + 0.95, 0.05, 0]} center distanceFactor={15} pointerEvents="none">
        <div style={{ color: EJE, fontSize: 12, fontWeight: 900 }}>X</div>
      </Html>

      {/* eje Y */}
      <Line points={[[0, -H - 0.4, 0], [0, H + 0.5, 0]]} color={EJE} lineWidth={2} />
      <mesh position={[0, H + 0.6, 0]}>
        <coneGeometry args={[0.13, 0.34, 16]} />
        <meshStandardMaterial color={EJE} />
      </mesh>
      <Html position={[0.05, H + 0.95, 0]} center distanceFactor={15} pointerEvents="none">
        <div style={{ color: EJE, fontSize: 12, fontWeight: 900 }}>Y</div>
      </Html>

      {/* marcas de unidad */}
      {ticks.map((i) => (
        <group key={`tx${i}`}>
          <Line points={[[i, -0.1, 0], [i, 0.1, 0]]} color={EJE} lineWidth={1} />
          <Line points={[[-0.1, i, 0], [0.1, i, 0]]} color={EJE} lineWidth={1} />
        </group>
      ))}
      <Html position={[-0.32, -0.34, 0]} center distanceFactor={16} pointerEvents="none">
        <div style={{ color: EJE, fontSize: 10, fontWeight: 700 }}>0</div>
      </Html>

      {/* curva reflejada (simetría) */}
      {showSimetria &&
        reflejo.map((seg, i) => (
          <Line
            key={`ref${i}`}
            points={seg.map(([x, y]) => [x, y, 0.005] as [number, number, number])}
            color={reflejoColor}
            lineWidth={3}
            dashed
            dashSize={0.18}
            gapSize={0.12}
          />
        ))}

      {/* la curva y = f(x) */}
      {segs.map((seg, i) => (
        <Line
          key={`cur${i}`}
          points={seg.map(([x, y]) => [x, y, 0.02] as [number, number, number])}
          color={accent}
          lineWidth={4}
        />
      ))}

      {/* eje de simetría / centro */}
      {showSimetria && sim === "par" && (
        <Line points={[[0, -H, 0.01], [0, H, 0.01]]} color={ORO} lineWidth={1.5} dashed dashSize={0.1} gapSize={0.1} />
      )}
      {showSimetria && sim === "impar" && (
        <mesh position={[0, 0, 0.03]}>
          <ringGeometry args={[0.12, 0.2, 24]} />
          <meshStandardMaterial color={CIAN} emissive={CIAN} emissiveIntensity={0.7} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* rasgos: raíces */}
      {showRasgos &&
        rs.map((x, i) => (
          <group key={`r${i}`} position={[x, 0, 0.03]}>
            <mesh>
              <ringGeometry args={[0.1, 0.17, 22]} />
              <meshStandardMaterial color={VERDE} emissive={VERDE} emissiveIntensity={0.6} toneMapped={false} side={THREE.DoubleSide} />
            </mesh>
            <Html position={[0, -0.42, 0]} center distanceFactor={13} pointerEvents="none">
              <div style={{ color: VERDE, fontSize: 10.5, fontWeight: 800, whiteSpace: "nowrap", textShadow: "0 2px 8px #000" }}>
                raíz {fmtNum(x, 2)}
              </div>
            </Html>
          </group>
        ))}

      {/* rasgos: intersección con Y */}
      {showRasgos && iyVisible && (
        <group position={[0, iy, 0.04]}>
          <mesh castShadow>
            <sphereGeometry args={[0.15, 24, 24]} />
            <meshStandardMaterial color={ORO} emissive={ORO} emissiveIntensity={0.8} toneMapped={false} />
          </mesh>
          <Html position={[0.55, 0.18, 0]} center distanceFactor={13} pointerEvents="none">
            <div style={{ background: "rgba(2,12,28,0.85)", border: `1px solid ${ORO}66`, borderRadius: 8, padding: "3px 7px", whiteSpace: "nowrap" }}>
              <span style={{ color: ORO, fontSize: 10.5, fontWeight: 900 }}>(0, {fmtNum(iy, 1)})</span>
            </div>
          </Html>
        </group>
      )}

      {/* rasgos: máximos y mínimos locales */}
      {showRasgos &&
        exs.map((e, i) => (
          <group key={`e${i}`} position={[e.x, e.y, 0.04]}>
            <mesh castShadow>
              <sphereGeometry args={[0.14, 22, 22]} />
              <meshStandardMaterial
                color={e.tipo === "max" ? MAGENTA : CIAN}
                emissive={e.tipo === "max" ? MAGENTA : CIAN}
                emissiveIntensity={0.7}
                toneMapped={false}
              />
            </mesh>
            <Html position={[0, e.tipo === "max" ? 0.46 : -0.46, 0]} center distanceFactor={13} pointerEvents="none">
              <div style={{ color: e.tipo === "max" ? MAGENTA : CIAN, fontSize: 10.5, fontWeight: 800, whiteSpace: "nowrap", textShadow: "0 2px 8px #000" }}>
                {e.tipo === "max" ? "máx" : "mín"} ({fmtNum(e.x, 1)}, {fmtNum(e.y, 1)})
              </div>
            </Html>
          </group>
        ))}

      {/* punto viajero sobre la curva */}
      {ruta.length >= 2 && (
        <mesh ref={punto} castShadow>
          <sphereGeometry args={[0.15, 24, 24]} />
          <meshStandardMaterial color="#ffffff" emissive={accent} emissiveIntensity={0.5} metalness={0.1} roughness={0.4} />
        </mesh>
      )}

      <ContactShadows position={[0, 0, -0.05]} opacity={0.28} scale={2 * H + 6} blur={2.4} far={6} />
    </group>
  );
}

/* ════════════════════ CANVAS + CONTENIDO ═════════════════════════════════ */
export default function FuncionesScene(props: FuncionesSceneProps) {
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

function Contenido(props: FuncionesSceneProps) {
  const { funcionId, accent, showSimetria, showRasgos, pausado, autoRotate, resetNonce } = props;
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
        <Plano funcionId={funcionId} accent={accent} showSimetria={showSimetria} showRasgos={showRasgos} pausado={pausado} />
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
