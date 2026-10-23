"use client";
// =============================================================================
// Lienzo 3D del ATLAS DEL CUERPO HUMANO (UVEG bachillerato).
//
// Las formas son las del atlas Z-Anatomy (CC BY-SA 4.0, derivado de
// BodyParts3D), hechas a partir de cuerpos reales: cada hueso, músculo, vaso,
// nervio y órgano es su propia pieza, con su nombre. Vienen aligeradas (menos
// polígonos + Draco) y cada archivo se baja solo cuando su sistema se enciende
// por primera vez. Puerto del atlas de NEM básica, con lo que pide bachillerato:
//
//   • color de tejido por pieza y normales suavizadas (sin facetas);
//   • cuerpo armado, SEPARADO (deslizador) o TODAS LAS PIEZAS en filas;
//   • CORTES en los tres planos anatómicos (sagital, frontal, transversal);
//   • capas: hueso sólido / rayos X / oculto y transparencia muscular;
//   • ocultar piezas sueltas o ver una sola, girando;
//   • fisiología en movimiento: latido (frecuencia cardiaca) y respiración
//     (diafragma y pulmones, con frecuencia y volumen corriente);
//   • el TRAZO de un recorrido (bolo, sangre) que se dibuja al tocar en orden;
//   • el nombre de la pieza tocada, en la punta de la pieza.
//
// Decodificador Draco LOCAL y con worker estático (/draco/draco-worker.js):
// el CSP no permite gstatic ni workers blob:.
// =============================================================================

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Environment, Html, Lightformer, OrbitControls, useGLTF, useProgress } from "@react-three/drei";
import * as THREE from "three";
import { DRACOLoader, type OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { mergeGeometries, mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { NOMBRES, type IdSistema } from "./atlas-cuerpo-nombres";
import type { ModoHueso } from "./atlas-cuerpo-modos";

export const RUTA_ANATOMIA = "/media/atlas-cuerpo";
const DRACO = "/draco/";

/** Archivos y el sistema al que pertenecen (una pieza puede reclasificarse por su nombre). */
const ARCHIVOS: { archivo: string; sistema: IdSistema }[] = [
  { archivo: "esqueleto", sistema: "esqueleto" },
  { archivo: "musculos", sistema: "musculos" },
  { archivo: "corazon", sistema: "circulatorio" },
  { archivo: "vasos", sistema: "circulatorio" },
  { archivo: "respiratorio", sistema: "respiratorio" },
  { archivo: "digestivo", sistema: "digestivo" },
  { archivo: "urinario", sistema: "urinario" },
  { archivo: "encefalo", sistema: "nervioso" },
  { archivo: "nervioso", sistema: "nervioso" },
  { archivo: "nervios", sistema: "nervioso" },
  { archivo: "sentidos", sistema: "sentidos" },
  { archivo: "endocrino", sistema: "endocrino" },
  { archivo: "linfatico", sistema: "linfatico" },
];
/** Piezas que vienen en dos archivos: se quedan solo en el de su sistema. */
const OMITIR: Record<string, RegExp> = { esqueleto: /^(Thyroid cartilage|Cricoid cartilage|Malleus|Incus|Stapes)(\.[lr])?$/ };
/** El esqueleto trae dientes y cartílagos de nariz y laringe: se bajan con él. */
const ARRASTRA: Partial<Record<IdSistema, IdSistema>> = { digestivo: "esqueleto", respiratorio: "esqueleto" };

export type Vista = "frente" | "lado" | "espalda" | "arriba" | "oblicua";
export type ModoVista = "cuerpo" | "piezas";
/** «pieza»: solo la elegida · «sistema»: solo su sistema · «resaltadas»: solo las marcadas. */
export type Aislar = false | "pieza" | "sistema" | "resaltadas";
export type EjeCorte = "sagital" | "frontal" | "transversal";

export interface Pieza {
  id: string; // «sistema:Nombre.l», único
  clave: string; // nombre inglés sin lado (llave de NOMBRES)
  lado: "izquierdo" | "derecho" | null;
  sistema: IdSistema;
}

export interface AtlasEscenaProps {
  visibles: Record<IdSistema, boolean>;
  /** Sistemas cuyos archivos ya se pidieron (no se vuelven a soltar). */
  cargar: IdSistema[];
  hueso: ModoHueso;
  seleccion: string | null;
  /** Llaves (sin lado) que se marcan en cálido. */
  resaltadas: string[];
  aislar: Aislar;
  separar: number;
  modo: ModoVista;
  /** Cada cambio de `n` mueve la cámara. `a`: «todo», «piezas», «resaltadas», «sistema:x», una vista o un id de pieza; con «@vista» se fuerza la dirección. */
  enfoque: { a: string; n: number };
  /** Ids de pieza ocultos por el alumno. */
  ocultas: string[];
  corte: { eje: EjeCorte | null; pos: number };
  /** Capas translúcidas: opacidad 0–1 por sistema. Debajo de 0.5 la capa no se puede tocar. */
  opacidades: Partial<Record<IdSistema, number>>;
  /** Piezas sueltas (llaves) que se vuelven translúcidas e intocables: lo que estorba a una actividad. */
  translucidas: string[];
  /** Latidos por minuto, o null si el corazón está quieto. */
  latido: number | null;
  respiracion: { fr: number; vc: number } | null;
  /** Ids de pieza del recorrido, en orden. */
  ruta: string[];
  rutaColor: string;
  acento: string;
  onSeleccion: (p: Pieza | null) => void;
  onHover: (p: Pieza | null) => void;
  onListo: () => void;
  onConteo: (n: number) => void;
  onFase?: (f: "inspiracion" | "espiracion") => void;
  /** Avance de la descarga de los modelos (para el indicador de carga). */
  onProgreso?: (activo: boolean, pct: number) => void;
}

// ── Decodificador Draco local ───────────────────────────────────────────────
/**
 * ¿Se puede compilar WebAssembly? El CSP de producción no trae
 * 'wasm-unsafe-eval', y probarlo con una sonda deja un aviso de CSP en la
 * consola; así que se decide por entorno: WASM solo en desarrollo (donde el CSP
 * lleva 'unsafe-eval'), decodificador en JavaScript puro en producción.
 */
function wasmPermitido() {
  return process.env.NODE_ENV !== "production" && typeof WebAssembly === "object";
}

interface DracoInterno {
  decoderPending: Promise<void> | null;
  workerSourceURL: string;
  decoderConfig: Record<string, unknown>;
  _loadLibrary: (url: string, tipo: string) => Promise<unknown>;
  _initDecoder: () => Promise<void>;
}

let dracoCompartido: DRACOLoader | null = null;
/**
 * El DRACOLoader arma su worker con una URL blob:, que el CSP bloquea. Aquí se
 * le da un worker estático del propio dominio con el mismo protocolo; si la
 * página puede compilar WASM se le manda el binario, si no, usa el
 * decodificador en JavaScript puro (más lento, pero funciona en producción).
 */
function dracoLocal(): DRACOLoader {
  if (dracoCompartido) return dracoCompartido;
  const d = new DRACOLoader();
  d.setDecoderPath(DRACO);
  const interno = d as unknown as DracoInterno;
  interno._initDecoder = function (this: DracoInterno) {
    if (this.decoderPending) return this.decoderPending;
    this.workerSourceURL = `${DRACO}draco-worker.js`;
    this.decoderPending = wasmPermitido()
      ? this._loadLibrary("draco_decoder.wasm", "arraybuffer").then((b) => {
          this.decoderConfig.wasmBinary = b;
        })
      : Promise.resolve();
    return this.decoderPending;
  };
  dracoCompartido = d;
  return d;
}

// ── Color de cada tejido ────────────────────────────────────────────────────
type Tono = { c: string; r: number; capa?: number };
const HUESO: Tono = { c: "#e8dcc4", r: 0.62 };
const CARTILAGO: Tono = { c: "#c9dde0", r: 0.35, capa: 0.4 };
const DIENTE: Tono = { c: "#f6f2e6", r: 0.25, capa: 0.6 };
const MUSCULO: Tono = { c: "#b4483f", r: 0.55, capa: 0.25 };
const TENDON: Tono = { c: "#e9e1cf", r: 0.4, capa: 0.3 };
const ARTERIA: Tono = { c: "#c4262e", r: 0.35, capa: 0.5 };
const VENA: Tono = { c: "#2e5cb8", r: 0.35, capa: 0.5 };
const NERVIO: Tono = { c: "#f0cf5c", r: 0.4, capa: 0.3 };
const GANGLIO: Tono = { c: "#8cc46a", r: 0.45, capa: 0.3 };

const TONOS: Record<string, Tono> = {
  // Encéfalo: un tono por lóbulo, como en los libros, sin perder lo orgánico.
  "Frontal lobe": { c: "#d98f8a", r: 0.5, capa: 0.3 },
  "Parietal lobe": { c: "#e0b07a", r: 0.5, capa: 0.3 },
  "Temporal lobe": { c: "#8fb59a", r: 0.5, capa: 0.3 },
  "Occipital lobe": { c: "#9a9cc9", r: 0.5, capa: 0.3 },
  Insula: { c: "#c98fb0", r: 0.5, capa: 0.3 },
  "Limbic lobe": { c: "#d8a6a0", r: 0.5, capa: 0.3 },
  "Corpus callosum": { c: "#efe6da", r: 0.5 },
  Diencephalon: { c: "#c99a8c", r: 0.5, capa: 0.3 },
  Cerebellum: { c: "#c77d72", r: 0.5, capa: 0.3 },
  Midbrain: { c: "#b98d7c", r: 0.5, capa: 0.3 },
  Pons: { c: "#c79f8a", r: 0.5, capa: 0.3 },
  "Medulla oblongata": { c: "#d0ae96", r: 0.5, capa: 0.3 },
  Thalamus: { c: "#b99ad6", r: 0.5, capa: 0.3 },
  Hypothalamus: { c: "#d6a0c0", r: 0.5, capa: 0.3 },
  Hippocampus: { c: "#e3c06e", r: 0.5, capa: 0.3 },
  "Amygdaloid body": { c: "#e39a6e", r: 0.5, capa: 0.3 },
  "Lateral ventricle": { c: "#6fb6e3", r: 0.3, capa: 0.6 },
  "Third ventricle": { c: "#6fb6e3", r: 0.3, capa: 0.6 },
  "Fourth ventricle": { c: "#6fb6e3", r: 0.3, capa: 0.6 },
  "Spinal dura": { c: "#efdcae", r: 0.5, capa: 0.3 },
  "Optic chiasm": NERVIO,
  "Optic tract": NERVIO,
  // Corazón.
  "Left ventricle": { c: "#a1232b", r: 0.4, capa: 0.6 },
  "Right ventricle": { c: "#7d2f5a", r: 0.4, capa: 0.6 },
  "Left atrium": { c: "#c2414a", r: 0.4, capa: 0.6 },
  "Right atrium": { c: "#8e4673", r: 0.4, capa: 0.6 },
  // Respiratorio.
  Trachea: { c: "#e6d3c3", r: 0.4, capa: 0.3 },
  Diaphragm: { c: "#a3443d", r: 0.55, capa: 0.2 },
  Epiglottis: { c: "#d7a59a", r: 0.4, capa: 0.4 },
  "Mucosa of nasal cavity": { c: "#d57c78", r: 0.4, capa: 0.6 },
  // Digestivo.
  Liver: { c: "#7a2b22", r: 0.35, capa: 0.7 },
  Gallbladder: { c: "#4f7d3a", r: 0.3, capa: 0.7 },
  "Bile duct": { c: "#5f8f45", r: 0.3, capa: 0.6 },
  Stomach: { c: "#d78a7b", r: 0.4, capa: 0.6 },
  Pancreas: { c: "#e3bd86", r: 0.55, capa: 0.3 },
  Duodenum: { c: "#e0a08c", r: 0.4, capa: 0.6 },
  Jejunum: { c: "#e0a08c", r: 0.4, capa: 0.6 },
  "Vermiform appendix": { c: "#c98b74", r: 0.4, capa: 0.6 },
  Oesophagus: { c: "#c9776c", r: 0.4, capa: 0.6 },
  Tongue: { c: "#c9545c", r: 0.45, capa: 0.6 },
  Gingiva: { c: "#d9757c", r: 0.45, capa: 0.6 },
  "Uvula of palate": { c: "#d06a6a", r: 0.4, capa: 0.6 },
  // Urinario.
  Kidney: { c: "#8b3a30", r: 0.35, capa: 0.6 },
  "Renal pelvis": { c: "#e6cfa0", r: 0.4, capa: 0.4 },
  Ureter: { c: "#e6cfa0", r: 0.4, capa: 0.4 },
  Urethra: { c: "#e6cfa0", r: 0.4, capa: 0.4 },
  "Urinary bladder": { c: "#d9a07e", r: 0.4, capa: 0.6 },
  // Sentidos.
  "Posterior segment of eyeball": { c: "#f3efe8", r: 0.3, capa: 0.8 },
  "Anterior segment of eyeball": { c: "#f3efe8", r: 0.3, capa: 0.8 },
  Iris: { c: "#5d7fa3", r: 0.4, capa: 0.8 },
  Lens: { c: "#e9eef5", r: 0.1, capa: 1 },
  Cornea: { c: "#dbe9f3", r: 0.05, capa: 1 },
  Cochlea: { c: "#e4cfae", r: 0.45 },
  Vestibule: { c: "#e4cfae", r: 0.45 },
  "Tympanic membrane": { c: "#e8c3ad", r: 0.4, capa: 0.5 },
  "Lacrimal gland": { c: "#e9c6a0", r: 0.5, capa: 0.3 },
  Malleus: HUESO,
  Incus: HUESO,
  Stapes: HUESO,
  // Endocrino.
  "Thyroid gland": { c: "#b8505a", r: 0.4, capa: 0.5 },
  "Suprarenal gland": { c: "#e0a84a", r: 0.45, capa: 0.4 },
  Adenohypophysis: { c: "#d9909a", r: 0.4, capa: 0.5 },
  Neurohypophysis: { c: "#e8b8a8", r: 0.4, capa: 0.5 },
  "Pineal gland": { c: "#c8a0c8", r: 0.4, capa: 0.5 },
  // Linfático.
  Spleen: { c: "#7b2d4a", r: 0.35, capa: 0.6 },
  "Left lobe of thymus": { c: "#e6c3a1", r: 0.5, capa: 0.3 },
  "Right lobe of thymus": { c: "#e6c3a1", r: 0.5, capa: 0.3 },
  "Palatine tonsil": { c: "#d98080", r: 0.45, capa: 0.5 },
};

function tonoDe(clave: string, sistema: IdSistema, zona: string): Tono {
  if (TONOS[clave]) return TONOS[clave];
  if (/tooth|incisor|canine|premolar/.test(clave)) return DIENTE;
  if (/cartilage/i.test(clave)) return CARTILAGO;
  if (sistema === "esqueleto") return HUESO;
  if (sistema === "musculos") return /tendon|aponeurosis/i.test(clave) ? TENDON : MUSCULO;
  if (sistema === "circulatorio") {
    if (zona === "arteria-pulmonar") return VENA;
    if (zona === "vena-pulmonar") return ARTERIA;
    if (zona === "vena" || /vein|sinus/i.test(clave)) return VENA;
    if (zona === "arteria" || /arter|aorta|trunk/i.test(clave)) return ARTERIA;
  }
  if (sistema === "nervioso" && /nerve|plexus|branch|root|trunk|ganglia|cauda/i.test(clave)) return NERVIO;
  if (/ nodes?$/.test(clave)) return GANGLIO;
  if (/lobe of (left|right) lung/.test(clave)) {
    // Un rosa por lóbulo para que se lean las cisuras.
    return { c: /Superior/.test(clave) ? "#e7a2a3" : /Middle/.test(clave) ? "#dc9497" : "#d28a8e", r: 0.6, capa: 0.25 };
  }
  if (/bronch/.test(clave)) return { c: "#e9d6c6", r: 0.4, capa: 0.3 };
  if (/colon|taenia/.test(clave)) return { c: "#c9907a", r: 0.45, capa: 0.5 };
  if (/gland/.test(clave)) return { c: "#e3c79a", r: 0.55, capa: 0.2 };
  if (/duct|canalicul|sac$/.test(clave)) return { c: "#e6cfa0", r: 0.45, capa: 0.3 };
  if (/leaflet/.test(clave)) return { c: "#ecd8c4", r: 0.4, capa: 0.4 };
  if (/papillary/.test(clave)) return { c: "#8c1f28", r: 0.45, capa: 0.5 };
  return { c: "#cf8f86", r: 0.45, capa: 0.4 };
}

// ── El plano de corte (uno para todo el cuerpo) ─────────────────────────────
/** Sin corte, el plano se va lejísimos: nada se recorta y ningún material se recompila. */
const PLANO = new THREE.Plane(new THREE.Vector3(0, -1, 0), 1e4);
const PLANOS = [PLANO];

// «Rayos X»: solo el contorno brilla (fresnel), sumado al fondo. Respeta el corte.
const VERT_RX = /* glsl */ `
#include <clipping_planes_pars_vertex>
varying vec3 vN; varying vec3 vV;
void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mvPosition.xyz);
  gl_Position = projectionMatrix * mvPosition;
  #include <clipping_planes_vertex>
}`;
const FRAG_RX = /* glsl */ `
#include <clipping_planes_pars_fragment>
uniform vec3 uColor; uniform float uFuerza;
varying vec3 vN; varying vec3 vV;
void main() {
  #include <clipping_planes_fragment>
  float f = 1.0 - abs(dot(normalize(vN), normalize(vV)));
  float a = pow(f, 2.2) * uFuerza + 0.025;
  gl_FragColor = vec4(uColor * a, 1.0);
}`;
const MAT_RAYOS = new THREE.ShaderMaterial({
  vertexShader: VERT_RX,
  fragmentShader: FRAG_RX,
  uniforms: { uColor: { value: new THREE.Color("#9fc4e8") }, uFuerza: { value: 0.75 } },
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  side: THREE.DoubleSide,
  clipping: true,
  clippingPlanes: PLANOS,
});

/** Copia que solo se pinta donde la pieza queda tapada: se ve «a través». */
const MAT_TRASLUCIDO = new THREE.MeshBasicMaterial({
  color: "#ffb347",
  transparent: true,
  opacity: 0.5,
  depthWrite: false,
  depthFunc: THREE.GreaterDepth,
  side: THREE.FrontSide,
  clippingPlanes: PLANOS,
});

/** Normales suaves: el archivo trae caras planas que se ven como facetas. */
function suavizar(g: THREE.BufferGeometry) {
  const sinNormal = g.clone();
  sinNormal.deleteAttribute("normal");
  const unida = mergeVertices(sinNormal, 1e-5);
  unida.computeVertexNormals();
  sinNormal.dispose();
  return unida;
}

const LADO = /\.(l|r)$/;
function piezaDe(nombre: string, sistemaArchivo: IdSistema): Pieza {
  const limpio = nombre.replace(/\.\d{3}$/, "");
  const m = limpio.match(LADO);
  const clave = limpio
    .replace(LADO, "")
    .replace(/^\((.*)\)$/, "$1")
    .replace(/\*$/, "")
    .replace(/\.$/, "")
    .trim();
  const sistema = NOMBRES[clave]?.s ?? sistemaArchivo;
  return { id: `${sistema}:${limpio}`, clave, lado: m ? (m[1] === "l" ? "izquierdo" : "derecho") : null, sistema };
}

const sinToque = () => {};
/** ¿El punto quedó del lado recortado del plano de corte? Lo que no se ve no se toca. */
const recortado = (punto: THREE.Vector3) => PLANO.distanceToPoint(punto) < -1e-4;
/** Raycast que ignora lo que el corte quitó: así el toque llega a la cara cortada. */
function raycastConCorte(this: THREE.Mesh, rc: THREE.Raycaster, hits: THREE.Intersection[]) {
  const antes = hits.length;
  THREE.Mesh.prototype.raycast.call(this, rc, hits);
  if (PLANO.constant > 1e3) return;
  for (let i = hits.length - 1; i >= antes; i--) if (recortado(hits[i]!.point)) hits.splice(i, 1);
}
/** La selección puede nombrar una pieza con lado («Femur.l») o sin él («Femur»: las dos). */
export function esDeLaSeleccion(id: string, seleccion: string | null) {
  return seleccion !== null && (id === seleccion || id.replace(LADO, "") === seleccion);
}

interface DatosMalla {
  pieza: Pieza;
  normal: THREE.MeshStandardMaterial;
  /** Cómo viene el material (la córnea y el cristalino ya son transparentes). */
  opacidadBase: number;
  traslucido?: THREE.Mesh;
  /** Posición de reposo (cuerpo armado), centro y tamaño de su caja en reposo. */
  reposo: THREE.Vector3;
  centro: THREE.Vector3;
  tam: THREE.Vector3;
  destino: THREE.Vector3;
  /** Posición que va siguiendo al destino (antes del latido o la respiración). */
  base: THREE.Vector3;
  /** Qué movimiento fisiológico le toca. */
  anim: "auricula" | "ventriculo" | "pulmon-d" | "pulmon-i" | "diafragma" | null;
}
type Registro = Map<string, THREE.Mesh>;
const datos = (m: THREE.Mesh) => m.userData.atlas as DatosMalla;

function animDe(clave: string): DatosMalla["anim"] {
  if (/atrium$/.test(clave)) return "auricula";
  if (/ventricle$|papillary|leaflet/.test(clave) && !/Lateral ventricle|Third ventricle|Fourth ventricle/.test(clave)) return "ventriculo";
  if (/lobe of right lung/.test(clave)) return "pulmon-d";
  if (/lobe of left lung/.test(clave)) return "pulmon-i";
  if (clave === "Diaphragm") return "diafragma";
  return null;
}

// ── Un archivo ──────────────────────────────────────────────────────────────
/**
 * Prepara un archivo recién bajado: une en una malla cada pieza con nombre, le
 * suaviza las normales, le da el color de su tejido y anota su caja. Muta la
 * escena del caché a propósito (se marca `atlasListo` para no repetirlo).
 */
function prepararArchivo(raiz: THREE.Group, archivo: string, sistema: IdSistema): THREE.Mesh[] {
  // Ya preparado (el archivo vive en caché y la escena se puede volver a montar).
  if (raiz.userData.atlasListo) return raiz.children as THREE.Mesh[];
  raiz.updateMatrixWorld(true);
  // Cada pieza es el nodo que trae «nombre». Un hueso con varios materiales
  // llega partido en varias mallas: se unen en una sola, ya en coordenadas
  // del mundo, para que cada pieza sea una malla con un nombre.
  const nodos: THREE.Object3D[] = [];
  raiz.traverse((o) => {
    if (o.userData?.nombre && !OMITIR[archivo]?.test(o.userData.nombre as string)) nodos.push(o);
  });
  const lista: THREE.Mesh[] = [];
  for (const nodo of nodos) {
    const partes: THREE.Mesh[] = [];
    nodo.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) partes.push(o as THREE.Mesh);
    });
    if (!partes.length) continue;
    const geos = partes.map((m) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", m.geometry.getAttribute("position").clone());
      if (m.geometry.index) g.setIndex(m.geometry.index.clone());
      return g.applyMatrix4(m.matrixWorld);
    });
    const unida = geos.length === 1 ? geos[0] : mergeGeometries(geos.map((g) => (g.index ? g.toNonIndexed() : g)));
    if (!unida) continue;
    const malla = new THREE.Mesh(suavizar(unida));
    unida.dispose();
    malla.name = nodo.userData.nombre as string;
    malla.userData.nombre = nodo.userData.nombre;
    malla.userData.zona = nodo.userData.zona ?? "";
    lista.push(malla);
  }
  raiz.clear();
  for (const malla of lista) raiz.add(malla);
  raiz.userData.atlasListo = true;
  for (const malla of lista) {
    const pieza = piezaDe(malla.userData.nombre as string, sistema);
    const zona = malla.userData.zona as string;
    const tono = tonoDe(pieza.clave, pieza.sistema, zona);
    const opciones = { color: tono.c, roughness: tono.r, metalness: 0, side: THREE.DoubleSide, clippingPlanes: PLANOS };
    const normal: THREE.MeshStandardMaterial = tono.capa
      ? new THREE.MeshPhysicalMaterial({ ...opciones, clearcoat: tono.capa, clearcoatRoughness: 0.35 })
      : new THREE.MeshStandardMaterial(opciones);
    if (pieza.clave === "Cornea" || pieza.clave === "Lens" || pieza.clave === "Anterior segment of eyeball") {
      normal.transparent = true;
      normal.opacity = 0.35;
      normal.depthWrite = false;
    }
    malla.material = normal;
    malla.updateMatrixWorld(true);
    const caja = new THREE.Box3().setFromObject(malla);
    const tam = caja.getSize(new THREE.Vector3());
    malla.userData.atlas = {
      pieza,
      normal,
      opacidadBase: normal.opacity,
      reposo: malla.position.clone(),
      centro: caja.getCenter(new THREE.Vector3()),
      tam,
      destino: malla.position.clone(),
      base: malla.position.clone(),
      anim: animDe(pieza.clave),
    } satisfies DatosMalla;
  }
  return lista;
}

