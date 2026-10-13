"use client";

/**
 * Escena 3D del laboratorio de Fotosíntesis — R3F.
 * Se carga de forma diferida (ssr:false) desde LabFotosintesis.tsx.
 *
 * UN VIAJE DE ESCALAS («Powers of Ten»): planta → corte de hoja →
 * cloroplasto → membrana del tilacoide. Al cambiar de modo no hay corte: un
 * solo número (`zoom`) recorre las escalas; cada una crece alrededor del
 * punto donde vive la siguiente (ver fotosintesis-zoom.ts) mientras la cámara
 * se desliza a su punto de vista.
 *
 * Lo que el alumno mueve se VE en todas las escalas:
 *   · intensidad de luz → cuántos fotones llegan y cuánto brilla el Sol;
 *   · color de la luz → los fotones rojos y azules se absorben, los verdes
 *     rebotan (y la planta se ve oscura bajo luz roja: la está absorbiendo);
 *   · tasa (luz absorbida × CO₂ × temperatura) → burbujas de O₂, electrones,
 *     H⁺, giro de la ATP sintasa, velocidad del ciclo de Calvin, glucosa.
 *
 * Patrón R3F: el estado vivo está en una referencia (`Sim`) que el director
 * actualiza cada cuadro; las partículas la leen sin re-renderizar React.
 */

import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  factorCO2, factorTemp, tasaConColor, absorcionLuz, aperturaEstoma, COLORES_LUZ, type ColorLuz,
} from "./fotosintesis-data";
import { calidadEscena } from "./_escenario";
import { SimCtx, simInicial, GrupoEscala, type Sim } from "./fotosintesis-runtime";
import { VISTAS, FONDOS, NUM_ESCALAS, type VistaEscala } from "./fotosintesis-zoom";
import { EscalaPlanta, SOL_PLANTA } from "./fotosintesis-planta";
import { EscalaHoja } from "./fotosintesis-hoja";
import { EscalaCloroplasto } from "./fotosintesis-cloroplasto";
import { EscalaTilacoide } from "./fotosintesis-tilacoide";

export interface FotosintesisSceneProps {
  luz: number;
  co2: number;
  temp: number;
  /** Color de la luz (blanca por omisión). */
  color?: ColorLuz;
  /** Escala a la que viaja la cámara: 0 planta … 3 tilacoide. */
  nivel?: number;
  accent: string;
  pausado: boolean;
  autoRotate: boolean;
  resetNonce: number;
  /** Avisa cuando la cámara llegó a una escala (para mostrar etiquetas). */
  onLlegada?: (nivel: number) => void;
}

type Calidad = "alta" | "media" | "baja";

/* ── Cielo: degradado que cambia de tono con la escala ───────────────── */
function Cielo({ simRef }: { simRef: React.RefObject<Sim> }) {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: { cenit: { value: new THREE.Color(FONDOS[0]![0]) }, horizonte: { value: new THREE.Color(FONDOS[0]![1]) } },
    vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: "uniform vec3 cenit; uniform vec3 horizonte; varying vec3 vP; void main(){ float h = smoothstep(-0.35, 0.75, vP.y); vec3 c = mix(horizonte, cenit, h); c *= 1.0 - 0.25 * smoothstep(0.0, -0.8, vP.y); gl_FragColor = vec4(c, 1.0); }",
  }), []);
  const cols = useMemo(() => FONDOS.map(([a, b]) => [new THREE.Color(a), new THREE.Color(b)] as const), []);
  useFrame(() => {
    const z = Math.max(0, Math.min(NUM_ESCALAS - 1, simRef.current.zoom));
    const i = Math.min(NUM_ESCALAS - 2, Math.floor(z));
    const f = z - i;
    (mat.uniforms.cenit!.value as THREE.Color).copy(cols[i]![0]).lerp(cols[i + 1]![0], f);
    (mat.uniforms.horizonte!.value as THREE.Color).copy(cols[i]![1]).lerp(cols[i + 1]![1], f);
  });
  return (
    <mesh material={mat} raycast={() => null} renderOrder={-1}>
      <sphereGeometry args={[150, 32, 16]} />
    </mesh>
  );
}

