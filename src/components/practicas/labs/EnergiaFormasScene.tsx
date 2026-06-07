"use client";

/**
 * Escena 3D del laboratorio de Formas y transformación de la energía (R3F).
 * Se carga de forma diferida (ssr:false) desde LabEnergiaFormas.tsx.
 *
 * La energía fluye como un río de partículas a lo largo de una cadena de
 * TRANSFORMADORES (de izquierda a derecha). En cada dispositivo el río CAMBIA DE
 * COLOR (cambia de forma de energía) y una parte se escapa hacia arriba como
 * CALOR (energía térmica disipada). El grosor del río representa cuánta energía
 * queda: tras una conversión poco eficiente (un foco: 5%) el río se adelgaza
 * drásticamente y el penacho de calor es enorme. La energía total se conserva.
 *
 * Patrón R3F: useFrame solo dentro de <Canvas>; toda pieza animada vive en un
 * hijo del Canvas y muta REFS (nada de setState ni Math.random en el render).
 */

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Edges, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  type FormaKey,
  getForma,
  getTransformador,
  calcularBalance,
  fmtNum,
  fmtPct,
} from "./energia-formas-data";

export interface EnergiaFormasSceneProps {
  transformadorKey: string;
  entrada: number;
  accent: string;
  pausado: boolean;
  autoRotate: boolean;
  resetNonce: number;
}

