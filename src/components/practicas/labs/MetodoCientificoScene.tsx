"use client";

/**
 * Escena 3D del laboratorio "Método científico: el experimento controlado y
 * la medición" (CNEYT-I-P06). Tres vistas:
 *
 *  - invernadero: tres grupos de plantas bajo lámparas con distintas horas de
 *    luz, su riego y su temperatura. Crecen día a día durante 21 días.
 *  - replicas: cinco niveles de luz por cinco plantas; el nivel de la media
 *    de cada fila y su variación.
 *  - medicion: la hoja (o el tallo, o la semilla) sobre una cinta, una regla
 *    o un calibrador vernier con su escala auxiliar de décimas de milímetro.
 *
 * Toda animación ocurre en useFrame mutando refs y avanza por tiempo, no por
 * cuadro. NO se usa <Text> de drei (cuelga el chunk con Turbopack): el texto
 * del lienzo va en <Html>.
 */

import * as THREE from "three";
import { useMemo, useRef, type ReactNode, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Escenario } from "./_escenario";
import {
  type Grupo,
  type Diseno,
  type Instrumento,
  GRUPOS,
  COLOR_GRUPO,
  LUZ_MAX,
  DIAS,
  altura,
  NIVELES_LUZ,
  REPLICAS,
  AGUA_BASE,
  media,
  desviacion,
  OBJETOS,
  num,
} from "./metodo-cientifico-data";

export type VistaMetodo = "invernadero" | "replicas" | "medicion";

export interface MetodoSceneProps {
  vista: VistaMetodo;
  diseno: Diseno;
  /** Vigor de la planta de cada grupo (A, B, C). */
  vigorGrupo: number[];
  /** 0 antes de regar; DIAS al terminar. La escena anima el avance. */
  diaObjetivo: number;
  /** Vigor de las 25 plantas de réplicas: fila = nivel de luz. */
  vigorReplicas: number[];
  replicas: 1 | 5;
  objetoId: string;
  instrumento: Instrumento;
  lupa: boolean;
  accent: string;
  modoColor: string;
  resetNonce: number;
}

type Pt = [number, number, number];

const CM = 0.12;
const suave = (dt: number, porCuadro: number) => 1 - Math.pow(1 - porCuadro, Math.min(dt, 0.25) * 60);

function Etiqueta({ pos, children, df = 10, col, izq }: { pos: Pt; children: ReactNode; df?: number; col?: string; izq?: boolean }) {
  return (
    <Html position={pos} center={!izq} distanceFactor={df} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 11px",
          borderRadius: 999,
          background: "rgba(4,10,22,0.84)",
          border: `1px solid ${col ?? "rgba(255,255,255,0.22)"}`,
          color: "#fff",
          fontSize: 12,
          fontWeight: 800,
          whiteSpace: "nowrap",
          boxShadow: "0 6px 18px -8px #000",
          transform: izq ? "translateY(-50%)" : undefined,
        }}
      >
        {children}
      </div>
    </Html>
  );
}

