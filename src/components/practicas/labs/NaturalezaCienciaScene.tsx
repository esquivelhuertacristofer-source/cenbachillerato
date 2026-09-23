"use client";

/**
 * Escena 3D del laboratorio "La ciencia como práctica humana" (CNEYT-I-P01).
 * Tres vistas:
 *
 *  - revision: la revista en su pedestal con el manuscrito, tres revisores y
 *    cinco laboratorios que replican el estudio; cada uno levanta una barra con
 *    el efecto que midió frente a la línea de lo que dice el artículo.
 *  - falsabilidad: un banco de pruebas para cada afirmación (barra de metal
 *    con comparador, olla con termómetro según la altitud, lago con cisnes y
 *    la cochera del dragón invisible).
 *  - historia: la balanza de la evidencia y la comunidad científica que, hito a
 *    hito, cambia de idea.
 *
 * Toda animación ocurre en useFrame mutando refs y avanza por tiempo. NO se
 * usa <Text> de drei (cuelga el chunk con Turbopack): el texto va en <Html>.
 */

import * as THREE from "three";
import { useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Escenario } from "./_escenario";
import {
  type Defecto,
  type Dictamen,
  type Prueba,
  type MetalId,
  type LugarId,
  type RegionId,
  type PruebaDragonId,
  MANUSCRITOS,
  DEFECTO_DEF,
  LABS,
  N_LABS,
  METALES,
  T_AMBIENTE,
  T_MAX,
  dilatacionMm,
  LUGARES,
  ebullicion,
  REGIONES,
  PRUEBAS_DRAGON,
  CASOS,
  pesosHasta,
  inclinacion,
  num,
} from "./naturaleza-ciencia-data";

export type VistaNaturaleza = "revision" | "falsabilidad" | "historia";

export interface NaturalezaSceneProps {
  vista: VistaNaturaleza;
  modoColor: string;
  resetNonce: number;
  // Revisión
  manuscritoId: string;
  marcados: Defecto[];
  dictamen: Dictamen | null;
  /** Efecto medido por cada laboratorio; null mientras no se envía a replicar. */
  medidos: number[] | null;
  // Falsabilidad
  prueba: Prueba;
  metalId: MetalId;
  tempC: number;
  lugarId: LugarId;
  fuego: boolean;
  regionId: RegionId;
  dragonPrueba: PruebaDragonId | null;
  // Historia
  casoId: "ulcera" | "deriva";
  hito: number;
}

type Pt = [number, number, number];

const suave = (dt: number, porCuadro: number) => 1 - Math.pow(1 - porCuadro, Math.min(dt, 0.25) * 60);
const OK = "#34d399";
const NO = "#f87171";

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

/** Persona estilizada: cuerpo cápsula y cabeza. */
function Persona({ pos, color, escala = 1 }: { pos: Pt; color: string; escala?: number }) {
  return (
    <group position={pos} scale={escala}>
      <mesh position={[0, 0.42, 0]} castShadow>
        <capsuleGeometry args={[0.17, 0.42, 6, 14]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.98, 0]} castShadow>
        <sphereGeometry args={[0.15, 18, 14]} />
        <meshStandardMaterial color="#f1c9a5" roughness={0.6} />
      </mesh>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 1. REVISIÓN Y REPLICACIÓN
 * ════════════════════════════════════════════════════════════════════════ */

const ALTO_REPORTADO = 1.7;
const RADIO_LABS = 3.6;

function posLab(i: number): Pt {
  const a = Math.PI * (0.18 + (0.64 * i) / (N_LABS - 1));
  return [-Math.cos(a) * RADIO_LABS, 0, Math.sin(a) * RADIO_LABS * 0.62 + 0.4];
}

function BarraReplica({ i, valor, reportado, unidad, visible }: { i: number; valor: number; reportado: number; unidad: string; visible: boolean }) {
  const barra = useRef<THREE.Mesh>(null);
  const papel = useRef<THREE.Mesh>(null);
  const t = useRef(0);
  const destino = (valor / reportado) * ALTO_REPORTADO;
  const color = valor >= (2 / 3) * reportado ? OK : valor > reportado * 0.2 ? "#fbbf24" : NO;
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.35,
        emissive: color,
        emissiveIntensity: 0.25,
      }),
    [color],
  );
  useFrame((_, dt) => {
    t.current = visible ? t.current + dt : 0;
    // El artículo vuela del pedestal al laboratorio y luego crece la barra.
    const vuelo = Math.min(1, Math.max(0, (t.current - i * 0.25) / 0.9));
    const crece = Math.min(1, Math.max(0, (t.current - 1.1 - i * 0.25) / 1.1));
    const [x, , z] = posLab(i);
    if (papel.current) {
      papel.current.visible = visible && vuelo < 1;
      papel.current.position.set(x * vuelo, 1.6 + Math.sin(vuelo * Math.PI) * 1.2 - vuelo * 0.6, z * vuelo);
      papel.current.rotation.y = vuelo * Math.PI * 2;
    }
    if (barra.current) {
      const h = destino * (1 - Math.pow(1 - crece, 3));
      const alto = Math.max(0.001, Math.abs(h));
      barra.current.visible = visible && crece > 0;
      barra.current.scale.y = alto;
      barra.current.position.y = 0.62 + (h >= 0 ? alto / 2 : -alto / 2);
    }
  });
  const [x, , z] = posLab(i);
  return (
    <>
      <mesh ref={papel} visible={false}>
        <boxGeometry args={[0.36, 0.02, 0.48]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.6} />
      </mesh>
      <group position={[x, 0, z]}>
        <mesh ref={barra} material={mat} visible={false}>
          <boxGeometry args={[0.34, 1, 0.34]} />
        </mesh>
        {visible && (
          <Etiqueta pos={[0, 0.62 + Math.max(destino, 0) + 0.32, 0]} df={10} col={`${color}aa`} fs={11}>
            {num(valor, unidad === "°C" ? 2 : 1)} {unidad}
          </Etiqueta>
        )}
      </group>
    </>
  );
}

