"use client";

/**
 * Escena 3D del laboratorio "Políticas de conservación y restauración de
 * ecosistemas en México" (CNEYT-III, progresión 11). Tres vistas:
 *
 *  - politicas: maqueta de una cuenca con ocho zonas (sierra, franja del río,
 *    selva, frontera agropecuaria, rancho, dos potreros y la bahía). Cada zona
 *    muestra su instrumento y, al simular, sus árboles crecen o desaparecen, sus
 *    aves aumentan o se van y las lanchas salen o se quedan en el muelle.
 *  - sucesion: una parcela cercada frente al bosque maduro, a la distancia que
 *    elija el alumno. Aves traen semillas; pasto, arbustos, pioneras y árboles
 *    de bosque cambian año con año; cuatro columnas miden la recuperación.
 *  - casos: el Alto Golfo con una figura por vaquita estimada, el arrecife de
 *    Cabo Pulmo con peces según la biomasa medida, y la montaña de oyamel con
 *    las colonias de mariposa monarca según las hectáreas ocupadas.
 *
 * Toda animación ocurre en useFrame mutando refs y avanza por tiempo. NO se
 * usa <Text> de drei (cuelga el chunk con Turbopack): el texto va en <Html>.
 */

import * as THREE from "three";
import { useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  type Modo,
  type InstrumentoId,
  type Zona,
  type CondicionesParcela,
  type CasoId,
  ZONAS,
  INSTRUMENTOS,
  indicadores,
  estadoParcela,
  etapaDe,
  ETAPA_DEF,
  ATRIBUTOS,
  ATRIBUTO_DEF,
  CASOS,
  valorHasta,
  textoValor,
  mulberry32,
  num,
} from "./restauracion-ecosistemas-data";

export type VistaRestauracion = Modo;

export interface RestauracionSceneProps {
  vista: VistaRestauracion;
  modoColor: string;
  resetNonce: number;
  // Plan
  plan: InstrumentoId[];
  anio: number;
  zonaSel: number;
  onZona: (k: number) => void;
  // Sucesión
  condiciones: CondicionesParcela;
  anioSuc: number;
  // Casos
  casoId: CasoId;
  hito: number;
}

type Pt = [number, number, number];

const suave = (dt: number, porCuadro: number) => 1 - Math.pow(1 - porCuadro, Math.min(dt, 0.25) * 60);
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const OCULTO = 0.0001;

