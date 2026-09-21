"use client";

/**
 * Escena 3D del laboratorio "La caverna y el conocimiento" (PFH-I-P06).
 * Cuatro vistas:
 *
 *  - sombras: la caverna de Platón. Cada sombra de la pared es la envolvente
 *    de la proyección central, desde el fuego, de los puntos del objeto (la
 *    misma función que usa el panel para decir si dos sombras coinciden), y
 *    también se proyectan el tabique y los prisioneros.
 *  - ascenso: la misma caverna más el túnel de subida, el estanque con sus
 *    reflejos (imagen especular real bajo el plano del agua) y el Sol.
 *  - ames: una habitación de Ames construida con la transformación proyectiva
 *    del archivo de datos: desde la mirilla parece rectangular; al rodearla se
 *    ve su forma real.
 *  - escalera: la escalera de la certeza con la creencia que sube, los bloques
 *    de razones y el caso (censo, volado o reloj de la plaza).
 *
 * Toda animación ocurre en useFrame mutando refs y avanza por tiempo. NO se
 * usa <Text> de drei (cuelga el chunk con Turbopack): el texto va en <Html>.
 */

import * as THREE from "three";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  type P2,
  type P3,
  type Pose,
  type Silueta,
  type CasoId,
  type Veredicto,
  type Resultado,
  CUEVA,
  PARED,
  sombraObjeto,
  recortar,
  sombraCaja,
  sombraBola,
  puntoFuego,
  normalizar,
  siluetaPoligono,
  area,
  centroide,
  altoPoli,
  num,
  AMES,
  mapAmes,
  medirPersona,
  CASOS,
  FUENTE_DEF,
  NIVELES,
  RESULTADO_DEF,
} from "./caverna-conocimiento-data";

export type VistaCaverna = "sombras" | "ascenso" | "ames" | "escalera";

export interface CavernaSceneProps {
  vista: VistaCaverna;
  modoColor: string;
  resetNonce: number;
  // Sombras
  pose: Pose;
  silueta: Silueta;
  coincide: boolean;
  ojoPrisionero: boolean;
  // Ascenso
  etapa: number;
  // Ames
  vistaAmes: number;
  betoX: number;
  regla: boolean;
  // Escalera
  casoId: CasoId;
  veredicto: Veredicto | null;
  elegidas: string[];
  nivel: number;
  verificado: boolean;
  moneda: "aguila" | "sol" | null;
  resultado: Resultado | null;
}

const suave = (dt: number, porCuadro: number) => 1 - Math.pow(1 - porCuadro, Math.min(dt, 0.25) * 60);
const OK = "#34d399";
const NO = "#f87171";

function Etiqueta({ pos, children, df = 10, col, fs = 12 }: { pos: P3; children: ReactNode; df?: number; col?: string; fs?: number }) {
  return (
    <Html position={pos} center distanceFactor={df} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 11px",
          borderRadius: 999,
          background: "rgba(4,10,22,0.86)",
          border: `1px solid ${col ?? "rgba(255,255,255,0.22)"}`,
          color: "#fff",
          fontSize: fs,
          fontWeight: 800,
          whiteSpace: "nowrap",
          boxShadow: "0 6px 18px -8px #000",
        }}
      >
        {children}
      </div>
    </Html>
  );
}

