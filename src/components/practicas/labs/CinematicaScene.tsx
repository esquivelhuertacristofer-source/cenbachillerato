"use client";

/**
 * Escena 3D — "Cinemática del MRUA: acelerar y frenar" (CNEYT-V-P02-A2).
 *
 * Una autopista recta por la que avanza un automóvil en el tiempo. La carretera
 * se AUTO-ESCALA a la distancia total del recorrido (SCENE_LEN unidades), así que
 * siempre se ve completa y los hitos quedan a su posición proporcional:
 *  · Salida (x = 0),
 *  · fin de la aceleración (x = x₁, donde el auto alcanza su velocidad máxima),
 *  · alto total (x = x_total, donde v = 0).
 *
 * Sobre el auto se dibujan dos flechas vectoriales:
 *  · velocidad (azul, siempre hacia adelante; su largo ∝ v),
 *  · aceleración (verde hacia adelante en la fase 1; roja hacia atrás al frenar;
 *    su largo ∝ |a|).
 * Una estela sobre el asfalto marca la distancia ya recorrida.
 *
 * Patrón R3F: el default export solo monta <Canvas> y delega en <Contenido>.
 * React Compiler: nada de Math.random()/Date.now()/setState en render; la
 * geometría se memoiza o se deja como const (el compilador la memoiza). El auto
 * se mueve porque el shell actualiza la prop `t` (rAF dentro de useEffect).
 */

import * as THREE from "three";
import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Html, Line } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { resolver, estadoEn, fmt0, fmt1 } from "./cinematica-data";

export interface CinematicaSceneProps {
  a1: number;
  t1: number;
  a2: number;
  t: number;        // tiempo actual del recorrido (s)
  accent: string;
  resetNonce: number;
}

type Pt = [number, number, number];

/* ── Colores ──────────────────────────────────────────────────────────────── */
const C_VEL = "#7dd3fc";    // velocidad
const C_ACC = "#34D399";    // aceleración (fase 1, acelerando)
const C_BRK = "#f87171";    // aceleración negativa (fase 2, frenando)
const ASFALTO = "#0c1f2e";
const RAYA = "#dfe9f5";
const DESIERTO = "#10202c";

const SCENE_LEN = 18;       // largo de la carretera en unidades de escena
const X0 = -SCENE_LEN / 2;  // x de la salida
const ROAD_W = 2.4;         // ancho de la carretera
const Y_ROAD = 0;           // altura del asfalto

/* ── Flecha horizontal (asta + punta) a lo largo de ±x ────────────────────── */
function Flecha({
  base, hacia, len, color, label, grosor = 0.06,
}: {
  base: Pt; hacia: 1 | -1; len: number; color: string; label?: React.ReactNode; grosor?: number;
}) {
  const quat = useMemo(
    () => new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0), new THREE.Vector3(hacia, 0, 0),
    ),
    [hacia],
  );
  if (len < 0.06) return null;
  const headLen = Math.min(0.34, len * 0.4);
  const shaftLen = Math.max(0.001, len - headLen);
  return (
    <group position={base} quaternion={quat}>
      <mesh position={[0, shaftLen / 2, 0]}>
        <cylinderGeometry args={[grosor, grosor, shaftLen, 14]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} toneMapped={false} />
      </mesh>
      <mesh position={[0, shaftLen + headLen / 2, 0]}>
        <coneGeometry args={[grosor * 2.4, headLen, 18]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} toneMapped={false} />
      </mesh>
      {label != null && (
        <Html position={[hacia * (len + 0.1), 0.34, 0]} center distanceFactor={13} pointerEvents="none">
          <div style={{
            whiteSpace: "nowrap", padding: "2px 7px", borderRadius: 7, background: "rgba(6,16,31,0.85)",
            border: `1px solid ${color}77`, color: "#fff", fontWeight: 800, fontSize: 10.5,
            fontFamily: "system-ui, sans-serif", boxShadow: "0 6px 22px rgba(0,0,0,0.45)",
          }}>{label}</div>
        </Html>
      )}
    </group>
  );
}