function Etiqueta({ pos, children, df = 10, col, fs = 12 }: { pos: Pt; children: ReactNode; df?: number; col?: string; fs?: number }) {
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

/* ── Geometrías compartidas ───────────────────────────────────────────── */

const GEO_COPA = new THREE.IcosahedronGeometry(1, 0);
const GEO_PINO = new THREE.ConeGeometry(1, 1, 7);
const GEO_TRONCO = new THREE.CylinderGeometry(0.6, 1, 1, 6);
const GEO_AVE = new THREE.ConeGeometry(0.5, 1.6, 3);
const GEO_PASTO = new THREE.ConeGeometry(0.5, 1, 4);
const GEO_ESFERA = new THREE.SphereGeometry(1, 12, 9);
const GEO_PEZ = new THREE.SphereGeometry(1, 8, 6);
const GEO_ALA = new THREE.PlaneGeometry(1, 1);
const GEO_CAJA = new THREE.BoxGeometry(1, 1, 1);

/* ════════════════════════════════════════════════════════════════════════
 * 1. PLAN DE CONSERVACIÓN — maqueta de la cuenca
 * ════════════════════════════════════════════════════════════════════════ */

const DENSIDAD = 4.2;
const N_AVES_ZONA = 8;

interface ArbolPos {
  x: number;
  z: number;
  s: number;
}

const ARBOLES: ArbolPos[][] = ZONAS.map((z, k) => {
  if (z.tipo === "bahia") return [];
  const rnd = mulberry32(1000 + k * 97);
  const n = Math.round(z.w * z.d * DENSIDAD);
  return Array.from({ length: n }, () => ({ x: z.x + (rnd() - 0.5) * (z.w - 0.5), z: z.z + (rnd() - 0.5) * (z.d - 0.5), s: 0.75 + rnd() * 0.5 }));
});

const altoZona = (z: Zona) => (z.tipo === "sierra" ? 0.5 : 0.12);

const COL_SUELO = new THREE.Color("#a38a4a");
const COL_BOSQUE: Record<Zona["tipo"], string> = { selva: "#24502c", sierra: "#1f4a36", franja: "#2f5a2c", potrero: "#2f5a2c", rancho: "#55602e", bahia: "#0e5f7a" };
const COL_COPA: Record<Zona["tipo"], string> = { selva: "#2f8f3f", sierra: "#1d6b4a", franja: "#3a9a45", potrero: "#46a04a", rancho: "#8a9a3c", bahia: "#000" };

function ZonaTile({ z, k, instrumento, cob, bio, sel, modoColor, onZona }: { z: Zona; k: number; instrumento: InstrumentoId; cob: number; bio: number; sel: boolean; modoColor: string; onZona: (k: number) => void }) {
  const arboles = ARBOLES[k]!;
  const n = arboles.length;
  const top = altoZona(z);
  const copas = useRef<THREE.InstancedMesh>(null);
  const troncos = useRef<THREE.InstancedMesh>(null);
  const aves = useRef<THREE.InstancedMesh>(null);
  const suelo = useRef<THREE.MeshStandardMaterial>(null);
  const borde = useRef<THREE.Group>(null);
  const cobCur = useRef(z.cob0);
  const bioCur = useRef(z.bio0);
  const ultimo = useRef(-1);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const colB = useMemo(() => new THREE.Color(COL_BOSQUE[z.tipo]), [z.tipo]);
  const tmp = useMemo(() => new THREE.Color(), []);
  const pino = z.tipo === "sierra";
  const inst = INSTRUMENTOS[instrumento];

  useFrame(({ clock }, dt) => {
    cobCur.current += (cob - cobCur.current) * suave(dt, 0.09);
    bioCur.current += (bio - bioCur.current) * suave(dt, 0.09);
    if (suelo.current) suelo.current.color.copy(tmp.copy(COL_SUELO).lerp(colB, clamp(cobCur.current / 100)));
    if (borde.current) {
      const op = sel ? 0.65 + 0.3 * Math.sin(clock.elapsedTime * 4) : 0;
      borde.current.children.forEach((c) => {
        ((c as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = op;
      });
    }
    const cm = copas.current;
    const tm = troncos.current;
    if (cm && tm && Math.abs(cobCur.current - ultimo.current) > 0.02) {
      ultimo.current = cobCur.current;
      const visibles = (cobCur.current / 100) * n;
      arboles.forEach((a, i) => {
        const g = clamp(visibles - i);
        const s = a.s * (g <= 0 ? OCULTO : 0.35 + 0.65 * g);
        obj.rotation.set(0, i * 1.7, 0);
        obj.position.set(a.x, top + 0.11 * s, a.z);
        obj.scale.set(0.035 * s, 0.22 * s, 0.035 * s);
        obj.updateMatrix();
        tm.setMatrixAt(i, obj.matrix);
        if (pino) {
          obj.position.set(a.x, top + 0.2 * s + 0.26 * s, a.z);
          obj.scale.set(0.17 * s, 0.52 * s, 0.17 * s);
        } else if (z.tipo === "rancho") {
          obj.position.set(a.x, top + 0.22 * s + 0.08 * s, a.z);
          obj.scale.set(0.15 * s, 0.12 * s, 0.15 * s);
        } else {
          obj.position.set(a.x, top + 0.22 * s + 0.14 * s, a.z);
          obj.scale.set(0.2 * s, 0.2 * s, 0.2 * s);
        }
        obj.updateMatrix();
        cm.setMatrixAt(i, obj.matrix);
      });
      cm.instanceMatrix.needsUpdate = true;
      tm.instanceMatrix.needsUpdate = true;
    }
    const am = aves.current;
    if (am) {
      const vis = (bioCur.current / 100) * N_AVES_ZONA;
      const r = Math.min(z.w, z.d) * 0.33;
      for (let i = 0; i < N_AVES_ZONA; i++) {
        const t = clock.elapsedTime * (0.35 + 0.05 * i) + i * 0.8;
        const g = clamp(vis - i);
        obj.position.set(z.x + Math.cos(t) * r * (0.6 + 0.08 * i), top + 1.25 + 0.12 * Math.sin(t * 2 + i), z.z + Math.sin(t) * r * 0.7);
        obj.rotation.set(Math.PI / 2, 0, -t - Math.PI / 2);
        const e = g <= 0 ? OCULTO : 0.07 * g;
        obj.scale.set(e * (1 + 0.25 * Math.sin(clock.elapsedTime * 14 + i)), e, e * 0.3);
        obj.updateMatrix();
        am.setMatrixAt(i, obj.matrix);
      }
      am.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      <mesh
        position={[z.x, top / 2, z.z]}
        receiveShadow
        castShadow
        onClick={(e) => {
          e.stopPropagation();
          onZona(k);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "";
        }}
      >
        <boxGeometry args={[z.w, top, z.d]} />
        <meshStandardMaterial ref={suelo} color="#a38a4a" roughness={0.95} flatShading />
      </mesh>
      {/* Borde de selección */}
      <group ref={borde}>
      {(
        [
          [0, -z.d / 2, z.w, 0.06],
          [0, z.d / 2, z.w, 0.06],
          [-z.w / 2, 0, 0.06, z.d],
          [z.w / 2, 0, 0.06, z.d],
        ] as const
      ).map(([dx, dz, w, d], i) => (
        <mesh key={i} position={[z.x + dx, top + 0.03, z.z + dz]} scale={[w, 0.05, d]} geometry={GEO_CAJA}>
          <meshBasicMaterial color={modoColor} transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
      </group>
      {n > 0 && (
        <>
          <instancedMesh ref={troncos} args={[GEO_TRONCO, undefined, n]} castShadow frustumCulled={false}>
            <meshStandardMaterial color="#5b4630" roughness={0.9} />
          </instancedMesh>
          <instancedMesh ref={copas} args={[pino ? GEO_PINO : GEO_COPA, undefined, n]} castShadow frustumCulled={false}>
            <meshStandardMaterial color={COL_COPA[z.tipo]} roughness={0.8} flatShading />
          </instancedMesh>
        </>
      )}
      <instancedMesh ref={aves} args={[GEO_AVE, undefined, N_AVES_ZONA]} frustumCulled={false}>
        <meshStandardMaterial color="#f8fafc" emissive="#e0f2fe" emissiveIntensity={0.3} />
      </instancedMesh>
      {/* Bandera del instrumento */}
      {instrumento !== "ninguno" && (
        <group position={[z.x - z.w / 2 + 0.32, top, z.z - z.d / 2 + 0.32]}>
          <mesh position={[0, 0.45, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.9, 8]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.5} roughness={0.3} />
          </mesh>
          <mesh position={[0.2, 0.78, 0]}>
            <boxGeometry args={[0.4, 0.24, 0.02]} />
            <meshStandardMaterial color={inst.color} emissive={inst.color} emissiveIntensity={0.45} />
          </mesh>
        </group>
      )}
      <Html position={[z.x, top + 1.05, z.z + (z.id === "franja" ? -0.45 : z.id === "frontera" ? 0.45 : 0)]} center distanceFactor={13} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
            padding: "4px 9px",
            borderRadius: 10,
            background: sel ? "rgba(4,10,22,0.94)" : "rgba(4,10,22,0.78)",
            border: `1px solid ${sel ? modoColor : "rgba(255,255,255,0.2)"}`,
            color: "#fff",
            whiteSpace: "nowrap",
            boxShadow: "0 6px 18px -8px #000",
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 900 }}>{z.etq}</span>
          <span style={{ fontSize: 10, fontWeight: 800, color: instrumento === "ninguno" ? "#94a3b8" : inst.color }}>
            <i className={`fa-solid ${inst.icono}`} style={{ marginRight: 4 }} />
            {inst.corto}
          </span>
        </div>
      </Html>
    </group>
  );
}

const N_PECES_BAHIA = 44;
const LANCHAS_BAHIA = 4;

function Bahia({ z, instrumento, pesca }: { z: Zona; instrumento: InstrumentoId; pesca: number }) {
  const peces = useRef<THREE.InstancedMesh>(null);
  const lanchas = useRef<THREE.Group>(null);
  const pescaCur = useRef(z.cob0);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const enMuelle = instrumento === "veda" || instrumento === "anp";
  useFrame(({ clock }, dt) => {
    pescaCur.current += (pesca - pescaCur.current) * suave(dt, 0.09);
    const t = clock.elapsedTime;
    const m = peces.current;
    if (m) {
      const vis = (pescaCur.current / 100) * N_PECES_BAHIA;
      for (let i = 0; i < N_PECES_BAHIA; i++) {
        const g = clamp(vis - i);
        const cx = z.x - 5 + (i % 11) * 1.0;
        const a = t * (0.5 + (i % 5) * 0.08) + i;
        obj.position.set(cx + Math.cos(a) * 0.45, 0.0 + Math.max(0, Math.sin(t * 1.3 + i)) * 0.05, z.z + Math.sin(a) * 0.45 + ((i % 3) - 1) * 0.3);
        obj.rotation.set(0, -a, 0);
        const e = g <= 0 ? OCULTO : 0.085;
        obj.scale.set(e * 1.8, e * 0.6, e * 0.7);
        obj.updateMatrix();
        m.setMatrixAt(i, obj.matrix);
      }
      m.instanceMatrix.needsUpdate = true;
    }
    if (lanchas.current)
      lanchas.current.children.forEach((c, i) => {
        if (enMuelle) {
          c.position.set(-6.1 + i * 0.55, 0.05, z.z - z.d / 2 + 0.28);
          c.rotation.set(0, Math.PI / 2, 0);
        } else {
          const a = t * 0.12 + i * 1.6;
          c.position.set(z.x - 3 + i * 2.4 + Math.cos(a) * 0.8, 0.05 + Math.sin(t * 2 + i) * 0.02, z.z + Math.sin(a) * 0.35);
          c.rotation.set(0, -a, 0);
        }
      });
  });
  return (
    <group>
      <mesh position={[z.x, -0.05, z.z]} receiveShadow>
        <boxGeometry args={[z.w, 0.1, z.d]} />
        <meshStandardMaterial color="#0e4a61" roughness={0.3} />
      </mesh>
      <mesh position={[z.x, 0.02, z.z]}>
        <boxGeometry args={[z.w, 0.02, z.d]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.28} roughness={0.1} metalness={0.2} depthWrite={false} />
      </mesh>
      <instancedMesh ref={peces} args={[GEO_PEZ, undefined, N_PECES_BAHIA]} frustumCulled={false}>
        <meshStandardMaterial color="#fda4af" emissive="#fb7185" emissiveIntensity={0.35} />
      </instancedMesh>
      <group ref={lanchas}>
        {Array.from({ length: LANCHAS_BAHIA }, (_, i) => (
          <group key={i}>
            <mesh castShadow scale={[0.5, 0.1, 0.18]} geometry={GEO_CAJA}>
              <meshStandardMaterial color={["#f8fafc", "#fde047", "#f97316", "#60a5fa"][i]!} roughness={0.5} />
            </mesh>
            <mesh position={[0.05, 0.08, 0]} scale={[0.12, 0.08, 0.12]} geometry={GEO_CAJA}>
              <meshStandardMaterial color="#334155" />
            </mesh>
          </group>
        ))}
      </group>
      {instrumento === "anp" &&
        Array.from({ length: 7 }, (_, i) => (
          <mesh key={i} position={[z.x + 1 + i * 0.7, 0.08, z.z + 0.2]} geometry={GEO_ESFERA} scale={0.07}>
            <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={0.6} />
          </mesh>
        ))}
    </group>
  );
}

const CURVA_RIO = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-3.4, 0.56, -3.1),
  new THREE.Vector3(-2.7, 0.14, -3.55),
  new THREE.Vector3(-0.5, 0.14, -3.7),
  new THREE.Vector3(1.5, 0.14, -3.5),
  new THREE.Vector3(1.9, 0.08, -2.2),
  new THREE.Vector3(1.9, 0.08, 0),
  new THREE.Vector3(1.9, 0.06, 2.6),
]);
const GEO_RIO = new THREE.TubeGeometry(CURVA_RIO, 80, 0.09, 8, false);

/** Jaguar que cruza la franja cuando el corredor conecta la sierra con la selva. */
function Jaguar() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const f = (Math.sin(clock.elapsedTime * 0.35) + 1) / 2;
    ref.current.position.set(-5.2 + f * 9.6, 0.62, -3.15);
    ref.current.rotation.y = Math.cos(clock.elapsedTime * 0.35) > 0 ? 0 : Math.PI;
  });
  return (
    <group ref={ref} scale={1.5}>
      <mesh castShadow scale={[0.26, 0.12, 0.11]} geometry={GEO_ESFERA}>
        <meshStandardMaterial color="#d97706" roughness={0.6} />
      </mesh>
      <mesh position={[0.26, 0.05, 0]} scale={0.08} geometry={GEO_ESFERA}>
        <meshStandardMaterial color="#b45309" roughness={0.6} />
      </mesh>
    </group>
  );
}