/** Persona de pie de estatura `alto` (pies en el origen). */
function Persona({ pos, color, alto = 1.6, pelo = "#1f2937" }: { pos: P3; color: string; alto?: number; pelo?: string }) {
  const k = alto / 1.6;
  return (
    <group position={pos} scale={k}>
      {[-0.08, 0.08].map((x) => (
        <mesh key={x} position={[x, 0.42, 0]}>
          <cylinderGeometry args={[0.055, 0.05, 0.84, 10]} />
          <meshStandardMaterial color="#334155" roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, 1.1, 0]}>
        <capsuleGeometry args={[0.16, 0.36, 6, 14]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {[-0.21, 0.21].map((x) => (
        <mesh key={x} position={[x, 1.06, 0]} rotation={[0, 0, x > 0 ? 0.12 : -0.12]}>
          <capsuleGeometry args={[0.045, 0.42, 4, 8]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 1.48, 0]}>
        <sphereGeometry args={[0.115, 18, 14]} />
        <meshStandardMaterial color="#e0ac85" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.53, -0.02]} scale={[1, 0.75, 1]}>
        <sphereGeometry args={[0.12, 16, 12]} />
        <meshStandardMaterial color={pelo} roughness={0.8} />
      </mesh>
    </group>
  );
}

/** Polígono plano sobre la pared (z fija). */
function PoligonoMuro({ poli, z, color, opacidad, escala = 1 }: { poli: P2[]; z: number; color: string; opacidad: number; escala?: number }) {
  const geo = useMemo(() => {
    if (poli.length < 3) return null;
    const c = centroide(poli);
    const shape = new THREE.Shape(poli.map((p) => new THREE.Vector2(c.x + (p.x - c.x) * escala, c.y + (p.y - c.y) * escala)));
    return new THREE.ShapeGeometry(shape);
  }, [poli, escala]);
  useEffect(() => () => geo?.dispose(), [geo]);
  if (!geo) return null;
  return (
    <mesh geometry={geo} position={[0, 0, z]}>
      <meshBasicMaterial color={color} transparent opacity={opacidad} depthWrite={false} polygonOffset polygonOffsetFactor={-2} />
    </mesh>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * CAVERNA (sombras y ascenso)
 * ════════════════════════════════════════════════════════════════════════ */

const PIEDRA = "#6b5a48";
const TUNEL_Z0 = 7;
const TUNEL_Z1 = 17;
const SUELO_EXT = 7.5;
const SOL: P3 = [16, 44, 95];
const ESTANQUE: P3 = [-2.2, SUELO_EXT, 25];
const ARBOL: P3 = [-4.2, SUELO_EXT, 28.8];

function Llamas({ fuego }: { fuego: P3 }) {
  const grupo = useRef<THREE.Group>(null);
  const luz = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (grupo.current)
      grupo.current.children.forEach((c, k) => {
        const s = 1 + 0.18 * Math.sin(t * (9 + k * 2.3) + k * 1.7) + 0.08 * Math.sin(t * 23 + k);
        c.scale.set(1, s, 1);
      });
    if (luz.current) luz.current.intensity = 26 * (1 + 0.08 * Math.sin(t * 11) + 0.05 * Math.sin(t * 27));
  });
  return (
    <group>
      {/* Repisa de piedra donde arde el fuego */}
      <mesh position={[fuego[0], (fuego[1] - 0.45) / 2, fuego[2]]}>
        <cylinderGeometry args={[0.55, 0.75, Math.max(0.2, fuego[1] - 0.45), 9]} />
        <meshStandardMaterial color="#3f3328" roughness={0.95} flatShading />
      </mesh>
      {[0, 1, 2].map((k) => (
        <mesh key={k} position={[fuego[0], fuego[1] - 0.4, fuego[2]]} rotation={[0, (k * Math.PI) / 3, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.07, 0.9, 8]} />
          <meshStandardMaterial color="#3b2412" roughness={0.9} />
        </mesh>
      ))}
      <group ref={grupo} position={[fuego[0], fuego[1] - 0.42, fuego[2]]}>
        {[
          { x: 0, z: 0, r: 0.3, h: 0.95, c: "#fb923c" },
          { x: 0.12, z: 0.08, r: 0.18, h: 0.7, c: "#fde047" },
          { x: -0.13, z: -0.05, r: 0.17, h: 0.62, c: "#f97316" },
          { x: 0.02, z: -0.12, r: 0.12, h: 0.5, c: "#fef3c7" },
        ].map((f, k) => (
          <mesh key={k} position={[f.x, f.h / 2, f.z]}>
            <coneGeometry args={[f.r, f.h, 14, 1, true]} />
            <meshBasicMaterial color={f.c} transparent opacity={0.85} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <pointLight ref={luz} position={fuego} intensity={26} distance={34} decay={1.15} color="#ffae5c" />
    </group>
  );
}

function Prisionero({ x }: { x: number }) {
  const z = CUEVA.prisioneroZ;
  return (
    <group position={[x, 0, z]}>
      {/* Torso sentado mirando la pared (−z) */}
      <mesh position={[0, 0.72, 0.05]}>
        <capsuleGeometry args={[0.2, 0.34, 6, 12]} />
        <meshStandardMaterial color="#8b7355" roughness={0.9} />
      </mesh>
      <mesh position={[0, CUEVA.cabezaY, 0]}>
        <sphereGeometry args={[0.15, 18, 14]} />
        <meshStandardMaterial color="#b98a66" roughness={0.7} />
      </mesh>
      {/* Piernas hacia delante */}
      {[-0.1, 0.1].map((dx) => (
        <mesh key={dx} position={[dx, 0.36, -0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.07, 0.5, 4, 8]} />
          <meshStandardMaterial color="#6b5842" roughness={0.9} />
        </mesh>
      ))}
      {/* Cadenas: cuello y tobillos al poste */}
      {Array.from({ length: 5 }, (_, k) => (
        <mesh key={`c${k}`} position={[0, CUEVA.cabezaY - 0.18 - k * 0.0, 0.18 + k * 0.13]} rotation={[0, k % 2 ? Math.PI / 2 : 0, 0]}>
          <torusGeometry args={[0.05, 0.014, 6, 12]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.85} roughness={0.35} />
        </mesh>
      ))}
      <mesh position={[0, 0.55, 0.85]}>
        <cylinderGeometry args={[0.06, 0.08, 1.2, 8]} />
        <meshStandardMaterial color="#4b3a2a" roughness={0.9} />
      </mesh>
      {Array.from({ length: 4 }, (_, k) => (
        <mesh key={`t${k}`} position={[0, 0.12, -0.55 - k * 0.12]} rotation={[Math.PI / 2, k % 2 ? Math.PI / 2 : 0, 0]}>
          <torusGeometry args={[0.045, 0.012, 6, 12]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.85} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
}

function SolidoMesh({ pose, color }: { pose: Pose; color: string }) {
  const t = CUEVA.tam;
  let geo: ReactNode;
  if (pose.solido === "cubo") geo = <boxGeometry args={[t, t, t]} />;
  else if (pose.solido === "cilindro") geo = <cylinderGeometry args={[t / 2, t / 2, t, 48]} />;
  else if (pose.solido === "cono") geo = <coneGeometry args={[t / 2, t, 48]} />;
  else if (pose.solido === "esfera") geo = <sphereGeometry args={[t / 2, 40, 28]} />;
  else geo = <coneGeometry args={[(t / 2) * Math.SQRT2, t, 4]} />;
  return (
    <group position={[0, CUEVA.objetoY, pose.objZ]} rotation={[0, (pose.giro * Math.PI) / 180, 0]}>
      <group rotation={[(pose.inclina * Math.PI) / 180, 0, 0]}>
        <mesh rotation={[0, pose.solido === "piramide" ? Math.PI / 4 : 0, 0]}>
          {geo}
          <meshStandardMaterial color={color} roughness={0.55} emissive={color} emissiveIntensity={0.08} flatShading={pose.solido === "piramide"} />
        </mesh>
      </group>
    </group>
  );
}

/** Figuras que llevan los portadores en el ascenso (cajas: su sombra es la unión exacta de las sombras de cada caja). */
const FIGURAS: { centro: P3; medidas: P3; color: string }[] = (() => {
  const y = CUEVA.objetoY;
  const z = 0.6;
  const h = -1.1;
  const a = 1.05;
  return [
    // Figurilla humana
    { centro: [h, y + 0.02, z], medidas: [0.26, 0.46, 0.16], color: "#caa274" },
    { centro: [h, y + 0.38, z], medidas: [0.18, 0.2, 0.16], color: "#caa274" },
    { centro: [h, y + 0.12, z], medidas: [0.52, 0.09, 0.1], color: "#caa274" },
    { centro: [h - 0.07, y - 0.42, z], medidas: [0.09, 0.42, 0.1], color: "#caa274" },
    { centro: [h + 0.07, y - 0.42, z], medidas: [0.09, 0.42, 0.1], color: "#caa274" },
    // Animal de cuatro patas, mirando hacia el centro
    { centro: [a, y, z], medidas: [0.6, 0.24, 0.2], color: "#b98b5e" },
    { centro: [a - 0.32, y + 0.17, z], medidas: [0.12, 0.26, 0.12], color: "#b98b5e" },
    { centro: [a - 0.44, y + 0.3, z], medidas: [0.24, 0.14, 0.14], color: "#b98b5e" },
    { centro: [a + 0.38, y + 0.05, z], medidas: [0.2, 0.05, 0.05], color: "#b98b5e" },
    ...[-0.22, 0.22].map((dx) => ({ centro: [a + dx, y - 0.28, z] as P3, medidas: [0.07, 0.32, 0.07] as P3, color: "#b98b5e" })),
  ];
})();
const POSTES_FIGURAS: P3[] = [
  [-1.1, (CUEVA.objetoY - 0.63) / 2, 0.6],
  [1.05, (CUEVA.objetoY - 0.44) / 2, 0.6],
];

function Caverna({ pose, silueta, coincide, etiquetas, modoColor, exterior }: { pose: Pose; silueta: Silueta; coincide: boolean; etiquetas: boolean; modoColor: string; exterior: boolean }) {
  const fuego = puntoFuego(pose);
  const zSombra = CUEVA.muroZ + 0.02;
  const sombraRecortada = useMemo(() => {
    const s = recortar(sombraObjeto(pose), PARED);
    return s.length >= 3 ? s : [];
  }, [pose]);
  const baja = CUEVA.objetoY - CUEVA.tam / 2;
  const otras = useMemo(() => {
    const f = puntoFuego(pose);
    const out: P2[][] = [];
    out.push(sombraCaja([0, CUEVA.tabiqueAlto / 2, CUEVA.tabiqueZ], [CUEVA.muroX * 2, CUEVA.tabiqueAlto, 0.3], f));
    for (const x of CUEVA.prisionerosX) {
      out.push(sombraBola([x, CUEVA.cabezaY, CUEVA.prisioneroZ], 0.15, f));
      out.push(sombraCaja([x, 0.72, CUEVA.prisioneroZ + 0.05], [0.4, 0.74, 0.4], f));
    }
    out.push(sombraCaja([0, baja / 2, pose.objZ], [0.06, baja, 0.06], f));
    if (exterior) {
      for (const fig of FIGURAS) out.push(sombraCaja(fig.centro, fig.medidas, f));
      for (const c of POSTES_FIGURAS) out.push(sombraCaja(c, [0.06, c[1] * 2, 0.06], f));
    }
    return out.filter((p) => p.length >= 3);
  }, [pose, baja, exterior]);

  // Silueta objetivo dibujada con el área y el centro de la sombra actual.
  const contorno = useMemo((): P3[] => {
    if (sombraRecortada.length < 3) return [];
    const c = centroide(sombraRecortada);
    const k = Math.sqrt(Math.abs(area(sombraRecortada)));
    const ideal = normalizar(siluetaPoligono(silueta));
    const pts = ideal.map((p) => [c.x + p.x * k, c.y + p.y * k, zSombra + 0.02] as P3);
    return [...pts, pts[0]!];
  }, [sombraRecortada, silueta, zSombra]);
  const cS = sombraRecortada.length >= 3 ? centroide(sombraRecortada) : { x: 0, y: 3 };
  const alto = altoPoli(sombraRecortada);

  const W = CUEVA.muroX;
  const Hc = CUEVA.muroAlto;
  const zF = TUNEL_Z0;
  const rocas = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        x: (i % 2 ? 1 : -1) * (W - 0.2 + ((i * 0.37) % 1) * 0.4),
        y: i % 5 === 0 ? Hc - ((i * 0.53) % 1) * 0.6 : ((i * 0.53) % 1) * 1.8,
        z: -4.6 + ((i * 0.71) % 1) * (i % 2 ? 7.5 : 11),
        r: 0.45 + ((i * 0.29) % 1) * 0.7,
      })),
    [W, Hc],
  );

  // Muro frontal con la boca del túnel.
  const frente = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-W, 0);
    s.lineTo(W, 0);
    s.lineTo(W, Hc);
    s.lineTo(-W, Hc);
    s.lineTo(-W, 0);
    const h = new THREE.Path();
    h.moveTo(-1.4, 0);
    h.lineTo(1.4, 0);
    h.lineTo(1.4, 3);
    h.lineTo(-1.4, 3);
    h.lineTo(-1.4, 0);
    s.holes.push(h);
    return new THREE.ShapeGeometry(s);
  }, [W, Hc]);
  useEffect(() => () => frente.dispose(), [frente]);

  const tunelLargo = Math.hypot(TUNEL_Z1 - TUNEL_Z0, SUELO_EXT);
  const tunelAng = Math.atan2(SUELO_EXT, TUNEL_Z1 - TUNEL_Z0);
  const tunelCentro: P3 = [0, SUELO_EXT / 2, (TUNEL_Z0 + TUNEL_Z1) / 2];

  return (
    <group>
      {/* Suelo, techo y paredes de roca */}
      <mesh position={[0, 0, (CUEVA.muroZ + zF) / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W * 2, zF - CUEVA.muroZ]} />
        <meshStandardMaterial color="#4a3d31" roughness={1} />
      </mesh>
      <mesh position={[0, Hc, (CUEVA.muroZ + zF) / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W * 2, zF - CUEVA.muroZ]} />
        <meshStandardMaterial color="#2d241c" roughness={1} />
      </mesh>
      <mesh position={[0, Hc / 2, CUEVA.muroZ]}>
        <planeGeometry args={[W * 2, Hc]} />
        <meshStandardMaterial color="#a38d72" roughness={0.95} />
      </mesh>
      {[-1, 1].map((l) => (
        <mesh key={l} position={[l * W, Hc / 2, (CUEVA.muroZ + zF) / 2]} rotation={[0, -l * (Math.PI / 2), 0]}>
          <planeGeometry args={[zF - CUEVA.muroZ, Hc]} />
          <meshStandardMaterial color={PIEDRA} roughness={1} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <mesh geometry={frente} position={[0, 0, zF]}>
        <meshStandardMaterial color={PIEDRA} roughness={1} side={THREE.DoubleSide} />
      </mesh>
      {rocas.map((r, i) => (
        <mesh key={i} position={[r.x, r.y, r.z]} rotation={[i * 0.7, i * 1.3, 0]}>
          <dodecahedronGeometry args={[r.r, 0]} />
          <meshStandardMaterial color={i % 3 ? "#5b4a3a" : "#4a3c2f"} roughness={1} flatShading />
        </mesh>
      ))}

      {/* Sombras en la pared */}
      {otras.map((p, i) => (
        <PoligonoMuro key={`o${i}`} poli={p} z={zSombra} color="#120c07" opacidad={0.86} />
      ))}
      {sombraRecortada.length >= 3 && (
        <>
          <PoligonoMuro poli={sombraRecortada} z={zSombra - 0.005} color="#120c07" opacidad={0.3} escala={1.035} />
          <PoligonoMuro poli={sombraRecortada} z={zSombra} color="#120c07" opacidad={0.9} />
        </>
      )}
      {etiquetas && contorno.length > 3 && <Line points={contorno} color={coincide ? OK : "#fef3c7"} lineWidth={2.2} dashed={!coincide} dashSize={0.18} gapSize={0.12} />}
      {etiquetas && (
        <Etiqueta pos={[cS.x, Math.min(Hc - 0.4, cS.y + alto / 2 + 0.55), zSombra + 0.1]} df={14} col={coincide ? `${OK}cc` : `${modoColor}aa`} fs={12}>
          <i className={`fa-solid ${coincide ? "fa-circle-check" : "fa-cloud"}`} style={{ color: coincide ? OK : modoColor }} />
          Sombra · {num(alto, 2)} m de alto
        </Etiqueta>
      )}

      {/* Tabique y prisioneros */}
      <mesh position={[0, CUEVA.tabiqueAlto / 2, CUEVA.tabiqueZ]}>
        <boxGeometry args={[W * 2 - 0.2, CUEVA.tabiqueAlto, 0.3]} />
        <meshStandardMaterial color="#5e4d3c" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.2, CUEVA.prisioneroZ + 0.1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 5.6, 12]} />
        <meshStandardMaterial color="#4b3a2a" roughness={0.95} />
      </mesh>
      {CUEVA.prisionerosX.map((x) => (
        <Prisionero key={x} x={x} />
      ))}

      {/* Riel, poste y objeto */}
      <mesh position={[0, 0.03, (CUEVA.tabiqueZ + CUEVA.fuegoZ) / 2]}>
        <boxGeometry args={[0.5, 0.06, CUEVA.fuegoZ - CUEVA.tabiqueZ - 0.6]} />
        <meshStandardMaterial color="#3b2a1c" roughness={0.9} />
      </mesh>
      <mesh position={[0, baja / 2, pose.objZ]}>
        <boxGeometry args={[0.06, baja, 0.06]} />
        <meshStandardMaterial color="#7c5a3a" roughness={0.8} />
      </mesh>
      <SolidoMesh pose={pose} color="#d6a36b" />
      {exterior && (
        <>
          {FIGURAS.map((fig, i) => (
            <mesh key={i} position={fig.centro}>
              <boxGeometry args={fig.medidas} />
              <meshStandardMaterial color={fig.color} roughness={0.6} />
            </mesh>
          ))}
          {POSTES_FIGURAS.map((c, i) => (
            <mesh key={i} position={c}>
              <boxGeometry args={[0.06, c[1] * 2, 0.06]} />
              <meshStandardMaterial color="#7c5a3a" roughness={0.8} />
            </mesh>
          ))}
        </>
      )}

      <Llamas fuego={fuego} />
      <ambientLight intensity={exterior ? 0.15 : 0.22} color="#ffd9b0" />

      {etiquetas && (
        <>
          <Etiqueta pos={[-4.6, 5.4, CUEVA.muroZ + 0.2]} df={14} fs={11}>
            <i className="fa-solid fa-image" style={{ color: modoColor }} />
            Pared de la caverna
          </Etiqueta>
          <Etiqueta pos={[-4.8, CUEVA.tabiqueAlto + 0.4, CUEVA.tabiqueZ]} df={14} fs={11}>
            Tabique (muro bajo)
          </Etiqueta>
          <Etiqueta pos={[1.8, 1.85, CUEVA.prisioneroZ - 0.3]} df={14} fs={11}>
            <i className="fa-solid fa-link" style={{ color: "#cbd5e1" }} />
            Prisioneros encadenados
          </Etiqueta>
          <Etiqueta pos={[fuego[0], fuego[1] + 1.05, fuego[2]]} df={14} fs={11} col="#fb923caa">
            <i className="fa-solid fa-fire" style={{ color: "#fb923c" }} />
            Fuego
          </Etiqueta>
        </>
      )}

      {exterior && (
        <>
          {/* Túnel de subida */}
          <group position={tunelCentro} rotation={[-tunelAng, 0, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
              <planeGeometry args={[2.8, tunelLargo + 0.4]} />
              <meshStandardMaterial color="#4a3d31" roughness={1} side={THREE.DoubleSide} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 1.5, 0]}>
              <planeGeometry args={[2.8, tunelLargo + 0.4]} />
              <meshStandardMaterial color="#2d241c" roughness={1} side={THREE.DoubleSide} />
            </mesh>
            {[-1, 1].map((l) => (
              <mesh key={l} position={[l * 1.4, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                <planeGeometry args={[tunelLargo + 0.4, 3]} />
                <meshStandardMaterial color={PIEDRA} roughness={1} side={THREE.DoubleSide} />
              </mesh>
            ))}
          </group>
          <Exterior />
        </>
      )}
    </group>
  );
}

function Exterior() {
  const suelo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-60, -120);
    s.lineTo(60, -120);
    s.lineTo(60, -TUNEL_Z1);
    s.lineTo(-60, -TUNEL_Z1);
    s.lineTo(-60, -120);
    const h = new THREE.Path();
    h.absarc(ESTANQUE[0], -ESTANQUE[2], 2.6, 0, Math.PI * 2, true);
    s.holes.push(h);
    return new THREE.ShapeGeometry(s, 48);
  }, []);
  const ladera = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-60, SUELO_EXT);
    s.lineTo(60, SUELO_EXT);
    s.lineTo(60, 15);
    s.lineTo(-60, 15);
    s.lineTo(-60, SUELO_EXT);
    const h = new THREE.Path();
    h.moveTo(-1.4, SUELO_EXT);
    h.lineTo(1.4, SUELO_EXT);
    h.lineTo(1.4, SUELO_EXT + 3);
    h.lineTo(-1.4, SUELO_EXT + 3);
    h.lineTo(-1.4, SUELO_EXT);
    s.holes.push(h);
    return new THREE.ShapeGeometry(s);
  }, []);
  useEffect(
    () => () => {
      suelo.dispose();
      ladera.dispose();
    },
    [suelo, ladera],
  );
  const arbol = (
    <group>
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.18, 0.28, 2.4, 10]} />
        <meshStandardMaterial color="#6b4423" roughness={0.9} />
      </mesh>
      {[
        [0, 3.0, 0, 1.5],
        [0.8, 2.6, 0.3, 1.0],
        [-0.8, 2.7, -0.2, 1.05],
        [0.1, 3.8, 0.1, 1.0],
      ].map((b, i) => (
        <mesh key={i} position={[b[0]!, b[1]!, b[2]!]}>
          <icosahedronGeometry args={[b[3]!, 1]} />
          <meshStandardMaterial color={i % 2 ? "#3f8f3a" : "#4ea84a"} roughness={0.8} flatShading />
        </mesh>
      ))}
    </group>
  );
  return (
    <group>
      <hemisphereLight args={["#cfe8ff", "#6b8f4e", 1.1]} position={[0, 60, 40]} />
      <directionalLight position={SOL} intensity={2.4} color="#fff4d6" />
      <mesh geometry={suelo} rotation={[-Math.PI / 2, 0, 0]} position={[0, SUELO_EXT, 0]}>
        <meshStandardMaterial color="#7fae5a" roughness={1} />
      </mesh>
      <mesh geometry={ladera} position={[0, 0, TUNEL_Z1]}>
        <meshStandardMaterial color="#8a7a66" roughness={1} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 15, (TUNEL_Z1 - 10) / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[120, TUNEL_Z1 + 10]} />
        <meshStandardMaterial color="#6f9a4c" roughness={1} />
      </mesh>
      {/* Cerros lejanos */}
      {[
        [-26, 70, 16],
        [8, 88, 22],
        [34, 64, 14],
      ].map((c, i) => (
        <mesh key={i} position={[c[0]!, SUELO_EXT + c[2]! / 2 - 0.5, c[1]!]}>
          <coneGeometry args={[c[2]! * 1.4, c[2]!, 8]} />
          <meshStandardMaterial color="#6d8f9e" roughness={1} flatShading />
        </mesh>
      ))}
      <group position={ARBOL}>{arbol}</group>
      {/* Reflejo: el árbol reflejado bajo el plano del agua (imagen especular exacta) */}
      <group position={ARBOL} scale={[1, -1, 1]}>
        {arbol}
      </group>
      <mesh position={[ESTANQUE[0], SUELO_EXT - 40, ESTANQUE[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[60, 32]} />
        <meshBasicMaterial color="#9fd0f7" />
      </mesh>
      <mesh position={[ESTANQUE[0], SUELO_EXT - 0.02, ESTANQUE[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.6, 48]} />
        <meshStandardMaterial color="#1e6fa8" transparent opacity={0.32} roughness={0.05} metalness={0.3} depthWrite={false} />
      </mesh>
      <mesh position={[ESTANQUE[0], SUELO_EXT + 0.04, ESTANQUE[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.55, 2.95, 48]} />
        <meshStandardMaterial color="#8d8272" roughness={1} />
      </mesh>
      {/* El Sol */}
      <mesh position={SOL}>
        <sphereGeometry args={[4.5, 32, 24]} />
        <meshBasicMaterial color={[6, 5.6, 4.2]} toneMapped={false} />
      </mesh>
      <mesh position={SOL}>
        <sphereGeometry args={[7.5, 32, 24]} />
        <meshBasicMaterial color={[2.4, 2, 1.1]} transparent opacity={0.3} toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** Cámaras del ascenso: 0 sombras, 1 objetos y fuego, 2-4 subida, 5 afuera, 6 el Sol. */
const RECORRIDO: { pos: P3; mira: P3 }[] = [
  { pos: [0, 1.4, CUEVA.prisioneroZ + 0.9], mira: [0, 1.4, CUEVA.muroZ] },
  { pos: [1.2, 1.75, -3.4], mira: [0, 2.6, 4.5] },
  { pos: [0.3, 2.0, 5.8], mira: [0, 3.2, 12] },
  { pos: [0, 4.4, 11.6], mira: [0, 8.6, 18] },
  { pos: [0.4, SUELO_EXT + 1.8, 18.2], mira: [-1.5, SUELO_EXT + 0.6, 26] },
  { pos: [2.6, SUELO_EXT + 2.3, 19.6], mira: [-2.4, SUELO_EXT + 0.4, 26] },
  { pos: [0.5, SUELO_EXT + 1.7, 20], mira: [SOL[0] * 0.5, SOL[1] * 0.5, SOL[2] * 0.5] },
];
const PARADA = [0, 1, 5, 6];

function CamaraAscenso({ etapa }: { etapa: number }) {
  const { camera, size } = useThree();
  const u = useRef(PARADA[Math.min(3, Math.max(0, etapa))]!);
  const mira = useMemo(() => new THREE.Vector3(), []);
  const a = useMemo(() => new THREE.Vector3(), []);
  const b = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, dt) => {
    const destino = PARADA[Math.min(3, Math.max(0, etapa))]!;
    const d = destino - u.current;
    const vel = 1.1;
    if (Math.abs(d) > 1e-3) u.current += Math.sign(d) * Math.min(Math.abs(d), vel * Math.min(dt, 0.1));
    else u.current = destino;
    const i = Math.min(RECORRIDO.length - 2, Math.floor(u.current));
    const f = u.current - i;
    const e = f * f * (3 - 2 * f);
    const k0 = RECORRIDO[i]!;
    const k1 = RECORRIDO[i + 1]!;
    a.set(...k0.pos).lerp(b.set(...k1.pos), e);
    camera.position.copy(a);
    a.set(...k0.mira).lerp(b.set(...k1.mira), e);
    mira.copy(a);
    camera.lookAt(mira);
    aplicarLente(camera, size.width, size.height, 62, Math.max(0, 1 - u.current));
  });
  return null;
}

/**
 * «Lente descentrada»: la cámara mira horizontal (sin deformar la pared en
 * trapecio) y la ventana de la imagen se desplaza hacia arriba, como una cámara
 * de arquitectura. k = 0 es la proyección normal; k = 1, la del prisionero.
 */
function aplicarLente(camera: THREE.Camera, w: number, h: number, fovBase: number, k: number) {
  const cam = camera as THREE.PerspectiveCamera;
  const t = Math.tan(((fovBase / 2) * Math.PI) / 180);
  const arriba = t + (1.1 - t) * k;
  const abajo = -t + (-0.15 + t) * k;
  const T = Math.max(Math.abs(arriba), Math.abs(abajo));
  const frac = (arriba - abajo) / (2 * T);
  const H = h / frac;
  cam.fov = (2 * Math.atan(T) * 180) / Math.PI;
  cam.aspect = w / H;
  cam.setViewOffset(w, H, 0, ((T - arriba) / (2 * T)) * H, w, h);
  cam.updateProjectionMatrix();
}

function CamaraPrisionero() {
  const { camera, size } = useThree();
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    const k = RECORRIDO[0]!;
    camera.position.set(...k.pos);
    camera.lookAt(v.set(0, k.pos[1], CUEVA.muroZ));
    aplicarLente(camera, size.width, size.height, 62, 1);
  });
  return null;
}