function EscenaRevision({
  manuscritoId,
  marcados,
  dictamen,
  medidos,
  modoColor,
}: {
  manuscritoId: string;
  marcados: Defecto[];
  dictamen: Dictamen | null;
  medidos: number[] | null;
  modoColor: string;
}) {
  const m = MANUSCRITOS.find((x) => x.id === manuscritoId) ?? MANUSCRITOS[0]!;
  const hoja = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (hoja.current) {
      hoja.current.position.y = 1.75 + Math.sin(clock.elapsedTime * 1.4) * 0.05;
      hoja.current.rotation.y = Math.sin(clock.elapsedTime * 0.5) * 0.25;
    }
  });
  const colDictamen = dictamen === "aceptar" ? OK : dictamen === "cambios" ? "#fbbf24" : dictamen === "rechazar" ? NO : "#475569";
  const promedio = medidos ? medidos.reduce((a, b) => a + b, 0) / medidos.length : 0;

  return (
    <group position={[0, -1.4, 0]}>
      <mesh position={[0, -0.06, 0.6]} receiveShadow>
        <cylinderGeometry args={[5.4, 5.4, 0.12, 64]} />
        <meshStandardMaterial color="#0f1b2d" roughness={0.9} />
      </mesh>
      {/* Pedestal de la revista */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.55, 0.7, 1, 6]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0, 1.02, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.04, 6]} />
        <meshStandardMaterial color={modoColor} emissive={modoColor} emissiveIntensity={0.5} />
      </mesh>
      <group ref={hoja}>
        <mesh rotation={[-0.35, 0, 0]} castShadow>
          <boxGeometry args={[0.75, 0.96, 0.03]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.7} />
        </mesh>
        {Array.from({ length: 6 }, (_, k) => (
          <mesh key={k} position={[-0.04 + (k % 2) * 0.05, 0.28 - k * 0.1, 0.02 + (0.28 - k * 0.1) * 0.36]} rotation={[-0.35, 0, 0]}>
            <boxGeometry args={[k === 0 ? 0.5 : 0.56 - (k % 3) * 0.08, 0.025, 0.005]} />
            <meshBasicMaterial color={k === 0 ? "#0f172a" : "#94a3b8"} />
          </mesh>
        ))}
        {marcados.map((d, k) => (
          <group key={d} position={[0.42, 0.34 - k * 0.24, 0.1]}>
            <mesh>
              <sphereGeometry args={[0.07, 14, 10]} />
              <meshStandardMaterial color={NO} emissive={NO} emissiveIntensity={0.8} />
            </mesh>
          </group>
        ))}
        <Etiqueta pos={[0, -0.72, 0.4]} col={`${modoColor}aa`} df={10}>
          <i className="fa-solid fa-file-lines" style={{ color: modoColor }} />
          {m.titulo}
        </Etiqueta>
        {marcados.length > 0 && (
          <Html position={[0.7, -0.2, 0.1]} distanceFactor={10} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
            <div style={{ display: "grid", gap: 4, transform: "translateY(-50%)" }}>
              {marcados.map((d) => (
                <div
                  key={d}
                  style={{
                    padding: "3px 8px",
                    borderRadius: 8,
                    background: "rgba(127,29,29,0.85)",
                    border: `1px solid ${NO}`,
                    color: "#fff",
                    fontSize: 10.5,
                    fontWeight: 800,
                    whiteSpace: "nowrap",
                  }}
                >
                  <i className={`fa-solid ${DEFECTO_DEF[d].icono}`} style={{ marginRight: 5 }} />
                  {DEFECTO_DEF[d].etq}
                </div>
              ))}
            </div>
          </Html>
        )}
      </group>

      {/* Tres revisores detrás */}
      {[-1.5, 0, 1.5].map((x, k) => (
        <group key={k} position={[x, 0, -2.7]}>
          <Persona pos={[0, 0, 0]} color={["#6366f1", "#0ea5e9", "#a855f7"][k]!} />
          <mesh position={[0, 1.45, 0]}>
            <sphereGeometry args={[0.1, 16, 12]} />
            <meshStandardMaterial color={colDictamen} emissive={colDictamen} emissiveIntensity={dictamen ? 1.6 : 0.2} />
          </mesh>
          <mesh position={[0, 0.34, 0.45]} castShadow>
            <boxGeometry args={[0.9, 0.06, 0.5]} />
            <meshStandardMaterial color="#334155" roughness={0.5} />
          </mesh>
        </group>
      ))}
      {!medidos && (
        <Etiqueta pos={[0, 2.05, -2.7]} df={11} col={`${colDictamen}aa`}>
          <i className="fa-solid fa-user-pen" style={{ color: colDictamen }} />
          Revisión por pares
          {dictamen ? ` · ${dictamen === "aceptar" ? "aceptado" : dictamen === "cambios" ? "pide cambios" : "rechazado"}` : ""}
        </Etiqueta>
      )}

      {/* Cinco laboratorios delante */}
      {LABS.map((nombre, i) => {
        const [x, , z] = posLab(i);
        return (
          <group key={nombre}>
            <group position={[x, 0, z]}>
              <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.8, 0.56, 0.6]} />
                <meshStandardMaterial color="#1e3a5f" roughness={0.5} />
              </mesh>
              <mesh position={[0, 0.6, 0]}>
                <boxGeometry args={[0.84, 0.06, 0.64]} />
                <meshStandardMaterial color="#cbd5e1" roughness={0.4} />
              </mesh>
              {/* Línea de lo que reporta el artículo */}
              <mesh position={[0, 0.62 + ALTO_REPORTADO, 0]}>
                <boxGeometry args={[0.7, 0.02, 0.02]} />
                <meshBasicMaterial color="#e2e8f0" transparent opacity={0.8} />
              </mesh>
              <Etiqueta pos={[0, -0.02, 0.62]} df={11} fs={10.5}>
                <i className="fa-solid fa-flask" style={{ color: modoColor }} />
                {nombre}
              </Etiqueta>
            </group>
            <BarraReplica i={i} valor={medidos?.[i] ?? 0} reportado={m.efectoReportado} unidad={m.unidad} visible={medidos !== null} />
          </group>
        );
      })}
      <Etiqueta pos={[posLab(0)[0] - 1.25, 0.62 + ALTO_REPORTADO, posLab(0)[2]]} df={11} fs={10.5}>
        — lo que dice el artículo: {num(m.efectoReportado, m.unidad === "°C" ? 1 : 0)} {m.unidad}
      </Etiqueta>
      {medidos && (
        <Etiqueta pos={[0, 2.05, -2.7]} df={10} col={`${modoColor}aa`}>
          <i className="fa-solid fa-chart-simple" style={{ color: modoColor }} />
          Promedio de las réplicas: {num(promedio, m.unidad === "°C" ? 2 : 1)} {m.unidad}
        </Etiqueta>
      )}
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. FALSABILIDAD
 * ════════════════════════════════════════════════════════════════════════ */

