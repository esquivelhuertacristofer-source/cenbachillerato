"use client";

/**
 * Escena 3D del laboratorio "Hidrósfera y atmósfera" (CNEYT-III, progresión 2).
 * Tres vistas:
 *
 *  - atmosfera: columna de aire de 0 a 120 km con sus capas (escala vertical
 *    no lineal), la capa de ozono que absorbe la luz UV, nubes, un avión y
 *    meteoros; la sonda o el globo sonda que crece al subir; un cubo de «1 litro
 *    de aire» con sus moléculas y la curva de temperatura de la Atmósfera
 *    Estándar de EUA 1976.
 *  - oceano: bloque de océano en corte hasta 4 000 m con la cara frontal
 *    coloreada por temperatura y la lateral por salinidad, el buque con su
 *    sensor CTD, masas de agua que se hunden hasta su capa y un bloque de hielo.
 *  - ciclo: corte del Golfo de México a Perote; el mar se evapora, una parcela
 *    de aire sube la sierra, forma nube y lluvia, y baja del otro lado.
 *
 * Toda animación ocurre en useFrame mutando refs y avanza por tiempo. NO se
 * usa <Text> de drei (cuelga el chunk con Turbopack): el texto va en <Html>.
 */

import * as THREE from "three";
import { useEffect, useMemo, useRef, type ReactNode, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Escenario } from "./_escenario";
import { CurvaTubo } from "./_tablero";
import {
  type ZonaId,
  type ViajeParcela,
  Z_MAX_KM,
  CAPAS,
  OZONO,
  atmosfera,
  AIRE_0,
  diametroGlobo,
  presionTxt,
  num,
  ZONAS,
  aguaEn,
  PROF_MAX,
  profADibujo,
  rhoMar,
  profundidadEquilibrio,
  fraccionSumergida,
  RHO_HIELO,
  TERRENO,
  alturaTerreno,
  presionVaporSat,
} from "./hidrosfera-atmosfera-data";

export type VistaHA = "atmosfera" | "oceano" | "ciclo";

export interface HidrosferaAtmosferaSceneProps {
  vista: VistaHA;
  modoColor: string;
  resetNonce: number;
  // Atmósfera
  zKm: number;
  vuelo: "suelo" | "subiendo" | "reventado";
  // Océano
  zonaId: ZonaId;
  profCTD: number;
  masaT: number;
  masaS: number;
  masaNonce: number;
  hieloNonce: number;
  // Ciclo
  t0: number;
  hr0: number;
  viaje: ViajeParcela;
  progreso: number;
  lanzada: boolean;
}

type Pt = [number, number, number];

const suave = (dt: number, porCuadro: number) => 1 - Math.pow(1 - porCuadro, Math.min(dt, 0.25) * 60);