function EscenaPoliticas({ plan, anio, zonaSel, onZona, modoColor }: { plan: InstrumentoId[]; anio: number; zonaSel: number; onZona: (k: number) => void; modoColor: string }) {
  const ind = indicadores(plan, anio);
  return (
    <group position={[0, -0.6, 0]}>
      {/* Base de la maqueta */}
      <mesh position={[0, -0.22, 0]} receiveShadow>
        <boxGeometry args={[14.4, 0.34, 9.6]} />
        <meshStandardMaterial color="#3b2f22" roughness={1} />
      </mesh>
      <mesh position={[0, -0.02, 2.4]} receiveShadow>
        <boxGeometry args={[13.8, 0.06, 0.5]} />
        <meshStandardMaterial color="#d6c28e" roughness={1} />
      </mesh>
      <mesh geometry={GEO_RIO}>
        <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={0.35} roughness={0.2} />
      </mesh>
      {/* Manantial */}
      <mesh position={[-3.4, 0.58, -3.1]} scale={0.14} geometry={GEO_ESFERA}>
        <meshStandardMaterial color="#67e8f9" emissive="#22d3ee" emissiveIntensity={0.9} />
      </mesh>
      {ZONAS.map((z, k) =>
        z.tipo === "bahia" ? (
          <group key={z.id}>
            <Bahia z={z} instrumento={plan[k] ?? "ninguno"} pesca={ind.zonas[k]!.cob} />
            <mesh
              position={[z.x, 0.05, z.z]}
              onClick={(e) => {
                e.stopPropagation();
                onZona(k);
              }}
            >
              <boxGeometry args={[z.w, 0.1, z.d]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
            <Html position={[z.x + 4.6, 0.7, z.z]} center distanceFactor={13} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "4px 9px", borderRadius: 10, background: zonaSel === k ? "rgba(4,10,22,0.94)" : "rgba(4,10,22,0.78)", border: `1px solid ${zonaSel === k ? modoColor : "rgba(255,255,255,0.2)"}`, color: "#fff", whiteSpace: "nowrap" }}>
                <span style={{ fontSize: 11, fontWeight: 900 }}>{z.etq}</span>
                <span style={{ fontSize: 10, fontWeight: 800, color: (plan[k] ?? "ninguno") === "ninguno" ? "#94a3b8" : INSTRUMENTOS[plan[k]!].color }}>
                  <i className={`fa-solid ${INSTRUMENTOS[plan[k] ?? "ninguno"].icono}`} style={{ marginRight: 4 }} />
                  {INSTRUMENTOS[plan[k] ?? "ninguno"].corto}
                </span>
              </div>
            </Html>
          </group>
        ) : (
          <ZonaTile key={z.id} z={z} k={k} instrumento={plan[k] ?? "ninguno"} cob={ind.zonas[k]!.cob} bio={ind.zonas[k]!.bio} sel={zonaSel === k} modoColor={modoColor} onZona={onZona} />
        ),
      )}
      {/* Pueblo en la costa */}
      {Array.from({ length: 6 }, (_, i) => (
        <group key={i} position={[-1.5 + i * 0.55, 0.02, 2.4 + ((i % 2) - 0.5) * 0.12]}>
          <mesh castShadow position={[0, 0.1, 0]} scale={[0.26, 0.2, 0.22]} geometry={GEO_CAJA}>
            <meshStandardMaterial color={["#fef3c7", "#fde68a", "#fecaca", "#e0f2fe"][i % 4]!} roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.27, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[0.2, 0.16, 4]} />
            <meshStandardMaterial color="#b45309" roughness={0.7} />
          </mesh>
        </group>
      ))}
      <Etiqueta pos={[-0.1, 0.72, 2.45]} df={13} fs={10.5} col={ind.comunidades >= 80 ? "#34d399aa" : ind.comunidades < 50 ? "#f87171aa" : "#fbbf24aa"}>
        <i className="fa-solid fa-people-roof" style={{ color: "#fbbf24" }} />
        Pueblo · bienestar {num(ind.comunidades)}
      </Etiqueta>
      {ind.conectado && (
        <>
          <mesh position={[-0.5, 0.2, -3.2]} scale={[13.8, 0.03, 0.5]} geometry={GEO_CAJA}>
            <meshStandardMaterial color="#a78bfa" emissive="#8b5cf6" emissiveIntensity={0.7} transparent opacity={0.55} depthWrite={false} />
          </mesh>
          <Jaguar />
        </>
      )}
      {!ind.conectado && (plan[1] ?? "ninguno") === "ninguno" && anio > 0 && (
        <Etiqueta pos={[-0.5, 1.2, -3.9]} df={13} fs={10} col="#f87171aa">
          <i className="fa-solid fa-link-slash" style={{ color: "#f87171" }} />
          Sierra y selva aisladas
        </Etiqueta>
      )}
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. RESTAURAR UNA PARCELA — sucesión secundaria
 * ════════════════════════════════════════════════════════════════════════ */

const LADO = 7;
const N_PASTO = 170;
const N_ARBUSTOS = 60;
const N_PIONERAS = 24;
const N_MADUROS = 20;
const N_BOSQUE = 64;
const N_AVES_SUC = 22;
const N_LLAMAS = 10;

function puntosParcela(n: number, semilla: number): { x: number; z: number; s: number }[] {
  const rnd = mulberry32(semilla);
  return Array.from({ length: n }, () => ({ x: (rnd() - 0.5) * (LADO - 0.6), z: (rnd() - 0.5) * (LADO - 0.6), s: 0.7 + rnd() * 0.6 }));
}

const P_PASTO = puntosParcela(N_PASTO, 11);
const P_ARBUSTOS = puntosParcela(N_ARBUSTOS, 23);
const P_PIONERAS = puntosParcela(N_PIONERAS, 37);
const P_MADUROS = puntosParcela(N_MADUROS, 41);
const P_LLAMAS = puntosParcela(N_LLAMAS, 53);

/** Plantación en hileras (restauración activa). */
const P_HILERAS = (n: number, desfase: number) =>
  Array.from({ length: n }, (_, i) => {
    const cols = Math.ceil(Math.sqrt(n));
    const c = i % cols;
    const f = Math.floor(i / cols);
    return { x: -LADO / 2 + 0.7 + ((c + desfase) * (LADO - 1.4)) / cols, z: -LADO / 2 + 0.7 + ((f + desfase) * (LADO - 1.4)) / cols, s: 0.9 + ((i * 7) % 5) * 0.05 };
  });

/** Nucleación: cinco islas de árboles. */
const ISLAS: [number, number][] = [
  [-2, -2],
  [2, -1.6],
  [0, 0.4],
  [-2.2, 2],
  [2.1, 2.2],
];
const P_ISLAS = (n: number, semilla: number) => {
  const rnd = mulberry32(semilla);
  return Array.from({ length: n }, (_, i) => {
    const [cx, cz] = ISLAS[i % ISLAS.length]!;
    const a = rnd() * Math.PI * 2;
    const r = 0.2 + rnd() * 0.55;
    return { x: cx + Math.cos(a) * r, z: cz + Math.sin(a) * r, s: 0.7 + rnd() * 0.6 };
  });
};

const ETIQUETA_CORTA: Record<(typeof ATRIBUTOS)[number], string> = { suelo: "Suelo", riqueza: "Riqueza", biomasa: "Biomasa", composicion: "Composición" };

const distUnidades = (d: number) => 0.8 + ((d - 50) / 2950) * 15;

const P_BOSQUE = (() => {
  const rnd = mulberry32(77);
  return Array.from({ length: N_BOSQUE }, (_, i) => ({ x: -11 + (i % 16) * 1.45 + (rnd() - 0.5) * 0.6, z: -Math.floor(i / 16) * 1.2 - rnd() * 0.5, s: 0.85 + rnd() * 0.5 }));
})();