const TERMICA_COL = new THREE.Color("#ff7a4a");
const TRACK_Y = 0.38;
const SEG_W = 2.7; // ancho de mundo por segmento
const FLOW_COUNT = 44;
const HEAT_PER_NODE = 12;
const SIZE_MIN = 0.055;
const SIZE_MAX = 0.24;
const RISE = 3.1;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/* ════════════════════ CONTENIDO DE LA CADENA ═════════════════════════ */
function Cadena({ transformadorKey, entrada, accent, pausado }: {
  transformadorKey: string; entrada: number; accent: string; pausado: boolean;
}) {
  const t = useMemo(() => getTransformador(transformadorKey), [transformadorKey]);
  const balance = useMemo(() => calcularBalance(t, entrada), [t, entrada]);

  // Segmentos: uno por etapa (forma de entrada de cada etapa) + uno final (forma útil).
  const segCount = t.etapas.length + 1;
  const trackLen = segCount * SEG_W;
  const startX = -trackLen / 2;

  // Forma, color y fracción de energía de cada segmento.
  const segForms = useMemo<FormaKey[]>(() => {
    const arr: FormaKey[] = [];
    for (let s = 0; s < t.etapas.length; s++) arr.push(t.etapas[s]!.de);
    arr.push(balance.formaFinal);
    return arr;
  }, [t, balance]);

  const segColors = useMemo(() => segForms.map((k) => new THREE.Color(getForma(k).color)), [segForms]);

  const segFrac = useMemo<number[]>(() => {
    const arr: number[] = [1];
    for (let s = 0; s < t.etapas.length; s++) arr.push(balance.etapas[s]!.sale / (entrada || 1));
    return arr; // longitud segCount
  }, [t, balance, entrada]);

  // Nodos de conversión (donde se disipa calor).
  const nodos = useMemo(
    () =>
      t.etapas.map((e, n) => ({
        x: startX + (n + 1) * SEG_W,
        calorFrac: balance.etapas[n]!.calor / (entrada || 1),
        de: e.de,
        a: e.a,
        dispositivo: e.dispositivo,
      })),
    [t, balance, entrada, startX]
  );

  /* ── Río de energía (instanced) ──────────────────────────────────── */
  const flowRef = useRef<THREE.InstancedMesh>(null);
  const flowDummy = useMemo(() => new THREE.Object3D(), []);
  const flowPhase = useRef(0);

  /* ── Penachos de calor (instanced) ───────────────────────────────── */
  const heatRef = useRef<THREE.InstancedMesh>(null);
  const heatDummy = useMemo(() => new THREE.Object3D(), []);
  const heatPhase = useRef(0);
  const heatCount = nodos.length * HEAT_PER_NODE;

  useFrame((_, delta) => {
    const d = pausado ? 0 : delta;
    // río
    flowPhase.current = (flowPhase.current + d * 0.18) % 1;
    const fm = flowRef.current;
    if (fm) {
      for (let i = 0; i < FLOW_COUNT; i++) {
        const ph = (flowPhase.current + i / FLOW_COUNT) % 1;
        const seg = clamp(Math.floor(ph * segCount), 0, segCount - 1);
        const frac = segFrac[seg] ?? 0;
        const size = SIZE_MIN + (SIZE_MAX - SIZE_MIN) * Math.sqrt(Math.max(0, frac));
        const x = startX + ph * trackLen;
        // leve serpenteo vertical/lateral determinista
        const wob = 0.06 * Math.sin(ph * 22 + i);
        flowDummy.position.set(x, TRACK_Y + wob, 0.04 * Math.cos(ph * 17 + i));
        flowDummy.scale.setScalar(size);
        flowDummy.updateMatrix();
        fm.setMatrixAt(i, flowDummy.matrix);
        fm.setColorAt(i, segColors[seg] ?? segColors[0]!);
      }
      fm.instanceMatrix.needsUpdate = true;
      if (fm.instanceColor) fm.instanceColor.needsUpdate = true;
    }

    // calor
    heatPhase.current = (heatPhase.current + d * 0.5) % 1;
    const hm = heatRef.current;
    if (hm) {
      for (let n = 0; n < nodos.length; n++) {
        const nd = nodos[n]!;
        const intensidad = Math.sqrt(Math.max(0, nd.calorFrac)); // 0..1
        for (let l = 0; l < HEAT_PER_NODE; l++) {
          const idx = n * HEAT_PER_NODE + l;
          const ph = (heatPhase.current + l / HEAT_PER_NODE) % 1;
          const y = TRACK_Y + 0.1 + ph * RISE;
          const spread = 0.18 + ph * 0.5;
          const x = nd.x + spread * Math.sin(l * 1.7 + n * 2.1);
          const z = spread * Math.cos(l * 1.3 + n * 1.7);
          // crece al salir, encoge al disiparse; escala por intensidad del calor
          const fade = Math.sin(Math.PI * ph); // 0→1→0
          const size = 0.16 * intensidad * fade;
          heatDummy.position.set(x, y, z);
          heatDummy.scale.setScalar(Math.max(0.0001, size));
          heatDummy.updateMatrix();
          hm.setMatrixAt(idx, heatDummy.matrix);
          hm.setColorAt(idx, TERMICA_COL);
        }
      }
      hm.instanceMatrix.needsUpdate = true;
      if (hm.instanceColor) hm.instanceColor.needsUpdate = true;
    }
  });

  const formaEntrada = getForma(balance.formaEntrada);
  const formaFinal = getForma(balance.formaFinal);

  return (
    <group position={[0, 0, 0]}>
      {/* riel base */}
      <mesh position={[0, TRACK_Y - 0.14, 0]} receiveShadow>
        <boxGeometry args={[trackLen + 0.6, 0.08, 0.7]} />
        <meshStandardMaterial color="#0c2138" metalness={0.3} roughness={0.7} />
        <Edges threshold={15} color="#1d4060" />
      </mesh>

      {/* fuente de entrada */}
      <group position={[startX - 0.1, TRACK_Y, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.34, 28, 28]} />
          <meshStandardMaterial color={formaEntrada.color} emissive={formaEntrada.color} emissiveIntensity={0.7} toneMapped={false} />
        </mesh>
        <Html position={[0, 0.78, 0]} center distanceFactor={13} pointerEvents="none">
          <div style={{ textAlign: "center", whiteSpace: "nowrap" }}>
            <div style={{ color: formaEntrada.color, fontSize: 13, fontWeight: 900, textShadow: "0 2px 8px #000" }}>
              <i className={`fa-solid ${formaEntrada.icono}`} style={{ marginRight: 5 }} />Entrada
            </div>
            <div style={{ color: "#cfe0f2", fontSize: 11, fontWeight: 700 }}>{formaEntrada.nombre} · {fmtNum(balance.entrada)} J</div>
          </div>
        </Html>
      </group>

      {/* dispositivos de conversión */}
      {nodos.map((nd, n) => {
        const fa = getForma(nd.a);
        const fde = getForma(nd.de);
        return (
          <group key={n} position={[nd.x, TRACK_Y, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.36, 0.42, 0.7, 6]} />
              <meshStandardMaterial color="#16344f" metalness={0.5} roughness={0.4} />
              <Edges threshold={15} color={accent} />
            </mesh>
            {/* anillo de la nueva forma */}
            <mesh position={[0, 0.42, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.3, 0.06, 16, 32]} />
              <meshStandardMaterial color={fa.color} emissive={fa.color} emissiveIntensity={0.7} toneMapped={false} />
            </mesh>
            <Html position={[0, 1.02, 0]} center distanceFactor={13} pointerEvents="none">
              <div style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                <div style={{ fontSize: 12.5, fontWeight: 900, textShadow: "0 2px 8px #000" }}>
                  <span style={{ color: fde.color }}>{fde.nombre}</span>
                  <span style={{ color: "#9fb2c8", margin: "0 5px" }}>→</span>
                  <span style={{ color: fa.color }}>{fa.nombre}</span>
                </div>
                <div style={{ color: "#9fb2c8", fontSize: 10.5, fontWeight: 700 }}>{nd.dispositivo}</div>
                <div style={{ color: TERMICA_COL.getStyle(), fontSize: 10.5, fontWeight: 800 }}>
                  <i className="fa-solid fa-fire" style={{ marginRight: 4 }} />{fmtPct(nd.calorFrac)} a calor
                </div>
              </div>
            </Html>
          </group>
        );
      })}

      {/* salida útil */}
      <group position={[startX + trackLen + 0.1, TRACK_Y, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color={formaFinal.color} emissive={formaFinal.color} emissiveIntensity={0.7} toneMapped={false} />
        </mesh>
        <Html position={[0, 0.85, 0]} center distanceFactor={13} pointerEvents="none">
          <div style={{ textAlign: "center", whiteSpace: "nowrap" }}>
            <div style={{ color: formaFinal.color, fontSize: 13, fontWeight: 900, textShadow: "0 2px 8px #000" }}>
              <i className={`fa-solid ${formaFinal.icono}`} style={{ marginRight: 5 }} />Salida útil
            </div>
            <div style={{ color: "#cfe0f2", fontSize: 11, fontWeight: 700 }}>{formaFinal.nombre} · {fmtNum(balance.util)} J</div>
          </div>
        </Html>
      </group>

      {/* río de energía */}
      <instancedMesh ref={flowRef} args={[undefined, undefined, FLOW_COUNT]}>
        <sphereGeometry args={[1, 14, 14]} />
        <meshStandardMaterial emissiveIntensity={0.85} toneMapped={false} metalness={0.1} roughness={0.4}
          emissive={"#ffffff"} vertexColors={false} />
      </instancedMesh>

      {/* penachos de calor */}
      <instancedMesh ref={heatRef} args={[undefined, undefined, Math.max(1, heatCount)]}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshStandardMaterial color={TERMICA_COL} emissive={TERMICA_COL} emissiveIntensity={0.9} transparent opacity={0.8} toneMapped={false} />
      </instancedMesh>

      <ContactShadows position={[0, TRACK_Y - 0.2, 0]} opacity={0.34} scale={trackLen + 4} blur={2.4} far={5} />
    </group>
  );
}

/* ════════════════════ CANVAS + CONTENIDO ═════════════════════════════ */
export default function EnergiaFormasScene(props: EnergiaFormasSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [0.4, 3.2, 9.8], fov: 46 }}
    >
      <Contenido {...props} />
    </Canvas>
  );
}