function Archivo({
  archivo,
  sistema,
  registro,
  hoverRef,
  onSeleccion,
  onHover,
  onCargado,
}: {
  archivo: string;
  sistema: IdSistema;
  registro: Registro;
  hoverRef: React.RefObject<string | null>;
  onSeleccion: (p: Pieza) => void;
  onHover: (p: Pieza | null) => void;
  onCargado: (archivo: string, mallas: THREE.Mesh[]) => void;
}) {
  const gltf = useGLTF(`${RUTA_ANATOMIA}/${archivo}.glb`, false, false, (loader) => {
    loader.setDRACOLoader(dracoLocal());
  });
  const mallas = useMemo(() => prepararArchivo(gltf.scene, archivo, sistema), [gltf, sistema, archivo]);

  useEffect(() => {
    for (const m of mallas) registro.set(datos(m).pieza.id, m);
    onCargado(archivo, mallas);
    return () => {
      for (const m of mallas) registro.delete(datos(m).pieza.id);
    };
  }, [mallas, registro, archivo, onCargado]);

  return (
    <primitive
      object={gltf.scene}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        if (recortado(e.point)) return;
        e.stopPropagation();
        const d = e.object.userData.atlas as DatosMalla | undefined;
        if (!d) return;
        hoverRef.current = d.pieza.id;
        onHover(d.pieza);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e: ThreeEvent<PointerEvent>) => {
        const d = e.object.userData.atlas as DatosMalla | undefined;
        if (d && hoverRef.current === d.pieza.id) {
          hoverRef.current = null;
          onHover(null);
        }
        document.body.style.cursor = "";
      }}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        // Con el corte puesto, lo recortado no se ve: tampoco se toca.
        if (recortado(e.point)) return;
        e.stopPropagation();
        // Un arrastre para girar no cuenta como toque.
        if (e.delta > 6) return;
        const d = e.object.userData.atlas as DatosMalla | undefined;
        if (d) onSeleccion(d.pieza);
      }}
    />
  );
}

