"use client";

/**
 * Escena 3D — "Gravitación universal: fuerza, peso y órbitas" (CNEYT-V-P03-A2).
 *
 * Tres MODOS (uno por inciso del A2), seleccionados por la prop `modo`:
 *  · "fuerza" — la Tierra y la Luna separadas por una distancia r; dos flechas
 *    iguales y opuestas (3.ª ley de Newton) cuyo largo ∝ F = G·M·m/r².
 *  · "peso"   — un astronauta de pie sobre un cuerpo seleccionable; una flecha
 *    hacia abajo de largo ∝ W = m·g y, fantasma, el peso equivalente en la Tierra.
 *  · "orbita" — un satélite recorre una órbita circular alrededor de la Tierra;
 *    un punto de la superficie gira en 24 h. Cuando el período orbital iguala la
 *    rotación terrestre (geoestacionaria), satélite y punto quedan alineados.
 *
 * Patrón R3F: el default export solo monta <Canvas> (con cámara según el modo y
 * key={modo} para remontarse al cambiar) y delega en <Contenido>.
 * React Compiler: nada de Math.random()/Date.now()/setState en render; la
 * geometría se memoiza o se deja como const. El satélite y el punto terrestre se
 * mueven porque el shell actualiza la prop `t` (rAF dentro de useEffect).
 */

import * as THREE from "three";
import { useEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Line, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Escenario } from "./_escenario";
import {
  type Modo, resolverFuerza, resolverPeso, resolverOrbita, cuerpoPorId,
  F_DEF, R_TIERRA, T_TIERRA_H, sci, fmt0, fmt1, fmt2,
} from "./gravitacion-data";

export interface GravitacionSceneProps {
  modo: Modo;
  r: number;       // (a) distancia Tierra–Luna (m)
  cuerpoId: string; // (b) cuerpo seleccionado
  m: number;       // (b) masa (kg)
  alt: number;     // (c) altura de la órbita (m)
  t: number;       // (c) tiempo de simulación (h)
  accent: string;
  resetNonce: number;
}

type Pt = [number, number, number];
const UP = new THREE.Vector3(0, 1, 0);

/* ── Colores ──────────────────────────────────────────────────────────────── */
const C_FUERZA = "#a78bfa";   // fuerza gravitacional
const C_PESO = "#7dd3fc";     // peso
const C_ORBITA = "#34D399";   // órbita / geoestacionaria
const C_GHOST = "#64748b";    // comparación (peso en la Tierra)
const TIERRA_AZUL = "#2f6fb0";
const TIERRA_VERDE = "#3f8f5f";

/* ── Etiqueta: tamaño fijo en píxeles (≥14), desplazada según el lado ────────── */
type Lado = "up" | "down" | "left" | "right";
const DESPLAZA: Record<Lado, string> = {
  up: "translate(0,-70%)",
  down: "translate(0,70%)",
  left: "translate(-62%,0)",
  right: "translate(62%,0)",
};

function Etiqueta({ position, color, children, lado = "up" }: { position: Pt; color: string; children: React.ReactNode; lado?: Lado }) {
  return (
    <Html position={position} center pointerEvents="none" zIndexRange={[20, 0]}>
      <div style={{ transform: DESPLAZA[lado] }}>
        <div style={{
          whiteSpace: "nowrap", padding: "3px 9px", borderRadius: 8, background: "rgba(4,10,22,0.88)",
          border: `1.5px solid ${color}`, color, fontWeight: 900, fontSize: 15,
          fontFamily: "system-ui, sans-serif", boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
        }}>
          {children}
        </div>
      </div>
    </Html>
  );
}

