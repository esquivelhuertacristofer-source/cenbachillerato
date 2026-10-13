"use client";

/**
 * Escena 3D — «Cónicas como lugares geométricos» (PM-IV-P07), versión sala de
 * museo de matemáticas.
 *
 * Una sala oscura con piso pulido y luz de museo. Según el modo:
 *  · CONO — el cono de Apolonio cortado por un plano que el alumno inclina y
 *    desplaza (conicas-apolonio3d.tsx), con la forma canónica del corte y su
 *    ecuación en una pizarra.
 *  · CIRCUNFERENCIA, ELIPSE, PARÁBOLA, HIPÉRBOLA — los lugares geométricos
 *    trazados sobre una pizarra de esquisto (conicas-lugares3d.tsx).
 *  · APLICACIONES — antena parabólica, órbita de Kepler y galería de los
 *    susurros (conicas-aplicaciones3d.tsx).
 *
 * Patrón R3F: el default export solo monta <Canvas> y delega en <Contenido>.
 * La fase del punto móvil llega por props (0..1) y cada pieza la suaviza en
 * `useFrame`. En celular o GPU débil: sin postproceso, menos rayos, piso mate.
 */

import * as THREE from "three";
import { useMemo, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, ContactShadows, PerformanceMonitor } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { MesaLaboratorio, EntornoLaboratorio, calidadEscena } from "./_escenario";
import { type Modo } from "./conicas-data";
import { Guia, encuadrar, FOV, FONDO_SALA, type Pt } from "./conicas-museo3d";
import { EscenaApolonio, SUELO_SALA, PIZ_X, PIZ_LADO, PIZ_U } from "./conicas-apolonio3d";
import { EscenaCircunferencia, EscenaElipse, EscenaParabola, EscenaHiperbola, PizarraSala, U } from "./conicas-lugares3d";
import { EscenaAntena, EscenaOrbita, EscenaGaleria, ANT_Y, ORB_Y } from "./conicas-aplicaciones3d";
import {
  type ModoConicas, type VistaAplicacion, type Corte, type Elipse, type Hiperbola,
  H_NAPA, LADO_PIZARRA, R_ANTENA, A_ORBITA, A_GALERIA,
} from "./conicas-museo-data";

export interface ConicasSceneProps {
  modo: ModoConicas | Modo;
  // circunferencia
  h: number; k: number; r: number; qx: number; qy: number;
  // parábola
  p: number;
  // cono de Apolonio
  corte: Corte;
  // elipse / hipérbola
  elipse: Elipse;
  hiperbola: Hiperbola;
  // aplicaciones
  vista: VistaAplicacion;
  fAntena: number; hReceptor: number; senalAntena: number;
  eOrbita: number;
  cGaleria: number; xOyente: number; senalGaleria: number;
  // común
  fase: number;            // 0..1, posición del punto móvil P
  mostrarFocal: boolean;   // parábola: propiedad focal (rayos)
  accent: string;
  autoRotate: boolean;
  pausado: boolean;
  resetNonce: number;
}

/* ── Encuadre de cada vista ──────────────────────────────────────────────── */
function marcoDe(p: ConicasSceneProps, aspect: number, angosto: boolean): { objetivo: Pt; distancia: number; dir: Pt; clave: string } {
  if (p.modo === "cono") {
    const xmax = angosto ? 3.0 : PIZ_X + PIZ_LADO * PIZ_U + 0.5;
    return { ...(angosto ? encuadrar(-2.6, 2.6, -H_NAPA - 0.7, H_NAPA + 0.45, aspect, true) : encuadrar(-3.1, xmax, SUELO_SALA + 0.2, H_NAPA + 1.2, aspect)), dir: angosto ? [0.3, 0.5, 1] : [0.1, 0.42, 1], clave: "cono" };
  }
  if (p.modo === "aplicaciones") {
    if (p.vista === "antena") return { ...encuadrar(-R_ANTENA - 0.7, R_ANTENA + 0.7, SUELO_SALA + 0.3, ANT_Y + 4.3, aspect, angosto), dir: [0.3, 0.42, 1], clave: "antena" };
    if (p.vista === "orbita") {
      const e = encuadrar(-A_ORBITA - 0.8, A_ORBITA + 0.8, -3.3, 2.6, aspect, angosto);
      return { objetivo: [0, ORB_Y - 0.6, 0], distancia: e.distancia * 0.95, dir: [0.1, 0.78, 1], clave: "orbita" };
    }
    const e = encuadrar(-A_GALERIA * 0.72 - 0.6, A_GALERIA * 0.72 + 0.6, -2.9, 3.3, aspect, angosto);
    return { objetivo: [0, SUELO_SALA + 0.4, 0.2], distancia: e.distancia * 0.98, dir: [0.05, 0.95, 1], clave: "galeria" };
  }
  const L = LADO_PIZARRA * U + 0.3;
  return { ...encuadrar(-L, L, -L, L + 0.6, aspect, angosto), dir: [0.34, 0.2, 1], clave: "pizarra" };
}

