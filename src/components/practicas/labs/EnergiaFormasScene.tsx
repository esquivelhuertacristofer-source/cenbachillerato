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
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Escenario } from "./_escenario";
import {
  type FormaKey,
  getForma,
  getTransformador,
  calcularBalance,
  E_MAX,
  fmtNum,
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
const COL_H = 2.7; // alto de la columna de conservación con la entrada máxima

/** Extensión horizontal de la cadena (más la columna de la derecha). */
const extension = (nEtapas: number) => {
  const len = (nEtapas + 1) * SEG_W;
  const l = -len / 2 - 0.7;
  const r = len / 2 + 2.4;
  return { cx: (l + r) / 2, w: r - l };
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/* Etiqueta de tamaño fijo en píxeles, desplazada para no encimarse. */
function Etiqueta({ pos, color, desplaza, children }: {
  pos: [number, number, number]; color: string; desplaza: string; children: React.ReactNode;
}) {
  return (
    <Html position={pos} center pointerEvents="none" zIndexRange={[20, 0]}>
      <div style={{ transform: desplaza }}>
        <div style={{ whiteSpace: "nowrap", padding: "3px 9px", borderRadius: 8, background: "rgba(4,10,22,0.88)", border: `1.5px solid ${color}`, color, fontWeight: 900, fontSize: 14, fontFamily: "system-ui, sans-serif", boxShadow: "0 4px 16px rgba(0,0,0,0.5)" }}>
          {children}
        </div>
      </div>
    </Html>
  );
}

/* ════════════════════ CONTENIDO DE LA CADENA ═════════════════════════ */
function Cadena({ transformadorKey, entrada, accent: _accent, pausado }: {
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
  const colH = COL_H * (entrada / E_MAX);

  return (
    <group position={[0, 0, 0]}>
      {/* riel base */}
      <mesh position={[0, TRACK_Y - 0.14, 0]} receiveShadow>
        <boxGeometry args={[trackLen + 0.6, 0.08, 0.7]} />
        <meshStandardMaterial color="#0c2138" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* fuente de entrada */}
      <group position={[startX - 0.1, TRACK_Y, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.34, 28, 28]} />
          <meshStandardMaterial color={formaEntrada.color} emissive={formaEntrada.color} emissiveIntensity={0.5} />
        </mesh>
        <Etiqueta pos={[0, 0.34, 0]} color={formaEntrada.color} desplaza="translate(0,-120%)">
          Entra {fmtNum(balance.entrada)} J
        </Etiqueta>
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
            </mesh>
            {/* anillo de la nueva forma */}
            <mesh position={[0, 0.42, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.3, 0.06, 16, 32]} />
              <meshStandardMaterial color={fa.color} emissive={fa.color} emissiveIntensity={0.5} />
            </mesh>
            <Etiqueta pos={[0, 0.5, 0]} color={fa.color} desplaza="translate(0,-115%)">
              <span style={{ color: fde.color }}>{fde.nombre}</span>
              <span style={{ color: "#9fb2c8", margin: "0 5px" }}>→</span>
              <span style={{ color: fa.color }}>{fa.nombre}</span>
            </Etiqueta>
          </group>
        );
      })}

      {/* salida útil */}
      <group position={[startX + trackLen + 0.1, TRACK_Y, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color={formaFinal.color} emissive={formaFinal.color} emissiveIntensity={0.5} />
        </mesh>
      </group>

      {/* columna de conservación: verde = útil, naranja = calor; juntas miden lo que entró */}
      <group position={[startX + trackLen + 1.5, TRACK_Y - 0.1, 0]}>
        <mesh position={[0, colH * balance.eficienciaGlobal / 2, 0]} castShadow>
          <boxGeometry args={[0.7, Math.max(0.02, colH * balance.eficienciaGlobal), 0.7]} />
          <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={0.35} roughness={0.4} />
        </mesh>
        <mesh position={[0, colH * balance.eficienciaGlobal + (colH * (1 - balance.eficienciaGlobal)) / 2, 0]} castShadow>
          <boxGeometry args={[0.7, Math.max(0.02, colH * (1 - balance.eficienciaGlobal)), 0.7]} />
          <meshStandardMaterial color="#ff7a4a" emissive="#ff7a4a" emissiveIntensity={0.35} roughness={0.4} />
        </mesh>
        <Etiqueta pos={[0, colH + 0.1, 0]} color="#34d399" desplaza="translate(0,-110%)">
          Útil {fmtNum(balance.util)} J · calor {fmtNum(balance.calorTotal)} J
        </Etiqueta>
      </group>

      {/* río de energía */}
      <instancedMesh ref={flowRef} args={[undefined, undefined, FLOW_COUNT]}>
        <sphereGeometry args={[1, 14, 14]} />
        <meshStandardMaterial emissiveIntensity={0.5} metalness={0.1} roughness={0.4}
          emissive={"#ffffff"} vertexColors={false} />
      </instancedMesh>

      {/* penachos de calor */}
      <instancedMesh ref={heatRef} args={[undefined, undefined, Math.max(1, heatCount)]}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshStandardMaterial color={TERMICA_COL} emissive={TERMICA_COL} emissiveIntensity={0.9} transparent opacity={0.8} />
      </instancedMesh>

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
      camera={{ position: [0.8, 3.2, 11], fov: 46 }}
    >
      <Contenido {...props} />
    </Canvas>
  );
}

function Contenido(props: EnergiaFormasSceneProps) {
  const { transformadorKey, entrada, accent, pausado, autoRotate, resetNonce } = props;

  // Encuadre: toda la cadena + la columna, un poco por encima del centro.
  const camera = useThree((st) => st.camera);
  const size = useThree((st) => st.size);
  const aspect = size.width / Math.max(1, size.height);
  const nEt = getTransformador(transformadorKey).etapas.length;
  const ext = extension(nEt);
  const dist = Math.max(7.5, (ext.w / 2 + 0.6) / (0.424 * Math.min(aspect, 1.7)));
  const cx = ext.cx;
  useEffect(() => {
    camera.position.set(cx + 0.4, 2.9 + dist * 0.12, dist);
    camera.lookAt(cx, 1.15, 0);
  }, [camera, cx, dist]);

  return (
    <>
      {/* Suelo, luz de tres puntos y entorno que reflejar. */}
      {/* La altura sale de donde esta escena ya ponía su sombra de
          contacto: es donde su autor decidió que estaba el piso. */}
      <Escenario acento={accent} suelo={TRACK_Y - 0.2} />


      <group key={`${transformadorKey}-${resetNonce}`}>
        <Cadena transformadorKey={transformadorKey} entrada={entrada} accent={accent} pausado={pausado} />
      </group>


      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={5}
        maxDistance={22}
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={Math.PI / 2.05}
        target={[cx, 1.15, 0]}
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
