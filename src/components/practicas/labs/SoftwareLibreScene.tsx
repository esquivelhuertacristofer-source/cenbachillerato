"use client";

/**
 * Escena 3D del laboratorio "Software libre y alternativas" (CD-I-P09).
 * Tres vistas:
 *
 *  - licencias: la caja del programa con cuatro compartimentos, uno por
 *    libertad. Cada tapa se abre o se queda con candado según la licencia; un
 *    proyector muestra lo que recibes (código fuente, binario o nada, porque
 *    el programa corre en un servidor ajeno). Con GPL o MIT sale una segunda
 *    caja: la versión modificada que distribuye una empresa.
 *  - formatos: la cápsula del tiempo. Un archivo guardado en 2007 viaja a
 *    2026; al abrirse, tres programas intentan leerlo y le lanzan un haz del
 *    color de su resultado. El archivo llega íntegro, cambiado o con pedazos
 *    perdidos. A la izquierda, el estante del archivo escolar.
 *  - costos: la sala de cómputo con 10 a 40 equipos (cada pantalla dividida
 *    en ofimática e imagen, del color de su ruta) y las pilas de monedas del
 *    costo de cada necesidad. Al dejar de pagar, las pantallas de suscripción
 *    se bloquean.
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
  type LicenciaId,
  type EntregableId,
  type FormatoId,
  type NecesidadId,
  type Ruta,
  LICENCIAS,
  LIBERTADES,
  ENTREGA_DEF,
  CODIGO_EJEMPLO,
  FORMATOS,
  ENTREGABLES,
  RESULTADO_DEF,
  ANIO_GUARDADO,
  ANIO_HOY,
  NECESIDADES,
  RUTA_DEF,
  EQ_MAX,
  TC_MXN,
  costoUSD,
  valorMoneda,
  num,
} from "./software-libre-data";

export type FaseCapsula = "cerrada" | "abriendo" | "abierta";

export interface SoftwareLibreSceneProps {
  vista: Modo;
  modoColor: string;
  resetNonce: number;
  // Licencias
  licenciaId: LicenciaId;
  prediccion: boolean[];
  revelada: boolean;
  derivada: boolean;
  // Formatos
  formatoId: FormatoId;
  fase: FaseCapsula;
  /** Último formato abierto de cada entregable. */
  archivo: Partial<Record<EntregableId, FormatoId>>;
  // Costos
  equipos: number;
  anios: number;
  rutas: Record<NecesidadId, Ruta>;
  sinPago: boolean;
}

type Pt = [number, number, number];

const suave = (dt: number, porCuadro: number) => 1 - Math.pow(1 - porCuadro, Math.min(dt, 0.25) * 60);
const OK = "#34d399";
const NO = "#f87171";
/** drei <Html> solo reaplica su escala cuando la etiqueta se mueve en pantalla; con este factor la etiqueta mide casi lo mismo escalada o sin escalar. */
const DF = 0.62;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

