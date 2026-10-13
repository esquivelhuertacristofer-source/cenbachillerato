"use client";

/**
 * Escena 3D del laboratorio "Interacciones entre subsistemas terrestres" — R3F.
 * Se carga de forma diferida (ssr:false) desde LabSubsistemas.tsx.
 *
 * La Tierra fotográfica de la NASA, abierta en cuña como en una lámina de
 * National Geographic, con sus cuatro subsistemas a la vista:
 *  · LITOSFERA  → el corte: corteza, manto en convección, núcleo externo líquido
 *                 y núcleo interno incandescente; límites de placas; volcán.
 *  · HIDROSFERA → océanos que se tiñen con la acidez, hielo marino que retrocede
 *                 con el calor y el ciclo del agua en el Golfo de México.
 *  · BIOSFERA   → la vegetación de la foto; la deforestación abre claros cafés y
 *                 la selva amazónica fija CO₂ (o humea).
 *  · ATMÓSFERA  → halo que se tiñe con el calentamiento; casquete de capas
 *                 exagerado sobre el corte con el efecto invernadero en vivo.
 * EXPERIMENTO CENTRAL: el termómetro junto a la Tierra sube y se pone rojo al
 * mover el CO₂; la marca blanca es el límite de +1.5 °C.
 *
 * Cada esfera (modo) lleva la cámara de viaje a su lugar y realza lo suyo.
 * Patrón R3F: useFrame solo dentro de <Canvas>; las animaciones mutan REFS
 * (sin setState ni Math.random/Date.now en el render → apto React Compiler).
 */

import * as THREE from "three";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { calcularEstado } from "./subsistemas-data";
import { ViaLactea } from "./_espacio";
import { TierraCorte, lonLat, type MetaTierra } from "./subsistemas-tierra3d";
import { LimitesPlacas, Volcan, CicloAgua, FlujoCarbono, Metano, Invernadero, Termometro, yTermometro } from "./subsistemas-procesos3d";
import {
  ALT_ATMOS, LUGAR, retencionInfrarrojo, R_CORTEZA, R_NUCLEO_EXTERNO, R_NUCLEO_INTERNO, type LonLat, type ModoEsfera,
} from "./subsistemas-capas";

export interface SubsistemasSceneProps {
  co2: number;
  veg: number;
  volc: number;
  permafrost: boolean;
  accent: string;
  pausado: boolean;
  autoRotate: boolean;
  resetNonce: number;
  /** Esfera en foco (la cámara viaja a ella). */
  modo?: ModoEsfera;
}

type Pt = [number, number, number];
const R = 2.0;            // radio del planeta
const FOV = 40;
const TAN_V = Math.tan((FOV / 2) * (Math.PI / 180));
/** Dirección hacia el Sol (mundo). */
const SOL = new THREE.Vector3(0.1, 0.42, 1).normalize();

/** Vista general: un poco más de frente a la cara z del corte (la que da al Sol). */
const DIR_SISTEMA = new THREE.Vector3(0.78, 0.62, 1).normalize();
/** «Izquierda» en pantalla desde esa vista (ahí va el termómetro). */
const IZQ_SISTEMA = new THREE.Vector3(-DIR_SISTEMA.z, 0, DIR_SISTEMA.x).normalize();

/* ── Encuadre ──────────────────────────────────────────────────────────── */
/** Distancia para que el contenido ocupe ~62 % del alto y ~88 % del ancho; el
 *  objetivo se corre hacia abajo para quedar entre la barra y la misión. */
function encuadrar(centro: THREE.Vector3, medioAncho: number, medioAlto: number, aspect: number, arriba: THREE.Vector3) {
  const d = Math.max(medioAlto / (TAN_V * 0.62), medioAncho / (TAN_V * 0.88 * aspect));
  const corrimiento = 0.05 * 2 * d * TAN_V;
  return { objetivo: centro.clone().addScaledVector(arriba, -corrimiento), distancia: d };
}

function marcoLugar(ll: LonLat) {
  const n = lonLat(ll, 1);
  const este = new THREE.Vector3(0, 1, 0).cross(n).normalize();
  const norte = new THREE.Vector3().crossVectors(n, este).normalize();
  return { n, este, norte };
}

interface Toma { objetivo: THREE.Vector3; distancia: number; dir: THREE.Vector3; min: number }

