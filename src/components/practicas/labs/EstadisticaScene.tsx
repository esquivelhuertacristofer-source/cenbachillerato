"use client";

/**
 * Escena 3D del laboratorio de Estadística descriptiva — R3F.
 * Se carga de forma diferida (ssr:false) desde LabEstadistica.tsx.
 *
 * Sobre una RECTA NUMÉRICA se apilan los datos como un "dot plot": cada dato es
 * una esfera colocada sobre su valor; las repeticiones se apilan en columnas.
 * Según el modo:
 *  • "tendencia": se marca la MEDIA (fulcro de una balanza bajo la recta), la
 *    MEDIANA (plano de corte central) y la MODA (columna(s) más alta(s),
 *    resaltadas y coronadas). Un valor atípico inclina la media pero no la
 *    mediana.
 *  • "dispersion": banda MEDIA ± σ (caja translúcida) y soporte de RANGO
 *    [mín, máx] bajo la recta.
 *  • "graficas": se ocultan las columnas sueltas y aparece el HISTOGRAMA:
 *    barras contiguas con la frecuencia de cada intervalo (clase).
 *
 * Patrón R3F: useFrame solo dentro de <Canvas>; las piezas animadas mutan REFS
 * (sin setState ni Math.random en el render).
 */

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Line, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  media as fMedia,
  mediana as fMediana,
  moda as fModa,
  minimo,
  maximo,
  desviacion,
  columnas,
  histograma,
  fmt,
  type Variante,
} from "./estadistica-data";

export interface EstadisticaSceneProps {
  valores: number[];
  accent: string;
  modo: Variante;
  unidad: string;
  dec: number;
  pausado: boolean;
  autoRotate: boolean;
  resetNonce: number;
  /** Visibilidad de cada medida en el modo "tendencia". */
  verMedia: boolean;
  verMediana: boolean;
  verModa: boolean;
}

const ORO = "#ffd24a"; // media
const VERDE = "#34D399"; // mediana
const MAGENTA = "#f0a6ff"; // moda
const AZUL = "#5fb0ff"; // banda σ / rango
const EJE = "#9fb2c8";

// Caja de dibujo en coordenadas de MUNDO (centrada en el origen del Canvas).
const BOARD_W = 13;
const BOARD_H = 7;

/* ── Scratch a nivel de módulo (sin asignar memoria por frame) ─────────── */
const _obj = new THREE.Object3D();
const _col = new THREE.Color();