function Contenido(props: EnergiaFormasSceneProps) {
  const { transformadorKey, entrada, accent, pausado, autoRotate, resetNonce } = props;
  return (
    <>
      <color attach="background" args={["#03101f"]} />
      <fog attach="fog" args={["#03101f", 22, 46]} />

      <ambientLight intensity={0.55} />
      <directionalLight
        position={[4, 10, 6]}
        intensity={1.4}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={32}
        shadow-bias={-0.0004}
      />
      <pointLight position={[0, 5, 4]} intensity={4} color="#ffffff" />

      <group key={`${transformadorKey}-${resetNonce}`}>
        <Cadena transformadorKey={transformadorKey} entrada={entrada} accent={accent} pausado={pausado} />
      </group>

      <Environment resolution={256}>
        <Lightformer intensity={1.5} position={[0, 6, 2]} scale={[14, 4, 1]} color="#ffffff" />
        <Lightformer intensity={1.0} position={[-8, 3, -2]} scale={[5, 6, 1]} color={accent} />
        <Lightformer intensity={1.0} position={[8, 2, 4]} scale={[4, 5, 1]} color="#bfe8ff" />
      </Environment>

      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={18}
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 0.7, 0]}
        autoRotate={autoRotate}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.6} luminanceThreshold={0.55} luminanceSmoothing={0.3} mipmapBlur radius={0.7} />
        <Vignette eskil={false} offset={0.28} darkness={0.42} />
      </EffectComposer>
    </>
  );
}