function tomaDe(modo: ModoEsfera, aspect: number): Toma {
  const Y = new THREE.Vector3(0, 1, 0);
  if (modo === "litosfera") {
    const dir = new THREE.Vector3(1, 0.85, 1.05).normalize();
    const e = encuadrar(new THREE.Vector3(0.62, 0.5, 0.62), 1.85, 1.55, aspect, Y);
    return { ...e, dir, min: 2.6 };
  }
  if (modo === "atmosfera") {
    const dir = new THREE.Vector3(0.28, 0.22, 1).normalize();
    const e = encuadrar(new THREE.Vector3(1.3, 1.28, 0.05), 1.75, 1.5, aspect, Y);
    return { ...e, dir, min: 2.6 };
  }
  if (modo === "hidrosfera") {
    const { n, este, norte } = marcoLugar([-96, 21.5]);
    const dir = n.clone().addScaledVector(norte, -0.95).addScaledVector(este, 0.15).normalize();
    const e = encuadrar(lonLat([-96, 21.5], R * 1.04), 0.46, 0.32, aspect, norte);
    return { ...e, dir, min: 0.7 };
  }
  if (modo === "biosfera") {
    const { n, este, norte } = marcoLugar([-62, -4]);
    const dir = n.clone().addScaledVector(norte, -0.6).addScaledVector(este, 0.1).normalize();
    const e = encuadrar(lonLat([-62, -4], R * 1.04), 0.72, 0.5, aspect, norte);
    return { ...e, dir, min: 0.9 };
  }
  // sistema: la Tierra y, a su izquierda, el termómetro
  const dir = DIR_SISTEMA.clone();
  const izq = IZQ_SISTEMA.clone();
  const angosto = aspect < 1;
  const e = angosto
    ? encuadrar(izq.clone().multiplyScalar(0.8), 3.2, 2.4, aspect, Y)
    : encuadrar(izq.clone().multiplyScalar(0.75), 2.95, 2.3, aspect, Y);
  return { ...e, dir, min: 4.2 };
}

/* ── Cámara guiada: viaja (sin saltos) a la toma de cada esfera ─────────── */
function Guia({ toma, clave }: { toma: Toma; clave: string }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;
  const resta = useRef(0);
  const ultima = useRef("");
  const iniciada = useRef(false);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    if (!controls) return undefined;
    const soltar = () => { resta.current = 0; };
    controls.addEventListener("start", soltar);
    return () => controls.removeEventListener("start", soltar);
  }, [controls]);

  useFrame((_, dtRaw) => {
    if (!controls) return;
    const dt = Math.min(dtRaw, 0.05);
    if (!iniciada.current) {
      // Entrada: la cámara llega desde lejos.
      iniciada.current = true;
      controls.target.copy(toma.objetivo);
      camera.position.copy(toma.objetivo).addScaledVector(toma.dir, toma.distancia * 2.4);
    }
    if (clave !== ultima.current) { ultima.current = clave; resta.current = 2.6; }
    if (resta.current <= 0) return;
    resta.current -= dt;
    tmp.copy(camera.position).sub(controls.target);
    const largo = THREE.MathUtils.damp(tmp.length(), toma.distancia, 2.6, dt);
    tmp.normalize().lerp(toma.dir, 1 - Math.exp(-dt * 2.6)).normalize().multiplyScalar(largo);
    controls.target.lerp(toma.objetivo, 1 - Math.exp(-dt * 3));
    camera.position.copy(controls.target).add(tmp);
    controls.update();
  });
  return null;
}

/** Nunca dentro del planeta, ni orbitando alrededor de un punto de la superficie. */
function FueraDelPlaneta() {
  useFrame(({ camera }) => {
    const l = camera.position.length();
    if (l < R * 1.12) camera.position.setLength(R * 1.12);
  });
  return null;
}

