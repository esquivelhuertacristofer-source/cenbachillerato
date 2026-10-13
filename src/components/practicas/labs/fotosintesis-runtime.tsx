"use client";

/**
 * Piezas compartidas por las cuatro escalas del laboratorio de Fotosíntesis:
 *   · el estado de la simulación que se lee CADA CUADRO sin re-renderizar
 *     (luz, absorción, tasa, zoom…), suavizado para que nada brinque;
 *   · el grupo de cada escala, que se coloca, crece y se desvanece con el zoom;
 *   · los flujos de partículas instanciadas (moléculas, burbujas, electrones)
 *     y los fotones que se absorben o rebotan según su color.
 *
 * Regla de rendimiento: en `useFrame` no se crea ningún objeto de three; todo
 * lo temporal vive en referencias creadas una sola vez.
 */

import * as THREE from "three";
import { createContext, useContext, useMemo, useRef, type ReactNode, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { transformEscala, type TransformEscala } from "./fotosintesis-zoom";
import { azar, hash01 } from "./fotosintesis-geometrias";
import { ABSORCION_COLOR, type ColorLuz } from "./fotosintesis-data";

/* ── Estado vivo de la simulación ─────────────────────────────────────── */
export interface Sim {
  /** Zoom continuo: 0 planta … 3 tilacoide. */
  zoom: number;
  /** Intensidad de luz 0..1 (suavizada). */
  luz: number;
  /** Fracción de fotones que absorbe la clorofila con el color actual. */
  absorcion: number;
  /** Tasa fotosintética 0..1 (suavizada). */
  tasa: number;
  fCO2: number;
  fTemp: number;
  /** Apertura de los estomas 0..1. */
  apertura: number;
  /** Color de la luz (suavizado). */
  colorLuz: THREE.Color;
  colorId: ColorLuz;
  /** Paso de tiempo de este cuadro (0 en pausa) y tiempo acumulado. */
  dt: number;
  t: number;
  /** Equipo modesto: menos partículas. */
  pocos: boolean;
}

export function simInicial(): Sim {
  return {
    zoom: 0, luz: 0.7, absorcion: 0.64, tasa: 0.5, fCO2: 0.8, fTemp: 1, apertura: 0.8,
    colorLuz: new THREE.Color("#fff1d0"), colorId: "blanca", dt: 0, t: 0, pocos: false,
  };
}

export const SimCtx = createContext<RefObject<Sim> | null>(null);
export function useSim(): RefObject<Sim> {
  const s = useContext(SimCtx);
  if (!s) throw new Error("useSim fuera de SimCtx");
  return s;
}

/** Escala en la que vive un componente (para no animar lo que no se ve). */
export const EscalaCtx = createContext(0);

/** ¿La escala `k` se está viendo con este zoom? */
export const escalaActiva = (simRef: Sim, k: number) => Math.abs(simRef.zoom - k) < 1;

/* ── Grupo de una escala: posición, tamaño y desvanecido ──────────────── */
interface Base { op: number; tr: boolean }

function aplicarAlfa(raiz: THREE.Object3D, alfa: number) {
  raiz.traverse((o) => {
    const mats = (o as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
    if (!mats) return;
    const lista = Array.isArray(mats) ? mats : [mats];
    for (const m of lista) {
      const ud = m.userData as { __base?: Base; __alfa?: number };
      if (!ud.__base) ud.__base = { op: m.opacity, tr: m.transparent };
      ud.__alfa = alfa;
      const b = ud.__base;
      m.opacity = b.op * alfa;
      const tr = b.tr || alfa < 0.999;
      if (m.transparent !== tr) {
        m.transparent = tr;
        m.needsUpdate = true;
      }
    }
  });
}

export function GrupoEscala({ k, children }: { k: number; children: ReactNode }) {
  const simRef = useSim();
  const ref = useRef<THREE.Group>(null);
  const tr = useRef<TransformEscala>({ x: 0, y: 0, z: 0, escala: 1, alfa: 0 });
  const alfaPrevio = useRef(-1);

  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const t = transformEscala(k, simRef.current.zoom, tr.current);
    g.position.set(t.x, t.y, t.z);
    g.scale.setScalar(t.escala);
    g.visible = t.alfa > 0.004;
    // Solo se recorre el grafo cuando la opacidad cambia (durante el viaje).
    if (g.visible && Math.abs(t.alfa - alfaPrevio.current) > 0.002) {
      aplicarAlfa(g, t.alfa);
      alfaPrevio.current = t.alfa;
    }
  }, -1);

  return (
    <EscalaCtx.Provider value={k}>
      <group ref={ref} visible={k === 0}>
        {children}
      </group>
    </EscalaCtx.Provider>
  );
}

