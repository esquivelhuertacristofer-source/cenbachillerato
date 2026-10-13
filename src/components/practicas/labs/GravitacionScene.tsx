"use client";

/**
 * Escena 3D — "Gravitación universal: fuerza, peso y órbitas" (CNEYT-V-P03-A2).
 *
 * Tres MODOS (uno por inciso del A2), seleccionados por la prop `modo`:
 *  · "fuerza" — la Tierra y la Luna fotográficas, separadas por una distancia
 *    PROPORCIONAL a r. Dos flechas iguales y opuestas (3.ª ley de Newton) cuyo
 *    largo es proporcional a F = G·M·m/r²: al duplicar r se encogen a la cuarta
 *    parte. Opcional: el océano abultado por la marea (∝ 1/r³, exagerado).
 *  · "peso"   — un astronauta sobre una báscula, parado en la Luna, Marte, la
 *    Tierra o Júpiter. La báscula marca W = m·g; la flecha W es proporcional.
 *    «Saltar» lanza al astronauta con la MISMA rapidez en todos los cuerpos: en
 *    la Luna sube 6 veces más alto y, mientras vuela, la báscula marca 0.
 *  · "orbita" — un satélite Mexsat sobre la Tierra que gira (día sideral). En
 *    la órbita geoestacionaria el satélite queda fijo sobre México mientras la
 *    Tierra gira: su haz no se despega. Se puede mirar desde el espacio, girando
 *    con la Tierra o desde el satélite, y comparar con la EEI (órbita baja).
 *
 * Patrón R3F: el default export monta <Canvas> (key={modo}) y delega en
 * <Contenido>. React Compiler: nada de Math.random()/Date.now()/setState en
 * render; lo que se anima vive en useFrame con refs y vectores preasignados.
 */

import * as THREE from "three";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Line, Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { ViaLactea } from "./_espacio";
import {
  TierraFoto, CuerpoFoto, Mareas, Mexsat, EstacionEEI, Astronauta, Bascula, crearPantallaBascula,
  lonLat, MEXICO, MEXSAT_LON,
} from "./gravitacion-espacio3d";
import {
  type Modo, resolverFuerza, resolverPeso, resolverOrbita, resolverSalto, cuerpoPorId, mareaRelativa,
  F_DEF, R_DEF, R_TIERRA, ALT_GEO, T_SIDEREO_H, ORBITA_EEI, INCL_EEI,
  sci, fmt0, fmt1, fmt2,
} from "./gravitacion-data";

export type VistaOrbita = "espacio" | "tierra" | "satelite";

export interface GravitacionSceneProps {
  modo: Modo;
  r: number;          // (a) distancia Tierra–Luna (m)
  mareas: boolean;    // (a) mostrar el abultamiento de marea
  cuerpoId: string;   // (b) cuerpo seleccionado
  m: number;          // (b) masa (kg)
  salto: number;      // (b) cada incremento lanza un salto
  alt: number;        // (c) altura de la órbita (m)
  playing: boolean;   // (c) el tiempo corre
  velocidad: number;  // (c) horas simuladas por segundo real
  vista: VistaOrbita; // (c) punto de vista
  eei: boolean;       // (c) comparar con la Estación Espacial Internacional
  accent: string;
  resetNonce: number;
}

type Pt = [number, number, number];
const UP = new THREE.Vector3(0, 1, 0);
const DEG = Math.PI / 180;
const FOV = 42;
const TAN_V = Math.tan((FOV / 2) * DEG);

/* ── Colores ──────────────────────────────────────────────────────────────── */
const C_FUERZA = "#a78bfa";
const C_PESO = "#7dd3fc";
const C_ORBITA = "#34D399";
const C_GHOST = "#94a3b8";
const C_MEXICO = "#fbbf24";

/* ── Etiqueta: tamaño fijo en píxeles (≥14), desplazada según el lado ────────── */
type Lado = "up" | "down" | "left" | "right";
const DESPLAZA: Record<Lado, string> = {
  up: "translate(0,-70%)",
  down: "translate(0,70%)",
  left: "translate(-62%,0)",
  right: "translate(62%,0)",
};

const CAJA: React.CSSProperties = {
  whiteSpace: "nowrap", padding: "3px 9px", borderRadius: 8, background: "rgba(4,10,22,0.86)",
  fontWeight: 900, fontSize: 15, fontFamily: "system-ui, sans-serif", boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
};

function Etiqueta({ position, color, children, lado = "up" }: { position: Pt; color: string; children: React.ReactNode; lado?: Lado }) {
  return (
    <Html position={position} center pointerEvents="none" zIndexRange={[20, 0]}>
      <div style={{ transform: DESPLAZA[lado] }}>
        <div style={{ ...CAJA, border: `1.5px solid ${color}`, color }}>{children}</div>
      </div>
    </Html>
  );
}