/* ── Flecha en una dirección arbitraria (asta + punta) ─────────────────────── */
function Flecha({
  base, dx, dy, dz, len, color, label, grosor = 0.06, opacidad = 1, lado = "up", encima = false,
}: {
  base: Pt; dx: number; dy: number; dz: number; len: number; color: string;
  label?: React.ReactNode; grosor?: number; opacidad?: number; lado?: Lado;
  /** Se dibuja por encima de lo demás (la flecha del peso entra en el planeta). */
  encima?: boolean;
}) {
  const quat = useMemo(() => {
    const v = new THREE.Vector3(dx, dy, dz).normalize();
    return new THREE.Quaternion().setFromUnitVectors(UP, v);
  }, [dx, dy, dz]);
  if (len < 0.06) return null;
  const headLen = Math.min(0.36, len * 0.4);
  const shaftLen = Math.max(0.001, len - headLen);
  const trans = opacidad < 1 || encima;
  return (
    <group position={base} quaternion={quat}>
      <mesh position={[0, shaftLen / 2, 0]} renderOrder={encima ? 10 : 0}>
        <cylinderGeometry args={[grosor, grosor, shaftLen, 14]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} transparent={trans} opacity={opacidad} depthTest={!encima} />
      </mesh>
      <mesh position={[0, shaftLen + headLen / 2, 0]} renderOrder={encima ? 10 : 0}>
        <coneGeometry args={[grosor * 2.4, headLen, 18]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} transparent={trans} opacity={opacidad} depthTest={!encima} />
      </mesh>
      {label != null && (
        <Etiqueta position={[0, len, 0]} color={color} lado={lado}>{label}</Etiqueta>
      )}
    </group>
  );
}

/* ── Planeta / esfera con etiqueta opcional ───────────────────────────────── */
function Planeta({
  position, radio, color, emissive = "#000000", emissiveIntensity = 0, rough = 0.85, metal = 0.1,
}: {
  position: Pt; radio: number; color: string; emissive?: string; emissiveIntensity?: number; rough?: number; metal?: number;
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <sphereGeometry args={[radio, 48, 48]} />
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={emissiveIntensity} roughness={rough} metalness={metal} />
    </mesh>
  );
}

