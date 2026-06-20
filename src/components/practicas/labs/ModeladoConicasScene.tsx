"use client";

/**
 * Escena 3D del laboratorio «Modelado y estimación con cónicas» — R3F.
 * Se carga de forma diferida (ssr:false) desde LabModeladoConicas.tsx.
 *
 * Tres modos:
 *  • "seccion": un CONO DE DOBLE NAPA y un PLANO DE CORTE inclinable; la curva de
 *    intersección (calculada en modelado-conicas-data.ts) se dibuja en vivo y se
 *    clasifica: circunferencia → elipse → parábola → hipérbola según el ángulo.
 *  • "parabola": la antena y = 0.25·x² del ejercicio A2; rayos paralelos al eje
 *    que se concentran en el FOCO (0, 1).
 *  • "circunferencia": el alcance x² + y² = 25 (radio 5 km) y la casa (3, 4) que
 *    cae justo sobre el borde de cobertura.
 *
 * Patrón R3F: useFrame solo dentro de <Canvas>; las piezas animadas mutan REFS.
 */

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Line, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  ALPHA_DEG,
  CONO_H,
  CORTE_Y0,
  interseccion,
  planoCorte,
  clasificaCorte,
  parabolaY,
  PARABOLA,
  COBERTURA,
  type Variante,
  type Punto3,
} from "./modelado-conicas-data";

export interface ModeladoConicasSceneProps {
  modo: Variante;
  /** Ángulo del plano de corte (grados) en el modo "seccion". */
  gammaDeg: number;
  accent: string;
  pausado: boolean;
  autoRotate: boolean;
  resetNonce: number;
}

const ORO = "#ffd24a";
const VERDE = "#34D399";
const AZUL = "#5fb0ff";
const MAGENTA = "#f0a6ff";
const EJE = "#9fb2c8";

const rad = (g: number) => (g * Math.PI) / 180;

/* ════════════════════ MODO SECCIÓN: cono + plano ════════════════════════ */
function ConoDoble({ accent }: { accent: string }) {
  const radio = CONO_H * Math.tan(rad(ALPHA_DEG));
  return (
    <group>
      {/* napa superior: ápice en el origen, abre hacia +y */}
      <mesh position={[0, CONO_H / 2, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[radio, CONO_H, 64, 1, true]} />
        <meshStandardMaterial color={accent} transparent opacity={0.18} metalness={0.2} roughness={0.5} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      {/* napa inferior: ápice en el origen, abre hacia −y */}
      <mesh position={[0, -CONO_H / 2, 0]}>
        <coneGeometry args={[radio, CONO_H, 64, 1, true]} />
        <meshStandardMaterial color={accent} transparent opacity={0.1} metalness={0.2} roughness={0.5} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      {/* eje del cono */}
      <Line points={[[0, -CONO_H, 0], [0, CONO_H, 0]]} color="#3a5572" lineWidth={1} dashed dashSize={0.18} gapSize={0.14} />
    </group>
  );
}

function PlanoDeCorte({ gammaDeg, pausado }: { gammaDeg: number; pausado: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const { normal, centro } = planoCorte(gammaDeg);
  const quat = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(normal[0], normal[1], normal[2]));
    return q;
  }, [normal]);

  useFrame((_, delta) => {
    const g = ref.current;
    if (!g || pausado) return;
    // leve brillo pulsante girando el material no aplica; solo mantenemos quieto.
    void delta;
  });

  return (
    <group ref={ref} position={centro} quaternion={quat}>
      <mesh>
        <planeGeometry args={[9.5, 9.5]} />
        <meshStandardMaterial color={AZUL} transparent opacity={0.16} side={THREE.DoubleSide} metalness={0.1} roughness={0.7} toneMapped={false} />
      </mesh>
      {/* borde del plano */}
      <Line points={[[-4.75, -4.75, 0], [4.75, -4.75, 0], [4.75, 4.75, 0], [-4.75, 4.75, 0], [-4.75, -4.75, 0]]} color={AZUL} lineWidth={1.4} />
    </group>
  );
}

