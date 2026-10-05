"use client";

/**
 * Escena 3D del laboratorio de Potencias y raíces (R3F).
 * Se carga de forma diferida (ssr:false) desde LabPotencias.tsx.
 *
 * Construye n^e con cubitos unitarios:
 *   - e = 2  →  una capa n×n  (un CUADRADO: el área n²).
 *   - e = 3  →  un bloque n×n×n  (un CUBO: el volumen n³).
 * El número de cubitos ES el valor de la potencia. Si `resaltarLado`, se pinta
 * de otro color la arista de n cubitos: ese lado es la RAÍZ (√n² = n, ∛n³ = n).
 *
 * Todo se calcula en el render a partir de las props (sin useFrame, sin
 * Math.random) → cumple las reglas del React Compiler.
 */

import { useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import type { Exponente } from "./potencias-data";
import { Escenario } from "./_escenario";

export interface PotenciasSceneProps {
  base: number;
  exponente: Exponente;
  resaltarLado: boolean;
  accent: string;
  autoRotate: boolean;
  resetNonce: number;
}

const S = 0.66; // paso entre centros de cubitos
const C = 0.6; // arista del cubito
const LADO = "#FFD166"; // color del lado resaltado (la raíz)

interface Cubo {
  key: string;
  pos: [number, number, number];
  lado: boolean;
}

/** Genera los cubitos de n^e centrados en el origen. */
function construir(n: number, e: Exponente, resaltarLado: boolean): Cubo[] {
  const cubos: Cubo[] = [];
  const kMax = e === 3 ? n : 1; // capas en altura
  const off = (n - 1) / 2;
  const offY = (kMax - 1) / 2;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      for (let k = 0; k < kMax; k++) {
        // el "lado" es la arista frontal-inferior de n cubitos (j al frente, k abajo)
        const lado = resaltarLado && j === n - 1 && k === 0;
        cubos.push({
          key: `${i}-${j}-${k}`,
          pos: [(i - off) * S, (k - offY) * S, (j - off) * S],
          lado,
        });
      }
    }
  }
  return cubos;
}

function Bloque({ base, exponente, resaltarLado, accent }: { base: number; exponente: Exponente; resaltarLado: boolean; accent: string }) {
  const cubos = useMemo(() => construir(base, exponente, resaltarLado), [base, exponente, resaltarLado]);
  return (
    <group>
      {cubos.map((c) => (
        <mesh key={c.key} position={c.pos} castShadow receiveShadow>
          <boxGeometry args={[C, C, C]} />
          {/* Con emisión alta y sin barniz los cubitos se fundían en una
              mancha de color: no se distinguía dónde acaba uno y empieza otro. */}
          <meshPhysicalMaterial
            color={c.lado ? LADO : accent}
            emissive={c.lado ? LADO : accent}
            emissiveIntensity={c.lado ? 0.42 : 0.1}
            roughness={0.3}
            metalness={0.2}
            clearcoat={0.85}
            clearcoatRoughness={0.22}
            envMapIntensity={1.2}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ── Etiqueta: ≥ 14 px, en la punta de lo que nombra ─────────────────────── */
function Etiqueta({ pos, texto, color }: { pos: [number, number, number]; texto: string; color: string }) {
  return (
    <Html position={pos} center pointerEvents="none" zIndexRange={[20, 0]}>
      <div style={{ whiteSpace: "nowrap", padding: "3px 10px", borderRadius: 8, background: "rgba(4,10,22,0.88)", border: `1.5px solid ${color}`, color, fontWeight: 900, fontSize: 15, fontFamily: "system-ui, sans-serif", boxShadow: "0 4px 16px rgba(0,0,0,0.5)" }}>
        {texto}
      </div>
    </Html>
  );
}

const DIR: [number, number, number] = [0.536, 0.435, 0.725]; // dirección de la cámara (unitaria)

/* ── Contenido: el encuadre sigue el tamaño del bloque y la banda libre entre
 *    la barra de arriba (~64 px) y la misión de abajo (~150 px) ────────────── */
function Contenido({ n, props }: { n: number; props: PotenciasSceneProps }) {
  const { width, height } = useThree((st) => st.size);
  const e = props.exponente;
  const offY = e === 3 ? (n - 1) / 2 : 0;
  const frac = Math.min(0.8, Math.max(0.38, (height - 214) / height));
  // Hasta 4 el encuadre es fijo (así se ve crecer el bloque); de 5 en adelante se aleja.
  const V = Math.max(n, 4) * S * 1.6;
  const distV = V / (frac * 0.9) / 0.768;
  const distH = V / ((width / height) * 0.9 * 0.768);
  const dist = Math.min(22, Math.max(6, distV, distH));
  const ty = -(43 / height) * 0.768 * dist;
  const cam: [number, number, number] = [DIR[0] * dist, DIR[1] * dist + ty, DIR[2] * dist];
  const etiquetas = width >= 640;
  const off = (n - 1) / 2;

  return (
    <>
      <PerspectiveCamera makeDefault fov={42} position={cam} />
      {/* Suelo, luz de tres puntos y entorno que reflejar. La altura sale
          de donde esta escena ya ponía su sombra de contacto, que es donde
          su autor decidió que estaba el piso. */}
      <Escenario acento={props.accent} suelo={-offY * S - C * 0.6} />

      <group key={`${n}-${e}-${props.resetNonce}`}>
        <Bloque base={n} exponente={e} resaltarLado={props.resaltarLado} accent={props.accent} />
      </group>

      {etiquetas && (
        <>
          <Etiqueta pos={[0, offY * S + C / 2 + 0.55, 0]} texto={`${n}${e === 2 ? "²" : "³"} = ${e === 2 ? n * n : n * n * n} cubitos`} color={props.accent} />
          {props.resaltarLado && <Etiqueta pos={[0, -offY * S - C / 2 - 0.1, off * S + C / 2 + 0.55]} texto={`lado = ${n}`} color={LADO} />}
        </>
      )}

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={4}
        maxDistance={26}
        minPolarAngle={Math.PI / 7}
        maxPolarAngle={Math.PI / 1.9}
        target={[0, ty, 0]}
        autoRotate={props.autoRotate}
        autoRotateSpeed={0.45}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.42} luminanceThreshold={0.68} luminanceSmoothing={0.3} mipmapBlur radius={0.62} />
        <Vignette eskil={false} offset={0.28} darkness={0.42} />
      </EffectComposer>
    </>
  );
}

export default function PotenciasScene(props: PotenciasSceneProps) {
  const n = useMemo(() => Math.max(1, Math.min(6, Math.round(props.base))), [props.base]);

  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}>
      <Contenido n={n} props={props} />
    </Canvas>
  );
}
