"use client";

/**
 * Escena 3D del laboratorio "Estadísticas que engañan" (PM-VI-P08).
 * Ocho vistas, una por truco de la infografía A1:
 *
 *  - truncado: dos barras cuyo eje puede empezar en 0 o donde el medio quiera.
 *  - volumen: un ícono que crece solo a lo alto o en sus tres dimensiones.
 *  - log: dos curvas exponenciales que se transforman entre escala lineal y
 *    logarítmica.
 *  - puntos: dos tanques con la tasa antes y después, y la diferencia puesta
 *    junto al valor original para leer el porcentaje de cambio.
 *  - riesgo: 1 000 figuras antes y después; se iluminan los casos.
 *  - bases: presupuestos apilados en bloques de 10 000 millones.
 *  - mediana: 20 hogares ordenados; el nivel de la media y el de la mediana.
 *  - margen: los intervalos de dos candidatos y su zona de empate.
 *
 * Toda animación ocurre en useFrame mutando refs y avanza por tiempo, no por
 * cuadro. NO se usa <Text> de drei (cuelga el chunk con Turbopack): el texto
 * del lienzo va en <Html>.
 */

import * as THREE from "three";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Html, Line } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import type { Line2 } from "three-stdlib";
import { CurvaTubo } from "./_tablero";
import {
  type Vista,
  type CasoBarras,
  type CasoVolumen,
  type CasoPuntos,
  type CasoRiesgo,
  type Escalado,
  alturasBarras,
  razonIcono,
  CURVAS,
  DIAS,
  casos,
  alturaEscala,
  MARCAS_LIN,
  MARCAS_LOG,
  cambios,
  FIGURAS,
  leerRiesgo,
  figurasConCaso,
  BASES,
  aumento,
  hogares,
  media,
  mediana,
  PESOS_POR_UNIDAD,
  ENCUESTA,
  margenPuntos,
  num,
  conSigno,
} from "./estadistica-enganosa-data";

export interface EnganosaSceneProps {
  vista: Vista;
  casoBarras: CasoBarras;
  ejeMin: number;
  casoVolumen: CasoVolumen;
  escalado: Escalado;
  log: boolean;
  casoPuntos: CasoPuntos;
  casoRiesgo: CasoRiesgo;
  pctSeguridad: number;
  ricoMayor: number;
  nEncuesta: number;
  accent: string;
  modoColor: string;
  resetNonce: number;
}

type Pt = [number, number, number];

const SUBE = "#34d399";
const BAJA = "#f87171";
const GRIS = "#94a3b8";

const suave = (dt: number, porCuadro: number) => 1 - Math.pow(1 - porCuadro, Math.min(dt, 0.25) * 60);

/** Valor que persigue a `objetivo` con suavizado por tiempo. */
function useSuave(objetivo: number, inicial: number, rapidez = 0.12) {
  const v = useRef(inicial);
  useFrame((_, dt) => {
    v.current += (objetivo - v.current) * suave(dt, rapidez);
  });
  return v;
}

function Etiqueta({ pos, children, df = 10, col, izq, der }: { pos: Pt; children: ReactNode; df?: number; col?: string; izq?: boolean; der?: boolean }) {
  return (
    <Html position={pos} center={!izq && !der} distanceFactor={df} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
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
          transform: izq ? "translateY(-50%)" : der ? "translate(-100%, -50%)" : undefined,
        }}
      >
        {children}
      </div>
    </Html>
  );
}

function Letra({ pos, children, df = 8, col = GRIS, size = 12, der }: { pos: Pt; children: ReactNode; df?: number; col?: string; size?: number; der?: boolean }) {
  return (
    <Html position={pos} center={!der} distanceFactor={df} zIndexRange={[15, 0]} style={{ pointerEvents: "none" }}>
      <div style={{ color: col, fontSize: size, fontWeight: 800, whiteSpace: "nowrap", textShadow: "0 2px 6px #000", transform: der ? "translate(-100%, -50%)" : undefined }}>{children}</div>
    </Html>
  );
}