/* ── Contenido ────────────────────────────────────────────────────────────── */
function Contenido(props: ConicasSceneProps & { ligero: boolean }) {
  const { modo, accent, resetNonce, autoRotate, pausado, ligero } = props;
  const size = useThree((st) => st.size);
  const angosto = size.width < 640;
  const aspect = size.width / Math.max(1, size.height);
  const [debil, setDebil] = useState(false);
  const calidad = useMemo(() => calidadEscena(), []);
  const fino = ligero || debil || calidad === "baja";
  const marco = marcoDe(props, aspect, angosto);
  const espacio = modo === "aplicaciones" && props.vista === "orbita";
  const esPizarra = modo === "circunferencia" || modo === "elipse" || modo === "parabola" || modo === "hiperbola";

  return (
    <>
      <PerformanceMonitor onDecline={() => setDebil(true)} />
      <color attach="background" args={[espacio ? "#02040a" : FONDO_SALA]} />
      {!espacio && <fog attach="fog" args={[FONDO_SALA, 30, 70]} />}

      {/* Luz de museo: un cenital cálido con penumbra suave, relleno del color
          del laboratorio y un contraluz frío que recorta las siluetas. */}
      <ambientLight intensity={espacio ? 0.12 : 0.3} />
      {!espacio && (
        <spotLight
          position={[-2, 14, 9]} angle={0.6} penumbra={0.9} intensity={340} decay={2} color="#fff3e2"
          castShadow={!fino} shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-bias={-0.0004}
        />
      )}
      <pointLight position={[-9, 4, 6]} intensity={espacio ? 4 : 14} color={accent} />
      <pointLight position={[6, 6, -8]} intensity={espacio ? 4 : 18} color="#bfe8ff" />
      <EntornoLaboratorio acento={accent} />

      {!espacio && (
        <>
          <MesaLaboratorio y={SUELO_SALA} tam={60} brillo={0.45} color="#0a1828" calidad={fino ? "baja" : calidad} />
          <ContactShadows position={[0, SUELO_SALA + 0.01, 0]} opacity={0.6} scale={30} blur={2.4} far={8} color="#01040a" />
        </>
      )}

      <group key={`${modo}-${props.vista}-${resetNonce}`}>
        {modo === "cono" && <EscenaApolonio corte={props.corte} fino={fino} />}
        {esPizarra && <PizarraSala />}
        {modo === "circunferencia" && (
          <EscenaCircunferencia h={props.h} k={props.k} r={props.r} qx={props.qx} qy={props.qy} fase={props.fase} accent={accent} />
        )}
        {modo === "elipse" && <EscenaElipse el={props.elipse} fase={props.fase} accent={accent} />}
        {modo === "parabola" && <EscenaParabola p={props.p} fase={props.fase} mostrarFocal={props.mostrarFocal} accent={accent} fino={fino} />}
        {modo === "hiperbola" && <EscenaHiperbola hi={props.hiperbola} fase={props.fase} accent={accent} />}
        {modo === "aplicaciones" && props.vista === "antena" && (
          <EscenaAntena f={props.fAntena} hR={props.hReceptor} senal={props.senalAntena} fino={fino} accent={accent} />
        )}
        {modo === "aplicaciones" && props.vista === "orbita" && <EscenaOrbita e={props.eOrbita} fase={props.fase} accent={accent} fino={fino} />}
        {modo === "aplicaciones" && props.vista === "galeria" && (
          <EscenaGaleria c={props.cGaleria} xL={props.xOyente} senal={props.senalGaleria} fino={fino} />
        )}
      </group>

      <Guia objetivo={marco.objetivo} distancia={marco.distancia} dir={marco.dir} claveVista={`${marco.clave}-${resetNonce}-${angosto}`} />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={5}
        maxDistance={46}
        minPolarAngle={Math.PI / 9}
        maxPolarAngle={espacio ? Math.PI / 1.6 : Math.PI / 2.05}
        autoRotate={autoRotate && !pausado}
        autoRotateSpeed={0.45}
      />

      {!fino && (
        <EffectComposer enableNormalPass={false} multisampling={4}>
          <Bloom intensity={0.7} luminanceThreshold={0.82} luminanceSmoothing={0.2} mipmapBlur />
          <Vignette eskil={false} offset={0.25} darkness={0.55} />
        </EffectComposer>
      )}
    </>
  );
}

export default function ConicasScene(props: ConicasSceneProps) {
  // Celular / táctil: sin postproceso y con menos rayos.
  const ligero = useMemo(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia?.("(pointer: coarse)").matches || window.innerWidth < 640;
  }, []);
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping }}
      onCreated={({ gl }) => { gl.localClippingEnabled = true; }}
      camera={{ position: [4, 4, 22], fov: FOV, near: 0.1, far: 1200 }}
    >
      <Contenido {...props} ligero={ligero} />
    </Canvas>
  );
}
