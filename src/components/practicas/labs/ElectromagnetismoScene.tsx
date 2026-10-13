"use client";

/**
 * Escena 3D — "Electromagnetismo: Ohm, Faraday y motores" (CNEYT-V-P07-A2).
 *
 * Tres MODOS, según la prop `modo` (cada uno en su archivo):
 *  · "circuito"  — un circuito real sobre un banco de trabajo: fuente de
 *    laboratorio, resistencia con su código de colores, foco y multímetro.
 *    Los electrones corren a una rapidez ∝ I = V/R; el foco brilla según
 *    P = V²/R. (Parte (a) del problema A2.)        → electromagnetismo-circuito3d
 *  · "generador" — turbina Francis → bobina de N vueltas entre los polos de un
 *    imán → anillos y escobillas → foco y osciloscopio con
 *    FEM = N·B·A·ω·sen(ωt).                         → electromagnetismo-generador3d
 *  · "motor"     — motor en corte; la energía de entrada se parte en útil
 *    (verde) y calor (rojo). (Parte (b) del problema A2.)
 *                                                   → electromagnetismo-motor3d
 *
 * Un solo <Canvas>: al cambiar de modo o de vista la cámara VIAJA (no salta).
 * React Compiler: la animación vive en useFrame y solo muta refs.
 */

import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PerformanceMonitor } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Escenario, calidadEscena } from "./_escenario";
import type { Modo } from "./electromagnetismo-data";
import { EscenaCircuito } from "./electromagnetismo-circuito3d";
import { EscenaGenerador } from "./electromagnetismo-generador3d";
import { EscenaMotor } from "./electromagnetismo-motor3d";

export interface ElectromagnetismoSceneProps {
  modo: Modo;
  // circuito
  V: number;
  R: number;
  horas: number;
  precio: number;
  // generador
  N: number;
  B: number;
  area: number;
  f: number;
  // motor
  pElec: number;
  efic: number;
  // común
  playing: boolean;
  accent: string;
  resetNonce: number;
  /** Índice del punto de vista (ver VISTAS_NOMBRES). 0 = vista general. */
  vista?: number;
}

type Pt = [number, number, number];
type Calidad = "alta" | "media" | "baja";

/** Puntos de vista por modo, en el mismo orden que VISTAS_NOMBRES. */
const VISTAS: Record<Modo, { pos: Pt; target: Pt }[]> = {
  circuito: [
    { pos: [0.3, 6.1, 10.4], target: [0.2, 0.45, 0.1] },
    { pos: [1.9, 3.7, 6.3], target: [1.9, 0.7, 1.3] },
    { pos: [2.1, 2.3, 3.7], target: [2.75, 1.45, -0.1] },
    { pos: [-2.3, 2.4, 3.6], target: [-3.1, 0.85, -0.7] },
  ],
  generador: [
    { pos: [6.2, 7.0, 14.4], target: [0.1, 1.3, 0] },
    { pos: [1.6, 3.6, 5.4], target: [0.2, 1.75, 0] },
    { pos: [1.7, 2.3, 5.0], target: [4.2, 1.0, 1.0] },
    { pos: [-1.6, 3.8, 5.4], target: [-3.6, 1.9, -0.4] },
  ],
  motor: [
    { pos: [4.7, 6.6, 12.8], target: [0.2, 1.0, 1.0] },
    { pos: [2.4, 3.0, 5.2], target: [0.3, 1.7, 0] },
    { pos: [0.6, 8.6, 6.2], target: [0.3, 0, 2.2] },
  ],
};

/** Semiancho del contenido de cada modo (para que quepa en pantallas angostas). */
const SEMIANCHO: Record<Modo, number> = { circuito: 4.7, generador: 6.0, motor: 5.4 };
const FOV = 38;

