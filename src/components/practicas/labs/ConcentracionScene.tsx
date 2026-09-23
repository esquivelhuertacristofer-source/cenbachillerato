"use client";

/**
 * Escena 3D del laboratorio de Concentración de una disolución (R3F).
 * Se carga de forma diferida (ssr:false) desde LabConcentracion.tsx.
 *
 * Un vaso de precipitados con disolvente (agua) hasta cierto nivel. El soluto
 * disuelto se ve como partículas suspendidas y como TINTE del líquido: a mayor
 * concentración, más partículas y color más intenso. Si se agrega más soluto
 * del que el agua admite, el excedente NO se disuelve y cae al fondo como
 * cristales (disolución SATURADA).
 *
 * Todo se calcula en el render a partir de las props (sin useFrame, sin
 * Math.random) → cumple las reglas del React Compiler. Las posiciones
 * "aleatorias" usan un hash determinista (prand).
 */

import { useMemo } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { VIDRIO_FINO, perfilVaso, perfilLiquido } from "./_vidrio";
import { Escenario } from "./_escenario";

export interface ConcentracionSceneProps {
  /** Nivel del líquido (0..1) según el agua agregada. */
  nivel: number;
  /** Color del soluto / tinte de la disolución. */
  solutoColor: string;
  /** Intensidad de la concentración (0..1): tinte y densidad de partículas. */
  intensidad: number;
  /** ¿La disolución está saturada? (hay cristales sin disolver) */
  saturada: boolean;
  /** Fracción de excedente (0..1): tamaño del montón de cristales. */
  excedenteFrac: number;
  accent: string;
  autoRotate: boolean;
  resetNonce: number;
}

const TAU = Math.PI * 2;
const VASO_R = 1.5; // radio interior del vaso
const VASO_H = 3.2; // altura del vaso
const FONDO_Y = -VASO_H / 2; // y del fondo interior

