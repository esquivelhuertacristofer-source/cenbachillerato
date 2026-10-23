"use client";
/* eslint-disable -- Código portado tal cual de NEM; las reglas de React Compiler de CEN no aplican a escenas three.js. */
// =============================================================================
// Lienzo 3D del ATLAS DEL CUERPO HUMANO.
// Las formas son las del atlas Z-Anatomy (CC BY-SA 4.0), hechas a partir de
// cuerpos reales: cada hueso, músculo, vaso, nervio y órgano es su propia
// pieza, con su nombre. Vienen aligeradas (menos polígonos + Draco) y cada
// archivo se baja solo cuando su sistema se enciende por primera vez.
//
// Lo que hace la escena:
//   • colorea cada pieza con el color de su tejido (no el gris del archivo) y
//     le suaviza las normales para que no se vean facetas;
//   • tres maneras de ver: el cuerpo armado, el cuerpo SEPARADO (cada pieza se
//     aleja de su lugar lo que diga el deslizador) y TODAS LAS PIEZAS en filas,
//     de la más grande a la más chica, como en una mesa de disección;
//   • al tocar una pieza se resalta (también lo que queda tapado) y la cámara
//     se acerca; las clases pueden resaltar varias a la vez;
//   • el esqueleto puede ir sólido, en «rayos X» u oculto.
// =============================================================================

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { DRACOLoader, type OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { mergeGeometries, mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { NOMBRES, type IdSistema } from "./atlas-cuerpo-nombres";

export const RUTA_ANATOMIA = "/media/atlas-cuerpo";
const DRACO = "/draco/";

// ── Decodificador Draco local (CSP de CEN: sin workers blob: ni WASM en producción) ──
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
/** Worker estático del propio dominio (/draco/draco-worker.js) en vez de blob:. */
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

/** Archivos y el sistema al que pertenecen (una pieza puede reclasificarse por su nombre). */
export const ARCHIVOS: { archivo: string; sistema: IdSistema }[] = [
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
/** El esqueleto trae dientes y cartílagos de nariz y laringe: se bajan con él. */
/** Piezas que vienen en dos archivos: se quedan solo en el de su sistema. */
const OMITIR: Record<string, RegExp> = { esqueleto: /^(Thyroid cartilage|Cricoid cartilage|Malleus|Incus|Stapes)(\.[lr])?$/ };
const ARRASTRA: Partial<Record<IdSistema, string>> = { digestivo: "esqueleto", respiratorio: "esqueleto" };

export type ModoHueso = "solido" | "rayos" | "oculto";
export type Vista = "frente" | "lado" | "espalda" | "arriba";
export type ModoVista = "cuerpo" | "piezas";
/** «pieza»: solo la elegida · «sistema»: solo su sistema · «resaltadas»: solo las que marca la clase. */
export type Aislar = false | "pieza" | "sistema" | "resaltadas";

export interface Pieza {
  id: string; // «sistema:Nombre.l», único
  clave: string; // nombre inglés sin lado (llave de NOMBRES)
  lado: "izquierdo" | "derecho" | null;
  sistema: IdSistema;
}

export interface AtlasCuerpoSceneProps {
  visibles: Record<IdSistema, boolean>;
  /** Sistemas cuyos archivos ya se pidieron (no se vuelven a soltar). */
  cargar: IdSistema[];
  hueso: ModoHueso;
  seleccion: string | null;
  resaltadas: string[];
  aislar: Aislar;
  separar: number;
  modo: ModoVista;
  /** Cada cambio de `n` mueve la cámara: a una pieza, a un sistema, a lo resaltado o a una vista. */
  enfoque: { a: string; n: number };
  onSeleccion: (p: Pieza | null) => void;
  onHover: (p: Pieza | null) => void;
  onListo: () => void;
  onConteo: (n: number) => void;
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
  Nasopharynx: { c: "#c97a70", r: 0.4, capa: 0.6 },
  Oropharynx: { c: "#c97a70", r: 0.4, capa: 0.6 },
  Laryngopharynx: { c: "#c97a70", r: 0.4, capa: 0.6 },
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

// «Rayos X»: solo el contorno brilla (fresnel), sumado al fondo.
const VERT_RX = /* glsl */ `
varying vec3 vN; varying vec3 vV;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;
const FRAG_RX = /* glsl */ `
uniform vec3 uColor; uniform float uFuerza;
varying vec3 vN; varying vec3 vV;
void main() {
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
});

/** Copia que solo se pinta donde la pieza queda tapada: se ve «a través». */
const MAT_TRASLUCIDO = new THREE.MeshBasicMaterial({
  color: "#ffb347",
  transparent: true,
  opacity: 0.5,
  depthWrite: false,
  depthFunc: THREE.GreaterDepth,
  side: THREE.FrontSide,
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
/** La selección puede nombrar una pieza con lado («Femur.l») o sin él («Femur»: las dos). */
export function esDeLaSeleccion(id: string, seleccion: string | null) {
  return seleccion !== null && (id === seleccion || id.replace(LADO, "") === seleccion);
}

interface DatosMalla {
  pieza: Pieza;
  normal: THREE.MeshStandardMaterial;
  traslucido?: THREE.Mesh;
  /** Posición de reposo (el cuerpo armado), centro y tamaño de su caja en reposo. */
  reposo: THREE.Vector3;
  centro: THREE.Vector3;
  tam: THREE.Vector3;
  radio: number;
  destino: THREE.Vector3;
}
type Registro = Map<string, THREE.Mesh>;
const datos = (m: THREE.Mesh) => m.userData.atlas as DatosMalla;

// ── Un archivo ──────────────────────────────────────────────────────────────
function Archivo({
  archivo,
  sistema,
  registro,
  hover,
  onSeleccion,
  onHover,
  onCargado,
}: {
  archivo: string;
  sistema: IdSistema;
  registro: Registro;
  hover: React.RefObject<string | null>;
  onSeleccion: (p: Pieza) => void;
  onHover: (p: Pieza | null) => void;
  onCargado: (archivo: string) => void;
}) {
  const gltf = useGLTF(`${RUTA_ANATOMIA}/${archivo}.glb`, false, false, (loader) => {
    loader.setDRACOLoader(dracoLocal());
  });
  const mallas = useMemo(() => {
    const raiz = gltf.scene;
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
      const opciones = { color: tono.c, roughness: tono.r, metalness: 0, side: THREE.DoubleSide };
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
        reposo: malla.position.clone(),
        centro: caja.getCenter(new THREE.Vector3()),
        tam,
        radio: tam.length() / 2,
        destino: malla.position.clone(),
      } satisfies DatosMalla;
    }
    return lista;
  }, [gltf, sistema, archivo]);

  useEffect(() => {
    for (const m of mallas) registro.set(datos(m).pieza.id, m);
    onCargado(archivo);
    return () => {
      for (const m of mallas) registro.delete(datos(m).pieza.id);
    };
  }, [mallas, registro, archivo, onCargado]);

  return (
    <primitive
      object={gltf.scene}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        const d = e.object.userData.atlas as DatosMalla | undefined;
        if (!d) return;
        hover.current = d.pieza.id;
        onHover(d.pieza);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e: ThreeEvent<PointerEvent>) => {
        const d = e.object.userData.atlas as DatosMalla | undefined;
        if (d && hover.current === d.pieza.id) {
          hover.current = null;
          onHover(null);
        }
        document.body.style.cursor = "";
      }}
      onClick={(e: ThreeEvent<MouseEvent>) => {
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
const ESTIRA = new THREE.Vector3(1.6, 0.75, 1.6);

function claveDe(id: string) {
  return id.slice(id.indexOf(":") + 1).replace(LADO, "");
}

function Control({ p, registro, hover, mesa }: { p: AtlasCuerpoSceneProps; registro: Registro; hover: React.RefObject<string | null>; mesa: React.RefObject<THREE.Box3> }) {
  const llaveMesa = useRef("");
  const conteo = useRef(-1);
  const resaltadas = useMemo(() => new Set(p.resaltadas), [p.resaltadas]);
  const { onConteo } = p;

  useFrame(({ clock }, dt) => {
    const sistemaSel = p.seleccion ? p.seleccion.slice(0, p.seleccion.indexOf(":")) : null;
    const visibles: THREE.Mesh[] = [];
    for (const m of registro.values()) {
      const d = datos(m);
      const esHueso = d.pieza.sistema === "esqueleto";
      const sel = esDeLaSeleccion(d.pieza.id, p.seleccion);
      const resaltada = resaltadas.has(d.pieza.clave);
      // Si solo se ven las resaltadas, ya no hace falta marcarlas: van con su color.
      const marcada = sel || (resaltada && p.aislar !== "resaltadas");
      let ver = p.visibles[d.pieza.sistema] && !(esHueso && p.hueso === "oculto" && !marcada);
      if (p.aislar === "pieza" && p.seleccion) ver = sel;
      else if (p.aislar === "sistema" && sistemaSel) ver = d.pieza.sistema === sistemaSel;
      else if (p.aislar === "resaltadas" && resaltadas.size) ver = resaltada || sel;
      m.visible = ver;
      if (ver) visibles.push(m);

      // En la mesa de piezas todo va sólido; en el cuerpo, el hueso puede ir en rayos X.
      const fantasma = esHueso && p.hueso === "rayos" && !marcada && p.modo === "cuerpo";
      m.raycast = fantasma || !ver ? sinToque : THREE.Mesh.prototype.raycast;
      if (fantasma) {
        if (m.material !== MAT_RAYOS) m.material = MAT_RAYOS;
      } else if (m.material !== d.normal) m.material = d.normal;
      if (marcada && !d.traslucido) {
        d.traslucido = new THREE.Mesh(m.geometry, MAT_TRASLUCIDO);
        d.traslucido.renderOrder = 10;
        d.traslucido.raycast = sinToque;
        m.add(d.traslucido);
      }
      if (d.traslucido) d.traslucido.visible = marcada && !fantasma;
      const e = d.normal.emissive;
      // La pieza elegida conserva su color y late suave en tono cálido.
      if (marcada) e.set("#ffb347").multiplyScalar(0.16 + 0.12 * Math.sin(clock.elapsedTime * 3.2));
      else if (hover.current === d.pieza.id) e.set("#ffffff").multiplyScalar(0.18);
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
        acomodar(visibles, mesa.current);
      }
    } else llaveMesa.current = "";

    const k = 1 - Math.exp(-dt * 5);
    for (const m of registro.values()) {
      const d = datos(m);
      if (!m.visible) {
        m.position.copy(d.destino);
        continue;
      }
      if (m.position.distanceToSquared(d.destino) > 1e-10) m.position.lerp(d.destino, k);
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

// ── Cámara ──────────────────────────────────────────────────────────────────
const DIR_VISTA: Record<Vista, THREE.Vector3> = {
  frente: new THREE.Vector3(0, 0.08, 1).normalize(),
  lado: new THREE.Vector3(1, 0.08, 0).normalize(),
  espalda: new THREE.Vector3(0, 0.08, -1).normalize(),
  arriba: new THREE.Vector3(0, 1, 0.02).normalize(),
};

function Camara({ p, registro, mesa }: { p: AtlasCuerpoSceneProps; registro: Registro; mesa: React.RefObject<THREE.Box3> }) {
  const { camera, size } = useThree();
  const controles = useRef<OrbitControlsImpl>(null);
  const vuelo = useRef<{ pos: THREE.Vector3; obj: THREE.Vector3; espera: number } | null>(null);
  const { enfoque } = p;

  // Distancia para que una esfera de radio r quepa en la pantalla.
  const distancia = (r: number) => {
    const fov = THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov);
    const aspecto = Math.min(1, size.width / size.height);
    return (r / Math.sin(fov / 2)) / Math.max(0.55, aspecto) * 1.05;
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
    const { a } = enfoque;
    const dirActual = camera.position.clone().sub(ctl.target).normalize();
    if (a in DIR_VISTA) return { obj: ctl.target.clone(), dir: DIR_VISTA[a as Vista], dist: camera.position.distanceTo(ctl.target) };
    if (a === "todo") return { obj: CENTRO_CUERPO.clone(), dir: DIR_VISTA.frente, dist: distancia(1.0 + p.separar * 0.6) };
    if (a === "piezas") {
      const esf = mesa.current.isEmpty() ? null : mesa.current.getBoundingSphere(new THREE.Sphere());
      return esf ? { obj: esf.center, dir: DIR_VISTA.frente, dist: distancia(esf.radius * 1.02) } : null;
    }
    if (a.startsWith("sistema:")) {
      const s = a.slice(8);
      const esf = esferaDe((m) => datos(m).pieza.sistema === s && m.visible);
      return esf ? { obj: esf.center, dir: DIR_VISTA.frente.clone().lerp(dirActual, 0.35).normalize(), dist: distancia(esf.radius) } : null;
    }
    if (a === "resaltadas") {
      const set = new Set(p.resaltadas);
      const esf = esferaDe((m) => set.has(datos(m).pieza.clave));
      return esf ? { obj: esf.center, dir: DIR_VISTA.frente.clone().lerp(dirActual, 0.3).normalize(), dist: Math.max(distancia(esf.radius * 1.15), 0.2) } : null;
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
    return { obj, dir, dist: Math.max(distancia(mejor.radius * 1.8), mejor.radius < 0.01 ? 0.07 : 0.14) };
  };

  useEffect(() => {
    // Se calcula unos cuadros después: las piezas pueden estar recién llegando.
    vuelo.current = { pos: new THREE.Vector3(), obj: new THREE.Vector3(), espera: 2 };
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
          vuelo.current = null;
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

function Mundo(p: AtlasCuerpoSceneProps) {
  const registro = useMemo<Registro>(() => new Map(), []);
  const mesa = useRef(new THREE.Box3());
  const hover = useRef<string | null>(null);
  const { onListo } = p;
  const onCargado = useMemo(
    () => (archivo: string) => {
      if (archivo === "esqueleto") onListo();
    },
    [onListo]
  );
  const pedidos = new Set<IdSistema>(p.cargar);
  for (const s of p.cargar) {
    const extra = ARRASTRA[s];
    if (extra) pedidos.add(extra as IdSistema);
  }

  return (
    <>
      <Camara p={p} registro={registro} mesa={mesa} />
      <Control p={p} registro={registro} hover={hover} mesa={mesa} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[2.5, 4, 3]} intensity={2.1} color="#fff6ea" />
      <directionalLight position={[-3, 2, -2.5]} intensity={1.1} color="#9cc3ff" />
      <Environment resolution={256} frames={1}>
        <Lightformer intensity={2} position={[0, 4, 3]} scale={[6, 2, 1]} form="rect" color="#ffffff" />
        <Lightformer intensity={0.8} position={[-4, 1, 0]} rotation-y={Math.PI / 2} scale={[4, 4, 1]} color="#bcd4ff" />
        <Lightformer intensity={0.6} position={[4, 1, -1]} rotation-y={-Math.PI / 2} scale={[4, 4, 1]} color="#ffe2c8" />
      </Environment>
      {ARCHIVOS.filter((a) => pedidos.has(a.sistema)).map((a) => (
        <Suspense key={a.archivo} fallback={null}>
          <Archivo archivo={a.archivo} sistema={a.sistema} registro={registro} hover={hover} onSeleccion={p.onSeleccion} onHover={p.onHover} onCargado={onCargado} />
        </Suspense>
      ))}
    </>
  );
}

export function AtlasCuerpoScene(p: AtlasCuerpoSceneProps) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ fov: 32, near: 0.01, far: 60, position: [0, 1.05, 4.2] }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      style={{ touchAction: "none" }}
      onPointerMissed={(e) => {
        if (e.type === "click") p.onSeleccion(null);
      }}
    >
      <Mundo {...p} />
    </Canvas>
  );
}

export function nombreDe(p: Pieza) {
  return NOMBRES[p.clave] ?? { es: p.clave, s: p.sistema };
}