// ── Lo que se ve y dónde está cada pieza ────────────────────────────────────
const CENTRO_CUERPO = new THREE.Vector3(0, 0.95, 0);

/** Caja del cuerpo armado (se mide al llegar el esqueleto; esto es solo el arranque). */
export interface Cuerpo {
  min: THREE.Vector3;
  max: THREE.Vector3;
}
const CUERPO_INICIAL: Cuerpo = { min: new THREE.Vector3(-0.3, 0.02, -0.18), max: new THREE.Vector3(0.3, 1.82, 0.18) };

const EJE_N: Record<EjeCorte, THREE.Vector3> = {
  // Se conserva el lado al que apunta la normal; lo demás se recorta.
  sagital: new THREE.Vector3(-1, 0, 0), // quita la mitad izquierda del cuerpo (vista de lado)
  frontal: new THREE.Vector3(0, 0, -1), // quita la parte anterior (vista de frente)
  transversal: new THREE.Vector3(0, -1, 0), // quita la parte superior (vista desde arriba)
};
/** Coordenada del plano de corte sobre su eje, de 0 a 1 a lo largo del cuerpo. */
export function coordCorte(eje: EjeCorte, pos: number, c: Cuerpo) {
  if (eje === "sagital") return THREE.MathUtils.lerp(c.min.x, c.max.x, pos);
  if (eje === "frontal") return THREE.MathUtils.lerp(c.min.z, c.max.z, pos);
  return THREE.MathUtils.lerp(c.min.y, c.max.y, pos);
}
const ESTIRA = new THREE.Vector3(1.6, 0.75, 1.6);

