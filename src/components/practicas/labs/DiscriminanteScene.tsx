"use client";

/**
 * Escena 3D — "El discriminante: naturaleza de las raíces" (PM-III-P03-A2).
 *
 * La parábola y = ax² + bx + c flota sobre un plano horizontal que ES el plano
 * complejo de las raíces: el eje X es la parte real y el eje Z la parte
 * imaginaria. Las raíces de ax²+bx+c=0 viven en ese plano (donde y = 0):
 *   Δ > 0  → dos marcas sobre el eje X real (la parábola lo cruza dos veces)
 *   Δ = 0  → una marca en el vértice, tangente al eje X
 *   Δ < 0  → las raíces se DESPEGAN del eje real y suben por el eje imaginario
 *            (parte ± i): la parábola ya no toca el plano.
 * Una recta y = k opcional muestra "¿cuántas veces alcanza la altura k?"
 * (aplicación del cohete). Una chispa recorre el arco (pirotecnia).
 *
 * Patrón R3F obligatorio: el default export sólo monta <Canvas> y delega en
 * <Contenido> (descendiente del Canvas). React Compiler: nada de
 * Math.random()/Date.now()/setState en render; la animación muta REFS dentro de
 * useFrame; la geometría se deriva determinísticamente de a, b, c, k.
 */

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Html, Line } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { calcDiscriminante, calcAltura, CASOS, type Caso } from "./discriminante-data";

export interface DiscriminanteSceneProps {
  a: number;
  b: number;
  c: number;
  k: number;
  accent: string;
  pausado: boolean;
  autoRotate: boolean;
  resetNonce: number;
}

/* ── Caja del "graficador" en mundo 3D ───────────────────────────────────── */
const HW = 5.0;     // semiancho mundo en X
const HH = 3.1;     // semialto mundo en Y
const N_PTS = 120;  // muestras de la curva
const COLOR_CASO: Record<Caso, string> = {
  dos: "#34D399",
  una: "#fbbf24",
  ninguna: "#f87171",
  lineal: "#94a3b8",
};

interface Transform {
  pts: THREE.Vector3[];
  curve: THREE.CatmullRomCurve3;
  wy0: number;        // mundo-y del nivel y=0 (el plano de raíces)
  wyk: number;        // mundo-y de la recta y=k
  wvx: number;        // mundo-x del vértice
  wvy: number;        // mundo-y del vértice
  realRoots: { wx: number; val: number }[];
  complex: { wx: number; wz: number; re: number; im: number } | null;
  alturaXs: { wx: number; val: number }[];
  depthHalf: number;  // semiprofundidad del plano (eje imaginario)
  casoColor: string;
  caso: Caso;
  delta: number;
  esCuad: boolean;
}

