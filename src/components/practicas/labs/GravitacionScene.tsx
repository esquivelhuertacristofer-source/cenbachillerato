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
import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Html, Line, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  type Modo, resolverFuerza, resolverPeso, resolverOrbita, cuerpoPorId,
  F_DEF, R_TIERRA, T_TIERRA_H, sci, fmt0, fmt1, fmt2, fmtKm,
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

/* ── Flecha en una dirección arbitraria (asta + punta) ─────────────────────── */
function Flecha({
  base, dx, dy, dz, len, color, label, grosor = 0.06, opacidad = 1,
}: {
  base: Pt; dx: number; dy: number; dz: number; len: number; color: string;
  label?: React.ReactNode; grosor?: number; opacidad?: number;
}) {
  const quat = useMemo(() => {
    const v = new THREE.Vector3(dx, dy, dz).normalize();
    return new THREE.Quaternion().setFromUnitVectors(UP, v);
  }, [dx, dy, dz]);
  if (len < 0.06) return null;
  const headLen = Math.min(0.36, len * 0.4);
  const shaftLen = Math.max(0.001, len - headLen);
  return (
    <group position={base} quaternion={quat}>
      <mesh position={[0, shaftLen / 2, 0]}>
        <cylinderGeometry args={[grosor, grosor, shaftLen, 14]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} transparent opacity={opacidad} toneMapped={false} />
      </mesh>
      <mesh position={[0, shaftLen + headLen / 2, 0]}>
        <coneGeometry args={[grosor * 2.4, headLen, 18]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} transparent opacity={opacidad} toneMapped={false} />
      </mesh>
      {label != null && (
        <Html position={[0, shaftLen + headLen + 0.34, 0]} center distanceFactor={13} pointerEvents="none">
          <div style={{
            whiteSpace: "nowrap", padding: "2px 7px", borderRadius: 7, background: "rgba(6,16,31,0.85)",
            border: `1px solid ${color}77`, color: "#fff", fontWeight: 800, fontSize: 10.5,
            fontFamily: "system-ui, sans-serif", boxShadow: "0 6px 22px rgba(0,0,0,0.45)",
          }}>{label}</div>
        </Html>
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

function Etiqueta({ position, titulo, sub, color }: { position: Pt; titulo: string; sub?: string; color: string }) {
  return (
    <Html position={position} center distanceFactor={15} pointerEvents="none">
      <div style={{
        whiteSpace: "nowrap", textAlign: "center", padding: "3px 9px", borderRadius: 8,
        background: "rgba(6,16,31,0.88)", border: `1px solid ${color}88`, color: "#fff",
        fontFamily: "system-ui, sans-serif", boxShadow: "0 6px 22px rgba(0,0,0,0.45)",
      }}>
        <div style={{ fontWeight: 800, fontSize: 11 }}>{titulo}</div>
        {sub && <div style={{ fontWeight: 700, fontSize: 10, color }}>{sub}</div>}
      </div>
    </Html>
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
  const ratio = F / F_DEF;

  const tierraX = -3.6;
  const tierraR = 1.5;
  const lunaR = 0.55;
  // la Luna se acerca/aleja con r (acotado para que siempre quepa)
  const lunaX = Math.min(8.6, Math.max(2.8, 2.6 + ratioDist(r) * 1.9));
  // largo de las flechas ∝ √(F/F_def), acotado (el número exacto va en la etiqueta)
  const L = Math.min(3.2, Math.max(0.45, 1.4 * Math.sqrt(ratio)));

  const tierraBorde = tierraX + tierraR;
  const lunaBorde = lunaX - lunaR;

  return (
    <group>
      <Tierra position={[tierraX, 0, 0]} radio={tierraR} />
      <Etiqueta position={[tierraX, tierraR + 0.7, 0]} titulo="Tierra" sub="M = 5.97×10²⁴ kg" color={C_PESO} />

      <Planeta position={[lunaX, 0, 0]} radio={lunaR} color="#c9d2dc" rough={0.95} />
      <Etiqueta position={[lunaX, lunaR + 0.7, 0]} titulo="Luna" sub="m = 7.34×10²² kg" color="#cbd5e1" />

      {/* línea de distancia centro a centro */}
      <Line points={[[tierraX, 0, 0], [lunaX, 0, 0]]} color="#ffffff" lineWidth={1} dashed dashSize={0.18} gapSize={0.14} transparent opacity={0.4} />
      <Html position={[(tierraX + lunaX) / 2, -1.05, 0]} center distanceFactor={15} pointerEvents="none">
        <div style={{ whiteSpace: "nowrap", padding: "3px 9px", borderRadius: 8, background: "rgba(6,16,31,0.85)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", fontFamily: "system-ui, sans-serif", fontWeight: 800, fontSize: 10.5 }}>
          r = {sci(r)} m
        </div>
      </Html>

      {/* fuerzas iguales y opuestas (3.ª ley de Newton) */}
      <Flecha base={[tierraBorde + 0.1, 0, 0]} dx={1} dy={0} dz={0} len={L} color={C_FUERZA} label={`F = ${sci(F)} N`} />
      <Flecha base={[lunaBorde - 0.1, 0, 0]} dx={-1} dy={0} dz={0} len={L} color={C_FUERZA} />

      <Html position={[(tierraX + lunaX) / 2, 1.9, 0]} center distanceFactor={16} pointerEvents="none">
        <div style={{ whiteSpace: "nowrap", textAlign: "center", padding: "5px 12px", borderRadius: 10, background: "rgba(4,10,22,0.9)", border: `1px solid ${C_FUERZA}aa`, color: "#fff", fontFamily: "system-ui, sans-serif", boxShadow: "0 6px 22px rgba(0,0,0,0.5)" }}>
          <div style={{ fontWeight: 900, fontSize: 12 }}>F = G·M·m / r²</div>
          <div style={{ fontWeight: 700, fontSize: 10.5, color: C_FUERZA }}>
            {ratio >= 0.999 && ratio <= 1.001 ? "valor del problema" : `${fmt1(ratio)}× la fuerza del problema`}
          </div>
        </div>
      </Html>
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
  const { W, WTierra, kgf } = resolverPeso(m, cuerpo.g);

  const bodyR = 2.6;
  const bodyCenterY = -2.4;
  const surfaceY = bodyCenterY + bodyR;   // donde se para el astronauta

  // largo de la flecha de peso ∝ W (referencia: 70 kg en la Tierra ≈ 686 N)
  const escala = (w: number) => Math.min(2.9, Math.max(0.35, 1.7 * (w / 686) + 0.22));
  const Lw = escala(W);
  const Lghost = escala(WTierra);

  return (
    <group>
      {/* cuerpo celeste como suelo */}
      <Planeta position={[0, bodyCenterY, 0]} radio={bodyR} color={cuerpo.color} rough={0.92} metal={0.05} />
      <Etiqueta position={[0, surfaceY + 1.7, 2.0]} titulo={cuerpo.nombre} sub={`g = ${fmt2(cuerpo.g)} m/s²`} color={cuerpo.color} />

      <Astronauta y={surfaceY} />

      {/* flecha de peso (hacia abajo, desde el astronauta) */}
      <Flecha base={[0, surfaceY + 0.2, 0]} dx={0} dy={-1} dz={0} len={Lw} color={C_PESO} label={`W = ${fmt1(W)} N`} grosor={0.07} />

      {/* fantasma: peso en la Tierra para comparar */}
      <Flecha base={[1.0, surfaceY + 0.2, 0]} dx={0} dy={-1} dz={0} len={Lghost} color={C_GHOST} grosor={0.05} opacidad={0.5} label={`en la Tierra: ${fmt0(WTierra)} N`} />

      <Html position={[0, surfaceY + 2.6, 0]} center distanceFactor={16} pointerEvents="none">
        <div style={{ whiteSpace: "nowrap", textAlign: "center", padding: "5px 12px", borderRadius: 10, background: "rgba(4,10,22,0.9)", border: `1px solid ${C_PESO}aa`, color: "#fff", fontFamily: "system-ui, sans-serif", boxShadow: "0 6px 22px rgba(0,0,0,0.5)" }}>
          <div style={{ fontWeight: 900, fontSize: 12 }}>W = m·g = {fmt0(m)} × {fmt2(cuerpo.g)}</div>
          <div style={{ fontWeight: 700, fontSize: 10.5, color: C_PESO }}>{fmt1(W)} N ≈ {fmt1(kgf)} kg-fuerza · masa = {fmt0(m)} kg (no cambia)</div>
        </div>
      </Html>
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
          <meshStandardMaterial color="#ffd166" emissive="#ffd166" emissiveIntensity={0.9} toneMapped={false} />
        </mesh>
      </group>
      {/* radio del punto terrestre, extendido hacia afuera para comparar dirección */}
      <Line points={[[0, 0, 0], marcaOut]} color="#ffd166" lineWidth={1.5} transparent opacity={0.6} />

      {/* órbita */}
      <Line points={orbitaEsc} color={lineaCol} lineWidth={orb.geo ? 2.6 : 1.6} transparent opacity={orb.geo ? 0.85 : 0.45} />

      {/* radio satélite (muestra alineación con el punto terrestre cuando es geo) */}
      <Line points={[[0, 0, 0], satPos]} color={lineaCol} lineWidth={1.5} dashed={!orb.geo} dashSize={0.3} gapSize={0.2} transparent opacity={0.7} />

      {/* satélite */}
      <group position={satPos}>
        <Satelite color={accent} />
        <Etiqueta position={[0, 0.7, 0]} titulo="satélite" sub={`v = ${fmt2(orb.v / 1000)} km/s`} color={accent} />
      </group>

      <Html position={[0, ringR + 1.0, 0]} center distanceFactor={20} pointerEvents="none">
        <div style={{ whiteSpace: "nowrap", textAlign: "center", padding: "5px 12px", borderRadius: 10, background: "rgba(4,10,22,0.9)", border: `1px solid ${lineaCol}cc`, color: "#fff", fontFamily: "system-ui, sans-serif", boxShadow: "0 6px 22px rgba(0,0,0,0.5)" }}>
          <div style={{ fontWeight: 900, fontSize: 12 }}>altura {fmtKm(alt)} km · T = {fmt1(orb.Th)} h</div>
          <div style={{ fontWeight: 800, fontSize: 10.5, color: lineaCol }}>
            {orb.geo ? "GEOESTACIONARIA — el satélite parece fijo (T = rotación terrestre)" : `T ${orb.Th < T_TIERRA_H ? "<" : ">"} 24 h — se desplaza por el cielo`}
          </div>
        </div>
      </Html>
    </group>
  );
}

/* ── Contenido (descendiente del Canvas) ─────────────────────────────────── */
function Contenido({ modo, r, cuerpoId, m, alt, t, accent, resetNonce }: GravitacionSceneProps) {
  return (
    <>
      <color attach="background" args={["#040a16"]} />
      <fog attach="fog" args={["#040a16", 26, 70]} />

      <ambientLight intensity={0.5} />
      <directionalLight position={[7, 9, 6]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-far={50} />
      <pointLight position={[-9, 4, 7]} intensity={0.6} color={accent} />
      <Stars radius={70} depth={30} count={1400} factor={3} saturation={0} fade speed={0.6} />

      <group key={`${modo}-${resetNonce}`}>
        {modo === "fuerza" && <EscenaFuerza r={r} />}
        {modo === "peso" && <EscenaPeso cuerpoId={cuerpoId} m={m} />}
        {modo === "orbita" && <EscenaOrbita alt={alt} t={t} accent={accent} />}
      </group>

      {modo === "peso" && (
        <ContactShadows position={[0, -0.05, 0]} opacity={0.35} scale={16} blur={2.6} far={8} />
      )}

      <Environment resolution={128}>
        <group>
          <Lightformer intensity={1.2} position={[0, 7, 8]} scale={14} color="#eaf1ff" />
          <Lightformer intensity={0.7} position={[8, 3, 5]} scale={7} color="#cfe0ff" />
          <Lightformer intensity={0.6} position={[-8, 3, 4]} scale={7} color="#dcd5ff" />
        </group>
      </Environment>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={6}
        maxDistance={40}
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={Math.PI / 1.9}
        target={[0, modo === "peso" ? 0.4 : 0, 0]}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.55} luminanceThreshold={0.55} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.45} />
      </EffectComposer>
    </>
  );
}

export default function GravitacionScene(props: GravitacionSceneProps) {
  const cam =
    props.modo === "orbita" ? { position: [0, 15, 26] as Pt, fov: 42 }
    : props.modo === "peso" ? { position: [0, 1.4, 11] as Pt, fov: 42 }
    : { position: [0, 4, 15] as Pt, fov: 42 };
  return (
    <Canvas key={props.modo} shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={cam}>
      <Contenido {...props} />
    </Canvas>
  );
}
