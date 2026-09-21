"use client";

/**
 * Escena 3D del laboratorio "People, clothes and weather" (IN-I-P06).
 * Tres vistas, un mismo sistema de clima (cielo, nubes, lluvia, nieve, niebla
 * y viento) y las mismas figuras de personas:
 *
 *  - clima: la plaza de la colonia con su kiosco, papel picado, árboles y un
 *    termómetro de calle; la gente que pasea se viste según el clima.
 *  - vestir: la banqueta frente a una casa. La persona espera bajo el toldo
 *    con la ropa elegida y, al revisar, sale al pronóstico: tiembla, suda o se
 *    moja, y lo dice en inglés.
 *  - quien: la parada del camión con seis personas distintas; se tocan para
 *    identificarlas.
 *
 * Toda animación ocurre en useFrame mutando refs y avanza por tiempo. NO se
 * usa <Text> de drei (cuelga el chunk con Turbopack): el texto va en <Html>.
 */

import * as THREE from "three";
import { useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  type Condicion,
  type PrendaId,
  type Problema,
  type Atuendo,
  type Persona,
  PRENDA_DEF,
  COLOR_HEX,
  PELO_HEX,
  PERSONAS,
  PRONOSTICOS,
  T_MIN,
  T_MAX,
  aFahrenheit,
  signo,
  persona as personaPorId,
} from "./clima-vestimenta-ingles-data";

export type VistaClima = "clima" | "vestir" | "quien";

export interface ClimaVestimentaSceneProps {
  vista: VistaClima;
  modoColor: string;
  resetNonce: number;
  // Clima
  condicion: Condicion;
  tempC: number;
  // Vestir
  pronosticoId: string;
  atuendo: Atuendo;
  revisado: boolean;
  okAtuendo: boolean;
  problema: Problema;
  // Quién
  orden: string[];
  seleccion: string | null;
  seleccionOk: boolean | null;
  describir: string | null;
  onElegirPersona: (id: string) => void;
}

type Pt = [number, number, number];

const suave = (dt: number, porCuadro: number) => 1 - Math.pow(1 - porCuadro, Math.min(dt, 0.25) * 60);
const OK = "#34d399";
const NO = "#fb923c";

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