/* ── Luz: el Sol (del color elegido) y un relleno suave ──────────────── */
function Luces({ simRef, sombras }: { simRef: React.RefObject<Sim>; sombras: boolean }) {
  const sol = useRef<THREE.DirectionalLight>(null);
  const tmp = useMemo(() => ({ a: new THREE.Vector3(...SOL_PLANTA).normalize().multiplyScalar(14), b: new THREE.Vector3(-6, 10, 7), blanco: new THREE.Color("#fff4e0") }), []);
  useFrame(() => {
    const s = simRef.current;
    const l = sol.current;
    if (!l) return;
    const f = Math.min(1, s.zoom);
    l.position.copy(tmp.a).lerp(tmp.b, f);
    // A escala molecular la luz de colores lo teñiría todo: ahí manda el
    // color de los fotones y la iluminación vuelve casi a blanco.
    l.color.copy(s.colorLuz).lerp(tmp.blanco, Math.min(1, Math.max(0, s.zoom - 1)) * 0.7);
    l.intensity = 0.2 + s.luz * 3.4;
  });
  return (
    <>
      <hemisphereLight args={["#cfe6ff", "#2a2016", 0.55]} />
      <directionalLight
        ref={sol}
        castShadow={sombras}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-bias={-0.0006}
        shadow-normalBias={0.02}
      />
      <pointLight position={[6, 2, 6]} intensity={14} color="#9fd8ff" distance={30} />
      <Environment resolution={256} environmentIntensity={0.55}>
        <Lightformer intensity={2} position={[0, 7, 3]} scale={[12, 4, 1]} color="#ffffff" />
        <Lightformer intensity={1.2} position={[-7, 2, -2]} scale={[7, 7, 1]} color="#7dffa0" />
        <Lightformer intensity={1.1} position={[6, 1, 5]} scale={[5, 5, 1]} color="#bfe8ff" />
      </Environment>
    </>
  );
}

/* ── Director: estado vivo, zoom entre escalas y viaje de cámara ─────── */
const suave = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function Director({ simRef, props }: { simRef: React.RefObject<Sim>; props: FotosintesisSceneProps }) {
  const tam = useThree((s) => s.size);
  const objetivo = useRef(props);
  useEffect(() => { objetivo.current = props; }, [props]);

  const colorObj = useMemo(() => new THREE.Color(), []);
  const viaje = useRef({ activo: false, t: 0, dur: 1, z0: 0, z1: 0, desde: { az: 0, pol: 0, dist: 0, tx: 0, ty: 0 } as VistaEscala, nonce: -1, inicio: true });
  const tmp = useMemo(() => ({ v: new THREE.Vector3(), esf: new THREE.Spherical() }), []);

  const aspecto = tam.width / Math.max(1, tam.height);
  const factorDist = aspecto < 1.25 ? Math.pow(1.25 / aspecto, 0.7) : 1;
  // En vertical la leyenda ocupa la parte de arriba: el sujeto baja un poco.
  const subeTy = aspecto < 1 ? 0.55 : 0;

  useFrame((estado, delta) => {
    const camara = estado.camera;
    const ctl = estado.controls as OrbitControlsImpl | null;
    const s = simRef.current;
    const o = objetivo.current;
    const dt = Math.min(delta, 0.05);
    const color = o.color ?? "blanca";

    // 1) Estado de la simulación, suavizado (nada brinca al mover un deslizador).
    const k = 1 - Math.exp(-dt * 4);
    s.luz += (o.luz / 100 - s.luz) * k;
    s.absorcion += (absorcionLuz(color) - s.absorcion) * k;
    s.tasa += (tasaConColor(o.luz, o.co2, o.temp, color) - s.tasa) * k;
    s.fCO2 += (factorCO2(o.co2) - s.fCO2) * k;
    s.fTemp += (factorTemp(o.temp) - s.fTemp) * k;
    s.apertura += (aperturaEstoma(o.luz, o.temp) - s.apertura) * k;
    colorObj.set(COLORES_LUZ.find((c) => c.id === color)?.hex ?? "#ffffff");
    s.colorLuz.lerp(colorObj, k);
    s.colorId = color;
    s.dt = o.pausado ? 0 : dt;
    s.t += s.dt;

    // 2) ¿Hay que viajar? (cambio de escala o reinicio de cámara)
    const v = viaje.current;
    const nivel = Math.max(0, Math.min(NUM_ESCALAS - 1, o.nivel ?? 0));
    if (v.inicio || nivel !== v.z1 || o.resetNonce !== v.nonce) {
      const ancla = ctl ? ctl.target : tmp.v.set(0, 0, 0);
      tmp.esf.setFromVector3(tmp.v.copy(camara.position).sub(ancla));
      v.desde = { az: tmp.esf.theta, pol: tmp.esf.phi, dist: tmp.esf.radius, tx: ancla.x, ty: ancla.y };
      if (v.inicio) {
        const w = VISTAS[nivel]!;
        v.desde = { ...w, dist: w.dist * factorDist, ty: w.ty + subeTy };
        s.zoom = nivel;
      }
      v.z0 = s.zoom;
      v.z1 = nivel;
      v.t = 0;
      v.dur = v.inicio ? 0.001 : 1.1 + Math.abs(nivel - s.zoom) * 0.9;
      v.activo = true;
      v.nonce = o.resetNonce;
      v.inicio = false;
      if (ctl) ctl.enabled = false;
      props.onLlegada?.(-1);
    }
    if (v.activo) {
      v.t += dt;
      const p = Math.min(1, v.t / v.dur);
      const e = suave(p);
      s.zoom = v.z0 + (v.z1 - v.z0) * e;
      const a = v.desde;
      const b = VISTAS[v.z1]!;
      let dAz = b.az - a.az;
      dAz = Math.atan2(Math.sin(dAz), Math.cos(dAz));
      const az = a.az + dAz * e;
      const pol = a.pol + (b.pol - a.pol) * e;
      const dist = a.dist + (b.dist * factorDist - a.dist) * e;
      const tx = a.tx + (b.tx - a.tx) * e;
      const ty = a.ty + (b.ty + subeTy - a.ty) * e;
      tmp.esf.set(dist, pol, az);
      camara.position.setFromSpherical(tmp.esf).add(tmp.v.set(tx, ty, 0));
      if (ctl) ctl.target.set(tx, ty, 0);
      camara.lookAt(tx, ty, 0);
      if (p >= 1) {
        v.activo = false;
        s.zoom = v.z1;
        if (ctl) {
          ctl.enabled = true;
          ctl.update();
        }
        props.onLlegada?.(v.z1);
      }
    }
  }, -2);

  return null;
}