function construir(a: number, b: number, c: number, k: number): Transform {
  const calc = calcDiscriminante(a, b, c);
  const altura = calcAltura(a, b, c, k);
  const vx = calc.esCuadratica ? calc.vx : 0;

  // dominio en X centrado en el vértice, asegurando que entren raíces y cruces
  const cand = [vx, 0, ...calc.raices, ...altura.xs];
  let maxDev = 0;
  for (const x of cand) maxDev = Math.max(maxDev, Math.abs(x - vx));
  const half = Math.max(4, maxDev + 1.5);
  const xMin = vx - half;
  const xMax = vx + half;

  // muestreo + rango en Y
  const ys: number[] = [];
  const rawPts: { x: number; y: number }[] = [];
  for (let i = 0; i < N_PTS; i++) {
    const x = xMin + ((xMax - xMin) * i) / (N_PTS - 1);
    const y = a * x * x + b * x + c;
    rawPts.push({ x, y });
    ys.push(y);
  }
  ys.push(0, k, calc.vy);
  let yMin = Math.min(...ys);
  let yMax = Math.max(...ys);
  const pad = Math.max((yMax - yMin) * 0.12, 0.6);
  yMin -= pad;
  yMax += pad;
  const yMid = (yMin + yMax) / 2;
  const yHalf = Math.max((yMax - yMin) / 2, 0.5);

  const WX = (x: number) => ((x - vx) / half) * HW;
  const WY = (y: number) => ((y - yMid) / yHalf) * HH;
  const WZ = (im: number) => (im / half) * HW;

  const pts = rawPts.map((p) => new THREE.Vector3(WX(p.x), WY(p.y), 0));
  const curve = new THREE.CatmullRomCurve3(pts);

  const complex = calc.compleja
    ? { wx: WX(calc.compleja.re), wz: WZ(calc.compleja.im), re: calc.compleja.re, im: calc.compleja.im }
    : null;

  return {
    pts,
    curve,
    wy0: WY(0),
    wyk: WY(k),
    wvx: WX(vx),
    wvy: WY(calc.vy),
    realRoots: calc.raices.map((r) => ({ wx: WX(r), val: r })),
    complex,
    alturaXs: altura.xs.map((x) => ({ wx: WX(x), val: x })),
    depthHalf: Math.max(HW * 0.5, complex ? Math.abs(complex.wz) + 0.7 : 0),
    casoColor: COLOR_CASO[calc.caso],
    caso: calc.caso,
    delta: calc.delta,
    esCuad: calc.esCuadratica,
  };
}

/* ── Etiqueta flotante reutilizable ──────────────────────────────────────── */
function Etiqueta({
  pos,
  color,
  children,
  size = 12.5,
  bg = "rgba(6,16,31,0.78)",
}: {
  pos: [number, number, number];
  color: string;
  children: React.ReactNode;
  size?: number;
  bg?: string;
}) {
  return (
    <Html position={pos} center distanceFactor={11} pointerEvents="none">
      <div
        style={{
          whiteSpace: "nowrap",
          padding: "5px 11px",
          borderRadius: 10,
          background: bg,
          border: `1px solid ${color}66`,
          color: "#fff",
          fontWeight: 700,
          fontSize: size,
          fontFamily: "system-ui, sans-serif",
          boxShadow: "0 8px 28px rgba(0,0,0,0.4)",
        }}
      >
        {children}
      </div>
    </Html>
  );
}

