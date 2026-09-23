"use client";

/**
 * Escena 3D del laboratorio de Separación de mezclas (React Three Fiber).
 * Se carga de forma diferida (ssr:false) desde LabSeparacionMezclas.tsx.
 *
 * Tres vasos: el central tiene la mezcla (partículas de dos colores). Al ejecutar
 * la separación (progreso 0 → 1) y SI el método es el correcto, las partículas de
 * cada componente viajan a su vaso (izquierda / derecha) por un arco. Si el método
 * no aprovecha la propiedad adecuada, la mezcla se queda revuelta en el centro.
 * Encima del vaso central aparece la herramienta del método elegido.
 */

import * as THREE from "three";
import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import type { MetodoKey } from "./separacion-data";
import { VIDRIO, perfilVaso } from "./_vidrio";
import { Escenario } from "./_escenario";

/* El vaso mide 2,3 de alto y 1,18 de radio en la boca: el perfil respeta esas
 * medidas para que lo que ya estaba colocado alrededor -las particulas, la
 * herramienta del metodo- siga encajando donde estaba. */
const PERFIL_VASO = perfilVaso(1.12, 2.3);

export interface CompVisual {
  key: string;
  nombre: string;
  color: string;
}

export interface SeparacionSceneProps {
  mezclaKey: string;
  comps: [CompVisual, CompVisual];
  funciona: boolean;
  metodoKey: MetodoKey;
  progreso: number; // 0..1
  accent: string;
  autoRotate: boolean;
  resetNonce: number;
}

const N_POR_COMP = 14;
const SRC_X = 0;
const LEFT_X = -3.7;
const RIGHT_X = 3.7;
const GLASS = "#AFC6DA";

const smooth = (x: number) => {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
};

/** Reparte n puntos dentro de un vaso centrado en cx (espiral áurea, apilados). */
function enVaso(cx: number, n: number, radio: number): [number, number, number][] {
  const pts: [number, number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = i * 2.3999632;
    const r = radio * Math.sqrt((i + 0.5) / n);
    pts.push([cx + Math.cos(a) * r, -1.3 + (i % 6) * 0.16, Math.sin(a) * r]);
  }
  return pts;
}

/** Arco (Bézier cuadrática) de la posición origen a la de destino. */
function arco(src: [number, number, number], dst: [number, number, number], t: number): [number, number, number] {
  const cx = (src[0] + dst[0]) / 2;
  const cy = Math.max(src[1], dst[1]) + 2.6;
  const cz = (src[2] + dst[2]) / 2;
  const u = 1 - t;
  return [
    u * u * src[0] + 2 * u * t * cx + t * t * dst[0],
    u * u * src[1] + 2 * u * t * cy + t * t * dst[1],
    u * u * src[2] + 2 * u * t * cz + t * t * dst[2],
  ];
}

interface Particula {
  comp: 0 | 1;
  color: string;
  src: [number, number, number];
  dst: [number, number, number];
}

/* ── Vaso de precipitados (vidrio) ─────────────────────────────────────── */
/**
 * El vaso entero en una pieza torneada.
 *
 * Antes eran tres mallas —pared abierta, un disco de fondo y un toro de
 * borde— con `meshStandardMaterial` y `opacity: 0.16`. Eso no es vidrio: es
 * plástico traslúcido, y el fondo se veía como un disco pegado dentro porque
 * no tenía continuidad con la pared.
 *
 * `perfilVaso` trae la silueta con su pico y su base redondeada, y `VIDRIO`
 * el material físico. Ver `_vidrio.tsx` para el porqué de cada ajuste.
 */
function Vaso({ x }: { x: number }) {
  return (
    <group position={[x, -1.6, 0]}>
      <mesh castShadow>
        <latheGeometry args={[PERFIL_VASO, 56]} />
        <meshPhysicalMaterial {...VIDRIO} />
      </mesh>
    </group>
  );
}