function EscenaSucesion({ condiciones, anio, modoColor }: { condiciones: CondicionesParcela; anio: number; modoColor: string }) {
  const c = condiciones;
  const pasto = useRef<THREE.InstancedMesh>(null);
  const arbustos = useRef<THREE.InstancedMesh>(null);
  const pioT = useRef<THREE.InstancedMesh>(null);
  const pioC = useRef<THREE.InstancedMesh>(null);
  const madT = useRef<THREE.InstancedMesh>(null);
  const madC = useRef<THREE.InstancedMesh>(null);
  const aves = useRef<THREE.InstancedMesh>(null);
  const llamas = useRef<THREE.InstancedMesh>(null);
  const vacas = useRef<THREE.Group>(null);
  const suelo = useRef<THREE.MeshStandardMaterial>(null);
  const barras = useRef<THREE.Group>(null);
  const lecturas = useRef<(HTMLSpanElement | null)[]>([]);
  const chipAnio = useRef<HTMLSpanElement>(null);
  const bosqueT = useRef<THREE.InstancedMesh>(null);
  const bosqueC = useRef<THREE.InstancedMesh>(null);
  const bosqueG = useRef<THREE.Group>(null);
  const anioCur = useRef(anio);
  const distCur = useRef(distUnidades(c.distancia));
  const obj = useMemo(() => new THREE.Object3D(), []);
  const tmp = useMemo(() => new THREE.Color(), []);
  const colPaja = useMemo(() => new THREE.Color("#b89a4e"), []);
  const colSelva = useMemo(() => new THREE.Color("#2b4424"), []);
  const colQuemado = useMemo(() => new THREE.Color("#3f3a33"), []);
  const posPio = useMemo(() => (c.estrategia === "activa" ? P_HILERAS(N_PIONERAS, 0) : c.estrategia === "nucleacion" ? P_ISLAS(N_PIONERAS, 5) : P_PIONERAS), [c.estrategia]);
  const posMad = useMemo(() => (c.estrategia === "activa" ? P_HILERAS(N_MADUROS, 0.5) : c.estrategia === "nucleacion" ? P_ISLAS(N_MADUROS, 9) : P_MADUROS), [c.estrategia]);
  const plantado = c.estrategia === "activa" || c.estrategia === "nucleacion";

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    anioCur.current += (anio - anioCur.current) * suave(dt, 0.12);
    distCur.current += (distUnidades(c.distancia) - distCur.current) * suave(dt, 0.1);
    const e = estadoParcela(c, anioCur.current);
    const b = e.biomasa;
    if (bosqueG.current) bosqueG.current.position.z = -LADO / 2 - distCur.current;
    if (suelo.current) {
      tmp.copy(colPaja).lerp(colSelva, clamp(b * 1.5));
      if (c.fuego) tmp.lerp(colQuemado, 0.35);
      suelo.current.color.copy(tmp);
    }
    // Pasto: se va cuando cierra el dosel.
    const pm = pasto.current;
    if (pm) {
      const queda = c.estrategia === "ganado" ? 0.55 : 1 - clamp(b * 1.8);
      P_PASTO.forEach((p, i) => {
        const g = clamp(queda * N_PASTO - i);
        obj.position.set(p.x, 0.08 * p.s, p.z);
        obj.rotation.set(0, i, Math.sin(t * 1.5 + i) * 0.08);
        const s = g <= 0 ? OCULTO : g * p.s;
        obj.scale.set(0.09 * s, 0.26 * s, 0.09 * s);
        obj.updateMatrix();
        pm.setMatrixAt(i, obj.matrix);
      });
      pm.instanceMatrix.needsUpdate = true;
    }
    // Arbustos: llegan primero y ceden terreno a los árboles.
    const am = arbustos.current;
    if (am) {
      const frac = clamp((b - 0.015) / 0.18) * (1 - 0.55 * clamp((b - 0.55) / 0.4));
      P_ARBUSTOS.forEach((p, i) => {
        const g = clamp(frac * N_ARBUSTOS - i);
        obj.position.set(p.x, 0.16 * p.s * g, p.z);
        obj.rotation.set(0, i, 0);
        const s = g <= 0 ? OCULTO : g * p.s;
        obj.scale.set(0.24 * s, 0.2 * s, 0.24 * s);
        obj.updateMatrix();
        am.setMatrixAt(i, obj.matrix);
      });
      am.instanceMatrix.needsUpdate = true;
    }
    // Pioneras (guarumbo): crecen rápido y luego mueren bajo el dosel.
    const ptm = pioT.current;
    const pcm = pioC.current;
    if (ptm && pcm) {
      const base = plantado ? 0.25 : 0;
      const frac = Math.max(base, clamp((b - 0.04) / 0.2)) * (1 - 0.75 * clamp((b - 0.5) / 0.4));
      const alto = 0.35 + 1.3 * clamp(b * 2.2);
      posPio.forEach((p, i) => {
        const g = clamp(frac * N_PIONERAS - i);
        const h = g <= 0 ? OCULTO : alto * p.s * (0.4 + 0.6 * g);
        obj.rotation.set(0, i, 0);
        obj.position.set(p.x, h / 2, p.z);
        obj.scale.set(0.03, h, 0.03);
        obj.updateMatrix();
        ptm.setMatrixAt(i, obj.matrix);
        obj.position.set(p.x, h, p.z);
        const r = g <= 0 ? OCULTO : 0.32 * p.s * (0.5 + 0.5 * g);
        obj.scale.set(r, r * 0.28, r);
        obj.updateMatrix();
        pcm.setMatrixAt(i, obj.matrix);
      });
      ptm.instanceMatrix.needsUpdate = true;
      pcm.instanceMatrix.needsUpdate = true;
    }
    // Árboles de bosque: tardan en llegar y crecen con la biomasa.
    const mtm = madT.current;
    const mcm = madC.current;
    if (mtm && mcm) {
      const base = c.estrategia === "activa" ? 0.3 : c.estrategia === "nucleacion" ? 0.15 : 0;
      const frac = Math.max(base, clamp((b - 0.12) / 0.55));
      const alto = 0.25 + 2.3 * clamp(b);
      posMad.forEach((p, i) => {
        const g = clamp(frac * N_MADUROS - i);
        const h = g <= 0 ? OCULTO : alto * p.s * (0.5 + 0.5 * g);
        obj.rotation.set(0, i, 0);
        obj.position.set(p.x, h * 0.35, p.z);
        obj.scale.set(0.05 + 0.06 * b, h * 0.7, 0.05 + 0.06 * b);
        obj.updateMatrix();
        mtm.setMatrixAt(i, obj.matrix);
        obj.position.set(p.x, h * 0.78, p.z);
        const r = g <= 0 ? OCULTO : (0.18 + 0.6 * b) * p.s;
        obj.scale.set(r, r * 0.8, r);
        obj.updateMatrix();
        mcm.setMatrixAt(i, obj.matrix);
      });
      mtm.instanceMatrix.needsUpdate = true;
      mcm.instanceMatrix.needsUpdate = true;
    }
    // Aves con semillas: del bosque a la parcela; menos cuanto más lejos.
    const vm = aves.current;
    if (vm) {
      const vis = (c.estrategia === "ganado" ? e.semillas * 0.3 : e.semillas) * N_AVES_SUC;
      const zb = -LADO / 2 - distCur.current;
      for (let i = 0; i < N_AVES_SUC; i++) {
        const f = (t * (0.12 + 0.01 * (i % 4)) + i * 0.137) % 1;
        const ida = Math.sin(f * Math.PI);
        const x = -3 + ((i * 7) % 13) * 0.5;
        obj.position.set(x + Math.sin(t + i) * 0.3, 1.2 + ida * 1.4, zb + (0 - zb) * f);
        obj.rotation.set(Math.PI / 2, 0, Math.PI);
        const g = clamp(vis - i);
        const s = g <= 0 ? OCULTO : 0.09;
        obj.scale.set(s * (1 + 0.3 * Math.sin(t * 16 + i)), s, s * 0.3);
        obj.updateMatrix();
        vm.setMatrixAt(i, obj.matrix);
      }
      vm.instanceMatrix.needsUpdate = true;
    }
    const lm = llamas.current;
    if (lm) {
      // Una quema cada cinco años simulados; entre quemas, brasas apagadas.
      const fase = (anioCur.current % 5) / 5;
      const ardiendo = c.fuego && anio > 0 && fase < 0.5;
      P_LLAMAS.forEach((p, i) => {
        const s = ardiendo ? (0.5 + 0.5 * Math.sin(t * 12 + i * 2)) * 0.35 + 0.35 : OCULTO;
        obj.position.set(p.x, s * 0.5, p.z);
        obj.rotation.set(0, 0, 0);
        obj.scale.set(s * 0.5, s * 1.6, s * 0.5);
        obj.updateMatrix();
        lm.setMatrixAt(i, obj.matrix);
      });
      lm.instanceMatrix.needsUpdate = true;
    }
    if (vacas.current)
      vacas.current.children.forEach((v, i) => {
        const a = t * 0.08 + i * 2.1;
        v.position.set(Math.cos(a) * (1.4 + i * 0.6), 0, Math.sin(a * 1.3) * (1.2 + i * 0.5));
        v.rotation.y = -a * 1.3;
      });
    if (barras.current)
      barras.current.children.forEach((g, i) => {
        const a = ATRIBUTOS[i]!;
        const v = clamp(e[a]);
        const barra = g.children[1];
        if (barra) {
          barra.scale.y = Math.max(0.01, v * 2.4);
          barra.position.y = 0.12 + (v * 2.4) / 2;
        }
        const span = lecturas.current[i];
        if (span) span.textContent = `${num(v * 100)} %`;
      });
    if (chipAnio.current) chipAnio.current.textContent = `Año ${num(anioCur.current)} · ${ETAPA_DEF[etapaDe(b)].etq}`;
    if (bosqueT.current && bosqueC.current && bosqueT.current.userData.listo !== true) {
      P_BOSQUE.forEach((p, i) => {
        const h = 2.6 * p.s;
        obj.rotation.set(0, i, 0);
        obj.position.set(p.x, h * 0.35, p.z);
        obj.scale.set(0.11, h * 0.7, 0.11);
        obj.updateMatrix();
        bosqueT.current!.setMatrixAt(i, obj.matrix);
        obj.position.set(p.x, h * 0.8, p.z);
        obj.scale.set(0.75 * p.s, 0.62 * p.s, 0.75 * p.s);
        obj.updateMatrix();
        bosqueC.current!.setMatrixAt(i, obj.matrix);
      });
      bosqueT.current.instanceMatrix.needsUpdate = true;
      bosqueC.current.instanceMatrix.needsUpdate = true;
      bosqueT.current.userData.listo = true;
    }
  });

  const postes = useMemo(() => {
    const out: Pt[] = [];
    for (let i = 0; i <= 7; i++) {
      const u = -LADO / 2 + (i * LADO) / 7;
      out.push([u, 0, -LADO / 2], [u, 0, LADO / 2]);
      if (i > 0 && i < 7) out.push([-LADO / 2, 0, u], [LADO / 2, 0, u]);
    }
    return out;
  }, []);

  return (
    <group position={[0, -0.9, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, -8]} receiveShadow>
        <planeGeometry args={[46, 40]} />
        <meshStandardMaterial color="#6b6a36" roughness={1} />
      </mesh>
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[LADO, LADO]} />
        <meshStandardMaterial ref={suelo} color="#b89a4e" roughness={1} />
      </mesh>
      {c.estrategia !== "ganado" &&
        postes.map((p, i) => (
          <mesh key={i} position={[p[0], 0.28, p[2]]} castShadow scale={[0.06, 0.56, 0.06]} geometry={GEO_CAJA}>
            <meshStandardMaterial color="#78583a" roughness={0.9} />
          </mesh>
        ))}
      {c.estrategia !== "ganado" &&
        [0.22, 0.42].map((y) =>
          (
            [
              [0, -LADO / 2, LADO, 0.012],
              [0, LADO / 2, LADO, 0.012],
              [-LADO / 2, 0, 0.012, LADO],
              [LADO / 2, 0, 0.012, LADO],
            ] as const
          ).map(([x, z, w, d], i) => (
            <mesh key={`${y}-${i}`} position={[x, y, z]} scale={[w, 0.012, d]} geometry={GEO_CAJA}>
              <meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.4} />
            </mesh>
          )),
        )}
      <instancedMesh ref={pasto} args={[GEO_PASTO, undefined, N_PASTO]} frustumCulled={false}>
        <meshStandardMaterial color="#c9b458" roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={arbustos} args={[GEO_COPA, undefined, N_ARBUSTOS]} castShadow frustumCulled={false}>
        <meshStandardMaterial color="#6aa83b" roughness={0.85} flatShading />
      </instancedMesh>
      <instancedMesh ref={pioT} args={[GEO_TRONCO, undefined, N_PIONERAS]} frustumCulled={false}>
        <meshStandardMaterial color="#cbd5c0" roughness={0.7} />
      </instancedMesh>
      <instancedMesh key={`pio-${c.estrategia}`} ref={pioC} args={[GEO_ESFERA, undefined, N_PIONERAS]} castShadow frustumCulled={false}>
        <meshStandardMaterial color="#9ccf5a" roughness={0.8} flatShading />
      </instancedMesh>
      <instancedMesh ref={madT} args={[GEO_TRONCO, undefined, N_MADUROS]} castShadow frustumCulled={false}>
        <meshStandardMaterial color="#5b4630" roughness={0.9} />
      </instancedMesh>
      <instancedMesh key={`mad-${c.estrategia}`} ref={madC} args={[GEO_COPA, undefined, N_MADUROS]} castShadow frustumCulled={false}>
        <meshStandardMaterial color="#2f7d3a" roughness={0.8} flatShading />
      </instancedMesh>
      <instancedMesh ref={aves} args={[GEO_AVE, undefined, N_AVES_SUC]} frustumCulled={false}>
        <meshStandardMaterial color="#1e293b" />
      </instancedMesh>
      <instancedMesh ref={llamas} args={[GEO_PASTO, undefined, N_LLAMAS]} frustumCulled={false}>
        <meshBasicMaterial color="#fb923c" transparent opacity={0.85} depthWrite={false} />
      </instancedMesh>
      {c.estrategia === "ganado" && (
        <group ref={vacas}>
          {[0, 1, 2].map((i) => (
            <group key={i}>
              <mesh position={[0, 0.3, 0]} castShadow scale={[0.55, 0.28, 0.26]} geometry={GEO_CAJA}>
                <meshStandardMaterial color={i === 1 ? "#f5f5f4" : "#7c4a2d"} roughness={0.8} />
              </mesh>
              <mesh position={[0.34, 0.38, 0]} scale={[0.16, 0.16, 0.15]} geometry={GEO_CAJA}>
                <meshStandardMaterial color="#44403c" roughness={0.8} />
              </mesh>
              {[-0.18, 0.18].map((x) =>
                [-0.08, 0.08].map((z) => (
                  <mesh key={`${x}${z}`} position={[x, 0.08, z]} scale={[0.05, 0.16, 0.05]} geometry={GEO_CAJA}>
                    <meshStandardMaterial color="#292524" />
                  </mesh>
                )),
              )}
            </group>
          ))}
        </group>
      )}
      {/* Bosque maduro remanente, a la distancia elegida */}
      <group ref={bosqueG} position={[0, 0, -LADO / 2 - distUnidades(c.distancia)]}>
        <instancedMesh ref={bosqueT} args={[GEO_TRONCO, undefined, N_BOSQUE]} frustumCulled={false}>
          <meshStandardMaterial color="#4a3a28" roughness={0.9} />
        </instancedMesh>
        <instancedMesh ref={bosqueC} args={[GEO_COPA, undefined, N_BOSQUE]} castShadow frustumCulled={false}>
          <meshStandardMaterial color="#1f5e2c" roughness={0.8} flatShading />
        </instancedMesh>
        <Etiqueta pos={[0, 3.6, 0]} df={20} col="#22c55eaa" fs={11}>
          <i className="fa-solid fa-tree" style={{ color: "#4ade80" }} />
          Bosque maduro · a {num(c.distancia)} m
        </Etiqueta>
      </group>
      {/* Columnas de recuperación */}
      <group ref={barras} position={[LADO / 2 + 1.3, 0, -1.9]}>
        {ATRIBUTOS.map((a, i) => (
          <group key={a} position={[0, 0, i * 1.25]}>
            <mesh position={[0, 0.06, 0]} scale={[0.6, 0.12, 0.6]} geometry={GEO_CAJA}>
              <meshStandardMaterial color="#1e293b" />
            </mesh>
            <mesh position={[0, 0.2, 0]} scale={[0.4, 0.01, 0.4]} geometry={GEO_CAJA}>
              <meshStandardMaterial color={ATRIBUTO_DEF[a].color} emissive={ATRIBUTO_DEF[a].color} emissiveIntensity={0.35} roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.12 + 1.2, 0]} scale={[0.5, 2.4, 0.5]} geometry={GEO_CAJA}>
              <meshStandardMaterial color="#e2e8f0" transparent opacity={0.12} roughness={0.1} depthWrite={false} />
            </mesh>
            <Html position={[0.62, 0.35, 0.05]} distanceFactor={12} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
              <div style={{ padding: "2px 7px", borderRadius: 7, background: "rgba(4,10,22,0.86)", border: `1px solid ${ATRIBUTO_DEF[a].color}`, color: "#fff", fontSize: 10, fontWeight: 900, whiteSpace: "nowrap" }}>
                <i className={`fa-solid ${ATRIBUTO_DEF[a].icono}`} style={{ marginRight: 5, color: ATRIBUTO_DEF[a].color }} />
                {ETIQUETA_CORTA[a]}{" "}
                <span
                  ref={(el) => {
                    lecturas.current[i] = el;
                  }}
                >
                  0 %
                </span>
              </div>
            </Html>
          </group>
        ))}
      </group>
      <Etiqueta pos={[LADO / 2 + 1.3, 3.25, 0]} df={12} fs={10}>
        100 % = bosque maduro
      </Etiqueta>
      <Etiqueta pos={[0, 3.2, 0]} df={11} col={`${modoColor}aa`} fs={14}>
        <i className="fa-solid fa-calendar" style={{ color: modoColor }} />
        <span ref={chipAnio}>Año 0</span>
      </Etiqueta>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. CASOS DE MÉXICO
 * ════════════════════════════════════════════════════════════════════════ */