const AMPLIA = 10;
const L_BARRA = 5;
const X_COMPARADOR = L_BARRA / 2 + 1.4;

function BancoMetal({ metalId, tempC }: { metalId: MetalId; tempC: number }) {
  const metal = METALES.find((x) => x.id === metalId) ?? METALES[0]!;
  const barra = useRef<THREE.Mesh>(null);
  const aguja = useRef<THREE.Group>(null);
  const llamas = useRef<THREE.Group>(null);
  const lectura = useRef<HTMLSpanElement>(null);
  const vastago = useRef<THREE.Mesh>(null);
  const t = useRef(tempC);
  useFrame(({ clock }, dt) => {
    t.current += (tempC - t.current) * suave(dt, 0.05);
    const dl = dilatacionMm(metal.alfa, t.current);
    const largo = L_BARRA + (dl / 1000) * L_BARRA * AMPLIA;
    const fin = -L_BARRA / 2 + largo;
    if (barra.current) {
      barra.current.scale.x = largo;
      barra.current.position.x = -L_BARRA / 2 + largo / 2;
    }
    if (vastago.current) {
      const x0 = fin;
      const x1 = X_COMPARADOR - 0.5;
      vastago.current.scale.y = Math.max(0.01, x1 - x0);
      vastago.current.position.x = (x0 + x1) / 2;
    }
    if (aguja.current) aguja.current.rotation.z = -(dl / 10) * Math.PI * 2;
    const f = (t.current - T_AMBIENTE) / (T_MAX - T_AMBIENTE);
    if (llamas.current)
      llamas.current.children.forEach((c, k) => {
        const s = f <= 0.01 ? 0.001 : (0.4 + f * 0.9) * (1 + 0.15 * Math.sin(clock.elapsedTime * 12 + k * 1.7));
        c.scale.set(Math.max(0.001, f), s, Math.max(0.001, f));
      });
    if (lectura.current) lectura.current.textContent = `${num(t.current, 0)} °C · ΔL = ${num(dl, 2)} mm`;
  });
  return (
    <group>
      <mesh position={[-L_BARRA / 2 - 0.25, 0.9, 0]} castShadow>
        <boxGeometry args={[0.3, 1.8, 0.9]} />
        <meshStandardMaterial color="#475569" roughness={0.5} />
      </mesh>
      {[-1.6, 1.6].map((x) => (
        <mesh key={x} position={[x, 0.55, 0]} castShadow>
          <boxGeometry args={[0.12, 1.1, 0.4]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      ))}
      <mesh ref={barra} position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[1, 0.16, 0.16]} />
        <meshStandardMaterial color={metal.color} metalness={0.85} roughness={0.25} />
      </mesh>
      {/* Comparador de carátula */}
      <mesh ref={vastago} position={[L_BARRA / 2 + 0.3, 1.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 1, 10]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.2} />
      </mesh>
      <group position={[X_COMPARADOR, 1.2, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.12, 40]} />
          <meshStandardMaterial color="#e5e7eb" roughness={0.3} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.065]}>
          <circleGeometry args={[0.44, 40]} />
          <meshBasicMaterial color="#f8fafc" />
        </mesh>
        {Array.from({ length: 10 }, (_, k) => (
          <mesh key={k} position={[Math.sin((k / 10) * Math.PI * 2) * 0.38, Math.cos((k / 10) * Math.PI * 2) * 0.38, 0.07]} rotation={[0, 0, -(k / 10) * Math.PI * 2]}>
            <boxGeometry args={[0.015, 0.08, 0.005]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
        ))}
        <group ref={aguja} position={[0, 0, 0.08]}>
          <mesh position={[0, 0.17, 0]}>
            <boxGeometry args={[0.022, 0.36, 0.01]} />
            <meshBasicMaterial color="#dc2626" />
          </mesh>
        </group>
        <Etiqueta pos={[0, 0.85, 0]} df={9} fs={11}>
          <i className="fa-solid fa-gauge" style={{ color: "#f472b6" }} />
          Comparador: 1 vuelta = 10 mm
        </Etiqueta>
      </group>
      {/* Mecheros */}
      {[-1, 0, 1].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.1, 0.14, 0.4, 16]} />
            <meshStandardMaterial color="#1f2937" metalness={0.6} roughness={0.4} />
          </mesh>
        </group>
      ))}
      <group ref={llamas}>
        {[-1, 0, 1].map((x) => (
          <mesh key={x} position={[x, 0.68, 0]}>
            <coneGeometry args={[0.12, 0.55, 16, 1, true]} />
            <meshBasicMaterial color="#60a5fa" transparent opacity={0.75} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        ))}
      </group>
      <Etiqueta pos={[0, 2.25, 0]} df={9} col="#f472b6aa" fs={13}>
        <i className="fa-solid fa-temperature-half" style={{ color: "#fca5a5" }} />
        <span ref={lectura}>20 °C · ΔL = 0.00 mm</span>
      </Etiqueta>
      <Etiqueta pos={[0, -0.25, 0.8]} df={10} fs={10.5}>
        Barra de {metal.etq.toLowerCase()} de 1 m · el alargamiento se dibuja ampliado 10×
      </Etiqueta>
    </group>
  );
}