/* ── Cámara que viaja y se aparta cuando el alumno toma el control ────────── */
function RigCamara({ pos, target, clave }: { pos: THREE.Vector3; target: THREE.Vector3; clave: string }) {
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;
  const activo = useRef(true);
  const ultima = useRef<string | null>(null);
  useEffect(() => {
    if (!controls) return undefined;
    const parar = () => { activo.current = false; };
    controls.addEventListener("start", parar);
    return () => controls.removeEventListener("start", parar);
  }, [controls]);
  useFrame((state, dt) => {
    if (!controls) return;
    if (ultima.current !== clave) {
      // Toma de entrada: la primera vez la cámara llega desde lejos y arriba.
      if (ultima.current === null) {
        state.camera.position.copy(pos).sub(target).multiplyScalar(1.7).add(target);
        state.camera.position.y += 3;
        controls.target.copy(target);
      }
      ultima.current = clave;
      activo.current = true;
    }
    if (!activo.current) return;
    const k = 1 - Math.exp(-Math.min(dt, 0.05) * 2.2);
    state.camera.position.lerp(pos, k);
    controls.target.lerp(target, k);
    controls.update();
    if (state.camera.position.distanceToSquared(pos) < 1e-4 && controls.target.distanceToSquared(target) < 1e-4) activo.current = false;
  });
  return null;
}

function Contenido(props: ElectromagnetismoSceneProps & { calidad: Calidad }) {
  const { modo, accent, resetNonce, playing, calidad } = props;
  const size = useThree((s) => s.size);
  const angosto = size.width < 640;
  const pocos = calidad === "baja" || angosto;
  const lista = VISTAS[modo];
  const iv = Math.max(0, Math.min(lista.length - 1, props.vista ?? 0));
  const v = lista[iv]!;

  // Que el contenido quepa a lo ANCHO en pantallas verticales: se aleja la cámara.
  const aspecto = size.width / Math.max(1, size.height);
  const tanH = Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * aspecto;
  const destino = useMemo(() => {
    const target = new THREE.Vector3(...v.target);
    const pos = new THREE.Vector3(...v.pos);
    const dist = pos.distanceTo(target);
    const necesaria = (SEMIANCHO[modo] * (angosto ? 1.0 : 1.08)) / tanH;
    const factor = iv === 0 ? Math.min(2.6, Math.max(angosto ? 1 : 1.1, necesaria / dist)) : Math.min(1.7, Math.max(1, (necesaria * 0.55) / dist));
    pos.sub(target).multiplyScalar(factor).add(target);
    return { pos, target };
  }, [v, modo, iv, tanH, angosto]);

  const post = calidad !== "baja" && !angosto;
  return (
    <>
      <Escenario acento={accent} suelo={0} calidad={calidad} />
      {/* luz de trabajo cálida sobre el banco */}
      <spotLight position={[2, 9, 6]} angle={0.55} penumbra={0.8} intensity={60} distance={30} decay={1.6} color="#fff1dc" />

      <group key={`${modo}-${resetNonce}`}>
        {modo === "circuito" && <EscenaCircuito V={props.V} R={props.R} playing={playing} angosto={angosto} pocos={pocos} />}
        {modo === "generador" && <EscenaGenerador N={props.N} B={props.B} area={props.area} f={props.f} playing={playing} angosto={angosto} pocos={pocos} />}
        {modo === "motor" && <EscenaMotor pElec={props.pElec} efic={props.efic} playing={playing} angosto={angosto} pocos={pocos} />}
      </group>

      <RigCamara pos={destino.pos} target={destino.target} clave={`${modo}|${iv}|${resetNonce}|${angosto}`} />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={3}
        maxDistance={30}
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={Math.PI / 2.15}
      />

      {post && (
        <EffectComposer enableNormalPass={false} multisampling={4}>
          <Bloom intensity={0.7} luminanceThreshold={0.92} luminanceSmoothing={0.18} mipmapBlur />
          <Vignette eskil={false} offset={0.22} darkness={0.5} />
        </EffectComposer>
      )}
    </>
  );
}

export default function ElectromagnetismoScene(props: ElectromagnetismoSceneProps) {
  const [calidad, setCalidad] = useState<Calidad>(() => calidadEscena());
  const [dpr, setDpr] = useState(1.75);
  return (
    <Canvas
      dpr={[1, dpr]}
      shadows={calidad !== "baja"}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      camera={{ position: [0, 9, 20], fov: FOV, near: 0.1, far: 120 }}
    >
      <PerformanceMonitor onDecline={() => { setDpr(1); setCalidad((c) => (c === "alta" ? "media" : "baja")); }} />
      <Contenido {...props} calidad={calidad} />
    </Canvas>
  );
}