function Etiqueta({ pos, children, df = 10, col, fs = 12 }: { pos: Pt; children: ReactNode; df?: number; col?: string; fs?: number }) {
  return (
    <Html position={pos} center distanceFactor={df * DF} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
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

/* ════════════════════════════════════════════════════════════════════════
 * 1. LA CAJA DE LAS LIBERTADES
 * ════════════════════════════════════════════════════════════════════════ */

const ANCHO_CAJA = 2.4;
const ALTO_CAJA = 1.2;
const LADO_TAPA = 1.1;
const CAJA_BODY = new THREE.BoxGeometry(ANCHO_CAJA, ALTO_CAJA, ANCHO_CAJA);
const CAJA_BORDES = new THREE.EdgesGeometry(CAJA_BODY);
/** Compartimentos: 0 atrás-izq, 1 atrás-der, 2 frente-izq, 3 frente-der. */
const POS_COMP: [number, number][] = [
  [-0.6, -0.6],
  [0.6, -0.6],
  [-0.6, 0.6],
  [0.6, 0.6],
];
const BINARIO: string[] = Array.from({ length: 7 }, (_, r) => Array.from({ length: 24 }, (_, c) => ((r * 7 + c * 13 + ((r * c) % 5)) % 3 === 0 ? "1" : "0")).join(""));

function Compartimento({ i, abre, revelada, predicha, conEtiqueta, colorLic }: { i: number; abre: boolean; revelada: boolean; predicha: boolean | null; conEtiqueta: boolean; colorLic: string }) {
  const lib = LIBERTADES[i]!;
  const [x, z] = POS_COMP[i]!;
  const tapa = useRef<THREE.Group>(null);
  const gema = useRef<THREE.Mesh>(null);
  const candado = useRef<THREE.Group>(null);
  const ang = useRef(0);
  const sube = useRef(0);
  const cierra = useRef(0);
  useFrame(({ clock }, dt) => {
    const abierta = revelada && abre;
    ang.current += ((abierta ? -1.95 : 0) - ang.current) * suave(dt, 0.07);
    if (tapa.current) tapa.current.rotation.x = ang.current;
    sube.current += ((abierta ? 1 : 0) - sube.current) * suave(dt, 0.05);
    if (gema.current) {
      gema.current.position.y = ALTO_CAJA - 0.1 + sube.current * 0.7 + Math.sin(clock.elapsedTime * 2 + i) * 0.04 * sube.current;
      gema.current.rotation.y = clock.elapsedTime * 1.3 + i;
      gema.current.scale.setScalar(Math.max(0.001, sube.current) * 0.26);
    }
    cierra.current += ((revelada && !abre ? 1 : 0) - cierra.current) * suave(dt, 0.12);
    if (candado.current) {
      candado.current.visible = cierra.current > 0.01;
      candado.current.scale.setScalar(Math.max(0.001, cierra.current));
    }
  });
  const predColor = predicha === null ? colorLic : predicha ? "#7dd3fc" : "#475569";
  const bienPredicho = predicha !== null && predicha === abre;
  const colTapa = !revelada && predicha ? "#1e3a5f" : "#1f2937";
  return (
    <group position={[x, 0, z]}>
      {/* Hueco luminoso del compartimento */}
      <mesh position={[0, ALTO_CAJA + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[LADO_TAPA - 0.1, LADO_TAPA - 0.1]} />
        <meshStandardMaterial color={lib.color} emissive={lib.color} emissiveIntensity={0.9} />
      </mesh>
      <mesh ref={gema} position={[0, ALTO_CAJA, 0]} scale={0.001}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={lib.color} emissive={lib.color} emissiveIntensity={1.3} roughness={0.2} metalness={0.2} />
      </mesh>
      {/* Tapa con bisagra en el borde trasero */}
      <group ref={tapa} position={[0, ALTO_CAJA + 0.045, -LADO_TAPA / 2]}>
        <mesh position={[0, 0, LADO_TAPA / 2]} castShadow>
          <boxGeometry args={[LADO_TAPA - 0.02, 0.08, LADO_TAPA - 0.02]} />
          <meshStandardMaterial color={colTapa} roughness={0.35} metalness={0.5} emissive={predColor} emissiveIntensity={!revelada && predicha ? 0.35 : 0.04} />
        </mesh>
        <mesh position={[0, 0.045, LADO_TAPA / 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.2, 0.26, 32]} />
          <meshBasicMaterial color={lib.color} />
        </mesh>
      </group>
      <group ref={candado} position={[0, ALTO_CAJA + 0.3, 0.1]} visible={false}>
        <mesh castShadow>
          <boxGeometry args={[0.34, 0.27, 0.12]} />
          <meshStandardMaterial color={NO} emissive={NO} emissiveIntensity={0.45} metalness={0.4} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.13, 0]}>
          <torusGeometry args={[0.11, 0.03, 10, 20, Math.PI]} />
          <meshStandardMaterial color="#e5e7eb" metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[0, -0.02, 0.065]}>
          <circleGeometry args={[0.035, 16]} />
          <meshBasicMaterial color="#1f2937" />
        </mesh>
      </group>
      {conEtiqueta && (
        <Html position={[x < 0 ? -0.32 : 0.32, z < 0 ? 2.5 : 1.9, 0]} center distanceFactor={12 * DF} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 10px",
              borderRadius: 999,
              background: "rgba(4,10,22,0.88)",
              border: `1px solid ${revelada ? (bienPredicho ? OK : NO) : predicha ? "#7dd3fc" : "rgba(255,255,255,0.22)"}`,
              color: "#fff",
              fontSize: 11.5,
              fontWeight: 800,
              whiteSpace: "nowrap",
            }}
          >
            <i className={`fa-solid ${lib.icono}`} style={{ color: lib.color }} />
            {lib.n} · {lib.corto}
            {revelada ? (
              <i className={`fa-solid ${abre ? "fa-lock-open" : "fa-lock"}`} style={{ color: abre ? OK : NO, marginLeft: 2 }} />
            ) : (
              predicha !== null && <i className={`fa-solid ${predicha ? "fa-lock-open" : "fa-lock"}`} style={{ color: predicha ? "#7dd3fc" : "#64748b", marginLeft: 2, fontSize: 10 }} />
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

function Caja({ x, entrada, escala, colorLic, abiertas, predichas, revelada, hueca, conEtiquetas }: { x: number; entrada: boolean; escala: number; colorLic: string; abiertas: boolean[]; predichas: boolean[] | null; revelada: boolean; hueca: boolean; conEtiquetas: boolean }) {
  const grupo = useRef<THREE.Group>(null);
  const px = useRef(entrada ? 6 : x);
  useFrame((_, dt) => {
    px.current += (x - px.current) * suave(dt, 0.06);
    if (grupo.current) grupo.current.position.x = px.current;
  });
  return (
    <group ref={grupo} position={[entrada ? 6 : x, 0, 0]} scale={escala}>
      <mesh geometry={CAJA_BODY} position={[0, ALTO_CAJA / 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.45} transparent={hueca} opacity={hueca ? 0.28 : 1} depthWrite={!hueca} />
      </mesh>
      <lineSegments geometry={CAJA_BORDES} position={[0, ALTO_CAJA / 2, 0]}>
        <lineBasicMaterial color={colorLic} />
      </lineSegments>
      {/* Divisiones entre compartimentos */}
      <mesh position={[0, ALTO_CAJA + 0.02, 0]}>
        <boxGeometry args={[ANCHO_CAJA, 0.04, 0.06]} />
        <meshStandardMaterial color={colorLic} emissive={colorLic} emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0, ALTO_CAJA + 0.02, 0]}>
        <boxGeometry args={[0.06, 0.04, ANCHO_CAJA]} />
        <meshStandardMaterial color={colorLic} emissive={colorLic} emissiveIntensity={0.6} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <Compartimento key={i} i={i} abre={abiertas[i] ?? false} revelada={revelada} predicha={predichas ? (predichas[i] ?? false) : null} conEtiqueta={conEtiquetas} colorLic={colorLic} />
      ))}
    </group>
  );
}

