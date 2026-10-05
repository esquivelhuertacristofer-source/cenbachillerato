"use client";

/**
 * Escena 3D del laboratorio de Productos notables (R3F).
 * Se carga de forma diferida (ssr:false) desde LabProductos.tsx.
 *
 * Tres modos, todos como descomposición geométrica de una figura:
 *   · "cuadrado"   → (a+b)² = área de un cuadrado de lado (a+b), 4 piezas.
 *   · "cubo"       → (a+b)³ = volumen de un cubo de arista (a+b), 8 piezas.
 *   · "conjugados" → (a+b)(a−b) = a² − b²: un cuadrado a² menos un cuadrado b².
 * El control "separación" (sep ∈ [0,1]) despieza la figura para ver cada término
 * (los rectángulos ab / las losas y columnas son lo que NO está en a² + b²).
 * Todo se recalcula en el render dentro de un useMemo (sin useFrame, sin
 * Math.random) → cumple las reglas del React Compiler.
 */

import { useEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { type Modo, TIPO_POR_UNOS, type TipoPieza } from "./productos-data";
import { Escenario, calidadEscena } from "./_escenario";

export interface ProductosSceneProps {
  modo: Modo;
  a: number;
  b: number;
  sep: number; // separación / despiece, 0..1
  accent: string;
  autoRotate: boolean;
  resetNonce: number;
}

const TEAL = "#5EE6C5";
const AMBER = "#FFD166";
const PINK = "#FF6FA5";
const META = "#9fc0e0";

type P3 = [number, number, number];

interface Pieza {
  key: string;
  pos: P3;
  size: P3;
  color: string;
  emissive: number;
  opacity?: number;
}

interface Etiqueta {
  key: string;
  pos: P3;
  text: string;
  color: string;
  size: number;
}

const COLOR_TIPO = (accent: string): Record<TipoPieza, string> => ({
  a3: accent,
  a2b: TEAL,
  ab2: AMBER,
  b3: PINK,
});

function Contenido({ modo, a, b, sep, accent, autoRotate, resetNonce }: ProductosSceneProps) {
  const ancho = useThree((s) => s.size.width);
  const angosto = ancho < 640;
  const calidad = useMemo(() => calidadEscena(), []);

  const M = useMemo(() => {
    const colorTipo = COLOR_TIPO(accent);
    const piezas: Pieza[] = [];
    const etiquetas: Etiqueta[] = [];

    const EXPLODE = 1.5; // separación máxima en el mundo
    let objetivoZ = 0.9;
    let objetivoY = 0;

    if (modo === "cubo") {
      const side = a + b;
      const half = side / 2;
      // 8 sub-cajas: por cada eje, 0 → segmento a, 1 → segmento b
      for (let ix = 0; ix < 2; ix++) {
        for (let iy = 0; iy < 2; iy++) {
          for (let iz = 0; iz < 2; iz++) {
            const lx = ix ? b : a;
            const ly = iy ? b : a;
            const lz = iz ? b : a;
            const cx = (ix ? a + b / 2 : a / 2) - half;
            const cy = (iy ? a + b / 2 : a / 2) - half;
            const cz = (iz ? a + b / 2 : a / 2) - half;
            // despiece: a-parte hacia −, b-parte hacia +; el conjunto se alza para no hundirse en el piso
            const ox = (ix ? 1 : -1) * sep * EXPLODE;
            const oy = (iy ? 1 : -1) * sep * EXPLODE + sep * EXPLODE;
            const oz = (iz ? 1 : -1) * sep * EXPLODE;
            const unos = ix + iy + iz;
            const tipo = TIPO_POR_UNOS[unos]!;
            piezas.push({
              key: `c${ix}${iy}${iz}`,
              pos: [cx + ox, cy + oy + half, cz + oz],
              size: [lx, ly, lz],
              color: colorTipo[tipo],
              emissive: 0.16,
            });
          }
        }
      }
      objetivoY = half - 0.5;
      objetivoZ = 0;
      etiquetas.push({ key: "lbl", pos: [0, side + sep * EXPLODE * 2 + 0.8, 0], text: "(a + b)³", color: META, size: 17 });
    } else if (modo === "cuadrado") {
      const side = a + b;
      const half = side / 2;
      const TH = 0.28; // grosor de las losetas
      // 4 losetas en el plano XZ: por cada eje X y Z, 0 → a, 1 → b
      for (let ix = 0; ix < 2; ix++) {
        for (let iz = 0; iz < 2; iz++) {
          const lx = ix ? b : a;
          const lz = iz ? b : a;
          const cx = (ix ? a + b / 2 : a / 2) - half;
          const cz = (iz ? a + b / 2 : a / 2) - half;
          const ox = (ix ? 1 : -1) * sep * EXPLODE;
          const oz = (iz ? 1 : -1) * sep * EXPLODE;
          const unos = ix + iz; // 0 → a², 1 → ab, 2 → b²
          const tipo: TipoPieza = unos === 0 ? "a3" : unos === 1 ? "a2b" : "ab2";
          piezas.push({
            key: `q${ix}${iz}`,
            pos: [cx + ox, TH / 2, cz + oz],
            size: [lx, TH, lz],
            color: colorTipo[tipo],
            emissive: 0.18,
          });
          const texto = unos === 0 ? "a²" : unos === 1 ? "ab" : "b²";
          // la etiqueta va SOBRE la pieza; las de piezas pequeñas solo si caben
          if (Math.min(lx, lz) >= 0.9 || sep > 0.25) {
            etiquetas.push({ key: `e${ix}${iz}`, pos: [cx + ox, TH + 0.3, cz + oz], text: texto, color: "#04121f", size: 17 });
          }
        }
      }
      objetivoZ = 0.9;
    } else {
      // conjugados: cuadrado a² menos cuadrado b² → rectángulo (a+b)(a−b)
      const TH = 0.28;
      const ladoCorto = a - b; // a − b
      const halfA = a / 2;
      piezas.push({ key: "a2", pos: [0, TH / 2, 0], size: [a, TH, a], color: accent, emissive: 0.16 });
      // esquina b² que se quita (fantasma rosa, sube y se aleja con sep)
      piezas.push({
        key: "b2",
        pos: [halfA - b / 2, TH / 2 + sep * 1.4, halfA - b / 2 + sep * 1.4],
        size: [b, TH, b],
        color: PINK,
        emissive: 0.25,
        opacity: 0.42 + 0.4 * (1 - sep),
      });
      etiquetas.push({ key: "lblA", pos: [0, TH + 0.4, -halfA - 0.6], text: "a²", color: accent, size: 17 });
      etiquetas.push({ key: "lblB", pos: [halfA - b / 2, TH + 0.6 + sep * 1.4, halfA - b / 2 + sep * 1.4], text: "− b²", color: PINK, size: 16 });

      // rectángulo equivalente (a+b)(a−b), detrás, aparece con sep
      if (ladoCorto > 0.001) {
        const lx = a + b;
        const lz = ladoCorto;
        const offsetZ = a / 2 + ladoCorto / 2 + 1.4;
        piezas.push({
          key: "rect",
          pos: [0, TH / 2, -offsetZ],
          size: [lx, TH, lz],
          color: TEAL,
          emissive: 0.16,
          opacity: 0.35 + 0.6 * sep,
        });
        etiquetas.push({ key: "lblR", pos: [0, TH + 0.4, -offsetZ], text: "(a + b)(a − b)", color: "#04121f", size: 15 });
        objetivoZ = -(ladoCorto + 1.4) / 2 + 0.9;
      }
    }

    return { piezas, etiquetas, objetivoY, objetivoZ };
  }, [modo, a, b, sep, accent]);

  // la figura crece con a + b: se aleja la cámara el mismo factor (ver CamaraAjustada)
  const dist = useMemo(() => 6.5 + (a + b) * (modo === "cubo" ? 2.1 : 1.5), [a, b, modo]);

  return (
    <>
      <Escenario acento={accent} suelo={0} calidad={calidad} />
      <CamaraAjustada dist={dist} />

      <group key={`${resetNonce}`}>
        {M.piezas.map((p) => (
          <mesh key={p.key} position={p.pos} castShadow receiveShadow>
            <boxGeometry args={p.size} />
            <meshStandardMaterial
              color={p.color}
              roughness={0.34}
              metalness={0.12}
              emissive={p.color}
              emissiveIntensity={p.emissive}
              transparent={p.opacity !== undefined}
              opacity={p.opacity ?? 1}
            />
          </mesh>
        ))}

        {/* Etiquetas (máx. 4): tamaño fijo en píxeles; en pantallas angostas solo la imprescindible */}
        {(angosto ? M.etiquetas.slice(0, 2) : M.etiquetas).map((e) => (
          <Html key={e.key} center position={e.pos} pointerEvents="none" zIndexRange={[20, 0]}>
            <div style={{ fontWeight: 900, fontSize: e.size, color: e.color, textShadow: e.color === "#04121f" ? "0 1px 3px rgba(255,255,255,0.35)" : "0 2px 10px rgba(0,0,0,0.95)", whiteSpace: "nowrap", fontFamily: "system-ui, sans-serif" }}>
              {e.text}
            </div>
          </Html>
        ))}
      </group>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={5}
        maxDistance={40}
        minPolarAngle={Math.PI / 9}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, M.objetivoY, M.objetivoZ]}
        autoRotate={autoRotate}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.4} luminanceThreshold={0.7} luminanceSmoothing={0.3} mipmapBlur radius={0.66} />
        <Vignette eskil={false} offset={0.28} darkness={0.42} />
      </EffectComposer>
    </>
  );
}

/** Aleja o acerca la cámara según el tamaño de la figura, conservando la dirección de la vista.
 *  Solo actúa cuando cambia `dist`: mientras el alumno orbita no le quita la vista. */
function CamaraAjustada({ dist }: { dist: number }) {
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    const d = [0.7, 0.75, 1];
    const len = Math.hypot(d[0]!, d[1]!, d[2]!);
    camera.position.set((d[0]! / len) * dist, (d[1]! / len) * dist, (d[2]! / len) * dist);
  }, [camera, dist]);
  return null;
}

export default function ProductosScene(props: ProductosSceneProps) {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }} camera={{ position: [6, 7, 9], fov: 42 }}>
      <Contenido {...props} />
    </Canvas>
  );
}
