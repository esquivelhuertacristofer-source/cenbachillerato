"use client";

/**
 * Escena 3D del laboratorio "Difusión digital: el alcance de una publicación"
 * (CD-III-P02). Tres vistas:
 *
 *  - cascada: la red de 150 cuentas en seis grupos. La publicación sale de la
 *    cuenta de origen y cada exposición viaja por una arista como un pulso; las
 *    personas cambian de color al verla, reaccionar o compartir. Al fondo, un
 *    marcador con tres columnas (alcance, impresiones, interacciones) que crece
 *    con la cascada.
 *  - campana: la plaza de la comunidad. Seis canales al centro (WhatsApp,
 *    Facebook, TikTok, radio, cartel, sitio web) y cinco grupos alrededor, cada
 *    uno con una persona ciega y una sorda. Los canales elegidos lanzan arcos a
 *    cada grupo y se iluminan las personas a las que el mensaje llega y entienden.
 *  - rumor: la misma red, con dos mensajes compitiendo: el rumor (rojo) y el
 *    dato verificado (cian). Marcador con dos columnas.
 *
 * Toda animación ocurre en useFrame mutando refs y avanza por tiempo real. NO
 * se usa <Text> de drei (cuelga el chunk con Turbopack): el texto va en <Html>.
 */

import * as THREE from "three";
import { useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Escenario } from "./_escenario";
import {
  type Modo,
  type Exposicion,
  type SegmentoId,
  type CanalId,
  type AccesoId,
  RED,
  GRUPOS,
  N_PERSONAS,
  ID_ESCUELA,
  ID_INFLUENCER,
  ID_SALUD,
  ID_TU,
  ID_MAESTRA,
  ID_VECINA,
  DUR_PULSO,
  SEGMENTOS,
  CANALES,
  coberturaSegmento,
  RUMOR,
  esPublica,
  puedePasar,
  num,
} from "./alcance-publicacion-data";

export interface AlcanceSceneProps {
  vista: Modo;
  modoColor: string;
  resetNonce: number;
  // Cascada
  origenNodo: number;
  eventosCascada: Exposicion[] | null;
  nonceCascada: number;
  // Campaña
  audienciaCaso: SegmentoId[];
  canales: CanalId[];
  accesos: AccesoId[];
  lanzada: boolean;
  nonceCampana: number;
  // Rumor
  fuenteNodo: number;
  eventosRumor: Exposicion[] | null;
  nonceRumor: number;
}

type Pt = [number, number, number];

const OK = "#34d399";
const GRIS = "#3b4a60";

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

/* ════════════════════════════════════════════════════════════════════════
 * RED (vistas cascada y rumor)
 * ════════════════════════════════════════════════════════════════════════ */

const GEO_NODO = new THREE.SphereGeometry(1, 16, 12);
const GEO_PULSO = new THREE.SphereGeometry(1, 8, 6);
const MAX_PULSOS = 700;