function Burbuja({ pos, texto, col }: { pos: Pt; texto: string; col: string }) {
  return (
    <Html position={pos} center distanceFactor={7} zIndexRange={[22, 0]} style={{ pointerEvents: "none" }}>
      <div style={{ position: "relative", padding: "8px 14px", borderRadius: 14, background: "#fff", color: "#0f172a", fontSize: 15, fontWeight: 900, whiteSpace: "nowrap", border: `3px solid ${col}`, boxShadow: "0 10px 24px -10px #000", fontFamily: "ui-rounded, system-ui, sans-serif" }}>
        {texto}
        <div style={{ position: "absolute", left: "50%", bottom: -9, width: 14, height: 14, marginLeft: -7, background: "#fff", borderRight: `3px solid ${col}`, borderBottom: `3px solid ${col}`, transform: "rotate(45deg)" }} />
      </div>
    </Html>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Geometrías compartidas
 * ════════════════════════════════════════════════════════════════════════ */

const G = {
  esfera: new THREE.SphereGeometry(1, 20, 14),
  esferaB: new THREE.SphereGeometry(1, 10, 8),
  caja: new THREE.BoxGeometry(1, 1, 1),
  cil: new THREE.CylinderGeometry(1, 1, 1, 18),
  pierna: new THREE.CapsuleGeometry(0.075, 0.62, 5, 12),
  piernaAncha: new THREE.CapsuleGeometry(0.092, 0.62, 5, 12),
  muslo: new THREE.CapsuleGeometry(0.088, 0.18, 5, 12),
  musloAncho: new THREE.CapsuleGeometry(0.104, 0.18, 5, 12),
  brazo: new THREE.CapsuleGeometry(0.05, 0.46, 5, 10),
  brazoAncho: new THREE.CapsuleGeometry(0.064, 0.46, 5, 10),
  manga: new THREE.CapsuleGeometry(0.064, 0.1, 5, 10),
  mangaAncha: new THREE.CapsuleGeometry(0.078, 0.1, 5, 10),
  torso: new THREE.CapsuleGeometry(0.17, 0.34, 6, 16),
  torsoAncho: new THREE.CapsuleGeometry(0.225, 0.3, 6, 16),
  gorro: new THREE.SphereGeometry(0.142, 22, 12, 0, Math.PI * 2, 0, Math.PI * 0.56),
  gorra: new THREE.SphereGeometry(0.146, 22, 10, 0, Math.PI * 2, 0, Math.PI * 0.4),
  falda: new THREE.CylinderGeometry(0.19, 0.3, 0.44, 22, 1, true),
  faldaAncha: new THREE.CylinderGeometry(0.24, 0.36, 0.44, 22, 1, true),
  faldon: new THREE.CylinderGeometry(0.2, 0.25, 0.5, 22, 1, true),
  faldonAncho: new THREE.CylinderGeometry(0.25, 0.3, 0.5, 22, 1, true),
  aro: new THREE.TorusGeometry(0.032, 0.0065, 8, 20),
  bufanda: new THREE.TorusGeometry(0.085, 0.036, 10, 22),
  rueda: new THREE.TorusGeometry(0.3, 0.025, 10, 36),
  ruedita: new THREE.TorusGeometry(0.055, 0.022, 8, 16),
  paraguas: new THREE.ConeGeometry(0.62, 0.3, 16, 1, true),
  gota: new THREE.BoxGeometry(0.014, 0.32, 0.014),
  copo: new THREE.SphereGeometry(0.035, 6, 5),
  hoja: new THREE.PlaneGeometry(0.12, 0.08),
  bandera: new THREE.PlaneGeometry(0.26, 0.22),
  nube: new THREE.SphereGeometry(1, 16, 12),
  copa: new THREE.IcosahedronGeometry(1, 1),
};

/** Puntos de un rizo repartidos en la parte alta y trasera de la cabeza. */
const RIZOS_CORTOS: Pt[] = (() => {
  const out: Pt[] = [];
  const n = 60;
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const a = i * 2.39996;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    // Arriba y atrás; por delante solo sobre la frente, para no tapar los ojos.
    if ((y > 0.05 && (z < 0.45 || y > 0.55)) || (z < -0.2 && y > -0.45)) out.push([x * 0.14, y * 0.14 + 0.012, z * 0.14 - 0.008]);
  }
  return out;
})();
const RIZOS_LARGOS: Pt[] = (() => {
  const out: Pt[] = [];
  for (let fila = 0; fila < 6; fila++) {
    const y = -0.04 - fila * 0.07;
    const n = 7;
    for (let k = 0; k < n; k++) {
      const a = Math.PI * (0.08 + (0.84 * k) / (n - 1));
      const r = 0.15 + fila * 0.012;
      out.push([-Math.cos(a) * r, y, -Math.sin(a) * r * 0.85 + 0.01]);
    }
  }
  return out;
})();
const ONDAS: Pt[] = [
  [-0.09, 0.09, 0.07],
  [-0.03, 0.12, 0.08],
  [0.04, 0.12, 0.075],
  [0.1, 0.08, 0.06],
  [-0.11, 0.05, -0.02],
  [0.12, 0.04, -0.03],
  [0, 0.14, -0.02],
];

/* ════════════════════════════════════════════════════════════════════════
 * Figura de persona
 * ════════════════════════════════════════════════════════════════════════ */

type Rasgos = Pick<Persona, "altura" | "complexion" | "largo" | "tipo" | "colorPelo" | "piel" | "lentes" | "barba" | "silla">;
interface PiezaHex {
  id: PrendaId;
  hex: string;
}

const BASE_ARRIBA = "#cbd5e1";
const BASE_ABAJO = "#94a3b8";

function Mat({ c, r = 0.62, m = 0, side }: { c: string; r?: number; m?: number; side?: THREE.Side }) {
  return <meshStandardMaterial color={c} roughness={r} metalness={m} side={side} />;
}

function Pelo({ p, gorra }: { p: Rasgos; gorra: boolean }) {
  const col = PELO_HEX[p.colorPelo];
  return (
    <group>
      <mesh geometry={G.gorro} rotation={[-0.42, 0, 0]} position={[0, 0.012, -0.01]} castShadow>
        <Mat c={col} r={0.85} />
      </mesh>
      {p.tipo === "curly" &&
        RIZOS_CORTOS.filter((q) => !gorra || q[1] < 0.03).map((q, i) => (
          <mesh key={`c${i}`} geometry={G.esferaB} position={q} scale={0.04}>
            <Mat c={col} r={0.9} />
          </mesh>
        ))}
      {p.tipo === "curly" &&
        p.largo === "long" &&
        RIZOS_LARGOS.map((q, i) => (
          <mesh key={`l${i}`} geometry={G.esferaB} position={q} scale={0.05}>
            <Mat c={col} r={0.9} />
          </mesh>
        ))}
      {p.tipo === "wavy" &&
        !gorra &&
        ONDAS.map((q, i) => (
          <mesh key={`o${i}`} geometry={G.esferaB} position={q} scale={[0.058, 0.03, 0.05]} rotation={[0, i * 0.7, 0.3]}>
            <Mat c={col} r={0.85} />
          </mesh>
        ))}
      {p.tipo === "wavy" &&
        p.largo === "long" &&
        [0, 1, 2, 3, 4].map((k) => (
          <mesh key={`w${k}`} geometry={G.esferaB} position={[k % 2 === 0 ? 0.02 : -0.02, -0.05 - k * 0.07, -0.1]} scale={[0.15, 0.05, 0.05]}>
            <Mat c={col} r={0.85} />
          </mesh>
        ))}
      {p.tipo === "straight" && p.largo === "long" && (
        <>
          <mesh geometry={G.caja} position={[0, -0.17, -0.095]} scale={[0.27, 0.36, 0.06]} castShadow>
            <Mat c={col} r={0.8} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} geometry={G.caja} position={[s * 0.125, -0.1, -0.02]} scale={[0.04, 0.26, 0.1]}>
              <Mat c={col} r={0.8} />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}

function Figura({ p, ropa, andar = false, fase = 0 }: { p: Rasgos; ropa: PiezaHex[]; andar?: boolean; fase?: number }) {
  const ancho = p.complexion === "heavyset";
  const esc = p.silla ? 1 : p.altura === "tall" ? 1.1 : p.altura === "short" ? 0.88 : 1;
  const w = ancho ? 1.28 : 1;
  const de = (r: "top" | "bottom" | "shoes") => ropa.find((x) => PRENDA_DEF[x.id].ranura === r) ?? null;
  const tiene = (id: PrendaId) => ropa.find((x) => x.id === id) ?? null;
  const top = de("top");
  const bottom = de("bottom");
  const shoes = de("shoes");
  const colTop = top?.hex ?? BASE_ARRIBA;
  const colBottom = bottom?.hex ?? BASE_ABAJO;
  const guantes = tiene("gloves");
  const colMano = guantes?.hex ?? p.piel;
  const piernaDesnuda = bottom?.id === "shorts" || bottom?.id === "skirt";
  const mangaCorta = top?.id === "tshirt";
  const largo = top?.id === "coat" || top?.id === "raincoat";
  const raiz = useRef<THREE.Group>(null);
  const conParaguas = !!tiene("umbrella");
  useFrame(({ clock }) => {
    const g = raiz.current;
    if (!g) return;
    const t = clock.elapsedTime + fase;
    const paso = andar ? Math.sin(t * 5.2) * 0.45 : 0;
    const pecho = g.getObjectByName("pecho");
    if (pecho) pecho.position.y = Math.sin(t * 1.8) * 0.004 + (andar ? Math.abs(Math.sin(t * 5.2)) * 0.02 : 0);
    if (!andar || p.silla) return;
    const pi = g.getObjectByName("pierna-1");
    const pd = g.getObjectByName("pierna1");
    const bi = g.getObjectByName("brazo-1");
    const bd = g.getObjectByName("brazo1");
    if (pi) pi.rotation.x = paso;
    if (pd) pd.rotation.x = -paso;
    if (bi) bi.rotation.x = -paso * 0.7;
    if (bd && !conParaguas) bd.rotation.x = paso * 0.7;
  });

  const dy = p.silla ? -0.34 : 0;
  const hombroX = 0.17 * w + 0.075;
  const calzado = (lado: number) => {
    const x = lado * 0.095 * w;
    if (!shoes)
      return (
        <mesh geometry={G.caja} position={[x, 0.03, 0.03]} scale={[0.1, 0.06, 0.2]}>
          <Mat c={BASE_ABAJO} />
        </mesh>
      );
    if (shoes.id === "boots")
      return (
        <>
          <mesh geometry={G.cil} position={[x, 0.15, 0]} scale={[0.082, 0.3, 0.082]} castShadow>
            <Mat c={shoes.hex} r={0.5} />
          </mesh>
          <mesh geometry={G.caja} position={[x, 0.04, 0.05]} scale={[0.11, 0.08, 0.22]}>
            <Mat c={shoes.hex} r={0.5} />
          </mesh>
        </>
      );
    if (shoes.id === "sandals")
      return (
        <>
          <mesh geometry={G.caja} position={[x, 0.012, 0.03]} scale={[0.1, 0.024, 0.21]}>
            <Mat c={shoes.hex} r={0.7} />
          </mesh>
          <mesh geometry={G.caja} position={[x, 0.045, 0.03]} scale={[0.08, 0.045, 0.17]}>
            <Mat c={p.piel} />
          </mesh>
          <mesh geometry={G.caja} position={[x, 0.07, 0.06]} scale={[0.09, 0.015, 0.03]}>
            <Mat c={shoes.hex} r={0.7} />
          </mesh>
        </>
      );
    return (
      <>
        <mesh geometry={G.caja} position={[x, 0.045, 0.04]} scale={[0.11, 0.07, 0.22]} castShadow>
          <Mat c={shoes.hex} r={0.55} />
        </mesh>
        <mesh geometry={G.caja} position={[x, 0.008, 0.04]} scale={[0.115, 0.018, 0.225]}>
          <Mat c="#f8fafc" />
        </mesh>
      </>
    );
  };

  const pierna = (lado: number) => {
    const x = lado * 0.095 * w;
    if (p.silla) {
      return (
        <group key={lado}>
          <mesh geometry={ancho ? G.piernaAncha : G.pierna} position={[x, 0.56, 0.2]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.52, 1]}>
            <Mat c={piernaDesnuda ? p.piel : colBottom} />
          </mesh>
          <mesh geometry={ancho ? G.piernaAncha : G.pierna} position={[x, 0.3, 0.42]} scale={[1, 0.5, 1]}>
            <Mat c={piernaDesnuda && bottom?.id !== "skirt" ? p.piel : colBottom} />
          </mesh>
          <group position={[0, 0, 0.4]}>{calzado(lado)}</group>
        </group>
      );
    }
    return (
      <group key={lado} name={`pierna${lado}`} position={[0, 0.88, 0]}>
        <mesh geometry={ancho ? G.piernaAncha : G.pierna} position={[x, -0.42, 0]} castShadow>
          <Mat c={piernaDesnuda ? p.piel : colBottom} />
        </mesh>
        {bottom?.id === "shorts" && (
          <mesh geometry={ancho ? G.musloAncho : G.muslo} position={[x, -0.1, 0]} castShadow>
            <Mat c={colBottom} />
          </mesh>
        )}
        <group position={[0, -0.88, 0]}>{calzado(lado)}</group>
      </group>
    );
  };

  const brazo = (lado: number) => {
    const paraguas = lado === 1 && tiene("umbrella");
    return (
      <group name={`brazo${lado}`} position={[lado * hombroX, 1.38 + dy, 0]} rotation={paraguas ? [-1.2, 0, lado * 0.25] : p.silla ? [-0.75, 0, lado * 0.18] : [0, 0, lado * 0.1]}>
        <mesh geometry={ancho ? G.brazoAncho : G.brazo} position={[0, -0.28, 0]} castShadow>
          <Mat c={mangaCorta ? p.piel : colTop} />
        </mesh>
        {mangaCorta && (
          <mesh geometry={ancho ? G.mangaAncha : G.manga} position={[0, -0.09, 0]}>
            <Mat c={colTop} />
          </mesh>
        )}
        <mesh geometry={G.esfera} position={[0, -0.56, 0]} scale={guantes ? 0.064 : 0.054}>
          <Mat c={colMano} />
        </mesh>
        {paraguas && (
          <group position={[0, -0.58, 0]} rotation={[1.2, 0, -0.25]}>
            <mesh geometry={G.cil} position={[0, 0.5, 0]} scale={[0.012, 1.05, 0.012]}>
              <Mat c="#334155" m={0.6} r={0.3} />
            </mesh>
            <mesh geometry={G.paraguas} position={[0, 1.08, 0]} castShadow>
              <Mat c={tiene("umbrella")!.hex} r={0.45} side={THREE.DoubleSide} />
            </mesh>
            <mesh geometry={G.esferaB} position={[0, 1.25, 0]} scale={0.025}>
              <Mat c="#334155" />
            </mesh>
          </group>
        )}
      </group>
    );
  };

  const cab = 1.6 + dy;
  return (
    <group ref={raiz} scale={esc}>
      {p.silla && <Silla />}
      {pierna(-1)}
      {pierna(1)}
      <group name="pecho">
        {/* Cadera y parte baja */}
        {bottom?.id === "skirt" ? (
          <mesh geometry={ancho ? G.faldaAncha : G.falda} position={[0, 0.74 + (p.silla ? -0.2 : 0), 0]} castShadow>
            <Mat c={colBottom} side={THREE.DoubleSide} />
          </mesh>
        ) : (
          <mesh geometry={G.caja} position={[0, 0.9 + dy * 0.97, 0]} scale={[0.36 * w, 0.16, 0.22 * w]} castShadow>
            <Mat c={colBottom} />
          </mesh>
        )}
        {/* Torso */}
        <mesh geometry={ancho ? G.torsoAncho : G.torso} position={[0, 1.14 + dy, 0]} scale={[1, 1, 0.78]} castShadow>
          <Mat c={colTop} r={top?.id === "raincoat" ? 0.3 : 0.65} />
        </mesh>
        {largo && !p.silla && (
          <mesh geometry={ancho ? G.faldonAncho : G.faldon} position={[0, 0.7, 0]} scale={[1, 1, 0.82]} castShadow>
            <Mat c={colTop} r={top?.id === "raincoat" ? 0.3 : 0.65} side={THREE.DoubleSide} />
          </mesh>
        )}
        {(top?.id === "jacket" || top?.id === "coat" || top?.id === "raincoat") && (
          <mesh geometry={G.caja} position={[0, 1.08 + dy, 0.17 * w * 0.78 + 0.012]} scale={[0.018, 0.46, 0.01]}>
            <Mat c="#1f2937" />
          </mesh>
        )}
        {top?.id === "raincoat" && (
          <mesh geometry={G.esfera} position={[0, 1.42 + dy, -0.14]} scale={[0.15, 0.1, 0.07]}>
            <Mat c={colTop} r={0.3} />
          </mesh>
        )}
        {top?.id === "sweater" && (
          <mesh geometry={G.cil} position={[0, 0.9 + dy, 0]} scale={[0.176 * (ancho ? 1.3 : 1), 0.05, 0.14 * (ancho ? 1.3 : 1)]}>
            <Mat c={colTop} r={0.95} />
          </mesh>
        )}
        {brazo(-1)}
        {brazo(1)}
        {/* Cuello y cabeza */}
        <mesh geometry={G.cil} position={[0, 1.47 + dy, 0]} scale={[0.05, 0.1, 0.05]}>
          <Mat c={p.piel} />
        </mesh>
        <group position={[0, cab, 0]}>
          <mesh geometry={G.esfera} scale={0.13} castShadow>
            <Mat c={p.piel} r={0.55} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} geometry={G.esferaB} position={[s * 0.045, 0.015, 0.118]} scale={0.017}>
              <meshStandardMaterial color="#0b0f14" roughness={0.3} />
            </mesh>
          ))}
          <mesh geometry={G.esferaB} position={[0, -0.012, 0.13]} scale={0.02}>
            <Mat c={p.piel} r={0.5} />
          </mesh>
          <mesh geometry={G.caja} position={[0, -0.058, 0.118]} scale={[0.05, 0.008, 0.01]}>
            <meshStandardMaterial color="#7c2d12" />
          </mesh>
          <Pelo p={p} gorra={!!tiene("cap")} />
          {p.barba && (
            <>
              <mesh geometry={G.esfera} position={[0, -0.088, 0.06]} scale={[0.092, 0.058, 0.075]}>
                <Mat c={PELO_HEX[p.colorPelo]} r={0.9} />
              </mesh>
              <mesh geometry={G.caja} position={[0, -0.04, 0.124]} scale={[0.06, 0.012, 0.018]}>
                <Mat c={PELO_HEX[p.colorPelo]} r={0.9} />
              </mesh>
            </>
          )}
          {p.lentes && (
            <group position={[0, 0.015, 0.132]}>
              {[-1, 1].map((s) => (
                <mesh key={s} geometry={G.aro} position={[s * 0.047, 0, 0]}>
                  <meshStandardMaterial color="#111827" metalness={0.4} roughness={0.3} />
                </mesh>
              ))}
              <mesh geometry={G.caja} scale={[0.03, 0.006, 0.006]}>
                <meshStandardMaterial color="#111827" />
              </mesh>
            </group>
          )}
          {tiene("sunglasses") && (
            <group position={[0, 0.015, 0.135]}>
              {[-1, 1].map((s) => (
                <mesh key={s} geometry={G.caja} position={[s * 0.047, 0, 0]} scale={[0.066, 0.042, 0.012]}>
                  <meshStandardMaterial color="#020617" metalness={0.6} roughness={0.15} />
                </mesh>
              ))}
              <mesh geometry={G.caja} scale={[0.04, 0.008, 0.008]}>
                <meshStandardMaterial color="#020617" />
              </mesh>
            </group>
          )}
          {tiene("cap") && (
            <>
              <mesh geometry={G.gorra} position={[0, 0.045, -0.005]} rotation={[-0.2, 0, 0]} scale={[1, 0.85, 1]} castShadow>
                <Mat c={tiene("cap")!.hex} r={0.7} />
              </mesh>
              <mesh geometry={G.caja} position={[0, 0.05, 0.16]} rotation={[0.15, 0, 0]} scale={[0.17, 0.014, 0.13]}>
                <Mat c={tiene("cap")!.hex} r={0.7} />
              </mesh>
            </>
          )}
        </group>
        {tiene("scarf") && (
          <>
            <mesh geometry={G.bufanda} position={[0, 1.46 + dy, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1.05 * (ancho ? 1.15 : 1), 1, 1]}>
              <Mat c={tiene("scarf")!.hex} r={0.95} />
            </mesh>
            <mesh geometry={G.caja} position={[0.07, 1.3 + dy, 0.16 * w]} rotation={[0.15, 0, 0.08]} scale={[0.07, 0.24, 0.03]}>
              <Mat c={tiene("scarf")!.hex} r={0.95} />
            </mesh>
          </>
        )}
      </group>
    </group>
  );
}