function claveDe(id: string) {
  return id.slice(id.indexOf(":") + 1).replace(LADO, "");
}

/** Pulso de 0 a 1 entre `a` y `b` (fracciones del ciclo), 0 fuera. */
function bulto(t: number, a: number, b: number) {
  return t < a || t > b ? 0 : Math.sin((Math.PI * (t - a)) / (b - a));
}

/** Pivotes de la fisiología: el centro del corazón y la punta de cada pulmón. */
interface Pivotes {
  corazon: THREE.Vector3 | null;
  pulmonD: THREE.Vector3 | null;
  pulmonI: THREE.Vector3 | null;
  altoPulmon: number;
}

function Control({ p, registro, hoverRef, mesaRef, pivotesRef, cuerpo }: { p: AtlasEscenaProps; registro: Registro; hoverRef: React.RefObject<string | null>; mesaRef: React.RefObject<THREE.Box3>; pivotesRef: React.RefObject<Pivotes>; cuerpo: Cuerpo }) {
  const llaveMesa = useRef("");
  const conteo = useRef(-1);
  const fase = useRef<"inspiracion" | "espiracion" | null>(null);
  const reloj = useRef({ latido: 0, resp: 0 });
  const resaltadas = useMemo(() => new Set(p.resaltadas), [p.resaltadas]);
  const ocultas = useMemo(() => new Set(p.ocultas), [p.ocultas]);
  const translucidas = useMemo(() => new Set(p.translucidas), [p.translucidas]);
  const { onConteo, onFase } = p;
  const escalaTmp = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }, dt) => {
    // El corte: el plano se coloca sobre la caja del cuerpo, según el eje y la posición.
    if (p.corte.eje && p.modo === "cuerpo") {
      // Plano n·x + c = 0 por la coordenada q del eje. Como n = −eje, c = q.
      PLANO.normal.copy(EJE_N[p.corte.eje]);
      PLANO.constant = coordCorte(p.corte.eje, p.corte.pos, cuerpo);
    } else {
      PLANO.normal.copy(EJE_N.transversal);
      PLANO.constant = 1e4;
    }

    const sistemaSel = p.seleccion ? p.seleccion.slice(0, p.seleccion.indexOf(":")) : null;
    const visibles: THREE.Mesh[] = [];
    for (const m of registro.values()) {
      const d = datos(m);
      const esHueso = d.pieza.sistema === "esqueleto";
      const sel = esDeLaSeleccion(d.pieza.id, p.seleccion);
      const resaltada = resaltadas.has(d.pieza.clave);
      // Si solo se ven las resaltadas, ya no hace falta marcarlas: van con su color.
      const marcada = sel || (resaltada && p.aislar !== "resaltadas");
      let ver = p.visibles[d.pieza.sistema] && !(esHueso && p.hueso === "oculto" && !marcada) && !ocultas.has(d.pieza.id);
      if (p.aislar === "pieza" && p.seleccion) ver = sel;
      else if (p.aislar === "sistema" && sistemaSel) ver = ver && d.pieza.sistema === sistemaSel;
      else if (p.aislar === "resaltadas" && resaltadas.size) ver = resaltada || sel;
      m.visible = ver;
      if (ver) visibles.push(m);

      // En la mesa de piezas todo va sólido; en el cuerpo, el hueso puede ir en rayos X.
      const fantasma = esHueso && p.hueso === "rayos" && !marcada && p.modo === "cuerpo";
      m.raycast = fantasma || !ver ? sinToque : raycastConCorte;
      if (fantasma) {
        if (m.material !== MAT_RAYOS) m.material = MAT_RAYOS;
      } else if (m.material !== d.normal) m.material = d.normal;

      // Capas: un sistema se puede volver translúcido para ver lo que tapa
      // (los músculos sobre el hueso, los pulmones sobre el corazón).
      const capa = marcada || p.modo === "piezas" ? 1 : Math.min(p.opacidades[d.pieza.sistema] ?? 1, translucidas.has(d.pieza.clave) ? 0.2 : 1);
      const op = d.opacidadBase * capa;
      const trans = op < 0.999;
      if (d.normal.transparent !== trans) {
        d.normal.transparent = trans;
        d.normal.needsUpdate = true;
      }
      d.normal.opacity = op;
      d.normal.depthWrite = op > 0.55;
      if (capa < 0.5) m.raycast = sinToque;

      if (marcada && !d.traslucido) {
        d.traslucido = new THREE.Mesh(m.geometry, MAT_TRASLUCIDO);
        d.traslucido.renderOrder = 10;
        d.traslucido.raycast = sinToque;
        m.add(d.traslucido);
      }
      // Sola, nada la tapa: el «a través» se apaga para que se vea su color real.
      const sola = p.aislar === "pieza";
      if (d.traslucido) d.traslucido.visible = marcada && !fantasma && !sola;
      const e = d.normal.emissive;
      // La pieza elegida conserva su color y late suave en tono cálido.
      if (marcada && sola) e.setRGB(0, 0, 0);
      else if (marcada) e.set("#ffb347").multiplyScalar(0.16 + 0.12 * Math.sin(clock.elapsedTime * 3.2));
      else if (hoverRef.current === d.pieza.id) e.set("#ffffff").multiplyScalar(0.18);
      else e.setRGB(0, 0, 0);

      // Destino: el cuerpo armado o separado (la mesa se calcula abajo).
      if (p.modo === "cuerpo" || p.aislar === "pieza") {
        const s = p.aislar === "pieza" ? 0 : p.separar;
        d.destino.copy(d.centro).sub(CENTRO_CUERPO).multiply(ESTIRA).multiplyScalar(s).add(d.reposo);
      }
    }

    if (visibles.length !== conteo.current) {
      conteo.current = visibles.length;
      onConteo(visibles.length);
    }

    // La mesa: todas las piezas visibles en filas, de la más grande a la más chica.
    if (p.modo === "piezas" && p.aislar !== "pieza") {
      const llave = visibles.map((m) => datos(m).pieza.id).join("|");
      if (llave !== llaveMesa.current) {
        llaveMesa.current = llave;
        acomodar(visibles, mesaRef.current);
      }
    } else llaveMesa.current = "";

    // Fisiología: latido y respiración (solo con el cuerpo armado).
    const enCuerpo = p.modo === "cuerpo" && p.aislar !== "pieza";
    if (p.latido) reloj.current.latido += (dt * p.latido) / 60;
    if (p.respiracion) reloj.current.resp += (dt * p.respiracion.fr) / 60;
    const tl = reloj.current.latido % 1;
    const tr = reloj.current.resp % 1;
    const sAur = p.latido && enCuerpo ? 1 - 0.07 * bulto(tl, 0, 0.16) : 1;
    const sVen = p.latido && enCuerpo ? 1 - 0.09 * bulto(tl, 0.16, 0.48) : 1;
    // Inhalación: 0 → 1 → 0 en cada ciclo; la mitad del ciclo es inspiración.
    const inh = p.respiracion && enCuerpo ? 0.5 - 0.5 * Math.cos(2 * Math.PI * tr) : 0;
    const amp = p.respiracion ? 0.03 + (0.1 * (p.respiracion.vc - 300)) / 2200 : 0;
    if (p.respiracion && onFase) {
      const f = tr < 0.5 ? "inspiracion" : "espiracion";
      if (f !== fase.current) {
        fase.current = f;
        onFase(f);
      }
    } else fase.current = null;
    const piv = pivotesRef.current;

    const k = 1 - Math.exp(-dt * 5);
    for (const m of registro.values()) {
      const d = datos(m);
      if (!m.visible) {
        d.base.copy(d.destino);
      } else if (d.base.distanceToSquared(d.destino) > 1e-10) d.base.lerp(d.destino, k);
      let pivote: THREE.Vector3 | null = null;
      escalaTmp.set(1, 1, 1);
      let bajar = 0;
      if (d.anim === "auricula" && piv.corazon && sAur !== 1) {
        pivote = piv.corazon;
        escalaTmp.setScalar(sAur);
      } else if (d.anim === "ventriculo" && piv.corazon && sVen !== 1) {
        pivote = piv.corazon;
        escalaTmp.setScalar(sVen);
      } else if ((d.anim === "pulmon-d" || d.anim === "pulmon-i") && inh > 0) {
        pivote = d.anim === "pulmon-d" ? piv.pulmonD : piv.pulmonI;
        if (pivote) escalaTmp.set(1 + 0.55 * amp * inh, 1 + amp * inh, 1 + 0.55 * amp * inh);
      } else if (d.anim === "diafragma" && inh > 0) {
        bajar = amp * inh * piv.altoPulmon;
      }
      if (pivote) {
        m.scale.copy(escalaTmp);
        m.position.set(d.base.x + pivote.x * (1 - escalaTmp.x), d.base.y + pivote.y * (1 - escalaTmp.y), d.base.z + pivote.z * (1 - escalaTmp.z));
      } else {
        if (m.scale.x !== 1 || m.scale.y !== 1 || m.scale.z !== 1) m.scale.set(1, 1, 1);
        m.position.copy(d.base);
        if (bajar) m.position.y -= bajar;
      }
    }
  });
  return null;
}