function Seccion({ gammaDeg, accent, pausado }: { gammaDeg: number; accent: string; pausado: boolean }) {
  const { segmentos } = useMemo(() => interseccion(gammaDeg), [gammaDeg]);
  const clase = useMemo(() => clasificaCorte(gammaDeg), [gammaDeg]);

  // punto alto para la etiqueta: tomamos el primer punto del primer segmento.
  const etiquetaPos = useMemo<Punto3>(() => {
    const s0 = segmentos[0];
    if (s0 && s0.length > 0) {
      let top = s0[0]!;
      for (const seg of segmentos) for (const p of seg) if (p[1] > top[1]) top = p;
      return [top[0], top[1] + 0.5, top[2]];
    }
    return [0, CORTE_Y0 + 0.5, 0];
  }, [segmentos]);

  return (
    <group>
      <ConoDoble accent={accent} />
      <PlanoDeCorte gammaDeg={gammaDeg} pausado={pausado} />
      {/* curva de intersección — el resultado estrella */}
      {segmentos.map((seg, i) => (
        <Line key={`seg${i}`} points={seg} color={clase.color} lineWidth={4} />
      ))}
      <Html position={etiquetaPos} center distanceFactor={16} pointerEvents="none">
        <div style={{ color: clase.color, fontSize: 12, fontWeight: 900, textShadow: "0 2px 8px #000", whiteSpace: "nowrap" }}>
          {clase.nombre}
        </div>
      </Html>
      <ContactShadows position={[0, -CONO_H - 0.1, 0]} opacity={0.22} scale={16} blur={2.6} far={8} />
    </group>
  );
}

/* ════════════════════ MODO PARÁBOLA: antena + foco ══════════════════════ */
const PAR_S = 2.6; // factor de escala mundo para que la parábola se vea

function rayoAnimadoY(t: number, x: number): number {
  // posición del "frente de onda" que cae: rebota entre la cima y la curva.
  const yTop = parabolaY(PARABOLA.rango) + 0.6;
  const yPar = parabolaY(Math.abs(x));
  const span = yTop - yPar;
  const phase = (t * 0.6 + Math.abs(x) * 0.25) % 1;
  return yTop - phase * span;
}

function Antena({ pausado }: { pausado: boolean }) {
  const reloj = useRef(0);
  const gotas = useRef<THREE.Group>(null);

  const curva = useMemo<Punto3[]>(() => {
    const pts: Punto3[] = [];
    const N = 80;
    for (let i = 0; i <= N; i++) {
      const x = -PARABOLA.rango + (i / N) * (2 * PARABOLA.rango);
      pts.push([x * PAR_S, parabolaY(x) * PAR_S, 0]);
    }
    return pts;
  }, []);

  const xs = useMemo(() => [-2, -1.1, -0.4, 0.4, 1.1, 2], []);
  const focoY = PARABOLA.foco; // 1
  const foco: Punto3 = [0, focoY * PAR_S, 0];

  useFrame((_, delta) => {
    if (!pausado) reloj.current += delta;
    const t = reloj.current;
    const g = gotas.current;
    if (!g) return;
    g.children.forEach((child, idx) => {
      const x = xs[idx] ?? 0;
      const y = rayoAnimadoY(t, x);
      child.position.set(x * PAR_S, y * PAR_S, 0.02);
    });
  });

  return (
    <group position={[0, -1.6, 0]}>
      {/* curva de la antena */}
      <Line points={curva} color={ORO} lineWidth={5} />
      {/* eje de simetría */}
      <Line points={[[0, 0, 0], [0, (focoY + 1) * PAR_S, 0]]} color="#3a5572" lineWidth={1} dashed dashSize={0.16} gapSize={0.12} />

      {/* rayos paralelos incidentes + reflexión al foco */}
      {xs.map((x, i) => {
        const yPar = parabolaY(Math.abs(x));
        const pPar: Punto3 = [x * PAR_S, yPar * PAR_S, 0];
        const yTop = parabolaY(PARABOLA.rango) + 0.6;
        return (
          <group key={`ray${i}`}>
            <Line points={[[x * PAR_S, yTop * PAR_S, 0], pPar]} color={AZUL} lineWidth={1.6} transparent opacity={0.5} />
            <Line points={[pPar, foco]} color={VERDE} lineWidth={1.6} transparent opacity={0.7} />
          </group>
        );
      })}

      {/* gotas que descienden por los rayos */}
      <group ref={gotas}>
        {xs.map((_, i) => (
          <mesh key={`g${i}`}>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshStandardMaterial color={AZUL} emissive={AZUL} emissiveIntensity={0.7} toneMapped={false} />
          </mesh>
        ))}
      </group>

      {/* foco */}
      <mesh position={foco}>
        <sphereGeometry args={[0.17, 24, 24]} />
        <meshStandardMaterial color={VERDE} emissive={VERDE} emissiveIntensity={1.1} toneMapped={false} />
      </mesh>
      <Html position={[foco[0] + 0.55, foco[1], 0]} center distanceFactor={15} pointerEvents="none">
        <div style={{ color: VERDE, fontSize: 11.5, fontWeight: 900, textShadow: "0 2px 8px #000", whiteSpace: "nowrap" }}>
          Foco (0, 1)
        </div>
      </Html>

      {/* punto dato (1, 0.25) */}
      <mesh position={[PARABOLA.puntoDato[0] * PAR_S, PARABOLA.puntoDato[1] * PAR_S, 0]}>
        <sphereGeometry args={[0.12, 18, 18]} />
        <meshStandardMaterial color={ORO} emissive={ORO} emissiveIntensity={0.6} toneMapped={false} />
      </mesh>
      <Html position={[PARABOLA.puntoDato[0] * PAR_S + 0.5, PARABOLA.puntoDato[1] * PAR_S - 0.1, 0]} center distanceFactor={16} pointerEvents="none">
        <div style={{ color: ORO, fontSize: 10.5, fontWeight: 800, textShadow: "0 2px 8px #000", whiteSpace: "nowrap" }}>
          (1, 0.25)
        </div>
      </Html>

      <Html position={[0, (focoY + 1.4) * PAR_S, 0]} center distanceFactor={15} pointerEvents="none">
        <div style={{ color: "#fff", fontSize: 12, fontWeight: 900, textShadow: "0 2px 8px #000", whiteSpace: "nowrap" }}>
          y = 0.25·x²
        </div>
      </Html>

      <ContactShadows position={[0, -0.3, 0]} opacity={0.2} scale={14} blur={2.4} far={6} />
    </group>
  );
}