/**
 * Opacidad que una escena quiere cambiar en vivo (p. ej. un haz que brilla
 * con la luz) sin pelearse con el desvanecido del zoom.
 */
export function ponerOpacidad(m: THREE.Material, op: number) {
  const ud = m.userData as { __base?: Base; __alfa?: number };
  if (ud.__base) ud.__base.op = op;
  m.opacity = op * (ud.__alfa ?? 1);
}

/* ── Flujo de partículas a lo largo de curvas ─────────────────────────── */
export interface FlujoProps {
  curvas: THREE.Curve<THREE.Vector3>[];
  n: number;
  geometria: THREE.BufferGeometry;
  /** Material ya creado (se comparte entre instancias). */
  material: THREE.Material;
  /** Cuántas de las `n` partículas están vivas (0..1), leído cada cuadro. */
  caudal: (s: Sim) => number;
  /** Fracción de la curva por segundo. */
  velocidad?: number | ((s: Sim) => number);
  tam?: number;
  /** Desviación lateral aleatoria (unidades de la escena). */
  dispersion?: number;
  /** Orientar la partícula según la dirección de avance. */
  orientar?: boolean;
  /** Giro propio (rad/s), para que las moléculas den tumbos. */
  giro?: number;
  semilla?: number;
  /** Crecer al salir y encogerse al llegar. */
  aparecer?: boolean;
  sombras?: boolean;
}