/* ── Flecha 3D gruesa (asta + cono) en una dirección arbitraria ────────────── */
function Flecha({
  base, dir, len, color, label, grosor = 0.075, opacidad = 1, lado = "up", encima = false,
}: {
  base: Pt; dir: Pt; len: number; color: string;
  label?: React.ReactNode; grosor?: number; opacidad?: number; lado?: Lado;
  /** Se dibuja por encima de lo demás (la flecha entra en el planeta). */
  encima?: boolean;
}) {
  const quat = useMemo(() => {
    const v = new THREE.Vector3(...dir).normalize();
    return new THREE.Quaternion().setFromUnitVectors(UP, v);
  }, [dir]);
  if (len < 0.03) return null;
  const headLen = Math.min(grosor * 6, len * 0.55);
  const shaftLen = Math.max(0.001, len - headLen);
  const trans = opacidad < 1 || encima;
  return (
    <group position={base} quaternion={quat}>
      <mesh position={[0, shaftLen / 2, 0]} renderOrder={encima ? 10 : 0}>
        <cylinderGeometry args={[grosor, grosor, shaftLen, 18]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} roughness={0.35} metalness={0.2}
          transparent={trans} opacity={opacidad} depthTest={!encima} />
      </mesh>
      <mesh position={[0, shaftLen + headLen / 2, 0]} renderOrder={encima ? 10 : 0}>
        <coneGeometry args={[grosor * 2.3, headLen, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} roughness={0.35} metalness={0.2}
          transparent={trans} opacity={opacidad} depthTest={!encima} />
      </mesh>
      {label != null && <Etiqueta position={[0, len, 0]} color={color} lado={lado}>{label}</Etiqueta>}
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   CÁMARA CON INTENCIÓN
   Viaja (amortiguada) hacia un objetivo y una distancia; cuando cambian, vuelve
   a viajar. Si el alumno toma el control, la guía lo deja en paz.
   ════════════════════════════════════════════════════════════════════════════ */
function Guia({ objetivo, distancia, dir, activa = true }: { objetivo: Pt; distancia: number; dir: Pt; activa?: boolean }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;
  const resta = useRef(0);
  const clave = useRef("");
  const iniciada = useRef(false);
  const reorientar = useRef(false);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const meta = useMemo(() => new THREE.Vector3(), []);
  const haciaDir = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    if (!controls) return undefined;
    const soltar = () => { resta.current = 0; };
    controls.addEventListener("start", soltar);
    return () => controls.removeEventListener("start", soltar);
  }, [controls]);

  useFrame((_, dtRaw) => {
    if (!activa) { clave.current = ""; reorientar.current = true; return; }
    if (!controls) return;
    const dt = Math.min(dtRaw, 0.05);
    if (!iniciada.current) {
      // Entrada: la cámara llega desde lejos.
      iniciada.current = true;
      tmp.set(...dir).normalize().multiplyScalar(distancia * 1.9);
      controls.target.set(...objetivo);
      camera.position.copy(controls.target).add(tmp);
    }
    const k = `${objetivo.map((x) => x.toFixed(2)).join()}|${distancia.toFixed(2)}`;
    if (k !== clave.current) { clave.current = k; resta.current = 2.2; }
    if (resta.current <= 0) return;
    resta.current -= dt;
    meta.set(...objetivo);
    // El desplazamiento se mide ANTES de mover el objetivo: la cámara viaja
    // junto con él en lugar de girar sobre sí misma.
    tmp.copy(camera.position).sub(controls.target);
    controls.target.lerp(meta, 1 - Math.exp(-dt * 3.5));
    const largo = THREE.MathUtils.damp(tmp.length(), distancia, 3.2, dt);
    if (reorientar.current) {
      // Al volver de una vista guiada (desde el satélite), regresa al ángulo del modo.
      haciaDir.set(...dir).normalize();
      tmp.normalize().lerp(haciaDir, 1 - Math.exp(-dt * 3)).normalize();
      if (resta.current <= 0.05) reorientar.current = false;
    }
    tmp.setLength(largo);
    camera.position.copy(controls.target).add(tmp);
    controls.update();
  });
  return null;
}

/** Distancia de cámara para que un contenido de medio-ancho × medio-alto ocupe
 *  ~62 % del alto y ~88 % del ancho; y el objetivo, corrido para que el
 *  contenido quede entre la barra de arriba y la misión de abajo. */
function encuadrar(centro: Pt, medioAncho: number, medioAlto: number, aspect: number): { objetivo: Pt; distancia: number } {
  const d = Math.max(medioAlto / (TAN_V * 0.62), medioAncho / (TAN_V * 0.88 * aspect));
  const corrimiento = 0.06 * 2 * d * TAN_V;
  return { objetivo: [centro[0], centro[1] - corrimiento, centro[2]], distancia: d };
}

/* ════════════════════════════════════════════════════════════════════════════
   (a) MODO FUERZA — Tierra y Luna, F = G·M·m/r²
   ════════════════════════════════════════════════════════════════════════════ */
const R_E = 1.6;                       // radio de la Tierra en la escena
const R_L = R_E * (1737.4 / 6371);     // Luna a escala con la Tierra (0.273)
const D_PROBLEMA = 9.6;                // distancia del problema en la escena (6 radios; la real es 60)
const D_PROBLEMA_CEL = 6;              // en celular, más comprimida (3.75 radios) para que el sistema llene la escena
const L0 = 2.2;                        // largo de la flecha con la fuerza del problema
const SOL_FUERZA = new THREE.Vector3(-0.42, 0.32, 0.85).normalize();
/** Giro que pone a México de frente a la cámara (+Z). */
const GIRO_MEXICO = -Math.PI / 2 - MEXICO.lon * DEG;
// Constantes (no arreglos nuevos en cada render): useFrame las va girando.
const ROT_TIERRA_FUERZA: Pt = [0, GIRO_MEXICO + 0.35, 0];

function EscenaFuerza({ r, mareas, ancho, incl }: { r: number; mareas: boolean; ancho: boolean; incl: number }) {
  const { F } = resolverFuerza(r);
  const ratio = F / F_DEF;
  const dProb = ancho ? D_PROBLEMA : D_PROBLEMA_CEL;
  const D = dProb * (r / R_DEF);        // proporcional a r
  const hueco = D - R_E - R_L;
  const Lfisica = L0 * (dProb / D_PROBLEMA) * ratio;   // proporcional a F
  const Lmax = Math.max(0.1, hueco / 2 - 0.12);
  const recortada = Lfisica > Lmax;
  const L = Math.min(Lfisica, Lmax);
  const a = Math.min(0.2, 0.06 * mareaRelativa(r));

  const giro = useRef<THREE.Group>(null);
  useFrame((_, dt) => { if (giro.current) giro.current.rotation.y += Math.min(dt, 0.05) * 0.03; });

  const yCota = -(R_E + 0.55);
  return (
    // En celular el sistema se inclina sobre la diagonal para llenar la escena.
    <group rotation={[0, 0, incl]}>
      {/* Tierra (gira despacio, México de frente al empezar) */}
      <group ref={giro} rotation={ROT_TIERRA_FUERZA}>
        <TierraFoto radio={R_E} dirSol={SOL_FUERZA} />
      </group>
      {mareas && <Mareas radio={R_E} a={a} dirSol={SOL_FUERZA} />}

      {/* Luna: siempre la misma cara hacia la Tierra */}
      <group position={[D, 0, 0]} rotation={[0, Math.PI, 0]}>
        <CuerpoFoto textura="luna" radio={R_L} />
      </group>

      <Etiqueta position={[0, R_E + 0.12, 0]} color="#bfdbfe" lado="up">Tierra</Etiqueta>
      <Etiqueta position={[D, R_L + 0.12, 0]} color="#e2e8f0" lado="up">Luna</Etiqueta>

      {/* cota de distancia (centro a centro), por debajo de los cuerpos */}
      <Line points={[[0, yCota, 0], [D, yCota, 0]]} color="#ffffff" lineWidth={2.5} dashed dashSize={0.25} gapSize={0.16} transparent opacity={0.55} />
      <Line points={[[0, yCota - 0.2, 0], [0, yCota + 0.2, 0]]} color="#ffffff" lineWidth={2.5} transparent opacity={0.55} />
      <Line points={[[D, yCota - 0.2, 0], [D, yCota + 0.2, 0]]} color="#ffffff" lineWidth={2.5} transparent opacity={0.55} />
      {ancho && <Etiqueta position={[D / 2, yCota, 0]} color="#ffffff" lado="down">r = {sci(r)} m</Etiqueta>}

      {/* fuerzas iguales y opuestas (3.ª ley de Newton), largo ∝ F */}
      <Flecha base={[R_E + 0.1, 0, 0]} dir={[1, 0, 0]} len={L} color={C_FUERZA}
        label={<>F = {sci(F)} N{recortada ? " · flecha recortada" : ""}</>} lado={ancho ? "up" : "right"} />
      <Flecha base={[D - R_L - 0.1, 0, 0]} dir={[-1, 0, 0]} len={L} color={C_FUERZA} />
    </group>
  );
}

/** Caja del sistema Tierra–Luna, girado `incl` sobre Z: centro y medias medidas.
 *  Se mide lo que de verdad hay (dos discos, sus etiquetas y la cota), no un
 *  rectángulo, para que inclinar el eje sí ahorre espacio. */
function cajaFuerza(r: number, incl: number, dProb: number) {
  const D = dProb * (r / R_DEF);
  const yCota = -(R_E + 0.55);
  const c = Math.cos(incl), s = Math.sin(incl);
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  const punto = (x: number, y: number, rad = 0) => {
    const rx = x * c - y * s, ry = x * s + y * c;
    x0 = Math.min(x0, rx - rad); x1 = Math.max(x1, rx + rad); y0 = Math.min(y0, ry - rad); y1 = Math.max(y1, ry + rad);
  };
  punto(0, 0, R_E + 0.3);               // la Tierra (con su halo)
  punto(0, R_E + 0.75);                 // etiqueta «Tierra»
  punto(D, 0, R_L + 0.35);              // la Luna
  punto(D, R_L + 0.75);                 // etiqueta «Luna»
  punto(0, yCota - 0.35);               // la cota, de punta a punta
  punto(D, yCota - 0.35);
  return { centro: [(x0 + x1) / 2, (y0 + y1) / 2, 0] as Pt, medioAncho: (x1 - x0) / 2 + 0.3, medioAlto: (y1 - y0) / 2 + 0.15 };
}

function marcoFuerza(r: number, aspect: number, incl: number, angosta: boolean) {
  const k = cajaFuerza(r, incl, angosta ? D_PROBLEMA_CEL : D_PROBLEMA);
  if (angosta) {
    // En celular, la columna de herramientas tapa el borde derecho de arriba:
    // se reserva ese margen corriendo el sistema a la izquierda.
    const extra = 0.16 * k.medioAncho;
    return encuadrar([k.centro[0] + extra, k.centro[1], 0], k.medioAncho + extra, k.medioAlto, aspect);
  }
  return encuadrar(k.centro, k.medioAncho, k.medioAlto, aspect);
}

/**
 * Inclinación del eje Tierra–Luna en pantallas angostas: la que deja la cámara
 * más cerca con la distancia del problema (se fija por pantalla, no por r, para
 * que el sistema no gire al mover el deslizador). En computadora, 0.
 */
function inclinacionFuerza(aspect: number, angosta: boolean): number {
  if (!angosta) return 0;
  let mejor = 0, dMin = Infinity;
  // Hasta 25°: más inclinado, la Luna se va contra la barra y las herramientas.
  for (let g = 0; g <= 25; g += 2.5) {
    const d = marcoFuerza(R_DEF, aspect, g * DEG, true).distancia;
    if (d < dMin - 1e-6) { dMin = d; mejor = g * DEG; }
  }
  return mejor;
}

/* ════════════════════════════════════════════════════════════════════════════
   (b) MODO PESO — astronauta sobre una báscula, W = m·g
   ════════════════════════════════════════════════════════════════════════════ */
const U_POR_M = 1.15 / 1.85;          // el astronauta mide 1.85 m = 1.15 unidades
const RADIO_CUERPO: Record<string, number> = { luna: 2.4, marte: 2.6, tierra: 2.8, jupiter: 3.4 };
const SOL_PESO = new THREE.Vector3(-0.5, 0.7, 0.55).normalize();
const L_POR_N = 1.15 / 686;            // 686 N (70 kg en la Tierra) = 1.15 unidades

function largoPeso(w: number) { return Math.min(3.4, Math.max(0.06, w * L_POR_N)); }

function EscenaPeso({ cuerpoId, m, salto, ancho }: { cuerpoId: string; m: number; salto: number; ancho: boolean }) {
  const cuerpo = cuerpoPorId(cuerpoId);
  const { W, WTierra, kgf } = resolverPeso(m, cuerpo.g);
  const { tAire } = resolverSalto(cuerpo.g);
  const R = RADIO_CUERPO[cuerpo.id] ?? 2.6;
  const Lw = largoPeso(W);
  const Lt = largoPeso(WTierra);

  // Pantalla de la báscula: textura de canvas, se repinta al cambiar W.
  const pantalla = useMemo(() => crearPantallaBascula(), []);
  useEffect(() => () => pantalla.textura.dispose(), [pantalla]);
  const lecturaReposo = useRef({ p: "", s: "" });
  useEffect(() => {
    lecturaReposo.current = { p: `${fmt1(W)} N`, s: `masa ${fmt0(m)} kg · ${fmt1(kgf)} kgf` };
    pantalla.pintar(lecturaReposo.current.p, lecturaReposo.current.s, "#6dffc4");
  }, [pantalla, W, m, kgf]);

  // El salto: misma rapidez de despegue en todos los cuerpos, tiempo real.
  const saltador = useRef<THREE.Group>(null);
  const visto = useRef<number | null>(null);
  const inicio = useRef(-1);
  const enAire = useRef(false);
  useFrame((st) => {
    const g = saltador.current;
    if (!g) return;
    if (visto.current === null) visto.current = salto;
    if (salto !== visto.current) {
      visto.current = salto;
      inicio.current = st.clock.elapsedTime;
    }
    if (inicio.current < 0) return;
    const tau = st.clock.elapsedTime - inicio.current;
    if (tau >= tAire) {
      g.position.y = 0;
      inicio.current = -1;
      if (enAire.current) {
        enAire.current = false;
        pantalla.pintar(lecturaReposo.current.p, lecturaReposo.current.s, "#6dffc4");
      }
      return;
    }
    const v0 = (cuerpo.g * tAire) / 2;
    g.position.y = Math.max(0, v0 * tau - 0.5 * cuerpo.g * tau * tau) * U_POR_M;
    if (!enAire.current && tau > 0.02) {
      enAire.current = true;
      pantalla.pintar("0.0 N", "en el aire: caída libre", "#fbbf24");
    }
  });

  return (
    <group>
      {/* el cuerpo celeste: su cima es el suelo (y = 0) */}
      <group position={[0, -R, 0]}>
        {cuerpo.id === "tierra" ? (
          <group rotation={[-0.72, 0, 0]}>
            <group rotation={[0, GIRO_MEXICO, 0]}>
              <TierraFoto radio={R} dirSol={SOL_PESO} />
            </group>
          </group>
        ) : (
          <group rotation={[0.35, -0.6, 0]}>
            <CuerpoFoto textura={cuerpo.id === "marte" ? "marte" : cuerpo.id === "jupiter" ? "jupiter" : "luna"} radio={R} brilloNoche={0.08} />
          </group>
        )}
      </group>

      <Bascula pantalla={pantalla} />

      {/* el astronauta y su peso (la gravedad sigue actuando en el aire) */}
      <group ref={saltador}>
        <group position={[-0.08, 0.108, 0.04]}>
          <Astronauta />
        </group>
        <Flecha base={[-0.62, 0.62, 0.25]} dir={[0, -1, 0]} len={Lw} color={C_PESO} grosor={0.065}
          label={<>W = {fmt1(W)} N</>} lado="left" encima />
      </group>

      {/* fantasma: la misma masa en la Tierra */}
      {cuerpo.id !== "tierra" && (
        <Flecha base={[0.95, 0.62, 0.1]} dir={[0, -1, 0]} len={Lt} color={C_GHOST} grosor={0.045} opacidad={0.5}
          label={ancho ? <>en la Tierra: {fmt0(WTierra)} N</> : undefined} lado="right" encima />
      )}

      {ancho && (
        <Etiqueta position={[-1.7, -0.35, 0.6]} color={cuerpo.color} lado="left">
          {cuerpo.nombre} · g = {fmt2(cuerpo.g)} m/s²
        </Etiqueta>
      )}
    </group>
  );
}

function marcoPeso(cuerpoId: string, m: number, aspect: number) {
  const cuerpo = cuerpoPorId(cuerpoId);
  const { W } = resolverPeso(m, cuerpo.g);
  const { h } = resolverSalto(cuerpo.g);
  const arriba = Math.max(1.5, 1.2 + h * U_POR_M + 0.1);
  // La flecha puede asomar bajo la misión; lo que debe quedar a la vista es el astronauta.
  const abajo = Math.min(-1.0, 0.62 - largoPeso(W) * 0.7);
  return encuadrar([0.1, (arriba + abajo) / 2, 0], 1.9, (arriba - abajo) / 2, aspect);
}

/* ════════════════════════════════════════════════════════════════════════════
   (c) MODO ÓRBITA — Mexsat sobre México; la Tierra gira en un día sideral
   ════════════════════════════════════════════════════════════════════════════ */
const R_O = 1.5;                                   // radio de la Tierra en la escena
const SOL_ORBITA = new THREE.Vector3(-0.9, 0.18, 0.4).normalize();
const PSI0 = -Math.PI / 2 - MEXICO.lon * DEG + 0.45; // México un poco a la derecha del frente
const RADIO_HAZ = 0.55;                            // huella del haz sobre México (unidades)
const GEO_R = R_O * (R_TIERRA + ALT_GEO) / R_TIERRA;
const EEI_R = R_O * ORBITA_EEI.r / R_TIERRA;
const ARRIBA_SAT = new THREE.Vector3(0, 1.3, 0);
const ABAJO_ESTADO = new THREE.Vector3(0, -0.3, 0);
const ETQ_SAT = new THREE.Vector3(0, 1.15, 0);
const ROT_TIERRA_ORBITA: Pt = [0, PSI0, 0];

const VERT_HAZ = /* glsl */ `
  varying float vY;
  void main() { vY = position.y + 0.5; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const FRAG_HAZ = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpac;
  varying float vY;
  void main() { gl_FragColor = vec4(uColor, uOpac * (0.25 + 0.75 * (1.0 - vY))); }
`;

function anguloEnvuelto(a: number) {
  return Math.atan2(Math.sin(a), Math.cos(a));
}

function EscenaOrbita({ alt, playing, velocidad, vista, eei, ancho }: {
  alt: number; playing: boolean; velocidad: number; vista: VistaOrbita; eei: boolean; ancho: boolean;
}) {
  const orb = resolverOrbita(alt);
  const ringR = Math.min(13.5, R_O * (orb.r / R_TIERRA));   // proporcional al radio real

  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;

  const tierra = useRef<THREE.Group>(null);
  const sat = useRef<THREE.Group>(null);
  const estacion = useRef<THREE.Group>(null);
  const haz = useRef<THREE.Mesh>(null);
  const mexLabel = useRef<HTMLDivElement>(null);
  const estado = useRef<HTMLDivElement>(null);
  const pinMex = useRef<THREE.Mesh>(null);
  const grupoMex = useRef<THREE.Group>(null);
  const grupoEstado = useRef<THREE.Group>(null);
  const etqSat = useRef<HTMLDivElement>(null);
  const tam = useThree((st) => st.size);

  // Estado de la simulación (horas y ángulos), fuera de React.
  const sim = useRef({ t: 0, psi: PSI0, alfa: PSI0 + MEXSAT_LON * DEG, beta: 0, texto: "", vista: "espacio" as VistaOrbita, giro: 0 });

  const v = useMemo(() => ({
    sat: new THREE.Vector3(), mex: new THREE.Vector3(), apunta: new THREE.Vector3(), medio: new THREE.Vector3(),
    dir: new THREE.Vector3(), cam: new THREE.Vector3(), meta: new THREE.Vector3(), q: new THREE.Quaternion(),
  }), []);
  const uHaz = useMemo(() => ({ uColor: { value: new THREE.Color(C_ORBITA) }, uOpac: { value: 0.32 } }), []);

  const geo = orb.geo;
  const Th = orb.Th;

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const s = sim.current;
    const dh = playing ? dt * velocidad : 0;          // horas simuladas este cuadro
    const dPsi = (2 * Math.PI * dh) / T_SIDEREO_H;
    s.t += dh;
    s.psi += dPsi;
    // En la franja geoestacionaria el satélite acompaña a la Tierra (control de posición).
    s.alfa += geo ? dPsi : (2 * Math.PI * dh) / Th;
    s.beta += (2 * Math.PI * dh) / ORBITA_EEI.Th;

    if (tierra.current) tierra.current.rotation.y = s.psi;

    // Satélite en el plano ecuatorial, mirando a la Tierra.
    v.sat.set(ringR * Math.cos(s.alfa), 0, -ringR * Math.sin(s.alfa));
    if (sat.current) {
      sat.current.position.copy(v.sat);
      sat.current.lookAt(0, 0, 0);
    }
    if (estacion.current) {
      estacion.current.position.set(EEI_R * Math.cos(s.beta), 0, -EEI_R * Math.sin(s.beta));
      estacion.current.lookAt(0, 0, 0);
    }

    // Haz: el satélite apunta siempre igual respecto a sí mismo (hacia donde
    // estaría México si fuera geoestacionario). Solo en GEO cae sobre México.
    const subLon = anguloEnvuelto(s.alfa - s.psi);            // longitud del punto bajo el satélite (rad)
    const lonHaz = subLon / DEG + (MEXICO.lon - MEXSAT_LON);
    lonLat(lonHaz, MEXICO.lat, R_O, v.apunta).applyAxisAngle(UP, s.psi);
    lonLat(MEXICO.lon, MEXICO.lat, R_O * 1.004, v.mex).applyAxisAngle(UP, s.psi);
    const desvio = Math.abs(anguloEnvuelto(subLon - MEXSAT_LON * DEG)) / DEG;
    const senal = desvio < 7;
    if (haz.current) {
      v.dir.copy(v.sat).sub(v.apunta);
      const largo = v.dir.length();
      v.medio.copy(v.sat).add(v.apunta).multiplyScalar(0.5);
      haz.current.position.copy(v.medio);
      haz.current.quaternion.setFromUnitVectors(UP, v.dir.normalize());
      haz.current.scale.set(RADIO_HAZ, largo, RADIO_HAZ);
      const mh = haz.current.material as THREE.ShaderMaterial;
      (mh.uniforms.uColor!.value as THREE.Color).set(senal ? C_ORBITA : "#cbd5e1");
      mh.uniforms.uOpac!.value = senal ? 0.34 : 0.16;
    }

    // Vistas: girar con la Tierra, o ir montado detrás del satélite.
    if (vista !== s.vista) { s.vista = vista; s.giro = vista === "tierra" ? 1.8 : 0; }
    if (vista === "tierra" && controls) {
      let rot = dPsi;
      if (s.giro > 0) {
        // Al entrar, la cámara se acomoda frente a México (y al satélite).
        s.giro -= dt;
        const azMex = Math.atan2(-v.mex.z, v.mex.x) + 0.3;
        const azCam = Math.atan2(-camera.position.z, camera.position.x);
        rot += anguloEnvuelto(azMex - azCam) * (1 - Math.exp(-dt * 3));
      }
      if (rot !== 0) {
        camera.position.applyAxisAngle(UP, rot);
        controls.update();
      }
    } else if (vista === "satelite") {
      const k = 1 + 3.4 / ringR;
      v.cam.copy(v.sat).multiplyScalar(k).add(ARRIBA_SAT);
      camera.position.lerp(v.cam, 1 - Math.exp(-dt * 6));
      if (controls) controls.target.lerp(v.meta.set(0, 0, 0), 1 - Math.exp(-dt * 6));
      camera.lookAt(controls ? controls.target : v.meta.set(0, 0, 0));
    }

    // Etiqueta del Mexsat: si su caja se saldría del lienzo, se corre hacia dentro.
    const el = etqSat.current;
    if (el) {
      v.medio.copy(v.sat).add(ETQ_SAT).project(camera);
      const w = el.offsetWidth, h = el.offsetHeight;
      const px = ((v.medio.x + 1) / 2) * tam.width;
      const py = ((1 - v.medio.y) / 2) * tam.height;
      const izq = px - w / 2;
      const arriba = py - 0.7 * h - h / 2;
      const dy = Math.round(Math.max(0, 64 - arriba));
      // En celular, la columna de herramientas ocupa el borde derecho de arriba.
      const derecho = tam.width < 640 && arriba + dy < 170 ? tam.width - 64 : tam.width - 8;
      const dx = Math.round(Math.min(Math.max(izq, 8), Math.max(8, derecho - w)) - izq);
      const tr = `translate(${dx}px, calc(-70% + ${dy}px))`;
      if (el.style.transform !== tr) el.style.transform = tr;
    }

    // México: se ve solo del lado de la cámara.
    v.dir.copy(camera.position).sub(v.mex).normalize();
    const visible = v.mex.dot(v.dir) > 0.15;
    if (mexLabel.current) mexLabel.current.style.opacity = visible ? "1" : "0";
    if (grupoMex.current) grupoMex.current.position.copy(v.mex);
    if (pinMex.current) {
      pinMex.current.position.copy(v.mex);
      const mat = pinMex.current.material as THREE.MeshStandardMaterial;
      mat.emissive.set(senal ? C_ORBITA : C_MEXICO);
    }

    // Letrero de estado: en el punto del anillo más cercano a la cámara (abajo
    // en pantalla), sin re-render de React.
    if (grupoEstado.current) {
      v.cam.set(camera.position.x, 0, camera.position.z);
      if (v.cam.lengthSq() < 1e-6) v.cam.set(0, 0, 1);
      if (vista === "satelite") v.cam.set(0, -R_O - 0.3, 0);
      else v.cam.setLength(Math.min(ringR, 9)).add(ABAJO_ESTADO);
      grupoEstado.current.position.copy(v.cam);
    }
    const texto = ancho
      ? `${geo ? "GEOESTACIONARIA" : `T = ${fmt1(Th)} h`} · México ${senal ? "con señal" : "sin señal"} · t = ${fmt0(s.t)} h`
      : `México ${senal ? "con señal" : "sin señal"} · ${fmt0(s.t)} h`;
    if (estado.current && texto !== s.texto) {
      s.texto = texto;
      estado.current.textContent = texto;
      estado.current.style.color = senal ? C_ORBITA : "#e2e8f0";
      estado.current.style.borderColor = senal ? C_ORBITA : "#94a3b8";
    }
  });

  const colorAnillo = geo ? C_ORBITA : "#e2e8f0";

  return (
    <group>
      {/* la Tierra gira (día sideral); México lleva un marcador */}
      <group ref={tierra} rotation={ROT_TIERRA_ORBITA}>
        <TierraFoto radio={R_O} dirSol={SOL_ORBITA} />
      </group>
      <mesh ref={pinMex}>
        <sphereGeometry args={[0.045, 16, 12]} />
        <meshStandardMaterial color="#1f2937" emissive={C_MEXICO} emissiveIntensity={2.2} />
      </mesh>
      <group ref={grupoMex}>
        <Html center pointerEvents="none" zIndexRange={[20, 0]}>
          <div ref={mexLabel} style={{ transform: "translate(0,-26px)", transition: "opacity .3s" }}>
            <div style={{ ...CAJA, border: `1.5px solid ${C_MEXICO}`, color: C_MEXICO }}>México</div>
          </div>
        </Html>
      </group>

      {/* órbita actual (radio proporcional al real) y la geoestacionaria de referencia */}
      {vista !== "satelite" && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[ringR, geo ? 0.035 : 0.025, 8, 256]} />
          <meshBasicMaterial color={colorAnillo} transparent opacity={geo ? 0.85 : 0.5} />
        </mesh>
      )}
      {!geo && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[GEO_R, 0.018, 6, 256]} />
          <meshBasicMaterial color={C_ORBITA} transparent opacity={0.28} />
        </mesh>
      )}

      {/* el satélite y su haz */}
      <group ref={sat}>
        <Mexsat escala={0.62} />
        {vista !== "satelite" && (
          // Etiqueta que nunca se sale del borde: useFrame la corre hacia dentro.
          <Html position={[0, 1.15, 0]} center pointerEvents="none" zIndexRange={[20, 0]}>
            <div ref={etqSat} style={{ transform: DESPLAZA.up }}>
              <div style={{ ...CAJA, border: `1.5px solid ${C_ORBITA}`, color: C_ORBITA }}>
                {ancho ? `Mexsat · v = ${fmt2(orb.v / 1000)} km/s` : "Mexsat"}
              </div>
            </div>
          </Html>
        )}
      </group>
      <mesh ref={haz} raycast={() => null}>
        <cylinderGeometry args={[0.04, 1, 1, 40, 1, true]} />
        <shaderMaterial vertexShader={VERT_HAZ} fragmentShader={FRAG_HAZ} uniforms={uHaz}
          transparent depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
      </mesh>

      {/* comparación: la Estación Espacial Internacional en órbita baja */}
      {eei && (
        <group rotation={[INCL_EEI * DEG, 0, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[EEI_R, 0.014, 6, 200]} />
            <meshBasicMaterial color="#fde68a" transparent opacity={0.55} />
          </mesh>
          <group ref={estacion}>
            <EstacionEEI escala={0.34} />
            <Etiqueta position={[0, 0.25, 0]} color="#fde68a" lado="up">
              {ancho ? `EEI · 400 km · ${fmt0(ORBITA_EEI.Th * 60)} min` : "EEI"}
            </Etiqueta>
          </group>
        </group>
      )}

      {/* letrero de estado, bajo la Tierra */}
      <group ref={grupoEstado}>
      <Html center pointerEvents="none" zIndexRange={[20, 0]}>
        <div style={{ transform: DESPLAZA.down }}>
          {/* Sin hijos de React: el texto lo escribe useFrame (no hay choque con el DOM). */}
          <div ref={estado} style={{ ...CAJA, border: `1.5px solid ${C_ORBITA}`, color: C_ORBITA, minWidth: 40, minHeight: 20 }} />
        </div>
      </Html>
      </group>
    </group>
  );
}