const N_VAQUITAS = 567;
/** Lanchas en la escena, por hito: ilustrativo (no son conteos). */
const LANCHAS_VAQUITA = [5, 6, 8, 7, 9, 5, 8, 6, 6, 3, 2, 2];

const P_VAQUITAS = (() => {
  const rnd = mulberry32(2024);
  const pts = Array.from({ length: N_VAQUITAS }, () => {
    const a = rnd() * Math.PI * 2;
    const r = Math.sqrt(rnd());
    return { x: -0.3 + Math.cos(a) * r * 5.2, z: -2.2 + Math.sin(a) * r * 3.6, fase: rnd() * 6.28 };
  });
  // Las que quedan al final están en la zona más protegida (al noroeste).
  return pts.sort((p, q) => Math.hypot(p.x + 1.6, p.z + 4) - Math.hypot(q.x + 1.6, q.z + 4));
})();

function EscenaVaquita({ hito, modoColor }: { hito: number; modoColor: string }) {
  const caso = CASOS[0]!;
  const v = valorHasta(caso, hito);
  const vaq = useRef<THREE.InstancedMesh>(null);
  const lanchas = useRef<THREE.Group>(null);
  const cuenta = useRef(v.valor);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const nLanchas = LANCHAS_VAQUITA[Math.min(hito, LANCHAS_VAQUITA.length - 1)]!;
  const h = caso.hitos[hito]!;
  const refugio = caso.hitos.slice(0, hito + 1).some((x) => x.anio === "2005");
  const ztc = caso.hitos.slice(0, hito + 1).some((x) => x.anio === "2020");
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    cuenta.current += (v.valor - cuenta.current) * suave(dt, 0.05);
    const m = vaq.current;
    if (m) {
      const vis = cuenta.current;
      P_VAQUITAS.forEach((p, i) => {
        const g = clamp(vis - i);
        const sube = Math.max(0, Math.sin(t * 0.9 + p.fase));
        obj.position.set(p.x + Math.cos(t * 0.1 + p.fase) * 0.2, -0.04 + sube * 0.06, p.z + Math.sin(t * 0.12 + p.fase) * 0.15);
        obj.rotation.set(0, p.fase + t * 0.1, sube * 0.4);
        const s = g <= 0 ? OCULTO : 0.085 * (v.medido ? 1 : 0.8);
        obj.scale.set(s * 1.6, s * 0.55, s * 0.6);
        obj.updateMatrix();
        m.setMatrixAt(i, obj.matrix);
      });
      m.instanceMatrix.needsUpdate = true;
    }
    if (lanchas.current)
      lanchas.current.children.forEach((c, i) => {
        c.visible = i < nLanchas;
        const a = t * 0.05 + i * 0.9;
        c.position.set(-4 + (i % 5) * 2 + Math.cos(a) * 0.5, 0.06 + Math.sin(t * 1.8 + i) * 0.02, -1.5 + (i % 3) * 1.6 + Math.sin(a) * 0.4);
        c.rotation.y = i * 0.7;
      });
  });
  return (
    <group position={[0, -0.8, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[30, 22]} />
        <meshStandardMaterial color="#0f5a73" roughness={0.25} metalness={0.2} />
      </mesh>
      {/* Baja California, Sonora y el delta del Colorado */}
      <mesh position={[-10.2, 0.12, -3.2]} rotation={[0, 0.22, 0]} receiveShadow>
        <boxGeometry args={[8, 0.3, 14]} />
        <meshStandardMaterial color="#c9a974" roughness={1} flatShading />
      </mesh>
      <mesh position={[10, 0.12, -3.2]} rotation={[0, -0.22, 0]} receiveShadow>
        <boxGeometry args={[8, 0.3, 14]} />
        <meshStandardMaterial color="#c2a06a" roughness={1} flatShading />
      </mesh>
      <mesh position={[0, 0.1, -9.4]} receiveShadow>
        <boxGeometry args={[14, 0.25, 5]} />
        <meshStandardMaterial color="#8f8457" roughness={1} flatShading />
      </mesh>
      <Etiqueta pos={[-7.4, 0.7, -1.5]} df={13} fs={10}>
        Baja California
      </Etiqueta>
      <Etiqueta pos={[7.2, 0.7, -1.5]} df={13} fs={10}>
        Sonora
      </Etiqueta>
      <Etiqueta pos={[0, 0.9, -7.2]} df={13} fs={10}>
        Delta del río Colorado
      </Etiqueta>
      {refugio && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.3, 0.01, -2.2]} scale={[5.4, 3.8, 1]}>
          <ringGeometry args={[0.97, 1, 72]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.7} />
        </mesh>
      )}
      {ztc && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1.6, 0.012, -4]} scale={[1.7, 1.1, 1]}>
          <ringGeometry args={[0.93, 1, 48]} />
          <meshBasicMaterial color="#facc15" transparent opacity={0.9} />
        </mesh>
      )}
      <instancedMesh ref={vaq} args={[GEO_ESFERA, undefined, N_VAQUITAS]} frustumCulled={false}>
        <meshStandardMaterial color="#9ca3af" roughness={0.45} emissive="#475569" emissiveIntensity={0.25} />
      </instancedMesh>
      <group ref={lanchas}>
        {LANCHAS_VAQUITA.map((_, i) =>
          i < 10 ? (
            <group key={i}>
              <mesh castShadow scale={[0.55, 0.12, 0.2]} geometry={GEO_CAJA}>
                <meshStandardMaterial color={i % 2 ? "#f8fafc" : "#fcd34d"} roughness={0.5} />
              </mesh>
              {Array.from({ length: 6 }, (_, k) => (
                <mesh key={k} position={[-0.45 - k * 0.22, -0.02, 0]} scale={0.035} geometry={GEO_ESFERA}>
                  <meshBasicMaterial color="#f97316" />
                </mesh>
              ))}
            </group>
          ) : null,
        )}
      </group>
      {refugio && (
        <Etiqueta pos={[3.6, 0.5, -0.4]} df={13} fs={10} col="#22d3eeaa">
          Área de refugio
        </Etiqueta>
      )}
      {ztc && (
        <Etiqueta pos={[-1.6, 0.5, -5.4]} df={13} fs={10} col="#facc15aa">
          Zona de Tolerancia Cero
        </Etiqueta>
      )}
      <Etiqueta pos={[0, 2.4, -2]} df={11} col={`${modoColor}aa`} fs={14}>
        <i className="fa-solid fa-fish-fins" style={{ color: modoColor }} />
        {h.anio} · {v.medido ? textoValor(caso, hito) : "sin censo: el primero es de 1997"}
      </Etiqueta>
      <Etiqueta pos={[0, 0.2, 2.6]} df={12} fs={10}>
        Cada figura gris es una vaquita estimada · las lanchas con red son ilustrativas
      </Etiqueta>
    </group>
  );
}