function Silla() {
  return (
    <group>
      <mesh geometry={G.caja} position={[0, 0.5, 0.05]} scale={[0.46, 0.05, 0.44]} castShadow>
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </mesh>
      <mesh geometry={G.caja} position={[0, 0.82, -0.2]} rotation={[-0.1, 0, 0]} scale={[0.44, 0.52, 0.04]} castShadow>
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh geometry={G.rueda} position={[s * 0.29, 0.31, -0.02]} rotation={[0, Math.PI / 2, 0]} castShadow>
            <meshStandardMaterial color="#0f172a" roughness={0.5} />
          </mesh>
          <mesh geometry={G.rueda} position={[s * 0.31, 0.31, -0.02]} rotation={[0, Math.PI / 2, 0]} scale={0.84}>
            <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.25} />
          </mesh>
          <mesh geometry={G.cil} position={[s * 0.29, 0.31, -0.02]} rotation={[0, 0, Math.PI / 2]} scale={[0.03, 0.06, 0.03]}>
            <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh geometry={G.ruedita} position={[s * 0.2, 0.06, 0.34]} rotation={[0, Math.PI / 2, 0]}>
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh geometry={G.cil} position={[s * 0.2, 0.28, 0.3]} scale={[0.012, 0.44, 0.012]}>
            <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh geometry={G.caja} position={[s * 0.25, 0.68, 0.02]} scale={[0.04, 0.03, 0.34]}>
            <meshStandardMaterial color="#334155" />
          </mesh>
          <mesh geometry={G.cil} position={[s * 0.2, 1.08, -0.28]} rotation={[Math.PI / 2, 0, 0]} scale={[0.018, 0.14, 0.018]}>
            <meshStandardMaterial color="#111827" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

const piezas = (p: Persona): PiezaHex[] => p.ropa.map((r) => ({ id: r.id, hex: COLOR_HEX[r.color] }));

/* ════════════════════════════════════════════════════════════════════════
 * Sistema de clima
 * ════════════════════════════════════════════════════════════════════════ */

const CIELO: Record<Condicion, { bg: string; amb: number; sol: number; nubes: number; nubeCol: string; lluvia: number; nieve: number; viento: number; niebla: [number, number]; disco: number }> = {
  sunny: { bg: "#62a8dc", amb: 0.7, sol: 2.0, nubes: 2, nubeCol: "#ffffff", lluvia: 0, nieve: 0, viento: 0.12, niebla: [34, 90], disco: 1 },
  cloudy: { bg: "#8795a2", amb: 0.85, sol: 0.55, nubes: 9, nubeCol: "#d7dde3", lluvia: 0, nieve: 0, viento: 0.22, niebla: [26, 75], disco: 0 },
  rainy: { bg: "#4f5b67", amb: 0.62, sol: 0.35, nubes: 10, nubeCol: "#76828d", lluvia: 1, nieve: 0, viento: 0.3, niebla: [16, 55], disco: 0 },
  windy: { bg: "#74a9d1", amb: 0.72, sol: 1.35, nubes: 5, nubeCol: "#f1f5f9", lluvia: 0, nieve: 0, viento: 1, niebla: [34, 90], disco: 0.75 },
  foggy: { bg: "#aab3ba", amb: 0.95, sol: 0.3, nubes: 0, nubeCol: "#e5e7eb", lluvia: 0, nieve: 0, viento: 0.04, niebla: [2, 15], disco: 0 },
  snowing: { bg: "#9aa7b3", amb: 0.9, sol: 0.45, nubes: 10, nubeCol: "#e2e8f0", lluvia: 0, nieve: 1, viento: 0.18, niebla: [13, 42], disco: 0 },
};

interface Area {
  /** Altura del piso donde caen los charcos y la nieve. */
  suelo: number;
  /** Si existe, más allá de esta z el piso baja a la calle (y = 0). */
  bordeZ?: number;
  cx: number;
  cz: number;
  w: number;
  d: number;
  h: number;
}

function Clima({ condicion, area, nGotas, nieblaEscala = 1 }: { condicion: Condicion; area: Area; nGotas: number; nieblaEscala?: number }) {
  const c = CIELO[condicion];
  const fondo = useRef<THREE.Color>(null);
  const niebla = useRef<THREE.Fog>(null);
  const amb = useRef<THREE.AmbientLight>(null);
  const sol = useRef<THREE.DirectionalLight>(null);
  const disco = useRef<THREE.Mesh>(null);
  const nubes = useRef<THREE.Group>(null);
  const gotas = useRef<THREE.InstancedMesh>(null);
  const copos = useRef<THREE.InstancedMesh>(null);
  const hojas = useRef<THREE.InstancedMesh>(null);
  const charcos = useRef<THREE.Group>(null);
  const nevado = useRef<THREE.Mesh>(null);
  const estado = useRef({ lluvia: c.lluvia, nieve: c.nieve, viento: c.viento, disco: c.disco, nubes: c.nubes });
  const obj = useMemo(() => new THREE.Object3D(), []);
  const destinoBg = useMemo(() => new THREE.Color(c.bg), [c.bg]);
  const destinoNube = useMemo(() => new THREE.Color(c.nubeCol), [c.nubeCol]);
  const matNube = useMemo(() => new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 1, transparent: true, opacity: 0.95 }), []);
  const primerCuadro = useRef(true);
  const semillas = useMemo(
    () =>
      Array.from({ length: nGotas }, (_, i) => ({
        x: ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1,
        z: ((Math.sin(i * 78.233) * 12543.123) % 1 + 1) % 1,
        f: ((i * 0.6180339) % 1 + 1) % 1,
      })),
    [nGotas],
  );
  const posNubes = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        x: -area.w * 0.7 + ((i * 0.37) % 1) * area.w * 1.4,
        y: area.h * 0.78 + ((i * 0.53) % 1) * 1.6,
        z: area.cz - area.d * 0.35 - ((i * 0.71) % 1) * area.d * 0.6,
        s: 0.8 + ((i * 0.29) % 1) * 0.7,
      })),
    [area.w, area.h, area.d, area.cz],
  );

  useFrame(({ clock }, dt) => {
    const e = estado.current;
    const k = suave(dt, 0.04);
    e.lluvia += (c.lluvia - e.lluvia) * k;
    e.nieve += (c.nieve - e.nieve) * k;
    e.viento += (c.viento - e.viento) * k;
    e.disco += (c.disco - e.disco) * k;
    e.nubes += (c.nubes - e.nubes) * k;
    if (fondo.current) fondo.current.lerp(destinoBg, k);
    if (niebla.current) {
      niebla.current.color.lerp(destinoBg, k);
      niebla.current.near += (c.niebla[0] * nieblaEscala - niebla.current.near) * k;
      niebla.current.far += (c.niebla[1] * nieblaEscala - niebla.current.far) * k;
    }
    if (amb.current) amb.current.intensity += (c.amb - amb.current.intensity) * k;
    if (sol.current) sol.current.intensity += (c.sol - sol.current.intensity) * k;
    matNube.color.lerp(destinoNube, primerCuadro.current ? 1 : k);
    primerCuadro.current = false;
    if (disco.current) {
      disco.current.scale.setScalar(Math.max(0.001, e.disco) * 1.3);
      disco.current.visible = e.disco > 0.02;
    }
    const t = clock.elapsedTime;
    if (nubes.current)
      nubes.current.children.forEach((g, i) => {
        const p = posNubes[i]!;
        const vis = Math.min(1, Math.max(0, e.nubes - i));
        g.scale.setScalar(Math.max(0.001, vis * p.s));
        const ancho = area.w * 1.6;
        const x = ((((p.x + t * (0.15 + e.viento * 1.4) + ancho / 2) % ancho) + ancho) % ancho) - ancho / 2;
        g.position.set(area.cx + x, p.y, p.z);
      });
    const g = gotas.current;
    if (g) {
      g.visible = e.lluvia > 0.02;
      if (g.visible) {
        semillas.forEach((s, i) => {
          const y = area.h - ((t * 9 + s.f * area.h) % area.h);
          obj.position.set(area.cx + (s.x - 0.5) * area.w + (area.h - y) * e.viento * 0.25, y, area.cz + (s.z - 0.5) * area.d);
          obj.rotation.set(0, 0, -e.viento * 0.25);
          obj.scale.setScalar(i / semillas.length < e.lluvia ? 1 : 0.0001);
          obj.updateMatrix();
          g.setMatrixAt(i, obj.matrix);
        });
        g.instanceMatrix.needsUpdate = true;
      }
    }
    const cp = copos.current;
    if (cp) {
      cp.visible = e.nieve > 0.02;
      if (cp.visible) {
        semillas.forEach((s, i) => {
          const y = area.h - ((t * 0.9 + s.f * area.h) % area.h);
          obj.position.set(area.cx + (s.x - 0.5) * area.w + Math.sin(t * 0.8 + i) * 0.25, y, area.cz + (s.z - 0.5) * area.d + Math.cos(t * 0.6 + i * 0.3) * 0.2);
          obj.rotation.set(0, 0, 0);
          obj.scale.setScalar(i / semillas.length < e.nieve * 0.7 ? 1 : 0.0001);
          obj.updateMatrix();
          cp.setMatrixAt(i, obj.matrix);
        });
        cp.instanceMatrix.needsUpdate = true;
      }
    }
    const hj = hojas.current;
    if (hj) {
      const fuerza = Math.max(0, (e.viento - 0.4) / 0.6);
      hj.visible = fuerza > 0.02;
      if (hj.visible) {
        for (let i = 0; i < 46; i++) {
          const s = semillas[i % semillas.length]!;
          const ancho = area.w * 1.2;
          const x = ((t * 3.2 + s.x * ancho) % ancho) - ancho / 2;
          obj.position.set(area.cx + x, 0.3 + s.f * 3 + Math.sin(t * 3 + i) * 0.4, area.cz + (s.z - 0.5) * area.d * 0.8);
          obj.rotation.set(t * 4 + i, t * 3 + i * 2, t * 2);
          obj.scale.setScalar(fuerza);
          obj.updateMatrix();
          hj.setMatrixAt(i, obj.matrix);
        }
        hj.instanceMatrix.needsUpdate = true;
      }
    }
    if (charcos.current) charcos.current.children.forEach((ch) => ch.scale.set(Math.max(0.001, e.lluvia), 1, Math.max(0.001, e.lluvia)));
    if (nevado.current) {
      (nevado.current.material as THREE.MeshStandardMaterial).opacity = e.nieve * 0.85;
      nevado.current.visible = e.nieve > 0.02;
    }
  });

  return (
    <>
      <color ref={fondo} attach="background" args={[c.bg]} />
      <fog ref={niebla} attach="fog" args={[c.bg, c.niebla[0] * nieblaEscala, c.niebla[1] * nieblaEscala]} />
      <ambientLight ref={amb} intensity={c.amb} />
      <hemisphereLight args={["#dbeafe", "#3f3a2f", 0.35]} />
      <directionalLight ref={sol} position={[-6, 11, 7]} intensity={c.sol} color="#fff3d6" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12} />
      <mesh ref={disco} position={[area.cx - area.w * 0.32, area.h + 2.5, area.cz - area.d * 0.9]}>
        <sphereGeometry args={[0.9, 24, 16]} />
        <meshBasicMaterial color="#fff7c2" toneMapped={false} />
      </mesh>
      <group ref={nubes}>
        {posNubes.map((p, i) => (
          <group key={i} position={[p.x, p.y, p.z]}>
            {[
              [0, 0, 0, 1],
              [0.95, -0.15, 0.1, 0.75],
              [-0.9, -0.2, 0, 0.7],
              [0.35, 0.45, -0.1, 0.72],
              [-0.4, 0.3, 0.2, 0.6],
            ].map(([x, y, z, s], k) => (
              <mesh key={k} geometry={G.nube} material={matNube} position={[x!, y!, z!]} scale={s!} />
            ))}
          </group>
        ))}
      </group>
      <instancedMesh ref={gotas} args={[G.gota, undefined, nGotas]} frustumCulled={false}>
        <meshBasicMaterial color="#cbe4f7" transparent opacity={0.55} depthWrite={false} />
      </instancedMesh>
      <instancedMesh ref={copos} args={[G.copo, undefined, nGotas]} frustumCulled={false}>
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.25} />
      </instancedMesh>
      <instancedMesh ref={hojas} args={[G.hoja, undefined, 46]} frustumCulled={false}>
        <meshStandardMaterial color="#d97706" side={THREE.DoubleSide} />
      </instancedMesh>
      <group ref={charcos}>
        {[
          [-3.2, 2.4, 1.1],
          [2.6, 3.1, 0.8],
          [-1.1, 4.3, 0.6],
          [3.8, -1.5, 0.9],
          [-4.3, -0.8, 0.7],
          [0.9, 1.6, 0.5],
        ].map(([x, z, r], i) => (
          <mesh key={i} position={[area.cx + x! * (area.w / 24), area.bordeZ !== undefined && area.cz + z! * (area.d / 20) + r! * 0.5 > area.bordeZ ? 0.006 : area.suelo + 0.012, area.cz + z! * (area.d / 20)]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 1, 1]}>
            <circleGeometry args={[r!, 28]} />
            <meshStandardMaterial color="#5b7083" roughness={0.05} metalness={0.5} />
          </mesh>
        ))}
      </group>
      <mesh ref={nevado} position={[area.cx, area.suelo + 0.02, area.bordeZ !== undefined ? (area.cz - area.d / 2 + area.bordeZ) / 2 : area.cz]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <planeGeometry args={[area.w, area.bordeZ !== undefined ? area.bordeZ - (area.cz - area.d / 2) : area.d]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.9} transparent opacity={0} depthWrite={false} />
      </mesh>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 1. LA PLAZA
 * ════════════════════════════════════════════════════════════════════════ */

const COLORES_PAPEL = ["#ec4899", "#f97316", "#22c55e", "#a855f7", "#facc15", "#06b6d4"];

function Arbol({ pos, fase, viento }: { pos: Pt; fase: number; viento: number }) {
  const ref = useRef<THREE.Group>(null);
  const v = useRef(viento);
  useFrame(({ clock }, dt) => {
    v.current += (viento - v.current) * suave(dt, 0.04);
    if (ref.current) {
      const t = clock.elapsedTime * (1.2 + v.current * 2.2) + fase;
      ref.current.rotation.z = Math.sin(t) * (0.012 + v.current * 0.09);
      ref.current.rotation.x = Math.cos(t * 0.8) * (0.006 + v.current * 0.04);
    }
  });
  return (
    <group position={pos}>
      <mesh geometry={G.cil} position={[0, 0.9, 0]} scale={[0.16, 1.8, 0.16]} castShadow>
        <meshStandardMaterial color="#5b3a1e" roughness={0.9} />
      </mesh>
      <group ref={ref} position={[0, 1.6, 0]}>
        <mesh geometry={G.copa} position={[0, 1.1, 0]} scale={1.25} castShadow>
          <meshStandardMaterial color="#2f6b2f" roughness={0.9} flatShading />
        </mesh>
        <mesh geometry={G.copa} position={[0.55, 0.7, 0.3]} scale={0.8} castShadow>
          <meshStandardMaterial color="#3f8a3a" roughness={0.9} flatShading />
        </mesh>
        <mesh geometry={G.copa} position={[-0.5, 0.8, -0.25]} scale={0.85} castShadow>
          <meshStandardMaterial color="#357a34" roughness={0.9} flatShading />
        </mesh>
      </group>
    </group>
  );
}

function PapelPicado({ desde, hasta, viento, fase }: { desde: Pt; hasta: Pt; viento: number; fase: number }) {
  const ref = useRef<THREE.Group>(null);
  const v = useRef(viento);
  const n = 11;
  useFrame(({ clock }, dt) => {
    v.current += (viento - v.current) * suave(dt, 0.04);
    if (!ref.current) return;
    const t = clock.elapsedTime;
    ref.current.children.forEach((ch, i) => {
      ch.rotation.x = Math.sin(t * (2 + v.current * 7) + i * 0.8 + fase) * (0.08 + v.current * 0.9) - v.current * 0.5;
    });
  });
  const dir = new THREE.Vector3(hasta[0] - desde[0], 0, hasta[2] - desde[2]);
  const angulo = Math.atan2(-dir.z, dir.x);
  return (
    <group ref={ref}>
      {Array.from({ length: n }, (_, i) => {
        const f = (i + 0.5) / n;
        const x = desde[0] + (hasta[0] - desde[0]) * f;
        const z = desde[2] + (hasta[2] - desde[2]) * f;
        const y = desde[1] + (hasta[1] - desde[1]) * f - Math.sin(f * Math.PI) * 0.45;
        return (
          <group key={i} position={[x, y, z]} rotation={[0, angulo, 0]}>
            <mesh geometry={G.bandera} position={[0, -0.11, 0]}>
              <meshStandardMaterial color={COLORES_PAPEL[i % COLORES_PAPEL.length]} side={THREE.DoubleSide} roughness={0.8} emissive={COLORES_PAPEL[i % COLORES_PAPEL.length]} emissiveIntensity={0.12} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/** Ropa de quien pasea, según el clima (lo que se esperaría ver en la calle). */
function ropaDeCalle(cond: Condicion, t: number, variante: number): PiezaHex[] {
  const pz = (id: PrendaId, hex: string): PiezaHex => ({ id, hex });
  const vivo = ["#2563eb", "#dc2626", "#16a34a", "#7c3aed"][variante % 4]!;
  const jeans = pz("jeans", "#1e3a8a");
  if (cond === "snowing" || t <= 10) return [pz("coat", vivo), jeans, pz("boots", "#1f2937"), pz("scarf", "#f59e0b"), ...(cond === "snowing" ? [pz("gloves", "#1f2937")] : [])];
  if (cond === "rainy") return variante % 2 === 0 ? [pz("raincoat", "#facc15"), jeans, pz("boots", "#111827")] : [pz("jacket", vivo), jeans, pz("sneakers", "#f1f5f9"), pz("umbrella", "#e11d48")];
  if (t >= 30) return [pz("tshirt", ["#f97316", "#f8fafc", "#22c55e"][variante % 3]!), pz("shorts", "#0ea5e9"), pz("sandals", "#a16207"), cond === "sunny" ? pz("cap", "#16a34a") : pz("sunglasses", "#111827")];
  if (t <= 19) return [pz("jacket", vivo), jeans, pz("sneakers", "#f1f5f9")];
  return [pz("tshirt", ["#f8fafc", "#f472b6", "#38bdf8"][variante % 3]!), jeans, pz("sneakers", "#f1f5f9"), ...(cond === "sunny" ? [pz("sunglasses", "#111827")] : [])];
}

const PASEANTES: Rasgos[] = [
  { altura: "medium", complexion: "slim", largo: "long", tipo: "straight", colorPelo: "black", piel: "#b07a52", lentes: false, barba: false, silla: false },
  { altura: "tall", complexion: "heavyset", largo: "short", tipo: "straight", colorPelo: "brown", piel: "#e0b48f", lentes: true, barba: false, silla: false },
  { altura: "short", complexion: "slim", largo: "short", tipo: "curly", colorPelo: "black", piel: "#6b4128", lentes: false, barba: false, silla: false },
];

function Paseante({ i, cond, tempC }: { i: number; cond: Condicion; tempC: number }) {
  const ref = useRef<THREE.Group>(null);
  const r = 4.1 + i * 0.35;
  const sentido = i % 2 === 0 ? 1 : -1;
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const a = clock.elapsedTime * 0.11 * sentido + (i * Math.PI * 2) / 3;
    ref.current.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
    ref.current.rotation.y = -a + (sentido > 0 ? 0 : Math.PI);
  });
  return (
    <group ref={ref}>
      <Figura p={PASEANTES[i]!} ropa={ropaDeCalle(cond, tempC, i)} andar fase={i * 1.7} />
    </group>
  );
}

function Plaza({ condicion, tempC, modoColor }: { condicion: Condicion; tempC: number; modoColor: string }) {
  const viento = CIELO[condicion].viento;
  const columna = useRef<THREE.Mesh>(null);
  const tv = useRef(tempC);
  const lectura = useRef<HTMLSpanElement>(null);
  useFrame((_, dt) => {
    tv.current += (tempC - tv.current) * suave(dt, 0.06);
    const f = (tv.current - T_MIN) / (T_MAX - T_MIN);
    if (columna.current) {
      columna.current.scale.y = Math.max(0.02, f * 1.9);
      columna.current.position.y = 0.55 + (f * 1.9) / 2;
    }
    if (lectura.current) {
      const c = Math.round(tv.current);
      lectura.current.textContent = `${signo(c)} °C · ${aFahrenheit(c)} °F`;
    }
  });
  const postes: Pt[] = [
    [4.6, 0, 4.6],
    [-4.6, 0, 4.6],
    [4.6, 0, -4.6],
    [-4.6, 0, -4.6],
  ];
  return (
    <group>
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <cylinderGeometry args={[16, 16, 0.1, 64]} />
        <meshStandardMaterial color="#4a7a3a" roughness={1} />
      </mesh>
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[6.6, 64]} />
        <meshStandardMaterial color="#c9b08c" roughness={0.85} />
      </mesh>
      {[2.2, 4.2].map((r) => (
        <mesh key={r} position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r, r + 0.12, 64]} />
          <meshStandardMaterial color="#a8876a" roughness={0.9} />
        </mesh>
      ))}
      {/* Kiosco */}
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.9, 2.0, 0.5, 8]} />
        <meshStandardMaterial color="#e7e5e4" roughness={0.7} />
      </mesh>
      {Array.from({ length: 8 }, (_, k) => {
        const a = (k / 8) * Math.PI * 2 + Math.PI / 8;
        return (
          <mesh key={k} geometry={G.cil} position={[Math.cos(a) * 1.65, 1.6, Math.sin(a) * 1.65]} scale={[0.07, 2.2, 0.07]} castShadow>
            <meshStandardMaterial color="#166534" roughness={0.5} metalness={0.3} />
          </mesh>
        );
      })}
      <mesh position={[0, 2.75, 0]} castShadow>
        <cylinderGeometry args={[2.05, 2.05, 0.12, 8]} />
        <meshStandardMaterial color="#14532d" roughness={0.5} />
      </mesh>
      <mesh position={[0, 3.35, 0]} castShadow>
        <coneGeometry args={[2.25, 1.1, 8]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.55} />
      </mesh>
      <mesh geometry={G.esfera} position={[0, 3.98, 0]} scale={0.14}>
        <meshStandardMaterial color="#fbbf24" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Postes y papel picado */}
      {postes.map((p, k) => (
        <group key={k} position={p}>
          <mesh geometry={G.cil} position={[0, 1.4, 0]} scale={[0.05, 2.8, 0.05]} castShadow>
            <meshStandardMaterial color="#1f2937" metalness={0.5} roughness={0.4} />
          </mesh>
          <mesh geometry={G.esfera} position={[0, 2.9, 0]} scale={0.16}>
            <meshStandardMaterial color="#fef3c7" emissive="#fde68a" emissiveIntensity={condicion === "sunny" ? 0.1 : 0.9} />
          </mesh>
        </group>
      ))}
      {postes.map((p, k) => (
        <PapelPicado key={k} desde={[p[0] * 0.36, 2.72, p[2] * 0.36]} hasta={[p[0], 2.7, p[2]]} viento={viento} fase={k} />
      ))}
      {/* Árboles y bancas */}
      {(
        [
          [-7.2, 0, -1.5],
          [7.4, 0, -2.2],
          [-6.2, 0, -6.5],
          [6.0, 0, -6.8],
          [-8.4, 0, 3.5],
        ] as Pt[]
      ).map((p, k) => (
        <Arbol key={k} pos={p} fase={k * 1.3} viento={viento} />
      ))}
      {(
        [
          [-3.1, 3.2, 0.78],
          [3.2, -3.1, -2.36],
          [-3.3, -3.0, -0.78],
        ] as [number, number, number][]
      ).map(([x, z, a], k) => (
        <group key={k} position={[x, 0, z]} rotation={[0, a, 0]}>
          <mesh geometry={G.caja} position={[0, 0.45, 0]} scale={[1.4, 0.07, 0.42]} castShadow>
            <meshStandardMaterial color="#92400e" roughness={0.8} />
          </mesh>
          <mesh geometry={G.caja} position={[0, 0.75, -0.2]} scale={[1.4, 0.4, 0.06]} castShadow>
            <meshStandardMaterial color="#92400e" roughness={0.8} />
          </mesh>
          {[-0.6, 0.6].map((dx) => (
            <mesh key={dx} geometry={G.caja} position={[dx, 0.22, 0]} scale={[0.06, 0.44, 0.4]}>
              <meshStandardMaterial color="#1f2937" />
            </mesh>
          ))}
        </group>
      ))}
      {/* Termómetro de la plaza */}
      <group position={[3.4, 0, 3.2]} rotation={[0, -0.5, 0]}>
        <mesh geometry={G.cil} position={[0, 0.3, 0]} scale={[0.06, 0.6, 0.06]}>
          <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh geometry={G.caja} position={[0, 1.55, 0]} scale={[0.5, 2.3, 0.14]} castShadow>
          <meshStandardMaterial color="#f8fafc" roughness={0.4} />
        </mesh>
        <mesh geometry={G.cil} position={[0, 1.5, 0.08]} scale={[0.05, 1.95, 0.03]}>
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
        <mesh ref={columna} geometry={G.cil} position={[0, 1, 0.1]} scale={[0.035, 1, 0.03]}>
          <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={0.35} />
        </mesh>
        <mesh geometry={G.esfera} position={[0, 0.5, 0.1]} scale={0.09}>
          <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={0.35} />
        </mesh>
        {[0, 10, 20, 30, 40].map((g) => (
          <mesh key={g} geometry={G.caja} position={[0.1, 0.55 + ((g - T_MIN) / (T_MAX - T_MIN)) * 1.9, 0.08]} scale={[0.1, 0.012, 0.01]}>
            <meshBasicMaterial color="#0f172a" />
          </mesh>
        ))}
        <Etiqueta pos={[0, 3.05, 0]} df={10} col={`${modoColor}cc`} fs={15}>
          <i className="fa-solid fa-temperature-half" style={{ color: "#f87171" }} />
          <span ref={lectura}>
            {signo(tempC)} °C · {aFahrenheit(tempC)} °F
          </span>
        </Etiqueta>
      </group>
      {[0, 1, 2].map((i) => (
        <Paseante key={i} i={i} cond={condicion} tempC={tempC} />
      ))}
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. DRESS FOR THE WEATHER
 * ════════════════════════════════════════════════════════════════════════ */

const BURBUJA: Record<"ok" | "frio" | "calor" | "mojado", { txt: string; col: string }> = {
  ok: { txt: "I am comfortable!", col: OK },
  frio: { txt: "Brrr… I am cold!", col: "#38bdf8" },
  calor: { txt: "Phew… I am too hot!", col: "#f97316" },
  mojado: { txt: "Oh no… I am wet!", col: "#60a5fa" },
};

function Banqueta({ pronosticoId, atuendo, revisado, okAtuendo, problema, modoColor }: { pronosticoId: string; atuendo: Atuendo; revisado: boolean; okAtuendo: boolean; problema: Problema; modoColor: string }) {
  const f = PRONOSTICOS.find((x) => x.id === pronosticoId) ?? PRONOSTICOS[0]!;
  const quien = personaPorId(f.personaId);
  const ropa: PiezaHex[] = [atuendo.top, atuendo.bottom, atuendo.shoes, ...atuendo.extras].filter((x): x is PrendaId => x !== null).map((id) => ({ id, hex: PRENDA_DEF[id].col }));
  const cuerpo = useRef<THREE.Group>(null);
  const aro = useRef<THREE.Mesh>(null);
  const part = useRef<THREE.InstancedMesh>(null);
  const z = useRef(-0.9);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const reaccion = revisado ? (okAtuendo ? "ok" : (problema ?? "frio")) : null;
  const escala = quien.altura === "tall" ? 1.1 : quien.altura === "short" ? 0.88 : 1;
  const yCabeza = 0.13 + (quien.silla ? 1.26 : 1.6) * escala;
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    const destino = revisado ? 1.25 : -0.9;
    z.current += (destino - z.current) * suave(dt, 0.035);
    const llego = Math.abs(destino - z.current) < 0.2;
    if (cuerpo.current) {
      const tiembla = llego && reaccion === "frio" ? Math.sin(t * 55) * 0.018 : 0;
      const brinco = llego && reaccion === "ok" ? Math.abs(Math.sin(t * 4)) * 0.07 : 0;
      const desmayo = llego && reaccion === "calor" ? Math.sin(t * 1.5) * 0.05 : 0;
      cuerpo.current.position.set(tiembla, brinco, z.current);
      cuerpo.current.rotation.z = desmayo;
    }
    if (aro.current) {
      aro.current.visible = llego && reaccion !== null;
      aro.current.position.z = z.current;
      aro.current.scale.setScalar(1 + Math.sin(t * 3) * 0.05);
    }
    const m = part.current;
    if (m) {
      m.visible = llego && (reaccion === "frio" || reaccion === "calor" || reaccion === "mojado");
      if (m.visible) {
        for (let i = 0; i < 24; i++) {
          const frio = reaccion === "frio";
          // Frío: tres bocanadas de vaho que salen de la boca y se deshacen.
          const p = frio ? (t * 0.7 + (i % 3) / 3) % 1 : (t * 0.9 + i / 24) % 1;
          const oculto = frio && i >= 9;
          if (frio) obj.position.set(Math.sin(i * 2.1) * 0.04, yCabeza - 0.06 * escala + p * 0.12, z.current + 0.16 + p * 0.45 + ((i % 3) - 1) * 0.02);
          else if (reaccion === "calor") obj.position.set(Math.sin(i * 1.7) * 0.13 * escala, yCabeza + 0.1 - p * 0.75, z.current + Math.cos(i * 1.3) * 0.11);
          else obj.position.set(Math.sin(i * 1.9) * 0.26, yCabeza - 0.05 - p * (yCabeza - 0.2), z.current + Math.cos(i * 2.3) * 0.16);
          const s = oculto ? 0.0001 : frio ? (0.025 + p * 0.06) * (1 - p * 0.3) : 0.022;
          obj.scale.set(s, reaccion === "mojado" ? s * 2.2 : s, s);
          obj.updateMatrix();
          m.setMatrixAt(i, obj.matrix);
        }
        m.instanceMatrix.needsUpdate = true;
      }
    }
  });
  const enPerchero = (["tshirt", "sweater", "jacket", "coat", "raincoat"] as PrendaId[]).filter((id) => id !== atuendo.top);
  const b = reaccion ? BURBUJA[reaccion] : null;
  return (
    <group>
      {/* Calle y banqueta */}
      <mesh position={[0, -0.06, 3]} receiveShadow>
        <boxGeometry args={[18, 0.1, 6]} />
        <meshStandardMaterial color="#3a3f47" roughness={0.95} />
      </mesh>
      {[-6, -2, 2, 6].map((x) => (
        <mesh key={x} position={[x, 0.0, 4.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.8, 0.12]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, 0.06, 0.4]} receiveShadow castShadow>
        <boxGeometry args={[18, 0.14, 3.2]} />
        <meshStandardMaterial color="#b8b2a7" roughness={0.9} />
      </mesh>
      {/* Fachada */}
      <mesh position={[0, 1.9, -1.3]} receiveShadow>
        <boxGeometry args={[18, 3.8, 0.2]} />
        <meshStandardMaterial color="#e8955a" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.25, -1.18]}>
        <boxGeometry args={[18, 0.5, 0.06]} />
        <meshStandardMaterial color="#9a3412" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.2, -1.19]}>
        <boxGeometry args={[1.3, 2.3, 0.05]} />
        <meshStandardMaterial color="#5b3a1e" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.2, -1.21]}>
        <boxGeometry args={[1.5, 2.45, 0.02]} />
        <meshStandardMaterial color="#f5f5f4" />
      </mesh>
      {[-3.4, 3.4].map((x) => (
        <group key={x} position={[x, 2.0, -1.18]}>
          <mesh>
            <boxGeometry args={[1.5, 1.2, 0.04]} />
            <meshStandardMaterial color="#1e3a5f" roughness={0.1} metalness={0.4} />
          </mesh>
          {[-0.5, -0.17, 0.17, 0.5].map((dx) => (
            <mesh key={dx} geometry={G.cil} position={[dx, 0, 0.05]} scale={[0.018, 1.2, 0.018]}>
              <meshStandardMaterial color="#111827" metalness={0.6} roughness={0.4} />
            </mesh>
          ))}
          {[0, 0.5, 1].map((k) => (
            <mesh key={k} geometry={G.esferaB} position={[-0.5 + k * 0.5, -0.66, 0.12]} scale={[0.14, 0.1, 0.1]}>
              <meshStandardMaterial color={["#ef4444", "#f59e0b", "#ec4899"][k * 2]} roughness={0.8} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Toldo */}
      <mesh position={[0, 3.05, -0.55]} rotation={[0.32, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.6, 0.06, 1.7]} />
        <meshStandardMaterial color={modoColor} roughness={0.7} />
      </mesh>
      {/* Perchero con lo que no se eligió */}
      <group position={[-1.95, 0, -0.45]}>
        {[-0.75, 0.75].map((dx) => (
          <mesh key={dx} geometry={G.cil} position={[dx, 0.95, 0]} scale={[0.025, 1.9, 0.025]}>
            <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
          </mesh>
        ))}
        <mesh geometry={G.cil} position={[0, 1.85, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.02, 1.55, 0.02]}>
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
        </mesh>
        {enPerchero.map((id, k) => (
          <group key={id} position={[-0.56 + k * 0.37, 1.55, 0]}>
            <mesh geometry={G.caja} scale={[0.28, id === "coat" || id === "raincoat" ? 0.52 : 0.36, 0.05]} position={[0, id === "coat" || id === "raincoat" ? -0.08 : 0, 0]} castShadow>
              <meshStandardMaterial color={PRENDA_DEF[id].col} roughness={0.7} />
            </mesh>
            <mesh geometry={G.caja} position={[0, 0.15, 0]} scale={[0.4, id === "tshirt" ? 0.08 : 0.07, 0.05]} rotation={[0, 0, 0]}>
              <meshStandardMaterial color={PRENDA_DEF[id].col} roughness={0.7} />
            </mesh>
          </group>
        ))}
      </group>
      {/* Letrero de la ciudad */}
      <group position={[2.3, 0, -0.6]}>
        <mesh geometry={G.cil} position={[0, 0.9, 0]} scale={[0.04, 1.8, 0.04]}>
          <meshStandardMaterial color="#1f2937" />
        </mesh>
        <Etiqueta pos={[0, 2.05, 0]} df={8} col={`${modoColor}cc`} fs={13}>
          <i className="fa-solid fa-location-dot" style={{ color: modoColor }} />
          {f.lugar.split(",")[0]} · {signo(f.tempC)} °C · {aFahrenheit(f.tempC)} °F
        </Etiqueta>
      </group>
      {/* La persona */}
      <group ref={cuerpo} position={[0, 0.13, -0.9]}>
        <Figura p={quien} ropa={ropa} />
        {b && <Burbuja pos={[0, 2.35, 0]} texto={b.txt} col={b.col} />}
      </group>
      <mesh ref={aro} position={[0, 0.17, 1.25]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.46, 0.56, 40]} />
        <meshBasicMaterial color={reaccion === "ok" ? OK : NO} transparent opacity={0.9} toneMapped={false} />
      </mesh>
      <instancedMesh ref={part} args={[G.esferaB, undefined, 24]} frustumCulled={false} visible={false}>
        <meshStandardMaterial color={reaccion === "frio" ? "#f8fafc" : "#7dd3fc"} transparent opacity={reaccion === "frio" ? 0.35 : 0.9} emissive={reaccion === "frio" ? "#ffffff" : "#38bdf8"} emissiveIntensity={0.2} depthWrite={false} />
      </instancedMesh>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. WHO IS IT?
 * ════════════════════════════════════════════════════════════════════════ */

const SEP = 1.55;

function Parada({ orden, seleccion, seleccionOk, describir, onElegirPersona, modoColor }: { orden: string[]; seleccion: string | null; seleccionOk: boolean | null; describir: string | null; onElegirPersona: (id: string) => void; modoColor: string }) {
  const aros = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (aros.current) aros.current.children.forEach((c, i) => c.scale.setScalar(1 + Math.sin(clock.elapsedTime * 3 + i) * 0.05));
  });
  const x0 = -((orden.length - 1) * SEP) / 2;
  return (
    <group>
      <mesh position={[0, -0.06, 2.6]} receiveShadow>
        <boxGeometry args={[20, 0.1, 5]} />
        <meshStandardMaterial color="#3a3f47" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.05, -0.2]} receiveShadow>
        <boxGeometry args={[20, 0.12, 2.6]} />
        <meshStandardMaterial color="#b8b2a7" roughness={0.9} />
      </mesh>
      {/* Muro de fondo con mural */}
      <mesh position={[0, 1.7, -1.6]} receiveShadow>
        <boxGeometry args={[20, 3.4, 0.2]} />
        <meshStandardMaterial color="#f1e3c8" roughness={0.95} />
      </mesh>
      {[
        ["#0ea5e9", -6, 1.6, 2.4],
        ["#f472b6", -3.2, 1.9, 1.8],
        ["#22c55e", 3.6, 1.7, 2.2],
        ["#f59e0b", 6.4, 2.0, 1.6],
      ].map(([c, x, y, s], k) => (
        <mesh key={k} position={[x as number, y as number, -1.49]}>
          <circleGeometry args={[(s as number) * 0.5, 32]} />
          <meshStandardMaterial color={c as string} roughness={0.9} />
        </mesh>
      ))}
      {/* Refugio de la parada */}
      <group position={[-0.8, 0, -1.0]}>
        {[-2.6, 2.6].map((x) => (
          <mesh key={x} geometry={G.cil} position={[x, 1.3, 0]} scale={[0.05, 2.6, 0.05]} castShadow>
            <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.35} />
          </mesh>
        ))}
        <mesh position={[0, 2.62, 0.25]} castShadow>
          <boxGeometry args={[5.6, 0.07, 1.4]} />
          <meshStandardMaterial color="#0f766e" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.48, -0.15]} castShadow>
          <boxGeometry args={[3.2, 0.07, 0.42]} />
          <meshStandardMaterial color="#64748b" metalness={0.4} roughness={0.4} />
        </mesh>
      </group>
      <group position={[5.9, 0, -0.4]}>
        <mesh geometry={G.cil} position={[0, 1.2, 0]} scale={[0.045, 2.4, 0.045]}>
          <meshStandardMaterial color="#1f2937" />
        </mesh>
        <mesh position={[0, 2.35, 0]}>
          <boxGeometry args={[0.6, 0.6, 0.05]} />
          <meshStandardMaterial color="#1d4ed8" roughness={0.4} />
        </mesh>
        <Etiqueta pos={[0, 2.35, 0.1]} df={9} fs={12} col="#93c5fdaa">
          <i className="fa-solid fa-bus" style={{ color: "#93c5fd" }} />
          Parada
        </Etiqueta>
      </group>
      <group ref={aros}>
        {orden.map((id, k) => {
          const on = id === seleccion || id === describir;
          const col = id === describir ? modoColor : seleccionOk ? OK : NO;
          return (
            <mesh key={id} position={[x0 + k * SEP, 0.13, 0.25]} rotation={[-Math.PI / 2, 0, 0]} visible={on}>
              <ringGeometry args={[0.44, 0.54, 40]} />
              <meshBasicMaterial color={col} transparent opacity={0.95} toneMapped={false} />
            </mesh>
          );
        })}
      </group>
      {orden.map((id, k) => {
        const p = PERSONAS.find((x) => x.id === id)!;
        const x = x0 + k * SEP;
        const alto = p.silla ? 1.45 : p.altura === "tall" ? 2.08 : p.altura === "short" ? 1.72 : 1.9;
        const on = id === seleccion || id === describir;
        return (
          <group key={id}>
            <group position={[x, 0.11, 0.25]} rotation={[0, (k - 2.5) * -0.07, 0]}>
              <Figura p={p} ropa={piezas(p)} fase={k * 0.9} />
            </group>
            <mesh
              position={[x, 1, 0.25]}
              onClick={(e) => {
                e.stopPropagation();
                onElegirPersona(id);
              }}
              onPointerOver={() => {
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                document.body.style.cursor = "";
              }}
            >
              <cylinderGeometry args={[0.42, 0.42, 2.1, 12]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
            <Etiqueta pos={[x, alto + 0.28, 0.25]} df={8} fs={13} col={on ? (id === describir ? modoColor : seleccionOk ? OK : NO) : "rgba(255,255,255,0.3)"}>
              {id === describir ? <i className="fa-solid fa-pen" style={{ color: modoColor }} /> : null}
              {k + 1}
            </Etiqueta>
          </group>
        );
      })}
    </group>
  );
}