function Servidor() {
  const leds = useRef<THREE.InstancedMesh>(null);
  const paquetes = useRef<THREE.InstancedMesh>(null);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const tmp = useMemo(() => new THREE.Color(), []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const l = leds.current;
    if (l) {
      for (let k = 0; k < 12; k++) {
        obj.position.set(-0.3 + (k % 3) * 0.12, 0.35 + Math.floor(k / 3) * 0.42, 0.36);
        obj.scale.setScalar(1);
        obj.updateMatrix();
        l.setMatrixAt(k, obj.matrix);
        const on = Math.sin(t * (3 + (k % 5)) + k * 1.7) > 0;
        l.setColorAt(k, tmp.set(on ? "#34d399" : "#0f3b2e"));
      }
      l.instanceMatrix.needsUpdate = true;
      if (l.instanceColor) l.instanceColor.needsUpdate = true;
    }
    const p = paquetes.current;
    if (p) {
      for (let k = 0; k < 8; k++) {
        const f = (t * 0.45 + k / 8) % 1;
        // Del servidor (x = 0) a la caja (x = −3.2): solo viaja la imagen del resultado.
        obj.position.set(-f * 3.0, 1.4 + Math.sin(f * Math.PI) * 0.5, 0.2 - f * 0.4);
        obj.scale.setScalar(0.07);
        obj.updateMatrix();
        p.setMatrixAt(k, obj.matrix);
      }
      p.instanceMatrix.needsUpdate = true;
    }
  });
  return (
    <group position={[3.4, 0, -0.6]}>
      <mesh position={[0, 0.95, 0]} castShadow>
        <boxGeometry args={[1.0, 1.9, 0.7]} />
        <meshStandardMaterial color="#1e1b4b" metalness={0.5} roughness={0.35} />
      </mesh>
      {[0, 1, 2, 3].map((k) => (
        <mesh key={k} position={[0, 0.35 + k * 0.42, 0.355]}>
          <boxGeometry args={[0.88, 0.32, 0.02]} />
          <meshStandardMaterial color="#312e81" metalness={0.4} roughness={0.4} />
        </mesh>
      ))}
      <instancedMesh ref={leds} args={[undefined, undefined, 12]} frustumCulled={false}>
        <sphereGeometry args={[0.035, 8, 6]} />
        <meshBasicMaterial />
      </instancedMesh>
      <instancedMesh ref={paquetes} args={[undefined, undefined, 8]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#c084fc" emissive="#c084fc" emissiveIntensity={1} />
      </instancedMesh>
      <Etiqueta pos={[0, 2.3, 0]} df={9} col="#c084fcaa" fs={11}>
        <i className="fa-solid fa-server" style={{ color: "#c084fc" }} />
        Servidor del proveedor: aquí vive el programa
      </Etiqueta>
    </group>
  );
}

function Proyector({ entrega, color }: { entrega: "fuente" | "binario" | "servidor"; color: string }) {
  const haz = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (haz.current) (haz.current.material as THREE.MeshBasicMaterial).opacity = 0.1 + 0.04 * Math.sin(clock.elapsedTime * 3);
  });
  const def = ENTREGA_DEF[entrega];
  const colPanel = entrega === "fuente" ? OK : entrega === "binario" ? "#fb923c" : "#c084fc";
  return (
    <group position={[-3.3, 0, -1.6]}>
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.36, 0.44, 0.24, 24]} />
        <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.03, 24]} />
        <meshStandardMaterial color={colPanel} emissive={colPanel} emissiveIntensity={1.2} />
      </mesh>
      <mesh ref={haz} position={[0, 1.05, 0]}>
        <cylinderGeometry args={[0.9, 0.22, 1.6, 24, 1, true]} />
        <meshBasicMaterial color={colPanel} transparent opacity={0.12} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <Html position={[0, 2.45, 0]} center distanceFactor={9 * DF} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ width: 272, borderRadius: 12, background: "rgba(4,10,22,0.92)", border: `1px solid ${colPanel}`, boxShadow: `0 0 26px -6px ${colPanel}`, overflow: "hidden" }}>
          <div style={{ padding: "6px 10px", fontSize: 11, fontWeight: 900, color: "#fff", borderBottom: `1px solid ${colPanel}55`, display: "flex", gap: 6, alignItems: "center" }}>
            <i className={`fa-solid ${def.icono}`} style={{ color: colPanel }} />
            Lo que recibes: {def.etq.toLowerCase()}
          </div>
          {entrega === "fuente" && (
            <pre style={{ margin: 0, padding: "8px 10px", fontSize: 10, lineHeight: 1.45, color: "#d1fae5", fontFamily: "ui-monospace, monospace", whiteSpace: "pre" }}>
              {CODIGO_EJEMPLO.map((l, k) => (
                <div key={k}>
                  <span style={{ color: "#64748b", marginRight: 8 }}>{k + 1}</span>
                  {l}
                </div>
              ))}
            </pre>
          )}
          {entrega === "binario" && (
            <pre style={{ margin: 0, padding: "8px 10px", fontSize: 10.5, lineHeight: 1.35, color: "#fdba74", fontFamily: "ui-monospace, monospace", letterSpacing: "0.06em" }}>
              {BINARIO.map((l, k) => (
                <div key={k}>{l}</div>
              ))}
            </pre>
          )}
          {entrega === "servidor" && (
            <div style={{ padding: "18px 10px", textAlign: "center", color: "#e9d5ff", fontSize: 12, fontWeight: 800 }}>
              <i className="fa-solid fa-cloud" style={{ fontSize: 22, color: "#c084fc", display: "block", marginBottom: 6 }} />
              Nada se instala: solo ves la página
            </div>
          )}
        </div>
      </Html>
      <Etiqueta pos={[0, 0.02, 0.75]} df={10} col={`${color}88`} fs={10}>
        Proyector de lo que te entregan
      </Etiqueta>
    </group>
  );
}