const N_PECES_MAX = 180;
const N_CORALES = 34;

function Arrecife({ x, peces, depred, etq, valor, col }: { x: number; peces: number; depred: number; etq: string; valor: string; col: string }) {
  const pm = useRef<THREE.InstancedMesh>(null);
  const dm = useRef<THREE.InstancedMesh>(null);
  const cuenta = useRef(peces);
  const cuentaD = useRef(depred);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const corales = useMemo(() => {
    const rnd = mulberry32(x > 0 ? 5 : 6);
    return Array.from({ length: N_CORALES }, () => ({ x: x + (rnd() - 0.5) * 5.4, z: (rnd() - 0.5) * 6, s: 0.14 + rnd() * 0.26, c: ["#db2777", "#ea580c", "#7c3aed", "#ca8a04", "#059669"][Math.floor(rnd() * 5)]! }));
  }, [x]);
  const semillas = useMemo(() => {
    const rnd = mulberry32(x > 0 ? 15 : 16);
    return Array.from({ length: N_PECES_MAX }, () => ({ cx: x + (rnd() - 0.5) * 4.4, cz: (rnd() - 0.5) * 4.6, r: 0.3 + rnd() * 0.9, y: -1.0 + rnd() * 0.8, v: 0.3 + rnd() * 0.5, f: rnd() * 6.28 }));
  }, [x]);
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    cuenta.current += (peces - cuenta.current) * suave(dt, 0.05);
    cuentaD.current += (depred - cuentaD.current) * suave(dt, 0.05);
    const m = pm.current;
    if (m) {
      semillas.forEach((s, i) => {
        const g = clamp(cuenta.current - i);
        const a = t * s.v + s.f;
        obj.position.set(s.cx + Math.cos(a) * s.r, s.y, s.cz + Math.sin(a) * s.r * 0.6);
        obj.rotation.set(0, -a, 0);
        const e = g <= 0 ? OCULTO : 0.06;
        obj.scale.set(e * 0.7, e * 0.9, e * 2);
        obj.updateMatrix();
        m.setMatrixAt(i, obj.matrix);
      });
      m.instanceMatrix.needsUpdate = true;
    }
    const d = dm.current;
    if (d) {
      for (let i = 0; i < 24; i++) {
        const s = semillas[i]!;
        const g = clamp(cuentaD.current - i);
        const a = t * s.v * 0.5 + s.f;
        obj.position.set(s.cx + Math.cos(a) * (s.r + 0.5), -0.75, s.cz + Math.sin(a) * (s.r + 0.5) * 0.6);
        obj.rotation.set(0, -a, 0);
        const e = g <= 0 ? OCULTO : 0.14;
        obj.scale.set(e * 0.7, e * 0.9, e * 2.2);
        obj.updateMatrix();
        d.setMatrixAt(i, obj.matrix);
      }
      d.instanceMatrix.needsUpdate = true;
    }
  });
  return (
    <group>
      {corales.map((c, i) => (
        <mesh key={i} position={[c.x, -1.25 + c.s * 0.4, c.z]} scale={[c.s, c.s * 0.8, c.s]} geometry={i % 3 === 0 ? GEO_PINO : GEO_COPA} castShadow>
          <meshStandardMaterial color={c.c} roughness={0.7} flatShading />
        </mesh>
      ))}
      <instancedMesh ref={pm} args={[GEO_PEZ, undefined, N_PECES_MAX]} frustumCulled={false}>
        <meshStandardMaterial color="#fde047" emissive="#facc15" emissiveIntensity={0.35} roughness={0.4} />
      </instancedMesh>
      <instancedMesh ref={dm} args={[GEO_PEZ, undefined, 24]} frustumCulled={false}>
        <meshStandardMaterial color="#475569" roughness={0.5} />
      </instancedMesh>
      <Etiqueta pos={[x, 0.5, -1.9]} df={12} col={`${col}aa`} fs={11.5}>
        {etq}
      </Etiqueta>
      <Etiqueta pos={[x, 0.45, 2.1]} df={12} col={`${col}aa`} fs={12.5}>
        <i className="fa-solid fa-fish" style={{ color: col }} />
        {valor}
      </Etiqueta>
    </group>
  );
}