/* ════════════════════ MODO COBERTURA: círculo + casa ════════════════════ */
const COB_S = 1.05; // escala mundo (radio 5 → 5.25)

function Cobertura({ pausado }: { pausado: boolean }) {
  const reloj = useRef(0);
  const onda = useRef<THREE.Mesh>(null);
  const r = COBERTURA.radio;

  const circulo = useMemo<Punto3[]>(() => {
    const pts: Punto3[] = [];
    const N = 96;
    for (let i = 0; i <= N; i++) {
      const th = (i / N) * Math.PI * 2;
      pts.push([Math.cos(th) * r * COB_S, Math.sin(th) * r * COB_S, 0]);
    }
    return pts;
  }, [r]);

  const casa: Punto3 = [COBERTURA.casa[0] * COB_S, COBERTURA.casa[1] * COB_S, 0];

  useFrame((_, delta) => {
    if (!pausado) reloj.current += delta;
    const m = onda.current;
    if (!m) return;
    const phase = (reloj.current * 0.5) % 1;
    const s = phase * r * COB_S;
    m.scale.set(s, s, s);
    const mat = m.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.5 * (1 - phase);
  });

  return (
    <group rotation={[-Math.PI / 2.2, 0, 0]}>
      {/* disco de cobertura */}
      <mesh position={[0, 0, -0.02]}>
        <circleGeometry args={[r * COB_S, 64]} />
        <meshBasicMaterial color={AZUL} transparent opacity={0.1} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      {/* borde x²+y²=25 */}
      <Line points={circulo} color={AZUL} lineWidth={3} />

      {/* ejes */}
      <Line points={[[-r * COB_S - 0.6, 0, 0], [r * COB_S + 0.6, 0, 0]]} color={EJE} lineWidth={1.2} />
      <Line points={[[0, -r * COB_S - 0.6, 0], [0, r * COB_S + 0.6, 0]]} color={EJE} lineWidth={1.2} />

      {/* onda expansiva */}
      <mesh ref={onda} position={[0, 0, 0.01]}>
        <ringGeometry args={[0.92, 1, 48]} />
        <meshBasicMaterial color={AZUL} transparent opacity={0.4} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>

      {/* antena en el origen */}
      <mesh position={[0, 0, 0.1]}>
        <cylinderGeometry args={[0.05, 0.05, 0.8, 12]} />
        <meshStandardMaterial color="#cdd9e6" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.5]}>
        <sphereGeometry args={[0.16, 18, 18]} />
        <meshStandardMaterial color={MAGENTA} emissive={MAGENTA} emissiveIntensity={0.9} toneMapped={false} />
      </mesh>

      {/* línea r del centro a la casa */}
      <Line points={[[0, 0, 0.05], casa]} color={VERDE} lineWidth={2} dashed dashSize={0.2} gapSize={0.14} />

      {/* casa (3,4) — en el borde */}
      <mesh position={[casa[0], casa[1], 0.15]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color={VERDE} emissive={VERDE} emissiveIntensity={0.5} metalness={0.2} roughness={0.5} toneMapped={false} />
      </mesh>
      <Html position={[casa[0], casa[1] + 0.7, 0.2]} center distanceFactor={14} pointerEvents="none">
        <div style={{ color: VERDE, fontSize: 11, fontWeight: 900, textShadow: "0 2px 8px #000", whiteSpace: "nowrap", textAlign: "center" }}>
          Casa (3, 4)<br />3²+4² = 25 = r² · en el borde
        </div>
      </Html>

      <Html position={[r * COB_S * 0.72, r * COB_S * 0.72, 0]} center distanceFactor={15} pointerEvents="none">
        <div style={{ color: AZUL, fontSize: 11.5, fontWeight: 900, textShadow: "0 2px 8px #000", whiteSpace: "nowrap" }}>
          x² + y² = 25
        </div>
      </Html>

      <ContactShadows position={[0, 0, -0.05]} opacity={0.2} scale={14} blur={2.2} far={6} />
    </group>
  );
}