function EscenaLicencias({ licenciaId, prediccion, revelada, derivada }: { licenciaId: LicenciaId; prediccion: boolean[]; revelada: boolean; derivada: boolean }) {
  const lic = LICENCIAS.find((l) => l.id === licenciaId) ?? LICENCIAS[0]!;
  const conDerivada = derivada && revelada && !!lic.derivada;
  const colDer = lic.derivada?.libre ? lic.color : NO;
  return (
    <group position={[0, -1.1, 0]}>
      <mesh position={[0, -0.06, 0]} receiveShadow>
        <cylinderGeometry args={[5.6, 5.6, 0.12, 64]} />
        <meshStandardMaterial color="#0f1b2d" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.0, 2.06, 64]} />
        <meshBasicMaterial color={lic.color} transparent opacity={0.5} />
      </mesh>
      <Caja key={`main-${licenciaId}`} x={0} entrada={false} escala={1} colorLic={lic.color} abiertas={lic.libertades} predichas={prediccion} revelada={revelada} hueca={lic.entrega === "servidor"} conEtiquetas />
      <Etiqueta pos={[0, -0.02, 1.75]} df={10} col={`${lic.color}aa`} fs={12}>
        <i className="fa-solid fa-scroll" style={{ color: lic.color }} />
        {lic.etq} · {lic.ejemplo}
        <span style={{ marginLeft: 4, padding: "1px 7px", borderRadius: 7, fontSize: 10.5, background: lic.precio === "gratis" ? "#78350f" : "#1e3a8a", color: lic.precio === "gratis" ? "#fde68a" : "#bfdbfe" }}>
          <i className="fa-solid fa-tag" style={{ marginRight: 4 }} />
          {lic.precio}
        </span>
      </Etiqueta>
      <Proyector entrega={lic.entrega} color={lic.color} />
      {lic.entrega === "servidor" && <Servidor />}
      {conDerivada && (
        <>
          <group position={[0, 0, 0.6]}>
            <Caja key={`der-${licenciaId}`} x={2.45} entrada escala={0.62} colorLic={colDer} abiertas={[0, 1, 2, 3].map(() => !!lic.derivada?.libre)} predichas={null} revelada hueca={false} conEtiquetas={false} />
          </group>
          <Etiqueta pos={[2.45, 1.35, 0.6]} df={13} col={`${colDer}aa`} fs={11}>
            <i className={`fa-solid ${lic.derivada?.libre ? "fa-code-branch" : "fa-building-lock"}`} style={{ color: colDer }} />
            {lic.derivada?.libre ? "Versión modificada: sigue siendo libre" : "Versión modificada: la empresa la cerró"}
          </Etiqueta>
          <mesh position={[1.62, 0.45, 0.5]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.16, 0.36, 16]} />
            <meshStandardMaterial color={colDer} emissive={colDer} emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[1.32, 0.45, 0.5]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.05, 0.5, 12]} />
            <meshStandardMaterial color={colDer} emissive={colDer} emissiveIntensity={0.6} />
          </mesh>
        </>
      )}
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. CÁPSULA DEL TIEMPO
 * ════════════════════════════════════════════════════════════════════════ */

const T_ANIOS = 2.3;
const COLOR_ENTREGABLE: Record<EntregableId, string[]> = {
  tarea: ["#f8fafc", "#e2e8f0", "#f1f5f9", "#e2e8f0", "#f8fafc", "#f1f5f9"],
  foto: ["#7dd3fc", "#38bdf8", "#86efac", "#4ade80", "#a16207", "#854d0e"],
  logo: ["#f5f3ff", "#c4b5fd", "#a78bfa", "#8b5cf6", "#ede9fe", "#ddd6fe"],
  animacion: ["#fde68a", "#fbbf24", "#fcd34d", "#f59e0b", "#fde68a", "#fbbf24"],
};
const TILE_W = 0.5;
const TILE_H = 0.44;
const POS_LECTOR: Pt[] = [
  [-2.7, 0, -1.2],
  [0, 0, -2.6],
  [2.7, 0, -1.2],
];
const CENTRO_ARCHIVO = new THREE.Vector3(0, 1.4, 0);
const ALTOS_MONITOR = [1.5, 2.75, 1.5];