/* ════════════════════════════════════════════════════════════════════════
 * HABITACIÓN DE AMES
 * ════════════════════════════════════════════════════════════════════════ */

interface Quad {
  a: P3;
  b: P3;
  c: P3;
  d: P3;
  col: string;
}

function geoQuads(quads: Quad[]): THREE.BufferGeometry {
  const pos: number[] = [];
  const col: number[] = [];
  const c = new THREE.Color();
  for (const q of quads) {
    const [a, b, cc, d] = [mapAmes(q.a), mapAmes(q.b), mapAmes(q.c), mapAmes(q.d)];
    c.set(q.col);
    for (const v of [a, b, cc, a, cc, d]) {
      pos.push(v[0], v[1], v[2]);
      col.push(c.r, c.g, c.b);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
}

const AW = AMES.ancho / 2;
const AH = AMES.alto / 2;
const Z0 = AMES.zFrente;
const Z1 = AMES.zFondo;

function quadsPiso(): Quad[] {
  const out: Quad[] = [];
  const nx = 8;
  const nz = 11;
  for (let i = 0; i < nx; i++)
    for (let j = 0; j < nz; j++) {
      const x0 = -AW + (i * AMES.ancho) / nx;
      const x1 = -AW + ((i + 1) * AMES.ancho) / nx;
      const z0 = Z0 + ((Z1 - Z0) * j) / nz;
      const z1 = Z0 + ((Z1 - Z0) * (j + 1)) / nz;
      out.push({ a: [x0, -AH, z0], b: [x1, -AH, z0], c: [x1, -AH, z1], d: [x0, -AH, z1], col: (i + j) % 2 ? "#f1ece2" : "#27293d" });
    }
  return out;
}

function quadsFondo(): Quad[] {
  const out: Quad[] = [];
  const n = 12;
  for (let i = 0; i < n; i++) {
    const x0 = -AW + (i * AMES.ancho) / n;
    const x1 = -AW + ((i + 1) * AMES.ancho) / n;
    out.push({ a: [x0, -AH + 0.5, Z1], b: [x1, -AH + 0.5, Z1], c: [x1, AH, Z1], d: [x0, AH, Z1], col: i % 2 ? "#c7b9a6" : "#d8cbb8" });
    out.push({ a: [x0, -AH, Z1], b: [x1, -AH, Z1], c: [x1, -AH + 0.5, Z1], d: [x0, -AH + 0.5, Z1], col: "#6b4f3a" });
  }
  // Dos ventanas iguales.
  for (const cx of [-1.05, 1.05]) {
    const z = Z1 + 0.01;
    out.push({ a: [cx - 0.5, -0.15, z], b: [cx + 0.5, -0.15, z], c: [cx + 0.5, 0.95, z], d: [cx - 0.5, 0.95, z], col: "#f8fafc" });
    const z2 = Z1 + 0.02;
    out.push({ a: [cx - 0.42, -0.07, z2], b: [cx + 0.42, -0.07, z2], c: [cx + 0.42, 0.87, z2], d: [cx - 0.42, 0.87, z2], col: "#8ccdf2" });
    const z3 = Z1 + 0.03;
    out.push({ a: [cx - 0.03, -0.07, z3], b: [cx + 0.03, -0.07, z3], c: [cx + 0.03, 0.87, z3], d: [cx - 0.03, 0.87, z3], col: "#f8fafc" });
    out.push({ a: [cx - 0.42, 0.37, z3], b: [cx + 0.42, 0.37, z3], c: [cx + 0.42, 0.43, z3], d: [cx - 0.42, 0.43, z3], col: "#f8fafc" });
  }
  return out;
}

function quadsLado(lado: -1 | 1): Quad[] {
  const out: Quad[] = [];
  const n = 14;
  const x = lado * AW;
  for (let j = 0; j < n; j++) {
    const z0 = Z0 + ((Z1 - Z0) * j) / n;
    const z1 = Z0 + ((Z1 - Z0) * (j + 1)) / n;
    out.push({ a: [x, -AH + 0.5, z0], b: [x, -AH + 0.5, z1], c: [x, AH, z1], d: [x, AH, z0], col: j % 2 ? "#c7b9a6" : "#d8cbb8" });
    out.push({ a: [x, -AH, z0], b: [x, -AH, z1], c: [x, -AH + 0.5, z1], d: [x, -AH + 0.5, z0], col: "#6b4f3a" });
  }
  return out;
}

function quadsTecho(): Quad[] {
  return [{ a: [-AW, AH, Z0], b: [AW, AH, Z0], c: [AW, AH, Z1], d: [-AW, AH, Z1], col: "#e7e2d8" }];
}

function quadsFrente(): Quad[] {
  const hx = 0.62;
  const hy = 0.4;
  const z = Z0;
  const col = "#b8a892";
  return [
    { a: [-AW, -AH, z], b: [AW, -AH, z], c: [AW, -hy, z], d: [-AW, -hy, z], col },
    { a: [-AW, hy, z], b: [AW, hy, z], c: [AW, AH, z], d: [-AW, AH, z], col },
    { a: [-AW, -hy, z], b: [-hx, -hy, z], c: [-hx, hy, z], d: [-AW, hy, z], col },
    { a: [hx, -hy, z], b: [AW, -hy, z], c: [AW, hy, z], d: [hx, hy, z], col },
  ];
}

const GEO_PISO = geoQuads(quadsPiso());
const GEO_FONDO = geoQuads(quadsFondo());
const GEO_IZQ = geoQuads(quadsLado(-1));
const GEO_DER = geoQuads(quadsLado(1));
const GEO_TECHO = geoQuads(quadsTecho());
const GEO_FRENTE = geoQuads(quadsFrente());

const CAM_AMES: { pos: P3; mira: P3 }[] = [
  { pos: [0, 0, 0], mira: [0, -0.12, -5] },
  { pos: [-0.6, 6.4, 2.6], mira: [-1.2, -1.9, -7.8] },
  { pos: [-1.0, 19, -4.6], mira: [-1.0, -2.2, -6.2] },
];

function CamaraAmes({ p }: { p: number }) {
  const { camera } = useThree();
  const u = useRef(p);
  const a = useMemo(() => new THREE.Vector3(), []);
  const b = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, dt) => {
    u.current += (p - u.current) * suave(dt, 0.08);
    if (Math.abs(p - u.current) < 1e-4) u.current = p;
    const t = Math.min(1, Math.max(0, u.current)) * 2;
    const i = Math.min(1, Math.floor(t));
    const f = t - i;
    const e = f * f * (3 - 2 * f);
    const k0 = CAM_AMES[i]!;
    const k1 = CAM_AMES[i + 1]!;
    camera.position.copy(a.set(...k0.pos).lerp(b.set(...k1.pos), e));
    a.set(...k0.mira).lerp(b.set(...k1.mira), e);
    camera.lookAt(a);
  });
  return null;
}