const INDICE_ARISTA = new Map<string, number>();
RED.aristas.forEach(([a, b], i) => INDICE_ARISTA.set(`${a}-${b}`, i));
const claveArista = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`);

function geometriaAristas() {
  const pos = new Float32Array(RED.aristas.length * 6);
  const col = new Float32Array(RED.aristas.length * 6);
  RED.aristas.forEach(([a, b], i) => {
    const pa = RED.nodos[a]!.pos;
    const pb = RED.nodos[b]!.pos;
    pos.set([pa[0], pa[1], pa[2], pb[0], pb[1], pb[2]], i * 6);
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  return g;
}

/** Radio visual de cada nodo según sus contactos. */
const RADIO_NODO = RED.vecinos.map((v, i) => (esPublica(i) ? 0.2 + Math.sqrt(v.length) * 0.022 : 0.085 + Math.sqrt(v.length) * 0.017));

const COL_BASE_ARISTA = new THREE.Color("#1d3350");
const COL_NODO: Record<string, THREE.Color> = {
  gris: new THREE.Color(GRIS),
  vio: new THREE.Color("#60a5fa"),
  reacciona: new THREE.Color("#fbbf24"),
  comparte: new THREE.Color(OK),
  rumor: new THREE.Color("#f43f5e"),
  dato: new THREE.Color("#22d3ee"),
  corregido: new THREE.Color("#a78bfa"),
  publica: new THREE.Color("#e2e8f0"),
};

const CENTRO_GRUPO = GRUPOS.map((_, g) => {
  const ang = (g / GRUPOS.length) * Math.PI * 2;
  return [Math.cos(ang), Math.sin(ang)] as [number, number];
});

function RedDifusion({
  variante,
  eventos,
  nonce,
  origenes,
  fuente,
  modoColor,
}: {
  variante: "cascada" | "rumor";
  eventos: Exposicion[] | null;
  nonce: number;
  origenes: number[];
  fuente: number;
  modoColor: string;
}) {
  const nodos = useRef<THREE.InstancedMesh>(null);
  const pulsos = useRef<THREE.InstancedMesh>(null);
  const lineas = useRef<THREE.LineSegments>(null);
  const reloj = useRef(0);
  const ultimoNonce = useRef(-1);
  const geoAristas = useMemo(() => geometriaAristas(), []);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const tmp = useMemo(() => new THREE.Color(), []);
  const colPulsoA = useMemo(() => new THREE.Color(variante === "rumor" ? "#fb7185" : "#e0f2fe"), [variante]);
  const colPulsoB = useMemo(() => new THREE.Color("#67e8f9"), []);
  const colOrigen = useMemo(() => new THREE.Color(modoColor), [modoColor]);
  // Marcador del fondo
  const barras = useRef<(THREE.Mesh | null)[]>([]);
  const lecturas = useRef<(HTMLSpanElement | null)[]>([]);
  const columnas =
    variante === "cascada"
      ? [
          { etq: "Alcance", col: "#60a5fa" },
          { etq: "Impresiones", col: "#a78bfa" },
          { etq: "Interacciones", col: "#fbbf24" },
        ]
      : [
          { etq: "Creen el rumor", col: "#f43f5e" },
          { etq: "Dato verificado", col: "#22d3ee" },
        ];

  useFrame(({ clock }, dt) => {
    if (ultimoNonce.current !== nonce) {
      ultimoNonce.current = nonce;
      reloj.current = 0;
    }
    reloj.current += Math.min(dt, 1);
    const t = reloj.current;
    const lista = eventos ?? [];

    // Estado de cada nodo al tiempo t
    const estado = new Array<number>(N_PERSONAS).fill(0);
    const llegada = new Array<number>(N_PERSONAS).fill(-10);
    const activa = new Array<number>(RED.aristas.length).fill(0);
    let alcance = 0;
    let impresiones = 0;
    let interacciones = 0;
    if (variante === "rumor" && lista.length > 0) for (const o of RUMOR.origenes) estado[o] = 1;
    for (const e of lista) {
      const fin = e.t + DUR_PULSO;
      if (e.t > t) break;
      const ia = INDICE_ARISTA.get(claveArista(e.de, e.a));
      if (ia !== undefined) activa[ia] = Math.max(activa[ia]!, t < fin ? 1 : 0.28);
      if (t < fin) continue;
      if (variante === "cascada") {
        impresiones++;
        if (e.nueva) {
          alcance++;
          estado[e.a] = e.comparte ? 3 : e.reacciona ? 2 : 1;
          llegada[e.a] = fin;
          if (e.reacciona) interacciones++;
        }
      } else if (e.nueva && e.estado !== undefined && puedePasar(estado[e.a]!, e.estado)) {
        estado[e.a] = e.estado;
        llegada[e.a] = fin;
      }
    }
    // Nodos
    const mesh = nodos.current;
    if (mesh) {
      for (let i = 0; i < N_PERSONAS; i++) {
        const p = RED.nodos[i]!.pos;
        const r = RADIO_NODO[i]!;
        const esOrigen = origenes.includes(i) || i === fuente;
        const pop = llegada[i]! > 0 ? 1 + 0.9 * Math.exp(-(t - llegada[i]!) * 5) : 1;
        const late = esOrigen ? 1 + 0.18 * Math.sin(clock.elapsedTime * 4) : 1;
        obj.position.set(p[0], p[1], p[2]);
        obj.scale.setScalar(r * pop * late);
        obj.updateMatrix();
        mesh.setMatrixAt(i, obj.matrix);
        let c: THREE.Color;
        if (variante === "cascada") {
          c = estado[i] === 3 ? COL_NODO.comparte! : estado[i] === 2 ? COL_NODO.reacciona! : estado[i] === 1 ? COL_NODO.vio! : esPublica(i) ? COL_NODO.publica! : COL_NODO.gris!;
          if (i === origenes[0]) c = colOrigen;
        } else {
          c = estado[i] === 1 ? COL_NODO.rumor! : estado[i] === 2 ? COL_NODO.dato! : estado[i] === 3 ? COL_NODO.corregido! : esPublica(i) ? COL_NODO.publica! : COL_NODO.gris!;
        }
        mesh.setColorAt(i, c);
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }

    // Aristas
    const ls = lineas.current;
    if (ls) {
      const attr = ls.geometry.getAttribute("color") as THREE.BufferAttribute;
      for (let i = 0; i < RED.aristas.length; i++) {
        const k = activa[i]!;
        tmp.copy(COL_BASE_ARISTA).lerp(variante === "rumor" ? COL_NODO.rumor! : COL_NODO.vio!, k * 0.85);
        attr.setXYZ(i * 2, tmp.r, tmp.g, tmp.b);
        attr.setXYZ(i * 2 + 1, tmp.r, tmp.g, tmp.b);
      }
      attr.needsUpdate = true;
    }

    // Pulsos viajando
    const pm = pulsos.current;
    if (pm) {
      let n = 0;
      for (const e of lista) {
        if (e.t > t) break;
        if (t >= e.t + DUR_PULSO || n >= MAX_PULSOS) continue;
        const f = (t - e.t) / DUR_PULSO;
        const a = RED.nodos[e.de]!.pos;
        const b = RED.nodos[e.a]!.pos;
        obj.position.set(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f + Math.sin(f * Math.PI) * 0.35, a[2] + (b[2] - a[2]) * f);
        obj.scale.setScalar(0.07);
        obj.updateMatrix();
        pm.setMatrixAt(n, obj.matrix);
        pm.setColorAt(n, e.tipo === 1 ? colPulsoB : colPulsoA);
        n++;
      }
      for (let k = n; k < MAX_PULSOS; k++) {
        obj.position.set(0, -50, 0);
        obj.scale.setScalar(0.0001);
        obj.updateMatrix();
        pm.setMatrixAt(k, obj.matrix);
      }
      pm.instanceMatrix.needsUpdate = true;
      if (pm.instanceColor) pm.instanceColor.needsUpdate = true;
    }

    // Marcador
    let valores: number[];
    if (variante === "cascada") valores = [alcance, impresiones, interacciones];
    else {
      let cree = 0;
      let dato = 0;
      for (let i = 0; i < N_PERSONAS; i++) {
        if (esPublica(i)) continue;
        if (estado[i] === 1) cree++;
        else if (estado[i] === 2 || estado[i] === 3) dato++;
      }
      valores = [cree, dato];
    }
    valores.forEach((v, k) => {
      const barra = barras.current[k];
      const alto = Math.max(0.02, v * 0.011);
      if (barra) {
        const actual = barra.scale.y;
        const nuevo = actual + (alto - actual) * (1 - Math.pow(1 - 0.15, Math.min(dt, 0.25) * 60));
        barra.scale.y = nuevo;
        barra.position.y = 0.08 + nuevo / 2;
      }
      const l = lecturas.current[k];
      if (l) l.textContent = num(v);
    });
  });

  // Colores iniciales para que existan los atributos de instancia.
  const initNodos = (m: THREE.InstancedMesh | null) => {
    nodos.current = m;
    if (m && !m.instanceColor) for (let i = 0; i < N_PERSONAS; i++) m.setColorAt(i, COL_NODO.gris!);
  };
  const initPulsos = (m: THREE.InstancedMesh | null) => {
    pulsos.current = m;
    if (m && !m.instanceColor) for (let i = 0; i < MAX_PULSOS; i++) m.setColorAt(i, COL_NODO.vio!);
  };

  const etiquetasNodo: { id: number; etq: string; icono: string; col: string }[] =
    variante === "cascada"
      ? [
          { id: ID_TU, etq: "Tu cuenta", icono: "fa-user", col: "#38bdf8" },
          { id: ID_ESCUELA, etq: "Página de la escuela", icono: "fa-school", col: "#e2e8f0" },
          { id: ID_INFLUENCER, etq: "Creadora local", icono: "fa-star", col: "#f472b6" },
        ]
      : [
          { id: RUMOR.origenes[0]!, etq: "Cadena reenviada", icono: "fa-share", col: "#f43f5e" },
          ...(fuente === ID_SALUD ? [{ id: ID_SALUD, etq: "Centro de salud", icono: "fa-house-medical", col: "#22d3ee" }] : []),
          ...(fuente === ID_MAESTRA ? [{ id: ID_MAESTRA, etq: "Maestra de biología", icono: "fa-person-chalkboard", col: "#22d3ee" }] : []),
          ...(fuente === ID_VECINA ? [{ id: ID_VECINA, etq: "Vecina", icono: "fa-user", col: "#22d3ee" }] : []),
        ];

  const anchoMarcador = columnas.length === 3 ? 1.3 : 1.6;
  return (
    <group position={[0, -0.6, 0.4]}>
      {/* Suelo e islas de los grupos */}
      <mesh position={[0, -0.32, 0]} receiveShadow>
        <cylinderGeometry args={[6.6, 6.6, 0.1, 64]} />
        <meshStandardMaterial color="#0c1728" roughness={0.95} />
      </mesh>
      {GRUPOS.map((g, k) => {
        const [cx, cz] = CENTRO_GRUPO[k]!;
        return (
          <group key={g.id}>
            <mesh position={[cx * 4.3, -0.24, cz * 4.3]} receiveShadow>
              <cylinderGeometry args={[1.62, 1.7, 0.08, 6]} />
              <meshStandardMaterial color={g.color} roughness={0.6} transparent opacity={0.22} />
            </mesh>
            <Etiqueta pos={[cx * 6.05, -0.1, cz * 6.05]} df={12} fs={11} col={`${g.color}99`}>
              <i className={`fa-solid ${g.icono}`} style={{ color: g.color }} />
              {g.etq}
            </Etiqueta>
          </group>
        );
      })}
      <lineSegments ref={lineas} geometry={geoAristas}>
        <lineBasicMaterial vertexColors transparent opacity={0.85} />
      </lineSegments>
      <instancedMesh ref={initNodos} args={[GEO_NODO, undefined, N_PERSONAS]} castShadow frustumCulled={false}>
        <meshStandardMaterial roughness={0.35} metalness={0.1} emissive="#0b1220" />
      </instancedMesh>
      <instancedMesh ref={initPulsos} args={[GEO_PULSO, undefined, MAX_PULSOS]} frustumCulled={false}>
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      {etiquetasNodo.map((e) => {
        const p = RED.nodos[e.id]!.pos;
        const on = origenes.includes(e.id) || e.id === fuente;
        return (
          <Etiqueta key={e.id} pos={[p[0], p[1] + RADIO_NODO[e.id]! + 0.42, p[2]]} df={10} fs={on ? 12 : 10.5} col={on ? `${e.col}` : "rgba(255,255,255,0.2)"}>
            <i className={`fa-solid ${e.icono}`} style={{ color: e.col }} />
            {e.etq}
            <span style={{ color: "rgba(255,255,255,0.55)", fontWeight: 700 }}>· {RED.vecinos[e.id]!.length}</span>
          </Etiqueta>
        );
      })}

      {/* Marcador */}
      <group position={[7.3, -0.3, -4.0]} rotation={[0, -0.45, 0]}>
        <mesh position={[0, 0.04, 0]} receiveShadow>
          <boxGeometry args={[columnas.length * anchoMarcador + 0.5, 0.08, 1.2]} />
          <meshStandardMaterial color="#13223a" roughness={0.6} />
        </mesh>
        {columnas.map((c, k) => {
          const x = (k - (columnas.length - 1) / 2) * anchoMarcador;
          return (
            <mesh
              key={c.etq}
              position={[x, 0.08, 0]}
              scale={[1, 0.02, 1]}
              ref={(m) => {
                barras.current[k] = m;
              }}
            >
              <boxGeometry args={[0.72, 1, 0.72]} />
              <meshStandardMaterial color={c.col} emissive={c.col} emissiveIntensity={0.35} roughness={0.35} />
            </mesh>
          );
        })}
        <Html position={[0, 3.5, 0]} center distanceFactor={12} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          <div style={{ display: "grid", gap: 3, padding: "7px 11px", borderRadius: 10, background: "rgba(4,10,22,0.88)", border: "1px solid rgba(255,255,255,0.2)", whiteSpace: "nowrap" }}>
            {columnas.map((c, k) => (
              <div key={c.etq} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, fontWeight: 800, color: "#fff" }}>
                <span style={{ width: 9, height: 9, borderRadius: 2, background: c.col }} />
                {c.etq}
                <span
                  ref={(el) => {
                    lecturas.current[k] = el;
                  }}
                  style={{ marginLeft: "auto", paddingLeft: 10, fontVariantNumeric: "tabular-nums" }}
                >
                  0
                </span>
              </div>
            ))}
          </div>
        </Html>
      </group>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * CAMPAÑA COMUNITARIA
 * ════════════════════════════════════════════════════════════════════════ */

const R_CANAL = 2.05;
const R_SEG = 5.0;
const N_FIG = 10;
const GEO_CUERPO = new THREE.CapsuleGeometry(0.11, 0.3, 4, 10);
const GEO_CABEZA = new THREE.SphereGeometry(0.1, 12, 10);

const posCanal = (k: number): Pt => {
  const a = Math.PI / 2 + (k / CANALES.length) * Math.PI * 2 + Math.PI / CANALES.length;
  return [Math.cos(a) * R_CANAL, 0, Math.sin(a) * R_CANAL];
};
const angSeg = (k: number) => -Math.PI / 2 + (k / SEGMENTOS.length) * Math.PI * 2;
const posSeg = (k: number, r = R_SEG): Pt => [Math.cos(angSeg(k)) * r, 0, Math.sin(angSeg(k)) * r];

/** Posición de la figura f del grupo k (dos filas de cinco, mirando al centro). */
function posFigura(k: number, f: number): Pt {
  const a = angSeg(k);
  const fila = f < 5 ? 0 : 1;
  const col = f % 5;
  const r = R_SEG - 0.55 + fila * 0.42;
  const tang = (col - 2) * 0.36;
  return [Math.cos(a) * r - Math.sin(a) * tang, 0, Math.sin(a) * r + Math.cos(a) * tang];
}

function ObjetoCanal({ id, color, on }: { id: CanalId; color: string; on: boolean }) {
  const em = on ? 0.9 : 0.05;
  const base = on ? color : "#475569";
  if (id === "radio")
    return (
      <group>
        {[0, 1, 2].map((k) => {
          const a = (k / 3) * Math.PI * 2;
          return (
            <mesh key={k} position={[Math.cos(a) * 0.14, 0.75, Math.sin(a) * 0.14]} rotation={[Math.sin(a) * 0.16, 0, -Math.cos(a) * 0.16]}>
              <cylinderGeometry args={[0.025, 0.035, 1.5, 6]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.7} roughness={0.3} />
            </mesh>
          );
        })}
        <mesh position={[0, 1.58, 0]}>
          <sphereGeometry args={[0.09, 14, 10]} />
          <meshStandardMaterial color={base} emissive={base} emissiveIntensity={on ? 2 : 0.1} />
        </mesh>
      </group>
    );
  if (id === "cartel")
    return (
      <group>
        {[-0.3, 0.3].map((x) => (
          <mesh key={x} position={[x, 0.45, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.9, 8]} />
            <meshStandardMaterial color="#78716c" />
          </mesh>
        ))}
        <mesh position={[0, 0.95, 0]}>
          <boxGeometry args={[0.8, 0.6, 0.05]} />
          <meshStandardMaterial color={on ? "#fde68a" : "#64748b"} emissive={base} emissiveIntensity={em * 0.3} />
        </mesh>
        <mesh position={[0, 1.05, 0.03]}>
          <boxGeometry args={[0.6, 0.12, 0.01]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
      </group>
    );
  if (id === "web" || id === "facebook")
    return (
      <group>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.05, 0.12, 0.7, 10]} />
          <meshStandardMaterial color="#334155" metalness={0.5} />
        </mesh>
        <mesh position={[0, 0.9, 0]}>
          <boxGeometry args={id === "web" ? [0.85, 0.55, 0.06] : [0.62, 0.8, 0.06]} />
          <meshStandardMaterial color="#1e293b" metalness={0.4} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.9, 0.035]}>
          <planeGeometry args={id === "web" ? [0.77, 0.47] : [0.54, 0.72]} />
          <meshStandardMaterial color={base} emissive={base} emissiveIntensity={em} toneMapped={false} />
        </mesh>
      </group>
    );
  // whatsapp / tiktok: celular de pie
  return (
    <group>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.12, 16]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[0, 0.82, 0]}>
        <boxGeometry args={[0.42, 0.82, 0.06]} />
        <meshStandardMaterial color="#0f172a" metalness={0.5} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.82, 0.035]}>
        <planeGeometry args={[0.36, 0.72]} />
        <meshStandardMaterial color={base} emissive={base} emissiveIntensity={em} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Edificio({ id, color }: { id: SegmentoId; color: string }) {
  if (id === "rural")
    return (
      <group>
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[0.8, 0.6, 0.7]} />
          <meshStandardMaterial color="#b45309" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.78, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[0.66, 0.4, 4]} />
          <meshStandardMaterial color="#78350f" roughness={0.8} />
        </mesh>
        <mesh position={[0.85, 0.5, 0.1]}>
          <coneGeometry args={[0.3, 0.9, 8]} />
          <meshStandardMaterial color="#166534" roughness={0.8} />
        </mesh>
        <mesh position={[0.85, 0.05, 0.1]}>
          <cylinderGeometry args={[0.05, 0.05, 0.2, 6]} />
          <meshStandardMaterial color="#713f12" />
        </mesh>
      </group>
    );
  if (id === "estudiantes" || id === "docentes")
    return (
      <group>
        <mesh position={[0, 0.42, 0]} castShadow>
          <boxGeometry args={[id === "docentes" ? 1.0 : 1.5, 0.84, 0.7]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.9, 0]}>
          <boxGeometry args={[id === "docentes" ? 1.1 : 1.6, 0.1, 0.8]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
        {[-0.45, 0, 0.45].map((x) => (
          <mesh key={x} position={[id === "docentes" ? x * 0.6 : x, 0.5, 0.36]}>
            <boxGeometry args={[0.24, 0.24, 0.02]} />
            <meshStandardMaterial color="#7dd3fc" emissive="#7dd3fc" emissiveIntensity={0.3} />
          </mesh>
        ))}
        {id === "estudiantes" && (
          <mesh position={[0, 1.25, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.6, 6]} />
            <meshStandardMaterial color="#cbd5e1" />
          </mesh>
        )}
      </group>
    );
  return (
    <group>
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[1.0, 0.7, 0.75]} />
        <meshStandardMaterial color={id === "mayores" ? "#fef3c7" : "#fde68a"} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.9, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.78, 0.45, 4]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.22, 0.38]}>
        <boxGeometry args={[0.2, 0.42, 0.02]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
    </group>
  );
}

function EscenaCampana({
  audienciaCaso,
  canales,
  accesos,
  lanzada,
  nonce,
  modoColor,
}: {
  audienciaCaso: SegmentoId[];
  canales: CanalId[];
  accesos: AccesoId[];
  lanzada: boolean;
  nonce: number;
  modoColor: string;
}) {
  const acc = useMemo(() => new Set(accesos), [accesos]);
  const cuerpos = useRef<THREE.InstancedMesh>(null);
  const cabezas = useRef<THREE.InstancedMesh>(null);
  const puntos = useRef<THREE.InstancedMesh>(null);
  const arcosRef = useRef<THREE.Group>(null);
  const reloj = useRef(0);
  const ultimo = useRef(-1);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const tmp = useMemo(() => new THREE.Color(), []);
  const gris = useMemo(() => new THREE.Color("#475569"), []);
  const colSeg = useMemo(() => SEGMENTOS.map((s) => new THREE.Color(s.color)), []);
  const blanco = useMemo(() => new THREE.Color("#ffffff"), []);

  // Cobertura por grupo: general, ciegas y sordas.
  const cob = useMemo(
    () =>
      SEGMENTOS.map((s) => ({
        general: coberturaSegmento(s.id, canales, acc),
        ciegas: coberturaSegmento(s.id, canales, acc, "ciegas"),
        sordas: coberturaSegmento(s.id, canales, acc, "sordas"),
      })),
    [canales, acc],
  );

  // Arcos canal → grupo
  const arcos = useMemo(() => {
    const lista: { curva: THREE.QuadraticBezierCurve3; geo: THREE.TubeGeometry; color: string; fuerza: number }[] = [];
    canales.forEach((cid) => {
      const kc = CANALES.findIndex((c) => c.id === cid);
      const canal = CANALES[kc]!;
      const [cx, , cz] = posCanal(kc);
      SEGMENTOS.forEach((s, ks) => {
        const [sx, , sz] = posSeg(ks, R_SEG - 0.2);
        const a = new THREE.Vector3(cx, 1.5, cz);
        const b = new THREE.Vector3(sx, 0.9, sz);
        const m = a.clone().lerp(b, 0.5);
        m.y = 3.1;
        const curva = new THREE.QuadraticBezierCurve3(a, m, b);
        const fuerza = canal.cobertura[s.id];
        lista.push({ curva, geo: new THREE.TubeGeometry(curva, 36, 0.012 + fuerza * 0.05, 6, false), color: canal.color, fuerza });
      });
    });
    return lista;
  }, [canales]);

  useFrame((_, dt) => {
    if (ultimo.current !== nonce) {
      ultimo.current = nonce;
      reloj.current = 0;
    }
    reloj.current += Math.min(dt, 1);
    const t = lanzada ? reloj.current : 0;
    const crece = Math.min(1, t / 1.2);
    const luz = Math.min(1, Math.max(0, (t - 1.0) / 1.4));

    const g = arcosRef.current;
    if (g) {
      g.children.forEach((c) => {
        c.visible = lanzada && crece > 0;
        const mat = (c as THREE.Mesh).material as THREE.MeshBasicMaterial;
        const fuerza = Number(c.userData.fuerza ?? 0);
        mat.opacity = (0.18 + fuerza * 0.6) * crece;
      });
    }
    const pm = puntos.current;
    if (pm) {
      let n = 0;
      arcos.forEach((a, i) => {
        for (let k = 0; k < 3; k++) {
          const f = (t * (0.35 + a.fuerza * 0.4) + k / 3 + i * 0.07) % 1;
          const p = a.curva.getPoint(f);
          obj.position.copy(p);
          obj.scale.setScalar(lanzada ? 0.05 + a.fuerza * 0.05 : 0.0001);
          obj.updateMatrix();
          pm.setMatrixAt(n++, obj.matrix);
        }
      });
      for (let k = n; k < 40; k++) {
        obj.position.set(0, -50, 0);
        obj.scale.setScalar(0.0001);
        obj.updateMatrix();
        pm.setMatrixAt(k, obj.matrix);
      }
      pm.instanceMatrix.needsUpdate = true;
    }

    const cm = cuerpos.current;
    const hm = cabezas.current;
    if (cm && hm) {
      SEGMENTOS.forEach((s, ks) => {
        const c = cob[ks]!;
        const lit = Math.round(c.general * 8 * luz);
        for (let f = 0; f < N_FIG; f++) {
          const i = ks * N_FIG + f;
          const [x, , z] = posFigura(ks, f);
          const on = f === 5 ? c.ciegas * luz >= 0.5 : f === 9 ? c.sordas * luz >= 0.5 : (f < 5 ? f : f - 1) < lit;
          const salto = on && lanzada ? Math.max(0, Math.sin((t - 1 - f * 0.05) * 6)) * 0.04 * Math.max(0, 2.6 - t) : 0;
          obj.position.set(x, 0.26 + salto, z);
          obj.scale.setScalar(1);
          obj.updateMatrix();
          cm.setMatrixAt(i, obj.matrix);
          obj.position.set(x, 0.58 + salto, z);
          obj.updateMatrix();
          hm.setMatrixAt(i, obj.matrix);
          tmp.copy(gris);
          if (on) tmp.copy(colSeg[ks]!).lerp(blanco, 0.15);
          cm.setColorAt(i, tmp);
        }
      });
      cm.instanceMatrix.needsUpdate = true;
      hm.instanceMatrix.needsUpdate = true;
      if (cm.instanceColor) cm.instanceColor.needsUpdate = true;
    }
  });

  const initCuerpos = (m: THREE.InstancedMesh | null) => {
    cuerpos.current = m;
    if (m && !m.instanceColor) for (let i = 0; i < SEGMENTOS.length * N_FIG; i++) m.setColorAt(i, new THREE.Color("#475569"));
  };

  return (
    <group position={[0, -0.9, 0.3]}>
      <mesh position={[0, -0.06, 0]} receiveShadow>
        <cylinderGeometry args={[6.9, 6.9, 0.12, 72]} />
        <meshStandardMaterial color="#0f1b2d" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.05, 3.12, 72]} />
        <meshBasicMaterial color={modoColor} transparent opacity={0.35} />
      </mesh>
      {/* Canales */}
      {CANALES.map((c, k) => {
        const on = canales.includes(c.id);
        const [x, , z] = posCanal(k);
        return (
          <group key={c.id} position={[x, 0, z]} rotation={[0, -Math.atan2(z, x) + Math.PI / 2, 0]}>
            <mesh position={[0, 0.1, 0]} receiveShadow>
              <cylinderGeometry args={[0.42, 0.48, 0.2, 24]} />
              <meshStandardMaterial color={on ? "#1e293b" : "#172234"} roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.205, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.36, 0.44, 32]} />
              <meshBasicMaterial color={on ? c.color : "#334155"} toneMapped={false} />
            </mesh>
            <group position={[0, 0.2, 0]} scale={on ? 1 : 0.85}>
              <ObjetoCanal id={c.id} color={c.color} on={on} />
            </group>
          </group>
        );
      })}
      {CANALES.map((c, k) => {
        const on = canales.includes(c.id);
        const [x, , z] = posCanal(k);
        return (
          <Etiqueta key={c.id} pos={[x * 1.5, 0.3, z * 1.5]} df={11} fs={on ? 11.5 : 10} col={on ? c.color : "rgba(255,255,255,0.14)"}>
            <i className={c.icono.startsWith("fa-brands") ? c.icono : `fa-solid ${c.icono}`} style={{ color: on ? c.color : "#94a3b8" }} />
            <span style={{ color: on ? "#fff" : "rgba(255,255,255,0.6)" }}>{c.corto}</span>
          </Etiqueta>
        );
      })}

      {/* Grupos */}
      {SEGMENTOS.map((s, k) => {
        const [bx, , bz] = posSeg(k, R_SEG + 0.75);
        const [px, , pz] = posSeg(k, R_SEG - 0.05);
        const objetivo = audienciaCaso.includes(s.id);
        const c = cob[k]!;
        return (
          <group key={s.id}>
            <mesh position={[px, 0.03, pz]} rotation={[0, -angSeg(k), 0]} receiveShadow>
              <cylinderGeometry args={[1.45, 1.5, 0.08, 6]} />
              <meshStandardMaterial color={s.color} transparent opacity={objetivo ? 0.36 : 0.12} roughness={0.6} />
            </mesh>
            {objetivo && (
              <mesh position={[px, 0.08, pz]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[1.5, 1.6, 6]} />
                <meshBasicMaterial color={s.color} toneMapped={false} />
              </mesh>
            )}
            <group position={[bx, 0.07, bz]} rotation={[0, -angSeg(k) - Math.PI / 2, 0]}>
              <Edificio id={s.id} color={s.color} />
            </group>
            <Etiqueta pos={[bx * 1.1, 1.75, bz * 1.1]} df={11} fs={11} col={objetivo ? s.color : "rgba(255,255,255,0.18)"}>
              <i className={`fa-solid ${s.icono}`} style={{ color: s.color }} />
              {s.etq}
              {objetivo && <span style={{ fontSize: 9, letterSpacing: "0.08em", color: s.color }}>AUDIENCIA</span>}
              {lanzada && (
                <span style={{ color: c.general >= 0.7 ? OK : c.general >= 0.4 ? "#fbbf24" : "#f87171", fontVariantNumeric: "tabular-nums" }}>{num(c.general * 100)} %</span>
              )}
            </Etiqueta>
            {/* Persona ciega (bastón) y persona sorda */}
            {(() => {
              const [x8, , z8] = posFigura(k, 5);
              const [x9, , z9] = posFigura(k, 9);
              return (
                <>
                  <mesh position={[x8 + 0.1, 0.22, z8]} rotation={[0, 0, 0.25]}>
                    <cylinderGeometry args={[0.012, 0.012, 0.46, 6]} />
                    <meshStandardMaterial color="#f8fafc" emissive="#f8fafc" emissiveIntensity={0.3} />
                  </mesh>
                  {lanzada && (
                    <>
                      <Html position={[x8, 0.98, z8]} center distanceFactor={11} zIndexRange={[16, 0]} style={{ pointerEvents: "none" }}>
                        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: 99, background: "rgba(4,10,22,0.88)", border: `1.5px solid ${c.ciegas >= 0.5 ? OK : "#f87171"}` }}>
                          <i className="fa-solid fa-eye-low-vision" style={{ fontSize: 11, color: c.ciegas >= 0.5 ? OK : "#f87171" }} />
                        </span>
                      </Html>
                      <Html position={[x9, 0.98, z9]} center distanceFactor={11} zIndexRange={[16, 0]} style={{ pointerEvents: "none" }}>
                        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: 99, background: "rgba(4,10,22,0.88)", border: `1.5px solid ${c.sordas >= 0.5 ? OK : "#f87171"}` }}>
                          <i className="fa-solid fa-ear-deaf" style={{ fontSize: 11, color: c.sordas >= 0.5 ? OK : "#f87171" }} />
                        </span>
                      </Html>
                    </>
                  )}
                </>
              );
            })()}
          </group>
        );
      })}
      <instancedMesh ref={initCuerpos} args={[GEO_CUERPO, undefined, SEGMENTOS.length * N_FIG]} castShadow frustumCulled={false}>
        <meshStandardMaterial roughness={0.5} />
      </instancedMesh>
      <instancedMesh ref={cabezas} args={[GEO_CABEZA, undefined, SEGMENTOS.length * N_FIG]} frustumCulled={false}>
        <meshStandardMaterial color="#f1c9a5" roughness={0.6} />
      </instancedMesh>

      {/* Arcos de difusión */}
      <group key={`arcos-${nonce}-${canales.join("-")}`} ref={arcosRef}>
        {arcos.map((a, i) => (
          <mesh key={i} geometry={a.geo} userData={{ fuerza: a.fuerza }} visible={false}>
            <meshBasicMaterial color={a.color} transparent opacity={0} depthWrite={false} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <instancedMesh ref={puntos} args={[GEO_PULSO, undefined, 40]} frustumCulled={false}>
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

/* ── Escena ───────────────────────────────────────────────────────────── */

export default function AlcancePublicacionScene(p: AlcanceSceneProps) {
  const { vista, modoColor, resetNonce } = p;
  const cam = useMemo((): { pos: Pt; target: Pt } => {
    if (vista === "campana") return { pos: [0, 11.2, 12.4], target: [0, -0.6, 0.6] };
    return { pos: [2.4, 10.4, 13.0], target: [1.8, -0.7, -0.2] };
  }, [vista]);

  return (
    <Canvas key={`${vista}-${resetNonce}`} shadows dpr={[1, 1.75]} camera={{ position: cam.pos, fov: 44 }} gl={{ antialias: true }}>
      {/* Suelo, luz de tres puntos y entorno que reflejar. */}
      {/* Sin altura: esta escena no tenía sombra de la que leerla, así
          que el escenario la MIDE de la propia escena al montarse, en
          vez de que alguien la adivine. */}
      <Escenario acento="#38bdf8" />
      <pointLight position={[-6, 4, 5]} intensity={0.45} color={modoColor} />

      {vista === "cascada" && <RedDifusion variante="cascada" eventos={p.eventosCascada} nonce={p.nonceCascada} origenes={[p.origenNodo]} fuente={-1} modoColor={modoColor} />}
      {vista === "rumor" && <RedDifusion variante="rumor" eventos={p.eventosRumor} nonce={p.nonceRumor} origenes={RUMOR.origenes} fuente={p.fuenteNodo} modoColor={modoColor} />}
      {vista === "campana" && <EscenaCampana audienciaCaso={p.audienciaCaso} canales={p.canales} accesos={p.accesos} lanzada={p.lanzada} nonce={p.nonceCampana} modoColor={modoColor} />}

      <OrbitControls makeDefault enablePan={false} enableZoom minDistance={5} maxDistance={24} maxPolarAngle={Math.PI * 0.46} minPolarAngle={Math.PI * 0.06} target={cam.target} />
      <EffectComposer>
        <Bloom intensity={0.35} luminanceThreshold={0.6} luminanceSmoothing={0.85} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.6} />
      </EffectComposer>
    </Canvas>
  );
}