/* ── Herramienta del método (sobre el vaso central) ────────────────────── */
function Herramienta({ metodo }: { metodo: MetodoKey }) {
  if (metodo === "filtracion") {
    return (
      <group position={[0, 1.5, 0]}>
        <mesh rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.95, 1.0, 28, 1, true]} />
          <meshStandardMaterial color="#E7EBF0" transparent opacity={0.55} roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -0.65, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.5, 16]} />
          <meshStandardMaterial color="#E7EBF0" transparent opacity={0.55} roughness={0.6} />
        </mesh>
      </group>
    );
  }
  if (metodo === "imantacion") {
    return (
      <group position={[0, 1.9, 0]}>
        {/* imán de barra: mitad roja (N) y mitad gris (S) */}
        <mesh position={[-0.5, 0, 0]}>
          <boxGeometry args={[1.0, 0.42, 0.42]} />
          <meshStandardMaterial color="#E0483C" roughness={0.4} metalness={0.5} />
        </mesh>
        <mesh position={[0.5, 0, 0]}>
          <boxGeometry args={[1.0, 0.42, 0.42]} />
          <meshStandardMaterial color="#B8BFC8" roughness={0.4} metalness={0.7} />
        </mesh>
      </group>
    );
  }
  if (metodo === "destilacion") {
    return (
      <group position={[0, 1.85, 0]}>
        {/* matraz */}
        <mesh>
          <sphereGeometry args={[0.55, 24, 24]} />
          <meshStandardMaterial color={GLASS} transparent opacity={0.22} roughness={0.05} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        {/* cuello / condensador hacia la derecha */}
        <mesh position={[0.7, 0.1, 0]} rotation={[0, 0, -0.5]}>
          <cylinderGeometry args={[0.1, 0.1, 1.1, 16]} />
          <meshStandardMaterial color={GLASS} transparent opacity={0.3} roughness={0.1} />
        </mesh>
        {/* flama */}
        <mesh position={[0, -0.85, 0]}>
          <coneGeometry args={[0.22, 0.55, 16]} />
          <meshStandardMaterial color="#FF8A3C" emissive="#FF6A1A" emissiveIntensity={1.4} toneMapped={false} />
        </mesh>
      </group>
    );
  }
  // decantación: embudo de separación (pera + llave)
  return (
    <group position={[0, 1.95, 0]}>
      <mesh>
        <sphereGeometry args={[0.6, 24, 24]} />
        <meshStandardMaterial color={GLASS} transparent opacity={0.22} roughness={0.05} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[0, -0.7, 0]}>
        <coneGeometry args={[0.6, 0.6, 24, 1, true]} />
        <meshStandardMaterial color={GLASS} transparent opacity={0.22} roughness={0.05} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[0, -1.05, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.4, 16]} />
        <meshStandardMaterial color={GLASS} transparent opacity={0.35} roughness={0.1} />
      </mesh>
      {/* llave */}
      <mesh position={[0, -1.05, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.32, 12]} />
        <meshStandardMaterial color="#E0483C" roughness={0.4} metalness={0.4} />
      </mesh>
    </group>
  );
}

/* ── Conjunto de partículas ────────────────────────────────────────────── */
function Particulas({ particulas, funciona, progreso }: { particulas: Particula[]; funciona: boolean; progreso: number }) {
  const t = smooth(progreso);
  return (
    <>
      {particulas.map((p, i) => {
        const pos = funciona ? arco(p.src, p.dst, t) : p.src;
        return (
          <mesh key={i} position={pos} castShadow>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color={p.color} emissive={p.color} emissiveIntensity={0.18} roughness={0.35} metalness={0.15} />
          </mesh>
        );
      })}
    </>
  );
}

/* ── Escena completa ───────────────────────────────────────────────────── */
export default function SeparacionMezclasScene(props: SeparacionSceneProps) {
  const particulas = useMemo<Particula[]>(() => {
    const total = N_POR_COMP * 2;
    const src = enVaso(SRC_X, total, 0.82);
    const dstL = enVaso(LEFT_X, N_POR_COMP, 0.8);
    const dstR = enVaso(RIGHT_X, N_POR_COMP, 0.8);
    const out: Particula[] = [];
    let li = 0;
    let ri = 0;
    for (let i = 0; i < total; i++) {
      const comp: 0 | 1 = i % 2 === 0 ? 0 : 1;
      const dst = comp === 0 ? dstL[li++]! : dstR[ri++]!;
      out.push({ comp, color: props.comps[comp].color, src: src[i]!, dst });
    }
    return out;
  }, [props.comps]);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [0, 1.4, 11.5], fov: 44 }}
    >
      {/* Suelo, luz de tres puntos y entorno que reflejar. La altura sale
          de donde esta escena ya ponía su sombra de contacto, que es donde
          su autor decidió que estaba el piso. */}
      <Escenario acento={props.accent} suelo={-1.75} />


      <group key={`${props.mezclaKey}-${props.metodoKey}-${props.resetNonce}`}>
        <Vaso x={LEFT_X} />
        <Vaso x={SRC_X} />
        <Vaso x={RIGHT_X} />
        <Herramienta metodo={props.metodoKey} />
        <Particulas particulas={particulas} funciona={props.funciona} progreso={props.progreso} />
      </group>


      <OrbitControls
        enablePan={false}
        minDistance={7}
        maxDistance={20}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.9}
        target={[0, -0.2, 0]}
        autoRotate={props.autoRotate}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.4} luminanceThreshold={0.7} luminanceSmoothing={0.3} mipmapBlur radius={0.65} />
        <Vignette eskil={false} offset={0.28} darkness={0.42} />
      </EffectComposer>
    </Canvas>
  );
}