function Regla({ pies, color, lado }: { pies: P3; color: string; lado: -1 | 1 }) {
  return (
    <group position={[pies[0] + lado * 0.42, pies[1], pies[2]]}>
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[0.07, 2, 0.02]} />
        <meshStandardMaterial color="#fde68a" roughness={0.5} />
      </mesh>
      {Array.from({ length: 11 }, (_, k) => (
        <mesh key={k} position={[-0.05, k * 0.2, 0.012]}>
          <boxGeometry args={[k % 5 === 0 ? 0.1 : 0.06, 0.012, 0.01]} />
          <meshBasicMaterial color="#1f2937" />
        </mesh>
      ))}
      <mesh position={[-lado * 0.2, AMES.estatura, 0]}>
        <boxGeometry args={[0.46, 0.02, 0.02]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <Etiqueta pos={[lado * 0.36, AMES.estatura + 0.12, 0]} df={7} fs={11} col={`${color}cc`}>
        <i className="fa-solid fa-ruler-vertical" style={{ color }} />
        1.60 m
      </Etiqueta>
    </group>
  );
}

function HabitacionAmes({ p, betoX, regla, modoColor }: { p: number; betoX: number; regla: boolean; modoColor: string }) {
  const techo = useRef<THREE.Mesh>(null);
  const der = useRef<THREE.Mesh>(null);
  const izq = useRef<THREE.Mesh>(null);
  const frente = useRef<THREE.Mesh>(null);
  const extras = useRef<THREE.Group>(null);
  const suavizado = useRef(p);
  useFrame((_, dt) => {
    suavizado.current += (p - suavizado.current) * suave(dt, 0.08);
    const afuera = suavizado.current > 0.07;
    if (techo.current) techo.current.visible = !afuera;
    if (der.current) der.current.visible = !afuera;
    if (izq.current) izq.current.visible = !afuera;
    if (frente.current) frente.current.visible = !afuera;
    if (extras.current) extras.current.visible = suavizado.current > 0.2;
  });
  const ana = medirPersona(AMES.xAna);
  const beto = medirPersona(betoX);
  const plano = useMemo((): P3[] => {
    const y = -AH * 1.0 + 0.002;
    return [
      [-AW, y, Z0],
      [AW, y, Z0],
      [AW, y, Z1],
      [-AW, y, Z1],
      [-AW, y, Z0],
    ];
  }, []);
  const cabezaAna: P3 = [ana.pies[0], ana.pies[1] + AMES.estatura, ana.pies[2]];
  const cabezaBeto: P3 = [beto.pies[0], beto.pies[1] + AMES.estatura, beto.pies[2]];
  return (
    <group>
      <ambientLight intensity={1.05} />
      <directionalLight position={[2, 6, 4]} intensity={0.9} />
      <mesh geometry={GEO_PISO}>
        <meshStandardMaterial vertexColors roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={GEO_FONDO}>
        <meshStandardMaterial vertexColors roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={izq} geometry={GEO_IZQ}>
        <meshStandardMaterial vertexColors roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={der} geometry={GEO_DER}>
        <meshStandardMaterial vertexColors roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={techo} geometry={GEO_TECHO}>
        <meshStandardMaterial vertexColors roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={frente} geometry={GEO_FRENTE}>
        <meshStandardMaterial vertexColors roughness={0.95} side={THREE.DoubleSide} />
      </mesh>

      <Persona pos={ana.pies} color="#f472b6" pelo="#3b2415" />
      <Persona pos={beto.pies} color="#60a5fa" pelo="#111827" />
      {regla && (
        <>
          <Regla pies={ana.pies} color="#f472b6" lado={-1} />
          <Regla pies={beto.pies} color="#60a5fa" lado={-1} />
        </>
      )}
      <Etiqueta pos={[ana.pies[0], ana.pies[1] + AMES.estatura + 0.28, ana.pies[2]]} df={8} fs={11} col="#f472b6aa">
        Ana
      </Etiqueta>
      <Etiqueta pos={[beto.pies[0], beto.pies[1] + AMES.estatura + 0.28, beto.pies[2]]} df={8} fs={11} col="#60a5faaa">
        Beto
      </Etiqueta>

      <group ref={extras}>
        {/* Mirilla */}
        <mesh position={[0, 0, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.3, 20]} />
          <meshStandardMaterial color="#111827" metalness={0.5} roughness={0.4} />
        </mesh>
        {p > 0.12 && (
          <Etiqueta pos={[0, 0.55, 0.1]} df={10} fs={12} col={`${modoColor}cc`}>
            <i className="fa-solid fa-eye" style={{ color: modoColor }} />
            Mirilla
          </Etiqueta>
        )}
        {/* Lo que crees ver: el cuarto rectangular */}
        <Line points={plano} color={modoColor} lineWidth={2} dashed dashSize={0.25} gapSize={0.15} />
        {p > 0.12 && (
          <Etiqueta pos={[-AW + 0.3, -AH, Z1 + 0.6]} df={13} fs={10.5} col={`${modoColor}aa`}>
            Cuarto que crees ver (rectangular)
          </Etiqueta>
        )}
        {/* Rayos de visión a las cabezas */}
        <Line points={[[0, 0, 0], cabezaAna]} color="#f472b6" lineWidth={1.5} transparent opacity={0.8} />
        <Line points={[[0, 0, 0], cabezaBeto]} color="#60a5fa" lineWidth={1.5} transparent opacity={0.8} />
        {p > 0.12 && (
          <Etiqueta pos={[cabezaAna[0] * 0.5 + 0.25, cabezaAna[1] * 0.5, cabezaAna[2] * 0.5]} df={13} fs={10.5} col="#f472b6aa">
            a {num(ana.distancia, 1)} m de la mirilla
          </Etiqueta>
        )}
        {p > 0.12 && (
          <Etiqueta pos={[cabezaBeto[0] * 0.62 - 0.25, cabezaBeto[1] * 0.62, cabezaBeto[2] * 0.62]} df={13} fs={10.5} col="#60a5faaa">
            a {num(beto.distancia, 1)} m de la mirilla
          </Etiqueta>
        )}
      </group>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * ESCALERA DE LA CERTEZA
 * ════════════════════════════════════════════════════════════════════════ */

const PASO_X = (i: number) => -1.9 + i * 1.35;
const PASO_H = (i: number) => 0.3 + i * 0.55;
const PORTAL_X = PASO_X(4) + 0.15;
const PORTAL_H = PASO_H(4);

function Moneda({ verificado, moneda }: { verificado: boolean; moneda: "aguila" | "sol" | null }) {
  const ref = useRef<THREE.Group>(null);
  const t = useRef(0);
  useFrame((_, dt) => {
    t.current = verificado ? t.current + dt : 0;
    const g = ref.current;
    if (!g) return;
    const d = 1.6;
    const f = Math.min(1, t.current / d);
    g.position.y = 1.35 + Math.sin(f * Math.PI) * 1.9;
    // Da vueltas completas y termina con la cara que salió hacia arriba.
    const final = moneda === "sol" ? Math.PI : 0;
    g.rotation.x = verificado ? (1 - Math.pow(1 - f, 2)) * (Math.PI * 10) + final * f : 0.35;
  });
  return (
    <group ref={ref} position={[0, 1.35, 0]}>
      <mesh>
        <cylinderGeometry args={[0.42, 0.42, 0.06, 40]} />
        <meshStandardMaterial color="#d4a017" metalness={0.85} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.032, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3, 32]} />
        <meshStandardMaterial color="#b7860b" metalness={0.8} roughness={0.35} />
      </mesh>
      <mesh position={[0, -0.032, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.16, 0.3, 32]} />
        <meshStandardMaterial color="#f5c542" metalness={0.8} roughness={0.35} />
      </mesh>
    </group>
  );
}