export function Flujo({
  curvas, n, geometria, material, caudal, velocidad = 0.25, tam = 1, dispersion = 0, orientar = false,
  giro = 0, semilla = 1, aparecer = true, sombras = false,
}: FlujoProps) {
  const simRef = useSim();
  const k = useContext(EscalaCtx);
  const ref = useRef<THREE.InstancedMesh>(null);
  const est = useRef<ReturnType<typeof crear> | null>(null);
  const crear = () => {
    const r = azar(semilla);
    return {
      fase: Float32Array.from({ length: n }, () => r()),
      vel: Float32Array.from({ length: n }, () => 0.75 + r() * 0.5),
      curva: Uint16Array.from({ length: n }, (_, i) => (i + Math.floor(r() * 7)) % curvas.length),
      off: Array.from({ length: n }, () => new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).multiplyScalar(2)),
      eje: Array.from({ length: n }, () => new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize()),
      vivo: Uint8Array.from({ length: n }, () => 1),
      orden: Float32Array.from({ length: n }, (_, i) => (i + 0.5) / n),
    };
  };
  const tmp = useMemo(() => ({ o: new THREE.Object3D(), p: new THREE.Vector3(), d: new THREE.Vector3(), q: new THREE.Quaternion() }), []);

  useFrame(() => {
    const m = ref.current;
    const s = simRef.current;
    if (!m || !escalaActiva(s, k)) return;
    if (!est.current || est.current.fase.length !== n) est.current = crear();
    const estado = est.current;
    const c = Math.max(0, Math.min(1, caudal(s)));
    const v0 = typeof velocidad === "function" ? velocidad(s) : velocidad;
    const { o, p, d, q } = tmp;
    for (let i = 0; i < n; i++) {
      let f = estado.fase[i]! + s.dt * v0 * estado.vel[i]!;
      if (f >= 1) {
        f -= Math.floor(f);
        // Solo se enciende o apaga al volver al inicio: nada desaparece a medio camino.
        estado.vivo[i] = estado.orden[i]! < c ? 1 : 0;
      }
      estado.fase[i] = f;
      if (!estado.vivo[i]) {
        o.position.set(0, -9999, 0);
        o.scale.setScalar(0.0001);
        o.updateMatrix();
        m.setMatrixAt(i, o.matrix);
        continue;
      }
      const curva = curvas[estado.curva[i]!]!;
      curva.getPointAt(f, p);
      const env = Math.sin(Math.PI * f);
      p.addScaledVector(estado.off[i]!, dispersion * env);
      o.position.copy(p);
      if (orientar) {
        curva.getTangentAt(f, d);
        q.setFromUnitVectors(Z_POS, d);
        o.quaternion.copy(q);
      } else if (giro) {
        o.quaternion.setFromAxisAngle(estado.eje[i]!, s.t * giro * estado.vel[i]! + i);
      }
      const e = aparecer ? Math.min(1, env * 3.2) : 1;
      o.scale.setScalar(Math.max(0.0001, tam * e));
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={ref} args={[geometria, material, n]} frustumCulled={false} castShadow={sombras} />;
}

const Z_POS = new THREE.Vector3(0, 0, 1);

/* ── Fotones: llegan, y se absorben o rebotan según su color ──────────── */
export interface RutaFoton {
  de: THREE.Vector3;
  a: THREE.Vector3;
  /** Normal de la superficie donde pegan (para el rebote). */
  n: THREE.Vector3;
}

const ROJO = new THREE.Color("#ff4a3d");
const VERDE_F = new THREE.Color("#3ddc6a");
const AZUL_F = new THREE.Color("#4d7dff");

/** Color del fotón i: con luz blanca, la mezcla rojo / verde / azul. */
function colorFoton(id: ColorLuz, i: number): [THREE.Color, number] {
  if (id === "blanca") {
    const c = i % 3;
    return c === 0 ? [ROJO, ABSORCION_COLOR.roja] : c === 1 ? [VERDE_F, ABSORCION_COLOR.verde] : [AZUL_F, ABSORCION_COLOR.azul];
  }
  return id === "roja" ? [ROJO, ABSORCION_COLOR.roja] : id === "verde" ? [VERDE_F, ABSORCION_COLOR.verde] : [AZUL_F, ABSORCION_COLOR.azul];
}

export function Fotones({ rutas, n, tam = 1, velocidad = 0.55, rebote = 3, semilla = 3, grosor = 0.022, largo = 0.38, brillo = 1.7 }: {
  rutas: RutaFoton[]; n: number; tam?: number; velocidad?: number; rebote?: number; semilla?: number;
  /** Radio y largo de la estela; `brillo` > 1 la hace florecer con el bloom. */
  grosor?: number; largo?: number; brillo?: number;
}) {
  const simRef = useSim();
  const k = useContext(EscalaCtx);
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => {
    const g = new THREE.CapsuleGeometry(grosor, largo, 3, 6);
    g.rotateX(Math.PI / 2);
    return g;
  }, [grosor, largo]);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(brillo, brillo, brillo), toneMapped: false, transparent: true }), [brillo]);
  const est = useRef<ReturnType<typeof crear> | null>(null);
  const crear = () => {
    const r = azar(semilla);
    return {
      fase: Float32Array.from({ length: n }, () => r()),
      vel: Float32Array.from({ length: n }, () => 0.8 + r() * 0.4),
      ruta: Uint16Array.from({ length: n }, () => Math.floor(r() * rutas.length)),
      ciclo: Uint32Array.from({ length: n }, () => 0),
      vivo: Uint8Array.from({ length: n }, () => 1),
      orden: Float32Array.from({ length: n }, (_, i) => hash01(i * 977 + semilla)),
      colorPuesto: { id: "" as string },
    };
  };
  const tmp = useMemo(() => ({ o: new THREE.Object3D(), d: new THREE.Vector3(), r: new THREE.Vector3(), q: new THREE.Quaternion() }), []);

  useFrame(() => {
    const m = ref.current;
    const s = simRef.current;
    if (!m || !escalaActiva(s, k)) return;
    if (!est.current || est.current.fase.length !== n) est.current = crear();
    const estado = est.current;
    // Colores por instancia: solo cuando cambia el color de la luz.
    if (estado.colorPuesto.id !== s.colorId) {
      for (let i = 0; i < n; i++) m.setColorAt(i, colorFoton(s.colorId, i)[0]);
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
      estado.colorPuesto.id = s.colorId;
    }
    const { o, d, r, q } = tmp;
    const viaje = 0.7; // fracción del ciclo que tarda en llegar
    for (let i = 0; i < n; i++) {
      let f = estado.fase[i]! + s.dt * velocidad * estado.vel[i]!;
      if (f >= 1) {
        f -= Math.floor(f);
        estado.ciclo[i] = estado.ciclo[i]! + 1;
        estado.vivo[i] = estado.orden[i]! < s.luz ? 1 : 0;
        estado.ruta[i] = (estado.ruta[i]! + 7) % rutas.length;
      }
      estado.fase[i] = f;
      if (!estado.vivo[i]) {
        o.position.set(0, -9999, 0);
        o.scale.setScalar(0.0001);
        o.updateMatrix();
        m.setMatrixAt(i, o.matrix);
        continue;
      }
      const ru = rutas[estado.ruta[i]!]!;
      d.subVectors(ru.a, ru.de);
      const largo = d.length();
      d.divideScalar(largo);
      const absorbe = hash01(i * 131 + estado.ciclo[i]! * 7919) < colorFoton(s.colorId, i)[1];
      let esc = tam;
      if (f < viaje) {
        o.position.copy(ru.de).addScaledVector(d, largo * (f / viaje));
        q.setFromUnitVectors(Z_POS, d);
      } else {
        const g = (f - viaje) / (1 - viaje);
        if (absorbe) {
          // Se hunde en la clorofila y se apaga.
          o.position.copy(ru.a).addScaledVector(d, 0.08 * g);
          q.setFromUnitVectors(Z_POS, d);
          esc = tam * Math.max(0, 1 - g * 3.5);
        } else {
          // Rebota: reflexión especular r = d − 2(d·n)n.
          r.copy(d).addScaledVector(ru.n, -2 * d.dot(ru.n)).normalize();
          o.position.copy(ru.a).addScaledVector(r, rebote * g);
          q.setFromUnitVectors(Z_POS, r);
          esc = tam * (1 - g * 0.35);
        }
      }
      o.quaternion.copy(q);
      o.scale.setScalar(Math.max(0.0001, esc));
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={ref} args={[geo, mat, n]} frustumCulled={false} />;
}

/* ── Etiqueta en la escena (≥ 14 px; máx. 4 a la vez) ─────────────────── */
export function Etiqueta({ pos, color, texto, icono, visible }: { pos: [number, number, number]; color: string; texto: string; icono?: string; visible: boolean }) {
  if (!visible) return null;
  return (
    <Html position={pos} center pointerEvents="none" zIndexRange={[20, 0]}>
      <div
        style={{
          display: "inline-flex", alignItems: "center", gap: 7, whiteSpace: "nowrap", padding: "6px 11px",
          borderRadius: 999, background: "rgba(3,12,22,0.82)", border: `1px solid ${color}88`,
          color: "#f1f7f3", fontSize: 14, fontWeight: 800, boxShadow: "0 6px 18px -8px rgba(0,0,0,0.8)",
          backdropFilter: "blur(6px)", animation: "fsEtq .45s ease both",
        }}
      >
        <style>{"@keyframes fsEtq{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}"}</style>
        {icono && <i className={`fa-solid ${icono}`} style={{ color }} aria-hidden />}
        {texto}
      </div>
    </Html>
  );
}

/** Curva recta (para flujos que no necesitan curvarse). */
export function recta(a: [number, number, number], b: [number, number, number]): THREE.LineCurve3 {
  return new THREE.LineCurve3(new THREE.Vector3(...a), new THREE.Vector3(...b));
}

/** Curva suave por varios puntos. */
export function curva(...pts: [number, number, number][]): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
}