/** Hash determinista en [0,1) — evita Math.random en el render. */
function prand(i: number, salt: number): number {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Vaso de precipitados, en una sola pieza torneada con su pico y su base.
 *
 * Eran tres mallas sueltas —pared abierta, disco de base, toro de borde— y la
 * pared llevaba `transmission: 0.9` Y `opacity: 0.16` a la vez, que se anulan
 * (ver `_vidrio.tsx`).
 *
 * AQUÍ EL VIDRIO ES `VIDRIO_FINO` A PROPÓSITO, no por ahorrar. Este vaso tiene
 * dentro una disolución teñida con partículas de soluto suspendidas, y a
 * través de un material con `transmission` sólo se ve lo OPACO: con el vidrio
 * bueno, el líquido desaparecería y las partículas quedarían flotando en el
 * aire. Lo que el alumno vino a mirar es la disolución, así que manda ella.
 */
const PERFIL_VASO = perfilVaso(VASO_R, VASO_H);
/** Alto total del perfil, para traducir alturas de liquido a fracciones. */
const ALTO_PERFIL = Math.max(...PERFIL_VASO.map((p) => p.y));

function Vaso() {
  return (
    /* El perfil arranca en la base; el vaso estaba centrado en el origen. */
    <group position={[0, FONDO_Y, 0]}>
      <mesh castShadow receiveShadow>
        <latheGeometry args={[PERFIL_VASO, 56]} />
        <meshPhysicalMaterial {...VIDRIO_FINO} />
      </mesh>
    </group>
  );
}

/** Líquido teñido + partículas de soluto disueltas. */
function Liquido({ nivel, solutoColor, intensidad }: { nivel: number; solutoColor: string; intensidad: number }) {
  const H = Math.max(0.25, nivel * (VASO_H - 0.3)); // altura del líquido

  /* El perfil del vaso cortado a la altura del líquido. `perfilLiquido` pide
   * la fracción del perfil, no una altura: el líquido llega a 0,06 + H
   * contando desde la base, y el perfil entero mide `ALTO_PERFIL`. */
  const perfilNivel = useMemo(
    () => perfilLiquido(PERFIL_VASO, (0.06 + H) / ALTO_PERFIL, 0.05),
    [H],
  );

  // color: del agua casi clara al color del soluto, según la intensidad
  const color = useMemo(() => {
    const base = new THREE.Color("#bfe8ff");
    return base.lerp(new THREE.Color(solutoColor), Math.min(1, 0.15 + intensidad * 0.85));
  }, [solutoColor, intensidad]);

  // partículas disueltas suspendidas
  const particulas = useMemo(() => {
    const n = Math.round(6 + Math.min(1, intensidad) * 48);
    const arr: { key: number; pos: [number, number, number]; s: number }[] = [];
    for (let i = 0; i < n; i++) {
      const ang = prand(i, 1) * TAU;
      const r = Math.sqrt(prand(i, 2)) * (VASO_R - 0.22);
      const y = FONDO_Y + 0.14 + prand(i, 3) * (H - 0.18);
      const s = 0.05 + prand(i, 4) * 0.05;
      arr.push({ key: i, pos: [Math.cos(ang) * r, y, Math.sin(ang) * r], s });
    }
    return arr;
  }, [intensidad, H]);

  return (
    <group>
      {/* Volumen del líquido, con la FORMA DEL VASO y no un cilindro metido
          dentro: se corta el mismo perfil a la altura que toca. Es lo que
          delata a un vaso de precipitados de maqueta, porque el líquido
          verdadero se apoya en la base redondeada.
          Sigue siendo translúcido —sin `transmission`— para que se vean las
          partículas de soluto suspendidas. */}
      <mesh position={[0, FONDO_Y, 0]}>
        <latheGeometry args={[perfilNivel, 56]} />
        <meshPhysicalMaterial color={color} transparent opacity={0.62} roughness={0.18} ior={1.33} />
      </mesh>
      {/* El menisco NO lleva disco propio: `perfilLiquido` ya cierra el torno
          por arriba, y el disco peleaba en profundidad con esa tapa — salia un
          abanico de rayas que giraba con la camara. */}
      {/* partículas de soluto disuelto */}
      {particulas.map((p) => (
        <mesh key={p.key} position={p.pos}>
          <sphereGeometry args={[p.s, 10, 10]} />
          <meshStandardMaterial color={solutoColor} emissive={solutoColor} emissiveIntensity={0.45} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

/** Cristales sin disolver al fondo (cuando la disolución está saturada). */
function Cristales({ excedenteFrac, solutoColor }: { excedenteFrac: number; solutoColor: string }) {
  const cristales = useMemo(() => {
    const n = Math.round(Math.min(1, excedenteFrac) * 26);
    const arr: { key: number; pos: [number, number, number]; s: number; rot: [number, number, number] }[] = [];
    for (let i = 0; i < n; i++) {
      const ang = prand(i, 5) * TAU;
      const r = Math.sqrt(prand(i, 6)) * (VASO_R - 0.3);
      const y = FONDO_Y + 0.12 + prand(i, 7) * 0.22;
      const s = 0.09 + prand(i, 8) * 0.07;
      arr.push({
        key: i,
        pos: [Math.cos(ang) * r, y, Math.sin(ang) * r],
        s,
        rot: [prand(i, 9) * TAU, prand(i, 10) * TAU, prand(i, 11) * TAU],
      });
    }
    return arr;
  }, [excedenteFrac]);

  return (
    <group>
      {cristales.map((c) => (
        <mesh key={c.key} position={c.pos} rotation={c.rot} castShadow>
          <boxGeometry args={[c.s, c.s, c.s]} />
          <meshStandardMaterial color={solutoColor} emissive={solutoColor} emissiveIntensity={0.3} roughness={0.55} metalness={0.15} />
        </mesh>
      ))}
    </group>
  );
}

export default function ConcentracionScene(props: ConcentracionSceneProps) {
  const nivel = Math.max(0, Math.min(1, props.nivel));
  const intensidad = Math.max(0, Math.min(1, props.intensidad));
  const excedenteFrac = Math.max(0, Math.min(1, props.excedenteFrac));

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [0, 1.9, 7.4], fov: 42 }}
    >
      {/* Suelo, luz de tres puntos y entorno que reflejar. La altura sale
          de donde esta escena ya ponía su sombra de contacto, que es donde
          su autor decidió que estaba el piso. */}
      <Escenario acento={props.accent} suelo={FONDO_Y - 0.08} />


      <group key={props.resetNonce}>
        <Vaso />
        <Liquido nivel={nivel} solutoColor={props.solutoColor} intensidad={intensidad} />
        {props.saturada && <Cristales excedenteFrac={excedenteFrac} solutoColor={props.solutoColor} />}
      </group>


      <OrbitControls
        enablePan={false}
        minDistance={4.5}
        maxDistance={20}
        minPolarAngle={Math.PI / 7}
        maxPolarAngle={Math.PI / 1.95}
        target={[0, 0, 0]}
        autoRotate={props.autoRotate}
        autoRotateSpeed={0.45}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.4} luminanceThreshold={0.7} luminanceSmoothing={0.3} mipmapBlur radius={0.6} />
        <Vignette eskil={false} offset={0.28} darkness={0.42} />
      </EffectComposer>
    </Canvas>
  );
}