function PropCaso({ casoId, verificado, moneda, elegidas, modoColor }: { casoId: CasoId; verificado: boolean; moneda: "aguila" | "sol" | null; elegidas: string[]; modoColor: string }) {
  const segundero = useRef<THREE.Group>(null);
  const tel = useRef<HTMLSpanElement>(null);
  const tiempo = useRef(0);
  useFrame((_, dt) => {
    tiempo.current += dt;
    if (tel.current) tel.current.textContent = `8:15:${String(Math.floor(tiempo.current) % 60).padStart(2, "0")}`;
    // El segundero está quieto: el reloj se detuvo (nadie lo nota hasta verificar).
    if (segundero.current) segundero.current.rotation.z = -Math.PI * 0.4;
  });
  const personas = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        x: ((i % 10) - 4.5) * 0.19,
        z: (Math.floor(i / 10) - 2.5) * 0.19,
        c: ["#f472b6", "#60a5fa", "#fbbf24", "#34d399", "#a78bfa"][i % 5]!,
      })),
    [],
  );
  if (casoId === "censo")
    return (
      <group position={[-4.6, 0, 0.6]}>
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[2.2, 0.6, 1.5]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} />
        </mesh>
        {personas.map((p, i) => (
          <group key={i} position={[p.x, 0.6, p.z]}>
            <mesh position={[0, 0.1, 0]}>
              <capsuleGeometry args={[0.045, 0.1, 3, 6]} />
              <meshStandardMaterial color={p.c} roughness={0.6} />
            </mesh>
            <mesh position={[0, 0.23, 0]}>
              <sphereGeometry args={[0.042, 8, 6]} />
              <meshStandardMaterial color="#e0ac85" roughness={0.6} />
            </mesh>
          </group>
        ))}
        {elegidas.includes("inegi") && (
          <Etiqueta pos={[0, 1.55, 0]} df={10} fs={11} col="#34d399aa">
            <i className="fa-solid fa-building-columns" style={{ color: "#34d399" }} />
            INEGI 2020: 126 014 024 · cada figura ≈ 2.1 millones
          </Etiqueta>
        )}
        {elegidas.includes("meme") && (
          <Etiqueta pos={[0, 2.15, 0]} df={10} fs={11} col={`${NO}aa`}>
            <i className="fa-solid fa-triangle-exclamation" style={{ color: NO }} />
            Meme: «200 millones» (sin fuente)
          </Etiqueta>
        )}
      </group>
    );
  if (casoId === "volado")
    return (
      <group position={[-4.4, 0, 0.6]}>
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.9, 1, 0.9, 24]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.02, 0]}>
          <cylinderGeometry args={[0.55, 0.55, 0.24, 24]} />
          <meshStandardMaterial color="#334155" roughness={0.5} />
        </mesh>
        <Moneda key={`${verificado}-${moneda}`} verificado={verificado} moneda={moneda} />
        {verificado && moneda && (
          <Etiqueta pos={[0, 2.4, 0]} df={9} fs={13} col={`${modoColor}cc`}>
            <i className="fa-solid fa-coins" style={{ color: "#fbbf24" }} />
            Cayó {moneda === "aguila" ? "águila" : "sol"}
          </Etiqueta>
        )}
      </group>
    );
  return (
    <group position={[-4.5, 0, 0.2]}>
      <mesh position={[0, 1.7, 0]}>
        <boxGeometry args={[1.3, 3.4, 1.3]} />
        <meshStandardMaterial color="#b45309" roughness={0.8} />
      </mesh>
      <mesh position={[0, 3.6, 0]}>
        <coneGeometry args={[1.05, 0.8, 4]} />
        <meshStandardMaterial color="#7c2d12" roughness={0.8} flatShading />
      </mesh>
      <group position={[0, 2.65, 0.66]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.52, 0.52, 0.06, 40]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.5} />
        </mesh>
        {Array.from({ length: 12 }, (_, k) => (
          <mesh key={k} position={[Math.sin((k / 12) * Math.PI * 2) * 0.43, Math.cos((k / 12) * Math.PI * 2) * 0.43, 0.035]}>
            <boxGeometry args={[0.03, 0.08, 0.01]} />
            <meshBasicMaterial color="#1f2937" />
          </mesh>
        ))}
        {/* 8:15: minutero en el 3, horario un cuarto de hora después del 8 */}
        <group rotation={[0, 0, -Math.PI / 2]} position={[0, 0, 0.045]}>
          <mesh position={[0, 0.19, 0]}>
            <boxGeometry args={[0.035, 0.38, 0.01]} />
            <meshBasicMaterial color="#111827" />
          </mesh>
        </group>
        <group rotation={[0, 0, -((8 + 15 / 60) / 12) * Math.PI * 2]} position={[0, 0, 0.05]}>
          <mesh position={[0, 0.13, 0]}>
            <boxGeometry args={[0.05, 0.26, 0.01]} />
            <meshBasicMaterial color="#111827" />
          </mesh>
        </group>
        <group ref={segundero} position={[0, 0, 0.055]}>
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[0.012, 0.4, 0.01]} />
            <meshBasicMaterial color="#dc2626" />
          </mesh>
        </group>
      </group>
      {verificado && (
        <>
          <Etiqueta pos={[0, 4.35, 0.9]} df={10} fs={11} col={`${NO}cc`}>
            <i className="fa-solid fa-pause" style={{ color: NO }} />
            Detenido desde ayer a las 8:15
          </Etiqueta>
          <Html position={[2.25, 2.5, 0.9]} center distanceFactor={10} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
            <div style={{ width: 118, padding: "16px 8px 14px", borderRadius: 18, background: "#0b1220", border: "3px solid #334155", boxShadow: "0 10px 26px -8px #000", textAlign: "center", color: "#fff" }}>
              <div style={{ width: 34, height: 4, borderRadius: 4, background: "#334155", margin: "0 auto 12px" }} />
              <div style={{ fontFamily: "ui-monospace, monospace", fontWeight: 800, fontSize: 21 }}>
                <span ref={tel}>8:15:00</span>
              </div>
              <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4, fontWeight: 700 }}>hora del teléfono</div>
            </div>
          </Html>
        </>
      )}
    </group>
  );
}