function Letra({ pos, children, df = 8, col = "#94a3b8", size = 12 }: { pos: Pt; children: ReactNode; df?: number; col?: string; size?: number }) {
  return (
    <Html position={pos} center distanceFactor={df} zIndexRange={[15, 0]} style={{ pointerEvents: "none" }}>
      <div style={{ color: col, fontSize: size, fontWeight: 800, whiteSpace: "nowrap", textShadow: "0 2px 6px #000" }}>{children}</div>
    </Html>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Planta
 * ════════════════════════════════════════════════════════════════════════ */

const NUDOS = 6;
const HOJA_GEO = new THREE.SphereGeometry(1, 20, 10);
const BASE_Y = 0.46;

interface RefsPlanta {
  tallo: RefObject<THREE.Mesh | null>;
  nudos: RefObject<THREE.Group | null>;
  tope: RefObject<THREE.Group | null>;
}

/** Ajusta tallo, pares de hojas y yema a una altura en cm (se llama desde useFrame). */
function ajustarPlanta({ tallo, nudos, tope }: RefsPlanta, cm: number, t: number, extraTope: number) {
  const y = Math.max(0.02, cm * CM);
  if (tallo.current) {
    tallo.current.scale.y = y;
    tallo.current.position.y = BASE_Y + y / 2;
  }
  if (nudos.current) {
    nudos.current.children.forEach((nudo, k) => {
      // Cada nudo aparece a su altura y crece; los de abajo son los más grandes.
      const f = (k + 0.6) / (NUDOS + 0.4);
      const tam = Math.min(1, Math.max(0, (cm - 1.2 - k * 1.3) / 2.6)) * (1 - k * 0.07);
      nudo.position.y = BASE_Y + y * f;
      nudo.scale.setScalar(Math.max(0.001, tam));
      nudo.rotation.z = Math.sin(t * 0.9 + k) * 0.03;
    });
  }
  if (tope.current) tope.current.position.y = BASE_Y + y + extraTope;
}

function Hoja({ lado, color, tenue }: { lado: 1 | -1; color: string; tenue: boolean }) {
  return (
    <group rotation={[0, 0, lado * 0.42]}>
      <mesh geometry={HOJA_GEO} position={[lado * 0.2, 0, 0]} scale={[0.2, 0.018, 0.085]} castShadow>
        <meshStandardMaterial color={color} roughness={0.5} transparent={tenue} opacity={tenue ? 0.22 : 1} />
      </mesh>
      <mesh position={[lado * 0.2, 0.012, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.004, 0.004, 0.36, 4]} />
        <meshBasicMaterial color="#d9f99d" transparent opacity={tenue ? 0.15 : 0.7} />
      </mesh>
    </group>
  );
}

/** Maceta, tallo, pares de hojas opuestas (cada par girado 90°) y yema. */
function CuerpoPlanta({ talloRef, nudosRef, topeRef, tenue = false, children }: { talloRef: RefsPlanta["tallo"]; nudosRef: RefsPlanta["nudos"]; topeRef: RefsPlanta["tope"]; tenue?: boolean; children?: ReactNode }) {
  const opacidad = tenue ? 0.22 : 1;
  return (
    <group>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.22, 0.4, 24]} />
        <meshStandardMaterial color="#b45309" roughness={0.8} transparent={tenue} opacity={opacidad} />
      </mesh>
      <mesh position={[0, 0.385, 0]}>
        <torusGeometry args={[0.29, 0.025, 8, 28]} />
        <meshStandardMaterial color="#c2610c" roughness={0.8} transparent={tenue} opacity={opacidad} />
      </mesh>
      <mesh position={[0, 0.41, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.03, 24]} />
        <meshStandardMaterial color="#3f2a14" roughness={1} transparent={tenue} opacity={opacidad} />
      </mesh>
      <mesh ref={talloRef} castShadow>
        <cylinderGeometry args={[0.022, 0.034, 1, 8]} />
        <meshStandardMaterial color="#4d7c0f" roughness={0.6} transparent={tenue} opacity={opacidad} />
      </mesh>
      <group ref={nudosRef}>
        {Array.from({ length: NUDOS }, (_, k) => (
          <group key={k} rotation={[0, (k * Math.PI) / 2 + 0.3, 0]} scale={0.001}>
            <Hoja lado={1} color={k % 2 ? "#65a30d" : "#84cc16"} tenue={tenue} />
            <Hoja lado={-1} color={k % 2 ? "#65a30d" : "#84cc16"} tenue={tenue} />
          </group>
        ))}
      </group>
      <group ref={topeRef}>
        <mesh position={[0, -0.22, 0]} scale={[0.05, 0.08, 0.05]}>
          <sphereGeometry args={[1, 12, 8]} />
          <meshStandardMaterial color="#a3e635" roughness={0.5} transparent={tenue} opacity={opacidad} />
        </mesh>
        {children}
      </group>
    </group>
  );
}