const ORDEN_MESA: IdSistema[] = ["esqueleto", "musculos", "circulatorio", "respiratorio", "digestivo", "urinario", "nervioso", "sentidos", "endocrino", "linfatico", "reproductor"];

/** Cada sistema en su bloque (empieza renglón), y dentro, de la pieza más grande a la más chica. */
function acomodar(mallas: THREE.Mesh[], caja: THREE.Box3) {
  const orden = [...mallas].sort((a, b) => {
    const sa = ORDEN_MESA.indexOf(datos(a).pieza.sistema);
    const sb = ORDEN_MESA.indexOf(datos(b).pieza.sistema);
    if (sa !== sb) return sa - sb;
    const ta = datos(a).tam;
    const tb = datos(b).tam;
    return Math.max(tb.x, tb.y) - Math.max(ta.x, ta.y);
  });
  const hueco = 0.012;
  let area = 0;
  for (const m of orden) {
    const t = datos(m).tam;
    area += (t.x + hueco) * (t.y + hueco);
  }
  const ancho = Math.max(0.6, Math.sqrt(area * 1.75));
  const celdas: { m: THREE.Mesh; x: number; y: number }[] = [];
  let x = 0;
  let y = 0;
  let alto = 0;
  let maxX = 0;
  let sistema: IdSistema | null = null;
  for (const m of orden) {
    const t = datos(m).tam;
    const otro = sistema !== null && datos(m).pieza.sistema !== sistema;
    if (x > 0 && (otro || x + t.x > ancho)) {
      y -= alto + hueco * (otro ? 4 : 1);
      x = 0;
      alto = 0;
    }
    sistema = datos(m).pieza.sistema;
    celdas.push({ m, x: x + t.x / 2, y: y - t.y / 2 });
    x += t.x + hueco;
    maxX = Math.max(maxX, x);
    alto = Math.max(alto, t.y);
  }
  const totalY = -(y - alto);
  const dx = -maxX / 2;
  const dy = CENTRO_CUERPO.y + totalY / 2;
  caja.makeEmpty();
  for (const c of celdas) {
    const d = datos(c.m);
    const centro = new THREE.Vector3(c.x + dx, c.y + dy, 0);
    d.destino.copy(d.reposo).add(centro).sub(d.centro);
    caja.expandByPoint(centro.clone().addScaledVector(d.tam, 0.5));
    caja.expandByPoint(centro.clone().addScaledVector(d.tam, -0.5));
  }
}