function Pieza({ i, color, pierde, gris }: { i: number; color: string; pierde: boolean; gris: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const f = useRef(0);
  const base = useMemo(() => new THREE.Color(color), [color]);
  const apagado = useMemo(() => new THREE.Color("#334155"), []);
  const tmp = useMemo(() => new THREE.Color(), []);
  const col = i % 2;
  const fila = Math.floor(i / 2);
  const x0 = (col - 0.5) * (TILE_W + 0.02);
  const y0 = (1 - fila) * (TILE_H + 0.02);
  useFrame(({ clock }, dt) => {
    f.current += ((pierde ? 1 : 0) - f.current) * suave(dt, 0.04);
    if (ref.current) {
      const dir = col === 0 ? -1 : 1;
      ref.current.position.set(x0 + dir * f.current * 0.55, y0 - f.current * 0.35 + Math.sin(clock.elapsedTime * 1.5 + i) * 0.04 * f.current, f.current * 0.35);
      ref.current.rotation.set(f.current * 0.4, 0, dir * f.current * 0.7);
    }
    if (mat.current) {
      tmp.copy(base).lerp(apagado, gris ? f.current : 0);
      mat.current.color.copy(tmp);
      mat.current.opacity = 1 - f.current * 0.45;
    }
  });
  return (
    <group ref={ref} position={[x0, y0, 0]}>
      <mesh castShadow>
        <boxGeometry args={[TILE_W, TILE_H, 0.07]} />
        <meshStandardMaterial ref={mat} color={color} roughness={0.55} transparent />
      </mesh>
      {[0, 1, 2].map((k) => (
        <mesh key={k} position={[-0.02 + (k === 2 ? -0.06 : 0), 0.12 - k * 0.12, 0.04]}>
          <boxGeometry args={[k === 2 ? 0.26 : 0.38, 0.035, 0.005]} />
          <meshBasicMaterial color="#475569" transparent opacity={0.55} />
        </mesh>
      ))}
    </group>
  );
}

function Lector({ idx, programa, libre, resultado, activo }: { idx: number; programa: string; libre: boolean; resultado: keyof typeof RESULTADO_DEF; activo: boolean }) {
  const pos = POS_LECTOR[idx]!;
  const ALTO_MONITOR = ALTOS_MONITOR[idx]!;
  const haz = useRef<THREE.Mesh>(null);
  const pantalla = useRef<THREE.MeshStandardMaterial>(null);
  const g = useRef(0);
  const colRes = RESULTADO_DEF[resultado].color;
  const gris = useMemo(() => new THREE.Color("#1e293b"), []);
  const colorRes = useMemo(() => new THREE.Color(colRes), [colRes]);
  const rotY = Math.atan2(-pos[0], -pos[2]);
  const { medio, largo, quat } = useMemo(() => {
    const a = new THREE.Vector3(pos[0], ALTOS_MONITOR[idx]!, pos[2]);
    const d = CENTRO_ARCHIVO.clone().sub(a);
    const l = d.length();
    return { medio: a.clone().add(d.clone().multiplyScalar(0.5)), largo: l, quat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()) };
  }, [pos, idx]);
  useFrame(({ clock }, dt) => {
    g.current += ((activo ? 1 : 0) - g.current) * suave(dt, 0.06);
    if (haz.current) {
      haz.current.visible = activo && resultado !== "no" && g.current > 0.02;
      haz.current.scale.set(1 + 0.15 * Math.sin(clock.elapsedTime * 6 + idx), g.current, 1 + 0.15 * Math.sin(clock.elapsedTime * 6 + idx));
    }
    if (pantalla.current) {
      pantalla.current.color.copy(gris).lerp(colorRes, g.current * 0.85);
      pantalla.current.emissive.copy(gris).lerp(colorRes, g.current);
    }
  });
  return (
    <>
      <group position={pos} rotation={[0, rotY, 0]}>
        <mesh position={[0, (ALTO_MONITOR - 0.4) / 2, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.09, ALTO_MONITOR - 0.4, 12]} />
          <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.4, 0.45, 0.06, 24]} />
          <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0, ALTO_MONITOR, 0]} castShadow>
          <boxGeometry args={[1.25, 0.85, 0.08]} />
          <meshStandardMaterial color="#0b1220" metalness={0.4} roughness={0.35} />
        </mesh>
        <mesh position={[0, ALTO_MONITOR, 0.045]}>
          <planeGeometry args={[1.12, 0.72]} />
          <meshStandardMaterial ref={pantalla} color="#1e293b" emissive="#1e293b" emissiveIntensity={0.55} roughness={0.3} />
        </mesh>
        {activo && resultado === "no" && (
          <group position={[0, ALTO_MONITOR, 0.07]}>
            <mesh rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[0.7, 0.08, 0.02]} />
              <meshBasicMaterial color={NO} />
            </mesh>
            <mesh rotation={[0, 0, -Math.PI / 4]}>
              <boxGeometry args={[0.7, 0.08, 0.02]} />
              <meshBasicMaterial color={NO} />
            </mesh>
          </group>
        )}
      </group>
      <mesh ref={haz} position={medio} quaternion={quat} visible={false}>
        <cylinderGeometry args={[0.035, 0.035, largo, 10, 1, true]} />
        <meshBasicMaterial color={colRes} transparent opacity={0.8} />
      </mesh>
      <Html position={[pos[0], ALTO_MONITOR + 0.72, pos[2]]} center distanceFactor={13 * DF} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div
          style={{
            padding: "4px 10px",
            borderRadius: 10,
            background: "rgba(4,10,22,0.88)",
            border: `1px solid ${activo ? colRes : "rgba(255,255,255,0.22)"}`,
            color: "#fff",
            fontSize: 11,
            fontWeight: 800,
            whiteSpace: "nowrap",
            textAlign: "center",
          }}
        >
          <div>
            {programa}
            {libre && <span style={{ marginLeft: 6, fontSize: 9, padding: "1px 5px", borderRadius: 6, background: "#065f46", color: "#a7f3d0" }}>LIBRE</span>}
          </div>
          {activo && <div style={{ fontSize: 10, color: colRes, marginTop: 2 }}>{RESULTADO_DEF[resultado].etq}</div>}
        </div>
      </Html>
    </>
  );
}