function EscenaPulmo({ hito, modoColor }: { hito: number; modoColor: string }) {
  const caso = CASOS[1]!;
  const v = valorHasta(caso, hito);
  const h = caso.hitos[hito]!;
  const parque = hito >= 1;
  const biomasaParque = v.valor;
  // En 2009 la biomasa del parque fue 5.4 veces la de las zonas abiertas (≈ 0.79 t/ha).
  const abierta = 0.79;
  const factorDepred = biomasaParque >= 4 ? 11 : 1;
  return (
    <group position={[0, 0.2, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.3, 0]} receiveShadow>
        <planeGeometry args={[14, 9]} />
        <meshStandardMaterial color="#bfc7a6" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[14, 9]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.16} roughness={0.05} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {/* Línea de boyas: límite de la zona sin pesca */}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} position={[0, 0.03, -4 + i * 0.73]} scale={0.1} geometry={GEO_ESFERA}>
          <meshStandardMaterial color={parque ? "#facc15" : "#64748b"} emissive={parque ? "#facc15" : "#000"} emissiveIntensity={0.5} />
        </mesh>
      ))}
      <Arrecife x={-3.4} peces={Math.round(biomasaParque * 40)} depred={2 * factorDepred} etq={parque ? "Parque Nacional: zona sin pesca" : "Arrecife sin protección"} valor={v.medido ? textoValor(caso, hito) : "sin medición todavía"} col={parque ? "#34d399" : "#94a3b8"} />
      <Arrecife x={3.4} peces={Math.round(abierta * 40)} depred={2} etq="Zona abierta a la pesca" valor={hito >= 2 ? "≈ 0.8 t/ha · sin cambio significativo" : "sin medición"} col="#f87171" />
      {/* Lanchas: de pesca a la derecha; de buceo en el parque */}
      <group position={[4.2, 0.08, 1.4]}>
        <mesh scale={[0.7, 0.14, 0.26]} geometry={GEO_CAJA} castShadow>
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
      </group>
      {parque && (
        <group position={[-2.4, 0.08, 1.8]}>
          <mesh scale={[0.7, 0.14, 0.26]} geometry={GEO_CAJA} castShadow>
            <meshStandardMaterial color="#38bdf8" />
          </mesh>
          <mesh position={[0, 0.3, 0]} scale={[0.02, 0.5, 0.02]} geometry={GEO_CAJA}>
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>
          <mesh position={[0.14, 0.48, 0]} scale={[0.26, 0.16, 0.01]} geometry={GEO_CAJA}>
            <meshStandardMaterial color="#dc2626" />
          </mesh>
        </group>
      )}
      <Etiqueta pos={[0, 1.9, 0]} df={11} col={`${modoColor}aa`} fs={14}>
        <i className="fa-solid fa-water" style={{ color: modoColor }} />
        {h.anio}
      </Etiqueta>
      <Etiqueta pos={[0, -1.2, 3.1]} df={12} fs={10}>
        Cada pez amarillo ≈ 25 kg/ha de biomasa · los grises son grandes depredadores
      </Etiqueta>
    </group>
  );
}

const N_OYAMELES = 120;
const MAX_COLONIAS = 60;
const MARIPOSAS_POR_ARBOL = 24;
/** Tocones visibles por hito: ilustrativo (la tala ilegal fue fuerte en 2001-2012 y casi desapareció después). */
const TOCONES_MONARCA = [4, 2, 2, 30, 14, 8, 3, 2, 2];

const P_OYAMELES = (() => {
  const rnd = mulberry32(1986);
  return Array.from({ length: N_OYAMELES }, () => {
    const a = -Math.PI * 0.95 + rnd() * Math.PI * 0.9;
    const r = 1.8 + rnd() * 6.2;
    const x = Math.cos(a) * r;
    const z = -Math.sin(a) * r * 0.75;
    return { x, z, y: 4.2 * (1 - r / 8.6), s: 0.8 + rnd() * 0.45 };
  }).sort((p, q) => Math.hypot(p.x + 1, p.z - 2.8) - Math.hypot(q.x + 1, q.z - 2.8));
})();