/* ── Etiqueta: tamaño fijo (sin distanceFactor), ≥ 14 px ────────────────── */
function Etiqueta({ pos, color, icono, nombre, dato, ancho, lado = "centro" }: {
  pos: THREE.Vector3 | Pt; color: string; icono: string; nombre: string; dato?: string; ancho: boolean;
  lado?: "centro" | "izq" | "der";
}) {
  // En celular las etiquetas van centradas en su punto: a un lado se salían de la pantalla.
  const l = ancho ? lado : "centro";
  const tx = l === "izq" ? "translate(-100%, -50%)" : l === "der" ? "translate(0, -50%)" : "translate(-50%, -50%)";
  return (
    <Html position={pos} pointerEvents="none" zIndexRange={[20, 0]} style={{ transform: tx }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 1, padding: "4px 10px", borderRadius: 10, background: "rgba(4,10,22,0.86)", border: `1.5px solid ${color}`, whiteSpace: "nowrap", boxShadow: "0 4px 16px rgba(0,0,0,0.5)", fontFamily: "system-ui, sans-serif", backdropFilter: "blur(6px)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <i className={`fa-solid ${icono}`} style={{ color, fontSize: 14 }} />
          <span style={{ color: "#eaf2fb", fontSize: 14, fontWeight: 900 }}>{nombre}</span>
        </span>
        {ancho && dato && <span style={{ color, fontSize: 14, fontWeight: 800, fontFamily: "ui-monospace, monospace" }}>{dato}</span>}
      </div>
    </Html>
  );
}

/** En celular caben menos etiquetas sin encimarse: lo que se quita sigue en el panel. */
const OCULTAR_ANGOSTO: Record<ModoEsfera, string[]> = {
  sistema: ["a"], atmosfera: ["m", "r"], hidrosfera: ["n"], litosfera: ["e"], biosfera: [],
};

const sobre = (ll: LonLat, alt: number) => lonLat(ll, R * (1 + alt));
/** Punto en una cara del corte: plano x (eje 0) o z (eje 2); ángulo desde el ecuador. */
const enCara = (eje: 0 | 2, rFrac: number, angGrados: number): THREE.Vector3 => {
  const a = (angGrados * Math.PI) / 180;
  const h = Math.cos(a) * rFrac * R, v = Math.sin(a) * rFrac * R;
  return eje === 0 ? new THREE.Vector3(0.02, v, h) : new THREE.Vector3(h, v, 0.02);
};

/* ── Luz: un Sol y un entorno de Lightformers (sin HDR de internet) ─────── */
function Luces() {
  const p = useMemo(() => SOL.clone().multiplyScalar(12).toArray() as Pt, []);
  return (
    <>
      <ambientLight intensity={0.08} />
      <hemisphereLight args={["#9fb7d8", "#0b0f18", 0.2]} />
      <directionalLight position={p} intensity={3.0} color="#fff6e8" />
      <Environment resolution={128} environmentIntensity={0.7}>
        <Lightformer intensity={2.4} position={p} scale={[6, 6, 1]} color="#fff3dd" />
        <Lightformer intensity={0.5} position={[6, -3, -6]} scale={[10, 6, 1]} color="#6ea8ff" />
        <Lightformer intensity={0.3} position={[0, 8, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} color="#cfe0ff" />
      </Environment>
    </>
  );
}

/* ── El planeta, sus procesos y las etiquetas de la esfera en foco ──────── */
function Planeta(props: SubsistemasSceneProps & { ligero: boolean }) {
  const { co2, veg, volc, permafrost, pausado, ligero } = props;
  const modo = props.modo ?? "sistema";
  const ancho = useThree((st) => st.size.width) >= 640;
  const est = useMemo(() => calcularEstado(co2, veg, volc, permafrost), [co2, veg, volc, permafrost]);
  const corteRef = useRef(R);

  const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
  const meta: MetaTierra = {
    abre: modo === "sistema" || modo === "litosfera" || modo === "atmosfera" ? 1 : 0,
    atmos: modo === "atmosfera" ? 1 : 0,
    hidro: modo === "hidrosfera" ? 1 : 0,
    bio: modo === "biosfera" ? 1 : 0,
    lito: modo === "litosfera" ? 1 : 0,
    veg: veg / 100,
    estres: clamp01(est.deltaT / 3.5),
    acido: clamp01((8.2 - est.ph) / 0.25),
    hieloN: 70 + Math.max(0, est.deltaT) * 4.5,
    hieloS: 61 + Math.max(0, est.deltaT) * 4.5,
    calor: clamp01(est.deltaT / 3.5),
    aerosol: volc / 10,
  };

  // Efecto invernadero: fracción del infrarrojo que la troposfera devuelve.
  const retencion = retencionInfrarrojo(est.co2eff);
  const erosion = clamp01((100 - veg) / 70);
  const evaporacion = clamp01(0.45 + est.deltaT * 0.14);
  const lluvia = clamp01(est.precip / 100);
  const cap = ligero ? 0.5 : 1;

  const termoPos = useMemo(() => IZQ_SISTEMA.clone().multiplyScalar(3.35), []);
  const termoGiro = Math.atan2(DIR_SISTEMA.x, DIR_SISTEMA.z);
  const etiquetas = useMemo(() => {
    const dT = `${est.deltaT >= 0 ? "+" : ""}${est.deltaT.toFixed(1)} °C`;
    switch (modo) {
      case "litosfera": return [
        { k: "c", pos: enCara(0, (R_CORTEZA + 1) / 2, ancho ? 68 : 48), color: "#d8b48e", icono: "fa-layer-group", nombre: "Corteza", dato: "0–35 km", lado: "izq" as const },
        { k: "m", pos: enCara(0, 0.76, 34), color: "#ff8a4c", icono: "fa-arrows-spin", nombre: "Manto: convección", dato: "hasta 2 890 km", lado: "izq" as const },
        { k: "e", pos: enCara(2, (R_NUCLEO_INTERNO + R_NUCLEO_EXTERNO) / 2, 62), color: "#ffb030", icono: "fa-water", nombre: "Núcleo externo (líquido)", dato: "hierro fundido", lado: "der" as const },
        { k: "i", pos: new THREE.Vector3(R * 0.3, 0.02, R * 0.05), color: "#fff1b0", icono: "fa-sun", nombre: "Núcleo interno", dato: "sólido · ~5 400 °C", lado: "der" as const },
      ];
      case "atmosfera": return [
        { k: "t", pos: enCara(2, 1 + ALT_ATMOS.tropo / 2, 84), color: "#6fb8ff", icono: "fa-cloud", nombre: "Troposfera", dato: dT, lado: "izq" as const },
        { k: "e", pos: enCara(2, 1 + (ALT_ATMOS.tropo + ALT_ATMOS.estrato) / 2, ancho ? 61 : 30), color: "#a993ff", icono: "fa-shield-halved", nombre: "Estratosfera · ozono", dato: "absorbe la UV", lado: "der" as const },
        { k: "m", pos: enCara(2, 1 + (ALT_ATMOS.estrato + ALT_ATMOS.meso) / 2, 38), color: "#7d90ff", icono: "fa-meteor", nombre: "Mesosfera", lado: "der" as const },
        { k: "r", pos: enCara(2, 1 + (ALT_ATMOS.meso + ALT_ATMOS.termo) / 2, 15), color: "#c58cf0", icono: "fa-satellite", nombre: "Termosfera", lado: "der" as const },
      ];
      case "hidrosfera": return [
        { k: "v", pos: sobre(LUGAR.golfo, 0.05), color: "#bfe9ff", icono: "fa-arrow-up", nombre: "Evaporación", dato: `${Math.round(evaporacion * 100)} %`, lado: "der" as const },
        { k: "n", pos: sobre(LUGAR.nube, 0.105), color: "#eaf2fb", icono: "fa-cloud", nombre: "Condensación", lado: "centro" as const },
        { k: "l", pos: sobre([-100.6, 19.6], 0.04), color: "#4fb0ff", icono: "fa-cloud-rain", nombre: "Precipitación", dato: `índice ${Math.round(est.precip)}`, lado: "izq" as const },
        ...(ancho ? [{ k: "e", pos: sobre([-97.0, 23.4], 0.006), color: erosion > 0.15 ? "#d39a5c" : "#3d9cf0", icono: "fa-water", nombre: erosion > 0.15 ? "Escurrimiento + erosión" : "Escurrimiento", lado: "der" as const }] : []),
      ];
      case "biosfera": return [
        { k: "s", pos: sobre([-66, -2], 0.16), color: "#34D399", icono: "fa-tree", nombre: "Selva amazónica", dato: `${Math.round(veg)} % de cobertura`, lado: "izq" as const },
        { k: "f", pos: sobre([-57, -7], 0.12), color: "#d8f3ff", icono: "fa-arrow-down", nombre: "Fotosíntesis: fija CO₂", lado: "der" as const },
        ...(veg < 95 ? [{ k: "h", pos: sobre([-60, -9.5], 0.03), color: "#c9a27a", icono: "fa-fire", nombre: "Claros y humo", dato: `${Math.round(100 - veg)} % talado`, lado: "der" as const }] : []),
      ];
      default: return [
        { k: "a", pos: new THREE.Vector3(-0.6, R * 1.2, 0.5), color: "#7cc4ff", icono: "fa-wind", nombre: "Atmósfera", dato: dT, lado: "centro" as const },
        { k: "h", pos: sobre([-38, 8], 0.02), color: "#3aa0ff", icono: "fa-water", nombre: "Hidrosfera", dato: `pH ${est.ph.toFixed(2)}`, lado: "centro" as const },
        { k: "l", pos: enCara(2, 0.72, 40), color: "#ff9a5c", icono: "fa-mountain", nombre: "Litosfera", dato: volc > 0 ? "volcán activo" : "estable", lado: "der" as const },
        { k: "b", pos: sobre([-60, -12], 0.02), color: "#34D399", icono: "fa-leaf", nombre: "Biosfera", dato: `${Math.round(veg)} % cobertura`, lado: "centro" as const },
      ];
    }
  }, [modo, est.deltaT, est.ph, est.precip, evaporacion, erosion, veg, volc, ancho]);

  return (
    <group>
      <TierraCorte radio={R} dirSol={SOL} meta={meta} pausado={pausado} corteRef={corteRef} segmentos={ligero ? 96 : 160} />
      <LimitesPlacas radio={R} fuerza={modo === "litosfera" ? 0.95 : modo === "sistema" ? 0.35 : 0} corteRef={corteRef} />
      <Volcan radio={R} volc={volc} pausado={pausado} cap={Math.round(56 * cap)} cono={modo === "sistema" || modo === "litosfera"} />
      <Metano radio={R} activo={est.puntoNoRetorno} pausado={pausado} cap={Math.round(36 * cap)} />
      <CicloAgua radio={R} evaporacion={evaporacion} lluvia={lluvia} erosion={erosion} pausado={pausado} cap={Math.round(110 * cap)} visible={modo === "hidrosfera"} />
      <FlujoCarbono radio={R} veg={veg / 100} pausado={pausado} cap={Math.round(90 * cap)} visible={modo === "biosfera"} />
      <Invernadero radio={R} retencion={retencion} pausado={pausado} cap={Math.round(40 * cap)} visible={modo === "atmosfera"} />

      {modo === "sistema" && (
        <group position={termoPos} rotation={[0, termoGiro, 0]}>
          <Termometro deltaT={est.deltaT} />
          {ancho && (
            <Etiqueta pos={[0.62, yTermometro(1.5), 0]} color="#ffffff" icono="fa-temperature-half" nombre="+1.5 °C" lado="der" ancho={false} />
          )}
        </group>
      )}

      {etiquetas.filter((e) => ancho || !OCULTAR_ANGOSTO[modo].includes(e.k)).map((e) => (
        <Etiqueta key={`${modo}-${e.k}`} pos={e.pos} color={e.color} icono={e.icono} nombre={e.nombre} dato={e.dato} ancho={ancho} lado={e.lado} />
      ))}
    </group>
  );
}

/* ── Contenido (descendiente del Canvas) ─────────────────────────────────── */
function Contenido(props: SubsistemasSceneProps & { ligero: boolean }) {
  const { autoRotate, resetNonce, ligero } = props;
  const modo = props.modo ?? "sistema";
  const size = useThree((st) => st.size);
  const aspect = size.width / Math.max(1, size.height);
  const [debil, setDebil] = useState(false);
  const toma = useMemo(() => tomaDe(modo, aspect), [modo, aspect]);

  return (
    <>
      <PerformanceMonitor onDecline={() => setDebil(true)} />
      <Luces />
      <ViaLactea brillo={0.7} />

      <Suspense fallback={null}>
        <group key={`${resetNonce}`}>
          <Planeta {...props} />
        </group>
      </Suspense>

      <Guia toma={toma} clave={`${modo}|${toma.distancia.toFixed(2)}|${resetNonce}`} />
      <FueraDelPlaneta />

      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={toma.min}
        maxDistance={24}
        autoRotate={autoRotate}
        autoRotateSpeed={0.4}
      />

      {!ligero && !debil && (
        <EffectComposer enableNormalPass={false} multisampling={4}>
          <Bloom intensity={0.7} luminanceThreshold={0.86} luminanceSmoothing={0.2} mipmapBlur radius={0.7} />
          <Vignette eskil={false} offset={0.26} darkness={0.5} />
        </EffectComposer>
      )}
    </>
  );
}

export default function SubsistemasScene(props: SubsistemasSceneProps) {
  // Celular / táctil: sin postproceso, menos partículas y texturas 2K (el kit ya baja).
  const ligero = useMemo(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia?.("(pointer: coarse)").matches || window.innerWidth < 640;
  }, []);
  return (
    <Canvas dpr={[1, 1.75]} gl={{ antialias: true, alpha: true }}
      camera={{ position: [14, 9, 14], fov: FOV, near: 0.02, far: 5000 }}>
      <Contenido {...props} ligero={ligero} />
    </Canvas>
  );
}