/** Planta en maceta cuya altura (cm) sigue a `alturaCm` suavemente. */
function Planta({ alturaCm, escala = 1, tenue = false }: { alturaCm: number; escala?: number; tenue?: boolean }) {
  const tallo = useRef<THREE.Mesh>(null);
  const nudos = useRef<THREE.Group>(null);
  const tope = useRef<THREE.Group>(null);
  const h = useRef(alturaCm);
  useFrame(({ clock }, dt) => {
    h.current += (alturaCm - h.current) * suave(dt, 0.2);
    ajustarPlanta({ tallo, nudos, tope }, h.current, clock.elapsedTime, 0.22);
  });
  return (
    <group scale={escala}>
      <CuerpoPlanta talloRef={tallo} nudosRef={nudos} topeRef={tope} tenue={tenue} />
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 1. INVERNADERO
 * ════════════════════════════════════════════════════════════════════════ */

const X_GRUPO: Record<Grupo, number> = { A: -2.9, B: 0, C: 2.9 };

function Lampara({ horas, color }: { horas: number; color: string }) {
  const f = horas / LUZ_MAX;
  return (
    <group position={[0, 3.3, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.18, 0.55, 0.32, 24, 1, true]} />
        <meshStandardMaterial color="#334155" side={THREE.DoubleSide} roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.12, 0]}>
        <sphereGeometry args={[0.14, 16, 12]} />
        <meshStandardMaterial color="#fff7d6" emissive="#fde68a" emissiveIntensity={0.2 + 2.2 * f} />
      </mesh>
      {f > 0 && (
        <mesh position={[0, -1.45, 0]}>
          <coneGeometry args={[1.05, 2.6, 28, 1, true]} />
          <meshBasicMaterial color="#fde68a" transparent opacity={0.04 + 0.14 * f} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      )}
      <pointLight position={[0, -0.4, 0]} intensity={0.2 + 2.4 * f} distance={4} color="#fde68a" />
      <Etiqueta pos={[0, 0.48, 0]} col={`${color}aa`} df={10}>
        <i className="fa-solid fa-lightbulb" style={{ color: "#fde68a" }} />
        {num(horas)} h de luz
      </Etiqueta>
    </group>
  );
}