function EscenaFormatos({ formatoId, fase, archivo, modoColor }: { formatoId: FormatoId; fase: FaseCapsula; archivo: Partial<Record<EntregableId, FormatoId>>; modoColor: string }) {
  const f = FORMATOS.find((x) => x.id === formatoId) ?? FORMATOS[0]!;
  const colores = COLOR_ENTREGABLE[f.entregable];
  const abierta = fase === "abierta";
  const domo = useRef<THREE.Group>(null);
  const domoMat = useRef<THREE.MeshPhysicalMaterial>(null);
  const tapaMat = useRef<THREE.MeshStandardMaterial>(null);
  const anio = useRef<HTMLSpanElement>(null);
  const aro = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  const archivoG = useRef<THREE.Group>(null);
  const t = useRef(0);
  useFrame(({ clock }, dt) => {
    t.current = fase === "cerrada" ? 0 : t.current + Math.min(dt, 0.25);
    const k = clamp01(t.current / T_ANIOS);
    const y = Math.round(ANIO_GUARDADO + (ANIO_HOY - ANIO_GUARDADO) * (k * k * (3 - 2 * k)));
    if (anio.current) anio.current.textContent = String(fase === "cerrada" ? ANIO_GUARDADO : y);
    const sube = clamp01((t.current - 1.9) / 0.8);
    if (domo.current) {
      domo.current.position.y = sube * 1.4;
      domo.current.visible = sube < 0.99;
    }
    if (domoMat.current) domoMat.current.opacity = 0.28 * (1 - sube);
    if (tapaMat.current) tapaMat.current.opacity = 1 - sube;
    if (aro.current) {
      aro.current.rotation.z = clock.elapsedTime * (fase === "abriendo" ? 6 : 0.6);
      (aro.current.material as THREE.MeshBasicMaterial).opacity = fase === "abriendo" ? 0.9 : 0.35;
    }
    if (halo.current) {
      halo.current.visible = abierta && f.resultado === "integro";
      halo.current.rotation.z = -clock.elapsedTime * 0.8;
    }
    if (archivoG.current) {
      archivoG.current.rotation.y = fase === "abriendo" ? Math.sin(clock.elapsedTime * 30) * 0.03 : Math.sin(clock.elapsedTime * 0.6) * 0.25;
      archivoG.current.position.y = 1.4 + Math.sin(clock.elapsedTime * 1.2) * 0.04;
    }
  });
  const pierde = abierta && f.resultado === "perdidas";
  const cambia = abierta && f.resultado === "cambios";
  const colRes = RESULTADO_DEF[f.resultado].color;
  return (
    <group position={[0, -1.3, 0]}>
      <mesh position={[0, -0.06, -0.4]} receiveShadow>
        <cylinderGeometry args={[5.6, 5.6, 0.12, 64]} />
        <meshStandardMaterial color="#0f1b2d" roughness={0.9} />
      </mesh>
      {/* Pedestal de la cápsula */}
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.05, 1.2, 0.5, 40]} />
        <meshStandardMaterial color="#1e293b" metalness={0.55} roughness={0.35} />
      </mesh>
      <mesh ref={aro} position={[0, 0.51, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 0.98, 48, 1, 0, Math.PI * 1.5]} />
        <meshBasicMaterial color={modoColor} transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
      <group ref={domo}>
        <mesh position={[0, 1.45, 0]}>
          <cylinderGeometry args={[0.95, 0.95, 1.9, 40, 1, true]} />
          <meshPhysicalMaterial ref={domoMat} color="#bae6fd" transparent opacity={0.28} roughness={0.05} metalness={0.1} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        <mesh position={[0, 2.42, 0]}>
          <cylinderGeometry args={[1.0, 1.0, 0.1, 40]} />
          <meshStandardMaterial ref={tapaMat} color="#334155" metalness={0.7} roughness={0.3} transparent />
        </mesh>
      </group>
      <group ref={archivoG} position={[0, 1.4, 0]} rotation={[0, 0, cambia ? 0.12 : 0]}>
        {colores.map((c, i) => (
          <Pieza key={`${f.id}-${i}`} i={i} color={c} pierde={pierde && (i === 1 || i === 4)} gris={pierde} />
        ))}
        <mesh ref={halo} position={[0, 0, -0.1]} visible={false}>
          <torusGeometry args={[0.95, 0.03, 8, 48]} />
          <meshBasicMaterial color={OK} />
        </mesh>
      </group>
      {/* Contador de años en el frente del pedestal */}
      <Html position={[0, 0.25, 1.25]} center distanceFactor={9 * DF} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 12px", borderRadius: 8, background: "#020617", border: `1px solid ${modoColor}`, color: modoColor, fontSize: 18, fontWeight: 900, fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap", boxShadow: `0 0 18px -4px ${modoColor}` }}>
          <i className="fa-solid fa-hourglass-half" style={{ fontSize: 13 }} />
          <span ref={anio}>{ANIO_GUARDADO}</span>
          <span style={{ color: "#fff", fontSize: 15 }}>· {f.ext}</span>
          {abierta && <span style={{ fontSize: 11, color: colRes }}>{RESULTADO_DEF[f.resultado].etq.toLowerCase()}</span>}
        </div>
      </Html>
      {f.lectores.map((l, idx) => (
        <Lector key={`${f.id}-${idx}`} idx={idx} programa={l.programa} libre={l.libre} resultado={l.resultado} activo={abierta} />
      ))}
      {/* Estante del archivo escolar */}
      <group position={[-3.75, 0, 1.0]} rotation={[0, 0.4, 0]}>
        <mesh position={[0, 1.05, -0.2]} castShadow>
          <boxGeometry args={[0.9, 2.1, 0.08]} />
          <meshStandardMaterial color="#3f2d1c" roughness={0.8} />
        </mesh>
        {ENTREGABLES.map((e, k) => {
          const fid = archivo[e.id];
          const fa = fid ? FORMATOS.find((x) => x.id === fid) : undefined;
          const col = fa ? RESULTADO_DEF[fa.resultado].color : "#475569";
          const y = 1.85 - k * 0.52;
          return (
            <group key={e.id} position={[0, y, 0]}>
              <mesh position={[0, -0.2, 0]}>
                <boxGeometry args={[0.9, 0.05, 0.4]} />
                <meshStandardMaterial color="#6b4a2b" roughness={0.8} />
              </mesh>
              <mesh position={[-0.2, 0, 0]}>
                <boxGeometry args={[0.26, 0.34, 0.04]} />
                <meshStandardMaterial color={e.id === f.entregable ? "#f8fafc" : "#94a3b8"} emissive={col} emissiveIntensity={fa ? 0.35 : 0} />
              </mesh>
              <mesh position={[0.22, -0.08, 0.05]}>
                <sphereGeometry args={[0.07, 14, 10]} />
                <meshStandardMaterial color={col} emissive={col} emissiveIntensity={fa ? 1.2 : 0.1} />
              </mesh>
            </group>
          );
        })}
        <Etiqueta pos={[0, 2.4, 0]} df={10} col={`${modoColor}88`} fs={10.5}>
          <i className="fa-solid fa-box-archive" style={{ color: modoColor }} />
          Archivo escolar
        </Etiqueta>
      </group>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. EQUIPA LA SALA
 * ════════════════════════════════════════════════════════════════════════ */

const COLS = 8;
const SEP_X = 0.74;
const SEP_Z = 0.86;
const X_SALA = -1.7;
const MAX_MONEDAS = 40;
const X_PILAS = [2.3, 3.5, 4.7];
const Z_PILAS = [-1.3, -0.1, 1.1];
const BLOQUEO = "#ef4444";

function posEquipo(i: number): Pt {
  const fila = Math.floor(i / COLS);
  const col = i % COLS;
  return [X_SALA + (col - (COLS - 1) / 2) * SEP_X, 0, -1.6 + fila * SEP_Z];
}