/* ── Contenido ───────────────────────────────────────────────────────── */
function Contenido({ props, calidad }: { props: FotosintesisSceneProps; calidad: Calidad }) {
  const simRef = useRef<Sim>(simInicial());
  const ancho = useThree((s) => s.size.width);
  const angosto = ancho < 640;
  const pocos = calidad === "baja";
  const [llegada, setLlegada] = useState(-1);
  const props2 = useMemo(() => ({ ...props, onLlegada: (n: number) => { setLlegada(n); props.onLlegada?.(n); } }), [props]);
  const post = calidad !== "baja" && !angosto;
  const nivel = props.nivel ?? 0;

  return (
    <SimCtx.Provider value={simRef}>
      <Director simRef={simRef} props={props2} />
      <Cielo simRef={simRef} />
      <Luces simRef={simRef} sombras={!pocos} />

      <group>
        <GrupoEscala k={0}><EscalaPlanta etiquetas={llegada === 0 && nivel === 0} angosto={angosto} pocos={pocos} /></GrupoEscala>
        <GrupoEscala k={1}><EscalaHoja etiquetas={llegada === 1 && nivel === 1} angosto={angosto} pocos={pocos} /></GrupoEscala>
        <GrupoEscala k={2}><EscalaCloroplasto etiquetas={llegada === 2 && nivel === 2} angosto={angosto} pocos={pocos} /></GrupoEscala>
        <GrupoEscala k={3}><EscalaTilacoide etiquetas={llegada === 3 && nivel === 3} angosto={angosto} pocos={pocos} /></GrupoEscala>
      </group>

      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={6}
        maxDistance={22}
        minPolarAngle={Math.PI / 9}
        maxPolarAngle={Math.PI / 1.85}
        autoRotate={props.autoRotate}
        autoRotateSpeed={0.45}
      />

      {post && (
        <EffectComposer enableNormalPass={false} multisampling={4}>
          <Bloom intensity={0.75} luminanceThreshold={0.92} luminanceSmoothing={0.18} mipmapBlur radius={0.7} />
          <Vignette eskil={false} offset={0.26} darkness={0.5} />
        </EffectComposer>
      )}
    </SimCtx.Provider>
  );
}

export default function FotosintesisScene(props: FotosintesisSceneProps) {
  const [calidad, setCalidad] = useState<Calidad>(() => calidadEscena());
  const [dpr, setDpr] = useState(1.75);
  return (
    <Canvas
      shadows={calidad !== "baja"}
      dpr={[1, dpr]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      camera={{ position: [4, 3, 12], fov: 38, near: 0.05, far: 400 }}
    >
      <PerformanceMonitor
        onDecline={() => {
          setDpr(1);
          setCalidad((c) => (c === "alta" ? "media" : c));
        }}
      />
      <Contenido props={props} calidad={calidad} />
    </Canvas>
  );
}