function Escalera({ casoId, veredicto, elegidas, nivel, verificado, moneda, resultado, modoColor }: { casoId: CasoId; veredicto: Veredicto | null; elegidas: string[]; nivel: number; verificado: boolean; moneda: "aguila" | "sol" | null; resultado: Resultado | null; modoColor: string }) {
  const caso = CASOS.find((c) => c.id === casoId) ?? CASOS[0]!;
  const orbe = useRef<THREE.Group>(null);
  const halo = useRef<THREE.Mesh>(null);
  const portal = useRef<THREE.Mesh>(null);
  const llegaPortal = verificado && (resultado === "conocimiento" || resultado === "gettier");
  const destinoX = llegaPortal ? PORTAL_X : PASO_X(nivel);
  const destinoY = (llegaPortal ? PORTAL_H : PASO_H(nivel)) + 0.42;
  const colRes = verificado && resultado ? RESULTADO_DEF[resultado].color : veredicto ? modoColor : "#94a3b8";
  const matOrbe = useMemo(() => new THREE.MeshStandardMaterial({ color: colRes, emissive: colRes, emissiveIntensity: 1.3, roughness: 0.3 }), [colRes]);
  useEffect(() => () => matOrbe.dispose(), [matOrbe]);
  useFrame(({ clock }, dt) => {
    const g = orbe.current;
    if (g) {
      g.position.x += (destinoX - g.position.x) * suave(dt, 0.06);
      const yBase = g.position.y + (destinoY - g.position.y) * suave(dt, 0.06);
      g.position.y = yBase;
      g.children[0]?.position.set(0, Math.sin(clock.elapsedTime * 2.4) * 0.06, 0);
    }
    if (halo.current) halo.current.scale.setScalar(1 + 0.12 * Math.sin(clock.elapsedTime * 3));
    if (portal.current) {
      const m = portal.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = llegaPortal ? (resultado === "gettier" ? 0.6 + 0.5 * Math.abs(Math.sin(clock.elapsedTime * 5)) : 1.4) : 0.15;
    }
  });
  const ev = caso.evidencias.filter((e) => elegidas.includes(e.id));
  const colPortal = resultado === "gettier" ? "#c084fc" : OK;
  const lamparas: { etq: string; on: boolean | null }[] = [
    { etq: "Creencia", on: veredicto !== null },
    { etq: "Justificación", on: nivel === 3 },
    { etq: "Verdad", on: verificado && resultado ? resultado !== "falsa" && resultado !== "errorJustificado" : null },
  ];
  return (
    <group position={[0.3, -1.3, 0]}>
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[9, 64]} />
        <meshStandardMaterial color="#0f1b2d" roughness={0.9} />
      </mesh>
      {NIVELES.map((n, i) => {
        const h = PASO_H(i);
        const on = i <= nivel && veredicto !== null;
        return (
          <group key={i} position={[PASO_X(i), 0, 0]}>
            <mesh position={[0, h / 2, 0]}>
              <boxGeometry args={[1.3, h, 1.8]} />
              <meshStandardMaterial color={on ? "#4c3a8a" : "#26304a"} roughness={0.55} emissive={modoColor} emissiveIntensity={on ? 0.12 : 0} />
            </mesh>
            <mesh position={[0, h + 0.012, 0]}>
              <boxGeometry args={[1.3, 0.025, 1.8]} />
              <meshStandardMaterial color={on ? modoColor : "#3b4663"} emissive={on ? modoColor : "#000"} emissiveIntensity={on ? 0.5 : 0} />
            </mesh>
            <Etiqueta pos={[0, Math.max(0.2, h - 0.2), 0.95]} df={9} fs={10.5} col={on ? `${modoColor}aa` : undefined}>
              {i} · {n.etq}
            </Etiqueta>
          </group>
        );
      })}
      {/* Plataforma y portal del conocimiento */}
      <group position={[PORTAL_X, 0, 0]}>
        <mesh position={[0, PORTAL_H / 2, 0]}>
          <boxGeometry args={[1.5, PORTAL_H, 1.8]} />
          <meshStandardMaterial color="#1f2a44" roughness={0.5} />
        </mesh>
        <mesh ref={portal} position={[0, PORTAL_H + 0.85, -0.3]}>
          <torusGeometry args={[0.72, 0.07, 12, 48, Math.PI]} />
          <meshStandardMaterial color={llegaPortal ? colPortal : "#2c4a44"} emissive={colPortal} emissiveIntensity={0.15} />
        </mesh>
        {[-0.72, 0.72].map((x) => (
          <mesh key={x} position={[x, PORTAL_H + 0.42, -0.3]}>
            <cylinderGeometry args={[0.07, 0.07, 0.85, 10]} />
            <meshStandardMaterial color={llegaPortal ? colPortal : "#2c4a44"} emissive={colPortal} emissiveIntensity={llegaPortal ? 0.8 : 0.05} />
          </mesh>
        ))}
        <Etiqueta pos={[0, PORTAL_H + 1.85, -0.3]} df={9} fs={12} col={llegaPortal ? `${colPortal}cc` : undefined}>
          <i className="fa-solid fa-door-open" style={{ color: llegaPortal ? colPortal : "#94a3b8" }} />
          Conocimiento
        </Etiqueta>
        {/* Las tres condiciones */}
        {lamparas.map((l, k) => {
          const col = l.on ? OK : l.on === false && l.etq === "Verdad" ? NO : "#64748b";
          return (
            <group key={l.etq} position={[-1.1 + k * 1.1, PORTAL_H + 2.75, -0.6]}>
              <mesh>
                <sphereGeometry args={[0.17, 20, 16]} />
                <meshStandardMaterial color={col} emissive={col} emissiveIntensity={l.on ? 1.4 : 0.25} />
              </mesh>
              <Etiqueta pos={[0, -0.42, 0]} df={9} fs={10}>
                {l.etq}
                {l.on === null ? " ?" : ""}
              </Etiqueta>
            </group>
          );
        })}
      </group>

      {/* Bloques de razones bajo la creencia */}
      <group position={[PASO_X(nivel), PASO_H(nivel), 0.45]}>
        {ev.map((e, k) => {
          const col = e.calidad === "enganosa" ? NO : FUENTE_DEF[e.fuente].color;
          const alto = e.calidad === "solida" ? 0.2 : 0.1;
          const x = -0.45 + (k % 4) * 0.3;
          const y = alto / 2 + Math.floor(k / 4) * 0.22;
          if (e.calidad === "enganosa")
            return (
              <group key={e.id} position={[x, 0.07, 0.35]}>
                <mesh position={[-0.06, 0, 0]} rotation={[0, 0, 0.35]}>
                  <boxGeometry args={[0.12, 0.13, 0.2]} />
                  <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.4} />
                </mesh>
                <mesh position={[0.07, -0.02, 0]} rotation={[0, 0, -0.5]}>
                  <boxGeometry args={[0.12, 0.1, 0.2]} />
                  <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.4} />
                </mesh>
              </group>
            );
          return (
            <mesh key={e.id} position={[x, y, 0.35]}>
              <boxGeometry args={[0.26, alto, 0.26]} />
              <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.3} transparent opacity={e.calidad === "solida" ? 1 : 0.55} />
            </mesh>
          );
        })}
      </group>

      <group ref={orbe} position={[PASO_X(0), PASO_H(0) + 0.42, 0]}>
        <group>
          <mesh material={matOrbe}>
            <sphereGeometry args={[0.24, 28, 20]} />
          </mesh>
          <mesh ref={halo}>
            <sphereGeometry args={[0.34, 20, 16]} />
            <meshBasicMaterial color={colRes} transparent opacity={0.18} depthWrite={false} />
          </mesh>
        </group>
      </group>

      <PropCaso casoId={casoId} verificado={verificado} moneda={moneda} elegidas={elegidas} modoColor={modoColor} />
      <Etiqueta pos={[-4.5, casoId === "reloj" ? 5.05 : 2.9, 0.4]} df={10} fs={12} col={`${modoColor}aa`}>
        <i className="fa-solid fa-magnifying-glass" style={{ color: modoColor }} />«{caso.afirmacion}»
      </Etiqueta>
    </group>
  );
}