/* ════════════════════ CANVAS ════════════════════════════════════════════ */
export default function ModeladoConicasScene(props: ModeladoConicasSceneProps) {
  const camPos: [number, number, number] =
    props.modo === "seccion" ? [10, 4, 12] : props.modo === "parabola" ? [0, 1.5, 13] : [0, 2, 15];
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: camPos, fov: 46 }}
    >
      <Contenido {...props} />
    </Canvas>
  );
}

function Contenido(props: ModeladoConicasSceneProps) {
  const { accent, autoRotate, resetNonce, modo, gammaDeg, pausado } = props;
  return (
    <>
      <color attach="background" args={["#03101f"]} />
      <fog attach="fog" args={["#03101f", 26, 60]} />

      <ambientLight intensity={0.62} />
      <directionalLight
        position={[5, 10, 8]}
        intensity={1.25}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={42}
        shadow-bias={-0.0004}
      />
      <pointLight position={[0, 2, 9]} intensity={1.8} color="#ffffff" />

      <group key={`${resetNonce}`}>
        {modo === "seccion" && <Seccion gammaDeg={gammaDeg} accent={accent} pausado={pausado} />}
        {modo === "parabola" && <Antena pausado={pausado} />}
        {modo === "circunferencia" && <Cobertura pausado={pausado} />}
      </group>

      <Environment resolution={256}>
        <Lightformer intensity={1.4} position={[0, 7, 6]} scale={[16, 5, 1]} color="#ffffff" />
        <Lightformer intensity={1.0} position={[-9, 3, 2]} scale={[5, 6, 1]} color={accent} />
        <Lightformer intensity={1.0} position={[9, 2, 4]} scale={[4, 5, 1]} color="#bfe8ff" />
      </Environment>

      <OrbitControls
        enablePan={false}
        minDistance={7}
        maxDistance={26}
        minPolarAngle={Math.PI / 7}
        maxPolarAngle={Math.PI / 1.85}
        target={[0, modo === "seccion" ? 1 : 0, 0]}
        autoRotate={autoRotate}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.55} luminanceThreshold={0.5} luminanceSmoothing={0.3} mipmapBlur radius={0.7} />
        <Vignette eskil={false} offset={0.28} darkness={0.42} />
      </EffectComposer>
    </>
  );
}