function EscenaCostos({ equipos, anios, rutas, sinPago, modoColor }: { equipos: number; anios: number; rutas: Record<NecesidadId, Ruta>; sinPago: boolean; modoColor: string }) {
  const mesas = useRef<THREE.InstancedMesh>(null);
  const monitores = useRef<THREE.InstancedMesh>(null);
  const pantIzq = useRef<THREE.InstancedMesh>(null);
  const pantDer = useRef<THREE.InstancedMesh>(null);
  const candados = useRef<THREE.InstancedMesh>(null);
  const monedas = useRef<THREE.InstancedMesh>(null);
  const escalaEq = useRef<Float32Array>(new Float32Array(EQ_MAX));
  const alturas = useRef<Float32Array>(new Float32Array(3));
  const obj = useMemo(() => new THREE.Object3D(), []);
  const tmp = useMemo(() => new THREE.Color(), []);

  const opcion = (id: NecesidadId) => {
    const n = NECESIDADES.find((x) => x.id === id)!;
    return n.opciones.find((o) => o.ruta === rutas[id]) ?? n.opciones[0]!;
  };
  const costos = NECESIDADES.map((n) => costoUSD(opcion(n.id), equipos, anios) * TC_MXN);
  const maxMXN = Math.max(...costos, 1);
  const moneda = valorMoneda(maxMXN, 36);
  const nMonedas = costos.map((c) => Math.min(MAX_MONEDAS, Math.round(c / moneda)));
  const total = costos.reduce((a, b) => a + b, 0);
  const colOfi = sinPago && rutas.ofimatica === "suscripcion" ? BLOQUEO : RUTA_DEF[rutas.ofimatica].color;
  const colImg = sinPago && rutas.imagen === "suscripcion" ? BLOQUEO : RUTA_DEF[rutas.imagen].color;
  const bloqueo = sinPago && (rutas.ofimatica === "suscripcion" || rutas.imagen === "suscripcion");

  useFrame(({ clock }, dt) => {
    const esc = escalaEq.current;
    for (let i = 0; i < EQ_MAX; i++) {
      const objetivo = i < equipos ? 1 : 0;
      esc[i] = esc[i]! + (objetivo - esc[i]!) * suave(dt, 0.1 + ((i * 7) % 10) * 0.004);
    }
    const s = (i: number) => Math.max(0.0001, esc[i]!);
    const put = (mesh: THREE.InstancedMesh | null, fn: (i: number) => void, color?: (i: number) => string) => {
      if (!mesh) return;
      for (let i = 0; i < EQ_MAX; i++) {
        fn(i);
        obj.updateMatrix();
        mesh.setMatrixAt(i, obj.matrix);
        if (color) mesh.setColorAt(i, tmp.set(color(i)));
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (color && mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    };
    put(mesas.current, (i) => {
      const [x, , z] = posEquipo(i);
      obj.position.set(x, 0.22 * s(i), z);
      obj.rotation.set(0, 0, 0);
      obj.scale.set(s(i), s(i), s(i));
    });
    put(monitores.current, (i) => {
      const [x, , z] = posEquipo(i);
      obj.position.set(x, 0.62 * s(i), z - 0.08);
      obj.scale.set(s(i), s(i), s(i));
    });
    put(
      pantIzq.current,
      (i) => {
        const [x, , z] = posEquipo(i);
        obj.position.set(x - 0.095 * s(i), 0.64 * s(i), z - 0.08 + 0.021);
        obj.scale.set(s(i), s(i), s(i));
      },
      () => colOfi,
    );
    put(
      pantDer.current,
      (i) => {
        const [x, , z] = posEquipo(i);
        obj.position.set(x + 0.095 * s(i), 0.64 * s(i), z - 0.08 + 0.021);
        obj.scale.set(s(i), s(i), s(i));
      },
      () => colImg,
    );
    put(candados.current, (i) => {
      const [x, , z] = posEquipo(i);
      const b = bloqueo ? s(i) : 0.0001;
      obj.position.set(x, 0.98 + Math.sin(clock.elapsedTime * 2 + i) * 0.03, z - 0.08);
      obj.scale.set(b, b, b);
    });
    const alt = alturas.current;
    const m = monedas.current;
    if (m) {
      for (let k = 0; k < 3; k++) {
        alt[k] = alt[k]! + (nMonedas[k]! - alt[k]!) * suave(dt, 0.08);
        for (let j = 0; j < MAX_MONEDAS; j++) {
          const idx = k * MAX_MONEDAS + j;
          const visible = j < alt[k]! - 0.01;
          obj.position.set(X_PILAS[k]! + Math.sin(j * 2.3) * 0.02, 0.09 + j * 0.075, Z_PILAS[k]! + Math.cos(j * 1.7) * 0.02);
          obj.rotation.set(0, j * 0.4, 0);
          const sc = visible ? 1 : 0.0001;
          obj.scale.set(sc, sc, sc);
          obj.updateMatrix();
          m.setMatrixAt(idx, obj.matrix);
        }
      }
      m.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group position={[0, -1.2, 0]}>
      {/* Piso y muros de la sala */}
      <mesh position={[0.9, -0.05, 0.2]} receiveShadow>
        <boxGeometry args={[11.2, 0.1, 6.4]} />
        <meshStandardMaterial color="#1a2436" roughness={0.9} />
      </mesh>
      <mesh position={[X_SALA, 0.9, -2.35]} receiveShadow>
        <boxGeometry args={[6.6, 1.8, 0.1]} />
        <meshStandardMaterial color="#223049" roughness={0.9} />
      </mesh>
      <mesh position={[X_SALA, 1.15, -2.28]}>
        <boxGeometry args={[3.2, 0.9, 0.04]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.6} />
      </mesh>
      <Html position={[X_SALA, 1.15, -2.2]} center distanceFactor={10 * DF} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ textAlign: "center", color: "#0f172a", fontWeight: 900, fontSize: 13, whiteSpace: "nowrap" }}>
          Sala de cómputo
          <div style={{ fontSize: 11, fontWeight: 800, color: "#334155" }}>
            {equipos} equipos · {anios} {anios === 1 ? "año" : "años"}
          </div>
        </div>
      </Html>
      <instancedMesh ref={mesas} args={[undefined, undefined, EQ_MAX]} castShadow receiveShadow frustumCulled={false}>
        <boxGeometry args={[0.62, 0.44, 0.44]} />
        <meshStandardMaterial color="#8b6b4a" roughness={0.7} />
      </instancedMesh>
      <instancedMesh ref={monitores} args={[undefined, undefined, EQ_MAX]} castShadow frustumCulled={false}>
        <boxGeometry args={[0.44, 0.3, 0.035]} />
        <meshStandardMaterial color="#0b1220" metalness={0.4} roughness={0.35} />
      </instancedMesh>
      <instancedMesh ref={pantIzq} args={[undefined, undefined, EQ_MAX]} frustumCulled={false}>
        <boxGeometry args={[0.18, 0.23, 0.006]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={pantDer} args={[undefined, undefined, EQ_MAX]} frustumCulled={false}>
        <boxGeometry args={[0.18, 0.23, 0.006]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={candados} args={[undefined, undefined, EQ_MAX]} frustumCulled={false}>
        <boxGeometry args={[0.12, 0.1, 0.05]} />
        <meshStandardMaterial color={BLOQUEO} emissive={BLOQUEO} emissiveIntensity={0.8} />
      </instancedMesh>

      {/* Pilas de monedas: costo de cada necesidad */}
      <instancedMesh ref={monedas} args={[undefined, undefined, MAX_MONEDAS * 3]} castShadow frustumCulled={false}>
        <cylinderGeometry args={[0.3, 0.3, 0.065, 28]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.85} roughness={0.28} emissive="#78350f" emissiveIntensity={0.25} />
      </instancedMesh>
      {NECESIDADES.map((n, k) => {
        const o = opcion(n.id);
        const col = sinPago && o.ruta === "suscripcion" ? BLOQUEO : RUTA_DEF[o.ruta].color;
        return (
          <group key={n.id}>
            <mesh position={[X_PILAS[k]!, 0.03, Z_PILAS[k]!]} receiveShadow>
              <cylinderGeometry args={[0.42, 0.44, 0.06, 32]} />
              <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.35} />
            </mesh>
            <Html position={[X_PILAS[k]!, 0.2 + nMonedas[k]! * 0.075 + 0.4, Z_PILAS[k]!]} center distanceFactor={14 * DF} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
              <div style={{ padding: "4px 9px", borderRadius: 9, background: "rgba(4,10,22,0.88)", border: `1px solid ${col}`, color: "#fff", fontSize: 10.5, fontWeight: 800, whiteSpace: "nowrap", textAlign: "center" }}>
                <div style={{ color: col }}>
                  <i className={`fa-solid ${n.icono}`} style={{ marginRight: 5 }} />
                  {n.etq}
                </div>
                <div style={{ fontSize: 9.5, color: "#cbd5e1" }}>{o.producto}</div>
                <div style={{ fontFamily: "ui-monospace, monospace" }}>${num(costos[k]!)}</div>
              </div>
            </Html>
          </group>
        );
      })}
      <Etiqueta pos={[3.2, 3.55, -2.2]} df={10} col={`${modoColor}aa`} fs={13}>
        <i className="fa-solid fa-coins" style={{ color: "#fbbf24" }} />
        Total en licencias: ${num(total)} MXN
      </Etiqueta>
      <Etiqueta pos={[3.2, 3.1, -2.2]} df={11} fs={10}>
        1 moneda = ${num(moneda)} MXN
      </Etiqueta>
    </group>
  );
}

/* ── Escena ───────────────────────────────────────────────────────────── */

export default function SoftwareLibreScene(p: SoftwareLibreSceneProps) {
  const { vista, modoColor, resetNonce } = p;
  const cam = useMemo((): { pos: Pt; target: Pt } => {
    if (vista === "licencias") return { pos: [0, 4.1, 7.6], target: [0.2, 0.15, 0] };
    if (vista === "formatos") return { pos: [0.4, 3.6, 8.4], target: [-0.3, 0.5, -0.6] };
    return { pos: [0.9, 6.6, 8.4], target: [0.9, -0.4, 0] };
  }, [vista]);

  return (
    <Canvas key={`${vista}-${resetNonce}`} shadows dpr={[1, 1.75]} camera={{ position: cam.pos, fov: 42 }} gl={{ antialias: true }}>
      <color attach="background" args={["#040a16"]} />
      <fog attach="fog" args={["#040a16", 18, 40]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 9, 6]} intensity={1.15} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-6, 3, 5]} intensity={0.4} color={modoColor} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.5} position={[0, 5, -6]} scale={[10, 6, 1]} color="#93c5fd" />
        <Lightformer form="rect" intensity={0.8} position={[-6, 0, 4]} scale={[6, 6, 1]} color={modoColor} />
      </Environment>

      {vista === "licencias" && <EscenaLicencias licenciaId={p.licenciaId} prediccion={p.prediccion} revelada={p.revelada} derivada={p.derivada} />}
      {vista === "formatos" && <EscenaFormatos formatoId={p.formatoId} fase={p.fase} archivo={p.archivo} modoColor={modoColor} />}
      {vista === "costos" && <EscenaCostos equipos={p.equipos} anios={p.anios} rutas={p.rutas} sinPago={p.sinPago} modoColor={modoColor} />}

      <OrbitControls makeDefault enablePan={false} enableZoom minDistance={4} maxDistance={18} maxPolarAngle={Math.PI * 0.47} minPolarAngle={Math.PI * 0.08} target={cam.target} />
      <EffectComposer>
        <Bloom intensity={0.3} luminanceThreshold={0.62} luminanceSmoothing={0.85} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.6} />
      </EffectComposer>
    </Canvas>
  );
}