const N_BURBUJAS = 40;
const N_VAPOR = 14;
const MONTES: { x: number; z: number; r: number; f: number }[] = [
  { x: -2.6, z: -4.2, r: 2.2, f: 1 },
  { x: 0.2, z: -5.0, r: 2.6, f: 0.82 },
  { x: 2.8, z: -4.4, r: 1.9, f: 0.64 },
];

function BancoHervir({ lugarId, fuego }: { lugarId: LugarId; fuego: boolean }) {
  const lugar = LUGARES.find((x) => x.id === lugarId) ?? LUGARES[0]!;
  const tEb = ebullicion(lugar.altitud);
  const temp = useRef(22);
  const columna = useRef<THREE.Mesh>(null);
  const burbujas = useRef<THREE.InstancedMesh>(null);
  const vapor = useRef<THREE.InstancedMesh>(null);
  const llama = useRef<THREE.Mesh>(null);
  const lectura = useRef<HTMLSpanElement>(null);
  const semillas = useMemo(
    () =>
      Array.from({ length: N_BURBUJAS }, (_, i) => ({
        x: Math.sin(i * 12.9898) * 0.8,
        z: Math.cos(i * 78.233) * 0.8,
        fase: (i * 0.618) % 1,
      })),
    [],
  );
  const obj = useMemo(() => new THREE.Object3D(), []);
  useFrame(({ clock }, dt) => {
    // Calienta hasta el punto de ebullición del lugar; ahí se queda mientras hierve.
    const objetivo = fuego ? tEb : 22;
    const vel = fuego ? 26 : 10;
    const d = objetivo - temp.current;
    temp.current += Math.sign(d) * Math.min(Math.abs(d), vel * Math.min(dt, 0.25));
    const hierve = fuego && temp.current >= tEb - 0.05;
    const frac = (temp.current - 0) / 110;
    if (columna.current) {
      columna.current.scale.y = Math.max(0.01, frac * 2.2);
      columna.current.position.y = 0.3 + (frac * 2.2) / 2;
    }
    if (llama.current) {
      llama.current.visible = fuego;
      llama.current.scale.y = 1 + 0.12 * Math.sin(clock.elapsedTime * 14);
    }
    const mesh = burbujas.current;
    if (mesh) {
      semillas.forEach((s, i) => {
        const p = (clock.elapsedTime * 0.9 + s.fase) % 1;
        obj.position.set(s.x * 0.9, 0.72 + p * 0.66, s.z * 0.9);
        obj.scale.setScalar(hierve ? 0.025 + p * 0.05 : temp.current > tEb - 12 && p > 0.6 ? 0.02 : 0.0001);
        obj.updateMatrix();
        mesh.setMatrixAt(i, obj.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    }
    const nube = vapor.current;
    if (nube) {
      semillas.slice(0, N_VAPOR).forEach((s, i) => {
        const p = (clock.elapsedTime * 0.35 + s.fase) % 1;
        obj.position.set(s.x * 0.6 + Math.sin(p * 4 + i) * 0.15, 1.5 + p * 1.6, s.z * 0.6);
        obj.scale.setScalar(hierve ? 0.1 + p * (1 - p) * 0.5 : 0.0001);
        obj.updateMatrix();
        nube.setMatrixAt(i, obj.matrix);
      });
      nube.instanceMatrix.needsUpdate = true;
    }
    if (lectura.current) lectura.current.textContent = `${num(temp.current, 1)} °C${hierve ? " · hirviendo" : ""}`;
  });
  const alturaMonte = 0.6 + (lugar.altitud / 5636) * 3.6;
  return (
    <group>
      {/* Sierra de fondo: su altura sigue a la altitud del lugar */}
      {MONTES.map((m, k) => {
        const h = alturaMonte * m.f;
        return (
          <group key={k} position={[m.x, 0, m.z]}>
            <mesh position={[0, h / 2 - 0.1, 0]}>
              <coneGeometry args={[m.r, h, 7]} />
              <meshStandardMaterial color="#3b4a5e" roughness={0.95} flatShading />
            </mesh>
            {h > 2.4 && (
              <mesh position={[0, h - 0.1 - (h * 0.18) / 2, 0]}>
                <coneGeometry args={[m.r * 0.18 + 0.02, h * 0.18, 7]} />
                <meshStandardMaterial color="#f1f5f9" roughness={0.8} flatShading />
              </mesh>
            )}
          </group>
        );
      })}
      <Etiqueta pos={[-3.4, Math.min(alturaMonte + 0.35, 2.4), -3.6]} df={11} fs={11}>
        <i className="fa-solid fa-mountain" style={{ color: "#94a3b8" }} />
        {lugar.etq} · {num(lugar.altitud)} m
      </Etiqueta>
      {/* Estufa, olla y agua */}
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.6, 0.5, 2.2]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.4} />
      </mesh>
      <mesh ref={llama} position={[0, 0.58, 0]}>
        <torusGeometry args={[0.5, 0.06, 8, 32]} />
        <meshBasicMaterial color="#60a5fa" />
      </mesh>
      <mesh position={[0, 1.15, 0]} castShadow>
        <cylinderGeometry args={[1.05, 0.95, 1.1, 40, 1, true]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.25} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.62, 0]}>
        <cylinderGeometry args={[0.95, 0.95, 0.04, 40]} />
        <meshStandardMaterial color="#6b7280" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.02, 40]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.55} roughness={0.1} depthWrite={false} />
      </mesh>
      <instancedMesh ref={burbujas} args={[undefined, undefined, N_BURBUJAS]} frustumCulled={false}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshStandardMaterial color="#e0f2fe" transparent opacity={0.8} />
      </instancedMesh>
      <instancedMesh ref={vapor} args={[undefined, undefined, N_VAPOR]} frustumCulled={false}>
        <sphereGeometry args={[1, 12, 10]} />
        <meshStandardMaterial color="#f8fafc" transparent opacity={0.09} depthWrite={false} />
      </instancedMesh>
      {/* Termómetro */}
      <group position={[1.9, 0.5, 0.2]}>
        <mesh position={[0, 1.4, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 2.6, 16]} />
          <meshStandardMaterial color="#f8fafc" transparent opacity={0.35} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
          <sphereGeometry args={[0.15, 16, 12]} />
          <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={0.4} />
        </mesh>
        <mesh ref={columna} position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 1, 10]} />
          <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={0.4} />
        </mesh>
        {/* Marca de 100 °C */}
        <mesh position={[0, 0.3 + (100 / 110) * 2.2, 0]}>
          <boxGeometry args={[0.32, 0.018, 0.02]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>
        <Etiqueta pos={[0.62, 0.3 + (100 / 110) * 2.2, 0]} df={10} fs={10} col="#fbbf24aa">
          100 °C
        </Etiqueta>
        <Etiqueta pos={[0, 3.05, 0]} df={9} col="#f472b6aa" fs={13}>
          <i className="fa-solid fa-temperature-half" style={{ color: "#fca5a5" }} />
          <span ref={lectura}>22.0 °C</span>
        </Etiqueta>
      </group>
    </group>
  );
}