/* ════════════════════ ESFERAS DEL DOT PLOT (InstancedMesh) ══════════════ */
interface Inst {
  x: number; // valor del dato
  level: number; // nivel en la columna (0 = base)
  esModa: boolean;
}
function DotPlot({ insts, wx, OY, r, stackUnit, accent, pausado }: {
  insts: Inst[]; wx: (x: number) => number; OY: number; r: number; stackUnit: number; accent: string; pausado: boolean;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const reloj = useRef(0);
  const n = insts.length;

  useFrame((_, delta) => {
    const m = ref.current;
    if (!m) return;
    if (!pausado) reloj.current += delta;
    const t = reloj.current;
    for (let i = 0; i < n; i++) {
      const it = insts[i]!;
      const px = wx(it.x);
      // leve "respiración" vertical por columna para dar vida (determinista).
      const bob = pausado ? 0 : Math.sin(t * 1.6 + it.x * 0.7 + it.level * 0.5) * 0.025;
      const py = OY + r + it.level * stackUnit + bob;
      _obj.position.set(px, py, 0);
      _obj.updateMatrix();
      m.setMatrixAt(i, _obj.matrix);
      // Las modas se resaltan en magenta; el resto en el color del área (n pequeño).
      _col.set(it.esModa ? MAGENTA : accent);
      m.setColorAt(i, _col);
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, Math.max(1, n)]} castShadow>
      <sphereGeometry args={[r, 18, 18]} />
      <meshStandardMaterial metalness={0.15} roughness={0.4} toneMapped={false} />
    </instancedMesh>
  );
}

/* ════════════════════ CONTENIDO DEL PLANO ═══════════════════════════════ */
function Plano({ valores, accent, modo, unidad, dec, pausado, verMedia, verMediana, verModa }: {
  valores: number[]; accent: string; modo: Variante; unidad: string; dec: number; pausado: boolean;
  verMedia: boolean; verMediana: boolean; verModa: boolean;
}) {
  const stats = useMemo(() => {
    const md = fModa(valores);
    return {
      media: fMedia(valores),
      mediana: fMediana(valores),
      moda: md,
      min: minimo(valores),
      max: maximo(valores),
      sigma: desviacion(valores),
      cols: columnas(valores),
    };
  }, [valores]);

  // Dominio matemático → mundo (con un margen del 8 % a cada lado).
  const { xMin, xMax } = useMemo(() => {
    const lo = stats.min;
    const hi = stats.max;
    const span = hi - lo || 1;
    return { xMin: lo - span * 0.08, xMax: hi + span * 0.08 };
  }, [stats.min, stats.max]);

  const SX = BOARD_W / (xMax - xMin);
  const OX = -BOARD_W / 2;
  const OY = -BOARD_H / 2;
  const wx = useMemo(() => (x: number) => OX + (x - xMin) * SX, [OX, xMin, SX]);

  // Tamaño de las esferas según la columna más alta (que quepa en el tablero).
  const stackUnit = Math.min(0.5, (BOARD_H * 0.86) / Math.max(1, stats.cols.maxConteo));
  const r = Math.min(0.26, stackUnit / 2.2);

  const modaSet = useMemo(() => new Set(stats.moda.valores), [stats.moda]);

  // Lista de instancias del dot plot.
  const insts = useMemo<Inst[]>(() => {
    const out: Inst[] = [];
    for (const c of stats.cols.cols) {
      for (let k = 0; k < c.conteo; k++) out.push({ x: c.valor, level: k, esModa: verModa && modaSet.has(c.valor) });
    }
    return out;
  }, [stats.cols, modaSet, verModa]);

  // Histograma (modo gráficas).
  const histo = useMemo(() => histograma(valores), [valores]);

  // Marcas del eje X: mín, media, mediana, máx (las relevantes).
  const ticks = useMemo(() => {
    const t: { x: number; label: string; color: string }[] = [];
    t.push({ x: stats.min, label: fmt(stats.min, dec), color: EJE });
    t.push({ x: stats.max, label: fmt(stats.max, dec), color: EJE });
    return t;
  }, [stats.min, stats.max, dec]);

  const w3 = (x: number, y: number, z = 0): [number, number, number] => [wx(x), OY + y, z];
  const topBoard = BOARD_H; // altura útil sobre la base

  return (
    <group position={[0, 0, 0]}>
      {/* tablero de fondo */}
      <mesh position={[0, 0, -0.4]} receiveShadow>
        <planeGeometry args={[BOARD_W + 2.4, BOARD_H + 2.4]} />
        <meshStandardMaterial color="#07182c" metalness={0.05} roughness={0.95} />
      </mesh>

      {/* rejilla horizontal de referencia */}
      {[0.25, 0.5, 0.75].map((f) => (
        <Line key={`gy${f}`} points={[[wx(xMin), OY + topBoard * f, -0.2], [wx(xMax), OY + topBoard * f, -0.2]]} color="#11283f" lineWidth={1} />
      ))}

      {/* ── RECTA NUMÉRICA (eje X) ── */}
      <Line points={[[wx(xMin) - 0.3, OY, 0], [wx(xMax) + 0.5, OY, 0]]} color={EJE} lineWidth={2} />
      <mesh position={[wx(xMax) + 0.6, OY, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.13, 0.34, 16]} />
        <meshStandardMaterial color={EJE} />
      </mesh>
      <Html position={[wx(xMax) + 0.95, OY + 0.05, 0]} center distanceFactor={15} pointerEvents="none">
        <div style={{ color: EJE, fontSize: 11, fontWeight: 900, whiteSpace: "nowrap" }}>{unidad}</div>
      </Html>

      {/* marcas de mín y máx */}
      {ticks.map((tk, i) => (
        <group key={`tk${i}`}>
          <Line points={[[wx(tk.x), OY - 0.14, 0], [wx(tk.x), OY + 0.14, 0]]} color={tk.color} lineWidth={1.4} />
          <Html position={[wx(tk.x), OY - 0.45, 0]} center distanceFactor={16} pointerEvents="none">
            <div style={{ color: tk.color, fontSize: 9.5, fontWeight: 800, whiteSpace: "nowrap" }}>{tk.label}</div>
          </Html>
        </group>
      ))}

      {/* ══ DOT PLOT (tendencia y dispersión) ══ */}
      {modo !== "graficas" && insts.length > 0 && (
        <DotPlot insts={insts} wx={wx} OY={OY} r={r} stackUnit={stackUnit} accent={accent} pausado={pausado} />
      )}

      {/* ══ HISTOGRAMA (gráficas) ══ */}
      {modo === "graficas" && histo.barras.map((b, i) => {
        const x0 = wx(b.x0);
        const x1 = wx(b.x1);
        const ancho = Math.max(0.05, x1 - x0 - 0.06);
        const cx = (x0 + x1) / 2;
        const h = histo.maxConteo > 0 ? (b.conteo / histo.maxConteo) * (BOARD_H * 0.82) : 0;
        return (
          <group key={`hb${i}`}>
            <mesh position={[cx, OY + h / 2, 0]} castShadow>
              <boxGeometry args={[ancho, Math.max(0.001, h), 0.6]} />
              <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.28} metalness={0.2} roughness={0.45} toneMapped={false} transparent opacity={0.92} />
            </mesh>
            {b.conteo > 0 && (
              <Html position={[cx, OY + h + 0.32, 0]} center distanceFactor={15} pointerEvents="none">
                <div style={{ color: "#fff", fontSize: 11, fontWeight: 900, textShadow: "0 2px 8px #000" }}>{b.conteo}</div>
              </Html>
            )}
            <Html position={[cx, OY - 0.78, 0]} center distanceFactor={17} pointerEvents="none">
              <div style={{ color: "#6b8199", fontSize: 8, fontWeight: 700, whiteSpace: "nowrap" }}>{b.etiqueta}</div>
            </Html>
          </group>
        );
      })}

      {/* ══ MEDIANA: plano de corte central ══ */}
      {modo === "tendencia" && verMediana && (
        <>
          <mesh position={[wx(stats.mediana), OY + topBoard / 2, -0.05]}>
            <planeGeometry args={[0.06, topBoard]} />
            <meshBasicMaterial color={VERDE} transparent opacity={0.85} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
          <Html position={[wx(stats.mediana), OY + topBoard + 0.25, 0]} center distanceFactor={14} pointerEvents="none">
            <div style={{ color: VERDE, fontSize: 11, fontWeight: 900, textShadow: "0 2px 8px #000", whiteSpace: "nowrap" }}>
              mediana = {fmt(stats.mediana, dec)}
            </div>
          </Html>
        </>
      )}

      {/* ══ MEDIA: fulcro de balanza bajo la recta ══ */}
      {(modo === "dispersion" || (modo === "tendencia" && verMedia)) && (
        <>
          <Line points={[w3(stats.media, 0.02, 0.04), w3(stats.media, topBoard, 0.04)]} color={ORO} lineWidth={2} dashed dashSize={0.16} gapSize={0.12} />
          {/* triángulo-fulcro */}
          <mesh position={[wx(stats.media), OY - 0.34, 0]}>
            <coneGeometry args={[0.34, 0.6, 4]} />
            <meshStandardMaterial color={ORO} emissive={ORO} emissiveIntensity={0.5} metalness={0.3} roughness={0.4} toneMapped={false} />
          </mesh>
          <Html position={[wx(stats.media), OY + topBoard + (modo === "tendencia" && verMediana ? 0.62 : 0.25), 0]} center distanceFactor={14} pointerEvents="none">
            <div style={{ color: ORO, fontSize: 11, fontWeight: 900, textShadow: "0 2px 8px #000", whiteSpace: "nowrap" }}>
              media = {fmt(stats.media, dec)}
            </div>
          </Html>
        </>
      )}

      {/* ══ MODA: corona sobre la columna más alta ══ */}
      {modo === "tendencia" && verModa && stats.moda.valores.map((mv) => (
        <group key={`moda${mv}`}>
          <mesh position={[wx(mv), OY + stats.moda.frecuencia * stackUnit + 0.45, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.22, 0.4, 14]} />
            <meshStandardMaterial color={MAGENTA} emissive={MAGENTA} emissiveIntensity={0.6} toneMapped={false} />
          </mesh>
          <Html position={[wx(mv), OY + stats.moda.frecuencia * stackUnit + 0.95, 0]} center distanceFactor={15} pointerEvents="none">
            <div style={{ color: MAGENTA, fontSize: 10, fontWeight: 900, textShadow: "0 2px 8px #000", whiteSpace: "nowrap" }}>
              moda = {fmt(mv, dec)}
            </div>
          </Html>
        </group>
      ))}

      {/* ══ DISPERSIÓN: banda media ± σ + soporte de rango ══ */}
      {modo === "dispersion" && (
        <>
          {/* banda media ± σ */}
          <mesh position={[wx(stats.media), OY + topBoard / 2, -0.12]}>
            <planeGeometry args={[Math.max(0.02, (wx(stats.media + stats.sigma) - wx(stats.media - stats.sigma))), topBoard]} />
            <meshBasicMaterial color={AZUL} transparent opacity={0.16} side={THREE.DoubleSide} toneMapped={false} />
          </mesh>
          {[stats.media - stats.sigma, stats.media + stats.sigma].map((xb, i) => (
            <Line key={`sb${i}`} points={[w3(xb, 0.02, 0.02), w3(xb, topBoard, 0.02)]} color={AZUL} lineWidth={1.4} dashed dashSize={0.12} gapSize={0.1} />
          ))}
          <Html position={[wx(stats.media + stats.sigma), OY + topBoard * 0.78, 0]} center distanceFactor={14} pointerEvents="none">
            <div style={{ color: AZUL, fontSize: 10.5, fontWeight: 900, textShadow: "0 2px 8px #000", whiteSpace: "nowrap" }}>
              σ = {fmt(stats.sigma, dec)}
            </div>
          </Html>
          {/* soporte de rango bajo la recta */}
          <Line points={[[wx(stats.min), OY - 0.95, 0], [wx(stats.max), OY - 0.95, 0]]} color={AZUL} lineWidth={2} />
          {[stats.min, stats.max].map((xb, i) => (
            <Line key={`rc${i}`} points={[[wx(xb), OY - 1.12, 0], [wx(xb), OY - 0.78, 0]]} color={AZUL} lineWidth={2} />
          ))}
          <Html position={[(wx(stats.min) + wx(stats.max)) / 2, OY - 1.5, 0]} center distanceFactor={14} pointerEvents="none">
            <div style={{ color: AZUL, fontSize: 10.5, fontWeight: 900, textShadow: "0 2px 8px #000", whiteSpace: "nowrap" }}>
              rango = {fmt(stats.max - stats.min, dec)}
            </div>
          </Html>
        </>
      )}

      <ContactShadows position={[0, OY - 0.42, 0]} opacity={0.28} scale={BOARD_W + 6} blur={2.4} far={6} />
    </group>
  );
}