// ── El trazo de un recorrido ────────────────────────────────────────────────
function centroActual(m: THREE.Mesh, v: THREE.Vector3) {
  const d = datos(m);
  return v.copy(d.centro).add(d.base).sub(d.reposo);
}

function Trazo({ ruta, color, registro }: { ruta: string[]; color: string; registro: Registro }) {
  const tubo = useRef<THREE.Mesh>(null);
  const perla = useRef<THREE.Mesh>(null);
  const paradas = useRef<THREE.InstancedMesh>(null);
  const curva = useRef<THREE.CatmullRomCurve3 | null>(null);
  const llave = useRef("·");
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const obj = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    const pts: THREE.Vector3[] = [];
    for (const id of ruta) {
      const m = registro.get(id);
      if (m) pts.push(centroActual(m, tmp).clone());
    }
    const k = pts.map((v) => `${v.x.toFixed(3)},${v.y.toFixed(3)},${v.z.toFixed(3)}`).join("|");
    if (k !== llave.current) {
      llave.current = k;
      // Paradas: una esfera brillante en cada órgano tocado.
      const inst = paradas.current;
      if (inst) {
        inst.count = pts.length;
        pts.forEach((v, i) => {
          obj.position.copy(v);
          obj.updateMatrix();
          inst.setMatrixAt(i, obj.matrix);
        });
        inst.instanceMatrix.needsUpdate = true;
      }
      const t = tubo.current;
      if (t) {
        t.geometry.dispose();
        if (pts.length >= 2) {
          curva.current = new THREE.CatmullRomCurve3(pts, false, "centripetal");
          t.geometry = new THREE.TubeGeometry(curva.current, Math.max(24, pts.length * 22), 0.0045, 8, false);
          t.visible = true;
        } else {
          curva.current = null;
          t.geometry = new THREE.BufferGeometry();
          t.visible = false;
        }
      }
    }
    // Una perla recorre el trazo una y otra vez: el sentido del flujo.
    const pr = perla.current;
    if (pr) {
      if (curva.current) {
        pr.visible = true;
        pr.position.copy(curva.current.getPointAt((clock.elapsedTime * 0.22) % 1));
      } else pr.visible = false;
    }
  });

  return (
    <group renderOrder={20}>
      <mesh ref={tubo} renderOrder={20} visible={false}>
        <bufferGeometry />
        <meshBasicMaterial color={color} transparent opacity={0.85} depthTest={false} toneMapped={false} />
      </mesh>
      <instancedMesh ref={paradas} args={[undefined, undefined, 12]} renderOrder={21} frustumCulled={false}>
        <sphereGeometry args={[0.011, 20, 14]} />
        <meshBasicMaterial color={color} transparent opacity={0.95} depthTest={false} toneMapped={false} />
      </instancedMesh>
      <mesh ref={perla} renderOrder={22} visible={false}>
        <sphereGeometry args={[0.014, 20, 14]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.95} depthTest={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

// ── El nombre de la pieza tocada, en la pieza ───────────────────────────────
function Etiqueta({ seleccion, registro, color }: { seleccion: string | null; registro: Registro; color: string }) {
  const grupo = useRef<THREE.Group>(null);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const cache = useRef<{ sel: string | null; m: THREE.Mesh | null }>({ sel: null, m: null });
  useFrame(() => {
    const g = grupo.current;
    if (!g) return;
    const c = cache.current;
    if (c.sel !== seleccion || !c.m) {
      c.sel = seleccion;
      c.m = null;
      if (seleccion) {
        for (const [id, malla] of registro) {
          if (esDeLaSeleccion(id, seleccion)) {
            c.m = malla;
            break;
          }
        }
      }
    }
    const m = c.m;
    if (!m || !m.visible) {
      g.visible = false;
      return;
    }
    g.visible = true;
    centroActual(m, tmp);
    g.position.set(tmp.x, tmp.y + datos(m).tam.y * 0.5 * m.scale.y, tmp.z);
  });
  if (!seleccion) return null;
  const clave = claveDe(seleccion);
  const n = NOMBRES[clave];
  const lado = /\.l$/.test(seleccion) ? " · izquierdo" : /\.r$/.test(seleccion) ? " · derecho" : "";
  return (
    <group ref={grupo} visible={false}>
      <Html center zIndexRange={[20, 0]} style={{ pointerEvents: "none", transform: "translateY(-26px)" }}>
        <div
          style={{
            whiteSpace: "nowrap",
            padding: "6px 12px",
            borderRadius: 999,
            background: "rgba(5,12,24,0.88)",
            border: `1px solid ${color}`,
            color: "#fff",
            fontSize: 14,
            fontWeight: 800,
            boxShadow: `0 6px 22px -6px ${color}`,
            fontFamily: "inherit",
          }}
        >
          {n?.es ?? clave}
          <span style={{ color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>{lado}</span>
        </div>
      </Html>
    </group>
  );
}

// ── Escenario: un podio de museo bajo los pies ──────────────────────────────
function Podio({ y, acento, visible }: { y: number; acento: string; visible: boolean }) {
  return (
    <group position={[0, y, 0]} visible={visible}>
      {/* Piso: mate y oscuro, se hunde en la niebla. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.032, 0]}>
        <circleGeometry args={[7, 64]} />
        <meshStandardMaterial color="#0a1726" roughness={0.92} metalness={0.05} />
      </mesh>
      {/* Plataforma con canto y un aro de luz del color del modo. */}
      <mesh position={[0, -0.016, 0]}>
        <cylinderGeometry args={[0.52, 0.55, 0.032, 96]} />
        <meshPhysicalMaterial color="#132a40" roughness={0.38} metalness={0.4} clearcoat={0.6} clearcoatRoughness={0.3} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0012, 0]}>
        <ringGeometry args={[0.47, 0.485, 128]} />
        <meshBasicMaterial color={acento} transparent opacity={0.85} />
      </mesh>
    </group>
  );
}

/** El plano de corte, visible como una lámina tenue. */
function Lamina({ corte, acento, cuerpo }: { corte: AtlasEscenaProps["corte"]; acento: string; cuerpo: Cuerpo }) {
  if (!corte.eje) return null;
  const q = coordCorte(corte.eje, corte.pos, cuerpo);
  const c = cuerpo.min.clone().add(cuerpo.max).multiplyScalar(0.5);
  const t = cuerpo.max.clone().sub(cuerpo.min).multiplyScalar(1.08);
  if (corte.eje === "sagital")
    return (
      <mesh position={[q, c.y, c.z]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[t.z, t.y]} />
        <meshBasicMaterial color={acento} transparent opacity={0.05} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
      </mesh>
    );
  if (corte.eje === "frontal")
    return (
      <mesh position={[c.x, c.y, q]}>
        <planeGeometry args={[t.x, t.y]} />
        <meshBasicMaterial color={acento} transparent opacity={0.05} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
      </mesh>
    );
  return (
    <mesh position={[c.x, q, c.z]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[t.x, t.z]} />
      <meshBasicMaterial color={acento} transparent opacity={0.05} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
    </mesh>
  );
}

// ── Cámara ──────────────────────────────────────────────────────────────────
const DIR_VISTA: Record<Vista, THREE.Vector3> = {
  frente: new THREE.Vector3(0, 0.08, 1).normalize(),
  lado: new THREE.Vector3(1, 0.08, 0).normalize(),
  espalda: new THREE.Vector3(0, 0.08, -1).normalize(),
  arriba: new THREE.Vector3(0, 1, 0.02).normalize(),
  oblicua: new THREE.Vector3(0.25, 0.9, 0.6).normalize(),
};
/** Franjas que tapa la interfaz del LabShell: barra de modos arriba y misión abajo. */
const TAPA_ARRIBA = 64;
const TAPA_ABAJO = 150;

function Camara({ p, registro, mesaRef, cuerpo }: { p: AtlasEscenaProps; registro: Registro; mesaRef: React.RefObject<THREE.Box3>; cuerpo: Cuerpo }) {
  const { camera, size } = useThree();
  const controles = useRef<OrbitControlsImpl>(null);
  const vuelo = useRef<{ pos: THREE.Vector3; obj: THREE.Vector3; espera: number; intentos: number } | null>(null);
  const { enfoque } = p;

  // El centro útil de la pantalla queda entre las barras: se corre la proyección.
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const corrimiento = Math.round((TAPA_ABAJO - TAPA_ARRIBA) / 2);
    cam.setViewOffset(size.width, size.height, 0, size.height > 420 ? corrimiento : 0, size.width, size.height);
    cam.updateProjectionMatrix();
    return () => {
      cam.clearViewOffset();
    };
  }, [camera, size.width, size.height]);

  // Distancia para que una esfera de radio r quepa en la franja libre.
  const distancia = (r: number) => {
    const fov = THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov);
    const util = size.height > 420 ? Math.max(0.5, (size.height - TAPA_ARRIBA - TAPA_ABAJO) / size.height) : 0.85;
    const medioV = Math.atan(Math.tan(fov / 2) * util);
    const medioH = Math.atan(Math.tan(fov / 2) * (size.width / size.height) * 0.94);
    return (r / Math.sin(Math.min(medioV, medioH))) * 1.02;
  };

  // Dónde quedará cada pieza (su destino), no dónde va pasando.
  const esferaDe = (filtro: (m: THREE.Mesh) => boolean) => {
    const caja = new THREE.Box3();
    for (const m of registro.values()) {
      if (!filtro(m)) continue;
      const d = datos(m);
      const c = d.centro.clone().add(d.destino).sub(d.reposo);
      caja.expandByPoint(c.clone().addScaledVector(d.tam, 0.5));
      caja.expandByPoint(c.clone().addScaledVector(d.tam, -0.5));
    }
    return caja.isEmpty() ? null : caja.getBoundingSphere(new THREE.Sphere());
  };

  const calcular = () => {
    const ctl = controles.current;
    if (!ctl) return null;
    const [a, forzada] = enfoque.a.split("@") as [string, Vista | undefined];
    const dirActual = camera.position.clone().sub(ctl.target).normalize();
    const dirCon = (porDefecto: THREE.Vector3) => (forzada && DIR_VISTA[forzada] ? DIR_VISTA[forzada] : porDefecto);
    if (a in DIR_VISTA) return { obj: ctl.target.clone(), dir: DIR_VISTA[a as Vista], dist: camera.position.distanceTo(ctl.target) };
    if (a === "todo") return { obj: CENTRO_CUERPO.clone(), dir: dirCon(DIR_VISTA.frente), dist: distancia(0.98 + p.separar * 0.6) };
    if (a.startsWith("corte:")) {
      // Encuadra la cara cortada, no el cuerpo entero desde lejos.
      const eje = a.slice(6) as EjeCorte;
      const cx = (cuerpo.min.x + cuerpo.max.x) / 2;
      const cz = (cuerpo.min.z + cuerpo.max.z) / 2;
      const alto = cuerpo.max.y - cuerpo.min.y;
      if (eje === "transversal") {
        const q = coordCorte("transversal", p.corte.pos, cuerpo);
        return { obj: new THREE.Vector3(cx, q, cz), dir: dirCon(DIR_VISTA.oblicua), dist: distancia(alto * 0.2) };
      }
      const obj = new THREE.Vector3(cx, cuerpo.min.y + alto * 0.72, cz);
      const dir = eje === "sagital" ? new THREE.Vector3(1, 0.12, 0.28).normalize() : DIR_VISTA.frente;
      return { obj, dir: dirCon(dir), dist: distancia(alto * 0.3) };
    }
    if (a === "piezas") {
      const esf = mesaRef.current.isEmpty() ? null : mesaRef.current.getBoundingSphere(new THREE.Sphere());
      return esf ? { obj: esf.center, dir: DIR_VISTA.frente, dist: distancia(esf.radius * 1.08) } : null;
    }
    if (a.startsWith("sistema:")) {
      const s = a.slice(8);
      const esf = esferaDe((m) => datos(m).pieza.sistema === s && m.visible);
      return esf ? { obj: esf.center, dir: dirCon(DIR_VISTA.frente.clone().lerp(dirActual, 0.35).normalize()), dist: distancia(esf.radius * 1.1) } : null;
    }
    if (a === "resaltadas") {
      const set = new Set(p.resaltadas);
      const esf = esferaDe((m) => set.has(datos(m).pieza.clave));
      return esf ? { obj: esf.center, dir: dirCon(DIR_VISTA.frente.clone().lerp(dirActual, 0.3).normalize()), dist: Math.max(distancia(esf.radius * 1.15), 0.2) } : null;
    }
    if (a.startsWith("claves:")) {
      const set = new Set(a.slice(7).split("|"));
      const esf = esferaDe((m) => set.has(datos(m).pieza.clave));
      return esf ? { obj: esf.center, dir: dirCon(DIR_VISTA.frente.clone().lerp(dirActual, 0.3).normalize()), dist: Math.max(distancia(esf.radius * 1.2), 0.18) } : null;
    }
    // Una pieza. Si es un par (los dos fémures), va a la del lado más cercano.
    let mejor: THREE.Sphere | null = null;
    for (const [id, m] of registro) {
      if (!esDeLaSeleccion(id, a) && !(a.indexOf(":") < 0 && claveDe(id) === a)) continue;
      const esf = esferaDe((x) => x === m);
      if (esf && (!mejor || esf.center.distanceTo(camera.position) < mejor.center.distanceTo(camera.position))) mejor = esf;
    }
    if (!mejor) return null;
    const obj = mejor.center;
    const dir = DIR_VISTA.frente.clone();
    if (p.modo === "cuerpo") {
      // Entra por el lado donde está la pieza (el oído, de lado; una vértebra,
      // por la espalda), para que no la tape lo de enfrente.
      const fuera = new THREE.Vector3(obj.x, 0, obj.z);
      const peso = THREE.MathUtils.clamp(fuera.length() / 0.06, 0, 1);
      dir.multiplyScalar(1 - 0.75 * peso);
      if (fuera.lengthSq() > 1e-8) dir.add(fuera.normalize().multiplyScalar(peso));
    }
    dir.y += 0.12;
    dir.normalize();
    return { obj, dir: dirCon(dir), dist: Math.max(distancia(mejor.radius * 1.8), mejor.radius < 0.01 ? 0.07 : 0.14) };
  };

  useEffect(() => {
    // Se calcula unos cuadros después: las piezas pueden estar recién llegando.
    vuelo.current = { pos: new THREE.Vector3(), obj: new THREE.Vector3(), espera: 3, intentos: 0 };
  }, [enfoque.n]);

  useFrame((_, dt) => {
    const ctl = controles.current;
    const v = vuelo.current;
    if (!ctl || !v) return;
    if (v.espera > 0) {
      v.espera--;
      if (v.espera === 0) {
        const r = calcular();
        if (!r) {
          // Lo que se quiere encuadrar puede estar todavía descargándose.
          if (v.intentos++ < 40) v.espera = 15;
          else vuelo.current = null;
          return;
        }
        v.obj.copy(r.obj);
        v.pos.copy(r.obj).addScaledVector(r.dir, r.dist);
      }
      return;
    }
    const k = 1 - Math.exp(-dt * 4.5);
    camera.position.lerp(v.pos, k);
    ctl.target.lerp(v.obj, k);
    if (camera.position.distanceTo(v.pos) < 0.002 && ctl.target.distanceTo(v.obj) < 0.002) vuelo.current = null;
  });

  return (
    <OrbitControls
      ref={controles}
      makeDefault
      target={CENTRO_CUERPO.toArray()}
      enableDamping
      dampingFactor={0.09}
      minDistance={0.05}
      maxDistance={9}
      zoomSpeed={0.8}
      autoRotate={p.aislar === "pieza" && !!p.seleccion}
      autoRotateSpeed={1.2}
      onStart={() => {
        vuelo.current = null;
      }}
    />
  );
}