function EscenaMonarca({ hito, modoColor }: { hito: number; modoColor: string }) {
  const caso = CASOS[2]!;
  const v = valorHasta(caso, hito);
  const h = caso.hitos[hito]!;
  const troncos = useRef<THREE.InstancedMesh>(null);
  const copas = useRef<THREE.InstancedMesh>(null);
  const mariposas = useRef<THREE.InstancedMesh>(null);
  const tocones = useRef<THREE.InstancedMesh>(null);
  const hectareas = useRef(v.valor);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const nTocones = TOCONES_MONARCA[Math.min(hito, TOCONES_MONARCA.length - 1)]!;
  const reserva = hito >= 2;
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    hectareas.current += (v.valor - hectareas.current) * suave(dt, 0.05);
    const colonias = Math.max(1, (hectareas.current / 18.19) * MAX_COLONIAS);
    const tm = troncos.current;
    const cm = copas.current;
    const km = tocones.current;
    if (tm && cm && km) {
      P_OYAMELES.forEach((p, i) => {
        // Los tocones reemplazan árboles lejos del santuario (índices altos).
        const talado = i >= N_OYAMELES - nTocones;
        const hh = 1.5 * p.s;
        obj.rotation.set(0, i, 0);
        obj.position.set(p.x, p.y + hh * 0.3, p.z);
        obj.scale.set(0.06, talado ? OCULTO : hh * 0.6, 0.06);
        obj.updateMatrix();
        tm.setMatrixAt(i, obj.matrix);
        obj.position.set(p.x, p.y + hh * 0.75, p.z);
        const r = talado ? OCULTO : 0.34 * p.s;
        obj.scale.set(r, talado ? OCULTO : hh * 0.9, r);
        obj.updateMatrix();
        cm.setMatrixAt(i, obj.matrix);
        obj.position.set(p.x, p.y + 0.08, p.z);
        const k = talado ? 0.1 : OCULTO;
        obj.scale.set(k, k * 1.4, k);
        obj.updateMatrix();
        km.setMatrixAt(i, obj.matrix);
      });
      tm.instanceMatrix.needsUpdate = true;
      cm.instanceMatrix.needsUpdate = true;
      km.instanceMatrix.needsUpdate = true;
    }
    const mm = mariposas.current;
    if (mm) {
      for (let i = 0; i < MAX_COLONIAS * MARIPOSAS_POR_ARBOL; i++) {
        const arbol = Math.floor(i / MARIPOSAS_POR_ARBOL);
        const p = P_OYAMELES[arbol]!;
        const g = clamp(colonias - arbol);
        const j = i % MARIPOSAS_POR_ARBOL;
        const hh = 1.5 * p.s;
        const a = j * 2.39996 + arbol;
        const vuela = j % 6 === 0;
        const rr = 0.22 * p.s + (vuela ? 0.3 + 0.2 * Math.sin(t + j) : 0);
        obj.position.set(p.x + Math.cos(a + (vuela ? t * 0.8 : 0)) * rr, p.y + hh * (0.35 + (j / MARIPOSAS_POR_ARBOL) * 0.8), p.z + Math.sin(a + (vuela ? t * 0.8 : 0)) * rr);
        obj.rotation.set(0, -a, Math.sin(t * 18 + i) * (vuela ? 0.9 : 0.2));
        const s = g <= 0 ? OCULTO : 0.07 * g;
        obj.scale.set(s, s * 0.75, s);
        obj.updateMatrix();
        mm.setMatrixAt(i, obj.matrix);
      }
      mm.instanceMatrix.needsUpdate = true;
    }
  });
  return (
    <group position={[0, -1.6, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <circleGeometry args={[13, 48]} />
        <meshStandardMaterial color="#3f4f2e" roughness={1} />
      </mesh>
      <mesh position={[0, 2.1, 0]} scale={[1, 1, 0.75]} receiveShadow>
        <coneGeometry args={[8.6, 4.2, 40, 1]} />
        <meshStandardMaterial color="#4b5d34" roughness={1} flatShading />
      </mesh>
      {reserva && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} scale={[1, 0.75, 1]}>
          <ringGeometry args={[9.2, 9.45, 64]} />
          <meshBasicMaterial color="#34d399" transparent opacity={0.8} />
        </mesh>
      )}
      <instancedMesh ref={troncos} args={[GEO_TRONCO, undefined, N_OYAMELES]} frustumCulled={false}>
        <meshStandardMaterial color="#4a3a28" roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={copas} args={[GEO_PINO, undefined, N_OYAMELES]} castShadow frustumCulled={false}>
        <meshStandardMaterial color="#1f4d3a" roughness={0.85} flatShading />
      </instancedMesh>
      <instancedMesh ref={tocones} args={[GEO_TRONCO, undefined, N_OYAMELES]} frustumCulled={false}>
        <meshStandardMaterial color="#a16207" roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={mariposas} args={[GEO_ALA, undefined, MAX_COLONIAS * MARIPOSAS_POR_ARBOL]} frustumCulled={false}>
        <meshStandardMaterial color="#f97316" emissive="#ea580c" emissiveIntensity={0.55} side={THREE.DoubleSide} />
      </instancedMesh>
      {reserva && (
        <Etiqueta pos={[-3.2, 2.4, 3.4]} df={12} fs={10.5} col="#34d399aa">
          <i className="fa-solid fa-shield-halved" style={{ color: "#34d399" }} />
          Reserva de la Biosfera Mariposa Monarca
        </Etiqueta>
      )}
      <Etiqueta pos={[-1.6, 6.1, 1]} df={11} col={`${modoColor}aa`} fs={14}>
        <i className="fa-solid fa-feather" style={{ color: "#fb923c" }} />
        {h.anio} · {v.medido ? `${textoValor(caso, hito)} ocupadas` : "sin medición todavía"}
      </Etiqueta>
      <Etiqueta pos={[3.4, 5.1, 1]} df={12} fs={10}>
        Árboles con mariposas ∝ hectáreas ocupadas · los tocones son ilustrativos
      </Etiqueta>
    </group>
  );
}

/* ── Escena ───────────────────────────────────────────────────────────── */

export default function RestauracionEcosistemasScene(p: RestauracionSceneProps) {
  const { vista, modoColor, resetNonce } = p;
  const cam = useMemo((): { pos: Pt; target: Pt } => {
    if (vista === "politicas") return { pos: [0, 10.2, 9.6], target: [0, -0.6, 0.4] };
    if (vista === "sucesion") return { pos: [8.5, 7, 11.5], target: [0.5, 0.2, -2.8] };
    if (p.casoId === "vaquita") return { pos: [0, 9.8, 8.4], target: [0, -0.8, -1.6] };
    if (p.casoId === "pulmo") return { pos: [0, 6.4, 7.6], target: [0, -1.0, 0.6] };
    return { pos: [2, 8.2, 12.5], target: [0, 1.8, 0.4] };
  }, [vista, p.casoId]);

  return (
    <Canvas key={`${vista}-${p.casoId}-${resetNonce}`} shadows dpr={[1, 1.75]} camera={{ position: cam.pos, fov: 42 }} gl={{ antialias: true }}>
      <color attach="background" args={["#040a16"]} />
      <fog attach="fog" args={["#040a16", vista === "sucesion" ? 16 : 22, vista === "sucesion" ? 40 : 48]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 11, 6]} intensity={1.25} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12} />
      <pointLight position={[-7, 4, 6]} intensity={0.4} color={modoColor} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.4} position={[0, 6, -6]} scale={[12, 6, 1]} color="#bae6fd" />
        <Lightformer form="rect" intensity={0.7} position={[-6, 1, 5]} scale={[6, 6, 1]} color={modoColor} />
      </Environment>

      {vista === "politicas" && <EscenaPoliticas plan={p.plan} anio={p.anio} zonaSel={p.zonaSel} onZona={p.onZona} modoColor={modoColor} />}
      {vista === "sucesion" && <EscenaSucesion condiciones={p.condiciones} anio={p.anioSuc} modoColor={modoColor} />}
      {vista === "casos" && p.casoId === "vaquita" && <EscenaVaquita hito={p.hito} modoColor={modoColor} />}
      {vista === "casos" && p.casoId === "pulmo" && <EscenaPulmo hito={p.hito} modoColor={modoColor} />}
      {vista === "casos" && p.casoId === "monarca" && <EscenaMonarca hito={p.hito} modoColor={modoColor} />}

      <OrbitControls makeDefault enablePan={false} enableZoom minDistance={4} maxDistance={26} maxPolarAngle={Math.PI * 0.47} minPolarAngle={Math.PI * 0.06} target={cam.target} />
      <EffectComposer>
        <Bloom intensity={0.28} luminanceThreshold={0.66} luminanceSmoothing={0.85} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.6} />
      </EffectComposer>
    </Canvas>
  );
}