function Etiqueta({ pos, children, df = 10, col, fs = 12 }: { pos: Pt; children: ReactNode; df?: number; col?: string; fs?: number }) {
  return (
    <Html position={pos} center distanceFactor={df} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 10px",
          borderRadius: 999,
          background: "rgba(4,10,22,0.86)",
          border: `1px solid ${col ?? "rgba(255,255,255,0.22)"}`,
          color: "#fff",
          fontSize: fs,
          fontWeight: 800,
          whiteSpace: "nowrap",
          boxShadow: "0 6px 18px -8px #000",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {children}
      </div>
    </Html>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 1. COLUMNA DE AIRE
 * ════════════════════════════════════════════════════════════════════════ */

const ALTO_COL = 12;
const Y0_ATM = -6.2;
/** Escala vertical no lineal: y ∝ √z, para que quepan la tropósfera y la termósfera. */
const yAtm = (zKm: number) => ALTO_COL * Math.sqrt(Math.max(0, zKm) / Z_MAX_KM);
const ANCHO_COL = 3.2;
const FONDO_COL = 1.6;
const X_TABLERO = 4.0;
const ANCHO_TABLERO = 4;
const T_MIN = -100;
const T_MAX = 100;
const xTemp = (tC: number) => X_TABLERO + ((tC - T_MIN) / (T_MAX - T_MIN)) * ANCHO_TABLERO;
const X_LITRO = 2.55;
const N_MOLECULAS = 260;
const CUBO_LITRO = new THREE.BoxGeometry(0.9, 0.9, 0.9);

const PERFIL_T: Pt[] = Array.from({ length: 241 }, (_, i) => {
  const z = (i / 240) * Z_MAX_KM;
  return [xTemp(atmosfera(z).tC), yAtm(z), 0.02];
});

const METEOROS = Array.from({ length: 6 }, (_, i) => ({ x: -1.2 + ((i * 0.37) % 1) * 2.4, fase: (i * 0.61) % 1, vel: 0.35 + ((i * 0.53) % 1) * 0.3 }));

function Nube({ pos, escala = 1 }: { pos: Pt; escala?: number }) {
  return (
    <group position={pos} scale={escala}>
      {[
        [0, 0, 0, 0.32],
        [0.3, -0.05, 0.05, 0.24],
        [-0.3, -0.06, -0.02, 0.22],
        [0.12, 0.15, -0.05, 0.22],
      ].map(([x, y, z, r], k) => (
        <mesh key={k} position={[x!, y!, z!]}>
          <sphereGeometry args={[r!, 16, 12]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function Moleculas({ zRef }: { zRef: RefObject<number> }) {
  const malla = useRef<THREE.InstancedMesh>(null);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const semillas = useMemo(
    () =>
      Array.from({ length: N_MOLECULAS }, (_, i) => ({
        x: (((i * 0.618034) % 1) - 0.5) * 0.8,
        y: (((i * 0.414214) % 1) - 0.5) * 0.8,
        z: (((i * 0.732051) % 1) - 0.5) * 0.8,
        f: i * 1.7,
        // Orden barajado para que al quitar moléculas se conserve la proporción.
        orden: (i * 97) % N_MOLECULAS,
      })),
    [],
  );
  useEffect(() => {
    const m = malla.current;
    if (!m) return;
    const c = new THREE.Color();
    semillas.forEach((s, i) => {
      const k = s.orden % 100;
      c.set(k < 78 ? "#60a5fa" : k < 99 ? "#f87171" : "#fbbf24");
      m.setColorAt(i, c);
    });
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [semillas]);
  useFrame(({ clock }) => {
    const m = malla.current;
    if (!m) return;
    const e = atmosfera(zRef.current ?? 0);
    const n = Math.round(N_MOLECULAS * (e.rho / AIRE_0.rho));
    const t = clock.elapsedTime;
    semillas.forEach((s, i) => {
      const on = s.orden < n;
      obj.position.set(s.x + Math.sin(t * 3 + s.f) * 0.025, s.y + Math.cos(t * 2.6 + s.f) * 0.025, s.z + Math.sin(t * 2.2 + s.f * 0.7) * 0.025);
      obj.scale.setScalar(on ? 0.028 : 0.0001);
      obj.updateMatrix();
      m.setMatrixAt(i, obj.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={malla} args={[undefined, undefined, N_MOLECULAS]} frustumCulled={false}>
      <sphereGeometry args={[1, 8, 6]} />
      <meshStandardMaterial roughness={0.4} emissive="#1e293b" />
    </instancedMesh>
  );
}

function EscenaAtmosfera({ zKm, vuelo, modoColor }: { zKm: number; vuelo: "suelo" | "subiendo" | "reventado"; modoColor: string }) {
  const zRef = useRef(zKm);
  const cursor = useRef<THREE.Group>(null);
  const globo = useRef<THREE.Mesh>(null);
  const cuerda = useRef<THREE.Mesh>(null);
  const paracaidas = useRef<THREE.Group>(null);
  const litro = useRef<THREE.Group>(null);
  const puntoT = useRef<THREE.Mesh>(null);
  const meteoros = useRef<THREE.Group>(null);
  const avion = useRef<THREE.Group>(null);
  const tRuptura = useRef(0);

  useFrame(({ clock }, dt) => {
    zRef.current += (zKm - zRef.current) * suave(dt, vuelo === "subiendo" ? 0.3 : 0.12);
    const z = zRef.current;
    const y = yAtm(z);
    if (cursor.current) cursor.current.position.y = y;
    if (litro.current) litro.current.position.y = y;
    if (puntoT.current) puntoT.current.position.set(xTemp(atmosfera(z).tC), y, 0.05);
    const d = diametroGlobo(Math.min(z, 40));
    const r = 0.22 * (d / 1.8);
    if (globo.current) {
      globo.current.visible = vuelo === "subiendo";
      globo.current.scale.set(r, r * 1.08, r);
      globo.current.position.y = 0.55 + r;
    }
    if (cuerda.current) cuerda.current.visible = vuelo === "subiendo";
    tRuptura.current = vuelo === "reventado" ? tRuptura.current + dt : 0;
    if (paracaidas.current) {
      paracaidas.current.visible = vuelo === "reventado";
      const abre = Math.min(1, tRuptura.current / 0.8);
      paracaidas.current.scale.setScalar(0.3 + abre * 0.7);
      paracaidas.current.rotation.z = Math.sin(clock.elapsedTime * 1.6) * 0.12;
    }
    const tt = clock.elapsedTime;
    if (meteoros.current)
      meteoros.current.children.forEach((c, i) => {
        const m = METEOROS[i]!;
        const p = (tt * m.vel + m.fase) % 1;
        const zm = 104 - p * 26;
        c.position.set(m.x + p * 0.9, yAtm(zm), 0.3);
        c.scale.setScalar(p > 0.85 ? Math.max(0.001, (1 - p) / 0.15) : 1);
      });
    if (avion.current) avion.current.position.x = -1.1 + ((tt * 0.12) % 1) * 2.2;
  });

  const e = atmosfera(zKm);
  const capa = CAPAS.find((c) => zKm < c.hasta) ?? CAPAS[CAPAS.length - 1]!;
  const yOzA = yAtm(OZONO.desde);
  const yOzB = yAtm(OZONO.hasta);

  return (
    <group position={[0, Y0_ATM, 0]}>
      {/* Tierra */}
      <mesh position={[0.8, -40, -2]}>
        <sphereGeometry args={[40, 96, 48]} />
        <meshStandardMaterial color="#1d4ed8" roughness={0.6} emissive="#0c1e4a" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[-3.4, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.6, 40]} />
        <meshStandardMaterial color="#3f6212" roughness={1} />
      </mesh>
      {/* Pico de Orizaba (misma escala vertical que la columna) */}
      <group position={[-3.6, 0, -0.4]}>
        <mesh position={[0, yAtm(5.636) / 2, 0]}>
          <coneGeometry args={[1.25, yAtm(5.636), 9]} />
          <meshStandardMaterial color="#57534e" roughness={0.95} flatShading />
        </mesh>
        <mesh position={[0, yAtm(5.636) - 0.35, 0]}>
          <coneGeometry args={[0.3, 0.72, 9]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.8} flatShading />
        </mesh>
        <Etiqueta pos={[0, yAtm(5.636) + 0.35, 0]} df={16} fs={11}>
          <i className="fa-solid fa-mountain" style={{ color: "#cbd5e1" }} />
          Pico de Orizaba · 5 636 m
        </Etiqueta>
      </group>

      {/* Capas */}
      {CAPAS.map((c) => {
        const ya = yAtm(c.desde);
        const yb = yAtm(Math.min(c.hasta, Z_MAX_KM));
        const on = c.id === capa.id;
        return (
          <group key={c.id}>
            <mesh position={[0, (ya + yb) / 2, 0]}>
              <boxGeometry args={[ANCHO_COL, yb - ya, FONDO_COL]} />
              <meshStandardMaterial color={c.color} transparent opacity={on ? 0.3 : 0.14} roughness={0.3} depthWrite={false} emissive={c.color} emissiveIntensity={on ? 0.35 : 0.08} />
            </mesh>
            {c.hasta < Z_MAX_KM && (
              <>
                <mesh position={[0, yb, 0]}>
                  <boxGeometry args={[ANCHO_COL + 0.08, 0.025, FONDO_COL + 0.08]} />
                  <meshBasicMaterial color="#e2e8f0" transparent opacity={0.55} />
                </mesh>
                <Html position={[ANCHO_COL / 2 + 0.08, yb, 0.8]} distanceFactor={17} zIndexRange={[18, 0]} style={{ pointerEvents: "none" }}>
                  <div style={{ transform: "translate(0,-50%)", color: "#e2e8f0", fontSize: 10, fontWeight: 800, whiteSpace: "nowrap", textShadow: "0 1px 4px #000" }}>
                    {c.id === "troposfera" ? "Tropopausa" : c.id === "estratosfera" ? "Estratopausa" : "Mesopausa"} · {num(c.hasta)} km
                  </div>
                </Html>
              </>
            )}
            <Html position={[-ANCHO_COL / 2 + 0.12, yb - (c.id === "troposfera" ? 0.95 : c.id === "termosfera" ? 0.75 : 0.3), FONDO_COL / 2 + 0.05]} distanceFactor={16} zIndexRange={[19, 0]} style={{ pointerEvents: "none" }}>
              <div style={{ transform: "translate(0,-50%)", padding: "3px 9px", borderRadius: 999, background: "rgba(4,10,22,0.8)", border: `1px solid ${on ? c.color : `${c.color}77`}`, color: "#fff", fontSize: on ? 12.5 : 11, fontWeight: 900, whiteSpace: "nowrap" }}>{c.etq}</div>
            </Html>
          </group>
        );
      })}
      <Etiqueta pos={[-1.3, ALTO_COL + 0.4, 0]} df={17} fs={10}>
        <i className="fa-solid fa-arrow-up" style={{ color: "#f472b6" }} />
        Termósfera hasta ~600 km · luego exósfera
      </Etiqueta>

      {/* Capa de ozono */}
      <mesh position={[0, (yOzA + yOzB) / 2, 0]}>
        <boxGeometry args={[ANCHO_COL + 0.02, yOzB - yOzA, FONDO_COL + 0.02]} />
        <meshStandardMaterial color="#a3e635" transparent opacity={0.2} emissive="#a3e635" emissiveIntensity={0.6} depthWrite={false} />
      </mesh>
      <Etiqueta pos={[0, yAtm(OZONO.maximo) - 0.45, FONDO_COL / 2 + 0.05]} df={17} col="#a3e635aa" fs={10}>
        <i className="fa-solid fa-shield-halved" style={{ color: "#a3e635" }} />
        Capa de ozono (O₃)
      </Etiqueta>
      {/* Sol y rayos UV que el ozono absorbe */}
      <mesh position={[-5.2, ALTO_COL - 1.2, -3]}>
        <sphereGeometry args={[0.55, 24, 18]} />
        <meshBasicMaterial color="#fde68a" toneMapped={false} />
      </mesh>
      {[0, 1, 2].map((k) => (
        <Line
          key={k}
          points={[
            [-4.7, ALTO_COL - 1.4 - k * 0.3, -2.6],
            [-0.9 + k * 0.7, yOzB - 0.25 - k * 0.3, 0],
          ]}
          color="#c084fc"
          lineWidth={2}
          dashed
          dashSize={0.18}
          gapSize={0.1}
        />
      ))}
      <Etiqueta pos={[-4.2, ALTO_COL - 2.35, -2.2]} df={17} col="#c084fcaa" fs={10}>
        Radiación UV
      </Etiqueta>

      {/* Nubes y cumulonimbo con yunque en la tropopausa */}
      <Nube pos={[-0.9, yAtm(1.5), 0]} escala={0.9} />
      <Nube pos={[0.9, yAtm(2.5), -0.2]} escala={0.8} />
      <group position={[0.2, 0, 0]}>
        <mesh position={[0, (yAtm(3) + yAtm(10)) / 2, 0]}>
          <cylinderGeometry args={[0.3, 0.45, yAtm(10) - yAtm(3), 16]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.9} />
        </mesh>
        <mesh position={[0, yAtm(10.6), 0]} scale={[1, 0.18, 0.6]}>
          <sphereGeometry args={[1.1, 24, 12]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.9} />
        </mesh>
      </group>
      <group ref={avion} position={[0, yAtm(11) - 0.28, 0.5]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.035, 0.3, 4, 8]} />
          <meshStandardMaterial color="#e5e7eb" metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh>
          <boxGeometry args={[0.08, 0.01, 0.34]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
      </group>
      <group ref={meteoros}>
        {METEOROS.map((_, i) => (
          <mesh key={i} rotation={[0, 0, 0.9]}>
            <boxGeometry args={[0.02, 0.22, 0.02]} />
            <meshBasicMaterial color="#fde68a" toneMapped={false} />
          </mesh>
        ))}
      </group>

      {/* Cursor / globo sonda */}
      <group ref={cursor} position={[0, yAtm(zKm), 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.95, 0.03, 8, 64]} />
          <meshBasicMaterial color={modoColor} toneMapped={false} />
        </mesh>
        <mesh>
          <boxGeometry args={[ANCHO_COL + 0.02, 0.012, FONDO_COL + 0.02]} />
          <meshBasicMaterial color={modoColor} transparent opacity={0.45} />
        </mesh>
        {/* Radiosonda */}
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[0.14, 0.12, 0.14]} />
          <meshStandardMaterial color="#f8fafc" emissive={modoColor} emissiveIntensity={0.3} />
        </mesh>
        <mesh ref={cuerda} position={[0, 0.37, 0]} visible={false}>
          <cylinderGeometry args={[0.006, 0.006, 0.36, 4]} />
          <meshBasicMaterial color="#e2e8f0" />
        </mesh>
        <mesh ref={globo} visible={false}>
          <sphereGeometry args={[1, 28, 20]} />
          <meshStandardMaterial color="#fde68a" emissive="#f59e0b" emissiveIntensity={0.35} roughness={0.35} transparent opacity={0.92} />
        </mesh>
        <group ref={paracaidas} position={[0, 0.5, 0]} visible={false}>
          <mesh position={[0, 0.2, 0]}>
            <sphereGeometry args={[0.32, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#f97316" side={THREE.DoubleSide} roughness={0.6} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.15, 0.0, 0]} rotation={[0, 0, s * 0.55]}>
              <cylinderGeometry args={[0.004, 0.004, 0.42, 4]} />
              <meshBasicMaterial color="#e2e8f0" />
            </mesh>
          ))}
        </group>
        <Html position={[-ANCHO_COL / 2 - 0.35, 0, 0.8]} distanceFactor={16} zIndexRange={[25, 0]} style={{ pointerEvents: "none" }}>
          <div
            style={{
              transform: "translate(-100%,-50%)",
              padding: "6px 11px",
              borderRadius: 10,
              background: "rgba(4,10,22,0.9)",
              border: `1px solid ${modoColor}`,
              color: "#fff",
              fontSize: 12,
              fontWeight: 800,
              whiteSpace: "nowrap",
              lineHeight: 1.35,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <div style={{ color: modoColor, fontSize: 10.5, letterSpacing: "0.06em" }}>
              {vuelo === "subiendo" ? "GLOBO SONDA" : vuelo === "reventado" ? "¡REVENTÓ!" : "SONDA"} · {num(zKm, zKm < 10 ? 2 : 1)} km
            </div>
            <div>
              {num(e.tC, 1)} °C · {presionTxt(e.pPa)}
            </div>
            {vuelo === "subiendo" && <div style={{ color: "#fde68a", fontSize: 11 }}>Globo: {num(diametroGlobo(zKm), 1)} m de diámetro</div>}
          </div>
        </Html>
      </group>

      {/* Un litro de aire a la altura de la sonda */}
      <group ref={litro} position={[X_LITRO, yAtm(zKm), 0]}>
        <mesh>
          <boxGeometry args={[0.9, 0.9, 0.9]} />
          <meshStandardMaterial color="#e2e8f0" transparent opacity={0.08} depthWrite={false} />
        </mesh>
        <lineSegments>
          <edgesGeometry args={[CUBO_LITRO]} />
          <lineBasicMaterial color="#cbd5e1" transparent opacity={0.7} />
        </lineSegments>
        <Moleculas zRef={zRef} />
        <Html position={[0, -0.55, 0]} center distanceFactor={17} zIndexRange={[19, 0]} style={{ pointerEvents: "none" }}>
          <div style={{ color: "#e2e8f0", fontSize: 10, fontWeight: 800, whiteSpace: "nowrap", textAlign: "center", lineHeight: 1.25, textShadow: "0 1px 4px #000" }}>
            1 L de aire
            <br />
            {num((100 * e.rho) / AIRE_0.rho, e.rho / AIRE_0.rho < 0.1 ? 2 : 0)} % de moléculas
          </div>
        </Html>
      </group>

      {/* Tablero de temperatura */}
      <mesh position={[X_TABLERO + ANCHO_TABLERO / 2, ALTO_COL / 2, -0.05]}>
        <planeGeometry args={[ANCHO_TABLERO + 0.3, ALTO_COL + 0.3]} />
        <meshStandardMaterial color="#0b1628" transparent opacity={0.85} roughness={0.8} />
      </mesh>
      {[-80, -40, 0, 40, 80].map((t) => (
        <group key={t}>
          <mesh position={[xTemp(t), ALTO_COL / 2, -0.02]}>
            <boxGeometry args={[t === 0 ? 0.02 : 0.01, ALTO_COL, 0.005]} />
            <meshBasicMaterial color={t === 0 ? "#94a3b8" : "#334155"} />
          </mesh>
          <Html position={[xTemp(t), -0.3, 0]} center distanceFactor={17} zIndexRange={[18, 0]} style={{ pointerEvents: "none" }}>
            <div style={{ color: "#cbd5e1", fontSize: 10, fontWeight: 800, whiteSpace: "nowrap" }}>{num(t)}°</div>
          </Html>
        </group>
      ))}
      {[0, 11, 25, 50, 86, 120].map((z) => (
        <mesh key={z} position={[X_TABLERO + ANCHO_TABLERO / 2, yAtm(z), -0.02]}>
          <boxGeometry args={[ANCHO_TABLERO, 0.008, 0.005]} />
          <meshBasicMaterial color="#1e293b" />
        </mesh>
      ))}
      <CurvaTubo puntos={PERFIL_T} color="#fb923c" grosor={0.054} />
      <mesh ref={puntoT} position={[xTemp(e.tC), yAtm(zKm), 0.05]}>
        <sphereGeometry args={[0.09, 16, 12]} />
        <meshBasicMaterial color="#fff7ed" toneMapped={false} />
      </mesh>
      <Etiqueta pos={[X_TABLERO + ANCHO_TABLERO / 2 + 0.4, ALTO_COL + 0.45, 0]} df={17} col="#fb923caa" fs={11}>
        <i className="fa-solid fa-temperature-half" style={{ color: "#fb923c" }} />
        Temperatura, °C · altura en escala no lineal
      </Etiqueta>
    </group>
  );
}


/* ════════════════════════════════════════════════════════════════════════
 * 2. OCÉANO EN CORTE
 * ════════════════════════════════════════════════════════════════════════ */

const W_OC = 9;
const H_OC = 6;
const D_OC = 3;
const yOc = (prof: number) => -H_OC * profADibujo(prof);
const X_BUQUE = 1.6;
const X_MASA = -1.4;
const X_HIELO = -3.2;
const LADO_HIELO = 0.8;

const ESCALA_T: [number, string][] = [
  [-2, "#312e81"],
  [2, "#1d4ed8"],
  [6, "#0284c7"],
  [12, "#06b6d4"],
  [18, "#34d399"],
  [24, "#facc15"],
  [30, "#f97316"],
];
const ESCALA_S: [number, string][] = [
  [31, "#f0fdf4"],
  [33, "#bbf7d0"],
  [34.5, "#4ade80"],
  [35.5, "#16a34a"],
  [36.5, "#14532d"],
];

function colorEscala(escala: [number, string][], v: number, out: THREE.Color, tmp: THREE.Color) {
  if (v <= escala[0]![0]) return out.set(escala[0]![1]);
  for (let i = 0; i < escala.length - 1; i++) {
    const [a, ca] = escala[i]!;
    const [b, cb] = escala[i + 1]!;
    if (v <= b) return out.set(ca).lerp(tmp.set(cb), (v - a) / (b - a));
  }
  return out.set(escala[escala.length - 1]![1]);
}

export const GRADIENTE_T = `linear-gradient(90deg, ${ESCALA_T.map(([, c]) => c).join(", ")})`;
export const GRADIENTE_S = `linear-gradient(90deg, ${ESCALA_S.map(([, c]) => c).join(", ")})`;

function caraColoreada(ancho: number, zonaId: ZonaId, variable: "t" | "s"): THREE.BufferGeometry {
  const zona = ZONAS.find((z) => z.id === zonaId) ?? ZONAS[0]!;
  const g = new THREE.PlaneGeometry(ancho, H_OC, 1, 120);
  const pos = g.attributes.position!;
  const colores = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  const tmp = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i) - H_OC / 2; // de 0 a −H
    const f = -y / H_OC;
    const prof = f * f * PROF_MAX;
    const e = aguaEn(zona, prof);
    colorEscala(variable === "t" ? ESCALA_T : ESCALA_S, variable === "t" ? e.t : e.s, c, tmp);
    colores[i * 3] = c.r;
    colores[i * 3 + 1] = c.g;
    colores[i * 3 + 2] = c.b;
  }
  g.setAttribute("color", new THREE.BufferAttribute(colores, 3));
  return g;
}

function Buque({ profCTD }: { profCTD: number }) {
  const ctd = useRef<THREE.Group>(null);
  const cable = useRef<THREE.Mesh>(null);
  const casco = useRef<THREE.Group>(null);
  const prof = useRef(profCTD);
  useFrame(({ clock }, dt) => {
    prof.current += (profCTD - prof.current) * suave(dt, 0.08);
    const y = yOc(prof.current) - 0.15;
    if (ctd.current) ctd.current.position.y = y;
    if (cable.current) {
      const top = 1.15;
      cable.current.scale.y = Math.max(0.01, top - y);
      cable.current.position.y = (top + y) / 2;
    }
    if (casco.current) {
      casco.current.position.y = 0.12 + Math.sin(clock.elapsedTime * 1.2) * 0.03;
      casco.current.rotation.z = Math.sin(clock.elapsedTime * 0.9) * 0.02;
    }
  });
  return (
    <group position={[X_BUQUE, 0, 1.5]}>
      <group ref={casco}>
        <mesh position={[0.2, 0.1, -0.9]}>
          <boxGeometry args={[2.6, 0.42, 0.9]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.5} />
        </mesh>
        <mesh position={[0.2, -0.08, -0.9]}>
          <boxGeometry args={[2.62, 0.14, 0.92]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.6} />
        </mesh>
        <mesh position={[0.75, 0.5, -0.9]}>
          <boxGeometry args={[0.9, 0.42, 0.7]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
        </mesh>
        <mesh position={[0.75, 0.62, -0.54]}>
          <boxGeometry args={[0.7, 0.1, 0.02]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        {/* Pórtico en A de popa */}
        {[-0.3, 0.3].map((z) => (
          <mesh key={z} position={[-0.25, 0.75, -0.9 + z]} rotation={[0, 0, -0.35]}>
            <boxGeometry args={[0.06, 0.95, 0.06]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.4} roughness={0.4} />
          </mesh>
        ))}
        <mesh position={[-0.1, 1.17, -0.9]}>
          <boxGeometry args={[0.08, 0.06, 0.66]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.4} roughness={0.4} />
        </mesh>
      </group>
      <mesh ref={cable} position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 1, 6]} />
        <meshBasicMaterial color="#e2e8f0" />
      </mesh>
      <group ref={ctd}>
        {[0, 1, 2, 3, 4, 5].map((k) => {
          const a = (k / 6) * Math.PI * 2;
          return (
            <mesh key={k} position={[Math.cos(a) * 0.17, 0, Math.sin(a) * 0.17]}>
              <cylinderGeometry args={[0.045, 0.045, 0.34, 10]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.35} />
            </mesh>
          );
        })}
        <mesh>
          <cylinderGeometry args={[0.07, 0.07, 0.42, 12]} />
          <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.5} />
        </mesh>
        {[-0.2, 0.2].map((y) => (
          <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.24, 0.015, 6, 24]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.3} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function MasaAgua({ t, s, nonce, zonaId }: { t: number; s: number; nonce: number; zonaId: ZonaId }) {
  const zona = ZONAS.find((z) => z.id === zonaId) ?? ZONAS[0]!;
  const rho = rhoMar(t, s);
  const eq = profundidadEquilibrio(zona, rho);
  const yDestino = eq.donde === "flota" ? 0.03 : Math.max(-H_OC + 0.32, yOc(eq.prof));
  const ref = useRef<THREE.Group>(null);
  const tiempo = useRef(0);
  const visto = useRef(-1);
  const col = useMemo(() => {
    const c = new THREE.Color();
    colorEscala(ESCALA_T, t, c, new THREE.Color());
    return `#${c.getHexString()}`;
  }, [t]);
  useFrame((_, dt) => {
    if (visto.current !== nonce) {
      visto.current = nonce;
      tiempo.current = 0;
    }
    tiempo.current += dt;
    const g = ref.current;
    if (!g) return;
    const p = Math.min(1, tiempo.current / 2.6);
    const ease = 1 - Math.pow(1 - p, 3);
    g.position.y = 1.2 + (yDestino - 1.2) * ease;
    const aplana = eq.donde === "flota" ? Math.max(0, (p - 0.55) / 0.45) : 0;
    g.scale.set(1 + aplana * 2.4, 1 - aplana * 0.8, 1 + aplana * 0.6);
  });
  if (nonce === 0) return null;
  return (
    <group ref={ref} position={[X_MASA, 1.2, D_OC / 2]}>
      <mesh>
        <sphereGeometry args={[0.26, 24, 18]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.5} roughness={0.2} transparent opacity={0.95} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.3, 20, 14]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.45} />
      </mesh>
      <Etiqueta pos={[0, 0.5, 0.2]} df={12} fs={10.5} col={`${col}cc`}>
        {num(t, 1)} °C · {num(s, 1)} g/kg · {num(rho, 1)} kg/m³
      </Etiqueta>
    </group>
  );
}

function Hielo({ nonce, rhoSup }: { nonce: number; rhoSup: number }) {
  const ref = useRef<THREE.Group>(null);
  const tiempo = useRef(0);
  const visto = useRef(-1);
  const frac = fraccionSumergida(rhoSup);
  const yEq = LADO_HIELO * (0.5 - frac);
  useFrame((_, dt) => {
    if (visto.current !== nonce) {
      visto.current = nonce;
      tiempo.current = 0;
    }
    tiempo.current += dt;
    if (!ref.current) return;
    const tt = tiempo.current;
    const caida = Math.min(1, tt / 0.7);
    const bob = tt > 0.7 ? Math.exp(-(tt - 0.7) * 1.6) * Math.cos((tt - 0.7) * 6) * -0.35 : 0;
    ref.current.position.y = tt <= 0.7 ? 1.6 + (yEq - 1.6) * caida * caida : yEq + bob;
    ref.current.rotation.z = Math.sin(tt * 1.3) * 0.03;
  });
  if (nonce === 0) return null;
  return (
    <group ref={ref} position={[X_HIELO, 1.6, D_OC / 2]}>
      <mesh>
        <boxGeometry args={[LADO_HIELO, LADO_HIELO, LADO_HIELO]} />
        <meshPhysicalMaterial color="#e0f2fe" roughness={0.15} transmission={0.2} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, LADO_HIELO * (frac - 0.5), 0]}>
        <boxGeometry args={[LADO_HIELO + 0.02, 0.012, LADO_HIELO + 0.02]} />
        <meshBasicMaterial color="#0ea5e9" />
      </mesh>
      <Etiqueta pos={[0, LADO_HIELO / 2 + 0.35, 0.2]} df={12} fs={10.5} col="#e0f2feaa">
        <i className="fa-solid fa-cube" style={{ color: "#bae6fd" }} />
        Hielo {RHO_HIELO} kg/m³ · {num(frac * 100, 1)} % bajo el agua
      </Etiqueta>
    </group>
  );
}

function EscenaOceano(p: { zonaId: ZonaId; profCTD: number; masaT: number; masaS: number; masaNonce: number; hieloNonce: number }) {
  const zona = ZONAS.find((z) => z.id === p.zonaId) ?? ZONAS[0]!;
  const frente = useMemo(() => caraColoreada(W_OC, p.zonaId, "t"), [p.zonaId]);
  const lado = useMemo(() => caraColoreada(D_OC, p.zonaId, "s"), [p.zonaId]);
  useEffect(
    () => () => {
      frente.dispose();
      lado.dispose();
    },
    [frente, lado],
  );
  const agua = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (agua.current) agua.current.position.y = 0.01 + Math.sin(clock.elapsedTime * 1.1) * 0.01;
  });
  const sup = aguaEn(zona, 0);
  const ctd = aguaEn(zona, p.profCTD);
  const tMin = -2;
  const tMax = 30;
  const curvaT: Pt[] = Array.from({ length: 121 }, (_, i) => {
    const f = i / 120;
    const e = aguaEn(zona, f * f * PROF_MAX);
    return [-W_OC / 2 + ((e.t - tMin) / (tMax - tMin)) * W_OC, -f * H_OC, D_OC / 2 + 0.02];
  });

  return (
    <group position={[-0.4, 2.6, 0]}>
      <mesh geometry={frente} position={[0, -H_OC / 2, D_OC / 2]}>
        <meshBasicMaterial vertexColors toneMapped={false} />
      </mesh>
      <mesh geometry={lado} position={[W_OC / 2, -H_OC / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <meshBasicMaterial vertexColors toneMapped={false} />
      </mesh>
      <mesh position={[0, -H_OC - 0.1, 0]}>
        <boxGeometry args={[W_OC + 0.1, 0.2, D_OC + 0.1]} />
        <meshStandardMaterial color="#44403c" roughness={1} />
      </mesh>
      <mesh ref={agua} position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W_OC, D_OC]} />
        <meshStandardMaterial color={zona.hielo ? "#7dd3fc" : "#0891b2"} roughness={0.1} metalness={0.2} transparent opacity={0.8} />
      </mesh>
      {zona.hielo &&
        [
          [-3.6, -0.6, 1.3],
          [-2.0, 0.5, 1.0],
          [3.3, -0.3, 1.5],
          [0.1, -0.9, 0.9],
        ].map(([x, z, w], k) => (
          <mesh key={k} position={[x!, 0.06, z!]} rotation={[0, k * 0.7, 0]}>
            <boxGeometry args={[w!, 0.12, w! * 0.6]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.6} />
          </mesh>
        ))}
      <Line points={curvaT} color="#ffffff" lineWidth={2.5} />
      {/* Picnoclina */}
      {[zona.picnoclina.desde, zona.picnoclina.hasta].map((d) => (
        <Line
          key={d}
          points={[
            [-W_OC / 2, yOc(d), D_OC / 2 + 0.03],
            [W_OC / 2, yOc(d), D_OC / 2 + 0.03],
          ]}
          color="#0f172a"
          lineWidth={2}
          dashed
          dashSize={0.2}
          gapSize={0.12}
        />
      ))}
      <Etiqueta pos={[W_OC / 2 - 1.4, (yOc(zona.picnoclina.desde) + yOc(zona.picnoclina.hasta)) / 2, D_OC / 2 + 0.05]} df={12} fs={11} col="#fbbf24aa">
        <i className="fa-solid fa-layer-group" style={{ color: "#fbbf24" }} />
        {zona.picnoclina.causa === "termoclina" ? "Termoclina" : "Haloclina"} = picnoclina
      </Etiqueta>
      {/* Escala de profundidad */}
      {[0, 100, 250, 500, 1000, 2000, 4000].map((d) => (
        <group key={d}>
          <mesh position={[-W_OC / 2 - 0.1, yOc(d), D_OC / 2]}>
            <boxGeometry args={[0.2, 0.02, 0.02]} />
            <meshBasicMaterial color="#cbd5e1" />
          </mesh>
          <Html position={[-W_OC / 2 - 0.25, yOc(d), D_OC / 2]} distanceFactor={12} zIndexRange={[18, 0]} style={{ pointerEvents: "none" }}>
            <div style={{ transform: "translate(-100%,-50%)", color: "#e2e8f0", fontSize: 11, fontWeight: 800, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{num(d)} m</div>
          </Html>
        </group>
      ))}
      {/* Eje de temperatura de la curva blanca */}
      {[0, 10, 20, 30].map((t) => (
        <Html key={t} position={[-W_OC / 2 + ((t - tMin) / (tMax - tMin)) * W_OC, -H_OC - 0.42, D_OC / 2]} center distanceFactor={12} zIndexRange={[18, 0]} style={{ pointerEvents: "none" }}>
          <div style={{ color: "#fff", fontSize: 10.5, fontWeight: 800, whiteSpace: "nowrap" }}>{t} °C</div>
        </Html>
      ))}
      <Etiqueta pos={[0, -H_OC - 1.0, D_OC / 2]} df={12} fs={10.5}>
        <i className="fa-solid fa-temperature-half" style={{ color: "#fb923c" }} />
        Cara frontal: temperatura (línea blanca)
      </Etiqueta>
      <Etiqueta pos={[W_OC / 2 + 0.05, -H_OC * 0.82, 0]} df={12} fs={10.5}>
        <i className="fa-solid fa-droplet" style={{ color: "#4ade80" }} />
        Lateral: salinidad
      </Etiqueta>
      <Etiqueta pos={[-1.6, 1.45, -1]} df={12} fs={11} col="#2dd4bfaa">
        <i className="fa-solid fa-location-dot" style={{ color: "#2dd4bf" }} />
        {zona.lugar} · superficie {num(sup.t, 1)} °C, {num(sup.s, 1)} g/kg
      </Etiqueta>

      <Buque profCTD={p.profCTD} />
      <Html position={[X_BUQUE + 0.45, yOc(p.profCTD) - 0.15, D_OC / 2]} distanceFactor={12} zIndexRange={[24, 0]} style={{ pointerEvents: "none" }}>
        <div
          style={{
            transform: "translate(0,-50%)",
            padding: "5px 10px",
            borderRadius: 10,
            background: "rgba(4,10,22,0.9)",
            border: "1px solid #fbbf24",
            color: "#fff",
            fontSize: 11.5,
            fontWeight: 800,
            whiteSpace: "nowrap",
            lineHeight: 1.35,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <div style={{ color: "#fbbf24", fontSize: 10 }}>CTD · {num(ctd.prof)} m</div>
          {num(ctd.t, 1)} °C · {num(ctd.s, 2)} g/kg
          <div>ρ = {num(ctd.rho, 2)} kg/m³</div>
        </div>
      </Html>
      <MasaAgua key={`masa-${p.masaNonce}-${p.zonaId}`} t={p.masaT} s={p.masaS} nonce={p.masaNonce} zonaId={p.zonaId} />
      <Hielo key={`hielo-${p.hieloNonce}-${p.zonaId}`} nonce={p.hieloNonce} rhoSup={sup.rho} />
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. AIRE Y AGUA SE MEZCLAN
 * ════════════════════════════════════════════════════════════════════════ */

const X0_C = -8;
const XW_C = 16;
const VS = 1.1;
const xCiclo = (s: number) => X0_C + XW_C * s;
const yCiclo = (zM: number) => (zM / 1000) * VS;
const S_COSTA = TERRENO[1]![0];
const N_NUBE = 90;
const N_LLUVIA = 90;
const N_VAPOR = 40;

const FORMA_TERRENO = (() => {
  const sh = new THREE.Shape();
  sh.moveTo(xCiclo(S_COSTA) - 0.3, -0.9);
  sh.lineTo(xCiclo(S_COSTA) - 0.3, -0.05);
  for (let i = 0; i <= 60; i++) {
    const s = S_COSTA + ((1 - S_COSTA) * i) / 60;
    const onda = i > 0 && i < 60 ? Math.sin(i * 1.9) * 0.05 : 0;
    sh.lineTo(xCiclo(s), yCiclo(alturaTerreno(s)) + onda);
  }
  sh.lineTo(xCiclo(1) + 0.4, yCiclo(alturaTerreno(1)));
  sh.lineTo(xCiclo(1) + 0.4, -0.9);
  sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, { depth: 3, bevelEnabled: false });
  g.translate(0, 0, -1.5);
  return g;
})();

function EscenaCiclo({ t0, hr0, viaje, progreso, lanzada, modoColor }: { t0: number; hr0: number; viaje: ViajeParcela; progreso: number; lanzada: boolean; modoColor: string }) {
  const parcela = useRef<THREE.Group>(null);
  const esfera = useRef<THREE.Mesh>(null);
  const nube = useRef<THREE.InstancedMesh>(null);
  const lluvia = useRef<THREE.InstancedMesh>(null);
  const vapor = useRef<THREE.InstancedMesh>(null);
  const prog = useRef(progreso);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const cFrio = useMemo(() => new THREE.Color("#bae6fd"), []);
  const cNube = useMemo(() => new THREE.Color("#ffffff"), []);
  const cCalido = useMemo(() => new THREE.Color("#fdba74"), []);
  const tmp = useMemo(() => new THREE.Color(), []);

  const puntosNube = useMemo(() => {
    const pts = viaje.puntos.filter((q) => q.nube);
    return Array.from({ length: N_NUBE }, (_, i) => {
      const q = pts.length ? pts[Math.floor((i / N_NUBE) * pts.length)]! : null;
      return q
        ? { s: q.s, x: xCiclo(q.s) + Math.sin(i * 12.9) * 0.25, y: yCiclo(q.z) + 0.95 + ((i * 0.37) % 1) * 0.6, z: Math.cos(i * 7.7) * 1.1, r: 0.2 + ((i * 0.53) % 1) * 0.18 }
        : null;
    });
  }, [viaje]);
  const gotas = useMemo(() => {
    if (viaje.sNube === null || viaje.sFinLluvia === null) return [];
    const a = viaje.sNube;
    const b = viaje.sFinLluvia;
    return Array.from({ length: N_LLUVIA }, (_, i) => {
      const s = a + (b - a) * ((i * 0.618034) % 1);
      return { s, x: xCiclo(s), z: Math.sin(i * 3.1) * 1.2, fase: (i * 0.29) % 1, top: yCiclo(alturaTerreno(s)) };
    });
  }, [viaje]);
  const semVapor = useMemo(() => Array.from({ length: N_VAPOR }, (_, i) => ({ x: xCiclo(0.02) + ((i * 0.618) % 1) * (xCiclo(S_COSTA) - xCiclo(0.02) - 0.3), z: Math.sin(i * 5.3) * 1.2, fase: (i * 0.377) % 1 })), []);
  const iCresta = useMemo(() => viaje.puntos.reduce((mx, pp, k) => (pp.z > viaje.puntos[mx]!.z ? k : mx), 0), [viaje]);
  const evaporacion = Math.min(1, (presionVaporSat(t0) * (1 - hr0 / 100)) / 32);

  useFrame(({ clock }, dt) => {
    prog.current += (progreso - prog.current) * suave(dt, 0.25);
    const s = prog.current;
    const i = Math.min(viaje.puntos.length - 1, Math.round(s * (viaje.puntos.length - 1)));
    const q = viaje.puntos[i]!;
    const tt = clock.elapsedTime;
    if (parcela.current) parcela.current.position.set(xCiclo(s), yCiclo(alturaTerreno(s)) + 0.45, 0.4);
    if (esfera.current) {
      const m = esfera.current.material as THREE.MeshStandardMaterial;
      if (i > iCresta) tmp.copy(cNube).lerp(cCalido, Math.min(1, (i - iCresta) / 40));
      else tmp.copy(cFrio).lerp(cNube, q.nube ? 1 : 0);
      m.color.copy(tmp);
      esfera.current.scale.setScalar(1 + (q.z / 3000) * 0.35 + Math.sin(tt * 3) * 0.02);
    }
    const mn = nube.current;
    if (mn) {
      puntosNube.forEach((pn, k) => {
        const on = pn !== null && lanzada && pn.s <= s;
        obj.position.set(pn?.x ?? 0, (pn?.y ?? 0) + Math.sin(tt * 0.6 + k) * 0.04, pn?.z ?? 0);
        obj.scale.setScalar(on ? pn!.r * Math.min(1, (s - pn!.s) * 25 + 0.2) : 0.0001);
        obj.updateMatrix();
        mn.setMatrixAt(k, obj.matrix);
      });
      mn.instanceMatrix.needsUpdate = true;
    }
    const ml = lluvia.current;
    if (ml) {
      for (let k = 0; k < N_LLUVIA; k++) {
        const g = gotas[k];
        const on = !!g && lanzada && g.s <= s;
        const p = g ? (tt * 1.4 + g.fase) % 1 : 0;
        obj.position.set(g?.x ?? 0, g ? g.top + 0.9 - p * 0.9 : 0, g?.z ?? 0);
        obj.scale.setScalar(on ? 1 : 0.0001);
        obj.updateMatrix();
        ml.setMatrixAt(k, obj.matrix);
      }
      ml.instanceMatrix.needsUpdate = true;
    }
    const mv = vapor.current;
    if (mv) {
      semVapor.forEach((sv, k) => {
        const activo = k / N_VAPOR < evaporacion;
        const p = (tt * 0.25 + sv.fase) % 1;
        obj.position.set(sv.x + Math.sin(p * 5 + k) * 0.12, 0.1 + p * 2.2, sv.z);
        obj.scale.setScalar(activo ? 0.05 + p * (1 - p) * 0.32 : 0.0001);
        obj.updateMatrix();
        mv.setMatrixAt(k, obj.matrix);
      });
      mv.instanceMatrix.needsUpdate = true;
    }
  });

  const iActual = Math.min(viaje.puntos.length - 1, Math.round(progreso * (viaje.puntos.length - 1)));
  const qActual = viaje.puntos[iActual]!;
  const sCresta = TERRENO[3]![0];

  return (
    <group position={[0, -1.6, 0]}>
      {/* Mar */}
      <mesh position={[(xCiclo(0) + xCiclo(S_COSTA)) / 2 - 0.2, -0.45, 0]}>
        <boxGeometry args={[xCiclo(S_COSTA) - xCiclo(0) + 0.4, 0.9, 3]} />
        <meshStandardMaterial color="#0e7490" roughness={0.15} metalness={0.2} transparent opacity={0.92} />
      </mesh>
      <mesh geometry={FORMA_TERRENO}>
        <meshStandardMaterial color="#4d7c0f" roughness={0.95} flatShading />
      </mesh>
      {/* Lado seco de sotavento */}
      <mesh position={[(xCiclo(sCresta + 0.05) + xCiclo(1) + 0.4) / 2, yCiclo(alturaTerreno(0.93)) + 0.02, 0]} rotation={[0, 0, Math.atan2(yCiclo(2400) - yCiclo(3000), xCiclo(1) - xCiclo(sCresta))]}>
        <boxGeometry args={[xCiclo(1) - xCiclo(sCresta + 0.05) + 0.3, 0.05, 3.02]} />
        <meshStandardMaterial color="#a16207" roughness={1} />
      </mesh>
      {viaje.tCresta < 0 && (
        <mesh position={[xCiclo(sCresta), yCiclo(3000) - 0.1, 0]}>
          <boxGeometry args={[1.2, 0.2, 3.04]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.7} />
        </mesh>
      )}
      {/* Montañas de fondo */}
      <mesh position={[xCiclo(0.7), yCiclo(4282) / 2 - 0.5, -4]}>
        <coneGeometry args={[2.6, yCiclo(4282) + 1, 8]} />
        <meshStandardMaterial color="#3f4a3a" roughness={1} flatShading />
      </mesh>
      <group position={[xCiclo(0.64), 0, -9]}>
        <mesh position={[0, yCiclo(5636) / 2 - 0.5, 0]}>
          <coneGeometry args={[3.6, yCiclo(5636) + 1, 9]} />
          <meshStandardMaterial color="#374151" roughness={1} flatShading />
        </mesh>
        <mesh position={[0, yCiclo(5636) - 0.55, 0]}>
          <coneGeometry args={[0.95, 1.1, 9]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.8} flatShading />
        </mesh>
        <Etiqueta pos={[0, yCiclo(5636) + 0.9, 0]} df={15} fs={10.5}>
          Pico de Orizaba · 5 636 m (al fondo)
        </Etiqueta>
      </group>
      <Etiqueta pos={[xCiclo(0.7), yCiclo(4282) + 0.2, -4]} df={15} fs={10.5}>
        Cofre de Perote · 4 282 m
      </Etiqueta>

      {/* Sol y evaporación */}
      <mesh position={[-6.6, 6.4, -3]}>
        <sphereGeometry args={[0.6, 24, 18]} />
        <meshBasicMaterial color="#fde68a" toneMapped={false} />
      </mesh>
      <instancedMesh ref={vapor} args={[undefined, undefined, N_VAPOR]} frustumCulled={false}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshBasicMaterial color="#e0f2fe" transparent opacity={0.3} depthWrite={false} />
      </instancedMesh>
      <Etiqueta pos={[xCiclo(0.1), 2.7, 0.6]} df={15} fs={10.5} col="#7dd3fcaa">
        <i className="fa-solid fa-arrow-up" style={{ color: "#7dd3fc" }} />
        Evaporación: líquido → gas
      </Etiqueta>

      {/* Pueblos */}
      {(
        [
          [S_COSTA, "Veracruz · 0 m"],
          [0.58, "Xalapa · 1 400 m"],
          [sCresta, "Paso de la sierra · 3 000 m"],
          [1, "Perote · 2 400 m"],
        ] as [number, string][]
      ).map(([s, etq]) => (
        <group key={etq}>
          {[-0.18, 0.12, 0.3].map((dx, k) => (
            <mesh key={k} position={[xCiclo(s) + dx - (s === 1 ? 0.3 : 0), yCiclo(alturaTerreno(s)) + 0.1 + (k % 2) * 0.03, 1.1 - k * 0.25]}>
              <boxGeometry args={[0.16, 0.2 + (k % 2) * 0.06, 0.16]} />
              <meshStandardMaterial color={["#f5f5f4", "#fca5a5", "#fde68a"][k]!} roughness={0.7} />
            </mesh>
          ))}
          <Etiqueta pos={[xCiclo(s) - (s === 1 ? 0.3 : 0), yCiclo(alturaTerreno(s)) - 0.45, 1.6]} df={15} fs={10.5}>
            {etq}
          </Etiqueta>
        </group>
      ))}
      <Etiqueta pos={[xCiclo(0.13), -1.25, 1.6]} df={15} fs={10.5} col="#0e7490">
        <i className="fa-solid fa-water" style={{ color: "#67e8f9" }} />
        Golfo de México
      </Etiqueta>
      <Etiqueta pos={[xCiclo(0.42), yCiclo(3000) + 1.2, 1.4]} df={15} fs={10.5}>
        Barlovento: el viento sube →
      </Etiqueta>
      <Etiqueta pos={[xCiclo(0.92), yCiclo(3000) + 1.2, 1.4]} df={15} fs={10.5}>
        Sotavento: baja →
      </Etiqueta>

      {/* Nube y lluvia */}
      <instancedMesh ref={nube} args={[undefined, undefined, N_NUBE]} frustumCulled={false}>
        <sphereGeometry args={[1, 14, 10]} />
        <meshStandardMaterial color="#ffffff" emissive="#e2e8f0" emissiveIntensity={0.35} roughness={0.95} transparent opacity={0.9} />
      </instancedMesh>
      <instancedMesh ref={lluvia} args={[undefined, undefined, N_LLUVIA]} frustumCulled={false}>
        <boxGeometry args={[0.018, 0.2, 0.018]} />
        <meshBasicMaterial color="#93c5fd" transparent opacity={0.85} />
      </instancedMesh>
      {viaje.zNube !== null && viaje.sNube !== null && lanzada && progreso >= viaje.sNube && (
        <>
          <Line
            points={[
              [xCiclo(viaje.sNube) - 0.6, yCiclo(viaje.zNube) + 0.45, 1.55],
              [xCiclo(sCresta) + 0.4, yCiclo(viaje.zNube) + 0.45, 1.55],
            ]}
            color="#e2e8f0"
            lineWidth={1.5}
            dashed
            dashSize={0.15}
            gapSize={0.1}
          />
          <Etiqueta pos={[xCiclo(viaje.sNube) - 1.9, yCiclo(viaje.zNube) + 0.45, 1.55]} df={15} fs={10.5} col="#e2e8f0aa">
            Base de la nube · {num(viaje.zNube)} m
          </Etiqueta>
        </>
      )}

      {/* Parcela */}
      <group ref={parcela} position={[xCiclo(progreso), yCiclo(alturaTerreno(progreso)) + 0.45, 0.4]}>
        <mesh ref={esfera}>
          <sphereGeometry args={[0.36, 28, 20]} />
          <meshStandardMaterial color="#bae6fd" transparent opacity={0.72} roughness={0.2} emissive={modoColor} emissiveIntensity={0.15} depthWrite={false} />
        </mesh>
        <Html position={[0, 0.75, 0]} center distanceFactor={15} zIndexRange={[26, 0]} style={{ pointerEvents: "none" }}>
          <div
            style={{
              padding: "5px 10px",
              borderRadius: 10,
              background: "rgba(4,10,22,0.9)",
              border: `1px solid ${modoColor}`,
              color: "#fff",
              fontSize: 11.5,
              fontWeight: 800,
              whiteSpace: "nowrap",
              lineHeight: 1.35,
              textAlign: "center",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <div style={{ color: modoColor, fontSize: 10 }}>PARCELA · {num(qActual.z)} m</div>
            {num(qActual.tC, 1)} °C · {num(qActual.r, 1)} g/kg de vapor
            <div style={{ fontSize: 10.5, color: qActual.nube ? "#fff" : "#bae6fd" }}>{qActual.nube ? "saturada: se condensa" : `humedad relativa ${num(qActual.hr)} %`}</div>
          </div>
        </Html>
      </group>
      <Etiqueta pos={[-5.6, 5.1, -3]} df={15} fs={9.5}>
        Corte esquemático: ≈ 100 km comprimidos, altura exagerada
      </Etiqueta>
    </group>
  );
}

/* ── Escena ───────────────────────────────────────────────────────────── */

export default function HidrosferaAtmosferaScene(p: HidrosferaAtmosferaSceneProps) {
  const { vista, modoColor, resetNonce } = p;
  const cam = useMemo((): { pos: Pt; target: Pt; min: number; max: number } => {
    if (vista === "atmosfera") return { pos: [1.3, -0.2, 22.5], target: [1.3, -0.5, 0], min: 6, max: 32 };
    if (vista === "oceano") return { pos: [3.4, 4.2, 16.5], target: [0, -0.6, 0], min: 5, max: 26 };
    return { pos: [0.4, 3.4, 19.5], target: [0.2, 1.0, 0], min: 5, max: 28 };
  }, [vista]);

  return (
    <Canvas key={`${vista}-${resetNonce}`} shadows dpr={[1, 1.75]} camera={{ position: cam.pos, fov: 42 }} gl={{ antialias: true }}>
      {/* Suelo, luz de tres puntos y entorno que reflejar. */}
      {/* Sin altura: esta escena no tenía sombra de la que leerla, así
          que el escenario la MIDE de la propia escena al montarse, en
          vez de que alguien la adivine. */}
      <Escenario acento="#38bdf8" />
      <pointLight position={[-6, 3, 5]} intensity={0.4} color={modoColor} />

      {vista === "atmosfera" && <EscenaAtmosfera zKm={p.zKm} vuelo={p.vuelo} modoColor={modoColor} />}
      {vista === "oceano" && <EscenaOceano zonaId={p.zonaId} profCTD={p.profCTD} masaT={p.masaT} masaS={p.masaS} masaNonce={p.masaNonce} hieloNonce={p.hieloNonce} />}
      {vista === "ciclo" && <EscenaCiclo t0={p.t0} hr0={p.hr0} viaje={p.viaje} progreso={p.progreso} lanzada={p.lanzada} modoColor={modoColor} />}

      <OrbitControls makeDefault enablePan={false} enableZoom minDistance={cam.min} maxDistance={cam.max} maxPolarAngle={Math.PI * 0.62} minPolarAngle={Math.PI * 0.2} maxAzimuthAngle={0.9} minAzimuthAngle={-0.9} target={cam.target} />
      <EffectComposer>
        <Bloom intensity={0.3} luminanceThreshold={0.7} luminanceSmoothing={0.85} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.6} />
      </EffectComposer>
    </Canvas>
  );
}