function Piso({ w, d, y = -0.06 }: { w: number; d: number; y?: number }) {
  return (
    <mesh position={[0, y, 0]} receiveShadow>
      <boxGeometry args={[w, 0.12, d]} />
      <meshStandardMaterial color="#111c2e" roughness={0.85} />
    </mesh>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 1a. EJE TRUNCADO
 * ════════════════════════════════════════════════════════════════════════ */

const H_BARRAS = 3.4;

function Barra({ x, alto, color, children, ancho = 1.1 }: { x: number; alto: number; color: string; children?: ReactNode; ancho?: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  const tope = useRef<THREE.Group>(null);
  const h = useSuave(alto, 0.02, 0.1);
  useFrame(() => {
    const y = Math.max(0.004, h.current);
    if (mesh.current) {
      mesh.current.scale.set(ancho, y, ancho);
      mesh.current.position.y = y / 2;
    }
    if (tope.current) tope.current.position.y = y + 0.38;
  });
  return (
    <group position={[x, 0, 0]}>
      <mesh ref={mesh} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.22} roughness={0.35} metalness={0.1} />
      </mesh>
      <group ref={tope}>{children}</group>
    </group>
  );
}

function fmtValor(c: CasoBarras, v: number, dec: number) {
  return `${c.prefijo ?? ""}${num(v, dec)}${c.unidad === "%" ? " %" : ""}`;
}

function EscenaTruncado({ caso, ejeMin, modoColor }: { caso: CasoBarras; ejeMin: number; modoColor: string }) {
  const [ha, hb] = alturasBarras(caso, ejeMin);
  const top = Math.max(caso.a.v, caso.b.v);
  const paso = (top - ejeMin) / 4;
  const decEje = Math.max(caso.dec, [0, 1, 2].find((d) => Math.abs(Math.round(paso * 10 ** d) - paso * 10 ** d) < 1e-6) ?? 2);
  const truncado = ejeMin > 1e-9;
  const AX = -2.1;
  const zig: Pt[] = [
    [AX, -0.02, 0.02],
    [AX - 0.14, 0.08, 0.02],
    [AX + 0.14, 0.2, 0.02],
    [AX - 0.14, 0.32, 0.02],
    [AX, 0.42, 0.02],
  ];
  return (
    <group position={[0, -1.7, 0]}>
      <Piso w={6.2} d={2.4} />
      <Line
        points={[
          [AX, 0, 0],
          [AX, H_BARRAS + 0.25, 0],
        ]}
        color="#cbd5e1"
        lineWidth={2}
      />
      {Array.from({ length: 5 }, (_, i) => i).map((i) => {
        const y = (H_BARRAS * i) / 4;
        return (
          <group key={i}>
            <Line
              points={[
                [AX, y, 0],
                [2.3, y, -0.62],
              ]}
              color="#334155"
              lineWidth={0.8}
              transparent
              opacity={0.5}
            />
            <Letra pos={[AX - 0.16, y, 0]} der size={11} col={i === 0 && truncado ? BAJA : "#cbd5e1"}>
              {fmtValor(caso, ejeMin + paso * i, decEje)}
            </Letra>
          </group>
        );
      })}
      {truncado && (
        <>
          <CurvaTubo puntos={zig} color={BAJA} grosor={0.054} />
          <Etiqueta pos={[-0.75, H_BARRAS + 0.42, 0]} col={`${BAJA}aa`} df={9}>
            <i className="fa-solid fa-scissors" style={{ color: BAJA }} />
            El eje empieza en {fmtValor(caso, ejeMin, decEje)}
          </Etiqueta>
        </>
      )}

      <Barra x={-0.75} alto={H_BARRAS * ha} color="#64748b">
        <Etiqueta pos={[0, 0, 0]} df={9}>
          {fmtValor(caso, caso.a.v, caso.dec)}
        </Etiqueta>
      </Barra>
      <Barra x={1.05} alto={H_BARRAS * hb} color={modoColor}>
        <Etiqueta pos={[0, 0, 0]} col={`${modoColor}aa`} df={9}>
          {fmtValor(caso, caso.b.v, caso.dec)}
        </Etiqueta>
      </Barra>
      <Letra pos={[-0.75, -0.3, 0.8]} size={12} col="#e2e8f0">
        {caso.a.etq}
      </Letra>
      <Letra pos={[1.05, -0.3, 0.8]} size={12} col="#e2e8f0">
        {caso.b.etq}
      </Letra>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 1b. ÍCONOS ESCALADOS
 * ════════════════════════════════════════════════════════════════════════ */

function FormaIcono({ icono, color }: { icono: CasoVolumen["icono"]; color: string }) {
  if (icono === "casa")
    return (
      <>
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[0.82, 0.6, 0.82]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.8, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[0.66, 0.4, 4]} />
          <meshStandardMaterial color="#b45309" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.2, 0.415]}>
          <boxGeometry args={[0.2, 0.4, 0.02]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </>
    );
  if (icono === "frasco")
    return (
      <>
        <mesh position={[0, 0.38, 0]} castShadow>
          <cylinderGeometry args={[0.38, 0.38, 0.76, 28]} />
          <meshStandardMaterial color={color} roughness={0.25} metalness={0.05} transparent opacity={0.92} />
        </mesh>
        <mesh position={[0, 0.84, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.16, 28]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.4, 0.385]}>
          <boxGeometry args={[0.5, 0.3, 0.01]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
      </>
    );
  return (
    <>
      <mesh position={[0, 0.4, 0]} scale={[1, 0.95, 1]} castShadow>
        <sphereGeometry args={[0.42, 32, 24]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.86, 0]} castShadow>
        <coneGeometry args={[0.2, 0.22, 20]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.76, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.16, 0.035, 10, 24]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
    </>
  );
}

function EscenaVolumen({ caso, escalado, modoColor }: { caso: CasoVolumen; escalado: Escalado; modoColor: string }) {
  const { razonDato } = razonIcono(caso, escalado);
  const k = Math.min(1.3, 3.3 / razonDato);
  const tres = escalado === "tres";
  const anchoB = k * (tres ? razonDato : 1);
  const altoB = k * razonDato;

  const grupo = useRef<THREE.Group>(null);
  const a = useRef<THREE.Group>(null);
  const b = useRef<THREE.Group>(null);
  const etqA = useRef<THREE.Group>(null);
  const etqB = useRef<THREE.Group>(null);
  const sx = useSuave(anchoB, k, 0.1);
  const sy = useSuave(altoB, k, 0.1);

  useFrame(() => {
    const wB = sx.current;
    const xA = -0.45 - k / 2;
    const xB = 0.45 + wB / 2;
    if (grupo.current) grupo.current.position.x = -(wB - k) / 2;
    if (a.current) {
      a.current.position.x = xA;
      a.current.scale.setScalar(k);
    }
    if (b.current) {
      b.current.position.x = xB;
      b.current.scale.set(wB, sy.current, wB);
    }
    if (etqA.current) etqA.current.position.set(xA, k + 0.35, 0);
    if (etqB.current) etqB.current.position.set(xB, sy.current + 0.35, 0);
  });

  const col = caso.icono === "bolsa" ? "#fbbf24" : caso.icono === "frasco" ? "#fb7185" : "#e2e8f0";
  return (
    <group position={[0, -1.8, 0]}>
      <Piso w={9} d={4.2} />
      <group ref={grupo}>
        <group ref={a}>
          <FormaIcono icono={caso.icono} color={col} />
        </group>
        <group ref={b}>
          <FormaIcono icono={caso.icono} color={col} />
        </group>
        <group ref={etqA}>
          <Etiqueta pos={[0, 0, 0]} df={10}>
            {num(caso.a.v)} {caso.unidad}
          </Etiqueta>
        </group>
        <group ref={etqB}>
          <Etiqueta pos={[0, 0, 0]} col={`${modoColor}aa`} df={10}>
            {num(caso.b.v)} {caso.unidad}
          </Etiqueta>
        </group>
      </group>
      <Letra pos={[0, -0.34, 2.0]} size={13} col="#e2e8f0" df={9}>
        {caso.a.etq} → {caso.b.etq}
      </Letra>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 1c. ESCALA LOGARÍTMICA
 * ════════════════════════════════════════════════════════════════════════ */

const LW = 8;
const LH = 3.8;
const xDia = (d: number) => -LW / 2 + (d / DIAS) * LW;

function Curva({ curva, log }: { curva: (typeof CURVAS)[number]; log: boolean }) {
  const ref = useRef<Line2>(null);
  const t = useRef(log ? 1 : 0);
  const listo = useRef(false);
  const inicial = useMemo(() => Array.from({ length: DIAS + 1 }, (_, d) => [xDia(d), alturaEscala(casos(curva, d), log) * LH, 0] as Pt), [curva, log]);

  useFrame((_, dt) => {
    const obj = log ? 1 : 0;
    if (Math.abs(t.current - obj) < 1e-4 && listo.current) return;
    t.current += (obj - t.current) * suave(dt, 0.08);
    if (Math.abs(t.current - obj) < 1e-3) t.current = obj;
    const buf: number[] = new Array((DIAS + 1) * 3);
    for (let d = 0; d <= DIAS; d++) {
      const c = casos(curva, d);
      buf[d * 3] = xDia(d);
      buf[d * 3 + 1] = (alturaEscala(c, false) * (1 - t.current) + alturaEscala(c, true) * t.current) * LH;
      buf[d * 3 + 2] = 0.02;
    }
    ref.current?.geometry.setPositions(buf);
    listo.current = true;
  });

  return <CurvaTubo puntos={inicial} color={curva.color} grosor={0.072} />;
}

function EscenaLog({ log, modoColor }: { log: boolean; modoColor: string }) {
  const marcas = log ? MARCAS_LOG : MARCAS_LIN;
  return (
    <group position={[0, -1.9, 0]}>
      <mesh position={[0, LH / 2, -0.06]} receiveShadow>
        <boxGeometry args={[LW + 0.5, LH + 0.5, 0.08]} />
        <meshStandardMaterial color="#0d1728" roughness={0.9} />
      </mesh>
      {marcas.map((v) => {
        const y = alturaEscala(v, log) * LH;
        return (
          <group key={`${log}-${v}`}>
            <Line
              points={[
                [-LW / 2, y, 0],
                [LW / 2, y, 0],
              ]}
              color="#334155"
              lineWidth={0.8}
            />
            <Letra pos={[-LW / 2 - 0.12, y, 0]} der size={11} col="#cbd5e1">
              {num(v)}
            </Letra>
          </group>
        );
      })}
      {[0, 10, 20, 30, 40, 50, 60].map((d) => (
        <Letra key={d} pos={[xDia(d), -0.28, 0]} size={11}>
          {d}
        </Letra>
      ))}
      <Letra pos={[0, -0.62, 0]} size={12} col="#e2e8f0">
        Días desde el primer caso
      </Letra>
      {CURVAS.map((c) => (
        <Curva key={c.id} curva={c} log={log} />
      ))}
      {CURVAS.map((c) => (
        <Etiqueta key={c.id} pos={[xDia(DIAS) + 0.15, Math.min(LH + 0.1, alturaEscala(casos(c, DIAS), log) * LH), 0]} col={`${c.color}aa`} df={10} izq>
          <span style={{ width: 9, height: 9, borderRadius: 3, background: c.color }} />
          {num(casos(c, DIAS))}
        </Etiqueta>
      ))}
      <Etiqueta pos={[LW / 2 - 1.9, LH + 0.5, 0]} col={`${modoColor}aa`} df={10}>
        <i className="fa-solid fa-ruler-vertical" style={{ color: modoColor }} />
        {log ? "Escala logarítmica: cada marca vale ×10" : "Escala lineal: cada marca suma 50 000"}
      </Etiqueta>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 2a. PUNTOS O PORCENTAJE
 * ════════════════════════════════════════════════════════════════════════ */

const H_TANQUE = 3.3;

function Liquido({ alto, color, radio = 0.5 }: { alto: number; color: string; radio?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const h = useSuave(alto, 0.02, 0.1);
  useFrame(() => {
    const y = Math.max(0.004, h.current);
    if (ref.current) {
      ref.current.scale.y = y;
      ref.current.position.y = y / 2;
    }
  });
  return (
    <mesh ref={ref}>
      <cylinderGeometry args={[radio, radio, 1, 36]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} roughness={0.2} transparent opacity={0.9} />
    </mesh>
  );
}

function Tanque({ x, alto, color }: { x: number; alto: number; color: string }) {
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, H_TANQUE / 2 + 0.05, 0]}>
        <cylinderGeometry args={[0.58, 0.58, H_TANQUE + 0.1, 36, 1, true]} />
        <meshStandardMaterial color="#cbd5e1" transparent opacity={0.13} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.62, 0.62, 0.06, 36]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <Liquido alto={alto} color={color} />
    </group>
  );
}

function EscenaPuntos({ caso, modoColor }: { caso: CasoPuntos; modoColor: string }) {
  const esc = (v: number) => (v / caso.escalaMax) * H_TANQUE;
  const { puntos, porcentaje } = cambios(caso.a, caso.b);
  const col = puntos >= 0 ? SUBE : BAJA;
  const ha = esc(caso.a);
  const hb = esc(caso.b);
  const lo = Math.min(ha, hb);
  const hi = Math.max(ha, hb);
  const dec = Number.isInteger(caso.a) && Number.isInteger(caso.b) ? 0 : 1;
  const u = caso.unidad === "%" ? " %" : "";
  const XA = -3;
  const XB = -1.1;
  const XR = 1.55;
  return (
    <group position={[0, -1.7, 0]}>
      <Piso w={9.4} d={2.6} />
      <Tanque x={XA} alto={ha} color="#64748b" />
      <Tanque x={XB} alto={hb} color={modoColor} />
      <Etiqueta pos={[XA, hb > ha ? ha + 0.35 : H_TANQUE + 0.45, 0]} df={9}>
        {num(caso.a, dec)}
        {u}
      </Etiqueta>
      <Etiqueta pos={[XB, H_TANQUE + 0.45, 0]} col={`${modoColor}aa`} df={9}>
        {num(caso.b, dec)}
        {u}
      </Etiqueta>
      <Letra pos={[XA, -0.3, 0.9]} col="#e2e8f0">
        Antes
      </Letra>
      <Letra pos={[XB, -0.3, 0.9]} col="#e2e8f0">
        Después
      </Letra>

      {/* Nivel de «antes» atravesando al tanque de «después» */}
      <Line
        points={[
          [XA + 0.6, ha, 0],
          [XB + 0.85, ha, 0],
        ]}
        color="#e2e8f0"
        lineWidth={1.6}
        dashed
        dashSize={0.12}
        gapSize={0.08}
      />
      {/* La diferencia */}
      <mesh position={[XB + 0.78, (lo + hi) / 2, 0]}>
        <boxGeometry args={[0.1, Math.max(0.01, hi - lo), 0.1]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.6} />
      </mesh>
      <Etiqueta pos={[XB + 0.98, (lo + hi) / 2, 0]} col={`${col}aa`} df={9} izq>
        {conSigno(puntos, dec)} {caso.diferencia}
      </Etiqueta>

      {/* La regla del porcentaje: la diferencia junto al valor original */}
      <group position={[XR + 1.2, 0, 0]}>
        <mesh position={[-0.42, ha / 2, 0]} castShadow>
          <boxGeometry args={[0.62, Math.max(0.01, ha), 0.62]} />
          <meshStandardMaterial color="#64748b" roughness={0.5} />
        </mesh>
        <mesh position={[0.42, (hi - lo) / 2, 0]} castShadow>
          <boxGeometry args={[0.62, Math.max(0.01, hi - lo), 0.62]} />
          <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.3} roughness={0.4} />
        </mesh>
        <Line
          points={[
            [-0.8, ha, 0.32],
            [0.8, ha, 0.32],
          ]}
          color="#e2e8f0"
          lineWidth={1.2}
          dashed
          dashSize={0.08}
          gapSize={0.06}
        />
        <Letra pos={[-0.42, -0.3, 0.9]} col="#e2e8f0">
          Antes
        </Letra>
        <Letra pos={[0.42, -0.3, 0.9]} col={col}>
          Cambio
        </Letra>
        <Etiqueta pos={[0, H_TANQUE + 0.45, 0]} col={`${col}aa`} df={9}>
          {num(Math.abs(puntos), dec)} ÷ {num(caso.a, dec)} = {conSigno(porcentaje, 1)} %
        </Etiqueta>
      </group>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 2b. RIESGO RELATIVO Y ABSOLUTO
 * ════════════════════════════════════════════════════════════════════════ */

const COLS = 40;
const ROWS = FIGURAS / COLS;
const SPR = 0.1;

function Rejilla({ x, iluminadas, color }: { x: number; iluminadas: number[]; color: string }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const halos = useRef<THREE.Group>(null);
  const pos = (i: number): Pt => [(i % COLS) * SPR - ((COLS - 1) * SPR) / 2, 0, Math.floor(i / COLS) * SPR - ((ROWS - 1) * SPR) / 2];

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    const c = new THREE.Color();
    const set = new Set(iluminadas);
    for (let i = 0; i < FIGURAS; i++) {
      const [px, , pz] = pos(i);
      const on = set.has(i);
      dummy.position.set(px, on ? 0.11 : 0.05, pz);
      dummy.scale.set(1, on ? 2.2 : 1, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, c.set(on ? color : "#475569"));
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  useFrame(({ clock }) => {
    const g = halos.current;
    if (!g) return;
    const s = 1 + ((clock.elapsedTime * 0.9) % 1) * 2.2;
    g.children.forEach((ch) => {
      const anillo = ch.children[2];
      if (anillo) {
        anillo.scale.setScalar(s);
        const mat = (anillo as THREE.Mesh).material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, 0.8 - (s - 1) / 2.8);
      }
    });
  });

  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, -0.02, 0]} receiveShadow>
        <boxGeometry args={[COLS * SPR + 0.25, 0.04, ROWS * SPR + 0.25]} />
        <meshStandardMaterial color="#0f1a2c" roughness={0.9} />
      </mesh>
      <instancedMesh ref={ref} args={[undefined, undefined, FIGURAS]}>
        <cylinderGeometry args={[0.028, 0.034, 0.1, 6]} />
        <meshStandardMaterial roughness={0.6} />
      </instancedMesh>
      <group ref={halos}>
        {iluminadas.map((i) => {
          const [px, , pz] = pos(i);
          return (
            <group key={i} position={[px, 0, pz]}>
              <mesh position={[0, 0.42, 0]}>
                <cylinderGeometry args={[0.012, 0.012, 0.6, 8]} />
                <meshBasicMaterial color={color} />
              </mesh>
              <mesh position={[0, 0.76, 0]}>
                <sphereGeometry args={[0.09, 20, 14]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
              </mesh>
              <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.07, 0.1, 28]} />
                <meshBasicMaterial color={color} transparent opacity={0.8} depthWrite={false} />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}

function EscenaRiesgo({ caso, modoColor }: { caso: CasoRiesgo; modoColor: string }) {
  const r = leerRiesgo(caso);
  const figs = useMemo(() => figurasConCaso(caso), [caso]);
  const XG = 2.2;
  return (
    <group position={[0, -0.6, 0]}>
      <Rejilla x={-XG} iluminadas={figs.antes} color={BAJA} />
      <Rejilla x={XG} iluminadas={figs.despues} color={modoColor} />
      <Etiqueta pos={[-XG, 0.2, -ROWS * SPR * 0.5 - 0.55]} df={9}>
        Antes: {num(r.casosAntes)} {r.casosAntes === 1 ? "caso" : "casos"} en {num(r.personas)}
      </Etiqueta>
      <Etiqueta pos={[XG, 0.2, -ROWS * SPR * 0.5 - 0.55]} col={`${modoColor}aa`} df={9}>
        Después: {num(r.casosDespues)} {r.casosDespues === 1 ? "caso" : "casos"} en {num(r.personas)}
      </Etiqueta>
      <Letra pos={[0, 0.02, ROWS * SPR * 0.5 + 0.45]} col="#e2e8f0" size={13} df={8}>
        {caso.porFigura === 1 ? "Cada figura es una persona" : `Cada figura representa a ${num(caso.porFigura)} personas`}
      </Letra>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 2c. BASES DISTINTAS
 * ════════════════════════════════════════════════════════════════════════ */

const BW = 0.46;
const BH = 0.17;
const BD = 0.3;
const POR_CAPA = 10;

function posBloque(i: number): Pt {
  const capa = Math.floor(i / POR_CAPA);
  const j = i % POR_CAPA;
  return [(j % 5) * (BW + 0.04) - 2 * (BW + 0.04), capa * (BH + 0.03) + BH / 2, (Math.floor(j / 5) - 0.5) * (BD + 0.05)];
}

function Pila({ x, base, extra, color, nuevo }: { x: number; base: number; extra: number; color: string; nuevo: string }) {
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (mat.current) mat.current.emissiveIntensity = 0.45 + Math.sin(clock.elapsedTime * 3) * 0.2;
  });
  const completos = Math.floor(extra + 1e-9);
  const parcial = extra - completos;
  const bloquesNuevos = Array.from({ length: completos + (parcial > 0.01 ? 1 : 0) }, (_, k) => ({ i: base + k, f: k < completos ? 1 : parcial }));
  return (
    <group position={[x, 0, 0]}>
      {Array.from({ length: base }, (_, i) => (
        <mesh key={i} position={posBloque(i)} castShadow>
          <boxGeometry args={[BW, BH, BD]} />
          <meshStandardMaterial color={color} roughness={0.55} />
        </mesh>
      ))}
      {bloquesNuevos.map(({ i, f }) => {
        const [px, py, pz] = posBloque(i);
        return (
          <mesh key={i} position={[px - (BW * (1 - f)) / 2, py, pz]} scale={[f, 1, 1]} castShadow>
            <boxGeometry args={[BW, BH, BD]} />
            <meshStandardMaterial ref={i === base ? mat : undefined} color={nuevo} emissive={nuevo} emissiveIntensity={0.45} roughness={0.4} />
          </mesh>
        );
      })}
    </group>
  );
}

function EscenaBases({ pctSeguridad }: { pctSeguridad: number }) {
  const { salud, seguridad, bloque } = BASES;
  const aSalud = aumento(salud.base, salud.pct);
  const aSeg = aumento(seguridad.base, pctSeguridad);
  const XS = -1.9;
  const XG = 1.9;
  const alto = (bloques: number) => Math.ceil(bloques / POR_CAPA) * (BH + 0.03);
  const escalaBarra = 2.4 / 40_000;
  const mayor = aSeg > aSalud + 1e-6 ? "seg" : aSeg < aSalud - 1e-6 ? "salud" : "igual";
  return (
    <group position={[0, -1.3, 0]}>
      <Piso w={9} d={3.6} />
      <Pila x={XS} base={salud.base / bloque} extra={aSalud / bloque} color={salud.color} nuevo="#fbbf24" />
      <Pila x={XG} base={seguridad.base / bloque} extra={aSeg / bloque} color={seguridad.color} nuevo="#fbbf24" />
      <Etiqueta pos={[XS, alto((salud.base + aSalud) / bloque) + 0.4, 0]} col={`${salud.color}aa`} df={9}>
        {salud.etq}: ${num(salud.base)} M · +{salud.pct} %
      </Etiqueta>
      <Etiqueta pos={[XG, alto((seguridad.base + aSeg) / bloque) + 0.4, 0]} col={`${seguridad.color}aa`} df={9}>
        {seguridad.etq}: ${num(seguridad.base)} M · +{num(pctSeguridad, 1)} %
      </Etiqueta>

      {/* Los aumentos en pesos, lado a lado */}
      <group position={[-0.3, 0.02, 1.15]}>
        {[
          { etq: "Aumento de salud", v: aSalud, z: -0.45, col: salud.color, gana: mayor === "salud" },
          { etq: "Aumento de seguridad", v: aSeg, z: 0.45, col: seguridad.color, gana: mayor === "seg" },
        ].map((b) => (
          <group key={b.etq} position={[0, 0.08, b.z]}>
            <mesh position={[(b.v * escalaBarra) / 2, 0, 0]}>
              <boxGeometry args={[Math.max(0.01, b.v * escalaBarra), 0.14, 0.2]} />
              <meshStandardMaterial color={b.col} emissive={b.gana || mayor === "igual" ? "#fbbf24" : b.col} emissiveIntensity={b.gana || mayor === "igual" ? 0.45 : 0.15} />
            </mesh>
            <Letra pos={[-0.12, 0, 0]} der size={11} col="#e2e8f0">
              {b.etq}
            </Letra>
            <Etiqueta pos={[b.v * escalaBarra + 0.12, 0, 0]} col={`${b.col}aa`} df={9} izq>
              +${num(b.v)} M
            </Etiqueta>
          </group>
        ))}
      </group>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 3a. MEDIA O MEDIANA
 * ════════════════════════════════════════════════════════════════════════ */

const PASO_CASA = 0.44;

function Torre({ x, alto, color, children }: { x: number; alto: number; color: string; children?: ReactNode }) {
  const mesh = useRef<THREE.Mesh>(null);
  const tope = useRef<THREE.Group>(null);
  const h = useSuave(alto, alto, 0.1);
  useFrame(() => {
    const y = Math.max(0.004, h.current);
    if (mesh.current) {
      mesh.current.scale.y = y;
      mesh.current.position.y = y / 2;
    }
    if (tope.current) tope.current.position.y = y;
  });
  return (
    <group position={[x, 0, 0]}>
      <mesh ref={mesh} castShadow>
        <boxGeometry args={[0.34, 1, 0.34]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <group ref={tope}>
        <mesh position={[0, 0.1, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[0.27, 0.2, 4]} />
          <meshStandardMaterial color="#b45309" roughness={0.6} />
        </mesh>
        {children}
      </group>
    </group>
  );
}

function Nivel({ y, color, ancho, children, lado }: { y: number; color: string; ancho: number; children: ReactNode; lado: "izq" | "der" }) {
  const ref = useRef<THREE.Group>(null);
  const v = useSuave(y, y, 0.1);
  useFrame(() => {
    if (ref.current) ref.current.position.y = v.current;
  });
  return (
    <group ref={ref}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ancho, 1.1]} />
        <meshBasicMaterial color={color} transparent opacity={0.18} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <Line
        points={[
          [-ancho / 2, 0, 0.55],
          [ancho / 2, 0, 0.55],
        ]}
        color={color}
        lineWidth={2.5}
      />
      {lado === "der" ? (
        <Etiqueta pos={[ancho / 2 + 0.15, 0, 0.55]} col={`${color}aa`} df={11} izq>
          {children}
        </Etiqueta>
      ) : (
        <Letra pos={[-ancho / 2 - 0.15, 0, 0.55]} der size={13} col={color} df={11}>
          {children}
        </Letra>
      )}
    </group>
  );
}

function EscenaMediana({ ricoMayor, modoColor, accent }: { ricoMayor: number; modoColor: string; accent: string }) {
  const hs = hogares(ricoMayor);
  const m = media(hs);
  const md = mediana(hs);
  const ancho = hs.length * PASO_CASA;
  const esc = (v: number) => v / PESOS_POR_UNIDAD;
  return (
    <group position={[0, -2.4, 0]}>
      <Piso w={ancho + 1.2} d={1.8} />
      {hs.map((v, i) => {
        const rico = i >= hs.length - 2;
        const color = rico ? "#fbbf24" : v < m ? "#64748b" : "#e2e8f0";
        return (
          <Torre key={i} x={-ancho / 2 + (i + 0.5) * PASO_CASA} alto={esc(v)} color={color}>
            {rico && (
              <Etiqueta pos={[0, 0.5, 0]} col="#fbbf24aa" df={11}>
                ${num(v)}
              </Etiqueta>
            )}
          </Torre>
        );
      })}
      <Nivel y={esc(m)} color={accent} ancho={ancho + 0.4} lado="der">
        Media ${num(m)}
      </Nivel>
      <Nivel y={esc(md)} color={modoColor} ancho={ancho + 0.4} lado="izq">
        Mediana ${num(md)}
      </Nivel>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 3b. MARGEN DE ERROR
 * ════════════════════════════════════════════════════════════════════════ */

const PX = 0.42;
const xPct = (p: number) => (p - 34) * PX;

function Intervalo({ centro, me, y, color }: { centro: number; me: number; y: number; color: string }) {
  const barra = useRef<THREE.Mesh>(null);
  const tapas = useRef<THREE.Group>(null);
  const v = useSuave(me, me, 0.1);
  useFrame(() => {
    const w = 2 * v.current * PX;
    if (barra.current) barra.current.scale.x = Math.max(0.01, w);
    if (tapas.current) {
      const [izq, der] = tapas.current.children;
      if (izq) izq.position.x = -w / 2;
      if (der) der.position.x = w / 2;
    }
  });
  return (
    <group position={[xPct(centro), y, 0]}>
      <mesh ref={barra}>
        <boxGeometry args={[1, 0.22, 0.22]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} transparent opacity={0.75} />
      </mesh>
      <group ref={tapas}>
        <mesh>
          <boxGeometry args={[0.05, 0.5, 0.05]} />
          <meshStandardMaterial color="#fff" />
        </mesh>
        <mesh>
          <boxGeometry args={[0.05, 0.5, 0.05]} />
          <meshStandardMaterial color="#fff" />
        </mesh>
      </group>
      <mesh>
        <sphereGeometry args={[0.17, 24, 16]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function Solape({ me }: { me: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const v = useSuave(me, me, 0.1);
  useFrame(() => {
    const lo = ENCUESTA.a - v.current;
    const hi = ENCUESTA.b + v.current;
    const m = ref.current;
    if (!m) return;
    m.visible = hi > lo;
    m.scale.x = Math.max(0.001, (hi - lo) * PX);
    m.position.x = xPct((lo + hi) / 2);
  });
  return (
    <mesh ref={ref} position={[0, 0.55, -0.05]}>
      <boxGeometry args={[1, 1.9, 0.1]} />
      <meshBasicMaterial color={BAJA} transparent opacity={0.22} depthWrite={false} />
    </mesh>
  );
}

function EscenaMargen({ n, modoColor }: { n: number; modoColor: string }) {
  const me = margenPuntos(n);
  const empate = ENCUESTA.a - me <= ENCUESTA.b + me;
  const marcas = Array.from({ length: 21 }, (_, i) => 24 + i);
  return (
    <group position={[0, -0.9, 0]}>
      <mesh position={[0, -0.55, 0]} receiveShadow>
        <boxGeometry args={[21 * PX + 0.4, 0.08, 1.4]} />
        <meshStandardMaterial color="#111c2e" />
      </mesh>
      {marcas.map((p) => (
        <group key={p}>
          <Line
            points={[
              [xPct(p), -0.5, 0.5],
              [xPct(p), -0.5, p % 5 === 0 ? 0.72 : 0.6],
            ]}
            color="#64748b"
            lineWidth={1.2}
          />
          {p % 5 === 0 && (
            <Letra pos={[xPct(p), -0.85, 0.7]} size={11}>
              {p} %
            </Letra>
          )}
        </group>
      ))}
      <Solape me={me} />
      <Intervalo centro={ENCUESTA.a} me={me} y={1.1} color="#f472b6" />
      <Intervalo centro={ENCUESTA.b} me={me} y={0.05} color="#60a5fa" />
      <Etiqueta pos={[xPct(ENCUESTA.a) + me * PX + 0.3, 1.1, 0]} col="#f472b6aa" df={10} izq>
        A: {ENCUESTA.a} % ± {num(me, 1)}
      </Etiqueta>
      <Etiqueta pos={[xPct(ENCUESTA.b) - me * PX - 0.3, 0.05, 0]} col="#60a5faaa" df={10} der>
        B: {ENCUESTA.b} % ± {num(me, 1)}
      </Etiqueta>
      <Etiqueta pos={[xPct((ENCUESTA.a + ENCUESTA.b) / 2), 2.05, 0]} col={empate ? `${BAJA}aa` : `${SUBE}aa`} df={10}>
        <i className={`fa-solid ${empate ? "fa-equals" : "fa-not-equal"}`} style={{ color: empate ? BAJA : SUBE }} />
        {empate ? "Los intervalos se tocan: empate técnico" : "Los intervalos ya no se tocan"}
      </Etiqueta>
      <Letra pos={[0, -1.2, 0.7]} size={12} col={modoColor} df={9}>
        Encuesta de {num(n)} personas · margen de error al 95 %
      </Letra>
    </group>
  );
}

/* ── Escena ───────────────────────────────────────────────────────────── */

const CAMARAS: Record<Vista, { pos: Pt; target: Pt }> = {
  truncado: { pos: [2.2, 1.6, 8.2], target: [0, 0, 0] },
  volumen: { pos: [3.4, 2.8, 8.2], target: [0, -0.2, 0] },
  log: { pos: [0, 0.4, 9.6], target: [0, 0, 0] },
  puntos: { pos: [0.4, 1.8, 9.4], target: [0, -0.1, 0] },
  riesgo: { pos: [0, 5.4, 5.2], target: [0, -0.6, 0] },
  bases: { pos: [2.6, 3.4, 8.2], target: [0, -0.2, 0] },
  mediana: { pos: [0, 1.9, 12], target: [0, 0.4, 0] },
  margen: { pos: [0, 1.2, 9], target: [0, 0, 0] },
};

export default function EstadisticaEnganosaScene(p: EnganosaSceneProps) {
  const { vista, modoColor, accent, resetNonce } = p;
  const cam = CAMARAS[vista];

  let contenido: ReactNode = null;
  if (vista === "truncado") contenido = <EscenaTruncado caso={p.casoBarras} ejeMin={p.ejeMin} modoColor={modoColor} />;
  else if (vista === "volumen") contenido = <EscenaVolumen key={p.casoVolumen.id} caso={p.casoVolumen} escalado={p.escalado} modoColor={modoColor} />;
  else if (vista === "log") contenido = <EscenaLog log={p.log} modoColor={modoColor} />;
  else if (vista === "puntos") contenido = <EscenaPuntos caso={p.casoPuntos} modoColor={modoColor} />;
  else if (vista === "riesgo") contenido = <EscenaRiesgo caso={p.casoRiesgo} modoColor={modoColor} />;
  else if (vista === "bases") contenido = <EscenaBases pctSeguridad={p.pctSeguridad} />;
  else if (vista === "mediana") contenido = <EscenaMediana ricoMayor={p.ricoMayor} modoColor={modoColor} accent={accent} />;
  else contenido = <EscenaMargen n={p.nEncuesta} modoColor={modoColor} />;

  return (
    <Canvas key={`${vista}-${resetNonce}`} shadows dpr={[1, 1.75]} camera={{ position: cam.pos, fov: 42 }} gl={{ antialias: true }}>
      <color attach="background" args={["#040a16"]} />
      <fog attach="fog" args={["#040a16", 18, 40]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 9, 6]} intensity={1.1} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-6, 2, 5]} intensity={0.4} color={modoColor} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.5} position={[0, 5, -6]} scale={[10, 6, 1]} color="#93c5fd" />
        <Lightformer form="rect" intensity={0.8} position={[-6, 0, 4]} scale={[6, 6, 1]} color={modoColor} />
      </Environment>

      {contenido}

      <OrbitControls makeDefault enablePan={false} enableZoom minDistance={4} maxDistance={20} maxPolarAngle={Math.PI * 0.49} minPolarAngle={Math.PI * 0.05} target={cam.target} />
      <EffectComposer>
        <Bloom intensity={0.3} luminanceThreshold={0.6} luminanceSmoothing={0.85} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.7} />
      </EffectComposer>
    </Canvas>
  );
}
