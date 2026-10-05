"use client";

/**
 * Escena 3D del laboratorio de Notación científica (R3F).
 * Se carga de forma diferida (ssr:false) desde LabNotacionCientifica.tsx.
 *
 * Dibuja una TORRE LOGARÍTMICA vertical: cada decena (10ⁿ) es un peldaño, del
 * átomo (abajo) al Sol (arriba). Un marcador luminoso viaja a la altura
 * log₁₀(a × 10ⁿ); su tamaño crece con la mantisa dentro de cada decena y se
 * reinicia al pasar a la siguiente potencia — así se ve que 1 ≤ a < 10.
 * Todo se calcula en el render desde las props (sin useFrame, sin Math.random)
 * → cumple las reglas del React Compiler.
 */

import { useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Line, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { N_MIN, N_MAX, logPos, REFERENCIAS, fmtA } from "./notacion-data";
import { Escenario } from "./_escenario";

export interface NotacionSceneProps {
  a: number;
  n: number;
  accent: string;
  autoRotate: boolean;
  resetNonce: number;
}

const H = 7.5; // alto de la torre en el mundo 3D
const RANGE = N_MAX - N_MIN;

type P3 = [number, number, number];

const posY = (logv: number) => ((logv - N_MIN) / RANGE) * H - H / 2;

function Chip({ pos, color, borde, children }: { pos: P3; color: string; borde?: string; children: React.ReactNode }) {
  return (
    <Html position={pos} center pointerEvents="none" zIndexRange={[20, 0]}>
      <div
        style={{
          whiteSpace: "nowrap",
          fontWeight: 900,
          fontSize: 15,
          fontFamily: "system-ui, sans-serif",
          color: borde ?? "#fff",
          background: color,
          padding: "3px 9px",
          borderRadius: 8,
          border: `1.5px solid ${borde ?? "rgba(255,255,255,0.4)"}`,
          boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
        }}
      >
        {children}
      </div>
    </Html>
  );
}

function Contenido({ a, n, accent, autoRotate, resetNonce }: NotacionSceneProps) {
  const angosto = useThree((st) => st.size.width) < 640;

  const decenas = useMemo(() => {
    const out: number[] = [];
    for (let i = N_MIN; i <= N_MAX; i++) out.push(i);
    return out;
  }, []);

  const yMark = posY(logPos(a, n));
  // radio del marcador: crece con la mantisa dentro de la decena (1→10) y se
  // reinicia al subir de potencia → muestra que la mantisa va de 1 a (casi) 10.
  const rMark = 0.16 + Math.log10(a) * 0.34;

  // Solo se nombra la referencia MÁS CERCANA al marcador (máx. 4 rótulos a la
  // vez: el marcador, esa referencia y los dos extremos de la torre).
  const cercana = useMemo(() => {
    const lp = logPos(a, n);
    let mejor = REFERENCIAS[0]!;
    for (const r of REFERENCIAS) if (Math.abs(logPos(r.a, r.n) - lp) < Math.abs(logPos(mejor.a, mejor.n) - lp)) mejor = r;
    return mejor;
  }, [a, n]);

  return (
    <>
      <Escenario acento={accent} suelo={-H / 2 - 0.5} />

      <group key={resetNonce}>
        {/* Eje vertical de la torre */}
        <mesh>
          <cylinderGeometry args={[0.05, 0.05, H + 0.6, 16]} />
          <meshStandardMaterial color="#8aa2b6" emissive="#8aa2b6" emissiveIntensity={0.25} />
        </mesh>
        <mesh position={[0, H / 2 + 0.45, 0]}>
          <coneGeometry args={[0.18, 0.4, 20]} />
          <meshStandardMaterial color="#8aa2b6" emissive="#8aa2b6" emissiveIntensity={0.3} />
        </mesh>

        {/* Peldaños 10ⁿ: solo se rotulan los dos extremos y el 10⁰ */}
        {decenas.map((i) => {
          const y = posY(i);
          const mayor = i % 5 === 0 || i === 0;
          const col = i === 0 ? "#cfe0ee" : "#34506a";
          return (
            <group key={i} position={[0, y, 0]}>
              <mesh position={[-0.32, 0, 0]}>
                <boxGeometry args={[mayor ? 0.7 : 0.42, mayor ? 0.06 : 0.045, 0.06]} />
                <meshStandardMaterial color={col} emissive={col} emissiveIntensity={mayor ? 0.4 : 0.2} />
              </mesh>
            </group>
          );
        })}
        <Chip pos={[-1.5, posY(N_MIN), 0]} color="#16263a">10<sup style={{ fontSize: 10 }}>{N_MIN}</sup> m</Chip>
        <Chip pos={[-1.5, posY(N_MAX), 0]} color="#16263a">10<sup style={{ fontSize: 10 }}>{N_MAX}</sup> m</Chip>

        {/* Referencias reales a su altura verdadera (puntos; solo se nombra la cercana) */}
        {REFERENCIAS.map((r) => {
          const y = posY(logPos(r.a, r.n));
          const activo = r.key === cercana.key;
          return (
            <mesh key={r.key} position={[0.5, y, 0]}>
              <sphereGeometry args={[activo ? 0.13 : 0.09, 16, 16]} />
              <meshStandardMaterial color={activo ? accent : "#7f9bb5"} emissive={activo ? accent : "#7f9bb5"} emissiveIntensity={activo ? 0.7 : 0.25} />
            </mesh>
          );
        })}
        <Chip pos={[angosto ? 1.9 : 2.6, posY(logPos(cercana.a, cercana.n)), 0]} color="#0c1a2b" borde={accent}>
          <i className={`fa-solid ${cercana.icono}`} style={{ marginRight: 6 }} />
          {cercana.nombre}
        </Chip>

        {/* Marcador del valor actual */}
        <group position={[0, yMark, 0]}>
          <Line points={[[0, -H / 2 - yMark, 0], [0, 0, 0]]} color={accent} lineWidth={2} transparent opacity={0.4} dashed dashSize={0.18} gapSize={0.14} />
          <mesh castShadow>
            <sphereGeometry args={[rMark, 40, 40]} />
            <meshStandardMaterial color="#ffffff" emissive={accent} emissiveIntensity={0.6} roughness={0.2} metalness={0.35} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[rMark + 0.12, 0.025, 12, 48]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.7} />
          </mesh>
          <Chip pos={[-(rMark + 1.5), 0, 0]} color="#0c1a2b" borde={accent}>
            {fmtA(a)} × 10<sup style={{ fontSize: 10 }}>{n}</sup> m
          </Chip>
        </group>
      </group>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={11}
        maxDistance={24}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.8}
        target={[0, -0.5, 0]}
        autoRotate={autoRotate}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.4} luminanceThreshold={0.75} luminanceSmoothing={0.3} mipmapBlur radius={0.66} />
        <Vignette eskil={false} offset={0.28} darkness={0.42} />
      </EffectComposer>
    </>
  );
}

export default function NotacionScene(props: NotacionSceneProps) {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }} camera={{ position: [4, 1.5, 16.5], fov: 42 }}>
      <Contenido {...props} />
    </Canvas>
  );
}
