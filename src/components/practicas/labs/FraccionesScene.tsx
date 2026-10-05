"use client";

/**
 * Escena 3D del laboratorio de Fracciones, decimales y porcentajes (R3F).
 * Se carga de forma diferida (ssr:false) desde LabFracciones.tsx.
 *
 * Representa la fracción n/d de DOS formas a la vez, para que se vea que son la
 * misma cantidad:
 *   - un PASTEL dividido en `d` rebanadas, con `n` rebanadas rellenas (la parte
 *     coloreada es la fracción / el porcentaje del círculo).
 *   - una BARRA dividida en `d` segmentos, con `n` segmentos rellenos.
 *
 * Todo se calcula en el render a partir de las props (numerador, denominador):
 * sin useFrame, sin Math.random, sin estado interno → cumple las reglas del
 * React Compiler. Las rebanadas usan cylinderGeometry con thetaStart/thetaLength.
 */

import { useMemo } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Escenario } from "./_escenario";

export interface FraccionesSceneProps {
  numerador: number;
  denominador: number;
  accent: string;
  autoRotate: boolean;
  resetNonce: number;
  /** Valor (0–1) de la fracción fijada como referencia, o null. */
  referencia?: number | null;
  /** Texto de la referencia, p. ej. «1/2». */
  referenciaTxt?: string;
}

const TAU = Math.PI * 2;
const BARRA_TOTAL = 5.4;
const PIE_R = 2.0;
const PIE_H = 0.5;
const PIE_Y = 0.7;
const GAP = 0.04; // separación angular relativa entre rebanadas
/* EL ENTERO TIENE QUE VERSE. Con `#27384B` sobre el fondo oscuro del
 * escenario, las rebanadas vacías DESAPARECÍAN: 1/2 se leía como «medio disco
 * flotando», no como «la mitad de un entero», que es justo lo que el alumno
 * viene a entender. La parte vacía se aclara y el entero se cierra con un aro. */
const VACIO = "#46617F";
const VACIO_EM = "#1B2E45";
const ARO = "#9FB6CD"; // el contorno del entero, siempre completo
const MARCA = "#FDE68A"; // la referencia fijada: un radio en el pastel y un poste en la barra
/* Inclinación del pastel. De frente era un círculo plano —un dibujo—; con unos
 * grados se ve su canto y vuelve a ser un objeto. */
const INCLINACION = -0.34;