function marcoOrbita(alt: number, aspect: number, ancho: boolean) {
  const orb = resolverOrbita(alt);
  const ringR = Math.min(13.5, R_O * (orb.r / R_TIERRA));
  const rr = Math.max(ringR, 3.2);
  // En celular se acepta que el anillo se salga un poco por los lados.
  const medioAncho = ancho ? rr + 0.9 : rr * 0.78;
  return encuadrar([0, 0, 0], medioAncho, Math.max(R_O + 1.6, rr * 0.42 + 0.8), aspect);
}

/* ── Luz de cada modo: el Sol (direccional) y reflejos suaves para los metales ── */
function Luces({ dirSol, sombras }: { dirSol: THREE.Vector3; sombras: boolean }) {
  const p = useMemo(() => dirSol.clone().multiplyScalar(12).toArray() as Pt, [dirSol]);
  return (
    <>
      <ambientLight intensity={0.06} />
      <hemisphereLight args={["#9fb7d8", "#0b0f18", 0.18]} />
      <directionalLight position={p} intensity={3.1} color="#fff6e8" castShadow={sombras}
        shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} shadow-normalBias={0.02}
        shadow-camera-left={-2.4} shadow-camera-right={2.4} shadow-camera-top={2.4} shadow-camera-bottom={-2.4}
        shadow-camera-near={1} shadow-camera-far={30} />
      <Environment resolution={128} environmentIntensity={0.7}>
        <Lightformer intensity={2.4} position={p} scale={[6, 6, 1]} color="#fff3dd" />
        <Lightformer intensity={0.5} position={[6, -3, -6]} scale={[10, 6, 1]} color="#6ea8ff" />
        <Lightformer intensity={0.3} position={[0, 8, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} color="#cfe0ff" />
      </Environment>
    </>
  );
}