/* ── Escena ───────────────────────────────────────────────────────────── */

export default function CavernaConocimientoScene(p: CavernaSceneProps) {
  const { vista, modoColor, resetNonce } = p;
  const orbita = vista === "escalera" || (vista === "sombras" && !p.ojoPrisionero);
  const cam = useMemo((): { pos: P3; target: P3; fov: number } => {
    if (vista === "sombras") return p.ojoPrisionero ? { pos: RECORRIDO[0]!.pos, target: RECORRIDO[0]!.mira, fov: 62 } : { pos: [6.2, 6.3, 6.7], target: [-0.4, 2.3, -0.4], fov: 60 };
    if (vista === "ascenso") return { pos: RECORRIDO[0]!.pos, target: RECORRIDO[0]!.mira, fov: 62 };
    if (vista === "ames") return { pos: [0, 0, 0], target: [0, -0.12, -5], fov: 52 };
    return { pos: [1.4, 4.6, 10.6], target: [0, 0.9, 0], fov: 44 };
  }, [vista, p.ojoPrisionero]);
  const fondo = vista === "ascenso" ? "#8ec5f0" : vista === "ames" ? "#0b1220" : vista === "escalera" ? "#040a16" : "#0a0705";

  return (
    <Canvas key={`${vista}-${p.ojoPrisionero}-${resetNonce}`} dpr={[1, 1.75]} camera={{ position: cam.pos, fov: cam.fov, near: 0.03, far: 400 }} gl={{ antialias: true }}>
      <color attach="background" args={[fondo]} />
      {vista === "escalera" && (
        <>
          <fog attach="fog" args={["#040a16", 16, 34]} />
          <ambientLight intensity={0.55} />
          <directionalLight position={[4, 9, 6]} intensity={1.2} />
          <pointLight position={[-6, 3, 5]} intensity={8} color={modoColor} />
        </>
      )}

      {(vista === "sombras" || vista === "ascenso") && (
        <Caverna pose={p.pose} silueta={p.silueta} coincide={p.coincide} etiquetas={vista === "sombras" && !p.ojoPrisionero} modoColor={modoColor} exterior={vista === "ascenso"} />
      )}
      {vista === "ascenso" && <CamaraAscenso etapa={p.etapa} />}
      {vista === "sombras" && p.ojoPrisionero && <CamaraPrisionero />}
      {vista === "ames" && (
        <>
          <HabitacionAmes p={p.vistaAmes} betoX={p.betoX} regla={p.regla} modoColor={modoColor} />
          <CamaraAmes p={p.vistaAmes} />
        </>
      )}
      {vista === "escalera" && <Escalera casoId={p.casoId} veredicto={p.veredicto} elegidas={p.elegidas} nivel={p.nivel} verificado={p.verificado} moneda={p.moneda} resultado={p.resultado} modoColor={modoColor} />}

      {orbita && (
        <OrbitControls
          makeDefault
          enablePan={false}
          enableZoom
          minDistance={vista === "escalera" ? 5 : 3}
          maxDistance={vista === "escalera" ? 18 : 10.5}
          maxPolarAngle={Math.PI * 0.49}
          minPolarAngle={Math.PI * 0.08}
          target={cam.target}
        />
      )}
      <EffectComposer>
        <Bloom intensity={vista === "ascenso" ? 0.9 : 0.45} luminanceThreshold={vista === "ames" ? 0.95 : 0.6} luminanceSmoothing={0.8} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={vista === "ames" ? 0.4 : 0.62} />
      </EffectComposer>
    </Canvas>
  );
}
