"use client";

/**
 * Escena 3D del laboratorio de Factorización — modelo de área (R3F).
 * Se carga de forma diferida (ssr:false) desde LabFactorizacion.tsx.
 *
 * Un trinomio x² + bx + c se construye con "algebra tiles" que tapizan un
 * rectángulo de lados (x + p) y (x + q):
 *   · 1 pieza x²  (cuadrado x·x)            → color de acento
 *   · (p + q) piezas x  (rectángulos x·1)   → color teal
 *   · p·q piezas 1  (cuadraditos 1·1)       → color ámbar
 * Los dos lados del rectángulo SON los factores.
 *
 * Modo «armar» (`objetivo`): el trinomio pide exactamente b piezas x y c unidades.
 * Las que el rectángulo no usa se quedan en un montón a la derecha (SOBRAN) y las
 * que el rectángulo necesitaría y no hay se dibujan en rojo translúcido (FALTAN).
 * Cuando no sobra ni falta ninguna, el contorno se pone verde.
 *
 * Todo se recalcula en el render dentro de un useMemo (sin useFrame, sin
 * Math.random) → cumple el React Compiler.
 */

import { useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Line, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { XLEN, desarrolla } from "./factorizacion-data";
import { CurvaTubo } from "./_tablero";
import { Escenario, calidadEscena } from "./_escenario";

export interface FactorizacionSceneProps {
  p: number;
  q: number;
  accent: string;
  autoRotate: boolean;
  resetNonce: number;
  /** Trinomio pedido (modo armar). Sin él, el rectángulo se explora libremente. */
  objetivo?: { b: number; c: number } | null;
}

const TARGET = 6.0; // tamaño objetivo del lado mayor en el mundo
const TEAL = "#5EE6C5";
const AMBER = "#FFD166";
const FALTA = "#FF6B6B";
const VERDE = "#34D399";
const GAP = 0.07; // separación entre piezas (en unidades de pieza)
const COLS_U = 4; // columnas del montón de unidades sobrantes

type P3 = [number, number, number];

interface Tile {
  key: string;
  pos: P3; // centro en el mundo
  size: P3; // [ancho X, alto Y, fondo Z]
  color: string;
  falta?: boolean;
}

function Contenido({ p, q, accent, autoRotate, resetNonce, objetivo }: FactorizacionSceneProps) {
  const ancho = useThree((s) => s.size.width);
  const angosto = ancho < 640;
  const calidad = useMemo(() => calidadEscena(), []);

  const M = useMemo(() => {
    const W = XLEN + p; // ancho del rectángulo = x + p
    const H = XLEN + q; // alto (fondo) del rectángulo = x + q

    const sobranX = objetivo ? Math.max(0, objetivo.b - (p + q)) : 0;
    const sobranU = objetivo ? Math.max(0, objetivo.c - p * q) : 0;
    const colsU = Math.min(sobranU, COLS_U);
    const filasU = Math.ceil(sobranU / COLS_U);
    const pileX0 = W + 1.2;
    const pileW = Math.max(sobranX, colsU);
    const zU0 = XLEN + 0.9;
    // caja total (rectángulo + montón) para escalar y centrar
    const Wtot = pileW > 0 ? pileX0 + pileW : W;
    const Htot = Math.max(H, sobranU > 0 ? zU0 + filasU : sobranX > 0 ? XLEN : 0);
    const s = TARGET / Math.max(Wtot, Htot);
    const cx = Wtot / 2;
    const cz = Htot / 2;

    // Convierte un rect en coords de pieza [x0,x1]×[z0,z1] a un Tile centrado y escalado.
    const tile = (key: string, x0: number, x1: number, z0: number, z1: number, color: string, th: number, falta = false): Tile => {
      const mx = (x0 + x1) / 2;
      const mz = (z0 + z1) / 2;
      return {
        key,
        pos: [(mx - cx) * s, th / 2, (mz - cz) * s],
        size: [((x1 - x0) - GAP) * s, th, ((z1 - z0) - GAP) * s],
        color: falta ? FALTA : color,
        falta,
      };
    };

    const bPool = objetivo ? objetivo.b : Infinity;
    const cPool = objetivo ? objetivo.c : Infinity;

    const tiles: Tile[] = [];
    // 1) pieza x²
    tiles.push(tile("x2", 0, XLEN, 0, XLEN, accent, 0.22));
    // 2) p piezas x (columnas a la derecha del x²) y 3) q piezas x (filas arriba)
    for (let i = 0; i < p; i++) tiles.push(tile(`xp${i}`, XLEN + i, XLEN + i + 1, 0, XLEN, TEAL, 0.15, i >= bPool));
    for (let j = 0; j < q; j++) tiles.push(tile(`xq${j}`, 0, XLEN, XLEN + j, XLEN + j + 1, TEAL, 0.15, p + j >= bPool));
    // 4) p·q piezas 1 (esquina)
    for (let i = 0; i < p; i++)
      for (let j = 0; j < q; j++) tiles.push(tile(`u${i}-${j}`, XLEN + i, XLEN + i + 1, XLEN + j, XLEN + j + 1, AMBER, 0.09, i * q + j >= cPool));

    // Montón de piezas que sobran (todavía sin colocar).
    for (let i = 0; i < sobranX; i++) tiles.push(tile(`sx${i}`, pileX0 + i, pileX0 + i + 1, 0, XLEN, TEAL, 0.15));
    for (let k = 0; k < sobranU; k++) {
      const col = k % COLS_U;
      const fila = Math.floor(k / COLS_U);
      tiles.push(tile(`su${k}`, pileX0 + col, pileX0 + col + 1, zU0 + fila, zU0 + fila + 1, AMBER, 0.09));
    }

    // Contorno del rectángulo completo (en el piso).
    const outline: P3[] = [
      [(0 - cx) * s, 0.012, (0 - cz) * s],
      [(W - cx) * s, 0.012, (0 - cz) * s],
      [(W - cx) * s, 0.012, (H - cz) * s],
      [(0 - cx) * s, 0.012, (H - cz) * s],
      [(0 - cx) * s, 0.012, (0 - cz) * s],
    ];

    // Guías de los lados (los factores): el ancho al frente, el alto a la izquierda.
    const zEdge = (H - cz) * s + 0.5;
    const xEdge = (0 - cx) * s - 0.5;
    const ladoAncho: P3[] = [[(0 - cx) * s, 0.03, zEdge], [(W - cx) * s, 0.03, zEdge]];
    const ladoAlto: P3[] = [[xEdge, 0.03, (0 - cz) * s], [xEdge, 0.03, (H - cz) * s]];

    const completo = !!objetivo && sobranX === 0 && sobranU === 0 && p + q === objetivo.b && p * q === objetivo.c;

    return {
      tiles,
      outline,
      ladoAncho,
      ladoAlto,
      completo,
      sobranX,
      sobranU,
      labAncho: [((W / 2) - cx) * s, 0.05, zEdge + 0.45] as P3,
      labAlto: [xEdge - 0.55, 0.05, ((H / 2) - cz) * s] as P3,
      labX2: [(XLEN / 2 - cx) * s, 0.3, (XLEN / 2 - cz) * s] as P3,
      labArea: [0, 0.05, (0 - cz) * s - 0.6] as P3,
    };
  }, [p, q, accent, objetivo]);

  const { b, c } = desarrolla(p, q);
  const esCuadrado = p === q;
  const lblStyle = { fontWeight: 900, fontFamily: "system-ui, sans-serif", whiteSpace: "nowrap" as const, textShadow: "0 2px 10px rgba(0,0,0,0.95)" };

  let textoArea: string;
  if (objetivo) {
    if (M.completo) textoArea = "¡No sobra ni falta nada!";
    else {
      const dx = (p + q) - objetivo.b;
      const du = p * q - objetivo.c;
      textoArea = `x: ${dx === 0 ? "justas" : dx > 0 ? `faltan ${dx}` : `sobran ${-dx}`} · 1: ${du === 0 ? "justas" : du > 0 ? `faltan ${du}` : `sobran ${-du}`}`;
    }
  } else {
    textoArea = `Área = x² + ${b}x + ${c}${esCuadrado ? " · ¡cuadrado!" : ""}`;
  }

  return (
    <>
      <Escenario acento={accent} suelo={0} calidad={calidad} />

      <group key={`${resetNonce}`}>
        {/* Piezas (algebra tiles) */}
        {M.tiles.map((t) => (
          <mesh key={t.key} position={t.pos} castShadow receiveShadow>
            <boxGeometry args={t.size} />
            <meshStandardMaterial
              color={t.color}
              roughness={0.34}
              metalness={0.12}
              emissive={t.color}
              emissiveIntensity={t.falta ? 0.3 : 0.14}
              transparent={t.falta}
              opacity={t.falta ? 0.45 : 1}
            />
          </mesh>
        ))}

        {/* Contorno del rectángulo y guías de los lados */}
        <Line points={M.outline} color={M.completo ? VERDE : "#eaf4ff"} lineWidth={2} transparent opacity={M.completo ? 0.95 : 0.5} />
        <CurvaTubo puntos={M.ladoAncho} color={accent} grosor={0.063} />
        <CurvaTubo puntos={M.ladoAlto} color={TEAL} grosor={0.063} />

        {/* Etiquetas (máximo 4): lados, pieza x² y área / estado */}
        <Html center position={M.labAncho} pointerEvents="none" zIndexRange={[20, 0]}>
          <div style={{ ...lblStyle, fontSize: 16, color: accent }}>x + {p}</div>
        </Html>
        <Html center position={M.labAlto} pointerEvents="none" zIndexRange={[20, 0]}>
          <div style={{ ...lblStyle, fontSize: 16, color: TEAL }}>x + {q}</div>
        </Html>
        <Html center position={M.labX2} pointerEvents="none" zIndexRange={[20, 0]}>
          <div style={{ ...lblStyle, fontSize: 17, color: "#03101f", textShadow: "0 1px 4px rgba(255,255,255,0.4)" }}>x²</div>
        </Html>
        {!angosto && (
          <Html center position={M.labArea} pointerEvents="none" zIndexRange={[20, 0]}>
            <div style={{ ...lblStyle, fontSize: 15, color: M.completo ? VERDE : "#eaf4ff", background: "rgba(2,12,28,0.78)", padding: "4px 11px", borderRadius: 8 }}>
              {textoArea}
            </div>
          </Html>
        )}
      </group>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={7}
        maxDistance={22}
        minPolarAngle={Math.PI / 9}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 0, 1.0]}
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

export default function FactorizacionScene(props: FactorizacionSceneProps) {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }} camera={{ position: [3.4, 8.2, 8.6], fov: 42 }}>
      <Contenido {...props} />
    </Canvas>
  );
}