/* ── La gráfica completa ─────────────────────────────────────────────────── */
function Grafica({ a, b, c, k, accent, pausado }: Omit<DiscriminanteSceneProps, "autoRotate" | "resetNonce">) {
  const tf = useMemo(() => construir(a, b, c, k), [a, b, c, k]);
  const chispa = useRef<THREE.Mesh>(null);
  const tRef = useRef(0.12);
  const pulso = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    // chispa que recorre el arco (pirotecnia)
    if (chispa.current) {
      if (!pausado) tRef.current = (tRef.current + delta * 0.13) % 1;
      const p = tf.curve.getPointAt(tRef.current);
      chispa.current.position.copy(p);
    }
    // latido suave de las marcas de raíz
    if (pulso.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 2.4) * 0.12;
      pulso.current.scale.setScalar(s);
    }
  });

  const { wy0, wyk, wvx, wvy, realRoots, complex, alturaXs, depthHalf, casoColor, caso, esCuad } = tf;
  const axisLen = HW + 0.6;
  const casoInfo = caso !== "lineal" ? CASOS[caso] : null;
  const mostrarK = Math.abs(wyk - wy0) > 0.04; // recta y=k distinta del suelo

  return (
    <group>
      {/* Plano de raíces (plano complejo: X real, Z imaginario) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, wy0, 0]} receiveShadow>
        <planeGeometry args={[2 * axisLen, 2 * depthHalf]} />
        <meshStandardMaterial color={accent} transparent opacity={0.05} roughness={1} depthWrite={false} />
      </mesh>

      {/* Eje X real (sobre el plano) */}
      <Line points={[[-axisLen, wy0, 0], [axisLen, wy0, 0]]} color="#dbe7ff" lineWidth={2.4} />
      {/* Eje Z imaginario */}
      <Line
        points={[[0, wy0, -depthHalf], [0, wy0, depthHalf]]}
        color={complex ? "#f87171" : "#7c89a8"}
        lineWidth={complex ? 2.4 : 1.4}
        dashed={!complex}
        dashSize={0.18}
        gapSize={0.12}
      />
      {/* Plomada del vértice al plano de raíces (referencia) */}
      <Line points={[[wvx, wy0, 0], [wvx, wvy, 0]]} color="#5b6a86" lineWidth={1} dashed dashSize={0.14} gapSize={0.1} />

      {/* La parábola */}
      <mesh castShadow>
        <tubeGeometry args={[tf.curve, 140, 0.07, 10, false]} />
        <meshStandardMaterial color={casoColor} emissive={casoColor} emissiveIntensity={0.5} roughness={0.35} metalness={0.1} />
      </mesh>

      {/* Chispa que recorre el arco */}
      <mesh ref={chispa}>
        <sphereGeometry args={[0.12, 14, 14]} />
        <meshStandardMaterial color="#fff7e6" emissive={accent} emissiveIntensity={2.2} toneMapped={false} />
      </mesh>

      {/* Vértice */}
      <mesh position={[wvx, wvy, 0]} castShadow>
        <sphereGeometry args={[0.11, 16, 16]} />
        <meshStandardMaterial color="#cbd5e1" emissive="#cbd5e1" emissiveIntensity={0.4} />
      </mesh>

      {/* Marcas de raíces reales (sobre el eje X) — con latido */}
      <group ref={pulso}>
        {esCuad &&
          realRoots.map((r, i) => (
            <mesh key={`rr${i}`} position={[r.wx, wy0, 0]} castShadow>
              <sphereGeometry args={[0.17, 18, 18]} />
              <meshStandardMaterial color={casoColor} emissive={casoColor} emissiveIntensity={1.1} toneMapped={false} />
            </mesh>
          ))}
        {/* raíz única del caso lineal */}
        {!esCuad &&
          realRoots.map((r, i) => (
            <mesh key={`lr${i}`} position={[r.wx, wy0, 0]} castShadow>
              <sphereGeometry args={[0.16, 18, 18]} />
              <meshStandardMaterial color={casoColor} emissive={casoColor} emissiveIntensity={1} toneMapped={false} />
            </mesh>
          ))}
      </group>

      {/* Raíces complejas: se despegan del eje real por el eje imaginario */}
      {complex && (
        <>
          <Line points={[[0, wy0, -complex.wz], [0, wy0, complex.wz]]} color="#f87171" lineWidth={2} dashed dashSize={0.14} gapSize={0.1} />
          {[complex.wz, -complex.wz].map((z, i) => (
            <mesh key={`cx${i}`} position={[0, wy0, z]} castShadow>
              <sphereGeometry args={[0.16, 18, 18]} />
              <meshStandardMaterial color="#f87171" emissive="#f87171" emissiveIntensity={1.1} toneMapped={false} />
            </mesh>
          ))}
        </>
      )}

      {/* Recta y = k (altura objetivo del cohete) y sus cruces */}
      {mostrarK && (
        <>
          <Line points={[[-axisLen, wyk, 0], [axisLen, wyk, 0]]} color="#fbbf24" lineWidth={1.8} dashed dashSize={0.2} gapSize={0.12} />
          {alturaXs.map((x, i) => (
            <mesh key={`kx${i}`} position={[x.wx, wyk, 0]} castShadow>
              <sphereGeometry args={[0.13, 16, 16]} />
              <meshStandardMaterial color="#fde68a" emissive="#fbbf24" emissiveIntensity={1.2} toneMapped={false} />
            </mesh>
          ))}
          <Etiqueta pos={[axisLen - 0.2, wyk + 0.45, 0]} color="#fbbf24" size={11.5}>
            <i className="fa-solid fa-ruler-horizontal" style={{ color: "#fbbf24", marginRight: 6 }} />
            y = {k}
          </Etiqueta>
        </>
      )}

      {/* Etiqueta del discriminante (héroe) */}
      <Etiqueta pos={[wvx, Math.max(wvy, 0) + HH * 0.55 + 0.6, 0]} color={casoColor} size={15} bg="rgba(6,16,31,0.85)">
        <i className={`fa-solid ${casoInfo?.icono ?? "fa-minus"}`} style={{ color: casoColor, marginRight: 8 }} />
        {esCuad ? (
          <>
            Δ = {tf.delta.toLocaleString("es-MX", { maximumFractionDigits: 2 }).replace("-", "−")}
            <span style={{ color: casoColor, marginLeft: 8, fontWeight: 800 }}>· {casoInfo?.signo}</span>
          </>
        ) : (
          <span style={{ color: casoColor }}>a = 0 · ya no es cuadrática</span>
        )}
      </Etiqueta>

      {/* Etiquetas de raíces reales */}
      {esCuad &&
        realRoots.map((r, i) => (
          <Etiqueta key={`rl${i}`} pos={[r.wx, wy0 - 0.5, 0]} color={casoColor} size={11.5}>
            x{realRoots.length > 1 ? <sub>{i + 1}</sub> : null} = {r.val.toLocaleString("es-MX", { maximumFractionDigits: 2 }).replace("-", "−")}
          </Etiqueta>
        ))}

      {/* Etiquetas de raíces complejas */}
      {complex &&
        [1, -1].map((s, i) => (
          <Etiqueta key={`cl${i}`} pos={[0.1, wy0 + 0.05, s * (complex.wz + 0.55)]} color="#f87171" size={11.5}>
            x{<sub>{i + 1}</sub>} = {complex.re.toLocaleString("es-MX", { maximumFractionDigits: 2 }).replace("-", "−")} {s > 0 ? "+" : "−"} {complex.im.toLocaleString("es-MX", { maximumFractionDigits: 2 })}i
          </Etiqueta>
        ))}
    </group>
  );
}