function EscenaInvernadero({ diseno, vigorGrupo, diaObjetivo }: { diseno: Diseno; vigorGrupo: number[]; diaObjetivo: number }) {
  const dia = useRef(diaObjetivo);
  const alturas = useRef<Record<Grupo, number>>({ A: 2, B: 2, C: 2 });
  const etiquetaDia = useRef<HTMLSpanElement>(null);

  const aguaIgual = GRUPOS.every((g) => diseno.agua[g] === diseno.agua.A);
  const tempIgual = GRUPOS.every((g) => diseno.temperatura[g] === diseno.temperatura.A);

  useFrame((_, dt) => {
    // Por tiempo real (sin tope por cuadro) para no quedarse atrás del reloj del panel.
    const paso = dt * 4.2;
    if (dia.current < diaObjetivo) dia.current = Math.min(diaObjetivo, dia.current + paso);
    else dia.current = diaObjetivo;
    if (etiquetaDia.current) etiquetaDia.current.textContent = `Día ${Math.floor(dia.current)} de ${DIAS}`;
    GRUPOS.forEach((g, i) => {
      alturas.current[g] = altura(diseno.luz[g], diseno.agua[g], diseno.temperatura[g], dia.current, vigorGrupo[i] ?? 1);
    });
  });

  return (
    <group position={[0, -1.6, 0]}>
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[9.6, 0.1, 2.6]} />
        <meshStandardMaterial color="#1f2937" roughness={0.9} />
      </mesh>
      {GRUPOS.map((g, i) => {
        const col = COLOR_GRUPO[g];
        return (
          <group key={g} position={[X_GRUPO[g], 0, 0]}>
            <Lampara horas={diseno.luz[g]} color={col} />
            {/* Regla de fondo con marcas cada 2 cm */}
            <group position={[0.55, 0.46, -0.35]}>
              <mesh position={[0, (16 * CM) / 2, 0]}>
                <boxGeometry args={[0.16, 16 * CM, 0.02]} />
                <meshStandardMaterial color="#e5e7eb" roughness={0.7} />
              </mesh>
              {Array.from({ length: 9 }, (_, k) => (
                <mesh key={k} position={[-0.03, k * 2 * CM, 0.012]}>
                  <boxGeometry args={[0.1, 0.008, 0.004]} />
                  <meshBasicMaterial color="#111827" />
                </mesh>
              ))}
            </group>
            <PlantaViva grupo={g} alturas={alturas} color={col} />
            <Etiqueta pos={[0, -0.32, 1.1]} col={`${col}aa`} df={10}>
              <span style={{ color: col, fontWeight: 900 }}>Grupo {g}</span>
              <span style={{ color: aguaIgual ? "#cbd5e1" : "#f87171" }}>
                <i className="fa-solid fa-droplet" style={{ marginRight: 4 }} />
                {diseno.agua[g]} ml
              </span>
              <span style={{ color: tempIgual ? "#cbd5e1" : "#f87171" }}>
                <i className="fa-solid fa-temperature-half" style={{ marginRight: 4 }} />
                {diseno.temperatura[g]} °C
              </span>
            </Etiqueta>
            {i === 1 && (
              <Html position={[0, 4.35, 0]} center distanceFactor={10} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
                <div style={{ padding: "5px 12px", borderRadius: 999, background: "rgba(4,10,22,0.84)", border: "1px solid rgba(74,222,128,0.6)", color: "#fff", fontSize: 13, fontWeight: 900, whiteSpace: "nowrap" }}>
                  <i className="fa-solid fa-calendar-day" style={{ marginRight: 6, color: "#4ade80" }} />
                  <span ref={etiquetaDia}>Día 0 de {DIAS}</span>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}

/** Planta cuyo alto se lee cada cuadro de `alturas` (lo escribe el padre en su useFrame). */
function PlantaViva({ grupo, alturas, color }: { grupo: Grupo; alturas: RefObject<Record<Grupo, number>>; color: string }) {
  const tallo = useRef<THREE.Mesh>(null);
  const nudos = useRef<THREE.Group>(null);
  const tope = useRef<THREE.Group>(null);
  const texto = useRef<HTMLSpanElement>(null);
  useFrame(({ clock }) => {
    const cm = alturas.current?.[grupo] ?? 2;
    ajustarPlanta({ tallo, nudos, tope }, cm, clock.elapsedTime, 0.3);
    if (texto.current) texto.current.textContent = `${num(cm, 1)} cm`;
  });
  return (
    <CuerpoPlanta talloRef={tallo} nudosRef={nudos} topeRef={tope}>
      <Html center distanceFactor={10} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ padding: "4px 10px", borderRadius: 999, background: "rgba(4,10,22,0.84)", border: `1px solid ${color}aa`, color: "#fff", fontSize: 12, fontWeight: 900, whiteSpace: "nowrap" }}>
          <span ref={texto}>2.0 cm</span>
        </div>
      </Html>
    </CuerpoPlanta>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. RÉPLICAS
 * ════════════════════════════════════════════════════════════════════════ */

const SEP_X = 0.95;
const SEP_Z = 1.05;

function NivelMedia({ y, ancho, color }: { y: number; ancho: number; color: string }) {
  const ref = useRef<THREE.Group>(null);
  const v = useRef(y);
  useFrame((_, dt) => {
    v.current += (y - v.current) * suave(dt, 0.12);
    if (ref.current) ref.current.position.y = v.current;
  });
  return (
    <group ref={ref}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ancho, 0.7]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh>
        <boxGeometry args={[ancho, 0.015, 0.015]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

function EscenaReplicas({ vigorReplicas, replicas, modoColor }: { vigorReplicas: number[]; replicas: 1 | 5; modoColor: string }) {
  const ancho = (REPLICAS - 1) * SEP_X;
  return (
    <group position={[0.4, -1.5, 0]}>
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[ancho + 3.2, 0.1, NIVELES_LUZ.length * SEP_Z + 0.6]} />
        <meshStandardMaterial color="#1f2937" roughness={0.9} />
      </mesh>
      {NIVELES_LUZ.map((luz, fila) => {
        const z = (fila - (NIVELES_LUZ.length - 1) / 2) * SEP_Z;
        const alturas = Array.from({ length: REPLICAS }, (_, k) => altura(luz, AGUA_BASE, 22, DIAS, vigorReplicas[fila * REPLICAS + k] ?? 1));
        const usadas = alturas.slice(0, replicas);
        const m = media(usadas);
        const sd = desviacion(usadas);
        return (
          <group key={luz} position={[0, 0, z]}>
            {alturas.map((h, k) => (
              <group key={k} position={[(k - (REPLICAS - 1) / 2) * SEP_X, 0, 0]}>
                <Planta alturaCm={h} escala={0.85} tenue={k >= replicas} />
              </group>
            ))}
            <group position={[0, 0.39 + m * CM * 0.85, 0]}>
              <NivelMedia y={0} ancho={ancho + 0.8} color={modoColor} />
            </group>
            <Etiqueta pos={[-ancho / 2 - 0.75, 0.3, 0]} df={11} col={`${modoColor}aa`}>
              <i className="fa-solid fa-lightbulb" style={{ color: "#fde68a" }} />
              {luz} h
            </Etiqueta>
            <Etiqueta pos={[ancho / 2 + 0.6, 0.55, 0]} df={11} izq>
              {replicas === 1 ? `${num(m, 1)} cm` : `x̄ ${num(m, 1)} · s ${num(sd, 1)} cm`}
            </Etiqueta>
          </group>
        );
      })}
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. MEDICIÓN
 * ════════════════════════════════════════════════════════════════════════ */

const U_MM = 0.05;
const LARGO_MM = 150;
const X0 = -(LARGO_MM * U_MM) / 2 + 0.3;

function Marcas({ cada, alto, grosor, desde = 0, hasta = LARGO_MM, color = "#111827", y = 0.021, z = 0 }: { cada: number; alto: number; grosor: number; desde?: number; hasta?: number; color?: string; y?: number; z?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const n = Math.floor((hasta - desde) / cada + 1e-6) + 1;
  const puesto = useRef(-1);
  useFrame(() => {
    const mesh = ref.current;
    if (!mesh || puesto.current === n) return;
    const d = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      d.position.set(X0 + (desde + i * cada) * U_MM, y, z - alto / 2);
      d.scale.set(grosor, 1, alto);
      d.updateMatrix();
      mesh.setMatrixAt(i, d.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    puesto.current = n;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, n]} frustumCulled={false}>
      <boxGeometry args={[1, 0.004, 1]} />
      <meshBasicMaterial color={color} />
    </instancedMesh>
  );
}

function Objeto({ id, mm }: { id: string; mm: number }) {
  const largo = mm * U_MM;
  const cx = X0 + largo / 2;
  if (id === "semilla")
    return (
      <mesh position={[cx, 0.13, 0.35]} scale={[largo / 2, 0.1, 0.22]} castShadow>
        <sphereGeometry args={[1, 32, 16]} />
        <meshStandardMaterial color="#7c2d12" roughness={0.45} />
      </mesh>
    );
  if (id === "tallo")
    return (
      <mesh position={[cx, 0.07, 0.35]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.045, 0.06, largo, 12]} />
        <meshStandardMaterial color="#4d7c0f" roughness={0.6} />
      </mesh>
    );
  return (
    <group position={[cx, 0.05, 0.38]}>
      <mesh scale={[largo / 2, 0.02, 0.5]} castShadow>
        <sphereGeometry args={[1, 40, 16]} />
        <meshStandardMaterial color="#65a30d" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.022, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, largo * 0.96, 6]} />
        <meshStandardMaterial color="#d9f99d" />
      </mesh>
    </group>
  );
}

function EscenaMedicion({ objetoId, instrumento }: { objetoId: string; instrumento: Instrumento }) {
  const obj = OBJETOS.find((o) => o.id === objetoId) ?? OBJETOS[0]!;
  const finObjeto = X0 + obj.mm * U_MM;
  const cmLabels = Array.from({ length: LARGO_MM / 10 + 1 }, (_, k) => k);
  return (
    <group position={[0, -0.6, 0]}>
      <mesh position={[0, -0.08, 0.2]} receiveShadow>
        <boxGeometry args={[LARGO_MM * U_MM + 1.6, 0.12, 3.2]} />
        <meshStandardMaterial color="#6b4423" roughness={0.75} />
      </mesh>
      {/* Cuerpo del instrumento */}
      <mesh position={[X0 + (LARGO_MM * U_MM) / 2 - 0.15, 0.0, -0.3]} receiveShadow>
        <boxGeometry args={[LARGO_MM * U_MM + 0.5, 0.04, instrumento === "cinta" ? 0.5 : 0.75]} />
        <meshStandardMaterial color={instrumento === "cinta" ? "#fde047" : instrumento === "regla" ? "#f1f5f9" : "#cbd5e1"} roughness={instrumento === "vernier" ? 0.25 : 0.6} metalness={instrumento === "vernier" ? 0.6 : 0} />
      </mesh>
      {/* Marcas */}
      {instrumento === "cinta" ? (
        <Marcas cada={10} alto={0.3} grosor={0.018} z={0.05 - 0.3 + 0.25} />
      ) : (
        <>
          <Marcas cada={1} alto={0.14} grosor={0.007} z={0.07} />
          <Marcas cada={5} alto={0.22} grosor={0.009} z={0.07} />
          <Marcas cada={10} alto={0.32} grosor={0.012} z={0.07} />
        </>
      )}
      {cmLabels.map((k) => (
        <Letra key={k} pos={[X0 + k * 10 * U_MM, 0.03, instrumento === "cinta" ? -0.35 : -0.42]} size={11} col="#111827" df={5}>
          {k}
        </Letra>
      ))}

      {/* Mandíbula fija en el cero y objeto */}
      <mesh position={[X0 - 0.06, 0.12, 0.25]} castShadow>
        <boxGeometry args={[0.08, 0.2, 1.0]} />
        <meshStandardMaterial color={instrumento === "vernier" ? "#94a3b8" : "#475569"} metalness={0.4} roughness={0.35} />
      </mesh>
      <Objeto id={obj.id} mm={obj.mm} />

      {/* Vernier: mandíbula móvil con escala auxiliar de 10 divisiones en 9 mm */}
      {instrumento === "vernier" && (
        <group position={[finObjeto, 0, 0]}>
          {/* La mandíbula toca el objeto por delante de la escala: el cero del nonio queda visible */}
          <mesh position={[0.03, 0.12, 0.6]} castShadow>
            <boxGeometry args={[0.06, 0.2, 0.56]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.55} roughness={0.3} />
          </mesh>
          <mesh position={[0.26, 0.035, 0.18]}>
            <boxGeometry args={[0.62, 0.02, 0.24]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.3} roughness={0.35} />
          </mesh>
          {Array.from({ length: 11 }, (_, k) => (
            <mesh key={k} position={[k * 0.9 * U_MM, 0.047, 0.12 + (k % 5 === 0 ? 0.075 : 0.05)]}>
              <boxGeometry args={[0.006, 0.004, k % 5 === 0 ? 0.15 : 0.1]} />
              <meshBasicMaterial color="#b91c1c" />
            </mesh>
          ))}
          <mesh position={[0.03, 0.06, 0.345]}>
            <boxGeometry args={[0.06, 0.06, 0.09]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.55} roughness={0.3} />
          </mesh>
          <Letra pos={[0, 0.05, 0.02]} size={9} col="#b91c1c" df={4}>
            0
          </Letra>
          <Letra pos={[10 * 0.9 * U_MM, 0.05, 0.02]} size={9} col="#b91c1c" df={4}>
            10
          </Letra>
        </group>
      )}
      <Etiqueta pos={[X0 + (obj.mm * U_MM) / 2, 0.55, 0.9]} col="#65a30daa" df={8}>
        {obj.etq}
      </Etiqueta>
    </group>
  );
}

/* ── Escena ───────────────────────────────────────────────────────────── */

export default function MetodoCientificoScene(p: MetodoSceneProps) {
  const { vista, modoColor, resetNonce } = p;
  const obj = OBJETOS.find((o) => o.id === p.objetoId) ?? OBJETOS[0]!;
  const finObjeto = X0 + obj.mm * U_MM;
  const cam = useMemo((): { pos: Pt; target: Pt } => {
    if (vista === "invernadero") return { pos: [0, 2.2, 9.6], target: [0, 0.2, 0] };
    if (vista === "replicas") return { pos: [5.2, 5.0, 6.8], target: [0, -0.6, 0] };
    if (p.lupa) return { pos: [finObjeto + 0.15, 1.5, 0.9], target: [finObjeto + 0.15, -0.6, -0.05] };
    return { pos: [0, 6.2, 1.7], target: [0, -0.6, 0.1] };
  }, [vista, p.lupa, finObjeto]);

  return (
    <Canvas key={`${vista}-${p.lupa}-${p.objetoId}-${resetNonce}`} shadows dpr={[1, 1.75]} camera={{ position: cam.pos, fov: 42 }} gl={{ antialias: true }}>
      {/* Suelo, luz de tres puntos y entorno que reflejar. */}
      {/* Sin altura: esta escena no tenía sombra de la que leerla, así
          que el escenario la MIDE de la propia escena al montarse, en
          vez de que alguien la adivine. */}
      <Escenario acento={p.accent} />
      <pointLight position={[-6, 2, 5]} intensity={0.35} color={modoColor} />

      {vista === "invernadero" && <EscenaInvernadero diseno={p.diseno} vigorGrupo={p.vigorGrupo} diaObjetivo={p.diaObjetivo} />}
      {vista === "replicas" && <EscenaReplicas vigorReplicas={p.vigorReplicas} replicas={p.replicas} modoColor={modoColor} />}
      {vista === "medicion" && <EscenaMedicion objetoId={p.objetoId} instrumento={p.instrumento} />}

      <OrbitControls makeDefault enablePan={false} enableZoom minDistance={vista === "medicion" ? 0.8 : 4} maxDistance={20} maxPolarAngle={Math.PI * 0.49} minPolarAngle={Math.PI * 0.02} target={cam.target} />
      <EffectComposer>
        <Bloom intensity={0.3} luminanceThreshold={0.62} luminanceSmoothing={0.85} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.65} />
      </EffectComposer>
    </Canvas>
  );
}