/* ════════════════════ CANVAS + CONTENIDO ═════════════════════════════════ */
export default function EstadisticaScene(props: EstadisticaSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [0, 1, 16], fov: 46 }}
    >
      <Contenido {...props} />
    </Canvas>
  );
}

function Contenido(props: EstadisticaSceneProps) {
  const { accent, autoRotate, resetNonce } = props;
  return (
    <>
      <color attach="background" args={["#03101f"]} />
      <fog attach="fog" args={["#03101f", 26, 56]} />

      <ambientLight intensity={0.6} />
      <directionalLight
        position={[4, 9, 9]}
        intensity={1.3}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={38}
        shadow-bias={-0.0004}
      />
      <pointLight position={[0, 1, 8]} intensity={2.2} color="#ffffff" />

      <group key={`${resetNonce}`}>
        <Plano
          valores={props.valores}
          accent={accent}
          modo={props.modo}
          unidad={props.unidad}
          dec={props.dec}
          pausado={props.pausado}
          verMedia={props.verMedia}
          verMediana={props.verMediana}
          verModa={props.verModa}
        />
      </group>

      <Environment resolution={256}>
        <Lightformer intensity={1.4} position={[0, 7, 6]} scale={[16, 5, 1]} color="#ffffff" />
        <Lightformer intensity={1.0} position={[-9, 3, 2]} scale={[5, 6, 1]} color={accent} />
        <Lightformer intensity={1.0} position={[9, 2, 4]} scale={[4, 5, 1]} color="#bfe8ff" />
      </Environment>

      <OrbitControls
        enablePan={false}
        minDistance={9}
        maxDistance={24}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.9}
        target={[0, 0, 0]}
        autoRotate={autoRotate}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.5} luminanceThreshold={0.55} luminanceSmoothing={0.3} mipmapBlur radius={0.7} />
        <Vignette eskil={false} offset={0.28} darkness={0.42} />
      </EffectComposer>
    </>
  );
}