/* ── Contenido (descendiente del Canvas) ─────────────────────────────────── */
function Contenido({ a, b, c, k, accent, pausado, autoRotate, resetNonce }: DiscriminanteSceneProps) {
  return (
    <>
      <color attach="background" args={["#06101f"]} />
      <fog attach="fog" args={["#06101f", 16, 34]} />

      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 9, 6]} intensity={1.4} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-far={30} />
      <pointLight position={[-6, 4, -4]} intensity={0.5} color={accent} />

      <group key={`${resetNonce}`}>
        <Grafica a={a} b={b} c={c} k={k} accent={accent} pausado={pausado} />
      </group>

      <ContactShadows position={[0, -3.4, 0]} opacity={0.35} scale={18} blur={2.6} far={6} />

      <Environment resolution={128}>
        <group>
          <Lightformer intensity={1.5} position={[0, 6, 2]} scale={9} color="#eaf1ff" />
          <Lightformer intensity={0.8} position={[5, 2, 1]} scale={5} color="#cfe0ff" />
          <Lightformer intensity={0.6} position={[-5, 1, -2]} scale={5} color="#bfa9ff" />
        </group>
      </Environment>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={7}
        maxDistance={26}
        minPolarAngle={Math.PI / 9}
        maxPolarAngle={Math.PI / 1.9}
        target={[0, 0, 0]}
        autoRotate={autoRotate && !pausado}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.6} luminanceThreshold={0.55} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.42} />
      </EffectComposer>
    </>
  );
}

export default function DiscriminanteScene(props: DiscriminanteSceneProps) {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={{ position: [8, 5.5, 9], fov: 45 }}>
      <Contenido {...props} />
    </Canvas>
  );
}