/* ── Escena ───────────────────────────────────────────────────────────── */

const AREA_PLAZA: Area = { suelo: 0.01, cx: 0, cz: 0, w: 26, d: 22, h: 11 };
const AREA_CALLE: Area = { suelo: 0.13, bordeZ: 1.95, cx: 0, cz: 2.1, w: 11, d: 3.6, h: 5 };
const AREA_PARADA: Area = { suelo: 0.11, cx: 0, cz: 2, w: 16, d: 8, h: 7 };

export default function ClimaVestimentaInglesScene(p: ClimaVestimentaSceneProps) {
  const { vista, modoColor, resetNonce } = p;
  const cam = useMemo((): { pos: Pt; target: Pt; min: number; max: number } => {
    if (vista === "clima") return { pos: [0, 5.2, 13.2], target: [0, 1.7, 0], min: 5, max: 24 };
    if (vista === "vestir") return { pos: [0.4, 2.1, 6.4], target: [0, 1.25, 0.2], min: 3, max: 12 };
    return { pos: [0, 1.85, 7.5], target: [0, 1.1, 0.2], min: 3.5, max: 15 };
  }, [vista]);
  const f = PRONOSTICOS.find((x) => x.id === p.pronosticoId) ?? PRONOSTICOS[0]!;
  const condicion: Condicion = vista === "clima" ? p.condicion : vista === "vestir" ? f.condicion : "cloudy";

  return (
    <Canvas key={`${vista}-${resetNonce}`} shadows dpr={[1, 1.75]} camera={{ position: cam.pos, fov: 42 }} gl={{ antialias: true }}>
      <Clima condicion={condicion} area={vista === "clima" ? AREA_PLAZA : vista === "vestir" ? AREA_CALLE : AREA_PARADA} nGotas={vista === "clima" ? 900 : 420} nieblaEscala={vista === "vestir" ? 1.7 : 1} />
      {vista === "clima" && <Plaza condicion={p.condicion} tempC={p.tempC} modoColor={modoColor} />}
      {vista === "vestir" && <Banqueta pronosticoId={p.pronosticoId} atuendo={p.atuendo} revisado={p.revisado} okAtuendo={p.okAtuendo} problema={p.problema} modoColor={modoColor} />}
      {vista === "quien" && <Parada orden={p.orden} seleccion={p.seleccion} seleccionOk={p.seleccionOk} describir={p.describir} onElegirPersona={p.onElegirPersona} modoColor={modoColor} />}
      <OrbitControls makeDefault enablePan={false} enableZoom minDistance={cam.min} maxDistance={cam.max} maxPolarAngle={Math.PI * 0.49} minPolarAngle={Math.PI * 0.12} target={cam.target} />
      <EffectComposer>
        <Bloom intensity={0.25} luminanceThreshold={0.85} luminanceSmoothing={0.6} mipmapBlur />
        <Vignette eskil={false} offset={0.22} darkness={0.5} />
      </EffectComposer>
    </Canvas>
  );
}