/** Avisa afuera cuánto falta por bajar (el lienzo es perezoso: cada sistema llega cuando se pide). */
function Progreso({ onProgreso }: { onProgreso?: (activo: boolean, pct: number) => void }) {
  // Suscripción directa a la tienda (no un hook que re-renderiza): el cargador
  // avisa mientras otro componente se está pintando, y avisar afuera en ese
  // momento es un setState durante el render. Se difiere a la siguiente vuelta.
  const avisoRef = useRef(onProgreso);
  useEffect(() => {
    avisoRef.current = onProgreso;
  });
  useEffect(() => {
    let ultimo = "";
    let espera: number | undefined;
    const emitir = (s: { active: boolean; progress: number }) => {
      const pct = Math.round(s.progress / 5) * 5;
      const k = `${s.active}-${pct}`;
      if (k === ultimo) return;
      ultimo = k;
      window.clearTimeout(espera);
      espera = window.setTimeout(() => avisoRef.current?.(s.active, pct), 0);
    };
    emitir(useProgress.getState());
    const soltar = useProgress.subscribe(emitir);
    return () => {
      soltar();
      window.clearTimeout(espera);
    };
  }, []);
  return null;
}

function Mundo(p: AtlasEscenaProps) {
  const registro = useMemo<Registro>(() => new Map(), []);
  const mesaRef = useRef(new THREE.Box3());
  const hoverRef = useRef<string | null>(null);
  const pivotesRef = useRef<Pivotes>({ corazon: null, pulmonD: null, pulmonI: null, altoPulmon: 0.25 });
  const [cuerpo, setCuerpo] = useState<Cuerpo>(CUERPO_INICIAL);
  const { onListo } = p;
  const onCargado = useMemo(
    () => (archivo: string, mallas: THREE.Mesh[]) => {
      if (archivo === "esqueleto") {
        // El piso, a la altura de los pies, y la caja del cuerpo: medidos, no adivinados.
        const caja = new THREE.Box3();
        for (const m of mallas) {
          const d = datos(m);
          caja.expandByPoint(d.centro.clone().addScaledVector(d.tam, 0.5));
          caja.expandByPoint(d.centro.clone().addScaledVector(d.tam, -0.5));
        }
        if (!caja.isEmpty()) setCuerpo({ min: caja.min.clone(), max: caja.max.clone() });
        onListo();
      }
      if (archivo === "corazon") {
        const caja = new THREE.Box3();
        for (const m of mallas) {
          const d = datos(m);
          if (d.anim === "auricula" || d.anim === "ventriculo") {
            caja.expandByPoint(d.centro.clone().addScaledVector(d.tam, 0.5));
            caja.expandByPoint(d.centro.clone().addScaledVector(d.tam, -0.5));
          }
        }
        if (!caja.isEmpty()) pivotesRef.current.corazon = caja.getCenter(new THREE.Vector3());
      }
      if (archivo === "respiratorio") {
        for (const lado of ["pulmon-d", "pulmon-i"] as const) {
          const caja = new THREE.Box3();
          for (const m of mallas) {
            const d = datos(m);
            if (d.anim !== lado) continue;
            caja.expandByPoint(d.centro.clone().addScaledVector(d.tam, 0.5));
            caja.expandByPoint(d.centro.clone().addScaledVector(d.tam, -0.5));
          }
          if (caja.isEmpty()) continue;
          const c = caja.getCenter(new THREE.Vector3());
          // Se expande desde el vértice y el hilio: crece hacia abajo y hacia afuera.
          const pivote = new THREE.Vector3(c.x * 0.6, caja.max.y, c.z);
          if (lado === "pulmon-d") pivotesRef.current.pulmonD = pivote;
          else pivotesRef.current.pulmonI = pivote;
          pivotesRef.current.altoPulmon = caja.max.y - caja.min.y;
        }
      }
    },
    [onListo]
  );
  const pedidos = new Set<IdSistema>(p.cargar);
  for (const s of p.cargar) {
    const extra = ARRASTRA[s];
    if (extra) pedidos.add(extra);
  }
  const conPodio = p.modo === "cuerpo" && p.aislar !== "pieza";

  return (
    <>
      <fog attach="fog" args={["#07111d", 6, 16]} />
      <Camara p={p} registro={registro} mesaRef={mesaRef} cuerpo={cuerpo} />
      <Control p={p} registro={registro} hoverRef={hoverRef} mesaRef={mesaRef} pivotesRef={pivotesRef} cuerpo={cuerpo} />
      <ambientLight intensity={0.28} />
      <hemisphereLight args={["#dfeaff", "#1a1410", 0.35]} />
      <directionalLight position={[2.5, 4, 3]} intensity={2.1} color="#fff6ea" />
      <directionalLight position={[-3, 2, -2.5]} intensity={1.1} color="#9cc3ff" />
      {/* Contraluz: recorta la silueta contra el fondo oscuro. */}
      <pointLight position={[0, 2.2, -2.4]} intensity={6} color={p.acento} distance={7} />
      <Environment resolution={256} frames={1}>
        <Lightformer intensity={2} position={[0, 4, 3]} scale={[6, 2, 1]} form="rect" color="#ffffff" />
        <Lightformer intensity={0.8} position={[-4, 1, 0]} rotation-y={Math.PI / 2} scale={[4, 4, 1]} color="#bcd4ff" />
        <Lightformer intensity={0.6} position={[4, 1, -1]} rotation-y={-Math.PI / 2} scale={[4, 4, 1]} color="#ffe2c8" />
      </Environment>
      <Podio y={cuerpo.min.y} acento={p.acento} visible={conPodio} />
      {conPodio && (
        <ContactShadows
          key={`${p.cargar.join(",")}-${Math.round(p.separar * 10)}`}
          position={[0, cuerpo.min.y + 0.002, 0]}
          opacity={0.55}
          scale={1.6}
          blur={2.2}
          far={0.9}
          frames={8}
          resolution={512}
          color="#01060d"
        />
      )}
      {p.modo === "cuerpo" && <Lamina corte={p.corte} acento={p.acento} cuerpo={cuerpo} />}
      {ARCHIVOS.filter((a) => pedidos.has(a.sistema)).map((a) => (
        <Suspense key={a.archivo} fallback={null}>
          <Archivo archivo={a.archivo} sistema={a.sistema} registro={registro} hoverRef={hoverRef} onSeleccion={p.onSeleccion} onHover={p.onHover} onCargado={onCargado} />
        </Suspense>
      ))}
      <Progreso onProgreso={p.onProgreso} />
      <Trazo ruta={p.ruta} color={p.rutaColor} registro={registro} />
      <Etiqueta seleccion={p.seleccion} registro={registro} color={p.acento} />
    </>
  );
}

export default function AtlasCuerpoEscena(p: AtlasEscenaProps) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ fov: 32, near: 0.01, far: 60, position: [0, 1.05, 4.2] }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      onCreated={({ gl }) => {
        gl.localClippingEnabled = true;
      }}
      style={{ touchAction: "none" }}
      onPointerMissed={(e) => {
        if (e.type === "click") p.onSeleccion(null);
      }}
    >
      <Mundo {...p} />
    </Canvas>
  );
}