/* ── Pastel: d rebanadas, n rellenas ──────────────────────────────────────── */
function Pastel({ n, d, accent, referencia }: { n: number; d: number; accent: string; referencia: number | null }) {
  const seg = TAU / d;
  const fill = new THREE.Color(accent);
  return (
    <group position={[0, PIE_Y, 0]} rotation={[INCLINACION, 0, 0]}>
      {/* El aro del entero: esté como esté repartido, el círculo completo se ve. */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.09]}>
        <torusGeometry args={[PIE_R + 0.07, 0.045, 10, 96]} />
        <meshStandardMaterial color={ARO} emissive={ARO} emissiveIntensity={0.18} roughness={0.35} metalness={0.5} />
      </mesh>
      {/* Marca de referencia: un radio de mismo valor que la fracción fijada */}
      {referencia !== null && (
        <mesh position={[(Math.cos(referencia * TAU) * (PIE_R + 0.2)) / 2, (-Math.sin(referencia * TAU) * (PIE_R + 0.2)) / 2, 0.52]} rotation={[0, 0, -referencia * TAU]}>
          <boxGeometry args={[PIE_R + 0.2, 0.09, 0.09]} />
          <meshStandardMaterial color={MARCA} emissive={MARCA} emissiveIntensity={0.5} roughness={0.4} />
        </mesh>
      )}
      {Array.from({ length: d }, (_, i) => {
        const lleno = i < n;
        const thetaStart = i * seg + seg * (GAP / 2) + Math.PI / 2;
        const thetaLength = seg * (1 - GAP);
        // las rebanadas llenas se adelantan un poco hacia la cámara
        const z = lleno ? 0.18 : 0;
        return (
          <mesh key={i} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, z]} castShadow>
            {/* Segmentos proporcionales al arco: una rebanada de 1/12 no
                necesita los mismos lados que media tarta, y 14 fijos dejaban
                el borde poligonal cuando d era pequeño. */}
            <cylinderGeometry
              args={[PIE_R, PIE_R, PIE_H, Math.max(8, Math.ceil(64 / d)), 1, false, thetaStart, thetaLength]}
            />
            <meshPhysicalMaterial
              color={lleno ? fill : VACIO}
              emissive={lleno ? fill : VACIO_EM}
              emissiveIntensity={lleno ? 0.35 : 0.1}
              roughness={lleno ? 0.28 : 0.52}
              metalness={0.15}
              clearcoat={lleno ? 0.9 : 0.3}
              clearcoatRoughness={0.25}
              envMapIntensity={1.1}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/* ── Barra: d segmentos, n rellenos ───────────────────────────────────────── */
function Barra({ n, d, accent, referencia }: { n: number; d: number; accent: string; referencia: number | null }) {
  const total = BARRA_TOTAL;
  const segW = total / d;
  const w = segW * 0.86;
  const x0 = -total / 2 + segW / 2;
  const y = -1.85;
  const fill = new THREE.Color(accent);
  return (
    <group position={[0, y, 0]}>
      {Array.from({ length: d }, (_, i) => {
        const lleno = i < n;
        const x = x0 + i * segW;
        return (
          <mesh key={i} position={[x, lleno ? 0.06 : 0, 0]} castShadow>
            <boxGeometry args={[w, lleno ? 0.78 : 0.6, 0.8]} />
            <meshPhysicalMaterial
              color={lleno ? fill : VACIO}
              emissive={lleno ? fill : VACIO_EM}
              emissiveIntensity={lleno ? 0.32 : 0.1}
              roughness={lleno ? 0.28 : 0.52}
              metalness={0.15}
              clearcoat={lleno ? 0.9 : 0.3}
              clearcoatRoughness={0.25}
              envMapIntensity={1.1}
            />
          </mesh>
        );
      })}
      {/* Poste de referencia: donde llega la fracción fijada. Si otra fracción llena la barra hasta aquí, valen lo mismo. */}
      {referencia !== null && (
        <mesh position={[-total / 2 + referencia * total, 0.5, 0.52]}>
          <boxGeometry args={[0.09, 1.9, 0.09]} />
          <meshStandardMaterial color={MARCA} emissive={MARCA} emissiveIntensity={0.5} roughness={0.4} />
        </mesh>
      )}
      {/* riel base de la barra */}
      <mesh position={[0, -0.45, 0]} receiveShadow>
        <boxGeometry args={[total + 0.3, 0.12, 1.0]} />
        <meshStandardMaterial color="#D7DEE6" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Marco del entero, por el mismo motivo que el aro del pastel: sin él,
          la barra a 1/6 parece una barra corta y no «uno de seis». */}
      {[-1, 1].map((lado) => (
        <mesh key={lado} position={[lado * (total / 2 + 0.11), 0.06, 0]}>
          <boxGeometry args={[0.07, 1.0, 0.86]} />
          <meshStandardMaterial color={ARO} emissive={ARO} emissiveIntensity={0.16} roughness={0.35} metalness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Etiquetas: ≥ 14 px, en la punta de lo que nombran, ocultas en pantallas angostas ── */
function Etiqueta({ pos, texto, color = "#fff" }: { pos: [number, number, number]; texto: string; color?: string }) {
  return (
    <Html position={pos} center pointerEvents="none" zIndexRange={[20, 0]}>
      <div style={{ whiteSpace: "nowrap", padding: "3px 10px", borderRadius: 8, background: "rgba(4,10,22,0.88)", border: `1.5px solid ${color}`, color, fontWeight: 900, fontSize: 15, fontFamily: "system-ui, sans-serif", boxShadow: "0 4px 16px rgba(0,0,0,0.5)" }}>
        {texto}
      </div>
    </Html>
  );
}

/* ── Contenido: encuadre adaptado al alto libre entre la barra y la misión ── */
function Contenido(props: FraccionesSceneProps & { d: number; n: number }) {
  const { d, n } = props;
  const { width, height } = useThree((st) => st.size);
  const referencia = props.referencia ?? null;
  // Banda libre: se descuentan ~64 px arriba y ~150 px abajo.
  const frac = Math.min(0.8, Math.max(0.38, (height - 214) / height));
  const distV = 5.8 / (frac * 0.9) / 0.768;
  const distH = 6.4 / ((width / height) * 0.768);
  const dist = Math.min(20, Math.max(8, distV, distH));
  const objetivoY = 0.25 - (43 / height) * 0.768 * dist;
  const etiquetas = width >= 640;

  return (
    <>
      <PerspectiveCamera makeDefault fov={42} position={[0, objetivoY + 0.4, dist]} />
      {/* Suelo, luz de tres puntos y entorno que reflejar. La altura sale
          de donde esta escena ya ponía su sombra de contacto, que es donde
          su autor decidió que estaba el piso. */}
      <Escenario acento={props.accent} suelo={-2.85} />

      <group key={`${d}-${props.resetNonce}`}>
        <Pastel n={n} d={d} accent={props.accent} referencia={referencia} />
        <Barra n={n} d={d} accent={props.accent} referencia={referencia} />
      </group>

      {etiquetas && (
        <>
          <Etiqueta pos={[0, PIE_Y + PIE_R + 0.55, 0]} texto={`Pastel: ${n} de ${d} partes`} color={props.accent} />
          {referencia !== null && props.referenciaTxt && (
            <Etiqueta pos={[-BARRA_TOTAL / 2 + referencia * BARRA_TOTAL, -1.85 + 1.75, 0.52]} texto={`Referencia ${props.referenciaTxt}`} color={MARCA} />
          )}
        </>
      )}

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={6}
        maxDistance={22}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.9}
        target={[0, objetivoY, 0]}
        autoRotate={props.autoRotate}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.4} luminanceThreshold={0.7} luminanceSmoothing={0.3} mipmapBlur radius={0.6} />
        <Vignette eskil={false} offset={0.28} darkness={0.42} />
      </EffectComposer>
    </>
  );
}

/* ── Escena completa ──────────────────────────────────────────────────────── */
export default function FraccionesScene(props: FraccionesSceneProps) {
  // saneamos las props para la geometría (d ≥ 1, 0 ≤ n ≤ d)
  const d = useMemo(() => Math.max(1, Math.round(props.denominador)), [props.denominador]);
  const n = useMemo(() => Math.max(0, Math.min(d, Math.round(props.numerador))), [props.numerador, d]);

  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}>
      <Contenido {...props} d={d} n={n} />
    </Canvas>
  );
}