function Cisne({ pos, negro, fase }: { pos: Pt; negro: boolean; fase: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * 0.25 + fase;
    ref.current.position.x = pos[0] + Math.sin(t) * 0.35;
    ref.current.position.z = pos[2] + Math.cos(t * 0.8) * 0.25;
    ref.current.rotation.y = Math.cos(t) * 0.6 + fase;
    ref.current.position.y = pos[1] + Math.sin(clock.elapsedTime * 1.3 + fase) * 0.015;
  });
  const cuerpo = negro ? "#111827" : "#f8fafc";
  return (
    <group ref={ref} position={pos}>
      <mesh scale={[0.42, 0.2, 0.24]} castShadow>
        <sphereGeometry args={[1, 20, 14]} />
        <meshStandardMaterial color={cuerpo} roughness={0.55} />
      </mesh>
      <mesh position={[-0.3, 0.12, 0]} rotation={[0, 0, 0.9]} scale={[0.18, 0.1, 0.16]}>
        <sphereGeometry args={[1, 14, 10]} />
        <meshStandardMaterial color={cuerpo} roughness={0.55} />
      </mesh>
      <mesh position={[0.3, 0.32, 0]} rotation={[0, 0, -0.25]}>
        <cylinderGeometry args={[0.035, 0.05, 0.5, 10]} />
        <meshStandardMaterial color={cuerpo} roughness={0.55} />
      </mesh>
      <mesh position={[0.37, 0.58, 0]}>
        <sphereGeometry args={[0.07, 14, 10]} />
        <meshStandardMaterial color={cuerpo} roughness={0.55} />
      </mesh>
      <mesh position={[0.47, 0.56, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.03, 0.12, 8]} />
        <meshStandardMaterial color={negro ? "#dc2626" : "#f97316"} />
      </mesh>
    </group>
  );
}

const POS_CISNES: Pt[] = [
  [-1.6, 0.12, 0.2],
  [-0.4, 0.12, -1.0],
  [0.9, 0.12, 0.5],
  [2.0, 0.12, -0.6],
  [-2.3, 0.12, -1.2],
  [0.3, 0.12, 1.4],
  [-1.0, 0.12, 1.3],
  [1.6, 0.12, 1.5],
];

function BancoCisnes({ regionId }: { regionId: RegionId }) {
  const region = REGIONES.find((r) => r.id === regionId) ?? REGIONES[0]!;
  const orilla = regionId === "australia" ? "#a16207" : regionId === "norteamerica" ? "#166534" : "#3f6212";
  return (
    <group>
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[4.4, 64]} />
        <meshStandardMaterial color={orilla} roughness={1} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.5, 64]} />
        <meshStandardMaterial color="#0e7490" roughness={0.15} metalness={0.2} />
      </mesh>
      {Array.from({ length: 14 }, (_, k) => {
        const a = (k / 14) * Math.PI * 2;
        return (
          <mesh key={k} position={[Math.cos(a) * 3.95, 0.35, Math.sin(a) * 3.95]}>
            <coneGeometry args={[0.08, 0.7 + (k % 3) * 0.2, 6]} />
            <meshStandardMaterial color="#4d7c0f" roughness={0.8} />
          </mesh>
        );
      })}
      {POS_CISNES.map((p, k) => (
        <Cisne key={`${regionId}-${k}`} pos={p} negro={k < region.negros} fase={k * 1.3} />
      ))}
      <Etiqueta pos={[0, 2.1, -2.2]} df={10} col="#f472b6aa" fs={12}>
        <i className="fa-solid fa-earth-americas" style={{ color: "#67e8f9" }} />
        {region.etq} · {region.fuente}
      </Etiqueta>
    </group>
  );
}