/* ── Contenido (descendiente del Canvas) ─────────────────────────────────── */
function Contenido(props: GravitacionSceneProps & { ligero: boolean }) {
  const { modo, r, mareas, cuerpoId, m, salto, alt, playing, velocidad, vista, eei, resetNonce, ligero } = props;
  const size = useThree((st) => st.size);
  const ancho = size.width >= 640;
  const aspect = size.width / Math.max(1, size.height);
  const incl = modo === "fuerza" ? inclinacionFuerza(aspect, !ancho) : 0;
  const [debil, setDebil] = useState(false);

  const marco =
    modo === "fuerza" ? marcoFuerza(r, aspect, incl, !ancho)
    : modo === "peso" ? marcoPeso(cuerpoId, m, aspect)
    : marcoOrbita(alt, aspect, ancho);
  const dirCam: Pt = modo === "fuerza" ? [0, 0.2, 1] : modo === "peso" ? [0.22, 0.3, 1] : [0, 0.45, 1];
  const dirSol = modo === "fuerza" ? SOL_FUERZA : modo === "peso" ? SOL_PESO : SOL_ORBITA;

  return (
    <>
      <PerformanceMonitor onDecline={() => setDebil(true)} />
      <Luces dirSol={dirSol} sombras={modo === "peso"} />
      <ViaLactea brillo={0.75} />

      <Suspense fallback={null}>
        <group key={`${modo}-${resetNonce}`}>
          {modo === "fuerza" && <EscenaFuerza r={r} mareas={mareas} ancho={ancho} incl={incl} />}
          {modo === "peso" && <EscenaPeso cuerpoId={cuerpoId} m={m} salto={salto} ancho={ancho} />}
          {modo === "orbita" && <EscenaOrbita alt={alt} playing={playing} velocidad={velocidad} vista={vista} eei={eei} ancho={ancho} />}
        </group>
      </Suspense>

      <Guia objetivo={marco.objetivo} distancia={marco.distancia} dir={dirCam} activa={!(modo === "orbita" && vista === "satelite")} />

      <OrbitControls
        makeDefault
        enabled={!(modo === "orbita" && vista === "satelite")}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={modo === "peso" ? 2.5 : 4}
        maxDistance={modo === "orbita" ? 60 : 40}
        minPolarAngle={Math.PI / 10}
        maxPolarAngle={modo === "peso" ? Math.PI / 1.95 : Math.PI / 1.4}
      />

      {!ligero && !debil && (
        <EffectComposer enableNormalPass={false} multisampling={4}>
          <Bloom intensity={0.5} luminanceThreshold={0.82} luminanceSmoothing={0.2} mipmapBlur />
          <Vignette eskil={false} offset={0.25} darkness={0.5} />
        </EffectComposer>
      )}
    </>
  );
}

export default function GravitacionScene(props: GravitacionSceneProps) {
  // Celular / táctil: sin postproceso (las texturas ya bajan a 2K en el kit).
  const ligero = useMemo(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia?.("(pointer: coarse)").matches || window.innerWidth < 640;
  }, []);
  return (
    <Canvas key={props.modo} shadows dpr={[1, 1.75]} gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 4, 30], fov: FOV, near: 0.05, far: 5000 }}>
      <Contenido {...props} ligero={ligero} />
    </Canvas>
  );
}