/* ── Automóvil estilizado (mira hacia +x) ─────────────────────────────────── */
function Auto({ color, frenando }: { color: string; frenando: boolean }) {
  const rueda = (x: number, z: number) => (
    <mesh position={[x, 0.16, z]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.17, 0.17, 0.12, 18]} />
      <meshStandardMaterial color="#0b0f14" metalness={0.4} roughness={0.6} />
    </mesh>
  );
  return (
    <group>
      {/* carrocería */}
      <mesh position={[0, 0.34, 0]} castShadow>
        <boxGeometry args={[1.5, 0.34, 0.7]} />
        <meshStandardMaterial color={color} metalness={0.45} roughness={0.32} />
      </mesh>
      {/* cabina */}
      <mesh position={[-0.12, 0.62, 0]} castShadow>
        <boxGeometry args={[0.78, 0.3, 0.6]} />
        <meshStandardMaterial color="#c9dcef" metalness={0.2} roughness={0.15} transparent opacity={0.9} />
      </mesh>
      {/* faro delantero */}
      <mesh position={[0.76, 0.34, 0.22]}>
        <boxGeometry args={[0.04, 0.12, 0.14]} />
        <meshStandardMaterial color="#fff7d6" emissive="#fff7d6" emissiveIntensity={0.9} toneMapped={false} />
      </mesh>
      <mesh position={[0.76, 0.34, -0.22]}>
        <boxGeometry args={[0.04, 0.12, 0.14]} />
        <meshStandardMaterial color="#fff7d6" emissive="#fff7d6" emissiveIntensity={0.9} toneMapped={false} />
      </mesh>
      {/* stop trasero (se enciende al frenar) */}
      <mesh position={[-0.76, 0.34, 0.2]}>
        <boxGeometry args={[0.04, 0.12, 0.16]} />
        <meshStandardMaterial color="#ff3b3b" emissive="#ff3b3b" emissiveIntensity={frenando ? 1.4 : 0.2} toneMapped={false} />
      </mesh>
      <mesh position={[-0.76, 0.34, -0.2]}>
        <boxGeometry args={[0.04, 0.12, 0.16]} />
        <meshStandardMaterial color="#ff3b3b" emissive="#ff3b3b" emissiveIntensity={frenando ? 1.4 : 0.2} toneMapped={false} />
      </mesh>
      {rueda(0.5, 0.36)}
      {rueda(0.5, -0.36)}
      {rueda(-0.5, 0.36)}
      {rueda(-0.5, -0.36)}
    </group>
  );
}

/* ── Hito / poste de referencia ───────────────────────────────────────────── */
function Hito({ x, color, titulo, sub }: { x: number; color: string; titulo: string; sub: string }) {
  return (
    <group position={[x, Y_ROAD, -ROAD_W / 2 - 0.45]}>
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 1.3, 10]} />
        <meshStandardMaterial color="#6b7d92" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.35, 0]}>
        <boxGeometry args={[0.06, 0.16, 0.06]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} toneMapped={false} />
      </mesh>
      <Html position={[0, 1.75, 0]} center distanceFactor={15} pointerEvents="none">
        <div style={{
          whiteSpace: "nowrap", textAlign: "center", padding: "3px 9px", borderRadius: 8,
          background: "rgba(6,16,31,0.88)", border: `1px solid ${color}88`, color: "#fff",
          fontFamily: "system-ui, sans-serif", boxShadow: "0 6px 22px rgba(0,0,0,0.45)",
        }}>
          <div style={{ fontWeight: 800, fontSize: 11 }}>{titulo}</div>
          <div style={{ fontWeight: 700, fontSize: 10, color }}>{sub}</div>
        </div>
      </Html>
    </group>
  );
}