/* ── Tierra estilizada (continentes como manchas) ─────────────────────────── */
function Tierra({ position, radio }: { position: Pt; radio: number }) {
  return (
    <group position={position}>
      <Planeta position={[0, 0, 0]} radio={radio} color={TIERRA_AZUL} rough={0.7} metal={0.05} />
      {/* manchas de "continentes" */}
      <mesh position={[radio * 0.5, radio * 0.35, radio * 0.55]}>
        <sphereGeometry args={[radio * 0.42, 18, 18]} />
        <meshStandardMaterial color={TIERRA_VERDE} roughness={0.9} />
      </mesh>
      <mesh position={[-radio * 0.55, -radio * 0.25, radio * 0.5]}>
        <sphereGeometry args={[radio * 0.34, 18, 18]} />
        <meshStandardMaterial color={TIERRA_VERDE} roughness={0.9} />
      </mesh>
      {/* atmósfera */}
      <mesh>
        <sphereGeometry args={[radio * 1.06, 32, 32]} />
        <meshStandardMaterial color="#8ec5ff" transparent opacity={0.12} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   (a) MODO FUERZA — Tierra y Luna, F = G·M·m/r²
   ════════════════════════════════════════════════════════════════════════════ */
function EscenaFuerza({ r }: { r: number }) {
  const { F } = resolverFuerza(r);
  const ancho = useThree((st) => st.size.width) >= 640;

  const tierraX = -3.6;
  const tierraR = 2.0;
  const lunaR = 0.75;
  // la Luna se acerca/aleja con r (acotado para que siempre quepa)
  const lunaX = Math.min(8.6, Math.max(2.8, 2.6 + ratioDist(r) * 1.9));
  // largo de las flechas ∝ √(F/F_def), acotado (el número exacto va en la etiqueta)
  const ratio = F / F_DEF;
  const L = Math.min(3.2, Math.max(0.45, 1.4 * Math.sqrt(ratio)));

  const tierraBorde = tierraX + tierraR;
  const lunaBorde = lunaX - lunaR;

  return (
    <group>
      <Tierra position={[tierraX, 0, 0]} radio={tierraR} />
      <Planeta position={[lunaX, 0, 0]} radio={lunaR} color="#c9d2dc" rough={0.95} />
      <Etiqueta position={[tierraX, tierraR, 0]} color={C_PESO} lado="up">Tierra</Etiqueta>
      <Etiqueta position={[lunaX, lunaR, 0]} color="#cbd5e1" lado="up">Luna</Etiqueta>

      {/* línea de distancia centro a centro */}
      <Line points={[[tierraX, 0, 0], [lunaX, 0, 0]]} color="#ffffff" lineWidth={2} dashed dashSize={0.18} gapSize={0.14} transparent opacity={0.5} />
      {ancho && <Etiqueta position={[(tierraX + lunaX) / 2, -0.2, 0]} color="#ffffff" lado="down">r = {sci(r)} m</Etiqueta>}

      {/* fuerzas iguales y opuestas (3.ª ley de Newton) */}
      <Flecha base={[tierraBorde + 0.1, 0, 0]} dx={1} dy={0} dz={0} len={L} color={C_FUERZA} label={`F = ${sci(F)} N`} lado="up" />
      <Flecha base={[lunaBorde - 0.1, 0, 0]} dx={-1} dy={0} dz={0} len={L} color={C_FUERZA} />
    </group>
  );
}

/** Distancia relativa al valor del problema (para colocar la Luna). */
function ratioDist(r: number): number {
  return r / 3.84e8;
}

/* ════════════════════════════════════════════════════════════════════════════
   (b) MODO PESO — astronauta sobre un cuerpo, W = m·g
   ════════════════════════════════════════════════════════════════════════════ */
function Astronauta({ y }: { y: number }) {
  return (
    <group position={[0, y, 0]}>
      {/* cuerpo */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <capsuleGeometry args={[0.18, 0.4, 8, 16]} />
        <meshStandardMaterial color="#eef3fa" roughness={0.6} metalness={0.1} />
      </mesh>
      {/* casco */}
      <mesh position={[0, 0.86, 0]} castShadow>
        <sphereGeometry args={[0.2, 24, 24]} />
        <meshStandardMaterial color="#cfe0f5" roughness={0.15} metalness={0.3} />
      </mesh>
      {/* visor */}
      <mesh position={[0, 0.86, 0.14]}>
        <sphereGeometry args={[0.13, 18, 18]} />
        <meshStandardMaterial color="#0c1b2c" emissive="#13314d" emissiveIntensity={0.5} roughness={0.1} metalness={0.6} />
      </mesh>
      {/* mochila */}
      <mesh position={[0, 0.46, -0.2]} castShadow>
        <boxGeometry args={[0.26, 0.34, 0.12]} />
        <meshStandardMaterial color="#dbe5f2" roughness={0.7} />
      </mesh>
    </group>
  );
}

function EscenaPeso({ cuerpoId, m }: { cuerpoId: string; m: number }) {
  const cuerpo = cuerpoPorId(cuerpoId);
  const { W, WTierra } = resolverPeso(m, cuerpo.g);

  const bodyR = 2.6;
  const bodyCenterY = -2.4;
  const surfaceY = bodyCenterY + bodyR;   // donde se para el astronauta

  // largo de la flecha de peso ∝ W (referencia: 70 kg en la Tierra ≈ 686 N)
  const escala = (w: number) => Math.min(2.9, Math.max(0.35, 1.7 * (w / 686) + 0.22));
  const Lw = escala(W);
  const Lghost = escala(WTierra);

  const ancho = useThree((st) => st.size.width) >= 640;

  return (
    <group>
      {/* cuerpo celeste como suelo */}
      <Planeta position={[0, bodyCenterY, 0]} radio={bodyR} color={cuerpo.color} rough={0.92} metal={0.05} />
      {ancho && <Etiqueta position={[-bodyR * 0.9, bodyCenterY + bodyR * 0.45, 1.6]} color={cuerpo.color} lado="left">{cuerpo.nombre}: g = {fmt2(cuerpo.g)}</Etiqueta>}

      <Astronauta y={surfaceY} />

      {/* flecha de peso (hacia abajo, hacia el centro del cuerpo) */}
      <Flecha base={[0, surfaceY + 0.2, 0.5]} dx={0} dy={-1} dz={0} len={Lw} color={C_PESO} label={`W = ${fmt1(W)} N`} grosor={0.07} lado="right" encima />

      {/* fantasma: peso en la Tierra para comparar */}
      <Flecha base={[-1.0, surfaceY + 0.2, 0.5]} dx={0} dy={-1} dz={0} len={Lghost} color={C_GHOST} grosor={0.05} opacidad={0.55} label={ancho ? `Tierra: ${fmt0(WTierra)} N` : undefined} lado="left" encima />
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   (c) MODO ÓRBITA — satélite + punto terrestre, geoestacionaria
   ════════════════════════════════════════════════════════════════════════════ */
function Satelite({ color }: { color: string }) {
  return (
    <group>
      {/* cuerpo */}
      <mesh castShadow>
        <boxGeometry args={[0.34, 0.26, 0.3]} />
        <meshStandardMaterial color="#e8eef7" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* paneles solares */}
      <mesh position={[0.55, 0, 0]}>
        <boxGeometry args={[0.7, 0.02, 0.34]} />
        <meshStandardMaterial color="#1e3a5f" emissive={color} emissiveIntensity={0.25} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[-0.55, 0, 0]}>
        <boxGeometry args={[0.7, 0.02, 0.34]} />
        <meshStandardMaterial color="#1e3a5f" emissive={color} emissiveIntensity={0.25} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* antena */}
      <mesh position={[0, 0.22, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.16, 0.18, 18, 1, true]} />
        <meshStandardMaterial color="#cfe0f5" metalness={0.3} roughness={0.4} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function EscenaOrbita({ alt, t, accent }: { alt: number; t: number; accent: string }) {
  const ancho = useThree((st) => st.size.width) >= 640;
  const orb = resolverOrbita(alt);
  const tierraR = 1.5;

  // radio de la órbita en unidades de escena (proporcional al radio real)
  const ringR = Math.min(13, tierraR * (orb.r / R_TIERRA));

  // ángulos (rad): el satélite gira con su período; el punto terrestre, en 24 h
  const angSat = (2 * Math.PI * t) / orb.Th;
  const angTierra = (2 * Math.PI * t) / T_TIERRA_H;

  const satPos: Pt = [ringR * Math.cos(angSat), 0, -ringR * Math.sin(angSat)];
  const marcaPos: Pt = [tierraR * Math.cos(angTierra), 0, -tierraR * Math.sin(angTierra)];
  const marcaOut: Pt = [(tierraR + 0.55) * Math.cos(angTierra), 0, -(tierraR + 0.55) * Math.sin(angTierra)];

  // círculo de la órbita
  const orbita: Pt[] = useMemo(() => {
    const pts: Pt[] = [];
    const n = 96;
    for (let i = 0; i <= n; i++) {
      const a = (2 * Math.PI * i) / n;
      pts.push([Math.cos(a), 0, -Math.sin(a)]);
    }
    return pts;
  }, []);
  const orbitaEsc: Pt[] = orbita.map(([x, , z]) => [x * ringR, 0, z * ringR]);

  const lineaCol = orb.geo ? C_ORBITA : "#ffffff";

  return (
    <group>
      <Tierra position={[0, 0, 0]} radio={tierraR} />

      {/* punto fijo en la superficie (antena terrestre) */}
      <group position={marcaPos}>
        <mesh>
          <sphereGeometry args={[0.12, 18, 18]} />
          <meshStandardMaterial color="#ffd166" emissive="#ffd166" emissiveIntensity={0.9} />
        </mesh>
      </group>
      {/* radio del punto terrestre, extendido hacia afuera para comparar dirección */}
      <Line points={[[0, 0, 0], marcaOut]} color="#ffd166" lineWidth={2} transparent opacity={0.6} />

      {/* órbita */}
      <Line points={orbitaEsc} color={lineaCol} lineWidth={orb.geo ? 3 : 2} transparent opacity={orb.geo ? 0.85 : 0.45} />

      {/* radio satélite (muestra alineación con el punto terrestre cuando es geo) */}
      <Line points={[[0, 0, 0], satPos]} color={lineaCol} lineWidth={2} dashed={!orb.geo} dashSize={0.3} gapSize={0.2} transparent opacity={0.7} />

      {/* satélite */}
      <group position={satPos}>
        <Satelite color={accent} />
        <Etiqueta position={[0, 0.3, 0]} color={accent} lado="up">{ancho ? `satélite · v = ${fmt2(orb.v / 1000)} km/s` : "satélite"}</Etiqueta>
      </group>

      <Etiqueta position={[0, -tierraR, 0]} color={lineaCol} lado="down">
        {orb.geo ? "GEOESTACIONARIA · T = 24 h" : `T = ${fmt1(orb.Th)} h ${orb.Th < T_TIERRA_H ? "<" : ">"} 24 h`}
      </Etiqueta>
    </group>
  );
}

/* ── Contenido (descendiente del Canvas) ─────────────────────────────────── */
function Contenido({ modo, r, cuerpoId, m, alt, t, accent, resetNonce }: GravitacionSceneProps) {
  return (
    <>
      {/* Suelo, luz de tres puntos y entorno que reflejar. */}
      {/* La altura sale de donde esta escena ya ponía su sombra de
          contacto: es donde su autor decidió que estaba el piso. */}
      <Escenario acento={accent} suelo={-0.05} mesa={false} niebla={false} />

      <Stars radius={70} depth={30} count={1400} factor={3} saturation={0} fade speed={0.6} />

      <group key={`${modo}-${resetNonce}`}>
        {modo === "fuerza" && <EscenaFuerza r={r} />}
        {modo === "peso" && <EscenaPeso cuerpoId={cuerpoId} m={m} />}
        {modo === "orbita" && <EscenaOrbita alt={alt} t={t} accent={accent} />}
      </group>



      <Encuadre modo={modo} />

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={6}
        maxDistance={44}
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={Math.PI / 1.9}
        target={OBJETIVO[modo]}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.55} luminanceThreshold={0.55} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.45} />
      </EffectComposer>
    </>
  );
}

/* ── Encuadre por modo: el contenido ≈ 60 % del alto, entre la barra y la misión.
 *    En pantallas angostas la cámara se aleja para que quepa todo el ancho. ───── */
const OBJETIVO: Record<Modo, Pt> = {
  fuerza: [1.9, 0.2, 0],
  peso: [0, -1.0, 0],
  orbita: [0, -0.4, 0],
};
const MEDIO_ANCHO: Record<Modo, number> = { fuerza: 8.6, peso: 3.8, orbita: 12 };
const Z_MIN: Record<Modo, number> = { fuerza: 13, peso: 10, orbita: 22 };

function Encuadre({ modo }: { modo: Modo }) {
  const camera = useThree((st) => st.camera);
  const size = useThree((st) => st.size);
  const aspect = size.width / Math.max(1, size.height);
  const tanV = Math.tan((42 / 2) * (Math.PI / 180));
  const z = Math.min(40, Math.max(Z_MIN[modo], MEDIO_ANCHO[modo] / (tanV * Math.min(1.8, aspect))));
  useEffect(() => {
    const o = OBJETIVO[modo];
    const alto = modo === "orbita" ? z * 0.55 : modo === "peso" ? 1.8 : 3.2;
    camera.position.set(o[0], o[1] + alto, o[2] + z);
    camera.updateProjectionMatrix();
  }, [camera, modo, z]);
  return null;
}

export default function GravitacionScene(props: GravitacionSceneProps) {
  const cam = { position: [OBJETIVO[props.modo][0], 4, 16] as Pt, fov: 42 };
  return (
    <Canvas key={props.modo} shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={cam}>
      <Contenido {...props} />
    </Canvas>
  );
}