function BancoDragon({ dragonPrueba }: { dragonPrueba: PruebaDragonId | null }) {
  const pintura = useRef<THREE.InstancedMesh>(null);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const semillas = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        y: 0.4 + ((i * 0.37) % 1) * 1.4,
        z: ((i * 0.61) % 1) * 1.6 - 0.8,
        fase: (i * 0.29) % 1,
      })),
    [],
  );
  const prueba = PRUEBAS_DRAGON.find((p) => p.id === dragonPrueba) ?? null;
  useFrame(({ clock }) => {
    const mesh = pintura.current;
    if (!mesh) return;
    semillas.forEach((s, i) => {
      const p = (clock.elapsedTime * 0.5 + s.fase) % 1;
      // Las gotas atraviesan la cochera sin detenerse: no hay cuerpo.
      obj.position.set(-2.6 + p * 5.2, s.y - p * 0.35, s.z);
      obj.scale.setScalar(dragonPrueba === "pintura" ? 0.04 : 0.0001);
      obj.updateMatrix();
      mesh.setMatrixAt(i, obj.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });
  return (
    <group>
      {/* Cochera */}
      <mesh position={[0, -0.03, 0]} receiveShadow>
        <boxGeometry args={[6, 0.06, 4]} />
        <meshStandardMaterial color={dragonPrueba === "harina" ? "#f5f5f4" : "#44403c"} roughness={1} />
      </mesh>
      <mesh position={[0, 1.5, -2]} receiveShadow>
        <boxGeometry args={[6, 3, 0.1]} />
        <meshStandardMaterial color="#57534e" roughness={0.9} />
      </mesh>
      {[-3, 3].map((x) => (
        <mesh key={x} position={[x, 1.5, 0]} receiveShadow>
          <boxGeometry args={[0.1, 3, 4]} />
          <meshStandardMaterial color="#78716c" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 3.02, -1.2]}>
        <boxGeometry args={[6.2, 0.08, 1.8]} />
        <meshStandardMaterial color="#292524" roughness={0.9} />
      </mesh>
      {/* Estante con herramientas */}
      <mesh position={[-2.2, 1.1, -1.7]}>
        <boxGeometry args={[1.2, 0.06, 0.4]} />
        <meshStandardMaterial color="#a16207" roughness={0.7} />
      </mesh>
      {[-2.5, -2.2, -1.9].map((x, k) => (
        <mesh key={x} position={[x, 1.28, -1.7]}>
          <cylinderGeometry args={[0.08, 0.08, 0.3 + k * 0.05, 12]} />
          <meshStandardMaterial color={["#dc2626", "#2563eb", "#16a34a"][k]!} roughness={0.5} />
        </mesh>
      ))}
      {/* Donde «está» el dragón: un contorno punteado que no se ve en ninguna prueba */}
      {Array.from({ length: 24 }, (_, k) => {
        const a = (k / 24) * Math.PI * 2;
        return (
          <mesh key={k} position={[Math.cos(a) * 1.3, 0.02, Math.sin(a) * 0.8]}>
            <boxGeometry args={[0.14, 0.01, 0.03]} />
            <meshBasicMaterial color="#f472b6" transparent opacity={0.5} />
          </mesh>
        );
      })}
      <Etiqueta pos={[0, 0.35, 0]} df={10} col="#f472b6aa" fs={11}>
        <i className="fa-solid fa-dragon" style={{ color: "#f472b6" }} />
        «Aquí está el dragón»
      </Etiqueta>

      {dragonPrueba === "infrarrojo" && (
        <group position={[2.2, 1.2, 1.2]} rotation={[0, -0.6, 0]}>
          <mesh>
            <boxGeometry args={[0.5, 0.35, 0.3]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
          <Html position={[0, 0.55, 0]} center distanceFactor={9} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
            <div
              style={{
                width: 150,
                height: 92,
                borderRadius: 8,
                border: "2px solid #1f2937",
                background: "linear-gradient(180deg,#1e1b4b,#1e3a8a 60%,#312e81)",
                color: "#c7d2fe",
                fontSize: 10,
                fontWeight: 800,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                paddingBottom: 6,
              }}
            >
              Pantalla infrarroja: todo frío
            </div>
          </Html>
        </group>
      )}
      {dragonPrueba === "bascula" && (
        <group position={[0, 0.06, 0]}>
          <mesh>
            <boxGeometry args={[1.4, 0.08, 1]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.5} roughness={0.3} />
          </mesh>
          <Etiqueta pos={[0, 0.5, 0.6]} df={9} fs={13} col="#cbd5e1aa">
            <i className="fa-solid fa-weight-scale" />
            0.0 kg
          </Etiqueta>
        </group>
      )}
      <instancedMesh ref={pintura} args={[undefined, undefined, 60]} frustumCulled={false}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.5} />
      </instancedMesh>
      {prueba && (
        <>
          <Persona pos={[-2.2, 0, 1.2]} color="#f472b6" />
          <Html position={[-2.2, 2.05, 1.2]} center distanceFactor={9} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
            <div
              style={{
                maxWidth: 220,
                padding: "8px 12px",
                borderRadius: 12,
                background: "#fff",
                color: "#0f172a",
                fontSize: 12,
                fontWeight: 800,
                lineHeight: 1.35,
                boxShadow: "0 8px 20px -8px #000",
                textAlign: "center",
              }}
            >
              {prueba.excusa}
            </div>
          </Html>
        </>
      )}
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. LA CIENCIA SE CORRIGE
 * ════════════════════════════════════════════════════════════════════════ */

const N_PERSONAS = 42;
const POR_FILA = 14;
const BRAZO = 2.2;

function EscenaHistoria({ casoId, hito, modoColor }: { casoId: "ulcera" | "deriva"; hito: number; modoColor: string }) {
  const caso = CASOS.find((c) => c.id === casoId) ?? CASOS[0]!;
  const h = caso.hitos[Math.min(hito, caso.hitos.length - 1)]!;
  const pesos = pesosHasta(caso, hito);
  const destino = inclinacion(pesos);
  const viga = useRef<THREE.Group>(null);
  const platoIzq = useRef<THREE.Group>(null);
  const platoDer = useRef<THREE.Group>(null);
  const gente = useRef<THREE.InstancedMesh>(null);
  const angulo = useRef(0);
  const nuevos = useRef(0);
  const caida = useRef(0);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const colViejo = useMemo(() => new THREE.Color("#94a3b8"), []);
  const colNuevo = useMemo(() => new THREE.Color(modoColor), [modoColor]);
  const tmp = useMemo(() => new THREE.Color(), []);
  const cabezas = useRef<THREE.InstancedMesh>(null);
  const lugares = useMemo(
    () =>
      Array.from({ length: N_PERSONAS }, (_, i) => {
        const fila = Math.floor(i / POR_FILA);
        const col = i % POR_FILA;
        const a = Math.PI * (0.1 + (0.8 * (col + (fila % 2) * 0.5)) / (POR_FILA - 0.5));
        const r = 4.6 + fila * 0.8;
        return {
          x: -Math.cos(a) * r,
          y: fila * 0.42,
          z: -Math.sin(a) * r * 0.55 - 1.6,
          orden: (i * 17) % N_PERSONAS,
        };
      }),
    [],
  );

  // Bloques de evidencia apilados en cada platillo.
  const bloques = caso.hitos.slice(0, hito + 1).map((x, k) => ({ ...x, k }));
  const pilaIzq = bloques.filter((b) => b.apoya === "vieja");
  const pilaDer = bloques.filter((b) => b.apoya === "nueva");
  const apilar = (pila: typeof bloques) => {
    let y = 0.08;
    return pila.map((b) => {
      const alto = 0.14 + b.peso * 0.14;
      const out = { ...b, y: y + alto / 2, alto };
      y += alto + 0.02;
      return out;
    });
  };
  const izq = apilar(pilaIzq);
  const der = apilar(pilaDer);

  useFrame((_, dt) => {
    angulo.current += (destino - angulo.current) * suave(dt, 0.04);
    caida.current = Math.min(1, caida.current + dt * 1.6);
    const a = angulo.current;
    if (viga.current) viga.current.rotation.z = -a;
    if (platoIzq.current) platoIzq.current.position.set(-Math.cos(a) * BRAZO, 2.6 + Math.sin(a) * BRAZO, 0);
    if (platoDer.current) platoDer.current.position.set(Math.cos(a) * BRAZO, 2.6 - Math.sin(a) * BRAZO, 0);
    nuevos.current += (h.consenso - nuevos.current) * suave(dt, 0.05);
    const mesh = gente.current;
    if (mesh) {
      const umbral = (nuevos.current / 100) * N_PERSONAS;
      lugares.forEach((p, i) => {
        obj.position.set(p.x, p.y + 0.42, p.z);
        obj.scale.set(1, 1, 1);
        obj.updateMatrix();
        mesh.setMatrixAt(i, obj.matrix);
        if (cabezas.current) {
          obj.position.set(p.x, p.y + 0.93, p.z);
          obj.updateMatrix();
          cabezas.current.setMatrixAt(i, obj.matrix);
        }
        const f = Math.min(1, Math.max(0, umbral - p.orden));
        tmp.copy(colViejo).lerp(colNuevo, f);
        mesh.setColorAt(i, tmp);
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      if (cabezas.current) cabezas.current.instanceMatrix.needsUpdate = true;
    }
  });

  const Bloque = ({ b, lado }: { b: (typeof izq)[number]; lado: "izq" | "der" }) => {
    const col = lado === "izq" ? "#64748b" : modoColor;
    return (
      <group position={[0, b.y, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.9 - b.k * 0.03, b.alto, 0.7]} />
          <meshStandardMaterial color={col} roughness={0.45} emissive={b.k === hito ? col : "#000"} emissiveIntensity={b.k === hito ? 0.35 : 0} />
        </mesh>
        <Html position={[lado === "izq" ? -0.55 : 0.55, 0, 0.36]} center distanceFactor={10} zIndexRange={[18, 0]} style={{ pointerEvents: "none" }}>
          <div
            style={{
              padding: "2px 7px",
              borderRadius: 6,
              background: "rgba(4,10,22,0.85)",
              color: "#fff",
              fontSize: 10,
              fontWeight: 900,
              whiteSpace: "nowrap",
              border: `1px solid ${col}`,
            }}
          >
            {b.anio}
          </div>
        </Html>
      </group>
    );
  };

  return (
    <group position={[0, -2, 0.6]}>
      <mesh position={[0, -0.05, -1.2]} receiveShadow>
        <cylinderGeometry args={[5.8, 5.8, 0.1, 64]} />
        <meshStandardMaterial color="#0f1b2d" roughness={0.9} />
      </mesh>
      {/* Balanza */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.7, 0.9, 0.2, 32]} />
        <meshStandardMaterial color="#78350f" metalness={0.3} roughness={0.45} />
      </mesh>
      <mesh position={[0, 1.35, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.12, 2.5, 16]} />
        <meshStandardMaterial color="#b45309" metalness={0.6} roughness={0.3} />
      </mesh>
      <group ref={viga} position={[0, 2.6, 0]}>
        <mesh castShadow>
          <boxGeometry args={[BRAZO * 2 + 0.2, 0.1, 0.12]} />
          <meshStandardMaterial color="#d97706" metalness={0.7} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
          <coneGeometry args={[0.06, 0.5, 12]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.7} roughness={0.25} />
        </mesh>
      </group>
      <mesh position={[0, 2.6, 0.08]}>
        <sphereGeometry args={[0.13, 16, 12]} />
        <meshStandardMaterial color="#fde68a" metalness={0.6} roughness={0.3} />
      </mesh>
      {(["izq", "der"] as const).map((lado) => (
        <group key={lado} ref={lado === "izq" ? platoIzq : platoDer} position={[lado === "izq" ? -BRAZO : BRAZO, 2.6, 0]}>
          {/* Cuerdas */}
          {[-0.5, 0.5].map((x) => (
            <mesh key={x} position={[x * 0.9, -0.55, 0]} rotation={[0, 0, x * 0.75]}>
              <cylinderGeometry args={[0.012, 0.012, 1.25, 6]} />
              <meshStandardMaterial color="#e5e7eb" />
            </mesh>
          ))}
          <group position={[0, -1.1, 0]}>
            <mesh receiveShadow>
              <cylinderGeometry args={[0.85, 0.7, 0.08, 32]} />
              <meshStandardMaterial color="#b45309" metalness={0.6} roughness={0.3} />
            </mesh>
            {(lado === "izq" ? izq : der).map((b) => (
              <Bloque key={b.k} b={b} lado={lado} />
            ))}
          </group>
        </group>
      ))}
      <Html position={[-BRAZO - 0.2, 4.1, 0]} center distanceFactor={10} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div
          style={{
            width: 190,
            padding: "7px 10px",
            borderRadius: 10,
            background: "rgba(4,10,22,0.88)",
            border: "1px solid #64748b",
            color: "#e2e8f0",
            fontSize: 11,
            fontWeight: 800,
            lineHeight: 1.3,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 9, letterSpacing: "0.1em", color: "#94a3b8" }}>IDEA ESTABLECIDA</div>
          {caso.vieja}
        </div>
      </Html>
      <Html position={[BRAZO + 0.2, 4.1, 0]} center distanceFactor={10} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div
          style={{
            width: 190,
            padding: "7px 10px",
            borderRadius: 10,
            background: "rgba(4,10,22,0.88)",
            border: `1px solid ${modoColor}`,
            color: "#fff",
            fontSize: 11,
            fontWeight: 800,
            lineHeight: 1.3,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 9, letterSpacing: "0.1em", color: modoColor }}>IDEA NUEVA</div>
          {caso.nueva}
        </div>
      </Html>
      <Etiqueta pos={[0, 5.0, 0]} df={9} col={`${modoColor}aa`} fs={15}>
        <i className="fa-solid fa-calendar" style={{ color: modoColor }} />
        {h.anio}
      </Etiqueta>

      {/* Comunidad científica */}
      {/* Comunidad científica en gradas */}
      {[0, 1, 2].map((f) => (
        <mesh key={f} position={[0, f * 0.42 - 0.1, -1.7]} scale={[1, 1, 0.55]}>
          <cylinderGeometry args={[5.0 + f * 0.8, 5.0 + f * 0.8, 0.2, 48, 1, false, -Math.PI * 0.42, Math.PI * 0.84]} />
          <meshStandardMaterial color="#16243a" roughness={0.9} />
        </mesh>
      ))}
      <instancedMesh key={`${casoId}-${modoColor}`} ref={gente} args={[undefined, undefined, N_PERSONAS]} castShadow>
        <capsuleGeometry args={[0.15, 0.42, 4, 10]} />
        <meshStandardMaterial roughness={0.5} />
      </instancedMesh>
      <instancedMesh ref={cabezas} args={[undefined, undefined, N_PERSONAS]}>
        <sphereGeometry args={[0.13, 14, 10]} />
        <meshStandardMaterial color="#f1c9a5" roughness={0.6} />
      </instancedMesh>
    </group>
  );
}

/* ── Escena ───────────────────────────────────────────────────────────── */

export default function NaturalezaCienciaScene(p: NaturalezaSceneProps) {
  const { vista, modoColor, resetNonce } = p;
  const cam = useMemo((): { pos: Pt; target: Pt } => {
    if (vista === "revision") return { pos: [0, 6.4, 10.6], target: [0, -0.2, 0.2] };
    if (vista === "historia") return { pos: [0, 2.9, 9.2], target: [0, 0.9, 0] };
    if (p.prueba === "metal") return { pos: [1.3, 3.4, 8.4], target: [1.0, 0.8, 0] };
    if (p.prueba === "hervir") return { pos: [1.5, 3.6, 6.4], target: [0.2, 0.9, 0] };
    if (p.prueba === "cisnes") return { pos: [0, 5.2, 7.0], target: [0, 0, 0] };
    return { pos: [1.2, 3.4, 7.4], target: [0, 1.0, 0] };
  }, [vista, p.prueba]);

  return (
    <Canvas key={`${vista}-${p.prueba}-${resetNonce}`} shadows dpr={[1, 1.75]} camera={{ position: cam.pos, fov: 42 }} gl={{ antialias: true }}>
      {/* Suelo, luz de tres puntos y entorno que reflejar. */}
      {/* Sin altura: esta escena no tenía sombra de la que leerla, así
          que el escenario la MIDE de la propia escena al montarse, en
          vez de que alguien la adivine. */}
      <Escenario acento="#38bdf8" />
      <pointLight position={[-6, 3, 5]} intensity={0.4} color={modoColor} />

      {vista === "revision" && <EscenaRevision manuscritoId={p.manuscritoId} marcados={p.marcados} dictamen={p.dictamen} medidos={p.medidos} modoColor={modoColor} />}
      {vista === "falsabilidad" && (
        <group position={[0, -1.2, 0]}>
          {p.prueba === "metal" && <BancoMetal metalId={p.metalId} tempC={p.tempC} />}
          {p.prueba === "hervir" && <BancoHervir lugarId={p.lugarId} fuego={p.fuego} />}
          {p.prueba === "cisnes" && <BancoCisnes regionId={p.regionId} />}
          {p.prueba === "dragon" && <BancoDragon dragonPrueba={p.dragonPrueba} />}
        </group>
      )}
      {vista === "historia" && <EscenaHistoria casoId={p.casoId} hito={p.hito} modoColor={modoColor} />}

      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom
        minDistance={3.5}
        maxDistance={20}
        maxPolarAngle={Math.PI * 0.48}
        minPolarAngle={Math.PI * 0.05}
        target={cam.target}
      />
      <EffectComposer>
        <Bloom intensity={0.3} luminanceThreshold={0.62} luminanceSmoothing={0.85} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.65} />
      </EffectComposer>
    </Canvas>
  );
}