/* ── Contenido (descendiente del Canvas) ─────────────────────────────────── */
function Contenido({ a1, t1, a2, t, accent, resetNonce }: CinematicaSceneProps) {
  const mov = resolver(a1, t1, a2);
  const est = estadoEn(mov, t);

  const SCALE = SCENE_LEN / Math.max(mov.xTotal, 1);   // unidades de escena por metro
  const xToWorld = (xm: number) => X0 + xm * SCALE;
  const carX = xToWorld(est.x);

  // escalas de las flechas (independientes; el número va en la etiqueta)
  const vScale = 2.6 / Math.max(mov.v1, 1);   // m/s → unidades
  const aScale = 0.9;                          // m/s² → unidades
  const vLen = est.v * vScale;
  const aLen = Math.abs(est.a) * aScale;
  const frenando = est.fase === 2;

  // rayas discontinuas del centro de la carretera
  const rayas: Pt[][] = useMemo(() => {
    const segs: Pt[][] = [];
    const n = 18;
    for (let i = 0; i < n; i++) {
      const xa = X0 + (SCENE_LEN * i) / n + 0.25;
      const xb = X0 + (SCENE_LEN * i) / n + 0.75;
      segs.push([[xa, Y_ROAD + 0.02, 0], [xb, Y_ROAD + 0.02, 0]]);
    }
    return segs;
  }, []);

  return (
    <>
      <color attach="background" args={["#08131f"]} />
      <fog attach="fog" args={["#08131f", 22, 60]} />

      <ambientLight intensity={0.72} />
      <directionalLight position={[6, 10, 6]} intensity={1.25} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-far={40} />
      <pointLight position={[-8, 5, 6]} intensity={0.5} color={accent} />

      <group key={resetNonce}>
        {/* desierto / terreno */}
        <mesh position={[0, Y_ROAD - 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[SCENE_LEN + 8, 16]} />
          <meshStandardMaterial color={DESIERTO} metalness={0.05} roughness={0.95} />
        </mesh>

        {/* asfalto */}
        <mesh position={[0, Y_ROAD - 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[SCENE_LEN + 2, ROAD_W]} />
          <meshStandardMaterial color={ASFALTO} metalness={0.1} roughness={0.85} />
        </mesh>
        {/* orillas */}
        <Line points={[[X0 - 1, Y_ROAD + 0.02, ROAD_W / 2], [X0 + SCENE_LEN + 1, Y_ROAD + 0.02, ROAD_W / 2]]} color={RAYA} lineWidth={2} transparent opacity={0.75} />
        <Line points={[[X0 - 1, Y_ROAD + 0.02, -ROAD_W / 2], [X0 + SCENE_LEN + 1, Y_ROAD + 0.02, -ROAD_W / 2]]} color={RAYA} lineWidth={2} transparent opacity={0.75} />
        {/* rayas centrales */}
        {rayas.map((seg, i) => (
          <Line key={i} points={seg} color={RAYA} lineWidth={2.6} transparent opacity={0.55} />
        ))}

        {/* estela: distancia ya recorrida */}
        {est.x > 0.01 && (
          <Line
            points={[[X0, Y_ROAD + 0.04, 0], [carX, Y_ROAD + 0.04, 0]]}
            color={frenando ? C_BRK : C_ACC}
            lineWidth={5}
            transparent
            opacity={0.85}
          />
        )}

        {/* hitos */}
        <Hito x={xToWorld(0)} color="#9fb4cc" titulo="Salida" sub="x = 0" />
        <Hito x={xToWorld(mov.x1)} color={C_ACC} titulo="Fin de aceleración" sub={`${fmt0(mov.x1)} m · ${fmt0(mov.v1)} m/s`} />
        <Hito x={xToWorld(mov.xTotal)} color={C_BRK} titulo="Alto total" sub={`${fmt0(mov.xTotal)} m`} />

        {/* auto + flechas */}
        <group position={[carX, Y_ROAD, 0]}>
          <Auto color={accent} frenando={frenando} />
          <Flecha base={[0, 1.15, 0]} hacia={1} len={vLen} color={C_VEL} label={`v = ${fmt1(est.v)} m/s`} />
          {aLen > 0.06 && (
            <Flecha
              base={[0, 0.5, 0.42]}
              hacia={est.a >= 0 ? 1 : -1}
              len={aLen}
              color={est.a >= 0 ? C_ACC : C_BRK}
              grosor={0.05}
              label={`a = ${fmt1(est.a)} m/s²`}
            />
          )}
          {/* lectura viva sobre el auto */}
          <Html position={[0, 1.95, 0]} center distanceFactor={15} pointerEvents="none">
            <div style={{
              whiteSpace: "nowrap", padding: "4px 10px", borderRadius: 9, background: "rgba(4,10,22,0.92)",
              border: `1px solid ${(frenando ? C_BRK : est.fase === 1 ? C_ACC : "#9fb4cc")}aa`, color: "#fff",
              fontFamily: "system-ui, sans-serif", boxShadow: "0 6px 22px rgba(0,0,0,0.5)", textAlign: "center",
            }}>
              <div style={{ fontWeight: 800, fontSize: 12 }}>
                t = {fmt1(est.t)} s · x = {fmt0(est.x)} m
              </div>
              <div style={{ fontWeight: 700, fontSize: 10.5, color: frenando ? C_BRK : est.fase === 1 ? C_ACC : "#9fb4cc" }}>
                {est.fase === 1 ? "acelerando" : est.fase === 2 ? "frenando" : "detenido"} · {fmt0(est.v * 3.6)} km/h
              </div>
            </div>
          </Html>
        </group>
      </group>

      <ContactShadows position={[0, Y_ROAD - 0.02, 0]} opacity={0.3} scale={SCENE_LEN + 6} blur={2.4} far={6} />

      <Environment resolution={128}>
        <group>
          <Lightformer intensity={1.3} position={[0, 7, 8]} scale={14} color="#eaf1ff" />
          <Lightformer intensity={0.7} position={[8, 3, 5]} scale={7} color="#cfe0ff" />
          <Lightformer intensity={0.5} position={[-8, 3, 4]} scale={7} color="#e9d5ff" />
        </group>
      </Environment>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={8}
        maxDistance={28}
        minPolarAngle={Math.PI / 7}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 0.6, 0]}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.5} luminanceThreshold={0.6} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.4} />
      </EffectComposer>
    </>
  );
}

export default function CinematicaScene(props: CinematicaSceneProps) {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={{ position: [0, 7, 17], fov: 42 }}>
      <Contenido {...props} />
    </Canvas>
  );
}
